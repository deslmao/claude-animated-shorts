// Captions (stage 2): the narration's words -> caption groups on the film's frame clock. The reference style: one word,
// sometimes 2-3, hard swaps on the words (references/STYLE_BIBLE.md); captions are ON by default (channel decision).
// Pure: the same words always give the same groups, so chunked renders agree.
import type { Placed } from "./timing";

/** y = caption centre height as a fraction of the frame (set by caption-place.ts; default lower-middle) */
/** sub = a translated subtitle (a whole sentence, wrapped, smaller) */
export type CaptionGroup = { f0: number; f1: number; text: string; who: string; y?: number; sub?: boolean; voice?: string };

const FPS = 30;
const MAX_WORDS = 3, MAX_CHARS = 14, BREAK_GAP = 0.3, HIDE_GAP = 0.6;
const ends = (w: string) => /[.!?;:…—,]["')\]]*$/.test(w);
/** words as shown: keep ? ! and apostrophes, drop trailing commas / full stops (they read as noise on screen) */
const shown = (w: string) => w.replace(/[.,;:…]+(["')\]]*)$/, "$1").replace(/^["'(]+|["')]+$/g, "");

export const captionGroups = (lines: Placed[], total: number): CaptionGroup[] => {
  const words = lines.filter((l) => l.sub === undefined).flatMap((l) => l.words.map((w) => ({ ...w, who: l.who, voice: l.voice })));
  // translated lines: one subtitle for the whole line, from its first word to 0.4 s after its last
  const subs: CaptionGroup[] = lines.filter((l) => l.sub && l.words.length).map((l) => ({ f0: Math.max(0, Math.round(l.words[0].t0 * FPS) - 1), f1: Math.min(total, Math.round((l.words[l.words.length - 1].t1 + 0.4) * FPS)), text: l.sub!, who: l.who, sub: true }));
  const groups: { ws: typeof words }[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i], g = groups[groups.length - 1], prev = words[i - 1];
    const len = g ? g.ws.reduce((n, x) => n + shown(x.w).length + 1, 0) + shown(w.w).length : 0;
    const join = g && prev && g.ws.length < MAX_WORDS && len <= MAX_CHARS && !ends(prev.w) && w.t0 - prev.t1 < BREAK_GAP && w.who === prev.who && w.voice === prev.voice;
    if (join) g.ws.push(w); else groups.push({ ws: [w] });
  }
  const out = groups.map((g, k) => {
    const first = g.ws[0], last = g.ws[g.ws.length - 1], next = groups[k + 1]?.ws[0];
    const f0 = Math.max(0, Math.round(first.t0 * FPS) - 1);                       // on screen a frame before the word
    const hold = Math.round((last.t1 + 0.25) * FPS);
    const f1 = next ? (next.t0 - last.t1 > HIDE_GAP ? hold : Math.max(f0 + 2, Math.round(next.t0 * FPS) - 1)) : Math.min(total, Math.round((last.t1 + 0.4) * FPS));
    return { f0, f1: Math.max(f0 + 2, f1), text: g.ws.map((x) => shown(x.w)).join(" "), who: first.who, voice: first.voice } as CaptionGroup;
  });
  return [...out, ...subs].sort((p, q) => p.f0 - q.f0);
};
