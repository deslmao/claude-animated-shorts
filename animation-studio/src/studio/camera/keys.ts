// The creator's camera grammar (story.ts, measured in motion.md), generic: key lists per shot, symmetric
// smootherstep glides between keys (18-40 f), hard cuts on big jumps, every hold creeps in (pushK), flip-sign impact
// kicks that decay over 7 frames. No hand-held float.
export type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
export type Shot = Partial<Cam> & { pos: V3; look: V3 };
/** f = first frame of the key; dur = glide length from the previous framing (default 24); cut = jump instead */
export type Key = { f: number; dur?: number; cut?: boolean; ease?: "swoop"; s: (f: number) => Shot };

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** reference camera ease: symmetric smootherstep */
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
/** swoop ease (Video 04, reference clip 3): most of the travel early (a rush), a ~2 % overshoot, settled by u = 1 */
export const SWOOP_C1 = 0.85;
export const swoopEase = (u: number) => { const x = clamp01(u) - 1, c1 = SWOOP_C1; return 1 + (c1 + 1) * x * x * x + c1 * x * x; };
/** the swoop's sideways arc: a fraction of the travel distance, at its widest mid-way (a curve, not a straight dolly) */
export const SWOOP_ARC = 0.08;
const swoopCam = (a: Cam, b: Cam, u: number): Cam => {
  const c = mixCam(a, b, swoopEase(u)), dx = b.pos[0] - a.pos[0], dz = b.pos[2] - a.pos[2], d = Math.hypot(dx, dz);
  if (d < 1e-6) return c;
  const w = SWOOP_ARC * Math.hypot(dx, b.pos[1] - a.pos[1], dz) * Math.sin(Math.PI * clamp01(u));
  return { ...c, pos: [c.pos[0] - (dz / d) * w, c.pos[1], c.pos[2] + (dx / d) * w] };
};
const mixCam = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
/** the camera at frame f from a key list */
export const runKeys = (keys: Key[], f: number): Cam => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : k.ease === "swoop" ? swoopCam(cur, full(k.s(f)), (f - k.f) / (k.dur ?? 10)) : mixCam(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0: the subject grows ~rate per frame (reference 0.15-0.35 %/f); punch raises it for n frames */
export const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** dolly push: the camera slides toward the look point by factor k */
export const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
/** zoom push (camera stays put): tan(fov/2) shrinks by k */
export const zoom = (pos: V3, look: V3, fov: number, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos, look, fov: (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k), ...rest });

/** impact kicks: [time s, strength]; the image offset flips sign every frame (~3 px at 720p per unit), decays in 7 f */
export const kickAt = (kicks: [number, number][], t: number, fps = 30) => {
  let a = 0;
  for (const [t0, g] of kicks) {
    const n = Math.floor((t - t0) * fps + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const withKick = (c: Cam, a: number): Cam => {
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
/** mean horizontal view direction of a key list over [a, b) (for the per-shot frozen sun) */
export const meanView = (keys: Key[], a: number, b: number): [number, number] => {
  let fx = 0, fz = 0;
  for (let f = a; f < b; f += 3) {
    const c = runKeys(keys, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
    fx += x / n; fz += z / n;
  }
  return [fx, fz];
};

/** a continuous camera flight through framings (knots: frame + framing), arriving at each on its frame: a cubic
 *  Hermite path with time-aware tangents (C1: no stop at the inner knots), at rest at the first and last knot. Position,
 *  look point, fov and roll all follow it. After the last knot `after` takes over (it starts from that knot's framing) */
export const flyPath = (knots: { f: number; c: Cam }[], after: (f: number) => Shot) => {
  const n = knots.length, vec = (c: Cam) => [...c.pos, ...c.look, c.fov, c.roll];
  const P = knots.map((k) => vec(k.c)), T = knots.map((k) => k.f);
  const M = P.map((p, i) => (i === 0 || i === n - 1 ? p.map(() => 0) : p.map((_, j) => (P[i + 1][j] - P[i - 1][j]) / (T[i + 1] - T[i - 1]))));
  return (f: number): Shot => {
    if (f >= T[n - 1]) return after(f);
    if (f <= T[0]) return knots[0].c;
    let i = 0; while (f >= T[i + 1]) i++;
    const h = T[i + 1] - T[i], u = (f - T[i]) / h, u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const v = P[i].map((p, j) => h00 * p + h10 * h * M[i][j] + h01 * P[i + 1][j] + h11 * h * M[i + 1][j]);
    return { pos: [v[0], v[1], v[2]], look: [v[3], v[4], v[5]], fov: v[6], roll: v[7] };
  };
};
export const camOf = (c: Shot): Cam => full(c);
