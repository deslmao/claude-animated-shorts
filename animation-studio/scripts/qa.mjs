// Automatic quality check of a finished video. Needs a full ffmpeg/ffprobe on PATH (GitHub runners: apt ffmpeg).
//   node scripts/qa.mjs <video.mp4> <outDir> [--frames N] [--width W --height H] [--fps 30] [--audio required|none|any]
// Writes <outDir>/qa.md, qa.json and contact_sheet.jpg. Exits 1 if a hard check fails.
// Hard checks: codec, resolution, fps, exact frame count, no duplicated consecutive frames (chunk seams; frames held
// dark by a dip to black are exempt), audio present
// and the same length as the picture (sync), audio starting at 0, audio not silent (> -40 LUFS) when required. Soft (reported): loudness, black and frozen spans.
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const argv = process.argv.slice(2);
const [video, outDir] = argv;
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
if (!video || !outDir) { console.error("usage: node scripts/qa.mjs <video.mp4> <outDir> [--frames N] [--width W --height H] [--fps 30] [--audio required|none|any]"); process.exit(2); }
const FF = process.env.FFMPEG || "ffmpeg", FP = process.env.FFPROBE || "ffprobe";
fs.mkdirSync(outDir, { recursive: true });

const probe = JSON.parse(execFileSync(FP, ["-v", "error", "-show_streams", "-show_format", "-of", "json", video]).toString());
const v = probe.streams.find((s) => s.codec_type === "video");
const a = probe.streams.find((s) => s.codec_type === "audio");
const ff = (args) => spawnSync(FF, ["-hide_banner", "-nostats", ...args], { maxBuffer: 1 << 28 }).stderr.toString();

// exact decoded frame count + duplicated consecutive frames (a seam bug shows up as two identical frames)
const md5 = spawnSync(FF, ["-v", "error", "-i", video, "-map", "0:v:0", "-f", "framemd5", "-"], { maxBuffer: 1 << 28 }).stdout.toString()
  .split("\n").filter((l) => l && !l.startsWith("#")).map((l) => l.split(",").pop().trim());
// near-duplicate detection: per-frame mean luma difference to the previous frame; a duplicate is a frame that barely
// changes while its neighbours move normally (re-encoding means "identical" frames are only almost identical)
const diffOut = spawnSync(FF, ["-v", "error", "-i", video, "-map", "0:v:0", "-vf", "scale=270:-2,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-f", "null", "-"], { maxBuffer: 1 << 28 }).stdout.toString();
const diffs = [...diffOut.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1])); // diffs[k] = change between frame k and k+1
// per-frame brightness: a fade / dip to black is meant to hold nearly identical dark frames, which is not a seam bug
const lumaOut = spawnSync(FF, ["-v", "error", "-i", video, "-map", "0:v:0", "-vf", "scale=270:-2,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-f", "null", "-"], { maxBuffer: 1 << 28 }).stdout.toString();
const luma = [...lumaOut.matchAll(/YAVG=([\d.]+)/g)].map((m) => Number(m[1])); // luma[k] = mean brightness of frame k (0-255)
// --seams a,b,...: the first frame of every chunk after the first (where a seam repeat can happen). When given, a
// stall right next to a hard cut and away from every seam is a hold settling before / after the cut, reported as a
// note; any stall at or beside a seam still fails. Without --seams every stall fails, as before.
const seamArg = argv.indexOf("--seams") >= 0 ? argv[argv.indexOf("--seams") + 1] : null;
const seams = seamArg ? seamArg.split(",").map(Number).filter((x) => Number.isFinite(x)) : null;
const CUT = 20; // a mean luma change this big between two frames is a hard cut, not motion
const holds = [];
const DARK = 32; // video luma is TV range (16 = black): both frames this dark (a dip to black, ~7 % grey) -> not a duplicate
const dups = [];
for (let k = 0; k < diffs.length; k++) {
  if (luma[k] < DARK && luma[k + 1] < DARK) continue;
  const nb = [diffs[k - 2], diffs[k - 1], diffs[k + 1], diffs[k + 2]].filter((x) => x !== undefined).sort((x, y) => x - y);
  const med = nb.length ? (nb[Math.floor((nb.length - 1) / 2)] + nb[Math.ceil((nb.length - 1) / 2)]) / 2 : 0;
  // a duplicate is an isolated stall: (almost) no change, with clear motion on BOTH sides (a repeated frame at a seam
  // measures ~0.03 between ~5s). A camera easing into or out of a move also gets very small (~0.07), but the motion
  // grows or fades gradually on one side, so it is not flagged.
  const p = diffs[k - 1], n = diffs[k + 1];
  if (med > 0.6 && diffs[k] < 0.12 && p !== undefined && n !== undefined && Math.min(p, n) > Math.max(0.3, 8 * diffs[k])) {
    const atCut = p > CUT || n > CUT, nearSeam = !seams || seams.some((s) => Math.abs(s - (k + 1)) <= 1);
    if (atCut && !nearSeam) holds.push(k + 1); else dups.push(k + 1);
  }
}
const [fn, fd] = (v?.r_frame_rate ?? "0/1").split("/").map(Number);
const fps = fn / fd;
const vDur = md5.length / fps;
const aDur = a ? Number(a.duration) : null;

// loudness (EBU R128) + true peak
let lufs = null, tp = null;
if (a) {
  const e = ff(["-i", video, "-map", "0:a:0", "-af", "ebur128=peak=true", "-f", "null", "-"]);
  lufs = Number(e.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop()?.match(/-?[\d.]+/)?.[0]);
  tp = Number(e.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop()?.match(/-?[\d.]+/)?.[0]);
}
// black and frozen spans (frozen >= 0.5 s: every hold should creep, so a long freeze is a bug)
const det = ff(["-i", video, "-map", "0:v:0", "-vf", "blackdetect=d=0.1:pix_th=0.05,freezedetect=n=0.0005:d=0.5", "-f", "null", "-"]);
const black = [...det.matchAll(/black_start:([\d.]+) black_end:([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
const freezeStarts = [...det.matchAll(/freeze_start: ([\d.]+)/g)].map((m) => Number(m[1]));
const freezeEnds = [...det.matchAll(/freeze_end: ([\d.]+)/g)].map((m) => Number(m[1]));
const frozen = freezeStarts.map((s, i) => [s, freezeEnds[i] ?? vDur]);

// contact sheet: 20 frames evenly spread, 4 x 5
const n = 20, step = Math.max(1, Math.floor(md5.length / n));
ff(["-y", "-i", video, "-vf", `select='not(mod(n\\,${step}))',scale=216:-2,tile=5x4:padding=4:color=white`, "-frames:v", "1", "-q:v", "3", path.join(outDir, "contact_sheet.jpg")]);

const expFrames = opt("--frames", null) ? Number(opt("--frames")) : null;
const expW = Number(opt("--width", v?.width)), expH = Number(opt("--height", v?.height)), expFps = Number(opt("--fps", 30));
const audioMode = opt("--audio", "any");
const checks = [
  ["video codec is H.264", v?.codec_name === "h264", v?.codec_name],
  ["resolution", v?.width === expW && v?.height === expH, `${v?.width}x${v?.height} (expected ${expW}x${expH})`],
  ["frame rate", Math.abs(fps - expFps) < 0.01, `${fps} fps (expected ${expFps})`],
  ["frame count", expFrames === null || md5.length === expFrames, `${md5.length} frames${expFrames !== null ? ` (expected ${expFrames})` : ""} = ${vDur.toFixed(3)} s`],
  ["no duplicated frames (chunk seams)", dups.length === 0, dups.length ? `duplicates at frames ${dups.slice(0, 10).join(", ")}` : "none"],
];
if (audioMode !== "none") {
  checks.push(["audio track present", audioMode === "any" || !!a, a ? `${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch` : "missing"]);
  // a present but silent (or nearly silent) track is a broken soundtrack, not audio
  if (audioMode === "required") checks.push(["audio is not silent", lufs !== null && Number.isFinite(lufs) && lufs > -40, lufs === null || !Number.isFinite(lufs) ? "no measurable loudness" : `${lufs} LUFS integrated`]);
  if (a) {
    checks.push(["audio starts at 0", Math.abs(Number(a.start_time ?? 0)) < 0.05, `${Number(a.start_time ?? 0).toFixed(3)} s`]);
    checks.push(["audio length matches picture (sync)", Math.abs(aDur - vDur) < 0.1, `audio ${aDur.toFixed(3)} s vs picture ${vDur.toFixed(3)} s (diff ${(aDur - vDur).toFixed(3)} s)`]);
  }
}
const soft = [
  ["loudness", lufs === null ? "no audio" : `${lufs} LUFS integrated, true peak ${tp} dBFS (YouTube normalises to about -14 LUFS)`],
  ["black spans ≥ 0.1 s", black.length ? black.map(([s, e]) => `${s.toFixed(2)}-${e.toFixed(2)} s`).join(", ") : "none"],
  ["holds settling at a hard cut (away from seams)", holds.length ? `frames ${holds.slice(0, 10).join(", ")}` : "none"],
  ["frozen spans ≥ 0.5 s", frozen.length ? frozen.map(([s, e]) => `${s.toFixed(2)}-${e.toFixed(2)} s`).join(", ") : "none"],
  ["file size", `${(fs.statSync(video).size / 1024 ** 2).toFixed(1)} MB`],
];
const ok = checks.every((c) => c[1]);
const md = `# Video quality check: ${ok ? "PASSED ✅" : "FAILED ❌"}

File: \`${path.basename(video)}\`

| Check | Result | Details |
|---|---|---|
${checks.map(([k, pass, d]) => `| ${k} | ${pass ? "✅" : "❌"} | ${d} |`).join("\n")}

| Measurement | Value |
|---|---|
${soft.map(([k, d]) => `| ${k} | ${d} |`).join("\n")}
`;
fs.writeFileSync(path.join(outDir, "qa.md"), md);
fs.writeFileSync(path.join(outDir, "qa.json"), JSON.stringify({ ok, frames: md5.length, fps, width: v?.width, height: v?.height, videoSeconds: vDur, audioSeconds: aDur, lufs, truePeak: tp, duplicates: dups, holds, seams, black, frozen, checks }, null, 2));
console.log(md);
process.exit(ok ? 0 : 1);
