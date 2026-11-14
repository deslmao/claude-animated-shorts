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
import { grassHD } from "../../materials/paint";
import { asphaltHD } from "../../materials/paint2";
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

// ---------------------------------------------------------------- item: clipboard (held)
const clipboardItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 3 * u * s, cy = y - 2 * u;
  p.poly([[cx - 12 * u, cy - 16 * u], [cx + 12 * u, cy - 16 * u], [cx + 12 * u, cy + 16 * u], [cx - 12 * u, cy + 16 * u]], "#a8784a", 2.4 * u); // the board
  p.poly([[cx - 9 * u, cy - 12 * u], [cx + 9 * u, cy - 12 * u], [cx + 9 * u, cy + 13 * u], [cx - 9 * u, cy + 13 * u]], "#f6f2e8", 1.6 * u); // the sheet
  p.poly([[cx - 5 * u, cy - 18 * u], [cx + 5 * u, cy - 18 * u], [cx + 5 * u, cy - 12 * u], [cx - 5 * u, cy - 12 * u]], "#9aa0a6", 1.6 * u); // the clip
  for (let k = 0; k < 5; k++) p.stroke([[cx - 6 * u, cy - 7 * u + k * 4 * u], [cx + 6 * u, cy - 7 * u + k * 4 * u]], 1 * u, "#8c93a3");
};

// ---------------------------------------------------------------- textures
const brickTex = () => stex("otmBrick", 512, 512, (g) => {
  g.fillStyle = "#e0d4bf"; g.fillRect(0, 0, 512, 512); let s = 23; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const bw = 64, bh = 22;
  for (let y = 0, row = 0; y < 512; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < 512; x += bw) { const t = r(); g.fillStyle = t > 0.7 ? "#b98a5c" : t > 0.35 ? "#c99b6c" : "#d4a878"; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
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
  b.add(quadUp(-70, 70, 8, 80, 40, 20, 0.01), tex("otmGrass", grassHD, 1, 1));
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
  // the entrance: glass doors, a canopy on posts, the sign above
  panel(b, glow("otmDoors", () => ({ map: windowTex(0), color: "#c9d4df" })), I, 0, 1.3, 0.014, 2.8, 2.6);
  box(b, col("#1f2d4f"), I, -1.5, 1.5, 2.6, 2.75, 0.0, 0.12);
  box(b, col("#f1efe8"), I, -2.6, 2.6, 2.9, 3.05, 0, 2.6); for (const x of [-2.4, 2.4]) box(b, col("#9aa0a6"), I, x - 0.06, x + 0.06, 0, 2.9, 2.36, 2.48);
  b.add(plane(4.6, 0.86), glow("otmSignM", () => ({ map: schoolSignTex() })), new THREE.Matrix4().makeTranslation(0, 3.62, 0.02));
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
  // trees round the field, a hedge along the back, a fence on the far side
  for (let k = 0; k < 9; k++) tree(b, k % 3 === 0 ? "tall" : "round", -34 + (k % 2) * 3, 0, 14 + k * 6, 6 + (k % 3), k + 3);
  for (let k = 0; k < 9; k++) tree(b, k % 2 === 0 ? "fat" : "round", 34 - (k % 2) * 3, 0, 12 + k * 6, 6 + (k % 2) * 2, k + 21);
  for (let x = -30; x <= 30; x += 2.6) tree(b, "hedge", x, 0, 70.5, 1.8, 40 + x, 1);
  fence(b, { x: 0, z: 68.8 }, 60, 1.4, "#3f5f4a");
  flowers(b, { x: -8, z: 0.7, y: 0.01 }, 10, 1.4, 7); tufts(b, { x: 9, z: 0.6, y: 0.01 }, 9, 1.2, 8);
  b.build(root, true);
  return { root, env: { clouds: true }, spots: ASH_SPOTS, views: ASH_VIEWS };
};

export const ONETOOMANY_THEME: Theme = {
  id: "onetoomany", name: "One Too Many (a school ghost story: fire drills at Ashford High)",
  desc: "a British secondary school by day: the main block and science block seen from the playing field, the fire assembly point and class lines of pupils in navy blazers, the red alarm bell, the teacher's fire register on its clipboard, number tags popping up as she counts; the new teacher, the head, a Year 7 boy, and the girl in the old maroon blazer",
  tags: ["school", "mystery", "ghost", "horror", "fire drill"],
  mood: "mystery",
  ambience: { ashfordField: "amb_nature_day" },
  steps: { ashfordField: "step_grass" },
  characters: { okoye: OKOYE, rowe: ROWE, carol: CAROL, leo: LEO },
  characterMeta: {
    okoye: { name: "Ms Okoye", desc: "dark hair up in a bun; a plum cardigan over a cream shirt; navy trousers", personality: "the new Year 7 form tutor at Ashford High (One Too Many): counts carefully, notices what others don't", themes: ["school", "mystery"], tags: ["teacher", "female", "protagonist"] },
    rowe: { name: "Mr Rowe", desc: "stout; receding grey hair; square glasses; grey suit, blue tie", personality: "the head teacher: kind, busy, long since used to the drills coming out one over (One Too Many)", themes: ["school"], tags: ["head", "teacher", "male", "boss"] },
    carol: { name: "Carol", desc: "a small girl with a brown bob in a faded maroon 1979 school blazer and old-gold tie, her colours washed out like an old photograph", personality: "Carol Webb, a Year 7 pupil lost in the 1979 fire (One Too Many): stands at the end of every line, very still, facing the school", themes: ["school", "ghost", "mystery"], tags: ["ghost", "child", "girl", "1979", "uniform"] },
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
    countTag: { name: "Count tag", desc: "a round white tag with a number (0.26 m), turning to face the camera, hidden until its step starts, when it pops up at once (a head being counted): put it ~0.35 m over a head; variant = the number", category: "theme", themes: ["school", "explainer"], tags: ["number", "count", "tag", "label"], radius: 0.05, height: 0.26,
      build: () => undefined, rig: (a, v) => countTagRig(a, v ?? "1"), steps: ["it pops up"], param: { desc: "the number (digits)", ok: (v) => /^\d{1,3}$/.test(v) } },
  },
  sets: { ashfordField: { id: "ashfordField", title: "Ashford High from the playing field: the main block, the science block, the playground and the fire assembly point", lights: ["day", "golden"], build: ashfordField } },
  layouts: { ashfordField: { spots: ASH_SPOTS, views: ASH_VIEWS } },
  setMeta: { ashfordField: { name: "Ashford High (school from the field)", desc: "the three-storey main block faces +z at z 0 (x -18..18, 10.2 m tall, lived-in windows), the glass entrance at x 0 under a canopy and the ASHFORD HIGH SCHOOL sign; the single-storey science block at x 20..32; tarmac playground z 0..8 with a bike shelter (x -15..-9), bins and benches; the field from z 8 (pitch lines from z 24), trees down both sides, a hedge and fence at z 70. Class lines form on the grass from z 11; put the assemblySign prop at the assembly mark (marks: entrance, assembly, line, teacher, head, science, playground / views: field, lines, entrance / lights: day, golden)", themes: ["school", "outdoor", "mystery"], tags: ["school", "field", "playground", "outdoor", "building", "fire drill"] } },
};
