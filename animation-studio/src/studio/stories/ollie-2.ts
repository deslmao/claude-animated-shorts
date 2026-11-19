// What Ollie Says at 3 A.M., Part 2: "The Water Game" (productions/what-ollie-says/episodes/ep2-water-game.md, viewer
// script v2, approved by the owner). Narrated like Part 1 and The Empty Seat: George in the second person ("you" are
// Ava) explains every strange thing as it appears; characters speak after they're set up. Follows the story lock
// (story-lock.md): all six ritual lines in order, verbatim [PL provisional], with English subtitles.
// Sound: recorded-style samples (el_* effects, elb_* beds, sound/samples/) and a score written to this film's timings.
import type { Storyboard, Line, ShotSpec, ActorSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 80 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const NIGHT = "night" as const, DAY = "interior" as const, MORNING = "day" as const;
type Light = typeof NIGHT | typeof DAY | typeof MORNING;
// [PL provisional] story-lock.md §3 (L1-L6), §10 (P7, S1)
const L1 = "Mamo, woda jest przy drzwiach.", L2 = "Kubuś, trzymaj mnie za rękę.", L3 = "Nie puszczę cię. Obiecuję.";
const L4 = "Weź go!", L5 = "Obiecałaś, że nie puścisz.", L6 = "Przepraszam.";
const S1 = "Co puścisz nad wodą, to woda zabierze.";
const TODDLER = "olToddler";
const ava = (text: string): Line => ({ text, who: "ava" });
const ollie = (text: string): Line => ({ text, who: "ollie" });
const kate = (text: string, sub?: string, voice?: string): Line => ({ text, who: "kate", ...(sub ? { sub } : {}), ...(voice ? { voice } : {}) });
const role = (text: string, sub: string): Line => ({ text, who: "ollie", voice: TODDLER, sub });   // Kuba's words, out of Ollie
const N = (text: string): Line => ({ text, who: "narrator" });
/** a voice heard off screen (Kate outside the door): the narrator's track, in that character's voice */
const O = (text: string, voice: string, sub?: string): Line => ({ text, who: "narrator", voice, ...(sub ? { sub } : {}) });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (a: ReturnType<typeof at>, b: ReturnType<typeof at>, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51);
const insert = (variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: ({ t: number } | { word: string })[], set = "ferryKitchenNight", light: Light = NIGHT): ShotSpec =>
  ({ set, light, dur, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "olInsert", at: CARD, variant, steps: steps ?? [{ t: -0.7 }] }], note, ...extra });
const DAYINS = ["ferryKitchen", DAY] as const;
const RIVER = { ambience: "elb_river_rain" as const }, IN_RIVER = { ambience: "elb_in_river" as const };
const HOUSE = { ambience: "elb_house_night" as const }, RAINWIN = { ambience: "elb_rain_window" as const };
const GARDEN = (look: V, variant = "garden") => [{ id: "ferryWater", at: look, variant, steps: STEADY }, { id: "rain", at: look, steps: STEADY }];
const PHONE = (look: V) => ({ id: "olPhoneCam", at: look, variant: "rec", steps: STEADY });
const KATE_NIGHT: Partial<ActorSpec> = { act: "neutral", face: "blank", blink: false, keepFace: true };
// the river marks: the flood starts at z 10.8; deeper water = lower feet (the water plane is at y 0.16)
const EDGE_OLLIE: V = [2.0, 0, 11.2], EDGE_KATE: V = [1.55, 0, 11.6];
const DEEP_KATE: V = [1.6, -0.75, 15.4], DEEP_AVA: V = [2.05, -0.55, 14.6];
const AVA_BED: V = [-0.3, 0.45, -0.3];
const BENCH_AVA: V = [-0.35, 0.46, -0.4], BENCH_KATE: V = [0.45, 0.46, -0.4];

export const OLLIE_2: Storyboard = {
  id: "ollie-2", title: "What Ollie Says at 3 A.M. · Part 2: The Water Game",
  cast: { ava: "ava", ollie: "ollie", kate: "kate", neighbour: "neighbour" },
  voice: "georgeHushedBrisk", voices: { ava: "olAva", ollie: "olOllie", kate: "olKate", neighbour: "olNeighbour" },
  // Kuba's words (the toddler voice) and Ollie's own voice get different colours: the who key "ollie" is left out on
  // purpose, so the caption colour falls through to the voice preset
  captionColors: { ava: "#ffd36b", kate: "#9fd3ff", olKate: "#9fd3ff", olKateNight: "#9fd3ff", olKateShout: "#9fd3ff", olOllie: "#a8e07a", olToddler: "#ff9ec7", neighbour: "#e6c9a0" },
  // the score (sound/samples/music/ollie2_score.json: ten sections written to these timings) and its volume curve:
  // near-silence at 3 a.m. and at the door, a dead stop before the back door bangs, the surge in the river
  music: { file: "ollie2_score", gain: -1, duck: -5, curve: [
    [0, 0], [4.9, -3], [9.4, -2], [27.6, -5], [41.4, -3], [54.0, -3], [55.0, -9], [60.3, -9], [61.2, -3], [71.3, -5],
    [80.5, -6], [80.9, -40], [82.4, -40], [82.9, -12], [96.0, -12], [96.8, -24], [105.9, -24], [106.5, -40], [108.3, -40],
    [108.6, -3], [127.3, 0], [129.9, 0], [130.9, -14], [134.6, -12], [148.4, -3], [150.8, 0], [159.8, 0], [162.7, -5], [176.6, -4], [177.3, -40], [179.2, -40]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "Every night at 3 a.m. your mum sleepwalks back into the flood where she lost her son Kuba, and your little brother Ollie speaks Kuba's words, the only thing that can bring her back out of the river.",
    facts: [
      { fact: "what the cold open shows, and why it's strange", said: "walking into the river, fast asleep" },
      { fact: "why shouting fails (paid off at the edge)", said: "Only one voice can reach her" },
      { fact: "who Ollie is, and what's strange about him", said: "speaking Polish in his sleep. In a baby's voice" },
      { fact: "who Kuba is (first)", said: "a little boy called Kuba" },
      { fact: "last night's flood, and that it's only theirs", said: "Only your garden" },
      { fact: "the flood leaves no trace, but there's proof", said: "The water's gone" },
      { fact: "the flood's strangeness, confirmed", said: "Next door's lawn is bone dry" },
      { fact: "the vote result", said: "Most of you said: show her the video" },
      { fact: "who Kuba really was", said: "Kuba was my son. Your brother." },
      { fact: "what happened in the flood (sets up 'Take him!')", said: "she held him out to a rescue boat" },
      { fact: "the saying", said: "something her grandmother used to say" },
      { fact: "what the nights really are", said: "she's back in that flood" },
      { fact: "why Ollie is in danger", said: "the boy she lets go of is Ollie" },
      { fact: "who Dad is, and why it's secret", said: "He doesn't even know Kuba existed" },
      { fact: "the plan (vote option two)", said: "keep Ollie away from her" },
      { fact: "the plan's weakness", said: "Your door doesn't lock" },
      { fact: "what Ollie's line means", said: "That's what Kuba said to wake her up" },
      { fact: "why the lock fails", said: "She's unlocking it in her sleep" },
      { fact: "who she wants", said: "in her sleep, Ollie is Kuba" },
      { fact: "why she goes to the river", said: "She's still looking for him, in the water" },
      { fact: "why Ava can't save her", said: "you'll both go under" },
      { fact: "why Ollie's words work (the cold-open payoff)", said: "The only voice that can reach her" },
      { fact: "that the flood is replaying", said: "the night of the flood plays out again" },
      { fact: "what 'Take him!' is", said: "This is where she held Kuba out to the boat" },
      { fact: "how Ollie survives", said: "You catch him" },
      { fact: "the twist", said: "Only Ollie's words can bring her back" },
      { fact: "the threat for Part 3", said: "the water comes a little closer to the house" },
    ],
  },
  shots: [
    // ---- COLD OPEN: 03:00 Friday, the river
    { say: N("Three in the morning. Your mum is walking into the river, fast asleep."), set: "ferryBack", light: NIGHT, hold: 0.1, ...IN_RIVER,
      ...glide(at([1.75, 1.05, 19.4], [1.6, 0.7, 15.2], 40), at([1.72, 1.0, 18.8], [1.6, 0.68, 15.4], 40), 4.5),
      actors: [{ who: "kate", at: [1.6, -0.5, 14.4], ...KATE_NIGHT, walk: { to: DEEP_KATE, t0: 0, t1: 4.5, view: "front" } }],
      props: GARDEN([1.6, 0.5, 15.0]), sfx: [{ t: 0, name: "el_wade_slow", gain: -2 }, { t: 0.2, name: "el_thunder", gain: -6 }], note: "cold open: Kate wading in, her back to us, rain" },
    { say: ava("MUM!"), set: "ferryBack", light: NIGHT, dur: 1.2, hold: 0.1, ...IN_RIVER, ...lock(at([1.7, 1.0, 17.4], [2.0, 0.75, 14.6], 38)),
      actors: [{ who: "ava", at: DEEP_AVA, act: "scared", face: "shock", keepFace: true, facing: "camera", gesture: "offer", reach: "kate" },
        { who: "kate", at: DEEP_KATE, ...KATE_NIGHT, facing: "camera" }],
      props: GARDEN([2.0, 0.5, 14.6]), kicks: [{ word: "MUM" }], sfx: [{ t: 0, name: "el_sting_strings", gain: -4 }], note: "Ava grabbing her arm, shouting; Kate's blank face in front" },
    { say: N("She can't hear you. Only one voice can reach her. And it isn't yours."), set: "ferryBack", light: NIGHT, hold: 0.5, ...IN_RIVER,
      ...glide(at([1.65, 0.85, 17.4], [1.6, 0.68, 15.4], 34), at([1.64, 0.82, 17.0], [1.6, 0.68, 15.4], 34), 4.0),
      actors: [{ who: "kate", at: DEEP_KATE, ...KATE_NIGHT, facing: "camera" }], props: GARDEN([1.6, 0.7, 15.4]),
      sfx: [{ t: 0.1, name: "el_heartbeat", gain: -4 }], note: "Kate's face, eyes open, unblinking; slow push" },
    // ---- THE RECAP
    { say: N("Last time: your little brother Ollie started speaking Polish in his sleep. In a baby's voice."),
      set: "ollieRoom", light: NIGHT, hold: 0.1, ...HOUSE, transition: "dip", ...lock(at([-0.6, 1.3, 1.45], [1.0, 0.85, -0.38], 50)),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", keepFace: true, facing: -1, idle: 0.3 }],
      props: [PHONE([1.0, 0.85, -0.38])], sfx: [{ t: 0, name: "el_whoosh_dark", gain: -2 }], note: "recap: Part 1's opening frame" },
    insert("match", 4.2, "recap: Kuba's photo and Ollie's: the same face", { say: N("Mum hides an old photo of a little boy called Kuba. He looks exactly like Ollie."), ...HOUSE }, [{ word: "exactly" }]),
    { say: N("At three this morning, she sleepwalked him into the flooded garden. Only your garden. And you filmed it."),
      set: "ferryBack", light: NIGHT, hold: 0.1, ...RIVER, ...glide(at([2.2, 5.2, 2.6], [2.6, 0, 13.5], 50), at([2.25, 5.6, 2.9], [2.7, 0, 14.5], 50), 7.0),
      actors: [{ who: "kate", at: [1.5, 0, 7.6], ...KATE_NIGHT, back: true, walk: { to: [1.55, 0, 10.4], t0: 0, t1: 6.0, view: "back" } },
        { who: "ollie", at: [2.0, 0, 7.6], act: "neutral", face: "trance", back: true, walk: { to: [2.05, 0, 10.4], t0: 0, t1: 6.0, view: "back" } }],
      props: [...GARDEN([2.6, 0, 13.5]), PHONE([2.6, 0, 13.5])], note: "recap: Part 1's garden, through the phone" },
    // ---- DAWN, Thursday
    { say: N("By morning, the water's gone."), set: "ferryBackDawn", light: MORNING, hold: 0.1, transition: "dip",
      title: { text: "THAT MORNING", sub: "THURSDAY 7:02 AM" }, ...glide(at([1.2, 1.7, 4.6], [1.6, 0.6, 15.0], 50), at([1.25, 1.65, 5.6], [1.6, 0.6, 15.0], 50), 5.0),
      actors: [{ who: "ava", at: [1.4, 0, 7.8], act: "neutral", face: "suspicious", back: true, walk: { to: [1.7, 0, 11.4], t0: 0.2, t1: 3.0, view: "back" } }],
      sfx: [{ t: 0.4, name: "el_drip_quiet", gain: -4 }], note: "the wet lawn, no water; Ava walks down to where it was" },
    insert("phoneGrass", 2.4, "her phone in the wet grass", { say: N("But your phone is still in the grass."), ambience: "elb_dawn_garden", sfx: [{ t: 1.6, name: "el_phone_grass" }] }, undefined, ...DAYINS),
    insert("phoneVideo", 4.8, "the video: the water stops dead at the fence; next door is dry", { say: N("On the video, the water stops dead at your fence. Next door's lawn is bone dry."), ambience: "elb_dawn_garden", sfx: [{ t: 0, name: "el_phone_video", gain: -2 }] }, undefined, ...DAYINS),
    // ---- THE VIDEO
    insert("vote", 3.4, "the vote: option 1, most of you", { say: N("Most of you said: show her the video. So you do."), ambience: "elb_kitchen_day", sfx: [{ t: 0.1, name: "el_whoosh_dark", gain: -4 }] }, [{ t: 99 }], ...DAYINS),
    { say: N("She watches herself lead Ollie into the water."), set: "ferryKitchen", light: DAY, hold: 0.1, ambience: "elb_kitchen_day",
      ...glide(at([0.05, 1.35, 2.6], [0.1, 0.95, -0.4], 46), at([0.05, 1.3, 2.1], [0.2, 0.95, -0.4], 46), 5.0),
      actors: [{ who: "kate", at: BENCH_KATE, mode: "sit", act: "sad", face: "sad", facing: "camera", hold: "phone", gesture: "hold" }, { who: "ava", at: BENCH_AVA, mode: "sit", act: "neutral", face: "sad", facing: "toward:kate" }],
      sfx: [{ t: 0, name: "el_phone_video", gain: -10 }], note: "Kate watches the phone at the table, Ava beside her" },
    { say: kate("Kuba was my son. Your brother. When he was three, there was a flood. I let go of him. And he drowned."), set: "ferryKitchen", light: DAY, hold: 0.2, ambience: "elb_kitchen_day",
      ...glide(at([0.5, 1.2, 1.75], [0.45, 1.1, -0.4], 34), at([0.5, 1.18, 1.5], [0.45, 1.1, -0.4], 34), 7.0),
      actors: [{ who: "kate", at: BENCH_KATE, mode: "sit", act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera" }], note: "Kate's confession, close" },
    insert("boat08", 5.0, "2008: she holds him out to a rescue boat; the boat overturned", { say: N("To save him, she held him out to a rescue boat. Then the boat went under."), ambience: "elb_river_rain",
      sfx: [{ t: 0, name: "el_whoosh_dark", gain: -2 }, { t: 3.6, name: "el_hit_sub", gain: -4 }] }, [{ word: "went" }]),
    { say: [N("Then she says something her grandmother used to say."), { ...kate(S1, "What you let go of over the water, the water takes."), gap: 0.4 }], set: "ferryKitchen", light: DAY, hold: 0.45, ambience: "elb_kitchen_day",
      ...glide(at([0.5, 1.2, 1.5], [0.45, 1.12, -0.4], 30), at([0.49, 1.18, 1.2], [0.45, 1.12, -0.4], 30), 7.0),
      actors: [{ who: "kate", at: BENCH_KATE, mode: "sit", act: "scared", face: "scared", keepFace: true, sadTalk: true, facing: "camera" }], note: "the saying, a whisper; tight" },
    insert("match", 5.2, "Kuba's photo, then Ollie's face over it", { say: N("Every night in her sleep, she's back in that flood. Only now, the boy she lets go of is Ollie."), ...HOUSE, sfx: [{ t: 3.4, name: "el_hit_boom", gain: -6 }] }, [{ word: "Ollie" }]),
    insert("calendarNights", 3.4, "DAD · NIGHTS", { say: N("Your dad works nights. He doesn't even know Kuba existed."), ambience: "elb_kitchen_day" }, undefined, ...DAYINS),
    { say: kate("Please. Don't tell your dad."), set: "ferryKitchen", light: DAY, hold: 0.5, ambience: "elb_kitchen_day", ...lock(at([0.5, 1.2, 1.6], [0.45, 1.1, -0.4], 32)),
      actors: [{ who: "kate", at: BENCH_KATE, mode: "sit", act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera", gesture: "offer" }], note: "Kate begs" },
    // ---- THE PLAN
    insert("vote", 3.4, "option two as well", { say: N("So you also try option two: keep Ollie away from her."), ambience: "elb_kitchen_day" }, [{ word: "two" }], ...DAYINS),
    insert("thumbTurn", 2.0, "Kate locks her door", { say: N("Mum locks herself in her room."), ...RAINWIN, sfx: [{ t: 0.9, name: "el_lock_click", gain: -2 }] }, [{ t: 0.95 }]),
    { say: N("Ollie sleeps in yours, with you."), set: "avaRoom", light: NIGHT, hold: 0.1, ...RAINWIN, ...lock(at([-0.6, 1.2, 1.7], [-0.65, 0.7, -0.35], 46)),
      actors: [{ who: "ollie", at: "asleep", act: "neutral", face: "trance", keepFace: true, facing: "camera" }, { who: "ava", at: AVA_BED, mode: "sit", act: "neutral", face: "suspicious", keepFace: true, facing: "toward:ollie" }],
      note: "Ollie asleep in Ava's bed; Ava sitting up beside him" },
    insert("noLock", 2.2, "Ava's door: no lock", { say: N("But your door doesn't lock."), ...RAINWIN, sfx: [{ t: 1.2, name: "el_hit_sub", gain: -8 }] }, undefined, "avaRoom"),
    // ---- 3 A.M.
    insert("clock", 1.6, "2:59 -> 3:00", { ...HOUSE, sfx: [{ t: 0, name: "el_clock_tick", gain: -2 }, { t: 1.0, name: "el_clock_flip" }] }, [{ t: 1.0 }], "avaRoom"),
    { say: [N("Three a.m. Ollie sits up, still asleep, and the baby voice comes out of him."), { ...role(L1, "Mama, the water's at the door."), gap: 0.4 }], set: "avaRoom", light: NIGHT, hold: 0.5, ...HOUSE,
      ...glide(at([-0.62, 1.12, 1.9], [-0.66, 0.88, -0.36], 50), at([-0.64, 1.08, 1.6], [-0.66, 0.9, -0.36], 50), 6.0),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", keepFace: true, sadTalk: true, facing: 1, idle: 0.3 }, { who: "ava", at: AVA_BED, mode: "sit", act: "scared", face: "shock", keepFace: true, facing: "toward:ollie" }],
      sfx: [{ t: 0.9, name: "el_sit_up" }], note: "Ollie bolt upright, eyes shut: L1 in the toddler voice" },
    { say: N("That's what Kuba said to wake her up, the night of the flood."), set: "avaRoom", light: NIGHT, hold: 0.1, ...HOUSE, ...lock(at([-0.6, 1.05, 1.75], [-0.66, 0.85, -0.36], 50)),
      actors: [{ who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "trance", keepFace: true, facing: "toward:ava" }, { who: "ava", at: AVA_BED, mode: "sit", act: "scared", face: "scared", keepFace: true, facing: "toward:ollie", gesture: "offer", reach: "ollie" }],
      note: "Ava holds him; he goes limp" },
    insert("thumbTurnOpen", 3.0, "Kate's lock turns open in her sleep", { say: N("Then Mum's lock clicks open. She's unlocking it in her sleep."), ...HOUSE, sfx: [{ t: 1.0, name: "el_lock_click" }] }, [{ word: "clicks" }]),
    insert("doorGap", 3.6, "feet stop in the light under the door", { say: [N("She stops outside your door."), { ...O("Kubuś?", "olKateNight", "Kuba?"), gap: 0.5 }], ...HOUSE, sfx: [{ t: 0, name: "el_feet_landing" }, { t: 0.2, name: "el_breath_hold", gain: -4 }] }, [{ word: "stops" }], "avaRoom"),
    { say: N("She's looking for Kuba. And in her sleep, Ollie is Kuba."), set: "avaRoom", light: NIGHT, hold: 0.1, ...HOUSE, ...lock(at([-0.25, 1.4, 1.6], [1.15, 1.1, 0.75], 44)),
      actors: [{ who: "ava", at: [1.2, 0, 0.55], act: "scared", face: "scared", keepFace: true, facing: "camera" }, { who: "ollie", at: "asleep", act: "neutral", face: "trance", keepFace: true, facing: "camera" }],
      note: "Ava at her door, Ollie asleep behind" },
    insert("handleHold", 2.6, "Ava holds the handle shut", { say: N("You hold the handle shut."), ...HOUSE, sfx: [{ t: 0, name: "el_heartbeat_fast", gain: -2 }] }, undefined, "avaRoom"),
    { say: N("Her footsteps go back downstairs."), set: "avaRoom", light: NIGHT, hold: 0.5, ...HOUSE, ...lock(at([0.1, 1.45, 1.75], [1.2, 1.25, 0.6], 40)),
      actors: [{ who: "ava", at: [1.2, 0, 0.55], act: "scared", face: "suspicious", keepFace: true, facing: 1 }], sfx: [{ t: 1.0, name: "el_stairs_down" }], note: "Ava listening at the door; the footsteps fade" },
    // ---- THE RIVER
    { set: "avaRoom", light: NIGHT, dur: 1.0, hold: 0.1, ...HOUSE, ...lock(at([0.1, 1.35, 1.8], [0.75, 1.2, -0.6], 46)),
      actors: [{ who: "ava", at: [0.7, 0, -0.2], act: "scared", face: "shock", keepFace: true, facing: "camera" }], sfx: [{ t: 0, name: "el_backdoor", gain: 2 }, { t: 0.05, name: "el_hit_boom", gain: -8 }], note: "the bang; Ava turns" },
    { say: N("From your window, you see her walk into the river. Alone. She's still looking for him, in the water."), set: "ferryBack", light: NIGHT, hold: 0.25, ...RIVER,
      ...glide(at([2.35, 3.95, 0.35], [1.6, 0.2, 13.0], 46), at([2.35, 3.95, 0.4], [1.6, 0.0, 14.2], 40), 7.0),
      actors: [{ who: "kate", at: [1.5, 0, 9.0], ...KATE_NIGHT, back: true, walk: { to: [1.6, -0.45, 13.6], t0: 0, t1: 7.0, view: "back" } }],
      props: GARDEN([1.6, 0, 13.0]), note: "from Ava's window: Kate alone, walking into the flood" },
    { say: kate("Kubuś!", "Kuba!", "olKateShout"), set: "ferryBack", light: NIGHT, dur: 1.6, hold: 0.1, ...IN_RIVER, ...lock(at([2.75, 1.1, 11.2], [1.6, 0.85, 14.0], 50)),
      actors: [{ who: "kate", at: [1.6, -0.45, 13.6], ...KATE_NIGHT, sadTalk: true, facing: -1, gesture: "offer" }], props: GARDEN([1.6, 0.5, 14.0]), note: "Kate calling her son, waist-deep" },
    { say: ava("MUM!"), set: "avaRoom", light: NIGHT, dur: 1.1, hold: 0.1, ...HOUSE, ...lock(at([0.2, 1.4, 1.2], [0.75, 1.35, -1.2], 44)),
      actors: [{ who: "ava", at: "window", act: "scared", face: "shock", keepFace: true, back: true }], kicks: [{ word: "MUM" }], note: "Ava at her window, shouting" },
    { say: [N("She can't hear you. So you leave Ollie asleep, and run."), { ...ava("Stay here!"), gap: 0.2 }], set: "avaRoom", light: NIGHT, hold: 0.1, ...HOUSE, ...lock(at([0.6, 1.3, 1.9], [-0.6, 0.7, -0.3], 50)),
      actors: [{ who: "ollie", at: "asleep", act: "neutral", face: "trance", keepFace: true, facing: "camera" },
        { who: "ava", at: [0.3, 0, 0.5], act: "determined", face: "scared", keepFace: true, walk: { to: [1.25, 0, 0.9], t0: 3.0, t1: 4.0, mode: "run" } }],
      sfx: [{ t: 3.6, name: "el_door_creak", gain: -4 }], note: "Ollie asleep; Ava runs for the door" },
    { say: N("You grab her arm. But she's stronger than you. If you don't let go, you'll both go under."), set: "ferryBack", light: NIGHT, hold: 0.4, ...IN_RIVER,
      ...glide(at([1.9, 1.0, 18.6], [1.8, 0.5, 15.2], 44), at([1.88, 0.98, 18.2], [1.8, 0.5, 15.4], 44), 6.0),
      actors: [{ who: "kate", at: [1.6, -0.65, 15.0], ...KATE_NIGHT, walk: { to: [1.55, -0.85, 16.0], t0: 0.5, t1: 5.6, view: "front" } },
        { who: "ava", at: [2.05, -0.5, 14.4], act: "determined", face: "scared", keepFace: true, facing: "toward:kate", gesture: "offer", reach: "kate", walk: { to: [2.0, -0.7, 15.4], t0: 0.5, t1: 5.6, view: "front" } }],
      props: GARDEN([1.8, 0.5, 15.2]), sfx: [{ t: 0, name: "el_wade_slow" }, { t: 2.0, name: "el_heartbeat_fast", gain: -2 }, { t: 5.0, name: "el_riser_long", gain: -4 }], note: "the struggle: dragged deeper" },
    // ---- THE EDGE
    { say: N("Then, behind you, a small voice. Ollie followed you."), set: "ferryBack", light: NIGHT, hold: 0.3, ...RIVER, ...lock(at([1.9, 1.0, 17.2], [2.0, 0.75, 11.2], 40)),
      actors: [{ who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", keepFace: true, facing: "camera" }, { who: "ava", at: [2.2, -0.7, 15.4], act: "scared", face: "shock", keepFace: true, back: true }],
      props: GARDEN([2.0, 0.5, 12.0]), sfx: [{ t: 0.2, name: "el_child_steps_wet" }], note: "from the river: Ollie at the edge, barefoot, eyes shut" },
    { say: role(L1, "Mama, the water's at the door."), set: "ferryBack", light: NIGHT, hold: 0.5, ...RIVER, ...lock(at([2.0, 0.95, 13.2], [2.0, 0.8, 11.2], 46)),
      actors: [{ who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", keepFace: true, sadTalk: true, facing: "camera", gesture: "crossArms" }], props: GARDEN([2.0, 0.6, 11.2]), note: "L1 at the edge" },
    { say: N("Kuba's words. The only voice that can reach her."), set: "ferryBack", light: NIGHT, hold: 0.1, ...IN_RIVER, ...lock(at([1.7, 0.95, 18.4], [1.55, 0.62, 16.2], 36)),
      actors: [{ who: "kate", at: [1.55, -0.85, 16.2], ...KATE_NIGHT, facing: "camera" }], props: GARDEN([1.55, 0.7, 16.0]), sfx: [{ t: 0, name: "el_hit_sub", gain: -6 }], note: "Kate stops" },
    { say: N("Mum stops, walks back, and takes Ollie's hand."), set: "ferryBack", light: NIGHT, hold: 0.25, ...RIVER, ...lock(at([2.5, 1.95, 8.4], [1.8, 0.35, 13.2], 46)),
      actors: [{ who: "kate", at: [1.55, -0.85, 16.0], ...KATE_NIGHT, walk: { to: EDGE_KATE, t0: 0.2, t1: 2.7, view: "front" } },
        { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", back: true }],
      props: GARDEN([1.8, 0.4, 13.0]), sfx: [{ t: 0.4, name: "el_wade_slow" }], note: "Kate wades back to him" },
    { say: kate(L2, "Kuba, hold my hand.", "olKateNight"), set: "ferryBack", light: NIGHT, hold: 0.45, ...RIVER, ...lock(at([0.6, 1.05, 13.7], [1.8, 0.85, 11.4], 38)),
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, sadTalk: true, facing: "toward:ollie", gesture: "offer", reach: "ollie" },
        { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" }], props: GARDEN([1.8, 0.6, 11.4]), note: "L2: hand in hand" },
    { say: N("And the night of the flood plays out again."), set: "ferryBack", light: NIGHT, hold: 0.25, ...RIVER,
      ...glide(at([3.4, 2.4, 15.8], [1.8, 0.5, 11.4], 44), at([3.3, 2.2, 15.2], [1.8, 0.5, 11.4], 44), 5.5),
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, sadTalk: true, facing: "toward:ollie", gesture: "offer", reach: "ollie" }, { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" },
        { who: "ava", at: [2.4, -0.5, 14.4], act: "scared", face: "shock", keepFace: true, facing: "toward:ollie" }],
      props: GARDEN([1.8, 0.4, 12.4]), sfx: [{ t: 0.2, name: "el_thunder", gain: -4 }], note: "wide: the three of them, the rain" },
    { say: kate(L3, "I won't let go of you. I promise.", "olKateNight"), set: "ferryBack", light: NIGHT, hold: 0.45, ...RIVER, ...lock(at([2.9, 1.05, 13.9], [1.75, 0.85, 11.4], 38)),
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, sadTalk: true, facing: "toward:ollie", gesture: "offer", reach: "ollie" }, { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" }],
      props: GARDEN([1.7, 0.6, 11.4]), note: "L3, a whisper" },
    insert("boat08", 2.4, "2008 again, a flash", { say: N("This is where she held Kuba out to the boat."), ambience: "elb_river_rain", sfx: [{ t: 0, name: "el_riser_short", gain: -2 }] }, [{ t: 99 }]),
    { say: { ...kate(L4, "Take him!", "olKateShout"), context: { before: "Tomasz! Tomasz, tutaj! Szybko!" } }, set: "ferryBack", light: NIGHT, dur: 1.6, hold: 0.1, ...RIVER,
      ...glide(at([1.85, 1.15, 15.0], [1.75, 1.0, 11.3], 44), at([1.82, 1.1, 14.2], [1.75, 1.0, 11.3], 44), 1.3),
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, sadTalk: true, facing: "toward:ollie", gesture: "offer", reach: "ollie" }, { who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", facing: "toward:kate", gesture: "offer", reach: "kate" }],
      props: GARDEN([1.8, 0.5, 11.4]), kicks: [{ word: "Weź" }], sfx: [{ t: 0.05, name: "el_hit_boom", gain: -2 }], note: "L4: she lifts his arm over the water" },
    { say: role(L5, "You promised you wouldn't let go."), set: "ferryBack", light: NIGHT, hold: 0.4, ...RIVER, ...lock(at([0.95, 0.9, 13.5], [2.0, 0.85, 11.4], 38)),
      actors: [{ who: "ollie", at: EDGE_OLLIE, act: "neutral", face: "trance", keepFace: true, sadTalk: true, facing: -1, gesture: "crossArms" }], props: GARDEN([2.0, 0.5, 11.4]), note: "L5, the toddler voice" },
    { say: kate(L6, "I'm sorry.", "olKateNight"), set: "ferryBack", light: NIGHT, dur: 1.4, hold: 0.1, ...RIVER, ...lock(at([2.6, 1.4, 13.1], [1.55, 1.35, 11.6], 42)),
      actors: [{ who: "kate", at: EDGE_KATE, ...KATE_NIGHT, sadTalk: true, facing: 1, gesture: "crossArms" }], props: GARDEN([1.55, 1.0, 11.6]), note: "L6" },
    insert("letGo", 2.8, "her fingers open; his hand slips toward the water", { say: N("Her hand opens, and the river pulls Ollie in."), ambience: "elb_in_river", sfx: [{ t: 0.4, name: "el_sting_strings", gain: -4 }, { t: 0.9, name: "el_pulled_under" }, { t: 1.0, name: "el_water_rush" }] }, [{ word: "opens" }]),
    { say: N("But you're already in the water. You catch him."), set: "ferryBack", light: NIGHT, hold: 0.1, ...IN_RIVER, ...lock(at([0.8, 1.1, 14.4], [2.1, 0.7, 12.6], 40)),
      actors: [{ who: "ava", at: [2.2, -0.3, 12.4], act: "determined", face: "scared", keepFace: true, facing: "toward:ollie", gesture: "offer", reach: "ollie", moves: [{ t: 1.4, kind: "recoil", dur: 0.4 }] },
        { who: "ollie", at: [2.1, -0.35, 13.0], act: "scared", face: "scared", facing: "toward:ava", gesture: "offer", reach: "ava" }],
      props: GARDEN([2.1, 0.5, 12.6]), sfx: [{ t: 1.4, name: "el_gasp_out" }], note: "Ava catches him: the heave" },
    { say: N("And Mum turns and walks back to bed, still asleep."), set: "ferryBack", light: NIGHT, hold: 0.2, ...RIVER, ...lock(at([3.1, 1.8, 13.8], [1.3, 0.9, 8.0], 44)),
      actors: [{ who: "kate", at: [1.3, 0, 10.6], ...KATE_NIGHT, back: true, walk: { to: [1.0, 0, 6.4], t0: 0, t1: 4.0, view: "back" } },
        { who: "ava", at: [2.2, -0.3, 12.4], mode: "sit", act: "scared", face: "shock", keepFace: true, facing: "toward:kate" }],
      props: GARDEN([1.7, 0.5, 10.5]), note: "Kate walks away up the lawn, past them" },
    // ---- THE ENDING
    { say: ollie("It's the water game. If I don't say my words, Mama goes in the water by herself."), set: "ferryBack", light: NIGHT, hold: 0.2, ...RIVER, ...lock(at([1.45, 0.78, 8.9], [1.55, 0.72, 10.2], 32)),
      actors: [{ who: "ollie", at: [1.55, 0, 10.2], mode: "sit", act: "neutral", face: "neutral", facing: "camera" }], note: "Ollie, awake, matter-of-fact" },
    { say: N("Keeping them apart sent her into the river alone. Only Ollie's words can bring her back. And every night, the water comes a little closer to the house."), set: "ferryBack", light: NIGHT, hold: 0.4, ...RIVER,
      ...glide(at([2.4, 4.4, 15.5], [-0.6, 2.4, 2.0], 45), at([2.6, 4.9, 17.5], [-0.6, 2.2, 2.0], 45), 8.0),
      actors: [{ who: "ava", at: [2.0, 0, 10.0], mode: "sit", act: "sad", keepFace: true, facing: "toward:ollie" }, { who: "ollie", at: [1.55, 0, 10.2], mode: "sit", act: "neutral", facing: "toward:ava" }],
      props: GARDEN([0, 0, 8.0]), sfx: [{ t: 4.0, name: "el_riser_long", gain: -6 }], note: "the house, the water high on the lawn; pull back" },
    insert("endCard2", 1.9, "end card: Part 3, the vote", { ...RIVER, transition: "dip", sfx: [{ t: 0, name: "el_hit_boom", gain: -6 }] }),
  ],
};
