// Render test stills from any composition, bundling once (portable version of the creator's bridge-stills.mjs).
// usage: node scripts/stills.mjs <CompositionId> <outPrefix> <frame,frame,...> [scale=0.5]
//   ENTRY=src/sandboxes/<n>/index.tsx  render a sandbox copy instead of src/index.ts
//   REMOTION_GL=swangle                CPU WebGL (cloud, no GPU); default "angle" (GPU) on a normal PC
//   REMOTION_BROWSER=/path/to/chrome   use this Chrome instead of Remotion's own download
//   REMOTION_TMP=/big/drive/tmp        keep the (large) bundle copies off the system drive
import fs from "node:fs";
import path from "node:path";
if (process.env.REMOTION_TMP) { fs.mkdirSync(process.env.REMOTION_TMP, { recursive: true }); process.env.TEMP = process.env.TMP = process.env.TMPDIR = process.env.REMOTION_TMP; }
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");
const [id, prefix, frames, scale = "0.5"] = process.argv.slice(2);
if (!id || !prefix || !frames) { console.error("usage: node scripts/stills.mjs <CompositionId> <outPrefix> <frames> [scale]"); process.exit(1); }
const cloudChrome = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_BROWSER || (fs.existsSync(cloudChrome) ? cloudChrome : null);
const chromiumOptions = { gl: process.env.REMOTION_GL || "angle" };
fs.mkdirSync(path.dirname(path.resolve(prefix)), { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve(process.env.ENTRY || "src/index.ts"), publicDir: path.resolve("public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable, chromiumOptions });
const onBrowserLog = (l) => { if ((l.type === "error" || l.type === "warning") && !/404 \(Not Found\)/.test(l.text)) console.log(`[${l.type}]`, l.text.slice(0, 300)); };
for (const f of frames.split(",").map(Number)) {
  const t0 = Date.now();
  await renderStill({ composition, serveUrl, frame: f, output: `${prefix}${f}.jpg`, imageFormat: "jpeg", jpegQuality: 88, scale: Number(scale),
    browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, onBrowserLog });
  console.log("still", f, ((Date.now() - t0) / 1000).toFixed(1) + "s");
}
