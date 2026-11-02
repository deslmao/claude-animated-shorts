// Storyboard validator (stage 1E): catches mistakes before any render time is spent, and checks vertical framing.
// errors = the film would be wrong (unknown names, collisions, a subject's head out of frame); warnings = worth a look.
import * as THREE from "three";
import { SETS } from "../sets";
import { LAYOUTS } from "../sets/layouts";
import { LIGHTS } from "../look/lights";
import { CAST } from "../characters/cast";
import { ACT_NAMES, FACES, GESTURES } from "../characters/figure";
import { FX_KINDS } from "../fx/effects";
import { runKeys } from "../camera/keys";
import { compile, shotFrames, actorPos, FPS } from "./compile";
import type { Storyboard, Where } from "./types";

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

export const validate = (sb: Storyboard): Report => {
  const errors: string[] = [], warnings: string[] = [], framing: string[] = [];
  const total = sb.shots.reduce((s, x) => s + x.dur, 0);
  if (!sb.shots.length) errors.push("no shots");
  if (total < 10 || total > 75) warnings.push(`total length ${total.toFixed(1)} s (Shorts target 55-65 s)`);
  for (const [k, ref] of Object.entries(sb.cast)) if (typeof ref === "string" && !(ref in CAST)) errors.push(`cast "${k}": unknown lead "${ref}" (use ${Object.keys(CAST).join(", ")} or { extra: n })`);
  sb.shots.forEach((s, i) => {
    const at = `shot ${i + 1} (${s.set})`;
    if (!SETS[s.set]) { errors.push(`${at}: unknown set "${s.set}" (sets: ${Object.keys(SETS).join(", ")})`); return; }
    if (s.dur < 0.6) errors.push(`${at}: too short (${s.dur} s)`);
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
      for (const b of a.beats ?? []) if (b.t < 0 || b.t > s.dur) warnings.push(`${at}: ${a.who}: beat at ${b.t} s is outside the shot (0-${s.dur} s)`);
      for (const [x, y] of a.talk ?? []) if (x < 0 || y > s.dur + 0.01 || y <= x) warnings.push(`${at}: ${a.who}: talk span ${x}-${y} s outside the shot`);
      if (a.walk && (a.walk.t1 > s.dur + 0.01 || a.walk.t1 <= a.walk.t0)) warnings.push(`${at}: ${a.who}: walk ${a.walk.t0}-${a.walk.t1} s outside the shot`);
    }
    for (const fx of s.fx ?? []) {
      if (!FX_KINDS.includes(fx.kind)) errors.push(`${at}: unknown effect "${fx.kind}"`);
      if (!seen.has(fx.on)) errors.push(`${at}: effect on "${fx.on}" who is not in the shot`);
      if (fx.t < 0 || fx.t > s.dur) warnings.push(`${at}: effect at ${fx.t} s is outside the shot`);
    }
    const names = "on" in s.camera ? (Array.isArray(s.camera.on) ? s.camera.on : [s.camera.on]) : s.camera.move === "overShoulder" ? [s.camera.over, s.camera.at] : [];
    for (const n of names) if (!seen.has(n)) errors.push(`${at}: camera aims at "${n}" who is not in the shot`);
    if ((s.camera.move === "view" || s.camera.move === "establish") && !LAYOUTS[s.set].views.some((v) => v.name === (s.camera as { view: string }).view)) errors.push(`${at}: set has no view "${(s.camera as { view: string }).view}"`);
  });
  if (errors.length) return { errors, warnings, framing };
  // framing: solve the camera at the start, middle and end of each shot and check the subjects' heads are in frame
  const film = compile(sb), ranges = shotFrames(sb);
  sb.shots.forEach((s, i) => {
    const c = s.camera, subj = c.move === "overShoulder" ? [c.at] : "on" in c ? (Array.isArray(c.on) ? c.on : [c.on]) : [];
    const { a, b } = ranges[i], fails: string[] = [];
    for (const f of [a, Math.round((a + b) / 2), b - 1]) {
      const cm = runKeys(film.shots[i].keys, f), cam = new THREE.PerspectiveCamera(cm.fov, 9 / 16, 0.05, 3000);
      cam.position.set(...cm.pos); cam.up.set(0, 1, 0); cam.lookAt(...cm.look); cam.rotateZ(cm.roll); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      for (const who of subj) { const act = s.actors.find((x) => x.who === who)!; if (!headIn(cam, actorPos(s.set, act, (f - a) / FPS))) fails.push(`${who} @${((f - a) / FPS).toFixed(1)}s`); }
    }
    const line = `shot ${String(i + 1).padStart(2)} ${s.set.padEnd(9)} ${c.move.padEnd(12)} subjects: ${subj.join(", ") || "(place shot)"}`;
    if (fails.length) { errors.push(`shot ${i + 1}: subject head out of frame: ${fails.join(", ")}`); framing.push(`${line}  -> FAIL (${fails.join(", ")})`); }
    else framing.push(`${line}  -> ok`);
  });
  return { errors, warnings, framing };
};
