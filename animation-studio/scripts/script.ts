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
// story.md (docs/STORYTELLING.md) takes precedence: the story + visual plan as a beat sheet, linted, approved only with
// an INDEPENDENT evaluation (eval/evaluation.md, docs/storytelling/evaluator.md) whose findings support `ready`; --storyboard then writes one shot per beat with its purpose as notes.
// script.md format (explainers, legacy): a `# Title` line, optional `mood: <mood>` / `voice: <preset>` lines, then the narration as
// `- line text` (voice-over) or `- gus: line text` (a character speaks it, lip-synced). One bullet = one spoken line.
import "./lib/dom-stub";
import fs from "node:fs";
import path from "node:path";
import { estimateClip, fnv } from "../src/studio/voice/narration";
import { VOICES, NARRATOR } from "../src/studio/voice/voices";
import { MOODS } from "../src/studio/sound/catalog";
import { ROSTER } from "../src/studio/characters/roster";
import { parseStory, lintStory, buildPacket, parseEvaluation, gateEvaluation, CRITERIA, ALIASES, type Story } from "./lib/story";
import { parseSpine, lintSpine, buildSpinePacket, gateSpineEval, phase1Issues, checkRevision } from "./lib/spine";

const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const argv = proc.process.argv.slice(2), id = argv[0];
const opt = (k: string) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const die = (m: string): never => { console.error(`script: ${m}`); return proc.process.exit(1); };
if (!id || id.startsWith("--")) die("usage: npm run script -- <id> [--approve <chars>] [--storyboard]");
const ROOT = path.resolve(".."), DIR = path.join(ROOT, "productions", id), SCRIPT = path.join(DIR, "script.md"), RESEARCH = path.join(DIR, "research.md");
const STORY = path.join(DIR, "story.md");
if (fs.existsSync(STORY)) { storyMode(); proc.process.exit(0); }
if (!fs.existsSync(SCRIPT)) die(`no ${path.relative(ROOT, SCRIPT)} or story.md (copy productions/_template/story.md; docs/STORYTELLING.md)`);

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

// ======================================================================================================================
// story mode: productions/<id>/story.md (docs/STORYTELLING.md)
function storyMode(): void {
  const src = fs.readFileSync(STORY, "utf8"), s: Story = parseStory(src);
  const voiceOf = (who: string) => s.voices[who] ?? (who === "narrator" ? s.voice ?? NARRATOR : s.voices.default ?? s.voice ?? NARRATOR);
  for (const v of new Set([s.voice ?? NARRATOR, ...Object.values(s.voices)])) if (!VOICES[v]) die(`unknown voice "${v}"`);
  if (s.mood && !(s.mood in MOODS)) die(`unknown mood "${s.mood}"`);
  const research = fs.existsSync(RESEARCH) ? fs.readFileSync(RESEARCH, "utf8") : "";
  const sources = [...new Set([...research.matchAll(/https?:\/\/[^\s)>\]]+/g)].map((m) => m[0]))];
  // ---- the Story Spine (spec 2: every new story). Phase 1: --phase spine checks and packages the plot BEFORE dialogue
  const specN = Number(src.split(/^##\s/m)[0].match(/^spec:\s*(\d+)/m)?.[1] ?? 1), spec2 = specN >= 2, sp = parseSpine(src);
  const SL = spec2 || sp.present ? lintSpine(s, sp, specN >= 3) : undefined;
  if (spec2 && !sp.present) SL?.fails.unshift("spec 2 story without a ## Spine (productions/_template/story.md)");
  const EVAL0 = path.join(DIR, "eval"); fs.mkdirSync(EVAL0, { recursive: true });
  const spinePacket = SL ? buildSpinePacket(s, sp, research, SL.flags) : undefined;
  const spineEvalFile = path.join(EVAL0, "spine-evaluation.md"), v1File = path.join(EVAL0, "spine-packet.v1.md"), packetFile = path.join(EVAL0, "spine-packet.md");
  // keep the exact spine that phase 1 judged (before a revision overwrites it), so the revision can be compared with it
  if (spinePacket && fs.existsSync(spineEvalFile) && !fs.existsSync(v1File) && fs.existsSync(packetFile)) {
    const evaluated = fs.readFileSync(spineEvalFile, "utf8").match(/^packet:\s*([0-9a-f]+)/m)?.[1], old = fs.readFileSync(packetFile, "utf8");
    if (evaluated && old.includes(`packet: ${evaluated}`)) fs.writeFileSync(v1File, old);
  }
  if (spinePacket) fs.writeFileSync(packetFile, spinePacket.text);
  const spineGate = spinePacket && fs.existsSync(spineEvalFile) ? gateSpineEval(fs.readFileSync(spineEvalFile, "utf8"), spinePacket.hash) : undefined;
  if (SL) {
    console.log(`\nspine: planning depth ${SL.depth}${SL.why.length ? ` (${SL.why.join(", ")})` : ""} · ${sp.events.length} events · ${sp.alternatives.length} alternatives · ${sp.easyOuts.length} easy outs`);
    for (const f of SL.fails) console.log(`  FAIL  spine: ${f}`);
    for (const w of SL.warns) console.log(`  WARN  spine: ${w}`);
    for (const f of SL.flags) console.log(`  FLAG  spine: ${f}`);
    console.log(`  phase-1 packet: productions/${id}/eval/spine-packet.md (${spinePacket!.hash})`);
    console.log(spineGate ? `  phase-1 evaluation: ${spineGate.verdict} (${spineGate.fails} fail, ${spineGate.weak} weak)${spineGate.problems.map((p) => `\n    - ${p}`).join("")}` : "  phase-1 evaluation: not run (docs/storytelling/evaluator.md, phase 1)");
  }
  // ---- revision regression protection: phase-1 findings become numbered issues that must each be resolved
  // spec 3 only: earlier story files (and their existing evaluations) stay exactly as they were
  const issues = SL && specN >= 3 && fs.existsSync(spineEvalFile) ? phase1Issues(fs.readFileSync(spineEvalFile, "utf8")) : [];
  if (SL && issues.length) {
    fs.writeFileSync(path.join(EVAL0, "issues.md"), [`# Phase-1 issues: ${s.title}`, "Each must appear in story.md's ## Issue log with a resolution and a status (resolved / no longer applies: reason).", "",
      ...issues.map((i) => `- **${i.id}** (${i.kind}, ${i.result}): ${i.problem}${i.fix ? `\n  - suggested fix: ${i.fix}` : ""}`)].join("\n") + "\n");
    const R = checkRevision(sp, issues, fs.existsSync(v1File) ? fs.readFileSync(v1File, "utf8") : undefined, spinePacket!.text);
    for (const f of R.fails) { console.log(`  FAIL  revision: ${f}`); SL.fails.push(`revision: ${f}`); }
    for (const w of R.warns) console.log(`  WARN  revision: ${w}`);
    for (const d of R.downstream) console.log(`  NOTE  revision: ${d}`);
    console.log(`  issues: ${issues.length} from phase 1 (productions/${id}/eval/issues.md); ${sp.issues.length} logged`);
  }
  if (argv.includes("--phase") && opt("--phase") === "spine") { proc.process.exit(SL && SL.fails.length ? 1 : 0); }
  const L = lintStory(s, (text, who) => estimateClip(voiceOf(who), text).end * 1.053, sources.length);
  if (SL) { L.fails.push(...SL.fails.map((f) => `spine: ${f}`)); L.flags.push(...SL.flags); }
  // the independent evaluator's packet (docs/storytelling/evaluator.md), rewritten on every run
  const EVAL = path.join(DIR, "eval"); fs.mkdirSync(EVAL, { recursive: true });
  const packet = buildPacket(s, research, L.flags, [
    ...(sp.references.length ? ["## Declared inspirations (the writer's stated sources: judge adaptation vs reproduction)", ...sp.references.map((r) => `- ${r.source}: borrows ${r.borrowed || "?"}`), ""] : []),
    // phase 1's own findings (not the writer's answers to them): phase 2 checks each one is really gone, in what the viewer sees
    ...(issues.length ? ["## Earlier independent findings (phase 1, on the plot): for each, judge whether the viewer still meets the problem", ...issues.map((i) => `- ${i.id} (${i.kind}): ${i.problem}`), ""] : []),
  ]);
  fs.writeFileSync(path.join(EVAL, "packet.md"), packet.text);
  const evalFile = path.join(EVAL, "evaluation.md"), ev = fs.existsSync(evalFile) ? parseEvaluation(fs.readFileSync(evalFile, "utf8")) : undefined;
  const gate = ev ? gateEvaluation(ev, packet.hash, L.flags.length) : undefined;
  console.log(`\n${s.title} (${id}): ${s.format.join("+")} · ${s.beats.length} beats · ${L.words} words · ~${L.estimate.toFixed(0)} s (target ${s.length ?? "-"}) · ${L.chars} characters`);
  for (const f of L.fails) console.log(`  FAIL  ${f}`);
  for (const w of L.warns) console.log(`  WARN  ${w}`);
  for (const f of L.flags) console.log(`  FLAG  ${f}`);
  console.log(`  evaluator packet: productions/${id}/eval/packet.md (${packet.hash})`);
  if (!gate) console.log(`  independent evaluation: not run yet (docs/storytelling/evaluator.md)`);
  else { console.log(`  independent evaluation: verdict ${gate.verdict}, ${gate.fail} fail, ${gate.weak} weak -> ${gate.ready ? "READY" : "not ready"}`); for (const p of gate.problems) console.log(`    - ${p}`); }
  const lines = s.beats.flatMap((b) => b.lines);
  const cell = (x: string) => x.replace(/\|/g, "/");
  fs.writeFileSync(path.join(DIR, "approval-request.md"), [
    `# ${s.title}: story approval`, "",
    `**Format:** ${s.format.join(" + ")}. ${s.why}`, "",
    `**Estimated length:** ${L.estimate.toFixed(0)} s · **Words:** ${L.words} · **Narration:** ${L.chars} characters (about ${L.chars} ElevenLabs credits) · **Voices:** ${[...new Set(lines.map((l) => `${l.who}=${voiceOf(l.who)}`))].join(", ")}`, "",
    "## Premise", ...Object.entries(s.premise).filter(([, v]) => v && !/^none$/i.test(v)).map(([k, v]) => `- **${k}:** ${v}`), "",
    "## Beats (script + visual plan)", "| # | lines | happens | camera | changes |", "|---|---|---|---|---|",
    ...s.beats.map((b) => `| ${b.n} | ${b.lines.length ? b.lines.map((l) => (l.who === "narrator" ? "" : `**${l.who}:** `) + cell(l.text)).join("<br>") : "*(silent)*"} | ${cell(b.happens)} | ${cell(b.camera)} | ${cell(b.changes)} |`), "",
    "## Ending", ...Object.entries(s.ending).map(([k, v]) => `- **${k}:** ${v}`), "",
    "## Structural checks", ...(L.fails.length || L.warns.length ? [...L.fails.map((f) => `- FAIL ${f}`), ...L.warns.map((w) => `- note: ${w}`)] : ["All structural checks pass (structure only: not a judgement of quality)."]), "",
    "## Independent evaluation", ...(ev && gate ? [`**Verdict:** ${gate.verdict} → ${gate.ready ? "ready" : "not ready"} · **Would a viewer keep watching?** ${ev.overall["keep-watching"] ?? "?"}`, "",
      "| criterion | result | beats |", "|---|---|---|", ...CRITERIA.map((c) => { const x = ev.criteria[c] ?? ev.criteria[ALIASES[c] ?? ""]; return `| ${ALIASES[c] ?? c} | ${cell(x?.result ?? "missing")} | ${cell(x?.beats ?? "")} |`; }), "",
      ...gate.problems.map((p) => `- gate: ${p}`), `Full findings: productions/${id}/eval/evaluation.md`] : ["Not run yet."]), "",
    `To approve: tell Claude; it records \`npm run script -- ${id} --approve ${L.chars}\`.`,
  ].join("\n") + "\n");
  console.log(`\napproval request: productions/${id}/approval-request.md`);
  const scriptHash = fnv(JSON.stringify(lines.map((l) => [voiceOf(l.who), l.who, l.text])));
  if (argv.includes("--approve")) {
    if (L.fails.length) die("refusing to record approval while story checks FAIL");
    if (SL && SL.depth !== "light" && !spineGate) return die(`refusing to record approval: a ${SL.depth}-depth story needs its phase-1 (spine) evaluation first`);
    if (!gate) return die("refusing to record approval: no independent evaluation (docs/storytelling/evaluator.md)");
    if (!gate.ready) die(`refusing to record approval: the independent evaluation does not support "ready" (${gate.problems[0] ?? `verdict ${gate.verdict}`})`);
    if (Number(opt("--approve")) !== L.chars) die(`approval is for ${opt("--approve")} characters, the story costs ${L.chars}: show the owner the current story again`);
    const STATUS = path.join(DIR, "status.json"), status = fs.existsSync(STATUS) ? JSON.parse(fs.readFileSync(STATUS, "utf8")) : { id, composition: `Short-${id}`, stages: {} };
    status.story = { format: s.format, beats: s.beats.length, hash: fnv(src), packet: packet.hash, at: new Date().toISOString() };
    status.approval = { scriptHash, chars: L.chars, at: new Date().toISOString(), by: "the owner, in the conversation", script: `productions/${id}/story.md` };
    fs.writeFileSync(STATUS, JSON.stringify(status, null, 1) + "\n");
    console.log(`story approved (${s.format.join("+")}, ${s.beats.length} beats, ${L.chars} characters)`);
  }
  if (argv.includes("--storyboard")) storySkeleton(s, voiceOf);
}

/** one shot per beat: its lines, the planned camera mapped onto a library move, the beat's purpose as notes */
function storySkeleton(s: Story, voiceOf: (who: string) => string): void {
  const file = path.join("src/studio/stories", `${id}.ts`), ident = id.replace(/[^A-Za-z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase());
  if (fs.existsSync(file)) die(`${file} exists already (refusing to overwrite a storyboard)`);
  const speakers = [...new Set(s.beats.flatMap((b) => b.lines.map((l) => l.who)).filter((w) => w !== "narrator"))];
  const lead = (s.premise.protagonist ?? "milo").toLowerCase().split(/\W/)[0];
  const cast: Record<string, string> = { milo: "milo", ...Object.fromEntries([lead, ...speakers].filter((w) => ROSTER[w]).map((w) => [w, w])) };
  const voices = Object.fromEntries(speakers.filter((w) => cast[w]).map((w) => [w, voiceOf(w)]));
  const q = JSON.stringify;
  const camOf = (c: string, who: string) => {
    const k = c.toLowerCase().split(/\s|->/)[0];
    if (k === "closeup" || k === "close" || k === "extreme") return `{ move: "closeUp", on: ${q(who)} }`;
    if (k === "pushin") return `{ move: "pushIn", on: [${q(who)}], size: "full", to: "medium" }`;
    if (k === "lowhero" || k === "highangle") return `{ move: ${q(k === "lowhero" ? "lowHero" : "highAngle")}, on: ${k === "lowhero" ? q(who) : `[${q(who)}]`} }`;
    if (k === "follow") return `{ move: "follow", on: ${q(who)}, size: "full" }`;
    if (k === "dutch") return `{ move: "dutch", on: [${q(who)}], roll: 0.12 }`;
    return `{ move: "frame", on: [${q(who)}], size: ${q(k === "wide" ? "wide" : k === "full" ? "full" : "medium")} }`;
  };
  const shots = s.beats.map((b) => {
    const who = b.lines.find((l) => cast[l.who])?.who ?? (cast[lead] ? lead : "milo");
    const say = b.lines.map((l) => (cast[l.who] ? `{ who: ${q(l.who)}, text: ${q(l.text)} }` : l.who === "narrator" ? q(l.text) : `{ text: ${q(l.text)}, voice: ${q(voiceOf(l.who))} }`));
    return `    // beat ${b.n}: ${b.happens.replace(/\n/g, " ")}  ->  ${b.changes}
    //   plan: camera ${b.camera} · subject ${b.subject} · action ${b.action} · sound ${b.sound || "-"}
    { ${say.length ? `say: [${say.join(", ")}], ` : "dur: 1.5, "}set: "city", light: "day", note: ${q(b.learns || b.happens)},
      camera: ${camOf(b.camera, who)},
      actors: [{ who: ${q(who)}, at: "a", act: "neutral" }] },`;
  }).join("\n");
  const constName = ident.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  fs.writeFileSync(file, `// Storyboard SKELETON for "${s.title}" (${s.format.join("+")}), from productions/${id}/story.md by npm run script -- ${id} --storyboard.
// One shot per beat. The say lines are the approved story, word for word. Each shot's comments carry the beat's purpose
// and visual plan: build the planned action, subject, camera and sound with the library (docs/STORYTELLING.md §3).
import type { Storyboard } from "../story/types";

export const ${constName}: Storyboard = {
  id: ${q(id)}, title: ${q(s.title)},
  cast: ${q(cast)},${Object.keys(voices).length ? `\n  voices: ${q(voices)},` : ""}${s.voice && s.voice !== NARRATOR ? `\n  voice: ${q(s.voice)},` : ""}${s.mood ? `\n  music: ${q(s.mood)},` : ""}
  shots: [
${shots}
  ],
};
`);
  const idx = "src/studio/stories/index.ts";
  let t = fs.readFileSync(idx, "utf8");
  t = t.replace(/(import type \{ Storyboard \} from "..\/story\/types";\n)/, `$1import { ${constName} } from "./${id}";\n`).replace(/export const STORIES: Storyboard\[\] = \[(.*)\];/, (_m: string, a: string) => `export const STORIES: Storyboard[] = [${a}, ${constName}];`);
  fs.writeFileSync(idx, t);
  console.log(`storyboard skeleton: ${file} (registered as Short-${id}; one shot per beat, plans in the comments)`);
}
