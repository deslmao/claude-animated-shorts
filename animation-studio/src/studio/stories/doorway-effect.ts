// "Why You Forget Why You Walked Into a Room" (Thinkora Video 03, the doorway effect). Research and script:
// productions/doorway-effect/. Camera language from the reference clip analysis (docs/proposals/vs2-reference-notes-2.md):
// continuous travel through the doorway instead of cuts, low subject-level angles, an object insert that carries the
// idea (the keys), stillness only on punchlines, a new framing on the key word of each line. Controlled motion blur
// (2.0 blur correction): motion while travelling, sharp landings.
// Assets: the everyday theme (apartment set with a real doorway, keys, bowl of keys, toaster, thought bubble) + Milo,
// Juno and two modern extras as study volunteers.
import type { Storyboard } from "../story/types";

export const DOORWAYEFFECT: Storyboard = {
  id: "doorway-effect",
  title: "Why You Forget Why You Walked Into a Room",
  cast: { milo: "milo", juno: "juno", volA: { extra: 3 }, volB: { extra: 7 } },
  music: "curious", motionBlur: true, controlledBlur: true, engine: 2,
  shots: [
    // HOOK: we fly through the doorway into the kitchen with Milo, his thought bubble (the keys) bursts the moment he
    // arrives ("forget"), then the camera snaps round to the doorway itself, low and accusing ("the doorway did it")
    { say: { text: "You walk into a room and instantly forget why. Scientists think the doorway did it.", voice: "georgeLively" }, set: "apartment", light: "interior",
      camera: { move: "at", pos: [-1.9, 1.45, -0.1], look: [0.6, 1.3, -0.5], fov: 46 },
      cams: [
        { word: "room", move: "at", pos: [0.3, 1.45, -0.4], look: [2.4, 1.3, -0.5], fov: 46, fly: true },
        { word: "forget", move: "closeUp", on: "milo", from: -40, punch: true },
        { word: "doorway", move: "at", pos: [1.25, 0.55, 0.75], look: [0.0, 1.35, -0.45], fov: 44, whip: true },
      ],
      actors: [
        { who: "milo", at: "doorR", act: "happy", walk: { to: "kitchenA", t0: 0, t1: 1.3 },
          beats: [{ word: "forget", act: "confused", face: "dazed" }, { word: "doorway", gesture: "scratchHead" }] },
      ],
      fx: [{ kind: "thought", on: "milo", t: 0.0, life: 1.4 }, { kind: "thoughtPop", on: "milo", word: "forget", life: 0.8 }] },

    // SETTING: the old scene, before. Milo by the sofa, the keys in his thought bubble; he sets off, the camera rides
    // behind him toward the doorway
    { say: "Meet Milo. He needs his keys. He heads to the kitchen to grab them.", set: "apartment", light: "interior", transition: "whip",
      // (Milo walks later in this shot, and framing moves aim at where he ends up: these set-ups are placed by hand)
      camera: { move: "at", pos: [-1.65, 0.8, 1.05], look: [-2.0, 1.4, -0.35], fov: 40 },
      cams: [
        { word: "needs", move: "at", pos: [-1.2, 1.5, 3.3], look: [-2.0, 1.2, -0.35], fov: 42, glide: 0.35 },
        { word: "He", n: 2, move: "at", pos: [-1.2, 1.5, 3.3], look: [-2.0, 1.2, -0.35], fov: 42 },   // hold, then fly
        { word: "heads", move: "at", pos: [-3.3, 1.5, 0.9], look: [0.2, 1.15, -0.45], fov: 44, fly: true },
      ],
      actors: [
        { who: "milo", at: "livingA", act: "proud", facing: "camera",
          beats: [{ word: "keys", act: "idea" }, { word: "heads", act: "determined" }],
          walk: { to: "doorR", t0: 0, t1: 0, from: { word: "heads" }, until: { word: "them" } } },
      ],
      fx: [{ kind: "thought", on: "milo", word: "keys", life: 1.1 }] },

    // "Wait... why am I in here?" (Milo, close, a dutch tilt: the blank moment)
    { say: { who: "milo", text: "Wait... why am I in here?", voice: "liam" }, set: "apartment", light: "interior", transition: "cut",
      camera: { move: "dutch", on: ["milo"], size: "close", from: -20 },
      actors: [{ who: "milo", at: "kitchenA", act: "confused", facing: "camera", beats: [{ word: "why", gesture: "scratchHead" }] }],
      fx: [{ kind: "question", on: "milo", word: "why", life: 1.4 }] },

    // the search: whip pans from object to object (fridge, drawer, toaster), then "Nothing" on a still beat
    { say: "He checks the fridge, a drawer, even the toaster. Nothing.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "medium", from: -55, height: 1.4 },
      cams: [
        { word: "drawer", move: "frame", on: ["milo"], size: "medium", from: -75, height: 1.2, whip: true },
        { word: "toaster", move: "at", pos: [3.25, 1.3, -0.35], look: [4.4, 1.0, -0.95], fov: 40, whip: true },
        { word: "Nothing", move: "frame", on: ["milo"], size: "medium", from: -20, height: 1.45, whip: true },
      ],
      props: [{ id: "toaster", at: [4.4, 0.93, -0.95], yaw: -90 }],
      actors: [
        { who: "milo", at: [3.55, 0, -1.25], act: "thinking", facing: "toward:fridge",
          beats: [{ word: "fridge", act: "suspicious" }, { word: "drawer", act: "thinking", gesture: "chin" }, { word: "toaster", act: "suspicious" }, { word: "Nothing", act: "shrug" }] },
      ] },

    // the experiment: the camera rises off the kitchen to the whole apartment, two volunteers carry things: one through
    // the doorway, one the same distance inside the living room; the doorway walker forgets (?), the other doesn't
    { say: "Psychologist Gabriel Radvansky put this to the test. People carried objects through rooms, then were quizzed on what they were carrying.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [2.5, 1.5, 4.6], look: [2.5, 1.1, -0.8], fov: 50 },
      cams: [
        { word: "test", move: "at", pos: [-1.6, 2.5, 4.4], look: [-0.95, 1.0, -0.35], fov: 52, fly: true },
        { word: "quizzed", move: "at", pos: [1.85, 1.45, 3.4], look: [1.85, 1.1, -0.4], fov: 46, glide: 0.5 },
      ],
      actors: [
        { who: "volA", at: [-2.9, 0, 0.3], act: "neutral", hold: "book", walk: { to: [-0.9, 0, 0.3], t0: 0, t1: 0, from: { word: "People" }, until: { word: "quizzed" } } },
        { who: "volB", at: [-1.7, 0, -0.45], act: "neutral", hold: "flask", walk: { to: [1.4, 0, -0.45], t0: 0, t1: 0, from: { word: "People" }, until: { word: "quizzed" } },
          beats: [{ word: "carrying", act: "confused" }] },
        { who: "juno", at: [1.75, 0, 0.35], act: "neutral", facing: "toward:volB", beats: [{ word: "quizzed", act: "suspicious", face: "talk" }] },
      ],
      fx: [{ kind: "question", on: "volB", word: "carrying", life: 1.6 }] },

    { say: "Those who walked through a doorway forgot more than those who walked the same distance in one room.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["volB", "juno"], size: "medium", from: -10, height: 1.4 },
      cams: [
        { word: "forgot", move: "closeUp", on: "volB", from: -10, punch: true },
        { word: "same", move: "frame", on: ["volA"], size: "medium", from: -25, height: 1.4, whip: true },
      ],
      actors: [
        { who: "volB", at: [1.4, 0, -0.45], act: "confused", hold: "flask", facing: "camera", beats: [{ word: "forgot", face: "dazed", gesture: "scratchHead" }] },
        { who: "juno", at: [1.75, 0, 0.35], act: "neutral", facing: "toward:volB" },
        { who: "volA", at: [-0.9, 0, 0.3], act: "happy", hold: "book", facing: "camera", beats: [{ word: "same", act: "thumbsUp" }] },
      ],
      fx: [{ kind: "thoughtPop", on: "volB", word: "doorway", life: 0.8 }, { kind: "idea", on: "volA", word: "room", life: 1.4 }] },

    // "Wait, a door made me forget?" Milo, in the doorway, glares up at the frame (low angle, a beat of stillness)
    { say: { who: "milo", text: "Wait, a door made me forget?", voice: "liam" }, set: "apartment", light: "interior", transition: "whip",
      camera: { move: "lowHero", on: "milo", from: -60 },
      actors: [{ who: "milo", at: "doorway", act: "suspicious", facing: "camera", beats: [{ word: "door", gesture: "pointUp" }, { word: "forget", act: "shock" }] }] },

    // the idea: one long continuous move across both rooms ("one long video") that stops dead at the wall ("cut it into
    // scenes"), then the doorway close and low ("event boundary... a big one") with Milo standing on the threshold
    { say: "You see, your brain doesn't record life as one long video. It seems to cut it into scenes. Psychologists call each cut an event boundary, and a doorway is a big one.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-3.6, 1.55, 4.4], look: [-3.2, 1.1, -0.8], fov: 46 },
      cams: [
        { word: "video", move: "at", pos: [-0.9, 1.55, 4.4], look: [-0.5, 1.1, -0.8], fov: 46, glide: 1.2 },
        { word: "scenes", move: "at", pos: [0.0, 1.55, 4.0], look: [0.0, 1.2, -0.8], fov: 46, glide: 0.25 },
        { word: "boundary", move: "at", pos: [-1.9, 0.5, 0.95], look: [0.0, 1.45, -0.45], fov: 44, fly: true },
        { word: "big", move: "closeUp", on: "milo", from: -55, punch: true },
      ],
      kicks: [{ word: "scenes" }],
      actors: [
        { who: "milo", at: "doorway", act: "thinking", facing: "camera", beats: [{ word: "boundary", act: "idea" }, { word: "big", act: "proud", face: "excited" }] },
      ] },

    // tucked away, not deleted: Milo steps into the kitchen; the camera looks back through the doorway at the old scene,
    // where his thought bubble (the keys) still floats over the sofa, then flies back to it
    { say: "It's a simplified picture, but crossing one seems to tuck the old scene away, so plans made there get harder to reach. Milo's plan isn't deleted. It's just stuck back with the sofa.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [2.3, 1.45, 2.0], look: [0.0, 1.2, -0.45], fov: 40 },   // Milo on the threshold, from the kitchen side (he walks later)
      cams: [
        { word: "tuck", move: "at", pos: [2.6, 1.45, -0.35], look: [-2.6, 1.4, -0.75], fov: 40, fly: true },
        { word: "harder", move: "at", pos: [3.6, 1.4, -0.4], look: [-2.6, 1.45, -0.75], fov: 34, glide: 0.8 },
        { word: "deleted", move: "at", pos: [-1.0, 1.55, -0.3], look: [-2.6, 1.5, -0.85], fov: 42, fly: true },
        { word: "sofa", move: "insert", on: "thoughtBubble", size: "close", from: 72 },
      ],
      props: [{ id: "thoughtBubble", at: [-2.6, 0.95, -0.85], scale: 1.4, yaw: 76 }, { id: "keyBowl", at: [-2.6, 0.45, -0.75] }], // the bubble turned to the kitchen-side cameras
      actors: [
        { who: "milo", at: "doorway", act: "neutral", facing: "camera", walk: { to: [1.7, 0, 0.75], t0: 0, t1: 0, from: { word: "crossing" }, until: { word: "tuck" } },
          beats: [{ word: "harder", act: "confused" }] },
      ] },

    // not every time: Milo walks through with his thought intact (thumbs up); then, busy (Juno talking at him while he
    // reads), the bubble pops at the doorway
    { say: "It doesn't happen every time. Later studies found it mostly when people's minds were busy.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-2.4, 1.45, 1.2], look: [0.4, 1.25, -0.45], fov: 44 },
      cams: [
        { word: "Later", move: "frame", on: ["milo", "juno"], size: "medium", from: 35, height: 1.45, whip: true },
        { word: "busy", move: "closeUp", on: "milo", from: 30, punch: true },
      ],
      actors: [
        { who: "milo", at: "doorL", act: "happy", hold: "phone", walk: { to: "doorR", t0: 0.1, t1: 1.6 },
          beats: [{ word: "every", act: "thumbsUp" }, { word: "Later", act: "thinking", gesture: "hang" }, { word: "busy", act: "dazed" }] },
        { who: "juno", at: [1.55, 0, -1.25], act: "explain", facing: "toward:milo", beats: [{ word: "Later", gesture: "talk" }] },
      ],
      fx: [{ kind: "thought", on: "milo", t: 0.0, life: 2.2 }, { kind: "thoughtPop", on: "milo", word: "busy", life: 0.8 }] },

    // going back: the camera rides with Milo back through the doorway; the old room's cues (the bowl of keys, close);
    // "no guarantee" on a shrug
    { say: "Going back can sometimes help, because the old room is full of cues. It's no guarantee, though.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-3.0, 1.45, 1.0], look: [-0.2, 1.2, -0.45], fov: 44 },
      cams: [
        { word: "cues", move: "at", pos: [-2.15, 1.1, 0.35], look: [-2.6, 0.5, -0.75], fov: 40, glide: 0.45 },
        { word: "guarantee", move: "frame", on: ["milo"], size: "medium", from: 25, height: 1.4, whip: true },
      ],
      props: [{ id: "keyBowl", at: [-2.6, 0.45, -0.75] }],
      actors: [
        { who: "milo", at: "doorR", act: "thinking", walk: { to: "livingA", t0: 0, t1: 0, from: { word: "Going" }, until: { word: "cues" } },
          beats: [{ word: "guarantee", act: "shrug" }] },
      ],
      fx: [{ kind: "question", on: "milo", word: "guarantee", life: 1.4 }] },

    // he remembers: back at the sofa the thought comes back (the bubble reappears over his head), a push-in to his face
    { say: "So Milo walks back to the sofa... and remembers.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "medium", from: 10, height: 1.45 },
      cams: [{ word: "remembers", move: "closeUp", on: "milo", from: 10, punch: true }],
      props: [{ id: "keyBowl", at: [-2.6, 0.45, -0.75] }],
      actors: [
        { who: "milo", at: "livingB", act: "thinking", walk: { to: "livingA", t0: 0.1, t1: 1.3 }, beats: [{ word: "remembers", act: "happy", face: "excited" }] },
      ],
      fx: [{ kind: "idea", on: "milo", word: "remembers", life: 1.2 }, { kind: "thought", on: "milo", word: "remembers", life: 1.6 }] },

    // the callback: keys grabbed (insert), out of the front door... and the bubble pops again. A held, blank close-up ends it
    { say: "He grabs his keys, heads out the door... and forgets where he was going.", set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-1.3, 1.3, 1.5], look: [-2.0, 1.05, -0.35], fov: 38 },   // keys in hand (he walks later)
      cams: [
        { word: "heads", move: "at", pos: [-1.6, 1.5, 2.4], look: [-4.3, 1.1, 0.5], fov: 46, fly: true },
        { word: "forgets", move: "closeUp", on: "milo", from: 30, punch: true },
      ],
      props: [{ id: "keyBowl", variant: "empty", at: [-2.6, 0.45, -0.75] }],
      actors: [
        { who: "milo", at: "livingA", act: "happy", hold: "keys", facing: "camera",
          walk: { to: "frontDoor", t0: 0, t1: 0, from: { word: "heads" }, until: { word: "and" } },
          beats: [{ word: "forgets", act: "confused", face: "dazed" }] },
      ],
      fx: [{ kind: "thoughtPop", on: "milo", word: "forgets", life: 0.8 }, { kind: "question", on: "milo", word: "going", life: 1.6 }] },
  ],
};
