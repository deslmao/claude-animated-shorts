// 4,012 Steps (productions/4012-steps/script.md): a narrated standalone ghost story. Second person, George
// (georgeHushed), no dialogue. Scary first (music: mystery -> hush -> tense -> a low drone -> silence at the reveal;
// the claws, the breath and the bed carry the fear in sound), then emotional from "Biscuit was your dog" (tender: slow
// piano and strings). Biscuit's body is never shown alive in the room: only in the photo; his ghost is the glowing paw
// prints. The film ends on the phone screen it opens on (the loop).
import type { Storyboard, Line, ShotSpec, ActorSpec, When } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (c0: ReturnType<typeof at>, c1: ReturnType<typeof at>, t = 0.1, dur = 3.0) => ({ camera: c0, cams: [{ t: 0, ...c0, blockOk: true }, { t, ...c1, glide: dur, blockOk: true }] });
const N = (text: string, pauses?: { after: string; s: number }[]): Line => ({ text, ...(pauses ? { pauses } : {}) });
const DAY = { set: "stepsRoom", light: "interior" as const };
const NIGHT = { set: "stepsRoomNight", light: "night" as const };
const LAMP = { set: "stepsRoomLamp", light: "interior" as const };
// a close insert: the 9:16 card in front of the room's open side, the camera 1 m in front of it
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51);
const insert = (variant: string, note: string, extra: Partial<ShotSpec> = {}, steps: When[] = [], room: { set: string; light: "interior" | "night" } = DAY): ShotSpec =>
  ({ ...room, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "stInsert", at: CARD, variant, steps }], note, ...extra });
// "you": sitting up in bed (the bed's head is at the left wall; they face the camera)
const IN_BED: V = [-1.18, 0.26, -0.38];
const you = (act: ActorSpec["act"], extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "you", at: IN_BED, mode: "sit", act, facing: "camera", idle: 0.25, ...extra });
// cameras
const BED_MED = at([-0.4, 1.05, 2.2], [-1.15, 0.8, -0.38], 45);           // you in bed, medium
const BED_CLOSE = at([-0.75, 0.98, 1.35], [-1.15, 0.85, -0.38], 40);        // you in bed, close
const HIGH = at([0.75, 1.95, 1.65], [-0.75, 0.25, -0.5], 58);               // over the foot of the bed: the floor all round it (~37 deg down)
const STEADY = (n: number, dt: number, t0 = 0) => Array.from({ length: n }, (_, i) => ({ t: t0 + i * dt }));

const shots: ShotSpec[] = [
  // ======== 1: the hook (the same screen ends the film)
  insert("steps", "1 the phone: 4,012 steps last night", { say: N("Imagine your phone says you walked four thousand and twelve steps last night. You never got out of bed."), until: { word: "night." }, mood: "mystery",
    sfx: [{ t: 0.0, name: "phone_buzz", gain: -2 }] }),
  { cont: true, ...DAY, ...glide(BED_MED, BED_CLOSE, 0.05, 2.0), actors: [you("confused", { hold: "phone", gesture: "read" })], note: "1 you never got out of bed" },
  // ======== 2: the map: round and round the bed
  insert("map", "2 the route: round the bed", { say: N("You open the map. The steps never left your room. They go round and round your bed. All night."), until: { word: "room." }, sfx: [{ t: 0.05, name: "phone_tap", gain: -6 }] }),
  { cont: true, ...DAY, ...glide(at([0.75, 0.32, 0.85], [-0.6, 0.25, -0.2], 50), at([0.75, 0.32, -0.95], [-0.7, 0.25, -0.6], 50), 0.05, 3.2),
    actors: [], note: "2 low round the foot of the bed: the empty floor" },
  // ======== 3: the glitch test: the phone across the room
  { say: N("It has to be a glitch. So that night, you leave your phone charging across the room, where it can't move."), until: { word: "charging" }, ...NIGHT,
    ...glide(at([0.55, 1.35, 0.9], [1.15, 1.0, -0.9], 46), at([0.6, 1.3, 0.6], [1.1, 0.95, -0.95], 42), 0.1, 2.5),
    actors: [{ who: "you", at: "desk", act: "suspicious", facing: "camera", hold: "phone", gesture: "read", idle: 0.2 }], transition: "dip", note: "3 the phone to the desk" },
  { cont: true, ...NIGHT, ...glide(at([-0.7, 1.2, 1.25], [1.05, 0.8, -1.15], 46), at([0.6, 1.0, -0.5], [1.04, 0.76, -1.15], 36), 0.1, 3.0), actors: [], note: "3 the phone across the room, glowing on the desk" },
  // ======== 4 + 5: the same number; every night since June
  insert("steps", "4 the morning: 4,012 again", { say: N("In the morning, it says four thousand and twelve. Again. Exactly the same.", [{ after: "twelve.", s: 0.25 }]), transition: "dip", sfx: [{ word: "Again.", name: "sting_low", gain: -6 }] }),
  insert("history", "5 every night since June", { say: N("You scroll back. Every night since June: four thousand and twelve."), sfx: [{ t: 0.05, name: "phone_tap", gain: -6 }, { word: "June:", name: "heartbeat", gain: -4 }] }),
  // ======== 6 + 7: you stay awake; the counter moves
  { say: N("So the next night, you stay awake, and you watch the counter."), ...NIGHT, mood: "hush", transition: "dip",
    ...glide(BED_MED, at([-0.7, 1.0, 1.5], [-1.15, 0.84, -0.38], 42), 0.1, 3.0), actors: [you("nervous", { hold: "phone", gesture: "read" })], note: "6 awake, watching" },
  insert("counter", "7 01:14: 0, 1, 2, 3", { say: N("At one fourteen, it moves. One. Two. Three. And you haven't moved at all.", [{ after: "moves.", s: 0.35 }]), until: { word: "Three." },
    sfx: [{ word: "One.", name: "clock_tick", gain: 4 }, { word: "Two.", name: "clock_tick", gain: 4 }, { word: "Three.", name: "clock_tick", gain: 4 }] }, [{ word: "One." }, { word: "Two." }, { word: "Three." }], NIGHT),
  { cont: true, ...NIGHT, ...lock(BED_CLOSE), actors: [you("scared", { hold: "phone", blink: false })], sfx: [{ t: 0.1, name: "heartbeat" }, { t: 0.95, name: "heartbeat", gain: -2 }], note: "7 you haven't moved" },
  // ======== 8: tick, tick, tick: something walking round the bed
  { say: N("Then you hear it. Tick, tick, tick, on the floorboards. Something small is walking round your bed.", [{ after: "it.", s: 0.6 }]), until: { word: "floorboards." }, ...NIGHT, mood: "tense",
    ...glide(at([0.85, 0.2, 0.75], [-0.5, 0.14, 0.05], 50), at([0.85, 0.2, -0.75], [-0.5, 0.14, -1.0], 50), 0.1, 4.0),
    actors: [], sfx: [{ t: 0.85, name: "claw_ticks", gain: 2 }, { t: 2.3, name: "claw_ticks", gain: 3 }, { t: 3.6, name: "claw_ticks", gain: 3 }], note: "8 low across the floorboards: nothing there" },
  { cont: true, ...NIGHT, ...glide(HIGH, at([0.7, 1.85, 1.45], [-0.75, 0.25, -0.5], 56), 0.1, 2.6),
    actors: [you("scared", { hold: "phone", blink: false })], sfx: [{ t: 0.2, name: "claw_ticks", gain: 2 }, { t: 1.4, name: "tag_jingle", gain: -6 }, { t: 1.6, name: "claw_ticks", gain: 1 }], note: "8 you in bed, the empty floor all round it" },
  // ======== 9 + 10: the breath; the bed sinks
  insert("hand", "9 the breath on your hand", { say: N("Something warm breathes on your hand."), mood: "rest", sfx: [{ word: "breathes", name: "dog_breath", gain: 4 }] }, [{ word: "breathes" }], NIGHT),
  insert("duvet", "10 the end of the bed sinks", { say: N("Then the end of the bed sinks, like something just lay down on your feet."), until: { word: "sinks," }, sfx: [{ word: "sinks,", name: "creak", gain: -2 }, { word: "sinks,", name: "dog_sigh", gain: 2 }] }, [{ word: "sinks," }], NIGHT),
  { cont: true, ...NIGHT, ...lock(at([-0.85, 0.95, 1.0], [-1.15, 0.88, -0.38], 34)), actors: [you("shock", { hold: "phone", blink: false })], sfx: [{ t: 0.2, name: "heartbeat", gain: 2 }], note: "10 you, frozen" },
  // ======== 11: the counter stops
  insert("counterEnd", "11 the counter stops: 4,012", { say: N("And the counter stops. Four thousand and twelve.", [{ after: "stops.", s: 0.3 }]), mood: "silence", sfx: [{ word: "twelve.", name: "clock_tick", gain: 4 }] }, [{ word: "twelve." }], NIGHT),
  // ======== 12: the reveal: Biscuit's collar
  insert("device", "12 the step sources: Biscuit's collar", { say: N("You open the app. It isn't counting your phone. It's counting Biscuit's collar. You never disconnected it."),
    sfx: [{ t: 0.05, name: "phone_tap", gain: -6 }, { word: "Biscuit's", name: "tag_jingle", gain: 2 }] }, [{ word: "Biscuit's" }], NIGHT),
  // ======== 13: who Biscuit was; the collar in the drawer
  insert("photo", "13 Biscuit, 2015", { say: N("Biscuit was your dog. He died in June. His collar has been in your drawer ever since. It hasn't moved. But it's still counting.", [{ after: "dog.", s: 0.3 }, { after: "June.", s: 0.35 }]), until: { word: "June." }, mood: "tender" }, [], LAMP),
  { cont: true, ...LAMP, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "stInsert", at: CARD, variant: "drawer", steps: [{ word: "still" }] }],
    sfx: [{ t: 0.05, name: "swish_soft", gain: -4 }, { t: 0.15, name: "tag_jingle", gain: -2 }], note: "13 the collar in the drawer; the tag glows on 'still'" },
  // ======== 14: nearly eleven years at the end of your bed
  { say: N("For nearly eleven years, he slept on the end of your bed. Four thousand and twelve nights. And every night, he walked round you first, to make sure you were safe."), until: { word: "nights." }, ...LAMP,
    ...glide(at([0.3, 1.2, 1.9], [-0.8, 0.65, -0.38], 50), at([0.15, 1.15, 1.6], [-0.8, 0.65, -0.38], 48), 0.1, 4.5),
    actors: [you("sad", { facing: 1 })], note: "14 you, looking at the empty end of the bed" },
  { cont: true, ...LAMP, ...glide(at([-0.8, 0.97, 1.25], [-1.15, 0.87, -0.38], 38), at([-0.85, 0.96, 1.0], [-1.15, 0.88, -0.38], 34), 0.1, 3.5),
    actors: [you("sad", { face: "sad" })], note: "14 your face: every night he walked round you" },
  // ======== 15: his ghost: the paw prints round the bed
  { say: N("He never stopped. That's his ghost, walking round your bed. Still guarding you while you sleep. One step for every night he kept you safe.", [{ after: "stopped.", s: 0.3 }]), until: { word: "sleep." }, ...NIGHT,
    ...glide(HIGH, at([0.7, 1.85, 1.45], [-0.75, 0.25, -0.5], 56), 0.1, 6.0),
    actors: [you("relief", { face: "relief" })], props: [{ id: "pawTrail", at: [-0.5, 0, -0.4], steps: STEADY(22, 0.22, 0.3) }],
    sfx: [{ t: 0.4, name: "claw_ticks", gain: -6 }, { t: 1.9, name: "claw_ticks", gain: -7 }, { t: 3.4, name: "claw_ticks", gain: -8 }, { t: 5.0, name: "tag_jingle", gain: -10 }], note: "15 the glowing paw prints appear round the bed" },
  { cont: true, ...NIGHT, ...glide(BED_MED, BED_CLOSE, 0.1, 4.0),
    actors: [you("happy", { face: "smile_closed", keepFace: true })], sfx: [{ t: 0.5, name: "dog_sigh", gain: -4 }], note: "15 you, eyes closed, smiling: safe" },
  // ======== 16: the drawer left open
  { say: N("So tonight, you leave the drawer open."), ...LAMP, ...lock(at([-0.45, 1.1, 2.0], [-1.15, 0.7, -0.1], 50)),
    actors: [you("happy", { face: "smile_closed", keepFace: true, gesture: "offer", facing: -1 })], note: "16 you reach to the open drawer" },
  // ======== 17: the morning: the same screen (the loop)
  insert("steps", "17 the morning: 4,012 (the opening frame)", { say: N("And in the morning, your phone says four thousand and twelve steps."), transition: "dip", hold: 0.6, sfx: [{ t: 0.0, name: "phone_buzz", gain: -2 }] }),
];

export const STEPS_4012: Storyboard = {
  id: "steps-4012", title: "4,012 Steps",
  cast: { you: "stepsTeen" },
  voice: "georgeHushed", music: { mood: "mystery", gain: -3 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
