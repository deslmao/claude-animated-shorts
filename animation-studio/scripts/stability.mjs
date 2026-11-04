// Temporal stability check (Visual Storytelling 2.0, P4): render consecutive frames LOSSLESS at full resolution and
// measure flicker / outline crawl with scripts/stability.py (temporal second difference; smooth motion scores ~0).
//
//   npm run stability -- <CompositionId> <a-b> [--roi x,y,w,h] [--post '{"ink":false}'] [--props '{...}'] [--out dir]
//                        [--concurrency n] [--max-flicker f] [--reference]
// --reference also renders the frames at 2x size (old ink, the common "truth") and scores the error against it
//
// Writes <out>/frames/*.png, <out>/heat.png (mean second difference x6) and <out>/stability.json; prints the result.
// --max-flicker fails (exit 1) when the ROI's flicker exceeds f: use it as a QA gate on prop-heavy set-ups.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { detect, remotion, memorySampler } from "./lib/machine.mjs";

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
const [comp, frames] = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--")));
if (!comp || !frames) { console.error("usage: npm run stability -- <CompositionId> <a-b> [--roi x,y,w,h] [--post json] [--out dir]"); process.exit(2); }
const out = path.resolve(opt("--out") ?? `out/stability/${comp}_${frames}`);
const dir = path.join(out, "frames");
fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });

const m = detect();
const props = { ...(opt("--props") ? JSON.parse(opt("--props")) : {}), ...(opt("--post") ? { post: JSON.parse(opt("--post")) } : {}) };
const args = ["render", "build", comp, dir, "--sequence", "--image-format", "png", "--frames", frames, "--gl", m.gl,
  "--concurrency", opt("--concurrency") ?? "4", "--timeout", "300000", "--log", "error"];
if (m.browser) args.push("--browser-executable", m.browser);
if (Object.keys(props).length) args.push("--props", JSON.stringify(props));
if (!fs.existsSync("build/index.html")) { const c = await remotion(["bundle", "--out-dir", "build", "--log", "warn"]); if (c) process.exit(1); }
const stop = memorySampler(), t0 = Date.now();
const code = await remotion(args);
const mem = stop(), secs = (Date.now() - t0) / 1000;
if (code) { console.error("render failed"); process.exit(1); }
const n = fs.readdirSync(dir).filter((f) => f.endsWith(".png")).length;
let refDir;
if (argv.includes("--reference")) {
  refDir = path.join(out, "ref"); fs.rmSync(refDir, { recursive: true, force: true }); fs.mkdirSync(refDir, { recursive: true });
  const ra = args.map((x) => (x === dir ? refDir : x)).filter((x, i, arr) => !(x === "--props" || arr[i - 1] === "--props"));
  ra.push("--scale", "2", "--props", JSON.stringify({ ...props, post: { ...(props.post ?? {}), ink2: false } }));
  if (await remotion(ra)) { console.error("reference render failed"); process.exit(1); }
}
const py = ["scripts/stability.py", dir, "--heat", path.join(out, "heat.png"), "--json", path.join(out, "stability.json"), "--label", `${comp} ${frames}`];
if (opt("--roi")) py.push("--roi", opt("--roi"));
if (refDir) py.push("--ref", refDir);
const r = spawnSync("python3", py, { encoding: "utf8" });
if (r.status) { console.error(r.stderr); process.exit(1); }
const res = { ...JSON.parse(r.stdout), secondsPerFrame: +(secs / n).toFixed(2), peakRenderGB: +mem.peakRenderGB.toFixed(2) };
fs.writeFileSync(path.join(out, "stability.json"), JSON.stringify(res, null, 2));
console.log(JSON.stringify(res));
const max = opt("--max-flicker");
if (max !== undefined && res.flicker > Number(max)) { console.error(`FAIL  flicker ${res.flicker} > ${max}`); process.exit(1); }
