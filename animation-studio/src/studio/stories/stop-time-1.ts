// What If… You Could Stop Time? Part 1: "The Knock" (productions/what-if-time/part1-v2-viewer-script.md, approved by
// the owner; the series is now four parts). Theo narrates his own story: Mum, the officer at the door at dawn, grief,
// walking out of school, the implant in her locker, and the first time he stops time, a stranger's life at stake.
// Every beat is shown: two to four shots per scene, held reactions, actions on screen.
// Stopped time looks the same every time: the world blue and still (timeTint, the rain given one fixed step), and Theo,
// standing nearer the lens than the veil (timeTint "behind"), in full colour.
// The end card is the frozen frame itself: the question and options A and B pop in over the scene (tsChoice) and Theo
// looks from one to the other, then at the viewer.
import type { Storyboard, Line, ShotSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 80 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const FROZEN = [{ t: -0.7 }];
const NIGHT = "night" as const, COOL = "interiorCool" as const, DAY = "interior" as const;
type Light = typeof NIGHT | typeof COOL | typeof DAY;
const N = (text: string): Line => ({ text, who: "narrator" });
const theo = (text: string): Line => ({ text, who: "theo" });
const mum = (text: string): Line => ({ text, who: "mum" });
const officer = (text: string): Line => ({ text, who: "officer" });
const teacher = (text: string): Line => ({ text, who: "teacher" });
const doc = (text: string): Line => ({ text, who: "doc" });
const guard = (text: string): Line => ({ text, who: "guard" });
/** Mum's voice reading her own note, over the insert */
const MUM_O = (text: string): Line => ({ text, who: "narrator", voice: "tsMum" });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (a: ReturnType<typeof at>, b: ReturnType<typeof at>, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51), CARD_IN = at([0, 1.4, 3.85], CARD, 51);
const insert = (variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: ({ t: number } | { word: string })[], push = false): ShotSpec =>
  ({ set: "theoFlat", light: NIGHT, dur, ...(push ? glide(CARD_CAM, CARD_IN, dur) : { camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }] }), actors: [], props: [{ id: "tsInsert", at: CARD, variant, steps: steps ?? [{ t: 99 }] }], note, ...extra });
const RAIN = (look: V) => ({ id: "rain", at: look, steps: STEADY });
const RAIN_STILL = (look: V) => ({ id: "rain", at: look, steps: FROZEN });
const TINT = (look: V) => ({ id: "timeTint", at: look, steps: FROZEN });
/** the veil hung at `look`: everything beyond it is stopped and blue; Theo, nearer the lens, keeps his colour */
const TINT_BEHIND = (look: V) => ({ id: "timeTint", at: look, variant: "behind", steps: FROZEN });
const STREET = { set: "lowline", light: NIGHT as Light, ambience: "elb_neon_city" as const };
const FROZEN_ST = { set: "lowline", light: NIGHT as Light, ambience: false as const };
const FLAT = { set: "theoFlat", light: NIGHT as Light, ambience: "elb_flat_rain" as const };
const DAWN = { set: "theoFlat", light: COOL as Light, ambience: "elb_flat_rain" as const };
const DOOR = { set: "flatDoor", light: COOL as Light, ambience: "elb_flat_rain" as const };
const CLASS = { set: "classroom", light: DAY as Light, ambience: "elb_classroom" as const };
const LOCKERS = { set: "lockerRoom", light: COOL as Light, ambience: "elb_vault" as const };
const CLINIC = { set: "backClinic", light: NIGHT as Light, ambience: "elb_flat_rain" as const };
// the marks of the shooting: Sol on the street, the guard to her left aiming at her, the bullet frozen an inch from her
// face (its tip toward her, +x)
// the door: Theo just inside it (left of centre, so the officer shows past him), the officer in the corridor
const TH_DOOR: V = [0.25, 0, -0.8], OFF_HALL: V = [-0.1, 0, -2.3];
const SOL_AT: V = [0.85, 0, 0.4], BULLET: V = [0.6, 1.4, 0.42], GUARD_AT: V = [-0.75, 0, 0.35];
const BULLET_P = { id: "bullet", at: BULLET, steps: FROZEN, scale: 2 };
const SOL_FROZEN = { who: "sol", at: SOL_AT, act: "scared" as const, face: "shock" as const, keepFace: true, blink: false, facing: -1 as const, idle: 0 };
const GUARD_FROZEN = { who: "guard", at: GUARD_AT, act: "angry" as const, face: "angry" as const, keepFace: true, blink: false, facing: 1 as const, idle: 0, gesture: "point" as const, hold: "tsPistol" };
// the frozen frame of the end card: Theo in front (in colour), the guard, the bullet and Sol beyond the veil
const VOTE_CAM = at([0.0, 1.5, 4.2], [0.0, 1.66, 0.4], 50);

export const STOP_TIME_1: Storyboard = {
  id: "stop-time-1", title: "What If… You Could Stop Time? · Part 1: The Knock",
  cast: { theo: "theo", sol: "sol", mum: "tsMum", officer: "tsOfficer", teacher: "tsTeacher", doc: "tsDoc", guard: "towerGuard",
    lowA: "lowA", lowB: "lowB", lowC: "lowC", lowD: "lowD", lowE: "lowE" },
  voice: "tsTheo", voices: { theo: "tsTheo", mum: "tsMum", officer: "tsOfficer", teacher: "tsTeacher", doc: "tsDoc", guard: "tsGuard" },
  captionColors: { theo: "#4ef0ff", mum: "#ffb08a", tsMum: "#ffb08a", officer: "#9fb3d9", teacher: "#d9a0ff", doc: "#ffb84e", guard: "#d8dde6" },
  // the score (sound/samples/music/stoptime1v2_score.json: ten sections written to these timings) and its volume curve:
  // suspended in stopped time, warm at home, a held breath at the knock, grief, the clinic's drone, the chase, then
  // a dead stop into the frozen vote
  music: { file: "stoptime1v2_score", gain: 0, duck: -5, curve: [
    [0, -10], [6.4, -10], [6.8, -4], [12.2, -4], [12.6, -6], [27.1, -6], [27.5, -14], [36.0, -12], [36.4, -4], [54.0, -5],
    [63.4, -6], [78.0, -6], [95.2, -5], [95.6, -2], [101.9, -1], [102.2, -14], [104.0, -10], [111.1, -5]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "In a neon city where the rich live above the smog, a boy who has lost everything finds a stolen implant that stops time, at the cost of a day of his life for every second.",
    facts: [
      { fact: "the hook, and its cost", said: "Every second costs you a day of your life" },
      { fact: "his state of mind", said: "I didn't care how many days I had left" },
      { fact: "the world", said: "the rich live in the Towers, above the smog" },
      { fact: "the poor", said: "The rest of us live under it" },
      { fact: "who Mum is", said: "She was a medic on the night shift" },
      { fact: "the plant (sunrise)", said: "I'll be back by sunrise" },
      { fact: "who is at the door", said: "It wasn't her" },
      { fact: "why she died", said: "wouldn't treat her without a coverage card" },
      { fact: "why that's unjust", said: "Nobody in the Lowline has a coverage card" },
      { fact: "his grief", said: "nothing mattered" },
      { fact: "quitting school", said: "If you walk out now, don't come back" },
      { fact: "where the implant came from", said: "Someone she'd patched up had paid her with it" },
      { fact: "Mum's warning (for later parts)", said: "Never use this" },
      { fact: "how much life he has", said: "Twenty-one thousand days. Sixty years." },
      { fact: "the rule", said: "Squeeze your fist, and time stops" },
      { fact: "the cost", said: "That's one day of your life" },
      { fact: "why he doesn't care", said: "It felt like too many anyway" },
      { fact: "the danger", said: "a girl running from Tower security" },
      { fact: "the cliffhanger", said: "I squeezed" },
    ],
  },
  shots: [
    // ---- COLD OPEN: stopped time
    { say: [N("Imagine you could stop time."), N("Every second costs you a day of your life.")], ...FROZEN_ST, hold: 0.2,
      ...glide(at([1.85, 1.45, 2.0], [0.66, 1.38, 0.4], 34), at([1.65, 1.43, 1.7], [0.66, 1.38, 0.4], 34), 5.0),
      actors: [SOL_FROZEN], props: [BULLET_P, RAIN_STILL([0.7, 1.3, 0.5]), TINT([0.7, 1.3, 0.5])],
      sfx: [{ t: 0, name: "el_time_stop" }, { t: 0.4, name: "el_heart_slow", gain: -4 }], note: "frozen: a glowing bullet an inch from a girl's face; the rain hangs in the air; blue" },
    { say: N("A year ago, I didn't care how many days I had left."), ...FROZEN_ST, hold: 0.5, title: { text: "WHAT IF…", sub: "YOU COULD STOP TIME? · PART 1" },
      ...lock(at([-0.1, 1.55, 5.6], [0.15, 1.35, 0.4], 46)),
      actors: [SOL_FROZEN, GUARD_FROZEN, { who: "theo", at: [-0.85, 0, 3.5], act: "determined", face: "sad", keepFace: true, walk: { to: [-0.3, 0, 2.4], t0: 0, t1: 3.0 } }],
      props: [BULLET_P, RAIN_STILL([0.1, 1.3, 1.4]), TINT_BEHIND([0.1, 1.3, 1.3])], note: "wide: the frozen street, the guard aiming, the girl; Theo walks through it in full colour" },
    // ---- THE CITY
    { say: N("In Vantage City, the rich live in the Towers, above the smog."), set: "lowRoof", light: NIGHT, ambience: "elb_roof_night", hold: 0.1, transition: "flash",
      ...glide(at([0, 1.7, 3.0], [0, 22, -140], 54), at([0, 1.6, 2.0], [0, 27, -140], 54), 4.0), props: [RAIN([0, 2, 0])], actors: [],
      sfx: [{ t: 0, name: "el_time_resume", gain: -2 }, { t: 0.6, name: "el_siren_far", gain: -6 }], note: "looking up: the gold Towers above the brown smog" },
    { say: N("The rest of us live under it, in the Lowline."), ...STREET, hold: 0.3, ...lock(at([2.2, 1.55, 5.5], [0, 1.4, -3], 48)),
      actors: [{ who: "lowA", at: [-1.6, 0, -4], act: "neutral", walk: { to: [1.4, 0, -1], t0: 0, t1: 4 } }, { who: "lowB", at: [1.5, 0, -6], act: "neutral", walk: { to: [-1.5, 0, -2.5], t0: 0.3, t1: 4 } }, { who: "lowC", at: [-3.4, 0, -1.2], act: "sad", face: "sad", facing: "camera" }],
      props: [RAIN([0, 1.5, -2])], sfx: [{ t: 0.4, name: "el_neon_buzz", gain: -6 }], note: "street level: crowds in the rain under the neon" },
    // ---- MUM
    { say: N("It was just me and my mum. She was a medic on the night shift."), ...FLAT, hold: 0.3, ...lock(at([0.35, 1.5, 2.8], [0.75, 1.1, -0.5], 50)),
      actors: [{ who: "mum", at: [1.0, 0, 0.45], act: "happy", face: "smile", facing: "toward:theo" }, { who: "theo", at: "stool", mode: "sit", act: "neutral", face: "smile", facing: "camera" }],
      note: "the tiny flat, evening: Mum in her red medic coat by the door, Theo at the table" },
    { say: mum("Eat something. And go to school tomorrow. I mean it."), ...FLAT, hold: 0.2, ...lock(at([0.45, 1.45, 2.1], [1.0, 1.4, 0.45], 40)),
      actors: [{ who: "mum", at: [1.0, 0, 0.45], act: "happy", face: "smile", facing: -1, gesture: "hips" }], note: "Mum, close: warm, firm" },
    { say: theo("You always say that."), ...FLAT, hold: 0.2, ...lock(at([0.65, 1.2, 0.35], [0.45, 1.15, -1.28], 36)),
      actors: [{ who: "theo", at: "stool", mode: "sit", act: "happy", face: "smile", facing: "camera", gesture: "hang" }], note: "Theo, close, smiling" },
    { say: mum("And I'll be back by sunrise. I always am."), ...FLAT, hold: 1.3, ...lock(at([0.35, 1.5, 2.8], [0.75, 1.1, -0.5], 50)),
      actors: [{ who: "mum", at: [1.0, 0, 0.45], act: "happy", face: "smile", facing: "toward:theo", gesture: "hips", walk: { to: [1.6, 0, 1.4], t0: 2.4, t1: 3.4 } },
        { who: "theo", at: "stool", mode: "sit", act: "happy", face: "smile", facing: "toward:mum" }],
      sfx: [{ t: 3.4, name: "el_door_shut" }], note: "she waves and goes; the door clicks shut" },
    // ---- THE KNOCK
    { say: [N("At sunrise, someone knocked."), { ...theo("You forgot your key again…"), gap: 0.6 }], ...DAWN, hold: 0.3, ...lock(at([0.0, 1.4, 1.9], [0.5, 1.0, -1.0], 44)),
      actors: [{ who: "theo", at: "stool", mode: "sit", act: "neutral", face: "sleepy", facing: "camera", gesture: "hang", beats: [{ word: "knocked", face: "grin" }] }],
      sfx: [{ word: "someone", name: "knock_heavy" }, { word: "knocked", name: "knock_heavy" }], note: "grey dawn: Theo asleep at the table, waiting; a knock; he wakes up grinning" },
    { say: N("It wasn't her."), ...DOOR, hold: 0.8, ...lock(at([-0.85, 1.55, 1.3], [0, 1.4, -2.0], 44)),
      actors: [{ who: "theo", at: TH_DOOR, act: "neutral", back: true }, { who: "officer", at: OFF_HALL, act: "sad", face: "sad", keepFace: true, facing: "camera", gesture: "hold", hold: "tsCap" }],
      sfx: [{ t: 0, name: "latch_click" }, { t: 0.2, name: "el_door_creak", gain: -6 }], note: "the door opens: a police officer, his cap in his hands" },
    { say: officer("I'm sorry, son. There was a street fight. Your mum stopped to help someone."), ...DOOR, hold: 0.3, ...lock(at([-0.3, 1.5, -0.3], [-0.1, 1.45, -2.3], 32)),
      actors: [{ who: "theo", at: TH_DOOR, act: "neutral", back: true }, { who: "officer", at: OFF_HALL, act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera", gesture: "hold", hold: "tsCap" }],
      note: "the officer, over Theo's shoulder: gentle, slow" },
    { dur: 2.0, ...DOOR, ...lock(at([0.15, 1.45, -1.85], [0.25, 1.4, -0.8], 38)),
      actors: [{ who: "theo", at: TH_DOOR, act: "shock", face: "shock", keepFace: true, facing: "camera", blink: false, beats: [{ t: 1.1, act: "sad", face: "sad" }] }],
      sfx: [{ t: 0.1, name: "el_heartbeat", gain: -6 }], note: "Theo's face: the smile gone" },
    { say: officer("The hospital wouldn't treat her without a coverage card. She didn't make it."), ...DOOR, hold: 0.6, ...lock(at([-0.3, 1.5, -0.3], [-0.1, 1.45, -2.3], 32)),
      actors: [{ who: "theo", at: TH_DOOR, act: "neutral", back: true }, { who: "officer", at: OFF_HALL, act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera", gesture: "hold", hold: "tsCap" }],
      note: "the officer: the worst of it" },
    { say: [N("Nobody in the Lowline has a coverage card. She spent her life saving people the hospitals turned away."), { ...N("And they turned her away."), gap: 0.5 }], ...DOOR, hold: 0.8,
      ...glide(at([0.75, 1.3, 1.45], [-0.25, 0.85, -1.4], 48), at([0.7, 1.22, 1.2], [-0.25, 0.8, -1.4], 48), 7.0),
      actors: [{ who: "theo", at: "floorDoor", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera" }, { who: "officer", at: [0.05, 0, -1.75], act: "sad", face: "sad", keepFace: true, facing: "toward:theo", gesture: "hold", hold: "tsCap" }],
      sfx: [{ t: 0, name: "el_slide_down" }], note: "Theo slid down to the floor by the door; the officer in the doorway, looking down; only the rain" },
    // ---- NOTHING MATTERS
    { say: N("After that, nothing mattered."), ...DOOR, hold: 0.6, ...glide(at([-0.5, 1.4, -0.2], [-1.07, 1.35, -1.42], 40), at([-0.6, 1.4, -0.45], [-1.07, 1.35, -1.42], 40), 3.0), actors: [],
      note: "her red coat, still on its hook" },
    { say: N("I stopped eating. I stopped answering anyone."), ...DAWN, hold: 0.5, ...lock(at([0.3, 1.3, 1.4], [-0.9, 0.9, -0.6], 44)),
      actors: [{ who: "theo", at: "bed", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: 1, idle: 0.3 }],
      sfx: [{ word: "answering", name: "phone_buzz", gain: -6 }], note: "Theo on the bed in the daylight, not moving; the plate on the table untouched" },
    { say: N("My teacher saw me walking out."), ...CLASS, hold: 1.3, ...lock(at([0.3, 1.6, -2.1], [1.1, 1.2, 0.6], 54)),
      actors: [{ who: "theo", at: [-0.2, 0, 0.15], act: "sad", face: "sad", keepFace: true, walk: { to: [3.2, 0, 1.6], t0: 0.5, t1: 3.2 } }],
      sfx: [{ t: 0.1, name: "chair_scrape", gain: -4 }], note: "the classroom: Theo stands up from his desk and walks to the door" },
    { say: teacher("Theo! If you walk out now, don't come back."), ...CLASS, hold: 0.2, ...lock(at([0.6, 1.55, 0.0], [-0.6, 1.5, -1.9], 36)),
      actors: [{ who: "teacher", at: [-0.6, 0, -1.9], act: "angry", face: "stern", facing: 1, gesture: "stop" }], kicks: [{ word: "Theo" }], note: "his teacher at the board, calling after him" },
    { say: N("I didn't."), ...CLASS, hold: 1.2, ...lock(at([-0.2, 1.15, -1.0], [-0.2, 0.7, 0.25], 42)),
      actors: [], sfx: [{ t: 0, name: "el_door_shut", gain: -4 }], note: "his empty desk" },
    // ---- THE LOCKER
    { say: N("In her locker, I found something she was hiding."), ...LOCKERS, hold: 0.3, ...glide(at([1.3, 1.5, 1.3], [-0.25, 1.2, -1.1], 46), at([1.15, 1.47, 0.95], [-0.25, 1.2, -1.1], 46), 3.5),
      actors: [{ who: "theo", at: [-0.55, 0, -0.6], act: "sad", back: true }], sfx: [{ t: 0.2, name: "el_van_door", gain: -12 }], note: "Mum's clinic locker room: Theo at her open locker" },
    insert("photo", 2.0, "a photo of the two of them, smiling", { ambience: "elb_vault", sfx: [{ t: 0.2, name: "musicbox_note", gain: -10 }] }, undefined, true),
    insert("locker", 5.0, "inside: a black case marked MILITARY, a chip", { say: N("A stolen military implant. Someone she'd patched up had paid her with it."), ambience: "elb_vault" }, undefined, true),
    insert("note", 4.2, "her note: Theo. Never use this.", { say: [N("And a note."), { ...MUM_O("Theo. Never use this."), gap: 0.4 }], ambience: "elb_vault" }, undefined, true),
    // ---- THE IMPLANT
    { say: N("I didn't care what it did. A back-alley doc put it in for me."), ...CLINIC, hold: 0.2, ...lock(at([0.6, 1.5, 2.0], [0, 1.1, -0.5], 46)),
      actors: [{ who: "theo", at: "chair", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera" }, { who: "doc", at: "doc", act: "neutral", face: "neutral", facing: "toward:theo", gesture: "operate" }],
      note: "the back-alley clinic: Theo in the chair, the doc beside him" },
    insert("implant", 1.6, "the implant goes in, sparks", { ambience: false, sfx: [{ t: 0.1, name: "el_implant" }] }),
    insert("counter21915", 3.4, "the number lights up on his forearm: 21,915", { say: N("Twenty-one thousand days. Sixty years."), ambience: false, sfx: [{ t: 0, name: "el_counter_tick" }] }, undefined, true),
    { say: doc("Squeeze your fist, and time stops. But every second you hold it, that number drops by one. That's one day of your life, kid."), ...CLINIC, hold: 0.3,
      camera: at([-0.1, 1.45, 0.9], [0.45, 1.5, -0.35], 34),
      cams: [{ t: 0, ...at([-0.1, 1.45, 0.9], [0.45, 1.5, -0.35], 34), blockOk: true }, { word: "But", ...at([0.6, 1.5, 2.0], [0, 1.1, -0.5], 46), blockOk: true }, { word: "That's", ...at([-0.1, 1.45, 0.9], [0.45, 1.5, -0.35], 30), blockOk: true }],
      actors: [{ who: "doc", at: "doc", act: "neutral", face: "suspicious", facing: -1, gesture: "fists", beats: [{ word: "But", gesture: "hang" }] },
        { who: "theo", at: "chair", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera" }], note: "the doc, close: the rule; the two of them as he warns him; close again: one day of your life" },
    { say: N("It felt like too many anyway."), ...CLINIC, hold: 0.6, ...lock(at([0.2, 1.2, 0.9], [-0.35, 1.05, -0.55], 36)),
      actors: [{ who: "theo", at: "chair", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera" }], note: "Theo, close: empty" },
    // ---- THE GIRL
    { say: N("That night, I saw a girl running from Tower security."), ...STREET, hold: 0.2, ...lock(at([2.6, 1.6, 6.5], [-0.5, 1.3, -1.5], 46)),
      actors: [{ who: "theo", at: [1.8, 0, 3.0], act: "sad", face: "sad", keepFace: true, walk: { to: [1.0, 0, 2.0], t0: 0, t1: 3.2 } },
        { who: "sol", at: [-3.0, 0, -2.5], act: "scared", face: "scared", keepFace: true, walk: { to: [0.0, 0, -0.5], t0: 0.8, t1: 3.0, mode: "run" } },
        { who: "guard", at: [-4.6, 0, -3.2], act: "angry", face: "angry", keepFace: true, walk: { to: [-2.4, 0, -1.8], t0: 1.4, t1: 3.2, mode: "run" } }],
      props: [RAIN([0, 1.3, 0])], sfx: [{ t: 1.0, name: "el_siren_far", gain: -4 }], note: "the street at night: Theo wandering; a girl with pink hair runs past, a Tower guard after her" },
    { say: guard("Stop!"), ...STREET, hold: 0.9, ...lock(at([-1.9, 1.5, 2.2], [-0.2, 1.42, 0.35], 40)),
      actors: [{ ...GUARD_FROZEN, keepFace: false, blink: true, idle: 1 }, { who: "sol", at: SOL_AT, act: "scared", face: "shock", keepFace: true, facing: -1 }],
      props: [RAIN([-0.2, 1.3, 0.4])], kicks: [{ word: "Stop" }], sfx: [{ t: 0, name: "el_gun_cock" }, { word: "Stop", name: "el_gunshot" }], note: "the guard aims at her and fires" },
    insert("fist", 2.4, "Theo's hand closes into a fist", { say: N("I didn't think. I squeezed."), ambience: false, sfx: [{ word: "squeezed", name: "el_time_stop" }] }, [{ word: "squeezed" }], true),
    // ---- THE VOTE: the frozen frame
    { dur: 9.0, ...FROZEN_ST, ...lock(VOTE_CAM),
      actors: [SOL_FROZEN, GUARD_FROZEN,
        { who: "theo", at: [0.05, 0, 2.0], act: "shock", face: "shock", keepFace: true, facing: "camera",
          beats: [{ t: 2.0, act: "thinking", face: "thinking", look: "left" }, { t: 3.6, look: "right" }, { t: 5.4, act: "determined", face: "determined", look: "camera" }] }],
      props: [BULLET_P, RAIN_STILL([0.1, 1.4, 1.2]), TINT_BEHIND([0.1, 1.4, 1.2]),
        { id: "tsChoice", variant: "q", at: [0.0, 2.27, 2.4], scale: 0.42, steps: [{ t: 0.9 }] },
        { id: "tsChoice", variant: "a", at: [-0.22, 2.03, 2.4], scale: 0.44, steps: [{ t: 1.9 }] },
        { id: "tsChoice", variant: "b", at: [0.22, 2.03, 2.4], scale: 0.44, steps: [{ t: 3.5 }] },
        { id: "tsChoice", variant: "foot", at: [0.0, 0.98, 2.4], scale: 0.37, steps: [{ t: 5.3 }] }],
      sfx: [{ t: 0.1, name: "el_heart_slow", gain: -4 }, { t: 0.9, name: "pop", gain: -10 }, { t: 1.9, name: "pop", gain: -10 }, { t: 3.5, name: "pop", gain: -10 }, { t: 5.3, name: "el_counter_tick" }],
      transition: "flash", note: "the frozen frame: the bullet an inch from her face, Theo in colour; WHAT SHOULD HE DO? A SAVE HER / B LEAVE HER, and he looks from one to the other, then at us" },
  ],
};
