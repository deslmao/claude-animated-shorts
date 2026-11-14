// The Whale City theme (productions/whale-city): a quiet old harbour city built on the back of a sleeping whale.
// Reused from the base library: the old-town houses, market stalls, lantern posts, barrels, crates and cart, the
// cobble / stone / roof paints, the flat painted sea of the pirate sets, the medieval crowd era, day / golden / night.
// New here:
//   sets whaleCity (the city on the whale, the sea all round) and whaleRise (the same city without its sea: for the
//     shots where the sea moves, the whaleSea prop draws it)
//   props blowhole (the Fountain: the whale's blowhole inside stacked marble rings), spout (its breath), breathPole
//     (the breath-keeper's painted measuring pole), poleCard and tapestryCard (inserts), foundersBell (the founders'
//     ship bell, its clapper tied), whaleEye, whaleTail, whaleSea (a moving sea), floodWater (the harbour flooding)
//   items knife, baby; characters wren, gran, mayor, mother, fisher
// World: the sea is at y 0; the plaza (the square at the top of the city) at y 6.2. The whale's head is toward -z.
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import { INK, type Pen } from "../../characters/toon";
import { Batch, quadUp } from "../../materials/geo";
import { cobbleHD, stoneHD } from "../../materials/paint";
import { At, frame, col, box, cyl, sph, tex, lathe, glow } from "../../props/kit";
import { house, marketStall, barrel, crate, cart, lanternPost } from "../../props/outdoor";
import type { PropRig } from "../../props/registry";
import type { View } from "../../sets/types";
import type { V3 } from "../../camera/keys";

// ---------------------------------------------------------------- shared helpers
const stable = new Map<string, THREE.CanvasTexture>();
const stex = (key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, rep = false) => {
  let t = stable.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!; draw(g);
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  stable.set(key, t); return t;
};
const FONT = (px: number, w = "bold") => `${w} ${px}px 'DejaVu Serif', 'Liberation Serif', Georgia, serif`;
const rigRoot = (a: At) => { const g = new THREE.Group(); g.position.set(a.x, a.y ?? 0, a.z); g.rotation.y = a.yaw ?? 0; g.scale.setScalar(a.s ?? 1); return g; };
const mesh = (geo: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); return o; };
const cardMat = (t: THREE.Texture) => new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.02 });
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ---------------------------------------------------------------- the whale's shape (world units)
export const SEA = 0, PLAZA = 6.2;
const BODY = { c: [0, PLAZA - 12.4, 25] as V3, r: [48, 12.4, 110] as V3 };
/** the whale's back height at (x, z), or -Infinity off the body */
const backY = (x: number, z: number) => { const q = 1 - ((x - BODY.c[0]) / BODY.r[0]) ** 2 - ((z - BODY.c[2]) / BODY.r[2]) ** 2; return q <= 0 ? -Infinity : BODY.c[1] + BODY.r[1] * Math.sqrt(q); };
/** where the back meets height y on the +x flank, at depth z */
const flankX = (z: number, y: number) => { const q = 1 - ((z - BODY.c[2]) / BODY.r[2]) ** 2 - ((y - BODY.c[1]) / BODY.r[1]) ** 2; return q <= 0 ? 0 : BODY.r[0] * Math.sqrt(q); };
const HARBOUR_Z = -46, QUAY_TOP = 1.3;
const QUAY_X0 = flankX(HARBOUR_Z, QUAY_TOP + 0.4) - 1.5, QUAY_X1 = flankX(HARBOUR_Z, SEA) + 1.2;
const EYE: V3 = [flankX(-58, 0.6) + 0.6, 1.5, -58];

// ---------------------------------------------------------------- textures
const skinTex = () => stex("wcSkin", 1024, 1024, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#5d6f82"); gr.addColorStop(1, "#4e5e71"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  seed = 11;
  for (let k = 0; k < 90; k++) { g.fillStyle = rnd() < 0.5 ? "rgba(120,140,160,0.35)" : "rgba(40,52,66,0.3)"; g.beginPath(); g.ellipse(rnd() * 1024, rnd() * 1024, 20 + rnd() * 70, 10 + rnd() * 40, rnd() * 3, 0, 7); g.fill(); }
  for (let k = 0; k < 40; k++) { g.strokeStyle = "rgba(200,210,220,0.35)"; g.lineWidth = 2 + rnd() * 3; g.beginPath(); const x = rnd() * 1024, y = rnd() * 1024; g.moveTo(x, y); g.quadraticCurveTo(x + rnd() * 60, y + 20, x + 40 + rnd() * 80, y + rnd() * 30); g.stroke(); }  // old scars
  for (let k = 0; k < 26; k++) { const x = rnd() * 1024, y = rnd() * 1024; for (let j = 0; j < 14; j++) { g.fillStyle = j % 3 ? "#d8d2c2" : "#b8b0a0"; g.beginPath(); g.arc(x + (rnd() - 0.5) * 40, y + (rnd() - 0.5) * 30, 3 + rnd() * 5, 0, 7); g.fill(); } } // barnacles
}, true);
const seaTex = (k: string, c0: string, c1: string) => stex("wcSea" + k, 512, 512, (g) => {
  g.fillStyle = c0; g.fillRect(0, 0, 512, 512); seed = 29;
  for (let i = 0; i < 160; i++) { g.strokeStyle = i % 4 ? c1 : "rgba(235,246,250,0.55)"; g.lineWidth = 2 + rnd() * 3; const x = rnd() * 512, y = rnd() * 512, w = 20 + rnd() * 50; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 5, x + w, y); g.stroke(); }
}, true);
const marbleTex = () => stex("wcMarble", 512, 128, (g) => {
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, 512, 128); seed = 5;
  for (let k = 0; k < 14; k++) { g.strokeStyle = "rgba(170,165,160,0.25)"; g.lineWidth = 1.2; g.beginPath(); g.moveTo(rnd() * 512, 0); g.bezierCurveTo(rnd() * 512, 40, rnd() * 512, 90, rnd() * 512, 128); g.stroke(); }
  g.fillStyle = "#c9a24a"; g.fillRect(0, 54, 512, 6);                                                // a thin gilt line round each ring
}, true);
/** the breath-keeper's marks, painted up the pole: [height m, colour, faded] */
const MARKS: [number, string, number][] = [[8.6, "#7a6a5a", 0.45], [8.3, "#7a6a5a", 0.45], [7.9, "#6a5a8a", 0.5], [7.4, "#6a5a8a", 0.55], [6.9, "#5a7a4a", 0.6], [6.4, "#5a7a4a", 0.65], [5.8, "#3f6fb5", 0.8], [5.2, "#3f6fb5", 0.85], [4.6, "#3f6fb5", 0.9], [4.1, "#3f6fb5", 0.95]];
const WREN_MARK = 3.3, TOP_MARK = 9.0;

// ---------------------------------------------------------------- characters
// Wren: the young breath-keeper (curly auburn hair, a teal knitted jumper, grey felt slippers); Gran: the old keeper
// (white bun, round glasses, a brown cardigan); the Mayor: stout, a claret frock coat, a gold chain, a top hat;
// a mother (with her baby) and a fisherman. Everyone wears felt slippers: grey, quiet shoes.
const WREN: Look = { name: "Wren", build: "kid", skin: "#eab995", seed: 201, hair: { style: "curly", color: "#a8552f" },
  top: { style: "sweater", color: "#2f6f73" }, legs: "#5a4a3c", shoes: "#8f949a" };
const GRAN: Look = { name: "Gran", build: "petite", skin: "#e3b897", seed: 202, hair: { style: "bun", color: "#ece8de" }, glasses: { style: "round", color: INK },
  top: { style: "dress", color: "#5d6a3a" }, layer: { style: "cardigan", color: "#8a6a4a" }, legs: "#4a4036", shoes: "#7d7f86" };
const MAYOR: Look = { name: "The Mayor", build: "stout", skin: "#f0c8a8", seed: 203, hair: { style: "receding", color: "#a8a49c" }, moustache: { style: "thin", color: "#8a847c" },
  top: { style: "shirt", color: "#f2ead8" }, neck: { style: "tie", color: "#d4aa3a" }, layer: { style: "longcoat", color: "#7a2f3a" }, hat: { style: "tophat", color: "#2a2428" }, legs: "#3a3434", shoes: "#6d6f76" };
const MOTHER: Look = { name: "Mother", build: "adult", skin: "#c99067", seed: 204, hair: { style: "long", color: "#3b2a22" },
  top: { style: "dress", color: "#8c4a4a" }, layer: { style: "apron", color: "#e8dcc4" }, legs: "#4a3a30", shoes: "#7d7f86" };
const FISHER: Look = { name: "Fisherman", build: "big", skin: "#d9a07a", seed: 205, hair: { style: "short", color: "#8a847c" }, beard: { style: "full", color: "#9a948c" },
  top: { style: "sweater", color: "#4a5a6e" }, hat: { style: "beanie", color: "#a8423a" }, legs: "#3a3d47", shoes: "#6d6f76" };

// ---------------------------------------------------------------- items
const knifeItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 2 * u * s, cy = y - 2 * u;
  p.poly([[cx - 2 * u, cy + 2 * u], [cx + 2 * u, cy + 2 * u], [cx + 2 * u, cy + 12 * u], [cx - 2 * u, cy + 12 * u]], "#6a4a32", 1.6 * u);  // handle
  p.poly([[cx - 2 * u, cy + 2 * u], [cx + 2 * u, cy + 2 * u], [cx + 1 * u, cy - 14 * u], [cx - 2 * u, cy - 10 * u]], "#d6dbe0", 1.6 * u); // blade
};
const babyItem = (p: Pen, x: number, y: number, u: number, s: number) => {
  const cx = x + 6 * u * s, cy = y - 2 * u;
  p.poly([[cx - 16 * u, cy - 6 * u], [cx + 14 * u, cy - 10 * u], [cx + 16 * u, cy + 6 * u], [cx - 14 * u, cy + 10 * u]], "#f2ece0", 2 * u);  // the shawl
  p.poly([[cx + 4 * u, cy - 9 * u], [cx + 14 * u, cy - 11 * u], [cx + 15 * u, cy - 1 * u], [cx + 5 * u, cy + 1 * u]], "#f1c9a8", 1.6 * u);   // the face
};

// ---------------------------------------------------------------- inserts (ink cards)
/** the pole's marks up close: each keeper's dawn mark with their name; Wren's fresh chalk mark low, Gran's above it,
 *  the faded marks of older keepers near the top */
const poleCardTex = (v: string) => stex("wcPoleCard" + v, 640, 1024, (g) => {
  g.fillStyle = "#2a3a4a"; g.fillRect(0, 0, 640, 1024);
  g.fillStyle = "#efe8d8"; g.fillRect(250, 0, 140, 1024);                                    // the pole, close
  for (let k = 0; k < 6; k++) { g.fillStyle = "#b8463a"; g.fillRect(250, 60 + k * 170, 140, 22); }
  const mk = (y: number, c: string, a: number, name: string, fresh = false) => {
    g.globalAlpha = a; g.fillStyle = c; g.fillRect(232, y - 9, 176, 18);
    g.font = FONT(fresh ? 46 : 38); g.textAlign = "left"; g.fillStyle = fresh ? "#ffffff" : c; g.fillText(name, 424, y + 14); g.globalAlpha = 1;
  };
  for (const [y, c, a, n] of [[70, "#9a8a7a", 0.5, "BRAM"], [150, "#8a7aaa", 0.55, "OTTILIE"], [230, "#7a9a6a", 0.65, "HESTER"], [340, "#5f8fd5", 0.9, "GRAN"], [420, "#5f8fd5", 0.95, "GRAN"], [500, "#5f8fd5", 1, "GRAN"]] as const) mk(y, c, a, n);
  if (v === "top") mk(24, "#ffffff", 1, "WREN", true); else mk(700, "#ffffff", 1, "WREN", true);
  g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 6; g.setLineDash([16, 12]); g.beginPath(); g.moveTo(232, v === "top" ? 24 : 700); g.lineTo(232, 500); g.stroke(); g.setLineDash([]);
});
/** the founders' tapestry: their ship; the "island" with its first houses and a wide, open hole at the top; the
 *  cannon fired at their first party; the island's great breath blowing the roofs off */
const tapestryTex = () => stex("wcTapestry", 1024, 768, (g) => {
  g.fillStyle = "#8a2f2f"; g.fillRect(0, 0, 1024, 768); g.fillStyle = "#e8d8b4"; g.fillRect(36, 36, 952, 696);
  g.strokeStyle = "#c9a24a"; g.lineWidth = 10; g.strokeRect(52, 52, 920, 664);
  g.fillStyle = "#5f8fb5"; g.fillRect(60, 470, 904, 238);                                      // the sea
  for (let k = 0; k < 12; k++) { g.strokeStyle = "#e8f0f4"; g.lineWidth = 4; g.beginPath(); g.moveTo(80 + k * 75, 560 + (k % 3) * 40); g.quadraticCurveTo(110 + k * 75, 548 + (k % 3) * 40, 140 + k * 75, 560 + (k % 3) * 40); g.stroke(); }
  g.fillStyle = "#5d6f82"; g.beginPath(); g.ellipse(560, 500, 330, 110, 0, Math.PI, 0); g.fill();  // the "island" (the whale's back)
  g.strokeStyle = INK; g.lineWidth = 6; g.stroke();
  g.fillStyle = "#2a2a30"; g.beginPath(); g.ellipse(560, 392, 60, 16, 0, 0, 7); g.fill();            // the wide, open hole
  for (const [x, w, h, rx] of [[360, 50, 50, -30], [430, 46, 60, -60], [690, 50, 56, 50], [760, 44, 46, 80]] as const) {  // houses, roofs flying
    g.fillStyle = "#d8b07a"; g.fillRect(x, 440 - h, w, h); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(x, 440 - h, w, h);
    g.save(); g.translate(x + w / 2 + rx * 0.6, 440 - h - 40 - Math.abs(rx)); g.rotate(rx / 100); g.fillStyle = "#a8423a"; g.beginPath(); g.moveTo(-w / 2 - 6, 0); g.lineTo(w / 2 + 6, 0); g.lineTo(0, -30); g.closePath(); g.fill(); g.stroke(); g.restore();
  }
  g.fillStyle = "#ffffff"; g.globalAlpha = 0.92; for (let k = 0; k < 9; k++) { g.beginPath(); g.arc(560 + Math.sin(k) * 30, 360 - k * 34, 34 + k * 5, 0, 7); g.fill(); } g.globalAlpha = 1; // the great breath
  g.fillStyle = "#3a3a40"; g.fillRect(250, 430, 70, 22); g.beginPath(); g.arc(262, 456, 14, 0, 7); g.fill();          // the cannon
  g.fillStyle = "#d9d4c8"; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(214 - k * 26, 436 - k * 8, 14 + k * 4, 0, 7); g.fill(); }
  g.fillStyle = "#6a4a32"; g.beginPath(); g.moveTo(90, 470); g.lineTo(220, 470); g.lineTo(200, 500); g.lineTo(110, 500); g.closePath(); g.fill(); // the ship
  g.fillStyle = "#f2ead8"; g.beginPath(); g.moveTo(150, 466); g.lineTo(150, 380); g.lineTo(200, 450); g.closePath(); g.fill();
  g.fillStyle = "#2a2a30"; g.font = FONT(44); g.textAlign = "center"; g.fillText("THE FOUNDING", 512, 120);
});

// ---------------------------------------------------------------- prop rigs
const puffTex = () => stex("wcPuff", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.55, "rgba(236,244,250,0.85)"); gr.addColorStop(1, "rgba(220,232,242,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const ringGeo = (ri: number, ro: number, t: number) => new THREE.LatheGeometry([new THREE.Vector2(ri, 0), new THREE.Vector2(ro, 0), new THREE.Vector2(ro, t), new THREE.Vector2(ri, t), new THREE.Vector2(ri, 0)].map((p) => p), 40);
/** blowhole: the Fountain. The whale's blowhole (a dark, wet hole in the skin) inside stacked marble rings, each
 *  smaller than the one below, so the opening narrows. Variant: "12", "13" (the new ring set on top), "13lower" (the
 *  13th ring lowered into place over its steps), "blast" (all 13 thrown up and away over its steps). `at` = the centre
 *  on the plaza. The opening is at the top of the stack, ~1.25 m up. */
const RING_T = 0.1, RINGS = 13;
const ringR = (k: number): [number, number] => [1.55 - k * 0.085, 2.35 - k * 0.1];   // inner / outer radius of ring k (0 = the founders' first)
const blowholeRig = (a: At, v = "12"): PropRig => {
  const root = rigRoot(a), n = v === "open" ? 0 : v === "12" ? 12 : 13, marble = new THREE.MeshLambertMaterial({ map: marbleTex() }), marble2 = new THREE.MeshLambertMaterial({ map: marbleTex(), color: "#e6e0d6" });
  root.add(mesh(new THREE.CylinderGeometry(2.6, 2.75, 0.15, 40), new THREE.MeshLambertMaterial({ map: skinTex() }), 0, 0.07, 0));  // the skin it sits on
  const hole = mesh(new THREE.CircleGeometry(1.5, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#121418" }), 0, 0.151, 0); root.add(hole);
  const rings = Array.from({ length: n }, (_, k) => { const [ri, ro] = ringR(k), mk = k % 2 ? marble : marble2, m = mesh(ringGeo(ri, ro, RING_T * 0.92), mk, 0, 0.15 + k * RING_T, 0); root.add(m); return m; });
  const plug = mesh(new THREE.CircleGeometry(1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#0e1014" }), 0, 0, 0); root.add(plug);  // the dark opening at the top
  const fly = rings.map((_, k) => ({ vx: Math.cos(k * 2.4) * (2 + (k % 4)), vz: Math.sin(k * 2.4) * (2 + (k % 3)), vy: 10 + (k % 5) * 2.2, spin: (k % 2 ? 1 : -1) * (2 + k * 0.3) }));
  const ropes = v === "13lower" ? [0, 1, 2].map((i) => { const r = mesh(new THREE.CylinderGeometry(0.02, 0.02, 6, 6), new THREE.MeshLambertMaterial({ color: "#b89a6a" }), 0, 0, 0); root.add(r); return { r, i }; }) : [];
  return { root, update: ({ step = 0 }) => {
    const top = 0.15 + n * RING_T; plug.position.y = top + 0.001; const [pri] = n ? ringR(n - 1) : [1.5]; plug.scale.setScalar(pri * 0.98);
    if (v === "13lower") { const u = Math.min(1, step / 4), y0 = 0.15 + 12 * RING_T, y = y0 + (1 - u) * 2.2; rings[12].position.y = y;
      for (const { r, i } of ropes) { const ang = (i / 3) * Math.PI * 2, [ri] = ringR(12); r.position.set(Math.cos(ang) * (ri + 0.25), y + 3, Math.sin(ang) * (ri + 0.25)); } }
    if (v === "blast") { const t = Math.max(0, step) * 0.45;
      rings.forEach((m, k) => { const f = fly[k], tk = Math.max(0, t - (RINGS - 1 - k) * 0.03); m.position.set(f.vx * tk, 0.15 + k * RING_T + f.vy * tk - 4.9 * tk * tk * 0.35, f.vz * tk); m.rotation.set(f.spin * tk, 0, f.spin * 0.6 * tk); m.visible = m.position.y > -2; });
      plug.visible = t < 0.02; plug.position.y = 0.152; plug.scale.setScalar(1.5); }
  } };
};
/** spout: the whale's breath from the Fountain, a column of white vapour puffs. Variant "low" (a weak breath ~3.3 m),
 *  "fail" (a thin hiss that dies away over its steps), "erupt" (a huge blast ~30 m, spray falling over the city, a
 *  rainbow), "tall" (an easy breath, ~11 m: over the top of the pole). Give it steady steps (every ~0.15 s) to keep it
 *  moving. `at` = the opening (top of the rings). */
const spoutRig = (a: At, v = "low"): PropRig => {
  const root = rigRoot(a), H = v === "erupt" ? 30 : v === "tall" ? 11 : v === "fail" ? 1.6 : 3.3, W = v === "erupt" ? 3.2 : v === "tall" ? 1.4 : v === "fail" ? 0.35 : 0.8, N = v === "erupt" ? 34 : 16;
  const mat = () => new THREE.MeshBasicMaterial({ map: puffTex(), transparent: true, depthWrite: false, toneMapped: false });
  const ps = Array.from({ length: N }, (_, i) => { const m = mesh(new THREE.PlaneGeometry(1, 1), mat()); root.add(m); return { m, i }; });
  const spray = v === "erupt" ? Array.from({ length: 40 }, (_, i) => { const m = mesh(new THREE.PlaneGeometry(0.35, 0.9), new THREE.MeshBasicMaterial({ color: "#e8f4fa", transparent: true, opacity: 0.55, depthWrite: false })); root.add(m); return { m, i }; }) : [];
  const bow = v === "erupt" ? mesh(new THREE.RingGeometry(22, 24.5, 64, 1, 0, Math.PI), new THREE.MeshBasicMaterial({ map: stex("wcBow", 256, 16, (g) => { const gr = g.createLinearGradient(0, 0, 256, 0); ["#ff5a5a", "#ffb43a", "#ffe94a", "#5ad46a", "#4aa8ff", "#8a5aff"].forEach((c, k) => gr.addColorStop(k / 5, c)); g.fillStyle = gr; g.fillRect(0, 0, 256, 16); }), transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), 0, -6, -30) : null;
  if (bow) { (bow.geometry as THREE.RingGeometry).computeBoundingSphere(); root.add(bow); }
  return { root, update: ({ step = 0, camPos }) => {
    const on = step > 0.001, life = v === "fail" ? Math.max(0, 1 - step / 6) : v === "erupt" ? Math.min(1, step * 0.9) : Math.min(1, step * 1.5);
    for (const { m, i } of ps) { const u = ((i / N) + step * (v === "erupt" ? 0.09 : 0.06)) % 1, h = u * H * life, w = W * (0.6 + u * (v === "erupt" ? 2.6 : 1.3)) * (0.5 + life * 0.5);
      m.position.set(Math.sin(i * 2.7) * W * 0.18 * u, h, Math.cos(i * 1.9) * W * 0.18 * u); m.scale.setScalar(w * 1.6); m.lookAt(camPos);
      (m.material as THREE.MeshBasicMaterial).opacity = on ? Math.min(1, u * 8) * (1 - u * 0.85) * life : 0; m.visible = on && life > 0.01; }
    for (const { m, i } of spray) { const u = ((i / spray.length) * 1.7 + step * 0.05) % 1, r0 = 4 + (i % 7) * 3.2, ang = i * 2.3;
      m.position.set(Math.cos(ang) * r0, H * (1 - u) * 0.7, Math.sin(ang) * r0); m.lookAt(camPos); m.visible = on && step > 1.2; }
    if (bow) { bow.lookAt(camPos.x, bow.position.y + root.position.y, camPos.z); (bow.material as THREE.MeshBasicMaterial).opacity = Math.max(0, Math.min(0.6, (step - 2) * 0.25)); }
  } };
};
/** breathPole: the breath-keeper's measuring pole beside the Fountain: 9.4 m, white with red bands every 1.5 m, each
 *  keeper's dawn mark painted where the breath reached. Variant "low" (Wren's fresh mark at 3.3 m, below Gran's), or
 *  "top" (her last mark at 9 m). `at` = its foot. */
const poleBuild = (b: Batch, a: At, v = "low") => {
  const m = frame(a); cyl(b, col("#efe8d8"), m, 0, 0, 0, 0.11, 0.09, 9.4, 14); sph(b, col("#c9a24a"), m, 0, 9.45, 0, 0.16, 0.16, 0.16, 12);
  for (let y = 1.5; y < 9.4; y += 1.5) cyl(b, col("#b8463a"), m, 0, y, 0, 0.115, 0.115, 0.14, 14);
  for (const [y, c] of MARKS) cyl(b, col(c), m, 0, y, 0, 0.125, 0.125, 0.07, 14);
  cyl(b, col("#ffffff"), m, 0, v === "top" ? TOP_MARK : WREN_MARK, 0, 0.13, 0.13, 0.09, 14);
  box(b, col("#6a4a32"), m, -0.35, 0.35, 0, 0.12, -0.35, 0.35);                                 // its foot
};
/** foundersBell: the founders' ship's bell on a wooden frame (bell mouth ~1.9 m up, 0.5 m across), `at` = the frame's
 *  centre. Variant "tied": its clapper lashed to the rim with old rope (silenced); "free": the lashing cut, the bell
 *  rope hanging from the clapper; steps swing it (each step a stroke). */
const bellRig = (a: At, v = "tied"): PropRig => {
  const root = rigRoot(a), b = new Batch(), I = new THREE.Matrix4(), wood = col("#6a4a32");
  for (const s of [-1, 1]) { box(b, wood, I, s * 0.95 - 0.08, s * 0.95 + 0.08, 0, 3.0, -0.08, 0.08); box(b, wood, I, s * 0.95 - 0.25, s * 0.95 + 0.25, 0, 0.12, -0.3, 0.3); }
  box(b, wood, I, -1.15, 1.15, 2.85, 3.05, -0.1, 0.1); b.build(root, true);
  const swing = new THREE.Group(); swing.position.set(0, 2.85, 0); root.add(swing);
  const bronze = new THREE.MeshLambertMaterial({ color: "#b8863a" });
  swing.add(mesh(new THREE.LatheGeometry([[0.06, 0], [0.16, -0.05], [0.2, -0.25], [0.24, -0.5], [0.33, -0.78], [0.36, -0.84], [0.0, -0.84]].map(([x, y]) => new THREE.Vector2(x, y)), 32), bronze));
  swing.add(mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 10), bronze, 0, 0.05, 0));
  const clap = mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshLambertMaterial({ color: "#3a3430" }), 0, -0.84, 0); swing.add(clap);
  const rope = new THREE.MeshLambertMaterial({ color: "#b89a6a" });
  if (v === "tied") { for (let k = 0; k < 3; k++) swing.add(mesh(new THREE.TorusGeometry(0.3 + k * 0.012, 0.025, 6, 32).rotateX(Math.PI / 2), rope, 0, -0.62 - k * 0.06, 0)); swing.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6), rope, 0.3, -0.85, 0)); }
  else swing.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6), rope, 0, -1.34, 0));
  return { root, update: ({ step = 0 }) => { swing.rotation.z = v === "free" && step > 0.001 ? Math.sin(step * Math.PI) * 0.45 : 0; } };
};
/** whaleEye: the whale's eye on its flank (5 m across), `at` = its centre, facing +z; shut until its first step, then
 *  the lids open over the next step; it then looks about slowly. */
const eyeRig = (a: At): PropRig => {
  const root = rigRoot(a), skin = new THREE.MeshLambertMaterial({ map: skinTex() });
  root.add(mesh(new THREE.SphereGeometry(3.3, 32, 20), skin, 0, 0, -2.2));                       // the mound around it
  const ball = new THREE.Group(); ball.position.set(0, 0, 0.6); root.add(ball);
  ball.add(mesh(new THREE.CircleGeometry(1.9, 40), new THREE.MeshBasicMaterial({ color: "#efe6c8" }), 0, 0, 0.02));
  ball.add(mesh(new THREE.CircleGeometry(0.95, 40), new THREE.MeshBasicMaterial({ color: "#6a4428" }), 0, 0, 0.04));
  ball.add(mesh(new THREE.CircleGeometry(0.45, 32), new THREE.MeshBasicMaterial({ color: "#0c0a0a" }), 0, 0, 0.06));
  ball.add(mesh(new THREE.CircleGeometry(0.26, 20), new THREE.MeshBasicMaterial({ color: "#ffffff" }), 0.32, 0.32, 0.08));
  const lid = (s: number) => { const g = new THREE.Group(); const m = mesh(new THREE.CircleGeometry(2.25, 40, s > 0 ? 0 : Math.PI, Math.PI), skin, 0, 0, 0.12); g.add(m); root.add(g); return g; };
  const up = lid(1), dn = lid(-1);
  root.add(mesh(new THREE.TorusGeometry(2.2, 0.32, 10, 48), skin, 0, 0, 0.12));
  return { root, update: ({ step = 0 }) => { const o = Math.min(1, Math.max(0, step - 1)); up.position.y = o * 1.9; dn.position.y = -o * 1.6; up.scale.y = 1 - o * 0.55; dn.scale.y = 1 - o * 0.55; ball.position.x = Math.sin(step * 0.4) * 0.15 * o; } };
};
/** whaleTail: the whale's tail flukes (24 m across) far behind the city: hidden under the sea until its first step,
 *  rising out over the next two (water streaming off), then slapping down. `at` = where it breaks the surface. */
const tailRig = (a: At, v?: string): PropRig => {
  const root = rigRoot(a), s = new THREE.Shape(); s.moveTo(0, 0); s.bezierCurveTo(4, 2, 9, 6, 12, 9); s.bezierCurveTo(9, 8.6, 5, 8.2, 2, 9.6); s.lineTo(0, 7.5); s.lineTo(-2, 9.6); s.bezierCurveTo(-5, 8.2, -9, 8.6, -12, 9); s.bezierCurveTo(-9, 6, -4, 2, 0, 0);
  const g = new THREE.Group(); root.add(g);
  g.add(mesh(new THREE.ExtrudeGeometry(s, { depth: 0.8, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 2 }).translate(0, 0, -0.4), new THREE.MeshLambertMaterial({ map: skinTex() }), 0, 0, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.4, 2.6, 8, 20), new THREE.MeshLambertMaterial({ map: skinTex() }), 0, -3.6, 0));
  const drops = Array.from({ length: 24 }, (_, i) => { const m = mesh(new THREE.PlaneGeometry(0.4, 2.2), new THREE.MeshBasicMaterial({ color: "#e8f4fa", transparent: true, opacity: 0.7, depthWrite: false })); g.add(m); return { m, i }; });
  return { root, update: ({ step = 0, camPos }) => {
    if (v === "rest") { g.position.y = -7.2; g.rotation.x = -0.35; g.visible = true; for (const { m } of drops) m.visible = false; return; }
    const u = Math.max(0, step - 0.05), rise = Math.min(1, u / 2), fall = Math.max(0, Math.min(1, (u - 3) / 1.2));
    g.position.y = -12 + rise * 12 - fall * 12; g.rotation.x = -0.25 + rise * 0.25 + fall * 0.5; g.visible = step > 0.001;
    for (const { m, i } of drops) { const k = ((i / 24) + u * 0.6) % 1; m.position.set(-11 + (i % 12) * 2, 9 - k * 9, 0.6); m.lookAt(camPos); m.visible = rise > 0.3 && fall < 0.9; }
  } };
};
/** whaleSea: the sea as a moving prop (for the whaleRise set, which has none). Variant "rise": the city lifts, so the
 *  sea drops from +0.5 to -2.8 over its first two steps, white water pouring off the quay; "glide": the sea 2.8 m down,
 *  rushing past toward +z (the city swimming forward); "calm": still, 2.8 m down. `at` = [0, 0, 0]. */
const seaRig = (a: At, v = "rise"): PropRig => {
  const root = rigRoot(a), t = seaTex("A", "#2f7fae", "#4a97c2").clone(); t.repeat.set(160, 160); t.needsUpdate = true;
  const water = mesh(new THREE.PlaneGeometry(1800, 1800).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: t }), 0, 0, 0); root.add(water);
  const falls = v === "rise" ? Array.from({ length: 18 }, (_, i) => { const m = mesh(new THREE.PlaneGeometry(2.2, 1), new THREE.MeshBasicMaterial({ color: "#eaf6fa", transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide })); root.add(m); return { m, i }; }) : [];
  return { root, update: ({ step = 0 }) => {
    const u = Math.min(1, Math.max(0, step) / 2), lvl = v === "rise" ? 0.5 - u * 3.3 : -2.8; water.position.y = lvl;
    t.offset.y = v === "glide" ? -step * 0.06 : step * 0.002;
    for (const { m, i } of falls) { const z = HARBOUR_Z - 7 + i * 0.8 - a.z, top = QUAY_TOP; m.position.set(QUAY_X1 + 0.05 - a.x, (top + lvl) / 2, z); m.scale.y = Math.max(0.01, top - lvl); m.rotation.y = Math.PI / 2; m.visible = u > 0.05 && u < 0.98; }
  } };
};
/** floodWater: sea water over the harbour quay (14 x 9 m), rising from below the quay to 0.4 m over it over its first
 *  three steps. `at` = the quay's centre at the quay's surface. */
const floodRig = (a: At): PropRig => {
  const root = rigRoot(a), t = seaTex("F", "#2a6f98", "#3f88b0").clone(); t.repeat.set(4, 4); t.needsUpdate = true;
  const w = mesh(new THREE.PlaneGeometry(9, 16).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: t, transparent: true, opacity: 0.92 }), 0, 0, 0); root.add(w);
  return { root, update: ({ step = 0 }) => { w.position.y = -0.3 + Math.min(1, step / 3) * 0.7; t.offset.x = step * 0.01; w.visible = step > 0.001; } };
};

// ---------------------------------------------------------------- sets
const P = PLAZA;
const WC_SPOTS: Record<string, V3> = {
  fountain: [0, P, -3], pole: [2.6, P, -3.8], wren: [1.5, P, -0.9], gran: [3.0, P, -0.6], bell: [-6.5, P, 2.2], market: [-8, P, 6], mayor: [-1.7, P, -0.7], crowd: [0, P, 5],
  hall: [-4, P, -14.5], harbour: [(QUAY_X0 + QUAY_X1) / 2, QUAY_TOP, HARBOUR_Z], eye: EYE,
};
const WC_VIEWS: View[] = [
  { name: "square", pos: [6, P + 2.2, 15], look: [0, P + 1.6, -3], fov: 50, establishing: true },
  { name: "aerial", pos: [70, 60, 90], look: [0, 0, -5], fov: 40, establishing: true },
  { name: "harbour", pos: [QUAY_X1 + 6, QUAY_TOP + 1.8, HARBOUR_Z + 9], look: [QUAY_X0, QUAY_TOP + 1.2, HARBOUR_Z - 2], fov: 50, establishing: true },
];
const whaleCityBuild = (withSea: boolean) => () => {
  const root = new THREE.Group(), b = new Batch(), I = new THREE.Matrix4(); seed = 61;
  if (withSea) {                                                                                  // the sea, foam along the whale's waterline
    b.add(quadUp(-900, 900, -900, 900, 1, 1, SEA), col("#2f7fae"));
    b.add(quadUp(-160, 160, -200, 240, 1, 1, SEA + 0.005), col("#3a8fbd"));
    for (let z = -70; z <= 130; z += 4) for (const s of [-1, 1]) { const x = s * flankX(z, SEA); if (!x) continue; b.add(quadUp(-0.25, 0.25, -1.8, 1.8, 1, 1, SEA + 0.02).translate(x + s * 0.5, 0, z), col("#dcecf2")); }
    for (let i = 0; i < 80; i++) { const ang = rnd() * Math.PI * 2, d = 60 + rnd() * 160, w = 0.6 + rnd() * 2; b.add(quadUp(-w, w, -0.1, 0.1, 1, 1, SEA + 0.01).translate(Math.cos(ang) * d, 0, 25 + Math.sin(ang) * d * 1.4), col("#d9eef5")); }
  }
  // the whale: its long back, a blunt head with a mouth line, two flippers
  const skin = tex("wcSkinT", skinTex, 8, 4);
  b.add(new THREE.SphereGeometry(1, 64, 32), skin, new THREE.Matrix4().compose(new THREE.Vector3(...BODY.c), new THREE.Quaternion(), new THREE.Vector3(...BODY.r)));
  b.add(new THREE.SphereGeometry(1, 48, 24), skin, new THREE.Matrix4().compose(new THREE.Vector3(0, -7, -62), new THREE.Quaternion(), new THREE.Vector3(30, 11, 24)));
  for (const s of [-1, 1]) {
    b.add(new THREE.TorusGeometry(26, 0.35, 8, 48, Math.PI * 0.55), col("#2c3642"), new THREE.Matrix4().compose(new THREE.Vector3(0, 0.6, -60), new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, s > 0 ? -0.3 : Math.PI - 1.43)), new THREE.Vector3(1, 1.25, 1)));
    b.add(new THREE.SphereGeometry(1, 24, 12), tex("wcFlip", skinTex, 2, 1), new THREE.Matrix4().compose(new THREE.Vector3(s * 44, 0.3, -18), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, s * 0.5, s * 0.12)), new THREE.Vector3(12, 1.2, 4)));
  }
  // the plaza: a raised cobbled disc at the top, with a stone retaining wall down to the skin
  b.add(new THREE.CircleGeometry(20, 64).rotateX(-Math.PI / 2).translate(0, P, 0), tex("cobbleHD", cobbleHD, 8, 8));
  b.add(new THREE.CylinderGeometry(20.05, 20.6, 5, 64, 1, true).translate(0, P - 2.5, 0), tex("wcWall", () => stoneHD("wcWallHD", ["#cfc4b0", "#c2b6a2", "#d8cdb9", "#b9ad98"], "#9a8e7a"), 24, 2));
  // the town hall (north), its arcade; houses round the square, facing in; gaps for the streets down
  house(b, { x: 0, y: P, z: -21, yaw: 0 }, 14, 9, 11.2, 3, 0);
  for (let i = 0; i < 4; i++) cyl(b, col("#e8e0d0"), I, -4.5 + i * 3, P, -16.4, 0.3, 0.3, 4.2, 14);
  box(b, col("#d8cdb9"), I, -6, 6, P + 4.2, P + 4.7, -16.8, -16.0);
  const gaps = [0, Math.PI / 2, Math.PI, -Math.PI / 2];                                           // north (the hall), east (harbour street), south, west
  for (let k = 0; k < 20; k++) {
    const ang = (k / 20) * Math.PI * 2; if (gaps.some((g) => Math.abs(Math.atan2(Math.sin(ang - g), Math.cos(ang - g))) < 0.2)) continue;
    const x = Math.sin(ang) * 23.5, z = -Math.cos(ang) * 23.5, w = 6 + Math.floor(rnd() * 3), h = [7, 8.4, 9.8][Math.floor(rnd() * 3)];
    house(b, { x, y: P - 0.3, z, yaw: Math.atan2(-x, -z) }, w, 7, h, Math.floor(rnd() * 8), k);
  }
  // terraces stepping down the whale's back
  for (const [R, n, sz] of [[34, 18, 1.5], [45, 11, 1.6]] as const) for (let k = 0; k < n; k++) {
    const ang = (k / n) * Math.PI * 2 + R, x = Math.sin(ang) * R * 0.78, z = -Math.cos(ang) * R * sz + 8, y = backY(x, z);
    if (!(y > SEA + 2.2) || (x > 10 && z < -30 && z > -60)) continue;                              // above the water; the harbour slope stays open
    house(b, { x, y: y - 0.6, z, yaw: Math.atan2(-x, -(z - 8)) }, 6 + Math.floor(rnd() * 3), 7, [6.2, 7.4, 8.4][Math.floor(rnd() * 3)], Math.floor(rnd() * 8), k + R);
  }
  // the square's furniture
  marketStall(b, { x: -9, y: P, z: 6.5, yaw: 0.5 }, "#c0353a", "fruit"); marketStall(b, { x: 9.5, y: P, z: 7, yaw: -0.5 }, "#2f6a43", "bread"); marketStall(b, { x: -12.5, y: P, z: -2, yaw: 1.3 }, "#3f6fb5", "cloth");
  for (const [x, z] of [[-11, 9], [-10.3, 9.6], [11.8, 8.8]] as const) barrel(b, { x, y: P, z });
  for (const [x, z, s] of [[-13.5, 4, 0.6], [-13.8, 4.7, 0.5], [12.6, 4.2, 0.6]] as const) crate(b, { x, y: P, z, yaw: x }, s);
  cart(b, { x: 13, y: P, z: -6, yaw: -0.8 });
  for (const [x, z] of [[-15, -10], [15, -10], [-15, 12], [15, 12], [-7, 11], [7.5, 11.5]] as const) lanternPost(b, { x, y: P, z });
  // the harbour: a stone quay on the flank toward the head, steps into the sea, mooring posts, crates and nets
  const stone = tex("wcQuay", () => stoneHD("wcQuayHD", ["#b9ae9a", "#aaa08c", "#c4b9a5", "#9f9582"], "#857b68"), 3, 1);
  box(b, stone, I, QUAY_X0, QUAY_X1, SEA - 1.5, QUAY_TOP, HARBOUR_Z - 8, HARBOUR_Z + 8);
  for (let k = 0; k < 5; k++) box(b, stone, I, QUAY_X1, QUAY_X1 + 0.45 * (k + 1), SEA - 1.5, QUAY_TOP - 0.32 * (k + 1), HARBOUR_Z - 2.2, HARBOUR_Z + 2.2);
  for (const z of [-6, -3, 3, 6]) cyl(b, col("#4a3a30"), I, QUAY_X1 - 0.4, QUAY_TOP, HARBOUR_Z + z, 0.18, 0.2, 0.8, 10);
  for (const [dx, dz] of [[1.2, -5], [1.8, -4.2], [2.2, 5]] as const) barrel(b, { x: QUAY_X0 + dx, y: QUAY_TOP, z: HARBOUR_Z + dz });
  for (const [dx, dz] of [[1.5, 3.6], [2.4, 3.2]] as const) crate(b, { x: QUAY_X0 + dx, y: QUAY_TOP, z: HARBOUR_Z + dz, yaw: dz }, 0.6);
  for (const [dx, dz] of [[3.2, -2.5], [3.6, 1.2]] as const) sph(b, col("#a89068"), I, QUAY_X0 + dx, QUAY_TOP, HARBOUR_Z + dz, 0.7, 0.25, 0.55, 12);  // net piles
  for (const z of [-12, -18, 12]) house(b, { x: QUAY_X0 - 3.5, y: backY(QUAY_X0 - 3.5, HARBOUR_Z + z) - 0.6, z: HARBOUR_Z + z, yaw: Math.PI / 2 }, 6, 6, 6.4, Math.floor(rnd() * 8), z);
  lathe(b, col("#3a3430"), I, QUAY_X1 - 0.4, QUAY_TOP + 0.8, HARBOUR_Z - 6, [[0.22, 0], [0.22, 0.08], [0.0, 0.08]], 10);
  b.build(root, true);
  void glow;
  return { root, env: {}, spots: WC_SPOTS, views: WC_VIEWS };
};

export const WHALECITY_THEME: Theme = {
  id: "whalecity", name: "The Whale City (a silent harbour city on the back of a sleeping whale)",
  desc: "an old harbour city of tall painted houses and cobbled streets built on the back of a sleeping whale in the open sea: the square at the top with the Fountain (the whale's blowhole inside stacked marble rings) and the breath-keeper's measuring pole, the founders' ship bell with its clapper tied, the town hall's founding tapestry, a stone quay at the waterline; the whale's eye and tail; the people in felt slippers who never make a sound",
  tags: ["fantasy", "whale", "city", "sea", "harbour", "quiet", "high concept"],
  mood: "mystery",
  ambience: { whaleCity: "amb_sea", whaleRise: "amb_sea" },
  steps: { whaleCity: "step_stone", whaleRise: "step_stone" },
  characters: { wren: WREN, gran: GRAN, mayor: MAYOR, mother: MOTHER, fisher: FISHER },
  characterMeta: {
    wren: { name: "Wren", desc: "a girl of twelve with curly auburn hair, a teal knitted jumper and grey felt slippers", personality: "the Whale City's young breath-keeper: careful, stubborn, the one who checks the marks (The Whale City)", themes: ["fantasy", "sea"], tags: ["girl", "child", "protagonist", "keeper"] },
    gran: { name: "Gran", desc: "a small old woman with a white bun, round glasses, a green dress and a brown cardigan", personality: "Wren's gran, the breath-keeper before her: gentle, slow to worry (The Whale City)", themes: ["fantasy", "sea"], tags: ["old woman", "grandmother", "keeper"] },
    mayor: { name: "The Mayor", desc: "stout; grey moustache; a claret frock coat, a gold tie, a top hat", personality: "the Whale City's mayor: pleasant, proud of tradition, never raises his voice (The Whale City)", themes: ["fantasy", "town"], tags: ["mayor", "male", "official", "antagonist"] },
    mother: { name: "Mother", desc: "long dark hair; a red dress under a cream apron", personality: "a mother in the market, hushing her baby (The Whale City)", themes: ["fantasy", "town"], tags: ["mother", "woman", "background"] },
    fisher: { name: "Fisherman", desc: "big; grey beard; a slate-blue jumper and a red beanie", personality: "a fisherman on the quay (The Whale City)", themes: ["fantasy", "sea"], tags: ["fisherman", "man", "sailor", "background"] },
  },
  items: {
    knife: { name: "Knife", desc: "a small kitchen knife (cutting a rope, a string)", themes: ["any"], tags: ["knife", "cut", "blade", "tool"], draw: knifeItem },
    baby: { name: "Baby", desc: "a baby swaddled in a cream shawl, held in the arms", themes: ["any"], tags: ["baby", "infant", "child", "family"], draw: babyItem },
  },
  props: {
    blowhole: { name: "The Fountain (the whale's blowhole)", desc: "the whale's blowhole, a dark wet hole in the skin, inside stacked white marble rings (each 0.1 m, narrower than the one below; the opening at the top of the stack, ~1.35 m up for 12 rings), `at` = the centre. Variant 12, 13, open (no rings: the hole wide open), 13lower (the 13th lowered into place over four steps, on three ropes) or blast (all thrown up and away over its steps)", category: "theme", themes: ["fantasy", "whale"], tags: ["fountain", "blowhole", "rings", "marble", "monument"], radius: 2.4, height: 1.5,
      build: () => undefined, rig: (a, v) => blowholeRig(a, v ?? "12"), steps: ["it moves"], stepCount: () => 400, variants: { "12": () => undefined, "13": () => undefined, open: () => undefined, "13lower": () => undefined, blast: () => undefined } },
    spout: { name: "Whale spout", desc: "the whale's breath: a column of white vapour from the Fountain's opening, `at` = the opening; variant low (~3.3 m), fail (a thin hiss dying away over ~6 steps), erupt (~30 m, spray over the city, a rainbow), tall (~11 m); give it steady steps (every ~0.15 s)", category: "theme", themes: ["fantasy", "whale", "sea"], tags: ["spout", "breath", "vapour", "water"], radius: 1, height: 11,
      build: () => undefined, rig: (a, v) => spoutRig(a, v ?? "low"), steps: ["it breathes"], stepCount: () => 400, variants: { low: () => undefined, fail: () => undefined, erupt: () => undefined, tall: () => undefined } },
    breathPole: { name: "Breath-keeper's pole", desc: "a 9.4 m white measuring pole with red bands every 1.5 m and each keeper's coloured dawn mark, `at` = its foot; variant low (Wren's fresh white mark at 3.3 m, below Gran's blue ones) or top (her mark at 9 m)", category: "theme", themes: ["fantasy"], tags: ["pole", "measure", "marks", "gauge"], radius: 0.3, height: 9.4,
      build: (b, a, v) => poleBuild(b, a, v ?? "low"), param: { desc: "low or top", ok: (v) => v === "low" || v === "top" } },
    poleCard: { name: "The pole's marks (insert)", desc: "the breath-keeper's pole up close: each keeper's painted mark with their name (BRAM, OTTILIE, HESTER faded near the top; GRAN's blue marks; WREN's fresh white mark far below them, a dashed line showing the drop). An ink card 0.4 x 0.64 m facing +z: ~0.55 m from an `at` camera; variant top: WREN's mark above them all", category: "theme", themes: ["fantasy"], tags: ["insert", "marks", "pole"], radius: 0.05, height: 0.64,
      build: () => undefined, rig: (a, v) => { const root = rigRoot(a); root.add(mesh(new THREE.PlaneGeometry(0.4, 0.64), cardMat(poleCardTex(v ?? "low")))); return { root, update: () => undefined }; }, steps: ["it shows"], param: { desc: "low or top", ok: (v) => v === "low" || v === "top" } },
    tapestryCard: { name: "The founding tapestry (insert)", desc: "the town hall's tapestry of the founding: the founders' ship, the 'island' with their first houses and a wide open hole at its top, the cannon fired at their first party, the great breath blowing the roofs off. An ink card 0.8 x 0.6 m facing +z: ~1 m from an `at` camera", category: "theme", themes: ["fantasy", "history"], tags: ["insert", "tapestry", "history", "founding"], radius: 0.05, height: 0.6,
      build: () => undefined, rig: (a) => { const root = rigRoot(a); root.add(mesh(new THREE.PlaneGeometry(0.8, 0.6), cardMat(tapestryTex()))); return { root, update: () => undefined }; }, steps: ["it shows"] },
    foundersBell: { name: "The founders' bell", desc: "the founders' bronze ship's bell (0.7 m) hanging in a wooden frame (3 m), its mouth 2 m up, `at` = the frame's centre (the frame runs along local x); variant tied (the clapper lashed with old rope: silenced) or free (the lashing cut, the bell rope hanging to 1.5 m); with free, each step is one swing of the bell", category: "theme", themes: ["fantasy", "sea", "history"], tags: ["bell", "ship's bell", "rope", "frame"], radius: 0.3, height: 3.1,
      build: () => undefined, rig: (a, v) => bellRig(a, v ?? "tied"), steps: ["it swings"], stepCount: () => 400, variants: { tied: () => undefined, free: () => undefined } },
    whaleEye: { name: "The whale's eye", desc: "the whale's eye (5 m across, in a mound of skin), `at` = its centre, facing +z; shut until its second step, then opening; then it looks about", category: "theme", themes: ["fantasy", "whale"], tags: ["eye", "whale", "awake"], radius: 3.3, height: 6,
      build: () => undefined, rig: (a) => eyeRig(a), steps: ["it opens"], stepCount: () => 400 },
    whaleTail: { name: "The whale's tail", desc: "the whale's tail flukes (24 m across), `at` = where it breaks the sea, facing +z; variant rest: its tips just out of the water (asleep); otherwise hidden until its first step, rising out over the next two with water streaming off, held, then slapping down after its fourth", category: "theme", themes: ["fantasy", "whale", "sea"], tags: ["tail", "flukes", "whale"], radius: 12, height: 12,
      build: () => undefined, rig: (a, v) => tailRig(a, v), steps: ["it rises"], stepCount: () => 400, variants: { rest: () => undefined } },
    whaleSea: { name: "Moving sea", desc: "the sea as a prop for the whaleRise set, `at` = [0, 0, 0]: variant rise (it drops from 0.5 m to 2.8 m below the old sea level over two steps, water pouring off the quay), glide (2.8 m down, rushing past: the city swimming) or calm; give it steady steps", category: "theme", themes: ["fantasy", "sea"], tags: ["sea", "water", "waves"], radius: 1, height: 0.1,
      build: () => undefined, rig: (a, v) => seaRig(a, v ?? "rise"), steps: ["it moves"], stepCount: () => 400, variants: { rise: () => undefined, glide: () => undefined, calm: () => undefined } },
    floodWater: { name: "Flood water on the quay", desc: "sea water spreading over the harbour quay (9 x 16 m), `at` = the quay's centre at its surface; rising to 0.4 m over three steps", category: "theme", themes: ["fantasy", "sea", "disaster"], tags: ["flood", "water", "sea"], radius: 0.05, height: 0.4,
      build: () => undefined, rig: (a) => floodRig(a), steps: ["it rises"], stepCount: () => 400 },
  },
  sets: {
    whaleCity: { id: "whaleCity", title: "The Whale City: the city on the whale's back, the square and the Fountain, the harbour, the sea all round", lights: ["day", "golden", "night"], build: whaleCityBuild(true) },
    whaleRise: { id: "whaleRise", title: "The Whale City without its sea (the whaleSea prop draws the moving sea)", lights: ["day", "golden", "night"], build: whaleCityBuild(false) },
  },
  layouts: { whaleCity: { spots: WC_SPOTS, views: WC_VIEWS }, whaleRise: { spots: WC_SPOTS, views: WC_VIEWS } },
  setMeta: {
    whaleCity: { name: "The Whale City", desc: "a harbour city on a sleeping whale's back in the open sea (sea at y 0): the cobbled square at the top (y 6.2, radius 20) with the Fountain (blowhole prop) at (0, 6.2, -3), the breath pole at (2.6, 6.2, -3.8), the town hall and its arcade to the north (z -16..-25), market stalls, lantern posts, houses round the square and terraces down the back; the stone quay on the +x flank toward the head (top y 1.3, z -54..-38); the whale's head toward -z with its mouth line (marks: fountain, pole, wren, gran, bell, market, mayor, crowd, hall, harbour, eye / views: square, aerial, harbour / lights: day, golden, night)", themes: ["fantasy", "sea", "town"], tags: ["whale", "city", "square", "harbour", "sea", "fountain"] },
    whaleRise: { name: "The Whale City (no sea)", desc: "the Whale City without its sea, for the whaleSea prop (the sea moving: rising, gliding past)", themes: ["fantasy", "sea"], tags: ["whale", "city"] },
  },
};
