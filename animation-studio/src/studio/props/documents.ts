// Documents kit (Visual Storytelling 2.0): papers explained in the world. A parchment lying flat on a table, its
// writing drawn on a canvas texture; stepped (story PropSpec.steps): each step writes one signature, stroke by
// stroke, and the prop GUIDES the writer's hand (registry `guide`), so the pen travels along the signature it is
// writing. Pure: the texture depends only on the step progress (quantised to 1/48 of a signature, redrawn only when
// it changes) and is drawn on a CPU canvas, so every render chunk draws the same frame.
import * as THREE from "three";
import { lam } from "../materials/geo";
import { cyl, frame, col } from "./kit";
import type { Batch } from "../materials/geo";
import type { At } from "./kit";
import type { PropRig } from "./registry";

/** the parchment: PW wide (local x) by PD deep (local z, +z = its lower edge, toward the reader) */
export const PW = 0.4, PD = 0.28;
/** signature lines across the page's middle (z = 0: the depth a writer standing level with the page draws their hand
 *  at, so pen and ink line up from any camera height), in signing order: [x from, x to, z] (local metres) */
const SLOTS: [number, number, number][] = [[-0.17, -0.05, 0.01], [-0.02, 0.1, 0.01], [0.12, 0.18, 0.01]];
const Q = 48, TW = 800, TH = Math.round((TW * PD) / PW);

/** a signature's pen path, f in 0..1: along its line with a cursive loop rhythm (local [x, z]) */
const sigAt = (k: number, f: number): [number, number] => {
  const [x0, x1, z] = SLOTS[Math.min(k, SLOTS.length - 1)], ph = f * Math.PI * (5 + k);
  return [x0 + (x1 - x0) * f + 0.006 * Math.sin(ph * 2), z - 0.011 * Math.abs(Math.sin(ph)) + 0.004 * Math.cos(ph * 3)];
};
/** where the writing hand is at step progress `step` (the registry guide): on the signature being written; before
 *  the first step, poised at its start; after the last, resting at its end */
export const parchmentGuide = (step: number, variant?: string): [number, number] => {
  const n = signaturesOf(variant), k = Math.min(n - 1, Math.max(0, Math.floor(step))), f = step >= n ? 1 : Math.max(0, step - k);
  return sigAt(k, f);
};
/** number of signature steps: variant "1".."3" (default 1) */
export const signaturesOf = (variant?: string) => Math.max(1, Math.min(3, parseInt(variant ?? "1", 10) || 1));

const toPx = ([x, z]: [number, number]): [number, number] => [((x + PW / 2) / PW) * TW, ((z + PD / 2) / PD) * TH];
const rnd = (i: number) => { const s = Math.sin(i * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };

/** the page: parchment colour with a darker edge, a heading, lines of writing, the signature lines, the signatures
 *  written so far (fraction of each), and the wet nib dot where the pen is */
const paint = (g: CanvasRenderingContext2D, step: number, n: number) => {
  g.fillStyle = "#efdcae"; g.fillRect(0, 0, TW, TH);
  const grd = g.createRadialGradient(TW / 2, TH / 2, TH * 0.3, TW / 2, TH / 2, TW * 0.62); grd.addColorStop(0, "rgba(0,0,0,0)"); grd.addColorStop(1, "rgba(120,80,30,0.32)");
  g.fillStyle = grd; g.fillRect(0, 0, TW, TH);
  g.strokeStyle = "#3a2a1c"; g.lineCap = "round"; g.lineJoin = "round";
  g.lineWidth = 9; g.beginPath(); g.moveTo(TW * 0.3, TH * 0.13); g.lineTo(TW * 0.7, TH * 0.13); g.stroke();        // heading
  g.lineWidth = 4; g.strokeStyle = "#7a5c40";
  for (let r = 0; r < 4; r++) {                                                                                  // writing
    const y = TH * (0.22 + r * 0.065); let x = TW * 0.1;
    while (x < TW * (r === 3 ? 0.55 : 0.9)) { const w = 22 + rnd(r * 40 + x) * 50; g.beginPath(); g.moveTo(x, y); g.lineTo(Math.min(x + w, TW * 0.9), y + (rnd(x) - 0.5) * 3); g.stroke(); x += w + 12; }
  }
  g.lineWidth = 2.5; g.strokeStyle = "#a08060";
  for (let k = 0; k < n; k++) { const [a] = toPx(sigAt(k, 0)), [b] = toPx(sigAt(k, 1)), y = toPx([0, SLOTS[k][2]])[1] + 8; g.beginPath(); g.moveTo(a - 6, y); g.lineTo(b + 6, y); g.stroke(); }
  g.strokeStyle = "#1e1430"; g.lineWidth = 6;
  for (let k = 0; k < n; k++) {                                                                                  // signatures
    const f = Math.max(0, Math.min(1, step - k)); if (f <= 0) continue;
    g.beginPath(); const m = Math.max(2, Math.round(f * 60));
    for (let i = 0; i <= m; i++) { const [x, y] = toPx(sigAt(k, (i / 60))); if (i) g.lineTo(x, y); else g.moveTo(x, y); }
    g.stroke();
    if (f < 1) { const [x, y] = toPx(sigAt(k, f)); g.fillStyle = "#1e1430"; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill(); }
  }
  for (let r = 0; r < 2; r++) { const y = TH * (0.74 + r * 0.08); g.strokeStyle = "#8a6c50"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(TW * 0.1, y); g.lineTo(TW * (r ? 0.5 : 0.78), y); g.stroke(); } // small print
  g.fillStyle = "#b82e34"; g.beginPath(); g.arc(TW * 0.88, TH * 0.86, 22, 0, Math.PI * 2); g.fill();            // seal
};

/** a parchment lying on a table top (At.y = the table height): rolled ends, ink-written page; steps = signatures */
export const parchmentRig = (a: At, variant?: string): PropRig => {
  const n = signaturesOf(variant), root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0;
  const cv = document.createElement("canvas"); cv.width = TW; cv.height = TH;
  const g = cv.getContext("2d", { willReadFrequently: true })!, map = new THREE.CanvasTexture(cv); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const page = new THREE.Mesh(new THREE.PlaneGeometry(PW, PD).rotateX(-Math.PI / 2).translate(0, 0.003, 0), new THREE.MeshLambertMaterial({ map }));
  page.receiveShadow = true; root.add(page);
  for (const sx of [-1, 1]) { // rolled ends, so it reads as parchment from any angle
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, PD + 0.01, 14).rotateX(Math.PI / 2), lam("parchRoll", () => ({ color: "#e2c992" })));
    roll.position.set(sx * (PW / 2 + 0.008), 0.014, 0); roll.castShadow = true; root.add(roll);
  }
  let drawn = -1;
  return {
    root,
    update: ({ step = 0 }) => {
      const q = Math.round(Math.max(0, Math.min(n, step)) * Q) / Q;
      if (q === drawn) return;
      paint(g, q, n); map.needsUpdate = true; drawn = q;
    },
  };
};

/** the parchment as a static prop (no steps): page and rolled ends, unsigned */
export const parchmentStatic = (b: Batch, at: At) => {
  const m = frame(at);
  b.add(new THREE.BoxGeometry(PW, 0.004, PD).translate(0, 0.002, 0), col("#efdcae"), m);
  for (const sx of [-1, 1]) cyl(b, col("#e2c992"), m, sx * (PW / 2 + 0.008), 0.014, -(PD + 0.01) / 2, 0.014, 0.014, PD + 0.01, 14, Math.PI / 2);
};
