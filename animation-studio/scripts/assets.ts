// Asset library tool (stage 3C):  npm run assets -- <command>
//   search <words...> [--kind character|set|prop|item|...]   find reusable assets (run this BEFORE creating anything)
//   similar <words...>                                         duplicate check: what already resembles a planned asset
//   show <id>                                                  one asset in full
//   themes                                                     themed collections and what they hold
//   check <story-id> [--json out.json]                         every asset a storyboard uses: reused / missing
//   doc [--check]                                              regenerate docs/ASSETS.md (--check: fail if out of date)
import "./lib/dom-stub";
import fs from "node:fs";
import { ASSETS, searchAssets, THEME_LIST, AssetKind, Asset } from "../src/studio/library/registry";
import { STORIES } from "../src/studio/stories";
import { linesOf, voiceOf } from "../src/studio/story/timing";
import { autoMood } from "../src/studio/sound/cues";
import { ambienceFor } from "../src/studio/sound/catalog";

const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const [cmd, ...rest] = proc.process.argv.slice(2);
const flag = (k: string) => { const i = rest.indexOf(k); return i >= 0 ? rest.splice(i, 2)[1] : undefined; };
const line = (a: Asset, score?: number) => `  ${a.kind.padEnd(9)} ${a.id.padEnd(22)} ${a.name.padEnd(26).slice(0, 26)} ${a.desc.slice(0, 70)}${score !== undefined ? `  (${score.toFixed(1)})` : ""}`;

if (cmd === "search" || cmd === "similar") {
  const kind = flag("--kind") as AssetKind | undefined, q = rest.join(" ");
  const hits = searchAssets(q, kind, cmd === "similar" ? 8 : 25);
  console.log(`${hits.length} match${hits.length === 1 ? "" : "es"} for "${q}"${kind ? ` (${kind})` : ""}:`);
  for (const h of hits) console.log(line(h.a, h.score));
  if (cmd === "similar") console.log(hits.length && hits[0].score >= 6 ? "\nstrong match: reuse or extend the existing asset instead of creating a duplicate" : "\nno strong match: a new asset is justified");
} else if (cmd === "show") {
  const a = ASSETS.filter((x) => x.id === rest[0]);
  if (!a.length) { console.log(`no asset "${rest[0]}"`); proc.process.exit(1); }
  for (const x of a) console.log(`${x.kind} ${x.id}: ${x.name}\n  ${x.desc}\n  themes: ${x.themes.join(", ")}\n  tags: ${x.tags.join(", ")}${x.details ? `\n  ${x.details}` : ""}`);
} else if (cmd === "themes") {
  if (!THEME_LIST.length) console.log("no themed collections yet (they are added to src/studio/themes/ when a topic needs one)");
  for (const t of THEME_LIST) console.log(`${t.id}: ${t.name}: ${t.desc}\n  characters: ${t.characters.join(", ") || "-"}\n  props: ${t.props.join(", ") || "-"}\n  items: ${t.items.join(", ") || "-"}\n  sets: ${t.sets.join(", ") || "-"}`);
} else if (cmd === "check") {
  const out = flag("--json"), found = STORIES.find((s) => s.id === rest[0]);
  if (!found) { console.log(`no story "${rest[0]}" (stories: ${STORIES.map((s) => s.id).join(", ")})`); proc.process.exit(1); }
  const sb = found!;
  const used = new Map<string, Set<string>>(), add = (k: string, id?: string | null) => { if (!id) return; if (!used.has(k)) used.set(k, new Set()); used.get(k)!.add(id); };
  for (const ref of Object.values(sb.cast)) if (typeof ref === "string") add("character", ref); else add("extras", `extras:${ref.era ?? "modern"}`);
  const mood = sb.music === false ? null : typeof sb.music === "string" ? sb.music : sb.music?.mood ?? autoMood(sb).mood;
  add("mood", mood);
  for (const s of sb.shots) {
    add("set", s.set); add("light", s.light); add("camera", s.camera.move); add("mood", s.mood);
    add("ambience", s.ambience === false ? null : s.ambience ?? ambienceFor(s.set, s.light ?? "day"));
    for (const l of linesOf(s)) add("voice", voiceOf(sb, l));
    for (const p of s.props ?? []) add("prop", p.id);
    for (const f of s.fx ?? []) add("effect", f.kind);
    for (const x of s.sfx ?? []) add("sfx", x.name);
    if (s.crowd) add("extras", `extras:${s.crowd.era ?? "modern"}`);
    for (const a of s.actors) {
      add("act", a.act); add("face", a.face); add("gesture", a.gesture); add("item", a.hold);
      for (const b of a.beats ?? []) { add("act", b.act); add("face", b.face); add("gesture", b.gesture); add("item", b.hold ?? undefined); }
    }
  }
  const report: Record<string, { reused: string[]; missing: string[] }> = {};
  let reused = 0, missing = 0;
  for (const [k, ids] of used) {
    const r = { reused: [] as string[], missing: [] as string[] };
    for (const id of ids) (ASSETS.some((a) => a.kind === k && a.id === id) ? r.reused : r.missing).push(id);
    report[k] = r; reused += r.reused.length; missing += r.missing.length;
    console.log(`  ${k.padEnd(10)} reused: ${r.reused.join(", ") || "-"}${r.missing.length ? `   MISSING: ${r.missing.join(", ")}` : ""}`);
  }
  console.log(`\n${sb.id}: ${reused} library assets reused, ${missing} missing${missing ? " (create them in the library first: see docs/ASSETS.md 'Adding an asset')" : ""}`);
  if (out) fs.writeFileSync(out, JSON.stringify({ story: sb.id, reused, missing, report }, null, 1));
  proc.process.exit(missing ? 1 : 0);
} else if (cmd === "doc") {
  const kinds: AssetKind[] = ["character", "extras", "set", "prop", "item", "effect", "camera", "light", "mood", "ambience", "sfx", "voice", "act", "face", "gesture"];
  let md = `# Asset catalogue\n\nGENERATED by \`npm run assets -- doc\` from the live library (src/studio/library/registry.ts): do not edit by hand.\n${ASSETS.length} assets. Search it with \`npm run assets -- search <words>\`; see docs/LIBRARY.md for how to use them.\n\n`;
  md += `## Themed collections\n${THEME_LIST.length ? THEME_LIST.map((t) => `- **${t.name}** (\`${t.id}\`): ${t.desc}. Characters: ${t.characters.join(", ") || "-"}; props: ${t.props.join(", ") || "-"}; items: ${t.items.join(", ") || "-"}; sets: ${t.sets.join(", ") || "-"}`).join("\n") : "None yet: a theme is created the first time a topic needs it (pirates, ancient Rome, space...), then reused."}\n\n`;
  for (const k of kinds) {
    const list = ASSETS.filter((a) => a.kind === k);
    if (!list.length) continue;
    md += `## ${k} (${list.length})\n| id | name | description | themes | tags |\n|---|---|---|---|---|\n`;
    for (const a of list) md += `| \`${a.id}\` | ${a.name} | ${(a.desc + (a.details ? ` (${a.details})` : "")).replace(/\|/g, "/")} | ${a.themes.join(", ")} | ${a.tags.join(", ").replace(/\|/g, "/")} |\n`;
    md += "\n";
  }
  const PATH = "../docs/ASSETS.md";
  if (rest.includes("--check")) {
    const ok = fs.existsSync(PATH) && fs.readFileSync(PATH, "utf8") === md;
    console.log(ok ? "docs/ASSETS.md is up to date" : "docs/ASSETS.md is OUT OF DATE (run npm run assets -- doc)");
    proc.process.exit(ok ? 0 : 1);
  }
  fs.writeFileSync(PATH, md);
  console.log(`wrote docs/ASSETS.md (${ASSETS.length} assets)`);
} else {
  console.log("usage: npm run assets -- search <words> [--kind k] | similar <words> | show <id> | themes | check <story-id> [--json f] | doc [--check]");
  proc.process.exit(2);
}
