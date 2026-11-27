// Engine 4 motion check (analytic, no rendering): validates one storyboard and reports, from the camera itself (key list + hand-held
// drift + impact kicks, exactly as SetWorld poses it): the visual-change rhythm, lenses and blur per shot, camera speed per frame,
// frozen frames, and the impact shakes.   npm run e4-pace -- <storyId>
import "./lib/dom-stub";
declare const process: { argv: string[]; exit(n: number): never };
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import { validate } from "../src/studio/story/validate";
import { compile } from "../src/studio/story/compile";
import { paceOf } from "../src/studio/engine4/pacing";
import { handheld, mmOfFov } from "../src/studio/engine4/camera";
import { ROOM } from "../src/studio/engine4/kitchen";
import { runKeys, withKick, kickAt } from "../src/studio/camera/keys";

const id = process.argv[2], found = STORIES.find((s) => s.id === id);
if (!found) { console.error("usage: npm run e4-pace -- <storyId>"); process.exit(1); }
const sb = found!;
const r = validate(sb, NARRATION[sb.id]), film = compile(sb, NARRATION[sb.id]), pc = paceOf(film.timing.sb), FPS = 30;
console.log(`${sb.id}: ${film.total} frames, ${(film.total / FPS).toFixed(2)} s, engine ${sb.engine}`);
for (const e of r.errors) console.log("  ERROR  ", e);
for (const w of r.warnings) console.log("  warning", w);
console.log(`pacing: ${pc.events.length} visual changes at ${pc.events.map((e) => e.toFixed(2)).join(", ")} s; average every ${pc.average.toFixed(2)} s (target 1.5-2.0); longest hold ${pc.longestGap.seconds.toFixed(2)} s (shot ${pc.longestGap.shot}); flat-card holds over 2.5 s: ${pc.flatHolds.length}`);
const outShots: Record<number, number> = {}, seen: Record<number, number> = {}; let outside = 0, frozen = 0, shakeFrames = 0, prev: ReturnType<typeof withKick> | null = null;
const hand = sb.engine === 4;
for (const s of film.shots) {
  let vmax = 0, vmean = 0, n = 0, maxDeg = 0, kick = 0;
  const kf = new Set<number>();
  for (const [t] of s.kicks ?? []) for (let i = 0; i < 7; i++) kf.add(Math.round(t * FPS) + i);
  for (let f = s.a; f < s.b; f++) {
    const base = runKeys(s.keys, f), c = withKick(hand ? handheld(base, f, s.id) : base, kickAt(s.kicks ?? [], f / FPS));
    if (prev && f > s.a) {
      const v = Math.hypot(c.pos[0] - prev.pos[0], c.pos[1] - prev.pos[1], c.pos[2] - prev.pos[2]) * FPS;
      const d = (c0: typeof c, c1: typeof c) => { const u = [c0.look[0] - c0.pos[0], c0.look[1] - c0.pos[1], c0.look[2] - c0.pos[2]], w = [c1.look[0] - c1.pos[0], c1.look[1] - c1.pos[1], c1.look[2] - c1.pos[2]]; return Math.acos(Math.max(-1, Math.min(1, (u[0] * w[0] + u[1] * w[1] + u[2] * w[2]) / (Math.hypot(...u) * Math.hypot(...w))))) * 180 / Math.PI * FPS; };
      const w = d(prev, c), dz = Math.abs(c.fov - prev.fov);
      vmax = Math.max(vmax, v); vmean += v; n++; maxDeg = Math.max(maxDeg, w);
      if (v < 0.002 && w < 0.02 && dz < 0.002 && Math.abs(c.roll - prev.roll) < 1e-5) frozen++;
      if (kf.has(f)) { shakeFrames++; kick = Math.max(kick, w); }
    }
    if (s.set === "e4Kitchen" && (c.pos[0] < ROOM.x0 || c.pos[0] > ROOM.x1 || c.pos[2] < ROOM.z0 || c.pos[2] > ROOM.z1 || c.pos[1] < ROOM.y0 || c.pos[1] > ROOM.y1)) { outside++; (outShots[s.id] = (outShots[s.id] ?? 0) + 1); if (!seen[s.id]) { seen[s.id] = 1; console.log(`  shot ${s.id} outside at frame ${f}: pos ${c.pos.map((v) => v.toFixed(2)).join(",")}`); } }
    prev = c;
  }
  const c0 = runKeys(s.keys, s.a), c1 = runKeys(s.keys, s.b - 1);
  console.log(`  shot ${s.id}  frames ${s.a}-${s.b - 1}  lens ${mmOfFov(c0.fov).toFixed(0)}->${mmOfFov(c1.fov).toFixed(0)} mm  blur ${s.dof(s.a).cInf.toFixed(1)}px  speed mean ${(vmean / Math.max(1, n)).toFixed(3)} max ${vmax.toFixed(3)} m/s  aim max ${maxDeg.toFixed(1)} deg/s  hand-held ${hand ? "on" : "off"}  shake frames ${kf.size}${kf.size ? ` (peak aim ${kick.toFixed(0)} deg/s)` : ""}`);
}
console.log(`frozen camera frames (no position, aim, lens or roll change): ${frozen} of ${film.total}`);
console.log(`camera frames outside the room: ${outside}${outside ? " (shots " + Object.entries(outShots).map(([k, v]) => `${k}:${v}`).join(", ") + ")" : ""}`);
if (r.errors.length || frozen || outside) process.exit(1);
