// One-command render of any composition to a finished MP4 (local Mac final renders, cloud previews/fallback).
//
//   npm run render -- <CompositionId> [options]
//
//   --out <file.mp4>      output file (default out/<CompositionId>.mp4, or out/<CompositionId>_preview.mp4)
//   --preview             fast half-size preview (540x960, lighter encode) for checking timing and story
//   --frames <a-b>        render only these frames (e.g. 0-299); used by the benchmark and cloud chunks
//   --audio <file>        mux this soundtrack (wav/mp3) into the final MP4 (replaces Remotion's silent track)
//   --concurrency <n>     frames rendered in parallel (default: chosen for this machine)
//   --no-bundle           reuse the last bundle in build/ (faster repeat renders of an unchanged project)
//
// The machine is detected automatically: macOS and GPU PCs render with the GPU ("angle"); the GPU-less cloud
// container renders on the CPU ("swangle") with its pre-installed Chrome. Override with REMOTION_GL / REMOTION_BROWSER.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { detect, defaultConcurrency, remotion, memorySampler, swapUsedGB, probe, fmtDur } from "./lib/machine.mjs";

export const parseArgs = (argv) => {
  const o = { comp: null, out: null, preview: false, frames: null, audio: null, concurrency: null, bundle: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--preview") o.preview = true;
    else if (a === "--no-bundle") o.bundle = false;
    else if (a === "--out") o.out = argv[++i];
    else if (a === "--frames") o.frames = argv[++i];
    else if (a === "--audio") o.audio = argv[++i];
    else if (a === "--concurrency") o.concurrency = Number(argv[++i]);
    else if (!a.startsWith("--") && !o.comp) o.comp = a;
    else throw new Error(`unknown option ${a}`);
  }
  return o;
};

/** Bundle (optional), render, mux audio (optional). Returns timing + memory stats. */
export const render = async (o) => {
  const m = detect();
  if (m.platform === "darwin") {
    // keep the Mac awake (no idle/system sleep) until this render process exits
    try { spawn("caffeinate", ["-i", "-s", "-w", String(process.pid)], { stdio: "ignore", detached: true }).unref(); } catch { /* optional */ }
  }
  const concurrency = o.concurrency || defaultConcurrency(m);
  const out = path.resolve(o.out || `out/${o.comp}${o.preview ? "_preview" : ""}.mp4`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  console.log(`\n▶ ${o.comp} on ${m.chip} (${m.cores} cores, ${m.ramGB} GB, ${m.osName}) — WebGL "${m.gl}", ${concurrency} in parallel${o.preview ? ", PREVIEW 540x960" : ""}\n`);

  const tb = Date.now();
  if (o.bundle || !fs.existsSync("build/index.html")) {
    const code = await remotion(["bundle", "--out-dir", "build", "--log", "warn"]);
    if (code) throw new Error("bundling failed");
  }
  const bundleS = (Date.now() - tb) / 1000;

  const videoOut = o.audio ? out.replace(/\.mp4$/, ".video.mp4") : out;
  const args = ["render", "build", o.comp, videoOut, "--codec", "h264", "--pixel-format", "yuv420p", "--image-format", "jpeg",
    "--gl", m.gl, "--concurrency", String(concurrency), "--timeout", "300000", "--log", "warn"];
  if (m.browser) args.push("--browser-executable", m.browser);
  if (o.frames) args.push("--frames", o.frames);
  if (o.preview) args.push("--scale", "0.5", "--jpeg-quality", "80", "--crf", "23", "--props", JSON.stringify({ post: { dpr: 0.5 } }));
  else args.push("--jpeg-quality", "92", "--crf", "18");

  const stop = memorySampler();
  const tr = Date.now();
  const code = await remotion(args);
  const renderS = (Date.now() - tr) / 1000;
  const mem = stop();
  if (code) throw new Error(`render failed (exit ${code})`);

  if (o.audio) {
    // Remotion writes a silent audio track: take the picture from the render and the sound from the mix.
    // With --frames a-b the soundtrack starts at frame a (assumes 30 fps, the format of every short).
    // The audio is cut to the exact picture length with -t (not -shortest, which with stream copy drops the last video frames).
    const [fa, fb] = o.frames ? o.frames.split("-").map(Number) : [0, null];
    const offset = String(fa / 30), len = fb !== null ? ["-t", String((fb - fa + 1) / 30)] : [];
    const c = await remotion(["ffmpeg", "-v", "error", "-y", "-i", videoOut, "-ss", offset, ...len, "-i", path.resolve(o.audio), "-map", "0:v:0", "-map", "1:a:0",
      "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", out]);
    if (c) throw new Error("muxing audio failed");
    fs.rmSync(videoOut);
  }

  const streams = await probe(out);
  const v = streams.find((s) => s.codec_type === "video") ?? {};
  const frames = Number(v.nb_frames) || 0;
  const res = {
    composition: o.comp, out, preview: o.preview, frames: o.frames, machine: m, concurrency,
    video: { width: v.width, height: v.height, fps: v.r_frame_rate, frames, codec: v.codec_name, audio: streams.some((s) => s.codec_type === "audio") },
    bundleSeconds: +bundleS.toFixed(1), renderSeconds: +renderS.toFixed(1),
    secondsPerFrame: frames ? +(renderS / frames).toFixed(3) : null, framesPerSecond: frames ? +(frames / renderS).toFixed(2) : null,
    memory: { peakRenderProcessesGB: +mem.peakRenderGB.toFixed(2), macMinFreePercent: Number.isFinite(mem.minFreePct) ? mem.minFreePct : null,
      linuxMinAvailableGB: Number.isFinite(mem.minAvailableGB) ? +mem.minAvailableGB.toFixed(2) : null, macSwapUsedGBAfter: swapUsedGB() },
    sizeMB: +(fs.statSync(out).size / 1024 ** 2).toFixed(1), finishedAt: new Date().toISOString(),
  };
  fs.writeFileSync(out.replace(/\.mp4$/, ".render.json"), JSON.stringify(res, null, 2));
  console.log(`\n✔ ${out}\n  ${res.video.width}x${res.video.height}, ${frames} frames, ${res.sizeMB} MB — render ${fmtDur(renderS)} (${res.secondsPerFrame} s/frame), bundle ${fmtDur(bundleS)}, peak render memory ${res.memory.peakRenderProcessesGB} GB\n`);
  return res;
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const o = parseArgs(process.argv.slice(2));
  if (!o.comp) { console.error("usage: npm run render -- <CompositionId> [--preview] [--frames a-b] [--audio file] [--out file.mp4]"); process.exit(1); }
  render(o).catch((e) => { console.error(`\n✖ ${e.message}`); process.exit(1); });
}
