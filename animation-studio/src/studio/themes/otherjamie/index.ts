// The Other Jamie theme (productions/other-jamie): a horror thriller. Sam's best friend Jamie came back from Ashby
// Woods as a copy who never did anything wrong; the real Jamie is trapped behind the glass of a mirror hanging in the
// woods, kept by a tall thing with a mirror for a face. Reused from the base library: the Alder Row street at night
// (Locked Out), the home and classroom sets, trees, the bench and street lamp, the crowd generator, the night light.
// New here:
//   set ashbyWoods (the woods: dense trees, a clearing where the mirrors hang, the path in from the treeline, the
//     field beyond)
//   props mirrorThing (the creature), hangingMirror (a mirror on a string with a face behind the glass), jamiePhone
//     (Sam's phone: Jamie's texts), appealPoster (the police appeal on a lamppost), ellieSign, ellieJar,
//     leftHandCard (the left hand writing), choiceCards (the A / B ending), torchBeam
//   items flashlight, chips; characters samOJ, jamie, jamieMud, brother, schoolKid
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { INK, type Pen } from "../../characters/toon";
import { Batch, quadUp } from "../../materials/geo";
import { dirtHD } from "../../materials/paint2";
import { At, col, tex, cyl } from "../../props/kit";
import { tree } from "../../props/nature";
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
const card = (t: THREE.Texture, opts: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.02, ...opts });
const still = (make: () => THREE.Object3D) => (a: At): PropRig => { const root = rigRoot(a); root.add(make()); return { root, update: () => undefined }; };

// ---------------------------------------------------------------- faces behind the glass (toon drawings)
// who: the real Jamie (dirty-blond curls, red hoodie), Mrs Hale the maths teacher (grey bob, glasses), a man, a
// woman, an old man. pose 0: hands flat on the glass; pose 1 (Jamie): fists raised, mid-pound
type FaceK = "jamie" | "teacher" | "man" | "woman" | "old";
const FACE: Record<FaceK, { skin: string; hair: string; top: string; glasses?: boolean; hairK: "curly" | "bob" | "short" | "long" | "bald" }> = {
  jamie: { skin: "#f0c8a8", hair: "#c9a24a", top: "#b8423a", hairK: "curly" }, teacher: { skin: "#e8c0a0", hair: "#a8a49c", top: "#5d6a3a", glasses: true, hairK: "bob" },
  man: { skin: "#c99067", hair: "#2a201a", top: "#3f5f7a", hairK: "short" }, woman: { skin: "#f1c9a8", hair: "#8a4a2a", top: "#8c3b4a", hairK: "long" }, old: { skin: "#e3b897", hair: "#ece8de", top: "#6a5a4a", hairK: "bald" },
};
const drawFace = (g: CanvasRenderingContext2D, k: FaceK, pose: number, W: number, H: number) => {
  const f = FACE[k], cx = W / 2, cy = H * 0.44, r = W * 0.27;
  g.fillStyle = "#101820"; g.fillRect(0, 0, W, H);                                                 // the dark behind the glass
  const gr = g.createRadialGradient(cx, cy, r * 0.4, cx, cy, W * 0.7); gr.addColorStop(0, "rgba(120,150,190,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.lineWidth = W * 0.018; g.strokeStyle = INK; g.lineJoin = "round";
  g.fillStyle = f.top; g.beginPath(); g.ellipse(cx, H * 0.98, W * 0.42, H * 0.25, 0, Math.PI, 0); g.fill(); g.stroke();         // shoulders
  if (f.hairK === "long") { g.fillStyle = f.hair; g.beginPath(); g.ellipse(cx, cy + r * 0.3, r * 1.15, r * 1.3, 0, 0, 7); g.fill(); g.stroke(); }
  g.fillStyle = f.skin; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.stroke();                                              // head
  g.fillStyle = f.hair;
  if (f.hairK === "curly") for (let i = -4; i <= 4; i++) { g.beginPath(); g.arc(cx + i * r * 0.24, cy - r * 0.82 + Math.abs(i) * r * 0.08, r * 0.24, 0, 7); g.fill(); g.stroke(); }
  if (f.hairK === "bob" || f.hairK === "long" || f.hairK === "short") { g.beginPath(); g.ellipse(cx, cy - r * 0.55, r * 1.02, r * (f.hairK === "short" ? 0.5 : 0.62), 0, Math.PI, 0); g.fill(); g.stroke(); }
  // eyes wide, staring; brows up; mouth open (shouting)
  for (const s of [-1, 1]) { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(cx + s * r * 0.36, cy - r * 0.05, r * 0.2, r * 0.24, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(cx + s * r * 0.36, cy - r * 0.02, r * 0.08, 0, 7); g.fill();
    g.beginPath(); g.moveTo(cx + s * r * 0.15, cy - r * 0.42); g.lineTo(cx + s * r * 0.55, cy - r * 0.5 + (k === "jamie" ? r * 0.08 : 0)); g.stroke(); }
  if (f.glasses) for (const s of [-1, 1]) { g.beginPath(); g.arc(cx + s * r * 0.36, cy - r * 0.05, r * 0.27, 0, 7); g.stroke(); }
  g.fillStyle = "#3a1218"; g.beginPath(); g.ellipse(cx, cy + r * 0.5, r * 0.22, r * (k === "jamie" ? 0.2 : 0.12), 0, 0, 7); g.fill(); g.stroke();
  // hands on the glass: flat palms, or Jamie's fists raised
  for (const s of [-1, 1]) {
    const hx = cx + s * W * 0.36, hy = pose ? H * 0.22 : H * 0.5;
    g.fillStyle = f.skin; g.beginPath();
    if (pose) g.arc(hx, hy, W * 0.1, 0, 7); else g.ellipse(hx, hy, W * 0.09, W * 0.12, 0, 0, 7);
    g.fill(); g.stroke();
    if (!pose) for (let j = 0; j < 4; j++) { g.beginPath(); g.ellipse(hx - W * 0.06 + j * W * 0.04, hy - W * 0.15, W * 0.018, W * 0.05, 0, 0, 7); g.fillStyle = f.skin; g.fill(); g.stroke(); }
  }
};
const faceTex = (k: FaceK, pose = 0) => stex(`ojFace${k}${pose}`, 256, 340, (g) => drawFace(g, k, pose, 256, 340));
/** the glass itself: a faint sheen over whatever is behind it */
const sheenTex = () => stex("ojSheen", 256, 340, (g) => {
  g.clearRect(0, 0, 256, 340); const gr = g.createLinearGradient(0, 0, 256, 340); gr.addColorStop(0, "rgba(255,255,255,0.28)"); gr.addColorStop(0.35, "rgba(255,255,255,0.0)"); gr.addColorStop(0.6, "rgba(255,255,255,0.12)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 340);
});
const fogTex = () => stex("ojFog", 256, 340, (g) => {
  const gr = g.createRadialGradient(128, 170, 30, 128, 170, 190); gr.addColorStop(0, "rgba(210,220,230,0.0)"); gr.addColorStop(0.5, "rgba(210,220,230,0.65)"); gr.addColorStop(1, "rgba(220,228,236,1)");
  g.fillStyle = gr; g.fillRect(0, 0, 256, 340);
});
/** the creature's face when Sam looks into it: Sam's own face, lit from below by his torch, a lens flare */
const samMirrorTex = () => stex("ojSamMirror", 256, 340, (g) => {
  g.fillStyle = "#0c1018"; g.fillRect(0, 0, 256, 340);
  const cx = 128, cy = 160, r = 66; g.lineWidth = 5; g.strokeStyle = INK;
  g.fillStyle = "#3f5f7a"; g.beginPath(); g.ellipse(cx, 340, 110, 80, 0, Math.PI, 0); g.fill(); g.stroke();      // hoodie
  const sk = g.createLinearGradient(0, cy + r, 0, cy - r); sk.addColorStop(0, "#f6d8b8"); sk.addColorStop(1, "#9a7a68"); g.fillStyle = sk; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.stroke();
  g.fillStyle = "#4a3426"; g.beginPath(); g.ellipse(cx, cy - r * 0.55, r * 1.02, r * 0.5, 0, Math.PI, 0); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = "#fff"; g.beginPath(); g.ellipse(cx + s * 24, cy, 13, 16, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(cx + s * 24, cy + 2, 5, 0, 7); g.fill(); }
  g.fillStyle = "#3a1218"; g.beginPath(); g.ellipse(cx, cy + 34, 10, 7, 0, 0, 7); g.fill();
  const fl = g.createRadialGradient(70, 300, 4, 70, 300, 80); fl.addColorStop(0, "rgba(255,250,220,1)"); fl.addColorStop(0.3, "rgba(255,240,190,0.5)"); fl.addColorStop(1, "rgba(255,240,190,0)"); g.fillStyle = fl; g.fillRect(0, 0, 256, 340);  // his torch
});
const ovalAlpha = () => stex("ojOval", 256, 340, (g) => { g.fillStyle = "#000"; g.fillRect(0, 0, 256, 340); g.fillStyle = "#fff"; g.beginPath(); g.ellipse(128, 170, 124, 166, 0, 0, 7); g.fill(); });
const ovalGeo = (w: number, h: number) => new THREE.CircleGeometry(0.5, 48).scale(w, h, 1);

// ---------------------------------------------------------------- prop: hangingMirror
/** a mirror (0.5 x 0.68 m, oval, a dark iron frame) hanging on a string from a branch, turning slowly over its steps;
 *  behind the glass, a face (variant: jamie, teacher, man, woman, old, empty). jamie pounds on the glass (its pose
 *  alternates each step); jamieFade: the same, the glass fogging over across its steps (dark by ~12). `at` = the
 *  mirror's centre; the string runs 1.6 m up. */
const mirrorRig = (a: At, v = "empty"): PropRig => {
  const root = rigRoot(a), swing = new THREE.Group(); root.add(swing);
  const k = (v.replace("Fade", "") as FaceK), fade = v.endsWith("Fade"), hasFace = v !== "empty";
  const frame = mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 48).scale(0.52, 0.7, 1), new THREE.MeshLambertMaterial({ color: "#3a332e" })); swing.add(frame);
  swing.add(mesh(ovalGeo(1.0, 1.36), new THREE.MeshLambertMaterial({ color: "#2a2622" }), 0, 0, -0.012));                    // the back
  const glass = mesh(ovalGeo(0.98, 1.34), card(hasFace ? faceTex(k, 0) : stex("ojEmpty", 64, 64, (g) => { const gr = g.createLinearGradient(0, 0, 64, 64); gr.addColorStop(0, "#5a6a80"); gr.addColorStop(1, "#141a24"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), { alphaMap: ovalAlpha() }), 0, 0, 0.005);
  glass.scale.set(0.5, 0.5, 1); swing.add(glass);
  const sheen = mesh(ovalGeo(0.98, 1.34), card(sheenTex(), { depthWrite: false }), 0, 0, 0.01); sheen.scale.set(0.5, 0.5, 1); swing.add(sheen);
  const fog = fade ? mesh(ovalGeo(0.98, 1.34), card(fogTex(), { depthWrite: false, opacity: 0 }), 0, 0, 0.012) : null; if (fog) { fog.scale.set(0.5, 0.5, 1); swing.add(fog); }
  root.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.6, 4), new THREE.MeshBasicMaterial({ color: "#9a948c" }), 0, 0.34 + 0.8, 0));
  return { root, update: ({ step = 0 }) => {
    swing.rotation.y = Math.sin(step * 0.35) * 0.35; swing.rotation.z = Math.sin(step * 0.5) * 0.03;
    if (k === "jamie") (glass.material as THREE.MeshBasicMaterial).map = faceTex("jamie", Math.floor(step) % 2);
    if (fog) (fog.material as THREE.MeshBasicMaterial).opacity = Math.min(0.92, step / 12);
  } };
};

// ---------------------------------------------------------------- prop: mirrorThing (the creature)
/** the thing in the woods: very tall (2.7 m) and thin, a long dark coat to the ground, long thin arms with long
 *  fingers hanging to its knees, and where its face should be an oval mirror (0.5 x 0.66 m). Variant sam: the mirror
 *  shows Sam's own face, lit by his torch; jamie: the real Jamie behind the glass, pounding. Steps: 1 tilts its head
 *  (slowly, the way Sam just did), 2 tilts it back, 3 lifts one long hand toward the camera, 4 lowers it; it leans a
 *  little toward the lens as it goes. `at` = its feet, facing +z. */
const thingRig = (a: At, v = "sam"): PropRig => {
  const root = rigRoot(a), coatM = new THREE.MeshLambertMaterial({ color: "#16161c" }), skinM = new THREE.MeshLambertMaterial({ color: "#b8b4b0" });
  const body = new THREE.Group(); root.add(body);
  body.add(mesh(new THREE.CylinderGeometry(0.16, 0.42, 2.0, 18, 1, true), coatM, 0, 1.0, 0));                                 // the coat
  body.add(mesh(new THREE.SphereGeometry(0.2, 16, 10).scale(1.2, 0.6, 0.8), coatM, 0, 2.02, 0));                              // narrow shoulders
  const neck = mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.32, 8), skinM, 0, 2.2, 0); body.add(neck);
  const head = new THREE.Group(); head.position.set(0, 2.36, 0); body.add(head);
  head.add(mesh(new THREE.TorusGeometry(0.5, 0.03, 8, 48).scale(0.5, 0.66, 1), new THREE.MeshLambertMaterial({ color: "#8a8680" }), 0, 0.33, 0));
  head.add(mesh(ovalGeo(0.5, 0.66), new THREE.MeshLambertMaterial({ color: "#0e0e12" }), 0, 0.33, -0.02));
  const face = mesh(ovalGeo(0.49, 0.65), card(v === "jamie" ? faceTex("jamie", 1) : samMirrorTex(), { alphaMap: ovalAlpha() }), 0, 0.33, 0.004); head.add(face);
  const sh = mesh(ovalGeo(0.49, 0.65), card(sheenTex(), { depthWrite: false }), 0, 0.33, 0.008); head.add(sh);
  const arm = (s: number) => { const g = new THREE.Group(); g.position.set(s * 0.24, 1.98, 0); body.add(g);
    g.add(mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.25, 8), coatM, 0, -0.62, 0));
    for (let f = 0; f < 4; f++) g.add(mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.26, 5), skinM, (f - 1.5) * 0.02, -1.36, 0.01));
    return g; };
  const left = arm(-1), right = arm(1);
  return { root, update: ({ step = 0 }) => {
    const tilt = Math.min(1, Math.max(0, step)) - Math.min(1, Math.max(0, step - 1)), lift = Math.min(1, Math.max(0, step - 2)) - Math.min(1, Math.max(0, step - 3));
    head.rotation.z = tilt * 0.42; body.rotation.x = 0.04 + Math.min(1, step / 4) * 0.06;
    right.rotation.x = -lift * 1.25; right.rotation.z = lift * 0.15; left.rotation.z = -0.04; right.position.z = lift * 0.05;
    if (v === "jamie") (face.material as THREE.MeshBasicMaterial).map = faceTex("jamie", Math.floor(step * 2) % 2);
  } };
};

// ---------------------------------------------------------------- inserts (ink cards)
/** Sam's phone: the chat with Jamie (his old number). hook: "Sam. That's not me next to you." summons: + "I'm behind
 *  the glass." "Ashby Woods." "Come alone." (one per step), real: + "Get me out. And don't tell anyone about Mill
 *  Lane. We'll forget it ever happened." */
const MSGS: Record<string, string[]> = {
  hook: ["Sam. That's not me next to you."],
  summons: ["Sam. That's not me next to you.", "I'm behind the glass.", "Ashby Woods.", "Come alone."],
  real: ["Ashby Woods.", "Come alone.", "Get me out. And don't tell anyone about Mill Lane. We'll forget it ever happened."],
};
const wrap = (g: CanvasRenderingContext2D, s: string, w: number) => { const out: string[] = []; let line = ""; for (const word of s.split(" ")) { const t = line ? line + " " + word : word; if (g.measureText(t).width > w && line) { out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
const phoneTex = (v: string, n: number) => stex(`ojPhone${v}${n}`, 640, 1024, (g) => {
  g.clearRect(0, 0, 640, 1024);
  g.fillStyle = "#d9a07a"; g.beginPath(); g.ellipse(150, 980, 120, 200, 0.3, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke();            // the hand
  g.fillStyle = "#16181d"; rr(g, 100, 40, 440, 900, 56); g.fill(); g.stroke();
  g.fillStyle = "#0b0d12"; rr(g, 122, 66, 396, 848, 40); g.fill();
  g.fillStyle = "#1c2230"; g.fillRect(122, 100, 396, 92);                                                                  // header
  g.fillStyle = "#c9a24a"; g.beginPath(); g.arc(178, 146, 28, 0, 7); g.fill(); g.fillStyle = "#1c2230"; g.font = FONT(30); g.textAlign = "center"; g.fillText("J", 178, 157);
  g.fillStyle = "#ffffff"; g.font = FONT(38); g.textAlign = "left"; g.fillText("Jamie", 222, 158);
  g.fillStyle = "#8a93a6"; g.font = FONT(22, "normal"); g.fillText(v === "hook" ? "11:47 PM" : "11:52 PM", 400, 158);
  const list = MSGS[v].slice(0, Math.max(1, n)); let y = 240;
  list.forEach((m, i) => {
    const last = i === list.length - 1, size = last ? (v === "real" ? 36 : 40) : 30; g.font = FONT(size); const lines = wrap(g, m, 300), bh = lines.length * (size + 12) + 28;
    g.fillStyle = last ? "#2f6fdb" : "#2a3142"; rr(g, 146, y, 336, bh, 26); g.fill();
    g.fillStyle = "#ffffff"; lines.forEach((ln, j) => g.fillText(ln, 168, y + 22 + size + j * (size + 12) - 8));
    y += bh + 22;
  });
  g.fillStyle = "#1c2230"; rr(g, 140, 846, 360, 48, 24); g.fill();
});
const phoneRig = (a: At, v = "hook"): PropRig => {
  const root = rigRoot(a), m = mesh(new THREE.PlaneGeometry(0.25, 0.4), card(phoneTex(v, 1), { toneMapped: false })); root.add(m);
  return { root, update: ({ step = 0 }) => { const n = v === "hook" ? 1 : v === "real" ? (step > 1.5 ? 3 : 2) : Math.max(1, Math.min(4, Math.floor(step + 1))); (m.material as THREE.MeshBasicMaterial).map = phoneTex(v, n); } };
};
/** the police appeal on a lamppost (0.42 x 0.6 m, facing +z): POLICE APPEAL · HIT AND RUN · MILL LANE · FRIDAY 11PM,
 *  a school photo of Ellie, ELLIE MARSH, 14 · CRITICAL · THE DRIVER DID NOT STOP · Did you see anything? */
const posterTex = () => stex("ojPoster", 640, 900, (g) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 640, 900); g.fillStyle = "#1f3f8a"; g.fillRect(0, 0, 640, 150);
  g.fillStyle = "#ffffff"; g.font = FONT(64); g.textAlign = "center"; g.fillText("POLICE APPEAL", 320, 98);
  g.fillStyle = "#c0353a"; g.font = FONT(78); g.fillText("HIT AND RUN", 320, 240);
  g.fillStyle = "#1c1c22"; g.font = FONT(40); g.fillText("MILL LANE · FRIDAY 11PM", 320, 300);
  g.fillStyle = "#cfd8e4"; g.fillRect(170, 330, 300, 330); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(170, 330, 300, 330);   // Ellie's school photo
  g.fillStyle = "#3f5f9a"; g.beginPath(); g.ellipse(320, 660, 130, 90, 0, Math.PI, 0); g.fill(); g.stroke();
  g.fillStyle = "#6a3a22"; g.beginPath(); g.ellipse(320, 480, 92, 110, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = "#f1c9a8"; g.beginPath(); g.arc(320, 470, 70, 0, 7); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.arc(320 + s * 24, 466, 7, 0, 7); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.arc(320, 488, 22, 0.2, Math.PI - 0.2); g.stroke();
  g.fillStyle = "#1c1c22"; g.font = FONT(48); g.fillText("ELLIE MARSH, 14", 320, 730); g.fillStyle = "#c0353a"; g.font = FONT(40); g.fillText("CRITICAL", 320, 780);
  g.fillStyle = "#1c1c22"; g.font = FONT(34); g.fillText("THE DRIVER DID NOT STOP", 320, 835); g.font = FONT(28, "normal"); g.fillText("Did you see anything?", 320, 878);
});
/** the copy's hand-made sign (0.6 x 0.42 m, cardboard, facing +z): FOR ELLIE and a heart, in marker pen */
const signTex = () => stex("ojSign", 640, 448, (g) => {
  g.fillStyle = "#c9a26a"; g.fillRect(0, 0, 640, 448); g.strokeStyle = "#a8844e"; g.lineWidth = 4; for (let y = 30; y < 448; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(640, y + 6); g.stroke(); }
  g.fillStyle = "#1c1c22"; g.font = FONT(130); g.textAlign = "center"; g.fillText("FOR", 320, 170); g.fillText("ELLIE", 320, 320);
  g.fillStyle = "#c0353a"; g.beginPath(); g.moveTo(320, 420); g.bezierCurveTo(250, 370, 270, 330, 320, 360); g.bezierCurveTo(370, 330, 390, 370, 320, 420); g.fill();
});
/** the copy writing with his left hand (0.4 x 0.4 m insert, facing +z): a left hand with a pen over a birthday card,
 *  "Happy birthday Mum" half-written */
const leftHandTex = () => stex("ojLeft", 640, 640, (g) => {
  g.fillStyle = "#e9e2d2"; g.fillRect(0, 0, 640, 640); g.fillStyle = "#f8f4ea"; g.fillRect(70, 120, 500, 380); g.strokeStyle = "#c9b89a"; g.lineWidth = 4; g.strokeRect(70, 120, 500, 380);
  g.fillStyle = "#2a3a8a"; g.font = "italic 54px 'DejaVu Serif', serif"; g.textAlign = "left"; g.fillText("Happy birthday", 120, 260); g.fillText("Mum", 120, 340);
  g.strokeStyle = INK; g.lineWidth = 8; g.fillStyle = "#f0c8a8";                                                       // the LEFT hand comes in from the left
  g.beginPath(); g.moveTo(0, 520); g.quadraticCurveTo(130, 420, 250, 380); g.quadraticCurveTo(300, 370, 300, 410); g.quadraticCurveTo(250, 470, 160, 560); g.lineTo(0, 640); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#b8423a"; g.beginPath(); g.moveTo(0, 560); g.lineTo(110, 500); g.lineTo(170, 640); g.lineTo(0, 640); g.closePath(); g.fill(); g.stroke();   // red hoodie cuff
  g.strokeStyle = "#1c1c22"; g.lineWidth = 12; g.beginPath(); g.moveTo(240, 400); g.lineTo(300, 340); g.stroke();      // the pen
});
/** the ending (0.5 x 0.89 m, facing +z): A and B on two cards, on black */
const choiceTex = () => stex("ojChoice", 720, 1280, (g) => {
  g.fillStyle = "#07080c"; g.fillRect(0, 0, 720, 1280);
  const one = (y: number, L: string, c: string, t1: string, t2: string) => {
    g.fillStyle = c; rr(g, 70, y, 580, 320, 40); g.fill(); g.strokeStyle = "#ffffff"; g.lineWidth = 8; g.stroke();
    g.fillStyle = "#ffffff"; g.font = FONT(130); g.textAlign = "center"; g.fillText(L, 360, y + 130);
    g.font = FONT(46); g.fillText(t1, 360, y + 215); g.fillText(t2, 360, y + 272);
  };
  one(70, "A", "#1f4fb8", "BRING BACK THE", "REAL JAMIE");                                        // both in the top 58 %:
  one(420, "B", "#b8423a", "KEEP THE ONE WHO", "NEVER DID IT");                                   // the captions sit below them
});
/** a torch beam: a soft cone of light (5 m long) from Sam's torch, `at` = the torch, pointing along local +z */
const beamRig = (a: At): PropRig => {
  const root = rigRoot(a), g = new THREE.ConeGeometry(1.1, 5, 24, 1, true).rotateX(-Math.PI / 2).translate(0, 0, 2.5);
  root.add(mesh(g, new THREE.MeshBasicMaterial({ color: "#fff3c8", transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })));
  root.add(mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: "#fffbe8" })));
  return { root, update: () => undefined };
};


// ---------------------------------------------------------------- the hit-and-run, on the police camera
/** carDrive: Jamie's mum's car (a small dark-blue hatchback, 3.9 m) driving along local +x with its headlights on.
 *  Variant approach: from 14 m back it reaches the `at` point on its 15th step (give it steady steps, every 0.15 s);
 *  stop: it sits 1.5 m past the `at` point, brake lights on, until its 10th step, then pulls away fast. `at` = where
 *  it hits, on the road (yaw to set the road's direction). */
const carRig = (a: At, v = "approach"): PropRig => {
  const root = rigRoot(a), car = new THREE.Group(); root.add(car);
  const body = new THREE.MeshLambertMaterial({ color: "#26365a" }), glass = new THREE.MeshLambertMaterial({ color: "#1a2230" }), tyre = new THREE.MeshLambertMaterial({ color: "#121214" });
  car.add(mesh(new THREE.BoxGeometry(3.9, 0.7, 1.7), body, 0, 0.6, 0)); car.add(mesh(new THREE.BoxGeometry(2.3, 0.6, 1.55), body, -0.35, 1.2, 0));
  car.add(mesh(new THREE.BoxGeometry(2.25, 0.46, 1.58), glass, -0.35, 1.22, 0));
  for (const [x, z] of [[1.25, 0.82], [1.25, -0.82], [-1.25, 0.82], [-1.25, -0.82]]) car.add(mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.22, 16).rotateX(Math.PI / 2), tyre, x, 0.33, z));
  const head = new THREE.MeshBasicMaterial({ color: "#fff6d8" }), brake = new THREE.MeshBasicMaterial({ color: "#5a1010" });
  for (const z of [0.55, -0.55]) { car.add(mesh(new THREE.BoxGeometry(0.05, 0.16, 0.34), head, 1.96, 0.72, z)); car.add(mesh(new THREE.BoxGeometry(0.05, 0.14, 0.3), brake, -1.96, 0.74, z)); }
  const cone = mesh(new THREE.ConeGeometry(2.2, 9, 20, 1, true).rotateZ(Math.PI / 2).translate(6.4, 0.55, 0), new THREE.MeshBasicMaterial({ color: "#fff3c8", transparent: true, opacity: 0.1, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); car.add(cone);
  return { root, update: ({ step = 0 }) => {
    if (v === "approach") { car.position.x = -14 + Math.min(step, 16) * (14 / 15); brake.color.set("#5a1010"); }
    else { const go = Math.max(0, step - 10); car.position.x = 1.5 + go * go * 0.09; brake.color.set(go > 0 ? "#5a1010" : "#ff2a2a"); }
  } };
};
/** the police-camera look over a shot (an overlay card 0.27 x 0.48 m, facing +z, ~0.5 m in front of an `at` camera
 *  with fov 50): scanlines, a green-grey tint and a vignette, the camera's name, a timestamp ticking each step, REC */
const cctvTex = (sec: number) => stex(`ojCctv${sec}`, 540, 960, (g) => {
  g.clearRect(0, 0, 540, 960);
  const vg = g.createRadialGradient(270, 480, 200, 270, 480, 620); vg.addColorStop(0, "rgba(10,20,16,0)"); vg.addColorStop(1, "rgba(5,10,8,0.85)"); g.fillStyle = vg; g.fillRect(0, 0, 540, 960);
  g.fillStyle = "rgba(120,160,130,0.10)"; g.fillRect(0, 0, 540, 960);
  for (let y = 0; y < 960; y += 4) { g.fillStyle = "rgba(0,0,0,0.16)"; g.fillRect(0, y, 540, 2); }
  g.strokeStyle = "rgba(230,240,230,0.9)"; g.lineWidth = 4; for (const [x, y, dx, dy] of [[66, 140, 1, 1], [474, 140, -1, 1], [66, 872, 1, -1], [474, 872, -1, -1]] as const) { g.beginPath(); g.moveTo(x, y + dy * 44); g.lineTo(x, y); g.lineTo(x + dx * 44, y); g.stroke(); }
  g.fillStyle = "rgba(235,245,235,0.95)"; g.font = "bold 30px 'DejaVu Sans Mono', monospace"; g.textAlign = "left"; g.fillText("POLICE CCTV", 84, 188); g.fillText("MILL LANE · CAM 03", 84, 226);
  g.fillText(`FRI  23:04:${String(17 + sec).padStart(2, "0")}`, 84, 846);
  g.fillStyle = "#ff3030"; g.beginPath(); g.arc(398, 178, 11, 0, 7); g.fill(); g.fillStyle = "rgba(235,245,235,0.95)"; g.fillText("REC", 416, 188);
});
const cctvRig = (a: At): PropRig => { const root = rigRoot(a), m = mesh(new THREE.PlaneGeometry(0.27, 0.48), card(cctvTex(0), { depthTest: false, toneMapped: false })); m.renderOrder = 10; root.add(m);
  return { root, update: ({ step = 0, camPos }) => { (m.material as THREE.MeshBasicMaterial).map = cctvTex(Math.floor(step / 7));
    // hold 0.5 m in front of the lens on the line to its anchor (the camera may push in; the card must not grow)
    const d = root.position.clone().sub(camPos).normalize().multiplyScalar(0.5); m.position.copy(camPos).add(d).sub(root.position); m.lookAt(camPos); } }; };  // always square to the lens
/** the police camera's enhanced still (0.27 x 0.48 m insert, facing +z): the car's side window close up, grainy, the
 *  driver inside: blond curls, a red hoodie; ENHANCED, the timestamp */
const zoomTex = () => stex("ojZoom", 540, 960, (g) => {
  g.fillStyle = "#1a201c"; g.fillRect(0, 0, 540, 960);
  g.fillStyle = "#2b3a52"; g.fillRect(0, 300, 540, 520); g.fillStyle = "#0c1014"; rr(g, 40, 330, 460, 330, 26); g.fill();       // the car door, the window
  g.strokeStyle = INK; g.lineWidth = 7;
  g.fillStyle = "#b8423a"; g.beginPath(); g.ellipse(270, 690, 190, 140, 0, Math.PI, 0); g.fill(); g.stroke();                  // red hoodie
  g.fillStyle = "#e9c6a6"; g.beginPath(); g.arc(270, 500, 96, 0, 7); g.fill(); g.stroke();
  g.fillStyle = "#c9a24a"; for (let i = -4; i <= 4; i++) { g.beginPath(); g.arc(270 + i * 23, 420 + Math.abs(i) * 8, 24, 0, 7); g.fill(); g.stroke(); }
  for (const s of [-1, 1]) { g.fillStyle = INK; g.beginPath(); g.arc(270 + s * 34, 505, 8, 0, 7); g.fill(); }
  g.fillStyle = "#c9c2b0"; g.fillRect(320, 600, 140, 22);                                                                    // his hands on the wheel
  const img = g.getImageData(0, 0, 540, 960); let s = 3; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < img.data.length; i += 4) { const n = (r() - 0.5) * 60, gray = (img.data[i] * 0.4 + img.data[i + 1] * 0.45 + img.data[i + 2] * 0.15); for (let c = 0; c < 3; c++) img.data[i + c] = Math.max(0, Math.min(255, gray * 0.55 + img.data[i + c] * 0.45 + n)); }
  g.putImageData(img, 0, 0);
  for (let y = 0; y < 960; y += 4) { g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(0, y, 540, 2); }
  g.fillStyle = "rgba(235,245,235,0.95)"; g.font = "bold 30px 'DejaVu Sans Mono', monospace"; g.textAlign = "left"; g.fillText("POLICE CCTV · ENHANCED", 40, 90); g.fillText("FRI  23:04:19", 40, 900);
  g.strokeStyle = "rgba(255,60,60,0.9)"; g.lineWidth = 5; g.strokeRect(150, 380, 240, 260);
});
/** a choice flying behind Sam at the end (0.9 x 0.55 m card, facing +z): variant A (BRING BACK THE REAL JAMIE, blue)
 *  or B (KEEP THE ONE WHO NEVER DID IT, red). It swoops in over its first ~6 steps, then drifts and turns slowly,
 *  bobbing (give it steady steps). `at` = where it settles. */
const floatTex = (v: string) => stex(`ojFloat${v}`, 720, 440, (g) => {
  const c = v === "A" ? "#1f4fb8" : "#b8423a", t1 = v === "A" ? "BRING BACK THE" : "KEEP THE ONE WHO", t2 = v === "A" ? "REAL JAMIE" : "NEVER DID IT";
  g.clearRect(0, 0, 720, 440); g.fillStyle = c; rr(g, 12, 12, 696, 416, 44); g.fill(); g.strokeStyle = "#ffffff"; g.lineWidth = 10; g.stroke();
  g.fillStyle = "#ffffff"; g.font = FONT(150); g.textAlign = "center"; g.fillText(v, 360, 175); g.font = FONT(52); g.fillText(t1, 360, 280); g.fillText(t2, 360, 345);
});
const floatRig = (a: At, v = "A"): PropRig => {
  const root = rigRoot(a), m = mesh(new THREE.PlaneGeometry(0.9, 0.55), card(floatTex(v), { toneMapped: false })); root.add(m);
  const side = v === "A" ? -1 : 1;
  return { root, update: ({ step = 0, camPos }) => {
    const k = Math.min(1, step / 6), e = 1 - (1 - k) * (1 - k);
    m.position.set(side * (1 - e) * 5 + Math.sin(step * 0.09 + side) * 0.12, (1 - e) * 2.5 + Math.sin(step * 0.14 + side * 2) * 0.1, -(1 - e) * 3);
    m.lookAt(camPos); m.rotation.z += Math.sin(step * 0.07 + side) * 0.12; m.scale.setScalar(0.5 + e * 0.8);
  } };
};

// ---------------------------------------------------------------- characters and items
// Sam: 16, short brown hair, a blue-grey hoodie; Jamie: 16, dirty-blond curls, his red hoodie (the copy and the real
// Jamie look the same); jamieMud: walking out of the woods, mud to his knees; his little brother; a kid at school.
const SAM: Look = { name: "Sam", build: "lanky", skin: "#f0c8a8", seed: 401, hair: { style: "short", color: "#4a3426" }, top: { style: "hoodie", color: "#3f5f7a" }, legs: "#2f3a52", shoes: "#e8e8e8" };
const JAMIE: Look = { name: "Jamie", build: "adult", skin: "#f0c8a8", seed: 402, hair: { style: "curly", color: "#c9a24a" }, top: { style: "hoodie", color: "#b8423a" }, legs: "#3a3d47", shoes: "#2a2a2e" };
const JAMIE_MUD: Look = { ...JAMIE, name: "Jamie (out of the woods)", legs: "#6a4a32", shoes: "#4a3424" };
const BROTHER: Look = { name: "Jamie's brother", build: "kid", skin: "#f0c8a8", seed: 403, hair: { style: "curly", color: "#d4b05a" }, top: { style: "tee", color: "#5d8a3a" }, legs: "#3a4a6a", shoes: "#c0353a" };
const ELLIE: Look = { name: "Ellie", build: "petite", skin: "#f1c9a8", seed: 405, hair: { style: "long", color: "#6a3a22" }, top: { style: "hoodie", color: "#3f5f9a" }, legs: "#3a3d47", shoes: "#e8e8e8" };
const SCHOOLKID: Look = { name: "A kid at school", build: "petite", skin: "#c99067", seed: 404, hair: { style: "side", color: "#2a201a" }, glasses: { style: "round", color: INK }, top: { style: "sweater", color: "#2f4a7a" }, legs: "#3a3d47", shoes: "#2a2a2e" };
const flashlightItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 4 * u * s, cy = y - 1 * u;
  p.poly([[cx - 3 * u, cy - 10 * u], [cx + 3 * u, cy - 10 * u], [cx + 3 * u, cy + 6 * u], [cx - 3 * u, cy + 6 * u]], "#2a2e36", 1.6 * u);
  p.poly([[cx - 5 * u, cy - 15 * u], [cx + 5 * u, cy - 15 * u], [cx + 3 * u, cy - 10 * u], [cx - 3 * u, cy - 10 * u]], "#3a3e46", 1.6 * u);
  p.poly([[cx - 4 * u, cy - 16 * u], [cx + 4 * u, cy - 16 * u], [cx + 4 * u, cy - 15 * u], [cx - 4 * u, cy - 15 * u]], "#fff3c8", 1 * u);
};
const chipsItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 4 * u * s, cy = y - 2 * u;
  p.poly([[cx - 9 * u, cy - 8 * u], [cx + 9 * u, cy - 8 * u], [cx + 4 * u, cy + 9 * u], [cx - 4 * u, cy + 9 * u]], "#f2ead8", 1.8 * u);
  for (let k = 0; k < 5; k++) p.poly([[cx - 7 * u + k * 3 * u, cy - 8 * u], [cx - 6 * u + k * 3 * u, cy - 8 * u], [cx - 5 * u + k * 3 * u, cy - 15 * u + (k % 2) * 2 * u], [cx - 6 * u + k * 3 * u, cy - 15 * u + (k % 2) * 2 * u]], "#e9c46a", 1 * u);
};

// ---------------------------------------------------------------- set: ashbyWoods
// The clearing at the origin, where the mirrors hang (branch height ~2.6 m); the path in from the treeline at z 16;
// beyond the treeline (z 17..60) an open field and a fence: the dusk shot looks out from the trees, or in at them.
const AW_SPOTS: Record<string, V3> = { clearing: [0, 0, 0], path: [0.4, 0, 7], treeline: [0.3, 0, 16.5], thing: [-1.2, 0, -3.2], field: [0, 0, 22] };
const AW_VIEWS: View[] = [
  { name: "clearing", pos: [1.2, 1.5, 6.5], look: [0, 1.6, -1], fov: 52, establishing: true },
  { name: "treeline", pos: [0.6, 1.5, 24], look: [0.3, 1.6, 15], fov: 50, establishing: true },
];
const ashbyWoods = (cams?: View[]) => {
  const root = new THREE.Group(), b = new Batch(); void cams;
  b.add(quadUp(-80, 80, -80, 17, 40, 24), tex("ojLeaves", () => dirtHD(), 1, 1));
  b.add(quadUp(-80, 80, 17, 120, 40, 26, -0.005), col("#5a6a3a"));                                                   // the field beyond
  b.add(quadUp(-0.7, 1.4, 2, 17, 1, 6, 0.01), col("#6a5a44"));                                                         // the path
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 230; i++) {                                                                                       // the woods, clear of the clearing and the path
    const x = (r() - 0.5) * 120, z = -70 + r() * 86; if (Math.hypot(x, z) < 6.5 || (Math.abs(x - 0.4) < 2.4 && z > 2)) continue;
    tree(b, r() < 0.6 ? "cone" : "round", x, 0, z, 7 + r() * 6, i * 13.7, 0);
  }
  for (let i = 0; i < 26; i++) { const ang = (i / 26) * Math.PI * 2, d = 6.8 + (i % 3) * 0.6, x = Math.cos(ang) * d, z = Math.sin(ang) * d; if (z > 2.5 && Math.abs(x) < 2.6) continue;
    cyl(b, col("#2a2420"), new THREE.Matrix4(), x, 0, z, 0.22, 0.16, 6.5, 8); }                                         // a ring of bare trunks round the clearing
  for (let k = 0; k < 14; k++) { const x = -12 + k * 2; cyl(b, col("#6a5a44"), new THREE.Matrix4(), x, 0, 30, 0.05, 0.05, 1.1, 6); }  // the fence across the field
  b.build(root, true);
  return { root, env: {}, spots: AW_SPOTS, views: AW_VIEWS };
};

export const OTHERJAMIE_THEME: Theme = {
  id: "otherjamie", name: "The Other Jamie (a horror thriller: the copy who came back from Ashby Woods)",
  desc: "Sam and his best friend Jamie, who came back from Ashby Woods as a copy who never did anything wrong; the woods at night with mirrors hanging from the branches, faces behind the glass, and the tall thing with a mirror for a face; Jamie's texts on Sam's phone, the hit-and-run appeal poster for Ellie Marsh, the copy's FOR ELLIE sign and jar, the A/B ending cards",
  tags: ["horror", "thriller", "supernatural", "mirror", "doppelganger", "woods"],
  mood: "tense",
  ambience: { ashbyWoods: "amb_nature_night" },
  steps: { ashbyWoods: "step_grass" },
  characters: { samOJ: SAM, jamie: JAMIE, jamieMud: JAMIE_MUD, brother: BROTHER, schoolKid: SCHOOLKID, ellie: ELLIE },
  characterMeta: {
    samOJ: { name: "Sam", desc: "16, lanky; short brown hair, a blue-grey hoodie, jeans, white trainers", personality: "Jamie's best friend since they were five; quiet, watchful (The Other Jamie)", themes: ["horror", "teen"], tags: ["teen", "boy", "protagonist", "narrator"] },
    jamie: { name: "Jamie", desc: "16; dirty-blond curls, a red hoodie, dark jeans", personality: "Sam's best friend; the copy who came back from the woods (kind, sorry, left-handed), and the real one behind the glass (The Other Jamie)", themes: ["horror", "teen"], tags: ["teen", "boy", "friend", "doppelganger"] },
    jamieMud: { name: "Jamie (out of the woods)", desc: "Jamie walking out of Ashby Woods, mud to his knees", personality: "as Jamie", themes: ["horror"], tags: ["teen", "boy"], outfitOf: "jamie" },
    brother: { name: "Jamie's little brother", desc: "about 8; blond curls, a green T-shirt", personality: "Jamie's little brother (The Other Jamie)", themes: ["family"], tags: ["child", "boy", "brother"] },
    ellie: { name: "Ellie Marsh", desc: "14; long brown hair, a blue hoodie, white trainers", personality: "the girl hit by a car on Mill Lane (The Other Jamie)", themes: ["crime"], tags: ["teen", "girl", "victim"] },
    schoolKid: { name: "A kid at school", desc: "small; side-parted dark hair, round glasses, a navy school jumper", personality: "a kid Jamie used to pick on (The Other Jamie)", themes: ["school"], tags: ["teen", "boy", "background"] },
  },
  items: {
    flashlight: { name: "Torch (flashlight)", desc: "an electric torch, its lens lit", themes: ["any", "horror", "night"], tags: ["torch", "flashlight", "light", "search"], draw: flashlightItem },
    chips: { name: "Chips", desc: "a paper cone of chips", themes: ["food", "street"], tags: ["chips", "food", "fries", "takeaway"], draw: chipsItem },
  },
  props: {
    mirrorThing: { name: "The thing in the woods", desc: "very tall (2.7 m), thin, a long dark coat, long thin arms with long fingers, and an oval mirror where its face should be; `at` = its feet, facing +z. Variant sam: the mirror shows Sam's own face lit by his torch; jamie: the real Jamie behind the glass, pounding. Steps: 1 tilts its head, 2 tilts it back, 3 lifts one long hand toward the lens, 4 lowers it", category: "theme", themes: ["horror", "supernatural"], tags: ["creature", "monster", "mirror", "tall"], radius: 0.4, height: 2.75,
      build: () => undefined, rig: (a, v) => thingRig(a, v ?? "sam"), steps: ["it moves"], stepCount: () => 400, variants: { sam: () => undefined, jamie: () => undefined } },
    hangingMirror: { name: "Hanging mirror", desc: "an oval mirror (0.5 x 0.68 m) hanging on a string from a branch, turning slowly over its steps, a face behind the glass; `at` = the mirror's centre. Variant jamie (the real Jamie pounding on the glass), jamieFade (the same, fogging over across ~12 steps), teacher (Mrs Hale, grey bob, glasses), man, woman, old, empty", category: "theme", themes: ["horror", "supernatural"], tags: ["mirror", "glass", "trapped", "woods"], radius: 0.3, height: 0.7,
      build: () => undefined, rig: (a, v) => mirrorRig(a, v ?? "empty"), steps: ["it turns"], stepCount: () => 400,
      variants: { jamie: () => undefined, jamieFade: () => undefined, teacher: () => undefined, man: () => undefined, woman: () => undefined, old: () => undefined, empty: () => undefined } },
    jamiePhone: { name: "Sam's phone (Jamie's texts)", desc: "Sam's hand holding his phone to the lens: the chat with Jamie. An ink card 0.25 x 0.4 m facing +z: ~0.45 m from an `at` camera. Variant hook (\"Sam. That's not me next to you.\"), summons (then \"I'm behind the glass.\" \"Ashby Woods.\" \"Come alone.\", one per step), real (\"Get me out. And don't tell anyone about Mill Lane. We'll forget it ever happened.\" lands on its second step)", category: "theme", themes: ["horror", "phone"], tags: ["phone", "text", "message", "insert"], radius: 0.05, height: 0.4,
      build: () => undefined, rig: (a, v) => phoneRig(a, v ?? "hook"), steps: ["a text lands"], stepCount: () => 400, variants: { hook: () => undefined, summons: () => undefined, real: () => undefined } },
    appealPoster: { name: "Police appeal poster (Mill Lane)", desc: "a police appeal on a lamppost (0.42 x 0.6 m, facing +z): POLICE APPEAL · HIT AND RUN · MILL LANE · FRIDAY 11PM, Ellie's school photo, ELLIE MARSH, 14 · CRITICAL · THE DRIVER DID NOT STOP; `at` = its centre (~1.6 m up)", category: "theme", themes: ["crime", "street"], tags: ["poster", "police", "appeal", "missing", "lamppost"], radius: 0.05, height: 0.6,
      build: () => undefined, rig: still(() => mesh(new THREE.PlaneGeometry(0.42, 0.59), card(posterTex()))), steps: ["it shows"] },
    ellieSign: { name: "FOR ELLIE sign", desc: "the copy's hand-made cardboard sign, FOR ELLIE and a red heart (0.6 x 0.42 m, facing +z): hold it at chest height in front of him; `at` = its centre", category: "theme", themes: ["charity"], tags: ["sign", "cardboard", "fundraiser"], radius: 0.05, height: 0.42,
      build: () => undefined, rig: still(() => mesh(new THREE.PlaneGeometry(0.6, 0.42), card(signTex()))), steps: ["it shows"] },
    ellieJar: { name: "Collection jar", desc: "a glass jar half full of coins, a paper label ELLIE (0.22 m tall); `at` = its base", category: "theme", themes: ["charity"], tags: ["jar", "coins", "money", "fundraiser"], radius: 0.1, height: 0.22,
      build: () => undefined, rig: still(() => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 20, 1, true), new THREE.MeshBasicMaterial({ color: "#cfe2ea", transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }), 0, 0.11, 0));
        g.add(mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.1, 20), new THREE.MeshLambertMaterial({ color: "#c9a24a" }), 0, 0.05, 0)); g.add(mesh(new THREE.CylinderGeometry(0.083, 0.083, 0.05, 20, 1, true), new THREE.MeshBasicMaterial({ color: "#f4f1ea", side: THREE.DoubleSide }), 0, 0.14, 0)); return g; }), steps: ["it shows"] },
    leftHandCard: { name: "Left hand writing (insert)", desc: "the copy's LEFT hand, red hoodie cuff, writing 'Happy birthday Mum' on a card; an ink card 0.4 x 0.4 m facing +z: ~0.5 m from an `at` camera", category: "theme", themes: ["horror"], tags: ["insert", "hand", "writing", "left-handed"], radius: 0.05, height: 0.4,
      build: () => undefined, rig: still(() => mesh(new THREE.PlaneGeometry(0.4, 0.4), card(leftHandTex()))), steps: ["it shows"] },
    choiceCards: { name: "A / B choice cards", desc: "the ending: A BRING BACK THE REAL JAMIE (blue) over B KEEP THE ONE WHO NEVER DID IT (red), on black; an ink card 0.5 x 0.89 m facing +z: fill the frame from ~1 m with an `at` camera", category: "theme", themes: ["interactive"], tags: ["choice", "vote", "ending", "card"], radius: 0.05, height: 0.89,
      build: () => undefined, rig: still(() => mesh(new THREE.PlaneGeometry(0.5, 0.889), card(choiceTex(), { toneMapped: false }))), steps: ["it shows"] },
    carDrive: { name: "Car (driving, headlights on)", desc: "a small dark-blue hatchback (3.9 m) driving along local +x, headlights on; `at` = the point of impact on the road. Variant approach (from 14 m back, reaching `at` on its 15th step: give it steady steps every 0.15 s) or stop (stopped 1.5 m past `at`, brake lights on, pulling away fast after its 10th step)", category: "theme", themes: ["street", "crime"], tags: ["car", "vehicle", "drive", "hit and run"], radius: 0.05, height: 1.5,
      build: () => undefined, rig: (a, v) => carRig(a, v ?? "approach"), steps: ["it drives"], stepCount: () => 400, variants: { approach: () => undefined, stop: () => undefined } },
    cctvOverlay: { name: "Police CCTV overlay", desc: "the police-camera look over a shot: an overlay card 0.27 x 0.48 m facing +z, ~0.5 m in front of an `at` camera (fov 50): scanlines, tint, vignette, POLICE CCTV · MILL LANE · CAM 03, REC, a timestamp ticking each ~7 steps (give it steady steps)", category: "theme", themes: ["crime"], tags: ["cctv", "camera", "overlay", "security"], radius: 0.05, height: 0.48,
      build: () => undefined, rig: (a) => cctvRig(a), steps: ["it ticks"], stepCount: () => 400 },
    cctvZoom: { name: "CCTV still, enhanced (insert)", desc: "the police camera's enhanced still: the car's side window close up, grainy, the driver in a red hoodie with blond curls, ENHANCED and the timestamp; an ink card 0.27 x 0.48 m facing +z, ~0.5 m from an `at` camera (fov 50)", category: "theme", themes: ["crime"], tags: ["cctv", "insert", "evidence", "driver"], radius: 0.05, height: 0.48,
      build: () => undefined, rig: still(() => mesh(new THREE.PlaneGeometry(0.27, 0.48), card(zoomTex()))), steps: ["it shows"] },
    choiceFloat: { name: "Flying choice card", desc: "one of the two endings flying in the air (0.9 x 0.55 m card, always turned to the camera): variant A (BRING BACK THE REAL JAMIE, blue) or B (KEEP THE ONE WHO NEVER DID IT, red); it swoops in from the side over its first ~6 steps, then drifts, bobs and tilts (give it steady steps); `at` = where it settles", category: "theme", themes: ["interactive"], tags: ["choice", "vote", "ending", "card", "floating"], radius: 0.05, height: 0.55,
      build: () => undefined, rig: (a, v) => floatRig(a, v ?? "A"), steps: ["it flies"], stepCount: () => 400, variants: { A: () => undefined, B: () => undefined } },
    torchBeam: { name: "Torch beam", desc: "a soft cone of torchlight 5 m long from a torch, `at` = the torch lens, pointing along local +z (yaw to aim it)", category: "theme", themes: ["night", "horror"], tags: ["light", "beam", "torch", "flashlight"], radius: 0.05, height: 0.2,
      build: () => undefined, rig: (a) => beamRig(a), steps: ["it shows"] },
  },
  sets: { ashbyWoods: { id: "ashbyWoods", title: "Ashby Woods: a clearing among the trees where mirrors hang, the path in from the treeline, the field beyond", lights: ["night", "golden", "day"], build: ashbyWoods } },
  layouts: { ashbyWoods: { spots: AW_SPOTS, views: AW_VIEWS } },
  setMeta: { ashbyWoods: { name: "Ashby Woods", desc: "dense woods: the clearing at the origin (radius ~6, a ring of bare trunks; hang hangingMirror props at ~2.0-2.6 m), the path in from the treeline (x 0.4, z 2..17), the open field and a fence beyond the treeline (z 17..60) (marks: clearing, path, treeline, thing, field / views: clearing, treeline / lights: night, golden, day)", themes: ["horror", "outdoor", "woods"], tags: ["woods", "forest", "night", "trees", "clearing"] } },
};
