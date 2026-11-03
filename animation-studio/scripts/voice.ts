// Narration for a storyboard (stage 2):  npm run voice -- <story-id> [--generate]
//   1. lists the story's spoken lines and which are already generated (voice/cache/<hash>.mp3 + .json)
//   2. with --generate: creates ONLY the missing lines with ElevenLabs (text-to-speech with character timestamps);
//      without it, a dry run: prints what would be generated and the credit cost, spends nothing
//   3. writes the word-timing manifest src/studio/stories/voice/<id>.ts (the engine times shots, word anchors,
//      mouths and captions from it) and the registry index.ts
//   4. mixes the full-length soundtrack audio/Short-<id>.mp3 (every line at its place, -14 LUFS, 48 kHz stereo,
//      exactly the film's length): the cloud render farm adds it to Short-<id> automatically.
// Credentials: none in code or files. The ElevenLabs key is the environment's network secret, added by the network
// proxy to requests to api.elevenlabs.io; a local ELEVENLABS_API_KEY env var (e.g. from .env) is used if present.
// The key is never printed, logged or written anywhere.
import "./lib/dom-stub";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { STORIES } from "../src/studio/stories";
import { lineList, resolve, FPS } from "../src/studio/story/timing";
import { VOICES } from "../src/studio/voice/voices";
import { requestOf, wordsFromAlignment, clipHash, Narration, Clip } from "../src/studio/voice/narration";

const proc = globalThis as unknown as { process: { argv: string[]; env: Record<string, string | undefined>; exit(n: number): never } };
const args = proc.process.argv.slice(2), id = args.find((a) => !a.startsWith("--")), GENERATE = args.includes("--generate");
const fail = (m: string): never => { console.error(`voice: ${m}`); return proc.process.exit(1); };
if (!id) fail(`usage: npm run voice -- <story-id> [--generate]   (stories: ${STORIES.map((s) => s.id).join(", ")})`);
const sb = STORIES.find((s) => s.id === id) ?? fail(`no story "${id}" (stories: ${STORIES.map((s) => s.id).join(", ")})`);

const CACHE = "voice/cache", MANIFESTS = "src/studio/stories/voice", OUT = `audio/Short-${sb.id}.mp3`;
fs.mkdirSync(CACHE, { recursive: true });
const run = (cmd: string, a: string[]) => { const r = spawnSync(cmd, a, { maxBuffer: 1 << 28 }); if (r.status !== 0) fail(`${cmd} failed: ${r.stderr?.toString().slice(-600)}`); return r; };
const durOf = (f: string) => Number(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).stdout.toString().trim());
const mask = (s: string) => s.replace(/sk_[A-Za-z0-9]+/g, "sk_***");

// 0. keep the cache keyed by the current fingerprint: a cached line whose voice, model, settings and text still match
//    a preset is renamed to its current key (no regeneration when the key scheme changes)
for (const f of fs.readdirSync(CACHE).filter((x: string) => x.endsWith(".json"))) {
  const c = JSON.parse(fs.readFileSync(`${CACHE}/${f}`, "utf8")), p = VOICES[c.voice];
  if (!p || p.voiceId !== c.voiceId || p.model !== c.model || JSON.stringify(p.settings) !== JSON.stringify(c.settings)) continue;
  const h = clipHash(c.voice, c.text), old = f.slice(0, -5);
  if (h === old || fs.existsSync(`${CACHE}/${h}.json`)) continue;
  fs.renameSync(`${CACHE}/${old}.mp3`, `${CACHE}/${h}.mp3`);
  fs.writeFileSync(`${CACHE}/${h}.json`, JSON.stringify({ ...c, hash: h }, null, 1)); fs.unlinkSync(`${CACHE}/${f}`);
  console.log(`  re-keyed cached line ${old} -> ${h}`);
}

// 1. what is needed
const lines = lineList(sb);
for (const l of lines) if (!l.hash) fail(`shot ${l.shot + 1}: unknown voice preset "${l.voice}" (presets: ${Object.keys(VOICES).join(", ")})`);
const unique = [...new Map(lines.map((l) => [l.hash, l])).values()];
const have = (h: string) => fs.existsSync(`${CACHE}/${h}.mp3`) && fs.existsSync(`${CACHE}/${h}.json`);
const todo = unique.filter((l) => !have(l.hash));
console.log(`\n${sb.id}: ${lines.length} lines, ${unique.length} distinct, ${unique.length - todo.length} already generated, ${todo.length} new`);
for (const l of lines) console.log(`  ${have(l.hash) ? "cached" : "NEW   "}  shot ${String(l.shot + 1).padStart(2)}  ${l.voice.padEnd(8)} ${l.who.padEnd(9)} "${l.line.text}"`);
const chars = todo.reduce((n, l) => n + l.line.text.length, 0);
if (todo.length && !GENERATE) {
  console.log(`\ndry run: ${todo.length} new lines, ${chars} characters (about ${chars} credits on ${[...new Set(todo.map((l) => VOICES[l.voice].model))].join(", ")}).`);
  console.log(`nothing was generated. To create them: npm run voice -- ${sb.id} --generate`);
  proc.process.exit(0);
}

// 2. generate the missing lines (one request each, sequentially)
const key = proc.process.env.ELEVENLABS_API_KEY;
for (const l of todo) {
  const p = VOICES[l.voice];
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${p.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST", headers: { "Content-Type": "application/json", ...(key ? { "xi-api-key": key } : {}) }, body: JSON.stringify(requestOf(p, l.line.text)),
  });
  const body = await res.text();
  if (!res.ok) {
    let why = body.slice(0, 200);
    try { const d = JSON.parse(body).detail; why = typeof d === "string" ? d : `${d?.status ?? ""} ${d?.message ?? ""}`; } catch { /* keep text */ }
    fail(`ElevenLabs refused "${l.line.text.slice(0, 40)}..." (HTTP ${res.status}): ${mask(why)}`);
  }
  const d = JSON.parse(body) as { audio_base64: string; alignment: Parameters<typeof wordsFromAlignment>[0] };
  const mp3 = `${CACHE}/${l.hash}.mp3`;
  fs.writeFileSync(mp3, Buffer.from(d.audio_base64, "base64"));
  const words = wordsFromAlignment(d.alignment);
  const clip: Clip = { hash: l.hash, text: l.line.text, voice: l.voice, lead: words[0]?.t0 ?? 0, end: words[words.length - 1]?.t1 ?? 0, dur: durOf(mp3), words };
  fs.writeFileSync(`${CACHE}/${l.hash}.json`, JSON.stringify({ ...clip, voiceId: p.voiceId, model: p.model, settings: p.settings, created: new Date().toISOString() }, null, 1));
  console.log(`  generated ${l.hash}  ${clip.dur.toFixed(2)} s  ${words.length} words  "${l.line.text.slice(0, 50)}"`);
}

// 3. manifest + registry
const clips: Record<string, Clip> = {};
// ElevenLabs' character timings put pauses partly inside the neighbouring words (the first letter is always at
// 0.00 s; after a full stop the next word "starts" ~0.2 s before it is heard). Snap word edges that fall inside a
// measured silence (-40 dB, >= 80 ms) to the edge of the actual sound, so captions and mouths follow the voice.
const silencesOf = (f: string) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-af", "silencedetect=noise=-40dB:d=0.08", "-f", "null", "-"]).stderr.toString();
  const st = [...r.matchAll(/silence_start: (-?[\d.]+)/g)].map((m) => Math.max(0, Number(m[1]))), en = [...r.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]));
  return st.map((a, i) => [a, en[i] ?? Infinity] as [number, number]);
};
let snapped = 0;
for (const l of unique) {
  const c = JSON.parse(fs.readFileSync(`${CACHE}/${l.hash}.json`, "utf8")), words: Clip["words"] = c.words.map((w: Clip["words"][number]) => ({ ...w }));
  const quiet = silencesOf(`${CACHE}/${l.hash}.mp3`);
  for (const w of words) {
    const a = quiet.find(([x, y]) => w.t0 >= x && w.t0 < y), b = quiet.find(([x, y]) => w.t1 > x && w.t1 <= y + 0.05);
    if (a && a[1] - 0.02 < w.t1 - 0.05) { w.t0 = Math.max(w.t0, a[1] - 0.02); snapped++; }
    if (b && b[0] + 0.02 > w.t0 + 0.05) { w.t1 = Math.min(w.t1, b[0] + 0.02); snapped++; }
  }
  clips[l.hash] = { hash: l.hash, text: c.text, voice: c.voice, lead: words[0]?.t0 ?? 0, end: words[words.length - 1]?.t1 ?? c.end, dur: c.dur, words };
}
console.log(`word timings: ${snapped} word edges snapped to the measured sound`);
const narr: Narration = { id: sb.id, clips };
const ident = (s: string) => "N_" + s.replace(/[^A-Za-z0-9]/g, "_");
fs.writeFileSync(`${MANIFESTS}/${sb.id}.ts`, `// GENERATED by \`npm run voice -- ${sb.id}\`: word timings of the story's narration lines (voice/cache). Do not edit.\nimport type { Narration } from "../../voice/narration";\n\nexport const ${ident(sb.id)}: Narration = ${JSON.stringify(narr)};\n`);
const ids = fs.readdirSync(MANIFESTS).filter((f: string) => f.endsWith(".ts") && f !== "index.ts").map((f: string) => f.slice(0, -3)).sort();
fs.writeFileSync(`${MANIFESTS}/index.ts`, `// GENERATED by \`npm run voice\` (scripts/voice.ts): every story's narration manifest (word timings of its generated\n// lines). Do not edit by hand; regenerate instead. Stories without narration render with estimated timing.\nimport type { Narration } from "../../voice/narration";\n${ids.map((i: string) => `import { ${ident(i)} } from "./${i}";`).join("\n")}\n\nexport const NARRATION: Record<string, Narration> = {${ids.map((i: string) => ` ${JSON.stringify(i)}: ${ident(i)}`).join(",")} };\n`);

// 4. the soundtrack: every line at its place on the film's clock, the exact film length, -14 LUFS, 48 kHz stereo
const tm = resolve(sb, narr), T = tm.total / FPS;
if (tm.problems.length) fail(`storyboard problems:\n  ${tm.problems.join("\n  ")}`);
const inputs = tm.lines.flatMap((p) => ["-i", `${CACHE}/${p.hash}.mp3`]);
const chain = tm.lines.map((p, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=mono,adelay=${Math.max(0, Math.round(p.fileAt * 1000))}:all=1[a${i}]`).join(";")
  + `;${tm.lines.map((_, i) => `[a${i}]`).join("")}amix=inputs=${tm.lines.length}:normalize=0:dropout_transition=0,apad=whole_dur=${T.toFixed(3)},atrim=end=${T.toFixed(3)}`;
const measure = run("ffmpeg", ["-hide_banner", "-nostats", ...inputs, "-filter_complex", `${chain},loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json`, "-f", "null", "-"]).stderr.toString();
const m = JSON.parse(measure.slice(measure.lastIndexOf("{"), measure.lastIndexOf("}") + 1));
const norm = `loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
run("ffmpeg", ["-v", "error", "-y", ...inputs, "-filter_complex", `${chain},${norm},aresample=48000,pan=stereo|c0=c0|c1=c0,atrim=end=${T.toFixed(3)}`, "-c:a", "libmp3lame", "-b:a", "320k", OUT]);
const words = tm.lines.reduce((n, l) => n + l.words.length, 0), spoken = tm.lines.reduce((n, l) => n + l.end - l.start, 0);
console.log(`\nmanifest  ${MANIFESTS}/${sb.id}.ts  (${unique.length} lines)`);
console.log(`soundtrack ${OUT}  ${durOf(OUT).toFixed(3)} s for a ${tm.total}-frame film (${T.toFixed(3)} s), voice from ${tm.lines[0].start.toFixed(3)} s, ${(words / spoken).toFixed(2)} words/s while speaking`);
console.log(`next: npm run test:story, then render Short-${sb.id} (render-request.json); the soundtrack is picked up automatically.`);
