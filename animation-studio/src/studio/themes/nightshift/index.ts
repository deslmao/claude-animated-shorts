// Night Shift theme (The Extra Door, Part 2 rewrite: "Juno's Night Shift"): production props only, for the library's
// sets (Part 1's hallway, the downstairs hall, home, the city street at night, the lab). The door's two rules, made
// visible: it moves only while something watches it, and it travels between copies of one photo (Milo and Juno's).
// Props: Milo's / Juno's phone screens, Juno's lab monitor (three night-vision clips), the lab-wall photo whose wall
// turns to wood (a handle pushes through), a security camera, the master switch, the steel specimen drawer, the empty
// key hook, a flooded gutter, an exit sign.
import * as THREE from "three";
import type { Theme } from "..";
import { Batch } from "../../materials/geo";
import { At, frame, col, box, cyl } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const B = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const FONT = (px: number) => `bold ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};
const screenMat = (t: THREE.Texture) => new THREE.MeshBasicMaterial({ map: t, toneMapped: false });

// ---------------- the photo (Milo and Juno at a sunset beach, Part 1's picture), drawn at any size
const drawPhoto = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, "#ff9a5a"); sky.addColorStop(0.55, "#ffd27a"); sky.addColorStop(0.56, "#3d7fb8"); sky.addColorStop(1, "#e8cf9a");
  g.fillStyle = sky; g.fillRect(x, y, w, h);
  g.fillStyle = "#fff1b0"; g.beginPath(); g.arc(x + w * 0.5, y + h * 0.55, w * 0.09, Math.PI, 0); g.fill();
  const fig = (cx: number, skin: string, top: string, hair: string, bob: boolean) => {
    g.fillStyle = top; rr(g, cx - w * 0.08, y + h * 0.58, w * 0.16, h * 0.42, w * 0.05); g.fill();
    g.fillStyle = skin; g.beginPath(); g.arc(cx, y + h * 0.45, w * 0.085, 0, 7); g.fill();
    g.fillStyle = hair; g.beginPath(); if (bob) { g.arc(cx, y + h * 0.43, w * 0.095, Math.PI * 1.05, Math.PI * 1.95); g.fill(); } else { for (let k = -1; k <= 1; k++) { g.moveTo(cx + k * w * 0.03, y + h * 0.36); g.lineTo(cx + k * w * 0.03 + w * 0.02, y + h * 0.28); g.lineTo(cx + k * w * 0.03 + w * 0.035, y + h * 0.37); } g.fill(); }
    g.fillStyle = "#2a1c18"; g.fillRect(cx - w * 0.03, y + h * 0.44, w * 0.012, h * 0.02); g.fillRect(cx + w * 0.02, y + h * 0.44, w * 0.012, h * 0.02);
  };
  fig(x + w * 0.36, "#f2c9a0", "#f2b134", "#5a3a22", false);   // Milo: mustard hoodie, spiky tuft
  fig(x + w * 0.62, "#e8b48a", "#ffffff", "#1f1a24", true);    // Juno: lab coat, dark bob
};
const photoTex = () => stex("nsPhoto", 512, 360, (g) => { drawPhoto(g, 0, 0, 512, 360); g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 6; g.strokeRect(3, 3, 506, 354); });
const grainTex = () => stex("nsGrain", 256, 512, (g) => {
  g.fillStyle = "#3a2516"; g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 70; k++) { const x = (k * 37) % 256; g.strokeStyle = k % 3 ? "rgba(20,10,4,0.5)" : "rgba(110,70,40,0.45)"; g.lineWidth = 1 + (k % 4); g.beginPath(); g.moveTo(x, 0); for (let y = 0; y <= 512; y += 32) g.lineTo(x + 6 * Math.sin(y * 0.03 + k), y); g.stroke(); }
  g.fillStyle = "rgba(20,10,4,0.6)"; for (const [x, y] of [[70, 140], [180, 330], [120, 430]]) { g.beginPath(); g.ellipse(x, y, 9, 15, 0.2, 0, 7); g.fill(); }
});

// ---------------- nsPhone: a phone held upright, screen to +z (15 cm), for inserts. Variants and their steps:
//   fake: Juno's fake text "Come back home :)" (static)
//   call: 0 incoming call from Juno (her contact photo = their photo); 1 answered (00:03); 2 the photo turns to wood
//         grain; 3 a tiny brass handle pushes out through the glass; 4 it turns down
//   cam:  0 Juno's lock screen with the home-camera alert (thumbnail: Part 1's photo face up on the hallway floor);
//         1 the text from "Milo" arrives below it: "I'm home. Come let me in."
const PW = 0.075, PH = 0.15;
const phoneScreen = (v: string, s: number) => stex(`nsPhone${v}${s}`, 512, 1024, (g) => {
  g.fillStyle = "#0d1118"; g.fillRect(0, 0, 512, 1024);
  g.fillStyle = "#cdd6e4"; g.font = FONT(26); g.textAlign = "center"; g.fillText(v === "cam" ? "11:52" : "11:47", 256, 54);
  if (v === "fake") {
    g.font = FONT(64); g.fillStyle = "#fff"; g.fillText("11:47", 256, 230);
    g.fillStyle = "rgba(255,255,255,0.14)"; rr(g, 32, 420, 448, 220, 30); g.fill();
    g.textAlign = "left"; g.fillStyle = "#9ad0ff"; g.font = FONT(30); g.fillText("Juno", 64, 480);
    g.fillStyle = "#fff"; g.font = FONT(40); g.fillText("Come back home", 64, 548);
    // the smiley on its own line (beside the text it overlapped the "e" of "home")
    const sx = 90, sy = 598;
    g.strokeStyle = "#ffd23f"; g.lineWidth = 5; g.beginPath(); g.arc(sx, sy, 22, 0, 7); g.stroke(); g.beginPath(); g.arc(sx, sy + 2, 12, 0.2, Math.PI - 0.2); g.stroke();
    g.fillStyle = "#ffd23f"; g.fillRect(sx - 9, sy - 10, 5, 6); g.fillRect(sx + 5, sy - 10, 5, 6);
    return;
  }
  if (v === "call") {
    const PX = 96, PY = 200, PWd = 320, PHd = 225;
    drawPhoto(g, PX, PY, PWd, PHd);
    if (s >= 2) { g.save(); g.beginPath(); g.rect(PX, PY, PWd, PHd); g.clip(); g.globalAlpha = s >= 3 ? 0.95 : 0.75; g.drawImage(grainTex().image as CanvasImageSource, PX, PY, PWd, PHd); g.restore(); }
    g.strokeStyle = "#fff"; g.lineWidth = 6; g.strokeRect(PX, PY, PWd, PHd);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.font = FONT(60); g.fillText("Juno", 256, 540);
    g.font = FONT(30); g.fillStyle = "#b8c7d6"; g.fillText(s >= 1 ? "00:03" : "incoming call...", 256, 596);
    if (s === 0) { g.fillStyle = "#e5484d"; g.beginPath(); g.arc(150, 860, 56, 0, 7); g.fill(); g.fillStyle = "#30a46c"; g.beginPath(); g.arc(362, 860, 56, 0, 7); g.fill(); }
    else { g.fillStyle = "#e5484d"; g.beginPath(); g.arc(256, 860, 56, 0, 7); g.fill(); }
    return;
  }
  // cam: Juno's lock screen
  g.font = FONT(64); g.fillStyle = "#fff"; g.fillText("11:52", 256, 200);
  g.fillStyle = "rgba(255,255,255,0.14)"; rr(g, 20, 290, 472, 340, 28); g.fill();
  g.textAlign = "left"; g.fillStyle = "#ff8a5b"; g.font = FONT(34); g.fillText("HOME CAM", 44, 340);
  g.fillStyle = "#fff"; g.font = FONT(38); g.fillText("Hallway: motion", 44, 392);
  // thumbnail: the hallway floor, the photo face up on it, seen from the ceiling camera (grey night vision)
  g.fillStyle = "#3a4048"; g.fillRect(56, 414, 400, 196); g.fillStyle = "#5a6068"; for (let k = 0; k < 6; k++) g.fillRect(56, 430 + k * 30, 400, 3);
  g.save(); g.translate(256, 512); g.rotate(-0.12); drawPhoto(g, -88, -58, 176, 116); g.strokeStyle = "#ddd"; g.lineWidth = 4; g.strokeRect(-88, -58, 176, 116); g.restore();
  g.fillStyle = "#e5484d"; g.beginPath(); g.arc(432, 432, 8, 0, 7); g.fill();
  if (s >= 1) {
    g.fillStyle = "rgba(255,255,255,0.2)"; rr(g, 20, 650, 472, 250, 28); g.fill();
    g.fillStyle = "#9ad0ff"; g.font = FONT(40); g.fillText("Milo", 44, 710);
    g.fillStyle = "#fff"; g.font = FONT(54); g.fillText("I'm home.", 44, 784); g.fillText("Come let me in.", 44, 856);
  }
});
const nsPhoneRig = (a: At, v = "fake"): PropRig => {
  const root = rigRoot(a);
  root.add(mesh(B(PW + 0.008, PH + 0.01, 0.009), col("#1a1a1e"), 0, PH / 2, -0.005));
  const mat = screenMat(phoneScreen(v, 0)), scr = mesh(new THREE.PlaneGeometry(PW, PH), mat, 0, PH / 2, 0.0002); scr.layers.set(NOINK); root.add(scr);
  // the micro handle (call variant): pushes out of the photo through the glass, then turns down
  const hd = new THREE.Group(), brass = col("#c9a24a");
  hd.add(mesh(new THREE.CylinderGeometry(0.0025, 0.0025, 0.01, 8).rotateX(Math.PI / 2), brass, 0, 0, 0.005), mesh(B(0.014, 0.0028, 0.003), brass, 0.006, 0, 0.0105));
  hd.position.set(0.012, PH * 0.66, 0); hd.visible = false; root.add(hd);
  const n = v === "call" ? 4 : v === "cam" ? 1 : 0;
  return { root, update: ({ step = 0 }) => {
    const s = Math.min(n, Math.floor(step + 0.001)), t = phoneScreen(v, Math.min(s, v === "call" ? 3 : s));
    if (mat.map !== t) { mat.map = t; mat.needsUpdate = true; }
    if (v === "call") { const f = ease(step - 2); hd.visible = step > 2; hd.position.z = -0.008 + 0.01 * f; hd.rotation.z = -1.1 * ease((step - 3) * 1.5); }
  } };
};
const nsPhoneStatic = (b: Batch, a: At, v = "fake") => {
  const m = frame(a);
  box(b, col("#1a1a1e"), m, -(PW + 0.008) / 2, (PW + 0.008) / 2, -0.005, PH + 0.005, -0.0095, -0.0005);
  b.add(new THREE.PlaneGeometry(PW, PH), screenMat(phoneScreen(v, 0)), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, PH / 2, 0.0002)));
};

// ---------------- labMonitor: Juno's desk monitor (0.62 x 0.4 m screen), screen to +z, on a stand (base at `at`).
// Steps: 1 FEED LOST (black, static), 2 the feed returns: the door has shrunk to picture-frame size, 3 TONIGHT 21:14: the
// door folds itself into the photo (the glass ripples). Before step 1: SPECIMEN 8, the door alone, facing the photo.
const MW = 0.62, MH = 0.4, FOLDN = 16;
const monitorTex = (s: number) => stex(`nsMonitor${s}`, 1024, 660, (g) => {
  g.fillStyle = "#0a140c"; g.fillRect(0, 0, 1024, 660);
  const nv = (f: () => void) => { f(); g.fillStyle = "rgba(60,255,120,0.10)"; g.fillRect(0, 0, 1024, 660); for (let y = 0; y < 660; y += 4) { g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(0, y, 1024, 1); } };
  const room = () => { g.fillStyle = "#4d6650"; g.fillRect(0, 0, 1024, 660); g.fillStyle = "#3a503d"; g.fillRect(0, 470, 1024, 190); g.strokeStyle = "#2a3a2c"; g.lineWidth = 4; g.strokeRect(120, 60, 784, 420); };
  const door = (cx: number, by: number, sc: number) => { g.fillStyle = "#1c2a1e"; g.fillRect(cx - 70 * sc, by - 260 * sc, 140 * sc, 260 * sc); g.strokeStyle = "#0e170f"; g.lineWidth = 3; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(cx - 70 * sc + k * 35 * sc, by - 260 * sc); g.lineTo(cx - 70 * sc + k * 35 * sc, by); g.stroke(); } };
  const photoFG = (alpha = 1) => { g.save(); g.globalAlpha = alpha; g.translate(800, 560); g.rotate(0.05); drawPhoto(g, -120, -85, 240, 170); g.strokeStyle = "#cfe8d4"; g.lineWidth = 6; g.strokeRect(-120, -85, 240, 170); g.restore(); };
  const label = (t: string, red = false) => { g.fillStyle = red ? "#ff4d4d" : "#b8ffcc"; g.font = FONT(34); g.textAlign = "left"; g.fillText(t, 40, 56); g.fillStyle = "#ff4d4d"; g.beginPath(); g.arc(984, 44, 10, 0, 7); g.fill(); };
  if (s >= 3) { // TONIGHT 21:14, fold progress (s - 3) / FOLDN: the full-size door slides to the photo, folds and is gone
    const p = Math.min(1, (s - 3) / FOLDN), e = p * p * (3 - 2 * p);
    nv(() => {
      room(); photoFG(1);
      const cx = 420 + (800 - 420) * e, by = 470 + (600 - 470) * e, sc = 1 - 0.86 * e, fold = Math.cos(e * Math.PI * 0.45);
      if (p < 0.98) {
        // motion trail
        g.fillStyle = "rgba(28,42,30,0.35)"; for (let k = 1; k <= 3; k++) { const q = Math.max(0, e - k * 0.06), qx = 420 + 380 * q, qs = 1 - 0.86 * q; g.fillRect(qx - 70 * qs * fold, 470 + 130 * q - 260 * qs, 140 * qs * fold, 260 * qs); }
        g.fillStyle = "#1c2a1e"; g.fillRect(cx - 70 * sc * fold, by - 260 * sc, 140 * sc * fold, 260 * sc);
        g.strokeStyle = "#0e170f"; g.lineWidth = 3; g.strokeRect(cx - 70 * sc * fold, by - 260 * sc, 140 * sc * fold, 260 * sc);
      }
      g.strokeStyle = `rgba(200,255,210,${0.25 + 0.6 * e})`; g.lineWidth = 3;
      for (let k = 0; k < Math.round(1 + 4 * e); k++) { g.beginPath(); g.ellipse(800, 560, 40 + k * 24 * (0.5 + e), 28 + k * 16 * (0.5 + e), 0, 0, 7); g.stroke(); }
    });
    label("TONIGHT  21:14", true);
    return;
  }
  if (s === 1) { g.fillStyle = "#000"; g.fillRect(0, 0, 1024, 660); for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(200,255,210,${(k % 7) / 40})`; g.fillRect((k * 397) % 1024, (k * 151) % 660, 3, 2); } g.fillStyle = "#ff4d4d"; g.font = FONT(64); g.textAlign = "center"; g.fillText("FEED LOST  0:03", 512, 350); return; }
  nv(() => { room(); if (s === 0) door(420, 470, 1); else if (s === 2) door(420, 470, 0.32); photoFG(1); if (s === 3) { g.strokeStyle = "rgba(200,255,210,0.8)"; g.lineWidth = 3; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(800, 560, 60 + k * 22, 40 + k * 15, 0, 0, 7); g.stroke(); } g.fillStyle = "#1c2a1e"; g.fillRect(760, 470, 50, 90); } });
  label(s === 0 ? "SPECIMEN 8 · DAY 1" : s === 2 ? "SPECIMEN 8 · FEED RESTORED" : "TONIGHT  21:14", s === 3);
});
const monitorStatic = (b: Batch, a: At, s: number) => {
  const dark = col("#202428");
  {
    const m = frame(a);
    box(b, dark, m, -0.12, 0.12, 0, 0.02, -0.12, 0.08); box(b, dark, m, -0.02, 0.02, 0.02, 0.2, -0.04, 0.0);
    box(b, dark, m, -MW / 2 - 0.02, MW / 2 + 0.02, 0.18, 0.18 + MH + 0.04, -0.045, 0.0);
    b.add(new THREE.PlaneGeometry(MW, MH), screenMat(monitorTex(s)), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.2 + MH / 2, 0.0015)));
  }
};
const labMonitorRig = (a: At): PropRig => {
  const root = rigRoot(a), dark = col("#202428");
  root.add(mesh(B(0.24, 0.02, 0.2), dark, 0, 0.01, -0.02), mesh(B(0.04, 0.18, 0.04), dark, 0, 0.11, -0.02), mesh(B(MW + 0.04, MH + 0.04, 0.045), dark, 0, 0.2 + MH / 2, -0.0225));
  const mat = screenMat(monitorTex(0)), scr = mesh(new THREE.PlaneGeometry(MW, MH), mat, 0, 0.2 + MH / 2, 0.0015); scr.layers.set(NOINK); root.add(scr);
  return { root, update: ({ step = 0 }) => { const t = monitorTex(step < 3 ? Math.floor(step + 0.001) : 3 + Math.round(Math.min(1, (step - 3) / 4) * FOLDN)); if (mat.map !== t) { mat.map = t; mat.needsUpdate = true; } } };
};

// ---------------- photoWall: the copy of the photo on Juno's lab wall (0.36 x 0.25 m frame; `at` = the frame's centre on
// the wall, facing +z). Steps: 1 the wall turns to wood grain around it (a door 0.8 x 2.0 m, the photo in its upper half);
// 2 a brass handle pushes out through the wood; 3 it turns down; 4 the wood shrinks back into the frame (plain wall);
// 5 the photo is taken off the wall (hidden).
const photoWallRig = (a: At): PropRig => {
  const root = rigRoot(a);
  const frameG = new THREE.Group();
  frameG.add(mesh(B(0.4, 0.29, 0.025), col("#2b2b2e"), 0, 0, 0.0125));
  const ph = mesh(new THREE.PlaneGeometry(0.36, 0.25), screenMat(photoTex()), 0, 0, 0.0262); ph.layers.set(NOINK); frameG.add(ph);
  root.add(frameG);
  // the door of grain: centred 0.45 m below the photo (the photo sits in its upper part); grows from the frame
  const doorG = new THREE.Group(); doorG.position.set(0, -0.55, 0.004);
  const grain = mesh(new THREE.PlaneGeometry(0.8, 2.0), new THREE.MeshLambertMaterial({ map: grainTex() }), 0, 0, 0); doorG.add(grain);
  const edge = mesh(new THREE.PlaneGeometry(0.86, 2.06), new THREE.MeshBasicMaterial({ color: 0x120a05 }), 0, 0, -0.001); doorG.add(edge);
  doorG.scale.setScalar(0.001); root.add(doorG);
  const brass = col("#c9a24a"), hd = new THREE.Group();
  hd.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 16).rotateX(Math.PI / 2), brass, 0, 0, 0.025), mesh(B(0.16, 0.03, 0.03), brass, 0.06, 0, 0.055));
  hd.position.set(0.28, -0.75, 0); hd.visible = false; root.add(hd);
  return { root, update: ({ step = 0 }) => {
    const grow = ease(step * 1.3) * (1 - ease((step - 3) * 1.2));
    doorG.scale.setScalar(Math.max(0.001, grow)); doorG.position.y = -0.55 * grow;
    hd.visible = step > 1 && step < 3.9; hd.position.z = -0.06 + 0.06 * ease((step - 1) * 1.4); hd.rotation.z = -0.9 * ease(step - 2);
    frameG.visible = step < 4.5;
  } };
};
const photoWallStatic = (b: Batch, a: At) => {
  const m = frame(a);
  box(b, col("#2b2b2e"), m, -0.2, 0.2, -0.145, 0.145, 0, 0.025);
  b.add(new THREE.PlaneGeometry(0.36, 0.25), screenMat(photoTex()), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.0262)));
};

// ---------------- securityCam: a ceiling-corner security camera (`at` = its mount), lens toward +z, a red recording light
const securityCam = (b: Batch, a: At) => {
  const m = frame(a);
  box(b, col("#e6e6e2"), m, -0.04, 0.04, -0.02, 0.06, -0.06, 0.0); box(b, col("#f2f2ee"), m, -0.07, 0.07, -0.09, -0.02, -0.02, 0.2);
  cyl(b, col("#1a1a1e"), m, 0, -0.055, 0.2, 0.035, 0.035, 0.02, 14, Math.PI / 2, 0);
  b.add(new THREE.SphereGeometry(0.012, 10, 8), new THREE.MeshBasicMaterial({ color: 0xff2020, toneMapped: false }), m.clone().multiply(new THREE.Matrix4().makeTranslation(0.045, -0.035, 0.2)));
};
// ---------------- masterSwitch: the lab's master power switch on a wall (box 0.3 x 0.45 m, facing +z); step 1 throws the lever down
const switchRig = (a: At): PropRig => {
  const root = rigRoot(a);
  root.add(mesh(B(0.3, 0.45, 0.08), col("#c9cdd2"), 0, 0, 0.04), mesh(B(0.26, 0.06, 0.01), col("#e5484d"), 0, 0.17, 0.085));
  const lev = new THREE.Group(); lev.add(mesh(B(0.04, 0.2, 0.04), col("#2b2b2e"), 0, 0.1, 0), mesh(B(0.09, 0.05, 0.05), col("#e5484d"), 0, 0.2, 0)); lev.position.set(0, -0.02, 0.1); root.add(lev);
  return { root, update: ({ step = 0 }) => { lev.rotation.x = -2.6 * ease(step * 4); } };
};
const switchStatic = (b: Batch, a: At) => { const m = frame(a); box(b, col("#c9cdd2"), m, -0.15, 0.15, -0.225, 0.225, 0, 0.08); box(b, col("#2b2b2e"), m, -0.02, 0.02, -0.02, 0.18, 0.08, 0.12); };

// ---------------- specimenDrawer: a steel specimen cabinet (0.6 x 0.95 x 0.55 m, front to +z), its top drawer OPEN at
// first (solid steel, no window). Steps: 1 the photo is laid face down inside (its grey back up); 2 the drawer slams fully
// shut; 3 the key turns in its lock (a quarter turn)
const drawerRig = (a: At): PropRig => {
  const root = rigRoot(a), steel = col("#9aa3ab"), dark = col("#5c646c");
  root.add(mesh(B(0.6, 0.95, 0.55), steel, 0, 0.475, 0));
  root.add(mesh(B(0.5, 0.008, 0.008), dark, 0, 0.45, 0.276), mesh(B(0.5, 0.008, 0.008), dark, 0, 0.2, 0.276));
  const lab = mesh(new THREE.PlaneGeometry(0.3, 0.07), screenMat(stex("nsSpec8", 300, 70, (g) => { g.fillStyle = "#f4f1e6"; g.fillRect(0, 0, 300, 70); g.fillStyle = "#1a1a1e"; g.font = FONT(36); g.textAlign = "center"; g.fillText("SPECIMEN 8", 150, 48); })), 0, 0.62, 0.277); lab.layers.set(NOINK); root.add(lab);
  const dr = new THREE.Group();
  dr.add(mesh(B(0.56, 0.22, 0.03), steel, 0, 0, 0.0), mesh(B(0.52, 0.2, 0.5), dark, 0, 0, -0.26), mesh(B(0.18, 0.025, 0.03), dark, 0, 0.04, 0.03));
  const back = mesh(B(0.36, 0.012, 0.25), col("#6b6f74"), 0, 0.04, -0.27); back.visible = false; dr.add(back);   // the photo, face down: only its grey back
  dr.position.set(0, 0.82, 0.28 + 0.42); root.add(dr);
  const key = new THREE.Group(); key.add(mesh(B(0.012, 0.04, 0.012), col("#c9a24a"), 0, 0, 0.0), mesh(new THREE.TorusGeometry(0.016, 0.005, 6, 12), col("#c9a24a"), 0, 0.035, 0)); key.position.set(0.2, 0.86, 0.3); root.add(key);
  return { root, update: ({ step = 0 }) => {
    back.visible = step >= 0.6; dr.position.z = 0.28 + 0.42 * (1 - ease((step - 1) * 4)); key.rotation.z = -Math.PI / 2 * ease((step - 2) * 3);
  } };
};
const drawerStatic = (b: Batch, a: At) => { const m = frame(a); box(b, col("#9aa3ab"), m, -0.3, 0.3, 0, 0.95, -0.275, 0.275); box(b, col("#5c646c"), m, -0.09, 0.09, 0.84, 0.865, 0.275, 0.3); };

// ---------------- small set dressing
const keyHook = (b: Batch, a: At) => { const m = frame(a); box(b, col("#8a5a2e"), m, -0.15, 0.15, -0.05, 0.05, 0, 0.02); for (const x of [-0.09, 0, 0.09]) { box(b, col("#c9a24a"), m, x - 0.006, x + 0.006, -0.03, 0.0, 0.02, 0.05); } };
const puddle = (b: Batch, a: At, v = "") => {
  const m = frame(a);
  b.add(new THREE.CircleGeometry(0.55, 24).rotateX(-Math.PI / 2).scale(1.4, 1, 0.8), new THREE.MeshBasicMaterial({ color: 0x2c4a78, transparent: true, opacity: 0.9, polygonOffset: true, polygonOffsetFactor: -3 }), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0.004, 0)));
  // the street lamp's reflection, so the water reads at night
  b.add(new THREE.CircleGeometry(0.16, 16).rotateX(-Math.PI / 2).scale(2.2, 1, 0.5), new THREE.MeshBasicMaterial({ color: 0xffd896, transparent: true, opacity: 0.55, polygonOffset: true, polygonOffsetFactor: -4 }), m.clone().multiply(new THREE.Matrix4().makeTranslation(-0.25, 0.005, -0.12)));
  if (v === "phone") { box(b, col("#c9ccd4"), m, -0.045, 0.045, 0.004, 0.016, -0.085, 0.085); box(b, col("#1a1a1e"), m, -0.038, 0.038, 0.016, 0.018, -0.075, 0.075); }
};
const exitSign = (b: Batch, a: At) => {
  const m = frame(a);
  box(b, col("#e6e6e2"), m, -0.17, 0.17, -0.07, 0.07, 0, 0.03);
  b.add(new THREE.PlaneGeometry(0.3, 0.11), screenMat(stex("nsExit", 300, 110, (g) => { g.fillStyle = "#0f8f3e"; g.fillRect(0, 0, 300, 110); g.fillStyle = "#e8ffe8"; g.font = FONT(64); g.textAlign = "center"; g.fillText("EXIT", 150, 80); })), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 0, 0.031)));
};

// ---------------- nightWindow: a rainy night outside a window. The sets paint a daytime view 3 m behind each window;
// stood between the window and that view (facing the room) it replaces it: dark sky, wet rooftops with a few lit windows,
// a street lamp's glow, rain streaks. 10 x 6 m, unlit, `at` = its bottom centre.
const nightTex = () => stex("nsNightView", 1024, 640, (g) => {
  const sky = g.createLinearGradient(0, 0, 0, 640); sky.addColorStop(0, "#03060f"); sky.addColorStop(0.6, "#0b1730"); sky.addColorStop(1, "#101c33"); g.fillStyle = sky; g.fillRect(0, 0, 1024, 640);
  const lamp = g.createRadialGradient(700, 330, 4, 700, 330, 170); lamp.addColorStop(0, "rgba(255,214,140,0.55)"); lamp.addColorStop(1, "rgba(255,214,140,0)"); g.fillStyle = lamp; g.fillRect(500, 150, 400, 360);
  let x = 0, k = 0;
  while (x < 1024) { const w = 70 + ((k * 53) % 90), h = 140 + ((k * 97) % 170); g.fillStyle = k % 2 ? "#070d1a" : "#0a1222"; g.fillRect(x, 640 - h - 120, w, h + 120);
    for (let wy = 640 - h - 100; wy < 520; wy += 34) for (let wx = x + 10; wx < x + w - 14; wx += 26) if (((wx * 7 + wy * 13 + k) % 11) < 2) { g.fillStyle = "rgba(245,196,106,0.75)"; g.fillRect(wx, wy, 12, 16); }
    x += w + 4; k++; }
  g.fillStyle = "#05080f"; g.fillRect(0, 560, 1024, 80);
  g.strokeStyle = "rgba(170,200,255,0.22)"; g.lineWidth = 1.5;
  for (let i = 0; i < 420; i++) { const rx = (i * 397) % 1024, ry = (i * 263) % 640, l = 18 + (i % 5) * 6; g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - l * 0.25, ry + l); g.stroke(); }
});
const nightWindow = (b: Batch, a: At) => { const m = frame(a); b.add(new THREE.PlaneGeometry(10, 6), screenMat(nightTex()), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 2.5, 0))); };

export const NIGHTSHIFT_THEME: Theme = {
  id: "nightshift", name: "Night Shift (The Extra Door, Part 2)", desc: "the door's two rules made visible: Milo's and Juno's phone screens (Juno's fake text; the call whose contact photo turns to wood and grows a tiny handle; the home-camera alert and the final text), Juno's lab monitor (three night-vision clips of Specimen 8), the lab-wall copy of Part 1's photo whose wall turns to wood, a security camera, the master switch, the steel specimen drawer, an empty key hook, a flooded gutter and an exit sign",
  tags: ["horror", "mystery", "lab", "phone", "night"],
  mood: "mystery",
  props: {
    nsPhone: { name: "Phone (Night Shift screens)", desc: "a phone held upright, screen to +z (15 cm), for inserts. Variant fake: Juno's fake text 'Come back home :)'. Variant call: 0 incoming call (Juno's contact photo = Milo and Juno's photo), 1 answered, 2 the photo turns to wood grain, 3 a tiny brass handle pushes out through the glass, 4 it turns down. Variant cam: Juno's lock screen with the HOME CAM hallway alert (the photo face up on the hallway floor); 1 the text from 'Milo': I'm home. Come let me in.", category: "theme", themes: ["horror", "modern", "phone"], tags: ["phone", "call", "text", "screen", "camera", "alert"], radius: 0.05, height: 0.16,
      build: (b, a, v) => nsPhoneStatic(b, a, v), rig: nsPhoneRig, steps: ["the next screen"], stepCount: (v) => (v === "call" ? 4 : v === "cam" ? 1 : 0), param: { desc: "fake, call or cam", ok: (v) => ["fake", "call", "cam"].includes(v) } },
    labMonitor: { name: "Lab monitor (Specimen 8 feed)", desc: "Juno's desk monitor on a stand (screen 0.62 x 0.4 m, to +z, base at `at`): night-vision clips of Specimen 8. Before step 1: SPECIMEN 8 · DAY 1, the old door alone in a test room, Milo and Juno's photo in the foreground; 1 FEED LOST 0:03 (black static); 2 the feed returns: the door has shrunk to picture-frame size; 3 TONIGHT 21:14: the full-size door, then steps 4-7 animate it sliding to the photo, folding shut and shrinking into it (gone at 7)", category: "theme", themes: ["lab", "horror", "science"], tags: ["monitor", "screen", "camera", "feed", "night vision", "specimen"], radius: 0.2, height: 0.65, focus: { y: 0.4, span: 0.66 },
      build: (b, a) => monitorStatic(b, a, 0), rig: labMonitorRig, steps: ["feed lost", "feed restored, the door small", "tonight 21:14: the full-size door", "it slides toward the photo", "it folds shut", "it shrinks into the photo", "it is gone; the photo ripples"] },
    photoWall: { name: "Photo on the lab wall (the door's way in)", desc: "a small framed copy of Part 1's photo of Milo and Juno (0.4 x 0.29 m) on a wall, `at` = the frame's centre, facing +z. Steps: 1 the wall turns to wood grain around it (a door 0.8 x 2 m below and around the frame), 2 a brass handle pushes out through the wood, 3 it turns down, 4 the wood shrinks back into the frame, 5 the photo is taken off the wall", category: "theme", themes: ["horror", "mystery", "lab"], tags: ["photo", "frame", "door", "wood", "wall", "handle"], radius: 0.05, height: 0.3, focus: { y: -0.4, span: 1.0 },
      build: (b, a) => photoWallStatic(b, a), rig: photoWallRig, steps: ["the wall turns to wood", "a handle pushes out", "it turns", "it shrinks back", "the photo is taken"] },
    securityCam: { name: "Security camera", desc: "a ceiling-corner security camera with a red recording light (lens to +z; `at` = its wall mount, high up)", category: "theme", themes: ["lab", "office", "modern"], tags: ["camera", "security", "cctv", "watching"], radius: 0.1, height: 0.15, build: securityCam },
    masterSwitch: { name: "Master power switch", desc: "the lab's master switch on a wall (0.3 x 0.45 m, facing +z, `at` = its centre); step 1 throws the lever down (everything off)", category: "theme", themes: ["lab", "industrial"], tags: ["switch", "power", "lever", "lights off"], radius: 0.15, height: 0.45,
      build: (b, a) => switchStatic(b, a), rig: switchRig, steps: ["it is thrown"] },
    specimenDrawer: { name: "Specimen drawer (steel)", desc: "a solid steel specimen cabinet labelled SPECIMEN 8 (0.6 x 0.95 x 0.55 m, front to +z), its top drawer open at first (solid steel, no window). Steps: 1 the photo is laid face down inside, 2 the drawer slams fully shut, 3 the key turns in its lock", category: "theme", themes: ["lab", "horror"], tags: ["drawer", "cabinet", "steel", "lock", "specimen", "seal"], radius: 0.35, height: 0.95, box: [0.3, 0.28],
      build: (b, a) => drawerStatic(b, a), rig: drawerRig, steps: ["the photo goes in, face down", "it slams shut", "the key turns"] },
    keyHook: { name: "Key hook (empty)", desc: "a small wooden key rack with three brass hooks, all empty (0.3 m, on a wall facing +z, `at` = its centre)", category: "theme", themes: ["home"], tags: ["keys", "hook", "rack", "missing"], radius: 0.05, height: 0.1, build: keyHook },
    gutterPuddle: { name: "Flooded gutter", desc: "a dark rain puddle in a gutter (about 1.5 x 0.9 m); variant phone: a phone lying face down in it", category: "theme", themes: ["city", "rain", "night"], tags: ["puddle", "water", "rain", "gutter", "phone"], radius: 0.05, height: 0.02,
      build: (b, a, v) => puddle(b, a, v), variants: { phone: (b, a) => puddle(b, a, "phone") } },
    nightWindow: { name: "Night view (rain) behind a window", desc: "a rainy night outside a window: dark sky, wet rooftops with a few lit windows, a street lamp's glow, rain streaks. 10 x 6 m, unlit; stand it outside a set's window, between the window and the set's painted (daytime) view, facing the room (`at` = its bottom centre)", category: "theme", themes: ["night", "rain", "city"], tags: ["window", "night", "rain", "view", "backdrop", "sky"], radius: 0.05, height: 3.0, build: nightWindow },
    exitSign: { name: "Exit sign", desc: "a green glowing EXIT sign (0.34 m, on a wall facing +z, `at` = its centre): the only light in a blackout", category: "theme", themes: ["lab", "office", "modern"], tags: ["exit", "sign", "glow", "emergency"], radius: 0.05, height: 0.15, build: exitSign },
  },
};
