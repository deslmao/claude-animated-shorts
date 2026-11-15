// What Ollie Says at 3 A.M., Part 1: "3:00" (productions/what-ollie-says/episodes/ep1-3am.md, the approved beat
// sheet; beat numbers in the notes). Voices are PLACEHOLDERS until the Polish check and the child-voice audition
// (voice-audition-plan.md): no narration has been generated, so the timing is estimated.
// Polish lines carry `sub`: "" = no subtitle yet (the viewer is as lost as Ava), text = the translation.
// Kate is never seen awake at night here: at the gate she is a pale shape, eyes open (blink: false).
import type { Storyboard, Line, ShotSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 60 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const NIGHT = "night" as const, DAY = "interior" as const;
const ava = (text: string): Line => ({ text, who: "ava" });
const ollie = (text: string): Line => ({ text, who: "ollie" });
const kate = (text: string): Line => ({ text, who: "kate" });
const mark = (text: string): Line => ({ text, who: "mark" });
/** a voice from another room / the garden: nobody in the shot speaks it */
const off = (text: string, voice: string, sub: string): Line => ({ text, who: "narrator", voice, sub });
const L1 = "Mamo, woda jest przy drzwiach.", L4 = "Weź go!", L5 = "Obiecałaś, że nie puścisz.";   // [PL provisional]
// a close insert: the 9:16 card in the open side of a room, the camera 1 m in front of it
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51);
const insert = (set: string, light: typeof NIGHT | typeof DAY, variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: { t: number }[]): ShotSpec =>
  ({ set, light, dur, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "olInsert", at: CARD, variant, steps: steps ?? [{ t: -0.7 }] }], note, ...extra });
// Ava's bed at the shared wall, her door, her window; the garden from her window
const BED_CAM = at([0.75, 1.15, 1.55], [-1.15, 0.95, -0.35], 44), EYES_CAM = at([-0.1, 1.05, 0.95], [-1.0, 1.0, -0.38], 34);
const DOOR_CAM = at([-0.9, 0.75, 0.35], [1.66, 0.45, 0.9], 48), WIN_CAM = at([0.1, 1.55, 1.3], [0.75, 1.45, -1.6], 46);
const GARDEN_CAM = at([2.35, 4.05, 0.5], [1.0, 0.4, 20.5], 40), GATE_CAM = at([2.35, 4.05, 0.5], [0.9, 0.9, 20.5], 24);
const WX = (v: string, look: V) => [{ id: "ferryWater", at: look, variant: v, steps: STEADY }, { id: "rain", at: look, steps: STEADY }];
const AVA_BED = { who: "ava", at: "bed" as const, mode: "sit" as const };

export const OLLIE_1: Storyboard = {
  id: "ollie-1", title: "What Ollie Says at 3 A.M. · Part 1: 3:00",
  cast: { ava: "ava", ollie: "ollie", kate: "kate", mark: "mark" },
  voice: "alice", voices: { ava: "alice", ollie: "liamQuiet", kate: "granWhisper", mark: "brian" },   // placeholders
  music: { mood: "hush", gain: -6 }, engine: 3, autoSfx: false,
  shots: [
    // ---- 1: three knocks, three answered
    insert("avaRoom", NIGHT, "knock", 2.4, "1 her knuckles: three knocks; three come back", { sfx: [{ t: 0.15, name: "knock" }, { t: 1.35, name: "knock", gain: -9 }] }),
    { set: "avaRoom", light: NIGHT, dur: 1.8, camera: BED_CAM, actors: [{ ...AVA_BED, act: "happy", face: "smile", facing: -1 }], note: "1 Ava smiles, settles" },
    // ---- 2: 3:00, the voice through the wall
    insert("avaRoom", NIGHT, "clock", 2.2, "2 the clock: 2:59 -> 3:00", { sfx: [{ t: 1.0, name: "clock_tick", gain: -6 }] }, [{ t: -0.7 }, { t: 1.0 }]),
    { say: off(L1, "liamQuiet", ""), set: "avaRoom", light: NIGHT, hold: 0.5, camera: EYES_CAM, cams: [{ t: 0, ...EYES_CAM, blockOk: true }],
      actors: [{ ...AVA_BED, act: "neutral", face: "sleepy", facing: "camera", beats: [{ t: 0.5, face: "shock" }] }], note: "2 his voice through the wall; her eyes open" },
    insert("avaRoom", NIGHT, "rec", 1.5, "2 she records", { sfx: [{ t: 0.1, name: "blip_up", gain: -8 }] }),
    // ---- 3: she knocks; nothing; someone takes him
    insert("avaRoom", NIGHT, "knock", 1.7, "3 she knocks. Nothing", { sfx: [{ t: 0.15, name: "knock" }] }),
    { set: "avaRoom", light: NIGHT, dur: 3.2, camera: DOOR_CAM, cams: [{ t: 0, ...DOOR_CAM, blockOk: true }], actors: [],
      sfx: [{ t: 0.3, name: "creak" }, { t: 0.9, name: "step_floor" }, { t: 1.4, name: "step_floor", gain: -4 }, { t: 1.9, name: "step_floor" }, { t: 2.6, name: "latch_click", gain: -10 }], note: "3 her door: the landing light under it; footsteps, a bolt" },
    // ---- 4: the garden; a child's voice from the dark
    { set: "avaRoom", light: NIGHT, dur: 2.2, camera: WIN_CAM, cams: [{ t: 0, ...WIN_CAM, blockOk: true }], actors: [{ who: "ava", at: "window", act: "scared", back: true }], note: "4 Ava at her window" },
    { say: off(L5, "liamQuiet", ""), set: "ferryBack", light: NIGHT, hold: 1.2, camera: GARDEN_CAM, cams: [{ t: 0, ...GARDEN_CAM, blockOk: true }], actors: [],
      props: WX("river", GARDEN_CAM.look), note: "4 her view: the black garden, the river; a thin voice" },
    // ---- 5: morning; the bolt
    { say: [mark("Top bolt was open again."), kate("Wasn't me."), ava("Not me."), ollie("Mummy, more milk?")], set: "ferryKitchen", light: DAY,
      camera: at([-0.1, 1.55, 4.3], [-0.1, 1.15, -0.8], 56), cams: [{ t: 0, ...at([-0.1, 1.55, 4.3], [-0.1, 1.15, -0.8], 56), blockOk: true }, { word: "Mummy", ...at([0.55, 1.15, 1.6], [0.45, 1.1, -0.4], 30), cut: true, blockOk: true }],
      actors: [{ who: "mark", at: "door", act: "neutral", face: "stern", back: true },
        { who: "kate", at: "counter", act: "neutral", back: true },
        { who: "ava", at: [-0.35, 0.46, -0.4], mode: "sit", act: "neutral", facing: "camera" },
        { who: "ollie", at: [0.45, 0.46, -0.4], mode: "sit", act: "neutral", face: "sad", facing: "camera" }], note: "5 the bolt; Ollie says Mummy" },
    // ---- 6: the translator
    insert("ferryKitchen", DAY, "trans", 4.6, "6 the translator: both lines", { sfx: [{ t: 0.2, name: "blip_up", gain: -8 }, { t: 2.2, name: "blip_up", gain: -8 }] }, [{ t: -0.7 }, { t: 2.2 }]),
    { say: [ava("Ollie. What's woda?"), ollie("What's what?")], set: "ferryKitchen", light: DAY, camera: at([0.05, 1.2, 2.2], [0.05, 1.1, -0.4], 36),
      actors: [{ who: "ava", at: [-0.35, 0.46, -0.4], mode: "sit", act: "suspicious", facing: "toward:ollie" }, { who: "ollie", at: [0.45, 0.46, -0.4], mode: "sit", act: "confused", facing: "toward:ava" }], note: "6 he doesn't know the word" },
    // ---- 7: Mum; the scar; the flash
    { say: { text: "Mum, this is Polish, isn't it?", who: "narrator", voice: "alice" }, set: "ferryKitchen", light: DAY, camera: at([0.2, 1.45, 1.5], [-1.0, 1.4, -0.95], 34),
      actors: [{ who: "kate", at: "counter", act: "neutral", facing: "camera", beats: [{ word: "Polish", face: "nervous" }] }], sfx: [{ t: 1.6, name: "storm_wind", gain: -14 }], note: "7 Kate at the counter; the rain starts" },
    insert("ferryKitchen", DAY, "palm", 1.7, "7 the scar across her palm"),
    insert("ferryKitchen", NIGHT, "flash08", 0.9, "7 flash, 2008: a small hand slipping from hers", { sfx: [{ t: 0, name: "whoosh_low", gain: -6 }] }),
    { say: kate("I've forgotten all that, love."), set: "ferryKitchen", light: DAY, hold: 0.4, camera: at([0.0, 1.4, 1.2], [-1.0, 1.3, -0.95], 38), cams: [{ t: 0, ...at([0.0, 1.4, 1.2], [-1.0, 1.3, -0.95], 38), blockOk: true }],
      actors: [{ who: "kate", at: "counter", act: "neutral", face: "nervous", facing: "camera", gesture: "crossArms" }], note: "7 she turns it away" },
    // ---- 8: the geography: the bolt, the river
    { say: mark("Nights again. Top bolt, every night. River's right there."), set: "ferryKitchen", light: DAY, camera: at([0.3, 1.5, 2.6], [1.5, 1.35, 0.4], 40),
      cams: [{ t: 0, ...at([0.3, 1.5, 2.6], [1.5, 1.35, 0.4], 40), blockOk: true }, { word: "Top", ...at([0.9, 1.75, 0.2], [1.6, 1.95, -1.82], 30), cut: true, blockOk: true }],
      actors: [{ who: "mark", at: [1.5, 0, 0.4], act: "explain", facing: "camera" }], note: "8 Mark; the top bolt" },
    // ---- 9: the tuck-in; the camera that hears
    { say: [ollie("Daddy says it hears me if I'm scared."), ava("Then you're never on your own."), ollie("Three knocks?"), ava("Three knocks.")], set: "ollieRoom", light: "interiorCool",
      camera: at([-0.45, 1.3, 2.0], [0.85, 0.9, -0.6], 42), cams: [{ t: 0, ...at([-0.45, 1.3, 2.0], [0.85, 0.9, -0.6], 42), blockOk: true }, { word: "hears", ...at([-0.2, 1.6, 0.75], [-1.52, 1.6, 0.75], 30), cut: true, blockOk: true }, { word: "Then", ...at([-0.45, 1.3, 2.0], [0.85, 0.9, -0.6], 42), cut: true, blockOk: true }],
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", facing: "toward:ava" }, { who: "ava", at: [0.5, -0.1, -1.12], act: "happy", face: "smile", facing: "toward:ollie" }], note: "9 the tuck-in; the camera on the shelf" },
    // ---- 10: night two: she waits
    { set: "avaRoom", light: NIGHT, dur: 2.4, camera: BED_CAM, actors: [{ ...AVA_BED, act: "determined", facing: -1 }], note: "10 Ava sits up, waiting" },
    insert("avaRoom", NIGHT, "clock258", 1.2, "10 2:58"),
    // ---- 11: 3:00 again
    insert("avaRoom", NIGHT, "clock", 1.9, "11 2:59 -> 3:00", { sfx: [{ t: 0.9, name: "clock_tick", gain: -6 }] }, [{ t: -0.7 }, { t: 0.9 }]),
    { say: off(L1, "liamQuiet", "Mama, the water's at the door."), set: "avaRoom", light: NIGHT, hold: 0.4, camera: EYES_CAM, cams: [{ t: 0, ...EYES_CAM, blockOk: true }],
      actors: [{ ...AVA_BED, act: "scared", facing: "camera" }], sfx: [{ t: 2.2, name: "creak" }, { t: 2.7, name: "step_floor" }], note: "11 the same words; footsteps" },
    // ---- 12: the gate; a woman's voice
    { set: "avaRoom", light: NIGHT, dur: 1.6, camera: WIN_CAM, cams: [{ t: 0, ...WIN_CAM, blockOk: true }], actors: [{ who: "ava", at: "window", act: "scared", back: true }], note: "12 Ava at the window" },
    { say: off(L4, "granWhisper", ""), set: "ferryBack", light: NIGHT, hold: 0.9, camera: GARDEN_CAM, cams: [{ t: 0, ...GARDEN_CAM, blockOk: true }, { t: 0.7, ...GATE_CAM, glide: 1.6, blockOk: true }],
      actors: [{ who: "kate", at: [0.75, 0, 20.3], act: "neutral", back: true, blink: false }, { who: "ollie", at: [1.2, 0, 20.3], act: "neutral", back: true }],
      props: WX("river", GARDEN_CAM.look), note: "12 two pale shapes at the gate; a woman shouts" },
    insert("avaRoom", NIGHT, "transLive", 1.8, "12 the phone on the sill: TAKE HIM!", { sfx: [{ t: 0.1, name: "sting_low", gain: -6 }] }),
    { say: off(L5, "liamQuiet", "You promised you wouldn't let go."), set: "ferryBack", light: NIGHT, hold: 0.5, camera: GATE_CAM, cams: [{ t: 0, ...GATE_CAM, blockOk: true }],
      actors: [{ who: "kate", at: [0.75, 0, 20.3], act: "neutral", back: true, blink: false }, { who: "ollie", at: [1.2, 0, 20.3], act: "neutral", back: true }],
      props: WX("river", GATE_CAM.look), note: "12 the thin voice answers" },
    // ---- 13: Dad doesn't answer; they come back
    insert("avaRoom", NIGHT, "callDad", 1.6, "13 calling Dad", { sfx: [{ t: 0.1, name: "phone_buzz", gain: -8 }] }),
    { say: { text: "It's Mark, leave a", who: "narrator", voice: "brian" }, set: "avaRoom", light: NIGHT, hold: 3.0, camera: at([-0.3, 1.25, 0.9], [1.15, 1.2, 0.9], 40), cams: [{ t: 0, ...at([-0.3, 1.25, 0.9], [1.15, 1.2, 0.9], 40), blockOk: true }],
      actors: [{ who: "ava", at: "door", act: "scared", facing: 1 }], sfx: [{ t: 1.6, name: "latch_click", gain: -8 }, { t: 2.2, name: "step_floor" }, { t: 2.7, name: "step_floor" }, { t: 3.6, name: "step_floor", gain: -8 }, { t: 4.0, name: "step_floor", gain: -8 }], note: "13 voicemail; heavy steps, then small ones; her hand near the door" },
    // ---- 14: his feet, his wrist
    { set: "ollieRoom", light: NIGHT, dur: 2.2, camera: at([-0.6, 1.3, 2.2], [0.75, 0.95, -0.6], 46), cams: [{ t: 0, ...at([-0.6, 1.3, 2.2], [0.75, 0.95, -0.6], 46), blockOk: true }],
      actors: [{ who: "ollie", at: "asleep", act: "neutral", face: "smile_closed", facing: "camera" }, { who: "ava", at: "behind", act: "scared", facing: "toward:ollie" }], note: "14 Ollie in bed; Ava beside him" },
    insert("ollieRoom", NIGHT, "feet", 2.0, "14 wet feet, grass"),
    insert("ollieRoom", NIGHT, "wrist", 2.0, "14 red finger marks"),
    // ---- 15: "Not tonight, Mama."
    { say: [ollie("Not tonight, Mama. I'm tired."), ava("Mama?")], set: "ollieRoom", light: NIGHT, hold: 1.6, camera: at([-0.2, 1.1, 1.0], [0.85, 0.95, -0.5], 34),
      cams: [{ t: 0, ...at([-0.2, 1.1, 1.0], [0.85, 0.95, -0.5], 34), blockOk: true }, { word: "Mama?", ...at([0.1, 1.25, 0.6], [0.55, 1.2, -1.15], 30), cut: true, blockOk: true }],
      actors: [{ who: "ollie", at: "asleep", act: "neutral", face: "smile_closed", facing: "camera" }, { who: "ava", at: "behind", act: "scared", facing: "toward:ollie", beats: [{ word: "Mama?", face: "shock" }] }],
      sfx: [{ t: 4.2, name: "sting_low" }], note: "15 he murmurs; she freezes" },
  ],
};
