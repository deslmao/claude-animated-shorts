// The Whale City (productions/whale-city): a silent harbour city built on the back of a sleeping whale. Narrated in
// the third person (Hushed George); the city whispers (the dialogue is steered quiet with line context) until Wren
// rings the founders' bell: the first loud sound in the film. Staging rules: the square is always hushed (felt
// slippers, hand signs, people looking down); the Fountain's rings are seen narrowing before they are explained; every
// big image at the end was set up earlier (the tapestry's blown-off roofs, the low marks, the sinking, the tied bell).
import type { Storyboard, ShotSpec, ActorSpec, When, Line } from "../story/types";

type V3 = [number, number, number];
const P = 6.2;                                                                     // the plaza (the square) height
const atCam = (pos: V3, look: V3, fov: number) => ({ move: "at" as const, pos, look, fov });
const move = (p0: V3, l0: V3, f0: number, p1: V3, l1: V3, f1: number, t0 = 0.1, dur = 1.6) =>
  ({ camera: atCam(p0, l0, f0), cams: [{ t: 0, ...atCam(p0, l0, f0), blockOk: true }, { t: t0, ...atCam(p1, l1, f1), glide: dur, blockOk: true }] });
const DAY = { set: "whaleCity", light: "day" as const }, DAWN = { set: "whaleCity", light: "golden" as const }, NIGHT = { set: "whaleCity", light: "night" as const };
const RISE = { set: "whaleRise", light: "golden" as const };
const whisper = (text: string, voice: string, who: string, before: string): Line => ({ text, voice, who, context: { before } });

// ---------------------------------------------------------------- places
const FOUNTAIN: V3 = [0, P, -3], OPEN12: V3 = [0, P + 1.35, -3], OPEN13: V3 = [0, P + 1.45, -3];
const POLE: V3 = [2.6, P, -3.8], BELL: V3 = [-6.5, P, 2.2];
const WREN_AT: V3 = [2.3, P, -1.0], GRAN_AT: V3 = [3.7, P, -0.8], MAYOR_AT: V3 = [-1.9, P, -0.9];
const TAPESTRY: V3 = [0, P + 2.4, -16.0];
const QUAY: V3 = [23.8, 1.3, -46], EYE: V3 = [19.4, 1.6, -58];
/** steady steps (smoke-style props: spout, sea) and the slower cues */
const STEADY: When[] = Array.from({ length: 90 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
/** rig props hold their pose only once a step has run: still props get one before the shot */
const STILL: When[] = [{ t: -0.7 }];
const SLOW: When[] = Array.from({ length: 12 }, (_, i) => ({ t: 0.1 + i * 0.5 }));
const ring = (v: string, steps: When[] = STILL) => ({ id: "blowhole", at: FOUNTAIN, variant: v, steps });
const spout = (v: string, at: V3 = OPEN12, steps: When[] = STEADY) => ({ id: "spout", at, variant: v, steps });
const pole = (v = "low") => ({ id: "breathPole", at: POLE, variant: v });

// ---------------------------------------------------------------- cast
const cast: Record<string, string | { extra: number; era: "medieval" }> = { wren: "wren", gran: "gran", mayor: "mayor", mother: "mother", fisher: "fisher" };
for (let k = 0; k < 8; k++) cast[`m${k}`] = { extra: 300 + k, era: "medieval" };
/** the market's townsfolk: trading in hand signs, then frozen by the baby's cry, every face turned down */
const MARKET: V3[] = [[-10.4, P, 7.9], [-7.6, P, 8.4], [-11.6, P, 5.6], [-6.4, P, 6.2], [-12.8, P, 10.8], [-12.6, P, 8.6]];
const townsfolk = (freezeAt: number): ActorSpec[] => MARKET.map((at, k): ActorSpec => freezeAt < 0
  ? { who: `m${k}`, at, act: "scared", gesture: "hang", facing: "toward:mother" }
  : { who: `m${k}`, at, act: k % 2 ? "happy" : "neutral", gesture: k % 3 === 0 ? "talk" : k % 3 === 1 ? "offer" : undefined, facing: "toward:mother",
      beats: [{ t: freezeAt + k * 0.06, act: "scared", gesture: "hang" }, { t: freezeAt + 0.5 + k * 0.05, look: "down" }] });
const CROWD = { count: 16, era: "medieval" as const, around: [0, P, 6] as V3, radius: 7 };

// ---------------------------------------------------------------- shots
const shots: ShotSpec[] = [
  // ======== 1: the hook. A silent market; a baby cries; everyone freezes and looks down
  { say: "In this city, nobody makes a sound.", ...DAY,
    camera: { move: "frame", on: ["mother", "m1"], size: "wide", from: -30 },
    actors: [{ who: "mother", at: [-8.8, P, 8.0], act: "neutral", hold: "baby", facing: "toward:m1", beats: [{ t: 0.5, act: "scared", gesture: "coverMouth" }, { t: 1.2, look: "down" }] }, ...townsfolk(0.55)],
    sfx: [{ t: 0.35, name: "baby_cry", on: "mother" }], note: "1 the hook" },
  // ======== 2: pull up and away: the city is on a whale
  { say: "Because the whole city is sitting on the back of a sleeping whale.", ...DAY,
    ...move([-4, P + 5, 16], [-6, P + 1, 4], 50, [30, 62, -150], [0, 0, 20], 40, 0.1, 3.8),
    actors: [{ who: "mother", at: [-8.8, P, 8.0], act: "neutral", hold: "baby" }, ...townsfolk(-5)], props: [spout("low"), ring("12"), { id: "whaleTail", at: [0, 0, 140], variant: "rest", scale: 1.4, steps: STILL }, { id: "whaleEye", at: EYE, yaw: 70, steps: STILL }], sfx: [{ t: 0.2, name: "whoosh_long", gain: -6 }], note: "2 the whale" },
  // ======== 3: the founding tapestry; the tied bell
  { say: "The first people here thought it was an island. Then, at their first party, they fired a cannon.", ...DAY,
    ...move([0.05, P + 2.4, -13.9], TAPESTRY, 40, [-0.12, P + 2.38, -14.5], [-0.18, P + 2.36, -16.0], 34, 0.1, 4.0),
    actors: [], props: [{ id: "tapestryCard", at: TAPESTRY, steps: STILL }], sfx: [{ word: "cannon", name: "cannon", gain: -8 }], note: "3 the founding" },
  { say: "The whale woke up, and breathed out so hard it blew the roofs off their houses.", ...DAY,
    ...move([0.02, P + 2.42, -14.7], [0.02, P + 2.5, -16.0], 32, [0.02, P + 2.5, -15.0], [0.02, P + 2.6, -16.0], 30, 0.1, 3.0),
    actors: [], props: [{ id: "tapestryCard", at: TAPESTRY, steps: STILL }], note: "3 the breath" },
  { say: "So now, nobody makes a sound.", ...DAY,
    camera: atCam([-5.7, P + 2.15, 3.75], [-6.5, P + 2.05, 2.2], 40),
    actors: [], props: [{ id: "foundersBell", at: BELL, variant: "tied", steps: STILL }], note: "3 the tied bell" },
  // ======== 4: dawn; Wren measures the breath
  { say: "Every morning, Wren measures how high the whale breathes. It's her job.", ...DAWN,
    camera: { move: "frame", on: ["wren", "breathPole"], size: "wide", from: 120, height: P + 0.9 },
    actors: [{ who: "wren", at: WREN_AT, act: "thinking", facing: "toward:gran", beats: [{ t: 0.2, look: "up" }] }],
    props: [ring("12"), spout("low"), pole()], sfx: [{ t: 0.2, name: "whale_breath" }], note: "4 the breath-keeper" },
  // ======== 5: the marks are lower
  { ...DAWN, dur: 1.6,
    camera: atCam([2.62, P + 3.9, -2.5], [2.62, P + 3.9, -3.55], 40),
    actors: [], props: [{ id: "poleCard", at: [2.62, P + 3.9, -3.55], variant: "low", steps: STILL }], note: "5 the marks" },
  { say: whisper("Gran, it's lower again.", "wrenWhisper", "wren", "Wren leaned close to her gran and whispered,"), ...DAWN,
    camera: { move: "frame", on: ["wren", "gran"], size: "medium", from: 160 },
    actors: [{ who: "wren", at: WREN_AT, act: "nervous", facing: "toward:gran", gesture: "pointUp" }, { who: "gran", at: GRAN_AT, act: "neutral", facing: "toward:wren" }], note: "5 lower again" },
  { say: whisper("It's an old whale, love.", "granWhisper", "gran", "Gran peered up at the pole and whispered softly,"), ...DAWN,
    camera: { move: "frame", on: ["gran"], size: "full", from: 150 },
    actors: [{ who: "gran", at: GRAN_AT, act: "relief", gesture: "hang", facing: "toward:wren", beats: [{ t: 0.1, look: "up" }] }, { who: "wren", at: WREN_AT, act: "nervous", facing: "toward:gran" }],
    note: "5 an old whale" },
  // ======== 6: the rings
  { say: "Every new mayor puts another stone ring around the hole. It's a tradition.", ...DAWN,
    ...move([3.7, P + 2.6, 1.0], [0, P + 1.0, -3.0], 44, [3.4, P + 2.4, 0.6], [0, P + 1.0, -3.0], 40, 0.1, 3.6),
    actors: [{ who: "wren", at: WREN_AT, act: "thinking", facing: -1 }],
    props: [ring("12")], note: "6 the rings" },
  { say: "And every ring makes the hole a bit smaller.", ...DAY,
    ...move([0.02, P + 2.42, -14.7], [0.02, P + 2.42, -16.0], 30, [0.02, P + 2.45, -15.25], [0.02, P + 2.47, -16.0], 26, 0.1, 2.2),
    actors: [], props: [{ id: "tapestryCard", at: TAPESTRY, steps: STILL }], note: "6 the founders' wide hole" },
  { say: whisper("It's not old. It can't breathe.", "wrenWhisper", "wren", "Wren put her hand over the tiny opening and whispered, horrified,"), ...DAWN,
    camera: { move: "frame", on: ["wren"], size: "close", from: 210 },
    actors: [{ who: "wren", at: WREN_AT, act: "scared", facing: -1, gesture: "stop" }], props: [ring("12")], note: "6 it can't breathe" },
  // ======== 7: the city is sinking
  { say: "And every year, the city sat a little lower in the sea.", ...DAY,
    ...move([33.8, 2.9, -38.6], [27.0, 1.2, -45.0], 46, [33.4, 2.8, -39.2], [27.0, 1.1, -45.0], 43, 0.1, 3.0),
    actors: [{ who: "fisher", at: [27.0, 1.3, -43.6], act: "sad", gesture: "hold", facing: -1, beats: [{ t: 0.4, look: "down" }] }], sfx: [{ t: 0.3, name: "wave_crash", gain: -10 }], note: "7 the sea over the step" },
  // ======== 8: the thirteenth ring
  { ...DAY, dur: 2.6,
    camera: { move: "frame", on: ["mayor", "blowhole"], size: "wide", from: 215 },
    actors: [{ who: "mayor", at: MAYOR_AT, act: "proud", gesture: "present", facing: "camera" }],
    crowd: { ...CROWD, acts: ["happy", "neutral"], beats: [{ t: 1.3, gesture: "cheer" }], toward: "mayor" },
    props: [ring("13lower", [{ t: 0.3 }, { t: 0.9 }, { t: 1.5 }, { t: 2.1 }])], note: "8 the ceremony" },
  { say: whisper("Please, don't. You'll block it.", "wrenWhisper", "wren", "She pushed to the front and whispered urgently,"), ...DAY,
    camera: { move: "frame", on: ["wren", "mayor"], size: "medium", from: 150 },
    actors: [{ who: "wren", at: [0.2, P, 0.6], act: "scared", facing: "toward:mayor", gesture: "stop" }, { who: "mayor", at: MAYOR_AT, act: "happy", facing: "toward:wren" }],
    crowd: { ...CROWD, count: 10, toward: "mayor" }, note: "8 you'll block it" },
  { say: whisper("In this city, we don't raise our voices.", "mayor", "mayor", "The Mayor smiled pleasantly and whispered,"), ...DAY,
    camera: { move: "closeUp", on: "mayor", from: 200 },
    actors: [{ who: "mayor", at: MAYOR_AT, act: "proud", facing: "toward:wren" }, { who: "wren", at: [0.2, P, 0.6], act: "scared", facing: "toward:mayor" }], note: "8 we don't raise our voices" },
  { ...DAY, dur: 1.4,
    camera: { move: "insert", on: "blowhole", size: "close", from: 20, height: P + 1.6 },
    actors: [], props: [ring("13lower", [{ t: -0.9 }, { t: -0.6 }, { t: -0.3 }, { t: 0.25 }])], sfx: [{ t: 0.85, name: "thunk" }], note: "8 clunk" },
  // ======== 9: night; the whale stops breathing; the city tilts and floods
  { say: "That night, the whale stopped breathing.", ...NIGHT,
    camera: { move: "insert", on: "blowhole", size: "close", from: 200, height: P + 1.9 },
    actors: [], props: [ring("13"), spout("fail", OPEN13, SLOW)], sfx: [{ t: 0.1, name: "steam", gain: -8 }], note: "9 the last breath" },
  { ...NIGHT, dur: 3.0,
    camera: { move: "at", pos: [28.4, 2.3, -40.6], look: [24.2, 1.6, -45.6], fov: 50 },
    cams: [{ t: 0.1, move: "at", pos: [28.2, 2.2, -41.0], look: [24.2, 1.5, -45.6], fov: 48, glide: 2.8, blockOk: true }],
    actors: [{ who: "fisher", at: [25.0, 1.3, -44.6], act: "scared", facing: "camera", walk: { to: [22.6, 1.3, -42.4], t0: 0.6, t1: 2.8, mode: "run" } }],
    props: [{ id: "floodWater", at: QUAY, steps: [{ t: 0.1 }, { t: 1.1 }, { t: 2.1 }] }], sfx: [{ t: 0.2, name: "water_pour" }, { t: 1.0, name: "creak", gain: -6 }], note: "9 the harbour floods" },
  { ...NIGHT, dur: 2.8,
    camera: { move: "dutch", on: ["mother", "gran", "wren"], size: "wide", from: -25, roll: -0.12 },
    actors: [{ who: "mother", at: [-2.6, P, 9.0], act: "scared", hold: "baby", walk: { to: [-1.4, P, 4.0], t0: 0.1, t1: 2.7 } },
      { who: "gran", at: [2.4, P, 2.2], act: "scared", facing: "toward:wren" }, { who: "wren", at: [1.2, P, 2.6], act: "scared", facing: "toward:gran" }],
    crowd: { count: 12, era: "medieval", around: [0, P, 7], radius: 6, acts: ["scared"] }, note: "9 up to the square in silence" },
  // ======== 10: the bell
  { ...NIGHT, dur: 1.5,
    camera: { move: "frame", on: ["wren"], size: "close", from: 140 },
    actors: [{ who: "wren", at: [-4.4, P, 3.6], act: "thinking", facing: "toward:mayor", beats: [{ t: 0.4, look: "left" }] }, { who: "mayor", at: [-2.2, P, 5.6], act: "scared", facing: "toward:wren" }], note: "10 she looks at the bell" },
  { say: whisper("If it wakes up, it'll dive, and take us all with it.", "mayor", "mayor", "The Mayor caught her look and hissed, in a frightened whisper,"), ...NIGHT,
    camera: { move: "frame", on: ["mayor", "wren"], size: "medium", from: 215 },
    actors: [{ who: "mayor", at: [-2.2, P, 5.6], act: "nervous", facing: "toward:wren" }, { who: "wren", at: [-4.4, P, 3.6], act: "determined", facing: "toward:mayor" }], note: "10 it'll dive" },
  { say: whisper("It can't breathe! It's not going to dive. It needs air.", "wrenUrgent", "wren", "Wren, desperate, raised her voice for the first time in her life:"), ...NIGHT,
    camera: { move: "frame", on: ["wren"], size: "close", from: 160 },
    actors: [{ who: "wren", at: [-4.4, P, 3.6], act: "determined", facing: "toward:mayor", gesture: "fists" }, { who: "mayor", at: [-2.2, P, 5.6], act: "scared", facing: "toward:wren" }], note: "10 it needs air" },
  { ...NIGHT, dur: 1.8,
    camera: { move: "frame", on: ["gran", "wren"], size: "wide", from: 30 },
    actors: [{ who: "gran", at: [-3.1, P, 4.6], act: "determined", facing: "toward:wren", hold: "knife", gesture: "offer" }, { who: "wren", at: [-4.4, P, 3.6], act: "determined", facing: "toward:gran", beats: [{ t: 1.0, hold: "knife" }] }], note: "10 Gran's knife" },
  { say: whisper("Don't you dare!", "mayorSharp", "mayor", "The Mayor lunged forward and hissed,"), ...NIGHT,
    camera: { move: "frame", on: ["wren", "foundersBell"], size: "medium", from: 140 },
    actors: [{ who: "wren", at: [-6.4, P, 2.9], act: "determined", hold: "knife", facing: -1, gesture: "grab" }, { who: "mayor", at: [-3.4, P, 5.4], act: "angry", facing: "toward:wren", gesture: "stop" }],
    props: [{ id: "foundersBell", at: BELL, variant: "tied", steps: STILL }], sfx: [{ t: 0.15, name: "swish_soft" }], note: "10 she cuts the rope" },
  { ...NIGHT, dur: 3.2, mood: "adventure",
    camera: atCam([-4.7, P + 0.85, 5.5], [-6.45, P + 2.0, 2.4], 54),
    actors: [{ who: "wren", at: [-6.4, P, 2.9], act: "determined", facing: -1, gesture: "grab" }],
    props: [{ id: "foundersBell", at: BELL, variant: "free", steps: [{ t: 0.15 }, { t: 1.0 }, { t: 1.85 }, { t: 2.7 }] }],
    sfx: [{ t: 0.3, name: "founders_bell" }, { t: 1.15, name: "founders_bell" }, { t: 2.0, name: "founders_bell" }, { t: 2.85, name: "founders_bell" }], kicks: [0.3, 1.15], note: "10 the bell" },
  // ======== 11: it wakes
  { ...DAWN, dur: 2.8,
    camera: atCam([31.5, 3.0, -45.0], EYE, 42),
    cams: [{ t: 0.1, ...atCam([30.5, 2.8, -46.5], EYE, 36), glide: 2.6, blockOk: true }],
    actors: [], props: [{ id: "whaleEye", at: EYE, yaw: 42, steps: [{ t: 0.3 }, { t: 0.9 }, { t: 2.0 }] }],
    sfx: [{ t: 0.1, name: "whale_groan" }], kicks: [0.4], note: "11 the eye opens" },
  { ...RISE, dur: 2.6,
    camera: atCam([33.5, 2.4, -38.5], [25, 1.7, -45], 52),
    actors: [{ who: "fisher", at: [26.6, 1.3, -42.4], act: "shock", facing: "camera", gesture: "spread" }],
    props: [{ id: "whaleSea", at: [30.5, 0, -44], variant: "rise", steps: [{ t: 0.2 }, { t: 1.0 }, ...STEADY.slice(14)] }],
    sfx: [{ t: 0.15, name: "water_pour" }, { t: 0.3, name: "whale_groan", gain: -4 }], kicks: [0.3, 1.0], note: "11 the city rises" },
  // ======== 12: the great breath
  { say: "Awake, it breathed out just like it did all those years ago.", ...DAWN,
    camera: { move: "at", pos: [6, P + 1.3, 12], look: [0, P + 6, -3], fov: 56 },
    actors: [{ who: "wren", at: [2.6, P, 3.8], act: "shock", back: true }, { who: "gran", at: [4.2, P, 4.6], act: "shock", back: true }],
    crowd: { count: 12, era: "medieval", around: [-1, P, 6], radius: 6, acts: ["shock"] },
    props: [ring("blast", STEADY), spout("erupt", OPEN13)], sfx: [{ t: 0.05, name: "whale_blow" }], kicks: [0.1, 0.5], note: "12 the rings fly" },
  { say: "Hard enough to blow the rings away.", ...DAWN,
    camera: atCam([48, 40, 62], [0, P + 14, -3], 46),
    actors: [], props: [spout("erupt", OPEN13, STEADY.map((s) => ({ t: (s.t as number) - 3 })))], sfx: [{ t: 0.4, name: "wave_crash", gain: -6 }], note: "12 the column and the rainbow" },
  // ======== 13: it swims
  { ...RISE, dur: 3.2,
    camera: atCam([0.6, P + 16, 10], [0, 6, 140], 48), cams: [{ t: 0, ...atCam([0.6, P + 16, 10], [0, 6, 140], 48), blockOk: true }],
    actors: [],
    props: [{ id: "whaleSea", at: [0, 0, 60], variant: "glide", steps: STEADY }, { id: "whaleTail", at: [0, 0, 140], scale: 1.4, steps: [{ t: 0.2 }, { t: 1.2 }, { t: 2.2 }, { t: 3.0 }, { t: 4.2 }] }],
    sfx: [{ t: 0.6, name: "wave_crash" }, { t: 1.4, name: "whoosh_long", gain: -4 }], note: "13 the tail" },
  { ...DAWN, dur: 2.6,
    camera: { move: "frame", on: ["wren", "gran"], size: "medium", from: 15 },
    actors: [{ who: "wren", at: [0.9, P, 16.5], act: "laugh", facing: "camera", beats: [{ t: 1.1, gesture: "cheer" }] }, { who: "gran", at: [-0.6, P, 16.9], act: "happy", facing: "toward:wren", beats: [{ t: 1.3, act: "laugh" }] }],
    crowd: { count: 10, era: "medieval", around: [0, P, 12], radius: 5, acts: ["laugh", "excited"], beats: [{ t: 1.2, gesture: "cheer" }] },
    sfx: [{ t: 0.5, name: "giggle", on: "wren" }, { t: 1.2, name: "crowd_cheer" }], note: "13 the first cheer" },
  // ======== 14: it sleeps; it can breathe
  { say: "Then it went back to sleep. And for the first time in three hundred years, it could breathe.", ...DAWN, mood: "warm",
    camera: { move: "frame", on: ["wren", "breathPole"], size: "wide", from: 120, height: P + 0.7 },
    actors: [{ who: "wren", at: WREN_AT, act: "relief", facing: "toward:gran", beats: [{ t: 0.3, look: "up" }] }],
    props: [ring("open"), spout("tall", [0, P + 0.15, -3]), pole("top")], sfx: [{ t: 0.3, name: "whale_breath" }], note: "14 it can breathe" },
  { ...DAWN, dur: 1.6,
    camera: atCam([2.62, P + 3.9, -2.5], [2.62, P + 3.9, -3.55], 40),
    actors: [], props: [{ id: "poleCard", at: [2.62, P + 3.9, -3.55], variant: "top", steps: STILL }], note: "14 her mark, at the top" },
  // ======== 15: speak up
  { say: "For three hundred years, the whole city had whispered, so it wouldn't wake up.", ...DAWN,
    camera: { move: "frame", on: ["wren", "foundersBell"], size: "medium", from: 150 },
    actors: [{ who: "wren", at: [-5.4, P, 3.9], act: "happy", facing: "toward:gran", beats: [{ t: 0.6, look: "left" }] }, { who: "gran", at: [-3.9, P, 4.8], act: "happy", facing: "toward:wren" }],
    props: [{ id: "foundersBell", at: BELL, variant: "free", steps: STILL }], note: "15 the bell" },
  { say: "It turns out it was just waiting for someone to speak up.", ...DAWN, hold: 1.4,
    ...move([24, 40, -118], [0, 2, 22], 42, [36, 70, -172], [0, 0, 25], 40, 0.1, 5.0),
    actors: [], props: [spout("tall", [0, P + 0.15, -3]), { id: "whaleTail", at: [0, 0, 140], variant: "rest", scale: 1.4, steps: STILL }, { id: "whaleEye", at: EYE, yaw: 70, steps: STILL }], note: "15 the city at sunrise" },
];

export const WHALE_CITY: Storyboard = {
  id: "whale-city", title: "The Whale City",
  cast, voice: "georgeHushed", music: { mood: "mystery", gain: -3 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
