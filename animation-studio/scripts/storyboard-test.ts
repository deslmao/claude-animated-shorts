// Storyboard test (no rendering): validates every storyboard in src/stories (names, marks, timings, collisions) and
// checks vertical framing by solving each shot's camera at its start, middle and end and projecting the subjects' heads
// into the 9:16 frame, checks the narration timing (from the story's manifest, or estimated before generation) and the
// captions. Also feeds deliberately broken storyboards to the validator to prove it catches mistakes.
//   npm run test:story
import "./lib/dom-stub";
import { STORIES } from "../src/studio/stories";
import { validate } from "../src/studio/story/validate";
import { compile } from "../src/studio/story/compile";
import { captionGroups } from "../src/studio/story/caption-timing";
import { captionHeights } from "../src/studio/story/caption-place";
import { NARRATION } from "../src/studio/stories/voice";
import fs from "node:fs";
import { soundtrackFingerprint, SoundtrackInfo } from "../src/studio/story/fingerprint";
import type { Storyboard } from "../src/studio/story/types";

let bad = 0;
for (const sb of STORIES) {
  const narr = NARRATION[sb.id], r = validate(sb, narr), film = compile(sb, narr), tm = film.timing;
  console.log(`\n== ${sb.id}: ${sb.shots.length} shots, ${(film.total / 30).toFixed(2)} s, ${film.total} frames, narration: ${tm.lines.length ? (tm.missing.length ? `${tm.missing.length}/${tm.lines.length} lines estimated` : `all ${tm.lines.length} lines generated`) : "none"}`);
  tm.sb.shots.forEach((s, k) => { const ls = tm.lines.filter((l) => l.shot === k); console.log(`  shot ${k + 1}  ${(s.dur ?? 0).toFixed(2)} s  ${ls.map((l) => `${l.who === "narrator" ? "" : l.who + ": "}"${l.text}" @${l.start.toFixed(2)}-${l.end.toFixed(2)}`).join(" / ") || "(no lines)"}`); });
  // captions: every spoken word is captioned once, groups are in order and never overlap
  if (sb.captions !== false && tm.lines.length) {
    const g = captionGroups(tm.lines, film.total), nw = tm.lines.reduce((n, l) => n + l.words.length, 0), cw = g.reduce((n, x) => n + x.text.split(" ").length, 0);
    const ok = cw === nw && g.every((x, i) => x.f1 > x.f0 && (i === 0 || x.f0 >= g[i - 1].f1) && x.f1 <= film.total);
    console.log(`  captions: ${g.length} groups for ${nw} words, ${ok ? "in order, no overlaps" : "PROBLEM"}`);
    console.log(`  caption height per shot (clear of every face): ${captionHeights(film).map((y) => `${Math.round(y * 100)}%`).join(", ")}`);
    if (!ok) bad++;
  }
  // soundtrack status (information; npm run preflight makes it a hard requirement before rendering)
  const info = `audio/Short-${sb.id}.json`;
  if (!fs.existsSync(info)) console.log("  soundtrack: none yet");
  else { const j = JSON.parse(fs.readFileSync(info, "utf8")) as SoundtrackInfo; console.log(`  soundtrack: ${j.fingerprint === soundtrackFingerprint(sb, narr, j.engine) && j.frames === film.total ? "up to date" : "STALE (rebuild before rendering)"}`); }
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
  // an extreme 0.5 rad dutch tilt on a close two-shot swings a head out of the 9:16 frame
  ["unknown voice", (sb) => { sb.voice = "gandalf"; }],
  ["anchor word not said", (sb) => { const s = sb.shots.find((x) => x.say)!; s.fx = [{ kind: "idea", on: s.actors[0].who, word: "zebra" }]; }],
  ["speaker not in shot", (sb) => { const s = sb.shots.find((x) => x.say && Object.keys(sb.cast).some((c) => !x.actors.some((a) => a.who === c)))!; const absent = Object.keys(sb.cast).find((c) => !s.actors.some((a) => a.who === c))!; const l = Array.isArray(s.say) ? s.say[0] : s.say!; s.say = { text: typeof l === "string" ? l : l.text, who: absent }; }],
  ["head out of frame", (sb) => { sb.shots[4].camera = { move: "frame", on: ["milo", "gus"], size: "extreme", roll: 0.9 }; }], // an extreme close two-shot rolled 0.9 rad cannot hold both heads
];
console.log("\n== validator catches mistakes");
for (const [name, mutate] of broken) {
  const sb = JSON.parse(JSON.stringify(base)) as Storyboard; mutate(sb);
  let caught: string;
  try { const r = validate(sb, NARRATION[sb.id]); caught = r.errors[0] ?? ""; } catch (e) { caught = `threw: ${(e as Error).message}`; }
  console.log(`  ${caught ? "ok  " : "MISS"} ${name.padEnd(24)} ${caught}`);
  if (!caught) bad++;
}
console.log(bad ? `\n${bad} problem(s)` : "\nall storyboards valid, all subjects framed, all mistakes caught");
(globalThis as unknown as { process: { exit(n: number): void } }).process.exit(bad ? 1 : 0);
