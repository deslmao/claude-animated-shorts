// Stage 1C painted textures, in the creator's HD recipe (paint.ts / textures.md): per-tile colour jitter (+-5-10 %),
// broad soft tone blotches, painted lips (light) and seams (dark, never pure black), seamless wrap. Interiors,
// modern streets, nature and props. Every texture is cached by key (same key = same canvas).
import * as THREE from "three";
import { ctex, jit, pick, U, wrapX, wrap2, rr, blotch, grain, TAU, R, G } from "./paint";

const tone = (g: G, r: R, W: number, H: number, n: number, light: string, dark: string, a = 0.12, rmin = 80, rmax = 260, sx = 1.3) => {
  for (let k = 0; k < n; k++) {
    const x = U(r, 0, W), y = U(r, 0, H), rad = U(r, rmin, rmax), l = r() > 0.5;
    wrap2(W, H, x, y, rad * sx, (xx, yy) => blotch(g, xx, yy, rad, sx, l ? light : dark, a));
  }
};
const speckle = (g: G, r: R, W: number, H: number, n: number, cols: string[], rmin = 1, rmax = 3) => {
  for (let i = 0; i < n; i++) { g.fillStyle = pick(r, cols); const x = U(r, 0, W), y = U(r, 0, H), s = U(r, rmin, rmax); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
};

/** painted plaster wall, 1024 px = 2 m: soft mottling + faint roller strokes + a darker skirting shadow band at v = 0 */
export const plasterHD = (col: string) => ctex("plaster" + col, 1024, 1024, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 1024, 1024);
  tone(g, r, 1024, 1024, 18, "255,250,240", "120,100,90", 0.07, 120, 320);
  for (let i = 0; i < 40; i++) { // vertical roller strokes
    const x = U(r, 0, 1024), w = U(r, 30, 90);
    wrapX(1024, x, w, (xx) => { g.fillStyle = r() > 0.5 ? "rgba(255,250,240,0.035)" : "rgba(90,70,60,0.03)"; g.fillRect(xx, 0, w, 1024); });
  }
});
/** wallpaper, 1024 px = 1 m: stripes or a small diamond motif over a plaster base */
export const wallpaperHD = (base: string, motif: string, kind: "stripe" | "diamond" | "dots" = "stripe") => ctex(`wp${base}${motif}${kind}`, 1024, 1024, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 1024);
  tone(g, r, 1024, 1024, 10, "255,250,240", "110,90,80", 0.06, 150, 340);
  g.fillStyle = motif;
  if (kind === "stripe") for (let x = 0; x < 1024; x += 128) { g.globalAlpha = 0.55; g.fillRect(x + 8, 0, 44, 1024); g.globalAlpha = 0.3; g.fillRect(x + 64, 0, 8, 1024); }
  else if (kind === "diamond") { g.globalAlpha = 0.45; for (let y = 0; y < 1024; y += 128) for (let x = 0; x < 1024; x += 128) { const ox = (y / 128) % 2 ? 64 : 0; g.beginPath(); g.moveTo(x + ox + 64, y + 34); g.lineTo(x + ox + 88, y + 64); g.lineTo(x + ox + 64, y + 94); g.lineTo(x + ox + 40, y + 64); g.closePath(); g.fill(); } }
  else { g.globalAlpha = 0.5; for (let y = 0; y < 1024; y += 96) for (let x = 0; x < 1024; x += 96) { g.beginPath(); g.arc(x + ((y / 96) % 2 ? 48 : 0) + 24, y + 48, 11, 0, TAU); g.fill(); } }
  g.globalAlpha = 1;
});
/** square tiles, 1024 px = `size` tiles per side: grout lines, per-tile jitter, a soft glaze highlight */
export const tilesHD = (col: string, n = 8, grout = "#cfc8bd") => ctex(`tiles${col}${n}${grout}`, 1024, 1024, (g, r) => {
  const T = 1024 / n;
  g.fillStyle = grout; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const c = jit(r, col, 0.05, 3, 0.08);
    rr(g, i * T + 4, j * T + 4, T - 8, T - 8, 6); g.fillStyle = c; g.fill();
    const gr = g.createLinearGradient(i * T, j * T, i * T + T, j * T + T);
    gr.addColorStop(0, "rgba(255,255,255,0.16)"); gr.addColorStop(0.5, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(60,50,50,0.06)");
    g.fillStyle = gr; g.fill();
  }
});
/** checkerboard floor tiles (diner / lab / kitchen) */
export const checkerHD = (a: string, b: string, n = 8) => ctex(`chk${a}${b}${n}`, 1024, 1024, (g, r) => {
  const T = 1024 / n;
  g.fillStyle = "#9a948c"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { rr(g, i * T + 3, j * T + 3, T - 6, T - 6, 4); g.fillStyle = jit(r, (i + j) % 2 ? a : b, 0.04, 2, 0.06); g.fill(); }
  tone(g, r, 1024, 1024, 8, "255,255,255", "80,70,60", 0.05);
});
/** interior floorboards, 2048 px = 2 m, boards 0.16 m along x, staggered joints (warm honey / walnut / grey oak) */
export const floorboardsHD = (fills: string[] = ["#c99a68", "#be8f60", "#d1a472", "#b9895a"]) => ctex("floor" + fills.join(""), 2048, 2048, (g, r) => {
  const S = 2048, B = 164;
  for (let i = 0; i * B < S; i++) {
    const y = i * B;
    g.save(); g.beginPath(); g.rect(0, y, S, B); g.clip();
    g.fillStyle = jit(r, pick(r, fills), 0.05, 3, 0.08); g.fillRect(0, y, S, B);
    for (let k = 0; k < 12; k++) grain(g, r, S, U(r, 0, S), y + U(r, 12, B - 12), U(r, 400, 1400), U(r, 2, 6), U(r, 2, 3.5), r() < 0.25 ? "rgba(255,232,195,0.18)" : "rgba(95,48,18,0.22)");
    g.fillStyle = "rgba(255,238,200,0.28)"; g.fillRect(0, y + 5, S, 3);
    for (const jx of [U(r, 100, S / 2), U(r, S / 2 + 100, S - 100)]) { g.fillStyle = "#3a1e0e"; g.fillRect(jx - 2, y, 5, B); }
    g.restore();
    g.fillStyle = "rgba(45,22,10,0.55)"; g.fillRect(0, y - 4, S, 8); g.fillStyle = "#2a140a"; g.fillRect(0, y - 2, S, 4);
  }
});
/** rug: border bands + central medallion pattern, one image (no repeat) */
export const rugHD = (base: string, border: string, accent: string) => ctex(`rug${base}${border}${accent}`, 1024, 768, (g, r) => {
  const W = 1024, H = 768;
  g.fillStyle = border; g.fillRect(0, 0, W, H);
  g.fillStyle = base; g.fillRect(70, 70, W - 140, H - 140);
  g.strokeStyle = accent; g.lineWidth = 14; g.strokeRect(46, 46, W - 92, H - 92); g.lineWidth = 6; g.strokeRect(96, 96, W - 192, H - 192);
  g.fillStyle = accent; g.globalAlpha = 0.85;
  g.beginPath(); g.moveTo(W / 2, H / 2 - 170); g.lineTo(W / 2 + 230, H / 2); g.lineTo(W / 2, H / 2 + 170); g.lineTo(W / 2 - 230, H / 2); g.closePath(); g.fill();
  g.fillStyle = border; g.beginPath(); g.moveTo(W / 2, H / 2 - 90); g.lineTo(W / 2 + 120, H / 2); g.lineTo(W / 2, H / 2 + 90); g.lineTo(W / 2 - 120, H / 2); g.closePath(); g.fill();
  g.globalAlpha = 1;
  for (let i = 0; i < 2600; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,250,240,0.05)" : "rgba(40,20,20,0.05)"; g.fillRect(U(r, 0, W), U(r, 0, H), 3, 3); } // pile
  for (let x = 10; x < W; x += 18) { g.fillStyle = "#efe6d2"; g.fillRect(x, 0, 6, 16); g.fillRect(x, H - 16, 6, 16); } // fringe
});
/** soft fabric (sofa, curtains): fine weave + broad folds of tone */
export const fabricHD = (col: string) => ctex("fab" + col, 512, 512, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 512, 512);
  tone(g, r, 512, 512, 10, "255,250,240", "40,30,40", 0.08, 60, 160);
  g.globalAlpha = 0.05; g.fillStyle = "#ffffff"; for (let y = 0; y < 512; y += 4) g.fillRect(0, y, 512, 1); g.fillStyle = "#000000"; for (let x = 0; x < 512; x += 4) g.fillRect(x, 0, 1, 512); g.globalAlpha = 1;
});
/** tarmac road, 1024 px = 4 m: dark warm grey (never black), aggregate speckle, patches and cracks */
export const asphaltHD = () => ctex("asphalt2", 1024, 1024, (g, r) => {
  g.fillStyle = "#77716f"; g.fillRect(0, 0, 1024, 1024);
  tone(g, r, 1024, 1024, 22, "170,160,150", "60,52,50", 0.18, 60, 220);
  speckle(g, r, 1024, 1024, 5000, ["rgba(190,185,190,0.35)", "rgba(30,28,34,0.35)", "rgba(140,130,125,0.3)"], 0.8, 2.2);
  for (let i = 0; i < 3; i++) { rr(g, U(r, 0, 900), U(r, 0, 900), U(r, 120, 260), U(r, 80, 200), 18); g.fillStyle = "rgba(50,48,55,0.35)"; g.fill(); }
  g.strokeStyle = "rgba(35,32,38,0.55)"; g.lineWidth = 2.5; g.lineCap = "round";
  for (let i = 0; i < 6; i++) { let x = U(r, 0, 1024), y = U(r, 0, 1024); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += U(r, -40, 40); y += U(r, 10, 50); g.lineTo(x, y); } g.stroke(); }
});
/** pavement slabs, 1024 px = 2 m (4 x 4 slabs of 0.5 m), warm light concrete with dark joints and edge lips */
export const pavementHD = (col = "#cdc6ba") => ctex("pave" + col, 1024, 1024, (g, r) => {
  const T = 256;
  g.fillStyle = "#857e74"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    g.fillStyle = jit(r, col, 0.05, 3, 0.1); g.fillRect(i * T + 5, j * T + 5, T - 10, T - 10);
    g.save(); g.beginPath(); g.rect(i * T + 5, j * T + 5, T - 10, T - 10); g.clip();
    tone(g, r, 1024, 1024, 3, "255,250,240", "90,80,70", 0.1, 40, 120);
    speckle(g, r, 1024, 1024, 500, ["rgba(90,80,70,0.25)", "rgba(255,255,250,0.25)"], 0.8, 1.8);
    g.restore();
    g.fillStyle = "rgba(255,250,240,0.35)"; g.fillRect(i * T + 5, j * T + 5, T - 10, 3);
  }
});
/** bare concrete / screed (lab floors, kerbs) */
export const concreteHD = (col = "#b9b4ab") => ctex("conc" + col, 1024, 1024, (g, r) => {
  g.fillStyle = col; g.fillRect(0, 0, 1024, 1024);
  tone(g, r, 1024, 1024, 20, "240,235,225", "90,85,80", 0.12, 60, 240);
  speckle(g, r, 1024, 1024, 2500, ["rgba(80,75,70,0.2)", "rgba(250,248,240,0.25)"], 0.8, 2);
});
/** dirt path, 1024 px = 4 m: warm ochre earth, pebbles, a few grass tufts at the edges of the tile */
export const dirtHD = () => ctex("dirt", 1024, 1024, (g, r) => {
  g.fillStyle = "#c79a64"; g.fillRect(0, 0, 1024, 1024);
  tone(g, r, 1024, 1024, 24, "232,196,140", "130,90,50", 0.22, 50, 200);
  for (let i = 0; i < 260; i++) { const x = U(r, 0, 1024), y = U(r, 0, 1024), s = U(r, 3, 9); wrap2(1024, 1024, x, y, s, (xx, yy) => { g.fillStyle = pick(r, ["#a98a6a", "#d8c2a2", "#8d7259"]); g.beginPath(); g.ellipse(xx, yy, s, s * 0.7, 0, 0, TAU); g.fill(); g.fillStyle = "rgba(255,245,225,0.4)"; g.beginPath(); g.ellipse(xx - s * 0.25, yy - s * 0.25, s * 0.4, s * 0.25, 0, 0, TAU); g.fill(); }); }
});
/** rock / boulder surface: grey-ochre with painted cracks and lichen dabs */
export const rockHD = () => ctex("rock", 512, 512, (g, r) => {
  g.fillStyle = "#a59c8f"; g.fillRect(0, 0, 512, 512);
  tone(g, r, 512, 512, 18, "220,214,200", "80,74,70", 0.25, 30, 120);
  g.strokeStyle = "rgba(60,52,50,0.45)"; g.lineWidth = 2;
  for (let i = 0; i < 10; i++) { let x = U(r, 0, 512), y = U(r, 0, 512); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += U(r, -40, 40); y += U(r, -40, 40); g.lineTo(x, y); } g.stroke(); }
  for (let i = 0; i < 30; i++) { g.fillStyle = "rgba(150,170,80,0.35)"; g.beginPath(); g.arc(U(r, 0, 512), U(r, 0, 512), U(r, 4, 14), 0, TAU); g.fill(); }
});
/** chalkboard: deep green slate, chalk dust smears and abstract "lesson" scribbles (no real words) */
export const chalkboardHD = (kind: "math" | "science" | "history" = "math") => ctex("chalk" + kind, 1536, 768, (g, r) => {
  g.fillStyle = "#2f5446"; g.fillRect(0, 0, 1536, 768);
  tone(g, r, 1536, 768, 14, "200,220,210", "20,40,30", 0.1, 80, 260, 1.8);
  g.strokeStyle = "rgba(240,240,230,0.85)"; g.lineCap = "round"; g.lineJoin = "round";
  const scrib = (x: number, y: number, w: number) => { g.lineWidth = 5; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < w / 22; k++) g.lineTo(x + k * 22 + U(r, 0, 10), y + U(r, -14, 14)); g.stroke(); };
  for (let row = 0; row < 5; row++) scrib(120, 140 + row * 110, U(r, 380, 700));
  if (kind === "math") { g.lineWidth = 7; g.beginPath(); g.moveTo(1000, 600); g.lineTo(1000, 160); g.moveTo(1000, 600); g.lineTo(1420, 600); g.stroke(); g.beginPath(); for (let x = 0; x <= 400; x += 10) g.lineTo(1000 + x, 600 - 0.0025 * x * x - 20); g.stroke(); }
  if (kind === "science") { g.lineWidth = 6; for (const [cx, cy, rd] of [[1180, 380, 60], [1300, 300, 40], [1080, 280, 40], [1300, 470, 40]]) { g.beginPath(); g.arc(cx, cy, rd, 0, TAU); g.stroke(); } g.beginPath(); g.moveTo(1180, 380); g.lineTo(1300, 300); g.moveTo(1180, 380); g.lineTo(1080, 280); g.moveTo(1180, 380); g.lineTo(1300, 470); g.stroke(); }
  if (kind === "history") { g.lineWidth = 6; g.beginPath(); g.moveTo(950, 400); g.lineTo(1450, 400); g.stroke(); for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(980 + i * 110, 380); g.lineTo(980 + i * 110, 420); g.stroke(); scrib(950 + i * 110, 470 + (i % 2) * 40, 80); } }
  g.fillStyle = "rgba(240,240,230,0.08)"; for (let i = 0; i < 6; i++) { rr(g, U(r, 0, 1300), U(r, 0, 600), U(r, 150, 300), U(r, 60, 120), 30); g.fill(); }
  g.fillStyle = "#8a5a3a"; g.fillRect(0, 0, 1536, 24); g.fillRect(0, 744, 1536, 24); g.fillRect(0, 0, 24, 768); g.fillRect(1512, 0, 24, 768);
});
/** whiteboard with marker diagrams (blue / red / black), aluminium frame */
export const whiteboardHD = (kind: "chart" | "formula" | "plan" = "chart") => ctex("wb" + kind, 1536, 864, (g, r) => {
  g.fillStyle = "#f6f6f2"; g.fillRect(0, 0, 1536, 864);
  tone(g, r, 1536, 864, 8, "255,255,255", "150,160,170", 0.06, 120, 300, 1.8);
  g.lineCap = "round"; g.lineJoin = "round";
  const pen = (c: string, w = 6) => { g.strokeStyle = c; g.lineWidth = w; };
  const scrib = (x: number, y: number, w: number, c: string) => { pen(c, 5); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < w / 20; k++) g.lineTo(x + k * 20 + U(r, 0, 8), y + U(r, -10, 10)); g.stroke(); };
  if (kind === "chart") {
    pen("#2a4a9a", 7); g.beginPath(); g.moveTo(140, 680); g.lineTo(140, 160); g.moveTo(140, 680); g.lineTo(820, 680); g.stroke();
    for (let i = 0; i < 5; i++) { const h = U(r, 120, 460); g.fillStyle = i === 3 ? "rgba(200,60,60,0.75)" : "rgba(42,74,154,0.55)"; g.fillRect(190 + i * 120, 680 - h, 80, h); }
    pen("#c03a3a", 6); g.beginPath(); g.arc(1150, 420, 190, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(1150, 420); g.lineTo(1150, 230); g.moveTo(1150, 420); g.lineTo(1320, 500); g.stroke();
  } else if (kind === "formula") { for (let row = 0; row < 6; row++) scrib(120, 130 + row * 110, U(r, 500, 1100), row % 3 === 2 ? "#c03a3a" : "#2a2a33"); pen("#2a4a9a", 8); g.strokeRect(100, 560, 640, 150); }
  else { for (const [x, y] of [[160, 160], [560, 160], [960, 160], [360, 480], [760, 480]]) { pen("#2a4a9a", 6); g.strokeRect(x, y, 300, 180); scrib(x + 30, y + 90, 230, "#2a2a33"); } pen("#c03a3a", 6); g.beginPath(); g.moveTo(460, 340); g.lineTo(510, 480); g.moveTo(860, 340); g.lineTo(810, 480); g.stroke(); }
  g.strokeStyle = "#b8bcc2"; g.lineWidth = 26; g.strokeRect(0, 0, 1536, 864);
});
/** a shelf row of book spines (tiles in x): varied widths, heights, colours, bands */
export const booksHD = (seed = 0) => ctex("books" + seed, 1024, 256, (g, r) => {
  g.fillStyle = "#3a2a22"; g.fillRect(0, 0, 1024, 256);
  let x = 0;
  const cols = ["#8c3b4a", "#2f5f6a", "#c9a24e", "#3f6fb5", "#5d7a3a", "#b5653f", "#e9dcc0", "#4b4f5c", "#7b5ac9", "#c0353a"];
  while (x < 1024) {
    const w = U(r, 26, 58), h = U(r, 170, 248), c = jit(r, pick(r, cols), 0.06, 4, 0.1), lean = r() < 0.08;
    g.save(); if (lean) { g.translate(x + w, 256); g.rotate(-0.12); g.translate(-x - w, -256); }
    g.fillStyle = c; g.fillRect(x, 256 - h, w - 3, h);
    g.fillStyle = "rgba(255,245,225,0.18)"; g.fillRect(x + 3, 256 - h, 4, h);
    g.fillStyle = "rgba(30,20,20,0.25)"; g.fillRect(x + w - 9, 256 - h, 6, h);
    g.fillStyle = r() > 0.5 ? "#d9c27a" : "rgba(255,250,235,0.7)"; g.fillRect(x + 4, 256 - h + 18, w - 11, 6); g.fillRect(x + 4, 256 - 30, w - 11, 5);
    g.restore();
    x += w;
  }
});
/** modern building facade, `wm` x `hm` metres: ground floor shopfront (glass + door + sign band), upper floors with
 *  window grid, spandrel bands. Glass is mid blue-violet with diagonal glints (never black). */
export const modernFacadeHD = (key: string, wm: number, hm: number, o: { wall: string; trim: string; sign: string; shop?: boolean; brick?: boolean }) => {
  const PX = Math.min(64, 2048 / Math.max(wm, hm)), W = Math.round(wm * PX), H = Math.round(hm * PX), m = (v: number) => v * PX;
  return ctex("mfac" + key, W, H, (g, r) => {
    g.fillStyle = o.wall; g.fillRect(0, 0, W, H);
    if (o.brick) { for (let y = 0; y < H; y += m(0.17)) for (let x = ((y / m(0.17)) % 2) * m(0.25); x < W; x += m(0.5)) { g.fillStyle = jit(r, o.wall, 0.08, 4, 0.1); g.fillRect(x + 2, y + 2, m(0.5) - 4, m(0.17) - 4); } }
    tone(g, r, W, H, 10, "255,250,240", "70,60,60", 0.08, m(1), m(4));
    const glass = (x: number, y: number, w: number, h: number) => {
      const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, "#7d93c7"); gr.addColorStop(1, "#4d5f96"); g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = "rgba(255,255,255,0.22)"; g.beginPath(); g.moveTo(x + w * 0.15, y + h); g.lineTo(x + w * 0.45, y); g.lineTo(x + w * 0.6, y); g.lineTo(x + w * 0.3, y + h); g.fill();
    };
    const top = o.shop ? m(4) : 0;
    const floors = Math.floor((hm - top / PX) / 3.2), n = Math.max(1, Math.floor(wm / 2.4));
    for (let f = 0; f < floors; f++) {
      const yb = H - top - (f + 1) * m(3.2);
      g.fillStyle = o.trim; g.fillRect(0, yb + m(3.05), W, m(0.15));
      for (let i = 0; i < n; i++) {
        const cx = ((i + 0.5) / n) * W, ww = m(1.4), wh = m(1.8), x = cx - ww / 2, y = yb + m(0.6);
        g.fillStyle = o.trim; g.fillRect(x - m(0.08), y - m(0.08), ww + m(0.16), wh + m(0.24));
        glass(x, y, ww, wh);
        g.fillStyle = o.trim; g.fillRect(cx - m(0.03), y, m(0.06), wh);
        if (r() < 0.35) { g.fillStyle = pick(r, ["rgba(240,220,170,0.8)", "rgba(200,90,80,0.7)", "rgba(240,240,230,0.8)"]); g.fillRect(x, y, ww * 0.3, wh); g.fillRect(x + ww * 0.7, y, ww * 0.3, wh); }
      }
    }
    if (o.shop) {
      const y0 = H - m(4);
      g.fillStyle = o.sign; g.fillRect(0, y0, W, m(0.9));
      g.fillStyle = "rgba(255,255,255,0.85)"; for (let k = 0; k < 5; k++) { rr(g, W * 0.25 + k * m(0.55), y0 + m(0.25), m(0.4), m(0.4), m(0.08)); g.fill(); }
      g.fillStyle = jit(r, o.wall, 0.06, 2, 0.05); g.fillRect(0, y0 + m(0.9), W, H - y0);
      g.fillStyle = o.trim; g.fillRect(0, H - m(0.25), W, m(0.25));
      glass(m(0.4), y0 + m(1.2), W * 0.55, m(2.5));
      const dx = W * 0.62 + m(0.3); glass(dx, y0 + m(1.0), m(1.2), m(3.0)); g.fillStyle = o.trim; g.fillRect(dx + m(0.58), y0 + m(1.0), m(0.05), m(3.0));
      g.fillStyle = "rgba(240,220,160,0.6)"; for (let k = 0; k < 4; k++) g.fillRect(m(0.7) + k * m(0.9), y0 + m(2.6), m(0.6), m(0.9)); // goods in the window
    }
  });
};
/** what you see through a window: painted sky, distant trees / rooftops, soft light (unlit material) */
export const windowViewHD = (kind: "garden" | "city" | "campus" = "garden") => ctex("view" + kind, 1024, 1024, (g, r) => {
  const sky = g.createLinearGradient(0, 0, 0, 1024); sky.addColorStop(0, "#7fb2ea"); sky.addColorStop(0.7, "#cfe2f4"); sky.addColorStop(1, "#e8f0f6");
  g.fillStyle = sky; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 4; i++) { g.fillStyle = "rgba(255,255,255,0.85)"; const x = U(r, 0, 1024), y = U(r, 80, 380); for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + k * 50, y + (k % 2) * 14, 70, 34, 0, 0, TAU); g.fill(); } }
  if (kind === "city") for (let x = 0; x < 1024;) { const w = U(r, 80, 180), h = U(r, 260, 620); g.fillStyle = pick(r, ["#b6bfd2", "#c9c2d6", "#a9b8cc", "#d6c9bd"]); g.fillRect(x, 1024 - h, w - 6, h); g.fillStyle = "rgba(90,110,160,0.35)"; for (let y = 1024 - h + 30; y < 1000; y += 46) for (let xx = x + 14; xx < x + w - 24; xx += 30) g.fillRect(xx, y, 16, 24); x += w; }
  else {
    for (let i = 0; i < 9; i++) { const x = U(r, -50, 1074), y = U(r, 640, 760), rad = U(r, 90, 170); g.fillStyle = pick(r, ["#8cc46e", "#7ab65e", "#9fcf7c"]); g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill(); g.fillStyle = "rgba(255,255,220,0.25)"; g.beginPath(); g.arc(x - rad * 0.3, y - rad * 0.3, rad * 0.5, 0, TAU); g.fill(); }
    if (kind === "campus") { g.fillStyle = "#d8b98f"; g.fillRect(560, 560, 380, 300); g.fillStyle = "#a95c45"; g.beginPath(); g.moveTo(540, 560); g.lineTo(750, 440); g.lineTo(960, 560); g.fill(); }
    g.fillStyle = "#86c06a"; g.fillRect(0, 820, 1024, 204);
  }
});
/** framed picture on a wall: simple painted landscape / abstract */
export const pictureHD = (kind: number) => ctex("pic" + kind, 512, 400, (g, r) => {
  const pal = [["#f0c987", "#e07a5f", "#3d405b", "#81b29a"], ["#a8dadc", "#457b9d", "#1d3557", "#f1faee"], ["#ffcad4", "#b0d0d3", "#c08497", "#f7af9d"]][kind % 3];
  g.fillStyle = pal[0]; g.fillRect(0, 0, 512, 400);
  if (kind % 2 === 0) { g.fillStyle = pal[1]; g.beginPath(); g.arc(380, 120, 60, 0, TAU); g.fill(); g.fillStyle = pal[3]; g.beginPath(); g.moveTo(0, 400); g.lineTo(0, 260); g.quadraticCurveTo(160, 160, 300, 260); g.quadraticCurveTo(420, 330, 512, 250); g.lineTo(512, 400); g.fill(); g.fillStyle = pal[2]; g.beginPath(); g.moveTo(0, 400); g.lineTo(0, 330); g.quadraticCurveTo(250, 260, 512, 340); g.lineTo(512, 400); g.fill(); }
  else for (let i = 0; i < 7; i++) { g.fillStyle = pal[1 + (i % 3)]; rr(g, U(r, 20, 380), U(r, 20, 280), U(r, 60, 180), U(r, 40, 140), 12); g.fill(); }
});
/** monitor screen content: charts / code / video call (unlit) */
export const screenHD = (kind: "chart" | "code" | "news" = "chart") => ctex("scr" + kind, 512, 320, (g, r) => {
  g.fillStyle = kind === "code" ? "#22263a" : "#eef2f8"; g.fillRect(0, 0, 512, 320);
  if (kind === "chart") { g.fillStyle = "#d5dceb"; g.fillRect(0, 0, 512, 34); for (let i = 0; i < 6; i++) { const h = U(r, 40, 200); g.fillStyle = i === 4 ? "#e05a4f" : "#4a7bd0"; g.fillRect(40 + i * 70, 290 - h, 46, h); } }
  else if (kind === "code") for (let y = 30; y < 300; y += 22) { let x = 24 + Math.floor(U(r, 0, 4)) * 20; while (x < 460 && r() > 0.15) { const w = U(r, 20, 90); g.fillStyle = pick(r, ["#7fd6a0", "#e5c07b", "#61afef", "#c678dd", "#abb2bf"]); g.fillRect(x, y, w, 10); x += w + 10; } }
  else { g.fillStyle = "#c0353a"; g.fillRect(0, 250, 512, 40); g.fillStyle = "#9fb6d8"; g.fillRect(30, 30, 260, 200); g.fillStyle = "#e8b896"; g.beginPath(); g.arc(160, 120, 50, 0, TAU); g.fill(); }
});
/** liquid colour swatch for flasks (subtle vertical gradient + meniscus highlight) */
export const liquidMatColor = (c: string) => new THREE.Color(c);

/** ceiling bounce: warm, lighter in the middle, darker toward the back wall and the side walls (unlit texture; v = 0 at
 *  the back wall). Gives depth to the ceiling band that vertical frames always show. */
export const ceilingHD = (c: string) => ctex("ceil" + c, 512, 512, (g) => {
  g.fillStyle = c; g.fillRect(0, 0, 512, 512);
  const back = g.createLinearGradient(0, 512, 0, 300); back.addColorStop(0, "rgba(90,60,40,0.32)"); back.addColorStop(1, "rgba(90,60,40,0)");
  g.fillStyle = back; g.fillRect(0, 300, 512, 212);
  for (const [x0, x1] of [[0, 90], [512, 422]]) { const sd = g.createLinearGradient(x0, 0, x1, 0); sd.addColorStop(0, "rgba(90,60,40,0.28)"); sd.addColorStop(1, "rgba(90,60,40,0)"); g.fillStyle = sd; g.fillRect(Math.min(x0, x1), 0, 90, 512); }
  const mid = g.createRadialGradient(256, 330, 10, 256, 330, 260); mid.addColorStop(0, "rgba(255,248,230,0.35)"); mid.addColorStop(1, "rgba(255,248,230,0)");
  g.fillStyle = mid; g.fillRect(0, 0, 512, 512);
});

/** suspended ceiling: acoustic tiles in a light grid with glowing light panels (offices, classrooms, labs; unlit) */
export const ceilingTilesHD = (c: string) => ctex("ceilt" + c, 1024, 1024, (g, r) => {
  g.fillStyle = c; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    g.fillStyle = jit(r, c, 0.025, 2, 0.05); g.fillRect(i * 128 + 3, j * 128 + 3, 122, 122);
    for (let k = 0; k < 30; k++) { g.fillStyle = "rgba(120,110,100,0.12)"; g.fillRect(i * 128 + U(r, 8, 120), j * 128 + U(r, 8, 120), 2, 2); }
  }
  g.fillStyle = "rgba(255,252,240,0.95)"; for (const [i, j] of [[1, 2], [5, 2], [1, 5], [5, 5], [3, 7]]) { g.fillRect(i * 128 + 6, j * 128 + 6, 244, 116); }
  g.strokeStyle = "rgba(120,110,95,0.55)"; g.lineWidth = 6; for (let x = 0; x <= 1024; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1024); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(1024, x); g.stroke(); }
  const back = g.createLinearGradient(0, 1024, 0, 640); back.addColorStop(0, "rgba(90,70,50,0.25)"); back.addColorStop(1, "rgba(90,70,50,0)"); g.fillStyle = back; g.fillRect(0, 640, 1024, 384);
});

/** lit shop interior seen through a window: warm back wall, shelves with goods, a counter (unlit material) */
export const shopInteriorHD = (kind: "cafe" | "books" | "grocer" = "cafe") => ctex("shopin" + kind, 1024, 768, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 768); gr.addColorStop(0, "#f6dca8"); gr.addColorStop(1, "#e5b77a"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 768);
  for (let k = 0; k < 3; k++) {
    const y = 140 + k * 150; g.fillStyle = "#8a5a3c"; g.fillRect(40, y, 944, 14);
    let x = 60; while (x < 960) { const w = kind === "books" ? U(r, 18, 34) : U(r, 40, 70), h = kind === "books" ? U(r, 70, 110) : U(r, 40, 80);
      g.fillStyle = pick(r, kind === "grocer" ? ["#e2453c", "#f4b23a", "#7ab65e", "#9b4ad8"] : kind === "books" ? ["#8c3b4a", "#2f5f6a", "#c9a24e", "#3f6fb5", "#5d7a3a"] : ["#f1e6cf", "#c8643f", "#3f6fb5", "#e9c46a"]);
      if (kind === "cafe") { g.beginPath(); g.ellipse(x + w / 2, y - h / 2, w / 2.4, h / 2, 0, 0, TAU); g.fill(); } else g.fillRect(x, y - h, w - 4, h);
      x += w + U(r, 4, 14); }
  }
  g.fillStyle = "#6e4b33"; g.fillRect(0, 560, 1024, 208); g.fillStyle = "#8a5a3c"; g.fillRect(0, 548, 1024, 24);
  if (kind === "cafe") { for (const x of [200, 520, 820]) { g.fillStyle = "#fff4d6"; g.beginPath(); g.arc(x, 60, 26, 0, TAU); g.fill(); g.fillStyle = "rgba(255,240,200,0.25)"; g.beginPath(); g.arc(x, 90, 90, 0, TAU); g.fill(); } }
});
