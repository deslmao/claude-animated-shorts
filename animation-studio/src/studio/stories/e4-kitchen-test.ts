// VISUAL TEST ONLY (Engine 4, Phase 1): Maya's kitchen as a PBR room (engine: 4), three framings, and the same three framings
// in the current look (bfKitchen, engine 3) for the owner's side-by-side review. Silent, no narration, nothing is published.
// The cast is Part 1's Mum and Bug in both (the Friday Pizza cast is not drawn yet; the characters are not what is being compared).
import type { Storyboard } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const shot = (set: string, note: string, camera: ReturnType<typeof at>, actors: NonNullable<Storyboard["shots"][number]["actors"]>) =>
  ({ set, light: "interior" as const, dur: 1.4, camera, cams: [{ t: 0, ...camera, blockOk: true }], actors, props: [], note });

/** Engine 4: Maya's kitchen */
export const E4_KITCHEN_TEST: Storyboard = {
  id: "e4-kitchen-test", title: "Engine 4 Phase 1: Maya's kitchen (test stills)",
  cast: { mum: "mum", bug: "bug" },
  captions: false, music: false, engine: 4, autoSfx: false,
  shots: [
    shot("e4Kitchen", "1 wide: the room, the lamp, the window, two people", at([1.7, 1.45, 1.75], [-0.15, 1.0, -1.3], 56),
      [{ who: "mum", at: [-0.95, 0, -1.3], act: "neutral", facing: "camera" }, { who: "bug", at: [0.2, 0, -1.3], act: "neutral", facing: "camera" }]),
    shot("e4Kitchen", "2 two-shot from the left, the fridge behind", at([-1.6, 1.35, 0.5], [0.5, 1.2, -1.4], 50),
      [{ who: "mum", at: [0.1, 0, -1.2], act: "neutral", facing: "camera" }, { who: "bug", at: [1.0, 0, -1.3], act: "neutral", facing: "camera" }]),
    shot("e4Kitchen", "3 Mum in the window's light patch on the floor: her shadow falls on the floor and the wall", at([1.3, 1.25, 1.7], [-1.1, 0.85, 0.5], 50),
      [{ who: "mum", at: [-1.1, 0, 0.5], act: "neutral", facing: "camera" }]),
  ],
};
/** the same three framings in the current look (bfKitchen, engine 3) */
export const E4_KITCHEN_LEGACY: Storyboard = {
  id: "e4-kitchen-legacy", title: "Engine 4 Phase 1: the current look (comparison stills)",
  cast: { mum: "mum", bug: "bug" },
  captions: false, music: false, engine: 3, autoSfx: false,
  shots: [
    shot("bfKitchen", "1 wide: the room, two people", at([0.2, 1.45, 3.6], [0, 1.1, -1.2], 50),
      [{ who: "mum", at: [-0.75, 0, -0.95], act: "neutral", facing: "camera" }, { who: "bug", at: [0.3, 0, -0.3], act: "neutral", facing: "camera" }]),
    shot("bfKitchen", "2 two-shot from the left", at([-1.9, 1.35, 1.5], [0, 1.2, -1.0], 50),
      [{ who: "mum", at: [-0.4, 0, -0.9], act: "neutral", facing: "camera" }, { who: "bug", at: [0.6, 0, -1.0], act: "neutral", facing: "camera" }]),
    shot("bfKitchen", "3 Mum by the table, the same side-on framing", at([1.3, 1.25, 1.7], [-1.1, 0.85, 0.5], 50),
      [{ who: "mum", at: [-1.1, 0, 0.5], act: "neutral", facing: "camera" }]),
  ],
};
