// Engine 4, Episode 3 (Solo Leveling World): the RPG UI, drawn as crisp 2D canvas textures on camera-facing planes, and one real prop.
//   lvlBadge      a floating power-level badge. Variant "LABEL:v1>v2>v3" (the label defaults to LVL): the value changes on each step (a number roll with a snappy bump), "-" hides it,
//                 "???" is the unreadable stranger. Colour is by tier (grey 1, green, cyan, red 40-59, purple, orange, gold 99). `hover` floats it over an actor's crown; without it it stands at `at`.
//   systemWindow  the glowing blue System Window. Variant "TITLE|line|line|...": step 1 pops the frame in with the title, each later step types the next line (a line starting with ! is red, with $ gold).
//   pullupBar     a steel pull-up bar on two posts.
// Everything is a pure function of the shot time. The UI sits upper-frame with clean margins and never covers a face (the authored `lift` / position keeps it above the head).
import * as THREE from "three";
import { easeSnap } from "./ease";
import { mkTex } from "./tex";
import type { PropRig } from "../props/registry";
import type { At } from "../props/kit";

const canvasOf = (w: number, h: number) => { if (typeof document === "undefined") return undefined; const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const faceCam = (root: THREE.Object3D, cam: THREE.Vector3) => { root.rotation.y = Math.atan2(cam.x - root.position.x, cam.z - root.position.z); };

/** the tier colour of a value */
export const tierOf = (v: string): { main: string; glow: string } => {
  const n = Number(v.replace(/[^0-9]/g, ""));
  if (v.includes("?")) return { main: "#ff4fd0", glow: "#ff2fa8" };
  if (v.includes("/")) return { main: "#6fe3ff", glow: "#2fb4ff" };
  if (n >= 99) return { main: "#ffd23a", glow: "#ffb400" };
  if (n >= 85) return { main: "#ffa43a", glow: "#ff7a00" };
  if (n >= 60) return { main: "#c28bff", glow: "#9a4dff" };
  if (n >= 40) return { main: "#ff6a4a", glow: "#ff3a1a" };
  if (n >= 15) return { main: "#5fd0ff", glow: "#1fa5ff" };
  if (n >= 2) return { main: "#5be37d", glow: "#22c55e" };
  return { main: "#aebfd2", glow: "#7f93a8" };
};
const badgeCache = new Map<string, THREE.Texture>();
const badgeTex = (label: string, v: string): THREE.Texture => {
  const key = label + "|" + v, hit = badgeCache.get(key); if (hit) return hit;
  const t = mkTex("lvl" + key, 512, 256, (g) => {
    const { main, glow } = tierOf(v), gold = v === "99";
    g.clearRect(0, 0, 512, 256);
    g.shadowColor = glow; g.shadowBlur = gold ? 38 : 24;
    g.fillStyle = "rgba(6,12,30,0.92)"; g.beginPath(); g.roundRect(26, 30, 460, 196, 34); g.fill();
    g.lineWidth = gold ? 12 : 9; g.strokeStyle = main; g.stroke();
    g.shadowBlur = 0; g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 2; g.beginPath(); g.roundRect(40, 44, 432, 168, 24); g.stroke();
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = main;
    g.font = "900 46px Arial Black, Arial, sans-serif"; g.fillText(label, 256, 78);
    g.shadowColor = glow; g.shadowBlur = 18; g.fillStyle = "#ffffff";
    const size = v.length > 5 ? 82 : v.length > 3 ? 104 : 128; g.font = `900 ${size}px Impact, Arial Black, sans-serif`; g.fillText(v, 256, 158);
    g.shadowBlur = 0; g.fillStyle = main; g.globalAlpha = 0.9; g.fillText(v, 256, 158); g.globalAlpha = 1;
  });
  badgeCache.set(key, t); return t;
};
export const lvlBadgeRig = (a: At, variant?: string): PropRig => {
  const raw = variant ?? "1", c = raw.indexOf(":"), label = c > 0 ? raw.slice(0, c) : "LVL", vals = (c > 0 ? raw.slice(c + 1) : raw).split(">");
  const root = new THREE.Group(), pivot = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.scale.setScalar(a.s ?? 1); root.add(pivot); root.visible = false;
  const mat = new THREE.MeshBasicMaterial({ map: badgeTex(label, vals[0]), transparent: true, depthWrite: false, toneMapped: false });
  mat.color.setScalar(1.35);
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), mat); plane.renderOrder = 8; pivot.add(plane);
  let shown = vals[0];
  return { root, update: (st) => {
    const s = st.step ?? 0, t = st.track?.t ?? 0, k = easeSnap(Math.min(1, s));
    // the value: step n shows vals[n-1]; the bump rides each change (the glide of the step: 0 -> 1 -> pulse)
    const idx = Math.max(0, Math.min(vals.length - 1, Math.ceil(s - 0.002) - 1)), v = vals[idx], frac = s - Math.floor(s), bump = s > 1 && frac > 0 && frac < 1 ? Math.sin(Math.PI * frac) * 0.28 : 0;
    if (v !== shown) { shown = v; mat.map = badgeTex(label, v); mat.needsUpdate = true; }
    root.visible = s > 0 && v !== "-";
    if (st.target) { root.position.set(st.target[0], st.target[1] + (st.hover?.lift ?? 0.32), st.target[2]); }
    faceCam(root, st.camPos);
    const sc = Math.max(0.001, k) * (1 + bump); pivot.scale.setScalar(sc); pivot.position.y = 0.018 * Math.sin(t * 2.3); pivot.rotation.z = 0.03 * Math.sin(t * 1.7);
  } };
};

/** the System Window: a blue glowing panel; one canvas redrawn only when the typed text changes */
export const systemWindowRig = (a: At, variant?: string): PropRig => {
  const parts = (variant ?? "SYSTEM|…").split("|"), title = parts[0], lines = parts.slice(1);
  const root = new THREE.Group(), pivot = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.scale.setScalar(a.s ?? 1); root.add(pivot); root.visible = false;
  const W = 768, H = 120 + Math.max(1, lines.length) * 92 + 40, cv = canvasOf(W, H), tex = cv ? new THREE.CanvasTexture(cv) : new THREE.Texture();
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }); mat.color.setScalar(1.25);
  const w = 1.5, plane = new THREE.Mesh(new THREE.PlaneGeometry(w, (w * H) / W), mat); plane.renderOrder = 9; pivot.add(plane);
  let last = "";
  const draw = (shownChars: number[]) => {
    if (!cv) return; const g = cv.getContext("2d")!; g.clearRect(0, 0, W, H);
    g.shadowColor = "#2f9bff"; g.shadowBlur = 30; g.fillStyle = "rgba(5,16,46,0.93)"; g.beginPath(); g.roundRect(22, 22, W - 44, H - 44, 26); g.fill(); g.lineWidth = 8; g.strokeStyle = "#4fb4ff"; g.stroke();
    g.shadowBlur = 0; g.strokeStyle = "rgba(160,215,255,0.45)"; g.lineWidth = 2; g.beginPath(); g.roundRect(38, 38, W - 76, H - 76, 18); g.stroke();
    g.fillStyle = "#4fb4ff"; g.fillRect(52, 110, W - 104, 3);
    g.fillStyle = "#e8f6ff"; g.textBaseline = "middle"; g.textAlign = "center"; g.font = "900 48px Arial Black, Arial, sans-serif"; g.fillText(title, W / 2, 76);
    g.textAlign = "left"; g.font = "800 35px Arial, sans-serif";
    lines.forEach((ln, i) => { const col = ln.startsWith("!") ? "#ff6a5a" : ln.startsWith("$") ? "#ffd23a" : "#d6ecff"; const txt = ln.replace(/^[!$]/, "").slice(0, shownChars[i] ?? 0); g.fillStyle = col; g.fillText(txt, 58, 160 + i * 92 + 8); });
    tex.needsUpdate = true;
  };
  return { root, update: (st) => {
    const s = st.step ?? 0, t = st.track?.t ?? 0, k = easeSnap(Math.min(1, s)); root.visible = s > 0;
    // step 1 pops the frame; step n+1 types line n (a glide 0 -> 1 reveals its characters)
    const shown = lines.map((ln, i) => { const f = Math.max(0, Math.min(1, s - 1 - i)); return Math.round(f * ln.replace(/^[!$]/, "").length); });
    const key = shown.join(",") + (s > 0 ? "1" : "0"); if (key !== last) { last = key; draw(shown); }
    faceCam(root, st.camPos); const sc = Math.max(0.001, k); pivot.scale.set(sc, sc * (1 + 0.12 * (1 - Math.min(1, s))), 1); pivot.position.y = 0.012 * Math.sin(t * 2.0);
  } };
};

export const pullupBarRig = (a: At): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.scale.setScalar(a.s ?? 1); root.rotation.y = a.yaw ?? 0;
  const steel = new THREE.MeshStandardMaterial({ color: "#6d7686", roughness: 0.35, metalness: 0.85 }), grip = new THREE.MeshStandardMaterial({ color: "#1c1f26", roughness: 0.9 });
  for (const sx of [-0.95, 0.95]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 2.5, 16), steel); p.position.set(sx, 1.25, 0); p.castShadow = true; root.add(p); const f = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.05, 20), steel); f.position.set(sx, 0.025, 0); root.add(f); }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 16).rotateZ(Math.PI / 2), steel); bar.position.set(0, 2.42, 0); bar.castShadow = true; root.add(bar);
  for (const sx of [-0.35, 0.35]) { const g2 = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.3, 14).rotateZ(Math.PI / 2), grip); g2.position.set(sx, 2.42, 0); root.add(g2); }
  return { root, update: () => undefined };
};

/** the gold shockwave ring on the floor: on its step it expands from `at` (easeOutQuad) and fades; a pure function of the step glide */
export const shockRingRig = (a: At): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, (a.y ?? 0) + 0.03, a.z); root.visible = false;
  const mat = new THREE.MeshBasicMaterial({ color: "#ffd23a", transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.86, 1.0, 64).rotateX(-Math.PI / 2), mat); root.add(ring);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#ffb400", transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending })); root.add(glow);
  return { root, update: (st) => {
    const s = Math.max(0, Math.min(1, st.step ?? 0)); root.visible = s > 0 && s < 1;
    const e = 1 - (1 - s) * (1 - s), r = (0.3 + 7.5 * e) * (a.s ?? 1); ring.scale.set(r, 1, r); glow.scale.set(r * 0.9, 1, r * 0.9);
    mat.opacity = 0.9 * (1 - s) * (1 - s); (glow.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - s) * (1 - s);
  } };
};
