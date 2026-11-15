// VISUAL TEST ONLY (owner-authorised, productions/what-ollie-says): the ten roof-sequence test stills. Each shot is
// one frame to check: character looks, the house's geography (the open window, the flat roof and its 30 cm upstand,
// the flooded garden, the river), night lighting with rain, composition at 9:16, and the staging rules of
// story-lock.md §1.4 (nobody over the edge, the drop never framed). Silent, no narration.
import type { Storyboard } from "../story/types";
import { ROOF_Y } from "../themes/ollie";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 30 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
// rain and water are camera-relative / absolute: anchor both on the shot's sight line (the validator's in-frame check)
const WX = (look: V) => [{ id: "ferryWater", at: look, variant: "high", steps: STEADY }, { id: "rain", at: look, steps: STEADY }];
const R = (x: number, z: number): V => [x, ROOF_Y, z];
/** a point on the sight line past the look point (clear of the actors there) */
const beyond = (p: V, l: V): V => [p[0] + (l[0] - p[0]) * 2.2, p[1] + (l[1] - p[1]) * 2.2, p[2] + (l[2] - p[2]) * 2.2];
const shot = (note: string, camera: ReturnType<typeof at>, actors: NonNullable<Storyboard["shots"][number]["actors"]>, light: "night" | "interiorCool" = "night") =>
  ({ set: "ferryBack", light, dur: 1.4, camera, cams: [{ t: 0, ...camera, blockOk: true }], actors, props: WX(beyond(camera.pos, camera.look)), note });

export const OLLIE_ROOF_TEST: Storyboard = {
  id: "ollie-roof-test", title: "What Ollie Says at 3 A.M.: roof-sequence visual test",
  cast: { kate: "kate", ava: "ava", ollie: "ollie" },
  captions: false, music: false, engine: 3, autoSfx: false,
  shots: [
    // 1 (ep4 b15): the empty bedroom: the open window, curtains blown in, rain beyond
    shot("1 ep4 b15: the empty room, the window open onto the roof", at([-0.2, 4.1, -3.35], [-1.4, 3.4, -0.1], 52), []),
    // 2 (ep4 b16): from the window, low: Kate at the upstand, her back to us, calling into the flooded garden
    shot("2 ep4 b16: from the window: Kate at the edge", at([-1.25, 3.6, -0.35], [-0.95, 3.05, 4.5], 52),
      [{ who: "kate", at: "roofEdge", act: "neutral", back: true, blink: false }]),
    // 3 (ep4 b16): reverse from the roof: Ollie out of the window, coming toward Kate; Ava in the window behind him
    shot("3 ep4 b16: Ollie out of the window, Ava behind", at([-0.35, 3.45, 2.55], [-1.15, 3.6, -0.2], 50),
      [{ who: "ava", at: "roomWindow", act: "scared", facing: "camera" },
       { who: "ollie", at: "roofWindow", act: "neutral", face: "scared", facing: "camera", walk: { to: "roofMid", t0: 0, t1: 1.4, view: "front" } }]),
    // 4 (ep4 b16): side two-shot at the upstand: Kate turns, takes Ollie's wrist
    shot("4 ep4 b16: Kate takes Ollie's wrist", at([0.35, 3.85, 1.15], [-0.8, 3.65, 3.0], 42),
      [{ who: "kate", at: "roofEdge", act: "neutral", face: "blank", facing: "toward:ollie", gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: "roofEdgeOllie", act: "neutral", face: "scared", facing: "toward:kate", gesture: "offer", reach: "kate" }]),
    // 5 (ep4 b17): from the window: Kate down at the upstand with Ollie (whispering the promise)
    shot("5 ep4 b17: Kate low at the edge with Ollie", at([-1.05, 3.65, -0.25], [-0.8, 3.0, 3.0], 40),
      [{ who: "kate", at: "roofEdge", mode: "sit", act: "sad", back: true, blink: false },
       { who: "ollie", at: "roofEdgeOllie", act: "neutral", back: true }]),
    // 6 (ep4 b17): the most intense frame: Kate standing, lifting his arm out over the edge; low from the window
    shot("6 ep4 b17: Take him! (silhouettes against the flood)", at([-1.25, 3.5, -0.65], [-0.85, 3.55, 3.6], 48),
      [{ who: "kate", at: "roofEdge", act: "neutral", back: true, gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: R(-0.62, 3.08), act: "neutral", back: true, gesture: "offer", reach: "kate" }]),
    // 7 (ep4 b17): Ollie looks back at Ava and keeps his promise (says nothing)
    shot("7 ep4 b17: Ollie looks back", at([-0.75, 3.5, 0.95], [-0.62, 3.55, 3.0], 40),
      [{ who: "kate", at: "roofEdge", act: "neutral", back: true, gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: "roofEdgeOllie", act: "neutral", face: "scared", facing: "camera" }]),
    // 8 (ep4 b18): Ava at the window, the vote moment, rain between us
    shot("8 ep4 b18: Ava at the window (the vote)", at([-1.2, 3.62, 1.3], [-1.2, 3.72, -0.4], 32),
      [{ who: "ava", at: R(-1.2, -0.38).map((v, i) => (i === 1 ? 2.8 : v)) as V, mode: "sit", act: "neutral", face: "scared", facing: "camera" }]),
    // 9 (finale A b5): overhead 45°: Kate sitting on the wet roof holding Ollie, Ava wrapping both
    shot("9 A b5: Kate holds on, Ava wraps them", at([-0.4, 5.0, 4.6], [-1.0, 2.95, 2.65], 45),
      [{ who: "kate", at: R(-1.0, 2.55), mode: "sit", act: "sad", face: "blank", facing: "camera", gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: R(-0.82, 2.86), mode: "sit", act: "sad", facing: "toward:kate", gesture: "offer", reach: "kate" },
       { who: "ava", at: R(-1.36, 2.7), mode: "sit", act: "sad", facing: "toward:kate", gesture: "offer", reach: "kate" }]),
    // 10 (geography): the back of the house from the flooded garden: the lit open window, three figures at the edge
    shot("10 geography: the house from the flooded garden", at([2.2, 2.6, 13.5], [-0.9, 3.0, 1.5], 48),
      [{ who: "kate", at: "roofEdge", act: "neutral", face: "blank", facing: "camera", gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: "roofEdgeOllie", act: "neutral", face: "scared", facing: "camera", gesture: "offer", reach: "kate" },
       { who: "ava", at: "roomWindow", act: "scared", facing: "camera" }]),
  ],
};
