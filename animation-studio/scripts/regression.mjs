// Picture regression test: renders reference frames of existing videos and compares them with the stored references in
// tests/reference/ (PNG, half size). New engine work must not change existing videos by accident.
//   npm run test:regression              compare (exit 1 on any change)
//   npm run test:regression -- --update  re-record the references (ONLY after a change you meant to make, and say so
//                                        in the commit message)
// Frames: tests/regression.json. Identical = PASS; PSNR >= 48 dB = PASS (renderer noise on another machine); below = FAIL.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const { bundle } = await import("@remotion/bundler");
const { renderStill, selectComposition } = await import("@remotion/renderer");

const UPDATE = process.argv.includes("--update");
const REF = "tests/reference", OUT = "out/regression";
const cases = JSON.parse(fs.readFileSync("tests/regression.json", "utf8")).frames;
const cloudChrome = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const browserExecutable = process.env.REMOTION_BROWSER || (fs.existsSync(cloudChrome) ? cloudChrome : null);
const chromiumOptions = { gl: process.env.REMOTION_GL || "angle" };
fs.mkdirSync(REF, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });

const psnr = (a, b) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", a, "-i", b, "-lavfi", "psnr", "-f", "null", "-"]).stderr.toString();
  const m = r.match(/average:(inf|[\d.]+)/);
  return m ? (m[1] === "inf" ? Infinity : Number(m[1])) : NaN;
};
const same = (a, b) => fs.readFileSync(a).equals(fs.readFileSync(b));

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), publicDir: path.resolve("public") });
let fails = 0;
for (const c of cases) {
  const props = c.props ?? {}, name = `${c.composition}_${c.frame}${c.tag ? "_" + c.tag : ""}.png`;
  const composition = await selectComposition({ serveUrl, id: c.composition, browserExecutable, chromiumOptions, inputProps: props, logLevel: "error" });
  const out = path.join(OUT, name), ref = path.join(REF, name);
  await renderStill({ composition, serveUrl, frame: c.frame, output: out, imageFormat: "png", scale: 0.5, inputProps: props,
    browserExecutable, chromiumOptions, timeoutInMilliseconds: 300000, logLevel: "error", onBrowserLog: () => {} });
  if (UPDATE || !fs.existsSync(ref)) { fs.copyFileSync(out, ref); console.log(`recorded  ${name}  (${c.why})`); continue; }
  const p = same(out, ref) ? Infinity : psnr(out, ref);
  const ok = p >= 48;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(34)} ${p === Infinity ? "identical" : `PSNR ${p.toFixed(1)} dB`}  (${c.why})`);
}
if (UPDATE) console.log("\nreferences re-recorded: commit tests/reference/ and say in the commit message why the picture changed");
else console.log(fails ? `\n${fails} reference frame(s) changed: an existing video would look different` : "\nall reference frames unchanged");
process.exit(fails ? 1 : 0);
