// Narration timing (stage 2): lays a storyboard's spoken lines end to end (the reference pace: no dead air, the voice
// starts on frame 2), sizes every shot to its lines, turns word anchors ({ word: "catches" }) into times 2 frames
// before that word, and gives speaking actors their word timings (for the mouth). Lines not generated yet use an
// estimate, so a storyboard validates and previews before any credits are spent. Pure: same input -> same timing.
import { ROSTER } from "../characters/roster";
import { extra } from "../characters/cast";
import { anchorsFront } from "../characters/figure";
import { SU } from "../cards/cards";
import type { Storyboard, ShotSpec, Line, WordRef } from "./types";
import { Narration, Clip, Word, clipHash, estimateClip, norm } from "../voice/narration";
import { NARRATOR, VOICES } from "../voice/voices";

/** an "above" panel's lower edge: 0.14 m over its presenter's crown (1.94 m for Juno) */
export const aboveBase = (sb: Storyboard, s: ShotSpec): number | undefined => {
  const ref = s.diagram ? sb.cast[s.diagram.with] : undefined; if (!ref) return undefined;
  const L = typeof ref === "string" ? ROSTER[ref] : extra(ref.extra, ref.era ?? "modern");
  return Math.round(((975 - anchorsFront(L, {}).crown[1]) * SU + 0.14) * 1000) / 1000;
};
export const FPS = 30;
export const LEAD = 2 / FPS;      // a cut lands 2 frames before its first word; the voice starts on frame 2
export const LINE_GAP = 0.08;     // breath between consecutive lines (the audio already holds the natural pauses)
export const HOLD = 0.2, END_HOLD = 0.45;
const ANCHOR = 2 / FPS;           // reactions land 2 frames before their word

/** a line placed on the film's clock */
export type Placed = { shot: number; who: string; voice: string; text: string; hash: string; estimated: boolean;
  /** absolute seconds: when the clip's audio file starts / its first word / last word */
  fileAt: number; start: number; end: number; clip: Clip; words: Word[] /* absolute times */;
  /** a line with pauses: its audio in pieces, file seconds [from, to) placed at absolute time at (absent: the whole file at fileAt) */
  segs?: { from: number; to?: number; at: number }[] };
export type Timing = { sb: Storyboard; lines: Placed[]; missing: Placed[]; problems: string[]; total: number };

export const linesOf = (s: ShotSpec): Line[] => (s.say === undefined ? [] : (Array.isArray(s.say) ? s.say : [s.say]).map((l) => (typeof l === "string" ? { text: l } : l)));
export const voiceOf = (sb: Storyboard, l: Line) => l.voice ?? sb.voices?.[l.who ?? "narrator"] ?? sb.voice ?? NARRATOR;

/** every line of a storyboard with its voice and cache key (what `npm run voice` needs to generate) */
export const lineList = (sb: Storyboard) => sb.shots.flatMap((s, k) => linesOf(s).map((l) => {
  const voice = voiceOf(sb, l);
  return { shot: k, line: l, voice, hash: VOICES[voice] ? clipHash(voice, l.text, l.context) : "", who: l.who ?? "narrator" };
}));

/** pauses inside a line: cut the clip in the gap after each named word (the middle of the silence between that word and
 *  the next, which npm run voice snaps to the measured sound) and shift everything after it; pure */
export const MIN_PAUSE_GAP = 0.04;
const pausedLine = (p: Placed, pauses: NonNullable<Line["pauses"]>, problem: (m: string) => void): Pick<Placed, "segs" | "words" | "end"> => {
  const cw = p.clip.words, cuts: { j: number; s: number; f: number }[] = [];
  for (const q of pauses) {
    const key = norm(q.after), n = q.n ?? 1, hits = cw.map((w, j) => (norm(w.w) === key ? j : -1)).filter((j) => j >= 0), j = hits[n - 1];
    if (j === undefined) { problem(`pause after "${q.after}"${n > 1 ? ` #${n}` : ""}, which the line doesn't say`); continue; }
    if (j === cw.length - 1) { problem(`pause after "${q.after}", the line's last word (use the next line's gap instead)`); continue; }
    if (!(q.s > 0)) { problem(`pause after "${q.after}" needs a length in seconds > 0`); continue; }
    if (cw[j + 1].t0 - cw[j].t1 < MIN_PAUSE_GAP) { problem(`pause after "${q.after}": no silence there to cut in (${Math.round((cw[j + 1].t0 - cw[j].t1) * 1000)} ms)`); continue; }
    if (q.cut !== undefined && !(q.cut >= 0 && q.cut <= 1)) { problem(`pause after "${q.after}": cut must be 0-1 (where in the silence)`); continue; }
    cuts.push({ j, s: q.s, f: q.cut ?? 0.5 });
  }
  cuts.sort((a, b) => a.j - b.j);
  const segs: NonNullable<Placed["segs"]> = [];
  let from = 0, shift = 0;
  const shiftOf = (j: number) => cuts.filter((c) => c.j < j).reduce((t, c) => t + c.s, 0);
  for (const c of cuts) { const cut = cw[c.j].t1 + (cw[c.j + 1].t0 - cw[c.j].t1) * c.f; segs.push({ from, to: cut, at: p.fileAt + from + shift }); from = cut; shift += c.s; }
  segs.push({ from, at: p.fileAt + from + shift });
  return { segs, words: cw.map((w, j) => ({ w: w.w, t0: p.fileAt + w.t0 + shiftOf(j), t1: p.fileAt + w.t1 + shiftOf(j) })), end: p.end + shift };
};

/** resolve narration: returns a copy of the storyboard in which every shot has dur, every When has t, and speaking
 *  actors carry `speech` (their words, seconds into the shot) */
export const resolve = (sb0: Storyboard, narr?: Narration): Timing => {
  const sb: Storyboard = JSON.parse(JSON.stringify(sb0));
  const lines: Placed[] = [], problems: string[] = [];
  let T = 0, cursor = 0;
  let carry: Placed[] = []; // a split line continuing into the next (cont) shot
  sb.shots.forEach((s, k) => {
    const a = T, ls = linesOf(s), here: Placed[] = s.cont ? [...carry] : [];
    if (s.cont && !carry.length) problems.push(`shot ${k + 1}: cont: true, but the shot before doesn't end with \`until\` mid-line`);
    if (s.cont && ls.length) problems.push(`shot ${k + 1}: a cont shot carries on the previous line; it can't have its own say`);
    cursor = Math.max(cursor, a + LEAD);
    for (const l of ls) {
      const voice = voiceOf(sb, l);
      if (!VOICES[voice]) { problems.push(`shot ${k + 1}: unknown voice "${voice}" (presets: ${Object.keys(VOICES).join(", ")})`); continue; }
      const hash = clipHash(voice, l.text, l.context), have = narr?.clips[hash], clip = have ?? estimateClip(voice, l.text);
      cursor += l.gap ?? 0;
      const fileAt = cursor - clip.lead;
      const p: Placed = { shot: k, who: l.who ?? "narrator", voice, text: l.text, hash, estimated: !have, fileAt, start: cursor, end: fileAt + clip.end, clip,
        words: clip.words.map((w) => ({ w: w.w, t0: fileAt + w.t0, t1: fileAt + w.t1 })) };
      if (l.pauses?.length) Object.assign(p, pausedLine(p, l.pauses, (m) => problems.push(`shot ${k + 1}: ${m}`)));
      here.push(p); lines.push(p);
      cursor = p.end + LINE_GAP;
    }
    const last = k === sb.shots.length - 1;
    let natural = here.length ? here[here.length - 1].end + (s.hold ?? (last ? END_HOLD : HOLD)) - a : 0;
    carry = [];
    if (s.until) { // split: the shot ends on this word (the next shot carries on with the line)
      const all = here.flatMap((p) => p.words), key = norm(s.until.word), n = s.until.n ?? 1;
      const w = (all.filter((x) => norm(x.w) === key).length >= n ? all.filter((x) => norm(x.w) === key) : all.filter((x) => norm(x.w).startsWith(key)))[n - 1];
      if (!w) problems.push(`shot ${k + 1}: until "${s.until.word}", which this shot's lines don't say`);
      else { natural = Math.max(0.3, w.t0 - ANCHOR - a); carry = here; }
      if (last || !sb.shots[k + 1]?.cont) problems.push(`shot ${k + 1}: ends with until, so shot ${k + 2} must have cont: true`);
    }
    if (!here.length && s.dur === undefined) problems.push(`shot ${k + 1}: needs a dur (it has no lines to time it)`);
    const frames = Math.max(1, Math.round((s.until ? natural : Math.max(s.dur ?? 0, natural)) * FPS));
    s.dur = frames / FPS;
    // word anchors -> seconds into this shot
    // word anchors: this shot's words (a cont shot: only those after its start, the rest of the split line)
    const words = here.flatMap((p) => p.words).filter((w) => !s.cont || w.t0 >= a - 0.05);
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
    for (const b of s.crowd?.beats ?? []) when(b, "the crowd's beat");
    for (const c of s.cams ?? []) when(c, `a camera beat (${c.move})`);
    for (const fx of s.fx ?? []) when(fx, `the ${fx.kind} effect`);
    for (const p of s.props ?? []) for (const c of p.drive?.changes ?? []) when(c, `the ${p.id}'s delay change`);
    for (const p of s.props ?? []) for (const c of p.steps ?? []) when(c, `the ${p.id}'s step`);
    for (const st of s.diagram?.steps ?? []) when(st, `the ${s.diagram!.kind} diagram's step`);
    if (s.diagram?.place === "above" && s.diagram.base === undefined) { const b = aboveBase(sb, s); if (b !== undefined) s.diagram.base = b; }
    for (const x of s.sfx ?? []) when(x, `the ${x.name} sound`);
    if (s.kicks) s.kicks = s.kicks.map((x) => (typeof x === "number" ? x : at(x, "a kick")));
    for (const p of here) if (p.who !== "narrator" && !s.actors.some((x) => x.who === p.who)) problems.push(`shot ${k + 1}: "${p.who}" speaks but isn't in the shot (use who: "narrator" for voice-over)`);
    T = a + s.dur;
  });
  return { sb, lines, missing: lines.filter((l) => l.estimated), problems, total: Math.round(T * FPS) };
};
