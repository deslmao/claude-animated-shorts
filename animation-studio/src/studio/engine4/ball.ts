// Engine 4: the game basketball. A properly scaled 3D ball (0.12 m radius x the prop's scale) in orange leather with black seams, positioned every frame from the ball plan
// (engine4/motion.ts: held in a hand, dribbled, in flight, dropping through the net); it spins with its flight. The variant is the rim centre "x,y,z": when a swish lands there
// a white net overlay scales up and rings (a ripple), driven by the plan, so it is a pure function of the shot time.
import * as THREE from "three";
import { mkTex } from "./tex";
import type { PropRig } from "../props/registry";
import type { At } from "../props/kit";

const texture = () => mkTex("gameball", 1024, 512, (g) => {
  let s = 29; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.fillStyle = "#d4691e"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 7000; i++) { const v = rnd(); g.fillStyle = v > 0.5 ? `rgba(255,180,100,${rnd() * 0.1})` : `rgba(70,25,0,${rnd() * 0.14})`; g.fillRect(rnd() * 1024, rnd() * 512, 2 + rnd() * 3, 2 + rnd() * 3); }
  g.strokeStyle = "#140a05"; g.lineWidth = 10; g.lineCap = "round";
  for (const x of [0, 256, 512, 768, 1024]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  g.beginPath(); g.moveTo(0, 256); g.lineTo(1024, 256); g.stroke();
  for (const x of [128, 384, 640, 896]) { g.beginPath(); g.moveTo(x - 92, 0); g.quadraticCurveTo(x, 256, x - 92, 512); g.stroke(); g.beginPath(); g.moveTo(x + 92, 0); g.quadraticCurveTo(x, 256, x + 92, 512); g.stroke(); }
});
export const gameBallRig = (a: At, variant?: string): PropRig => {
  const root = new THREE.Group(), rim = (variant ?? "0,2.45,-4.15").split(",").map(Number) as [number, number, number];
  const sc = a.s ?? 1, tex = texture(); tex.anisotropy = 8;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.12 * sc, 28, 20), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, bumpMap: tex, bumpScale: 0.5, emissiveMap: tex, emissive: "#ffffff", emissiveIntensity: 0.18 }));
  ball.castShadow = true; ball.receiveShadow = true; root.add(ball);
  const ripple = new THREE.Mesh(new THREE.CylinderGeometry(0.235, 0.125, 0.44, 20, 3, true), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide, wireframe: true }));
  ripple.position.set(rim[0], rim[1] - 0.23, rim[2]); ripple.visible = false;
  const holder = new THREE.Group(); holder.add(root, ripple);
  return { root: holder, update: (st) => {
    const t = st.track; holder.visible = (st.step ?? 0) > 0;
    if (!t) return;
    ball.position.set(...t.pos); ball.rotation.set(t.dist * 0.7, t.dist, t.dist * 0.3);
    const p = t.speed;   // the net ripple (0..1) travels in `speed`
    ripple.visible = p > 0.02; ripple.scale.set(1 + 0.3 * p, 1 + 0.06 * p, 1 + 0.3 * p); (ripple.material as THREE.MeshBasicMaterial).opacity = 0.15 + 0.5 * p;
  } };
};

/** Engine 4: a gold coin for a coin toss (a thick disc with a rim and a face), positioned and spun every frame from the same plan as the ball (`ball`); it flips end over end */
export const coinRig = (a: At): PropRig => {
  const root = new THREE.Group(), sc = a.s ?? 1;
  const face = mkTex("coinface", 256, 256, (g) => { g.fillStyle = "#e8b923"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#8a6508"; g.lineWidth = 12; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.stroke(); g.fillStyle = "#8a6508"; g.font = "bold 120px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("$", 128, 136); });
  const edge = new THREE.MeshStandardMaterial({ color: "#c99a14", metalness: 0.8, roughness: 0.3, emissive: "#6a4a00", emissiveIntensity: 0.5 });
  const side = new THREE.MeshStandardMaterial({ map: face, metalness: 0.6, roughness: 0.3, emissive: "#ffcf40", emissiveMap: face, emissiveIntensity: 0.45 });
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * sc, 0.1 * sc, 0.016 * sc, 36), [edge, side, side]);
  coin.castShadow = true; root.add(coin);
  return { root, update: (st) => { const t = st.track; root.visible = (st.step ?? 0) > 0; if (!t) return; coin.position.set(...t.pos); coin.rotation.set(t.dist, 0, 0.25); } };
};

/** Engine 4: a small hardcover book for the "catching Dex's thrown books" beat: it tumbles through the air on a ball plan (`ball`) */
export const bookRig = (a: At): PropRig => {
  const root = new THREE.Group(), sc = a.s ?? 1;
  const cover = new THREE.MeshStandardMaterial({ color: "#2a5fb8", roughness: 0.6 }), pages = new THREE.MeshStandardMaterial({ color: "#f3ecd8", roughness: 0.9 });
  const book = new THREE.Mesh(new THREE.BoxGeometry(0.2 * sc, 0.045 * sc, 0.27 * sc), [cover, cover, cover, cover, pages, pages]); book.castShadow = true; root.add(book);
  return { root, update: (st) => { const t = st.track; root.visible = (st.step ?? 0) > 0; if (!t) return; book.position.set(...t.pos); book.rotation.set(t.dist * 0.6, t.dist * 0.3, t.dist * 0.5); } };
};
