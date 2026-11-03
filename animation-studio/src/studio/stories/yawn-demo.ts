// Demo storyboard (stage 1E, narrated in stage 2): "Why is yawning contagious?" — written only as data; the engine
// does the rest. Shot lengths come from the narration (npm run voice -- yawn-demo); reactions land on their words.
// Facts: contagious yawning is linked to social closeness / empathy and is strongest between kin and friends, weaker
// between strangers (Norscia & Palagi 2011, PLoS ONE); "seems linked" because the empathy link is still debated.
import type { Storyboard } from "../story/types";

export const YAWN_DEMO: Storyboard = {
  id: "yawn-demo", title: "Why is yawning contagious? (pipeline demo)",
  cast: { milo: "milo", juno: "juno", gus: "gus" },
  shots: [
    { say: "Yawning is contagious. Milo yawns, and seconds later, Gus catches it.", set: "city", light: "day",
      camera: { move: "frame", on: ["milo", "juno", "gus"], size: "full", from: 4, height: 1.5 },
      actors: [
        { who: "milo", at: "kerb", walk: { to: "a", t0: 0, t1: 1.3 }, beats: [{ word: "yawns", act: "sleepy" }] },
        { who: "juno", at: "b", act: "neutral" },
        { who: "gus", at: "c", act: "happy", beats: [{ word: "catches", act: "sleepy" }] },
      ] },
    { say: { who: "gus", text: "Hey! I wasn't even tired!" }, set: "city", light: "day", transition: "cut",
      camera: { move: "closeUp", on: "gus", from: -8, punch: true },
      actors: [{ who: "gus", at: "c", act: "sleepy", beats: [{ word: "hey", act: "shock" }] }],
      fx: [{ kind: "exclaim", on: "gus", word: "hey", life: 1.5 }], kicks: [{ word: "hey" }] },
    { say: "You see, catching yawns seems linked to empathy, your brain mirroring the people around you.", set: "lab", light: "interiorCool", transition: "fade",
      camera: { move: "pushIn", on: ["juno"], size: "full", to: "medium", from: 8, height: 1.45 },
      actors: [
        { who: "juno", at: "a", act: "explain", face: "smile" },
        { who: "milo", at: "b", act: "neutral", nod: [{ word: "mirroring" }] },
      ],
      fx: [{ kind: "idea", on: "juno", word: "empathy", life: 1.4 }] },
    { say: "The closer you are to someone, the more likely you are to catch theirs.", set: "lab", light: "interiorCool", transition: "cut",
      camera: { move: "overShoulder", over: "milo", at: "juno", side: 1 },
      actors: [
        { who: "milo", at: "b", back: true, nod: [{ word: "closer" }] },
        { who: "juno", at: "a", act: "explain", face: "smile" },
      ] },
    { say: "Friends catch each other's yawns far more than strangers do.", set: "oldtown", light: "golden", transition: "fade",
      camera: { move: "orbit", on: ["milo", "gus"], fromDeg: [-14, 14], size: "medium", height: 1.45 },
      actors: [{ who: "milo", at: "a", act: "laugh" }, { who: "gus", at: "b", act: "laugh" }],
      fx: [{ kind: "confetti", on: "gus", word: "friends", life: 1.8 }] },
    { say: "So if you yawned just now... congratulations, we're officially friends.", set: "nature", light: "night", transition: "dip",
      camera: { move: "crane", on: ["milo", "juno", "gus"], heights: [5, 1.5], size: "full", from: 6 },
      actors: [
        { who: "milo", at: "a", act: "sleepy" }, { who: "juno", at: "b", act: "happy" }, { who: "gus", at: "c", act: "happy", nod: [{ word: "friends" }] },
      ],
      fx: [{ kind: "zzz", on: "milo", word: "yawned", life: 2.2 }] },
  ],
};
