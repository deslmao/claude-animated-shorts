// The Extra Door, Part 2: "Juno's Night Shift" (productions/extra-door-2/script-rewrite.md, v2 approved), the rewrite
// that replaces the unpublished extra-door-2 cut. NARRATION SCAFFOLD ONLY (stage 2): one placeholder shot per approved
// line, so `npm run voice -- night-shift` can generate and time the recordings; the visual storyboard replaces these
// shots in the next stage. Voices are Part 1's presets; the door's "Milo... it's me. Let me in." is Part 1's exact
// cached take (voice "juno", same text), used twice.
import type { Storyboard, ShotSpec } from "../story/types";

const L = (text: string, voice: string, gap = 0.1, who?: string): ShotSpec =>
  ({ say: { text, voice, gap, ...(who ? { who } : {}) }, set: "lab", light: "interior", camera: { move: "closeUp", on: who ?? "milo" }, actors: [{ who: who ?? "milo", at: "a" }] } as ShotSpec);
const N = "georgeHushed", MQ = "liamQuiet", ML = "liam", J = "juno";
const DOORJUNO = "Milo... it's me. Let me in.";   // Part 1's take (cached)

export const NIGHTSHIFT: Storyboard = {
  id: "night-shift",
  title: "The Extra Door, Part 2: Juno's Night Shift",
  cast: { milo: "milo", juno: "juno" },
  shots: [
    L("You told him to run. So he ran.", N),                                        // 1  vote callback
    L("Where are the keys?!", ML, 0.1, "milo"),                                      // 2  locked front door
    L(DOORJUNO, J),                                                                  // 3  the door (cached)
    L("Milo, it's really me. Don't look at our photo. Come to the lab!", J, 0.1, "juno"), // 6  the call
    L("It only moves when I'm looking.", MQ, 0.1, "milo"),                           // 8  the gutter
    L("It wasn't following Milo. It was following the photo.", N),                   // 9  the sprint
    L("Juno, it's me!", ML, 0.1, "milo"),                                            // 10 lab door
    L("Prove it. Who ate my birthday cake?", J, 0.1, "juno"),
    L("Me! Sorry! Open up!", ML, 0.1, "milo"),
    L("You're soaked.", J, 0.1, "juno"),                                             // 11 reunion
    L("It has your voice.", MQ, 0.1, "milo"),
    L("It learned it from me.", J, 0.1, "juno"),
    L("It only moves while something's watching it. Eyes or cameras.", J, 0.1, "juno"), // 12 monitor
    L("It learned us from that photo.", J, 0.1, "juno"),
    L("Tonight it went through mine... into yours.", J, 0.1, "juno"),
    L("Juno. Don't look at your desk.", MQ, 0.1, "milo"),                            // 13
    L(DOORJUNO, J),                                                                  // 15 the wall (cached, again)
    L("Juno, it's me. Open up.", MQ),                                                // 16 the door as Milo
    L("It won't come off!", J, 0.1, "juno"),                                         // 17
    L("Stop looking! Look at me!", ML, 0.1, "milo"),                                 // 19
    L("The camera's still watching it!", J, 0.1, "juno"),                            // 20
    L("If nothing sees it, it can't move.", MQ, 0.1, "milo"),
    L("Milo, please.", J),                                                           // 22 the door pleads (as Juno)
    L("Juno, look at me!", ML),                                                      //    ... and as Milo
    L("Left. Down. There.", MQ, 0.1, "milo"),
    L("It's sealed. Nothing can see it in there.", J, 0.1, "juno"),                  // 23
    L("Next time you bring work home, warn me.", MQ, 0.1, "milo"),
    L("Deal.", J, 0.1, "juno"),
  ],
};
