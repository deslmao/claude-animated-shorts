// Extra Door theme (Video 05, "The Extra Door"): Milo's upstairs hallway at night, with seven cream doors, the top of
// the stairs going down, and at the far end an old door that should not exist. The clue: the clean, unfaded patch of
// wallpaper where the big family photo hung, its bare nail above, and the photo lying on the floor below. Props: the
// old door (stepped: knocks, the light under it breaking into two shadows, a handle pushing out through the solid wood
// and turning), the photo, a phone display for macro inserts, and flat A / B choice labels. Reuse for any
// home-at-night, mystery or horror story.
import * as THREE from "three";
import type { Theme } from "..";
import { INK } from "../../characters/toon";
import { Batch, V, quad } from "../../materials/geo";
import { wallpaperHD, plasterHD, ceilingHD } from "../../materials/paint2";
import { At, frame, col, glow, box, rbox, cyl, sph } from "../../props/kit";
import { rug, picture, clock, pendant, floorMat } from "../../props/interior";
import { displayTextOk } from "../../props/displays";
import { NOINK } from "../../look/ink";
import type { View } from "../../sets/types";
import type { PropRig } from "../../props/registry";

type V3 = [number, number, number];
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------------- stable canvas textures (text and pictures) ----------------
// CPU-backed canvases with a system font (as props/displays.ts): the same input always draws the same pixels, so
// chunked renders on different workers match.
const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  stable.set(key, t);
  return t;
};
const FONT = (px: number) => `bold ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const rrect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};

// ---------------- the hallway ----------------
// A closed corridor 1.8 m wide (x -0.9..0.9), 2.6 m high, from the far end wall (z -7.0, the old door) to the near
// wall (z +1.6). The stairwell is open along the left wall in the middle of the hallway (x -0.9..-0.05, z -4.7..-2.1):
// the top of the stairs is at its far end (toward the old door) and ten steps go down toward the near end, so a view
// down the hallway sees the risers falling away into the dark, with a banister along x -0.05 and across the near end.
// Doors: three on the left wall, four on the right (seven). The end wall carries the clue: the clean patch, the nail.
const HW = 0.9, ZE = -7.0, ZN = 1.6, H = 2.6, LOW = 0.95, SWX = -0.05, SZ0 = -2.1, SZ1 = -4.7, DEEP = -2.2;
const LEFT_DOORS = [0.6, -0.9, -5.6], RIGHT_DOORS = [0.5, -1.2, -2.9, -4.6];
const PAPER = ["#a8946e", "#6f5c43"] as const, CLEAN = ["#e4d1a1", "#9a7f56"] as const; // same length keys: same stripes
const PATCH = { x0: -0.6, x1: 0.6, y0: 1.4, y1: 2.2 }, NAIL_Y = 2.25;

const HALL_LAYOUT = {
  ceiling: H,
  spots: {
    nearEnd: [0.3, 0, 0.9] as V3, hallNear: [0.35, 0, -1.0] as V3, hallMid: [0.4, 0, -3.0] as V3, stairsTop: [-0.45, 0, -4.95] as V3,
    nearDoor: [0.25, 0, -5.6] as V3, atDoor: [0, 0, -6.15] as V3, backedAway: [0.7, 0, -4.6] as V3, oldDoor: [0, 0, ZE] as V3,
    photo: [0, 0, ZE + 0.9] as V3, stairs: [-0.48, 0, -3.4] as V3, phone: [0.25, 0, -5.3] as V3,
  },
  views: [
    { name: "hallway", pos: [0, 1.0, 1.25], look: [0, 1.05, ZE], fov: 40, establishing: true },
    { name: "reverse", pos: [0.1, 1.45, -5.2], look: [0, 1.2, 0.6], fov: 44 },
    { name: "endWall", pos: [0, 1.5, -4.6], look: [0, 1.25, ZE], fov: 40 },
  ] as View[],
};

/** a vertical wall face from p0 to p1 ([x, z]); its front is to the left walking p0 -> p1 (quad winding): painted dado
 *  below 0.95 m, wallpaper above (texture repeats as sets/room.ts: paper per 2 m, dado per 1 m) */
const wallFace = (b: Batch, p0: [number, number], p1: [number, number], y0: number, y1: number, paper: THREE.Material, dado: THREE.Material) => {
  const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  const q = (ya: number, yb: number, m: THREE.Material, per: number) => {
    if (yb - ya < 1e-3) return;
    b.add(quad(V(p0[0], ya, p0[1]), V(p1[0], ya, p1[1]), V(p1[0], yb, p1[1]), V(p0[0], yb, p0[1]), L / per, (yb - ya) / per, 0, (ya - (per === 2 ? LOW : 0)) / per), m);
  };
  if (y0 < LOW) q(y0, Math.min(y1, LOW), dado, 1);
  if (y1 > LOW) q(Math.max(y0, LOW), y1, paper, 2);
};

/** a cream four-panel door with a brass knob on a wall, facing local +z (closed; its frame stands 5 cm off the wall) */
const hallDoor = (b: Batch, a: At) => {
  const m = frame(a), trim = col("#eae2d2"), slab = col("#e6dcc6"), panel = col("#d9ceb6"), brass = col("#c9a24e");
  box(b, trim, m, -0.48, -0.41, 0, 2.07, 0, 0.05); box(b, trim, m, 0.41, 0.48, 0, 2.07, 0, 0.05); box(b, trim, m, -0.48, 0.48, 2.0, 2.07, 0, 0.05);
  box(b, slab, m, -0.41, 0.41, 0, 2.0, 0.006, 0.04);
  for (const [x0, x1] of [[-0.33, -0.04], [0.04, 0.33]]) for (const [y0, y1] of [[0.18, 0.92], [1.12, 1.86]]) box(b, panel, m, x0, x1, y0, y1, 0.04, 0.047);
  sph(b, brass, m, 0.32, 1.0, 0.047, 0.034, 0.034, 0.007);
  sph(b, brass, m, 0.32, 1.0, 0.072, 0.03, 0.03, 0.024);
};

const hallway = () => {
  const root = new THREE.Group(), shell = new Batch(), b = new Batch();
  const paper = glowless(PAPER[0], PAPER[1]), dado = col("#56677a"), deep = col("#1f1b22"), trim = col("#e4dacb");
  const I = new THREE.Matrix4();
  // walls (fronts face into the corridor)
  wallFace(shell, [-HW, ZE], [HW, ZE], 0, H, paper, dado);                       // far end wall (faces +z)
  wallFace(shell, [-HW, ZN], [-HW, ZE], 0, H, paper, dado);                      // left (faces +x)
  wallFace(shell, [HW, ZE], [HW, ZN], 0, H, paper, dado);                        // right (faces -x)
  wallFace(shell, [HW, ZN], [-HW, ZN], 0, H, paper, dado);                       // near wall (faces -z)
  // the stairwell (x -0.9..-0.05, z -4.7..-2.1): its walls go down into the dark
  wallFace(shell, [-HW, SZ0], [-HW, SZ1], DEEP, 0, deep, deep);                  // left (faces +x)
  wallFace(shell, [SWX, SZ1], [SWX, SZ0], DEEP, 0, deep, deep);                  // under the banister (faces -x)
  wallFace(shell, [-HW, SZ1], [SWX, SZ1], DEEP, -0.2, deep, deep);               // under the top landing's edge (faces +z)
  wallFace(shell, [SWX, SZ0], [-HW, SZ0], DEEP, 0, deep, deep);                  // near end of the well (faces -z)
  shell.add(quad(V(-HW, DEEP, SZ0), V(SWX, DEEP, SZ0), V(SWX, DEEP, SZ1), V(-HW, DEEP, SZ1)), deep);
  // floor: the corridor past the stairwell, the walkway beside it, and the landing at the top
  const fl = floorMat(["#8f6a48", "#86613f", "#97714d", "#7e5a3b"]);
  shell.add(quad(V(-HW, 0, SZ1), V(HW, 0, SZ1), V(HW, 0, ZE), V(-HW, 0, ZE), (2 * HW) / 2, (SZ1 - ZE) / 2), fl);
  shell.add(quad(V(SWX, 0, SZ0), V(HW, 0, SZ0), V(HW, 0, SZ1), V(SWX, 0, SZ1), (HW - SWX) / 2, (SZ0 - SZ1) / 2), fl);
  shell.add(quad(V(-HW, 0, ZN), V(HW, 0, ZN), V(HW, 0, SZ0), V(-HW, 0, SZ0), (2 * HW) / 2, (ZN - SZ0) / 2), fl);
  // ceiling: an unlit bounce colour (as sets/room.ts), dim for night
  shell.add(quad(V(-HW, H, ZE), V(HW, H, ZE), V(HW, H, ZN), V(-HW, H, ZN), 1, 4), glow("ceilHallNight", () => ({ map: ceilingHD("#8c8377") })));
  // skirting, dado rail, cornice
  const runs: [number, number, number, number][] = [[-HW, ZE, HW, ZE], [-HW, ZE, -HW, SZ1], [-HW, SZ0, -HW, ZN], [HW, ZE, HW, ZN], [-HW, ZN, HW, ZN]];
  for (const [x0, z0, x1, z1] of runs) {
    const alongX = z0 === z1, s = alongX ? (z0 < 0 ? 1 : -1) : x0 < 0 ? 1 : -1;
    // trim goes in the shell batch (no cast shadows, as sets/room.ts builds it): the cornice threw a long diagonal
    // shadow across the end wall and the old door
    const slab = (y0: number, y1: number, d: number) => alongX
      ? box(shell, trim, I, x0, x1, y0, y1, Math.min(z0, z0 + s * d), Math.max(z0, z0 + s * d))
      : box(shell, trim, I, Math.min(x0, x0 + s * d), Math.max(x0, x0 + s * d), y0, y1, Math.min(z0, z1), Math.max(z0, z1));
    slab(0, 0.12, 0.025); slab(LOW, LOW + 0.035, 0.02);
  }
  for (const [x0, z0, x1, z1] of [[-HW, ZE, HW, ZE], [-HW, ZE, -HW, ZN], [HW, ZE, HW, ZN], [-HW, ZN, HW, ZN]] as [number, number, number, number][]) {
    const alongX = z0 === z1, s = alongX ? (z0 < 0 ? 1 : -1) : x0 < 0 ? 1 : -1;
    if (alongX) box(shell, trim, I, x0, x1, H - 0.1, H, Math.min(z0, z0 + s * 0.04), Math.max(z0, z0 + s * 0.04));
    else box(shell, trim, I, Math.min(x0, x0 + s * 0.04), Math.max(x0, x0 + s * 0.04), H - 0.1, H, Math.min(z0, z1), Math.max(z0, z1));
  }
  // the stairs: ten steps down from the top (the far end of the well) toward the near end, darker as they go down;
  // the top landing's edge
  box(b, col("#7a5a3e"), I, -HW + 0.002, SWX - 0.002, -0.2, -0.004, SZ1 - 0.3, SZ1);
  for (let i = 0; i < 10; i++) {
    const z0 = SZ1 + 0.25 * i, z1 = Math.min(SZ0 - 0.002, SZ1 + 0.25 * (i + 1)), k = i / 9;
    if (z1 <= z0) break;
    const c = new THREE.Color("#8a6446").lerp(new THREE.Color("#18131a"), Math.pow(k, 0.7));
    box(b, col("#" + c.getHexString()), I, -HW + 0.002, SWX - 0.002, DEEP + 0.01, -0.18 * (i + 1), z0, z1);
  }
  // banister along the stairwell's open side and across its far end, newel posts at the corners
  const rail = col("#5b3b28"), spindle = col("#efe8db");
  box(b, rail, I, SWX - 0.03, SWX + 0.03, 0.92, 0.97, SZ1, SZ0);
  for (let z = SZ1 + 0.12; z < SZ0 - 0.05; z += 0.13) box(b, spindle, I, SWX - 0.013, SWX + 0.013, 0, 0.92, z - 0.013, z + 0.013);
  box(b, rail, I, -HW + 0.002, SWX, 0.92, 0.97, SZ0 - 0.03, SZ0 + 0.03);
  for (let x = -HW + 0.12; x < SWX - 0.05; x += 0.13) box(b, spindle, I, x - 0.013, x + 0.013, 0, 0.92, SZ0 - 0.013, SZ0 + 0.013);
  for (const z of [SZ0, SZ1]) { box(b, rail, I, SWX - 0.05, SWX + 0.05, 0, 1.1, z - 0.05, z + 0.05); sph(b, rail, I, SWX, 1.13, z, 0.055, 0.045, 0.055); }
  // the seven doors
  for (const z of LEFT_DOORS) hallDoor(b, { x: -HW, z, yaw: Math.PI / 2 });
  for (const z of RIGHT_DOORS) hallDoor(b, { x: HW, z, yaw: -Math.PI / 2 });
  // pictures between the doors, the wall clock, lights, the runner, a plant
  ([[-HW + 0.01, -0.15, Math.PI / 2, 1], [-HW + 0.01, -3.4, Math.PI / 2, 0], [HW - 0.01, -0.35, -Math.PI / 2, 2], [HW - 0.01, -2.05, -Math.PI / 2, 3], [HW - 0.01, -3.75, -Math.PI / 2, 0]] as [number, number, number, number][])
    .forEach(([x, z, yaw, kind]) => picture(b, { x, z, y: 1.5, yaw }, 0.5, 0.4, kind));
  clock(b, { x: -HW + 0.02, z: -6.45, y: 1.95, yaw: Math.PI / 2 });
  // the pendants go in the shell batch (no cast shadows): their cords and shades threw long diagonal shadows on the door
  pendant(shell, { x: 0.15, z: 0.3, y: H }, 0.2);
  pendant(shell, { x: -0.3, z: -2.6, y: H }, 0.2);
  rug(b, { x: 0.42, z: -2.6 }, 0.7, 7.4, ["#6b2f3a", "#d9c7a2", "#2f4a5a"]);
  // the clue on the end wall: the clean patch where the photo hung (unfaded paper, the same stripes), a faint dust
  // line round it, and the bare nail directly above. The old door (a story prop) stands through its middle.
  const zP = ZE + 0.004, u = (x: number) => (x + HW) / 2, v = (y: number) => (y - LOW) / 2;
  shell.add(quad(V(PATCH.x0, PATCH.y0, zP), V(PATCH.x1, PATCH.y0, zP), V(PATCH.x1, PATCH.y1, zP), V(PATCH.x0, PATCH.y1, zP), u(PATCH.x1), v(PATCH.y1), u(PATCH.x0), v(PATCH.y0)), glowless(CLEAN[0], CLEAN[1]));
  const dust = col("#5a4a37"), e = 0.014, zD = ZE + 0.006;
  for (const [x0, x1, y0, y1] of [[PATCH.x0 - e, PATCH.x1 + e, PATCH.y1, PATCH.y1 + e], [PATCH.x0 - e, PATCH.x1 + e, PATCH.y0 - e, PATCH.y0], [PATCH.x0 - e, PATCH.x0, PATCH.y0, PATCH.y1], [PATCH.x1, PATCH.x1 + e, PATCH.y0, PATCH.y1]])
    shell.add(quad(V(x0, y0, zD), V(x1, y0, zD), V(x1, y1, zD), V(x0, y1, zD)), dust);
  cyl(b, col("#8d9098"), I, 0, NAIL_Y, ZE + 0.001, 0.0045, 0.0045, 0.035, 8, Math.PI / 2);
  sph(b, col("#9a9da5"), I, 0, NAIL_Y, ZE + 0.037, 0.01, 0.01, 0.0035);
  shell.build(root, false);
  b.build(root, true);
  return { root, env: { sky: false, clouds: false }, ...HALL_LAYOUT };
};
/** wallpaper as a lit (Lambert) material from paint2's wallpaperHD, repeat set by the quad UVs */
function glowless(base: string, motif: string) {
  return lamb(`wpHall${base}${motif}`, () => wallpaperHD(base, motif, "stripe"));
}
const lambs = new Map<string, THREE.Material>();
function lamb(key: string, t: () => THREE.Texture) {
  let m = lambs.get(key);
  if (!m) { m = new THREE.MeshLambertMaterial({ map: t() }); lambs.set(key, m); }
  return m;
}
void plasterHD;

// ---------------- the old door ----------------
// 0.65 x 1.95 m, dark old planks, no handle and no keyhole on this side, a 1.8 cm gap at the bottom with cold light
// behind it. Steps: 1-3 the knocks (the door shudders; on the third, two shadows stop behind it and break the light),
// 4 a brass handle pushes out through the solid wood, 5 it turns down. Variants set where a shot starts:
// "" (plain), "shadows" (after the third knock), "handle" (the handle out and turned).
const DW = 0.65, DH = 1.95, GAP = 0.018;
const doorTex = () => stex("oldDoorPlanks", 512, 1536, (g) => {
  const planks = 4, pw = 512 / planks;
  for (let i = 0; i < planks; i++) {
    const base = ["#3e2b21", "#35251d", "#432f23", "#2f2119"][i];
    g.fillStyle = base; g.fillRect(i * pw, 0, pw, 1536);
    for (let k = 0; k < 26; k++) { // grain
      const x = i * pw + 6 + ((k * 37 + i * 13) % (pw - 12));
      g.strokeStyle = k % 3 ? "rgba(20,12,8,0.35)" : "rgba(120,86,60,0.22)"; g.lineWidth = 1 + (k % 3);
      g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= 1536; y += 96) g.lineTo(x + Math.sin((y + k * 57) / 210) * 4, y);
      g.stroke();
    }
    g.fillStyle = "rgba(10,6,4,0.55)"; g.fillRect(i * pw, 0, 4, 1536);   // seams
  }
  for (const [x, y, r] of [[150, 420, 14], [330, 980, 11], [70, 1260, 9]]) { g.fillStyle = "rgba(18,10,7,0.6)"; g.beginPath(); g.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2); g.fill(); }
  const vg = g.createLinearGradient(0, 0, 512, 0); vg.addColorStop(0, "rgba(0,0,0,0.35)"); vg.addColorStop(0.5, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.35)");
  g.fillStyle = vg; g.fillRect(0, 0, 512, 1536);
});
/** the light under the door: a strip in the gap and its spill on the floor; shadows = two dark shapes in both */
const stripTex = (shadows: boolean) => stex(`oldDoorStrip${shadows}`, 512, 16, (g) => {
  g.fillStyle = "#e9f1ff"; g.fillRect(0, 0, 512, 16);
  if (shadows) { g.fillStyle = "#0d0b10"; g.fillRect(150, 0, 70, 16); g.fillRect(290, 0, 70, 16); }
});
const spillTex = (shadows: boolean) => stex(`oldDoorSpill${shadows}`, 512, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(215,228,255,0.6)"); gr.addColorStop(0.35, "rgba(215,228,255,0.25)"); gr.addColorStop(1, "rgba(215,228,255,0)");
  g.fillStyle = gr; g.fillRect(40, 0, 432, 256);
  const side = g.createLinearGradient(0, 0, 512, 0);
  side.addColorStop(0, "rgba(0,0,0,1)"); side.addColorStop(0.12, "rgba(0,0,0,0)"); side.addColorStop(0.88, "rgba(0,0,0,0)"); side.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = side; g.fillRect(0, 0, 512, 256);
  if (shadows) { // two long shadows fanning out from under the door
    g.fillStyle = "rgba(0,0,0,0.92)"; g.filter = "blur(10px)";
    for (const [x0, x1] of [[150, 220], [292, 362]]) { g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, 0); g.lineTo(x1 + (x1 - 256) * 0.35, 256); g.lineTo(x0 + (x0 - 256) * 0.35, 256); g.closePath(); g.fill(); }
    g.filter = "none";
  }
  g.globalCompositeOperation = "source-over";
});
const crackTex = () => stex("oldDoorCrack", 256, 256, (g) => {
  g.strokeStyle = "rgba(12,6,4,0.95)"; g.lineCap = "round";
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + 0.3, l = 70 + ((k * 29) % 45);
    g.lineWidth = 5 - (k % 3); g.beginPath(); g.moveTo(128, 128);
    g.lineTo(128 + Math.cos(a) * l * 0.5 + 6, 128 + Math.sin(a) * l * 0.5); g.lineTo(128 + Math.cos(a + 0.15) * l, 128 + Math.sin(a + 0.15) * l); g.stroke();
  }
  g.fillStyle = "rgba(10,5,3,0.9)"; g.beginPath(); g.arc(128, 128, 30, 0, Math.PI * 2); g.fill();
});
const basic = (key: string, p: () => THREE.MeshBasicMaterialParameters) => glow(key, p);
const doorFrameParts = (b: Batch, m: THREE.Matrix4) => {
  const fr = col("#26190f");
  box(b, fr, m, -DW / 2 - 0.07, -DW / 2, 0, DH + 0.07, 0, 0.05); box(b, fr, m, DW / 2, DW / 2 + 0.07, 0, DH + 0.07, 0, 0.05);
  box(b, fr, m, -DW / 2 - 0.07, DW / 2 + 0.07, DH, DH + 0.07, 0, 0.05);
};
const slabParts = (b: Batch, m: THREE.Matrix4) => {
  box(b, col("#2a1c15"), m, -DW / 2 + 0.003, DW / 2 - 0.003, GAP, DH - 0.004, 0.006, 0.044);
  b.add(new THREE.PlaneGeometry(DW - 0.006, DH - GAP - 0.004), lamb("oldDoorFace", doorTex), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, (DH + GAP) / 2, 0.0442)));
};
const lightParts = (b: Batch, m: THREE.Matrix4, shadows: boolean) => {
  b.add(new THREE.PlaneGeometry(DW - 0.01, GAP), basic(`oldDoorStripM${shadows}`, () => ({ map: stripTex(shadows), toneMapped: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, GAP / 2, 0.02)));
  b.add(new THREE.PlaneGeometry(0.84, 0.42).rotateX(-Math.PI / 2), basic(`oldDoorSpillM${shadows}`, () => ({ map: spillTex(shadows), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.003, 0.05 + 0.21)));
};
/** the brass handle (rosette + lever pointing to -x, toward the hinge side), its pivot at the origin, front +z */
const handleParts = (b: Batch, m: THREE.Matrix4) => {
  const brass = col("#c9a24e"), dark = col("#8d6e2c");
  cyl(b, brass, m, 0, 0, 0, 0.038, 0.034, 0.012, 22, Math.PI / 2);
  cyl(b, dark, m, 0, 0, 0.012, 0.011, 0.011, 0.025, 12, Math.PI / 2);
  box(b, brass, m, -0.12, 0.005, -0.009, 0.009, 0.03, 0.046);
  sph(b, brass, m, -0.12, 0, 0.038, 0.016, 0.014, 0.012);
};
const HANDLE_AT: V3 = [0.2, 1.0, 0.044];
const oldDoorStatic = (b: Batch, a: At, v = "") => {
  const m = frame(a), shadows = v === "shadows" || v === "handle";
  doorFrameParts(b, m); slabParts(b, m); lightParts(b, m, shadows);
  if (v === "handle") {
    const hm = m.clone().multiply(new THREE.Matrix4().makeTranslation(...HANDLE_AT)).multiply(new THREE.Matrix4().makeRotationZ(0.7));
    handleParts(b, hm);
    b.add(new THREE.PlaneGeometry(0.2, 0.2), basic("oldDoorCrackM", () => ({ map: crackTex(), transparent: true, depthWrite: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(HANDLE_AT[0], HANDLE_AT[1], HANDLE_AT[2] + 0.0006)));
  }
};
const BASE: Record<string, number> = { "": 0, shadows: 3, handle: 5 };
const oldDoorRig = (a: At, v = ""): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0;
  const I = new THREE.Matrix4();
  const fixed = new THREE.Group(), slab = new THREE.Group(), handle = new THREE.Group(), lever = new THREE.Group();
  const fb = new Batch(); doorFrameParts(fb, I); fb.build(fixed, true);
  const sb = new Batch(); slabParts(sb, I); sb.build(slab, true);
  const lights = [false, true].map((sh) => { const g = new THREE.Group(), lb = new Batch(); lightParts(lb, I, sh); lb.build(g, false); g.traverse((o) => { (o as THREE.Mesh).castShadow = false; }); return g; });
  const hb = new Batch(); handleParts(hb, I); hb.build(lever, true);
  handle.position.set(...HANDLE_AT); handle.add(lever);
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: crackTex(), transparent: true, depthWrite: false, opacity: 0 }));
  crack.position.set(HANDLE_AT[0], HANDLE_AT[1], HANDLE_AT[2] + 0.0006);
  // splinters standing out of the wood round the hole
  const splinters = new THREE.Group(); splinters.position.set(...HANDLE_AT);
  for (let k = 0; k < 8; k++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.045, 0.006).translate(0, 0.0225, 0), col(k % 2 ? "#6b4a33" : "#4a3325"));
    const ang = (k / 8) * Math.PI * 2; s.position.set(Math.cos(ang) * 0.045, Math.sin(ang) * 0.045, 0); s.rotation.z = ang - Math.PI / 2; s.userData.ang = ang;
    splinters.add(s);
  }
  slab.add(handle, crack, splinters);
  root.add(fixed, slab, ...lights);
  const base = BASE[v] ?? 0;
  return { root, update: ({ step = 0 }) => {
    const e = base + step;
    let shake = 0;
    for (let k = 0; k < 3; k++) { const f = clamp01(e - k); if (f > 0 && f < 1) shake += Math.sin(f * Math.PI * 7) * (1 - f) * 0.011; }
    slab.position.z = shake; slab.rotation.y = shake * 0.6;
    const sh = e > 2.04; lights[0].visible = !sh; lights[1].visible = sh;
    const out = clamp01(e - 3), turn = clamp01(e - 4);
    handle.visible = out > 0.001; handle.position.z = HANDLE_AT[2] - 0.06 * (1 - out);
    lever.rotation.z = 0.7 * turn;
    (crack.material as THREE.MeshBasicMaterial).opacity = clamp01(out * 4);
    splinters.visible = out > 0.02;
    splinters.children.forEach((s) => { s.scale.setScalar(clamp01(out * 3)); s.rotation.x = -0.9 * clamp01(out * 2); });
  } };
};

// ---------------- the photo of Milo and Juno ----------------
// 1.2 x 0.8 m in a dark wood frame (the size of the clean patch), lying face-up on the floor; its top edge toward the
// door. A simple painted portrait in the house style: the two of them at a sunset beach, smiling.
const photoTex = () => stex("photoMiloJuno", 900, 600, (g) => {
  const sky = g.createLinearGradient(0, 0, 0, 600); sky.addColorStop(0, "#f29a5c"); sky.addColorStop(0.55, "#f7c98a"); sky.addColorStop(0.56, "#4f8fb0"); sky.addColorStop(1, "#e9d3a6");
  g.fillStyle = sky; g.fillRect(0, 0, 900, 600);
  g.fillStyle = "#fff1c9"; g.beginPath(); g.arc(700, 250, 46, 0, Math.PI * 2); g.fill();
  g.lineWidth = 9; g.strokeStyle = INK; g.lineJoin = "round";
  const person = (cx: number, skin: string, top: string, hair: (cx: number) => void, glasses: boolean) => {
    g.fillStyle = top; g.beginPath(); g.ellipse(cx, 610, 170, 150, 0, Math.PI, 0); g.fill(); g.stroke();
    g.fillStyle = skin; g.beginPath(); g.ellipse(cx, 300, 108, 122, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    hair(cx);
    g.lineWidth = 8; g.strokeStyle = INK;
    for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 40, 300, 16, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }      // smiling eyes
    if (glasses) { g.lineWidth = 7; for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * 40, 296, 30, 0, Math.PI * 2); g.stroke(); } g.beginPath(); g.moveTo(cx - 10, 296); g.lineTo(cx + 10, 296); g.stroke(); }
    g.lineWidth = 8; g.beginPath(); g.arc(cx, 340, 40, Math.PI * 0.15, Math.PI * 0.85); g.stroke();                       // smile
    g.fillStyle = "rgba(230,110,110,0.45)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 70, 345, 18, 11, 0, 0, Math.PI * 2); g.fill(); }
    g.lineWidth = 9;
  };
  person(300, "#f5c9a0", "#e9a93b", (cx) => { // Milo: brown tuft
    g.fillStyle = "#4a2f22"; g.beginPath(); g.moveTo(cx - 105, 270); g.quadraticCurveTo(cx - 100, 175, cx, 172); g.quadraticCurveTo(cx + 100, 175, cx + 105, 270);
    for (let k = 0; k < 5; k++) { const x = cx + 80 - k * 40; g.lineTo(x, 225 + (k % 2) * 16); } g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx - 20, 176); g.lineTo(cx + 8, 120); g.lineTo(cx + 30, 178); g.fill(); g.stroke();
  }, false);
  person(590, "#c99067", "#23968a", (cx) => { // Juno: dark bob
    g.fillStyle = "#211a26"; g.beginPath(); g.moveTo(cx - 122, 360); g.quadraticCurveTo(cx - 135, 170, cx, 165); g.quadraticCurveTo(cx + 135, 170, cx + 122, 360);
    g.lineTo(cx + 92, 360); g.quadraticCurveTo(cx + 95, 245, cx + 20, 228); g.lineTo(cx - 92, 250); g.lineTo(cx - 92, 360); g.closePath(); g.fill(); g.stroke();
  }, true);
  g.fillStyle = "rgba(255,240,210,0.08)"; g.fillRect(0, 0, 900, 600);
});
const photoFrame = (b: Batch, a: At) => {
  const m = frame(a), wood = col("#4b3221"), W = 1.2, D = 0.8, T = 0.06;
  box(b, wood, m, -W / 2, W / 2, 0, 0.03, -D / 2, -D / 2 + T); box(b, wood, m, -W / 2, W / 2, 0, 0.03, D / 2 - T, D / 2);
  box(b, wood, m, -W / 2, -W / 2 + T, 0, 0.03, -D / 2 + T, D / 2 - T); box(b, wood, m, W / 2 - T, W / 2, 0, 0.03, -D / 2 + T, D / 2 - T);
  box(b, col("#2a1d14"), m, -W / 2 + T, W / 2 - T, 0, 0.012, -D / 2 + T, D / 2 - T);
  // the print, face up; its top edge toward local -z (the door)
  b.add(new THREE.PlaneGeometry(W - 2 * T, D - 2 * T).rotateX(-Math.PI / 2), lamb("photoMiloJunoM", photoTex), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.022, 0)));
};

// ---------------- the phone ----------------
// The macro-insert phone: a 7.5 x 15.5 cm handset standing upright (screen to local +z) in Milo's fingers, with its own
// 1024 x 2048 screen texture (sharp in a macro: about 1.5 texture pixels per screen pixel at 1080 x 1920). Steps:
// 1 he types "are you home?", 2 it is sent, 3 Juno's reply arrives. Variant "sent": the shot starts after the send.
const MSG = "are you home?", REPLY = ["No, I'm still", "at work. Why?"];
const screenTex = (typed: number, sent: boolean, reply: boolean) => stex(`phoneScr${typed}|${sent}|${reply}`, 1024, 2048, (g) => {
  g.fillStyle = "#101218"; g.fillRect(0, 0, 1024, 2048);
  g.fillStyle = "#cfd4de"; g.font = FONT(44); g.textBaseline = "middle"; g.textAlign = "left"; g.fillText("11:47", 64, 70);
  g.textAlign = "right"; g.fillText("▮▮▮", 960, 70);
  // header: Juno
  g.fillStyle = "#1b1e27"; g.fillRect(0, 130, 1024, 190);
  g.fillStyle = "#23968a"; g.beginPath(); g.arc(150, 225, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ffffff"; g.font = FONT(64); g.textAlign = "center"; g.fillText("J", 150, 228);
  g.textAlign = "left"; g.font = FONT(68); g.fillText("Juno", 240, 225);
  g.fillStyle = "#3a3f4d"; g.fillRect(0, 318, 1024, 3);
  // messages
  g.font = FONT(90);
  if (sent) {
    const w = g.measureText(MSG).width + 96, x = 1024 - 56 - w;
    g.fillStyle = "#3b82f6"; rrect(g, x, 430, w, 150, 60); g.fill();
    g.fillStyle = "#ffffff"; g.textAlign = "left"; g.fillText(MSG, x + 48, 507);
    g.fillStyle = "#8a90a0"; g.font = FONT(40); g.textAlign = "right"; g.fillText(reply ? "Read" : "Delivered", 1024 - 70, 625);
  }
  if (reply) {
    g.font = FONT(102);
    const w = Math.max(...REPLY.map((l) => g.measureText(l).width)) + 104;
    g.fillStyle = "#e9e9ee"; rrect(g, 56, 700, w, 300, 64); g.fill();
    g.fillStyle = "#111318"; g.textAlign = "left"; REPLY.forEach((l, i) => g.fillText(l, 108, 790 + i * 122));
  }
  // input bar + keyboard
  g.fillStyle = "#1b1e27"; g.fillRect(0, 1260, 1024, 788);
  g.fillStyle = "#2a2e3a"; rrect(g, 56, 1290, 800, 130, 65); g.fill();
  g.font = FONT(70); g.textAlign = "left";
  if (typed > 0 && !sent) { g.fillStyle = "#ffffff"; g.fillText(MSG.slice(0, typed), 100, 1357); const cw = g.measureText(MSG.slice(0, typed)).width; g.fillStyle = "#3b82f6"; g.fillRect(104 + cw, 1310, 8, 92); }
  else { g.fillStyle = "#6c7280"; g.fillText("Message", 100, 1357); }
  g.fillStyle = "#3b82f6"; g.beginPath(); g.arc(935, 1355, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(905, 1385); g.lineTo(970, 1355); g.lineTo(905, 1325); g.lineTo(915, 1355); g.closePath(); g.fill();
  g.fillStyle = "#3a3f4d";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10 - (r === 3 ? 6 : 0); c++) { const kw = r === 3 ? 380 : 86; const x0 = r === 3 ? 322 : 22 + c * 99 + (r === 1 ? 45 : r === 2 ? 95 : 0); if (r === 2 && c > 7) continue; rrect(g, x0 + (r === 3 ? c * 0 : 0), 1470 + r * 140, kw, 118, 16); g.fill(); }
});
const SKIN = "#f5c9a0";
const phoneBody = (b: Batch, m: THREE.Matrix4) => {
  rbox(b, col("#15161c"), m, 0, 0, 0, 0.075, 0.155, 0.009, 0.008);
  for (const s of [-1, 1]) for (const y of [0.035, 0.07, 0.105]) sph(b, col(SKIN), m, s * 0.04, y, 0.0, 0.011, 0.009, 0.009);
};
const PHONE_BASE: Record<string, number> = { "": 0, sent: 2 };
const phoneRig = (a: At, v = ""): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0; root.scale.setScalar(a.s ?? 1);
  const bb = new Batch(); phoneBody(bb, new THREE.Matrix4()); bb.build(root, true);
  const mat = new THREE.MeshBasicMaterial({ map: screenTex(0, false, false), toneMapped: false });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.142), mat); scr.position.set(0, 0.0775, 0.0047); root.add(scr);
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.022, 4, 10), col(SKIN)); thumb.rotation.z = 0.9; root.add(thumb);
  const base = PHONE_BASE[v] ?? 0;
  return { root, update: ({ step = 0 }) => {
    const e = base + step, typed = Math.min(MSG.length, Math.floor(clamp01(e) * (MSG.length + 0.99))), sent = e > 1.35, reply = e > 2.3;
    mat.map = screenTex(sent ? MSG.length : typed, sent, reply); mat.needsUpdate = true;
    const typing = e > 0 && e < 1.1;
    thumb.visible = e < 1.6;
    thumb.position.set(0.012 + 0.006 * Math.sin(e * 40), 0.035 + (typing ? 0.004 * Math.abs(Math.sin(e * 26)) : -0.01), 0.013);
  } };
};
const phoneStatic = (b: Batch, a: At, v = "") => {
  const m = frame(a); phoneBody(b, m);
  const sent = v === "sent" || v === "reply";
  b.add(new THREE.PlaneGeometry(0.068, 0.142), basic(`phoneScrM${v}`, () => ({ map: screenTex(sent ? MSG.length : 0, sent, v === "reply"), toneMapped: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.0775, 0.0047)));
};
// (in medium shots Milo holds the library's existing "phone" item, characters/items.ts)

// ---------------- the A / B choice labels ----------------
// Flat screen graphics: an unlit card that always faces the lens, drawn on top of the scene (never shaded, never
// hidden), popping in on its step. The variant is the text, "A: OPEN THE DOOR": the letter goes in the badge, the
// words on two lines. Size with `scale` (the card is 0.504 x 0.42 m at scale 1).
const LW = 720, LH = 600; // label canvas: badge on top, the choice on up to two lines at 96 px (on screen: 96 x width / 720)
const labelTex = (text: string) => stex(`choice${text}`, LW, LH, (g) => {
  const letter = text.trim()[0].toUpperCase(), words = text.replace(/^\s*\w\s*[:.-]?\s*/, "").toUpperCase().split(/\s+/);
  let best = [words.join(" "), ""], bw = 1e9;
  g.font = FONT(96);
  for (let i = 1; i < words.length; i++) { const l = [words.slice(0, i).join(" "), words.slice(i).join(" ")], w = Math.max(...l.map((s) => g.measureText(s).width)); if (w < bw) { bw = w; best = l; } }
  if (g.measureText(words.join(" ")).width <= LW - 70) best = [words.join(" "), ""];
  g.fillStyle = "#151220"; rrect(g, 6, 6, LW - 12, LH - 12, 60); g.fill();
  g.strokeStyle = "rgba(255,255,255,0.22)"; g.lineWidth = 4; rrect(g, 6, 6, LW - 12, LH - 12, 60); g.stroke();
  g.fillStyle = letter === "A" ? "#ffb23e" : "#4fd1ff"; g.beginPath(); g.arc(LW / 2, 118, 86, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#121018"; g.font = FONT(124); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(letter, LW / 2, 126);
  g.fillStyle = "#ffffff"; let px = 96; g.font = FONT(px);
  const wMax = Math.max(...best.map((s) => g.measureText(s).width)); if (wMax > LW - 70) { px = Math.floor((px * (LW - 70)) / wMax); g.font = FONT(px); }
  best.filter(Boolean).forEach((l, i, arr) => g.fillText(l, LW / 2, (arr.length > 1 ? 318 : 380) + i * (px + 22)));
});
const LABEL_H = 0.42, LABEL_W = (LABEL_H * LW) / LH;
// opaque (rounded corners cut by alphaTest) and depth-writing, drawn last over everything: the ink pass then treats the
// card like a character card (it is on the NOINK layer, and edges behind it are masked by its depth), so no outline of
// the scene behind can cross the label
// (depth test ON with an always-pass function: WebGL writes no depth at all when the depth test is off)
const labelMat = (text: string) => basic(`choiceM${text}`, () => ({ map: labelTex(text), alphaTest: 0.5, depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true, toneMapped: false }));
const choiceLabelRig = (a: At, v = "A: OPEN THE DOOR"): PropRig => {
  const root = new THREE.Group(), s = a.s ?? 1; root.position.set(a.x, a.y ?? 0, a.z);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(LABEL_W, LABEL_H), labelMat(v));
  // the card sits above its position like a standing prop (base at `at`, card centred h + 0.15 m up), so the caption
  // placer, which keeps stepped props clear from their base upward, keeps the captions off the labels
  card.position.y = LABEL_H * s + 0.15; card.renderOrder = 999; card.frustumCulled = false; card.layers.set(NOINK); root.add(card);
  return { root, update: ({ step = 0, camPos }) => {
    root.lookAt(camPos);
    const f = clamp01(step), pop = f <= 0 ? 0 : 1 + 0.18 * Math.sin(Math.PI * f) * (1 - f);
    card.visible = f > 0; card.scale.setScalar(s * Math.min(1, f * 3) * pop);
  } };
};
const choiceLabelStatic = (b: Batch, a: At, v = "A: OPEN THE DOOR") => {
  b.add(new THREE.PlaneGeometry(LABEL_W, LABEL_H), labelMat(v), frame(a).multiply(new THREE.Matrix4().makeTranslation(0, LABEL_H + 0.15, 0)));
};

export const EXTRADOOR_THEME: Theme = {
  id: "extradoor", name: "The extra door (home at night, horror)", desc: "Milo's upstairs hallway at night (seven cream doors, the top of the stairs going down, a wall clock, a runner), an old door that should not be there (knocks, shadows under it, a handle pushing through the wood), the photo of Milo and Juno, a phone with a readable message screen and flat A / B choice labels",
  tags: ["horror", "mystery", "night", "home", "hallway", "door", "stairs", "suspense", "choice", "interactive"],
  mood: "mystery",
  ambience: { hallway: "amb_room" },
  steps: { hallway: "step_floor" },
  props: {
    hallDoor: { name: "Hallway door", desc: "a closed cream four-panel door with a brass knob, in its frame (faces +z; stand it against a wall)", category: "furniture", themes: ["home", "modern", "any"], tags: ["door", "hallway", "house", "room"], radius: 0.5, height: 2.07, box: [0.48, 0.05], build: hallDoor },
    oldDoor: { name: "The old door", desc: "an old, dark, narrow plank door (0.65 x 1.95 m) with no handle and no keyhole, cold light in the gap under it (faces +z; stand it against a wall). Steps: 1-3 knocks (it shudders; on 3 two shadows break the light under it), 4 a brass handle pushes out through the solid wood, 5 the handle turns down. Variants: shadows (after the knocks), handle (the handle out and turned)", category: "theme", themes: ["horror", "mystery", "home"], tags: ["door", "horror", "knock", "handle", "mystery", "creepy"], radius: 0.4, height: 2.02, box: [0.4, 0.05],
      focus: { y: 1.0, span: 0.75 },
      build: (b, a, v) => oldDoorStatic(b, a, v), variants: { shadows: (b, a) => oldDoorStatic(b, a, "shadows"), handle: (b, a) => oldDoorStatic(b, a, "handle") },
      rig: oldDoorRig, steps: ["knock 1: the door shudders", "knock 2: the door shudders", "knock 3: it shudders and two shadows break the light under it", "a brass handle pushes out through the solid wood", "the handle turns down"],
      stepCount: (v) => 5 - (BASE[v ?? ""] ?? 0) },
    photoFrame: { name: "Photo of Milo and Juno", desc: "a big framed photo (1.2 x 0.8 m) of Milo and Juno smiling at a sunset beach, lying face-up on the floor (its top edge toward local -z)", category: "theme", themes: ["home", "mystery"], tags: ["photo", "picture", "frame", "family", "friends", "memory"], radius: 0.7, height: 0.03, box: [0.6, 0.4], build: photoFrame },
    phoneScreen: { name: "Phone (message screen)", desc: "a phone held upright in fingers (screen to +z, 15.5 cm), for macro inserts: a chat with Juno. Steps: 1 types \"are you home?\", 2 sends it, 3 Juno's reply \"No, I'm still at work. Why?\" arrives. Variant sent: starts after the send", category: "theme", themes: ["modern", "mystery", "any"], tags: ["phone", "message", "text", "chat", "screen"], radius: 0.06, height: 0.16,
      focus: { y: 0.0775, span: 0.085 },
      build: (b, a, v) => phoneStatic(b, a, v), variants: { sent: (b, a) => phoneStatic(b, a, "sent"), reply: (b, a) => phoneStatic(b, a, "reply") },
      rig: phoneRig, steps: ["types \"are you home?\"", "sends it", "Juno's reply arrives"], stepCount: (v) => 3 - (PHONE_BASE[v ?? ""] ?? 0) },
    choiceLabel: { name: "Choice label (A / B)", desc: "a flat on-screen choice label for a viewer vote: a dark rounded card, a coloured letter badge (A amber, B cyan) and the choice in white, always facing the lens and drawn over the scene (never a sign in the world). The variant is the text, \"A: OPEN THE DOOR\". Step 1 pops it in (hidden before)", category: "theme", themes: ["any", "interactive"], tags: ["label", "choice", "vote", "poll", "option", "interactive"], radius: 0.05, height: 0.42,
      build: (b, a, v) => choiceLabelStatic(b, a, v), rig: choiceLabelRig, steps: ["the label pops in"],
      param: { desc: "choice text: a letter, then the choice (1-18 letters, digits, spaces, . , : ! ? ' - $ % # & + /), e.g. A: OPEN THE DOOR", ok: (s) => displayTextOk(s) && /^\s*[A-Za-z]\s*[:.-]?\s+\S/.test(s) } },
  },
  sets: { hallway: { id: "hallway", title: "Upstairs hallway at night: seven doors, the stairs, the end wall", lights: ["interiorCool", "interior"], build: hallway } },
  layouts: { hallway: HALL_LAYOUT },
  setMeta: { hallway: { name: "Upstairs hallway (night)", desc: "a closed 1.8 m-wide corridor (x -0.9..0.9) from the end wall (z -7.0) to the near wall (z +1.6): three cream doors on the left, four on the right, pictures, a wall clock (left, z -6.45), two pendants, a runner; an open stairwell along the left wall mid-hall (x -0.9..-0.05, z -4.7..-2.1): the top of the stairs at its far end, toward the old door, ten steps going down toward the near end, banister along x -0.05 and across the near end; on the end wall the clean wallpaper patch (1.2 x 0.8 m, 1.4-2.2 m high) with a bare nail above it, where a photo hung (marks: nearEnd, hallNear, hallMid, stairsTop, backedAway, nearDoor, atDoor, oldDoor, photo, stairs, phone / views: hallway, reverse, endWall / lights: interiorCool)", themes: ["home", "modern", "horror", "mystery"], tags: ["indoor", "house", "hallway", "corridor", "stairs", "night", "doors", "horror"] } },
};
