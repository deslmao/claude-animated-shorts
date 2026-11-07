// Storyboard SKELETON for "The Extra Door" (Video 06, Part 2), for the narration stage only.
// The say lines are the approved script v2 (productions/extra-door-2/script.md), word for word: keep them exactly (the
// approval is tied to them). Sets, cameras, actors and timing are placeholders until the storyboard stage.
// Voices are Part 1's approved presets: narrator georgeHushed, Milo liamQuiet, the voice upstairs juno / junoCold.
import type { Storyboard } from "../story/types";

const P = { set: "home" as const, light: "interior" as const, camera: { move: "frame" as const, on: ["milo"], size: "medium" as const, from: 6 }, actors: [{ who: "milo", at: "a", act: "neutral" as const }] };
export const EXTRADOOR2: Storyboard = {
  id: "extra-door-2", title: "The Extra Door (Part 2)",
  cast: { milo: "milo" },
  music: false,
  shots: [
    { say: { who: "milo", text: "...twelve... thirteen... ...fourteen?", voice: "liamQuiet" }, ...P },
    { say: { text: "Last night, Milo's hallway grew an extra door.", voice: "georgeHushed" }, ...P, transition: "cut" },
    { say: { text: "You told him to run.", voice: "georgeHushed" }, ...P, transition: "cut" },
    { say: { text: "His stairs have thirteen steps.", voice: "georgeHushed" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "...twenty-six.", voice: "liamQuiet" }, ...P, transition: "cut" },
    { say: { text: "Milo? Where did you go?", voice: "juno" }, ...P, transition: "cut" },
    { say: { text: "Come back up, Milo.", voice: "juno" }, ...P, transition: "cut" },
    { say: { text: "Don't open it. That's not me.", voice: "junoCold" }, ...P, transition: "cut" },
    { say: { who: "milo", text: "...which one is her?", voice: "liamQuiet" }, ...P, transition: "cut" },
    { say: { text: "Comment A or B. Your vote decides Part 3.", voice: "georgeHushed" }, ...P, transition: "cut" },
  ],
};
