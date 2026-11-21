// "The Man on the Last Train Has No Reflection" theme (productions/night-train/script.md, approved by the owner): an
// everyday POV horror chase on the last train home at 9:47 p.m.
// Reused: kit primitives; the breakfast theme's bfDread vignette (in the storyboard).
// New here (additions only):
//   set ntCarriage (a commuter carriage at night: bays of three-seat benches facing each other, poles, dark windows, the
//     line map with a stop that doesn't exist, the LED display; vestibules behind both end doors)
//   props ntOutside (the night rushing past the windows: scrolls with its steps), ntEndDoor (an end door that slides
//     open / shut on its steps: variants front / back), ntSideDoor (the exit doors on the right wall; on their step they
//     slide apart onto the fog and the DEATH CITY platform), ntFlicker (the lights failing: the frame drops dark on each
//     step), ntInsert (9:16 close inserts, a state per step), ntChoice (the A / B vote panels)
//   characters ntMan, ntYou
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { Batch } from "../../materials/geo";
import { At, col, glow, box, rbox, cyl } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";
import type { View } from "../../sets/types";
import type { V3 } from "../../camera/keys";

const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, wrap = false) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (wrap) t.wrapS = t.wrapT = THREE.RepeatWrapping; stable.set(key, t); return t;
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const rnd = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const plane = (b: Batch, w: number, h: number, m: THREE.Material, x: number, y: number, z: number, ry = 0) =>
  b.add(new THREE.PlaneGeometry(w, h), m, new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry), new THREE.Vector3(1, 1, 1)));
const INK = "#14121c", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const AMBER = "#ffb02e", RED = "#e0342c";
const STOPS = ["HARLOW CROSS", "MILLBROOK", "DEATH CITY", "KINGS PARADE", "ASHFIELD"];

// ---------------------------------------------------------------- set: the carriage
// 2.8 m wide (x -1.4..1.4), the floor at y 0, the ceiling at 2.2; it runs along z from the front end door (z -7) to
// the back end door (z +7), each with a short vestibule behind it. Bays of two three-seat benches facing each other on
// both sides of the aisle (aisle x -0.4..0.4), bay centres z -4.8, -2.4, 0, 2.4, 4.8; in each bay bench A (z c-0.75)
// faces the back (+z), bench B (z c+0.75) faces the front (-z). Windows along both walls (y 0.95..1.75); the exit doors
// on the right wall at z -6.3 (ntSideDoor). The line map runs above the left windows; the LED display over each end door.
const XW = 1.4, CEIL = 2.2, ZE = 7, BAYS = [-4.8, -2.4, 0, 2.4, 4.8], WY0 = 0.95, WY1 = 1.75, SD_Z = -6.3, SD_W = 1.3;
const seat = (side: number, bench: "A" | "B", c: number, k = 1): V3 => [side * (0.48 + k * 0.32), 0.45, bench === "A" ? c - 0.72 : c + 0.72];
const SPOTS: Record<string, V3> = {
  man: seat(1, "A", 2.4, 1), you: seat(1, "B", 2.4, 1), aisle: [0, 0, 2.4], aisleFront: [0, 0, -5.6], aisleBack: [0, 0, 5.8],
  frontDoor: [0, 0, -6.6], backDoor: [0, 0, 6.6], backVest: [0, 0, 7.45], frontVest: [0, 0, -7.45], sideDoor: [1.05, 0, SD_Z], endFront: [0, 0, -5.9],
};
const VIEWS: View[] = [
  { name: "carriage", pos: [0.2, 1.55, 6.3], look: [0, 1.2, -5], fov: 50, establishing: true },
  { name: "bay", pos: [-0.2, 1.3, 4.2], look: [0.8, 1.0, 1.6], fov: 44 },
];
const moquetteTex = () => stex("ntMoquette", 128, 128, (g) => {
  g.fillStyle = "#2b3a6a"; g.fillRect(0, 0, 128, 128); const r = rnd(4);
  for (let i = 0; i < 60; i++) { g.fillStyle = ["#e0b13a", "#c8382e", "#4fa3c8"][i % 3]; g.fillRect(r() * 128, r() * 128, 5, 5); }
}, true);
const mapTex = () => stex("ntMap", 1600, 160, (g) => {
  g.fillStyle = "#f2efe6"; g.fillRect(0, 0, 1600, 160); g.fillStyle = "#c8382e"; g.fillRect(80, 62, 1440, 16);
  g.textAlign = "center";
  STOPS.forEach((s, i) => { const x = 120 + i * 340; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x, 70, 22, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = "#1b1f2a"; g.stroke();
    g.fillStyle = "#1b1f2a"; g.font = F(34); g.fillText(s, x, 132); });
  g.fillStyle = "#1b1f2a"; g.font = F(26); g.textAlign = "left"; g.fillText("RIVERSIDE LINE", 20, 34);
});
const ledTex = (text: string, key: string, c = AMBER) => stex(key, 512, 96, (g) => {
  g.fillStyle = "#0a0a0c"; g.fillRect(0, 0, 512, 96); g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 14; g.font = "bold 44px 'DejaVu Sans Mono', monospace"; g.textAlign = "center"; g.fillText(text, 256, 64);
  g.shadowBlur = 0; g.fillStyle = "rgba(0,0,0,0.5)"; for (let x = 0; x < 512; x += 4) g.fillRect(x, 0, 1, 96); for (let y = 0; y < 96; y += 4) g.fillRect(0, y, 512, 1);
});
/** the next carriage, seen through an end door's glass: lit, empty */
const throughTex = () => stex("ntThrough", 256, 384, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, "#c9d6e0"); gr.addColorStop(1, "#5a6670"); g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
  g.fillStyle = "#e8f0ff"; g.fillRect(60, 20, 136, 10);
  g.strokeStyle = "#3a4450"; g.lineWidth = 6; g.beginPath(); g.moveTo(0, 384); g.lineTo(96, 170); g.lineTo(160, 170); g.lineTo(256, 384); g.stroke();
  for (const [x0, x1] of [[10, 80], [176, 246]]) { g.fillStyle = "#2b3a6a"; g.fillRect(x0, 250, x1 - x0, 70); }
  g.fillStyle = "#8a96a0"; g.fillRect(100, 120, 56, 50);
});
const bench = (b: Batch, side: number, z: number, faces: 1 | -1) => {
  const x0 = side * 0.42, x1 = side * 1.36, lo = Math.min(x0, x1), hi = Math.max(x0, x1), back = z - faces * 0.24;
  const cush = new THREE.MeshLambertMaterial({ map: moquetteTex() }), shell = col("#5a6470");
  rbox(b, shell, I0, (lo + hi) / 2, 0, z, hi - lo, 0.34, 0.46, 0.03);
  rbox(b, cush, I0, (lo + hi) / 2, 0.34, z + faces * 0.02, hi - lo - 0.02, 0.1, 0.44, 0.04);
  rbox(b, cush, I0, (lo + hi) / 2, 0.42, back, hi - lo - 0.02, 0.62, 0.1, 0.04);
  rbox(b, shell, I0, (lo + hi) / 2, 1.02, back - faces * 0.02, hi - lo, 0.06, 0.12, 0.02);
};
const I0 = new THREE.Matrix4();
const carriage = () => {
  const root = new THREE.Group(), b = new Batch(), I = I0;
  const wall = col("#d9dde2"), panel = col("#b9c0c8"), floor = col("#4a4f58"), trim = col("#8a929c"), pole = col("#c9a24e");
  box(b, floor, I, -XW, XW, -0.04, 0, -ZE - 0.9, ZE + 0.9);
  box(b, col("#3d424a"), I, -0.4, 0.4, 0, 0.004, -ZE, ZE);                                                         // the aisle strip
  box(b, col("#eef1f4"), I, -XW, XW, CEIL, CEIL + 0.05, -ZE, ZE);                                                  // ceiling
  for (const x of [-0.55, 0.55]) box(b, glow("ntCeilLight", () => ({ color: "#f4fbff" })), I, x - 0.09, x + 0.09, CEIL - 0.006, CEIL - 0.001, -ZE + 0.3, ZE - 0.3);
  for (const s of [-1, 1]) {
    const xi = s * XW, xo = s * (XW + 0.08), lo = Math.min(xi, xo), hi = Math.max(xi, xo);
    const zLo = s > 0 ? SD_Z + SD_W / 2 : -ZE;                                                                 // the right wall leaves the exit door open
    box(b, wall, I, lo, hi, 0, WY0, zLo, ZE); box(b, wall, I, lo, hi, WY1, CEIL, zLo, ZE);
    if (s > 0) { box(b, wall, I, lo, hi, 0, CEIL, -ZE, SD_Z - SD_W / 2); box(b, wall, I, lo, hi, 2.05, CEIL, SD_Z - SD_W / 2, SD_Z + SD_W / 2); }
    for (const z of [-5.8, -3.6, -1.2, 1.2, 3.6, 5.8]) box(b, panel, I, lo, hi, WY0, WY1, z - 0.12, z + 0.12);       // pillars between the windows
    box(b, trim, I, s * (XW - 0.07), s * (XW - 0.002), WY0 - 0.04, WY0, zLo + 0.002, ZE - 0.002);                                             // sills
    for (const c of BAYS) { bench(b, s, c - 0.72, 1); bench(b, s, c + 0.72, -1); }
    for (const c of BAYS) for (const dz of [-1.2, 1.2]) if (Math.abs(c + dz) < 6) cyl(b, pole, I, s * 0.42, 0, c + dz, 0.02, 0.02, CEIL, 10);
    cyl(b, pole, I, 0, 1.95, 0, 0.018, 0.018, 0.02, 6);
    for (let z = -6.5; z <= 6.5; z += 13 / 26) cyl(b, col("#3a3f48"), I, s * 0.4, 1.9, z, 0.03, 0.03, 0.075, 8);   // hand straps
    box(b, col("#9aa2ac"), I, s * 0.4 - 0.015, s * 0.4 + 0.015, 1.98, 2.0, -ZE, ZE);                                // the strap rail
  }
  // the line map above the left windows (facing +x), the LED displays over the end doors
  plane(b, 2.2, 0.22, new THREE.MeshBasicMaterial({ map: mapTex(), toneMapped: false }), -XW + 0.005, 1.92, 2.4, Math.PI / 2);
  plane(b, 2.2, 0.22, new THREE.MeshBasicMaterial({ map: mapTex(), toneMapped: false }), -XW + 0.005, 1.92, -2.4, Math.PI / 2);
  for (const s of [-1, 1]) plane(b, 0.9, 0.17, new THREE.MeshBasicMaterial({ map: ledTex("21:47  ASHFIELD", "ntLed0"), toneMapped: false }), 0, 2.08, s * (ZE - 0.01), s < 0 ? 0 : Math.PI);
  // the end walls round each door, the vestibules behind them, their far doors (closed, the next carriage through the glass)
  for (const s of [-1, 1]) {
    const z = s * ZE, zb = s * (ZE + 0.9), zg = s * (ZE + 0.082), m = new THREE.Matrix4();
    box(b, wall, I, -XW, -0.5, 0, CEIL, Math.min(z, z + s * 0.08), Math.max(z, z + s * 0.08)); box(b, wall, I, 0.5, XW, 0, CEIL, Math.min(z, z + s * 0.08), Math.max(z, z + s * 0.08));
    box(b, wall, I, -0.5, 0.5, 2.0, CEIL, Math.min(z, z + s * 0.08), Math.max(z, z + s * 0.08));
    box(b, col("#2a2c30"), I, -0.62, -0.55, 0, 2.05, Math.min(zg, zb), Math.max(zg, zb)); box(b, col("#2a2c30"), I, 0.55, 0.62, 0, 2.05, Math.min(zg, zb), Math.max(zg, zb));   // the gangway bellows
    for (let k = 1; k < 6; k++) { const zz = z + s * k * 0.15; box(b, col("#1c1d20"), I, -0.6, -0.56, 0, 2.05, zz - 0.012, zz + 0.012); box(b, col("#1c1d20"), I, 0.56, 0.6, 0, 2.05, zz - 0.012, zz + 0.012); }
    box(b, col("#1c1d20"), I, -0.62, 0.62, 2.05, 2.1, Math.min(zg, zb), Math.max(zg, zb));
    box(b, col("#7a828c"), I, -0.62, 0.62, 0, 2.1, Math.min(zb, zb + s * 0.06), Math.max(zb, zb + s * 0.06));                  // the far door
    plane(b, 0.4, 0.62, glow("ntThroughM", () => ({ map: throughTex(), toneMapped: false })), 0, 1.45, zb - s * 0.002, s < 0 ? 0 : Math.PI);
    void m;
  }
  b.build(root, true);
  return { root, env: { clouds: false }, spots: SPOTS, views: VIEWS };
};

// ---------------------------------------------------------------- 3D props
/** the night outside both walls: dark fields and streaks of lights, scrolling past with the steps (give STEADY steps) */
const outsideTex = () => stex("ntOutside", 1024, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#05070d"); gr.addColorStop(0.6, "#0c1220"); gr.addColorStop(1, "#04050a"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 256);
  const r = rnd(17);
  for (let i = 0; i < 26; i++) { const x = r() * 1024, y = 90 + r() * 90, w = 40 + r() * 160, c = ["#ffd27a", "#ff9a4a", "#bcd6ff", "#ffffff"][i % 4];
    const sg = g.createLinearGradient(x, 0, x + w, 0); sg.addColorStop(0, "rgba(0,0,0,0)"); sg.addColorStop(0.5, c); sg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = sg; g.globalAlpha = 0.5 + r() * 0.5; g.fillRect(x, y, w, 2 + r() * 3); }
  g.globalAlpha = 1; g.fillStyle = "#020306"; for (let x = 0; x < 1024; x += 128) g.fillRect(x + r() * 60, 0, 8, 256);   // posts flashing past
}, true);
const outsideRig = (a: At): PropRig => {
  const root = rigRoot(a), tex = outsideTex().clone(); tex.needsUpdate = true; tex.repeat.set(2, 1);
  const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 2.6), mat); m.position.set(s * (XW + 0.6) - a.x, 1.3 - (a.y ?? 0), 0); m.rotation.y = -s * Math.PI / 2; root.add(m); }
  return { root, update: ({ step = 0 }) => { tex.offset.x = (step * 0.06) % 1; } };
};
/** an end door: a grey leaf with a tall window onto the next carriage; it slides open on its odd steps and shut on the
 *  even ones. Variants front (z -7, faces +z) / back (z +7, faces -z); `at` = the doorway's foot */
const endDoorRig = (a: At, v = "front"): PropRig => {
  const root = rigRoot(a), leaf = new THREE.Group(); root.add(leaf); const s = v === "back" ? -1 : 1;
  const b = new Batch(); box(b, col("#9aa2ac"), I0, -0.5, 0.5, 0, 2.0, -0.03, 0.0); box(b, col("#2a2c30"), I0, 0.35, 0.42, 0.95, 1.1, 0.0, 0.03); b.build(leaf, true);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.7), new THREE.MeshBasicMaterial({ map: throughTex(), toneMapped: false })); glass.position.set(0, 1.4, 0.004); leaf.add(glass);
  if (s < 0) root.rotation.y += Math.PI;
  const target = (k: number) => k % 2;
  return { root, update: ({ step = 0 }) => { const n = Math.floor(step), f = step - n, o = target(n) + (target(n + 1) - target(n)) * f; leaf.position.x = -0.98 * o; } };
};
/** the exit doors on the right wall: two leaves that slide apart on the step; behind them the DEATH CITY platform in fog */
const signTex = () => stex("ntSign", 512, 128, (g) => {
  g.fillStyle = "#c8382e"; g.beginPath(); g.roundRect(4, 4, 504, 120, 18); g.fill(); g.fillStyle = "#ffffff"; g.font = F(70); g.textAlign = "center"; g.fillText("DEATH CITY", 256, 90);
});
const fogTex = () => stex("ntFog", 512, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#2a3440"); gr.addColorStop(0.55, "#8a98a6"); gr.addColorStop(1, "#5a6672"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  const r = rnd(8); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(220,230,240,${0.05 + r() * 0.12})`; g.beginPath(); g.ellipse(r() * 512, 200 + r() * 260, 60 + r() * 140, 20 + r() * 40, 0, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "#3a3f48"; g.fillRect(0, 430, 512, 82);                                                            // the platform edge
});
const sideDoorRig = (a: At): PropRig => {
  const root = rigRoot(a), b = new Batch();
  const L = new THREE.Group(), R = new THREE.Group(); root.add(L, R);
  for (const [g, s] of [[L, -1], [R, 1]] as const) { const bb = new Batch(); box(bb, col("#e0342c"), I0, s < 0 ? -0.65 : 0, s < 0 ? 0 : 0.65, 0, 2.05, -0.03, 0); box(bb, col("#1c1d20"), I0, s < 0 ? -0.5 : 0.15, s < 0 ? -0.15 : 0.5, 1.15, 1.8, 0.0, 0.004); bb.build(g, true); }
  // behind the doors: the platform and its fog, the sign, a lamp
  plane(b, 6, 3.2, glow("ntFogM", () => ({ map: fogTex(), toneMapped: false })), 0, 1.4, -1.6);
  plane(b, 1.2, 0.3, glow("ntSignM", () => ({ map: signTex(), toneMapped: false })), 0.2, 1.9, -1.0);
  box(b, col("#3a3f48"), I0, -1.5, 1.5, -0.1, 0.0, -1.6, -0.05);
  b.build(root, true);
  return { root, update: ({ step = 0 }) => { const o = Math.max(0, Math.min(1, step)); L.position.x = -0.62 * o; R.position.x = 0.62 * o; } };
};
/** the lights failing: the frame drops dark for a moment on each step (give the shot's vertical fov as scale = fov / 100) */
const flickerRig = (a: At): PropRig => {
  const fov = (a.s ?? 0.44) * 100, root = rigRoot({ ...a, s: 1 }), h = 2 * 0.5 * Math.tan((fov * Math.PI) / 360) * 1.2, w = (h * 9) / 16;
  const mat = new THREE.MeshBasicMaterial({ color: "#020308", transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.renderOrder = 11; m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0, camPos }) => {
    const f = step - Math.floor(step); mat.opacity = step > 0.001 && f < 0.999 ? 0.82 * Math.max(0, Math.sin(f * Math.PI * 3)) : 0;
    const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos);
  } };
};

/** the emergency lighting: a red veil over the frame (give the shot's vertical fov as scale = fov / 100) */
const redRig = (a: At): PropRig => {
  const fov = (a.s ?? 0.44) * 100, root = rigRoot({ ...a, s: 1 }), h = 2 * 0.5 * Math.tan((fov * Math.PI) / 360) * 1.2, w = (h * 9) / 16;
  const mat = new THREE.MeshBasicMaterial({ color: "#ff2414", transparent: true, opacity: 0.3, depthTest: false, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.renderOrder = 9; m.layers.set(NOINK); root.add(m);
  return { root, update: ({ camPos }) => { const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos); } };
};

/** his soaked coat dripping: drops falling from the hem (`at` = the hem's front edge, its height as y) onto a spreading
 *  puddle on the floor. Give steady steps (one every 0.15 s): the drops fall with them */
const dripsRig = (a: At): PropRig => {
  const root = rigRoot(a), h = a.y ?? 0.5, drops: THREE.Mesh[] = [];
  const dm = new THREE.MeshBasicMaterial({ color: "#a8d4f0", toneMapped: false });
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), dm); d.scale.set(1, 1.6, 1); d.position.set(((i * 37) % 9 - 4) * 0.04, 0, ((i * 53) % 5 - 2) * 0.03); root.add(d); drops.push(d); }
  const pm = new THREE.MeshBasicMaterial({ color: "#6f9fc0", transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(0.3, 32).rotateX(-Math.PI / 2), pm); puddle.position.y = -h + 0.004; root.add(puddle);
  return { root, update: ({ step = 0 }) => {
    drops.forEach((d, i) => { const ph = (step * 0.35 + i * 0.37) % 1; d.position.y = -ph * ph * h; d.visible = ph < 0.97; });
    puddle.scale.set(1 + Math.min(1, step / 40) * 0.6, 1, 0.7 + Math.min(1, step / 40) * 0.4);
  } };
};

// ---------------------------------------------------------------- inserts (9:16 cards)
type Ins = { n: number; draw: (g: CanvasRenderingContext2D, st: number) => void };
const vig = (g: CanvasRenderingContext2D, a = 0.55) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.3, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
/** the bay seen side on, as wide as (x, w): your bench on the left (you on it, facing right), his bench on the right
 *  (facing left), him on it only when `withMan`. `glass` dims and blues it like a reflection */
const bay = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, withMan: boolean, a: number) => {
  g.save(); g.globalAlpha = a; const fy = y + h * 0.86, sx = w / 810, sy = h / 700;
  const X = (u: number) => x + u * sx, Y = (v: number) => y + v * sy;
  g.fillStyle = "#59616b"; g.fillRect(x, fy, w, y + h - fy);                                                     // floor
  g.fillStyle = "#e6eef8"; g.fillRect(X(120), Y(30), 570 * sx, 14 * sy);                                         // ceiling light
  const seatSide = (bx: number, dir: 1 | -1) => {
    g.fillStyle = "#2b3a6a"; g.beginPath(); g.roundRect(X(bx), Y(430), 190 * sx, 50 * sy, 12); g.fill();             // seat
    g.beginPath(); g.roundRect(X(dir > 0 ? bx - 10 : bx + 160), Y(170), 40 * sx, 300 * sy, 14); g.fill();           // backrest
    g.fillStyle = "#e0b13a"; for (let k = 0; k < 6; k++) g.fillRect(X(bx + 15 + k * 28), Y(445), 8 * sx, 8 * sy);
    g.fillStyle = "#5a6470"; g.fillRect(X(bx + 10), Y(480), 170 * sx, (fy - Y(480)));
  };
  seatSide(90, 1); seatSide(530, -1);
  // you: on the left seat, facing right; a navy hoodie, dark side-swept hair, eyes wide
  g.lineWidth = 7; g.strokeStyle = INK;
  g.fillStyle = "#2a2c3a"; g.beginPath(); g.roundRect(X(190), Y(400), 150 * sx, 50 * sy, 20); g.fill(); g.fillRect(X(300), Y(430), 36 * sx, 160 * sy);   // legs
  g.fillStyle = "#2f4a7a"; g.beginPath(); g.roundRect(X(150), Y(250), 120 * sx, 190 * sy, 40); g.fill(); g.stroke();   // hoodie
  g.fillStyle = "#d9a886"; g.beginPath(); g.ellipse(X(215), Y(205), 62 * sx, 66 * sy, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = "#1e1a1a"; g.beginPath(); g.ellipse(X(205), Y(165), 66 * sx, 36 * sy, -0.2, Math.PI, 0); g.fill();
  g.fillStyle = "#ffffff"; g.beginPath(); g.arc(X(250), Y(200), 15 * sx, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(X(254), Y(200), 6 * sx, 0, Math.PI * 2); g.fill();
  if (withMan) {
    // him: on the right seat, facing left, straight at you; the long wet coat, the beard, wide staring eyes
    g.fillStyle = "#2a2c30"; g.beginPath(); g.roundRect(X(470), Y(400), 160 * sx, 50 * sy, 20); g.fill(); g.fillRect(X(470), Y(430), 36 * sx, 160 * sy);
    g.fillStyle = "#3d4a44"; g.beginPath(); g.roundRect(X(540), Y(220), 130 * sx, 300 * sy, 40); g.fill(); g.stroke();
    g.fillStyle = "rgba(150,190,220,0.9)"; for (const [u, v] of [[560, 545], [610, 575], [585, 610]] as const) { g.beginPath(); g.ellipse(X(u), Y(v), 6 * sx, 10 * sy, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#c8cfc9"; g.beginPath(); g.ellipse(X(600), Y(170), 66 * sx, 72 * sy, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#2a2622"; g.beginPath(); g.ellipse(X(610), Y(125), 72 * sx, 40 * sy, 0.2, Math.PI, 0); g.fill(); g.beginPath(); g.ellipse(X(585), Y(215), 46 * sx, 30 * sy, 0, 0, Math.PI); g.fill();
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(X(565), Y(165), 17 * sx, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(X(559), Y(165), 6 * sx, 0, Math.PI * 2); g.fill();
  }
  g.restore();
};
const INSERTS: Record<string, Ins> = {
  // water dripping off his coat's torn hem; the puddle spreads on the step
  drip: { n: 2, draw: (g, st) => {
    g.fillStyle = "#3d424a"; g.fillRect(0, 0, IW, IH); g.fillStyle = "#4a4f58"; g.fillRect(0, 900, IW, IH - 900);
    g.fillStyle = "#3d4a44"; g.beginPath(); g.moveTo(0, 0); g.lineTo(IW, 0); g.lineTo(IW, 560); for (let x = IW; x >= 0; x -= 60) g.lineTo(x, 560 + ((x / 60) % 2 ? 70 : 0) + (x % 180 === 0 ? 40 : 0)); g.closePath(); g.fill();
    g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = "rgba(20,30,28,0.6)"; g.lineWidth = 6; for (const x of [140, 330, 520, 690]) { g.beginPath(); g.moveTo(x, 80); g.lineTo(x + 20, 540); g.stroke(); }   // soaked folds
    g.fillStyle = "rgba(150,190,220,0.9)"; for (const [x, y] of [[180, 700], [410, 760], [600, 690], [300, 840], [520, 870]] as const) { g.beginPath(); g.ellipse(x, y, 12, 20, 0, 0, Math.PI * 2); g.fill(); }
    const pr = st ? 1 : 0.55; g.fillStyle = "rgba(120,160,190,0.55)"; g.beginPath(); g.ellipse(IW / 2, 1120, 330 * pr + 60, 110 * pr + 30, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "rgba(200,225,245,0.7)"; g.lineWidth = 5; for (const k of [0.4, 0.7]) { g.beginPath(); g.ellipse(IW / 2, 1120, (330 * pr + 60) * k, (110 * pr + 30) * k, 0, 0, Math.PI * 2); g.stroke(); }
    vig(g, 0.6);
  } },
  // the dark window: your reflection, the lit carriage, the seats opposite: empty where he sits
  // the window, clearly: the bay seen side on as its reflection in the glass: you on your seat (left), the seat facing
  // you (right): EMPTY. Step: a red ring round the empty seat
  reflection: { n: 2, draw: (g, st) => {
    g.fillStyle = "#4a525c"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#1a2a44"; g.beginPath(); g.roundRect(50, 240, IW - 100, 960, 40); g.fill();             // the glass
    g.save(); g.beginPath(); g.roundRect(50, 240, IW - 100, 960, 40); g.clip();
    bay(g, 50, 260, IW - 100, 920, false, 0.92);
    g.fillStyle = "rgba(255,255,255,0.10)"; g.beginPath(); g.moveTo(80, 240); g.lineTo(260, 240); g.lineTo(80, 700); g.closePath(); g.fill();   // the glass's sheen
    g.restore();
    g.lineWidth = 26; g.strokeStyle = "#8a929c"; g.beginPath(); g.roundRect(50, 240, IW - 100, 960, 40); g.stroke();
    if (st) { g.strokeStyle = RED; g.lineWidth = 12; g.setLineDash([26, 16]); g.shadowColor = RED; g.shadowBlur = 24; g.beginPath(); g.ellipse(560, 760, 190, 300, 0, 0, Math.PI * 2); g.stroke(); g.setLineDash([]); g.shadowBlur = 0; }
    vig(g, 0.4);
  } },
  // the proof, side by side: above, the real bay (you, and him on the seat facing you); below, the same bay in the
  // window: you, and an empty seat
  split: { n: 1, draw: (g) => {
    g.fillStyle = "#c9d2dc"; g.fillRect(0, 0, IW, IH / 2);
    bay(g, 0, 20, IW, IH / 2 - 40, true, 1);
    g.fillStyle = "#1a2a44"; g.fillRect(0, IH / 2, IW, IH / 2);
    bay(g, 0, IH / 2 + 20, IW, IH / 2 - 40, false, 0.92);
    g.fillStyle = "rgba(255,255,255,0.10)"; g.beginPath(); g.moveTo(0, IH / 2); g.lineTo(200, IH / 2); g.lineTo(0, IH / 2 + 400); g.closePath(); g.fill();
    g.fillStyle = "#ffffff"; g.fillRect(0, IH / 2 - 8, IW, 16);
    g.fillStyle = "#14121c"; g.font = F(40); g.textAlign = "center"; g.fillText("REAL", IW / 2, 70); g.fillStyle = "#dfe8ff"; g.fillText("IN THE WINDOW", IW / 2, IH / 2 + 70);
    vig(g, 0.35);
  } },
  display: { n: 3, draw: (g, st) => {
    g.fillStyle = "#2a2e34"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#0a0a0c"; g.beginPath(); g.roundRect(40, 520, IW - 80, 380, 24); g.fill(); g.lineWidth = 12; g.strokeStyle = "#5a6470"; g.stroke();
    g.textAlign = "center"; const c = st === 2 ? RED : AMBER; g.fillStyle = c; g.shadowColor = c; g.shadowBlur = 30;
    g.font = "bold 64px 'DejaVu Sans Mono', monospace"; g.fillText("NEXT STOP", IW / 2, 640);
    if (st === 0) { g.font = "bold 104px 'DejaVu Sans Mono', monospace"; g.fillText("ASHFIELD", IW / 2, 800); }
    else if (st === 1) { g.font = "bold 104px 'DejaVu Sans Mono', monospace"; g.fillText("A#H?I3LD", IW / 2, 790); g.shadowBlur = 0; g.fillStyle = "rgba(255,80,60,0.6)"; for (let y = 560; y < 880; y += 26) g.fillRect(60 + (y % 70), y, IW - 160, 6); }
    else { g.font = "bold 96px 'DejaVu Sans Mono', monospace"; g.fillText("DEATH CITY", IW / 2, 800); }
    g.shadowBlur = 0; g.fillStyle = "rgba(0,0,0,0.45)"; for (let x = 40; x < IW - 40; x += 6) g.fillRect(x, 520, 2, 380);
    // the speaker grille below it
    g.fillStyle = "#1c1d20"; for (let r2 = 0; r2 < 5; r2++) for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(250 + k * 40, 1040 + r2 * 40, 10, 0, Math.PI * 2); g.fill(); }
    vig(g, 0.5);
  } },
  // the line map: your line, every stop you know, and the one between them you've never noticed (ringed on the step)
  map: { n: 2, draw: (g, st) => {
    g.fillStyle = "#d9dde2"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#f2efe6"; g.fillRect(40, 300, IW - 80, 840); g.lineWidth = 10; g.strokeStyle = "#8a929c"; g.strokeRect(40, 300, IW - 80, 840);
    g.fillStyle = "#1b1f2a"; g.font = F(44); g.textAlign = "center"; g.fillText("RIVERSIDE LINE", IW / 2, 380);
    g.fillStyle = "#c8382e"; g.fillRect(IW / 2 - 140, 430, 18, 640);
    STOPS.forEach((s, i) => { const y = 450 + i * 150; g.fillStyle = "#ffffff"; g.beginPath(); g.arc(IW / 2 - 131, y, 26, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = "#1b1f2a"; g.stroke();
      g.fillStyle = s === "DEATH CITY" ? "#8a0e14" : "#1b1f2a"; g.font = F(s === "DEATH CITY" ? 48 : 42); g.textAlign = "left"; g.fillText(s, IW / 2 - 80, y + 15); });
    if (st) { g.strokeStyle = RED; g.lineWidth = 12; g.shadowColor = RED; g.shadowBlur = 30; g.beginPath(); g.ellipse(IW / 2 + 40, 750, 330, 70, 0, 0, Math.PI * 2); g.stroke(); g.shadowBlur = 0; }
    vig(g, 0.55);
  } },
};
const insertRig = (a: At, v = "drip"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.drip, texAt = (st: number) => stex(`ntIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(Math.max(0, Math.min(ins.n - 1, Math.ceil(step - 1e-3)))); } };
};

// ---------------------------------------------------------------- the vote panels
const CW = 1024, CH = 400;
const choiceTex = (v: string) => stex(`ntChoice2_${v}`, CW, CH, (g) => {
  const c = v === "a" ? "#ff5a4e" : "#5ee08a", label = v === "a" ? "GET OFF" : "STAY ON", sub = v === "a" ? "into Death City" : "with him";
  g.clearRect(0, 0, CW, CH); g.fillStyle = "rgba(8,8,14,0.9)"; g.beginPath(); g.roundRect(14, 14, CW - 28, CH - 28, 44); g.fill();
  g.strokeStyle = c; g.lineWidth = 12; g.shadowColor = c; g.shadowBlur = 40; g.stroke(); g.shadowBlur = 0;
  g.fillStyle = c; g.beginPath(); g.arc(150, CH / 2, 100, 0, Math.PI * 2); g.fill(); g.fillStyle = "#0a0a10"; g.font = F(130); g.textAlign = "center"; g.fillText(v.toUpperCase(), 150, CH / 2 + 46);
  g.fillStyle = "#ffffff"; g.font = F(116); g.textAlign = "left"; g.fillText(label, 285, CH / 2 - 10);
  g.fillStyle = c; g.font = F(70); g.fillText(sub, 290, CH / 2 + 100);
});
const choiceRig = (a: At, v = "a"): PropRig => {
  const root = rigRoot(a), w = 1.0, h = w * CH / CW;
  const mat = new THREE.MeshBasicMaterial({ map: choiceTex(v), transparent: true, toneMapped: false, depthWrite: false, depthTest: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.renderOrder = 12; m.layers.set(NOINK); root.add(m);
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, h * 0.86), new THREE.MeshBasicMaterial({ color: "#08080e", toneMapped: false })); backing.position.z = -0.004; m.add(backing);
  return { root, update: ({ step = 0, camPos }) => {
    const k = Math.max(0, Math.min(1, step / 0.35)), back = 1 + 0.18 * Math.sin(k * Math.PI);
    m.visible = k > 0.001; m.scale.setScalar(Math.max(0.001, k * back)); mat.opacity = k; m.lookAt(camPos);
  } };
};

// ---------------------------------------------------------------- characters
const MAN: Look = { name: "The man", build: "lanky", skin: "#c8cfc9", seed: 941, hair: { style: "curly", color: "#2a2622" }, beard: { style: "full", color: "#2a2622" },
  top: { style: "shirt", color: "#5a5f58" }, layer: { style: "longcoat", color: "#3d4a44", accent: "#2a332f" }, legs: "#2a2c30", shoes: "#1a1a1a", eyes: { shock: 1.3 } };
const YOU: Look = { name: "You", build: "petite", skin: "#d9a886", seed: 942, hair: { style: "side", color: "#1e1a1a" }, top: { style: "hoodie", color: "#2f4a7a", accent: "#e8e4dc" }, legs: "#2a2c3a", shoes: "#f0f0f0" };
const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["horror", "train", "night"], tags });

export const NIGHTTRAIN_THEME: Theme = {
  id: "nighttrain", name: "The Last Train (a night commuter train, a man with no reflection)",
  desc: "an everyday POV horror chase: a commuter carriage at night (bays of benches, poles, dark windows with the night rushing past, the line map, LED displays, sliding end doors, the exit doors onto a foggy DEATH CITY platform), flickering lights, close inserts",
  tags: ["train", "night", "horror", "commute", "chase", "ghost"],
  mood: "drone",
  ambience: { ntCarriage: "elb_train_night" },
  steps: { ntCarriage: "step_hard" },
  characters: { ntMan: MAN, ntYou: YOU },
  characterMeta: {
    ntMan: meta("The man", "gaunt, pale grey skin, wet black hair hanging, a beard, a soaked torn dark-green long coat", "screams 'why me'; has no reflection; follows you", ["adult", "man", "ghost", "villain"]),
    ntYou: meta("You", "a teen: dark side-swept hair, a navy hoodie", "the 'you' of the story, on the last train home", ["teen", "pov"]),
  },
  props: {
    ntOutside: { name: "Night outside the train", desc: "the night rushing past both walls of ntCarriage: dark fields, streaks of lights, posts; it scrolls as its steps advance (give steady steps, e.g. one every 0.15 s). `at` = the point the shot looks at (the walls are placed absolutely; the 16 m strip is centred on `at`'s z)", category: "theme", themes: ["train", "night"], tags: ["window", "outside", "motion"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => outsideRig(a), steps: ["scrolls"], stepCount: () => 2000 },
    ntEndDoor: { name: "Carriage end door", desc: "an end door's grey leaf with a tall window onto the next carriage; it slides open on its odd steps, shut on the even ones. Variants front (`at` [0, 0, -7]) / back (`at` [0, 0, 7])", category: "theme", themes: ["train"], tags: ["door", "sliding"], radius: 0.1, height: 2.0,
      build: () => undefined, rig: (a, v) => endDoorRig(a, v ?? "front"), steps: ["slides open", "slides shut"], stepCount: () => 20, variants: { front: () => undefined, back: () => undefined } },
    ntSideDoor: { name: "Exit doors onto DEATH CITY", desc: "the red exit doors on the right wall of ntCarriage (`at` [1.43, 0, -6.3], yaw -90); on the step they slide apart onto a foggy platform and a red DEATH CITY sign", category: "theme", themes: ["train", "horror"], tags: ["door", "platform", "fog", "sign"], radius: 0.1, height: 2.05,
      build: () => undefined, rig: (a) => sideDoorRig(a), steps: ["slide open"], stepCount: () => 1 },
    ntFlicker: { name: "Lights failing", desc: "the frame drops dark for a moment on each step (the carriage lights stuttering); give the shot's vertical fov as scale = fov / 100", category: "theme", themes: ["horror"], tags: ["flicker", "lights", "overlay"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => flickerRig(a), steps: ["a flicker"], stepCount: () => 50 },
    ntRed: { name: "Emergency lighting (red)", desc: "the carriage in its red emergency lights: a red veil over the frame; give the shot's vertical fov as scale = fov / 100", category: "theme", themes: ["horror"], tags: ["red", "emergency", "light", "overlay"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => redRig(a), steps: [], stepCount: () => 1 },
    ntDrips: { name: "Soaked coat dripping", desc: "water dripping off his coat's hem (`at` = the hem's front edge, at its height) onto a spreading puddle on the floor; give steady steps (one every 0.15 s)", category: "theme", themes: ["horror"], tags: ["water", "drip", "puddle", "wet"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => dripsRig(a), steps: ["the drops fall"], stepCount: () => 2000 },
    ntInsert: { name: "Close insert (The Last Train)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step. Variants: drip (water dripping off his coat; the puddle spreads), reflection (the window, clearly: the bay side on in the glass, you on your seat, his seat EMPTY; step: a red ring round it), split (REAL above: you and him on the seat facing you; IN THE WINDOW below: you and an empty seat), display (NEXT STOP ASHFIELD; glitch; DEATH CITY), map (the line map; DEATH CITY ringed)", category: "theme", themes: ["train", "insert"], tags: ["insert", "close-up", "clue"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "drip"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
    ntChoice: { name: "Vote panels (The Last Train)", desc: "the end-card vote: a glowing panel turned to the camera, popping in on its first step. Variants: a (A · GET OFF / into Death City, red), b (B · STAY ON / with him, green); 1.0 m wide. Drawn over everything", category: "theme", themes: ["vote"], tags: ["choice", "vote", "panel"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => choiceRig(a, v ?? "a"), steps: ["pops in"], stepCount: () => 1, variants: { a: () => undefined, b: () => undefined } },
  },
  sets: {
    ntCarriage: { id: "ntCarriage", title: "A commuter train carriage at night: bays of benches, poles, dark windows, the line map, sliding end doors, the exit doors", lights: ["interiorCool", "night", "interior"], build: () => carriage() },
  },
  layouts: { ntCarriage: { spots: SPOTS, views: VIEWS } },
  setMeta: {
    ntCarriage: { name: "Night train carriage", desc: "2.8 m wide (x -1.4..1.4), ceiling 2.2, along z from the front end door (z -7) to the back end door (z +7), vestibules behind both (z ±7.45). Bays of three-seat benches facing each other either side of the aisle (x -0.4..0.4), bay centres z -4.8, -2.4, 0, 2.4, 4.8 (bench A at c-0.72 faces +z, B at c+0.72 faces -z, seat height 0.45). Windows y 0.95..1.75 (add ntOutside); exit doors on the right wall at z -6.3 (ntSideDoor); the line map above the left windows at z ±2.4. Spots man (his seat, facing you), you, aisle, aisleFront, aisleBack, frontDoor, backDoor, frontVest, backVest, sideDoor, endFront", themes: ["horror", "everyday"], tags: ["train", "carriage", "night", "commute", "seats", "doors"] },
  },
};
