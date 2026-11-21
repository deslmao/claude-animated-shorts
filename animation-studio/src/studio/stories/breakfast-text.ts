// Don't Eat It. I'm Still at Work. (productions/breakfast-text/script.md, approved by the owner). Part 1 of a vote
// series: an "Imagine…" POV mystery on a school morning. Mum is making your breakfast when Mum texts you that she's
// still at work and not to eat it; then a second Mum knocks at the front door. Which one is your mum?
// Frame 1 is Mum smiling at the stove, a pancake flipping, your phone lighting up in the foreground. The texts are read
// in Mum's voice through a phone filter; the Mum at the door is the same voice, muffled. The end is the vote itself
// (A · THE STOVE / B · THE DOOR pop in on the last line) and cuts half a second later.
import type { Storyboard, Line, ShotSpec, PropSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const N = (text: string): Line => ({ text, who: "narrator" });
const mum = (text: string): Line => ({ text, who: "mum" });
const door = (text: string): Line => ({ text, who: "narrator", voice: "bfMumDoor" });
const text = (text: string): Line => ({ text, who: "narrator", voice: "bfText" });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (a: ReturnType<typeof at>, b: ReturnType<typeof at>, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51), CARD_IN = at([0, 1.4, 3.85], CARD, 51);
const K = { set: "bfKitchen", light: "interior" as const, ambience: "elb_kitchen_day" as const };
const insert = (variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: ({ t: number } | { word: string })[], push = true): ShotSpec =>
  ({ ...K, ...(extra.say ? {} : { dur }), ...(push ? glide(CARD_CAM, CARD_IN, dur) : lock(CARD_CAM)), actors: [], props: [{ id: "bfInsert", at: CARD, variant, steps: steps ?? [{ t: 99 }] }], note, ...extra });
// the set dressing that moves or lights: the pan on the stove, the two phones, the plate, the front door's leaf
const PAN = (steps: { t: number }[] = [{ t: 99 }]): PropSpec => ({ id: "bfPan", at: [-0.92, 0.9, -1.43], steps });
const MY_PHONE = (steps: ({ t: number } | { word: string })[] = [{ t: 99 }]): PropSpec => ({ id: "bfPhone", variant: "yours", at: [0.05, 0.78, 0.7], yaw: 15, steps });
const MUM_PHONE: PropSpec = { id: "bfPhone", variant: "mum", at: [-0.2, 0.925, -1.62], yaw: -70, steps: [{ t: 99 }] };
const PLATE: PropSpec = { id: "bfPlate", at: [0.25, 0.78, 0.66], steps: [{ t: -0.7 }] };
const DOOR = (variant: "empty" | "shadow" = "empty", steps: { t: number }[] = [{ t: 99 }]): PropSpec => ({ id: "bfFrontDoor", variant, at: [0.95, 0, -4.47], steps });
const KNOCKS = (t0: number) => [0.31, 0.53, 0.74, 0.94, 1.17].map((k) => ({ t: t0 + k }));
const POUND = (t0: number) => [0.6, 0.8, 1.15, 1.49, 1.84, 2.19, 2.5].map((k) => ({ t: t0 + k }));
// Mum's marks: at the stove; by the table after serving; in front of the arch (between you and the front door)
const MUM_STOVE: V = [-0.4, 0, -1.0], MUM_TABLE: V = [0.45, 0, -0.1], MUM_BLOCK: V = [0.88, 0, -1.2];
const BUG_SEAT: V = [0.25, 0.46, 1.25], BUG_STAND: V = [0.3, 0, 1.6];

export const BREAKFAST_TEXT: Storyboard = {
  id: "breakfast-text", title: "Don't Eat It. I'm Still at Work.",
  cast: { mum: "mum", bug: "bug" },
  voice: "georgeHushed", voices: { mum: "bfMum" },
  captionColors: { mum: "#ffb070", bfMumDoor: "#8fc8ff", bfText: "#ffc8dc" },
  // the score (sound/samples/music/breakfast_score.json: nine sections written to these timings): a cosy pizzicato
  // breakfast tune that slows onto an out-of-tune music box when the text arrives, a ticking minor version for
  // "sweetheart", a held-breath pulse under the rules, a heartbeat under her smile, silence and rising tremolo for the
  // knock, the music box distorted as Mum's phone lights up, a build under the two Mums, a held chord under the choice
  music: { file: "breakfast_score", gain: 0, duck: -5, curve: [[0, -6], [3.8, -8], [35.0, -7], [39.8, -5], [47.0, -4], [54.9, -2], [59.0, -2], [59.45, -24]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "Your mum is cooking your breakfast, but Mum texts you that she's still at work and not to eat it, and then someone with her voice knocks at the front door.",
    facts: [
      { fact: "the impossible thing", said: "Imagine your mum is making you breakfast. Then she texts you." },
      { fact: "the text", said: "Don't eat it. I'm still at work." },
      { fact: "why it's impossible", said: "Her shift doesn't end until nine." },
      { fact: "the time", said: "It's 7:42." },
      { fact: "the clue against the Mum at the stove", said: "Mum has never called you sweetheart" },
      { fact: "what Mum really calls you", said: "She calls you Bug" },
      { fact: "the rules", said: "Rule one. Don't let her see you read this." },
      { fact: "the danger", said: "You haven't touched it." },
      { fact: "the way out", said: "The front door is behind her." },
      { fact: "she learns your name", said: "She knows your name now." },
      { fact: "the second Mum", said: "It's me! I left my phone at home" },
      { fact: "the twist against the texts", said: "Mum's phone is on the counter" },
      { fact: "nobody sent them", said: "Nobody's touching it." },
      { fact: "both say the other isn't Mum", said: "That isn't me." },
      { fact: "the choice", said: "The one at the stove… or the one at the door?" },
    ],
  },
  shots: [
    // ---- FRAME 1: Mum smiling at the stove, the pancake flipping; your phone lights up
    { say: N("Imagine your mum is making you breakfast. Then she texts you."), ...K, hold: 0.15,
      ...glide(at([0.32, 1.02, 1.35], [-0.55, 1.08, -1.3], 46), at([0.26, 1.02, 1.12], [-0.55, 1.1, -1.3], 44), 4.2),
      actors: [{ who: "mum", at: MUM_STOVE, act: "happy", face: "smile_closed", keepFace: true, facing: "camera", gesture: "operate", beats: [{ t: 1.4, face: "smile" }] }],
      props: [PAN([{ t: 0.05 }, { t: 2.4 }]), MUM_PHONE, MY_PHONE([{ word: "texts" }])],
      sfx: [{ t: 0, name: "el_sizzle", gain: -2 }, { t: 0, name: "el_mum_humming", gain: -4 }, { t: 0.05, name: "el_pancake_flip" }, { t: 2.4, name: "el_pancake_flip", gain: -4 }, { word: "texts", name: "el_phone_buzz_table" }],
      note: "frame 1: Mum at the stove, smiling, humming, a pancake flipping in the pan; in the foreground your phone lights up on the table" },
    insert("text1", 2.6, "your phone: MUM: Don't eat it. I'm still at work.", { say: text("Don't eat it. I'm still at work."), hold: 0.25, sfx: [{ t: 0, name: "msg_chime", gain: -6 }, { t: 0, name: "el_sizzle", gain: -12 }] }),
    // ---- WHY IT'S IMPOSSIBLE
    insert("badge", 3.6, "Mum's hospital lanyard on its hook: NURSE · NIGHT SHIFT 9 PM – 9 AM", { say: N("Mum works nights at the hospital. Her shift doesn't end until nine."), hold: 0.1, sfx: [{ t: 0, name: "el_sizzle", gain: -14 }] }),
    insert("oven", 1.4, "the oven clock: 07:42", { say: N("It's 7:42."), hold: 0.35, sfx: [{ t: 0, name: "el_clock_tick", gain: -6 }, { t: 0, name: "el_sizzle", gain: -10 }] }, undefined, false),
    // ---- THE CLUE
    { say: mum("Pancakes, sweetheart. Your favourite."), ...K, hold: 0.2, ...lock(at([1.05, 1.5, 2.75], [-0.25, 1.12, -0.7], 40)),
      actors: [{ who: "mum", at: [-0.3, 0, -0.75], act: "happy", face: "grin", facing: "toward:bug", gesture: "offer", hold: "fryPan" },
        { who: "bug", at: BUG_SEAT, mode: "sit", act: "neutral", face: "neutral", back: true, facing: "toward:mum" }],
      props: [MUM_PHONE, MY_PHONE()], sfx: [{ t: 0, name: "el_sizzle", gain: -10 }],
      note: "Mum turns from the stove, beaming, and holds out the pan to you (over your shoulder)" },
    { say: N("Mum has never called you sweetheart. Not once. She calls you Bug."), ...K, hold: 0.15, ...lock(at([-0.8, 1.1, 0.3], [0.25, 0.95, 1.28], 46)),
      actors: [{ who: "bug", at: BUG_SEAT, mode: "sit", act: "confused", face: "confused", keepFace: true, facing: "camera", gesture: "hang", beats: [{ word: "Bug", face: "scared" }] }],
      sfx: [{ t: 0.2, name: "el_heart_slow", gain: -10 }], note: "you, close: the word sweetheart sinks in" },
    // ---- THE RULES
    insert("rules", 5.6, "the phone in your lap under the table: rule one; rule two", {
      say: [text("Rule one. Don't let her see you read this."), { ...text("Rule two. Don't eat anything she gives you."), gap: 0.3 }], hold: 0.1,
      sfx: [{ t: 0, name: "el_phone_buzz_table", gain: -12 }, { word: "two", name: "msg_chime", gain: -10 }, { t: 0, name: "el_mum_humming", gain: -14 }] }, [{ word: "two" }], false),
    { say: text("Rule three. Get to the front door. Walk. Don't run."), ...K, hold: 0.2, ...glide(at([0.22, 1.08, 1.4], [0.85, 1.2, -4.0], 36), at([0.24, 1.08, 1.2], [0.88, 1.2, -4.0], 34), 3.4),
      actors: [{ who: "mum", at: [-0.6, 0, -0.95], act: "happy", back: true, facing: 0, gesture: "operate" }],
      props: [DOOR()], sfx: [{ t: 0, name: "el_mum_humming", gain: -8 }, { t: 0, name: "el_sizzle", gain: -10 }, { word: "Rule", name: "msg_chime", gain: -12 }],
      note: "past Mum's back at the stove: the arch, the hallway, the front door at the end of it" },
    // ---- ESCALATION
    { say: { ...mum("You haven't touched it."), gap: 0.55 }, ...K, hold: 0.3, ...lock(at([-1.25, 1.3, 2.05], [0.3, 1.0, 0.35], 42)),
      actors: [{ who: "mum", at: MUM_TABLE, act: "happy", face: "smile", keepFace: true, blink: false, idle: 0.2, facing: "toward:bug", gesture: "hang" },
        { who: "bug", at: BUG_SEAT, mode: "sit", act: "scared", face: "scared", keepFace: true, facing: "toward:mum" }],
      props: [MY_PHONE(), PLATE], sfx: [{ t: 0, name: "el_plate_down" }],
      note: "she slides the plate in front of you; you don't pick up the fork; her smile doesn't move" },
    { say: N("The front door is behind her."), ...K, hold: 0.25, ...glide(at([-0.15, 1.55, 3.2], [0.7, 1.05, -2.8], 44), at([-0.1, 1.55, 3.0], [0.72, 1.05, -2.8], 42), 2.6),
      actors: [{ who: "bug", at: BUG_STAND, act: "scared", gesture: "hang", back: true, facing: 0 },
        { who: "mum", at: MUM_TABLE, act: "happy", face: "smile", keepFace: true, blink: false, idle: 0.2, facing: "toward:bug", gesture: "hang" }],
      props: [MUM_PHONE, DOOR(), MY_PHONE(), PLATE], sfx: [{ t: 0, name: "chair_scrape", gain: -6 }],
      note: "you stand up slowly: Mum between you and the arch, the front door at the end of the hallway behind her" },
    { dur: 1.2, ...K, ...lock(at([0.02, 1.12, 1.2], [0.06, 0.78, 0.68], 30)), actors: [],
      props: [MY_PHONE([{ t: 0.05 }]), PLATE], sfx: [{ t: 0.05, name: "el_phone_buzz_table", gain: 2 }],
      note: "your phone buzzes on the table, loud, lighting up" },
    { say: mum("Who's texting you… Bug?"), ...K, hold: 0.2, ...lock(at([0.25, 1.48, 1.25], [0.45, 1.42, -0.1], 38)),
      actors: [{ who: "mum", at: MUM_TABLE, act: "neutral", face: "smile", keepFace: true, blink: false, idle: 0.2, facing: "camera", gesture: "hips",
        beats: [{ t: 0, look: "down" }, { word: "Bug", look: "camera", face: "blank" }] }],
      props: [DOOR()], sfx: [{ word: "Bug", name: "el_sting_strings", gain: -6 }], note: "Mum, close: she looks at the phone, then at you" },
    { say: N("She knows your name now."), ...K, hold: 0.45, ...lock(at([-0.75, 1.25, 0.6], [0.3, 1.12, 1.62], 44)),
      actors: [{ who: "bug", at: BUG_STAND, act: "scared", face: "scared", keepFace: true, facing: "camera" }],
      sfx: [{ t: 0, name: "el_heartbeat_fast", gain: -6 }], note: "you, close, terrified" },
    // ---- THE DOOR
    { say: { ...door("Bug? It's me! I left my phone at home, let me in!"), gap: 1.45 }, ...K, hold: 0.25, ...glide(at([0.95, 1.35, 0.7], [0.95, 1.28, -5.0], 30), at([0.95, 1.35, 0.2], [0.95, 1.28, -5.0], 28), 5.5),
      actors: [], props: [DOOR("shadow", KNOCKS(0.1))], sfx: [{ t: 0.1, name: "el_knock_front" }],
      note: "down the hallway: three hard knocks; a woman's silhouette in the front door's frosted glass" },
    insert("mumPhone", 7.8, "Mum's pink phone on the counter by the stove: dark; it lights up by itself; Open the door. Now. Delivered.", {
      say: [N("Mum's phone is on the counter. Right next to the stove."), { ...N("It lights up. Nobody's touching it."), gap: 0.2 }, { ...text("Open the door. Now."), gap: 0.25 }], hold: 0.2,
      sfx: [{ word: "lights", name: "el_vial_chime", gain: -10 }, { word: "Open", name: "msg_chime", gain: -6 }, { t: 0, name: "el_sizzle", gain: -14 }] }, [{ word: "lights" }, { word: "Open" }], false),
    // ---- THE CHOICE
    { say: { ...mum("Don't, Bug. That isn't me. I've been here all morning. I made your favourite."), gap: 0.5 }, ...K, hold: 0.15,
      ...lock(at([0.35, 1.42, 1.75], [0.85, 1.3, -1.6], 40)),
      actors: [{ who: "mum", at: MUM_TABLE, act: "happy", face: "smile", keepFace: true, blink: false, idle: 0.2, facing: "camera", gesture: "block", walk: { to: MUM_BLOCK, t0: 0, t1: 1.0 } }],
      props: [DOOR("shadow")], note: "Mum steps between you and the hallway, calm, smiling again; the silhouette behind the glass" },
    { say: { ...door("Bug, whatever's in there, don't eat anything!"), gap: 0.5 }, ...K, hold: 0.1, ...lock(at([0.95, 1.35, -1.3], [0.95, 1.3, -5.0], 30)),
      actors: [], props: [DOOR("shadow", POUND(0))], sfx: [{ t: 0, name: "el_door_pound" }], note: "the front door, close: pounding, the leaf shaking, the silhouette" },
    { say: [N("One of them is your mum."), { ...N("The one at the stove… or the one at the door?"), gap: 0.2 }], ...K, hold: 0.45,
      ...lock(at([1.55, 1.4, 0.8], [0.78, 1.3, -2.6], 50)),
      actors: [{ who: "mum", at: MUM_BLOCK, act: "happy", face: "smile", keepFace: true, blink: false, idle: 0.1, facing: "camera", gesture: "block" }],
      props: [DOOR("shadow", [{ t: 0.4 }, { t: 1.6 }]),
        { id: "bfChoice", variant: "a", at: [1.127, 1.722, -0.437], scale: 0.26, steps: [{ word: "stove" }] },
        { id: "bfChoice", variant: "b", at: [1.409, 1.602, -0.501], scale: 0.26, steps: [{ word: "door" }] }],
      sfx: [{ t: 0.4, name: "knock_heavy", gain: -8 }, { t: 1.6, name: "knock_heavy", gain: -8 }, { word: "stove", name: "pop", gain: -10 }, { word: "door", name: "pop", gain: -10 }],
      note: "the last frame: Mum smiling in front of the arch, the silhouette in the door glass beyond her; A · THE STOVE pops in by her, B · THE DOOR by the door; cut half a second after the last word" },
  ],
};
