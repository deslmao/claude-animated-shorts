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
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
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
const FLAT_SPOTS: Record<string, V3> = { door: [1.2, 0, 0.6], bed: [-1.0, 0.45, -0.6], floor: [0, 0, 0.5], table: [0.4, 0, -0.6] };
const FLAT_VIEWS: View[] = [{ name: "flat", pos: [0.2, 1.5, 2.6], look: [0.2, 1.1, -0.6], fov: 50, establishing: true }];
const theoFlat = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.4, d: 3.0, h: 2.4, floor: floorMat(), wall: tex("tsFlat", flatWallTex, 3, 2), trim: "#1a1f2a", openings: [{ wall: "back", at: 0.2, w: 1.0, h: 1.1, sill: 1.0, view: "city" }] });
  box(b, glow("tsFlatPane", () => ({ color: "#8a2a7a" })), I, -0.3, 0.7, 1.0, 2.1, -1.47, -1.46);
  rbox(b, col("#3a3f4c"), I, -1.05, 0, -0.7, 1.1, 0.45, 1.5, 0.04); rbox(b, col("#5a4a6a"), I, -1.05, 0.45, -0.6, 1.05, 0.1, 1.3, 0.05);
  rbox(b, col("#4a3a2c"), I, 0.45, 0, -0.85, 0.8, 0.74, 0.5, 0.02);
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

// ---------------------------------------------------------------- props
/** stopped time: a cold blue veil 0.5 m in front of the lens, square to it, wherever the camera moves */
const tintRig = (a: At): PropRig => {
  const root = rigRoot(a), mat = new THREE.MeshBasicMaterial({ color: "#3a78ff", transparent: true, opacity: 0.28, depthTest: false, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), mat); m.renderOrder = 9; m.layers.set(NOINK); root.add(m);
  return { root, update: ({ camPos }) => { const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos); } };
};
/** a bullet frozen in mid-air, its tip toward +x (rotate with yaw), a pale trail behind it */
const bulletRig = (a: At): PropRig => {
  const root = rigRoot(a);
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.06, 12).rotateZ(Math.PI / 2), new THREE.MeshLambertMaterial({ color: "#c9a14a" })); root.add(shell);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.013, 10, 8), new THREE.MeshLambertMaterial({ color: "#d9b25a" })); tip.position.x = 0.032; root.add(tip);
  const trail = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.02), new THREE.MeshBasicMaterial({ color: "#e8f4ff", transparent: true, opacity: 0.45, toneMapped: false, depthWrite: false })); trail.position.x = -0.33; trail.layers.set(NOINK); root.add(trail);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.045, 24).rotateY(Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#e8f4ff", transparent: true, opacity: 0.5, toneMapped: false, side: THREE.DoubleSide })); ring.position.x = -0.05; ring.layers.set(NOINK); root.add(ring);
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
  blob(g, [[100, 430], [IW + 60, 380], [IW + 60, 920], [120, 970]], "#d9a988");                           // the forearm
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

// ---------------------------------------------------------------- characters
const THEO: Look = { name: "Theo", build: "lanky", skin: "#d9a988", seed: 901, hair: { style: "spiky", color: "#1c1a22" }, top: { style: "hoodie", color: "#2a2f45", accent: CYAN }, legs: "#22252e", shoes: "#e8e8ec" };
const SOL: Look = { name: "Sol", build: "petite", skin: "#f0cdb4", seed: 902, hair: { style: "long", color: "#ff4fa8" }, brow: { color: "#7a2a5a", k: 0.8 }, lashes: true, blush: "#ff7a9a", visor: CYAN, top: { style: "tee", color: "#1f2233", accent: MAGENTA }, layer: { style: "blazer", color: "#6a3cd8", accent: CYAN }, legs: "#1b1d28", shoes: "#2a2c36" };
const MUM: Look = { name: "Mum (Theo's)", build: "adult", skin: "#d9a988", seed: 903, hair: { style: "bun", color: "#2a2220" }, top: { style: "shirt", color: "#e8e4dc" }, layer: { style: "longcoat", color: "#c0392b", accent: "#ffffff" }, legs: "#2a2e3a", shoes: "#1a1c22" };
const DEX: Look = { name: "Dex", build: "big", skin: "#8d5a3c", seed: 904, hair: { style: "buzz", color: "#111111" }, beard: { style: "full", color: "#111111" }, top: { style: "tee", color: "#3a3d48" }, layer: { style: "longcoat", color: "#5a3a22", accent: AMBER }, legs: "#22252e", shoes: "#111318" };
const GUARD: Look = { name: "Tower guard", build: "big", skin: "#e8c4a6", seed: 905, hair: { style: "buzz", color: "#2a2420" }, top: { style: "shirt", color: "#e8e8ec" }, layer: { style: "longcoat", color: "#cfd3da", accent: GOLD }, hat: { style: "cap", color: "#e8e8ec", trim: GOLD }, legs: "#8a8f99", shoes: "#2a2c34" };
const low = (n: number, build: Look["build"], skin: string, hair: Look["hair"], c: string, acc: string): Look => ({ name: `Lowline ${n}`, build, skin, seed: 910 + n, hair, top: { style: "hoodie", color: c, accent: acc }, legs: "#1b1d28", shoes: "#2a2c36" });
const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["cyberpunk", "what-if", "romance"], tags });

export const TIMESTOP_THEME: Theme = {
  id: "timestop", name: "What If… You Could Stop Time? (Vantage City, 2081: neon, rain and the Towers)",
  desc: "an original cyberpunk love story: the Lowline's neon streets in the rain under the gold Towers above the smog; a rooftop above the city; a tiny flat; the Tower vault; stopped time (a blue veil, frozen rain, a frozen bullet)",
  tags: ["cyberpunk", "neon", "rain", "night", "city", "romance", "what-if", "sci-fi"],
  mood: "drone",
  ambience: { lowline: "elb_neon_city", lowRoof: "elb_roof_night", theoFlat: "elb_flat_rain", towerVault: "elb_vault" },
  steps: { lowline: "step_hard", lowRoof: "step_hard", towerVault: "step_hard" },
  characters: { theo: THEO, sol: SOL, tsMum: MUM, dex: DEX, towerGuard: GUARD,
    lowA: low(1, "adult", "#c9946c", { style: "short", color: "#1a1a1a" }, "#3a2a4a", MAGENTA), lowB: low(2, "stout", "#e6c3a5", { style: "bun", color: "#3a6ad8" }, "#24384a", CYAN), lowC: low(3, "petite", "#a8765a", { style: "curly", color: "#111" }, "#4a2a2a", AMBER) },
  characterMeta: {
    theo: meta("Theo", "17; spiky black hair; a dark hoodie with cyan trim; white trainers", "a poor Lowline kid with a stolen implant that stops time; every second costs a day of his life", ["teen", "boy", "narrator", "hero"]),
    sol: meta("Sol", "17; long pink hair; lashes and blush; a glowing cyan visor band worn up in her hair; a violet jacket", "a hacker who dreams of seeing the real sea", ["teen", "girl", "hacker", "love"]),
    tsMum: meta("Mum (Theo's)", "a tired medic; a dark bun; a red medic coat with a white cross", "a night-shift medic who fixes the people hospitals turn away", ["mother", "female", "medic"]),
    dex: meta("Dex", "big; a buzz cut and beard; a brown long coat", "the crew's big-hearted driver", ["adult", "male", "driver", "crew"]),
    towerGuard: meta("Tower guard", "big; white armour coat with gold trim; a cap", "a guard of the Towers", ["guard", "male", "uniform"]),
    lowA: meta("Lowline 1", "a man in a violet hoodie", "a Lowline extra", ["extra"]), lowB: meta("Lowline 2", "a woman with a blue bun, a teal hoodie", "a Lowline extra", ["extra"]), lowC: meta("Lowline 3", "a girl in a red hoodie", "a Lowline extra", ["extra"]),
  },
  props: {
    timeTint: { name: "Stopped time (blue veil)", desc: "stopped time: a cold blue veil held 0.5 m in front of whatever camera the shot uses (put `at` near what the shot looks at); with the rain prop given no steps, the rain hangs still", category: "theme", themes: ["sci-fi", "time"], tags: ["time", "freeze", "tint", "overlay"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => tintRig(a), steps: [], stepCount: () => 1 },
    bullet: { name: "Frozen bullet", desc: "a bullet frozen in mid-air with a pale trail behind it; its tip points along +x (turn it with yaw); `at` = the bullet, use `at` y for its height", category: "theme", themes: ["sci-fi", "action"], tags: ["bullet", "frozen", "time"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => bulletRig(a), steps: [], stepCount: () => 1 },
    van: { name: "Crew van (neon)", desc: "the crew's dark van with magenta light strips, 2 x 4.6 m, its nose toward +z (turn with yaw)", category: "theme", themes: ["cyberpunk"], tags: ["van", "vehicle"], radius: 2.4, height: 2.3,
      build: (b, a) => vanBuild(b, a) },
    tsInsert: { name: "Close insert (Stop Time)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step. Variants: coverage (the hospital screen: COVERAGE REQUIRED), locker (Mum's locker: the military chip), implant (the implant going in, sparks), counter21915, counterDrop (18,240 / 9,600 / 2,100: one per step), counter41 (in red), sea (Sol's cracked holo-photo of the sea), endCard (Part 2, the vote)", category: "theme", themes: ["cyberpunk", "insert"], tags: ["insert", "card", "close-up"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "coverage"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
  },
  sets: {
    lowline: { id: "lowline", title: "The Lowline at night: a neon street in the rain, holo-ads, cables, the Towers above the smog", lights: ["night"], build: () => lowline() },
    lowRoof: { id: "lowRoof", title: "A rooftop above the Lowline at night: a ledge, the city below, the Towers beyond", lights: ["night"], build: () => lowRoof() },
    theoFlat: { id: "theoFlat", title: "Theo's flat: one small room, a neon-lit window, Mum's medic coat by the door", lights: ["night", "interiorCool"], build: () => theoFlat() },
    towerVault: { id: "towerVault", title: "The Tower vault: steel, a round vault door, the console, cold white light", lights: ["interiorCool", "interior"], build: () => towerVault() },
  },
  layouts: { lowline: { spots: LOW_SPOTS, views: LOW_VIEWS }, lowRoof: { spots: ROOF_SPOTS, views: ROOF_VIEWS }, theoFlat: { spots: FLAT_SPOTS, views: FLAT_VIEWS }, towerVault: { spots: VAULT_SPOTS, views: VAULT_VIEWS } },
  setMeta: {
    lowline: { name: "The Lowline (neon street)", desc: "the road runs along z (x -4..4) from z -46 toward the camera (z +16); pavements x +-4..+-6; tall dark buildings with fronts at x +-6, vertical neon signs, holo-ads over the street, cables; the gold Towers far beyond, above the smog. Spots mid, near, far, curbL, curbR, van, wall", themes: ["cyberpunk"], tags: ["street", "neon", "rain", "night", "city"] },
    lowRoof: { name: "Rooftop above the Lowline", desc: "a flat roof x -6..6, z -6..6, a 0.55 m parapet; spots ledgeL / ledgeR (sitting on the back parapet at z -5.5, facing the camera, the city and the Towers behind), mid, door; a water tank, an antenna, AC units", themes: ["cyberpunk", "romance"], tags: ["roof", "night", "city", "skyline"] },
    theoFlat: { name: "Theo's flat", desc: "3.4 x 3 m, open toward +z: a neon-lit window in the back wall, a bed on the left (spot bed), a table, the door in the right wall (spot door), Mum's red medic coat on a hook", themes: ["cyberpunk", "home"], tags: ["flat", "home", "night"] },
    towerVault: { name: "The Tower vault", desc: "7 x 5 m, open toward +z: steel walls, a round vault door in the back wall, the console in front of it (spot console), data columns, the entry doors in the right wall (spot doors), guard spots guard1-3, theo", themes: ["cyberpunk", "heist"], tags: ["vault", "heist", "corporate"] },
  },
};
