// Don't Eat It, Part 2: "She Picked Up" (productions/breakfast-2/viewer-script.md, approved by the owner). Part 1's
// comments voted for the door, but the top comment (41 likes) said "None of them. Your mum's at work." So you ring
// Mum's work, and she answers from the hospital: neither Mum in your house is her. Then both of them ask who you're
// talking to, and Mum's phone on the counter texts you to hang up.
// Built to the format system and what Part 1's numbers taught us: frame 0 in the bright kitchen with the hook as a
// two-line banner, ~58 s (v2 answers the comments' questions: the work computer, the kitchen camera, the text Mum never sent), a visual change every ~1.8 s, six setups (the bright kitchen, your phone, the cold kitchen,
// the hallway and front door, Mum's phone on the counter). Reuses Part 1's sets, cast, phones, voices and inserts.
import type { Storyboard, Line, ShotSpec, PropSpec, CameraBeat } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number, roll = 0) => ({ move: "at" as const, pos, look, fov, ...(roll ? { roll } : {}) });
type Cam = ReturnType<typeof at>;
const N = (text: string): Line => ({ text, who: "narrator" });
const stove = (text: string): Line => ({ text, who: "mum" });
const door = (text: string): Line => ({ text, who: "narrator", voice: "bfMumDoor" });
/** the real Mum, on the phone from the hospital (Mum's voice through the phone filter, as Part 1's texts were) */
const call = (text: string): Line => ({ text, who: "narrator", voice: "bfText" });
const thought = (text: string): Line => ({ text, who: "narrator", voice: "bfThought" });
const lock = (c: Cam) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (a: Cam, b: Cam, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
/** a camera move plus hard cuts on words: { ...withCuts(glide(a, b, s), ["word", cam], …) } */
const withCuts = (base: { camera: Cam; cams: object[] }, ...cuts: [string, Cam][]) => ({ ...base, cams: [...base.cams, ...cuts.map(([word, c]) => ({ word, ...c, blockOk: true }))] as CameraBeat[] });
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51), CARD_IN = at([0, 1.4, 3.85], CARD, 51);
const K = { set: "bfKitchen", light: "interior" as const, ambience: "elb_kitchen_day" as const };
const KC = { ...K, light: "interiorCool" as const };
const DREAD = (look: V, fov: number, variant: "soft" | "heavy" | "dark" = "soft", on?: { t: number } | { word: string }): PropSpec => ({ id: "bfDread", at: look, variant, scale: fov / 100, steps: [on ?? { t: 99 }] });
const insert = (variant: string, note: string, extra: Partial<ShotSpec>, steps: ({ t: number } | { word: string })[] = [{ t: 99 }], push = true): ShotSpec =>
  ({ ...K, ...(push ? glide(CARD_CAM, CARD_IN, 4) : lock(CARD_CAM)), actors: [], props: [{ id: "bfInsert", at: CARD, variant, steps }], note, ...extra });
const PAN = (steps: { t: number }[] = [{ t: 99 }]): PropSpec => ({ id: "bfPan", at: [-0.92, 0.9, -1.43], steps });
const MUM_PHONE: PropSpec = { id: "bfPhone", variant: "mum", at: [-0.2, 0.925, -1.62], yaw: -70, steps: [{ t: 99 }] };
const PLATE: PropSpec = { id: "bfPlate", at: [0.25, 0.78, 0.66], steps: [{ t: -0.7 }] };
const DOOR = (variant: "empty" | "shadow" = "shadow", steps: { t: number }[] = [{ t: 99 }]): PropSpec => ({ id: "bfFrontDoor", variant, at: [0.95, 0, -4.47], steps });
// the home camera high on the back wall, above the arch to the hallway (seen in the wide kitchen shots)
const HOMECAM: PropSpec = { id: "bfHomeCam", at: [0.95, 2.28, -1.89], steps: [] };
const KNOCKS = (t0: number) => [0.31, 0.53, 0.74, 0.94, 1.17].map((k) => ({ t: t0 + k }));
const MUM_STOVE: V = [-0.4, 0, -1.0], BUG_STAND: V = [0.3, 0, 1.6];
// the hospital behind Mum's voice whenever she's on the line
const LINE = (t = 0, gain = -14) => ({ t, name: "el_hospital_line" as const, gain });

export const BREAKFAST_2: Storyboard = {
  id: "breakfast-2", title: "Don't Eat It, Part 2: She Picked Up",
  cast: { mum: "mum", bug: "bug" },
  voice: "georgeHushed", voices: { mum: "bfMum" },
  captionColors: { mum: "#ffb070", bfMum: "#ffb070", bfMumDoor: "#8fc8ff", bfText: "#ffc8dc", bfThought: "#fff2a8" },
  // the score (sound/samples/music/breakfast2_score4.json: eleven sections to these timings): the breakfast tune slightly off
  // under the recap, collapsing onto a detuned music box with the call, a hit on "you were right", near silence as the house
  // goes quiet (after a quiet ticking pulse under the comments' answers and a sting on "I never sent that"), a held-breath heartbeat under the whisper, a horror swell as it turns, a warped music box under the text,
  // a held chord that stops dead
  music: { file: "breakfast2_score4", gain: 0, duck: -5, curve: [[0, -6], [16.3, -6], [26.4, -9], [39.7, -6], [43.1, -10], [50.9, -6], [64.4, -3], [68.5, -2], [68.9, -24]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "You ring Mum's work and she answers from the hospital, so neither of the mums in your house is her, and now both of them want to know who you're talking to.",
    facts: [
      { fact: "the recap: the impossible text", said: "In Part 1, Mum was making your breakfast. Then she texted you." },
      { fact: "the recap: the text", said: "Don't eat it. I'm still at work." },
      { fact: "the recap: the second Mum", said: "And someone with her voice knocked at the front door." },
      { fact: "the top comment", said: "None of them. Your mum's at work." },
      { fact: "the top comment was right", said: "You were right." },
      { fact: "what you did", said: "So you don't open the door. You ring Mum's work instead." },
      { fact: "the twist", said: "And Mum picks up." },
      { fact: "she's at work", said: "I'm still at work, love." },
      { fact: "what that means", said: "Then who's at the stove… and who's at the door?" },
      { fact: "the comments' question", said: "how did she text you, if her phone's on the counter?" },
      { fact: "she texted from work", said: "I texted you from my work computer." },
      { fact: "how she knew", said: "I saw her on the kitchen camera." },
      { fact: "the last text wasn't her", said: "I never sent that." },
      { fact: "the danger", said: "Walk to the back door. Now." },
      { fact: "it heard you", said: "Who are you talking to, Bug?" },
      { fact: "it's in two places", said: "The voice at the door says it too." },
      { fact: "the phone mystery", said: "Mum's phone lights up on the counter." },
      { fact: "the new text", said: "Hang up, Bug." },
      { fact: "the text says", said: "The text says hang up." },
      { fact: "Mum says", said: "Mum's voice says don't." },
      { fact: "the choice", said: "Who do you trust?" },
    ],
  },
  shots: [
    // ---- FRAME 0: the recap, as the hook (Part 1's proven opening): the bright kitchen, Mum (the thing) flipping
    // pancakes, the banner; then her text on your phone
    { say: N("In Part 1, Mum was making your breakfast. Then she texted you."), ...K, hold: 0.05,
      title: { text: "YOU RANG MUM'S WORK", sub: "AND SHE PICKED UP", instant: true },
      ...glide(at([0.32, 1.02, 1.35], [-0.55, 1.08, -1.3], 46), at([0.26, 1.02, 1.12], [-0.55, 1.1, -1.3], 44), 2.6),
      actors: [{ who: "mum", at: MUM_STOVE, act: "happy", face: "smile_closed", keepFace: true, facing: "camera", gesture: "operate", beats: [{ t: 1.4, face: "smile" }] }],
      props: [PAN([{ t: 0.05 }, { t: 1.6 }]), MUM_PHONE, PLATE],
      sfx: [{ t: 0, name: "el_sizzle", gain: -2 }, { t: 0, name: "el_mum_humming", gain: -6 }, { t: 0.05, name: "el_pancake_flip" }, { t: 1.6, name: "el_pancake_flip", gain: -4 }, { word: "texted", name: "el_phone_buzz_table", gain: -4 }],
      note: "frame 0 (the recap): the bright kitchen; the thing that looks like Mum flips pancakes at the stove, smiling" },
    insert("text1", "the recap: your phone: MUM: Don't eat it. I'm still at work.", {
      say: { text: "Don't eat it. I'm still at work.", who: "narrator", voice: "bfText" }, hold: 0.2, sfx: [{ t: 0, name: "msg_chime", gain: -6 }, { t: 0, name: "el_sizzle", gain: -12 }] }),
    { say: N("And someone with her voice knocked at the front door."), ...K, hold: 0.1,
      ...glide(at([0.95, 1.35, 0.7], [0.95, 1.28, -5.0], 30), at([0.95, 1.35, 0.2], [0.95, 1.28, -5.0], 28), 3.2),
      actors: [], props: [DOOR("shadow", KNOCKS(0.1)), DREAD([0.95, 1.28, -4.4], 30)], sfx: [{ t: 0.1, name: "el_knock_front" }],
      note: "the recap: down the hallway, three hard knocks; a woman's silhouette in the front door's frosted glass" },
    // ---- THE TOP COMMENT (the owner: show it, "you were right", then you ring Mum)
    insert("comment", "the top comment on Part 1: None if them. Your moms at work; the heart turns red on 'right'", {
      say: [N("Your top comment said…"), { ...N("None of them. Your mum's at work."), gap: 0.15 }, { ...N("You were right."), gap: 0.2 }], hold: 0.1,
      sfx: [{ t: 0.1, name: "pop", gain: -10 }, { word: "right", name: "el_hit_sub", gain: -8 }, { word: "right", name: "ding", gain: -14 }] }, [{ word: "right" }], false),
    // ---- PART 2 STARTS: you ring Mum's work
    { say: N("So you don't open the door. You ring Mum's work instead."), ...K, hold: 0.05,
      ...withCuts(glide(at([-0.75, 1.25, 0.6], [0.3, 1.12, 1.62], 44), at([-0.6, 1.24, 0.8], [0.3, 1.12, 1.62], 41), 2.5), ["ring", at([-0.3, 1.3, 0.85], [-0.68, 1.12, -1.15], 46)]),
      actors: [{ who: "bug", at: BUG_STAND, act: "scared", face: "scared", keepFace: true, facing: "camera", gesture: "hang", beats: [{ t: 0, look: "right" }] },
        { who: "mum", at: MUM_STOVE, act: "happy", face: "smile_closed", keepFace: true, facing: "camera", gesture: "operate" }],
      props: [PAN([{ t: 1.9 }]), MUM_PHONE],
      sfx: [{ t: 0, name: "el_sizzle", gain: -6 }, { t: 0.3, name: "el_phone_ringout", gain: -4 }, { t: 0, name: "el_breath_heavy", gain: -12 }],
      note: "you, close, eyes on the hallway; on 'ring', the thing at the stove, still flipping pancakes, smiling; the phone rings out" },
    insert("call", "your phone in your hands: Calling… MUM'S WORK; then she picks up, 00:03", {
      say: [call("Hello? Bug?"), { ...N("And Mum picks up."), gap: 0.25 }], hold: 0.25,
      sfx: [{ t: 0, name: "el_phone_ringout", gain: -8 }, { word: "Hello", name: "phone_tap", gain: -10 }, { word: "Hello", name: "el_hospital_line", gain: -14 }] }, [{ word: "Hello" }]),
    // ---- THE TOP COMMENT WAS RIGHT
    { say: call("I'm still at work, love. What's wrong?"), ...K, hold: 0.15, ...glide(at([-0.75, 1.25, 0.6], [0.3, 1.12, 1.62], 44), at([-0.55, 1.22, 0.85], [0.3, 1.12, 1.62], 40), 2.6),
      actors: [{ who: "bug", at: BUG_STAND, act: "scared", face: "shock", keepFace: true, facing: "camera", gesture: "hang" }],
      props: [DREAD([0.3, 1.12, 1.62], 44)], sfx: [LINE(0, -12), { t: 0.3, name: "el_breath_heavy", gain: -10 }], note: "you, close, the phone in your hand: Mum's voice, the hospital behind it" },
    insert("badge", "Mum's hospital lanyard on its hook: NURSE · NIGHT SHIFT 9 PM – 9 AM", {
      ...withCuts(lock(CARD_CAM), ["hospital", at([0, 1.28, 3.72], [0, 1.28, 3.2], 51)]),
      say: N("Mum's at the hospital."), hold: 0.2, sfx: [LINE(0, -18)] }),
    // ---- THE HOUSE GOES QUIET (the kitchen turns cold)
    { say: { ...thought("Then who's at the stove… and who's at the door?"), gap: 0.1 }, ...KC, hold: 0.2,
      cams: [{ t: 0, ...at([0.22, 1.08, 1.4], [-0.6, 1.2, -0.95], 38), blockOk: true }, { word: "door", ...at([0.95, 1.35, 0.2], [0.95, 1.28, -5.0], 28), blockOk: true }],
      camera: at([0.22, 1.08, 1.4], [-0.6, 1.2, -0.95], 38),
      actors: [{ who: "mum", at: [-0.6, 0, -0.95], act: "happy", back: true, facing: 0, gesture: "hang" }],
      props: [DOOR("shadow"), DREAD([-0.6, 1.2, -0.95], 38, "soft")], sfx: [{ t: 0, name: "el_sizzle", gain: -10 }, { t: 0, name: "el_breath_heavy", gain: -10 }],
      note: "the thing's back at the stove; then, down the hallway, the silhouette in the front door's glass" },
    // ---- THE COMMENTS' QUESTIONS, ANSWERED
    insert("mumPhone", "Mum's pink phone on the counter, the thread of texts to you: Don't eat it… Rule three… Open the door. Now. Delivered.", {
      say: N("Your top question: how did she text you, if her phone's on the counter?"), hold: 0.1, sfx: [LINE(0, -20)] }, [{ t: -0.7 }, { t: -0.7 }]),
    { say: [call("I texted you from my work computer."), { ...call("Bug… I saw her on the kitchen camera."), gap: 0.2 }], ...KC, hold: 0.2,
      ...withCuts(lock(CARD_CAM), ["camera", at([0.55, 1.75, -0.65], [0.95, 2.25, -1.89], 30)]),
      actors: [], props: [{ id: "bfInsert", at: CARD, variant: "camFeed", steps: [{ t: 99 }] }, HOMECAM],
      sfx: [LINE(0, -14), { word: "camera", name: "el_hit_sub", gain: -10 }],
      note: "Mum's computer at the hospital: the kitchen camera's live feed, her double at your stove, the messages she sent you; on 'camera', the little camera high on your kitchen wall, its red light on" },
    { say: { text: "Then… “Open the door. Now.”?", who: "narrator", voice: "bfThought", sub: "Then… “Open the door. Now.”?" }, ...KC, hold: 0.15,
      ...withCuts(lock(at([-0.75, 1.25, 0.6], [0.3, 1.12, 1.62], 44)), ["Open", at([-0.5, 1.28, 0.85], [0.3, 1.18, 1.62], 40)]),
      actors: [{ who: "bug", at: BUG_STAND, act: "confused", face: "confused", keepFace: true, facing: "camera", gesture: "hang" }],
      props: [DREAD([0.3, 1.12, 1.62], 44)], sfx: [{ t: 0, name: "el_breath_heavy", gain: -10 }], note: "you, close: the last text" },
    insert("mumPhone", "Mum's phone on the counter, pushing in on the last text: Open the door. Now.", {
      say: [call("I never sent that."), { ...N("Mum didn't send the last text."), gap: 0.2 }], hold: 0.2,
      sfx: [LINE(0, -16), { word: "never", name: "el_sting_strings", gain: -6 }] }, [{ t: -0.7 }, { t: -0.7 }]),
    { say: [N("The knocking stops."), { ...N("The thing at the stove stops moving."), gap: 0.3 }], ...KC, hold: 0.3,
      ...withCuts(glide(at([1.55, 1.4, 0.8], [0.2, 1.1, -1.6], 50), at([1.4, 1.38, 0.55], [0.2, 1.1, -1.6], 48), 1.6), ["thing", at([-0.15, 1.5, 0.35], [-0.6, 1.5, -0.95], 30)]),
      actors: [{ who: "mum", at: [-0.6, 0, -0.95], act: "neutral", back: true, facing: 0, gesture: "hang", idle: 0 }],
      props: [MUM_PHONE, DREAD([0.2, 1.1, -1.6], 50, "heavy", { word: "stove" })],
      sfx: [{ t: 0.05, name: "knock_heavy", gain: -6 }, { t: 0.3, name: "knock_heavy", gain: -8 }, { word: "stops", name: "el_ear_ring" }, { t: 0, name: "el_sizzle", gain: -14 }],
      note: "the wide kitchen: two last knocks, then silence; the thing at the stove stands dead still, its back to you" },
    { say: call("Bug. Don't say anything. Walk to the back door. Now."), ...KC, hold: 0.15,
      ...withCuts(lock(at([-0.12, 1.3, 0.5], [0.3, 1.2, 1.62], 36)), ["Walk", at([-0.15, 1.5, 0.35], [-0.6, 1.45, -0.95], 32)]),
      actors: [{ who: "bug", at: BUG_STAND, act: "scared", face: "scared", keepFace: true, facing: "camera", gesture: "hang", beats: [{ t: 0, look: "left" }] },
        { who: "mum", at: [-0.6, 0, -0.95], act: "neutral", back: true, facing: 0, gesture: "hang", idle: 0 }],
      props: [DREAD([0.3, 1.25, 1.62], 34, "heavy")], sfx: [LINE(0, -16), { t: 0, name: "el_heartbeat_fast", gain: -8 }], note: "you, very close, eyes on the stove: Mum whispering on the line; on Walk, the thing's back at the stove, listening" },
    // ---- IT HEARD YOU
    { dur: 1.1, ...KC, ...lock(at([-0.15, 1.5, 0.35], [-0.6, 1.5, -0.95], 30)),
      actors: [{ who: "mum", at: [-0.6, 0, -0.95], act: "neutral", back: true, facing: 0, gesture: "hang", idle: 0 }],
      props: [DREAD([-0.6, 1.5, -0.95], 30, "heavy")], sfx: [{ t: 0.1, name: "el_neck_creak" }], note: "close on the back of its head: a creak as it starts to turn" },
    { say: stove("Who are you talking to, Bug?"), ...KC, hold: 0.1, ...glide(at([-0.45, 1.5, 0.3], [-0.6, 1.53, -0.95], 32, -9), at([-0.5, 1.52, -0.05], [-0.6, 1.54, -0.95], 28, -12), 2.4),
      actors: [{ who: "mum", at: [-0.6, 0, -0.95], act: "happy", face: "smile", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [DREAD([-0.6, 1.53, -0.95], 32, "heavy")], sfx: [{ t: 0, name: "el_sting_strings", gain: -8 }], note: "its face, turned all the way round, smiling, the frame tilted; pushing in" },
    { say: door("Who are you talking to, Bug?"), ...KC, hold: 0.1, ...glide(at([0.95, 1.35, -1.6], [0.95, 1.3, -5.0], 30, 6), at([0.95, 1.35, -2.4], [0.95, 1.3, -5.0], 28, 8), 2.4),
      actors: [], props: [DOOR("shadow"), DREAD([0.95, 1.3, -4.4], 30, "heavy")], sfx: [{ t: 0, name: "el_riser_short", gain: -10 }], note: "the front door, close: the silhouette in the glass says the same words" },
    { say: [N("The voice at the door says it too."), { ...N("Word for word."), gap: 0.2 }], ...KC, hold: 0.15,
      ...withCuts(lock(at([-0.75, 1.25, 0.6], [0.3, 1.12, 1.62], 44)), ["Word", at([-0.45, 1.3, 1.05], [0.3, 1.22, 1.62], 34)]),
      actors: [{ who: "bug", at: BUG_STAND, act: "scared", face: "shock", keepFace: true, facing: "camera", gesture: "hang" }],
      props: [DREAD([0.3, 1.12, 1.62], 44, "heavy")], sfx: [{ t: 0, name: "el_breath_heavy", gain: -6 }], note: "you, frozen, the phone in your hand" },
    // ---- THE TEXT
    insert("mumHang", "Mum's pink phone on the counter: dark; it lights up by itself: Hang up, Bug. Delivered.", {
      say: [N("Mum's phone lights up on the counter. One new text."), { text: "Hang up, Bug.", who: "narrator", voice: "bfMum", gap: 0.25 }], hold: 0.15,
      sfx: [{ word: "lights", name: "el_vial_chime", gain: -10 }, { word: "Hang", name: "msg_chime", gain: -6 }] }, [{ word: "lights" }], false),
    { say: call("Don't you dare hang up! Bug, run!"), ...KC, hold: 0.1,
      ...glide(at([-0.12, 1.3, 0.5], [0.3, 1.2, 1.62], 36), at([-0.02, 1.28, 0.8], [0.3, 1.2, 1.62], 32), 2.0), kicks: [0.15],
      actors: [{ who: "bug", at: BUG_STAND, act: "scared", face: "scared", keepFace: true, facing: "camera", gesture: "hang" }],
      props: [DREAD([0.3, 1.25, 1.62], 34, "heavy")], sfx: [LINE(0, -12), { t: 0, name: "el_heartbeat_fast", gain: -6 }], note: "you, close: Mum shouting down the line" },
    // ---- THE CHOICE
    { say: [N("The text says hang up."), { ...N("Mum's voice says don't."), gap: 0.15 }, { ...N("Who do you trust?"), gap: 0.2 }], ...KC, hold: 0.45,
      ...lock(at([1.55, 1.4, 0.8], [0.78, 1.3, -2.6], 50)),
      actors: [{ who: "mum", at: [0.88, 0, -1.2], act: "happy", face: "smile", keepFace: true, blink: false, idle: 0, facing: "camera", gesture: "hang" }],
      props: [DOOR("shadow", [{ t: 0.4 }]), DREAD([0.78, 1.3, -2.6], 50),
        { id: "bfChoice", variant: "c", at: [1.127, 1.702, -0.437], scale: 0.26, steps: [{ word: "hang" }] },
        { id: "bfChoice", variant: "d", at: [1.409, 1.602, -0.501], scale: 0.26, steps: [{ word: "don't" }] },
        { id: "bfChoice", variant: "w", at: [1.263, 1.822, -0.468], scale: 0.28, steps: [{ word: "Who" }] }],
      sfx: [{ t: 0.4, name: "knock_heavy", gain: -8 }, { t: 0, name: "el_breath_heavy", gain: -12 }, { word: "hang", name: "pop", gain: -10 }, { word: "don't", name: "pop", gain: -10 }, { word: "Who", name: "pop", gain: -8 }],
      note: "the last frame: the thing has come round from the stove and stands between you and the hallway, smiling; the silhouette in the door glass beyond; A · HANG UP, B · STAY ON THE LINE, WHO DO YOU TRUST? pop in; cut half a second after the last word" },
  ],
};
