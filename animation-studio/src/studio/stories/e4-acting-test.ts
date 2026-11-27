// VISUAL TEST ONLY (Engine 4, Phase 3): a 5-second character acting test in Maya's kitchen. Mum holds a mug; every shot has 2-3 keyframed
// expressive poses (lean, slump, turn, brow, head tilt, glance, face, gesture) eased with a snappy overshoot and squash-and-stretch, and the
// mug rides her hand. The set breathes (pendant flicker, kettle steam, dust, window light). Silent, no narration, nothing is published.
//   1 (1.6 s) 35 mm two-shot: Mum raises the mug and leans in, one brow up; Bug shrinks back
//   2 (1.7 s) 50 mm on Mum: a flinch back (impact shake), a head tilt, then a slump
//   3 (1.7 s) 35 mm truck: Bug turns to Mum; Mum shrugs with the mug
import type { Storyboard } from "../story/types";
import { fovMm } from "../engine4/camera";

const MUM = [-0.95, 0, -1.3] as [number, number, number], BUG = [-0.2, 0, -1.3] as [number, number, number];
const base = { set: "e4Kitchen", light: "interior" as const, props: [] };
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
const mum = (keys: K) => ({ who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const, hold: "mug", keys });
const bug = (keys: K) => ({ who: "bug", at: BUG, act: "neutral" as const, facing: "camera" as const, keys });

export const E4_ACTING_TEST: Storyboard = {
  id: "e4-acting-test", title: "Engine 4 Phase 3: acting test clip (5 s)",
  cast: { mum: "mum", bug: "bug" },
  captions: false, music: false, engine: 4, autoSfx: false, motionBlur: true, controlledBlur: true,
  shots: [
    { ...base, dur: 1.6, camera: { move: "frame", on: ["mum", "bug"], size: "medium", from: 8, height: 1.4, fov: fovMm(35), cInf: 3 }, note: "1: raise the mug, lean in, one brow up; Bug shrinks back",
      actors: [
        mum([{ t: 0, gesture: "hold", expr: "neutral" }, { t: 0.4, d: 0.36, gesture: "raiseHand", tilt: 9, turn: 0.7, expr: "suspicious", brow: [-1, 1.5, 4], headTilt: -5 }, { t: 1.05, d: 0.34, tilt: 3, turn: 0.4, expr: "smile", brow: [0, 0, 2] }]),
        bug([{ t: 0, expr: "neutral" }, { t: 0.45, d: 0.3, tilt: -7, slump: 0.5, expr: "nervous", look: [1.2, 0.4], brow: [0, -2, 0] }, { t: 1.1, d: 0.3, tilt: -3, slump: 0.7, look: [0.6, 0.9] }])] },
    { ...base, dur: 1.7, camera: { move: "closeUp", on: "mum", from: 12, fov: fovMm(50), cInf: 6 }, kicks: [0.02], note: "2: flinch back, head tilt, slump",
      actors: [
        mum([{ t: 0, gesture: "hold", expr: "shock", tilt: -9, headTilt: 6, brow: [-3, -1, 3], squash: 1.3 }, { t: 0.55, d: 0.34, tilt: 5, headTilt: -9, expr: "confused", brow: [0, 2, 4], turn: -0.5 }, { t: 1.15, d: 0.36, tilt: 0, headTilt: 3, slump: 0.9, expr: "sad", brow: [1, -3, 0], look: [0, 1] }]),
        bug([{ t: 0, expr: "nervous" }])] },
    { ...base, dur: 1.7, camera: { move: "truck", on: ["mum", "bug"], dist: 0.7, size: "medium", from: -6, height: 1.4, fov: fovMm(35), cInf: 3 }, note: "3: Bug turns to Mum, Mum shrugs with the mug",
      actors: [
        mum([{ t: 0, gesture: "hold", expr: "sad", slump: 0.7 }, { t: 0.5, d: 0.34, gesture: "shrug", slump: 0, shrug: 1, tilt: -4, expr: "embarrassed", headTilt: 7, brow: [-1, -2, 3] }, { t: 1.15, d: 0.3, gesture: "hold", shrug: 0, tilt: 0, expr: "smile", turn: 0.3 }]),
        bug([{ t: 0, turn: -0.8, expr: "nervous" }, { t: 0.4, d: 0.34, turn: 0.8, tilt: 5, expr: "thinking", brow: [0, 2, 3] }, { t: 1.1, d: 0.3, turn: 0.5, tilt: 0, expr: "smile" }])] },
  ],
};
