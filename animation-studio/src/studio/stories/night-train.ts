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
const man = (text: string): Line => ({ text, who: "ntMan" });
const whisper = (text: string): Line => ({ text, who: "narrator", voice: "ntManWhisper" });
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
const RED = (look: V, fov: number): PropSpec => ({ id: "ntRed", at: look, scale: fov / 100, steps: [{ t: -0.7 }] });
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
  captionColors: { ntMan: "#ff6a5e", ntManWhisper: "#ff6a5e", ntThought: "#fff2a8", ntAnnouncer: "#7dffa8" },
  // the score (sound/samples/music/nighttrain_score.json: ten sections written to these timings): an orchestral hit for the
  // scream, a wheel-like pulsing drone under the man opposite, a glassy harmonic and heartbeat for the reflection, faster
  // pulsing as he follows, hollow wind in the empty train, pounding percussion for the run, near silence before the
  // jumpscare, a detuned chime for DEATH CITY, a held chord under the choice that stops dead
  music: { file: "nighttrain_score", gain: 0, duck: -5, curve: [[0, -3], [2.6, -6], [41.4, -4], [44.2, -12], [47.7, -14], [50.1, -6], [57.3, -3], [62.5, -3], [62.95, -24]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "On the last train home, a screaming man with no reflection follows you through an empty train, until the speakers announce a stop that doesn't exist.",
    facts: [
      { fact: "the situation", said: "Imagine you're on the last train home, and the man in front of you won't stop screaming." },
      { fact: "where he is", said: "He's on the three seats in front of you." },
      { fact: "the first wrong detail", said: "His coat is soaking wet. It hasn't rained all week." },
      { fact: "the impossible thing", said: "He has no reflection." },
      { fact: "he's coming after you", said: "He's following you." },
      { fact: "nobody can help", said: "It's just you… and him." },
      { fact: "the stop", said: "The next stop is… Death City." },
      { fact: "the stop is impossible", said: "There is no Death City." },
      { fact: "the choice", said: "Do you get off… or stay on and run for the next stop?" },
    ],
  },
  shots: [
    // ---- FRAME 0: the banner, and his scream (setup 1: the lit carriage)
    { say: man("Why did this happen to me? WHY ME?!"), ...LIT, hold: 0.1, title: { text: "HE HAS NO REFLECTION.", sub: "THE LAST TRAIN · 9:47 PM", instant: true },
      ...cuts(at([0.78, 1.22, 2.75], [0.8, 1.2, 1.68], 40), { t: 1.5, c: at([0.79, 1.24, 2.45], [0.8, 1.22, 1.68], 36) }),
      kicks: [0.05, 1.5],
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "scared", face: "scared", facing: "camera", gesture: "fists", blink: false }],
      props: [OUT([0.8, 1.2, 1.68]), FLICK(MAN_FACE, 40, [0.3, 1.9])],
      sfx: [{ t: 0, name: "el_hit_boom", gain: -4 }, { t: 0.3, name: "el_lights_buzz", gain: -8 }],
      note: "frame 0: the banner; a man in a soaked torn coat lunging at you, screaming; the camera shakes; the lights stutter" },
    { say: N("Imagine you're on the last train home, and the man in front of you won't stop screaming."), ...LIT, hold: 0.1, transition: "whip",
      ...cuts(at([0.74, 1.2, 2.25], YOU_FACE, 40), { word: "train", c: at([-0.3, 1.55, 4.7], [0.8, 1.0, 2.4], 46) }, { word: "screaming", c: at([0.45, 1.35, 4.4], [0.8, 1.05, 1.68], 40) }),
      actors: [{ who: "ntYou", at: YOU_SEAT, mode: "sit", act: "shock", face: "shock", keepFace: true, facing: "toward:ntMan" },
        { who: "ntMan", at: MAN_SEAT, mode: "sit", act: "scared", face: "scared", facing: "toward:ntYou", gesture: "fists", blink: false, talk: [[0, 5]] }],
      props: [OUT(YOU_FACE)], sfx: [{ t: 0, name: "el_gasp_teen" }, { t: 0, name: "el_whoosh_dark", gain: -8 }, { t: 0.5, name: "el_scream_far", gain: -6 }],
      note: "you flinch back in your seat; the two of you across the bay; over your shoulder at him" },
    { say: N("It's 9:47. He's on the three seats in front of you. Facing you. Staring right at you."), ...LIT, hold: 0.1,
      ...cuts(at([0, 1.6, -4.3], [0, 2.02, -6.99], 34), { word: "three", c: at([1.2, 1.65, 4.3], [0.8, 1.05, 1.68], 40) }, { word: "Staring", c: at([0.8, 1.22, 2.5], MAN_FACE, 32) }),
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" },
        { who: "ntYou", at: YOU_SEAT, mode: "sit", act: "scared", back: true, facing: "toward:ntMan" }],
      props: [OUT([0, 2.06, -6.99]), FRONT_DOOR(), DREAD(MAN_FACE, 42)], sfx: [{ t: 0, name: "el_counter_tick", gain: -10 }, { word: "Staring", name: "el_sting_strings", gain: -10 }],
      note: "the LED display over the end door: 21:47; over your shoulder: the man on the seats facing yours; his face: staring, unblinking" },
    { say: man("I was just going home! Just like you!"), ...LIT, hold: 0.1, ...cuts(at([0.85, 1.2, 2.45], MAN_FACE, 36), { t: 1.2, c: at([0.6, 0.95, 2.35], [0.8, 0.8, 1.7], 40) }),
      kicks: [0.1],
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "angry", face: "angry", facing: "camera", gesture: "fists", blink: false }],
      props: [OUT(MAN_FACE), DREAD(MAN_FACE, 40)], note: "his face, shouting; his fists clenched on his knees" },
    insert("drip", "water dripping off his coat's torn hem; the puddle spreads", { say: N("His coat is soaking wet. It hasn't rained all week."), hold: 0.1,
      sfx: [{ t: 0, name: "el_drip_loud" }] }, [{ word: "rained" }]),
    // ---- THE REFLECTION (setup 2: the dark window)
    { say: N("You look at the window."), ...LIT, hold: 0.05, ...glide(at([0.35, 1.2, 4.2], [1.2, 1.25, 3.0], 44), at([0.4, 1.2, 4.0], [1.25, 1.3, 2.9], 42), 1.5),
      actors: [{ who: "ntYou", at: YOU_SEAT, mode: "sit", act: "scared", face: "scared", keepFace: true, facing: 1, beats: [{ t: 0.2, look: "right" }] }],
      props: [OUT([1.2, 1.25, 3.0])], sfx: [{ t: 0, name: "el_breath_hold", gain: -6 }], note: "you turn your head to the dark window" },
    insert("reflection", "the dark window: your reflection, the lit carriage, the seats opposite: empty", { say: N("You can see yourself. You can see the empty seats."), hold: 0.05,
      sfx: [{ t: 0, name: "el_reverse_swell", gain: -10 }] }),
    insert("split", "above: him in his seat; below: the same seat in the glass: empty", { say: N("But where he's sitting… there's nobody there."), hold: 0.15,
      sfx: [{ t: 0.4, name: "el_heartbeat", gain: -6 }] }, undefined, false),
    { say: N("He has no reflection."), ...LIT, hold: 0.25, ...glide(at([0.8, 1.22, 2.55], MAN_FACE, 36), at([0.8, 1.21, 2.3], MAN_FACE, 32), 1.6),
      actors: [{ who: "ntMan", at: MAN_SEAT, mode: "sit", act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [OUT(MAN_FACE), DREAD(MAN_FACE, 36, "heavy"), FLICK(MAN_FACE, 36, [0.6])], sfx: [{ t: 0, name: "el_heartbeat", gain: -4 }, { t: 0.6, name: "el_lights_buzz", gain: -8 }],
      note: "his face, pushing in: no blink, no expression" },
    // ---- YOU MOVE (setup 3: the lights failing)
    { say: thought("Don't look at him. Just get up. Walk."), ...DARK, hold: 0.05,
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
    { say: N("And then you notice: this carriage is empty. So is the next one. It's just you… and him."), ...DARK, hold: 0.15,
      ...cuts(at([-0.3, 1.65, 4.4], [0.1, 1.05, -5.0], 46), { word: "next", c: at([0.05, 1.45, -5.95], [0, 1.4, -7.0], 30) }, { word: "him", c: at([-0.3, 1.4, 2.6], [0, 1.4, 7.0], 34) }),
      actors: [{ who: "ntYou", at: [0.3, 0, 3.2], act: "scared", face: "scared", keepFace: true, back: true, facing: 0, gesture: "hang" },
        { who: "ntMan", at: [0, 0, 6.2], act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [OUT([0, 1.1, -5.0]), FRONT_DOOR(), BACK_DOOR([{ t: -0.7 }]), DREAD([0, 1.2, 0], 46), FLICK([0, 1.2, 0], 46, [1.0, 3.6])], sfx: [{ t: 0.2, name: "el_scream_far", gain: -10 }, { word: "him", name: "el_hit_sub", gain: -6 }],
      note: "the empty carriage, swaying; through the end door's glass the next one, empty; over your shoulder, him, at the far end" },
    // ---- THE RUN (setup 4: strobing)
    { say: N("You run. As fast as you can. You don't look back."), ...DARK, hold: 0.05,
      ...cuts(at([0, 1.3, -2.6], [0, 1.1, 2.0], 46),
        { word: "fast", c: at([0.95, 1.35, -3.6], [-0.2, 1.0, 0.4], 50) }, { word: "look", c: at([0.1, 0.45, -6.2], [0, 0.45, -2.5], 46) }),
      actors: [{ who: "ntYou", at: [0, 0, 2.2], act: "scared", face: "scared", keepFace: true, walk: { to: [0, 0, -5.7], t0: 0, t1: 3.4, mode: "run", view: "front" } }],
      props: [OUT([0, 1.1, 2.0]), FLICK([0, 1.1, -2], 46, [0.2, 0.6, 1.0, 1.4, 1.8, 2.2, 2.6, 3.0])], sfx: [{ t: 0, name: "el_run_train" }, { t: 0.2, name: "el_pant_teen", gain: -6 }, { t: 0.5, name: "el_lights_buzz", gain: -8 }],
      note: "you run straight at us; side on past the bays; your feet pounding toward the last door; the lights strobing" },
    // ---- THE LAST CARRIAGE (setup 5: the red emergency lights)
    { say: { ...thought("I… I lost him. I must have lost him."), gap: 0.2 }, ...DARK, hold: 0.85,
      ...glide(at([0.95, 1.3, -4.6], [0, 1.1, -5.9], 44), at([-0.9, 1.3, -4.7], [0, 1.1, -5.9], 44), 3.6),
      actors: [{ who: "ntYou", at: [0, 0, -5.9], act: "nervous", face: "nervous", keepFace: true, facing: "camera", gesture: "hang" }],
      props: [OUT([0, 1.1, -5.9]), RED([0, 1.1, -5.9], 44), DREAD([0, 1.1, -5.9], 44)], sfx: [{ t: 0, name: "el_pant_teen", gain: -2 }],
      note: "the last carriage in red emergency light; you stop, gasping; the camera circles you; then nothing but the rails" },
    { say: { ...whisper("This is your stop."), gap: 1.0 }, ...DARK, hold: 0.25,
      ...cuts(at([0, 1.5, -5.95], [0, 1.52, -5.35], 50), { t: 1.0, c: at([0, 1.5, -5.75], [0, 1.5, -5.35], 46) }),
      kicks: [0.02],
      actors: [{ who: "ntMan", at: [0, 0, -5.35], act: "neutral", face: "blank", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang", beats: [{ t: 0.6, face: "smile" }] }],
      props: [RED([0, 1.5, -5.35], 50), DREAD([0, 1.5, -5.35], 50, "heavy")], sfx: [{ t: 0, name: "el_jumpscare" }],
      note: "the jumpscare: you turn and his face fills the frame; the smile spreads; he whispers" },
    // ---- THE STOP THAT DOESN'T EXIST (inserts; setup 6: the platform)
    insert("display", "the LED display: NEXT STOP ASHFIELD; it glitches; DEATH CITY, in red", { say: { ...announcer("The next stop is… Death City."), gap: 0.5 }, hold: 0.15,
      sfx: [{ t: 0, name: "el_chime_announce" }, { word: "Death", name: "el_hit_boom", gain: -8 }] }, [{ word: "next" }, { word: "Death" }], false),
    insert("map", "the line map: every stop you know, and DEATH CITY between them, ringed", { say: N("You've ridden this line every day for years. There is no Death City."), hold: 0.1,
      sfx: [{ t: 0, name: "el_reverse_swell", gain: -8 }, { word: "no", name: "el_sting_strings", gain: -8 }] }, [{ word: "no" }]),
    { say: { ...N("The doors open."), gap: 1.0 }, ...DARK, hold: 0.1, ...glide(at([-0.9, 1.5, -4.6], [1.43, 1.3, -6.3], 50), at([-0.6, 1.45, -4.9], [1.43, 1.3, -6.3], 46), 2.4),
      actors: [], props: [SIDE_DOOR([{ t: 1.0 }]), DREAD([1.43, 1.3, -6.3], 50)],
      sfx: [{ t: 0, name: "el_brakes" }, { t: 1.0, name: "el_doors_open" }, { t: 1.2, name: "el_fog_wind" }],
      note: "the brakes; the red exit doors hiss open onto fog and a red DEATH CITY sign" },
    { say: N("Do you get off… or stay on and run for the next stop?"), ...DARK, hold: 0.45,
      ...cuts(at([-0.9, 1.5, -4.6], [1.43, 1.3, -6.3], 50)),
      actors: [{ who: "ntYou", at: [0.92, 0, -6.0], act: "scared", back: true, facing: 1, gesture: "hang" },
        { who: "ntMan", at: [0.3, 0, -5.9], act: "neutral", face: "grin", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [SIDE_DOOR([{ t: -0.7 }]), DREAD([1.3, 1.35, -6.35], 46),
        { id: "ntChoice", variant: "a", at: [0.06, 1.81, -5.485], scale: 0.28, steps: [{ word: "off" }] },
        { id: "ntChoice", variant: "b", at: [0.236, 1.68, -5.243], scale: 0.28, steps: [{ word: "stay" }] }],
      sfx: [{ t: 0, name: "el_fog_wind", gain: -4 }, { word: "off", name: "pop", gain: -8 }, { word: "stay", name: "pop", gain: -8 }],
      note: "the last frame: you at the open doors, the fog and the sign; him right behind you, smiling; A · GET OFF / B · STAY ON; cut half a second after the last word" },
  ],
};
