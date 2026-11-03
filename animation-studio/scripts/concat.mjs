// Join video parts rendered separately (cloud fallback: each part stays under the 2 h background-job limit).
//   node scripts/concat.mjs <final.mp4> <part1.mp4> <part2.mp4> ... [--audio mix.wav]
// Parts must come from the same render settings (render.mjs --frames a-b), listed in order.
import fs from "node:fs";
import path from "node:path";
import { remotion } from "./lib/machine.mjs";

const argv = process.argv.slice(2);
const ai = argv.indexOf("--audio");
const audio = ai >= 0 ? argv.splice(ai, 2)[1] : null;
const [out, ...parts] = argv;
if (!out || parts.length < 1) { console.error("usage: node scripts/concat.mjs <final.mp4> <part1.mp4> ... [--audio mix.wav]"); process.exit(1); }
const list = path.resolve(out.replace(/\.mp4$/, ".parts.txt"));
fs.writeFileSync(list, parts.map((p) => `file '${path.resolve(p).replace(/'/g, "'\\''")}'`).join("\n") + "\n");
const args = ["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list];
// No -shortest: with stream copy it ends the output early and drops the last video frames (Short-tickle run 10 lost
// 3 frames). The soundtrack is built to the picture's exact length (npm run sound) and QA checks the two match.
if (audio) args.push("-i", path.resolve(audio), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k");
else args.push("-map", "0:v:0", "-c", "copy");
args.push("-movflags", "+faststart", path.resolve(out));
const code = await remotion(args);
fs.rmSync(list);
if (code) { console.error("✖ joining failed"); process.exit(1); }
console.log(`✔ ${out}`);
