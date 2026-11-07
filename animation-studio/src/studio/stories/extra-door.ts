// Storyboard SKELETON for "The Extra Door" (Video 05, Part 1), for the narration stage only.
// The say lines are the approved script (productions/extra-door/script.md), word for word: keep them exactly (the
// approval is tied to them). Sets, cameras, actors and timing are placeholders until the storyboard stage.
// Lines 7 and 8 are deliberately identical (same voice, same text): the voice cache gives ONE recording, played twice.
import type { Storyboard } from "../story/types";

const P = { set: "home" as const, light: "interior" as const, camera: { move: "frame" as const, on: ["milo"], size: "medium" as const, from: 6 }, actors: [{ who: "milo", at: "a", act: "neutral" as const }] };
export const EXTRADOOR: Storyboard = {
  id: "extra-door", title: "The Extra Door (Part 1)",
  cast: { milo: "milo" },
  music: false,
  shots: [
    { say: { who: "milo", text: "...six... seven... ...eight?", voice: "liamQuiet" }, ...P },
    { say: { text: "Milo's hallway has seven doors... It always has.", voice: "georgeHushed" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "Okay. I'm just tired.", voice: "liamQuiet" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "One, two, three, four, five, six, seven... ...eight.", voice: "liamQuiet" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "...that's where our picture hangs.", voice: "liamQuiet" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "...Juno?", voice: "liamQuiet" }, ...P, transition: "cut" },
    { say: { text: "Milo... it's me. Let me in.", voice: "juno" }, ...P, transition: "cut" },
    { say: { text: "Milo... it's me. Let me in.", voice: "juno" }, ...P, transition: "cut" },
    // FLOOR CHECK shots (asset stage stills only): the opening wide shot (design shot 2) and a low hallway view
    { dur: 1.0, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0, 1.0, 1.25], look: [0, 1.05, -7.0], fov: 40 },
      actors: [{ who: "milo", at: "nearEnd", act: "neutral", facing: 0 }], props: [{ id: "oldDoor", at: "oldDoor" }, { id: "photoFrame", at: "photo" }] },
    { dur: 1.0, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.35, 0.32, 0.9], look: [0.0, 0.55, -7.0], fov: 52 },
      actors: [], props: [{ id: "oldDoor", at: "oldDoor" }, { id: "photoFrame", at: "photo" }] },
    // ASSET CHECK shots (asset stage stills only): the clue framing with the shadows under the door, the handle close-up
    { dur: 1.0, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.42, 1.5, -4.15], look: [0.0, 1.15, -7.0], fov: 64 },
      actors: [], props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }, { id: "photoFrame", at: "photo" }] },
    { dur: 1.0, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.12, 1.12, -6.45], look: [0.2, 1.0, -7.0], fov: 40 },
      actors: [], props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }] },
    // CHECKPOINT shot (design shot 15): the phone macro, Juno's reply (asset stage still check; the storyboard is not built yet)
    { dur: 2.1, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "insert", on: "phoneScreen", size: "macro" },
      actors: [{ who: "milo", at: [0.25, 0, -5.62], act: "scared", facing: 0 }],
      props: [{ id: "phoneScreen", at: [0.25, 1.08, -5.3], variant: "sent", steps: [{ t: 0.15 }] }] },
    { say: { text: "Don't text her.", voice: "junoCold" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "...what do I do?", voice: "liamQuiet" }, ...P, transition: "cut" },
    // CHECKPOINT shot (design shot 21): the final A / B composition (asset stage still check)
    { say: { text: "Comment A or B. Your vote decides Part 2.", voice: "georgeHushed" }, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.4, 2.15, -0.5], look: [-0.45, 0.6, -7.0], fov: 58 },
      actors: [{ who: "milo", at: [0.66, 0, -5.25], act: "scared", facing: 0 }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }, { id: "photoFrame", at: "photo" },
        // flat screen labels, placed along the camera's rays to empty parts of the frame (A above and beside the door, B above the stairs), inside the Shorts safe area and clear of the caption band
        { id: "choiceLabel", at: [0.394, 1.719, -2.616], variant: "A: OPEN THE DOOR", scale: 1.114, steps: [{ word: "A" }] },
        { id: "choiceLabel", at: [-0.123, 1.234, -2.431], variant: "B: RUN DOWNSTAIRS", scale: 1.089, steps: [{ word: "B" }] }] },

  ],
};
