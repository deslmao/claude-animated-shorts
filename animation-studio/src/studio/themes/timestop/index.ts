// "What If… You Could Stop Time?" theme (productions/what-if-time, part1-script.md approved): an original cyberpunk
// love story in Vantage City, 2081. The rich live in the gold Towers above the smog; everyone else lives below in the
// Lowline: rain, neon, cables, holo-ads.
// Reused from the base library: kit primitives, buildRoom, the night / interiorCool light presets; the Ollie theme's
// rain prop (falling rain around the camera; with no steps it hangs still: frozen time).
// New here (additions only):
//   sets lowline (the neon street at night, the Towers above the smog at its end), lowRoof (a rooftop above the neon, a
//     ledge to sit on, the city and the Towers behind), theoFlat (a tiny flat, a neon-lit window), towerVault (the
//     Tower vault: steel, a round vault door, the console)
//   props timeTint (stopped time: a cold blue veil held in front of the lens, wherever the camera moves), bullet (a
//     bullet frozen in mid-air with its trail), van (the crew's van), tsInsert (9:16 close insert cards, a state per step)
//   characters theo, sol, tsMum, dex, towerGuard, lowA-C (Lowline extras)
// Part 1 v2 ("The Knock", part1-v2-viewer-script.md) adds: sets flatDoor (the flat's front door from inside, open onto
//   the corridor), lockerRoom (Mum's clinic locker room), backClinic (the back-alley clinic); characters tsOfficer (a
//   Vantage police officer, cap in hand), tsTeacher, tsDoc, lowD-E; items tsPistol, tsCap; timeTint variant "behind"
//   (the veil hangs at `at`: what stands nearer the lens, Theo, stays in full colour); inserts note, fist, photo; the
//   choice panels (tsChoice: a question, options A and B with their consequences, a footer; each pops in on its step)
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import type { Pen } from "../../characters/toon";
import { Batch, quadUp } from "../../materials/geo";
import { buildRoom } from "../../sets/room";
import { At, col, tex, glow, box, rbox, cyl, sph } from "../../props/kit";
import { floorMat } from "../../props/interior";
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
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; stable.set(key, t); return t;
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const rnd = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const INK = "#14121c", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const CYAN = "#4ef0ff", MAGENTA = "#ff3fb4", AMBER = "#ffb84e", VIOLET = "#9a6bff", GOLD = "#f4d38a";
const NEONS = [CYAN, MAGENTA, AMBER, VIOLET];

// ---------------------------------------------------------------- textures
/** a tall dark facade: a grid of small windows, some lit in neon colours */
const facadeTex = (seed: number) => stex(`tsFac_${seed}`, 256, 512, (g) => {
  const r = rnd(seed); g.fillStyle = ["#171a28", "#1c1f2e", "#141725", "#1f1a2c"][seed % 4]; g.fillRect(0, 0, 256, 512);
  for (let y = 10; y < 512; y += 22) for (let x = 8; x < 256; x += 24) {
    const v = r(); g.fillStyle = v > 0.8 ? NEONS[Math.floor(r() * 4)] : v > 0.55 ? "#3a3550" : "#0d0f18"; g.globalAlpha = v > 0.8 ? 0.75 : 1; g.fillRect(x, y, 14, 12);
  }
  g.globalAlpha = 1; g.fillStyle = "rgba(0,0,0,0.25)"; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 4, 512);
});
const signTex = (text: string, c: string) => stex(`tsSign_${text}_${c}`, 128, 512, (g) => {
  g.fillStyle = "rgba(8,8,16,0.92)"; g.fillRect(0, 0, 128, 512); g.strokeStyle = c; g.lineWidth = 8; g.strokeRect(6, 6, 116, 500);
  g.fillStyle = c; g.font = F(64); g.textAlign = "center"; g.shadowColor = c; g.shadowBlur = 24;
  [...text].forEach((ch, i) => g.fillText(ch, 64, 90 + i * 84));
});
const holoTex = (key: string, title: string, sub: string, c: string) => stex(`tsHolo_${key}`, 512, 288, (g) => {
  const gr = g.createLinearGradient(0, 0, 512, 288); gr.addColorStop(0, c); gr.addColorStop(1, "rgba(20,10,40,0.6)"); g.fillStyle = gr; g.globalAlpha = 0.55; g.fillRect(0, 0, 512, 288); g.globalAlpha = 1;
  g.fillStyle = "rgba(255,255,255,0.12)"; for (let y = 0; y < 288; y += 6) g.fillRect(0, y, 512, 2);
  g.fillStyle = "#ffffff"; g.font = F(70); g.textAlign = "center"; g.fillText(title, 256, 150); g.font = F(28); g.fillText(sub, 256, 210);
});
const roadTex = () => stex("tsRoad", 256, 256, (g) => { g.fillStyle = "#101219"; g.fillRect(0, 0, 256, 256); const r = rnd(3); for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(120,140,200,${r() * 0.06})`; g.fillRect(r() * 256, r() * 256, 3, 3); } });
const roofTex = () => stex("tsRoof", 256, 256, (g) => { g.fillStyle = "#2a2d38"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; for (let x = 0; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(256, x); g.stroke(); } });
const steelTex = () => stex("tsSteel", 256, 256, (g) => { g.fillStyle = "#aab2bd"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(60,70,85,0.25)"; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 3, 256); for (let y = 0; y < 256; y += 128) g.fillRect(0, y, 256, 3); });
const flatWallTex = () => stex("tsFlat", 256, 256, (g) => { g.fillStyle = "#2b3442"; g.fillRect(0, 0, 256, 256); const r = rnd(5); g.fillStyle = "rgba(10,14,22,0.35)"; for (let i = 0; i < 26; i++) g.fillRect(r() * 256, r() * 256, 4 + r() * 20, 30 + r() * 80); });

// ---------------------------------------------------------------- the Towers above the smog (shared backdrop)
const towers = (b: Batch, I: THREE.Matrix4, z0: number, spread: number) => {
  const r = rnd(41), lit = glow("tsTowerLit", () => ({ color: GOLD })), body = col("#cfc7a8");
  for (let i = 0; i < 9; i++) {
    const x = -spread + i * (spread * 2 / 8) + (r() - 0.5) * 6, z = z0 - r() * 30, h = 90 + r() * 70, w = 8 + r() * 6;
    box(b, body, I, x - w / 2, x + w / 2, 0, h, z - w / 2, z + w / 2);
    for (let y = 46; y < h - 2; y += 5) if (r() > 0.25) box(b, lit, I, x - w * 0.4, x + w * 0.4, y, y + 2, z + w / 2 + 0.02, z + w / 2 + 0.05);
    sph(b, glow("tsTowerTop", () => ({ color: "#fff3cf" })), I, x, h, z, w * 0.4, w * 0.25, w * 0.4, 14);
  }
  // the smog layer the Towers rise out of
  b.add(new THREE.PlaneGeometry(600, 400).rotateX(-Math.PI / 2), glow("tsSmog", () => ({ color: "#5a4636", transparent: true, opacity: 0.55, depthWrite: false })), new THREE.Matrix4().makeTranslation(0, 40, z0 + 60));
};

// ---------------------------------------------------------------- set: the Lowline street (night)
// The road runs along z (x -4..4) from z -46 to the camera side (z +16); pavements x +-4..+-6; tall dark buildings on
// both sides with fronts at x +-6 (5 m per building); vertical neon signs on the fronts; holo-ads over the street;
// cables overhead; the Towers rise far beyond the end of the street (z -120), above the smog.
const LOW_SPOTS: Record<string, V3> = { mid: [0, 0, 0], near: [0.5, 0, 4], far: [0, 0, -12], curbL: [-3.6, 0, -2], curbR: [3.6, 0, -2], van: [3.0, 0, -6], wall: [-5.6, 0, -1.0] };
const LOW_VIEWS: View[] = [{ name: "street", pos: [1.2, 1.7, 10], look: [0, 6, -40], fov: 52, establishing: true }];
const lowline = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  b.add(quadUp(-4, 4, -46, 16, 2, 14, 0.0), tex("tsRoad", roadTex, 1, 1));
  for (const s of [-1, 1]) b.add(quadUp(s < 0 ? -6 : 4, s < 0 ? -4 : 6, -46, 16, 1, 14, 0.12), col("#22252f"));
  let k = 0;
  for (const s of [-1, 1]) for (let z = -46; z < 16; z += 5, k++) {
    const h = 16 + ((k * 7) % 6) * 3.2, x0 = s < 0 ? -16 : 6, x1 = s < 0 ? -6 : 16;
    // neighbouring blocks stop 1 cm short of each other, and the awnings stand 2 cm proud of the fronts, so no two
    // surfaces of different materials share a plane (z-fighting)
    box(b, tex(`tsFac_${k % 6}`, () => facadeTex(k % 6), 2, 3), I, x0, x1, 0, h, z + 0.01, z + 4.99);
    box(b, col("#2a2e3c"), I, (s < 0 ? -6.3 : 6.02), (s < 0 ? -6.02 : 6.3), 3.2, 3.4, z + 0.02, z + 4.98);            // shop awnings
    if (k % 2 === 0) {                                                                                                 // a vertical neon sign
      const words = ["RAMEN", "CLINIC", "BAR", "HOTEL", "REPAIR", "NOODLE", "DREAMS", "ARCADE"], c = NEONS[k % 4], w = words[k % words.length];
      b.add(new THREE.PlaneGeometry(1.0, 4.0), new THREE.MeshBasicMaterial({ map: signTex(w, c), toneMapped: false, side: THREE.DoubleSide }), new THREE.Matrix4().makeTranslation(s * 6.6, 6.5, z + 2.5).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
      box(b, glow(`tsGlowStrip${k % 4}`, () => ({ color: c })), I, s * 6.0 - 0.02, s * 6.0 + 0.02, 3.4, 3.48, z + 0.2, z + 4.8); // a neon strip under the awning
    }
  }
  // holo-ads over the street, cables, puddles of neon
  for (const [x, y, z, w, t, sub, c] of [[-2.2, 9, -10, 6, "VANTAGE", "LIVE ABOVE IT ALL", MAGENTA], [2.4, 12, -24, 7, "TOWERS", "NOW LEASING · LEVEL 90+", CYAN], [-1.8, 8.5, -34, 5, "NEON NOODLE", "OPEN ALL NIGHT", AMBER]] as const)
    b.add(new THREE.PlaneGeometry(w, w * 0.5625), new THREE.MeshBasicMaterial({ map: holoTex(t, t, sub, c), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }), new THREE.Matrix4().makeTranslation(x, y, z));
  for (let i = 0; i < 9; i++) { const z = -40 + i * 6.5, y = 7 + (i % 3) * 1.8; box(b, col("#0a0b10"), I, -6, 6, y, y + 0.04, z, z + 0.04); }
  for (const [x, z, w, d, c] of [[-1.4, 2.2, 1.8, 0.9, MAGENTA], [1.9, -3.5, 1.4, 0.8, CYAN], [-0.6, -11, 2.2, 1.0, AMBER], [2.0, 7, 1.5, 0.7, VIOLET]] as const)
    b.add(quadUp(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 1, 1, 0.012), glow(`tsPuddle${c}`, () => ({ color: c, transparent: true, opacity: 0.35 })));
  towers(b, I, -130, 60);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: LOW_SPOTS, views: LOW_VIEWS };
};

// ---------------------------------------------------------------- set: the rooftop (night)
// A flat roof x -6..6, z -6..6 above the neon, a 0.5 m parapet round it. The ledge to sit on: along the back parapet
// at z -5.6 (spots ledgeL / ledgeR, mode sit, facing the camera, the city behind them). A water tank, an antenna, AC
// units. Around and below: the tops of the Lowline's buildings, lit; the Towers beyond.
const ROOF_SPOTS: Record<string, V3> = { ledgeL: [-0.45, 0.55, -5.5], ledgeR: [0.45, 0.55, -5.5], mid: [0, 0, -2], door: [3.5, 0, 2] };
const ROOF_VIEWS: View[] = [{ name: "roof", pos: [0.4, 1.4, 2.6], look: [0, 1.0, -5.5], fov: 50, establishing: true }];
const lowRoof = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  b.add(quadUp(-6, 6, -6, 6, 2, 2, 0.0), tex("tsRoof", roofTex, 1, 1));
  const par = col("#3a3e4c");
  box(b, par, I, -6, 6, 0, 0.55, -6, -5.75); box(b, par, I, -6, -5.75, 0, 0.55, -6, 6); box(b, par, I, 5.75, 6, 0, 0.55, -6, 6);
  cyl(b, col("#4a4f5c"), I, 4.2, 0, -3.5, 0.9, 0.9, 2.2, 18); cyl(b, col("#3a3e4c"), I, -4.6, 0, 1.0, 0.04, 0.04, 6.0, 8);
  sph(b, glow("tsAntenna", () => ({ color: "#ff3b30" })), I, -4.6, 6.05, 1.0, 0.08, 0.08, 0.08, 10);
  for (const [x, z] of [[-3, 3], [2.4, 3.8]] as const) rbox(b, col("#4a4f5c"), I, x, 0, z, 1.2, 0.9, 0.9, 0.03);
  // the city below and around: building tops with lit windows, neon glow rising from the streets
  const r = rnd(17);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2, d = 18 + r() * 30, x = Math.sin(a) * d, z = -Math.cos(a) * d - 8, h = -10 + r() * 14, w = 6 + r() * 6;
    if (z > 4) continue;
    box(b, tex(`tsFac_${i % 6}`, () => facadeTex(i % 6), 1, 2), I, x - w / 2, x + w / 2, -30, h, z - w / 2, z + w / 2);
  }
  b.add(new THREE.PlaneGeometry(200, 200).rotateX(-Math.PI / 2), glow("tsCityGlow", () => ({ color: "#4a2a6a" })), new THREE.Matrix4().makeTranslation(0, -12, -40));
  towers(b, I, -140, 80);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: ROOF_SPOTS, views: ROOF_VIEWS };
};

// ---------------------------------------------------------------- set: Theo's flat (night)
// 3.4 x 3 m, open toward +z: dark teal walls, a window in the back wall glowing magenta with the sign outside, a bed on
// the left, a small table, the door in the right wall (spot door), Mum's red medic jacket on a hook by the door.
const FLAT_SPOTS: Record<string, V3> = { door: [1.2, 0, 0.6], bed: [-1.0, 0.45, -0.6], floor: [0, 0, 0.5], table: [0.4, 0, -0.6], stool: [0.45, 0.45, -1.28] };
const FLAT_VIEWS: View[] = [{ name: "flat", pos: [0.2, 1.5, 2.6], look: [0.2, 1.1, -0.6], fov: 50, establishing: true }];
const theoFlat = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.4, d: 3.0, h: 2.4, floor: floorMat(), wall: tex("tsFlat", flatWallTex, 3, 2), trim: "#1a1f2a", openings: [{ wall: "back", at: 0.2, w: 1.0, h: 1.1, sill: 1.0, view: "city" }] });
  box(b, glow("tsFlatPane", () => ({ color: "#8a2a7a" })), I, -0.3, 0.7, 1.0, 2.1, -1.47, -1.46);
  rbox(b, col("#3a3f4c"), I, -1.05, 0, -0.7, 1.1, 0.45, 1.5, 0.04); rbox(b, col("#5a4a6a"), I, -1.05, 0.45, -0.6, 1.05, 0.1, 1.3, 0.05);
  rbox(b, col("#4a3a2c"), I, 0.45, 0, -0.85, 0.8, 0.74, 0.5, 0.02);
  rbox(b, col("#3a3040"), I, 0.45, 0, -1.28, 0.36, 0.45, 0.3, 0.03);                                              // a stool behind the table (spot stool)
  cyl(b, col("#e8e4dc"), I, 0.3, 0.74, -0.8, 0.12, 0.12, 0.02, 18); cyl(b, col("#c9a24e"), I, 0.3, 0.76, -0.8, 0.08, 0.08, 0.02, 14);   // a plate of food, untouched
  box(b, col("#2a2e38"), I, 1.655, 1.69, 0.03, 2.02, 0.2, 1.0);
  rbox(b, col("#c0392b"), I, 1.6, 1.0, 1.15, 0.12, 0.8, 0.45, 0.04); box(b, col("#ffffff"), I, 1.53, 1.54, 1.45, 1.55, 1.0, 1.3);   // Mum's medic jacket, a white cross
  sph(b, glow("tsFlatBulb", () => ({ color: "#d6c9ff" })), I, 0, 2.25, -0.2, 0.06, 0.08, 0.06, 10);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: FLAT_SPOTS, views: FLAT_VIEWS };
};

// ---------------------------------------------------------------- set: the Tower vault
// 7 x 5 m, open toward +z: brushed steel, cold white light, a round vault door in the back wall, the console in front
// of it (spot console), the entry doors in the right wall (spot doors); data columns glowing cyan.
const VAULT_SPOTS: Record<string, V3> = { console: [0, 0, -1.1], theo: [-1.3, 0, -0.4], doors: [2.8, 0, 0.2], guard1: [1.6, 0, -0.6], guard2: [2.4, 0, 0.6], guard3: [1.2, 0, 1.0] };
const VAULT_VIEWS: View[] = [{ name: "vault", pos: [0.0, 1.6, 4.2], look: [0, 1.2, -1.2], fov: 52, establishing: true }];
const towerVault = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 7, d: 5, h: 3.4, floor: col("#7d858f"), wall: tex("tsSteel", steelTex, 4, 2), trim: "#5a626c" });
  cyl(b, col("#8a929c"), I, 0, 1.6, -2.49, 1.3, 1.3, 0.12, 40, Math.PI / 2); cyl(b, col("#5a626c"), I, 0, 1.6, -2.43, 0.35, 0.35, 0.1, 24, Math.PI / 2);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; box(b, col("#4a525c"), I, Math.cos(a) * 0.9 - 0.06, Math.cos(a) * 0.9 + 0.06, 1.6 + Math.sin(a) * 0.9 - 0.06, 1.6 + Math.sin(a) * 0.9 + 0.06, -2.44, -2.36); }
  rbox(b, col("#3a3f4a"), I, 0, 0, -1.3, 1.6, 0.9, 0.6, 0.03); box(b, glow("tsConsole", () => ({ color: CYAN })), I, -0.7, 0.7, 0.92, 1.3, -1.45, -1.42);
  for (const x of [-3.0, -2.2, 2.2, 3.0]) { box(b, col("#2a2e38"), I, x - 0.25, x + 0.25, 0, 3.0, -2.3, -1.9); box(b, glow("tsDataCol", () => ({ color: CYAN })), I, x - 0.2, x + 0.2, 0.3, 2.7, -1.899, -1.895); }
  box(b, col("#5a626c"), I, 3.47, 3.5, 0, 2.6, -0.6, 1.0);
  sph(b, glow("tsVaultLight", () => ({ color: "#ffffff" })), I, 0, 3.3, 0, 1.2, 0.05, 0.4, 16);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: VAULT_SPOTS, views: VAULT_VIEWS };
};

// ---------------------------------------------------------------- set: the flat's front door, from inside (Part 1 v2)
// The room x -1.5..1.5, z -1.5..1.5; the back wall (z -1.5) has the front doorway (x -0.45..0.45, 2.05 m), its door
// swung open into the room on the right; beyond it, the building's corridor (x -0.9..0.9, z -1.6..-3.6) under a cold
// strip light. Mum's red coat hangs on a hook left of the door. Spots: inDoor (in the doorway), hall (in the corridor,
// facing the room), floorDoor (sitting on the floor against the wall, left of the door), coat (the coat on its hook).
const DOOR_SPOTS: Record<string, V3> = { inDoor: [0, 0, -1.0], hall: [0, 0, -2.25], floorDoor: [-0.8, 0, -1.2], coat: [-1.05, 1.4, -1.4], room: [0.4, 0, 0.2] };
const DOOR_VIEWS: View[] = [{ name: "door", pos: [0.9, 1.5, 1.6], look: [0, 1.3, -1.8], fov: 50, establishing: true }];
const flatDoor = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4(), wall = tex("tsFlat", flatWallTex, 1, 1), hallWall = col("#4a5560"), ceil = col("#1e232c");
  b.add(quadUp(-1.5, 1.5, -1.5, 1.5, 3, 3, 0.0), floorMat());
  b.add(quadUp(-0.9, 0.9, -3.6, -1.62, 2, 2, 0.0), col("#3a3f48"));
  box(b, col("#2a2e36"), I, -0.45, 0.45, 0, 0.02, -1.6, -1.5);                                                      // the threshold
  box(b, wall, I, -1.5, -0.45, 0, 2.4, -1.6, -1.5); box(b, wall, I, 0.45, 1.5, 0, 2.4, -1.6, -1.5); box(b, wall, I, -0.45, 0.45, 2.05, 2.4, -1.6, -1.5);
  box(b, wall, I, -1.6, -1.5, 0, 2.4, -1.5, 1.5); box(b, wall, I, 1.5, 1.6, 0, 2.4, -1.5, 1.5);
  box(b, ceil, I, -1.6, 1.6, 2.4, 2.45, -1.6, 1.5);
  for (const [x0, x1] of [[-0.53, -0.45], [0.45, 0.53]] as const) box(b, col("#1a1f2a"), I, x0, x1, 0, 2.13, -1.49, -1.46);   // the door frame
  box(b, col("#1a1f2a"), I, -0.53, 0.53, 2.05, 2.13, -1.49, -1.46);
  box(b, col("#3a3240"), I, 0.47, 0.51, 0.01, 2.03, -1.44, -0.58); box(b, col("#c9a24e"), I, 0.51, 0.54, 0.98, 1.04, -0.75, -0.69);   // the door, open, its handle
  box(b, hallWall, I, -1.0, -0.9, 0, 2.4, -3.6, -1.62); box(b, hallWall, I, 0.9, 1.0, 0, 2.4, -3.6, -1.62); box(b, hallWall, I, -1.0, 1.0, 0, 2.4, -3.7, -3.6);
  box(b, ceil, I, -1.0, 1.0, 2.46, 2.5, -3.6, -1.62);
  box(b, glow("tsHallStrip", () => ({ color: "#cfe3ff" })), I, -0.08, 0.08, 2.4, 2.43, -3.1, -2.0);                 // the corridor's strip light
  box(b, col("#c0392b"), I, -1.25, -0.9, 0.95, 1.75, -1.49, -1.36); box(b, col("#ffffff"), I, -1.12, -1.03, 1.3, 1.5, -1.355, -1.35);   // Mum's coat on its hook, a white cross
  box(b, col("#ffffff"), I, -1.155, -0.995, 1.36, 1.44, -1.355, -1.35);
  box(b, col("#2a2e38"), I, -1.1, -1.05, 1.75, 1.8, -1.49, -1.42);                                                 // the hook
  sph(b, glow("tsFlatBulb", () => ({ color: "#d6c9ff" })), I, 0.3, 2.3, 0.2, 0.06, 0.08, 0.06, 10);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: DOOR_SPOTS, views: DOOR_VIEWS };
};

// ---------------------------------------------------------------- set: Mum's clinic locker room (Part 1 v2)
// 4 x 3 m, open toward +z: pale green walls, a row of seven grey-blue lockers along the back wall (z -1.5), the middle
// one standing open with her spare medic coat inside; a bench; a cold strip light. Spots: theo (facing the open
// locker, back to the camera), locker (inside the open locker, 1.2 m up), bench.
const LOCKER_SPOTS: Record<string, V3> = { theo: [0.05, 0, -0.55], locker: [0, 1.2, -1.25], bench: [-1.0, 0.45, 0.2] };
const LOCKER_VIEWS: View[] = [{ name: "lockers", pos: [0.9, 1.5, 2.2], look: [0, 1.2, -1.2], fov: 50, establishing: true }];
const lockerRoom = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4(), steel = col("#5a7488"), dark = col("#1a1f26");
  buildRoom(root, { w: 4, d: 3, h: 2.6, floor: col("#7d8a86"), wall: col("#9fb5a8"), trim: "#5a6a64" });
  for (let i = 0; i < 7; i++) {
    const x0 = -1.6 + i * 0.46, x1 = x0 + 0.44;
    if (i !== 3) { box(b, steel, I, x0, x1, 0.02, 1.9, -1.48, -1.04); for (let k = 0; k < 3; k++) box(b, dark, I, x0 + 0.12, x1 - 0.12, 1.62 + k * 0.05, 1.64 + k * 0.05, -1.035, -1.03); continue; }
    // the open one: a carcass, her coat inside, the door swung open to the right
    box(b, steel, I, x0, x0 + 0.02, 0.02, 1.9, -1.48, -1.04); box(b, steel, I, x1 - 0.02, x1, 0.02, 1.9, -1.48, -1.04);
    box(b, steel, I, x0 + 0.02, x1 - 0.02, 1.88, 1.9, -1.48, -1.04); box(b, steel, I, x0 + 0.02, x1 - 0.02, 0.02, 0.06, -1.48, -1.04);
    box(b, dark, I, x0 + 0.02, x1 - 0.02, 0.06, 1.88, -1.48, -1.46);
    box(b, col("#c0392b"), I, x0 + 0.06, x1 - 0.06, 0.9, 1.7, -1.4, -1.25); box(b, col("#ffffff"), I, x0 + 0.17, x1 - 0.17, 1.28, 1.48, -1.249, -1.245);
    box(b, col("#16181f"), I, x0 + 0.08, x1 - 0.08, 0.06, 0.32, -1.4, -1.15);                                         // the black case
    box(b, steel, I, x1 + 0.01, x1 + 0.03, 0.03, 1.89, -1.03, -0.6);                                                  // its door, open
  }
  rbox(b, col("#6a4a32"), I, -0.2, 0.4, 0.15, 2.2, 0.05, 0.36, 0.02); for (const x of [-1.1, 0.7]) box(b, col("#3a3f48"), I, x - 0.03, x + 0.03, 0, 0.4, 0.1, 0.2);
  box(b, glow("tsLockerStrip", () => ({ color: "#e8f4ff" })), I, -1.2, 1.2, 2.54, 2.57, -0.3, -0.2);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: LOCKER_SPOTS, views: LOCKER_VIEWS };
};

// ---------------------------------------------------------------- set: the back-alley clinic (Part 1 v2)
// 3.6 x 3 m, open toward +z: grimy dark walls, a reclining chair (spot chair, mode sit), a tool tray, a lamp on an
// arm over the chair, a magenta CLINIC sign and cyan strips. Spots: chair, doc (standing beside it), door.
const CLINIC_SPOTS: Record<string, V3> = { chair: [-0.35, 0.5, -0.55], doc: [0.45, 0, -0.35], door: [1.3, 0, 0.8] };
const CLINIC_VIEWS: View[] = [{ name: "clinic", pos: [0.6, 1.5, 2.4], look: [0, 1.1, -0.6], fov: 50, establishing: true }];
const backClinic = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.6, d: 3.0, h: 2.5, floor: col("#2a2a30"), wall: tex("tsFlat", flatWallTex, 2, 2), trim: "#14161e" });
  rbox(b, col("#3a3f4c"), I, -0.35, 0, -0.55, 0.6, 0.42, 0.7, 0.04); rbox(b, col("#5a2a4a"), I, -0.35, 0.42, -0.55, 0.62, 0.1, 0.72, 0.04);
  rbox(b, col("#5a2a4a"), I, -0.35, 0.5, -0.95, 0.62, 0.75, 0.12, 0.04);                                             // the chair and its back
  rbox(b, col("#7a808c"), I, 0.85, 0, -0.9, 0.5, 0.85, 0.4, 0.02); rbox(b, col("#aab2bd"), I, 0.85, 0.85, -0.9, 0.55, 0.03, 0.42, 0.01);   // the tool tray
  for (let k = 0; k < 4; k++) box(b, col("#d8dde3"), I, 0.66 + k * 0.1, 0.69 + k * 0.1, 0.89, 0.91, -1.0, -0.82);
  cyl(b, col("#2a2e38"), I, 0.3, 0, -1.2, 0.03, 0.03, 2.1, 8); box(b, col("#2a2e38"), I, -0.4, 0.3, 2.07, 2.1, -1.22, -1.18);
  sph(b, glow("tsClinicLamp", () => ({ color: "#fff3cf" })), I, -0.35, 1.95, -1.2, 0.14, 0.08, 0.14, 14);
  b.add(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: holoTex("clinic", "CLINIC", "NO QUESTIONS", MAGENTA), transparent: true, toneMapped: false, depthWrite: false }), new THREE.Matrix4().makeTranslation(-0.9, 1.95, -1.45));
  box(b, glow("tsClinicStrip", () => ({ color: CYAN })), I, -1.78, -1.75, 0.2, 2.3, -1.4, -1.2); box(b, glow("tsClinicStrip2", () => ({ color: MAGENTA })), I, 1.75, 1.78, 0.2, 2.3, -1.4, -1.2);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: CLINIC_SPOTS, views: CLINIC_VIEWS };
};

// ---------------------------------------------------------------- the choice panels (Part 1 v2 end card)
// Glowing holo panels that hang in the frozen scene above Theo: the question, option A, option B and the footer.
// Each is a plane facing +z (turn with yaw) that pops in on its first step (scale and fade), hidden before it.
const CW = 1024;
const choiceTex = (v: string) => {
  const H = v === "q" || v === "foot" ? 256 : 700;
  return stex(`tsChoice_${v}`, CW, H, (g) => {
    const c = v === "a" ? "#ff4fa8" : v === "b" ? CYAN : "#ffffff";
    g.clearRect(0, 0, CW, H); g.fillStyle = "rgba(6,8,20,0.82)"; g.beginPath(); g.roundRect(14, 14, CW - 28, H - 28, 40); g.fill();
    g.strokeStyle = c; g.lineWidth = 10; g.shadowColor = c; g.shadowBlur = 40; g.stroke(); g.shadowBlur = 0; g.textAlign = "center";
    if (v === "q") { g.fillStyle = "#ffffff"; g.font = F(70); g.fillText("WHAT SHOULD HE DO?", CW / 2, 154); return; }
    if (v === "foot") { g.fillStyle = "#ffcf6a"; g.font = F(92); g.fillText("COMMENT  A  OR  B", CW / 2, 160); return; }
    // two short lines, large: the consequence of each choice must read on a phone
    const [title, l1, l2] = v === "a" ? ["SAVE HER", "One more life saved.", "It costs him days."] : ["LEAVE HER", "No trouble for him.", "But she dies."];
    g.fillStyle = c; g.beginPath(); g.arc(140, 160, 92, 0, Math.PI * 2); g.fill(); g.fillStyle = "#0a0c18"; g.font = F(124); g.fillText(v.toUpperCase(), 140, 204);
    g.fillStyle = "#ffffff"; g.font = F(108); g.textAlign = "left"; g.fillText(title, 260, 200); g.textAlign = "center";
    g.fillStyle = "#e6ebf5"; g.font = F(84); [l1, l2].forEach((s, i) => g.fillText(s, CW / 2, 420 + i * 130));
  });
};
const choiceRig = (a: At, v = "q"): PropRig => {
  const root = rigRoot(a), small = v === "q" || v === "foot", w = small ? 1.3 : 0.9, h = w * (small ? 256 : 700) / CW;
  const mat = new THREE.MeshBasicMaterial({ map: choiceTex(v), transparent: true, toneMapped: false, depthWrite: false, depthTest: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.renderOrder = 12; m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => {
    const k = Math.max(0, Math.min(1, step / 0.35)), back = 1 + 0.18 * Math.sin(k * Math.PI);    // a quick pop with a slight overshoot
    m.visible = k > 0.001; m.scale.setScalar(Math.max(0.001, k * back)); mat.opacity = k;
  } };
};

// ---------------------------------------------------------------- props
/** stopped time: a cold blue veil 0.5 m in front of the lens, square to it, wherever the camera moves */
const tintRig = (a: At, behind = false): PropRig => {
  const root = rigRoot(a), mat = new THREE.MeshBasicMaterial({ color: "#3a78ff", transparent: true, opacity: behind ? 0.42 : 0.28, depthTest: behind, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), mat); m.renderOrder = 9; m.layers.set(NOINK); root.add(m);
  // behind: the veil hangs at `at` itself, square to the lens and scaled to fill the frame there; it is depth-tested, so
  // whatever stands nearer the camera than `at` (Theo, moving through stopped time) keeps its full colour
  return { root, update: ({ camPos }) => {
    const v = root.position.clone().sub(camPos), dist = v.length();
    if (behind) { m.position.set(0, 0, 0); m.scale.setScalar(Math.max(1, dist / 0.5) * 1.2); m.lookAt(camPos); return; }
    m.position.copy(camPos).add(v.normalize().multiplyScalar(0.5)).sub(root.position); m.lookAt(camPos);
  } };
};
/** a bullet frozen in mid-air, its tip toward +x (rotate with yaw), a pale trail behind it */
const bulletRig = (a: At): PropRig => {
  const root = rigRoot(a);
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.06, 12).rotateZ(Math.PI / 2), new THREE.MeshLambertMaterial({ color: "#c9a14a" })); root.add(shell);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 8), new THREE.MeshLambertMaterial({ color: "#d9b25a" })); tip.position.x = 0.032; root.add(tip);
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.02), new THREE.MeshBasicMaterial({ color: "#e8f4ff", transparent: true, opacity: 0.45, toneMapped: false, depthWrite: false })); trail.position.x = -0.33; trail.layers.set(NOINK); root.add(trail);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.045, 24).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#e8f4ff", transparent: true, opacity: 0.5, toneMapped: false, side: THREE.DoubleSide })); ring.position.x = -0.05; ring.layers.set(NOINK); root.add(ring);
  // a soft glow round the bullet so it reads at a glance, even small in the frame
  const halo = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), new THREE.MeshBasicMaterial({ color: "#fff2c0", transparent: true, opacity: 0.28, toneMapped: false, depthWrite: false })); halo.layers.set(NOINK); root.add(halo);
  return { root, update: () => undefined };
};
const vanBuild = (b: Batch, a: At) => {
  const m = new THREE.Matrix4().makeTranslation(a.x, a.y ?? 0, a.z).multiply(new THREE.Matrix4().makeRotationY(a.yaw ?? 0));
  rbox(b, col("#3a3f52"), m, 0, 0.35, 0, 2.0, 1.9, 4.6, 0.18); rbox(b, glow("tsVanWin", () => ({ color: "#1a2a3a" })), m, 0, 1.4, 1.6, 1.9, 0.7, 1.0, 0.1);
  box(b, glow("tsVanStrip", () => ({ color: MAGENTA })), m, -1.01, -0.99, 1.0, 1.05, -2.2, 2.2); box(b, glow("tsVanStrip2", () => ({ color: MAGENTA })), m, 0.99, 1.01, 1.0, 1.05, -2.2, 2.2);
  for (const [x, z] of [[-0.95, 1.5], [0.95, 1.5], [-0.95, -1.5], [0.95, -1.5]] as const) cyl(b, col("#0e0f14"), new THREE.Matrix4().makeTranslation(a.x, a.y ?? 0, a.z).multiply(new THREE.Matrix4().makeRotationY(a.yaw ?? 0)).multiply(new THREE.Matrix4().makeTranslation(x, 0.35, z)).multiply(new THREE.Matrix4().makeRotationZ(Math.PI / 2)), 0, -0.12, 0, 0.35, 0.35, 0.24, 16);
};

// ---------------------------------------------------------------- inserts (9:16 cards)
type Ins = { n: number; draw: (g: CanvasRenderingContext2D, st: number) => void };
const vig = (g: CanvasRenderingContext2D, a = 0.55) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.3, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
const blob = (g: CanvasRenderingContext2D, pts: [number, number][], fill: string, lw = 10) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); } };
/** Theo's wrist and the glowing counter (the implant under the skin) */
const wrist = (g: CanvasRenderingContext2D, n: string, warn = false) => {
  g.fillStyle = "#0b0d16"; g.fillRect(0, 0, IW, IH);
  // the counter is centred on the card (it was right of centre, and the push-in cropped its last digit)
  blob(g, [[-60, 400], [110, 380], [140, 990], [-60, 1040]], "#2a2f45");                                  // the hoodie cuff
  blob(g, [[100, 430], [700, 410], [700, 950], [120, 970]], "#d9a988");                                    // the forearm
  blob(g, [[640, 440], [790, 410], [850, 560], [860, 760], [800, 930], [660, 960], [690, 700]], "#d9a988");           // the hand, past the wrist
  g.strokeStyle = "#b5876a"; g.lineWidth = 5; for (const y of [560, 650, 740, 830]) { g.beginPath(); g.moveTo(800, y); g.lineTo(850, y + 8); g.stroke(); }
  const cx = IW / 2 + 40;
  g.strokeStyle = warn ? "#ff3b30" : CYAN; g.lineWidth = 6; g.shadowColor = g.strokeStyle as string; g.shadowBlur = 30; g.beginPath(); g.roundRect(cx - 200, 570, 400, 200, 28); g.stroke();
  g.fillStyle = warn ? "#ff5a4e" : CYAN; g.font = "bold 112px 'DejaVu Sans Mono', monospace"; g.textAlign = "center"; g.fillText(n, cx, 712); g.shadowBlur = 0;
  g.fillStyle = warn ? "#ff9a90" : "#9ff6ff"; g.font = F(30); g.fillText("DAYS REMAINING", cx, 830); vig(g);
};
const INSERTS: Record<string, Ins> = {
  // the hospital desk screen
  coverage: { n: 1, draw: (g) => {
    g.fillStyle = "#06080e"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#0e1220"; g.beginPath(); g.roundRect(70, 300, 670, 520, 30); g.fill(); g.lineWidth = 8; g.strokeStyle = "#2a3550"; g.stroke();
    g.textAlign = "center"; g.fillStyle = "#8a9ab8"; g.font = F(32); g.fillText("VANTAGE GENERAL · ADMISSIONS", IW / 2, 380);
    g.fillStyle = "#ff3b30"; g.shadowColor = "#ff3b30"; g.shadowBlur = 30; g.font = F(68); g.fillText("COVERAGE", IW / 2, 540); g.fillText("REQUIRED", IW / 2, 630); g.shadowBlur = 0;
    g.fillStyle = "#c9d2e6"; g.font = F(30, "normal"); g.fillText("No coverage card on file.", IW / 2, 720); g.fillText("Treatment cannot begin.", IW / 2, 760); vig(g);
  } },
  // Mum's locker: the chip in its case
  locker: { n: 1, draw: (g) => {
    g.fillStyle = "#3a4050"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#2a2f3c"; g.fillRect(90, 150, 630, 1000); g.lineWidth = 10; g.strokeStyle = INK; g.strokeRect(90, 150, 630, 1000);
    g.fillStyle = "#c0392b"; g.fillRect(140, 200, 220, 360); g.fillStyle = "#ffffff"; g.fillRect(232, 300, 36, 120); g.fillRect(190, 342, 120, 36);   // her medic jacket
    g.fillStyle = "#16181f"; g.beginPath(); g.roundRect(220, 640, 380, 260, 20); g.fill(); g.strokeStyle = "#5a606c"; g.lineWidth = 6; g.stroke();
    g.fillStyle = "#8a909c"; g.font = F(28); g.textAlign = "center"; g.fillText("MILITARY · RESTRICTED", 410, 690);
    g.fillStyle = "#0a0b10"; g.beginPath(); g.roundRect(300, 730, 220, 120, 14); g.fill(); g.strokeStyle = CYAN; g.shadowColor = CYAN; g.shadowBlur = 24; g.lineWidth = 4; g.stroke(); g.shadowBlur = 0;
    g.fillStyle = CYAN; for (let i = 0; i < 6; i++) g.fillRect(320 + i * 32, 780, 18, 18); vig(g, 0.6);
  } },
  // Mum's note, in her handwriting, tucked in the case (Part 1 v2)
  note: { n: 1, draw: (g) => {
    g.fillStyle = "#0b0d16"; g.fillRect(0, 0, IW, IH);
    g.save(); g.translate(IW / 2, IH / 2 - 40); g.rotate(-0.05);
    g.fillStyle = "#f3ead2"; g.fillRect(-300, -250, 600, 500); g.strokeStyle = "#c9bd9c"; g.lineWidth = 3; for (let y = -170; y < 230; y += 70) { g.beginPath(); g.moveTo(-270, y); g.lineTo(270, y); g.stroke(); }
    g.fillStyle = "#1e2a5a"; g.textAlign = "left"; g.font = "italic 78px 'DejaVu Serif', serif"; g.fillText("Theo.", -250, -110);
    g.font = "italic 70px 'DejaVu Serif', serif"; g.fillText("Never use this.", -250, 30); g.font = "italic 58px 'DejaVu Serif', serif"; g.fillText("— Mum", 60, 170);
    g.restore(); vig(g, 0.6);
  } },
  // the photo in her locker: the two of them, smiling (Part 1 v2)
  photo: { n: 1, draw: (g) => {
    g.fillStyle = "#0b0d16"; g.fillRect(0, 0, IW, IH);
    g.save(); g.translate(IW / 2, IH / 2 - 40); g.rotate(0.04); g.fillStyle = "#f6f2e8"; g.fillRect(-280, -330, 560, 640);
    const sky = g.createLinearGradient(0, -300, 0, 220); sky.addColorStop(0, "#6a4a8a"); sky.addColorStop(1, "#c0608a"); g.fillStyle = sky; g.fillRect(-250, -300, 500, 520);
    const face = (x: number, y: number, r: number, hair: string, skin: string) => { g.fillStyle = hair; g.beginPath(); g.arc(x, y - 10, r + 14, Math.PI, 0); g.fill(); g.fillStyle = skin; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
      g.lineWidth = 6; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.1, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(x + r * 0.35, y - r * 0.1, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
      g.beginPath(); g.arc(x, y + r * 0.25, r * 0.35, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); };
    g.fillStyle = "#c0392b"; g.fillRect(-210, 40, 230, 180); g.fillStyle = "#2a2f45"; g.fillRect(20, 70, 200, 150);
    face(-95, -40, 92, "#2a2220", "#d9a988"); face(120, -10, 82, "#1c1a22", "#d9a988");
    g.restore(); vig(g, 0.6);
  } },
  // Theo's hand: open, then closing into a fist, the counter glowing at the wrist (Part 1 v2)
  fist: { n: 2, draw: (g, st) => {
    g.fillStyle = "#0b0d16"; g.fillRect(0, 0, IW, IH);
    blob(g, [[220, IH + 40], [260, 1000], [560, 1000], [600, IH + 40]], "#2a2f45");                                  // the hoodie sleeve
    blob(g, [[290, 1010], [530, 1010], [540, 820], [280, 820]], "#d9a988");                                           // the wrist
    g.strokeStyle = CYAN; g.lineWidth = 5; g.shadowColor = CYAN; g.shadowBlur = st ? 50 : 20; g.beginPath(); g.roundRect(320, 880, 180, 80, 14); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = CYAN; g.font = "bold 46px 'DejaVu Sans Mono', monospace"; g.textAlign = "center"; g.fillText("21,915", 410, 935);
    if (!st) {
      blob(g, [[260, 840], [560, 840], [590, 600], [230, 600]], "#d9a988");                                           // the open palm
      for (const [x, h] of [[255, 300], [345, 360], [435, 350], [520, 290]] as const) blob(g, [[x - 38, 620], [x + 38, 620], [x + 34, 620 - h], [x - 34, 620 - h]], "#d9a988", 9);
      blob(g, [[560, 760], [600, 700], [720, 600], [750, 640], [640, 790]], "#d9a988");                               // the thumb
    } else {
      blob(g, [[250, 850], [580, 850], [600, 560], [230, 560]], "#d9a988");                                           // the fist
      for (let k = 0; k < 4; k++) blob(g, [[240 + k * 88, 560], [328 + k * 88, 560], [322 + k * 88, 490], [246 + k * 88, 490]], "#e0b292", 9);
      blob(g, [[250, 700], [520, 640], [560, 700], [280, 760]], "#c99a7a", 9);                                         // the thumb across
      g.strokeStyle = "rgba(78,240,255,0.5)"; g.lineWidth = 6; for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; g.beginPath(); g.moveTo(410 + Math.cos(a) * 260, 700 + Math.sin(a) * 260); g.lineTo(410 + Math.cos(a) * 340, 700 + Math.sin(a) * 340); g.stroke(); }
    }
    vig(g, 0.5);
  } },
  // the back-alley clinic: the implant going in, sparks
  implant: { n: 1, draw: (g) => {
    g.fillStyle = "#08090f"; g.fillRect(0, 0, IW, IH);
    blob(g, [[-60, 500], [IW + 60, 440], [IW + 60, 900], [-60, 960]], "#d9a988");
    g.fillStyle = "#14161e"; g.beginPath(); g.roundRect(320, 560, 180, 150, 16); g.fill(); g.strokeStyle = CYAN; g.lineWidth = 5; g.shadowColor = CYAN; g.shadowBlur = 30; g.stroke(); g.shadowBlur = 0;
    blob(g, [[560, 120], [640, 120], [520, 600], [470, 590]], "#7a808c", 8);                                 // the tool
    const r = rnd(9); g.strokeStyle = "#fff3b0"; g.lineWidth = 4; for (let i = 0; i < 26; i++) { const a = r() * Math.PI * 2, l = 30 + r() * 120; g.beginPath(); g.moveTo(480, 600); g.lineTo(480 + Math.cos(a) * l, 600 + Math.sin(a) * l); g.stroke(); }
    vig(g, 0.6);
  } },
  // the counter on his wrist: one card per value
  counter21915: { n: 1, draw: (g) => wrist(g, "21,915") },
  counterDrop: { n: 3, draw: (g, st) => wrist(g, ["18,240", "9,600", "2,100"][st], st >= 2) },
  counter41: { n: 1, draw: (g) => wrist(g, "41", true) },
  // Sol's cracked holo-photo of the sea
  sea: { n: 1, draw: (g) => {
    g.fillStyle = "#07060f"; g.fillRect(0, 0, IW, IH);
    g.save(); g.translate(IW / 2, 620); g.rotate(-0.04);
    const sky = g.createLinearGradient(0, -360, 0, 360); sky.addColorStop(0, "#8fd4ff"); sky.addColorStop(0.5, "#cdeeff"); sky.addColorStop(0.52, "#1e8fd0"); sky.addColorStop(0.8, "#4ec3e8"); sky.addColorStop(0.82, "#f4ead0"); sky.addColorStop(1, "#e8d9b0");
    g.globalAlpha = 0.9; g.fillStyle = sky; g.fillRect(-300, -380, 600, 760); g.globalAlpha = 1;
    g.fillStyle = "rgba(255,255,255,0.18)"; for (let y = -380; y < 380; y += 8) g.fillRect(-300, y, 600, 2);
    g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 4; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(-300, 210 + k * 22); g.quadraticCurveTo(0, 195 + k * 22, 300, 210 + k * 22); g.stroke(); }
    g.strokeStyle = CYAN; g.lineWidth = 8; g.shadowColor = CYAN; g.shadowBlur = 30; g.strokeRect(-300, -380, 600, 760); g.shadowBlur = 0;
    g.strokeStyle = "rgba(255,255,255,0.85)"; g.lineWidth = 3; g.beginPath(); g.moveTo(120, -380); g.lineTo(60, -150); g.lineTo(140, 40); g.lineTo(90, 200); g.stroke();   // the crack
    g.restore(); vig(g, 0.5);
  } },
  // the end card (silent): Part 2, the vote
  endCard: { n: 1, draw: (g) => {
    g.fillStyle = "#05050b"; g.fillRect(0, 0, IW, IH); g.textAlign = "center";
    g.fillStyle = "#8b93a5"; g.font = F(32); g.fillText("WHAT IF… YOU COULD STOP TIME?", IW / 2, 260);
    g.fillStyle = "#e9edf5"; g.font = F(58); g.fillText("PART 2", IW / 2, 360); g.fillStyle = CYAN; g.font = F(64); g.fillText("FORTY-ONE DAYS", IW / 2, 450);
    g.fillStyle = "#e9edf5"; g.font = F(44); g.fillText("Would you break", IW / 2, 590); g.fillText("your promise?", IW / 2, 645);
    const opt = (x: number, n: string, a: string, c: string) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, 700, 320, 170, 30); g.fill(); g.fillStyle = "#ffffff"; g.font = F(76); g.fillText(n, x + 70, 812); g.font = F(36); g.fillText(a, x + 200, 798); };
    opt(70, "1", "SAVE HER", "#c4306e"); opt(IW - 390, "2", "KEEP IT", "#2a56b8");
    g.fillStyle = "#8b93a5"; g.font = F(34); g.fillText("COMMENT 1 OR 2", IW / 2, 960);
  } },
};
const insertRig = (a: At, v = "coverage"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.coverage, texAt = (st: number) => stex(`tsIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(Math.max(0, Math.min(ins.n - 1, Math.ceil(step - 1e-3)))); } };
};

// ---------------------------------------------------------------- hand items (Part 1 v2)
/** a Tower guard's pistol, held level, the barrel pointing outward (s) */
const pistolItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.poly([[x - 4 * u * s, y - 8 * u], [x + 30 * u * s, y - 8 * u], [x + 30 * u * s, y - 1 * u], [x - 4 * u * s, y - 1 * u]], "#2a2e38", 2.6 * u);   // the slide
  p.poly([[x - 4 * u * s, y - 2 * u], [x + 6 * u * s, y - 2 * u], [x + 4 * u * s, y + 12 * u], [x - 6 * u * s, y + 12 * u]], "#1a1c22", 2.6 * u);   // the grip
  p.stroke([[x + 18 * u * s, y - 5 * u], [x + 28 * u * s, y - 5 * u]], 1.4 * u, "#ffcf6a");                                                        // a gold line
};
/** a police cap, held in front by its peak */
const capItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.poly([[x - 14 * u, y - 2 * u], [x + 14 * u, y - 2 * u], [x + 12 * u, y - 14 * u], [x - 12 * u, y - 14 * u]], "#1e2a44", 2.6 * u);
  p.poly([[x - 16 * u, y - 2 * u], [x + 16 * u, y - 2 * u], [x + 12 * u * s, y + 5 * u], [x - 10 * u * s, y + 4 * u]], "#14161e", 2.4 * u);
  p.ell(x, y - 8 * u, 3.5 * u, 3 * u, "#c9a24e", 1.4 * u);
};

// ---------------------------------------------------------------- characters
const THEO: Look = { name: "Theo", build: "lanky", skin: "#d9a988", seed: 901, hair: { style: "spiky", color: "#1c1a22" }, top: { style: "hoodie", color: "#2a2f45", accent: CYAN }, legs: "#22252e", shoes: "#e8e8ec" };
const SOL: Look = { name: "Sol", build: "petite", skin: "#f0cdb4", seed: 902, hair: { style: "long", color: "#ff4fa8" }, brow: { color: "#7a2a5a", k: 0.8 }, lashes: true, blush: "#ff7a9a", visor: CYAN, top: { style: "tee", color: "#1f2233", accent: MAGENTA }, layer: { style: "blazer", color: "#6a3cd8", accent: CYAN }, legs: "#1b1d28", shoes: "#2a2c36" };
const MUM: Look = { name: "Mum (Theo's)", build: "adult", skin: "#d9a988", seed: 903, hair: { style: "bun", color: "#2a2220" }, top: { style: "shirt", color: "#e8e4dc" }, layer: { style: "longcoat", color: "#c0392b", accent: "#ffffff" }, legs: "#2a2e3a", shoes: "#1a1c22" };
const DEX: Look = { name: "Dex", build: "big", skin: "#8d5a3c", seed: 904, hair: { style: "buzz", color: "#111111" }, beard: { style: "full", color: "#111111" }, top: { style: "tee", color: "#3a3d48" }, layer: { style: "longcoat", color: "#5a3a22", accent: AMBER }, legs: "#22252e", shoes: "#111318" };
const GUARD: Look = { name: "Tower guard", build: "big", skin: "#e8c4a6", seed: 905, hair: { style: "buzz", color: "#2a2420" }, top: { style: "shirt", color: "#e8e8ec" }, layer: { style: "longcoat", color: "#cfd3da", accent: GOLD }, hat: { style: "cap", color: "#e8e8ec", trim: GOLD }, legs: "#8a8f99", shoes: "#2a2c34" };
const OFFICER: Look = { name: "Vantage police officer", build: "adult", skin: "#c99a7a", seed: 906, hair: { style: "short", color: "#3a3a40" }, brow: { k: 1.1 }, top: { style: "shirt", color: "#d8dde6" }, layer: { style: "longcoat", color: "#1e2a44", accent: "#9fb3d9" }, neck: { style: "tie", color: "#14161e" }, legs: "#1e2433", shoes: "#111318" };
const TEACHER: Look = { name: "Theo's teacher", build: "adult", skin: "#e6c3a5", seed: 907, hair: { style: "bun", color: "#5a3a2a" }, glasses: { style: "round", color: INK }, top: { style: "turtleneck", color: "#4a5a6a" }, layer: { style: "cardigan", color: "#6a3a5a" }, legs: "#2a2e3a", shoes: "#1a1c22" };
const DOC: Look = { name: "The back-alley doc", build: "lanky", skin: "#c9946c", seed: 908, hair: { style: "receding", color: "#6a6a6a" }, glasses: { style: "round", color: AMBER }, beard: { style: "goatee", color: "#5a5a5a" }, top: { style: "tee", color: "#3a3a2a" }, layer: { style: "apron", color: "#4a5a4a" }, legs: "#22252e", shoes: "#1a1c22" };
const low = (n: number, build: Look["build"], skin: string, hair: Look["hair"], c: string, acc: string): Look => ({ name: `Lowline ${n}`, build, skin, seed: 910 + n, hair, top: { style: "hoodie", color: c, accent: acc }, legs: "#1b1d28", shoes: "#2a2c36" });
const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["cyberpunk", "what-if", "romance"], tags });

export const TIMESTOP_THEME: Theme = {
  id: "timestop", name: "What If… You Could Stop Time? (Vantage City, 2081: neon, rain and the Towers)",
  desc: "an original cyberpunk love story: the Lowline's neon streets in the rain under the gold Towers above the smog; a rooftop above the city; a tiny flat; the Tower vault; stopped time (a blue veil, frozen rain, a frozen bullet)",
  tags: ["cyberpunk", "neon", "rain", "night", "city", "romance", "what-if", "sci-fi"],
  mood: "drone",
  ambience: { lowline: "elb_neon_city", lowRoof: "elb_roof_night", theoFlat: "elb_flat_rain", towerVault: "elb_vault", flatDoor: "elb_flat_rain", lockerRoom: "elb_vault", backClinic: "elb_flat_rain" },
  steps: { lowline: "step_hard", lowRoof: "step_hard", towerVault: "step_hard" },
  characters: { theo: THEO, sol: SOL, tsMum: MUM, dex: DEX, towerGuard: GUARD,
    lowA: low(1, "adult", "#c9946c", { style: "short", color: "#1a1a1a" }, "#3a2a4a", MAGENTA), lowB: low(2, "stout", "#e6c3a5", { style: "bun", color: "#3a6ad8" }, "#24384a", CYAN), lowC: low(3, "petite", "#a8765a", { style: "curly", color: "#111" }, "#4a2a2a", AMBER),
    lowD: low(4, "lanky", "#e8c4a6", { style: "side", color: "#6a4a2a" }, "#2a3a2a", CYAN), lowE: low(5, "petite", "#8d5a3c", { style: "ponytail", color: "#111" }, "#3a2a4a", MAGENTA),
    tsOfficer: OFFICER, tsTeacher: TEACHER, tsDoc: DOC },
  characterMeta: {
    theo: meta("Theo", "17; spiky black hair; a dark hoodie with cyan trim; white trainers", "a poor Lowline kid with a stolen implant that stops time; every second costs a day of his life", ["teen", "boy", "narrator", "hero"]),
    sol: meta("Sol", "17; long pink hair; lashes and blush; a glowing cyan visor band worn up in her hair; a violet jacket", "a hacker who dreams of seeing the real sea", ["teen", "girl", "hacker", "love"]),
    tsMum: meta("Mum (Theo's)", "a tired medic; a dark bun; a red medic coat with a white cross", "a night-shift medic who fixes the people hospitals turn away", ["mother", "female", "medic"]),
    dex: meta("Dex", "big; a buzz cut and beard; a brown long coat", "the crew's big-hearted driver", ["adult", "male", "driver", "crew"]),
    towerGuard: meta("Tower guard", "big; white armour coat with gold trim; a cap", "a guard of the Towers", ["guard", "male", "uniform"]),
    tsOfficer: meta("Vantage police officer", "short greying hair; a navy long coat over a white shirt and black tie; his cap held in his hands (item tsCap)", "the officer who brings Theo the news at dawn", ["police", "officer", "male", "uniform"]),
    tsTeacher: meta("Theo's teacher", "a bun; round glasses; a plum cardigan over a slate turtleneck", "Theo's teacher, who calls after him as he walks out", ["teacher", "female", "school"]),
    tsDoc: meta("The back-alley doc", "lanky; receding grey hair; amber goggle-glasses; a goatee; a grimy apron", "the back-alley doc who puts the implant in", ["doctor", "male", "clinic", "underworld"]),
    lowD: meta("Lowline 4", "a lanky boy in a green hoodie", "a Lowline extra", ["extra"]), lowE: meta("Lowline 5", "a girl with a ponytail, a violet hoodie", "a Lowline extra", ["extra"]),
    lowA: meta("Lowline 1", "a man in a violet hoodie", "a Lowline extra", ["extra"]), lowB: meta("Lowline 2", "a woman with a blue bun, a teal hoodie", "a Lowline extra", ["extra"]), lowC: meta("Lowline 3", "a girl in a red hoodie", "a Lowline extra", ["extra"]),
  },
  props: {
    timeTint: { name: "Stopped time (blue veil)", desc: "stopped time: a cold blue veil held 0.5 m in front of whatever camera the shot uses (put `at` near what the shot looks at); with the rain prop given no steps, the rain hangs still", category: "theme", themes: ["sci-fi", "time"], tags: ["time", "freeze", "tint", "overlay"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => tintRig(a, v === "behind"), steps: [], stepCount: () => 1,
      variants: { lens: () => undefined, behind: () => undefined } },
    tsChoice: { name: "Choice panels (Stop Time)", desc: "the end-card vote over a frozen scene: glowing holo panels facing +z (turn with yaw), each popping in on its first step (hidden before it). Variants: q (WHAT SHOULD HE DO?, 1.3 m wide), a (A · SAVE HER and its consequence, 0.9 m), b (B · LEAVE HER and its consequence, 0.9 m), foot (COMMENT A OR B, 1.3 m). Drawn over everything", category: "theme", themes: ["cyberpunk", "what-if"], tags: ["choice", "vote", "end card", "panel"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => choiceRig(a, v ?? "q"), steps: ["pops in"], stepCount: () => 1,
      variants: { q: () => undefined, a: () => undefined, b: () => undefined, foot: () => undefined } },
    bullet: { name: "Frozen bullet", desc: "a bullet frozen in mid-air with a pale trail behind it; its tip points along +x (turn it with yaw); `at` = the bullet, use `at` y for its height", category: "theme", themes: ["sci-fi", "action"], tags: ["bullet", "frozen", "time"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => bulletRig(a), steps: [], stepCount: () => 1 },
    van: { name: "Crew van (neon)", desc: "the crew's dark van with magenta light strips, 2 x 4.6 m, its nose toward +z (turn with yaw)", category: "theme", themes: ["cyberpunk"], tags: ["van", "vehicle"], radius: 2.4, height: 2.3,
      build: (b, a) => vanBuild(b, a) },
    tsInsert: { name: "Close insert (Stop Time)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step. Variants: coverage (the hospital screen: COVERAGE REQUIRED), locker (Mum's locker: the military chip), implant (the implant going in, sparks), counter21915, counterDrop (18,240 / 9,600 / 2,100: one per step), counter41 (in red), sea (Sol's cracked holo-photo of the sea), endCard (Part 2, the vote), note (Mum's note: Theo. Never use this.), photo (Mum and Theo, smiling), fist (Theo's hand: open, then a fist, the counter glowing)", category: "theme", themes: ["cyberpunk", "insert"], tags: ["insert", "card", "close-up"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "coverage"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
  },
  items: {
    tsPistol: { name: "Pistol (Tower guard)", desc: "a dark pistol held level, the barrel pointing outward (use with the point gesture to aim it)", themes: ["cyberpunk", "action"], tags: ["gun", "pistol", "weapon", "guard"], draw: pistolItem },
    tsCap: { name: "Police cap (held)", desc: "a navy police cap held in front by its peak (an officer bringing bad news, cap in hand)", themes: ["cyberpunk", "police"], tags: ["cap", "police", "hat", "news"], draw: capItem },
  },
  sets: {
    flatDoor: { id: "flatDoor", title: "The flat's front door from inside, open onto the building's corridor; Mum's coat on its hook", lights: ["night", "interiorCool"], build: () => flatDoor() },
    lockerRoom: { id: "lockerRoom", title: "Mum's clinic locker room: a row of lockers, one open", lights: ["interiorCool", "interior"], build: () => lockerRoom() },
    backClinic: { id: "backClinic", title: "A back-alley clinic: a reclining chair, a tool tray, a neon CLINIC sign", lights: ["night", "interiorCool"], build: () => backClinic() },
    lowline: { id: "lowline", title: "The Lowline at night: a neon street in the rain, holo-ads, cables, the Towers above the smog", lights: ["night"], build: () => lowline() },
    lowRoof: { id: "lowRoof", title: "A rooftop above the Lowline at night: a ledge, the city below, the Towers beyond", lights: ["night"], build: () => lowRoof() },
    theoFlat: { id: "theoFlat", title: "Theo's flat: one small room, a neon-lit window, Mum's medic coat by the door", lights: ["night", "interiorCool"], build: () => theoFlat() },
    towerVault: { id: "towerVault", title: "The Tower vault: steel, a round vault door, the console, cold white light", lights: ["interiorCool", "interior"], build: () => towerVault() },
  },
  layouts: { lowline: { spots: LOW_SPOTS, views: LOW_VIEWS }, lowRoof: { spots: ROOF_SPOTS, views: ROOF_VIEWS }, theoFlat: { spots: FLAT_SPOTS, views: FLAT_VIEWS }, towerVault: { spots: VAULT_SPOTS, views: VAULT_VIEWS },
    flatDoor: { spots: DOOR_SPOTS, views: DOOR_VIEWS }, lockerRoom: { spots: LOCKER_SPOTS, views: LOCKER_VIEWS }, backClinic: { spots: CLINIC_SPOTS, views: CLINIC_VIEWS } },
  setMeta: {
    flatDoor: { name: "The flat's front door (inside)", desc: "the room x -1.5..1.5, z -1.5..1.5; the front doorway in the back wall (x -0.45..0.45), the door open into the room on the right; the corridor beyond (z -1.6..-3.6) under a strip light; Mum's red coat on a hook left of the door. Spots inDoor, hall, floorDoor (sitting on the floor by the door), coat, room", themes: ["cyberpunk", "home"], tags: ["door", "flat", "corridor", "news", "dawn"] },
    lockerRoom: { name: "Clinic locker room", desc: "4 x 3 m, open toward +z: seven lockers on the back wall, the middle one open (her red coat and a black case inside), a bench. Spots theo (facing the open locker), locker, bench", themes: ["cyberpunk", "clinic"], tags: ["locker", "clinic", "work"] },
    backClinic: { name: "Back-alley clinic", desc: "3.6 x 3 m, open toward +z: a reclining chair (spot chair, sit), a tool tray, a lamp over the chair, a neon CLINIC sign; spots doc, door", themes: ["cyberpunk", "underworld"], tags: ["clinic", "doctor", "implant", "neon"] },
    lowline: { name: "The Lowline (neon street)", desc: "the road runs along z (x -4..4) from z -46 toward the camera (z +16); pavements x +-4..+-6; tall dark buildings with fronts at x +-6, vertical neon signs, holo-ads over the street, cables; the gold Towers far beyond, above the smog. Spots mid, near, far, curbL, curbR, van, wall", themes: ["cyberpunk"], tags: ["street", "neon", "rain", "night", "city"] },
    lowRoof: { name: "Rooftop above the Lowline", desc: "a flat roof x -6..6, z -6..6, a 0.55 m parapet; spots ledgeL / ledgeR (sitting on the back parapet at z -5.5, facing the camera, the city and the Towers behind), mid, door; a water tank, an antenna, AC units", themes: ["cyberpunk", "romance"], tags: ["roof", "night", "city", "skyline"] },
    theoFlat: { name: "Theo's flat", desc: "3.4 x 3 m, open toward +z: a neon-lit window in the back wall, a bed on the left (spot bed), a table, the door in the right wall (spot door), Mum's red medic coat on a hook", themes: ["cyberpunk", "home"], tags: ["flat", "home", "night"] },
    towerVault: { name: "The Tower vault", desc: "7 x 5 m, open toward +z: steel walls, a round vault door in the back wall, the console in front of it (spot console), data columns, the entry doors in the right wall (spot doors), guard spots guard1-3, theo", themes: ["cyberpunk", "heist"], tags: ["vault", "heist", "corporate"] },
  },
};
