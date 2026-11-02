// Shared helpers for render.mjs / benchmark.mjs: detect the machine, pick the right browser + WebGL backend,
// run Remotion CLI commands, and sample memory while they run. Works on macOS (local renders) and Linux (cloud).
import fs from "node:fs";
import os from "node:os";
import { spawn, execFileSync } from "node:child_process";

export const CLOUD_CHROME = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";

/** What machine are we on, and how should Remotion render here? */
export const detect = () => {
  const platform = process.platform; // "darwin" = macOS
  const cpus = os.cpus();
  const hasGpuDevice = platform !== "linux" || fs.existsSync("/dev/dri");
  // macOS / Windows / Linux-with-GPU: "angle" (GPU). GPU-less cloud Linux: "swangle" (ANGLE on SwiftShader = CPU).
  const gl = process.env.REMOTION_GL || (hasGpuDevice ? "angle" : "swangle");
  const browser = process.env.REMOTION_BROWSER || (fs.existsSync(CLOUD_CHROME) ? CLOUD_CHROME : null);
  let chip = cpus[0]?.model ?? "unknown";
  if (platform === "darwin") {
    try { chip = execFileSync("sysctl", ["-n", "machdep.cpu.brand_string"]).toString().trim(); } catch { /* keep os.cpus model */ }
  }
  let osName = `${platform} ${os.release()}`;
  if (platform === "darwin") {
    try { osName = `macOS ${execFileSync("sw_vers", ["-productVersion"]).toString().trim()}`; } catch { /* keep */ }
  }
  return {
    platform, osName, chip, cores: cpus.length, ramGB: +(os.totalmem() / 1024 ** 3).toFixed(1), gl, browser,
    node: process.version, where: platform === "darwin" ? "mac" : hasGpuDevice ? "gpu-pc" : "cloud-cpu",
  };
};

/** Default number of frames rendered in parallel. WebGL tabs are heavy: cap it so 16 GB machines stay out of swap. */
export const defaultConcurrency = (m) => {
  if (process.env.REMOTION_CONCURRENCY) return Number(process.env.REMOTION_CONCURRENCY);
  if (m.where === "cloud-cpu") return Math.max(1, m.cores);
  return Math.max(1, Math.min(4, Math.floor(m.cores / 2), Math.floor(m.ramGB / 4)));
};

/** Run a command, streaming its output; resolves with the exit code. */
export const run = (cmd, args, opts = {}) => new Promise((resolve) => {
  const p = spawn(cmd, args, { stdio: "inherit", ...opts });
  p.on("close", (code) => resolve(code ?? 1));
});

/** `npx remotion ...` (uses the project's own Remotion version) */
export const remotion = (args) => run(process.platform === "win32" ? "npx.cmd" : "npx", ["remotion", ...args]);

/** Sample memory once a second while a render runs. Returns stop() -> stats. */
export const memorySampler = () => {
  const stats = { peakRenderGB: 0, minAvailableGB: Infinity, minFreePct: Infinity, samples: 0 };
  const sample = () => {
    try {
      // Resident memory of the render processes (Chrome tabs, Node, Remotion's compositor). Shared pages are counted
      // once per process, so this is an upper bound.
      const ps = execFileSync("ps", ["-axo", "rss=,comm="]).toString().split("\n");
      let kb = 0;
      for (const line of ps) {
        const m = line.trim().match(/^(\d+)\s+(.*)$/);
        if (m && /chrom|headless|node|remotion|compositor/i.test(m[2])) kb += Number(m[1]);
      }
      stats.peakRenderGB = Math.max(stats.peakRenderGB, kb / 1024 ** 2);
      if (process.platform === "darwin") {
        // macOS: "System-wide memory free percentage: NN%" (what Activity Monitor's memory pressure is based on)
        const out = execFileSync("memory_pressure", ["-Q"]).toString();
        const pct = Number(out.match(/free percentage:\s*(\d+)/)?.[1]);
        if (!Number.isNaN(pct)) stats.minFreePct = Math.min(stats.minFreePct, pct);
      } else if (fs.existsSync("/proc/meminfo")) {
        const avail = Number(fs.readFileSync("/proc/meminfo", "utf8").match(/MemAvailable:\s+(\d+)/)?.[1]);
        if (avail) stats.minAvailableGB = Math.min(stats.minAvailableGB, avail / 1024 ** 2);
      }
      stats.samples++;
    } catch { /* a missed sample is fine */ }
  };
  sample();
  const t = setInterval(sample, 1000);
  return () => { clearInterval(t); sample(); return stats; };
};

/** macOS swap in use (GB), e.g. to spot memory pressure after a render */
export const swapUsedGB = () => {
  if (process.platform !== "darwin") return null;
  try {
    const s = execFileSync("sysctl", ["-n", "vm.swapusage"]).toString(); // "total = 2048.00M  used = 1024.50M  free = ..."
    const used = s.match(/used = ([\d.]+)([MG])/);
    return used ? +(Number(used[1]) / (used[2] === "M" ? 1024 : 1)).toFixed(2) : null;
  } catch { return null; }
};

export const probe = (file) => new Promise((resolve) => {
  const p = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["remotion", "ffprobe", "-v", "error", "-show_entries",
    "stream=codec_type,codec_name,width,height,nb_frames,r_frame_rate,duration", "-of", "json", file]);
  let out = "";
  p.stdout.on("data", (d) => (out += d));
  p.on("close", () => { try { resolve(JSON.parse(out).streams ?? []); } catch { resolve([]); } });
});

export const fmtDur = (s) => (s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min` : s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${s.toFixed(1)} s`);
