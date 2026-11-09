// Video 08 "In This World, If Nobody Thinks About You, You Float Away" (productions/float-away/script.md, v3 approved).
// NARRATION SCAFFOLD ONLY (stage 2): one shot per approved line, so `npm run voice -- float-away` can generate and
// time the recordings. The visual storyboard is built in the next stage and replaces these placeholder shots; the
// lines, voices and gaps below are the approved ones and stay as they are (the cache is keyed by voice + text).
import type { Storyboard, ShotSpec } from "../story/types";

const L = (text: string, voice: string, gap = 0.15, who?: string): ShotSpec =>
  ({ say: { text, voice, gap, ...(who ? { who } : {}) }, set: "home", light: "interior", camera: { move: "closeUp", on: who ?? "milo" }, actors: [{ who: who ?? "milo", at: "a" }] } as ShotSpec);
const VO = "liam", HUSH = "liamQuiet";   // Milo narrates in his approved voice; the two reveal lines quieter and slower

export const FLOATAWAY: Storyboard = {
  id: "float-away",
  title: "In This World, If Nobody Thinks About You, You Float Away",
  cast: { milo: "milo", gus: "gus", juno: "juno", rival: { extra: 7 } },
  shots: [
    L("In this world, the more people think about you, the heavier you get.", VO, 0.1),
    L("Movie stars break six chairs a day.", VO, 0.6),
    L("Politicians sink during speeches.", VO, 0.5),
    L("Free pizza over here!", "chris", 0.1, "rival"),
    L("If nobody thinks about you... you float away.", VO, 0.5),
    L("My grandpa Gus was the heaviest man on our street.", VO, 0.6),
    L("Every Sunday, we had a pancake war.", VO, 0.3),
    L("Ceiling counts as a plate!", "brian", 0.5, "gus"),
    L("Then Grandma died, and he started getting lighter.", VO, 1.2),
    L("I got busy. New school. New phone.", VO, 4.0),
    L("Grandpa, are you on the ceiling?", VO, 0.4, "milo"),
    L("Changing a lightbulb! Go play.", "brian", 0.2, "gus"),
    L("On my birthday, his hug clinked.", VO, 1.6),
    L("Stones. Everywhere.", VO, 0.3),
    L("Don't tell your mother.", "brian", 0.5, "gus"),
    L("That night, a storm blew his door open.", VO, 0.4),
    L("I tried everything.", VO, 1.6),
    L("You taught me to ride a bike! You burn every pancake!", VO, 1.6, "milo"),
    L("Then it hit me. He started floating the spring I stopped visiting.", HUSH, 2.4),
    L("I was the last one.", HUSH, 0.6),
    L("I climbed the bus stop and went live.", VO, 4.6),   // the 4.6 s of silence after "I was the last one" (shots 26-27)
    L("That's my grandpa! His name is Gus!", VO, 0.3, "milo"),
    L("Three viewers. One said \"fake.\"", VO, 0.3),
    L("Then Juno saw it. Two million followers. She hates me.", VO, 0.4),
    L("Ugh. He fixed my bike.", "juno", 1.0, "juno"),
    L("Ten thousand. Eighty thousand.", VO, 0.5),
    L("He came down so hard, he cracked the road.", VO, 1.8),
    L("Now he breaks every chair he sits on.", VO, 0.8),
    L("This is your fault.", "brian", 0.3, "gus"),
    L("So call your grandpa. Right now. He might be holding onto the counter.", VO, 1.6),
  ],
};
