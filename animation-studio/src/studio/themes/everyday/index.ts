// Everyday theme (created for "Why you forget why you walked into a room", Video 03): a two-room apartment where a
// real doorway separates the living room from the kitchen, house keys (held, and in a bowl on the coffee table), a
// toaster, and a thought bubble that can stay behind in a room. Reuse for any home / psychology / habits topic.
import * as THREE from "three";
import type { Theme } from "..";
import { Pen } from "../../characters/toon";
import { Batch } from "../../materials/geo";
import { wallpaperHD, plasterHD } from "../../materials/paint2";
import { At, frame, col, tex, glow, box, rbox, cyl, lathe } from "../../props/kit";
import { sofa, armchair, coffeeTable, rug, bookshelf, floorLamp, plant, picture, clock, curtains, counter, fridge, stove, floorMat, wallShelf, chair, pendant } from "../../props/interior";
import { buildRoom } from "../../sets/room";
import type { View } from "../../sets/types";
import type { PropRig } from "../../props/registry";
import { drawKeys, drawThought } from "../../fx/thought";

type V3 = [number, number, number];

// ---------------- the apartment ----------------
// One room shell 10 m wide, split at x = 0 by a partition wall with a doorway (z -0.95..0.05, 2.11 m high): the living
// room on the left (x < 0), the kitchen on the right (x > 0). The front door is on the far left wall. The camera side
// (+z) is open, so a wide front view shows both rooms side by side with the doorway between them.
const DOOR_Z0 = -0.95, DOOR_Z1 = 0.05, DOOR_H = 2.11, WALL_END = 1.3, BZ = -2.6;
const APT_LAYOUT = {
  ceiling: 2.8,
  spots: {
    sofa: [-2.6, 0, -1.25] as V3, livingA: [-2.0, 0, -0.35] as V3, livingB: [-3.2, 0, 0.1] as V3, table: [-2.6, 0, -0.55] as V3,
    doorL: [-0.75, 0, -0.45] as V3, doorway: [0, 0, -0.45] as V3, doorR: [0.75, 0, -0.45] as V3,
    kitchenA: [2.3, 0, -0.5] as V3, fridge: [3.95, 0, -1.95] as V3, counter: [4.05, 0, -0.45] as V3, toaster: [4.05, 0, -0.9] as V3,
    frontDoor: [-4.45, 0, 0.75] as V3,
  },
  views: [
    { name: "dollhouse", pos: [0, 2.3, 10.8], look: [0, 1.15, -0.8], fov: 48, establishing: true },
    { name: "living", pos: [-2.4, 1.5, 4.6], look: [-2.4, 1.0, -1.0], fov: 44 },
    { name: "kitchen", pos: [2.6, 1.5, 4.6], look: [3.0, 1.0, -1.0], fov: 44 },
    { name: "doorway", pos: [-2.8, 1.5, 1.6], look: [0, 1.1, -0.45], fov: 40 },
  ] as View[],
};

const apartment = () => {
  const root = new THREE.Group(), b = new Batch();
  const paper = tex("wpApt", () => wallpaperHD("#f1d9a7", "#cf9a5c", "stripe"), 1, 1);
  buildRoom(root, {
    w: 10, d: 5.2, h: 2.8, floor: floorMat(), wall: paper,
    lower: tex("dadoApt", () => plasterHD("#86a9c4"), 1, 1), lowerH: 0.95, trim: "#f6efe2",
    openings: [
      { wall: "back", at: -2.6, w: 1.6, h: 1.35, sill: 0.95, view: "garden" },
      { wall: "left", at: 0.75, w: 0.95, h: 2.1, sill: 0, kind: "door" },
      { wall: "right", at: -0.9, w: 1.1, h: 1.0, sill: 1.25, view: "city" },
    ],
  });
  // the partition wall with the doorway (both faces papered; a painted dado band like the outer walls)
  const I = frame({ x: 0, z: 0 }), dado = tex("dadoApt", () => plasterHD("#86a9c4"), 1, 1), trim = col("#f6efe2");
  const T = 0.07, top = 2.796;
  for (const [z0, z1] of [[BZ + 0.002, DOOR_Z0], [DOOR_Z1, WALL_END]] as [number, number][]) {
    box(b, paper, I, -T, T, 0.951, top, z0, z1);
    box(b, dado, I, -T, T, 0.001, 0.95, z0, z1);
  }
  box(b, paper, I, -T, T, DOOR_H, top, DOOR_Z0, DOOR_Z1);                               // lintel
  // door frame: jambs and head stand slightly proud of both faces and reach 1 cm into the opening
  box(b, trim, I, -0.1, 0.1, 0.001, DOOR_H + 0.09, DOOR_Z0 - 0.08, DOOR_Z0 + 0.01);
  box(b, trim, I, -0.1, 0.1, 0.001, DOOR_H + 0.09, DOOR_Z1 - 0.01, DOOR_Z1 + 0.08);
  box(b, trim, I, -0.1, 0.1, DOOR_H - 0.01, DOOR_H + 0.09, DOOR_Z0 - 0.08, DOOR_Z1 + 0.08);
  box(b, trim, I, -0.095, 0.095, 0.951, 0.985, BZ + 0.004, DOOR_Z0 - 0.081);           // dado rail, back segment
  box(b, trim, I, -0.095, 0.095, 0.951, 0.985, DOOR_Z1 + 0.081, WALL_END - 0.002);     // dado rail, front segment
  // the kitchen floor: cool tiles on the right half (a thin slab above the boards, so never coplanar)
  box(b, col("#d9e3e6"), I, T + 0.001, 4.998, 0.001, 0.008, BZ + 0.002, 2.6);
  for (let x = 0.6; x < 5; x += 0.6) box(b, col("#b9c7cc"), I, x - 0.006, x + 0.006, 0.008, 0.0095, BZ + 0.002, 2.6);
  for (let z = BZ + 0.6; z < 2.6; z += 0.6) box(b, col("#b9c7cc"), I, T + 0.001, 4.998, 0.008, 0.0095, z - 0.006, z + 0.006);

  // living room (left)
  curtains(b, { x: -2.6, z: BZ + 0.02, y: 0.65 }, 2.1, 2.0, "#c25a7a");
  sofa(b, { x: -2.6, z: BZ + 0.62 }, "#4f7cac", 2.1);
  rug(b, { x: -2.6, z: -0.75 }, 2.8, 1.9);
  coffeeTable(b, { x: -2.6, z: -0.75 });
  armchair(b, { x: -4.25, z: -0.55, yaw: 0.9 }, "#c06c4a");
  bookshelf(b, { x: -4.55, z: BZ + 0.2 }, 0.8, 2.1, 3);
  floorLamp(b, { x: -3.95, z: BZ + 0.45 });
  plant(b, { x: -1.0, z: BZ + 0.4 }, 1.2, "#c8643f", 4);
  picture(b, { x: -1.35, z: BZ + 0.01, y: 1.85 }, 0.5, 0.4, 0);
  clock(b, { x: -3.9, z: BZ + 0.02, y: 2.2 });
  pendant(b, { x: -2.6, z: -0.8, y: 2.8 });
  // kitchen (right): fridge, counter (toaster goes on it as a story prop), stove, shelf, a chair
  fridge(b, { x: 4.62, z: -2.1, yaw: -Math.PI / 2 });
  counter(b, { x: 4.68, z: -0.4, yaw: -Math.PI / 2 }, 2.2, "#5f8f86");
  stove(b, { x: 4.68, z: 1.15, yaw: -Math.PI / 2 });
  wallShelf(b, { x: 4.97, z: 0.55, y: 1.75, yaw: -Math.PI / 2 }, 1.0, 2);
  chair(b, { x: 2.0, z: 0.9, yaw: -0.6 }, "#e9c46a");
  plant(b, { x: 0.6, z: BZ + 0.35 }, 0.9, "#5f8f86", 6);
  picture(b, { x: 2.4, z: BZ + 0.01, y: 1.8 }, 0.6, 0.45, 1, "#3a3d47");
  pendant(b, { x: 2.8, z: -0.6, y: 2.8 });
  b.build(root, true);
  return { root, env: { sky: false, clouds: false }, ...APT_LAYOUT };
};

// ---------------- props ----------------
/** a ceramic bowl on the coffee table, with the house keys in it (variant empty: the keys are gone) */
const keyBowl = (b: Batch, a: At, full = true) => {
  const m = frame(a);
  lathe(b, col("#e8875a"), m, 0, 0, 0, [[0.03, 0], [0.11, 0.015], [0.14, 0.05], [0.145, 0.06]], 22);
  if (!full) return;
  // the keys: a ring, two keys and the red tag, lying in the bowl
  cyl(b, col("#c9ccd2"), m, -0.01, 0.045, 0, 0.04, 0.04, 0.008, 18);
  box(b, col("#d9dde2"), m, -0.02, 0.1, 0.045, 0.055, -0.012, 0.012);
  box(b, col("#e8b84a"), m, -0.09, 0.0, 0.05, 0.06, 0.02, 0.042);
  box(b, col("#e2453c"), m, -0.04, 0.0, 0.052, 0.062, -0.07, -0.02);
};
/** a chrome-and-red toaster with two slices of toast popped up */
const toaster = (b: Batch, a: At) => {
  const m = frame(a);
  rbox(b, col("#d8443c"), m, 0, 0, 0, 0.28, 0.2, 0.17, 0.04);
  box(b, col("#c9ccd2"), m, -0.14, 0.14, 0.0, 0.02, -0.085, 0.085);                  // chrome base
  for (const x of [-0.055, 0.055]) {
    box(b, col("#2b2d36"), m, x - 0.035, x + 0.035, 0.199, 0.202, -0.06, 0.06);     // slot
    rbox(b, col("#d9a05b"), m, x, 0.15, 0, 0.022, 0.12, 0.11, 0.02);                  // toast
  }
  box(b, col("#2b2d36"), m, 0.14, 0.17, 0.09, 0.12, -0.02, 0.02);                    // lever
};
/** a thought bubble holding the keys, floating in the air (a plan left behind in a room: the "old scene") */
const bubbleMat = () => glow("thoughtBubble", () => {
    const c = document.createElement("canvas"); c.width = c.height = 512;
    const g = c.getContext("2d")!; g.scale(512 / 400, 512 / 400);
    drawThought(new Pen(g), 0);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    return { map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide };
  });
const thoughtBubble = (b: Batch, a: At) => {
  b.add(new THREE.PlaneGeometry(0.7, 0.7), bubbleMat(), frame(a).multiply(new THREE.Matrix4().makeTranslation(0, 0.35, 0)));
};
/** the story version: a card that always turns to face the camera (seen from the kitchen or the front alike) */
const thoughtBubbleRig = (a: At): PropRig => {
  const root = new THREE.Group(), s = a.s ?? 1;
  root.position.set(a.x, a.y ?? 0, a.z);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.7 * s, 0.7 * s).translate(0, 0.35 * s, 0), bubbleMat());
  root.add(m);
  return { root, update: ({ camPos }) => { root.rotation.y = Math.atan2(camPos.x - a.x, camPos.z - a.z); } };
};

// ---------------- hand-held items ----------------
const keys = (p: Pen, x: number, y: number, u: number, s: number) => {
  p.g.save(); p.g.translate(x + 2 * u * s, y + 2 * u); p.g.scale(0.32 * u * s, 0.32 * u); drawKeys(p, 0, 0, 1); p.g.restore();
};

export const EVERYDAY: Theme = {
  id: "everyday", name: "Everyday home life", desc: "a two-room apartment with a real doorway between the living room and the kitchen, house keys (held and in a bowl), a toaster and a thought bubble that can stay behind in a room",
  tags: ["home", "everyday", "apartment", "psychology", "memory", "habits", "kitchen", "living room", "doorway"],
  mood: "curious",
  ambience: { apartment: "amb_room" },
  props: {
    keyBowl: { name: "Bowl of keys", desc: "a small orange ceramic bowl with the house keys in it, for a coffee table or a shelf (variants: full, empty)", category: "theme", themes: ["everyday", "home"], tags: ["keys", "bowl", "home", "forget", "leave"], radius: 0.16, height: 0.07,
      build: (b, a) => keyBowl(b, a), variants: { full: (b, a) => keyBowl(b, a), empty: (b, a) => keyBowl(b, a, false) } },
    toaster: { name: "Toaster", desc: "a red toaster with two slices of toast popped up (put it on a counter: y ~0.93)", category: "theme", themes: ["everyday", "home", "kitchen"], tags: ["kitchen", "breakfast", "toast", "appliance"], radius: 0.18, height: 0.22, build: toaster },
    thoughtBubble: { name: "Thought bubble (keys)", desc: "a thought bubble holding a set of keys, floating in the air (bottom at `at` y; faces +z): a plan or memory left behind in a room", category: "theme", themes: ["everyday", "psychology", "memory"], tags: ["thought", "memory", "plan", "idea", "forget", "remember", "keys"], radius: 0.35, height: 0.7, build: thoughtBubble, rig: thoughtBubbleRig },
  },
  items: {
    keys: { name: "House keys", desc: "a bunch of house keys on a ring with a red tag", themes: ["everyday", "home"], tags: ["keys", "home", "leave", "door", "lock"], draw: keys },
  },
  sets: { apartment: { id: "apartment", title: "Apartment: living room | doorway | kitchen", lights: ["interior"], build: apartment } },
  layouts: { apartment: APT_LAYOUT },
  setMeta: { apartment: { name: "Apartment", desc: "two rooms side by side: a living room (sofa, coffee table, armchair, bookshelf, window) and a kitchen (fridge, counter, stove, tiled floor), split by a wall with a real doorway; front door on the far left. Wide front view shows both rooms (marks: sofa, livingA, livingB, table, doorL, doorway, doorR, kitchenA, fridge, counter, toaster, frontDoor / views: dollhouse, living, kitchen, doorway / lights: interior)", themes: ["everyday", "modern", "home", "psychology"], tags: ["indoor", "house", "apartment", "kitchen", "living room", "doorway", "interior"] } },
};
