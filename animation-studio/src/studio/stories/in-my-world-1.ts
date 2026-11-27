// IN MY WORLD: THE TOAST (productions/in-my-world-1/script.md): the first Engine 4 "One-Rule World" story, 7 beats, ~80 s, Maya's kitchen.
// AUDIO-FIRST BUILD (Phase 5 gate): the narration, music, SFX and dual masters are real; the picture is a placeholder storyboard (cameras and
// acting cycle through the approved Engine 4 set-ups) and the two hero props (wordToast, brokenMug) are NOT built yet: the owner approves the
// script and the prop list first. Nothing is rendered.
import type { Storyboard, Line } from "../story/types";
import { fovMm } from "../engine4/camera";

type V = [number, number, number];
const MUM = [-0.95, 0, -1.3] as V, MAYA = [-0.2, 0, -1.3] as V;
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
const CAMS = [
  (): Storyboard["shots"][number]["camera"] => ({ move: "truck", on: ["mum", "maya"], dist: 0.9, size: "wide", from: 8, height: 1.5, fov: fovMm(24), cInf: 0 }),
  (): Storyboard["shots"][number]["camera"] => ({ move: "closeUp", on: "maya", from: 15, fov: fovMm(50), cInf: 6 }),
  (): Storyboard["shots"][number]["camera"] => ({ move: "orbit", on: ["mum", "maya"], fromDeg: [-16, 14], size: "medium", height: 1.4 }),
  (): Storyboard["shots"][number]["camera"] => ({ move: "closeUp", on: "mum", from: 18, fov: fovMm(85), cInf: 16 }),
  (): Storyboard["shots"][number]["camera"] => ({ move: "frame", on: ["mum", "maya"], size: "medium", from: -10, height: 1.4, fov: fovMm(35), cInf: 3 }),
  (): Storyboard["shots"][number]["camera"] => ({ move: "truck", on: ["mum", "maya"], dist: 0.8, size: "wide", from: -8, height: 1.45, fov: fovMm(28), cInf: 1 }),
];
type Mood = "cheer" | "worry" | "smug" | "shock" | "sad" | "think";
const POSE: Record<Mood, { expr: NonNullable<K[number]["expr"]>; tilt: number; slump?: number; brow?: [number, number, number] }> = {
  cheer: { expr: "smile", tilt: 3, brow: [0, 0, 2] }, worry: { expr: "nervous", tilt: -5, slump: 0.3, brow: [0, -2, 0] }, smug: { expr: "proud", tilt: 4, brow: [-1, 0, 3] },
  shock: { expr: "shock", tilt: -6, brow: [-3, -1, 3] }, sad: { expr: "sad", tilt: 0, slump: 0.8, brow: [1, -3, 0] }, think: { expr: "thinking", tilt: 5, brow: [0, 2, 3] },
};
const keys = (m: Mood, n: number): K => [{ t: 0, expr: "neutral" }, { t: 0.45 + (n % 3) * 0.1, d: 0.34, ...POSE[m] }];
/** one shot per line: [narration, mum's mood, maya's mood, extra Line fields] */
const S: [string, Mood, Mood, Partial<Line>?][] = [
  // BEAT 1: the hook
  ["In my world, the toaster burns the last thing you say onto your toast.", "cheer", "cheer"],
  ["I'm Maya. I'm a terrible liar.", "cheer", "worry"],
  ["And this morning... I broke Mum's favourite mug.", "cheer", "shock", { pauses: [{ after: "morning...", s: 0.25 }], punch: true }],
  // BEAT 2: one funny example
  ["Last night, Mum said my drawing was amazing. Then she muttered something at the fridge.", "smug", "think"],
  ["This morning, her toast said... weird dog.", "shock", "cheer", { pauses: [{ after: "said...", s: 0.25 }], punch: true }],
  ["She ate it before anyone could read it.", "worry", "cheer"],
  // BEAT 3: stakes
  ["Mum reads everyone's toast out loud, at seven.", "smug", "worry"],
  ["Hers always says, good morning. Ten years, perfect toast.", "smug", "think"],
  ["She is very proud.", "smug", "worry"],
  ["It was six fifty-eight.", "think", "worry"],
  // BEAT 4: the secret practice (the planted skill)
  ["My secret? I whisper sorry to the toaster. Every morning. Out loud. For practice.", "cheer", "think"],
  ["Mum thinks it's silly.", "smug", "cheer"],
  ["But it's the only way I can say sorry without my voice shaking.", "think", "sad"],
  // BEAT 5: the big event and the public fail
  ["Then Mum found the mug.", "shock", "worry"],
  ["She held up the pieces. Maya, did you break this?", "shock", "worry", { punch: true }],
  ["I panicked. I said: I did not break your mug.", "sad", "shock", { punch: true }],
  ["Mum dropped bread in the toaster. Let's see what it says.", "smug", "sad"],
  ["And my lie was the last thing I'd said.", "think", "sad"],
  // BEAT 6: the loophole payoff
  ["But the toaster burns the last thing you say.", "think", "think", { punch: true }],
  ["The last. So I kept talking.", "think", "cheer"],
  ["I whispered my practised sorry. Every word. To Mum.", "worry", "sad"],
  ["The toast popped.", "shock", "worry", { punch: true }],
  ["It said: sorry Mum, it was me.", "shock", "cheer", { punch: true }],
  // BEAT 7: the role reversal (clean cut, no call to action)
  ["Mum read it twice.", "sad", "worry"],
  ["Then she walked to the toaster. Dropped in her own bread.", "think", "cheer"],
  ["And whispered, very quietly, the one thing she had never said out loud.", "sad", "think"],
  ["Her toast said: I love the weird dog.", "cheer", "cheer", { punch: true }],
];
/** a long line gets a hard cut to a new angle on its words (about every 2 s), so something changes every 1.5-2.0 s: [camera beats] */
const beats = (text: string, i: number) => {
  const toks = text.split(/\s+/).filter(Boolean), n = toks.length;
  if (n < 8) return {};
  const cuts = n >= 14 ? [0.3, 0.55, 0.8] : n >= 10 ? [0.4, 0.75] : [0.55];
  const first = CAMS[i % CAMS.length]();
  const cams = [{ t: 0, ...first, blockOk: true }, ...cuts.map((f, j) => {
    const idx = Math.min(n - 1, Math.floor(n * f)), w = toks[idx].replace(/[^A-Za-z0-9']+/g, ""), occ = toks.slice(0, idx + 1).filter((x) => x.replace(/[^A-Za-z0-9']+/g, "").toLowerCase() === w.toLowerCase()).length;
    return { word: w, n: occ, ...CAMS[(i + j + 1) % CAMS.length](), cut: true, blockOk: true };
  })];
  return { cams } as { cams: NonNullable<Storyboard["shots"][number]["cams"]> };
};
const base = { set: "e4Kitchen", light: "interior" as const, ambience: "elb_kitchen_day" as const, props: [] };

export const IN_MY_WORLD_1: Storyboard = {
  id: "in-my-world-1", title: "In my world, the toaster burns the last thing you say",
  cast: { mum: "mum", maya: "bug" },
  voice: "georgeHushed", narration: "continuous",
  captionStyle: "viral", captionKeys: ["Maya", "toast", "mug", "drawing", "toaster", "sorry", "lie"],
  // Morning Mood (public domain, assets/music) for the cheerful beats; dead silence + a sub-bass hit on the panic; it comes back on the pop
  music: { file: "morning-mood", gain: 2.5, cuts: [{ at: { word: "panicked." }, resume: { word: "popped." }, sub: true }] },
  engine: 4, motionBlur: true, controlledBlur: true,
  clarity: {
    premise: "In Maya's world the toaster burns the last thing you say onto your toast, so when she lies about a broken mug she keeps talking and whispers the sorry she has practised until the toast tells the truth.",
    facts: [
      { fact: "the rule", said: "the toaster burns the last thing you say onto your toast" },
      { fact: "her weakness", said: "I'm a terrible liar" },
      { fact: "the problem", said: "I broke Mum's favourite mug" },
      { fact: "a funny example", said: "her toast said" },
      { fact: "the secret practice", said: "I whisper sorry to the toaster" },
      { fact: "the loophole", said: "the toaster burns the last thing you say" },
      { fact: "the payoff", said: "sorry Mum, it was me" },
    ],
  },
  shots: S.map(([text, mm, ym, extra], i) => ({
    ...base, camera: CAMS[i % CAMS.length](), say: { text, who: "narrator", ...extra } as Line, hold: 0.05, ...beats(text, i), ...(extra?.punch ? { kicks: [0.04] } : {}), ...(text.includes("weird dog") && text.startsWith("This") ? { sfx: [{ word: "dog", name: "boing" as const, gain: -5 }] } : {}),
    actors: [{ who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const, keys: keys(mm, i) }, { who: "maya", at: MAYA, act: "neutral" as const, facing: "camera" as const, keys: keys(ym, i + 1) }],
    note: `line ${i + 1}`,
  })),
};
