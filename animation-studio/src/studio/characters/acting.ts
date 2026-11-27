// Subtle acting (stage 1D): the small life between the big reactions, so characters never freeze. All functions are
// pure functions of time (and a per-character seed) -> deterministic across chunked renders.
//   idle(t, seed)          breathing, weight shift, glances (look x / y), slow head tilts, blinks
//   nod(t, t0, n)          head nods (agreeing) starting at t0
//   shake(t, t0)           head shake (disagreeing)
//   talk(t, t0, t1, seed)  mouth flaps + changing hand gestures while speaking in [t0, t1] (no audio)
//   speak(t, words, seed)  the same, with the mouth following real word timings (narration lines)
//   faceToward(...)        3/4 facing toward another character as seen from the camera
//   blend(t, a, b, t0, d)  ease between two poses' numeric fields (turns, settles)
import type { Pose, Gesture, Expr } from "./figure";
import { lidAt, hash } from "../cards/person";

const smooth = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
/** smooth value noise in [-1, 1] (seeded), period ~ 1 / freq seconds */
const noise = (t: number, seed: number, freq = 0.5) => {
  const x = t * freq + seed * 17.3, i = Math.floor(x), f = x - i, a = hash(i, seed) * 2 - 1, b = hash(i + 1, seed) * 2 - 1;
  return a + (b - a) * smooth(f);
};

/** idle life: breathing (shoulder rise), weight shift (tilt), glances (gaze holds 0.8-2 s then moves), head drift */
export const idle = (t: number, seed: number, amount = 1): Partial<Pose> => {
  // glances: hold a gaze target, then a quick 4-frame eye move to the next one
  const slot = Math.floor(t / 1.4 + hash(seed, 3)), into = (t / 1.4 + hash(seed, 3)) % 1;
  const gx = (k: number) => (hash(k, seed * 7) * 2 - 1) * 0.8, gy = (k: number) => (hash(k, seed * 7 + 1) * 2 - 1) * 0.35;
  const m = smooth(into / 0.1);
  return {
    look: [(gx(slot - 1) + (gx(slot) - gx(slot - 1)) * m) * amount, (gy(slot - 1) + (gy(slot) - gy(slot - 1)) * m) * amount],
    shrug: (0.12 + 0.12 * Math.sin(t * 2 * Math.PI * 0.28 + seed)) * amount, // breathing ~ 17 breaths / min
    tilt: noise(t, seed, 0.18) * 1.6 * amount,                              // weight shift
    headTilt: noise(t, seed + 5, 0.3) * 3 * amount,                          // head drift
    blink: lidAt(t, seed),
  };
};

/** n nods starting at t0 (0.45 s each): head dips forward = tilt toward the chest */
export const nod = (t: number, t0: number, n = 2) => {
  const u = (t - t0) / 0.45;
  return u < 0 || u > n ? 0 : 6 * Math.sin(Math.PI * (u % 1)) ** 2;
};
/** head shake starting at t0 (gaze swings left / right, head tilts slightly) */
export const shake = (t: number, t0: number, dur = 0.9): Partial<Pose> => {
  const u = (t - t0) / dur;
  if (u < 0 || u > 1) return {};
  const s = Math.sin(u * Math.PI * 4) * Math.sin(u * Math.PI);
  return { look: [s * 1.2, 0], headTilt: s * 4 };
};

const TALK_GESTURES: Gesture[] = ["talk", "present", "talk", "point", "talk", "shrug", "talk", "present"];
/** speaking in [t0, t1]: mouth cycles closed / open / wide (~6-8 changes per second, varied), hands change gesture
 *  every ~1.2 s between talking hands, presenting, pointing and small shrugs. Until phase 3 brings real word timings,
 *  the mouth rhythm is a stand-in; with words.json it will open on vowels. */
export const talk = (t: number, t0: number, t1: number, seed: number, base: Expr = "talk"): Partial<Pose> => {
  if (t < t0 || t > t1) return {};
  const step = Math.floor((t - t0) * 7 + hash(seed, 2) * 3), r = hash(step, seed);
  const expr: Expr = r < 0.3 ? "smile" : r < 0.75 ? base : "talk_wide";
  const g = TALK_GESTURES[Math.floor((t - t0) / 1.2 + seed) % TALK_GESTURES.length];
  return { expr, gesture: g, headTilt: Math.sin((t - t0) * 3.1 + seed) * 2.5 };
};

/** facing (-1 | 0 | 1) toward another character, as seen from the camera (screen-space x of the two marks) */
export const faceToward = (camRightX: number, camRightZ: number, from: [number, number], to: [number, number]): -1 | 0 | 1 => {
  const s = (to[0] - from[0]) * camRightX + (to[1] - from[1]) * camRightZ;
  return Math.abs(s) < 0.05 ? 0 : s > 0 ? 1 : -1;
};

/** ease numeric pose fields from a to b over d seconds starting at t0 (for turns, settles, slow reactions) */
export const blend = (t: number, a: Partial<Pose>, b: Partial<Pose>, t0: number, d = 0.35): Partial<Pose> => {
  const k = smooth((t - t0) / d), out: Partial<Pose> = { ...(k < 0.5 ? a : b) };
  for (const f of ["tilt", "headTilt", "shrug", "jump"] as const) if (a[f] !== undefined || b[f] !== undefined) out[f] = (a[f] ?? 0) + ((b[f] ?? 0) - (a[f] ?? 0)) * k;
  return out;
};

/** combine pose layers: later layers win for discrete fields, numeric life fields add up */
export const layer = (...ps: Partial<Pose>[]): Pose => {
  const out: Pose = {};
  for (const p of ps) for (const [k, v] of Object.entries(p)) {
    if (v === undefined) continue;
    const key = k as keyof Pose;
    if ((key === "tilt" || key === "headTilt" || key === "shrug") && typeof out[key] === "number") (out[key] as number) += v as number;
    else if (key === "look" && out.look) out.look = [out.look[0] + (v as [number, number])[0], out.look[1] + (v as [number, number])[1]];
    else (out as Record<string, unknown>)[key] = v;
  }
  return out;
};

/** speaking real words (times in seconds, from the narration's word timings): the mouth opens on each syllable
 *  (vowel groups, spread across the word) and closes between words and at the end of each syllable; hands change
 *  gesture every ~1.2 s like talk(). Returns {} outside the speech (plus a short settle). */
export const speak = (t: number, words: { w: string; t0: number; t1: number }[], seed: number): Partial<Pose> => {
  if (!words.length || t < words[0].t0 - 0.04 || t > words[words.length - 1].t1 + 0.12) return {};
  const w = words.find((x) => t >= x.t0 - 0.02 && t <= x.t1);
  let expr: Expr = "smile";                                    // closed, relaxed: between words
  if (w) {
    const syl = Math.max(1, (w.w.toLowerCase().match(/[aeiouy]+/g) ?? []).length);
    const k = Math.max(0, (t - w.t0) / Math.max(0.06, w.t1 - w.t0)) * syl, i = Math.min(syl - 1, Math.floor(k)), ph = k - Math.floor(k);
    // open for most of each syllable; stressed / long syllables (and the first of a word, 40 %) open wide
    if (ph < 0.72) expr = (i === 0 && hash(Math.round(w.t0 * 100), seed) < 0.4) || (w.t1 - w.t0) / syl > 0.22 ? "talk_wide" : "talk";
  }
  const g = TALK_GESTURES[Math.floor((t - words[0].t0) / 1.2 + seed) % TALK_GESTURES.length];
  return { expr, gesture: g, headTilt: Math.sin((t - words[0].t0) * 3.1 + seed) * 2.5 };
};

// ================================================================================================================
// Engine 4 acting (opt-in: a storyboard with `engine: 4` and ActorSpec.keys). Nothing above this line changed.
//   keyframed poses (2-3 per shot): lean (tilt), slump (shrug < 0 + a low card), turn, head tilt, eyebrows, glance, face, gesture
//   snappy easing: fast out, slow in, a small overshoot that settles (no pose ever snaps mid-transition)
//   squash and stretch on every pose change: a stretch while the pose leaves, a squash as it lands, a damped wobble after
// All pure functions of time, so chunked renders match.
// ================================================================================================================
/** fast-out slow-in with a small overshoot that settles: 0 at u 0, ~1.05 near u 0.62, 1 at u 1 (a back-ease-out) */
export const easeSnap = (u: number, over = 1.0): number => {
  if (u <= 0) return 0; if (u >= 1) return 1;
  const x = u - 1, c = 1.15 * over;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

/** one keyframed pose: the numeric fields ease from the previous key; face and gesture switch part-way through the move */
export type E4Key = {
  t: number;                                    // seconds into the shot the move STARTS
  d?: number;                                   // seconds the move takes (default 0.34)
  expr?: Expr; gesture?: Gesture; hand?: -1 | 1; hold?: string | null;
  tilt?: number;                                // lean sideways, degrees about the hips (+ = toward screen right)
  slump?: number;                               // 0..1: shoulders drop, the whole figure sinks a little
  turn?: number;                                // -1..1 turn toward a side
  headTilt?: number;                            // degrees
  brow?: [number, number, number];              // lift, inner tilt, raise of the facing-side brow (head units)
  look?: [number, number];                      // gaze
  shrug?: number;                               // shoulders up (+)
  squash?: number;                              // how hard this move squashes and stretches (default 1, 0 = none)
};
const NUM: (keyof E4Key)[] = ["tilt", "headTilt", "turn", "shrug"];
const k0 = (k: E4Key | undefined, f: "tilt" | "headTilt" | "turn" | "shrug" | "slump") => (k && k[f] !== undefined ? (k[f] as number) : 0);
const lerp = (a: number, b: number, e: number) => a + (b - a) * e;

/** the engine 4 pose at time t (shot seconds) from the keys (sorted by t): numeric fields, the squash factor and how fast the pose is moving.
 *  Before the first key the pose is the first key's: author a key at t 0 for the starting pose */
export const e4Track = (keys: E4Key[], t: number): { pose: Partial<Pose>; squash: number; speed: number; propTilt: number } => {
  const ks = [...keys].sort((a, b) => a.t - b.t);
  let i = -1; for (let n = 0; n < ks.length; n++) if (ks[n].t <= t) i = n;
  const cur = ks[Math.max(0, i)], prev = i > 0 ? ks[i - 1] : cur, d = cur.d ?? 0.34, u = i > 0 ? (t - cur.t) / d : 1, e = easeSnap(u), moving = u >= 0 && u < 1;
  const v = (f: "tilt" | "headTilt" | "turn" | "shrug" | "slump") => lerp(k0(prev, f), k0(cur, f), e);
  const slump = v("slump");
  const pose: Partial<Pose> = { tilt: v("tilt"), headTilt: v("headTilt") - 4 * slump, shrug: v("shrug") - 1.0 * slump, e4: true };
  if (ks.some((k) => k.turn !== undefined)) pose.turn = v("turn");   // an authored turn replaces the automatic facing
  const brow = (k: E4Key | undefined, j: number) => (k?.brow ? k.brow[j] : 0);
  if (cur.brow || prev.brow) pose.brow = [lerp(brow(prev, 0), brow(cur, 0), e), lerp(brow(prev, 1), brow(cur, 1), e), lerp(brow(prev, 2), brow(cur, 2), e)];
  const lk = (k: E4Key | undefined, j: number) => (k?.look ? k.look[j] : 0);
  if (cur.look || prev.look) pose.look = [lerp(lk(prev, 0), lk(cur, 0), e), lerp(lk(prev, 1), lk(cur, 1), e)];
  // discrete fields switch a third of the way into the move (the face changes as the body is already going)
  const late = i <= 0 || u >= 0.3, src = late ? cur : prev;
  const face = [...ks.slice(0, Math.max(0, i) + 1)].reverse().find((k) => k.expr !== undefined && (k !== cur || late));
  if (face) pose.expr = face.expr;
  const ges = [...ks.slice(0, Math.max(0, i) + 1)].reverse().find((k) => k.gesture !== undefined && (k !== cur || late));
  if (ges) { pose.gesture = ges.gesture; if (ges.hand) pose.hand = ges.hand; }
  void src;
  // squash and stretch: how much the pose changes drives how hard it squashes. Stretch while it leaves (u 0-0.4), squash as it lands
  // (u 0.4-1), then a damped wobble for ~0.3 s after
  const mag = i > 0 ? Math.min(1, (Math.abs(k0(cur, "tilt") - k0(prev, "tilt")) / 14 + Math.abs(k0(cur, "slump") - k0(prev, "slump")) * 0.8
    + Math.abs(k0(cur, "turn") - k0(prev, "turn")) * 0.5 + Math.abs(k0(cur, "headTilt") - k0(prev, "headTilt")) / 30 + (cur.gesture !== prev.gesture ? 0.35 : 0)) * (cur.squash ?? 1)) : 0;
  const A = 0.02 + 0.055 * mag;
  let sq = 1 - 0.05 * slump;                                   // a slump also sits lower
  if (i > 0) {
    if (moving) sq += u < 0.4 ? A * Math.sin((Math.PI / 2) * (u / 0.4)) : A * (Math.cos((Math.PI * (u - 0.4)) / 0.6) * 0.5 - 0.5) * 1.4 + A * 0.5;
    else { const s = t - cur.t - d; if (s < 0.35) sq += -A * 0.7 * Math.exp(-s * 11) * Math.cos(s * 26); }
  }
  // the hand's momentum swings a held item: opposite to how fast the lean changes
  const dt = 1 / 60, e2 = (tt: number) => { const j = ks.filter((k) => k.t <= tt).length - 1, c = ks[Math.max(0, j)], p = j > 0 ? ks[j - 1] : c; return lerp(k0(p, "tilt"), k0(c, "tilt"), j > 0 ? easeSnap((tt - c.t) / (c.d ?? 0.34)) : 1); };
  const speed = (e2(t + dt) - e2(t - dt)) / (2 * dt);
  void NUM;
  return { pose, squash: sq, speed, propTilt: Math.max(-14, Math.min(14, -speed * 0.35)) };
};
