// Pre-render check (stage 3A):  npm run preflight -- <CompositionId>
// Run by the cloud render before anything is bundled or rendered, and by `npm run short`. For a storyboard Short
// ("Short-<id>") it refuses to render when:
//   - the storyboard has validation errors (names, framing, timing, word anchors, speakers)
//   - the Short has no narration, or any line has no generated audio yet (timing would be an estimate)
//   - the soundtrack audio/Short-<id>.mp3 or its fingerprint file audio/Short-<id>.json is missing
//   - the soundtrack was built from a different storyboard / narration (stale), or for a different length
// Other compositions (BridgeShort, test compositions) are not storyboards: nothing to check, exit 0.
import "./lib/dom-stub";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { STORIES } from "../src/studio/stories";
import { NARRATION } from "../src/studio/stories/voice";
import { validate } from "../src/studio/story/validate";
import { compile } from "../src/studio/story/compile";
import { soundtrackFingerprint, SoundtrackInfo } from "../src/studio/story/fingerprint";

const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const comp = proc.process.argv[2];
if (!comp) { console.error("usage: npm run preflight -- <CompositionId>"); proc.process.exit(2); }
if (!comp.startsWith("Short-")) { console.log(`preflight ${comp}: not a storyboard Short, no storyboard checks apply`); proc.process.exit(0); }

const id = comp.slice("Short-".length), problems: string[] = [], notes: string[] = [];
const found = STORIES.find((s) => s.id === id);
if (!found) { console.log(`preflight ${comp}: FAIL\n  no storyboard "${id}" in src/studio/stories (stories: ${STORIES.map((s) => s.id).join(", ")})`); proc.process.exit(1); }
const sb = found!, narr = NARRATION[id], r = validate(sb, narr);
problems.push(...r.errors.map((e) => `storyboard: ${e}`));
const film = compile(sb, narr), tm = film.timing, secs = film.total / 30;
if (!tm.lines.length) problems.push("the Short has no narration (no `say` lines)");
if (tm.missing.length) problems.push(`${tm.missing.length} of ${tm.lines.length} narration lines have no generated audio (run: npm run voice -- ${id} --generate, after approving the cost)`);
const AUDIO = `audio/${comp}.mp3`, INFO = `audio/${comp}.json`;
if (!fs.existsSync(AUDIO)) problems.push(`soundtrack ${AUDIO} is missing (run: npm run voice -- ${id})`);
if (!fs.existsSync(INFO)) problems.push(`soundtrack fingerprint ${INFO} is missing (rebuild the soundtrack: npm run voice -- ${id})`);
else {
  const info = JSON.parse(fs.readFileSync(INFO, "utf8")) as SoundtrackInfo;
  const want = soundtrackFingerprint(sb, narr, info.engine);
  if (info.fingerprint !== want) problems.push(`soundtrack is STALE: built from a different storyboard or narration (rebuild: npm run voice -- ${id})`);
  if (info.frames !== film.total) problems.push(`soundtrack was built for ${info.frames} frames, the film is ${film.total} frames`);
  notes.push(`soundtrack built ${info.built}, ${info.lines} lines, ${info.seconds.toFixed(3)} s${info.lufs !== undefined ? `, ${info.lufs.toFixed(1)} LUFS` : ""}`);
}
if (fs.existsSync(AUDIO)) {
  const p = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", AUDIO]);
  const d = p.status === 0 ? Number(p.stdout.toString().trim()) : NaN;
  if (Number.isFinite(d) && Math.abs(d - secs) > 0.1) problems.push(`soundtrack lasts ${d.toFixed(3)} s, the film ${secs.toFixed(3)} s`);
  else if (!Number.isFinite(d)) notes.push("ffprobe not available: audio length checked via the fingerprint file only");
}
for (const w of r.warnings) notes.push(`warning: ${w}`);
console.log(`preflight ${comp}: ${problems.length ? "FAIL" : "PASS"}  (${film.total} frames = ${secs.toFixed(2)} s, ${sb.shots.length} shots, ${tm.lines.length} narration lines)`);
for (const p of problems) console.log(`  FAIL  ${p}`);
for (const n of notes) console.log(`  note  ${n}`);
proc.process.exit(problems.length ? 1 : 0);
