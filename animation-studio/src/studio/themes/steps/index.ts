// 4,012 Steps theme (productions/4012-steps): a narrated standalone ghost story. A teenager's step counter shows
// 4,012 steps every night; the steps circle their bed; it is their dog Biscuit's ghost, still guarding them.
// Reused from the base library: kit primitives, the floorboards, buildRoom, the night / interior light presets.
// New here (additions only):
//   sets stepsRoom (morning), stepsRoomNight (dark, the lamp off), stepsRoomLamp (night, the bedside lamp on): one
//     teenager's bedroom with bare floorboards, the bed's head at the left wall and a clear walkway round its front,
//     foot and back (something can walk round it); the bedside table with its drawer (the collar), the lamp and a
//     small framed photo of Biscuit; the desk across the room where the phone charges
//   props stInsert (9:16 close insert cards; a state per step, switching the moment a step starts), pawTrail (glowing
//     paw prints appearing one per step round the bed: the ghost, never its body)
//   character stepsTeen ("you": never named)
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { Batch } from "../../materials/geo";
import { buildRoom } from "../../sets/room";
import { At, col, tex, glow, box, rbox, cyl, sph } from "../../props/kit";
import { floorMat } from "../../props/interior";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";
import type { View } from "../../sets/types";
import type { V3 } from "../../camera/keys";

// ---------------------------------------------------------------- shared helpers
const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = t.wrapT = THREE.RepeatWrapping; stable.set(key, t); return t;
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const rnd = (seed: number) => { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };
const PLUM = "#1b1222", IW = 810, IH = 1440;
const F = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const ORANGE = "#ff7a3d", DUVET = "#e0b552", TAN = "#d39a5c", CREAM = "#f6ead2";

/** a paw print: the main pad and four toes, centred at (x, y), s = its height in px */
const paw = (g: CanvasRenderingContext2D, x: number, y: number, s: number, c: string) => {
  g.fillStyle = c;
  g.beginPath(); g.ellipse(x, y + s * 0.18, s * 0.3, s * 0.24, 0, 0, 7); g.fill();
  for (const [dx, dy, r] of [[-0.33, -0.12, 0.12], [-0.12, -0.32, 0.13], [0.12, -0.32, 0.13], [0.33, -0.12, 0.12]]) { g.beginPath(); g.ellipse(x + dx * s, y + dy * s, r * s, r * s * 1.25, dx * 0.6, 0, 7); g.fill(); }
};
/** Biscuit: a tan dog with a white chest and floppy ears, lying down asleep, side view, head to the left; centre
 *  (cx, cy), s ~ his length */
const biscuit = (g: CanvasRenderingContext2D, cx: number, cy: number, s: number) => {
  g.lineJoin = "round"; g.lineCap = "round"; const lw = Math.max(3, s * 0.022);
  const E = (x: number, y: number, rx: number, ry: number, rot: number, fill: string) => { g.beginPath(); g.ellipse(cx + x * s, cy + y * s, rx * s, ry * s, rot, 0, 7); g.fillStyle = fill; g.fill(); g.strokeStyle = PLUM; g.lineWidth = lw; g.stroke(); };
  g.beginPath(); g.moveTo(cx + 0.36 * s, cy + 0.02 * s); g.quadraticCurveTo(cx + 0.55 * s, cy - 0.05 * s, cx + 0.5 * s, cy + 0.12 * s); g.strokeStyle = PLUM; g.lineWidth = s * 0.06; g.stroke(); g.strokeStyle = TAN; g.lineWidth = s * 0.035; g.stroke(); // tail
  E(0.27, 0.1, 0.13, 0.08, 0, TAN);                                    // back leg, folded
  E(0.08, 0.02, 0.36, 0.15, 0, TAN);                                   // body
  E(-0.2, 0.06, 0.12, 0.09, 0, CREAM);                                 // white chest
  E(-0.38, 0.15, 0.17, 0.045, 0, CREAM);                               // front legs stretched out
  E(-0.36, -0.06, 0.14, 0.12, 0, TAN);                                 // head
  E(-0.5, 0.0, 0.1, 0.065, 0.1, CREAM);                                // muzzle
  g.beginPath(); g.ellipse(cx - 0.59 * s, cy - 0.02 * s, 0.03 * s, 0.022 * s, 0, 0, 7); g.fillStyle = PLUM; g.fill();   // nose
  E(-0.27, -0.03, 0.06, 0.12, 0.35, "#a8703c");                         // floppy ear
  g.strokeStyle = PLUM; g.lineWidth = lw; g.beginPath(); g.arc(cx - 0.4 * s, cy - 0.09 * s, 0.03 * s, 0.25, Math.PI - 0.25); g.stroke();   // closed eye
  g.beginPath(); g.ellipse(cx - 0.24 * s, cy + 0.03 * s, 0.025 * s, 0.1 * s, 0.15, 0, 7); g.fillStyle = "#c8323a"; g.fill(); // red collar
  g.beginPath(); g.arc(cx - 0.235 * s, cy + 0.14 * s, 0.022 * s, 0, 7); g.fillStyle = "#e3b23c"; g.fill();                   // its tag
};
const phoneTop = (g: CanvasRenderingContext2D, dark: boolean, time: string) => {
  g.fillStyle = dark ? "#0b0e16" : "#f5f3ee"; g.fillRect(0, 0, IW, IH);
  g.fillStyle = dark ? "#8b93a5" : "#4a4f5c"; g.font = F(34); g.textAlign = "left"; g.fillText(time, 56, 74);
  g.textAlign = "right"; g.fillText("▮▮▮ 82%", IW - 56, 74);
};
const glowText = (g: CanvasRenderingContext2D, text: string, x: number, y: number, font: string, c: string, blur = 30) => { g.font = font; g.textAlign = "center"; g.shadowColor = c; g.shadowBlur = blur; g.fillStyle = c; g.fillText(text, x, y); g.shadowBlur = 0; };
const vignette = (g: CanvasRenderingContext2D, c: string) => { const v = g.createRadialGradient(IW / 2, IH / 2, IW * 0.35, IW / 2, IH / 2, IH * 0.75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, c); g.fillStyle = v; g.fillRect(0, 0, IW, IH); };
/** the morning screen: STEPS, last night, 4,012 in an orange ring (the opening and the last frame) */
const stepsScreen = (g: CanvasRenderingContext2D) => {
  phoneTop(g, false, "07:02");
  g.fillStyle = "#1f2430"; g.font = F(66); g.textAlign = "left"; g.fillText("Steps", 56, 210);
  g.fillStyle = "#7a7f8c"; g.font = F(40, "normal"); g.fillText("Last night", 56, 270);
  g.lineCap = "round"; g.lineWidth = 48; g.strokeStyle = "#ebe4d8"; g.beginPath(); g.arc(IW / 2, 600, 235, 0, 7); g.stroke();
  g.strokeStyle = ORANGE; g.beginPath(); g.arc(IW / 2, 600, 235, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.6); g.stroke();
  g.fillStyle = "#1f2430"; g.font = F(150); g.textAlign = "center"; g.fillText("4,012", IW / 2, 640);
  g.fillStyle = "#7a7f8c"; g.font = F(46, "normal"); g.fillText("steps", IW / 2, 712);
  g.fillStyle = "#9aa0ad"; g.font = F(36, "normal"); g.fillText("asleep 23:40 – 07:00", IW / 2, 960);
};
const row = (g: CanvasRenderingContext2D, y: number, day: string, n: string, hot: boolean, dim = false) => {
  g.fillStyle = hot ? "#fff1e8" : "#ffffff"; g.beginPath(); g.roundRect(40, y, IW - 80, 92, 22); g.fill();
  g.fillStyle = dim ? "#b4b8c2" : "#1f2430"; g.font = F(42, "normal"); g.textAlign = "left"; g.fillText(day, 76, y + 60);
  g.fillStyle = dim ? "#b4b8c2" : hot ? ORANGE : "#1f2430"; g.font = F(46); g.textAlign = "right"; g.fillText(n, IW - 76, y + 62);
};
const darkRoomBg = (g: CanvasRenderingContext2D) => { const bg = g.createLinearGradient(0, 0, 0, IH); bg.addColorStop(0, "#121a30"); bg.addColorStop(1, "#070a14"); g.fillStyle = bg; g.fillRect(0, 0, IW, IH); };
const boards = (g: CanvasRenderingContext2D, y0: number, c: string, lines: string) => { g.fillStyle = c; g.fillRect(0, y0, IW, IH - y0); g.strokeStyle = lines; g.lineWidth = 4; for (let y = y0 + 70; y < IH; y += 95) { g.beginPath(); g.moveTo(0, y); g.lineTo(IW, y); g.stroke(); } const r = rnd(5); for (let k = 0; k < 14; k++) { const y = y0 + 70 + Math.floor(r() * 9) * 95; const x = r() * IW; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 95); g.stroke(); } };

/** insert cards: draw(g, state); `n` = how many states (state k shows from the moment step k starts) */
const INSERTS: Record<string, { n: number; draw: (g: CanvasRenderingContext2D, st: number) => void }> = {
  // 1 / 4 / 17: the morning screen
  steps: { n: 1, draw: (g) => stepsScreen(g) },
  // 2: the route: a tight red scribble going round and round the bed, inside one room of the floor plan
  map: { n: 1, draw: (g) => {
    g.fillStyle = "#eee8da"; g.fillRect(0, 0, IW, IH);
    g.strokeStyle = "#ffffff"; g.lineWidth = 34; for (const [x0, y0, x1, y1] of [[-20, 1130, IW + 20, 1060], [600, -20, 690, IH + 20]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, IW, 170); g.fillStyle = "#1f2430"; g.font = F(46); g.textAlign = "left"; g.fillText("Last night's route", 56, 104);
    g.fillStyle = ORANGE; g.font = F(40); g.textAlign = "right"; g.fillText("4,012", IW - 56, 104);
    g.fillStyle = "#f8f5ee"; g.fillRect(110, 270, 470, 720); g.strokeStyle = "#5a5f6a"; g.lineWidth = 12; g.strokeRect(110, 270, 470, 720);
    g.beginPath(); g.moveTo(110, 650); g.lineTo(400, 650); g.moveTo(470, 650); g.lineTo(580, 650); g.stroke();       // the room's wall and door gap
    g.fillStyle = "#5a5f6a"; g.font = F(30); g.textAlign = "center"; g.fillText("YOUR ROOM", 345, 625);
    g.fillStyle = "#cfe0f2"; g.strokeStyle = "#5a5f6a"; g.lineWidth = 5; g.beginPath(); g.roundRect(270, 330, 150, 230, 14); g.fill(); g.stroke();
    g.fillStyle = "#ffffff"; g.beginPath(); g.roundRect(290, 342, 110, 50, 10); g.fill(); g.stroke();
    const r = rnd(41); g.strokeStyle = "rgba(232,69,60,0.8)"; g.lineWidth = 7; g.lineJoin = "round";
    g.beginPath(); for (let i = 0; i <= 900; i++) { const a = (i / 900) * Math.PI * 2 * 11, j = 1 + 0.08 * Math.sin(i * 0.31) + (r() - 0.5) * 0.04;
      const x = 345 + Math.cos(a) * 140 * j, y = 445 + Math.sin(a) * 170 * j; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    g.fillStyle = "#e8453c"; g.beginPath(); g.arc(485, 445, 16, 0, 7); g.fill();
  } },
  // 5: every night since June
  history: { n: 1, draw: (g) => {
    g.fillStyle = "#f1eee8"; g.fillRect(0, 0, IW, IH); phoneTop(g, false, "07:03"); g.fillStyle = "#f1eee8"; g.fillRect(0, 100, IW, IH);
    g.fillStyle = "#1f2430"; g.font = F(56); g.textAlign = "left"; g.fillText("Steps at night", 56, 200);
    let y = 235; for (const d of ["Mon 16 Nov", "Sun 15 Nov", "Sat 14 Nov"]) { row(g, y, d, "4,012", true); y += 104; }
    g.fillStyle = "#9aa0ad"; g.font = F(56); g.textAlign = "center"; g.fillText("⋮", IW / 2, y + 42); y += 66;
    g.fillStyle = ORANGE; g.font = F(46); g.textAlign = "left"; g.fillText("JUNE", 56, y + 40); y += 62;
    row(g, y, "Sun 7 Jun", "4,012", true); y += 108; row(g, y, "Sat 6 Jun", "—", false, true); y += 108; row(g, y, "Fri 5 Jun", "—", false, true);
  } },
  // 7: the live counter at 1:14: 0, 1, 2, 3
  counter: { n: 4, draw: (g, st) => {
    phoneTop(g, true, "01:14");
    g.fillStyle = "#3ccf6e"; g.beginPath(); g.arc(80, 205, 14, 0, 7); g.fill();
    g.fillStyle = "#c9cfe0"; g.font = F(44); g.textAlign = "left"; g.fillText("Steps · live", 110, 222);
    glowText(g, String(st), IW / 2, 720, F(330), "#f2f4fa", 40);
    g.fillStyle = "#8b93a5"; g.font = F(46, "normal"); g.textAlign = "center"; g.fillText("steps tonight", IW / 2, 810);
  } },
  // 11: the counter stops: 4,011 -> 4,012
  counterEnd: { n: 2, draw: (g, st) => {
    phoneTop(g, true, "01:58");
    g.fillStyle = st ? ORANGE : "#3ccf6e"; g.beginPath(); g.arc(80, 205, 14, 0, 7); g.fill();
    g.fillStyle = "#c9cfe0"; g.font = F(44); g.textAlign = "left"; g.fillText(st ? "Steps · stopped" : "Steps · live", 110, 222);
    glowText(g, st ? "4,012" : "4,011", IW / 2, 700, F(210), st ? ORANGE : "#f2f4fa", 40);
    g.fillStyle = "#8b93a5"; g.font = F(46, "normal"); g.textAlign = "center"; g.fillText("steps tonight", IW / 2, 800);
  } },
  // 12: the step sources: not this phone; Biscuit's collar (state 1 lights it up)
  device: { n: 2, draw: (g, st) => {
    phoneTop(g, true, "01:59");
    g.fillStyle = "#e9edf5"; g.font = F(56); g.textAlign = "left"; g.fillText("Step sources", 56, 220);
    g.fillStyle = "#161b26"; g.beginPath(); g.roundRect(40, 280, IW - 80, 170, 28); g.fill();
    g.fillStyle = "#3a4256"; g.beginPath(); g.roundRect(80, 315, 60, 100, 10); g.fill();
    g.fillStyle = "#c9cfe0"; g.font = F(46); g.fillText("This phone", 175, 355); g.fillStyle = "#6f778a"; g.font = F(36, "normal"); g.fillText("0 steps tonight", 175, 410);
    g.globalAlpha = st ? 1 : 0.35;
    if (st) { g.shadowColor = ORANGE; g.shadowBlur = 40; }
    g.fillStyle = "#24170f"; g.beginPath(); g.roundRect(40, 490, IW - 80, 220, 28); g.fill(); g.shadowBlur = 0;
    g.strokeStyle = ORANGE; g.lineWidth = st ? 6 : 2; g.stroke();
    paw(g, 112, 600, 90, ORANGE);
    g.fillStyle = "#ffffff"; g.font = F(52); g.textAlign = "left"; g.fillText("Biscuit's collar", 175, 580);
    g.fillStyle = ORANGE; g.font = F(38); g.fillText("4,012 steps · connected", 175, 645);
    g.globalAlpha = 1;
  } },
  // 9: your hand hanging off the bed in the dark; state 1: a breath of mist round the fingertips
  hand: { n: 2, draw: (g, st) => {
    darkRoomBg(g); boards(g, 560, "#2c3046", "#161a2a");
    const m0 = g.createRadialGradient(IW * 0.7, 120, 40, IW * 0.7, 120, 900); m0.addColorStop(0, "rgba(150,175,230,0.30)"); m0.addColorStop(1, "rgba(150,175,230,0)"); g.fillStyle = m0; g.fillRect(0, 0, IW, IH);  // moonlight
    g.fillStyle = "#7c86a8"; g.strokeStyle = PLUM; g.lineWidth = 14; g.beginPath(); g.moveTo(-20, -20); g.lineTo(IW + 20, -20); g.lineTo(IW + 20, 280); g.quadraticCurveTo(IW / 2, 360, -20, 300); g.closePath(); g.fill(); g.stroke(); // the duvet edge
    g.fillStyle = "#d9b49c"; g.beginPath(); g.moveTo(300, 250); g.lineTo(470, 250); g.lineTo(490, 600); g.quadraticCurveTo(495, 670, 440, 675); g.lineTo(350, 675); g.quadraticCurveTo(300, 670, 300, 600); g.closePath(); g.fill(); g.stroke();   // the forearm and hand
    for (const [x, len] of [[322, 150], [366, 185], [410, 175], [452, 140]] as const) { g.beginPath(); g.roundRect(x - 19, 640, 38, len, 19); g.fill(); g.stroke(); }
    g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(455, 270, 18, 360);                                                  // rim light
    if (st) { const r = rnd(7); for (let k = 0; k < 8; k++) { const x = 390 + (r() - 0.5) * 300, y = 860 + (r() - 0.5) * 120, rr = 70 + r() * 80; const m = g.createRadialGradient(x, y, 0, x, y, rr); m.addColorStop(0, "rgba(225,235,255,0.38)"); m.addColorStop(1, "rgba(225,235,255,0)"); g.fillStyle = m; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); } }
    vignette(g, "rgba(0,0,0,0.55)");
  } },
  // 10: the foot of the bed; state 1: a round dent sinks into the duvet beside your feet
  duvet: { n: 2, draw: (g, st) => {
    darkRoomBg(g);
    const d = g.createLinearGradient(0, 200, 0, 1300); d.addColorStop(0, "#9a8f9f"); d.addColorStop(1, "#5c5670"); g.fillStyle = d; g.strokeStyle = PLUM; g.lineWidth = 12;
    g.beginPath(); g.moveTo(-20, 160); g.quadraticCurveTo(IW / 2, 110, IW + 20, 170); g.lineTo(IW + 20, 1250); g.quadraticCurveTo(IW / 2, 1320, -20, 1250); g.closePath(); g.fill(); g.stroke();
    for (const x of [200, 330]) { const m = g.createLinearGradient(x - 60, 0, x + 60, 0); m.addColorStop(0, "rgba(235,240,255,0.0)"); m.addColorStop(0.4, "rgba(235,240,255,0.35)"); m.addColorStop(1, "rgba(20,15,30,0.35)"); g.fillStyle = m;
      g.beginPath(); g.moveTo(x - 55, 160); g.quadraticCurveTo(x - 70, 420, x - 40, 470); g.quadraticCurveTo(x, 500, x + 40, 470); g.quadraticCurveTo(x + 70, 420, x + 55, 160); g.closePath(); g.fill(); }   // your two feet, long ridges under the duvet
    g.strokeStyle = "rgba(30,20,40,0.35)"; g.lineWidth = 5; for (const [x0, y0, x1, y1] of [[120, 600, 300, 900], [700, 450, 620, 1100], [90, 1000, 260, 1180]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 40, (y0 + y1) / 2, x1, y1); g.stroke(); }   // folds
    if (st) {
      const cx = 520, cy = 700; const m = g.createRadialGradient(cx - 30, cy - 40, 20, cx, cy, 230); m.addColorStop(0, "rgba(0,0,0,0.55)"); m.addColorStop(0.7, "rgba(0,0,0,0.25)"); m.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = m; g.beginPath(); g.ellipse(cx, cy, 230, 190, 0, 0, 7); g.fill();
      g.strokeStyle = "rgba(20,14,24,0.55)"; g.lineWidth = 6; for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; g.beginPath(); g.moveTo(cx + Math.cos(a) * 200, cy + Math.sin(a) * 165); g.quadraticCurveTo(cx + Math.cos(a + 0.2) * 260, cy + Math.sin(a + 0.2) * 215, cx + Math.cos(a) * 300, cy + Math.sin(a) * 250); g.stroke(); }
      g.strokeStyle = "rgba(255,240,200,0.18)"; g.lineWidth = 5; g.beginPath(); g.ellipse(cx + 10, cy + 12, 215, 178, 0, Math.PI * 0.1, Math.PI * 0.9); g.stroke();
    }
    vignette(g, "rgba(0,0,0,0.45)");
  } },
  // 13: the open drawer: Biscuit's red collar and his bone tag; state 1: the tag catches the lamplight
  drawer: { n: 2, draw: (g, st) => {
    g.fillStyle = "#3a2618"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#b07d4f"; g.fillRect(70, 160, IW - 140, 900); g.fillStyle = "#c9935f"; g.fillRect(100, 190, IW - 200, 840);
    g.strokeStyle = "rgba(90,55,30,0.35)"; g.lineWidth = 4; for (let y = 230; y < 1030; y += 60) { g.beginPath(); g.moveTo(100, y); g.lineTo(IW - 100, y); g.stroke(); }
    g.fillStyle = "#f2efe6"; g.save(); g.translate(560, 330); g.rotate(0.12); g.fillRect(-90, -60, 180, 120); g.restore();                 // a folded note
    g.lineCap = "round"; g.strokeStyle = PLUM; g.lineWidth = 64; g.beginPath(); g.ellipse(IW / 2, 500, 220, 150, -0.15, 0, 7); g.stroke();
    g.strokeStyle = "#c8323a"; g.lineWidth = 46; g.stroke();                                                                                 // the collar
    g.fillStyle = "#c9ccd2"; g.strokeStyle = PLUM; g.lineWidth = 8; g.beginPath(); g.roundRect(IW / 2 + 150, 380, 70, 90, 12); g.fill(); g.stroke();   // its buckle
    const tx = IW / 2 - 40, ty = 700;
    if (st) { const m = g.createRadialGradient(tx, ty, 10, tx, ty, 260); m.addColorStop(0, "rgba(255,226,150,0.55)"); m.addColorStop(1, "rgba(255,226,150,0)"); g.fillStyle = m; g.fillRect(tx - 260, ty - 260, 520, 520); }
    g.strokeStyle = PLUM; g.lineWidth = 8; g.beginPath(); g.moveTo(tx, 645); g.lineTo(tx, 610); g.stroke();
    g.fillStyle = "#e3b23c"; g.beginPath();
    for (const [x, y] of [[-125, -26], [-125, 26], [125, -26], [125, 26]]) g.ellipse(tx + x, ty + y, 42, 42, 0, 0, 7);
    g.rect(tx - 125, ty - 40, 250, 80); g.fill();
    g.strokeStyle = PLUM; g.lineWidth = 7; for (const [x, y] of [[-125, -26], [-125, 26], [125, -26], [125, 26]]) { g.beginPath(); g.ellipse(tx + x, ty + y, 42, 42, 0, 0, 7); g.stroke(); }
    g.fillStyle = "#e3b23c"; g.fillRect(tx - 125, ty - 37, 250, 74);
    g.fillStyle = "#5a3d10"; g.font = F(50); g.textAlign = "center"; g.fillText("BISCUIT", tx, ty + 18);
    vignette(g, "rgba(20,8,0,0.55)");
  } },
  // 14: the framed photo: Biscuit curled up asleep on the end of this bed, years ago
  photo: { n: 1, draw: (g) => {
    g.fillStyle = "#2a1c14"; g.fillRect(0, 0, IW, IH);
    g.fillStyle = "#8a5a32"; g.fillRect(80, 110, IW - 160, 860); g.fillStyle = "#f7f1e3"; g.fillRect(120, 150, IW - 240, 780);
    const x0 = 160, y0 = 250, w = IW - 320, h = 640;
    const sky = g.createLinearGradient(0, y0, 0, y0 + h); sky.addColorStop(0, "#f4dcb0"); sky.addColorStop(1, "#e6c48f"); g.fillStyle = sky; g.fillRect(x0, y0, w, h);
    g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
    g.fillStyle = "#cfa9d6"; g.fillRect(x0, y0, w, 260);                                                                     // the wall
    g.fillStyle = DUVET; g.strokeStyle = PLUM; g.lineWidth = 10; g.beginPath(); g.moveTo(x0 - 20, y0 + 330); g.quadraticCurveTo(x0 + w / 2, y0 + 290, x0 + w + 20, y0 + 340); g.lineTo(x0 + w + 20, y0 + h + 20); g.lineTo(x0 - 20, y0 + h + 20); g.closePath(); g.fill(); g.stroke();
    biscuit(g, x0 + w / 2 + 20, y0 + 430, 470);
    g.restore();
    g.fillStyle = "#4a3a6a"; g.font = "italic 58px 'DejaVu Serif', Georgia, serif"; g.textAlign = "center"; g.fillText("Biscuit · 2015", IW / 2, 222);
    vignette(g, "rgba(40,20,0,0.35)");
  } },
};
/** the framed photo on the bedside table (in the set), the same picture small */
const photoTex = () => stex("stPhotoSmall", 256, 320, (g) => {
  g.fillStyle = "#f7f1e3"; g.fillRect(0, 0, 256, 320); g.fillStyle = "#e6c48f"; g.fillRect(20, 20, 216, 250); g.fillStyle = "#cfa9d6"; g.fillRect(20, 20, 216, 90);
  g.fillStyle = DUVET; g.fillRect(20, 120, 216, 150); biscuit(g, 135, 180, 190);
});
const insertRig = (a: At, v = "steps"): PropRig => {
  const root = rigRoot(a), ins = INSERTS[v] ?? INSERTS.steps, texAt = (st: number) => stex(`stIns_${v}_${st}`, IW, IH, (g) => ins.draw(g, st));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), new THREE.MeshBasicMaterial({ map: texAt(0), toneMapped: false })); m.layers.set(NOINK); root.add(m);
  return { root, update: ({ step = 0 }) => { (m.material as THREE.MeshBasicMaterial).map = texAt(Math.max(0, Math.min(ins.n - 1, Math.ceil(step - 1e-3)))); } };
};

// ---------------------------------------------------------------- the paw-print trail (the ghost)
// Round the bed's front (z 0.3), its foot (x 0.2) and behind it (z -1.15): one print every 0.2 m, alternating left and
// right of the line, pointing the way he walks. Print i fades in over step i (absolute in the room, whatever `at` is).
const PATH: [number, number][] = [[-1.05, 0.3], [0.2, 0.3], [0.2, -1.15], [-1.4, -1.15]];
const PRINTS = (() => {
  const out: { x: number; z: number; h: number }[] = []; let side = 1;
  for (let s = 0; s < PATH.length - 1; s++) {
    const [x0, z0] = PATH[s], [x1, z1] = PATH[s + 1], len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 0.2), hx = (x1 - x0) / len, hz = (z1 - z0) / len;
    for (let k = s ? 1 : 0; k <= n; k++) { const t = (k / n) * len; out.push({ x: x0 + hx * t - hz * 0.05 * side, z: z0 + hz * t + hx * 0.05 * side, h: Math.atan2(hx, hz) }); side = -side; }
  }
  return out;
})();
const pawTex = () => stex("stPaw", 128, 128, (g) => { const m = g.createRadialGradient(64, 64, 10, 64, 64, 64); m.addColorStop(0, "rgba(255,240,205,0.35)"); m.addColorStop(1, "rgba(255,240,205,0)"); g.fillStyle = m; g.fillRect(0, 0, 128, 128); paw(g, 64, 70, 80, "#fff6e0"); });
const pawTrailRig = (): PropRig => {
  const root = new THREE.Group(), geo = new THREE.PlaneGeometry(0.11, 0.11).rotateX(-Math.PI / 2);
  const mats = PRINTS.map((p) => {
    const m = new THREE.MeshBasicMaterial({ map: pawTex(), transparent: true, opacity: 0, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(geo, m); mesh.position.set(p.x, 0.008, p.z); mesh.rotation.y = p.h + Math.PI; mesh.layers.set(NOINK); root.add(mesh); return m;
  });
  return { root, update: ({ step = 0 }) => { mats.forEach((m, i) => { m.opacity = Math.max(0, Math.min(1, step - i)) * 0.95; }); } };
};

// ---------------------------------------------------------------- set: the bedroom (morning / night / lamp)
// 3.4 x 3.2 m, open toward +z. The bed along x, its head at the left wall (x -1.62), foot at x -0.08, z -0.75..0;
// 0.85 m clear behind it and in front of it (the walkway). The window in the back wall (x 0.85), the desk under it
// with the phone charging; the bedside table (with its drawer) in front of the bed's head; the door in the right wall.
const BED_TOP = 0.45;
const bed = (b: Batch, I: THREE.Matrix4) => {
  const xFoot = -0.08, xHead = -1.62, z0 = -0.75, z1 = 0.0, wood = "#9c6b45", lo = xHead, hi = xFoot, zc = (z0 + z1) / 2;
  box(b, col(wood), I, lo, hi, 0.12, 0.3, z0, z1); box(b, col("#efe9dd"), I, lo + 0.02, hi - 0.02, 0.3, BED_TOP, z0 + 0.02, z1 - 0.02);
  for (const [x, z] of [[lo + 0.05, z0 + 0.05], [hi - 0.05, z0 + 0.05], [lo + 0.05, z1 - 0.05], [hi - 0.05, z1 - 0.05]] as const) box(b, col(wood), I, x - 0.04, x + 0.04, 0, 0.12, z - 0.04, z + 0.04);
  box(b, col(wood), I, xHead - 0.06, xHead, 0.12, 1.0, z0, z1);
  rbox(b, col("#f6f1e6"), I, xHead + 0.3, BED_TOP, zc, 0.42, 0.13, z1 - z0 - 0.16, 0.05);
  const dEnd = xHead + 0.62; rbox(b, col(DUVET), I, (xFoot + dEnd) / 2, BED_TOP, zc, Math.abs(dEnd - xFoot), 0.17, z1 - z0 + 0.06, 0.06);
};
const wallTex = () => stex("stWall", 256, 256, (g) => { g.fillStyle = "#aeb9c8"; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(255,255,255,0.10)"; for (let x = 0; x < 256; x += 64) g.fillRect(x, 0, 24, 256); });
const ROOM_SPOTS: Record<string, V3> = { bed: [-1.0, BED_TOP, -0.38], asleep: [-1.08, -0.12, -0.38], bedEdge: [-0.6, BED_TOP, 0.05], desk: [1.2, 0, -0.55], door: [1.15, 0, 0.9], floor: [0, 0, 0.9], bedFoot: [0.2, 0, -0.4] };
const ROOM_VIEWS: View[] = [
  { name: "bedWall", pos: [0.9, 1.15, 1.5], look: [-1.1, 0.95, -0.4], fov: 45 },
  { name: "room", pos: [0.6, 1.5, 2.2], look: [-0.3, 0.8, -0.8], fov: 55, establishing: true },
];
const stepsRoom = (mode: "day" | "night" | "lamp") => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  buildRoom(root, { w: 3.4, d: 3.2, h: 2.5, floor: floorMat(), wall: tex("stWall", wallTex, 3, 2), trim: "#f1ece0", openings: [{ wall: "back", at: 0.85, w: 1.0, h: 1.2, sill: 0.95, view: "garden" }] });
  bed(b, I);
  if (mode !== "day") box(b, glow("stNightPane", () => ({ color: "#131d36" })), I, 0.35, 1.35, 0.95, 2.15, -1.67, -1.66);
  // the bedside table and its drawer (the collar), the lamp, the framed photo
  rbox(b, col("#d9cdb6"), I, -1.42, 0, 0.38, 0.42, 0.52, 0.38, 0.03);
  box(b, col("#6b5a46"), I, -1.6, -1.24, 0.33, 0.34, 0.569, 0.572); sph(b, col("#b9a26a"), I, -1.42, 0.41, 0.575, 0.02, 0.02, 0.015, 10);
  cyl(b, col("#3a3530"), I, -1.52, 0.52, 0.3, 0.06, 0.06, 0.02); cyl(b, col("#3a3530"), I, -1.52, 0.54, 0.3, 0.012, 0.012, 0.24);
  cyl(b, mode === "lamp" ? glow("stShadeOn", () => ({ color: "#ffd9a0" })) : col("#e8dcc4"), I, -1.52, 0.74, 0.3, 0.12, 0.08, 0.15, 20);
  box(b, col("#5a3a22"), I, -1.36, -1.22, 0.52, 0.69, 0.43, 0.445);
  b.add(new THREE.PlaneGeometry(0.11, 0.14), new THREE.MeshLambertMaterial({ map: photoTex() }), new THREE.Matrix4().makeTranslation(-1.29, 0.605, 0.447));
  // the desk under the window, the phone charging on it (its screen lit at night), its cable to the wall
  rbox(b, col("#d8cdb8"), I, 1.2, 0, -1.25, 0.9, 0.74, 0.5, 0.03); rbox(b, col("#4a4f5c"), I, 1.45, 0, -0.75, 0.42, 0.45, 0.42, 0.04);
  box(b, col("#15171b"), I, 1.0, 1.08, 0.74, 0.752, -1.22, -1.07);
  if (mode !== "day") box(b, glow("stPhoneLit", () => ({ color: "#9fc6ff" })), I, 1.006, 1.074, 0.7525, 0.754, -1.214, -1.076);
  box(b, col("#f2f2f2"), I, 1.035, 1.045, 0.741, 0.745, -1.48, -1.22);
  // the door (right wall), shut; a poster over the desk
  box(b, col("#e9e3d6"), I, 1.655, 1.69, 0.03, 2.02, 0.4, 1.22); box(b, col("#b9a26a"), I, 1.63, 1.655, 0.98, 1.06, 0.48, 0.54);
  box(b, col("#3d5a80"), I, 0.95, 1.45, 1.35, 1.75, -1.595, -1.59); box(b, col("#ee6c4d"), I, 1.05, 1.35, 1.45, 1.55, -1.589, -1.585);
  b.build(root, true);
  return { root, env: { clouds: false }, spots: ROOM_SPOTS, views: ROOM_VIEWS };
};

// ---------------------------------------------------------------- character: "you" (a teenager, never named)
const TEEN: Look = { name: "You (4,012 Steps)", build: "petite", skin: "#e8b896", seed: 611, hair: { style: "side", color: "#3b2a20" },
  top: { style: "tee", color: "#d1603d" }, legs: "#34405a", shoes: "#e8e2d6" };

const ROOM_DESC = "a teenager's bedroom (3.4 x 3.2 m, open toward +z) with bare floorboards: the bed along x, its head at the LEFT wall (x -1.62), foot at x -0.08, z -0.75..0, with a clear walkway in front of it, round its foot and behind it; the bedside table with a drawer, a lamp and a small framed photo of Biscuit in front of the bed's head (x -1.42, z 0.38); the desk under the back window with the phone charging on it (x 1.0..1.08, z -1.22..-1.07); the door in the right wall; spots bed (sitting up in bed: mode sit), asleep (lying in bed: only the head and shoulders above the duvet), bedEdge, desk, door, floor, bedFoot";
export const STEPS_THEME: Theme = {
  id: "steps", name: "4,012 Steps (a teenager's bedroom, a dog's ghost)",
  desc: "a narrated ghost story in one teenager's bedroom: the step counter that shows 4,012 every night, the steps that circle the bed, the dog Biscuit's collar in the drawer and his ghost's glowing paw prints",
  tags: ["horror", "ghost", "dog", "night", "bedroom", "phone", "emotional"],
  mood: "mystery",
  ambience: { stepsRoom: "amb_room", stepsRoomNight: "amb_room", stepsRoomLamp: "amb_room" },
  characters: { stepsTeen: TEEN },
  characterMeta: { stepsTeen: { name: "You (4,012 Steps)", desc: "a teenager; short side-swept dark hair; a rust-red T-shirt; navy pyjama bottoms", personality: "the 'you' of a second-person ghost story, never named: scared at night, then moved", themes: ["horror", "home"], tags: ["teen", "you", "pov"] } },
  props: {
    stInsert: { name: "Close insert (4,012 Steps)", desc: "an upright 9:16 insert card (0.54 x 0.96 m, facing +z), `at` = its centre: an `at` camera 1.0 m in front at fov 51 sees only the card. A state per step, switching the moment the step starts (cue the step on its sound). Variants: steps (the morning screen: STEPS, last night, 4,012), map (last night's route: a red scribble going round and round the bed in YOUR ROOM), history (every night 4,012, back to Sun 7 Jun; 6 and 5 Jun blank), counter (the live counter at 01:14: 0, then 1, 2, 3 on steps 1-3), counterEnd (4,011, then 4,012 stopped), device (step sources: this phone 0; step 1 lights up Biscuit's collar · 4,012 · connected), hand (your hand hanging off the bed in the dark; step 1 a breath of mist round the fingers), duvet (the foot of the bed in the dark; step 1 a round dent sinks in beside your feet), drawer (the open drawer: the red collar and the bone tag BISCUIT; step 1 the tag glows), photo (the framed photo: Biscuit curled asleep on the end of the bed, 'Biscuit · 2015')", category: "theme", themes: ["horror", "insert", "phone"], tags: ["insert", "close-up", "phone", "steps", "dog", "collar", "clue"], radius: 0.05, height: 0.96,
      build: () => undefined, rig: (a, v) => insertRig(a, v ?? "steps"), steps: ["its next state"], stepCount: () => 2000,
      variants: Object.fromEntries(Object.keys(INSERTS).map((k) => [k, () => undefined])) },
    pawTrail: { name: "Ghost paw prints (round the bed)", desc: `faint, glowing paw prints on the floorboards of stepsRoom*, in a line round the bed's front, its foot and behind it (${PRINTS.length} prints, 0.2 m apart): print k fades in over step k (give it steps ~0.2 s apart); absolute in the room whatever \`at\` is (put \`at\` where the shot looks)`, category: "theme", themes: ["horror", "ghost", "dog"], tags: ["paw", "prints", "ghost", "glow", "trail"], radius: 0.05, height: 0.02,
      build: () => undefined, rig: () => pawTrailRig(), steps: ["the next print appears"], stepCount: () => PRINTS.length },
  },
  sets: {
    stepsRoom: { id: "stepsRoom", title: "The bedroom in the morning (4,012 Steps): the bed, the bedside table, the desk with the phone, bare floorboards", lights: ["interior", "interiorCool"], build: () => stepsRoom("day") },
    stepsRoomNight: { id: "stepsRoomNight", title: "The bedroom at night (4,012 Steps): dark, the lamp off, the phone lit on the desk", lights: ["night", "interiorCool"], build: () => stepsRoom("night") },
    stepsRoomLamp: { id: "stepsRoomLamp", title: "The bedroom at night with the bedside lamp on (4,012 Steps)", lights: ["interior", "night", "interiorCool"], build: () => stepsRoom("lamp") },
  },
  layouts: { stepsRoom: { spots: ROOM_SPOTS, views: ROOM_VIEWS }, stepsRoomNight: { spots: ROOM_SPOTS, views: ROOM_VIEWS }, stepsRoomLamp: { spots: ROOM_SPOTS, views: ROOM_VIEWS } },
  setMeta: {
    stepsRoom: { name: "Teen bedroom (morning)", desc: ROOM_DESC, themes: ["home", "horror"], tags: ["bedroom", "teen", "bed", "morning", "floorboards"] },
    stepsRoomNight: { name: "Teen bedroom (night)", desc: "after dark, the lamp off, the phone's screen lit on the desk: " + ROOM_DESC, themes: ["home", "horror"], tags: ["bedroom", "teen", "bed", "night", "floorboards"] },
    stepsRoomLamp: { name: "Teen bedroom (night, lamp on)", desc: "at night with the bedside lamp lit warm: " + ROOM_DESC, themes: ["home", "horror"], tags: ["bedroom", "teen", "bed", "night", "lamp", "floorboards"] },
  },
};
