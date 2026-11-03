// Interior props in the house style: soft rounded furniture (rboxGeo), painted fabrics / woods / books, unlit glow
// for screens and lamp shades. Sizes in metres at real scale (characters are ~1.68 m; seats 0.45 m; tables 0.75 m).
import * as THREE from "three";
import { Batch } from "../materials/geo";
import { fabricHD, booksHD, pictureHD, screenHD, whiteboardHD, chalkboardHD, rugHD, floorboardsHD } from "../materials/paint2";
import { beamHD } from "../materials/paint";
import { At, frame, col, tex, glow, box, rbox, cyl, sph, lathe, panel, decal } from "./kit";
import { tree } from "./nature";

const fab = (c: string) => tex("fab" + c, () => fabricHD(c), 1, 1);
const wood = (c = "#9a6a42") => col(c);
const woodTex = () => tex("beamHD", beamHD, 1, 1);

// ---------------- living room ----------------
export const sofa = (b: Batch, a: At, c = "#4f7cac", w = 2.1) => {
  const m = frame(a), f = fab(c), d = 0.9;
  rbox(b, f, m, 0, 0.08, 0, w, 0.36, d, 0.12);                          // base
  for (const s of [-1, 1]) rbox(b, f, m, s * (w / 4 - 0.02), 0.42, 0.05, w / 2 - 0.12, 0.16, d - 0.25, 0.08); // seat cushions
  rbox(b, f, m, 0, 0.36, -d / 2 + 0.13, w, 0.5, 0.26, 0.12);           // back
  for (const s of [-1, 1]) rbox(b, f, m, s * (w / 2 - 0.1), 0.08, 0, 0.22, 0.56, d, 0.1); // arms
  for (const s of [-1, 1]) for (const z of [-1, 1]) cyl(b, wood("#5a3b2a"), m, s * (w / 2 - 0.12), 0, z * (d / 2 - 0.1), 0.03, 0.025, 0.08, 8);
  rbox(b, fab("#e9c46a"), m, -w / 2 + 0.42, 0.52, -0.18, 0.4, 0.38, 0.14, 0.07, 0, -0.25);  // throw pillow
};
export const armchair = (b: Batch, a: At, c = "#c06c4a") => {
  const m = frame(a), f = fab(c);
  rbox(b, f, m, 0, 0.1, 0, 0.85, 0.34, 0.82, 0.12); rbox(b, f, m, 0, 0.44, 0.06, 0.55, 0.14, 0.6, 0.07);
  rbox(b, f, m, 0, 0.36, -0.3, 0.85, 0.62, 0.24, 0.12);
  for (const s of [-1, 1]) rbox(b, f, m, s * 0.33, 0.1, 0.02, 0.2, 0.52, 0.8, 0.09);
  for (const s of [-1, 1]) for (const z of [-1, 1]) cyl(b, wood("#5a3b2a"), m, s * 0.32, 0, z * 0.3, 0.03, 0.025, 0.1, 8);
};
export const coffeeTable = (b: Batch, a: At) => {
  const m = frame(a);
  rbox(b, wood("#a8724a"), m, 0, 0.36, 0, 1.1, 0.06, 0.6, 0.03);
  for (const s of [-1, 1]) for (const z of [-1, 1]) box(b, wood("#7a4f33"), m, s * 0.48 - 0.03, s * 0.48 + 0.03, 0, 0.36, z * 0.24 - 0.03, z * 0.24 + 0.03);
  rbox(b, col("#3f6fb5"), m, -0.25, 0.42, 0.05, 0.3, 0.04, 0.22, 0.01); rbox(b, col("#e9dcc0"), m, -0.24, 0.46, 0.06, 0.26, 0.03, 0.2, 0.01); // books
  cyl(b, col("#f1e6cf"), m, 0.25, 0.42, -0.05, 0.05, 0.05, 0.1, 12); // mug
};
export const rug = (b: Batch, a: At, w = 2.6, d = 1.8, cs: [string, string, string] = ["#b5553a", "#e9d8b4", "#2f5f6a"]) =>
  decal(b, tex(`rug${cs.join("")}`, () => rugHD(...cs), 1, 1), frame(a), 0, 0.006, 0, w, d);
export const tvUnit = (b: Batch, a: At) => {
  const m = frame(a);
  rbox(b, wood("#7a4f33"), m, 0, 0, 0, 1.6, 0.5, 0.45, 0.04);
  for (const s of [-1, 1]) box(b, col("#5a3b2a"), m, s * 0.4 - 0.36, s * 0.4 + 0.36, 0.06, 0.44, 0.226, 0.232);
  rbox(b, col("#2b2d36"), m, 0, 0.62, -0.05, 1.3, 0.76, 0.06, 0.02);
  panel(b, glow("tvscr", () => ({ map: screenHD("news") })), m, 0, 1.0, -0.015, 1.18, 0.66);
  box(b, col("#2b2d36"), m, -0.08, 0.08, 0.5, 0.62, -0.1, 0.0);
};
export const bookshelf = (b: Batch, a: At, w = 1.2, h = 2.0, seed = 0) => {
  const m = frame(a), wd = wood("#8a5a3c"), d = 0.36, shelves = 5;
  box(b, wd, m, -w / 2, w / 2, 0, 0.06, -d / 2, d / 2); box(b, wd, m, -w / 2, w / 2, h - 0.04, h, -d / 2, d / 2);
  for (const s of [-1, 1]) box(b, wd, m, s * w / 2 - 0.03, s * w / 2 + 0.03, 0, h, -d / 2, d / 2);
  box(b, col("#5a3b2a"), m, -w / 2 + 0.031, w / 2 - 0.031, 0.061, h - 0.041, -d / 2 + 0.002, -d / 2 + 0.02); // back panel inside the frame (no shared planes)
  for (let i = 0; i < shelves; i++) {
    const y = 0.06 + (i * (h - 0.1)) / shelves;
    box(b, wd, m, -w / 2, w / 2, y, y + 0.03, -d / 2, d / 2);
    panel(b, tex(`books${seed + i}`, () => booksHD(seed + i), w / 1.6, 1), m, 0, y + 0.03 + 0.17, d / 2 - 0.06, w - 0.06, 0.32);
  }
  sph(b, col("#c9a24e"), m, w / 2 - 0.2, h + 0.1, 0, 0.1, 0.1, 0.1); // a little globe ornament
};
export const floorLamp = (b: Batch, a: At) => {
  const m = frame(a);
  cyl(b, col("#3a3d47"), m, 0, 0, 0, 0.18, 0.16, 0.04, 16); cyl(b, col("#3a3d47"), m, 0, 0, 0, 0.018, 0.018, 1.5, 8);
  lathe(b, glow("shade", () => ({ color: "#ffe9b8" })), m, 0, 1.38, 0, [[0.24, 0], [0.16, 0.32]], 20);
};
/** ceiling pendant lamp hanging from y (ceiling height) */
export const pendant = (b: Batch, a: At, drop = 0.7) => {
  const m = frame({ ...a, y: 0 }), y = a.y ?? 2.8;
  cyl(b, col("#3a3d47"), m, 0, y - drop, 0, 0.008, 0.008, drop, 6);
  lathe(b, col("#2f5f6a"), m, 0, y - drop - 0.22, 0, [[0.3, 0], [0.26, 0.04], [0.08, 0.22], [0.03, 0.24]], 22);
  sph(b, glow("bulb", () => ({ color: "#fff4d6" })), m, 0, y - drop - 0.2, 0, 0.09, 0.07, 0.09, 12);
};
export const plant = (b: Batch, a: At, h = 1.0, potCol = "#c8643f", seed = 2) => {
  const m = frame(a);
  lathe(b, col(potCol), m, 0, 0, 0, [[0.13, 0], [0.18, 0.3], [0.2, 0.32], [0.2, 0.36]], 18);
  const x = a.x, z = a.z, y = a.y ?? 0;
  tree(b, "bush", x, y + 0.3, z, h * 0.75, seed, 0);
  void m;
};
export const picture = (b: Batch, a: At, w = 0.8, h = 0.62, kind = 0, frameCol = "#5a3b2a") => {
  const m = frame(a);
  rbox(b, col(frameCol), m, 0, -h / 2 - 0.04, 0.0, w + 0.08, h + 0.08, 0.04, 0.012);
  panel(b, tex("pic" + kind, () => pictureHD(kind)), m, 0, 0, 0.041, w, h);
};
export const clock = (b: Batch, a: At) => {
  const m = frame(a);
  cyl(b, col("#3a3d47"), m, 0, 0, 0, 0.2, 0.2, 0.05, 24, Math.PI / 2);
  cyl(b, col("#f7f1e1"), m, 0, 0, 0.051, 0.17, 0.17, 0.005, 24, Math.PI / 2);
  box(b, col("#241726"), m, -0.008, 0.008, 0, 0.12, 0.056, 0.062); box(b, col("#241726"), m, 0, 0.09, -0.008, 0.008, 0.056, 0.062);
};
export const curtains = (b: Batch, a: At, w = 1.6, h = 1.9, c = "#c25a7a") => {
  const m = frame(a), f = fab(c);
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) rbox(b, f, m, s * (w / 2 - 0.08 - k * 0.1), 0, 0.05 + (k % 2) * 0.03, 0.14, h, 0.08, 0.06);
  cyl(b, col("#3a3d47"), m, -w / 2 - 0.1, h + 0.02, 0.06, 0.015, 0.015, w + 0.2, 8, 0, -Math.PI / 2);
};

// ---------------- kitchen ----------------
export const counter = (b: Batch, a: At, w = 2.4, c = "#5f8f86", top = "#e9e2d4") => {
  const m = frame(a), d = 0.62, n = Math.max(1, Math.round(w / 0.6));
  rbox(b, col(c), m, 0, 0.08, 0, w, 0.8, d, 0.02);
  box(b, col("#3a2e2a"), m, -w / 2 + 0.02, w / 2 - 0.02, 0, 0.08, -d / 2 + 0.05, d / 2 - 0.06);
  for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * (w / n); box(b, col("#d9d2c4"), m, x - 0.1, x + 0.1, 0.72, 0.74, d / 2, d / 2 + 0.02); box(b, col("#2f2a2a"), m, x - w / n / 2 + 0.01, x - w / n / 2 + 0.015, 0.1, 0.86, d / 2, d / 2 + 0.005); }
  rbox(b, col(top), m, 0, 0.88, 0.02, w + 0.04, 0.05, d + 0.04, 0.015);
  // a few things on top: kettle, fruit bowl, jar
  lathe(b, col("#c0353a"), m, -w / 2 + 0.35, 0.93, 0, [[0.1, 0], [0.12, 0.08], [0.1, 0.2], [0.04, 0.24]], 18);
  lathe(b, col("#f1e6cf"), m, 0.2, 0.93, 0.05, [[0.06, 0], [0.16, 0.08], [0.17, 0.09]], 18);
  for (const [x, z, c2] of [[0.15, 0.05, "#f4b23a"], [0.25, 0.02, "#e2453c"], [0.2, 0.12, "#7ab65e"]] as const) sph(b, col(c2), m, x, 1.04, z, 0.055, 0.055, 0.055, 12);
};
export const fridge = (b: Batch, a: At, c = "#eef0ee") => {
  const m = frame(a);
  rbox(b, col(c), m, 0, 0, 0, 0.75, 1.85, 0.7, 0.06);
  box(b, col("#c9cdd0"), m, -0.36, 0.36, 1.18, 1.2, 0.35, 0.352);
  for (const y of [0.75, 1.45]) box(b, col("#9aa0a6"), m, 0.28, 0.31, y - 0.2, y + 0.2, 0.35, 0.39);
  for (const [x, y, c2] of [[-0.15, 1.5, "#f4d24a"], [0.0, 1.6, "#3f6fb5"], [-0.2, 1.3, "#e2453c"]] as const) box(b, col(c2), m, x - 0.05, x + 0.05, y - 0.04, y + 0.04, 0.35, 0.36); // magnets
};
export const stove = (b: Batch, a: At) => {
  const m = frame(a);
  rbox(b, col("#e8e6e0"), m, 0, 0, 0, 0.7, 0.9, 0.62, 0.03);
  box(b, col("#3a3d47"), m, -0.3, 0.3, 0.2, 0.62, 0.31, 0.32);
  for (const [x, z] of [[-0.17, -0.12], [0.17, -0.12], [-0.17, 0.12], [0.17, 0.12]]) cyl(b, col("#2b2d36"), m, x, 0.9, z, 0.1, 0.1, 0.012, 16);
  lathe(b, col("#7d8088"), m, 0.17, 0.912, 0.12, [[0.12, 0], [0.13, 0.14]], 18); // pot
};

// ---------------- office / classroom ----------------
export const desk = (b: Batch, a: At, w = 1.4, c = "#c8a272") => {
  const m = frame(a), d = 0.7;
  rbox(b, col(c), m, 0, 0.72, 0, w, 0.04, d, 0.015);
  for (const s of [-1, 1]) box(b, col("#7d8088"), m, s * (w / 2 - 0.06) - 0.025, s * (w / 2 - 0.06) + 0.025, 0, 0.72, -d / 2 + 0.06, d / 2 - 0.06);
  rbox(b, col(c), m, w / 2 - 0.25, 0.12, 0, 0.42, 0.56, d - 0.1, 0.015); // drawer unit
  for (const y of [0.3, 0.5]) box(b, col("#7d8088"), m, w / 2 - 0.3, w / 2 - 0.2, y, y + 0.02, d / 2 - 0.05, d / 2 - 0.03);
};
export const officeChair = (b: Batch, a: At, c = "#3a3d47") => {
  const m = frame(a);
  for (let i = 0; i < 5; i++) { // star base: five spokes from the column, a castor at each tip
    const t = (i / 5) * Math.PI * 2 + 0.3, sm = m.clone().multiply(new THREE.Matrix4().makeRotationY(t));
    box(b, col("#2b2d36"), sm, -0.02, 0.02, 0.05, 0.08, 0, 0.3); sph(b, col("#2b2d36"), sm, 0, 0.035, 0.3, 0.035, 0.035, 0.035, 8);
  }
  cyl(b, col("#7d8088"), m, 0, 0.052, 0, 0.025, 0.025, 0.378, 8); // column base clear of the spokes' underside plane
  rbox(b, fab(c), m, 0, 0.42, 0, 0.5, 0.08, 0.48, 0.04);
  rbox(b, fab(c), m, 0, 0.55, -0.24, 0.46, 0.5, 0.07, 0.05, 0, 0.12);
};
export const monitor = (b: Batch, a: At, kind: "chart" | "code" | "news" = "chart") => {
  const m = frame(a);
  box(b, col("#2b2d36"), m, -0.1, 0.1, 0, 0.015, -0.08, 0.08); box(b, col("#2b2d36"), m, -0.02, 0.02, 0, 0.2, -0.03, 0.0);
  rbox(b, col("#2b2d36"), m, 0, 0.16, 0.0, 0.58, 0.36, 0.03, 0.01);
  panel(b, glow("scr" + kind, () => ({ map: screenHD(kind) })), m, 0, 0.34, 0.017, 0.54, 0.32);
  rbox(b, col("#e8e6e0"), m, 0, 0, 0.25, 0.42, 0.02, 0.13, 0.008); // keyboard
};
export const chair = (b: Batch, a: At, c = "#c8643f") => {
  const m = frame(a);
  rbox(b, col(c), m, 0, 0.42, 0, 0.44, 0.04, 0.42, 0.02);
  rbox(b, col(c), m, 0, 0.5, -0.19, 0.42, 0.34, 0.04, 0.02);
  for (const s of [-1, 1]) for (const z of [-1, 1]) box(b, col("#7d8088"), m, s * 0.18 - 0.015, s * 0.18 + 0.015, 0, 0.42, z * 0.17 - 0.015, z * 0.17 + 0.015);
};
export const schoolDesk = (b: Batch, a: At, seat = "#c8643f") => {
  const m = frame(a);
  rbox(b, col("#d8b98f"), m, 0, 0.7, 0.1, 0.7, 0.03, 0.5, 0.01);
  for (const s of [-1, 1]) box(b, col("#7d8088"), m, s * 0.3 - 0.015, s * 0.3 + 0.015, 0, 0.7, 0.08, 0.11);
  box(b, col("#7d8088"), m, -0.3, 0.3, 0.12, 0.15, 0.08, 0.11);
  chair(b, { x: a.x - Math.sin(a.yaw ?? 0) * 0.45, z: a.z - Math.cos(a.yaw ?? 0) * 0.45, yaw: a.yaw ?? 0, y: a.y }, seat);
  rbox(b, col("#3f6fb5"), m, -0.12, 0.73, 0.12, 0.22, 0.02, 0.28, 0.005); // exercise book
};
export const board = (b: Batch, a: At, w = 3.2, h = 1.2, kind: "chalk" | "white" = "chalk", topic: "math" | "science" | "history" | "chart" | "formula" | "plan" = "math") => {
  const m = frame(a);
  const t = kind === "chalk" ? tex("chalk" + topic, () => chalkboardHD(topic as "math"), 1, 1) : tex("wb" + topic, () => whiteboardHD(topic as "chart"), 1, 1);
  rbox(b, col(kind === "chalk" ? "#8a5a3a" : "#b8bcc2"), m, 0, -h / 2 - 0.05, 0, w + 0.1, h + 0.1, 0.04, 0.012);
  panel(b, t, m, 0, 0, 0.042, w, h);
  box(b, col(kind === "chalk" ? "#8a5a3a" : "#b8bcc2"), m, -w / 2, w / 2, -h / 2 - 0.08, -h / 2 - 0.05, 0.0, 0.1); // tray
};
export const filingCabinet = (b: Batch, a: At, c = "#9aa3ab") => {
  const m = frame(a);
  rbox(b, col(c), m, 0, 0, 0, 0.48, 1.3, 0.6, 0.02);
  for (let i = 0; i < 4; i++) { const y = 0.16 + i * 0.31; box(b, col("#5c636b"), m, -0.08, 0.08, y, y + 0.03, 0.3, 0.33); box(b, col("#7d858d"), m, -0.22, 0.22, y - 0.14, y - 0.135, 0.3, 0.305); }
};
export const waterCooler = (b: Batch, a: At) => {
  const m = frame(a);
  rbox(b, col("#e8e6e0"), m, 0, 0, 0, 0.36, 1.0, 0.36, 0.03);
  lathe(b, col("#8fc5ea"), m, 0, 1.0, 0, [[0.05, 0], [0.15, 0.06], [0.16, 0.35], [0.12, 0.42], [0.03, 0.44]], 18);
  box(b, col("#3f6fb5"), m, -0.04, 0.04, 0.72, 0.78, 0.18, 0.22);
};
export const wallShelf = (b: Batch, a: At, w = 1.2, seed = 0) => {
  const m = frame(a);
  box(b, wood("#8a5a3c"), m, -w / 2, w / 2, 0, 0.03, -0.12, 0.12);
  panel(b, tex(`books${seed + 9}`, () => booksHD(seed + 9), w / 1.6, 1), m, -w * 0.15, 0.19, 0.0, w * 0.6, 0.32);
  lathe(b, col("#c8643f"), m, w * 0.35, 0.03, 0, [[0.06, 0], [0.08, 0.12], [0.08, 0.14]], 14);
  tree(b, "bush", a.x + Math.cos(a.yaw ?? 0) * w * 0.35, (a.y ?? 0) + 0.15, a.z - Math.sin(a.yaw ?? 0) * w * 0.35, 0.28, seed + 3, 1);
};

// ---------------- lab ----------------
export const labBench = (b: Batch, a: At, w = 2.4) => {
  const m = frame(a), d = 0.75;
  rbox(b, col("#e9ecef"), m, 0, 0.08, 0, w, 0.8, d, 0.02);
  box(b, col("#3a3d47"), m, -w / 2 + 0.02, w / 2 - 0.02, 0, 0.08, -d / 2 + 0.05, d / 2 - 0.05);
  const n = Math.round(w / 0.6);
  for (let i = 0; i < n; i++) { const x = -w / 2 + (i + 0.5) * (w / n); box(b, col("#5c87b2"), m, x - w / n / 2 + 0.02, x + w / n / 2 - 0.02, 0.12, 0.84, d / 2, d / 2 + 0.01); box(b, col("#d9dde0"), m, x - 0.08, x + 0.08, 0.74, 0.76, d / 2 + 0.01, d / 2 + 0.03); }
  rbox(b, col("#2f3540"), m, 0, 0.88, 0, w + 0.04, 0.05, d + 0.04, 0.01); // epoxy top
};
/** a lab flask / beaker / bottle with coloured liquid (glass drawn as a pale tint, opaque for clean ink) */
export const flask = (b: Batch, a: At, kind: "erlen" | "round" | "beaker" | "tube" = "erlen", liquid = "#4fd18b", s = 1) => {
  const m = frame({ ...a, s });
  const glass = col("#dcecf1"), liq = col(liquid);
  if (kind === "erlen") { lathe(b, liq, m, 0, 0, 0, [[0.001, 0], [0.09, 0], [0.085, 0.03], [0.05, 0.09], [0.001, 0.09]], 20); lathe(b, glass, m, 0, 0.088, 0, [[0.052, 0], [0.025, 0.07], [0.022, 0.13], [0.028, 0.14]], 20); }
  else if (kind === "round") { sph(b, liq, m, 0, 0.08, 0, 0.08, 0.08, 0.08, 18); cyl(b, glass, m, 0, 0.15, 0, 0.022, 0.022, 0.1, 12); }
  else if (kind === "beaker") { cyl(b, liq, m, 0, 0, 0, 0.06, 0.06, 0.07, 18); cyl(b, glass, m, 0, 0.07, 0, 0.061, 0.063, 0.06, 18); }
  else { cyl(b, liq, m, 0, 0, 0, 0.012, 0.012, 0.06, 10); cyl(b, glass, m, 0, 0.06, 0, 0.013, 0.013, 0.08, 10); }
};
export const microscope = (b: Batch, a: At) => {
  const m = frame(a), dark = col("#3a3d47"), white = col("#eef0f2");
  rbox(b, white, m, 0, 0, 0, 0.18, 0.04, 0.24, 0.02);
  box(b, white, m, -0.03, 0.03, 0.04, 0.3, -0.1, -0.05);
  box(b, dark, m, -0.07, 0.07, 0.12, 0.13, -0.04, 0.08);
  cyl(b, white, m, 0, 0.2, 0.0, 0.035, 0.03, 0.18, 14, -0.45);
  cyl(b, dark, m, 0, 0.36, -0.07, 0.02, 0.02, 0.06, 10, -0.45);
};
export const testTubeRack = (b: Batch, a: At, cols = ["#4fd18b", "#e2453c", "#3f8fd8", "#f4d24a", "#b06ad8"]) => {
  const m = frame(a);
  box(b, wood("#c8a272"), m, -0.17, 0.17, 0.0, 0.015, -0.04, 0.04); box(b, wood("#c8a272"), m, -0.17, 0.17, 0.09, 0.105, -0.04, 0.04);
  for (const s of [-1, 1]) box(b, wood("#c8a272"), m, s * 0.17 - 0.01, s * 0.17 + 0.01, 0, 0.105, -0.04, 0.04);
  cols.forEach((c, i) => flask(b, { x: a.x + Math.cos(a.yaw ?? 0) * (-0.13 + i * 0.065), z: a.z - Math.sin(a.yaw ?? 0) * (-0.13 + i * 0.065), y: (a.y ?? 0) + 0.015 }, "tube", c));
};
export const jarShelf = (b: Batch, a: At, w = 1.6) => {
  const m = frame(a), cols = ["#4fd18b", "#e2453c", "#3f8fd8", "#f4d24a", "#b06ad8", "#f08a2c"];
  for (let k = 0; k < 3; k++) { const y = 0.4 + k * 0.42; box(b, col("#d9dde0"), m, -w / 2, w / 2, y, y + 0.025, -0.15, 0.15); }
  // jars: done with lathes in the shelf frame so they follow its yaw
  for (let k = 0; k < 3; k++) for (let i = 0; i < 6; i++) {
    const x = -w / 2 + 0.16 + i * ((w - 0.32) / 5), y = 0.4 + k * 0.42 + 0.025;
    lathe(b, col(cols[(i + k * 2) % 6]), m, x, y, 0, [[0.05, 0], [0.055, 0.1], [0.05, 0.12]], 14);
    cyl(b, col("#3a3d47"), m, x, y + 0.12, 0, 0.04, 0.04, 0.025, 12);
  }
  box(b, col("#9aa0a6"), m, -w / 2 - 0.03, -w / 2, 0.0, 1.35, -0.15, 0.15); box(b, col("#9aa0a6"), m, w / 2, w / 2 + 0.03, 0.0, 1.35, -0.15, 0.15);
};
export const fumeHood = (b: Batch, a: At) => {
  const m = frame(a);
  rbox(b, col("#e9ecef"), m, 0, 0, 0, 1.5, 2.3, 0.85, 0.03);
  box(b, col("#3a4a5a"), m, -0.65, 0.65, 0.95, 1.95, 0.42, 0.43);
  panel(b, glow("hoodglass", () => ({ color: "#a8d4e6" })), m, 0, 1.45, 0.435, 1.26, 0.96);
  box(b, col("#c9cdd0"), m, -0.7, 0.7, 0.88, 0.95, 0.38, 0.48);
  box(b, col("#f4d24a"), m, 0.5, 0.62, 2.02, 2.14, 0.425, 0.435);
};
export const sink = (b: Batch, a: At) => { const m = frame(a); box(b, col("#c9cdd0"), m, -0.3, 0.3, 0.86, 0.9, -0.22, 0.22); cyl(b, col("#9aa0a6"), m, 0, 0.9, -0.18, 0.015, 0.015, 0.28, 8); cyl(b, col("#9aa0a6"), m, 0, 1.16, -0.18, 0.015, 0.015, 0.16, 8, Math.PI / 2); };

/** floorboards material for rooms (shared) */
export const floorMat = (fills?: string[]) => tex("floor" + (fills ?? []).join(""), () => floorboardsHD(fills), 1, 1);
export { woodTex };
