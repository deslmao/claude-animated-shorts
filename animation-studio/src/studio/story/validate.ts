// Storyboard validator (stage 1E, narration in stage 2): catches mistakes before any render time or voice credits are
// spent, and checks vertical framing. It checks the narration-timed storyboard (story/timing.ts).
// errors = the film would be wrong (unknown names, collisions, a subject's head out of frame); warnings = worth a look.
import * as THREE from "three";
import { SETS } from "../sets";
import { LAYOUTS } from "../sets/layouts";
import { LIGHTS } from "../look/lights";
import { ROSTER } from "../characters/roster";
import { ACT_NAMES, FACES, GESTURES } from "../characters/figure";
import { FX_KINDS } from "../fx/effects";
import { runKeys } from "../camera/keys";
import { compile, shotFrames, actorPos, FPS, stepAt, swoopFrames } from "./compile";
import type { Storyboard, Where } from "./types";
import type { Narration } from "../voice/narration";
import { resolve } from "./timing";
import { MOODS, AMBIENCES, SFX } from "../sound/catalog";
import { PROPS } from "../props/registry";
import { ITEMS } from "../characters/items";
import { clearAt, hasFloorMap } from "../sets/floor";
import { whereOf, diagramBase } from "./compile";
import { aboveBase } from "./timing";
import { DIAGRAM_KINDS } from "../fx/diagrams";
import type { Stage, CamInfo } from "../cards/cards";

export type Report = { errors: string[]; warnings: string[]; framing: string[] };

/** is a character's head (top 0.5 m of a 1.86 m figure, +-0.26 m wide) fully inside a 9:16 frame? */
const headIn = (cam: THREE.PerspectiveCamera, m: [number, number, number]) => {
  const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
  for (const sx of [-1, 1]) for (const y of [1.36, 1.86]) {
    const v = new THREE.Vector3(m[0], m[1] + y, m[2]).addScaledVector(right, sx * 0.26).project(cam);
    if (v.z > 1 || Math.abs(v.x) > 1 || Math.abs(v.y) > 1) return false;
  }
  return true;
};

export const validate = (sb0: Storyboard, narr?: Narration): Report => {
  const errors: string[] = [], warnings: string[] = [], framing: string[] = [];
  // narration timing first: shot lengths and word anchors become numbers (lines not generated yet are estimated)
  const tm = resolve(sb0, narr), sb = tm.sb;
  errors.push(...tm.problems);
  if (tm.missing.length) warnings.push(`${tm.missing.length} of ${tm.lines.length} lines have no narration audio yet, so their timing is estimated (run: npm run voice -- ${sb.id})`);
  for (const l of tm.lines) if (l.who !== "narrator" && !(l.who in sb.cast)) errors.push(`shot ${l.shot + 1}: speaker "${l.who}" is not in the cast`);
  const words = tm.lines.reduce((n, l) => n + l.words.length, 0), spoken = tm.lines.reduce((n, l) => n + (l.end - l.start), 0);
  if (words && spoken > 0 && (words / spoken < 2.6 || words / spoken > 4.6)) warnings.push(`narration pace ${(words / spoken).toFixed(2)} words/s (reference 3.5-4.1)`);
  const mood = typeof sb.music === "string" ? sb.music : sb.music ? sb.music.mood : null;
  if (mood && !(mood in MOODS)) errors.push(`unknown music mood "${mood}" (moods: ${Object.keys(MOODS).join(", ")})`);
  const total = sb.shots.reduce((s, x) => s + (x.dur ?? 0), 0);
  if (!sb.shots.length) errors.push("no shots");
  if (total < 10 || total > 75) warnings.push(`total length ${total.toFixed(1)} s (Shorts target 55-65 s)`);
  for (const [k, ref] of Object.entries(sb.cast)) if (typeof ref === "string" && !(ref in ROSTER)) errors.push(`cast "${k}": unknown character "${ref}" (characters: ${Object.keys(ROSTER).join(", ")}; or { extra: n }; search: npm run assets -- search <words>)`);
  sb.shots.forEach((s, i) => {
    const at = `shot ${i + 1} (${s.set})`;
    if (!SETS[s.set]) { errors.push(`${at}: unknown set "${s.set}" (sets: ${Object.keys(SETS).join(", ")})`); return; }
    const dur = s.dur ?? 0;
    if (dur < 0.6) errors.push(`${at}: too short (${dur.toFixed(2)} s)`);
    if (s.light && !(s.light in LIGHTS)) errors.push(`${at}: unknown light "${s.light}"`);
    const indoor = SETS[s.set].lights.includes("interior");
    if (s.light && indoor !== (s.light === "interior" || s.light === "interiorCool")) warnings.push(`${at}: light "${s.light}" on a${indoor ? "n indoor" : "n outdoor"} set`);
    if (i === 0 && s.transition && s.transition !== "cut") warnings.push(`${at}: first shot transition "${s.transition}" ignored`);
    const mark = (w: Where, who: string) => { if (typeof w === "string" && !LAYOUTS[s.set].spots[w]) errors.push(`${at}: ${who} stands on unknown mark "${w}" (marks: ${Object.keys(LAYOUTS[s.set].spots).join(", ")})`); };
    const seen = new Set<string>(), used = new Map<string, string>();
    for (const a of s.actors) {
      if (!(a.who in sb.cast)) errors.push(`${at}: actor "${a.who}" is not in the cast`);
      if (seen.has(a.who)) errors.push(`${at}: "${a.who}" appears twice`); seen.add(a.who);
      mark(a.at, a.who); if (a.walk) mark(a.walk.to, a.who);
      if (typeof a.at === "string" && !a.walk) { if (used.has(a.at)) errors.push(`${at}: "${a.who}" and "${used.get(a.at)}" share mark "${a.at}"`); used.set(a.at, a.who); }
      for (const x of [a.act, ...(a.beats ?? []).map((b) => b.act)]) if (x && !ACT_NAMES.includes(x)) errors.push(`${at}: ${a.who}: unknown act "${x}"`);
      for (const x of [a.face, ...(a.beats ?? []).map((b) => b.face)]) if (x && !(x in FACES)) errors.push(`${at}: ${a.who}: unknown face "${x}"`);
      for (const x of [a.gesture, ...(a.beats ?? []).map((b) => b.gesture)]) if (x && !GESTURES.includes(x) && x !== "pump") errors.push(`${at}: ${a.who}: unknown gesture "${x}"`);
      for (const x of [a.hold, ...(a.beats ?? []).map((b) => b.hold)]) if (x && !ITEMS[x]) errors.push(`${at}: ${a.who} holds unknown item "${x}" (items: ${Object.keys(ITEMS).join(", ")})`);
      for (const b of a.beats ?? []) if ((b.t ?? 0) < 0 || (b.t ?? 0) > dur) warnings.push(`${at}: ${a.who}: beat at ${b.t} s is outside the shot (0-${dur.toFixed(2)} s)`);
      for (const [x, y] of a.talk ?? []) if (x < 0 || y > dur + 0.01 || y <= x) warnings.push(`${at}: ${a.who}: talk span ${x}-${y} s outside the shot`);
      if (a.walk && (a.walk.t1 > dur + 0.01 || a.walk.t1 <= a.walk.t0)) warnings.push(`${at}: ${a.who}: walk ${a.walk.t0}-${a.walk.t1} s outside the shot`);
      if (a.reach && !s.actors.some((x) => x.who === a.reach) && !(s.props ?? []).some((q) => q.id === a.reach)) errors.push(`${at}: ${a.who} reaches for "${a.reach}", which is neither an actor nor a prop in the shot`);
      for (const m of a.moves ?? []) {
        if (!["squirm", "stagger", "hop", "recoil"].includes(m.kind)) errors.push(`${at}: ${a.who}: unknown move "${m.kind}" (squirm, stagger, hop, recoil)`);
        if (m.away && !s.actors.some((x) => x.who === m.away)) errors.push(`${at}: ${a.who}'s ${m.kind} is away from "${m.away}" who is not in the shot`);
      }
    }
    if (s.diagram) {
      if (!DIAGRAM_KINDS.includes(s.diagram.kind)) errors.push(`${at}: unknown diagram "${s.diagram.kind}" (diagrams: ${DIAGRAM_KINDS.join(", ")})`);
      if (!s.actors.some((x) => x.who === s.diagram!.with)) errors.push(`${at}: the diagram is presented by "${s.diagram.with}" who is not in the shot`);
      const ceil = LAYOUTS[s.set].ceiling, top = (s.diagram.place === "above" ? (s.diagram.base ?? aboveBase(sb, s) ?? diagramBase(s)) + (s.diagram.size ?? 0.95) : 1.42 + (s.diagram.size ?? 0.95) / 2);
      if (ceil !== undefined && top > ceil - 0.04) errors.push(`${at}: the diagram reaches ${top.toFixed(2)} m, through the ${ceil} m ceiling: make it smaller (size)`);
    }
    if (s.mood && !(s.mood in MOODS)) errors.push(`${at}: unknown music mood "${s.mood}" (moods: ${Object.keys(MOODS).join(", ")})`);
    if (s.ambience && !(s.ambience in AMBIENCES)) errors.push(`${at}: unknown ambience "${s.ambience}" (beds: ${Object.keys(AMBIENCES).join(", ")})`);
    for (const q of s.props ?? []) {
      const e = PROPS[q.id];
      if (!e) { errors.push(`${at}: unknown prop "${q.id}" (search the library: npm run assets -- search <words>)`); continue; }
      if (q.variant && e.param && !e.param.ok(q.variant)) errors.push(`${at}: prop "${q.id}": "${q.variant}" is not a valid ${e.param.desc}`);
      if (q.variant && !e.param && !e.variants?.[q.variant]) errors.push(`${at}: prop "${q.id}" has no variant "${q.variant}" (variants: ${Object.keys(e.variants ?? {}).join(", ") || "none"})`);
      if ((q.follow || q.drive || q.track) && !e.rig) errors.push(`${at}: prop "${q.id}" can't move (no rig), so it can't follow, be driven or travel with someone`);
      if (q.track && !s.actors.some((x) => x.who === q.track!.who)) errors.push(`${at}: prop "${q.id}" travels with "${q.track.who}" who is not in the shot`);
      if (q.steps && !e.steps) errors.push(`${at}: prop "${q.id}" has no steps (stepped props: ${Object.keys(PROPS).filter((k) => PROPS[k].steps).join(", ")})`);
      else if (q.steps && e.steps) {
        const n = e.stepCount ? e.stepCount(q.variant) : e.steps.length;
        if (q.steps.length > n) warnings.push(`${at}: prop "${q.id}" has ${q.steps.length} steps but only ${n} do anything`);
        const ts = q.steps.map((c) => c.t ?? 0); if (ts.some((t, i) => i && t < ts[i - 1])) errors.push(`${at}: prop "${q.id}"'s steps are out of order`);
      }
      for (const w of [q.follow?.who, q.drive?.who]) if (w && !s.actors.some((x) => x.who === w)) errors.push(`${at}: prop "${q.id}" follows / is driven by "${w}" who is not in the shot`);
      if (q.track) continue; // travels with its actor: no fixed footprint to check
      if (typeof q.at === "string" && !LAYOUTS[s.set].spots[q.at]) continue; // reported with the marks
      const w = whereOf(s.set, q.at), x = w[0] + (q.offset?.[0] ?? 0), z = w[2] + (q.offset?.[1] ?? 0), r = e.radius * (q.scale ?? 1);
      for (const a of s.actors) for (const p of [a.at, ...(a.walk ? [a.walk.to] : [])]) {
        if (typeof p === "string" && !LAYOUTS[s.set].spots[p]) continue;
        const m = whereOf(s.set, p);
        // a prop standing on another (a parchment or loot on a table: its `at` 0.3 m+ above the actor's floor) has no
        // footprint on that floor
        if (w[1] - m[1] > 0.3) continue;
        // distance from the actor's mark to the prop's footprint (its box, turned by its yaw, or its circle)
        const yaw = ((q.yaw ?? 0) * Math.PI) / 180, lx = (m[0] - x) * Math.cos(yaw) - (m[2] - z) * Math.sin(yaw), lz = (m[0] - x) * Math.sin(yaw) + (m[2] - z) * Math.cos(yaw);
        const gap = e.box ? Math.hypot(Math.max(0, Math.abs(lx) - e.box[0] * (q.scale ?? 1)), Math.max(0, Math.abs(lz) - e.box[1] * (q.scale ?? 1))) : Math.hypot(lx, lz) - r;
        if (gap < 0.3) errors.push(`${at}: prop "${q.id}" stands on ${a.who} (move it or use offset)`);
      }
      if (w[1] < 0.3 && hasFloorMap(s.set) && !clearAt(s.set, x, z, Math.min(r, 0.6) * 0.8)) warnings.push(`${at}: prop "${q.id}" overlaps something already in the set at [${x.toFixed(1)}, ${z.toFixed(1)}]`);
    }
    for (const x of s.sfx ?? []) {
      if (!(x.name in SFX)) errors.push(`${at}: unknown sound effect "${x.name}" (see src/studio/sound/catalog.ts)`);
      if (x.on && !seen.has(x.on)) errors.push(`${at}: sound "${x.name}" is placed on "${x.on}" who is not in the shot`);
    }
    for (const fx of s.fx ?? []) {
      if (!FX_KINDS.includes(fx.kind)) errors.push(`${at}: unknown effect "${fx.kind}"`);
      if (!seen.has(fx.on)) errors.push(`${at}: effect on "${fx.on}" who is not in the shot`);
      if ((fx.t ?? 0) < 0 || (fx.t ?? 0) > dur) warnings.push(`${at}: effect at ${fx.t} s is outside the shot`);
    }
    for (const cam of [s.camera, ...(s.cams ?? [])]) {
      const names = cam.move === "pov" ? [cam.from, cam.at] : "on" in cam ? (Array.isArray(cam.on) ? cam.on : [cam.on]) : cam.move === "overShoulder" ? [cam.over, cam.at] : [];
      for (const n0 of names) { const n = cam.move === "insert" || cam.move === "pov" ? n0.split(".")[0] : n0;
        if (!seen.has(n) && !(n === "diagram" && s.diagram) && !(s.props ?? []).some((q) => q.id === n0)) errors.push(`${at}: camera aims at "${n0}" ${n === "diagram" ? "but the shot has no diagram" : "who is not in the shot"}`); }
    }
    for (const c of s.cams ?? []) if ((c.t ?? 0) < 0 || (c.t ?? 0) > dur) warnings.push(`${at}: a camera beat at ${c.t} s is outside the shot`);
    // an insert / POV names an actor's part: face, held (what they hold) or hands (where their reach lands)
    for (const cam of [s.camera, ...(s.cams ?? [])]) {
      const parts = cam.move === "insert" ? [cam.on] : cam.move === "pov" ? [cam.from, cam.at] : [];
      for (const n of parts) { const p = n.split(".")[1]; if (p !== undefined && !["face", "held", "hands"].includes(p)) errors.push(`${at}: camera detail "${n}": an actor's part is face, held or hands`); }
    }
    for (const c of s.cams ?? []) if (c.fly && c.move === "insert") warnings.push(`${at}: a fly beat into an insert flies through the set to a detail: check the path is clear`);
    if ((s.camera.move === "view" || s.camera.move === "establish") && !LAYOUTS[s.set].views.some((v) => v.name === (s.camera as { view: string }).view)) errors.push(`${at}: set has no view "${(s.camera as { view: string }).view}"`);
  });
  if (errors.length) return { errors, warnings, framing };
  // framing: solve the camera at the start, middle and end of each shot and check the subjects' heads are in frame
  // (a subject who walks in is checked from the moment they arrive)
  const film = compile(sb0, narr), ranges = shotFrames(sb);
  warnings.push(...film.notes);
  sb.shots.forEach((s, i) => {
    // camera subjects = the named ACTORS (a camera may also frame the diagram or a prop)
    const c = s.camera, subjOf = (cc: typeof c) => (cc.move === "overShoulder" ? [cc.at] : cc.move === "insert" || cc.move === "pov" ? [] : "on" in cc ? (Array.isArray(cc.on) ? cc.on : [cc.on]) : []).filter((w) => s.actors.some((x) => x.who === w));
    const subj = [...new Set([c, ...(s.cams ?? [])].flatMap(subjOf))];
    const { a, b } = ranges[i], fails: string[] = [];
    // each camera beat is checked over its own frames, with its own subjects (an insert or POV frames a detail, not heads)
    const segs = [{ cam: c, f0: a }, ...(s.cams ?? []).filter((x) => !x.rack).map((x) => ({ cam: x as typeof c, f0: a + Math.round((x.t ?? 0) * FPS) }))].sort((p, q) => p.f0 - q.f0);
    // a glide or whip is checked from the moment it arrives (on its way it is between two framings); a fly beat's
    // framing is where the flight arrives, so it is checked on its own word and after
    const settle = (cam: typeof c) => { const x = cam as { glide?: number; whip?: boolean; swoop?: number | true }; return x.whip ? 6 : x.glide ? Math.round(x.glide * FPS) : x.swoop ? swoopFrames(x.swoop) : 0; };
    // a zoom-through or whip transition owns the frames it spends rushing in or out (by design off the subject): the
    // framing is judged on the frames either side of it
    const [lo, hi] = transitionClear(sb, i, a, b);
    segs.forEach((sg, j) => { const f1 = Math.min(j + 1 < segs.length ? segs[j + 1].f0 : b, hi), mine = subjOf(sg.cam), g0 = Math.max(lo, Math.min(f1 - 1, sg.f0 + settle(sg.cam)));
    // a framing a flight departs from (the next beat flies) holds only where the flight leaves it: its first frame
    const departs = j + 1 < segs.length && (segs[j + 1].cam as { fly?: boolean }).fly;
    for (const f of departs ? [g0] : [...new Set([g0, Math.round((g0 + f1) / 2), f1 - 1])]) {
      if (f < lo || f >= hi) continue;
      const subj = mine;
      const cm = runKeys(film.shots[i].keys, f), cam = new THREE.PerspectiveCamera(cm.fov, 9 / 16, 0.05, 3000);
      cam.position.set(...cm.pos); cam.up.set(0, 1, 0); cam.lookAt(...cm.look); cam.rotateZ(cm.roll); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      for (const who of subj) { const act = s.actors.find((x) => x.who === who)!; const tt = (f - a) / FPS; if (act.walk && tt < act.walk.t1) continue; /* walking in: checked once arrived */ if (!headIn(cam, actorPos(s.set, act, (f - a) / FPS))) fails.push(`${who} @${((f - a) / FPS).toFixed(1)}s`); }
    }
    });
    // over-the-shoulder: the near character's back must actually be in the frame (at shoulder height)
    if (c.move === "overShoulder") for (const f of [a, b - 1]) {
      const cm = runKeys(film.shots[i].keys, f), cam = new THREE.PerspectiveCamera(cm.fov, 9 / 16, 0.05, 3000);
      cam.position.set(...cm.pos); cam.up.set(0, 1, 0); cam.lookAt(...cm.look); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      const m = actorPos(s.set, s.actors.find((x) => x.who === c.over)!, (f - a) / FPS), right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
      const xs = [-0.24, 0.24].map((d) => new THREE.Vector3(m[0], m[1] + 1.3, m[2]).addScaledVector(right, d).project(cam).x);
      const shown = Math.max(0, Math.min(1, Math.max(...xs)) - Math.max(-1, Math.min(...xs))) / 2;
      if (shown < 0.15) fails.push(`${c.over}'s shoulder ${(shown * 100).toFixed(0)}% of frame @${((f - a) / FPS).toFixed(1)}s`);
    }
    // staging checks on what the director actually draws (every ~0.2 s): limbs, effects, faces, props, diagrams
    // the subjects on screen at frame f: those of the camera beat in force (an insert or POV has none: no faces to keep
    // clear, and a figure filling an insert is its point)
    // (while a glide or whip is still travelling to its framing, nothing is judged: the camera is between subjects)
    const subjAt = (f: number) => { let sg0 = segs[0]; for (const sg of segs) if (f >= sg.f0) sg0 = sg; const cam = sg0.cam, moving = f < sg0.f0 + settle(cam);
      return { who: moving ? [] : subjOf(cam), detail: moving || cam.move === "insert" || cam.move === "pov" }; };
    fails.push(...staging(film, sb, i, a, b, subjAt, c.move === "overShoulder" ? c.over : undefined, errors, warnings));
    const line = `shot ${String(i + 1).padStart(2)} ${s.set.padEnd(9)} ${c.move.padEnd(12)} subjects: ${subj.join(", ") || "(place shot)"}`;
    const heads = fails.filter((x) => !x.startsWith("!"));
    if (heads.length) errors.push(`shot ${i + 1}: subject head out of frame: ${heads.join(", ")}`);
    if (fails.length) framing.push(`${line}  -> FAIL (${fails.map((x) => x.replace(/^!/, "")).join("; ")})`);
    else framing.push(`${line}  -> ok`);
  });
  return { errors, warnings, framing };
};

/** the frames of shot i outside a zoom-through / whip transition's rush (in: the first 9 frames, out: the last 10) */
const transitionClear = (sb: Storyboard, i: number, a: number, b: number): [number, number] => {
  const rush = (t?: string) => t === "zoom" || t === "whip";
  return [a + (i > 0 && rush(sb.shots[i].transition) ? 9 : 0), b - (rush(sb.shots[i + 1]?.transition) ? 10 : 0)];
};
/** staging checks for one shot, run on the director's real output (the poses, effects and props that will be drawn):
 *  - a hand out of the top or side of the frame while its owner is in shot (a cropped arm); hands below the bottom
 *    edge are normal in medium shots
 *  - a reaction effect off screen
 *  - a camera subject's face hidden behind a nearer character; a non-subject foreground figure filling > 25 % of the frame
 *  - a story prop that is never in frame during the shot; a diagram cut by the frame edge
 *  - an animated prop that can't reach the hand it follows; a reaching gesture whose hand stops short of its target
 *  Problems become errors (warnings for the foreground size); returned entries start with "!" for the framing table */
/** gestures whose hand IS the action (a crop at the side of the frame hides what the character is doing) */
export const SNAP = 0.22;
const ACTION_GESTURES = ["tickle", "tickleSelf", "operate", "point", "pointUp", "wave", "raiseHand", "cheer", "thumbsUp", "stop", "hold", "facepalm", "scratchHead", "coverMouth", "offer", "write", "grab", "block"];
/** gestures that reach a `reach` target: the hand must actually get there */
const REACHING = ["tickle", "offer", "write", "grab", "block"];
const staging = (film: ReturnType<typeof compile>, sb: Storyboard, i: number, a: number, b: number, subjAt: (f: number) => { who: string[]; detail: boolean }, over: string | undefined, errors: string[], warnings: string[]) => {
  const s = sb.shots[i], shot = film.shots[i], at = `shot ${i + 1} (${s.set})`, out: string[] = [];
  const once = new Set<string>(), report = (key: string, msg: string, warn = false) => { if (once.has(key)) return; once.add(key); (warn ? warnings : errors).push(`${at}: ${msg}`); if (!warn) out.push(`!${msg}`); };
  const seenProp = new Set<number>(), cast = new Set(s.actors.filter((x) => !x.crowd).map((x) => x.who));
  const short = new Map<string, number>(); // consecutive samples a reaching hand is short of its target
  const hover = new Map<string, number>(); // consecutive samples a writing hand is above its page
  const [lo, hi] = transitionClear(sb, i, a, b);
  for (let f = lo; f < hi; f += 6) {
    const cm = runKeys(shot.keys, f), cam = new THREE.PerspectiveCamera(cm.fov, 9 / 16, 0.05, 3000);
    cam.position.set(...cm.pos); cam.up.set(0, 1, 0); cam.lookAt(...cm.look); cam.rotateZ(cm.roll); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const pv = new THREE.Vector3();
    const info: CamInfo = { pos: cam.position, right: new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), sun: new THREE.Vector3(0.3, 0.8, 0.5).normalize(), project: (p) => { pv.set(...p).project(cam); return [pv.x, pv.y]; } };
    const st: Stage = { places: [], fx: [] };
    film.director(shot, f, info, undefined as never, st);
    const P = (p: [number, number, number]) => new THREE.Vector3(...p).project(cam), tt = ((f - a) / FPS).toFixed(1);
    const inFrame = (v: THREE.Vector3, m = 1) => v.z < 1 && Math.abs(v.x) <= m && Math.abs(v.y) <= m;
    const anchors: NonNullable<Stage["anchors"]> = st.anchors ?? new Map();
    for (const [who, an] of anchors) {
      if (!cast.has(who) || !inFrame(P(an.head), 1.02)) continue;
      for (const h of an.hands) {
        if (h.kind === "dot" && !h.raised) continue; // a hanging hand may leave the frame bottom
        const v = P(h.p);
        if (v.z >= 1 || (v.y <= 1 && Math.abs(v.x) <= 1)) continue;
        // out of the top: always wrong (a cropped raised arm). Out of the side: wrong when the hand IS the action
        // (tickling, operating, pointing, waving, thumbs up, presenting...); a talking / shrugging hand cut by the side
        // of a close-up is ordinary framing (warning)
        const action = v.y > 1 || ACTION_GESTURES.includes(an.gesture);
        report(`hand-${who}`, `${who}'s ${h.raised ? "raised " : ""}hand (${an.gesture}) is out of frame @${tt}s (${v.y > 1 ? "top" : "side"}): widen the shot or change the gesture`, !action);
      }
    }
    // a reaching hand (tickle, offer, write, grab, block) must get to its target: another actor's flank or a prop.
    // Judged on a held reach (three samples = 0.6 s in a row, longer than gesture easing): a hand still on its way in
    // is not short
    for (const act of s.actors) {
      const an = anchors.get(act.who); if (!act.reach || !an || an.walking || !REACHING.includes(an.gesture)) { short.delete(act.who); continue; }
      const tgtA = anchors.get(act.reach), q = (s.props ?? []).findIndex((x) => x.id === act.reach), pr = q >= 0 ? shot.props?.[q] : undefined;
      let tgt: [number, number, number] | undefined = tgtA ? tgtA.chest : pr ? [pr.at.x, pr.at.y ?? 0, pr.at.z] : undefined; if (!tgt) continue;
      // a prop that guides the hand (a pen along a signature): the target is where the guide is at this moment
      const spec = q >= 0 ? s.props![q] : undefined, ge = spec ? PROPS[spec.id] : undefined;
      if (spec && pr && ge?.guide) {
        const [gx, gz] = ge.guide(spec.steps ? stepAt(spec.steps, (f - a) / FPS) : 0, spec.variant), yaw = pr.at.yaw ?? 0, k = pr.at.s ?? 1;
        tgt = [tgt[0] + (Math.cos(yaw) * gx + Math.sin(yaw) * gz) * k, tgt[1], tgt[2] + (-Math.sin(yaw) * gx + Math.cos(yaw) * gz) * k];
      }
      // a pen must touch what it writes on: a writing hand more than 8 cm above the surface writes in the air, one
      // more than 4 cm below it is hidden under the table
      if (spec && pr && an.gesture === "write") {
        const top = (pr.at.y ?? 0) + (ge?.height ?? 0.6) * (pr.at.s ?? 1), low = Math.min(...an.hands.filter((h) => h.kind !== "dot").map((h) => h.p[1]));
        const n = low - top > 0.08 || top - low > 0.04 ? (hover.get(act.who) ?? 0) + 1 : 0; hover.set(act.who, n);
        if (n >= 3) report(`hover-${act.who}`, low > top ? `${act.who} writes ${(low - top).toFixed(2)} m above ${act.reach} @${tt}s (the pen must touch the page: a lower surface or a taller writer)`
          : `${act.who}'s writing hand is ${(top - low).toFixed(2)} m below ${act.reach} @${tt}s, hidden under it (a lower surface or a taller writer)`);
      }
      // sideways along the actor's own card (cards turn to face the camera position, as the director's reach does)
      const yawC = Math.atan2(cam.position.x - an.floor[0], cam.position.z - an.floor[2]), rx = Math.cos(yawC), rz = -Math.sin(yawC);
      const lat = (p: [number, number, number]) => (p[0] - an.floor[0]) * rx + (p[2] - an.floor[2]) * rz;
      const mid = tgtA && (an.gesture === "offer" || an.gesture === "write"); // handing over: the hands meet half-way
      const want = mid ? lat(tgt) / 2 : lat(tgt) - Math.sign(lat(tgt)) * (tgtA ? 0.2 : 0), best = Math.max(...an.hands.map((h) => Math.sign(want) * lat(h.p)));
      // a pen on a page must be ON the writing (6 cm); a handover or grab may stop a little short (22 cm)
      const tol = spec && an.gesture === "write" ? 0.06 : 0.22;
      const n = Math.abs(want) - best > tol ? (short.get(act.who) ?? 0) + 1 : 0; short.set(act.who, n);
      if (n >= 3) report(`reachgap-${act.who}`, `${act.who}'s hand (${an.gesture}) stops ${(Math.abs(want) - best).toFixed(2)} m short of ${act.reach} @${tt}s: stand closer`);
    }
    // effects (not ground blobs or diagrams): centre on screen
    for (const x of st.fx) {
      if (x.key.startsWith("blob|") || x.key.startsWith("dg|") || x.flat) continue;
      const v = P([x.x, x.y, x.z]);
      if (!inFrame(v, 1.0)) report(`fx-${x.key.split("|")[1]}`, `the ${x.key.split("|")[1]} effect is off screen @${tt}s`);
    }
    // faces: a subject's head covered by a nearer character's body (subjects of the camera beat on screen)
    const { who: subj, detail } = subjAt(f);
    for (const who of subj) {
      const an = anchors.get(who); if (!an || an.walking) continue; // sneaking past behind someone is allowed
      const hd = cam.position.distanceTo(new THREE.Vector3(...an.head)), hv = P(an.head), hr = Math.abs(P([an.head[0] + info.right.x * an.headR[0], an.head[1], an.head[2] + info.right.z * an.headR[0]]).x - hv.x);
      for (const [o, on] of anchors) {
        if (o === who || o === over) continue;
        const od = cam.position.distanceTo(new THREE.Vector3(...on.chest)); if (od >= hd - 0.15) continue;
        const l = P([on.floor[0] - info.right.x * 0.3, on.floor[1], on.floor[2] - info.right.z * 0.3]), r = P([on.floor[0] + info.right.x * 0.3, on.crown[1], on.floor[2] + info.right.z * 0.3]);
        const x0 = Math.min(l.x, r.x), x1 = Math.max(l.x, r.x), y0 = Math.min(l.y, r.y), y1 = Math.max(l.y, r.y);
        const cover = Math.max(0, Math.min(x1, hv.x + hr) - Math.max(x0, hv.x - hr)) / (2 * hr || 1);
        if (hv.y >= y0 && hv.y <= y1 && cover > 0.4) report(`hide-${who}-${o}`, `${who}'s face is hidden behind ${o} @${tt}s`);
      }
    }
    // a big foreground figure that isn't a subject (the over-the-shoulder near figure included: it's a warning)
    for (const [o, on] of anchors) {
      if (detail || subj.includes(o) || !cast.has(o)) continue;
      const l = P([on.floor[0] - info.right.x * 0.3, on.floor[1], on.floor[2] - info.right.z * 0.3]), r = P([on.floor[0] + info.right.x * 0.3, on.crown[1], on.floor[2] + info.right.z * 0.3]);
      const w = Math.max(0, Math.min(1, Math.max(l.x, r.x)) - Math.max(-1, Math.min(l.x, r.x))) / 2, h = Math.max(0, Math.min(1, Math.max(l.y, r.y)) - Math.max(-1, Math.min(l.y, r.y))) / 2;
      if (l.z < 1 && w * h > 0.25) report(`fg-${o}`, `${o} fills ${Math.round(w * h * 100)} % of the frame in the foreground @${tt}s (is it hiding the action?)`, true);
    }
    // story props in frame at least once; diagrams fully in frame
    (s.props ?? []).forEach((q, k) => {
      const e = PROPS[q.id], pr = shot.props?.[k]; if (!e || !pr) return;
      // in frame if any part of its footprint box (radius x height) is: a prop partly in shot counts as seen
      const r0 = e.radius * (pr.at.s ?? 1), y0 = pr.at.y ?? 0, y1 = y0 + e.height * (pr.at.s ?? 1);
      // a prop travelling with an actor (track) is where it really is this frame
      const tr = q.track ? pr.animate?.((f - a) / FPS, anchors)?.track : undefined, px = tr ? tr.pos[0] : pr.at.x, pz = tr ? tr.pos[2] : pr.at.z;
      for (const [dx, dz] of [[0, 0], [-1, -1], [1, -1], [1, 1], [-1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]) for (const y of [y0, (y0 + y1) / 2, y1])
        if (inFrame(P([px + dx * r0, y, pz + dz * r0]), 1.0)) { seenProp.add(k); break; }
      if (q.follow && e.reach) {
        const hand = anchors.get(q.follow.who)?.hands.find((h) => h.kind === "palm" || h.kind === "open");
        if (!hand) report(`reach-${k}`, `prop "${q.id}" follows ${q.follow.who}'s open hand, but ${q.follow.who} isn't holding one out @${tt}s (gesture "operate")`);
        else if (Math.hypot(hand.p[0] - pr.at.x, hand.p[1] + e.reach.lift - (pr.at.y ?? 0) - e.reach.shoulder, hand.p[2] - pr.at.z) > e.reach.length) report(`reach-${k}`, `prop "${q.id}" can't reach ${q.follow.who}'s hand @${tt}s: move it closer`);
      }
    });
    for (const x of st.fx) if (x.key.startsWith("dg|")) {
      for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        const v = P([x.x + info.right.x * dx * x.w / 2, x.y + dy * x.h / 2, x.z + info.right.z * dx * x.w / 2]);
        if (!inFrame(v, 1.0)) { report("diagram", `the ${x.key.split("|")[1]} diagram is cut by the frame edge @${tt}s: frame it with the camera (on: [..., "diagram"])`); break; }
      }
    }
  }
  (s.props ?? []).forEach((q, k) => { if (!seenProp.has(k)) report(`prop-${k}`, `prop "${q.id}" is never in frame (move it into the shot or drop it)`); });
  // arm snaps: around every beat, follow each hand frame by frame; a jump of more than SNAP metres in one frame means
  // a gesture changed without easing (cuts, walks and frames outside the shot are skipped; so is a hard camera cut
  // inside the shot: cards turn to the new camera, so the frame after a cut is never compared with the one before)
  const beats = new Set<number>();
  for (const x of s.actors) for (const bt of x.beats ?? []) if (bt.gesture || bt.act || bt.hold !== undefined) beats.add(a + Math.round((bt.t ?? 0) * FPS));
  for (const fb of beats) {
    let last: Map<string, Map<number, [number, number, number]>> | null = null;
    for (let f = Math.max(a, fb - 2); f < Math.min(b, fb + 8); f++) {
      if (shot.keys.some((k, j) => j > 0 && k.cut && k.f === f)) last = null;
      const cm = runKeys(shot.keys, f), cam = new THREE.PerspectiveCamera(cm.fov, 9 / 16, 0.05, 3000);
      cam.position.set(...cm.pos); cam.up.set(0, 1, 0); cam.lookAt(...cm.look); cam.updateMatrixWorld();
      const st: Stage = { places: [], fx: [] };
      film.director(shot, f, { pos: cam.position, right: new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), sun: new THREE.Vector3(0.3, 0.8, 0.5).normalize() }, undefined as never, st);
      // hands by side (gestures list their arms in different orders)
      const now = new Map<string, Map<number, [number, number, number]>>();
      // measured on the character's own card (lateral along the card's right, height above the floor): camera moves
      // turn the card and must not count as arm movement
      for (const [who, an] of (st.anchors ?? new Map()) as NonNullable<Stage["anchors"]>) if (cast.has(who) && !an.walking) {
        const yaw = Math.atan2(cam.position.x - an.floor[0], cam.position.z - an.floor[2]), rx = Math.cos(yaw), rz = -Math.sin(yaw);
        now.set(who, new Map(an.hands.map((h) => [h.side, [(h.p[0] - an.floor[0]) * rx + (h.p[2] - an.floor[2]) * rz, h.p[1] - an.floor[1], 0] as [number, number, number]])));
      }
      if (last) for (const [who, hs] of now) {
        const prev = last.get(who); if (!prev) continue;
        const jump = Math.max(0, ...[...hs].map(([sd, h]) => { const q = prev.get(sd); return q ? Math.hypot(h[0] - q[0], h[1] - q[1], h[2] - q[2]) : 0; }));
        if (jump > SNAP) report(`snap-${who}-${fb}`, `${who}'s hand jumps ${jump.toFixed(2)} m in one frame @${((f - a) / FPS).toFixed(2)}s (a gesture change without easing)`);
      }
      last = now;
    }
  }
  return out;
};
