// Prop-building toolkit: placement frames, painted / flat two-tone materials, rounded boxes with smooth normals
// (the creator's hedge technique generalised: soft cartoon furniture, and the world ink draws only silhouettes and
// real folds, not every facet), cylinders, spheres and lathes. Everything is merged into a Batch per material.
import * as THREE from "three";
import { Batch, V, lam } from "../materials/geo";

/** where a prop stands: base at (x, y, z), turned yaw radians about +y (its front faces local +z), uniform scale s */
export type At = { x: number; z: number; y?: number; yaw?: number; s?: number };
export const frame = (a: At) => new THREE.Matrix4().compose(V(a.x, a.y ?? 0, a.z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), a.yaw ?? 0), V(a.s ?? 1, a.s ?? 1, a.s ?? 1));
const local = (m: THREE.Matrix4, x: number, y: number, z: number, ry = 0, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) =>
  m.clone().multiply(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), V(sx, sy, sz)));

/** flat two-tone colour material (cached) */
export const col = (c: string) => lam("c" + c, () => ({ color: c }));
/** painted texture material, repeated (ru, rv) */
export const tex = (key: string, t: () => THREE.Texture, ru = 1, rv = 1) => lam(`t${key}_${ru}_${rv}`, () => { const m = t().clone(); m.repeat.set(ru, rv); m.needsUpdate = true; return { map: m }; });
/** unlit, bright material (window views, screens, lamp shades lit from inside) */
const basics = new Map<string, THREE.MeshBasicMaterial>();
export const glow = (key: string, make: () => THREE.MeshBasicMaterialParameters) => { let m = basics.get(key); if (!m) { m = new THREE.MeshBasicMaterial(make()); basics.set(key, m); } return m; };

const geos = new Map<string, THREE.BufferGeometry>();
const cached = (k: string, make: () => THREE.BufferGeometry) => { let g = geos.get(k); if (!g) { g = make(); geos.set(k, g); } return g; };
/** rounded box w x h x d (metres) with corner radius r, base at y = 0, smooth normals */
export const rboxGeo = (w: number, h: number, d: number, r: number, flatBottom = true) => cached(`rb${w}_${h}_${d}_${r}_${flatBottom}`, () => {
  const seg = (L: number) => Math.max(4, Math.min(16, Math.round(L / Math.max(r, 0.02) * 2)));
  const g = new THREE.BoxGeometry(w, h, d, seg(w), seg(h), seg(d));
  const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute;
  const R = [Math.min(r, w / 2), Math.min(r, h / 2), Math.min(r, d / 2)], half = [w / 2, h / 2, d / 2], v = new THREE.Vector3(), e = new THREE.Vector3(), q = [0, 0, 0];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    for (let a = 0; a < 3; a++) {
      const c = v.getComponent(a), lim = flatBottom && a === 1 && c < 0 ? half[1] : half[a] - R[a];
      q[a] = THREE.MathUtils.clamp(c, -lim, lim); e.setComponent(a, R[a] ? (c - q[a]) / R[a] : 0);
    }
    const L = e.length();
    if (L < 1e-6) continue;
    e.divideScalar(L);
    p.setXYZ(i, q[0] + e.x * R[0], q[1] + e.y * R[1], q[2] + e.z * R[2]);
    const nn = new THREE.Vector3(e.x / (R[0] || 1), e.y / (R[1] || 1), e.z / (R[2] || 1)).normalize();
    n.setXYZ(i, nn.x, nn.y, nn.z);
  }
  g.translate(0, h / 2, 0);
  return g;
});
const UB = new THREE.BoxGeometry(1, 1, 1);

/** axis box in the prop's frame from (x0,y0,z0) to (x1,y1,z1) */
export const box = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  b.add(UB, mat, local(m, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, 0, x1 - x0, y1 - y0, z1 - z0));
/** rounded box centred at (x, z), base at y */
export const rbox = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x: number, y: number, z: number, w: number, h: number, d: number, r: number, ry = 0, rx = 0) =>
  b.add(rboxGeo(w, h, d, r), mat, local(m, x, y, z, ry, 1, 1, 1, rx));
/** cylinder / cone frustum, base at (x, y, z), radius r0 bottom, r1 top */
export const cyl = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x: number, y: number, z: number, r0: number, r1: number, h: number, seg = 18, rx = 0, rz = 0) =>
  b.add(cached(`cy${r0}_${r1}_${h}_${seg}`, () => new THREE.CylinderGeometry(r1, r0, h, seg).translate(0, h / 2, 0)), mat, local(m, x, y, z, 0, 1, 1, 1, rx, rz));
/** ellipsoid centred at (x, y, z) */
export const sph = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x: number, y: number, z: number, rx: number, ry: number, rz: number, seg = 18) =>
  b.add(cached(`sp${seg}`, () => new THREE.SphereGeometry(1, seg, Math.max(8, Math.round(seg * 0.7)))), mat, local(m, x, y, z, 0, rx, ry, rz));
/** lathe profile [radius, height] pairs, base at (x, y, z) */
export const lathe = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x: number, y: number, z: number, prof: [number, number][], seg = 22) =>
  b.add(cached("la" + prof.flat().join(",") + seg, () => new THREE.LatheGeometry(prof.map(([r, h]) => new THREE.Vector2(r, h)), seg)), mat, local(m, x, y, z));
/** flat textured quad facing local +z (pictures, posters, screens), centred at (x, y, z) */
export const panel = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x: number, y: number, z: number, w: number, h: number, ry = 0) =>
  b.add(cached("pl", () => new THREE.PlaneGeometry(1, 1)), mat, local(m, x, y, z, ry, w, h, 1));
/** flat quad lying on the floor (rugs, puddles, road markings), centred at (x, y, z) */
export const decal = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x: number, y: number, z: number, w: number, d: number, ry = 0) =>
  b.add(cached("pl", () => new THREE.PlaneGeometry(1, 1)), mat, local(m, x, y, z, ry, w, d, 1, -Math.PI / 2));
