// Engine 4, Phase 2: the camera layer. It sits ON TOP of the existing controller (camera/keys.ts: key lists, glides, creeping
// holds, flip-sign kicks; camera/moves.ts: named moves) and changes nothing there for engine <= 3.
//   - lenses in millimetres (24-35 wide, 50 normal, 85 close-up) -> vertical fov and lens blur
//   - a subtle hand-held drift on every Engine 4 shot (applied in SetWorld for sets that carry `e4`)
//   - impact shakes use the existing `kicks` (7 frames, decaying, flip-sign), inside the 5-10 frame brief
import type { Cam, V3 } from "../camera/keys";

/** vertical field of view (degrees) of a lens of `mm` millimetres on a 24 mm tall sensor (the same sensor the Blender look-dev uses) */
export const fovMm = (mm: number) => (360 / Math.PI) * Math.atan(12 / mm);
/** lens blur (cInf, px at 1080 wide) for a lens: 24-35 mm deep focus, 50 mm gentle, 85 mm shallow (the engine's blur caps at 24) */
export const blurMm = (mm: number) => Math.round(Math.max(0, Math.min(20, (mm - 30) * 0.3)) * 10) / 10;
/** the lens a vertical fov corresponds to (for reports) */
export const mmOfFov = (fov: number) => 12 / Math.tan((fov * Math.PI) / 360);

/** a smooth, deterministic noise in -1..1 (sum of three sines at unrelated rates): a pure function of frame and seed */
const wob = (f: number, seed: number, rate: number) => (Math.sin(f * 0.071 * rate + seed * 1.7) * 0.5 + Math.sin(f * 0.113 * rate + seed * 4.1) * 0.3 + Math.sin(f * 0.197 * rate + seed * 2.3) * 0.2);

/** hand-held drift: the camera floats a few millimetres and the aim a few arc-minutes, slightly more on long lenses (they magnify the
 *  wobble). `amp` scales it (1 = the default breath). Returns the camera unchanged for amp 0 */
export const handheld = (c: Cam, f: number, seed = 0, amp = 1): Cam => {
  if (!amp) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d) || 1, h = Math.hypot(d[0], d[2]) || 1;
  const rx = d[2] / h, rz = -d[0] / h;                                  // the camera's right on the floor plane
  const tele = Math.max(0.7, Math.min(1.8, mmOfFov(c.fov) / 40));       // longer lens, bigger apparent shake
  const a = amp * 0.006 * Math.min(1, 0.4 + L / 6);                     // position drift (m)
  const px = wob(f, seed, 1) * a, py = wob(f, seed + 3, 0.8) * a * 0.7, pz = wob(f, seed + 7, 0.9) * a * 0.6;
  const ang = amp * 0.0016 * tele * L;                                  // aim drift as a distance at the look point (m)
  const lx = wob(f, seed + 11, 1.1) * ang, ly = wob(f, seed + 17, 0.9) * ang * 0.7;
  return {
    pos: [c.pos[0] + rx * px + d[0] / L * pz, c.pos[1] + py, c.pos[2] + rz * px + d[2] / L * pz],
    look: [c.look[0] + rx * lx, c.look[1] + ly, c.look[2] + rz * lx], fov: c.fov, roll: c.roll + wob(f, seed + 23, 0.7) * 0.0035 * amp,
  };
};
