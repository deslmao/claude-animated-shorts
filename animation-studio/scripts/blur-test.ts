// Camera motion blur tests (2.0 blur correction). Fast, no rendering:
//  1. films approved before the correction keep their exact blur schedule (a fingerprint of every frame's shutter)
//  2. controlled blur: a whip / zoom-through smears heavily only on its rushing frames, then lands; faces, inserts
//     and framed glides stay under their smear caps; nothing exceeds the rush cap
// The render-side fix (depth of field before motion blur, so the lens passes never read the depth they overwrite) is
// measured by scripts/blur-check.mjs on real frames.
import "./lib/dom-stub";
import fs from "node:fs";
import { STORIES } from "../src/studio/stories";
import { compile, SMEAR_CAP, RUSH_OUT, RUSH_IN, RUSH_RAMP } from "../src/studio/story/compile";
import { NARRATION } from "../src/studio/stories/voice";
import type { Storyboard } from "../src/studio/story/types";
const proc = (globalThis as unknown as { process: { argv: string[]; exit(n: number): void } }).process;

let fails = 0;
const check = (ok: boolean, msg: string) => { console.log(`${ok ? "ok  " : "FAIL"}  ${msg}`); if (!ok) fails++; };
const SNAP = "tests/blur-snapshot.json";
type Sh = { a: number; b: number; shutter?: number | ((f: number) => number); shutterCap?: (f: number) => number };
const exp = (s: Sh, f: number) => (typeof s.shutter === "function" ? s.shutter(f) : s.shutter ?? 0);

// 1. approved films: unchanged schedules
const snap: Record<string, string> = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, "utf8")) : {};
const now: Record<string, string> = {};
for (const sb of STORIES.filter((x) => x.motionBlur && !x.controlledBlur)) {
  const film = compile(sb, NARRATION[sb.id]);
  let h = 0;
  let capped = false;
  for (const s of film.shots as Sh[]) { if (s.shutterCap) capped = true; for (let f = s.a; f < s.b; f++) h = (h * 31 + Math.round(exp(s, f) * 1e4)) >>> 0; }
  check(!capped, `${sb.id}: no smear caps (old behaviour)`);
  now[sb.id] = h.toString(16);
  if (snap[sb.id]) check(snap[sb.id] === now[sb.id], `${sb.id}: blur schedule identical to the approved film`);
  else console.log(`note  ${sb.id}: blur schedule recorded (${now[sb.id]})`);
}
if (proc.argv.includes("--update") || Object.keys(snap).length === 0) fs.writeFileSync(SNAP, JSON.stringify({ ...snap, ...now }, null, 1) + "\n");

// 2. controlled blur on a real storyboard with whips, glides, inserts and flights (Pirate Democracy's shots)
const P = STORIES.find((x) => x.id === "pirate-democracy")!;
const sb: Storyboard = { ...P, id: "blur-test", controlledBlur: true };
const film = compile(sb, NARRATION["pirate-democracy"]);
const shots = film.shots as Sh[];
let maxCap = 0, heavyRuns: number[] = [], run = 0;
for (const s of shots) for (let f = s.a; f < s.b; f++) {
  const cap = s.shutterCap!(f); maxCap = Math.max(maxCap, cap);
  if (cap > SMEAR_CAP.flight) run++; else if (run) { heavyRuns.push(run); run = 0; }
}
if (run) heavyRuns.push(run);
check(shots.every((s) => !!s.shutterCap), "controlled: every shot has a smear cap");
check(maxCap <= SMEAR_CAP.rush + 1e-9, `controlled: no smear longer than the rush cap (${maxCap.toFixed(1)} <= ${SMEAR_CAP.rush} px)`);
// a whip transition = up to RUSH_OUT + RUSH_RAMP heavy frames out + RUSH_IN + RUSH_RAMP in, back to back
const limit = RUSH_OUT + RUSH_RAMP + RUSH_IN + RUSH_RAMP;
check(heavyRuns.every((n) => n <= limit), `controlled: heavy smear runs are short (longest ${Math.max(...heavyRuns)} frames <= ${limit}; old schedule ~24)`);
// faces / inserts / framed glides away from any rush keep their small caps
const sbShots = sb.shots;
let readable = 0, readableOk = 0;
shots.forEach((s, k) => {
  const prevWhip = ["whip", "zoom"].includes(sbShots[k].transition ?? ""), nextWhip = ["whip", "zoom"].includes(sbShots[k + 1]?.transition ?? "");
  for (let f = s.a + (prevWhip ? RUSH_IN + RUSH_RAMP : 0); f < s.b - (nextWhip ? RUSH_OUT + RUSH_RAMP : 0); f++) {
    const cap = s.shutterCap!(f); if (cap > SMEAR_CAP.framed) continue; // flights and in-shot whips
    readable++; if (cap <= SMEAR_CAP.framed && exp(s, f) <= 0.5 * 0.35 + 1e-9) readableOk++;
  }
});
check(readable > 1000 && readable === readableOk, `controlled: ${readableOk}/${readable} readable frames (faces, inserts, glides) keep a short exposure and a <= ${SMEAR_CAP.framed} px smear`);
console.log(fails ? `\n${fails} blur check(s) FAILED` : "\nmotion blur schedules ok");
proc.exit(fails ? 1 : 0);
