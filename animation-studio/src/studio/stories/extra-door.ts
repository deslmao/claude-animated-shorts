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
    { say: { text: "Don't text her.", voice: "junoCold" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "...what do I do?", voice: "liamQuiet" }, ...P, transition: "cut" },
    { say: { text: "Comment A or B. Your vote decides Part 2.", voice: "georgeHushed" }, ...P, transition: "cut" },
  ],
};
