// Z-fighting test (no rendering): builds every set's real geometry and finds surfaces that would flicker on camera
// moves: two triangles with DIFFERENT materials lying in the same plane (within 0.5 mm), facing the same way, and
// overlapping by more than a few square centimetres. Whichever wins the depth test changes frame to frame (Short-tickle
// run 11: the room builder's wall-thickness box shared the wallpaper's plane in every interior set).
//   npm run test:zfight            report per set; exit 1 if any set has visible z-fighting
import "./lib/dom-stub";
import * as THREE from "three";
import { SETS } from "../src/studio/sets";

const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const PLANE_EPS = 0.0005, MIN_AREA = 0.01; // metres; m^2 (10 x 10 cm) of overlap counts as visible
type Tri = { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3; n: THREE.Vector3; d: number; mat: string; two: boolean; area: number; name: string };
const VERBOSE = proc.process.argv.includes("--verbose");
const matName = (m: THREE.Material) => { const x = m as THREE.MeshLambertMaterial; return x.map ? `tex(${(x.map.image as { width?: number })?.width ?? "?"}px #${x.color?.getHexString?.() ?? ""})` : `#${x.color?.getHexString?.() ?? "?"}`; };

const overlapArea = (s: Tri, t: Tri) => {
  // sample s on a ~2 cm grid and count samples inside t (both projected onto s's plane)
  const u = new THREE.Vector3().subVectors(s.b, s.a), v = new THREE.Vector3().subVectors(s.c, s.a);
  const k = Math.min(160, Math.max(4, Math.ceil(Math.max(u.length(), v.length()) / 0.02)));
  const n = t.n, p = new THREE.Vector3(), e2 = new THREE.Vector3(), w = new THREE.Vector3();
  let inside = 0, total = 0;
  for (let i = 0; i <= k; i++) for (let j = 0; j <= k - i; j++) {
    p.copy(s.a).addScaledVector(u, (i + 0.33) / (k + 1)).addScaledVector(v, (j + 0.33) / (k + 1)); total++;
    // point-in-triangle by same-side tests against t's edges (t's plane == s's plane)
    const sd = (a: THREE.Vector3, b: THREE.Vector3) => w.subVectors(b, a).cross(e2.subVectors(p, a)).dot(n);
    const d0 = sd(t.a, t.b), d1 = sd(t.b, t.c), d2 = sd(t.c, t.a);
    if ((d0 >= 0 && d1 >= 0 && d2 >= 0) || (d0 <= 0 && d1 <= 0 && d2 <= 0)) inside++;
  }
  return (inside / total) * s.area;
};

// a face mounted flush against an opaque surface it faces (the back of a sign on a wall, a board's back against the
// plaster) can never be seen: ignore overlaps whose sample points have a surface within FLUSH metres along the normal
const FLUSH = 0.02, ray = new THREE.Raycaster();
const flushBacked = (root: THREE.Object3D, t: Tri) => {
  const c = new THREE.Vector3().add(t.a).add(t.b).add(t.c).divideScalar(3);
  // start 1 mm BEHIND the face: a supporting surface in exactly the same plane (an object standing on the pavement) is
  // hit, the face itself and its coplanar partner (same facing) are not (front faces only)
  ray.set(c.clone().addScaledVector(t.n, -1e-3), t.n); ray.near = 0; ray.far = FLUSH + 1e-3;
  return ray.intersectObject(root, true).length > 0;
};
let bad = 0;
for (const [id, def] of Object.entries(SETS)) {
  const built = def.build();
  built.root.updateMatrixWorld(true);
  const buckets = new Map<string, Tri[]>();
  built.root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.visible) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const mat = mats[0] as THREE.Material, two = mat.side === THREE.DoubleSide;
    if (mat.transparent && (mat as THREE.MeshBasicMaterial).opacity < 1) return;
    const pos = m.geometry.attributes.position, idx = m.geometry.index, cnt = idx ? idx.count : pos.count;
    for (let i = 0; i < cnt; i += 3) {
      const g = (k: number) => new THREE.Vector3().fromBufferAttribute(pos, idx ? idx.getX(k) : k).applyMatrix4(m.matrixWorld);
      const a = g(i), b = g(i + 1), c = g(i + 2);
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
      const area = n.length() / 2; if (area < 1e-5) continue;
      n.normalize();
      // the underside of anything standing on the ground faces down at floor level: no camera ever sees it
      if (n.y < -0.9 && Math.max(a.y, b.y, c.y) < 0.05) continue;
      // canonical plane key: normal direction (rounded) + offset in 0.5 mm steps (neighbouring steps checked below)
      const d = n.dot(a), key = `${n.x.toFixed(2)},${n.y.toFixed(2)},${n.z.toFixed(2)}`;
      const t: Tri = { a, b, c, n, d, mat: mat.uuid, two, area, name: matName(mat) };
      const k0 = Math.round(d / PLANE_EPS);
      const kk = `${key}|${k0}`;
      const l = buckets.get(kk); if (l) l.push(t); else buckets.set(kk, [t]);
    }
  });
  let area = 0, pairs = 0;
  const seen = new Set<string>(), byPair = new Map<string, { area: number; at: THREE.Vector3; n: THREE.Vector3 }>();
  for (const [kk, list] of buckets) {
    const [key, k0s] = kk.split("|"), k0 = Number(k0s);
    const near = [...list, ...(buckets.get(`${key}|${k0 + 1}`) ?? [])];
    if (new Set(near.map((t) => t.mat)).size < 2) continue;
    for (let i = 0; i < list.length; i++) for (let j = 0; j < near.length; j++) {
      const s = list[i], t = near[j];
      if (s === t || s.mat === t.mat || Math.abs(s.d - t.d) > PLANE_EPS) continue;
      const pk = s.mat < t.mat ? `${s.mat}${t.mat}` : `${t.mat}${s.mat}`;
      // quick bounding-box reject
      const lo = (x: Tri, ax: "x" | "y" | "z") => Math.min(x.a[ax], x.b[ax], x.c[ax]), hi = (x: Tri, ax: "x" | "y" | "z") => Math.max(x.a[ax], x.b[ax], x.c[ax]);
      if ((["x", "y", "z"] as const).some((ax) => hi(s, ax) < lo(t, ax) - 1e-4 || hi(t, ax) < lo(s, ax) - 1e-4)) continue;
      const ov = overlapArea(s, t);
      if (ov > 1e-4 && flushBacked(built.root, s) && flushBacked(built.root, t)) continue;
      if (ov > 1e-4) {
        area += ov; if (!seen.has(pk)) { seen.add(pk); pairs++; }
        const nm = `${s.name} / ${t.name}`, e = byPair.get(nm); if (e) e.area += ov; else byPair.set(nm, { area: ov, at: s.a.clone(), n: s.n.clone() });
      }
    }
  }
  const fail = area > MIN_AREA;
  if (fail) bad++;
  console.log(`${id.padEnd(10)} ${fail ? "FAIL" : "ok  "}  coplanar overlap between different materials: ${area.toFixed(3)} m^2 (${pairs} material pairs)`);
  if (VERBOSE) for (const [nm, e] of [...byPair].sort((x, y) => y[1].area - x[1].area).slice(0, 12)) console.log(`     ${e.area.toFixed(3).padStart(8)} m^2  ${nm}  e.g. at (${e.at.x.toFixed(2)}, ${e.at.y.toFixed(2)}, ${e.at.z.toFixed(2)}) facing (${e.n.x.toFixed(1)}, ${e.n.y.toFixed(1)}, ${e.n.z.toFixed(1)})`);
}
console.log(bad ? `\n${bad} set(s) with z-fighting surfaces` : "\nno z-fighting surfaces");
proc.process.exit(bad ? 1 : 0);
