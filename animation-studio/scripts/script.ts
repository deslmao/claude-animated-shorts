// Script tool (stage 5):  npm run script -- <id> [--approve <chars>] [--storyboard]
// Reads productions/<id>/script.md (+ research.md) and:
//   - checks the script against the channel formula: hook in sentence 1 (<= 16 words), 175-205 words, sentence length,
//     a "You see," pivot or other explanation turn, an ending payoff, no channel names, research with >= 2 sources
//   - estimates the narration length (George's measured pace) and the ElevenLabs cost (characters)
//   - writes productions/<id>/approval-request.md: what the owner approves (research summary, sources, script,
//     estimated length, characters / credits)
//   --approve <chars>   records the owner's approval in productions/<id>/status.json, in the form `npm run short`
//                       checks (the same lines, voices and characters), so no paid request happens without it
//   --storyboard        writes a storyboard skeleton src/studio/stories/<id>.ts with exactly the approved lines (one
//                       shot per line, valid defaults to refine) and registers it in stories/index.ts
// script.md format: a `# Title` line, optional `mood: <mood>` / `voice: <preset>` lines, then the narration as
// `- line text` (voice-over) or `- gus: line text` (a character speaks it, lip-synced). One bullet = one spoken line.
import "./lib/dom-stub";
import fs from "node:fs";
import path from "node:path";
import { estimateClip, fnv } from "../src/studio/voice/narration";
import { VOICES, NARRATOR } from "../src/studio/voice/voices";
import { MOODS } from "../src/studio/sound/catalog";
import { ROSTER } from "../src/studio/characters/roster";

const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const argv = proc.process.argv.slice(2), id = argv[0];
const opt = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const die = (m: string): never => { console.error(`script: ${m}`); return proc.process.exit(1); };
if (!id || id.startsWith("--")) die("usage: npm run script -- <id> [--approve <chars>] [--storyboard]");
const ROOT = path.resolve(".."), DIR = path.join(ROOT, "productions", id), SCRIPT = path.join(DIR, "script.md"), RESEARCH = path.join(DIR, "research.md");
if (!fs.existsSync(SCRIPT)) die(`no ${path.relative(ROOT, SCRIPT)} (copy productions/_template/script.md)`);

// ---------------- parse
const src = fs.readFileSync(SCRIPT, "utf8");
const title = src.match(/^#\s+(.+)$/m)?.[1].trim() ?? id;
const mood = src.match(/^mood:\s*(\w+)/m)?.[1];
const voice = src.match(/^voice:\s*(\w+)/m)?.[1] ?? NARRATOR;
const lines = [...src.matchAll(/^\s*-\s+(?:(\w+):\s+)?(.+?)\s*$/gm)].map((m) => ({ who: m[1] ?? "narrator", text: m[2] }));
if (!lines.length) die("the script has no lines (one `- ...` bullet per spoken line)");
if (!VOICES[voice]) die(`unknown voice "${voice}"`);
if (mood && !(mood in MOODS)) die(`unknown mood "${mood}" (moods: ${Object.keys(MOODS).join(", ")})`);

// ---------------- checks (the channel formula, references/STYLE_BIBLE.md)
const all = lines.map((l) => l.text).join(" ");
const words = all.split(/\s+/).filter(Boolean).length;
const sentences = all.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
const sw = sentences.map((s) => s.split(/\s+/).length);
const hookWords = sentences[0].split(/\s+/).length;
const PACE = 1.053; // estimate -> real George timing (measured on the yawn demo: 22.30 s real vs 21.17 s estimated)
const est = lines.reduce((t, l) => t + estimateClip(voice, l.text).end, 0) * PACE + lines.length * 0.08 + (lines.length / 1.6) * 0.2 + 0.5;
const chars = lines.reduce((n, l) => n + l.text.length, 0);
const fails: string[] = [], warns: string[] = [];
if (words < 175 || words > 205) (words < 160 || words > 220 ? fails : warns).push(`${words} words (target 175-205 for 55-65 s)`);
if (est < 55 || est > 65) (est < 50 || est > 70 ? fails : warns).push(`estimated ${est.toFixed(1)} s (target 55-65 s)`);
if (hookWords > 16) warns.push(`hook is ${hookWords} words: the first sentence should land the surprising fact in <= 16`);
if (!/\byou see\b/i.test(all) && !/\bhere'?s (why|the thing)\b|\bthe reason\b|\bit turns out\b/i.test(all)) warns.push(`no explanation turn ("You see," / "Here's why" / "It turns out")`);
const long = sentences.filter((_, i) => sw[i] > 24);
if (long.length) warns.push(`${long.length} sentence(s) over 24 words (median should be ~13): "${long[0].slice(0, 60)}..."`);
for (const l of lines) if (l.who !== "narrator" && !ROSTER[l.who] && !src.match(new RegExp(`^cast:.*\\b${l.who}\\b`, "m"))) warns.push(`speaker "${l.who}" is not a library character (fine if the storyboard casts it as an extra)`);
const research = fs.existsSync(RESEARCH) ? fs.readFileSync(RESEARCH, "utf8") : "";
const sources = [...new Set([...research.matchAll(/https?:\/\/[^\s)>\]]+/g)].map((m) => m[0]))];
if (!research) fails.push("no research.md (facts + sources first)");
else if (sources.length < 2) fails.push(`research.md lists ${sources.length} source URL(s): at least 2 credible sources are required`);

const median = [...sw].sort((a, b) => a - b)[Math.floor(sw.length / 2)];
console.log(`\n${title} (${id}): ${lines.length} lines, ${words} words, ${sentences.length} sentences (median ${median} words), hook ${hookWords} words`);
console.log(`estimated length ${est.toFixed(1)} s with ${VOICES[voice].name.split(" - ")[0]}; narration cost ${chars} characters (~${chars} credits)`);
console.log(`research: ${sources.length} source(s)`);
for (const f of fails) console.log(`  FAIL  ${f}`);
for (const w of warns) console.log(`  WARN  ${w}`);

// ---------------- approval request (what the owner sees)
const summary = research.split(/^## /m).find((s: string) => /^summary/i.test(s))?.replace(/^summary\s*/i, "").trim() ?? "(see research.md)";
fs.writeFileSync(path.join(DIR, "approval-request.md"), [
  `# ${title}: script approval`, "",
  `**Estimated length:** ${est.toFixed(1)} s · **Words:** ${words} · **Narration:** ${VOICES[voice].name} · **Cost:** ${chars} characters (about ${chars} ElevenLabs credits)`, "",
  "## Research summary", summary, "", "## Sources", ...sources.map((s) => `- ${s}`), "", "## Script", ...lines.map((l, i) => `${i + 1}. ${l.who === "narrator" ? "" : `**${l.who}:** `}${l.text}`), "",
  fails.length || warns.length ? `## Checks\n${[...fails.map((f) => `- FAIL ${f}`), ...warns.map((w) => `- note: ${w}`)].join("\n")}\n` : "## Checks\nAll script checks pass.\n",
  `To approve: tell Claude; it records \`npm run script -- ${id} --approve ${chars}\`.`,
].join("\n") + "\n");
console.log(`\napproval request: productions/${id}/approval-request.md`);

// the approval key, computed exactly like npm run short does for the storyboard's lines
const voiceOf = (_who: string) => voice; // one voice for the whole script (per-speaker voices are set in the storyboard)
const scriptHash = fnv(JSON.stringify(lines.map((l) => [voiceOf(l.who), l.who, l.text])));

if (argv.includes("--approve")) {
  if (fails.length) die("refusing to record approval while script checks FAIL");
  if (Number(opt("--approve")) !== chars) die(`approval is for ${opt("--approve")} characters, the script costs ${chars}: show the owner the current script again`);
  const STATUS = path.join(DIR, "status.json"), status = fs.existsSync(STATUS) ? JSON.parse(fs.readFileSync(STATUS, "utf8")) : { id, composition: `Short-${id}`, stages: {} };
  status.approval = { scriptHash, chars, at: new Date().toISOString(), by: "the owner, in the conversation", script: "productions/" + id + "/script.md" };
  fs.writeFileSync(STATUS, JSON.stringify(status, null, 1) + "\n");
  console.log(`approval recorded (${chars} characters, script ${scriptHash}): npm run short will generate exactly these lines`);
}

if (argv.includes("--storyboard")) {
  const file = path.join("src/studio/stories", `${id}.ts`), ident = id.replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase());
  if (fs.existsSync(file)) die(`${file} exists already (refusing to overwrite a storyboard)`);
  const speakers = [...new Set(lines.map((l) => l.who).filter((w) => w !== "narrator"))];
  const cast = { milo: "milo", juno: "juno", gus: "gus", ...Object.fromEntries(speakers.filter((s) => ROSTER[s]).map((s) => [s, s])) };
  const shots = lines.map((l, i) => `    { say: ${l.who === "narrator" ? JSON.stringify(l.text) : `{ who: ${JSON.stringify(l.who)}, text: ${JSON.stringify(l.text)} }`}, set: "city", light: "day"${i ? `, transition: "cut"` : ""},
      camera: { move: "frame", on: [${JSON.stringify(l.who !== "narrator" && cast[l.who as keyof typeof cast] ? l.who : "milo")}], size: "medium", from: ${[6, -8, 12, -4][i % 4]} },
      actors: [{ who: ${JSON.stringify(l.who !== "narrator" && cast[l.who as keyof typeof cast] ? l.who : "milo")}, at: "a", act: "neutral" }] },`).join("\n");
  fs.writeFileSync(file, `// Storyboard SKELETON for "${title}" (from productions/${id}/script.md by npm run script -- ${id} --storyboard).
// The say lines are the approved script, word for word: keep them exactly (approval is tied to them). Replace the
// placeholder sets, cameras, actors, acting, props, items and effects shot by shot (docs/TOPIC_TO_VIDEO.md).
import type { Storyboard } from "../story/types";

export const ${ident.toUpperCase().replace(/[^A-Z0-9]/g, "_")}: Storyboard = {
  id: ${JSON.stringify(id)}, title: ${JSON.stringify(title)},
  cast: ${JSON.stringify(cast)},${mood ? `\n  music: ${JSON.stringify(mood)},` : ""}${voice !== NARRATOR ? `\n  voice: ${JSON.stringify(voice)},` : ""}
  shots: [
${shots}
  ],
};
`);
  const idx = "src/studio/stories/index.ts", constName = ident.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  let s = fs.readFileSync(idx, "utf8");
  s = s.replace(/(import type \{ Storyboard \} from "..\/story\/types";\n)/, `$1import { ${constName} } from "./${id}";\n`).replace(/export const STORIES: Storyboard\[\] = \[(.*)\];/, (_m: string, a: string) => `export const STORIES: Storyboard[] = [${a}, ${constName}];`);
  fs.writeFileSync(idx, s);
  console.log(`storyboard skeleton: ${file} (registered as Short-${id})`);
}
proc.process.exit(fails.length ? 1 : 0);
