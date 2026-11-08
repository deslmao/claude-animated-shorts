// Storyboard SKELETON for "In This World, Every Lie Appears Above Your Head" (Thinkora), for the narration stage only.
// The say lines are the approved script v2 (productions/every-lie/script.md), word for word. Voices: Milo liam (his
// usual voice), the narrator georgeLively, Dad (Gus) brian, the teacher matilda, Juno juno, the class chris. Line 9
// repeats line 8 exactly (same voice and text: one recording, played twice). Sets, cameras and timing are placeholders.
import type { Storyboard } from "../story/types";

const P = { set: "home" as const, light: "interior" as const, camera: { move: "frame" as const, on: ["milo"], size: "medium" as const, from: 6 }, actors: [{ who: "milo", at: "a", act: "neutral" as const }] };
const L = (text: string, voice: string, who?: string) => ({ say: { text, voice, ...(who ? { who } : {}) }, ...P, transition: "cut" as const });
export const EVERYLIE: Storyboard = {
  id: "every-lie", title: "Every Lie Appears Above Your Head",
  cast: { milo: "milo" },
  music: false,
  shots: [
    L("I have never told a lie in my life.", "liam", "milo"),
    L("In this world, every lie appears above your head.", "georgeLively"),
    L("Made your favourite. From scratch!", "brian"),
    L("Mmm. Delicious.", "liam", "milo"),
    L("Milo. Homework?", "matilda"),
    L("The dog ate it.", "liam", "milo"),
    L("Ooooooh!", "chris"),
    L("I'm not hiding.", "liam", "milo"),
    L("I'm not hiding.", "liam", "milo"),
    L("...I'm not here.", "liam", "milo"),
    L("What'd you get on the test?", "juno"),
    L("Six... ...seven.", "liam", "milo"),
    L("...six seven?", "chris"),
    L("That's not even a—", "matilda"),
    L("SIX SEVEN! SIX SEVEN!", "chris"),
    L("From now on... I will never lie again.", "liam", "milo"),
    L("And that's how Milo learned... honesty is the best policy.", "georgeLively"),
    L("...He did not.", "georgeLively"),
    L("What's your biggest lie?", "liam", "milo"),
  ],
};
