import * as THREE from "three";
// Storyboard -> film (stage 1E). Turns plain storyboard data into SetWorld shots (camera keys from named moves, lens
// blur, impact kicks), a timeline (cuts, crossfades, white flashes, dips to black) and a director that stages every
// actor each frame: acting preset + timed beats, idle life, blinks hidden behind expression swaps, talking mouths and
// hands, nods / shakes, facing the nearest other actor, profile walks between marks, contact shadows and effect cards.
// Everything is a pure function of the frame number -> deterministic for chunked cloud renders.
import { plan, Move } from "../camera/moves";
import { runKeys, glide, dolly, flyPath, camOf, type Key, type Shot, type Cam } from "../camera/keys";
import { SETS } from "../sets";
import { LAYOUTS } from "../sets/layouts";
import type { WorldShot, Director } from "../scene/SetWorld";
import type { Timeline } from "../look/StudioFilm";
import { extra } from "../characters/cast";
import { ROSTER } from "../characters/roster";
import { act as actPose, Look, Pose, Expr, anchorsFront, Anchors } from "../characters/figure";
import { idle, nod as nodAt, shake as shakeAt, talk as talkAt, speak as speakAt, layer, faceToward } from "../characters/acting";
import { lookCard, contactShadow, lidAt, cardPoint } from "../cards/person";
import { fxNear, fxHalo, HALO_KINDS } from "../fx/effects";
import { diagramCard } from "../fx/diagrams";
import { SU } from "../cards/cards";
import type { ActorAnchor, CamInfo } from "../cards/cards";
import type { Storyboard, ShotSpec, ActorSpec, Where, V3, CameraSpec, Move as MoveSpec, PropSpec } from "./types";
import type { Narration } from "../voice/narration";
import { resolve } from "./timing";
import { placeCrowd } from "./crowd";
import { PROPS } from "../props/registry";

export const FPS = 30;
/** gesture easing time and the walk-end turn (seconds) */
const EASE = 0.15, EASE_MAX = 0.4, HAND_SPEED = 3.0, WALK_TURN = 0.25;
/** a story prop's floor position in the world (its mark plus offset) */
export const propWorld = (set: string, q: PropSpec): V3 => { const w = whereOf(set, q.at); return [w[0] + (q.offset?.[0] ?? 0), w[1], w[2] + (q.offset?.[1] ?? 0)]; };
/** what decides where the arms are drawn (continuous fields like reach / drive / t are not part of it) */
const armKey = (p: Pose) => `${p.gesture ?? "hang"}|${p.hold ?? ""}|${p.hand ?? 1}|${p.mode ?? "stand"}`;
const KEEP_WHILE_TALKING = ["thumbsUp", "point", "pointUp", "hold", "tickle", "tickleSelf", "operate", "wave", "raiseHand", "cheer", "stop", "crossArms", "hips", "offer", "write", "grab", "block", "read"];
const FADE = 8;
/** zoom-through / whip transitions: a short dissolve (frames) hides the join while the cameras carry the motion */
const ZFADE = 6;

export const lookOf = (ref: Storyboard["cast"][string]): Look =>
  typeof ref === "string" ? ROSTER[ref] : extra(ref.extra, ref.era ?? "modern");
export const whereOf = (set: string, w: Where): V3 => (typeof w === "string" ? LAYOUTS[set].spots[w] : w);
const smooth = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };

/** an actor's floor position at shot time tt (walks ease in / out between their marks) */
export const actorPos = (set: string, a: ActorSpec, tt: number): V3 => {
  const p0 = whereOf(set, a.at);
  if (!a.walk) return p0;
  const p1 = whereOf(set, a.walk.to), k = smooth((tt - a.walk.t0) / Math.max(0.1, a.walk.t1 - a.walk.t0));
  return [p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k, p0[2] + (p1[2] - p0[2]) * k];
};

/** where an actor settles in the shot (the end of their walk): cameras frame this, so walk-ins enter the frame */
export const restPos = (set: string, a: ActorSpec): V3 => whereOf(set, a.walk ? a.walk.to : a.at);

/** frame ranges of the shots: shot k covers [a, b) */
export const shotFrames = (sb: Storyboard) => {
  let f = 0;
  return sb.shots.map((s) => { const a = f; f += Math.round((s.dur ?? 0) * FPS); return { a, b: f }; });
};

/** where a shot's diagram stands (floor point under its centre): beside the presenter's resting mark, on their screen
 *  side as seen from the camera's `from` angle, a fixed world point so the camera fit and the card agree */
export const diagramMark = (s: ShotSpec): V3 | undefined => {
  const d = s.diagram; if (!d) return undefined;
  const a = s.actors.find((x) => x.who === d.with); if (!a) return undefined;
  const p = restPos(s.set, a), from = "from" in s.camera ? (s.camera as { from?: number }).from ?? 0 : 0, ar = (from * Math.PI) / 180;
  const size = d.size ?? 0.95, off = d.place === "above" ? 0 : (d.side ?? 1) * (size / 2 + 0.34);
  return [p[0] + Math.cos(ar) * off, p[1], p[2] - Math.sin(ar) * off];
};
/** a diagram's centre height above its floor point: at head height beside the presenter, or just above their head */
export const DIAGRAM_ABOVE = 1.94;
/** the lower edge of an "above" panel: over the presenter's head (story/timing.ts sets it), 1.94 m by default */
export const diagramBase = (s: ShotSpec) => s.diagram?.base ?? DIAGRAM_ABOVE;
export const diagramY = (s: ShotSpec) => (s.diagram?.place === "above" ? diagramBase(s) + (s.diagram.size ?? 0.95) / 2 : 1.42);

/** camera spec -> library move, naming actors instead of coordinates (framed where they settle) */
/** an actor's authored pose at shot time tq: the act, face, gesture and mode with every beat up to tq applied, and the
 *  held item (the director's acting starts from this; camera inserts use it to find the hands) */
export const basePoseAt = (a: ActorSpec, tq: number): { base: Pose; held: string | undefined } => {
  let base: Pose = actPose(a.act ?? "neutral", { ...(a.face ? { expr: a.face } : {}), ...(a.gesture ? { gesture: a.gesture } : {}), ...(a.mode ? { mode: a.mode } : {}) });
  for (const bt of (a.beats ?? []).filter((x) => (x.t ?? 0) <= tq).sort((x, y) => (x.t ?? 0) - (y.t ?? 0))) base = { ...(bt.act ? actPose(bt.act) : base), ...(bt.face ? { expr: bt.face } : {}), ...(bt.gesture ? { gesture: bt.gesture } : {}) };
  let held = a.hold;
  for (const bt of (a.beats ?? []).filter((x) => (x.t ?? 0) <= tq && x.hold !== undefined).sort((x, y) => (x.t ?? 0) - (y.t ?? 0))) held = bt.hold ?? undefined;
  return { base, held };
};

/** where a story prop is reached for at shot time tq: its floor point, or, for a prop that guides the hand (a pen
 *  along a signature), where its guide is at that moment (world [x, base y, z]) */
export const guidedPoint = (s: ShotSpec, pr: PropSpec, tq: number): V3 => {
  const w = propWorld(s.set, pr), e = PROPS[pr.id]; if (!e?.guide) return w;
  const [gx, gz] = e.guide(pr.steps ? stepAt(pr.steps, tq) : 0, pr.variant), yaw = ((pr.yaw ?? 0) * Math.PI) / 180, k = pr.scale ?? 1;
  return [w[0] + (Math.cos(yaw) * gx + Math.sin(yaw) * gz) * k, w[1], w[2] + (-Math.sin(yaw) * gx + Math.cos(yaw) * gz) * k];
};
/** a reach's arm settings (story ActorSpec.reach): for another actor the hands land on their flank (tickle) or meet
 *  theirs half-way (offer, write); for a story prop they go to its middle, just over its top (a prop standing on a
 *  table counts the table: its base height is part of its `at`), or follow its guide (a pen along a signature).
 *  lateral(from, to) = the screen-sideways distance, actorAt(who) = where another actor is. Shared by the director
 *  and the camera (inserts on hands), so both see the same hand */
export const reachExtra = (s: ShotSpec, a: ActorSpec, p: V3, tq: number, lateral: (from: V3, to: V3) => number, actorAt: (who: string) => V3 | undefined, camPos?: V3, writing = false): Partial<Pose> => {
  const extra: Partial<Pose> = {}; if (!a.reach) return extra;
  const q = actorAt(a.reach), pr = q ? undefined : (s.props ?? []).find((x) => x.id === a.reach);
  let tp: V3 | undefined = q ?? (pr ? propWorld(s.set, pr) : undefined);
  if (!tp) return extra;
  const e = pr ? PROPS[pr.id] : undefined;
  if (pr) tp = guidedPoint(s, pr, tq);
  // a guided pen: the hand goes where the camera's line of sight to the writing crosses the writer's card (cards face
  // the camera), so pen and ink coincide on screen from any camera that sees the writer's near side
  const top = tp[1] + (e?.height ?? 0.6) * (pr?.scale ?? 1);
  if (pr && e?.guide && camPos && writing) {
    const yaw = Math.atan2(camPos[0] - p[0], camPos[2] - p[2]), n: V3 = [Math.sin(yaw), 0, Math.cos(yaw)], T: V3 = [tp[0], top, tp[2]];
    const d: V3 = [T[0] - camPos[0], T[1] - camPos[1], T[2] - camPos[2]], den = d[0] * n[0] + d[2] * n[2];
    if (Math.abs(den) > 1e-6) {
      const k = ((p[0] - camPos[0]) * n[0] + (p[2] - camPos[2]) * n[2]) / den, X: V3 = [camPos[0] + d[0] * k, camPos[1] + d[1] * k, camPos[2] + d[2] * k];
      const lx = (X[0] - p[0]) * Math.cos(yaw) - (X[2] - p[2]) * Math.sin(yaw);
      extra.hand = lx < 0 ? -1 : 1; extra.reach = Math.max(60, Math.min(270, Math.abs(lx) / SU)); extra.reachY = 975 - (X[1] - p[1]) / SU;
      return extra;
    }
  }
  const lat = lateral(p, tp); extra.hand = lat < 0 ? -1 : 1; extra.reach = Math.max(60, Math.min(270, Math.abs(lat) / SU - (q ? 95 : 0)));
  if (q) extra.reachMid = Math.max(60, Math.abs(lat) / SU / 2);
  if (pr) extra.reachY = 975 - (top - p[1]) / SU;
  return extra;
};

/** a camera detail (inserts, POV targets): a prop ("treasureChest"), or an actor ("qm", "qm.face", "qm.hands",
 *  "qm.held"): its centre in the world and the size (m) an insert frames. "hands" = where the actor's hands meet
 *  their `reach` target (a handover, a signature, a grab); "held" = in front of their own chest (what they hold) */
export const detailOf = (cast: Storyboard["cast"], s: ShotSpec, name: string, tq = 0, from = 0): { c: V3; span: number } => {
  const pr = (s.props ?? []).find((q) => q.id === name);
  if (pr) { const w = propWorld(s.set, pr), e = PROPS[pr.id], h = (e?.height ?? 0.6) * (pr.scale ?? 1); return { c: [w[0], w[1] + h * 0.6, w[2]], span: Math.max(h, (e?.radius ?? 0.4) * 1.3) }; }
  const [who, part] = name.split("."), a = s.actors.find((x) => x.who === who);
  if (!a || !cast[who]) throw new Error(`camera names "${name}" but there is no such actor or prop in the shot`);
  const L = lookOf(cast[who]), p = restPos(s.set, a), an = anchorsFront(L, {}), y = (d: number) => p[1] + (975 - d) * SU;
  // a face: head and shoulders (the drawn head is about a third of the frame height in a "close" insert)
  if (!part || part === "face") return { c: [p[0], y(an.head[1]) - 0.08, p[2]], span: 2 * an.headR[1] * SU * 1.9 };
  // the hands as the rig draws them at that moment: the authored pose (act, gesture, beats up to tq, the held item and
  // the reach, set as the director sets it), mapped onto the card as seen from the insert's side
  const ar = (from * Math.PI) / 180, eye = new THREE.Vector3(p[0] + Math.sin(ar) * 6, p[1] + 1.4, p[2] + Math.cos(ar) * 6);
  const { base, held } = basePoseAt(a, tq);
  const ta = a.reach ? s.actors.find((x) => x.who === a.reach) : undefined, tw: V3 | undefined = ta ? restPos(s.set, ta) : a.reach && (s.props ?? []).some((q) => q.id === a.reach) ? propWorld(s.set, (s.props ?? []).find((q) => q.id === a.reach)!) : undefined;
  const extra = reachExtra(s, a, p, tq, (from, to) => (to[0] - from[0]) * Math.cos(ar) - (to[2] - from[2]) * Math.sin(ar), (w) => { const x = s.actors.find((y) => y.who === w); return x ? restPos(s.set, x) : undefined; }, [eye.x, eye.y, eye.z], base.gesture === "write");
  const hs = anchorsFront(L, { ...base, ...(held ? { hold: held } : {}), ...extra }).hands, side = extra.hand ?? base.hand ?? 1;
  const w = (q: [number, number]): V3 => cardPoint(eye, p[0], p[1], p[2], q, 1, false);
  if (part === "held") { // the holding hand (what it holds is drawn there)
    const h = hs.find((x) => x.side === side && x.kind !== "dot") ?? hs.find((x) => x.kind !== "dot") ?? hs[0];
    return { c: h ? w(h.p) : [p[0], y(an.chest[1]), p[2]], span: 0.45 };
  }
  // "hands": the reaching hand, or where the two meet (a handover, a signature); a prop's top for a grab
  const h = hs.find((x) => x.side === side && x.kind !== "dot") ?? hs[0];
  let c = h ? w(h.p) : [p[0], y(an.chest[1]), p[2]] as V3;
  // writing on a prop: centred between the hand and the writing on the page, tight (hand, quill and words together)
  const tpr = a.reach ? (s.props ?? []).find((q) => q.id === a.reach) : undefined;
  if (tpr && base.gesture === "write") {
    const g = guidedPoint(s, tpr, tq), top = g[1] + (PROPS[tpr.id]?.height ?? 0) * (tpr.scale ?? 1);
    c = [c[0] * 0.55 + g[0] * 0.45, c[1] * 0.55 + top * 0.45, c[2] * 0.55 + g[2] * 0.45];
    return { c, span: 0.4 };
  }
  return { c, span: ta ? 0.55 : tw ? 0.6 : 0.45 };
};

const moveOf = (s: ShotSpec, c: CameraSpec, t0 = 0, cast: Storyboard["cast"] = {}): Move => {
  // the slow "breathing" push of held shots totals at most 8 % of the distance however long the shot, so a fitted
  // group stays in frame to the last frame
  const frames = Math.max(1, Math.round((s.dur ?? 0) * FPS)), creep = Math.min(0.0022, 0.08 / frames);
  // tighter moves (close-up, low hero, dutch) keep their livelier creep, capped at 16 % in total so a long close shot
  // never pushes the face out of the 9:16 frame
  const tight = (rate: number) => Math.min(rate, 0.16 / frames);
  const pos = (who: string) => {
    if (who === "diagram") { const m = diagramMark(s); if (!m) throw new Error("camera names \"diagram\" but the shot has no diagram"); return m; }
    const pr = (s.props ?? []).find((q) => q.id === who);
    if (pr) { const w = whereOf(s.set, pr.at); return [w[0] + (pr.offset?.[0] ?? 0), w[1], w[2] + (pr.offset?.[1] ?? 0)] as V3; }
    const a = s.actors.find((x) => x.who === who); if (!a) throw new Error(`camera names "${who}" but no such actor in the shot`); return restPos(s.set, a);
  };
  // a diagram is wider than a person: frame both of its side edges (each fitted with a person's half-width)
  const marks = (who: string): V3[] => {
    if (who === "diagram" && s.diagram?.place === "above") return []; // framed by `top` instead (below)
    if (who !== "diagram" || !s.diagram) {
      // an actor who staggers: frame where the lean takes them too (planned motion never leaves the frame)
      const p = pos(who), act = s.actors.find((x) => x.who === who), st = act?.moves?.find((m) => m.kind === "stagger");
      if (!act || !st) return [p];
      const from = "from" in c ? (c as { from?: number }).from ?? 0 : 0, ar = (from * Math.PI) / 180, rx = Math.cos(ar), rz = -Math.sin(ar);
      const away = st.away ? s.actors.find((x) => x.who === st.away) : undefined, q = away ? restPos(s.set, away) : undefined;
      const side = st.dir ?? (q ? -Math.sign((q[0] - p[0]) * rx + (q[2] - p[2]) * rz || 1) : 1), d = 0.42 * (st.amount ?? 1);
      return [p, [p[0] + rx * side * d, p[1], p[2] + rz * side * d]];
    }
    const m = pos(who), from = "from" in c ? (c as { from?: number }).from ?? 0 : 0, ar = (from * Math.PI) / 180, h = Math.max(0, (s.diagram.size ?? 0.95) / 2 - 0.3);
    return [[m[0] - Math.cos(ar) * h, m[1], m[2] + Math.sin(ar) * h], [m[0] + Math.cos(ar) * h, m[1], m[2] - Math.sin(ar) * h]];
  };
  const view = (name: string) => { const v = LAYOUTS[s.set].views.find((x) => x.name === name); if (!v) throw new Error(`set ${s.set} has no view "${name}"`); return v; };
  switch (c.move) {
    case "view": return { move: "view", view: view(c.view), creep };
    case "establish": return { move: "establish", view: view(c.view) };
    case "frame": {
      const above = s.diagram?.place === "above" && c.on.includes("diagram"), dsz = s.diagram?.size ?? 0.95;
      return { move: "frame", marks: c.on.flatMap(marks), size: c.size, from: c.from, height: c.height, roll: c.roll, creep,
        ...(above ? { top: diagramBase(s) + dsz + 0.06, halfWidth: Math.max(0.36, dsz / 2) } : {}) };
    }
    case "pushIn": case "pullOut": return { move: c.move, marks: c.on.flatMap(marks), size: c.size, to: c.to, from: c.from, height: c.height };
    case "closeUp": return { move: "closeUp", mark: pos(c.on), from: c.from, punch: c.punch, creep: tight(0.003) };
    case "lowHero": return { move: "lowHero", mark: pos(c.on), from: c.from, creep: tight(0.0025) };
    case "highAngle": return { move: "highAngle", marks: c.on.flatMap(marks), from: c.from };
    case "overShoulder": return { move: "overShoulder", over: pos(c.over), at: pos(c.at), side: c.side };
    case "orbit": return { move: "orbit", marks: c.on.flatMap(marks), fromDeg: c.fromDeg, size: c.size, height: c.height };
    case "crane": return { move: "crane", marks: c.on.flatMap(marks), heights: c.heights, size: c.size, from: c.from };
    case "follow": { const a = s.actors.find((x) => x.who === c.on); if (!a) throw new Error(`camera follows "${c.on}" but no such actor in the shot`); return { move: "follow", track: (t) => actorPos(s.set, a, t - t0), size: c.size, from: c.from, height: c.height }; }
    case "dutch": return { move: "dutch", marks: c.on.flatMap(marks), size: c.size, from: c.from, roll: c.roll, creep: tight(0.003) };
    case "insert": {
      // the detail fills ~62 % (close) / ~85 % (extreme) of the frame height, seen from the shot's own side, slightly
      // from above; a gentle push; the background goes soft (focus on the detail)
      // the detail as it is a moment into the beat (a gesture that starts on the beat's word has landed)
      const from = c.from ?? ("from" in s.camera ? (s.camera as { from?: number }).from ?? 0 : 0), ar = (from * Math.PI) / 180;
      const d = detailOf(cast, s, c.on, ((c as { t?: number }).t ?? 0) + 0.25, from);
      const fov = 30, fill = c.size === "extreme" ? 0.85 : 0.62, dist = d.span / fill / (2 * Math.tan((fov * Math.PI) / 360));
      const pos: V3 = [d.c[0] + Math.sin(ar) * dist, c.height ?? d.c[1] + dist * 0.2, d.c[2] + Math.cos(ar) * dist];
      return { move: "aim", pos, look: d.c, fov, push: c.push ?? 0.06, cInf: c.size === "extreme" ? 15 : 13, focus: d.c };
    }
    case "at": return { move: "aim", pos: c.pos, look: c.look, fov: c.fov ?? 40, cInf: 0, focus: c.look };
    case "pov": {
      // from the actor's eyes (a step toward the target, so their own card is behind the lens), a light hand-held bob
      const a = s.actors.find((x) => x.who === c.from.split(".")[0]); if (!a) throw new Error(`POV from "${c.from}", who is not in the shot`);
      const eye = detailOf(cast, s, a.who).c, t = detailOf(cast, s, c.at).c, dx = t[0] - eye[0], dz = t[2] - eye[2], L = Math.hypot(dx, dz) || 1;
      const pos: V3 = [eye[0] + (dx / L) * 0.3, eye[1] - 0.05, eye[2] + (dz / L) * 0.3];
      return { move: "aim", pos, look: t, fov: 50, push: 0.02, bob: 0.006, cInf: 8, focus: t };
    }
  }
};

/** a shot's camera: the opening set-up plus its word-timed beats (cams), as a key list and a lens-blur function.
 *  cut = a hard cut; glide / whip = a move from the previous framing (whip: 6 frames); rack = only the focus moves.
 *  Lens blur cross-fades over a glide, so focus never pops */
const cameraOf = (s: ShotSpec, cast: Storyboard["cast"], a: number, b: number, pre: number) => {
  type Beat = { spec: CameraSpec; f0: number; cut: boolean; dur?: number; rack?: boolean; fly?: boolean };
  const beats: Beat[] = [{ spec: s.camera, f0: a - pre, cut: true },
    ...(s.cams ?? []).map((c) => ({ spec: c as CameraSpec, f0: a + Math.round((c.t ?? 0) * FPS), cut: !(c.glide || c.whip || c.rack || c.fly), dur: c.whip ? 6 : c.glide ? Math.round(c.glide * FPS) : undefined, rack: c.rack, fly: c.fly }))]
    .sort((x, y) => x.f0 - y.f0);
  // a flight: the framing before the first fly beat and every consecutive fly beat become one key whose path passes
  // through each framing on its beat's frame; lens blur blends knot to knot along it
  type Dof = (f: number) => { cInf: number; focus?: V3 };
  const flown = new Set<number>(), flights = new Map<number, { key: Key; dof: Dof }>();
  for (let j = 1; j < beats.length; j++) {
    if (!beats[j].fly || !beats[j - 1] || beats[j - 1].fly || beats[j - 1].rack) continue;
    let e = j; while (e + 1 < beats.length && beats[e + 1].fly) e++;
    const run = beats.slice(j - 1, e + 1), ps = run.map((bt, k) => plan(moveOf(s, bt.spec, a / FPS, cast), bt.f0, k + 1 < run.length ? run[k + 1].f0 : (e + 1 < beats.length ? beats[e + 1].f0 : b), { cut: true }));
    const T = run.map((bt) => bt.f0), last = ps[ps.length - 1];
    // the departure framing is where the camera is when the flight leaves (its key evaluated on the frame it starts)
    const path = flyPath(run.map((bt, k) => ({ f: bt.f0, c: camOf(ps[k].key.s(bt.f0)) })), (f) => last.key.s(f));
    run.forEach((_, k) => flown.add(j - 1 + k));
    flights.set(j - 1, { key: { f: T[0], cut: run[0].cut, ...(run[0].dur ? { dur: run[0].dur } : {}), s: path } as Key,
      dof: (f: number) => { let k = 0; while (k + 1 < T.length && f >= T[k + 1]) k++; if (k + 1 >= T.length) return last.dof(f);
        const pd = ps[k].dof(f), nd = ps[k + 1].dof(f), u = glide((f - T[k]) / (T[k + 1] - T[k]));
        return { cInf: pd.cInf + (nd.cInf - pd.cInf) * u, focus: pd.focus && nd.focus ? lerp3(pd.focus, nd.focus, u) : nd.focus ?? pd.focus }; } });
  }
  const keys: Key[] = [], dofs: { f0: number; dof: Dof }[] = [];
  beats.forEach((bt, j) => {
    const fl = flights.get(j);
    if (fl) { keys.push(fl.key); dofs.push({ f0: bt.f0, dof: fl.dof }); return; }
    if (flown.has(j)) return;
    const f1 = j + 1 < beats.length ? beats[j + 1].f0 : b;
    const p = plan(moveOf(s, bt.spec, a / FPS, cast), bt.f0, f1, { cut: bt.cut, dur: bt.dur });
    const prev = dofs[dofs.length - 1];
    if (bt.rack && prev) { // focus pull to the new subject, camera unchanged
      dofs.push({ f0: bt.f0, dof: (f) => { const pd = prev.dof(f), nd = p.dof(f), k = glide((f - bt.f0) / 14); return { cInf: pd.cInf, focus: pd.focus && nd.focus ? lerp3(pd.focus, nd.focus, k) : nd.focus ?? pd.focus }; } });
      return;
    }
    keys.push(p.key);
    dofs.push({ f0: bt.f0, dof: bt.cut || !prev ? p.dof : (f) => { const pd = prev.dof(f), nd = p.dof(f), k = glide((f - bt.f0) / (bt.dur ?? 24)); return { cInf: pd.cInf + (nd.cInf - pd.cInf) * k, focus: pd.focus && nd.focus ? lerp3(pd.focus, nd.focus, k) : nd.focus }; } });
  });
  return { keys, dof: (f: number) => { let d = dofs[0]; for (const x of dofs) if (f >= x.f0) d = x; return d.dof(f); } };
};
/** motion blur by camera beat (Visual Storytelling 2.0): full on flights and while a whip pans or a zoom-through
 *  rushes, light on faces (close-ups, face inserts, POV: the eyes and expression stay readable) and on object inserts,
 *  medium on framed glides. Returns the shutter (frames) at frame f */
export const BLUR_SCALE = { flight: 1, whip: 1, face: 0.15, insert: 0.3, framed: 0.6 };
const shutterOf = (s: ShotSpec, a: number, b: number, full: number, rushOut: boolean) => {
  const beats = [{ spec: s.camera as CameraSpec & { fly?: boolean; whip?: boolean }, f0: a }, ...(s.cams ?? []).filter((c) => !c.rack).map((c) => ({ spec: c as CameraSpec & { fly?: boolean; whip?: boolean }, f0: a + Math.round((c.t ?? 0) * FPS) }))].sort((x, y) => x.f0 - y.f0);
  const scale = (c: CameraSpec & { fly?: boolean }) => c.fly ? BLUR_SCALE.flight
    : c.move === "closeUp" || c.move === "lowHero" || c.move === "pov" || (c.move === "insert" && (!c.on.includes(".") || c.on.endsWith(".face")) && !(s.props ?? []).some((q) => q.id === c.on)) ? BLUR_SCALE.face
    : c.move === "insert" ? BLUR_SCALE.insert : BLUR_SCALE.framed;
  return (f: number) => {
    if (rushOut && f >= b - 10) return full;                          // a zoom-through / whip out of the shot rushes
    let k = 0; for (let j = 0; j < beats.length; j++) if (f >= beats[j].f0) k = j;
    const bt = beats[k];
    if (bt.spec.whip && f < bt.f0 + 6) return full;                    // the whip itself
    if (k + 1 < beats.length && beats[k + 1].spec.fly) return full;    // flying on to the next waypoint
    return full * scale(bt.spec);
  };
};
const lerp3 = (p: V3, q: V3, k: number): V3 => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
/** a camera turned sideways about its own position (a whip pan): angle in radians */
const swing = (c: Cam, ang: number): Shot => {
  const dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], co = Math.cos(ang), si = Math.sin(ang);
  return { pos: c.pos, look: [c.pos[0] + dx * co - dz * si, c.look[1], c.pos[2] + dx * si + dz * co], fov: c.fov, roll: c.roll };
};

/** body motion layered on the acting at shot time tt (all pure functions of time): lean (degrees, + = top to screen
 *  right), head tilt, shrug, a sideways slide (metres along the card's right) and a hop (metres up). side = the screen
 *  side to stagger toward */
export const motionAt = (moves: MoveSpec[] | undefined, tt: number, sideOf: (m: MoveSpec) => number) => {
  const o = { tilt: 0, headTilt: 0, shrug: 0, slide: 0, hop: 0 };
  for (const m of moves ?? []) {
    const d = m.dur ?? (m.kind === "squirm" ? 1.6 : m.kind === "stagger" ? 1.3 : m.kind === "hop" ? 0.45 : 0.6), k = (tt - (m.t ?? 0)) / d;
    if (k < 0 || k > 1) continue;
    const env = Math.sin(Math.PI * k), amt = m.amount ?? 1;
    if (m.kind === "squirm") { const w = Math.sin(2 * Math.PI * 3.2 * (tt - (m.t ?? 0))); o.tilt += 7 * amt * w * env; o.headTilt += 5 * amt * Math.sin(2 * Math.PI * 2.3 * (tt - (m.t ?? 0)) + 1) * env; o.shrug += 0.6 * env; }
    else if (m.kind === "stagger") {
      // throws the body sideways (fast), overshoots back once, settles: "nearly falls over"
      const b = k < 0.28 ? smooth(k / 0.28) : Math.cos(((k - 0.28) / 0.72) * Math.PI * 1.5) * (1 - (k - 0.28) / 0.72), s = sideOf(m);
      o.tilt += s * 19 * amt * b; o.headTilt -= s * 7 * amt * b; o.slide += s * 0.16 * amt * Math.max(0, b); o.hop += 0.03 * amt * Math.max(0, b);
    }
    else if (m.kind === "hop") o.hop += 0.09 * amt * env;
    else if (m.kind === "recoil") { const s = sideOf(m); o.tilt += s * 8 * amt * env; o.slide += s * 0.05 * amt * env; }
  }
  return o;
};

/** an animated prop's state at shot time tt: the open hand it reaches for and the stroke it replays */
export type PropAnim = (tt: number, anchors: Map<string, ActorAnchor>) => { target?: V3; stroke: number; step?: number };
/** a stepped prop's progress at shot time tt: steps done + the eased fraction of the one playing (STEP_DUR s each) */
export const STEP_DUR = 0.7;
export const stepAt = (steps: { t?: number }[], tt: number) => steps.reduce((n, c) => n + glide((tt - (c.t ?? 0)) / STEP_DUR), 0);
const driveOf = (a: ActorSpec | undefined) => (tt: number) => (a?.drive && tt >= (a.drive.t ?? 0) ? Math.sin(2 * Math.PI * (a.drive.hz ?? 1.6) * (tt - (a.drive.t ?? 0))) : 0);
const propAnim = (s: ShotSpec, q: PropSpec): PropAnim | undefined => {
  if (!q.follow && !q.drive && !q.steps) return undefined;
  const drv = driveOf(s.actors.find((x) => x.who === q.drive?.who));
  const delayAt = (tt: number) => { let d = q.drive?.delay ?? 0; for (const c of q.drive?.changes ?? []) if (tt >= (c.t ?? 0)) d = c.delay; return d; };
  return (tt, anchors) => ({ target: q.follow ? anchors.get(q.follow.who)?.hands.find((h) => h.kind === "palm" || h.kind === "open")?.p : undefined, stroke: q.drive ? drv(tt - delayAt(tt)) : 0,
    ...(q.steps ? { step: stepAt(q.steps, tt) } : {}) });
};

/** storyboard (+ its narration manifest, if generated) -> film. Narration timing runs first (story/timing.ts): it
 *  sizes shots to their lines and turns word anchors into times; everything below works on that resolved copy */
export const compile = (sb0: Storyboard, narr?: Narration) => {
  const timing = resolve(sb0, narr), sb = timing.sb;
  const ranges = shotFrames(sb), total = ranges[ranges.length - 1].b;
  const seedOf = (who: string) => Object.keys(sb.cast).indexOf(who) + 1;
  const shots: WorldShot[] = sb.shots.map((s, k) => {
    const { a, b } = ranges[k], pre = s.transition === "fade" ? FADE : s.transition === "zoom" || s.transition === "whip" ? ZFADE : 0;
    const p = cameraOf(s, sb.cast, a, b, pre);
    const props = (s.props ?? []).map((q) => { const w = whereOf(s.set, q.at); return { id: q.id, variant: q.variant, at: { x: w[0] + (q.offset?.[0] ?? 0), y: w[1], z: w[2] + (q.offset?.[1] ?? 0), yaw: ((q.yaw ?? 0) * Math.PI) / 180, s: q.scale ?? 1 }, animate: propAnim(s, q) }; });
    return { id: k + 1, a, b, set: s.set, light: s.light ?? SETS[s.set].lights[0], keys: p.keys, dof: p.dof, kicks: (s.kicks ?? []).map((t) => [a / FPS + (t as number), 1] as [number, number]), ...(props.length ? { props } : {}), ...(sb.motionBlur ? { shutter: shutterOf(s, a, b, sb.motionBlur === true ? 0.5 : sb.motionBlur, ["zoom", "whip"].includes(sb.shots[k + 1]?.transition ?? "")) } : {}) };
  });
  // crowds: extras join the shot's actors (after the cameras are planned: cameras frame the named cast only)
  const notes: string[] = [];
  sb.shots.forEach((s, k) => {
    if (!s.crowd || s.crowd.count <= 0) return;
    const rest = (a: ActorSpec): V3[] => { const p0 = whereOf(s.set, a.at); if (!a.walk) return [p0]; const p1 = whereOf(s.set, a.walk.to), out: V3[] = []; for (let i = 0; i <= 10; i++) out.push([p0[0] + ((p1[0] - p0[0]) * i) / 10, p0[1], p0[2] + ((p1[2] - p0[2]) * i) / 10]); return out; };
    // placed for the first set-up that frames people (where the crowd is seen): the opening one, or, after an opening
    // aerial or insert, the first beat that frames the cast; never for a later insert or close-up
    const segs = [{ c: s.camera as CameraSpec, f0: shots[k].a }, ...(s.cams ?? []).filter((c) => !c.rack).map((c) => ({ c: c as CameraSpec, f0: shots[k].a + Math.round((c.t ?? 0) * FPS) }))].sort((x, y) => x.f0 - y.f0);
    const peopleAt = segs.findIndex((x) => Array.isArray((x.c as { on?: unknown }).on));
    const j = s.crowd.forBeat !== undefined ? Math.min(segs.length - 1, Math.max(0, s.crowd.forBeat)) : peopleAt < 0 ? 0 : peopleAt;
    const seg0 = segs[j].f0, seg1 = j + 1 < segs.length ? segs[j + 1].f0 : shots[k].b;
    const c = placeCrowd(s, k + 1, shots[k].keys, Math.round((seg0 + seg1) / 2), (w) => whereOf(s.set, w), rest);
    s.actors.push(...c.actors); Object.assign(sb.cast, c.cast);
    if (c.note) notes.push(c.note);
  });
  // zoom-through / whip transitions: the outgoing camera accelerates into its subject (zoom) or pans away (whip) over
  // its last frames, the incoming one starts from inside / beside its subject and settles; a ZFADE dissolve joins them
  sb.shots.forEach((s, k) => {
    if (k === 0 || (s.transition !== "zoom" && s.transition !== "whip")) return;
    const prev = shots[k - 1], pk = [...prev.keys], cur = shots[k], c0 = cur.keys[0], n = 10, bp = prev.b, a = cur.a - ZFADE;
    const zoom = s.transition === "zoom";
    const out = (f: number): Shot => { const c = runKeys(pk, f), u = glide((f - (bp - n)) / n); return zoom ? dolly(c.pos, c.look, 1 - 0.72 * u, { fov: c.fov, roll: c.roll }) : swing(c, 0.55 * u * u); };
    prev.keys = [...pk, { f: bp - n, cut: true, s: out }];
    const s0 = c0.s, into = (f: number): Shot => { const c = { fov: 40, roll: 0, ...s0(f) }, u = glide((f - a) / 14); return zoom ? dolly(c.pos, c.look, 0.3 + 0.7 * u, { fov: c.fov, roll: c.roll }) : swing(c as Cam, -0.55 * (1 - u) * (1 - u)); };
    cur.keys = [{ ...c0, s: into }, ...cur.keys.slice(1)];
  });
  const flashes = sb.shots.map((s, k) => (s.transition === "flash" ? ranges[k].a : -1)).filter((f) => f >= 0);
  const dips = sb.shots.map((s, k) => (s.transition === "dip" ? ranges[k].a : -1)).filter((f) => f >= 0);
  const timeline: Timeline = {
    total, flashes, dips, motionBlur: !!sb.motionBlur, stableInk: sb.engine === 2,
    layersAt: (f) => {
      for (let k = 1; k < sb.shots.length; k++) {
        const tr = sb.shots[k].transition, F = tr === "fade" ? FADE : tr === "zoom" || tr === "whip" ? ZFADE : 0; if (!F) continue;
        const c = ranges[k].a;
        if (f >= c - F / 2 && f < c + F / 2) return [{ id: k, alpha: 1 }, { id: k + 1, alpha: (f - (c - F / 2) + 1) / (F + 1) }];
      }
      const k = ranges.findIndex((r) => f >= r.a && f < r.b);
      return [{ id: (k < 0 ? ranges.length - 1 : k) + 1, alpha: 1 }];
    },
  };
  // an actor's anchors (head, crown, hands) in the world, from the pose actually drawn this frame
  const anchorOf = (cam: CamInfo, L: Look, p: V3, an: Anchors, mirror: boolean): ActorAnchor => {
    const w = (q: [number, number]) => cardPoint(cam.pos, p[0], p[1], p[2], q, 1, mirror);
    return { head: w(an.head), crown: w(an.crown), headR: [an.headR[0] * SU, an.headR[1] * SU], rot: mirror ? -an.headRot : an.headRot,
      hands: an.hands.map((h) => ({ p: w(h.p), raised: h.raised, side: mirror ? -h.side : h.side, kind: h.kind })), chest: w(an.chest), floor: p, mirror, gesture: an.gesture };
  };
  const neutral = new Map<string, Anchors>();
  const director: Director = (shot, f, cam, _built, out) => {
    out.anchors ??= new Map();
    const s = sb.shots[shot.id - 1], t = f / FPS, t0 = ranges[shot.id - 1].a / FPS, tt = t - t0;
    const posOf = new Map(s.actors.map((a) => [a.who, actorPos(s.set, a, tt)]));
    // the card's right (CardLayer turns cards toward the camera position): screen sides, slides and reaches
    const rightAt = (p: V3): [number, number] => { const yaw = Math.atan2(cam.pos.x - p[0], cam.pos.z - p[2]); return [Math.cos(yaw), -Math.sin(yaw)]; };
    const lateral = (from: V3, to: V3) => { const [rx, rz] = rightAt(from); return (to[0] - from[0]) * rx + (to[2] - from[2]) * rz; };
    // body motion first: a stagger slides the actor, so everyone else reacts to where they really are
    const motion = new Map(s.actors.map((a) => {
      const p = posOf.get(a.who)!;
      const m = motionAt(a.moves, tt, (mv) => mv.dir ?? (mv.away && posOf.get(mv.away) ? -Math.sign(lateral(p, posOf.get(mv.away)!) || 1) : 1));
      if (m.slide || m.hop) { const [rx, rz] = rightAt(p); posOf.set(a.who, [p[0] + rx * m.slide, p[1] + m.hop, p[2] + rz * m.slide]); }
      return [a.who, m];
    }));
    for (const a of s.actors) {
      const L = lookOf(sb.cast[a.who]), seed = seedOf(a.who), p = posOf.get(a.who)!;
      // the acting at shot time tq (pure): base act + beats, held item, idle life, talking, nods / shakes, reach, drive,
      // body motion. Used for now and, for gesture easing, for the frames just before
      const actingAt = (tq: number) => {
        const tqa = t0 + tq;
        const { base, held } = basePoseAt(a, tq);
        const swaps = (a.beats ?? []).map((x) => t0 + (x.t ?? 0));
        const life = { ...idle(tqa, seed, a.idle ?? 1), blink: lidAt(tqa, seed, swaps) };
        // voiced lines: the mouth follows the narration's word timings; otherwise the stand-in talking rhythm
        const talking = a.speech?.length ? speakAt(tq, a.speech, seed)
          : (a.talk ?? []).map(([x, y]) => talkAt(tqa, t0 + x, t0 + y, seed, (base.expr as Expr) ?? "talk")).find((x) => Object.keys(x).length) ?? {};
        // a speaker keeps an authored action gesture (thumbs up, pointing, holding, tickling...): the mouth talks, the
        // hands keep doing what the storyboard asked for
        if (talking.gesture && base.gesture && KEEP_WHILE_TALKING.includes(base.gesture)) delete talking.gesture;
        const nodTilt = (a.nod ?? []).reduce((acc: number, x) => acc + nodAt(tqa, t0 + (x as number), 2), 0);
        const shook = (a.shake ?? []).map((x) => shakeAt(tqa, t0 + (x as number))).find((x) => Object.keys(x).length) ?? {};
        return { base, held, life, talking, nodTilt, shook };
      };
      const { base, held, life, talking } = actingAt(tt);
      // facing: explicit, or toward the nearest other actor
      let facing: -1 | 0 | 1 = 0;
      if (a.facing === undefined || (typeof a.facing === "string" && a.facing.startsWith("toward:"))) {
        const target = typeof a.facing === "string" ? posOf.get(a.facing.slice(7)) : [...posOf.entries()].filter(([w]) => w !== a.who).map(([, q]) => q).sort((m, n) => Math.hypot(m[0] - p[0], m[2] - p[2]) - Math.hypot(n[0] - p[0], n[2] - p[2]))[0];
        if (target) facing = faceToward(cam.right.x, cam.right.z, [p[0], p[2]], [target[0], target[2]]);
      } else if (typeof a.facing === "number") facing = a.facing;
      const walking = a.walk && tt >= a.walk.t0 && tt <= a.walk.t1;
      const walkDir = a.walk ? (() => { const p1 = whereOf(s.set, a.walk!.to), p0 = whereOf(s.set, a.at); return (p1[0] - p0[0]) * cam.right.x + (p1[2] - p0[2]) * cam.right.z; })() : 0;
      // just arrived from a profile walk: a quarter-second three-quarter view toward the walk, not an instant swap
      if (a.walk && tt > a.walk.t1 && tt < a.walk.t1 + WALK_TURN && Math.abs(walkDir) > 0.05) facing = walkDir > 0 ? 1 : -1;
      if (walking) {
        const p0 = whereOf(s.set, a.at), dist = Math.hypot(p[0] - p0[0], p[2] - p0[2]);
        const dirScreen = walkDir;
        out.places.push(lookCard(cam, L, p[0], p[1], p[2], { side: { mode: a.walk!.mode ?? "walk", phase: dist / (a.walk!.mode === "run" ? 2.08 : 1.47), ...(held ? { hold: held } : {}), expr: (talking.expr ?? base.expr ?? "neutral") as Expr, blink: life.blink }, mirror: dirScreen < 0 }));
        // profile walk: the front rig in the same stride approximates where the head and hands are
        out.anchors.set(a.who, { ...anchorOf(cam, L, p, anchorsFront(L, { mode: a.walk!.mode === "run" ? "run" : "walk", phase: dist / 1.47 }), dirScreen < 0), walking: true });
      } else {
        const mo = motion.get(a.who)!, extra: Partial<Pose> = {};
        // a reach: for another actor the hands land on their flank (tickle) or meet theirs half-way (offer, write); for
        // a story prop they go to its middle, just over its top (grab into a chest, block a grab). Target's screen side
        Object.assign(extra, reachExtra(s, a, p, tt, lateral, (w) => posOf.get(w), [cam.pos.x, cam.pos.y, cam.pos.z], basePoseAt(a, tt).base.gesture === "write"));
        if (a.drive) extra.drive = driveOf(a)(tt);
        const build = (x: ReturnType<typeof actingAt>, tq: number) => layer(x.base, x.life, x.talking, x.shook, { headTilt: x.nodTilt, facing, back: a.back, t: t0 + tq, ...(x.held ? { hold: x.held } : {}), ...extra });
        // gesture easing: if the arms' configuration changed recently, blend from what the frame before the change
        // really drew (itself possibly mid-blend). The easing time grows with how far the hands travel (EASE for small
        // changes, up to EASE_MAX, so a hand never moves faster than HAND_SPEED m/s). Pure: built from exact earlier
        // frame times only, so every render chunk draws the same frame
        const memo = new Map<number, Pose>();
        const eased = (fq: number, depth = 0): Pose => {
          const hit = memo.get(fq); if (hit) return hit;
          const tq = fq / FPS, raw = build(actingAt(tq), tq), key = armKey(raw);
          let out = raw;
          for (let k = 1; sb.ease !== false && depth < 4 && k <= Math.ceil(EASE_MAX * FPS); k++) {
            if (fq - k < 0) break;
            const before = build(actingAt((fq - k) / FPS), (fq - k) / FPS);
            if (armKey(before) === key) continue;
            if ((before.mode ?? "stand") === (raw.mode ?? "stand")) {
              const from = eased(fq - k, depth + 1);
              const ha = anchorsFront(L, raw).hands, hb = anchorsFront(L, from).hands;
              const d = Math.max(0, ...ha.map((h) => { const q = hb.find((x) => x.side === h.side); return q ? Math.hypot(h.p[0] - q.p[0], h.p[1] - q.p[1]) * SU : 0; }));
              const dur = Math.min(EASE_MAX, Math.max(EASE, (1.5 * d) / HAND_SPEED)), el = (k - 0.5) / FPS;
              if (el < dur) out = { ...raw, blend: { from, k: smooth(el / dur) } };
            }
            break;
          }
          memo.set(fq, out);
          return out;
        };
        // the drawn pose IS the eased pose at this frame's exact time: building it from the unrounded shot time instead
        // could put a beat that falls on a frame boundary on the other side of the change (the new pose drawn without
        // its blend for one frame: an arm snap)
        const pose0: Pose = eased(Math.round(tt * FPS));
        const pose: Pose = mo.tilt || mo.headTilt || mo.shrug ? { ...pose0, tilt: (pose0.tilt ?? 0) + mo.tilt, headTilt: (pose0.headTilt ?? 0) + mo.headTilt, shrug: (pose0.shrug ?? 0) + mo.shrug } : pose0;
        out.places.push(lookCard(cam, L, p[0], p[1], p[2], { pose }));
        out.anchors.set(a.who, anchorOf(cam, L, p, anchorsFront(L, pose), false));
      }
      contactShadow(out, cam.sun, shot.light, p[0], p[1], p[2]);
    }
    // effects sit beside the head on the side facing the frame centre (a character right of centre gets it on the left;
    // a centred one always on the right, so the mark never jumps sides while the camera moves)
    // the explainer diagram: a card beside the presenter at head height, steps on their words
    if (s.diagram) { const m = diagramMark(s); if (m) out.fx.push(diagramCard(s.diagram.kind, m[0], m[1] + diagramY(s), m[2], s.diagram.size ?? 0.95, tt, (s.diagram.steps ?? []).map((x) => x.t ?? 0))); }
    // marks follow the head: the mark sits where it would beside a standing head, moved by how far the drawn head is
    // from its standing position (leaning, laughing, tilting, sitting, jumping); dizzy stars orbit the crown itself
    for (const fx of s.fx ?? []) {
      const p = posOf.get(fx.on), an = out.anchors.get(fx.on); if (!p) continue;
      const t1 = t0 + (fx.t ?? 0), life = fx.life ?? (HALO_KINDS.includes(fx.kind) ? 2.2 : 1.6);
      if (an && HALO_KINDS.includes(fx.kind)) { const c = fxHalo(cam, fx.kind, an.crown, an.headR[0], an.rot, t, t1, life); if (c) out.fx.push(c); continue; }
      let m: V3 = p;
      if (an) {
        const L = lookOf(sb.cast[fx.on]);
        let n0 = neutral.get(fx.on); if (!n0) { n0 = anchorsFront(L, {}); neutral.set(fx.on, n0); }
        const ref = cardPoint(cam.pos, p[0], p[1], p[2], n0.head, 1, an.mirror);
        m = [p[0] + an.head[0] - ref[0], p[1] + an.head[1] - ref[1], p[2] + an.head[2] - ref[2]];
      }
      const x = (p[0] - cam.pos.x) * cam.right.x + (p[2] - cam.pos.z) * cam.right.z;
      const c = fxNear(cam, fx.kind, m, t, t1, life, fx.side ?? (x > 0.3 ? -1 : 1)); if (c) out.fx.push(c);
    }
  };
  return { total, shots, timeline, director, timing, notes };
};
