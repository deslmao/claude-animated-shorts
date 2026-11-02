// Render benchmark: renders a representative 10 s (300 frames) of the bridge short at full 1080x1920 with every
// normal effect on (ink, lens blur, bloom, grade, 74-soldier crowd, MSAA 4), measures speed and memory, and
// estimates how long a 60 s short takes on THIS machine.
//
//   npm run benchmark                 (frames 600-899: the bounce + whistling section, the heaviest crowd shots)
//   npm run benchmark -- --frames 0-89 --concurrency 2     (shorter / custom runs)
//
// Prints a report and saves it to out/benchmark/REPORT.md (copy it back to Claude).
import fs from "node:fs";
import { render } from "./render.mjs";
import { fmtDur } from "./lib/machine.mjs";

const argv = process.argv.slice(2);
const get = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const frames = get("--frames", "600-899");
const concurrency = get("--concurrency", null);
const [a, b] = frames.split("-").map(Number);
const out = `out/benchmark/bridge_${a}-${b}.mp4`;

const r = await render({ comp: "BridgeShort", out, preview: false, frames, audio: null, concurrency: concurrency ? Number(concurrency) : null, bundle: true })
  .catch((e) => { console.error(`\n✖ benchmark failed: ${e.message}`); process.exit(1); });

const spf = r.secondsPerFrame;
const est = (n) => fmtDur(spf * n + r.bundleSeconds);
const m = r.machine;
const report = `# Render benchmark — ${new Date().toISOString().slice(0, 16).replace("T", " ")}

| | |
|---|---|
| Machine | ${m.chip}, ${m.cores} cores, ${m.ramGB} GB RAM, ${m.osName}, Node ${m.node} |
| Renderer | WebGL "${m.gl}", ${r.concurrency} frames in parallel |
| Clip | BridgeShort frames ${frames}: ${r.video.frames} frames, ${r.video.width}x${r.video.height}, ${r.video.fps} fps, ${r.video.codec}, ${r.sizeMB} MB |
| Bundle | ${fmtDur(r.bundleSeconds)} (once per render) |
| Render | ${fmtDur(r.renderSeconds)} = **${spf} s/frame** (${r.framesPerSecond} frames/s) |
| Peak memory of render processes | ${r.memory.peakRenderProcessesGB} GB (upper bound) |
| macOS lowest free memory | ${r.memory.macMinFreePercent ?? "n/a"} %  · swap in use after: ${r.memory.macSwapUsedGBAfter ?? "n/a"} GB |
| Linux lowest available memory | ${r.memory.linuxMinAvailableGB ?? "n/a"} GB |

## Estimated full renders on this machine (same settings)
| Video | Frames | Estimated time |
|---|---|---|
| 60 s short (1080x1920) | 1800 | **${est(1800)}** |
| 67.5 s bridge short | 2025 | ${est(2025)} |
| 60 s half-size preview | 1800 | roughly ${fmtDur((spf * 1800) / 3 + r.bundleSeconds)} (rough guess, not measured) |

Notes: a fanless laptop (MacBook Air) can slow down once it gets hot on long renders, so treat the 60 s figure as a best
case until a full render confirms it. Output: \`${r.out}\`.
`;
fs.mkdirSync("out/benchmark", { recursive: true });
fs.writeFileSync("out/benchmark/REPORT.md", report);
console.log("\n" + report + "\nSaved to out/benchmark/REPORT.md — copy everything above into your chat with Claude.\n");
