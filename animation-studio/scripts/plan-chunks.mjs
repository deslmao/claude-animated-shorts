// Split a composition into N frame ranges for parallel rendering (GitHub Actions matrix or cloud background jobs).
//   node scripts/plan-chunks.mjs <CompositionId> <chunks> [serveUrl=build]
// Prints JSON: {"composition":..,"total":2025,"fps":30,"chunks":[{"i":0,"frames":"0-134"},...]}
// Bundle first (npx remotion bundle --out-dir build) or pass a serve URL.
import fs from "node:fs";
import path from "node:path";
import { selectComposition } from "@remotion/renderer";
import { detect } from "./lib/machine.mjs";

const [comp, n = "15", serve = "build"] = process.argv.slice(2);
if (!comp) { console.error("usage: node scripts/plan-chunks.mjs <CompositionId> <chunks> [serveUrl]"); process.exit(1); }
const m = detect();
const serveUrl = fs.existsSync(serve) ? path.resolve(serve) : serve;
const c = await selectComposition({ serveUrl, id: comp, browserExecutable: m.browser, chromiumOptions: { gl: m.gl }, logLevel: "error" });
const total = c.durationInFrames;
const k = Math.max(1, Math.min(Number(n), total));
const chunks = Array.from({ length: k }, (_, i) => {
  const a = Math.floor((i * total) / k), b = Math.floor(((i + 1) * total) / k) - 1;
  return { i, frames: `${a}-${b}` };
});
console.log(JSON.stringify({ composition: comp, total, fps: c.fps, width: c.width, height: c.height, chunks }));
