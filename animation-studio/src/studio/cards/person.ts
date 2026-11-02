// Turning a character drawing into a card in the world (the bridge's cast.ts rules, without the bridge cast):
// drawing resolution by distance (tier), the painted light side from the real sun (45-degree steps so canvases are
// shared), blinks on a seeded schedule, and the contact shadow under the feet (+ a sun-direction tail by day).
import * as THREE from "three";
import { bodyFront, bodySide, fxShadow, fxContact, Outfit, FrontOpts, SideOpts } from "../characters/toon";
import { Place, Stage, CamInfo, cardKey, cardOpts } from "./cards";
import type { LightName } from "../scene/environment";

const tmp = new THREE.Vector3();
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** canvas resolution by distance: [w, h, scale from the 600 x 1000 design], sized for sharp 1080x1920 (and 2K) output */
export const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps */
export const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = cam.sun.dot(cam.right) * (mirror ? -1 : 1), sy = -cam.sun.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** deterministic per-character random in [0, 1) */
export const hash = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

/** eyelid 0 open .. 1 shut at time t for character i: blinks every 0.5-2.3 s, 4 frames (half / shut / shut / half);
 *  swaps = times of expression changes, each hidden behind a blink (reference) */
const LID = [0.5, 1, 1, 0.5];
export const lidAt = (t: number, i: number, swaps: number[] = [], fps = 30) => {
  const f = Math.round(t * fps);
  for (const ts of swaps) { const k = f - Math.round((ts - 2 / fps) * fps) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hash(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hash(i * 31 + n, 13));
  }
  return 0;
};

/** a character card. view.side = profile drawing; mirror flips it. Keys and drawings use the same rounded options. */
export const personCard = (cam: CamInfo, id: string, o: Outfit, x: number, y: number, z: number,
  view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts = {}, scale = 1, seed = 1): Place => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2 * scale, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror);
  const fk = cardKey({ ...fo, light, seed }), sk = cardKey({ ...so, light, seed });
  const f2: FrontOpts = cardOpts({ ...fo, light, seed }), s2: SideOpts = cardOpts({ ...so, light, seed });
  const okey = cardKey(o);
  return {
    key: view.side ? `S|${okey}|${sk}` : `F|${okey}|${fk}`, x, y, z, scale, mirror,
    draw: (p) => (view.side ? bodySide(p, o, s2) : bodyFront(p, o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing card (review rounds 2-4): a tight blue-violet contact pool under the feet, plus by
 *  day a lighter soft tail stretched away from the sun (golden light casts real card shadows instead) */
const CONTACT: Record<string, [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
export const contactShadow = (out: Stage, sun: THREE.Vector3, light: LightName, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(sun.x, sun.z) || 1, ox = -sun.x / hl, oz = -sun.z / hl, rot = Math.atan2(-ox, -oz);
  if (light === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, sun.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h;
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[light] ?? CONTACT.day, k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};
