// Explainer diagrams (stage 6 revision): animated panels in the house style (flat colours, plum ink, a rounded white
// card) that a presenter shows beside them, so a scientific idea is visible and not only narrated. A storyboard shot
// gets `diagram: { kind, with: "<presenter>", steps: [{ word }, ...] }`; each step lands on its word (story/timing.ts)
// and the drawing is a pure function of the shot time (deterministic for chunked renders). No text: the narration and
// captions carry the words; the diagram carries the picture. Drawn on a 1000 x 1000 canvas.
import { Pen, INK, P2, rad } from "../characters/toon";
import { FxPlace, cardKey } from "../cards/cards";

export type DiagramKind = "forecast" | "prediction" | "delay";
export const DIAGRAM_KINDS: DiagramKind[] = ["forecast", "prediction", "delay"];
export const DIAGRAM_STEPS: Record<DiagramKind, string> = {
  forecast: "1 brain appears, 2 cerebellum lights up, 3 a signal runs to the forecast card, 4 the predicted hand travels to the armpit, 5 the countdown completes",
  prediction: "1 your own hand lands in its predicted outline, 2 match tick, 3 your tickle meter drops, 4 someone else's unpredicted hand: meter jumps, 5 your meter settles at zero",
  delay: "1 control (blue) and robot (orange) strokes in sync, 2 the robot's stroke slips behind (a delay), 3 a tickle burst",
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
/** a horizontal tickle meter 0..1 (green -> red) */
const meter = (p: Pen, x: number, y: number, w: number, v: number) => {
  p.poly([[x, y - 26], [x + w, y - 26], [x + w, y + 26], [x, y + 26]], "#efe6d8", 9);
  const vv = Math.max(0.02, Math.min(1, v)), col = vv < 0.35 ? GREEN : vv < 0.7 ? "#f4d24a" : RED;
  p.poly([[x + 8, y - 17], [x + 8 + (w - 16) * vv, y - 17], [x + 8 + (w - 16) * vv, y + 17], [x + 8, y + 17]], col, 0);
  // a little laughing face at the right end that grins when the meter is high
  p.ell(x + w + 50, y, 34, 34, "#ffe8a3", 8);
  if (vv > 0.6) p.arc(x + w + 50, y + 2, 18, 14, 10, 170, 7); else p.stroke([[x + w + 36, y + 10], [x + w + 64, y + 10]], 7);
  for (const dx of [-12, 12]) p.dot(x + w + 50 + dx, y - 8, 5);
};

export const drawDiagram = (p: Pen, kind: DiagramKind, tt: number, steps: number[]) => {
  panel(p);
  const t = (k: number) => since(tt, steps, k);
  if (kind === "forecast") {
    // the brain (and its cerebellum) top-left; the forecast card bottom-right; a signal between them
    scaled(p, 380, 330, pop(t(1)), () => brain(p, 380, 330, 1, t(2) >= 0 ? ease(t(2) / 0.4) : 0, tt));
    if (t(3) >= 0) {
      // the signal: dots running along a curve from the cerebellum to the card
      const path = (u: number): P2 => { const a: P2 = [530, 440], c: P2 = [720, 420], b: P2 = [700, 560]; return [(1 - u) ** 2 * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]; };
      const grow = ease(t(3) / 0.5);
      p.g.save(); p.g.setLineDash([18, 16]); const seg: P2[] = []; for (let i = 0; i <= 20; i++) seg.push(path((i / 20) * grow)); p.stroke(seg, 9, ORANGE); p.g.restore();
      for (let k = 0; k < 3; k++) { const u = ((tt * 1.3 + k / 3) % 1) * grow; const [x, y] = path(u); p.dot(x, y, 13, ORANGE); p.dot(x, y, 6, "#ffffff"); }
      // the forecast card: a body icon, the predicted (dotted) hand at the armpit, a dashed arc for the hand's path
      scaled(p, 690, 760, pop(t(3) - 0.35), () => {
        p.poly([[480, 570], [900, 570], [900, 930], [480, 930]], "#fff3d6", 10);
        body(p, 620, 740, 0.9, "#4a2f22");
        const ax = 690, ay = 760; // armpit (the icon's right side)
        hand(p, ax + 22, ay - 6, 0.85, true);
        p.g.save(); p.g.setLineDash([12, 12]); p.arc(ax + 60, ay + 70, 110, 90, -70, 70, 7, BLUE); p.g.restore();
        // the real hand travelling along the predicted path (step 4), arriving at the armpit
        const u = t(4) >= 0 ? ease(t(4) / 1.2) : 0, a = rad(70 - 140 * u);
        hand(p, ax + 60 + 110 * Math.cos(a), ay + 70 + 90 * Math.sin(a), 0.85);
        // countdown ring (step 5): fills, then a tick: "arriving any moment now"
        const cx = 840, cy = 630;
        p.ell(cx, cy, 40, 40, "#ffffff", 7);
        const fill = t(5) >= 0 ? ease(t(5) / 0.9) : t(4) >= 0 ? 0.35 * ease(t(4) / 1.2) : 0;
        if (fill > 0) { const pts: P2[] = [[cx, cy]]; for (let i = 0; i <= 24; i++) pts.push([cx + 34 * Math.cos(rad(-90 + 360 * fill * (i / 24))), cy + 34 * Math.sin(rad(-90 + 360 * fill * (i / 24)))]); p.poly(pts, BLUE, 0); }
        if (t(5) > 0.9) check(p, 840, 630, 0.75 * pop(t(5) - 0.9));
      });
    }
  } else if (kind === "prediction") {
    // row A: your own hand meets its prediction -> meter low. Row B: someone else's hand, no prediction -> meter high
    const rowA = 300, rowB = 690;
    scaled(p, 230, rowA, pop(Math.max(t(1), 0.3)), () => {
      body(p, 200, rowA, 0.8, "#4a2f22");
      hand(p, 290, rowA + 20, 0.8, true);
      const u = t(1) >= 0 ? ease(t(1) / 0.8) : 0;
      hand(p, 290 + 150 * (1 - u), rowA + 20 + 120 * (1 - u), 0.8);
      if (t(2) >= 0) check(p, 400, rowA - 80, 0.8 * pop(t(2)));
    });
    // your meter: starts mid, drops on step 3 ("turns the feeling down"), sits at zero on step 5
    const vA = t(3) >= 0 ? 0.55 - 0.5 * ease(t(3) / 0.8) : 0.55;
    meter(p, 520, rowA, 270, vA);
    if (t(5) >= 0) { p.g.save(); p.g.globalAlpha = 0.5 * (1 + Math.sin(tt * 10)) / 2 + 0.25; p.ell(528, rowA, 30, 30, GREEN, 0); p.g.restore(); }
    p.stroke([[90, 495], [910, 495]], 8, "#e2d6c4");
    if (t(4) >= 0) {
      scaled(p, 230, rowB, pop(t(4)), () => {
        body(p, 200, rowB, 0.8, "#bdb8b1", true);
        // someone else's hand comes in from the side, with no predicted outline waiting for it
        const u = ease(t(4) / 0.5);
        hand(p, 290 + 160 * (1 - u), rowB + 20, 0.8, false, "#ffe2c2");
        ask(p, 400, rowB - 80, 0.8);
      });
      const vB = 0.1 + 0.9 * ease((t(4) - 0.25) / 0.5);
      meter(p, 520, rowB, 270, vB);
      if (t(4) > 0.6) bang(p, 880, rowB - 85, 0.7 * pop(t(4) - 0.6));
    }
  } else {
    // delay: two strokes on a timeline; the robot's (orange) slips behind the control's (blue) on step 2
    const x0 = 120, x1 = 880, mid = 430, sh = t(2) >= 0 ? 90 * ease(t(2) / 0.6) : 0;
    p.stroke([[x0, mid + 170], [x1, mid + 170]], 7, "#cfc3b0");
    const wave = (dx: number, y: number, col: string) => { const pts: P2[] = []; for (let x = x0; x <= x1; x += 10) pts.push([x, y + 70 * Math.sin(((x - x0 - dx) / 170) * Math.PI * 2 - tt * 6)]); p.stroke(pts, 14, col); };
    if (t(1) >= 0 || steps.length === 0) { wave(0, mid - 40, BLUE); wave(sh, mid + 40, ORANGE); }
    if (sh > 2) { p.stroke([[x1 - 160, mid + 250], [x1 - 160 + sh, mid + 250]], 10, INK); p.poly([[x1 - 160 + sh, mid + 236], [x1 - 160 + sh + 22, mid + 250], [x1 - 160 + sh, mid + 264]], INK, 0); }
    // stopwatch
    p.ell(200, 760, 70, 70, "#ffffff", 9); p.poly([[188, 676], [212, 676], [212, 692], [188, 692]], INK, 0);
    const a = rad(-90 + (sh / 90) * 80);
    if (sh > 2) { const pts: P2[] = [[200, 760]]; for (let i = 0; i <= 12; i++) { const b = rad(-90) + (a - rad(-90)) * (i / 12); pts.push([200 + 58 * Math.cos(b), 760 + 58 * Math.sin(b)]); } p.poly(pts, ORANGE, 0); }
    p.stroke([[200, 760], [200 + 52 * Math.cos(a), 760 + 52 * Math.sin(a)]], 9);
    if (t(3) >= 0) { const k = pop(t(3)); scaled(p, 700, 780, k, () => { for (let i = 0; i < 10; i++) { const b = rad(i * 36); p.stroke([[700 + 40 * Math.cos(b), 780 + 40 * Math.sin(b)], [700 + 95 * Math.cos(b), 780 + 95 * Math.sin(b)]], 12, "#f4d24a"); } p.ell(700, 780, 34, 34, "#fff3b0", 8); }); }
  }
};

/** the diagram as a card in the world, centred at (x, y, z), size metres square, at shot time tt */
export const diagramCard = (kind: DiagramKind, x: number, y: number, z: number, size: number, tt: number, steps: number[]): FxPlace => {
  const tq = Math.round(tt * 30) / 30;
  return { key: `dg|${kind}|${cardKey({ tq, steps })}`, cw: 1000, ch: 1000, x, y, z, w: size, h: size, draw: (p) => drawDiagram(p, kind, tq, steps) };
};
