// Set layouts as plain data: named actor marks + designed camera views. Kept separate from the 3D builders so tests
// (scripts/framing-test.ts) can check every view / mark without building geometry. Marks: [x, floor y, z].
// a / b / c (/ d / e) are the default group marks (left to right as seen in the main views); the named marks are
// places in the set (by the sofa, at the board, at the kerb...).
import type { View } from "./types";
import type { V3 } from "../camera/keys";
import { fitShot, FitOpts } from "../camera/framing";

/** a view fitted to marks (camera distance / aim solved so the subjects fit 9:16); focus on the first mark's eyes */
const fit = (name: string, marks: V3[], o: FitOpts, extra: Partial<View> = {}): View =>
  ({ name, ...fitShot(marks, o), focus: [marks[0][0], marks[0][1] + 1.55, marks[0][2]], ...extra });

export type Layout = { spots: Record<string, V3>; views: View[] };
const bz = -3.2;

const H = { a: [-0.75, 0, 0.35] as V3, b: [0.45, 0, -0.2] as V3 };
const C = { a: [-0.45, 0, bz + 0.95] as V3, b: [0.65, 0, bz + 1.1] as V3 };
const O = { a: [-0.9, 0, 0.5] as V3, b: [0.6, 0, 0.2] as V3, c: [2.6, 0, 0.9] as V3 };
const L_ = { a: [-1.2, 0, 0.45] as V3 };
const CT = { a: [-0.9, 0.15, -5.7] as V3, b: [0.25, 0.15, -6.1] as V3, c: [1.35, 0.15, -5.5] as V3 };
const OT = { a: [-0.9, 0, 3.4] as V3, b: [0.2, 0, 2.9] as V3 };

export const LAYOUTS: Record<string, Layout> = {
  home: {
    spots: { a: [-0.75, 0, 0.35], b: [0.45, 0, -0.2], c: [1.55, 0, 0.5], d: [2.3, 0, -0.9], armchair: [-1.55, 0, 0.35], door: [-2.6, 0, 0.2], window: [1.3, 0, -1.7], kitchen: [2.3, 0, -0.9] },
    views: [
      { name: "wide", pos: [0.45, 1.35, 5.7], look: [0.1, 0.95, -1.2], fov: 52 },
      fit("two-shot", [H.a, H.b], { size: "medium", from: 6, height: 1.45, fov: 38 }, { cInf: 10 }),
      { name: "kitchen", pos: [-1.6, 1.55, 2.4], look: [2.4, 1.15, -1.0], fov: 44, cInf: 6, focus: [2.3, 1.5, -0.9] },
      fit("low close", [H.a], { size: "close", from: 12, height: 1.15, fov: 34, roll: 0.04 }, { cInf: 13 }),
    ],
  },
  classroom: {
    spots: { a: [-0.45, 0, bz + 0.95], b: [0.65, 0, bz + 1.1], c: [2.9, 0, -0.4], board: [-0.45, 0, bz + 0.95], teacherDesk: [-2.0, 0, bz + 2.0], aisle: [0.1, 0, 1.0], door: [3.2, 0, 1.6] },
    views: [
      { name: "wide", pos: [3.0, 1.75, 5.0], look: [-0.4, 1.25, -2.4], fov: 50 },
      fit("at the board", [C.a, C.b], { size: "medium", from: 4, height: 1.45, fov: 40 }, { cInf: 8 }),
      { name: "desks", pos: [-3.1, 1.0, 3.4], look: [0.6, 1.1, -1.6], fov: 46, cInf: 5 },
      fit("close", [C.a], { size: "close", from: 10, height: 1.4, fov: 34 }, { cInf: 13 }),
    ],
  },
  office: {
    spots: { a: [-0.9, 0, 0.5], b: [0.6, 0, 0.2], c: [2.6, 0, 0.9], whiteboard: [2.6, 0, 0.9], cooler: [3.0, 0, bz + 1.2], door: [-3.2, 0, 0.4], window: [0.0, 0, -2.4] },
    views: [
      { name: "wide", pos: [-0.6, 1.6, 5.0], look: [0.2, 1.2, -1.8], fov: 50 },
      fit("desk", [O.a, O.b], { size: "medium", from: 25, height: 1.4, fov: 40 }, { cInf: 7 }),
      fit("whiteboard", [O.c], { size: "full", from: -55, height: 1.5, fov: 42 }, { cInf: 5 }),
      fit("close", [O.a], { size: "close", from: 14, height: 1.4, fov: 34 }, { cInf: 13 }),
    ],
  },
  lab: {
    spots: { a: [-1.2, 0, 0.45], b: [0.95, 0, 0.6], c: [2.5, 0, -1.4], bench: [-0.9, 0, bz + 1.25], island: [0.2, 0, 0.35], hood: [2.5, 0, -1.4] },
    views: [
      { name: "wide", pos: [0.6, 1.65, 5.6], look: [-0.3, 1.2, -1.8], fov: 52 },
      { name: "bench insert", pos: [-0.2, 1.3, 1.9], look: [-0.4, 1.15, -1.0], fov: 40, cInf: 8, focus: [-0.4, 1.1, -0.6], establishing: true },
      { name: "fume hood", pos: [-1.8, 1.5, 2.5], look: [2.8, 1.3, -1.8], fov: 42, cInf: 5, focus: [2.5, 1.5, -1.4] },
      fit("close", [L_.a], { size: "close", from: 14, height: 1.4, fov: 34 }, { cInf: 13 }),
    ],
  },
  city: {
    spots: { a: [-0.9, 0.15, -5.7], b: [0.25, 0.15, -6.1], c: [1.35, 0.15, -5.5], d: [-6, 0.15, -6.4], cafe: [0.25, 0.15, -6.1], kerb: [-2.2, 0.15, -4.6], busStop: [-13.5, 0.15, -5.8], crossing: [12, 0, -1.2] },
    views: [
      { name: "down the street", pos: [8, 1.7, 0.6], look: [-30, 3.5, -1.5], fov: 46, establishing: true },
      fit("storefront", [CT.a, CT.b, CT.c], { size: "medium", from: 3, height: 1.55, fov: 42 }, { cInf: 9 }),
      { name: "crossing high", pos: [20, 6.5, 6], look: [5, 1.2, -4], fov: 46 },
      fit("low hero", [CT.a], { size: "close", from: 8, height: 1.0, fov: 38, roll: -0.04 }, { cInf: 12 }),
    ],
  },
  oldtown: {
    spots: { a: [-0.9, 0, 3.4], b: [0.2, 0, 2.9], c: [1.3, 0, 3.6], d: [-5.5, 0, -6.8], e: [6.5, 0, -7.2], fountain: [1.8, 0, -0.9], market: [-5.5, 0, -6.8], well: [-9.3, 0, 7.6], cart: [9.4, 0, -0.8] },
    views: [
      { name: "square wide", pos: [4, 4.2, 19], look: [-0.5, 2.4, -8], fov: 46 },
      { name: "market", pos: [-2.6, 1.6, -0.6], look: [-7.2, 1.3, -8.8], fov: 40, cInf: 7, focus: [-5.5, 1.6, -6.8] },
      fit("fountain two-shot", [OT.a, OT.b], { size: "medium", from: 5, height: 1.45, fov: 38 }, { cInf: 10 }),
      fit("low hero", [OT.a], { size: "close", from: 8, height: 1.0, fov: 38, roll: 0.04 }, { cInf: 12 }),
    ],
  },
  nature: {
    spots: { a: [-0.9, 0, 4.4], b: [0.2, 0, 3.9], c: [1.3, 0, 4.6], path: [-0.2, 0, 0.6], pond: [3.6, 0, -3.4], log: [-3.2, 0, 2.4], forest: [-4.4, 0, -2.6] },
    views: [
      { name: "path wide", pos: [1.4, 1.8, 13.5], look: [-0.6, 1.6, -8], fov: 46, establishing: true },
      { name: "pond", pos: [2.2, 1.35, 3.2], look: [8, 0.9, -7.5], fov: 44, cInf: 4, establishing: true },
      { name: "forest edge low", pos: [-4.5, 0.75, 8.5], look: [-1.0, 2.4, -3], fov: 46, cInf: 3, establishing: true },
      { name: "close", pos: [-0.35, 1.4, 7.1], look: [-0.9, 1.55, 4.4], fov: 34, cInf: 13 },
    ],
  },
};
