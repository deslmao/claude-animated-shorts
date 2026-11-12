// Story format (docs/STORYTELLING.md): productions/<id>/story.md = the script and its visual plan in one beat sheet.
// parseStory reads it; lintStory checks the mechanical parts of the evaluator (structure, cause and effect, setups and
// payoffs, static or repetitive visuals, the decision, length, sources). Judgement stays with the written evaluation.

export const FORMATS = ["immersive", "action-first", "world-rule", "emotional", "mystery", "serial"] as const;
export const CAMERA_WORDS = ["wide", "full", "medium", "close", "extreme", "closeup", "insert", "pov", "overshoulder", "pushin", "pullout",
  "follow", "lowhero", "highangle", "dutch", "orbit", "crane", "establish", "view", "frame", "whip", "hold"];
const STATIC = /^(stands?|standing|talks?|talking|explains?|explaining|says|speaks|listens?|waits?|idle|poses?|looks at (the )?camera|faces (the )?camera)\b[\s.,;]*$/i;

export type StoryLine = { who: string; text: string };
export type Beat = { n: number; lines: StoryLine[]; happens: string; learns: string; subject: string; action: string; camera: string; changes: string; sound: string };
export type Story = {
  title: string; format: string[]; why: string; length?: number; voice?: string; voices: Record<string, string>; mood?: string; factual: boolean;
  premise: Record<string, string>; setups: { setup: string; beat: number; payoff: number; how: string }[];
  beats: Beat[]; ending: Record<string, string>; evaluation: Record<string, string>;
};

const section = (src: string, name: string) => {
  const m = src.match(new RegExp(`^##\\s+${name}\\b[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, "mi"));
  return m ? m[1].replace(/<!--[\s\S]*?-->/g, "") : "";
};
const bullets = (s: string) => Object.fromEntries([...s.matchAll(/^\s*-\s*([A-Za-z][\w -]*?)\s*:\s*(.*)$/gm)].map((m) => [m[1].trim().toLowerCase(), m[2].trim()]));
const rows = (s: string) => s.split("\n").filter((l) => /^\s*\|/.test(l) && !/^\s*\|\s*-/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
const empty = (v?: string) => !v || /^(<.*>|none|n\/a|-|tbd|todo)?$/i.test(v.trim());

export const parseStory = (src: string): Story => {
  const head = src.split(/^##\s/m)[0];
  const meta = (k: string) => head.match(new RegExp(`^${k}:\\s*(.+)$`, "mi"))?.[1].trim();
  const voices = Object.fromEntries((meta("voices") ?? "").split(",").map((p) => p.split("=").map((x) => x.trim())).filter((p) => p.length === 2 && p[0] && p[1]));
  const beatRows = rows(section(src, "Beats")).slice(1);
  const beats: Beat[] = beatRows.filter((r) => /^\d+$/.test(r[0])).map((r) => ({
    n: Number(r[0]),
    lines: (r[1] ?? "").split(/\s+\/\s+/).map((x) => x.trim()).filter((x) => x && x !== "~").map((x) => { const m = x.match(/^([a-z][\w]*):\s+(.+)$/); return m ? { who: m[1], text: m[2] } : { who: "narrator", text: x }; }),
    happens: r[2] ?? "", learns: r[3] ?? "", subject: r[4] ?? "", action: r[5] ?? "", camera: r[6] ?? "", changes: r[7] ?? "", sound: r[8] ?? "",
  }));
  const setups = rows(section(src, "Setups and payoffs")).slice(1).filter((r) => r.length >= 3 && /\d/.test(r[1] ?? "")).map((r) => ({ setup: r[0], beat: Number(r[1]), payoff: Number(r[2]), how: r[3] ?? "" }));
  return {
    title: src.match(/^#\s+(.+)$/m)?.[1].trim() ?? "untitled",
    format: (meta("format") ?? "").toLowerCase().split("+").map((f) => f.trim()).filter(Boolean),
    why: meta("why") ?? "", length: meta("length") ? Number(meta("length")) : undefined, voice: meta("voice"), voices, mood: meta("mood"),
    factual: /^(yes|true)/i.test(meta("factual") ?? "no"),
    premise: bullets(section(src, "Premise")), setups, beats, ending: bullets(section(src, "Ending")), evaluation: bullets(section(src, "Evaluation")),
  };
};

export type Lint = { fails: string[]; warns: string[]; estimate: number; words: number; chars: number };
/** est(text, who): seconds for one spoken line (the narration estimator, by the line's voice) */
export const lintStory = (s: Story, est: (text: string, who: string) => number, sources: number): Lint => {
  const fails: string[] = [], warns: string[] = [], P = s.premise, f = s.format;
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
  // setups and payoffs
  for (const p of s.setups) {
    if (!B.some((b) => b.n === p.beat) || !B.some((b) => b.n === p.payoff)) fails.push(`setup "${p.setup}": beat ${p.beat} or ${p.payoff} does not exist`);
    else if (p.payoff <= p.beat) fails.push(`setup "${p.setup}": the payoff (beat ${p.payoff}) must come after the setup (beat ${p.beat})`);
  }
  // ending
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
  if (has("immersive") && !/\b(you|your)\b/i.test(lines.slice(0, 2).map((l) => l.text).join(" "))) warns.push("immersive: the opening isn't in the second person (\"Imagine your...\"): is the viewer inside the situation?");
  if (has("action-first") && !/\byou see\b|here'?s (why|the thing)|the reason|it turns out|because\b/i.test(lines.map((l) => l.text).join(" "))) warns.push("action-first: no explanation turn");
  // facts
  if (s.factual && sources < 2) fails.push(`factual story: research.md lists ${sources} source URL(s), at least 2 are required (viral videos and comments are not sources)`);
  return { fails, warns, estimate, words, chars };
};
