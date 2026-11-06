// Frame-level picture checks for the QA (Video 03 defect classes). Decodes the video at 270 x 480 grey and looks for:
//   nearBlank   >= 60 % of the frame is flat, featureless tone for 3+ frames in a row (a camera against a wall: Video 03
//               frames 1410-1413); one-frame flashes and dips to black are not counted
// (Phantom outline scanlines are prevented at the source instead: engine 3 ink draws only the faces the picture draws,
// the camera clearance check keeps cameras out of scenery, and a render regression frame guards both. A pixel test
// can't tell a phantom line from this style's real thin outlines (deck planks, rails) without false alarms.)
//   glitch      a frame that differs from both neighbours while the neighbours match each other (corruption, a stale or
//               half-refreshed frame); cuts are excluded (their neighbours differ)
//   softStill   a frame much softer than the frames around it while the picture isn't moving (motion blur and whips
//               are motion, so they are exempt)
// Returns per-check frame lists plus the measurements used.
import { spawn } from "node:child_process";

const W = 270, H = 480;
export const frameChecks = (video, ff = "ffmpeg") => new Promise((resolve, reject) => {
  const p = spawn(ff, ["-v", "error", "-i", video, "-map", "0:v:0", "-vf", `scale=${W}:${H},format=gray`, "-f", "rawvideo", "-"]);
  const frames = []; let buf = Buffer.alloc(0);
  p.stdout.on("data", (d) => {
    buf = Buffer.concat([buf, d]);
    while (buf.length >= W * H) { frames.push(analyse(new Uint8Array(buf.subarray(0, W * H)), frames.length ? frames[frames.length - 1].px : null)); buf = buf.subarray(W * H); }
  });
  p.on("error", reject);
  p.on("close", () => resolve(summarise(frames)));
});

const analyse = (px, prev) => {
  const L = (x, y) => px[y * W + x];
  // flat fraction: 15 x 16 blocks with almost no variation (and not black)
  let flat = 0, blocks = 0, mean = 0;
  for (let by = 0; by + 16 <= H; by += 16) for (let bx = 0; bx + 15 <= W; bx += 15) {
    let s = 0, s2 = 0;
    for (let y = by; y < by + 16; y++) for (let x = bx; x < bx + 15; x++) { const v = L(x, y); s += v; s2 += v * v; }
    const m = s / 240, sd = Math.sqrt(Math.max(0, s2 / 240 - m * m)); blocks++; mean += m;
    if (sd < 2.5 && m > 40) flat++;
  }
  // sharpness (mean |laplacian|) and change from the previous frame
  let lap = 0, diff = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const c = L(x, y); lap += Math.abs(4 * c - L(x - 1, y) - L(x + 1, y) - L(x, y - 1) - L(x, y + 1)); }
  if (prev) for (let i = 0; i < W * H; i++) diff += Math.abs(px[i] - prev[i]);
  return { px, flat: flat / blocks, mean: mean / blocks, sharp: lap / ((W - 2) * (H - 2)), diff: prev ? diff / (W * H) : 0 };
};

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const summarise = (fr) => {
  const n = fr.length, out = { frames: n, nearBlank: [], glitch: [], softStill: [] };
  // pairwise change between t-1 and t+1 (for the glitch test), recomputed only where needed
  const d2 = (i) => { let s = 0; const a = fr[i - 1].px, b = fr[i + 1].px; for (let k = 0; k < W * H; k += 4) s += Math.abs(a[k] - b[k]); return s / (W * H / 4); };
  for (let i = 0; i < n; i++) {
    const f = fr[i];
    if (f.flat >= 0.6 && f.mean > 40 && fr.slice(Math.max(0, i - 2), i + 3).filter((g) => g.flat >= 0.6 && g.mean > 40).length >= 3) out.nearBlank.push(i);
    if (i > 0 && i < n - 1) {
      const a = fr[i].diff, b = fr[i + 1].diff;
      if (Math.min(a, b) > 6) { const c = d2(i); if (Math.min(a, b) > 3 * c + 4) out.glitch.push(i); }
      const loc = median(fr.slice(Math.max(0, i - 15), i + 16).map((x) => x.sharp));
      if (f.sharp < 0.5 * loc && a < 1.5 && b < 1.5) out.softStill.push(i);
    }
  }
  for (const f of fr) delete f.px;
  out.worst = { flat: Math.max(...fr.map((f) => f.flat)) };
  return out;
};

/** frame list -> "a-b, c" runs (for reports) */
export const runs = (fs) => { const r = []; for (const f of fs) { if (r.length && f - r[r.length - 1][1] <= 1) r[r.length - 1][1] = f; else r.push([f, f]); } return r.map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`)).join(", "); };
