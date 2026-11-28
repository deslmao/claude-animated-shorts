// Engine 4, Episode 3 (Solo Leveling World): the school. Two procedural PBR sets like the court and the arena.
//   e4Hallway  a long school corridor: locker walls both sides (one tiled canvas of doors), a polished tile floor, fluorescent ceiling panels, a bulletin board, a trophy case and a
//              green EXIT sign over double doors at the far end. Light "interior" (bright, slightly cool, fluorescent).
//   e4Gym      the school gym: a hardwood floor with a centre circle, a bleacher of cheering kids on each side (instanced crowd), a banner wall, steel trusses and bright lamp bars.
//              Light "interior".
// Coordinates (three, metres). Hallway: x -2.3..2.3, z -9..4.6, ceiling 2.9. Gym floor: x -8..8, z -12..8, ceiling 7.5.
import * as THREE from "three";
import { mkTex as ctex } from "./tex";
import { makeCrowd } from "./arena";
import type { BuiltSet } from "../sets/types";

export const HALLWAY_ROOM = { x0: -2.1, x1: 2.1, z0: -8.6, z1: 4.2, y0: 0.1, y1: 2.75 };
export const GYM_ROOM = { x0: -5.5, x1: 5.5, z0: -11.6, z1: 8.6, y0: 0.1, y1: 6.4 };

const std = (color: string | THREE.Texture, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ ...(typeof color === "string" ? { color } : { map: color }), roughness: 0.85, metalness: 0, ...o });
const mk = (root: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, o: { cast?: boolean; ry?: number } = {}) => { const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); if (o.ry) mesh.rotation.y = o.ry; mesh.castShadow = o.cast ?? true; mesh.receiveShadow = true; root.add(mesh); return mesh; };
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

const tileTex = () => { const t = ctex("e4halltile", 512, 512, (g) => {
  let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.fillStyle = "#d9d2bf"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const v = 200 + Math.floor(rnd() * 22); g.fillStyle = `rgb(${v + 12},${v + 6},${v - 12})`; g.fillRect(x * 64 + 1, y * 64 + 1, 62, 62); }
  g.fillStyle = "rgba(90,80,60,0.35)"; for (let i = 0; i <= 8; i++) { g.fillRect(i * 64 - 1, 0, 2, 512); g.fillRect(0, i * 64 - 1, 512, 2); }
  for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.08})`; g.fillRect(rnd() * 512, rnd() * 512, 30 + rnd() * 70, 2); }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 8); return t; };
const lockerTex = () => { const t = ctex("e4lockers", 1024, 512, (g) => {
  g.fillStyle = "#1d2a40"; g.fillRect(0, 0, 1024, 512);
  const cols = ["#2f6fb3", "#2a5f9e", "#3b7bc2", "#2a5f9e"];
  for (let i = 0; i < 8; i++) {
    const x = i * 128; g.fillStyle = cols[i % 4]; g.fillRect(x + 4, 20, 120, 470);
    g.fillStyle = "rgba(255,255,255,0.1)"; g.fillRect(x + 4, 20, 120, 8);
    g.fillStyle = "#0e1a2e"; for (let k = 0; k < 6; k++) g.fillRect(x + 22, 52 + k * 11, 84, 5);
    g.fillStyle = "#cfd6e0"; g.fillRect(x + 90, 250, 14, 52); g.strokeStyle = "#0e1a2e"; g.lineWidth = 3; g.strokeRect(x + 90, 250, 14, 52);
    g.fillStyle = "#ffffff"; g.font = "700 20px Arial, sans-serif"; g.textAlign = "center"; g.fillText(String(100 + ((i * 37) % 80)), x + 64, 218);
    g.fillStyle = "rgba(0,0,0,0.25)"; g.fillRect(x + 4, 470, 120, 20);
  }
}); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3.4, 1); return t; };
const bulletinTex = () => ctex("e4bulletin", 512, 256, (g) => {
  g.fillStyle = "#a8794a"; g.fillRect(0, 0, 512, 256); g.fillStyle = "#c99a62"; g.fillRect(10, 10, 492, 236);
  const cols = ["#ffffff", "#fff3a0", "#ffb3c6", "#a8e6ff", "#ffffff"];
  for (let i = 0; i < 9; i++) { const x = 24 + (i % 5) * 96, y = 24 + Math.floor(i / 5) * 110; g.fillStyle = cols[i % 5]; g.fillRect(x, y, 80, 92); g.fillStyle = "#c0392b"; g.beginPath(); g.arc(x + 40, y + 6, 5, 0, 6.3); g.fill(); g.fillStyle = "#555"; for (let k = 0; k < 6; k++) g.fillRect(x + 8, y + 24 + k * 11, 64 - (k % 3) * 10, 3); }
  g.fillStyle = "#1d428a"; g.font = "900 22px Arial Black, sans-serif"; g.textAlign = "left"; g.fillText("LEVEL-UP DAY", 28, 22);
});
const exitTex = () => ctex("e4exit", 256, 96, (g) => { g.fillStyle = "#0c3b1c"; g.fillRect(0, 0, 256, 96); g.fillStyle = "#4dff88"; g.font = "900 64px Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("EXIT", 128, 52); });
const banner = (name: string, top: string, bottom: string, text: string) => ctex("e4gymb" + name, 256, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(1, bottom); g.fillStyle = gr; g.fillRect(0, 0, 256, 512);
  g.fillStyle = "#ffffff"; g.font = "900 44px Impact, Arial Black, sans-serif"; g.textAlign = "center"; g.fillText(text, 128, 120);
  g.fillStyle = "#ffd35a"; g.beginPath(); g.moveTo(128, 200); g.lineTo(190, 330); g.lineTo(66, 330); g.closePath(); g.fill(); g.fillStyle = "#ffffff"; g.fillRect(0, 440, 256, 10);
});
const gymFloor = () => ctex("e4gymfloor", 1024, 1400, (g) => {
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const W = 1024, H = 1400;
  for (let x = 0; x < W; x += 16) { const v = 176 + Math.floor(rnd() * 22); g.fillStyle = `rgb(${v + 22},${v - 16},${v - 70})`; g.fillRect(x, 0, 15, H); g.fillStyle = "rgba(60,30,10,0.35)"; g.fillRect(x + 15, 0, 1, H); }
  for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(80,40,10,${rnd() * 0.1})`; g.fillRect(rnd() * W, rnd() * H, 18 + rnd() * 60, 1); }
  g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.strokeRect(40, 40, W - 80, H - 80); g.beginPath(); g.moveTo(40, H / 2); g.lineTo(W - 40, H / 2); g.stroke();
  g.fillStyle = "#c8252d"; g.beginPath(); g.arc(W / 2, H / 2, 150, 0, 6.3); g.fill(); g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.stroke();
  g.fillStyle = "#ffffff"; g.font = "900 56px Impact, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TIGERS", W / 2, H / 2);
  for (const y of [60, H - 60 - 330]) { g.fillStyle = "#c8252d"; g.globalAlpha = 0.85; g.fillRect(W / 2 - 150, y, 300, 330); g.globalAlpha = 1; g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.strokeRect(W / 2 - 150, y, 300, 330); }
});

export const buildE4Hallway = (): BuiltSet => {
  const root = new THREE.Group();
  const floorT = tileTex(); floorT.anisotropy = 8;
  mk(root, new THREE.PlaneGeometry(4.6, 13.6).rotateX(-Math.PI / 2), std(floorT, { roughness: 0.28, metalness: 0.06 }), 0, 0, -2.2, { cast: false });
  const wall = std("#cfc8b6", { roughness: 0.9 }), lock = std(lockerTex(), { roughness: 0.55, metalness: 0.15 });
  for (const sx of [-1, 1]) {
    mk(root, box(0.2, 2.9, 13.6), wall, sx * 2.4, 1.45, -2.2, { cast: false });
    mk(root, new THREE.PlaneGeometry(13.6, 1.95).rotateY(-sx * Math.PI / 2), lock, sx * 2.29, 0.98, -2.2, { cast: false });
    mk(root, box(0.06, 0.04, 13.6), std("#b9b2a0"), sx * 2.27, 1.98, -2.2, { cast: false });   // the locker tops' trim
    mk(root, box(0.04, 0.1, 13.6), std("#7a1d1d"), sx * 2.28, 0.05, -2.2, { cast: false });    // a red base stripe
  }
  mk(root, box(4.6, 2.9, 0.2), wall, 0, 1.45, -9.1, { cast: false }); mk(root, box(4.6, 2.9, 0.2), wall, 0, 1.45, 4.7, { cast: false }); mk(root, box(4.8, 0.1, 13.8), std("#e9e6dc"), 0, 2.95, -2.2, { cast: false });
  // the bulletin board and posters above the lockers; a trophy case on the left wall
  mk(root, new THREE.PlaneGeometry(1.5, 0.75).rotateY(Math.PI / 2), new THREE.MeshStandardMaterial({ map: bulletinTex(), roughness: 0.9 }), -2.27, 2.45, -0.5, { cast: false });
  mk(root, new THREE.PlaneGeometry(1.5, 0.75).rotateY(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: bulletinTex(), roughness: 0.9 }), 2.27, 2.45, -4.4, { cast: false });
  mk(root, box(0.3, 1.3, 1.6), std("#4a3a2c", { roughness: 0.5 }), -2.1, 0.65, -6.2); mk(root, box(0.04, 1.1, 1.4), std("#9fd2e8", { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.35 }), -1.94, 0.7, -6.2, { cast: false });
  const gold = std("#e0b030", { roughness: 0.25, metalness: 0.9 }); for (let i = 0; i < 4; i++) mk(root, new THREE.CylinderGeometry(0.07, 0.1, 0.3, 14), gold, -2.1, 0.4 + (i % 2) * 0.45, -6.7 + i * 0.35);
  // the far end: double doors under a green EXIT sign
  const doorM = std("#6b3b24", { roughness: 0.5 }); mk(root, box(1.0, 2.2, 0.08), doorM, -0.52, 1.1, -8.96); mk(root, box(1.0, 2.2, 0.08), doorM, 0.52, 1.1, -8.96); mk(root, box(2.2, 0.12, 0.1), std("#2a2a2a"), 0, 2.27, -8.95);
  mk(root, new THREE.PlaneGeometry(0.7, 0.26), new THREE.MeshBasicMaterial({ map: exitTex(), toneMapped: false }), 0, 2.55, -8.97, { cast: false });
  // fluorescent ceiling panels
  const panels: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 6; i++) { const m = new THREE.MeshStandardMaterial({ color: "#f4f8ff", emissive: "#eef4ff", emissiveIntensity: 2.2 }); panels.push(m); mk(root, box(1.1, 0.05, 0.38), m, 0, 2.9, 3.4 - i * 2.4, { cast: false }); }
  const lights = [3.0, -0.5, -4.0, -7.5].map((z) => { const p = new THREE.PointLight(0xeaf2ff, 0, 7.5, 1.6); p.position.set(0, 2.5, z); root.add(p); return p; });
  const key = new THREE.SpotLight(0xf6f1e6, 0, 0, 0.95, 0.7, 1.5); key.position.set(0.6, 2.8, 2.6); key.target.position.set(0, 1.0, -0.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.camera.near = 0.5; key.shadow.camera.far = 9; key.shadow.bias = -0.0004; root.add(key, key.target);
  const e4: NonNullable<BuiltSet["e4"]> = {
    apply: ({ env, focus, t }) => {
      const s = env.sun; s.color.set("#e6eeff"); s.intensity = 0.9; s.position.copy(focus).add(new THREE.Vector3(2, 20, 6)); s.target.position.copy(focus);
      const sc = s.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 8; sc.far = 50; sc.updateProjectionMatrix(); s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.mapSize.set(2048, 2048);
      env.hemi.color.set("#b8c8e4"); env.hemi.groundColor.set("#6a5c48"); env.hemi.intensity = 1.05; env.fog.color.set("#cfd6e4"); env.fog.near = 9; env.fog.far = 40;
      key.intensity = 48; for (const l of lights) l.intensity = 16; panels.forEach((m, i) => { m.emissiveIntensity = 2.1 + 0.08 * Math.sin(t * 40 + i * 2) * (i === 4 ? 1 : 0.2); });
    },
    tint: () => [1.0, 1.0, 1.02],
  };
  return { root, env: { clouds: false, sky: false }, spots: { mid: [0, 0, 0.5], far: [0, 0, -5], door: [0, 0, -8] }, views: [{ name: "hall", pos: [1.2, 1.5, 3.8], look: [0, 1.2, -2], fov: 50 }], e4 };
};

export const buildE4Gym = (): BuiltSet => {
  const root = new THREE.Group();
  const ft = gymFloor(); ft.anisotropy = 8;
  const wood = new THREE.MeshPhysicalMaterial({ map: ft, roughness: 0.62, metalness: 0.0, clearcoat: 0.0, reflectivity: 0.1 });
  mk(root, new THREE.PlaneGeometry(11.6, 21).rotateX(-Math.PI / 2), wood, 0, 0.002, -2, { cast: false });
  const wallM = std("#d8cfae", { roughness: 0.95 }), lower = std("#7a1d1d", { roughness: 0.9 });
  mk(root, box(40, 8, 0.4), wallM, 0, 4, -13.2, { cast: false }); mk(root, box(40, 8, 0.4), wallM, 0, 4, 9.4, { cast: false }); mk(root, box(0.4, 8, 26), wallM, -14.4, 4, -2, { cast: false }); mk(root, box(0.4, 8, 26), wallM, 14.4, 4, -2, { cast: false });
  mk(root, box(40, 0.4, 28), std("#2a2d36", { roughness: 0.9 }), 0, 7.7, -2, { cast: false });
  mk(root, box(40, 1.2, 0.5), lower, 0, 0.6, -12.95, { cast: false });
  // bleachers: seven tiers each side, with the instanced cheering crowd
  const spots: { x: number; y: number; z: number; ry: number }[] = [], seat = std("#8a6a44", { roughness: 0.7 });
  for (const sx of [-1, 1]) for (let t = 0; t < 7; t++) {
    const px = sx * (6.0 + t * 0.9), y = 0.45 * (t + 1); mk(root, box(0.9, y, 20), seat, px, y / 2, -2.5, { cast: false });
    for (let i = 0; i < 36; i++) { if ((i * 7 + t * 3) % 11 === 0) continue; spots.push({ x: px, y, z: -11.4 + i * 0.55, ry: Math.atan2(sx, 0) }); }
  }
  const crowd = makeCrowd(spots); root.add(crowd.body, crowd.head);
  // banners on the back wall and over the bleachers; steel trusses and lamp bars
  const bm = [banner("a", "#c8252d", "#7a1d1d", "TIGERS"), banner("b", "#1d428a", "#0d2250", "WINNERS"), banner("c", "#2a9d8f", "#145a52", "LEVEL UP")];
  for (let i = 0; i < 6; i++) for (const sx of [-1, 1]) mk(root, new THREE.PlaneGeometry(1.5, 3), new THREE.MeshStandardMaterial({ map: bm[(i + (sx > 0 ? 1 : 0)) % 3], roughness: 0.8, emissive: "#ffffff", emissiveMap: bm[(i + (sx > 0 ? 1 : 0)) % 3], emissiveIntensity: 0.22, side: THREE.DoubleSide }), sx * 14.1, 5.2, -11 + i * 3.6, { cast: false, ry: -sx * Math.PI / 2 });
  for (let i = 0; i < 7; i++) mk(root, new THREE.PlaneGeometry(1.5, 3), new THREE.MeshStandardMaterial({ map: bm[i % 3], roughness: 0.8, emissive: "#ffffff", emissiveMap: bm[i % 3], emissiveIntensity: 0.22, side: THREE.DoubleSide }), -9 + i * 3, 4.6, -12.95, { cast: false });
  const steel = std("#3a3f4c", { roughness: 0.5, metalness: 0.6 }); for (let i = 0; i < 6; i++) mk(root, box(0.18, 0.22, 26), steel, -7 + i * 2.8, 7.2, -2, { cast: false });
  const lamps: THREE.MeshStandardMaterial[] = [];
  for (const [x, z] of [[-4, -6], [4, -6], [-4, 0], [4, 0], [0, 4], [0, -3], [0, -9]] as [number, number][]) { const m = new THREE.MeshStandardMaterial({ color: "#fff7e0", emissive: "#fff2cc", emissiveIntensity: 3 }); lamps.push(m); mk(root, box(1.4, 0.12, 0.7), m, x, 7.0, z, { cast: false }); }
  const keySpot = new THREE.SpotLight(0xfff0d8, 0, 0, 0.8, 0.6, 1.4); keySpot.position.set(1.5, 7.0, 3); keySpot.target.position.set(0, 0, -2); keySpot.castShadow = true; keySpot.shadow.mapSize.set(2048, 2048); keySpot.shadow.camera.near = 2; keySpot.shadow.camera.far = 14; keySpot.shadow.bias = -0.0004; root.add(keySpot, keySpot.target);
  const stands: THREE.DirectionalLight[] = [];
  for (const [px, tx] of [[-3, 14], [3, -14]] as [number, number][]) { const d = new THREE.DirectionalLight(0xe8efff, 0); d.position.set(px, 6, -2); d.target.position.set(tx, 2, -2); root.add(d, d.target); stands.push(d); }
  const e4: NonNullable<BuiltSet["e4"]> = {
    apply: ({ env, focus, t }) => {
      const s = env.sun; s.color.set("#fff4e2"); s.intensity = 2.2; s.position.copy(focus).add(new THREE.Vector3(2, 36, 8)); s.target.position.copy(focus);
      const sc = s.shadow.camera; sc.left = -8; sc.right = 8; sc.top = 8; sc.bottom = -8; sc.near = 14; sc.far = 80; sc.updateProjectionMatrix(); s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.radius = 3; s.shadow.mapSize.set(4096, 4096);
      env.hemi.color.set("#aab4d4"); env.hemi.groundColor.set("#3a2a1c"); env.hemi.intensity = 1.1; env.fog.color.set("#2a2e40"); env.fog.near = 10; env.fog.far = 46;
      keySpot.intensity = 60; for (const d of stands) d.intensity = 1.5; for (const m of lamps) m.emissiveIntensity = 2.6; crowd.update(t);
    },
    tint: () => [1.0, 0.98, 0.95],
  };
  return { root, env: { clouds: false, sky: false }, spots: { center: [0, 0, -1.5], far: [0, 0, -7], door: [-6, 0, 6] }, views: [{ name: "gym", pos: [4.5, 2.4, 6], look: [0, 1.2, -2], fov: 56 }], e4 };
};
