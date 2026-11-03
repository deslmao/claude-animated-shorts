// Crowds (stage 3C): `crowd: { count, era, ... }` on a shot fills the background with extras from the crowd generator
// (characters/cast.ts extra(i, era): the same index is always the same person). Spots are chosen on clear floor
// (sets/floor.gen.ts), inside the 9:16 frame, behind the main actors (never between them and the lens), clear of
// their marks and walk paths, at least 1.1 m apart. Deterministic: same storyboard, same crowd.
import * as THREE from "three";
import { runKeys, Key } from "../camera/keys";
import { clearAt } from "../sets/floor";
import type { ActorSpec, ShotSpec, V3, Where } from "./types";
import type { Act } from "../characters/figure";
import type { Era } from "../characters/cast";

export type CrowdSpec = {
  count: number;              // how many extras (fewer if the frame has no more clear floor; the validator says so)
  era?: Era;                  // modern (default), office, lab, fifties, victorian, medieval
  around?: Where;             // centre of the crowd area (default: the main actors' centre)
  radius?: number;            // metres around the centre (default 6)
  acts?: Act[];               // acting presets handed out in turn (default neutral, with idle life)
  seed?: number;              // which extras (default: per shot)
};

const h = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const placeCrowd = (s: ShotSpec, shotNo: number, keys: Key[], fMid: number, whereOf: (w: Where) => V3,
  rest: (a: ActorSpec) => V3[]): { actors: ActorSpec[]; cast: Record<string, { extra: number; era: Era }>; note?: string } => {
  const c = s.crowd!, era = c.era ?? "modern", seed = c.seed ?? shotNo * 17;
  const main = s.actors.filter((a) => !a.crowd);
  const pts = main.flatMap(rest);
  const centre: V3 = c.around !== undefined ? whereOf(c.around) : pts.length ? [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts[0][1], pts.reduce((s, p) => s + p[2], 0) / pts.length] : [0, 0, 0];
  const cm = runKeys(keys, fMid), cam = new THREE.PerspectiveCamera(cm.fov, 9 / 16, 0.05, 3000);
  cam.position.set(...cm.pos); cam.up.set(0, 1, 0); cam.lookAt(...cm.look); cam.rotateZ(cm.roll); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const dist = (p: V3) => Math.hypot(p[0] - cm.pos[0], p[2] - cm.pos[2]);
  const near = pts.length ? Math.min(...pts.map(dist)) : 0;
  const R = c.radius ?? 6, cand: { p: V3; score: number }[] = [];
  const leads = pts.map((q) => ({ x: new THREE.Vector3(q[0], q[1] + 1.0, q[2]).project(cam).x, d: dist(q) }));
  for (let x = -R; x <= R; x += 0.4) for (let z = -R; z <= R; z += 0.4) {
    if (x * x + z * z > R * R) continue;
    const p: V3 = [centre[0] + x, centre[1], centre[2] + z];
    if (dist(p) < near + 1.8) continue;                                        // well behind the cast, never in front
    if (pts.some((q) => Math.hypot(q[0] - p[0], q[2] - p[2]) < 1.0)) continue;  // clear of the cast and their paths
    const feet = new THREE.Vector3(p[0], p[1] + 0.2, p[2]).project(cam), head = new THREE.Vector3(p[0], p[1] + 1.9, p[2]).project(cam);
    if (feet.z > 1 || Math.abs(feet.x) > 0.9 || head.y > 0.97 || feet.y < -1.15) continue;  // in the frame (feet may be cropped)
    if (!clearAt(s.set, p[0], p[2], 0.35)) continue;                          // on clear floor
    // not standing directly behind a lead on screen (a background face peeking over a shoulder reads as clutter)
    if (leads.some((q) => Math.abs(q.x - feet.x) < 0.24 && dist(p) - q.d < 4)) continue;
    cand.push({ p, score: h(seed * 7.31 + x * 13.7 + z * 5.3) + 0.03 * Math.hypot(x, z) });
  }
  cand.sort((a, b) => a.score - b.score);
  const picked: V3[] = [];
  for (const { p } of cand) {
    if (picked.length >= c.count) break;
    if (picked.every((q) => Math.hypot(q[0] - p[0], q[2] - p[2]) >= 1.1)) picked.push(p);
  }
  const look = main[0]?.who;
  const actors: ActorSpec[] = picked.map((p, i) => ({
    who: `crowd${shotNo}_${i}`, at: p, crowd: true, act: c.acts?.length ? c.acts[i % c.acts.length] : "neutral",
    ...(look ? { facing: `toward:${look}` as const } : {}),
  }));
  const cast = Object.fromEntries(actors.map((a, i) => [a.who, { extra: seed + i, era }]));
  return { actors, cast, note: picked.length < c.count ? `shot ${shotNo}: only ${picked.length} of ${c.count} crowd extras fit on clear floor in frame` : undefined };
};
