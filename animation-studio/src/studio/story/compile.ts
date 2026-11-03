// Storyboard -> film (stage 1E). Turns plain storyboard data into SetWorld shots (camera keys from named moves, lens
// blur, impact kicks), a timeline (cuts, crossfades, white flashes, dips to black) and a director that stages every
// actor each frame: acting preset + timed beats, idle life, blinks hidden behind expression swaps, talking mouths and
// hands, nods / shakes, facing the nearest other actor, profile walks between marks, contact shadows and effect cards.
// Everything is a pure function of the frame number -> deterministic for chunked cloud renders.
import { plan, Move } from "../camera/moves";
import { SETS } from "../sets";
import { LAYOUTS } from "../sets/layouts";
import type { WorldShot, Director } from "../scene/SetWorld";
import type { Timeline } from "../look/StudioFilm";
import { CAST, extra } from "../characters/cast";
import { act as actPose, Look, Pose, Expr } from "../characters/figure";
import { idle, nod as nodAt, shake as shakeAt, talk as talkAt, speak as speakAt, layer, faceToward } from "../characters/acting";
import { lookCard, contactShadow, lidAt } from "../cards/person";
import { fxNear } from "../fx/effects";
import type { Storyboard, ShotSpec, ActorSpec, Where, V3, CameraSpec } from "./types";
import type { Narration } from "../voice/narration";
import { resolve } from "./timing";

export const FPS = 30;
const FADE = 8;

export const lookOf = (ref: Storyboard["cast"][string]): Look =>
  typeof ref === "string" ? (CAST as Record<string, Look>)[ref] : extra(ref.extra, ref.era ?? "modern");
export const whereOf = (set: string, w: Where): V3 => (typeof w === "string" ? LAYOUTS[set].spots[w] : w);
const smooth = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };

/** an actor's floor position at shot time tt (walks ease in / out between their marks) */
export const actorPos = (set: string, a: ActorSpec, tt: number): V3 => {
  const p0 = whereOf(set, a.at);
  if (!a.walk) return p0;
  const p1 = whereOf(set, a.walk.to), k = smooth((tt - a.walk.t0) / Math.max(0.1, a.walk.t1 - a.walk.t0));
  return [p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k, p0[2] + (p1[2] - p0[2]) * k];
};

/** where an actor settles in the shot (the end of their walk): cameras frame this, so walk-ins enter the frame */
export const restPos = (set: string, a: ActorSpec): V3 => whereOf(set, a.walk ? a.walk.to : a.at);

/** frame ranges of the shots: shot k covers [a, b) */
export const shotFrames = (sb: Storyboard) => {
  let f = 0;
  return sb.shots.map((s) => { const a = f; f += Math.round((s.dur ?? 0) * FPS); return { a, b: f }; });
};

/** camera spec -> library move, naming actors instead of coordinates (framed where they settle) */
const moveOf = (s: ShotSpec, c: CameraSpec): Move => {
  // the slow "breathing" push of held shots totals at most 8 % of the distance however long the shot, so a fitted
  // group stays in frame to the last frame
  const creep = Math.min(0.0022, 0.08 / Math.max(1, Math.round((s.dur ?? 0) * FPS)));
  const pos = (who: string) => { const a = s.actors.find((x) => x.who === who); if (!a) throw new Error(`camera names "${who}" but no such actor in the shot`); return restPos(s.set, a); };
  const view = (name: string) => { const v = LAYOUTS[s.set].views.find((x) => x.name === name); if (!v) throw new Error(`set ${s.set} has no view "${name}"`); return v; };
  switch (c.move) {
    case "view": return { move: "view", view: view(c.view), creep };
    case "establish": return { move: "establish", view: view(c.view) };
    case "frame": return { move: "frame", marks: c.on.map(pos), size: c.size, from: c.from, height: c.height, roll: c.roll, creep };
    case "pushIn": case "pullOut": return { move: c.move, marks: c.on.map(pos), size: c.size, to: c.to, from: c.from, height: c.height };
    case "closeUp": return { move: "closeUp", mark: pos(c.on), from: c.from, punch: c.punch };
    case "lowHero": return { move: "lowHero", mark: pos(c.on), from: c.from };
    case "highAngle": return { move: "highAngle", marks: c.on.map(pos), from: c.from };
    case "overShoulder": return { move: "overShoulder", over: pos(c.over), at: pos(c.at), side: c.side };
    case "orbit": return { move: "orbit", marks: c.on.map(pos), fromDeg: c.fromDeg, size: c.size, height: c.height };
    case "crane": return { move: "crane", marks: c.on.map(pos), heights: c.heights, size: c.size, from: c.from };
    case "dutch": return { move: "dutch", marks: c.on.map(pos), size: c.size, from: c.from, roll: c.roll };
  }
};

/** storyboard (+ its narration manifest, if generated) -> film. Narration timing runs first (story/timing.ts): it
 *  sizes shots to their lines and turns word anchors into times; everything below works on that resolved copy */
export const compile = (sb0: Storyboard, narr?: Narration) => {
  const timing = resolve(sb0, narr), sb = timing.sb;
  const ranges = shotFrames(sb), total = ranges[ranges.length - 1].b;
  const seedOf = (who: string) => Object.keys(sb.cast).indexOf(who) + 1;
  const shots: WorldShot[] = sb.shots.map((s, k) => {
    const { a, b } = ranges[k], pre = s.transition === "fade" ? FADE : 0;
    const p = plan(moveOf(s, s.camera), a - pre, b, { cut: true });
    return { id: k + 1, a, b, set: s.set, light: s.light ?? SETS[s.set].lights[0], keys: [p.key], dof: p.dof, kicks: (s.kicks ?? []).map((t) => [a / FPS + (t as number), 1] as [number, number]) };
  });
  const flashes = sb.shots.map((s, k) => (s.transition === "flash" ? ranges[k].a : -1)).filter((f) => f >= 0);
  const dips = sb.shots.map((s, k) => (s.transition === "dip" ? ranges[k].a : -1)).filter((f) => f >= 0);
  const timeline: Timeline = {
    total, flashes, dips,
    layersAt: (f) => {
      for (let k = 1; k < sb.shots.length; k++) if (sb.shots[k].transition === "fade") {
        const c = ranges[k].a;
        if (f >= c - FADE / 2 && f < c + FADE / 2) return [{ id: k, alpha: 1 }, { id: k + 1, alpha: (f - (c - FADE / 2) + 1) / (FADE + 1) }];
      }
      const k = ranges.findIndex((r) => f >= r.a && f < r.b);
      return [{ id: (k < 0 ? ranges.length - 1 : k) + 1, alpha: 1 }];
    },
  };
  const director: Director = (shot, f, cam, _built, out) => {
    const s = sb.shots[shot.id - 1], t = f / FPS, t0 = ranges[shot.id - 1].a / FPS, tt = t - t0;
    const posOf = new Map(s.actors.map((a) => [a.who, actorPos(s.set, a, tt)]));
    for (const a of s.actors) {
      const L = lookOf(sb.cast[a.who]), seed = seedOf(a.who), p = posOf.get(a.who)!;
      // base act, then the latest beat at or before now (act replaces, face / gesture override)
      let base: Pose = actPose(a.act ?? "neutral", { ...(a.face ? { expr: a.face } : {}), ...(a.gesture ? { gesture: a.gesture } : {}), ...(a.mode ? { mode: a.mode } : {}) });
      for (const bt of (a.beats ?? []).filter((x) => (x.t ?? 0) <= tt).sort((x, y) => (x.t ?? 0) - (y.t ?? 0))) base = { ...(bt.act ? actPose(bt.act) : base), ...(bt.face ? { expr: bt.face } : {}), ...(bt.gesture ? { gesture: bt.gesture } : {}) };
      const swaps = (a.beats ?? []).map((x) => t0 + (x.t ?? 0));
      const life = { ...idle(t, seed, a.idle ?? 1), blink: lidAt(t, seed, swaps) };
      // voiced lines: the mouth follows the narration's word timings; otherwise the stand-in talking rhythm
      const talking = a.speech?.length ? speakAt(tt, a.speech, seed)
        : (a.talk ?? []).map(([x, y]) => talkAt(t, t0 + x, t0 + y, seed, (base.expr as Expr) ?? "talk")).find((x) => Object.keys(x).length) ?? {};
      const nodTilt = (a.nod ?? []).reduce((acc: number, x) => acc + nodAt(t, t0 + (x as number), 2), 0);
      const shook = (a.shake ?? []).map((x) => shakeAt(t, t0 + (x as number))).find((x) => Object.keys(x).length) ?? {};
      // facing: explicit, or toward the nearest other actor
      let facing: -1 | 0 | 1 = 0;
      if (a.facing === undefined || (typeof a.facing === "string" && a.facing.startsWith("toward:"))) {
        const target = typeof a.facing === "string" ? posOf.get(a.facing.slice(7)) : [...posOf.entries()].filter(([w]) => w !== a.who).map(([, q]) => q).sort((m, n) => Math.hypot(m[0] - p[0], m[2] - p[2]) - Math.hypot(n[0] - p[0], n[2] - p[2]))[0];
        if (target) facing = faceToward(cam.right.x, cam.right.z, [p[0], p[2]], [target[0], target[2]]);
      } else if (typeof a.facing === "number") facing = a.facing;
      const walking = a.walk && tt >= a.walk.t0 && tt <= a.walk.t1;
      if (walking) {
        const p1 = whereOf(s.set, a.walk!.to), p0 = whereOf(s.set, a.at), dist = Math.hypot(p[0] - p0[0], p[2] - p0[2]);
        const dirScreen = (p1[0] - p0[0]) * cam.right.x + (p1[2] - p0[2]) * cam.right.z;
        out.places.push(lookCard(cam, L, p[0], p[1], p[2], { side: { mode: "walk", phase: dist / 1.47, expr: (talking.expr ?? base.expr ?? "neutral") as Expr, blink: life.blink }, mirror: dirScreen < 0 }));
      } else {
        const pose = layer(base, life, talking, shook, { headTilt: nodTilt, facing, back: a.back, t });
        out.places.push(lookCard(cam, L, p[0], p[1], p[2], { pose }));
      }
      contactShadow(out, cam.sun, shot.light, p[0], p[1], p[2]);
    }
    // effects sit beside the head on the side facing the frame centre (a character right of centre gets it on the left)
    for (const fx of s.fx ?? []) {
      const p = posOf.get(fx.on); if (!p) continue;
      const x = (p[0] - cam.pos.x) * cam.right.x + (p[2] - cam.pos.z) * cam.right.z;
      const c = fxNear(cam, fx.kind, p, t, t0 + (fx.t ?? 0), fx.life ?? 1.6, fx.side ?? (x > 0 ? -1 : 1)); if (c) out.fx.push(c);
    }
  };
  return { total, shots, timeline, director, timing };
};
