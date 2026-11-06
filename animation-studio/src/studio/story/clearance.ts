// Camera clearance (Video 03 defect class, no rendering): builds each set's real geometry, rasterises its surfaces
// into a 5 cm occupancy grid and checks every frame's camera against it.
//   inside   the lens is inside scenery
//   clip     scenery within 25 cm in front of the lens, inside the field of view (it fills the frame or is sliced by
//            the near plane: Video 03 frames 1410-1425, the insert camera in the doorway's head trim)
//   blocked  the line of sight to the frame's target runs through scenery for more than BLOCK_RUN frames (a camera
//            behind a wall). Whip / zoom-through rushes are exempt; a camera beat with `blockOk` marks an intended
//            foreground (a wall edge deliberately splitting the frame)
// Characters are flat cards, not scenery: they are not in the grid. Story props are not either (small, rarely in the way).
import * as THREE from "three";
import { SETS } from "../sets";
import { runKeys, type Key } from "../camera/keys";
import type { Storyboard } from "./types";

const CELL = 0.05, CLIP_D = [0.1, 0.15, 0.2, 0.25], BLOCK_RUN = 6, RUSH = 10;
type V3 = [number, number, number];
export type ClearanceProblem = { shot: number; kind: "inside" | "clip" | "blocked"; f0: number; f1: number; msg: string };

const key = (x: number, y: number, z: number) => ((Math.floor(x / CELL) + 2048) * 4096 + (Math.floor(y / CELL) + 2048)) * 4096 + (Math.floor(z / CELL) + 2048);

/** occupancy of a set's surfaces inside a region (min / max corners): sampled on a ~4 cm grid per triangle */
const occupancy = (setId: string, lo: V3, hi: V3) => {
  const built = SETS[setId].build(), root = built.root as THREE.Object3D, occ = new Set<number>();
  root.updateMatrixWorld(true);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), p = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3();
  const inside = (q: THREE.Vector3) => q.x >= lo[0] && q.x <= hi[0] && q.y >= lo[1] && q.y <= hi[1] && q.z >= lo[2] && q.z <= hi[2];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry || !m.visible) return;
    const mats = (Array.isArray(m.material) ? m.material : [m.material]) as THREE.Material[];
    if (mats.every((x) => x.transparent && (x as THREE.MeshBasicMaterial).opacity < 0.5)) return; // glass, haze
    const pos = m.geometry.getAttribute("position"), idx = m.geometry.getIndex(), n = idx ? idx.count : pos.count;
    for (let t = 0; t + 2 < n; t += 3) {
      const ia = idx ? idx.getX(t) : t, ib = idx ? idx.getX(t + 1) : t + 1, ic = idx ? idx.getX(t + 2) : t + 2;
      a.fromBufferAttribute(pos, ia).applyMatrix4(m.matrixWorld); b.fromBufferAttribute(pos, ib).applyMatrix4(m.matrixWorld); c.fromBufferAttribute(pos, ic).applyMatrix4(m.matrixWorld);
      // skip triangles entirely outside the region
      if (Math.max(a.x, b.x, c.x) < lo[0] || Math.min(a.x, b.x, c.x) > hi[0] || Math.max(a.y, b.y, c.y) < lo[1] || Math.min(a.y, b.y, c.y) > hi[1] || Math.max(a.z, b.z, c.z) < lo[2] || Math.min(a.z, b.z, c.z) > hi[2]) continue;
      u.subVectors(b, a); v.subVectors(c, a);
      const edge = Math.max(u.length(), v.length(), b.distanceTo(c));
      if (edge > 80) continue;                                   // ground / sky planes: the camera height check covers them
      const k = Math.max(1, Math.ceil(edge / 0.04));
      for (let i = 0; i <= k; i++) for (let j = 0; j <= k - i; j++) {
        p.copy(a).addScaledVector(u, i / k).addScaledVector(v, j / k);
        if (inside(p)) occ.add(key(p.x, p.y, p.z));
      }
    }
  });
  return occ;
};

/** every clearance problem of a compiled storyboard (film = compile(sb)) */
export const cameraClearance = (sb: Storyboard, film: { shots: { id: number; a: number; b: number; set: string; keys: Key[] }[]; timing: { sb: Storyboard } }): ClearanceProblem[] => {
  const out: ClearanceProblem[] = [];
  const shots = film.shots, specs = film.timing.sb.shots;
  const bySet = new Map<string, typeof shots>();
  for (const s of shots) bySet.set(s.set, [...(bySet.get(s.set) ?? []), s]);
  for (const [setId, list] of bySet) {
    // region: every camera position and look point of the set's shots, plus a margin
    const lo: V3 = [Infinity, Infinity, Infinity], hi: V3 = [-Infinity, -Infinity, -Infinity];
    for (const s of list) for (let f = s.a; f < s.b; f += 2) { const c = runKeys(s.keys, f); for (const q of [c.pos, c.look]) for (let i = 0; i < 3; i++) { lo[i] = Math.min(lo[i], q[i] - 1.5); hi[i] = Math.max(hi[i], q[i] + 1.5); } }
    const occ = occupancy(setId, lo, hi), hit = (x: number, y: number, z: number) => occ.has(key(x, y, z));
    for (const s of list) {
      const k = s.id - 1, spec = specs[k];
      const rushIn = ["whip", "zoom"].includes(spec.transition ?? ""), rushOut = ["whip", "zoom"].includes(specs[k + 1]?.transition ?? "");
      const beats = (spec.cams ?? []).map((c) => ({ f: s.a + Math.round(((c as { t?: number }).t ?? 0) * 30), whip: !!c.whip, blockOk: !!(c as { blockOk?: boolean }).blockOk }));
      const blockOkAt = (f: number) => { let ok = !!(spec.camera as { blockOk?: boolean }).blockOk; for (const bt of beats) if (f >= bt.f) ok = bt.blockOk; return ok; };
      const rushing = (f: number) => (rushIn && f < s.a + RUSH) || (rushOut && f >= s.b - RUSH) || beats.some((bt) => bt.whip && f >= bt.f && f < bt.f + 6);
      const runs: Record<string, number[]> = { inside: [], clip: [], blocked: [] };
      for (let f = s.a; f < s.b; f++) {
        const c = runKeys(s.keys, f), P = new THREE.Vector3(...c.pos), L = new THREE.Vector3(...c.look);
        const fwd = L.clone().sub(P).normalize(), right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(right, fwd);
        const tanH = Math.tan(((c.fov ?? 40) * Math.PI) / 360), tanW = tanH * (9 / 16);
        if (hit(P.x, P.y, P.z) || P.y < 0.05) { runs.inside.push(f); continue; }
        let clip = false;
        for (const d of CLIP_D) { for (const sx of [-1, 0, 1]) for (const sy of [-1, 0, 1]) { const q = P.clone().addScaledVector(fwd, d).addScaledVector(right, sx * d * tanW * 0.9).addScaledVector(up, sy * d * tanH * 0.9); if (hit(q.x, q.y, q.z)) clip = true; } if (clip) break; }
        if (clip) { runs.clip.push(f); continue; }
        if (rushing(f) || blockOkAt(f)) continue;
        const dist = P.distanceTo(L);
        for (let d = 0.3; d < dist - 0.3; d += CELL) { const q = P.clone().addScaledVector(fwd, d); if (hit(q.x, q.y, q.z)) { runs.blocked.push(f); break; } }
      }
      const group = (fs: number[]) => { const r: [number, number][] = []; for (const f of fs) { if (r.length && f - r[r.length - 1][1] <= 1) r[r.length - 1][1] = f; else r.push([f, f]); } return r; };
      for (const [f0, f1] of group(runs.inside)) out.push({ shot: s.id, kind: "inside", f0, f1, msg: `shot ${s.id}: the camera is inside the scenery @frames ${f0}-${f1}` });
      for (const [f0, f1] of group(runs.clip)) out.push({ shot: s.id, kind: "clip", f0, f1, msg: `shot ${s.id}: scenery within 25 cm of the lens (fills or slices the frame) @frames ${f0}-${f1}` });
      for (const [f0, f1] of group(runs.blocked)) if (f1 - f0 + 1 > BLOCK_RUN) out.push({ shot: s.id, kind: "blocked", f0, f1, msg: `shot ${s.id}: the view to the frame's target is blocked by scenery @frames ${f0}-${f1} (mark the beat blockOk if that's intended)` });
    }
  }
  return out;
};
