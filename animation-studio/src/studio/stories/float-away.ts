// Video 08 "In This World, If Nobody Thinks About You, You Float Away" (productions/float-away/script.md, v3 approved).
// Attention makes you heavy, being forgotten makes you float: every time the rule acts it looks and sounds the same
// (heads turn -> someone sinks / crushes what's under them, a heavy "thunk"; heads turn away -> feet lift, a soft
// "float_whoosh"). The lines, voices and gaps are the approved recordings (voice/cache); line 20 uses option B (a
// 0.35 s pause after "I was", spliced from the same take). Music: the Pancake Theme moods (sound/music.py).
import type { Storyboard, V3 } from "../story/types";

const VO = "liam", HUSH = "liamQuiet";
// ---- marks
// city (pavement y 0.15; road y 0 in front of the kerb, z > -4.6)
const CAFE: V3 = [0.3, 0.15, -5.6], FAN1: V3 = [-0.75, 0.15, -5.2], FAN2: V3 = [1.35, 0.15, -5.2], FAN3: V3 = [0.95, 0.15, -4.85], ASSIST: V3 = [1.45, 0.15, -5.9];
const GUSST: V3 = [-6.0, 0.15, -6.2];                        // Gus's doorstep (his street)
const BENCHM: V3 = [-3.6, 0.15, -6.2], SELLER: V3 = [-2.85, 0.15, -6.0];
const STOP: V3 = [-13.5, 0.15, -5.8];                         // the bus stop
const ROAD: V3 = [11.6, 0, -1.6];                             // where Gus lands
const SEATH = 0.46;                                           // snapChair `at` = its seat top
// old town
const POD: V3 = [-0.55, 0, 0.6], POL: V3 = [0.4, 0, 0.45], RIVAL: V3 = [-3.2, 0, 1.6];
// home set (6.6 x 5.2 m, ceiling 2.8)
const GK: V3 = [1.75, 0, -0.75], MK: V3 = [0.85, 0, -0.45];  // Gus and Milo in the kitchen
const CEIL = 0.8;                                             // Gus's feet when his head touches the ceiling
// apartment (Milo's room = the living room; the second kitchen)
const LIV: V3 = [-2.0, 0, -0.35], GP2: V3 = [4.0, 0, -0.45];   // the second grandpa at the kitchen counter (x 4.7)
const up = (p: V3, dy: number): V3 => [p[0], p[1] + dy, p[2]];

export const FLOATAWAY: Storyboard = {
  id: "float-away", title: "In This World, If Nobody Thinks About You, You Float Away",
  cast: { milo: "milo", gus: "gus", juno: "juno", star: { extra: 5 }, assistant: { extra: 8 }, pol: { extra: 3, era: "office" }, rival: { extra: 7, era: "office" },
    fan1: { extra: 1 }, fan2: { extra: 14 }, fan3: { extra: 15 }, benchMan: { extra: 12 }, seller: { extra: 10 }, kid1: { extra: 2 }, kid2: { extra: 9 },
    neigh1: { extra: 16 }, neigh2: { extra: 17 }, neigh3: { extra: 18 }, crowd1: { extra: 20 }, crowd2: { extra: 21 }, crowd3: { extra: 22 }, grandpa2: { extra: 96, era: "fifties" } },
  music: { mood: "quirky", gain: -3 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots: [
    // 1. cafe terrace: every head turns to the movie star; under the stares his chair explodes flat
    { say: { text: "In this world, the more people think about you, the heavier you get.", voice: VO, gap: 0.1 }, hold: 0.65, set: "city", light: "day", mood: "quirky",
      camera: { move: "frame", on: ["star", "fan1", "fan2", "fan3"], size: "full" },
      cams: [{ t: 3.6, move: "frame", on: ["star"], size: "medium", swoop: 0.2 }],
      actors: [{ who: "star", at: CAFE, mode: "sit", act: "proud", facing: "camera", idle: 0.3, walk: { to: up(CAFE, -0.36), t0: 0, t1: 1, mode: "ride", from: { word: "you", n: 2 }, until: { word: "get" } } },
        { who: "fan1", at: FAN1, act: "excited", facing: "toward:star" }, { who: "fan2", at: FAN2, act: "excited", facing: "toward:star" }, { who: "fan3", at: FAN3, act: "happy", facing: "toward:star" }],
      props: [{ id: "snapChair", at: up(CAFE, SEATH), variant: "chair", steps: [{ word: "get" }] }],
      sfx: [{ word: "think", name: "thunk", gain: -6 }, { word: "get", name: "crack", gain: -3 }, { word: "get", name: "poof", gain: -6 }] },
    // 2. the weary assistant's steel bench bends into a U the moment he sits; the star sighs
    { say: { text: "Movie stars break six chairs a day.", voice: VO, gap: 0.05 }, hold: 0.4, set: "city", light: "day",
      camera: { move: "frame", on: ["star", "assistant"], size: "full" },
      actors: [{ who: "star", at: CAFE, mode: "sit", act: "sad", facing: "camera", idle: 0.3, walk: { to: up(CAFE, -0.28), t0: 0, t1: 1, mode: "ride", from: { word: "six" }, until: { word: "day" } } },
        { who: "assistant", at: ASSIST, act: "sleepy", gesture: "present", facing: "toward:star" }],
      props: [{ id: "snapChair", at: up(CAFE, SEATH), variant: "bench", steps: [{ word: "six" }] }],
      sfx: [{ word: "six", name: "metal_groan", gain: -5 }, { word: "day", name: "trombone_slide", gain: -6 }] },
    // 3. old-town square, election day: the crowd chants his name; the politician sinks to his knees in the cobbles
    { say: { text: "Politicians sink during speeches.", voice: VO, gap: 0.1 }, hold: 0.2, set: "oldtown", light: "day", mood: "quirkyFull", transition: "cut",
      camera: { move: "at", pos: [0.3, 1.3, 4.6], look: [0.2, 1.25, 0.4], fov: 46 },
      actors: [{ who: "pol", at: POL, act: "proud", facing: "camera", idle: 0.3, walk: { to: up(POL, -0.6), t0: 0.2, t1: 1, mode: "ride", until: { word: "speeches" } } },
        { who: "crowd1", at: [-1.15, 0, 2.2], back: true, act: "excited", gesture: "cheer" }, { who: "crowd2", at: [1.55, 0, 2.3], back: true, act: "excited", gesture: "cheer" }],
      props: [{ id: "podium", at: POD }, { id: "signBoard", at: [-0.95, 0, -0.5], variant: "VOTE BRISTOW" }],
      sfx: [{ t: 0.1, name: "crowd_aye", gain: -8 }, { t: 0.3, name: "thunk", gain: -6 }, { word: "sink", name: "tuba_sink", gain: -7 }] },
    // 4. a rival at a market stall steals the crowd...
    { say: { who: "rival", text: "Free pizza over here!", voice: "chris", gap: 0.05 }, hold: 0.1, set: "oldtown", light: "day", transition: "whip",
      camera: { move: "frame", on: ["rival"], size: "medium" },
      actors: [{ who: "rival", at: RIVAL, act: "excited", gesture: "raiseHand", facing: "camera" }] },
    //    ...every head turns away, they run off, and the politician pops out of the cobbles and floats, clutching the podium
    { dur: 1.9, set: "oldtown", light: "day", transition: "whip",
      camera: { move: "at", pos: [-0.55, 1.35, 6.8], look: [-0.55, 1.15, 1.0], fov: 50 },
      actors: [{ who: "pol", at: up(POL, -0.6), act: "shock", gesture: "grab", facing: "camera", walk: { to: up(POL, 0.5), t0: 0.75, t1: 1.25, mode: "ride" } },
        { who: "crowd1", at: [-1.15, 0, 2.2], act: "excited", facing: -1, beats: [{ t: 0.05, look: "left" }], walk: { to: [-4.6, 0, 2.6], t0: 0.25, t1: 1.6, mode: "run" } },
        { who: "crowd2", at: [-0.45, 0, 2.7], act: "excited", facing: -1, beats: [{ t: 0.05, look: "left" }], walk: { to: [-4.2, 0, 3.0], t0: 0.3, t1: 1.7, mode: "run" } }],
      props: [{ id: "podium", at: POD }, { id: "signBoard", at: [-0.95, 0, -0.5], variant: "VOTE BRISTOW" }],
      sfx: [{ t: 0.3, name: "crowd_murmur", gain: -14 }, { t: 0.75, name: "pop_gliss", gain: -6 }, { t: 0.8, name: "float_whoosh", gain: -8 }] },
    // 5. dusk: an old man on a bench nobody looks at drifts up past the balloon seller, past the lamps
    { say: { text: "If nobody thinks about you... you float away.", voice: VO, gap: 0.05 }, hold: 0.6, set: "city", light: "golden", mood: "drift", transition: "cut",
      camera: { move: "at", pos: [-3.1, 1.35, -2.6], look: [-3.15, 1.3, -6.2], fov: 52 },
      cams: [{ word: "float", move: "at", pos: [-3.1, 2.6, -2.4], look: [-3.0, 4.4, -6.2], fov: 56, glide: 1.6 }],
      actors: [{ who: "benchMan", at: up(BENCHM, 0), mode: "sit", act: "sad", facing: "camera", idle: 0.2, walk: { to: [BENCHM[0] - 0.8, 4.65, BENCHM[2]], t0: 0, t1: 3.2, mode: "ride", from: { word: "float" } } },
        { who: "seller", at: SELLER, act: "happy", gesture: "hold", facing: "camera" }],
      props: [{ id: "snapChair", at: up(BENCHM, SEATH), variant: "bench" }, { id: "balloons", at: [-2.5, 0.15, -6.05] }],
      sfx: [{ word: "float", name: "float_whoosh", gain: -6 }] },
    // 6. Gus's street: the heaviest man around; his bench bends under him; kids queue with bikes; he hands Juno hers
    { say: { text: "My grandpa Gus was the heaviest man on our street.", voice: VO, gap: 0.1 }, hold: 0.3, set: "city", light: "day", mood: "pancake", transition: "cut",
      camera: { move: "frame", on: ["gus", "juno", "kid1"], size: "full" },
      cams: [{ word: "street", move: "frame", on: ["gus", "juno"], size: "medium" }],
      actors: [{ who: "gus", at: GUSST, mode: "sit", act: "happy", gesture: "offer", facing: "toward:juno", walk: { to: up(GUSST, -0.22), t0: 0, t1: 1, mode: "ride", from: { word: "heaviest" }, until: { word: "man" } } },
        { who: "juno", at: [-4.95, 0.15, -5.75], act: "happy", facing: "toward:gus" }, { who: "kid1", at: [-3.9, 0.15, -6.3], act: "neutral", facing: "toward:gus" }],
      props: [{ id: "snapChair", at: up(GUSST, SEATH), variant: "bench", steps: [{ word: "heaviest" }] }, { id: "bike", at: [-5.0, 0.15, -5.25], variant: "pink" }, { id: "bike", at: [-3.75, 0.15, -5.85], variant: "blue" }],
      sfx: [{ word: "heaviest", name: "metal_groan", gain: -8 }, { word: "heaviest", name: "thunk", gain: -8 }] },
    // 7. Gus's kitchen, pancake war: his pancake flies up and sticks to the ceiling
    { say: { text: "Every Sunday, we had a pancake war.", voice: VO, gap: 0.05 }, hold: 0.25, set: "home", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["gus", "milo"], size: "medium" },
      cams: [{ word: "war", move: "at", pos: [1.25, 1.15, 1.5], look: [1.35, 2.25, -0.7], fov: 58, whip: true }],
      actors: [{ who: "gus", at: GK, act: "laugh", gesture: "clap", facing: "toward:milo", beats: [{ word: "war", look: "up" }] }, { who: "milo", at: MK, act: "laugh", gesture: "clap", facing: "toward:gus", beats: [{ word: "war", look: "up" }] }],
      props: [{ id: "pancake", at: [1.4, 2.79, -0.7], scale: 1.7 }],
      sfx: [{ word: "pancake", name: "whoosh_short", gain: -8 }, { word: "war", name: "splat", gain: -4 }] },
    // 8. "Ceiling counts as a plate!" -- and the pancake drops onto Milo's head
    { say: { who: "gus", text: "Ceiling counts as a plate!", voice: "brian", gap: 0.05 }, hold: 0.8, set: "home", light: "interior",
      camera: { move: "closeUp", on: "gus" },
      cams: [{ t: 1.75, move: "closeUp", on: "milo" }],
      actors: [{ who: "gus", at: GK, act: "proud", facing: "toward:milo" }, { who: "milo", at: MK, act: "laugh", facing: "toward:gus", beats: [{ t: 1.75, act: "dazed" }] }],
      props: [{ id: "pancake", at: [0.85, 1.74, -0.4] }],
      sfx: [{ t: 1.75, name: "thud", gain: -10 }, { t: 1.8, name: "boing", gain: -12 }] },
    // 9. the cheat: Gus slides a checker under his moustache while Milo looks away
    { dur: 1.1, set: "home", light: "interior",
      camera: { move: "insert", on: "gus.face", size: "close" },
      actors: [{ who: "gus", at: [-0.2, 0, -0.2], act: "suspicious", facing: "camera" }],
      props: [{ id: "checker", at: [-0.2, 1.42, -0.06] }],
      sfx: [{ t: 0.4, name: "clink", gain: -14 }] },
    // 10. then Grandma died: Gus alone at the table; his heels lift off the floor
    { say: { text: "Then Grandma died, and he started getting lighter.", voice: VO, gap: 0.1 }, hold: 0.35, set: "home", light: "interior", mood: "drift", transition: "cut",
      camera: { move: "frame", on: ["gus"], size: "full" },
      cams: [{ word: "lighter", move: "at", pos: [0.45, 0.4, 1.3], look: [0.45, 0.32, -0.2], fov: 44 }],
      actors: [{ who: "gus", at: [0.45, 0, -0.2], act: "sad", facing: "camera", idle: 0.2, walk: { to: [0.45, 0.22, -0.2], t0: 0, t1: 1, mode: "ride", from: { word: "started" }, until: { word: "lighter" } } }],
      sfx: [{ word: "lighter", name: "float_whoosh", gain: -8 }] },
    // 11. he ties his ankle to the kitchen chair with a scarf before filling the kettle
    { dur: 1.3, set: "home", light: "interior",
      camera: { move: "at", pos: [1.0, 0.55, 1.3], look: [1.75, 0.45, -0.75], fov: 50 },
      actors: [{ who: "gus", at: up(GK, 0.22), act: "determined", gesture: "hold", facing: "camera" }],
      props: [{ id: "chair", at: [0.95, 0, -0.75] }, { id: "washingLine", at: [1.15, 0.31, -0.7], variant: "scarf" }],
      sfx: [{ t: 0.4, name: "creak", gain: -12 }] },
    // 12. windy street: lamppost to lamppost; a gust lifts him sideways like a flag
    { dur: 1.6, set: "city", light: "day",
      camera: { move: "at", pos: [-8.5, 1.8, -2.0], look: [-8.5, 1.6, -6.0], fov: 56 },
      actors: [{ who: "gus", at: [-8.6, 0.15, -5.9], act: "scared", gesture: "grab", facing: "camera", walk: { to: [-8.0, 0.9, -5.9], t0: 0.4, t1: 1.2, mode: "ride" } }],
      props: [{ id: "streetLamp", at: [-9.3, 0.15, -6.0] }],
      sfx: [{ t: 0.4, name: "storm_wind", gain: -12 }, { t: 0.6, name: "float_whoosh", gain: -10 }] },
    // 13. Milo's room: gaming with friends on a headset, laughing
    { say: { text: "I got busy. New school. New phone.", voice: VO, gap: 0.05 }, hold: 0.15, set: "apartment", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "medium" },
      actors: [{ who: "milo", at: LIV, act: "laugh", hold: "phone", facing: "camera", idle: 0.5 }],
      sfx: [{ t: 0.3, name: "blip_up", gain: -14 }, { t: 1.2, name: "blip_up", gain: -14 }] },
    // 14. a video call: Milo glances at it...
    { say: { who: "milo", text: "Grandpa, are you on the ceiling?", voice: VO, gap: 0.2 }, hold: 0.1, set: "apartment", light: "interior",
      camera: { move: "insert", on: "livePhone", size: "close" },
      cams: [{ word: "ceiling", move: "closeUp", on: "milo" }],
      actors: [{ who: "milo", at: LIV, act: "confused", hold: "phone", facing: "camera" }],
      props: [{ id: "livePhone", at: [-1.9, 1.05, 0.45], variant: "call" }],
      sfx: [{ t: 0.05, name: "ringtone", gain: -12 }] },
    //     ...Grandpa is pinned to the ceiling beside the light: "Changing a lightbulb! Go play."
    { say: { who: "gus", text: "Changing a lightbulb! Go play.", voice: "brian", gap: 0.05 }, hold: 0.2, set: "home", light: "interior",
      camera: { move: "at", pos: [1.0, 1.0, 1.5], look: [1.6, 2.2, -0.7], fov: 54 },
      actors: [{ who: "gus", at: up(GK, CEIL), act: "nervous", gesture: "pointUp", facing: "camera" }],
      sfx: [{ t: 0.1, name: "boing", gain: -12 }] },
    // 15. while Milo looked, Gus sank a little; Milo hangs up, and alone, Gus drifts back to the ceiling (the clue)
    { dur: 1.5, set: "home", light: "interior",
      camera: { move: "at", pos: [0.2, 1.4, 2.2], look: [1.6, 1.6, -0.7], fov: 50 },
      actors: [{ who: "gus", at: up(GK, 0.35), act: "sad", facing: "camera", idle: 0.2, walk: { to: up(GK, CEIL), t0: 0.3, t1: 1.4, mode: "ride" } }],
      sfx: [{ t: 0.25, name: "ding", gain: -16 }, { t: 0.45, name: "float_whoosh", gain: -9 }] },
    // 16. birthday: the hug clinks; Milo pulls back
    { say: { text: "On my birthday, his hug clinked.", voice: VO, gap: 0.05 }, hold: 0.3, set: "home", light: "interior", mood: "hush", transition: "cut",
      camera: { move: "frame", on: ["gus", "milo"], size: "medium" },
      cams: [{ word: "clinked", move: "closeUp", on: "milo" }],
      actors: [{ who: "gus", at: [-0.35, 0.05, 0.1], act: "happy", gesture: "spread", facing: "toward:milo" }, { who: "milo", at: [0.2, 0, 0.15], act: "happy", facing: "toward:gus", beats: [{ word: "clinked", act: "confused" }] }],
      sfx: [{ word: "clinked", name: "clink", gain: -6 }] },
    // 17. stones: a handful from his pocket, more spilled from his shoes
    { say: { text: "Stones. Everywhere.", voice: VO, gap: 0.05 }, hold: 0.2, set: "home", light: "interior",
      camera: { move: "insert", on: "pocketStones", size: "macro" },
      cams: [{ word: "Everywhere", move: "at", pos: [0.55, 0.7, 1.4], look: [0.45, 0.05, 0.35], fov: 48 }],
      actors: [],
      props: [{ id: "pocketStones", at: [0.45, 0.0, 0.35], variant: "pile" }, { id: "pocketStones", at: [0.3, 0.0, 0.6], variant: "heap" }],
      sfx: [{ t: 0.1, name: "clink", gain: -10 }, { word: "Everywhere", name: "clink", gain: -9 }] },
    // 18. Gus, a finger to his lips, smiling: "Don't tell your mother."
    { say: { who: "gus", text: "Don't tell your mother.", voice: "brian", gap: 0.1 }, hold: 0.35, set: "home", light: "interior",
      camera: { move: "closeUp", on: "gus" },
      actors: [{ who: "gus", at: [-0.35, 0.05, 0.1], act: "embarrassed", gesture: "coverMouth", facing: "camera" }] },
    // 19. storm night: the front door bangs open; the stones roll out of his pockets one by one
    { say: { text: "That night, a storm blew his door open.", voice: VO, gap: 0.1 }, hold: 0.2, set: "home", light: "interiorCool", mood: "storm", ambience: "amb_storm", transition: "cut",
      camera: { move: "frame", on: ["gus"], size: "full" },
      actors: [{ who: "gus", at: "armchair", mode: "sit", act: "scared", facing: "camera", beats: [{ word: "door", look: "left" }] }],
      props: [{ id: "stonesRoll", at: [-1.4, 0.75, 0.6], steps: [{ word: "door" }] }],
      sfx: [{ word: "storm", name: "storm_wind", gain: -4 }, { word: "door", name: "impact", gain: -6 }] },
    // 20. he rises out of the armchair and drifts out of the door
    { dur: 1.4, set: "home", light: "interiorCool", ambience: "amb_storm",
      camera: { move: "at", pos: [0.6, 1.5, 2.2], look: [-2.0, 1.4, 0.3], fov: 52 },
      actors: [{ who: "gus", at: "armchair", mode: "sit", act: "scared", gesture: "grab", facing: "camera", walk: { to: [-2.9, 0.9, 0.2], t0: 0.15, t1: 1.35, mode: "ride" } }],
      sfx: [{ t: 0.2, name: "float_whoosh", gain: -6 }, { t: 0.9, name: "storm_wind", gain: -8 }] },
    // 21. the street at night: Milo leaps, grabs his ankle -- and they both lift off
    { say: { text: "I tried everything.", voice: VO, gap: 0.1 }, hold: 0.4, set: "city", light: "night", ambience: "amb_storm", transition: "cut",
      camera: { move: "at", pos: [-2.0, 2.0, -0.6], look: [-2.0, 1.95, -5.6], fov: 56 },
      actors: [{ who: "gus", at: [-2.0, 1.3, -5.6], act: "scared", facing: "camera", walk: { to: [-2.0, 1.75, -5.6], t0: 0, t1: 1.5, mode: "ride" } },
        { who: "milo", at: [-2.0, 0.15, -5.4], act: "determined", gesture: "raiseHand", facing: "camera", walk: { to: [-2.0, 0.45, -5.4], t0: 0.3, t1: 1.5, mode: "ride" } }],
      sfx: [{ t: 0.3, name: "whoosh_short", gain: -8 }, { t: 0.4, name: "float_whoosh", gain: -9 }] },
    // 22. Milo ties him to a lamppost with the washing line; it snaps
    { dur: 1.5, set: "city", light: "night", ambience: "amb_storm",
      camera: { move: "at", pos: [-0.4, 2.0, -1.3], look: [-0.35, 2.3, -5.8], fov: 60 },
      actors: [{ who: "gus", at: [0.15, 1.4, -5.8], act: "scared", gesture: "grab", facing: "camera", walk: { to: [0.25, 1.95, -5.8], t0: 0.7, t1: 1.5, mode: "ride" } },
        { who: "milo", at: [-1.4, 0.15, -5.4], act: "determined", gesture: "fists", facing: "camera" }],
      props: [{ id: "streetLamp", at: [-1.75, 0.15, -5.9] }, { id: "washingLine", at: [-1.7, 2.0, -5.85], steps: [{ t: 0.65 }] }],
      sfx: [{ t: 0.65, name: "crack", gain: -6 }] },
    // 23. Milo shouts memories; Gus dips on each one
    { say: { who: "milo", text: "You taught me to ride a bike! You burn every pancake!", voice: VO, gap: 0.1 }, hold: 0.3, set: "city", light: "night", ambience: "amb_storm",
      camera: { move: "closeUp", on: "milo" },
      cams: [{ word: "bike", move: "at", pos: [-2.2, 1.6, -1.2], look: [-1.8, 4.2, -7.0], fov: 54 }, { word: "burn", move: "closeUp", on: "milo" }, { word: "pancake", move: "at", pos: [-2.2, 1.6, -1.2], look: [-1.8, 4.0, -7.0], fov: 54 }],
      actors: [{ who: "milo", at: [-2.2, 0.15, -4.4], act: "angry", gesture: "fists", facing: "camera" },
        { who: "gus", at: [-1.8, 4.6, -7.0], act: "sad", facing: "camera", walk: { to: [-1.8, 3.9, -7.0], t0: 0, t1: 1, mode: "ride", from: { word: "bike" }, until: { word: "pancake" } } }],
      sfx: [{ word: "bike", name: "thunk", gain: -9 }, { word: "pancake", name: "thunk", gain: -8 }] },
    // 24. ...and he rises anyway, waving down as if it's fine. Milo freezes: "Then it hit me."
    { say: { text: "Then it hit me. He started floating the spring I stopped visiting.", voice: HUSH, gap: 0.3 }, until: { word: "me" }, set: "city", light: "night", mood: "stormPulse", ambience: "amb_storm",
      camera: { move: "at", pos: [-2.2, 1.4, -1.8], look: [-1.8, 3.4, -7.0], fov: 52 },
      cams: [{ word: "Then", move: "closeUp", on: "milo" }],
      actors: [{ who: "milo", at: [-2.2, 0.15, -4.4], act: "sad", facing: "camera", idle: 0.1 },
        { who: "gus", at: [-1.8, 3.9, -7.0], act: "happy", gesture: "wave", facing: "camera", walk: { to: [-1.8, 5.6, -7.0], t0: 0, t1: 1.2, mode: "ride" } }],
      sfx: [{ t: 0.1, name: "float_whoosh", gain: -9 }] },
    //     flashback: the empty kitchen after the call, Gus drifting back up to the ceiling
    { cont: true, until: { word: "spring" }, set: "home", light: "interior", ambience: false,
      camera: { move: "at", pos: [0.2, 1.4, 2.2], look: [1.6, 1.6, -0.7], fov: 50 },
      actors: [{ who: "gus", at: up(GK, 0.4), act: "sad", facing: "camera", idle: 0.1, walk: { to: up(GK, CEIL), t0: 0, t1: 1.6, mode: "ride" } }] },
    //     back to Milo: "...I stopped visiting."
    { cont: true, hold: 0.35, set: "city", light: "night", ambience: "amb_storm",
      camera: { move: "pushIn", on: ["milo"], size: "medium", to: "close" },
      actors: [{ who: "milo", at: [-2.2, 0.15, -4.4], act: "sad", facing: "camera", idle: 0.1 }] },
    // 25. "I was... the last one." Total silence (music and the bed cut)
    { say: { text: "I was the last one.", voice: HUSH, gap: 0.2, pauses: [{ after: "was", s: 0.35 }] }, hold: 0.7, set: "city", light: "night", mood: "silence", ambience: false,
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: [-2.2, 0.15, -4.4], act: "sad", face: "sad", facing: "camera", idle: 0.05 }] },
    // 26. Milo sits on the kerb in the rain; the camera pulls slowly back; Gus is a speck among the stars; one music-box note
    { dur: 3.1, set: "city", light: "night", ambience: false,
      camera: { move: "at", pos: [-2.2, 1.0, -2.6], look: [-2.2, 0.8, -4.5], fov: 48 },
      cams: [{ t: 0.1, move: "at", pos: [-2.4, 2.4, 0.6], look: [-2.1, 2.6, -8.0], fov: 56, glide: 2.9, blockOk: true }],
      actors: [{ who: "milo", at: [-2.2, 0.0, -4.35], mode: "sit", act: "sad", facing: "camera", idle: 0.05 },
        { who: "gus", at: [-1.6, 7.6, -5.6], act: "sad", facing: "camera" }],
      sfx: [{ t: 1.5, name: "musicbox_note", gain: -10 }] },
    // 27. he wipes his face, looks at the phone in his hand, and stands: the decision
    { dur: 1.3, set: "city", light: "night", ambience: "amb_storm",
      camera: { move: "frame", on: ["milo"], size: "medium", height: 0.9 },
      actors: [{ who: "milo", at: [-2.2, 0.15, -4.4], act: "determined", hold: "phone", facing: "camera", beats: [{ t: 0.15, gesture: "facepalm" }, { t: 0.7, gesture: "hold", look: "down" }, { t: 1.05, look: "camera" }] }] },
    // 28. the bus stop: he climbs the shelter and holds his phone up: LIVE
    { say: { text: "I climbed the bus stop and went live.", voice: VO, gap: 0.1 }, hold: 0.25, set: "city", light: "night", mood: "rise1", ambience: "amb_city_night", transition: "cut",
      camera: { move: "at", pos: [-12.0, 3.0, -2.4], look: [-13.5, 3.35, -5.8], fov: 50 },
      actors: [{ who: "milo", at: up(STOP, 2.55), act: "determined", gesture: "raiseHand", hold: "phone", facing: "camera" }] },
    // 29. "That's my grandpa! His name is Gus!" (Gus in the sky behind)
    { say: { who: "milo", text: "That's my grandpa! His name is Gus!", voice: VO, gap: 0.05 }, hold: 0.2, set: "city", light: "night", mood: "rise2", ambience: "amb_city_night",
      camera: { move: "at", pos: [-13.0, 2.4, -2.6], look: [-13.4, 3.6, -6.5], fov: 54 },
      actors: [{ who: "milo", at: up(STOP, 2.55), act: "excited", gesture: "pointUp", hold: "phone", facing: "camera" },
        { who: "gus", at: [-11.8, 6.2, -10.5], act: "sad", facing: "camera" }] },
    // 30. 3 viewers; comments: "fake", "nice balloon" (the music deflates to the piano)
    { say: { text: "Three viewers. One said \"fake.\"", voice: VO, gap: 0.05 }, hold: 0.6, set: "city", light: "night", mood: "rise1", ambience: "amb_city_night",
      camera: { move: "at", pos: [-13.5, 1.387, -4.277], look: [-13.5, 1.387, -4.6], fov: 34 },
      actors: [],
      props: [{ id: "livePhone", at: [-13.5, 1.3, -4.6], variant: "live", steps: [{ word: "fake" }, { t: 2.4 }] }],
      sfx: [{ word: "fake", name: "pop", gain: -9 }, { t: 2.4, name: "pop", gain: -10 }] },
    // 31. Juno's bedroom: she sees the stream, rolls her eyes, her thumb moves to swipe away
    { say: { text: "Then Juno saw it. Two million followers. She hates me.", voice: VO, gap: 0.1 }, hold: 0.2, set: "home", light: "interiorCool", ambience: false, transition: "cut",
      camera: { move: "frame", on: ["juno"], size: "medium" },
      actors: [{ who: "juno", at: [0.45, 0, -0.2], act: "sleepy", hold: "phone", facing: "camera", beats: [{ word: "hates", act: "suspicious", look: "up" }] }] },
    //     ...she stops: Gus. A flashback to the bike
    { dur: 0.9, set: "city", light: "day", ambience: false,
      camera: { move: "frame", on: ["gus", "juno"], size: "medium" },
      actors: [{ who: "gus", at: GUSST, mode: "sit", act: "happy", gesture: "offer", facing: "toward:juno" }, { who: "juno", at: [-4.95, 0.15, -5.75], act: "happy", facing: "toward:gus" }],
      props: [{ id: "bike", at: [-5.0, 0.15, -5.25], variant: "pink" }, { id: "snapChair", at: up(GUSST, SEATH), variant: "bench" }] },
    //     "Ugh. He fixed my bike." -- share (the caption), SHARED
    { say: { who: "juno", text: "Ugh. He fixed my bike.", voice: "juno", gap: 0.05 }, hold: 0.4, set: "home", light: "interiorCool", mood: "rise3", ambience: false,
      camera: { move: "closeUp", on: "juno" },
      cams: [{ word: "bike", move: "at", pos: [0.55, 0.837, 0.773], look: [0.55, 0.837, 0.45], fov: 34 }],
      actors: [{ who: "juno", at: [0.45, 0, -0.2], act: "embarrassed", hold: "phone", facing: "camera" }],
      props: [{ id: "livePhone", at: [0.55, 0.75, 0.45], variant: "share", steps: [{ t: 1.9 }] }],
      sfx: [{ t: 1.9, name: "ding", gain: -8 }] },
    // 33. the counter jumps: 10,000, then 80,000, hearts flooding the screen (the brass Pancake Theme)
    { say: { text: "Ten thousand. Eighty thousand.", voice: VO, gap: 0.05 }, hold: 0.25, set: "city", light: "night", mood: "rise4", ambience: "amb_city_night",
      camera: { move: "at", pos: [-13.5, 1.387, -4.277], look: [-13.5, 1.387, -4.6], fov: 34 },
      actors: [],
      props: [{ id: "livePhone", at: [-13.5, 1.3, -4.6], variant: "live", steps: [{ t: 0 }, { t: 0.01 }, { word: "Ten" }, { word: "Eighty" }] }],
      sfx: [{ word: "Ten", name: "ding", gain: -7 }, { word: "Eighty", name: "ding", gain: -5 }] },
    // 34. windows light up; neighbours in pyjamas look up; with every head turned up, Gus drops in big steps
    { dur: 1.6, set: "city", light: "night", ambience: "amb_city_night",
      camera: { move: "at", pos: [10.2, 1.5, 3.2], look: [11.4, 3.2, -3.0], fov: 56 },
      actors: [{ who: "neigh1", at: [9.6, 0.15, -5.4], act: "shock", facing: "camera", beats: [{ t: 0, look: "up" }] }, { who: "neigh2", at: [12.9, 0.15, -5.5], act: "excited", hold: "phone", facing: "camera", beats: [{ t: 0, look: "up" }] },
        { who: "neigh3", at: [10.9, 0.15, -6.0], act: "shock", facing: "camera", beats: [{ t: 0, look: "up" }] },
        { who: "gus", at: up(ROAD, 6.2), act: "shock", facing: "camera", walk: { to: up(ROAD, 2.6), t0: 0.1, t1: 1.55, mode: "ride" } }],
      sfx: [{ t: 0.15, name: "thunk", gain: -8 }, { t: 0.7, name: "thunk", gain: -7 }, { t: 1.05, name: "thunk", gain: -6 }, { t: 0.3, name: "gasp", gain: -12 }, { t: 0.3, name: "riser", gain: -9 }] },
    // 35. he slams into the road and the asphalt cracks in a star; dust; he sits up, fine
    { say: { text: "He came down so hard, he cracked the road.", voice: VO, gap: 0.55 }, hold: 0.5, set: "city", light: "night", mood: "silence", ambience: "amb_city_night", transition: "cut",
      camera: { move: "at", pos: [11.6, 1.2, 2.2], look: [11.6, 0.6, -1.6], fov: 54 },
      actors: [{ who: "gus", at: up(ROAD, 2.4), mode: "sit", act: "shock", facing: "camera", walk: { to: ROAD, t0: 0.3, t1: 0.5, mode: "ride" } }],
      props: [{ id: "roadCrack", at: [ROAD[0], 0, ROAD[2] + 0.45], steps: [{ t: 0.5 }] }],
      sfx: [{ t: 0.5, name: "ground_crack", gain: -2 }, { t: 0.52, name: "impact", gain: -4 }, { t: 0.55, name: "poof", gain: -6 }] },
    // 36. the cafe from shot 1, day: Gus sits and the chair snaps; "This is your fault."; kids queue with bikes again
    { say: { text: "Now he breaks every chair he sits on.", voice: VO, gap: 0.2 }, hold: 0.1, set: "city", light: "day", mood: "pancake", ambience: "amb_city_day", transition: "cut",
      camera: { move: "frame", on: ["gus", "milo", "kid1"], size: "full" },
      actors: [{ who: "gus", at: CAFE, mode: "sit", act: "happy", facing: "camera", walk: { to: up(CAFE, -0.36), t0: 0, t1: 1, mode: "ride", from: { word: "sits" }, until: { word: "on" } } },
        { who: "milo", at: FAN2, act: "laugh", facing: "toward:gus" }, { who: "kid1", at: FAN1, act: "happy", facing: "toward:gus" }],
      props: [{ id: "snapChair", at: up(CAFE, SEATH), variant: "chair", steps: [{ word: "sits" }] }, { id: "bike", at: [-1.25, 0.15, -4.75], variant: "blue" }],
      sfx: [{ word: "sits", name: "crack", gain: -4 }, { word: "sits", name: "poof", gain: -8 }, { word: "on", name: "trombone_slide", gain: -8 }] },
    { say: { who: "gus", text: "This is your fault.", voice: "brian", gap: 0.05 }, hold: 0.3, set: "city", light: "day",
      camera: { move: "frame", on: ["gus", "milo"], size: "medium" },
      actors: [{ who: "gus", at: up(CAFE, -0.36), mode: "sit", act: "angry", gesture: "point", facing: "toward:milo" }, { who: "milo", at: FAN2, act: "shrug", facing: "toward:gus" }],
      props: [{ id: "snapChair", at: up(CAFE, SEATH), variant: "chair", steps: [{ t: 0 }] }] },
    // 37. Gus's kitchen: the pancake war is back -- his pancake sticks to the ceiling again, and Milo laughs
    { dur: 1.2, set: "home", light: "interior",
      camera: { move: "frame", on: ["gus", "milo"], size: "medium" },
      cams: [{ t: 0.6, move: "at", pos: [1.25, 1.15, 1.5], look: [1.35, 2.25, -0.7], fov: 58, whip: true }],
      actors: [{ who: "gus", at: GK, act: "laugh", gesture: "clap", facing: "toward:milo", beats: [{ t: 0.6, look: "up" }] }, { who: "milo", at: MK, act: "laugh", facing: "toward:gus", beats: [{ t: 0.6, look: "up" }] }],
      props: [{ id: "pancake", at: [1.4, 2.79, -0.7], scale: 1.7 }],
      sfx: [{ t: 0.65, name: "splat", gain: -5 }] },
    // 38. a different kitchen, a different grandpa, holding the counter, feet floating; his phone rings; he sinks gently down
    { say: { text: "So call your grandpa. Right now. He might be holding onto the counter.", voice: VO, gap: 0.2 }, hold: 0.45, set: "apartment", light: "interior", mood: "warmTheme", transition: "cut",
      camera: { move: "at", pos: [3.35, 1.2, 2.6], look: [4.0, 1.15, -0.45], fov: 50 },
      actors: [{ who: "grandpa2", at: up(GP2, 0.45), act: "sad", gesture: "grab", hold: "cane", facing: "camera", beats: [{ word: "Right", act: "happy", gesture: "hold" }],
        walk: { to: GP2, t0: 0, t1: 1, mode: "ride", from: { word: "holding" }, until: { word: "counter" } } }],
      sfx: [{ word: "Right", name: "ringtone", gain: -10 }] },
  ],
};
