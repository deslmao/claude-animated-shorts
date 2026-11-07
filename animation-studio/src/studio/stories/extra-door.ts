// "The Extra Door" (Thinkora Video 05, Part 1: interactive horror). Approved script, narration and storyboard design:
// productions/extra-door/ (script.md, narration/narration-review.md, storyboard-design.md, checkpoints/). The narration
// is LOCKED: the say lines and voices below are the approved text, recordings and timing; never edit them. Lines 7 and
// 8 are deliberately identical (same voice, same text): the voice cache plays ONE recording twice, 1.0 s apart.
// Set: the extradoor theme's hallway at night (interiorCool): seven cream doors, the mid-hall stairwell (top toward
// the old door), the clean wallpaper patch + bare nail on the end wall, the photo of Milo and Juno on the floor.
// What is behind the door is never shown. Camera: purposeful moves only: hard cuts on the knocks, one whip (the
// count), glides (the count, the clue), one swoop (the stinger), one push (the repeat); controlled motion blur.
import type { Storyboard, V3, SfxSpec } from "../story/types";

// Milo's marks
const START: V3 = [0.55, 0, -3.2];  // the walkway beside the stairwell: fully in the opening wide, door visible
const DOOR: V3 = [0.2, 0, -5.35];    // as close to the old door as the fallen photo lets him
const BACK: V3 = [0.6, 0, -5.0];    // backed away: between the door and the top of the stairs
const FINAL: V3 = [0.58, 0, -5.35];  // the final composition (clear of the door, the stairs and the Shorts buttons)
// the clock ticking downstairs: one tick a second from the start until it stops (the insert in the approach shot)
const ticks = (t0: number, t1: number, phase = 0): SfxSpec[] => {
  const out: SfxSpec[] = [];
  for (let t = t0 + phase; t < t1; t += 1.0) out.push({ t: Math.round(t * 100) / 100, name: "clock_tick", gain: -10 });
  return out;
};

export const EXTRADOOR: Storyboard = {
  id: "extra-door", title: "The Extra Door (Part 1)",
  cast: { milo: "milo" },
  music: { mood: "mystery", gain: -3 }, musicDrop: { word: "in", n: 2 }, motionBlur: true, controlledBlur: true, engine: 3,
  // the automatic effects are off: they put a cartoon "pop" on every "shock" (over the second knock and the stinger).
  // The ones this film needs are cued explicitly below at the same moments: the whip whoosh, the two footsteps
  autoSfx: false,
  shots: [
    // 1. HOOK: extreme close-up on his eyes, mid-count; they lock on "eight?"
    // (his whisper plays over the shot without a speaker tag: a speaking card takes the engine's talking faces, which
    //  read as cheerful in a close-up; this way the eyes keep the scared face. Same recording, timing and caption)
    { say: { text: "...six... seven... ...eight?", voice: "liamQuiet" }, hold: 0.15, set: "hallway", light: "interiorCool",
      camera: { move: "at", pos: [0.562, 1.46, -2.6], look: [0.562, 1.44, -3.2], fov: 37 }, // his eyes and brows (face centre 1.37 m, from the engine)
      actors: [{ who: "milo", at: START, act: "scared", face: "scared", facing: 0, idle: 0.4,
        beats: [{ word: "six", look: "left" }, { word: "seven", look: "right" }, { word: "eight", face: "shock", look: "camera" }] }],
      sfx: ticks(0.3, 2.5) },
    // 2. the symmetrical wide: seven doors and the one that doesn't belong; Milo's back, beside the stairwell
    { say: { text: "Milo's hallway has seven doors... It always has.", voice: "georgeHushed", gap: 0.22 }, hold: 0.45, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.35, 1.0, 1.45], look: [0.0, 1.02, -6.9], fov: 50 },
      actors: [{ who: "milo", at: START, back: true, act: "neutral", idle: 0.3 }],
      props: [{ id: "oldDoor", at: "oldDoor" }, { id: "photoFrame", at: "photo" }],
      sfx: ticks(0.2, 4.0) },
    // 3. reverse angle: he rubs his eyes, laughs it off; the stairwell beside him (choice B's escape route)
    { say: { who: "milo", text: "Okay. I'm just tired.", voice: "liamQuiet", gap: 0.3 }, hold: 0.45, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.4, 1.45, -4.95], look: [0.55, 1.4, -3.2], fov: 42 },
      actors: [{ who: "milo", at: START, act: "sleepy", facing: 0, gesture: "facepalm", beats: [{ word: "I'm", act: "nervous" }] }],
      sfx: [...ticks(0.3, 2.3), { t: 2.25, name: "whoosh_short" }] },
    // 4. the recount: a whip into a wide over-the-shoulder (Milo small, toward the right), then ONE HARD CUT PER
    //    NUMBER, each onto one door, the door large at one side of the frame with the hallway beyond it: first the four
    //    doors behind him (looking back toward the near end: right, left, right, left, each one further away), then
    //    "five" back on the wide as he faces the far end (his own door, beside him), then the two far doors past him;
    //    his POV on "eight." (the impossible door, revealed last)
    { say: { who: "milo", text: "One, two, three, four, five, six, seven... ...eight.", voice: "liamQuiet", gap: 0.3 }, hold: 0.35, set: "hallway", light: "interiorCool", transition: "whip",
      camera: { move: "at", pos: [-0.3, 1.62, 1.35], look: [0.2, 1.15, -6.9], fov: 50 },
      cams: [
        { word: "One", move: "at", pos: [-0.3, 1.55, -3.0], look: [0.65, 1.1, -0.4], fov: 64 },   // door 1: right (z -1.2)
        { word: "two", move: "at", pos: [0.4, 1.55, -2.7], look: [-0.65, 1.1, -0.1], fov: 64 },   // door 2: left (z -0.9)
        { word: "three", move: "at", pos: [-0.3, 1.42, -1.3], look: [0.65, 0.98, 1.3], fov: 64 },  // door 3: right, by the near wall
        { word: "four", move: "at", pos: [0.4, 1.42, -1.2], look: [-0.65, 0.98, 1.4], fov: 64 },   // door 4: left, by the near wall
        { word: "five", move: "at", pos: [-0.3, 1.62, 1.35], look: [0.2, 1.15, -6.9], fov: 50 },  // door 5: the wide; his own door, beside him
        { word: "six", move: "at", pos: [-0.3, 1.55, -3.35], look: [0.75, 1.1, -5.0], fov: 64 },  // door 6: right, past him (z -4.6)
        { word: "seven", move: "at", pos: [0.45, 1.55, -3.7], look: [-0.6, 1.1, -6.0], fov: 64 }, // door 7: left, by the end wall (z -5.6)
        { word: "eight", move: "pov", from: "milo", at: "oldDoor" },
      ],
      // a still, tense pose seen from behind: arms folded in front (crossArms keeps his talking from adding a hand
      // gesture, which stuck an arm out sideways from behind his hoodie)
      actors: [{ who: "milo", at: START, back: true, act: "neutral", gesture: "crossArms", idle: 0.2 }],
      props: [{ id: "oldDoor", at: "oldDoor" }, { id: "photoFrame", at: "photo" }],
      sfx: ticks(0.4, 3.9) },
    // 5. the clue in one vertical framing (bare nail, clean patch, the door through it), then one glide down to the photo
    { say: { who: "milo", text: "...that's where our picture hangs.", voice: "liamQuiet", gap: 1.22 }, hold: 0.1, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.42, 1.5, -4.15], look: [0.0, 1.15, -7.0], fov: 64 },
      cams: [{ word: "picture", move: "at", pos: [0.18, 1.32, -5.05], look: [0.0, 0.02, -6.1], fov: 50, glide: 1.1 }],
      actors: [{ who: "milo", at: START, act: "scared", facing: 0, idle: 0.3 }],
      props: [{ id: "oldDoor", at: "oldDoor" }, { id: "photoFrame", at: "photo" }],
      sfx: ticks(0.5, 3.0) },
    // 6. close-up: one slow breath
    { dur: 0.8, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: START, act: "scared", facing: 0, idle: 0.3 }],
      sfx: ticks(0.4, 0.8) },
    // 7. the approach: a slow over-the-shoulder push as he walks; one insert on the wall clock as its ticking stops;
    //    back over the shoulder as his hand rises toward the wood
    { dur: 4.9, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [-0.4, 1.78, -0.7], look: [0.5, 1.0, -6.9], fov: 50 },
      cams: [
        { t: 0.05, move: "at", pos: [-0.35, 1.76, -1.9], look: [0.5, 1.0, -6.9], fov: 50, glide: 2.3 },
        { t: 2.4, move: "at", pos: [-0.2, 1.9, -5.95], look: [-0.9, 1.95, -6.45], fov: 52 },
        { t: 3.45, move: "at", pos: [-0.3, 1.72, -2.9], look: [0.3, 1.0, -6.9], fov: 50 },
      ],
      actors: [{ who: "milo", at: START, back: true, act: "neutral", idle: 0.3, walk: { to: DOOR, t0: 0.2, t1: 3.3, mode: "walk" },
        beats: [{ t: 4.0, gesture: "stop" }] }],
      props: [{ id: "oldDoor", at: "oldDoor" }, { id: "photoFrame", at: "photo" }],
      sfx: [...ticks(0.25, 2.9), { t: 1.1, name: "creak", gain: -8 }, { t: 1.41, name: "step_floor" }, { t: 2.12, name: "step_floor" }, { t: 2.9, name: "creak", gain: -10 }] },
    // 8. THREE KNOCKS, three hard cuts (one heavy-knock recording, cued on each cut with its reaction):
    //    the door shudders (frontal) / Milo's hand snaps back / the light under the door breaks into two shadows
    { dur: 3.5, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [-0.1, 1.0, -5.75], look: [0.0, 0.97, -7.0], fov: 72 },
      cams: [
        { t: 1.1, move: "closeUp", on: "milo" },
        { t: 2.2, move: "at", pos: [0.01, 0.5, -6.0], look: [0.01, 0.04, -6.95], fov: 56 },
      ],
      actors: [{ who: "milo", at: DOOR, act: "nervous", facing: 0, gesture: "stop", idle: 0.2, beats: [{ t: 1.1, act: "shock" }] }],
      props: [{ id: "oldDoor", at: "oldDoor", steps: [{ t: 0.0 }, { t: 1.1 }, { t: 2.2 }] }, { id: "photoFrame", at: "photo" }],
      sfx: [{ t: 0.0, name: "knock_heavy", gain: -3 }, { t: 1.1, name: "knock_heavy", gain: -3 }, { t: 2.2, name: "knock_heavy", gain: -3 }] }, // heavy, not a jump scare
    // 9. close-up, frozen: "...Juno?"
    { say: { who: "milo", text: "...Juno?", voice: "liamQuiet", gap: 0.69 }, hold: 0.95, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: DOOR, act: "nervous", facing: 0, idle: 0.2 }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }] },
    // 10. the voice: relief, half a step toward the door
    { say: { text: "Milo... it's me. Let me in.", voice: "juno", gap: 0.18 }, hold: 0.0, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "medium", from: -18 },
      actors: [{ who: "milo", at: DOOR, act: "relief", face: "relief_open", facing: 0, idle: 0.4 }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }] },
    // 11. the identical recording again (1.0 s of silence before it): cut on the repeat, the film's one slow push;
    //     he stops dead, the relief drains away. The music drops out as it ends.
    { say: { text: "Milo... it's me. Let me in.", voice: "juno", gap: 0.92 }, hold: 1.2, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "pushIn", on: ["milo"], size: "medium", to: "close" },
      actors: [{ who: "milo", at: DOOR, act: "relief", facing: 0, idle: 0.2, beats: [{ word: "it's", act: "suspicious" }, { word: "in", act: "scared" }] }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }] },
    // 12. he backs away and pulls out his phone
    { dur: 1.8, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.3, 1.45, -2.75], look: [0.35, 1.1, -5.6], fov: 48 },
      actors: [{ who: "milo", at: DOOR, act: "scared", idle: 0.3, walk: { to: BACK, t0: 0.0, t1: 1.0, mode: "walk" }, // moving from the first frame (no held frame after the cut)
        beats: [{ t: 1.15, gesture: "read", hold: "phone", act: "nervous" }] }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }, { id: "photoFrame", at: "photo" }] },
    // 13. macro on the phone: "are you home?" typed, sent
    { dur: 1.8, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "insert", on: "phoneScreen", size: "macro" },
      actors: [{ who: "milo", at: BACK, act: "nervous", facing: 0, idle: 0.2 }],
      props: [{ id: "phoneScreen", at: [BACK[0], 1.08, BACK[2] + 0.32], steps: [{ t: 0.1 }, { t: 1.25 }] }],
      sfx: [{ t: 0.12, name: "phone_tap", gain: -2 }, { t: 1.3, name: "swish_soft", gain: -10 }] },
    // 14. close-up, waiting: his eyes flick to the door and back
    { dur: 1.5, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: BACK, act: "nervous", facing: 0, gesture: "read", hold: "phone", idle: 0.2, beats: [{ t: 0.4, look: "up" }, { t: 1.0, look: "down" }] }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }] },
    // 15. buzz: Juno's reply, held 2 s, large and readable
    { dur: 2.1, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "insert", on: "phoneScreen", size: "macro" },
      actors: [{ who: "milo", at: BACK, act: "nervous", facing: 0, idle: 0.2 }],
      props: [{ id: "phoneScreen", at: [BACK[0], 1.08, BACK[2] + 0.32], variant: "sent", steps: [{ t: 0.1 }] }],
      sfx: [{ t: 0.08, name: "phone_buzz", gain: -2 }] },
    // 16. the stinger: a swoop into his eyes on "Don't text her."
    { say: { text: "Don't text her.", voice: "junoCold", gap: 0.49 }, hold: 1.5, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      cams: [{ word: "Don't", move: "insert", on: "milo.face", size: "extreme", swoop: true }],
      actors: [{ who: "milo", at: BACK, act: "nervous", facing: 0, gesture: "read", hold: "phone", idle: 0.2, beats: [{ word: "Don't", act: "shock" }] }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }] },
    // 17. wide from behind him: the door ahead; a low wood strain
    { dur: 1.1, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.78, 1.7, -3.45], look: [0.05, 1.0, -7.0], fov: 44 },
      actors: [{ who: "milo", at: BACK, back: true, act: "neutral", idle: 0.2 }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows" }, { id: "photoFrame", at: "photo" }],
      sfx: [{ t: 0.1, name: "creak", gain: -4 }] },
    // 18. macro on the bare wood: a brass handle pushes out through it, then slowly turns down. Click.
    { dur: 3.0, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.12, 1.12, -6.45], look: [0.2, 1.0, -7.0], fov: 40 },
      actors: [],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "shadows", steps: [{ t: 0.3 }, { t: 1.6 }] }],
      sfx: [{ t: 0.3, name: "crack", gain: -4 }, { t: 1.1, name: "creak", gain: -6 }, { t: 2.3, name: "latch_click" }] },
    // 19. close-up: he swallows
    { dur: 1.6, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: BACK, act: "scared", facing: 0, gesture: "read", hold: "phone", idle: 0.2 }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }] },
    // 20. he turns to the lens: he is asking us
    { say: { who: "milo", text: "...what do I do?", voice: "liamQuiet", gap: 0.17 }, hold: 0.45, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: BACK, act: "scared", face: "scared", facing: 0, idle: 0.2, beats: [{ t: 0.0, look: "camera" }] }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }] },
    // 21. THE CHOICE: high wide, locked off; the door ahead (handle turned), the stairwell to his side; flat A / B
    //     screen labels pop in on the narrator's "A" and "B" (placed along the camera's rays to empty parts of the
    //     frame, inside the Shorts safe area and clear of the caption band); a second latch click ends the film
    { say: { text: "Comment A or B. Your vote decides Part 2.", voice: "georgeHushed", gap: 0.06 }, hold: 1.9, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.4, 2.15, -0.5], look: [-0.366, 0.605, -6.9], fov: 58 },
      // the same framing as a beat from frame 0, marked blockOk: the newel post at the top of the stairs is the
      // intended foreground (the line to the look point grazes it; it hides no subject)
      cams: [{ t: 0, move: "at", pos: [0.4, 2.15, -0.5], look: [-0.366, 0.605, -6.9], fov: 58, blockOk: true }],
      actors: [{ who: "milo", at: FINAL, act: "scared", facing: 0, idle: 0.3, beats: [{ word: "A", look: "up" }, { word: "B", look: "left" }] }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }, { id: "photoFrame", at: "photo" },
        { id: "choiceLabel", at: [0.417, 1.713, -2.617], variant: "A: OPEN THE DOOR", scale: 1.114, steps: [{ word: "A" }] },
        { id: "choiceLabel", at: [-0.102, 1.227, -2.435], variant: "B: RUN DOWNSTAIRS", scale: 1.089, steps: [{ word: "B" }] }],
      sfx: [{ t: 4.55, name: "latch_click", gain: -2 }] },
  ],
};
