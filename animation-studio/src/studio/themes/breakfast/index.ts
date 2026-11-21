// "Don't Eat It. I'm Still at Work." theme (productions/breakfast-text/script.md, approved by the owner): an everyday
// POV mystery at 7:42 on a school morning. Mum is making breakfast; Mum texts that she's still at work; then a second
// Mum knocks at the front door.
// Reused: buildRoom (with its new opt-in "arch" opening), the interior props (counter, stove, fridge, chair, floor),
// kit primitives.
// New here (additions only):
//   set bfKitchen (the kitchen; an open arch in the back wall onto the hallway; the front door at its far end)
//   props bfPan (the pan on the stove; the pancake flips on each step), bfPhone (a phone lying flat; its screen lights
//     on its step: variants yours / mum), bfPlate (three pancakes, a fork), bfFrontDoor (the front door's leaf with
//     its frosted glass; variant shadow = someone's silhouette behind the glass; each step = a knock that shakes the
//     leaf), bfInsert (9:16 close insert cards, a state per step), bfChoice (the A / B vote panels)
//   characters mum, bug
//   item fryPan (a frying pan with a pancake, held)
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import type { Pen } from "../../characters/toon";
import { Batch } from "../../materials/geo";
import { buildRoom } from "../../sets/room";
import { At, col, tex, glow, box, rbox, cyl, sph } from "../../props/kit";
import { floorMat, counter, fridge, stove, chair } from "../../props/interior";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";
import type { View } from "../../sets/types";
import type { V3 } from "../../camera/keys";

const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const INK = "#1b1222", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const PINK = "#ff7fa8", WARM = "#ffb070", COOL = "#8fc8ff";

// ---------------------------------------------------------------- set: the kitchen
// 4.6 x 3.8 m, open toward +z; back wall at z -1.9. Along the back wall, left to right: a counter under the window
// (x -1.75), the stove (x -0.75), a short counter beside it where Mum's phone lies (x -0.05), the open arch onto the
// hallway (x 0.95, 1.0 m wide), the fridge (x 1.9). The hallway runs straight back from the arch to the front door
// at z -4.5 (in front of the window's painted view, which hangs 3 m behind the back wall) (frosted glass; the leaf itself is the bfFrontDoor prop). The table is in the middle; Bug's chair is on
// its near side (spot bugSeat, facing -z).
const AX = 0.95, AW = 1.0, AH = 2.1, HZ = -4.5, HX0 = 0.3, HX1 = 1.6;
const KITCHEN_SPOTS: Record<string, V3> = {
  stove: [-0.75, 0, -0.95], serve: [-0.35, 0, 0.05], block: [0.7, 0, -1.15], arch: [AX, 0, -1.6],
  bugSeat: [0.25, 0.46, 1.25], bugStand: [0.3, 0, 1.55], hallDoor: [AX, 0, HZ + 0.35], hall: [AX, 0, -3.2],
};
const KITCHEN_VIEWS: View[] = [
  { name: "kitchen", pos: [0.2, 1.45, 3.6], look: [0, 1.1, -1.2], fov: 50, establishing: true },
  { name: "hall", pos: [AX - 0.1, 1.45, 1.2], look: [AX, 1.3, HZ], fov: 40 },
];
/** the front door's frame in the far wall of the hallway; the leaf is the bfFrontDoor prop */
const DOOR = { x0: AX - 0.42, x1: AX + 0.42, h: 2.05 };
const kitchenWall = () => stex("bfWall", 128, 128, (g) => { g.fillStyle = "#efe0c0"; g.fillRect(0, 0, 128, 128); });
const tileTex = () => stex("bfTiles", 256, 256, (g) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#cfc8bb"; g.lineWidth = 3;
  for (let i = 0; i <= 256; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
});
const bfKitchen = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 4.6, d: 3.8, h: 2.5, floor: floorMat(), wall: tex("bfKitWall", kitchenWall, 1, 1), trim: "#f6f1e6",
    openings: [{ wall: "back", at: -1.6, w: 1.0, h: 0.95, sill: 1.15, view: "garden" }, { wall: "back", at: AX, w: AW, h: AH, sill: 0, kind: "arch" }] });
  // the splashback tiles behind the counters and the stove (1 cm proud of the wall)
  b.add(new THREE.PlaneGeometry(2.75, 0.55), tex("bfTile", tileTex, 4, 0.8), new THREE.Matrix4().makeTranslation(-1.0, 1.2, -1.885));
  counter(b, { x: -1.72, z: -1.58 }, 1.1); stove(b, { x: -0.75, z: -1.58 }); counter(b, { x: -0.07, z: -1.58 }, 0.66);
  fridge(b, { x: 1.9, z: -1.52, y: 0.003 });
  // the cooker hood over the stove, wall cupboards either side
  rbox(b, col("#c9cdd2"), I, -0.75, 1.85, -1.72, 0.74, 0.2, 0.36, 0.03); box(b, col("#9aa0a8"), I, -0.86, -0.64, 2.05, 2.48, -1.86, -1.76);
  for (const x of [-1.75, -0.07]) { rbox(b, col("#5f8f86"), I, x === -0.07 ? x : -1.72, 1.75, -1.72, x === -0.07 ? 0.64 : 1.04, 0.62, 0.34, 0.02); }
  for (const x of [-2.1, -1.4, -0.07]) box(b, col("#e9e2d4"), I, x - 0.02, x + 0.02, 1.9, 2.1, -1.545, -1.535);
  // jars and a kettle on the counters
  for (const [x, c, h] of [[-2.15, "#d9a25a", 0.16], [-2.0, "#c86a4a", 0.12], [-1.86, "#e9e2d4", 0.18]] as const) cyl(b, col(c), I, x, 0.92, -1.72, 0.05, 0.05, h, 12);
  cyl(b, col("#3f6f9a"), I, -1.3, 0.92, -1.62, 0.09, 0.11, 0.2, 14);
  // the table and the chairs (Bug's on the near side)
  box(b, col("#c49a68"), I, -0.7, 0.7, 0.72, 0.78, 0.15, 0.95);
  for (const [x, z] of [[-0.62, 0.22], [0.62, 0.22], [-0.62, 0.88], [0.62, 0.88]] as const) box(b, col("#a47a4c"), I, x - 0.035, x + 0.035, 0, 0.72, z - 0.035, z + 0.035);
  chair(b, { x: 0.25, z: 1.27, yaw: Math.PI });
  cyl(b, col("#f3f0e8"), I, -0.3, 0.78, 0.45, 0.06, 0.05, 0.1, 14); cyl(b, col("#ffcf6a"), I, 0.45, 0.78, 0.38, 0.05, 0.05, 0.16, 12);   // a mug; the juice
  // the hallway behind the arch: boards, walls, a lower ceiling, a runner, coats on hooks, the front door's frame
  const hw = col("#d9c7a3"), trim = col("#f6f1e6");
  box(b, floorMat(), I, HX0, HX1, -0.02, 0, HZ, -1.9);
  box(b, col("#7a3a3a"), I, AX - 0.32, AX + 0.32, 0, 0.006, HZ + 0.25, -2.2);
  box(b, hw, I, HX0 - 0.12, HX0, 0, 2.5, HZ, -2.05); box(b, hw, I, HX1, HX1 + 0.12, 0, 2.5, HZ, -2.05);
  box(b, glow("bfHallCeil", () => ({ color: "#d8ccb4" })), I, HX0 - 0.11, HX1 + 0.11, 2.3, 2.36, HZ + 0.002, -2.052);
  box(b, trim, I, HX0, HX0 + 0.025, 0, 0.12, HZ, -2.05); box(b, trim, I, HX1 - 0.025, HX1, 0, 0.12, HZ, -2.05);
  for (const [z, c] of [[-3.65, "#3a4f6a"], [-4.0, "#8a5a3c"]] as const) { box(b, col("#c9a24e"), I, HX0, HX0 + 0.06, 1.7, 1.73, z - 0.02, z + 0.02); rbox(b, col(c), I, HX0 + 0.08, 0.95, z, 0.14, 0.78, 0.3, 0.05); }
  box(b, hw, I, HX0 - 0.12, DOOR.x0, 0, 2.36, HZ - 0.12, HZ); box(b, hw, I, DOOR.x1, HX1 + 0.12, 0, 2.36, HZ - 0.12, HZ); box(b, hw, I, DOOR.x0, DOOR.x1, DOOR.h, 2.36, HZ - 0.12, HZ);
  for (const [a0, a1, b0, b1] of [[DOOR.x0 - 0.08, DOOR.x0, 0, DOOR.h + 0.08], [DOOR.x1, DOOR.x1 + 0.08, 0, DOOR.h + 0.08], [DOOR.x0, DOOR.x1, DOOR.h, DOOR.h + 0.08]]) box(b, trim, I, a0, a1, b0, b1, HZ, HZ + 0.04);
  // daylight outside the door (seen round the leaf's edges), a warm lamp in the hallway
  box(b, glow("bfOutside", () => ({ color: "#f3f6ff" })), I, DOOR.x0, DOOR.x1, 0, DOOR.h, HZ - 0.2, HZ - 0.19);
  sph(b, glow("bfHallLamp", () => ({ color: "#fff0cc" })), I, AX, 2.22, -3.6, 0.14, 0.07, 0.14, 14);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: KITCHEN_SPOTS, views: KITCHEN_VIEWS };
};

// ---------------------------------------------------------------- 3D props
/** the pan on the front-left burner; the pancake flips on each step (it rises, turns over, lands) */
const panRig = (a: At): PropRig => {
  const root = rigRoot(a);
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.045, 24), new THREE.MeshLambertMaterial({ color: "#2a2c33" })); pan.position.y = 0.022; root.add(pan);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.025, 0.2), new THREE.MeshLambertMaterial({ color: "#1a1b20" })); handle.position.set(0.0, 0.04, 0.22); handle.rotation.x = -0.18; root.add(handle);
  const cake = new THREE.Group(); root.add(cake);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.016, 20), new THREE.MeshLambertMaterial({ color: "#d99a48" })); cake.add(top);
  const under = new THREE.Mesh(new THREE.CylinderGeometry(0.096, 0.096, 0.004, 20), new THREE.MeshLambertMaterial({ color: "#f2d39a" })); under.position.y = -0.009; cake.add(under);
  return { root, update: ({ step = 0 }) => {
    const f = step - Math.floor(step), n = Math.floor(step);
    cake.position.y = 0.05 + Math.sin(f * Math.PI) * 0.28; cake.rotation.x = (n + f) * Math.PI;
  } };
};
/** a phone screen at 3D scale: a lock screen with one notification */
const phoneScreenTex = (mum: boolean) => stex(`bfPhoneScr_${mum}`, 128, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, mum ? "#5a2a48" : "#24345a"); gr.addColorStop(1, "#0e1118"); g.fillStyle = gr; g.fillRect(0, 0, 128, 256);
  g.fillStyle = "#ffffff"; g.font = F(30); g.textAlign = "center"; g.fillText("7:42", 64, 62);
  g.fillStyle = "rgba(255,255,255,0.88)"; g.beginPath(); g.roundRect(10, 100, 108, 46, 10); g.fill();
  g.fillStyle = PINK; g.beginPath(); g.arc(28, 123, 10, 0, Math.PI * 2); g.fill(); g.fillStyle = "#222"; g.fillRect(44, 112, 60, 7); g.fillRect(44, 127, 48, 6);
});
/** a phone lying flat (screen up, its top toward -z); the screen lights on its first step. Variants yours (a yellow
 *  case) / mum (a pink case) */
const phoneRig = (a: At, v = "yours"): PropRig => {
  const root = rigRoot(a), mum = v === "mum";
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.078, 0.009, 0.158), new THREE.MeshLambertMaterial({ color: mum ? "#e86a96" : "#f2c23a" })); body.position.y = 0.0045; root.add(body);
  const mat = new THREE.MeshBasicMaterial({ color: "#05060a", toneMapped: false }); const lit = phoneScreenTex(mum);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.145).rotateX(-Math.PI / 2), mat); scr.position.y = 0.0095; root.add(scr);
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.42).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: mum ? "#ff9ac0" : "#9cc4ff", transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
  halo.position.y = 0.012; halo.layers.set(NOINK); root.add(halo);
  return { root, update: ({ step = 0 }) => {
    const k = Math.max(0, Math.min(1, step * 1.6));
    if (k > 0.02) { mat.map = lit; mat.color.set("#ffffff").multiplyScalar(0.25 + 0.75 * k); } else { mat.map = null; mat.color.set("#05060a"); }
    mat.needsUpdate = true; (halo.material as THREE.MeshBasicMaterial).opacity = 0.32 * k;
  } };
};
/** three pancakes on a plate, butter and syrup, a fork beside it, untouched */
const plateRig = (a: At): PropRig => {
  const root = rigRoot(a), b = new Batch(), I = new THREE.Matrix4();
  cyl(b, col("#f7f5ef"), I, 0, 0, 0, 0.13, 0.11, 0.015, 24);
  for (let k = 0; k < 3; k++) cyl(b, col(k % 2 ? "#e0a656" : "#d99a48"), I, 0, 0.015 + k * 0.017, 0, 0.09, 0.09, 0.016, 20);
  box(b, col("#fff2a0"), I, -0.02, 0.02, 0.066, 0.078, -0.02, 0.02); cyl(b, col("#a8561e"), I, 0.02, 0.066, 0.02, 0.05, 0.05, 0.003, 16);
  box(b, col("#c9ccd2"), I, 0.16, 0.175, 0, 0.006, -0.1, 0.1);
  b.build(root, true);
  return { root, update: () => undefined };
};
/** the front door's leaf with frosted glass (daylight). shadow: a dark head-and-shoulders silhouette behind the glass.
 *  Each step is a knock: the leaf jolts in its frame */
const silhouetteTex = () => stex("bfSilhouette", 256, 384, (g) => {
  g.clearRect(0, 0, 256, 384); g.fillStyle = "rgba(20,18,30,0.88)"; g.shadowColor = "rgba(20,18,30,0.9)"; g.shadowBlur = 26;
  g.beginPath(); g.ellipse(128, 120, 50, 62, 0, 0, Math.PI * 2); g.fill();                      // the head
  g.beginPath(); g.ellipse(128, 70, 40, 30, 0, 0, Math.PI * 2); g.fill();                        // the bun
  g.beginPath(); g.moveTo(20, 384); g.bezierCurveTo(30, 230, 90, 200, 128, 200); g.bezierCurveTo(166, 200, 226, 230, 236, 384); g.closePath(); g.fill();
});
const frostTex = () => stex("bfFrost", 128, 192, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 192); gr.addColorStop(0, "#f4f8ff"); gr.addColorStop(1, "#dfe8f6"); g.fillStyle = gr; g.fillRect(0, 0, 128, 192);
  g.fillStyle = "rgba(255,255,255,0.35)"; for (let i = 0; i < 40; i++) g.fillRect((i * 37) % 128, (i * 53) % 192, 6, 6);
});
const frontDoorRig = (a: At, v = "empty"): PropRig => {
  const root = rigRoot(a), leaf = new THREE.Group(); root.add(leaf);
  const W = DOOR.x1 - DOOR.x0 - 0.04, H = DOOR.h - 0.02, b = new Batch(), I = new THREE.Matrix4();
  const gx0 = -0.22, gx1 = 0.22, gy0 = 1.05, gy1 = 1.85;
  // the leaf: a deep green front door with a glazed upper panel, a letterbox and a brass knob
  box(b, col("#2f5a4a"), I, -W / 2, gx0, 0, H, 0, 0.045); box(b, col("#2f5a4a"), I, gx1, W / 2, 0, H, 0, 0.045);
  box(b, col("#2f5a4a"), I, gx0, gx1, 0, gy0, 0, 0.045); box(b, col("#2f5a4a"), I, gx0, gx1, gy1, H, 0, 0.045);
  for (const yy of [0.25]) box(b, col("#264a3c"), I, -W / 2 + 0.1, W / 2 - 0.1, yy, yy + 0.55, 0.045, 0.055);
  box(b, col("#c9a24e"), I, -0.14, 0.14, 0.92, 0.96, 0.045, 0.06); sph(b, col("#c9a24e"), I, W / 2 - 0.1, 1.0, 0.07, 0.035, 0.035, 0.035, 10);
  b.build(leaf, true);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(gx1 - gx0, gy1 - gy0), new THREE.MeshBasicMaterial({ map: frostTex(), toneMapped: false })); glass.position.set(0, (gy0 + gy1) / 2, 0.02); leaf.add(glass);
  if (v === "shadow") {
    const sil = new THREE.Mesh(new THREE.PlaneGeometry((gx1 - gx0) * 0.92, (gy1 - gy0) * 0.95), new THREE.MeshBasicMaterial({ map: silhouetteTex(), transparent: true, depthWrite: false, toneMapped: false }));
    sil.position.set(0, (gy0 + gy1) / 2 - 0.02, 0.022); sil.layers.set(NOINK); leaf.add(sil);
  }
  return { root, update: ({ step = 0 }) => {
    // one shake per knock: at rest on whole steps; knocks closer together than a step's glide still each shake it
    const j = Math.sin(step * Math.PI * 2) * 0.014;
    leaf.position.z = j; leaf.rotation.y = j * 0.6;
  } };
};

// ---------------------------------------------------------------- inserts (9:16 cards)
type Ins = { n: number; draw: (g: CanvasRenderingContext2D, st: number) => void };
const vig = (g: CanvasRenderingContext2D, a = 0.5) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.3, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
const wrap = (g: CanvasRenderingContext2D, text: string, maxW: number) => {
  const out: string[] = []; let line = "";
  for (const w of text.split(" ")) { const t = line ? line + " " + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
};
const heart = (g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) => {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = c; g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-14, -4, -8, -16, 0, -8); g.bezierCurveTo(8, -16, 14, -4, 0, 6); g.fill(); g.restore();
};
/** a message thread inside the screen rect (x, y, w, h). msgs: [text, mine?] */
const thread = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, title: string, msgs: [string, boolean][], opts: { font?: number; typing?: boolean; sent?: string } = {}) => {
  const fs = opts.font ?? 50;
  g.save(); g.beginPath(); g.roundRect(x, y, w, h, 40); g.clip();
  g.fillStyle = "#0e1118"; g.fillRect(x, y, w, h);
  g.fillStyle = "#171c27"; g.fillRect(x, y, w, 190);
  g.fillStyle = "#8b93a5"; g.font = F(30, "normal"); g.textAlign = "left"; g.fillText("7:42", x + 34, y + 46);
  g.fillStyle = PINK; g.beginPath(); g.arc(x + w / 2, y + 100, 34, 0, Math.PI * 2); g.fill(); heart(g, x + w / 2, y + 102, 2.2, "#ffffff");
  g.fillStyle = "#e9edf5"; g.font = F(40); g.textAlign = "center"; g.fillText(title, x + w / 2, y + 170);
  let yy = y + 240;
  g.font = F(fs);
  for (const [text, mine] of msgs) {
    const lines = wrap(g, text, w - 170), bh = 40 + lines.length * fs * 1.22, bw = Math.min(w - 90, Math.max(...lines.map((l) => g.measureText(l).width)) + 64);
    const bx = mine ? x + w - 36 - bw : x + 36;
    g.fillStyle = mine ? "#2f6bff" : "#2a303c"; g.beginPath(); g.roundRect(bx, yy, bw, bh, 34); g.fill();
    g.fillStyle = "#ffffff"; g.textAlign = "left"; lines.forEach((l, i) => g.fillText(l, bx + 32, yy + 24 + fs * 0.95 + i * fs * 1.22));
    yy += bh + 26;
  }
  if (opts.sent) { g.fillStyle = "#8b93a5"; g.font = F(30, "normal"); g.textAlign = "right"; g.fillText(opts.sent, x + w - 44, yy + 10); }
  if (opts.typing) { g.fillStyle = "#2f6bff"; g.beginPath(); g.roundRect(x + w - 36 - 170, yy, 170, 84, 34); g.fill(); g.fillStyle = "#ffffff"; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + w - 36 - 128 + k * 42, yy + 42, 11, 0, Math.PI * 2); g.fill(); } }
  g.restore();
};
const wood = (g: CanvasRenderingContext2D, y0: number, y1: number, c0 = "#b98c5a", c1 = "#a47a4c") => {
  g.fillStyle = c0; g.fillRect(0, y0, IW, y1 - y0); g.strokeStyle = c1; g.lineWidth = 5;
  for (let y = y0 + 40; y < y1; y += 90) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(250, y + 14, 520, y - 12, IW, y + 6); g.stroke(); }
};
/** a hand holding the phone from below (side -1 = left) */
const holdHand = (g: CanvasRenderingContext2D, x: number, y: number, side: 1 | -1, skin = "#e8b896") => {
  g.save(); g.translate(x, y); g.scale(side, 1); g.fillStyle = skin; g.lineWidth = 10; g.strokeStyle = INK;
  g.beginPath(); g.roundRect(-40, -150, 120, 330, 60); g.fill(); g.stroke();                       // palm and the heel of the hand
  g.beginPath(); g.roundRect(30, -230, 56, 170, 28); g.fill(); g.stroke();                          // the thumb over the edge
  g.restore();
};
const INSERTS: Record<string, Ins> = {
  // the first text: your phone on the table, the screen filling the card
  text1: { n: 1, draw: (g) => {
    wood(g, 0, IH); g.fillStyle = "#f2c23a"; g.beginPath(); g.roundRect(70, 90, IW - 140, IH - 180, 70); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    thread(g, 100, 120, IW - 200, IH - 240, "MUM", [["Don't eat it. I'm still at work.", false]], { font: 58 });
    vig(g, 0.45);
  } },
  // the three rules, read in your lap under the table so she can't see (one more each step)
  rules: { n: 3, draw: (g, st) => {
    g.fillStyle = "#2a2230"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#3a3f55"; g.beginPath(); g.ellipse(IW / 2, IH + 120, 520, 420, 0, 0, Math.PI * 2); g.fill();        // your lap
    g.fillStyle = "#6a4a30"; g.fillRect(0, 0, IW, 150); g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(0, 150, IW, 40);   // the table's edge above, its shadow
    g.fillStyle = "#f2c23a"; g.beginPath(); g.roundRect(120, 240, IW - 240, 1080, 60); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    const R: [string, boolean][] = [["Rule one. Don't let her see you read this.", false], ["Rule two. Don't eat anything she gives you.", false], ["Rule three. Get to the front door. Walk. Don't run.", false]];
    thread(g, 145, 265, IW - 290, 1030, "MUM", [["Don't eat it. I'm still at work.", false], ...R.slice(0, st + 1)], { font: 40 });
    g.fillStyle = "rgba(120,170,255,0.10)"; g.fillRect(0, 0, IW, IH);
    holdHand(g, 150, 1240, 1); holdHand(g, IW - 150, 1240, -1);
    vig(g, 0.55);
  } },
  // Mum's hospital lanyard on its hook by the door: her ID, NIGHT SHIFT 9 PM - 9 AM
  badge: { n: 1, draw: (g) => {
    g.fillStyle = "#d9c7a3"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#c9a24e"; g.beginPath(); g.roundRect(IW / 2 - 40, 150, 80, 60, 14); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();   // the hook
    g.strokeStyle = "#2f6bbf"; g.lineWidth = 34; g.lineCap = "round"; g.beginPath(); g.moveTo(IW / 2 - 10, 200); g.bezierCurveTo(200, 360, 210, 560, 300, 640); g.moveTo(IW / 2 + 10, 200); g.bezierCurveTo(610, 360, 600, 560, 510, 640); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(170, 620, 470, 640, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    g.fillStyle = "#2f6bbf"; g.beginPath(); g.roundRect(170, 620, 470, 120, [30, 30, 0, 0]); g.fill();
    g.fillStyle = "#ffffff"; g.font = F(40); g.textAlign = "center"; g.fillText("CITY HOSPITAL", IW / 2, 696);
    // her photo: the bun, a smile
    g.fillStyle = "#e7eef6"; g.fillRect(300, 770, 210, 230); g.fillStyle = "#5a3a2a"; g.beginPath(); g.arc(405, 835, 44, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(405, 880, 62, Math.PI, 0); g.fill();
    g.fillStyle = "#e8b896"; g.beginPath(); g.ellipse(405, 895, 54, 60, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
    g.beginPath(); g.arc(405, 912, 24, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); g.fillStyle = INK; for (const s of [-1, 1]) { g.beginPath(); g.arc(405 + s * 20, 885, 6, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#d98a5a"; g.fillRect(330, 955, 150, 45);
    g.fillStyle = "#1b1f2a"; g.font = F(46); g.fillText("NURSE", IW / 2, 1070);
    g.fillStyle = "#c0392b"; g.font = F(50); g.fillText("NIGHT SHIFT", IW / 2, 1145); g.fillStyle = "#1b1f2a"; g.font = F(44); g.fillText("9 PM – 9 AM", IW / 2, 1210);
    vig(g, 0.45);
  } },
  // the oven clock: 07:42 in green LED digits, the knobs below
  oven: { n: 1, draw: (g) => {
    g.fillStyle = "#e8e6e0"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#d4d1c9"; g.fillRect(0, 0, IW, 110);
    g.fillStyle = "#2a2c33"; g.beginPath(); g.ellipse(250, 40, 260, 70, 0, 0, Math.PI); g.fill();                      // the pan's edge above
    g.fillStyle = "#14161c"; g.beginPath(); g.roundRect(110, 470, IW - 220, 330, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    g.fillStyle = "#4dff8a"; g.shadowColor = "#4dff8a"; g.shadowBlur = 40; g.font = "bold 230px 'DejaVu Sans Mono', monospace"; g.textAlign = "center"; g.fillText("07:42", IW / 2, 720); g.shadowBlur = 0;
    for (const x of [170, 330, 490, 650]) { g.fillStyle = "#3a3d47"; g.beginPath(); g.arc(x, 1030, 62, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); g.fillStyle = "#e8e6e0"; g.fillRect(x - 8, 975, 16, 50); }
    g.fillStyle = "#2a2c33"; g.fillRect(0, 1200, IW, 20);
    vig(g, 0.45);
  } },
  // Mum's phone on the counter by the stove, nobody near it: dark; then lit, typing; then sent: the thread is the
  // texts you've been getting, sent from this phone
  mumPhone: { n: 3, draw: (g, st) => {
    g.fillStyle = "#e9e2d4"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#d7cfbf"; for (let y = 0; y < IH; y += 160) g.fillRect(0, y, IW, 4);
    g.fillStyle = "#e8e6e0"; g.fillRect(0, 0, 150, IH); g.fillStyle = "#3a3d47"; g.beginPath(); g.ellipse(40, 300, 110, 110, 0, 0, Math.PI * 2); g.fill();      // the stove beside it, a burner
    g.fillStyle = "#e86a96"; g.beginPath(); g.roundRect(190, 150, IW - 290, 1140, 64); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    if (!st) { g.fillStyle = "#07080c"; g.beginPath(); g.roundRect(215, 175, IW - 340, 1090, 44); g.fill(); g.fillStyle = "rgba(255,255,255,0.08)"; g.beginPath(); g.moveTo(260, 175); g.lineTo(420, 175); g.lineTo(260, 600); g.closePath(); g.fill(); }
    else thread(g, 215, 175, IW - 340, 1090, "To: BUG", st === 1 ? [["Don't eat it. I'm still at work.", true], ["Rule three. Get to the front door. Walk. Don't run.", true]] : [["Don't eat it. I'm still at work.", true], ["Rule three. Get to the front door. Walk. Don't run.", true], ["Open the door. Now.", true]], { font: 40, typing: st === 1, sent: st === 2 ? "Delivered" : undefined });
    if (st) { g.fillStyle = "rgba(160,190,255,0.12)"; g.fillRect(0, 0, IW, IH); }
    vig(g, 0.5);
  } },
};
const insertRig = (a: At, v = "text1"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.text1, texAt = (st: number) => stex(`bfIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(Math.max(0, Math.min(ins.n - 1, Math.ceil(step - 1e-3)))); } };
};

// ---------------------------------------------------------------- the vote panels
const CW = 1024, CH = 300;
const choiceTex = (v: string) => stex(`bfChoice_${v}`, CW, CH, (g) => {
  const c = v === "a" ? WARM : COOL, label = v === "a" ? "THE STOVE" : "THE DOOR";
  g.clearRect(0, 0, CW, CH); g.fillStyle = "rgba(14,10,20,0.88)"; g.beginPath(); g.roundRect(14, 14, CW - 28, CH - 28, 44); g.fill();
  g.strokeStyle = c; g.lineWidth = 12; g.shadowColor = c; g.shadowBlur = 40; g.stroke(); g.shadowBlur = 0;
  g.fillStyle = c; g.beginPath(); g.arc(150, CH / 2, 96, 0, Math.PI * 2); g.fill(); g.fillStyle = "#140e18"; g.font = F(130); g.textAlign = "center"; g.fillText(v.toUpperCase(), 150, CH / 2 + 46);
  g.fillStyle = "#ffffff"; g.font = F(112); g.textAlign = "left"; g.fillText(label, 280, CH / 2 + 40);
});
const choiceRig = (a: At, v = "a"): PropRig => {
  const root = rigRoot(a), w = 1.0, h = w * CH / CW;
  const mat = new THREE.MeshBasicMaterial({ map: choiceTex(v), transparent: true, toneMapped: false, depthWrite: false, depthTest: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.renderOrder = 12; m.layers.set(NOINK); root.add(m);
  // a solid backing on the inked layer, so no outline is drawn across the panel's text (Stop Time's lesson)
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.86), new THREE.MeshBasicMaterial({ color: "#0e0a14", toneMapped: false }));
  backing.position.z = -0.004; m.add(backing);
  return { root, update: ({ step = 0, camPos }) => {
    const k = Math.max(0, Math.min(1, step / 0.35)), back = 1 + 0.18 * Math.sin(k * Math.PI);
    m.visible = k > 0.001; m.scale.setScalar(Math.max(0.001, k * back)); mat.opacity = k; m.lookAt(camPos);
  } };
};

// ---------------------------------------------------------------- hand item
/** a frying pan with a golden pancake, held out by its handle */
const panItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.stroke([[x, y], [x + 16 * u * s, y - 4 * u]], 3.2 * u, "#1a1b20");
  p.ell(x + 30 * u * s, y - 6 * u, 16 * u, 5.5 * u, "#2a2c33", 2.2 * u);
  p.ell(x + 30 * u * s, y - 8 * u, 11 * u, 3.4 * u, "#d99a48", 1.4 * u);
};

// ---------------------------------------------------------------- characters
const MUM: Look = { name: "Mum", build: "adult", skin: "#e8b896", seed: 931, hair: { style: "bun", color: "#5a3a2a" }, lashes: true, blush: "#f0a090",
  top: { style: "sweater", color: "#d98a5a" }, layer: { style: "apron", color: "#f3eee2" }, legs: "#3a3f55", shoes: "#d8d2c8" };
const BUG: Look = { name: "Bug", build: "kid", skin: "#e8b896", seed: 932, hair: { style: "short", color: "#5a3a2a" }, top: { style: "hoodie", color: "#c8382e", accent: "#1e1c22" }, legs: "#2a2e40", shoes: "#f0f0f0" };
const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["home", "mystery", "horror"], tags });

export const BREAKFAST_THEME: Theme = {
  id: "breakfast", name: "Don't Eat It (a school-morning kitchen, two Mums)",
  desc: "an everyday POV mystery: the family kitchen at 7:42 a.m. with an open arch onto the hallway and the front door, the pan on the stove, two phones, the front door's frosted glass with a silhouette behind it, close inserts of the texts",
  tags: ["home", "kitchen", "breakfast", "mystery", "horror", "phone", "door"],
  mood: "drone",
  ambience: { bfKitchen: "elb_kitchen_day" },
  characters: { mum: MUM, bug: BUG },
  characterMeta: {
    mum: meta("Mum", "a warm mum in her thirties: brown hair in a bun, an orange sweater under a cream apron", "makes Bug pancakes; works nights as a nurse", ["adult", "woman", "mother"]),
    bug: meta("Bug", "a kid of about eleven: short brown hair, a red hoodie", "the 'you' of the story; Mum calls them Bug", ["child", "pov"]),
  },
  items: {
    fryPan: { name: "Frying pan", desc: "a frying pan with a golden pancake in it, held by the handle", themes: ["home", "kitchen"], tags: ["pan", "pancake", "cooking", "breakfast"], draw: panItem },
  },
  props: {
    bfPan: { name: "Pan on the stove", desc: "a frying pan on a burner with a pancake in it; each step flips the pancake (it rises, turns over and lands). `at` = the burner (y 0.9 on the kitchen stove)", category: "theme", themes: ["home", "kitchen"], tags: ["pan", "pancake", "stove", "cooking"], radius: 0.15, height: 0.4,
      build: () => undefined, rig: (a) => panRig(a), steps: ["flips the pancake"], stepCount: () => 50 },
    bfPhone: { name: "Phone lying flat", desc: "a phone lying flat, screen up; its screen lights (a notification) on its first step. Variants yours (yellow case) / mum (pink case)", category: "theme", themes: ["modern", "home"], tags: ["phone", "text", "screen"], radius: 0.09, height: 0.01,
      build: () => undefined, rig: (a, v) => phoneRig(a, v ?? "yours"), steps: ["lights up"], stepCount: () => 1, variants: { yours: () => undefined, mum: () => undefined } },
    bfPlate: { name: "Plate of pancakes", desc: "three pancakes on a plate with butter and syrup, a fork beside it (on a table top: y 0.78)", category: "theme", themes: ["home", "kitchen"], tags: ["food", "breakfast", "pancakes", "plate"], radius: 0.18, height: 0.08,
      build: () => undefined, rig: (a) => plateRig(a), steps: [], stepCount: () => 1 },
    bfFrontDoor: { name: "Front door (frosted glass)", desc: "the front door's leaf for the bfKitchen hallway frame (`at` = [0.95, 0, -4.47]), facing +z: deep green, a frosted glass panel lit by daylight. Variant shadow: a dark head-and-shoulders silhouette behind the glass. Each step is a knock: the leaf jolts", category: "theme", themes: ["home", "horror"], tags: ["door", "front door", "knock", "silhouette"], radius: 0.45, height: 2.05,
      build: () => undefined, rig: (a, v) => frontDoorRig(a, v ?? "empty"), steps: ["a knock"], stepCount: () => 50, variants: { empty: () => undefined, shadow: () => undefined } },
    bfInsert: { name: "Close insert (Don't Eat It)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step. Variants: text1 (your phone: MUM: Don't eat it. I'm still at work.), rules (the phone in your lap under the table: rule one, two, three), badge (Mum's hospital lanyard on its hook: NURSE, NIGHT SHIFT 9 PM - 9 AM), oven (the oven clock 07:42), mumPhone (Mum's pink phone on the counter: dark; lit, typing; sent: Open the door. Now. Delivered)", category: "theme", themes: ["home", "insert"], tags: ["insert", "card", "close-up", "phone", "text"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "text1"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
    bfChoice: { name: "Vote panels (Don't Eat It)", desc: "the end-card vote over the last frame: a glowing panel turned to the camera, popping in on its first step (hidden before it). Variants: a (A · THE STOVE, warm orange), b (B · THE DOOR, cool blue); 1.0 m wide. Drawn over everything", category: "theme", themes: ["home", "vote"], tags: ["choice", "vote", "end card", "panel"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => choiceRig(a, v ?? "a"), steps: ["pops in"], stepCount: () => 1, variants: { a: () => undefined, b: () => undefined } },
  },
  sets: {
    bfKitchen: { id: "bfKitchen", title: "The kitchen at 7:42: the stove, the table, the open arch onto the hallway and the front door", lights: ["interior", "interiorCool"], build: () => bfKitchen() },
  },
  layouts: { bfKitchen: { spots: KITCHEN_SPOTS, views: KITCHEN_VIEWS } },
  setMeta: {
    bfKitchen: { name: "The kitchen (Don't Eat It)", desc: "4.6 x 3.8 m, open toward +z, back wall z -1.9: a counter under the window (x -1.75), the stove (x -0.75, burners at y 0.9), a short counter (x -0.07) where Mum's phone lies, the open arch (x 0.95, 1.0 m wide) onto the hallway that runs back to the front door (z -4.5; add bfFrontDoor at [0.95, 0, -4.47]), the fridge (x 1.9). The table in the middle (top y 0.78, x -0.7..0.7, z 0.15..0.95), Bug's chair on its near side. Spots stove, serve, block, arch, bugSeat (sit), bugStand, hall, hallDoor", themes: ["home", "everyday"], tags: ["kitchen", "breakfast", "hallway", "front door", "table"] },
  },
};
