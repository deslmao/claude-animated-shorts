// Engine 4: procedural basketball motion. No linear interpolation anywhere: every curve is easeOutQuad / easeInQuad / easeInOutCubic / easeOutBack, and the four things a move
// drives (torso tilt, the arms (a gesture), the vertical jump arc plus the horizontal glide, and the squash) are computed from ONE clock, so they stay in step. The ball is a
// separate plan of segments (hold in a hand, dribble under a hand, a parabolic flight, a drop through the net with bounces): it is parented to a hand while held and
// detaches into a parabola on release. Both are pure functions of the shot time (chunked renders match).
//   actor.play = [{ kind: "crossover" | "bite" | "pullup" | "brick" | "dunk" | "whip" | "catch" | "shake", t | word, dt?, dir?, go? }]
//   prop.ball  = [{ kind: "hold" | "dribble" | "flight" | "drop" | "rest", t | word, dt?, ... }]
// `go` is a world displacement [x, z] (metres) the move glides through; it stays done after the move ends.
import type { Gesture } from "../characters/figure";

type V3 = [number, number, number];
const c01 = (u: number) => Math.max(0, Math.min(1, u));
export const easeOutQuad = (u: number) => 1 - (1 - c01(u)) * (1 - c01(u));
export const easeInQuad = (u: number) => c01(u) * c01(u);
export const easeInOutCubic = (u: number) => { const x = c01(u); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeOutBack = (u: number, s = 1.70158) => { const x = c01(u); return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
/** progress of t through [a, b], clamped */
const seg = (t: number, a: number, b: number) => c01((t - a) / (b - a));

export type When2 = { t?: number; word?: string; n?: number; /** seconds added after the time / word the move starts on */ dt?: number };
export type PlayKind = "crossover" | "bite" | "pullup" | "brick" | "dunk" | "whip" | "catch" | "shake" | "pushup" | "barpull" | "charge" | "flick" | "slide" | "bow" | "step";
export type PlayMove = When2 & { kind: PlayKind; /** -1 | 1: which way the fake / the lean goes (screen right = +1) */ dir?: -1 | 1; /** world glide [x, z] metres */ go?: [number, number]; /** jump height m */ rise?: number; /** pushup / barpull: how many reps and seconds per rep */ reps?: number; per?: number; /** pushup: how far (0..1) the arms tire and the body sags near the end */ tire?: number };
export const PLAY_DUR: Record<PlayKind, number> = { crossover: 0.8, bite: 0.8, pullup: 1.0, brick: 1.0, dunk: 0.9, whip: 0.5, catch: 0.5, shake: 0.6, pushup: 1.0, barpull: 1.0, charge: 1.0, flick: 0.5, slide: 1.4, bow: 2.0, step: 0.7 };
export type PlayOut = { dx: number; dy: number; dz: number; tilt: number; headTilt: number; squash: number; gesture?: Gesture };

/** the body's state at shot time tt from a list of moves: displacement (done moves stay displaced), tilt, squash, the arms */
export const playAt = (moves: PlayMove[] | undefined, tt: number): PlayOut => {
  const o: PlayOut = { dx: 0, dy: 0, dz: 0, tilt: 0, headTilt: 0, squash: 1 };
  for (const m of moves ?? []) {
    const t0 = m.t ?? 0, D = PLAY_DUR[m.kind], u = tt - t0, dir = m.dir ?? 1;
    if (u < 0) continue;
    const glide = (a: number, b: number, f: (x: number) => number) => { if (m.go) { const k = f(seg(u, a, b)); o.dx += m.go[0] * k; o.dz += m.go[1] * k; } };
    const arms = (g: Gesture, until = D + 0.15) => { if (u <= until) o.gesture = g; };
    switch (m.kind) {
      case "crossover": {
        // 0-0.25 sell the fake (lean +15 deg, crouch 0.90) / 0.25-0.45 the whip across / 0.45-0.8 snap the other way (-15 deg, easeOutBack) and burst past
        o.tilt += u < 0.25 ? 15 * dir * easeOutQuad(u / 0.25) : u < 0.45 ? 15 * dir * (1 - easeInOutCubic(seg(u, 0.25, 0.45))) : u < 0.8 ? -15 * dir * easeOutBack(seg(u, 0.45, 0.8)) : -15 * dir * (1 - easeInOutCubic(seg(u, 0.8, 1.0)));
        o.squash *= u < 0.25 ? 1 - 0.1 * easeOutQuad(u / 0.25) : u < 0.45 ? 0.9 + 0.1 * easeInOutCubic(seg(u, 0.25, 0.45)) : 1 + 0.03 * Math.sin(Math.PI * seg(u, 0.45, 0.8));
        glide(0.45, 0.8, easeInOutCubic); if (u <= 0.95) o.gesture = "hang";
        break;
      }
      case "bite": {
        // the defender slides with the fake (0-0.25), then stumbles backward the wrong way (0.45-0.8)
        glide(0, 0.25, easeOutQuad);
        o.tilt += u < 0.45 ? 4 * dir * easeOutQuad(seg(u, 0, 0.25)) : -14 * dir * easeOutBack(seg(u, 0.45, 0.8)) * (1 - 0.6 * seg(u, 0.8, 1.0));
        o.squash *= u < 0.25 ? 1 - 0.06 * easeOutQuad(u / 0.25) : 1 - 0.06 * (1 - easeInOutCubic(seg(u, 0.25, 0.5)));
        o.dy += 0.04 * Math.sin(Math.PI * seg(u, 0.45, 0.8)); arms("spread", 0.9);
        break;
      }
      case "pullup": case "brick": {
        const brick = m.kind === "brick", H = m.rise ?? (brick ? 0.26 : 0.46);
        // 0-0.2 plant and load (glide, 1-2 stop, crouch 0.86, ball to the chin) / 0.2-0.5 rise on an easeOutQuad curve, arms overhead at the peak / 0.5-0.8 fall / 0.8-1.0 landing squash 0.92
        glide(brick ? 0.2 : 0, brick ? 0.8 : 0.2, brick ? easeInOutCubic : easeOutQuad);
        o.squash *= u < 0.1 ? 1 : u < 0.2 ? 1 - 0.14 * easeOutQuad(seg(u, 0.1, 0.2)) : u < 0.3 ? 0.86 + 0.18 * easeOutQuad(seg(u, 0.2, 0.3)) : u < 0.5 ? 1.04 - 0.04 * easeInOutCubic(seg(u, 0.3, 0.5)) : u < 0.8 ? 1 : 1 - 0.08 * Math.sin(Math.PI * seg(u, 0.8, 1.0));
        o.dy += u < 0.5 ? H * easeOutQuad(seg(u, 0.2, 0.5)) : H * (1 - easeInQuad(seg(u, 0.5, 0.8)));
        if (brick) { o.tilt += -16 * dir * easeOutBack(seg(u, 0.35, 0.6)) * (1 - seg(u, 0.85, 1.1)) + 3 * Math.sin(u * 18) * seg(u, 0.4, 0.8); o.headTilt += -8 * dir * seg(u, 0.4, 0.7); }
        else o.tilt += -4 * easeOutQuad(seg(u, 0.3, 0.5)) * (1 - seg(u, 0.8, 1.0));
        if (u < 0.3) o.gesture = "present"; else if (u < D + 0.15) o.gesture = brick ? "spread" : "cheer";
        break;
      }
      case "dunk": {
        // run-up glide (0-0.3), crouch (0.88), a high leap with the ball overhead (0.3-0.58), the slam at the peak, the fall and the landing squash
        const H = m.rise ?? 0.95;
        glide(0, 0.3, easeInOutCubic);
        o.squash *= u < 0.2 ? 1 : u < 0.3 ? 1 - 0.12 * easeOutQuad(seg(u, 0.2, 0.3)) : u < 0.5 ? 0.88 + 0.2 * easeOutQuad(seg(u, 0.3, 0.5)) : u < 0.75 ? 1.08 - 0.08 * easeInOutCubic(seg(u, 0.5, 0.75)) : 1 - 0.1 * Math.sin(Math.PI * seg(u, 0.75, 1.0));
        o.dy += u < 0.58 ? H * easeOutQuad(seg(u, 0.3, 0.58)) : H * (1 - easeInQuad(seg(u, 0.62, 0.9)));
        o.tilt += 6 * dir * easeOutQuad(seg(u, 0.3, 0.55)) * (1 - seg(u, 0.75, 1.0));
        if (u < 0.3) o.gesture = "present"; else if (u < D + 0.15) o.gesture = "cheer";
        break;
      }
      case "whip": {
        // KD steps and snaps both arms forward
        glide(0, 0.25, easeOutQuad);
        o.tilt += -8 * easeOutBack(seg(u, 0.05, 0.3)) * (1 - seg(u, 0.4, 0.8)); o.squash *= 1 - 0.05 * Math.sin(Math.PI * seg(u, 0, 0.35));
        if (u < 0.15) o.gesture = "present"; else if (u < D + 0.35) o.gesture = "offer";
        break;
      }
      case "catch": {
        // hands out, a brief recoil as the ball lands in them
        o.tilt += 6 * dir * easeOutBack(seg(u, 0.35, 0.5)) * (1 - seg(u, 0.55, 0.9)); o.squash *= 1 - 0.04 * Math.sin(Math.PI * seg(u, 0.35, 0.65));
        if (u < D + 0.3) o.gesture = u < 0.4 ? "offer" : "present";
        break;
      }
      case "pushup": {
        // lying flat (the keys' flip 0.5 turns the card on its side; this sinks it to the floor): each rep goes down on easeInOutCubic, holds a beat at the floor, and pushes up on easeOutQuad;
        // the arms tire as the reps go on: the bottom gets lower, the top lower, and the body trembles harder (a fast small shake) over the last reps
        const per = m.per ?? 1.1, n = m.reps ?? 4, T = per * n, prog = seg(u, 0, T), tire = (m.tire ?? 0.5) * prog, k = (u % per) / per;
        if (u <= T) {
          const wave = k < 0.45 ? easeInOutCubic(k / 0.45) : k < 0.6 ? 1 : 1 - easeOutQuad((k - 0.6) / 0.4);   // 0 = top, 1 = chest at the floor
          const shake = Math.sin(u * 46) * 0.012 * Math.pow(prog, 2.2) * (1 - 0.6 * wave);
          o.dy += -0.36 - 0.12 * tire + (0.15 - 0.06 * tire) * (1 - wave) + shake; o.squash *= 1 - 0.015 * wave;
          o.tilt += Math.sin(u * 38) * 1.6 * Math.pow(prog, 2.4);
        } else o.dy += -0.36 - 0.1;
        break;
      }
      case "barpull": {
        // hanging from a bar by the hands (arms overhead): each rep pulls up on easeOutQuad (the arms bend at the top) and lowers slowly on easeInOutCubic
        const per = m.per ?? 1.3, n = m.reps ?? 3, T = per * n, k = (u % per) / per;
        const wave = u > T ? 0 : k < 0.4 ? easeOutQuad(k / 0.4) : 1 - easeInOutCubic((k - 0.4) / 0.6);
        o.dy += 0.2 + (m.rise ?? 0.5) * wave; o.squash *= 1 + 0.02 * Math.sin(Math.PI * Math.min(1, wave)); o.tilt += 1.5 * Math.sin(u * 7) * (1 - wave) * 0.4;
        o.gesture = wave > 0.55 ? "pump" : "cheer";
        break;
      }
      case "bow": {
        // a teacher's bow toward the cocky student: down on easeOutBack (pitched about 40 degrees at the hips), held, then back up on easeInOutCubic
        const dn = easeOutBack(seg(u, 0, 0.55), 1.2), up = easeInOutCubic(seg(u, 1.45, 2.0));
        o.tilt += 40 * dir * dn * (1 - up); o.headTilt += 6 * dir * dn * (1 - up); o.dy += -0.04 * dn * (1 - up); o.squash *= 1 - 0.04 * dn * (1 - up);
        o.gesture = "hang";
        break;
      }
      case "step": {
        // a quick step aside: a lean into it, an easeOutQuad glide along `go`, a small hop at the push-off
        glide(0, 0.6, easeOutQuad);
        o.tilt += 7 * dir * Math.sin(Math.PI * seg(u, 0, 0.6)); o.dy += 0.05 * Math.sin(Math.PI * seg(u, 0, 0.5));
        break;
      }
      case "charge": {
        // Dex's rush: coil back (0-0.25, lean away, squash 0.92), then burst forward on an easeOutQuad curve (0.25-0.85) leaning into it with a little overshoot
        glide(0.25, 0.85, easeOutQuad);
        o.tilt += u < 0.25 ? -8 * dir * easeOutQuad(u / 0.25) : -8 * dir * (1 - easeOutBack(seg(u, 0.25, 0.45))) + 10 * dir * easeOutBack(seg(u, 0.3, 0.6)) * (1 - seg(u, 0.85, 1.1));
        o.squash *= u < 0.25 ? 1 - 0.08 * easeOutQuad(u / 0.25) : 1 + 0.04 * Math.sin(Math.PI * seg(u, 0.25, 0.7));
        o.dy += 0.05 * Math.abs(Math.sin(u * 14)) * seg(u, 0.25, 0.4) * (1 - seg(u, 0.8, 0.9));
        o.gesture = "pump";
        break;
      }
      case "flick": {
        // one finger up (0-0.25, a calm held beat), then the flick: a quick snap (0.25-0.33, easeOutBack) and a small recoil of the shoulders
        o.gesture = "pointUp";
        o.tilt += 5 * dir * easeOutBack(seg(u, 0.25, 0.36)) * (1 - seg(u, 0.4, 0.9)); o.headTilt += -3 * dir * easeOutQuad(seg(u, 0.25, 0.4)) * (1 - seg(u, 0.5, 1.0));
        o.squash *= 1 + 0.02 * Math.sin(Math.PI * seg(u, 0.25, 0.5));
        break;
      }
      case "slide": {
        // blown back and sliding on the back: thrown flat (tilt to -78 deg on easeOutBack over 0.3 s), then a long easeOutQuad slide along `go` (1.2 s) coming to rest; the body stays sunk to the floor
        glide(0, 1.2, easeOutQuad);
        o.tilt += -78 * dir * easeOutBack(seg(u, 0, 0.3)); o.dy += -0.3 * easeOutQuad(seg(u, 0, 0.3)) + 0.1 * Math.sin(Math.PI * seg(u, 0, 0.3));
        o.squash *= 1 - 0.04 * Math.sin(Math.PI * seg(u, 0, 0.3)); o.gesture = "spread";
        break;
      }
      case "shake": {
        // shaking a stung hand out: 3.5 quick cycles over 0.6 s, the arm waving, the body wobbling with it
        const env = Math.sin(Math.PI * seg(u, 0, D)), ph = 2 * Math.PI * 3.5 * seg(u, 0, D);
        o.tilt += 6 * Math.sin(ph) * env; o.headTilt += 4 * Math.sin(ph + 1) * env; o.squash *= 1 - 0.015 * Math.abs(Math.sin(ph)) * env;
        if (u <= D) o.gesture = "wave";
        break;
      }
    }
  }
  return o;
};

// ---- the ball ----
export type BallPt = V3 | { who: string; up?: number; t?: number; lat?: number };
export type BallSeg = When2 & (
  | { kind: "hold"; who: string; which?: "hi" | "lo" | "mid" }
  | { kind: "dribble"; who: string; hz?: number; which?: "hi" | "lo" | "mid" }
  | { kind: "flight"; from: BallPt; to: BallPt; dur: number; apex: number; /** the flight ends in the net (a swish): the net ripples */ swish?: boolean; spin?: number }
  | { kind: "drop"; from: V3; floor?: number }
  | { kind: "rest"; at: BallPt });
export type BallCtx = { r: number; hand: (who: string, which: "hi" | "lo" | "mid") => V3 | undefined; at: (who: string, t: number) => V3; floor: number };

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
/** a ball dropped from `from` onto a floor: gravity, then up to 3 bounces losing half their speed */
const dropAt = (from: V3, floor: number, r: number, u: number): V3 => {
  const g = 9.8; let h = Math.max(0.001, from[1] - floor - r), t = u, v = 0;
  const fall = Math.sqrt((2 * h) / g); if (t < fall) return [from[0], from[1] - 0.5 * g * t * t, from[2]];
  t -= fall; v = g * fall * 0.5;
  for (let i = 0; i < 3; i++) { const air = (2 * v) / g; if (t < air) return [from[0] + 0.12 * (u - fall), floor + r + v * t - 0.5 * g * t * t, from[2] + 0.05 * (u - fall)]; t -= air; v *= 0.5; }
  return [from[0] + 0.12 * (u - fall), floor + r, from[2] + 0.05 * (u - fall)];
};

/** the ball at shot time tt: its centre, its spin angle, and the net's ripple (0..1) */
export const ballAt = (segs: BallSeg[], tt: number, ctx: BallCtx): { pos: V3; spin: number; pulse: number } => {
  const ss = [...segs].sort((a, b) => (a.t ?? 0) - (b.t ?? 0));
  let k = -1; for (let i = 0; i < ss.length; i++) if ((ss[i].t ?? 0) <= tt) k = i;
  const pt = (p: BallPt, t: number): V3 => (Array.isArray(p) ? p : (() => { const b = ctx.at(p.who, p.t ?? t); return [b[0] + (p.lat ?? 0), b[1] + (p.up ?? 1.0), b[2]] as V3; })());
  // the net ripple: a swish flight's arrival, 0.45 s of a decaying pulse
  let pulse = 0;
  for (const s of ss) if (s.kind === "flight" && s.swish) { const u = (tt - ((s.t ?? 0) + s.dur)) / 0.45; if (u >= 0 && u <= 1) pulse = Math.max(pulse, Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u * 0.6)); }
  if (k < 0) { const first = ss[0]; const p0: V3 = first ? (first.kind === "flight" ? pt(first.from, first.t ?? 0) : first.kind === "drop" ? first.from : first.kind === "rest" ? pt(first.at, first.t ?? 0) : (ctx.hand(first.who, first.which ?? "lo") ?? ctx.at(first.who, 0))) : [0, ctx.r, 0]; return { pos: p0, spin: 0, pulse }; }
  const s = ss[k], t0 = s.t ?? 0, u = tt - t0;
  switch (s.kind) {
    case "hold": { const h = ctx.hand(s.who, s.which ?? "lo"), b = ctx.at(s.who, tt); return { pos: h ?? [b[0], b[1] + 1.0, b[2]], spin: 0, pulse }; }
    case "dribble": {
      const h = ctx.hand(s.who, s.which ?? "lo") ?? ctx.at(s.who, tt), hz = s.hz ?? 2.2, ph = (u * hz) % 1, top = Math.max(h[1], ctx.floor + 0.5);
      const y = ph < 0.5 ? top - (top - ctx.floor - ctx.r) * easeInQuad(ph * 2) : ctx.floor + ctx.r + (top - ctx.floor - ctx.r) * easeOutQuad(ph * 2 - 1);
      return { pos: [h[0], y, h[2]], spin: u * 6, pulse };
    }
    case "flight": {
      const a = pt(s.from, t0), b = pt(s.to, t0 + s.dur), x = c01(u / s.dur), p = lerp3(a, b, x);
      return { pos: [p[0], p[1] + 4 * s.apex * x * (1 - x), p[2]], spin: u * (s.spin ?? 9), pulse };
    }
    case "drop": return { pos: dropAt(s.from, s.floor ?? ctx.floor, ctx.r, u), spin: u * 5, pulse };
    case "rest": return { pos: pt(s.at, t0), spin: 0, pulse };
  }
};

// ---- authoring helpers: a whole move (the body AND the ball) from one start time ----
/** a swish pull-up: the plant, the rise and the release (at 0.5 s, the peak), the arc into the rim, the drop through the net. `hoop` = the rim centre */
export const pullUpSwish = (who: string, start: When2, hoop: V3, o: { dir?: -1 | 1; go?: [number, number]; flight?: number; apex?: number; rise?: number; from?: BallPt } = {}) => {
  const rel = 0.5, fl = o.flight ?? 0.62, at = (dt: number): When2 => ({ ...start, dt: (start.dt ?? 0) + dt });
  return {
    play: { ...start, kind: "pullup" as const, dir: o.dir, go: o.go, rise: o.rise } as PlayMove,
    ball: [
      { ...at(0), kind: "hold", who, which: "mid" },
      { ...at(rel), kind: "flight", from: o.from ?? { who, up: 1.95 + (o.rise ?? 0.46) }, to: [hoop[0], hoop[1] + 0.08, hoop[2]], dur: fl, apex: o.apex ?? 1.0, swish: true },
      { ...at(rel + fl), kind: "drop", from: [hoop[0], hoop[1] - 0.1, hoop[2]] },
    ] as BallSeg[],
  };
};
/** an awkward, off-balance miss: the ball hits the front of the rim, rattles off the backboard and ricochets away */
export const brickShot = (who: string, start: When2, hoop: V3, o: { dir?: -1 | 1; go?: [number, number]; ricochet?: V3; from?: BallPt } = {}) => {
  const rel = 0.5, fl = 0.7, at = (dt: number): When2 => ({ ...start, dt: (start.dt ?? 0) + dt });
  const off: V3 = o.ricochet ?? [hoop[0] + 1.6, 0.12, hoop[2] + 2.6];
  return {
    play: { ...start, kind: "brick" as const, dir: o.dir ?? 1, go: o.go } as PlayMove,
    ball: [
      { ...at(0), kind: "hold", who, which: "mid" },
      { ...at(rel), kind: "flight", from: o.from ?? { who, up: 1.8 }, to: [hoop[0] + 0.05, hoop[1] + 0.12, hoop[2] - 0.2], dur: fl, apex: 0.9, spin: 14 },
      { ...at(rel + fl), kind: "flight", from: [hoop[0] + 0.05, hoop[1] + 0.12, hoop[2] - 0.2], to: [hoop[0] + (off[0] - hoop[0]) * 0.5, hoop[1] + 0.6, hoop[2] + 0.6], dur: 0.38, apex: 0.35, spin: 12 },
      { ...at(rel + fl + 0.38), kind: "flight", from: [hoop[0] + (off[0] - hoop[0]) * 0.5, hoop[1] + 0.6, hoop[2] + 0.6], to: off, dur: 0.6, apex: 0.2, spin: 10 },
      { ...at(rel + fl + 0.98), kind: "drop", from: [off[0], off[1] + 0.35, off[2]] },
    ] as BallSeg[],
  };
};
/** a crossover: the ball bounces low on one side (0-0.25), whips across the floor to the other hand (0.25-0.45), then the blow-by */
export const crossover = (who: string, start: When2, dir: -1 | 1, go: [number, number], defender?: { who: string; go: [number, number] }) => {
  const at = (dt: number): When2 => ({ ...start, dt: (start.dt ?? 0) + dt });
  return {
    play: [{ ...start, kind: "crossover" as const, dir, go } as PlayMove, ...(defender ? [{ ...start, kind: "bite" as const, dir, go: defender.go } as PlayMove] : [])],
    ball: [{ ...at(0), kind: "dribble", who, hz: 3.4, which: dir > 0 ? "lo" : "hi" }, { ...at(0.25), kind: "dribble", who, hz: 2.6, which: dir > 0 ? "hi" : "lo" }, { ...at(0.45), kind: "dribble", who, hz: 2.4, which: "lo" }] as BallSeg[],
  };
};
