// Stage 1E demo storyboard (18 s): "Why is yawning contagious?" — written only as data; the engine does the rest.
import type { Storyboard } from "../story/types";

export const YAWN_DEMO: Storyboard = {
  id: "yawn-demo", title: "Why is yawning contagious? (pipeline demo)",
  cast: { milo: "milo", juno: "juno", gus: "gus" },
  shots: [
    { note: "Milo yawns on the street... and Gus catches it.", dur: 3.0, set: "city", light: "day",
      camera: { move: "frame", on: ["milo", "juno", "gus"], size: "full", from: 4, height: 1.5 },
      actors: [
        { who: "milo", at: "kerb", walk: { to: "a", t0: 0, t1: 1.3 }, beats: [{ t: 1.5, act: "sleepy" }] },
        { who: "juno", at: "b", act: "neutral" },
        { who: "gus", at: "c", act: "happy", beats: [{ t: 2.2, act: "sleepy" }] },
      ] },
    { note: "Gus realises he just yawned too.", dur: 2.0, set: "city", light: "day", transition: "cut",
      camera: { move: "closeUp", on: "gus", from: -8, punch: true },
      actors: [{ who: "gus", at: "c", act: "sleepy", beats: [{ t: 0.35, act: "shock" }] }],
      fx: [{ kind: "exclaim", on: "gus", t: 0.35, life: 1.5 }], kicks: [0.35] },
    { note: "You see, yawning is wired to empathy...", dur: 4.0, set: "lab", light: "interiorCool", transition: "fade",
      camera: { move: "pushIn", on: ["juno"], size: "full", to: "medium", from: 8, height: 1.45 },
      actors: [
        { who: "juno", at: "a", act: "explain", talk: [[0.3, 3.7]] },
        { who: "milo", at: "b", act: "neutral", nod: [2.0] },
      ],
      fx: [{ kind: "idea", on: "juno", t: 1.0, life: 1.4 }] },
    { note: "...the closer you are to someone, the more you catch theirs.", dur: 3.0, set: "lab", light: "interiorCool", transition: "cut",
      camera: { move: "overShoulder", over: "milo", at: "juno", side: 1 },
      actors: [
        { who: "milo", at: "b", back: true, nod: [1.8] },
        { who: "juno", at: "a", act: "point", talk: [[0.2, 2.6]] },
      ] },
    { note: "Friends yawn together.", dur: 3.0, set: "oldtown", light: "golden", transition: "fade",
      camera: { move: "orbit", on: ["milo", "gus"], fromDeg: [-14, 14], size: "medium", height: 1.45 },
      actors: [{ who: "milo", at: "a", act: "laugh" }, { who: "gus", at: "b", act: "laugh" }],
      fx: [{ kind: "confetti", on: "gus", t: 0.8, life: 1.8 }] },
    { note: "So if you yawned while watching this... we're friends now.", dur: 3.0, set: "nature", light: "night", transition: "dip",
      camera: { move: "crane", on: ["milo", "juno", "gus"], heights: [5, 1.5], size: "full", from: 6 },
      actors: [
        { who: "milo", at: "a", act: "sleepy" }, { who: "juno", at: "b", act: "happy" }, { who: "gus", at: "c", act: "happy", nod: [1.6] },
      ],
      fx: [{ kind: "zzz", on: "milo", t: 0.8, life: 2.2 }] },
  ],
};
