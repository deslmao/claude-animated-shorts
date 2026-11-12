// The Story Spine (docs/STORYTELLING.md §2): the plot built and checked BEFORE dialogue. Required for `spec: 2` stories
// (every new story, from productions/_template/story.md); older story files without it keep working unchanged.
//   parseSpine        reads `## Spine` (constraints, alternatives, event chain, easy outs, references, claims, demonstration)
//   planningDepth     light / standard / deep, from the story's real complexity (events, characters, rules, payoffs,
//                     factual load, competing explanations): the depth sets how much planning detail is required
//   lintSpine         the essential logic checks (every depth) plus the depth-scaled detail; FAIL = must fix, flags =
//                     signals for the independent evaluator (e.g. a reference that tracks its source closely)
//   buildSpinePacket  the phase-1 evaluator's input: the plot as events and pictures, without the writer's reasoning
//   gateSpineEval     reads eval/spine-evaluation.md (proceed / revise / reject)
import type { Story } from "./story";

const section = (src: string, name: string) => {
  const m = src.match(new RegExp(`^##\\s+${name}\\b[^\\n]*\\n([\\s\\S]*?)(?=^##\\s|$(?![\\s\\S]))`, "mi"));
  return m ? m[1].replace(/<!--[\s\S]*?-->/g, "") : "";
};
const sub = (s: string, name: string) => {
  const m = s.match(new RegExp(`^###\\s+${name}\\b[^\\n]*\\n([\\s\\S]*?)(?=^###\\s|$(?![\\s\\S]))`, "mi"));
  return m ? m[1] : "";
};
const table = (s: string) => {
  const r = s.split("\n").filter((l) => /^\s*\|/.test(l) && !/^\s*\|\s*-/.test(l)).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
  if (!r.length) return [] as Record<string, string>[];
  const h = r[0].map((x) => x.toLowerCase());
  return r.slice(1).map((row) => Object.fromEntries(h.map((k, i) => [k, row[i] ?? ""])));
};
const bullets = (s: string) => [...s.matchAll(/^\s*-\s+(.+)$/gm)].map((m) => m[1].trim());
const empty = (v?: string) => !v || /^(<.*>|none|n\/a|-|tbd|todo)?$/i.test(v.trim());
const words = (s: string) => new Set((s.toLowerCase().match(/[a-z]{4,}/g) ?? []));
const similar = (a: string, b: string) => { const A = words(a), B = words(b); if (!A.size || !B.size) return a.trim().toLowerCase() === b.trim().toLowerCase(); let n = 0; for (const w of A) if (B.has(w)) n++; return n / Math.min(A.size, B.size) >= 0.6; };

export type SpineEvent = { id: string; event: string; link: string; why: string; decision: string; proof: string };
export type Spine = {
  present: boolean; declared?: string;
  constraints: string[];
  alternatives: Record<string, string>[]; chosen: string;
  events: SpineEvent[];
  easyOuts: Record<string, string>[];
  references: Record<string, string>[]; referencesNone: boolean;
  claims: Record<string, string>[];
  demonstration: string[];
};

export const parseSpine = (src: string): Spine => {
  const S = section(src, "Spine");
  const alt = sub(S, "Alternatives");
  const ev = table(sub(S, "Event chain")).filter((r) => /^E\d+$/i.test(r["#"] ?? r.id ?? ""));
  return {
    present: !!S.trim(),
    declared: S.match(/^depth:\s*(light|standard|deep)/mi)?.[1]?.toLowerCase(),
    constraints: bullets(sub(S, "Constraints")),
    alternatives: table(alt).filter((r) => /^\d+$/.test(r["#"] ?? "")), chosen: alt.match(/^\s*-\s*chosen:\s*(.+)$/mi)?.[1].trim() ?? "",
    events: ev.map((r) => ({ id: (r["#"] ?? r.id).toUpperCase(), event: r.event ?? "", link: (r.link ?? "").toLowerCase(), why: r.why ?? r.because ?? "", decision: r.decision ?? "", proof: r["visual proof"] ?? r.proof ?? "" })),
    easyOuts: table(sub(S, "Easy outs")).filter((r) => !empty(r["obvious fix"] ?? r.fix)),
    references: table(sub(S, "References")).filter((r) => !empty(r.source)), referencesNone: /^\s*-?\s*none\b/mi.test(sub(S, "References")),
    claims: table(sub(S, "Claims")).filter((r) => /^C\d+$/i.test(r.id ?? r["#"] ?? "")),
    demonstration: bullets(sub(S, "Demonstration")),
  };
};

export type Depth = "light" | "standard" | "deep";
/** how much planning the story needs, from its real complexity */
export const planningDepth = (s: Story, sp: Spine): { depth: Depth; why: string[] } => {
  const speakers = new Set(s.beats.flatMap((b) => b.lines.map((l) => l.who)).filter((w) => w !== "narrator"));
  const f = {
    events: sp.events.length, characters: speakers.size + (/(^|\b)you\b/i.test(s.premise.protagonist ?? "") ? 1 : 0),
    rules: sp.constraints.length, payoffs: s.setups.length, factual: s.factual ? Math.max(1, sp.claims.length) : 0,
    competing: s.format.some((x) => x === "immersive" || x === "mystery") && !/^(none|-)?$/i.test((s.premise.conflict ?? "").trim()),
  };
  let score = 0; const why: string[] = [];
  if (f.events > 10) { score += 2; why.push(`${f.events} events`); } else if (f.events > 6) { score += 1; why.push(`${f.events} events`); }
  if (f.characters > 3) { score += 2; why.push(`${f.characters} characters`); } else if (f.characters > 1) { score += 1; why.push(`${f.characters} characters`); }
  if (f.rules > 4) { score += 1; why.push(`${f.rules} rules / constraints`); }
  if (f.payoffs > 3) { score += 2; why.push(`${f.payoffs} setups/payoffs`); } else if (f.payoffs > 1) { score += 1; why.push(`${f.payoffs} setups/payoffs`); }
  if (f.factual) { score += f.factual > 5 ? 3 : 2; why.push(`factual (${f.factual} claims)`); }
  if (f.competing) { score += 2; why.push("competing explanations"); }
  const depth: Depth = score >= 6 ? "deep" : score >= 3 ? "standard" : "light";
  return { depth, why };
};

const NEED = { light: { alternatives: 2, easyOuts: 1 }, standard: { alternatives: 3, easyOuts: 2 }, deep: { alternatives: 3, easyOuts: 3 } } as const;
const LINKS = ["start", "because", "therefore", "but", "so"];

export type SpineLint = { depth: Depth; why: string[]; fails: string[]; warns: string[]; flags: string[] };
export const lintSpine = (s: Story, sp: Spine): SpineLint => {
  const { depth, why } = planningDepth(s, sp), need = NEED[depth];
  const fails: string[] = [], warns: string[] = [], flags: string[] = [];
  const rank = { light: 0, standard: 1, deep: 2 };
  if (sp.declared && rank[sp.declared as Depth] < rank[depth]) fails.push(`spine depth "${sp.declared}" is lighter than this story needs ("${depth}": ${why.join(", ")})`);
  // ---- essential logic checks (every depth)
  for (const k of ["want", "loses", "obstacle"]) if (empty(s.premise[k])) fails.push(`premise: no "${k}" (what they want / what they lose if they fail / what stops them)`);
  if (!sp.constraints.length) fails.push("spine: no constraints (the rules of the situation: physical, in-world, factual)");
  if (sp.events.length < 3) fails.push(`spine: ${sp.events.length} events in the event chain (the plot must work as events before any dialogue)`);
  sp.events.forEach((e, i) => {
    if (empty(e.event)) fails.push(`${e.id}: no event`);
    const l = e.link.split(/\W/)[0];
    if (i === 0) { if (l !== "start") warns.push(`${e.id}: the first event's link should be "start"`); }
    else if (!LINKS.includes(l)) fails.push(`${e.id}: link "${e.link || "?"}" must be because / therefore / but / so (an event that only follows "and then" isn't caused)`);
    if (i > 0 && empty(e.why)) fails.push(`${e.id}: no "why": why does this happen, given what came before?`);
    if (empty(e.proof)) fails.push(`${e.id}: no visual proof (what the viewer sees that proves this event)`);
    if (depth === "deep" && !empty(e.decision) && !/rejected|instead|rather than|not\b/i.test(e.decision)) warns.push(`${e.id}: the decision doesn't say what the character rejected, and why`);
  });
  if (sp.easyOuts.length < need.easyOuts) fails.push(`easy outs: ${sp.easyOuts.length} of ${need.easyOuts} needed at ${depth} depth (the obvious fixes a viewer will think of, and why each fails on screen)`);
  for (const r of sp.easyOuts) if (empty(r["why it fails"] ?? r.fails)) fails.push(`easy out "${(r["obvious fix"] ?? r.fix ?? "").slice(0, 40)}": no reason it fails on screen`);
  // ---- alternatives: genuinely different directions, not reskins
  if (sp.alternatives.length < need.alternatives) fails.push(`alternatives: ${sp.alternatives.length} of ${need.alternatives} plot directions explored at ${depth} depth`);
  const F = ["central conflict", "key decision", "solution", "ending"];
  for (let i = 0; i < sp.alternatives.length; i++) for (let j = i + 1; j < sp.alternatives.length; j++) {
    const same = F.filter((k) => similar(sp.alternatives[i][k] ?? "", sp.alternatives[j][k] ?? ""));
    if (F.length - same.length < 2) fails.push(`alternatives ${sp.alternatives[i]["#"]} and ${sp.alternatives[j]["#"]} differ in only ${F.length - same.length} of: ${F.join(", ")} (a reskin, not a different direction)`);
  }
  if (sp.alternatives.length && empty(sp.chosen)) fails.push("alternatives: say which direction was chosen, and why");
  // ---- the storyboard must carry the events
  const covered = new Set(s.beats.flatMap((b) => b.events));
  if (s.beats.some((b) => b.events.length)) { for (const e of sp.events) if (!covered.has(e.id)) fails.push(`${e.id} isn't shown in any beat (beats' "events" column)`); }
  else if (s.beats.length && sp.events.length) warns.push("beats have no \"events\" column: link each beat (or continuous sequence) to the events it shows");
  // ---- references: inspiration is welcome; close tracking of one source's sequence is a flag for closer examination
  if (depth !== "light" && !sp.references.length && !sp.referencesNone) fails.push('references: list the inspirations (sources, tropes, formats), or write "none"');
  for (const r of sp.references) {
    const stages = ["setup", "escalation", "solution", "ending"], same = stages.filter((k) => /^(same|similar)/i.test(r[k] ?? ""));
    if (same.length >= 3) flags.push(`reference "${r.source}": ${same.length} of 4 stages (${same.join(", ")}) are marked same/similar. Examine closely: is the source's distinctive sequence reproduced, or transformed (motivations, conflict, meaning)?`);
    if (/dialogue|line|scene/i.test(r.borrowed ?? "")) warns.push(`reference "${r.source}" borrows "${r.borrowed}": never reproduce dialogue or a distinctive scene; use original expression`);
  }
  // ---- factual stories: every factual line points to a claim
  if (s.factual) {
    if (!sp.claims.length) fails.push("factual story: no claims ledger (### Claims: id, claim, source, quote)");
    for (const c of sp.claims) if (empty(c.source) || empty(c.quote)) fails.push(`${c.id ?? c["#"]}: a claim needs a source and a supporting quote`);
    const ids = new Set(sp.claims.map((c) => (c.id ?? c["#"]).toUpperCase()));
    if (s.beats.length) for (const b of s.beats) { for (const c of b.claims) if (!ids.has(c)) fails.push(`beat ${b.n}: claim ${c} isn't in the ledger`); if (b.lines.length && !b.claims.length) warns.push(`beat ${b.n}: no claim reference (fine if it states no fact; otherwise cite it)`); }
    if (s.format.includes("action-first") && !sp.demonstration.length) warns.push("explanation: no ### Demonstration (one consistent visual model and its states)");
  }
  // ---- readable sequences (not a rule of one shot per line: a continuous sequence can carry several lines)
  for (const b of s.beats) { const acts = b.happens.split(/;|,\s*then\b/).filter((x) => x.trim()).length; if (acts > 4) warns.push(`beat ${b.n}: ${acts} actions in one beat. Is each readable at Shorts pace, or should the sequence breathe?`); }
  return { depth, why, fails, warns, flags };
};

// ---------------------------------------------------------------- phase 1: the plot, judged before dialogue
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
/** the plot as a viewer would experience it: premise, rules, events and their pictures. No "why" column (the
 *  evaluator judges whether causes are on screen), no easy outs (the writer's defence), no alternatives, no notes */
export const buildSpinePacket = (s: Story, sp: Spine, research: string, flags: string[]) => {
  const c = (x: string) => x.replace(/\|/g, "/");
  const body = [
    `# Spine evaluation packet (phase 1): ${s.title}`, "",
    `format (as claimed by the writer): ${s.format.join(" + ")} · factual: ${s.factual ? "yes" : "no (fiction)"}`, "",
    "## Premise",
    ...["protagonist", "want", "loses", "obstacle", "conflict", "rule"].filter((k) => !empty(s.premise[k])).map((k) => `- ${k}: ${s.premise[k]}`), "",
    "## Rules of the situation", ...sp.constraints.map((x) => `- ${x}`), "",
    "## Event chain (what happens, in order, and what the viewer sees)",
    "| # | link | event | decision | what the viewer sees |", "|---|---|---|---|---|",
    // the decision as taken, without the writer's "(rejected: ..., because ...)" defence: the evaluator probes alternatives itself
    ...sp.events.map((e) => `| ${e.id} | ${c(e.link)} | ${c(e.event)} | ${c(e.decision.replace(/\s*\(?\s*rejected:[^)]*\)?/gi, "").trim() || "-")} | ${c(e.proof)} |`), "",
    "## Ending as planned", /decision/i.test(s.ending.type ?? "") ? `On-screen choice: A: ${(s.ending.a ?? "").split("->")[0].trim()} / B: ${(s.ending.b ?? "").split("->")[0].trim()}` : `Ending type: ${s.ending.type ?? "?"}`, "",
    "## Declared inspirations", ...(sp.references.length ? sp.references.map((r) => `- ${r.source}: borrows ${r.borrowed || "?"}`) : ["- none declared"]), "",
    "## Automated flags (heuristic: confirm or dismiss in context)", ...(flags.length ? flags.map((x) => `- ${x}`) : ["- (none)"]), "",
    ...(s.factual ? ["## Claims ledger", ...sp.claims.map((x) => `- ${x.id ?? x["#"]}: ${x.claim} (source: ${x.source}; quote: "${x.quote}")`), "", "## Research", research.trim(), ""] : []),
  ].join("\n");
  const h = hash(body);
  return { text: `${body}\npacket: ${h}\n`, hash: h };
};

const bl = (s: string) => Object.fromEntries([...s.matchAll(/^\s*-\s*([A-Za-z][\w -]*?)\s*:\s*(.*)$/gm)].map((m) => [m[1].trim().toLowerCase(), m[2].trim()]));
export const PHASE1_CRITERIA = ["clarity", "cause and effect", "emotional investment", "setup and payoff", "originality and adaptation", "accuracy"];
export const PHASE1_TESTS = ["plot hole", "consistency", "dilemma balance", "emotional cost", "reproduction", "cold viewer"];
export const gateSpineEval = (src: string, packetHash: string) => {
  const blocks = (s: string) => Object.fromEntries(s.split(/^###\s+/m).slice(1).map((b) => { const [h, ...r] = b.split("\n"); return [h.trim().toLowerCase(), bl(r.join("\n"))]; }));
  const crit = blocks(section(src, "Criteria")), tests = blocks(section(src, "Stress tests")), overall = bl(section(src, "Overall"));
  const problems: string[] = [];
  if (src.match(/^packet:\s*([0-9a-f]+)/m)?.[1] !== packetHash) problems.push("the spine evaluation is for an older spine: re-run phase 1, or proceed knowing it is stale");
  for (const k of PHASE1_CRITERIA) if (!crit[k]?.result) problems.push(`criterion "${k}" missing`);
  for (const k of PHASE1_TESTS) if (!tests[k]?.applies) problems.push(`stress test "${k}" missing`);
  const verdict = (overall.verdict ?? "").toLowerCase().match(/^(proceed|revise|reject)/)?.[1] ?? "missing";
  return { verdict, problems, fails: Object.values({ ...crit, ...tests }).filter((x) => /^fail/i.test(x.result ?? "")).length, weak: Object.values(crit).filter((x) => /^weak/i.test(x.result ?? "")).length };
};
