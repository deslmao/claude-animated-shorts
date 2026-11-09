// Float Away theme (Video 08, "In This World, If Nobody Thinks About You, You Float Away"): production props only,
// for the library's existing sets (city, old town, home, apartment) and cast. Attention makes you heavy: chairs snap,
// benches bend, roads crack. Plus the props of Gus's story: pancakes, stones in his pockets, a washing line, a
// checker, balloons, bikes, a podium and Milo's livestream phone.
import * as THREE from "three";
import type { Theme } from "..";
import { Batch } from "../../materials/geo";
import { At, frame, col, box, cyl, sph } from "../../props/kit";
import { NOINK } from "../../look/ink";
import type { PropRig } from "../../props/registry";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); return o; };
const B = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };

// ---------------- snapChair: a cafe chair or a steel bench that gives way under attention (step 1)
const SEAT = 0.46; // a snapChair's `at` is its seat top (so a seated actor's floor mark is clear of it)
const snapChairRig = (a: At, v = "chair"): PropRig => {
  const root = rigRoot(a); root.position.y -= SEAT;
  if (v === "bench") {
    const steel = col("#7d8790"), dark = col("#4b535b");
    const mid = new THREE.Group(), left = new THREE.Group(), right = new THREE.Group();
    mid.add(mesh(B(0.5, 0.05, 0.42), steel)); mid.position.y = 0.46;
    left.add(mesh(B(0.42, 0.05, 0.42), steel, -0.21)); left.position.set(-0.25, 0.46, 0);
    right.add(mesh(B(0.42, 0.05, 0.42), steel, 0.21)); right.position.set(0.25, 0.46, 0);
    const legs = [-0.6, 0.6].map((x) => { const l = new THREE.Group(); l.add(mesh(B(0.05, 0.46, 0.36), dark, 0, -0.23)); l.position.set(x, 0.46, 0); return l; });
    root.add(mid, left, right, ...legs);
    return { root, update: ({ step = 0 }) => {
      const f = ease(step * 2.5);
      mid.position.y = 0.46 - 0.3 * f; left.rotation.z = -0.55 * f; right.rotation.z = 0.55 * f;
      left.position.y = right.position.y = 0.46 - 0.3 * f;
      left.position.x = -0.25 + 0.0 * f; right.position.x = 0.25;
      legs[0].position.set(-0.6 + 0.12 * f, 0.46 - 0.05 * f, 0); legs[1].position.set(0.6 - 0.12 * f, 0.46 - 0.05 * f, 0);
      legs[0].rotation.z = -0.35 * f; legs[1].rotation.z = 0.35 * f;
    } };
  }
  const wood = col("#b5763f"), dark = col("#8a5a2e");
  const seat = mesh(B(0.44, 0.05, 0.42), wood, 0, 0.46, 0), back = new THREE.Group();
  back.add(mesh(B(0.44, 0.42, 0.04), wood, 0, 0.21, 0)); back.position.set(0, 0.48, -0.2);
  const legs = [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].map(([x, z]) => { const l = new THREE.Group(); l.add(mesh(B(0.045, 0.45, 0.045), dark, 0, -0.225)); l.position.set(x, 0.45, z); return l; });
  root.add(seat, back, ...legs);
  return { root, update: ({ step = 0 }) => {
    const f = ease(step * 3.5);
    seat.position.y = 0.46 - 0.4 * f; seat.rotation.x = 0.12 * f; back.position.y = 0.48 - 0.4 * f; back.rotation.x = -1.3 * f;
    legs.forEach((l, i) => { l.position.y = 0.45 - 0.42 * f; l.rotation.z = (i % 2 ? 1 : -1) * 1.4 * f; l.rotation.x = (i < 2 ? -1 : 1) * 0.3 * f; });
  } };
};
const snapChairStatic = (b: Batch, a: At, v = "chair") => {
  const m = frame({ ...a, y: (a.y ?? 0) - SEAT });
  if (v === "bench") { box(b, col("#7d8790"), m, -0.67, 0.67, 0.435, 0.485, -0.21, 0.21); for (const x of [-0.6, 0.6]) box(b, col("#4b535b"), m, x - 0.025, x + 0.025, 0, 0.46, -0.18, 0.18); return; }
  box(b, col("#b5763f"), m, -0.22, 0.22, 0.435, 0.485, -0.21, 0.21); box(b, col("#b5763f"), m, -0.22, 0.22, 0.48, 0.9, -0.22, -0.18);
  for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) box(b, col("#8a5a2e"), m, x - 0.022, x + 0.022, 0, 0.45, z - 0.022, z + 0.022);
};

// ---------------- small story props (static)
const pancake = (b: Batch, a: At) => { const m = frame(a); cyl(b, col("#e3a64a"), m, 0, 0, 0, 0.1, 0.1, 0.018, 22); sph(b, col("#c47f2c"), m, 0.02, 0.012, -0.01, 0.05, 0.008, 0.04); };
const stonesOf = (n: number, spread: number, seed: number) => Array.from({ length: n }, (_, k) => {
  const a = (k * 2.399 + seed) % (2 * Math.PI), d = spread * Math.sqrt((k + 0.5) / n);
  return [Math.cos(a) * d, Math.sin(a) * d, 0.022 + ((k * 37 + seed * 11) % 7) * 0.003] as const;
});
const STONE = ["#8d8f93", "#a3a09a", "#76787c", "#9a9488"];
const pocketStones = (b: Batch, a: At, v = "heap") => {
  const m = frame(a), heap = v !== "pile";
  stonesOf(heap ? 7 : 9, heap ? 0.06 : 0.45, 3).forEach(([x, z, r], k) => sph(b, col(STONE[k % 4]), m, x, heap ? r + (k > 4 ? 0.03 : 0) : r * 0.7, z, r * 1.2, r * 0.8, r));
};
const checker = (b: Batch, a: At) => { const m = frame(a); cyl(b, col("#c8323c"), m, 0, 0, 0, 0.03, 0.03, 0.012, 18); cyl(b, col("#e25560"), m, 0, 0.012, 0, 0.02, 0.02, 0.002, 18); };
const balloons = (b: Batch, a: At) => {
  const m = frame(a), C = ["#ff5a5f", "#ffd23f", "#4fb0ff", "#7ed957", "#c77dff"];
  C.forEach((c, k) => { const x = (k - 2) * 0.13, y = 1.55 + (k % 2) * 0.16, z = (k % 3 - 1) * 0.06; sph(b, col(c), m, x, y, z, 0.12, 0.15, 0.12); cyl(b, col("#eeeeee"), m, x * 0.5, 0.95, z * 0.5, 0.003, 0.003, y - 1.08, 4); });
};
const bike = (b: Batch, a: At, v = "") => {
  const m = frame(a), frameCol = col(v === "pink" ? "#ff7eb6" : v === "blue" ? "#4f8cff" : "#3fbf7f"), tyre = col("#2a2a2e");
  for (const x of [-0.42, 0.42]) { const w = new THREE.TorusGeometry(0.3, 0.025, 8, 28).applyMatrix4(new THREE.Matrix4().makeTranslation(x, 0.32, 0)); b.add(w, tyre, m); }
  box(b, frameCol, m, -0.42, 0.42, 0.5, 0.54, -0.02, 0.02); box(b, frameCol, m, -0.06, -0.02, 0.32, 0.8, -0.02, 0.02); box(b, frameCol, m, 0.36, 0.4, 0.32, 0.95, -0.02, 0.02);
  box(b, col("#222"), m, -0.16, 0.06, 0.8, 0.84, -0.06, 0.06); box(b, col("#555"), m, 0.3, 0.46, 0.95, 0.98, -0.22, 0.22);
};
const podium = (b: Batch, a: At) => {
  const m = frame(a);
  box(b, col("#2f4a8a"), m, -0.32, 0.32, 0, 1.05, -0.22, 0.22); box(b, col("#24396b"), m, -0.36, 0.36, 1.05, 1.12, -0.28, 0.26);
  cyl(b, col("#ffd23f"), m, 0, 0.62, 0.225, 0.13, 0.13, 0.01, 5, Math.PI / 2, 0); cyl(b, col("#c9c9c9"), m, 0, 1.12, 0.1, 0.012, 0.012, 0.28, 6, 0.5, 0);
};

// ---------------- pocketStones "roll": stones tumble out one by one and roll along +x (step 1)
const stonesRollRig = (a: At): PropRig => {
  const root = rigRoot(a); root.position.y -= 0.75; // `at` is the pocket
  const st = stonesOf(7, 0.05, 5).map(([x, z, r], k) => { const o = mesh(new THREE.SphereGeometry(r * 1.15, 10, 8), col(STONE[k % 4]), x, 0.75, z); root.add(o); return o; });
  return { root, update: ({ step = 0 }) => {
    st.forEach((o, k) => {
      const u = clamp01(step * 1.6 - k * 0.11), fall = Math.min(1, u * 2.2);
      o.visible = u > 0; o.position.y = 0.75 * (1 - fall * fall) + 0.03; o.position.x = 0.9 * Math.max(0, u - 0.45) * (1 + k * 0.15);
    });
  } };
};

// ---------------- roadCrack: a star-shaped crack in the asphalt, bursting out from the impact (step 1)
const crackMat = new THREE.MeshBasicMaterial({ color: 0x1b1a1e, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4 });
const roadCrackRig = (a: At): PropRig => {
  const root = rigRoot(a), arms: THREE.Mesh[] = [];
  for (let k = 0; k < 9; k++) {
    const ang = k * 0.7 + 0.2 * Math.sin(k * 3.1), len = 0.7 + 0.5 * ((k * 53) % 10) / 10;
    const g = new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.06, 0, 0, 0.06, len, 0, 0], 3));
    g.computeVertexNormals();
    const o = new THREE.Mesh(g, crackMat); o.rotation.y = ang; o.position.y = 0.004; o.scale.setScalar(0.001); root.add(o); arms.push(o);
  }
  const dent = mesh(new THREE.CircleGeometry(0.42, 20).rotateX(-Math.PI / 2), crackMat, 0, 0.003, 0); dent.scale.setScalar(0.001); root.add(dent);
  return { root, update: ({ step = 0 }) => {
    const f = ease(step * 5);
    arms.forEach((o, k) => o.scale.setScalar(Math.max(0.001, f * (0.85 + 0.15 * Math.sin(k)))));
    dent.scale.setScalar(Math.max(0.001, f)); (dent.material as THREE.Material).opacity = 1;
  } };
};

// ---------------- washingLine: a rope along +x (2.2 m) that snaps in the middle (step 1); "scarf": a short red tether
const washingLineRig = (a: At, v = "line"): PropRig => {
  const root = rigRoot(a), scarf = v === "scarf", L = scarf ? 0.55 : 2.2, m = col(scarf ? "#c8323c" : "#e8e0cc");
  const half = (s: 1 | -1) => { const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(scarf ? 0.025 : 0.008, scarf ? 0.025 : 0.008, L / 2, 6).rotateZ(Math.PI / 2), m, s * L / 4)); return g; };
  const l = half(1), r = half(-1); l.position.x = 0; r.position.x = L; root.add(l, r);
  return { root, update: ({ step = 0 }) => {
    const f = ease(step * 3); l.rotation.z = -1.35 * f; r.rotation.z = 1.35 * f;
  } };
};
const washingLineStatic = (b: Batch, a: At, v = "line") => {
  const m = frame(a), scarf = v === "scarf", L = scarf ? 0.55 : 2.2;
  box(b, col(scarf ? "#c8323c" : "#e8e0cc"), m, 0, L, -(scarf ? 0.025 : 0.008), scarf ? 0.025 : 0.008, -(scarf ? 0.03 : 0.008), scarf ? 0.03 : 0.008);
};

// ---------------- livePhone: a phone held upright, screen to +z (15 cm), for inserts. Variants and their steps:
//   "live"  Milo's livestream of Gus in the night sky: 3 watching -> "fake" -> "nice balloon" -> 10,000 -> 80,000 + hearts
//   "share" Juno's screen: the stream + her caption, then SHARED
//   "call"  an incoming video call from Grandpa, then the call ended
const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, draw: (g: CanvasRenderingContext2D) => void) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; stable.set(key, t); return t;
};
const FONT = (px: number) => `bold ${px}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`;
const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};
const sky = (g: CanvasRenderingContext2D, gusY: number) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#0b1440"); gr.addColorStop(1, "#2b3f7a"); g.fillStyle = gr; g.fillRect(0, 0, 512, 1024);
  g.fillStyle = "#fff7c0"; for (let k = 0; k < 40; k++) { const x = (k * 137) % 512, y = (k * 251) % 620; g.globalAlpha = 0.35 + (k % 3) * 0.2; g.fillRect(x, y, 3, 3); } g.globalAlpha = 1;
  g.fillStyle = "#1a2242"; g.fillRect(0, 860, 512, 164); for (let k = 0; k < 6; k++) g.fillRect(k * 90, 800 - (k % 3) * 40, 70, 80 + (k % 3) * 40);
  // a tiny Gus in his cardigan, floating
  g.fillStyle = "#f2c9a0"; g.beginPath(); g.arc(256, gusY, 22, 0, 7); g.fill(); g.fillStyle = "#8b5a3c"; rr(g, 232, gusY + 20, 48, 58, 14); g.fill();
};
const badge = (g: CanvasRenderingContext2D, n: string) => {
  g.fillStyle = "#ff2b45"; rr(g, 24, 70, 120, 50, 12); g.fill(); g.fillStyle = "#fff"; g.font = FONT(30); g.textBaseline = "middle"; g.fillText("LIVE", 42, 96);
  g.fillStyle = "rgba(0,0,0,0.55)"; rr(g, 156, 70, 330, 50, 12); g.fill(); g.fillStyle = "#fff"; g.font = FONT(28); g.fillText(`${n} watching`, 172, 96);
};
const comment = (g: CanvasRenderingContext2D, y: number, who: string, text: string) => {
  g.fillStyle = "rgba(0,0,0,0.5)"; rr(g, 24, y, 380, 66, 18); g.fill(); g.font = FONT(22); g.fillStyle = "#9ad0ff"; g.textBaseline = "middle"; g.fillText(who, 42, y + 20); g.fillStyle = "#fff"; g.font = FONT(28); g.fillText(text, 42, y + 47);
};
const hearts = (g: CanvasRenderingContext2D, n: number) => {
  for (let k = 0; k < n; k++) { const x = 380 + ((k * 47) % 110), y = 900 - ((k * 89) % 560); g.fillStyle = ["#ff4d6d", "#ff8fab", "#ffd23f"][k % 3]; g.font = FONT(40 + (k % 3) * 8); g.fillText("♥", x, y); }
};
const screenTex = (v: string, s: number) => stex(`livePhone${v}${s}`, (g) => {
  if (v === "call") {
    g.fillStyle = "#1d2b3a"; g.fillRect(0, 0, 512, 1024);
    g.fillStyle = "#f2c9a0"; g.beginPath(); g.arc(256, 330, 110, 0, 7); g.fill(); g.fillStyle = "#e6e6e6"; g.fillRect(170, 250, 172, 30);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.font = FONT(56); g.fillText("Grandpa", 256, 530);
    g.font = FONT(30); g.fillStyle = "#b8c7d6"; g.fillText(s ? "call ended" : "video call...", 256, 590);
    if (!s) { g.fillStyle = "#e5484d"; g.beginPath(); g.arc(150, 860, 56, 0, 7); g.fill(); g.fillStyle = "#30a46c"; g.beginPath(); g.arc(362, 860, 56, 0, 7); g.fill(); }
    return;
  }
  if (v === "share") {
    g.fillStyle = "#121216"; g.fillRect(0, 0, 512, 1024);
    g.save(); g.beginPath(); rr(g, 24, 40, 464, 600, 24); g.clip(); g.translate(24, 40); g.scale(464 / 512, 600 / 1024); sky(g, 420); g.restore();
    g.fillStyle = "#fff"; g.font = FONT(30); g.textAlign = "left"; g.textBaseline = "top";
    const lines = ["this man fixed my bike", "when I was 7.", "milo is still annoying"];
    lines.forEach((l, k) => g.fillText(l, 36, 668 + k * 42));
    g.fillStyle = s ? "#30a46c" : "#ff2b6e"; rr(g, 96, 840, 320, 92, 46); g.fill(); g.fillStyle = "#fff"; g.textAlign = "center"; g.textBaseline = "middle"; g.font = FONT(44); g.fillText(s ? "SHARED" : "SHARE", 256, 886);
    return;
  }
  sky(g, [430, 430, 430, 560, 700][Math.min(4, s)]);
  badge(g, ["3", "3", "3", "10,000", "80,000"][Math.min(4, s)]);
  if (s >= 1 && s < 3) comment(g, 760, "@grumpy_kev", "fake");
  if (s >= 2 && s < 3) comment(g, 840, "@lol_jen", "nice balloon");
  if (s >= 3) { comment(g, 760, "@juno.vibes", "everyone look up!!"); hearts(g, s >= 4 ? 18 : 8); }
});
const PW = 0.075, PH = 0.15;
const livePhoneRig = (a: At, v = "live"): PropRig => {
  const root = rigRoot(a);
  root.add(mesh(B(PW + 0.008, PH + 0.01, 0.009), col("#1a1a1e"), 0, PH / 2, -0.005));
  const mat = new THREE.MeshBasicMaterial({ map: screenTex(v, 0), toneMapped: false });
  const scr = mesh(new THREE.PlaneGeometry(PW, PH), mat, 0, PH / 2, 0.0002); scr.layers.set(NOINK); root.add(scr);
  const n = v === "live" ? 4 : 1;
  return { root, update: ({ step = 0 }) => { const s = Math.min(n, Math.floor(step + 0.001)); const t = screenTex(v, s); if (mat.map !== t) { mat.map = t; mat.needsUpdate = true; } } };
};
const phoneOk = (v: string) => ["live", "share", "call"].includes(v);
const livePhoneStatic = (b: Batch, a: At, v = "live") => {
  const m = frame(a);
  box(b, col("#1a1a1e"), m, -(PW + 0.008) / 2, (PW + 0.008) / 2, -0.005, PH + 0.005, -0.0095, -0.0005);
  b.add(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: screenTex(v, 0), toneMapped: false }), m.clone().multiply(new THREE.Matrix4().makeTranslation(0, PH / 2, 0.0002)));
};

export const FLOATAWAY_THEME: Theme = {
  id: "floataway", name: "Float Away (story)", desc: "attention makes you heavy: a chair and a steel bench that give way, a crack bursting across the road; and Gus's story: pancakes, stones in his pockets (a heap, a pile, stones rolling out), a washing line or scarf that snaps, a checker, balloons, bikes, a podium, and Milo's phone (a livestream with viewers and comments, Juno's share screen, a video call)",
  tags: ["story", "comedy", "heart", "family", "grandpa", "city", "home"],
  mood: "quirky",
  props: {
    snapChair: { name: "Snapping chair / bench", desc: "a wooden cafe chair (variant chair) or a steel bench (variant bench, 1.3 m) that gives way when someone too heavy sits: step 1 collapses the chair flat / bends the bench into a U. Its `at` is the SEAT TOP (0.46 m above the floor): put a seated actor on the floor mark below it", category: "theme", themes: ["comedy", "city", "cafe"], tags: ["chair", "bench", "seat", "break", "snap", "gag"], radius: 0.3, height: 0.9,
      build: (b, a, v) => snapChairStatic(b, a, v), rig: snapChairRig, steps: ["it gives way"], variants: { chair: (b, a) => snapChairStatic(b, a, "chair"), bench: (b, a) => snapChairStatic(b, a, "bench") } },
    pancake: { name: "Pancake", desc: "a golden pancake (20 cm), flat: on a ceiling, on a head, in a pan", category: "theme", themes: ["home", "food", "comedy"], tags: ["pancake", "food", "breakfast"], radius: 0.1, height: 0.02, build: pancake },
    pocketStones: { name: "Stones from his pockets", desc: "grey pebbles: variant heap (a handful, about 15 cm) or pile (scattered on a floor, about 1 m)", category: "theme", themes: ["story", "home"], tags: ["stones", "pebbles", "rocks", "pocket", "weight"], radius: 0.2, height: 0.1,
      build: (b, a, v) => pocketStones(b, a, v), variants: { heap: (b, a) => pocketStones(b, a, "heap"), pile: (b, a) => pocketStones(b, a, "pile") } },
    stonesRoll: { name: "Stones rolling out", desc: "seven pebbles that tumble from a pocket (`at` = the pocket, about 0.75 m up) to the floor and roll away along +x on step 1 (hidden before)", category: "theme", themes: ["story", "home"], tags: ["stones", "pebbles", "fall", "roll", "pocket"], radius: 0.5, height: 0.8,
      build: () => undefined, rig: stonesRollRig, steps: ["they tumble out"] },
    roadCrack: { name: "Road crack", desc: "a star-shaped crack bursting across the asphalt (about 2.4 m across) from an impact: step 1 makes it burst out (hidden before)", category: "theme", themes: ["comedy", "city"], tags: ["crack", "road", "impact", "crash", "landing"], radius: 0.05, height: 0.01,
      build: () => undefined, rig: roadCrackRig, steps: ["it bursts out"] },
    washingLine: { name: "Washing line / scarf", desc: "a pale rope 2.2 m long along +x (variant line) or a short red scarf tether, 0.55 m (variant scarf): step 1 snaps it in the middle (both halves drop)", category: "theme", themes: ["home", "story"], tags: ["rope", "line", "scarf", "tether", "snap"], radius: 0.05, height: 0.05,
      build: (b, a, v) => washingLineStatic(b, a, v), rig: washingLineRig, steps: ["it snaps"], variants: { line: (b, a) => washingLineStatic(b, a, "line"), scarf: (b, a) => washingLineStatic(b, a, "scarf") } },
    checker: { name: "Checker piece", desc: "a red draughts piece (6 cm): the one Gus hides under his moustache", category: "theme", themes: ["home", "game"], tags: ["checker", "draughts", "game", "cheat"], radius: 0.03, height: 0.012, build: checker },
    balloons: { name: "Balloon bunch", desc: "a balloon seller's bunch of five balloons on strings (top about 1.75 m; hold point about 0.95 m)", category: "theme", themes: ["city", "park", "party"], tags: ["balloons", "seller", "party"], radius: 0.05, height: 1.8, build: balloons },
    bike: { name: "Bicycle", desc: "a kid's bicycle (1.1 m long, side-on along x); variant pink, blue or green frame", category: "theme", themes: ["street", "kids", "modern"], tags: ["bike", "bicycle", "repair", "kids"], radius: 0.6, height: 1.0, box: [0.75, 0.05], build: (b, a, v) => bike(b, a, v), variants: { green: (b, a) => bike(b, a, "green"), pink: (b, a) => bike(b, a, "pink"), blue: (b, a) => bike(b, a, "blue") } },
    podium: { name: "Podium", desc: "a blue speaker's podium with a star emblem and a microphone (1.1 m)", category: "theme", themes: ["politics", "town", "speech"], tags: ["podium", "lectern", "speech", "election"], radius: 0.35, height: 1.2, box: [0.33, 0.24], build: podium },
    livePhone: { name: "Phone (livestream / share / call)", desc: "a phone held upright, screen to +z (15 cm), for inserts. Variant live: Milo's livestream of Gus in the night sky; steps: 1 comment 'fake', 2 'nice balloon', 3 10,000 watching + hearts, 4 80,000 watching. Variant share: Juno's share screen with her caption; step 1 SHARED. Variant call: Grandpa's video call; step 1 call ended", category: "theme", themes: ["modern", "social media"], tags: ["phone", "livestream", "live", "viewers", "share", "call", "screen"], radius: 0.05, height: 0.16,
      build: (b, a, v) => livePhoneStatic(b, a, v), rig: livePhoneRig, steps: ["the next screen"], stepCount: (v) => (v === "live" ? 4 : 1), param: { desc: "live, share or call", ok: phoneOk } },
  },
};
