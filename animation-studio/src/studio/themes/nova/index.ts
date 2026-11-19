// "What If… you could command anyone?" theme (productions/what-if-command, script-v3-nova.md, approved): Nova, a Grey
// girl in a walled town split between the rich Blues and the starving Greys.
// Reused from the base library: kit primitives, buildRoom, street lamps, the day / night / interior light presets.
// New here (additions only):
//   sets novaStreet (the Grey street at night: grey terraces, the bread shop and its shutter, the warehouse, puddles,
//     curfew lamps; the great wall across the end, its gate shut, the Blues' gold towers glowing beyond it),
//     novaStreetDay (the same street on a grey morning), novaStreetFree (the same street freed: painted houses, bunting,
//     the gate wide open, light pouring through), blueHall (the Blues' gold dining hall, a long table of food),
//     novaHome (one cold room: two mattresses, Dad's photo, the kitchen corner, a small screen), novaTower (the
//     broadcast room: a microphone, a wall of screens, the window over the town)
//   props breadShutter (the bread shop's roller shutter: variant down = open, then slams shut on its step; up = shut,
//     then rolls up), novaInsert (9:16 close insert cards; a state per step)
//   characters nova, pip, pipYellow, novaMum, novaDad, kai, blueGuard, blueOfficer, blueMan, blueWoman, blueKid,
//     grey1-3 (Grey extras for queues and crowds)
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { Batch, quadUp } from "../../materials/geo";
import { buildRoom } from "../../sets/room";
import { At, col, tex, glow, box, rbox, cyl, sph } from "../../props/kit";
import { floorMat } from "../../props/interior";
import { streetLamp } from "../../props/outdoor";
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
const INK = "#1b1d24", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const GOLD = "#f2c14e", BLUE = "#2a56b8";

// ---------------------------------------------------------------- textures
/** a terrace facade (one house, 4 m wide): two rows of windows and a door. free = painted and lit */
const facadeTex = (wall: string, free: boolean, seed: number) => stex(`nvFac_${wall}_${free}_${seed}`, 256, 448, (g) => {
  const r = rnd(seed);
  g.fillStyle = wall; g.fillRect(0, 0, 256, 448);
  g.fillStyle = "rgba(0,0,0,0.08)"; for (let y = 0; y < 448; y += 14) g.fillRect(0, y, 256, 2);      // courses
  if (!free) { g.fillStyle = "rgba(20,22,26,0.18)"; for (let i = 0; i < 6; i++) { const x = r() * 256; g.fillRect(x, 0, 6 + r() * 10, 448); } } // damp streaks
  for (const [y, h] of [[60, 90], [210, 90]] as const) for (const x of [36, 150]) {
    const lit = free ? r() > 0.25 : r() > 0.85, broken = !free && r() > 0.6;
    g.fillStyle = free ? "#f4efe2" : "#55595f"; g.fillRect(x - 6, y - 6, 82, h + 12);                   // frame
    g.fillStyle = lit ? (free ? "#ffd98a" : "#9c8a5a") : "#1d2129"; g.fillRect(x, y, 70, h);
    if (broken) { g.fillStyle = "#6b5a44"; g.fillRect(x, y + h * 0.35, 70, 14); g.fillRect(x, y + h * 0.65, 70, 14); } // boarded
    g.fillStyle = free ? "#f4efe2" : "#55595f"; g.fillRect(x + 33, y, 4, h);
  }
  g.fillStyle = free ? ["#c0392b", "#2a7f62", "#2a56b8", "#e0a43a"][seed % 4] : "#3d4046"; g.fillRect(96, 340, 64, 108); // door
  g.fillStyle = free ? "#f4efe2" : "#55595f"; g.fillRect(90, 334, 76, 6);
});
const wallTex = () => stex("nvWall", 512, 256, (g) => {
  g.fillStyle = "#8a8d91"; g.fillRect(0, 0, 512, 256);
  g.strokeStyle = "rgba(40,42,46,0.35)"; g.lineWidth = 3; for (let x = 0; x < 512; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); }
  for (let y = 0; y < 256; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(512, y); g.stroke(); }
  const r = rnd(4); g.fillStyle = "rgba(30,32,36,0.25)"; for (let i = 0; i < 40; i++) g.fillRect(r() * 512, r() * 256, 4 + r() * 18, 20 + r() * 60);
});
const asphaltTex = () => stex("nvRoad", 256, 256, (g) => { g.fillStyle = "#3a3d42"; g.fillRect(0, 0, 256, 256); const r = rnd(7); for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},0.04)`; g.fillRect(r() * 256, r() * 256, 3, 3); } });
const paveTex = () => stex("nvPave", 256, 256, (g) => { g.fillStyle = "#6e7177"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(30,30,34,0.35)"; g.lineWidth = 2; for (let x = 0; x <= 256; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(256, x); g.stroke(); } });
const shutterTex = () => stex("nvShutter", 128, 256, (g) => { g.fillStyle = "#7c8087"; g.fillRect(0, 0, 128, 256); g.fillStyle = "rgba(20,22,26,0.4)"; for (let y = 0; y < 256; y += 10) g.fillRect(0, y, 128, 3); });
const signTex = (text: string, bg: string, fg: string) => stex(`nvSign_${text}`, 512, 128, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 512, 128); g.fillStyle = fg; g.font = F(72); g.textAlign = "center"; g.fillText(text, 256, 92); });
const photoTex = () => stex("nvDadPhoto", 128, 160, (g) => { g.fillStyle = "#e8e2d4"; g.fillRect(0, 0, 128, 160); g.fillStyle = "#9aa3ad"; g.fillRect(10, 10, 108, 110); dadFace(g, 64, 70, 32); });
const screenTex = (key: string) => stex(`nvScreen_${key}`, 256, 160, (g) => governorScreen(g, 256, 160));
const peelTex = () => stex("nvPeel", 256, 256, (g) => { g.fillStyle = "#8f9297"; g.fillRect(0, 0, 256, 256); const r = rnd(12); g.fillStyle = "rgba(60,62,66,0.35)"; for (let i = 0; i < 30; i++) { g.beginPath(); g.ellipse(r() * 256, r() * 256, 6 + r() * 18, 4 + r() * 12, r() * 3, 0, 7); g.fill(); } });
const goldWallTex = () => stex("nvGoldWall", 256, 256, (g) => { g.fillStyle = "#e8d6a8"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(190,150,60,0.45)"; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 6, 256); g.fillStyle = "rgba(190,150,60,0.6)"; g.fillRect(0, 200, 256, 10); });

/** a simple drawn face (photos, screens): skin, hair, eyes, a smile */
const dadFace = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  g.fillStyle = "#3a2e28"; g.beginPath(); g.ellipse(cx, cy - r * 0.45, r * 0.95, r * 0.6, 0, Math.PI, 0); g.fill();
  g.fillStyle = "#e6c3a5"; g.beginPath(); g.ellipse(cx, cy, r * 0.8, r * 0.95, 0, 0, 7); g.fill(); g.lineWidth = Math.max(2, r * 0.07); g.strokeStyle = INK; g.stroke();
  g.fillStyle = "#3a2e28"; g.beginPath(); g.ellipse(cx, cy + r * 0.62, r * 0.55, r * 0.32, 0, 0, Math.PI); g.fill();  // beard
  g.fillStyle = INK; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * r * 0.3, cy - r * 0.05, r * 0.09, 0, 7); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = Math.max(2, r * 0.06); g.beginPath(); g.arc(cx, cy + r * 0.25, r * 0.28, 0.3, Math.PI - 0.3); g.stroke();
};
/** the Governor on a screen: a smiling man in a blue collar, gold border, the slogan */
const governorScreen = (g: CanvasRenderingContext2D, w: number, h: number) => {
  g.fillStyle = "#0d1a36"; g.fillRect(0, 0, w, h); const s = h / 160;
  g.fillStyle = BLUE; g.beginPath(); g.ellipse(w / 2, h + 10 * s, 70 * s, 50 * s, 0, Math.PI, 0); g.fill();
  g.fillStyle = "#f0d2b8"; g.beginPath(); g.ellipse(w / 2, 62 * s, 30 * s, 36 * s, 0, 0, 7); g.fill();
  g.fillStyle = "#d8d8d8"; g.beginPath(); g.ellipse(w / 2, 34 * s, 30 * s, 14 * s, 0, Math.PI, 0); g.fill();
  g.fillStyle = INK; for (const k of [-1, 1]) { g.beginPath(); g.arc(w / 2 + k * 11 * s, 58 * s, 3 * s, 0, 7); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 3 * s; g.beginPath(); g.arc(w / 2, 70 * s, 12 * s, 0.25, Math.PI - 0.25); g.stroke();
  g.fillStyle = GOLD; g.font = F(16 * s); g.textAlign = "center"; g.fillText("ORDER IS PEACE", w / 2, h - 12 * s);
  g.strokeStyle = GOLD; g.lineWidth = 5 * s; g.strokeRect(3, 3, w - 6, h - 6);
};

// ---------------------------------------------------------------- set: the street (night / day / free)
// The road runs along z: x -4..4, from the wall (z -32) toward the camera side (z +14). Pavements x +-4..+-6.
// Terraced houses on both sides, fronts at x = +-6 facing the road, 4 m per house. The bread shop: the left house at
// z -4 (shutter on its front, x -5.95, z -5.2..-2.8). The warehouse: the right side at z -14. The wall across the end
// at z -32 (14 m high), its gate x -2.5..2.5 (6 m). Beyond: the Blues' towers, gold, z -45..-95.
const STREET_SPOTS: Record<string, V3> = {
  queue1: [-3.4, 0, -2.6], queue2: [-3.1, 0, -1.2], queue3: [-3.3, 0, 0.2], queue4: [-3.0, 0, 1.6], shop: [-4.6, 0, -4.0],
  mid: [0, 0, 0], near: [0.5, 0, 4], warehouse: [4.4, 0, -14], gate: [0, 0, -29], gateOut: [0, 0, -26], far: [0, 0, -18],
};
const STREET_VIEWS: View[] = [
  { name: "street", pos: [1.2, 1.7, 9], look: [0, 3.5, -30], fov: 50, establishing: true },
  { name: "queue", pos: [1.5, 1.5, 3.5], look: [-3.6, 1.2, -2.5], fov: 50 },
  { name: "wall", pos: [0.4, 1.4, -12], look: [0, 8, -32], fov: 55, establishing: true },
];
const GREYS = ["#6f7378", "#7a7d82", "#666a70", "#74777c", "#6b6e73"];
const FREES = ["#e8b86a", "#d9806a", "#7fb0d6", "#9cc98a", "#e9dcc0", "#c9a0d6"];
const novaStreet = (mode: "night" | "day" | "free") => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4(), free = mode === "free";
  b.add(quadUp(-4, 4, -33, 16, 2, 12, 0.0), tex("nvRoad", asphaltTex, 1, 1));
  for (const s of [-1, 1]) b.add(quadUp(s < 0 ? -6 : 4, s < 0 ? -4 : 6, -33, 16, 1, 12, 0.12), tex("nvPave", paveTex, 1, 1));
  for (const s of [-1, 1]) box(b, col("#5c5f64"), I, s < 0 ? -4.05 : 3.95, s < 0 ? -3.95 : 4.05, 0, 0.12, -33, 16);       // kerbs
  // terraces
  let k = 0;
  for (const s of [-1, 1]) for (let z = -30; z < 16; z += 4, k++) {
    const h = 6.4 + ((k * 7) % 3) * 0.6, wall = free ? FREES[k % FREES.length] : GREYS[k % GREYS.length];
    const x0 = s < 0 ? -12 : 6, x1 = s < 0 ? -6 : 12;
    box(b, tex(`nvFac_${wall}_${free}_${k}`, () => facadeTex(wall, free, k), 1, 1), I, x0, x1, 0, h, z, z + 4);
    box(b, col(free ? "#8a4a3a" : "#45484e"), I, x0 - 0.1, x1 + 0.1, h, h + 0.25, z - 0.05, z + 4.05);                     // roof edge
    cyl(b, col(free ? "#8a4a3a" : "#45484e"), I, s < 0 ? -9 : 9, h + 0.25, z + 2, 0.25, 0.25, 0.9, 8);                       // chimney
  }
  // the bread shop (left, z -4): sign; the warehouse door (right, z -14)
  b.add(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshLambertMaterial({ map: signTex("BREAD", free ? "#c0392b" : "#4a4d52", free ? "#ffffff" : "#c9ccd1") }), new THREE.Matrix4().makeTranslation(-5.94, 2.9, -4).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
  box(b, col("#2b2e33"), I, -6.0, -5.96, 0.12, 2.6, -5.3, -2.7);                                                             // the shop opening (behind the shutter)
  box(b, col(free ? "#3a7a5a" : "#3a3d42"), I, 5.96, 6.0, 0.12, 4.0, -16, -12);                                              // warehouse doors
  b.add(new THREE.PlaneGeometry(3.6, 0.6), new THREE.MeshLambertMaterial({ map: signTex("STORE 4", "#2b2e33", "#9aa0a8") }), new THREE.Matrix4().makeTranslation(5.94, 4.5, -14).multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2)));
  // puddles
  const pud = glow(free ? "nvPuddleF" : "nvPuddle", () => ({ color: free ? "#8fb6d0" : "#2a2e36" }));
  for (const [x, z, w, d] of [[-1.5, 2, 1.6, 0.9], [1.8, -3, 1.2, 0.7], [-0.6, -9, 2.0, 1.0], [2.2, 6, 1.4, 0.8]] as const) b.add(quadUp(x - w / 2, x + w / 2, z - d / 2, z + d / 2, 1, 1, 0.012), pud);
  // curfew lamps
  for (const z of [-24, -12, 0, 10]) { streetLamp(b, { x: -4.4, z, yaw: Math.PI / 2 }); streetLamp(b, { x: 4.4, z: z + 6, yaw: -Math.PI / 2 }); }
  // the wall, its gate
  const wm = tex("nvWall", wallTex, 6, 1);
  box(b, wm, I, -40, -2.5, 0, 14, -33.2, -32); box(b, wm, I, 2.5, 40, 0, 14, -33.2, -32); box(b, wm, I, -2.5, 2.5, 6.2, 14, -33.2, -32);
  for (const x of [-30, -18, -8, 8, 18, 30]) box(b, col("#6a6d72"), I, x - 0.4, x + 0.4, 0, 14.6, -32.2, -31.6);              // buttresses
  box(b, col("#45484e"), I, -40, 40, 14, 14.4, -33.4, -31.8);                                                                 // coping
  if (free) {
    box(b, glow("nvGateLight", () => ({ color: "#fff1c8" })), I, -2.5, 2.5, 0, 6.2, -33.3, -33.25);                           // daylight through the open gate
    for (const s of [-1, 1]) rbox(b, col("#3a3d42"), new THREE.Matrix4().makeTranslation(s * 2.5, 0, -32).multiply(new THREE.Matrix4().makeRotationY(s * 1.2)), -s * 1.25, 0, 0, 2.5, 6.0, 0.18, 0.02);
  } else {
    box(b, col("#2f3237"), I, -2.5, 2.5, 0, 6.2, -32.3, -32.1);                                                               // the gate, shut
    for (let x = -2.3; x < 2.5; x += 0.5) box(b, col("#23262a"), I, x, x + 0.08, 0, 6.2, -32.12, -32.05);
    box(b, glow("nvGateLine", () => ({ color: "#f7d58a" })), I, -0.03, 0.03, 0, 6.2, -32.11, -32.09);                         // a line of gold light in its seam
  }
  // the Blues' city beyond the wall: gold towers
  const r = rnd(31), lit = glow("nvBlueLit", () => ({ color: mode === "night" ? "#f7c95a" : "#f3d590" })), tower = col(mode === "night" ? "#3a3550" : "#c9c2d8");
  for (let i = 0; i < 18; i++) {
    const x = -40 + i * 4.7 + r() * 2, z = -48 - r() * 40, h = 22 + r() * 34, w = 3 + r() * 3;
    box(b, tower, I, x - w / 2, x + w / 2, 0, h, z - w / 2, z + w / 2);
    for (let y = 16; y < h - 1; y += 2.2) for (let c = -1; c <= 1; c += 1) if (r() > 0.35) box(b, lit, I, x + c * w * 0.28 - 0.35, x + c * w * 0.28 + 0.35, y, y + 1.1, z + w / 2 + 0.01, z + w / 2 + 0.02);
    if (i % 4 === 1) sph(b, glow("nvDome", () => ({ color: GOLD })), I, x, h, z, w * 0.45, w * 0.45, w * 0.45, 14);
  }
  if (mode === "night") b.add(new THREE.PlaneGeometry(90, 26), glow("nvSkyGlow", () => ({ color: "#5a4a3a", transparent: true, opacity: 0.55 })), new THREE.Matrix4().makeTranslation(0, 22, -46));
  // freed: bunting across the street
  if (free) {
    const flags = ["#c0392b", "#f2c14e", "#2a56b8", "#2a7f62", "#e07a3a"];
    for (const z of [-20, -8, 4]) for (let i = 0; i < 16; i++) {
      const x = -5.5 + i * 0.73, y = 5.2 - Math.sin((i / 15) * Math.PI) * 0.9;
      b.add(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([x - 0.2, y, z, x + 0.2, y, z, x, y - 0.4, z], 3)).setAttribute("normal", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1], 3)).setAttribute("uv", new THREE.Float32BufferAttribute([0, 1, 1, 1, 0.5, 0], 2)), col(flags[i % 5]));
    }
  }
  b.build(root, true);
  return { root, env: { clouds: mode !== "night" }, spots: STREET_SPOTS, views: STREET_VIEWS };
};

// ---------------------------------------------------------------- prop: the bread shop's roller shutter
// absolute on the shop front (x -5.95, z -5.2..-2.8, 0.12..2.6 m) whatever `at` is. Variant down: open (rolled up), it
// slams shut over its step; up: shut, it rolls up over its step (give it one step, ~0.35 s long)
const shutterRig = (v: string): PropRig => {
  const root = new THREE.Group(), m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.48, 2.4), new THREE.MeshLambertMaterial({ map: shutterTex() }));
  m.position.set(-5.9, 0.12 + 1.24, -4); root.add(m);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 2.6), new THREE.MeshLambertMaterial({ color: "#55585e" })); hood.position.set(-5.85, 2.75, -4); root.add(hood);
  return { root, update: ({ step = 0 }) => { const p = Math.max(0, Math.min(1, step)), open = v === "down" ? 1 - p : p; m.scale.y = Math.max(0.02, 1 - open); m.position.y = 0.12 + 2.48 * (1 - open) / 2 + 2.48 * open; } };
};

// ---------------------------------------------------------------- set: the Blues' dining hall
// 6.4 x 5 m, open toward +z: gold-cream walls, two tall windows (the city), a long table along x at z -0.9 with a white
// cloth and food, chairs behind it (diners sit facing the camera), a chandelier. Mum works at the table's front edge.
const HALL_SPOTS: Record<string, V3> = { seat1: [-1.6, 0.46, -1.55], seat2: [-0.5, 0.46, -1.55], seat3: [0.6, 0.46, -1.55], seat4: [1.7, 0.46, -1.55], clean: [2.6, 0, -0.1], front: [0, 0, 1.4] };
const HALL_VIEWS: View[] = [{ name: "hall", pos: [0.4, 1.8, 4.2], look: [0, 1.1, -1.2], fov: 50, establishing: true }];
const blueHall = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 6.4, d: 5, h: 3.6, floor: floorMat(), wall: tex("nvGoldWall", goldWallTex, 4, 2), trim: "#c99a3a", openings: [{ wall: "back", at: -2.2, w: 1.2, h: 2.2, sill: 0.6, view: "city" }, { wall: "back", at: 2.2, w: 1.2, h: 2.2, sill: 0.6, view: "city" }] });
  rbox(b, col("#f7f3ea"), I, 0.05, 0.72, -0.9, 5.2, 0.06, 1.3, 0.02);                                                          // the cloth
  for (const x of [-2.4, 2.4]) for (const z of [-1.4, -0.4]) box(b, col("#7a4a22"), I, x - 0.05, x + 0.05, 0, 0.72, z - 0.05, z + 0.05);
  for (const p of [HALL_SPOTS.seat1, HALL_SPOTS.seat2, HALL_SPOTS.seat3, HALL_SPOTS.seat4]) { rbox(b, col("#8a1f2a"), I, p[0], 0, p[2] - 0.05, 0.5, 0.46, 0.5, 0.04); box(b, col("#c99a3a"), I, p[0] - 0.25, p[0] + 0.25, 0.46, 1.3, p[2] - 0.32, p[2] - 0.27); }
  const foods = ["#c0392b", "#f2c14e", "#e8a0b8", "#8b5a2b", "#f0e6d0", "#6aa84f"], r = rnd(9);
  for (let i = 0; i < 14; i++) {
    const x = -2.3 + i * 0.35, z = -0.9 + (i % 2 ? 0.3 : -0.25), c = foods[i % foods.length];
    cyl(b, col("#f4f4f0"), I, x, 0.78, z, 0.16, 0.16, 0.015, 18);                                                              // plate
    if (i % 3 === 0) { cyl(b, col(c), I, x, 0.795, z, 0.13, 0.12, 0.14, 18); cyl(b, col("#fff4e8"), I, x, 0.935, z, 0.12, 0.1, 0.03, 18); } // a cake
    else if (i % 3 === 1) sph(b, col(c), I, x, 0.83, z, 0.1 + r() * 0.03, 0.07, 0.1, 12);                                     // fruit / bread
    else { cyl(b, col("#c99a3a"), I, x, 0.795, z, 0.04, 0.05, 0.22, 10); sph(b, glow("nvFlame", () => ({ color: "#ffcf7a" })), I, x, 1.04, z, 0.025, 0.04, 0.025, 8); } // candle
  }
  sph(b, glow("nvChand", () => ({ color: "#ffe3a0" })), I, 0, 3.05, -0.9, 0.5, 0.22, 0.5, 18); cyl(b, col("#c99a3a"), I, 0, 3.2, -0.9, 0.02, 0.02, 0.4, 8);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: HALL_SPOTS, views: HALL_VIEWS };
};

// ---------------------------------------------------------------- set: Nova's home (one room)
// 3.6 x 3.2 m, open toward +z, peeling grey walls. Two mattresses on the floor along the back wall: Nova's (x -0.9)
// and Pip's (x 0.5); a small window between them; Dad's photo on the left wall; the kitchen corner on the right (a
// counter, the sink, a kettle); a small screen on a crate by the right wall (the Governor's broadcasts).
const MAT_TOP = 0.2;
const HOME_SPOTS: Record<string, V3> = { novaBed: [-0.9, MAT_TOP, -0.95], novaAsleep: [-1.05, -0.28, -0.95], pipBed: [0.55, MAT_TOP, -0.95], pipAsleep: [0.4, -0.28, -0.95], sink: [1.25, 0, -0.75], door: [-1.3, 0, 0.9], floor: [0, 0, 0.6], screen: [1.05, 0, 0.45] };
const HOME_VIEWS: View[] = [{ name: "room", pos: [0.3, 1.5, 2.6], look: [0, 0.6, -0.9], fov: 52, establishing: true }];
const novaHome = (mode: "night" | "day") => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.6, d: 3.2, h: 2.4, floor: floorMat(), wall: tex("nvPeel", peelTex, 3, 2), trim: "#6c6f74", openings: [{ wall: "back", at: -0.15, w: 0.6, h: 0.7, sill: 1.2, view: "city" }] });
  if (mode === "night") box(b, glow("nvHomePane", () => ({ color: "#121826" })), I, -0.45, 0.15, 1.2, 1.9, -1.57, -1.56);
  for (const [x, c] of [[-0.9, "#6b6e75"], [0.55, "#7a7266"]] as const) { rbox(b, col("#d8d2c6"), I, x, 0, -0.95, 1.1, MAT_TOP, 1.7, 0.06); rbox(b, col(c), I, x + 0.12, MAT_TOP - 0.02, -0.95, 0.85, 0.08, 1.72, 0.04); rbox(b, col("#efe9de"), I, x - 0.4, MAT_TOP, -0.95, 0.24, 0.08, 0.5, 0.04); }
  b.add(new THREE.PlaneGeometry(0.28, 0.35), new THREE.MeshLambertMaterial({ map: photoTex() }), new THREE.Matrix4().makeTranslation(-1.785, 1.45, -0.6).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
  rbox(b, col("#9a958a"), I, 1.35, 0, -1.2, 0.8, 0.85, 0.6, 0.02); box(b, col("#6c7076"), I, 1.15, 1.55, 0.86, 0.88, -1.4, -1.0);
  cyl(b, col("#5c6066"), I, 1.5, 0.88, -1.25, 0.08, 0.08, 0.18, 12);                                                           // kettle
  rbox(b, col("#8a6a4a"), I, 1.2, 0, 0.6, 0.5, 0.4, 0.4, 0.02); box(b, col("#16181c"), I, 0.98, 1.42, 0.4, 0.72, 0.55, 0.57);
  b.add(new THREE.PlaneGeometry(0.4, 0.28), new THREE.MeshBasicMaterial({ map: screenTex("home"), toneMapped: false }), new THREE.Matrix4().makeTranslation(1.2, 0.56, 0.575));
  sph(b, glow("nvBulb", () => ({ color: mode === "night" ? "#c9b98a" : "#e9e2cf" })), I, 0, 2.2, -0.3, 0.06, 0.08, 0.06, 10);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: HOME_SPOTS, views: HOME_VIEWS };
};

// ---------------------------------------------------------------- set: the broadcast tower
// 4.4 x 3.6 m, open toward +z, dark walls. The big window over the town in the back wall; a wall of screens on the left
// wall showing the Governor; the microphone on its stand at the front (spot mic), a desk with the red ON AIR light.
const TOWER_SPOTS: Record<string, V3> = { mic: [0, 0, 0.1], door: [1.6, 0, 1.0], window: [0, 0, -1.3] };
const TOWER_VIEWS: View[] = [{ name: "tower", pos: [0.5, 1.5, 2.6], look: [0, 1.3, -0.8], fov: 50, establishing: true }];
const novaTower = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 4.4, d: 3.6, h: 3.0, floor: floorMat(), wall: col("#2c3040"), trim: "#1d2030", openings: [{ wall: "back", at: 0, w: 2.6, h: 1.8, sill: 0.8, view: "city" }] });
  box(b, glow("nvTowerPane", () => ({ color: "#1b2438" })), I, -1.3, 1.3, 0.8, 2.6, -1.77, -1.76);
  for (let i = 0; i < 6; i++) { const y = 0.9 + Math.floor(i / 3) * 0.7, z = -1.2 + (i % 3) * 0.8; b.add(new THREE.PlaneGeometry(0.7, 0.45), new THREE.MeshBasicMaterial({ map: screenTex("tower"), toneMapped: false }), new THREE.Matrix4().makeTranslation(-2.17, y + 0.25, z).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2))); }
  rbox(b, col("#3a3d4a"), I, 0.9, 0, -0.5, 1.2, 0.76, 0.6, 0.02); sph(b, glow("nvOnAir", () => ({ color: "#ff3b30" })), I, 1.3, 0.82, -0.4, 0.05, 0.05, 0.05, 10);
  cyl(b, col("#22252c"), I, 0, 0, 0.55, 0.18, 0.18, 0.03, 16); cyl(b, col("#22252c"), I, 0, 0.03, 0.55, 0.015, 0.015, 1.38, 8);
  sph(b, col("#3a3d44"), I, 0, 1.45, 0.52, 0.05, 0.07, 0.05, 12);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: TOWER_SPOTS, views: TOWER_VIEWS };
};

// ---------------------------------------------------------------- inserts (9:16 cards)
type Ins = { n: number; draw: (g: CanvasRenderingContext2D, st: number) => void };
const vig = (g: CanvasRenderingContext2D, a = 0.55) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.3, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
const paper = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number) => { g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.fillStyle = "#ece6d6"; g.fillRect(-w / 2, -h / 2, w, h); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(-w / 2, -h / 2, w, h); g.restore(); };
const INSERTS: Record<string, Ins> = {
  // a thin wrist in a grey hoodie cuff, the grey plastic band: a number, no name
  wristband: { n: 1, draw: (g) => {
    g.fillStyle = "#3a3d42"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#e6c3a5"; g.beginPath(); g.roundRect(150, 380, 520, 260, 120); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();   // the wrist
    g.fillStyle = "#7d8087"; g.beginPath(); g.roundRect(-40, 330, 260, 360, 60); g.fill(); g.stroke();                                       // the cuff
    g.fillStyle = "#8f9399"; g.beginPath(); g.roundRect(330, 360, 200, 300, 30); g.fill(); g.stroke();                                         // the band
    g.fillStyle = "#c9ccd1"; g.fillRect(350, 450, 160, 120); g.fillStyle = INK; g.font = F(46); g.textAlign = "center"; g.fillText("G-4471", 430, 528);
    g.fillStyle = "#c9ccd1"; g.font = F(34); g.fillText("GREY · WARD 4", IW / 2, 820); vig(g);
  } },
  // Dad's photo pinned to the peeling wall
  dadPhoto: { n: 1, draw: (g) => {
    g.fillStyle = "#8f9297"; g.fillRect(0, 0, IW, IH); g.save(); g.translate(IW / 2, 600); g.rotate(-0.05);
    g.fillStyle = "#e8e2d4"; g.fillRect(-230, -300, 460, 560); g.fillStyle = "#9aa3ad"; g.fillRect(-200, -270, 400, 420); dadFace(g, 0, -60, 140);
    g.fillStyle = "#6c6f75"; g.font = F(40, "italic"); g.textAlign = "center"; g.fillText("Dad", 0, 220); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(-230, -300, 460, 560);
    g.fillStyle = "#c0392b"; g.beginPath(); g.arc(0, -290, 16, 0, 7); g.fill(); g.restore(); vig(g, 0.6);
  } },
  // the list of Greys to be taken; step 1: it burns
  list: { n: 2, draw: (g, st) => {
    g.fillStyle = "#1a1c22"; g.fillRect(0, 0, IW, IH); paper(g, 110, 220, 590, 860, 0.04);
    g.fillStyle = BLUE; g.font = F(52); g.textAlign = "center"; g.fillText("TO BE TAKEN", IW / 2, 330);
    g.fillStyle = INK; g.font = F(34, "normal"); g.textAlign = "left"; const r = rnd(3);
    for (let i = 0; i < 14; i++) g.fillText(`G-${(1000 + Math.floor(r() * 8999))}   WARD ${1 + Math.floor(r() * 6)}`, 180, 420 + i * 46);
    if (st >= 1) {
      const fl = g.createLinearGradient(0, 1100, 0, 500); fl.addColorStop(0, "rgba(255,120,30,0.95)"); fl.addColorStop(0.5, "rgba(255,190,60,0.7)"); fl.addColorStop(1, "rgba(255,200,80,0)");
      g.fillStyle = "#1a1c22"; g.beginPath(); g.moveTo(110, 1080); for (let x = 110; x <= 700; x += 40) g.lineTo(x, 900 - Math.abs(Math.sin(x * 0.05)) * 160); g.lineTo(700, 1080); g.fill();
      g.fillStyle = fl; for (let i = 0; i < 9; i++) { const x = 140 + i * 65; g.beginPath(); g.moveTo(x - 40, 1000); g.quadraticCurveTo(x, 720 - (i % 3) * 90, x + 40, 1000); g.fill(); }
    }
    vig(g);
  } },
  // the camp roster on a clipboard: Dad's photo, his number, CAMP 3
  roster: { n: 1, draw: (g) => {
    g.fillStyle = "#24262c"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#6b4a2a"; g.fillRect(90, 160, 630, 980); paper(g, 120, 230, 570, 880, 0);
    g.fillStyle = "#3a3d42"; g.fillRect(300, 140, 210, 70);
    g.fillStyle = BLUE; g.font = F(46); g.textAlign = "center"; g.fillText("WORK CAMP 3", IW / 2, 320);
    g.fillStyle = "#9aa3ad"; g.fillRect(180, 380, 220, 260); dadFace(g, 290, 500, 80); g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(180, 380, 220, 260);
    g.fillStyle = INK; g.font = F(36); g.textAlign = "left"; g.fillText("G-2208", 430, 450); g.font = F(30, "normal"); g.fillText("STATUS:", 430, 510); g.fillStyle = "#c0392b"; g.font = F(34); g.fillText("WORKING", 430, 560);
    g.fillStyle = "#5a5d63"; g.font = F(28, "normal"); for (let i = 0; i < 6; i++) g.fillRect(180, 720 + i * 60, 450, 10); vig(g, 0.5);
  } },
  // the Governor on a big screen
  governor: { n: 1, draw: (g) => { g.fillStyle = "#05070c"; g.fillRect(0, 0, IW, IH); g.save(); g.translate(30, 320); governorScreen(g, 750, 470); g.restore(); vig(g, 0.4); } },
  // the end card (silent): the vote
  endCard: { n: 1, draw: (g) => {
    g.fillStyle = "#05070a"; g.fillRect(0, 0, IW, IH); g.textAlign = "center";
    g.fillStyle = "#8b93a5"; g.font = F(30); g.fillText("WHAT IF… YOU COULD", IW / 2, 260); g.fillText("COMMAND ANYONE?", IW / 2, 304);
    g.fillStyle = "#e9edf5"; g.font = F(72); g.fillText("WOULD YOU", IW / 2, 470); g.fillText("DO IT?", IW / 2, 560);
    const opt = (x: number, n: string, a: string, c: string) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, 640, 300, 170, 30); g.fill(); g.fillStyle = "#ffffff"; g.font = F(80); g.fillText(n, x + 80, 755); g.font = F(46); g.fillText(a, x + 200, 745); };
    opt(90, "1", "YES", "#1f4fb8"); opt(IW - 390, "2", "NO", "#9c2a2a");
    g.fillStyle = "#8b93a5"; g.font = F(36); g.fillText("COMMENT 1 OR 2", IW / 2, 900);
  } },
};
const insertRig = (a: At, v = "wristband"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.wristband, texAt = (st: number) => stex(`nvIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(Math.max(0, Math.min(ins.n - 1, Math.ceil(step - 1e-3)))); } };
};

// ---------------------------------------------------------------- characters
const NOVA: Look = { name: "Nova", build: "petite", skin: "#e6c3a5", seed: 801, hair: { style: "bob", color: "#1f1a1d" }, top: { style: "hoodie", color: "#7d8087", accent: "#9aa0a8" }, legs: "#55585f", shoes: "#3a3c40" };
const PIP: Look = { name: "Pip", build: "kid", skin: "#f0d2b8", seed: 802, hair: { style: "ponytail", color: "#5a3a26" }, top: { style: "sweater", color: "#8a8d93" }, legs: "#6c6f75", shoes: "#3a3c40" };
const PIP_YELLOW: Look = { ...PIP, name: "Pip (yellow coat)", layer: { style: "longcoat", color: "#f2c14e" } };
const MUM: Look = { name: "Mum (Nova's)", build: "adult", skin: "#e2bc9c", seed: 803, hair: { style: "bun", color: "#3a2a22" }, top: { style: "dress", color: "#7b7f86" }, layer: { style: "apron", color: "#a3a7ad" }, legs: "#7b7f86", shoes: "#3a3c40" };
const DAD: Look = { name: "Dad (Nova's)", build: "lanky", skin: "#e0b898", seed: 804, hair: { style: "short", color: "#3a2e28" }, beard: { style: "full", color: "#3a2e28" }, top: { style: "shirt", color: "#6f737a" }, legs: "#55585f", shoes: "#3a3c40" };
const KAI: Look = { name: "Kai", build: "lanky", skin: "#b9825c", seed: 805, hair: { style: "curly", color: "#1b1512" }, top: { style: "hoodie", color: "#5f636a", accent: "#7d8087" }, legs: "#45484e", shoes: "#2a2c30" };
const GUARD: Look = { name: "Blue guard", build: "big", skin: "#e8c4a6", seed: 806, hair: { style: "buzz", color: "#2a2420" }, top: { style: "shirt", color: "#1f3f8a" }, layer: { style: "longcoat", color: "#173275", accent: GOLD }, hat: { style: "cap", color: "#173275", trim: GOLD }, legs: "#14224a", shoes: "#111318" };
const OFFICER: Look = { name: "Blue officer", build: "stout", skin: "#f0cfb2", seed: 807, hair: { style: "receding", color: "#6a5a4a" }, top: { style: "shirt", color: "#2a56b8" }, layer: { style: "blazer", color: "#1f3f8a", accent: GOLD }, legs: "#14224a", shoes: "#111318" };
const BLUE_MAN: Look = { name: "Blue man", build: "stout", skin: "#f3d6bd", seed: 808, hair: { style: "side", color: "#c9a25a" }, top: { style: "shirt", color: "#f4f0e6" }, layer: { style: "waistcoat", color: BLUE, accent: GOLD }, neck: { style: "bowtie", color: GOLD }, legs: "#1f3f8a", shoes: "#2a2320" };
const BLUE_WOMAN: Look = { name: "Blue woman", build: "tall", skin: "#f6dcc6", seed: 809, hair: { style: "long", color: "#e2c27a" }, top: { style: "dress", color: "#3a6ad8" }, legs: "#3a6ad8", shoes: GOLD };
const BLUE_KID: Look = { name: "Blue kid", build: "kid", skin: "#f6dcc6", seed: 810, hair: { style: "side", color: "#e2c27a" }, top: { style: "shirt", color: "#5a8ae8" }, layer: { style: "blazer", color: "#1f3f8a", accent: GOLD }, legs: "#1f3f8a", shoes: "#2a2320" };
const grey = (n: number, build: Look["build"], skin: string, hair: Look["hair"], c: string): Look => ({ name: `Grey ${n}`, build, skin, seed: 820 + n, hair, top: { style: "sweater", color: c }, legs: "#55585f", shoes: "#3a3c40" });

const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["dystopia", "what-if", "emotional"], tags });
const STREET_DESC = "the road runs along z (x -4..4) from the great wall across its end (z -32, 14 m high, its gate x -2.5..2.5) toward the camera side (z +14); pavements x +-4..+-6; terraced houses on both sides with fronts at x +-6; the bread shop on the left at z -4 (put breadShutter there); the warehouse (STORE 4) on the right at z -14; the Blues' gold towers beyond the wall. Spots queue1-4 (the bread queue on the left pavement), shop, mid, near, warehouse, gate, gateOut, far";

export const NOVA_THEME: Theme = {
  id: "nova", name: "What If… you could command anyone? (Nova: a walled town of Greys and Blues)",
  desc: "an emotional dystopia: a grey walled town where the government brands the poor 'Greys' and the rich 'Blues' live in gold towers beyond the wall; Nova's family's one-room home; the Blues' dining hall; the broadcast tower",
  tags: ["dystopia", "what-if", "emotional", "town", "wall", "night", "rain", "poverty", "supernatural"],
  mood: "drone",
  ambience: { novaStreet: "elb_river_rain", novaStreetDay: "amb_city_night", novaStreetFree: "amb_city_day", blueHall: "amb_room", novaHome: "elb_rain_window", novaHomeDay: "amb_room", novaTower: "elb_house_night" },
  steps: { novaStreet: "step_hard", novaStreetDay: "step_hard", novaStreetFree: "step_hard" },
  characters: { nova: NOVA, pip: PIP, pipYellow: PIP_YELLOW, novaMum: MUM, novaDad: DAD, kai: KAI, blueGuard: GUARD, blueOfficer: OFFICER, blueMan: BLUE_MAN, blueWoman: BLUE_WOMAN, blueKid: BLUE_KID,
    grey1: grey(1, "adult", "#d9b597", { style: "short", color: "#4a3a30" }, "#6c6f75"), grey2: grey(2, "stout", "#a8765a", { style: "bun", color: "#2a2420" }, "#7b7f86"), grey3: grey(3, "kid", "#e6c3a5", { style: "curly", color: "#3a2a22" }, "#8a8d93") },
  characterMeta: {
    nova: meta("Nova", "15; a dark bob; a grey hoodie; a grey wristband", "a Grey girl from nowhere who wakes up able to command anyone by saying her own name; everyone she commands forgets her", ["teen", "girl", "narrator", "hero"]),
    pip: meta("Pip", "8; a brown ponytail; a grey jumper", "Nova's little sister", ["child", "girl", "sister"]),
    pipYellow: meta("Pip (yellow coat)", "8; a brown ponytail; a bright yellow coat (the town freed)", "Nova's little sister at the end, who no longer knows her", ["child", "girl", "sister"]),
    novaMum: meta("Mum (Nova's)", "a tired woman; a bun; a grey dress and apron", "cleans the Blues' tables twelve hours a day", ["mother", "female", "worker"]),
    novaDad: meta("Dad (Nova's)", "thin; short dark hair and a beard; a grey shirt", "taken two winters ago to the Governor's work camp", ["father", "male", "prisoner"]),
    kai: meta("Kai", "15; dark curls; a grey hoodie", "Nova's best friend", ["teen", "boy", "friend"]),
    blueGuard: meta("Blue guard", "big; a blue greatcoat with gold trim and a cap", "a guard of the Blues", ["guard", "male", "uniform"]),
    blueOfficer: meta("Blue officer", "stout; a blue blazer with gold trim", "the officer at the bread shop", ["official", "male", "uniform"]),
    blueMan: meta("Blue man", "rich; a blue waistcoat, gold bow tie", "a Blue diner", ["rich", "male"]), blueWoman: meta("Blue woman", "rich; a blue dress, gold shoes", "a Blue diner", ["rich", "female"]), blueKid: meta("Blue kid", "rich; a blue blazer", "a Blue diner", ["rich", "child"]),
    grey1: meta("Grey 1", "a Grey man in a grey jumper", "an extra in the bread queue", ["extra", "male"]), grey2: meta("Grey 2", "a Grey woman in a grey jumper", "an extra in the bread queue", ["extra", "female"]), grey3: meta("Grey 3", "a Grey child in a grey jumper", "an extra in the bread queue", ["extra", "child"]),
  },
  props: {
    breadShutter: { name: "Bread shop shutter (Nova)", desc: "the bread shop's grey roller shutter on novaStreet* (absolute: x -5.95, z -5.2..-2.8, whatever `at` is). Variant down: open, it slams shut over its step; up: shut, it rolls up over its step (give one step)", category: "theme", themes: ["dystopia"], tags: ["shutter", "shop", "bread"], radius: 0.1, height: 2.8,
      build: () => undefined, rig: (_a, v) => shutterRig(v ?? "down"), steps: ["it moves"], stepCount: () => 1, variants: { down: () => undefined, up: () => undefined } },
    novaInsert: { name: "Close insert (Nova)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step. Variants: wristband (the grey band G-4471), dadPhoto, list (TO BE TAKEN; step 1: it burns), roster (WORK CAMP 3: Dad, WORKING), governor (the Governor on a screen: ORDER IS PEACE), endCard (WOULD YOU DO IT? 1 YES / 2 NO)", category: "theme", themes: ["dystopia", "insert"], tags: ["insert", "card", "close-up"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "wristband"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
  },
  sets: {
    novaStreet: { id: "novaStreet", title: "The Grey street at night: grey terraces, the bread shop, curfew lamps, the great wall with the Blues' gold towers beyond", lights: ["night"], build: () => novaStreet("night") },
    novaStreetDay: { id: "novaStreetDay", title: "The Grey street on a grey morning: the bread queue", lights: ["day"], build: () => novaStreet("day") },
    novaStreetFree: { id: "novaStreetFree", title: "The street freed: painted houses, bunting, the gate in the wall wide open", lights: ["day", "golden"], build: () => novaStreet("free") },
    blueHall: { id: "blueHall", title: "The Blues' dining hall: gold walls, a long table of food, a chandelier", lights: ["interior"], build: () => blueHall() },
    novaHome: { id: "novaHome", title: "Nova's home at night: one cold room, two mattresses, Dad's photo, the kitchen corner, a small screen", lights: ["night", "interiorCool"], build: () => novaHome("night") },
    novaHomeDay: { id: "novaHomeDay", title: "Nova's home by day", lights: ["interiorCool", "interior"], build: () => novaHome("day") },
    novaTower: { id: "novaTower", title: "The broadcast tower: the microphone, a wall of screens, the window over the town", lights: ["night", "interiorCool"], build: () => novaTower() },
  },
  layouts: { novaStreet: { spots: STREET_SPOTS, views: STREET_VIEWS }, novaStreetDay: { spots: STREET_SPOTS, views: STREET_VIEWS }, novaStreetFree: { spots: STREET_SPOTS, views: STREET_VIEWS }, blueHall: { spots: HALL_SPOTS, views: HALL_VIEWS }, novaHome: { spots: HOME_SPOTS, views: HOME_VIEWS }, novaHomeDay: { spots: HOME_SPOTS, views: HOME_VIEWS }, novaTower: { spots: TOWER_SPOTS, views: TOWER_VIEWS } },
  setMeta: {
    novaStreet: { name: "Grey street (night)", desc: STREET_DESC, themes: ["dystopia"], tags: ["street", "night", "rain", "wall", "town"] },
    novaStreetDay: { name: "Grey street (morning)", desc: "a grey morning: " + STREET_DESC, themes: ["dystopia"], tags: ["street", "day", "queue", "wall", "town"] },
    novaStreetFree: { name: "The street freed", desc: "painted houses, bunting, the gate wide open with daylight pouring through: " + STREET_DESC, themes: ["dystopia", "hope"], tags: ["street", "day", "free", "gate", "town"] },
    blueHall: { name: "The Blues' dining hall", desc: "6.4 x 5 m, open toward +z: gold walls, a long table at z -0.9 with food, four chairs behind it (spots seat1-4, mode sit, facing the camera), Mum's spot clean at the table's right end, front", themes: ["dystopia"], tags: ["hall", "dining", "rich", "gold"] },
    novaHome: { name: "Nova's home (night)", desc: "3.6 x 3.2 m, open toward +z: two mattresses on the floor along the back wall (spots novaBed / pipBed: sitting; novaAsleep / pipAsleep: lying, head above the blanket), Dad's photo on the left wall, the kitchen corner on the right (spot sink), a small screen on a crate (spot screen), door", themes: ["dystopia", "home"], tags: ["home", "bedroom", "kitchen", "poor", "night"] },
    novaHomeDay: { name: "Nova's home (day)", desc: "by day: 3.6 x 3.2 m one-room home, two mattresses, Dad's photo, the kitchen corner (spot sink)", themes: ["dystopia", "home"], tags: ["home", "kitchen", "poor", "day"] },
    novaTower: { name: "The broadcast tower", desc: "4.4 x 3.6 m, open toward +z: the microphone on its stand (spot mic, at the front, z 0.55), a wall of screens (left), the big window over the town (back), a desk with an ON AIR light", themes: ["dystopia"], tags: ["broadcast", "tower", "microphone", "night"] },
  },
};
