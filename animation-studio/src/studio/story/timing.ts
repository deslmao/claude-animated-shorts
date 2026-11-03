// Narration timing (stage 2): lays a storyboard's spoken lines end to end (the reference pace: no dead air, the voice
// starts on frame 2), sizes every shot to its lines, turns word anchors ({ word: "catches" }) into times 2 frames
// before that word, and gives speaking actors their word timings (for the mouth). Lines not generated yet use an
// estimate, so a storyboard validates and previews before any credits are spent. Pure: same input -> same timing.
import type { Storyboard, ShotSpec, Line, WordRef } from "./types";
import { Narration, Clip, Word, clipHash, estimateClip, norm } from "../voice/narration";
import { NARRATOR, VOICES } from "../voice/voices";

export const FPS = 30;
export const LEAD = 2 / FPS;      // a cut lands 2 frames before its first word; the voice starts on frame 2
export const LINE_GAP = 0.08;     // breath between consecutive lines (the audio already holds the natural pauses)
export const HOLD = 0.2, END_HOLD = 0.45;
const ANCHOR = 2 / FPS;           // reactions land 2 frames before their word

/** a line placed on the film's clock */
export type Placed = { shot: number; who: string; voice: string; text: string; hash: string; estimated: boolean;
  /** absolute seconds: when the clip's audio file starts / its first word / last word */
  fileAt: number; start: number; end: number; clip: Clip; words: Word[] /* absolute times */ };
export type Timing = { sb: Storyboard; lines: Placed[]; missing: Placed[]; problems: string[]; total: number };

export const linesOf = (s: ShotSpec): Line[] => (s.say === undefined ? [] : (Array.isArray(s.say) ? s.say : [s.say]).map((l) => (typeof l === "string" ? { text: l } : l)));
export const voiceOf = (sb: Storyboard, l: Line) => l.voice ?? sb.voices?.[l.who ?? "narrator"] ?? sb.voice ?? NARRATOR;

/** every line of a storyboard with its voice and cache key (what `npm run voice` needs to generate) */
export const lineList = (sb: Storyboard) => sb.shots.flatMap((s, k) => linesOf(s).map((l) => {
  const voice = voiceOf(sb, l);
  return { shot: k, line: l, voice, hash: VOICES[voice] ? clipHash(voice, l.text) : "", who: l.who ?? "narrator" };
}));

/** resolve narration: returns a copy of the storyboard in which every shot has dur, every When has t, and speaking
 *  actors carry `speech` (their words, seconds into the shot) */
export const resolve = (sb0: Storyboard, narr?: Narration): Timing => {
  const sb: Storyboard = JSON.parse(JSON.stringify(sb0));
  const lines: Placed[] = [], problems: string[] = [];
  let T = 0, cursor = 0;
  sb.shots.forEach((s, k) => {
    const a = T, ls = linesOf(s), here: Placed[] = [];
    cursor = Math.max(cursor, a + LEAD);
    for (const l of ls) {
      const voice = voiceOf(sb, l);
      if (!VOICES[voice]) { problems.push(`shot ${k + 1}: unknown voice "${voice}" (presets: ${Object.keys(VOICES).join(", ")})`); continue; }
      const hash = clipHash(voice, l.text), have = narr?.clips[hash], clip = have ?? estimateClip(voice, l.text);
      cursor += l.gap ?? 0;
      const fileAt = cursor - clip.lead;
      const p: Placed = { shot: k, who: l.who ?? "narrator", voice, text: l.text, hash, estimated: !have, fileAt, start: cursor, end: fileAt + clip.end, clip,
        words: clip.words.map((w) => ({ w: w.w, t0: fileAt + w.t0, t1: fileAt + w.t1 })) };
      here.push(p); lines.push(p);
      cursor = p.end + LINE_GAP;
    }
    const last = k === sb.shots.length - 1;
    const natural = here.length ? here[here.length - 1].end + (s.hold ?? (last ? END_HOLD : HOLD)) - a : 0;
    if (!here.length && s.dur === undefined) problems.push(`shot ${k + 1}: needs a dur (it has no lines to time it)`);
    const frames = Math.max(1, Math.round(Math.max(s.dur ?? 0, natural) * FPS));
    s.dur = frames / FPS;
    // word anchors -> seconds into this shot
    const words = here.flatMap((p) => p.words);
    const at = (r: WordRef, what: string) => {
      const n = r.n ?? 1, key = norm(r.word);
      const exact = words.filter((w) => norm(w.w) === key), pre = words.filter((w) => norm(w.w).startsWith(key));
      const w = (exact.length >= n ? exact : pre)[n - 1];
      if (!w) { problems.push(`shot ${k + 1}: ${what} is anchored to "${r.word}"${n > 1 ? ` #${n}` : ""}, which this shot's lines don't say`); return 0; }
      return Math.max(0, w.t0 - a - ANCHOR);
    };
    const when = (x: { t?: number; word?: string; n?: number }, what: string) => { if (x.word !== undefined) { const t = at({ word: x.word, n: x.n }, what); delete x.word; delete x.n; (x as { t: number }).t = t; } };
    for (const act of s.actors) {
      for (const b of act.beats ?? []) when(b, `${act.who}'s beat`);
      if (act.nod) act.nod = act.nod.map((x) => (typeof x === "number" ? x : at(x, `${act.who}'s nod`)));
      if (act.shake) act.shake = act.shake.map((x) => (typeof x === "number" ? x : at(x, `${act.who}'s head shake`)));
      for (const m of act.moves ?? []) when(m, `${act.who}'s ${m.kind}`);
      if (act.drive) when(act.drive, `${act.who}'s control strokes`);
      if (act.walk?.from) { act.walk.t0 = at(act.walk.from, `${act.who}'s walk`); delete act.walk.from; }
      if (act.walk?.until) { act.walk.t1 = at(act.walk.until, `${act.who}'s walk`); delete act.walk.until; }
      // a speaking actor: mouth follows their words; talking hands over the spans they speak
      const mine = here.filter((p) => p.who === act.who).flatMap((p) => p.words.map((w) => ({ w: w.w, t0: w.t0 - a, t1: w.t1 - a })));
      if (mine.length) {
        (act as { speech?: Word[] }).speech = mine;
        const spans: [number, number][] = [];
        for (const w of mine) { const sp = spans[spans.length - 1]; if (sp && w.t0 - sp[1] < 0.3) sp[1] = w.t1; else spans.push([w.t0, w.t1]); }
        act.talk = [...(act.talk ?? []), ...spans];
      }
    }
    for (const fx of s.fx ?? []) when(fx, `the ${fx.kind} effect`);
    for (const p of s.props ?? []) for (const c of p.drive?.changes ?? []) when(c, `the ${p.id}'s delay change`);
    for (const st of s.diagram?.steps ?? []) when(st, `the ${s.diagram!.kind} diagram's step`);
    for (const x of s.sfx ?? []) when(x, `the ${x.name} sound`);
    if (s.kicks) s.kicks = s.kicks.map((x) => (typeof x === "number" ? x : at(x, "a kick")));
    for (const p of here) if (p.who !== "narrator" && !s.actors.some((x) => x.who === p.who)) problems.push(`shot ${k + 1}: "${p.who}" speaks but isn't in the shot (use who: "narrator" for voice-over)`);
    T = a + s.dur;
  });
  return { sb, lines, missing: lines.filter((l) => l.estimated), problems, total: Math.round(T * FPS) };
};
