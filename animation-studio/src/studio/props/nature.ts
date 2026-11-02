// Nature props. Trees / bushes / hedges are the creator's cartoon vegetation (bridge build.ts, MAT pass): clustered
// smooth spheres for canopies (the two-tone sun term gives each lobe a lit cap and a cool belly), tapered trunks,
// rounded-box hedges. Plus rocks, logs, flowers, fences, grass tufts, stumps and mushrooms.
import * as THREE from "three";
import { Batch, V, lam } from "../materials/geo";
import { ctex, rng } from "../materials/paint";
import { rockHD } from "../materials/paint2";
import { At, frame, col, tex, rboxGeo, box, cyl, sph } from "./kit";

export type VegKind = "round" | "fat" | "tall" | "cone" | "bush" | "hedge" | "autumn";
const LEAF = ["#5aa83c", "#4c9a37", "#69b545", "#55a243", "#3f8f3c", "#d98a3a", "#c9643a"];
const leafTex = (i: number) => ctex("leafHD" + i, 256, 128, (g, r) => {
  const base = new THREE.Color(LEAF[i]), top = base.clone().offsetHSL(0.012, 0.03, 0.08), bot = base.clone().offsetHSL(-0.015, 0.0, -0.08);
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, "#" + top.getHexString()); gr.addColorStop(0.42, "#" + base.getHexString()); gr.addColorStop(1, "#" + bot.getHexString());
  g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
  for (let k = 0; k < 46; k++) {
    const x = r() * 256, y = 10 + r() * 108, rad = 5 + r() * 9, light = y < 64 ? r() < 0.7 : r() < 0.25;
    for (const ox of [-256, 0, 256]) {
      g.strokeStyle = light ? "rgba(225,255,170,0.22)" : "rgba(20,70,30,0.2)"; g.lineWidth = 2.5; g.lineCap = "round";
      g.beginPath(); g.arc(x + ox, y + rad * 0.6, rad, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    }
  }
});
const leafMat = (i: number) => lam("leafHD" + i, () => ({ map: leafTex(i) }));
const barkMat = () => lam("barkHD", () => ({ color: "#8f5d3b" }));
const lobe = [new THREE.SphereGeometry(1, 20, 14), new THREE.SphereGeometry(1, 14, 10), new THREE.SphereGeometry(1, 10, 7)];
const trunkG = new THREE.CylinderGeometry(0.6, 1, 1, 10, 1, true).translate(0, 0.5, 0);
const yawQ = (a: number) => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), a);

/** one cartoon plant: base at (x, y, z), height h, q = lobe detail (0 near .. 2 far) */
export const tree = (b: Batch, k: VegKind, x: number, y: number, z: number, h: number, seed: number, q = 0) => {
  const r = rng(Math.abs(Math.floor(seed)) % 200000 + 7), U = (a: number, c: number) => a + (c - a) * r();
  const leaf = leafMat(k === "cone" ? 4 : k === "hedge" ? 1 : k === "autumn" ? 5 + Math.floor(r() * 2) : Math.floor(r() * 4)), L = lobe[q], yaw = r() * 6.28;
  const put = (px: number, py: number, pz: number, rad: number, sy = 0.9) => b.add(L, leaf, new THREE.Matrix4().compose(V(x + px, y + py, z + pz), yawQ(r() * 6.28), V(rad, rad * sy, rad)));
  const trunk = (th: number, tr: number) => b.add(trunkG, barkMat(), new THREE.Matrix4().compose(V(x, y - 0.15, z), yawQ(yaw), V(tr, th + 0.15, tr)));
  const ring = (n: number, dist: number, r0: number, r1: number, cy: number, dy: number) => {
    const a0 = r() * 6.28;
    for (let i = 0; i < n; i++) { const a = a0 + (i * 6.28) / n + U(-0.35, 0.35), dd = dist * U(0.85, 1.12); put(Math.cos(a) * dd, cy + U(-dy, dy), Math.sin(a) * dd, U(r0, r1)); }
  };
  if (k === "round" || k === "fat" || k === "autumn") {
    const f = k === "fat";
    trunk((f ? 0.4 : 0.48) * h, 0.055 * h);
    const cy = (f ? 0.58 : 0.64) * h;
    put(0, cy, 0, (f ? 0.29 : 0.26) * h);
    ring(f ? 5 : 4, (f ? 0.22 : 0.18) * h, (f ? 0.19 : 0.17) * h, (f ? 0.23 : 0.21) * h, cy - 0.05 * h, 0.04 * h);
    put(U(-0.05, 0.05) * h, cy + (f ? 0.15 : 0.17) * h, U(-0.05, 0.05) * h, (f ? 0.19 : 0.17) * h);
  } else if (k === "tall") {
    trunk(0.34 * h, 0.045 * h);
    put(0, 0.47 * h, 0, 0.17 * h, 1.3); put(U(-0.03, 0.03) * h, 0.65 * h, U(-0.03, 0.03) * h, 0.15 * h, 1.3); put(0, 0.82 * h, 0, 0.11 * h, 1.25);
    ring(3, 0.1 * h, 0.1 * h, 0.12 * h, 0.55 * h, 0.06 * h);
  } else if (k === "cone") {
    trunk(0.2 * h, 0.05 * h);
    put(0, 0.3 * h, 0, 0.26 * h, 0.62); put(0, 0.5 * h, 0, 0.2 * h, 0.66); put(0, 0.68 * h, 0, 0.14 * h, 0.75); put(0, 0.84 * h, 0, 0.08 * h, 1.0);
  } else if (k === "bush") {
    put(0, 0.46 * h, 0, 0.5 * h); ring(3, 0.42 * h, 0.32 * h, 0.38 * h, 0.32 * h, 0.04 * h);
  } else b.add(rboxGeo(3.3, h, Math.max(0.9, h * 0.78), 0.4), leaf, new THREE.Matrix4().compose(V(x, y - 0.06, z), yawQ(yaw > 3.14 ? 0 : 0), V(1, 1, 1)));
};

/** boulder: squashed, slightly lumpy ellipsoids with a painted rock surface */
export const rock = (b: Batch, a: At, size = 1, seed = 1) => {
  const m = frame(a), r = rng(seed * 13 + 5), mat = tex("rock", rockHD, 1, 1);
  sph(b, mat, m, 0, 0.32 * size, 0, 0.7 * size, 0.45 * size, 0.55 * size, 16);
  sph(b, mat, m, 0.35 * size, 0.22 * size, 0.2 * size * (r() - 0.5), 0.42 * size, 0.32 * size, 0.38 * size, 14);
};
/** fallen log with end rings */
export const log = (b: Batch, a: At, len = 2.2, rad = 0.22) => {
  const m = frame(a);
  cyl(b, barkMat(), m, -len / 2, rad, 0, rad, rad * 0.95, len, 14, 0, -Math.PI / 2);
  for (const s of [-1, 1]) cyl(b, col("#e3c08c"), m, s * len / 2 + (s > 0 ? 0 : -0.01), rad, 0, rad * 0.9, rad * 0.9, 0.01, 14, 0, -Math.PI / 2);
};
/** tree stump */
export const stump = (b: Batch, a: At, rad = 0.35) => { const m = frame(a); cyl(b, barkMat(), m, 0, 0, 0, rad * 1.15, rad, 0.4, 14); cyl(b, col("#e3c08c"), m, 0, 0.4, 0, rad * 0.92, rad * 0.92, 0.01, 14); };
/** a patch of flowers: stems + round blossoms in 2-3 colours */
export const flowers = (b: Batch, a: At, n = 12, spread = 1.2, seed = 3) => {
  const m = frame(a), r = rng(seed * 7 + 1), cols = ["#f4d24a", "#f3a9bb", "#f7f3e8", "#e2453c", "#9b7ad8"];
  for (let i = 0; i < n; i++) {
    const x = (r() - 0.5) * spread, z = (r() - 0.5) * spread, h = 0.18 + r() * 0.2, c = cols[Math.floor(r() * cols.length)];
    cyl(b, col("#4c9a37"), m, x, 0, z, 0.012, 0.01, h, 5);
    sph(b, col(c), m, x, h, z, 0.05, 0.035, 0.05, 10);
  }
};
/** grass tufts: clusters of thin green cones (foreground detail) */
export const tufts = (b: Batch, a: At, n = 10, spread = 1.5, seed = 4) => {
  const m = frame(a), r = rng(seed * 11 + 3);
  for (let i = 0; i < n; i++) {
    const x = (r() - 0.5) * spread, z = (r() - 0.5) * spread;
    for (let k = 0; k < 3; k++) cyl(b, col(k === 1 ? "#6aab4f" : "#5a9c43"), m, x + (k - 1) * 0.03, 0, z, 0.025, 0.002, 0.18 + r() * 0.16, 5, (r() - 0.5) * 0.5, (r() - 0.5) * 0.5);
  }
};
/** mushroom */
export const mushroom = (b: Batch, a: At, s = 1) => { const m = frame({ ...a, s }); cyl(b, col("#f1e6cf"), m, 0, 0, 0, 0.05, 0.04, 0.12, 10); sph(b, col("#d9473a"), m, 0, 0.13, 0, 0.11, 0.07, 0.11, 14); for (const [x, z] of [[0.04, 0.05], [-0.05, 0.02], [0.01, -0.06]]) sph(b, col("#fbf4e6"), m, x, 0.18, z, 0.018, 0.012, 0.018, 8); };
/** wooden post-and-rail fence along local x */
export const fence = (b: Batch, a: At, len = 6, h = 1.0, c = "#a8724a") => {
  const m = frame(a), n = Math.max(2, Math.round(len / 1.6) + 1), wood = col(c);
  for (let i = 0; i < n; i++) { const x = -len / 2 + (i * len) / (n - 1); box(b, wood, m, x - 0.06, x + 0.06, 0, h, -0.06, 0.06); }
  for (const y of [h * 0.45, h * 0.85]) box(b, wood, m, -len / 2, len / 2, y - 0.05, y + 0.05, -0.03, 0.04);
};
/** picket fence (white) */
export const picket = (b: Batch, a: At, len = 6, h = 0.9) => {
  const m = frame(a), white = col("#f2eee4");
  for (let x = -len / 2; x <= len / 2; x += 0.16) { box(b, white, m, x - 0.045, x + 0.045, 0, h, -0.02, 0.02); }
  for (const y of [h * 0.3, h * 0.72]) box(b, white, m, -len / 2, len / 2, y - 0.04, y + 0.04, -0.05, -0.02);
};
