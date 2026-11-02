// 2D effect cards in the creator's style (flat cartoon sprites with plum ink, composited into the 3D scene):
// reaction marks (? ! sweat, anger, idea bulb, hearts, zzz), motion marks (speed lines, puffs, impact stars), and
// celebration (confetti, sparkles, music notes). Every effect is animated by t (seconds since it started): pop-in
// with overshoot over ~6 frames, a little life while it holds, fade at the end. Drawn on a 400 x 400 canvas.
import { Pen, INK, P2, rad, fxBurst, fxSplash, fxPuff, fxStars, fxNote, fxRing } from "../characters/toon";
import { FxPlace, cardKey, CamInfo } from "../cards/cards";

export type FxKind = "question" | "exclaim" | "sweat" | "anger" | "idea" | "hearts" | "zzz" | "speed" | "puff" | "stars" | "burst" | "confetti" | "sparkle" | "notes" | "splash" | "ring";
export const FX_KINDS: FxKind[] = ["question", "exclaim", "sweat", "anger", "idea", "hearts", "zzz", "speed", "puff", "stars", "burst", "confetti", "sparkle", "notes", "splash", "ring"];

const OUT = 10; // ink width on the 400 canvas
/** pop scale: 0 -> 1.18 -> 1 over 0.2 s (reference effects land on the word, overshoot once) */
export const popK = (t: number) => (t <= 0 ? 0 : t < 0.12 ? (t / 0.12) * 1.18 : t < 0.22 ? 1.18 - ((t - 0.12) / 0.1) * 0.18 : 1);

const glyph = (p: Pen, pts: P2[], fill: string) => { p.poly(pts, fill, OUT); };
const q = (n: number) => Math.round(n * 30) / 30; // animation steps quantised to frames (shared canvases)

/** draw one effect at animation time t on a 400 x 400 canvas (centre 200, 200) */
export const drawFx = (p: Pen, kind: FxKind, t: number, seed = 1) => {
  const g = p.g, k = popK(t);
  g.save(); g.translate(200, 200); g.scale(k, k); g.translate(-200, -200);
  const wob = Math.sin(t * 9 + seed) * 4;
  switch (kind) {
    case "question": {
      g.save(); g.translate(200, 200); g.rotate(rad(wob)); g.translate(-200, -200);
      const pts: P2[] = [];
      for (let i = 0; i <= 20; i++) { const a = rad(200 + (240 * i) / 20); pts.push([200 + Math.cos(a) * 70, 150 + Math.sin(a) * 70]); }
      pts.push([215, 250]);
      p.line(pts, "#f4d24a", 34); p.ell(212, 318, 24, 24, "#f4d24a", OUT);
      g.restore(); break;
    }
    case "exclaim": glyph(p, [[178, 70], [222, 70], [212, 250], [188, 250]], "#e2453c"); p.ell(200, 305, 25, 25, "#e2453c", OUT); break;
    case "sweat": for (const [x, y, s] of [[190, 170, 1], [262, 230, 0.7], [140, 245, 0.55]]) {
      const yy = y + (t * 60 * s) % 30, pts: P2[] = [[x, yy - 60 * s]];
      for (let i = 0; i <= 14; i++) { const a = rad(-20 + (220 * i) / 14); pts.push([x + Math.cos(a) * 30 * s, yy + Math.sin(a) * 30 * s]); }
      p.poly(pts, "#9fd4ff", OUT * 0.8); p.ell(x - 9 * s, yy - 4 * s, 7 * s, 10 * s, "#e6f5ff", 0);
    } break;
    case "anger": { // cartoon "cross-popping vein" mark
      g.save(); g.translate(200, 200); g.rotate(rad(wob * 2)); g.scale(1 + 0.08 * Math.sin(t * 14), 1 + 0.08 * Math.sin(t * 14)); g.translate(-200, -200);
      for (const r of [0, 90, 180, 270]) { g.save(); g.translate(200, 200); g.rotate(rad(r)); g.translate(-200, -200); p.line([[215, 140], [240, 175], [270, 160]], "#e2453c", 22); g.restore(); }
      g.restore(); break;
    }
    case "idea": {
      const glowA = 0.25 + 0.15 * Math.sin(t * 10);
      g.fillStyle = `rgba(255,236,140,${glowA})`; g.beginPath(); g.arc(200, 170, 120, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 8; i++) { const a = rad(i * 45 - 90), r0 = 110, r1 = 150 + 8 * Math.sin(t * 12 + i); if (i === 2 || i === 6) continue; p.line([[200 + Math.cos(a) * r0, 170 + Math.sin(a) * r0], [200 + Math.cos(a) * r1, 170 + Math.sin(a) * r1]], "#f4d24a", 12); }
      p.ell(200, 160, 72, 76, "#fff1a8", OUT);
      p.poly([[168, 222], [232, 222], [226, 272], [174, 272]], "#b8bcc2", OUT); p.stroke([[172, 240], [228, 240]], 6); p.stroke([[174, 256], [226, 256]], 6);
      p.stroke([[185, 175], [200, 150], [215, 175]], 7, "#e0a830"); break;
    }
    case "hearts": for (const [x, y, s, ph] of [[200, 230, 1, 0], [120, 150, 0.6, 1.3], [285, 140, 0.7, 2.1]]) {
      const yy = y - ((t * 40 + ph * 20) % 60) * s, sc = s * (1 + 0.1 * Math.sin(t * 12 + ph));
      const pts: P2[] = []; for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; pts.push([x + 16 * sc * Math.sin(a) ** 3 * 3.6, yy - sc * 3.6 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]); }
      p.poly(pts, "#ef5a78", OUT * s);
    } break;
    case "zzz": [0, 1, 2].forEach((i) => {
      const ph = (t * 0.8 + i * 0.33) % 1, s = 0.5 + ph * 0.7, x = 150 + i * 50 + ph * 30, y = 300 - ph * 220;
      g.globalAlpha = Math.min(1, (1 - ph) * 2.5);
      p.line([[x - 30 * s, y - 30 * s], [x + 30 * s, y - 30 * s], [x - 30 * s, y + 30 * s], [x + 30 * s, y + 30 * s]], "#3f6fb5", 16 * s);
      g.globalAlpha = 1;
    }); break;
    case "speed": for (let i = 0; i < 6; i++) { const y = 90 + i * 45, len = 120 + ((i * 53 + q(t) * 300) % 120); p.stroke([[60 + (i % 2) * 40, y], [60 + (i % 2) * 40 + len, y]], 9, INK); } break;
    case "puff": fxPuff(p, Math.min(1, t / 0.6)); break;
    case "stars": fxStars(p, (t * 0.7) % 1); break;
    case "burst": fxBurst(p, Math.min(1, t / 0.5), "#fff3b0", 10, 40, 180); break;
    case "confetti": for (let i = 0; i < 26; i++) {
      const a = (i * 137.5) % 360, sp = 60 + (i * 31) % 90, x = 200 + Math.cos(rad(a)) * sp * Math.min(1.6, t * 3), y = 200 + Math.sin(rad(a)) * sp * Math.min(1.6, t * 3) - 60 * t + 160 * t * t;
      const c = ["#e2453c", "#f4d24a", "#3f8fd8", "#4fd18b", "#b06ad8", "#f08a2c"][i % 6];
      g.save(); g.translate(x, y); g.rotate(rad(a + t * 400)); p.poly([[-9, -5], [9, -5], [9, 5], [-9, 5]], c, 3); g.restore();
    } break;
    case "sparkle": for (const [x, y, s, ph] of [[200, 200, 1, 0], [110, 130, 0.5, 1], [290, 280, 0.6, 2]]) {
      const sc = s * (0.6 + 0.4 * Math.abs(Math.sin(t * 8 + ph)));
      p.poly([[x, y - 70 * sc], [x + 16 * sc, y - 16 * sc], [x + 70 * sc, y], [x + 16 * sc, y + 16 * sc], [x, y + 70 * sc], [x - 16 * sc, y + 16 * sc], [x - 70 * sc, y], [x - 16 * sc, y - 16 * sc]], "#fff6c8", OUT * 0.7);
    } break;
    case "notes": { g.save(); g.translate(200, 200 - (t * 50) % 40); g.rotate(rad(wob * 3)); g.translate(-200, -200); g.scale(1.6, 1.4); fxNote(p, seed % 2); g.restore(); break; }
    case "splash": fxSplash(p, Math.min(1, t / 0.7)); break;
    case "ring": fxRing(p, (t * 0.8) % 1); break;
  }
  g.restore();
};

/** an effect card in the world: kind at (x, y, z), size in metres, started at time t0 (seconds), life in seconds */
export const fxCard = (kind: FxKind, x: number, y: number, z: number, size: number, t: number, t0: number, life = 1.6, seed = 1): FxPlace | null => {
  const age = t - t0;
  if (age < 0 || age > life) return null;
  const tq = q(age), fade = age > life - 0.2 ? Math.max(0.05, (life - age) / 0.2) : 1;
  const s = size * (fade < 1 ? 0.85 + 0.15 * fade : 1);
  return { key: `fx|${kind}|${cardKey({ tq, seed })}|${fade < 1 ? Math.round(fade * 6) : 6}`, cw: 400, ch: 400, x, y, z, w: s, h: s,
    draw: (p) => { if (fade < 1) p.g.globalAlpha = Math.round(fade * 6) / 6; drawFx(p, kind, tq, seed); p.g.globalAlpha = 1; } };
};

/** a reaction mark just above and beside a character's head as seen from the camera (stays in frame from wide shots
 *  to close-ups): mark = the character's floor mark; side +1 = screen right of the head */
export const fxNear = (cam: CamInfo, kind: FxKind, mark: [number, number, number], t: number, t0: number, life = 1.6, side: -1 | 1 = 1, size = 0.42, seed = 1) => {
  // half the frame width at the character (~0.2 x distance for the 34-46 deg lenses on a 9:16 frame): the mark sits
  // inside the frame, beside the head, scaled down in close-ups
  const d = Math.hypot(cam.pos.x - mark[0], cam.pos.z - mark[2]) || 1, halfW = 0.2 * d;
  const lat = Math.min(0.42, 0.62 * halfW), sz = Math.min(size, 0.5 * halfW), y = mark[1] + 1.72 + Math.min(0.22, 0.06 * d);
  return fxCard(kind, mark[0] + cam.right.x * lat * side, y, mark[2] + cam.right.z * lat * side, sz, t, t0, life, seed);
};
