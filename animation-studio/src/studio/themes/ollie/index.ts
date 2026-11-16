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
import { buildRoom } from "../../sets/room";
import { At, col, tex, glow, box, rbox, cyl, sph } from "../../props/kit";
import { floorMat, counter, fridge, stove, chair } from "../../props/interior";
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
  box(b, col("#36483a"), I, -3.0, -1.7, 0, 2.0, 12, 13.6); box(b, col("#2a2f33"), I, -3.1, -1.6, 2.0, 2.15, 11.9, 13.7);  // the shed, on the side away from Ava's window (her view of the gate stays clear)
  cyl(b, col("#2a2d33"), I, -2.75, 0, 6.2, 0.04, 0.04, 1.55, 10); sph(b, glow("olGardenLamp", () => ({ color: "#ffcf8a" })), I, -2.75, 1.62, 6.2, 0.1, 0.12, 0.1, 14);
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
  const glamp = new THREE.PointLight("#ffcf8a", 1.6, 9, 1.6); glamp.position.set(-2.75, 1.8, 6.2); root.add(glamp);
  return { root, env: { clouds: false }, spots: FERRY_SPOTS, views: FERRY_VIEWS };
};

// ---------------------------------------------------------------- sets: ollieRoom, avaRoom (Part 1)
// Two small bedrooms that share a wall: Ollie's RIGHT wall (x = +1.7) is Ava's LEFT wall (x = -1.7). Each room is
// 3.4 wide, 3.2 deep, 2.5 high, open toward +z (the camera side); the back wall (z = -1.6) has the garden window.
// Beds stand with their heads at the shared wall, 0.85 m off the back wall, so someone can kneel BEHIND the bed,
// facing the camera: an actor placed there 0.36 m below the floor reads as kneeling (the bed hides the legs).
const BED_TOP = 0.45, KNEEL_DROP = -0.36;
/** a single bed along x, head at x1 (sign = which way the head is): frame, mattress, pillow, headboard, a duvet over
 *  the foot two-thirds (its top 0.17 over the mattress) */
const bed = (b: Batch, I: THREE.Matrix4, xFoot: number, xHead: number, z0: number, z1: number, duvet: string, wood = "#b98c5a") => {
  const lo = Math.min(xFoot, xHead), hi = Math.max(xFoot, xHead), dir = Math.sign(xHead - xFoot), zc = (z0 + z1) / 2;
  box(b, col(wood), I, lo, hi, 0.12, 0.3, z0, z1); box(b, col("#efe9dd"), I, lo + 0.02, hi - 0.02, 0.3, BED_TOP, z0 + 0.02, z1 - 0.02);
  for (const [x, z] of [[lo + 0.05, z0 + 0.05], [hi - 0.05, z0 + 0.05], [lo + 0.05, z1 - 0.05], [hi - 0.05, z1 - 0.05]] as const) box(b, col(wood), I, x - 0.04, x + 0.04, 0, 0.12, z - 0.04, z + 0.04);
  box(b, col(wood), I, xHead - (dir > 0 ? 0.06 : 0), xHead + (dir > 0 ? 0 : 0.06), 0.12, 1.0, z0, z1);                    // headboard
  rbox(b, col("#f6f1e6"), I, xHead - dir * 0.3, BED_TOP, zc, 0.42, 0.13, z1 - z0 - 0.16, 0.05);                            // pillow
  const dEnd = xHead - dir * 0.62;
  rbox(b, col(duvet), I, (xFoot + dEnd) / 2, BED_TOP, zc, Math.abs(dEnd - xFoot), 0.17, z1 - z0 + 0.06, 0.06);             // duvet
};
const dinoWall = () => stex("olDinoWall", 256, 256, (g) => {
  g.fillStyle = "#b9cfd6"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(95,143,60,0.55)";
  for (const [x, y] of [[40, 60], [170, 30], [110, 150], [220, 200], [30, 215]]) { g.beginPath(); g.ellipse(x, y, 20, 10, 0, 0, 7); g.fill(); g.fillRect(x + 12, y - 16, 6, 14); g.beginPath(); g.moveTo(x - 18, y); g.lineTo(x - 36, y - 8); g.lineTo(x - 18, y + 5); g.fill(); g.fillRect(x - 10, y + 6, 4, 10); g.fillRect(x + 6, y + 6, 4, 10); }
});
const OLLIE_SPOTS: Record<string, V3> = { bed: [1.0, BED_TOP, -0.38], asleep: [1.08, -0.12, -0.38], kneel: [0.75, KNEEL_DROP, -1.12], tuck: [0.4, 0, 0.55], behind: [0.55, 0, -1.15], door: [-1.3, 0, 1.0], floor: [0, 0, 0.9] };
const OLLIE_VIEWS: View[] = [
  { name: "bedside", pos: [-0.5, 1.5, 2.4], look: [0.85, 1.2, -0.6], fov: 50 },
  { name: "shelfCam", pos: [-1.45, 1.7, 0.9], look: [0.9, 0.7, -0.5], fov: 55, establishing: true },
];
const ollieRoom = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.4, d: 3.2, h: 2.5, floor: floorMat(), wall: tex("olDino", dinoWall, 3, 2), trim: "#f1ece0", openings: [{ wall: "back", at: -0.75, w: 1.0, h: 1.2, sill: 0.95, view: "garden" }] });
  bed(b, I, 0.08, 1.62, -0.75, 0.0, "#4f7fb3");
  box(b, glow("olNightPane", () => ({ color: "#131d36" })), I, -1.25, -0.25, 0.95, 2.15, -1.67, -1.66);                     // the window at night (these rooms are only used after dark)
  box(b, col("#e8e2d6"), I, -1.68, -1.42, 1.5, 1.54, 0.2, 1.3); box(b, col("#f4f1ea"), I, -1.6, -1.5, 1.54, 1.66, 0.7, 0.8); sph(b, col("#15171b"), I, -1.5, 1.6, 0.75, 0.025, 0.025, 0.025, 10); // the shelf and the nursery camera
  for (const [z, c] of [[0.35, "#5f8f3c"], [1.1, "#d97a3a"]] as const) rbox(b, col(c), I, -1.56, 1.54, z, 0.12, 0.14, 0.2, 0.04);     // toy dinosaurs on the shelf
  rbox(b, col("#d9b25a"), I, -1.2, 0, -1.2, 0.5, 0.5, 0.45, 0.04); sph(b, glow("olNightLight", () => ({ color: "#ffd9a0" })), I, -1.2, 0.6, -1.2, 0.09, 0.1, 0.09, 12); // toy box + night light
  rbox(b, col("#c85a4a"), I, 0.3, 0.0, 0.75, 1.5, 0.015, 1.0, 0.01);                                                     // rug
  b.build(root, true);
  return { root, env: { clouds: false }, spots: OLLIE_SPOTS, views: OLLIE_VIEWS };
};
const fairyWall = () => stex("olAvaWall", 256, 256, (g) => { g.fillStyle = "#c9b7c9"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(255,255,255,0.12)"; for (let y = 0; y < 256; y += 32) g.fillRect(0, y, 256, 2); });
const drawingTex = () => stex("olDrawing", 256, 192, (g) => {
  g.fillStyle = "#fbf7ec"; g.fillRect(0, 0, 256, 192); g.lineCap = "round";
  const fig = (x: number, h: number, c: string) => { g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.arc(x, 150 - h, 16, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, 166 - h); g.lineTo(x, 150); g.moveTo(x - 18, 132 - h / 2); g.lineTo(x + 18, 132 - h / 2); g.moveTo(x, 150); g.lineTo(x - 12, 176); g.moveTo(x, 150); g.lineTo(x + 12, 176); g.stroke(); };
  fig(95, 40, "#3f8f4a"); fig(165, 78, "#7a5ac8"); g.fillStyle = "#e0a43a"; g.beginPath(); g.arc(222, 34, 18, 0, 7); g.fill();
  g.fillStyle = "#c0392b"; g.font = "bold 26px 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.fillText("ME + AVA", 128, 30);
});
const AVA_SPOTS: Record<string, V3> = { bed: [-1.0, BED_TOP, -0.38], asleep: [-1.08, -0.12, -0.38], bedEdge: [-0.6, BED_TOP, 0.05], window: [0.75, 0, -1.05], door: [1.15, 0, 0.9], floor: [0, 0, 0.9] };
const AVA_VIEWS: View[] = [
  { name: "bedWall", pos: [0.9, 1.15, 1.5], look: [-1.1, 0.95, -0.4], fov: 45 },
  { name: "window", pos: [0.3, 1.5, 1.4], look: [0.75, 1.5, -1.6], fov: 50, establishing: true },
];
const avaRoom = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.4, d: 3.2, h: 2.5, floor: floorMat(), wall: tex("olAvaW", fairyWall, 3, 2), trim: "#f1ece0", openings: [{ wall: "back", at: 0.75, w: 1.0, h: 1.2, sill: 0.95, view: "garden" }] });
  bed(b, I, -0.08, -1.62, -0.75, 0.0, "#8a6fb0", "#e8e2d6");
  box(b, glow("olNightPane", () => ({ color: "#131d36" })), I, 0.25, 1.25, 0.95, 2.15, -1.67, -1.66);
  // the shared wall (x = -1.7): Ollie's drawing and a string of fairy lights over the bed
  b.add(new THREE.PlaneGeometry(0.44, 0.33), new THREE.MeshLambertMaterial({ map: drawingTex() }), new THREE.Matrix4().makeTranslation(-1.615, 1.5, -0.2).multiply(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
  for (let i = 0; i < 9; i++) sph(b, glow("olFairy" + (i % 3), () => ({ color: ["#ffd98a", "#ffb0c8", "#bfe0ff"][i % 3] })), I, -1.62, 1.95 - Math.sin((i / 8) * Math.PI) * 0.14, -1.35 + i * 0.26, 0.03, 0.03, 0.03, 8);
  rbox(b, col("#e8e2d6"), I, -1.45, 0, 0.35, 0.4, 0.5, 0.38, 0.03); box(b, col("#15171b"), I, -1.55, -1.35, 0.5, 0.6, 0.27, 0.43);   // bedside table and the LED clock (its digits are an insert)
  box(b, glow("olClockRed", () => ({ color: "#ff3b30" })), I, -1.349, -1.348, 0.52, 0.58, 0.29, 0.41);
  rbox(b, col("#d8cdb8"), I, 1.25, 0, -1.2, 0.8, 0.74, 0.5, 0.03);                                                       // desk
  rbox(b, col("#7a6aa8"), I, -0.2, 0.0, 0.8, 1.4, 0.015, 1.0, 0.01);
  // her door in the right wall (to the landing): closed, a line of landing light in the gap under it
  box(b, col("#e9e3d6"), I, 1.655, 1.69, 0.03, 2.02, 0.5, 1.32); box(b, col("#b9a26a"), I, 1.63, 1.655, 0.98, 1.06, 0.58, 0.64);
  box(b, glow("olDoorGap", () => ({ color: "#ffd9a0" })), I, 1.652, 1.656, 0.0, 0.03, 0.52, 1.3);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: AVA_SPOTS, views: AVA_VIEWS };
};

// ---------------------------------------------------------------- set: ferryKitchen (Part 1)
// The kitchen at the back of the house (4.4 x 3.6 m, open toward +z). Back wall (z = -1.8): the window over the
// counter (x -1.0) onto the garden, and the back door (x 1.35) with its top bolt. Table in the middle, a bench and
// chairs; stove and counter on the left wall, fridge in the back-left corner; the calendar on the right wall.
const KITCHEN_SPOTS: Record<string, V3> = { stove: [-1.55, 0, 0.1], counter: [-1.0, 0, -0.95], door: [1.35, 0, -1.25], tableL: [-0.45, 0, 0.55], tableR: [0.55, 0, 0.55], tableBack: [0.05, 0, 0.0], stairs: [1.7, 0, 1.6], floor: [0, 0, 1.5] };
const KITCHEN_VIEWS: View[] = [
  { name: "kitchen", pos: [0.4, 1.5, 3.6], look: [0, 1.1, -0.6], fov: 50 },
  { name: "door", pos: [0.6, 1.5, 1.2], look: [1.35, 1.6, -1.8], fov: 45, establishing: true },
];
const calendarTex = () => stex("olCalendar", 256, 320, (g) => {
  g.fillStyle = "#fbf8f0"; g.fillRect(0, 0, 256, 320); g.fillStyle = "#3f6f9a"; g.fillRect(0, 0, 256, 64); g.fillStyle = "#ffffff"; g.font = "bold 34px 'DejaVu Sans', sans-serif"; g.textAlign = "center"; g.fillText("NOVEMBER", 128, 44);
  g.fillStyle = "#4a4a52"; g.font = "bold 20px 'DejaVu Sans', sans-serif"; for (let d = 1; d <= 30; d++) { const k = d + 5; g.fillText(String(d), 22 + (k % 7) * 35, 100 + Math.floor(k / 7) * 42); }
});
/** night = true: the same kitchen after dark (Part 1's night scenes): a dark pane in the garden window and dark door glass */
const ferryKitchen = (night = false) => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 4.4, d: 3.6, h: 2.5, floor: floorMat(), wall: tex("olKitWall", () => stex("olKitW", 128, 128, (g) => { g.fillStyle = "#e6d9b8"; g.fillRect(0, 0, 128, 128); }), 1, 1), trim: "#f1ece0",
    openings: [{ wall: "back", at: -1.0, w: 1.3, h: 1.0, sill: 1.1, view: "garden" }, { wall: "back", at: 1.35, w: 0.9, h: 2.05, sill: 0, kind: "door" }] });
  // the back door: a half-glazed leaf in the opening, the brass top bolt (slid shut), the handle
  box(b, col("#34506e"), I, 0.92, 1.78, 0.02, 2.03, -1.86, -1.825); box(b, col(night ? "#1b2230" : "#9fb6c4"), I, 1.05, 1.65, 1.15, 1.9, -1.819, -1.815);
  if (night) box(b, glow("olNightPane", () => ({ color: "#131d36" })), I, -1.65, -0.35, 1.1, 2.1, -1.87, -1.86);          // the window at night
  box(b, col("#c9a74a"), I, 1.58, 1.82, 1.93, 1.99, -1.815, -1.79); box(b, col("#c9a74a"), I, 1.62, 1.7, 1.0, 1.04, -1.815, -1.77);
  counter(b, { x: -1.0, z: -1.45 }, 1.8); fridge(b, { x: -1.85, z: -1.38, y: 0.003 }); stove(b, { x: -1.85, z: 0.1, yaw: Math.PI / 2 }); counter(b, { x: -1.85, z: 1.0, yaw: Math.PI / 2 }, 1.0);
  // the table, a bench behind it (against nothing: actors sit on its far side), two chairs
  box(b, col("#b98c5a"), I, -0.9, 1.0, 0.72, 0.78, -0.15, 0.75); for (const [x, z] of [[-0.82, -0.08], [0.92, -0.08], [-0.82, 0.68], [0.92, 0.68]] as const) box(b, col("#a47a4c"), I, x - 0.04, x + 0.04, 0, 0.72, z - 0.04, z + 0.04);
  box(b, col("#a47a4c"), I, -0.8, 0.9, 0.4, 0.46, -0.55, -0.25); for (const x of [-0.72, 0.82]) box(b, col("#8f6a40"), I, x - 0.04, x + 0.04, 0, 0.4, -0.5, -0.3);
  chair(b, { x: -0.45, z: 1.1, yaw: Math.PI }); chair(b, { x: 0.55, z: 1.1, yaw: Math.PI });
  for (const [x, c] of [[-0.3, "#d9d2c4"], [0.45, "#7fa3c8"]] as const) cyl(b, col(c), I, x, 0.78, 0.25, 0.09, 0.07, 0.07, 14);        // bowls
  cyl(b, col("#c85a4a"), I, -1.75, 0.92, 0.1, 0.11, 0.11, 0.1, 14);                                                             // a pan on the stove
  b.add(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshLambertMaterial({ map: calendarTex() }), new THREE.Matrix4().makeTranslation(2.115, 1.55, -0.6).multiply(new THREE.Matrix4().makeRotationY(-Math.PI / 2)));
  b.build(root, true);
  return { root, env: { clouds: false }, spots: KITCHEN_SPOTS, views: KITCHEN_VIEWS };
};

// ---------------------------------------------------------------- prop: olInsert (Part 1's close inserts)
// One upright 9:16 card (0.54 x 0.96 m, facing +z), `at` = its centre: stand an `at` camera 1.0 m in front of it at
// fov 51 and it fills the frame. Variants are ink drawings (plum outline, flat fills) or Ava's phone screen.
const PLUM = "#1b1222", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const blob = (g: CanvasRenderingContext2D, pts: [number, number][], fill: string, lw = 12) => {
  g.beginPath(); pts.forEach(([x, y], i) => { const [nx, ny] = pts[(i + 1) % pts.length]; if (!i) g.moveTo((x + nx) / 2, (y + ny) / 2); g.quadraticCurveTo(nx, ny, (nx + pts[(i + 2) % pts.length][0]) / 2, (ny + pts[(i + 2) % pts.length][1]) / 2); });
  g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = PLUM; g.lineJoin = "round"; g.stroke(); }
};
const phoneFrame = (g: CanvasRenderingContext2D, title: string) => {
  g.fillStyle = "#0e1118"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#161b26"; g.fillRect(0, 0, IW, 150);
  g.fillStyle = "#e9edf5"; g.font = F(44); g.textAlign = "left"; g.fillText(title, 50, 96); g.fillStyle = "#8b93a5"; g.font = F(34, "normal"); g.textAlign = "right"; g.fillText("03:00", IW - 50, 94);
};
const wave = (g: CanvasRenderingContext2D, y: number, c: string, seed: number) => { const r = rnd(seed); g.fillStyle = c; for (let i = 0; i < 46; i++) { const h = 14 + r() * 120 * Math.abs(Math.sin(i / 5.2)); g.fillRect(60 + i * 15, y - h / 2, 8, h); } };
const bubble = (g: CanvasRenderingContext2D, y: number, small: string, lines: string[], hot = false) => {
  const h = 110 + lines.length * 82; g.fillStyle = hot ? "#b3261e" : "#1f4fb8"; g.beginPath(); g.roundRect(50, y, IW - 100, h, 36); g.fill();
  g.fillStyle = "rgba(255,255,255,0.7)"; g.font = F(30, "normal"); g.textAlign = "left"; g.fillText(small, 86, y + 58);
  g.fillStyle = "#ffffff"; g.font = F(hot ? 96 : 60); lines.forEach((l, i) => g.fillText(l, 86, y + 132 + i * (hot ? 100 : 82)));
  return y + h + 36;
};
// Part 1 insert helpers: one child's face for both photos (Kuba in 2008, Ollie now: the same face is the point)
const kidFace = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number, laugh: boolean) => {
  g.fillStyle = "#2a1d17"; for (let i = 0; i < 13; i++) { const a = Math.PI * (0.88 + i * 0.104); g.beginPath(); g.arc(cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.9, r * 0.3, 0, 7); g.fill(); }
  g.fillStyle = "#f0d2b8"; g.beginPath(); g.ellipse(cx, cy + r * 0.08, r * 0.84, r * 0.9, 0, 0, 7); g.fill(); g.lineWidth = Math.max(4, r * 0.05); g.strokeStyle = PLUM; g.stroke();
  g.fillStyle = "#2a1d17"; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx - r * 0.55 + i * r * 0.22, cy - r * 0.62 + (i % 2) * r * 0.07, r * 0.2, 0, 7); g.fill(); }
  for (const s of [-1, 1]) {
    g.fillStyle = PLUM; g.beginPath(); g.ellipse(cx + s * r * 0.32, cy + r * 0.04, r * 0.09, laugh ? r * 0.06 : r * 0.12, 0, 0, 7); g.fill();
    if (!laugh) { g.fillStyle = "#ffffff"; g.beginPath(); g.arc(cx + s * r * 0.32 + r * 0.03, cy - r * 0.01, r * 0.03, 0, 7); g.fill(); }
    g.fillStyle = "rgba(225,110,100,0.35)"; g.beginPath(); g.ellipse(cx + s * r * 0.5, cy + r * 0.3, r * 0.14, r * 0.09, 0, 0, 7); g.fill();
  }
  g.strokeStyle = PLUM; g.lineWidth = Math.max(3, r * 0.04); g.beginPath(); g.arc(cx, cy + r * 0.2, r * 0.07, 0.2, Math.PI - 0.2); g.stroke();
  if (laugh) { g.fillStyle = "#6a2030"; g.beginPath(); g.moveTo(cx - r * 0.26, cy + r * 0.38); g.quadraticCurveTo(cx, cy + r * 0.82, cx + r * 0.26, cy + r * 0.38); g.closePath(); g.fill(); g.stroke(); }
  else { g.beginPath(); g.arc(cx, cy + r * 0.3, r * 0.24, 0.35, Math.PI - 0.35); g.stroke(); }
};
/** the 2008 photo: a curly toddler laughing on a swing, a faded print with a white border; wet = beads and a sheen.
 *  The face sits at (x + w/2, y + 0.42 h), radius 0.2 w: the same place as in olliePhoto, so the two line up */
const kubaPhoto = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rot: number, wet: boolean) => {
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.translate(-w / 2, -h / 2);
  g.fillStyle = "#f4f0e6"; g.fillRect(0, 0, w, h); const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, "#a9c0b9"); bg.addColorStop(1, "#d2c79d");
  const m = w * 0.06; g.fillStyle = bg; g.fillRect(m, m, w - 2 * m, h - 2 * m);
  g.fillStyle = "rgba(90,120,80,0.5)"; g.fillRect(m, h * 0.78, w - 2 * m, h * 0.22 - m);
  g.strokeStyle = "#5a5048"; g.lineWidth = w * 0.012; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(w / 2 + s * w * 0.3, m); g.lineTo(w / 2 + s * w * 0.3, h * 0.7); g.stroke(); }
  g.fillStyle = "#b8342c"; g.beginPath(); g.ellipse(w / 2, h * 0.68, w * 0.26, h * 0.13, 0, 0, 7); g.fill(); g.lineWidth = w * 0.012; g.strokeStyle = PLUM; g.stroke();   // red jumper
  g.fillStyle = "#7a5a3a"; g.fillRect(w * 0.16, h * 0.76, w * 0.68, h * 0.035);                                                         // the seat
  kidFace(g, w / 2, h * 0.42, w * 0.2, true);
  if (wet) {
    const sh = g.createLinearGradient(0, 0, w, h); sh.addColorStop(0.3, "rgba(255,255,255,0)"); sh.addColorStop(0.45, "rgba(255,255,255,0.22)"); sh.addColorStop(0.6, "rgba(255,255,255,0)"); g.fillStyle = sh; g.fillRect(0, 0, w, h);
    const r = rnd(17); for (let i = 0; i < 22; i++) { const bx = r() * w, by = r() * h, br = w * (0.012 + r() * 0.02); g.fillStyle = "rgba(200,228,245,0.75)"; g.beginPath(); g.ellipse(bx, by, br, br * 1.3, 0, 0, 7); g.fill(); g.fillStyle = "rgba(255,255,255,0.9)"; g.beginPath(); g.arc(bx - br * 0.3, by - br * 0.4, br * 0.3, 0, 7); g.fill(); }
  }
  g.lineWidth = w * 0.015; g.strokeStyle = PLUM; g.strokeRect(0, 0, w, h); g.restore();
};
/** Ollie's school photo in a wooden frame: the school-photo blue, a red jumper, the same face (smiling) */
const olliePhoto = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  g.fillStyle = "#9a6b42"; g.fillRect(x - w * 0.07, y - w * 0.07, w * 1.14, h + w * 0.14); g.lineWidth = w * 0.015; g.strokeStyle = PLUM; g.strokeRect(x - w * 0.07, y - w * 0.07, w * 1.14, h + w * 0.14);
  const bg = g.createRadialGradient(x + w / 2, y + h * 0.4, w * 0.1, x + w / 2, y + h * 0.4, w * 0.8); bg.addColorStop(0, "#7d9cc4"); bg.addColorStop(1, "#3e5d86"); g.fillStyle = bg; g.fillRect(x, y, w, h);
  g.fillStyle = "#c0392b"; g.beginPath(); g.ellipse(x + w / 2, y + h * 0.95, w * 0.42, h * 0.28, 0, Math.PI, 0); g.fill(); g.strokeStyle = PLUM; g.lineWidth = w * 0.012; g.stroke();
  g.fillStyle = "#f2c94c"; g.beginPath(); g.arc(x + w * 0.66, y + h * 0.82, w * 0.04, 0, 7); g.fill();
  kidFace(g, x + w / 2, y + h * 0.42, w * 0.2, false);
};
/** a small green dinosaur sticker with its white die-cut edge, one corner peeling */
const dino = (g: CanvasRenderingContext2D, cx: number, cy: number, s: number) => {
  const shape = () => { g.beginPath(); g.ellipse(cx, cy, 120 * s, 62 * s, 0, 0, 7); g.moveTo(cx + 80 * s, cy - 30 * s); g.ellipse(cx + 120 * s, cy - 70 * s, 50 * s, 34 * s, -0.3, 0, 7); g.moveTo(cx - 100 * s, cy); g.lineTo(cx - 210 * s, cy - 40 * s); g.lineTo(cx - 100 * s, cy + 30 * s); };
  g.save(); g.lineJoin = "round"; g.lineWidth = 34 * s; g.strokeStyle = "#ffffff"; shape(); g.stroke(); g.fillStyle = "#5fa83c"; shape(); g.fill(); g.lineWidth = 6 * s; g.strokeStyle = PLUM; shape(); g.stroke();
  for (const dx of [-50, 40]) { g.fillStyle = "#5fa83c"; g.fillRect(cx + dx * s, cy + 40 * s, 26 * s, 54 * s); g.strokeRect(cx + dx * s, cy + 40 * s, 26 * s, 54 * s); }
  g.fillStyle = PLUM; g.beginPath(); g.arc(cx + 135 * s, cy - 82 * s, 8 * s, 0, 7); g.fill();
  g.fillStyle = "#d9d6cf"; g.beginPath(); g.moveTo(cx + 150 * s, cy + 40 * s); g.lineTo(cx + 190 * s, cy + 30 * s); g.lineTo(cx + 160 * s, cy + 80 * s); g.fill(); g.restore();
};
const lockScreen = (g: CanvasRenderingContext2D, time: string) => {
  const bg = g.createLinearGradient(0, 0, 0, IH); bg.addColorStop(0, "#10142a"); bg.addColorStop(1, "#2a1a3a"); g.fillStyle = bg; g.fillRect(0, 0, IW, IH);
  g.fillStyle = "#c9cfe0"; g.font = F(40, "normal"); g.textAlign = "center"; g.fillText("Thursday 12 November", IW / 2, 360);
  g.fillStyle = "#f2f4fa"; g.font = "200px 'DejaVu Sans', sans-serif"; g.fillText(time, IW / 2, 600);
  for (const x of [130, IW - 130]) { g.fillStyle = "rgba(255,255,255,0.14)"; g.beginPath(); g.arc(x, 1290, 62, 0, 7); g.fill(); }
};
const vignette = (g: CanvasRenderingContext2D, c: string) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.35, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, c); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
const INSERTS: Record<string, (g: CanvasRenderingContext2D, step: number) => void> = {
  // Ava's knuckles on the shared wall: lilac wall, two fairy lights, her fist and hoodie cuff, three knock marks
  knock: (g) => {
    g.fillStyle = "#b9a7bf"; g.fillRect(0, 0, IW, IH); g.fillStyle = "rgba(255,255,255,0.1)"; for (let y = 0; y < IH; y += 120) g.fillRect(0, y, IW, 6);
    for (const [x, y, c] of [[150, 150, "#ffd98a"], [420, 210, "#ffb0c8"], [690, 150, "#bfe0ff"]] as const) { g.fillStyle = c; g.beginPath(); g.arc(x, y, 34, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = PLUM; g.stroke(); }
    g.strokeStyle = PLUM; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 110); g.quadraticCurveTo(420, 260, IW, 110); g.stroke();
    blob(g, [[IW + 60, 820], [IW + 60, 1180], [560, 1160], [540, 860]], "#8b9098");                                    // hoodie sleeve
    blob(g, [[600, 830], [600, 1170], [330, 1150], [250, 1040], [250, 930], [330, 850]], "#f3cfb2");                    // fist
    g.strokeStyle = PLUM; g.lineWidth = 9; for (const y of [925, 1000, 1075]) { g.beginPath(); g.moveTo(262, y); g.quadraticCurveTo(330, y - 14, 400, y); g.stroke(); }
    g.lineWidth = 10; for (const [r0, a] of [[70, 0.9], [120, 0.65], [170, 0.4]] as const) { g.strokeStyle = `rgba(27,18,34,${a})`; g.beginPath(); g.arc(215, 1000, r0, Math.PI * 0.72, Math.PI * 1.28); g.stroke(); }
  },
  // the red LED bedside clock: step 0 = 2:59, step >= 1 = 3:00
  clock: (g, step) => {
    g.fillStyle = "#0b0d14"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#1a1620"; g.fillRect(0, 900, IW, IH - 900);
    g.fillStyle = "#15171d"; g.beginPath(); g.roundRect(90, 520, IW - 180, 400, 50); g.fill(); g.lineWidth = 12; g.strokeStyle = PLUM; g.stroke();
    g.shadowColor = "#ff3b30"; g.shadowBlur = 50; g.fillStyle = "#ff3b30"; g.font = "bold 250px 'DejaVu Sans Mono', monospace"; g.textAlign = "center"; g.fillText(step >= 1 ? "3:00" : "2:59", IW / 2, 810); g.shadowBlur = 0;
  },
  clock258: (g) => { INSERTS.clock(g, 0); g.fillStyle = "#15171d"; g.fillRect(120, 580, IW - 240, 290); g.shadowColor = "#ff3b30"; g.shadowBlur = 50; g.fillStyle = "#ff3b30"; g.font = "bold 250px 'DejaVu Sans Mono', monospace"; g.textAlign = "center"; g.fillText("2:58", IW / 2, 810); g.shadowBlur = 0; },
  // Ava's phone, recording through the wall
  rec: (g) => { phoneFrame(g, "Voice memo"); g.fillStyle = "#ff3b30"; g.beginPath(); g.arc(IW / 2 - 150, 420, 22, 0, 7); g.fill(); g.fillStyle = "#e9edf5"; g.font = F(72); g.textAlign = "left"; g.fillText("REC 0:07", IW / 2 - 110, 446); wave(g, 760, "#ff6a5e", 4); g.fillStyle = "#8b93a5"; g.font = F(38, "normal"); g.textAlign = "center"; g.fillText("Recording…", IW / 2, 1080); },
  // the translator: step 0 the first line, step >= 1 both
  trans: (g, step) => {
    phoneFrame(g, "Translate"); wave(g, 300, "#5f7fd0", 4); g.fillStyle = "#f2c94c"; g.font = F(40); g.textAlign = "left"; g.fillText("DETECTED: POLISH", 56, 460);
    const y = bubble(g, 510, "Mamo, woda jest przy drzwiach.", ["Mama, the water's", "at the door."]);
    if (step >= 1) bubble(g, y, "Obiecałaś, że nie puścisz.", ["You promised you", "wouldn't let go."]);
  },
  // the translator, live, on the windowsill
  transLive: (g) => { phoneFrame(g, "Translate · live"); wave(g, 320, "#ff6a5e", 9); g.fillStyle = "#f2c94c"; g.font = F(40); g.textAlign = "left"; g.fillText("DETECTED: POLISH", 56, 480); bubble(g, 560, "Weź go!", ["TAKE", "HIM!"], true); },
  callDad: (g) => { g.fillStyle = "#0e1118"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#2b3954"; g.beginPath(); g.arc(IW / 2, 470, 150, 0, 7); g.fill(); g.fillStyle = "#e9edf5"; g.font = F(150); g.textAlign = "center"; g.fillText("D", IW / 2, 522); g.font = F(96); g.fillText("Dad", IW / 2, 780); g.fillStyle = "#8b93a5"; g.font = F(48, "normal"); g.fillText("Calling…", IW / 2, 870); g.fillStyle = "#d83a34"; g.beginPath(); g.arc(IW / 2, 1180, 84, 0, 7); g.fill(); },
  // Kate's right palm, open: the pale diagonal scar; her cardigan cuff
  palm: (g) => {
    g.fillStyle = "#d8b98a"; g.fillRect(0, 0, IW, IH);
    blob(g, [[220, 1440], [200, 1080], [600, 1080], [590, 1440]], "#d6c6a2");                                          // cardigan cuff
    for (const [x, top] of [[262, 330], [372, 250], [482, 270], [585, 370]] as const) { g.fillStyle = "#f0d2b8"; g.beginPath(); g.roundRect(x - 46, top, 92, 420, 46); g.fill(); g.lineWidth = 12; g.strokeStyle = PLUM; g.stroke(); }
    g.save(); g.translate(170, 800); g.rotate(-0.75); g.fillStyle = "#f0d2b8"; g.beginPath(); g.roundRect(-50, -190, 100, 300, 50); g.fill(); g.lineWidth = 12; g.strokeStyle = PLUM; g.stroke(); g.restore();
    g.fillStyle = "#f0d2b8"; g.beginPath(); g.roundRect(196, 620, 450, 500, 110); g.fill(); g.lineWidth = 12; g.strokeStyle = PLUM; g.stroke();
    g.fillStyle = "#f0d2b8"; g.fillRect(222, 610, 398, 60);                                                             // join the fingers to the palm
    g.strokeStyle = "rgba(160,110,90,0.5)"; g.lineWidth = 6; g.lineCap = "round"; g.beginPath(); g.moveTo(250, 800); g.quadraticCurveTo(400, 740, 600, 790); g.stroke();
    g.strokeStyle = "#fff6ee"; g.lineWidth = 30; g.beginPath(); g.moveTo(255, 690); g.quadraticCurveTo(400, 870, 600, 1040); g.stroke();   // the scar
    g.strokeStyle = "rgba(200,110,100,0.9)"; g.lineWidth = 7; g.beginPath(); g.moveTo(252, 680); g.quadraticCurveTo(400, 860, 606, 1036); g.stroke();
    for (let k = 0; k < 7; k++) { const t = k / 6, x = 280 + t * 300, y = 720 + t * 300; g.beginPath(); g.moveTo(x - 22, y + 18); g.lineTo(x + 22, y - 18); g.stroke(); }
  },
  // 2008, a flash: above black water, a small hand slipping out of a woman's hand; rain
  flash08: (g) => {
    const sky = g.createLinearGradient(0, 0, 0, IH); sky.addColorStop(0, "#1d3a40"); sky.addColorStop(0.55, "#16282d"); sky.addColorStop(1, "#070c0e"); g.fillStyle = sky; g.fillRect(0, 0, IW, IH);
    g.strokeStyle = "rgba(140,180,180,0.35)"; g.lineWidth = 5; for (let i = 0; i < 16; i++) { const y = 880 + i * 36, x = (i * 97) % 500; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 150, y - 12, x + 300, y); g.stroke(); }
    blob(g, [[IW + 40, 80], [IW + 40, 330], [520, 520], [400, 470], [430, 330]], "#37584f");                             // her sleeve
    blob(g, [[470, 340], [540, 520], [430, 640], [300, 620], [250, 500], [330, 380]], "#c9d6cf");                       // her hand, open
    for (const [x, y, a] of [[250, 600, 0.5], [330, 660, 0.2], [420, 670, -0.1]] as const) { g.save(); g.translate(x, y); g.rotate(a); blob(g, [[-30, -70], [30, -70], [30, 70], [-30, 70]], "#c9d6cf"); g.restore(); }
    blob(g, [[150, 800], [250, 760], [300, 850], [250, 960], [160, 950]], "#b9c9c2");                                   // the small hand, falling away
    for (const [x, y, a] of [[250, 740, -0.5], [300, 790, -0.2], [315, 860, 0.2]] as const) { g.save(); g.translate(x, y); g.rotate(a); blob(g, [[-16, -38], [16, -38], [16, 38], [-16, 38]], "#b9c9c2", 9); g.restore(); }
    blob(g, [[-60, 880], [150, 830], [190, 960], [-60, 1080]], "#7a2f2a");                                              // a red pyjama cuff
    g.strokeStyle = "rgba(200,225,225,0.45)"; g.lineWidth = 4; const r = rnd(8); for (let i = 0; i < 70; i++) { const x = r() * IW, y = r() * IH; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 14, y + 90); g.stroke(); }
  },
  // Ollie's feet at the end of the bed: wet, blades of grass stuck to them
  feet: (g) => {
    g.fillStyle = "#1d2742"; g.fillRect(0, 0, IW, IH); blob(g, [[-60, 620], [IW + 60, 560], [IW + 60, IH + 60], [-60, IH + 60]], "#e6e2da");
    blob(g, [[-60, 300], [IW + 60, 240], [IW + 60, 640], [-60, 700]], "#4f7fb3");                                       // the lifted duvet
    for (const cx of [270, 540]) {
      blob(g, [[cx - 95, 660], [cx + 95, 650], [cx + 110, 1010], [cx + 40, 1120], [cx - 60, 1110], [cx - 115, 1000]], "#f0d2b8");
      for (let k = 0; k < 5; k++) blob(g, [[cx - 108 + k * 46, 1085 - Math.abs(k - 1) * 6], [cx - 68 + k * 46, 1085 - Math.abs(k - 1) * 6], [cx - 66 + k * 46, 1150], [cx - 110 + k * 46, 1150]], "#f0d2b8", 9);
      g.fillStyle = "rgba(190,215,235,0.75)"; for (const [x, y] of [[cx - 50, 760], [cx + 40, 880], [cx - 10, 990]]) { g.beginPath(); g.ellipse(x, y, 16, 26, 0.3, 0, 7); g.fill(); }
      g.strokeStyle = "#4f8a3a"; g.lineWidth = 12; g.lineCap = "round"; for (const [x, y, a] of [[cx - 60, 850, 0.4], [cx + 30, 760, -0.5], [cx + 55, 980, 0.9], [cx - 20, 1060, -0.2]] as const) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 80, y + Math.sin(a) * 80); g.stroke(); }
    }
  },
  // Ollie's wrist on the pillow: four red finger marks
  wrist: (g) => {
    g.fillStyle = "#1d2742"; g.fillRect(0, 0, IW, IH); blob(g, [[-60, 520], [IW + 60, 460], [IW + 60, IH + 60], [-60, IH + 60]], "#eeeae2");
    blob(g, [[IW + 60, 560], [IW + 60, 900], [470, 930], [450, 640]], "#5e8f3c");                                       // pyjama sleeve
    blob(g, [[480, 660], [490, 910], [230, 900], [130, 840], [120, 740], [220, 680]], "#f0d2b8");                       // forearm and hand
    for (let k = 0; k < 4; k++) blob(g, [[60, 715 + k * 44], [150, 708 + k * 44], [150, 745 + k * 44], [60, 750 + k * 44]], "#f0d2b8", 8);
    g.fillStyle = "rgba(200,60,50,0.62)"; for (let k = 0; k < 4; k++) { g.save(); g.translate(300 + k * 46, 790); g.rotate(-0.12); g.beginPath(); g.roundRect(-16, -110, 32, 220, 16); g.fill(); g.restore(); }
  },
  // ---- Part 1 (final screenplay) ----
  // Ava's phone lock screen: step 0 = 02:59, step >= 1 = 03:00 (Thursday 12 November)
  phoneClock: (g, step) => lockScreen(g, step >= 1 ? "03:00" : "02:59"),
  phone258: (g) => lockScreen(g, "02:58"),
  // Kate on the edge of her bed: a tea towel pressed to the photo on her lap; tears falling
  towelPhoto: (g) => {
    g.fillStyle = "#6f747c"; g.fillRect(0, 0, IW, IH); g.strokeStyle = "rgba(40,40,50,0.35)"; g.lineWidth = 10; for (const x of [120, 330, 610, 740]) { g.beginPath(); g.moveTo(x, 0); g.quadraticCurveTo(x + 40, IH / 2, x - 20, IH); g.stroke(); }
    kubaPhoto(g, 150, 520, 520, 640, -0.08, true);
    g.save(); g.translate(430, 640); g.rotate(0.22); blob(g, [[-260, -230], [230, -260], [260, 160], [-230, 200]], "#f4efe6");                 // the tea towel
    g.strokeStyle = "rgba(190,60,55,0.75)"; g.lineWidth = 14; for (const k of [-160, -60, 40, 140]) { g.beginPath(); g.moveTo(k, -240); g.lineTo(k + 20, 180); g.stroke(); g.beginPath(); g.moveTo(-240, k * 0.9); g.lineTo(240, k * 0.9 - 20); g.stroke(); } g.restore();
    blob(g, [[IW + 60, 300], [IW + 60, 620], [700, 640], [640, 420]], "#d6c6a2");                                         // cardigan cuff
    blob(g, [[680, 380], [690, 660], [470, 700], [380, 600], [420, 430], [560, 360]], "#f0d2b8");                         // her hand, pressing
    g.fillStyle = "rgba(190,225,245,0.9)"; for (const [x, y, s] of [[300, 300, 1], [360, 180, 0.7]] as const) { g.beginPath(); g.moveTo(x, y - 40 * s); g.quadraticCurveTo(x + 24 * s, y, x, y + 22 * s); g.quadraticCurveTo(x - 24 * s, y, x, y - 40 * s); g.fill(); }
    vignette(g, "rgba(20,12,8,0.7)");
  },
  // the biscuit tin under Mum's bed: the lid, Ollie's dinosaur sticker, Ava's thumb on it
  tinLid: (g) => {
    g.fillStyle = "#4a4039"; g.fillRect(0, 0, IW, IH); const r = rnd(41); for (let i = 0; i < 900; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.12)"; g.fillRect(r() * IW, r() * IH, 4, 4); }
    g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(0, 0, IW, 260);                                                                    // under the bed
    g.fillStyle = "#3d6a8f"; g.beginPath(); g.roundRect(90, 360, 630, 820, 70); g.fill(); g.lineWidth = 14; g.strokeStyle = PLUM; g.stroke();
    g.strokeStyle = "#c9a74a"; g.lineWidth = 16; g.beginPath(); g.roundRect(120, 390, 570, 760, 54); g.stroke();
    g.fillStyle = "rgba(240,220,170,0.25)"; for (const [x, y] of [[230, 520], [560, 980], [250, 1030], [600, 560]]) for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + Math.cos(k * 1.26) * 34, y + Math.sin(k * 1.26) * 34, 22, 12, k * 1.26, 0, 7); g.fill(); }
    dino(g, 405, 760, 1.25);
    blob(g, [[-60, 1120], [260, 1000], [360, 1080], [300, 1240], [-60, 1300]], "#8b9098");                                // her hoodie cuff
    blob(g, [[250, 1010], [420, 900], [480, 960], [400, 1060], [300, 1100]], "#f3cfb2");                                  // her thumb on the sticker
  },
  // the open tin: dry, crisp tissue paper; the photo on top, beaded with water; step 1 = the drop has run onto her fingers
  tinOpen: (g, step) => {
    g.fillStyle = "#4a4039"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#8d99a1"; g.beginPath(); g.roundRect(40, 160, 730, 1120, 60); g.fill(); g.lineWidth = 14; g.strokeStyle = PLUM; g.stroke();
    g.fillStyle = "#f6f3ec"; g.beginPath(); g.roundRect(80, 200, 650, 1040, 40); g.fill();                                        // tissue paper, bone dry
    g.strokeStyle = "rgba(150,140,130,0.45)"; g.lineWidth = 4; const r = rnd(12); for (let i = 0; i < 16; i++) { const x = 90 + r() * 620, y = 210 + r() * 1010; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 60 + r() * 120, y + (r() - 0.5) * 90); g.stroke(); }
    kubaPhoto(g, 150, 330, 510, 640, 0.05, true);
    blob(g, [[620, 1000], [720, 980], [760, 1100], [700, 1200], [600, 1160]], "#f3cfb2");                                 // her fingers at the corner
    const drop = (x: number, y: number, s: number) => { g.fillStyle = "rgba(200,230,250,0.95)"; g.beginPath(); g.moveTo(x, y - 34 * s); g.quadraticCurveTo(x + 22 * s, y, x, y + 20 * s); g.quadraticCurveTo(x - 22 * s, y, x, y - 34 * s); g.fill(); g.lineWidth = 4; g.strokeStyle = "rgba(60,90,110,0.8)"; g.stroke(); };
    if (step >= 1) { drop(670, 1080, 1.1); g.strokeStyle = "rgba(200,230,250,0.6)"; g.lineWidth = 8; g.beginPath(); g.moveTo(640, 985); g.lineTo(665, 1050); g.stroke(); }
    else drop(632, 1000, 1.3);
  },
  // the back of the photo: faded ink, "Kubuś · 2008" [PL provisional]; the wet soaking through
  photoBack: (g) => {
    g.fillStyle = "#4a4039"; g.fillRect(0, 0, IW, IH);
    g.save(); g.translate(IW / 2, 700); g.rotate(-0.05); g.fillStyle = "#eee5cf"; g.fillRect(-300, -380, 600, 760); g.lineWidth = 12; g.strokeStyle = PLUM; g.strokeRect(-300, -380, 600, 760);
    g.fillStyle = "rgba(120,110,90,0.18)"; g.font = F(26, "normal"); g.textAlign = "center"; for (let y = -340; y < 360; y += 70) g.fillText("FOTO · PAPIER · FOTO · PAPIER", 0, y);
    g.fillStyle = "rgba(110,120,120,0.28)"; for (const [x, y, rx, ry] of [[-120, -150, 90, 60], [140, 90, 120, 70], [-60, 230, 70, 50], [180, -260, 60, 40]]) { g.beginPath(); g.ellipse(x, y, rx, ry, 0.4, 0, 7); g.fill(); }
    g.fillStyle = "#33508c"; g.font = "italic 92px 'DejaVu Serif', Georgia, serif"; g.fillText("Kubuś · 2008", 0, 30); g.restore();
    blob(g, [[620, 1120], [740, 1080], [790, 1260], [700, 1340], [600, 1250]], "#f3cfb2");
  },
  // the match: step 0 = the 2008 photo held beside Ollie's school photo; step 1 = laid over it, the faces line up, a drop runs down the cheek like a tear
  match: (g, step) => {
    g.fillStyle = "#8a7660"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#6b4e3a"; g.fillRect(0, 1060, IW, IH - 1060);                  // wallpaper, the bedside table
    const glowG = g.createRadialGradient(640, 520, 40, 640, 520, 700); glowG.addColorStop(0, "rgba(255,213,154,0.35)"); glowG.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = glowG; g.fillRect(0, 0, IW, IH);
    if (step < 1) {
      olliePhoto(g, 430, 520, 330, 430);
      kubaPhoto(g, 50, 500, 330, 430, -0.04, true);
      blob(g, [[-60, 860], [150, 880], [200, 1010], [-60, 1060]], "#f3cfb2");
    } else {
      olliePhoto(g, 175, 330, 460, 600);
      g.save(); g.globalAlpha = 0.62; kubaPhoto(g, 175, 330, 460, 600, 0, false); g.restore();
      // the tear: a bright drop running down the toddler's cheek, its wet trail above it
      const fx = 405 + 0.32 * 92, fy = 582 + 12;                                                                    // under the toddler's right eye
      g.strokeStyle = "rgba(210,235,250,0.85)"; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + 6, fy + 45, fx + 3, fy + 85); g.stroke();
      g.fillStyle = "rgba(220,240,255,0.95)"; g.beginPath(); g.moveTo(fx + 3, fy + 70); g.quadraticCurveTo(fx + 25, fy + 108, fx + 3, fy + 126); g.quadraticCurveTo(fx - 19, fy + 108, fx + 3, fy + 70); g.fill(); g.lineWidth = 4; g.strokeStyle = "rgba(60,90,110,0.8)"; g.stroke();
    }
  },
  // the pull: V-shaped ripples running against the current toward Ollie's shins; his pyjama legs dragged back
  pull: (g) => {
    const wg = g.createLinearGradient(0, 0, 0, IH); wg.addColorStop(0, "#22343a"); wg.addColorStop(1, "#0b1316"); g.fillStyle = wg; g.fillRect(0, 0, IW, IH);
    const r = rnd(7); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(240,215,160,${0.2 + r() * 0.4})`; g.fillRect(r() * IW, 650 + r() * 790, 16 + r() * 30, 3); }
    for (const cx of [300, 500]) {                                                                                        // the legs, the cloth dragged toward the bottom-left
      blob(g, [[cx - 80, -60], [cx + 80, -60], [cx + 60, 780], [cx - 110, 800]], "#5e8f3c");
      g.strokeStyle = "#9cc46a"; g.lineWidth = 16; for (let y = 60; y < 760; y += 90) { g.beginPath(); g.moveTo(cx - 78 - y * 0.03, y); g.lineTo(cx + 76 - y * 0.02, y + 20); g.stroke(); }
      g.strokeStyle = "rgba(27,18,34,0.7)"; g.lineWidth = 8; for (const k of [0, 1, 2]) { g.beginPath(); g.moveTo(cx + 50, 420 + k * 110); g.quadraticCurveTo(cx - 20, 520 + k * 110, cx - 120, 620 + k * 110); g.stroke(); }
      g.fillStyle = "rgba(40,70,60,0.6)"; g.beginPath(); g.ellipse(cx - 20, 790, 120, 30, 0, 0, 7); g.fill();             // where the shin goes under
    }
    g.strokeStyle = "rgba(225,240,245,0.9)"; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 770); g.bezierCurveTo(250, 740, 560, 800, IW, 760); g.stroke();   // the waterline
    g.lineCap = "round";
    for (let k = 0; k < 5; k++) {                                                                                         // the Vs, nested, pointing at his legs
      const tipX = 400 - k * 30, tipY = 870 + k * 120, w = 170 + k * 90, a = 0.95 - k * 0.15;
      g.strokeStyle = `rgba(200,225,230,${a})`; g.lineWidth = 12 - k; g.beginPath(); g.moveTo(tipX - w, tipY + w * 0.55); g.lineTo(tipX, tipY); g.lineTo(tipX + w, tipY + w * 0.5); g.stroke();
    }
    g.strokeStyle = "rgba(200,220,230,0.35)"; g.lineWidth = 3; const q = rnd(3); for (let i = 0; i < 60; i++) { const x = q() * IW, y = q() * IH; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 70); g.stroke(); }
  },
  // Kate's feet on the kitchen tiles: wet, grass stuck to them, the hem of her nightdress dripping, wet footprints behind her
  kateFeet: (g) => {
    for (let y = 0; y < 9; y++) for (let x = 0; x < 6; x++) { g.fillStyle = (x + y) % 2 ? "#8f969c" : "#b7bdc0"; g.fillRect(x * 140 - (y % 2) * 0, y * 165, 140, 165); }
    g.fillStyle = "rgba(10,18,30,0.45)"; g.fillRect(0, 0, IW, IH);
    for (const [x, y, s] of [[470, 120, 0.42], [330, 300, 0.55], [480, 500, 0.7], [320, 720, 0.85]] as const) { g.fillStyle = "rgba(40,55,70,0.7)"; g.beginPath(); g.ellipse(x, y, 46 * s, 95 * s, 0.1, 0, 7); g.fill(); for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x - 34 * s + k * 17 * s, y - 100 * s - Math.abs(k - 1) * 6 * s, 9 * s, 0, 7); g.fill(); } }
    blob(g, [[-60, 820], [IW + 60, 790], [IW + 60, 1010], [-60, 1040]], "#8e939b");                                       // the hem
    g.fillStyle = "#5e636b"; g.fillRect(0, 960, IW, 60);                                                                    // soaked
    for (const cx of [300, 520]) {
      blob(g, [[cx - 90, 1000], [cx + 80, 990], [cx + 100, 1290], [cx + 30, 1400], [cx - 70, 1395], [cx - 110, 1280]], "#f0d2b8");
      g.strokeStyle = "#4f8a3a"; g.lineWidth = 12; g.lineCap = "round"; for (const [x, y, a] of [[cx - 50, 1120, 0.5], [cx + 30, 1200, -0.6], [cx - 10, 1310, 1.1]] as const) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 75, y + Math.sin(a) * 75); g.stroke(); }
      g.fillStyle = "rgba(190,215,235,0.8)"; for (const [x, y] of [[cx - 40, 1060], [cx + 50, 1160]]) { g.beginPath(); g.ellipse(x, y, 14, 22, 0.3, 0, 7); g.fill(); }
    }
    g.fillStyle = "rgba(190,215,235,0.85)"; for (const x of [150, 420, 690]) { g.beginPath(); g.ellipse(x, 1060, 9, 16, 0, 0, 7); g.fill(); }
    g.fillStyle = "rgba(160,190,210,0.25)"; g.beginPath(); g.ellipse(410, 1390, 330, 70, 0, 0, 7); g.fill();              // the puddle round her feet
  },
  // the photo on the kitchen table at 03:21, still wet: a pool spreading from under it
  photoTable: (g) => {
    g.fillStyle = "#7d5a38"; g.fillRect(0, 0, IW, IH); g.strokeStyle = "rgba(60,40,24,0.4)"; g.lineWidth = 5; for (let y = 40; y < IH; y += 70) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(260, y + 18, 520, y - 18, IW, y + 6); g.stroke(); }
    g.fillStyle = "rgba(170,200,215,0.35)"; g.beginPath(); g.ellipse(420, 820, 360, 300, 0.2, 0, 7); g.fill();
    kubaPhoto(g, 180, 430, 460, 580, 0.12, true);
    blob(g, [[-60, 1180], [230, 1120], [300, 1230], [220, 1340], [-60, 1360]], "#f3cfb2");                                // Ava's fingers letting go of it
    g.fillStyle = "rgba(10,18,30,0.35)"; g.fillRect(0, 0, IW, IH);
  },
  // the closing choice (the narrated cut): two options to comment, Part 2 under them; the lower third stays clear for captions
  choice: (g) => {
    g.fillStyle = "#05070a"; g.fillRect(0, 0, IW, IH); g.textAlign = "center";
    g.fillStyle = "#8b93a5"; g.font = F(34); g.fillText("TOMORROW · 3:00 A.M.", IW / 2, 200);
    const opt = (y: number, n: string, a: string, b: string, c: string) => {
      g.fillStyle = c; g.beginPath(); g.roundRect(70, y, IW - 140, 230, 30); g.fill();
      g.fillStyle = "#ffffff"; g.font = F(92); g.fillText(n, 150, y + 150); g.textAlign = "left"; g.font = F(46); g.fillText(a, 230, y + 100); g.fillText(b, 230, y + 160); g.textAlign = "center";
    };
    opt(250, "1", "SHOW MUM", "THE VIDEO", "#1f4fb8"); opt(510, "2", "KEEP OLLIE", "AWAY FROM HER", "#9c2a2a");
    g.fillStyle = "#e9edf5"; g.font = F(40); g.fillText("COMMENT 1 OR 2", IW / 2, 820);
    g.fillStyle = "#8b93a5"; g.font = F(30); g.fillText("PART 2 · THE WATER GAME", IW / 2, 1330);   // below the captions
  },
  // the end card
  endCard: (g) => {
    g.fillStyle = "#05070a"; g.fillRect(0, 0, IW, IH); g.textAlign = "center";
    g.fillStyle = "#8b93a5"; g.font = F(34); g.fillText("WHAT OLLIE SAYS AT 3 A.M.", IW / 2, 590);
    g.fillStyle = "#e9edf5"; g.font = F(58); g.fillText("PART 2", IW / 2, 700); g.font = F(66); g.fillText("THE WATER GAME", IW / 2, 800);
    g.strokeStyle = "rgba(120,160,175,0.55)"; g.lineWidth = 4; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(200 + k * 30, 870 + k * 22); g.quadraticCurveTo(IW / 2, 850 + k * 22, IW - 200 - k * 30, 870 + k * 22); g.stroke(); }
  },
};
const insertRig = (a: At, v = "knock"): PropRig => {
  const root = rigRoot(a), draw = INSERTS[v] ?? INSERTS.knock, texAt = (st: number) => stex(`olIns_${v}_${st}`, IW, IH, (g) => draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(step >= 1 ? 1 : 0); } };
};

// ---------------------------------------------------------------- props
/** ferryWater: the river and the flood at night (dark, rippling, lamp glints), absolute in ferryBack whatever `at` is.
 *  Variants: river (the river only, 1.1 m below the path), lawn (over the path and the bottom of the lawn, from z 15),
 *  high (episode 4: over the lawn from z 11). Steady steps make the surface flow. */
const WATER: Record<string, { y: number; z0: number }> = { river: { y: -1.1, z0: 23.5 }, lawn: { y: 0.04, z0: 15 }, high: { y: 0.06, z0: 11 } };
/** garden (Part 1): the river risen ONLY over our garden. A flat sheet between our side fences (x -3.2..3.2) from z 10.8,
 *  across the path to the bank, where it climbs out of the river; a bright edge line where it stops at each fence and
 *  at its near shore; on the path past the fences it stands in a clean, glassy wall. Next door's lawns stay dry under
 *  their own lights (a cold security floodlight on the right-hand neighbour's back wall, a warm kitchen light on the left) */
const GF = { x0: -3.2, x1: 3.2, z0: 10.8, z1: 23.5, y: 0.16 };
const gardenFloodRig = (a: At): PropRig => {
  const root = rigRoot(a), inner = new THREE.Group(); inner.position.set(-a.x, -(a.y ?? 0), -a.z); root.add(inner);
  const wmat = (rx: number, ry: number) => { const t = waterTex().clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return { t, m: new THREE.MeshLambertMaterial({ map: t, color: "#9fb1b4", emissive: "#ffffff", emissiveMap: t, emissiveIntensity: 0.9 }) }; };
  const w = GF.x1 - GF.x0, len = GF.z1 - GF.z0, flood = wmat(0.7, 1.4), river = wmat(12, 9);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(w, len).rotateX(-Math.PI / 2), flood.m); sheet.position.set(0, GF.y, GF.z0 + len / 2); sheet.receiveShadow = true; inner.add(sheet);
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(140, 96.5).rotateX(-Math.PI / 2), river.m); bed.position.set(0, -1.1, 23.5 + 48.25); inner.add(bed);
  const rise = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.49), flood.m); rise.rotation.x = -0.567; rise.position.set(0, (GF.y - 1.1) / 2, 23.9); inner.add(rise);   // climbing out of the river
  const glassM = new THREE.MeshBasicMaterial({ color: "#4f6d76", transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
  for (const x of [GF.x0, GF.x1]) { const wall = new THREE.Mesh(new THREE.PlaneGeometry(GF.z1 - 20.7, GF.y).rotateY(Math.PI / 2), glassM); wall.position.set(x, GF.y / 2, (20.7 + GF.z1) / 2); wall.layers.set(NOINK); inner.add(wall); }
  const edgeM = new THREE.MeshBasicMaterial({ color: "#d8ecf2", transparent: true, opacity: 0.9, toneMapped: false });
  for (const x of [GF.x0 + 0.03, GF.x1 - 0.03]) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.06, len).rotateX(-Math.PI / 2), edgeM); e.position.set(x, GF.y + 0.004, GF.z0 + len / 2); e.layers.set(NOINK); inner.add(e); }
  const shore = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.06).rotateX(-Math.PI / 2), edgeM); shore.position.set(0, GF.y + 0.004, GF.z0 + 0.03); shore.layers.set(NOINK); inner.add(shore);
  const sec = new THREE.PointLight("#e6eeff", 6, 20, 1.3); sec.position.set(5.0, 2.7, 1.3); inner.add(sec);
  const fix = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.12), new THREE.MeshBasicMaterial({ color: "#f4f8ff", toneMapped: false })); fix.position.set(5.0, 2.75, 0.08); fix.layers.set(NOINK); inner.add(fix);
  const kit = new THREE.PointLight("#ffd9a8", 3, 14, 1.4); kit.position.set(-5.0, 2.2, 1.2); inner.add(kit);
  return { root, update: ({ step = 0 }) => { flood.t.offset.set(step * 0.002, -step * 0.005); river.t.offset.set(step * 0.004, -step * 0.012); } };
};
const waterRig = (a: At, v = "river"): PropRig => {
  if (v === "garden") return gardenFloodRig(a);
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

/** olPhoneCam (Part 1's hook): Ava's phone camera over a shot, an overlay card 0.27 x 0.48 m held 0.5 m in front of
 *  an `at` camera with fov 50 (the CCTV-overlay method): corner brackets, REC, the clock 03:00:0s ticking every 7 steps
 *  (give it steady steps); variant post adds the typed post text */
const POST = ["He's six.", "He's never heard Polish.", "That isn't his voice."];
const phoneCamTex = (sec: number, post: boolean) => stex(`olPhoneCam${post ? "P" : ""}${sec}`, 540, 960, (g) => {
  g.clearRect(0, 0, 540, 960);
  const vg = g.createRadialGradient(270, 480, 240, 270, 480, 640); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.7)"); g.fillStyle = vg; g.fillRect(0, 0, 540, 960);
  g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 4; for (const [x, y, dx, dy] of [[56, 150, 1, 1], [484, 150, -1, 1], [56, 840, 1, -1], [484, 840, -1, -1]] as const) { g.beginPath(); g.moveTo(x, y + dy * 40); g.lineTo(x, y); g.lineTo(x + dx * 40, y); g.stroke(); }
  g.fillStyle = "#ff3b30"; g.beginPath(); g.arc(84, 112, 11, 0, 7); g.fill();
  g.fillStyle = "rgba(255,255,255,0.95)"; g.font = "bold 28px 'DejaVu Sans', sans-serif"; g.textAlign = "left"; g.fillText("REC", 102, 122);
  g.textAlign = "right"; g.font = "bold 30px 'DejaVu Sans Mono', monospace"; g.fillText(`03:00:${String(sec).padStart(2, "0")}`, 486, 122);
  g.textAlign = "center"; g.font = "24px 'DejaVu Sans', sans-serif"; g.fillStyle = "rgba(0,0,0,0.45)"; g.beginPath(); g.roundRect(240, 880, 60, 36, 18); g.fill(); g.fillStyle = "rgba(255,255,255,0.9)"; g.fillText("1×", 270, 906);
  if (post) {
    g.font = "bold 31px 'DejaVu Sans', sans-serif";
    POST.forEach((l, i) => { const y = 690 + i * 54, tw = g.measureText(l).width; g.fillStyle = "rgba(0,0,0,0.62)"; g.beginPath(); g.roundRect(270 - tw / 2 - 16, y - 34, tw + 32, 48, 10); g.fill(); g.fillStyle = "#ffffff"; g.fillText(l, 270, y); });
  }
});
const phoneCamRig = (a: At, v = "rec"): PropRig => {
  const root = rigRoot(a), post = v === "post", mat = new THREE.MeshBasicMaterial({ map: phoneCamTex(0, post), transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.48), mat); m.renderOrder = 10; m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0, camPos }) => {
    mat.map = phoneCamTex(Math.floor(step / 7) % 60, post);
    const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos);   // 0.5 m in front of the lens, square to it
  } };
};

// ---------------------------------------------------------------- characters
// Kate (Katarzyna): 38, long dark hair (an adult silhouette next to Ollie's curls), pale, an oatmeal cardigan over a long grey nightdress, barefoot; the scar is an
// insert. Ava: 15, brown ponytail, oversized grey hoodie, navy pyjama bottoms, socks. Ollie: 6, dark curls (Kate's),
// green dinosaur pyjamas (stripes stand in for the print), barefoot. Mark: 42, sandy hair, water-company hi-vis.
const KATE: Look = { name: "Kate", build: "adult", skin: "#f0d2b8", seed: 501, hair: { style: "long", color: "#2a1d17" },
  top: { style: "dress", color: "#8e939b" }, layer: { style: "cardigan", color: "#d6c6a2" }, legs: "#f0d2b8", shoes: "#f0d2b8" };
const AVA: Look = { name: "Ava", build: "petite", skin: "#f3cfb2", seed: 502, hair: { style: "ponytail", color: "#5c3d27" },
  top: { style: "hoodie", color: "#8b9098", accent: "#f2c94c" }, legs: "#2a3350", shoes: "#dcd7cf" };
const OLLIE: Look = { name: "Ollie", build: "kid", skin: "#f0d2b8", seed: 503, hair: { style: "curly", color: "#2a1d17" },
  top: { style: "stripes", color: "#5e8f3c", accent: "#9cc46a" }, legs: "#5e8f3c", shoes: "#f0d2b8" };
/** Ollie in Part 1's last scene: wrapped in a pale bath towel (the layer) over his wet pyjamas */
const OLLIE_TOWEL: Look = { ...OLLIE, name: "Ollie (towel)", layer: { style: "cardigan", color: "#e9e4d8" } };
const MARK: Look = { name: "Mark", build: "stout", skin: "#e9bf9b", seed: 504, hair: { style: "short", color: "#b08a58" },
  top: { style: "shirt", color: "#2b3954" }, layer: { style: "blazer", color: "#e2dc3c", accent: "#2b3954" }, legs: "#2b2f3a", shoes: "#2a2320" };

export const OLLIE_THEME: Theme = {
  id: "ollie", name: "What Ollie Says at 3 A.M. (4 Ferry Lane, a house by a river)",
  desc: "a horror mini-series at night in a family house by a flooding river: the back of the house with the kitchen extension's flat roof under the parents' open bedroom window, the garden down to the river, rain, the flood; the Harper family",
  tags: ["horror", "night", "home", "family", "river", "flood", "rain", "sleepwalking"],
  mood: "hush",
  ambience: { "ferryBack:night": "amb_storm", ferryBack: "amb_storm" },
  steps: { ferryBack: "step_stone" },
  characters: { kate: KATE, ava: AVA, ollie: OLLIE, ollieTowel: OLLIE_TOWEL, mark: MARK },
  characterMeta: {
    kate: { name: "Kate Harper", desc: "38; long dark hair; pale; an oatmeal cardigan over a long grey nightdress; barefoot", personality: "a mother who relives the night of a flood in her sleep (What Ollie Says at 3 A.M.); asleep, her eyes stay open (blink: false)", themes: ["horror", "home", "family"], tags: ["mother", "female", "sleepwalker"] },
    ava: { name: "Ava Harper", desc: "15; brown ponytail; an oversized grey hoodie; navy pyjama bottoms; socks", personality: "the big sister who investigates and protects her brother (What Ollie Says at 3 A.M.)", themes: ["horror", "home", "family"], tags: ["teen", "girl", "sister"] },
    ollie: { name: "Ollie Harper", desc: "6; dark curls; green dinosaur pyjamas; barefoot at night", personality: "a little boy who says his mother's words at 3 a.m. to keep her out of the water (What Ollie Says at 3 A.M.)", themes: ["horror", "home", "family"], tags: ["child", "boy", "brother"] },
    ollieTowel: { name: "Ollie Harper (in a towel)", desc: "6; dark curls; wrapped in a pale bath towel over wet green pyjamas; barefoot", personality: "Ollie just pulled out of the water (What Ollie Says at 3 A.M., Part 1's last scene)", themes: ["horror", "home", "family"], tags: ["child", "boy", "brother", "towel"] },
    mark: { name: "Mark Harper", desc: "42; stocky; sandy hair; a yellow water-company hi-vis over a navy shirt", personality: "a kind, tired father on night shifts (What Ollie Says at 3 A.M.)", themes: ["home", "family", "work"], tags: ["father", "male", "hi-vis"] },
  },
  props: {
    ferryWater: { name: "River and flood (night)", desc: "the river behind 4 Ferry Lane and its flood, dark rippling water with lamp glints, placed absolutely in ferryBack whatever `at` is (put `at` where the shot looks); variants river (in its bed), lawn (over the bottom of the garden from z 15), high (over the lawn from z 11), garden (Part 1: ONLY over our garden, between the side fences from z 10.8 to the bank, a bright edge where it stops, next door's lawns dry under their security light); steady steps make it flow", category: "theme", themes: ["horror", "night", "flood"], tags: ["water", "river", "flood"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => waterRig(a, v ?? "river"), steps: ["it flows"], stepCount: () => 2000, variants: { river: () => undefined, lawn: () => undefined, high: () => undefined, garden: () => undefined } },
    olPhoneCam: { name: "Phone camera overlay (What Ollie Says at 3 A.M.)", desc: "Ava's phone camera over a shot: an overlay card 0.27 x 0.48 m held 0.5 m in front of an `at` camera (fov 50), wherever the camera moves: corner brackets, REC, the clock 03:00:0s ticking every 7 steps (give it steady steps); variant post adds the typed post text (He's six. / He's never heard Polish. / That isn't his voice.)", category: "theme", themes: ["horror", "phone", "overlay"], tags: ["phone", "camera", "overlay", "recording"], radius: 0.05, height: 0.48,
      build: () => undefined, rig: (a, v) => phoneCamRig(a, v ?? "rec"), steps: ["it ticks"], stepCount: () => 400, variants: { rec: () => undefined, post: () => undefined } },
    olInsert: { name: "Close insert (What Ollie Says at 3 A.M.)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. Variants: knock (Ava's knuckles on the shared wall), clock (red LED clock: 2:59, then 3:00 at step 1), clock258, rec (her phone recording), trans (the translator: line 1, then both at step 1), transLive (TAKE HIM!), callDad, palm (Kate's scarred palm round a mug), flash08 (2008: a small hand slipping from a woman's, above black water), feet (Ollie's wet feet with grass), wrist (red finger marks); Part 1: phoneClock (Ava's lock screen 02:59, then 03:00 at step 1), phone258, towelPhoto (Kate's tea towel pressed to the photo), tinLid (the dinosaur sticker, Ava's thumb), tinOpen (dry tissue, the wet photo, a drop; step 1 the drop on her fingers), photoBack (Kubuś · 2008), match (the photo beside Ollie's school photo; step 1 laid over it, a tear), pull (V-ripples dragging his pyjama legs), kateFeet (wet feet, grass, footprints on tiles), photoTable (the wet photo on the kitchen table), choice (the closing A/B card), endCard (PART 2: THE WATER GAME)", category: "theme", themes: ["horror", "home", "insert"], tags: ["insert", "close-up", "phone", "clock", "hand", "clue"], radius: 0.05, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "knock"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
    rain: { name: "Rain (falling, around the camera)", desc: "heavy rain: thin streaks falling all round the camera (1.2-15 m), never inside the house at 4 Ferry Lane (z < 0.05); camera-relative, so `at` can be any point in the shot (its look point); give it steady steps 0.15 s apart (its clock)", category: "theme", themes: ["night", "weather", "horror"], tags: ["rain", "weather", "storm"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => rainRig(a), steps: ["it falls"], stepCount: () => 2000 },
  },
  sets: { ollieRoom: { id: "ollieRoom", title: "Ollie's bedroom at 4 Ferry Lane: his bed against the wall he shares with Ava, the shelf with the nursery camera", lights: ["interiorCool", "night", "interior"], build: ollieRoom },
    avaRoom: { id: "avaRoom", title: "Ava's bedroom: her bed against the shared wall, Ollie's drawing and fairy lights over it, the window on the garden", lights: ["interiorCool", "night", "interior"], build: avaRoom },
    ferryKitchen: { id: "ferryKitchen", title: "The kitchen at 4 Ferry Lane: the table and bench, the stove, the back door with its top bolt, the window on the garden", lights: ["interior", "interiorCool", "night"], build: () => ferryKitchen() },
    ferryKitchenNight: { id: "ferryKitchenNight", title: "The kitchen at 4 Ferry Lane after dark: a dark window and dark door glass", lights: ["night", "interiorCool", "interior"], build: () => ferryKitchen(true) },
    ferryBack: { id: "ferryBack", title: "4 Ferry Lane, the back at night: the kitchen extension's flat roof under the open bedroom window, the garden down to the river", lights: ["night"], build: ferryBack } },
  layouts: { ferryBack: { spots: FERRY_SPOTS, views: FERRY_VIEWS }, ollieRoom: { spots: OLLIE_SPOTS, views: OLLIE_VIEWS }, avaRoom: { spots: AVA_SPOTS, views: AVA_VIEWS }, ferryKitchen: { spots: KITCHEN_SPOTS, views: KITCHEN_VIEWS }, ferryKitchenNight: { spots: KITCHEN_SPOTS, views: KITCHEN_VIEWS } },
  setMeta: { ollieRoom: { name: "Ollie's bedroom", desc: "a small boy's bedroom (3.4 x 3.2 m, open toward +z): the bed along x with its head at the right wall (the wall shared with Ava's room), 0.85 m off the back wall; spots bed (sitting up in bed: mode sit), asleep (only the head above the duvet), kneel (BEHIND the bed, 0.36 m below the floor: reads as kneeling at the bedside), tuck, door, floor; the shelf with the nursery camera on the left wall; the garden window in the back wall", themes: ["home", "family", "horror"], tags: ["bedroom", "child", "bed", "night"] },
    avaRoom: { name: "Ava's bedroom", desc: "a teenager's bedroom (3.4 x 3.2 m, open toward +z), the mirror of Ollie's: the bed's head at the LEFT wall (the wall shared with Ollie's room) under his crayon drawing and a string of fairy lights; a bedside table with a red LED clock; spots bed, asleep, bedEdge, window, door, floor", themes: ["home", "family", "horror"], tags: ["bedroom", "teen", "bed", "night"] },
    ferryKitchen: { name: "Kitchen, 4 Ferry Lane", desc: "the family kitchen (4.4 x 3.6 m, open toward +z): back wall with the garden window over the counter (x -1.0) and the half-glazed back door (x 1.35) with a brass top bolt; a table in the middle with a bench behind it (spot tableBack, mode sit) and two chairs (tableL, tableR); stove on the left wall (spot stove); the calendar on the right wall; spots door, stairs, floor", themes: ["home", "family"], tags: ["kitchen", "table", "door", "bolt", "breakfast"] },
    ferryKitchenNight: { name: "Kitchen, 4 Ferry Lane (night)", desc: "after dark (a dark pane in the garden window, dark door glass): the family kitchen (4.4 x 3.6 m, open toward +z): back wall with the garden window over the counter (x -1.0) and the half-glazed back door (x 1.35) with a brass top bolt; a table in the middle with a bench behind it (spot tableBack, mode sit) and two chairs (tableL, tableR); stove on the left wall (spot stove); the calendar on the right wall; spots door, stairs, floor", themes: ["home", "family"], tags: ["kitchen", "table", "door", "bolt", "breakfast"] },
    ferryBack: { name: "4 Ferry Lane (back, night)", desc: "the house's rear wall faces +z at z 0 (x -3..3). The kitchen extension x -3..0.6, z 0..3.4, its flat felt roof at y 2.72 with a 30 cm brick upstand (top 3.02) on the open edges; actors stand on the roof at y 2.72 (spots roofEdge, roofEdgeOllie, roofWindow, roofMid, roofWall). Kate and Mark's bedroom behind the open sash window (x -1.75..-0.65, sill 3.22), floor 2.8 (spots roomWindow, roomBed, roomDoor). Patio z 3.4..5.2, lawn to the back fence and gate at z 21, river beyond; add ferryWater for the water and rain for the weather", themes: ["horror", "home", "night", "river"], tags: ["house", "garden", "roof", "river", "flood", "bedroom", "window"] } },
};
