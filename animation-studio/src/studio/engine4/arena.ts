// Engine 4, Episode 2: the Thunder arena. Two zones in one procedural PBR set, told apart by camera and lighting state:
//   the court   a glossy hardwood floor with a centre logo and painted key, a hoop, LED ad boards, bleachers full of a (bobbing, instanced) crowd on three sides,
//               a dark roof with a lighting rig. Lighting state "interior" = game night: bright overhead key, warm and cool fills, bloom on the LEDs.
//   the tunnel  a concrete passage off the court (x -17..-9): strip lights, a wooden bench, a Thunder banner, and the court's glow spilling in through the opening.
//               Lighting state "interiorCool" = the tunnel before the fourth quarter: dim, cool, with the warm court light at the mouth.
// Coordinates (three, metres): floor y = 0; the court is x -7..7, z -10..6, the hoop at (0, 2.45, -8.15); the tunnel mouth is the wall opening at x = -9, z -3..3;
// the bench sits against the tunnel's back wall at (-13, 0, -2.45).
import * as THREE from "three";
import { mkTex as ctex } from "./tex";
import { buildHoop } from "./hoop";
import type { BuiltSet } from "../sets/types";

/** where a camera may stand: the arena floor and the tunnel (a camera inside the stands or outside the walls films a seat back or a black wall) */
export const arenaInside = (x: number, y: number, z: number) => y >= 0.05 && y <= 8.2 && ((x >= -8.6 && x <= 8.2 && z >= -10.4 && z <= 6.6) || (x >= -17.2 && x < -8.6 && z >= -3.2 && z <= 3.2 && y <= 3.3) || (x > 8.2 && x <= 19.5 && z >= -10.4 && z <= 6.6 && y >= 0.5 * Math.ceil((x - 8.4) / 0.95 + 0.3) + 1.0));   // (the right stands: a camera there must stay above the tier it is over)
export const ARENA_ROOM = { x0: -17.2, x1: 8.2, z0: -10.4, z1: 6.6, y0: 0.05, y1: 8.2 };
export const HOOP: [number, number, number] = [0, 2.45, -8.15];
export const BENCH: [number, number, number] = [-13, 0, -2.45];

const std = (color: string | THREE.Texture, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ ...(typeof color === "string" ? { color } : { map: color }), roughness: 0.8, metalness: 0, ...o });
const add = (root: THREE.Object3D, g: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, o: { cast?: boolean; recv?: boolean; ry?: number } = {}) => {
  const mesh = new THREE.Mesh(g, m); mesh.position.set(x, y, z); mesh.rotation.y = o.ry ?? 0; mesh.castShadow = o.cast ?? true; mesh.receiveShadow = o.recv ?? true; root.add(mesh); return mesh;
};
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

/** the hardwood (1024 x 1536 px for 14 x 16.5 m): alternating plank tones, the key, the three-point arc, the centre circle and the THUNDER logo */
const floorTexture = () => ctex("e4arenafloor", 1024, 1200, (g) => {
  let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const W = 1024, H = 1200;
  for (let x = 0; x < W; x += 16) { const v = 168 + Math.floor(rnd() * 26); g.fillStyle = `rgb(${v + 22},${v - 20},${v - 78})`; g.fillRect(x, 0, 15, H); g.fillStyle = "rgba(60,30,10,0.35)"; g.fillRect(x + 15, 0, 1, H); }
  for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(80,40,10,${rnd() * 0.12})`; g.fillRect(rnd() * W, rnd() * H, 18 + rnd() * 60, 1); }
  for (let x = 0; x < W; x += 16) for (let y = rnd() * 200; y < H; y += 140 + rnd() * 220) { g.fillStyle = "rgba(45,22,6,0.55)"; g.fillRect(x, y, 15, 1.6); g.fillStyle = `rgba(255,200,140,${0.05 + rnd() * 0.08})`; g.fillRect(x, y + 1.6, 15, 60 + rnd() * 80); }   // the plank end joints and a little tone change from board to board
  // paint: the baseline end (top of the image = -z) with a blue key, proper lane hash marks and blocks, the restricted-area arc, the full free-throw circle and the three-point line
  const base = 24, hx = 512, hy = 134, m = 73;
  g.fillStyle = "#1d428a"; g.fillRect(hx - 1.95 * m, base, 3.9 * m, 4.64 * m);
  g.strokeStyle = "#ffffff"; g.lineWidth = 9; g.lineJoin = "miter"; g.strokeRect(24, 24, 976, 1150); g.strokeRect(hx - 1.95 * m, base, 3.9 * m, 4.64 * m);
  g.beginPath(); g.arc(hx, base + 4.64 * m, 1.44 * m, Math.PI, 2 * Math.PI, false); g.stroke();                                    // the free-throw circle: the half inside the lane is solid ...
  g.setLineDash([22, 18]); g.beginPath(); g.arc(hx, base + 4.64 * m, 1.44 * m, 0, Math.PI, false); g.stroke(); g.setLineDash([]);   // ... the half outside is dashed
  g.beginPath(); g.arc(hx, hy, 1.0 * m, 0, Math.PI, false); g.stroke(); g.beginPath(); g.moveTo(hx - 1.0 * m, base + 4); g.lineTo(hx - 1.0 * m, hy); g.moveTo(hx + 1.0 * m, base + 4); g.lineTo(hx + 1.0 * m, hy); g.stroke();   // the restricted-area arc under the hoop
  g.beginPath(); g.moveTo(hx - 5.36 * m, base); g.lineTo(hx - 5.36 * m, hy + 161); g.arc(hx, hy, 5.8 * m, Math.PI - 0.391, 0.391, true); g.lineTo(hx + 5.36 * m, base); g.stroke();   // the three-point line
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const y = base + 1.45 * m + i * 0.8 * m; g.fillStyle = "#ffffff"; g.fillRect(hx + s * 1.95 * m - (s > 0 ? 0 : 0.22 * m), y, 0.22 * m, 5); g.fillRect(hx + s * 1.95 * m - (s > 0 ? 0.22 * m : 0), y, 0.22 * m, 5); }   // lane hash marks, across both lane lines
  for (const s of [-1, 1]) { g.fillStyle = "#ef3b24"; g.fillRect(hx + s * 1.95 * m - (s > 0 ? 0.14 * m : -0.0), base + 1.15 * m, 0.14 * m, 0.38 * m); g.fillStyle = "#ffffff"; g.fillRect(hx + s * 1.95 * m - (s > 0 ? 0.14 * m : 0.0), base + 2.35 * m, 0.14 * m, 0.38 * m); }   // the lane blocks
  g.beginPath(); g.arc(512, 1010, 190, 0, Math.PI * 2); g.fillStyle = "#1d428a"; g.fill(); g.lineWidth = 12; g.strokeStyle = "#ef3b24"; g.stroke();
  g.fillStyle = "#ffffff"; g.font = "900 78px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("THUNDER", 512, 1000);
  g.fillStyle = "#ef3b24"; g.beginPath(); g.moveTo(560, 905); g.lineTo(486, 1010); g.lineTo(532, 1010); g.lineTo(468, 1112); g.lineTo(576, 986); g.lineTo(528, 986); g.closePath(); g.fill();
});
const bannerTexture = () => ctex("e4banner", 256, 512, (g) => {
  g.fillStyle = "#1d428a"; g.fillRect(0, 0, 256, 512); g.fillStyle = "#ef3b24"; g.fillRect(0, 0, 256, 26); g.fillRect(0, 486, 256, 26);
  g.fillStyle = "#ffffff"; g.font = "900 64px Arial Black, Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("OKC", 128, 150);
  g.fillStyle = "#ef3b24"; g.beginPath(); g.moveTo(150, 230); g.lineTo(88, 330); g.lineTo(128, 330); g.lineTo(84, 440); g.lineTo(176, 312); g.lineTo(138, 312); g.closePath(); g.fill();
});
const concreteTexture = () => ctex("e4concrete", 256, 256, (g) => {
  let s = 9; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.fillStyle = "#6c7077"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 4000; i++) { const v = 80 + rnd() * 50; g.fillStyle = `rgba(${v},${v + 3},${v + 8},0.4)`; g.fillRect(rnd() * 256, rnd() * 256, 2, 2); }
  g.strokeStyle = "rgba(30,32,38,0.55)"; g.lineWidth = 2; for (let k = 0; k < 4; k++) { g.strokeRect(-2, k * 64 - 2, 260, 66); } g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.stroke();
});

const bannerTex = (k: number) => ctex("e4banner" + k, 256, 512, (g) => {
  const cols: [string, string][] = [["#1d428a", "#ef3b24"], ["#ef3b24", "#1d428a"], ["#f4f1ea", "#1d428a"]];
  g.fillStyle = cols[k][0]; g.fillRect(0, 0, 256, 512); g.fillStyle = cols[k][1]; g.fillRect(0, 0, 256, 30); g.fillRect(0, 482, 256, 30);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = k === 2 ? "#1d428a" : "#ffffff"; g.font = "900 70px Impact, Arial Black, sans-serif";
  g.font = (k === 1 ? "900 44px" : "900 70px") + " Impact, Arial Black, sans-serif"; g.fillText(["OKC", "THUNDER", "WEST"][k], 128, 140); g.font = "900 96px Impact, Arial Black, sans-serif"; g.fillText(["2012", "NBA", "CHAMP"][k], 128, 290);
  g.fillStyle = cols[k][1]; g.beginPath(); g.moveTo(146, 360); g.lineTo(96, 430); g.lineTo(130, 430); g.lineTo(100, 480); g.lineTo(168, 410); g.lineTo(134, 410); g.closePath(); g.fill();
});
/** camera flashes in the stands: white points that blink for a few frames at random seats (a pure function of time) */
const makeFlashes = (spots: { x: number; y: number; z: number }[]) => {
  const N = 90, g = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), col = new Float32Array(N * 3); let s = 77; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const ph: number[] = [], rate: number[] = [];
  for (let i = 0; i < N; i++) { const sp = spots[Math.floor(rnd() * spots.length)]; pos.set([sp.x, sp.y + 0.9, sp.z], i * 3); ph.push(rnd()); rate.push(0.18 + rnd() * 0.3); }
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true, fog: false }));
  pts.frustumCulled = false;
  const update = (t: number) => { for (let i = 0; i < N; i++) { const u = (t * rate[i] + ph[i]) % 1, v = u < 0.012 ? 1 - u / 0.012 : 0; col.set([v * 3, v * 3, v * 3], i * 3); } g.attributes.color.needsUpdate = true; };
  return { pts, update };
};
/** the crowd: instanced bodies (boxes) and heads (spheres) on the bleacher tiers, bobbing a little (a pure function of time) */
const makeCrowd = (spots: { x: number; y: number; z: number; ry: number }[]) => {
  const n = spots.length, body = new THREE.InstancedMesh(box(0.42, 0.55, 0.3), new THREE.MeshStandardMaterial({ roughness: 0.9 }), n), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 8, 6), new THREE.MeshStandardMaterial({ roughness: 0.8 }), n);
  let s = 21; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const shirts = ["#1d428a", "#ffffff", "#ef3b24", "#1d428a", "#f2c14e", "#2a2f3e"], skins = ["#f0c8a0", "#c99067", "#8a5a3c", "#5a3a28", "#e8b98a"];
  const ph: number[] = [], m = new THREE.Matrix4(), c = new THREE.Color();
  for (let i = 0; i < n; i++) { ph.push(rnd() * 6.28); body.setColorAt(i, c.set(shirts[Math.floor(rnd() * shirts.length)])); head.setColorAt(i, c.set(skins[Math.floor(rnd() * skins.length)])); }
  body.castShadow = false; head.castShadow = false; body.frustumCulled = false; head.frustumCulled = false;
  const update = (t: number) => {
    for (let i = 0; i < n; i++) {
      const sp = spots[i], bob = Math.max(0, Math.sin(t * 3.1 + ph[i])) * 0.05, rot = new THREE.Euler(0, sp.ry, 0);
      m.compose(new THREE.Vector3(sp.x, sp.y + 0.28 + bob, sp.z), new THREE.Quaternion().setFromEuler(rot), new THREE.Vector3(1, 1, 1)); body.setMatrixAt(i, m);
      m.compose(new THREE.Vector3(sp.x, sp.y + 0.7 + bob, sp.z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)); head.setMatrixAt(i, m);
    }
    body.instanceMatrix.needsUpdate = true; head.instanceMatrix.needsUpdate = true;
  };
  return { body, head, update };
};

export const buildE4Arena = (): BuiltSet => {
  const root = new THREE.Group();
  const ft = floorTexture(); ft.anisotropy = 8;
  const wood = new THREE.MeshPhysicalMaterial({ map: ft, roughness: 0.15, metalness: 0.02, clearcoat: 0.8, clearcoatRoughness: 0.07, reflectivity: 0.65 });   // varnished hardwood: the overhead spots glint off it
  // ---- the court floor (x -7..7 = 14 m, z -10..6.5 = 16.5 m; the image's top is the hoop end) and the concrete concourse round it
  add(root, new THREE.PlaneGeometry(14, 16.5).rotateX(-Math.PI / 2), wood, 0, 0.002, -1.75, { cast: false });
  add(root, new THREE.PlaneGeometry(40, 40).rotateX(-Math.PI / 2), std("#1a1d26", { roughness: 0.6 }), 0, -0.004, -2, { cast: false });
  // ---- the hoop and its stanchion (engine4/hoop.ts: plexiglass board, breakaway rim, diamond-mesh net)
  const steel = std("#2b303a", { roughness: 0.4, metalness: 0.6 });
  add(root, box(0.5, 4.2, 0.5), std("#1d428a", { roughness: 0.5 }), 0, 2.1, -9.7); add(root, box(0.16, 0.16, 1.6), steel, 0, 3.3, -9.0);
  root.add(buildHoop(HOOP));
  // ---- LED ad boards along both sidelines and the baseline (emissive; they bloom)
  const ledMats: THREE.MeshStandardMaterial[] = [];
  const led = (x: number, z: number, w: number, d: number, hue: string) => { const m = new THREE.MeshStandardMaterial({ color: "#10141c", emissive: hue, emissiveIntensity: 1.1 }); ledMats.push(m); add(root, box(w, 0.7, d), m, x, 0.36, z, { cast: false }); };
  led(-7.4, -2, 0.18, 14, "#1d6bff"); led(7.4, -2, 0.18, 14, "#1d6bff"); led(0, -10.3, 14.6, 0.18, "#ef3b24"); led(0, 6.9, 14.6, 0.18, "#ef3b24");
  // ---- bleachers on the left, right and behind the hoop, with the crowd on them; and the back wall and the roof
  const seat = std("#2a3552", { roughness: 0.7 }); const spots: { x: number; y: number; z: number; ry: number }[] = [];
  const stand = (x0: number, z0: number, along: "x" | "z", len: number, dirx: number, dirz: number, tiers: number) => {
    for (let t = 0; t < tiers; t++) {
      const px = x0 + dirx * (t * 0.95), pz = z0 + dirz * (t * 0.95), y = 0.5 * (t + 1);
      add(root, along === "x" ? box(len, y, 0.95) : box(0.95, y, len), seat, px, y / 2, pz);
      const n = Math.floor(len / 0.62);
      for (let i = 0; i < n; i++) { const u = -len / 2 + 0.31 + i * 0.62; if (((i * 7 + t * 3) % 9) === 0) continue; const sx = px + (along === "x" ? u : 0), sz = pz + (along === "z" ? u : 0); if (dirx === 1 && sx > 9.5 && sx < 12.6 && sz > -2.4 && sz < 1.2) continue; /* an open aisle on the right stand: the seats where Leo and his dad sit, and the rows in front of them */ spots.push({ x: px + (along === "x" ? u : 0), y, z: pz + (along === "z" ? u : 0), ry: Math.atan2(-dirx, -dirz) }); }
    }
  };
  // the left stand stops short of the tunnel mouth (z -3.2..3.2)
  stand(-8.4, -7.0, "z", 7, -1, 0, 13); stand(-8.4, 5.0, "z", 3, -1, 0, 13); stand(8.4, -2.0, "z", 17, 1, 0, 13);
  stand(0, -11.6, "x", 17, 0, -1, 13);   // behind the hoop
  const wallM = std("#0a0d16", { roughness: 0.95 });
  add(root, box(90, 14, 0.4), wallM, 0, 7, -26); add(root, box(0.4, 14, 90), wallM, -26, 7, -2); add(root, box(0.4, 14, 90), wallM, 22, 7, -2);   // dark upper walls behind the top tier
  add(root, box(90, 0.4, 90), std("#080a10", { roughness: 0.95 }), -2, 12, -2, { cast: false });
  for (let i = 0; i < 6; i++) { const x = -6 + i * 2.4; add(root, box(0.22, 0.22, 16), steel, x, 8.6, -2, { cast: false }); }
  // banners hanging above the top tier (championships, retired numbers): three canvas designs on both ends and the sides
  const bannerMats = [0, 1, 2].map((k) => new THREE.MeshStandardMaterial({ map: bannerTex(k), roughness: 0.8, emissive: "#ffffff", emissiveMap: bannerTex(k), emissiveIntensity: 0.25, side: THREE.DoubleSide }));
  for (let i = 0; i < 9; i++) { const x = -18 + i * 4.5; add(root, new THREE.PlaneGeometry(1.7, 3.4), bannerMats[i % 3], x, 8.6, -25.7, { cast: false }); }
  for (let i = 0; i < 6; i++) { const z = -14 + i * 4.5; add(root, new THREE.PlaneGeometry(1.7, 3.4), bannerMats[(i + 1) % 3], 21.7, 8.6, z, { cast: false, ry: -Math.PI / 2 }); add(root, new THREE.PlaneGeometry(1.7, 3.4), bannerMats[(i + 2) % 3], -25.7, 8.6, z, { cast: false, ry: Math.PI / 2 }); }
  // an LED ribbon along the front of the stands
  const ribbon = new THREE.MeshStandardMaterial({ color: "#10141c", emissive: "#2a6bff", emissiveIntensity: 1.4 }); ledMats.push(ribbon);
  add(root, box(17, 0.16, 0.1), ribbon, 0, 1.1, -11.1, { cast: false }); add(root, box(0.1, 0.16, 17), ribbon, 8.0, 1.1, -2, { cast: false });
  const lamps: THREE.MeshStandardMaterial[] = [];
  for (const [x, z] of [[-4, -6], [4, -6], [-4, 0], [4, 0], [0, 4], [0, -3]] as [number, number][]) { const m = new THREE.MeshStandardMaterial({ color: "#fff7e0", emissive: "#fff2cc", emissiveIntensity: 3 }); lamps.push(m); add(root, box(1.1, 0.12, 0.6), m, x, 8.4, z, { cast: false }); }
  // light shafts under the roof lamps: faint additive cones (light atmosphere)
  const shaft = new THREE.MeshBasicMaterial({ color: "#fff0cc", transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (const [x, z] of [[-4, -6], [4, -6], [-4, 0], [4, 0], [0, 4], [0, -3]] as [number, number][]) { const c = new THREE.Mesh(new THREE.ConeGeometry(2.1, 6.0, 20, 1, true), shaft); c.position.set(x, 5.2, z); root.add(c); }
  const crowd = makeCrowd(spots); root.add(crowd.body, crowd.head);
  const flashes = makeFlashes(spots); root.add(flashes.pts);
  // ---- the tunnel: concrete floor, walls, a low ceiling with strip lights, a banner, the bench, the dark end door, the lit mouth
  const ct = concreteTexture(); ct.wrapS = ct.wrapT = THREE.RepeatWrapping; ct.repeat.set(4, 1);
  const conc = std(ct, { roughness: 0.85 }); const concFloor = std("#4a4f58", { roughness: 0.4 });
  add(root, new THREE.PlaneGeometry(8.4, 6.4).rotateX(-Math.PI / 2), concFloor, -12.9, 0.003, 0, { cast: false });
  add(root, box(8.4, 3.4, 0.3), conc, -12.9, 1.7, -3.35); add(root, box(8.4, 3.4, 0.3), conc, -12.9, 1.7, 3.35); add(root, box(0.3, 3.4, 6.6), conc, -17.15, 1.7, 0);
  add(root, box(8.4, 0.3, 6.6), std("#2c3037", { roughness: 0.9 }), -12.9, 3.5, 0, { cast: false });
  add(root, box(0.3, 0.4, 6.6), conc, -8.6, 3.2, 0); add(root, box(0.3, 3.4, 3.2), conc, -8.6, 1.7, -4.8); add(root, box(0.3, 3.4, 3.2), conc, -8.6, 1.7, 4.8);   // the mouth: x -8.6, z -3.2..3.2
  const strips: THREE.MeshStandardMaterial[] = [];
  for (let i = 0; i < 3; i++) { const m = new THREE.MeshStandardMaterial({ color: "#e8f0ff", emissive: "#cfe0ff", emissiveIntensity: 1.6 }); strips.push(m); add(root, box(0.16, 0.06, 2.6), m, -10.4 - i * 2.8, 3.32, 0, { cast: false }); }
  const bt = bannerTexture(); add(root, new THREE.PlaneGeometry(1.1, 2.2), std(bt, { roughness: 0.8, side: THREE.DoubleSide }), -17.0, 1.9, 1.4, { ry: Math.PI / 2, cast: false });
  const wood2 = std("#8a5a3c", { roughness: 0.6 });
  add(root, box(0.5, 0.08, 2.4), wood2, BENCH[0], 0.46, BENCH[2]); add(root, box(0.06, 0.46, 0.4), steel, BENCH[0], 0.23, BENCH[2] - 1.0); add(root, box(0.06, 0.46, 0.4), steel, BENCH[0], 0.23, BENCH[2] + 1.0);
  add(root, box(0.08, 0.5, 2.4), wood2, BENCH[0] - 0.28, 0.75, BENCH[2]);
  add(root, box(0.1, 2.2, 1.6), std("#12151c", { roughness: 0.5 }), -16.95, 1.1, -1.4, { cast: false });
  add(root, new THREE.CylinderGeometry(0.2, 0.17, 0.5, 12), std("#2f6a4f"), -9.5, 0.25, 2.6);   // a water cooler stand-in
  const mouth = new THREE.MeshStandardMaterial({ color: "#fff7e0", emissive: "#fff2cc", emissiveIntensity: 2.4, side: THREE.DoubleSide }); add(root, new THREE.PlaneGeometry(0.01, 0.01), mouth, -9, 1, 0, { cast: false });
  // ---- lights: a warm spot on the hoop end and a cool one on the tunnel bench (shadows on the hero spot only); the env.sun is the overhead key
  const keySpot = new THREE.SpotLight(0xfff0d8, 0, 0, 0.9, 0.6, 1.4); keySpot.position.set(1.5, 8.2, 0); keySpot.target.position.set(0, 0, -3); keySpot.castShadow = true; keySpot.shadow.mapSize.set(2048, 2048); keySpot.shadow.camera.near = 2; keySpot.shadow.camera.far = 14; keySpot.shadow.bias = -0.0004; keySpot.shadow.radius = 4;
  const benchSpot = new THREE.SpotLight(0xcfe0ff, 0, 0, 0.8, 0.7, 1.4); benchSpot.position.set(-12.2, 3.2, 0.4); benchSpot.target.position.set(-13, 0.6, -2.3); root.add(keySpot, keySpot.target, benchSpot, benchSpot.target);
  const mouthLight = new THREE.PointLight(0xfff0d0, 0, 9, 2); mouthLight.position.set(-8.2, 1.9, 0); root.add(mouthLight);
  // the arena's house lights on the stands: three soft directional lights (no shadows) from the court toward the back and the two sides, so the crowd and the banners read
  const stands: THREE.DirectionalLight[] = [];
  for (const [px, pz, tx, tz] of [[0, 2, 0, -18], [-2, -2, 18, -2], [2, -2, -12, -2]] as [number, number, number, number][]) { const d = new THREE.DirectionalLight(0xdfe6ff, 0); d.position.set(px, 7, pz); d.target.position.set(tx, 3.5, tz); root.add(d, d.target); stands.push(d); }
  let tunnelMode = false;
  const e4: NonNullable<BuiltSet["e4"]> = {
    apply: ({ env, focus, t, light }) => {
      const tunnel = light === "interiorCool"; tunnelMode = tunnel;
      const s = env.sun;
      s.color.set(tunnel ? "#8aa4d8" : "#fff0dc"); s.intensity = tunnel ? 0.7 : 2.6; s.position.copy(focus).add(new THREE.Vector3(2, 40, 8)); s.target.position.copy(focus);
      const sc = s.shadow.camera; sc.left = -9; sc.right = 9; sc.top = 9; sc.bottom = -9; sc.near = 15; sc.far = 80; sc.updateProjectionMatrix();
      s.shadow.bias = -0.0004; s.shadow.normalBias = 0.03; s.shadow.radius = 3; s.shadow.mapSize.set(4096, 4096);
      env.hemi.color.set(tunnel ? "#35446a" : "#4a5578"); env.hemi.groundColor.set("#1a1410"); env.hemi.intensity = tunnel ? 0.42 : 1.0;
      env.fog.color.set(tunnel ? "#10141f" : "#181c2c"); env.fog.near = 8; env.fog.far = tunnel ? 26 : 44;
      keySpot.intensity = tunnel ? 0 : 160; for (const d of stands) d.intensity = tunnel ? 0.25 : 1.9;   // (castShadow is never toggled: that would recompile every material on a shot change)
      benchSpot.intensity = tunnel ? 38 : 0; mouthLight.intensity = tunnel ? 14 : 0;
      for (const m of lamps) m.emissiveIntensity = tunnel ? 1.2 : 3; for (const m of strips) m.emissiveIntensity = (tunnel ? 2.4 : 1.4) * (1 + 0.025 * Math.sin(t * 11));
      ledMats.forEach((m, i) => { m.emissiveIntensity = 1.0 + 0.35 * Math.sin(t * 2.2 + i * 1.7); });
      void mouth; crowd.update(t); flashes.update(t);
    },
    tint: (x, y, z) => { void y; void z; if (tunnelMode || x < -8.6) return [0.82 + Math.max(0, (x + 14) * 0.03), 0.9, 1.08]; return [1.0, 0.97, 0.94]; },
  };
  return { root, env: { clouds: false, sky: false }, spots: SPOTS, views: VIEWS, e4 };
};

export const SPOTS: Record<string, [number, number, number]> = {
  hoop: [0, 0, -7.0], key: [0, 0, -5.0], elbow: [0, 0, -3.4], center: [0, 0, 2.0], bench: [-13, 0, -1.4], tunnel: [-11.4, 0, 0.5],
};
export const VIEWS = [
  { name: "court", pos: [5.5, 2.2, 5.5] as [number, number, number], look: [0, 1.4, -3] as [number, number, number], fov: 56 },
  { name: "tunnel", pos: [-9.6, 1.5, 2.6] as [number, number, number], look: [-14, 1.0, -1.6] as [number, number, number], fov: 46 },
];
