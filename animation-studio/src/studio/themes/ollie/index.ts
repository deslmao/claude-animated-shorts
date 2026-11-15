// What Ollie Says at 3 A.M. theme (productions/what-ollie-says): a five-part horror mini-series. Built in stages;
// stage 1 is the roof sequence (episode 4 beats 15-18, both finales) for the owner's visual test.
// Reused from the base library: kit primitives, grass / concrete / dirt paints, curtains, fences, trees, houses (the
// neighbours), the night light preset.
// New here (stage 1):
//   set ferryBack: the back of 4 Ferry Lane at night: the kitchen extension and its flat felt roof with a 30 cm
//     brick upstand, Kate and Mark's bedroom behind the open sash window above it, Ollie's and Ava's windows, the
//     patio, the garden down to a low fence and gate, the river path, the river and the far bank, the neighbours
//   props ferryWater (the river and the flood: variants river / lawn / high), rain (falling rain around the camera,
//     a seeded, deterministic clock: give it steady steps)
//   characters kate (asleep: eyes open, set `blink: false` in shots), ava, ollie, mark
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { Batch, quadUp } from "../../materials/geo";
import { grassHD } from "../../materials/paint";
import { concreteHD, dirtHD } from "../../materials/paint2";
import { At, col, tex, glow, box, rbox, cyl, sph } from "../../props/kit";
import { house } from "../../props/outdoor";
import { tree, fence } from "../../props/nature";
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
const hash = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- textures
const brickTex = () => stex("olBrick", 512, 512, (g) => {
  g.fillStyle = "#8d7b6a"; g.fillRect(0, 0, 512, 512); const r = rnd(21), bw = 64, bh = 22;
  for (let y = 0, row = 0; y < 512; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < 512; x += bw) { const t = r(); g.fillStyle = t > 0.66 ? "#9a5a40" : t > 0.33 ? "#8a4e38" : "#a5644a"; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
});
const feltTex = () => stex("olFelt", 256, 256, (g) => {
  g.fillStyle = "#3a3d42"; g.fillRect(0, 0, 256, 256); const r = rnd(5);
  for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.12)"; g.fillRect(r() * 256, r() * 256, 2, 2); }
  for (let y = 0; y < 256; y += 64) { g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(0, y, 256, 3); }       // the felt's lapped seams
  for (let i = 0; i < 14; i++) { g.fillStyle = "rgba(170,190,205,0.18)"; g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 22, 4 + r() * 8, 0, 0, 7); g.fill(); } // rain puddles
});
const copingTex = () => stex("olCoping", 256, 64, (g) => { g.fillStyle = "#a9a49a"; g.fillRect(0, 0, 256, 64); g.fillStyle = "rgba(0,0,0,0.2)"; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 2, 64); });
const wallpaperTex = () => stex("olKateWall", 256, 256, (g) => {
  g.fillStyle = "#b9a58e"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "rgba(120,90,70,0.35)"; g.lineWidth = 3;
  for (let x = 16; x < 256; x += 32) { g.beginPath(); for (let y = 0; y <= 256; y += 8) g.lineTo(x + Math.sin(y / 20) * 4, y); g.stroke(); }
});
const carpetTex = () => stex("olCarpet", 128, 128, (g) => { g.fillStyle = "#6d6157"; g.fillRect(0, 0, 128, 128); const r = rnd(9); for (let i = 0; i < 600; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.08)"; g.fillRect(r() * 128, r() * 128, 2, 2); } });
/** night water: dark grey-brown with ripples and a few lamp glints */
const waterTex = () => stex("olWater", 512, 512, (g) => {
  g.fillStyle = "#33474c"; g.fillRect(0, 0, 512, 512); const r = rnd(33);
  for (let i = 0; i < 260; i++) { const x = r() * 512, y = r() * 512, w = 20 + r() * 70; g.strokeStyle = `rgba(150,176,180,${0.25 + r() * 0.35})`; g.lineWidth = 2 + r() * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 3, x + w, y); g.stroke(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(240,215,160,${0.35 + r() * 0.4})`; g.fillRect(r() * 512, r() * 512, 10 + r() * 24, 2.5); }
});

// ---------------------------------------------------------------- set: ferryBack
// The back of 4 Ferry Lane faces +z at z = 0, x -3..3 (two floors, eaves 5.6). The kitchen extension: x -3..0.6,
// z 0..3.4, walls 2.6 high, a flat felt roof at y 2.72 with a 30 cm brick upstand (top 3.02, coping) on its open
// edges. Kate and Mark's bedroom is behind the rear wall over the extension (floor 2.8, x -3..0.6, z -3.6..0); its sash
// window (x -1.75..-0.65, sill 3.22, head 4.7) is open, lower sash up, onto the roof (0.5 m above the felt). Ollie's
// window x 0.75..1.55, Ava's x 1.95..2.75 (upstairs, sills 3.3). The patio z 3.4..5.2, the lawn to the low back fence at
// z 21 (the gate at x 0.5..1.5), the river path z 21..23.5, the river beyond, the far bank and willows from z 46.
export const ROOF_Y = 2.72, UPSTAND_TOP = 3.02, EXT = { x0: -3, x1: 0.6, z1: 3.4 }, ROOM_FLOOR = 2.8;
export const KATE_WIN = { x0: -1.75, x1: -0.65, sill: 3.22, head: 4.7 };
const FERRY_SPOTS: Record<string, V3> = {
  roofEdge: [-1.05, ROOF_Y, 3.0], roofEdgeOllie: [-0.55, ROOF_Y, 3.0], roofWindow: [-1.05, ROOF_Y, 0.55], roofMid: [-1.0, ROOF_Y, 1.9],
  roofWall: [-1.25, ROOF_Y, 0.35], roomWindow: [-1.2, ROOM_FLOOR, -0.45], roomBed: [-1.9, ROOM_FLOOR, -2.4], roomDoor: [0.1, ROOM_FLOOR, -3.0],
  patio: [-0.2, 0, 4.4], lawn: [0, 0, 11], gate: [1.0, 0, 20.6],
};
const FERRY_VIEWS: View[] = [
  { name: "garden", pos: [2.4, 4.4, 15.5], look: [-0.8, 3.0, 1.5], fov: 45, establishing: true },
  { name: "fromWindow", pos: [-1.25, 3.55, -0.3], look: [-0.9, 3.0, 4.5], fov: 52 },
  { name: "roof", pos: [0.3, 3.6, 2.7], look: [-1.1, 3.75, 0.6], fov: 55 },
  { name: "room", pos: [-0.2, 3.95, -3.1], look: [-1.2, 3.6, 0.5], fov: 55, establishing: true },
];
const wallWithHoles = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, holes: [number, number, number, number][], brickSized = true) => {
  const xs = [...new Set([x0, x1, ...holes.flatMap((h) => [h[0], h[1]])])].sort((p, q) => p - q), ys = [...new Set([y0, y1, ...holes.flatMap((h) => [h[2], h[3]])])].sort((p, q) => p - q);
  for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < ys.length; j++) {
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
    if (holes.some((h) => cx > h[0] && cx < h[1] && cy > h[2] && cy < h[3])) continue;
    const w = xs[i + 1] - xs[i], h = ys[j + 1] - ys[j];
    box(b, brickSized ? tex(`olBrick_${w.toFixed(2)}_${h.toFixed(2)}`, brickTex, w / 1.72, h / 1.72) : mat, m, xs[i], xs[i + 1], ys[j], ys[j + 1], z0, z1);
  }
};
/** a sash window frame in a wall opening facing +z at z (frame 7 cm, sill below); open = the lower sash pushed up */
const sash = (b: Batch, I: THREE.Matrix4, x0: number, x1: number, y0: number, y1: number, z: number, open: boolean, lit = false) => {
  const w = col("#ece6da"), glass = lit ? glow("olGlassLit", () => ({ color: "#f3c98a" })) : col("#1b2230"), mid = (y0 + y1) / 2;
  box(b, w, I, x0 + 0.005, x0 + 0.07, y0, y1, z - 0.12, z + 0.02); box(b, w, I, x1 - 0.07, x1 - 0.005, y0, y1, z - 0.12, z + 0.02); box(b, w, I, x0 + 0.005, x1 - 0.005, y1 - 0.07, y1 - 0.005, z - 0.12, z + 0.02); // inside the opening (never flush with the brick)
  box(b, col("#d9d2c4"), I, x0 - 0.1, x1 + 0.1, y0 - 0.05, y0 + 0.012, z - 0.14, z + 0.08);                       // the sill (1 cm proud of the brick)
  const top = open ? y1 : mid, sashes: [number, number][] = open ? [[mid + 0.05, y1]] : [[y0, mid], [mid, y1]];
  for (const [s0, s1] of sashes) { box(b, w, I, x0, x1, s0, s0 + 0.05, z - 0.08, z - 0.04); box(b, w, I, x0, x1, s1 - 0.05, s1, z - 0.08, z - 0.04); box(b, w, I, (x0 + x1) / 2 - 0.02, (x0 + x1) / 2 + 0.02, s0, s1, z - 0.08, z - 0.04); }
  if (!open || lit) box(b, glass, I, x0 + 0.07, x1 - 0.07, open ? mid + 0.06 : y0 + 0.005, top - 0.005, z - 0.07, z - 0.065);
  else box(b, glass, I, x0 + 0.07, x1 - 0.07, mid + 0.06, y1 - 0.075, z - 0.07, z - 0.065);  // the glass inside the frame, never flush with a rail
};
const ferryBack = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4(), brick = tex("olBrickW", brickTex, 2, 2);
  // ground: our lawn and patio, the neighbours' lawns, the river path, the river bed, the far bank
  b.add(quadUp(-3.2, 3.2, 5.2, 21, 4, 10, 0.0), tex("olGrass", grassHD, 1, 1));
  b.add(quadUp(-3.2, 3.2, EXT.z1, 5.2, 4, 1, 0.01), tex("olPatio", () => concreteHD("#8f8a82"), 1, 1));
  for (const [x0, x1] of [[-40, -3.2], [3.2, 40]] as const) b.add(quadUp(x0, x1, 0, 21, 20, 10, 0.0), tex("olGrassN", grassHD, 1, 1));
  b.add(quadUp(-40, 40, 21, 23.5, 30, 2, 0.0), tex("olPath", dirtHD, 1, 1));
  box(b, tex("olBank", dirtHD, 8, 0.5), I, -40, 40, -1.4, 0, 23.5, 23.6); b.add(quadUp(-60, 60, 23.6, 46, 10, 4, -1.4), col("#14181a"));
  b.add(quadUp(-60, 60, 46, 90, 30, 20, 0.2), tex("olGrassFar", grassHD, 1, 1)); box(b, tex("olBankF", dirtHD, 8, 0.5), I, -60, 60, -1.4, 0.2, 45.9, 46);
  // fences: the two sides and the low back fence with its gate (open gap x 0.5..1.5, the gate leaf ajar)
  for (const s of [-1, 1]) fence(b, { x: s * 3.25, z: 10.4, yaw: Math.PI / 2 }, 20.7, 1.6, "#6a5040");          // stops short of the back fence
  fence(b, { x: -1.35, z: 21, yaw: 0 }, 3.7, 1.0, "#7a5a44"); fence(b, { x: 2.35, z: 21, yaw: 0 }, 1.7, 1.0, "#7a5a44");
  box(b, col("#7a5a44"), new THREE.Matrix4().makeTranslation(1.5, 0, 21).multiply(new THREE.Matrix4().makeRotationY(-0.6)), -0.95, 0, 0.1, 0.95, -0.03, 0.03);
  // the house: rear wall with Kate's, Ollie's and Ava's windows upstairs and the dining window beside the extension
  wallWithHoles(b, brick, I, -3, 3, 0, 5.6, -0.25, 0, [[KATE_WIN.x0, KATE_WIN.x1, KATE_WIN.sill, KATE_WIN.head], [0.75, 1.55, 3.3, 4.6], [1.95, 2.75, 3.3, 4.6], [1.2, 2.4, 0.9, 2.1]]);
  sash(b, I, KATE_WIN.x0, KATE_WIN.x1, KATE_WIN.sill, KATE_WIN.head, 0.0, true);
  sash(b, I, 0.75, 1.55, 3.3, 4.6, 0.0, false); sash(b, I, 1.95, 2.75, 3.3, 4.6, 0.0, false); sash(b, I, 1.2, 2.4, 0.9, 2.1, 0.0, false);
  b.add(new THREE.PlaneGeometry(0.8, 1.3), glow("olAvaGlow", () => ({ color: "#d9a7c7", transparent: true, opacity: 0.55 })), new THREE.Matrix4().makeTranslation(2.35, 3.95, -0.06)); // Ava's fairy lights
  box(b, col("#4a2f28"), I, -3.15, 3.15, 5.6, 5.75, -0.4, 0.2);                                                       // eaves board / gutter
  const roof = col("#3b3f47");
  for (const s of [-1, 1]) box(b, roof, new THREE.Matrix4().makeTranslation(0, 5.6, -3.2).multiply(new THREE.Matrix4().makeRotationX(s * 0.52)), -3.2, 3.2, 0, 0.12, s > 0 ? -3.7 : 0, s > 0 ? 0 : 3.7);
  box(b, col("#5d4038"), I, -2.4, -1.9, 5.6, 7.6, -3.4, -2.9); box(b, col("#5d4038"), I, 1.9, 2.4, 5.6, 7.6, -3.4, -2.9);  // chimneys
  box(b, col("#e9e6df"), I, 2.75, 2.95, 2.55, 2.7, 0.0, 0.18); sph(b, col("#1a1c20"), I, 2.85, 2.6, 0.19, 0.03, 0.03, 0.02, 10); // the garden camera under the eave line
  // the kitchen extension: walls, back door and kitchen window (dark), the flat felt roof, the brick upstand, coping
  wallWithHoles(b, brick, I, EXT.x0, EXT.x1, 0, 2.6, EXT.z1 - 0.2, EXT.z1, [[-0.55, 0.35, 0, 2.05], [-2.5, -1.2, 0.95, 2.05]]);
  wallWithHoles(b, brick, I, EXT.x1 - 0.2, EXT.x1, 0, 2.6, 0, EXT.z1 - 0.2, []);
  wallWithHoles(b, brick, I, EXT.x0, EXT.x0 + 0.2, 0, 2.6, 0, EXT.z1 - 0.2, []);
  box(b, col("#121722"), I, EXT.x0 + 0.2, EXT.x1 - 0.2, 0, 2.6, 0.02, 0.1);                                           // the dark kitchen inside
  box(b, col("#2f3c52"), I, -0.55, 0.35, 0, 2.05, EXT.z1 - 0.16, EXT.z1 - 0.1); box(b, col("#1b2230"), I, -0.4, 0.2, 1.1, 1.9, EXT.z1 - 0.1, EXT.z1 - 0.09); // back door + its glass
  box(b, col("#c9a74a"), I, -0.48, -0.42, 1.92, 2.0, EXT.z1 - 0.1, EXT.z1 - 0.06);                                    // the top bolt
  sash(b, I, -2.5, -1.2, 0.95, 2.05, EXT.z1, false);
  box(b, tex("olFeltR", feltTex, 2, 2), I, EXT.x0, EXT.x1, 2.6, ROOF_Y, 0, EXT.z1);
  const up = tex("olBrickU", brickTex, 2, 0.17), cop = tex("olCop", copingTex, 4, 1);
  box(b, up, I, EXT.x0, EXT.x1, ROOF_Y, UPSTAND_TOP, EXT.z1 - 0.2, EXT.z1); box(b, cop, I, EXT.x0 - 0.02, EXT.x1 + 0.02, UPSTAND_TOP, UPSTAND_TOP + 0.05, EXT.z1 - 0.23, EXT.z1 + 0.03);
  box(b, up, I, EXT.x1 - 0.2, EXT.x1, ROOF_Y, UPSTAND_TOP, 0, EXT.z1 - 0.2); box(b, cop, I, EXT.x1 - 0.23, EXT.x1 + 0.03, UPSTAND_TOP, UPSTAND_TOP + 0.05, 0, EXT.z1 - 0.2);
  box(b, up, I, EXT.x0, EXT.x0 + 0.2, ROOF_Y, UPSTAND_TOP, 0, EXT.z1 - 0.2); box(b, cop, I, EXT.x0 - 0.03, EXT.x0 + 0.23, UPSTAND_TOP, UPSTAND_TOP + 0.05, 0, EXT.z1 - 0.2);
  cyl(b, col("#2a2c30"), I, 0.45, 0, EXT.z1 + 0.06, 0.05, 0.05, 2.7, 10);                                             // the rainwater pipe
  // Kate and Mark's bedroom behind the open window: walls, floor, ceiling, the bed, the bedside lamp (lit), curtains
  const wp = tex("olKateWP", wallpaperTex, 2, 1);
  wallWithHoles(b, wp, I, -3, 0.6, ROOM_FLOOR, 5.4, -0.27, -0.25, [[KATE_WIN.x0, KATE_WIN.x1, KATE_WIN.sill, KATE_WIN.head]], false); // the wall's inside face: wallpaper, not brick
  box(b, wp, I, -3, 0.6, ROOM_FLOOR, 5.4, -3.62, -3.6); box(b, wp, I, -3.02, -3, ROOM_FLOOR, 5.4, -3.6, -0.25); box(b, wp, I, 0.6, 0.62, ROOM_FLOOR, 5.4, -3.6, -0.25);
  box(b, tex("olCarpetR", carpetTex, 3, 3), I, -3, 0.6, ROOM_FLOOR - 0.05, ROOM_FLOOR, -3.6, -0.25); box(b, col("#e8e2d6"), I, -3, 0.6, 5.4, 5.45, -3.6, -0.25);
  box(b, col("#e8e2d6"), I, -2.99, 0.59, ROOM_FLOOR, 2.92, -0.295, -0.272);                                           // skirting under the window
  rbox(b, col("#6b4e3a"), I, -1.95, ROOM_FLOOR, -2.35, 1.6, 0.42, 2.1, 0.04); rbox(b, col("#d8d3e2"), I, -1.95, ROOM_FLOOR + 0.42, -2.25, 1.56, 0.18, 1.8, 0.08); // the bed and its duvet (thrown back)
  rbox(b, col("#efeae0"), I, -2.35, ROOM_FLOOR + 0.55, -3.25, 0.55, 0.14, 0.35, 0.06); rbox(b, col("#efeae0"), I, -1.55, ROOM_FLOOR + 0.55, -3.25, 0.55, 0.14, 0.35, 0.06);
  rbox(b, col("#6b4e3a"), I, -0.55, ROOM_FLOOR, -3.25, 0.45, 0.55, 0.4, 0.03); cyl(b, col("#c9b38a"), I, -0.55, ROOM_FLOOR + 0.55, -3.25, 0.06, 0.08, 0.3, 12);
  sph(b, glow("olLamp", () => ({ color: "#ffd59a" })), I, -0.55, ROOM_FLOOR + 0.98, -3.25, 0.17, 0.13, 0.17, 16);
  // curtains blown into the room on both sides of the window (cloth panels angled in from the frame)
  const cloth = col("#b58f6e");
  for (const [x, ang] of [[KATE_WIN.x0 + 0.05, -0.75], [KATE_WIN.x1 - 0.05, 0.75]] as const)
    rbox(b, cloth, new THREE.Matrix4().makeTranslation(x, KATE_WIN.sill - 0.35, -0.42).multiply(new THREE.Matrix4().makeRotationY(ang)), 0, 0, -0.16, 0.34, 1.95, 0.05, 0.02); // blown into the room
  cyl(b, col("#3a3d47"), I, (KATE_WIN.x0 + KATE_WIN.x1) / 2 - 0.85, KATE_WIN.head + 0.18, -0.3, 0.015, 0.015, 1.7, 8, 0, -Math.PI / 2);
  // the neighbours (their backs face the gardens too), a shed, the garden lamp, willows on the far bank
  house(b, { x: -6.05, z: -4, yaw: 0 }, 6, 8, 5.6, 2, 0); house(b, { x: 6.05, z: -4, yaw: 0 }, 6, 8, 5.6, 4, 1);
  box(b, col("#36483a"), I, 1.7, 3.0, 0, 2.0, 12, 13.6); box(b, col("#2a2f33"), I, 1.6, 3.1, 2.0, 2.15, 11.9, 13.7);
  cyl(b, col("#2a2d33"), I, 2.6, 0, 5.4, 0.04, 0.04, 1.55, 10); sph(b, glow("olGardenLamp", () => ({ color: "#ffcf8a" })), I, 2.6, 1.62, 5.4, 0.1, 0.12, 0.1, 14);
  const r = rnd(77);
  for (let i = 0; i < 16; i++) tree(b, i % 3 === 0 ? "tall" : "round", -36 + i * 4.6 + r() * 1.5, 0.2, 48 + r() * 6, 5 + r() * 3, i + 3);
  tree(b, "hedge", -3.25, 0, 0.5, 1.6, 4, 0);
  b.build(root, true);
  // the warm practicals (point lights barely register in the toon look): the lit room seen through the window, the
  // lamp's glow on the back wall, and the window's light spilling across the wet felt
  const soft = (key: string, c: string, a0: number) => stex(key, 128, 128, (g) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, c.replace("A", String(a0))); r.addColorStop(1, c.replace("A", "0")); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const warm = (key: string, a0: number) => new THREE.MeshBasicMaterial({ map: soft(key, "rgba(255,196,120,A)", a0), transparent: true, depthWrite: false, toneMapped: false });
  const glowAt = (mat: THREE.Material, w: number, h: number, m: THREE.Matrix4) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); q.applyMatrix4(m); q.layers.set(NOINK); root.add(q); };
  glowAt(warm("olSpill", 0.42), 1.9, 2.6, new THREE.Matrix4().makeTranslation((KATE_WIN.x0 + KATE_WIN.x1) / 2, ROOF_Y + 0.012, 1.15).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)));
  glowAt(warm("olRoomGlow", 0.5), 3.4, 2.4, new THREE.Matrix4().makeTranslation(-1.0, 4.0, -3.55));
  for (const x of [-2.35, -0.05]) glowAt(warm("olWinWall", 0.6), 1.2, 2.2, new THREE.Matrix4().makeTranslation(x, 4.0, -0.29).multiply(new THREE.Matrix4().makeRotationY(Math.PI))); // the lamp-lit window wall beside the opening (never over it)
  glowAt(warm("olLampGlow", 0.75), 1.4, 1.2, new THREE.Matrix4().makeTranslation(-0.55, ROOM_FLOOR + 1.0, -3.5));
  // practical light: Kate's lamp spilling out of the window onto the wet roof, the garden lamp
  const lamp = new THREE.PointLight("#ffbf7a", 3.2, 7.5, 1.6); lamp.position.set(-0.9, 4.0, -1.4); root.add(lamp);
  const glamp = new THREE.PointLight("#ffcf8a", 1.6, 9, 1.6); glamp.position.set(2.6, 1.8, 5.4); root.add(glamp);
  return { root, env: { clouds: false }, spots: FERRY_SPOTS, views: FERRY_VIEWS };
};

// ---------------------------------------------------------------- props
/** ferryWater: the river and the flood at night (dark, rippling, lamp glints), absolute in ferryBack whatever `at` is.
 *  Variants: river (the river only, 1.1 m below the path), lawn (over the path and the bottom of the lawn, from z 15),
 *  high (episode 4: over the lawn from z 11, at the shed). Steady steps make the surface flow. */
const WATER: Record<string, { y: number; z0: number }> = { river: { y: -1.1, z0: 23.5 }, lawn: { y: 0.04, z0: 15 }, high: { y: 0.06, z0: 11 } };
const waterRig = (a: At, v = "river"): PropRig => {
  const root = rigRoot(a), w = WATER[v] ?? WATER.river, t = waterTex().clone(); t.repeat.set(12, 9); t.needsUpdate = true;
  const len = 120 - w.z0, m = new THREE.Mesh(new THREE.PlaneGeometry(140, len).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: t, color: "#9fb1b4", emissive: "#ffffff", emissiveMap: t, emissiveIntensity: 0.9 }));
  m.position.set(-a.x, w.y - (a.y ?? 0), w.z0 + len / 2 - a.z); m.receiveShadow = true; root.add(m);  // absolute in the set, whatever `at` is
  return { root, update: ({ step = 0 }) => { t.offset.set(step * 0.004, -step * 0.012); } };
};
/** rain: streaks falling around the camera (radius 1.2-15 m), never inside the house (z < 0.05). Deterministic: the
 *  clock is the step (steady steps 0.15 s apart = 0.15 s per step). */
const RAIN_N = 1500;
const rainRig = (a: At): PropRig => {
  const root = rigRoot(a), geo = new THREE.PlaneGeometry(0.011, 0.55), mat = new THREE.MeshBasicMaterial({ color: "#c9d6e2", transparent: true, opacity: 0.34, depthWrite: false, toneMapped: false });
  const im = new THREE.InstancedMesh(geo, mat, RAIN_N); im.frustumCulled = false; im.layers.set(NOINK); root.add(im);
  const o = new THREE.Object3D(), H = 9;
  return { root, update: ({ step = 0, camPos }) => {
    const time = step * 0.15, cx = camPos.x - a.x, cy = camPos.y - (a.y ?? 0), cz = camPos.z - a.z;
    for (let i = 0; i < RAIN_N; i++) {
      const rr = 1.2 + hash(i, 1) * 13.8, ang = hash(i, 2) * Math.PI * 2, x = cx + Math.cos(ang) * rr, z = cz + Math.sin(ang) * rr;
      const y = cy + 4.5 - ((hash(i, 3) * H + time * 8.5) % H);
      if (z < 0.05) { o.position.set(0, -500, 0); } else o.position.set(x, y, z);
      o.rotation.set(0, Math.atan2(cx - x, cz - z), 0.1); o.updateMatrix(); im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
  } };
};

// ---------------------------------------------------------------- characters
// Kate (Katarzyna): 38, dark curls, pale, an oatmeal cardigan over a long grey nightdress, barefoot; the scar is an
// insert. Ava: 15, brown ponytail, oversized grey hoodie, navy pyjama bottoms, socks. Ollie: 6, dark curls (Kate's),
// green dinosaur pyjamas (stripes stand in for the print), barefoot. Mark: 42, sandy hair, water-company hi-vis.
const KATE: Look = { name: "Kate", build: "adult", skin: "#f0d2b8", seed: 501, hair: { style: "curly", color: "#2a1d17" },
  top: { style: "dress", color: "#8e939b" }, layer: { style: "cardigan", color: "#d6c6a2" }, legs: "#f0d2b8", shoes: "#f0d2b8" };
const AVA: Look = { name: "Ava", build: "petite", skin: "#f3cfb2", seed: 502, hair: { style: "ponytail", color: "#5c3d27" },
  top: { style: "hoodie", color: "#8b9098", accent: "#f2c94c" }, legs: "#2a3350", shoes: "#dcd7cf" };
const OLLIE: Look = { name: "Ollie", build: "kid", skin: "#f0d2b8", seed: 503, hair: { style: "curly", color: "#2a1d17" },
  top: { style: "stripes", color: "#5e8f3c", accent: "#9cc46a" }, legs: "#5e8f3c", shoes: "#f0d2b8" };
const MARK: Look = { name: "Mark", build: "stout", skin: "#e9bf9b", seed: 504, hair: { style: "short", color: "#b08a58" },
  top: { style: "shirt", color: "#2b3954" }, layer: { style: "blazer", color: "#e2dc3c", accent: "#2b3954" }, legs: "#2b2f3a", shoes: "#2a2320" };

export const OLLIE_THEME: Theme = {
  id: "ollie", name: "What Ollie Says at 3 A.M. (4 Ferry Lane, a house by a river)",
  desc: "a horror mini-series at night in a family house by a flooding river: the back of the house with the kitchen extension's flat roof under the parents' open bedroom window, the garden down to the river, rain, the flood; the Harper family",
  tags: ["horror", "night", "home", "family", "river", "flood", "rain", "sleepwalking"],
  mood: "hush",
  ambience: { "ferryBack:night": "amb_storm", ferryBack: "amb_storm" },
  steps: { ferryBack: "step_stone" },
  characters: { kate: KATE, ava: AVA, ollie: OLLIE, mark: MARK },
  characterMeta: {
    kate: { name: "Kate Harper", desc: "38; dark curls; pale; an oatmeal cardigan over a long grey nightdress; barefoot", personality: "a mother who relives the night of a flood in her sleep (What Ollie Says at 3 A.M.); asleep, her eyes stay open (blink: false)", themes: ["horror", "home", "family"], tags: ["mother", "female", "sleepwalker"] },
    ava: { name: "Ava Harper", desc: "15; brown ponytail; an oversized grey hoodie; navy pyjama bottoms; socks", personality: "the big sister who investigates and protects her brother (What Ollie Says at 3 A.M.)", themes: ["horror", "home", "family"], tags: ["teen", "girl", "sister"] },
    ollie: { name: "Ollie Harper", desc: "6; dark curls; green dinosaur pyjamas; barefoot at night", personality: "a little boy who says his mother's words at 3 a.m. to keep her out of the water (What Ollie Says at 3 A.M.)", themes: ["horror", "home", "family"], tags: ["child", "boy", "brother"] },
    mark: { name: "Mark Harper", desc: "42; stocky; sandy hair; a yellow water-company hi-vis over a navy shirt", personality: "a kind, tired father on night shifts (What Ollie Says at 3 A.M.)", themes: ["home", "family", "work"], tags: ["father", "male", "hi-vis"] },
  },
  props: {
    ferryWater: { name: "River and flood (night)", desc: "the river behind 4 Ferry Lane and its flood, dark rippling water with lamp glints, placed absolutely in ferryBack whatever `at` is (put `at` where the shot looks); variants river (in its bed), lawn (over the bottom of the garden from z 15), high (over the lawn from z 11); steady steps make it flow", category: "theme", themes: ["horror", "night", "flood"], tags: ["water", "river", "flood"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => waterRig(a, v ?? "river"), steps: ["it flows"], stepCount: () => 2000, variants: { lawn: () => undefined, high: () => undefined } },
    rain: { name: "Rain (falling, around the camera)", desc: "heavy rain: thin streaks falling all round the camera (1.2-15 m), never inside the house at 4 Ferry Lane (z < 0.05); camera-relative, so `at` can be any point in the shot (its look point); give it steady steps 0.15 s apart (its clock)", category: "theme", themes: ["night", "weather", "horror"], tags: ["rain", "weather", "storm"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => rainRig(a), steps: ["it falls"], stepCount: () => 2000 },
  },
  sets: { ferryBack: { id: "ferryBack", title: "4 Ferry Lane, the back at night: the kitchen extension's flat roof under the open bedroom window, the garden down to the river", lights: ["night"], build: ferryBack } },
  layouts: { ferryBack: { spots: FERRY_SPOTS, views: FERRY_VIEWS } },
  setMeta: { ferryBack: { name: "4 Ferry Lane (back, night)", desc: "the house's rear wall faces +z at z 0 (x -3..3). The kitchen extension x -3..0.6, z 0..3.4, its flat felt roof at y 2.72 with a 30 cm brick upstand (top 3.02) on the open edges; actors stand on the roof at y 2.72 (spots roofEdge, roofEdgeOllie, roofWindow, roofMid, roofWall). Kate and Mark's bedroom behind the open sash window (x -1.75..-0.65, sill 3.22), floor 2.8 (spots roomWindow, roomBed, roomDoor). Patio z 3.4..5.2, lawn to the back fence and gate at z 21, river beyond; add ferryWater for the water and rain for the weather", themes: ["horror", "home", "night", "river"], tags: ["house", "garden", "roof", "river", "flood", "bedroom", "window"] } },
};
