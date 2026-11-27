// VISUAL TEST ONLY (Episode 1 gate): a 5-second headstand test in Maya's kitchen. Leo (a 6), Mum (a 7) and Dex (an 8) have glowing 3D numbers over their heads;
// Leo goes upside down (the whole card turns, the 6 slides beside his head and turns with it: a 9), then Dex copies and his 8 stays an 8. The last pancake sits on its plate.
import type { Storyboard } from "../story/types";
import { fovMm } from "../engine4/camera";

type V = [number, number, number];
const LEO = [-0.55, 0, -1.3] as V, MUM = [-1.4, 0, -1.2] as V, DEX = [0.3, 0, -1.3] as V;
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
const base = { set: "e4Kitchen", light: "interior" as const };
const num = (who: string, at: V, text: string, side: -1 | 1, steps: ({ t: number } | { word: string })[]) => ({ id: "e4Number", variant: text, at, scale: 0.8, hover: { who, side }, steps });
const nums = (steps: ({ t: number } | { word: string })[]) => [num("leo", LEO, "6", -1, steps), num("mum", MUM, "7", -1, steps), num("dex", DEX, "8", 1, steps)];
const plate = { id: "bfPlate", variant: "one", at: [0.35, 0.78, -0.4] as V, steps: [{ t: 99 }] };
const leo = (keys: K) => ({ who: "leo", at: LEO, act: "neutral" as const, facing: "camera" as const, keys });
const mum = (keys: K) => ({ who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const, keys });
const dex = (keys: K) => ({ who: "dex", at: DEX, act: "neutral" as const, facing: "camera" as const, keys });

export const E4_HEADSTAND_TEST: Storyboard = {
  id: "e4-headstand-test", title: "Episode 1: headstand test (5 s)",
  cast: { leo: "leo", mum: "mum", dex: "dex" },
  captions: false, music: false, engine: 4, autoSfx: false, motionBlur: true, controlledBlur: true,
  shots: [
    { ...base, dur: 1.8, camera: { move: "truck", on: ["leo", "mum", "dex"], dist: 0.7, size: "full", from: 8, height: 1.5, fov: fovMm(22), cInf: 0 }, props: [...nums([{ t: -1 }]), plate], note: "1 wide: three numbers; Leo goes upside down",
      actors: [leo([{ t: 0, expr: "worry" as never }, { t: 0.4, d: 0.6, flip: 1, gesture: "cheer", expr: "smile", brow: [0, 0, 2] }]), mum([{ t: 0, expr: "neutral" }, { t: 0.6, d: 0.34, tilt: 4, expr: "shock", brow: [-2, -1, 3] }]), dex([{ t: 0, expr: "proud", tilt: 3 }])] },
    { ...base, dur: 1.5, camera: { move: "at", pos: [-1.4, 0.9, 1.5], look: [-0.7, 1.0, -1.3], fov: fovMm(30), blur: 3 } as never, props: [...nums([{ t: -1 }])], note: "2 low and close: Leo upside down, the 6 has become a 9", kicks: [0.05],
      actors: [leo([{ t: 0, flip: 1, gesture: "cheer", expr: "smile" }]), mum([{ t: 0, expr: "shock", brow: [-2, -1, 3] }]), dex([{ t: 0, expr: "angry", brow: [2, 3, 0] }])] },
    { ...base, dur: 1.7, camera: { move: "truck", on: ["leo", "mum", "dex"], dist: 0.6, size: "full", from: -8, height: 1.45, fov: fovMm(22), cInf: 1 }, props: [...nums([{ t: -1 }]), plate], note: "3 wide: Dex copies, his 8 stays an 8",
      actors: [leo([{ t: 0, flip: 1, gesture: "cheer", expr: "smile" }]), mum([{ t: 0, expr: "think" as never }]), dex([{ t: 0, expr: "determined" }, { t: 0.3, d: 0.6, flip: 1, gesture: "cheer", expr: "shock", brow: [-3, -1, 3] }])] },
  ],
};
