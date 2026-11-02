// Reusable characters in the creator's style (characters.md): a data recipe (Look) + per-frame options (Pose) ->
// a drawing on the 600 x 1000 design canvas (soles at y = 975). Built on toon.ts primitives so every measured rule
// carries over: superellipse bean heads (H/W .94), 3.5 head-heights for adults, plum thick-thin outline weighted away
// from the light (w0 = 5u), painted crescent shading, lidded deadpan eyes, no blush, no catchlights, stick limbs with
// ink-dot hands, face layout eyes +-13u / brows -20u / mouth +20u.
// What is new here: hair / glasses / facial hair / clothing layers as data, per-side brows and more eye + mouth
// shapes (24 expressions), arm gestures (point, shrug, facepalm, ...), run / jump, and "acting" presets that pair a
// face with body language so reactions read at phone size.
import {
  Pen, INK, WHITE, MOUTH, TONGUE, SH_SKIN, SH_CLOTH, SH_FELT, DEF_LIGHT, P2, EyeK, MouthK, Blob,
  rad, clamp, rnd, rotPts, rotAbout, curve, ellPts, taper, eye, mouth, dmouth, lidOf, eyeKind, footStroke,
  blobPts, headBlob, thickAngle, mul, mix, shade,
} from "./toon";

// ---------------- recipe ----------------
export type Build = "adult" | "tall" | "stout" | "kid" | "lanky" | "petite" | "big";
/** head half-width a, torso and legs in head-heights (HH), torso width in head widths (W) */
export const BUILDS: Record<Build, { a: number; torso: number; legs: number; tw: number; egg: number }> = {
  adult: { a: 118, torso: 1.1, legs: 1.4, tw: 0.8, egg: 0.12 },   // 3.5 HH (measured)
  tall: { a: 116, torso: 1.12, legs: 1.55, tw: 0.7, egg: 0.08 },  // 3.67 HH, slimmer
  stout: { a: 120, torso: 1.15, legs: 1.3, tw: 0.98, egg: 0.2 },  // 3.45 HH, round belly
  kid: { a: 112, torso: 0.85, legs: 1.0, tw: 0.72, egg: 0.12 },   // 2.85 HH
  lanky: { a: 110, torso: 1.18, legs: 1.66, tw: 0.6, egg: 0.06 },  // 3.84 HH, thin and tall (extras)
  petite: { a: 112, torso: 0.98, legs: 1.22, tw: 0.7, egg: 0.12 }, // 3.2 HH, short adult (extras)
  big: { a: 124, torso: 1.2, legs: 1.26, tw: 1.1, egg: 0.24 },     // 3.46 HH, broad (extras)
};
export type HairStyle = "tuft" | "bob" | "horseshoe" | "short" | "side" | "long" | "bun" | "ponytail" | "curly" | "spiky" | "buzz" | "bald" | "afro" | "topknot" | "receding";
export type TopStyle = "hoodie" | "turtleneck" | "shirt" | "tee" | "sweater" | "dress";
export type LayerStyle = "labcoat" | "waistcoat" | "blazer" | "cardigan" | "apron";
export type HatStyle = "cap" | "beanie" | "tophat" | "bowler" | "hardhat";
export type Look = {
  name: string; build: Build; skin: string; seed: number;
  hair: { style: HairStyle; color: string };
  brow?: { color?: string; k?: number; quirk?: number };          // k = thickness x; quirk = facing-side brow raise (u)
  glasses?: { style: "round" | "square"; color: string };
  moustache?: { style: "walrus" | "thin"; color: string };
  beard?: { style: "full" | "goatee"; color: string };
  top: { style: TopStyle; color: string; accent?: string };
  layer?: { style: LayerStyle; color: string; accent?: string };
  neck?: { style: "bowtie" | "tie"; color: string };
  legs: string; shoes: string;
  hat?: { style: HatStyle; color: string };
  /** expression quirks: wider shock eyes, resting lid */
  eyes?: { shock?: number };
};

// ---------------- faces ----------------
export type Expr =
  | "neutral" | "stern" | "grin" | "laugh" | "whistle" | "nervous" | "shock" | "relief" | "relief_open" | "dazed" | "pained"
  | "smile" | "smile_closed" | "lick"
  | "thinking" | "confused" | "angry" | "sad" | "suspicious" | "excited" | "scared" | "sleepy" | "proud" | "disgusted"
  | "determined" | "wink" | "talk" | "talk_wide" | "embarrassed";
type Eye3 = EyeK | "wide" | "pin" | "angry" | "sad" | "up" | "closed";
type Mouth3 = MouthK | "frownDeep" | "grit" | "side" | "yawn" | "zig" | "talkA" | "talkB" | "smug" | "openSmile" | "tongue" | "flat";
/** eyes [back, front]; brows per eye [inner, outer] offsets in u (+ = down); look = gaze [x, y]; sweat drop */
type FaceDef = { eye: [Eye3, Eye3]; brow: [[number, number], [number, number]]; mouth: Mouth3; look?: [number, number]; sweat?: boolean };
const B = (i: number, o: number): [[number, number], [number, number]] => [[i, o], [i, o]];
export const FACES: Record<Expr, FaceDef> = {
  neutral: { eye: ["lid", "lid"], brow: B(0, -1), mouth: "dash" },
  stern: { eye: ["lid", "lid"], brow: B(3, -2), mouth: "frown" },
  grin: { eye: ["happy", "happy"], brow: B(-3, -3), mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: B(-4, -4), mouth: "laugh" },
  whistle: { eye: ["dash", "dash"], brow: B(-2, -4), mouth: "o" },
  nervous: { eye: ["small", "small"], brow: B(-3, 2), mouth: "wave", sweat: true },
  shock: { eye: ["shock", "shock"], brow: B(-7, -6), mouth: "O" },
  relief: { eye: ["happy", "happy"], brow: B(-2, 1), mouth: "smileWide" },
  relief_open: { eye: ["happy", "happy"], brow: B(-2, 1), mouth: "grin" },
  dazed: { eye: ["spiral", "spiral"], brow: B(-3, 2), mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: B(-3, 2), mouth: "teeth" },
  smile: { eye: ["dot", "dot"], brow: B(0, -1), mouth: "smirk" },
  smile_closed: { eye: ["happy", "happy"], brow: B(0, -1), mouth: "smile" },
  lick: { eye: ["dot", "dot"], brow: B(0, -1), mouth: "lick" },
  // new (stage 1B): bigger shape changes so they read at phone size
  thinking: { eye: ["up", "up"], brow: [[1, -1], [-5, -3]], mouth: "side", look: [0.6, -1] },
  confused: { eye: ["dot", "small"], brow: [[3, 0], [-7, -4]], mouth: "zig" },
  angry: { eye: ["angry", "angry"], brow: B(7, -4), mouth: "grit" },
  sad: { eye: ["sad", "sad"], brow: B(-6, 4), mouth: "frownDeep" },
  suspicious: { eye: ["slit", "slit"], brow: [[4, 1], [-2, -3]], mouth: "flat", look: [1, 0] },
  excited: { eye: ["wide", "wide"], brow: B(-8, -7), mouth: "openSmile" },
  scared: { eye: ["pin", "pin"], brow: B(-7, 3), mouth: "grit", sweat: true },
  sleepy: { eye: ["closed", "closed"], brow: B(1, 2), mouth: "yawn" },
  proud: { eye: ["closed", "closed"], brow: B(-3, -4), mouth: "smug" },
  disgusted: { eye: ["squeeze", "slit"], brow: [[5, 0], [3, -1]], mouth: "tongue" },
  determined: { eye: ["angry", "angry"], brow: B(4, -3), mouth: "flat" },
  wink: { eye: ["happy", "dot"], brow: [[1, 0], [-4, -4]], mouth: "smirk" },
  talk: { eye: ["dot", "dot"], brow: B(-2, -2), mouth: "talkA" },
  talk_wide: { eye: ["dot", "dot"], brow: B(-4, -3), mouth: "talkB" },
  embarrassed: { eye: ["happy", "happy"], brow: B(-3, 3), mouth: "wave", sweat: true },
};
export const EXPRESSIONS = Object.keys(FACES) as Expr[];

const eye3 = (p: Pen, kind: Eye3, x: number, ey: number, u: number, side: number, look: [number, number], skin: string, shockK = 1) => {
  const lx = x + look[0] * 3 * u, ly = ey + look[1] * 3 * u, lw = 3.8 * u;
  switch (kind) {
    case "wide": p.ell(x, ey, 10 * u, 11.5 * u, WHITE, 2.6 * u); p.dot(lx, ly + u, 3.6 * u); break;
    case "pin": p.ell(x, ey, 10.5 * u * shockK, 11 * u * shockK, WHITE, 2.6 * u); p.dot(lx, ly, 1.8 * u); break;
    case "up": p.ell(lx, ly - u, 3.8 * u, 5.5 * u, INK, 0); break;
    case "closed": p.arc(x, ey - 2 * u, 8 * u, 4.5 * u, 20, 160, lw); break;
    case "angry": case "sad": {
      // half-disc pupil under a slanted lid; skin covers what is above the lid line
      const inner = -side, ang = kind === "angry" ? 1 : -1;
      const a: P2 = [x - inner * 10 * u, ey - 2 * u - ang * 2.5 * u], b: P2 = [x + inner * 10 * u, ey - 2 * u + ang * 2.5 * u];
      p.ell(lx, ey + 0.5 * u, 6.5 * u, 6 * u, INK, 0, 0, 180);
      p.poly([a, b, [b[0], ey - 14 * u], [a[0], ey - 14 * u]], skin, 0);
      p.stroke([a, b], lw);
      break;
    }
    default: eye(p, kind as EyeK, x, ey, u, side, look[0], skin);
  }
};
const mouth3 = (p: Pen, kind: Mouth3, mx: number, my: number, u: number, k = 1) => {
  const mw = 4 * u;
  switch (kind) {
    case "frownDeep": p.arc(mx, my + 6 * u, 9 * u * k, 5.5 * u, 200, 340, mw); break;
    case "grit":
      p.poly([[mx - 14 * u * k, my - 4.5 * u], [mx + 14 * u * k, my - 4.5 * u], [mx + 13 * u * k, my + 4.5 * u], [mx - 13 * u * k, my + 4.5 * u]], WHITE, 3 * u);
      p.stroke([[mx - 13 * u * k, my], [mx + 13 * u * k, my]], 1.5 * u);
      for (const j of [-2, -1, 0, 1, 2]) p.stroke([[mx + j * 5 * u * k, my - 4.5 * u], [mx + j * 5 * u * k, my + 4.5 * u]], 1.3 * u);
      break;
    case "side": p.stroke(curve([mx - 6 * u * k, my + 0.5 * u], [mx + 2 * u * k, my + 0.5 * u], [mx + 8 * u * k, my - 3.5 * u]), mw); break;
    case "yawn": p.ell(mx, my + 3 * u, 6 * u * k, 9.5 * u, MOUTH, 3 * u); break;
    case "zig": { const s: P2[] = []; for (let i = 0; i <= 6; i++) s.push([mx - 9 * u * k + i * 3 * u * k, my + (i % 2 ? -2.2 : 2.2) * u]); p.stroke(s, 3.2 * u); break; }
    case "talkA": p.ell(mx, my - u, 7 * u * k, 6 * u, MOUTH, 0, 0, 180); p.ell(mx + u, my + 2.6 * u, 3 * u * k, 1.8 * u, TONGUE, 0); p.ell(mx, my - u, 7 * u * k, 6 * u, null, 3 * u, 0, 180); break;
    case "talkB": dmouth(p, mx, my - 2 * u, 10 * u * k, 10 * u, u, true); break;
    case "smug": p.arc(mx + 2 * u, my - 4 * u, 8 * u * k, 4.5 * u, 15, 130, mw); p.stroke([[mx - 5.5 * u * k, my - 1.5 * u], [mx - 7.5 * u * k, my - 3 * u]], 3 * u); break;
    case "openSmile": dmouth(p, mx, my - 2 * u, 15 * u * k, 13 * u, u, true); break;
    case "tongue": {
      const s: P2[] = []; for (let i = 0; i <= 10; i++) s.push([mx - 9 * u * k + i * 1.8 * u * k, my + 1.6 * u * Math.sin(i * 1.4)]);
      p.ell(mx + 3 * u * k, my + 4.5 * u, 4 * u, 5 * u, TONGUE, 2.4 * u); p.stroke(s, 3.4 * u); break;
    }
    case "flat": p.stroke([[mx - 8 * u * k, my], [mx + 8 * u * k, my]], mw); break;
    default: mouth(p, kind as MouthK, mx, my, u, k);
  }
};

type FaceOpts = { browCol: string; browK: number; quirk: number; shockK: number; glasses?: Look["glasses"]; moustache?: Look["moustache"]; beard?: Look["beard"] };
const isRound = (k: Eye3) => k === "shock" || k === "shockHalf" || k === "wide" || k === "pin";
/** front / 3-4 face; facing -1 | 0 | 1 slides the features toward the facing side */
const faceFront3 = (p: Pen, cx: number, cy: number, W: number, expr: Expr, facing: number, look: [number, number], lid: number,
  skin: string, fo: FaceOpts) => {
  const u = W / 100, F = FACES[expr], fx = cx + 7 * u * facing, gaze: [number, number] = F.look ? [F.look[0] * (facing || 1) + look[0], F.look[1] + look[1]] : look;
  const round = isRound(F.eye[0] as Eye3);
  const ex = (round ? 12.5 : 13) * u, ey = cy;
  const eyes: number[] = [];
  for (const side of [-1, 1]) {
    const x = fx + side * ex;
    const front = facing ? side === facing : side > 0, base = F.eye[front ? 1 : 0];
    const kind: Eye3 = base === "wide" || base === "pin" || base === "angry" || base === "sad" || base === "up" || base === "closed"
      ? (lid >= 1 && base !== "closed" ? "dash" : base) : eyeKind(base as EyeK, lid);
    eye3(p, kind, x, ey, u, side, gaze, skin, fo.shockK);
    eyes.push(x);
    const [dI, dO] = F.brow[front ? 1 : 0], by = ey - 20 * u - (front ? fo.quirk : 0) * u - (isRound(kind) ? 3 * u : 0);
    const bw = 5 * u * fo.browK;
    if (kind === "shock" || kind === "shockHalf") p.arc(x, by - 4 * u, 9 * u, 3 * u, 200, 340, 4 * u * fo.browK, fo.browCol);
    else taper(p, [x - side * 8.5 * u, by + dI * u], [x + side * 8.5 * u, by + dO * u], bw, bw / 2, fo.browCol);
  }
  if (fo.glasses) {
    const r = round ? 14 * u : 12.5 * u, col = fo.glasses.color, gw = 2.8 * u;
    for (const x of eyes) {
      if (fo.glasses.style === "round") p.ell(x, ey, r, r * 0.95, null, gw);
      else p.poly([[x - r, ey - r * 0.8], [x + r, ey - r * 0.8], [x + r * 0.92, ey + r * 0.75], [x - r * 0.92, ey + r * 0.75]], null, gw);
    }
    p.stroke([[eyes[0] + r, ey - 2 * u], [eyes[1] - r, ey - 2 * u]], gw, col === INK ? INK : col);
    for (const s of [-1, 1]) p.stroke([[eyes[s < 0 ? 0 : 1] + s * r, ey - 2 * u], [cx + s * 46 * u, ey - 4 * u]], gw * 0.9);
  }
  const mx = cx + 8 * u * facing, my = cy + 20 * u;
  if (fo.beard) {
    // beard: jaw-hugging shape under the mouth line, the mouth sits on top of it
    const bp: P2[] = []; for (let i = 0; i <= 16; i++) { const t = rad(10 + (160 * i) / 16); bp.push([cx + 7 * u * facing + Math.cos(t) * (fo.beard.style === "goatee" ? 14 : 44) * u, cy + 14 * u + Math.sin(t) * (fo.beard.style === "goatee" ? 20 : 36) * u]); }
    p.poly(bp, fo.beard.color, 3.5 * u);
  }
  mouth3(p, F.mouth, mx, my + (fo.moustache?.style === "walrus" ? 3 * u : 0), u);
  if (fo.moustache) {
    const c = fo.moustache.color;
    if (fo.moustache.style === "walrus") {
      for (const s of [-1, 1]) {
        const pts: P2[] = [[mx, cy + 9 * u], [mx + s * 10 * u, cy + 6.5 * u], [mx + s * 21 * u, cy + 11 * u], [mx + s * 24 * u, cy + 20 * u],
          [mx + s * 17 * u, cy + 18 * u], [mx + s * 14 * u, cy + 22 * u], [mx + s * 7 * u, cy + 17 * u], [mx, cy + 18.5 * u]];
        p.poly(s < 0 ? pts.slice().reverse() : pts, c, 3 * u);
      }
    } else for (const s of [-1, 1]) taper(p, [mx + s * 1.5 * u, cy + 12.5 * u], [mx + s * 15 * u, cy + 15 * u], 4.5 * u, 1.6 * u, c);
  }
  if (F.sweat) p.poly(dropPts(cx + 42 * u * (facing || 1), cy - 20 * u, 4 * u), "#9fd4ff", 2 * u);
};
const dropPts = (x: number, y: number, r: number): P2[] => {
  const pts: P2[] = [[x, y - 2.2 * r]];
  for (let i = 0; i <= 12; i++) { const a = rad(-30 + (240 * i) / 12); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  return pts;
};

// ---------------- hair + hats ----------------
const cutCap = (hp: P2[], keep: (x: number, y: number) => boolean, cx: number, hc: number, k = 1.03): P2[] => {
  const n = hp.length, startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(hp[(i + n - 1) % n][0], hp[(i + n - 1) % n][1])));
  return [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * k, hc + (y - hc) * k] as P2);
};
/** hair parts that sit BEHIND the head (bob back, long hair, bun, ponytail) */
const hairBack = (p: Pen, L: Look, H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, side: boolean, chin: number) => {
  const s = L.hair.style, col = L.hair.color, sh = mul(col, SH_FELT), u = H.a / 50;
  if (s === "afro") {
    // big rounded cloud of curls behind the head
    const pts: P2[] = [];
    for (let i = 0; i <= 60; i++) { const t = (i / 60) * Math.PI * 2, r = H.a * 1.32 * (1 + 0.05 * Math.abs(Math.sin(5 * t))); pts.push([cx - (side ? 14 * u : 0) + Math.cos(t) * r, hc - 0.18 * H.b + Math.sin(t) * r * 0.92]); }
    p.shadedFill(pts, col, sh, light, H.a * 1.3); p.inkRing(pts, ow * 0.85, thick);
  } else if (s === "topknot") {
    p.ell(cx - (side ? 18 * u : 0), hc - H.b * 1.08, 15 * u, 13 * u, col, ow * 0.85);
  } else if (s === "bob") {
    const bb = blobPts(cx - (side ? 10 * u : 0), hc + 0.12 * H.b, { ...H, a: H.a * 1.15, b: H.b * 1.06, egg: 0.02, asym: 0, nBot: 4, seed: H.seed + 3 });
    p.shadedFill(bb, col, sh, light, H.a * 1.15); p.inkRing(bb, ow * 0.85, thick);
  } else if (s === "long") {
    const pts: P2[] = [...ellPts(cx, hc - 0.1 * H.b, H.a * 1.12, H.b * 1.05, 180, 360, 0, 24),
      [cx + H.a * 1.18, chin + 0.55 * H.b], [cx + H.a * 0.9, chin + 0.7 * H.b], [cx - H.a * 0.9, chin + 0.7 * H.b], [cx - H.a * 1.18, chin + 0.55 * H.b]];
    p.shadedFill(pts, col, sh, light, H.a * 1.2); p.inkRing(pts, ow * 0.85, thick);
  } else if (s === "bun") {
    const bx = cx - (side ? 30 * u : 0), by = hc - H.b * 1.05;
    p.ell(bx, by, 22 * u, 20 * u, col, ow * 0.85);
  } else if (s === "ponytail") {
    const bx = side ? cx - H.a * 1.0 : cx + H.a * 0.82;
    const pts: P2[] = [[bx, hc - 0.5 * H.b], [bx + (side ? -26 : 24) * u, hc + 0.2 * H.b], [bx + (side ? -14 : 30) * u, hc + 1.0 * H.b], [bx + (side ? 4 : 8) * u, hc + 0.35 * H.b]];
    p.poly(curve(pts[0], pts[1], pts[2], 8).concat(curve(pts[2], pts[3], pts[0], 8)), col, ow * 0.85);
  }
};
/** hair on top of the head (and side tufts) */
const hairFront = (p: Pen, L: Look, hp: P2[], H: Blob, cx: number, hc: number, light: number, thick: number, ow: number, facing: number, side: boolean) => {
  const s = L.hair.style, col = L.hair.color, sh = mul(col, SH_FELT), W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b;
  const fill = (pts: P2[]) => { p.shadedFill(pts, col, sh, light, H.a, 0.35); p.poly(pts, null, ow * 0.85); };
  const fs = side ? 1 : facing || 1;
  if (s === "bald") return;
  if (s === "horseshoe" || s === "receding") {
    // hair that hugs the skull: a band following the head contour from the temple down past the ear, with a soft
    // fluffy outer edge (Gus). Front view: both sides; side view: around the back of the head to the nape.
    const n = hp.length, bands: P2[][] = [];
    const inBand = (x: number, y: number, sd: number) => side ? x < cx - 0.15 * H.a && y > hc - 0.42 * H.b && y < hc + 0.5 * H.b
      : sd * (x - cx) > (s === "receding" ? 0.35 : 0.5) * H.a && y > hc - (s === "receding" ? 0.75 : 0.5) * H.b && y < hc + 0.5 * H.b;
    for (const sd of side ? [-1] : [-1, 1]) {
      const idx: number[] = [];
      for (let i = 0; i < n; i++) if (inBand(hp[i][0], hp[i][1], sd)) idx.push(i);
      if (idx.length < 3) continue;
      // keep a contiguous run (the contour wraps around index 0)
      const start = idx.find((i) => !idx.includes((i + n - 1) % n)) ?? idx[0];
      const run: number[] = []; for (let k = 0, i = start; k < n && inBand(hp[i][0], hp[i][1], sd); k++, i = (i + 1) % n) run.push(i);
      const outer: P2[] = [], inner: P2[] = [];
      run.forEach((i, k) => {
        const [x, y] = hp[i], dx = x - cx, dy = y - hc, l = Math.hypot(dx, dy) || 1, t = k / Math.max(1, run.length - 1);
        // slim band (thickest at the ear), outer edge broken into small curls, tucked inside the head outline
        const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** 0.8, curl = Math.max(0, Math.sin(k * 1.9)) * 4.5 * u;
        const out = (3 * u + curl) * taper + 0.5 * u, inn = 9 * u * taper;
        outer.push([x + (dx / l) * out, y + (dy / l) * out]);
        inner.push([x - (dx / l) * inn, y - (dy / l) * inn]);
      });
      bands.push([...outer, ...inner.reverse()]);
    }
    for (const bp of bands) {
      p.shadedFill(bp, col, sh, light, H.a * 0.4, 0.3); p.poly(bp, null, ow * 0.65);
      // a few strand lines along the band so it reads as hair, not a pad
      const m2 = Math.floor(bp.length / 2);
      for (const f of [0.3, 0.5, 0.7]) { const i = Math.floor(m2 * f), o = bp[i], q = bp[bp.length - 1 - i]; p.stroke([[o[0] * 0.6 + q[0] * 0.4, o[1] * 0.6 + q[1] * 0.4], [o[0] * 0.25 + q[0] * 0.75, o[1] * 0.25 + q[1] * 0.75 + 4 * u]], 1.3 * u, mul(col, [0.75, 0.75, 0.8])); }
    }
    if (s === "receding" && !side) { const cap = cutCap(hp, (x, y) => y < hc - 0.8 * H.b && Math.abs(x - cx) > 0.25 * H.a, cx, hc, 1.03); if (cap.length > 2) fill(cap); }
    return;
  }
  if (s === "bob") {
    // straight fringe over the brow line
    const cut = hc - 0.66 * H.b;
    const cap = cutCap(hp, (x, y) => y < cut, cx, hc, 1.05);
    if (cap.length > 2) {
      const [x0] = cap[cap.length - 1], [x1] = cap[0];
      cap.push([x0 + (x1 - x0) * 0.25, cut + 2 * u], [x0 + (x1 - x0) * 0.5, cut + 3 * u], [x0 + (x1 - x0) * 0.75, cut + 2 * u]);
      fill(cap);
      p.stroke([[cx + fs * 18 * u, crown + 8 * u], [cx + fs * 8 * u, cut - 2 * u]], 1.3 * u);
    }
    return;
  }
  // hairline stays ABOVE the brows (brows reach hc - 0.62 b when raised): forehead always free for acting
  const cutY = crown + ({ tuft: 0.19, short: 0.2, side: 0.21, long: 0.2, bun: 0.19, ponytail: 0.19, curly: 0.2, spiky: 0.18, buzz: 0.16, afro: 0.2, topknot: 0.17 } as Record<string, number>)[s] * HH;
  const keep = (x: number, y: number) => y < cutY || (side && (s === "long" || s === "side" || s === "short") && x < cx - 6 * u && y < hc + 0.42 * H.b);
  let cap = cutCap(hp, keep, cx, hc, s === "curly" ? 1.08 : s === "buzz" ? 1.01 : 1.03);
  if (cap.length < 3) return;
  if (s === "curly") {
    // scalloped curls around the whole cap
    const out: P2[] = [];
    for (let i = 0; i < cap.length; i++) { const q = cap[i], k = 1 + (i % 3 === 1 ? 0.05 : 0); out.push([cx + (q[0] - cx) * k, hc + (q[1] - hc) * k]); }
    cap = out;
  }
  if (s === "tuft" || s === "spiky") {
    // messy crown: three spikes leaning to one side + a cowlick (Milo)
    const n = s === "spiky" ? 5 : 3;
    const tip: P2[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = cx + (t - 0.5) * (s === "spiky" ? 1.4 : 1.0) * H.a + fs * 6 * u;
      tip.push([x - 8 * u, crown + 8 * u], [x + fs * (s === "spiky" ? 4 : 13) * u, crown - (s === "spiky" ? 20 : 24 + 7 * Math.sin(i * 2.3)) * u], [x + 8 * u, crown + 8 * u]);
    }
    fill(tip); // spikes first; the cap covers their bases
  }
  if (s === "side" || s === "short" || s === "tuft" || s === "long") {
    const [x0, y0] = cap[cap.length - 1], [x1, y1] = cap[0];
    for (let i = 1; i < 6; i++) cap.push([x0 + ((x1 - x0) * i) / 6, y0 + ((y1 - y0) * i) / 6 + (i % 2 ? 4 * u : 0)]);
  }
  fill(cap);
  if (s === "side") p.stroke([[cx - fs * 14 * u, crown + 6 * u], [cx - fs * 10 * u, cutY - 6 * u]], 1.4 * u);
  };
const hat3 = (p: Pen, L: Look, H: Blob, cx: number, hc: number, light: number, facing: number, side: boolean) => {
  if (!L.hat) return;
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, crown = hc - H.b, ow = 0.85 * 5 * u, col = L.hat.color, R = (pts: P2[]) => rotPts(pts, H.rot, cx, hc);
  const deg = (H.rot * 180) / Math.PI, fs = side ? 1 : facing || 1;
  switch (L.hat.style) {
    case "cap": {
      const cut = crown + 0.3 * HH;
      const dome = R(ellPts(cx, cut, H.a * 1.04, 0.32 * HH, 180, 360, 0, 24));
      p.shadedFill(dome, col, mul(col, SH_FELT), light, H.a, 0.35); p.poly(dome, null, ow);
      if (side) p.poly(R([[cx + 40 * u, cut - 2 * u], [cx + 74 * u, cut + 4 * u], [cx + 40 * u, cut + 6 * u]]), shade(col, 0.8), ow);
      else { const [px, py] = R([[cx + fs * 4 * u, cut + 1.5 * u]])[0]; p.ell(px, py, 32 * u, 0.06 * HH, shade(col, 0.8), ow, 0, 180, deg); }
      break;
    }
    case "beanie": {
      const cut = crown + 0.36 * HH;
      const dome = R(ellPts(cx, cut, H.a * 1.06, 0.4 * HH, 180, 360, 0, 24));
      p.shadedFill(dome, col, mul(col, SH_FELT), light, H.a, 0.35); p.poly(dome, null, ow);
      p.poly(R([[cx - H.a * 1.08, cut - 8 * u], [cx + H.a * 1.08, cut - 8 * u], [cx + H.a * 1.08, cut + 6 * u], [cx - H.a * 1.08, cut + 6 * u]]), shade(col, 0.85), ow);
      const [tx, ty] = R([[cx, crown - 0.12 * HH]])[0]; p.ell(tx, ty, 9 * u, 8 * u, shade(col, 1.1), ow);
      break;
    }
    case "tophat": case "bowler": {
      const top = L.hat.style === "tophat", yb = crown + 0.22 * HH, ht = (top ? 0.8 : 0.32) * HH, wb = 0.31 * W, wt = (top ? 0.33 : 0.28) * W;
      const body = top ? R([[cx - wb, yb], [cx + wb, yb], [cx + wt, yb - ht], [cx - wt, yb - ht]]) : R(ellPts(cx, yb, wb * 1.1, ht, 180, 360, 0, 24));
      p.shadedFill(body, col, mul(col, SH_FELT), light, wt, 0.4); p.poly(body, null, ow);
      const [bx, by] = R([[cx, yb + u]])[0]; p.ell(bx, by, (top ? 0.45 : 0.42) * W, 0.05 * HH, shade(col, 0.8), ow, 0, 360, deg);
      break;
    }
    case "hardhat": {
      const cut = crown + 0.3 * HH;
      const dome = R(ellPts(cx, cut, H.a * 1.08, 0.38 * HH, 180, 360, 0, 24));
      p.shadedFill(dome, col, mul(col, SH_FELT), light, H.a, 0.35); p.poly(dome, null, ow);
      const [bx, by] = R([[cx, cut]])[0]; p.ell(bx, by, H.a * 1.3, 0.05 * HH, shade(col, 0.85), ow, 0, 360, deg);
      p.stroke(R([[cx, cut - 0.36 * HH], [cx, cut - 2 * u]]), 4 * u, shade(col, 0.8));
      break;
    }
  }
};

// ---------------- gestures ----------------
export type Gesture = "hang" | "wave" | "point" | "pointUp" | "shrug" | "facepalm" | "chin" | "thumbsUp" | "crossArms" | "hips" | "raiseHand"
  | "cheer" | "talk" | "scratchHead" | "coverMouth" | "present" | "fists" | "clap" | "belly" | "stop" | "pump" | "spread";
export const GESTURES: Gesture[] = ["hang", "wave", "point", "pointUp", "shrug", "facepalm", "chin", "thumbsUp", "crossArms", "hips", "raiseHand",
  "cheer", "talk", "scratchHead", "coverMouth", "present", "fists", "clap", "belly", "stop", "spread"];
type Hand = "dot" | "point" | "thumb" | "open" | "fist";
/** layer: 0 behind the torso, 1 in front of the torso, 2 over the face */
type ArmDef = { pts: [P2, P2, P2]; layer: 0 | 1 | 2; hand: Hand; dir?: number };

export type Mode = "stand" | "walk" | "march" | "run" | "jump" | "sit" | "fall";
export type Pose = {
  expr?: Expr; gesture?: Gesture; mode?: Mode; phase?: number;
  /** which arm gestures for one-armed gestures (+1 = screen-right arm) */
  hand?: -1 | 1;
  facing?: -1 | 0 | 1; look?: [number, number]; blink?: boolean | number;
  tilt?: number; headTilt?: number; shrug?: number; jump?: number; t?: number;
  light?: number;
};

const armColOf = (c: string) => {
  const n = parseInt(c.slice(1), 16), l = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return mix(c, INK, l > 0.75 ? 0.32 : 0.5);
};

// ---------------- front view ----------------
export const figureFront = (p: Pen, L: Look, pose: Pose) => {
  const { expr = "neutral", gesture = "hang", mode = "stand", phase = 0, facing = 0, look = [0, 0], blink = false, tilt = 0, headTilt = 0,
    shrug = 0, jump = 0, t = 0, light = DEF_LIGHT } = pose;
  const hs = pose.hand ?? 1;
  const Bd = BUILDS[L.build], skin = L.skin, two = Math.PI * 2, lid = lidOf(blink), seed = L.seed;
  const H = headBlob(seed, Bd.a, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const tallH = (1 + Bd.torso + Bd.legs) * HH, sole = 975;
  const bob = mode === "march" ? 0.025 * tallH * Math.cos(2 * two * phase) : mode === "walk" ? 0.015 * tallH * Math.cos(2 * two * phase)
    : mode === "run" ? 0.035 * tallH * Math.cos(2 * two * phase) : 0;
  const lift = mode === "jump" ? jump * 0.55 * HH : 0;
  const torsoBot = (mode === "sit" ? sole - 0.2 * HH : sole - Bd.legs * HH + bob) - lift + (mode === "jump" ? 0.12 * HH : 0);
  const chin = torsoBot - Bd.torso * HH, hc = chin - H.b, hipY = torsoBot - 0.12 * HH;
  const thick = thickAngle(light), ow = 5 * u;
  const top = L.top.color, outer = L.layer && L.layer.style !== "waistcoat" && L.layer.style !== "apron" ? L.layer.color : top;
  const legCol = mix(L.legs, INK, 0.55), armCol = armColOf(outer), footCol = L.shoes;
  const legW = 5.8 * u, footW = 7.5 * u;
  const dress = L.top.style === "dress" && mode !== "sit" && mode !== "fall";
  const coat = L.layer?.style === "labcoat";
  // ---- long hair behind everything ----
  p.rot = null;
  // ---- legs + feet ----
  if (mode === "sit") {
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], k: P2 = [300 + side * 36 * u, hipY + 0.2 * HH], f: P2 = [300 + side * 44 * u, sole - 8 * u];
      p.stroke(curve(h, k, f), legW, legCol); footStroke(p, [f[0] - side * 2 * u, f[1]], [f[0] + side * 12 * u, f[1] - 5 * u], footW, footCol);
    }
  } else if (mode === "fall") {
    const legs: [P2, P2, P2][] = [[[300 - 15 * u, hipY], [300 - 46 * u, hipY + 0.5 * HH], [300 - 70 * u, hipY + 0.72 * HH]], [[300 + 15 * u, hipY], [300 + 50 * u, hipY + 0.45 * HH], [300 + 76 * u, hipY + 0.22 * HH]]];
    legs.forEach(([h, k, f], i) => { p.stroke(curve(h, k, f), legW, legCol); footStroke(p, f, [f[0] + (i ? 14 : -14) * u, f[1] + (i ? -6 : 4) * u], footW, footCol); });
  } else if (mode === "jump") {
    // knees out, feet tucked under (a frog jump reads at any size)
    for (const side of [-1, 1]) {
      const h: P2 = [300 + side * 15 * u, hipY], fy = hipY + (Bd.legs * 0.62) * HH, f: P2 = [300 + side * 20 * u, fy], k: P2 = [300 + side * 46 * u, (hipY + fy) / 2 + 0.05 * HH];
      p.stroke([h, k, f], legW, legCol); footStroke(p, [f[0] - side * 3 * u, f[1]], [f[0] + side * 13 * u, f[1] + 2 * u], footW, footCol);
    }
  } else if (dress) {
    for (const side of [-1, 1]) {
      const fx = 300 + side * 12 * u, fy = sole - 4 * u;
      p.stroke([[fx, sole - 0.4 * HH], [fx + side * u, fy]], legW, legCol); footStroke(p, [fx - side * 3 * u, fy], [fx + side * 12 * u, fy + u], footW, footCol);
    }
  } else {
    const Lf = mode === "march" ? 75 : mode === "walk" ? 33 : mode === "run" ? 110 : 0;
    for (const [side, ph] of [[-1, 0], [1, 0.5]] as const) {
      const up = Math.max(0, Math.sin(two * (phase + ph))) * Lf;
      const hx = 300 + side * 15 * u, fx = 300 + side * (mode === "run" ? 26 : 22) * u, fy = sole - 4 * u - up;
      const k: P2 = [(hx + fx) / 2 + side * (1.5 * u + up * 0.16), (hipY + fy) / 2 - up * 0.08];
      p.stroke(curve([hx, hipY], k, [fx, fy]), legW, legCol); footStroke(p, [fx - side * 3 * u, fy], [fx + side * 13 * u, fy + 0.5 * u], footW, footCol);
    }
  }
  // ---- upper body rotates about the hips ----
  const sway = mode === "march" ? 1.6 * Math.sin(two * phase) : mode === "walk" ? 1.0 * Math.sin(two * phase) : mode === "run" ? 2.2 * Math.sin(two * phase) : 0;
  const A = tilt + sway;
  p.rot = A ? [rad(A), 300, hipY] : null;
  const T: Blob = { a: ((Bd.tw / 2) * W) / 1.06, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: Bd.egg, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 3 * u * facing, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const shY = chin + 0.12 * HH - shrug * 0.07 * HH;
  const sh = (side: number): P2 => [tcx + side * 0.85 * T.a, shY];
  const hang = (side: number, fwd: number): [P2, P2, P2] => {
    const S = sh(side), ex = tcx + side * (1.12 * T.a + 4 * u);
    const hx = ex + side * 3 * u - side * 6 * u * Math.max(0, fwd) + side * 4 * u * Math.max(0, -fwd);
    return [S, [ex, S[1] + 0.48 * HH], [hx, chin + 1.04 * HH - Math.abs(fwd) * 9 * u]];
  };
  const sw = mode === "march" || mode === "walk" ? Math.sin(two * phase) : 0;
  const arms: ArmDef[] = [];
  const add = (side: number, E: P2, Hd: P2, layer: 0 | 1 | 2 = 0, hand: Hand = "dot", dir?: number) => arms.push({ pts: [sh(side), E, Hd], layer, hand, dir });
  const g: Gesture = mode === "run" ? "pump" : mode === "jump" ? (gesture === "hang" ? "cheer" : gesture) : mode === "sit" || mode === "fall" ? "hang" : gesture;
  const one = (fn: (s: number) => void) => { fn(hs); const o = -hs; arms.push({ pts: hang(o, -sw * o), layer: 0, hand: "dot" }); };
  const S1 = (s: number) => sh(s);
  if (mode === "sit") for (const s of [-1, 1]) add(s, [tcx + s * (1.1 * T.a + 6 * u), shY + 0.4 * HH], [tcx + s * (1.2 * T.a + 10 * u), torsoBot + 0.04 * HH]);
  else if (mode === "fall") for (const s of [-1, 1]) add(s, [tcx + s * (1.15 * T.a + 12 * u), shY - 0.25 * HH], [tcx + s * (1.3 * T.a + 24 * u), shY - 0.68 * HH], 0, "open");
  else switch (g) {
    case "hang": for (const s of [-1, 1]) arms.push({ pts: hang(s, sw * s), layer: 0, hand: "dot" }); break;
    case "wave": one((s) => { const S = S1(s), w = Math.sin(t * 9); add(s, [S[0] + s * (0.3 * HH + 3 * u * w), S[1] - 0.2 * HH], [S[0] + s * (0.38 * HH + 12 * u * w), S[1] - 0.62 * HH], 0, "open"); }); break;
    case "point": one((s) => { const S = S1(s); add(s, [S[0] + s * 0.42 * HH, S[1] + 0.03 * HH], [S[0] + s * 0.86 * HH, S[1] - 0.04 * HH], 0, "point", s > 0 ? 0 : Math.PI); }); break;
    case "pointUp": one((s) => { const S = S1(s); add(s, [S[0] + s * 0.22 * HH, S[1] - 0.36 * HH], [S[0] + s * 0.3 * HH, S[1] - 0.8 * HH], 0, "point", -Math.PI / 2); }); break;
    case "raiseHand": one((s) => { const S = S1(s); add(s, [S[0] + s * 0.14 * HH, S[1] - 0.42 * HH], [S[0] + s * 0.16 * HH, S[1] - 0.88 * HH], 0, "open"); }); break;
    case "thumbsUp": one((s) => { const S = S1(s); add(s, [S[0] + s * 0.26 * HH, S[1] + 0.4 * HH], [S[0] + s * 0.4 * HH, S[1] + 0.04 * HH], 1, "thumb"); }); break;
    case "present": one((s) => { const S = S1(s); add(s, [S[0] + s * 0.32 * HH, S[1] + 0.38 * HH], [S[0] + s * 0.66 * HH, S[1] + 0.24 * HH], 0, "open"); }); break;
    case "chin": {
      const s = hs, S = S1(s), o = -s;
      add(o, [tcx + o * 1.05 * T.a, chin + 0.42 * HH], [tcx + s * 0.5 * T.a, chin + 0.4 * HH], 1, "dot");
      add(s, [tcx + s * 0.85 * T.a, chin + 0.42 * HH], [300 + s * 0.12 * W + 7 * u * facing, chin - 0.02 * HH], 2, "fist");
      void S; break;
    }
    case "facepalm": one((s) => add(s, [tcx + s * 1.0 * T.a, chin + 0.36 * HH], [300 + 6 * u * facing + s * 4 * u, hc + 0.02 * HH], 2, "open")); break;
    case "scratchHead": one((s) => { const S = S1(s); add(s, [S[0] + s * 0.46 * HH, S[1] - 0.2 * HH], [300 + s * 0.42 * W, hc - 0.55 * H.b], 2, "dot"); }); break;
    case "coverMouth": for (const s of [-1, 1]) add(s, [tcx + s * 1.05 * T.a, chin + 0.4 * HH], [300 + 8 * u * facing + s * 9 * u, hc + 0.5 * H.b], 2, "open"); break;
    case "shrug": for (const s of [-1, 1]) { const S = S1(s); add(s, [S[0] + s * 0.36 * HH, S[1] + 0.34 * HH], [S[0] + s * 0.64 * HH, S[1] + 0.02 * HH], 0, "open"); } break;
    case "spread": for (const s of [-1, 1]) { const S = S1(s); add(s, [S[0] + s * 0.36 * HH, S[1] - 0.12 * HH], [S[0] + s * 0.7 * HH, S[1] - 0.42 * HH], 0, "open"); } break;
    case "cheer": for (const s of [-1, 1]) { const S = S1(s); add(s, [S[0] + s * 0.3 * HH, S[1] - 0.34 * HH], [S[0] + s * 0.48 * HH, S[1] - 0.76 * HH], 0, "fist"); } break;
    case "crossArms":
      add(-1, [tcx - 1.08 * T.a, chin + 0.44 * HH], [tcx + 0.5 * T.a, chin + 0.34 * HH], 1, "dot");
      add(1, [tcx + 1.08 * T.a, chin + 0.47 * HH], [tcx - 0.5 * T.a, chin + 0.42 * HH], 1, "dot");
      break;
    case "hips": for (const s of [-1, 1]) add(s, [tcx + s * (1.28 * T.a + 14 * u), chin + 0.34 * HH], [tcx + s * 0.96 * T.a, torsoBot - 0.2 * HH], 1, "fist"); break;
    case "fists": for (const s of [-1, 1]) { const S = S1(s); add(s, [S[0] + s * 0.3 * HH, S[1] + 0.36 * HH], [tcx + s * 0.95 * T.a, chin + 0.6 * HH], 1, "fist"); } break;
    case "clap": { const c = 1 - Math.abs(Math.sin(t * 7)); for (const s of [-1, 1]) add(s, [tcx + s * 1.08 * T.a, chin + 0.48 * HH], [tcx + s * (3 + 14 * (1 - c)) * u, chin + 0.36 * HH], 1, "open"); break; }
    case "belly": for (const s of [-1, 1]) add(s, [tcx + s * 1.1 * T.a, chin + 0.5 * HH], [tcx + s * 0.35 * T.a, torsoBot - 0.3 * HH], 1, "open"); break;
    case "stop": one((s) => { const S = S1(s); add(s, [S[0] + s * 0.22 * HH, S[1] + 0.32 * HH], [S[0] + s * 0.18 * HH, S[1] - 0.12 * HH], 1, "open"); }); break;
    case "talk": for (const s of [-1, 1]) { const w = Math.sin(t * 6 + (s > 0 ? 0 : 1.7)); add(s, [tcx + s * 1.12 * T.a, chin + 0.46 * HH], [tcx + s * (0.95 * T.a + 6 * u * w), chin + 0.56 * HH - 8 * u * w], 1, "open"); } break;
    case "pump": for (const s of [-1, 1]) { const w = Math.sin(two * phase) * s; add(s, [tcx + s * 1.15 * T.a, chin + 0.42 * HH - 10 * u * w], [tcx + s * 0.9 * T.a, chin + 0.22 * HH - 22 * u * w], 0, "fist"); } break;
  }
  const drawHand = (a: ArmDef) => {
    const [hx, hy] = a.pts[2];
    if (a.hand === "point") { const d = a.dir ?? 0; taper(p, [hx, hy], [hx + Math.cos(d) * 13 * u, hy + Math.sin(d) * 13 * u], 4.2 * u, 3.4 * u); p.dot(hx, hy, 5.5 * u); }
    else if (a.hand === "thumb") { taper(p, [hx, hy], [hx - 1 * u, hy - 13 * u], 4.4 * u, 3.6 * u); p.dot(hx, hy, 6 * u); }
    else if (a.hand === "open") { p.dot(hx, hy, 6.3 * u); }
    else if (a.hand === "fist") { p.dot(hx, hy, 6.8 * u); }
    else p.dot(hx, hy, 5.5 * u);
  };
  const drawArm = (a: ArmDef) => {
    const c = curve(a.pts[0], a.pts[1], a.pts[2]);
    // arms crossing in front of the body get a thin ink rim so they separate from the clothes (like held props)
    if (a.layer > 0) p.stroke(c, 5.2 * u + 3.2 * u, INK);
    p.stroke(c, 5.2 * u, armCol); drawHand(a);
  };
  for (const a of arms) if (a.layer === 0) drawArm(a);
  // hood: sits BEHIND the neck; the torso covers its lower half and the head its top, so only the sides show
  if (L.top.style === "hoodie" && !coat) {
    const hb = ellPts(tcx, chin - 0.02 * HH, 0.44 * W, 0.2 * HH, 0, 360, 0, 36);
    p.shadedFill(hb, mix(top, INK, 0.1), mul(top, SH_CLOTH), light, 0.4 * W); p.inkRing(hb, ow * 0.85, thick);
  }
  // ---- torso and clothing ----
  if (dress) {
    const D: Blob = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.35 * HH) - (chin - 0.2 * HH)), nTop: 2.0, nBot: 3.0, egg: 0.35, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(300, sole - 0.35 * HH - D.b, D);
    p.gradFill(dp, top, mul(top, SH_CLOTH), light); p.inkRing(dp, ow, thick);
  } else {
    p.gradFill(tp, top, mul(top, SH_CLOTH), light);
    p.clip(tp, () => topDetail(p, L, tcx, chin, torsoBot, T, HH, u, facing));
    if (L.layer && !coat) p.clip(tp, () => layerDetail(p, L, tcx, chin, torsoBot, T, HH, u, facing, light));
    p.inkRing(tp, ow, thick);
  }
  if (coat) {
    // lab coat: longer than the torso, open down the front over the top, lapels, a pocket with a pen
    const cTop = chin - 0.22 * HH, cBot = torsoBot + 0.42 * HH;
    const C: Blob = { a: T.a * 1.1, b: (cBot - cTop) / 2, nTop: 2.2, nBot: 3.4, egg: 0.1 + Bd.egg * 0.5, asym: 0.03 * facing, rot: 0, noise: 0.006, seed: seed + 11 };
    const cp = blobPts(tcx, (cTop + cBot) / 2, C), lc = L.layer!.color;
    p.gradFill(cp, lc, mul(lc, [0.86, 0.88, 0.95]), light, 0.3);
    p.clip(cp, () => {
      const ox = tcx + 2 * u * facing;
      const gap: P2[] = [[ox - 0.3 * T.a, chin - 0.1 * HH], [ox + 0.3 * T.a, chin - 0.1 * HH], [ox + 0.1 * T.a, torsoBot - 0.2 * HH], [ox + 0.16 * T.a, cBot + 10 * u], [ox - 0.16 * T.a, cBot + 10 * u], [ox - 0.1 * T.a, torsoBot - 0.2 * HH]];
      p.gradFill(gap, top, mul(top, SH_CLOTH), light);
      p.clip(gap, () => topDetail(p, L, tcx, chin, torsoBot, T, HH, u, facing));
      p.poly(gap, null, 1.8 * u);
      for (const s of [-1, 1]) p.stroke([[ox + s * 0.3 * T.a, chin - 0.1 * HH], [ox + s * 0.52 * T.a, chin + 0.32 * HH], [ox + s * 0.12 * T.a, torsoBot - 0.2 * HH]], 1.8 * u);
      const px = tcx - (facing || 1) * 0.62 * T.a, py = chin + 0.42 * HH;
      p.poly([[px - 12 * u, py], [px + 12 * u, py], [px + 11 * u, py + 18 * u], [px - 11 * u, py + 18 * u]], null, 1.6 * u);
      p.band([[px + 4 * u, py - 9 * u], [px + 4 * u, py + 6 * u]], L.layer!.accent ?? "#2a6fdb", 2.6 * u, 1.2 * u, "round");
      const hy = torsoBot + 0.18 * HH;
      for (const s of [-1, 1]) p.poly([[tcx + s * 0.95 * T.a, hy], [tcx + s * 0.55 * T.a, hy], [tcx + s * 0.55 * T.a, hy + 16 * u], [tcx + s * 0.95 * T.a, hy + 16 * u]], null, 1.6 * u);
    });
    p.inkRing(cp, ow, thick);
  }
  // hood / collars / neckwear at the chin (the head covers the middle)
  if (L.top.style === "turtleneck") {
    const nb: P2[] = [[tcx - 0.2 * W, chin - 0.07 * HH], [tcx + 0.2 * W, chin - 0.07 * HH], [tcx + 0.22 * W, chin + 0.07 * HH], [tcx - 0.22 * W, chin + 0.07 * HH]];
    p.gradFill(nb, top, mul(top, SH_CLOTH), light); p.poly(nb, null, ow * 0.7);
    for (const j of [-1, 0, 1]) p.stroke([[tcx + j * 0.1 * W, chin], [tcx + j * 0.1 * W, chin + 0.06 * HH]], 1.4 * u);
  }
  if (L.top.style === "shirt" && (!L.layer || L.layer.style !== "labcoat")) {
    for (const s of [-1, 1]) p.poly([[tcx + s * 2 * u, chin + 0.02 * HH], [tcx + s * 0.32 * W * 0.6, chin - 0.02 * HH], [tcx + s * 0.26 * W * 0.6, chin + 0.12 * HH]], L.top.accent ?? top, 2.2 * u);
  }
  if (L.neck?.style === "bowtie") {
    const y = chin + 0.05 * HH, c = L.neck.color;
    for (const s of [-1, 1]) p.poly([[tcx, y], [tcx + s * 15 * u, y - 7 * u], [tcx + s * 15 * u, y + 7 * u]], c, 2.2 * u);
    p.ell(tcx, y, 4 * u, 4.5 * u, shade(c, 0.85), 2 * u);
  } else if (L.neck?.style === "tie") {
    const y = chin + 0.04 * HH, c = L.neck.color;
    p.poly([[tcx - 4 * u, y], [tcx + 4 * u, y], [tcx + 6 * u, y + 0.5 * HH], [tcx, y + 0.58 * HH], [tcx - 6 * u, y + 0.5 * HH]], c, 2 * u);
  }
  for (const a of arms) if (a.layer === 1) drawArm(a);
  // ---- head ----
  const Ah = A + headTilt, [cpx, cpy] = rotAbout([300, chin], rad(A), [300, hipY]);
  p.rot = Ah ? [rad(Ah), 300, chin, cpx - 300, cpy - chin] : null;
  hairBack(p, L, H, 300, hc, light, thick, ow, false, chin);
  const hp = blobPts(300, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hairFront(p, L, hp, H, 300, hc, light, thick, ow, facing, false);
  faceFront3(p, 300, hc, W, expr, facing, look, lid, skin, {
    browCol: L.brow?.color ?? INK, browK: L.brow?.k ?? 1, quirk: L.brow?.quirk ?? 0, shockK: L.eyes?.shock ?? 1,
    glasses: L.glasses, moustache: L.moustache, beard: L.beard,
  });
  hat3(p, L, H, 300, hc, light, facing, false);
  // arms over the face are drawn in the body's frame
  p.rot = A ? [rad(A), 300, hipY] : null;
  for (const a of arms) if (a.layer === 2) drawArm(a);
  p.rot = null;
};

/** details printed on the top garment, clipped to it */
const topDetail = (p: Pen, L: Look, tcx: number, chin: number, torsoBot: number, T: Blob, HH: number, u: number, facing: number) => {
  const c = L.top.color, acc = L.top.accent ?? shade(c, 0.78);
  switch (L.top.style) {
    case "hoodie": {
      const y0 = torsoBot - 0.42 * HH, y1 = torsoBot - 0.08 * HH;
      p.poly([[tcx - 0.5 * T.a, y0], [tcx + 0.5 * T.a, y0], [tcx + 0.68 * T.a, y1], [tcx - 0.68 * T.a, y1]], shade(c, 0.94), 1.8 * u);
      for (const s of [-1, 1]) { p.stroke([[tcx + s * 8 * u + 2 * u * facing, chin + 0.04 * HH], [tcx + s * 9 * u + 2 * u * facing, chin + 0.3 * HH]], 2.2 * u, acc); p.dot(tcx + s * 9 * u + 2 * u * facing, chin + 0.31 * HH, 2.6 * u, acc); }
      p.band([[tcx - 1.3 * T.a, torsoBot - 0.03 * HH], [tcx + 1.3 * T.a, torsoBot - 0.03 * HH]], shade(c, 0.88), 0.07 * HH, 1.5 * u);
      break;
    }
    case "sweater": for (let i = 0; i < 2; i++) p.band([[tcx - 1.3 * T.a, torsoBot - (0.04 + i * 0.05) * HH], [tcx + 1.3 * T.a, torsoBot - (0.04 + i * 0.05) * HH]], shade(c, 0.88 - i * 0.04), 0.035 * HH, 1 * u); break;
    case "shirt": for (let i = 0; i < 4; i++) { const y = chin + 0.14 * HH + i * 0.2 * HH; p.dot(tcx + 2 * u * facing, y, 2.6 * u, INK); p.dot(tcx + 2 * u * facing, y, 1.9 * u, acc); } break;
    case "tee": p.arc(tcx, chin - 0.02 * HH, 0.3 * T.a, 0.07 * HH, 20, 160, 1.8 * u); break;
    case "turtleneck": for (let i = -2; i <= 2; i++) p.stroke([[tcx + i * 0.32 * T.a, torsoBot - 0.1 * HH], [tcx + i * 0.32 * T.a, torsoBot]], 1.3 * u, shade(c, 0.8)); break;
  }
};
/** waistcoat / blazer / cardigan / apron over the top garment, clipped to the torso */
const layerDetail = (p: Pen, L: Look, tcx: number, chin: number, torsoBot: number, T: Blob, HH: number, u: number, facing: number, light: number) => {
  const c = L.layer!.color, sh = mul(c, SH_CLOTH), ox = tcx + 2 * u * facing;
  const panel = (pts: P2[]) => { p.gradFill(pts, c, sh, light); p.poly(pts, null, 1.8 * u); };
  switch (L.layer!.style) {
    case "waistcoat": {
      const vy = chin + 0.42 * HH;
      for (const s of [-1, 1]) panel([[ox + s * 0.4 * T.a, chin - 0.1 * HH], [ox + s * 2 * T.a, chin - 0.1 * HH], [ox + s * 2 * T.a, torsoBot + 0.2 * HH], [ox, torsoBot + 0.06 * HH], [ox, vy]]);
      for (let i = 0; i < 3; i++) { const y = vy + 0.08 * HH + i * 0.14 * HH; p.dot(ox + 4 * u, y, 2.8 * u, INK); p.dot(ox + 4 * u, y, 2.1 * u, L.layer!.accent ?? "#e8c45a"); }
      break;
    }
    case "blazer": case "cardigan": {
      const gapW = L.layer!.style === "blazer" ? 0.36 : 0.18, vy = chin + (L.layer!.style === "blazer" ? 0.5 : 0.1) * HH;
      for (const s of [-1, 1]) panel([[ox + s * gapW * T.a, chin - 0.1 * HH], [ox + s * 2 * T.a, chin - 0.1 * HH], [ox + s * 2 * T.a, torsoBot + 0.2 * HH], [ox + s * 0.06 * T.a, torsoBot + 0.2 * HH], [ox + s * 0.06 * T.a, vy]]);
      if (L.layer!.style === "blazer") for (const s of [-1, 1]) p.stroke([[ox + s * gapW * T.a, chin - 0.06 * HH], [ox + s * 0.58 * T.a, chin + 0.22 * HH], [ox + s * 0.1 * T.a, vy]], 1.8 * u);
      else for (let i = 0; i < 4; i++) p.dot(ox + 0.12 * T.a, chin + 0.2 * HH + i * 0.18 * HH, 2.2 * u, L.layer!.accent ?? shade(c, 0.6));
      break;
    }
    case "apron": {
      panel([[ox - 0.62 * T.a, chin + 0.22 * HH], [ox + 0.62 * T.a, chin + 0.22 * HH], [ox + 0.72 * T.a, torsoBot + 0.3 * HH], [ox - 0.72 * T.a, torsoBot + 0.3 * HH]]);
      p.band([[ox - 1.4 * T.a, torsoBot - 0.36 * HH], [ox + 1.4 * T.a, torsoBot - 0.36 * HH]], shade(c, 0.85), 0.04 * HH, 1 * u);
      break;
    }
  }
};

// ---------------- side view ----------------
export type SideMode = "stand" | "walk" | "run" | "sit";
export type SidePose = { expr?: Expr; mode?: SideMode; phase?: number; blink?: boolean | number; stride?: number; point?: boolean; light?: number; talk?: number; t?: number };
const ik = (hip: P2, ank: P2, l1: number, l2: number): P2 => {
  const dx = ank[0] - hip[0], dy = ank[1] - hip[1], d = clamp(Math.hypot(dx, dy), 1, l1 + l2 - 0.01);
  const A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), k = Math.atan2(dy, dx) - A;
  return [hip[0] + l1 * Math.cos(k), hip[1] + l1 * Math.sin(k)];
};
/** profile facing screen-right (mirror the card for left). Walk / run use the creator's planted-foot cycle. */
export const figureSide = (p: Pen, L: Look, pose: SidePose) => {
  const { expr = "neutral", mode = "stand", phase = 0, blink = false, stride = 1, light = DEF_LIGHT } = pose;
  const Bd = BUILDS[L.build], skin = L.skin, two = Math.PI * 2, lid = lidOf(blink), seed = L.seed;
  const H: Blob = { ...headBlob(seed, Bd.a, 1), asym: 0.12, rot: rad(3 + 3 * (rnd(seed, 7) - 0.5)) };
  const W = 2 * H.a, HH = 2 * H.b, u = W / 100, sole = 975, ankY = sole - 4 * u;
  const thick = thickAngle(light), ow = 5 * u;
  const legLen = (Bd.legs + 0.12) * HH - 4 * u, l1 = legLen / 2, l2 = legLen / 2;
  const nearCol = mix(L.legs, INK, 0.55), farCol = mix(L.legs, INK, 0.75), footCol = L.shoes;
  type LegS = { ank: P2; pitch: number; near: boolean; knee?: P2 };
  const legs: LegS[] = [];
  let hipY = ankY - legLen * 0.995, lean = 0, nearFwd = 0;
  if (mode === "walk" || mode === "run") {
    const run = mode === "run", S = (run ? 480 : 340) * stride, liftH = run ? 90 : 34;
    const st = (ph: number) => {
      const c = (((phase + ph) % 1) + 1) % 1, split = run ? 0.38 : 0.5;
      if (c < split) { const s = c / split; return { x: S / 2 - S * s, h: 0, stance: true, s }; }
      const s = (c - split) / (1 - split);
      return { x: -S / 2 + S * s - (S / Math.PI) * Math.sin(2 * Math.PI * s), h: liftH * Math.sin(Math.PI * s), stance: false, s };
    };
    const nL = st(0), fL = st(0.5), stance = nL.stance ? nL : fL.stance ? fL : null;
    const Leff = legLen * (1 - (run ? 0.08 : 0.035) * Math.sin(Math.PI * (stance?.s ?? 0.5)));
    hipY = stance ? ankY - Math.sqrt(Math.max(1, Leff * Leff - stance.x * stance.x)) : ankY - legLen * 0.9 - (run ? 0.06 * HH : 0);
    for (const [Lg, near] of [[fL, false], [nL, true]] as const)
      legs.push({ ank: [300 + Lg.x, ankY - Lg.h], pitch: Lg.stance ? 0 : rad(35 * Math.sin(Math.PI * Lg.s) * (1 - 1.6 * Lg.s)), near });
    lean = run ? 12 + 2 * Math.cos(2 * two * phase) : 3 + 2 * Math.cos(2 * two * phase);
    nearFwd = nL.x / (S / 2);
  } else if (mode === "sit") {
    hipY = sole - 0.45 * HH;
    for (const [dx, near] of [[-6, false], [0, true]] as const) {
      const knee: P2 = [300 + l1 * 0.98 + dx * u, hipY - 4 * u];
      legs.push({ ank: [knee[0] + 4 * u, ankY], pitch: 0, near, knee });
    }
  } else legs.push({ ank: [300 - 4 * u, ankY], pitch: 0, near: false }, { ank: [300 + 4 * u, ankY], pitch: 0, near: true });
  const torsoBot = hipY + 0.12 * HH, chin = torsoBot - Bd.torso * HH, hc = chin - H.b, hip: P2 = [300, hipY];
  p.rot = null;
  for (const Lg of legs) {
    const knee = Lg.knee ?? ik(hip, Lg.ank, l1, l2);
    p.stroke([[300 + (Lg.near ? 0 : -5 * u), hipY], knee, Lg.ank], 5.8 * u, Lg.near ? nearCol : farCol);
    const c = Math.cos(Lg.pitch), s = Math.sin(Lg.pitch);
    footStroke(p, [Lg.ank[0] - 3 * u * c, Lg.ank[1] - 3 * u * s], [Lg.ank[0] + 13 * u * c, Lg.ank[1] + 13 * u * s + 0.5 * u], 7.5 * u, Lg.near ? footCol : footCol === INK ? INK : shade(footCol, 0.82));
  }
  p.rot = lean ? [rad(lean), 300, hipY] : null;
  const coat = L.layer?.style === "labcoat", outer = L.layer && L.layer.style !== "waistcoat" && L.layer.style !== "apron" ? L.layer.color : L.top.color;
  const T: Blob = { a: (L.build === "stout" ? 0.38 : L.build === "tall" ? 0.28 : 0.31) * W, b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.5, egg: 0.1, asym: 0.06 + (L.build === "stout" ? 0.06 : 0), rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = 300 + 2 * u, tcy = torsoBot - T.b, tp = blobPts(tcx, tcy, T);
  const armCol = armColOf(outer), farArm = mix(armCol, INK, 0.3);
  const S: P2 = [tcx + 0.05 * T.a, chin + 0.14 * HH], aLen = 0.95 * HH;
  const swingArm = (ang: number, bend = 16): [P2, P2, P2] => {
    const e: P2 = [S[0] + Math.sin(ang) * aLen * 0.5, S[1] + Math.cos(ang) * aLen * 0.5], a2 = ang + rad(bend) * Math.sign(ang || 1);
    return [S, e, [e[0] + Math.sin(a2) * aLen * 0.5, e[1] + Math.cos(a2) * aLen * 0.5]];
  };
  const run = mode === "run";
  let near: [P2, P2, P2] = swingArm(rad(run ? -55 : -30) * nearFwd, run ? 70 : 16);
  const far: [P2, P2, P2] | null = mode === "walk" || run ? swingArm(rad(run ? 55 : 30) * nearFwd, run ? 70 : 16) : null;
  if (pose.point) near = [S, [S[0] + 0.45 * HH, S[1] - 0.02 * HH], [S[0] + 0.9 * HH, S[1] - 0.08 * HH]];
  if (mode === "sit") near = [S, [S[0] + 0.2 * HH, S[1] + 0.4 * HH], [S[0] + 0.55 * HH, torsoBot - 0.05 * HH]];
  if (far) { p.stroke(curve(far[0], far[1], far[2]), 5.2 * u, farArm); p.dot(far[2][0], far[2][1], 5.5 * u); }
  const top = L.top.color;
  if (coat) {
    const cTop = chin - 0.2 * HH, cBot = torsoBot + 0.42 * HH, lc = L.layer!.color;
    const cp = blobPts(tcx - 2 * u, (cTop + cBot) / 2, { ...T, a: T.a * 1.12, b: (cBot - cTop) / 2, nBot: 3.4, seed: seed + 11 });
    p.gradFill(cp, lc, mul(lc, [0.86, 0.88, 0.95]), light, 0.3);
    p.clip(cp, () => { const fx = tcx + T.a * 0.85; p.poly([[fx - 6 * u, chin - 0.1 * HH], [fx + 30 * u, chin - 0.1 * HH], [fx + 30 * u, cBot + 10 * u], [fx + 2 * u, cBot + 10 * u], [fx - 2 * u, torsoBot - 0.2 * HH]], top, 1.8 * u); });
    p.inkRing(cp, ow, thick);
  } else {
    const body = L.layer?.style === "waistcoat" ? L.layer.color : outer;
    p.gradFill(tp, body, mul(body, SH_CLOTH), light);
    p.clip(tp, () => {
      if (L.layer?.style === "waistcoat") p.poly([[tcx + 0.45 * T.a, chin - 0.1 * HH], [tcx + 2 * T.a, chin - 0.1 * HH], [tcx + 2 * T.a, chin + 0.2 * HH], [tcx + 0.92 * T.a, chin + 0.42 * HH]], L.top.color, 1.8 * u);
      if (L.top.style === "hoodie") p.poly([[tcx + 0.2 * T.a, torsoBot - 0.4 * HH], [tcx + 1.2 * T.a, torsoBot - 0.4 * HH], [tcx + 1.2 * T.a, torsoBot - 0.08 * HH], [tcx + 0.1 * T.a, torsoBot - 0.08 * HH]], shade(top, 0.94), 1.8 * u);
    });
    p.inkRing(tp, ow, thick);
  }
  if (L.top.style === "hoodie" && !coat) p.ell(tcx - 0.55 * T.a, chin + 0.02 * HH, 0.2 * W, 0.13 * HH, mix(top, INK, 0.08), ow * 0.8);
  if (L.neck?.style === "bowtie") { const y = chin + 0.05 * HH, x = tcx + T.a * 0.95; p.poly([[x, y], [x - 4 * u, y - 7 * u], [x - 4 * u, y + 7 * u]], L.neck.color, 2 * u); }
  p.stroke(curve(near[0], near[1], near[2]), 5.2 * u, armCol);
  if (pose.point) taper(p, near[2], [near[2][0] + 13 * u, near[2][1] - 1.5 * u], 4.2 * u, 3.4 * u);
  p.dot(near[2][0], near[2][1], 5.5 * u);
  // ---- head ----
  const hx = 300 + 4 * u;
  hairBack(p, L, H, hx, hc, light, thick, ow, true, chin);
  const hp = blobPts(hx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  hairFront(p, L, hp, H, hx, hc, light, thick, ow, 1, true);
  faceSide3(p, L, hx, hc, W, expr, lid, skin);
  hat3(p, L, H, hx, hc, light, 1, true);
  p.rot = null;
};
const faceSide3 = (p: Pen, L: Look, hx: number, hy: number, W: number, expr: Expr, lid: number, skin: string) => {
  const u = W / 100, F = FACES[expr], ex = hx + 27 * u, ey = hy, base = F.eye[1];
  const kind: Eye3 = base === "wide" || base === "pin" || base === "angry" || base === "sad" || base === "up" || base === "closed"
    ? (lid >= 1 && base !== "closed" ? "dash" : base) : eyeKind(base as EyeK, lid);
  eye3(p, kind, ex, ey, u, 1, [0.6, F.look?.[1] ?? 0], skin, L.eyes?.shock ?? 1);
  const [dI, dO] = F.brow[1], by = ey - 20 * u - (isRound(kind) ? 3 * u : 0), bw = 5 * u * (L.brow?.k ?? 1), bc = L.brow?.color ?? INK;
  if (kind === "shock" || kind === "shockHalf") p.arc(ex, by - 4 * u, 9 * u, 3 * u, 200, 340, 4 * u, bc);
  else taper(p, [ex + 8 * u, by + dI * u], [ex - 7 * u, by - u + dO * u], bw, bw / 2, bc);
  if (L.glasses) { const r = 12.5 * u; p.ell(ex, ey, r * 0.55, r, null, 2.8 * u); p.stroke([[ex - r * 0.55, ey - 2 * u], [hx - 14 * u, ey - 6 * u]], 2.4 * u); }
  p.stroke([[hx + 44 * u, hy + 4 * u], [hx + 47.5 * u, hy + 9 * u], [hx + 43 * u, hy + 10 * u]], 3 * u);
  if (L.beard) { const bp: P2[] = []; for (let i = 0; i <= 12; i++) { const t = rad(-20 + (130 * i) / 12); bp.push([hx + 20 * u + Math.cos(t) * 26 * u, hy + 18 * u + Math.sin(t) * 28 * u]); } p.poly(bp, L.beard.color, 3.5 * u); }
  mouth3(p, F.mouth, hx + 33 * u, hy + 21 * u + (L.moustache?.style === "walrus" ? 3 * u : 0), u, 0.62);
  if (L.moustache) {
    if (L.moustache.style === "walrus") p.poly([[hx + 44 * u, hy + 11 * u], [hx + 28 * u, hy + 9 * u], [hx + 20 * u, hy + 18 * u], [hx + 26 * u, hy + 24 * u], [hx + 34 * u, hy + 19 * u], [hx + 42 * u, hy + 20 * u]], L.moustache.color, 3 * u);
    else taper(p, [hx + 41 * u, hy + 13.5 * u], [hx + 25 * u, hy + 16 * u], 4.5 * u, 1.6 * u, L.moustache.color);
  }
  if (F.sweat) p.poly(dropPts(hx - 30 * u, hy - 24 * u, 4 * u), "#9fd4ff", 2 * u);
};

// ---------------- acting presets ----------------
/** a reaction = face + body language. Use these in storyboards; they read at phone size. */
export type Act = "neutral" | "happy" | "laugh" | "shock" | "scared" | "angry" | "sad" | "thinking" | "confused" | "proud" | "excited"
  | "suspicious" | "explain" | "shrug" | "facepalm" | "disgusted" | "sleepy" | "embarrassed" | "determined" | "hello" | "thumbsUp"
  | "point" | "idea" | "nervous" | "dazed" | "relief";
export const ACTS: Record<Act, Partial<Pose>> = {
  neutral: { expr: "neutral", gesture: "hang" },
  happy: { expr: "smile_closed", gesture: "hang", headTilt: -3 },
  laugh: { expr: "laugh", gesture: "belly", headTilt: -6, tilt: -2 },
  shock: { expr: "shock", gesture: "spread", headTilt: 0, shrug: 1 },
  scared: { expr: "scared", gesture: "coverMouth", shrug: 1.2, tilt: 2 },
  angry: { expr: "angry", gesture: "fists", shrug: 0.8, headTilt: 3 },
  sad: { expr: "sad", gesture: "hang", headTilt: 9, tilt: 3 },
  thinking: { expr: "thinking", gesture: "chin", headTilt: -4 },
  confused: { expr: "confused", gesture: "scratchHead", headTilt: -9 },
  proud: { expr: "proud", gesture: "hips", headTilt: -6 },
  excited: { expr: "excited", gesture: "cheer", shrug: 0.4 },
  suspicious: { expr: "suspicious", gesture: "crossArms", headTilt: 6 },
  explain: { expr: "talk", gesture: "present" },
  shrug: { expr: "smile", gesture: "shrug", shrug: 1.4, headTilt: -5 },
  facepalm: { expr: "pained", gesture: "facepalm", headTilt: 7 },
  disgusted: { expr: "disgusted", gesture: "stop", headTilt: -7, tilt: -3 },
  sleepy: { expr: "sleepy", gesture: "hang", headTilt: 11, tilt: 2 },
  embarrassed: { expr: "embarrassed", gesture: "scratchHead", headTilt: 6 },
  determined: { expr: "determined", gesture: "fists" },
  hello: { expr: "smile", gesture: "wave" },
  thumbsUp: { expr: "wink", gesture: "thumbsUp" },
  point: { expr: "talk_wide", gesture: "point" },
  idea: { expr: "excited", gesture: "pointUp" },
  nervous: { expr: "nervous", gesture: "hang", shrug: 0.6, tilt: 2 },
  dazed: { expr: "dazed", gesture: "hang", headTilt: 10, tilt: -4 },
  relief: { expr: "relief", gesture: "belly", headTilt: -4 },
};
export const ACT_NAMES = Object.keys(ACTS) as Act[];
/** a pose for an acting preset (pose fields override the preset) */
export const act = (a: Act, extra: Partial<Pose> = {}): Pose => ({ ...ACTS[a], ...extra });
