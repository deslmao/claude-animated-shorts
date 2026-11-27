// ENGINE 4 TEMPLATE SEQUENCE (Phases 1-4, 15 s): Maya's kitchen (PBR set, baked light, live lamp + window), the Phase 2 camera (24-85 mm,
// truck, orbit, hand-held, impact shakes), Phase 3 acting (keyframed poses, squash and stretch, the mug in the hand, kettle steam), and
// Phase 4 format: word-level SFX, music ducking 8 dB under punchlines and major hits, viral captions, a 3D lit number, a clean frame.
// Test only: nothing is published.
import type { Storyboard, Line } from "../story/types";
import { fovMm } from "../engine4/camera";

const MUM = [-0.95, 0, -1.3] as [number, number, number], BUG = [-0.2, 0, -1.3] as [number, number, number];
const base = { set: "e4Kitchen", light: "interior" as const, ambience: "elb_kitchen_day" as const };
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
const mum = (keys: K) => ({ who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const, hold: "mug", keys });
const bug = (keys: K) => ({ who: "bug", at: BUG, act: "neutral" as const, facing: "camera" as const, keys });
const N = (text: string, extra: Partial<Line> = {}): Line => ({ text, who: "narrator", ...extra });
const NUM = (steps: ({ t: number } | { word: string })[]) => ({ id: "e4Number", variant: "6", at: [0.2, 0.77, -0.58] as [number, number, number], scale: 1.0, steps });
const at = (pos: [number, number, number], look: [number, number, number], fov: number, cInf = 0) => ({ move: "at" as const, pos, look, fov, blur: cInf });

export const E4_TEMPLATE: Storyboard = {
  id: "e4-template", title: "Engine 4 template: Maya's kitchen (15 s)",
  cast: { mum: "mum", bug: "bug" },
  voice: "georgeHushed", voices: { mum: "bfMum" },
  captionStyle: "viral", captionKeys: ["Maya", "Friday", "pizza", "plates", "box", "order", "warm"],
  music: "mystery", musicDrop: { word: "still" },
  engine: 4, motionBlur: true, controlledBlur: true,
  clarity: {
    premise: "Every Friday at six Maya's mum orders pizza, but tonight the pizza box is already on the table, and it is still warm.",
    facts: [
      { fact: "the weekly ritual", said: "Every Friday at six" },
      { fact: "the setup", said: "Mum sets three plates." },
      { fact: "the strange thing", said: "the box is already here" },
      { fact: "the punch", said: "And it's still warm." },
    ],
  },
  shots: [
    { ...base, camera: { move: "truck", on: ["mum", "bug"], dist: 1.0, size: "wide", from: 8, height: 1.5, fov: fovMm(24), cInf: 0 }, say: N("Every Friday at six,"), hold: 0.55,
      props: [NUM([{ word: "six" }])], note: "1 wide 24 mm truck; the 3D 6 pops on 'six'",
      actors: [mum([{ t: 0, gesture: "hold", expr: "neutral" }, { t: 0.5, d: 0.34, tilt: 4, turn: 0.4, expr: "smile", brow: [0, 0, 2] }]), bug([{ t: 0, expr: "neutral" }, { t: 0.6, d: 0.3, tilt: -4, look: [1, 0.2] }])] },
    { ...base, camera: at([0.0, 1.15, 0.85], [0.2, 1.05, -0.58], fovMm(40), 4), say: N("the pizza comes."), hold: 0.8,
      props: [NUM([{ t: -1 }])], note: "2 the 3D number on the table, lit by the lamp",
      actors: [mum([{ t: 0, gesture: "hold" }]), bug([{ t: 0, expr: "neutral" }])] },
    { ...base, camera: { move: "closeUp", on: "mum", from: 20, fov: fovMm(50), cInf: 6 }, say: N("Mum sets three plates."), hold: 0.7, props: [], note: "3 50 mm on Mum, the mug in her hand",
      actors: [mum([{ t: 0, gesture: "hold", expr: "neutral", tilt: -3 }, { t: 0.7, d: 0.34, tilt: 6, expr: "smile", headTilt: -5, brow: [0, 0, 3] }]), bug([{ t: 0, expr: "neutral" }])] },
    { ...base, camera: { move: "orbit", on: ["mum", "bug"], fromDeg: [-18, 14], size: "medium", height: 1.4 }, say: N("But tonight,"), hold: 0.75, props: [], note: "4 orbit",
      actors: [mum([{ t: 0, gesture: "hold", expr: "suspicious", brow: [0, 1, 3], tilt: 5 }, { t: 0.5, d: 0.3, tilt: -3, turn: -0.4 }]), bug([{ t: 0, expr: "neutral" }, { t: 0.4, d: 0.3, expr: "thinking", look: [-1, 0.4] }])] },
    { ...base, camera: { move: "truck", on: ["mum", "bug"], dist: 0.9, size: "wide", from: -8, height: 1.45, fov: fovMm(28), cInf: 1 }, say: N("the box is already here."), hold: 0.7, props: [], note: "5 28 mm truck",
      actors: [mum([{ t: 0, gesture: "hold", expr: "confused", tilt: 3 }, { t: 0.9, d: 0.34, tilt: -6, expr: "shock", brow: [-3, -1, 3], squash: 1.2 }]), bug([{ t: 0, expr: "nervous" }, { t: 1.0, d: 0.3, tilt: 6, slump: 0.3, look: [1.2, 0.6] }])] },
    { ...base, camera: { move: "closeUp", on: "mum", from: 20, fov: fovMm(85), cInf: 16 }, kicks: [0.02], say: N("Maya... did you order this?", { who: "mum", voice: "bfMum", punch: true }), hold: 0.55, props: [], note: "6 85 mm close-up, shallow DOF, impact",
      actors: [mum([{ t: 0, gesture: "hold", expr: "suspicious", tilt: -8, headTilt: 6, brow: [-2, 2, 4], squash: 1.3 }, { t: 0.8, d: 0.34, tilt: 4, headTilt: -8, expr: "confused", brow: [0, 2, 4] }]), bug([{ t: 0, expr: "nervous" }])] },
    { ...base, camera: { move: "frame", on: ["mum", "bug"], size: "medium", from: 10, height: 1.4, fov: fovMm(35), cInf: 3 }, dur: 1.7, kicks: [0.1], props: [], note: "7 reaction, heartbeat", sfx: [{ t: 0.1, name: "heartbeat" }],
      actors: [mum([{ t: 0, gesture: "hold", expr: "shock", tilt: -5 }, { t: 0.7, d: 0.34, gesture: "shrug", expr: "embarrassed", tilt: 3, brow: [-1, -2, 3] }]), bug([{ t: 0, expr: "scared", tilt: -6, slump: 0.5 }, { t: 0.7, d: 0.3, turn: 0.7, look: [-1, 0.5], slump: 0.2 }])] },
    { ...base, camera: { move: "orbit", on: ["mum", "bug"], fromDeg: [14, -16], size: "medium", height: 1.35 }, say: N("And it's still warm.", { punch: true }), hold: 0.65, props: [], note: "8 the punch",
      actors: [mum([{ t: 0, gesture: "shrug", expr: "sad", slump: 0.5 }, { t: 1.2, d: 0.34, gesture: "hold", expr: "shock", brow: [-3, 0, 3], tilt: -4, slump: 0, squash: 1.3 }]), bug([{ t: 0, expr: "nervous" }, { t: 1.2, d: 0.3, expr: "shock", tilt: 5 }])] },
  ],
};
