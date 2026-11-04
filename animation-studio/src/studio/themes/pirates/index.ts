// Pirates theme (created for "Pirates ran surprisingly democratic ships"; reused by "The truth about buried pirate
// treasure" and any later pirate / sailing / golden-age-of-piracy topic). Everything a pirate Short needs beyond the
// base library: a ship's deck set, a crew (captain, quartermaster, pirate outfits for the leads, the "pirate" crowd
// era in characters/cast.ts), ship props and hand-held items. Base items already in the library and reused here:
// treasure map, gold coin, compass, cutlass, telescope, flag, bottle; props: barrel, crate.
// Added for "The truth about buried pirate treasure" (only what the library search showed missing): the desert
// island set, palm tree, dig spot, rowboat and the shovel item.
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
/** a merchant shipowner (absentee owner of a trading ship, 1700s: London, Bristol), for "owners on land": stout,
 *  powdered wig, spectacles, plum velvet coat, white cravat. Not a real person */
const SHIP_OWNER: Look = {
  name: "Shipowner", build: "stout", skin: "#f3c9a8", seed: 31,
  hair: { style: "curly", color: "#ece6da" },
  brow: { color: "#8a8378", k: 1.1 },
  glasses: { style: "round", color: "#b08a3a" },
  top: { style: "shirt", color: "#f6f1e6" },
  layer: { style: "longcoat", color: "#6a2f5a", accent: "#e8c45a" },
  neck: { style: "bowtie", color: "#f6f1e6" },
  legs: "#3a2b2b", shoes: "#2a201a",
};
/** a merchant ship's captain (1700s): tall, heavy stern brows, grey queue, plain black tricorn, navy coat with
 *  silver buttons: the harsh master answerable to the owners, for "captains could beat sailors into line" */
const MERCHANT_CAPTAIN: Look = {
  name: "Merchant captain", build: "tall", skin: "#e9bf9a", seed: 33,
  hair: { style: "ponytail", color: "#3a3532" },
  brow: { color: "#3a3532", k: 1.8 },
  top: { style: "shirt", color: "#ece6da" },
  layer: { style: "longcoat", color: "#1f2c4a", accent: "#c9c4b8" },
  legs: "#2a2a30", shoes: "#1f1a16",
  hat: { style: "tricorn", color: "#22202a", trim: "#22202a" },
};
/** Gus (pirate) with an injured arm in a sling (revision of "Pirates ran surprisingly democratic ships"): the crew's
 *  injury fund pays him */
const GUS_SLING: Look = { ...GUS_PIRATE, sling: -1 };

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
  cyl(b, iron, m, 0, 0.55, -0.53, 0.2, 0.15, 1.43, 18, Math.PI / 2);         // barrel (base clear of the carriage's rear plane)
  sph(b, iron, m, 0, 0.55, -0.6, 0.19, 0.19, 0.17);                          // breech
  cyl(b, iron, m, 0, 0.55, 0.82, 0.19, 0.19, 0.1, 18, Math.PI / 2);          // muzzle ring
  cyl(b, col("#16161c"), m, 0, 0.55, 0.9, 0.1, 0.1, 0.03, 14, Math.PI / 2);  // bore
};
/** treasure chest: banded wooden chest; open = lid up and heaped with gold */
/** a deck table: a thick plank board on two barrels, with the ship's articles spread on it, an inkpot and quill and a
 *  few coins (meetings, votes, sharing out loot) */
const deckTable = (b: Batch, a: At, bare = false) => {
  const m = frame(a), dark = col("#6e4a30"), paper = col("#efdcae");
  for (const x of [-0.55, 0.55]) barrel(b, { x: a.x + Math.cos(a.yaw ?? 0) * x, z: a.z - Math.sin(a.yaw ?? 0) * x, yaw: a.yaw });
  box(b, tex("planksHD", planksHD, 0.5, 0.25), m, -0.85, 0.85, 0.9, 0.96, -0.42, 0.42);       // board on the barrels (0.9 m)
  box(b, dark, m, -0.86, 0.86, 0.88, 0.9, -0.43, 0.43);                                         // its underside edge
  if (bare) return;                                                                             // a clear board (loot piles on it)
  box(b, paper, m, -0.32, 0.22, 0.961, 0.966, -0.2, 0.18);                                      // the articles, spread out
  cyl(b, col("#2b2433"), m, 0.42, 0.96, -0.12, 0.05, 0.045, 0.08, 12);                          // inkpot
  cyl(b, col("#f6f1e6"), m, 0.44, 1.02, -0.12, 0.006, 0.02, 0.2, 8, 0, -0.5);                   // quill in it
  for (let i = 0; i < 5; i++) cyl(b, col("#f0c040"), m, 0.5 + 0.06 * (i % 3), 0.962 + 0.012 * (i % 2), 0.16 - 0.05 * i, 0.04, 0.04, 0.012, 12);
};
/** a merchant's tall counting-house desk (1600s-1800s clerks and owners stood at them): dark polished wood on turned
 *  legs, a sloped writing top with a ledger open on it, an inkstand; its flat shelf (0.92 m) takes a gold heap */
const countingDesk = (b: Batch, a: At) => {
  const m = frame(a), wood = col("#5a3424"), dark = col("#3a2018"), page = col("#f3e6c4");
  for (const sx of [-0.62, 0.62]) for (const sz of [-0.26, 0.26]) cyl(b, dark, m, sx, 0, sz, 0.035, 0.045, 0.9, 10);    // legs
  box(b, wood, m, -0.7, 0.7, 0.86, 0.92, -0.32, 0.32);                                                              // top
  box(b, dark, m, -0.68, 0.68, 0.6, 0.66, -0.3, 0.3);                                                               // lower shelf
  box(b, wood, m, -0.7, 0.7, 0.92, 1.06, -0.32, -0.2);                                                              // back rail
  // the ledger: two open pages on the right half, ruled lines of figures
  box(b, page, m, 0.08, 0.38, 0.921, 0.928, -0.15, 0.12); box(b, page, m, 0.39, 0.66, 0.921, 0.928, -0.15, 0.12);
  for (let i = 0; i < 6; i++) for (const x0 of [0.11, 0.42]) box(b, col("#6a5a48"), m, x0, x0 + 0.2, 0.929, 0.931, -0.12 + i * 0.04, -0.11 + i * 0.04);
  cyl(b, col("#2b2433"), m, 0.6, 0.92, -0.25, 0.04, 0.035, 0.07, 12); cyl(b, col("#f6f1e6"), m, 0.61, 0.97, -0.25, 0.005, 0.016, 0.18, 8, 0, -0.45); // inkstand + quill
};
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
const quill = (p: Pen, x: number, y: number, u: number, s: number) => {
  // a feather quill pen held in the fist, nib down-forward, the white vane up
  const nx = x + 6 * u * s, ny = y + 6 * u, tx = x - 6 * u * s, ty = y - 30 * u;
  p.poly([[tx, ty], [tx + 9 * u * s, ty + 9 * u], [nx + 1 * u * s, ny - 12 * u], [nx - 5 * u * s, ny - 14 * u]], "#fbf8f0", 2.2 * u);
  p.stroke([[tx + 2 * u * s, ty + 3 * u], [nx, ny]], 1.6 * u, "#8a7a66");
  p.stroke([[nx - 1 * u * s, ny - 3 * u], [nx + 1.5 * u * s, ny + 2 * u]], 2.2 * u, INK);
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
const cane = (p: Pen, x: number, y: number, u: number, s: number) => {
  // a dark wooden cane gripped below its crook handle (a harsh master's stick: discipline, no blow shown). The hooked
  // handle, the brown wood and the brass ferrule make it read as a cane, never a blade
  const tip: P2 = [x - 14 * u * s, y + 34 * u], top: P2 = [x + 10 * u * s, y - 40 * u];
  p.stroke([tip, top], 8 * u, INK); p.stroke([tip, top], 5 * u, "#6b3f22");
  const hook: P2[] = [top, [top[0] + 4 * u * s, top[1] - 12 * u], [top[0] + 16 * u * s, top[1] - 16 * u], [top[0] + 24 * u * s, top[1] - 8 * u], [top[0] + 22 * u * s, top[1] + 2 * u]];
  p.stroke(hook, 8 * u, INK); p.stroke(hook, 5 * u, "#6b3f22");
  p.stroke([[tip[0] - 1 * u * s, tip[1] - 4 * u], tip], 7 * u, "#c9a24a");
};
const crown = (p: Pen, x: number, y: number, u: number, s: number) => {
  // a gold crown with red and teal jewels, held up in the hand (a would-be tyrant, a king)
  const cx = x + 2 * u * s, cy = y - 26 * u, w = 30 * u; u *= 1.5;
  p.poly([[cx - w, cy + 8 * u], [cx - w, cy - 8 * u], [cx - w * 0.5, cy + 1 * u], [cx, cy - 12 * u], [cx + w * 0.5, cy + 1 * u], [cx + w, cy - 8 * u], [cx + w, cy + 8 * u]], "#f0c040", 3 * u);
  p.stroke([[cx - w, cy + 3 * u], [cx + w, cy + 3 * u]], 1.8 * u, "#c9902a");
  for (const [dx, c] of [[-0.55, "#c0353a"], [0, "#2a9d8f"], [0.55, "#c0353a"]] as const) p.ell(cx + dx * w, cy + 5.5 * u, 2.6 * u, 2.6 * u, c, 1.2 * u);
  for (const dx of [-1, 0, 1]) p.ell(cx + dx * w, cy + (dx ? -9 : -13) * u, 2.4 * u, 2.4 * u, "#f6e08a", 1.2 * u);
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
  box(b, dark, I, -HB + 0.002, HB - 0.002, QH - 0.08, QH + 0.02, QZ - 0.06, QZ + 0.04);
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) { const h = (QH * (k + 1)) / 5, z = QZ - 0.32 * (5 - k); box(b, wood, I, s * 2.2 - 0.5, s * 2.2 + 0.5, 0, h, z, z + 0.32); }
  for (let x = -HB + 0.15; x <= HB - 0.15; x += 0.3) if (Math.abs(Math.abs(x) - 2.2) > 0.6) cyl(b, wood, I, x, QH, QZ + 0.1, 0.035, 0.035, 0.75, 6);
  for (const [x0, x1] of [[-HB + 0.002, -2.8], [-1.6, 1.6], [2.8, HB - 0.002]]) box(b, dark, I, x0, x1, QH + 0.75, QH + 0.83, QZ + 0.04, QZ + 0.16);
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

// ---------------- desert island (added for the buried-treasure Short) ----------------
/** a leaning palm tree: segmented trunk, drooping fronds, coconuts. lean = degrees toward local +x */
const palm = (b: Batch, a: At, h = 5.5, lean = 14) => {
  const m = frame(a), bark = col("#9a7448"), bark2 = col("#86643c"), leaf = col("#4f9a3a"), leaf2 = col("#3f8430"), nut = col("#6b4a2a");
  const n = 9; let x = 0, y = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n, ang = (lean * deg) * (0.4 + t), seg = h / n, r0 = 0.2 - 0.07 * t;
    const nx = x + Math.sin(ang) * seg, ny = y + Math.cos(ang) * seg;
    rod(b, i % 2 ? bark : bark2, m, [x, y, 0], [nx, ny, 0], r0, 10);
    sph(b, i % 2 ? bark2 : bark, m, x, y + 0.02, 0, r0 * 1.12, 0.07, r0 * 1.12, 10);
    x = nx; y = ny;
  }
  for (let k = 0; k < 8; k++) {
    const az = (k / 8) * Math.PI * 2 + 0.3, L = 2.1, droop = k % 2 ? 0.75 : 0.55;
    const ex = x + Math.cos(az) * L, ez = Math.sin(az) * L, ey = y - droop;
    const mx = x + Math.cos(az) * L * 0.5, mz = Math.sin(az) * L * 0.5, my = y + 0.25;
    for (const [p0, p1] of [[[x, y, 0], [mx, my, mz]], [[mx, my, mz], [ex, ey, ez]]] as [V3, V3][]) {
      const c: V3 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2], len = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
      const q = new THREE.Quaternion().setFromUnitVectors(V(1, 0, 0), V(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]).normalize());
      b.add(new THREE.SphereGeometry(1, 12, 8), k % 2 ? leaf : leaf2, m.clone().multiply(new THREE.Matrix4().compose(V(...c), q, V(len / 2, 0.05, 0.32))));
    }
  }
  for (const [dx, dz] of [[0.14, 0.08], [-0.08, 0.14], [0.02, -0.15]]) sph(b, nut, m, x + dx, y - 0.2, dz, 0.13, 0.13, 0.13, 10);
};
/** a place to dig: variant "x" = a big X marked in the sand; "dug" = a hole with a heap of sand beside it */
const sandTex = () => ctex("sandHD", 1024, 1024, (g, r) => {
  g.fillStyle = "#efd59a"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? "rgba(196,160,96,0.35)" : "rgba(255,240,200,0.45)"; g.beginPath(); g.arc(r() * 1024, r() * 1024, 1 + r() * 3.5, 0, 7); g.fill(); }
  g.strokeStyle = "rgba(190,150,90,0.25)"; g.lineWidth = 3;
  for (let i = 0; i < 26; i++) { const y = r() * 1024; g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(340, y + 18, 680, y - 18, 1024, y + (r() - 0.5) * 10); g.stroke(); }
});
const digSpot = (b: Batch, a: At, kind: "x" | "dug" = "x") => {
  const m = frame(a), mark = col("#8a5a2c"), sand = col("#e2c27f");
  if (kind === "x") for (const t of [45, -45]) box(b, mark, m.clone().multiply(new THREE.Matrix4().makeRotationY(t * deg)), -0.55, 0.55, 0.005, 0.025, -0.07, 0.07);
  else {
    b.add(new THREE.CircleGeometry(0.42, 24).rotateX(-Math.PI / 2).translate(0, 0.012, 0), col("#6b4a2a"), m);
    b.add(new THREE.CircleGeometry(0.3, 24).rotateX(-Math.PI / 2).translate(0, 0.014, 0), col("#4a3420"), m);
    sph(b, sand, m, 0.85, 0, 0.1, 0.5, 0.32, 0.42, 14);
    sph(b, sand, m, 0.6, 0, -0.32, 0.3, 0.18, 0.28, 12);
  }
};
/** a small wooden rowboat pulled up on the shore (bow along local -z) */
const rowboat = (b: Batch, a: At) => {
  const m = frame(a), wood = col("#9a6a42"), dark = col("#6b4226"), inside = col("#b88a5a");
  for (let i = 0; i < 7; i++) {
    const t = i / 6, z = -1.3 + 2.6 * t, w = 0.62 * Math.sin(Math.PI * (0.12 + 0.82 * t)) + 0.05;
    box(b, i % 2 ? wood : dark, m, -w + 0.002, w - 0.002, 0.05, 0.12, z - 0.198, z + 0.198);
    for (const s of [-1, 1]) box(b, wood, m, s > 0 ? w - 0.05 : -w, s > 0 ? w : -w + 0.05, 0.1, 0.5, z - 0.2, z + 0.2);
  }
  box(b, inside, m, -0.5, 0.5, 0.3, 0.36, -0.15, 0.15);
  box(b, inside, m, -0.42, 0.42, 0.3, 0.36, 0.7, 0.95);
  for (const s of [-1, 1]) rod(b, col("#c8a272"), m, [s * 0.55, 0.45, -0.1], [s * 0.95, 0.05, 1.3], 0.03, 6);
};
const shovel = (p: Pen, x: number, y: number, u: number, s: number) => {
  // a spade held upright at the chest: long wooden shaft, T-grip on top, iron blade below
  const tx = x + 2 * u * s;
  p.stroke([[tx - 2 * u * s, y - 46 * u], [tx + 4 * u * s, y + 52 * u]], 4.4 * u, "#3a2340");
  p.stroke([[tx - 2 * u * s, y - 46 * u], [tx + 4 * u * s, y + 52 * u]], 2.4 * u, "#a8743f");
  p.stroke([[tx - 9 * u, y - 47 * u], [tx + 5 * u, y - 46 * u]], 3.4 * u, "#a8743f");
  const bx = tx + 4.5 * u * s, by = y + 52 * u;
  p.poly([[bx - 9 * u, by], [bx + 9 * u, by], [bx + 8 * u, by + 16 * u], [bx, by + 22 * u], [bx - 8 * u, by + 16 * u]], "#9aa3ab", 3 * u);
};
const IS = { a: [-0.8, 0, 0.6] as V3, b: [0.4, 0, 0.1] as V3, c: [1.5, 0, 0.8] as V3, dig: [0.5, 0, -1.4] as V3 };
const ISLAND_LAYOUT: Layout = {
  spots: { a: IS.a, b: IS.b, c: IS.c, d: [-1.9, 0, -1.1], e: [2.3, 0, -1.3], dig: IS.dig, palm: [-2.1, 0, -2.0], boat: [3.2, 0, -3.3], shore: [0.2, 0, -4.6] },
  views: [
    { name: "beach wide", pos: [0.5, 1.75, 7.2], look: [0.2, 1.3, -8], fov: 50 },
    fit("two-shot", [IS.a, IS.b], { size: "medium", from: 6, height: 1.45, fov: 40 }, { cInf: 10 }),
    { name: "dig", pos: [1.7, 2.5, 2.4], look: [0.4, 0.8, -1.6], fov: 46, cInf: 8, focus: [0.5, 1.4, -1.4] },
    fit("close", [IS.a], { size: "close", from: 12, height: 1.4, fov: 34 }, { cInf: 13 }),
  ],
};
const island = (cams?: View[]) => {
  const root = new THREE.Group(), b = new Batch(), r = rng(91), I = new THREE.Matrix4();
  const views = ISLAND_LAYOUT.views, all = cams ? [...views, ...cams] : views;
  // keep props off the acting marks (the place marks "palm" / "boat" stand next to their prop on purpose)
  const marks = ["a", "b", "c", "d", "e", "dig", "shore"].map((k) => ISLAND_LAYOUT.spots[k]);
  const free = (x: number, z: number, rad: number, near = 6) => clearOf(all, x, z, rad, near) && marks.every((p) => Math.hypot(p[0] - x, p[2] - z) > rad + 0.55);
  // sea, then the beach: a sand bank whose shoreline runs across the frame behind the marks, wet sand and foam
  b.add(quadUp(-900, 900, -900, 900, 1, 1, -0.06), col("#2f86b8"));
  b.add(quadUp(-80, 80, -40, -6, 1, 1, -0.05), col("#43a3c9"));
  b.add(quadUp(-80, 80, -8.5, -6.6, 1, 1, -0.045), col("#6cc3d8"));
  const sand = tex("sandHD", sandTex, 6, 6);
  b.add(quadUp(-60, 60, -7, 40, 30, 24, 0), sand);
  b.add(quadUp(-60, 60, -7.6, -6.9, 1, 1, 0.004), col("#d8b878"));
  for (let i = 0; i < 18; i++) { const x = -26 + i * 3 + (r() - 0.5), w = 1 + r() * 1.4; b.add(quadUp(x - w, x + w, -7.75, -7.55, 1, 1, -0.03), col("#f2fafc")); }
  for (let i = 0; i < 40; i++) { const x = (r() - 0.5) * 120, z = -12 - r() * 60, w = 0.5 + r() * 1.3; b.add(quadUp(x - w, x + w, z - 0.06, z + 0.06, 1, 1, -0.04), col("#d9eef5")); }
  // rocks along the shoreline
  for (const [x, z, sx, sy] of [[-4.6, -6.4, 1.3, 0.9], [-3.4, -6.9, 0.7, 0.45], [5.2, -6.6, 1.1, 0.75], [6.3, -6.0, 0.6, 0.4], [-9, -6, 2.2, 1.6], [9.5, -5.8, 1.8, 1.2]] as const)
    if (free(x, z, sx, 3)) sph(b, col(sx > 1.5 ? "#8c8a88" : "#9c9a96"), I, x, 0, z, sx, sy, sx * 0.8, 14);
  // palms (kept off the views' sight lines and the marks)
  for (const [x, z, h, lean, yaw] of [[-2.9, -2.9, 5.6, 16, 2.6], [-5.2, -0.8, 6.2, 12, 3.4], [4.6, -1.8, 5.2, 18, 0.5], [6.2, 1.2, 6.4, 10, 0.2], [-7.5, 3.5, 5.8, 14, 3.0], [8.5, -3.8, 5.0, 20, 0.8], [-11, -3, 6.6, 9, 2.4]] as const)
    if (free(x, z, 0.4, 3)) palm(b, { x, z, yaw }, h, lean);
  // beach clutter: shells, a driftwood log, grass tufts at the back of the beach, the rowboat
  for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 16, z = -6 + r() * 14; if (free(x, z, 0.1)) sph(b, col(r() < 0.5 ? "#f6e6d8" : "#e8b8a8"), I, x, 0, z, 0.06, 0.03, 0.05, 8); }
  if (free(-3.6, 1.8, 0.8)) rod(b, col("#b8a48a"), I, [-4.3, 0.12, 1.5], [-2.9, 0.12, 2.1], 0.12, 10);
  for (const [x, z] of [[-6, 6], [-4, 9], [5, 7], [7, 4], [-9, 1]] as const) if (free(x, z, 0.6)) for (let k = 0; k < 7; k++) rod(b, col(k % 2 ? "#7aa83f" : "#5a9c43"), I, [x + (r() - 0.5) * 0.5, 0, z + (r() - 0.5) * 0.5], [x + (r() - 0.5) * 1.2, 0.5 + r() * 0.4, z + (r() - 0.5) * 1.2], 0.02, 4);
  if (free(3.4, -4.6, 0.9, 3)) rowboat(b, { x: 3.4, z: -4.6, yaw: -0.5 });
  b.build(root, true);
  return { root, env: {}, spots: ISLAND_LAYOUT.spots, views };
};

export const PIRATES: Theme = {
  id: "pirates", name: "Pirates and the golden age of sail", desc: "a pirate ship's deck, a pirate crew (captain, quartermaster, Captain Kidd, pirate outfits for the leads, pirate extras), ship props and pirate hand-held items",
  tags: ["pirates", "ship", "sea", "sailing", "history", "1700s", "treasure", "navy"],
  mood: "adventure",
  ambience: { shipDeck: "amb_sea", island: "amb_sea" },
  steps: { island: "step_grass" },
  characters: { captain: CAPTAIN, quartermaster: QUARTERMASTER, kidd: KIDD, miloPirate: MILO_PIRATE, junoPirate: JUNO_PIRATE, gusPirate: GUS_PIRATE, gusSling: GUS_SLING , shipOwner: SHIP_OWNER, merchantCaptain: MERCHANT_CAPTAIN },
  characterMeta: {
    shipOwner: { name: "Shipowner", desc: "stout; powdered-wig curls; round gold spectacles; plum velvet frock coat; white cravat", personality: "a comfortable merchant who owns ships he never sails on: counts the profits on land", themes: ["pirates", "history", "money", "trade"], tags: ["owner", "merchant", "rich", "boss", "investor", "trade", "male"] },
    merchantCaptain: { name: "Merchant captain", desc: "tall; heavy stern brows; grey ponytail; plain black tricorn; navy frock coat with silver buttons", personality: "a harsh master who answers to the owners, not the crew", themes: ["pirates", "history", "sea", "trade"], tags: ["captain", "merchant", "strict", "harsh", "navy", "boss", "male"] },
    captain: { name: "Captain Redd", desc: "tall; black curls; goatee and thin moustache; gold-braided tricorn; red frock coat with brass buttons", personality: "a swaggering pirate captain who has to keep his crew's votes", themes: ["pirates", "history", "sea"], tags: ["captain", "pirate", "leader", "male"] },
    quartermaster: { name: "Mags the quartermaster", desc: "petite; red polka-dot bandana; eyepatch; blue-striped shirt; green waistcoat; ponytail", personality: "sharp, fair and unimpressed: shares out the food and the loot", themes: ["pirates", "history", "sea"], tags: ["quartermaster", "pirate", "officer", "female"] },
    kidd: { name: "Captain William Kidd", desc: "white periwig curls; tricorn; blue frock coat with gold buttons; white cravat", personality: "a proud privateer turned accused pirate (1645-1701)", themes: ["pirates", "history"], tags: ["captain", "pirate", "real person", "kidd", "treasure", "male"] },
    miloPirate: { name: "Milo (pirate)", desc: "Milo as a deckhand: mustard-striped shirt, brown breeches", personality: "as Milo", themes: ["pirates", "history"], tags: ["lead", "pirate", "sailor"], outfitOf: "milo" },
    junoPirate: { name: "Dr. Juno Park (pirate)", desc: "Juno as the ship's navigator: teal frock coat, white shirt", personality: "as Juno", themes: ["pirates", "history"], tags: ["lead", "pirate", "navigator", "explainer"], outfitOf: "juno" },
    gusPirate: { name: "Gus (pirate)", desc: "Gus as an old sea dog: red-striped shirt, brown waistcoat", personality: "as Gus", themes: ["pirates", "history"], tags: ["lead", "pirate", "old sailor"], outfitOf: "gus" },
    gusSling: { name: "Gus (pirate, arm in a sling)", desc: "Gus as an old sea dog with his left arm in a white cloth sling (injured in battle)", personality: "as Gus", themes: ["pirates", "history", "medicine"], tags: ["lead", "pirate", "injured", "sling", "hurt"], outfitOf: "gus" },
  },
  props: {
    cannon: { name: "Cannon", desc: "ship's cannon on a wooden carriage (muzzle along +z: yaw it)", category: "theme", themes: ["pirates", "history", "navy"], tags: ["gun", "battle", "ship", "weapon", "fort"], radius: 0.7, height: 0.8, build: cannon },
    deckTable: { name: "Deck table", desc: "a plank board on two barrels (0.96 m high) with the ship's articles, inkpot, quill and coins on it: a crew meeting, a vote, sharing out loot", category: "theme", themes: ["pirates", "history", "navy"], tags: ["table", "meeting", "vote", "articles", "contract", "committee"], radius: 0.95, height: 0.96, box: [0.86, 0.43], build: (b, a) => deckTable(b, a) },
    countingDesk: { name: "Counting desk", desc: "a merchant's tall counting-house desk (1700s): dark wood, an open ledger of figures and an inkstand on the right half, the left half clear for a gold heap (top 0.92 m: lootPiles at [x - 0.35, 0.92, z])", category: "theme", themes: ["history", "money", "trade", "pirates"], tags: ["desk", "merchant", "owner", "office", "ledger", "accounts", "money", "counting house", "bank"], radius: 0.75, height: 0.92, box: [0.72, 0.34], build: countingDesk },
    deckBoard: { name: "Deck board", desc: "the deck table cleared: a plank board on two barrels (0.96 m high), nothing on it (put loot piles or other props on top)", category: "theme", themes: ["pirates", "history", "navy"], tags: ["table", "board", "loot", "sharing", "counting"], radius: 0.95, height: 0.96, box: [0.86, 0.43], build: (b, a) => deckTable(b, a, true) },
    treasureChest: { name: "Treasure chest", desc: "banded wooden chest (variants: closed, open = heaped with gold and gems)", category: "theme", themes: ["pirates", "history", "adventure"], tags: ["treasure", "gold", "loot", "money", "chest"], radius: 0.5, height: 0.7, box: [0.43, 0.29],
      build: (b, a) => chest(b, a), variants: { closed: (b, a) => chest(b, a), open: (b, a) => chest(b, a, true) } },
    shipWheel: { name: "Ship's wheel", desc: "ship's wheel on its post (the helmsman stands on its +z side)", category: "theme", themes: ["pirates", "sea", "navy"], tags: ["steer", "helm", "ship", "navigate", "captain"], radius: 0.6, height: 1.7, build: shipWheel },
    ropeCoil: { name: "Rope coil", desc: "coil of rope on the deck / dock", category: "theme", themes: ["pirates", "sea", "harbour"], tags: ["rope", "ship", "dock"], radius: 0.35, height: 0.3, build: ropeCoil },
    anchor: { name: "Anchor", desc: "iron ship's anchor standing on its crown", category: "theme", themes: ["pirates", "sea", "harbour", "navy"], tags: ["ship", "dock", "harbour"], radius: 0.5, height: 1.6, build: anchor },
    palmTree: { name: "Palm tree", desc: "leaning coconut palm, ~5.5 m", category: "theme", themes: ["pirates", "island", "tropical", "beach"], tags: ["tree", "island", "beach", "coconut", "tropical"], radius: 0.6, height: 5.5, build: (b, a) => palm(b, a) },
    digSpot: { name: "Dig spot", desc: "a place to dig in sand (variants: x = X marks the spot, dug = hole with a heap of sand)", category: "theme", themes: ["pirates", "island", "beach", "treasure"], tags: ["dig", "bury", "x marks the spot", "hole", "sand", "treasure"], radius: 0.6, height: 0.35,
      build: (b, a) => digSpot(b, a), variants: { x: (b, a) => digSpot(b, a, "x"), dug: (b, a) => digSpot(b, a, "dug") } },
    rowboat: { name: "Rowboat", desc: "small wooden rowboat with oars, pulled up on a shore", category: "theme", themes: ["pirates", "sea", "harbour", "island"], tags: ["boat", "row", "shore", "landing"], radius: 1.4, height: 0.55, build: rowboat },
    jollyRoger: { name: "Jolly Roger", desc: "pirate flag (skull and crossbones) on a 3.2 m pole", category: "theme", themes: ["pirates"], tags: ["flag", "skull", "ship", "pirate"], radius: 0.3, height: 3.2, build: jollyRoger },
  },
  items: {
    scroll: { name: "Scroll", desc: "unrolled parchment with writing, signatures and a red seal (articles, a contract, a decree)", themes: ["pirates", "history", "law"], tags: ["contract", "rules", "articles", "law", "document", "vote"], draw: scroll },
    quill: { name: "Quill pen", desc: "white feather quill (writing, signing the articles, a contract)", themes: ["pirates", "history", "school", "law"], tags: ["write", "sign", "pen", "contract"], draw: quill },
    coinBag: { name: "Coin purse", desc: "tied leather purse with gold coins peeking out (a share, wages, a reward)", themes: ["pirates", "history", "money"], tags: ["money", "gold", "share", "loot", "pay"], draw: coinBag },
    shovel: { name: "Shovel", desc: "spade held upright (dig, bury, garden)", themes: ["pirates", "treasure", "garden", "work"], tags: ["dig", "bury", "treasure", "spade", "garden"], draw: shovel },
    cane: { name: "Cane", desc: "a rattan cane gripped and raised (a harsh captain or master: discipline; no blow shown)", themes: ["pirates", "history", "school"], tags: ["stick", "cane", "discipline", "punish", "harsh", "strict"], draw: cane },
    crown: { name: "Crown", desc: "a jewelled gold crown held up in the hand (a king, a would-be tyrant, crowning oneself)", themes: ["history", "pirates", "royalty"], tags: ["crown", "king", "queen", "tyrant", "royal", "power"], draw: crown },
    tricorn: { name: "Tricorn hat (in hand)", desc: "a captain's gold-braided tricorn held in the hand (doffed, humble, nervous)", themes: ["pirates", "history"], tags: ["hat", "captain", "humble", "nervous"], draw: tricornHat },
  },
  sets: { shipDeck: { id: "shipDeck", title: "Pirate ship: main deck at sea", lights: ["day", "golden", "night"], build: shipDeck },
    island: { id: "island", title: "Desert island beach", lights: ["day", "golden", "night"], build: island } },
  layouts: { shipDeck: DECK_LAYOUT, island: ISLAND_LAYOUT },
  setMeta: { shipDeck: { name: "Pirate ship deck", desc: "main deck of a pirate ship at sea: planked deck, two masts with billowing sails and a crow's nest, rigging, cannons at the bulwarks, barrels, crates, rope, a hatch, a raised quarterdeck with the ship's wheel, open sea all round", themes: ["pirates", "sea", "history", "navy"], tags: ["ship", "deck", "ocean", "outdoor", "sailing", "crew"] },
    island: { name: "Desert island beach", desc: "tropical island beach: sand, palm trees, rocks, shells, a rowboat on the shore, turquoise shallows, open sea and a far island", themes: ["pirates", "island", "tropical", "beach", "treasure"], tags: ["beach", "island", "sand", "sea", "outdoor", "palm", "shore", "desert island"] } },
};
