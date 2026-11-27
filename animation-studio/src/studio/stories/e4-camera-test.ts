// VISUAL TEST ONLY (Engine 4, Phase 2): a 5-second camera test clip in Maya's kitchen. Three set-ups, a change every ~1.7 s:
//   1 (1.6 s) 24 mm wide, a truck sideways across the room (sharp, deep focus)
//   2 (1.7 s) 35 mm medium orbit round Mum and Bug, with a 7-frame impact shake at 1.0 s
//   3 (1.7 s) 85 mm close-up on Mum: shallow depth of field, an impact shake on the cut
// Every shot carries the Engine 4 hand-held drift. Silent, no narration, nothing is published.
import type { Storyboard } from "../story/types";
import { fovMm, blurMm } from "../engine4/camera";

const MUM = [-0.95, 0, -1.3] as [number, number, number], BUG = [-0.2, 0, -1.3] as [number, number, number];
const actors = [{ who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const }, { who: "bug", at: BUG, act: "neutral" as const, facing: "camera" as const }];
const base = { set: "e4Kitchen", light: "interior" as const, props: [] };

export const E4_CAMERA_TEST: Storyboard = {
  id: "e4-camera-test", title: "Engine 4 Phase 2: camera test clip (5 s)",
  cast: { mum: "mum", bug: "bug" },
  captions: false, music: false, engine: 4, autoSfx: false, motionBlur: true, controlledBlur: true,
  shots: [
    { ...base, dur: 1.6, camera: { move: "truck", on: ["mum", "bug"], dist: 1.1, size: "wide", from: 8, height: 1.5, fov: fovMm(24), cInf: 0 }, actors, note: "1: 24 mm wide, truck right" },
    { ...base, dur: 1.7, camera: { move: "orbit", on: ["mum", "bug"], fromDeg: [-22, 18], size: "medium", height: 1.4 }, actors, kicks: [1.0], note: "2: 35 mm-ish medium orbit + impact shake" },
    { ...base, dur: 1.7, camera: { move: "closeUp", on: "mum", from: 20, fov: fovMm(85), cInf: blurMm(85) }, actors: [actors[0], actors[1]], kicks: [0.05], note: "3: 85 mm close-up, shallow DOF" },
  ],
};
