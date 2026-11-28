// Engine 4, Episode 2: the street court. A flat asphalt half-court with one hoop and backboard, a chain-link fence, a bench, a streetlamp, and simple houses and trees
// behind it. A procedural PBR set (MeshStandardMaterial, live lights, soft shadows from the sun, fog), no Blender bake: the court is open air, so the light is one
// strong sun, a sky fill and the fog. Two lighting states, picked by the shot's `light`:
//   "day"   bright afternoon: warm low sun from the back-left, blue sky, long cast shadows from the cards onto the asphalt;
//   "night" 5 AM dawn in the rain: a cool grey-blue half-light, wet asphalt (low roughness, puddle sheen), mist, falling rain, the streetlamp still on.
// Coordinates (three, metres): the court floor is y = 0, x -5.6..5.6, z -6.2 (fence behind the hoop) .. +4.8 (the camera side); the hoop is at (0, 2.45, -4.15).
import * as THREE from "three";
import { mkTex as ctex } from "./tex";
import { buildHoop } from "./hoop";
import type { BuiltSet } from "../sets/types";

/** where a camera may stand: inside the fenced court (a camera outside the fence films a back or a house wall) */
export const COURT_ROOM = { x0: -5.7, x1: 5.7, z0: -6.1, z1: 5.0, y0: 0.05, y1: 6.5 };
let lightIsDawn = false;
export const HOOP: [number, number, number] = [0, 2.45, -4.15];
const LAMP: [number, number, number] = [4.6, 4.4, -4.6];

const std = (color: string | THREE.Texture, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ ...(typeof color === "string" ? { color } : { map: color }), roughness: 0.85, metalness: 0, ...o });
const add = (root: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, o: { cast?: boolean; recv?: boolean; ry?: number } = {}) => {
  const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.rotation.y = o.ry ?? 0; mesh.castShadow = o.cast ?? true; mesh.receiveShadow = o.recv ?? true; root.add(mesh); return mesh;
};
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

/** the painted court: a faded blue key and white lines on grey asphalt, with crack and wear noise (a canvas, 1 px = 1 cm / 4) */
const courtTexture = () => ctex("e4court", 2048, 2048, (g) => {
  let s = 11; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const W = 2048;
  g.fillStyle = "#4a4e54"; g.fillRect(0, 0, W, W);
  // rough, weathered asphalt: coarse grit, worn lighter patches, dark oil stains, tar-filled cracks
  for (let i = 0; i < 60000; i++) { const v = 52 + rnd() * 52; g.fillStyle = `rgba(${v},${v + 2},${v + 6},0.55)`; g.fillRect(rnd() * W, rnd() * W, 2 + rnd() * 4, 2 + rnd() * 4); }
  for (let i = 0; i < 40; i++) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); g.save(); g.translate(rnd() * W, rnd() * W); g.scale(60 + rnd() * 200, 40 + rnd() * 120); gr.addColorStop(0, "rgba(120,124,130,0.16)"); gr.addColorStop(1, "rgba(120,124,130,0)"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 6.3); g.fill(); g.restore(); }
  for (let i = 0; i < 18; i++) { const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1); g.save(); g.translate(rnd() * W, rnd() * W); g.scale(30 + rnd() * 90, 20 + rnd() * 60); gr.addColorStop(0, "rgba(10,10,12,0.4)"); gr.addColorStop(1, "rgba(10,10,12,0)"); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 1, 0, 6.3); g.fill(); g.restore(); }
  // the painted half-court (1 m = 179.6 px; the hoop is at x 1024, y 368 on this plane): a faded blue key, crisp white lines
  const m = 179.6, base = 144, hoopY = 368;
  g.fillStyle = "#2d5f86"; g.fillRect(1024 - 1.95 * m, base, 3.9 * m, 4.6 * m);
  g.strokeStyle = "#ece8dc"; g.lineWidth = 14; g.lineJoin = "miter";
  g.strokeRect(100, base, W - 200, 1800); g.strokeRect(1024 - 1.95 * m, base, 3.9 * m, 4.6 * m);
  g.beginPath(); g.arc(1024, base + 4.6 * m, 1.45 * m, Math.PI, 2 * Math.PI, true); g.stroke();                       // the free-throw circle (the half toward the hoop is solid)
  g.setLineDash([26, 22]); g.beginPath(); g.arc(1024, base + 4.6 * m, 1.45 * m, 0, Math.PI, false); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.moveTo(1024 - 5.0 * m, base); g.lineTo(1024 - 5.0 * m, hoopY); g.arc(1024, hoopY, 5.0 * m, Math.PI, 0, true); g.lineTo(1024 + 5.0 * m, base); g.stroke();   // the three-point line
  g.beginPath(); g.arc(1024, hoopY, 0.7 * m, 0, Math.PI, false); g.stroke();                                           // the restricted arc
  for (let k = 0; k < 24; k++) { g.fillStyle = `rgba(74,78,84,${0.15 + rnd() * 0.3})`; g.fillRect(rnd() * W, rnd() * W, 8 + rnd() * 26, 3 + rnd() * 6); }   // paint wear
  g.strokeStyle = "rgba(14,14,16,0.85)"; g.lineWidth = 3;
  for (let k = 0; k < 26; k++) { let x = rnd() * W, y = rnd() * W; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 9; j++) { x += (rnd() - 0.5) * 90; y += (rnd() - 0.3) * 80; g.lineTo(x, y); } g.stroke(); }
});
/** a chain-link fence as an alpha-tested diamond mesh */
const fenceTexture = () => ctex("e4fence", 128, 128, (g) => {
  g.clearRect(0, 0, 128, 128); g.strokeStyle = "#9aa2ac"; g.lineWidth = 6; g.lineCap = "round";
  for (let i = -1; i < 3; i++) { g.beginPath(); g.moveTo(0, i * 64); g.lineTo(128, i * 64 + 128); g.stroke(); g.beginPath(); g.moveTo(0, i * 64 + 128); g.lineTo(128, i * 64); g.stroke(); }
});

/** falling rain: a few hundred thin streaks in a box round the focus, a pure function of time (chunked renders match) */
const makeRain = () => {
  const N = 900, g = new THREE.BufferGeometry(), pos = new Float32Array(N * 6), base = new Float32Array(N * 3);
  let s = 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < N; i++) base.set([(rnd() - 0.5) * 12, rnd() * 6, (rnd() - 0.5) * 12], i * 3);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.LineBasicMaterial({ color: "#b8c6dc", transparent: true, opacity: 0.38, depthWrite: false, fog: false });
  const lines = new THREE.LineSegments(g, mat); lines.frustumCulled = false; lines.visible = false;
  const update = (t: number, c: THREE.Vector3, on: boolean) => {
    lines.visible = on; if (!on) return;
    for (let i = 0; i < N; i++) {
      const sp = 9 + (i % 7), y = ((base[i * 3 + 1] - t * sp) % 6 + 6) % 6, x = c.x + base[i * 3] + (6 - y) * 0.06, z = c.z + base[i * 3 + 2];
      pos.set([x, y, z, x - 0.03, y + 0.42, z - 0.01], i * 6);
    }
    g.attributes.position.needsUpdate = true;
  };
  return { lines, update };
};

export const buildE4Court = (): BuiltSet => {
  const root = new THREE.Group();
  // ---- the ground: a wide asphalt apron, the painted court on top, a pale kerb strip round it
  const ct = courtTexture(); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.anisotropy = 4;
  const asphalt = std("#3e4147", { roughness: 0.9 });
  add(root, new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), asphalt, 0, -0.002, -6, { cast: false });
  const courtMat = std(ct, { roughness: 0.85, bumpMap: ct, bumpScale: 2.0 });   // the grit also roughens the surface (a bump map)
  add(root, new THREE.PlaneGeometry(11.4, 11.4).rotateX(-Math.PI / 2), courtMat, 0, 0.002, -0.5, { cast: false });
  add(root, box(12.4, 0.06, 0.18), std("#8c8f94"), 0, 0.03, 5.2, { cast: false }); add(root, box(12.4, 0.06, 0.18), std("#8c8f94"), 0, 0.03, -6.3, { cast: false });
  // ---- the hoop: a steel pole and arm behind a plexiglass backboard, a breakaway rim, a diamond-mesh net (engine4/hoop.ts)
  const steel = std("#5d6670", { roughness: 0.45, metalness: 0.6 });
  add(root, new THREE.CylinderGeometry(0.09, 0.09, 3.6, 12), steel, 0, 1.8, -5.0);
  add(root, box(0.1, 0.1, 0.9), steel, 0, 3.15, -4.75);
  root.add(buildHoop(HOOP));
  // ---- the chain-link fence behind the hoop and down both sides, with posts and a top rail
  const ft = fenceTexture(); ft.wrapS = ft.wrapT = THREE.RepeatWrapping;
  const fenceMat = (len: number) => { const t = ft.clone(); t.repeat.set(len * 2.4, 3.2 * 2.4); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.5, color: "#aab2bc" }); };
  const fence = (x: number, z: number, len: number, ry: number) => {
    add(root, new THREE.PlaneGeometry(len, 3.2), fenceMat(len), x, 1.6, z, { ry });
    add(root, new THREE.CylinderGeometry(0.03, 0.03, len, 8).rotateZ(Math.PI / 2), steel, x, 3.2, z, { ry, recv: false });
    const nP = Math.round(len / 2.4);
    for (let i = 0; i <= nP; i++) { const u = -len / 2 + (i * len) / nP; add(root, new THREE.CylinderGeometry(0.04, 0.04, 3.3, 8), steel, x + Math.cos(ry) * u, 1.65, z - Math.sin(ry) * u, { recv: false }); }
  };
  fence(0, -6.3, 12.4, 0); fence(-6.2, -0.5, 11.6, Math.PI / 2); fence(6.2, -0.5, 11.6, Math.PI / 2);
  // ---- a bench and a bin by the fence, a pile of school bags
  add(root, box(1.6, 0.06, 0.4), std("#8a5a3c"), -3.6, 0.46, -5.8); add(root, box(1.6, 0.4, 0.05), std("#8a5a3c"), -3.6, 0.7, -5.98);
  for (const x of [-4.3, -2.9]) add(root, box(0.06, 0.46, 0.4), steel, x, 0.23, -5.8);
  add(root, new THREE.CylinderGeometry(0.28, 0.24, 0.85, 14), std("#2f6a4f", { roughness: 0.6 }), 4.9, 0.42, -5.6);
  for (const [x, z, c] of [[-4.6, 2.4, "#c8252d"], [-4.2, 2.8, "#e0a526"], [-4.9, 3.1, "#2a9d8f"]] as [number, number, string][]) add(root, box(0.34, 0.42, 0.18), std(c, { roughness: 0.7 }), x, 0.21, z, { ry: x });
  // ---- the streetlamp (on at dawn)
  add(root, new THREE.CylinderGeometry(0.07, 0.1, 4.4, 10), steel, LAMP[0], 2.2, LAMP[2]); add(root, box(0.9, 0.08, 0.12), steel, LAMP[0] - 0.4, 4.4, LAMP[2]);
  const lampHead = add(root, box(0.36, 0.1, 0.22), new THREE.MeshStandardMaterial({ color: "#fff3d0", emissive: "#ffcf80", emissiveIntensity: 0.0 }), LAMP[0] - 0.8, 4.34, LAMP[2], { cast: false });
  const lampLight = new THREE.SpotLight(0xffc880, 0, 12, 0.9, 0.7, 1.6); lampLight.position.set(LAMP[0] - 0.8, 4.3, LAMP[2]); lampLight.target.position.set(LAMP[0] - 1.5, 0, LAMP[2] + 3.5); root.add(lampLight, lampLight.target);
  // ---- the neighbourhood behind the fence: pastel houses with gabled roofs and windows, trees, a water tower
  const houseCols = ["#d9a98a", "#b9cfd6", "#d8cf9a", "#c98a8a", "#9fb89a", "#cfc2d6"];
  const windows: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 9; i++) {
    const x = -22 + i * 5.6 + ((i * 37) % 7) * 0.2, z = -15 - ((i * 53) % 5), w = 4.2 + (i % 3) * 0.7, h = 3.4 + (i % 4) * 0.5, d = 4.5;
    add(root, box(w, h, d), std(houseCols[i % 6]), x, h / 2, z);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.78, 1.5, 4).rotateY(Math.PI / 4).scale(1, 1, d / w), std(i % 2 ? "#6a3a2e" : "#4a4f5a")); roof.position.set(x, h + 0.75, z); roof.castShadow = true; root.add(roof);
    const wm = new THREE.MeshStandardMaterial({ color: "#8fb4d4", emissive: "#ffcf80", emissiveIntensity: 0, roughness: 0.2 }); windows.push(wm);
    for (const k of [-1, 1]) add(root, box(0.7, 0.9, 0.05), wm, x + k * w * 0.26, h * 0.55, z + d / 2 + 0.03, { cast: false });
    add(root, box(0.7, 1.3, 0.05), std("#5a3a2a"), x, 0.65, z + d / 2 + 0.03, { cast: false });
  }
  const leaf = std("#4f8f3a", { roughness: 0.9 }); const leafDawn = leaf;
  for (const [x, z, s] of [[-9, -9.5, 1.3], [-4.5, -11, 1.1], [3, -10, 1.5], [8.5, -9, 1.2], [-11, -4, 1.0], [11, -3, 1.2], [-10.5, 3, 1.1]] as [number, number, number][]) {
    add(root, new THREE.CylinderGeometry(0.16 * s, 0.22 * s, 2.6 * s, 8), std("#5a3e2a"), x, 1.3 * s, z);
    for (const [dx, dy, r] of [[0, 3.2, 1.5], [-0.8, 2.7, 1.1], [0.8, 2.8, 1.2]] as [number, number, number][]) add(root, new THREE.IcosahedronGeometry(r * s, 1), leaf, x + dx * s, dy * s, z);
  }
  void leafDawn;
  const rain = makeRain(); root.add(rain.lines);
  // ---- lights: the shared env.sun (shadows) is taken over in apply; the lamp above is the dawn accent
  const e4: NonNullable<BuiltSet["e4"]> = {
    apply: ({ env, focus, t, light }) => {
      const dawn = light === "night"; lightIsDawn = dawn;   // the cards' tint (below) follows the shot's lighting state
      const s = env.sun;
      if (dawn) { s.color.set("#7f98c8"); s.intensity = 0.75; s.position.copy(focus).add(new THREE.Vector3(-18, 26, -22)); }
      else { s.color.set("#ffe0b0"); s.intensity = 3.4; s.position.copy(focus).add(new THREE.Vector3(-22, 26, -14)); }
      s.target.position.copy(focus);
      const sc = s.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 5; sc.far = 90; sc.updateProjectionMatrix();
      s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.radius = 3; s.shadow.mapSize.set(4096, 4096);
      if (dawn) { env.hemi.color.set("#56668e"); env.hemi.groundColor.set("#222a3a"); env.hemi.intensity = 0.55; env.fog.color.set("#2a3550"); env.fog.near = 3; env.fog.far = 26; }
      else { env.hemi.color.set("#bcd6ff"); env.hemi.groundColor.set("#8a7a60"); env.hemi.intensity = 0.7; env.fog.color.set("#d9e6f6"); env.fog.near = 22; env.fog.far = 110; }
      asphalt.roughness = dawn ? 0.2 : 0.9; courtMat.roughness = dawn ? 0.18 : 0.82; courtMat.metalness = dawn ? 0.15 : 0;
      lampLight.intensity = dawn ? 55 * (1 + 0.03 * Math.sin(t * 7.1)) : 0; (lampHead.material as THREE.MeshStandardMaterial).emissiveIntensity = dawn ? 2.2 : 0;
      for (const w of windows) w.emissiveIntensity = dawn ? 0.5 : 0;
      rain.update(t, focus, dawn);
    },
    // the cards' light: warm afternoon sun by day; a cool wet grey at dawn with a warm patch under the lamp
    tint: (x, y, z) => {
      void y;
      if (!lightIsDawn) return [1.0, 0.97, 0.9];
      const d = Math.hypot(x - (LAMP[0] - 0.8), z - (LAMP[2] + 2)), w = Math.exp(-((d / 3.2) ** 2)) * 0.6;
      return [0.74 + 0.26 * w, 0.84 + 0.1 * w, 1.1 - 0.3 * w];
    },
  };
  return { root, env: { clouds: true, sky: true }, spots: SPOTS, views: VIEWS, e4 };
};

export const SPOTS: Record<string, [number, number, number]> = {
  hoop: [0, 0, -3.4], key: [0, 0, -1.6], free: [0, 0, 0.2], wing: [-2.6, 0, -1.0], top: [0, 0, 1.4], bench: [-3.6, 0, -4.9], lamp: [3.9, 0, -3.8],
};
export const VIEWS = [
  { name: "wide", pos: [3.8, 1.6, 4.2] as [number, number, number], look: [0, 1.0, -1.5] as [number, number, number], fov: 56 },
  { name: "hoop", pos: [-1.5, 1.4, 2.4] as [number, number, number], look: [0, 2.2, -4.2] as [number, number, number], fov: 44 },
];
