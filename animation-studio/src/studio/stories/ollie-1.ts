// What Ollie Says at 3 A.M., Part 1: "3:00": the FINAL screenplay (productions/what-ollie-says/episodes/ep1-3am.md,
// scene numbers in the notes). Voices are PLACEHOLDERS until the Polish check and the voice audition
// (voice-audition-plan.md): no narration has been generated, so the timing is estimated.
// The six ritual lines (story-lock.md §3) are verbatim: L1 and L5 in the toddler voice (the role), L2, L3, L4, L6 Kate's.
// Every Polish line carries its English subtitle (`sub`). Kate asleep: blink false + the blank face; awake (scene 10): blinks.
import type { Storyboard, Line, ShotSpec, ActorSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 80 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const NIGHT = "night" as const, DAY = "interior" as const, COOL = "interiorCool" as const;
type Light = typeof NIGHT | typeof DAY | typeof COOL;
// [PL provisional] story-lock.md §3, in order
const L1 = "Mamo, woda jest przy drzwiach.", L2 = "Kubuś, trzymaj mnie za rękę.", L3 = "Nie puszczę cię. Obiecuję.";
const L4 = "Weź go!", L5 = "Obiecałaś, że nie puścisz.", L6 = "Przepraszam.";
const TODDLER = "wrenWhisper";   // placeholder for the toddler voice (the role): cast at the audition
const ava = (text: string): Line => ({ text, who: "ava" });
const ollie = (text: string): Line => ({ text, who: "ollie" });
const ollieT = (text: string): Line => ({ text, who: "ollieT" });
const kate = (text: string, sub?: string): Line => (sub ? { text, who: "kate", sub } : { text, who: "kate" });
const mark = (text: string): Line => ({ text, who: "mark" });
const role = (text: string, sub: string): Line => ({ text, who: "ollie", voice: TODDLER, sub });   // Kuba's words, out of Ollie
/** Ava behind her phone (not in the shot) */
const avaOff = (text: string): Line => ({ text, who: "narrator", voice: "alice" });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
// a close insert: the 9:16 card in the open side of a room, the camera 1 m in front of it
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51);
const insert = (variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: { t: number }[], set = "ferryKitchenNight", light: Light = NIGHT): ShotSpec =>
  ({ set, light, dur, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "olInsert", at: CARD, variant, steps: steps ?? [{ t: -0.7 }] }], note, ...extra });
const STORM = { ambience: "amb_storm" as const };
// the garden: the flood only over our lawn, and the rain
const GARDEN = (look: V, still = false) => [{ id: "ferryWater", at: look, variant: "garden", ...(still ? {} : { steps: STEADY }) }, { id: "rain", at: look, steps: STEADY }];
const PHONE = (look: V, variant: "rec" | "post") => ({ id: "olPhoneCam", at: look, variant, steps: STEADY });
// Kate asleep (scenes 7-9)
const KATE_NIGHT: Partial<ActorSpec> = { act: "neutral", face: "blank", blink: false, keepFace: true };
const ROOM_FLOOR = 2.8;
const KATE_BED: V = [-1.25, ROOM_FLOOR + 0.6, -1.9];       // the edge of her bed (ferryBack: Kate and Mark's room)
const AVA_KATEROOM: V = [0.15, ROOM_FLOOR, -1.3];
const BENCH_AVA: V = [-0.35, 0.46, -0.4], BENCH_OLLIE: V = [0.45, 0.46, -0.4];   // the kitchen bench, facing the camera
const OLLIE_FLOOR_AVA: V = [0.5, 0.02, 0.4];               // Ava on Ollie's floor, her back to his bed
// scene 9's marks: the water starts at z 10.8 (0.16 m deep)
const EDGE_KATE: V = [1.5, 0, 11.0], EDGE_OLLIE: V = [2.0, 0, 11.7], DEEP_OLLIE: V = [2.1, -0.32, 12.8];

export const OLLIE_1: Storyboard = {
  id: "ollie-1", title: "What Ollie Says at 3 A.M. · Part 1: 3:00",
  cast: { ava: "ava", ollie: "ollie", ollieT: "ollieTowel", kate: "kate", mark: "mark" },
  voice: "alice", voices: { ava: "alice", ollie: "liamQuiet", ollieT: "liamQuiet", kate: "granWhisper", mark: "brian" },   // placeholders
  music: { mood: "hush", gain: -6 }, engine: 3, autoSfx: false,
  shots: [
    // ================= SCENE 1 · 03:00 Wed 11 · seen through Ava's phone =================
    { say: role(L1, "Mama, the water's at the door."), set: "ollieRoom", light: NIGHT, hold: 0.5, ...lock(at([-0.6, 1.3, 1.45], [1.0, 0.85, -0.38], 50)),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", keepFace: true, facing: -1, idle: 0.3 }],
      props: [PHONE([1.0, 0.85, -0.38], "rec")], sfx: [{ t: 0, name: "camera_shutter", gain: -10 }], note: "1 frame one: Ollie bolt upright, eyes shut, the toddler voice; REC 03:00" },
    { say: avaOff("Ollie?"), set: "ollieRoom", light: NIGHT, hold: 1.0, camera: at([0.45, 1.05, 1.0], [1.0, 1.02, -0.38], 50),
      cams: [{ t: 0, ...at([0.45, 1.05, 1.0], [1.0, 1.02, -0.38], 50), blockOk: true }, { t: 0.2, ...at([0.62, 1.04, 0.62], [1.0, 1.02, -0.38], 50), glide: 1.6, blockOk: true }],
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", facing: "camera", idle: 0.2 }],
      props: [PHONE([1.0, 1.02, -0.38], "post")], note: "1 '…Ollie?': eyes still shut, he turns his face to the lens; the post text" },
    { set: "ollieRoom", light: NIGHT, dur: 1.6, ...lock(at([0.25, 1.15, 1.0], [1.1, 0.55, -0.38], 50)),
      actors: [{ who: "ollie", at: "asleep", act: "neutral", face: "trance", facing: "camera", idle: 0.2 }],
      props: [PHONE([1.1, 0.55, -0.38], "post")], sfx: [{ t: 0, name: "thud", gain: -16 }], note: "1 he drops back onto the pillow, asleep. Hard cut" },

    // ================= SCENE 2 · breakfast, Wed 11 =================
    { say: ava("Okay. Explain that."), set: "ferryKitchen", light: DAY, hold: 0.3, ...lock(at([-0.1, 1.55, 4.3], [-0.1, 1.15, -0.8], 56)), ...STORM,
      actors: [{ who: "kate", at: "counter", act: "neutral", back: true },
        { who: "ava", at: BENCH_AVA, mode: "sit", act: "suspicious", facing: "toward:kate" },
        { who: "ollie", at: BENCH_OLLIE, mode: "sit", act: "happy", face: "grin", facing: "camera" }], note: "2 rain; the toast dinosaur; Ava plays the clip" },
    insert("trans", 1.8, "2 the translator: DETECTED: POLISH, line 1", { sfx: [{ t: 0.2, name: "blip_up", gain: -8 }] }, [{ t: 99 }], "ferryKitchen", DAY),
    { say: kate("Where did he hear that?"), set: "ferryKitchen", light: DAY, hold: 0.3, ...lock(at([0.2, 1.45, 1.5], [-1.0, 1.4, -0.95], 34)),
      actors: [{ who: "kate", at: "counter", act: "neutral", face: "sad", keepFace: true, facing: "camera" }], note: "2 her face doesn't move; the colour goes" },
    insert("palm", 1.1, "2 the scar, her hand tight on the mug", {}, undefined, "ferryKitchen", DAY),
    { say: ava("You tell me."), set: "ferryKitchen", light: DAY, ...lock(at([0.05, 1.2, 2.2], [0.05, 1.1, -0.4], 36)),
      actors: [{ who: "ava", at: BENCH_AVA, mode: "sit", act: "determined", keepFace: true, facing: "toward:kate" }, { who: "ollie", at: BENCH_OLLIE, mode: "sit", act: "neutral", facing: "toward:ava" }], note: "2 Ava" },
    { say: kate("I haven't spoken it in eighteen years."), set: "ferryKitchen", light: DAY, hold: 0.2, ...lock(at([0.1, 1.45, 1.2], [-1.0, 1.38, -0.95], 30)),
      actors: [{ who: "kate", at: "counter", act: "sad", face: "sad", keepFace: true, facing: "camera" }], note: "2 Kate, quietly" },
    { say: ollie("Mummy, what's Polish?"), set: "ferryKitchen", light: DAY, ...lock(at([0.45, 1.0, 1.35], [0.45, 0.95, -0.4], 30)),
      actors: [{ who: "ollie", at: BENCH_OLLIE, mode: "sit", act: "confused", facing: "camera" }], note: "2 Ollie, mouth full: 'Mummy' by day" },
    { say: kate("Eat your toast, Ollie."), set: "ferryKitchen", light: DAY, hold: 0.6, ...lock(at([-0.1, 1.5, 3.0], [-0.6, 1.2, -0.9], 44)),
      actors: [{ who: "kate", at: "counter", act: "neutral", back: true }, { who: "ava", at: BENCH_AVA, mode: "sit", act: "suspicious", facing: "toward:kate" },
        { who: "ollie", at: BENCH_OLLIE, mode: "sit", act: "neutral", facing: "toward:kate" }], note: "2 she turns back to the rain on the window" },

    // ================= SCENE 3 · Kate's room, evening =================
    { set: "ferryBack", light: NIGHT, dur: 1.8, ...lock(at([0.3, 4.25, -0.6], [-1.3, 4.0, -1.9], 50)),
      actors: [{ who: "kate", at: KATE_BED, mode: "sit", act: "sad", face: "sad", facing: "camera", gesture: "coverMouth" }], note: "3 through the half-open door: Kate on the edge of her bed, crying" },
    insert("towelPhoto", 1.8, "3 the tea towel pressed to the photo, over and over; tears"),
    { say: kate("Go to bed, Ava."), set: "ferryBack", light: NIGHT, hold: 0.2, ...lock(at([-0.2, 4.2, -1.2], [-1.25, 4.1, -1.95], 46)),
      actors: [{ who: "kate", at: KATE_BED, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera" }], sfx: [{ t: 0, name: "creak", gain: -6 }], note: "3 a floorboard; the tin slid under the bed; not looking up" },
    { say: ava("It's half eight."), set: "ferryBack", light: NIGHT, ...lock(at([-0.75, 4.0, -0.95], [0.15, 3.95, -1.3], 36)),
      actors: [{ who: "ava", at: AVA_KATEROOM, act: "neutral", face: "confused", keepFace: true, facing: "toward:kate" }], note: "3 Ava" },
    { say: kate("Please."), set: "ferryBack", light: NIGHT, hold: 0.5, ...lock(at([-0.35, 4.2, -1.35], [-1.25, 4.15, -1.95], 34)),
      actors: [{ who: "kate", at: KATE_BED, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera" }], note: "3 Kate" },

    // ================= SCENE 4 · the tin, minutes later =================
    insert("tinLid", 1.7, "4 under the bed: the tin, Ollie's dinosaur sticker, her thumb on it", { sfx: [{ t: 0.3, name: "swish_soft", gain: -8 }] }),
    insert("tinOpen", 2.8, "4 the dry tissue, the WET photo; the drop runs onto her fingers", { sfx: [{ t: 1.3, name: "drip", gain: -4 }] }, [{ t: 1.3 }]),
    insert("photoBack", 1.9, "4 the back: Kubuś · 2008"),
    insert("match", 3.0, "4 beside Ollie's school photo; laid over it: the same face; a tear runs", { sfx: [{ t: 1.4, name: "sting_low", gain: -10 }] }, [{ t: 1.4 }]),
    { say: ava("…what?"), set: "ferryBack", light: NIGHT, hold: 0.6, ...lock(at([-0.95, 4.0, -0.9], [0.15, 3.95, -1.3], 40)),
      actors: [{ who: "ava", at: AVA_KATEROOM, act: "shock", face: "shock", keepFace: true, facing: "camera" }], note: "4 Ava, a whisper" },

    // ================= SCENE 5 · the kitchen, night, Dad leaves =================
    { say: [ava("Dad. Did Mum have a baby? Before us?"), mark("What? No. Why, what's she said?"), ava("Nothing. Forget it."), mark("River's high, but it never comes over on our side. Lock the back door, yeah?")],
      set: "ferryKitchenNight", light: DAY, camera: at([0.4, 1.4, 3.3], [0.4, 1.1, 0.0], 50),
      cams: [{ t: 0, ...at([0.4, 1.4, 3.3], [0.4, 1.1, 0.0], 50), blockOk: true }, { word: "Why", ...at([0.75, 1.6, 2.0], [1.15, 1.55, 0.3], 32), cut: true, blockOk: true },
        { word: "Nothing", ...at([-0.35, 1.05, 1.4], [-0.35, 1.0, -0.4], 30), cut: true, blockOk: true }, { word: "River's", ...at([0.75, 1.6, 2.0], [1.15, 1.55, 0.3], 32), cut: true, blockOk: true }],
      actors: [{ who: "ava", at: BENCH_AVA, mode: "sit", act: "nervous", face: "neutral", keepFace: true, facing: "toward:mark" },
        { who: "mark", at: [1.15, 0, 0.3], act: "neutral", facing: "toward:ava", beats: [{ word: "No", face: "laugh" }, { word: "Why", face: "confused" }, { word: "River's", face: "smile" }] }], note: "5 Dad, his flask, his keys; he doesn't know" },
    { set: "ferryKitchenNight", light: DAY, dur: 1.8, ...lock(at([0.6, 1.5, 1.2], [1.35, 1.6, -1.8], 45)),
      actors: [{ who: "ava", at: [1.35, 0, -1.2], act: "neutral", back: true, gesture: "raiseHand" }],
      sfx: [{ t: 0, name: "thud", gain: -12 }, { t: 0.8, name: "latch_click", gain: -4 }], note: "5 the front door shuts; Ava slides the back door's top bolt across" },

    // ================= SCENE 6 · Ollie's room: bedtime, then 02:58 =================
    { say: [ava("Shout if you need me."), ollie("I'm six. I'm not scared.")], set: "ollieRoom", light: COOL, ...lock(at([-0.45, 1.3, 2.0], [0.85, 0.9, -0.6], 42)),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "proud", facing: "toward:ava" }, { who: "ava", at: "behind", act: "happy", face: "smile", facing: "toward:ollie" }], note: "6 the tuck-in" },
    { set: "ollieRoom", light: COOL, dur: 1.6, ...lock(at([-0.3, 1.2, 1.6], [0.8, 0.95, -0.6], 38)),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "scared", facing: "toward:ava", gesture: "offer", reach: "ava" }, { who: "ava", at: "behind", act: "happy", face: "smile", facing: "toward:ollie" }], note: "6 his hand shoots out and grabs her sleeve; she stays" },
    insert("phone258", 1.1, "6 her phone: 02:58", {}, undefined, "ollieRoom"),
    { say: [ollie("Not tonight, Mama. I'm tired."), ava("…Mama?")], set: "ollieRoom", light: NIGHT, hold: 0.8, camera: at([-0.9, 0.95, 0.7], [0.95, 0.55, -0.25], 44),
      cams: [{ t: 0, ...at([-0.9, 0.95, 0.7], [0.95, 0.55, -0.25], 44), blockOk: true }, { word: "Mama", n: 2, ...at([0.0, 0.85, 1.6], [0.5, 0.75, 0.4], 36), cut: true, blockOk: true }],
      actors: [{ who: "ollie", at: "asleep", act: "neutral", face: "trance", keepFace: true, facing: "camera" },
        { who: "ava", at: OLLIE_FLOOR_AVA, mode: "sit", act: "neutral", keepFace: true, facing: "toward:ollie", gesture: "offer", reach: "ollie", beats: [{ word: "Mama", n: 2, face: "shock" }] }], note: "6 she touches his shoulder; eyes shut, his own voice; she goes still" },

    // ================= SCENE 7 · 03:00 Thu 12 =================
    insert("phoneClock", 1.8, "7 02:59 -> 03:00", { sfx: [{ t: 1.0, name: "clock_tick", gain: -4 }] }, [{ t: 1.0 }], "ollieRoom"),
    { say: role(L1, "Mama, the water's at the door."), set: "ollieRoom", light: NIGHT, hold: 0.5, ...lock(at([0.1, 0.55, 1.15], [1.0, 0.95, -0.38], 46)),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", keepFace: true, facing: -1, idle: 0.3 }], note: "7 bolt upright, eyes shut: the opening frame, from the floor" },
    { say: ava("Mum? He's doing it again"), set: "ollieRoom", light: NIGHT, hold: 0.2, ...lock(at([1.1, 1.05, 1.5], [-1.3, 1.3, 0.85], 44)), sfx: [{ t: 0, name: "creak", gain: -4 }],
      actors: [{ who: "kate", at: [-1.3, 0, 0.85], ...KATE_NIGHT, facing: "camera" }, { who: "ava", at: OLLIE_FLOOR_AVA, mode: "sit", act: "scared", face: "scared", facing: "toward:kate" }], note: "7 the door: Kate, eyes wide open, unblinking" },
    { say: kate(L2, "Kuba, hold my hand."), set: "ollieRoom", light: NIGHT, hold: 0.5, ...lock(at([-0.35, 1.15, 1.15], [0.88, 1.05, -0.75], 36)),
      actors: [{ who: "kate", at: "kneel", ...KATE_NIGHT, facing: "toward:ollie", gesture: "offer", reach: "ollie" },
        { who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" }], note: "7 she walks past Ava, kneels, takes his hand: L2" },
    { say: ava("Mum, stop. You're scaring me."), set: "ollieRoom", light: NIGHT, hold: 1.6, ...lock(at([1.5, 1.5, 3.1], [-0.3, 1.0, 0.5], 54)),
      actors: [{ who: "kate", at: [-0.2, 0, 0.55], ...KATE_NIGHT, walk: { to: [-1.45, 0, 1.15], t0: 1.6, t1: 3.2 } },
        { who: "ollie", at: [0.25, 0, 0.45], act: "neutral", face: "trance", walk: { to: [-1.0, 0, 1.05], t0: 1.6, t1: 3.2 } },
        { who: "ava", at: [0.45, 0, 0.75], act: "scared", face: "scared", facing: "toward:kate", gesture: "offer", reach: "kate", beats: [{ t: 2.0, gesture: "hang" }] }], note: "7 Ava grabs her wrist; Kate doesn't look; they walk out, her hand slides off" },

    // ================= SCENE 8 · the kitchen, the bolt, the garden =================
    { set: "ferryKitchenNight", light: NIGHT, dur: 2.4, ...lock(at([-0.3, 1.45, 2.4], [1.4, 1.0, -0.2], 48)),
      actors: [{ who: "kate", at: [1.7, 0, 1.5], ...KATE_NIGHT, walk: { to: [1.4, 0, -1.15], t0: 0.1, t1: 2.3, view: "back" } },
        { who: "ollie", at: [1.3, 0, 1.6], act: "neutral", face: "trance", walk: { to: [1.0, 0, -1.05], t0: 0.1, t1: 2.3, view: "back" } }],
      sfx: [{ t: 0.4, name: "step_floor", gain: -8 }, { t: 1.2, name: "step_floor", gain: -8 }], note: "8 in from the stairs, hand in hand, bare feet" },
    { set: "ferryKitchenNight", light: NIGHT, dur: 1.6, ...lock(at([0.6, 1.5, 1.2], [1.35, 1.6, -1.8], 45)),
      actors: [{ who: "kate", at: [1.35, 0, -1.2], ...KATE_NIGHT, back: true, gesture: "raiseHand" }],
      sfx: [{ t: 0.4, name: "latch_click" }, { t: 1.1, name: "storm_wind", gain: -6 }], note: "8 without looking, she slides back the bolt Ava locked" },
    { say: avaOff("That's not… that's not possible."), set: "ferryBack", light: NIGHT, dur: 4.2, hold: 1.4, camera: at([2.2, 5.2, 2.6], [2.6, 0, 13.5], 50),
      cams: [{ t: 0, ...at([2.2, 5.2, 2.6], [2.6, 0, 13.5], 50), blockOk: true }, { t: 0.1, ...at([2.25, 5.6, 2.9], [2.7, 0, 14.5], 50), glide: 3.6, blockOk: true }], ...STORM,
      actors: [{ who: "kate", at: [1.5, 0, 7.6], ...KATE_NIGHT, walk: { to: [1.55, 0, 10.4], t0: 0, t1: 4.0, view: "back" } },
        { who: "ollie", at: [2.0, 0, 7.6], act: "neutral", face: "trance", walk: { to: [2.05, 0, 10.4], t0: 0, t1: 4.0, view: "back" } }],
      props: GARDEN([2.6, 0, 13.5]), note: "8 THE HIGH WIDE: black water over our lawn only, stopping dead at the fence; next door's lawn dry under their security light" },
    { say: kate(L3, "I won't let go of you. I promise."), set: "ferryBack", light: NIGHT, dur: 3.2, hold: 0.4, camera: at([1.8, 1.2, 13.6], [1.75, 1.1, 9.0], 42),
      cams: [{ t: 0, ...at([1.8, 1.2, 13.6], [1.75, 1.1, 9.0], 42), blockOk: true }, { t: 0.1, ...at([1.8, 1.15, 13.1], [1.75, 1.05, 9.6], 42), glide: 2.6, blockOk: true }], ...STORM,
      actors: [{ who: "kate", at: [1.5, 0, 8.2], ...KATE_NIGHT, facing: "toward:ollie", walk: { to: [1.55, 0, 10.6], t0: 0, t1: 3.0, view: "front" } },
        { who: "ollie", at: [2.0, 0, 8.2], act: "neutral", face: "trance", walk: { to: [2.05, 0, 10.6], t0: 0, t1: 3.0, view: "front" } }],
      props: GARDEN([1.7, 0.5, 9.5]), note: "8 toward the water, hand in hand; she bends to him: L3 (the promise)" },

    // ================= SCENE 9 · the water's edge =================
    { say: kate(L4, "Take him!"), set: "ferryBack", light: NIGHT, dur: 1.9, hold: 0.3, camera: at([1.85, 1.15, 15.0], [1.75, 1.0, 11.3], 44),
      cams: [{ t: 0, ...at([1.85, 1.15, 15.0], [1.75, 1.0, 11.3], 44), blockOk: true }, { t: 0.1, ...at([1.82, 1.1, 14.2], [1.75, 1.0, 11.3], 44), glide: 1.4, blockOk: true }], ...STORM,
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, facing: "toward:ollie", gesture: "offer", reach: "ollie" },
        { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" }],
      props: GARDEN([1.8, 0.5, 11.4]), kicks: [{ word: "Weź" }], sfx: [{ t: 0.05, name: "sting_low", gain: -4 }], note: "9 ankle-deep; she lifts his arm out over the black water: L4" },
    { say: role(L5, "You promised you wouldn't let go."), set: "ferryBack", light: NIGHT, hold: 0.5, ...lock(at([0.95, 0.9, 13.5], [2.0, 0.85, 11.7], 38)), ...STORM,
      actors: [{ who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", keepFace: true, facing: -1, gesture: "crossArms" }],
      props: GARDEN([2.0, 0.5, 11.7]), note: "9 the toddler voice, small and broken: L5" },
    { say: kate(L6, "I'm sorry."), set: "ferryBack", light: NIGHT, dur: 1.4, hold: 0.2, ...lock(at([2.55, 1.45, 12.4], [1.5, 1.5, 11.0], 32)), ...STORM,
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, facing: 1 }],
      props: GARDEN([1.5, 1.0, 11.0]), note: "9 softly: L6" },
    insert("flash08", 1.1, "9 her hand opens; his small fingers slide out of hers", { ...STORM, sfx: [{ t: 0.1, name: "splash", gain: -12 }] }),
    { say: ava("MUM!"), set: "ferryBack", light: NIGHT, dur: 2.8, hold: 0.9, ...lock(at([3.1, 1.8, 4.8], [1.5, 0.9, 10.0], 44)), ...STORM,
      actors: [{ who: "kate", at: [1.25, 0, 10.6], ...KATE_NIGHT, walk: { to: [1.0, 0, 6.9], t0: 0, t1: 2.6, view: "front" } },
        { who: "ava", at: [2.7, 0, 6.8], act: "neutral", face: "scared", facing: "toward:kate", gesture: "crossArms" },
        { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "camera" }],
      props: GARDEN([1.7, 0.5, 10.5]), note: "9 Kate walks back up the lawn, calm, past her daughter; MUM! reaches nothing; Ollie alone in the water" },
    insert("pull", 1.4, "9 the water moves: Vs running against the current, dragging his pyjama legs", { ...STORM, sfx: [{ t: 0.1, name: "water_pour", gain: -10 }] }),
    { say: ollie("Ava?"), set: "ferryBack", light: NIGHT, dur: 1.3, hold: 0.3, ...lock(at([1.95, 0.95, 9.5], [2.0, 0.8, 11.9], 34)), ...STORM,
      actors: [{ who: "ollie", at: [2.0, 0, 11.9], act: "scared", face: "scared", facing: "camera" }],
      props: GARDEN([2.0, 0.6, 11.9]), note: "9 his eyes snap open: his own voice" },
    { say: ollie("AVA!"), set: "ferryBack", light: NIGHT, dur: 1.2, hold: 0.2, ...lock(at([2.2, 0.9, 10.3], [2.1, 0.5, 12.8], 40)), ...STORM,
      actors: [{ who: "ollie", at: DEEP_OLLIE, act: "scared", face: "scared", facing: "camera" }],
      props: GARDEN([2.1, 0.5, 12.8]), kicks: [{ word: "AVA" }], sfx: [{ t: 0, name: "splash", gain: -6 }], note: "9 dragged to his knees in the water" },
    { set: "ferryBack", light: NIGHT, dur: 1.7, ...lock(at([2.7, 0.14, 9.0], [2.15, 0.7, 12.6], 50)), ...STORM,
      actors: [{ who: "ava", at: [2.9, 0, 9.4], act: "determined", mode: "run", walk: { to: [2.2, 0, 12.1], t0: 0.1, t1: 1.3, mode: "run", view: "back" } },
        { who: "ollie", at: DEEP_OLLIE, act: "scared", face: "scared", facing: "camera" }],
      props: GARDEN([2.15, 0.5, 12.6]), sfx: [{ t: 0, name: "thud", gain: -8 }, { t: 1.2, name: "splash" }], note: "9 the phone hits the grass: its view from the ground; Ava sprints in" },
    { set: "ferryBack", light: NIGHT, dur: 1.1, ...lock(at([0.8, 1.1, 13.7], [2.1, 0.8, 12.4], 38)), ...STORM,
      actors: [{ who: "ava", at: [2.15, 0, 12.0], act: "determined", facing: "toward:ollie", gesture: "offer", reach: "ollie", moves: [{ t: 0.5, kind: "recoil", dur: 0.5 }] },
        { who: "ollie", at: DEEP_OLLIE, act: "scared", face: "scared", facing: "toward:ava", gesture: "offer", reach: "ava" }],
      props: GARDEN([2.1, 0.5, 12.4]), sfx: [{ t: 0.3, name: "splash", gain: -4 }], note: "9 under the arms; she heaves; the water drags her a step" },
    { set: "ferryBack", light: NIGHT, dur: 2.8, ...lock(at([1.0, 1.4, 7.6], [2.2, 0.4, 10.1], 44)), ...STORM,
      actors: [{ who: "ava", at: [2.0, 0, 10.0], mode: "sit", act: "scared", face: "scared", facing: "toward:ollie", gesture: "offer", reach: "ollie" }, { who: "ollie", at: [1.55, 0, 10.2], mode: "sit", act: "scared", face: "scared", facing: "toward:ava" }],
      props: GARDEN([2.6, 0, 11.0], true), sfx: [{ t: 0, name: "thud" }, { t: 0.15, name: "whoosh_low", gain: -4 }, { t: 2.1, name: "thud", gain: -12 }], note: "9 backward onto the lawn; the water lets go with a hiss and goes still; the back door bangs" },

    // ================= SCENE 10 · the kitchen, 03:21 =================
    insert("photoTable", 1.4, "10 the wet photo on the table", { sfx: [{ t: 0.3, name: "drip", gain: -6 }] }, undefined, "ferryKitchenNight", COOL),
    { say: [ava("Ollie. Who's this?"), ollieT("That's Kuba."), ava("How do you know that?"), ollieT("Mummy showed me. In her tin. She cried.")], set: "ferryKitchenNight", light: COOL, hold: 0.3,
      camera: at([0.05, 1.3, 3.0], [0.05, 1.0, -0.3], 50),
      cams: [{ t: 0, ...at([0.05, 1.3, 3.0], [0.05, 1.0, -0.3], 50), blockOk: true }, { word: "That's", ...at([0.45, 1.0, 1.4], [0.45, 0.95, -0.4], 30), cut: true, blockOk: true },
        { word: "How", ...at([-0.35, 1.05, 1.4], [-0.35, 1.0, -0.4], 30), cut: true, blockOk: true }, { word: "Mummy", ...at([0.45, 1.0, 1.4], [0.45, 0.95, -0.4], 30), cut: true, blockOk: true }],
      actors: [{ who: "ollieT", at: BENCH_OLLIE, mode: "sit", act: "scared", face: "sad", keepFace: true, facing: "toward:ava" }, { who: "ava", at: BENCH_AVA, mode: "sit", act: "neutral", face: "scared", keepFace: true, facing: "toward:ollieT", gesture: "crossArms" }], note: "10 a towel round him, both shaking" },
    { say: kate("Why are you two up?"), set: "ferryKitchenNight", light: COOL, hold: 0.5, ...lock(at([0.3, 1.5, 0.7], [1.7, 1.45, 1.55], 36)),
      actors: [{ who: "kate", at: "stairs", act: "neutral", face: "confused", keepFace: true, facing: "camera", beats: [{ t: 1.4, face: "shock" }] }], note: "10 Kate in the doorway, rubbing her eyes; she BLINKS: awake. Then she sees" },
    { say: ava("Mum. Who's Kuba?"), set: "ferryKitchenNight", light: COOL, hold: 0.9, ...lock(at([-0.35, 1.05, 1.4], [-0.35, 1.0, -0.4], 30)),
      actors: [{ who: "ava", at: BENCH_AVA, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera", gesture: "crossArms" }], note: "10 her voice cracking; a long silence; rain" },
    { say: kate("He was my son."), set: "ferryKitchenNight", light: COOL, hold: 0.6, ...lock(at([0.5, 1.62, 0.7], [1.7, 1.6, 1.55], 40)),
      actors: [{ who: "kate", at: "stairs", act: "sad", face: "sad", keepFace: true, facing: "camera", gesture: "crossArms" }], note: "10 barely" },
    { say: ollieT("You call me Kuba. Every night."), set: "ferryKitchenNight", light: COOL, hold: 0.6, ...lock(at([0.3, 0.95, 1.3], [0.45, 1.0, -0.4], 30)),
      actors: [{ who: "ollieT", at: BENCH_OLLIE, mode: "sit", act: "neutral", face: "neutral", facing: "camera" }], note: "10 looking up at her from inside the towel, matter-of-fact" },
    insert("kateFeet", 2.0, "10 her bare feet: wet, grass stuck to them, wet footprints behind her", { sfx: [{ t: 0.2, name: "sting_low" }] }, undefined, "ferryKitchenNight", COOL),
    insert("endCard", 2.6, "cut to black: PART 2: THE WATER GAME", { transition: "dip", sfx: [{ t: 0, name: "whoosh_low", gain: -8 }] }),
  ],
};
