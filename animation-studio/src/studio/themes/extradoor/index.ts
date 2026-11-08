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
import { ctex } from "../../materials/paint";
import { At, frame, col, glow, box, rbox, cyl, sph } from "../../props/kit";
import { picture, clock, pendant, floorMat } from "../../props/interior";
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
  // floor: the corridor past the stairwell, the walkway beside it, and the landing at the top. One WORLD-aligned
  // mapping for all three pieces (u = z / 2 m, v = x / 2 m), so the boards run unbroken along the hallway across the
  // joins (each piece starting its UVs at 0 put a seam and a board offset at every join)
  const fl = floorMat(["#8f6a48", "#86613f", "#97714d", "#7e5a3b"]);
  const floorPiece = (x0: number, x1: number, z0: number, z1: number) =>
    shell.add(quad(V(x0, 0, z0), V(x0, 0, z1), V(x1, 0, z1), V(x1, 0, z0), z1 / 2, x1 / 2, z0 / 2, x0 / 2), fl);
  floorPiece(-HW, HW, ZE, SZ1); floorPiece(SWX, HW, SZ1, SZ0); floorPiece(-HW, HW, SZ0, ZN);
  // ceiling: an unlit bounce colour (as sets/room.ts), dim for night
  shell.add(quad(V(-HW, H, ZE), V(HW, H, ZE), V(HW, H, ZN), V(-HW, H, ZN), 1, 4), glow("ceilHallNight", () => ({ map: ceilingHD("#8c8377") })));
  // skirting, dado rail, cornice
  // (the end wall's skirting and dado rail stop at the old door's frame, x -0.4..0.4: the door stands where the wall
  // was, and a skirting running behind it hid the light in the gap under the door)
  const runs: [number, number, number, number][] = [[-HW, ZE, -0.4, ZE], [0.4, ZE, HW, ZE], [-HW, ZE, -HW, SZ1], [-HW, SZ0, -HW, ZN], [HW, ZE, HW, ZN], [-HW, ZN, HW, ZN]];
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
  // the runner: a repeating pattern tiled along its length (the library rug is one medallion image for a room rug;
  // stretched over 7.4 m it smeared into a giant diamond and long diagonal bands)
  const RX0 = 0.07, RX1 = 0.77, RZ0 = -6.4, RZ1 = 1.2, RL = 0.9;
  shell.add(quad(V(RX0, 0.004, RZ0), V(RX0, 0.004, RZ1), V(RX1, 0.004, RZ1), V(RX1, 0.004, RZ0), (RZ1 - RZ0) / RL, 1, 0, 0), lamb("hallRunner", runnerTex));
  // the clue on the end wall: the clean patch where the photo hung (unfaded paper, the same stripes), a faint dust
  // line round it, and the bare nail directly above. The old door (a story prop) stands through its middle.
  const zP = ZE + 0.004, u = (x: number) => (x + HW) / 2, v = (y: number) => (y - LOW) / 2;
  shell.add(quad(V(PATCH.x0, PATCH.y0, zP), V(PATCH.x1, PATCH.y0, zP), V(PATCH.x1, PATCH.y1, zP), V(PATCH.x0, PATCH.y1, zP), u(PATCH.x1), v(PATCH.y1), u(PATCH.x0), v(PATCH.y0)), glowless(CLEAN[0], CLEAN[1]));
  const dust = col("#5a4a37"), e = 0.014, zD = ZE + 0.006;
  for (const [x0, x1, y0, y1] of [[PATCH.x0 - e, PATCH.x1 + e, PATCH.y1, PATCH.y1 + e], [PATCH.x0 - e, PATCH.x1 + e, PATCH.y0 - e, PATCH.y0], [PATCH.x0 - e, PATCH.x0, PATCH.y0, PATCH.y1], [PATCH.x1, PATCH.x1 + e, PATCH.y0, PATCH.y1]])
    shell.add(quad(V(x0, y0, zD), V(x1, y0, zD), V(x1, y1, zD), V(x0, y1, zD)), dust);
  cyl(b, col("#8d9098"), I, 0, NAIL_Y, ZE + 0.001, 0.0065, 0.0065, 0.05, 8, Math.PI / 2);
  sph(b, col("#b4b7bf"), I, 0, NAIL_Y, ZE + 0.052, 0.017, 0.017, 0.005);
  shell.build(root, false);
  // the set dressing (doors, frames, pictures, clock, banister, stairs) casts no shadows, as sets/room.ts builds its
  // trim and door: built as casters they threw the doors' and the banister spindles' shadows across most of the floor
  // and the steps, leaving random striped pools of key light. Story props and characters keep their own shadows.
  b.build(root, false);
  return { root, env: { sky: false, clouds: false }, ...HALL_LAYOUT };
};
/** the runner's repeat (0.9 m along the hallway = the canvas width): wine ground, cream and teal border bands along
 *  both long edges, a small diamond medallion and dots */
const runnerTex = () => {
  const t = ctex("hallRunner", 1024, 512, (g) => {
    g.fillStyle = "#5e2733"; g.fillRect(0, 0, 1024, 512);
    for (const [y, h, c] of [[0, 46, "#d9c7a2"], [46, 22, "#2f4a5a"], [444, 22, "#2f4a5a"], [466, 46, "#d9c7a2"]] as [number, number, string][]) { g.fillStyle = c; g.fillRect(0, y, 1024, h); }
    g.fillStyle = "#2f4a5a"; g.beginPath(); g.moveTo(512, 140); g.lineTo(700, 256); g.lineTo(512, 372); g.lineTo(324, 256); g.closePath(); g.fill();
    g.fillStyle = "#d9c7a2"; g.beginPath(); g.moveTo(512, 196); g.lineTo(604, 256); g.lineTo(512, 316); g.lineTo(420, 256); g.closePath(); g.fill();
    g.fillStyle = "#c0545f"; for (const x of [96, 928]) { g.beginPath(); g.arc(x, 256, 34, 0, Math.PI * 2); g.fill(); }
  });
  return t;
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
  if (shadows) { g.fillStyle = "#0d0b10"; g.fillRect(128, 0, 104, 16); g.fillRect(280, 0, 104, 16); }
});
const spillTex = (shadows: boolean) => stex(`oldDoorSpill${shadows}`, 512, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "rgba(215,228,255,0.95)"); gr.addColorStop(0.35, "rgba(215,228,255,0.5)"); gr.addColorStop(1, "rgba(215,228,255,0)");
  g.fillStyle = gr; g.fillRect(40, 0, 432, 256);
  const side = g.createLinearGradient(0, 0, 512, 0);
  side.addColorStop(0, "rgba(0,0,0,1)"); side.addColorStop(0.12, "rgba(0,0,0,0)"); side.addColorStop(0.88, "rgba(0,0,0,0)"); side.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = side; g.fillRect(0, 0, 512, 256);
  if (shadows) { // two long shadows fanning out from under the door
    g.fillStyle = "rgba(0,0,0,0.92)"; g.filter = "blur(10px)";
    for (const [x0, x1] of [[128, 232], [280, 384]]) { g.beginPath(); g.moveTo(x0, 0); g.lineTo(x1, 0); g.lineTo(x1 + (x1 - 256) * 0.6, 256); g.lineTo(x0 + (x0 - 256) * 0.6, 256); g.closePath(); g.fill(); }
    g.filter = "none";
  }
  g.globalCompositeOperation = "source-over";
});
/** the two shadows as a darkening layer (normal blending: an additive light can brighten but never darken the floor) */
const shadowTex = () => stex("oldDoorShadows", 512, 256, (g) => {
  g.filter = "blur(8px)"; g.fillStyle = "rgba(6,4,10,0.78)";
  for (const [x0, x1] of [[128, 232], [280, 384]]) { g.beginPath(); g.moveTo(x0, -10); g.lineTo(x1, -10); g.lineTo(x1 + (x1 - 256) * 0.6, 256); g.lineTo(x0 + (x0 - 256) * 0.6, 256); g.closePath(); g.fill(); }
  g.filter = "none";
  const fade = g.createLinearGradient(0, 0, 0, 256); fade.addColorStop(0, "rgba(0,0,0,0)"); fade.addColorStop(0.7, "rgba(0,0,0,0)"); fade.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = fade; g.fillRect(0, 0, 512, 256); g.globalCompositeOperation = "source-over";
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
  if (shadows) b.add(new THREE.PlaneGeometry(0.84, 0.42).rotateX(-Math.PI / 2), basic("oldDoorShadowM", () => ({ map: shadowTex(), transparent: true, depthWrite: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.004, 0.05 + 0.21)));
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
const photoFrame = (b: Batch, a: At) => photoParts(b, frame(a));
/** the framed photo's parts in frame m (Video 06 reuses them for the photo lying on the stairs) */
const photoParts = (b: Batch, m: THREE.Matrix4) => {
  const wood = col("#4b3221"), W = 1.2, D = 0.8, T = 0.06;
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
/** a choice label's text: a letter, then the choice in the display character set, up to 20 characters (the card wraps
 *  the choice onto two lines and shrinks it to fit, so it takes more than a one-line sign's 18) */
const choiceTextOk = (s: string) => /^\s*[A-Za-z]\s*[:.-]?\s+[A-Za-z0-9 .,:!?'\-$%#&+/]{1,20}$/.test(s) && /\S/.test(s.replace(/^\s*[A-Za-z]\s*[:.-]?\s+/, ""));
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

// =====================================================================================================================
// Video 06 (The Extra Door, Part 2) additions. Additions only: Part 1's props, set and textures are untouched (these
// entries reuse Part 1's photo, phone, label and door parts; a protected entry's variants are part of its fingerprint,
// so Part 2's states are sibling entries).
// =====================================================================================================================

// ---------------- the photo lying along the stairs, and its cracked glass ----------------
// Part 1's photo (same parts, same print), lying face-up along a flight of 0.2 m risers / 0.25 m treads, resting on the
// step edges: tilted up the stairs by the stair pitch, its top edge up the stairs (local -z). `at` = the middle of its
// back, on the line through the step edges. Step 1: the glass cracks (instantly, under a foot). Variant cracked: the
// same crack from the start (the match cut).
const STAIR_PITCH = Math.atan2(0.2, 0.25);
/** one long crack across the glass, from the impact point (low right, where the foot came down) up across the glass
 *  to the top edge, with a few short branches and a small star at the impact. Drawn as glass: a bright, refracted line
 *  with a faint dark hairline beside it, so it reads as broken glass over the print, never as a mark on the people */
const glassCrackTex = () => stex("photoGlassCrack", 900, 600, (g) => {
  type P = [number, number];
  const main: P[] = [[748, 556], [706, 474], [664, 404], [624, 344], [578, 282], [530, 220], [478, 150], [428, 76], [394, 0]];
  const branches: P[][] = [[[706, 474], [788, 438], [900, 452]], [[624, 344], [700, 312], [752, 250]], [[578, 282], [494, 312], [418, 300]],
    [[530, 220], [586, 150], [610, 96]], [[748, 556], [650, 584], [590, 600]], [[748, 556], [858, 574], [900, 570]], [[478, 150], [400, 160]]];
  const line = (pts: P[], w: number, c: string, dx = 0, dy = 0) => {
    g.strokeStyle = c; g.lineWidth = w; g.lineJoin = "miter"; g.lineCap = "round"; g.beginPath();
    g.moveTo(pts[0][0] + dx, pts[0][1] + dy); for (const p of pts.slice(1)) g.lineTo(p[0] + dx, p[1] + dy); g.stroke();
  };
  for (const [pts, k] of [[main, 1], ...branches.map((b) => [b, 0.6] as const)] as [P[], number][]) {
    line(pts, 4 * k, "rgba(25,30,40,0.5)", 3, 2);   // the dark hairline beside the break
    line(pts, 3.6 * k, "rgba(255,255,255,0.96)");    // the bright edge of the broken glass
  }
  for (let k = 0; k < 11; k++) { const a = (k / 11) * Math.PI * 2 + 0.25, l = 22 + ((k * 13) % 20); line([[748, 556], [748 + Math.cos(a) * l, 556 + Math.sin(a) * l]], 2.5, "rgba(255,255,255,0.92)"); }
  g.fillStyle = "rgba(255,255,255,0.4)"; g.beginPath(); g.arc(748, 556, 11, 0, Math.PI * 2); g.fill();
});
const CRACK_AT: V3 = [0, 0.0235, 0];   // just above the print (0.022), inside the frame (0.03)
const crackPlane = () => new THREE.PlaneGeometry(1.2 - 0.12, 0.8 - 0.12).rotateX(-Math.PI / 2);
const photoStairsStatic = (b: Batch, a: At, cracked: boolean) => {
  const m = frame(a).multiply(new THREE.Matrix4().makeRotationX(STAIR_PITCH));
  photoParts(b, m);
  if (cracked) b.add(crackPlane(), basic("photoGlassCrackM", () => ({ map: glassCrackTex(), transparent: true, depthWrite: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(...CRACK_AT)));
};
const photoStairsRig = (a: At, v = ""): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0;
  const tilt = new THREE.Group(); tilt.rotation.x = STAIR_PITCH; root.add(tilt);
  const pb = new Batch(); photoParts(pb, new THREE.Matrix4()); pb.build(tilt, true);
  const crack = new THREE.Mesh(crackPlane(), new THREE.MeshBasicMaterial({ map: glassCrackTex(), transparent: true, depthWrite: false }));
  crack.position.set(...CRACK_AT); tilt.add(crack);
  const base = v === "cracked" ? 1 : 0;
  return { root, update: ({ step = 0 }) => { crack.visible = base + step > 0.001; } };
};

// ---------------- the phone: the same chat, two new messages from Juno ----------------
// Part 1's handset and screen design. The thread scrolls as messages arrive: Part 1's exchange ("are you home?" /
// "No, I'm still at work. Why?") at the top, the new ones below, the newest just above the input bar, large.
// Steps: 1 "Left work early. I'm outside, open the door?" arrives, 2 "Who's that in your upstairs window?".
// Variant msg1: the shot starts with the first one already there.
const NEW_MSGS = ["Left work early. I'm outside, open the door?", "Who's that in your upstairs window?"];
const wrapText = (g: CanvasRenderingContext2D, text: string, maxW: number) => {
  const out: string[] = []; let cur = "";
  for (const w of text.split(" ")) { const t = cur ? `${cur} ${w}` : w; if (cur && g.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur);
  return out;
};
const screenOutsideTex = (n: number) => stex(`phoneScrOutside${n}`, 1024, 2048, (g) => {
  g.fillStyle = "#101218"; g.fillRect(0, 0, 1024, 2048);
  // the thread, laid out from the input bar upward (the oldest scrolls up under the header)
  g.textBaseline = "middle";
  type Msg = { lines: string[]; out: boolean; font: number };
  g.font = FONT(98);
  const msgs: Msg[] = [{ lines: [MSG], out: true, font: 90 }, { lines: REPLY, out: false, font: 102 },
    ...NEW_MSGS.slice(0, n).map((t) => ({ lines: wrapText(g, t, 1024 - 112 - 104), out: false, font: 98 }))];
  let bottom = 1232;
  for (const m of [...msgs].reverse()) {
    g.font = FONT(m.font);
    const h = m.out ? 150 : 56 + m.lines.length * 122, top = bottom - h, w = Math.max(...m.lines.map((l) => g.measureText(l).width)) + (m.out ? 96 : 104);
    const x = m.out ? 1024 - 56 - w : 56;
    g.fillStyle = m.out ? "#3b82f6" : "#e9e9ee"; rrect(g, x, top, w, h, m.out ? 60 : 64); g.fill();
    g.fillStyle = m.out ? "#ffffff" : "#111318"; g.textAlign = "left";
    if (m.out) g.fillText(m.lines[0], x + 48, top + 77);
    else m.lines.forEach((l, i) => g.fillText(l, 108, top + 90 + i * 122));
    if (m.out) { g.fillStyle = "#8a90a0"; g.font = FONT(40); g.textAlign = "right"; g.fillText("Read", 1024 - 70, bottom + 45); }
    bottom = top - (m.out ? 40 : 40) - (msgs.indexOf(m) === 1 ? 50 : 0); // room for "Read" under the sent bubble
  }
  // status bar and header over the scrolled thread
  g.fillStyle = "#101218"; g.fillRect(0, 0, 1024, 130);
  g.fillStyle = "#cfd4de"; g.font = FONT(44); g.textAlign = "left"; g.fillText("11:49", 64, 70);
  g.textAlign = "right"; g.fillText("▮▮▮", 960, 70);
  g.fillStyle = "#1b1e27"; g.fillRect(0, 130, 1024, 190);
  g.fillStyle = "#23968a"; g.beginPath(); g.arc(150, 225, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ffffff"; g.font = FONT(64); g.textAlign = "center"; g.fillText("J", 150, 228);
  g.textAlign = "left"; g.font = FONT(68); g.fillText("Juno", 240, 225);
  g.fillStyle = "#3a3f4d"; g.fillRect(0, 318, 1024, 3);
  // input bar + keyboard (as Part 1)
  g.fillStyle = "#1b1e27"; g.fillRect(0, 1260, 1024, 788);
  g.fillStyle = "#2a2e3a"; rrect(g, 56, 1290, 800, 130, 65); g.fill();
  g.font = FONT(70); g.textAlign = "left"; g.fillStyle = "#6c7280"; g.fillText("Message", 100, 1357);
  g.fillStyle = "#3b82f6"; g.beginPath(); g.arc(935, 1355, 62, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(905, 1385); g.lineTo(970, 1355); g.lineTo(905, 1325); g.lineTo(915, 1355); g.closePath(); g.fill();
  g.fillStyle = "#3a3f4d";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 10 - (r === 3 ? 6 : 0); c++) { const kw = r === 3 ? 380 : 86; const x0 = r === 3 ? 322 : 22 + c * 99 + (r === 1 ? 45 : r === 2 ? 95 : 0); if (r === 2 && c > 7) continue; rrect(g, x0, 1470 + r * 140, kw, 118, 16); g.fill(); }
});
const OUT_BASE: Record<string, number> = { "": 0, msg1: 1 };
const phoneOutsideRig = (a: At, v = ""): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0; root.scale.setScalar(a.s ?? 1);
  const bb = new Batch(); phoneBody(bb, new THREE.Matrix4()); bb.build(root, true);
  const mat = new THREE.MeshBasicMaterial({ map: screenOutsideTex(0), toneMapped: false });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.142), mat); scr.position.set(0, 0.0775, 0.0047); root.add(scr);
  const base = OUT_BASE[v] ?? 0;
  return { root, update: ({ step = 0 }) => { const e = base + step, n = e > 1.02 ? 2 : e > 0.02 ? 1 : 0; mat.map = screenOutsideTex(n); mat.needsUpdate = true; } };
};
const phoneOutsideStatic = (b: Batch, a: At, v = "") => {
  const m = frame(a); phoneBody(b, m);
  b.add(new THREE.PlaneGeometry(0.068, 0.142), basic(`phoneScrOutsideM${v}`, () => ({ map: screenOutsideTex(OUT_BASE[v] ?? 0), toneMapped: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.0775, 0.0047)));
};

// ---------------- Part 1's vote, with the winner selected (the Part 2 opening callback) ----------------
// Part 1's choice label (the same card texture, size, placement above `at`, drawn over everything, no outline), shown
// from the first frame as Part 1 left it. Chosen, step 1: a bright green outline and glow fade in, the card brightens
// slightly and pops once, and a small "YOU CHOSE B" tag pops in above it. Dimmed, step 1: the card fades to a
// desaturated copy at 40 % opacity with a soft shadow behind it. Step 2 (both): gone (on the cut out of the callback).
const SEL_M = 70;
const selectTex = () => stex("choiceSelected", LW + 2 * SEL_M, LH + 2 * SEL_M, (g) => {
  g.shadowColor = "rgba(46,255,128,0.95)"; g.shadowBlur = 54; g.strokeStyle = "#2eff80"; g.lineWidth = 22;
  for (let k = 0; k < 3; k++) { rrect(g, SEL_M + 4, SEL_M + 4, LW - 8, LH - 8, 62); g.stroke(); }
  g.shadowBlur = 0; g.lineWidth = 12; g.strokeStyle = "#a6ffca"; rrect(g, SEL_M + 4, SEL_M + 4, LW - 8, LH - 8, 62); g.stroke();
});
const tagTex = (text: string) => stex(`choiceTag${text}`, 560, 150, (g) => {
  g.fillStyle = "#16a34a"; rrect(g, 6, 6, 548, 138, 69); g.fill();
  g.strokeStyle = "#a6ffca"; g.lineWidth = 6; rrect(g, 6, 6, 548, 138, 69); g.stroke();
  g.fillStyle = "#ffffff"; g.font = FONT(74); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 280, 80);
});
const dimTex = (text: string) => stex(`choiceDim${text}`, LW, LH, (g) => {
  g.filter = "grayscale(1) brightness(0.8)"; g.drawImage(labelTex(text).image as CanvasImageSource, 0, 0); g.filter = "none";
});
const cardShadowTex = () => stex("choiceCardShadow", LW + 2 * SEL_M, LH + 2 * SEL_M, (g) => {
  g.filter = "blur(24px)"; g.fillStyle = "rgba(0,0,0,0.85)"; rrect(g, SEL_M + 14, SEL_M + 30, LW - 12, LH - 12, 60); g.fill(); g.filter = "none";
});
const choiceStateRig = (chosen: boolean) => (a: At, v = "A: OPEN THE DOOR"): PropRig => {
  const root = new THREE.Group(), s = a.s ?? 1; root.position.set(a.x, a.y ?? 0, a.z);
  const holder = new THREE.Group(); holder.position.y = LABEL_H * s + 0.15; root.add(holder);
  const over = (map: THREE.Texture, w: number, h: number, order: number, y = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: false, toneMapped: false, opacity: 0 }));
    m.position.y = y; m.renderOrder = order; m.frustumCulled = false; m.layers.set(NOINK); holder.add(m); return m;
  };
  const card = new THREE.Mesh(new THREE.PlaneGeometry(LABEL_W, LABEL_H), new THREE.MeshBasicMaterial({ map: labelTex(v), alphaTest: 0.5, transparent: !chosen, depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true, toneMapped: false }));
  card.renderOrder = 999; card.frustumCulled = false; card.layers.set(NOINK); holder.add(card);
  const ew = LABEL_W * (LW + 2 * SEL_M) / LW, eh = LABEL_H * (LH + 2 * SEL_M) / LH;
  const glowM = chosen ? over(selectTex(), ew, eh, 1000) : null;
  const tagH = 0.105, tagW = tagH * 560 / 150, letter = v.trim()[0].toUpperCase();
  // the tag is opaque and writes depth like the card (rounded ends cut by alphaTest), so no scene outline crosses it
  const tag = chosen ? new THREE.Mesh(new THREE.PlaneGeometry(tagW, tagH), new THREE.MeshBasicMaterial({ map: tagTex(`YOU CHOSE ${letter}`), alphaTest: 0.5, depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: true, toneMapped: false })) : null;
  if (tag) { tag.position.y = LABEL_H / 2 + 0.035 + tagH / 2; tag.renderOrder = 1001; tag.frustumCulled = false; tag.layers.set(NOINK); holder.add(tag); }
  const shadow = chosen ? null : over(cardShadowTex(), ew, eh, 998);
  const gray = chosen ? null : over(dimTex(v), LABEL_W, LABEL_H, 1000);
  const cm = card.material as THREE.MeshBasicMaterial;
  return { root, update: ({ step = 0, camPos }) => {
    root.lookAt(camPos);
    const f = clamp01(step);
    root.visible = step <= 1.0005;
    if (chosen) {
      const pop = 1 + 0.12 * Math.sin(Math.PI * f) * (1 - f);
      holder.scale.setScalar(s * pop);
      (glowM!.material as THREE.MeshBasicMaterial).opacity = clamp01(f * 3);
      cm.color.setScalar(1 + 0.16 * clamp01(f * 3));
      const k = clamp01((f - 0.12) / 0.3); tag!.visible = k > 0; tag!.scale.setScalar(k * (1 + 0.3 * Math.sin(Math.PI * k) * (1 - k)));
    } else {
      holder.scale.setScalar(s);
      const k = clamp01(f * 2.5);
      cm.opacity = 1 - k; card.visible = cm.opacity > 0.01;
      (gray!.material as THREE.MeshBasicMaterial).opacity = 0.4 * k;
      (shadow!.material as THREE.MeshBasicMaterial).opacity = 0.55 * k;
    }
  } };
};

// ---------------- the front door ----------------
// A cream front door (0.86 x 2.05 m) with a frosted glass panel in its upper half, lit amber from outside by the porch
// light, its warm spill on the floor inside; a brass knob and lock. Nobody's shadow is ever on the glass. Steps 1-3:
// a knock each (the slab and the glass shudder in the frame). Faces +z; stand it against a wall.
const FDW = 0.86, FDH = 2.05, FG = { x0: -0.27, x1: 0.27, y0: 1.12, y1: 1.86 };
const frostTex = () => stex("frontDoorFrost", 256, 384, (g) => {
  const gr = g.createRadialGradient(128, 118, 10, 128, 160, 260); gr.addColorStop(0, "#ffe2a6"); gr.addColorStop(0.45, "#f5b65f"); gr.addColorStop(1, "#b8662a");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
  for (let k = 0; k < 900; k++) { const x = (k * 97) % 256, y = (k * 151) % 384; g.fillStyle = k % 2 ? "rgba(255,240,210,0.10)" : "rgba(120,60,20,0.08)"; g.fillRect(x, y, 3, 3); } // frosting
  g.strokeStyle = "rgba(120,70,30,0.35)"; g.lineWidth = 6; g.strokeRect(3, 3, 250, 378);
});
const porchSpillTex = () => stex("frontDoorSpill", 256, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "rgba(255,190,110,0.55)"); gr.addColorStop(0.5, "rgba(255,170,90,0.22)"); gr.addColorStop(1, "rgba(255,160,80,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  const side = g.createLinearGradient(0, 0, 256, 0); side.addColorStop(0, "rgba(0,0,0,1)"); side.addColorStop(0.3, "rgba(0,0,0,0)"); side.addColorStop(0.7, "rgba(0,0,0,0)"); side.addColorStop(1, "rgba(0,0,0,1)");
  g.globalCompositeOperation = "destination-out"; g.fillStyle = side; g.fillRect(0, 0, 256, 512); g.globalCompositeOperation = "source-over";
});
const frontFrameParts = (b: Batch, m: THREE.Matrix4) => {
  const trim = col("#eae2d2");
  box(b, trim, m, -FDW / 2 - 0.08, -FDW / 2, 0, FDH + 0.08, 0, 0.05); box(b, trim, m, FDW / 2, FDW / 2 + 0.08, 0, FDH + 0.08, 0, 0.05);
  box(b, trim, m, -FDW / 2 - 0.08, FDW / 2 + 0.08, FDH, FDH + 0.08, 0, 0.05);
};
const frontSlabParts = (b: Batch, m: THREE.Matrix4) => {
  const slab = col("#e6dcc6"), panel = col("#d9ceb6"), brass = col("#c9a24e"), X = FDW / 2 - 0.004;
  box(b, slab, m, -X, FG.x0, 0, FDH - 0.004, 0.006, 0.045); box(b, slab, m, FG.x1, X, 0, FDH - 0.004, 0.006, 0.045);   // stiles
  box(b, slab, m, FG.x0, FG.x1, FG.y1, FDH - 0.004, 0.006, 0.045); box(b, slab, m, FG.x0, FG.x1, 0, FG.y0, 0.006, 0.045); // rails
  for (const [y0, y1] of [[0.2, 0.55], [0.65, 1.0]]) box(b, panel, m, -0.25, 0.25, y0, y1, 0.045, 0.052);
  for (const [x0, x1, y0, y1] of [[FG.x0 - 0.02, FG.x1 + 0.02, FG.y0 - 0.02, FG.y0], [FG.x0 - 0.02, FG.x1 + 0.02, FG.y1, FG.y1 + 0.02], [FG.x0 - 0.02, FG.x0, FG.y0, FG.y1], [FG.x1, FG.x1 + 0.02, FG.y0, FG.y1]])
    box(b, panel, m, x0, x1, y0, y1, 0.045, 0.055);                                                                 // glazing bead
  sph(b, brass, m, 0.33, 1.0, 0.052, 0.034, 0.034, 0.008); sph(b, brass, m, 0.33, 1.0, 0.078, 0.03, 0.03, 0.024);
  box(b, brass, m, 0.3, 0.36, 1.12, 1.2, 0.045, 0.052);                                                             // the lock
  b.add(new THREE.PlaneGeometry(FG.x1 - FG.x0, FG.y1 - FG.y0), basic("frontDoorGlassM", () => ({ map: frostTex(), toneMapped: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, (FG.y0 + FG.y1) / 2, 0.026)));
};
const frontSpillParts = (b: Batch, m: THREE.Matrix4) => {
  b.add(new THREE.PlaneGeometry(1.1, 2.2).rotateX(-Math.PI / 2), basic("frontDoorSpillM", () => ({ map: porchSpillTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.004, 1.15)));
};
const frontDoorStatic = (b: Batch, a: At) => { const m = frame(a); frontFrameParts(b, m); frontSlabParts(b, m); frontSpillParts(b, m); };
const frontDoorRig = (a: At): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0;
  const I = new THREE.Matrix4(), fixed = new THREE.Group(), slab = new THREE.Group(), spill = new THREE.Group();
  const fb = new Batch(); frontFrameParts(fb, I); fb.build(fixed, true);
  const sb = new Batch(); frontSlabParts(sb, I); sb.build(slab, true);
  const lb = new Batch(); frontSpillParts(lb, I); lb.build(spill, false);
  root.add(fixed, slab, spill);
  return { root, update: ({ step = 0 }) => {
    let shake = 0;
    for (let k = 0; k < 3; k++) { const f = clamp01(step - k); if (f > 0 && f < 1) shake += Math.sin(f * Math.PI * 7) * (1 - f) * 0.011; }
    slab.position.z = shake; slab.rotation.y = shake * 0.6;
  } };
};

// ---------------- the downstairs hall ----------------
// The ground-floor entrance hall at night, under Part 1's hallway: 2.4 m wide (x -1.1..1.3), 2.6 m high, from the front
// door's wall (z -6.0) to the back wall (z +1.2). The stairs rise along the left wall, 1.3 m wide (x -1.1..0.2): thirteen
// 0.2 m steps from the bottom riser (z -1.3) up toward the front of the house to a landing at 2.6 m (z -6.0..-4.55),
// whose back wall is where the old door stands in Part 2. Open stairwell above the flight (to 5.2 m) with a dim lamp at
// the landing; banister along the flight's open side; under the landing a closed wall. The corridor beside the stairs
// (x 0.2..1.3) leads to the front door (centre x 0.75) with its amber frosted glass; one cream door on the right wall.
const DX0 = -1.1, DX1 = 1.3, DZF = -6.0, DZB = 1.2, SX = 0.2, SB = -1.3, NSTEP = 13, RISE = 0.2, RUN = 0.25, LZ = SB - RUN * NSTEP, WELL = 5.2;
/** the height of a foot on the downstairs flight at z (the line through the middle of the treads; 0 below the flight) */
export const downstairsY = (z: number) => Math.max(0, Math.min(H, RISE + (RISE / RUN) * (SB - RUN / 2 - z)));
const stairCX = (DX0 + SX) / 2;
const DOWN_LAYOUT = {
  ceiling: H,
  spots: {
    stairsFoot: [stairCX, 0, -0.75] as V3, landing: [stairCX, H, -5.3] as V3, landingDoor: [stairCX, H, DZF] as V3,
    hallMid: [0.75, 0, -2.9] as V3, nearFront: [0.75, 0, -4.9] as V3, frontDoor: [0.75, 0, DZF] as V3, back: [0.45, 0, 0.4] as V3,
    // the photo's back on the line through the step edges, between steps 6 and 8
    photoStairs: [stairCX, RISE + (RISE / RUN) * (SB - -3.3), -3.3] as V3,
  },
  views: [
    { name: "hall", pos: [0.55, 1.55, 1.0], look: [0.35, 1.1, DZF], fov: 46, establishing: true },
    { name: "upStairs", pos: [stairCX, 1.45, 0.4], look: [stairCX, 3.0, -5.6], fov: 50 },
    { name: "frontDoor", pos: [0.75, 1.5, -2.8], look: [0.75, 1.3, DZF], fov: 44 },
  ] as View[],
};
const downstairs = () => {
  const root = new THREE.Group(), shell = new Batch(), b = new Batch();
  const paper = glowless(PAPER[0], PAPER[1]), dado = col("#56677a"), trim = col("#e4dacb"), I = new THREE.Matrix4();
  // walls (fronts into the hall): left, right, back, the front wall, and the corridor side of the closed space under
  // the landing; above the ceiling, the stairwell's walls up to its own ceiling
  wallFace(shell, [DX0, DZB], [DX0, DZF], 0, H, paper, dado);            // left (faces +x), behind the flight
  wallFace(shell, [DX1, DZF], [DX1, DZB], 0, H, paper, dado);            // right (faces -x)
  wallFace(shell, [DX1, DZB], [DX0, DZB], 0, H, paper, dado);            // back (faces -z)
  wallFace(shell, [SX, DZF], [DX1, DZF], 0, H, paper, dado);             // front wall beside the landing (faces +z)
  wallFace(shell, [SX, LZ], [SX, DZF], 0, H, paper, dado);               // under the landing, corridor side (faces +x)
  wallFace(shell, [DX0, SB], [DX0, DZF], H, WELL, paper, dado);           // the well: left (faces +x)
  wallFace(shell, [DX0, DZF], [SX, DZF], H, WELL, paper, dado);           // the well: the landing's back wall (faces +z)
  wallFace(shell, [SX + 0.06, DZF], [SX + 0.06, SB], H, WELL, paper, dado); // the well: right, above the hall ceiling (faces -x)
  wallFace(shell, [SX + 0.06, SB], [DX0, SB], H, WELL, paper, dado);      // the well: over the foot of the stairs (faces -z)
  shell.add(quad(V(DX0, WELL, DZF), V(SX + 0.06, WELL, DZF), V(SX + 0.06, WELL, SB), V(DX0, WELL, SB), 1, 4), glow("ceilHallNight", () => ({ map: ceilingHD("#8c8377") })));
  // floor (world-aligned boards, as the hallway) and the landing's floor at 2.6 m
  const fl = floorMat(["#8f6a48", "#86613f", "#97714d", "#7e5a3b"]);
  shell.add(quad(V(DX0, 0, DZF), V(DX0, 0, DZB), V(DX1, 0, DZB), V(DX1, 0, DZF), DZB / 2, DX1 / 2, DZF / 2, DX0 / 2), fl);
  shell.add(quad(V(DX0, H, DZF), V(DX0, H, LZ), V(SX, H, LZ), V(SX, H, DZF), LZ / 2, SX / 2, DZF / 2, DX0 / 2), fl);
  // the hall ceiling (not over the stairwell)
  const ceil = glow("ceilHallNight", () => ({ map: ceilingHD("#8c8377") }));
  shell.add(quad(V(SX, H, DZF), V(DX1, H, DZF), V(DX1, H, DZB), V(SX, H, DZB), 1, 4), ceil);
  shell.add(quad(V(DX0, H, SB), V(SX, H, SB), V(SX, H, DZB), V(DX0, H, DZB), 1, 2), ceil);
  // skirting, dado rail and cornice along the hall's walls
  const runs: [number, number, number, number][] = [[DX0, SB, DX0, DZB], [DX1, DZF, DX1, DZB], [DX0, DZB, DX1, DZB], [SX, DZF, DX1, DZF], [SX, DZF, SX, LZ]];
  for (const [x0, z0, x1, z1] of runs) {
    const alongX = z0 === z1, s = alongX ? (z0 < 0 ? 1 : -1) : x0 < 0.5 ? 1 : -1;
    const slab = (y0: number, y1: number, d: number) => alongX
      ? box(shell, trim, I, x0, x1, y0, y1, Math.min(z0, z0 + s * d), Math.max(z0, z0 + s * d))
      : box(shell, trim, I, Math.min(x0, x0 + s * d), Math.max(x0, x0 + s * d), y0, y1, Math.min(z0, z1), Math.max(z0, z1));
    slab(0, 0.12, 0.025); slab(LOW, LOW + 0.035, 0.02); slab(H - 0.1, H, 0.04);
  }
  // the stairs: thirteen solid steps (wood treads, a painted stringer face toward the corridor)
  for (let i = 0; i < NSTEP; i++) {
    const z1 = SB - RUN * i, z0 = z1 - RUN, y1 = RISE * (i + 1);
    box(b, col(i % 2 ? "#8a6446" : "#86613f"), I, DX0 + 0.002, SX - 0.002, 0, y1, z0, z1);
    box(b, col("#e9e1d2"), I, SX - 0.002, SX + 0.02, Math.max(0, y1 - RISE - 0.12), y1 - 0.02, z0, z1); // stringer
  }
  // banister along the open side: newel posts, a sloped rail and one white spindle per step
  const rail = col("#5b3b28"), spindle = col("#efe8db");
  const r0: V3 = [SX + 0.04, RISE + 0.92, SB - RUN / 2], r1: V3 = [SX + 0.04, H + 0.92, LZ];
  const dz = r0[2] - r1[2], dy = r1[1] - r0[1], len = Math.hypot(dz, dy), th = Math.atan2(dy, dz);
  box(b, rail, new THREE.Matrix4().makeTranslation(...r0).multiply(new THREE.Matrix4().makeRotationX(th)), -0.03, 0.03, -0.03, 0.03, -len, 0);
  for (let i = 0; i < NSTEP; i++) {
    const z = SB - RUN * i - RUN / 2, top = r0[1] + (dy * (r0[2] - z)) / dz, foot = RISE * (i + 1);
    box(b, spindle, I, SX + 0.027, SX + 0.053, foot, top, z - 0.013, z + 0.013);
  }
  for (const [z, y] of [[SB - 0.05, 0], [LZ, H]] as [number, number][]) { box(b, rail, I, SX - 0.01, SX + 0.09, y, y + 1.12, z - 0.05, z + 0.05); sph(b, rail, I, SX + 0.04, y + 1.15, z, 0.055, 0.045, 0.055); }
  // the dim lamp at the landing (a small wall light on the left wall, high)
  box(b, col("#3b3127"), I, DX0, DX0 + 0.05, H + 1.72, H + 1.86, -5.32, -5.18);
  sph(b, glow("landingLampM", () => ({ color: new THREE.Color("#ffd9a0"), toneMapped: false })), I, DX0 + 0.1, H + 1.79, -5.25, 0.06, 0.07, 0.06);
  // dressing: an ordinary cream door on the right wall, pictures, a pendant, a runner to the front door
  hallDoor(b, { x: DX1, z: -2.3, yaw: -Math.PI / 2 });
  ([[DX1 - 0.01, -0.5, -Math.PI / 2, 2], [DX1 - 0.01, -4.1, -Math.PI / 2, 1], [0.45, DZB - 0.01, Math.PI, 3]] as [number, number, number, number][])
    .forEach(([x, z, yaw, kind]) => picture(b, { x, z, y: 1.5, yaw }, 0.5, 0.4, kind));
  pendant(shell, { x: 0.75, z: -3.3, y: H }, 0.2);
  const RX0 = 0.4, RX1 = 1.1, RZ0 = -5.7, RZ1 = 0.7, RL = 0.9;
  shell.add(quad(V(RX0, 0.004, RZ0), V(RX0, 0.004, RZ1), V(RX1, 0.004, RZ1), V(RX1, 0.004, RZ0), (RZ1 - RZ0) / RL, 1, 0, 0), lamb("hallRunner", runnerTex));
  shell.build(root, false);
  b.build(root, false);
  return { root, env: { sky: false, clouds: false }, ...DOWN_LAYOUT };
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
      param: { desc: "choice text: a letter, then the choice (up to 20 letters, digits, spaces, . , : ! ? ' - $ % # & + /; the card wraps it onto two lines), e.g. A: OPEN THE DOOR", ok: choiceTextOk } },
    // Video 06 (Part 2) additions
    photoOnStairs: { name: "Photo of Milo and Juno, on the stairs", desc: "Part 1's framed photo (1.2 x 0.8 m) lying face-up along a flight of stairs (0.2 m risers, 0.25 m treads), resting on the step edges, its top edge up the stairs (local -z). `at` = the middle of its back on the line through the step edges. Step 1: its glass cracks (one long crack from a foot's impact low right, up across the glass). Variant cracked: already cracked", category: "theme", themes: ["home", "mystery", "horror"], tags: ["photo", "picture", "frame", "stairs", "glass", "crack"], radius: 0.7, height: 0.6, box: [0.6, 0.35],
      build: (b, a) => photoStairsStatic(b, a, false), variants: { cracked: (b, a) => photoStairsStatic(b, a, true) },
      rig: photoStairsRig, steps: ["the glass cracks"], stepCount: (v) => (v === "cracked" ? 0 : 1) },
    phoneOutside: { name: "Phone (Juno's new messages)", desc: "Part 1's message phone, the same chat a few minutes later (11:49): Part 1's exchange scrolled up, then Juno's new messages, the newest large above the input bar. Steps: 1 \"Left work early. I'm outside, open the door?\" arrives, 2 \"Who's that in your upstairs window?\". Variant msg1: starts with the first one there", category: "theme", themes: ["modern", "mystery", "any"], tags: ["phone", "message", "text", "chat", "screen"], radius: 0.06, height: 0.16,
      focus: { y: 0.0775, span: 0.085 },
      build: (b, a, v) => phoneOutsideStatic(b, a, v), variants: { msg1: (b, a) => phoneOutsideStatic(b, a, "msg1") },
      rig: phoneOutsideRig, steps: ["Juno: \"Left work early. I'm outside, open the door?\"", "Juno: \"Who's that in your upstairs window?\""], stepCount: (v) => 2 - (OUT_BASE[v ?? ""] ?? 0) },
    choiceLabelChosen: { name: "Choice label, chosen (the vote's winner)", desc: "Part 1's choice label (same card, size and screen-graphic behaviour) shown from the first frame; step 1 selects it: a bright green outline and glow, a slightly brighter card, one pop and a small \"YOU CHOSE B\" tag above it; step 2 removes it. The variant is the text, as choiceLabel", category: "theme", themes: ["any", "interactive"], tags: ["label", "choice", "vote", "winner", "selected", "interactive"], radius: 0.05, height: 0.52,
      build: (b, a, v) => choiceLabelStatic(b, a, v), rig: choiceStateRig(true), steps: ["selected: green outline and glow, a pop, the YOU CHOSE tag", "gone"],
      param: { desc: "choice text, as choiceLabel, e.g. B: RUN DOWNSTAIRS", ok: choiceTextOk } },
    choiceLabelDimmed: { name: "Choice label, dimmed (the vote's loser)", desc: "Part 1's choice label shown from the first frame; step 1 dims it: desaturated, 40 % opacity, a soft shadow behind; step 2 removes it. The variant is the text, as choiceLabel", category: "theme", themes: ["any", "interactive"], tags: ["label", "choice", "vote", "dimmed", "interactive"], radius: 0.05, height: 0.42,
      build: (b, a, v) => choiceLabelStatic(b, a, v), rig: choiceStateRig(false), steps: ["dimmed: desaturated, 40 % opacity, a soft shadow", "gone"],
      param: { desc: "choice text, as choiceLabel, e.g. A: OPEN THE DOOR", ok: choiceTextOk } },
    frontDoor: { name: "Front door (porch light)", desc: "a cream front door (0.86 x 2.05 m) with a frosted glass panel in its upper half, glowing amber from the porch light outside, a warm spill on the floor inside; nobody's shadow on the glass (faces +z; stand it against a wall). Steps 1-3: a knock each (the door and its glass shudder)", category: "theme", themes: ["home", "mystery", "horror"], tags: ["door", "front door", "porch", "glass", "knock", "night"], radius: 0.55, height: 2.13, box: [0.51, 0.05],
      focus: { y: 1.45, span: 1.0 },
      build: (b, a) => frontDoorStatic(b, a), rig: frontDoorRig, steps: ["knock 1: the door shudders", "knock 2", "knock 3"] },
  },
  sets: { hallway: { id: "hallway", title: "Upstairs hallway at night: seven doors, the stairs, the end wall", lights: ["interiorCool", "interior"], build: hallway },
    downstairs: { id: "downstairs", title: "Downstairs hall at night: the foot of the stairs, the landing, the front door", lights: ["interiorCool", "interior"], build: downstairs } },
  layouts: { hallway: HALL_LAYOUT, downstairs: DOWN_LAYOUT },
  setMeta: { hallway: { name: "Upstairs hallway (night)", desc: "a closed 1.8 m-wide corridor (x -0.9..0.9) from the end wall (z -7.0) to the near wall (z +1.6): three cream doors on the left, four on the right, pictures, a wall clock (left, z -6.45), two pendants, a runner; an open stairwell along the left wall mid-hall (x -0.9..-0.05, z -4.7..-2.1): the top of the stairs at its far end, toward the old door, ten steps going down toward the near end, banister along x -0.05 and across the near end; on the end wall the clean wallpaper patch (1.2 x 0.8 m, 1.4-2.2 m high) with a bare nail above it, where a photo hung (marks: nearEnd, hallNear, hallMid, stairsTop, backedAway, nearDoor, atDoor, oldDoor, photo, stairs, phone / views: hallway, reverse, endWall / lights: interiorCool)", themes: ["home", "modern", "horror", "mystery"], tags: ["indoor", "house", "hallway", "corridor", "stairs", "night", "doors", "horror"] },
    downstairs: { name: "Downstairs hall (night)", desc: "the ground-floor entrance hall under the hallway: 2.4 m wide (x -1.1..1.3), from the front door's wall (z -6.0) to the back wall (z +1.2); the stairs rise along the left wall (x -1.1..0.2, thirteen 0.2 m steps from z -1.3 up toward the front of the house) to a landing at 2.6 m (z -6.0..-4.55) whose back wall can hold the old door; an open stairwell above the flight with a dim lamp at the landing; banister along the flight's open side; the corridor beside the stairs (x 0.2..1.3) to the front door (centre x 0.75, place the frontDoor prop), a cream door on the right wall, pictures, a pendant, a runner (marks: stairsFoot, landing, landingDoor, hallMid, nearFront, frontDoor, back, photoStairs / views: hall, upStairs, frontDoor / lights: interiorCool)", themes: ["home", "modern", "horror", "mystery"], tags: ["indoor", "house", "hall", "entrance", "stairs", "front door", "night", "horror"] } },
};
