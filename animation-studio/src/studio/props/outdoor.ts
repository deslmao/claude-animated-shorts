// Outdoor props: modern street furniture, cars, modern buildings; old-town houses (the creator's gabled houses with
// real 3D plinths, cornices, sills, hoods and chimneys, from bridge build.ts), market stalls, barrels, crates, carts,
// wells and lanterns. Sizes in metres at real scale.
import * as THREE from "three";
import { Batch, V, lam, quad, tri, boxGeo } from "../materials/geo";
import { brick, rep, facadeHD, roofHD, stoneHD, planksHD } from "../materials/paint";
import { modernFacadeHD, fabricHD, shopInteriorHD } from "../materials/paint2";
import { At, frame, col, tex, glow, box, rbox, cyl, sph, lathe } from "./kit";

// ---------------- street ----------------
export const streetLamp = (b: Batch, a: At, h = 4.2) => {
  const m = frame(a), iron = col("#3d4a52");
  cyl(b, iron, m, 0, 0, 0, 0.13, 0.1, 0.5, 14); cyl(b, iron, m, 0, 0.5, 0, 0.06, 0.05, h - 0.5, 10);
  box(b, iron, m, -0.04, 0.04, h - 0.05, h + 0.02, 0, 0.7);
  lathe(b, iron, m, 0, h - 0.2, 0.75, [[0.22, 0], [0.12, 0.2], [0.02, 0.24]], 16);
  sph(b, glow("lampbulb", () => ({ color: "#fff1c8" })), m, 0, h - 0.2, 0.75, 0.13, 0.06, 0.13, 14);
};
export const bench = (b: Batch, a: At, w = 1.8) => {
  const m = frame(a), slat = tex("planksHD", planksHD, 0.3, 0.3), iron = col("#3d4a52");
  for (let k = 0; k < 3; k++) box(b, slat, m, -w / 2, w / 2, 0.43, 0.47, -0.2 + k * 0.14, -0.1 + k * 0.14);
  for (let k = 0; k < 2; k++) box(b, slat, m, -w / 2, w / 2, 0.58 + k * 0.17, 0.7 + k * 0.17, -0.27 - k * 0.04, -0.23 - k * 0.04);
  for (const s of [-1, 1]) { box(b, iron, m, s * (w / 2 - 0.1) - 0.03, s * (w / 2 - 0.1) + 0.03, 0, 0.45, -0.24, 0.2); box(b, iron, m, s * (w / 2 - 0.1) - 0.03, s * (w / 2 - 0.1) + 0.03, 0.45, 0.92, -0.3, -0.24); }
};
export const bin = (b: Batch, a: At, c = "#2f6a43") => { const m = frame(a); lathe(b, col(c), m, 0, 0, 0, [[0.2, 0], [0.24, 0.85], [0.26, 0.88]], 18); lathe(b, col("#3d4a52"), m, 0, 0.88, 0, [[0.27, 0], [0.22, 0.08], [0.05, 0.12]], 18); };
export const hydrant = (b: Batch, a: At) => {
  const m = frame(a), red = col("#d2403a");
  cyl(b, red, m, 0, 0, 0, 0.14, 0.12, 0.08, 14); cyl(b, red, m, 0, 0.08, 0, 0.1, 0.1, 0.45, 14); sph(b, red, m, 0, 0.55, 0, 0.11, 0.09, 0.11, 14);
  for (const s of [-1, 1]) cyl(b, red, m, s * 0.1, 0.35, 0, 0.045, 0.045, 0.08, 10, 0, (s * Math.PI) / 2);
};
export const trafficLight = (b: Batch, a: At) => {
  const m = frame(a), dark = col("#2b2d36");
  cyl(b, col("#3d4a52"), m, 0, 0, 0, 0.07, 0.06, 3.0, 10);
  rbox(b, dark, m, 0, 2.2, 0.1, 0.3, 0.85, 0.24, 0.05);
  for (const [y, c] of [[2.85, "#ff5a4a"], [2.62, "#3a3020"], [2.39, "#2a3a2a"]] as const) cyl(b, y === 2.85 ? glow("tlred", () => ({ color: c })) : col(c), m, 0, y, 0.22, 0.09, 0.09, 0.02, 14, Math.PI / 2);
};
export const car = (b: Batch, a: At, c = "#d2603a") => {
  const m = frame(a), body = col(c), glass = col("#7d93c7"), tyre = col("#2b2d36");
  rbox(b, body, m, 0, 0.25, 0, 1.75, 0.62, 4.0, 0.22);              // body (front = +z)
  rbox(b, body, m, 0, 0.82, -0.25, 1.55, 0.58, 2.1, 0.25);           // cabin
  rbox(b, glass, m, 0, 0.88, -0.25, 1.58, 0.44, 1.9, 0.18);          // windows band
  rbox(b, body, m, 0, 1.33, -0.25, 1.45, 0.07, 1.8, 0.03);           // roof cap over the glass
  for (const s of [-1, 1]) for (const z of [-1.3, 1.3]) { cyl(b, tyre, m, s * 0.82, 0.33, z, 0.33, 0.33, 0.24, 18, 0, Math.PI / 2); cyl(b, col("#c9cdd0"), m, s * 0.95, 0.33, z, 0.17, 0.17, 0.01, 14, 0, Math.PI / 2); }
  for (const s of [-1, 1]) { sph(b, glow("headl", () => ({ color: "#fff6dc" })), m, s * 0.58, 0.62, 2.0, 0.14, 0.09, 0.04, 12); sph(b, glow("taill", () => ({ color: "#ff6a5a" })), m, s * 0.62, 0.68, -2.0, 0.12, 0.07, 0.03, 12); }
  rbox(b, col("#c9cdd0"), m, 0, 0.28, 2.02, 1.7, 0.12, 0.08, 0.04); rbox(b, col("#c9cdd0"), m, 0, 0.28, -2.02, 1.7, 0.12, 0.08, 0.04);
};
export const busStop = (b: Batch, a: At) => {
  const m = frame(a), metal = col("#3d4a52");
  for (const x of [-1.3, 1.3]) box(b, metal, m, x - 0.04, x + 0.04, 0, 2.4, -0.55, -0.47);
  rbox(b, col("#2f5f6a"), m, 0, 2.4, 0, 2.9, 0.1, 1.3, 0.04);
  box(b, glow("adpanel", () => ({ color: "#f3d9a4" })), m, 1.24, 1.3, 0.5, 2.0, -0.4, 0.4);
  box(b, tex("planksHD", planksHD, 0.3, 0.3), m, -1.1, 1.1, 0.45, 0.5, -0.45, -0.15);
};
export const planterTree = (b: Batch, a: At, h = 4.5, seed = 5, treeFn?: (b: Batch, x: number, y: number, z: number, h: number, seed: number) => void) => {
  const m = frame(a); rbox(b, tex("stoneplanter", () => stoneHD("planterHD"), 0.5, 0.5), m, 0, 0, 0, 1.2, 0.5, 1.2, 0.06);
  box(b, col("#5a4636"), m, -0.52, 0.52, 0.5, 0.52, -0.52, 0.52);
  treeFn?.(b, a.x, (a.y ?? 0) + 0.5, a.z, h, seed);
};
export const signPost = (b: Batch, a: At, c = "#2f6a43") => { const m = frame(a); cyl(b, col("#9aa0a6"), m, 0, 0, 0, 0.04, 0.04, 2.6, 8); rbox(b, col(c), m, 0, 2.1, 0.05, 0.9, 0.36, 0.04, 0.02); rbox(b, col("#f4f0e6"), m, 0, 2.15, 0.072, 0.8, 0.26, 0.01, 0.01); };
export const mailbox = (b: Batch, a: At) => { const m = frame(a); rbox(b, col("#c0353a"), m, 0, 0, 0, 0.5, 1.15, 0.45, 0.2); box(b, col("#2b2d36"), m, -0.15, 0.15, 0.82, 0.86, 0.22, 0.24); };
/** modern building: w (along local x) x d x h, facade on local +z with a shopfront; flat roof with parapet */
export const modernBuilding = (b: Batch, a: At, w: number, d: number, h: number, st: { wall: string; trim: string; sign: string; brick?: boolean; awning?: string }, k?: number) => {
  const m = frame(a), key = `${st.wall}${w}${h}${st.sign}`;
  const front = lam("mf" + key, () => ({ map: modernFacadeHD(key, w, h, { ...st, shop: true }) }));
  const side = lam("ms" + st.wall + h, () => ({ map: modernFacadeHD(st.wall + "s" + h, 10, h, { ...st, shop: false }) }));
  const j = k === undefined ? zj(a) : 0.004 * (1 + (k % 3)), hw = w / 2 - j, hd = d / 2;
  b.add(quad(V(-hw, 0, hd), V(hw, 0, hd), V(hw, h, hd), V(-hw, h, hd)), front, m);
  b.add(quad(V(-hw, 0, -hd), V(-hw, 0, hd), V(-hw, h, hd), V(-hw, h, -hd), d / 10, 1), side, m);
  b.add(quad(V(hw, 0, hd), V(hw, 0, -hd), V(hw, h, -hd), V(hw, h, hd), d / 10, 1), side, m);
  b.add(quad(V(-hw, h, hd), V(hw, h, hd), V(hw, h, -hd), V(-hw, h, -hd)), col("#8d8780"), m);
  box(b, col(st.trim), m, -hw - 0.1, hw + 0.1, h - j, h + 0.6 + j, hd - 0.25 - j, hd + 0.1 + j); // parapet
  box(b, col(st.trim), m, -hw - 0.05, hw + 0.05, 3.98 - j, 4.12 + j, hd + j / 2, hd + 0.18 + j); // shopfront cornice
  if (st.awning) { // striped fabric awning over the shop window
    const aw = tex("awn" + st.awning, () => fabricHD(st.awning!), 1, 1);
    b.add(quad(V(-hw + 0.3, 3.0, hd + 1.2), V(hw * 0.25, 3.0, hd + 1.2), V(hw * 0.25, 3.6, hd + 0.05), V(-hw + 0.3, 3.6, hd + 0.05)), aw, m);
    box(b, col(st.trim), m, -hw + 0.3, hw * 0.25, 2.9, 3.02, hd + 1.15, hd + 1.25);
  }
  box(b, col("#9a948c"), m, -hw - 0.05, hw + 0.05, 0, 0.3 + j, hd, hd + 0.08 + j); // plinth
};

// ---------------- old town ----------------
type Style = { wall: string; shutter: string; roof: string; timber?: boolean; brick?: boolean };
/** the creator's final house palette (MAT round 4): muted brick / cream / ochre / terracotta; never lavender in shade */
export const HOUSE_STYLES: Style[] = [
  { wall: "#ecdab2", shutter: "#3f6fb5", roof: "#d27a62" }, { wall: "#d8a95f", shutter: "#2f6a43", roof: "#b8644f" },
  { wall: "#c47a5c", shutter: "#2f5f6a", roof: "#8f97a8" }, { wall: "#efdcb8", shutter: "#2f5f6a", roof: "#c9775a", timber: true },
  { wall: "#ddbd78", shutter: "#5a3b2a", roof: "#d27a62" }, { wall: "#cc9a6c", shutter: "#3f6fb5", roof: "#8e7aa0" },
  { wall: "#e2c49a", shutter: "#8c3b4a", roof: "#c9775a" }, { wall: "#e3d2b8", shutter: "#2f6a43", roof: "#8f97a8", brick: true },
];
const roofMat = (c: string) => lam("roof" + c, () => ({ map: roofHD(c, c === "#8f97a8"), side: THREE.DoubleSide }));
const UB = new THREE.BoxGeometry(1, 1, 1);
const ub = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  b.add(UB, mat, m.clone().multiply(new THREE.Matrix4().compose(V((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), new THREE.Quaternion(), V(x1 - x0, y1 - y0, z1 - z0))));
/** a few millimetres that differ from building to building (by position, so always the same for the same placement):
 *  neighbouring buildings with equal sizes would otherwise put trims, roofs and walls in exactly the same planes and
 *  z-fight (flicker) on camera moves. npm run test:zfight checks every set. */
const zj = (a: At) => { const v = Math.sin(a.x * 12.9898 + a.z * 78.233 + (a.yaw ?? 0) * 37.719) * 43758.5453; return 0.004 * (1 + Math.floor((v - Math.floor(v)) * 6)); };
/** gabled house (front facade on local +z), w x d, wall height h, style index si */
export const house = (b: Batch, a: At, w: number, d: number, h: number, si: number, k?: number) => {
  const st = HOUSE_STYLES[si % HOUSE_STYLES.length], m = frame(a);
  const front = lam(`hf${si}_${w}_${h}`, () => ({ map: facadeHD(`hf${si}_${w}_${h}`, w, h, { ...st, door: true }) }));
  const side = lam(`hs${si}_${h}`, () => ({ map: facadeHD(`hs${si}_${h}`, 8, h, st) }));
  const wall = lam("wall" + st.wall, () => ({ color: st.brick ? "#c8643f" : st.wall }));
  // k = index in a row of houses: neighbours then always get different offsets
  const j = k === undefined ? zj(a) : 0.004 * (1 + (k % 3)), hw = w / 2 - j, hd = d / 2 - j, rh = d * 0.42, o = 0.35 + 2 * j;
  b.add(quad(V(-hw, 0, hd), V(hw, 0, hd), V(hw, h, hd), V(-hw, h, hd)), front, m);
  b.add(quad(V(hw, 0, -hd), V(-hw, 0, -hd), V(-hw, h, -hd), V(hw, h, -hd)), side, m);
  b.add(quad(V(-hw, 0, -hd), V(-hw, 0, hd), V(-hw, h, hd), V(-hw, h, -hd)), side, m);
  b.add(quad(V(hw, 0, hd), V(hw, 0, -hd), V(hw, h, -hd), V(hw, h, hd)), side, m);
  b.add(tri(V(-hw, h, -hd), V(-hw, h, hd), V(-hw, h + rh, 0)), wall, m);
  b.add(tri(V(hw, h, hd), V(hw, h, -hd), V(hw, h + rh, 0)), wall, m);
  const ru = (w + 2 * o) / 4, rv = Math.hypot(hd + o, rh) / 4, rm = roofMat(st.roof);
  b.add(quad(V(-hw - o, h - 0.25, hd + o), V(hw + o, h - 0.25, hd + o), V(hw + o, h + rh, 0), V(-hw - o, h + rh, 0), ru, rv), rm, m);
  b.add(quad(V(hw + o, h - 0.25, -hd - o), V(-hw - o, h - 0.25, -hd - o), V(-hw - o, h + rh, 0), V(hw + o, h + rh, 0), ru, rv), rm, m);
  const chx = hw * 0.45 * (si % 2 ? 1 : -1), tm = col("#efe3c8"), plinth = lam("plinthHD", () => ({ map: stoneHD("copeHD") }));
  b.add(boxGeo(V(chx - 0.4, h + rh * 0.3, -hd * 0.35 - 0.4), V(chx + 0.4, h + rh + 1.1, -hd * 0.35 + 0.4), 2), lam("chim", () => ({ map: rep(brick(), 1, 1) })), m);
  b.add(boxGeo(V(-hw - 0.07, -0.05, -hd - 0.07), V(hw + 0.07, 0.45, hd + 0.07), 2), plinth, m);
  ub(b, tm, m, -hw - 0.12, hw + 0.12, h - 0.52, h - 0.25, hd, hd + 0.17);
  const floors = Math.max(1, Math.floor(h / 2.8)), n = Math.max(1, Math.floor(w / 2.2));
  for (let fl = 0; fl < floors; fl++) for (let i = 0; i < n; i++) {
    const px = -hw + ((i + 0.5) / n) * w, yb = fl * 2.8 + 0.9;
    if (fl === 0 && i === Math.floor(n / 2)) { ub(b, plinth, m, px - 0.82, px + 0.82, 0, 0.2, hd, hd + 0.5); ub(b, tm, m, px - 0.78, px + 0.78, 2.3, 2.44, hd, hd + 0.34); continue; }
    ub(b, tm, m, px - 0.6, px + 0.6, yb - 0.2, yb - 0.08, hd, hd + 0.14); ub(b, tm, m, px - 0.55, px + 0.55, yb + 1.33, yb + 1.43, hd, hd + 0.08);
  }
  const cz = -hd * 0.35, top = h + rh + 1.1;
  ub(b, col("#9a8778"), m, chx - 0.52, chx + 0.52, top, top + 0.16, cz - 0.52, cz + 0.52);
  cyl(b, col("#b8684a"), m, chx, top + 0.16, cz, 0.16, 0.13, 0.42, 10);
};
export const marketStall = (b: Batch, a: At, c = "#c0353a", goods: "fruit" | "bread" | "cloth" = "fruit") => {
  const m = frame(a), wood = col("#8a5a3c"), canvas = tex("awn" + c, () => fabricHD(c), 1, 1);
  rbox(b, col("#a8724a"), m, 0, 0.8, 0, 2.2, 0.08, 1.0, 0.02);
  box(b, tex("planksHD", planksHD, 0.4, 0.3), m, -1.1, 1.1, 0.1, 0.8, 0.45, 0.5);
  for (const s of [-1, 1]) for (const z of [-0.45, 0.45]) box(b, wood, m, s * 1.05 - 0.04, s * 1.05 + 0.04, 0, z < 0 ? 2.5 : 2.2, z - 0.04, z + 0.04);
  b.add(quad(V(-1.25, 2.15, 0.85), V(1.25, 2.15, 0.85), V(1.25, 2.6, -0.55), V(-1.25, 2.6, -0.55)), canvas, m);
  for (let i = 0; i < 6; i++) { const x = -1.25 + i * 0.5; b.add(tri(V(x, 2.15, 0.85), V(x + 0.5, 2.15, 0.85), V(x + 0.25, 1.98, 0.86)), canvas, m); }
  const cols = goods === "fruit" ? ["#e2453c", "#f4b23a", "#7ab65e", "#9b4ad8"] : goods === "bread" ? ["#d9a45a", "#c88a44", "#e8c07a", "#b5753a"] : ["#3f6fb5", "#c25a7a", "#e9c46a", "#2f6a43"];
  for (let k = 0; k < 4; k++) {
    const x = -0.8 + k * 0.53;
    rbox(b, col("#c8a272"), m, x, 0.88, 0.05, 0.44, 0.1, 0.5, 0.02);
    for (let i = 0; i < 7; i++) { const px = x - 0.15 + (i % 4) * 0.1, pz = -0.1 + Math.floor(i / 4) * 0.18 + 0.1; if (goods === "cloth") rbox(b, col(cols[k]), m, px, 0.98, pz, 0.12, 0.05 + 0.02 * (i % 3), 0.16, 0.02); else sph(b, col(cols[k]), m, px, 1.03, pz, 0.065, goods === "bread" ? 0.045 : 0.06, goods === "bread" ? 0.1 : 0.065, 10); }
  }
};
export const barrel = (b: Batch, a: At) => { const m = frame(a); lathe(b, col("#9a6a42"), m, 0, 0, 0, [[0.27, 0], [0.33, 0.25], [0.35, 0.45], [0.33, 0.65], [0.27, 0.9]], 18); for (const y of [0.12, 0.78]) lathe(b, col("#3d4a52"), m, 0, y, 0, [[0.3, 0], [0.31, 0.05]], 18); lathe(b, col("#7a4f33"), m, 0, 0.9, 0, [[0.27, 0], [0.001, 0.005]], 18); };
export const crate = (b: Batch, a: At, s = 0.6) => { const m = frame(a); box(b, tex("planksHD", planksHD, 0.25, 0.25), m, -s / 2, s / 2, 0, s, -s / 2, s / 2); for (const y of [0.02, s - 0.07]) box(b, col("#7a4f33"), m, -s / 2 - 0.01, s / 2 + 0.01, y, y + 0.05, -s / 2 - 0.01, s / 2 + 0.01); };
export const cart = (b: Batch, a: At) => {
  const m = frame(a), wood = col("#9a6a42");
  box(b, tex("planksHD", planksHD, 0.4, 0.3), m, -0.8, 0.8, 0.55, 0.6, -0.55, 0.55);
  for (const s of [-1, 1]) box(b, wood, m, -0.8, 0.8, 0.6, 0.95, s * 0.55 - 0.03, s * 0.55 + 0.03);
  box(b, wood, m, -0.83, -0.77, 0.6, 0.95, -0.55, 0.55);
  for (const s of [-1, 1]) { cyl(b, col("#7a4f33"), m, 0.2, 0.42, s * 0.62, 0.42, 0.42, 0.07, 20, Math.PI / 2); cyl(b, col("#c8a272"), m, 0.2, 0.42, s * 0.66, 0.08, 0.08, 0.02, 10, Math.PI / 2); }
  for (const s of [-1, 1]) box(b, wood, m, 0.8, 2.2, 0.55, 0.62, s * 0.3 - 0.03, s * 0.3 + 0.03);
  for (let i = 0; i < 4; i++) sph(b, col(["#f4b23a", "#e2453c", "#7ab65e", "#d9a45a"][i]), m, -0.4 + i * 0.25, 0.75, 0.1 * (i % 2), 0.13, 0.12, 0.13, 12);
};
export const well = (b: Batch, a: At) => {
  const m = frame(a), stone = tex("wellstone", () => stoneHD("wellHD"), 0.6, 0.4), wood = col("#7a4f33");
  lathe(b, stone, m, 0, 0, 0, [[0.85, 0], [0.85, 0.8], [0.62, 0.8], [0.62, 0.7]], 24);
  for (const s of [-1, 1]) box(b, wood, m, s * 0.75 - 0.06, s * 0.75 + 0.06, 0.7, 2.1, -0.06, 0.06);
  cyl(b, wood, m, -0.75, 1.75, 0, 0.06, 0.06, 1.5, 10, 0, -Math.PI / 2);
  b.add(quad(V(-1.0, 2.0, 0.7), V(1.0, 2.0, 0.7), V(1.0, 2.5, 0), V(-1.0, 2.5, 0)), roofMat("#b8644f"), m);
  b.add(quad(V(1.0, 2.0, -0.7), V(-1.0, 2.0, -0.7), V(-1.0, 2.5, 0), V(1.0, 2.5, 0)), roofMat("#b8644f"), m);
  lathe(b, col("#9a6a42"), m, 0, 1.2, 0, [[0.14, 0], [0.16, 0.24]], 14);
};
export const lanternPost = (b: Batch, a: At) => {
  const m = frame(a), iron = col("#2f3540");
  cyl(b, iron, m, 0, 0, 0, 0.1, 0.08, 0.3, 12); cyl(b, iron, m, 0, 0.3, 0, 0.05, 0.04, 2.7, 10);
  rbox(b, iron, m, 0, 2.95, 0, 0.32, 0.06, 0.32, 0.02);
  box(b, glow("lantern", () => ({ color: "#ffe2a0" })), m, -0.12, 0.12, 3.01, 3.35, -0.12, 0.12);
  lathe(b, iron, m, 0, 3.35, 0, [[0.2, 0], [0.02, 0.18]], 4);
};
export const fountain = (b: Batch, a: At) => {
  const m = frame(a), stone = tex("fountainstone", () => stoneHD("fountainHD"), 0.8, 0.3);
  lathe(b, stone, m, 0, 0, 0, [[2.0, 0], [2.0, 0.55], [1.75, 0.55], [1.75, 0.4]], 32);
  b.add(new THREE.CircleGeometry(1.76, 32).rotateX(-Math.PI / 2).translate(0, 0.42, 0), col("#3a9fbf"), m);
  lathe(b, stone, m, 0, 0.4, 0, [[0.3, 0], [0.2, 0.9], [0.8, 1.1], [0.8, 1.2], [0.2, 1.25], [0.12, 1.8], [0.25, 1.9], [0.05, 2.1]], 22);
};

/** a detailed 3D shopfront for close / medium shots, built against a facade (front faces local +z): framed shop
 *  window with a painted lit interior, door, striped awning, sign board, a cafe table + chairs and planters */
export const shopfront = (b: Batch, a: At, w = 7, kind: "cafe" | "books" | "grocer" = "cafe", c = "#2f5f6a", awn = "#c0353a", treeFn?: (b: Batch, x: number, y: number, z: number, h: number, seed: number) => void) => {
  const m = frame(a), frameC = col(c), trimC = col("#f2ead8"), inside = glow("shopin" + kind, () => ({ map: shopInteriorHD(kind) }));
  const hw = w / 2;
  box(b, col("#9a948c"), m, -hw, hw, 0, 0.5, 0.002, 0.12);                               // stall riser
  for (const [x0, x1] of [[-hw + 0.3, 0.6], [1.9, hw - 0.3]]) {                          // two windows
    b.add(new THREE.PlaneGeometry(x1 - x0, 2.3).translate((x0 + x1) / 2, 1.65, 0.05), inside, m);
    for (const [a0, a1, b0, b1] of [[x0 - 0.12, x0, 0.5, 2.92], [x1, x1 + 0.12, 0.5, 2.92], [x0 - 0.12, x1 + 0.12, 2.8, 2.95], [x0 - 0.12, x1 + 0.12, 0.42, 0.52]]) box(b, frameC, m, a0, a1, b0, b1, 0.004, 0.16);
    for (let x = x0 + (x1 - x0) / 3; x < x1 - 0.05; x += (x1 - x0) / 3) box(b, frameC, m, x - 0.03, x + 0.03, 0.5, 2.8, 0.06, 0.12);
  }
  b.add(new THREE.PlaneGeometry(1.1, 2.45).translate(1.25, 1.25, 0.04), inside, m);       // glazed door
  for (const [a0, a1, b0, b1] of [[0.6, 0.72, 0, 2.6], [1.78, 1.9, 0, 2.6], [0.6, 1.9, 2.48, 2.6], [0.6, 1.9, 1.05, 1.13]]) box(b, frameC, m, a0, a1, b0, b1, 0.004, 0.14);
  rbox(b, col(c), m, 0, 3.15, 0.12, w + 0.2, 0.75, 0.2, 0.04);                          // sign board
  for (let k = 0; k < 4; k++) rbox(b, trimC, m, -0.9 + k * 0.6, 3.32, 0.23, 0.42, 0.42, 0.03, 0.1); // painted letters (no words)
  // awning: striped, sloping out over the pavement, scalloped hem
  const aw = tex("awnS" + awn, () => fabricHD(awn), 1, 1), stripe = col("#f2ead8");
  const N = Math.round(w / 0.5);
  for (let i = 0; i < N; i++) { const x0 = -hw + (i * w) / N, x1 = x0 + w / N; b.add(quad(V(x0, 2.62, 1.5), V(x1, 2.62, 1.5), V(x1, 3.05, 0.2), V(x0, 3.05, 0.2)), i % 2 ? stripe : aw, m); b.add(tri(V(x0, 2.62, 1.5), V(x1, 2.62, 1.5), V((x0 + x1) / 2, 2.45, 1.52)), i % 2 ? stripe : aw, m); }
  // pavement dressing
  const ct = frame({ x: a.x + Math.sin(a.yaw ?? 0) * 1.3 - Math.cos(a.yaw ?? 0) * 2.4, z: a.z + Math.cos(a.yaw ?? 0) * 1.3 + Math.sin(a.yaw ?? 0) * 2.4, y: a.y, yaw: a.yaw });
  cyl(b, col("#3d4a52"), ct, 0, 0, 0, 0.25, 0.25, 0.03, 16); cyl(b, col("#3d4a52"), ct, 0, 0, 0, 0.03, 0.03, 0.72, 8); cyl(b, col("#efe6d4"), ct, 0, 0.72, 0, 0.36, 0.36, 0.04, 20);
  lathe(b, col("#f1e6cf"), ct, 0.1, 0.76, 0.05, [[0.04, 0], [0.05, 0.08]], 12);
  for (const s of [-1, 1]) { box(b, col("#3d4a52"), ct, s * 0.55 - 0.2, s * 0.55 + 0.2, 0.44, 0.48, -0.2, 0.2); box(b, col("#3d4a52"), ct, s * 0.55 + s * 0.18 - 0.02, s * 0.55 + s * 0.18 + 0.02, 0.48, 0.9, -0.2, 0.2); for (const z of [-0.17, 0.17]) box(b, col("#3d4a52"), ct, s * 0.55 - 0.02, s * 0.55 + 0.02, 0, 0.44, z - 0.02, z + 0.02); }
  for (const x of [-hw + 0.15, hw - 0.15]) { rbox(b, col("#c8643f"), m, x, 0, 0.45, 0.5, 0.55, 0.5, 0.05); const wx = a.x + Math.cos(a.yaw ?? 0) * x + Math.sin(a.yaw ?? 0) * 0.45, wz = a.z - Math.sin(a.yaw ?? 0) * x + Math.cos(a.yaw ?? 0) * 0.45; treeFn?.(b, wx, (a.y ?? 0) + 0.5, wz, 1.0, x * 9); }
};
