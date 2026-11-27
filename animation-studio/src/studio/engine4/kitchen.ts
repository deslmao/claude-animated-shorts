// Engine 4, Phase 1: Maya's kitchen as a unified PBR set. The room is built offline (blender/sets/kitchen.py: Poly Haven CC0
// textures, bevelled cabinets, five hero props) and its INDIRECT light (bounce from the window and the pendant lamp) is baked once
// into a lightmap. Here the GLB is loaded as-is (MeshStandardMaterial), the lightmap goes on uv channel 1, and the DIRECT light is
// live: a cool window light (the sun slot, so the 2D characters' shadow and side gradient follow it), the warm pendant lamp
// (a spot light: real card shadows), a low hemisphere fill, fog and drifting dust motes.
// Colour management: GLB colour textures are sRGB, the lightmap is linear (EXR), the composer ends in ACES filmic (look/StudioFilm).
// Coordinates (three, metres): room x -2.2..2.2, z -2.4 (back wall, window) .. 3.6 (front wall, the "fourth wall" cameras shoot from), height 2.7.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { staticFile } from "remotion";
import { registerPreload } from "../look/preload";
import { ctex } from "../materials/paint";
import { CARD_K } from "../look/cardshade";
import type { BuiltSet } from "../sets/types";

/** the room's inside (x0, x1, z0, z1, floor, ceiling): a camera outside it films the back of a wall (a black frame) */
export const ROOM = { x0: -2.15, x1: 2.15, z0: -2.35, z1: 3.55, y0: 0.1, y1: 2.6 };
export const LAMP: [number, number, number] = [0.35, 1.6, -0.3];     // the pendant bulb
export const WINDOW: [number, number, number] = [0, 1.6, -2.3];       // the window's centre
/** world direction toward the (dusk) window light, from outside the back wall */
export const WINDOW_DIR = new THREE.Vector3(0.22, 0.4, -0.89).normalize();

// ---- loading (before the first frame, via look/preload.ts; in Node (floor maps, tests) there is only the proxy below)
let loaded: { scene: THREE.Group; lm: THREE.Texture } | undefined;
if (typeof window !== "undefined" && typeof document !== "undefined") {
  registerPreload(Promise.all([
    new GLTFLoader().loadAsync(staticFile("e4/kitchen/kitchen.glb")),
    new EXRLoader().setDataType(THREE.HalfFloatType).loadAsync(staticFile("e4/kitchen/kitchen_lm.exr")),
  ]).then(([g, lm]) => { loaded = { scene: g.scene, lm }; }).catch((e) => { console.error("e4 kitchen: load failed", e); }));
}

const NO_CAST = new Set(["sky", "silhouette", "winlit", "lampshade", "bulb", "cord"]);   // outside the window / the lamp itself: never block the lights
const EMISSIVE = new Set(["lampshade", "bulb", "winlit"]);

/** the lamp's emissive materials and their authored strength (Engine 4 background life flickers them with the live spot light) */
const GLOW: { mat: THREE.MeshStandardMaterial; base: number }[] = [];
const NIGHTSKY: { mat: THREE.MeshStandardMaterial; col: THREE.Color; em: THREE.Color; ei: number }[] = [];   // the window's outside sky (and lit windows): navy at night
const LIT: THREE.MeshStandardMaterial[] = [];   // every material that carries the baked lightmap (dimmed at night)
function prepare(root: THREE.Object3D, lm: THREE.Texture) {
  lm.colorSpace = THREE.NoColorSpace; lm.channel = 1; lm.flipY = false; lm.repeat.set(1, -1); lm.offset.set(0, 1);   // EXRLoader rows run bottom-up; glTF uv v runs top-down lm.generateMipmaps = false; lm.minFilter = lm.magFilter = THREE.LinearFilter; lm.needsUpdate = true;
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const mat = m.material as THREE.MeshStandardMaterial, name = mat.name;
    m.castShadow = !NO_CAST.has(name); m.receiveShadow = true;
    mat.aoMap = null;                                                   // the exporter's dummy white occlusion (it only carried the second UV set)
    mat.lightMap = lm; mat.lightMapIntensity = Math.PI;                   // Blender bakes E/pi; three multiplies by albedo/pi
    if ((name === "sky" || name === "silhouette") && !NIGHTSKY.some((n) => n.mat === mat)) NIGHTSKY.push({ mat, col: mat.color.clone(), em: mat.emissive.clone(), ei: mat.emissiveIntensity });
    if (EMISSIVE.has(name) || name === "sky") mat.lightMap = null; else if (!LIT.includes(mat)) LIT.push(mat);
    mat.envMapIntensity = 0.4;
    if ((name === "bulb" || name === "lampshade") && !GLOW.some((g) => g.mat === mat)) GLOW.push({ mat, base: mat.emissiveIntensity });
    mat.needsUpdate = true;
  });
}

// ---- dust motes: a fixed cloud of soft points that drift on closed paths (a pure function of time, so chunked renders match)
const N = 90;
function makeDust() {
  const g = new THREE.BufferGeometry(), base = new Float32Array(N * 3), pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < N; i++) {
    const inLamp = i < 50;
    // lamp cloud: a cone under the shade; window cloud: a shaft from the window into the room
    if (inLamp) { const a = rnd() * 6.283, r = Math.sqrt(rnd()) * 0.9, y = 0.9 + rnd() * 0.65; base.set([LAMP[0] + Math.cos(a) * r * (0.35 + y / 1.6 * 0.5), y, LAMP[2] + Math.sin(a) * r * (0.35 + y / 1.6 * 0.5)], i * 3); col.set([1.0, 0.8, 0.55], i * 3); }
    else { const k = 0.25 + rnd() * 0.75; base.set([-0.55 + rnd() * 1.1 + k * 0.5, 0.6 + rnd() * 1.6, -2.2 + k * 2.6], i * 3); col.set([0.3, 0.38, 0.5], i * 3); }
  }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const tex = ctex("e4dust", 64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.006, map: tex, vertexColors: true, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false }));
  pts.frustumCulled = false;
  const update = (t: number) => {
    for (let i = 0; i < N; i++) {
      const ph = i * 1.713, sp = 0.35 + (i % 7) * 0.06;
      pos[i * 3] = base[i * 3] + Math.sin(t * sp + ph) * 0.07 + Math.sin(t * 0.13 + ph * 2) * 0.05;
      pos[i * 3 + 1] = base[i * 3 + 1] + Math.sin(t * sp * 0.8 + ph * 1.3) * 0.05 - ((t * 0.012 + i * 0.037) % 0.5) * 0.0;
      pos[i * 3 + 2] = base[i * 3 + 2] + Math.cos(t * sp * 0.9 + ph) * 0.07;
    }
    g.attributes.position.needsUpdate = true;
  };
  return { pts, update };
}

// ---- background life (Phase 3): kettle steam, a living lamp, slow cloud-light on the window. All pure functions of time.
const KETTLE: [number, number, number] = [-1.4, 1.09, -2.12];
function makeSteam() {
  const n = 28, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const tex = ctex("e4steam", 64, 64, (c) => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,0.9)"); gr.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.075, map: tex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false }));
  pts.frustumCulled = false;
  const update = (t: number) => {
    for (let i = 0; i < n; i++) {
      const ph = (t * 0.42 + i / n) % 1, life = Math.sin(Math.PI * ph) ** 1.5, sw = Math.sin(ph * 7 + i * 2.1);
      pos[i * 3] = KETTLE[0] + 0.03 * ph + sw * 0.03 * ph; pos[i * 3 + 1] = KETTLE[1] + ph * 0.42; pos[i * 3 + 2] = KETTLE[2] + Math.cos(ph * 5 + i) * 0.025 * ph;
      const c = 0.2 * life; col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = c;
    }
    g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
  };
  return { pts, update };
}
/** a warm pendant flicker: a slight fast shimmer plus a slow breathing, and every ~5 s a brief dip (a failing filament), -3..+3 % */
export const lampFlicker = (t: number) => {
  const dip = Math.max(0, Math.sin(t * 1.25 + 0.6)) ** 24 * Math.max(0, Math.sin(t * 17)) * 0.5;
  return 1 + 0.018 * Math.sin(t * 9.3) + 0.012 * Math.sin(t * 23.7 + 1.1) + 0.01 * Math.sin(t * 2.1) - 0.05 * dip;
};

const mix = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
/** the room's lights on a character card: warm near the pendant, a cool cast near the window (subtle: a few per cent) */
const tint = (x: number, y: number, z: number): [number, number, number] => {
  const dl = Math.hypot(x - LAMP[0], (y - LAMP[1]) * 0.6, z - LAMP[2]), dw = Math.hypot(x - WINDOW[0], (y - WINDOW[1]) * 0.6, z - WINDOW[2]);
  const wl = Math.exp(-((dl / 1.7) ** 2)) * 0.8, wc = Math.exp(-((dw / 1.6) ** 2)) * 0.6;
  let c = [1, 1, 1]; c = mix(c, [1.0, 0.78, 0.55], wl); c = mix(c, [0.72, 0.84, 1.1], wc);
  return [c[0], c[1], c[2]];
};

export const buildE4Kitchen = (): BuiltSet => {
  const root = new THREE.Group();
  const dust = makeDust(), steam = makeSteam();
  // the live lamp: a spot light straight down from the bulb (spot shadows work with the card depth material; point shadows do not)
  const lamp = new THREE.SpotLight(0xffb870, 14, 0, 1.15, 0.9, 2);
  lamp.position.set(...LAMP); lamp.target.position.set(LAMP[0], 0, LAMP[2]);
  lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.camera.near = 0.15; lamp.shadow.camera.far = 6; lamp.shadow.bias = -0.0004; lamp.shadow.normalBias = 0.02; lamp.shadow.radius = 4;
  root.add(lamp, lamp.target, dust.pts, steam.pts);
  if (loaded) { prepare(loaded.scene, loaded.lm); root.add(loaded.scene); }
  else {
    // no GLB (Node: floor maps, validators): coarse invisible stand-ins for the solids so clearance checks have something to hit
    const box = (c: [number, number, number], s: [number, number, number]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(...s), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(...c); root.add(m); };
    box([0, -0.05, 0.6], [4.4, 0.1, 6.0]); box([0.35, 0.4, -0.3], [1.3, 0.8, 0.8]); box([-0.5, 0.45, -2.1], [3.4, 0.9, 0.6]); box([1.7, 0.92, -2.05], [0.8, 1.85, 0.75]);
  }
  const e4: NonNullable<BuiltSet["e4"]> = {
    apply: ({ env, focus, t, light }) => {
      const night = light === "night" ? 1 : 0;   // a night shot: the window is moonlight, the baked bounce is dimmed, the pendant lamp carries the room
      // the window light takes the sun's slot (the only light the cards' side gradient reads), fixed in the room, not camera-relative
      const s = env.sun;
      s.color.set(night ? "#5f7fd8" : "#a9c4ff"); s.intensity = 3.2; s.position.copy(focus).addScaledVector(WINDOW_DIR, 60); s.target.position.copy(focus);
      const sc = s.shadow.camera; sc.left = -4.5; sc.right = 4.5; sc.top = 4.5; sc.bottom = -4.5; sc.near = 20; sc.far = 100; sc.updateProjectionMatrix();
      s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.radius = 3; s.shadow.mapSize.set(4096, 4096);
      env.hemi.color.set("#243050"); env.hemi.groundColor.set("#3a2a20"); env.hemi.intensity = night ? 0.1 : 0.28;
      for (const m of LIT) m.lightMapIntensity = Math.PI * (night ? 0.3 : 1);
      for (const n of NIGHTSKY) { n.mat.color.copy(n.col).multiplyScalar(night ? 0.12 : 1); n.mat.emissive.copy(n.em).multiplyScalar(night ? 0.1 : 1); n.mat.emissiveIntensity = n.ei; }
      env.fog.color.set("#2a2018"); env.fog.near = 2.5; env.fog.far = 16;
      CARD_K.uGain.value = light === "night" ? 0.62 : 0.92;   // PBR rooms are darker than the painted ones: the cards sit a little lower in the light
      dust.update(t); steam.update(t);
      const fl = lampFlicker(t);
      lamp.intensity = (night ? 24 : 14) * fl; for (const gl of GLOW) gl.mat.emissiveIntensity = gl.base * fl;
      s.intensity = (night ? 0.7 : 3.2) * (1 + 0.04 * Math.sin(t * 0.7) + 0.02 * Math.sin(t * 1.9 + 2));   // slow cloud light from the window
    },
    tint,
  };
  return { root, env: { clouds: false, sky: false }, spots: SPOTS, views: VIEWS, e4 };
};

export const SPOTS: Record<string, [number, number, number]> = {
  a: [-0.6, 0, -1.25], b: [0.35, 0, 0.85], c: [1.55, 0, -1.15], d: [-1.5, 0, -0.2],
  counter: [-0.6, 0, -1.25], table: [0.35, 0, 0.85], fridge: [1.55, 0, -1.15], window: [0, 0, -1.4],
};
export const VIEWS = [
  { name: "wide", pos: [1.7, 1.45, 1.75] as [number, number, number], look: [-0.15, 1.0, -1.3] as [number, number, number], fov: 56 },
  { name: "table", pos: [-1.2, 1.35, 1.6] as [number, number, number], look: [0.35, 0.95, -0.3] as [number, number, number], fov: 46 },
  { name: "counter", pos: [0.6, 1.5, 0.6] as [number, number, number], look: [-0.9, 1.1, -2.0] as [number, number, number], fov: 40 },
];
