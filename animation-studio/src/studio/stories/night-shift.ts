// The Extra Door, Part 2: "Juno's Night Shift" (productions/extra-door-2/script-rewrite.md, v2 approved; the 84.6 s
// timeline of productions/extra-door-2/narration-rewrite/narration-review.md). It replaces the unpublished extra-door-2
// cut and follows Part 1's vote, B: RUN DOWNSTAIRS. The narration is LOCKED (voice/cache): Part 1's presets, the door's
// "Milo... it's me. Let me in." is Part 1's exact take (used twice), the two pleading lines are the approved frightened
// takes (junoScared / liamScared). The door's rules, on screen: it moves only while something watches it (eyes or a
// lens; the music drops to the drone), and it travels between copies of one photo (Milo and Juno's).
import type { Storyboard, V3 } from "../story/types";

const N = "georgeHushed", MQ = "liamQuiet", ML = "liam", J = "juno";
const DOORJUNO = "Milo... it's me. Let me in.";
// ---- Part 1's hallway (the callback) and the downstairs hall
const FINAL: V3 = [0.58, 0, -5.35], STAIRS_TOP: V3 = [-0.47, 0, -4.82];
const stairUp = (z: number): V3 => [-0.47, Math.round((-0.18 - 0.72 * (z + 4.575)) * 1000) / 1000, z];
const FRONT: V3 = [0.75, 0, -5.25], FOOT: V3 = [-0.45, 0, -0.75];
// ---- the city at night (pavement y 0.15)
const RUNA: V3 = [-9.0, 0.15, -5.4], RUNB: V3 = [-4.5, 0.15, -5.4], GUT: V3 = [-3.4, 0.0, -4.25];
// ---- the lab (8 x 6.4 m, back wall z -3.2): Juno's wall photo above the back counter, the drawer beside it
const PHOTO: V3 = [1.6, 1.92, -3.165], DRAWER: V3 = [2.0, 0, -2.6], CAM: V3 = [3.9, 2.75, -3.05], SWITCH: V3 = [3.96, 1.4, -2.2];
const JW: V3 = [0.95, 0, -1.65], MW: V3 = [0.25, 0, -1.55];      // Juno and Milo facing the wall photo
const MON: V3 = [0.62, 0.93, -0.9];                               // the monitor on the island bench
const WIN_OUT: V3 = [-4.65, 0, -1.0], WIN_IN: V3 = [-3.35, 0, -0.95];

export const NIGHTSHIFT: Storyboard = {
  id: "night-shift", title: "The Extra Door, Part 2: Juno's Night Shift",
  cast: { milo: "milo", juno: "juno" },
  music: { mood: "stormPulse", gain: -4 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots: [
    // 1. THE CALLBACK: Part 1's final composition; B selected (green, "YOU CHOSE B"), A dims; Milo bolts for the stairs
    { say: { text: "You told him to run. So he ran.", voice: N, gap: 0.05 }, until: { word: "run" }, set: "hallway", light: "interiorCool", mood: "stormPulse",
      camera: { move: "at", pos: [0.4, 2.15, -0.5], look: [-0.366, 0.605, -6.9], fov: 58 },
      cams: [{ t: 0, move: "at", pos: [0.4, 2.15, -0.5], look: [-0.366, 0.605, -6.9], fov: 58, blockOk: true }],
      actors: [{ who: "milo", at: FINAL, act: "scared", face: "scared", facing: 0, idle: 0.3, walk: { to: STAIRS_TOP, t0: 0.15, t1: 1.2, mode: "run" } }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }, { id: "photoFrame", at: "photo" },
        { id: "choiceLabelDimmed", at: [0.417, 1.713, -2.617], variant: "A: OPEN THE DOOR", scale: 1.114, steps: [{ t: 0.1 }] },
        { id: "choiceLabelChosen", at: [-0.102, 1.227, -2.435], variant: "B: RUN DOWNSTAIRS", scale: 1.089, steps: [{ t: 0.1 }] }],
      sfx: [{ t: 0.1, name: "latch_click", gain: -2 }, { t: 0.5, name: "step_floor", gain: -3 }, { t: 0.8, name: "step_floor", gain: -3 }] },
    //    ...down Part 1's stairwell: "So he ran."
    { dur: 1.25, cont: true, hold: 0.2, set: "hallway", light: "interiorCool",
      camera: { move: "at", pos: [-0.47, 1.3, -1.85], look: [-0.47, -0.25, -4.1], fov: 52 },
      actors: [{ who: "milo", at: stairUp(-4.45), act: "scared", face: "scared", facing: 0, idle: 0.3, walk: { to: stairUp(-2.3), t0: 0.0, t1: 1.0, mode: "run" } }],
      sfx: [{ t: 0.2, name: "step_floor", gain: -4 }, { t: 0.45, name: "step_floor", gain: -4 }, { t: 0.7, name: "step_floor", gain: -4 }] },
    // 2. the downstairs hall: the front door is locked; the key hook is empty, still swinging
    { dur: 2.6, say: { who: "milo", text: "Where are the keys?!", voice: ML, gap: 0.35 }, hold: 0.9, set: "downstairs", light: "interiorCool",
      camera: { move: "at", pos: [0.95, 1.5, -3.0], look: [0.75, 1.25, -6.0], fov: 46 },
      cams: [{ word: "keys", move: "at", pos: [0.42, 1.5, -5.78], look: [1.27, 1.45, -5.8], fov: 40 }],
      actors: [{ who: "milo", at: FRONT, back: true, act: "scared", gesture: "grab", idle: 0.4 }],
      props: [{ id: "frontDoor", at: "frontDoor" }, { id: "keyHook", at: [1.27, 1.45, -5.8], yaw: -90 }],
      sfx: [{ t: 0.1, name: "latch_click", gain: -6 }, { t: 0.35, name: "latch_click", gain: -6 }, { word: "keys", name: "clink", gain: -14 }] },
    // 3. from below: the old door at the top of the stairs, its handle out, cold light; while he stares it creaks
    { dur: 2.8, say: { text: DOORJUNO, voice: J, gap: 0.25 }, hold: 0.3, set: "downstairs", light: "interiorCool", mood: "rest",
      camera: { move: "at", pos: [-0.25, 1.55, 0.45], look: [-0.45, 3.2, -5.5], fov: 50 },
      cams: [{ t: 1.6, move: "at", pos: [-0.35, 1.9, -0.6], look: [-0.45, 3.3, -5.5], fov: 46, glide: 1.0 }],
      actors: [{ who: "milo", at: FOOT, back: true, act: "scared", idle: 0.3 }],
      props: [{ id: "oldDoor", at: "landingDoor", variant: "handle" }],
      sfx: [{ t: 0.15, name: "creak", gain: -8 }, { t: 1.4, name: "creak", gain: -9 }] },
    // 4. he tears his eyes away (the creaking stops); the kitchen window, up, and out into the rain
    { dur: 2.0, set: "home", light: "interiorCool", mood: "storm", ambience: "amb_storm",
      camera: { move: "at", pos: [0.3, 1.55, 0.9], look: [3.0, 1.45, -1.0], fov: 50 },
      actors: [{ who: "milo", at: [2.35, 0, -0.75], facing: 1.4, act: "scared", idle: 0.3, walk: { to: [2.75, 0.92, -1.0], t0: 0.8, t1: 1.7, mode: "ride" } }],
      sfx: [{ t: 0.3, name: "thud", gain: -10 }, { t: 0.6, name: "storm_wind", gain: -6 }] },
    // 5. the night street, rain: running, the phone buzzes: a text from "Juno"
    { dur: 2.4, set: "city", light: "night", ambience: "amb_storm",
      camera: { move: "at", pos: [-7.0, 1.4, -2.4], look: [-7.0, 1.1, -5.6], fov: 52 },
      cams: [{ t: 1.1, move: "at", pos: [-6.4, 1.32, -5.12], look: [-6.4, 1.32, -5.4], fov: 34 }],
      actors: [{ who: "milo", at: RUNA, act: "scared", walk: { to: [-6.4, 0.15, -5.4], t0: 0, t1: 0.9, mode: "run" } }],
      props: [{ id: "nsPhone", at: [-6.4, 1.245, -5.4], variant: "fake" }],
      sfx: [{ t: 1.0, name: "phone_buzz", gain: -4 }] },
    // 6. an incoming call: Juno's contact photo is their photo; he answers; the real Juno, urgent, on speaker
    { dur: 4.58, say: { text: "Milo, it's really me. Don't look at our photo. Come to the lab!", voice: J, gap: 0.1 }, hold: 0.2, set: "city", light: "night", mood: "tense", ambience: "amb_storm",
      camera: { move: "at", pos: [-6.4, 1.32, -5.12], look: [-6.4, 1.32, -5.4], fov: 34 },
      cams: [{ t: 2.0, move: "closeUp", on: "milo" }],
      actors: [{ who: "milo", at: [-6.4, 0.15, -5.4], act: "nervous", facing: "camera" }],
      props: [{ id: "nsPhone", at: [-6.4, 1.245, -5.4], variant: "call", steps: [{ t: 0.05 }] }],
      sfx: [{ t: 0.0, name: "ringtone", gain: -14 }] },
    // 7. but he IS looking: the photo ripples to wood grain, a tiny brass handle pushes out through the glass and turns
    { dur: 2.2, set: "city", light: "night", mood: "rest", ambience: "amb_storm",
      camera: { move: "at", pos: [-6.4, 1.32, -5.15], look: [-6.4, 1.32, -5.4], fov: 30 },
      actors: [{ who: "milo", at: [-6.4, 0.15, -5.4], act: "scared", facing: "camera" }],
      props: [{ id: "nsPhone", at: [-6.4, 1.245, -5.4], variant: "call", steps: [{ t: 0 }, { t: 0.2 }, { t: 0.9 }, { t: 1.5 }] }],
      sfx: [{ t: 0.95, name: "knock_heavy", gain: -14 }, { t: 1.25, name: "knock_heavy", gain: -14 }, { t: 1.55, name: "knock_heavy", gain: -14 }] },
    // 8. THE OBSTACLE: he slams the phone face down into the flooded gutter; the knocking stops dead
    { dur: 3.2, say: { who: "milo", text: "It only moves when I'm looking.", voice: MQ, gap: 1.1 }, hold: 0.3, set: "city", light: "night", mood: "storm", ambience: "amb_storm",
      camera: { move: "at", pos: [-3.6, 1.0, -2.2], look: [-3.4, 0.5, -4.4], fov: 50 },
      cams: [{ word: "only", move: "closeUp", on: "milo" }],
      actors: [{ who: "milo", at: [-3.4, 0.0, -3.85], act: "angry", gesture: "grab", idle: 0.4, beats: [{ t: 0.6, act: "scared", gesture: "hang" }] }],
      props: [{ id: "gutterPuddle", at: GUT, variant: "phone" }],
      sfx: [{ t: 0.55, name: "splash", gain: -4 }] },
    // 9. the sprint through the rain past dark shop windows
    { dur: 3.35, say: { text: "It wasn't following Milo. It was following the photo.", voice: N, gap: 0.0 }, hold: 0.05, set: "city", light: "night", ambience: "amb_storm",
      camera: { move: "follow", on: "milo", size: "full" },
      actors: [{ who: "milo", at: RUNB, act: "scared", walk: { to: [1.5, 0.15, -5.3], t0: 0, t1: 3.2, mode: "run" } }] },
    // 10. the lab's ground-floor window: Milo outside, soaked, banging on the glass; Juno inside, her hand on the latch
    { dur: 5.8, say: [{ who: "milo", text: "Juno, it's me!", voice: ML, gap: 0.05 }, { who: "juno", text: "Prove it. Who ate my birthday cake?", voice: J, gap: 0.1 }, { who: "milo", text: "Me! Sorry! Open up!", voice: ML, gap: 0.1 }],
      hold: 0.25, set: "lab", light: "interior", mood: "hush", ambience: "amb_storm",
      camera: { move: "at", pos: [-2.1, 1.55, 0.6], look: [-4.3, 1.45, -1.0], fov: 46 },
      cams: [{ word: "Prove", move: "closeUp", on: "juno" }, { word: "Sorry", move: "at", pos: [-2.1, 1.55, 0.6], look: [-4.3, 1.45, -1.0], fov: 46 }],
      actors: [{ who: "milo", at: WIN_OUT, act: "scared", gesture: "fists", facing: "camera" }, { who: "juno", at: WIN_IN, act: "suspicious", facing: "toward:milo" }],
      sfx: [{ t: 0.05, name: "knock_heavy", gain: -10 }, { t: 0.3, name: "knock_heavy", gain: -10 }] },
    // 11. she lets him in; a fierce hug
    { dur: 4.55, say: [{ who: "juno", text: "You're soaked.", voice: J, gap: 0.05 }, { who: "milo", text: "It has your voice.", voice: MQ, gap: 0.1 }, { who: "juno", text: "It learned it from me.", voice: J, gap: 0.1 }],
      hold: 0.2, set: "lab", light: "interior", ambience: false,
      camera: { move: "frame", on: ["milo", "juno"], size: "medium" },
      actors: [{ who: "milo", at: [-1.5, 0, 0.3], act: "sad", facing: "toward:juno" }, { who: "juno", at: [-0.95, 0, 0.3], act: "sad", gesture: "spread", facing: "toward:milo", beats: [{ word: "learned", act: "nervous", gesture: "hang" }] }],
      sfx: [{ t: 0.0, name: "thud", gain: -12 }] },
    // 12. the monitor: three night-vision clips: SPECIMEN 8 facing the photo; FEED LOST, the door shrunk; TONIGHT 21:14
    { dur: 8.68, say: [{ who: "juno", text: "It only moves while something's watching it. Eyes or cameras.", voice: J, gap: 0.05 }, { who: "juno", text: "It learned us from that photo.", voice: J, gap: 0.12 }, { who: "juno", text: "Tonight it went through mine... into yours.", voice: J, gap: 0.12 }],
      hold: 0.3, set: "lab", light: "interior", mood: "mystery", ambience: false,
      camera: { move: "at", pos: [0.62, 1.36, -0.22], look: [0.62, 1.33, -0.9], fov: 40 },
      cams: [{ word: "cameras", move: "at", pos: [0.62, 1.35, -0.3], look: [0.62, 1.33, -0.9], fov: 40 }, { word: "Tonight", move: "at", pos: [0.62, 1.35, -0.36], look: [0.62, 1.33, -0.9], fov: 40 }],
      actors: [{ who: "juno", at: [0.15, 0, -0.1], back: true, act: "explain", idle: 0.2 }],
      props: [{ id: "labMonitor", at: MON, steps: [{ word: "Eyes" }, { word: "cameras" }, { word: "Tonight" }] }],
      sfx: [{ word: "Eyes", name: "blip_up", gain: -14 }, { word: "cameras", name: "blip_up", gain: -14 }, { word: "Tonight", name: "blip_up", gain: -14 }] },
    // 13. Milo turns: the photo on the wall above her desk, and they are both looking at it
    { dur: 2.77, say: { who: "milo", text: "Juno. Don't look at your desk.", voice: MQ, gap: 0.1 }, hold: 0.2, set: "lab", light: "interior", mood: "silence", ambience: false,
      camera: { move: "frame", on: ["milo", "juno"], size: "full" },
      actors: [{ who: "milo", at: MW, act: "scared", facing: "camera", beats: [{ t: 0.4, look: "up" }] }, { who: "juno", at: JW, act: "nervous", facing: "camera", beats: [{ t: 0.4, look: "up" }] }],
      props: [{ id: "photoWall", at: PHOTO }, { id: "specimenDrawer", at: DRAWER }] },
    // 14. too late: the wall behind the photo turns to wood grain, a door outline cracking open around the frame
    { dur: 2.0, set: "lab", light: "interior", mood: "rest", ambience: false,
      camera: { move: "at", pos: [1.6, 1.4, -0.6], look: [1.6, 1.4, -3.2], fov: 52 },
      actors: [],
      props: [{ id: "photoWall", at: PHOTO, steps: [{ t: 0.15 }] }, { id: "specimenDrawer", at: DRAWER }],
      sfx: [{ t: 0.15, name: "creak", gain: -5 }] },
    // 15. a two-shot: Juno right beside him, silent, as her own voice comes from the wall
    { dur: 2.8, say: { text: DOORJUNO, voice: J, gap: 0.2 }, hold: 0.25, set: "lab", light: "interior", mood: "tense", ambience: false,
      camera: { move: "at", pos: [0.6, 1.5, 1.4], look: [1.0, 1.35, -3.0], fov: 54 },
      actors: [{ who: "milo", at: MW, act: "scared", facing: "camera", beats: [{ t: 0.6, look: "right" }] }, { who: "juno", at: JW, act: "shock", facing: "camera", idle: 0.1 }],
      props: [{ id: "photoWall", at: PHOTO, steps: [{ t: 0 }] }, { id: "specimenDrawer", at: DRAWER }] },
    // 16. then Milo's voice from the wall; Juno grips his arm and stares at him
    { dur: 2.4, say: { text: "Juno, it's me. Open up.", voice: MQ, gap: 0.2 }, hold: 0.25, set: "lab", light: "interior", ambience: false,
      camera: { move: "frame", on: ["juno", "milo"], size: "medium" },
      actors: [{ who: "milo", at: MW, act: "shock", facing: "camera" }, { who: "juno", at: JW, act: "scared", facing: "toward:milo" }],
      props: [{ id: "photoWall", at: PHOTO, steps: [{ t: 0 }] }, { id: "specimenDrawer", at: DRAWER }],
      sfx: [{ t: 0.15, name: "sting_low", gain: -8 }] },
    // 17. Juno tears at the frame: it has grown into the wood, it won't come off
    { dur: 2.6, say: { who: "juno", text: "It won't come off!", voice: J, gap: 0.6 }, hold: 0.45, set: "lab", light: "interior", mood: "storm", ambience: false,
      camera: { move: "at", pos: [0.95, 1.6, -0.4], look: [1.5, 1.6, -3.2], fov: 56 },
      actors: [{ who: "juno", at: [1.35, 0, -2.4], back: true, act: "angry", gesture: "grab", idle: 0.6 }],
      props: [{ id: "photoWall", at: PHOTO, steps: [{ t: 0 }] }],
      sfx: [{ t: 0.2, name: "creak", gain: -6 }, { t: 0.9, name: "creak", gain: -6 }] },
    // 18. macro: the brass handle pushes through the wood (Part 1's image) and turns
    { dur: 2.0, set: "lab", light: "interior", ambience: false,
      camera: { move: "at", pos: [2.0, 1.4, -2.2], look: [1.75, 1.5, -3.2], fov: 54 },
      actors: [],
      props: [{ id: "photoWall", at: PHOTO, steps: [{ t: 0 }, { t: 0.15 }, { t: 1.1 }] }],
      sfx: [{ t: 0.2, name: "creak", gain: -4 }, { t: 1.15, name: "latch_click", gain: -6 }] },
    // 19. Milo spins her to face him; they turn their backs on it, but the creaking goes on and the handle keeps turning
    { dur: 2.8, say: { who: "milo", text: "Stop looking! Look at me!", voice: ML, gap: 0.15 }, hold: 0.6, set: "lab", light: "interior", mood: "stormPulse", ambience: false,
      camera: { move: "at", pos: [0.6, 1.5, 0.9], look: [1.1, 1.35, -3.0], fov: 54 },
      actors: [{ who: "milo", at: [0.55, 0, -1.2], act: "determined", gesture: "grab", facing: "toward:juno" }, { who: "juno", at: [1.15, 0, -1.25], act: "scared", facing: "toward:milo" }],
      props: [{ id: "photoWall", at: PHOTO, steps: [{ t: 0 }, { t: 0.01 }, { t: 0.02 }] }, { id: "specimenDrawer", at: DRAWER }],
      sfx: [{ t: 1.6, name: "creak", gain: -7 }] },
    // 20. Juno's eyes flick up: the security camera's red light, aimed at the wall
    { dur: 4.59, say: [{ who: "juno", text: "The camera's still watching it!", voice: J, gap: 0.05 }, { who: "milo", text: "If nothing sees it, it can't move.", voice: MQ, gap: 0.15 }],
      hold: 0.25, set: "lab", light: "interior", ambience: false,
      camera: { move: "insert", on: "securityCam", size: "macro" },
      cams: [{ word: "nothing", move: "frame", on: ["milo", "juno"], size: "medium" }],
      actors: [{ who: "milo", at: [0.55, 0, -1.2], act: "determined", facing: "toward:juno" }, { who: "juno", at: [1.15, 0, -1.25], act: "shock", facing: "toward:milo", beats: [{ t: 0.1, look: "up" }] }],
      props: [{ id: "securityCam", at: CAM, yaw: -90 }, { id: "photoWall", at: PHOTO, steps: [{ t: 0 }, { t: 0.01 }, { t: 0.02 }] }] },
    // 21. she slams the master switch
    { dur: 1.2, set: "lab", light: "interior", mood: "silence", ambience: false,
      camera: { move: "at", pos: [1.6, 1.55, -0.2], look: [3.6, 1.35, -1.95], fov: 54 },
      actors: [{ who: "juno", at: [3.3, 0, -1.6], act: "determined", facing: "camera" }],
      props: [{ id: "masterSwitch", at: SWITCH, yaw: -90, steps: [{ t: 0.45 }] }],
      sfx: [{ t: 0.5, name: "impact", gain: -3 }] },
    // 22. DARKNESS, eyes shut (the exit sign's glow): the wood creaks backwards into the frame; the voices plead;
    //     Milo guides her hands; the photo goes FACE DOWN into the solid steel drawer, the drawer slams FULLY SHUT,
    //     the key TURNS (seen and heard) before any light returns
    { dur: 5.4, say: [{ text: "Milo, please.", voice: "junoScared", gap: 0.25 }, { text: "Juno, look at me!", voice: "liamScared", gap: 0.15 }, { who: "milo", text: "Left. Down. There.", voice: MQ, gap: 0.05 }],
      dur: 5.4, hold: 1.0, set: "lab", light: "night", ambience: false,
      camera: { move: "at", pos: [1.0, 1.4, 0.4], look: [1.7, 1.2, -3.0], fov: 52 },
      cams: [{ word: "There", move: "at", pos: [2.0, 1.6, -1.15], look: [2.0, 0.82, -2.3], fov: 52 }],
      actors: [{ who: "milo", at: [1.05, 0, -1.9], act: "scared", face: "scared", gesture: "hold", facing: "toward:juno" }, { who: "juno", at: [1.65, 0, -1.95], act: "scared", face: "scared", gesture: "hold", facing: "toward:milo" }],
      props: [{ id: "photoWall", at: PHOTO, steps: [{ t: 0 }, { t: 0.01 }, { t: 0.02 }, { t: 0.2 }, { t: 4.3 }] }, { id: "specimenDrawer", at: DRAWER, steps: [{ t: 4.45 }, { t: 4.8 }, { t: 5.1 }] },
        { id: "exitSign", at: [0.85, 2.5, -3.165] }],
      sfx: [{ t: 0.2, name: "creak", gain: -6 }, { t: 4.8, name: "thud", gain: -2 }, { t: 5.1, name: "latch_click", gain: -2 }] },
    // 23. the lights come back: plain plaster; the closed, locked steel drawer under the security camera (it sees only the
    //     drawer front); relief
    { dur: 6.18, say: [{ who: "juno", text: "It's sealed. Nothing can see it in there.", voice: J, gap: 0.1 }, { who: "milo", text: "Next time you bring work home, warn me.", voice: MQ, gap: 0.15 }, { who: "juno", text: "Deal.", voice: J, gap: 0.15 }],
      hold: 0.35, set: "lab", light: "interior", mood: "warm", ambience: false,
      camera: { move: "at", pos: [0.6, 1.6, 0.6], look: [2.4, 1.6, -2.9], fov: 60 },
      cams: [{ t: 0, move: "at", pos: [0.6, 1.6, 0.6], look: [2.4, 1.6, -2.9], fov: 60, blockOk: true }, { word: "Next", move: "frame", on: ["milo", "juno"], size: "medium" }],
      actors: [{ who: "milo", at: [1.05, 0, -1.9], act: "relief", facing: "toward:juno", beats: [{ word: "Next", act: "laugh" }] }, { who: "juno", at: [1.65, 0, -1.95], act: "relief", gesture: "hips", facing: "toward:milo", beats: [{ word: "Deal", act: "happy" }] }],
      props: [{ id: "specimenDrawer", at: DRAWER, steps: [{ t: 0 }, { t: 0.01 }, { t: 0.02 }] }, { id: "securityCam", at: CAM, yaw: -90 }] },
    // 24. the clue: Juno's phone lights up on the desk: HOME CAM, hallway, motion: Part 1's photo face up, being watched
    { dur: 2.2, set: "lab", light: "interior", mood: "rest", ambience: false,
      camera: { move: "at", pos: [0.0, 1.22, -0.1], look: [0.0, 1.03, -0.62], fov: 19 },
      actors: [],
      props: [{ id: "nsPhone", at: [0.0, 0.95, -0.62], yaw: 0, variant: "cam" }],
      sfx: [{ t: 0.1, name: "phone_buzz", gain: -8 }, { t: 0.5, name: "sting_low", gain: -12 }] },
    // 25. a text from "Milo": "I'm home. Come let me in." Hard cut to black on the buzz
    { dur: 3.0, set: "lab", light: "interior", mood: "silence", ambience: false,
      camera: { move: "at", pos: [0.0, 1.22, -0.12], look: [0.0, 1.03, -0.62], fov: 18 },
      actors: [],
      props: [{ id: "nsPhone", at: [0.0, 0.95, -0.62], yaw: 0, variant: "cam", steps: [{ t: 0.25 }] }],
      sfx: [{ t: 0.25, name: "phone_buzz", gain: -2 }] },
  ],
};
