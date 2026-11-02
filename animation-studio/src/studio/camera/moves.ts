// Named camera moves (stage 1D) on top of the creator's grammar (keys.ts: glides, creeping holds, flip kicks) and
// shot fitting (framing.ts). A move aims at marks, not coordinates, so it works in every set. Every move creeps (the
// reference never holds a dead-still frame) and returns its lens blur from the measured table (motion.md / depth.md).
import { Key, Shot, V3, dolly, pushK, glide, clamp01 } from "./keys";
import { fitShot, ShotSize } from "./framing";
import type { View } from "../sets/types";

/** lens blur (cInf px at 1080) by shot size: wides sharp, MS ~10, CU 12-14 (creator's measured table) */
export const DOF_BY_SIZE: Record<ShotSize, number> = { wide: 0, full: 5, medium: 10, close: 13, extreme: 15 };
const eye = (m: V3): V3 => [m[0], m[1] + 1.55, m[2]];
const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const toShot = (c: { pos: V3; look: V3; fov: number; roll: number }, extra: Partial<Shot> = {}): Shot => ({ pos: c.pos, look: c.look, fov: c.fov, roll: c.roll, ...extra });

export type Move =
  | { move: "view"; view: View; creep?: number }                                                           // a set's designed view, creeping in
  | { move: "establish"; view: View }                                                                      // slow creep on a wide
  | { move: "pushIn"; marks: V3[]; from?: number; height?: number; size?: ShotSize; to?: ShotSize; fov?: number }  // glide from one size to a tighter one
  | { move: "pullOut"; marks: V3[]; from?: number; height?: number; size?: ShotSize; to?: ShotSize; fov?: number } // reveal
  | { move: "frame"; marks: V3[]; size?: ShotSize; from?: number; height?: number; fov?: number; roll?: number; creep?: number }
  | { move: "closeUp"; mark: V3; from?: number; height?: number; punch?: boolean }
  | { move: "lowHero"; mark: V3; from?: number }
  | { move: "highAngle"; marks: V3[]; from?: number }
  | { move: "overShoulder"; over: V3; at: V3; side?: -1 | 1 }
  | { move: "orbit"; marks: V3[]; fromDeg: [number, number]; size?: ShotSize; height?: number }
  | { move: "crane"; marks: V3[]; heights: [number, number]; size?: ShotSize; from?: number }
  | { move: "follow"; track: (t: number) => V3; size?: ShotSize; from?: number; height?: number }
  | { move: "dutch"; marks: V3[]; size?: ShotSize; from?: number; roll?: number };

export type ShotPlan = { key: Key; dof: (f: number) => { cInf: number; focus?: V3 } };

/** turn a move into a camera key starting at frame f0 lasting until f1 (dur = glide-in frames from the previous shot;
 *  cut = jump). Moves with a start / end state (pushIn, orbit, crane...) travel with the creator's smootherstep. */
export const plan = (m: Move, f0: number, f1: number, o: { cut?: boolean; dur?: number } = {}): ShotPlan => {
  const u = (f: number) => glide((f - f0) / Math.max(1, f1 - f0));
  const creep = (f: number, rate = 0.0022) => pushK(f, f0, rate);
  const k = (s: (f: number) => Shot, cInf: number | ((f: number) => number), focus?: V3): ShotPlan =>
    ({ key: { f: f0, cut: o.cut, dur: o.dur, s }, dof: (f) => ({ cInf: typeof cInf === "number" ? cInf : cInf(f), focus }) });
  switch (m.move) {
    case "view": case "establish": {
      const v = m.view, rate = m.move === "establish" ? 0.0015 : m.creep ?? 0.0022;
      return k((f) => dolly(v.pos, v.look, creep(f, rate), { fov: v.fov ?? 40, roll: v.roll ?? 0 }), v.cInf ?? 0, v.focus);
    }
    case "frame": {
      const c = fitShot(m.marks, { size: m.size ?? "medium", from: m.from, height: m.height, fov: m.fov, roll: m.roll });
      return k((f) => dolly(c.pos, c.look, creep(f, m.creep ?? 0.0022), { fov: c.fov, roll: c.roll }), DOF_BY_SIZE[m.size ?? "medium"], eye(m.marks[0]));
    }
    case "pushIn": case "pullOut": {
      const a = fitShot(m.marks, { size: m.size ?? (m.move === "pushIn" ? "full" : "close"), from: m.from, height: m.height, fov: m.fov });
      const b = fitShot(m.marks, { size: m.to ?? (m.move === "pushIn" ? "close" : "wide"), from: m.from, height: m.height, fov: m.fov });
      return k((f) => toShot({ pos: lerp3(a.pos, b.pos, u(f)), look: lerp3(a.look, b.look, u(f)), fov: a.fov, roll: 0 }),
        (f) => DOF_BY_SIZE[m.size ?? (m.move === "pushIn" ? "full" : "close")] * (1 - u(f)) + DOF_BY_SIZE[m.to ?? (m.move === "pushIn" ? "close" : "wide")] * u(f), eye(m.marks[0]));
    }
    case "closeUp": {
      const c = fitShot([m.mark], { size: "close", from: m.from ?? 0, height: m.height ?? m.mark[1] + 1.5, fov: 34 });
      return k((f) => dolly(c.pos, c.look, pushK(f, f0, 0.003, m.punch ? 0.007 : 0, 30), { fov: 34 }), DOF_BY_SIZE.close, eye(m.mark));
    }
    case "lowHero": {
      const c = fitShot([m.mark], { size: "medium", from: m.from ?? 10, height: m.mark[1] + 0.75, fov: 38, roll: 0.045 });
      return k((f) => dolly(c.pos, c.look, creep(f, 0.0025), { fov: 38, roll: 0.045 }), 12, eye(m.mark));
    }
    case "highAngle": {
      const c = fitShot(m.marks, { size: "wide", from: m.from ?? 0, height: m.marks[0][1] + 5.5, fov: 42 });
      return k((f) => dolly(c.pos, c.look, creep(f, 0.0015), { fov: 42 }), 0);
    }
    case "overShoulder": {
      // camera just behind and beside the near character's shoulder, looking at the far one's face
      const s = m.side ?? 1, dx = m.at[0] - m.over[0], dz = m.at[2] - m.over[2], L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L;
      const pos: V3 = [m.over[0] - ux * 0.9 - uz * 0.55 * s, m.over[1] + 1.62, m.over[2] - uz * 0.9 + ux * 0.55 * s];
      const look: V3 = [m.at[0], m.at[1] + 1.45, m.at[2]];
      return k((f) => dolly(pos, look, creep(f, 0.002), { fov: 36 }), 11, eye(m.at));
    }
    case "orbit": {
      return k((f) => toShot(fitShot(m.marks, { size: m.size ?? "medium", from: m.fromDeg[0] + (m.fromDeg[1] - m.fromDeg[0]) * clamp01((f - f0) / Math.max(1, f1 - f0)), height: m.height })), DOF_BY_SIZE[m.size ?? "medium"], eye(m.marks[0]));
    }
    case "crane": {
      return k((f) => toShot(fitShot(m.marks, { size: m.size ?? "full", from: m.from, height: m.heights[0] + (m.heights[1] - m.heights[0]) * u(f) })), DOF_BY_SIZE[m.size ?? "full"] * 0.6);
    }
    case "follow": {
      return { key: { f: f0, cut: o.cut, dur: o.dur, s: (f) => toShot(fitShot([m.track(f / 30)], { size: m.size ?? "full", from: m.from, height: m.height })) },
        dof: (f) => ({ cInf: DOF_BY_SIZE[m.size ?? "full"], focus: eye(m.track(f / 30)) }) };
    }
    case "dutch": {
      const c = fitShot(m.marks, { size: m.size ?? "medium", from: m.from, roll: m.roll ?? 0.08 });
      return k((f) => dolly(c.pos, c.look, creep(f, 0.003), { fov: c.fov, roll: c.roll }), DOF_BY_SIZE[m.size ?? "medium"], eye(m.marks[0]));
    }
  }
};

/** rack focus: lens blur focus slides from mark a's eyes to mark b's over [f0, f0 + d] */
export const rackFocus = (a: V3, b: V3, f0: number, d = 14) => (f: number): V3 => lerp3(eye(a), eye(b), glide((f - f0) / d));
