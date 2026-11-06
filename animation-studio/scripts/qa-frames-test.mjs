// Negative test for the frame-level QA checks (scripts/lib/frame-checks.mjs), on a synthetic video: a moving textured
// pattern (must pass), with 5 frames of flat colour inserted (a camera against a wall: must be caught as near-blank)
// and one frame of noise (a corrupt frame: must be caught as a glitch).
//   npm run test:qaframes
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { frameChecks, runs } from "./lib/frame-checks.mjs";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "qaframes-")), v = path.join(dir, "t.mp4"), clean = path.join(dir, "c.mp4");
const ff = (args) => { const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args]); if (r.status) throw new Error(r.stderr.toString()); };
ff(["-f", "lavfi", "-i", "nullsrc=s=540x960:r=30:d=2,geq=lum='128+70*sin(X/6+N/40)*cos(Y/8-N/50)':cb=128:cr=128", "-pix_fmt", "yuv420p", clean]);
// frames 30-34 flat cream, frame 45 noise
ff(["-i", clean, "-f", "lavfi", "-i", "color=c=0xF1E4C8:s=540x960:r=30:d=2", "-f", "lavfi", "-i", "nullsrc=s=540x960:r=30:d=2,geq=random(1)*255:128:128",
  "-filter_complex", "[0][1]overlay=enable='between(n,30,34)'[a];[a][2]overlay=enable='eq(n,45)'", "-pix_fmt", "yuv420p", v]);
let fails = 0;
const ok = (c, m) => { console.log(`${c ? "ok  " : "FAIL"}  ${m}`); if (!c) fails++; };
const a = await frameChecks(clean), b = await frameChecks(v);
ok(!a.nearBlank.length && !a.glitch.length && !a.softStill.length, `clean moving pattern passes (near-blank: ${runs(a.nearBlank) || "none"}, glitch: ${runs(a.glitch) || "none"}, soft: ${runs(a.softStill) || "none"})`);
ok(b.nearBlank.some((f) => f >= 30 && f <= 34) && b.nearBlank.every((f) => f >= 30 && f <= 34), `flat frames 30-34 caught as near-blank (got ${runs(b.nearBlank) || "none"})`);
ok(b.glitch.includes(45), `noise frame 45 caught as corrupt (got ${runs(b.glitch) || "none"})`);
fs.rmSync(dir, { recursive: true, force: true });
console.log(fails ? `\n${fails} QA frame check test(s) FAILED` : "\nQA frame checks ok");
process.exit(fails ? 1 : 0);
