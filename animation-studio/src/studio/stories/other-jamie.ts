// The Other Jamie (productions/other-jamie/script.md, approved at dceca72): a horror thriller with an A/B ending. Sam
// narrates in the first person (Astro); Jamie is Toby; the thing in the woods speaks in Sam's own voice, slow and
// flat. Staging rules: every clue is a picture (the text, the left hand, the faces in the mirrors, the poster, the
// FOR ELLIE sign); the copy is warm and lit, the real Jamie is only ever seen behind glass; the thing moves a beat
// after Sam does; the woods are dark except for Sam's torch.
import type { Storyboard, ShotSpec, When, Line } from "../story/types";

type V3 = [number, number, number];
const at = (pos: V3, look: V3, fov: number) => ({ move: "at" as const, pos, look, fov });
const glide = (p0: V3, l0: V3, f0: number, p1: V3, l1: V3, f1: number, dur: number) =>
  ({ camera: at(p0, l0, f0), cams: [{ t: 0, ...at(p0, l0, f0), blockOk: true }, { t: 0.1, ...at(p1, l1, f1), glide: dur, blockOk: true }] });
const STILL: When[] = [{ t: -0.7 }];
const STEADY: When[] = Array.from({ length: 80 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const POUND: When[] = Array.from({ length: 30 }, (_, i) => ({ t: -0.2 + i * 0.26 }));       // fists on the glass
const SLOWFADE: When[] = Array.from({ length: 30 }, (_, i) => ({ t: -1.5 + i * 0.35 }));
const STREET = { set: "alderRow", light: "night" as const }, WOODS = { set: "ashbyWoods", light: "night" as const };
const DUSK = { set: "ashbyWoods", light: "golden" as const }, DAWN = { set: "ashbyWoods", light: "day" as const };
const HOME = { set: "home", light: "interior" as const }, SCHOOL = { set: "classroom", light: "interior" as const };
const sam = (text: string): Line => ({ text, who: "samOJ", voice: "samLine" });
const jamie = (text: string, voice = "jamieCopy"): Line => ({ text, who: "jamie", voice });
const it = (text: string): Line => ({ text, voice: "itVoice" });

// ---------------------------------------------------------------- places
// Alder Row: the bench on the pavement under a street lamp; the Mill Lane lamppost across the road; number 9's door
const BENCH: V3 = [-3.2, 0.46, 5.25], SAM_BENCH: V3 = [-3.58, 0, 5.3], JAMIE_BENCH: V3 = [-2.82, 0, 5.3];
const PHONE_AT: V3 = [-3.55, 0.95, 6.3];
const phone = (v: string, steps: When[] = STILL) => ({ id: "jamiePhone", at: PHONE_AT, variant: v, steps });
const phoneCam = at([-3.55, 0.95, 6.74], PHONE_AT, 40);
const POSTER: V3 = [3.4, 1.65, 13.25];
// Ashby Woods: the clearing, Jamie's mirror, the others, the thing
const JAMIE_MIRROR: V3 = [1.3, 1.85, -2.4], SAM_WOODS: V3 = [0.9, 0, 1.2], THING_BEHIND: V3 = [0.35, 0, 3.6];
const MIRRORS = [
  { id: "hangingMirror", at: [-2.0, 2.0, -1.6] as V3, variant: "teacher", yaw: 25, steps: STEADY },
  { id: "hangingMirror", at: [-0.7, 2.3, -3.6] as V3, variant: "man", yaw: 8, steps: STEADY },
  { id: "hangingMirror", at: [2.5, 2.05, -1.5] as V3, variant: "woman", yaw: -30, steps: STEADY },
  { id: "hangingMirror", at: [-1.7, 1.75, -4.2] as V3, variant: "old", yaw: 15, steps: STEADY },
  { id: "hangingMirror", at: [2.9, 2.45, -3.4] as V3, variant: "empty", yaw: -20, steps: STEADY },
];
const jamieMirror = (v = "jamie", steps: When[] = POUND) => ({ id: "hangingMirror", at: JAMIE_MIRROR, variant: v, yaw: -10, steps });
const beam = (who: string, near: V3 = [0.6, 1.2, 2.0]) => ({ id: "torchBeam", at: near, track: { who, offset: [0.25, 0.3] as [number, number] }, steps: STILL });
const thing = (where: V3, v = "sam", steps: When[] = STILL, yaw = 180) => ({ id: "mirrorThing", at: where, variant: v, yaw, steps });
const CAST: Record<string, string | { extra: number; era: "modern" }> = { samOJ: "samOJ", jamie: "jamie", jamieMud: "jamieMud", brother: "brother", schoolKid: "schoolKid" };
for (let k = 0; k < 4; k++) CAST[`s${k}`] = { extra: 500 + k, era: "modern" };

const shots: ShotSpec[] = [
  // ======== 1: the hook. The text from Jamie, who is sitting right next to Sam
  { ...STREET, dur: 1.9, camera: phoneCam, actors: [], props: [phone("hook")], sfx: [{ t: 0.05, name: "phone_buzz" }], note: "1 the text" },
  { say: { text: "My best friend texted me.", who: undefined }, ...STREET,
    camera: { move: "frame", on: ["samOJ"], size: "close", from: 10 },
    actors: [{ who: "samOJ", at: SAM_BENCH, mode: "sit", act: "nervous", facing: "camera", hold: "phone", beats: [{ t: 0.5, look: "right" }] }, { who: "jamie", at: JAMIE_BENCH, mode: "sit", act: "happy", facing: "camera", hold: "chips" }],
    props: [{ id: "snapChair", at: BENCH, variant: "bench" }], note: "1 Sam turns" },
  { say: "He was sitting right next to me.", ...STREET,
    camera: { move: "frame", on: ["jamie"], size: "close", from: -20 },
    actors: [{ who: "jamie", at: JAMIE_BENCH, mode: "sit", act: "happy", facing: "toward:samOJ", hold: "chips", gesture: "eat", beats: [{ t: 0.9, look: "camera" }] }, { who: "samOJ", at: SAM_BENCH, mode: "sit", act: "nervous", facing: "toward:jamie", hold: "phone" }],
    props: [{ id: "snapChair", at: BENCH, variant: "bench" }], note: "1 Jamie, chips, smiling" },
  // ======== 2: the woods; he walks out
  { say: "Three weeks ago, Jamie got lost in Ashby Woods.", ...WOODS,
    ...glide([1.6, 1.3, 12.5], [0, 1.4, 2], 50, [1.2, 1.2, 10.5], [0, 1.4, 1], 46, 3.0),
    actors: [{ who: "s0", at: [-1.6, 0, 6], hold: "flashlight", act: "nervous", walk: { to: [-2.0, 0, 2], t0: 0, t1: 2.9 } }, { who: "s1", at: [0.6, 0, 7.4], hold: "flashlight", act: "nervous", walk: { to: [0.4, 0, 3.2], t0: 0.2, t1: 2.9 } },
      { who: "s2", at: [2.4, 0, 6.2], hold: "flashlight", act: "sad", walk: { to: [2.7, 0, 2.6], t0: 0.1, t1: 2.9 } }],
    props: [beam("s1", [0.5, 1.2, 4.9])], note: "2 the search" },
  { say: "He walked out the next morning. No phone. No memory of that night.", ...DAWN,
    camera: at([0.9, 1.4, 23.5], [0.4, 1.3, 15], 40),
    actors: [{ who: "jamieMud", at: [0.4, 0, 9.5], act: "dazed", walk: { to: [0.4, 0, 16.6], t0: 0.1, t1: 3.6, view: "front" } }], note: "2 dawn: he walks out" },
  // ======== 3: different
  { say: { text: "And he came back different.", who: undefined }, ...SCHOOL, hold: 0.3,
    camera: at([0.3, 1.25, 2.55], [0.3, 1.25, 2.0], 40), actors: [], props: [{ id: "leftHandCard", at: [0.3, 1.25, 2.0], steps: STILL }], note: "3 the left hand" },
  { ...HOME, dur: 1.7,
    camera: { move: "frame", on: ["jamie", "brother"], size: "medium", from: 20 },
    actors: [{ who: "jamie", at: "a", act: "happy", hold: "joystick", gesture: "offer", facing: "toward:brother", beats: [{ t: 0.9, hold: null }] }, { who: "brother", at: "b", act: "excited", facing: "toward:jamie", beats: [{ t: 0.9, hold: "joystick" }] }], note: "3 the console" },
  { say: "He said sorry to people.", ...SCHOOL,
    camera: { move: "frame", on: ["jamie", "schoolKid"], size: "medium", from: 25 },
    actors: [{ who: "jamie", at: "a", act: "embarrassed", gesture: "talk", facing: "toward:schoolKid" }, { who: "schoolKid", at: "b", act: "confused", facing: "toward:jamie" }], note: "3 sorry" },
  { say: "Jamie never said sorry.", ...SCHOOL,
    camera: { move: "frame", on: ["samOJ"], size: "close", from: -15 },
    actors: [{ who: "samOJ", at: "c", act: "suspicious", facing: "toward:jamie" }, { who: "jamie", at: "a", act: "happy", facing: "toward:schoolKid" }], note: "3 Sam watches" },
  // ======== 4: the summons
  { ...STREET, dur: 2.6, camera: phoneCam, actors: [], props: [phone("summons", [{ t: -0.7 }, { t: 0.15 }, { t: 0.95 }, { t: 1.75 }])],
    sfx: [{ t: 0.2, name: "phone_buzz" }, { t: 1.0, name: "phone_buzz" }, { t: 1.8, name: "phone_buzz" }], note: "4 three texts" },
  { say: [jamie("Who's that?"), sam("No one.")], ...STREET,
    camera: { move: "frame", on: ["samOJ", "jamie"], size: "medium", from: 0 },
    actors: [{ who: "jamie", at: JAMIE_BENCH, mode: "sit", act: "happy", facing: "toward:samOJ", hold: "chips" }, { who: "samOJ", at: SAM_BENCH, mode: "sit", act: "nervous", facing: "camera", hold: "phone", beats: [{ t: 0.9, look: "down" }] }],
    props: [{ id: "snapChair", at: BENCH, variant: "bench" }], note: "4 no one" },
  // ======== 5: the woods; the mirrors
  { say: "I thought something had stolen him.", ...WOODS, mood: "hush",
    camera: { move: "follow", on: "samOJ", size: "medium", from: 160 },
    actors: [{ who: "samOJ", at: [0.4, 0, 12], act: "scared", hold: "flashlight", walk: { to: [0.6, 0, 8.6], t0: 0.05, t1: 1.8, view: "back" } }], props: [beam("samOJ")], note: "5 into the woods" },
  { say: "Then I saw the mirrors. In every one, someone from our town.", ...WOODS,
    ...glide([0.4, 1.6, 6.4], [0.3, 2.0, -2.2], 70, [0.4, 1.65, 5.2], [0.3, 2.0, -2.4], 64, 4.0),
    actors: [], props: [...MIRRORS, jamieMirror("jamie", STILL.concat(POUND.slice(20)))], sfx: [{ t: 0.3, name: "sting_low", gain: -6 }], note: "5 the mirrors" },
  { say: "Even my maths teacher. I saw her this morning.", ...WOODS,
    ...glide([-1.95, 2.0, -0.2], [-2.4, 2.0, -1.2], 36, [-2.1, 2.0, -0.6], [-2.4, 2.0, -1.2], 32, 2.6), actors: [], props: [MIRRORS[0]], note: "5 Mrs Hale" },
  { ...WOODS, dur: 2.0,
    ...glide([1.15, 1.85, -0.9], JAMIE_MIRROR, 44, [1.22, 1.85, -1.5], JAMIE_MIRROR, 40, 1.8), actors: [], props: [jamieMirror()],
    sfx: [{ t: 0.1, name: "knock", gain: -4 }, { t: 0.9, name: "knock", gain: -4 }], note: "6 Jamie behind the glass" },
  // ======== 6: the thing
  { ...WOODS, dur: 2.4,
    camera: at([3.4, 1.4, -2.0], [0.6, 1.6, 2.4], 50),
    actors: [{ who: "samOJ", at: SAM_WOODS, act: "scared", hold: "flashlight", facing: -1 }],
    props: [thing(THING_BEHIND, "sam", [{ t: -0.7 }]), beam("samOJ")], sfx: [{ t: 0.4, name: "sting_low" }, { t: 0.4, name: "creak", gain: -8 }], note: "6 it steps out behind him" },
  { ...WOODS, dur: 1.2,
    camera: { move: "frame", on: ["samOJ"], size: "close", from: 170 },
    actors: [{ who: "samOJ", at: SAM_WOODS, act: "shock", hold: "flashlight", facing: 1, beats: [{ t: 0.2, look: "camera" }] }], props: [beam("samOJ")], note: "6 Sam turns" },
  { say: it("Hello, Sam. He talks about you."), ...WOODS, mood: "tense",
    ...glide([0.5, 0.7, 1.4], [0.35, 2.4, 3.6], 46, [0.5, 0.8, 1.9], [0.35, 2.5, 3.6], 40, 3.2),
    actors: [], props: [thing(THING_BEHIND, "sam", [{ t: -0.7 }, { t: 1.6 }, { t: 2.6 }])], note: "6 hello, Sam (in his voice)" },
  // ======== 7: what it did
  { say: [sam("Let him go.")], ...WOODS,
    camera: at([6.6, 1.7, 2.3], [0.6, 1.6, 2.4], 56),
    actors: [{ who: "samOJ", at: SAM_WOODS, act: "scared", hold: "flashlight", facing: 1, moves: [{ t: 0.2, kind: "recoil", dur: 0.6 }] }],
    props: [thing(THING_BEHIND, "sam", [{ t: -0.7 }, { t: 1.3 }])], note: "7 let him go (it tilts a beat later)" },
  { say: it("He came here crying. He said, take the part of me that did it."), ...WOODS,
    camera: at([0.45, 2.0, 1.9], [0.35, 2.65, 3.6], 34),
    actors: [], props: [thing(THING_BEHIND, "sam", [{ t: -0.7 }, { t: 0.8 }, { t: 1.8 }])], note: "7 he came here crying" },
  { say: it("So I took him."), ...WOODS,
    camera: at([0.45, 2.0, 1.9], [0.35, 2.65, 3.6], 30), actors: [], props: [thing(THING_BEHIND, "jamie", STEADY)], sfx: [{ t: 0.1, name: "knock", gain: -6 }], note: "7 its face: Jamie" },
  { say: it("And I sent back a Jamie who never did it."), ...WOODS,
    camera: { move: "overShoulder", over: "samOJ", at: "mirrorThing" },
    actors: [{ who: "samOJ", at: SAM_WOODS, act: "scared", hold: "flashlight", facing: 1 }], props: [thing(THING_BEHIND, "sam", [{ t: -0.7 }, { t: -0.6 }, { t: 0.4 }])], note: "7 its hand comes up" },
  // ======== 8: the rule; the clock
  { say: it("There can only be one Jamie. Bring me the other one, and they swap. One goes home. One stays behind the glass, forever."), ...WOODS,
    camera: at([1.4, 1.6, 0.4], [0.5, 1.9, 3.0], 44),
    actors: [{ who: "samOJ", at: SAM_WOODS, act: "scared", hold: "flashlight", facing: 1 }], cams: [{ t: 0, ...at([1.4, 1.6, 0.4], [0.5, 1.9, 3.0], 44), blockOk: true }, { t: 0.1, ...at([1.25, 1.65, 0.9], [0.5, 2.0, 3.0], 40), glide: 5.0, blockOk: true }, { word: "stays", ...at([1.2, 1.85, -1.3], JAMIE_MIRROR, 40) }],
    props: [thing(THING_BEHIND, "sam", [{ t: -0.7 }, { t: 2.0 }, { t: 3.6 }]), beam("samOJ"), jamieMirror()], note: "8 the swap" },
  { say: sam("I'll go to the police."), ...WOODS,
    camera: { move: "frame", on: ["samOJ"], size: "close", from: 160 },
    actors: [{ who: "samOJ", at: SAM_WOODS, act: "angry", hold: "flashlight", facing: 1 }], props: [beam("samOJ")], note: "8 police" },
  { say: it("Then they'll take the one who never did anything."), ...WOODS,
    camera: at([0.45, 2.0, 1.9], [0.35, 2.65, 3.6], 32), actors: [], props: [thing(THING_BEHIND, "sam", [{ t: -0.7 }, { t: 0.9 }])], note: "8 they'll take the one" },
  { say: it("Hurry. His glass is going dark."), ...WOODS,
    ...glide([1.2, 1.85, -1.2], JAMIE_MIRROR, 40, [1.26, 1.85, -1.7], JAMIE_MIRROR, 36, 2.6), actors: [], props: [jamieMirror("jamieFade", SLOWFADE)], note: "8 the glass fogs" },
  // ======== 9: what the real Jamie wants; what he did
  { ...STREET, dur: 3.2, camera: phoneCam, actors: [], props: [phone("real", [{ t: -0.7 }, { t: 0.3 }])], sfx: [{ t: 0.35, name: "phone_buzz" }], note: "9 get me out" },
  { ...STREET, dur: 2.6,
    ...glide([3.4, 1.6, 11.6], POSTER, 40, [3.4, 1.62, 12.35], POSTER, 38, 2.4), actors: [], props: [{ id: "appealPoster", at: POSTER, yaw: 180, steps: STILL }, { id: "streetLamp", at: [3.4, 0, 13.4] as V3 }], sfx: [{ t: 0.3, name: "sting_low", gain: -8 }], note: "9 the Mill Lane poster" },
  { say: "He wasn't sorry. He just wanted out.", ...WOODS,
    camera: { move: "frame", on: ["samOJ"], size: "close", from: 140 },
    actors: [{ who: "samOJ", at: SAM_WOODS, act: "sad", hold: "flashlight", facing: -1, beats: [{ t: 0.4, look: "down" }] }], props: [beam("samOJ")], note: "9 he wasn't sorry" },
  // ======== 10: the copy
  { say: jamie("It's for the girl from Mill Lane."), ...STREET, mood: "warm",
    camera: { move: "pov", from: "samOJ", at: "jamie" },
    actors: [{ who: "samOJ", at: [0.45, 0, 0.5], act: "sad", facing: "toward:jamie" }, { who: "jamie", at: [0.9, 0, 2.2], act: "happy", gesture: "hold", facing: "toward:samOJ" }],
    props: [{ id: "ellieSign", at: [0.9, 1.12, 1.82], yaw: 180, steps: STILL }, { id: "ellieJar", at: [1.18, 0.86, 1.86], steps: STILL }], note: "10 FOR ELLIE" },
  { say: jamie("I don't know why. I just feel like I owe her."), ...STREET,
    camera: { move: "frame", on: ["jamie"], size: "close", from: 180 },
    actors: [{ who: "jamie", at: [0.9, 0, 2.2], act: "sad", gesture: "hold", facing: "toward:samOJ" }, { who: "samOJ", at: [0.45, 0, 0.5], act: "sad", facing: "toward:jamie" }],
    props: [{ id: "ellieSign", at: [0.9, 1.12, 1.82], yaw: 180, steps: STILL }], note: "10 I owe her" },
  // ======== 11: the treeline
  { ...DUSK, dur: 2.6, mood: "hush",
    camera: at([0.9, 1.3, 25.5], [0.5, 1.5, 16], 44),
    actors: [{ who: "samOJ", at: [-0.2, 0, 21], act: "sad", walk: { to: [0.0, 0, 18.0], t0: 0.1, t1: 2.5, view: "back" } }, { who: "jamie", at: [1.0, 0, 21.3], act: "neutral", walk: { to: [1.0, 0, 18.3], t0: 0.1, t1: 2.5, view: "back" } }],
    props: [{ id: "hangingMirror", at: [0.5, 2.1, 15.8] as V3, variant: "jamieFade", steps: SLOWFADE.map((s) => ({ t: (s.t as number) - 4 })) }], note: "11 to the treeline" },
  { say: { text: "Sam? That's me, isn't it?", who: "narrator", voice: "jamieQuiet" }, ...DUSK,
    ...glide([0.6, 2.1, 17.0], [0.5, 2.1, 15.8], 36, [0.55, 2.1, 16.6], [0.5, 2.1, 15.8], 32, 2.4), actors: [], props: [{ id: "hangingMirror", at: [0.5, 2.1, 15.8] as V3, variant: "jamieFade", steps: SLOWFADE.map((s) => ({ t: (s.t as number) - 6 })) }], note: "11 that's me" },
  { say: jamie("It's okay, Sam. You choose.", "jamieQuiet"), ...DUSK,
    camera: { move: "frame", on: ["jamie", "samOJ"], size: "medium", from: 200 },
    actors: [{ who: "jamie", at: [1.0, 0, 18.3], act: "sad", facing: "toward:samOJ", beats: [{ t: 0.6, act: "relief" }] }, { who: "samOJ", at: [0.0, 0, 18.0], act: "sad", facing: "toward:jamie" }], note: "11 you choose" },
  // ======== 12-14: the choice
  { say: "If I bring back the real Jamie, my best friend comes home. But he'll lie about that girl forever, and this Jamie, who never hurt anyone, goes behind the glass.", ...DUSK,
    camera: { move: "frame", on: ["samOJ"], size: "close", from: 200 }, cams: [{ word: "this", move: "frame", on: ["jamie"], size: "close", from: 170 }, { word: "glass", ...at([0.5, 2.1, 16.7], [0.5, 2.1, 15.8], 36) }],
    actors: [{ who: "samOJ", at: [0.0, 0, 18.0], act: "sad", facing: "toward:jamie" }, { who: "jamie", at: [1.0, 0, 18.3], act: "neutral", facing: "toward:samOJ" }],
    props: [{ id: "hangingMirror", at: [0.5, 2.1, 15.8] as V3, variant: "jamieFade", steps: SLOWFADE.map((s) => ({ t: (s.t as number) - 7 })) }], note: "12 option A" },
  { say: "If I keep this Jamie, the real one, my friend since we were five, stays in the dark. Forever.", ...DUSK,
    camera: { move: "frame", on: ["jamie"], size: "close", from: 170 }, cams: [{ word: "dark", ...at([0.5, 2.1, 16.7], [0.5, 2.1, 15.8], 36) }],
    actors: [{ who: "jamie", at: [1.0, 0, 18.3], act: "happy", facing: "toward:samOJ" }, { who: "samOJ", at: [0.0, 0, 18.0], act: "sad", facing: "toward:jamie" }],
    props: [{ id: "hangingMirror", at: [0.5, 2.1, 15.8] as V3, variant: "jamieFade", steps: SLOWFADE.map((s) => ({ t: (s.t as number) - 9 })) }], note: "13 option B" },
  { say: "So what do I do?", ...DUSK,
    camera: { move: "frame", on: ["samOJ"], size: "close", from: 180 },
    actors: [{ who: "samOJ", at: [0.0, 0, 18.0], act: "sad", facing: "camera" }], note: "14 to the lens" },
  { say: "A: bring back the real Jamie. Or B: keep the one who never did it.", ...DUSK, hold: 1.6,
    camera: at([0, 1.5, 21.0], [0, 1.5, 20.0], 48), actors: [], props: [{ id: "choiceCards", at: [0, 1.5, 20.0], steps: STILL }], note: "14 A or B" },
];

export const OTHER_JAMIE: Storyboard = {
  id: "other-jamie", title: "The Other Jamie",
  cast: CAST, voice: "samNarr", music: { mood: "tense", gain: -3 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
