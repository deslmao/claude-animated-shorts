// Pauses inside a line (Video 04 narration timing pass). No audio, no rendering:
//   a pause after a word shifts every later word (and the line's end) by its length, leaves the earlier words alone,
//   cuts the clip into pieces that cover the file exactly once, honours `cut` (where in the silence), and the
//   validator reports pauses it can't make (unknown word, last word, no silence, bad cut). A line without pauses is
//   placed exactly as before (no segs). The real Video 04 narration is checked too.
import "./lib/dom-stub";
import { resolve, MIN_PAUSE_GAP } from "../src/studio/story/timing";
import { clipHash, type Narration } from "../src/studio/voice/narration";
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import type { Storyboard, LinePause } from "../src/studio/story/types";
const proc = (globalThis as unknown as { process: { exit(n: number): void } }).process;
let fails = 0;
const ok = (c: boolean, m: string) => { console.log(`${c ? "ok  " : "FAIL"}  ${m}`); if (!c) fails++; };

// a synthetic generated clip: "One two. Three four." with a 0.30 s silence after "two." and 0.02 s after "One"
const text = "One two. Three four.", voice = "george", hash = clipHash(voice, text);
const words = [{ w: "One", t0: 0.1, t1: 0.4 }, { w: "two.", t0: 0.42, t1: 0.8 }, { w: "Three", t0: 1.1, t1: 1.5 }, { w: "four.", t0: 1.55, t1: 2.0 }];
const narr: Narration = { id: "t", clips: { [hash]: { hash, text, voice, lead: 0.1, end: 2.0, dur: 2.2, words } } } as Narration;
const sbOf = (pauses?: LinePause[]): Storyboard => ({ id: "t", title: "t", cast: { milo: "milo" },
  shots: [{ say: pauses ? { text, pauses } : text, set: "apartment", camera: { move: "frame", on: ["milo"], size: "medium" }, actors: [{ who: "milo", at: "livingA" }] }] } as unknown as Storyboard);

const plain = resolve(sbOf(), narr).lines[0], paused = resolve(sbOf([{ after: "two", s: 0.5 }]), narr).lines[0];
ok(!plain.segs, "a line without pauses has no pieces (placed exactly as before)");
ok(paused.words[0].t0 === plain.words[0].t0 && paused.words[1].t1 === plain.words[1].t1, "words before the pause keep their times");
ok(Math.abs(paused.words[2].t0 - plain.words[2].t0 - 0.5) < 1e-9 && Math.abs(paused.words[3].t1 - plain.words[3].t1 - 0.5) < 1e-9, "words after the pause move by its length (0.5 s)");
ok(Math.abs(paused.end - plain.end - 0.5) < 1e-9, "the line ends 0.5 s later");
const sg = paused.segs ?? [];
ok(sg.length === 2 && sg[0].from === 0 && sg[0].to === sg[1].from && sg[1].to === undefined, "two pieces cover the clip exactly once");
ok(Math.abs((sg[0].to ?? 0) - 0.95) < 1e-9 && Math.abs(sg[1].at - (plain.fileAt + 0.95 + 0.5)) < 1e-9, "the cut is in the middle of the silence and the second piece starts 0.5 s later");
const early = resolve(sbOf([{ after: "two", s: 0.5, cut: 0.1 }]), narr).lines[0].segs ?? [];
ok(Math.abs((early[0]?.to ?? 0) - 0.83) < 1e-9, "cut: 0.1 cuts early in the silence (off a breath)");
const two = resolve(sbOf([{ after: "four", s: 0.3 }, { after: "One", s: 0.3 }, { after: "nine", s: 0.2 }, { after: "two", s: 0.4, cut: 2 }]), narr);
ok(two.problems.some((p) => p.includes('"four"') && p.includes("last word")), "a pause after the last word is reported (use the next line's gap)");
ok(two.problems.some((p) => p.includes('"One"') && p.includes("no silence")), `a pause where there is no silence (< ${MIN_PAUSE_GAP * 1000} ms) is reported`);
ok(two.problems.some((p) => p.includes('"nine"')), "a pause after a word the line doesn't say is reported");
ok(two.problems.some((p) => p.includes("cut must be 0-1")), "a cut outside 0-1 is reported");

// the real Video 04 narration
const sb = STORIES.find((s) => s.id === "marathon-1904");
if (sb && NARRATION[sb.id]) {
  const tm = resolve(sb, NARRATION[sb.id]);
  ok(tm.problems.length === 0, "marathon-1904: its pauses resolve without problems");
  ok(tm.lines.filter((l) => l.segs).length === 3, "marathon-1904: three lines carry pauses (hook, Carvajal, ending)");
}
console.log(fails ? `\n${fails} pause test(s) failed` : "\nline pauses ok");
if (fails) proc.exit(1);
