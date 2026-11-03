// Feature showcase / test storyboard (stage 3C): crowds, story props, held items, running with a follow camera,
// explicit sound cues. Not a production Short (no narration audio is generated for it); `npm run test:story`
// validates it and test stills are rendered from it.
import type { Storyboard } from "../story/types";

export const CAPABILITIES: Storyboard = {
  id: "capabilities", title: "Studio feature showcase (test)",
  cast: { milo: "milo", juno: "juno", gus: "gus" },
  music: "adventure",
  shots: [
    { say: "Gus found an old map in the market square.", set: "oldtown", light: "day",
      camera: { move: "frame", on: ["gus", "milo"], size: "full", from: 6, height: 1.5 },
      actors: [
        { who: "gus", at: "a", act: "excited", gesture: "raiseHand", hold: "map" },
        { who: "milo", at: "b", act: "confused", beats: [{ word: "map", act: "excited" }] },
      ],
      crowd: { count: 6, era: "medieval" } },
    { say: "Milo grabbed the telescope and ran!", set: "city", light: "day", transition: "fade",
      camera: { move: "follow", on: "milo", size: "full", from: 20, height: 1.4 },
      actors: [{ who: "milo", at: "d", act: "determined", hold: "telescope", walk: { to: "c", t0: 0.15, t1: 1.6, mode: "run" } }],
      crowd: { count: 5 }, sfx: [{ name: "whoosh_short", word: "ran" }] },
    { say: "Juno checked the facts with her lab flask.", set: "lab", light: "interiorCool", transition: "cut",
      camera: { move: "frame", on: ["juno"], size: "medium", from: 10, height: 1.45 },
      actors: [{ who: "juno", at: "a", act: "explain", face: "smile", hold: "flask", beats: [{ word: "facts", hold: "book" }] }],
      props: [{ id: "board", variant: "formula", at: [-2.6, 0, -0.9], yaw: 35 }] },
  ],
};
