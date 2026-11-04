// Economy kit (Visual Storytelling 2.0): money explained in the world instead of on a panel. Stepped rigs whose
// steps play on words (story PropSpec.steps); every pose is a pure function of the step progress, so every render
// chunk draws the same frame. Chunky metal coins (6 cm radius, 2.4 cm thick, raised rims, bevelled edges, three
// golds) so the ink draws clean silhouettes at phone size, not flickering hairlines.
import * as THREE from "three";
import { sph, frame } from "./kit";
import { metal } from "../materials/geo";
import type { Batch } from "../materials/geo";
import type { At } from "./kit";
import type { PropRig } from "./registry";

const R = 0.06, H = 0.024, PER = 6; // coin radius, thickness, coins per share

/** shares from a variant name: "2-1" = two shares to the first recipient, one to the second (default) */
export const sharesOf = (variant?: string) => (variant ?? "2-1").split("-").map((x) => Math.max(1, Math.min(4, parseInt(x, 10) || 1)));

/** gold that reads as metal in the house style: three slightly different golds (Phong, a warm highlight, the
 *  two-tone shade), so a heap and its stacks aren't one flat yellow */
export const GOLDS = [["goldA", "#eab53c"], ["goldB", "#f2c451"], ["goldC", "#d9a330"]].map(([k, c]) => metal(k, c, "#fff1b8", 46, 0.22));
/** a coin: a lathe with a raised rim around a slightly sunk face and a bevelled edge, so it has an edge highlight, a
 *  rim line and a face, not a flat disc */
export const COIN = (() => {
  const t = H / 2, pts = [[0, t - 0.002], [R * 0.74, t - 0.002], [R * 0.8, t], [R * 0.94, t], [R, t - 0.004], [R, -t + 0.004], [R * 0.94, -t], [0, -t]]
    .map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 28);
})();

const ease = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
const hash = (i: number) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** loot piles: step 0 = one heap of gold; step 1 = it streams into equal share stacks in a row; then one step per
 *  recipient: their stacks slide to their end of the surface (the first recipient to local -x, the next to +x).
 *  Stands on a surface at At.y (a table top). Local +z faces the camera side */
export const lootPilesRig = (a: At, variant?: string): PropRig => {
  const shares = sharesOf(variant), S = shares.reduce((n, x) => n + x, 0), N = S * PER;
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0;
  const coins = Array.from({ length: N }, (_, i) => { const m = new THREE.Mesh(COIN, GOLDS[Math.floor(hash(i + 7) * 3)]); m.castShadow = true; m.receiveShadow = true; root.add(m); return m; });
  // the heap: a low gold mound with the coins lying on its surface (rings out from the centre, tilted with the slope);
  // the mound sinks as the coins stream off it
  const MR = 0.22, MH = 0.1, mound = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), GOLDS[2]);
  mound.scale.set(MR, MH, MR * 0.8); mound.castShadow = true; mound.receiveShadow = true; root.add(mound);
  const heap: [number, number, number, number][] = [];
  for (let i = 0, ring = 0; i < N; ring++) {
    const n = ring === 0 ? 1 : 6 * ring, rr = ring * R * 1.5;
    for (let k = 0; k < n && i < N; k++, i++) {
      const ang = (k / n) * Math.PI * 2 + ring * 0.4 + hash(i) * 0.2, x = Math.cos(ang) * rr, z = Math.sin(ang) * rr * 0.8;
      const d = Math.min(0.999, Math.hypot(x / MR, z / (MR * 0.8)));
      heap.push([x, MH * Math.sqrt(1 - d * d) + H * 0.4, z, (ring ? 0.45 : 0) * (0.7 + 0.3 * hash(i + 50))]);
    }
  }
  // share stacks in a row (step 1), and each recipient's end of the surface (later steps): a recipient's stacks stand
  // side by side ACROSS the surface (along z) with clear gaps, so from above or from either end every stack is
  // separate and countable
  const gap = R * 2.6, x0 = -((S - 1) / 2) * gap;
  const owner: number[] = []; shares.forEach((n, r) => { for (let k = 0; k < n; k++) owner.push(r); });
  const endAt = (r: number, k: number, n: number): [number, number] => [(r === 0 ? -1 : 1) * 0.52, (k - (n - 1) / 2) * R * 3.1];
  // a hand-stacked look: every coin sits a few millimetres off true, the same in every frame
  const jit = Array.from({ length: N }, (_, i) => [(hash(i + 90) - 0.5) * 0.008, (hash(i + 140) - 0.5) * 0.008]);
  return {
    root,
    update: ({ step = 0 }) => {
      const s1 = Math.max(0, Math.min(1, step)), claims = shares.map((_, r) => Math.max(0, Math.min(1, step - 1 - r)));
      coins.forEach((m, i) => {
        const sh = Math.floor(i / PER), j = i % PER, h = heap[i];
        // stream: coins leave the heap one after another, hop in a small arc and land on their stack
        const u = ease((s1 * (1 + 0.8) - (i / N) * 0.8)), r = owner[sh], kIn = shares.slice(0, r).reduce((n, x) => n + x, 0), k = sh - kIn;
        const sx = x0 + sh * gap, sy = H / 2 + j * H * 1.02;
        const c = ease(claims[r]), [ex, ez] = endAt(r, k, shares[r]), [jx, jz] = jit[i];
        const x = h[0] + (sx + jx - h[0]) * u + (ex - sx) * c, z = h[2] * (1 - u) + jz * u + ez * c;
        const y = h[1] + (sy - h[1]) * u + Math.sin(Math.PI * u) * 0.14 + Math.sin(Math.PI * c) * 0.05;
        m.position.set(x, y, z);
        // on the heap a coin tilts with the mound's slope (away from its centre)
        const tilt = h[3] * (1 - u), ang = Math.atan2(h[2], h[0]);
        m.rotation.set(Math.sin(ang) * tilt, 0, -Math.cos(ang) * tilt);
      });
      const left = Math.max(0.0001, 1 - s1 * 1.15); mound.scale.set(MR * Math.sqrt(left), MH * left, MR * 0.8 * Math.sqrt(left)); mound.visible = left > 0.01;
    },
  };
};

/** the loot heap as a static prop (no steps): the mound with a ring of coins lying on it */
export const lootHeap = (b: Batch, a: At) => {
  const m = frame(a);
  sph(b, GOLDS[2], m, 0, 0, 0, 0.22, 0.08, 0.176, 20);
  for (let k = 0; k < 7; k++) { const ang = (k / 7) * Math.PI * 2; b.add(COIN, GOLDS[k % 3], m.clone().multiply(new THREE.Matrix4().makeTranslation(Math.cos(ang) * 0.1, 0.075, Math.sin(ang) * 0.08))); }
};
