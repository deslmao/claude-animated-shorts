// IN MY WORLD: THE NUMBER (productions/in-my-world-2/script.md): Engine 4, Option 2 "3D Number Luck World". Everyone has a glowing 3D number over
// their head, the highest number wins every argument; Leo is a six, Dex (the smug cousin) is an eight, Mum is a seven; Leo's useless morning
// headstand turns his 6 into a 9. Real back-and-forth dialogue (Leo, Mum, Dex) with Leo's first-person voice-over only on the three beat hinges.
// AUDIO-FIRST BUILD (the script gate): narration, voices, music, SFX and dual masters are real; the picture is a placeholder storyboard; the
// props (extending e4Number with a hover + flip, and a one-pancake variant of bfPlate) are NOT built until the owner approves the script.
import type { Storyboard, Line } from "../story/types";
import { fovMm } from "../engine4/camera";

type V = [number, number, number];
const LEO = [-0.55, 0, -1.3] as V, MUM = [-1.4, 0, -1.2] as V, DEX = [0.3, 0, -1.3] as V;
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
type C = Storyboard["shots"][number]["camera"];
const CAMS: ((on: string) => C)[] = [
  () => ({ move: "truck", on: ["leo", "mum", "dex"], dist: 0.9, size: "full", from: 8, height: 1.5, fov: fovMm(22), cInf: 0 }),
  (on) => ({ move: "closeUp", on, from: 15, fov: fovMm(50), cInf: 6 }),
  () => ({ move: "orbit", on: ["leo", "dex"], fromDeg: [-16, 14], size: "medium", height: 1.4 }),
  (on) => ({ move: "closeUp", on, from: 18, fov: fovMm(85), cInf: 16 }),
  () => ({ move: "frame", on: ["leo", "mum"], size: "medium", from: -10, height: 1.4, fov: fovMm(35), cInf: 3 }),
  () => ({ move: "truck", on: ["leo", "mum", "dex"], dist: 0.6, size: "full", from: -8, height: 1.45, fov: fovMm(22), cInf: 1 }),
];
type Mood = "cheer" | "worry" | "smug" | "shock" | "sad" | "think" | "angry";
const POSE: Record<Mood, { expr: NonNullable<K[number]["expr"]>; tilt: number; slump?: number; brow?: [number, number, number] }> = {
  cheer: { expr: "smile", tilt: 3, brow: [0, 0, 2] }, worry: { expr: "nervous", tilt: -5, slump: 0.3, brow: [0, -2, 0] }, smug: { expr: "proud", tilt: 4, brow: [-1, 0, 3] },
  shock: { expr: "shock", tilt: -6, brow: [-3, -1, 3] }, sad: { expr: "sad", tilt: 0, slump: 0.8, brow: [1, -3, 0] }, think: { expr: "thinking", tilt: 5, brow: [0, 2, 3] },
  angry: { expr: "angry", tilt: -4, brow: [2, 3, 0] },
};
const keys = (m: Mood, n: number): K => [{ t: 0, expr: "neutral" }, { t: 0.4 + (n % 3) * 0.1, d: 0.34, ...POSE[m] }];
type Who = "narrator" | "leo" | "mum" | "dex";
/** one shot per line: [speaker, text, [leo, mum, dex] moods, extra Line fields] */
const S: [Who, string, [Mood, Mood, Mood], Partial<Line>?][] = [
  // BEAT 1: the hook (Leo's voice-over)
  ["narrator", "In my world, everyone has a glowing number over their head. The highest number wins every argument.", ["cheer", "cheer", "smug"]],
  ["narrator", "I'm Leo. I'm brilliant at arguing. And I'm a six.", ["worry", "cheer", "smug"]],
  // BEAT 2: one relatable everyday example
  ["leo", "Mum, can I stay up late tonight?", ["cheer", "think", "smug"]],
  ["mum", "Seven beats six. Bedtime.", ["shock", "smug", "smug"]],
  ["leo", "That's not an argument, that's arithmetic!", ["angry", "smug", "smug"]],
  // BEAT 3: high stakes and the smug rival / the unfair system
  ["mum", "Okay, family vote. The highest number picks Saturday, and gets the last pancake.", ["worry", "cheer", "smug"]],
  ["dex", "Eight. Pool. Obviously.", ["worry", "think", "smug"]],
  ["leo", "You've been an eight since Tuesday!", ["angry", "think", "smug"]],
  ["dex", "Numbers don't lie, Leo. They just rank.", ["sad", "think", "smug"], { punch: true }],
  // BEAT 4: the useless secret habit
  ["narrator", "My secret? Every morning I stand on my head. Ten minutes.", ["cheer", "think", "smug"]],
  ["mum", "Leo, why are you upside down by the toaster again?", ["cheer", "think", "think"]],
  ["leo", "Circulation, Mum.", ["cheer", "think", "think"]],
  ["mum", "You're making me dizzy.", ["cheer", "shock", "smug"]],
  // BEAT 5: the public fail (music hard-cuts to silence)
  ["mum", "Final numbers. Dex, eight. Me, seven. Leo?", ["worry", "think", "smug"]],
  ["leo", "...Six.", ["sad", "think", "smug"], { pauses: [] }],
  ["dex", "Pool. And I'll take that pancake.", ["sad", "think", "smug"], { punch: true }],
  ["mum", "Rules are rules, Leo. Eight beats six.", ["sad", "sad", "smug"]],
  // BEAT 6: the loophole (music returns)
  ["narrator", "Highest number wins. That's the rule. It never said which way up.", ["think", "sad", "smug"], { punch: true }],
  ["leo", "Mum. Read my number again.", ["think", "think", "smug"]],
  ["mum", "It's... a nine.", ["cheer", "shock", "shock"], { punch: true }],
  ["dex", "That's cheating!", ["cheer", "shock", "angry"]],
  ["leo", "Show me the rule that says I have to stand up.", ["cheer", "think", "angry"]],
  ["mum", "There isn't one. Nine beats eight.", ["cheer", "cheer", "sad"]],
  ["leo", "Museum. And the pancake.", ["cheer", "cheer", "sad"], { punch: true }],
  // BEAT 7: the rival is humbled (clean cut, no call to action)
  ["dex", "Fine. I'll do it too.", ["cheer", "think", "angry"]],
  ["dex", "Why is my number still an eight?", ["cheer", "think", "shock"], { punch: true }],
  ["mum", "An eight looks the same both ways, sweetheart.", ["think", "cheer", "sad"]],
  ["dex", "Leo... teach me?", ["cheer", "cheer", "worry"]],
  ["leo", "Sorry. It only works on sixes.", ["smug", "cheer", "sad"], { punch: true }],
];
const beats = (text: string, i: number, on: string) => {
  const toks = text.split(/\s+/).filter(Boolean), n = toks.length;
  if (n < 9) return {};
  const cuts = n >= 14 ? [0.35, 0.7] : [0.55];
  const first = CAMS[i % CAMS.length](on);
  const cams = [{ t: 0, ...first, blockOk: true }, ...cuts.map((f, j) => {
    const idx = Math.min(n - 1, Math.floor(n * f)), w = toks[idx].replace(/[^A-Za-z0-9']+/g, ""), occ = toks.slice(0, idx + 1).filter((x) => x.replace(/[^A-Za-z0-9']+/g, "").toLowerCase() === w.toLowerCase()).length;
    return { word: w, n: occ, ...CAMS[(i + j + 1) % CAMS.length](on), cut: true, blockOk: true };
  })];
  return { cams } as { cams: NonNullable<Storyboard["shots"][number]["cams"]> };
};
const base = { set: "e4Kitchen", light: "interior" as const, ambience: "elb_kitchen_day" as const, props: [] };

export const IN_MY_WORLD_2: Storyboard = {
  id: "in-my-world-2", title: "In my world, the highest number wins every argument",
  cast: { leo: "leo", mum: "mum", dex: "noah" },
  voice: "leo", voices: { leo: "leo", mum: "e4Mum", dex: "e4Rival" }, narration: "continuous",
  captionStyle: "viral", captionKeys: ["Leo", "Mum", "Dex", "six", "eight", "nine", "pancake", "pool", "museum", "number"],
  // Morning Mood (public domain) for the cheerful beats; dead silence + a sub-bass hit on Dex's "Pool" (the climax of the fail); it returns on "nine"
  music: { file: "morning-mood", gain: 0, cuts: [{ at: { word: "Pool.", n: 2 }, resume: { word: "nine.", n: 1 }, sub: true }] },
  // this story's own word sounds: numbers are not clock times here; the "nine" is the reveal
  wordSfxMap: {
    six: { sfx: "pop", gain_db: -5 }, sixes: { sfx: "pop", gain_db: -5 }, seven: { sfx: "pop", gain_db: -5 }, eight: { sfx: "pop", gain_db: -5 }, nine: { sfx: "shimmer_chime", major: true, gain_db: -1 },
    bedtime: { sfx: "el_lights_off", gain_db: -3 }, pancake: { sfx: "el_plate_down" }, pool: { sfx: "el_water_rush", gain_db: -9 }, museum: { sfx: "shimmer_chime", gain_db: -5 },
    arithmetic: { sfx: "boing", gain_db: -5 }, rules: { sfx: "el_stamp_thud", gain_db: -4 }, cheating: { sfx: "el_stamp_thud", gain_db: -3 }, obviously: { sfx: "boing", gain_db: -7 },
    glowing: { sfx: "shimmer_chime", gain_db: -7 }, highest: { sfx: "whoosh_soft", lead: 0.1 }, saturday: { sfx: "whoosh_soft", lead: 0.1, gain_db: -3 }, upside: { sfx: "whoosh_soft", lead: 0.1 },
    toaster: { sfx: "lever_clunk", gain_db: -3 }, dizzy: { sfx: "boing", gain_db: -6 }, stand: { sfx: "step_hard", gain_db: -5 }, circulation: { sfx: "boing", gain_db: -7 }, teach: { sfx: "shimmer_chime", gain_db: -7 },
  },
  engine: 4, motionBlur: true, controlledBlur: true,
  clarity: {
    premise: "In Leo's world everyone has a glowing number over their head and the highest number wins every argument, so when his cousin Dex, an eight, takes the last pancake and picks Saturday, Leo stands on his head, turns his six into a nine, and wins.",
    facts: [
      { fact: "the rule", said: "The highest number wins every argument" },
      { fact: "his weakness", said: "And I'm a six" },
      { fact: "the example", said: "Seven beats six. Bedtime" },
      { fact: "the stakes", said: "The highest number picks Saturday, and gets the last pancake" },
      { fact: "the secret habit", said: "Every morning I stand on my head" },
      { fact: "the loophole", said: "It never said which way up" },
      { fact: "the humbling", said: "An eight looks the same both ways" },
    ],
  },
  shots: S.map(([who, text, [lm, mm, dm], extra], i) => {
    const on = who === "narrator" ? "leo" : who;
    return {
      ...base, camera: CAMS[i % CAMS.length](on), say: { text, who, ...extra } as Line, hold: 0.05, ...beats(text, i, on), ...(extra?.punch ? { kicks: [0.04] } : {}),
      actors: [{ who: "leo", at: LEO, act: "neutral" as const, facing: "camera" as const, keys: keys(lm, i) }, { who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const, keys: keys(mm, i + 1) }, { who: "dex", at: DEX, act: "neutral" as const, facing: "camera" as const, keys: keys(dm, i + 2) }],
      note: `${who}: ${text}`,
    };
  }),
};
