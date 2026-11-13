// Locked Out theme (productions/sample-locked-out: a first-person mystery, a night-call locksmith at 9 Alder Row).
// Created for the visual test (the eight key frames of visual-plan.md); only what the library search showed missing.
// Reused from the base library: house (the terrace either side and across the road), streetLamp, tree (hedges),
// flowers, tufts, pavement / asphalt / concrete / grass / dirt paints, the night light preset; the farmDog prop
// (Biscuit) and Gus are reused as they are.
// New here:
//   set alderRow: number 9's brick frontage (door opening, bay window, a real upstairs window opening), its front
//     garden, path, border and gate, the terrace either side, the pavement and road, the terrace across the road
//   props: fpHands (the first-person hands: the locksmith's gloved hands and cuffs as an ink-drawn card, one pose per
//     variant), vanCab (the van's cab around the driver's eye: dashboard, wheel, windscreen frame, visor with the
//     warning letter, the rear-view mirror whose glass can show my eyes), door9 (number 9's weathered front door with
//     the new KL cylinder, the old lock's paint outline, filings, letterbox, bell and MARSH label), upstairsWindow
//     (number 9's upstairs room: light strip under the curtain, off, on with the curtain open), windowLight (a window
//     across the road lighting up), shadowDecal (a long man's shadow on the ground)
//   item brick; characters marsh, rachel (the woman), sam (the boy)
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { INK, type Pen } from "../../characters/toon";
import { Batch, quadUp } from "../../materials/geo";
import { grassHD } from "../../materials/paint";
import { asphaltHD, pavementHD, concreteHD, dirtHD } from "../../materials/paint2";
import { At, frame, col, box, cyl, tex, panel, glow } from "../../props/kit";
import { house, streetLamp } from "../../props/outdoor";
import { tree, flowers, tufts } from "../../props/nature";
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
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const FONT = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; };
const plane = (w: number, h: number) => new THREE.PlaneGeometry(w, h);
/** an unlit card (an ink drawing on canvas): screens glow (toneMapped false); drawings are tinted for the night */
const cardMat = (t: THREE.Texture, tint = "#ffffff", screen = false) =>
  new THREE.MeshBasicMaterial({ map: t, transparent: !screen, depthWrite: true, alphaTest: screen ? 0 : 0.02, color: tint, toneMapped: !screen });
const NIGHT_TINT = "#c9d0e4"; // ink drawings at night read in the same cool shade as the cast under the night light

// ---------------------------------------------------------------- texts (readable at phone size: big, few words)
const LETTER = ["KESTREL LOCKS", "FINAL WARNING", "Wrongful refusal", "of service.", "One more and", "you're dismissed."];

// ---------------------------------------------------------------- the phone screens (drawn into the fpHands card)
const drawScreen = (g: CanvasRenderingContext2D, v: string, x: number, y: number, w: number, h: number) => {
  g.save(); rr(g, x, y, w, h, w * 0.06); g.clip();
  g.fillStyle = "#0e131c"; g.fillRect(x, y, w, h);
  const s = w / 512, T = (t: string, px: number, cx: number, cy: number, c = "#fff", align: CanvasTextAlign = "left", wt = "bold") => { g.font = FONT(px * s, wt); g.fillStyle = c; g.textAlign = align; g.fillText(t, x + cx * s, y + cy * s); };
  // app header bar (Kestrel's own colours: teal and orange)
  g.fillStyle = "#1f5c63"; g.fillRect(x, y, w, 150 * s);
  T("02:19", 26, 256, 40, "#cfe3e4", "center", "normal");
  T("KESTREL LOCKS", 40, 32, 100, "#ffffff"); g.fillStyle = "#f08a32"; g.fillRect(x + 32 * s, y + 116 * s, 120 * s, 8 * s);
  if (v === "history" || v === "record") {
    T("9 ALDER ROW", 34, 32, 210, "#9fc9cc");
    T("History", 30, 32, 256, "#8a96a8", "left", "normal");
    g.fillStyle = "rgba(255,255,255,0.10)"; rr(g, x + 20 * s, y + 290 * s, 472 * s, 470 * s, 26 * s); g.fill();
    g.fillStyle = "#f08a32"; g.fillRect(x + 20 * s, y + 290 * s, 10 * s, 470 * s);
    T("Yesterday, 16:40", 34, 52, 350, "#f3c58f");
    T("Emergency", 46, 52, 424); T("lock change", 46, 52, 482);
    T("Customer:", 32, 52, 560, "#b9c5d6", "left", "normal"); T("R. Marsh", 42, 52, 612);
    T("Keys issued to", 32, 52, 680, "#b9c5d6", "left", "normal"); T("R. Marsh only", 42, 52, 732, "#ffd9a8");
    if (v === "record") { g.restore(); return; } // the job never reached the office: no row for tonight
    g.fillStyle = "rgba(255,255,255,0.06)"; rr(g, x + 20 * s, y + 790 * s, 472 * s, 150 * s, 26 * s); g.fill();
    T("Tonight, 02:14", 30, 52, 846, "#8a96a8", "left", "normal"); T("Lockout (D. Marsh)", 34, 52, 898, "#c9d2de");
  } else if (v === "refused") { // the job record after (beat 19)
    T("9 ALDER ROW", 34, 32, 210, "#9fc9cc"); T("Tonight, 02:14", 30, 32, 256, "#8a96a8", "left", "normal");
    g.fillStyle = "rgba(229,72,77,0.18)"; rr(g, x + 20 * s, y + 300 * s, 472 * s, 330 * s, 26 * s); g.fill(); g.fillStyle = "#e5484d"; g.fillRect(x + 20 * s, y + 300 * s, 10 * s, 330 * s);
    T("REFUSED", 64, 52, 390, "#ff8a8d"); T("BY TECHNICIAN", 40, 52, 450); T("Review required", 38, 52, 560, "#f3c58f");
  } else if (v === "call") { // the 999 call (beat 10)
    g.fillStyle = "#0e131c"; g.fillRect(x, y, w, 150 * s); T("02:22", 26, 256, 40, "#cfe3e4", "center", "normal");
    T("999", 120, 256, 330, "#ffffff", "center"); T("Emergency call", 34, 256, 400, "#9fc9cc", "center", "normal");
    T("Police", 46, 256, 480, "#f3c58f", "center"); T("00:14", 40, 256, 560, "#cfe3e4", "center", "normal");
    g.fillStyle = "#e5484d"; g.beginPath(); g.arc(x + 256 * s, y + 800 * s, 64 * s, 0, 7); g.fill();
  } else if (v === "text") { // the job, texted straight to the on-call phone (beat 1): no booking, no office
    T("the only 24-hour locksmith in town", 22, 32, 146 - 4, "#cfe3e4", "left", "normal");
    T("ON-CALL PHONE", 28, 32, 214, "#9fc9cc"); T("Text from 07700 900461", 26, 32, 256, "#8a96a8", "left", "normal");
    g.fillStyle = "#2d3a4d"; rr(g, x + 20 * s, y + 290 * s, 440 * s, 330 * s, 34 * s); g.fill();
    T("Locked out.", 46, 48, 360); T("9 Alder Row.", 46, 48, 420); T("I'll pay double.", 42, 48, 490, "#f3c58f"); T("Cash.", 42, 48, 550, "#f3c58f");
    T("02:14", 28, 48, 600, "#8a96a8", "left", "normal");
  } else { // job card (beat 1)
    T("the only 24-hour locksmith in town", 22, 32, 146 - 4, "#cfe3e4", "left", "normal");
    T("NEW JOB", 30, 32, 230, "#f3c58f"); T("LOCKOUT", 64, 32, 310); T("9 ALDER ROW", 48, 32, 380); T("02:14", 48, 32, 450, "#9fc9cc");
  }
  g.restore();
};

// ---------------------------------------------------------------- fpHands: the first-person hands
// One ink-drawn card per pose, drawn in the cast's style (plum ink #241726, flat colour, a soft highlight): dark work
// gloves, the cuff of a teal work jacket. A card stands upright facing +z (toward the camera behind it); place it about
// 0.35-0.45 m in front of a first-person `at` camera, below the eyeline. Variants:
//   phone:   both hands holding the phone upright, screen to the camera; the screen shows the address History (8b)
//   job:     the same, showing the night job card (1b)
//   tools:   a gloved hand holding the tension wrench in the keyway, the pick lying beside it (6b): place it at the lock
const GLOVE = "#4a5368", GLOVE_HI = "#6f7a91", CUFF = "#2f6f78", CUFF_HI = "#4c929b", STITCH = "#f08a32";
type P = [number, number];
const pathP = (g: CanvasRenderingContext2D, pts: P[]) => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); };
const inkFill = (g: CanvasRenderingContext2D, pts: P[], fill: string, lw = 9) => { pathP(g, pts); g.fillStyle = fill; g.fill(); g.lineJoin = "round"; g.strokeStyle = INK; g.lineWidth = lw; g.stroke(); };
type HandCols = { glove: string; hi: string; cuff: string; cuffHi: string; stitch: string };
const MY_HAND: HandCols = { glove: GLOVE, hi: GLOVE_HI, cuff: CUFF, cuffHi: CUFF_HI, stitch: STITCH };
const finger = (g: CanvasRenderingContext2D, x: number, y: number, len: number, wd: number, ang: number, c: HandCols = MY_HAND) => {
  g.save(); g.translate(x, y); g.rotate(ang);
  g.beginPath(); g.moveTo(-wd / 2, 0); g.lineTo(-wd / 2, -len + wd / 2); g.arc(0, -len + wd / 2, wd / 2, Math.PI, 0); g.lineTo(wd / 2, 0); g.closePath();
  g.fillStyle = c.glove; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();
  g.fillStyle = c.hi; g.fillRect(-wd / 2 + 7, -len + wd * 0.7, wd * 0.18, len * 0.55);
  g.restore();
};
const hand = (g: CanvasRenderingContext2D, cx: number, cy: number, s: number, side: -1 | 1, c: HandCols = MY_HAND) => {
  // a gloved hand gripping from below/side: palm block, four fingers curled forward, thumb up; the jacket cuff below
  const X = (dx: number) => cx + side * dx * s, Y = (dy: number) => cy + dy * s;
  inkFill(g, [[X(-95), Y(210)], [X(95), Y(210)], [X(110), Y(420)], [X(-110), Y(420)]], c.cuff, 9);                     // sleeve
  g.fillStyle = c.cuffHi; g.fillRect(Math.min(X(-80), X(-40)), Y(230), 40 * s, 170 * s);
  inkFill(g, [[X(-100), Y(150)], [X(100), Y(150)], [X(104), Y(225)], [X(-104), Y(225)]], c.cuff, 9);                   // cuff band
  g.fillStyle = c.stitch; g.fillRect(Math.min(X(-96), X(96)), Y(184), 192 * s, 6 * s);
  inkFill(g, [[X(-82), Y(-20)], [X(70), Y(-40)], [X(92), Y(60)], [X(86), Y(160)], [X(-86), Y(160)], [X(-96), Y(60)]], c.glove, 9); // palm
  for (let k = 0; k < 4; k++) finger(g, X(-60 + k * 42), Y(-18 - (k === 1 || k === 2 ? 8 : 0)), (k === 3 ? 92 : 112) * s, 40 * s, side * (-0.06 + k * 0.03), c);
  g.save(); g.translate(X(-92), Y(70)); g.rotate(side * -0.75);                                                          // thumb
  g.beginPath(); g.moveTo(-22 * s, 0); g.lineTo(-22 * s, -110 * s); g.arc(0, -110 * s, 22 * s, Math.PI, 0); g.lineTo(22 * s, 0); g.closePath();
  g.fillStyle = c.glove; g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.restore();
};
const handsTex = (v0: string) => { const v = v0.startsWith("watch") ? "watch" : v0; return stex(`loHands_${v}`, 1024, 1024, (g) => {
  g.clearRect(0, 0, 1024, 1024);
  if (v === "tools") {
    // the pick, resting beside the keyway; the tension wrench in it, gripped by a gloved hand from below right
    g.lineCap = "round";
    g.strokeStyle = INK; g.lineWidth = 22; g.beginPath(); g.moveTo(380, 470); g.lineTo(600, 640); g.stroke();
    g.strokeStyle = "#c9ced6"; g.lineWidth = 12; g.beginPath(); g.moveTo(380, 470); g.lineTo(600, 640); g.stroke();      // pick shaft
    g.strokeStyle = INK; g.lineWidth = 20; g.beginPath(); g.moveTo(380, 470); g.lineTo(352, 452); g.stroke();
    g.strokeStyle = INK; g.lineWidth = 24; g.beginPath(); g.moveTo(470, 380); g.lineTo(470, 500); g.lineTo(580, 560); g.stroke();
    g.strokeStyle = "#9aa3ae"; g.lineWidth = 13; g.beginPath(); g.moveTo(470, 380); g.lineTo(470, 500); g.lineTo(580, 560); g.stroke(); // wrench
    hand(g, 610, 650, 1.3, 1);
    return;
  }
  if (v === "licence") {
    // the licence held up in both gloves (the card itself is its own lit plane)
    hand(g, 300, 720, 0.95, 1); hand(g, 724, 720, 0.95, -1);
    return;
  }
  if (v === "flap") {
    // looking in through the letterbox: the brass plate fills the view, the slot is open, my glove holds the flap up
    g.fillStyle = "#2a2c30"; g.fillRect(0, 0, 1024, 1024);
    g.fillStyle = "#8a7440"; rr(g, 60, 300, 904, 460, 36); g.fill(); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
    g.clearRect(110, 360, 804, 340);                                                                                   // the slot: the hall beyond
    g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(110, 360, 804, 340);
    inkFill(g, [[110, 250], [914, 250], [900, 360], [124, 360]], "#b39652", 10);                                      // the flap, pushed up
    return;
  }
  if (v === "pocket") {
    // looking down at my chest: the jacket's breast pocket, the phone (call still live: its screen glows at the top
    // edge) going in, my glove pushing it down
    inkFill(g, [[0, 560], [1024, 500], [1024, 1024], [0, 1024]], CUFF, 10);
    g.fillStyle = CUFF_HI; g.fillRect(120, 600, 60, 400); g.strokeStyle = INK; g.lineWidth = 8; g.beginPath(); g.moveTo(330, 548); g.lineTo(330, 1024); g.stroke(); // zip
    inkFill(g, [[500, 640], [780, 625], [790, 900], [505, 910]], "#2a6168", 9);                                          // pocket
    inkFill(g, [[560, 450], [720, 450], [720, 690], [560, 690]], "#17191e", 9);                                           // the phone, half in
    g.fillStyle = "#9fd6ff"; g.fillRect(572, 462, 136, 26);                                                                  // its lit screen edge
    inkFill(g, [[490, 620], [790, 605], [795, 660], [492, 672]], CUFF, 9); g.fillStyle = STITCH; g.fillRect(500, 640, 285, 6); // pocket flap
    hand(g, 640, 420, 0.85, -1);
    return;
  }
  if (v === "horn") {
    // my hand rising toward the horn pad: the back of the glove, fingers spread, the cuff below
    hand(g, 512, 520, 1.25, 1);
    return;
  }
  if (v === "handle") {
    // the door's trim panel and its chrome lever, my glove closing on it
    g.fillStyle = "#2f333b"; rr(g, 40, 120, 944, 860, 60); g.fill(); g.strokeStyle = INK; g.lineWidth = 10; g.stroke();
    inkFill(g, [[250, 400], [760, 380], [770, 450], [255, 470]], "#c4cad2", 9); inkFill(g, [[200, 360], [300, 360], [300, 510], [200, 510]], "#5b6270", 9);
    hand(g, 600, 470, 1.05, 1);
    return;
  }
  if (v === "case") {
    // the closed tool case held up by its handle (KESTREL orange stripe)
    g.lineCap = "round"; g.strokeStyle = INK; g.lineWidth = 34; g.beginPath(); g.arc(512, 560, 90, Math.PI, 0); g.stroke();
    g.strokeStyle = "#2a2d34"; g.lineWidth = 20; g.beginPath(); g.arc(512, 560, 90, Math.PI, 0); g.stroke();
    inkFill(g, [[220, 560], [804, 560], [804, 1000], [220, 1000]], "#1d2026", 10); g.fillStyle = "#f08a32"; g.fillRect(226, 700, 572, 30);
    inkFill(g, [[470, 580], [554, 580], [554, 640], [470, 640]], "#9aa3ae", 7);
    hand(g, 512, 470, 0.95, 1);
    return;
  }
  if (v.startsWith("watch")) {
    // my wrist turned up to read the watch on the glove's cuff; the face is its own glowing plane
    hand(g, 512, 330, 1.0, 1);
    inkFill(g, [[400, 470], [624, 470], [624, 590], [400, 590]], "#15171b", 10);                                         // strap
    inkFill(g, [[420, 455], [604, 455], [604, 605], [420, 605]], "#1b1d22", 10);                                         // case
    return;
  }
  // phone: held upright in both hands, screen facing the camera
  const PX = 312, PY = 150, PWd = 400, PHd = 760;
  inkFill(g, [[PX - 18, PY - 18], [PX + PWd + 18, PY - 18], [PX + PWd + 18, PY + PHd + 18], [PX - 18, PY + PHd + 18]], "#17191e", 10);
  hand(g, 250, 700, 1.0, 1); hand(g, 774, 700, 1.0, -1);
  return void PHd;
}); };
// keyAtLock (beat 6): his bare hand, his green coat's cuff, his old brass key, its tip jammed against the new cylinder
// beside the keyway (a card like fpHands "tools", placed at the lock); each step bumps it back off the cylinder and on
const MARSH_HAND: HandCols = { glove: "#eec5a4", hi: "#f7dcc4", cuff: "#4c6a3a", cuffHi: "#628550", stitch: "#d9d4c8" };
const keyTex = () => stex("loMarshKey", 1024, 1024, (g) => {
  g.clearRect(0, 0, 1024, 1024); g.lineCap = "round"; g.lineJoin = "round";
  const BR = "#a8823a", BR_HI = "#cfa95a";
  inkFill(g, [[452, 362], [690, 350], [690, 418], [640, 418], [628, 440], [604, 418], [582, 446], [560, 418], [538, 438], [516, 418], [452, 408]], BR, 10); // the blade, worn teeth
  g.fillStyle = BR_HI; g.fillRect(470, 368, 200, 10);
  g.beginPath(); g.arc(770, 384, 92, 0, 7); g.fillStyle = BR; g.fill(); g.strokeStyle = INK; g.lineWidth = 11; g.stroke(); // the bow
  g.beginPath(); g.arc(800, 360, 26, 0, 7); g.fillStyle = "#3a3530"; g.fill(); g.stroke();
  g.strokeStyle = INK; g.lineWidth = 9; for (const [a, b, c, d] of [[420, 330, 392, 300], [416, 386, 380, 386], [420, 440, 392, 470]]) { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); } // the bump
  hand(g, 830, 520, 1.05, 1, MARSH_HAND);
});
const keyAtLockRig = (a: At): PropRig => {
  const root = rigRoot(a), m = mesh(plane(HANDS_W, HANDS_W), cardMat(keyTex(), NIGHT_TINT), 0, HANDS_W / 2, 0); root.add(m);
  return { root, update: ({ step = 0 }) => { m.position.x = Math.floor(step + 0.001) % 2 === 1 ? 0.018 : 0; } };
};

// the screen is its own glowing plane (readable, not tinted by the night)
const PHONE_SCREEN = { x: 312 / 1024, y: 150 / 1024, w: 400 / 1024, h: 760 / 1024 };
const screenTex = (v: string) => stex(`loScreen_${v}`, 512, 974, (g) => drawScreen(g, v, 0, 0, 512, 974));
const HANDS_W = 0.34; // the card's width in metres (the phone on it is about 13 x 25 cm: a big phone held close)
const licenceTex = () => stex("loLicence", 512, 326, (g) => {
  g.fillStyle = "#f1d6dc"; g.fillRect(0, 0, 512, 326); g.fillStyle = "#c94f6d"; g.fillRect(0, 0, 512, 54);
  g.fillStyle = "#fff"; g.font = FONT(28); g.textAlign = "left"; g.fillText("DRIVING LICENCE", 20, 38);
  g.fillStyle = "#cbd2dc"; g.fillRect(24, 76, 150, 190); g.fillStyle = "#eec5a4"; g.beginPath(); g.arc(99, 150, 46, 0, 7); g.fill(); g.fillStyle = "#3b2c22"; g.fillRect(55, 100, 88, 28); g.fillStyle = "#4c6a3a"; g.fillRect(44, 205, 110, 61);
  g.fillStyle = "#2a2a30"; g.font = FONT(44); g.fillText("D. MARSH", 196, 128); g.font = FONT(36, "normal"); g.fillText("9 ALDER ROW", 196, 190);
  g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, 506, 320);
});
const WATCH_FACE = { x: 436 / 1024, y: 472 / 1024, w: 152 / 1024, h: 116 / 1024 };
const watchTimes = (v: string) => (v.split(":").length > 1 ? v.slice(v.indexOf(":") + 1).split("|") : ["04:00"]);
const watchTex = (t: string) => stex(`loWatch_${t}`, 256, 196, (g) => {
  g.fillStyle = "#0d1a14"; g.fillRect(0, 0, 256, 196); g.fillStyle = "#7fe0a8"; g.font = FONT(26); g.textAlign = "center"; g.fillText("TIMER", 128, 40);
  g.font = FONT(68); g.fillStyle = "#c8ffd9"; g.fillText(t, 128, 140);
});
const watchFaceAt = (W: number) => ({ cx: (WATCH_FACE.x + WATCH_FACE.w / 2 - 0.5) * W, cy: W - (WATCH_FACE.y + WATCH_FACE.h / 2) * W, w: WATCH_FACE.w * W, h: WATCH_FACE.h * W });
const fpHandsRig = (a: At, v = "watch"): PropRig => {
  const root = rigRoot(a), W = HANDS_W, times = watchTimes(v), f = watchFaceAt(W);
  root.add(mesh(plane(W, W), cardMat(handsTex(v), NIGHT_TINT), 0, W / 2, 0));
  const fm = new THREE.MeshBasicMaterial({ map: watchTex(times[0]), toneMapped: false }); root.add(mesh(plane(f.w, f.h), fm, f.cx, f.cy, 0.002));
  return { root, update: ({ step = 0 }) => { const t = watchTex(times[Math.min(times.length - 1, Math.floor(step + 0.001))]); if (fm.map !== t) { fm.map = t; fm.needsUpdate = true; } } };
};
const fpHandsBuild = (b: Batch, a: At, v = "phone") => {
  const m = frame(a), W = HANDS_W;
  b.add(plane(W, W), cardMat(handsTex(v), NIGHT_TINT), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, W / 2, 0)));
  if (v === "pocket") b.add(plane((136 / 1024) * W, (26 / 1024) * W), glow("loPocketGlow", () => ({ color: "#9fd6ff", toneMapped: false })), m.clone().multiply(new THREE.Matrix4().makeTranslation(((572 + 68) / 1024 - 0.5) * W, W - ((462 + 13) / 1024) * W, 0.002)));
  if (v.startsWith("watch")) { const f = watchFaceAt(W); b.add(plane(f.w, f.h), cardMat(watchTex(watchTimes(v)[0]), "#ffffff", true), m.clone().multiply(new THREE.Matrix4().makeTranslation(f.cx, f.cy, 0.002))); }
  if (v === "licence") {
    const lw = 0.17, lh = 0.108;
    b.add(plane(lw, lh), cardMat(licenceTex(), "#d9deea", true), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.2, 0.002)));
  }
  if (v === "phone" || v === "job" || v === "call" || v === "refused" || v === "text" || v === "record") {
    const sv = v === "phone" ? "history" : v, sw = PHONE_SCREEN.w * W, sh = PHONE_SCREEN.h * W;
    const cx = (PHONE_SCREEN.x + PHONE_SCREEN.w / 2 - 0.5) * W, cy = W - (PHONE_SCREEN.y + PHONE_SCREEN.h / 2) * W;
    b.add(plane(sw, sh), cardMat(screenTex(sv), "#ffffff", true), m.clone().multiply(new THREE.Matrix4().makeTranslation(cx, cy, 0.002)));
  }
};

// ---------------------------------------------------------------- vanCab: the cab around the driver's eye
// `at` = the dashboard point 0.75 m ahead of the driver's eye and 0.35 m below it, yaw = the van's forward direction as a
// prop yaw (forward = local +z). Right-hand drive: the driver sits right of the cab's centre, so the cab's centre is 0.42 m to the driver's left.
// Parts (local, metres from the eye): dashboard and wheel ahead and below, the windscreen frame (header, A-pillars,
// scuttle), the driver's visor with the warning letter clipped to it, the rear-view mirror up and to the left. The
// glass itself isn't modelled (it would only add reflections the engine can't render).
// Variant mirror: the mirror glass shows my eyes, lit by the phone (12a); default: it shows the dark cab behind.
const letterTex = () => stex("loLetter", 512, 400, (g) => {
  g.fillStyle = "#f4efe3"; g.fillRect(0, 0, 512, 400); g.fillStyle = "#1f5c63"; g.fillRect(0, 0, 512, 64);
  g.fillStyle = "#fff"; g.font = FONT(30); g.textAlign = "left"; g.fillText(LETTER[0], 24, 44);
  g.fillStyle = "#b8322b"; g.font = FONT(52); g.fillText(LETTER[1], 24, 132);
  g.fillStyle = "#2a2a30"; g.font = FONT(36, "normal"); [LETTER[2], LETTER[3], LETTER[4], LETTER[5]].forEach((l, i) => g.fillText(l, 24, 196 + i * 50));
  g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, 506, 394);
});
const mirrorTex = (eyes: boolean) => stex(`loMirror${eyes ? 1 : 0}`, 512, 192, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 192); gr.addColorStop(0, "#1b2233"); gr.addColorStop(1, "#0d1119"); g.fillStyle = gr; g.fillRect(0, 0, 512, 192);
  g.fillStyle = "rgba(160,180,220,0.10)"; g.beginPath(); g.moveTo(40, 0); g.lineTo(120, 0); g.lineTo(60, 192); g.lineTo(-20, 192); g.fill(); // a glint
  if (!eyes) return;
  // my eyes in the mirror, lit from below by the phone: the cast's eye style (white almonds, round dark pupils, brows)
  g.fillStyle = "#9fb0d8"; g.globalAlpha = 0.9; rr(g, 70, 20, 372, 172, 60); g.fill(); g.globalAlpha = 1;              // phone-lit skin
  const eye = (cx: number) => {
    g.fillStyle = "#f4f1ea"; g.beginPath(); g.ellipse(cx, 104, 52, 30, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
    g.fillStyle = INK; g.beginPath(); g.arc(cx - 16, 108, 17, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.arc(cx - 22, 101, 5, 0, 7); g.fill();
    g.strokeStyle = INK; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(cx - 52, 52); g.lineTo(cx + 46, 44); g.stroke(); // brow: low, tense
  };
  eye(176); eye(336);
  g.strokeStyle = "rgba(36,23,38,0.6)"; g.lineWidth = 6; g.beginPath(); g.moveTo(256, 120); g.lineTo(248, 186); g.stroke(); // the bridge of the nose
});
const vanCabBuild = (b: Batch, a: At, v?: string) => {
  // `at` is the dashboard point 0.75 m ahead of the driver's eye and 0.35 m below it; every part is placed from the eye
  const m = frame(a).multiply(new THREE.Matrix4().makeTranslation(0, 0.35, -0.75)), dark = col("#23262d"), trimC = col("#30343c"), pillar = col("#2a2d34");
  // local frame: x = the driver's right... keep it simple: +z forward, +x to the driver's LEFT (prop yaw convention)
  const L = 0.42; // the cab centre is this far to the driver's left
  // dashboard (top at eye -0.42 m), from 0.45 to 1.0 m ahead, across the cab (1.9 m)
  box(b, dark, m, -1.0 + L, 0.95 + L, -0.95, -0.42, 0.45, 1.05);
  box(b, trimC, m, -1.0 + L, 0.95 + L, -0.44, -0.40, 0.42, 0.62);                       // the dash top's lip
  // the wheel in front of the driver (a torus tilted back) and its horn pad
  const wheel = new THREE.TorusGeometry(0.19, 0.022, 10, 36);
  b.add(wheel, col("#15171b"), m.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(0, -0.47, 0.42), new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.05, 0, 0)), new THREE.Vector3(1, 1, 1))));
  cyl(b, col("#1c1f25"), m, 0, -0.52, 0.45, 0.07, 0.07, 0.04, 16, -1.05);
  // windscreen frame: scuttle (bottom), header (top), A-pillars (raked), 1.0 m ahead at the bottom, 0.62 m at the top
  box(b, pillar, m, -1.0 + L, 0.95 + L, -0.42, -0.36, 1.02, 1.1);                       // scuttle
  box(b, pillar, m, -1.0 + L, 0.95 + L, 0.36, 0.46, 0.55, 0.66);                        // header
  for (const px of [-0.92 + L, 0.88 + L]) {
    const p0 = new THREE.Vector3(px, -0.38, 1.06), p1 = new THREE.Vector3(px, 0.40, 0.6), mid = p0.clone().add(p1).multiplyScalar(0.5), len = p0.distanceTo(p1);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p1.clone().sub(p0).normalize());
    b.add(new THREE.BoxGeometry(0.12, len, 0.08), pillar, m.clone().multiply(new THREE.Matrix4().compose(mid, q, new THREE.Vector3(1, 1, 1))));
  }
  // roof lining strip and the driver's visor (folded down) with the warning letter clipped to its face
  box(b, col("#3a3d44"), m, -1.0 + L, 0.95 + L, 0.46, 0.5, -0.4, 0.66);
  const visorM = m.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(-0.02, 0.33, 0.5), new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.35, 0, 0)), new THREE.Vector3(1, 1, 1)));
  box(b, col("#4a4d55"), visorM, -0.26, 0.26, -0.08, 0.08, -0.012, 0.012);
  b.add(plane(0.17, 0.133), glow("loLetterM", () => ({ map: letterTex(), toneMapped: true, color: "#c7cce0" })), visorM.clone().multiply(new THREE.Matrix4().makeTranslation(-0.1, 0, -0.014)).multiply(new THREE.Matrix4().makeRotationY(Math.PI)));
  // the rear-view mirror: on a stem from the header, centred over the cab, glass facing back toward the driver
  mirrorParts(b, m.clone().multiply(new THREE.Matrix4().makeTranslation(L, 0.3, 0.56)), v === "mirror", false);
};
/** the mirror (housing, glass, stem), from a frame at the mirror's centre in the cab's orientation; withHeader adds the
 *  windscreen header and roof strip above it (the rearMirror prop, used on its own in close shots of the mirror) */
const mirrorParts = (b: Batch, c: THREE.Matrix4, eyes: boolean, withHeader: boolean) => {
  const L = 0.42, mirM = c.clone().multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0.1, Math.PI + 0.6, 0)));
  cyl(b, col("#5b6270"), c, 0, 0.02, 0.04, 0.008, 0.008, 0.1, 8);
  box(b, col("#191b20"), mirM, -0.13, 0.13, -0.048, 0.048, -0.02, 0.012);
  const gm = new THREE.MeshBasicMaterial({ map: mirrorTex(eyes), toneMapped: true, color: eyes ? "#ffffff" : "#c9d2e6" });
  b.add(plane(0.24, 0.086), gm, mirM.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.0125)));
  if (withHeader) {
    box(b, col("#2a2d34"), c, -1.0, 0.95, 0.06, 0.16, -0.01, 0.1);                       // windscreen header (L-relative)
    box(b, col("#3a3d44"), c, -1.0, 0.95, 0.16, 0.2, -0.96, 0.1);                        // roof lining
    void L;
  }
};

// ---------------------------------------------------------------- door9: number 9's front door
// `at` = the bottom centre of the door opening, facing +z (the street). A weathered dark-green door (0.86 x 2.0 m) in a
// cream frame: brass number 9, a brass letterbox at 1.0 m, the bell push on the frame's right with the MARSH label,
// the NEW cylinder (bright chrome, KL stamp) at 1.05 m near the lock edge, around it the paler, unpainted outline where
// a bigger old lock sat, and fresh metal filings glittering on the doormat below.
const DOOR_W = 0.86, DOOR_H = 2.0, LOCK_X = 0.33, LOCK_Y = 1.05;
const doorTex = () => stex("loDoor9", 512, 1190, (g) => {
  g.fillStyle = "#2f4a3c"; g.fillRect(0, 0, 512, 1190);
  // four raised panels, flaking at the edges
  for (const [x, y, w, h] of [[60, 70, 170, 420], [282, 70, 170, 420], [60, 610, 170, 480], [282, 610, 170, 480]]) {
    g.fillStyle = "#35543f"; g.fillRect(x, y, w, h); g.strokeStyle = "rgba(10,20,14,0.55)"; g.lineWidth = 6; g.strokeRect(x, y, w, h);
    g.strokeStyle = "rgba(160,190,165,0.25)"; g.lineWidth = 3; g.strokeRect(x + 6, y + 6, w - 12, h - 12);
  }
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 140; k++) { // flaked paint: pale wood showing through
    const x = r() * 512, y = r() * 1190, w = 3 + r() * 16, h = 2 + r() * 8;
    g.fillStyle = r() > 0.4 ? "rgba(196,170,128,0.55)" : "rgba(20,30,24,0.5)"; g.beginPath(); g.ellipse(x, y, w, h, r() * 3, 0, 7); g.fill();
  }
  // the old lock's outline: a paler rectangle of unweathered paint (bigger than the new cylinder), with screw holes
  const ox = 256 + (LOCK_X / DOOR_W) * 512, oy = 1190 - (LOCK_Y / DOOR_H) * 1190;
  g.fillStyle = "#52745d"; g.fillRect(ox - 40, oy - 78, 80, 150); g.strokeStyle = "rgba(20,35,25,0.6)"; g.lineWidth = 3; g.strokeRect(ox - 40, oy - 78, 80, 150);
  g.fillStyle = "#1a241e"; for (const [dx, dy] of [[-24, -60], [24, -60], [-24, 54], [24, 54]]) { g.beginPath(); g.arc(ox + dx, oy + dy, 5, 0, 7); g.fill(); }
});
const kStampTex = () => stex("loKL", 256, 256, (g) => {
  const gr = g.createRadialGradient(110, 100, 10, 128, 128, 128); gr.addColorStop(0, "#f4f6f8"); gr.addColorStop(1, "#a9b0b9"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  g.fillStyle = "#1a1d22"; rr(g, 116, 60, 24, 96, 10); g.fill(); g.fillRect(100, 132, 56, 18);                     // the keyway
  g.fillStyle = "#3a414b"; g.font = FONT(44); g.textAlign = "center"; g.fillText("KL", 128, 214);                 // the stamp
  g.strokeStyle = "rgba(40,45,52,0.6)"; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 122, 0, 7); g.stroke();
});
const labelTex = () => stex("loMarsh", 256, 96, (g) => { g.fillStyle = "#f3efe4"; g.fillRect(0, 0, 256, 96); g.fillStyle = "#2a2a30"; g.font = FONT(52); g.textAlign = "center"; g.fillText("MARSH", 128, 66); g.strokeStyle = "#8a7a5a"; g.lineWidth = 6; g.strokeRect(3, 3, 250, 90); });
const numTex = () => stex("loNum9", 128, 160, (g) => { g.clearRect(0, 0, 128, 160); g.fillStyle = "#d9b04a"; g.font = FONT(150); g.textAlign = "center"; g.fillText("9", 64, 140); g.strokeStyle = INK; g.lineWidth = 4; g.strokeText("9", 64, 140); });
const filingsTex = () => stex("loFilings", 256, 128, (g) => {
  g.clearRect(0, 0, 256, 128); let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 140; k++) { g.fillStyle = r() > 0.5 ? "rgba(235,240,250,0.95)" : "rgba(190,200,215,0.85)"; g.fillRect(100 + (r() - 0.5) * 150 * r(), 64 + (r() - 0.5) * 80 * r(), 2 + r() * 3, 1 + r() * 2); }
});
const door9Build = (b: Batch, a: At) => {
  const m = frame(a), cream = col("#e8dfcc"), brass = col("#c9a24a");
  // frame (jambs and head) and the slab (2 cm proud of the opening's back)
  box(b, cream, m, -DOOR_W / 2 - 0.08, -DOOR_W / 2, 0, DOOR_H + 0.08, -0.06, 0.03);
  box(b, cream, m, DOOR_W / 2, DOOR_W / 2 + 0.08, 0, DOOR_H + 0.08, -0.06, 0.03);
  box(b, cream, m, -DOOR_W / 2 - 0.08, DOOR_W / 2 + 0.08, DOOR_H, DOOR_H + 0.08, -0.06, 0.03);
  box(b, col("#2f4a3c"), m, -DOOR_W / 2, DOOR_W / 2, 0, DOOR_H, -0.05, -0.006);
  b.add(plane(DOOR_W, DOOR_H), tex("loDoor9", doorTex), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, DOOR_H / 2, -0.005)));
  // brass number and letterbox
  b.add(plane(0.09, 0.11), glow("loNum9M", () => ({ map: numTex(), transparent: true, alphaTest: 0.1, color: "#b9b39c" })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 1.55, 0.0)));
  box(b, brass, m, -0.16, 0.16, 0.97, 1.03, -0.006, 0.012); box(b, col("#1a1612"), m, -0.13, 0.13, 0.985, 1.015, 0.012, 0.0135);
  // the new cylinder: a bright chrome ring proud of the door, its face the KL stamp texture
  cyl(b, col("#c4cad2"), m, LOCK_X, LOCK_Y, -0.006, 0.024, 0.024, 0.016, 28, Math.PI / 2);
  b.add(new THREE.CircleGeometry(0.021, 32), glow("loKLM", () => ({ map: kStampTex(), color: "#c9cfdc" })), m.clone().multiply(new THREE.Matrix4().makeTranslation(LOCK_X, LOCK_Y, 0.0105)));
  // bell push and the MARSH label on the right-hand jamb face
  cyl(b, col("#d8d2c4"), m, DOOR_W / 2 + 0.04, 1.4, 0.03, 0.02, 0.02, 0.01, 16, Math.PI / 2);
  b.add(plane(0.07, 0.026), glow("loMarshM", () => ({ map: labelTex(), color: "#c9c4b4" })), m.clone().multiply(new THREE.Matrix4().makeTranslation(DOOR_W / 2 + 0.04, 1.34, 0.032)));
  // doormat and the fresh filings on it, under the lock
  box(b, col("#5a4a36"), m, -0.38, 0.38, 0, 0.012, 0.03, 0.5);
  b.add(plane(0.3, 0.15), glow("loFilingsM", () => ({ map: filingsTex(), transparent: true, depthWrite: false, toneMapped: false, color: "#d8dde6" })), m.clone().multiply(new THREE.Matrix4().makeTranslation(LOCK_X - 0.12, 0.0135, 0.14)).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2)));
};

// ---------------------------------------------------------------- upstairsWindow: number 9's upstairs room
// `at` = the bottom centre of the window opening (1.1 x 1.3 m), facing +z; the room behind it is a warm backdrop 0.9 m
// deep, where actors can stand (floor 0.55 m below the sill). Steps: 0 a thin strip of light under the closed curtain
// (the light on); 1 off (dark); 2 on, the curtain drawn open.
const UW = 1.1, UH = 1.3;
const roomTex = () => stex("loRoom", 256, 256, (g) => { const gr = g.createRadialGradient(128, 100, 10, 128, 128, 180); gr.addColorStop(0, "#ffe2a6"); gr.addColorStop(1, "#d98c4c"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); g.fillStyle = "rgba(120,70,40,0.35)"; g.fillRect(150, 40, 60, 80); });
const curtainTex = () => stex("loCurtain", 256, 512, (g) => { g.fillStyle = "#7d6a8e"; g.fillRect(0, 0, 256, 512); for (let x = 0; x < 256; x += 32) { g.fillStyle = "rgba(0,0,0,0.22)"; g.fillRect(x, 0, 12, 512); g.fillStyle = "rgba(255,255,255,0.08)"; g.fillRect(x + 14, 0, 6, 512); } });
const upstairsRig = (a: At): PropRig => {
  const root = rigRoot(a);
  const room = new THREE.MeshBasicMaterial({ map: roomTex(), toneMapped: false }), dark = new THREE.MeshBasicMaterial({ color: "#0b0e16" });
  const back = mesh(plane(UW + 0.6, UH + 0.9), room, 0, UH / 2, -0.9); root.add(back);
  for (const sx of [-1, 1]) { const side = mesh(plane(0.9, UH + 0.9), room, sx * (UW / 2 + 0.3), UH / 2, -0.45); side.rotation.y = -sx * Math.PI / 2; root.add(side); }
  const curtainM = new THREE.MeshLambertMaterial({ map: curtainTex() }), cl = mesh(plane(UW / 2 + 0.06, UH - 0.14), curtainM, -UW / 4, UH / 2 + 0.07, -0.06), cr = cl.clone(); cr.position.x = UW / 4; root.add(cl, cr);
  const strip = mesh(plane(UW, 0.14), new THREE.MeshBasicMaterial({ color: "#ffd089", toneMapped: false }), 0, 0.07, -0.07); root.add(strip);
  const bars = col("#efe8d8"); for (const [w, h, x, y] of [[UW + 0.1, 0.06, 0, UH + 0.03], [UW + 0.1, 0.06, 0, -0.03], [0.06, UH, -UW / 2 - 0.02, UH / 2], [0.06, UH, UW / 2 + 0.02, UH / 2], [0.04, UH, 0, UH / 2]] as const) root.add(mesh(new THREE.BoxGeometry(w, h, 0.06), bars, x, y, 0.0));
  return { root, update: ({ step = 0 }) => {
    const s = Math.floor(step + 0.001), on = s !== 1, open = s >= 2;
    back.material = on ? room : dark; (root.children[1] as THREE.Mesh).material = on ? room : dark; (root.children[2] as THREE.Mesh).material = on ? room : dark;
    strip.visible = s === 0; cl.visible = cr.visible = true;
    const pull = open ? 0.42 : 0; cl.position.x = -UW / 4 - pull; cr.position.x = UW / 4 + pull; cl.scale.x = cr.scale.x = open ? 0.35 : 1;
  } };
};
// the static version is the first state: the light on behind the closed curtain, a thin strip of it under the hem
const upstairsStatic = (b: Batch, a: At) => {
  const m = frame(a), room = glow("loRoomM", () => ({ map: roomTex(), toneMapped: false }));
  panel(b, room, m, 0, UH / 2, -0.9, UW + 0.6, UH + 0.9);
  panel(b, lamCurtain(), m, 0, UH / 2 + 0.07, -0.06, UW, UH - 0.14);
  panel(b, glow("loStripM", () => ({ color: "#ffd089", toneMapped: false })), m, 0, 0.07, -0.07, UW, 0.14);
  const bars = col("#efe8d8"); for (const [w, h, x, y] of [[UW + 0.1, 0.06, 0, UH + 0.03], [UW + 0.1, 0.06, 0, -0.03], [0.06, UH, -UW / 2 - 0.02, UH / 2], [0.06, UH, UW / 2 + 0.02, UH / 2], [0.04, UH, 0, UH / 2]] as const) box(b, bars, m, x - w / 2, x + w / 2, y - h / 2, y + h / 2, -0.03, 0.03);
};
const lamCurtainM: { m?: THREE.Material } = {};
const lamCurtain = () => (lamCurtainM.m ??= new THREE.MeshLambertMaterial({ map: curtainTex() }));

// ---------------------------------------------------------------- windowLight: a window across the road lighting up
// a warm lit pane (0.85 x 1.25 m, the size of the library houses' painted windows), `at` = its bottom centre, facing
// +z; off before step 1 (invisible: the painted dark window shows), lit from step 1.
const paneTex = () => stex("loPane", 128, 192, (g) => { const gr = g.createLinearGradient(0, 0, 0, 192); gr.addColorStop(0, "#ffd99a"); gr.addColorStop(1, "#f0a95c"); g.fillStyle = gr; g.fillRect(0, 0, 128, 192); g.fillStyle = "#f7f2e8"; g.fillRect(60, 0, 8, 192); g.fillRect(0, 92, 128, 8); });
const windowLightRig = (a: At): PropRig => {
  const root = rigRoot(a), p = mesh(plane(0.85, 1.25), new THREE.MeshBasicMaterial({ map: paneTex(), toneMapped: false }), 0, 0.625, 0); p.layers.set(NOINK); root.add(p);
  return { root, update: ({ step = 0 }) => { p.visible = step >= 1; } };
};

// ---------------------------------------------------------------- shadowDecal: a long man's shadow on the ground
// `at` = where his feet are, the shadow stretching along local +z (away from the light), 3.2 m long
const shadowTex = () => stex("loShadow", 128, 512, (g) => {
  g.clearRect(0, 0, 128, 512); g.fillStyle = "rgba(0,0,0,1)";
  g.beginPath(); g.moveTo(44, 0); g.lineTo(84, 0); g.lineTo(96, 330); g.lineTo(86, 410); g.lineTo(100, 440); g.lineTo(64, 512); g.lineTo(28, 440); g.lineTo(42, 410); g.lineTo(32, 330); g.closePath(); g.fill();
});
const shadowBuild = (b: Batch, a: At) => { const m = frame(a); b.add(plane(0.75, 3.2), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, opacity: 0.45, depthWrite: false, color: "#000000" }), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.014, 1.6)).multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2))); };

// ---------------------------------------------------------------- familyDrawing: Sam's drawing in the hall
// a child's crayon drawing pinned to a wall (0.42 x 0.3 m), `at` = its centre, facing +z: MUMMY, ME, BISCUIT (a dog),
// DADDY in a green coat
const drawingTex = () => stex("loDrawing", 512, 366, (g) => {
  g.fillStyle = "#fbf7ec"; g.fillRect(0, 0, 512, 366); g.lineCap = "round"; g.lineJoin = "round";
  const fig = (x: number, h: number, body: string, label: string) => {
    g.strokeStyle = "#3a3340"; g.lineWidth = 6; g.beginPath(); g.arc(x, 250 - h, 22, 0, 7); g.stroke();
    g.fillStyle = body; g.beginPath(); g.moveTo(x - 26, 274 - h + 40); g.lineTo(x + 26, 274 - h + 40); g.lineTo(x + 18, 290); g.lineTo(x - 18, 290); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - 12, 290); g.lineTo(x - 16, 320); g.moveTo(x + 12, 290); g.lineTo(x + 16, 320); g.stroke();
    g.fillStyle = "#3a3340"; g.font = FONT(24); g.textAlign = "center"; g.fillText(label, x, 352);
  };
  fig(80, 110, "#b48fd0", "MUMMY"); fig(190, 60, "#5a8ee0", "ME");
  g.fillStyle = "#c9894e"; g.beginPath(); g.ellipse(300, 290, 40, 20, 0, 0, 7); g.fill(); g.strokeStyle = "#3a3340"; g.lineWidth = 6; g.stroke(); g.beginPath(); g.arc(342, 270, 14, 0, 7); g.fill(); g.stroke();
  g.fillStyle = "#3a3340"; g.font = FONT(22); g.textAlign = "center"; g.fillText("BISCUIT", 305, 352);
  fig(430, 130, "#4c8a3a", "DADDY");
  g.fillStyle = "#f2c94c"; g.beginPath(); g.arc(470, 50, 26, 0, 7); g.fill();
});
const drawingBuild = (b: Batch, a: At) => { const m = frame(a); b.add(plane(0.42, 0.3), glow("loDrawingM", () => ({ map: drawingTex(), color: "#b8bccb" })), m); box(b, col("#d23c3c"), m, -0.012, 0.012, 0.13, 0.142, 0, 0.006); };

// ---------------------------------------------------------------- groundBrick: the brick, dropped on the lawn
// a red house brick (21.5 x 10 x 6.5 cm) lying on the ground with a clod of soil, `at` = where it lies; the rig version
// is hidden until step 1 (the moment it's dropped)
const groundBrickParts = (b: Batch, m: THREE.Matrix4) => {
  box(b, col("#b5523a"), m, -0.107, 0.107, 0.02, 0.085, -0.05, 0.05); box(b, col("#cf6a4c"), m, -0.1, 0.1, 0.085, 0.088, -0.045, 0.045);
  box(b, col("#5a4030"), m, 0.04, 0.09, 0.02, 0.05, 0.03, 0.07);
};
const groundBrickRig = (a: At): PropRig => {
  const root = rigRoot(a), g = new THREE.Group();
  g.add(mesh(new THREE.BoxGeometry(0.214, 0.065, 0.1), col("#b5523a"), 0, 0.052, 0), mesh(new THREE.BoxGeometry(0.05, 0.03, 0.04), col("#5a4030"), 0.065, 0.035, 0.05));
  root.add(g);
  return { root, update: ({ step = 0 }) => { g.visible = step >= 1; } };
};

// ---------------------------------------------------------------- policeLight: the blue light washing the house fronts
// a large soft blue glow (24 x 7 m, additive), `at` = its bottom centre, facing +z: stand it just in front of a row of
// house fronts. Off until step 1; each later step toggles it (a strobe: give the steps a quick rhythm)
const blueTex = () => stex("loBlue", 256, 128, (g) => { const gr = g.createRadialGradient(128, 70, 6, 128, 70, 140); gr.addColorStop(0, "rgba(90,150,255,0.95)"); gr.addColorStop(1, "rgba(40,80,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 128); });
const policeLightRig = (a: At): PropRig => {
  const root = rigRoot(a), p = mesh(plane(24, 7), new THREE.MeshBasicMaterial({ map: blueTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }), 0, 3.5, 0);
  p.layers.set(NOINK); root.add(p);
  return { root, update: ({ step = 0 }) => { const s = Math.floor(step + 0.001); p.visible = s >= 1 && s % 2 === 1; } };
};
const OFFICER: Look = { name: "Officer", build: "adult", skin: "#dca888", seed: 94, hair: { style: "short", color: "#201a16" },
  top: { style: "shirt", color: "#eef1f4" }, layer: { style: "blazer", color: "#d6e03a" }, hat: { style: "cap", color: "#1a1f2e" }, legs: "#1f2433", shoes: "#15171b" };

// ---------------------------------------------------------------- the locksmith (me), seen in third-person shots
const LOCKSMITH: Look = { name: "Locksmith", build: "adult", skin: "#e6b896", seed: 95, hair: { style: "short", color: "#5a3e2a" },
  top: { style: "hoodie", color: "#2f6f78", accent: "#f08a32" }, hat: { style: "beanie", color: "#20304a" }, legs: "#2b2f3a", shoes: "#d8d2c4" };
const cashItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 2 * u * s, cy = y - 4 * u;
  for (const [a, c] of [[-0.35, "#8fc7a0"], [0, "#f2b6c2"], [0.35, "#a9c4ef"]] as const) {
    const ca = Math.cos(a), sa = Math.sin(a), R = (px: number, py: number): [number, number] => [cx + (px * ca - py * sa) * s, cy + px * sa + py * ca];
    p.poly([R(-4 * u, 6 * u), R(4 * u, 6 * u), R(9 * u, -20 * u), R(-1 * u, -21 * u)], c, 2.2 * u);
  }
};

const toolCaseItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 4 * u * s, cy = y + 6 * u;
  p.poly([[cx - 20 * u, cy - 10 * u], [cx + 20 * u, cy - 10 * u], [cx + 20 * u, cy + 14 * u], [cx - 20 * u, cy + 14 * u]], "#1d2026", 3 * u);
  p.poly([[cx - 20 * u, cy - 2 * u], [cx + 20 * u, cy - 2 * u], [cx + 20 * u, cy + 1 * u], [cx - 20 * u, cy + 1 * u]], "#f08a32", 1.2 * u);
  p.stroke([[cx - 7 * u, cy - 10 * u], [cx - 7 * u, cy - 17 * u], [cx + 7 * u, cy - 17 * u], [cx + 7 * u, cy - 10 * u]], 3 * u, "#2a2d34");
};

// ---------------------------------------------------------------- item: brick
const brickItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 4 * u * s, cy = y - 2 * u;
  p.poly([[cx - 17 * u, cy - 9 * u], [cx + 17 * u, cy - 9 * u], [cx + 17 * u, cy + 9 * u], [cx - 17 * u, cy + 9 * u]], "#b5523a", 3 * u);
  p.poly([[cx - 17 * u, cy - 9 * u], [cx - 11 * u, cy - 14 * u], [cx + 23 * u, cy - 14 * u], [cx + 17 * u, cy - 9 * u]], "#cf6a4c", 2.6 * u);
  p.stroke([[cx - 8 * u, cy + 2 * u], [cx + 6 * u, cy - 1 * u]], 1.4 * u, "#7a2f22");
  p.ell(cx + 9 * u, cy + 5 * u, 3 * u, 1.6 * u, "#5a4030", 1 * u); // a clod of soil
};

// ---------------------------------------------------------------- characters
const MARSH: Look = { name: "Marsh", build: "tall", skin: "#eec5a4", seed: 91, hair: { style: "short", color: "#3b2c22" }, brow: { k: 1.3 },
  top: { style: "shirt", color: "#d9d4c8" }, layer: { style: "longcoat", color: "#4c6a3a" }, legs: "#2b2f3a", shoes: "#2a2320" };
const RACHEL: Look = { name: "Rachel", build: "petite", skin: "#f1c9a8", seed: 92, hair: { style: "ponytail", color: "#6b4a30" },
  top: { style: "tee", color: "#c9cfe0" }, layer: { style: "cardigan", color: "#8a6f9e" }, legs: "#3a4050", shoes: "#d9d2c4" };
const SAM: Look = { name: "Sam", build: "kid", skin: "#f1c9a8", seed: 93, hair: { style: "curly", color: "#6b4a30" },
  top: { style: "stripes", color: "#3f6fb5", accent: "#f2ead8" }, legs: "#3f6fb5", shoes: "#d9d2c4" };

// ---------------------------------------------------------------- set: alderRow
// Number 9's frontage faces +z at z = 0, centred on x = 0 (5.6 m wide, two floors, wall 5.8 m). Openings: the door
// (centre x 0.9, the door9 prop), the upstairs window over it (x 0.9, sill 3.2 m: the upstairsWindow prop), the bay
// window (x -1.05, 1.8 m wide, projecting 0.55 m), a second upstairs window over the bay (dark glass). Front garden
// z 0..4.6: path from the door to the gate (x 0.9), the garden border under the bay, a low brick wall with the gate gap;
// pavement z 4.6..6.6 (kerb), road z 6.6..12.6, far pavement 12.6..14.6, the terrace across the road (fronts at z 14.6).
// Library houses either side (x = -5.8 and +5.8) and across the road make it a terrace.
const NX = 2.8, NH = 5.8;
const OPP_Z = 14.6, OPP_W = 5.6, OPP_D = 8, OPP_H = 5.6, OPP_XS = [-11.2, -5.6, 0, 5.6, 11.2];
/** the lit-able windows across the road (bottom centres, facing -z): the library house's painted window grid */
export const oppWindow = (k: number, fl: number, i: number): V3 => {
  const nWin = Math.max(1, Math.floor(OPP_W / 2.2)), lx = ((i + 0.5) * OPP_W) / nWin - OPP_W / 2;
  return [OPP_XS[k] - lx, 0.9 + fl * 2.8, OPP_Z - 0.03];
};
const brickTex = () => stex("loBrick", 512, 512, (g) => {
  g.fillStyle = "#a8927a"; g.fillRect(0, 0, 512, 512); let s = 11; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const bw = 64, bh = 22;
  for (let y = 0, row = 0; y < 512; y += bh, row++) for (let x = -(row % 2) * bw / 2; x < 512; x += bw) { const t = r(); g.fillStyle = t > 0.66 ? "#b8603f" : t > 0.33 ? "#a8553a" : "#c06a48"; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); }
});
const wallWithHoles = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, holes: [number, number, number, number][], brickSized = false) => {
  const xs = [...new Set([x0, x1, ...holes.flatMap((h) => [h[0], h[1]])])].sort((p, q) => p - q), ys = [...new Set([y0, y1, ...holes.flatMap((h) => [h[2], h[3]])])].sort((p, q) => p - q);
  for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < ys.length; j++) {
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2;
    if (holes.some((h) => cx > h[0] && cx < h[1] && cy > h[2] && cy < h[3])) continue;
    const w = xs[i + 1] - xs[i], h = ys[j + 1] - ys[j];
    box(b, brickSized ? tex(`loBrick_${w.toFixed(2)}_${h.toFixed(2)}`, brickTex, w / 1.72, h / 1.72) : mat, m, xs[i], xs[i + 1], ys[j], ys[j + 1], z0, z1);
  }
};
const ALDER_SPOTS: Record<string, V3> = {
  step: [0.9, 0, 0.55], doorKneel: [0.9, 0, 0.45], path: [0.9, 0, 2.2], bay: [-1.05, 0, 1.0], border: [-1.4, 0, 1.15], brickDrop: [1.45, 0, 1.6],
  porchWall: [-0.05, 0, 0.45], gate: [0.9, 0, 4.8], kerb: [0.9, 0, 6.2], neighbourDoor: [5.6, 0, 13.9], upstairs: [0.9, 2.65, -0.35], upstairsB: [0.55, 2.65, -0.45],
};
const ALDER_VIEWS: View[] = [
  { name: "frontage", pos: [-4.6, 1.6, 9.4], look: [0, 2.4, 0], fov: 60, establishing: true },
  { name: "doorstep", pos: [0.9, 1.6, 2.6], look: [0.9, 1.3, 0], fov: 55 },
  { name: "street", pos: [0.9, 1.6, 2.2], look: [0.9, 2.2, OPP_Z], fov: 60, establishing: true },
];
const alderRow = () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4();
  // ground: road, kerbs, pavements, the front gardens
  b.add(quadUp(-60, 60, 6.6, 12.6, 30, 1.5), tex("loAsphalt", asphaltHD, 1, 1));
  for (const [z0, z1] of [[4.6, 6.6], [12.6, 14.6]] as const) b.add(quadUp(-60, 60, z0, z1, 60, 1, 0.12), tex("loPave", () => pavementHD(), 1, 1));
  for (const z of [6.6, 12.6]) box(b, tex("loKerb", () => concreteHD("#b9b4ab"), 1, 1), I, -60, 60, 0, 0.13, z - 0.12, z + 0.12);
  b.add(quadUp(-60, 60, 0, 4.6, 40, 3, 0.02), tex("loGrass", grassHD, 1, 1));
  b.add(quadUp(0.4, 1.4, 0, 4.6, 1, 4, 0.035), tex("loPath", () => concreteHD("#c9c2b6"), 1, 1));                        // the path
  b.add(quadUp(-2.25, 0.2, 0.55, 1.75, 2, 1, 0.03), tex("loSoil", dirtHD, 1, 1));                                         // the border
  flowers(b, { x: -1.1, z: 1.2, y: 0.03 }, 9, 0.9, 5); tufts(b, { x: -1.7, z: 1.3, y: 0.03 }, 8, 0.8, 6);
  for (const s of [-1, 1]) wallWithHoles(b, tex("loBrickW", brickTex, 2, 0.4), I, s < 0 ? -NX : 1.4, s < 0 ? 0.4 : NX, 0, 0.55, 4.45, 4.62, [], true); // the low front wall, a gap for the gate
  // number 9: brick frontage with openings (door, upstairs window, bay), a dark upper window over the bay, a roof
  const brick = tex("loBrick9", brickTex, 5.6, 5.8 / 2.2 * 2.2 / 2.2), trim = col("#efe8d8");
  wallWithHoles(b, brick, I, -NX, NX, 0, NH, -0.25, 0, [[0.47, 1.33, 0, 2.08], [0.35, 1.45, 3.2, 4.5], [-1.95, -0.15, 0.6, 2.4]], true);
  box(b, col("#1a1f2c"), I, -NX, NX, 0, NH, -3.0, -2.95);                                                                 // the house's dark inside (behind the openings)
  box(b, trim, I, -1.6, -0.5, 3.15, 3.22, -0.02, 0.06); panel(b, col("#18202e"), I, -1.05, 3.85, 0.005, 1.1, 1.3); box(b, trim, I, -1.6, -0.5, 4.506, 4.566, -0.02, 0.04); // dark upper window (6 mm off the wall seam at 4.5)
  box(b, col("#7a3b2c"), I, -NX - 0.1, NX + 0.1, NH, NH + 0.25, -0.4, 0.15);                                             // gutter / eaves
  // the bay: a box 1.8 wide, 0.55 deep, on a brick base, three dark panes in white frames, a small lead roof
  box(b, tex("loBrickBay", brickTex, 1.8 / 1.72, 0.6 / 1.72), I, -1.95, -0.15, 0, 0.6, 0.003, 0.55); // back faces a few mm off the wall (z-fighting)
  for (const [x0, x1, z0, z1] of [[-1.95, -0.15, 0.5, 0.55], [-1.95, -1.9, 0.005, 0.55], [-0.2, -0.15, 0.005, 0.55]] as const) box(b, col("#1d2638"), I, x0, x1, 0.6, 2.4, z0, z1);
  for (const x of [-1.95, -1.35, -0.75, -0.15]) box(b, trim, I, x - 0.03, x + 0.03, 0.607, 2.393, 0.52, 0.58); // a few mm off the panes' faces (z-fighting)
  box(b, trim, I, -1.98, -0.12, 0.58, 0.64, 0.007, 0.6); box(b, trim, I, -1.98, -0.12, 2.38, 2.44, 0.007, 0.6);
  box(b, col("#5d6470"), I, -2.0, -0.1, 2.44, 2.56, -0.02, 0.66);
  // porch: a small canopy over the door, the porch lamp beside it (a warm glow), the step
  box(b, col("#e3dccb"), I, 0.3, 1.5, 2.2, 2.28, 0, 0.55); box(b, col("#c9c2b6"), I, 0.35, 1.45, 0, 0.12, 0, 0.42);
  box(b, col("#22252b"), I, 1.48, 1.6, 1.95, 2.15, 0, 0.1);
  b.add(plane(0.1, 0.14), glow("loPorchLamp", () => ({ color: "#ffd38c", toneMapped: false })), new THREE.Matrix4().makeTranslation(1.54, 2.05, 0.105));
  // the terrace either side (library houses, fronts at z 0) and across the road (fronts facing -z at z 14.6)
  house(b, { x: -NX - 2.8, z: -4, yaw: 0 }, 5.6, 8, 5.6, 2, 0); house(b, { x: NX + 2.8, z: -4, yaw: 0 }, 5.6, 8, 5.6, 4, 1);
  OPP_XS.forEach((x, k) => house(b, { x, z: OPP_Z + OPP_D / 2, yaw: Math.PI }, OPP_W, OPP_D, OPP_H, [0, 5, 1, 6, 3][k], k + 2));
  // hedges between the gardens, street lamps (one near the van, one past number 9, two across)
  tree(b, "hedge", NX, 0, 2.3, 0.9, NX * 3, 0);
  for (const [x, z, yaw] of [[-17, 6.25, Math.PI], [3.8, 6.25, Math.PI], [-5.2, 12.95, 0], [9.5, 12.95, 0]] as const) streetLamp(b, { x, z, y: 0.12, yaw });
  b.build(root, true);
  return { root, env: { clouds: false }, spots: ALDER_SPOTS, views: ALDER_VIEWS };
};

export const LOCKEDOUT_THEME: Theme = {
  id: "lockedout", name: "Locked Out (a night-call locksmith, 9 Alder Row)",
  desc: "a first-person night mystery on a terraced street: number 9's frontage with its bay window and upstairs room, the locksmith's van cab and rear-view mirror, the first-person gloved hands (holding the phone, at the lock), the weathered front door with its brand-new KL cylinder, windows across the road lighting up, a long shadow, a brick; Marsh, Rachel and Sam",
  tags: ["mystery", "night", "first person", "street", "home", "thriller"],
  mood: "mystery",
  ambience: { "alderRow:night": "amb_city_night", alderRow: "amb_city_night" },
  steps: { alderRow: "step_stone" },
  characters: { marsh: MARSH, rachel: RACHEL, sam: SAM, officer: OFFICER, locksmith: LOCKSMITH },
  characterMeta: {
    marsh: { name: "Marsh", desc: "tall; short dark hair; heavy brows; a long green coat over a pale shirt", personality: "a controlled, quiet-spoken man locked out of the house he used to live in (Locked Out)", themes: ["mystery", "thriller", "night"], tags: ["antagonist", "male", "coat"] },
    rachel: { name: "Rachel", desc: "petite; brown ponytail; lilac cardigan over a pale tee", personality: "a mother who changed her locks yesterday (Locked Out); seen at her upstairs window", themes: ["mystery", "home"], tags: ["mother", "female"] },
    locksmith: { name: "The locksmith", desc: "a night-call locksmith: short brown hair under a navy beanie; a teal work hoodie with orange trim; dark work trousers", personality: "the first-person narrator of Locked Out, seen in third-person shots: careful, tired, on a final warning, braver than he thinks", themes: ["mystery", "trade", "night"], tags: ["protagonist", "locksmith", "male", "workwear"] },
    officer: { name: "Police officer", desc: "short dark hair; a hi-vis yellow jacket over a white shirt; a dark cap", personality: "a police officer answering a 999 call at night (Locked Out); used twice", themes: ["police", "street", "night"], tags: ["police", "officer", "uniform", "hi-vis"] },
    sam: { name: "Sam", desc: "a small boy; curly brown hair; blue-and-cream striped top", personality: "Rachel's son (Locked Out); drew the family picture in the hall", themes: ["home", "family"], tags: ["child", "boy", "son"] },
  },
  items: { toolCase: { name: "Tool case", desc: "a black locksmith's tool case with an orange stripe, carried by its handle", themes: ["trade", "work"], tags: ["case", "tools", "locksmith", "toolbox"], draw: toolCaseItem },
    cash: { name: "Cash (fanned notes)", desc: "three banknotes fanned in a hand (a bribe, a cash payment)", themes: ["money", "crime", "street"], tags: ["cash", "money", "notes", "bribe", "payment"], draw: cashItem },
    brick: { name: "Brick", desc: "a red house brick, soil still on it (pulled from a garden border: a threat to a window)", themes: ["street", "crime", "thriller"], tags: ["brick", "threat", "window", "garden"], draw: brickItem } },
  props: {
    fpHands: { name: "First-person hands (locksmith)", desc: "the first-person view's own hands: the locksmith's dark work gloves and teal jacket cuffs, an ink-drawn card (0.34 m wide, upright, facing +z: put it 0.35-0.45 m in front of a first-person `at` camera, below the eyeline). Variants: phone (both hands holding a phone whose glowing screen shows 9 ALDER ROW's History: Yesterday 16:40, Emergency lock change, Customer R. Marsh, Keys issued to R. Marsh only), job (the night job card: KESTREL LOCKS, the only 24-hour locksmith in town, LOCKOUT, 9 ALDER ROW, 02:14), tools (a gloved hand holding the tension wrench in the keyway, the pick resting beside it: place it at the lock), call (the phone on a live 999 call), pocket (looking down: the phone going into my jacket's breast pocket, its screen still lit), horn (my glove rising toward the horn), handle (my glove on the van's door lever), case (holding up the closed tool case), watch:<times> (my wrist turned up to read the countdown; steps show the next time), refused (the job record: REFUSED BY TECHNICIAN, Review required), text (the job as a text straight to the on-call phone: Locked out. 9 Alder Row. I'll pay double. Cash. 02:14), record (the History as phone, without tonight's row), licence (D. MARSH's driving licence held up in both gloves), flap (looking in through the letterbox: the brass plate fills the view with the wide slot open and the flap pushed up; put it about 0.25 m in front of the eye, slot centre 0.21 m above `at`)", category: "theme", themes: ["first person", "mystery", "phone", "trade"], tags: ["hands", "gloves", "pov", "first person", "phone", "lockpick", "locksmith"], radius: 0.05, height: 0.34,
      build: (b, a, v) => fpHandsBuild(b, a, v ?? "phone"), rig: fpHandsRig, steps: ["the watch shows its next time"], stepCount: (v) => (v?.startsWith("watch") ? Math.max(0, watchTimes(v).length - 1) : 0),
      param: { desc: "phone, record, job, text, call, refused, tools, pocket, horn, handle, case, licence, flap, or watch:<mm:ss>|<mm:ss>... (the countdown's times; each step shows the next)", ok: (v) => ["phone", "job", "call", "refused", "tools", "pocket", "horn", "handle", "case", "licence", "flap", "text", "record"].includes(v) || /^watch:\d\d:\d\d(\|\d\d:\d\d)*$/.test(v) } },
    keyAtLock: { name: "His key at the new lock", desc: "an ink card of Marsh's bare hand (green coat cuff) pushing a big worn brass key at a lock: the key's tip jams against the cylinder face beside the keyway, bump lines at the tip (it won't go in). Place it like fpHands tools, at door9's cylinder (door9 at [0.9,0,-0.03]: at [1.244, 0.836, 0.035]). Each step bumps it back off and on again", category: "theme", themes: ["mystery", "home"], tags: ["key", "lock", "hand", "door", "wrong key"], radius: 0.05, height: 0.34,
      build: (b, a) => { b.add(plane(HANDS_W, HANDS_W), cardMat(keyTex(), NIGHT_TINT), frame(a).multiply(new THREE.Matrix4().makeTranslation(0, HANDS_W / 2, 0))); }, rig: keyAtLockRig, steps: ["it bumps back off", "it jams on again", "it bumps back off"] },
    vanCab: { name: "Van cab (driver's view)", desc: "the cab around a driver's eye: `at` = the dashboard point 0.75 m ahead of the driver's eye and 0.35 m below it (so for an eye at height 1.6 m, at.y = 1.25), yaw = the van's forward. Dashboard and steering wheel ahead and below, the windscreen frame (header, raked A-pillars), the driver's visor with the FINAL WARNING letter clipped to it, the rear-view mirror up and to the left (right-hand drive). Variant mirror: my eyes in the mirror, lit by a phone", category: "theme", themes: ["first person", "street", "night"], tags: ["van", "cab", "windscreen", "mirror", "visor", "pov", "driver"], radius: 1.0, height: 0.6,
      build: (b, a, v) => vanCabBuild(b, a, v), variants: { mirror: (b, a) => vanCabBuild(b, a, "mirror") } },
    rearMirror: { name: "Rear-view mirror (van)", desc: "the van's rear-view mirror on its stem, with the windscreen header and roof strip above it, `at` = the mirror's centre, yaw = the van's forward (the same mirror as vanCab's, for close shots of it on its own). Variant eyes: my eyes in the mirror, lit by a phone", category: "theme", themes: ["first person", "night"], tags: ["mirror", "rear-view", "reflection", "eyes", "van"], radius: 0.15, height: 0.1,
      build: (b, a, v) => mirrorParts(b, frame(a), v === "eyes", true), variants: { eyes: (b, a) => mirrorParts(b, frame(a), true, true) } },
    door9: { name: "Front door of number 9", desc: "a weathered dark-green four-panel front door (0.86 x 2.0 m) in a cream frame, `at` = the bottom centre of its opening, facing +z: brass 9, brass letterbox at 1.0 m, the bell push and a MARSH label on the right jamb; a bright NEW chrome cylinder (KL stamp) at 1.05 m near the lock edge, inside the paler outline of a bigger old lock; fresh filings glittering on the doormat", category: "theme", themes: ["home", "mystery", "street"], tags: ["door", "lock", "cylinder", "letterbox", "doorbell", "front door"], radius: 0.5, height: 2.1, box: [0.5, 0.05], focus: { y: 1.05, span: 0.3 },
      build: (b, a) => door9Build(b, a) },
    upstairsWindow: { name: "Upstairs window (number 9)", desc: "number 9's upstairs window (1.1 x 1.3 m) and the lit room behind it, where actors can stand: `at` = the bottom centre of the opening, facing +z. Steps: before 1 a thin strip of light under the closed curtain; 1 the light goes out; 2 the light comes back on and the curtain is open", category: "theme", themes: ["home", "night", "mystery"], tags: ["window", "light", "curtain", "upstairs", "room"], radius: 0.6, height: 1.3,
      build: (b, a) => upstairsStatic(b, a), rig: upstairsRig, steps: ["the light goes out", "the light comes on, the curtain open"] },
    windowLight: { name: "Window lighting up", desc: "a warm lit window pane (0.85 x 1.25 m, the size of the library houses' painted windows), `at` = its bottom centre, facing +z; invisible until step 1, when the light comes on (a street waking up)", category: "theme", themes: ["night", "street"], tags: ["window", "light", "neighbour", "night"], radius: 0.05, height: 1.25,
      build: () => undefined, rig: windowLightRig, steps: ["the light comes on"] },
    policeLight: { name: "Police light (blue wash)", desc: "the blue light of a police car off-screen washing the house fronts: a soft additive blue glow (24 x 7 m), `at` = its bottom centre, facing +z, just in front of a row of facades; off until step 1, then each step toggles it (a strobe)", category: "theme", themes: ["police", "night", "street"], tags: ["police", "blue light", "siren", "strobe", "night"], radius: 0.05, height: 7,
      build: () => undefined, rig: policeLightRig, steps: ["on", "off", "on", "off", "on", "off", "on", "off", "on", "off", "on"] },
    familyDrawing: { name: "Child's family drawing", desc: "a child's crayon drawing pinned to a wall (0.42 x 0.3 m), `at` = its centre, facing +z: stick figures labelled MUMMY, ME, BISCUIT (the dog) and DADDY in a green coat, a yellow sun", category: "theme", themes: ["home", "family", "mystery"], tags: ["drawing", "child", "family", "wall", "picture"], radius: 0.05, height: 0.3, build: drawingBuild },
    groundBrick: { name: "Brick on the ground", desc: "a red house brick lying on the ground with a clod of soil (21.5 cm), `at` = where it lies; with steps: hidden until step 1, the moment it's dropped", category: "theme", themes: ["street", "crime", "thriller"], tags: ["brick", "dropped", "ground", "threat"], radius: 0.12, height: 0.09,
      build: (b, a) => groundBrickParts(b, frame(a)), rig: groundBrickRig, steps: ["it is dropped"] },
    shadowDecal: { name: "Long shadow", desc: "a long man's shadow on the ground, 3.2 m, `at` = his feet, stretching along local +z (away from the light behind him)", category: "theme", themes: ["night", "mystery"], tags: ["shadow", "silhouette", "night"], radius: 0.05, height: 0.02, build: shadowBuild },
  },
  sets: { alderRow: { id: "alderRow", title: "Alder Row at night: number 9's frontage, its garden and path, the terrace across the road", lights: ["night"], build: alderRow } },
  layouts: { alderRow: { spots: ALDER_SPOTS, views: ALDER_VIEWS } },
  setMeta: { alderRow: { name: "Alder Row (terraced street, night)", desc: "number 9's brick frontage faces +z at z 0 (x -2.8..2.8, two floors): the door opening at x 0.9 (place the door9 prop at [0.9, 0, -0.03]), the upstairs window over it (place upstairsWindow at [0.9, 3.2, 0]), the bay window at x -1.05 projecting 0.55 m, a porch canopy and lamp; the front garden z 0..4.6 with the path at x 0.9, the border under the bay, a low wall with the gate gap; pavement z 4.6..6.6, road z 6.6..12.6, far pavement, the terrace across the road (fronts at z 14.6; oppWindow(k, floor, i) gives its window positions); library houses either side (marks: step, doorKneel, path, bay, border, brickDrop, porchWall, gate, kerb, neighbourDoor, upstairs, upstairsB / views: frontage, doorstep, street / lights: night)", themes: ["street", "home", "night", "mystery"], tags: ["outdoor", "street", "terrace", "house", "front door", "garden", "night"] } },
};
