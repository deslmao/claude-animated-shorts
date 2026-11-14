// One Too Many theme (productions/one-too-many: a school ghost story told by a narrator). Only what the library search
// showed missing; reused from the base library: the classroom set, schoolDesk / chair / clock, tree, fence, bin,
// bench, the crowd generator (a new "pupil" era: navy blazers, white shirts, striped ties), the mug item, the day light.
// New here:
//   set ashfordField: Ashford High from its playing field: a three-storey buff-brick main block with the glass entrance,
//     its sign and canopy, lived-in windows (blinds, posters, a plant), the single-storey science block to the right,
//     the tarmac playground, the field with its white pitch lines, the fire assembly point, a bike shelter, bins, trees
//   props: fireBell (the red electric alarm bell on a wall; steps make its hammer strike), clipboardCard (Ms Okoye's
//     register on its clipboard, held up to the lens: the class, the register total and her count), assemblySign (the
//     green FIRE ASSEMBLY POINT sign), countTag (a number popping up over a pupil's head as she counts)
//   item clipboard; characters okoye (the new teacher), rowe (the head), carol (the girl in the old maroon blazer),
//   leo (a Year 7 boy)
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { INK, type Pen } from "../../characters/toon";
import { Batch, quadUp } from "../../materials/geo";
import { asphaltHD, plasterHD, tilesHD } from "../../materials/paint2";
import { buildRoom } from "../../sets/room";
import { At, frame, col, box, cyl, sph, tex, panel, glow } from "../../props/kit";
import { tree, flowers, tufts, fence } from "../../props/nature";
import { bin, bench } from "../../props/outdoor";
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
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const FONT = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; };
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
/** an unlit ink card (a drawing on canvas, readable at phone size) */
const cardMat = (t: THREE.Texture, tint = "#ffffff") => new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.02, color: tint });
const at = (m: THREE.Matrix4, x: number, y: number, z: number) => m.clone().multiply(new THREE.Matrix4().makeTranslation(x, y, z));

// ---------------------------------------------------------------- characters
// Ms Okoye: the new teacher (plum cardigan, cream shirt, hair up in a bun); Mr Rowe: the head (grey suit, glasses, tie);
// Carol: a Year 7 girl in the 1979 uniform, a faded maroon blazer and an old-gold tie, her colours washed out like an
//   old photograph (pale skin, greyed hair and clothes) so she reads as "not from now" among the navy blazers;
// Leo: a Year 7 boy in today's uniform.
const OKOYE: Look = { name: "Ms Okoye", build: "adult", skin: "#8d5a3b", seed: 101, hair: { style: "bun", color: "#1f1a24" },
  top: { style: "shirt", color: "#f2ece0" }, layer: { style: "cardigan", color: "#7a3b5c" }, legs: "#2f3448", shoes: "#2a201a" };
const ROWE: Look = { name: "Mr Rowe", build: "stout", skin: "#f0c8a8", seed: 102, hair: { style: "receding", color: "#9a958e" },
  glasses: { style: "square", color: INK }, top: { style: "shirt", color: "#e8eef4" }, neck: { style: "tie", color: "#2f4a7a" },
  layer: { style: "blazer", color: "#5a5e66" }, legs: "#4a4d55", shoes: "#2a201a" };
const CAROL: Look = { name: "Carol", build: "kid", skin: "#e8e1d8", seed: 103, hair: { style: "bob", color: "#6a5a4e" },
  top: { style: "shirt", color: "#e4e0d6" }, neck: { style: "tie", color: "#b8a26a" }, layer: { style: "blazer", color: "#7d2f3c" },
  legs: "#5c5b5e", shoes: "#2a2628" };
const LEO: Look = { name: "Leo", build: "kid", skin: "#c99067", seed: 104, hair: { style: "curly", color: "#2a201a" },
  top: { style: "shirt", color: "#f4f4f0" }, neck: { style: "tie", color: "#a8323a" }, layer: { style: "blazer", color: "#1f2d4f" },
  legs: "#4a4d55", shoes: "#1e1e22" };

/** two teachers on fire-drill duty, in hi-vis vests over their clothes */
const TEACHER_A: Look = { name: "Teacher (hi-vis)", build: "tall", skin: "#c99067", seed: 105, hair: { style: "short", color: "#2a201a" }, beard: { style: "full", color: "#2a201a" },
  top: { style: "shirt", color: "#cfe0f2" }, layer: { style: "waistcoat", color: "#e3ec3c" }, legs: "#3a3d47", shoes: "#2a201a" };
const TEACHER_B: Look = { name: "Teacher (hi-vis)", build: "adult", skin: "#f1c9a8", seed: 106, hair: { style: "ponytail", color: "#a5682f" }, glasses: { style: "round", color: INK },
  top: { style: "sweater", color: "#5d8a3a" }, layer: { style: "waistcoat", color: "#e3ec3c" }, legs: "#2f3448", shoes: "#3a2b20" };

/** firefighters: dark fire tunic with reflective bands, a yellow helmet */
const FIREFIGHTER: Look = { name: "Firefighter", build: "big", skin: "#e8b896", seed: 107, hair: { style: "short", color: "#3b2c22" },
  top: { style: "stripes", color: "#2a2e3a", accent: "#e3ec3c" }, layer: { style: "longcoat", color: "#20242e" }, hat: { style: "hardhat", color: "#e8c33a" }, legs: "#20242e", shoes: "#15171b" };
/** the 1979 teacher with the register: brown corduroy jacket, wide tie, moustache */
const TEACHER_1979: Look = { name: "Teacher (1979)", build: "lanky", skin: "#efc9a6", seed: 108, hair: { style: "side", color: "#5a3b2a" }, moustache: { style: "thin", color: "#5a3b2a" },
  top: { style: "shirt", color: "#e9d9b4" }, neck: { style: "tie", color: "#8c3b4a" }, layer: { style: "blazer", color: "#7a5236" }, legs: "#5a4636", shoes: "#3a2b20" };
/** Ms Okoye at the end of the line, afterwards: her colours washed out like Carol's (an old photograph) */
const OKOYE_GHOST: Look = { ...OKOYE, name: "Ms Okoye (after)", skin: "#a88f7e", top: { style: "shirt", color: "#e2ded4" }, layer: { style: "cardigan", color: "#7a6670" }, legs: "#55565c", shoes: "#3a3436" };

// ---------------------------------------------------------------- item: clipboard (held)
const clipboardItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 3 * u * s, cy = y - 2 * u;
  p.poly([[cx - 12 * u, cy - 16 * u], [cx + 12 * u, cy - 16 * u], [cx + 12 * u, cy + 16 * u], [cx - 12 * u, cy + 16 * u]], "#a8784a", 2.4 * u); // the board
  p.poly([[cx - 9 * u, cy - 12 * u], [cx + 9 * u, cy - 12 * u], [cx + 9 * u, cy + 13 * u], [cx - 9 * u, cy + 13 * u]], "#f6f2e8", 1.6 * u); // the sheet
  p.poly([[cx - 5 * u, cy - 18 * u], [cx + 5 * u, cy - 18 * u], [cx + 5 * u, cy - 12 * u], [cx - 5 * u, cy - 12 * u]], "#9aa0a6", 1.6 * u); // the clip
  for (let k = 0; k < 5; k++) p.stroke([[cx - 6 * u, cy - 7 * u + k * 4 * u], [cx + 6 * u, cy - 7 * u + k * 4 * u]], 1 * u, "#8c93a3");
};

// ---------------------------------------------------------------- textures
const brickTex = () => stex("otmBrick2", 512, 512, (g) => {
  g.fillStyle = "#d3c4ad"; g.fillRect(0, 0, 512, 512); let s = 23; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const bw = 64, bh = 22;
  for (let y = 0, row = 0; y < 512; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < 512; x += bw) { const t = r(); g.fillStyle = t > 0.72 ? "#a9563c" : t > 0.36 ? "#bb6646" : t > 0.1 ? "#c87556" : "#8f4a36"; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
});
/** a mown school field: broad light and dark mowing stripes, blade strokes, the odd clover and daisy */
const fieldTex = () => stex("otmField", 512, 512, (g) => {
  let s = 41; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < 512; y += 256) { g.fillStyle = y ? "#6f8f4a" : "#7d9c55"; g.fillRect(0, y, 512, 256); }
  for (let k = 0; k < 2600; k++) { const x = r() * 512, y = r() * 512, d = y < 256 ? 0 : 1; g.strokeStyle = ["#87a75c", "#668546", "#90ad66", "#5f7d40"][Math.floor(r() * 2) + d * 2]; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - 5 - r() * 4); g.stroke(); }
  for (let k = 0; k < 26; k++) { g.fillStyle = r() < 0.7 ? "#f4f1e6" : "#5a7a3c"; g.beginPath(); g.arc(r() * 512, r() * 512, 2.2, 0, 7); g.fill(); }
});
/** a window pane, lived in: plain sky reflection, blinds half down, a poster, a plant on the sill, a paper chain */
const WINDOW_KINDS = 5;
const windowTex = (k: number) => stex(`otmWin${k}`, 256, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 256, 256); gr.addColorStop(0, "#5f7d98"); gr.addColorStop(1, "#33475e"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "rgba(255,255,255,0.16)"; g.beginPath(); g.moveTo(30, 0); g.lineTo(90, 0); g.lineTo(20, 256); g.lineTo(-40, 256); g.fill(); // a reflection
  if (k === 1) { g.fillStyle = "#d9d6cc"; g.fillRect(0, 0, 256, 104); g.strokeStyle = "#b9b5aa"; g.lineWidth = 3; for (let y = 8; y < 104; y += 12) { g.beginPath(); g.moveTo(0, y); g.lineTo(256, y); g.stroke(); } }
  if (k === 2) { g.fillStyle = "#e9c46a"; g.fillRect(150, 70, 70, 96); g.fillStyle = "#c8643f"; g.beginPath(); g.arc(185, 110, 22, 0, 7); g.fill(); g.fillStyle = "#3f6fb5"; g.fillRect(40, 120, 60, 80); }
  if (k === 3) { g.fillStyle = "#5d8a3a"; for (const [x, y, r0] of [[60, 196, 26], [84, 182, 22], [40, 184, 18]] as const) { g.beginPath(); g.arc(x, y, r0, 0, 7); g.fill(); } g.fillStyle = "#b5653f"; g.fillRect(44, 206, 46, 50); }
  if (k === 4) { for (let x = 0; x < 256; x += 32) { g.fillStyle = ["#c25a7a", "#e9c46a", "#3f6fb5", "#5d8a3a"][(x / 32) % 4]; g.beginPath(); g.arc(x + 16, 30 + Math.sin(x / 40) * 10, 12, 0, 7); g.fill(); } }
  g.strokeStyle = "#f4f1ea"; g.lineWidth = 10; g.strokeRect(5, 5, 246, 246); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.stroke(); // frame + mullion
});
const schoolSignTex = () => stex("otmSign", 1024, 192, (g) => {
  g.fillStyle = "#1f2d4f"; rr(g, 4, 4, 1016, 184, 18); g.fill(); g.strokeStyle = "#c9a24a"; g.lineWidth = 8; g.stroke();
  g.fillStyle = "#c9a24a"; g.beginPath(); g.moveTo(70, 40); g.lineTo(130, 40); g.lineTo(130, 110); g.quadraticCurveTo(100, 160, 100, 160); g.quadraticCurveTo(70, 130, 70, 110); g.closePath(); g.fill(); // crest
  g.fillStyle = "#ffffff"; g.font = FONT(84); g.textAlign = "left"; g.fillText("ASHFORD HIGH SCHOOL", 170, 124);
});
const scienceSignTex = () => stex("otmSci", 512, 128, (g) => { g.fillStyle = "#1f2d4f"; rr(g, 4, 4, 504, 120, 14); g.fill(); g.fillStyle = "#fff"; g.font = FONT(64); g.textAlign = "center"; g.fillText("SCIENCE", 256, 88); });
const assemblyTex = () => stex("otmAssembly", 512, 512, (g) => {
  g.fillStyle = "#1e8a4c"; g.fillRect(0, 0, 512, 512); g.strokeStyle = "#ffffff"; g.lineWidth = 14; g.strokeRect(14, 14, 484, 484);
  g.fillStyle = "#fff"; // four figures and arrows pointing in
  for (const [x, y] of [[176, 176], [336, 176], [176, 300], [336, 300]] as const) { g.beginPath(); g.arc(x, y - 30, 16, 0, 7); g.fill(); g.fillRect(x - 14, y - 12, 28, 46); }
  g.font = FONT(56); g.textAlign = "center"; g.fillText("FIRE", 256, 420); g.font = FONT(44); g.fillText("ASSEMBLY POINT", 256, 474);
});
const tagTex = (n: string) => stex(`otmTag${n}`, 128, 128, (g) => { g.fillStyle = "#ffffff"; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.fillStyle = INK; g.font = FONT(n.length > 1 ? 60 : 72); g.textAlign = "center"; g.fillText(n, 64, 88); });

// ---------------------------------------------------------------- prop: clipboardCard (an insert, held to the lens)
// Ms Okoye's hand holding her fire register: "7C · FIRE REGISTER", a list of ticked names, "ON REGISTER 30" and her
// count circled in red. Variant: the count (e.g. "31"). An ink card 0.4 m wide facing +z: place it ~0.45 m from an `at`
// camera. Her brown hand holds the board's lower edge.
const regTex = (n: string) => stex(`otmReg${n}`, 1024, 1024, (g) => {
  g.clearRect(0, 0, 1024, 1024);
  g.fillStyle = "#a8784a"; rr(g, 172, 40, 680, 940, 26); g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();          // board
  g.fillStyle = "#f8f5ec"; g.fillRect(212, 120, 600, 820); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(212, 120, 600, 820); // sheet
  g.fillStyle = "#9aa0a6"; rr(g, 412, 20, 200, 110, 14); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();          // clip
  g.fillStyle = "#1f2d4f"; g.font = FONT(56); g.textAlign = "left"; g.fillText("7C  FIRE REGISTER", 240, 210);
  g.strokeStyle = "#c8c3b5"; g.lineWidth = 3; g.font = FONT(30, "normal"); g.fillStyle = "#4a4d55";
  const names = ["Adams", "Begum", "Clarke", "Davies", "Evans", "Grant L.", "Hussain", "Jones"];
  names.forEach((nm, i) => { const y = 270 + i * 54; g.beginPath(); g.moveTo(240, y + 12); g.lineTo(790, y + 12); g.stroke(); g.fillText(nm, 250, y); g.strokeStyle = "#2a6fdb"; g.lineWidth = 6; g.beginPath(); g.moveTo(700, y - 12); g.lineTo(716, y + 2); g.lineTo(744, y - 26); g.stroke(); g.strokeStyle = "#c8c3b5"; g.lineWidth = 3; });
  g.fillStyle = "#1f2d4f"; g.font = FONT(50); g.fillText("ON REGISTER:  30", 240, 720);
  g.fillText("COUNTED:", 240, 820); g.fillStyle = "#c0353a"; g.font = FONT(92); g.fillText(n, 560, 832);
  g.strokeStyle = "#c0353a"; g.lineWidth = 9; g.beginPath(); g.ellipse(612, 800, 110, 70, -0.08, 0, 7); g.stroke();
  // her hand on the lower-left corner (brown skin, plum cuff), clear of the numbers
  g.fillStyle = "#7a3b5c"; rr(g, 0, 930, 250, 94, 20); g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  g.fillStyle = "#8d5a3b"; rr(g, 120, 880, 190, 110, 46); g.fill(); g.stroke();
  for (let k = 0; k < 4; k++) { rr(g, 134 + k * 40, 850, 34, 80, 16); g.fill(); g.stroke(); }
});
const CARD_W = 0.4;
const clipboardBuild = (b: Batch, a: At, v = "31") => { b.add(plane(CARD_W, CARD_W), cardMat(regTex(v), "#f4f1ea"), at(frame(a), 0, CARD_W / 2, 0)); };

// ---------------------------------------------------------------- prop: fireBell (the alarm bell on a wall)
// A red electric bell (gong 0.2 m across) on a round wall plate, `at` = the gong's centre, facing +z (mount it on a
// wall). Its hammer sits under the gong; each step toggles it against the gong (give the steps a fast rhythm: ringing).
const bellLabelTex = () => stex("otmBellLabel", 256, 96, (g) => { g.fillStyle = "#c8282c"; rr(g, 2, 2, 252, 92, 10); g.fill(); g.fillStyle = "#fff"; g.font = FONT(40); g.textAlign = "center"; g.fillText("FIRE", 128, 44); g.font = FONT(28); g.fillText("ALARM", 128, 80); });
const bellParts = (b: Batch, m: THREE.Matrix4) => {
  box(b, col("#d9d4c8"), m, -0.15, 0.15, -0.3, 0.15, -0.02, 0.0);                        // the mounting board
  sph(b, col("#d8282c"), m, 0, 0, 0.0, 0.12, 0.12, 0.07, 28);                            // the domed gong
  sph(b, col("#f2f0ea"), m, 0.03, 0.04, 0.055, 0.025, 0.02, 0.012, 12);                  // a highlight
  box(b, col("#3a3d47"), m, -0.03, 0.03, -0.2, -0.11, 0.0, 0.05);                        // the striker housing
  b.add(plane(0.2, 0.075), glow("otmBellLabelM", () => ({ map: bellLabelTex() })), at(m, 0, -0.25, 0.003));
};
const fireBellRig = (a: At): PropRig => {
  const root = rigRoot(a), b = new Batch(); bellParts(b, new THREE.Matrix4()); b.build(root, false);
  const hammer = mesh(new THREE.SphereGeometry(0.022, 12, 8), new THREE.MeshLambertMaterial({ color: "#3a3d47" }), 0, -0.13, 0.07); root.add(hammer);
  return { root, update: ({ step = 0 }) => { const s = Math.floor(step + 0.001); hammer.position.y = s >= 1 && s % 2 === 1 ? -0.09 : -0.13; root.position.x = a.x + (s >= 1 && s % 2 === 1 ? 0.002 : 0); } };
};

// ---------------------------------------------------------------- prop: assemblySign
const assemblyBuild = (b: Batch, a: At) => {
  const m = frame(a);
  cyl(b, col("#9aa0a6"), m, 0, 0, 0, 0.035, 0.035, 2.0, 10);
  box(b, col("#167540"), m, -0.32, 0.32, 1.3, 1.94, 0.03, 0.06);
  b.add(plane(0.6, 0.6), glow("otmAssemblyM", () => ({ map: assemblyTex() })), at(m, 0, 1.62, 0.062));
};

// ---------------------------------------------------------------- prop: countTag (a number popping up)
const countTagRig = (a: At, v = "1"): PropRig => {
  const root = rigRoot(a), p = mesh(plane(0.26, 0.26), new THREE.MeshBasicMaterial({ map: tagTex(v), transparent: true, alphaTest: 0.05, toneMapped: false }), 0, 0, 0);
  root.add(p); // on the default layer: drawn in every pass, including the motion-blur passes of a moving camera
  return { root, update: ({ step = 0, camPos }) => { p.visible = step > 0.001; p.scale.setScalar(Math.min(1, 0.25 + step * 3)); p.lookAt(camPos); } }; // pops in the instant its step starts (steps ease over 0.7 s)
};

// ---------------------------------------------------------------- set: ashfordField
// The main block's front faces +z at z = 0 (x -18..18, three storeys, 10.2 m to the parapet), the glass entrance at x 0
// (doors x -1.4..1.4, 2.6 m tall) under a canopy and the ASHFORD HIGH SCHOOL sign. The science block: a single storey
// to the right (x 20..32, front at z 0). Tarmac playground z 0..8, the field z 8..70 (white pitch lines from z 24).
// The fire assembly point: the sign at (-3.6, 9.4); class lines form on the grass from z 11 (7C's three files at
// x -1, 0, 1, fronts at z 20). Trees and a fence round the field, a bike shelter and bins by the building.
const FH = 3.4, NF = 3, BX = 18;
const ASH_SPOTS: Record<string, V3> = {
  entrance: [0, 0, 1.6], assembly: [-3.6, 0, 9.4], line: [0, 0, 16], teacher: [0, 0, 21.6], head: [2.6, 0, 21.4], science: [26, 0, 1.4], playground: [0, 0, 5],
};
const ASH_VIEWS: View[] = [
  { name: "field", pos: [3.5, 1.7, 30], look: [0, 3.2, 4], fov: 55, establishing: true },
  { name: "lines", pos: [0, 1.5, 25], look: [0, 1.0, 15], fov: 45 },
  { name: "entrance", pos: [3.2, 1.5, 9], look: [0, 1.8, 0], fov: 55 },
];
const ashfordField = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  // ground: the playground, the field, the pitch lines
  b.add(quadUp(-70, 70, -12, 8, 40, 6), tex("otmTarmac", asphaltHD, 1, 1));
  b.add(quadUp(-70, 70, 8, 80, 40, 20, 0.01), tex("otmField", fieldTex, 1, 1));
  const line = col("#f4f4ee");
  for (const [x0, x1, z0, z1] of [[-22, 22, 24, 24.1], [-22, 22, 66, 66.1], [-22, -21.9, 24, 66.1], [21.9, 22, 24, 66.1], [-22, 22, 45, 45.1]] as const) b.add(quadUp(x0, x1, z0, z1, 1, 1, 0.02), line);
  for (const [x0, x1, z0, z1] of [[-30, 30, 7.95, 8.05]] as const) b.add(quadUp(x0, x1, z0, z1, 1, 1, 0.02), col("#d9d4c8")); // the field's edge kerb line
  for (const x of [-12, -6, 6, 12]) b.add(quadUp(x - 0.08, x + 0.08, 1.5, 6.5, 1, 1, 0.012), col("#e9c46a"));              // painted bays on the tarmac
  // the main block: brick front with window holes filled by lived-in panes, a dark interior box behind
  const brick = tex("otmBrickF", brickTex, (2 * BX) / 1.72, (FH * NF + 0.6) / 1.72), trim = col("#efe8d8");
  box(b, brick, I, -BX, BX, 0, FH * NF + 0.6, -12, -0.0);                                                                 // the block
  box(b, col("#d8d0c0"), I, -BX - 0.15, BX + 0.15, FH * NF + 0.6, FH * NF + 0.85, -12.15, 0.15);                         // parapet coping
  for (let f = 0; f < NF; f++) {
    box(b, col("#cfc4b0"), I, -BX, BX, f * FH + 0.02, f * FH + 0.3, 0.0, 0.06);                                         // a stone band per floor
    for (let i = 0; i < 12; i++) {
      const x = -BX + 1.5 + i * 3.0;
      if (f === 0 && Math.abs(x) < 3) continue;                                                                           // the entrance
      const k = (i * 7 + f * 3) % WINDOW_KINDS;
      panel(b, glow(`otmWinM${k}`, () => ({ map: windowTex(k), color: "#e9edf2" })), I, x, f * FH + 1.0 + 0.85, 0.012, 2.2, 1.7);
      box(b, trim, I, x - 1.18, x + 1.18, f * FH + 0.9, f * FH + 1.0, 0.0, 0.14);                                       // sill
    }
  }
  // the entrance: a porch block projecting 2.6 m (glass doors, the sign on its parapet), a clock above it
  const porch = tex("otmBrickP", brickTex, 6.4 / 1.72, 4.2 / 1.72);
  box(b, porch, I, -3.2, 3.2, 0, 4.2, 0.0, 2.6); box(b, col("#d8d0c0"), I, -3.35, 3.35, 4.2, 4.42, -0.1, 2.75);
  panel(b, glow("otmDoors", () => ({ map: windowTex(0), color: "#c9d4df" })), I, 0, 1.3, 2.614, 2.8, 2.6);
  box(b, col("#1f2d4f"), I, -1.5, 1.5, 2.6, 2.75, 2.6, 2.72);
  for (const x of [-2.4, 2.4]) panel(b, glow("otmWinM1", () => ({ map: windowTex(1), color: "#e9edf2" })), I, x, 2.0, 2.614, 1.0, 1.6);
  b.add(plane(4.6, 0.86), glow("otmSignM", () => ({ map: schoolSignTex() })), new THREE.Matrix4().makeTranslation(0, 3.55, 2.62));
  cyl(b, col("#f4f1ea"), I, 0, 5.6, 0.04, 0.48, 0.48, 0.06, 28, Math.PI / 2); cyl(b, col("#1f2d4f"), I, 0, 5.6, 0.0, 0.54, 0.54, 0.05, 28, Math.PI / 2);
  box(b, col("#241726"), I, -0.02, 0.02, 5.6, 5.95, 0.104, 0.12); box(b, col("#241726"), I, 0, 0.26, 5.58, 5.62, 0.104, 0.12);         // the clock's hands
  for (const x of [-16.6, -7.6, 7.6, 16.6]) box(b, col("#4a4d55"), I, x - 0.06, x + 0.06, 0, FH * NF + 0.6, 0.0, 0.12); // downpipes
  for (const [x, w] of [[-10, 2.4], [-6.5, 1.2], [9, 3.0]] as const) box(b, col("#9aa0a6"), I, x - w / 2, x + w / 2, FH * NF + 0.85, FH * NF + 1.9, -6, -3.5); // roof plant
  // the science block (single storey, right), its sign and big lab windows
  const sbrick = tex("otmBrickS", brickTex, 12 / 1.72, 4.2 / 1.72);
  box(b, sbrick, I, 20, 32, 0, 4.2, -10, 0); box(b, col("#d8d0c0"), I, 19.85, 32.15, 4.2, 4.45, -10.15, 0.15);
  for (let i = 0; i < 4; i++) panel(b, glow(`otmWinM${(i + 2) % WINDOW_KINDS}`, () => ({ map: windowTex((i + 2) % WINDOW_KINDS), color: "#e9edf2" })), I, 21.6 + i * 2.6, 2.1, 0.012, 2.0, 1.6);
  b.add(plane(2.4, 0.6), glow("otmSciM", () => ({ map: scienceSignTex() })), new THREE.Matrix4().makeTranslation(26, 3.6, 0.02));
  box(b, col("#c9cdd2"), I, 18, 20, 0, 3.0, -2, -0.2);                                                                    // the link corridor
  // bike shelter, bins, benches, the assembly sign's patch
  box(b, col("#2f6a43"), I, -15.5, -9.5, 2.3, 2.4, 1.2, 3.4); for (const x of [-15.3, -9.7]) for (const z of [1.4, 3.2]) box(b, col("#9aa0a6"), I, x - 0.05, x + 0.05, 0, 2.3, z - 0.05, z + 0.05);
  for (let k = 0; k < 6; k++) box(b, col(["#3f6fb5", "#c25a7a", "#5d8a3a"][k % 3]), I, -15 + k * 0.95, -14.95 + k * 0.95, 0.3, 0.95, 1.6, 3.0); // bikes, end on (thin frames)
  for (const x of [5.5, 6.3, 7.1]) bin(b, { x, z: 0.6 }, "#2f3a33");
  bench(b, { x: -6, z: 7.2, yaw: Math.PI }); bench(b, { x: 9, z: 7.2, yaw: Math.PI });
  for (const [x0, x1] of [[-30, -5.5], [5.5, 30]] as const) {                                                            // green railings, a gap for the path
    for (let x = x0; x <= x1; x += 0.22) box(b, col("#2f5a43"), I, x - 0.015, x + 0.015, 0, 1.1, 7.55, 7.58);
    for (const y of [0.12, 1.02]) box(b, col("#2f5a43"), I, x0, x1, y, y + 0.05, 7.53, 7.6);
  }
  for (const [x, z, h, k] of [[-12.5, 9.5, 6.5, "round"], [12.8, 9.2, 7, "fat"], [-19, 10.5, 7.5, "tall"], [20, 10.8, 6.5, "round"]] as const) tree(b, k, x, 0, z, h, 60 + x, 1);
  for (let k = 0; k < 9; k++) {                                                                                           // school bags dumped by the assembly point
    const x = -5.6 + (k % 5) * 0.34, z = 9.0 + Math.floor(k / 5) * 0.36, c = ["#1f2d4f", "#a8323a", "#2f5f6a", "#3a3d47", "#c8643f"][k % 5];
    box(b, col(c), I, x - 0.15, x + 0.15, 0.022, 0.34, z - 0.1, z + 0.1);
  }
  for (const x of [-2.4, 2.4]) { cyl(b, col("#e2662e"), I, x, 0.01, 8.6, 0.03, 0.16, 0.42, 14); cyl(b, col("#f4f1ea"), I, x, 0.2, 8.6, 0.09, 0.115, 0.07, 14); } // cones at the path
  // trees round the field, a hedge along the back, a fence on the far side
  for (let k = 0; k < 9; k++) tree(b, k % 3 === 0 ? "tall" : "round", -34 + (k % 2) * 3, 0, 14 + k * 6, 6 + (k % 3), k + 3);
  for (let k = 0; k < 9; k++) tree(b, k % 2 === 0 ? "fat" : "round", 34 - (k % 2) * 3, 0, 12 + k * 6, 6 + (k % 2) * 2, k + 21);
  for (let x = -30; x <= 30; x += 2.6) tree(b, "hedge", x, 0, 70.5, 1.8, 40 + x, 1);
  fence(b, { x: 0, z: 68.8 }, 60, 1.4, "#3f5f4a");
  flowers(b, { x: -8, z: 0.7, y: 0.01 }, 10, 1.4, 7); tufts(b, { x: 9, z: 0.6, y: 0.01 }, 9, 1.2, 8);
  b.build(root, true);
  return { root, env: { clouds: true }, spots: ASH_SPOTS, views: ASH_VIEWS };
};


// ---------------------------------------------------------------- the later scenes' props
/** a soft smoke puff (grey, alpha) */
const puffTex = (k: string, c: string) => stex(`otmPuff${k}`, 256, 256, (g) => {
  for (let i = 0; i < 9; i++) { const x = 70 + (i * 37) % 120, y = 80 + (i * 53) % 100, r0 = 50 + (i * 13) % 40; const gr = g.createRadialGradient(x, y, 4, x, y, r0); gr.addColorStop(0, c + "cc"); gr.addColorStop(1, c + "00"); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r0, 0, 7); g.fill(); }
});
/** smokePlume: smoke pouring up from a roof or window, `at` = its base; steps drive it (give it steady steps, e.g.
 *  every 0.15 s): the puffs rise, swell and thin out; variant "dark" for thick smoke */
const smokePlumeRig = (a: At, v = "grey"): PropRig => {
  const root = rigRoot(a), N = 10, c = v === "dark" ? "#3e3f45" : "#6f7076";
  const ps = Array.from({ length: N }, (_, i) => { const m = mesh(plane(2.6, 2.6), new THREE.MeshBasicMaterial({ map: puffTex(v, c), transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0); root.add(m); return { m, i }; });
  return { root, update: ({ step = 0, camPos }) => { for (const { m, i } of ps) { const u = ((i / N) + step * 0.035) % 1; m.position.set(Math.sin(i * 2.1 + u * 3) * 0.6 + u * 1.6, 0.4 + u * 7.5, Math.cos(i * 1.3) * 0.4); m.scale.setScalar(0.8 + u * 2.8); (m.material as THREE.MeshBasicMaterial).opacity = Math.min(1, Math.min(1, u * 6) * (1 - u) * 1.9); m.visible = step > 0.001; m.lookAt(camPos); } } };
};
/** ceilingSmoke: smoke rolling along a ceiling, `at` = the middle of the stretch at ceiling height; variant = the
 *  stretch length in metres (default 12) along local z; steps thicken it and keep it rolling */
const ceilingSmokeRig = (a: At, v = "12"): PropRig => {
  const root = rigRoot(a), L = Number(v) || 12, N = Math.round(L / 1.1);
  const ps = Array.from({ length: N * 2 }, (_, i) => { const m = mesh(plane(2.4, 1.3), new THREE.MeshBasicMaterial({ map: puffTex("dark", "#45464c"), transparent: true, depthWrite: false, toneMapped: false }), 0, 0, 0); root.add(m); return { m, i }; });
  return { root, update: ({ step = 0, camPos }) => { const k = Math.min(1, step / 3); for (const { m, i } of ps) { const z = -L / 2 + ((i * 0.55 + step * 0.12) % L), x = (i % 3 - 1) * 0.6; m.position.set(x, -0.25 - (i % 2) * 0.28 * k, z); (m.material as THREE.MeshBasicMaterial).opacity = 0.85 * k; m.visible = step > 0.001; m.lookAt(camPos); } } };
};
/** fireWindow: a window glowing orange from a fire inside (a pane 2.2 x 1.7 m, `at` = its centre, facing +z), hidden
 *  until step 1; later steps flicker it; variant "figure": a small dark silhouette stands in it */
const fireTex = (fig: boolean) => stex(`otmFire${fig ? 1 : 0}`, 256, 200, (g) => {
  const gr = g.createLinearGradient(0, 200, 0, 0); gr.addColorStop(0, "#ffcf5a"); gr.addColorStop(0.6, "#f07a2a"); gr.addColorStop(1, "#8a2a1a"); g.fillStyle = gr; g.fillRect(0, 0, 256, 200);
  if (fig) { g.fillStyle = "#2a1a1e"; g.beginPath(); g.arc(150, 92, 16, 0, 7); g.fill(); g.fillRect(136, 106, 28, 70); }
  g.strokeStyle = "#f4f1ea"; g.lineWidth = 9; g.strokeRect(4, 4, 248, 192); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 200); g.stroke();
});
const fireWindowRig = (a: At, v?: string): PropRig => {
  const root = rigRoot(a), m = mesh(plane(2.2, 1.7), new THREE.MeshBasicMaterial({ map: fireTex(v === "figure"), toneMapped: false }), 0, 0, 0.02); root.add(m);
  return { root, update: ({ step = 0 }) => { m.visible = step > 0.001; const f = Math.floor(step * 3) % 3; (m.material as THREE.MeshBasicMaterial).color.setScalar(f === 1 ? 0.86 : f === 2 ? 0.94 : 1); } };
};
/** yearPhoto: a framed school year photograph on a wall (0.62 x 0.46 m, `at` = its centre, facing +z): three rows
 *  of pupils under a title; blazers are maroon up to 1980 and navy after; variant = the year. In 1979 the last pupil
 *  of the back row is Carol (pale, a brown bob) */
const yearTex = (y: string) => stex(`otmYear${y}`, 620, 460, (g) => {
  const yr = Number(y) || 1990, old = yr <= 1980; let s0 = yr; const r = () => ((s0 = (s0 * 16807) % 2147483647) / 2147483647);
  g.fillStyle = "#3b2a1e"; g.fillRect(0, 0, 620, 460); g.fillStyle = old ? "#d9c9a3" : "#e8e4da"; g.fillRect(24, 24, 572, 412);
  g.fillStyle = old ? "#9a8a6a" : "#b9c3cc"; g.fillRect(24, 24, 572, 300);
  g.fillStyle = "#2a2a30"; g.font = FONT(26); g.textAlign = "center"; g.fillText(`ASHFORD HIGH  ·  ${y}  ·  YEAR 7`, 310, 400);
  for (let row = 0; row < 3; row++) for (let k = 0; k < 8; k++) {
    const x = 64 + k * 70 + (row % 2) * 12, yy = 90 + row * 74, carol = old && yr === 1979 && row === 0 && k === 7;
    g.fillStyle = carol ? "#7d2f3c" : old ? "#7a3640" : "#1f2d4f"; g.fillRect(x - 22, yy + 18, 44, 40);
    g.fillStyle = carol ? "#e8e1d8" : ["#f1c9a8", "#c99067", "#e8b896", "#a8714c"][Math.floor(r() * 4)]; g.beginPath(); g.arc(x, yy, 19, 0, 7); g.fill();
    g.fillStyle = carol ? "#6a5a4e" : ["#2a201a", "#6b4226", "#a5682f", "#4a2f22"][Math.floor(r() * 4)]; g.beginPath(); g.arc(x, yy - 6, 20, Math.PI, 0); g.fill();
    if (carol) { g.fillRect(x - 20, yy - 6, 8, 22); g.fillRect(x + 12, yy - 6, 8, 22); }
  }
  if (old) { g.fillStyle = "rgba(120,90,40,0.22)"; g.fillRect(24, 24, 572, 412); }
});
const yearPhotoBuild = (b: Batch, a: At, v = "1990") => { const m = frame(a); box(b, col("#3b2a1e"), m, -0.33, 0.33, -0.25, 0.25, -0.03, 0.0); b.add(plane(0.62, 0.46), glow(`otmYearM${v}`, () => ({ map: yearTex(v), color: "#eeeae2" })), at(m, 0, 0, 0.003)); };
/** plaque: the small brass memorial plaque (0.42 x 0.2 m, `at` = its centre, facing +z) */
const plaqueTex = () => stex("otmPlaque", 840, 400, (g) => {
  const gr = g.createLinearGradient(0, 0, 840, 400); gr.addColorStop(0, "#d9b25a"); gr.addColorStop(0.5, "#f0d58a"); gr.addColorStop(1, "#b88c3a"); g.fillStyle = gr; rr(g, 4, 4, 832, 392, 30); g.fill();
  g.strokeStyle = "#7a5a22"; g.lineWidth = 10; rr(g, 22, 22, 796, 356, 20); g.stroke();
  g.fillStyle = "#4a3410"; g.textAlign = "center"; g.font = FONT(44, "normal"); g.fillText("IN MEMORY OF", 420, 110); g.font = FONT(88); g.fillText("CAROL WEBB", 420, 210);
  g.font = FONT(44, "normal"); g.fillText("AGED 11", 420, 275); g.fillText("LOST IN THE FIRE OF 1979", 420, 340);
});
const plaqueBuild = (b: Batch, a: At) => { const m = frame(a); b.add(plane(0.42, 0.2), glow("otmPlaqueM", () => ({ map: plaqueTex() })), at(m, 0, 0, 0.004)); box(b, col("#8a6a2a"), m, -0.215, 0.215, -0.105, 0.105, -0.01, 0.002); };
/** phonePhoto: Ms Okoye's hand holding her phone up to the lens, the photo of the line on its screen (an ink card
 *  0.4 m wide facing +z: ~0.45 m from an `at` camera); variant wide (the whole line, a maroon blazer at the very end)
 *  or zoom (the end of the line, the girl's back) */
const phoneTex = (v: string) => stex(`otmPhone${v}`, 1024, 1024, (g) => {
  g.clearRect(0, 0, 1024, 1024);
  g.fillStyle = "#17191e"; rr(g, 262, 40, 500, 900, 54); g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
  g.save(); rr(g, 292, 90, 440, 800, 30); g.clip();
  g.fillStyle = "#9aa9b8"; g.fillRect(292, 90, 440, 240); g.fillStyle = "#b5603f"; g.fillRect(292, 180, 440, 170); g.fillStyle = "#6f8f4a"; g.fillRect(292, 350, 440, 540);
  const zoom = v === "zoom", n = zoom ? 3 : 10, sc = zoom ? 3.2 : 1;
  for (let k = 0; k < n; k++) { const x = zoom ? 380 + k * 120 : 330 + k * 38, y = zoom ? 520 : 520 + (k % 2) * 4, end = k === n - 1;
    g.fillStyle = end ? "#7d2f3c" : "#1f2d4f"; g.fillRect(x - 9 * sc, y, 18 * sc, 28 * sc);
    g.fillStyle = end ? "#6a5a4e" : ["#f1c9a8", "#c99067", "#e8b896"][k % 3]; g.beginPath(); g.arc(x, y - 8 * sc, 9 * sc, 0, 7); g.fill();
    if (!end) { g.fillStyle = "#2a201a"; g.beginPath(); g.arc(x, y - 11 * sc, 9 * sc, Math.PI, 0); g.fill(); } }
  g.restore();
  g.fillStyle = "#7a3b5c"; rr(g, 640, 860, 384, 164, 26); g.fill(); g.strokeStyle = INK; g.lineWidth = 9; g.stroke();
  g.fillStyle = "#8d5a3b"; rr(g, 600, 780, 220, 140, 50); g.fill(); g.stroke(); for (let k = 0; k < 3; k++) { rr(g, 700 + k * 6, 560 + k * 80, 120, 60, 26); g.fill(); g.stroke(); }
});
const phonePhotoBuild = (b: Batch, a: At, v = "wide") => { b.add(plane(CARD_W, CARD_W), new THREE.MeshBasicMaterial({ map: phoneTex(v), transparent: true, alphaTest: 0.02, toneMapped: false }), at(frame(a), 0, CARD_W / 2, 0)); };

// ---------------------------------------------------------------- sets: the corridor (library and toilets doors) and the boys' toilets
const CORR_SPOTS: Record<string, V3> = { photos: [1.0, 0, -0.2], library: [0.9, 0, -1.6], end: [0, 0, -5.6], mid: [0, 0, 0], near: [0, 0, 3.0] };
const CORR_VIEWS: View[] = [{ name: "down the corridor", pos: [0.2, 1.55, 5.6], look: [0, 1.4, -6.5], fov: 55, establishing: true, cInf: 6 }, { name: "photo wall", pos: [-0.9, 1.55, 1.6], look: [1.6, 1.55, -0.8], fov: 48, cInf: 9 }];
const ashfordCorridor = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.2, d: 14, h: 2.8, floor: tex("otmLino", () => tilesHD("#c9c2b0", 10, "#b3ab98"), 1, 1), wall: tex("otmCorrWall", () => plasterHD("#ece2c8"), 1, 1),
    lower: tex("otmCorrLow", () => plasterHD("#5f8fa3"), 1, 1), lowerH: 1.0, ceiling: "#e8e2d4", tiles: true,
    openings: [{ wall: "back", at: 0, w: 1.0, h: 2.1, sill: 0, kind: "door" }, { wall: "right", at: -1.6, w: 1.1, h: 2.1, sill: 0, kind: "door" }] });
  for (let k = 0; k < 12; k++) { const z = -6.4 + k * 0.62; box(b, col(["#3f6fb5", "#2f5f6a", "#3f6fb5"][k % 3]), I, -1.6, -1.22, 0, 1.85, z, z + 0.58); for (let j = 0; j < 3; j++) box(b, col("#24365a"), I, -1.221, -1.219, 1.4 + j * 0.06, 1.43 + j * 0.06, z + 0.12, z + 0.46); }
  for (let k = 0; k < 6; k++) b.add(plane(1.1, 0.5), glow("otmCeilLight", () => ({ color: "#fff8e8", toneMapped: false })), new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(0, 2.79, -6 + k * 2.3));
  b.add(plane(0.5, 0.2), glow("otmExitM", () => ({ map: stex("otmExit", 256, 100, (g) => { g.fillStyle = "#1e8a4c"; g.fillRect(0, 0, 256, 100); g.fillStyle = "#fff"; g.font = FONT(40); g.textAlign = "center"; g.fillText("FIRE EXIT", 128, 66); }), toneMapped: false })), new THREE.Matrix4().makeTranslation(0, 2.45, -6.98));
  b.add(plane(0.5, 0.16), glow("otmBoysM", () => ({ map: stex("otmBoys", 256, 80, (g) => { g.fillStyle = "#1f2d4f"; g.fillRect(0, 0, 256, 80); g.fillStyle = "#fff"; g.font = FONT(44); g.textAlign = "center"; g.fillText("BOYS", 128, 58); }) })), new THREE.Matrix4().makeTranslation(0.85, 1.6, -6.98));
  b.add(plane(0.55, 0.16), glow("otmLibM", () => ({ map: stex("otmLib", 256, 80, (g) => { g.fillStyle = "#1f2d4f"; g.fillRect(0, 0, 256, 80); g.fillStyle = "#fff"; g.font = FONT(40); g.textAlign = "center"; g.fillText("LIBRARY", 128, 56); }) })), new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(1.585, 2.3, -1.6));
  for (const [z, c] of [[1.4, "#c25a7a"], [2.2, "#e9c46a"], [3.6, "#5d8a3a"]] as const) panel(b, col(c), new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(-1.215, 0, 0), -z, 2.2, 0.0, 0.5, 0.36);
  b.build(root, true);
  return { root, env: { sky: false, clouds: false }, spots: CORR_SPOTS, views: CORR_VIEWS };
};
const TOI_SPOTS: Record<string, V3> = { sinks: [0.2, 0, -1.1], door: [1.4, 0, 1.2], mid: [0, 0, 0.2] };
const TOI_VIEWS: View[] = [{ name: "the sinks", pos: [0.6, 1.3, 2.2], look: [0, 0.9, -1.4], fov: 52, establishing: true, cInf: 7 }];
const ashfordToilets = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.6, d: 3.4, h: 2.7, floor: tex("otmToiFloor", () => tilesHD("#9aa0a6", 10, "#7d838a"), 1, 1), wall: tex("otmToiWall", () => tilesHD("#eef0ee", 12, "#cfd4d2"), 1, 1), ceiling: "#e6e8e4",
    openings: [{ wall: "right", at: 1.1, w: 0.95, h: 2.1, sill: 0, kind: "door" }] });
  for (let k = 0; k < 3; k++) { const x = -1.1 + k * 1.05;                                                                   // three basins, pipes, mirrors
    box(b, col("#f4f4f0"), I, x - 0.3, x + 0.3, 0.78, 0.92, -1.7, -1.25); box(b, col("#c9ced6"), I, x - 0.03, x + 0.03, 0.35, 0.78, -1.62, -1.56);
    box(b, col("#9fb2c2"), I, x - 0.32, x + 0.32, 1.2, 1.85, -1.699, -1.69); box(b, col("#c9ced6"), I, x - 0.02, x + 0.02, 0.92, 1.05, -1.6, -1.55); }
  for (let k = 0; k < 3; k++) { const z = -1.2 + k * 0.9; box(b, col("#5f8fa3"), I, -1.8, -1.0, 0.15, 2.0, z + 0.4, z + 0.43); box(b, col("#6f9fb3"), I, -1.03, -1.0, 0.15, 2.0, z - 0.42, z + 0.4); }
  box(b, col("#c9ced6"), I, 1.75, 1.8, 1.2, 1.5, -0.6, -0.3);                                                               // hand dryer
  b.build(root, true);
  return { root, env: { sky: false, clouds: false }, spots: TOI_SPOTS, views: TOI_VIEWS };
};

export const ONETOOMANY_THEME: Theme = {
  id: "onetoomany", name: "One Too Many (a school ghost story: fire drills at Ashford High)",
  desc: "a British secondary school by day: the main block and science block seen from the playing field, the fire assembly point and class lines of pupils in navy blazers, the red alarm bell, the teacher's fire register on its clipboard, number tags popping up as she counts; the new teacher, the head, a Year 7 boy, and the girl in the old maroon blazer",
  tags: ["school", "mystery", "ghost", "horror", "fire drill"],
  mood: "mystery",
  ambience: { ashfordField: "amb_nature_day" },
  steps: { ashfordField: "step_grass" },
  characters: { okoye: OKOYE, rowe: ROWE, carol: CAROL, leo: LEO, teacherA: TEACHER_A, teacherB: TEACHER_B, firefighter: FIREFIGHTER, teacher1979: TEACHER_1979, okoyeGhost: OKOYE_GHOST },
  characterMeta: {
    okoye: { name: "Ms Okoye", desc: "dark hair up in a bun; a plum cardigan over a cream shirt; navy trousers", personality: "the new Year 7 form tutor at Ashford High (One Too Many): counts carefully, notices what others don't", themes: ["school", "mystery"], tags: ["teacher", "female", "protagonist"] },
    rowe: { name: "Mr Rowe", desc: "stout; receding grey hair; square glasses; grey suit, blue tie", personality: "the head teacher: kind, busy, long since used to the drills coming out one over (One Too Many)", themes: ["school"], tags: ["head", "teacher", "male", "boss"] },
    carol: { name: "Carol", desc: "a small girl with a brown bob in a faded maroon 1979 school blazer and old-gold tie, her colours washed out like an old photograph", personality: "Carol Webb, a Year 7 pupil lost in the 1979 fire (One Too Many): stands at the end of every line, very still, facing the school", themes: ["school", "ghost", "mystery"], tags: ["ghost", "child", "girl", "1979", "uniform"] },
    teacherA: { name: "Teacher on duty (hi-vis)", desc: "tall; short dark hair and beard; a hi-vis vest over a pale blue shirt", personality: "a teacher on fire-drill duty (One Too Many)", themes: ["school"], tags: ["teacher", "hi-vis", "male", "background"] },
    teacherB: { name: "Teacher on duty (hi-vis)", desc: "auburn ponytail; round glasses; a hi-vis vest over a green jumper", personality: "a teacher on fire-drill duty (One Too Many)", themes: ["school"], tags: ["teacher", "hi-vis", "female", "background"] },
    firefighter: { name: "Firefighter", desc: "big; a dark fire tunic with reflective bands; a yellow helmet", personality: "a firefighter at the school fire (One Too Many)", themes: ["fire", "rescue"], tags: ["firefighter", "rescue", "uniform"] },
    teacher1979: { name: "Teacher (1979)", desc: "lanky; side-parted hair and a thin moustache; brown corduroy jacket, wide maroon tie", personality: "the 1979 teacher calling the register on the field (One Too Many flashback)", themes: ["school", "history"], tags: ["teacher", "1970s", "male"] },
    okoyeGhost: { name: "Ms Okoye (after)", desc: "Ms Okoye with her colours washed out like an old photograph", personality: "Ms Okoye at the end of the line, after the fire (One Too Many's last image)", themes: ["school", "ghost"], tags: ["ghost", "teacher"] },
    leo: { name: "Leo", desc: "a small boy with dark curls in today's uniform: navy blazer, red tie", personality: "a Year 7 pupil in 7C (One Too Many)", themes: ["school"], tags: ["child", "boy", "pupil"] },
  },
  items: { clipboard: { name: "Clipboard", desc: "a wooden clipboard with a lined sheet (a register, a checklist)", themes: ["school", "work"], tags: ["clipboard", "register", "list", "teacher", "count"], draw: clipboardItem } },
  props: {
    clipboardCard: { name: "Fire register (insert)", desc: "Ms Okoye's hand holding her fire register up to the lens: 7C FIRE REGISTER, ticked names, ON REGISTER: 30 and COUNTED: <variant> circled in red. An ink card 0.4 m wide facing +z: put it ~0.45 m in front of an `at` camera", category: "theme", themes: ["school", "mystery"], tags: ["clipboard", "register", "count", "insert", "fire drill"], radius: 0.05, height: 0.4,
      build: (b, a, v) => clipboardBuild(b, a, v ?? "31"), param: { desc: "the count she wrote (digits)", ok: (v) => /^\d{1,3}$/.test(v) } },
    fireBell: { name: "Fire alarm bell", desc: "a red electric alarm bell (gong 0.2 m) on a wall plate, `at` = the gong's centre, facing +z (mount it on a wall, ~2.3 m up); each step toggles the hammer against the gong: give it fast steps to ring", category: "theme", themes: ["school", "fire", "alarm"], tags: ["bell", "alarm", "fire", "wall", "school"], radius: 0.05, height: 0.3,
      build: (b, a) => bellParts(b, frame(a)), rig: fireBellRig, steps: ["strike", "release"] },
    assemblySign: { name: "Fire assembly point sign", desc: "the green FIRE ASSEMBLY POINT sign on a 2 m post (panel 0.6 m, facing +z)", category: "theme", themes: ["school", "fire", "street"], tags: ["sign", "fire", "assembly", "safety"], radius: 0.1, height: 2.0,
      build: (b, a) => assemblyBuild(b, a) },
    smokePlume: { name: "Smoke plume", desc: "smoke pouring up from a roof or window (puffs rising ~8 m, swelling and thinning), `at` = its base; give it steady steps (every ~0.15 s) to keep it rising; variant dark for thick smoke", category: "theme", themes: ["fire", "disaster"], tags: ["smoke", "fire", "plume"], radius: 0.5, height: 8,
      build: () => undefined, rig: (a, v) => smokePlumeRig(a, v ?? "grey"), steps: ["it rises"], stepCount: () => 400, variants: { dark: () => undefined } },
    ceilingSmoke: { name: "Smoke along a ceiling", desc: "dark smoke rolling along a ceiling, `at` = the middle of the stretch at ceiling height (y = ceiling), running along local z; variant = the stretch length in m (default 12); steps thicken it (full after 3) and keep it rolling", category: "theme", themes: ["fire"], tags: ["smoke", "fire", "ceiling", "corridor"], radius: 0.5, height: 0.6,
      build: () => undefined, rig: (a, v) => ceilingSmokeRig(a, v ?? "12"), steps: ["it rolls"], stepCount: () => 400, param: { desc: "the stretch length in metres", ok: (v) => /^\d{1,2}$/.test(v) } },
    fireWindow: { name: "Window with fire behind it", desc: "a school window (2.2 x 1.7 m, `at` = its centre, facing +z) glowing orange from a fire inside, hidden until step 1, flickering on later steps; variant figure: a small dark silhouette stands in it", category: "theme", themes: ["fire", "horror"], tags: ["window", "fire", "glow"], radius: 0.05, height: 1.7,
      build: () => undefined, rig: (a, v) => fireWindowRig(a, v), steps: ["it glows"], stepCount: () => 400, variants: { figure: () => undefined } },
    yearPhoto: { name: "School year photograph", desc: "a framed year photograph on a wall (0.62 x 0.46 m, `at` = its centre, facing +z): three rows of Year 7 pupils under ASHFORD HIGH · <year> · YEAR 7; maroon blazers up to 1980, navy after; in 1979 the last pupil of the back row is Carol", category: "theme", themes: ["school", "history", "mystery"], tags: ["photo", "frame", "class photo", "wall"], radius: 0.05, height: 0.46,
      build: (b, a, v) => yearPhotoBuild(b, a, v ?? "1990"), param: { desc: "the year (4 digits)", ok: (v) => /^\d{4}$/.test(v) } },
    plaque: { name: "Memorial plaque (Carol Webb)", desc: "a small brass plaque (0.42 x 0.2 m, `at` = its centre, facing +z): IN MEMORY OF / CAROL WEBB / AGED 11 / LOST IN THE FIRE OF 1979", category: "theme", themes: ["school", "history", "ghost"], tags: ["plaque", "memorial", "brass", "wall"], radius: 0.05, height: 0.2, build: (b, a) => plaqueBuild(b, a) },
    phonePhoto: { name: "Phone photo of the line (insert)", desc: "Ms Okoye's hand holding her phone to the lens, its screen showing the photo of 7C's line: variant wide (ten in a row, a maroon blazer at the very end) or zoom (the end of the line: the girl's back). An ink card 0.4 m wide facing +z: ~0.45 m from an `at` camera", category: "theme", themes: ["school", "mystery"], tags: ["phone", "photo", "insert"], radius: 0.05, height: 0.4,
      build: (b, a, v) => phonePhotoBuild(b, a, v ?? "wide"), param: { desc: "wide or zoom", ok: (v) => v === "wide" || v === "zoom" } },
    countTag: { name: "Count tag", desc: "a round white tag with a number (0.26 m), turning to face the camera, hidden until its step starts, when it pops up at once (a head being counted): put it ~0.35 m over a head; variant = the number", category: "theme", themes: ["school", "explainer"], tags: ["number", "count", "tag", "label"], radius: 0.05, height: 0.26,
      build: () => undefined, rig: (a, v) => countTagRig(a, v ?? "1"), steps: ["it pops up"], param: { desc: "the number (digits)", ok: (v) => /^\d{1,3}$/.test(v) } },
  },
  sets: { ashfordField: { id: "ashfordField", title: "Ashford High from the playing field: the main block, the science block, the playground and the fire assembly point", lights: ["day", "golden"], build: ashfordField },
    ashfordCorridor: { id: "ashfordCorridor", title: "Ashford High corridor: lockers, the year-photo wall, the library and the boys' toilets", lights: ["interior", "interiorCool"], build: ashfordCorridor },
    ashfordToilets: { id: "ashfordToilets", title: "Ashford High boys' toilets: three basins under mirrors, cubicles, a hand dryer", lights: ["interiorCool"], build: ashfordToilets } },
  layouts: { ashfordField: { spots: ASH_SPOTS, views: ASH_VIEWS }, ashfordCorridor: { spots: CORR_SPOTS, views: CORR_VIEWS }, ashfordToilets: { spots: TOI_SPOTS, views: TOI_VIEWS } },
  setMeta: { ashfordCorridor: { name: "Ashford High corridor", desc: "a 3.2 m school corridor (x -1.6..1.6) from the boys' toilets door at the end (z -7) to the camera side (z +7), 2.8 m ceiling with light panels: blue lockers along the left wall, notice-board posters; the right wall (x 1.6) takes yearPhoto and plaque props (yaw -90); the LIBRARY door in the right wall at z -1.6; a FIRE EXIT sign over the end door (marks: photos, library, end, mid, near / views: down the corridor, photo wall / lights: interior, interiorCool)", themes: ["school", "indoor"], tags: ["corridor", "school", "lockers", "hallway"] },
    ashfordToilets: { name: "Ashford High boys' toilets", desc: "a tiled 3.6 x 3.4 m room: three wall basins under mirrors on the back wall (z -1.7, basin tops 0.92 m), three cubicles on the left, a hand dryer and the door on the right (marks: sinks, door, mid / views: the sinks / lights: interiorCool)", themes: ["school", "indoor"], tags: ["toilets", "bathroom", "school"] },
    ashfordField: { name: "Ashford High (school from the field)", desc: "the three-storey main block faces +z at z 0 (x -18..18, 10.2 m tall, lived-in windows), the glass entrance at x 0 under a canopy and the ASHFORD HIGH SCHOOL sign; the single-storey science block at x 20..32; tarmac playground z 0..8 with a bike shelter (x -15..-9), bins and benches; the field from z 8 (pitch lines from z 24), trees down both sides, a hedge and fence at z 70. Class lines form on the grass from z 11; put the assemblySign prop at the assembly mark (marks: entrance, assembly, line, teacher, head, science, playground / views: field, lines, entrance / lights: day, golden)", themes: ["school", "outdoor", "mystery"], tags: ["school", "field", "playground", "outdoor", "building", "fire drill"] } },
};
