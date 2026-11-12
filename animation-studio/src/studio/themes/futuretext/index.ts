// PAUSED DRAFT (not registered in themes/index.ts): Future Text Part 1 props, kept for when that story is approved.
// Future Text theme ("I Got a Text From Myself 10 Minutes in the Future", Part 1): production props for the city street
// (morning) and the classroom. A city bus and a red car that travel with a driver (storyboard `track`), the floating
// chat bubble for texts from "Me" (always facing the lens, stamped ten minutes ahead), and Milo's phone screens.
import * as THREE from "three";
import type { Theme } from "..";
import { Batch } from "../../materials/geo";
import { At, frame, col, box } from "../../props/kit";
import { car } from "../../props/outdoor";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const B = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
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
const wrap = (g: CanvasRenderingContext2D, text: string, maxW: number) => {
  const out: string[] = []; let line = "";
  for (const w of text.split(" ")) { const tryL = line ? line + " " + w : w; if (g.measureText(tryL).width > maxW && line) { out.push(line); line = w; } else line = tryL; }
  if (line) out.push(line); return out;
};
/** Milo's selfie avatar (a tan face, spiky brown hair, wide eyes) */
const avatar = (g: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
  g.fillStyle = "#f0c27a"; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
  g.fillStyle = "#e8b04a"; g.beginPath(); g.arc(cx, cy, r * 0.62, 0, 7); g.fill();
  g.fillStyle = "#f3d2a6"; g.beginPath(); g.arc(cx, cy + r * 0.05, r * 0.55, 0, 7); g.fill();
  g.fillStyle = "#6b3f22"; for (const k of [-1, 0, 1]) { g.beginPath(); g.moveTo(cx + k * r * 0.3 - r * 0.15, cy - r * 0.35); g.lineTo(cx + k * r * 0.3 + r * 0.05, cy - r * 0.95); g.lineTo(cx + k * r * 0.3 + r * 0.2, cy - r * 0.35); g.fill(); }
  g.fillStyle = "#fff"; for (const k of [-1, 1]) { g.beginPath(); g.arc(cx + k * r * 0.2, cy + r * 0.02, r * 0.14, 0, 7); g.fill(); }
  g.fillStyle = "#222"; for (const k of [-1, 1]) { g.beginPath(); g.arc(cx + k * r * 0.2, cy + r * 0.04, r * 0.06, 0, 7); g.fill(); }
};

// ---------------- ftBubble: a text from "Me", floating beside the reader (always faces the lens, drawn over the scene)
// variant "8:13|Theo's about to drop his phone." = the stamp (ten minutes ahead) and the text. Step 1 pops it in,
// step 2 pops it out. `at` = the bubble's bottom centre.
const BW = 0.78;
const bubbleTex = (v: string) => stex(`ftBubble${v}`, 1024, 420, (g) => {
  const [stamp, text] = v.split("|");
  g.font = FONT(58); const lines = wrap(g, text, 860).slice(0, 3), h = 130 + lines.length * 70;
  g.clearRect(0, 0, 1024, 420);
  const y0 = 420 - h - 30;
  g.fillStyle = "rgba(0,0,0,0.35)"; rr(g, 26, y0 + 8, 972, h, 46); g.fill();
  g.fillStyle = "#2f8cff"; rr(g, 18, y0, 972, h, 46); g.fill();
  g.beginPath(); g.moveTo(90, y0 + h - 2); g.lineTo(60, 418); g.lineTo(150, y0 + h - 2); g.fill();
  avatar(g, 80, y0 + 58, 34);
  g.textAlign = "left"; g.fillStyle = "#e3f0ff"; g.font = FONT(38); g.fillText("Me", 130, y0 + 72);
  g.textAlign = "right"; g.fillStyle = "#ffd23f"; g.fillText(stamp, 960, y0 + 72);
  g.textAlign = "left"; g.fillStyle = "#fff"; g.font = FONT(58); lines.forEach((l, i) => g.fillText(l, 56, y0 + 150 + i * 70));
});
const bubbleMat = (v: string) => new THREE.MeshBasicMaterial({ map: bubbleTex(v), transparent: true, alphaTest: 0.02, depthTest: true, depthFunc: THREE.AlwaysDepth, depthWrite: false, toneMapped: false });
const bubbleOk = (v: string) => /^\d{1,2}:\d\d\|.{2,90}$/.test(v);
const bubbleRig = (a: At, v = "8:12|Hi."): PropRig => {
  const root = new THREE.Group(), s = a.s ?? 1; root.position.set(a.x, a.y ?? 0, a.z);
  const H = (BW * 420) / 1024, card = new THREE.Mesh(new THREE.PlaneGeometry(BW, H), bubbleMat(v));
  card.position.y = H / 2; card.renderOrder = 998; card.frustumCulled = false; card.layers.set(NOINK); root.add(card);
  return { root, update: ({ step = 0, camPos }) => {
    root.lookAt(camPos);
    const f = clamp01(step), out = clamp01(step - 1), pop = f <= 0 ? 0 : 1 + 0.2 * Math.sin(Math.PI * f) * (1 - f);
    card.visible = f > 0 && out < 1; card.scale.setScalar(s * Math.min(1, f * 3) * pop * (1 - ease(out * 1.6)));
  } };
};
const bubbleStatic = (b: Batch, a: At, v = "8:12|Hi.") => {
  const H = (BW * 420) / 1024; b.add(new THREE.PlaneGeometry(BW, H), bubbleMat(v), frame(a).multiply(new THREE.Matrix4().makeTranslation(0, H / 2, 0)));
};

// ---------------- ftPhone: Milo's phone, upright, screen to +z (15 cm), for inserts. `at` = its bottom centre.
// first: the chat with "Me": clock 8:02, the message stamped 8:12; step 1 rings the stamp, step 2 rings the clock.
// photo: Theo's text with a photo of the bus broken down on the bridge (clock 8:12).
// send: clock 8:11, the chat "To: Me (8:02)" with an empty box and a blinking cursor; step 1 the clock turns 8:12 (red).
const PW = 0.075, PH = 0.15;
const busPhoto = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  const sky = g.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, "#9fb7cf"); sky.addColorStop(1, "#dfe6ea"); g.fillStyle = sky; g.fillRect(x, y, w, h);
  g.fillStyle = "#6f7d86"; g.fillRect(x, y + h * 0.62, w, h * 0.38);                      // the bridge deck
  g.fillStyle = "#4a555d"; for (let k = 0; k <= 8; k++) g.fillRect(x + (k * w) / 8, y + h * 0.48, 6, h * 0.16); g.fillRect(x, y + h * 0.48, w, 6); // railings
  g.fillStyle = "#d9412e"; rr(g, x + w * 0.12, y + h * 0.36, w * 0.66, h * 0.32, 14); g.fill();      // the bus
  g.fillStyle = "#bfe0ff"; for (let k = 0; k < 5; k++) g.fillRect(x + w * 0.16 + k * w * 0.11, y + h * 0.4, w * 0.08, h * 0.1);
  g.fillStyle = "#222"; for (const k of [0.24, 0.66]) { g.beginPath(); g.arc(x + w * k, y + h * 0.69, h * 0.06, 0, 7); g.fill(); }
  g.fillStyle = "rgba(90,90,90,0.75)"; for (const [cx, cy, r] of [[0.8, 0.3, 0.09], [0.86, 0.2, 0.11], [0.92, 0.09, 0.12]]) { g.beginPath(); g.arc(x + w * cx, y + h * cy, h * r, 0, 7); g.fill(); } // smoke
  g.fillStyle = "#ffb020"; g.beginPath(); g.moveTo(x + w * 0.78, y + h * 0.42); g.lineTo(x + w * 0.83, y + h * 0.3); g.lineTo(x + w * 0.86, y + h * 0.42); g.fill(); // hazard flash
};
const phoneTex = (v: string, s: number) => stex(`ftPhone${v}${s}`, 512, 1024, (g) => {
  g.fillStyle = "#0d1118"; g.fillRect(0, 0, 512, 1024);
  const clock = v === "first" ? "8:02" : v === "photo" ? "8:12" : s >= 1 ? "8:12" : "8:11";
  g.textAlign = "center"; g.fillStyle = v === "send" && s >= 1 ? "#ff5a4f" : "#e8edf5"; g.font = FONT(v === "send" ? 120 : 34); g.fillText(clock, 256, v === "send" ? 170 : 52);
  if (v === "first") {
    if (s >= 2) { g.strokeStyle = "#ff3b30"; g.lineWidth = 6; g.beginPath(); g.ellipse(256, 40, 70, 34, 0, 0, 7); g.stroke(); }
    avatar(g, 256, 150, 56); g.fillStyle = "#fff"; g.font = FONT(40); g.fillText("Me", 256, 250);
    g.fillStyle = "#9aa6b8"; g.font = FONT(24); g.fillText("(your own number)", 256, 284);
    g.fillStyle = "#2f8cff"; rr(g, 40, 360, 432, 250, 34); g.fill();
    g.textAlign = "left"; g.fillStyle = "#fff"; g.font = FONT(44); ["Whatever you do,", "DON'T get on", "the bus."].forEach((l, i) => g.fillText(l, 70, 430 + i * 58));
    g.fillStyle = "#ffd23f"; g.font = FONT(34); g.textAlign = "left"; g.fillText("Sent 8:12", 60, 660);
    if (s >= 1) { g.strokeStyle = "#ff3b30"; g.lineWidth = 6; g.beginPath(); g.ellipse(132, 648, 100, 36, 0, 0, 7); g.stroke(); }
    return;
  }
  if (v === "photo") {
    g.textAlign = "left"; g.fillStyle = "#fff"; g.font = FONT(40); g.fillText("Theo", 60, 140);
    g.fillStyle = "#2a3140"; rr(g, 30, 180, 452, 560, 30); g.fill();
    busPhoto(g, 50, 200, 412, 300);
    g.fillStyle = "#fff"; g.font = FONT(38); ["Bus broke down on", "the bridge. We're", "all stuck."].forEach((l, i) => g.fillText(l, 56, 560 + i * 52));
    return;
  }
  // send
  g.fillStyle = "#9aa6b8"; g.font = FONT(30); g.fillText("To:", 256, 300);
  avatar(g, 256, 370, 44); g.fillStyle = "#fff"; g.font = FONT(36); g.fillText("Me", 256, 460);
  g.fillStyle = "#ffd23f"; g.font = FONT(30); g.fillText("(at 8:02, at the bus stop)", 256, 504);
  g.fillStyle = "#1e2532"; rr(g, 30, 600, 452, 110, 40); g.fill(); g.strokeStyle = "#3d4a62"; g.lineWidth = 3; rr(g, 30, 600, 452, 110, 40); g.stroke();
  g.fillStyle = "#2f8cff"; g.fillRect(66, 625, 6, 60);
  g.textAlign = "left"; g.fillStyle = "#6c788c"; g.font = FONT(32); g.fillText("Message...", 86, 666);
  g.fillStyle = "#2f8cff"; g.beginPath(); g.arc(430, 655, 34, 0, 7); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(416, 655); g.lineTo(446, 640); g.lineTo(438, 670); g.fill();
  g.fillStyle = "#1a202b"; g.fillRect(0, 760, 512, 264); g.fillStyle = "#343c4c"; for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { rr(g, 12 + k * 54 + r * 18, 785 + r * 74, 44, 60, 8); g.fill(); }
});
const phoneRig = (a: At, v = "first"): PropRig => {
  const root = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0; root.scale.setScalar(a.s ?? 1);
  root.add(mesh(B(PW + 0.008, PH + 0.01, 0.009), col("#1a1a1e"), 0, PH / 2, -0.005));
  const mat = screenMat(phoneTex(v, 0)), scr = mesh(new THREE.PlaneGeometry(PW, PH), mat, 0, PH / 2, 0.0002); scr.layers.set(NOINK); root.add(scr);
  const n = v === "first" ? 2 : v === "send" ? 1 : 0;
  return { root, update: ({ step = 0 }) => { const t = phoneTex(v, Math.min(n, Math.floor(step + 0.001))); if (mat.map !== t) { mat.map = t; mat.needsUpdate = true; } } };
};
const phoneStatic = (b: Batch, a: At, v = "first") => {
  const m = frame(a);
  box(b, col("#1a1a1e"), m, -(PW + 0.008) / 2, (PW + 0.008) / 2, -0.005, PH + 0.005, -0.0095, -0.0005);
  b.add(new THREE.PlaneGeometry(PW, PH), screenMat(phoneTex(v, 0)), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, PH / 2, 0.0002)));
};

// ---------------- ftBus: a red single-deck city bus, 9.6 x 2.5 x 2.9 m, forward = local +z, the doors on its left
// (local +x) near the front. It travels with its driver (track { who, offset: [0, -3.9] }: the driver sits at the front).
// Steps: 1 the doors fold open, 2 they close. The destination board reads 8:05 HILLCREST SCHOOL.
const BL = 9.6, BWID = 2.5;
const destTex = () => stex("ftDest", 512, 96, (g) => { g.fillStyle = "#111"; g.fillRect(0, 0, 512, 96); g.fillStyle = "#ffb020"; g.font = FONT(40); g.textAlign = "center"; g.fillText("8:05  HILLCREST SCHOOL", 256, 64); });
const busBody = (b: Batch, I = new THREE.Matrix4()) => {
  const red = col("#d9412e"), dark = col("#2b2d36"), white = col("#f3efe6");
  box(b, red, I, -BWID / 2, BWID / 2, 0.35, 1.25, -BL / 2, BL / 2);                 // lower body
  box(b, white, I, -BWID / 2, BWID / 2, 2.35, 2.9, -BL / 2, BL / 2);                 // roof band
  box(b, dark, I, -BWID / 2 + 0.05, BWID / 2 - 0.05, 0.32, 0.36, -BL / 2, BL / 2);   // skirt
  for (let k = 0; k <= 6; k++) { const z = -BL / 2 + 0.05 + k * ((BL - 0.1) / 6); for (const x of [-BWID / 2, BWID / 2 - 0.08]) if (!(x > 0 && z > 2.6 && z < 4.4)) box(b, red, I, x, x + 0.08, 1.25, 2.35, z - 0.06, z + 0.06); }
  box(b, red, I, -BWID / 2, BWID / 2, 1.25, 2.35, BL / 2 - 0.08, BL / 2);            // front frame (the windscreen is glass)
  box(b, red, I, -BWID / 2, BWID / 2, 1.25, 2.35, -BL / 2, -BL / 2 + 0.08);
  box(b, col("#c9ccd4"), I, -BWID / 2 + 0.2, BWID / 2 - 0.2, 0.5, 0.8, BL / 2, BL / 2 + 0.03); // grille
  for (const x of [-0.9, 0.9]) box(b, col("#fff4c0"), I, x - 0.16, x + 0.16, 0.6, 0.76, BL / 2, BL / 2 + 0.04); // lamps
  box(b, dark, I, -BWID / 2 + 0.1, BWID / 2 - 0.1, 0.4, 0.46, -BL / 2 + 0.2, BL / 2 - 0.2);  // floor
  for (let k = 0; k < 5; k++) for (const x of [-0.7, 0.7]) box(b, col("#3d5a8a"), I, x - 0.3, x + 0.3, 0.46, 0.95, -BL / 2 + 0.8 + k * 1.5, -BL / 2 + 1.3 + k * 1.5); // seats
  b.add(new THREE.PlaneGeometry(1.6, 0.3), screenMat(destTex()), I.clone().multiply(new THREE.Matrix4().makeTranslation(0, 2.62, BL / 2 + 0.01)));
};
const WHEELS: [number, number][] = [[-1.2, 3.0], [1.2, 3.0], [-1.2, -3.0], [1.2, -3.0]];
const busRig = (a: At): PropRig => {
  const root = new THREE.Group(), body = new THREE.Group(), b = new Batch();
  busBody(b); b.build(body, true); root.add(body);
  const glass = new THREE.MeshBasicMaterial({ color: 0x9fc4e8, transparent: true, opacity: 0.28, depthWrite: false });
  for (const x of [-BWID / 2 + 0.04, BWID / 2 - 0.04]) body.add(mesh(new THREE.PlaneGeometry(BL - 0.2, 1.1).rotateY(Math.PI / 2), glass, x, 1.8, 0));
  body.add(mesh(new THREE.PlaneGeometry(BWID - 0.2, 1.1), glass, 0, 1.8, BL / 2 - 0.04));
  const wheels = WHEELS.map(([x, z]) => { const w = mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.32, 18).rotateZ(Math.PI / 2), col("#22242b"), x, 0.48, z); root.add(w); return w; });
  const doorMat = col("#b8c9d8"), doors = [0, 1].map((k) => { const d = mesh(B(0.05, 1.95, 0.88), doorMat, BWID / 2 - 0.02, 1.33, 3.05 + k * 0.9); body.add(d); return d; });
  root.position.set(a.x, 0, a.z); root.rotation.y = a.yaw ?? 0;
  return { root, update: ({ step = 0, track }) => {
    if (track) { root.position.set(track.pos[0], 0, track.pos[2]); root.rotation.y = track.heading; for (const w of wheels) w.rotation.x = track.dist / 0.48; body.position.y = track.speed > 0.3 ? 0.015 * Math.sin(track.dist * 3) : 0; }
    const open = ease(step) * (1 - ease(step - 1));
    doors.forEach((d, k) => { d.position.z = 3.05 + k * 0.9 + (k ? 0.42 : -0.42) * open; d.scale.z = 1 - 0.85 * open; });
  } };
};
const busStatic = (b: Batch, a: At) => busBody(b, frame(a));

// ---------------- ftRedCar: the library's hatchback in red, travelling with its driver (track { who }; the driver sits
// low inside, offset [0, -0.2]). Forward = local +z.
const redCarRig = (a: At): PropRig => {
  const root = new THREE.Group(), body = new THREE.Group(), b = new Batch();
  car(b, { x: 0, z: 0 }, "#e0262c"); b.build(body, true); root.add(body);
  root.position.set(a.x, 0, a.z); root.rotation.y = a.yaw ?? 0;
  return { root, update: ({ track }) => { if (track) { root.position.set(track.pos[0], 0, track.pos[2]); root.rotation.y = track.heading; } } };
};

export const FUTURETEXT_THEME: Theme = {
  id: "futuretext", name: "Future Text (I Got a Text From Myself 10 Minutes in the Future)", desc: "texts from Milo's own number, ten minutes ahead: a floating chat bubble from 'Me', Milo's phone screens (the first text, Theo's photo of the broken-down bus, the send screen), a red city bus and a speeding red car that travel with their drivers",
  tags: ["mystery", "time", "phone", "bus", "school", "city"],
  mood: "mystery",
  props: {
    ftBubble: { name: "Text bubble from 'Me'", desc: "a chat bubble floating in the scene (always faces the lens, drawn over everything): Milo's selfie, 'Me', a yellow stamp ten minutes ahead and the text (up to three lines). Variant 'stamp|text', e.g. 8:13|Theo's about to drop his phone. Step 1 pops it in, step 2 pops it out; `at` = its bottom centre (0.78 m wide)", category: "theme", themes: ["modern", "phone", "mystery"], tags: ["text", "message", "bubble", "chat", "phone", "future"], radius: 0.05, height: 0.32,
      build: (b, a, v) => bubbleStatic(b, a, v), rig: bubbleRig, steps: ["it pops in", "it pops out"], param: { desc: "stamp|text, e.g. 8:13|Theo's about to drop his phone.", ok: bubbleOk } },
    ftPhone: { name: "Milo's phone (Future Text screens)", desc: "a phone upright, screen to +z (15 cm), for inserts. first: the chat with 'Me' (his own number): clock 8:02, 'Whatever you do, DON'T get on the bus.' stamped Sent 8:12; step 1 rings the stamp, step 2 the clock. photo: Theo's text with a photo of the red bus broken down and smoking on a bridge. send: the clock 8:11 over a compose screen 'To: Me (at 8:02, at the bus stop)' with a blinking cursor; step 1 the clock turns 8:12 (red)", category: "theme", themes: ["modern", "phone"], tags: ["phone", "text", "message", "screen", "time"], radius: 0.05, height: 0.16,
      build: (b, a, v) => phoneStatic(b, a, v), rig: phoneRig, steps: ["the next screen state"], stepCount: (v) => (v === "first" ? 2 : v === "send" ? 1 : 0), param: { desc: "first, photo or send", ok: (v) => ["first", "photo", "send"].includes(v) } },
    ftBus: { name: "City bus (8:05 Hillcrest School)", desc: "a red single-deck city bus (9.6 x 2.5 x 2.9 m, forward = +z), see-through windows with seats, folding doors on its left near the front, destination board 8:05 HILLCREST SCHOOL. It travels with its driver: track { who, offset: [0, -3.9] } on a driver who rides (mode ride) along the lane at y 0.45. Steps: 1 the doors open, 2 they close", category: "theme", themes: ["modern", "city", "school"], tags: ["bus", "vehicle", "transport", "school", "doors"], radius: 1.4, height: 2.9, box: [1.25, 4.8],
      build: (b, a) => busStatic(b, a), rig: busRig, steps: ["the doors open", "the doors close"] },
    ftRedCar: { name: "Red car (speeding)", desc: "the library's hatchback in bright red, travelling with its driver: track { who, offset: [0, -0.2] } on a driver riding (mode ride) at y 0.15", category: "theme", themes: ["modern", "city"], tags: ["car", "vehicle", "red", "speeding"], radius: 1.1, height: 1.5, box: [0.9, 2.0],
      build: (b, a) => car(b, a, "#e0262c"), rig: redCarRig },
  },
};
