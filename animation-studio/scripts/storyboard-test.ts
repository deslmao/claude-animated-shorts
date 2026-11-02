// Storyboard test (no rendering): validates every storyboard in src/stories (names, marks, timings, collisions) and
// checks vertical framing by solving each shot's camera at its start, middle and end and projecting the subjects' heads
// into the 9:16 frame. Also feeds deliberately broken storyboards to the validator to prove it catches mistakes.
//   npm run test:story
import "./lib/dom-stub";
import { STORIES } from "../src/studio/stories";
import { validate } from "../src/studio/story/validate";
import { compile } from "../src/studio/story/compile";
import type { Storyboard } from "../src/studio/story/types";

let bad = 0;
for (const sb of STORIES) {
  const r = validate(sb), secs = sb.shots.reduce((s, x) => s + x.dur, 0);
  console.log(`\n== ${sb.id}: ${sb.shots.length} shots, ${secs.toFixed(1)} s, ${compile(sb).total} frames`);
  for (const l of r.framing) console.log("  " + l);
  for (const w of r.warnings) console.log("  WARN  " + w);
  for (const e of r.errors) console.log("  ERROR " + e);
  if (r.errors.length) bad++;
}

// the validator must reject broken storyboards (otherwise a typo would only show up after a long cloud render)
const base = STORIES[0];
const broken: [string, (sb: Storyboard) => void][] = [
  ["unknown set", (sb) => { sb.shots[0].set = "moon"; }],
  ["unknown mark", (sb) => { sb.shots[0].actors[0].at = "nowhere"; }],
  ["unknown act", (sb) => { (sb.shots[0].actors[0] as { act: string }).act = "moonwalk"; }],
  ["actor not in cast", (sb) => { sb.shots[0].actors[0].who = "zed"; }],
  ["camera on absent actor", (sb) => { sb.shots[1].camera = { move: "closeUp", on: "juno" }; }],
  ["two actors on one mark", (sb) => { sb.shots[0].actors[1].at = sb.shots[0].actors[2].at; }],
  // the close-up is solved where Gus starts; walking 6 m away during the shot takes his head out of frame
  ["head out of frame", (sb) => { const g = sb.shots[1].actors.find((a) => a.who === "gus")!; const p = typeof g.at === "string" ? null : g.at; g.walk = { to: p ? [p[0] + 6, p[1], p[2]] : "d", t0: 0.2, t1: 1.6 }; }],
];
console.log("\n== validator catches mistakes");
for (const [name, mutate] of broken) {
  const sb = JSON.parse(JSON.stringify(base)) as Storyboard; mutate(sb);
  let caught: string;
  try { const r = validate(sb); caught = r.errors[0] ?? ""; } catch (e) { caught = `threw: ${(e as Error).message}`; }
  console.log(`  ${caught ? "ok  " : "MISS"} ${name.padEnd(24)} ${caught}`);
  if (!caught) bad++;
}
console.log(bad ? `\n${bad} problem(s)` : "\nall storyboards valid, all subjects framed, all mistakes caught");
(globalThis as unknown as { process: { exit(n: number): void } }).process.exit(bad ? 1 : 0);
