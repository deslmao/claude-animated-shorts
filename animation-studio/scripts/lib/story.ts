// Story format (docs/STORYTELLING.md): productions/<id>/story.md = the script and its visual plan in one beat sheet.
//   parseStory      reads it
//   lintStory       structural checks (FAIL) plus heuristic flags (WARN, never verdicts) for the independent evaluator
//   buildPacket     what the independent evaluator sees: the script, the visual storyboard, research and the flags,
//                   but NOT the writer's premise, intentions, "viewer learns" / "changes" / evidence columns, setups
//                   ledger, option consequences or writer notes (docs/storytelling/evaluator.md)
//   parseEvaluation / gateEvaluation   read productions/<id>/eval/evaluation.md and decide whether `ready` is allowed

export const FORMATS = ["immersive", "action-first", "world-rule", "emotional", "mystery", "serial"] as const;
export const CAMERA_WORDS = ["wide", "full", "medium", "close", "extreme", "closeup", "insert", "pov", "overshoulder", "pushin", "pullout",
  "follow", "lowhero", "highangle", "dutch", "orbit", "crane", "establish", "view", "frame", "whip", "hold"];
export const CRITERIA = ["clarity", "viewer participation", "cause and effect", "emotional investment", "recontextualisation", "setup and payoff", "visual communication", "originality", "accuracy"] as const;
/** renamed criteria / tests: the new name is accepted wherever the old one is expected (older evaluations keep working) */
export const ALIASES: Record<string, string> = { originality: "originality and adaptation" };
/** criteria that apply to every story (the others may be n/a with a reason) */
const ALWAYS = ["clarity", "cause and effect", "visual communication", "originality"];
export const STRESS_TESTS = ["plot hole", "consistency", "giveaway", "dilemma balance", "redundancy", "originality", "emotional cost", "cold viewer"] as const;
const STATIC = /^(stands?|standing|talks?|talking|explains?|explaining|says|speaks|listens?|waits?|idle|poses?|looks at (the )?camera|faces (the )?camera)\b[\s.,;]*$/i;
const STOP = new Set("the a an and or but of to in on at for with from by as is are was were be been it its this that these those he she they his her their him them you your i me my we our not no so then than there here into onto out up down off over just very can could would will what when where who why how all any each every one two three some more most only own same too also has have had do does did".split(" "));

export type StoryLine = { who: string; text: string };
export type Beat = { n: number; lines: StoryLine[]; happens: string; learns: string; subject: string; action: string; camera: string; changes: string; sound: string; evidence: string; events: string[]; claims: string[] };
export type Story = {
  title: string; format: string[]; why: string; length?: number; voice?: string; voices: Record<string, string>; mood?: string; factual: boolean;
  premise: Record<string, string>; setups: { setup: string; beat: number; payoff: number; how: string }[];
  beats: Beat[]; ending: Record<string, string>;
};

const section = (src: string, name: string) => {
  const m = src.match(new RegExp(`^##\\s+${name}\\b[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, "mi"));
  return m ? m[1].replace(/<!--[\s\S]*?-->/g, "") : "";
};
const bullets = (s: string) => Object.fromEntries([...s.matchAll(/^\s*-\s*([A-Za-z][\w -]*?)\s*:\s*(.*)$/gm)].map((m) => [m[1].trim().toLowerCase(), m[2].trim()]));
const rows = (s: string) => s.split("\n").filter((l) => /^\s*\|/.test(l) && !/^\s*\|\s*-/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
const empty = (v?: string) => !v || /^(<.*>|none|n\/a|-|tbd|todo)?$/i.test(v.trim());
const content = (s: string) => (s.toLowerCase().match(/[a-z][a-z']{3,}/g) ?? []).map((w) => w.replace(/'s$/, "")).filter((w) => !STOP.has(w));
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");

export const parseStory = (src: string): Story => {
  const head = src.split(/^##\s/m)[0];
  const meta = (k: string) => head.match(new RegExp(`^${k}:\\s*(.+)$`, "mi"))?.[1].trim();
  const voices = Object.fromEntries((meta("voices") ?? "").split(",").map((p) => p.split("=").map((x) => x.trim())).filter((p) => p.length === 2 && p[0] && p[1]));
  // columns by header name (older files: the original fixed order), so new columns can be added without breaking them
  const beatRows = rows(section(src, "Beats"));
  const bhead = (beatRows[0] ?? []).map((h) => h.toLowerCase());
  const DEF = ["#", "lines", "happens", "viewer learns", "subject", "action", "camera", "changes", "sound", "evidence"];
  const col = (r: string[], name: string) => { const i = bhead.indexOf(name); const j = i >= 0 ? i : bhead.length ? -1 : DEF.indexOf(name); return j >= 0 ? (r[j] ?? "").trim() : ""; };
  const beats: Beat[] = beatRows.slice(1).filter((r) => /^\d+$/.test(r[0])).map((r) => ({
    n: Number(r[0]),
    lines: col(r, "lines").split(/\s+\/\s+/).map((x) => x.trim()).filter((x) => x && x !== "~").map((x) => { const m = x.match(/^([a-z][\w]*):\s+(.+)$/); return m ? { who: m[1], text: m[2] } : { who: "narrator", text: x }; }),
    happens: col(r, "happens"), learns: col(r, "viewer learns"), subject: col(r, "subject"), action: col(r, "action"), camera: col(r, "camera"), changes: col(r, "changes"), sound: col(r, "sound"), evidence: col(r, "evidence"),
    events: (col(r, "events").match(/E\d+/gi) ?? []).map((x) => x.toUpperCase()), claims: (col(r, "claims").match(/C\d+/gi) ?? []).map((x) => x.toUpperCase()),
  }));
  const setups = rows(section(src, "Setups and payoffs")).slice(1).filter((r) => r.length >= 3 && /\d/.test(r[1] ?? "")).map((r) => ({ setup: r[0], beat: Number(r[1]), payoff: Number(r[2]), how: r[3] ?? "" }));
  return {
    title: src.match(/^#\s+(.+)$/m)?.[1].trim() ?? "untitled",
    format: (meta("format") ?? "").toLowerCase().split("+").map((f) => f.trim()).filter(Boolean),
    why: meta("why") ?? "", length: meta("length") ? Number(meta("length")) : undefined, voice: meta("voice"), voices, mood: meta("mood"),
    factual: /^(yes|true)/i.test(meta("factual") ?? "no"),
    premise: bullets(section(src, "Premise")), setups, beats, ending: bullets(section(src, "Ending")),
  };
};

export type Lint = { fails: string[]; warns: string[]; flags: string[]; estimate: number; words: number; chars: number };
/** est(text, who): seconds for one spoken line. warns = structural notes; flags = heuristic signals for the evaluator */
export const lintStory = (s: Story, est: (text: string, who: string) => number, sources: number): Lint => {
  const fails: string[] = [], warns: string[] = [], flags: string[] = [], P = s.premise, f = s.format;
  const has = (k: string) => f.includes(k);
  // format and premise
  if (!f.length) fails.push("no format (docs/STORYTELLING.md §1)");
  for (const x of f) if (!(FORMATS as readonly string[]).includes(x) && !x.startsWith("other")) fails.push(`unknown format "${x}" (use ${FORMATS.join(", ")} or other:<name>)`);
  if (empty(s.why)) fails.push("why: say in one sentence why this format serves the idea");
  if (empty(P.question)) fails.push("premise: no question the viewer wants answered");
  for (const k of ["protagonist", "want", "decision"]) if (empty(P[k])) fails.push(`premise: no ${k}`);
  if (has("world-rule") && empty(P.rule)) fails.push("world-rule: state the one rule");
  if (has("immersive") && empty(P.conflict)) fails.push("immersive: state the two competing explanations (conflict)");
  if (has("action-first") && empty(P.action)) fails.push("action-first: state the strange opening action");
  if ((has("world-rule") || has("mystery") || has("emotional")) && !s.setups.length) fails.push(`${f.join("+")}: no setup/payoff pair (the solution or reveal must be set up earlier)`);
  // beats: cause and effect, visible action
  const B = s.beats;
  if (B.length < 5) fails.push(`${B.length} beats: a story needs at least 5`);
  B.forEach((b, i) => {
    if (b.n !== i + 1) fails.push(`beats are not numbered 1..${B.length} (row ${i + 1} is #${b.n})`);
    for (const [k, v] of [["happens", b.happens], ["action", b.action], ["camera", b.camera], ["changes", b.changes]] as const) if (empty(v)) fails.push(`beat ${b.n}: no "${k}"`);
    if (/^(nothing|no change|same|n\/a)\b/i.test(b.changes.trim())) fails.push(`beat ${b.n}: changes nothing (cut it or give it a consequence)`);
    if (STATIC.test(b.action.trim())) warns.push(`beat ${b.n}: static action "${b.action}" (show a physical action or reaction)`);
    const cams = b.camera.toLowerCase().replace(/[^a-z\s>-]/g, "").split(/\s*(?:->|>|then|,)\s*/).map((c) => c.trim().split(/\s+/)[0]).filter(Boolean);
    for (const c of cams) if (!CAMERA_WORDS.includes(c)) warns.push(`beat ${b.n}: camera "${c}" is not a library move (docs/STORYBOARD.md)`);
  });
  const firstCam = B.map((b) => b.camera.toLowerCase().split(/\s|->/)[0]);
  for (let i = 2; i < firstCam.length; i++) if (firstCam[i] && firstCam[i] === firstCam[i - 1] && firstCam[i] === firstCam[i - 2] && !["insert", "pov"].includes(firstCam[i])) warns.push(`beats ${i - 1}-${i + 1}: the same framing ("${firstCam[i]}") three times running`);
  const inserts = new Map<string, number>();
  for (const b of B) if (/\b(insert|pov)\b/i.test(b.camera)) { const k = b.subject.toLowerCase().replace(/[^a-z ]/g, "").trim().split(" ").slice(0, 2).join(" "); inserts.set(k, (inserts.get(k) ?? 0) + 1); }
  for (const [k, n] of inserts) if (n > 3) warns.push(`${n} inserts / POVs of "${k}": repeated close-ups lose attention (show it in the scene)`);
  for (const p of s.setups) {
    if (!B.some((b) => b.n === p.beat) || !B.some((b) => b.n === p.payoff)) fails.push(`setup "${p.setup}": beat ${p.beat} or ${p.payoff} does not exist`);
    else if (p.payoff <= p.beat) fails.push(`setup "${p.setup}": the payoff (beat ${p.payoff}) must come after the setup (beat ${p.beat})`);
  }
  const E = s.ending;
  if (empty(E.type)) fails.push("ending: no type (solution, realisation, reversal, reveal, consequence or decision)");
  if (/decision/i.test(E.type ?? "")) for (const k of ["a", "b"]) if (!/->\s*\S/.test(E[k] ?? "")) fails.push(`ending: option ${k.toUpperCase()} needs "label -> consequence"`);
  // lines, length, hook
  const lines = B.flatMap((b) => b.lines);
  if (!lines.length) fails.push("no spoken lines");
  const words = lines.reduce((n, l) => n + l.text.split(/\s+/).filter(Boolean).length, 0), chars = lines.reduce((n, l) => n + l.text.length, 0);
  // a beat lasts its speech (+ gaps), but never less than the time its action needs to read on a phone (2.2 s)
  const estimate = B.reduce((t, b) => t + Math.max(2.2, b.lines.reduce((u, l) => u + est(l.text, l.who) + 0.12, 0)) + 0.3, 0) + 0.5;
  const target = s.length ?? (has("action-first") && f.length === 1 ? 60 : 85);
  if (estimate < target * 0.8 || estimate > target * 1.2) warns.push(`estimated ${estimate.toFixed(0)} s vs target ${target} s`);
  if (estimate > 110) fails.push(`estimated ${estimate.toFixed(0)} s: too long for a Short`);
  const hook = (lines[0]?.text ?? "").split(/(?<=[.!?])\s/)[0].split(/\s+/).length;
  if (hook > 18) warns.push(`the first sentence is ${hook} words: land the situation faster`);
  if (has("action-first") && !/\byou see\b|here'?s (why|the thing)|the reason|it turns out|because\b/i.test(lines.map((l) => l.text).join(" "))) warns.push("action-first: no explanation turn");
  if (s.factual && sources < 2) fails.push(`factual story: research.md lists ${sources} source URL(s), at least 2 are required (viral videos and comments are not sources)`);

  // ---- heuristic flags: signals for the independent evaluator to confirm or dismiss, never verdicts
  // possible giveaway: the key words of a payoff are spoken before the payoff beat
  for (const p of s.setups) {
    // only the words of HOW it pays off (not the setup's own description): planting the setup is good, announcing the solution isn't
    const key = new Set(content(p.how).map(stem));
    const before = B.filter((b) => b.n < p.payoff).flatMap((b) => b.lines.map((l) => ({ n: b.n, w: [...new Set(content(l.text).map(stem))] })));
    const hits = before.filter((x) => x.w.filter((w) => key.has(w)).length >= 2);
    if (hits.length) flags.push(`possible giveaway: lines in beat ${[...new Set(hits.map((h) => h.n))].join(", ")} share key words with what pays off at beat ${p.payoff}. Does a line reveal the solution or reveal too early?`);
  }
  // possible redundancy: a line mostly repeats what its own shot shows
  for (const b of B) for (const l of b.lines) {
    const w = content(l.text), shot = new Set(content(b.happens + " " + b.subject).map(stem));
    if (w.length >= 5) { const r = w.filter((x) => shot.has(stem(x))).length / w.length; if (r >= 0.6) flags.push(`possible redundancy: beat ${b.n} "${l.text.slice(0, 50)}…" largely restates what its shot shows (${Math.round(r * 100)}% shared words). Does the line add meaning, or only describe the picture?`); }
  }
  // evidence balance (competing explanations): counted from the evidence column (A / B per beat)
  if ((has("immersive") || has("mystery")) && !empty(P.conflict)) {
    const a = B.filter((b) => /\bA\b/.test(b.evidence)).length, bb = B.filter((b) => /\bB\b/.test(b.evidence)).length;
    if (!a && !bb) flags.push("evidence balance: no beat is tagged with evidence for A or B. Is the dilemma built from observable evidence?");
    else if (Math.min(a, bb) < 2 || Math.abs(a - bb) >= 2) flags.push(`evidence balance: ${a} beat(s) of evidence for A, ${bb} for B. Is one side clearly favoured by the end?`);
    const last = [...B].reverse().find((b) => /\b[AB]\b/.test(b.evidence));
    if (last && !/\bA\b.*\bB\b|\bB\b.*\bA\b/.test(last.evidence)) flags.push(`evidence balance: the last evidence (beat ${last.n}) only supports ${last.evidence.match(/\b[AB]\b/)?.[0]}. Does it settle the choice too early?`);
  }
  // motivation: is the want visible in the first third of the story?
  if (!empty(P.want)) {
    const want = new Set(content(P.want).map(stem)), third = B.slice(0, Math.max(2, Math.ceil(B.length / 3)));
    if (!third.some((b) => content(b.lines.map((l) => l.text).join(" ") + " " + b.happens + " " + b.action).some((w) => want.has(stem(w)))))
      flags.push(`motivation: nothing in the first ${third.length} beats visibly mentions or shows the protagonist's want. Is it clear early enough for this story?`);
  }
  return { fails, warns, flags, estimate, words, chars };
};

// ---------------------------------------------------------------- the independent evaluator's packet
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
/** the evaluator's input: what a viewer gets (lines + pictures + on-screen choices), the research, the flags */
export const buildPacket = (s: Story, research: string, flags: string[], extra: string[] = []) => {
  const cell = (x: string) => x.replace(/\|/g, "/");
  const body = [
    `# Evaluation packet: ${s.title}`, "",
    `format (as claimed by the writer, for choosing which criteria apply): ${s.format.join(" + ")}`,
    `factual: ${s.factual ? "yes (judge accuracy against the research below)" : "no (fiction)"}`, "",
    "## Script and visual storyboard",
    "Each beat: the spoken lines (who: text; plain text = narrator; *(silent)* = no words) and the planned picture.", "",
    "| # | lines | on screen: what happens | key subject | action / reaction | camera | sound |", "|---|---|---|---|---|---|---|",
    ...s.beats.map((b) => `| ${b.n} | ${b.lines.length ? b.lines.map((l) => (l.who === "narrator" ? "" : `${l.who}: `) + cell(l.text)).join(" / ") : "*(silent)*"} | ${cell(b.happens)} | ${cell(b.subject)} | ${cell(b.action)} | ${cell(b.camera)} | ${cell(b.sound)} |`), "",
    "## Ending as shown",
    /decision/i.test(s.ending.type ?? "") ? `On-screen choice: A: ${(s.ending.a ?? "").split("->")[0].trim()} / B: ${(s.ending.b ?? "").split("->")[0].trim()}` : "No on-screen choice: the story ends on its last beat.", "",
    "## Automated flags (heuristic: confirm or dismiss each one, in context)",
    ...(flags.length ? flags.map((x) => `- ${x}`) : ["- (none)"]), "",
    ...(s.factual ? ["## Research supplied by the writer (claims and sources: check the story against them)", research.trim() || "(none)", ""] : []),
    ...extra,
  ].join("\n");
  const h = hash(body);
  return { text: `${body}\npacket: ${h}\n`, hash: h };
};

// ---------------------------------------------------------------- the evaluation and the gate
export type Eval = { packet?: string; criteria: Record<string, Record<string, string>>; tests: Record<string, Record<string, string>>; flags: string[]; overall: Record<string, string> };
const blocks = (s: string) => Object.fromEntries(s.split(/^###\s+/m).slice(1).map((b) => { const [h, ...rest] = b.split("\n"); return [h.trim().toLowerCase(), bullets(rest.join("\n"))]; }));
export const parseEvaluation = (src: string): Eval => ({
  packet: src.match(/^packet:\s*([0-9a-f]+)/m)?.[1],
  criteria: blocks(section(src, "Criteria")), tests: blocks(section(src, "Stress tests")),
  flags: [...section(src, "Automated flags").matchAll(/^\s*-\s*(.+)$/gm)].map((m) => m[1]),
  overall: bullets(section(src, "Overall")),
});
const res = (v?: string) => (v ?? "").toLowerCase().match(/^(pass|weak|fail|n\/a)/)?.[1];
/** may the story be called `ready`? (the evaluator's verdict must be ready AND its findings must support it) */
export const gateEvaluation = (e: Eval, packetHash: string, flagCount: number) => {
  const problems: string[] = [];
  if (e.packet !== packetHash) problems.push(`the evaluation is for packet ${e.packet ?? "?"}, the story is now packet ${packetHash}: re-evaluate the current story`);
  let weak = 0, fail = 0;
  for (const c of CRITERIA) {
    const x = e.criteria[c] ?? e.criteria[ALIASES[c] ?? ""];
    if (!x) { problems.push(`criterion "${c}" is missing`); continue; }
    const r = res(x.result);
    if (!r) { problems.push(`criterion "${c}": no result (pass / weak / fail / n/a)`); continue; }
    if (r === "n/a") { if (ALWAYS.includes(c)) problems.push(`criterion "${c}" always applies (n/a not allowed)`); else if ((x.result ?? "").length < 8) problems.push(`criterion "${c}": n/a needs a reason`); continue; }
    if (!/\d/.test(x.beats ?? "")) problems.push(`criterion "${c}": no beat references`);
    if (empty(x.evidence)) problems.push(`criterion "${c}": no evidence from the beats`);
    if (r !== "pass" && (empty(x.problem) || empty(x.fix))) problems.push(`criterion "${c}": a ${r} needs the problem and a fix`);
    if (r === "weak") weak++; if (r === "fail") fail++;
  }
  for (const t of STRESS_TESTS) {
    const x = e.tests[t] ?? (t === "originality" ? e.tests["reproduction"] : undefined);
    if (!x) { problems.push(`stress test "${t}" is missing`); continue; }
    if (!/^(yes|no)/i.test(x.applies ?? "")) problems.push(`stress test "${t}": applies yes / no (with a reason)`);
    else if (/^yes/i.test(x.applies ?? "")) { const r = res(x.result); if (!r || r === "n/a") problems.push(`stress test "${t}": no result`); else if (r === "fail") fail++; }
  }
  if (e.flags.length < flagCount) problems.push(`the evaluation answers ${e.flags.length} of ${flagCount} automated flags (confirm or dismiss each)`);
  const confirmed = e.flags.filter((f) => /\bconfirmed\b/i.test(f)).length;
  const verdict = (e.overall.verdict ?? "").toLowerCase().match(/^(ready|revise|reject)/)?.[1];
  const keep = /^yes/i.test(e.overall["keep-watching"] ?? "");
  if (!verdict) problems.push("overall: no verdict (ready / revise / reject)");
  if (!e.overall["keep-watching"]) problems.push("overall: keep-watching is not answered");
  const blocking: string[] = [];
  if (fail) blocking.push(`${fail} fail(s)`); if (weak > 2) blocking.push(`${weak} weak criteria`); if (!keep) blocking.push("an ordinary viewer would not keep watching");
  if (confirmed) blocking.push(`${confirmed} confirmed flag(s)`);
  const ready = verdict === "ready" && !problems.length && !blocking.length;
  if (verdict === "ready" && blocking.length) problems.push(`verdict "ready" contradicts the findings: ${blocking.join(", ")}`);
  return { ready, verdict: verdict ?? "missing", weak, fail, problems };
};
