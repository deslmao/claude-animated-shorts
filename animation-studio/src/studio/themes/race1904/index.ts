// Race 1904 theme (created for "The Worst Olympic Marathon Ever", Video 04): a hot, dusty country road through
// Missouri farmland (the 1904 St. Louis Olympic marathon course, stylised), a period motor car that a seated rider
// travels in, a stylised farm dog that chases a runner, apple trees, a finish banner and tape, and the race's people:
// Fred Lorz (Milo in a running kit), Thomas Hicks, Felix Carvajal, Len Taunyane, Jan Mashiani, Hicks's handlers, Gus as
// the organizer / official and Juno in 1904 dress. Reuse for any early-1900s sport, road, farm or race topic.
// The historical athletes are drawn plainly and respectfully: natural proportions, their own skin tones, the clothes the
// sources describe (Carvajal's long-sleeved shirt and trousers cut off at the knee), no invented insignia or numbers.
import * as THREE from "three";
import type { Theme } from "..";
import type { Look } from "../../characters/figure";
import type { Pen, P2 } from "../../characters/toon";
import { Batch, V, quad, quadUp } from "../../materials/geo";
import { ctex, rng } from "../../materials/paint";
import { dirtHD } from "../../materials/paint2";
import { At, frame, col, tex, box, cyl, sph, rbox } from "../../props/kit";
import { tree, fence, tufts, rock, flowers } from "../../props/nature";
import { well } from "../../props/outdoor";
import { textTexture } from "../../props/displays";
import { displayTextOk } from "../../props/displays";
import type { PropRig } from "../../props/registry";
import type { View } from "../../sets/types";
import type { Layout } from "../../sets/layouts";
import type { V3 } from "../../camera/keys";
import { clearOf } from "../../sets/clear";
import { fitShot, FitOpts } from "../../camera/framing";

const INK = "#3a2340";
const deg = Math.PI / 180;

// ---------------- characters ----------------
// Each athlete has one fixed silhouette + palette so he is recognisable in every shot: build, skin, hair, vest colour,
// shorts. Milo keeps his tuft and mustard (his signature) as Lorz.
const MILO_RUNNER: Look = {
  name: "Milo", build: "adult", skin: "#f5c9a0", seed: 3,
  hair: { style: "tuft", color: "#4a2f22" },
  top: { style: "tee", color: "#e9a93b" }, bare: { arms: true }, shorts: "#2f3448",
  legs: "#2f3448", shoes: "#3a2b20",
  eyes: { shock: 1.2 },
};
/** Thomas Hicks (USA), the official winner: lanky, side-parted brown hair, pale blue vest, navy shorts */
const HICKS: Look = {
  name: "Thomas Hicks", build: "lanky", skin: "#f0c8a8", seed: 41,
  hair: { style: "side", color: "#6b4226" },
  brow: { color: "#5a3a22", k: 1.1 },
  top: { style: "tee", color: "#cfe0f2" }, bare: { arms: true }, shorts: "#1f2c4a",
  legs: "#1f2c4a", shoes: "#2a201a",
};
/** Felix Carvajal (Cuba): small, black hair, a long-sleeved white shirt and dark trousers cut off at the knee, street
 *  shoes (as the sources describe his race clothes) */
const CARVAJAL: Look = {
  name: "Felix Carvajal", build: "petite", skin: "#d9a679", seed: 43,
  hair: { style: "short", color: "#1f1a24" },
  brow: { color: "#1f1a24", k: 1.2 },
  top: { style: "shirt", color: "#f6f1e6" }, shorts: "#3a3532",
  legs: "#3a3532", shoes: "#1f1a16",
};
/** Len Taunyane (South Africa, Tswana): a strong runner; close-cropped hair, green vest, cream shorts */
const TAUNYANE: Look = {
  name: "Len Taunyane", build: "adult", skin: "#7a4a2e", seed: 45,
  hair: { style: "buzz", color: "#1a1414" },
  brow: { color: "#1a1414", k: 1.1 },
  top: { style: "tee", color: "#3a7a4a" }, bare: { arms: true }, shorts: "#f2ece0",
  legs: "#f2ece0", shoes: "#2a201a",
};
/** Jan Mashiani (South Africa, Tswana): tall and lean; short hair, maroon vest, cream shorts */
const MASHIANI: Look = {
  name: "Jan Mashiani", build: "lanky", skin: "#6a3f28", seed: 47,
  hair: { style: "short", color: "#1a1414" },
  brow: { color: "#1a1414", k: 1.0 },
  top: { style: "tee", color: "#8c3b4a" }, bare: { arms: true }, shorts: "#f2ece0",
  legs: "#f2ece0", shoes: "#2a201a",
};
/** Hicks's handlers (two men in suits and bowler hats) */
const HANDLER_A: Look = {
  name: "Handler", build: "stout", skin: "#f3c9a8", seed: 51,
  hair: { style: "short", color: "#4a3426" }, moustache: { style: "thin", color: "#4a3426" },
  top: { style: "shirt", color: "#f2ece0" }, layer: { style: "blazer", color: "#5a4636" }, neck: { style: "tie", color: "#2f3448" },
  legs: "#4a4036", shoes: "#2a201a", hat: { style: "bowler", color: "#3a302a" },
};
const HANDLER_B: Look = {
  name: "Handler", build: "tall", skin: "#e9bf9a", seed: 53,
  hair: { style: "side", color: "#2a201a" },
  top: { style: "shirt", color: "#efe6d4" }, layer: { style: "blazer", color: "#3f3a4f" }, neck: { style: "tie", color: "#8c3b4a" },
  legs: "#3a3532", shoes: "#1f1a16", hat: { style: "bowler", color: "#2a2430" },
};
/** Gus as the race organizer / official (Edwardian): top hat, black frock coat, his red bow tie */
const GUS_OFFICIAL: Look = {
  name: "Gus", build: "stout", skin: "#ffe2c2", seed: 2,
  hair: { style: "horseshoe", color: "#bdb8b1" },
  brow: { color: "#6f6962", k: 1.7 },
  moustache: { style: "walrus", color: "#d3cec7" },
  top: { style: "shirt", color: "#f2ece0" },
  layer: { style: "longcoat", color: "#2e2a36", accent: "#c9c4b8" },
  neck: { style: "bowtie", color: "#c0353a" },
  legs: "#3a3532", shoes: "#2a201a",
  hat: { style: "tophat", color: "#2e2a36" },
};
/** Juno in 1904 dress: her bob, round glasses and teal (the boater's band) */
const JUNO_1904: Look = {
  name: "Juno", build: "tall", skin: "#c99067", seed: 6,
  hair: { style: "bob", color: "#211a26" },
  brow: { quirk: 3 },
  glasses: { style: "round", color: "#3a2340" },
  top: { style: "dress", color: "#b9a7d4" },
  legs: "#2f3448", shoes: "#3a2b2b",
  hat: { style: "boater", color: "#ead9a6", trim: "#23968a" },
};

// ---------------- props ----------------
const rod = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, a: V3, c: V3, r: number, seg = 8) => {
  const d = V(c[0] - a[0], c[1] - a[1], c[2] - a[2]), L = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
  b.add(new THREE.CylinderGeometry(r, r, L, seg), mat, m.clone().multiply(new THREE.Matrix4().compose(V((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2), q, V(1, 1, 1))));
};

/** a period motor car (an early-1900s open tourer): forward is local +z. High bench seat, brass lamps and trim,
 *  spoked wheels, a tiller-style steering wheel. The rider seat (left) is at local x -0.35, z -0.25, 0.55 m up */
export const CAR_SEAT: [number, number] = [-0.35, -0.25];
const WHEEL_R = 0.38;
const carBody = (b: Batch, m: THREE.Matrix4, broken = false) => {
  const paint = col("#8c2a2a"), dark = col("#3a2a2a"), brass = col("#d9a84a"), seat = col("#5a3b2a"), black = col("#22202a");
  rbox(b, paint, m, 0, 0.42, 0.05, 1.3, 0.42, 2.3, 0.08);                       // tub
  rbox(b, paint, m, 0, 0.42, 1.0, 1.0, 0.34, 0.75, 0.08);                        // bonnet
  box(b, brass, m, -0.42, 0.42, 0.42, 0.78, 1.38, 1.42);                         // radiator
  for (let i = 0; i < 6; i++) box(b, dark, m, -0.36, 0.36, 0.46 + i * 0.055, 0.47 + i * 0.055, 1.421, 1.425);
  rbox(b, seat, m, 0, 0.8, -0.5, 1.2, 0.28, 0.32, 0.06);                         // bench back (low: the rider reads over it)
  rbox(b, seat, m, 0, 0.84, -0.25, 1.2, 0.08, 0.5, 0.04);                        // seat cushion
  for (const s of [-1, 1]) {                                                       // black wing fenders over the wheels
    for (const z of [-0.8, 0.95]) box(b, black, m, s * 0.66 - 0.12, s * 0.66 + 0.12, 0.78, 0.82, z - 0.4, z + 0.4);
    box(b, black, m, s * 0.66 - 0.12, s * 0.66 + 0.12, 0.42, 0.45, -0.4, 0.55); // running board
    cyl(b, brass, m, s * 0.48, 0.8, 1.42, 0.09, 0.09, 0.14, 14, Math.PI / 2, 0);  // headlamps
  }
  rod(b, black, m, [0.35, 0.82, 0.25], [0.32, 1.25, -0.05], 0.025);               // steering column
  b.add(new THREE.TorusGeometry(0.17, 0.02, 6, 20), black, m.clone().multiply(new THREE.Matrix4().compose(V(0.32, 1.26, -0.06), new THREE.Quaternion().setFromAxisAngle(V(1, 0, 0), -1.1), V(1, 1, 1))));
  cyl(b, brass, m, -0.62, 1.0, 0.45, 0.05, 0.08, 0.25, 12, 0, -0.4);              // bulb horn
  sph(b, black, m, -0.66, 1.05, 0.38, 0.06, 0.06, 0.06, 10);
  if (broken) { // bonnet panel lifted and a steam cloud
    rbox(b, paint, m, 0.3, 0.9, 1.0, 0.5, 0.04, 0.7, 0.02, 0, 0, );
    for (const [x, y, z, r] of [[0, 1.0, 1.05, 0.22], [0.15, 1.25, 1.0, 0.28], [-0.1, 1.5, 0.95, 0.32], [0.08, 1.8, 0.9, 0.26]] as const) sph(b, col("#f4f1ea"), m, x, y, z, r, r * 0.85, r, 12);
  }
};
const wheel = (b: Batch, m: THREE.Matrix4) => {
  const tyre = col("#2a2626"), spoke = col("#c9a24a");
  b.add(new THREE.TorusGeometry(WHEEL_R - 0.04, 0.045, 8, 24).rotateY(Math.PI / 2), tyre, m);
  for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2; rod(b, spoke, m, [0, 0, 0], [0, Math.cos(a) * (WHEEL_R - 0.06), Math.sin(a) * (WHEEL_R - 0.06)], 0.012, 5); }
  cyl(b, spoke, m, -0.05, 0, 0, 0.06, 0.06, 0.1, 12, 0, Math.PI / 2);
};
const WHEELS: [number, number][] = [[-0.66, -0.8], [0.66, -0.8], [-0.66, 0.95], [0.66, 0.95]];
const motorCar = (b: Batch, a: At, broken = false) => {
  const m = frame(a); carBody(b, m, broken);
  for (const [x, z] of WHEELS) wheel(b, m.clone().multiply(new THREE.Matrix4().makeTranslation(x, WHEEL_R, z)));
};
const motorCarRig = (a: At, variant?: string): PropRig => {
  const root = new THREE.Group(), body = new THREE.Group(), b = new Batch();
  carBody(b, new THREE.Matrix4(), variant === "broken"); b.build(body, true); root.add(body);
  const wheels = WHEELS.map(([x, z]) => { const g = new THREE.Group(), wb = new Batch(); wheel(wb, new THREE.Matrix4()); wb.build(g, true); g.position.set(x, WHEEL_R, z); root.add(g); return g; });
  root.position.set(a.x, 0, a.z); root.rotation.y = a.yaw ?? 0; root.scale.setScalar(a.s ?? 1);
  return { root, update: ({ track }) => {
    if (!track) return;
    root.position.set(track.pos[0], 0, track.pos[2]); root.rotation.y = track.heading;
    for (const w of wheels) w.rotation.x = track.dist / WHEEL_R;
    body.position.y = track.speed > 0.2 ? 0.012 * Math.sin(track.dist * 9) : 0; // the old car rattles while it moves
  } };
};

/** a stylised farm dog (forward local +z): tan coat, white chest, dark floppy ears, open barking mouth */
type DogCoat = { coat: string; chest: string; ear: string };
const TAN: DogCoat = { coat: "#b07a4a", chest: "#f2e6d0", ear: "#5a3a26" };
/** a black-and-white collie coat: reads against dry golden grass (Video 04 chase) */
const COLLIE: DogCoat = { coat: "#2a2630", chest: "#f6f2ea", ear: "#1c1a22" };
const dogParts = (pal: DogCoat = TAN) => {
  const coat = col(pal.coat), chest = col(pal.chest), ear = col(pal.ear), nose = col("#22202a"), tongue = col("#e0707a");
  const body = new Batch(), head = new Batch(), jaw = new Batch(), tail = new Batch(), legs = [0, 1, 2, 3].map(() => new Batch()), I = new THREE.Matrix4();
  sph(body, coat, I, 0, 0, 0, 0.17, 0.16, 0.34, 16);
  sph(body, chest, I, 0, -0.04, 0.2, 0.12, 0.12, 0.13, 12);
  sph(head, coat, I, 0, 0, 0, 0.13, 0.12, 0.14, 14);
  sph(head, coat, I, 0, -0.03, 0.12, 0.07, 0.06, 0.1, 12);                       // snout
  sph(head, nose, I, 0, -0.01, 0.22, 0.03, 0.025, 0.025, 8);
  for (const s of [-1, 1]) { sph(head, ear, I, s * 0.11, 0.0, -0.02, 0.04, 0.1, 0.06, 10); sph(head, nose, I, s * 0.055, 0.04, 0.1, 0.018, 0.018, 0.012, 8); }
  sph(jaw, coat, I, 0, -0.02, 0.08, 0.055, 0.025, 0.08, 10);
  sph(jaw, tongue, I, 0, 0.0, 0.1, 0.035, 0.012, 0.06, 8);
  rod(tail, coat, I, [0, 0, 0], [0, 0.16, -0.14], 0.025, 6);
  legs.forEach((lb) => { rod(lb, coat, I, [0, 0, 0], [0, -0.2, 0], 0.035, 6); sph(lb, chest, I, 0, -0.21, 0.02, 0.04, 0.025, 0.05, 8); });
  return { body, head, jaw, tail, legs };
};
const LEG_AT: [number, number][] = [[-0.09, 0.2], [0.09, 0.2], [-0.09, -0.22], [0.09, -0.22]];
const dogStatic = (b: Batch, a: At, pal: DogCoat = TAN) => {
  const m = frame(a), P = dogParts(pal), put = (src: Batch, x: number, y: number, z: number) => {
    const g = new THREE.Group(); src.build(g, true); g.updateMatrixWorld(true);
    g.traverse((o) => { const me = o as THREE.Mesh; if (me.isMesh) b.add(me.geometry, me.material as THREE.Material, m.clone().multiply(new THREE.Matrix4().makeTranslation(x, y, z))); });
  };
  put(P.body, 0, 0.42, 0); put(P.head, 0, 0.6, 0.36); put(P.jaw, 0, 0.53, 0.38); put(P.tail, 0, 0.5, -0.32);
  LEG_AT.forEach(([x, z], i) => put(P.legs[i], x, 0.31, z));
};
const dogRig = (a: At, pal: DogCoat = TAN): PropRig => {
  const root = new THREE.Group(), P = dogParts(pal), grp = (src: Batch, x: number, y: number, z: number) => { const g = new THREE.Group(); src.build(g, true); g.position.set(x, y, z); root.add(g); return g; };
  const body = grp(P.body, 0, 0.42, 0), head = grp(P.head, 0, 0.6, 0.36), jaw = grp(P.jaw, 0, 0.53, 0.38), tail = grp(P.tail, 0, 0.5, -0.32);
  const legs = LEG_AT.map(([x, z], i) => grp(P.legs[i], x, 0.31, z));
  root.position.set(a.x, 0, a.z); root.rotation.y = a.yaw ?? 0; root.scale.setScalar(a.s ?? 1);
  return { root, update: ({ track }) => {
    if (!track) return;
    root.position.set(track.pos[0], 0, track.pos[2]); root.rotation.y = track.heading;
    const run = track.speed > 0.3, ph = track.dist / 0.9 * Math.PI * 2, t = track.t;
    // a bounding gallop: front legs together, back legs together, the body pitching between them
    legs.forEach((g, i) => { g.rotation.x = run ? 0.75 * Math.sin(ph + (i < 2 ? 0 : Math.PI)) : 0; });
    const bob = run ? 0.05 * Math.abs(Math.sin(ph)) : 0;
    body.position.y = 0.42 + bob; head.position.y = 0.6 + bob; jaw.position.y = 0.53 + bob; tail.position.y = 0.5 + bob;
    body.rotation.x = run ? 0.12 * Math.sin(ph) : 0;
    jaw.rotation.x = 0.35 + 0.3 * Math.max(0, Math.sin(t * 15));                   // barking
    tail.rotation.z = 0.5 * Math.sin(t * 12);
  } };
};

/** an apple tree: a short trunk, a round canopy, red apples (some windfalls on the grass) */
const appleTree = (b: Batch, a: At, h = 3.4) => {
  const m = frame(a), bark = col("#7a5233"), r = rng(Math.round((a.x * 13 + a.z * 7) * 10) % 10000 + 3);
  cyl(b, bark, m, 0, 0, 0, 0.16, 0.12, h * 0.42, 10);
  for (const [dx, dz, ang] of [[0.4, 0.1, 0.7], [-0.35, 0.2, -0.6], [0.05, -0.4, 0.5]] as const) rod(b, bark, m, [0, h * 0.38, 0], [dx, h * 0.62, dz], 0.06 + 0 * ang, 6);
  const leaf = [col("#5f8f3a"), col("#4f7f30"), col("#6f9a44")];
  for (let k = 0; k < 9; k++) {
    const az = r() * Math.PI * 2, d = 0.3 + r() * 0.75, y = h * 0.62 + (r() - 0.3) * 0.7, s = 0.55 + r() * 0.35;
    sph(b, leaf[k % 3], m, Math.cos(az) * d, y, Math.sin(az) * d, s, s * 0.85, s, 12);
  }
  sph(b, leaf[0], m, 0, h * 0.78, 0, 0.9, 0.7, 0.9, 14);
  for (let k = 0; k < 16; k++) {
    const az = r() * Math.PI * 2, d = 0.95 + r() * 0.35, y = h * 0.5 + r() * 0.9;
    sph(b, col("#d23a32"), m, Math.cos(az) * d, y, Math.sin(az) * d, 0.07, 0.07, 0.07, 8);
  }
  for (let k = 0; k < 5; k++) { const az = r() * Math.PI * 2, d = 0.6 + r() * 0.9; sph(b, col(k % 2 ? "#8a5a2c" : "#b8432e"), m, Math.cos(az) * d, 0.05, Math.sin(az) * d, 0.065, 0.055, 0.065, 8); }
};

/** a finish (or start) banner across the road: two posts 5.4 m apart, a cream banner with dark lettering (its text is
 *  the variant), red-white-blue bunting and a chalk line on the ground. Faces +z (the camera side) */
const archFace = new Map<string, THREE.Material>();
const finishArch = (b: Batch, a: At, text = "FINISH") => {
  const m = frame(a), post = col("#7a5233"), white = col("#f4f1ea");
  for (const x of [-2.7, 2.7]) box(b, post, m, x - 0.07, x + 0.07, 0, 3.3, -0.07, 0.07);
  box(b, post, m, -2.8, 2.8, 3.18, 3.3, -0.06, 0.06);
  let mat = archFace.get(text);
  if (!mat) { mat = new THREE.MeshLambertMaterial({ map: textTexture(text, "#2b1d3a", "#f3e6c8", false) }); archFace.set(text, mat); }
  box(b, col("#c9b892"), m, -1.62, 1.62, 2.38, 3.18, -0.03, -0.005);              // banner backing
  b.add(new THREE.PlaneGeometry(3.2, 0.8), mat, m.clone().multiply(new THREE.Matrix4().makeTranslation(0, 2.78, 0.001)));
  const flags = ["#c0353a", "#f4f1ea", "#2f4a7a"];
  for (let i = 0; i < 18; i++) {
    const x = -2.6 + (i + 0.5) * (5.2 / 18), y = 3.12 - 0.08 * Math.sin((Math.PI * (i + 0.5)) / 18);
    const g = new THREE.BufferGeometry().setFromPoints([V(x - 0.13, y, 0.08), V(x + 0.13, y, 0.08), V(x, y - 0.28, 0.08)]); g.computeVertexNormals();
    b.add(g, col(flags[i % 3]), m);
  }
  b.add(new THREE.PlaneGeometry(5.4, 0.1).rotateX(-Math.PI / 2).translate(0, 0.018, 0.3), white, m); // chalk line, just in front
};
/** the finish tape (a stepped rig: step 1 = the winner breaks it, the halves fall to the posts). Across local x */
const tapeRig = (a: At): PropRig => {
  const root = new THREE.Group(), white = col("#f6f2ea"), mk = (w: number) => new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.01), white);
  const whole = mk(5.3); whole.position.set(0, 1.15, 0.3); root.add(whole);
  const halves = [-1, 1].map((s) => { const g = new THREE.Group(), h = mk(2.6); h.position.set(-s * 1.3, 0, 0); g.add(h); g.position.set(s * 2.65, 1.15, 0.3); g.visible = false; root.add(g); return g; });
  root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0;
  return { root, update: ({ step = 0 }) => {
    const k = Math.min(1, step); whole.visible = k <= 0;
    halves.forEach((g, i) => { g.visible = k > 0; g.rotation.z = (i ? 1 : -1) * k * 1.35; });
  } };
};
const tapeStatic = (b: Batch, a: At) => { box(b, col("#f6f2ea"), frame(a), -2.65, 2.65, 1.125, 1.175, 0.295, 0.305); };

/** an arrow-shaped direction sign on a post (points local +x); the variant is its text, e.g. COURSE */
const arrowFace = new Map<string, THREE.Material>();
const arrowSign = (b: Batch, a: At, text = "COURSE") => {
  const m = frame(a), wood = col("#7a5233");
  box(b, wood, m, -0.05, 0.05, 0, 1.75, -0.05, 0.0);
  const shape = new THREE.Shape([[-0.7, -0.22], [0.45, -0.22], [0.45, -0.38], [0.85, 0], [0.45, 0.38], [0.45, 0.22], [-0.7, 0.22]].map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false }); g.translate(0, 1.55, 0.0);
  b.add(g, col("#f3e6c8"), m);
  let mat = arrowFace.get(text);
  if (!mat) { mat = new THREE.MeshLambertMaterial({ map: textTexture(text, "#2b1d3a", "#f3e6c8", false) }); arrowFace.set(text, mat); }
  b.add(new THREE.PlaneGeometry(1.1, 0.55), mat, m.clone().multiply(new THREE.Matrix4().makeTranslation(-0.12, 1.55, 0.052)));
};

/** a modern race water table: a folding table with rows of paper cups */
const waterTable = (b: Batch, a: At) => {
  const m = frame(a), top = col("#f4f4f0"), leg = col("#9aa0a6");
  box(b, top, m, -0.9, 0.9, 0.72, 0.76, -0.35, 0.35);
  for (const [x, z] of [[-0.82, -0.28], [0.82, -0.28], [-0.82, 0.28], [0.82, 0.28]]) box(b, leg, m, x - 0.02, x + 0.02, 0, 0.72, z - 0.02, z + 0.02);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) cyl(b, col(j === 1 ? "#e9f3fb" : "#f8fbff"), m, -0.7 + i * 0.2, 0.76, -0.18 + j * 0.18, 0.04, 0.05, 0.11, 10);
};

// ---------------- hand-held items ----------------
const ol = (u: number) => 3.0 * u;
const R = (cx: number, cy: number, w: number, h: number): P2[] => [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
const egg = (p: Pen, x: number, y: number, u: number) => {
  p.ell(x, y - 12 * u, 9 * u, 12 * u, "#f6efe0", ol(u));
  p.ell(x - 3 * u, y - 16 * u, 2.5 * u, 3.5 * u, "#ffffff", 0);
};
const vial = (p: Pen, x: number, y: number, u0: number) => {
  // a brown glass medicine vial with a cork and a paper label lettered STRYCHNINE (drawn large so the label reads in an
  // insert)
  const u = u0 * 1.55;
  p.poly([[x - 7 * u, y + 4 * u], [x + 7 * u, y + 4 * u], [x + 7 * u, y - 18 * u], [x + 3 * u, y - 22 * u], [x + 3 * u, y - 26 * u], [x - 3 * u, y - 26 * u], [x - 3 * u, y - 22 * u], [x - 7 * u, y - 18 * u]], "#7a4a24", ol(u0));
  p.poly(R(x, y - 28 * u, 7 * u, 5 * u), "#c9a272", 1.5 * u0);
  p.poly(R(x, y - 7 * u, 13.4 * u, 10 * u), "#f3e6c8", 1.2 * u0);
  const g = p.g; g.save(); g.fillStyle = INK; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `bold ${1.72 * u}px 'DejaVu Sans', 'Liberation Sans', Arial, sans-serif`; g.fillText("STRYCHNINE", x, y - 7 * u); g.restore();
};
const hipFlask = (p: Pen, x: number, y: number, u: number) => {
  p.poly([[x - 9 * u, y + 4 * u], [x + 9 * u, y + 4 * u], [x + 10 * u, y - 16 * u], [x + 4 * u, y - 20 * u], [x - 4 * u, y - 20 * u], [x - 10 * u, y - 16 * u]], "#c9ccd2", ol(u));
  p.poly(R(x, y - 23 * u, 6 * u, 5 * u), "#8a8f96", 1.5 * u);
  p.poly([[x - 6 * u, y - 14 * u], [x - 3 * u, y - 14 * u], [x - 3 * u, y], [x - 6 * u, y]], "#eef0f3", 0);
};
const appleRotten = (p: Pen, x: number, y: number, u: number) => {
  p.ell(x, y - 10 * u, 11 * u, 10 * u, "#9a5a2c", ol(u));
  for (const [dx, dy, r] of [[-4, -13, 3], [4, -7, 2.4], [1, -15, 1.6], [-5, -6, 1.8]] as const) p.ell(x + dx * u, y + dy * u, r * u, r * u, "#4a2e18", 0);
  p.ell(x + 8 * u, y - 10 * u, 4 * u, 6 * u, "#e8d6a8", 1.2 * u); // a bite
  p.stroke([[x, y - 19 * u], [x + 2 * u, y - 25 * u]], 2.2 * u);
};

// ---------------- set: the race road ----------------
// A dirt road along x (from x -46 to 46), its centre line z = zc(x), gently curving. Locations along it, left to right:
// the start banner (x -28), the mile-9 stretch (-17), the well (-8), the orchard bend (0..8), the farm field where the
// dog waits (8..16), the mile-20 stretch (18) and the finish (30). The camera side is +z.
export const zc = (x: number) => 0.5 * Math.sin(0.12 * x);
const road = (x: number, off = 0): V3 => [x, 0, Math.round((zc(x) + off) * 1000) / 1000];
const RR = {
  start: road(-28), startL: road(-28, -0.9), startR: road(-28, 0.9), startB: road(-29.2, -0.4), startC: road(-29.2, 0.5),
  mile9: road(-17), pickup: road(-15.6, 0.4), carEnd: road(-2, 0.4), lorzOut: road(18.6, 0.9),
  well: [-8, 0, -3.4] as V3, wellSide: road(-9.4, -1.6), wellRoad: road(-7, 0),
  orchardRoad: road(0.5), napSpot: [2.6, 0, -3.3] as V3, appleTree: [3.6, 0, -4.9] as V3,
  taunA: road(6), field: [12.8, 0, -9.2] as V3, dogGap: road(10.4, -2.9),
  mile20: road(18), carStop: road(19.5, 0.4),
  finishIn: road(25.5), finish: road(30), past: road(32.5), board: road(32.6, -2.15), officials: road(31.2, -2.0),
  // generic marks (validators and helpers expect a, b, c)
  a: road(-1, 0), b: road(0.2, -0.3), c: road(1.4, 0.3),
};
const fit = (name: string, marks: V3[], o: FitOpts, extra: Partial<View> = {}): View => ({ name, ...fitShot(marks, o), ...extra });
const ROAD_LAYOUT: Layout = {
  spots: RR,
  views: [
    { name: "road wide", pos: [-4, 2.4, 13], look: [-4, 1.0, -6], fov: 48, establishing: true },
    { name: "start", pos: [-24.5, 2.0, 9], look: [-28.5, 1.4, -1], fov: 46, establishing: true },
    { name: "well", pos: [-5.6, 1.5, 3.4], look: [-8.2, 1.1, -3.2], fov: 42, cInf: 6 },
    { name: "orchard", pos: [5.6, 1.6, 2.8], look: [2.6, 1.0, -4.0], fov: 44, cInf: 6 },
    { name: "field high", pos: [9.5, 6.5, 8.5], look: [12.5, 0.6, -5.5], fov: 48, establishing: true },
    { name: "finish", pos: [26.5, 1.7, 7.5], look: [30.5, 1.6, -1], fov: 46, establishing: true },
    fit("finish low", [RR.finish], { size: "medium", from: 8, height: 0.9, fov: 38 }, { cInf: 10 }),
  ],
};
const dryGrassTex = () => ctex("dryGrass1904", 1024, 1024, (g, r) => {
  g.fillStyle = "#b8a95e"; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 5200; i++) {
    const x = r() * 1024, y = r() * 1024, l = 6 + r() * 14, c = r();
    g.strokeStyle = c < 0.35 ? "rgba(140,128,62,0.55)" : c < 0.7 ? "rgba(212,196,120,0.5)" : "rgba(122,140,70,0.45)";
    g.lineWidth = 1.2 + r() * 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 5, y - l); g.stroke();
  }
});
const raceRoad = (cams?: View[]) => {
  const root = new THREE.Group(), b = new Batch(), r = rng(1904), I = new THREE.Matrix4();
  const views = ROAD_LAYOUT.views, all = cams ? [...views, ...cams] : views;
  const marks = Object.values(RR);
  const free = (x: number, z: number, rad: number, near = 6) => clearOf(all, x, z, rad, near) && marks.every((p) => Math.hypot(p[0] - x, p[2] - z) > rad + 0.6);
  // ground: dry late-summer grass; distant rolling hills (fog pushes them back)
  b.add(quadUp(-600, 600, -600, 600, 160, 160), tex("dryGrass1904", dryGrassTex, 1, 1));
  const hill = tex("dryGrass1904h", dryGrassTex, 14, 6);
  for (const [x, z, rx, ry, rz] of [[-80, -110, 80, 14, 40], [30, -140, 100, 20, 50], [130, -95, 70, 12, 40], [-150, -70, 60, 10, 40], [0, -220, 160, 26, 60]] as const) {
    const mm = new THREE.Matrix4().compose(V(x, -ry * 0.25, z), new THREE.Quaternion(), V(rx, ry, rz));
    b.add(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), hill, mm);
  }
  // the dirt road (3.4 m wide) with two darker wheel ruts
  const dirt = tex("dirt1904", dirtHD, 1, 1), rut = col("#9a7a52");
  for (let x = -46; x < 46; x += 2) {
    const strip = (o0: number, o1: number, y: number, mat: THREE.Material) => b.add(quad(V(x, y, zc(x) + o1), V(x + 2, y, zc(x + 2) + o1), V(x + 2, y, zc(x + 2) + o0), V(x, y, zc(x) + o0), 0.6, 0.6), mat);
    strip(-1.7, 1.7, 0.012, dirt);
    strip(-0.75, -0.55, 0.016, rut); strip(0.55, 0.75, 0.016, rut);
  }
  // rail fences along the far side of the road, with gaps at the well, the orchard and the field gate
  for (let x = -44; x < 44; x += 6) {
    const cx = x + 3; if ((cx > -11 && cx < -5) || (cx > -1 && cx < 9) || (cx > 9 && cx <= 13) || (cx > 24 && cx < 36)) continue; // gaps: the well, the orchard, the field gate (10..16), the finish
    if (free(cx, zc(cx) - 2.9, 0.4, 4)) fence(b, { x: cx, z: zc(cx) - 2.9, yaw: -Math.atan(0.06 * Math.cos(0.12 * cx)) }, 6, 1.0, "#9a7048");
  }
  // telegraph poles behind the fence
  for (let x = -42; x <= 42; x += 12) { const z = zc(x) - 4.6; if (!free(x, z, 0.4, 3)) continue; cyl(b, col("#6b5236"), I, x, 0, z, 0.1, 0.08, 7, 8); box(b, col("#6b5236"), frame({ x, z }), -0.7, 0.7, 6.4, 6.55, -0.05, 0.05); }
  // the well (the race's one water stop) with a bucket on its rim
  well(b, { x: RR.well[0], z: RR.well[2] });
  cyl(b, col("#8a6a44"), I, RR.well[0] + 0.55, 0.85, RR.well[2] + 0.3, 0.14, 0.17, 0.24, 12);
  // the orchard bend: apple trees in the grass behind the road
  for (const [x, z, h] of [[3.6, -4.9, 3.4], [7.4, -6.6, 3.2], [0.2, -7.4, 3.6], [5.0, -10.4, 3.3], [9.6, -10.0, 3.0], [-2.4, -11.2, 3.4]] as const) if (Math.hypot(x - RR.appleTree[0], z - RR.appleTree[2]) < 0.1 || free(x, z, 1.0, 4)) appleTree(b, { x, z }, h);
  // the farm field beyond the gate: rows of corn
  const stalk = col("#8a9a42"), leaf = col("#a8b04a"), tassel = col("#d9c06a");
  for (let row = 0; row < 14; row++) for (let k = 0; k < 26; k++) {
    const x = 14.5 + k * 0.62 + (r() - 0.5) * 0.15, z = -6.2 - row * 0.9 + (r() - 0.5) * 0.15, h = 1.7 + r() * 0.5;
    if (!free(x, z, 0.25, 3)) continue;
    cyl(b, stalk, I, x, 0, z, 0.03, 0.02, h, 5);
    for (const [ly, a] of [[0.6, 0.7], [1.0, -0.9], [1.35, 2.2]] as const) rod(b, leaf, I, [x, h * ly * 0.6 + 0.1, z], [x + Math.cos(a) * 0.35, h * ly * 0.6 + 0.3, z + Math.sin(a) * 0.35], 0.03, 4);
    cyl(b, tassel, I, x, h, z, 0.03, 0.0, 0.18, 5);
  }
  // a red barn and a white farmhouse far back on the left, groves on the hills
  const barnM = frame({ x: -22, z: -28, yaw: 0.25 });
  box(b, col("#a8322e"), barnM, -4, 4, 0, 4.2, -3, 3);
  const roofG = new THREE.CylinderGeometry(3.4, 3.4, 8.2, 3, 1, false).rotateZ(Math.PI / 2).rotateX(Math.PI / 6).scale(1, 0.6, 1.05).translate(0, 4.7, 0);
  b.add(roofG, col("#5a3b3b"), barnM);
  box(b, col("#f4f1ea"), barnM, -1.2, 1.2, 0, 2.6, 3.0, 3.02);
  const houseM = frame({ x: -33, z: -36, yaw: 0.1 });
  box(b, col("#efe6d4"), houseM, -3, 3, 0, 3.4, -2.5, 2.5);
  b.add(new THREE.ConeGeometry(4.6, 2.2, 4).rotateY(Math.PI / 4).scale(1, 1, 0.8).translate(0, 4.5, 0), col("#4a4a52"), houseM);
  for (const [x, z, k, h] of [[-40, -24, "round", 8], [-12, -40, "fat", 9], [16, -34, "round", 8], [34, -24, "tall", 10], [44, -38, "round", 9], [-48, -12, "fat", 8], [26, -46, "cone", 10], [-4, -52, "round", 9]] as const)
    if (free(x, z, h * 0.3, 8)) tree(b, k as "round", x, 0, z, h, x * 7 + z * 3, 0);
  // the near side: grass tufts, wild flowers and stones on the verge (low, never in front of the lens)
  for (let i = 0; i < 40; i++) { const x = -44 + r() * 88, z = zc(x) + 2.2 + r() * 6; if (free(x, z, 0.6)) tufts(b, { x, z }, 6, 1.0, i + 2); }
  for (let i = 0; i < 12; i++) { const x = -44 + r() * 88, z = zc(x) - 4.8 - r() * 4; if (free(x, z, 0.8)) flowers(b, { x, z }, 8, 1.2, i + 5); }
  for (let i = 0; i < 10; i++) { const x = -44 + r() * 88, z = zc(x) + (r() < 0.5 ? -3.5 : 2.4); if (free(x, z, 0.4)) rock(b, { x, z }, 0.25 + r() * 0.25, i); }
  // the finish: a white spectator rail on the far side
  for (const x of [26, 32]) fence(b, { x, z: zc(x) - 3.3 }, 6, 1.0, "#f4f1ea");
  b.build(root, true);
  // a hot afternoon sun from behind the camera's right shoulder (the golden preset is a sunset backlight): faces lit
  return { root, env: {}, spots: RR, views, sun: { az: 125, el: 30 } };
};

export const RACE1904: Theme = {
  id: "race1904", name: "Race day, 1904", desc: "a hot, dusty 1904 country road race: the race road set (start / finish banners, a well, an orchard, a corn field), a period motor car a rider travels in, a stylised farm dog that chases a runner, apple trees, a finish tape, the 1904 marathon's runners, handlers, officials and Juno in 1904 dress",
  tags: ["1904", "olympics", "marathon", "race", "running", "history", "sport", "edwardian", "farm", "road", "car", "dog"],
  mood: "playful",
  ambience: { raceRoad: "amb_nature_day" },
  steps: { raceRoad: "step_grass" },
  characters: { miloRunner: MILO_RUNNER, hicks: HICKS, carvajal: CARVAJAL, taunyane: TAUNYANE, mashiani: MASHIANI, handlerA: HANDLER_A, handlerB: HANDLER_B, gusOfficial: GUS_OFFICIAL, juno1904: JUNO_1904 },
  characterMeta: {
    miloRunner: { name: "Milo (1904 runner)", desc: "Milo in a 1904 running kit: mustard sleeveless vest, navy knee shorts (outfit of milo)", personality: "as Milo; plays Fred Lorz in Video 04", themes: ["history", "sport", "1904"], tags: ["lead", "runner", "athlete", "as Milo"], outfitOf: "milo" },
    hicks: { name: "Thomas Hicks", desc: "lanky; side-parted brown hair; pale blue sleeveless vest; navy knee shorts", personality: "the exhausted official winner of the 1904 Olympic marathon (real person, 1875-1952)", themes: ["history", "sport", "1904"], tags: ["runner", "athlete", "real person", "olympics", "marathon", "male"] },
    carvajal: { name: "Felix Carvajal", desc: "small; black hair; long-sleeved white shirt; dark trousers cut off at the knee; street shoes", personality: "cheerful Cuban runner who finished 4th in 1904 (real person)", themes: ["history", "sport", "1904"], tags: ["runner", "athlete", "real person", "olympics", "marathon", "male", "cuba"] },
    taunyane: { name: "Len Taunyane", desc: "close-cropped hair; green sleeveless vest; cream knee shorts", personality: "Tswana runner from South Africa, 9th in the 1904 Olympic marathon (real person)", themes: ["history", "sport", "1904"], tags: ["runner", "athlete", "real person", "olympics", "marathon", "male", "south africa"] },
    mashiani: { name: "Jan Mashiani", desc: "tall and lean; short hair; maroon sleeveless vest; cream knee shorts", personality: "Tswana runner from South Africa, 12th in the 1904 Olympic marathon (real person)", themes: ["history", "sport", "1904"], tags: ["runner", "athlete", "real person", "olympics", "marathon", "male", "south africa"] },
    handlerA: { name: "Handler (stout)", desc: "stout; thin moustache; brown jacket; tie; bowler hat", personality: "a runner's handler / trainer, 1900s (not a real person)", themes: ["history", "sport", "1904", "victorian"], tags: ["trainer", "handler", "helper", "male"] },
    handlerB: { name: "Handler (tall)", desc: "tall; dark side-parted hair; grey jacket; tie; bowler hat", personality: "a runner's handler / trainer, 1900s (not a real person)", themes: ["history", "sport", "1904", "victorian"], tags: ["trainer", "handler", "helper", "male"] },
    gusOfficial: { name: "Gus (official)", desc: "Gus as an Edwardian race official: top hat, black frock coat, red bow tie (outfit of gus)", personality: "as Gus; the organizer / official", themes: ["history", "sport", "1904", "victorian"], tags: ["lead", "official", "organizer", "judge", "as Gus"], outfitOf: "gus" },
    juno1904: { name: "Dr. Juno Park (1904)", desc: "Juno in 1904 dress: lavender dress, straw boater with a teal band, round glasses (outfit of juno)", personality: "as Juno; the 'You see' explanation", themes: ["history", "1904", "victorian"], tags: ["lead", "explainer", "female", "as Juno"], outfitOf: "juno" },
  },
  props: {
    motorCar1904: { name: "Motor car (1900s)", desc: "an early-1900s open motor car: high bench seat, brass lamps and radiator, spoked wheels (forward = +z). A rider travels in it with track (the rider seat is at offset [0.35, 0.25] from the car: use track { who, offset: [0.35, 0.25] } on the rider, who sits at y 0.55 and walks with mode \"ride\"); variants: running, broken (bonnet up, steam)", category: "theme", themes: ["history", "1904", "edwardian", "car"], tags: ["car", "automobile", "motor", "vehicle", "drive", "ride", "1900s"], radius: 1.3, height: 1.6, box: [0.75, 1.3],
      build: (b, a) => motorCar(b, a), variants: { running: (b, a) => motorCar(b, a), broken: (b, a) => motorCar(b, a, true) }, rig: motorCarRig },
    farmDog: { name: "Farm dog (stylised)", desc: "a tan farm dog with a white chest and floppy ears; animated with track (it gallops after the actor, barking): track { who, behind: 1.4 }", category: "theme", themes: ["history", "farm", "nature", "any"], tags: ["dog", "animal", "pet", "chase", "bark", "farm"], radius: 0.4, height: 0.75,
      build: (b, a) => dogStatic(b, a), rig: (a) => dogRig(a) },
    farmDogCollie: { name: "Farm dog (collie, black and white)", desc: "the stylised farm dog with a black-and-white collie coat: high contrast on dry grass or dirt; animated with track like farmDog (track { who, behind })", category: "theme", themes: ["history", "farm", "nature", "any"], tags: ["dog", "animal", "pet", "chase", "bark", "farm", "collie"], radius: 0.4, height: 0.75,
      build: (b, a) => dogStatic(b, a, COLLIE), rig: (a) => dogRig(a, COLLIE) },
    appleTree: { name: "Apple tree", desc: "an orchard apple tree (~3.4 m) with red apples and windfalls on the grass", category: "nature", themes: ["nature", "farm", "history", "any"], tags: ["tree", "apple", "orchard", "fruit", "farm"], radius: 1.4, height: 3.6, build: (b, a) => appleTree(b, a) },
    finishArch: { name: "Finish banner", desc: "a race banner across a road on two posts 5.4 m apart (top 3.3 m), red-white-blue bunting, a chalk line; the variant is the banner text (FINISH, START, ST. LOUIS 1904...)", category: "theme", themes: ["sport", "history", "1904", "race"], tags: ["finish", "start", "race", "banner", "line", "marathon"], radius: 2.8, height: 3.3, box: [2.8, 0.12],
      build: (b, a, v) => finishArch(b, a, v), param: { desc: "banner text (1-18 letters, digits, spaces, . , : ! ? ' - $ % # & + /)", ok: displayTextOk } },
    finishTape: { name: "Finish tape", desc: "a white finish tape across the road (5.3 m, 1.15 m high, along local x, 0.3 m in front of the banner): step 1 = the winner breaks it", category: "theme", themes: ["sport", "race"], tags: ["finish", "tape", "win", "race"], radius: 2.7, height: 1.2, box: [2.7, 0.05],
      build: tapeStatic, rig: tapeRig, steps: ["the winner breaks the tape"] },
    arrowSign: { name: "Arrow sign", desc: "an arrow-shaped direction sign on a post (the arrow points local +x; yaw it); the variant is its text (COURSE, THIS WAY, MILE 9...)", category: "street", themes: ["any", "sport", "road", "history"], tags: ["sign", "arrow", "direction", "way", "course", "text"], radius: 0.6, height: 1.95, box: [0.85, 0.06], focus: { y: 1.55, span: 1.3 },
      build: (b, a, v) => arrowSign(b, a, v), param: { desc: "sign text (1-18 letters, digits, spaces, . , : ! ? ' - $ % # & + /)", ok: displayTextOk } },
    waterTable: { name: "Water table", desc: "a modern race water station: a folding table with rows of paper cups (0.76 m high)", category: "street", themes: ["modern", "sport", "race"], tags: ["water", "drink", "race", "marathon", "station", "cups"], radius: 0.95, height: 0.9, box: [0.9, 0.36], build: waterTable },
  },
  items: {
    egg: { name: "Egg", desc: "a white hen's egg", themes: ["food", "history", "farm"], tags: ["egg", "food", "breakfast", "cook"], draw: (p, x, y, u) => egg(p, x, y, u) },
    vial: { name: "Medicine vial (strychnine)", desc: "a small brown glass medicine vial with a cork and a label lettered STRYCHNINE", themes: ["history", "medicine", "1904"], tags: ["medicine", "poison", "drug", "vial", "bottle", "strychnine", "stimulant"], draw: (p, x, y, u) => vial(p, x, y, u) },
    hipFlask: { name: "Hip flask", desc: "a pewter hip flask (brandy, whisky)", themes: ["history", "drink"], tags: ["drink", "flask", "brandy", "alcohol"], draw: (p, x, y, u) => hipFlask(p, x, y, u) },
    appleRotten: { name: "Rotten apple", desc: "a brown, spotted, bitten apple", themes: ["food", "farm", "history"], tags: ["apple", "rotten", "food", "sick", "fruit"], draw: (p, x, y, u) => appleRotten(p, x, y, u) },
  },
  sets: { raceRoad: { id: "raceRoad", title: "Race road, 1904: a dusty country road with a start / finish, a well, an orchard and a corn field", lights: ["golden", "day"], build: raceRoad } },
  layouts: { raceRoad: ROAD_LAYOUT },
  setMeta: { raceRoad: { name: "Race road (1904)", desc: "a hot, dusty dirt road through farmland running across the frame (x -46..46): start banner area (x -28), a well (the water stop, x -8), an orchard bend with apple trees (0..8), a farm gate and corn field (8..24), the finish area with a spectator rail (30). Rail fences and telegraph poles along the far side, a red barn and farmhouse on the hills (marks: start, startL, startR, startB, startC, mile9, pickup, carEnd, well, wellSide, wellRoad, orchardRoad, napSpot, appleTree, taunA, field, dogGap, mile20, carStop, lorzOut, finishIn, finish, past, board, officials / views: road wide, start, well, orchard, field high, finish, finish low / lights: golden, day)", themes: ["history", "1904", "sport", "farm", "nature"], tags: ["outdoor", "road", "race", "marathon", "farm", "countryside", "field", "orchard", "well", "dust"] } },
};
void deg;
