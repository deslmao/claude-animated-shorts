// Engine 4, Episode 2: two small interior micro-sets, procedural PBR like the court and the arena.
//   e4Bedroom  Leo's room at 5 AM: a bed (a blanket across its foot so a sitting Leo is "in bed"), a nightstand with a glowing red 5:00 AM alarm clock, a KD poster, a window with
//              rain on it, a dresser to stand the TV on (the "KEVIN DURANT: 0-12" broadcast), a desk lamp. Light: "night" (moonlight, one warm lamp, the clock's red glow).
//   e4Office   the Thunder front office: a big desk with a contract and a pen, a leather chair, a wall-size team logo, championship banners, a trophy shelf, a window on the city at
//              night, warm pendant lights. Light: "interior".
// Coordinates (three, metres): the bedroom is x -2.2..2.2, z -2.4..2.6, ceiling 2.6; the office is x -3..3, z -3..3, ceiling 3.0.
import * as THREE from "three";
import { mkTex as ctex } from "./tex";
import type { BuiltSet } from "../sets/types";

export const BEDROOM_ROOM = { x0: -2.1, x1: 2.1, z0: -2.3, z1: 2.5, y0: 0.1, y1: 2.5 };
export const OFFICE_ROOM = { x0: -2.9, x1: 2.9, z0: -2.9, z1: 2.9, y0: 0.1, y1: 2.9 };

const std = (color: string | THREE.Texture, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ ...(typeof color === "string" ? { color } : { map: color }), roughness: 0.85, metalness: 0, ...o });
const mk = (root: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, o: { cast?: boolean; ry?: number } = {}) => { const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.rotation.y = o.ry ?? 0; mesh.castShadow = o.cast ?? true; mesh.receiveShadow = true; root.add(mesh); return mesh; };
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

const woodTex = (name: string, base: string, planks: number) => ctex(name, 512, 512, (g) => {
  let s = 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  const w = 512 / planks; for (let i = 0; i < planks; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? "255,220,170" : "40,20,8"},${0.05 + rnd() * 0.1})`; g.fillRect(i * w, 0, w - 1, 512); g.fillStyle = "rgba(30,15,5,0.5)"; g.fillRect(i * w + w - 1.5, 0, 1.5, 512); for (let y = rnd() * 200; y < 512; y += 150 + rnd() * 200) g.fillRect(i * w, y, w, 1.5); }
});
const clockTex = () => ctex("e4clock", 256, 128, (g) => {
  g.fillStyle = "#1a0505"; g.fillRect(0, 0, 256, 128); g.fillStyle = "#ff3a2a"; g.font = "900 78px 'Courier New', monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("5:00", 100, 58);
  g.font = "900 34px 'Courier New', monospace"; g.fillText("AM", 214, 78); g.fillRect(190, 30, 18, 6);
});
const posterTex = () => ctex("e4poster", 256, 384, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 384); gr.addColorStop(0, "#0b2a6b"); gr.addColorStop(1, "#05122e"); g.fillStyle = gr; g.fillRect(0, 0, 256, 384);
  g.fillStyle = "#ef3b24"; g.fillRect(0, 0, 256, 18); g.fillStyle = "#ffffff"; g.font = "900 130px Impact, Arial Black, sans-serif"; g.textAlign = "center"; g.fillText("35", 128, 200);
  g.font = "900 34px Impact, Arial Black, sans-serif"; g.fillText("DURANT", 128, 262); g.fillStyle = "#d4691e"; g.beginPath(); g.arc(128, 320, 34, 0, 6.3); g.fill(); g.strokeStyle = "#140a05"; g.lineWidth = 3; g.beginPath(); g.moveTo(94, 320); g.lineTo(162, 320); g.moveTo(128, 286); g.lineTo(128, 354); g.stroke();
});
const rainWindowTex = () => ctex("e4rainwin", 256, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#0a1630"); gr.addColorStop(1, "#1d2f55"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.strokeStyle = "rgba(180,200,235,0.45)"; g.lineWidth = 2; for (let i = 0; i < 90; i++) { const x = rnd() * 256, y = rnd() * 256; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3, y + 14 + rnd() * 20); g.stroke(); }
  g.fillStyle = "rgba(255,200,120,0.35)"; for (let i = 0; i < 6; i++) g.fillRect(20 + rnd() * 210, 150 + rnd() * 80, 10, 8);   // far-off house lights
});
const logoWallTex = () => ctex("e4logowall", 1024, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#0e3a8c"); gr.addColorStop(1, "#071f4d"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
  g.fillStyle = "rgba(255,255,255,0.04)"; for (let x = 0; x < 1024; x += 64) g.fillRect(x, 0, 2, 512);
  g.fillStyle = "#ef3b24"; g.fillRect(0, 440, 1024, 14); g.fillStyle = "#ffffff"; g.font = "900 190px Impact, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("THUNDER", 540, 230);
  g.font = "900 56px Impact, Arial Black, sans-serif"; g.fillStyle = "#ffb43a"; g.fillText("OKLAHOMA CITY", 540, 372);
  g.fillStyle = "#ef3b24"; g.beginPath(); g.moveTo(170, 90); g.lineTo(88, 250); g.lineTo(150, 250); g.lineTo(100, 410); g.lineTo(250, 210); g.lineTo(184, 210); g.closePath(); g.fill();
});
const skylineTex = () => ctex("e4skyline", 512, 256, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#0a1230"); gr.addColorStop(1, "#27407a"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
  let s = 8; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 16; i++) { const w = 22 + rnd() * 34, h = 60 + rnd() * 130, x = i * 33 + rnd() * 6; g.fillStyle = "#0a0f22"; g.fillRect(x, 256 - h, w, h); for (let j = 0; j < 14; j++) { g.fillStyle = rnd() > 0.5 ? "#ffd27a" : "#9ec4ff"; g.fillRect(x + 3 + rnd() * (w - 8), 256 - h + 6 + rnd() * (h - 12), 3, 4); } }
});
const contractTex = () => ctex("e4contract", 256, 340, (g) => {
  g.fillStyle = "#f6f2e8"; g.fillRect(0, 0, 256, 340); g.fillStyle = "#1d428a"; g.font = "900 24px Impact, Arial Black, sans-serif"; g.textAlign = "center"; g.fillText("OKC THUNDER", 128, 38); g.font = "800 18px Arial, sans-serif"; g.fillStyle = "#222"; g.fillText("PLAYER CONTRACT", 128, 66);
  g.fillStyle = "#555"; for (let i = 0; i < 12; i++) g.fillRect(24, 92 + i * 15, i % 4 === 3 ? 140 : 208, 3);
  g.strokeStyle = "#222"; g.lineWidth = 2; g.beginPath(); g.moveTo(34, 304); g.lineTo(150, 304); g.stroke(); g.fillStyle = "#222"; g.font = "700 14px Arial, sans-serif"; g.textAlign = "left"; g.fillText("LEO  #11", 34, 322);
  g.strokeStyle = "#1d428a"; g.lineWidth = 3; g.beginPath(); g.moveTo(44, 296); g.bezierCurveTo(60, 270, 76, 300, 92, 280); g.bezierCurveTo(104, 266, 118, 296, 140, 286); g.stroke();
});

const lampMat = () => new THREE.MeshStandardMaterial({ color: "#ffe9b8", emissive: "#ffcf80", emissiveIntensity: 1.6 });

export const buildE4Bedroom = (): BuiltSet => {
  const root = new THREE.Group(), floorT = woodTex("e4bedfloor", "#8a5f3c", 8);
  mk(root, new THREE.PlaneGeometry(4.4, 5.0).rotateX(-Math.PI / 2), std(floorT, { roughness: 0.55 }), 0, 0, 0.1, { cast: false });
  const wall = std("#3b4a72", { roughness: 0.95 });
  mk(root, box(4.4, 2.6, 0.1), wall, 0, 1.3, -2.45, { cast: false }); mk(root, box(0.1, 2.6, 5.0), wall, -2.25, 1.3, 0.1, { cast: false }); mk(root, box(0.1, 2.6, 5.0), wall, 2.25, 1.3, 0.1, { cast: false });
  mk(root, box(4.4, 0.1, 5.0), std("#2a3350"), 0, 2.62, 0.1, { cast: false });
  // the bed: frame, mattress, pillow, and the blanket across its foot (a sitting Leo is "in bed" behind it)
  const oak = std("#6a4a2e", { roughness: 0.6 });
  mk(root, box(1.7, 0.3, 2.2), oak, -0.9, 0.2, -1.3); mk(root, box(1.7, 0.9, 0.1), oak, -0.9, 0.65, -2.35);
  mk(root, box(1.6, 0.2, 2.1), std("#dfe6f2", { roughness: 0.95 }), -0.9, 0.45, -1.3); mk(root, box(0.8, 0.14, 0.4), std("#f4f1ea"), -0.9, 0.62, -2.1);
  mk(root, box(1.68, 0.3, 1.25), std("#c8252d", { roughness: 0.95 }), -0.9, 0.62, -0.6); mk(root, box(1.68, 0.06, 0.5), std("#1d428a", { roughness: 0.95 }), -0.9, 0.8, -0.2);
  // the nightstand and the glowing alarm clock
  mk(root, box(0.55, 0.55, 0.45), oak, 0.3, 0.28, -2.15);
  const clock = new THREE.MeshStandardMaterial({ map: clockTex(), emissiveMap: clockTex(), emissive: "#ffffff", emissiveIntensity: 1.8, roughness: 0.4 });
  mk(root, box(0.3, 0.16, 0.12), std("#1b1b20", { roughness: 0.4 }), 0.3, 0.64, -2.12); mk(root, new THREE.PlaneGeometry(0.26, 0.12), clock, 0.3, 0.645, -2.056, { cast: false });
  const clockGlow = new THREE.PointLight(0xff3a2a, 0, 2.2, 2); clockGlow.position.set(0.3, 0.75, -1.9); root.add(clockGlow);
  // a KD poster, a window with rain, a desk lamp, a rug, the dresser the TV stands on
  mk(root, new THREE.PlaneGeometry(0.7, 1.05), std(posterTex(), { roughness: 0.7 }), 0.2, 1.55, -2.39, { cast: false });
  mk(root, new THREE.PlaneGeometry(1.1, 1.3), new THREE.MeshStandardMaterial({ map: rainWindowTex(), emissiveMap: rainWindowTex(), emissive: "#ffffff", emissiveIntensity: 0.7 }), 2.19, 1.45, 0.4, { cast: false, ry: -Math.PI / 2 });
  mk(root, box(0.08, 1.4, 1.2), std("#e8e8ea"), 2.2, 1.45, 0.4, { cast: false });
  mk(root, box(1.3, 0.5, 0.5), oak, 1.45, 0.25, -2.1); mk(root, box(1.4, 0.04, 0.55), std("#5a3e26"), 1.45, 0.52, -2.1);
  mk(root, new THREE.CylinderGeometry(0.1, 0.13, 0.04, 16), std("#222"), -1.9, 0.02, -2.1); mk(root, new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), std("#222"), -1.9, 0.27, -2.1);
  mk(root, new THREE.ConeGeometry(0.18, 0.2, 16, 1, true), lampMat(), -1.9, 0.58, -2.1, { cast: false });
  mk(root, new THREE.CircleGeometry(0.9, 28).rotateX(-Math.PI / 2), std("#2a4f8c", { roughness: 1 }), 0.2, 0.01, 0.8, { cast: false });
  const lamp = new THREE.PointLight(0xffc880, 0, 6, 1.8); lamp.position.set(-1.9, 0.9, -1.9); root.add(lamp);
  const e4: NonNullable<BuiltSet["e4"]> = {
    apply: ({ env, focus, t }) => {
      const s = env.sun; s.color.set("#7f98d8"); s.intensity = 0.55; s.position.copy(focus).add(new THREE.Vector3(30, 18, 6)); s.target.position.copy(focus);
      const sc = s.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 5; sc.far = 80; sc.updateProjectionMatrix(); s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.mapSize.set(2048, 2048);
      env.hemi.color.set("#40507e"); env.hemi.groundColor.set("#1a1820"); env.hemi.intensity = 0.55; env.fog.color.set("#10141f"); env.fog.near = 6; env.fog.far = 30;
      lamp.intensity = 7 * (1 + 0.02 * Math.sin(t * 9)); clockGlow.intensity = 1.4 * (0.9 + 0.1 * Math.sin(t * 2));
    },
    tint: () => [0.82, 0.88, 1.08],
  };
  return { root, env: { clouds: false, sky: false }, spots: { bed: [-0.9, 0.45, -1.6], tv: [1.45, 0.52, -2.1], door: [0, 0, 2.2] }, views: [{ name: "bed", pos: [1.2, 1.4, 2.2], look: [-0.9, 0.9, -1.4], fov: 50 }], e4 };
};

export const buildE4Office = (): BuiltSet => {
  const root = new THREE.Group(), floorT = woodTex("e4officefloor", "#4a3322", 10);
  mk(root, new THREE.PlaneGeometry(6, 6).rotateX(-Math.PI / 2), std(floorT, { roughness: 0.35, metalness: 0.05 }), 0, 0, 0, { cast: false });
  mk(root, new THREE.PlaneGeometry(3.2, 2.2).rotateX(-Math.PI / 2), std("#16346e", { roughness: 1 }), 0, 0.012, 0.4, { cast: false });
  const wall = std("#1b2236", { roughness: 0.9 });
  mk(root, box(6, 3, 0.1), wall, 0, 1.5, -3.05, { cast: false }); mk(root, box(0.1, 3, 6), wall, -3.05, 1.5, 0, { cast: false }); mk(root, box(0.1, 3, 6), wall, 3.05, 1.5, 0, { cast: false }); mk(root, box(6, 0.1, 6), std("#10131c"), 0, 3.02, 0, { cast: false });
  // the wall-size team logo (lit), championship banners on the left wall, the trophy shelf, a skyline window on the right
  mk(root, new THREE.PlaneGeometry(3.4, 1.7), new THREE.MeshStandardMaterial({ map: logoWallTex(), emissiveMap: logoWallTex(), emissive: "#ffffff", emissiveIntensity: 0.55, roughness: 0.6 }), 0, 1.75, -2.98, { cast: false });
  for (let i = 0; i < 3; i++) mk(root, new THREE.PlaneGeometry(0.7, 1.4), std(logoWallTex(), { roughness: 0.8 }), -3.0, 1.7, -1.6 + i * 1.5, { cast: false, ry: Math.PI / 2 });
  mk(root, new THREE.PlaneGeometry(2.6, 1.5), new THREE.MeshStandardMaterial({ map: skylineTex(), emissiveMap: skylineTex(), emissive: "#ffffff", emissiveIntensity: 0.8 }), 3.0, 1.6, 0.3, { cast: false, ry: -Math.PI / 2 });
  mk(root, box(0.3, 0.05, 2.0), std("#3a2a1c"), -2.85, 1.1, 0.5); const gold = std("#e0b030", { roughness: 0.25, metalness: 0.9 });
  for (let i = 0; i < 4; i++) { mk(root, new THREE.CylinderGeometry(0.05, 0.08, 0.2, 14), gold, -2.85, 1.23, -0.2 + i * 0.5); mk(root, new THREE.SphereGeometry(0.1, 14, 10), std("#d4691e"), -2.85, 1.42, -0.2 + i * 0.5); }
  // the desk (top, two drawer pedestals), the contract and a pen, the leather chair behind it
  const walnut = std("#5a3a22", { roughness: 0.4 });
  mk(root, box(2.2, 0.07, 1.0), walnut, 0, 0.78, -1.1); for (const s of [-1, 1]) mk(root, box(0.5, 0.74, 0.9), walnut, s * 0.85, 0.37, -1.1);
  mk(root, new THREE.PlaneGeometry(0.3, 0.4).rotateX(-Math.PI / 2), std(contractTex(), { roughness: 0.8 }), 0.1, 0.82, -0.95, { cast: false }); mk(root, new THREE.CylinderGeometry(0.008, 0.008, 0.16, 8).rotateZ(Math.PI / 2), std("#10141c"), 0.34, 0.83, -0.95);
  mk(root, box(0.55, 0.12, 0.55), std("#16120f", { roughness: 0.5 }), 0, 0.5, -2.0); mk(root, box(0.55, 0.9, 0.12), std("#16120f", { roughness: 0.5 }), 0, 0.98, -2.28);
  const bulbs: THREE.MeshStandardMaterial[] = [];
  for (const x of [-1.2, 1.2]) { const m = lampMat(); bulbs.push(m); mk(root, new THREE.SphereGeometry(0.14, 14, 10), m, x, 2.35, -0.6, { cast: false }); mk(root, new THREE.CylinderGeometry(0.01, 0.01, 0.65, 6), std("#222"), x, 2.7, -0.6, { cast: false }); }
  const key = new THREE.SpotLight(0xfff0d8, 0, 0, 0.9, 0.6, 1.5); key.position.set(0.5, 2.8, 2.0); key.target.position.set(0, 1.0, -1.0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 0.5; key.shadow.camera.far = 8; key.shadow.bias = -0.0004; root.add(key, key.target);
  const fill = new THREE.PointLight(0xffd8a0, 0, 7, 1.6); fill.position.set(-1.2, 2.2, -0.6); root.add(fill);
  const e4: NonNullable<BuiltSet["e4"]> = {
    apply: ({ env, focus }) => {
      const s = env.sun; s.color.set("#cfdcff"); s.intensity = 0.6; s.position.copy(focus).add(new THREE.Vector3(20, 14, 6)); s.target.position.copy(focus);
      const sc = s.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 5; sc.far = 70; sc.updateProjectionMatrix(); s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.mapSize.set(2048, 2048);
      env.hemi.color.set("#6a7aa8"); env.hemi.groundColor.set("#241a12"); env.hemi.intensity = 0.7; env.fog.color.set("#12161f"); env.fog.near = 8; env.fog.far = 36;
      key.intensity = 70; fill.intensity = 14; for (const b of bulbs) b.emissiveIntensity = 1.6;
    },
    tint: () => [1.0, 0.95, 0.88],
  };
  return { root, env: { clouds: false, sky: false }, spots: { desk: [0, 0, -0.1], door: [0, 0, 2.6] }, views: [{ name: "office", pos: [1.8, 1.5, 2.6], look: [0, 1.1, -1.4], fov: 50 }], e4 };
};
