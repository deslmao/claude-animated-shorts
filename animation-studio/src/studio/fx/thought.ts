// The thought bubble and house keys drawings (Video 03), on the 400 x 400 effect canvas. Standalone (imports only the
// pen), so the effect cards and the everyday theme's floating bubble prop both draw the same picture.
import { Pen, P2, rad, fxBurst } from "../characters/toon";

/** a bunch of house keys on a ring with a red tag, centred at (x, y), k = scale (1 = about 120 px tall) */
export const drawKeys = (p: Pen, x: number, y: number, k = 1) => {
  p.ell(x, y - 30 * k, 24 * k, 24 * k, null, 7 * k);                                              // the ring
  const key = (ang: number, len: number, c: string, bow: number) => {
    p.g.save(); p.g.translate(x, y - 10 * k); p.g.rotate(rad(ang));
    p.ell(0, 14 * k, bow * k, bow * k, c, 5 * k); p.ell(0, 14 * k, 5 * k, 5 * k, "#ffffff", 0);       // the bow with its hole
    p.poly([[-6 * k, 26 * k], [6 * k, 26 * k], [6 * k, (26 + len) * k], [-6 * k, (26 + len) * k]], c, 5 * k); // the blade
    for (const d of [0.35, 0.6, 0.85]) p.poly([[6 * k, (26 + len * d) * k], [15 * k, (26 + len * d) * k], [15 * k, (32 + len * d) * k], [6 * k, (32 + len * d) * k]], c, 4 * k);
    p.g.restore();
  };
  key(-28, 62, "#d9dde2", 17); key(22, 54, "#e8b84a", 15);
  p.g.save(); p.g.translate(x, y - 10 * k); p.g.rotate(rad(-4));
  p.poly([[-14 * k, 20 * k], [14 * k, 20 * k], [12 * k, 64 * k], [-12 * k, 64 * k]], "#e2453c", 5 * k); p.ell(0, 30 * k, 4 * k, 4 * k, "#ffffff", 0);
  p.g.restore();
};
/** a thought bubble holding the keys (Milo's plan); pop = 0..1 bursts it into puffs (the plan slipping away) */
export const drawThought = (p: Pen, t: number, pop = 0) => {
  const g = p.g, bob = Math.sin(t * 3.2) * 5;
  if (pop <= 0) {
    // trailing puffs toward the head (lower left), then the cloud
    for (const [x, y, r] of [[110, 350, 12], [138, 318, 18]] as [number, number, number][]) p.ell(x, y + bob * 0.5, r, r, "#ffffff", 7);
    const cl: P2[] = []; const N = 9;
    for (let i = 0; i <= 64; i++) { const a = (i / 64) * Math.PI * 2, bump = 1 + 0.09 * Math.cos(a * N); cl.push([210 + Math.cos(a) * 128 * bump, 165 + bob + Math.sin(a) * 102 * bump]); }
    p.poly(cl, "#ffffff", 9);
    drawKeys(p, 210, 175 + bob, 1);
    return;
  }
  // the burst: the cloud breaks into puffs flying apart and fading, a little "?" left behind
  g.save(); g.globalAlpha = Math.max(0, 1 - pop * 1.15);
  for (let i = 0; i < 9; i++) { const a = rad(i * 40 + 10), d = 70 + 150 * pop, r = 30 * (1 - 0.6 * pop); p.ell(210 + Math.cos(a) * d, 165 + Math.sin(a) * d * 0.8, r, r, "#ffffff", 7); }
  g.restore();
  if (pop < 0.45) fxBurst(p, pop / 0.45, "#fff3b0", 10, 30, 150);
};

