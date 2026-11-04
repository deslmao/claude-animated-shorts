// Explainer diagrams (stage 6 revision): animated panels in the house style (flat colours, plum ink, a rounded white
// card) that a presenter shows beside them, so a scientific idea is visible and not only narrated. A storyboard shot
// gets `diagram: { kind, with: "<presenter>", steps: [{ word }, ...] }`; each step lands on its word (story/timing.ts)
// and the drawing is a pure function of the shot time (deterministic for chunked renders). No text: the narration and
// captions carry the words; the diagram carries the picture. Drawn on a 1000 x 1000 canvas.
import { Pen, INK, P2, rad } from "../characters/toon";
import { FxPlace, cardKey } from "../cards/cards";

export type DiagramKind = "forecast" | "prediction" | "contrast" | "delay" | "shares" | "merchant" | "crew" | "timeline";
export const DIAGRAM_KINDS: DiagramKind[] = ["forecast", "prediction", "contrast", "delay", "shares", "merchant", "crew", "timeline"];
export const DIAGRAM_STEPS: Record<DiagramKind, string> = {
  forecast: "the brain from the first frame; 1 the cerebellum lights up, 2 a signal runs to the forecast card, 3 the predicted hand travels to the armpit, 4 the countdown completes (0.35 s) and ticks",
  prediction: "your own touch, from the first frame (the predicted outline waiting); 1 your hand lands in it, 2 tick, 3 the tickle meter turns down, 4 + 5 it sits at zero (no surprise, no tickle)",
  contrast: "both touches from the first frame: yours (predicted, meter low) vs someone else's (unpredicted, meter high); 1 highlights the surprise, 2 sparkles it",
  delay: "control (blue) and robot (orange) strokes in sync from the first frame; 1 tick, 2 the robot's stroke slips behind (a delay), 3 a tickle burst",
  shares: "a heap of loot between a captain and a sailor from the first frame; 1 the coins stream out to both, 2 the captain's two purses pop in, 3 the sailor's one",
  merchant: "two chains of command side by side, the merchant one lit: 1 the owner on land (house), 2 the arrow down to the captain, 3 the captain's raised stick and the cowering sailors",
  crew: "the same two chains, the pirate one lit: 1 the owner is crossed out (no owners), 2 the crew on top lights up, 3 their raised hands elect captain and quartermaster, 4 a crossed-out crown (no tyrant)",
  timeline: "a timeline 1700-1900 from the first frame; 1 the 1720s pirate marker (flag, purse, sling) pops in, 2 a bar sweeps 'long before' along to 1884, 3 the 1884 country marker (a state building) pops in",
};

const PINK = "#f4a6b8", PINK_D = "#d97b93", ORANGE = "#ff9f43", BLUE = "#3f8fd8", GREEN = "#4fbf7a", RED = "#e2453c", PAPER = "#fffaf0", SKIN = "#f5c9a0";
const ease = (x: number) => { const u = Math.max(0, Math.min(1, x)); return u * u * (3 - 2 * u); };
const pop = (t: number) => (t <= 0 ? 0 : t < 0.14 ? (t / 0.14) * 1.15 : t < 0.26 ? 1.15 - ((t - 0.14) / 0.12) * 0.15 : 1);
/** how long ago step k happened (seconds; negative = not yet) */
const since = (tt: number, steps: number[], k: number) => (steps[k - 1] === undefined ? -1 : tt - steps[k - 1]);

const panel = (p: Pen) => {
  const g = p.g; g.save();
  const r = 70, x0 = 40, y0 = 40, x1 = 960, y1 = 960;
  g.beginPath(); g.moveTo(x0 + r, y0); g.arcTo(x1, y0, x1, y1, r); g.arcTo(x1, y1, x0, y1, r); g.arcTo(x0, y1, x0, y0, r); g.arcTo(x0, y0, x1, y0, r); g.closePath();
  g.fillStyle = PAPER; g.fill(); g.lineWidth = 14; g.strokeStyle = INK; g.stroke(); g.restore();
};
const scaled = (p: Pen, cx: number, cy: number, k: number, fn: () => void) => { if (k <= 0) return; const g = p.g; g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy); fn(); g.restore(); };
const check = (p: Pen, x: number, y: number, s: number, col = GREEN) => { p.ell(x, y, 44 * s, 44 * s, col, 9); p.stroke([[x - 20 * s, y + 2 * s], [x - 5 * s, y + 18 * s], [x + 22 * s, y - 16 * s]], 12 * s, "#ffffff"); };
const bang = (p: Pen, x: number, y: number, s: number) => { p.ell(x, y, 44 * s, 44 * s, RED, 9); p.stroke([[x, y - 22 * s], [x, y + 6 * s]], 12 * s, "#ffffff"); p.dot(x, y + 20 * s, 7 * s, "#ffffff"); };
const ask = (p: Pen, x: number, y: number, s: number) => { p.ell(x, y, 44 * s, 44 * s, "#f4d24a", 9); p.arc(x, y - 8 * s, 14 * s, 12 * s, 200, 400, 10 * s, INK); p.stroke([[x + 2 * s, y + 4 * s], [x, y + 12 * s]], 10 * s); p.dot(x, y + 24 * s, 6 * s); };

/** a side-view brain (facing left): cerebrum with folds, the cerebellum at the back-bottom, the brain stem */
const brain = (p: Pen, cx: number, cy: number, s: number, glow: number, t: number) => {
  const pts: P2[] = [];
  for (let i = 0; i <= 40; i++) { const a = rad(180 + (360 * i) / 40), w = 1 + 0.04 * Math.sin(i * 1.7); pts.push([cx + Math.cos(a) * 230 * s * w, cy + Math.sin(a) * 160 * s * w * (Math.sin(a) > 0 ? 0.82 : 1)]); }
  p.poly(pts, PINK, 12);
  for (const [x0, y0, x1, y1, x2, y2] of [[-150, -60, -60, -110, 30, -70], [-40, -20, 40, -60, 130, -30], [-170, 40, -90, 10, -20, 50], [40, 30, 110, -10, 170, 40], [-80, -120, 0, -140, 80, -115]])
    p.stroke([[cx + x0 * s, cy + y0 * s], [cx + x1 * s, cy + y1 * s], [cx + x2 * s, cy + y2 * s]], 9 * s, PINK_D);
  // cerebellum: back (right) bottom, striped; lights up orange with a pulsing glow
  const ex = cx + 150 * s, ey = cy + 105 * s;
  if (glow > 0) { p.g.save(); p.g.globalAlpha = 0.35 * glow * (0.8 + 0.2 * Math.sin(t * 8)); p.ell(ex, ey, 120 * s, 95 * s, ORANGE, 0); p.g.restore(); }
  p.ell(ex, ey, 92 * s, 66 * s, glow > 0 ? ORANGE : PINK_D, 11);
  for (const dy of [-30, -8, 14, 34]) p.arc(ex, ey + dy * s, 72 * s, 12 * s, 200, 340, 6 * s, glow > 0 ? "#c96a14" : "#b65a74");
  p.poly([[cx + 40 * s, cy + 110 * s], [cx + 80 * s, cy + 110 * s], [cx + 70 * s, cy + 230 * s], [cx + 30 * s, cy + 230 * s]], PINK_D, 10); // stem
};
/** a small body icon (head + torso + the armpit side) with a hand */
const body = (p: Pen, cx: number, cy: number, s: number, hair: string, bald = false) => {
  p.poly([[cx - 70 * s, cy + 10 * s], [cx + 70 * s, cy + 10 * s], [cx + 85 * s, cy + 190 * s], [cx - 85 * s, cy + 190 * s]], "#e9a93b", 10);
  p.ell(cx, cy - 60 * s, 62 * s, 58 * s, SKIN, 10);
  if (bald) { p.ell(cx - 58 * s, cy - 58 * s, 16 * s, 22 * s, hair, 6); p.ell(cx + 58 * s, cy - 58 * s, 16 * s, 22 * s, hair, 6); p.poly([[cx - 26 * s, cy - 40 * s], [cx + 26 * s, cy - 40 * s], [cx + 20 * s, cy - 30 * s], [cx - 20 * s, cy - 30 * s]], hair, 5); }
  else for (const dx of [-30, 0, 30]) p.poly([[cx + (dx - 16) * s, cy - 104 * s], [cx + (dx + 6) * s, cy - 150 * s], [cx + (dx + 16) * s, cy - 100 * s]], hair, 7);
  for (const dx of [-20, 20]) p.dot(cx + dx * s, cy - 64 * s, 7 * s);
};
const hand = (p: Pen, x: number, y: number, s: number, ghost = false, fill = SKIN) => {
  if (ghost) {
    p.g.save(); p.g.setLineDash([16 * s, 12 * s]); p.ell(x, y, 34 * s, 30 * s, null, 7 * s);
    for (let k = 0; k < 3; k++) p.stroke([[x + (k - 1) * 18 * s, y - 26 * s], [x + (k - 1) * 22 * s, y - 58 * s]], 7 * s);
    p.g.restore(); return;
  }
  for (let k = 0; k < 3; k++) p.line([[x + (k - 1) * 18 * s, y - 20 * s], [x + (k - 1) * 22 * s, y - 56 * s]], fill, 14 * s);
  p.ell(x, y, 34 * s, 30 * s, fill, 9);
};
/** a big "tickle meter" bar with a face at its end that laughs when it is high; glow = pulse a ring round the face */
const bigMeter = (p: Pen, x: number, y: number, w: number, v: number, glow = 0) => {
  const h = 46, vv = Math.max(0.02, Math.min(1, v)), col = vv < 0.3 ? GREEN : vv < 0.65 ? "#f4d24a" : RED;
  p.poly([[x, y - h], [x + w, y - h], [x + w, y + h], [x, y + h]], "#efe6d8", 11);
  p.poly([[x + 12, y - h + 12], [x + 12 + (w - 24) * vv, y - h + 12], [x + 12 + (w - 24) * vv, y + h - 12], [x + 12, y + h - 12]], col, 0);
  const fx = x + w + 74;
  if (glow > 0) { p.g.save(); p.g.globalAlpha = 0.35 * glow; p.ell(fx, y, 70, 70, GREEN, 0); p.g.restore(); }
  p.ell(fx, y, 52, 52, "#ffe8a3", 9);
  for (const dx of [-17, 17]) { if (vv > 0.65) p.arc(fx + dx, y - 10, 9, 7, 200, 340, 7); else p.dot(fx + dx, y - 10, 7); }
  if (vv > 0.65) dmouthOpen(p, fx, y + 14); else p.stroke([[fx - 20, y + 18], [fx + 20, y + 18]], 8);
};
const dmouthOpen = (p: Pen, x: number, y: number) => { p.ell(x, y, 22, 16, "#7a2a3a", 7, 0, 180); };
/** one "touch" row: a body icon, a dotted predicted outline at the armpit (or none), the hand landing, a meter */
const touchRow = (p: Pen, y: number, s: number, who: "self" | "other", landed: number, predicted: boolean, meterV: number, glow = 0) => {
  body(p, 210, y - 30, s, who === "self" ? "#4a2f22" : "#bdb8b1", who === "other");
  const ax = 210 + 95 * s, ay = y - 10;
  if (predicted) hand(p, ax + 30, ay, s, true);
  const u = ease(landed);
  hand(p, ax + 30 + 170 * (1 - u), ay + 110 * (1 - u) * (who === "self" ? 1 : -0.2), s, false, who === "self" ? SKIN : "#ffe2c2");
  bigMeter(p, 470, y + 150 * s - 120, 300, meterV, glow);
};

// ---- people and things for the history panels (front-facing icons in the house style) ----
const SKIN2 = "#f2c7a0", CRIMSON = "#c0353a";
/** a person icon: torso + head; hat "tricorn" | "bandana" | "top" | none; coat colour; stripes for a sailor shirt */
const person = (p: Pen, cx: number, cy: number, s: number, o: { coat: string; hat?: "tricorn" | "bandana" | "top"; stripes?: boolean; face?: "smile" | "sad" | "stern" | "grin" }) => {
  p.poly([[cx - 58 * s, cy + 8 * s], [cx + 58 * s, cy + 8 * s], [cx + 72 * s, cy + 150 * s], [cx - 72 * s, cy + 150 * s]], o.coat, 9 * s);
  if (o.stripes) for (let k = 0; k < 4; k++) p.stroke([[cx - 60 * s + k * 2 * s, cy + 34 * s + k * 30 * s], [cx + 60 * s + k * 2 * s, cy + 34 * s + k * 30 * s]], 9 * s, CRIMSON);
  p.ell(cx, cy - 52 * s, 52 * s, 50 * s, SKIN2, 9 * s);
  const f = o.face ?? "smile";
  for (const dx of [-17, 17]) { if (f === "grin") p.arc(cx + dx * s, cy - 58 * s, 8 * s, 6 * s, 200, 340, 6 * s); else p.dot(cx + dx * s, cy - 58 * s, 6.5 * s); }
  if (f === "sad") p.arc(cx, cy - 22 * s, 16 * s, 10 * s, 200, 340, 6 * s); else if (f === "stern") p.stroke([[cx - 16 * s, cy - 30 * s], [cx + 16 * s, cy - 30 * s]], 6 * s); else p.arc(cx, cy - 40 * s, 16 * s, 12 * s, 20, 160, 6 * s);
  if (f === "stern") { p.stroke([[cx - 30 * s, cy - 78 * s], [cx - 8 * s, cy - 70 * s]], 6 * s); p.stroke([[cx + 30 * s, cy - 78 * s], [cx + 8 * s, cy - 70 * s]], 6 * s); }
  if (o.hat === "tricorn") { p.poly([[cx - 74 * s, cy - 82 * s], [cx, cy - 126 * s], [cx + 74 * s, cy - 82 * s], [cx, cy - 94 * s]], "#2a2230", 8 * s); p.stroke([[cx - 60 * s, cy - 86 * s], [cx + 60 * s, cy - 86 * s]], 5 * s, "#e8c45a"); }
  else if (o.hat === "bandana") { p.poly([[cx - 50 * s, cy - 70 * s], [cx + 50 * s, cy - 70 * s], [cx + 40 * s, cy - 100 * s], [cx - 40 * s, cy - 100 * s]], CRIMSON, 7 * s); p.poly([[cx + 46 * s, cy - 78 * s], [cx + 74 * s, cy - 66 * s], [cx + 60 * s, cy - 92 * s]], CRIMSON, 6 * s); }
  else if (o.hat === "top") { p.poly([[cx - 40 * s, cy - 92 * s], [cx + 40 * s, cy - 92 * s], [cx + 36 * s, cy - 160 * s], [cx - 36 * s, cy - 160 * s]], "#2a2230", 8 * s); p.poly([[cx - 64 * s, cy - 86 * s], [cx + 64 * s, cy - 86 * s], [cx + 64 * s, cy - 98 * s], [cx - 64 * s, cy - 98 * s]], "#2a2230", 6 * s); }
};
const purse = (p: Pen, x: number, y: number, s: number) => {
  p.ell(x, y, 40 * s, 36 * s, "#a8743f", 8 * s);
  p.poly([[x - 16 * s, y - 30 * s], [x + 16 * s, y - 30 * s], [x + 24 * s, y - 52 * s], [x - 24 * s, y - 52 * s]], "#a8743f", 7 * s);
  p.stroke([[x - 18 * s, y - 30 * s], [x + 18 * s, y - 30 * s]], 6 * s, "#5a3b2a");
  p.ell(x - 8 * s, y - 54 * s, 11 * s, 8 * s, "#f0c040", 5 * s); p.ell(x + 10 * s, y - 56 * s, 11 * s, 8 * s, "#f0c040", 5 * s);
};
const coin = (p: Pen, x: number, y: number, s: number) => { p.ell(x, y, 22 * s, 22 * s, "#f0c040", 6 * s); p.ell(x, y, 12 * s, 12 * s, null, 4 * s, 0, 360); };
const arrow = (p: Pen, a: P2, b: P2, w: number, col = INK, k = 1) => {
  if (k <= 0) return; const e: P2 = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], ang = Math.atan2(e[1] - a[1], e[0] - a[0]);
  p.stroke([a, e], w, col); p.poly([[e[0] + Math.cos(ang) * 3 * w, e[1] + Math.sin(ang) * 3 * w], [e[0] + Math.cos(ang + 2.4) * 3 * w, e[1] + Math.sin(ang + 2.4) * 3 * w], [e[0] + Math.cos(ang - 2.4) * 3 * w, e[1] + Math.sin(ang - 2.4) * 3 * w]], col, 0);
};
const cross = (p: Pen, x: number, y: number, r: number, k = 1) => { if (k <= 0) return; p.stroke([[x - r, y - r], [x - r + 2 * r * k, y - r + 2 * r * k]], r * 0.28, CRIMSON); if (k > 0.5) p.stroke([[x + r, y - r], [x + r - 2 * r * (k - 0.5) * 2, y - r + 2 * r * (k - 0.5) * 2]], r * 0.28, CRIMSON); };
/** stroke digits (0-9 and "s"): drawn, not typeset, so every machine and render chunk draws them identically */
const DIGITS: Record<string, number[][]> = {
  "0":[[0.5,0.0,0.629,0.034,0.75,0.134,0.854,0.293,0.933,0.5,0.983,0.741,1.0,1.0,0.983,1.259,0.933,1.5,0.854,1.707,0.75,1.866,0.629,1.966,0.5,2.0,0.371,1.966,0.25,1.866,0.146,1.707,0.067,1.5,0.017,1.259,0.0,1.0,0.017,0.741,0.067,0.5,0.146,0.293,0.25,0.134,0.371,0.034,0.5,0.0]], "1": [[0.2, 0.4, 0.6, 0, 0.6, 2]], "2": [[0, 0.3, 0.3, 0, 0.8, 0, 1, 0.4, 0, 2, 1, 2]], "3": [[0, 0, 1, 0, 0.4, 0.9, 1, 1.4, 0.7, 2, 0, 1.9]],
  "4": [[0.8, 2, 0.8, 0, 0, 1.4, 1.1, 1.4]], "5": [[1, 0, 0.1, 0, 0, 0.9, 0.8, 0.9, 1, 1.4, 0.7, 2, 0, 1.9]], "6": [[0.9, 0, 0.2, 0.6, 0, 1.5, 0.4, 2, 1, 1.6, 0.8, 1.1, 0, 1.3]],
  "7": [[0, 0, 1, 0, 0.4, 2]], "8": [[0.5, 1, 0.1, 0.5, 0.5, 0, 0.9, 0.5, 0.5, 1, 1, 1.5, 0.5, 2, 0, 1.5, 0.5, 1]], "9": [[1, 0.7, 0.6, 1, 0, 0.6, 0.4, 0, 1, 0.3, 0.9, 2]], s: [[0.8, 1, 0.2, 1, 0.1, 1.4, 0.8, 1.6, 0.7, 2, 0, 2]],
};
const digits = (p: Pen, str: string, cx: number, y: number, h: number, col = INK) => {
  const w = h * 0.5, gap = h * 0.22, tot = str.length * w + (str.length - 1) * gap; let x = cx - tot / 2;
  for (const ch of str) { for (const seg of DIGITS[ch] ?? []) { const pts: P2[] = []; for (let i = 0; i < seg.length; i += 2) pts.push([x + seg[i] * w, y + (seg[i + 1] / 2) * h]); p.stroke(pts, h * 0.13, col); } x += w + gap; }
};
/** the two chains of command (merchant left, pirate right); lit = which column is in focus */
const chains = (p: Pen, tt: number, t: (k: number) => number, lit: "merchant" | "crew") => {
  const dim = (on: boolean, fn: () => void) => { p.g.save(); p.g.globalAlpha = on ? 1 : 0.28; fn(); p.g.restore(); };
  const M = lit === "merchant", L = 270, R = 730;
  p.stroke([[500, 90], [500, 910]], 7, "#e2d6c4");
  // merchant: owner on land (house) -> captain -> sailors
  dim(M, () => {
    const s1 = M ? (t(1) >= 0 ? 1 : 0.45) : 1;
    p.g.save(); p.g.globalAlpha *= s1;
    p.poly([[L + 60, 250], [L + 130, 250], [L + 130, 180], [L + 95, 145], [L + 60, 180]], "#f6e3b4", 7); p.poly([[L + 85, 250], [L + 105, 250], [L + 105, 215], [L + 85, 215]], "#8a4f2c", 4);
    person(p, L - 45, 215, 0.72, { coat: "#3d3a52", hat: "top", face: "stern" });
    p.g.restore();
    const k2 = M ? (t(2) >= 0 ? ease(t(2) / 0.5) : 0) : 1;
    arrow(p, [L, 320], [L, 440], 10, INK, k2);
    person(p, L, 520, 0.72, { coat: RED, hat: "tricorn", face: M && t(3) >= 0 ? "stern" : "smile" });
    if (M && t(3) >= 0) { const sw = Math.sin(tt * 9) * 0.3; p.g.save(); p.g.translate(L + 62, 575); p.g.rotate(0.75 + sw); p.stroke([[0, 0], [0, -130]], 13, "#7a4f33"); p.g.restore(); }
    arrow(p, [L, 640], [L, 740], 10, INK, M ? (t(2) >= 0 ? ease((t(2) - 0.3) / 0.5) : 0) : 1);
    const sad = M && t(3) >= 0, dy = sad ? 6 * Math.abs(Math.sin(tt * 10)) : 0;
    for (const dx of [-125, 0, 125]) person(p, L + dx, 815 + dy, 0.5, { coat: "#f2e6c8", hat: "bandana", stripes: true, face: sad ? "sad" : "smile" });
  });
  // pirate: no owner; the crew on top elects the captain and the quartermaster below
  dim(!M, () => {
    p.g.save(); p.g.globalAlpha *= 0.55; p.poly([[R + 60, 250], [R + 130, 250], [R + 130, 180], [R + 95, 145], [R + 60, 180]], "#f6e3b4", 7); person(p, R - 45, 215, 0.72, { coat: "#3d3a52", hat: "top", face: "stern" }); p.g.restore();
    if (!M) cross(p, R + 20, 200, 110, t(1) >= 0 ? ease(t(1) / 0.5) : 0);
    const glow = !M && t(2) >= 0 ? ease(t(2) / 0.4) : 0;
    if (glow > 0) { p.g.save(); p.g.globalAlpha *= 0.3 * glow; p.ell(R, 420, 220, 100, "#f4d24a", 0); p.g.restore(); }
    const up = !M && t(3) >= 0 ? ease(t(3) / 0.4) : 0;
    for (const dx of [-150, -50, 50, 150]) {
      person(p, R + dx, 430, 0.42, { coat: "#f2e6c8", hat: "bandana", stripes: true, face: "grin" });
      if (up > 0) { p.stroke([[R + dx + 30, 448], [R + dx + 42, 448 - 70 * up]], 10, SKIN2); p.ell(R + dx + 42, 440 - 76 * up, 11, 11, SKIN2, 4); }
    }
    const ka = !M ? (t(3) >= 0 ? ease((t(3) - 0.2) / 0.5) : 0) : 1;
    arrow(p, [R - 60, 520], [R - 110, 640], 10, "#2a9d8f", ka); arrow(p, [R + 60, 520], [R + 110, 640], 10, "#2a9d8f", ka);
    person(p, R - 115, 745, 0.6, { coat: RED, hat: "tricorn", face: "smile" });
    person(p, R + 115, 745, 0.6, { coat: "#2f6e4f", hat: "bandana", face: "smile" });
    // no tyrant: a crown beside the elected captain, crossed out
    if (!M && t(4) >= 0) { const k = pop(t(4)), cx = R - 205, cy = 640; scaled(p, cx, cy, k, () => { p.poly([[cx - 45, cy + 25], [cx - 35, cy - 25], [cx - 15, cy + 5], [cx, cy - 35], [cx + 15, cy + 5], [cx + 35, cy - 25], [cx + 45, cy + 25]], "#f0c040", 6); }); cross(p, cx, cy, 50, ease(t(4) / 0.4)); }
  });
};

export const drawDiagram = (p: Pen, kind: DiagramKind, tt: number, steps: number[]) => {
  panel(p);
  const t = (k: number) => since(tt, steps, k);
  if (kind === "forecast") {
    // the brain is there from the first frame; 1 the cerebellum lights up, 2 a signal runs to the forecast card,
    // 3 the predicted hand travels to the armpit, 4 the countdown completes
    brain(p, 360, 300, 1.05, t(1) >= 0 ? ease(t(1) / 0.4) : 0, tt);
    {
      const live = t(2) >= 0;
      const path = (u: number): P2 => { const a: P2 = [520, 420], c: P2 = [700, 400], b: P2 = [660, 520]; return [(1 - u) ** 2 * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]; };
      const grow = live ? ease(t(2) / 0.5) : 0;
      if (live) { p.g.save(); p.g.setLineDash([20, 16]); const seg: P2[] = []; for (let i = 0; i <= 20; i++) seg.push(path((i / 20) * grow)); p.stroke(seg, 11, ORANGE); p.g.restore();
      for (let k = 0; k < 3; k++) { const u = ((tt * 1.3 + k / 3) % 1) * grow; const [x, y] = path(u); p.dot(x, y, 16, ORANGE); p.dot(x, y, 7, "#ffffff"); } }
      // the forecast card, large: body icon, the predicted (dotted) hand at the armpit, the hand's dashed path
      // before the forecast arrives the card waits, faded (so the panel is never half empty); then it pops in
      const e = live ? ease((t(2) - 0.35) / 0.3) : 0, k = 1 + 0.08 * Math.sin(Math.PI * e);
      p.g.save(); p.g.globalAlpha = 0.3 + 0.7 * e;
      scaled(p, 600, 740, k, () => {
        p.poly([[300, 530], [920, 530], [920, 935], [300, 935]], "#fff3d6", 11);
        body(p, 460, 730, 1.15, "#4a2f22");
        const ax = 560, ay = 740;
        hand(p, ax + 30, ay - 8, 1.1, true);
        p.g.save(); p.g.setLineDash([14, 12]); p.arc(ax + 95, ay + 45, 150, 110, -70, 70, 9, BLUE); p.g.restore();
        const u = t(3) >= 0 ? ease(t(3) / 1.2) : 0, a = rad(70 - 140 * u);
        hand(p, ax + 95 + 150 * Math.cos(a), ay + 45 + 110 * Math.sin(a), 1.1);
        const cx = 835, cy = 615;
        p.ell(cx, cy, 52, 52, "#ffffff", 9);
        const fill = t(4) >= 0 ? 0.35 + 0.65 * ease(t(4) / 0.35) : t(3) >= 0 ? 0.35 * ease(t(3) / 1.2) : 0; // "any moment now": completes fast
        if (fill > 0) { const pts: P2[] = [[cx, cy]]; for (let i = 0; i <= 24; i++) pts.push([cx + 44 * Math.cos(rad(-90 + 360 * fill * (i / 24))), cy + 44 * Math.sin(rad(-90 + 360 * fill * (i / 24)))]); p.poly(pts, BLUE, 0); }
        if (t(4) > 0.35) check(p, cx, cy, 1.0 * pop(t(4) - 0.35));
      });
      p.g.restore();
    }
  } else if (kind === "prediction") {
    // your OWN touch only, large and visible from the first frame: the predicted (dotted) outline waits at the armpit;
    // 1 your hand lands in it, 2 a tick (as predicted), 3 the tickle meter turns down, 4 + 5 it sits at zero ("no
    // surprise, no tickle") with a calm, glowing face
    const v = t(3) >= 0 ? 0.6 - 0.58 * ease(t(3) / 0.8) : 0.6, glow = t(4) >= 0 ? 0.6 + 0.4 * Math.sin(tt * 8) : 0;
    body(p, 290, 370, 1.6, "#4a2f22");
    const gx = 470, gy = 430, u = t(1) >= 0 ? ease(t(1) / 0.8) : 0;
    hand(p, gx, gy, 1.5, true);
    if (u < 1) { p.g.save(); p.g.setLineDash([16, 14]); p.stroke([[gx + 40, gy + 20], [gx + 330 * (1 - u) + 40, gy + 150 * (1 - u) + 20]], 8, BLUE); p.g.restore(); }
    hand(p, gx + 330 * (1 - u), gy + 150 * (1 - u), 1.5);
    if (t(2) >= 0) check(p, 700, 250, 1.4 * pop(t(2)));
    bigMeter(p, 130, 835, 580, v, glow);
    if (t(5) >= 0) { const k = pop(t(5)); scaled(p, 845, 690, k, () => { p.ell(845, 690, 60, 60, GREEN, 9); p.stroke([[815, 690], [875, 690]], 15, "#ffffff"); }); } // "zero"
  } else if (kind === "contrast") {
    // predicted vs unexpected, both rows from the first frame: your hand (outline waiting, meter low) vs someone
    // else's (no outline, "?", meter high); 1 highlights the surprise row, 2 sparkles it
    touchRow(p, 250, 1.05, "self", 1, true, 0.05);
    check(p, 470, 120, 0.9);
    p.stroke([[80, 500], [920, 500]], 9, "#e2d6c4");
    const hl = t(1) >= 0 ? ease(t(1) / 0.3) : 0;
    if (hl > 0) { p.g.save(); p.g.globalAlpha = 0.25 * hl; p.poly([[70, 515], [930, 515], [930, 935], [70, 935]], "#f4d24a", 0); p.g.restore(); }
    touchRow(p, 670, 1.05, "other", 1, false, 0.95);
    ask(p, 470, 540, 0.9); bang(p, 880, 560, 0.85);
    if (t(2) >= 0) for (const [x, y, ph] of [[150, 560, 0], [860, 880, 1.3], [520, 900, 2.1]]) { const s2 = 0.6 + 0.4 * Math.abs(Math.sin(tt * 8 + ph)); p.poly([[x, y - 40 * s2], [x + 10 * s2, y - 10 * s2], [x + 40 * s2, y], [x + 10 * s2, y + 10 * s2], [x, y + 40 * s2], [x - 10 * s2, y + 10 * s2], [x - 40 * s2, y], [x - 10 * s2, y - 10 * s2]], "#fff6c8", 6); }
  } else if (kind === "shares") {
    // the loot heap between a captain (left) and a sailor (right), from the first frame; 1 coins stream out to both,
    // 2 the captain's two purses, 3 the sailor's one (at most two shares to a sailor's one)
    p.ell(500, 290, 230, 70, "#c9932f", 9);
    for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 40 + (i * 37) % 150; coin(p, 500 + Math.cos(a) * r, 250 + Math.sin(a) * 28 - (i % 3) * 18, 1.05); }
    person(p, 250, 600, 1.0, { coat: RED, hat: "tricorn", face: t(2) >= 0 ? "grin" : "smile" });
    person(p, 750, 600, 1.0, { coat: "#f2e6c8", hat: "bandana", stripes: true, face: t(3) >= 0 ? "grin" : "smile" });
    // coins arc from the heap out to the floor in front of each (outside the figures), where the purses land
    if (t(1) >= 0 && t(1) < 1.4) for (let k = 0; k < 6; k++) { const u = ((t(1) * 1.6 + k / 6) % 1), side = k % 2 ? 1 : -1; coin(p, 500 + side * (120 + 330 * u), 340 + 520 * u * u, 0.8); }
    const bagY = 880;
    if (t(2) >= 0) for (const [i, dx] of [[0, -55], [1, 55]] as const) scaled(p, 250 + dx, bagY, pop(t(2) - 0.15 * i), () => purse(p, 250 + dx, bagY, 1.1));
    if (t(3) >= 0) scaled(p, 750, bagY, pop(t(3)), () => purse(p, 750, bagY, 1.1));
  } else if (kind === "merchant" || kind === "crew") {
    chains(p, tt, t, kind);
  } else if (kind === "timeline") {
    // 1700 -> 1900 from the first frame; 1 the 1720s pirates' injury pay, 2 'long before' sweeps on, 3 1884: a country
    const X = (y: number) => 130 + ((y - 1700) / 200) * 740, Y = 640;
    arrow(p, [100, Y], [915, Y], 12);
    for (const y of [1700, 1800, 1900]) { p.stroke([[X(y), Y - 22], [X(y), Y + 22]], 9); digits(p, String(y), X(y), Y + 44, 40, "#a89a86"); }
    if (t(2) >= 0) { const k = ease(t(2) / 1.0); p.g.save(); p.g.globalAlpha = 0.85; p.poly([[X(1722), Y - 16], [X(1722) + (X(1884) - X(1722)) * k, Y - 16], [X(1722) + (X(1884) - X(1722)) * k, Y + 16], [X(1722), Y + 16]], "#f4b23a", 0); p.g.restore(); }
    if (t(1) >= 0) scaled(p, X(1722), 400, pop(t(1)), () => {
      const x = X(1722);
      p.stroke([[x, 540], [x, Y - 20]], 7);
      person(p, x + 30, 350, 0.95, { coat: "#f2e6c8", hat: "bandana", stripes: true, face: "grin" });
      p.poly([[x - 32, 380], [x + 62, 380], [x + 80, 420], [x - 22, 432]], "#fbf6ea", 7);   // the sling
      purse(p, x + 160, 470, 1.0);
      digits(p, "1720s", x + 40, Y + 110, 64, INK);
    });
    if (t(3) >= 0) scaled(p, X(1884), 400, pop(t(3)), () => {
      const x = X(1884);
      p.stroke([[x, 540], [x, Y - 20]], 7);
      p.poly([[x - 140, 380], [x, 270], [x + 140, 380]], "#e9e2d0", 9);                                  // a state building
      p.poly([[x - 128, 380], [x + 128, 380], [x + 128, 530], [x - 128, 530]], "#f6f1e6", 9);
      for (const dx of [-88, -30, 30, 88]) p.poly([[x + dx - 12, 392], [x + dx + 12, 392], [x + dx + 12, 518], [x + dx - 12, 518]], "#d8ccb4", 4);
      digits(p, "1884", x - 30, Y + 110, 64, INK);
    });
  } else {
    // delay: the control's stroke (blue) and the robot's (orange), in sync from the first frame; 1 a tick (in sync),
    // 2 the robot's stroke slips behind (the delay, stopwatch), 3 a tickle burst
    const x0 = 250, x1 = 900, mid = 400, sh = t(2) >= 0 ? 100 * ease(t(2) / 0.6) : 0;
    const wave = (dx: number, y: number, col: string) => { const pts: P2[] = []; for (let x = x0; x <= x1; x += 10) pts.push([x, y + 80 * Math.sin(((x - x0 - dx) / 190) * Math.PI * 2 - tt * 6)]); p.stroke(pts, 18, col); };
    wave(0, mid - 50, BLUE); wave(sh, mid + 50, ORANGE);
    // what each stroke is: your hand on the control (blue) and the robot's feather (orange)
    p.ell(150, mid - 110, 62, 62, "#dcebfa", 8); hand(p, 150, mid - 92, 0.95);
    p.ell(150, mid + 110, 62, 62, "#ffe6cc", 8);
    p.g.save(); p.g.translate(150, mid + 110); p.g.rotate(rad(-35)); p.ell(0, 0, 18, 46, PINK, 6); p.stroke([[0, 46], [0, -40]], 5); p.g.restore();
    if (t(1) >= 0 && t(2) < 0) check(p, 690, 790, 1.3 * pop(t(1)));
    if (sh > 2) { p.stroke([[x1 - 190, mid + 270], [x1 - 190 + sh, mid + 270]], 12, INK); p.poly([[x1 - 190 + sh, mid + 254], [x1 - 190 + sh + 26, mid + 270], [x1 - 190 + sh, mid + 286]], INK, 0); }
    p.ell(210, 770, 92, 92, "#ffffff", 11); p.poly([[195, 664], [225, 664], [225, 684], [195, 684]], INK, 0);
    const a = rad(-90 + (sh / 100) * 80);
    if (sh > 2) { const pts: P2[] = [[210, 770]]; for (let i = 0; i <= 12; i++) { const b = rad(-90) + (a - rad(-90)) * (i / 12); pts.push([210 + 78 * Math.cos(b), 770 + 78 * Math.sin(b)]); } p.poly(pts, ORANGE, 0); }
    p.stroke([[210, 770], [210 + 70 * Math.cos(a), 770 + 70 * Math.sin(a)]], 11);
    if (t(3) >= 0) { const k = pop(t(3)); scaled(p, 690, 790, k, () => { for (let i = 0; i < 10; i++) { const b = rad(i * 36); p.stroke([[690 + 50 * Math.cos(b), 790 + 50 * Math.sin(b)], [690 + 120 * Math.cos(b), 790 + 120 * Math.sin(b)]], 15, "#f4d24a"); } p.ell(690, 790, 44, 44, "#fff3b0", 9); }); }
  }
};

/** the diagram as a card in the world, centred at (x, y, z), size metres square, at shot time tt */
export const diagramCard = (kind: DiagramKind, x: number, y: number, z: number, size: number, tt: number, steps: number[]): FxPlace => {
  const tq = Math.round(tt * 30) / 30;
  return { key: `dg|${kind}|${cardKey({ tq, steps })}`, cw: 1000, ch: 1000, x, y, z, w: size, h: size, overlay: true, draw: (p) => drawDiagram(p, kind, tq, steps) };
};
