// Explainer diagrams (stage 6 revision): animated panels in the house style (flat colours, plum ink, a rounded white
// card) that a presenter shows beside them, so a scientific idea is visible and not only narrated. A storyboard shot
// gets `diagram: { kind, with: "<presenter>", steps: [{ word }, ...] }`; each step lands on its word (story/timing.ts)
// and the drawing is a pure function of the shot time (deterministic for chunked renders). No text: the narration and
// captions carry the words; the diagram carries the picture. Drawn on a 1000 x 1000 canvas.
import { Pen, INK, P2, rad } from "../characters/toon";
import { FxPlace, cardKey } from "../cards/cards";

export type DiagramKind = "forecast" | "prediction" | "contrast" | "delay";
export const DIAGRAM_KINDS: DiagramKind[] = ["forecast", "prediction", "contrast", "delay"];
export const DIAGRAM_STEPS: Record<DiagramKind, string> = {
  forecast: "the brain from the first frame; 1 the cerebellum lights up, 2 a signal runs to the forecast card, 3 the predicted hand travels to the armpit, 4 the countdown completes",
  prediction: "your own touch, from the first frame (the predicted outline waiting); 1 your hand lands in it, 2 tick, 3 the tickle meter turns down, 4 + 5 it sits at zero (no surprise, no tickle)",
  contrast: "both touches from the first frame: yours (predicted, meter low) vs someone else's (unpredicted, meter high); 1 highlights the surprise, 2 sparkles it",
  delay: "control (blue) and robot (orange) strokes in sync from the first frame; 1 tick, 2 the robot's stroke slips behind (a delay), 3 a tickle burst",
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
        const fill = t(4) >= 0 ? ease(t(4) / 0.9) : t(3) >= 0 ? 0.35 * ease(t(3) / 1.2) : 0;
        if (fill > 0) { const pts: P2[] = [[cx, cy]]; for (let i = 0; i <= 24; i++) pts.push([cx + 44 * Math.cos(rad(-90 + 360 * fill * (i / 24))), cy + 44 * Math.sin(rad(-90 + 360 * fill * (i / 24)))]); p.poly(pts, BLUE, 0); }
        if (t(4) > 0.9) check(p, cx, cy, 1.0 * pop(t(4) - 0.9));
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
