// "I've Sold 200 Memories of the Girl I Love" theme (productions/memory-money/script.md, approved by the owner): an
// original cyberpunk love story in a city where memories are money. Reused: the Stop Time theme's sets (the Lowline
// street in the rain, the rooftop, Theo's flat as Lumi's flat, the back-alley clinic as the extraction room), kit
// primitives, buildRoom.
// New here (additions only):
//   set memMarket (the memory exchange: two steel counters, walls of glowing vials, a big board, neon)
//   props memTint (a memory's golden light held in front of the lens; variant "drain": the gold drains to grey on its
//     step, a memory being sold), memAd (a holo-ad for the rich: MEMORIA), mmInsert (9:16 close insert cards, a state
//     per step)
//   characters kai, lumi, lumiSick, lumiHood, broker
//   items memVial (a small glowing vial in the hand), paperStar
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import type { Pen } from "../../characters/toon";
import { Batch } from "../../materials/geo";
import { buildRoom } from "../../sets/room";
import { At, col, glow, box, rbox, cyl, sph } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";
import type { View } from "../../sets/types";
import type { V3 } from "../../camera/keys";

const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const rnd = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const INK = "#14121c", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const GOLD = "#ffc864", CYAN = "#4ef0ff", MAGENTA = "#ff3fb4", SILVER = "#dfe6f0";

// ---------------------------------------------------------------- set: the memory exchange
// 7 x 5 m, open toward +z: dark walls, two steel counters side by side (A at x -1.0, B at x 1.4), the brokers' side
// behind them; the back wall lined with shelves of glowing gold vials; a big board above (MEMORIA EXCHANGE); magenta and
// cyan neon. Spots: kai (in front of counter A), brokerA (behind it), buyer (in front of counter B), brokerB, crowd.
const MARKET_SPOTS: Record<string, V3> = { kai: [-1.0, 0, 0.2], brokerA: [-1.0, 0, -1.05], buyer: [1.4, 0, 0.2], brokerB: [1.4, 0, -1.05], crowd: [0.2, 0, 1.4] };
const MARKET_VIEWS: View[] = [{ name: "market", pos: [0.2, 1.6, 4.4], look: [0.2, 1.4, -1.2], fov: 52, establishing: true }];
const boardTex = () => stex("mmBoard", 1024, 256, (g) => {
  g.fillStyle = "#0a0b14"; g.fillRect(0, 0, 1024, 256); g.strokeStyle = GOLD; g.lineWidth = 8; g.shadowColor = GOLD; g.shadowBlur = 30; g.strokeRect(10, 10, 1004, 236);
  g.fillStyle = GOLD; g.font = F(110); g.textAlign = "center"; g.fillText("MEMORIA", 512, 130); g.shadowBlur = 0; g.fillStyle = "#e8e0cc"; g.font = F(40); g.fillText("EXCHANGE · WE BUY WHAT YOU REMEMBER", 512, 205);
});
const memMarket = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 7, d: 5, h: 3.2, floor: col("#2a2830"), wall: col("#1e1d26"), trim: "#14131a" });
  const steel = col("#8a929c"), top = col("#b8c0ca");
  for (const x of [-1.0, 1.4]) {
    rbox(b, steel, I, x, 0, -0.5, 1.5, 1.0, 0.6, 0.03); rbox(b, top, I, x, 1.0, -0.5, 1.6, 0.04, 0.66, 0.01);
    box(b, glow("mmCounterStrip", () => ({ color: GOLD })), I, x - 0.74, x + 0.74, 0.9, 0.93, -0.18, -0.17);
  }
  // the vial wall: shelves of glowing gold vials behind the counters
  const shelf = col("#3a3644"), vial = glow("mmVialGlow", () => ({ color: GOLD })), vialDim = glow("mmVialDim", () => ({ color: "#b07a2a" }));
  const r = rnd(77);
  for (let row = 0; row < 5; row++) {
    const y = 0.7 + row * 0.42;
    box(b, shelf, I, -3.3, 3.3, y - 0.03, y, -2.45, -2.15);
    for (let x = -3.2; x < 3.2; x += 0.12) if (r() > 0.18) cyl(b, r() > 0.3 ? vial : vialDim, I, x, y, -2.3, 0.03, 0.03, 0.16 + r() * 0.06, 8);
  }
  b.add(new THREE.PlaneGeometry(3.2, 0.8), new THREE.MeshBasicMaterial({ map: boardTex(), toneMapped: false }), new THREE.Matrix4().makeTranslation(0.2, 2.75, -2.1));
  for (const [x, c] of [[-3.47, MAGENTA], [3.47, CYAN]] as const) box(b, glow(`mmNeon${c}`, () => ({ color: c })), I, x - 0.02, x + 0.02, 0.3, 2.9, -1.8, 1.6);
  for (const x of [-1.0, 1.4]) { cyl(b, col("#2a2e38"), I, x, 2.4, -0.5, 0.01, 0.01, 0.8, 6); sph(b, glow("mmLamp", () => ({ color: "#fff0c8" })), I, x, 2.35, -0.5, 0.18, 0.07, 0.18, 14); }
  b.build(root, true);
  return { root, env: { clouds: false }, spots: MARKET_SPOTS, views: MARKET_VIEWS };
};

// ---------------------------------------------------------------- props
/** a memory's light: a warm gold veil held 0.5 m in front of the lens. Variant "drain": on its step the gold drains to
 *  a cold grey (the memory being pulled out and sold); "flood": grey on entry, gold floods in on its step */
const memTintRig = (a: At, v = "gold"): PropRig => {
  const root = rigRoot(a), mat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.24, depthTest: false, depthWrite: false, toneMapped: false });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), mat); m.renderOrder = 9; m.layers.set(NOINK); root.add(m);
  const gold = new THREE.Color(GOLD), grey = new THREE.Color("#4a5060");
  return { root, update: ({ step = 0, camPos }) => {
    const k = Math.max(0, Math.min(1, step)), t = v === "drain" ? k : v === "flood" ? 1 - k : 0;
    mat.color.copy(gold).lerp(grey, t); mat.opacity = 0.24 + 0.3 * t;
    const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos);
  } };
};
/** the MEMORIA holo-ad over the street: a rich couple smiling inside a glowing memory */
const adTex = () => stex("mmAd", 768, 1024, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "rgba(255,200,100,0.75)"); gr.addColorStop(1, "rgba(80,30,90,0.55)"); g.fillStyle = gr; g.fillRect(0, 0, 768, 1024);
  g.fillStyle = "rgba(255,255,255,0.10)"; for (let y = 0; y < 1024; y += 8) g.fillRect(0, y, 768, 2);
  const face = (x: number, y: number, r: number, hair: string) => { g.fillStyle = hair; g.beginPath(); g.arc(x, y - 12, r + 16, Math.PI, 0); g.fill(); g.fillStyle = "#f0d0b4"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke();
    g.lineWidth = 7; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(x + r * 0.35, y - r * 0.05, r * 0.14, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.beginPath(); g.arc(x, y + r * 0.25, r * 0.38, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); };
  g.fillStyle = "rgba(255,240,200,0.5)"; g.beginPath(); g.ellipse(384, 430, 300, 300, 0, 0, Math.PI * 2); g.fill();
  face(290, 440, 110, "#e8c070"); face(480, 420, 115, "#3a2a20");
  g.fillStyle = "#ffffff"; g.font = F(110); g.textAlign = "center"; g.fillText("MEMORIA", 384, 830); g.font = F(42); g.fillText("FEEL A LIFE YOU NEVER LIVED", 384, 900);
});
const adRig = (a: At): PropRig => {
  const root = rigRoot(a); const m = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.0), new THREE.MeshBasicMaterial({ map: adTex(), transparent: true, toneMapped: false, depthWrite: false, side: THREE.DoubleSide }));
  m.layers.set(NOINK); root.add(m); return { root, update: () => undefined };
};

// ---------------------------------------------------------------- inserts (9:16 cards)
type Ins = { n: number; draw: (g: CanvasRenderingContext2D, st: number) => void };
const vig = (g: CanvasRenderingContext2D, a = 0.55) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.3, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
const blob = (g: CanvasRenderingContext2D, pts: [number, number][], fill: string, lw = 10) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fillStyle = fill; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); } };
/** Lumi's face, as she appears inside a memory: silver hair, eyes smiling shut */
const lumiFace = (g: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) => {
  g.save(); g.globalAlpha = alpha;
  g.fillStyle = SILVER; g.beginPath(); g.ellipse(x, y - r * 0.1, r * 1.25, r * 1.3, 0, Math.PI * 0.95, Math.PI * 2.05); g.fill(); g.fillRect(x - r * 1.25, y - r * 0.1, r * 2.5, r * 1.4);
  g.fillStyle = "#f4dccc"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.lineWidth = r * 0.07; g.strokeStyle = INK; g.stroke();
  g.fillStyle = SILVER; g.beginPath(); g.ellipse(x, y - r * 0.7, r * 1.0, r * 0.45, 0, Math.PI, Math.PI * 2); g.fill();
  g.lineWidth = r * 0.06; for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * r * 0.38, y, r * 0.16, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  g.fillStyle = "rgba(255,140,170,0.55)"; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * r * 0.55, y + r * 0.28, r * 0.17, r * 0.09, 0, 0, Math.PI * 2); g.fill(); }
  g.beginPath(); g.arc(x, y + r * 0.3, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  g.restore();
};
/** the vial on the steel counter, held in a hand; glow + a face inside, fading by state */
const vialCard = (g: CanvasRenderingContext2D, face: number, glowK: number) => {
  g.fillStyle = "#0a0a12"; g.fillRect(0, 0, IW, IH);
  const ctr = g.createLinearGradient(0, 980, 0, IH); ctr.addColorStop(0, "#9aa2ac"); ctr.addColorStop(1, "#4a505a"); g.fillStyle = ctr; g.fillRect(0, 980, IW, IH - 980);   // the counter
  g.fillStyle = `rgba(255,200,100,${0.25 * glowK})`; g.beginPath(); g.arc(IW / 2, 620, 330, 0, Math.PI * 2); g.fill();
  // the vial
  g.save(); g.shadowColor = GOLD; g.shadowBlur = 80 * glowK; g.fillStyle = `rgba(255,${180 + 40 * glowK},${80 + 40 * glowK},${0.25 + 0.6 * glowK})`; g.beginPath(); g.roundRect(IW / 2 - 130, 300, 260, 640, 110); g.fill(); g.restore();
  lumiFace(g, IW / 2, 600, 95, face);
  g.lineWidth = 12; g.strokeStyle = "rgba(230,240,255,0.85)"; g.beginPath(); g.roundRect(IW / 2 - 130, 300, 260, 640, 110); g.stroke();
  g.fillStyle = "#3a3f4a"; g.fillRect(IW / 2 - 110, 250, 220, 70); g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(IW / 2 - 110, 250, 220, 70);   // the cap
  g.strokeStyle = "rgba(255,255,255,0.6)"; g.lineWidth = 10; g.beginPath(); g.moveTo(IW / 2 - 85, 380); g.lineTo(IW / 2 - 85, 760); g.stroke();
  // the hand round it
  // the hand round it: a palm and four curled fingers (rounded, overlapping), the thumb across the front
  blob(g, [[90, 1180], [210, 820], [330, 790], [345, 1010], [250, 1190]], "#c9946c");
  for (let k = 0; k < 4; k++) { const y = 690 + k * 72, w = 150 - Math.abs(k - 1.5) * 14; g.fillStyle = "#c9946c"; g.beginPath(); g.roundRect(300, y, w, 66, 33); g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
    g.strokeStyle = "#a8785a"; g.lineWidth = 4; g.beginPath(); g.moveTo(300 + w - 40, y + 14); g.lineTo(300 + w - 40, y + 52); g.stroke(); }
  g.fillStyle = "#c9946c"; g.beginPath(); g.roundRect(250, 900, 230, 70, 35); g.fill(); g.lineWidth = 9; g.strokeStyle = INK; g.stroke();
  vig(g, 0.6);
};
const INSERTS: Record<string, Ins> = {
  // the cold open and the last sale: the vial with Lumi's face, bright, fading, gone
  vialFace: { n: 3, draw: (g, st) => vialCard(g, [1, 0.35, 0][st], [1, 0.75, 0.35][st]) },
  // the machine: a cable at a temple, light pouring into a vial
  extract: { n: 1, draw: (g) => {
    g.fillStyle = "#08080f"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#d9a988"; g.beginPath(); g.ellipse(170, 520, 330, 380, 0, 0, Math.PI * 2); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();   // a head, side on
    g.fillStyle = "#2a2420"; g.beginPath(); g.ellipse(120, 330, 300, 200, -0.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3a3f4a"; g.beginPath(); g.roundRect(440, 470, 70, 70, 14); g.fill(); g.stroke();                                                       // the jack
    g.strokeStyle = GOLD; g.lineWidth = 18; g.shadowColor = GOLD; g.shadowBlur = 40; g.beginPath(); g.moveTo(510, 505); g.bezierCurveTo(650, 520, 620, 860, 560, 980); g.stroke();
    g.fillStyle = "rgba(255,210,120,0.85)"; g.beginPath(); g.roundRect(470, 960, 180, 360, 70); g.fill(); g.shadowBlur = 0;
    g.lineWidth = 9; g.strokeStyle = "rgba(230,240,255,0.85)"; g.beginPath(); g.roundRect(470, 960, 180, 360, 70); g.stroke();
    const r = rnd(5); g.fillStyle = "#fff6d8"; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc(520 + r() * 100, 560 + r() * 400, 3 + r() * 5, 0, Math.PI * 2); g.fill(); }
    vig(g, 0.6);
  } },
  // the medicine: a pale wrist with grey veins, the bottle and its price
  pills: { n: 1, draw: (g) => {
    g.fillStyle = "#0b0c14"; g.fillRect(0, 0, IW, IH);
    blob(g, [[-60, 860], [520, 800], [560, 1060], [-60, 1120]], "#e8dcd8");
    g.strokeStyle = "#7a808c"; g.lineWidth = 7; for (const [y, d] of [[900, 30], [960, -20], [1010, 25]] as const) { g.beginPath(); g.moveTo(40, y); g.bezierCurveTo(200, y + d, 320, y - d, 480, y + d * 0.5); g.stroke(); }
    g.fillStyle = "#c9e8f0"; g.beginPath(); g.roundRect(470, 300, 230, 380, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    g.fillStyle = "#e9edf5"; g.fillRect(470, 250, 230, 80); g.strokeRect(470, 250, 230, 80);
    g.fillStyle = "#ffffff"; g.fillRect(490, 400, 190, 190); g.fillStyle = "#14161e"; g.font = F(34); g.textAlign = "center"; g.fillText("GREYSTOP", 585, 450); g.font = F(24, "normal"); g.fillText("one month", 585, 490);
    g.fillStyle = "#ff3b30"; g.font = F(40); g.fillText("4,000 ¢", 585, 560);
    vig(g, 0.55);
  } },
  // the market's screen: KAI · MEMORIES OF LUMI, counting down by state
  counter: { n: 4, draw: (g, st) => {
    g.fillStyle = "#07070d"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#0f1220"; g.beginPath(); g.roundRect(60, 360, 690, 680, 30); g.fill(); g.lineWidth = 8; g.strokeStyle = "#2a3550"; g.stroke();
    g.textAlign = "center"; g.fillStyle = "#8a9ab8"; g.font = F(34); g.fillText("MEMORIA · SELLER ACCOUNT", IW / 2, 440);
    g.fillStyle = "#e9edf5"; g.font = F(44); g.fillText("KAI", IW / 2, 520); g.fillStyle = "#c9d2e6"; g.font = F(36, "normal"); g.fillText("Memories of: LUMI", IW / 2, 580);
    const n = ["212", "140", "61", "9"][st], warn = st >= 3;
    g.fillStyle = warn ? "#ff5a4e" : GOLD; g.shadowColor = g.fillStyle as string; g.shadowBlur = 40; g.font = "bold 220px 'DejaVu Sans Mono', monospace"; g.fillText(n, IW / 2, 830); g.shadowBlur = 0;
    g.fillStyle = warn ? "#ff9a90" : "#e8d9b0"; g.font = F(34); g.fillText("REMAINING", IW / 2, 920);
    vig(g, 0.5);
  } },
  // the buyer's case: dozens of gold vials
  vialCase: { n: 1, draw: (g) => {
    g.fillStyle = "#0a0a12"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#2a2c36"; g.beginPath(); g.roundRect(60, 420, 690, 640, 30); g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
    g.fillStyle = "#14151c"; g.fillRect(100, 460, 610, 560);
    for (let row = 0; row < 4; row++) for (let c = 0; c < 6; c++) {
      const x = 140 + c * 100, y = 490 + row * 135;
      g.save(); g.shadowColor = GOLD; g.shadowBlur = 25; g.fillStyle = "rgba(255,205,110,0.95)"; g.beginPath(); g.roundRect(x, y, 60, 115, 26); g.fill(); g.restore();
      g.lineWidth = 5; g.strokeStyle = "rgba(230,240,255,0.8)"; g.beginPath(); g.roundRect(x, y, 60, 115, 26); g.stroke();
    }
    vig(g, 0.55);
  } },
  // the end card (silent): the question
  endCard: { n: 1, draw: (g) => {
    g.fillStyle = "#07060d"; g.fillRect(0, 0, IW, IH); g.textAlign = "center";
    g.save(); g.shadowColor = GOLD; g.shadowBlur = 60; g.fillStyle = "rgba(255,205,110,0.9)"; g.beginPath(); g.roundRect(IW / 2 - 70, 330, 140, 300, 60); g.fill(); g.restore();
    lumiFace(g, IW / 2, 470, 42, 0.9);
    g.fillStyle = "#e9edf5"; g.font = F(60); g.fillText("WHAT MEMORY", IW / 2, 790); g.fillText("WOULD YOU", IW / 2, 870); g.fillStyle = GOLD; g.fillText("NEVER SELL?", IW / 2, 950);
    g.fillStyle = "#8b93a5"; g.font = F(36); g.fillText("TELL US IN THE COMMENTS", IW / 2, 1060);
  } },
};
const insertRig = (a: At, v = "vialFace"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.vialFace, texAt = (st: number) => stex(`mmIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(Math.max(0, Math.min(ins.n - 1, Math.ceil(step - 1e-3)))); } };
};

// ---------------------------------------------------------------- hand items
/** a small glowing memory vial */
const vialItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.ell(x + 3 * u * s, y - 12 * u, 9 * u, 9 * u, "#ffe0a0", 0);
  p.poly([[x - 2 * u * s, y + 4 * u], [x + 9 * u * s, y + 4 * u], [x + 9 * u * s, y - 26 * u], [x - 2 * u * s, y - 26 * u]], "#ffc864", 2.4 * u);
  p.poly([[x - 3 * u * s, y - 26 * u], [x + 10 * u * s, y - 26 * u], [x + 10 * u * s, y - 31 * u], [x - 3 * u * s, y - 31 * u]], "#3a3f4a", 2 * u);
};
/** a folded paper star */
const starItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, r = (i % 2 ? 5 : 12) * u; pts.push([x + 4 * u * s + Math.cos(a) * r, y - 12 * u + Math.sin(a) * r]); }
  p.poly(pts, "#ffd86a", 2.2 * u);
};

// ---------------------------------------------------------------- characters
const KAI: Look = { name: "Kai", build: "lanky", skin: "#c9946c", seed: 921, hair: { style: "side", color: "#241e1c" }, top: { style: "hoodie", color: "#3a3f5a", accent: GOLD }, legs: "#1e2029", shoes: "#d8dbe2" };
const LUMI_BASE = { name: "Lumi", build: "petite" as const, seed: 922, hair: { style: "long" as const, color: SILVER }, brow: { color: "#8a8fa0", k: 0.8 }, lashes: true, blush: "#ff9ab0",
  top: { style: "sweater" as const, color: "#cdbfe6" }, legs: "#2a2c3a", shoes: "#e8e4dc" };
const LUMI: Look = { ...LUMI_BASE, skin: "#f4dccc" };
const LUMI_SICK: Look = { ...LUMI_BASE, name: "Lumi (sick)", skin: "#e2d8d6", blush: "#d8c0c4" };
const LUMI_HOOD: Look = { ...LUMI_BASE, name: "Lumi (hooded)", skin: "#f4dccc", hat: { style: "beanie", color: "#2a2c36" }, layer: { style: "longcoat", color: "#2a2c36", accent: "#3a3d48" } };
const BROKER: Look = { name: "The Broker", build: "stout", skin: "#e6c3a5", seed: 923, hair: { style: "receding", color: "#c8c8cc" }, glasses: { style: "round", color: GOLD }, moustache: { style: "thin", color: "#c8c8cc" },
  top: { style: "shirt", color: "#1e1e24" }, layer: { style: "longcoat", color: "#4a1f3a", accent: GOLD }, neck: { style: "bowtie", color: GOLD }, legs: "#1a1a20", shoes: "#111111" };
const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["cyberpunk", "romance", "memory"], tags });

export const MEMORY_THEME: Theme = {
  id: "memory", name: "Memories Are Money (a neon city where you pay with what you remember)",
  desc: "an original cyberpunk love story: the memory exchange (counters, walls of glowing vials), memories in golden light that drain to grey when sold, the MEMORIA holo-ad; reuses the Stop Time city",
  tags: ["cyberpunk", "neon", "memory", "romance", "rain", "sci-fi"],
  mood: "drone",
  ambience: { memMarket: "elb_vault" },
  steps: { memMarket: "step_hard" },
  characters: { kai: KAI, lumi: LUMI, lumiSick: LUMI_SICK, lumiHood: LUMI_HOOD, broker: BROKER },
  characterMeta: {
    kai: meta("Kai", "17; lanky; dark side-swept hair; a navy hoodie with gold trim", "a poor boy who sells his memories of the girl he loves to pay for her medicine", ["teen", "boy", "narrator", "hero"]),
    lumi: meta("Lumi", "17; long silver hair; lashes and blush; a lilac sweater", "folds paper stars, hums songs she makes up, always asks 'Remember me?'", ["teen", "girl", "love"]),
    lumiSick: meta("Lumi (sick)", "Lumi, pale with the grey sickness", "Lumi while she is ill", ["teen", "girl", "sick"]),
    lumiHood: meta("Lumi (hooded)", "Lumi in a dark beanie and long dark coat, hiding her silver hair", "Lumi buying memories in secret", ["teen", "girl", "disguise"]),
    broker: meta("The Broker", "stout; slicked grey hair; round gold glasses; thin moustache; a plum long coat, a gold bow tie", "runs the memory exchange: smooth and cold", ["adult", "male", "dealer", "villain"]),
  },
  items: {
    memVial: { name: "Memory vial", desc: "a small glowing gold vial: a memory, drawn out of someone's head", themes: ["cyberpunk", "memory"], tags: ["vial", "memory", "glow"], draw: vialItem },
    paperStar: { name: "Paper star", desc: "a small folded yellow paper star", themes: ["romance", "craft"], tags: ["star", "paper", "gift"], draw: starItem },
  },
  props: {
    memTint: { name: "Memory light (gold veil)", desc: "a memory's warm golden light, a veil held 0.5 m in front of the lens (put `at` near what the shot looks at). Variants: gold (steady), drain (the gold drains to cold grey on its step: a memory being sold), flood (grey, then gold floods in on its step: memories coming back)", category: "theme", themes: ["memory", "romance"], tags: ["memory", "gold", "tint", "overlay", "flashback"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => memTintRig(a, v ?? "gold"), steps: ["drains / floods"], stepCount: () => 1,
      variants: { gold: () => undefined, drain: () => undefined, flood: () => undefined } },
    memAd: { name: "MEMORIA holo-ad", desc: "a 3 x 4 m glowing holo-ad (a rich couple smiling inside a golden memory; MEMORIA · FEEL A LIFE YOU NEVER LIVED), facing +z (turn with yaw); `at` = its centre", category: "theme", themes: ["cyberpunk", "memory"], tags: ["ad", "holo", "sign", "rich"], radius: 0.1, height: 4,
      build: () => undefined, rig: (a) => adRig(a), steps: [], stepCount: () => 1 },
    mmInsert: { name: "Close insert (Memories)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step. Variants: vialFace (the vial with Lumi's face: bright, fading, gone), extract (the cable at the temple, a vial filling), pills (the grey wrist, GREYSTOP, 4,000 ¢), counter (MEMORIES OF LUMI 212 / 140 / 61 / 9), vialCase (a case of gold vials), endCard (WHAT MEMORY WOULD YOU NEVER SELL?)", category: "theme", themes: ["cyberpunk", "insert"], tags: ["insert", "card", "close-up"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "vialFace"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
  },
  sets: {
    memMarket: { id: "memMarket", title: "The memory exchange: two steel counters, walls of glowing gold vials, the MEMORIA board", lights: ["night", "interiorCool"], build: () => memMarket() },
  },
  layouts: { memMarket: { spots: MARKET_SPOTS, views: MARKET_VIEWS } },
  setMeta: {
    memMarket: { name: "The memory exchange", desc: "7 x 5 m, open toward +z: counter A (x -1.0) and counter B (x 1.4) at z -0.5, brokers behind them; shelves of glowing gold vials on the back wall; the MEMORIA board above; magenta / cyan neon. Spots kai, brokerA, buyer, brokerB, crowd", themes: ["cyberpunk", "memory"], tags: ["market", "shop", "counter", "vials", "neon"] },
  },
};
