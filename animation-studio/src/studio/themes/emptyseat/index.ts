// The Empty Seat theme (productions/empty-seat): Thinkora Ghost Stories, episode 1. A yellow school bus with one seat
// nobody may sit in (seat 13, by a window that is always fogged from the inside), kept for Emily, the girl the bus left
// behind in the snow in 1996. Same world as One Too Many: its "pupil" extras (navy blazers) ride the bus.
// New here (additions only):
//   sets schoolBus (inside the bus on a sunny morning: 22 numbered bench seats, the aisle, the driver's seat and mirror,
//     the windscreen, the back window, a painted street outside every window), schoolBusElm (the same bus stopped at
//     the empty Elm Road stop: its sign and bench outside the front doors)
//   props busDoors (the folding front doors: open on step 1, shut on step 2), fogPane (fog on the inside of a seat's
//     window: 13 or 14; variant 13up / 14up fogs up over step 1), esInsert (9:16 close insert cards; a state per step)
//   characters hale (the driver), subDriver (the stand-in), noah (the new kid, red hoodie), seatKid ("you")
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { Batch } from "../../materials/geo";
import { At, col, glow, box, rbox, cyl } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";
import type { View } from "../../sets/types";
import type { V3 } from "../../camera/keys";

// ---------------------------------------------------------------- shared helpers
const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; stable.set(key, t); return t;
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const rnd = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const PLUM = "#1b1222", IW = 810, IH = 1440, YELLOW = "#f2b81c";
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const vignette = (g: CanvasRenderingContext2D, c: string) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.35, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, c); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
/** a plane with an unlit texture (outside views, number plates), facing +z before `m` turns it */
const plane = (b: Batch, w: number, h: number, mat: THREE.Material, m: THREE.Matrix4) => b.add(new THREE.PlaneGeometry(w, h), mat, m);
const T = (x: number, y: number, z: number, ry = 0) => new THREE.Matrix4().makeTranslation(x, y, z).multiply(new THREE.Matrix4().makeRotationY(ry));

// ---------------------------------------------------------------- the bus: layout
// Inside: x -1.2..1.2 (walls), floor y 0, ceiling 1.95; the windscreen at z -5.2, the back window at z 5.0. The driver
// sits at the front left (x -0.75, z -4.3) facing -z; the folding doors are at the front right (x 1.2, z -4.8..-4.0).
// 11 rows of bench seats each side, facing the front (-z): row r (1..11) at z = -3.3 + (r - 1) * 0.78; the left seat
// is number 2r - 1, the right 2r (seat 13 = row 7 left, seat 14 = row 7 right, z 1.38). Kids sit at SEAT(n) facing -z.
export const ROW_Z = (r: number) => -3.3 + (r - 1) * 0.78;
export const SEAT = (n: number, inner = false): V3 => { const r = Math.ceil(n / 2), left = n % 2 === 1; return [(left ? -1 : 1) * (inner ? 0.52 : 0.88), 0.42, ROW_Z(r) + 0.16]; };
const WIN_Y0 = 0.95, WIN_Y1 = 1.6;

const streetTex = (snow = false) => stex(`esStreet${snow ? "S" : ""}`, 1024, 384, (g) => {
  const sky = g.createLinearGradient(0, 0, 0, 230); sky.addColorStop(0, snow ? "#c9cdd6" : "#8fc4ef"); sky.addColorStop(1, snow ? "#e6e8ec" : "#d8ecf8"); g.fillStyle = sky; g.fillRect(0, 0, 1024, 384);
  const r = rnd(snow ? 9 : 4);
  for (let x = -20; x < 1024; x += 150 + r() * 60) {       // houses
    const w = 110 + r() * 50, h = 80 + r() * 40, c = ["#e8d8c0", "#c9a27a", "#b9c7d6", "#e7c9b0", "#d6d0c4"][Math.floor(r() * 5)];
    g.fillStyle = c; g.fillRect(x, 250 - h, w, h); g.fillStyle = snow ? "#f4f6f8" : "#8a4a3a"; g.beginPath(); g.moveTo(x - 8, 250 - h); g.lineTo(x + w / 2, 250 - h - 40); g.lineTo(x + w + 8, 250 - h); g.fill();
    g.fillStyle = "#5f7d9a"; g.fillRect(x + 18, 250 - h + 22, 22, 22); g.fillRect(x + w - 40, 250 - h + 22, 22, 22);
  }
  g.fillStyle = snow ? "#eef1f4" : "#5f9a4a"; g.fillRect(0, 238, 1024, 40);                                   // verges / hedges
  for (let x = 30; x < 1024; x += 200) { g.fillStyle = snow ? "#dfe5ea" : "#3f7a3a"; g.beginPath(); g.arc(x, 230, 34, 0, 7); g.fill(); }
  g.fillStyle = snow ? "#e9ecef" : "#c9c4b8"; g.fillRect(0, 278, 1024, 26);                                   // pavement
  g.fillStyle = snow ? "#d7dbe0" : "#5a5d63"; g.fillRect(0, 304, 1024, 80);                                   // road
  g.fillStyle = "#f2efe6"; for (let x = 0; x < 1024; x += 90) g.fillRect(x, 342, 46, 6);
});
const elmTex = () => stex("esElm", 512, 384, (g) => {
  g.clearRect(0, 0, 512, 384);
  g.fillStyle = "#3a3d42"; g.fillRect(250, 60, 10, 250);                                                       // the sign pole
  g.fillStyle = "#1f6f3f"; g.strokeStyle = PLUM; g.lineWidth = 6; g.beginPath(); g.roundRect(170, 40, 170, 110, 12); g.fill(); g.stroke();
  g.fillStyle = "#ffffff"; g.font = F(26); g.textAlign = "center"; g.fillText("BUS STOP", 255, 80); g.font = F(40); g.fillText("ELM RD", 255, 128);
  g.fillStyle = "#7a5a3a"; g.fillRect(320, 230, 150, 18); g.fillRect(330, 248, 10, 50); g.fillRect(450, 248, 10, 50);  // an empty bench
});
const plateTex = (n: number) => stex(`esPlate${n}`, 128, 64, (g) => { g.fillStyle = "#f4f1e8"; g.fillRect(0, 0, 128, 64); g.strokeStyle = "#2b2f38"; g.lineWidth = 6; g.strokeRect(3, 3, 122, 58); g.fillStyle = "#2b2f38"; g.font = F(40); g.textAlign = "center"; g.fillText(String(n), 64, 46); });

const BUS_SPOTS: Record<string, V3> = { driver: [-0.75, 0.45, -4.25], aisleFront: [0, 0, -3.7], aisleMid: [0, 0, 0.2], aisleBack: [0, 0, 4.2], door: [0.8, 0, -4.4], seat13: SEAT(13), seat14: SEAT(14) };
const BUS_VIEWS: View[] = [
  { name: "aisle", pos: [0, 1.4, -3.9], look: [0, 0.9, 2.5], fov: 55, establishing: true },
];
const blizzardTex = () => stex("esBlizzard", 1024, 384, (g) => {
  const sky = g.createLinearGradient(0, 0, 0, 384); sky.addColorStop(0, "#c7d2de"); sky.addColorStop(1, "#eef2f6"); g.fillStyle = sky; g.fillRect(0, 0, 1024, 384);
  g.fillStyle = "rgba(150,165,185,0.35)"; for (let x = 0; x < 1024; x += 170) g.fillRect(x + 40, 150, 90, 90);   // houses lost in the snow
  const r = rnd(5); g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 3; for (let i = 0; i < 260; i++) { const x = r() * 1024, y = r() * 384; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 26, y + 14); g.stroke(); }
});
const frostTex = () => stex("esFrost", 256, 256, (g) => {
  g.clearRect(0, 0, 256, 256); const r = rnd(17);
  for (let i = 0; i < 900; i++) { const edge = r(), side = Math.floor(r() * 4), d = Math.pow(r(), 2.2) * 70;
    const x = side === 0 ? d : side === 1 ? 256 - d : edge * 256, y = side === 2 ? d : side === 3 ? 256 - d : edge * 256;
    g.fillStyle = `rgba(240,246,252,${0.25 + 0.5 * (1 - d / 70)})`; g.beginPath(); g.arc(x, y, 1 + r() * 3.5, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 1.5; for (let i = 0; i < 40; i++) { const x = r() < 0.5 ? r() * 40 : 216 + r() * 40, y = r() * 256; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) g.lineTo(x + (r() - 0.5) * 30, y + (r() - 0.5) * 30); g.stroke(); }
});
const schoolBus = (mode: boolean | "snow") => {
  const elm = mode === true, snow = mode === "snow", outside = () => (snow ? blizzardTex() : streetTex());
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  const wall = col("#cfc6ae"), trim = col("#9a9282"), seatC = col("#2f5d4a"), seatD = col("#244a3b"), metal = col("#b9bcc2");
  box(b, col("#3a3d42"), I, -1.2, 1.2, -0.04, 0, -5.3, 5.1); box(b, col("#4a4e55"), I, -0.3, 0.3, 0.0, 0.004, -4.0, 4.9);   // floor + the aisle runner
  box(b, col("#e9e6dd"), I, -1.25, 1.25, 1.95, 2.0, -5.3, 5.1);                                                            // ceiling
  for (const x of [-0.6, 0.6]) box(b, glow("esCeilLight", () => ({ color: "#fff6dc" })), I, x - 0.08, x + 0.08, 1.945, 1.95, -4.5, 4.5);
  for (const s of [-1, 1]) {
    const x0 = s * 1.2, xo = s * 1.26;
    box(b, wall, I, Math.min(x0, xo), Math.max(x0, xo), 0, WIN_Y0, -5.3, 5.1);                                              // lower wall
    box(b, wall, I, Math.min(x0, xo), Math.max(x0, xo), WIN_Y1, 1.95, -5.3, 5.1);                                           // above the windows
    for (let r = 0; r <= 11; r++) { const z = ROW_Z(r + 1) - 0.39; box(b, trim, I, Math.min(x0, xo), Math.max(x0, xo), WIN_Y0, WIN_Y1, z - 0.05, z + 0.05); }  // pillars
    box(b, trim, I, Math.min(x0, xo), Math.max(x0, xo), WIN_Y0, WIN_Y1, 4.45, 5.1);
    box(b, trim, I, Math.min(x0, xo), Math.max(x0, xo), WIN_Y0, WIN_Y1, -5.3, s > 0 ? -4.82 : -3.7); // the front: driver's side solid, door side up to the doors
    box(b, col("#a8a08c"), I, s * 1.12 - 0.04, s * 1.12 + 0.04, WIN_Y0 - 0.04, WIN_Y0, -3.7, 4.45);                         // window sills
    // the street outside, seen through every window
    plane(b, 10.6, 2.4, glow(`esStreetM${elm ? "E" : snow ? "S" : ""}${s}`, () => ({ map: outside(), toneMapped: false })), T(s * 1.6, 1.15, -0.1, -s * Math.PI / 2));
    // number plates over the windows: left odd, right even
    for (let r = 1; r <= 11; r++) plane(b, 0.16, 0.08, new THREE.MeshLambertMaterial({ map: plateTex(s < 0 ? 2 * r - 1 : 2 * r) }), T(s * 1.195, 1.73, ROW_Z(r) + 0.16, -s * Math.PI / 2));
  }
  // the seats: 11 rows each side, facing the front
  for (let r = 1; r <= 11; r++) {
    const z = ROW_Z(r);
    for (const s of [-1, 1]) {
      const xa = s * 0.3, xb = s * 1.16, lo = Math.min(xa, xb), hi = Math.max(xa, xb);
      rbox(b, seatC, I, (lo + hi) / 2, 0.3, z + 0.17, hi - lo, 0.12, 0.42, 0.04);                                            // seat pan
      rbox(b, seatD, I, (lo + hi) / 2, 0.36, z + 0.42, hi - lo, 0.62, 0.09, 0.04);                                           // backrest (behind the sitter)
      box(b, metal, I, lo + 0.05, hi - 0.05, 0.0, 0.3, z + 0.3, z + 0.32);                                                   // legs
      box(b, metal, I, s > 0 ? lo - 0.035 : hi + 0.005, s > 0 ? lo - 0.005 : hi + 0.035, 0.36, 1.0, z + 0.4, z + 0.44);                         // the aisle grab rail
    }
  }
  // the front: windscreen with the road ahead, dashboard, driver's seat, wheel, the big mirror
  plane(b, 2.6, 1.3, glow(`esAhead${elm ? "E" : snow ? "S" : ""}`, () => ({ map: outside(), toneMapped: false })), T(0, 1.35, -5.8));
  box(b, col("#2b2e34"), I, -1.2, 1.2, 0.0, 0.95, -5.3, -5.0); box(b, col("#33363d"), I, -1.15, 0.2, 0.75, 1.0, -5.0, -4.7);
  rbox(b, col("#1f2124"), I, -0.75, 0.3, -4.25, 0.5, 0.15, 0.45, 0.04); rbox(b, col("#1f2124"), I, -0.75, 0.45, -3.98, 0.5, 0.65, 0.1, 0.04);
  cyl(b, col("#15171a"), I, -0.75, 0.95, -4.62, 0.21, 0.21, 0.03, 24, -1.15);
  rbox(b, col("#2b2f38"), I, 0, 1.68, -5.05, 0.7, 0.16, 0.04, 0.03); box(b, glow("esMirror", () => ({ color: "#c9d6e4" })), I, -0.32, 0.32, 1.7, 1.82, -5.028, -5.026);
  box(b, col(YELLOW), I, 0.2, 1.2, 0.0, 0.25, -4.85, -3.95);                                                                  // the entry step
  // the back: the emergency door's window, the road behind
  box(b, wall, I, -1.2, -0.6, 0, 1.95, 4.95, 5.05); box(b, wall, I, 0.6, 1.2, 0, 1.95, 4.95, 5.05); box(b, wall, I, -0.6, 0.6, 0, 0.9, 4.95, 5.05); box(b, wall, I, -0.6, 0.6, 1.62, 1.95, 4.95, 5.05);
  box(b, col("#c0392b"), I, -0.55, 0.55, 1.65, 1.75, 4.94, 4.945);                                                          // EMERGENCY EXIT strip
  plane(b, 3.0, 1.5, glow(`esBehind${snow ? "S" : ""}`, () => ({ map: outside(), toneMapped: false })), T(0, 1.2, 5.6, Math.PI));
  if (snow) for (const sd of [-1, 1]) for (let r = 1; r <= 11; r++) plane(b, 0.7, WIN_Y1 - WIN_Y0, glow("esFrostM", () => ({ map: frostTex(), transparent: true, depthWrite: false, toneMapped: false })), T(sd * 1.19, (WIN_Y0 + WIN_Y1) / 2, ROW_Z(r), sd < 0 ? Math.PI / 2 : -Math.PI / 2));
  if (elm) plane(b, 1.6, 1.2, new THREE.MeshBasicMaterial({ map: elmTex(), transparent: true, toneMapped: false }), T(1.45, 1.2, -4.3, -Math.PI / 2));
  b.build(root, true);
  return { root, env: { clouds: false }, spots: BUS_SPOTS, views: BUS_VIEWS };
};

// ---------------------------------------------------------------- props: the doors, the fog
/** the folding front doors: two glass leaves; open over step 1, shut over step 2 */
const doorsRig = (a: At): PropRig => {
  const root = rigRoot(a);
  const frame = new THREE.MeshLambertMaterial({ color: "#2b2e34" }), glass = new THREE.MeshBasicMaterial({ color: "#bcd7ea", transparent: true, opacity: 0.28, toneMapped: false });
  const leaves = [-1, 1].map((k) => {
    const piv = new THREE.Group(); piv.position.set(1.2, 0, -4.4 + k * 0.4); root.add(piv);
    const leaf = new THREE.Group(); leaf.position.set(0, 0, -k * 0.2); piv.add(leaf);
    for (const [y0, y1] of [[0.05, 0.12], [1.78, 1.85]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, y1 - y0, 0.4), frame); m.position.y = (y0 + y1) / 2; leaf.add(m); }
    for (const dz of [-0.19, 0.19]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.8, 0.03), frame); m.position.set(0, 0.95, dz); leaf.add(m); }
    const g = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 1.66), glass); g.rotation.y = Math.PI / 2; g.position.y = 0.95; leaf.add(g);
    return { piv, k };
  });
  root.position.set(0, 0, 0);
  return { root, update: ({ step = 0 }) => { const open = Math.max(0, Math.min(1, step)) - Math.max(0, Math.min(1, step - 1)); leaves.forEach(({ piv, k }) => { piv.rotation.y = k * open * 1.35; }); } };
};
const fogTex = () => stex("esFog2", 256, 256, (g) => {
  const m = g.createRadialGradient(128, 118, 10, 128, 128, 190); m.addColorStop(0, "rgba(205,214,224,0.97)"); m.addColorStop(0.7, "rgba(196,206,218,0.94)"); m.addColorStop(1, "rgba(186,198,212,0.8)");
  g.fillStyle = m; g.fillRect(0, 0, 256, 256);
  const r = rnd(13);
  g.fillStyle = "rgba(255,255,255,0.55)"; for (let i = 0; i < 140; i++) { g.beginPath(); g.arc(r() * 256, r() * 256, 0.8 + r() * 2.2, 0, 7); g.fill(); }     // condensation droplets
  for (let i = 0; i < 8; i++) { const x = 18 + r() * 220, y0 = 90 + r() * 90, len = 50 + r() * 90;                                                          // drips: clear streaks
    g.strokeStyle = "rgba(120,150,185,0.55)"; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (r() - 0.5) * 5, Math.min(250, y0 + len)); g.stroke();
    g.fillStyle = "rgba(255,255,255,0.8)"; g.beginPath(); g.arc(x, Math.min(250, y0 + len), 3, 0, 7); g.fill(); }
});
/** the static fog (a shot that gives the prop no steps): drawn into the shot's batch */
const fogMat = () => glow("esFogStatic", () => ({ map: fogTex(), transparent: true, depthWrite: false, toneMapped: false }));
const fogStatic = (b: Batch, n: number) => { const left = n % 2 === 1, r = Math.ceil(n / 2);
  plane(b, 0.66, WIN_Y1 - WIN_Y0 - 0.04, fogMat(), T((left ? -1 : 1) * 1.185, (WIN_Y0 + WIN_Y1) / 2, ROW_Z(r), left ? Math.PI / 2 : -Math.PI / 2)); };
/** fog on the inside of seat 13's (left) or 14's (right) window; variant 13up / 14up fogs up over step 1 */
const fogRig = (_a: At, v = "13"): PropRig => {
  const n = parseInt(v, 10), left = n % 2 === 1, r = Math.ceil(n / 2), up = v.endsWith("up");
  const root = new THREE.Group();
  const m = new THREE.MeshBasicMaterial({ map: fogTex(), transparent: true, opacity: up ? 0 : 1, depthWrite: false, toneMapped: false });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.66, WIN_Y1 - WIN_Y0 - 0.04), m);
  p.position.set((left ? -1 : 1) * 1.185, (WIN_Y0 + WIN_Y1) / 2, ROW_Z(r)); p.rotation.y = left ? Math.PI / 2 : -Math.PI / 2; p.layers.set(NOINK); root.add(p);
  return { root, update: ({ step = 0 }) => { if (up) m.opacity = Math.max(0, Math.min(1, step)); } };
};

// ---------------------------------------------------------------- insert cards
const fogBlob = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, a = 0.85) => { const m = g.createRadialGradient(x + w / 2, y + h / 2, 30, x + w / 2, y + h / 2, Math.max(w, h) * 0.7); m.addColorStop(0, `rgba(236,240,244,${a})`); m.addColorStop(1, `rgba(236,240,244,${a * 0.55})`); g.fillStyle = m; g.fillRect(x, y, w, h); };
const snowDots = (g: CanvasRenderingContext2D, n: number, seed: number, a = 0.9) => { const r = rnd(seed); g.fillStyle = `rgba(255,255,255,${a})`; for (let i = 0; i < n; i++) { g.beginPath(); g.arc(r() * IW, r() * IH, 2 + r() * 5, 0, 7); g.fill(); } };
const busSide = (g: CanvasRenderingContext2D, x: number, y: number, s: number, lights = true) => {
  g.fillStyle = YELLOW; g.strokeStyle = PLUM; g.lineWidth = 8 * s; g.beginPath(); g.roundRect(x, y, 520 * s, 190 * s, 24 * s); g.fill(); g.stroke();
  g.fillStyle = "#2b3954"; for (let k = 0; k < 6; k++) g.fillRect(x + (30 + k * 72) * s, y + 30 * s, 56 * s, 60 * s);
  g.fillStyle = PLUM; g.font = F(26 * s); g.textAlign = "left"; g.fillText("SCHOOL BUS", x + 40 * s, y + 140 * s);
  for (const wx of [100, 420]) { g.fillStyle = "#1f2124"; g.beginPath(); g.arc(x + wx * s, y + 190 * s, 42 * s, 0, 7); g.fill(); }
  if (lights) { g.fillStyle = "#ff3b30"; g.shadowColor = "#ff3b30"; g.shadowBlur = 30; g.fillRect(x + 505 * s, y + 120 * s, 18 * s, 34 * s); g.shadowBlur = 0; }
};
const girl = (g: CanvasRenderingContext2D, x: number, y: number, s: number, wave: boolean) => {
  g.strokeStyle = PLUM; g.lineWidth = 6 * s; g.lineJoin = "round";
  g.fillStyle = "#c8323a"; g.beginPath(); g.roundRect(x - 34 * s, y - 70 * s, 68 * s, 90 * s, 18 * s); g.fill(); g.stroke();        // red coat
  g.fillStyle = "#f2d2b8"; g.beginPath(); g.arc(x, y - 100 * s, 30 * s, 0, 7); g.fill(); g.stroke();                               // face
  g.fillStyle = "#6b4226"; g.beginPath(); g.arc(x, y - 112 * s, 32 * s, Math.PI, 0); g.fill();                                      // hair
  g.fillStyle = "#f2efe6"; g.beginPath(); g.arc(x, y - 128 * s, 18 * s, 0, 7); g.fill(); g.stroke();                               // bobble hat
  if (wave) { g.beginPath(); g.moveTo(x + 30 * s, y - 55 * s); g.lineTo(x + 70 * s, y - 120 * s); g.lineWidth = 16 * s; g.strokeStyle = "#c8323a"; g.stroke(); }
};
const phoneInHands = (g: CanvasRenderingContext2D, screen: (x: number, y: number, w: number, h: number) => void, home = false) => {
  const bg = g.createLinearGradient(0, 0, 0, IH); bg.addColorStop(0, home ? "#6b5a7a" : "#3a4250"); bg.addColorStop(1, home ? "#2a2234" : "#1d222c"); g.fillStyle = bg; g.fillRect(0, 0, IW, IH);
  if (home) { const m = g.createRadialGradient(120, 160, 20, 120, 160, 520); m.addColorStop(0, "rgba(255,214,150,0.55)"); m.addColorStop(1, "rgba(255,214,150,0)"); g.fillStyle = m; g.fillRect(0, 0, IW, IH);   // the bedside lamp
    g.fillStyle = "rgba(224,181,82,0.75)"; g.fillRect(0, 980, IW, 460); }                                                // your duvet, out of focus
  else { g.fillStyle = "rgba(47,93,74,0.6)"; g.fillRect(0, 980, IW, 460); }                                          // the seat in front, out of focus
  const x = 150, y = 150, w = 510, h = 1000;
  g.fillStyle = "#111318"; g.strokeStyle = PLUM; g.lineWidth = 10; g.beginPath(); g.roundRect(x - 22, y - 22, w + 44, h + 44, 56); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 40); g.clip(); screen(x, y, w, h); g.restore();
  for (const [hx, s] of [[120, 1], [690, -1]] as const) {                                                             // your hands round the phone
    g.fillStyle = SLEEVE; g.strokeStyle = PLUM; g.lineWidth = 8; g.beginPath(); g.moveTo(hx - s * 120, IH + 10); g.lineTo(hx - s * 30, 1120); g.lineTo(hx + s * 90, 1180); g.lineTo(hx + s * 40, IH + 10); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = SKIN; g.beginPath(); g.roundRect(hx - 60, 1000, 120, 210, 50); g.fill(); g.stroke();
    g.beginPath(); g.roundRect(hx + s * 30 - 22, 900, 44, 150, 22); g.fill(); g.stroke();                                // thumbs
  }
};
const KEYS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
/** your phone in your hands: you type "elm road bus stop"; step 1: the result, STOP CLOSED 1996 (on the bus or at home) */
const searchOn = (g: CanvasRenderingContext2D, st: number, home: boolean) => phoneInHands(g, (x, y, w, h) => {
    g.fillStyle = "#f5f3ee"; g.fillRect(x, y, w, h);
    g.fillStyle = "#ffffff"; g.strokeStyle = "#c9ccd2"; g.lineWidth = 3; g.beginPath(); g.roundRect(x + 30, y + 90, w - 60, 80, 40); g.fill(); g.stroke();
    g.fillStyle = "#1f2430"; g.font = F(34, "normal"); g.textAlign = "left"; g.fillText(st ? "elm road bus stop" : "elm road bus st▌", x + 70, y + 143);
    if (!st) { g.fillStyle = "#d4d7dd"; g.fillRect(x, y + h - 380, w, 380); g.fillStyle = "#ffffff";
      KEYS.forEach((row, i) => [...row].forEach((c, j) => { const kw = (w - 40) / 10, kx = x + 20 + j * kw + i * kw * 0.5, ky = y + h - 360 + i * 105; g.beginPath(); g.roundRect(kx + 3, ky, kw - 6, 88, 10); g.fill(); g.fillStyle = "#1f2430"; g.font = F(30, "normal"); g.textAlign = "center"; g.fillText(c, kx + kw / 2, ky + 56); g.fillStyle = "#ffffff"; })); }
    else {
      g.fillStyle = "#1f2430"; g.font = F(40); g.textAlign = "left"; g.fillText("Elm Rd (Bus 9)", x + 40, y + 280);
      g.fillStyle = "#c0392b"; g.font = F(46); g.fillText("STOP CLOSED", x + 40, y + 350); g.fillText("FEB 1996", x + 40, y + 410);
      g.fillStyle = "#6b7280"; g.font = F(28, "normal"); g.fillText("Permanently removed from", x + 40, y + 480); g.fillText("the route.", x + 40, y + 520);
      g.fillStyle = "#e6e8ec"; g.fillRect(x + 40, y + 580, w - 80, 4);
    }
}, home);

const INSERTS: Record<string, { n: number; draw: (g: CanvasRenderingContext2D, st: number) => void }> = {
  // 3 (v2): your phone: you type "elm road bus stop"; step 1: the result, STOP CLOSED 1996
  search: { n: 2, draw: (g, st) => searchOn(g, st, false) },
  // the end card (v2): WOULD YOU SIT IN SEAT 13? (silent)
  vote: { n: 1, draw: (g) => {
    const bg = g.createLinearGradient(0, 0, 0, IH); bg.addColorStop(0, "#151a26"); bg.addColorStop(1, "#06080d"); g.fillStyle = bg; g.fillRect(0, 0, IW, IH);
    fogBlob(g, 205, 220, 400, 300, 0.5);
    g.fillStyle = "#f4f1e8"; g.fillRect(IW / 2 - 70, 260, 140, 80); g.strokeStyle = "#2b2f38"; g.lineWidth = 8; g.strokeRect(IW / 2 - 70, 260, 140, 80); g.fillStyle = "#2b2f38"; g.font = F(60); g.textAlign = "center"; g.fillText("13", IW / 2, 323);
    g.fillStyle = "#ffffff"; g.font = F(76); g.fillText("WOULD YOU SIT", IW / 2, 640); g.fillText("IN SEAT 13?", IW / 2, 730);
    for (const [y, c, t] of [[810, "#2e9e5b", "YES"], [930, "#c0392b", "NO"]] as const) { g.fillStyle = c; g.beginPath(); g.roundRect(IW / 2 - 200, y, 400, 90, 45); g.fill(); g.fillStyle = "#ffffff"; g.font = F(48); g.fillText(t, IW / 2, y + 63); }
    g.fillStyle = "#f2c94c"; g.font = F(36); g.fillText("comment below ↓", IW / 2, 1100);
  } },
  // v3: the same search at home on your bed (when you get home, you look it up)
  searchHome: { n: 2, draw: (g, st) => searchOn(g, st, true) },
  // 6 (v2): a text from Sam: step 0 he's typing; step 1 the message
  text: { n: 2, draw: (g, st) => phoneInHands(g, (x, y, w, h) => {
    g.fillStyle = "#0f1218"; g.fillRect(x, y, w, h); g.fillStyle = "#1a1f29"; g.fillRect(x, y, w, 150);
    g.fillStyle = "#3b6fd1"; g.beginPath(); g.arc(x + w / 2, y + 70, 34, 0, 7); g.fill(); g.fillStyle = "#ffffff"; g.font = F(34); g.textAlign = "center"; g.fillText("S", x + w / 2, y + 82);
    g.fillStyle = "#c9cfe0"; g.font = F(26); g.fillText("Sam", x + w / 2, y + 134);
    g.fillStyle = "#8b93a5"; g.font = F(24, "normal"); g.fillText("Today 9:41 PM", x + w / 2, y + 210);
    g.fillStyle = "#2a2f3a";
    if (!st) { g.beginPath(); g.roundRect(x + 30, y + 250, 140, 74, 37); g.fill(); g.fillStyle = "#8b93a5"; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + 70 + k * 30, y + 287, 9, 0, 7); g.fill(); } }
    else { const ls = ["mr hale died last night.", "in hospital. he was", "really sick."]; g.beginPath(); g.roundRect(x + 30, y + 250, w - 90, 60 + ls.length * 46, 30); g.fill();
      g.fillStyle = "#ffffff"; g.font = F(32, "normal"); g.textAlign = "left"; ls.forEach((l, i) => g.fillText(l, x + 60, y + 302 + i * 46)); }
  }) },
  // 3: seat 13's window, close: fog on the inside of the glass; bright June sun on the street outside
  window: { n: 1, draw: (g) => {
    g.fillStyle = "#cfc6ae"; g.fillRect(0, 0, IW, IH);
    const x0 = 90, y0 = 220, w = IW - 180, h = 760;
    const img = g.createLinearGradient(0, y0, 0, y0 + h); img.addColorStop(0, "#8fc4ef"); img.addColorStop(0.55, "#d8ecf8"); img.addColorStop(0.56, "#5f9a4a"); img.addColorStop(0.7, "#c9c4b8"); img.addColorStop(1, "#5a5d63"); g.fillStyle = img; g.fillRect(x0, y0, w, h);
    g.fillStyle = "#fff3b0"; g.shadowColor = "#fff3b0"; g.shadowBlur = 80; g.beginPath(); g.arc(x0 + w * 0.78, y0 + 140, 60, 0, 7); g.fill(); g.shadowBlur = 0;   // the sun
    fogBlob(g, x0, y0, w, h, 0.88);
    const r = rnd(21); g.strokeStyle = "rgba(150,165,180,0.45)"; g.lineWidth = 6; for (let i = 0; i < 9; i++) { const x = x0 + 40 + r() * (w - 80), yy = y0 + 300 + r() * 200; g.beginPath(); g.moveTo(x, yy); g.lineTo(x + (r() - 0.5) * 8, yy + 80 + r() * 160); g.stroke(); }
    g.strokeStyle = "#9a9282"; g.lineWidth = 40; g.strokeRect(x0, y0, w, h);
    g.fillStyle = "#f4f1e8"; g.fillRect(IW / 2 - 70, 90, 140, 80); g.strokeStyle = "#2b2f38"; g.lineWidth = 8; g.strokeRect(IW / 2 - 70, 90, 140, 80); g.fillStyle = "#2b2f38"; g.font = F(60); g.textAlign = "center"; g.fillText("13", IW / 2, 153);
  } },
  // 9: the bus route on your phone: Elm Rd, stop closed 1996
  route: { n: 1, draw: (g) => {
    g.fillStyle = "#f5f3ee"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#ffffff"; g.fillRect(0, 0, IW, 170);
    g.fillStyle = "#1f2430"; g.font = F(46); g.textAlign = "left"; g.fillText("Bus 9 · old route", 56, 104);
    g.fillStyle = "#eee8da"; g.fillRect(0, 170, IW, 900); g.strokeStyle = "#ffffff"; g.lineWidth = 40; g.beginPath(); g.moveTo(100, 1060); g.quadraticCurveTo(300, 600, 700, 220); g.stroke();
    g.strokeStyle = YELLOW; g.lineWidth = 14; g.stroke();
    for (const [x, y, name, closed] of [[180, 880, "Oak Ave", false], [400, 520, "ELM RD", true], [620, 300, "School", false]] as const) {
      g.fillStyle = closed ? "#c0392b" : "#1f2430"; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill();
      g.font = F(closed ? 46 : 36); g.textAlign = "left"; g.fillText(name, x + 40, y + 14);
      if (closed) { g.fillStyle = "#c0392b"; g.font = F(36); g.fillText("STOP CLOSED 1996", x - 90, y + 80); g.strokeStyle = "#c0392b"; g.lineWidth = 8; g.beginPath(); g.moveTo(x - 30, y - 30); g.lineTo(x + 30, y + 30); g.moveTo(x + 30, y - 30); g.lineTo(x - 30, y + 30); g.stroke(); }
    }
  } },
  // 10: the 1996 yearbook: one page with a black border, a girl's school photo, EMILY SHAW, 11
  yearbook: { n: 1, draw: (g) => {
    g.fillStyle = "#2a2018"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#f1e9d6"; g.fillRect(70, 120, IW - 140, 920); g.strokeStyle = "#111111"; g.lineWidth = 34; g.strokeRect(110, 160, IW - 220, 840);
    g.fillStyle = "#3a3026"; g.font = "italic 40px 'DejaVu Serif', Georgia, serif"; g.textAlign = "center"; g.fillText("In loving memory", IW / 2, 250);
    g.fillStyle = "#c9d6e4"; g.fillRect(IW / 2 - 170, 300, 340, 420); g.strokeStyle = PLUM; g.lineWidth = 6; g.strokeRect(IW / 2 - 170, 300, 340, 420);
    g.fillStyle = "#7d9ab8"; g.fillRect(IW / 2 - 170, 300, 340, 420);
    g.save(); g.beginPath(); g.rect(IW / 2 - 170, 300, 340, 420); g.clip();
    g.fillStyle = "#c8323a"; g.beginPath(); g.roundRect(IW / 2 - 120, 560, 240, 220, 60); g.fill();
    g.fillStyle = "#f2d2b8"; g.strokeStyle = PLUM; g.lineWidth = 6; g.beginPath(); g.arc(IW / 2, 470, 95, 0, 7); g.fill(); g.stroke();
    g.fillStyle = "#6b4226"; g.beginPath(); g.arc(IW / 2, 440, 102, Math.PI * 1.05, Math.PI * 1.95); g.fill(); g.fillRect(IW / 2 - 105, 440, 30, 120); g.fillRect(IW / 2 + 75, 440, 30, 120);
    g.fillStyle = PLUM; g.beginPath(); g.arc(IW / 2 - 32, 480, 9, 0, 7); g.arc(IW / 2 + 32, 480, 9, 0, 7); g.fill(); g.lineWidth = 6; g.beginPath(); g.arc(IW / 2, 505, 30, 0.3, Math.PI - 0.3); g.stroke();
    g.restore();
    g.fillStyle = "#1f1a14"; g.font = F(66); g.fillText("EMILY SHAW", IW / 2, 820); g.fillStyle = "#4a4036"; g.font = F(42, "normal"); g.fillText("1985 – 1996 · aged 11", IW / 2, 885);
    vignette(g, "rgba(20,10,0,0.5)");
  } },
  // 11: 1996, a snowstorm: the bus coming past the stop; step 1: it's gone past, and a small girl in a red coat waves behind the snowbank
  snow1996: { n: 2, draw: (g, st) => {
    const sky = g.createLinearGradient(0, 0, 0, IH); sky.addColorStop(0, "#5a6478"); sky.addColorStop(1, "#c9ced8"); g.fillStyle = sky; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#eef1f5"; g.fillRect(0, 760, IW, IH - 760); g.fillStyle = "#d9dee6"; g.beginPath(); g.ellipse(170, 790, 260, 90, 0, Math.PI, 0); g.fill();   // the snowbank
    g.fillStyle = "#3a3d42"; g.fillRect(560, 430, 12, 360); g.fillStyle = "#1f6f3f"; g.fillRect(500, 410, 130, 80); g.fillStyle = "#ffffff"; g.font = F(28); g.textAlign = "center"; g.fillText("ELM RD", 565, 462);
    if (st) { busSide(g, 470, 650, 0.9); girl(g, 150, 760, 1.15, true); }
    else { busSide(g, -380, 650, 0.9, false); g.fillStyle = "#fff8c0"; g.shadowColor = "#fff8c0"; g.shadowBlur = 60; g.beginPath(); g.arc(90, 790, 22, 0, 7); g.fill(); g.shadowBlur = 0; }
    snowDots(g, 420, 77);
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#f4f6fa"; g.font = F(46); g.textAlign = "left"; g.fillText("1996", 50, 110);
    vignette(g, "rgba(10,14,24,0.55)");
  } },
  // 12: small footprints in the snow along the road, fading into the white
  footprints: { n: 1, draw: (g) => {
    g.fillStyle = "#eef1f5"; g.fillRect(0, 0, IW, IH);
    const sh = g.createLinearGradient(0, 0, 0, IH); sh.addColorStop(0, "rgba(255,255,255,0.95)"); sh.addColorStop(1, "rgba(160,170,190,0.2)"); g.fillStyle = sh; g.fillRect(0, 0, IW, IH);
    for (let i = 0; i < 9; i++) { const y = 1300 - i * 125, x = IW / 2 + (i % 2 ? 40 : -40) + Math.sin(i * 0.6) * 60, a = Math.max(0, 0.75 - i * 0.085), s = 1 - i * 0.06;
      g.fillStyle = `rgba(110,125,150,${a})`; g.beginPath(); g.ellipse(x, y, 30 * s, 52 * s, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y - 70 * s, 26 * s, 26 * s, 0, 0, 7); g.fill(); }
    snowDots(g, 260, 31, 0.8); vignette(g, "rgba(40,50,70,0.35)");
  } },
  // 14 / 20: a hospital heart monitor; step 1: the line goes flat
  monitor: { n: 2, draw: (g, st) => {
    g.fillStyle = "#06090f"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#11161f"; g.beginPath(); g.roundRect(60, 260, IW - 120, 560, 30); g.fill(); g.strokeStyle = "#2b3442"; g.lineWidth = 10; g.stroke();
    g.strokeStyle = st ? "#58f08a" : "#58f08a"; g.lineWidth = 9; g.shadowColor = "#58f08a"; g.shadowBlur = 24; g.beginPath();
    for (let x = 100; x <= IW - 100; x += 4) { const p = (x - 100) % 230; let y = 560; if (!st && p > 90 && p < 150) y = 560 - (p < 110 ? (p - 90) * 9 : p < 125 ? 180 - (p - 110) * 22 : -150 + (p - 125) * 6); if (x === 100) g.moveTo(x, y); else g.lineTo(x, y); }
    g.stroke(); g.shadowBlur = 0;
    g.fillStyle = "#58f08a"; g.font = F(64); g.textAlign = "right"; g.fillText(st ? "0" : "48", IW - 100, 360); g.font = F(30); g.fillText("BPM", IW - 100, 400);
    g.fillStyle = "#8b93a5"; g.font = F(34); g.textAlign = "left"; g.fillText("HALE, R.", 110, 340);
    vignette(g, "rgba(0,0,0,0.5)");
  } },
  // 15: the Elm Rd stop flashing past the window, motion-blurred
  passStop: { n: 1, draw: (g) => {
    g.fillStyle = "#cfc6ae"; g.fillRect(0, 0, IW, IH);
    const x0 = 70, y0 = 230, w = IW - 140, h = 760; g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    const sky = g.createLinearGradient(0, y0, 0, y0 + h); sky.addColorStop(0, "#8fc4ef"); sky.addColorStop(0.6, "#d8ecf8"); sky.addColorStop(0.61, "#5f9a4a"); sky.addColorStop(1, "#5a5d63"); g.fillStyle = sky; g.fillRect(x0, y0, w, h);
    for (let k = 0; k < 18; k++) { g.globalAlpha = 0.07; g.fillStyle = "#1f6f3f"; g.fillRect(x0 + 180 + k * 14, y0 + 170, 200, 120); g.fillStyle = "#3a3d42"; g.fillRect(x0 + 270 + k * 14, y0 + 290, 14, 360); }
    g.globalAlpha = 0.5; g.fillStyle = "#ffffff"; g.font = F(56); g.textAlign = "center"; g.fillText("ELM RD", x0 + 400, y0 + 248); g.globalAlpha = 1;
    g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 4; for (let k = 0; k < 30; k++) { const y = y0 + 40 + k * 24; g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + w, y); g.stroke(); }
    g.restore(); g.strokeStyle = "#9a9282"; g.lineWidth = 40; g.strokeRect(x0, y0, w, h);
  } },
  // 16: the back window: the road behind on a sunny day; step 1: a small handprint slaps onto the glass, and there's snow on the road
  backWindow: { n: 2, draw: (g, st) => {
    g.fillStyle = "#cfc6ae"; g.fillRect(0, 0, IW, IH);
    const x0 = 110, y0 = 260, w = IW - 220, h = 640; g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    const sky = g.createLinearGradient(0, y0, 0, y0 + h); sky.addColorStop(0, "#8fc4ef"); sky.addColorStop(0.5, "#d8ecf8"); sky.addColorStop(0.51, "#5f9a4a"); sky.addColorStop(1, "#5a5d63"); g.fillStyle = sky; g.fillRect(x0, y0, w, h);
    g.fillStyle = st ? "#eef1f5" : "#5a5d63"; g.beginPath(); g.moveTo(x0 + w / 2 - 40, y0 + h * 0.51); g.lineTo(x0 + w / 2 + 40, y0 + h * 0.51); g.lineTo(x0 + w, y0 + h); g.lineTo(x0, y0 + h); g.fill();   // the road behind
    if (st) { snowDots(g, 140, 12, 0.85); const hx = x0 + w * 0.42, hy = y0 + h * 0.42;
      g.fillStyle = "rgba(235,240,246,0.92)"; g.strokeStyle = "rgba(120,130,150,0.8)"; g.lineWidth = 5;
      g.beginPath(); g.ellipse(hx, hy + 40, 62, 72, 0, 0, 7); g.fill(); g.stroke();
      for (const [dx, dy, a] of [[-58, -55, -0.5], [-24, -88, -0.15], [14, -92, 0.1], [50, -76, 0.35], [80, 10, 1.0]]) { g.save(); g.translate(hx + dx, hy + dy + 40); g.rotate(a); g.beginPath(); g.roundRect(-14, -50, 28, 70, 14); g.fill(); g.stroke(); g.restore(); }
    }
    g.restore(); g.strokeStyle = "#9a9282"; g.lineWidth = 40; g.strokeRect(x0, y0, w, h);
    g.fillStyle = "#c0392b"; g.fillRect(x0, y0 - 90, w, 50); g.fillStyle = "#ffffff"; g.font = F(34); g.textAlign = "center"; g.fillText("EMERGENCY EXIT", IW / 2, y0 - 53);
  } },
};
const SKIN = "#f5c9a0", SLEEVE = "#1f2d4f";
const arm = (g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, w: number) => {
  const ang = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(ang) * w / 2, ny = Math.cos(ang) * w / 2;
  g.fillStyle = SLEEVE; g.strokeStyle = PLUM; g.lineWidth = 7; g.lineJoin = "round";
  g.beginPath(); g.moveTo(x0 + nx, y0 + ny); g.lineTo(x1 + nx * 0.85, y1 + ny * 0.85); g.lineTo(x1 - nx * 0.85, y1 - ny * 0.85); g.lineTo(x0 - nx, y0 - ny); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#f4f4f0"; g.beginPath(); g.ellipse(x1, y1, w * 0.45, w * 0.18, ang + Math.PI / 2, 0, 7); g.fill(); g.stroke();   // shirt cuff
};
const hand = (g: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, fist: boolean) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = SKIN; g.strokeStyle = PLUM; g.lineWidth = 7;
  g.beginPath(); g.roundRect(-r, -r * 0.9, r * 2, r * 1.8, r * 0.7); g.fill(); g.stroke();
  if (fist) { for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-r * 0.75 + k * r * 0.5, -r * 0.9); g.lineTo(-r * 0.75 + k * r * 0.5, -r * 0.3); g.stroke(); } }
  else for (let k = 0; k < 4; k++) { g.beginPath(); g.roundRect(-r * 0.95 + k * r * 0.5, -r * 2.1, r * 0.42, r * 1.3, r * 0.2); g.fill(); g.stroke(); }
  g.restore();
};
const handsTex = (v: string) => stex(`esHands_${v}`, 540, 960, (g) => {
  g.clearRect(0, 0, 540, 960);
  if (v === "reach") { arm(g, 470, 990, 330, 700, 110); hand(g, 320, 660, 46, -0.35, false); arm(g, 40, 1000, 110, 880, 100); hand(g, 120, 860, 40, 0.3, true); return; }
  for (const [x0, x1, s] of [[30, 150, 1], [510, 390, -1]] as const) {   // straps: two hands gripping the backpack straps
    g.fillStyle = "#33506e"; g.strokeStyle = PLUM; g.lineWidth = 5; g.beginPath(); g.moveTo(x1 - 14, 800); g.lineTo(x1 - s * 150 - 14, 560); g.lineTo(x1 - s * 150 + 14, 560); g.lineTo(x1 + 14, 800); g.closePath(); g.fill(); g.stroke();   // the strap, running up and out toward your shoulder
    arm(g, x0, 1000, x1 + s * 10, 830, 120); hand(g, x1, 790, 48, s * 0.15, true);
  }
});
const TITLES: Record<string, [string, string]> = { weeks: ["THREE WEEKS EARLIER", "MONDAY 7:52 AM · BUS 9"] };
const titleTex = (v: string, n: number) => stex(`esTitle_${v}_${n}`, 540, 960, (g) => {
  g.clearRect(0, 0, 540, 960); const [a, b] = TITLES[v] ?? TITLES.weeks, ta = a.slice(0, n), tb = b.slice(0, Math.max(0, n - a.length));
  g.fillStyle = "rgba(10,12,20,0.55)"; g.beginPath(); g.roundRect(80, 130, 380, 130, 14); g.fill();
  g.fillStyle = "#ffffff"; g.font = F(30); g.textAlign = "left"; g.fillText(ta + (n < a.length ? "▌" : ""), 100, 186);
  g.fillStyle = "#f2c94c"; g.font = F(21); g.fillText(tb + (n >= a.length && n < a.length + b.length ? "▌" : ""), 101, 232);
});
/** an overlay pinned 0.5 m in front of the lens, square to it, filling the frame (put `at` on the camera's look point) */
const lensRig = (a: At, tex: (step: number) => THREE.Texture): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); const k = a.s ?? 1;
  const mat = new THREE.MeshBasicMaterial({ map: tex(0), transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.27 * k, 0.48 * k), mat); m.renderOrder = 10; m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0, camPos }) => { mat.map = tex(step); const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos); } };
};
/** the blizzard rushing past outside the windows (absolute in schoolBusSnow): give it steady steps */
const streakTex = () => { const t = stex("esStreaks", 512, 256, (g) => { g.clearRect(0, 0, 512, 256); const r = rnd(29); g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 2.5; for (let i = 0; i < 180; i++) { const x = r() * 512, y = r() * 256, l = 10 + r() * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x - l, y + l * 0.45); g.stroke(); } }); return t; };
const blizzardRig = (): PropRig => {
  const root = new THREE.Group(), tex = streakTex().clone(); tex.needsUpdate = true; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 1);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  for (const sd of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 1.2), mat); m.position.set(sd * 1.32, 1.28, -0.1); m.rotation.y = -sd * Math.PI / 2; m.layers.set(NOINK); root.add(m); }
  const back = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), mat); back.position.set(0, 1.25, 5.25); back.rotation.y = Math.PI; back.layers.set(NOINK); root.add(back);
  return { root, update: ({ step = 0 }) => { tex.offset.set(step * 0.06, step * 0.02); } };
};
const insertRig = (a: At, v = "window"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.window, texAt = (st: number) => stex(`esIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(Math.max(0, Math.min(ins.n - 1, Math.ceil(step - 1e-3)))); } };
};

// ---------------------------------------------------------------- characters
const HALE: Look = { name: "Mr Hale", build: "stout", skin: "#e9bf9b", seed: 701, hair: { style: "receding", color: "#9a9590" }, glasses: { style: "square", color: "#2b2f38" },
  top: { style: "shirt", color: "#2b3954" }, layer: { style: "blazer", color: "#e2dc3c", accent: "#2b3954" }, legs: "#2b2f3a", shoes: "#2a2320" };
const SUB: Look = { name: "Stand-in driver", build: "adult", skin: "#f3cfb2", seed: 702, hair: { style: "ponytail", color: "#d9b26a" },
  top: { style: "tee", color: "#2b3954" }, layer: { style: "blazer", color: "#e2dc3c", accent: "#2b3954" }, legs: "#2b2f3a", shoes: "#2a2320" };
const NOAH: Look = { name: "Noah", build: "kid", skin: "#c99067", seed: 703, hair: { style: "short", color: "#1f1a24" },
  top: { style: "hoodie", color: "#d1403d", accent: "#f2efe6" }, legs: "#3a3d47", shoes: "#f4f1ea" };
const YOU: Look = { name: "You (The Empty Seat)", build: "kid", skin: "#f5c9a0", seed: 704, hair: { style: "curly", color: "#a5682f" },
  top: { style: "shirt", color: "#f4f4f0" }, layer: { style: "blazer", color: "#1f2d4f" }, neck: { style: "tie", color: "#a8323a" }, legs: "#4a4d55", shoes: "#1e1e22" };

export const EMPTYSEAT_THEME: Theme = {
  id: "emptyseat", name: "The Empty Seat (a school bus with one seat kept for a ghost)",
  desc: "Thinkora Ghost Stories: inside a yellow school bus on a sunny morning (22 numbered bench seats, the aisle, the driver's seat and big mirror, the folding doors, the back window), the empty Elm Road stop, the fogged window by seat 13; the driver Mr Hale, the stand-in driver, Noah the new kid, and 'you'",
  tags: ["school", "bus", "ghost", "mystery", "horror"],
  mood: "mystery",
  ambience: { schoolBus: "amb_bus_kids", schoolBusElm: "amb_bus", schoolBusSnow: "amb_snow" },
  characters: { hale: HALE, subDriver: SUB, noah: NOAH, seatKid: YOU },
  characterMeta: {
    hale: { name: "Mr Hale", desc: "in his fifties; stout; receding grey hair; square glasses; a yellow hi-vis over a navy shirt", personality: "the school-bus driver (The Empty Seat): quiet and kind; he left a girl behind in the snow in 1996 and has kept her seat ever since", themes: ["school", "ghost"], tags: ["driver", "male", "older"] },
    subDriver: { name: "Stand-in driver", desc: "a young woman; a blonde ponytail; a yellow hi-vis over a navy T-shirt", personality: "the stand-in school-bus driver (The Empty Seat) who has never heard of Elm Road", themes: ["school"], tags: ["driver", "female"] },
    noah: { name: "Noah", desc: "a new boy, about 11; short black hair; a red hoodie (no blazer yet: he's new)", personality: "the new kid (The Empty Seat) who sits in seat 13 because nobody told him", themes: ["school"], tags: ["child", "boy", "new kid"] },
    seatKid: { name: "You (The Empty Seat)", desc: "a pupil, about 11; auburn curls; navy blazer, white shirt, red tie", personality: "the 'you' of the story: a regular on bus 9 who notices things", themes: ["school", "mystery"], tags: ["child", "you", "pov"] },
  },
  props: {
    povHands: { name: "Your hands (first-person overlay)", desc: "the POV kid's own hands in front of the lens (navy blazer sleeves): variant straps (gripping the backpack straps, bottom corners) or reach (an arm reaching forward, the other fist low): an overlay pinned 0.5 m in front of the camera, square to it; put `at` on the camera's look point and give steady steps (it follows the camera); scale 1 fills a fov-50 frame", category: "theme", themes: ["pov", "overlay"], tags: ["hands", "pov", "first person", "overlay"], radius: 0.05, height: 0.48,
      build: () => undefined, rig: (a, v) => lensRig(a, () => handsTex(v ?? "straps")), steps: ["it follows the camera"], stepCount: () => 2000, variants: { straps: () => undefined, reach: () => undefined } },
    titleCard: { name: "Time card (typewriter overlay)", desc: "a time-and-place card typed out at the top of the frame: variant weeks (THREE WEEKS EARLIER · MONDAY 7:52 AM · BUS 9); one character per step (give steady steps ~0.04 s apart); an overlay pinned in front of the camera like povHands (put `at` on the look point)", category: "theme", themes: ["overlay", "title"], tags: ["title", "time", "card", "typewriter"], radius: 0.05, height: 0.48,
      build: () => undefined, rig: (a, v) => lensRig(a, (st) => titleTex(v ?? "weeks", Math.floor(st))), steps: ["one more character"], stepCount: () => 2000, variants: { weeks: () => undefined } },
    blizzard: { name: "Blizzard outside the bus", desc: "snow streaks rushing past outside every window and the back window of schoolBusSnow (absolute, whatever `at` is): give it steady steps", category: "theme", themes: ["weather", "ghost", "bus"], tags: ["snow", "blizzard", "storm"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: () => blizzardRig(), steps: ["it blows"], stepCount: () => 2000 },
    busDoors: { name: "School-bus folding doors", desc: "the two glass leaves of the bus's front doors (absolute in schoolBus*, whatever `at` is): shut; they fold open over step 1 and shut over step 2", category: "theme", themes: ["school", "bus"], tags: ["door", "bus", "open", "close"], radius: 0.05, height: 1.85,
      build: () => undefined, rig: (a) => doorsRig(a), steps: ["they open", "they close"], stepCount: () => 2 },
    fogPane: { name: "Fogged window (inside the bus)", desc: "fog on the inside of a seat's window (absolute in schoolBus*): variant 13 (left, row 7) or 14 (right, row 7) is always fogged; 13up / 14up fogs up over step 1", category: "theme", themes: ["ghost", "bus"], tags: ["fog", "window", "breath", "ghost"], radius: 0.05, height: 0.6,
      build: () => undefined, rig: (a, v) => fogRig(a, v ?? "13"), steps: ["it fogs up"], stepCount: () => 1, variants: { "13": (b) => fogStatic(b, 13), "14": (b) => fogStatic(b, 14), "13up": () => undefined, "14up": () => undefined } },
    esInsert: { name: "Close insert (The Empty Seat)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card; a state per step, switching the moment the step starts. Variants: window (seat 13's window: fog on the inside, June sun outside, the 13 plate), route (bus 9's old route: ELM RD, STOP CLOSED 1996), yearbook (a black-bordered memorial page: EMILY SHAW, 1985-1996, aged 11), snow1996 (1996, a snowstorm at the Elm Rd stop: the bus coming; step 1 it has gone past and a small girl in a red coat waves behind the snowbank), footprints (small footprints in the snow, fading), monitor (a hospital heart monitor, HALE, R., 48 bpm; step 1 the line goes flat), passStop (the Elm Rd stop flashing past the window), backWindow (the back window, the road behind; step 1 a small handprint slaps the glass and there's snow on the road)", category: "theme", themes: ["school", "ghost", "insert"], tags: ["insert", "close-up", "bus", "window", "yearbook", "snow", "clue"], radius: 0.05, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "window"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
  },
  sets: {
    schoolBus: { id: "schoolBus", title: "Inside the yellow school bus on a sunny morning (The Empty Seat)", lights: ["interior", "day", "interiorCool"], build: () => schoolBus(false) },
    schoolBusSnow: { id: "schoolBusSnow", title: "Inside the school bus in a sudden snowstorm (The Empty Seat): white-out windows, frost on the glass", lights: ["interiorCool", "night", "interior"], build: () => schoolBus("snow") },
    schoolBusElm: { id: "schoolBusElm", title: "Inside the school bus, stopped at the empty Elm Road stop (The Empty Seat)", lights: ["interior", "day", "interiorCool"], build: () => schoolBus(true) },
  },
  layouts: { schoolBus: { spots: BUS_SPOTS, views: BUS_VIEWS }, schoolBusSnow: { spots: BUS_SPOTS, views: BUS_VIEWS }, schoolBusElm: { spots: BUS_SPOTS, views: BUS_VIEWS } },
  setMeta: {
    schoolBus: { name: "School bus (inside)", desc: "inside a yellow school bus (x -1.2..1.2, floor 0, ceiling 1.95; the windscreen at z -5.2, the back window at z 5.0): 11 rows of green bench seats each side facing the front (-z), row r at z -3.3 + (r-1)*0.78, left seats odd (1..21), right even (2..22), number plates over the windows; seat 13 is row 7 left (z 1.38); the driver's seat front left (spot driver, x -0.75, z -4.25: mode sit), the folding doors front right, the big mirror; a sunny street outside every window; spots driver, aisleFront, aisleMid, aisleBack, door, seat13, seat14", themes: ["school", "bus", "ghost"], tags: ["bus", "school", "seats", "aisle", "morning"] },
    schoolBusSnow: { name: "School bus in a snowstorm", desc: "the same bus in a sudden snowstorm: every window a white-out, frost creeping in from the edges of the glass; add blizzard for snow rushing past; " + "inside a yellow school bus (x -1.2..1.2, floor 0, ceiling 1.95; the windscreen at z -5.2, the back window at z 5.0): 11 rows of bench seats each side facing the front, seat 13 row 7 left; spots driver, aisleFront, aisleMid, aisleBack, door, seat13, seat14", themes: ["school", "bus", "ghost", "weather"], tags: ["bus", "snow", "storm", "frost"] },
    schoolBusElm: { name: "School bus at the Elm Road stop", desc: "the same bus stopped at Elm Road: a green ELM RD bus-stop sign and an empty bench outside the front doors; " + "inside a yellow school bus (x -1.2..1.2, floor 0, ceiling 1.95; the windscreen at z -5.2, the back window at z 5.0): 11 rows of bench seats each side facing the front, seat 13 row 7 left; spots driver, aisleFront, aisleMid, aisleBack, door, seat13, seat14", themes: ["school", "bus", "ghost"], tags: ["bus", "stop", "doors", "empty"] },
  },
};
