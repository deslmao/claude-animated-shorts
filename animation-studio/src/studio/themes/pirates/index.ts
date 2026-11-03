// Pirates theme (created for "Pirates ran surprisingly democratic ships"; reused by "The truth about buried pirate
// treasure" and any later pirate / sailing / golden-age-of-piracy topic). Everything a pirate Short needs beyond the
// base library: a ship's deck set, a crew (captain, quartermaster, pirate outfits for the leads, the "pirate" crowd
// era in characters/cast.ts), ship props and hand-held items. Base items already in the library and reused here:
// treasure map, gold coin, compass, cutlass, telescope, flag, bottle; props: barrel, crate.
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import type { Pen, P2 } from "../../characters/toon";
import { Batch } from "../../materials/geo";
import type { View } from "../../sets/types";
import type { Layout } from "../../sets/layouts";
import type { V3 } from "../../camera/keys";
import { V, lam, quadUp, tri } from "../../materials/geo";
import { planksHD, ctex, rng } from "../../materials/paint";
import { At, frame, col, tex, box, cyl, sph, panel } from "../../props/kit";
import { barrel, crate } from "../../props/outdoor";
import { clearOf } from "../../sets/clear";
import { fitShot, FitOpts } from "../../camera/framing";

const INK = "#3a2340";
const deg = Math.PI / 180;

// ---------------- characters ----------------
/** Captain Redd: the elected captain. Tall, tricorn with gold braid, red frock coat, black curls, goatee + thin moustache */
const CAPTAIN: Look = {
  name: "Captain Redd", build: "tall", skin: "#e8b896", seed: 21,
  hair: { style: "curly", color: "#1f1a24" },
  brow: { k: 1.3 },
  moustache: { style: "thin", color: "#1f1a24" },
  beard: { style: "goatee", color: "#1f1a24" },
  top: { style: "shirt", color: "#f2ece0" },
  layer: { style: "longcoat", color: "#b8323a", accent: "#e8c45a" },
  legs: "#2e2a36", shoes: "#2a201a",
  hat: { style: "tricorn", color: "#2e2a2a", trim: "#e8c45a" },
};
/** Mags the quartermaster: the crew's elected second officer. Bandana, eyepatch, striped shirt, green waistcoat */
const QUARTERMASTER: Look = {
  name: "Mags", build: "petite", skin: "#a8714c", seed: 24,
  hair: { style: "ponytail", color: "#3a2418" },
  brow: { quirk: 2 },
  top: { style: "stripes", color: "#f2ece0", accent: "#2f4a7a" },
  layer: { style: "waistcoat", color: "#3a6b3a", accent: "#e8c45a" },
  legs: "#5a4636", shoes: "#2a201a",
  hat: { style: "bandana", color: "#c0353a", trim: "#f6efe0" },
  eyepatch: { side: 1 },
};
/** Captain William Kidd (1645-1701), for history topics: powdered-wig curls, blue frock coat, tricorn */
const KIDD: Look = {
  name: "Captain Kidd", build: "adult", skin: "#f0c8a8", seed: 27,
  hair: { style: "curly", color: "#d9d2c4" },
  brow: { color: "#6b5a48", k: 1.2 },
  top: { style: "shirt", color: "#f6f1e6" },
  layer: { style: "longcoat", color: "#2f4a7a", accent: "#e8c45a" },
  neck: { style: "bowtie", color: "#f6f1e6" },
  legs: "#3a2b2b", shoes: "#2a201a",
  hat: { style: "tricorn", color: "#2a2430", trim: "#c9a24a" },
};
// pirate outfits for the leads: each keeps its silhouette cues (Milo: spiky tuft + mustard; Juno: bob + glasses +
// teal; Gus: bald dome + side puffs + walrus moustache + bow tie colour)
const MILO_PIRATE: Look = {
  name: "Milo", build: "adult", skin: "#f5c9a0", seed: 3,
  hair: { style: "tuft", color: "#4a2f22" },
  top: { style: "stripes", color: "#f6efe0", accent: "#e9a93b" },
  legs: "#5a4636", shoes: "#3a2b20",
  eyes: { shock: 1.2 },
};
const JUNO_PIRATE: Look = {
  name: "Juno", build: "tall", skin: "#c99067", seed: 6,
  hair: { style: "bob", color: "#211a26" },
  brow: { quirk: 3 },
  glasses: { style: "round", color: "#3a2340" },
  top: { style: "shirt", color: "#f2ece0" },
  layer: { style: "longcoat", color: "#23968a", accent: "#e8c45a" },
  legs: "#2f3448", shoes: "#3a2b2b",
};
const GUS_PIRATE: Look = {
  name: "Gus", build: "stout", skin: "#ffe2c2", seed: 2,
  hair: { style: "horseshoe", color: "#bdb8b1" },
  brow: { color: "#6f6962", k: 1.7 },
  moustache: { style: "walrus", color: "#d3cec7" },
  top: { style: "stripes", color: "#f2e6c8", accent: "#c0353a" },
  layer: { style: "waistcoat", color: "#5a3b2a", accent: "#e8c45a" },
  legs: "#4a4036", shoes: "#3a2b20",
};

// ---------------- props ----------------
/** a rod (cylinder) between two points in world space: rigging, rails, spokes */
const rod = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, a: V3, c: V3, r: number, seg = 6) => {
  const A = V(...a), C = V(...c), d = C.clone().sub(A), L = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
  b.add(new THREE.CylinderGeometry(r, r, L, seg).translate(0, L / 2, 0), mat, m.clone().multiply(new THREE.Matrix4().compose(A, q, V(1, 1, 1))));
};
const ring = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x: number, y: number, z: number, R: number, r: number, rx = 0, seg = 28) =>
  b.add(new THREE.TorusGeometry(R, r, 8, seg), mat, m.clone().multiply(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, 0, 0)), V(1, 1, 1))));

/** ship's cannon on a wooden carriage; the muzzle points along local +z (yaw it toward a gun port) */
const cannon = (b: Batch, a: At) => {
  const m = frame(a), wood = col("#8a5a3c"), dark = col("#3a3d47"), iron = col("#2f3038");
  box(b, wood, m, -0.3, 0.3, 0.12, 0.42, -0.55, 0.45);                       // carriage
  box(b, wood, m, -0.3, 0.3, 0.42, 0.58, -0.55, -0.1);                       // stepped rear
  for (const sx of [-1, 1]) for (const z of [-0.42, 0.32]) cyl(b, dark, m, sx * 0.31, 0.14, z, 0.14, 0.14, 0.07, 14, 0, (sx * Math.PI) / 2); // wheels
  cyl(b, iron, m, 0, 0.55, -0.55, 0.2, 0.15, 1.45, 18, Math.PI / 2);         // barrel
  sph(b, iron, m, 0, 0.55, -0.6, 0.19, 0.19, 0.17);                          // breech
  cyl(b, iron, m, 0, 0.55, 0.82, 0.19, 0.19, 0.1, 18, Math.PI / 2);          // muzzle ring
  cyl(b, col("#16161c"), m, 0, 0.55, 0.9, 0.1, 0.1, 0.03, 14, Math.PI / 2);  // bore
};
/** treasure chest: banded wooden chest; open = lid up and heaped with gold */
const chest = (b: Batch, a: At, open = false) => {
  const m = frame(a), wood = col("#8a4f2c"), band = col("#c9a24a"), gold = col("#f0c040");
  box(b, wood, m, -0.42, 0.42, 0, 0.42, -0.27, 0.27);
  for (const x of [-0.3, 0.3]) box(b, band, m, x - 0.035, x + 0.035, -0.005, 0.425, -0.28, 0.28);
  box(b, band, m, -0.06, 0.06, 0.3, 0.42, 0.27, 0.29);                       // lock plate
  if (open) {
    for (let i = 0; i < 26; i++) { const r = rng(i + 5), x = (r() - 0.5) * 0.7, z = (r() - 0.5) * 0.42, y = 0.42 + 0.1 * (1 - (x * x) / 0.16) * r(); sph(b, gold, m, x, y, z, 0.07, 0.03, 0.07, 10); }
    sph(b, gold, m, 0, 0.42, 0, 0.36, 0.1, 0.22, 16);
    sph(b, col("#c0353a"), m, 0.12, 0.5, 0.05, 0.05, 0.05, 0.05, 10); sph(b, col("#2a9d8f"), m, -0.16, 0.49, -0.04, 0.045, 0.045, 0.045, 10);
    // lid hinged at the back, tilted open
    const lid = m.clone().multiply(new THREE.Matrix4().compose(V(0, 0.42, -0.27), new THREE.Quaternion().setFromEuler(new THREE.Euler(-105 * deg, 0, 0)), V(1, 1, 1)));
    cyl(b, wood, lid, -0.42, 0, 0.27, 0.27, 0.27, 0.84, 16, 0, -Math.PI / 2);
    for (const x of [-0.3, 0.3]) cyl(b, band, lid, x - 0.035, 0, 0.27, 0.28, 0.28, 0.07, 16, 0, -Math.PI / 2);
  } else {
    cyl(b, wood, m, -0.42, 0.42, 0, 0.27, 0.27, 0.84, 16, 0, -Math.PI / 2);   // rounded lid
    for (const x of [-0.3, 0.3]) cyl(b, band, m, x - 0.035, 0.42, 0, 0.28, 0.28, 0.07, 16, 0, -Math.PI / 2);
  }
};
/** ship's wheel on its post; the helmsman stands on the +z side (behind it), facing -z */
const shipWheel = (b: Batch, a: At) => {
  const m = frame(a), wood = col("#8a5a3c"), dark = col("#5a3b2a"), brass = col("#c9a24a");
  box(b, dark, m, -0.14, 0.14, 0, 0.8, -0.14, 0.14);                         // post
  box(b, wood, m, -0.2, 0.2, 0.8, 0.87, -0.2, 0.2);
  const cy = 1.05, cz = 0.18;
  ring(b, wood, m, 0, cy, cz, 0.46, 0.035);
  ring(b, wood, m, 0, cy, cz, 0.2, 0.03);
  cyl(b, brass, m, 0, cy, cz - 0.08, 0.08, 0.08, 0.16, 14, Math.PI / 2);     // hub
  for (let i = 0; i < 8; i++) { const t = (i / 8) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); rod(b, wood, m, [0, cy, cz], [c * 0.6, cy + s * 0.6, cz], 0.025); sph(b, wood, m, c * 0.6, cy + s * 0.6, cz, 0.035, 0.035, 0.035, 8); }
};
/** coiled rope on the deck */
const ropeCoil = (b: Batch, a: At) => {
  const m = frame(a), rope = col("#c9a872");
  for (let i = 0; i < 4; i++) ring(b, rope, m, 0, 0.04 + i * 0.065, 0, 0.32 - i * 0.03, 0.04, Math.PI / 2, 24);
};
/** anchor leaning on the deck (or hung over the side) */
const anchor = (b: Batch, a: At) => {
  const m = frame(a), iron = col("#3a3d47");
  cyl(b, iron, m, 0, 0.12, 0, 0.05, 0.05, 1.3, 10);
  ring(b, iron, m, 0, 1.5, 0, 0.1, 0.03);
  box(b, iron, m, -0.3, 0.3, 1.18, 1.24, -0.04, 0.04);
  for (const s of [-1, 1]) { rod(b, iron, m, [0, 0.12, 0], [s * 0.42, 0.42, 0], 0.045, 8); sph(b, iron, m, s * 0.44, 0.45, 0, 0.08, 0.06, 0.05, 8); }
};
/** ship's mast with a yard and a furled sail, for docks and beaches (the deck set builds its own rig) */
const jollyRogerTex = () => ctex("jollyRoger", 512, 340, (g) => {
  g.fillStyle = "#1d1a22"; g.fillRect(0, 0, 512, 340);
  g.fillStyle = "#f2ead8"; g.strokeStyle = "#f2ead8"; g.lineCap = "round";
  g.lineWidth = 34; for (const [x0, y0, x1, y1] of [[150, 300, 362, 190], [150, 190, 362, 300]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
  for (const [x, y] of [[150, 300], [362, 190], [150, 190], [362, 300]]) { g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); }
  g.beginPath(); g.ellipse(256, 120, 82, 76, 0, 0, 7); g.fill(); g.fillRect(212, 160, 88, 50);
  g.fillStyle = "#1d1a22"; for (const x of [222, 290]) { g.beginPath(); g.ellipse(x, 120, 22, 24, 0, 0, 7); g.fill(); }
  g.beginPath(); g.moveTo(256, 140); g.lineTo(244, 166); g.lineTo(268, 166); g.fill();
  for (const x of [232, 256, 280]) g.fillRect(x - 3, 180, 6, 30);
});
const jollyRoger = (b: Batch, a: At) => {
  const m = frame(a);
  cyl(b, col("#6b4a2a"), m, 0, 0, 0, 0.04, 0.035, 3.2, 8);
  panel(b, lam("jollyRoger", () => ({ map: jollyRogerTex(), side: THREE.DoubleSide })), m, 0.62, 2.7, 0, 1.2, 0.8);
};

// ---------------- hand-held items ----------------
const Rc = (cx: number, cy: number, w: number, h: number, a = 0): P2[] => {
  const c = Math.cos(a), si = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as P2[]).map(([x, y]) => [cx + x * c - y * si, cy + x * si + y * c]);
};
const scroll = (p: Pen, x: number, y: number, u: number, s: number) => {
  // an unrolled parchment (the ship's articles): rolled ends, lines of writing, signatures, a red seal
  const cx = x + 8 * u * s, cy = y - 22 * u;
  p.poly(Rc(cx, cy, 30 * u, 40 * u, 0.06 * s), "#efdcae", 3 * u);
  for (const dy of [-20, 20]) p.ell(cx + dy * 0.06 * s * u, cy + dy * u, 18 * u, 3.6 * u, "#d8bf80", 2.2 * u);
  for (let i = 0; i < 5; i++) { const ly = cy - 12 * u + i * 5.5 * u; p.stroke([[cx - 10 * u, ly], [cx + (i === 4 ? 2 : 10) * u, ly + 0.6 * s * u]], 1.3 * u, "#8a6a4a"); }
  p.stroke([[cx - 9 * u, cy + 15 * u], [cx - 4 * u, cy + 13 * u], [cx, cy + 15.5 * u], [cx + 4 * u, cy + 13 * u]], 1.4 * u, INK);
  p.ell(cx + 8 * u, cy + 13 * u, 3.6 * u, 3.6 * u, "#c0353a", 1.2 * u);
};
const coinBag = (p: Pen, x: number, y: number, u: number, s: number) => {
  // a tied leather purse of coins (a share of the loot)
  const cx = x + 3 * u * s, cy = y + 4 * u;
  p.ell(cx, cy, 15 * u, 13 * u, "#a8743f", 3 * u);
  p.poly([[cx - 6 * u, cy - 11 * u], [cx + 6 * u, cy - 11 * u], [cx + 9 * u, cy - 19 * u], [cx - 9 * u, cy - 19 * u]], "#a8743f", 2.6 * u);
  p.stroke([[cx - 7 * u, cy - 11 * u], [cx + 7 * u, cy - 11 * u]], 2.4 * u, "#5a3b2a");
  p.ell(cx - 3 * u * s, cy - 20 * u, 4 * u, 3 * u, "#f0c040", 1.6 * u); p.ell(cx + 4 * u * s, cy - 21 * u, 4 * u, 3 * u, "#f0c040", 1.6 * u);
  p.stroke([[cx - 2 * u, cy + 2 * u], [cx + 4 * u, cy - 2 * u]], 1.4 * u, "#7a4f33");
};
const tricornHat = (p: Pen, x: number, y: number, u: number, s: number) => {
  // a captain's tricorn held in the hand (doffed, nervous, humble)
  const cx = x + 4 * u * s, cy = y - 8 * u;
  p.ell(cx, cy - 6 * u, 16 * u, 11 * u, "#2e2a2a", 3 * u, 180, 360);
  p.poly([[cx - 27 * u, cy - 4 * u], [cx, cy + 6 * u], [cx + 27 * u, cy - 4 * u], [cx + 18 * u, cy - 11 * u], [cx, cy - 3 * u], [cx - 18 * u, cy - 11 * u]], "#3a3434", 3 * u);
  p.stroke([[cx - 27 * u, cy - 4 * u], [cx, cy + 6 * u], [cx + 27 * u, cy - 4 * u]], 2.6 * u, "#e8c45a");
};

// ---------------- set: ship's deck ----------------
const SP = { a: [-0.75, 0, -1.0] as V3, b: [0.45, 0, -1.5] as V3, c: [1.55, 0, -0.8] as V3, rail: [2.35, 0, -1.9] as V3, wheel: [0, 1.3, 8.0] as V3 };
const fit = (name: string, marks: V3[], o: FitOpts, extra: Partial<View> = {}): View =>
  ({ name, ...fitShot(marks, o), focus: [marks[0][0], marks[0][1] + 1.55, marks[0][2]], ...extra });
const DECK_LAYOUT: Layout = {
  spots: { a: SP.a, b: SP.b, c: SP.c, d: [-1.8, 0, -2.7], e: [1.75, 0, -3.1], rail: SP.rail, mast: [0.9, 0, -3.8], hatch: [-0.4, 0, -6.0], bow: [0.0, 0, -12.5], wheel: SP.wheel },
  views: [
    { name: "deck wide", pos: [0.4, 2.3, 4.9], look: [0.4, 1.4, -6], fov: 58 },
    fit("two-shot", [SP.a, SP.b], { size: "medium", from: 6, height: 1.45, fov: 40 }, { cInf: 10 }),
    { name: "at the rail", pos: [-1.4, 1.5, 0.5], look: [3.8, 1.25, -3.2], fov: 42, cInf: 6, focus: [2.35, 1.55, -1.9] },
    { name: "helm", pos: [0.9, 2.75, 5.85], look: [-0.15, 2.5, 8.0], fov: 44, cInf: 7, focus: [0, 2.85, 8.0] },
    fit("close", [SP.a], { size: "close", from: 12, height: 1.4, fov: 34 }, { cInf: 13 }),
  ],
};
const HB = 3.4, Z0 = -15, Z1 = 11, QZ = 5.4, QH = 1.3; // half beam, deck from bow Z0 to stern Z1, quarterdeck from QZ, its height
const shipDeck = (cams?: View[]) => {
  const root = new THREE.Group(), b = new Batch(), r = rng(73), I = new THREE.Matrix4();
  const views = DECK_LAYOUT.views, all = cams ? [...views, ...cams] : views;
  const ok = (x: number, z: number, rad = 0.5) => clearOf(all, x, z, rad);
  const deck = tex("deckPlanks", planksHD, 1.2, 4), side = tex("hullPlanks", planksHD, 3, 0.4), dark = col("#5a3b2a"), wood = col("#8a5a3c");
  const sail = lam("sail", () => ({ color: "#f6ecd2", emissive: "#3a3326", side: THREE.DoubleSide })), rope = col("#b89a6a"), mastC = col("#9a6a42");
  // the sea all around (a flat painted sea; horizon fog blends it into the sky) and foam along the hull
  b.add(quadUp(-900, 900, -900, 900, 1, 1, -2.4), col("#2f7fae"));
  b.add(quadUp(-60, 60, -60, 60, 1, 1, -2.39), col("#3a8fbd"));
  for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2, d = 8 + r() * 50, w = 0.6 + r() * 1.6; b.add(quadUp(-w, w, -0.08, 0.08, 1, 1, -2.37).translate(Math.cos(a) * d, 0, Math.sin(a) * d), col("#d9eef5")); }
  for (const s of [-1, 1]) b.add(quadUp(-0.35, 0.35, Z0, Z1, 1, 1, -2.36).translate(s * (HB + 0.4), 0, 0), col("#e6f3f7"));
  // hull below the deck line: sides, a bow wedge and the stern
  for (const s of [-1, 1]) box(b, side, I, s > 0 ? HB : -HB - 0.14, s > 0 ? HB + 0.14 : -HB, -2.5, 0, Z0, Z1);
  box(b, side, I, -HB, HB, -2.5, QH + 1.0, Z1, Z1 + 0.2);
  b.add(quadUp(-HB, HB, Z0, Z1, 1.2, 4 * (Z1 - Z0) / 20, 0.0), deck);
  // bow: a triangular foredeck to a point, with its own bulwarks and a bowsprit
  const tip = Z0 - 4.5;
  b.add(tri(V(-HB, 0, Z0), V(HB, 0, Z0), V(0, 0, tip)), deck);
  for (const s of [-1, 1]) {
    const L = Math.hypot(HB, 4.5), m = frame({ x: (s * HB) / 2, z: (Z0 + tip) / 2, yaw: Math.atan2(-s * HB, -4.5) });
    box(b, side, m, -0.07, 0.07, -2.5, 1.0, -L / 2, L / 2); box(b, dark, m, -0.11, 0.11, 1.0, 1.08, -L / 2, L / 2);
  }
  rod(b, mastC, I, [0, 0.9, tip + 0.3], [0, 3.2, tip - 6.5], 0.14, 10);
  // bulwarks along both sides of the main deck, with a rail cap and stanchions; gun ports for the cannons
  for (const s of [-1, 1]) {
    const x0 = s > 0 ? HB - 0.12 : -HB, x1 = s > 0 ? HB : -HB + 0.12;
    box(b, side, I, x0, x1, 0, 0.95, Z0, Z1);
    box(b, dark, I, s > 0 ? HB - 0.16 : -HB - 0.04, s > 0 ? HB + 0.04 : -HB + 0.16, 0.95, 1.03, Z0, Z1);
    for (let z = Z0 + 0.6; z < QZ; z += 1.5) box(b, dark, I, s > 0 ? HB - 0.2 : -HB + 0.08, s > 0 ? HB - 0.08 : -HB + 0.2, 0, 0.95, z - 0.06, z + 0.06);
  }
  // quarterdeck: a raised stern deck with a front wall, two stairs, a balustrade and the ship's wheel
  box(b, side, I, -HB, HB, 0, QH, QZ, Z1);
  b.add(quadUp(-HB, HB, QZ, Z1, 1.2, 1.2, QH + 0.002), deck);
  box(b, dark, I, -HB, HB, QH - 0.08, QH + 0.02, QZ - 0.06, QZ + 0.04);
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const h = (QH * (k + 1)) / 5, z = QZ - 0.32 * (5 - k); box(b, wood, I, s * 2.2 - 0.5, s * 2.2 + 0.5, 0, h, z, z + 0.32); }
  for (let x = -HB + 0.15; x <= HB - 0.15; x += 0.3) if (Math.abs(Math.abs(x) - 2.2) > 0.6) cyl(b, wood, I, x, QH, QZ + 0.1, 0.035, 0.035, 0.75, 6);
  for (const [x0, x1] of [[-HB, -2.8], [-1.6, 1.6], [2.8, HB]]) box(b, dark, I, x0, x1, QH + 0.75, QH + 0.83, QZ + 0.04, QZ + 0.16);
  for (const s of [-1, 1]) { box(b, side, I, s > 0 ? HB - 0.12 : -HB, s > 0 ? HB : -HB + 0.12, QH, QH + 0.95, QZ, Z1); box(b, dark, I, s > 0 ? HB - 0.16 : -HB - 0.04, s > 0 ? HB + 0.04 : -HB + 0.16, QH + 0.95, QH + 1.03, QZ, Z1); }
  box(b, side, I, -HB, HB, QH, QH + 0.95, Z1 - 0.12, Z1);
  shipWheel(b, { x: SP.wheel[0] - 0.8, y: QH, z: SP.wheel[2] - 0.45, yaw: 0 });
  sph(b, lam("sternLantern", () => ({ color: "#ffd27a", emissive: "#a8641a" })), I, 0, QH + 1.6, Z1 - 0.1, 0.16, 0.22, 0.16, 12);
  cyl(b, dark, I, 0, QH + 0.95, Z1 - 0.1, 0.03, 0.03, 0.5, 6);
  // masts: foremast and mainmast with yards, square sails billowing forward, a crow's nest, shrouds and stays
  const masts: [number, number, number][] = [[-4.2, 16, 1], [-11.2, 13, 0.85]];
  for (const [mz, h, k] of masts) {
    cyl(b, mastC, I, 0, 0, mz, 0.26 * k + 0.02, 0.15 * k, h, 14);
    cyl(b, dark, I, 0, 0, mz, 0.34 * k, 0.32 * k, 0.25, 14);                // mast partner
    for (const [y, half, sh] of [[h * 0.36, 4.2 * k, 3.6 * k], [h * 0.66, 3.2 * k, 2.9 * k]] as const) {
      rod(b, mastC, I, [-half, y, mz + 0.25], [half, y, mz + 0.25], 0.09, 8);   // yard
      // sail: a section of a big cylinder so it bellies toward the bow
      const R = half * 1.4, th = 2 * Math.asin(half / R);
      const g = new THREE.CylinderGeometry(R, R, sh, 18, 1, true, Math.PI - th / 2, th);
      b.add(g, sail, new THREE.Matrix4().makeTranslation(0, y - sh / 2 - 0.1, mz + 0.35 + R * Math.cos(th / 2)));
      for (const s of [-1, 1]) rod(b, rope, I, [s * half, y, mz + 0.25], [s * (half - 0.3), y - sh - 0.15, mz + 0.05], 0.015, 4);
    }
    // crow's nest on the mainmast
    if (k === 1) { cyl(b, wood, I, 0, h * 0.78, mz, 0.62, 0.7, 0.55, 16); ring(b, dark, I, 0, h * 0.78 + 0.55, mz, 0.68, 0.04, Math.PI / 2); }
    // shrouds: rope ladders from the mast to the bulwarks
    for (const s of [-1, 1]) for (const dz of [-0.6, 0, 0.6]) rod(b, rope, I, [s * 0.2, h * 0.74, mz], [s * (HB - 0.05), 1.03, mz + 1.2 + dz], 0.018, 4);
    for (const s of [-1, 1]) for (let i = 1; i < 6; i++) { const t = i / 6, y = 1.03 + (h * 0.74 - 1.03) * t, x = s * ((HB - 0.05) + (0.2 - (HB - 0.05)) * t), z = mz + 1.2 * (1 - t); rod(b, rope, I, [x, y, z - 0.6 * (1 - t)], [x, y, z + 0.6 * (1 - t)], 0.012, 4); }
  }
  rod(b, rope, I, [0, 15.5, -4.2], [0, 12.5, -11.2], 0.02, 4);
  rod(b, rope, I, [0, 12.6, -11.2], [0, 3.1, tip - 6.3], 0.02, 4);
  jollyRoger(b, { x: 0, y: 15.5, z: -4.2 });
  // deck clutter, kept clear of every view's sight line and of the marks
  const marks = Object.values(DECK_LAYOUT.spots);
  const free = (x: number, z: number, rad: number) => ok(x, z, rad) && marks.every((p) => Math.hypot(p[0] - x, p[2] - z) > rad + 0.55);
  for (const [s, z] of [[1, -7.6], [-1, -7.6], [1, -1.6], [-1, -1.6], [1, 2.4], [-1, 2.4], [1, -13], [-1, -13]] as const) if (free(s * (HB - 0.75), z, 0.6)) cannon(b, { x: s * (HB - 0.75), z, yaw: (s * Math.PI) / 2 });
  for (const [x, z, k] of [[1.5, -5.4, 0], [1.95, -5.9, 0], [-1.6, -5.8, 0], [-2.4, 3.8, 1], [2.5, 4.3, 1], [-1.7, -10.4, 1], [1.4, -12.2, 0]] as const)
    if (free(x, z, 0.45)) { if (k) crate(b, { x, z, yaw: x * 0.7 }); else barrel(b, { x, z }); }
  for (const [x, z] of [[0.6, -4.9], [-0.7, -11.9], [-2.6, -3.2]] as const) if (free(x, z, 0.35)) ropeCoil(b, { x, z });
  if (free(-0.3, -7.6, 0.9)) { box(b, dark, I, -1.0, 0.4, 0, 0.16, -8.3, -6.9); for (let i = 0; i < 6; i++) box(b, col("#3a2618"), I, -0.95 + i * 0.25, -0.85 + i * 0.25, 0.16, 0.18, -8.25, -6.95); }
  if (free(2.75, -9.6, 0.4)) anchor(b, { x: 2.75, z: -9.6, yaw: Math.PI / 2 });
  b.build(root, true);
  return { root, env: {}, spots: DECK_LAYOUT.spots, views };
};

export const PIRATES: Theme = {
  id: "pirates", name: "Pirates and the golden age of sail", desc: "a pirate ship's deck, a pirate crew (captain, quartermaster, Captain Kidd, pirate outfits for the leads, pirate extras), ship props and pirate hand-held items",
  tags: ["pirates", "ship", "sea", "sailing", "history", "1700s", "treasure", "navy"],
  mood: "adventure",
  ambience: { shipDeck: "amb_sea" },
  characters: { captain: CAPTAIN, quartermaster: QUARTERMASTER, kidd: KIDD, miloPirate: MILO_PIRATE, junoPirate: JUNO_PIRATE, gusPirate: GUS_PIRATE },
  characterMeta: {
    captain: { name: "Captain Redd", desc: "tall; black curls; goatee and thin moustache; gold-braided tricorn; red frock coat with brass buttons", personality: "a swaggering pirate captain who has to keep his crew's votes", themes: ["pirates", "history", "sea"], tags: ["captain", "pirate", "leader", "male"] },
    quartermaster: { name: "Mags the quartermaster", desc: "petite; red polka-dot bandana; eyepatch; blue-striped shirt; green waistcoat; ponytail", personality: "sharp, fair and unimpressed: shares out the food and the loot", themes: ["pirates", "history", "sea"], tags: ["quartermaster", "pirate", "officer", "female"] },
    kidd: { name: "Captain William Kidd", desc: "white periwig curls; tricorn; blue frock coat with gold buttons; white cravat", personality: "a proud privateer turned accused pirate (1645-1701)", themes: ["pirates", "history"], tags: ["captain", "pirate", "real person", "kidd", "treasure", "male"] },
    miloPirate: { name: "Milo (pirate)", desc: "Milo as a deckhand: mustard-striped shirt, brown breeches", personality: "as Milo", themes: ["pirates", "history"], tags: ["lead", "pirate", "sailor"], outfitOf: "milo" },
    junoPirate: { name: "Dr. Juno Park (pirate)", desc: "Juno as the ship's navigator: teal frock coat, white shirt", personality: "as Juno", themes: ["pirates", "history"], tags: ["lead", "pirate", "navigator", "explainer"], outfitOf: "juno" },
    gusPirate: { name: "Gus (pirate)", desc: "Gus as an old sea dog: red-striped shirt, brown waistcoat", personality: "as Gus", themes: ["pirates", "history"], tags: ["lead", "pirate", "old sailor"], outfitOf: "gus" },
  },
  props: {
    cannon: { name: "Cannon", desc: "ship's cannon on a wooden carriage (muzzle along +z: yaw it)", category: "theme", themes: ["pirates", "history", "navy"], tags: ["gun", "battle", "ship", "weapon", "fort"], radius: 0.7, height: 0.8, build: cannon },
    treasureChest: { name: "Treasure chest", desc: "banded wooden chest (variants: closed, open = heaped with gold and gems)", category: "theme", themes: ["pirates", "history", "adventure"], tags: ["treasure", "gold", "loot", "money", "chest"], radius: 0.5, height: 0.7,
      build: (b, a) => chest(b, a), variants: { closed: (b, a) => chest(b, a), open: (b, a) => chest(b, a, true) } },
    shipWheel: { name: "Ship's wheel", desc: "ship's wheel on its post (the helmsman stands on its +z side)", category: "theme", themes: ["pirates", "sea", "navy"], tags: ["steer", "helm", "ship", "navigate", "captain"], radius: 0.6, height: 1.7, build: shipWheel },
    ropeCoil: { name: "Rope coil", desc: "coil of rope on the deck / dock", category: "theme", themes: ["pirates", "sea", "harbour"], tags: ["rope", "ship", "dock"], radius: 0.35, height: 0.3, build: ropeCoil },
    anchor: { name: "Anchor", desc: "iron ship's anchor standing on its crown", category: "theme", themes: ["pirates", "sea", "harbour", "navy"], tags: ["ship", "dock", "harbour"], radius: 0.5, height: 1.6, build: anchor },
    jollyRoger: { name: "Jolly Roger", desc: "pirate flag (skull and crossbones) on a 3.2 m pole", category: "theme", themes: ["pirates"], tags: ["flag", "skull", "ship", "pirate"], radius: 0.3, height: 3.2, build: jollyRoger },
  },
  items: {
    scroll: { name: "Scroll", desc: "unrolled parchment with writing, signatures and a red seal (articles, a contract, a decree)", themes: ["pirates", "history", "law"], tags: ["contract", "rules", "articles", "law", "document", "vote"], draw: scroll },
    coinBag: { name: "Coin purse", desc: "tied leather purse with gold coins peeking out (a share, wages, a reward)", themes: ["pirates", "history", "money"], tags: ["money", "gold", "share", "loot", "pay"], draw: coinBag },
    tricorn: { name: "Tricorn hat (in hand)", desc: "a captain's gold-braided tricorn held in the hand (doffed, humble, nervous)", themes: ["pirates", "history"], tags: ["hat", "captain", "humble", "nervous"], draw: tricornHat },
  },
  sets: { shipDeck: { id: "shipDeck", title: "Pirate ship: main deck at sea", lights: ["day", "golden", "night"], build: shipDeck } },
  layouts: { shipDeck: DECK_LAYOUT },
  setMeta: { shipDeck: { name: "Pirate ship deck", desc: "main deck of a pirate ship at sea: planked deck, two masts with billowing sails and a crow's nest, rigging, cannons at the bulwarks, barrels, crates, rope, a hatch, a raised quarterdeck with the ship's wheel, open sea all round", themes: ["pirates", "sea", "history", "navy"], tags: ["ship", "deck", "ocean", "outdoor", "sailing", "crew"] } },
};
