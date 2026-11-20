// What If… You Could Stop Time? Part 1: "Sixty Years" (productions/what-if-time/part1-script.md, approved by the owner).
// An original cyberpunk love story: Theo narrates his own story. A stolen implant stops time; every second costs a day
// of his life. He falls for Sol, a hacker who dreams of the sea. It ends in the vault: a gun at her head, 41 days left.
// Stopped time: the timeTint veil, the rain given one fixed step (it hangs still), the frozen bullet.
import type { Storyboard, Line, ShotSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 80 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const FROZEN = [{ t: -0.7 }];
const NIGHT = "night" as const, COOL = "interiorCool" as const;
type Light = typeof NIGHT | typeof COOL;
const N = (text: string): Line => ({ text, who: "narrator" });
const theo = (text: string): Line => ({ text, who: "theo" });
const sol = (text: string): Line => ({ text, who: "sol" });
const mum = (text: string): Line => ({ text, who: "mum" });
const dex = (text: string): Line => ({ text, who: "dex" });
const guard = (text: string): Line => ({ text, who: "guard" });
/** Sol heard over a card (off screen) */
const SOL_O = (text: string): Line => ({ text, who: "narrator", voice: "tsSol" });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (a: ReturnType<typeof at>, b: ReturnType<typeof at>, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51), CARD_IN = at([0, 1.4, 3.85], CARD, 51);
const insert = (variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: ({ t: number } | { word: string })[], push = false): ShotSpec =>
  ({ set: "theoFlat", light: NIGHT, dur, ...(push ? glide(CARD_CAM, CARD_IN, dur) : { camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }] }), actors: [], props: [{ id: "tsInsert", at: CARD, variant, steps: steps ?? [{ t: 99 }] }], note, ...extra });
const RAIN = (look: V) => ({ id: "rain", at: look, steps: STEADY });
const RAIN_STILL = (look: V) => ({ id: "rain", at: look, steps: FROZEN });
const TINT = (look: V) => ({ id: "timeTint", at: look, steps: FROZEN });
const STREET = { set: "lowline", light: NIGHT as Light, ambience: "elb_neon_city" as const };
const FROZEN_ST = { set: "lowline", light: NIGHT as Light, ambience: false as const };
const ROOF = { set: "lowRoof", light: NIGHT as Light, ambience: "elb_roof_night" as const };
const FLAT = { set: "theoFlat", light: NIGHT as Light, ambience: "elb_flat_rain" as const };
const VAULT = { set: "towerVault", light: COOL as Light, ambience: "elb_vault" as const };
// the cold open marks: Sol on the street, the bullet frozen in front of her face, its tip toward her (+x)
const SOL_AT: V = [0.8, 0, 0.4], BULLET: V = [0.35, 1.38, 0.45];

export const STOP_TIME_1: Storyboard = {
  id: "stop-time-1", title: "What If… You Could Stop Time? · Part 1: Sixty Years",
  cast: { theo: "theo", sol: "sol", mum: "tsMum", dex: "dex", guard: "towerGuard", guard2: "towerGuard", lowA: "lowA", lowB: "lowB", lowC: "lowC" },
  voice: "tsTheo", voices: { theo: "tsTheo", sol: "tsSol", mum: "tsMum", dex: "tsDex", guard: "tsGuard" },
  captionColors: { theo: "#4ef0ff", sol: "#ff7ac8", tsSol: "#ff7ac8", mum: "#ffb08a", dex: "#ffcf6a", guard: "#d8dde6" },
  // the score (sound/samples/music/stoptime1_score.json: nine sections written to these timings) and its volume curve:
  // near-silent in stopped time, the romance theme on the rooftop, the build in the vault, a dead stop on the last line
  music: { file: "stoptime1_score", gain: 0, duck: -5, curve: [
    [0, -10], [5.7, -10], [6.2, -3], [37.6, -3], [38.0, -14], [42.6, -14], [43.0, -2], [80.9, -2], [81.3, -4], [99.6, -2],
    [105.5, 0], [106.0, -6], [108.8, -6], [109.2, -40], [112.1, -40]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "In a neon city where the rich live above the smog, a poor boy gets an illegal implant that stops time, but every second costs a day of his life, and he falls for a girl who dreams of seeing the sea.",
    facts: [
      { fact: "the first frame, and its cost (the hook)", said: "Every second costs you a day of your life" },
      { fact: "who she is to him", said: "This is the girl I spent them on" },
      { fact: "the world", said: "the rich live in the Towers, above the smog" },
      { fact: "the poor", said: "The rest of us live under it, in the Lowline" },
      { fact: "Mum, and the plant", said: "I'll be back by sunrise" },
      { fact: "why she dies", said: "She didn't have one" },
      { fact: "where the implant came from", said: "A stolen military implant" },
      { fact: "how much life he has", said: "Twenty-one thousand days. Sixty years." },
      { fact: "the rule", said: "Squeeze my fist, and time stops" },
      { fact: "the cost", said: "the number drops by one day" },
      { fact: "who Sol is", said: "Her name was Sol" },
      { fact: "her dream (the plant for Part 2)", said: "One day I'm going to stand in it" },
      { fact: "the visor (the plant for Part 2)", said: "take this visor off" },
      { fact: "their promise", said: "Then I'm coming with you" },
      { fact: "the cost growing", said: "the number got smaller" },
      { fact: "the second promise", said: "Promise me you'll stop" },
      { fact: "the last job", said: "Two tickets out of this city" },
      { fact: "what saving her costs", said: "stop time for a whole minute" },
      { fact: "the cliffhanger", said: "I had forty-one days left" },
    ],
  },
  shots: [
    // ---- COLD OPEN: stopped time
    { say: [N("Imagine you could stop time."), N("Every second costs you a day of your life.")], ...FROZEN_ST, hold: 0.2,
      ...glide(at([1.85, 1.42, 2.2], [0.55, 1.36, 0.42], 36), at([1.65, 1.4, 1.85], [0.55, 1.36, 0.42], 36), 5.0),
      actors: [{ who: "sol", at: SOL_AT, act: "scared", face: "shock", keepFace: true, blink: false, facing: -1, idle: 0 }],
      props: [{ id: "bullet", at: BULLET, steps: FROZEN }, RAIN_STILL([0.6, 1.3, 0.5]), TINT([0.6, 1.3, 0.5])],
      sfx: [{ t: 0, name: "el_time_stop" }, { t: 0.4, name: "el_heart_slow", gain: -4 }], note: "frozen: a bullet an inch from Sol's face; the rain hangs in the air; blue" },
    { say: N("This is the girl I spent them on."), ...FROZEN_ST, hold: 0.5, ...lock(at([0.0, 1.5, 5.4], [0.2, 1.2, 0.6], 46)),
      actors: [{ who: "sol", at: SOL_AT, act: "scared", face: "shock", keepFace: true, blink: false, facing: -1, idle: 0 },
        { who: "theo", at: [-2.4, 0, 2.8], act: "determined", face: "determined", keepFace: true, walk: { to: [-0.2, 0, 0.9], t0: 0, t1: 2.8 } }],
      props: [{ id: "bullet", at: BULLET, steps: FROZEN }, RAIN_STILL([0.2, 1.2, 0.8]), TINT([0.2, 1.2, 0.8])], note: "Theo walks through the frozen rain toward her" },
    // ---- THE CITY
    { say: N("In Vantage City, the rich live in the Towers, above the smog."), ...STREET, hold: 0.1, transition: "flash", title: { text: "WHAT IF…", sub: "YOU COULD STOP TIME? · PART 1" },
      ...glide(at([1.0, 1.6, 10], [0, 9, -60], 54), at([1.0, 1.5, 8.5], [0, 14, -80], 54), 4.5), props: [RAIN([0, 2, 0])], actors: [],
      sfx: [{ t: 0, name: "el_time_resume", gain: -2 }, { t: 0.6, name: "el_siren_far", gain: -6 }], note: "the Lowline's neon canyon; the gold Towers above the smog" },
    { say: N("The rest of us live under it, in the Lowline. Nobody down here has ever seen the sky."), ...STREET, hold: 0.2, ...lock(at([2.2, 1.55, 5.5], [0, 1.4, -3], 48)),
      actors: [{ who: "lowA", at: [-1.6, 0, -4], act: "neutral", walk: { to: [1.4, 0, -1], t0: 0, t1: 5 } }, { who: "lowB", at: [1.5, 0, -6], act: "neutral", walk: { to: [-1.5, 0, -2.5], t0: 0.4, t1: 5 } }, { who: "lowC", at: [-3.4, 0, -1.2], act: "sad", face: "sad", facing: "camera" }],
      props: [RAIN([0, 1.5, -2])], sfx: [{ t: 0.5, name: "el_neon_buzz", gain: -6 }], note: "street level: crowds in the rain under the neon" },
    { say: [mum("Eat something. I'll be back by sunrise."), theo("You always say that."), mum("And I always am.")], ...FLAT, hold: 0.6, ...lock(at([0.2, 1.45, 3.0], [-0.6, 1.0, -0.3], 48)),
      actors: [{ who: "mum", at: [-0.25, 0, -0.05], act: "happy", face: "smile", facing: "toward:theo", gesture: "wave" }, { who: "theo", at: "bed", mode: "sit", act: "neutral", face: "smile", facing: "toward:mum" }],
      note: "Mum in her medic coat at the door; Theo on the bed" },
    insert("coverage", 6.2, "the hospital: COVERAGE REQUIRED", { say: [N("She wasn't. She got caught in a street fight."), N("The hospital wanted a coverage card before they'd touch her. She didn't have one.")], ambience: "elb_neon_city", sfx: [{ t: 0, name: "el_siren_far" }, { t: 2.6, name: "el_hit_sub", gain: -6 }] }, undefined, true),
    insert("locker", 4.6, "her locker: the military chip", { say: N("In her locker, I found something she was hiding. A stolen military implant."), ambience: "elb_flat_rain", sfx: [{ t: 0.2, name: "el_van_door", gain: -10 }] }, undefined, true),
    // ---- THE IMPLANT
    insert("implant", 1.8, "the implant goes in, sparks", { say: N("I put it in."), ambience: false, sfx: [{ t: 0.1, name: "el_implant" }] }),
    insert("counter21915", 4.6, "the counter on his wrist: 21,915", { say: N("A number lit up on my wrist. Twenty-one thousand days. Sixty years."), ambience: false, sfx: [{ t: 0, name: "el_counter_tick" }] }, undefined, true),
    { say: N("Squeeze my fist, and time stops."), ...STREET, hold: 0.1, ...lock(at([1.4, 1.5, 3.8], [0.2, 1.35, 0.8], 40)),
      actors: [{ who: "theo", at: [0.2, 0, 0.8], act: "determined", face: "determined", keepFace: true, facing: "camera", gesture: "fists" }],
      props: [RAIN([0.2, 1.3, 0.8])], kicks: [{ word: "stops" }], sfx: [{ t: 1.4, name: "el_time_stop" }], note: "Theo in the rain, his fist closing" },
    { say: N("Every second I hold it, the number drops by one day."), ...FROZEN_ST, hold: 0.3, ...glide(at([1.6, 1.5, 4.2], [0.2, 1.35, 0.8], 44), at([1.3, 1.45, 3.4], [0.2, 1.35, 0.8], 44), 4.0),
      actors: [{ who: "theo", at: [0.2, 0, 0.8], act: "shock", face: "shock", keepFace: true, facing: "camera" }, { who: "lowA", at: [-1.4, 0, -2.5], act: "neutral", idle: 0, blink: false }],
      props: [RAIN_STILL([0.2, 1.3, 0.8]), TINT([0.2, 1.3, 0.8])], sfx: [{ t: 0.2, name: "el_heart_slow", gain: -6 }], note: "the street frozen blue round him, the rain hanging still" },
    // ---- SOL
    { say: N("The first time I used it, I saved a stranger."), ...FROZEN_ST, hold: 0.1, ...lock(at([0.3, 1.45, 4.0], [0.5, 1.25, 0.5], 46)),
      actors: [{ who: "sol", at: SOL_AT, act: "scared", face: "shock", keepFace: true, blink: false, facing: -1, idle: 0 }, { who: "theo", at: [-0.1, 0, 0.8], act: "determined", facing: "toward:sol", gesture: "grab", reach: "sol" }],
      props: [{ id: "bullet", at: BULLET, steps: FROZEN }, RAIN_STILL([0.5, 1.3, 0.5]), TINT([0.5, 1.3, 0.5])], note: "the cold open again: Theo takes her arm" },
    { say: [{ ...sol("…How did you do that? You were over there. Then you weren't."), gap: 0.5 }, theo("Lucky, I guess.")], ...STREET, hold: 0.4, ...lock(at([1.9, 1.45, 3.8], [-0.5, 1.3, 0.2], 44)),
      actors: [{ who: "sol", at: [-1.0, 0, 0.2], act: "shock", face: "shock", keepFace: true, facing: "toward:theo" }, { who: "theo", at: [-0.1, 0, 0.6], act: "happy", face: "smile", facing: "toward:sol", gesture: "shrug" }],
      props: [RAIN([-0.5, 1.3, 0.3])], sfx: [{ t: 0, name: "el_time_resume" }, { t: 0.15, name: "el_bullet_wall" }], note: "time crashes back; the bullet hits the wall; Sol stares at him" },
    { say: [N("Her name was Sol. She could hack anything with a screen. She ran with a crew that stole from the Towers."), { ...sol("We could use someone who's that lucky."), gap: 0.4 }], ...STREET, hold: 0.4,
      ...glide(at([-0.2, 1.4, 2.6], [-0.9, 1.35, 0.2], 36), at([-0.25, 1.38, 2.2], [-0.95, 1.36, 0.2], 36), 7.0),
      actors: [{ who: "sol", at: [-1.0, 0, 0.2], act: "happy", face: "grin", facing: "toward:theo", gesture: "hips" }, { who: "theo", at: [-0.1, 0, 0.6], act: "neutral", back: true }],
      props: [RAIN([-0.9, 1.3, 0.2])], sfx: [{ t: 0.6, name: "el_hacking", gain: -8 }], note: "Sol, her visor glowing, grinning at him" },
    // ---- THE ROOFTOP
    insert("sea", 4.4, "Sol's cracked holo-photo of the sea", { say: SOL_O("That's the sea. A real one. Past the wall, past the smog."), ambience: "elb_roof_night", sfx: [{ t: 0.2, name: "musicbox_note", gain: -10 }] }, undefined, true),
    { say: [theo("Have you ever seen it?"), { ...sol("Not yet. One day I'm going to stand in it. And take this visor off, so I see it with my own eyes."), gap: 0.3 }], ...ROOF, hold: 0.3, ...glide(at([0.6, 1.25, -2.4], [0, 0.95, -5.5], 46), at([0.5, 1.2, -2.9], [0, 0.95, -5.5], 46), 8.0),
      actors: [{ who: "theo", at: "ledgeL", mode: "sit", act: "neutral", face: "neutral", facing: "toward:sol" }, { who: "sol", at: "ledgeR", mode: "sit", act: "happy", face: "smile", facing: "toward:theo" }],
      note: "the rooftop: the two of them on the ledge, the city and the Towers behind" },
    { say: [theo("Then I'm coming with you."), { ...sol("Is that a promise?"), gap: 0.3 }, { ...theo("It's a promise."), gap: 0.3 }], ...ROOF, hold: 0.8, ...lock(at([0.0, 1.12, -2.7], [0, 0.98, -5.5], 46)),
      actors: [{ who: "theo", at: "ledgeL", mode: "sit", act: "happy", face: "smile", facing: "toward:sol" }, { who: "sol", at: "ledgeR", mode: "sit", act: "happy", face: "smile", facing: "toward:theo" }],
      sfx: [{ t: 0.2, name: "musicbox_note", gain: -12 }], note: "closer: the promise" },
    // ---- THE CREW
    { say: dex("Kid, whatever you're doing, keep doing it!"), ...STREET, hold: 0.2, ...lock(at([0.4, 1.5, 0.2], [2.8, 1.4, -5.4], 46)),
      actors: [{ who: "dex", at: [1.8, 0, -4.0], act: "laugh", face: "laugh", facing: "toward:theo", gesture: "thumbsUp" }, { who: "theo", at: [0.9, 0, -2.6], act: "happy", face: "grin", facing: "toward:dex" }, { who: "sol", at: [2.4, 0, -2.8], act: "happy", face: "grin", facing: "toward:dex" }],
      props: [{ id: "van", at: [3.0, 0, -6.5] }, RAIN([2, 1.3, -4])], sfx: [{ t: 0, name: "el_van_door" }], note: "the crew by the van after a job: Dex roaring with laughter" },
    insert("counterDrop", 6.6, "the counter falling: 18,240, 9,600, 2,100", { say: N("Every job, something went wrong. Every time, I stopped it. And every time, the number got smaller."), ambience: "elb_neon_city",
      sfx: [{ t: 0.1, name: "el_counter_tick" }, { t: 2.4, name: "el_counter_tick" }, { t: 4.6, name: "el_counter_tick" }, { t: 4.6, name: "el_hit_sub", gain: -8 }] }, [{ t: 2.4 }, { t: 4.6 }], true),
    // ---- THE PROMISE
    { say: [sol("Theo… what is this number?"), { ...theo("It's how many days I have left."), gap: 0.4 }], ...STREET, hold: 0.4, ...lock(at([0.9, 1.4, 2.4], [-0.1, 1.3, 0.3], 38)),
      actors: [{ who: "sol", at: [-0.5, 0, 0.1], act: "scared", face: "scared", keepFace: true, sadTalk: true, facing: "toward:theo", gesture: "grab", reach: "theo" }, { who: "theo", at: [0.3, 0, 0.5], act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "toward:sol" }],
      props: [RAIN([-0.1, 1.3, 0.3])], note: "under the neon: Sol holding his wrist" },
    { say: [sol("Then stop. Promise me you'll stop. I don't want the sea without you."), { ...theo("I promise."), gap: 0.6 }], ...STREET, hold: 0.4, ...glide(at([-0.4, 1.42, 1.9], [-0.5, 1.34, 0.1], 32), at([-0.42, 1.4, 1.6], [-0.5, 1.34, 0.1], 32), 6.0),
      actors: [{ who: "sol", at: [-0.5, 0, 0.1], act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera", gesture: "crossArms" }, { who: "theo", at: [0.3, 0, 0.5], act: "sad", back: true }],
      props: [RAIN([-0.5, 1.3, 0.1])], sfx: [{ t: 0.2, name: "el_heartbeat", gain: -8 }], note: "Sol, close, crying" },
    { say: N("I meant it. I really did."), ...ROOF, hold: 0.5, ...lock(at([0.3, 1.6, 3.2], [0, 1.4, -5.5], 50)),
      actors: [{ who: "theo", at: [0, 0, -3.5], act: "sad", back: true }], note: "Theo alone on the rooftop, looking at the Towers" },
    // ---- THE LAST JOB
    { say: [dex("One last job. The Tower vault. Two tickets out of this city."), { ...sol("To the sea."), gap: 0.3 }], ...STREET, hold: 0.3, ...lock(at([0.4, 1.5, 0.2], [2.8, 1.4, -5.4], 46)),
      actors: [{ who: "dex", at: [1.8, 0, -4.0], act: "determined", face: "grin", facing: "toward:sol" }, { who: "sol", at: [2.4, 0, -2.8], act: "happy", face: "smile", facing: "toward:dex" }, { who: "theo", at: [0.9, 0, -2.6], act: "neutral", face: "neutral", facing: "toward:sol" }],
      props: [{ id: "van", at: [3.0, 0, -6.5] }, RAIN([2, 1.3, -4])], note: "by the van: the last job" },
    { say: guard("Drop it! Now!"), ...VAULT, hold: 0.2, ...lock(at([-0.4, 1.5, 4.4], [0.5, 1.3, -0.6], 56)),
      actors: [{ who: "sol", at: [-0.2, 0, -0.7], act: "scared", face: "scared", facing: "toward:guard", gesture: "operate" }, { who: "theo", at: [-1.3, 0, -0.2], act: "scared", face: "shock", keepFace: true, facing: "toward:guard" },
        { who: "guard", at: [2.8, 0, 0.4], act: "angry", face: "angry", facing: "toward:sol", gesture: "point", walk: { to: [0.7, 0, -0.5], t0: 0, t1: 1.0, mode: "run" } }, { who: "guard2", at: [3.2, 0, 1.2], act: "angry", facing: "toward:theo", walk: { to: [1.6, 0, 0.8], t0: 0.1, t1: 1.1, mode: "run" } }],
      kicks: [{ word: "Drop" }], sfx: [{ t: 0, name: "el_alarm" }, { t: 0, name: "el_door_blast" }, { t: 0.8, name: "el_gun_cock" }], note: "the vault: the alarm, the guards storm in, a gun at Sol's head" },
    { say: [sol("Theo… don't."), { ...N("There were too many of them. To save her, I'd need to stop time for a whole minute."), gap: 0.5 }], ...VAULT, hold: 0.3, ...glide(at([0.5, 1.3, 0.9], [-0.2, 1.25, -0.7], 36), at([0.45, 1.28, 0.7], [-0.2, 1.25, -0.7], 36), 6.0),
      actors: [{ who: "sol", at: [-0.2, 0, -0.7], act: "scared", face: "scared", keepFace: true, sadTalk: true, facing: "toward:theo" }, { who: "guard", at: [0.7, 0, -0.5], act: "angry", face: "angry", facing: "toward:sol", gesture: "point", reach: "sol" }],
      sfx: [{ t: 0.2, name: "el_heartbeat_fast", gain: -4 }, { t: 2.4, name: "el_riser_long", gain: -4 }], note: "Sol, a gun at her head, looking at Theo: she knows" },
    insert("counter41", 3.4, "the counter: 41, in red", { say: N("I had forty-one days left."), ambience: false, sfx: [{ t: 0, name: "el_counter_tick" }, { t: 0.4, name: "el_heart_slow" }] }, undefined, true),
    insert("endCard", 3.0, "end card: Part 2, the vote", { ambience: false, transition: "dip", sfx: [{ t: 0, name: "el_hit_boom", gain: -6 }] }),
  ],
};
