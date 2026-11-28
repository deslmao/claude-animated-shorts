// Dump every spoken word with its time (seconds into the film): npm run ... node out/words-dump.mjs <story-id> [from-s] [to-s]
import "./lib/dom-stub";
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import { resolve } from "../src/studio/story/timing";
declare const process: { argv: string[] };
const sb = STORIES.find((s) => s.id === process.argv[2])!, lo = Number(process.argv[3] ?? 0), hi = Number(process.argv[4] ?? 1e9);
const t = resolve(sb, NARRATION[sb.id]) as unknown as { lines: { text: string; words?: { w: string; t0: number }[]; t0?: number }[] };
const out: string[] = [];
for (const l of t.lines) for (const w of l.words ?? []) if (w.t0 >= lo && w.t0 <= hi) out.push(`${w.t0.toFixed(2)} ${w.w}`);
console.log(out.join("\n"));
