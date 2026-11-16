// What Ollie Says at 3 A.M., Part 1: "3:00", the NARRATED cut (productions/what-ollie-says/episodes/ep1-3am.md): a
// second-person narrator ("Imagine...") explains every clue as it appears and ends on an A/B choice; the shots reuse the
// approved staging. Voices: library voices (Creator plan), cast in
// productions/what-ollie-says/auditions/audition-notes.md: Mini (the toddler role), Leo (Ollie), Kasia (Kate), Alice, Daniel.
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
const TODDLER = "olToddler";   // the toddler voice (the role): Mini
const ava = (text: string): Line => ({ text, who: "ava" });
const ollie = (text: string): Line => ({ text, who: "ollie" });
const ollieT = (text: string): Line => ({ text, who: "ollieT" });
const kate = (text: string, sub?: string, voice?: string): Line => ({ text, who: "kate", ...(sub ? { sub } : {}), ...(voice ? { voice } : {}) });
const role = (text: string, sub: string): Line => ({ text, who: "ollie", voice: TODDLER, sub });   // Kuba's words, out of Ollie
/** the narrator: second person, to the viewer as Ava */
const N = (text: string): Line => ({ text, who: "narrator" });
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
const BENCH_AVA: V = [-0.35, 0.46, -0.4], BENCH_OLLIE: V = [0.45, 0.46, -0.4];   // the kitchen bench, facing the camera
const OLLIE_FLOOR_AVA: V = [0.5, 0.02, 0.4];               // Ava on Ollie's floor, her back to his bed
// scene 9's marks: the water starts at z 10.8 (0.16 m deep)
const EDGE_KATE: V = [1.5, 0, 11.0], EDGE_OLLIE: V = [2.0, 0, 11.7], DEEP_OLLIE: V = [2.1, -0.32, 12.8];

export const OLLIE_1: Storyboard = {
  id: "ollie-1", title: "What Ollie Says at 3 A.M. · Part 1: 3:00",
  cast: { ava: "ava", ollie: "ollie", ollieT: "ollieTowel", kate: "kate", mark: "mark" },
  voice: "georgeHushed", voices: { ava: "olAva", ollie: "olOllie", ollieT: "olOllie", kate: "olKate", mark: "olMark" },   // narrator George; cast in audition-notes.md
  music: { mood: "hush", gain: -6 }, engine: 3, autoSfx: false,
  shots: [
    // ---- the hook: 03:00, through Ava's phone
    { say: [N("Imagine your little brother sits up at three in the morning and starts talking in his sleep."), { ...role(L1, "Mama, the water's at the door."), gap: 0.35 }], set: "ollieRoom", light: NIGHT, hold: 0.55, ...lock(at([-0.6, 1.3, 1.45], [1.0, 0.85, -0.38], 50)),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", keepFace: true, facing: -1, idle: 0.3 }],
      props: [PHONE([1.0, 0.85, -0.38], "rec")], sfx: [{ t: 0, name: "camera_shutter", gain: -10 }], note: "hook: Ollie bolt upright, eyes shut; the narrator, then the toddler voice" },
    { say: N("That's Polish. He's six. He's never heard a word of it. And that isn't his voice."), set: "ollieRoom", light: NIGHT, hold: 0.3, camera: at([0.45, 1.05, 1.0], [1.0, 1.02, -0.38], 50),
      cams: [{ t: 0, ...at([0.45, 1.05, 1.0], [1.0, 1.02, -0.38], 50), blockOk: true }, { t: 0.2, ...at([0.62, 1.04, 0.62], [1.0, 1.02, -0.38], 50), glide: 3.0, blockOk: true }],
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", facing: "camera", idle: 0.2 }],
      props: [PHONE([1.0, 1.02, -0.38], "rec")], note: "push in: eyes still shut, he turns his face to the lens" },
    // ---- breakfast: Mum, the scar
    { say: N("At breakfast, you play it to your mum. She's Polish."), set: "ferryKitchen", light: DAY, hold: 0.1, ...lock(at([-0.1, 1.55, 4.3], [-0.1, 1.15, -0.8], 56)), ...STORM,
      actors: [{ who: "kate", at: "counter", act: "neutral", back: true },
        { who: "ava", at: BENCH_AVA, mode: "sit", act: "suspicious", facing: "toward:kate" },
        { who: "ollie", at: BENCH_OLLIE, mode: "sit", act: "happy", face: "grin", facing: "camera" }], note: "the kitchen, rain" },
    insert("trans", 1.3, "the translator: DETECTED: POLISH", { sfx: [{ t: 0.1, name: "blip_up", gain: -8 }] }, [{ t: 99 }], "ferryKitchen", DAY),
    { say: [N("She goes white."), kate("Where did he hear that?")], set: "ferryKitchen", light: DAY, hold: 0.2, ...lock(at([0.2, 1.45, 1.5], [-1.0, 1.4, -0.95], 34)),
      actors: [{ who: "kate", at: "counter", act: "neutral", face: "sad", keepFace: true, facing: "camera" }], note: "Kate's face drains" },
    insert("palm", 3.2, "the scar across her palm", { say: N("And there's a scar across her palm. She's never told anyone how she got it.") }, undefined, "ferryKitchen", DAY),
    // ---- the photo
    { say: N("That night, you catch her crying over an old photo."), set: "ferryBack", light: NIGHT, hold: 0.1, ...lock(at([0.3, 4.25, -0.6], [-1.3, 4.0, -1.9], 50)),
      actors: [{ who: "kate", at: KATE_BED, mode: "sit", act: "sad", face: "sad", facing: "camera", gesture: "coverMouth" }], note: "Kate on the edge of her bed, crying" },
    insert("towelPhoto", 3.0, "drying it with a tea towel", { say: N("She's drying it with a tea towel. Then she hides it under her bed.") }),
    insert("tinLid", 1.6, "under the bed: the tin", { say: N("So when she's gone, you look."), sfx: [{ t: 0.2, name: "swish_soft", gain: -8 }] }),
    insert("tinOpen", 2.8, "the WET photo in the dry tin; the drop", { say: N("The photo is soaking wet. The tin it's in is bone dry."), sfx: [{ t: 1.6, name: "drip", gain: -4 }] }, [{ t: 0.9 }]),
    insert("photoBack", 3.0, "the back: Kubuś · 2008", { say: N("On the back: Kubuś. Two thousand and eight. Three years before you were born.") }),
    insert("match", 3.2, "beside Ollie's school photo; laid over it: the same face", { say: N("And the boy in it looks exactly like your brother."), sfx: [{ t: 1.0, name: "sting_low", gain: -8 }] }, [{ t: 0.3 }]),
    // ---- 2:58: Mama
    { say: [N("So you sleep on your brother's floor. At two fifty-eight, he mumbles in his sleep."), ollie("Not tonight, Mama. I'm tired.")], set: "ollieRoom", light: NIGHT, hold: 0.2, ...lock(at([-0.9, 0.95, 0.7], [0.95, 0.55, -0.25], 44)),
      actors: [{ who: "ollie", at: "asleep", act: "neutral", face: "trance", keepFace: true, facing: "camera" },
        { who: "ava", at: OLLIE_FLOOR_AVA, mode: "sit", act: "neutral", keepFace: true, facing: "toward:ollie", gesture: "offer", reach: "ollie" }], note: "Ava on his floor; his own voice, eyes shut" },
    { say: N("He has never called anyone Mama."), set: "ollieRoom", light: NIGHT, hold: 0.2, ...lock(at([0.0, 0.85, 1.6], [0.5, 0.75, 0.4], 36)),
      actors: [{ who: "ava", at: OLLIE_FLOOR_AVA, mode: "sit", act: "neutral", face: "shock", keepFace: true, facing: "camera" }], note: "Ava goes still" },
    insert("phoneClock", 1.4, "02:59 -> 03:00", { sfx: [{ t: 1.0, name: "clock_tick", gain: -4 }] }, [{ t: 0.3 }], "ollieRoom"),
    // ---- 03:00: the ritual
    { say: N("Three a.m. Your mum walks in. Eyes wide open. She doesn't blink."), set: "ollieRoom", light: NIGHT, hold: 0.2, ...lock(at([1.1, 1.05, 1.5], [-1.3, 1.3, 0.85], 44)), sfx: [{ t: 0, name: "creak", gain: -4 }],
      actors: [{ who: "kate", at: [-1.3, 0, 0.85], ...KATE_NIGHT, facing: "camera" }, { who: "ava", at: OLLIE_FLOOR_AVA, mode: "sit", act: "scared", face: "shock", keepFace: true, facing: "toward:kate" }], note: "the door: Kate asleep, eyes open" },
    { say: [kate(L2, "Kuba, hold my hand.", "olKateNight"), { ...N("Kuba. The boy in the photo."), gap: 0.45 }], set: "ollieRoom", light: NIGHT, hold: 0.2, ...lock(at([-0.35, 1.15, 1.15], [0.88, 1.05, -0.75], 36)),
      actors: [{ who: "kate", at: "kneel", ...KATE_NIGHT, facing: "toward:ollie", gesture: "offer", reach: "ollie" },
        { who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" }], note: "she kneels, takes his hand: L2" },
    { say: N("She walks him downstairs, and out into the rain."), set: "ferryKitchenNight", light: NIGHT, dur: 2.4, hold: 0.1, ...lock(at([-0.3, 1.45, 2.4], [1.4, 1.0, -0.2], 48)),
      actors: [{ who: "kate", at: [1.7, 0, 1.5], ...KATE_NIGHT, walk: { to: [1.4, 0, -1.15], t0: 0.1, t1: 2.3, view: "back" } },
        { who: "ollie", at: [1.3, 0, 1.6], act: "neutral", face: "trance", walk: { to: [1.0, 0, -1.05], t0: 0.1, t1: 2.3, view: "back" } }],
      sfx: [{ t: 0.4, name: "step_floor", gain: -8 }, { t: 1.2, name: "step_floor", gain: -8 }, { t: 2.1, name: "latch_click", gain: -4 }], note: "the kitchen, the back door" },
    { say: N("The garden is flooded. Only yours. Next door's lawn is completely dry."), set: "ferryBack", light: NIGHT, dur: 4.2, hold: 0.3, camera: at([2.2, 5.2, 2.6], [2.6, 0, 13.5], 50),
      cams: [{ t: 0, ...at([2.2, 5.2, 2.6], [2.6, 0, 13.5], 50), blockOk: true }, { t: 0.1, ...at([2.25, 5.6, 2.9], [2.7, 0, 14.5], 50), glide: 4.0, blockOk: true }], ...STORM,
      actors: [{ who: "kate", at: [1.5, 0, 7.6], ...KATE_NIGHT, walk: { to: [1.55, 0, 10.4], t0: 0, t1: 4.0, view: "back" } },
        { who: "ollie", at: [2.0, 0, 7.6], act: "neutral", face: "trance", walk: { to: [2.05, 0, 10.4], t0: 0, t1: 4.0, view: "back" } }],
      props: GARDEN([2.6, 0, 13.5]), sfx: [{ t: 0.1, name: "storm_wind", gain: -8 }], note: "THE REVEAL: water over our lawn only" },
    { say: kate(L3, "I won't let go of you. I promise.", "olKateNight"), set: "ferryBack", light: NIGHT, dur: 2.6, hold: 0.3, camera: at([1.8, 1.2, 13.6], [1.75, 1.1, 9.0], 42),
      cams: [{ t: 0, ...at([1.8, 1.2, 13.6], [1.75, 1.1, 9.0], 42), blockOk: true }, { t: 0.1, ...at([1.8, 1.15, 13.1], [1.75, 1.05, 9.6], 42), glide: 2.4, blockOk: true }], ...STORM,
      actors: [{ who: "kate", at: [1.5, 0, 8.4], ...KATE_NIGHT, facing: "toward:ollie", walk: { to: [1.55, 0, 10.4], t0: 0, t1: 2.5, view: "front" } },
        { who: "ollie", at: [2.0, 0, 8.4], act: "neutral", face: "trance", walk: { to: [2.05, 0, 10.4], t0: 0, t1: 2.5, view: "front" } }],
      props: GARDEN([1.7, 0.5, 9.5]), note: "toward the water: L3" },
    { say: { ...kate(L4, "Take him!", "olKateShout"), context: { before: "Tomasz! Tomasz, tutaj! Szybko!" } }, set: "ferryBack", light: NIGHT, dur: 1.6, hold: 0.2, camera: at([1.85, 1.15, 15.0], [1.75, 1.0, 11.3], 44),
      cams: [{ t: 0, ...at([1.85, 1.15, 15.0], [1.75, 1.0, 11.3], 44), blockOk: true }, { t: 0.1, ...at([1.82, 1.1, 14.2], [1.75, 1.0, 11.3], 44), glide: 1.3, blockOk: true }], ...STORM,
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, facing: "toward:ollie", gesture: "offer", reach: "ollie" },
        { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" }],
      props: GARDEN([1.8, 0.5, 11.4]), kicks: [{ word: "Weź" }], sfx: [{ t: 0.05, name: "sting_low", gain: -4 }], note: "she lifts his arm over the water: L4" },
    { say: role(L5, "You promised you wouldn't let go."), set: "ferryBack", light: NIGHT, hold: 0.4, ...lock(at([0.95, 0.9, 13.5], [2.0, 0.85, 11.7], 38)), ...STORM,
      actors: [{ who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", keepFace: true, facing: -1, gesture: "crossArms" }],
      props: GARDEN([2.0, 0.5, 11.7]), note: "the toddler voice: L5" },
    { say: kate(L6, "I'm sorry.", "olKateNight"), set: "ferryBack", light: NIGHT, dur: 1.3, hold: 0.1, ...lock(at([2.55, 1.45, 12.4], [1.5, 1.5, 11.0], 32)), ...STORM,
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, facing: 1 }],
      props: GARDEN([1.5, 1.0, 11.0]), note: "L6" },
    insert("flash08", 1.6, "her hand opens", { ...STORM, say: N("She lets go of his hand."), sfx: [{ t: 0.1, name: "splash", gain: -12 }] }),
    { say: [N("And walks back to bed."), ava("MUM!")], set: "ferryBack", light: NIGHT, dur: 2.8, hold: 0.4, ...lock(at([3.1, 1.8, 4.8], [1.5, 0.9, 10.0], 44)), ...STORM,
      actors: [{ who: "kate", at: [1.25, 0, 10.6], ...KATE_NIGHT, walk: { to: [1.0, 0, 6.9], t0: 0, t1: 2.6, view: "front" } },
        { who: "ava", at: [2.7, 0, 6.8], act: "neutral", face: "shock", keepFace: true, facing: "toward:kate", gesture: "crossArms" },
        { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "camera" }], props: GARDEN([1.7, 0.5, 10.5]), note: "Kate walks past her daughter; Ollie alone in the water" },
    insert("pull", 2.0, "the water pulls", { ...STORM, say: N("Then the water starts pulling him in."), sfx: [{ t: 0.1, name: "water_pour", gain: -10 }] }),
    { say: ollie("AVA!"), set: "ferryBack", light: NIGHT, dur: 1.1, hold: 0.1, ...lock(at([2.2, 0.9, 10.3], [2.1, 0.5, 12.8], 40)), ...STORM,
      actors: [{ who: "ollie", at: DEEP_OLLIE, act: "scared", face: "scared", facing: "camera" }],
      props: GARDEN([2.1, 0.5, 12.8]), kicks: [{ word: "AVA" }], sfx: [{ t: 0, name: "splash", gain: -6 }], note: "dragged to his knees, awake" },
    { set: "ferryBack", light: NIGHT, dur: 1.4, ...lock(at([2.7, 0.14, 9.0], [2.15, 0.7, 12.6], 50)), ...STORM,
      actors: [{ who: "ava", at: [2.9, 0, 9.4], act: "determined", mode: "run", walk: { to: [2.2, 0, 12.1], t0: 0.05, t1: 1.1, mode: "run", view: "back" } },
        { who: "ollie", at: DEEP_OLLIE, act: "scared", face: "scared", facing: "camera" }],
      props: GARDEN([2.15, 0.5, 12.6]), sfx: [{ t: 0, name: "thud", gain: -8 }, { t: 1.0, name: "splash" }], note: "the phone drops; Ava sprints in" },
    { set: "ferryBack", light: NIGHT, dur: 0.9, ...lock(at([0.8, 1.1, 13.7], [2.1, 0.8, 12.4], 38)), ...STORM,
      actors: [{ who: "ava", at: [2.15, 0, 12.0], act: "determined", facing: "toward:ollie", gesture: "offer", reach: "ollie", moves: [{ t: 0.4, kind: "recoil", dur: 0.4 }] },
        { who: "ollie", at: DEEP_OLLIE, act: "scared", face: "scared", facing: "toward:ava", gesture: "offer", reach: "ava" }],
      props: GARDEN([2.1, 0.5, 12.4]), sfx: [{ t: 0.2, name: "splash", gain: -4 }], note: "the heave" },
    { say: N("You drag him out. Just."), set: "ferryBack", light: NIGHT, hold: 0.4, ...lock(at([1.0, 1.4, 7.6], [2.2, 0.4, 10.1], 44)), ...STORM,
      actors: [{ who: "ava", at: [2.0, 0, 10.0], mode: "sit", act: "scared", face: "shock", keepFace: true, facing: "toward:ollie", gesture: "offer", reach: "ollie" }, { who: "ollie", at: [1.55, 0, 10.2], mode: "sit", act: "scared", face: "scared", facing: "toward:ava" }],
      props: GARDEN([2.6, 0, 11.0], true), sfx: [{ t: 0, name: "thud" }, { t: 0.15, name: "whoosh_low", gain: -4 }], note: "on the grass; the water lets go" },
    // ---- the kitchen: the reveal
    { say: N("Back inside, Mum comes downstairs. She doesn't remember a thing."), set: "ferryKitchenNight", light: COOL, hold: 0.1, ...lock(at([0.3, 1.5, 0.7], [1.7, 1.45, 1.55], 36)),
      actors: [{ who: "kate", at: "stairs", act: "neutral", face: "confused", keepFace: true, facing: "camera" }], note: "Kate awake, blinking, confused" },
    { say: ava("Mum. Who's Kuba?"), set: "ferryKitchenNight", light: COOL, hold: 0.5, ...lock(at([-0.35, 1.05, 1.4], [-0.35, 1.0, -0.4], 30)),
      actors: [{ who: "ava", at: BENCH_AVA, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera", gesture: "crossArms" }], note: "Ava" },
    { say: kate("He was my son."), set: "ferryKitchenNight", light: COOL, hold: 0.5, ...lock(at([0.5, 1.62, 0.7], [1.7, 1.6, 1.55], 40)),
      actors: [{ who: "kate", at: "stairs", act: "sad", face: "sad", keepFace: true, facing: "camera", gesture: "crossArms" }], note: "Kate, barely" },
    { say: ollieT("You call me Kuba. Every night."), set: "ferryKitchenNight", light: COOL, hold: 0.4, ...lock(at([0.3, 0.95, 1.3], [0.45, 1.0, -0.4], 30)),
      actors: [{ who: "ollieT", at: BENCH_OLLIE, mode: "sit", act: "neutral", face: "neutral", facing: "camera" }], note: "Ollie, in a towel, matter-of-fact" },
    insert("kateFeet", 2.4, "her wet feet", { say: N("She looks down. Her feet are soaking wet."), sfx: [{ t: 0.2, name: "sting_low" }] }, undefined, "ferryKitchenNight", COOL),
    insert("choice", 6.0, "the choice", { say: N("And at three a.m. tonight, it happens again. Do you show her the video? Or keep your brother away from her?"), transition: "dip", sfx: [{ t: 0, name: "whoosh_low", gain: -8 }] }),
  ],
};
