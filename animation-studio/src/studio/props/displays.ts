// In-world text displays (Video 04 camera upgrade): information shown IN the scene instead of on floating panels.
// The text is the prop's parameter (a storyboard writes `{ id: "signBoard", variant: "FINISH" }`), so one prop covers
// every sign, score or time a story needs. Drawn on a canvas with a system font (DejaVu Sans Bold, always present on
// the render machines), not the caption web font, which loads asynchronously and would make the picture depend on
// timing: the same text always draws the same pixels.
import * as THREE from "three";
import type { Batch } from "../materials/geo";
import { At, frame, col, box, rbox } from "./kit";

/** what a display's text may be: 1-18 characters of letters, digits, spaces and . , : ! ? ' - $ % # & + / */
export const displayTextOk = (v: string) => /^[A-Za-z0-9 .,:!?'\-$%#&+/]{1,18}$/.test(v);
const FONT = "bold %px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif";

const textures = new Map<string, THREE.Texture>();
/** the text on a canvas, centred, shrunk to fit; ink / paper colours; deterministic for a given text and style */
const textTexture = (text: string, ink: string, paper: string, chalk: boolean) => {
  const key = `${text}|${ink}|${paper}|${chalk}`;
  let t = textures.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = 1024; c.height = 512;
  // CPU-backed canvas (as documents.ts and stable cards): GPU canvas text can antialias differently in each render
  // tab, which made 1-vs-2-worker renders differ by one grey level on the lettering
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.fillStyle = paper; g.fillRect(0, 0, 1024, 512);
  let px = 260;
  g.font = FONT.replace("%", String(px));
  const w = g.measureText ? g.measureText(text).width : px * text.length * 0.6;
  if (w > 900) px = Math.floor((px * 900) / w);
  g.font = FONT.replace("%", String(px));
  g.textAlign = "center"; g.textBaseline = "middle";
  if (chalk) { g.globalAlpha = 0.35; g.fillStyle = ink; g.fillText(text, 516, 262); g.globalAlpha = 1; }
  g.fillStyle = ink; g.fillText(text, 512, 256);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  textures.set(key, t);
  return t;
};
const faceMat = (text: string, ink: string, paper: string, chalk: boolean) => new THREE.MeshLambertMaterial({ map: textTexture(text, ink, paper, chalk) });
/** a text face: a 2:1 plane, facing +z, centred at (x, y, z) in the prop's frame */
const face = (b: Batch, a: At, mat: THREE.Material, w: number, x: number, y: number, z: number) => {
  b.add(new THREE.PlaneGeometry(w, w / 2), mat, frame(a).multiply(new THREE.Matrix4().makeTranslation(x, y, z)));
};

/** a painted wooden sign on two posts (board 1.2 x 0.6 m, top at 1.9 m): dark lettering on cream */
export const signBoard = (b: Batch, a: At, text = "SIGN") => {
  const m = frame(a), wood = col("#7a5233");
  for (const x of [-0.5, 0.5]) box(b, wood, m, x - 0.04, x + 0.04, 0, 1.62, -0.12, -0.04);   // posts behind the board
  rbox(b, col("#6b4528"), m, 0, 1.28, -0.035, 1.3, 0.68, 0.05, 0.015);          // frame
  face(b, a, faceMat(text, "#2b1d3a", "#f3e6c8", false), 1.2, 0, 1.62, 0.0);
};
/** a dark score / time board on legs (board 1.2 x 0.6 m, top at 2.1 m): chalk-white lettering, like a race board */
export const scoreBoard = (b: Batch, a: At, text = "0:00") => {
  const m = frame(a), wood = col("#4a3424");
  for (const x of [-0.52, 0.52]) box(b, wood, m, x - 0.035, x + 0.035, 0, 1.8, -0.11, -0.04);  // legs behind the board
  rbox(b, col("#3b2a1e"), m, 0, 1.48, -0.035, 1.32, 0.7, 0.05, 0.015);          // frame
  face(b, a, faceMat(text, "#f4f1e8", "#23372e", true), 1.2, 0, 1.83, 0.0);
};
