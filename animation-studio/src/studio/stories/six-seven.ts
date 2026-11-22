// "6 7" (productions/six-seven/script.md, approved by the owner): the owner's own story and humour. Three mates at
// Glendon's place, a Ouija board that keeps spelling 6 7, and Isaac, who won't stop doing the bit.
// Built to the format system (CLAUDE.md): motion and a two-line banner on frame 0.00 (the ending first), a visual change
// every ~1.8 s, six lighting setups (the cosy living room, Isaac's phone, the red jump scare, candlelight over the board,
// lights off with torches, the floating in a cold glow), 40-70 s. Every close-up uses the new lens blur and creep.
// Reuses the everyday apartment's living room.
import type { Storyboard, Line, ShotSpec, PropSpec } from "../story/types";

type V = [number, number, number];
/** a hand-placed camera; close shots get the background blur, every shot creeps */
const at = (pos: V, look: V, fov: number, blur = 0, creep = 0.06, roll = 0) => ({ move: "at" as const, pos, look, fov, blur, creep, roll });
type Cam = ReturnType<typeof at>;
type When = { t: number } | { word: string };
const cuts = (first: Cam, ...more: (When & { c: Cam })[]) =>
  ({ camera: first, cams: [{ t: 0, ...first, blockOk: true }, ...more.map((m) => ("word" in m ? { word: m.word, ...m.c, blockOk: true } : { t: m.t, ...m.c, blockOk: true }))] });
const N = (text: string): Line => ({ text, who: "narrator" });
const me = (text: string): Line => ({ text, who: "ssMe" });
const phone = (text: string): Line => ({ text, who: "narrator", voice: "ssPhone" });
const isaac = (tag: string, text: string): Line => ({ text: `[${tag}] ${text}`, who: "narrator", voice: "ssIsaac", sub: text });
const isaacLast = (text: string): Line => ({ text: `[strangled, choking] ${text}`, who: "narrator", voice: "ssIsaacMuffled", sub: text });
const glendon = (text: string): Line => ({ text: `[panicked shouting] ${text}`, who: "narrator", voice: "ssGlendon", sub: text });
const CARD: V = [-2.6, 1.4, 4.2], CARD_CAM = at([-2.6, 1.4, 5.2], CARD, 51, 0, 0), CARD_IN = at([-2.6, 1.4, 4.85], CARD, 51, 0, 0);
const insert = (variant: string, note: string, extra: Partial<ShotSpec>, steps: When[], push = true): ShotSpec =>
  ({ ...ROOM, light: "night", ...(push ? { camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }, { t: 0.1, ...CARD_IN, glide: 6, blockOk: true }] } : { camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }] }),
    actors: [], props: [{ id: "ssInsert", at: CARD, variant, steps }], note, ...extra });
const ROOM = { set: "apartment", light: "interior" as const, ambience: "elb_house_night" as const };
const DARK = { ...ROOM, light: "night" as const };
const NIGHT_WIN: PropSpec = { id: "ssNight", at: [-2.6, 1.625, -2.594], steps: [{ t: -0.7 }] };
const BOARD = (variant: "rest" | "wander" | "loop" = "rest", steps: When[] = [{ t: 99 }]): PropSpec => ({ id: "ssBoard", variant, at: [-2.6, 0.42, -0.75], steps });
const DREAD = (look: V, fov: number, variant: "soft" | "heavy" | "dark" = "soft"): PropSpec => ({ id: "bfDread", at: look, variant, scale: fov / 100, steps: [{ t: 99 }] });
const RED = (look: V, fov: number): PropSpec => ({ id: "ntRed", at: look, scale: fov / 100, steps: [{ t: -0.7 }] });
const FLICK = (look: V, fov: number, ts: number[]): PropSpec => ({ id: "ntFlicker", at: look, scale: fov / 100, steps: ts.map((t) => ({ t })) });
const COLD = (look: V): PropSpec => ({ id: "timeTint", at: look, steps: [{ t: -0.7 }] });
const GOLD = (look: V): PropSpec => ({ id: "memTint", at: look, variant: "gold", steps: [{ t: -0.7 }] });
const every = (t0: number, dt: number, n: number): When[] => Array.from({ length: n }, (_, i) => ({ t: t0 + i * dt }));
// the sofa (facing the camera, seat top 0.58) and the coffee table in front of it (top 0.42, z -0.75)
const SEAT_ME: V = [-3.2, 0.55, -1.82], SEAT_ISAAC: V = [-2.6, 0.55, -1.82], SEAT_GLEN: V = [-2.0, 0.55, -1.82];
const FLOAT: V = [-3.05, 0.75, -1.62];
const ISAAC_FACE: V = [-2.6, 1.18, -1.82], ME_FACE: V = [-3.2, 1.18, -1.82], GLEN_FACE: V = [-2.0, 1.25, -1.82];

export const SIX_SEVEN: Storyboard = {
  id: "six-seven", title: "6 7",
  cast: { ssMe: "ssMe", ssIsaac: "ssIsaac", ssGlendon: "ssGlendon" },
  voice: "ssMe", voices: { ssMe: "ssMe" },
  captionColors: { ssMe: "#9be38f", ssIsaac: "#ffd65a", ssIsaacMuffled: "#ffd65a", ssGlendon: "#ff9a52", ssPhone: "#e9edf5" },
  // the score (sound/samples/music/sixseven_score.json: nine sections written to these timings): a horror hit for the
  // cold open, a lazy lo-fi beat for the chill, a stab for the jump scare, creeping strings for the board, a wonky
  // tense pulse under Isaac's bit, a build as it gets out of control, near silence as the lights die, terror for the
  // floating, a held note that stops dead on "7"
  music: { file: "sixseven_score", gain: 0, duck: -5, curve: [[0, -4], [3.8, -8], [13.2, -5], [16.9, -7], [44.0, -12], [47.0, -5], [54.2, -3], [56.8, -3], [57.25, -24]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "Three mates mess with a Ouija board, it keeps spelling 6 7, and Isaac won't stop doing the bit, until it's the last thing he ever says.",
    facts: [
      { fact: "the hook", said: "The last words that came out of my best friend's mouth." },
      { fact: "where and who", said: "We were chilling at Glendon's place." },
      { fact: "the board", said: "Then Glendon pulls out a Ouija board." },
      { fact: "it spells 6 7", said: "but goes to 6… and 7." },
      { fact: "the rule", said: "or else you'll get cursed." },
      { fact: "the spirit took over", said: "Then me and Glendon's hands move automatically." },
      { fact: "the payoff", said: "And his last words?" },
    ],
  },
  shots: [
    // ---- FRAME 0: the end first: Isaac in the air, choking, in the dark (setup 6: the cold glow)
    { say: N("“6 7.” The last words that came out of my best friend's mouth."), ...DARK, hold: 0.15,
      title: { text: "HIS LAST WORDS WERE…", sub: "“6 7”", instant: true },
      ...cuts(at([-2.9, 1.2, 0.9], [-3.05, 1.65, -1.62], 46, 10, 0.08, 4)),
      kicks: [0.05],
      actors: [{ who: "ssIsaac", at: FLOAT, act: "scared", face: "scared", keepFace: true, blink: false, facing: "camera", gesture: "coverMouth", idle: 0.6 }],
      props: [NIGHT_WIN, COLD([-3.05, 1.6, -1.62]), DREAD([-3.05, 1.65, -1.62], 46, "heavy")],
      sfx: [{ t: 0, name: "el_choke", gain: -4 }, { t: 0, name: "el_float_rise", gain: -8 }, { t: 0, name: "el_whispers_bed", gain: -10 }],
      note: "frame 0: in the dark, Isaac floats in the air, hands at his throat, choking, in a cold glow; the banner" },
    // ---- THE CHILL (setup 1: the cosy living room)
    { say: N("We were chilling at Glendon's place. In the living room, scrolling mindlessly."), ...ROOM, hold: 0.1, transition: "flash",
      ...cuts(at([-2.6, 1.45, 2.6], [-2.6, 0.95, -1.4], 46, 0, 0.05), { word: "living", c: at([-2.0, 1.15, 0.2], [-3.1, 1.05, -1.82], 40, 11) }, { word: "scrolling", c: at([-2.5, 1.18, -0.55], ISAAC_FACE, 36, 13) }),
      actors: [{ who: "ssMe", at: SEAT_ME, mode: "sit", act: "neutral", face: "sleepy", keepFace: true, facing: "camera", gesture: "read", hold: "phone" },
        { who: "ssIsaac", at: SEAT_ISAAC, mode: "sit", act: "happy", face: "grin", keepFace: true, facing: "camera", gesture: "read", hold: "phone" },
        { who: "ssGlendon", at: SEAT_GLEN, mode: "sit", act: "neutral", face: "neutral", keepFace: true, facing: "camera", gesture: "read", hold: "phone" }],
      props: [NIGHT_WIN, BOARD()], sfx: [{ t: 0, name: "phone_tap", gain: -14 }],
      note: "the three of them slumped on the sofa, faces lit by their phones; you, bored; Isaac (glasses), grinning at his phone" },
    insert("phone", "Isaac's phone: a cartoon cat bounced up and down, 'huss huss huss'", { say: phone("In this town, everyone is partying except for me. I'm locked in. HUSS HUSS HUSS HUSS."), hold: 0.1 },
      every(0.2, 0.32, 30)),
    // ---- THE BOARD (setup 3: the red jump scare)
    { say: N("Then Glendon pulls out a Ouija board."), ...ROOM, hold: 0.1,
      ...cuts(at([-2.9, 1.2, 0.0], [-3.1, 1.12, -1.82], 40, 11), { word: "pulls", c: at([-2.0, 1.45, 0.75], [-2.0, 1.4, -0.45], 48, 0, 0.12, -5) }),
      kicks: [{ word: "pulls" }],
      actors: [{ who: "ssMe", at: SEAT_ME, mode: "sit", act: "neutral", face: "sleepy", keepFace: true, facing: "camera", gesture: "read", hold: "phone" },
        { who: "ssGlendon", at: [-2.0, 0, -0.45], act: "happy", face: "grin", keepFace: true, blink: false, facing: "camera", gesture: "hold", hold: "ouijaBoard" }],
      props: [NIGHT_WIN, RED([-2.0, 1.4, -0.45], 48)], sfx: [{ word: "pulls", name: "el_jumpscare" }],
      note: "you, scrolling; then, out of nowhere, Glendon's face right in the lens, lit red from below, holding up a Ouija board" },
    { say: me("Geez, don't scare me like that."), ...ROOM, hold: 0.15, ...cuts(at([-3.05, 1.18, -0.75], ME_FACE, 36, 13)),
      actors: [{ who: "ssMe", at: SEAT_ME, mode: "sit", act: "shock", face: "shock", facing: "camera", gesture: "coverMouth" }],
      props: [], sfx: [{ t: 0.1, name: "el_whispers_bed", gain: -12 }], note: "you, clutching your chest" },
    // ---- THE SPIRIT (setup 4: candlelight)
    { say: N("Then all three of us hold on to the thing that goes on the Ouija board."), ...DARK, hold: 0.1,
      ...cuts(at([-2.6, 1.5, 1.5], [-2.6, 0.9, -1.4], 46, 6, 0.06), { word: "thing", c: at([-2.6, 1.15, 0.05], [-2.6, 0.45, -0.75], 40, 12, 0.08) }),
      actors: [{ who: "ssMe", at: SEAT_ME, mode: "sit", act: "nervous", face: "nervous", keepFace: true, facing: "camera", gesture: "operate" },
        { who: "ssIsaac", at: SEAT_ISAAC, mode: "sit", act: "happy", face: "grin", keepFace: true, facing: "camera", gesture: "operate" },
        { who: "ssGlendon", at: SEAT_GLEN, mode: "sit", act: "neutral", face: "suspicious", keepFace: true, facing: "camera", gesture: "operate" }],
      props: [BOARD(), GOLD([-2.6, 0.9, -1.4]), DREAD([-2.6, 0.9, -1.4], 46)], sfx: [{ t: 0, name: "el_whispers_bed", gain: -10 }],
      note: "candlelight; the three of them lean over the coffee table, hands out to the board" },
    insert("board3", "three hands on the planchette: it slides round the letters, then to 6, then to 7", {
      say: N("It floats around all of the letters… but goes to 6… and 7."), hold: 0.25,
      sfx: [{ t: 0, name: "el_planchette" }, { word: "6", name: "el_hit_sub", gain: -8 }, { word: "7", name: "el_hit_boom", gain: -6 }] },
      [...every(0.15, 0.32, 7), { word: "6" }, { word: "7" }], false),
    // ---- THE BIT
    { say: { ...isaac("laughing hysterically", "67! 67! 67! 67!"), gap: 0.1 }, ...DARK, hold: 0.1,
      ...cuts(at([-2.55, 1.1, -0.15], [-2.6, 0.95, -1.82], 44, 10, 0.05), { t: 1.3, c: at([-2.6, 1.3, 0.3], [-2.6, 1.0, -1.82], 44, 8, 0.05, 4) },
        { t: 2.7, c: at([-3.05, 1.18, -0.75], ME_FACE, 36, 13, 0.06) }, { t: 4.0, c: at([-2.5, 1.05, -0.3], [-2.6, 0.95, -1.82], 40, 11, 0.08, -4) }),
      actors: [{ who: "ssIsaac", at: SEAT_ISAAC, mode: "sit", act: "laugh", face: "laugh", keepFace: true, facing: "camera", gesture: "sixSeven" },
        { who: "ssMe", at: SEAT_ME, mode: "sit", act: "neutral", face: "suspicious", keepFace: true, facing: "toward:ssIsaac", gesture: "operate" },
        { who: "ssGlendon", at: SEAT_GLEN, mode: "sit", act: "nervous", face: "nervous", keepFace: true, facing: "toward:ssIsaac", gesture: "operate" }],
      props: [NIGHT_WIN, DREAD([-2.6, 1.0, -1.82], 44)],
      note: "Isaac yanks his hand off the board, laughing, doing the 6 7 hands" },
    { say: me("Isaac, stop playing around mate. You're not supposed to have your hands off the thing, or else you'll get cursed."), ...DARK, hold: 0.1,
      ...cuts(at([-3.0, 1.2, -0.65], ME_FACE, 38, 13, 0.05), { word: "hands", c: at([-2.55, 1.2, -0.45], ISAAC_FACE, 38, 12, 0.04) }, { word: "cursed", c: at([-2.6, 0.95, -0.2], [-2.6, 0.43, -0.75], 40, 12, 0.1) }),
      actors: [{ who: "ssMe", at: SEAT_ME, mode: "sit", act: "angry", face: "stern", facing: "camera", gesture: "operate" },
        { who: "ssIsaac", at: SEAT_ISAAC, mode: "sit", act: "laugh", face: "laugh", keepFace: true, facing: "camera", gesture: "sixSeven" }],
      props: [NIGHT_WIN, BOARD(), DREAD(ME_FACE, 38)], sfx: [{ word: "cursed", name: "el_sting_strings", gain: -8 }],
      note: "you, close, telling him off; Isaac, still doing it; the board, still" },
    // ---- OUT OF CONTROL
    insert("board2", "your hand and Glendon's dragged by the planchette: 6, 7, 6, 7, faster and faster", {
      say: N("Then me and Glendon's hands move automatically. Going through 6 7. Again. And again."), hold: 0.05,
      sfx: [{ t: 0, name: "el_planchette" }, { t: 1.5, name: "el_planchette", gain: -3 }, { t: 0, name: "el_heartbeat_fast", gain: -8 }] },
      every(0.3, 0.42, 4).concat(every(2.0, 0.26, 10)), false),
    { say: glendon("STOP IT, it's getting out of control!!!"), ...DARK, hold: 0.05, ...cuts(at([-2.1, 1.25, -0.6], GLEN_FACE, 38, 13, 0.1, -4)),
      kicks: [0.1, 0.9],
      actors: [{ who: "ssGlendon", at: SEAT_GLEN, mode: "sit", act: "scared", face: "shock", keepFace: true, facing: "camera", gesture: "operate" }],
      props: [GOLD(GLEN_FACE), DREAD(GLEN_FACE, 38, "heavy")], note: "Glendon, close, panicking" },
    // ---- LIGHTS OFF (setup 5: torches in the dark)
    { say: [N("The lights go off."), { ...N("And Isaac's still laughing."), gap: 0.35 }], ...DARK, hold: 0.1,
      ...cuts(at([-2.6, 1.6, 1.6], [-2.6, 0.9, -1.5], 48, 0, 0.05), { word: "Isaac's", c: at([-2.5, 1.18, -0.5], ISAAC_FACE, 36, 13, 0.06) }),
      actors: [{ who: "ssIsaac", at: SEAT_ISAAC, mode: "sit", act: "laugh", face: "laugh", keepFace: true, facing: "camera", gesture: "sixSeven" },
        { who: "ssMe", at: SEAT_ME, mode: "sit", act: "scared", face: "scared", keepFace: true, facing: "camera", gesture: "hang" },
        { who: "ssGlendon", at: SEAT_GLEN, mode: "sit", act: "scared", face: "scared", keepFace: true, facing: "camera", gesture: "hang" }],
      props: [NIGHT_WIN, BOARD(), FLICK([-2.6, 0.9, -1.5], 48, [0.05, 0.4]), DREAD([-2.6, 1.0, -1.6], 48, "dark")],
      sfx: [{ t: 0.1, name: "el_lights_off" }, { t: 1.0, name: "el_torch_click" }, { word: "Isaac's", name: "el_teen_laugh", gain: -4 }],
      note: "the lights die; torchlight; Isaac, still laughing in the dark, still doing the hands" },
    // ---- THE END (setup 6: the cold glow)
    { say: N("Then all of a sudden, his neck starts choking. He holds onto it… and he floats in the air."), ...DARK, hold: 0.15,
      ...cuts(at([-2.95, 1.2, -0.3], [-3.05, 1.1, -1.62], 38, 13, 0.06), { word: "holds", c: at([-3.0, 1.15, -0.4], [-3.05, 1.05, -1.62], 34, 14, 0.08) }, { word: "floats", c: at([-2.9, 1.2, 0.9], [-3.05, 1.6, -1.62], 46, 8, 0.1, 5) }),
      actors: [{ who: "ssIsaac", at: [-3.05, 0, -1.62], act: "scared", face: "scared", keepFace: true, blink: false, facing: "camera", gesture: "coverMouth",
        walk: { to: FLOAT, t0: 2.6, t1: 4.6 } }],
      props: [NIGHT_WIN, COLD([-3.05, 1.3, -1.62]), DREAD([-3.05, 1.3, -1.62], 40, "heavy")],
      sfx: [{ t: 0.2, name: "el_choke" }, { word: "floats", name: "el_float_rise" }], note: "torchlight on Isaac: hands at his throat, choking; his feet leave the floor; he rises" },
    { say: { ...N("And his last words?"), gap: 0.6 }, ...DARK, hold: 0.1,
      ...cuts(at([-3.05, 1.18, -0.75], ME_FACE, 36, 13, 0.08), { t: 0.45, c: at([-2.15, 1.22, -0.65], GLEN_FACE, 36, 13, 0.08) }),
      kicks: [0.02],
      actors: [{ who: "ssMe", at: SEAT_ME, mode: "sit", act: "scared", face: "shock", keepFace: true, facing: "camera", gesture: "hang" },
        { who: "ssGlendon", at: SEAT_GLEN, mode: "sit", act: "scared", face: "shock", keepFace: true, facing: "camera", gesture: "hang" }],
      props: [COLD(ME_FACE), DREAD(ME_FACE, 36, "heavy")], sfx: [{ t: 0, name: "el_group_scream" }],
      note: "you and Glendon, screaming" },
    { say: { ...isaacLast("6… 7…"), gap: 0.2 }, ...DARK, hold: 0.25,
      ...cuts(at([-2.9, 1.2, 0.9], [-3.05, 1.65, -1.62], 46, 10, 0.1, 4)),
      actors: [{ who: "ssIsaac", at: FLOAT, act: "scared", face: "scared", keepFace: true, blink: false, facing: "camera", gesture: "coverMouth", idle: 0.6 }],
      props: [NIGHT_WIN, COLD([-3.05, 1.6, -1.62]), DREAD([-3.05, 1.65, -1.62], 46, "heavy")], sfx: [{ t: 0, name: "el_choke", gain: -6 }],
      note: "back to the first frame: Isaac in the air, his last words, muffled; cut to black on '7'" },
  ],
};
