// Shot fitting: frame characters standing on marks in a 9:16 frame. Give the marks, a shot size, the direction the
// camera looks from and its height; get a camera (pos / look / fov) whose frame holds every subject with headroom.
// Uses three.js' own projection, so what fits here fits in the render. Basis for the named camera moves (stage 1D).
import * as THREE from "three";
import type { V3 } from "./keys";

export type ShotSize = "wide" | "full" | "medium" | "close" | "extreme";
/** vertical extent framed per size (metres above the floor) and margins */
const SIZE: Record<ShotSize, { y0: number; y1: number; margin: number }> = {
  wide: { y0: -0.6, y1: 2.6, margin: 0.18 },     // full body + room around
  full: { y0: -0.15, y1: 2.15, margin: 0.1 },    // full body, feet to just above the head
  medium: { y0: 0.8, y1: 2.05, margin: 0.08 },   // hips up
  close: { y0: 1.12, y1: 2.0, margin: 0.06 },    // head + shoulders
  extreme: { y0: 1.32, y1: 1.92, margin: 0.03 }, // face
};
export type FitOpts = {
  /** camera looks from this side: horizontal angle in degrees (0 = camera south of the marks looking north / -z,
   *  90 = camera east looking west, -90 = camera west looking east) */
  from?: number; height?: number; fov?: number; roll?: number; size?: ShotSize; aspect?: number;
  /** subject half width (m) and height (m) */
  halfWidth?: number; tall?: number;
  /** frame up to this height above the floor too (something above the subjects' heads: a diagram, a sign) */
  top?: number;
};

export const fitShot = (marks: V3[], o: FitOpts = {}): { pos: V3; look: V3; fov: number; roll: number } => {
  const size = SIZE[o.size ?? "medium"], fov = o.fov ?? 40, aspect = o.aspect ?? 9 / 16, roll = o.roll ?? 0;
  const W = o.halfWidth ?? 0.36, tall = o.tall ?? 1.86;
  const a = THREE.MathUtils.degToRad(o.from ?? 0), dir = new THREE.Vector3(-Math.sin(a), 0, -Math.cos(a)); // camera -> subjects
  const floor = Math.min(...marks.map((m) => m[1]));
  const cx = marks.reduce((s, m) => s + m[0], 0) / marks.length, cz = marks.reduce((s, m) => s + m[2], 0) / marks.length;
  const y0 = floor + size.y0, y1 = o.top !== undefined ? floor + Math.max(o.top, Math.min(size.y1, tall + 0.2)) : floor + Math.min(size.y1, tall + 0.2);
  const lookY = (y0 + y1) / 2, look = new THREE.Vector3(cx, lookY, cz);
  const camH = o.height ?? lookY;
  const pts: THREE.Vector3[] = [];
  const right = new THREE.Vector3(-dir.z, 0, dir.x);
  for (const m of marks) for (const s of [-1, 1]) for (const y of [Math.max(y0, m[1]), Math.min(y1, m[1] + tall)]) pts.push(new THREE.Vector3(m[0], y, m[2]).addScaledVector(right, s * W));
  if (o.top !== undefined) for (const s of [-1, 1]) pts.push(new THREE.Vector3(cx, y1, cz).addScaledVector(right, s * W));
  const cam = new THREE.PerspectiveCamera(fov, aspect, 0.05, 3000);
  const fits = (d: number) => {
    cam.position.copy(look).addScaledVector(dir, -d).setY(camH);
    cam.up.set(0, 1, 0); cam.lookAt(look); cam.rotateZ(roll); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const lim = 1 - size.margin;
    return pts.every((p) => { const v = p.clone().project(cam); return v.z < 1 && Math.abs(v.x) <= lim && Math.abs(v.y) <= lim; });
  };
  let lo = 0.4, hi = 80;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  fits(hi);
  const p = cam.position;
  return { pos: [+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)], look: [+look.x.toFixed(3), +look.y.toFixed(3), +look.z.toFixed(3)], fov, roll };
};
