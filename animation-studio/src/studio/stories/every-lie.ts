// "In This World, Every Lie Appears Above Your Head" (Thinkora comedy). Approved script v2 and narration:
// productions/every-lie/ (script.md, narration/). The say lines and voices are the approved text and recordings
// (never edit them; the chant is one recording played in two shots).
// The rule: a lie slams into the air above the liar's head as a red neon LIE sign (everylie theme `lieSign`, base just
// over the head). Readability: one sign at a time where possible (two at most, except the stacking gag); a footnote
// only after its sign has been up about half a second.
// Sets: the apartment (living room, kitchen), the classroom, the city. Music: phonk; "rest" (near-silence) for the
// breakfast stare and the hush before the 67 drop; the drop-out after the fake moral (musicDrop), silent to the end.
import type { Storyboard, V3 } from "../story/types";

// ---- marks ----
const LIV: V3 = [-2.0, 0, -0.35];                 // apartment living room (the hook)
const DAD: V3 = [2.3, 0, -0.55], KID: V3 = [3.6, 0, -0.2];   // the kitchen
const DESK: V3 = [-0.2, 0, 0.15];                 // Milo behind his desk (desks face the board, -z)
const TEACH: V3 = [-0.25, 0, -0.85];              // the teacher, between the board and his desk
const JUNO: V3 = [1.2, 0, 0.15];                  // Juno at the next desk
const HEAD = 1.72, ADULT = 1.98;                  // sign bases: just over Milo's / an adult's head
const over = (p: V3, h: number, dz = 0): V3 => [p[0], h, p[2] + dz];
/** a walk in place (footfalls on the same spot): the front-view stride swaps the arms on each footfall, so with
 *  gesture "pump" the hands go up and down like scales: the 67 gesture (and a bounce) */
const inPlace = (p: V3, n: number, t0: number, t1: number) => ({ to: p, t0, t1, mode: "walk" as const, view: "front" as const, footfalls: Array.from({ length: n }, () => p) });
const DESKTOP = 0.72;                              // standing on a desk

export const EVERYLIE: Storyboard = {
  id: "every-lie", title: "Every Lie Appears Above Your Head",
  cast: { milo: "milo", dad: "gus", juno: "juno", teacher: { extra: 6, era: "office" }, kid1: { extra: 2 }, kid2: { extra: 9 }, kid3: { extra: 13 }, gym: { extra: 4 }, bed: { extra: 11 } },
  music: { mood: "phonk", gain: -4 }, musicDrop: { word: "policy" }, motionBlur: true, controlledBlur: true, engine: 3,
  autoSfx: false,
  shots: [
    // 1. HOOK: close, angelic, hand on heart. On "life": ONE big sign, alone for 0.8 s; then three LIE signs stack
    //    on it, bonk bonk bonk, and the camera tilts up the tower as it punches through the ceiling
    { say: { who: "milo", text: "I have never told a lie in my life.", voice: "liam", gap: 0.1 }, hold: 1.7, set: "apartment", light: "interior", mood: "phonk",
      camera: { move: "at", pos: [-2.0, 1.6, 2.05], look: [-2.0, 1.72, -0.35], fov: 50 },
      cams: [{ t: 3.0, move: "at", pos: [-2.0, 1.8, 1.7], look: [-2.0, 2.75, -0.35], fov: 56, glide: 0.7 }],
      actors: [{ who: "milo", at: LIV, act: "proud", facing: 0, gesture: "stop", idle: 0.4, beats: [{ word: "life", act: "nervous" }] }],
      props: [{ id: "lieSign", at: over(LIV, HEAD), variant: "NEVER TOLD A LIE", steps: [{ word: "life" }] },
        { id: "lieSign", at: over(LIV, HEAD + 0.42), variant: "LIE", scale: 0.8, steps: [{ t: 2.95 }] },
        { id: "lieSign", at: over(LIV, HEAD + 0.78), variant: "LIE", scale: 0.8, steps: [{ t: 3.25 }] },
        { id: "lieSign", at: over(LIV, HEAD + 1.14), variant: "LIE", scale: 0.8, steps: [{ t: 3.55 }] }],
      sfx: [{ t: 2.0, name: "lie_slam", gain: 0 }, { t: 2.95, name: "boing", gain: -6 }, { t: 3.25, name: "boing", gain: -5 }, { t: 3.55, name: "boing", gain: -4 }, { t: 3.6, name: "crack", gain: -4 }, { t: 3.62, name: "poof", gain: -6 }] },
    // 2. the world, three one-second gags under the narrator's line (split across the shots)
    { say: { text: "In this world, every lie appears above your head.", voice: "georgeLively", gap: 0.05 }, until: { word: "every" }, set: "city", light: "day", transition: "cut",
      camera: { move: "at", pos: [-0.9, 1.65, -2.3], look: [-0.9, 1.8, -5.7], fov: 50 },
      actors: [{ who: "gym", at: "a", act: "proud", facing: 0, gesture: "fists", idle: 0.5 }],
      props: [{ id: "lieSign", at: over([-0.9, 0.15, -5.7], 0.15 + ADULT), variant: "ALL NATURAL", steps: [{ t: 0.12 }] }],
      sfx: [{ t: 0.12, name: "lie_slam", gain: -3 }] },
    { cont: true, until: { word: "above" }, set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-2.6, 1.35, 1.1], look: [-2.6, 1.25, -1.25], fov: 44 },
      actors: [{ who: "bed", at: "sofa", mode: "sit", act: "neutral", facing: 0, gesture: "read", hold: "phone", idle: 0.3 }],
      props: [{ id: "lieSign", at: over([-2.6, 0, -1.25], 1.6), variant: "5 MINS AWAY", steps: [{ t: 0.08 }] }],
      sfx: [{ t: 0.08, name: "lie_slam", gain: -3 }] },
    { cont: true, hold: 0.25, set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-3.0, 0.75, 1.3], look: [-3.2, 0.7, 0.1], fov: 46 },
      actors: [],
      props: [{ id: "farmDog", at: "livingB" }, { id: "lieSign", at: over([-3.2, 0, 0.1], 0.82), variant: "WASN'T ME", scale: 0.8, steps: [{ t: 0.08 }] }],
      sfx: [{ t: 0.08, name: "lie_slam", gain: -3 }] },
    // 3. breakfast: Dad, proud, a smoking charcoal pancake; on "scratch" his sign
    { say: { who: "dad", text: "Made your favourite. From scratch!", voice: "brian", gap: 0.15 }, hold: 0.3, set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [1.75, 1.45, 2.5], look: [2.3, 1.6, -0.55], fov: 50 },
      actors: [{ who: "dad", at: DAD, act: "proud", facing: 0, gesture: "crossArms", idle: 0.4 }],
      props: [{ id: "burntPancake", at: [2.6, 0.92, -0.45] }, { id: "lieSign", at: over(DAD, ADULT + 0.1), variant: "FROM SCRATCH", steps: [{ word: "scratch" }] }],
      sfx: [{ t: 0.1, name: "steam", gain: -10 }, { word: "scratch", name: "lie_slam", gain: -2 }] },
    // 4. Milo crunches the charcoal: a teary thumbs-up; "DELICIOUS"
    { say: { who: "milo", text: "Mmm. Delicious.", voice: "liam", gap: 0.35 }, hold: 0.25, set: "apartment", light: "interior", transition: "cut",
      camera: { move: "at", pos: [3.5, 1.45, 1.35], look: [3.6, 1.45, -0.2], fov: 48 },
      actors: [{ who: "milo", at: KID, act: "nervous", face: "embarrassed", facing: 0, gesture: "thumbsUp", idle: 0.4 }],
      props: [{ id: "lieSign", at: over(KID, HEAD), variant: "DELICIOUS", steps: [{ word: "Delicious" }] }],
      sfx: [{ t: 0.05, name: "thud", gain: -8 }, { t: 0.22, name: "crack", gain: -9 }, { word: "Delicious", name: "lie_slam", gain: -2 }] },
    // 5. THE STARE: both signs up; they read each other's, then look at each other. The music stops (rest);
    //    crickets; a crash zoom on each face
    { dur: 2.2, set: "apartment", light: "interior", transition: "cut", mood: "rest",
      camera: { move: "at", pos: [2.95, 1.9, 3.6], look: [2.95, 1.85, -0.4], fov: 58 },
      cams: [{ t: 1.2, move: "insert", on: "dad.face", size: "close", swoop: 0.2 }, { t: 1.7, move: "insert", on: "milo.face", size: "close", swoop: 0.2 }],
      actors: [{ who: "dad", at: DAD, act: "shock", facing: 1, idle: 0.1, beats: [{ t: 0.1, look: "up" }, { t: 0.9, look: "right" }] },
        { who: "milo", at: KID, act: "shock", facing: -1, idle: 0.1, beats: [{ t: 0.1, look: "up" }, { t: 0.9, look: "left" }] }],
      props: [{ id: "burntPancake", at: [2.6, 0.92, -0.45] }, { id: "lieSign", at: over(DAD, ADULT + 0.1), variant: "FROM SCRATCH" }, { id: "lieSign", at: over(KID, HEAD), variant: "DELICIOUS" }],
      sfx: [{ t: 0.15, name: "crickets", gain: -4 }, { t: 1.2, name: "impact", gain: -6 }, { t: 1.7, name: "impact", gain: -6 }] },
    // 6. class: a low hero shot of the teacher looming over his desk
    { say: { who: "teacher", text: "Milo. Homework?", voice: "matilda", gap: 0.1 }, hold: 0.1, set: "classroom", light: "interior", transition: "cut", mood: "phonk",
      camera: { move: "at", pos: [0.5, 0.85, -0.1], look: [-0.25, 1.75, -0.85], fov: 60 },
      actors: [{ who: "teacher", at: TEACH, act: "suspicious", facing: 0, gesture: "crossArms", idle: 0.3 }, { who: "milo", at: DESK, back: true, act: "nervous", idle: 0.2 }] },
    // 7. instantly: "The dog ate it." The sign; half a second later its footnote
    { say: { who: "milo", text: "The dog ate it.", voice: "liam", gap: 0.05 }, hold: 0.85, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-0.2, 1.6, -2.05], look: [-0.2, 1.72, 0.15], fov: 50 },
      actors: [{ who: "milo", at: DESK, act: "determined", facing: 0, gesture: "shrug", idle: 0.3 }],
      props: [{ id: "lieSign", at: over(DESK, HEAD), variant: "THE DOG ATE IT", steps: [{ word: "it" }] },
        { id: "lieSign", at: over(DESK, HEAD - 0.12, -0.25), variant: "(HE HAS NO DOG)", scale: 0.62, steps: [{ t: 1.6 }] }],
      sfx: [{ word: "it", name: "lie_slam", gain: -2 }, { t: 1.6, name: "pop", gain: -6 }] },
    // 8. whip to the window: the dog from the first gags, pressed to the glass, with its own lie; the class: "Ooooh!"
    { say: { text: "Ooooooooooooooohhh!", voice: "chris", gap: 0.45 }, hold: 0.2, set: "classroom", light: "interior", transition: "whip",
      camera: { move: "at", pos: [-2.3, 1.3, -0.95], look: [-4.0, 1.22, -1.9], fov: 50 },
      actors: [],
      props: [{ id: "farmDog", at: [-4.3, 0.42, -1.9], yaw: 90 }, { id: "lieSign", at: [-3.7, 1.32, -1.9], variant: "DIDN'T EAT IT", scale: 0.6, steps: [{ t: 0.15 }] }],
      sfx: [{ t: 0.15, name: "lie_slam", gain: -3 }] },
    // 9. Milo tries to beat the system: (a) a bucket on his head
    { say: { who: "milo", text: "I'm not hiding.", voice: "liam", gap: 0.1 }, hold: 0.25, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-0.2, 1.9, -2.2], look: [-0.2, 2.1, 0.15], fov: 52 },
      actors: [{ who: "milo", at: DESK, act: "determined", facing: 0, gesture: "crossArms", idle: 0.1 }],
      props: [{ id: "bucket", at: [-0.2, 1.52, 0.15] }, { id: "lieSign", at: over(DESK, HEAD + 0.42), variant: "NOT HIDING", steps: [{ word: "hiding" }] }],
      sfx: [{ t: 0.0, name: "clink", gain: -6 }, { word: "hiding", name: "lie_slam", gain: -3 }] },
    //    (b) a tower of textbooks on his head
    { say: { who: "milo", text: "I'm not hiding.", voice: "liam", gap: 0.1 }, hold: 0.25, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-0.2, 1.9, -2.2], look: [-0.2, 2.1, 0.15], fov: 52 },
      actors: [{ who: "milo", at: DESK, act: "determined", facing: 0, gesture: "crossArms", idle: 0.1 }],
      props: [{ id: "bookStack", at: [-0.2, 1.6, 0.15] }, { id: "lieSign", at: over(DESK, HEAD + 0.42), variant: "NOT HIDING", steps: [{ word: "hiding" }] }],
      sfx: [{ word: "hiding", name: "lie_slam", gain: -3 }] },
    //    (c) under the desk: his voice from under it; a sign above it, and a big arrow pointing down at him
    { say: { text: "...I'm not here.", voice: "liam", gap: 0.15 }, hold: 0.7, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-0.2, 1.3, -2.5], look: [-0.2, 1.05, 0.0], fov: 52 },
      actors: [],
      props: [{ id: "lieSign", at: [-0.2, 1.28, -0.3], variant: "NOT HERE", scale: 0.85, steps: [{ word: "here" }] },
        { id: "lieSign", at: [-0.2, 0.8, -0.35], variant: "v HE'S UNDER HERE", scale: 0.6, steps: [{ t: 1.45 }] }],
      sfx: [{ word: "here", name: "lie_slam", gain: -3 }, { t: 1.45, name: "pop", gain: -5 }] },
    // 10. THE 67 (the peak). (a) Juno leans over: tests are back
    { say: { who: "juno", text: "What'd you get on the test?", voice: "juno", gap: 0.1 }, hold: 0.1, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["juno", "milo"], size: "medium" },
      actors: [{ who: "juno", at: JUNO, act: "thinking", facing: -1, gesture: "hips", idle: 0.3 }, { who: "milo", at: DESK, act: "neutral", facing: 1, idle: 0.2 }] },
    // (b) sunglasses on, a slow push in, the hands like scales: "Six... ...seven." ONE sign (67), then its footnote
    { say: { who: "milo", text: "Six... ...seven.", voice: "liam", gap: 0.1, pauses: [{ after: "Six", s: 0.45 }] }, hold: 1.0, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-0.2, 1.6, 2.7], look: [-0.2, 1.62, 0.15], fov: 50 },
      cams: [{ t: 0.3, move: "at", pos: [-0.2, 1.65, 2.25], look: [-0.2, 1.62, 0.15], fov: 50, glide: 2.2 }],
      actors: [{ who: "milo", at: DESK, act: "determined", facing: 0, gesture: "pump", idle: 0.1, walk: inPlace(DESK, 2, 0.35, 1.9) }],
      props: [{ id: "shades", at: [-0.2, 1.45, 0.43] }, { id: "lieSign", at: over(DESK, HEAD + 0.2), variant: "67", steps: [{ word: "seven" }] },
        { id: "lieSign", at: over(DESK, HEAD + 0.02, 0.25), variant: "(IT WAS 12)", scale: 0.6, steps: [{ t: 2.65 }] }],
      sfx: [{ t: 0.15, name: "swish_soft", gain: -6 }, { word: "seven", name: "lie_slam", gain: 0 }, { t: 2.65, name: "pop", gain: -6 }] },
    // (c) dead silence: the whole class stares at the sign
    { dur: 0.9, set: "classroom", light: "interior", transition: "cut", mood: "rest",
      camera: { move: "at", pos: [0.3, 1.7, 4.4], look: [0.3, 1.6, 0.15], fov: 58 },
      actors: [{ who: "milo", at: DESK, act: "determined", facing: 0, idle: 0.0 }, { who: "juno", at: JUNO, act: "shock", facing: -1, gesture: "hang", idle: 0 },
        { who: "kid1", at: [-0.6, 0, 1.6], back: true, act: "shock", facing: 0, gesture: "hang", idle: 0 }, { who: "kid2", at: [0.4, 0, 2.0], back: true, act: "shock", facing: 0, gesture: "hang", idle: 0 }, { who: "kid3", at: [1.05, 0, 1.5], back: true, act: "shock", facing: 0, gesture: "hang", idle: 0 }],
      props: [{ id: "shades", at: [-0.2, 1.45, 0.43] }, { id: "lieSign", at: over(DESK, HEAD + 0.2), variant: "67" }] },
    // (d) one kid at the back, quietly
    { say: { who: "kid1", text: "...six seven?", voice: "chris", gap: 0.05 }, hold: 0.05, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "closeUp", on: "kid1" },
      actors: [{ who: "kid1", at: [-0.6, 0, 1.6], act: "thinking", facing: 0, gesture: "chin", idle: 0.2 }] },
    // (e) the teacher starts to object...
    { say: { who: "teacher", text: "That's not even a—", voice: "matilda", gap: 0.0 }, hold: 0.0, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "closeUp", on: "teacher" },
      actors: [{ who: "teacher", at: TEACH, act: "angry", facing: 0, idle: 0.2 }] },
    // (f) THE DROP: the class erupts on the desks, everyone doing the 67 hands, chanting; quick cuts
    { say: { text: "SIX SEVEN! SIX SEVEN!", voice: "chris", gap: 0.0 }, hold: 0.0, set: "classroom", light: "interior", transition: "cut", mood: "phonk",
      camera: { move: "at", pos: [0.5, 2.1, 3.9], look: [0.4, 1.35, -0.1], fov: 62 },
      cams: [{ t: 0.6, move: "closeUp", on: "kid2" }],
      actors: [{ who: "kid1", at: [-1.6, DESKTOP, -0.3], act: "excited", facing: 0, gesture: "pump", walk: inPlace([-1.6, DESKTOP, -0.3], 8, 0, 1.6) },
        { who: "kid2", at: [1.2, DESKTOP, 1.0], act: "excited", facing: 0, gesture: "pump", walk: inPlace([1.2, DESKTOP, 1.0], 8, 0, 1.6) },
        { who: "kid3", at: [2.6, DESKTOP, -0.3], act: "excited", facing: 0, gesture: "pump", walk: inPlace([2.6, DESKTOP, -0.3], 8, 0, 1.6) },
        { who: "juno", at: JUNO, act: "excited", facing: 0, gesture: "pump", walk: inPlace(JUNO, 8, 0, 1.6) },
        { who: "milo", at: DESK, act: "determined", facing: 0, gesture: "pump", walk: inPlace(DESK, 8, 0, 1.6) }],
      props: [{ id: "shades", at: [-0.2, 1.45, 0.43] }],
      sfx: [{ t: 0.0, name: "lie_slam", gain: -1 }, { t: 0.02, name: "gasp", gain: -10 }] },
    // (g) again, and the teacher cracks: a crash zoom as she joins in
    { say: { text: "SIX SEVEN! SIX SEVEN!", voice: "chris", gap: 0.0 }, hold: 0.45, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "closeUp", on: "juno" },
      cams: [{ t: 0.55, move: "insert", on: "teacher.face", size: "close", swoop: 0.25 }, { t: 0.95, move: "frame", on: ["teacher"], size: "medium", from: 0 }],
      actors: [{ who: "juno", at: JUNO, act: "excited", facing: 0, gesture: "pump", walk: inPlace(JUNO, 6, 0, 1.2) },
        { who: "teacher", at: TEACH, act: "excited", facing: 0, gesture: "pump", walk: inPlace(TEACH, 8, 0.9, 1.9) }],
      sfx: [{ t: 0.55, name: "whoosh_short", gain: -5 }] },
    // 11. the vow: alone, sincere; the biggest sign yet, enormous behind him, into the ceiling; a crane up
    { say: { who: "milo", text: "From now on... I will never lie again.", voice: "liam", gap: 0.3 }, hold: 1.0, set: "classroom", light: "interior", transition: "cut", mood: "warm",
      camera: { move: "at", pos: [-0.2, 1.45, -1.5], look: [-0.2, 1.5, 0.15], fov: 46 },
      cams: [{ word: "again", move: "at", pos: [-0.2, 1.3, -2.6], look: [-0.2, 2.35, 0.3], fov: 58, glide: 0.8 }],
      actors: [{ who: "milo", at: DESK, act: "proud", facing: 0, gesture: "raiseHand", idle: 0.2 }],
      props: [{ id: "lieSign", at: [-0.2, 1.55, 0.6], variant: "NEVER LIE AGAIN", scale: 2.6, steps: [{ word: "again" }] }],
      sfx: [{ word: "again", name: "lie_slam", gain: 1 }, { word: "again", name: "crack", gain: -4 }] },
    // 12. THE TWIST: the wise moral... and the narrator's own LIE, screen-sized. Silence. "...He did not." (true: no sign)
    { say: { text: "And that's how Milo learned... honesty is the best policy.", voice: "georgeLively", gap: 0.25 }, hold: 1.1, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "at", pos: [0.0, 1.35, -1.6], look: [-0.2, 1.6, 0.15], fov: 44 },
      actors: [{ who: "milo", at: DESK, act: "proud", facing: 0, gesture: "crossArms", idle: 0.2, beats: [{ t: 3.95, look: "up" }, { t: 4.35, look: "camera" }] }],
      props: [{ id: "lieSign", at: [-0.06, 1.47, -1.06], variant: "MILO LEARNED", scale: 0.3, steps: [{ t: 3.8 }] }],
      sfx: [{ t: 3.8, name: "lie_slam", gain: 2 }] },
    { say: { text: "...He did not.", voice: "georgeLively", gap: 0.2 }, hold: 0.35, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: DESK, act: "neutral", facing: 0, idle: 0.2 }],
      sfx: [{ t: 1.05, name: "ding", gain: -8 }] },
    // 13. CTA, to the lens; hard cut on the last word
    { say: { who: "milo", text: "What's your biggest lie?", voice: "liam", gap: 0.1 }, hold: 0.12, set: "classroom", light: "interior", transition: "cut",
      camera: { move: "at", pos: [-0.2, 1.35, -1.05], look: [-0.2, 1.35, 0.15], fov: 46 },
      actors: [{ who: "milo", at: DESK, act: "suspicious", facing: 0, idle: 0.2 }] },
  ],
};
