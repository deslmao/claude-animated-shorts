// "6 7" theme (productions/six-seven/script.md, approved by the owner): three mates, a Ouija board at Glendon's place.
// Reused: the everyday apartment's living room (the set itself), the night-train flicker / red tint, the breakfast
// dread vignette, the stop-time blue veil (in the storyboard).
// New here (additions only):
//   props ssBoard (the Ouija board flat on the coffee table, its planchette sliding along a path, a step per stop),
//     ssInsert (9:16 close inserts: Isaac's phone with a cartoon cat bounced to "huss huss huss", the board in close-up
//     with hands on the planchette, letter by letter)
//   item ouijaBoard (the board held up in both hands)
//   characters ssMe, ssIsaac, ssGlendon
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import type { Pen } from "../../characters/toon";
import { At } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";

const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const INK = "#1b1222", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Serif', 'Liberation Serif', Georgia, serif`;
const FS = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;

// ---------------------------------------------------------------- the board
// The board is drawn on a 1000 x 680 canvas: YES / NO, the letters in two arcs, a row of numbers, GOOD BYE.
// BOARD_AT gives every stop's centre on that canvas, shared by the 3D board and the close-up inserts.
const BW = 1000, BH = 680;
const L1 = "ABCDEFGHIJKLM", L2 = "NOPQRSTUVWXYZ", NUMS = "1234567890";
const BOARD_AT: Record<string, [number, number]> = {};
[...L1].forEach((c, i) => { const a = Math.PI * (0.86 - (i / 12) * 0.72); BOARD_AT[c] = [500 + Math.cos(a) * 420, 430 - Math.sin(a) * 220]; });
[...L2].forEach((c, i) => { const a = Math.PI * (0.84 - (i / 12) * 0.68); BOARD_AT[c] = [500 + Math.cos(a) * 340, 500 - Math.sin(a) * 160]; });
[...NUMS].forEach((c, i) => { BOARD_AT[c] = [230 + i * 60, 520]; });
BOARD_AT.YES = [140, 90]; BOARD_AT.NO = [860, 90]; BOARD_AT.MID = [500, 380];
/** the planchette's stops, a step each: wander = round the letters, then 6, then 7; loop = 6, 7, 6, 7, ... */
const PATHS: Record<string, string[]> = {
  rest: ["MID"],
  wander: ["MID", "H", "E", "L", "O", "S", "A", "W", "6", "7"],
  loop: ["7", "6", "7", "6", "7", "6", "7", "6", "7", "6", "7", "6", "7"],
};
const drawBoard = (g: CanvasRenderingContext2D) => {
  const gr = g.createLinearGradient(0, 0, 0, BH); gr.addColorStop(0, "#d9b27a"); gr.addColorStop(1, "#b8874e"); g.fillStyle = gr;
  g.beginPath(); g.roundRect(6, 6, BW - 12, BH - 12, 60); g.fill(); g.lineWidth = 12; g.strokeStyle = "#4a2a14"; g.stroke();
  g.strokeStyle = "rgba(74,42,20,0.5)"; g.lineWidth = 4; g.beginPath(); g.roundRect(30, 30, BW - 60, BH - 60, 44); g.stroke();
  g.fillStyle = "#2a160a"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = F(60); g.fillText("YES", ...BOARD_AT.YES); g.fillText("NO", ...BOARD_AT.NO);
  // a sun and a moon by YES and NO
  g.beginPath(); g.arc(250, 90, 26, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(750, 90, 26, Math.PI * 0.6, Math.PI * 1.9); g.stroke();
  g.font = F(58); for (const c of L1 + L2) { const [x, y] = BOARD_AT[c]; g.fillText(c, x, y); }
  g.font = F(54); for (const c of NUMS) { const [x, y] = BOARD_AT[c]; g.fillText(c, x, y); }
  g.font = F(46); g.fillText("GOOD BYE", 500, 620);
};
const boardTex = () => stex("ssBoard", BW, BH, drawBoard);
/** the planchette: a heart-shaped pointer with a round glass window */
const drawPlanchette = (g: CanvasRenderingContext2D, x: number, y: number, s: number) => {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = "#f2e6cc"; g.beginPath(); g.moveTo(0, -95); g.bezierCurveTo(85, -95, 110, 20, 0, 85); g.bezierCurveTo(-110, 20, -85, -95, 0, -95); g.closePath(); g.fill();
  g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
  g.fillStyle = "rgba(200,225,245,0.35)"; g.beginPath(); g.arc(0, -18, 30, 0, Math.PI * 2); g.fill(); g.lineWidth = 6; g.stroke();
  g.restore();
};
const boardRig = (a: At, v = "rest"): PropRig => {
  const root = rigRoot(a), w = 0.62, h = (w * BH) / BW;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: boardTex() })); board.position.y = 0.004; root.add(board);
  const pt = stex("ssPlanch", 256, 256, (g) => drawPlanchette(g, 128, 120, 1.1));
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.1).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: pt, transparent: true, alphaTest: 0.5 }));
  pl.position.y = 0.012; root.add(pl);
  const path = PATHS[v] ?? PATHS.rest, toXZ = (k: string): [number, number] => { const [x, y] = BOARD_AT[k] ?? BOARD_AT.MID; return [(x / BW - 0.5) * w, (y / BH - 0.5) * h]; };
  return { root, update: ({ step = 0 }) => {
    const n = Math.max(0, Math.min(path.length - 1, Math.floor(step))), f = Math.min(1, step - n), A = toXZ(path[n]), B = toXZ(path[Math.min(path.length - 1, n + 1)]);
    pl.position.x = A[0] + (B[0] - A[0]) * f; pl.position.z = A[1] + (B[1] - A[1]) * f;
  } };
};

// ---------------------------------------------------------------- inserts (9:16 cards)
type Ins = { n: number; loop?: boolean; draw: (g: CanvasRenderingContext2D, st: number) => void };
const vig = (g: CanvasRenderingContext2D, a = 0.55) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.3, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
/** the board in close-up, upright (letters the right way up), the planchette on stop `stop`, a hand on it from each of
 *  `hands` = [from-x, from-y, skin, sleeve]: the arm comes in from that point on the card's edge */
const boardClose = (g: CanvasRenderingContext2D, stop: string, hands: [number, number, string, string][], glow = 0) => {
  g.fillStyle = "#120a08"; g.fillRect(0, 0, IW, IH);
  g.fillStyle = `rgba(255,170,80,${0.2 + glow * 0.1})`; g.beginPath(); g.ellipse(IW / 2, IH / 2, 520, 600, 0, 0, Math.PI * 2); g.fill();   // candlelight
  const k = 0.78, ox = (IW - BW * k) / 2, oy = (IH - BH * k) / 2 - 40;
  g.save(); g.translate(ox, oy); g.scale(k, k); drawBoard(g);
  const [bx, by] = BOARD_AT[stop] ?? BOARD_AT.MID; drawPlanchette(g, bx, by + 18, 0.85);
  g.restore();
  // the arms reach in to the planchette's top (its window stays clear over the letter)
  const px = ox + bx * k, py = oy + (by + 18) * k;
  for (const [fx, fy, skin, sleeve] of hands) {
    const ang = Math.atan2(py - fy, px - fx), tx = px - Math.cos(ang) * 62, ty = py - Math.sin(ang) * 62;
    g.lineCap = "round"; g.strokeStyle = INK; g.lineWidth = 64; g.beginPath(); g.moveTo(fx, fy); g.lineTo(tx, ty); g.stroke();
    g.strokeStyle = sleeve; g.lineWidth = 50; g.beginPath(); g.moveTo(fx, fy); g.lineTo(tx - Math.cos(ang) * 40, ty - Math.sin(ang) * 40); g.stroke();
    g.fillStyle = skin; g.lineWidth = 7; g.strokeStyle = INK; g.beginPath(); g.ellipse(tx, ty, 34, 28, ang, 0, Math.PI * 2); g.fill(); g.stroke();
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.ellipse(tx + Math.cos(ang) * 30 + Math.cos(ang + Math.PI / 2) * i * 16, ty + Math.sin(ang) * 30 + Math.sin(ang + Math.PI / 2) * i * 16, 10, 8, ang, 0, Math.PI * 2); g.fill(); g.stroke(); }
  }
  g.fillStyle = "rgba(255,150,60,0.08)"; g.fillRect(0, 0, IW, IH);
  vig(g, 0.65);
};
const ME_HAND: [number, number, string, string] = [120, IH, "#e8b896", "#3f7a4a"];
const ISAAC_HAND: [number, number, string, string] = [IW / 2, 0, "#c9946c", "#e0b13a"];
const GLEN_HAND: [number, number, string, string] = [IW, IH * 0.62, "#f0c8a8", "#d96a2a"];
/** a cartoon cat held up by two hands and bounced up and down (state 0 down, 1 up), "huss huss huss" */
const catPhone = (g: CanvasRenderingContext2D, up: boolean) => {
  g.fillStyle = "#101216"; g.fillRect(0, 0, IW, IH);
  g.fillStyle = "#e9e4dc"; g.beginPath(); g.roundRect(60, 60, IW - 120, IH - 120, 60); g.fill();                     // the phone's screen: a kitchen
  g.save(); g.beginPath(); g.roundRect(60, 60, IW - 120, IH - 120, 60); g.clip();
  g.fillStyle = "#d8d2c6"; g.fillRect(60, 60, IW, 520); g.fillStyle = "#b9c2c8"; g.fillRect(60, 560, IW, 40);
  const cy = up ? 640 : 760, k = up ? 1.02 : 0.98;
  // the cat: grey, fluffy, a white chest, held under the arms
  g.lineWidth = 9; g.strokeStyle = INK;
  g.fillStyle = "#8c8f98"; g.beginPath(); g.ellipse(IW / 2, cy + 230, 150 * k, 240 / k, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.fillStyle = "#f2f0ea"; g.beginPath(); g.ellipse(IW / 2, cy + 200, 80, 150, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#8c8f98"; g.beginPath(); g.ellipse(IW / 2, cy, 150, 130, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(IW / 2 + s * 120, cy - 60); g.lineTo(IW / 2 + s * 95, cy - 165); g.lineTo(IW / 2 + s * 50, cy - 105); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = "#f2c94c"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(IW / 2 + s * 55, cy - 10, 22, 26, 0, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillStyle = INK; g.fillRect(IW / 2 + s * 55 - 4, cy - 28, 8, 36); g.fillStyle = "#f2c94c"; }
  g.fillStyle = "#e88a9a"; g.beginPath(); g.moveTo(IW / 2 - 12, cy + 30); g.lineTo(IW / 2 + 12, cy + 30); g.lineTo(IW / 2, cy + 44); g.closePath(); g.fill();
  g.lineWidth = 4; for (const s of [-1, 1]) for (const d of [-12, 4]) { g.beginPath(); g.moveTo(IW / 2 + s * 30, cy + 40 + d); g.lineTo(IW / 2 + s * 130, cy + 30 + d * 2); g.stroke(); }
  // the hands holding it
  g.lineWidth = 9; for (const s of [-1, 1]) { g.fillStyle = "#d9a886"; g.beginPath(); g.ellipse(IW / 2 + s * 150, cy + 150, 70, 55, s * 0.4, 0, Math.PI * 2); g.fill(); g.stroke(); g.fillRect(IW / 2 + s * 150 - 50 + s * 40, cy + 170, 100, 700); }
  // the on-screen text, the app's like / comment column
  g.fillStyle = "#f7c6e0"; g.strokeStyle = "#2a1020"; g.lineWidth = 10; g.font = FS(96); g.textAlign = "center";
  for (let i = 0; i < 3; i++) { g.strokeText("huss", IW / 2, 360 + i * 105); g.fillText("huss", IW / 2, 360 + i * 105); }
  g.fillStyle = "rgba(255,255,255,0.92)"; for (const [y, t] of [[820, "\u2665"], [930, "\u2026"], [1040, "\u21bb"]] as const) { g.font = FS(64); g.fillText(t, IW - 120, y); }
  g.fillStyle = "#ffffff"; g.font = FS(34); g.textAlign = "left"; g.fillText("@lockedin.cat", 110, IH - 220); g.font = FS(30, "normal"); g.fillText("HUSS HUSS HUSS HUSS\u2026", 110, IH - 175);
  g.restore();
  vig(g, 0.35);
};
const INSERTS: Record<string, Ins> = {
  phone: { n: 2, loop: true, draw: (g, st) => catPhone(g, st % 2 === 1) },
  // all three hands on the planchette: it wanders the letters, then 6, then 7
  board3: { n: PATHS.wander.length, draw: (g, st) => boardClose(g, PATHS.wander[st], [ME_HAND, ISAAC_HAND, GLEN_HAND], st >= 8 ? 1 : 0) },
  // two hands (yours and Glendon's), dragged 6, 7, 6, 7 faster and faster
  board2: { n: PATHS.loop.length, draw: (g, st) => boardClose(g, PATHS.loop[st], [ME_HAND, GLEN_HAND], 1) },
};
// ---------------------------------------------------------------- the board close-up, moving smoothly
// The board card is two layers: the board itself (still, in candlelight) and, over it, the planchette with the hands on
// it, drawn on a layer twice the card's size with the arms reaching in from far off the card. That layer glides from
// stop to stop (each step eased) along a curved line, so the planchette moves the way it does in a seance: slow,
// circling, then settling on a letter.
const CK = 0.78, COX = (IW - BW * CK) / 2, COY = (IH - BH * CK) / 2 - 40;
const boardBackTex = () => stex("ssBoardBack", IW, IH, (g) => {
  g.fillStyle = "#120a08"; g.fillRect(0, 0, IW, IH);
  g.fillStyle = "rgba(255,170,80,0.26)"; g.beginPath(); g.ellipse(IW / 2, IH / 2, 520, 600, 0, 0, Math.PI * 2); g.fill();
  g.save(); g.translate(COX, COY); g.scale(CK, CK); drawBoard(g); g.restore();
  g.fillStyle = "rgba(255,150,60,0.08)"; g.fillRect(0, 0, IW, IH);
  vig(g, 0.65);
});
/** the planchette at the overlay's centre, hands on it; arms reach in from `from` (directions, in overlay pixels) */
const handsTex = (key: string, hands: [number, number, string, string][]) => stex(`ssHands_${key}`, IW, IH, (g) => {
  g.clearRect(0, 0, IW, IH);
  const cx = IW / 2, cy = IH / 2, k = 0.5;                      // the overlay is twice the card: half the pixel scale
  drawPlanchette(g, cx, cy, 1.35 * CK * k);
  for (const [fx, fy, skin, sleeve] of hands) {
    const ang = Math.atan2(cy - fy, cx - fx), tx = cx - Math.cos(ang) * 31, ty = cy - Math.sin(ang) * 31;
    g.lineCap = "round"; g.strokeStyle = INK; g.lineWidth = 32; g.beginPath(); g.moveTo(fx, fy); g.lineTo(tx, ty); g.stroke();
    g.strokeStyle = sleeve; g.lineWidth = 25; g.beginPath(); g.moveTo(fx, fy); g.lineTo(tx - Math.cos(ang) * 20, ty - Math.sin(ang) * 20); g.stroke();
    g.fillStyle = skin; g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.ellipse(tx, ty, 17, 14, ang, 0, Math.PI * 2); g.fill(); g.stroke();
    for (let i = -1; i <= 1; i++) { g.beginPath(); g.ellipse(tx + Math.cos(ang) * 15 + Math.cos(ang + Math.PI / 2) * i * 8, ty + Math.sin(ang) * 15 + Math.sin(ang + Math.PI / 2) * i * 8, 5, 4, ang, 0, Math.PI * 2); g.fill(); g.stroke(); }
  }
});
// arms come from far off the card: below-left (you), above (Isaac), the right (Glendon)
const H_ME: [number, number, string, string] = [IW * 0.1, IH * 1.0, "#e8b896", "#3f7a4a"];
const H_ISAAC: [number, number, string, string] = [IW * 0.5, 0, "#c9946c", "#e0b13a"];
const H_GLEN: [number, number, string, string] = [IW, IH * 0.58, "#f0c8a8", "#d96a2a"];
const CARD_PATHS: Record<string, string[]> = {
  board3: ["MID", "C", "K", "W", "P", "6", "7"],
  board2: ["7", "6", "7", "6", "7", "6", "7", "6", "7", "6", "7", "6", "7", "6", "7"],
};
const stopXY = (k: string): [number, number] => {
  const [bx, by] = BOARD_AT[k] ?? BOARD_AT.MID, px = COX + bx * CK, py = COY + (by + 18) * CK;
  return [(px / IW - 0.5) * 0.54, (0.5 - py / IH) * 0.96];
};
const boardCardRig = (a: At, v = "board3"): PropRig => {
  const root = rigRoot(a);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: boardBackTex(), toneMapped: false })); back.layers.set(NOINK); root.add(back);
  const hands = v === "board2" ? [H_ME, H_GLEN] : [H_ME, H_ISAAC, H_GLEN];
  const over = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.92), new THREE.MeshBasicMaterial({ map: handsTex(v, hands), transparent: true, depthWrite: false, toneMapped: false }));
  over.position.z = 0.002; over.layers.set(NOINK); root.add(over);
  const path = CARD_PATHS[v] ?? CARD_PATHS.board3;
  return { root, update: ({ step = 0 }) => {
    const n = Math.max(0, Math.min(path.length - 1, Math.floor(step))), f0 = Math.min(1, step - n), f = f0 * f0 * (3 - 2 * f0);
    const A = stopXY(path[n]), B = stopXY(path[Math.min(path.length - 1, n + 1)]);
    // a curved glide: the planchette bows off the straight line and circles a little as it goes
    const bow = Math.sin(f * Math.PI) * 0.025, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
    const x = A[0] + dx * f - (dy / L) * bow, y = A[1] + dy * f + (dx / L) * bow;
    over.position.x = x; over.position.y = y; over.rotation.z = Math.sin(step * 2.3) * 0.05;
  } };
};

const insertRig = (a: At, v = "phone"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.phone, texAt = (st: number) => stex(`ssIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => {
    const k = Math.max(0, Math.ceil(step - 1e-3)), st = ins.loop ? k % ins.n : Math.min(ins.n - 1, k);
    (m.material as THREE.MeshBasicMaterial).map = texAt(st);
  } };
};

// ---------------------------------------------------------------- the night window
/** night outside the apartment's living-room window: a dark blue pane with a faint moon, over its painted daytime
 *  garden (`at` = the window's centre: [-2.6, 1.625, -2.594] on the apartment set) */
const nightTex = () => stex("ssNight", 256, 216, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 216); gr.addColorStop(0, "#0a1024"); gr.addColorStop(1, "#1a2440"); g.fillStyle = gr; g.fillRect(0, 0, 256, 216);
  g.fillStyle = "rgba(230,236,255,0.85)"; g.beginPath(); g.arc(190, 52, 16, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#070a14"; g.fillRect(0, 160, 256, 56);
});
const nightRig = (a: At): PropRig => {
  const root = rigRoot(a), m = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.37), new THREE.MeshBasicMaterial({ map: nightTex(), toneMapped: false })); root.add(m);
  return { root, update: () => undefined };
};

// ---------------------------------------------------------------- item: the board held up
const boardItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.poly([[x - 26 * u * s, y - 40 * u], [x + 26 * u * s, y - 40 * u], [x + 26 * u * s, y + 2 * u], [x - 26 * u * s, y + 2 * u]], "#c79a5e", 2.6 * u);
  p.stroke([[x - 18 * u * s, y - 26 * u], [x - 6 * u * s, y - 32 * u], [x + 6 * u * s, y - 32 * u], [x + 18 * u * s, y - 26 * u]], 1.6 * u, "#2a160a");
  p.stroke([[x - 16 * u * s, y - 14 * u], [x + 16 * u * s, y - 14 * u]], 1.6 * u, "#2a160a");
};

// ---------------------------------------------------------------- characters
const ME: Look = { name: "Me", build: "petite", skin: "#e8b896", seed: 961, hair: { style: "side", color: "#4a2e1e" }, top: { style: "hoodie", color: "#3f7a4a", accent: "#e8e4dc" }, legs: "#2a2c3a", shoes: "#f0f0f0" };
const ISAAC: Look = { name: "Isaac", build: "petite", skin: "#c9946c", seed: 962, hair: { style: "curly", color: "#1e1a1a" }, glasses: { style: "square", color: "#14121c" }, top: { style: "tee", color: "#e0b13a" }, legs: "#3a3f55", shoes: "#1e1e24" };
const GLENDON: Look = { name: "Glendon", build: "lanky", skin: "#f0c8a8", seed: 963, hair: { style: "spiky", color: "#c98a3a" }, top: { style: "hoodie", color: "#d96a2a", accent: "#2a2c30" }, legs: "#2a2c30", shoes: "#d8dbe2" };
const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["horror", "comedy", "friends"], tags });

export const SIXSEVEN_THEME: Theme = {
  id: "sixseven", name: "6 7 (three mates, a Ouija board)",
  desc: "a horror-comedy at a mate's place: a Ouija board on the coffee table whose planchette slides letter by letter, close-ups of hands on it, a phone with a cartoon cat bounced to 'huss huss huss'; reuses the everyday apartment living room",
  tags: ["horror", "comedy", "ouija", "friends", "teen", "meme"],
  mood: "drone",
  characters: { ssMe: ME, ssIsaac: ISAAC, ssGlendon: GLENDON },
  characterMeta: {
    ssMe: meta("Me", "a teen: brown side-swept hair, a green hoodie", "the narrator, telling his mates what happened", ["teen", "boy", "narrator"]),
    ssIsaac: meta("Isaac", "a teen with square glasses, curly black hair, a yellow tee", "a menace: won't stop doing the 6 7 bit", ["teen", "boy", "glasses"]),
    ssGlendon: meta("Glendon", "a lanky teen, spiky ginger hair, an orange hoodie", "the host; pulls out the Ouija board", ["teen", "boy", "host"]),
  },
  items: {
    ouijaBoard: { name: "Ouija board", desc: "a wooden Ouija board held up in both hands", themes: ["horror"], tags: ["ouija", "board", "spirit"], draw: boardItem },
  },
  props: {
    ssBoard: { name: "Ouija board on a table", desc: "a Ouija board lying flat (0.62 m wide; on the apartment's coffee table: `at` [-2.6, 0.42, -0.75]), its planchette moving a stop per step. Variants: rest (in the middle), wander (round the letters, then 6, then 7), loop (6, 7, 6, 7…)", category: "theme", themes: ["horror"], tags: ["ouija", "board", "planchette"], radius: 0.05, height: 0.02,
      build: () => undefined, rig: (a, v) => boardRig(a, v ?? "rest"), steps: ["the planchette moves to the next stop"], stepCount: () => 20, variants: { rest: () => undefined, wander: () => undefined, loop: () => undefined } },
    ssBoardCard: { name: "Ouija close-up, moving (6 7)", desc: "an upright 9:16 card (0.54 x 0.96 m, facing +z; an `at` camera 1.0 m in front at fov 51 sees only it): the board in candlelight with the planchette and hands gliding smoothly from stop to stop, a step per stop (each move eased, on a slight curve). Variants: board3 (three hands; round the letters, then 6, then 7), board2 (your hand and Glendon's: 7, 6, 7, 6…)", category: "theme", themes: ["horror", "insert"], tags: ["ouija", "planchette", "close-up"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => boardCardRig(a, v ?? "board3"), steps: ["glides to the next stop"], stepCount: () => 40, variants: { board3: () => undefined, board2: () => undefined } },
    ssNight: { name: "Night window (apartment)", desc: "night outside the apartment's living-room window: a dark pane with a moon over the painted daytime garden; `at` [-2.6, 1.625, -2.594]", category: "theme", themes: ["night"], tags: ["window", "night"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => nightRig(a), steps: [], stepCount: () => 1 },
    ssInsert: { name: "Close insert (6 7)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step. Variants: phone (Isaac's phone: a cartoon cat bounced up and down to 'huss huss huss'; loops), board3 (three hands on the planchette, round the letters, then 6, then 7), board2 (two hands dragged 6, 7, 6, 7…)", category: "theme", themes: ["horror", "insert"], tags: ["insert", "phone", "ouija", "close-up"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "phone"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
  },
};
