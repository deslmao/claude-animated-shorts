// Soundtrack for a storyboard (stage 3B):  npm run sound -- <story-id>
// Builds audio/Short-<id>.mp3 from the generated narration + automatic music, ambience and sound effects (free: all
// synthesized here, no API). Needs every narration line generated first (npm run voice). Writes:
//   audio/Short-<id>.mp3        the soundtrack (-14 LUFS, 48 kHz stereo, exactly the film's length)
//   audio/Short-<id>.json       its fingerprint (ties it to this storyboard + narration; checked by npm run preflight)
//   audio/Short-<id>.cues.md    cue sheet: every music section, ambience and effect with its time and reason
//   npm run sound -- --catalog  print the sound catalogue as JSON (used by npm run test:sound)
import "./lib/dom-stub";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import { compile } from "../src/studio/story/compile";
import { validate } from "../src/studio/story/validate";
import { soundtrackFingerprint, SOUNDTRACK_ENGINE } from "../src/studio/story/fingerprint";
import { soundPlan } from "../src/studio/sound/cues";
import { MOODS, AMBIENCES, SFX } from "../src/studio/sound/catalog";

const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const arg = proc.process.argv[2];
if (arg === "--catalog") { console.log(JSON.stringify({ moods: Object.keys(MOODS), ambience: Object.keys(AMBIENCES), sfx: Object.keys(SFX) })); proc.process.exit(0); }
const fail = (m: string): never => { console.error(`sound: ${m}`); return proc.process.exit(1); };
const sb = STORIES.find((s) => s.id === arg) ?? fail(`usage: npm run sound -- <story-id>   (stories: ${STORIES.map((s) => s.id).join(", ")})`);
const narr = NARRATION[sb.id], r = validate(sb, narr);
if (r.errors.length) fail(`storyboard errors (fix first):\n  ${r.errors.join("\n  ")}`);
const film = compile(sb, narr), tm = film.timing;
if (!tm.lines.length) fail("the storyboard has no narration");
if (tm.missing.length) fail(`${tm.missing.length} narration line(s) not generated yet: run npm run voice -- ${sb.id} (dry run shows the cost)`);

const plan = soundPlan(film, sb), comp = `Short-${sb.id}`;
const seed = parseInt(soundtrackFingerprint({ ...sb, shots: [] }, undefined, "seed").slice(0, 7), 16);
const job = {
  id: sb.id, composition: comp, frames: film.total, seconds: film.total / 30, seed,
  fingerprint: soundtrackFingerprint(sb, narr), engine: SOUNDTRACK_ENGINE,
  voice: tm.lines.map((l) => ({ file: `voice/cache/${l.hash}.mp3`, at: l.fileAt })),
  words: tm.lines.flatMap((l) => l.words.map((w) => [w.t0, w.t1])),
  shots: film.shots.map((s, i) => ({ t0: s.a / 30, t1: s.b / 30, ambience: plan.ambience[i] })),
  music: plan.sections ? { sections: plan.sections, button_t: plan.button_t, gain_db: plan.musicGain } : null,
  cues: plan.cues,
  out: `audio/${comp}.mp3`, info: `audio/${comp}.json`, cuesheet: `audio/${comp}.cues.md`,
};
fs.mkdirSync("out/sound", { recursive: true });
const planFile = `out/sound/${sb.id}.plan.json`;
fs.writeFileSync(planFile, JSON.stringify(job, null, 1));
console.log(`\n${comp}: ${film.total} frames, ${tm.lines.length} narration lines`);
console.log(`music     ${plan.sections ? plan.sections.map(([m, a, b]) => `${m} ${a.toFixed(1)}-${b.toFixed(1)} s`).join(" | ") : "none"}  (${plan.moodWhy})`);
console.log(`ambience  ${[...new Set(plan.ambience.filter(Boolean))].join(", ") || "none"}`);
console.log(`effects   ${plan.cues.length} cues: ${Object.entries(plan.cues.reduce((m, c) => ({ ...m, [c.name]: (m[c.name] ?? 0) + 1 }), {} as Record<string, number>)).map(([k, v]) => `${k} x${v}`).join(", ")}`);
const py = spawnSync("python3", ["sound/build.py", planFile], { stdio: "inherit" });
if (py.status !== 0) fail("the soundtrack builder failed (see above)");
console.log(`\nnext: npm run preflight -- ${comp}, then render it (the soundtrack is picked up automatically)`);
