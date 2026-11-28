// Engine 4, Episode 2: a pro hoop for both sets. A transparent plexiglass backboard (glossy, a faint reflection, a dark steel frame), a crisp white outer border and the white
// shooter's square above the rim, dark protective padding along the bottom edge; a metallic orange breakaway rim with its flange and mounting bracket; a tapered white
// diamond-mesh net (an alpha-tested texture on an open cone, not a blocky cylinder).
import * as THREE from "three";
import { mkTex } from "./tex";

const netTexture = () => mkTex("e4net", 128, 128, (g) => {
  g.clearRect(0, 0, 128, 128); g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.lineCap = "round";
  for (let i = -1; i < 3; i++) { g.beginPath(); g.moveTo(0, i * 64); g.lineTo(128, i * 64 + 128); g.stroke(); g.beginPath(); g.moveTo(0, i * 64 + 128); g.lineTo(128, i * 64); g.stroke(); }
});

/** the rim centre (x, y, z) of a hoop whose board stands 0.38 m behind it (toward -z); returns the group (add it to the set) */
export const buildHoop = (rim: [number, number, number]): THREE.Group => {
  const g = new THREE.Group(), [rx, ry, rz] = rim;
  const mesh = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, cast = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; g.add(m); return m; };
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const W = 1.83, H = 1.07, by = ry + 0.40, bz = rz - 0.38, t = 0.045;
  // the plexiglass: nearly clear, glossy, with a clear coat that picks up the room's lights
  const glass = new THREE.MeshPhysicalMaterial({ color: "#d9e8f5", transparent: true, opacity: 0.2, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, reflectivity: 0.7, side: THREE.DoubleSide, depthWrite: false });
  mesh(box(W, H, 0.03), glass, rx, by, bz, false);
  const frame = new THREE.MeshStandardMaterial({ color: "#20252d", roughness: 0.4, metalness: 0.7 }), white = new THREE.MeshStandardMaterial({ color: "#f5f5f0", roughness: 0.45 });
  for (const s of [-1, 1]) { mesh(box(t, H + t, 0.07), frame, rx + s * (W / 2 + t / 2), by, bz); mesh(box(W + 2 * t, t, 0.07), frame, rx, by + s * (H / 2 + t / 2), bz); }   // the dark steel frame
  const zf = bz + 0.025;   // the white markings sit on the front face
  for (const s of [-1, 1]) { mesh(box(0.05, H - 0.02, 0.006), white, rx + s * (W / 2 - 0.035), by, zf, false); mesh(box(W - 0.02, 0.05, 0.006), white, rx, by + s * (H / 2 - 0.035), zf, false); }   // the outer border
  // the shooter's square: 0.59 x 0.45 m, its bottom edge level with the rim
  const sq = (w: number, h: number, x: number, y: number) => mesh(box(w, h, 0.006), white, rx + x, y, zf, false);
  sq(0.59, 0.035, 0, ry + 0.03); sq(0.59, 0.035, 0, ry + 0.45); sq(0.035, 0.45, -0.28, ry + 0.24); sq(0.035, 0.45, 0.28, ry + 0.24);
  mesh(box(W + 0.05, 0.12, 0.09), new THREE.MeshStandardMaterial({ color: "#14171d", roughness: 0.85 }), rx, by - H / 2 - 0.02, bz + 0.01);   // the padding along the bottom edge
  mesh(box(0.5, 0.5, 0.04), frame, rx, by, bz - 0.05, false);                                                                           // the mounting plate behind the board
  // the breakaway rim: a metallic orange ring, its flange on the board and the bracket arm between them
  const orange = new THREE.MeshStandardMaterial({ color: "#f0601a", roughness: 0.28, metalness: 0.85 });
  mesh(new THREE.TorusGeometry(0.23, 0.02, 10, 40).rotateX(Math.PI / 2), orange, rx, ry, rz);
  mesh(box(0.42, 0.07, 0.025), orange, rx, ry + 0.01, bz + 0.025);                       // the flange plate on the glass
  mesh(box(0.06, 0.035, 0.17), orange, rx, ry, bz + 0.12);                                // the bracket arm running out to the ring
  mesh(new THREE.BoxGeometry(0.1, 0.05, 0.03), orange, rx, ry, rz - 0.235);              // the rim's back weld
  // the net: a tapered white diamond mesh under the ring
  const nt = netTexture(); nt.wrapS = nt.wrapT = THREE.RepeatWrapping; nt.repeat.set(5, 2);
  const net = mesh(new THREE.CylinderGeometry(0.225, 0.12, 0.42, 20, 3, true), new THREE.MeshStandardMaterial({ map: nt, alphaTest: 0.35, side: THREE.DoubleSide, color: "#ffffff", roughness: 0.9 }), rx, ry - 0.22, rz);
  net.userData.net = true;
  return g;
};
