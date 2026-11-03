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
