// The Man on the Last Train Has No Reflection. (productions/night-train/script.md, approved by the owner; the owner's
// own story). Part 1 of a vote series: a POV horror chase on the last train home.
// Built to the owner's format system (CLAUDE.md): motion and a two-line banner on frame 0.00; a visual change every
// 1.7-2.1 s (cuts inside shots on words); six lighting setups (the lit carriage, the dark window, the lights failing in
// the empty carriage, the strobing run, the red emergency lights, the foggy DEATH CITY platform); under 70 s.
import type { Storyboard, Line, ShotSpec, PropSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
type Cam = ReturnType<typeof at>;
const N = (text: string): Line => ({ text, who: "narrator" });
const whisper = (text: string): Line => ({ text, who: "narrator", voice: "ntManWhisper" });
/** the man screaming / shouting (eleven_v3 with an audio tag); the caption is the clean line */
const scream = (tag: string, text: string): Line => ({ text: `[${tag}] ${text}`, who: "narrator", voice: "ntManScream", sub: text });
const thought = (text: string): Line => ({ text, who: "narrator", voice: "ntThought" });
const announcer = (text: string): Line => ({ text, who: "narrator", voice: "ntAnnouncer" });
/** a shot's cameras: the first at t 0, then hard cuts at times or words */
type When = { t: number } | { word: string };
const cuts = (first: Cam, ...more: (When & { c: Cam })[]) =>
  ({ camera: first, cams: [{ t: 0, ...first, blockOk: true }, ...more.map((m) => ("word" in m ? { word: m.word, ...m.c, blockOk: true } : { t: m.t, ...m.c, blockOk: true }))] });
const glide = (a: Cam, b: Cam, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
const CARD: V = [0, 1.4, 9.4], CARD_CAM = at([0, 1.4, 10.4], CARD, 51), CARD_IN = at([0, 1.4, 10.05], CARD, 51);
const steady = (n: number, dt = 0.15) => Array.from({ length: n }, (_, i) => ({ t: -0.7 + i * dt }));
const OUT = (look: V): PropSpec => ({ id: "ntOutside", at: look, steps: steady(90) });
const DREAD = (look: V, fov: number, variant: "soft" | "heavy" | "dark" = "soft", on?: { t: number } | { word: string }): PropSpec => ({ id: "bfDread", at: look, variant, scale: fov / 100, steps: [on ?? { t: 99 }] });
const FLICK = (look: V, fov: number, ts: number[]): PropSpec => ({ id: "ntFlicker", at: look, scale: fov / 100, steps: ts.map((t) => ({ t })) });
const FRONT_DOOR = (steps: { t: number }[] = [{ t: 99 }]): PropSpec => ({ id: "ntEndDoor", variant: "front", at: [0, 0, -7], steps });
const BACK_DOOR = (steps: ({ t: number } | { word: string })[] = [{ t: 99 }]): PropSpec => ({ id: "ntEndDoor", variant: "back", at: [0, 0, 7], steps });
const SIDE_DOOR = (steps: { t: number }[] = [{ t: 99 }]): PropSpec => ({ id: "ntSideDoor", at: [1.43, 0, -6.3], yaw: -90, steps });
const insert = (variant: string, note: string, extra: Partial<ShotSpec>, steps?: ({ t: number } | { word: string })[], push = true): ShotSpec =>
  ({ set: "ntCarriage", light: "night", ambience: "elb_train_night", ...(push ? glide(CARD_CAM, CARD_IN, 6) : { camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }] }),
    actors: [], props: [{ id: "ntInsert", at: CARD, variant, steps: steps ?? [{ t: 99 }] }], note, ...extra });
const LIT = { set: "ntCarriage", light: "interiorCool" as const, ambience: "elb_train_night" as const };
const DARK = { set: "ntCarriage", light: "night" as const, ambience: "elb_train_night" as const };
// the marks: your bay (bay centre z 2.4, right side): the man on bench A facing you, you on bench B
const MAN_SEAT: V = [0.8, 0.45, 1.68], YOU_SEAT: V = [0.8, 0.45, 3.12];
const MAN_FACE: V = [0.8, 1.2, 1.68], YOU_FACE: V = [0.8, 1.12, 3.12];

export const NIGHT_TRAIN: Storyboard = {
  id: "night-train", title: "The Man on the Last Train Has No Reflection.",
  cast: { ntMan: "ntMan", ntYou: "ntYou" },
  voice: "georgeHushed", voices: { ntMan: "ntMan" },
  captionColors: { ntMan: "#ff6a5e", ntManScream: "#ff6a5e", ntManWhisper: "#ff6a5e", ntThought: "#fff2a8", ntAnnouncer: "#7dffa8" },
  // the score (sound/samples/music/nighttrain_score3.json, re-timed for the v3 reflection hook: ten sections written to these timings): a glassy
  // harmonic and heartbeat under the hook, a wheel-like pulsing drone under the man opposite, a glassy harmonic and heartbeat for the reflection, faster
  // pulsing as he follows, hollow wind in the empty train, pounding percussion for the run, near silence before the
  // jumpscare, a detuned chime for DEATH CITY, a held chord under the choice that stops dead
  music: { file: "nighttrain_score3", gain: 0, duck: -5, curve: [[0, -4], [7.1, -6], [37.1, -4], [40.1, -12], [45.7, -14], [48.7, -6], [54.9, -3], [62.6, -3], [62.95, -24]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "On the last train home, a man with no reflection follows you through an empty train, until the speakers announce a stop that doesn't exist.",
    facts: [
      { fact: "the situation", said: "Imagine you're on the last train home." },
      { fact: "the twist, at a glance", said: "the man across from you isn't in it." },
      { fact: "where he is", said: "He's on the three seats in front of you." },
      { fact: "the first wrong detail", said: "His coat is soaking wet. It hasn't rained all week." },
      { fact: "the impossible thing", said: "He has no reflection." },
      { fact: "he's coming after you", said: "He's following you." },
      { fact: "nobody can help", said: "It's just you… and him." },
      { fact: "the stop", said: "The next stop is… Death City." },
      { fact: "the stop is impossible", said: "You know the whole area. That doesn't exist." },
      { fact: "the choice", said: "Or stay on… with the man who has no reflection?" },
    ],
  },
  shots: [
    // ---- FRAME 0 (v3, the owner's note: the scream hook lost half the viewers): the missing reflection, at a glance
    insert("split", "frame 0: REAL above (you, and him facing you) / IN THE WINDOW below (you, and his seat empty)", {
      say: N("Imagine you're on the last train home."), hold: 0.05, title: { text: "HE HAS NO REFLECTION", sub: "THE LAST TRAIN · 9:47 PM", instant: true },
      // pulled back and raised a little, so the banner sits above the card and both panels stay clear
      camera: at([0, 1.6, 10.85], [0, 1.6, 9.4], 51), cams: [{ t: 0, ...at([0, 1.6, 10.85], [0, 1.6, 9.4], 51), blockOk: true }, { t: 0.1, ...at([0, 1.56, 10.7], [0, 1.56, 9.4], 51), glide: 2.0, blockOk: true }],
      sfx: [{ t: 0, name: "el_hit_boom", gain: -8 }, { t: 0, name: "el_heartbeat", gain: -8 }] }),
    insert("reflection", "the window: the bay in the glass, you on your seat, his seat EMPTY; a red ring pops round it", {
      say: N("Then you look at the window… and the man across from you isn't in it."), hold: 0.1,
      sfx: [{ t: 0, name: "el_reverse_swell", gain: -10 }, { word: "isn't", name: "el_sting_strings", gain: -8 }] }, [{ word: "isn't" }], false),
    { dur: 1.5, ...LIT, ...glide(at([0.8, 1.22, 2.6], MAN_FACE, 36), at([0.8, 1.21, 2.3], MAN_FACE, 32), 1.4),
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [OUT(MAN_FACE), DREAD(MAN_FACE, 36, "heavy"), FLICK(MAN_FACE, 36, [0.7])], sfx: [{ t: 0, name: "el_heartbeat", gain: -4 }, { t: 0.7, name: "el_lights_buzz", gain: -8 }],
      note: "a hard cut to him: silent, staring straight at you, no blink; the lights stutter" },
    { say: N("It's 9:47. He's on the three seats in front of you. Facing you. Staring right at you."), ...LIT, hold: 0.1,
      ...cuts(at([0, 1.6, -4.3], [0, 2.02, -6.99], 34), { word: "three", c: at([1.2, 1.65, 4.3], [0.8, 1.05, 1.68], 40) }, { word: "Staring", c: at([0.8, 1.22, 2.5], MAN_FACE, 32) }),
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" },
        { who: "ntYou", at: YOU_SEAT, mode: "sit", act: "scared", back: true, facing: "toward:ntMan" }],
      props: [OUT([0, 2.06, -6.99]), FRONT_DOOR(), DREAD(MAN_FACE, 42)], sfx: [{ t: 0, name: "el_counter_tick", gain: -10 }, { word: "Staring", name: "el_sting_strings", gain: -10 }],
      note: "the LED display over the end door: 21:47; over your shoulder: the man on the seats facing yours; his face: staring, unblinking" },
    { say: scream("shouting", "I was just going home! Just like you!"), ...LIT, hold: 0.1, ...cuts(at([0.85, 1.2, 2.45], MAN_FACE, 36), { t: 1.2, c: at([0.6, 0.95, 2.35], [0.8, 0.8, 1.7], 40) }),
      kicks: [0.1],
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "angry", face: "shock", keepFace: true, facing: "camera", gesture: "fists", blink: false }],
      props: [OUT(MAN_FACE), DREAD(MAN_FACE, 40)], note: "his face, shouting; his fists clenched on his knees" },
    { say: N("His coat is soaking wet. It hasn't rained all week."), ...LIT, hold: 0.1,
      camera: at([-0.15, 1.25, 3.5], [0.8, 0.75, 1.68], 46),
      cams: [{ t: 0, ...at([-0.15, 1.25, 3.5], [0.8, 0.75, 1.68], 46), blockOk: true }, { t: 0.6, ...at([0.5, 1.0, 2.95], [0.8, 0.62, 2.0], 40), glide: 1.3, blockOk: true },
        { word: "rained", ...CARD_CAM, blockOk: true }],
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [OUT([0.3, 1.0, 2.2]), { id: "ntDrips", at: [0.8, 0.5, 2.22], steps: steady(60) }, { id: "ntInsert", at: CARD, variant: "drip", steps: [{ t: 99 }] }],
      sfx: [{ t: 0.4, name: "el_drip_loud" }],
      note: "him, full body, still; the camera zooms into his coat: water dripping off the hem into a puddle; then the close-up of the drips" },
    // ---- THE REFLECTION (setup 2: the dark window)
    { say: N("You look at the window again."), ...LIT, hold: 0.05, ...glide(at([0.35, 1.2, 4.2], [1.2, 1.25, 3.0], 44), at([0.4, 1.2, 4.0], [1.25, 1.3, 2.9], 42), 1.5),
      actors: [{ who: "ntYou", at: YOU_SEAT, mode: "sit", act: "scared", face: "scared", keepFace: true, facing: 1, beats: [{ t: 0.2, look: "right" }] }],
      props: [OUT([1.2, 1.25, 3.0])], sfx: [{ t: 0, name: "el_breath_hold", gain: -6 }], note: "you turn your head to the dark window again" },
    insert("split", "REAL above: you and him facing you; IN THE WINDOW below: you and an empty seat", { say: [N("Still nothing."), { ...N("He has no reflection."), gap: 0.2 }], hold: 0.2,
      sfx: [{ t: 0.2, name: "el_heartbeat", gain: -6 }] }, undefined, false),
    // ---- YOU MOVE (setup 3: the lights failing)
    { say: [N("You think to yourself…"), { ...thought("Don't look at him. Just get up. Walk."), gap: 0.15 }], ...DARK, hold: 0.05,
      ...cuts(at([-0.2, 1.65, 6.3], [0.35, 1.0, 0.5], 48), { word: "Just", c: at([0.35, 1.18, 2.45], YOU_FACE, 38) }),
      actors: [{ who: "ntYou", at: YOU_SEAT, mode: "sit", act: "scared", face: "scared", keepFace: true, facing: "camera", beats: [{ t: 0.8, look: "left" }, { t: 1.4, look: "right" }] },
        { who: "ntMan", at: MAN_SEAT, mode: "sit", act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "toward:ntYou", gesture: "hang" }],
      props: [OUT([0.35, 1.0, 0.5]), FLICK([0.35, 1.0, 0.5], 48, [0.1, 0.7, 2.0]), DREAD([0.35, 1.0, 0.5], 48)], sfx: [{ t: 0, name: "el_lights_buzz" }, { t: 0.3, name: "el_breath_heavy", gain: -6 }],
      note: "the carriage, the lights stuttering; your face, eyes darting" },
    { dur: 2.0, ...DARK, ...glide(at([0.45, 1.45, -4.4], [0, 1.15, -7.0], 46), at([0.4, 1.45, -4.8], [0, 1.15, -7.0], 46), 2.0),
      actors: [{ who: "ntYou", at: [0.1, 0, -5.0], act: "scared", gesture: "hang", walk: { to: [0, 0, -7.5], t0: 0.1, t1: 1.9, view: "back" } }],
      props: [OUT([0, 1.15, -7.0]), FRONT_DOOR([{ t: 0.2 }, { t: 1.5 }]), DREAD([0, 1.15, -7], 46)], sfx: [{ t: 0.2, name: "el_train_doors" }, { t: 1.5, name: "el_train_doors", gain: -6 }],
      note: "you walk away fast; the end door slides open; you go through; it slides shut" },
    { say: N("Behind you, the door slides open again. He's following you."), ...DARK, hold: 0.1,
      ...cuts(at([-0.15, 1.35, 3.9], [0.05, 1.3, 7.2], 40), { word: "following", c: at([-0.1, 1.55, 5.6], [0, 1.62, 7.45], 32) }),
      actors: [{ who: "ntYou", at: [0.3, 0, 5.0], act: "scared", face: "scared", keepFace: true, facing: "camera", gesture: "hang", beats: [{ word: "door", look: "right" }] },
        { who: "ntMan", at: [0, 0, 7.45], act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [OUT([0.05, 1.3, 7.2]), BACK_DOOR([{ word: "door" }]), DREAD([0, 1.3, 7], 40), FLICK([0, 1.3, 7], 40, [0.2])], sfx: [{ word: "door", name: "el_train_doors" }, { word: "following", name: "el_sting_strings", gain: -6 }],
      note: "the next carriage: behind you the end door slides open again: he's standing in the gangway" },
    { say: N("And then you notice: this carriage is empty."), ...DARK, hold: 0.1, ...cuts(at([-0.3, 1.65, 4.4], [0.1, 1.05, -5.0], 46)),
      actors: [{ who: "ntYou", at: [0.3, 0, 3.2], act: "scared", face: "scared", keepFace: true, back: true, facing: 0, gesture: "hang" }],
      props: [OUT([0.1, 1.05, -5.0]), FRONT_DOOR(), DREAD([0.1, 1.05, -5.0], 46), FLICK([0.1, 1.05, -5.0], 46, [1.0])], sfx: [{ t: 0.2, name: "el_scream_far", gain: -10 }],
      note: "the carriage you're in: empty, swaying" },
    { say: N("So is the next one."), ...DARK, hold: 0.1, ...glide(at([0.1, 1.6, -6.3], [0, 1.0, 4.0], 50), at([0.1, 1.6, -5.6], [0, 1.0, 4.0], 48), 1.6),
      actors: [], props: [OUT([0, 1.0, 0]), BACK_DOOR(), DREAD([0, 1.0, 0], 50), FLICK([0, 1.0, 0], 50, [0.5])], sfx: [{ t: 0, name: "el_train_doors", gain: -10 }],
      note: "the next carriage, end to end: empty seats, the lights stuttering, nobody" },
    { say: N("It's just you… and him."), ...DARK, hold: 0.15, ...cuts(at([-0.3, 1.4, 2.6], [0, 1.4, 7.0], 34)),
      actors: [{ who: "ntYou", at: [0.3, 0, 3.2], act: "scared", face: "scared", keepFace: true, back: true, facing: 0, gesture: "hang" },
        { who: "ntMan", at: [0, 0, 6.2], act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [OUT([0, 1.4, 7.0]), BACK_DOOR([{ t: -0.7 }]), DREAD([0, 1.4, 7.0], 34)], sfx: [{ word: "him", name: "el_hit_sub", gain: -6 }],
      note: "over your shoulder: him, standing at the far end" },
    // ---- THE RUN (setup 4: strobing)
    { say: N("You run. As fast as you can. You don't look back."), ...DARK, hold: 0.05,
      ...cuts(at([0, 1.3, -2.6], [0, 1.1, 2.0], 46),
        { word: "fast", c: at([0.95, 1.35, -3.6], [-0.2, 1.0, 0.4], 50) }, { word: "look", c: at([0.1, 0.45, -6.2], [0, 0.45, -2.5], 46) }),
      actors: [{ who: "ntYou", at: [0, 0, 2.2], act: "scared", face: "scared", keepFace: true, walk: { to: [0, 0, -5.7], t0: 0, t1: 3.4, mode: "run", view: "front" } }],
      props: [OUT([0, 1.1, 2.0]), FLICK([0, 1.1, -2], 46, [0.2, 0.6, 1.0, 1.4, 1.8, 2.2, 2.6, 3.0])], sfx: [{ t: 0, name: "el_run_train" }, { t: 0.2, name: "el_pant_teen", gain: -6 }, { t: 0.5, name: "el_lights_buzz", gain: -8 }],
      note: "you run straight at us; side on past the bays; your feet pounding toward the last door; the lights strobing" },
    // ---- YOUR EYES: you stop, gasping (first person), then you turn round
    { say: [N("You gasp for air. You think to yourself…"), { ...thought("I… I lost him. I must have lost him."), gap: 0.15 }], ...DARK, hold: 0.6,
      camera: at([0, 1.42, -5.9], [0, 1.3, -7.4], 50),
      cams: [{ t: 0, ...at([0, 1.42, -5.9], [0, 1.3, -7.4], 50), blockOk: true }, { t: 0.3, ...at([0.02, 1.36, -5.92], [0.05, 1.18, -7.4], 50), glide: 0.7, blockOk: true },
        { t: 1.1, ...at([-0.02, 1.43, -5.9], [-0.03, 1.32, -7.4], 50), glide: 0.7, blockOk: true }, { t: 1.9, ...at([0.01, 1.38, -5.91], [0.02, 1.22, -7.4], 50), glide: 0.8, blockOk: true },
        { t: 2.8, ...at([0, 1.44, -5.9], [0, 1.34, -7.4], 50), glide: 0.9, blockOk: true }, { t: 3.8, ...at([0.01, 1.4, -5.9], [0, 1.28, -7.4], 50), glide: 1.0, blockOk: true }],
      actors: [], props: [OUT([0, 1.3, -7.4]), FRONT_DOOR(), DREAD([0, 1.3, -7.4], 50, "heavy")], sfx: [{ t: 0, name: "el_pant_teen", gain: -2 }],
      note: "your eyes: the last door in front of you, the view heaving as you gasp for air; then silence but the rails" },
    { say: { ...whisper("This is your stop."), gap: 0.75 }, ...DARK, hold: 0.25, transition: "whip",
      ...cuts(at([0, 1.5, -5.95], [0, 1.52, -5.35], 50), { t: 1.0, c: at([0, 1.5, -5.75], [0, 1.5, -5.35], 46) }),
      kicks: [0.02],
      actors: [{ who: "ntMan", at: [0, 0, -5.35], act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang", beats: [{ t: 0.6, face: "smile" }] }],
      props: [DREAD([0, 1.5, -5.35], 50, "heavy")], sfx: [{ t: 0, name: "el_jumpscare" }],
      note: "the jumpscare: you turn round (a whip) and his face fills the frame; the smile spreads; he whispers" },
    // ---- THE STOP THAT DOESN'T EXIST (inserts; setup 6: the platform)
    insert("display", "the LED display: NEXT STOP ASHFIELD; it glitches; DEATH CITY, in red", { say: { ...announcer("The next stop is… Death City."), gap: 0.3 }, hold: 0.15,
      sfx: [{ t: 0, name: "el_chime_announce" }, { word: "Death", name: "el_hit_boom", gain: -8 }] }, [{ word: "next" }, { word: "Death" }], false),
    insert("map", "the line map: every stop you know, and DEATH CITY between them, ringed", { say: N("You know the whole area. That doesn't exist."), hold: 0.1,
      sfx: [{ t: 0, name: "el_reverse_swell", gain: -8 }, { word: "exist", name: "el_sting_strings", gain: -8 }] }, [{ word: "exist" }]),
    { say: { ...N("The doors open."), gap: 0.6 }, ...DARK, hold: 0.1, ...glide(at([-0.9, 1.5, -4.6], [1.43, 1.3, -6.3], 50), at([-0.6, 1.45, -4.9], [1.43, 1.3, -6.3], 46), 2.4),
      actors: [], props: [SIDE_DOOR([{ t: 0.6 }]), DREAD([1.43, 1.3, -6.3], 50)],
      sfx: [{ t: 0, name: "el_brakes" }, { t: 0.6, name: "el_doors_open" }, { t: 0.8, name: "el_fog_wind" }],
      note: "the brakes; the red exit doors hiss open onto fog and a red DEATH CITY sign" },
    { say: [N("Do you get off to escape him… into Death City, a place that never existed?"), { ...N("Or stay on… with the man who has no reflection?"), gap: 0.2 }], ...DARK, hold: 0.45,
      ...cuts(at([-0.9, 1.5, -4.6], [1.43, 1.3, -6.3], 50)),
      actors: [{ who: "ntYou", at: [0.92, 0, -6.0], act: "scared", back: true, facing: 1, gesture: "hang" },
        { who: "ntMan", at: [0.3, 0, -5.9], act: "neutral", face: "grin", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [SIDE_DOOR([{ t: -0.7 }]), DREAD([1.3, 1.35, -6.35], 46),
        { id: "ntChoice", variant: "a", at: [0.06, 1.81, -5.485], scale: 0.28, steps: [{ word: "off" }] },
        { id: "ntChoice", variant: "b", at: [0.236, 1.68, -5.243], scale: 0.28, steps: [{ word: "stay" }] }],
      sfx: [{ t: 0, name: "el_fog_wind", gain: -4 }, { word: "off", name: "pop", gain: -8 }, { word: "stay", name: "pop", gain: -8 }, { t: 0, name: "el_heartbeat", gain: -8 }],
      note: "the last frame: you at the open doors, the fog and the sign; him right behind you, smiling; A · GET OFF into Death City / B · STAY ON with him; cut half a second after the last word" },
  ],
};
