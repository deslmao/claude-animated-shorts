// Library protection test: existing assets must keep their names AND their data, because storyboards (and finished
// videos) refer to them by name. Compares the live library with tests/library-snapshot.json:
//   FAIL  an asset was removed / renamed, or its data changed (a character's recipe, a set's marks / views, a light,
//         a voice preset): an existing video would change or break
//   NEW   an asset was added: fine; record it with --update so it is protected from then on
//   npm run test:library              check
//   npm run test:library -- --update  record additions (refuses while anything FAILs)
import "./lib/dom-stub";
import fs from "node:fs";
import { CAST, extra, Era } from "../src/studio/characters/cast";
import { ACT_NAMES, FACES, GESTURES } from "../src/studio/characters/figure";
import { FX_KINDS } from "../src/studio/fx/effects";
import { SETS } from "../src/studio/sets";
import { LAYOUTS } from "../src/studio/sets/layouts";
import { LIGHTS } from "../src/studio/look/lights";
import { VOICES } from "../src/studio/voice/voices";
import { fnv } from "../src/studio/voice/narration";
import { ROSTER } from "../src/studio/characters/roster";
import { ITEMS } from "../src/studio/characters/items";
import { PROPS } from "../src/studio/props/registry";
import { ASSETS } from "../src/studio/library/registry";
import { Batch } from "../src/studio/materials/geo";
import { Pen } from "../src/studio/characters/toon";
import { spawnSync } from "node:child_process";
import * as interior from "../src/studio/props/interior";
import * as outdoor from "../src/studio/props/outdoor";
import * as nature from "../src/studio/props/nature";

const proc = globalThis as unknown as { process: { argv: string[]; exit(n: number): never } };
const UPDATE = proc.process.argv.includes("--update"), SNAP = "tests/library-snapshot.json";
const h = (x: unknown) => fnv(JSON.stringify(x));
const ERAS: Era[] = ["modern", "fifties", "victorian", "medieval", "office", "lab", "pirate"];

/** the live inventory: category -> id -> fingerprint of the data a video depends on ("" = name only) */
const live: Record<string, Record<string, string>> = {
  characters: Object.fromEntries(Object.entries(CAST).map(([k, v]) => [k, h(v)])),
  extras: Object.fromEntries(ERAS.flatMap((e) => Array.from({ length: 24 }, (_, i) => [`${e}:${i}`, h(extra(i, e))]))),
  acts: Object.fromEntries(ACT_NAMES.map((a) => [a, ""])),
  faces: Object.fromEntries(Object.keys(FACES).map((f) => [f, ""])),
  gestures: Object.fromEntries(GESTURES.map((g) => [g, ""])),
  effects: Object.fromEntries(FX_KINDS.map((f) => [f, ""])),
  sets: Object.fromEntries(Object.entries(SETS).map(([k, v]) => [k, h(v.lights)])),
  marks: Object.fromEntries(Object.entries(LAYOUTS).flatMap(([s, L]) => Object.entries(L.spots).map(([m, p]) => [`${s}:${m}`, h(p)]))),
  views: Object.fromEntries(Object.entries(LAYOUTS).flatMap(([s, L]) => L.views.map((v) => [`${s}:${v.name}`, h(v)]))),
  lights: Object.fromEntries(Object.entries(LIGHTS).map(([k, v]) => [k, h(v)])),
  voices: Object.fromEntries(Object.entries(VOICES).map(([k, v]) => [k, h({ id: v.voiceId, model: v.model, settings: v.settings })])),
  props: Object.fromEntries([...Object.keys(interior), ...Object.keys(outdoor), ...Object.keys(nature)].map((p) => [p, ""])),
  roster: Object.fromEntries(Object.entries(ROSTER).map(([k, v]) => [k, h(v)])),
  placeable: Object.fromEntries(Object.entries(PROPS).map(([k, v]) => [k, h({ r: v.radius, v: Object.keys(v.variants ?? {}) })])),
  items: Object.fromEntries(Object.keys(ITEMS).map((k) => [k, ""])),
};

// health checks of the library itself (not snapshot-based)
const health: string[] = [];
const seen = new Set<string>();
for (const a of ASSETS) { const k = `${a.kind}:${a.id}`; if (seen.has(k)) health.push(`duplicate asset id ${k}`); seen.add(k); if (!a.desc) health.push(`asset ${k} has no description`); }
for (const [id, p] of Object.entries(PROPS)) for (const [v, fn] of [["", p.build] as const, ...Object.entries(p.variants ?? {})]) { try { fn(new Batch(), { x: 0, z: 0 }); } catch (e) { health.push(`prop ${id}${v ? `:${v}` : ""} fails to build: ${String(e).slice(0, 80)}`); } }
for (const [id, it] of Object.entries(ITEMS)) { try { const c = (globalThis as unknown as { document: { createElement(t: string): { getContext(k: string): unknown } } }).document.createElement("canvas"); it.draw(new Pen(c.getContext("2d") as never), 300, 500, 2, 1); } catch (e) { health.push(`item ${id} fails to draw: ${String(e).slice(0, 80)}`); } }
for (const [cmd, why] of [[["out/floor-map.mjs", "--check"], "floor maps"], [["out/assets.mjs", "doc", "--check"], "docs/ASSETS.md"]] as const) {
  if (!fs.existsSync(cmd[0])) continue; // the npm script builds both bundles first
  const r = spawnSync("node", [...cmd]);
  if (r.status !== 0) health.push(`${why} out of date: ${r.stdout.toString().trim().split("\n").pop()}`);
}

const snap: Record<string, Record<string, string>> = fs.existsSync(SNAP) ? JSON.parse(fs.readFileSync(SNAP, "utf8")) : {};
const fails: string[] = [], added: string[] = [];
for (const [cat, items] of Object.entries(snap)) for (const [id, fp] of Object.entries(items)) {
  if (!(cat in live) || !(id in live[cat])) fails.push(`${cat} "${id}" was removed or renamed`);
  else if (live[cat][id] !== fp) fails.push(`${cat} "${id}" changed (existing videos that use it would change)`);
}
for (const [cat, items] of Object.entries(live)) for (const id of Object.keys(items)) if (!snap[cat] || !(id in snap[cat])) added.push(`${cat}:${id}`);

const count = Object.values(live).reduce((n, x) => n + Object.keys(x).length, 0);
console.log(`library: ${count} assets in ${Object.keys(live).length} categories (${Object.entries(live).map(([c, x]) => `${c} ${Object.keys(x).length}`).join(", ")})`);
for (const f of fails) console.log(`  FAIL  ${f}`);
for (const f of health) console.log(`  FAIL  ${f}`);
fails.push(...health);
if (added.length) console.log(`  NEW   ${added.length} asset(s) not yet protected: ${added.slice(0, 12).join(", ")}${added.length > 12 ? ", ..." : ""}`);
if (UPDATE) {
  if (fails.length) { console.log("refusing to update: fix the FAILs first (or restore the original asset)"); proc.process.exit(1); }
  fs.mkdirSync("tests", { recursive: true });
  fs.writeFileSync(SNAP, JSON.stringify(live, null, 1) + "\n");
  console.log(`snapshot updated: ${added.length} new asset(s) are now protected`);
}
console.log(fails.length ? `\n${fails.length} protected asset(s) broken` : "\nall protected assets intact");
proc.process.exit(fails.length ? 1 : 0);
