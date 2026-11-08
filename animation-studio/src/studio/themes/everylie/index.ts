// Every Lie theme ("In This World, Every Lie Appears Above Your Head"): production props only, for the library's
// existing sets (apartment, classroom, city) and cast. The LIE sign is the film's rule made visible: whenever someone
// lies, the lie itself slams into the air above their head as a red neon sign with a LIE stamp. Footnote signs
// "(...)" roast the liar; an arrow sign ("v ...") points down at a hiding liar. Plus a burnt pancake, a bucket, a
// stack of textbooks and sunglasses for the gags.
import * as THREE from "three";
import type { Theme } from "..";
import { Batch } from "../../materials/geo";
import { At, frame, col, box, cyl, sph } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const FONT = (px: number) => `bold ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const rrect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};

// ---------------- the LIE sign ----------------
// A camera-facing card (always readable), unlit and bright like neon, in the scene's depth (scenery can hide it: the
// ceiling it punches through). Styles by text: "(...)" a footnote (smaller, yellow on dark, no stamp); "v ..." an
// arrow sign pointing down (yellow); anything else the main sign: the lie in white on deep red inside a glowing red
// neon border, with a big tilted LIE stamp over the top-right corner. Step 1 slams it in (a fast overshoot and a
// wobble in about a quarter of a second); hidden before.
type Style = "lie" | "foot" | "arrow";
const styleOf = (t: string): Style => (/^\(.*\)$/.test(t.trim()) ? "foot" : /^v /.test(t) ? "arrow" : "lie");
const CW = 1024, CH = 560;
const signTex = (text: string) => stex(`lieSign${text}`, CW, CH, (g) => {
  const st = styleOf(text), words = (st === "arrow" ? text.slice(2) : text).toUpperCase();
  const fit = (px: number, maxW: number) => { let p = px; g.font = FONT(p); while (g.measureText(words).width > maxW && p > 40) { p -= 4; g.font = FONT(p); } return p; };
  if (st === "lie") {
    g.shadowColor = "#ff1d3a"; g.shadowBlur = 44; g.fillStyle = "#3d0410"; rrect(g, 60, 110, CW - 120, CH - 170, 60); g.fill();
    g.shadowBlur = 30; g.strokeStyle = "#ff2b45"; g.lineWidth = 22; rrect(g, 60, 110, CW - 120, CH - 170, 60); g.stroke();
    g.shadowBlur = 0; g.strokeStyle = "#ffb3bd"; g.lineWidth = 7; rrect(g, 60, 110, CW - 120, CH - 170, 60); g.stroke();
    const p = fit(150, CW - 240); g.fillStyle = "#ffffff"; g.textAlign = "center"; g.textBaseline = "middle";
    g.shadowColor = "#ff4060"; g.shadowBlur = 18; g.fillText(words, CW / 2, 110 + (CH - 170) / 2 + p * 0.04); g.shadowBlur = 0;
    // the stamp
    g.save(); g.translate(CW - 190, 118); g.rotate(-0.22);
    g.fillStyle = "#ff1f3d"; rrect(g, -160, -78, 320, 156, 26); g.fill();
    g.strokeStyle = "#ffffff"; g.lineWidth = 12; rrect(g, -146, -64, 292, 128, 18); g.stroke();
    g.fillStyle = "#ffffff"; g.font = FONT(118); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("LIE", 0, 8);
    g.restore();
  } else if (st === "foot") {
    g.fillStyle = "rgba(20,16,24,0.92)"; rrect(g, 70, 160, CW - 140, CH - 260, 50); g.fill();
    g.strokeStyle = "#ffd23f"; g.lineWidth = 10; rrect(g, 70, 160, CW - 140, CH - 260, 50); g.stroke();
    fit(110, CW - 220); g.fillStyle = "#ffd23f"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(words, CW / 2, CH / 2 + 10);
  } else {
    g.fillStyle = "#ffd23f"; rrect(g, 70, 40, CW - 140, 300, 50); g.fill();
    g.strokeStyle = "#1a1220"; g.lineWidth = 12; rrect(g, 70, 40, CW - 140, 300, 50); g.stroke();
    fit(120, CW - 220); g.fillStyle = "#1a1220"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(words, CW / 2, 190);
    g.fillStyle = "#ffd23f"; g.strokeStyle = "#1a1220"; g.lineWidth = 12;
    g.beginPath(); g.moveTo(CW / 2 - 110, 350); g.lineTo(CW / 2 + 110, 350); g.lineTo(CW / 2, 540); g.closePath(); g.fill(); g.stroke();
  }
});
const SW = 0.9, SH = (SW * CH) / CW;
const signMat = (text: string) => new THREE.MeshBasicMaterial({ map: signTex(text), transparent: true, alphaTest: 0.04, toneMapped: false, depthWrite: true });
/** the card's centre sits this far above `at` (its base): a sign hangs over the head it belongs to */
const LIFT = SH * 0.55;
const lieSignRig = (a: At, v = "LIE"): PropRig => {
  const root = new THREE.Group(), s = a.s ?? 1; root.position.set(a.x, a.y ?? 0, a.z);
  const card = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), signMat(v));
  card.position.y = LIFT * s; card.layers.set(NOINK); card.frustumCulled = false; root.add(card);
  return { root, update: ({ step = 0, camPos }) => {
    root.lookAt(camPos.x, root.position.y + LIFT * s, camPos.z); // upright, turned to the lens
    const f = clamp01(step * 3.2); // the slam: about 0.22 s of the step
    card.visible = f > 0;
    const k = f < 1 ? 1 + 0.45 * (1 - f) * Math.cos(f * Math.PI * 1.5) : 1;
    card.scale.setScalar(s * k);
    card.rotation.z = f < 1 ? 0.12 * (1 - f) * Math.sin(f * Math.PI * 4) : 0;
  } };
};
const lieSignStatic = (b: Batch, a: At, v = "LIE") => {
  const s = a.s ?? 1;
  b.add(new THREE.PlaneGeometry(SW * s, SH * s), signMat(v), frame(a).multiply(new THREE.Matrix4().makeTranslation(0, LIFT * s, 0)));
};

// ---------------- gag props ----------------
const burntPancake = (b: Batch, a: At) => {
  const m = frame(a);
  cyl(b, col("#f2f0ea"), m, 0, 0, 0, 0.14, 0.12, 0.018, 28);              // plate
  cyl(b, col("#1c1512"), m, 0, 0.018, 0, 0.1, 0.1, 0.022, 20);              // the charcoal pancake
  for (const [x, z, r] of [[0.03, 0.01, 0.012], [-0.04, -0.02, 0.01], [0.0, -0.05, 0.009]]) sph(b, col("#3a2a20"), m, x, 0.042, z, r, r * 0.6, r); // lumps
  for (const [x, y, r] of [[0.0, 0.11, 0.045], [0.035, 0.18, 0.055], [-0.02, 0.26, 0.06]]) sph(b, col("#6d6a6f"), m, x, y, 0, r, r, r); // smoke
};
const bucket = (b: Batch, a: At) => {
  const m = frame(a), steel = col("#9aa3ad");
  cyl(b, steel, m, 0, 0, 0, 0.17, 0.13, 0.26, 24);   // upside down: wide rim at the bottom, on the head
  cyl(b, col("#7c858f"), m, 0, -0.005, 0, 0.175, 0.175, 0.02, 24);
  box(b, col("#5c636b"), m, -0.18, -0.165, 0.04, 0.12, -0.01, 0.01); box(b, col("#5c636b"), m, 0.165, 0.18, 0.04, 0.12, -0.01, 0.01);
};
const bookStack = (b: Batch, a: At) => {
  const m = frame(a), cols = ["#c8643f", "#3f6fb5", "#e9c46a", "#5d8a3a", "#8a4fb5", "#d94b6a"];
  let y = 0;
  cols.forEach((c, k) => { const h = 0.05 + (k % 2) * 0.01, dx = (k % 3 - 1) * 0.02; box(b, col(c), m, -0.13 + dx, 0.13 + dx, y, y + h, -0.09, 0.09); box(b, col("#f4efe2"), m, -0.125 + dx, 0.125 + dx, y + 0.008, y + h - 0.008, 0.088, 0.092); y += h; });
};
const shades = (b: Batch, a: At) => {
  const m = frame(a), black = col("#121016"), shine = col("#4a5060");
  for (const s of [-1, 1]) { box(b, black, m, s * 0.02, s * 0.17, -0.055, 0.055, 0, 0.02); box(b, shine, m, s * 0.04, s * 0.09, 0.015, 0.035, 0.021, 0.024); }
  box(b, black, m, -0.025, 0.025, 0.01, 0.03, 0, 0.02);
};

const signTextOk = (t: string) => /^(v )?[A-Za-z0-9 .,!?'()-]{1,22}$/.test(t);
export const EVERYLIE_THEME: Theme = {
  id: "everylie", name: "Every lie appears above your head (comedy)", desc: "the LIE sign (a red neon sign with the lie and a LIE stamp that slams in above a liar's head; footnote and arrow styles) and gag props: a burnt pancake, an upside-down bucket, a stack of textbooks, sunglasses",
  tags: ["comedy", "lie", "sign", "meme", "school", "home"],
  mood: "phonk",
  props: {
    lieSign: { name: "LIE sign", desc: "a red neon sign showing a lie in white, with a big tilted LIE stamp; it always faces the lens, upright, its base at `at` (put it just over the liar's head). The variant is the text (up to 22 characters): \"(...)\" makes a smaller yellow footnote sign, \"v ...\" a yellow sign with an arrow pointing down. Step 1 slams it in (hidden before)", category: "theme", themes: ["comedy", "any"], tags: ["sign", "lie", "label", "text", "meme"], radius: 0.05, height: 0.12, box: [0.45, 0.02],
      build: (b, a, v) => lieSignStatic(b, a, v), rig: lieSignRig, steps: ["it slams in"], param: { desc: "the lie, up to 22 characters; (...) footnote; v ... arrow down", ok: signTextOk } },
    burntPancake: { name: "Burnt pancake", desc: "a charcoal-black pancake on a white plate, smoking (28 cm plate)", category: "theme", themes: ["comedy", "home", "food"], tags: ["food", "pancake", "burnt", "breakfast", "plate"], radius: 0.15, height: 0.3, build: burntPancake },
    bucket: { name: "Bucket (on a head)", desc: "a steel bucket upside down, rim at the bottom (34 cm wide, 26 cm tall): put it on a character's head", category: "theme", themes: ["comedy", "home"], tags: ["bucket", "hat", "hide", "gag"], radius: 0.18, height: 0.27, build: bucket },
    bookStack: { name: "Stack of textbooks", desc: "six colourful textbooks stacked (about 33 cm tall, 26 x 18 cm), wobbly", category: "theme", themes: ["comedy", "school"], tags: ["books", "stack", "school", "gag"], radius: 0.15, height: 0.34, build: bookStack },
    shades: { name: "Sunglasses", desc: "black sunglasses facing +z (34 cm wide, sized for the cartoon heads), with a glint; place them in front of a face", category: "theme", themes: ["comedy", "cool"], tags: ["sunglasses", "cool", "glasses", "meme"], radius: 0.17, height: 0.12, build: shades },
  },
};
