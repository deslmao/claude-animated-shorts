// Sound plan (stage 3B): turns a compiled film into what the soundtrack builder needs. Everything is derived from the
// picture, so sounds land on what the viewer sees:
//   music     sections by mood (storyboard `music`, shot `mood`, or chosen from the acting), button on the last word
//   ambience  per shot from set + light (or the shot's `ambience`)
//   effects   effect marks -> their sound; transitions -> swish / whoosh; punch-in close-ups and crane moves; camera
//             kicks -> impact; jumps -> boing; falls -> thud; shock without a mark -> pop; footsteps along every
//             walk / run (surface by set); a tickled actor's laugh -> giggle; a stagger -> stumble; a driven machine ->
//             servo per stroke + feather swish per brush; a crowd raising hands -> "aye!"; a "write" beat -> quill;
//             coins handed over or picked up -> coins; explicit `sfx` cues. Each is panned to where its actor is on screen.
import * as THREE from "three";
import { runKeys } from "../camera/keys";
import { actorPos, FPS } from "../story/compile";
import { PROPS } from "../props/registry";
import { norm } from "../voice/narration";
import type { compile } from "../story/compile";
import type { Storyboard, ActorSpec } from "../story/types";
import { Mood, MOODS, SfxName, ambienceFor, stepFor, FX_SOUND } from "./catalog";

type Film = ReturnType<typeof compile>;
export type Cue = { t: number; name: SfxName; gain_db?: number; pan?: number; why: string };
export type SoundPlan = { sections: [Mood, number, number][] | null; button_t: number; drop_t?: number; musicGain: number; ambience: (string | null)[]; cues: Cue[]; mood: Mood | null; moodWhy: string };

const COMEDY = ["laugh", "happy", "excited", "dazed", "embarrassed", "facepalm", "thumbsUp", "hello"];
const TENSION = ["scared", "shock", "nervous", "angry", "suspicious"];
const THINK = ["explain", "thinking", "idea", "point", "confused"];
const TENDER = ["sad", "relief", "proud"];

/** the music mood a story gets when it doesn't name one: from what its characters do and when it happens */
export const autoMood = (sb: Storyboard): { mood: Mood; why: string } => {
  const acts = sb.shots.flatMap((s) => s.actors.flatMap((a) => [a.act, ...(a.beats ?? []).map((b) => b.act)])).filter(Boolean) as string[];
  const n = (l: string[]) => acts.filter((a) => l.includes(a)).length;
  const c = n(COMEDY), t = n(TENSION), k = n(THINK), w = n(TENDER);
  const night = sb.shots.filter((s) => s.light === "night").length / Math.max(1, sb.shots.length);
  const why = `acting: comedy ${c}, tension ${t}, explaining ${k}, tender ${w}; ${Math.round(night * 100)} % night`;
  if (t >= 2 && t > c) return { mood: night > 0.4 ? "mystery" : "tense", why };
  if (c >= 2 && c >= k) return { mood: "playful", why };
  if (w >= 2 && w > c && w > t) return { mood: "warm", why };
  return { mood: "curious", why };
};

/** screen x (-1 left .. 1 right) of a floor mark at frame f of a shot, for panning */
const screenX = (film: Film, i: number, f: number, m: [number, number, number]) => {
  const c = runKeys(film.shots[i].keys, f), cam = new THREE.PerspectiveCamera(c.fov, 9 / 16, 0.05, 3000);
  cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const v = new THREE.Vector3(m[0], m[1] + 1.2, m[2]).project(cam);
  return v.z > 1 ? 0 : Math.max(-1, Math.min(1, v.x));
};

/** footstep times along a walk / run: one step per half stride cycle of the profile cards */
export const footstepTimes = (set: string, a: ActorSpec, dur: number) => {
  if (!a.walk || a.walk.mode === "ride") return [];
  const out: number[] = [], stride = a.walk.mode === "run" ? 1.04 : 0.735; // half a stride cycle: 2.08 m running, 1.47 m walking
  let last = actorPos(set, a, 0), acc = 0;
  for (let t = 0; t <= Math.min(dur, a.walk.t1 + 0.05); t += 1 / 120) {
    const p = actorPos(set, a, t), d = Math.hypot(p[0] - last[0], p[2] - last[2]);
    acc += d; last = p;
    if (acc >= stride) { out.push(t); acc -= stride; }
  }
  return out;
};

export const soundPlan = (film: Film, sb0: Storyboard): SoundPlan => {
  const sb = film.timing.sb, cues: Cue[] = [];
  const t0s = film.shots.map((s) => s.a / FPS), auto = sb0.autoSfx !== false;
  // music sections
  let mood: Mood | null = null, why = "", gain = 0;
  if (sb0.music === false) why = "music off (storyboard)";
  else if (typeof sb0.music === "string") { mood = sb0.music; why = "named by the storyboard"; }
  else if (sb0.music) { mood = sb0.music.mood; gain = sb0.music.gain ?? 0; why = "named by the storyboard"; }
  else { const a = autoMood(sb0); mood = a.mood; why = `chosen automatically (${a.why})`; }
  let sections: [Mood, number, number][] | null = null;
  if (mood) {
    sections = [];
    sb.shots.forEach((s, i) => {
      const m = s.mood ?? (i === 0 ? mood! : sections![sections!.length - 1][0]);
      if (!sections!.length || m !== sections![sections!.length - 1][0]) sections!.push([m, t0s[i], 0]);
    });
    sections.forEach((x, i) => (x[2] = i + 1 < sections!.length ? sections![i + 1][1] : film.total / FPS));
  }
  const words = film.timing.lines.flatMap((l) => l.words), last = words[words.length - 1];
  // per shot
  const ambience = sb.shots.map((s, i) => (s.ambience === false ? null : s.ambience ?? ambienceFor(s.set, film.shots[i].light)));
  sb.shots.forEach((s, i) => {
    const sh = film.shots[i], T0 = t0s[i], dur = (sh.b - sh.a) / FPS;
    const panOf = (who: string | undefined, t: number) => {
      const a = s.actors.find((x) => x.who === who);
      return a ? screenX(film, i, Math.min(sh.b - 1, sh.a + Math.round(t * FPS)), actorPos(s.set, a, t)) * 0.6 : 0;
    };
    if (auto) {
      if (i > 0 && s.transition === "fade") cues.push({ t: T0 - 0.2, name: "swish_soft", why: `crossfade into shot ${i + 1}` });
      if (i > 0 && s.transition === "flash") cues.push({ t: T0 - 0.05, name: "flash_swish", why: `white flash into shot ${i + 1}` });
      if (i > 0 && s.transition === "dip") cues.push({ t: T0 - 0.35, name: "whoosh_low", why: `dip to black into shot ${i + 1}` });
      if (i > 0 && s.transition === "zoom") cues.push({ t: T0 - 0.3, name: "whoosh_long", gain_db: -4, why: `zoom-through into shot ${i + 1}` });
      if (i > 0 && s.transition === "whip") cues.push({ t: T0 - 0.15, name: "whoosh_short", gain_db: -3, why: `whip pan into shot ${i + 1}` });
      for (const c of s.cams ?? []) if (c.whip) cues.push({ t: T0 + (c.t ?? 0), name: "whoosh_short", gain_db: -6, why: `whip pan, shot ${i + 1}` });
      if (s.camera.move === "closeUp" && s.camera.punch) cues.push({ t: T0 - 0.04, name: "whoosh_short", gain_db: -2, why: `punch-in close-up, shot ${i + 1}` });
      if (s.camera.move === "crane") cues.push({ t: T0 + 0.05, name: "whoosh_long", gain_db: -3, why: `crane move, shot ${i + 1}` });
      for (const fx of s.fx ?? []) {
        const n = FX_SOUND[fx.kind];
        if (n) cues.push({ t: T0 + (fx.t ?? 0), name: n, pan: panOf(fx.on, fx.t ?? 0), why: `${fx.kind} mark on ${fx.on}, shot ${i + 1}` });
      }
      for (const k of s.kicks ?? []) cues.push({ t: T0 + (k as number), name: "impact", why: `camera kick, shot ${i + 1}` });
      // a stepped prop sounds each step (loot streaming into stacks and sliding to its owners: coins)
      for (const q of s.props ?? []) { const snd = PROPS[q.id]?.stepSfx; if (snd) for (const st of q.steps ?? []) cues.push({ t: T0 + (st.t ?? 0) + 0.05, name: snd as SfxName, gain_db: -4, why: `the ${q.id} step, shot ${i + 1}` }); }
      for (const a of s.actors) {
        const fxTimes = (s.fx ?? []).filter((f) => f.on === a.who).map((f) => f.t ?? 0);
        for (const b of a.beats ?? []) if (b.act === "shock" && !fxTimes.some((t) => Math.abs(t - (b.t ?? 0)) < 0.35)) cues.push({ t: T0 + (b.t ?? 0), name: "pop", gain_db: -3, pan: panOf(a.who, b.t ?? 0), why: `${a.who} shocked, shot ${i + 1}` });
        if (a.mode === "jump") cues.push({ t: T0 + 0.1, name: "boing", pan: panOf(a.who, 0.1), why: `${a.who} jumps, shot ${i + 1}` });
        if (a.mode === "fall") cues.push({ t: T0 + 0.35, name: "thud", pan: panOf(a.who, 0.35), why: `${a.who} falls, shot ${i + 1}` });
        // tickling: a tickled actor (someone reaches for them, or a machine follows their hand) giggles when they laugh;
        // a stagger scuffs and thumps
        const tickled = s.actors.some((x) => x.reach === a.who) || (s.props ?? []).some((q) => q.follow?.who === a.who);
        if (tickled) for (const b of a.beats ?? []) if (b.act === "laugh") cues.push({ t: T0 + (b.t ?? 0) + 0.08, name: "giggle", pan: panOf(a.who, b.t ?? 0), why: `${a.who} laughs, tickled, shot ${i + 1}` });
        // signing, paying: a quill on a "write" beat; coins when a purse is handed over ("offer" holding coins) or picked up
        for (const b of a.beats ?? []) {
          if (b.gesture === "write") cues.push({ t: T0 + (b.t ?? 0) + 0.12, name: "quill_scratch", pan: panOf(a.who, b.t ?? 0), why: `${a.who} signs, shot ${i + 1}` });
          if ((b.hold === "coinBag" || b.hold === "coin") && !a.crowd) cues.push({ t: T0 + (b.t ?? 0) + 0.05, name: "coins_pour", pan: panOf(a.who, b.t ?? 0), why: `${a.who} takes the coins, shot ${i + 1}` });
          if (b.gesture === "offer" && (b.hold ?? a.hold) === "coinBag") cues.push({ t: T0 + (b.t ?? 0) + 0.2, name: "coins_pour", pan: panOf(a.who, b.t ?? 0), why: `${a.who} hands over coins, shot ${i + 1}` });
        }
        for (const m of a.moves ?? []) if (m.kind === "stagger") cues.push({ t: T0 + (m.t ?? 0) + 0.15, name: "stumble", pan: panOf(a.who, m.t ?? 0), why: `${a.who} stumbles, shot ${i + 1}` });
        for (const t of footstepTimes(s.set, a, dur)) cues.push({ t: T0 + t, name: stepFor(s.set), pan: panOf(a.who, t), why: `${a.who} ${a.walk?.mode === "run" ? "runs" : "walks"}, shot ${i + 1}` });
      }
    }
    // a crowd voting (raising hands on a word): a chorus of "aye!"
    if (auto) for (const b of s.crowd?.beats ?? []) if (b.gesture === "raiseHand" || b.gesture === "cheer") cues.push({ t: T0 + (b.t ?? 0) + 0.12, name: "crowd_aye", why: `the crowd votes, shot ${i + 1}` });
    // a driven machine (a prop replaying an actor's control strokes): a servo whirr each stroke cycle, and a feather
    // swish each time it brushes across the hand it follows (the strokes the viewer sees, delay included)
    if (auto) for (const q of s.props ?? []) {
      const drv = q.drive ? s.actors.find((x) => x.who === q.drive!.who)?.drive : undefined;
      if (!q.drive || !drv) continue;
      const hz = drv.hz ?? 1.6, d0 = drv.t ?? 0, delayAt = (t: number) => { let d = q.drive!.delay ?? 0; for (const c of q.drive!.changes ?? []) if (t >= (c.t ?? 0)) d = c.delay; return d; };
      let last = -1;
      for (let t = d0; t < dur - 0.1; t += 1 / 120) {
        const h = Math.floor((t - d0 - delayAt(t)) * hz * 2);
        if (h > last && h >= 0) {
          if (h % 2 === 0) cues.push({ t: T0 + t, name: "servo", pan: panOf(q.drive.who, t) * 0.8, why: `${q.id} stroke (servo), shot ${i + 1}` });
          if (q.follow) cues.push({ t: T0 + t + 0.03, name: "feather_swish", pan: panOf(q.follow.who, t), why: `${q.id} brushes ${q.follow.who}'s hand, shot ${i + 1}` });
        }
        if (h > last) last = h;
      }
    }
    for (const x of s.sfx ?? []) cues.push({ t: T0 + (x.t ?? 0), name: x.name, gain_db: x.gain, pan: panOf(x.on, x.t ?? 0), why: `storyboard cue, shot ${i + 1}` });
  });
  // the same sound twice within 120 ms is one sound
  cues.sort((a, b) => a.t - b.t);
  const dedup = cues.filter((c, k) => !cues.slice(0, k).some((d) => d.name === c.name && Math.abs(d.t - c.t) < 0.12));
  // a music drop-out before the punchline: from the end of the named word (n-th occurrence in the whole narration)
  const dw = sb.musicDrop ? words.filter((w) => norm(w.w) === norm(sb.musicDrop!.word))[(sb.musicDrop.n ?? 1) - 1] : undefined;
  return { sections, button_t: last ? last.t0 : film.total / FPS - 1, ...(dw ? { drop_t: dw.t1 } : {}), musicGain: gain, ambience, cues: dedup, mood, moodWhy: why };
};

export const MOOD_NAMES = Object.keys(MOODS) as Mood[];
