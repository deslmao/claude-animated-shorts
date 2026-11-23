// "GTA 6, Explained to Your Girlfriend" theme (productions/gta-gf-1/viewer-script.md, approved by the owner, 23 Nov).
// Gordon and Lucy (characters/miami.ts, our own) in two worlds: "real life" (reused sets: the everyday apartment's living
// room at night, the 4,012 Steps bedroom by day) and "the game" (our own Miami city, rendered in Blender:
// blender/miami/miami.py plate_* places, Poly Haven CC0 textures). No game footage, logos, HUD or characters: the HUD
// here is our own design (a round pastel map, a cash counter).
// New here (additions only):
//   set ggPlate: an empty world where one Blender plate (a level camera, 53.13 deg vertical fov) hangs 30 m away and the
//     engine's cast stands in front of it on an invisible shadow-catching ground; the shot's camera must stand at the
//     plate's camera height (PLATE_CAM) looking level, as the storyboard helper `plateCam` does
//   props ggPlate (the backdrop), ggInsert (9:16 cards: the two phones, the title, the calendar, the view counter, the
//     DELAYED sign, the receipt, the TV screen), ggTV (a TV on a stand, its screen showing the game), ggTvGlow (the TV's
//     flickering blue light), ggHud (our own game HUD over the game shots)
//   items gamepad, fishingRod, basketball
//   characters ggGordon, ggLucy (the Miami cast)
import * as THREE from "three";
import { staticFile } from "remotion";
import { registerPreload } from "../../look/preload";
import type { Theme } from "..";
import type { Pen } from "../../characters/toon";
import { At } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";
import type { SetDef } from "../../sets/types";
import { MIAMI_GORDON, MIAMI_LUCY } from "../../characters/miami";

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
const FS = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const FR = (px: number) => `900 ${px}px 'DejaVu Sans', Arial, sans-serif`;

// ---------------------------------------------------------------- the Blender plates (public/gta/plate_<name>.jpg)
/** each plate's level camera height above the ground the cast stands on (blender/miami/miami.py PLATES) */
export const PLATE_CAM: Record<string, number> = { street: 1.75, pier: 1.6, motel: 1.6, sunset: 1.6 };
export const PLATE_FOV = 53.13, PLATE_D = 30;
/** the prop's `at` is the ground point 10 m in front of the plate's camera (so the frame checks see it) */
const PLATE_AT = 10;
const images = new Map<string, THREE.Texture>();
/** a JPG from public/, loaded before the first frame (look/preload.ts); in Node (floor maps, tests) an empty texture */
const imageTex = (file: string) => {
  let t = images.get(file);
  if (t) return t;
  t = new THREE.Texture(); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; images.set(file, t);
  if (typeof Image !== "undefined") {
    const img = new Image(), tx = t;
    registerPreload(new Promise<void>((res) => { img.onload = () => { tx.image = img; tx.needsUpdate = true; res(); }; img.onerror = () => { console.error("missing", file); res(); }; }));
    img.src = staticFile(file);
  }
  return t;
};
for (const p of Object.keys(PLATE_CAM)) imageTex(`gta/plate_${p}.jpg`);
/** the backdrop: the plate on a plane 30 m down -z from a level camera at (0, PLATE_CAM, 0), 1.3x the frustum so a
 *  creeping camera never sees its edge; a ground plane that only catches the cast's shadows */
const plateRig = (a: At, v = "street"): PropRig => {
  const root = rigRoot({ ...a, s: 1 }), H = PLATE_CAM[v] ?? 1.6, h = 2 * PLATE_D * Math.tan((PLATE_FOV * Math.PI) / 360), k = 1.3;
  const m = new THREE.Mesh(new THREE.PlaneGeometry((h * 9) / 16 * k, h * k), new THREE.MeshBasicMaterial({ map: imageTex(`gta/plate_${v}.jpg`), toneMapped: false, fog: false }));
  // the plate's centre is its camera's level line; scaled about it, so the horizon stays put
  m.position.set(0, H, -PLATE_D + PLATE_AT); m.layers.set(NOINK); m.renderOrder = -5; root.add(m);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60).rotateX(-Math.PI / 2), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.position.set(0, 0.002, 0); ground.receiveShadow = true; ground.layers.set(NOINK); root.add(ground);
  return { root, update: () => undefined };
};
const PLATE_SPOTS: Record<string, [number, number, number]> = { mark: [0, 0, -4.5], near: [0, 0, -3.2], far: [0, 0, -7] };
const PLATE_VIEWS = [{ name: "plate", pos: [0, 1.6, 0] as [number, number, number], look: [0, 1.6, -10] as [number, number, number], fov: PLATE_FOV }];
const plateSet: SetDef = {
  id: "ggPlate", title: "The game world (GTA GF): an empty stage in front of a Blender plate (use the ggPlate prop)", lights: ["day", "golden"],
  build: () => ({ root: new THREE.Group(), env: { clouds: false, sky: false }, spots: PLATE_SPOTS, views: PLATE_VIEWS }),
};

// ---------------------------------------------------------------- inserts (9:16 cards)
type Ins = { n: number; loop?: boolean; draw: (g: CanvasRenderingContext2D, st: number) => void };
const vig = (g: CanvasRenderingContext2D, a = 0.4) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.35, IW / 2, IH / 2, IH * 0.78); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
/** a little smiley drawn by hand (no emoji font on the render machines) */
const smiley = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  g.fillStyle = "#ffd23f"; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#3a2a10"; g.lineWidth = r * 0.14; g.stroke();
  g.fillStyle = "#3a2a10"; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.2, r * 0.12, 0, Math.PI * 2); g.arc(x + r * 0.35, y - r * 0.2, r * 0.12, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(x, y + r * 0.05, r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
};
const bubble = (g: CanvasRenderingContext2D, text: string, mine: boolean, y: number, smile = false, alpha = 1) => {
  g.save(); g.globalAlpha = alpha; g.font = FS(54);
  const tw = g.measureText(text).width + (smile ? 74 : 0), w = tw + 80, h = 104, x = mine ? IW - 110 - w : 110;
  g.fillStyle = mine ? "#2f8cff" : "#e7e8ee"; g.beginPath(); g.roundRect(x, y, w, h, 50); g.fill();
  g.fillStyle = mine ? "#ffffff" : "#15161c"; g.textBaseline = "middle"; g.textAlign = "left"; g.fillText(text, x + 40, y + h / 2 + 2);
  if (smile) smiley(g, x + 40 + tw - 34, y + h / 2, 26);
  g.restore(); return [x, y + h] as const;
};
/** a phone chat, full screen. mine = the first message (sent by the phone's owner); clock: the status-bar time;
 *  reply: the other one's reply (null = none yet); typing = the input box still holds the message */
const chat = (g: CanvasRenderingContext2D, o: { who: string; mine: string; smile: boolean; clock: string; delivered: string | null; reply: boolean; typing: boolean; ring?: number }) => {
  g.fillStyle = "#0e0f14"; g.fillRect(0, 0, IW, IH);
  g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(28, 28, IW - 56, IH - 56, 70); g.fill();
  g.save(); g.beginPath(); g.roundRect(28, 28, IW - 56, IH - 56, 70); g.clip();
  // the status bar: the time (big, so the jump reads) and the battery, below the frame-0 banner
  g.fillStyle = "#15161c"; g.font = FS(64); g.textAlign = "left"; g.textBaseline = "middle"; g.fillText(o.clock, 110, 420);
  g.strokeStyle = "#15161c"; g.lineWidth = 4; g.strokeRect(IW - 200, 402, 80, 34); g.fillRect(IW - 120, 412, 8, 14);
  g.fillStyle = o.clock.startsWith("9") ? "#e5484d" : "#30c060"; g.fillRect(IW - 196, 406, o.clock.startsWith("9") ? 18 : 60, 26);
  // the contact, small
  g.fillStyle = o.who === "Gordon" ? "#2fb5a7" : "#f29ac0"; g.beginPath(); g.arc(IW / 2 - 70, 500, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#15161c"; g.font = FS(36); g.textAlign = "left"; g.fillText(o.who, IW / 2 - 36, 502);
  g.fillStyle = "#d9dbe3"; g.fillRect(60, 545, IW - 120, 3);
  // the thread (kept above the caption band, ~y 950-1110 on the card)
  let y = 580;
  if (!o.typing) {
    const [, b] = bubble(g, o.mine, true, y, o.smile); y = b + 10;
    if (o.delivered) { g.fillStyle = "#8a8d99"; g.font = FS(30, "normal"); g.textAlign = "right"; g.fillText(`Delivered ${o.delivered}`, IW - 120, y + 14); y += 46; }
  }
  if (o.reply) { y += 24; bubble(g, "sorry. gta", false, y); }
  // the input box
  g.fillStyle = "#f3f4f7"; g.fillRect(0, IH - 260, IW, 232); g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(100, IH - 230, IW - 260, 96, 48); g.fill();
  g.strokeStyle = "#d0d3dc"; g.lineWidth = 3; g.stroke();
  g.fillStyle = o.typing ? "#15161c" : "#a6a9b4"; g.font = FS(46, "normal"); g.textAlign = "left";
  g.fillText(o.typing ? o.mine + "|" : "Message", 140, IH - 180);
  if (o.typing && o.smile) smiley(g, 140 + g.measureText(o.mine).width + 34, IH - 182, 24);
  g.fillStyle = "#2f8cff"; g.beginPath(); g.arc(IW - 125, IH - 182, 44, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(IW - 142, IH - 200); g.lineTo(IW - 104, IH - 182); g.lineTo(IW - 142, IH - 164); g.closePath(); g.fill();
  g.restore();
  // a buzz ring round the phone (the reply arriving)
  if (o.ring) { g.strokeStyle = `rgba(47,140,255,${0.5 * o.ring})`; g.lineWidth = 16; g.beginPath(); g.roundRect(14, 14, IW - 28, IH - 28, 80); g.stroke(); }
};
/** the two phones: 0 typing, 1 sent (3:02 PM), 2-5 the clock racing on, 6 9:14 PM and the reply */
const CLOCKS = ["3:02 PM", "3:02 PM", "4:17 PM", "5:40 PM", "7:03 PM", "8:26 PM", "9:14 PM"];
const phoneIns = (who: string, mine: string, smile: boolean): Ins => ({ n: 7, draw: (g, st) => chat(g, { who, mine, smile, clock: CLOCKS[st], delivered: st >= 1 ? "3:02 PM" : null, reply: st >= 6, typing: st === 0, ring: st >= 6 ? 1 : 0 }) });

/** the title card: Miami sunset stripes, our own lettering */
const titleCard = (g: CanvasRenderingContext2D) => {
  const gr = g.createLinearGradient(0, 0, 0, IH); gr.addColorStop(0, "#2b1055"); gr.addColorStop(0.55, "#d53a9d"); gr.addColorStop(1, "#ff9e5e"); g.fillStyle = gr; g.fillRect(0, 0, IW, IH);
  g.fillStyle = "#ffe27a"; g.beginPath(); g.arc(IW / 2, IH * 0.62, 230, Math.PI, 0); g.fill();
  g.fillStyle = "#ff9e5e"; for (let i = 0; i < 6; i++) g.fillRect(IW / 2 - 240, IH * 0.62 - 30 - i * 34, 480, 8 + i * 1.5);
  g.fillStyle = "#1b0f2e"; g.fillRect(0, IH * 0.62, IW, IH);
  // palm silhouettes
  const palmS = (x: number, s: number) => { g.strokeStyle = "#1b0f2e"; g.lineWidth = 16 * s; g.beginPath(); g.moveTo(x, IH * 0.62); g.quadraticCurveTo(x + 30 * s, IH * 0.62 - 220 * s, x + 10 * s, IH * 0.62 - 380 * s); g.stroke();
    g.fillStyle = "#1b0f2e"; for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.48; g.beginPath(); g.ellipse(x + 10 * s + Math.cos(a) * 80 * s, IH * 0.62 - 380 * s + Math.sin(a) * 40 * s + 30 * s, 100 * s, 16 * s, a, 0, Math.PI * 2); g.fill(); } };
  palmS(110, 1.1); palmS(IW - 130, 0.9);
  const hz = IH * 0.62; g.strokeStyle = "rgba(255,79,163,0.85)"; g.lineWidth = 4;
  for (let i = 1; i < 14; i++) { const y = hz + (IH - hz) * Math.pow(i / 13, 1.8); g.beginPath(); g.moveTo(0, y); g.lineTo(IW, y); g.stroke(); }
  for (let i = -10; i <= 10; i++) { g.beginPath(); g.moveTo(IW / 2 + i * 30, hz); g.lineTo(IW / 2 + i * 190, IH); g.stroke(); }
  g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.strokeStyle = "#1b0f2e"; g.lineWidth = 22; g.fillStyle = "#ffffff";
  g.font = FR(170); g.strokeText("GTA 6", IW / 2, 300); g.fillStyle = "#3ff0e0"; g.fillText("GTA 6", IW / 2, 300);
  g.font = FR(64); g.fillStyle = "#ffffff"; g.lineWidth = 14;
  for (const [t, y] of [["EXPLAINED TO", 450], ["YOUR GIRLFRIEND", 540]] as const) { g.strokeText(t, IW / 2, y); g.fillText(t, IW / 2, y); }
  g.font = FR(52); g.fillStyle = "#ffe27a"; g.lineWidth = 12; g.strokeText("EP 1", IW / 2, 650); g.fillText("EP 1", IW / 2, 650);
};
/** a desk calendar's big year, flipping on: 2013 ... 2026 (14 states) */
const calendar = (g: CanvasRenderingContext2D, st: number) => {
  g.fillStyle = "#f2e7d3"; g.fillRect(0, 0, IW, IH);
  g.fillStyle = "#e6d6bb"; for (let y = 0; y < IH; y += 46) g.fillRect(0, y, IW, 2);
  const yr = 2013 + st;
  g.save(); g.translate(IW / 2, IH * 0.4); g.rotate(-0.03);
  g.fillStyle = "rgba(0,0,0,0.18)"; g.beginPath(); g.roundRect(-300, -330, 620, 700, 30); g.fill();
  g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(-310, -350, 620, 700, 30); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  g.fillStyle = yr === 2026 ? "#ff4fa3" : "#e5484d"; g.beginPath(); g.roundRect(-310, -350, 620, 170, [30, 30, 0, 0]); g.fill(); g.stroke();
  g.fillStyle = "#ffffff"; g.font = FS(70); g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(yr === 2013 ? "SEPTEMBER" : yr === 2026 ? "NOVEMBER" : "YEAR", 0, -265);
  g.fillStyle = INK; g.font = FR(220); g.fillText(String(yr), 0, 20);
  g.font = FS(46, "normal"); g.fillStyle = "#6b6f7a"; g.fillText(yr === 2013 ? "the last one comes out" : yr === 2026 ? "finally" : "still waiting…", 0, 230);
  for (let k = -2; k <= 2; k++) { g.fillStyle = "#cfd2da"; g.beginPath(); g.arc(k * 110, -350, 22, 0, Math.PI * 2); g.fill(); g.stroke(); }
  g.restore();
  // the years already torn off, scattered
  for (let k = 0; k < Math.min(st, 9); k++) { g.save(); g.translate(120 + ((k * 211) % 600), IH - 120 + ((k * 53) % 60)); g.rotate(((k * 37) % 60 - 30) / 50); g.fillStyle = "#ffffff"; g.fillRect(-90, -60, 180, 120); g.strokeStyle = "#b9bcc6"; g.lineWidth = 3; g.strokeRect(-90, -60, 180, 120); g.fillStyle = "#8a8d99"; g.font = FS(40); g.textAlign = "center"; g.fillText(String(2013 + k), 0, 10); g.restore(); }
  vig(g, 0.3);
};
/** a video's view counter racing up to 90,000,000 in 24 hours (16 states) */
const VIEWS = [0, 312, 4100, 52000, 390000, 1200000, 4800000, 11000000, 19000000, 30000000, 42000000, 55000000, 66000000, 77000000, 85000000, 90000000];
const views = (g: CanvasRenderingContext2D, st: number) => {
  g.fillStyle = "#0f0f13"; g.fillRect(0, 0, IW, IH);
  // the video player: a sunset thumbnail of our own (a palm and a pink sky), a play button
  const gr = g.createLinearGradient(0, 220, 0, 680); gr.addColorStop(0, "#ff7eb6"); gr.addColorStop(1, "#ffb347"); g.fillStyle = gr; g.fillRect(40, 220, IW - 80, 440);
  g.fillStyle = "#3a1d4a"; g.fillRect(40, 580, IW - 80, 80);
  g.strokeStyle = "#3a1d4a"; g.lineWidth = 12; g.beginPath(); g.moveTo(600, 600); g.quadraticCurveTo(620, 420, 590, 330); g.stroke();
  g.fillStyle = "#3a1d4a"; for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.5; g.beginPath(); g.ellipse(590 + Math.cos(a) * 60, 345 + Math.sin(a) * 26, 76, 13, a, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = "rgba(0,0,0,0.55)"; g.beginPath(); g.arc(IW / 2, 440, 70, 0, Math.PI * 2); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(IW / 2 - 22, 404); g.lineTo(IW / 2 + 36, 440); g.lineTo(IW / 2 - 22, 476); g.closePath(); g.fill();
  g.fillStyle = "#ffffff"; g.font = FS(46); g.textAlign = "left"; g.fillText("Trailer 1", 50, 715);
  // the counter, huge
  const n = VIEWS[Math.min(st, VIEWS.length - 1)];
  g.textAlign = "center"; g.fillStyle = "#ffffff"; const txt = n.toLocaleString("en-US"); g.font = FR(110); const k = Math.min(1, 660 / g.measureText(txt).width); g.font = FR(Math.floor(110 * k)); g.fillText(txt, IW / 2, 790);
  g.fillStyle = "#b8bbc6"; g.font = FS(54); g.fillText("views", IW / 2, 870);
  // the 24 HOURS badge and a clock hand going round
  g.fillStyle = "#e5484d"; g.beginPath(); g.roundRect(IW / 2 - 190, 1140, 380, 100, 50); g.fill(); g.fillStyle = "#ffffff"; g.font = FR(56); g.fillText("24 HOURS", IW / 2, 1192);
  const a = (st / 15) * Math.PI * 2 - Math.PI / 2; g.strokeStyle = "#ffffff"; g.lineWidth = 6; g.beginPath(); g.arc(IW / 2, 1330, 50, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(IW / 2, 1330); g.lineTo(IW / 2 + Math.cos(a) * 40, 1330 + Math.sin(a) * 40); g.stroke();
  if (st >= 15) { g.save(); g.translate(IW / 2, 600); g.rotate(-0.12); g.fillStyle = "#ffe27a"; g.beginPath(); g.roundRect(-250, -60, 500, 120, 20); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.fillStyle = INK; g.font = FR(62); g.fillText("NEW RECORD", 0, 4); g.restore(); }
};
/** a COMING SOON poster stamped DELAYED, then DELAYED again (0, 1, 2) */
const delayed = (g: CanvasRenderingContext2D, st: number) => {
  g.fillStyle = "#3b2f4a"; g.fillRect(0, 0, IW, IH);
  for (let x = 0; x < IW; x += 90) { g.fillStyle = "#43365a"; g.fillRect(x, 0, 44, IH); }
  g.save(); g.translate(IW / 2, IH / 2); g.rotate(0.02);
  const gr = g.createLinearGradient(0, -520, 0, 520); gr.addColorStop(0, "#ff7eb6"); gr.addColorStop(1, "#ffb347"); g.fillStyle = gr; g.fillRect(-300, -520, 600, 1040);
  g.strokeStyle = "#ffffff"; g.lineWidth = 14; g.strokeRect(-300, -520, 600, 1040);
  g.fillStyle = "#1b0f2e"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = FR(110); g.fillText("GTA 6", 0, -330);
  g.font = FR(78); g.fillStyle = "#ffffff"; g.fillText("COMING", 0, -150); g.fillText("SOON", 0, -60);
  g.font = FS(50); g.fillStyle = "#1b0f2e"; g.fillText(st >= 2 ? "NOV 2026" : st >= 1 ? "MAY 2026" : "2025", 0, 120);
  g.restore();
  const stamp = (y: number, rot: number) => { g.save(); g.translate(IW / 2, y); g.rotate(rot); g.strokeStyle = "#e01e37"; g.fillStyle = "#e01e37"; g.lineWidth = 14; g.strokeRect(-280, -80, 560, 160); g.font = FR(120); g.textAlign = "center"; g.textBaseline = "middle"; g.globalAlpha = 0.92; g.fillText("DELAYED", 0, 6); g.restore(); };
  if (st >= 1) stamp(IH * 0.52, -0.18);
  if (st >= 2) stamp(IH * 0.7, 0.14);
};
/** a till receipt printing longer and longer: the total, $1,840,000,000 (estimated), at the last state (0..9) */
const receipt = (g: CanvasRenderingContext2D, st: number) => {
  g.fillStyle = "#1e2a2f"; g.fillRect(0, 0, IW, IH);
  // the till's slot at the bottom; the paper rises out of it and runs off the top of the card
  const x0 = IW / 2 - 240, w = 480, bottom = 1200;
  g.fillStyle = "#fbfaf4"; g.fillRect(x0, 0, w, bottom);
  g.fillStyle = "#2c3a40"; g.beginPath(); g.roundRect(IW / 2 - 320, bottom - 10, 640, 150, 24); g.fill();
  g.fillStyle = "#10181b"; g.fillRect(IW / 2 - 260, bottom - 4, 520, 14);
  g.fillStyle = "#2a2a2a"; g.font = FS(30, "normal"); g.textAlign = "left"; g.textBaseline = "middle";
  const rows = 6 + st * 4, lineH = 40, area = st >= 9 ? 560 : 1120;
  for (let i = 0; i < rows; i++) {
    const y = area - (rows - 1 - i) * lineH;                         // the newest line just above the slot (or the total)
    if (y < 30) continue;
    g.textAlign = "left"; g.fillText("GTA 6", x0 + 34, y); g.textAlign = "right"; g.fillText("$69.99", x0 + w - 34, y);
  }
  if (st >= 9) {
    g.fillStyle = "#2a2a2a"; g.fillRect(x0 + 24, 610, w - 48, 4);
    g.font = FS(34); g.textAlign = "center"; g.fillText("TOTAL (estimated)", IW / 2, 670);
    g.font = FR(46); g.fillStyle = "#0a7a3a"; g.fillText("$1,840,000,000", IW / 2, 760);
    g.font = FS(28, "normal"); g.fillStyle = "#6b6f7a"; g.fillText("by launch day", IW / 2, 830);
  }
  vig(g, 0.35);
};
/** the TV screen in close-up: the game's street (the plate) in a bezel, our own HUD on it */
const tvScreen = (g: CanvasRenderingContext2D) => {
  g.fillStyle = "#08090c"; g.fillRect(0, 0, IW, IH);
  g.fillStyle = "#16181e"; g.beginPath(); g.roundRect(30, 30, IW - 60, IH - 60, 20); g.fill();
};
const INSERTS: Record<string, Ins> = {
  textLucy: phoneIns("Gordon", "hey", true),
  textGordon: phoneIns("Lucy", "hey?", false),
  title: { n: 1, draw: (g) => titleCard(g) },
  calendar: { n: 14, draw: (g, st) => calendar(g, st) },
  views: { n: VIEWS.length, draw: (g, st) => views(g, st) },
  delayed: { n: 3, draw: (g, st) => delayed(g, st) },
  receipt: { n: 10, draw: (g, st) => receipt(g, st) },
};
const insertRig = (a: At, v = "textLucy"): PropRig => {
  const root = rigRoot(a);
  if (v === "tv") {
    // the TV in close-up: the street plate inside a dark bezel, with our HUD
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: stex("ggTvBezel", IW, IH, tvScreen), toneMapped: false })); back.layers.set(NOINK); root.add(back);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.92), new THREE.MeshBasicMaterial({ map: imageTex("gta/plate_street.jpg"), toneMapped: false })); scr.position.z = 0.001; scr.layers.set(NOINK); root.add(scr);
    const hud = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.92), new THREE.MeshBasicMaterial({ map: hudTex(), transparent: true, depthWrite: false, toneMapped: false })); hud.position.z = 0.002; hud.layers.set(NOINK); root.add(hud);
    return { root, update: () => undefined };
  }
  const ins = INSERTS[v] ?? INSERTS.textLucy, texAt = (st: number) => stex(`ggIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => {
    const k = Math.max(0, Math.ceil(step - 1e-3)), st = ins.loop ? k % ins.n : Math.min(ins.n - 1, k);
    (m.material as THREE.MeshBasicMaterial).map = texAt(st);
  } };
};

// ---------------------------------------------------------------- our own game HUD
/** a round pastel street map (bottom left) with a pink arrow, a cash counter (top right); nothing from any real game */
const hudTex = () => stex("ggHud", IW, IH, (g) => {
  g.clearRect(0, 0, IW, IH);
  const cx = 115, cy = IH - 125, r = 78;
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
  g.fillStyle = "rgba(40,170,180,0.85)"; g.fillRect(cx - r, cy - r, r * 2, r * 2);
  g.fillStyle = "rgba(255,226,170,0.9)"; g.fillRect(cx - r, cy - 20, r * 2, 40); g.fillRect(cx + 10, cy - r, 34, r * 2); g.fillRect(cx - 80, cy + 40, 30, 80);
  g.fillStyle = "rgba(255,159,207,0.9)"; g.fillRect(cx - 70, cy - 80, 50, 40); g.fillRect(cx + 50, cy + 30, 40, 50);
  g.restore();
  g.strokeStyle = "rgba(255,255,255,0.95)"; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#ff3d9a"; g.strokeStyle = "#ffffff"; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy - 26); g.lineTo(cx + 18, cy + 18); g.lineTo(cx, cy + 8); g.lineTo(cx - 18, cy + 18); g.closePath(); g.fill(); g.stroke();
  g.font = FR(58); g.textAlign = "right"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineWidth = 10; g.strokeStyle = "rgba(10,20,30,0.9)"; g.fillStyle = "#7dffa8";
  g.strokeText("$1,240", IW - 50, IH - 150); g.fillText("$1,240", IW - 50, IH - 150);
});
/** the HUD laid over a game shot: square to the lens, 0.5 m out, sized to the shot's vertical fov (`scale` = fov / 100) */
const hudRig = (a: At): PropRig => {
  const fov = (a.s ?? 0.53) * 100, root = rigRoot({ ...a, s: 1 }), h = 2 * 0.5 * Math.tan((fov * Math.PI) / 360), w = (h * 9) / 16;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: hudTex(), transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
  m.renderOrder = 11; m.layers.set(NOINK); root.add(m);
  return { root, update: ({ camPos }) => { const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos); } };
};

// ---------------------------------------------------------------- the TV and its light (the apartment)
/** a flat TV on a low stand, facing -z toward the sofa by default (`yaw` turns it); its screen shows the game street */
const tvRig = (a: At): PropRig => {
  const root = rigRoot(a), dark = new THREE.MeshLambertMaterial({ color: "#1d1f26" }), wood = new THREE.MeshLambertMaterial({ color: "#8a5a3a" });
  const stand = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.42), wood); stand.position.y = 0.225; root.add(stand);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.74, 0.05), dark); body.position.set(0, 0.45 + 0.08 + 0.37, 0); root.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.68), new THREE.MeshBasicMaterial({ map: imageTex("gta/plate_sunset.jpg"), toneMapped: false }));
  // the 9:16 plate cropped to the 16:9 screen (its middle band)
  const t = (scr.material as THREE.MeshBasicMaterial).map!.clone(); t.repeat.set(1, 0.316); t.offset.set(0, 0.34); t.needsUpdate = true; (scr.material as THREE.MeshBasicMaterial).map = t;
  scr.position.set(0, 0.9, -0.027); scr.rotation.y = Math.PI; scr.layers.set(NOINK); root.add(scr);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 0.2), dark); leg.position.set(0, 0.49, 0); root.add(leg);
  return { root, update: () => undefined };
};
/** the TV's flickering cool light on whoever faces it (a point light at `at`) */
const tvGlowRig = (a: At): PropRig => {
  const root = rigRoot({ ...a, s: 1 }), L = new THREE.PointLight("#7fb6ff", 1.6 * (a.s ?? 1), 5, 1.6); root.add(L);
  // the flicker runs on the prop's steps (give it a step every ~0.3 s): the fractional step is the time between them
  return { root, update: ({ step = 0 }) => { L.intensity = (1.4 + 0.35 * Math.sin(step * 4.1) + 0.25 * Math.sin(step * 11.3)) * (a.s ?? 1); } };
};

// ---------------------------------------------------------------- the grade: one light for the characters and the set
// The cast are drawn cards that scene lights don't reach, so the light of a place is laid over the whole frame: a
// multiply layer (the colour of the light, darker at the edges) and an additive glow from where the light comes from.
const gradeTex = (key: string, mul: [string, string], glow: { x: number; y: number; r: number; col: string }) => [
  stex(`ggGradeM_${key}`, 270, 480, (g) => { const v = g.createRadialGradient(135, 270, 40, 135, 240, 330); v.addColorStop(0, mul[0]); v.addColorStop(1, mul[1]); g.fillStyle = v; g.fillRect(0, 0, 270, 480); }),
  stex(`ggGradeA_${key}`, 270, 480, (g) => { g.clearRect(0, 0, 270, 480); const v = g.createRadialGradient(glow.x * 270, glow.y * 480, 0, glow.x * 270, glow.y * 480, glow.r * 480); v.addColorStop(0, glow.col); v.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = v; g.fillRect(0, 0, 270, 480); }),
];
const GRADES: Record<string, () => THREE.Texture[]> = {
  // the flat at night: a cool blue cast, the TV's glow from below the frame, warm lamp-light kept in the middle
  tv: () => gradeTex("tv", ["#d9e4ff", "#5d6f9e"], { x: 0.5, y: 1.05, r: 0.75, col: "rgba(90,150,255,0.55)" }),
  // the sunset road: warm from the right, the shadows violet
  sunset: () => gradeTex("sunset", ["#ffe6cc", "#b78aa8"], { x: 0.95, y: 0.35, r: 0.7, col: "rgba(255,150,70,0.45)" }),
  // a sunny day in the game: a touch of warmth, a soft vignette
  day: () => gradeTex("day", ["#fff8ec", "#d8c9b8"], { x: 0.8, y: 0.1, r: 0.6, col: "rgba(255,230,180,0.25)" }),
  // the bedroom by day: warm window light from the left
  room: () => gradeTex("room", ["#fff6e6", "#cdb8a0"], { x: 0.05, y: 0.3, r: 0.8, col: "rgba(255,220,160,0.35)" }),
};
const gradeRig = (a: At, v = "tv"): PropRig => {
  const fov = (a.s ?? 0.46) * 100, root = rigRoot({ ...a, s: 1 }), h = 2 * 0.5 * Math.tan((fov * Math.PI) / 360) * 1.2, w = (h * 9) / 16;
  const [mt, at] = (GRADES[v] ?? GRADES.tv)();
  const mm = new THREE.MeshBasicMaterial({ map: mt, blending: THREE.MultiplyBlending, premultipliedAlpha: true, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  const am = new THREE.MeshBasicMaterial({ map: at, blending: THREE.AdditiveBlending, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
  const m1 = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mm), m2 = new THREE.Mesh(new THREE.PlaneGeometry(w, h), am);
  m1.renderOrder = 9; m2.renderOrder = 9; m1.layers.set(NOINK); m2.layers.set(NOINK); root.add(m1, m2);
  return { root, update: ({ step = 0, camPos }) => {
    const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5);
    for (const m of [m1, m2]) { m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos); }
    // the TV flickers (a step every ~0.3 s drives it)
    if (v === "tv") am.opacity = 0.75 + 0.2 * Math.sin(step * 4.1) + 0.1 * Math.sin(step * 11.3);
  } };
};
/** a soft contact shadow on the game's ground under a character's feet */
const shadowRig = (a: At): PropRig => {
  const root = rigRoot(a), t = stex("ggShadow", 128, 128, (g) => { const v = g.createRadialGradient(64, 64, 4, 64, 64, 62); v.addColorStop(0, "rgba(20,14,30,0.55)"); v.addColorStop(1, "rgba(20,14,30,0)"); g.fillStyle = v; g.fillRect(0, 0, 128, 128); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.y = 0.01 - (a.y ?? 0); m.renderOrder = -1; m.layers.set(NOINK); root.add(m);
  return { root, update: () => undefined };
};

// ---------------------------------------------------------------- items
const gamepad = (p: Pen, x: number, y: number, u: number, s: number) => {
  // a dark controller held in front of the chest: the body, two grips, two sticks, four pastel buttons
  p.poly([[x - 26 * u, y - 14 * u], [x + 26 * u, y - 14 * u], [x + 34 * u, y + 10 * u], [x + 22 * u, y + 16 * u], [x + 10 * u, y + 4 * u], [x - 10 * u, y + 4 * u], [x - 22 * u, y + 16 * u], [x - 34 * u, y + 10 * u]], "#2a2d38", 3 * u);
  p.dot(x - 13 * u * s, y - 4 * u, 4 * u, "#8a8f9e"); p.dot(x + 8 * u * s, y + 0 * u, 4 * u, "#8a8f9e");
  p.dot(x + 20 * u * s, y - 8 * u, 2.6 * u, "#3ff0e0"); p.dot(x + 25 * u * s, y - 4 * u, 2.6 * u, "#ff6fa8"); p.dot(x + 15 * u * s, y - 4 * u, 2.6 * u, "#ffd24a"); p.dot(x + 20 * u * s, y + 0 * u, 2.6 * u, "#7aa2ff");
};
const fishingRod = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.stroke([[x, y], [x + 70 * u * s, y - 120 * u]], 3.2 * u, "#3a2a1a");
  p.stroke([[x + 70 * u * s, y - 120 * u], [x + 100 * u * s, y - 40 * u]], 1.0 * u, "#e8e8e8");
  p.ell(x + 6 * u * s, y - 8 * u, 6 * u, 6 * u, "#c9ccd6", 1.6 * u);
};
const basketball = (p: Pen, x: number, y: number, u: number) => {
  p.ell(x, y - 12 * u, 14 * u, 14 * u, "#ff8a2a", 3 * u);
  p.stroke([[x - 14 * u, y - 12 * u], [x + 14 * u, y - 12 * u]], 1.6 * u); p.stroke([[x, y - 26 * u], [x, y + 2 * u]], 1.6 * u);
};

const meta = (name: string, desc: string, personality: string, tags: string[]) => ({ name, desc, personality, themes: ["comedy", "gaming", "miami"], tags });
export const GTAGF_THEME: Theme = {
  id: "gtagf", name: "GTA 6, Explained to Your Girlfriend (Gordon and Lucy)",
  desc: "a couple's comedy explainer: Gordon (a gamer in a backwards snapback and palm-print shirt) and Lucy (big curls, a cap, a pink denim jacket); real life in the apartment at night with the TV, and the game: our own Miami city as Blender plates the cast stands in front of, with our own HUD; phone chats, a calendar, a view counter, a DELAYED poster, a receipt",
  tags: ["comedy", "gaming", "couple", "miami", "explainer"],
  mood: "playful",
  characters: { ggGordon: MIAMI_GORDON, ggLucy: MIAMI_LUCY },
  characterMeta: {
    ggGordon: meta("Gordon", "a backwards teal snapback, pink-sheen shades, an open coral palm-print shirt over a white tee, cream trousers", "glued to GTA 6; dramatic about it", ["boyfriend", "gamer", "adult"]),
    ggLucy: meta("Lucy", "big dark curls under a white cap, a pink denim jacket over a yellow tee, dark jeans", "dry and unimpressed, then hooked", ["girlfriend", "adult"]),
  },
  items: {
    gamepad: { name: "Game controller", desc: "a dark game controller with pastel buttons, held in both hands", themes: ["gaming"], tags: ["controller", "gamepad", "console"], draw: gamepad },
    fishingRod: { name: "Fishing rod", desc: "a rod with its line out", themes: ["outdoor"], tags: ["fishing", "rod"], draw: fishingRod },
    basketball: { name: "Basketball", desc: "an orange basketball", themes: ["sport"], tags: ["basketball", "ball"], draw: (p, x, y, u) => basketball(p, x, y, u) },
  },
  props: {
    ggPlate: { name: "Game plate (Blender backdrop)", desc: "on the ggPlate set: the Blender plate of our Miami city 30 m down -z from a level camera at (x, PLATE_CAM, 0) (street 1.75, pier / motel / sunset 1.6), with a ground that catches the cast's shadows; `at` = [x, 0, -10], the ground point 10 m in front of that camera. Variants: street, pier, motel, sunset", category: "theme", themes: ["miami", "game"], tags: ["backdrop", "plate", "blender"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => plateRig(a, v ?? "street"), steps: [], stepCount: () => 1, variants: { street: () => undefined, pier: () => undefined, motel: () => undefined, sunset: () => undefined } },
    ggInsert: { name: "Close insert (GTA GF)", desc: "an upright 9:16 card (0.54 x 0.96 m, facing +z; an `at` camera 1.0 m in front at fov 51 sees only it), a state per step. Variants: textLucy (Lucy's phone: 'hey :)' typed, sent at 3:02 PM, the clock racing to 9:14 PM, the reply 'sorry. gta'; 7 states), textGordon (the same from Gordon's phone, 'hey?'), title (GTA 6 EXPLAINED TO YOUR GIRLFRIEND · EP 1), calendar (2013 → 2026, 14 states), views (a counter racing to 90,000,000 in 24 hours, 16 states), delayed (COMING SOON, then DELAYED, then DELAYED again), receipt (printing longer; the total $1,840,000,000 est. on state 9), tv (the TV screen: the game street with our HUD)", category: "theme", themes: ["insert"], tags: ["insert", "phone", "text", "title", "calendar", "views", "receipt"], radius: 0.3, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "textLucy"), steps: ["its next state"], stepCount: () => 40,
      variants: Object.fromEntries([...Object.keys(INSERTS), "tv"].map((k) => [k, () => undefined])) },
    ggTV: { name: "TV on a stand", desc: "a flat TV (1.24 m) on a low wooden stand, its screen facing -z (the game's sunset on it); `at` = the stand's foot centre; on the apartment, face the sofa from [-2.6, 0, 1.4]", category: "theme", themes: ["home"], tags: ["tv", "television", "screen"], radius: 0.8, height: 1.3,
      build: () => undefined, rig: (a) => tvRig(a), steps: [], stepCount: () => 1 },
    ggTvGlow: { name: "TV glow", desc: "the TV's flickering cool blue light (a point light at `at`, ~1 m in front of the faces it lights; `scale` = strength; give it a step every ~0.3 s, which drives the flicker)", category: "theme", themes: ["home", "night"], tags: ["light", "tv", "glow"], radius: 1.2, height: 0.6,
      build: () => undefined, rig: (a) => tvGlowRig(a), steps: ["flicker"], stepCount: () => 400 },
    ggGrade: { name: "Light grade (GTA GF)", desc: "the light of a place laid over the whole frame (characters and set alike): a multiply colour layer and an additive glow, square to the lens 0.5 m out (put `at` near what the shot looks at; `scale` = the shot's vertical fov / 100). Variants: tv (the flat at night: cool blue, the TV's flickering glow from below; give it a step every ~0.3 s), sunset (warm from the right, violet shadows), day (the sunny game), room (the bedroom: warm window light from the left)", category: "theme", themes: ["overlay", "light"], tags: ["grade", "light", "tint", "overlay"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a, v) => gradeRig(a, v ?? "tv"), steps: ["flicker"], stepCount: () => 400, variants: { tv: () => undefined, sunset: () => undefined, day: () => undefined, room: () => undefined } },
    ggShadow: { name: "Contact shadow (game)", desc: "a soft dark ellipse on the game plate's ground under a character's feet (0.9 x 0.5 m); `at` = the feet, raised by any height (it always draws on the ground at y 0)", category: "theme", themes: ["game"], tags: ["shadow"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => shadowRig(a), steps: [], stepCount: () => 1 },
    ggHud: { name: "Game HUD (our own)", desc: "our own game HUD over a game shot: a round pastel map bottom-left, a cash counter top-right; square to the lens (put `at` near what the shot looks at; `scale` = the shot's vertical fov / 100)", category: "theme", themes: ["game", "overlay"], tags: ["hud", "overlay", "game"], radius: 0.05, height: 0.1,
      build: () => undefined, rig: (a) => hudRig(a), steps: [], stepCount: () => 1 },
  },
  sets: { ggPlate: plateSet }, layouts: { ggPlate: { spots: PLATE_SPOTS, views: PLATE_VIEWS } },
  setMeta: { ggPlate: { name: "Game plate stage", desc: "an empty stage in front of a Blender plate of our Miami city (the ggPlate prop); the cast stands on its invisible ground", themes: ["miami", "game"], tags: ["game", "plate", "miami"] } },
};
