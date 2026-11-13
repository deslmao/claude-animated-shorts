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
  /** spec 3: who has each plot-critical object at each event, in what condition, visibly or not */
  props: { object: string; event: string; holder: string; condition: string; visible: boolean; why: string }[];
  /** spec 3: every clue the viewer must read: when, what they see, what they can infer, how long, when it's answered */
  clues: { clue: string; beat: number; sees: string; infer: string; hold: number; answer: number }[];
  /** spec 3 (mysteries): the answer, when it is revealed, and the tells that must not appear (said or shown) before it */
  secret: { answer: string; at: number; tells: string[] };
  /** after phase 1: each independent finding and its resolution */
  issues: { id: string; finding: string; resolution: string; where: string; status: string }[];
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
    props: table(sub(S, "Props")).filter((r) => !empty(r.object)).map((r) => ({ object: r.object.toLowerCase(), event: (r.event ?? "").toUpperCase().match(/E\d+/)?.[0] ?? "", holder: r["holder / place"] ?? r.holder ?? "", condition: r.condition ?? "", visible: /^y/i.test(r.visible ?? ""), why: r["why it changes"] ?? r.why ?? "" })),
    clues: table(sub(S, "Clues")).filter((r) => !empty(r.clue)).map((r) => ({ clue: r.clue, beat: Number((r.beat ?? "").match(/\d+/)?.[0] ?? 0), sees: r["the viewer sees"] ?? r.sees ?? "", infer: r["they can infer"] ?? r.infer ?? "", hold: Number((r.hold ?? "").match(/[\d.]+/)?.[0] ?? 0), answer: Number((r["answer at"] ?? r.answer ?? "").match(/\d+/)?.[0] ?? 0) })),
    secret: (() => { const t = sub(S, "Secret"); return { answer: t.match(/^\s*-\s*answer:\s*(.+)$/mi)?.[1].trim() ?? "", at: Number(t.match(/^\s*-\s*revealed at:\s*(?:beat\s*)?(\d+)/mi)?.[1] ?? 0), tells: (t.match(/^\s*-\s*tells:\s*(.+)$/mi)?.[1] ?? "").split(/[,;]/).map((x) => x.trim().toLowerCase()).filter((x) => x && !/^</.test(x)) }; })(),
    issues: table(section(src, "Issue log")).filter((r) => /^I\d+$/i.test(r.id ?? "")).map((r) => ({ id: r.id.toUpperCase(), finding: r.finding ?? "", resolution: r.resolution ?? "", where: r.where ?? "", status: (r.status ?? "").toLowerCase() })),
  };
};

// ---------------------------------------------------------------- spec 3: continuity, clues, secrets, regressions
const stem = (w: string) => w.replace(/(ing|ed|es|s)$/, "");
const termHit = (text: string, term: string) => {
  // a one-word tell matches its stem anywhere ("pillow" ~ "pillows"); a phrase must appear in order with at most two
  // words between ("looks like" ~ "what it looks like", but not "look at the steps ... like a child's")
  const tw = (term.toLowerCase().match(/[a-z']{3,}/g) ?? []).map(stem), tx = (text.toLowerCase().match(/[a-z']{2,}/g) ?? []).map(stem);
  if (!tw.length) return false;
  if (tw.length === 1) return tx.includes(tw[0]);
  for (let i = 0; i < tx.length; i++) {
    if (tx[i] !== tw[0]) continue;
    let k = 1, j = i + 1;
    while (k < tw.length && j < tx.length && j - i <= tw.length + 2 * (tw.length - 1)) { if (tx[j] === tw[k]) k++; j++; }
    if (k === tw.length) return true;
  }
  return false;
};
const evIndex = (sp: Spine) => new Map(sp.events.map((e, i) => [e.id, i]));
/** the prop-state ledger: possession, place, condition, visibility, through the event chain */
export const checkProps = (s: Story, sp: Spine) => {
  const fails: string[] = [], warns: string[] = [], idx = evIndex(sp);
  const byObj = new Map<string, typeof sp.props>();
  for (const p of sp.props) { if (!idx.has(p.event)) { fails.push(`props: "${p.object}" at ${p.event || "?"}: no such event`); continue; } byObj.set(p.object, [...(byObj.get(p.object) ?? []), p]); }
  for (const [obj, rows] of byObj) {
    rows.sort((a, b) => idx.get(a.event)! - idx.get(b.event)!);
    const seen = new Map<string, string>();
    for (const r of rows) { const h = seen.get(r.event); if (h && h.toLowerCase() !== r.holder.toLowerCase()) fails.push(`props: "${obj}" is in two places at ${r.event} ("${h}" and "${r.holder}")`); seen.set(r.event, r.holder); }
    if (!rows[0].visible) warns.push(`props: "${obj}" first appears at ${rows[0].event} without being shown to the viewer`);
    for (let i = 1; i < rows.length; i++) {
      const a = rows[i - 1], b = rows[i];
      if (a.event === b.event) continue;
      const moved = a.holder.trim().toLowerCase() !== b.holder.trim().toLowerCase(), changed = a.condition.trim().toLowerCase() !== b.condition.trim().toLowerCase();
      if ((moved || changed) && empty(b.why)) fails.push(`props: "${obj}" ${moved ? `moves from "${a.holder}" to "${b.holder}"` : `changes from "${a.condition}" to "${b.condition}"`} at ${b.event} with no reason (why it changes)`);
    }
    // an object established only at the very end can't pay anything off
    const last = sp.events.length - 1, first = idx.get(rows[0].event)!;
    if (sp.events.length >= 6 && first >= last - 1) warns.push(`props: "${obj}" is first established at ${rows[0].event}, at the end. Was it set up earlier?`);
    // the storyboard must not use the object before the ledger has it on screen
    const firstVisible = rows.find((r) => r.visible);
    const fvIdx = firstVisible ? idx.get(firstVisible.event)! : Infinity;
    for (const b of s.beats) {
      const bIdx = Math.min(...b.events.map((e) => idx.get(e) ?? Infinity));
      if (!isFinite(bIdx)) continue;
      if (termHit(b.happens + " " + b.subject, obj) && bIdx < fvIdx && bIdx < first) warns.push(`props: beat ${b.n} shows "${obj}" before the ledger establishes it (${rows[0].event})`);
    }
  }
  return { fails, warns };
};
/** fair clues: shown, held long enough, before they're answered; resting on objects the ledger has on screen */
export const checkClues = (s: Story, sp: Spine) => {
  const fails: string[] = [], warns: string[] = [], beats = new Set(s.beats.map((b) => b.n));
  for (const c of sp.clues) {
    if (empty(c.sees)) fails.push(`clues: "${c.clue}": what does the viewer actually see?`);
    if (empty(c.infer)) fails.push(`clues: "${c.clue}": what can the viewer reasonably infer?`);
    if (beats.size && !beats.has(c.beat)) fails.push(`clues: "${c.clue}" is placed at beat ${c.beat}, which doesn't exist`);
    if (c.answer && c.answer <= c.beat) fails.push(`clues: "${c.clue}" is answered (beat ${c.answer}) before or as it's shown (beat ${c.beat})`);
    if (c.hold < 1.2) warns.push(`clues: "${c.clue}" is held ${c.hold || "?"} s. A clue the viewer must read needs about 1.2 s or more on screen`);
  }
  return { fails, warns };
};
/** the giveaway guard: no tell of the answer, said OR shown, before the reveal beat */
export const checkSecret = (s: Story, sp: Spine) => {
  const fails: string[] = [], warns: string[] = [];
  if (!sp.secret.answer || !sp.secret.at) return { fails: ["secret: state the answer and the beat it's revealed at (### Secret)"], warns };
  if (!sp.secret.tells.length) warns.push("secret: no tells listed (the words and images that would give the answer away early)");
  for (const b of s.beats.filter((x) => x.n < sp.secret.at)) {
    const said = b.lines.map((l) => l.text).join(" "), shown = `${b.happens} ${b.subject}`;
    for (const t of sp.secret.tells) {
      if (termHit(said, t)) fails.push(`giveaway: beat ${b.n} SAYS "${t}" before the reveal at beat ${sp.secret.at}`);
      else if (termHit(shown, t)) fails.push(`giveaway: beat ${b.n} SHOWS "${t}" before the reveal at beat ${sp.secret.at}`);
    }
  }
  return { fails, warns };
};
/** turns a phase-1 evaluation into numbered issues (stable ids in the order criteria, then stress tests) */
export const phase1Issues = (evalSrc: string) => {
  const out: { id: string; kind: string; result: string; problem: string; fix: string }[] = [];
  for (const sec of ["Criteria", "Stress tests"]) {
    const body = section(evalSrc, sec);
    for (const blk of body.split(/^###\s+/m).slice(1)) {
      const [h, ...r] = blk.split("\n"); const kv = bl(r.join("\n")); const res = (kv.result ?? "").toLowerCase();
      if (/^(weak|fail)/.test(res)) out.push({ id: `I${out.length + 1}`, kind: h.trim(), result: res.split(/\W/)[0], problem: kv.problem ?? kv.finding ?? "", fix: kv.fix ?? "" });
    }
  }
  return out;
};
/** every phase-1 issue must be resolved (or explained); events changed since phase 1 flag their downstream consequences */
export const checkRevision = (sp: Spine, issues: ReturnType<typeof phase1Issues>, v1Packet: string | undefined, currentPacket: string) => {
  const fails: string[] = [], warns: string[] = [], downstream: string[] = [];
  const log = new Map(sp.issues.map((i) => [i.id, i]));
  for (const i of issues) {
    const r = log.get(i.id);
    if (!r) { fails.push(`issue ${i.id} (${i.kind}, ${i.result}) has no row in the ## Issue log`); continue; }
    if (empty(r.resolution)) fails.push(`issue ${i.id}: no resolution`);
    if (!/^(resolved|no longer applies)/.test(r.status)) fails.push(`issue ${i.id}: status must be "resolved" or "no longer applies: <reason>"`);
    if (/^no longer applies$/.test(r.status.trim())) fails.push(`issue ${i.id}: "no longer applies" needs a reason`);
  }
  if (v1Packet) {
    const rowsOf = (t: string) => new Map([...t.matchAll(/^\| (E\d+) \|(.*)$/gm)].map((m) => [m[1], m[2].trim()]));
    const a = rowsOf(v1Packet), b = rowsOf(currentPacket);
    const ids = [...new Set([...a.keys(), ...b.keys()])].sort((x, y) => Number(x.slice(1)) - Number(y.slice(1)));
    const changed = ids.filter((id) => a.get(id) !== b.get(id));
    if (changed.length) {
      const first = Math.min(...changed.map((id) => Number(id.slice(1))));
      const after = ids.filter((id) => Number(id.slice(1)) > first && !changed.includes(id));
      downstream.push(`events changed since phase 1: ${changed.join(", ")}; downstream events to re-check: ${after.join(", ") || "none"}`);
      const covered = new Set(sp.issues.flatMap((i) => (i.where.toUpperCase().match(/E\d+/g) ?? [])));
      for (const id of changed) if (!covered.has(id)) warns.push(`${id} changed since phase 1 but no issue resolution mentions it. Was the change intended, and are its consequences checked?`);
    }
  }
  return { fails, warns, downstream };
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
export const lintSpine = (s: Story, sp: Spine, spec3 = false): SpineLint => {
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
  // ---- easy outs must still point at events that exist (a revision that drops an event can silently break a defence)
  const ids = new Set(sp.events.map((e) => e.id));
  for (const r of sp.easyOuts) for (const ref of (r["why it fails"] ?? "").toUpperCase().match(/E\d+/g) ?? []) if (!ids.has(ref)) fails.push(`easy out "${(r["obvious fix"] ?? "").slice(0, 40)}" relies on ${ref}, which no longer exists`);
  // ---- spec 3: continuity, fair clues, the giveaway guard
  const mystery = s.format.some((x) => x === "mystery" || x === "immersive");
  if (spec3) {
    if (!sp.props.length && (depth !== "light" || mystery)) fails.push("props: no prop-state ledger (### Props): track every object the plot, a clue or a deduction depends on");
    if (mystery && !sp.clues.length) fails.push("clues: no clue ledger (### Clues): what the viewer sees, when, what they can infer, how long it's held");
    if (s.format.includes("mystery") && (!sp.secret.answer || !sp.secret.at)) fails.push("secret: a mystery needs ### Secret (the answer, the beat it's revealed at, and its tells)");
  }
  if (sp.props.length) { const r = checkProps(s, sp); fails.push(...r.fails); warns.push(...r.warns); }
  if (sp.clues.length && s.beats.length) { const r = checkClues(s, sp); fails.push(...r.fails); warns.push(...r.warns); }
  if ((sp.secret.answer || sp.secret.at) && s.beats.length) { const r = checkSecret(s, sp); fails.push(...r.fails); warns.push(...r.warns); }
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
    ...(sp.props.length ? ["## Plot-critical objects (who has each one, where, and in what state, at each event)", "| object | event | holder / place | condition | visible |", "|---|---|---|---|---|", ...sp.props.map((p) => `| ${c(p.object)} | ${p.event} | ${c(p.holder)} | ${c(p.condition)} | ${p.visible ? "yes" : "no"} |`), ""] : []),
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
