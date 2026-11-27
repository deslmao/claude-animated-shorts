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
/** the owner's viral SFX pack (assets/sfx/viral): punchlines, reveals, the number flip, the headstand, the comedic hits. [word, nth, sound, gain dB] */
const VIRAL: Record<number, [string, number, string, number?, number?][]> = {
  0: [["glowing", 1, "viral_camera_flash"]],                    // the numbers appear
  1: [["six", 1, "viral_error"]],                               // "...and I'm a six": the sting that is Leo's number all film
  3: [["Seven", 1, "viral_ding"]],                              // Mum's 7 wins
  4: [["arithmetic", 1, "viral_fahhh", 0, 0.6]],                        // the punchline
  5: [["vote", 1, "viral_info_5", -2]],                         // the family vote is announced
  6: [["Obviously", 1, "viral_rizz"]],                          // Dex, smug
  7: [["Tuesday", 1, "viral_punch"]],                           // Leo's outrage
  8: [["rank", 1, "viral_punch_game"]],                         // Dex's line lands
  9: [["stand", 1, "viral_goofy_run"]],                         // the morning headstand
  10: [["again", 1, "viral_metal_pipe_clang", -2]],             // Mum, deadpan
  11: [["Circulation", 1, "viral_ack", -3, 0.55]],              // Leo, upside down and smug
  12: [["dizzy", 1, "viral_huh", -2, 0.3]],                     // Mum, bewildered
  13: [["Leo", 1, "viral_among_us_reveal", -1, 0.25]],          // the roll-call: whose number is it?
  14: [["Six", 1, "viral_error"]],                              // Leo, small (the fail)
  15: [["take", 1, "viral_punch"]],                             // Dex takes the pancake (the music has just cut)
  16: [["six", 1, "viral_undertaker_bell"]],                    // the lowest point, in silence
  17: [["rule", 1, "viral_keyboard_typing"], ["up", 1, "viral_dun_dun_dun", -2, 0.1]],   // Leo working it out, and the realisation
  18: [["again", 1, "viral_camera_flash"]],                     // Leo goes upside down: the flip
  19: [["nine", 1, "viral_anime_wow"]],                         // the reveal: the 6 is a 9
  20: [["cheating", 1, "viral_tuco_get_out", 0, 0.45]],                  // Dex, outraged
  22: [["Nine", 1, "viral_ding"]],                              // the win
  23: [["Museum", 1, "viral_bing_bing_bing", -2]],
  24: [["too", 1, "viral_goofy_run"]],                          // Dex dives into a headstand
  25: [["eight", 1, "viral_fahhh", 0, 0.3]],                            // and nothing happens
  28: [["sixes", 1, "viral_ding"]],                             // the button
};
// ---- camera set-ups (the real shot list): lenses 22-85 mm, every shot hand-held, impact shakes on the punchlines
const W = (): C => ({ move: "truck", on: ["leo", "mum", "dex"], dist: 0.8, size: "full", from: 8, height: 1.5, fov: fovMm(22), cInf: 0 });
const W2 = (): C => ({ move: "truck", on: ["leo", "mum", "dex"], dist: 0.6, size: "full", from: -8, height: 1.45, fov: fovMm(22), cInf: 1 });
const M2L = (): C => ({ move: "frame", on: ["leo", "mum"], size: "medium", from: -10, height: 1.4, fov: fovMm(35), cInf: 3 });
const ORB = (): C => ({ move: "orbit", on: ["leo", "dex"], fromDeg: [-16, 14], size: "medium", height: 1.4 });
const C50 = (on: string) => (): C => ({ move: "closeUp", on, from: 15, fov: fovMm(50), cInf: 6 });
const C85 = (on: string) => (): C => ({ move: "closeUp", on, from: 18, fov: fovMm(85), cInf: 16 });
// an upside-down actor: a low camera beside the table (the head is on the floor), 30 mm
const LEO_LOW = (): C => ({ move: "at", pos: [-1.4, 0.9, 1.5], look: [-0.7, 1.0, -1.3], fov: fovMm(30), blur: 3 }) as unknown as C;
const DEX_LOW = (): C => ({ move: "at", pos: [1.1, 0.9, 1.5], look: [0.35, 1.0, -1.3], fov: fovMm(30), blur: 3 }) as unknown as C;
const CAMSEL: (() => C)[] = [
  W, C50("leo"), M2L, C50("mum"), C85("leo"), W2, C50("dex"), C50("leo"), C85("dex"), W,         // 0-9   hook, example, stakes, the headstand habit
  M2L, LEO_LOW, C50("mum"), W2, C85("leo"), C85("dex"), C50("mum"), ORB, M2L, W,                  // 10-19 the fail, the realisation, the flip, the reveal
  C50("dex"), LEO_LOW, C50("mum"), M2L, W2, DEX_LOW, C50("mum"), DEX_LOW, W,                      // 20-28 the win, the rival copies and fails
];
const POOL_FLIPPED: (() => C)[] = [W, W2, M2L];
const POOL: (() => C)[] = [W, C50("leo"), ORB, C85("dex"), M2L, W2];
/** a long line gets hard cuts to new angles on its words (about every 2 s), so something changes every 1.5-2.0 s */
const beats = (text: string, i: number, flipped: boolean) => {
  const toks = text.split(/\s+/).filter(Boolean), n = toks.length;
  if (n < 9) return {};
  const cuts = n >= 14 ? [0.35, 0.7] : [0.55], pool = flipped ? POOL_FLIPPED : POOL;
  const cams = [{ t: 0, ...CAMSEL[i](), blockOk: true }, ...cuts.map((f, j) => {
    const idx = Math.min(n - 1, Math.floor(n * f)), w = toks[idx].replace(/[^A-Za-z0-9']+/g, ""), occ = toks.slice(0, idx + 1).filter((x) => x.replace(/[^A-Za-z0-9']+/g, "").toLowerCase() === w.toLowerCase()).length;
    return { word: w, n: occ, ...pool[(i + j + 1) % pool.length](), cut: true, blockOk: true };
  })];
  return { cams } as { cams: NonNullable<Storyboard["shots"][number]["cams"]> };
};
// ---- the headstands: [flip at the start of the shot, flip at the end] (Leo's morning habit, then the reveal; Dex copies at the end)
const LEO_FLIP: Record<number, [number, number]> = { 9: [0, 1], 10: [1, 1], 11: [1, 1], 12: [1, 1], 13: [1, 0], 18: [0, 1], 19: [1, 1], 20: [1, 1], 21: [1, 1], 22: [1, 1], 23: [1, 0] };
const DEX_FLIP: Record<number, [number, number]> = { 24: [0, 1], 25: [1, 1], 26: [1, 1], 27: [1, 1], 28: [1, 1] };
const keysFor = (m: Mood, n: number, fl?: [number, number]): K => {
  if (!fl) return keys(m, n);
  const [a, b] = fl;
  return [{ t: 0, flip: a, gesture: a ? "cheer" : "hang", expr: a ? "smile" : "neutral" }, { t: 0.35, d: 0.5, flip: b, ...(b ? { gesture: "cheer" as const } : {}), ...POSE[m], ...(b ? { expr: "smile" as const, tilt: 0 } : {}) }];
};
// ---- the props: three glowing 3D numbers over the heads (6 Leo, 7 Mum, 8 Dex), and the last pancake
const num = (who: string, at: V, text: string, side: -1 | 1, steps: ({ t: number } | { word: string })[]) => ({ id: "e4Number", variant: text, at, scale: 0.8, hover: { who, side }, steps });
const numbers = (i: number) => { const st = i === 0 ? [{ word: "glowing" }] : [{ t: -1 }]; return [num("leo", LEO, "6", -1, st), num("mum", MUM, "7", -1, st), num("dex", DEX, "8", 1, st)]; };
const PLATE_AT = [0.2, 0.78, -0.4] as V;
const plate = (i: number) => (i >= 5 && i <= 14 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ t: 99 }] }]
  : i === 15 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ word: "take" }] }]
  : i >= 16 && i <= 22 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ t: -1 }] }]
  : i >= 23 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ t: 99 }] }] : []);
const base = { set: "e4Kitchen", light: "interior" as const, ambience: "elb_kitchen_day" as const };

export const IN_MY_WORLD_2: Storyboard = {
  id: "in-my-world-2", title: "In my world, the highest number wins every argument",
  cast: { leo: "leo", mum: "mum", dex: "dex" },
  voice: "leo", voices: { leo: "leo", mum: "e4Mum", dex: "e4Rival" }, narration: "continuous",
  captionStyle: "viral", captionKeys: ["Leo", "Mum", "Dex", "six", "eight", "nine", "pancake", "pool", "museum", "number"],
  // Morning Mood (public domain) for the cheerful beats; dead silence + a sub-bass hit on Dex's second "Pool" (the climax of the fail); it returns on "nine"
  music: { file: "morning-mood", gain: 0, cuts: [{ at: { word: "Pool.", n: 2 }, resume: { word: "nine.", n: 1 }, sub: true }] },
  // this story's own word sounds: numbers are not clock times here; the owner's viral pack (VIRAL above) carries the punchlines and reveals
  wordSfxMap: {
    six: null, sixes: null, seven: null, eight: null, nine: null,
    bedtime: { sfx: "el_lights_off", gain_db: -3 }, pancake: { sfx: "el_plate_down" }, pool: { sfx: "el_water_rush", gain_db: -9 }, museum: null,
    arithmetic: null, rules: { sfx: "el_stamp_thud", gain_db: -4 }, cheating: null, obviously: null,
    glowing: null, highest: { sfx: "whoosh_soft", lead: 0.1 }, saturday: { sfx: "whoosh_soft", lead: 0.1, gain_db: -3 }, upside: { sfx: "whoosh_soft", lead: 0.1 },
    toaster: { sfx: "lever_clunk", gain_db: -3 }, dizzy: null, stand: null, circulation: null, teach: { sfx: "shimmer_chime", gain_db: -7 },
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
    const lf = LEO_FLIP[i], df = DEX_FLIP[i];
    return {
      ...base, camera: CAMSEL[i](), say: { text, who, ...extra } as Line, hold: 0.05, ...beats(text, i, !!(lf || df)), ...(extra?.punch ? { kicks: [0.04] } : {}),
      ...(VIRAL[i] ? { sfx: VIRAL[i].map(([word, n, name, gain, delay]) => ({ word, n, name, ...(gain ? { gain } : {}), ...(delay ? { delay } : {}) })) } : {}),
      props: [...numbers(i), ...(["truck", "orbit"].includes(CAMSEL[i]().move) ? plate(i) : [])],   // the plate only where the camera can see the table
      actors: [{ who: "leo", at: LEO, act: "neutral" as const, facing: "camera" as const, keys: keysFor(lm, i, lf) }, { who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const, keys: keys(mm, i + 1) }, { who: "dex", at: DEX, act: "neutral" as const, facing: "camera" as const, keys: keysFor(dm, i + 2, df) }],
      note: `${who}: ${text}`,
    };
  }),
};
