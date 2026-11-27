// Dual export (Engine 4): one rendered film, two masters.   node scripts/dual-export.mjs <rendered.mp4> <story-id> [outDir]
//   <name>-scored.mp4     the film with the scored master (narration + music + SFX + ambience), audio/Short-<id>.mp3
//   <name>-nomusic.mp4    the same picture with the no-music master (narration + SFX + ambience), audio/Short-<id>.nomusic.mp3,
//                         for TikTok / Reels posts that add their own native audio
// Both are stream copies of the video (no re-encode); the audio is AAC 256k. `npm run sound -- <id>` writes both audio files.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const [video, id, outDir = path.dirname(path.resolve(video ?? "."))] = process.argv.slice(2);
if (!video || !id) { console.error("usage: node scripts/dual-export.mjs <rendered.mp4> <story-id> [outDir]"); process.exit(1); }
const base = path.basename(video).replace(/\.mp4$/, "");
for (const [tag, audio] of [["scored", `audio/Short-${id}.mp3`], ["nomusic", `audio/Short-${id}.nomusic.mp3`]]) {
  if (!fs.existsSync(audio)) { console.error(`missing ${audio} (run: npm run sound -- ${id})`); process.exit(1); }
  const out = path.join(outDir, `${base}-${tag}.mp4`);
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", out], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
  console.log("wrote", out);
}
