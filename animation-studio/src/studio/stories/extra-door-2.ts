// "The Extra Door" (Thinkora Video 06, Part 2: interactive horror). It follows Part 1's winning vote, B: RUN DOWNSTAIRS.
// Approved script v2, narration and the opening callback: productions/extra-door-2/ (script.md, narration/,
// opening-callback.md). The narration is LOCKED: the say lines and voices below are the approved text and recordings;
// never edit them. The hook line is ONE recording split across shots 1-2 (until / cont): it starts under the callback
// and carries straight on through the cut into the run.
// Sets: Part 1's upstairs hallway (the callback and the top of the run, down its stairwell) and the Extra Door theme's
// downstairs hall (the photograph twice, the bottom of the stairs, the front door, the old door at the landing).
// What is behind either door is never shown.
import type { Storyboard, V3 } from "../story/types";

// ---- Part 1's marks (hallway) ----
const FINAL: V3 = [0.58, 0, -5.35];                  // Part 1's final composition (the callback)
const STAIRS_TOP: V3 = [-0.47, 0, -4.82];            // the top of Part 1's stairwell
/** a foot on Part 1's flight (ten 0.18 m steps down toward +z from z -4.7): the line through the middle of the treads */
const up = (z: number): V3 => [-0.47, Math.round((-0.18 - 0.72 * (z + 4.575)) * 1000) / 1000, z];
// ---- downstairs marks ----
const SCX = -0.45;                                    // the middle of the downstairs flight
/** a foot on the downstairs flight (0.2 m risers, 0.25 m treads, the bottom riser at z -1.3), lifted by `lift` */
const down = (z: number, lift = 0): V3 => [SCX, Math.round((Math.max(0, Math.min(2.6, 0.2 + 0.8 * (-1.425 - z))) + lift) * 1000) / 1000, z];
const MID: V3 = [0.55, 0, -2.4];                      // in the corridor beside the stairs, between the two doors
// the photograph: its back on the line through the step edges (the photoStairs mark), the camera along its normal
const PHOTO_CAM = { move: "at" as const, pos: [-0.45, 3.6, -1.86] as V3, look: [-0.45, 1.8, -3.3] as V3, fov: 60 };
/** shot time at which a walk (smoothstep-eased from t0 to t1) reaches fraction f of its way */
const walkAt = (t0: number, t1: number, f: number) => { let lo = 0, hi = 1; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (m * m * (3 - 2 * m) < f) lo = m; else hi = m; } return Math.round((t0 + (t1 - t0) * lo) * 100) / 100; };
// shot 6: he runs from z -4.3 to -1.95; the foot lands on the photo's middle (z -3.25)
const CRACK_T = walkAt(0, 1.7, (4.3 - 3.25) / (4.3 - 1.95));

export const EXTRADOOR2: Storyboard = {
  id: "extra-door-2", title: "The Extra Door (Part 2)",
  cast: { milo: "milo" },
  // the music drops out on the window message's buzz (the end of "Come back up, Milo.", the 2nd "Milo") and comes back
  // only with the button chord at the end
  music: { mood: "mystery", gain: -3 }, musicDrop: { word: "Milo", n: 2 }, motionBlur: true, controlledBlur: true, engine: 3,
  autoSfx: false, // as Part 1: every effect is cued explicitly (no cartoon pops)
  shots: [
    // 1. THE CALLBACK: Part 1's final composition, exactly as Part 1 left it; B is selected as the latch clicks (green
    //    outline and glow, a pop, "YOU CHOSE B"), A dims; Milo turns and bolts for the stairs at once; his breathless
    //    count starts under the card. Hard cut on "thirteen" (the line carries on in shot 2).
    { say: { text: "...twelve... thirteen... ...fourteen?", voice: "liamQuiet", gap: 0.50 }, until: { word: "thirteen" }, set: "hallway", light: "interiorCool",
      camera: { move: "at", pos: [0.4, 2.15, -0.5], look: [-0.366, 0.605, -6.9], fov: 58 },
      cams: [{ t: 0, move: "at", pos: [0.4, 2.15, -0.5], look: [-0.366, 0.605, -6.9], fov: 58, blockOk: true }],
      actors: [{ who: "milo", at: FINAL, act: "scared", face: "scared", facing: 0, idle: 0.3, walk: { to: STAIRS_TOP, t0: 0.15, t1: 1.45, mode: "run" } }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }, { id: "photoFrame", at: "photo" },
        { id: "choiceLabelDimmed", at: [0.417, 1.713, -2.617], variant: "A: OPEN THE DOOR", scale: 1.114, steps: [{ t: 0.1 }] },
        { id: "choiceLabelChosen", at: [-0.102, 1.227, -2.435], variant: "B: RUN DOWNSTAIRS", scale: 1.089, steps: [{ t: 0.1 }] }],
      sfx: [{ t: 0.1, name: "latch_click", gain: -2 }, { t: 0.5, name: "step_floor", gain: -3 }, { t: 0.78, name: "step_floor", gain: -3 }, { t: 1.05, name: "step_floor", gain: -3 }] },
    // 2. HOOK: low in the stairwell, he hammers down toward the lens; on "fourteen?" the camera drops past him to the
    //    steps below, falling away into the dark
    { cont: true, hold: 0.12, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [-0.5, -1.0, -2.45], look: [-0.47, -0.15, -4.0], fov: 55 },
      cams: [{ word: "fourteen", move: "at", pos: [-0.48, -0.8, -2.75], look: [-0.48, -2.15, -2.25], fov: 58, swoop: 0.4 }],
      actors: [{ who: "milo", at: up(-4.45), act: "scared", face: "scared", idle: 0.3, walk: { to: up(-3.2), t0: 0.0, t1: 2.0, mode: "run" } }],
      sfx: [{ t: 0.12, name: "step_floor", gain: -2 }, { t: 0.42, name: "step_floor", gain: -2 }, { t: 0.72, name: "step_floor", gain: -2 }, { t: 1.02, name: "step_floor", gain: -3 }] },
    // 3. from low in the well: he comes down at us; up behind him, past the top of the stairs, the old door
    { say: { text: "Last night, Milo's hallway grew an extra door.", voice: "georgeHushed", gap: 0.16 }, hold: 0.35, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [-0.5, -0.85, -2.6], look: [-0.15, 1.0, -7.0], fov: 50 },
      actors: [{ who: "milo", at: up(-4.55), act: "scared", idle: 0.3, walk: { to: up(-3.5), t0: 0.0, t1: 3.0, mode: "run" } }],
      props: [{ id: "oldDoor", at: "oldDoor", variant: "handle" }],
      sfx: [{ t: 0.3, name: "step_floor", gain: -4 }, { t: 0.9, name: "step_floor", gain: -4 }, { t: 1.5, name: "step_floor", gain: -4 }, { t: 2.1, name: "step_floor", gain: -4 }, { t: 2.7, name: "step_floor", gain: -5 }] },
    // 4. high over the well's edge: he glances back up as he runs
    { say: { text: "You told him to run.", voice: "georgeHushed", gap: 0.16 }, hold: 0.34, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [-0.12, 2.3, -3.3], look: [-0.5, -0.8, -3.65], fov: 52 },
      actors: [{ who: "milo", at: up(-4.3), act: "scared", idle: 0.3, walk: { to: up(-2.8), t0: 0.0, t1: 1.7, mode: "run" }, beats: [{ word: "told", look: "up" }, { word: "run", look: "down" }] }],
      sfx: [{ t: 0.25, name: "step_floor", gain: -4 }, { t: 0.65, name: "step_floor", gain: -4 }, { t: 1.05, name: "step_floor", gain: -4 }, { t: 1.45, name: "step_floor", gain: -5 }] },
    // 5. straight down the stairwell: Milo small, the steps falling away below him into the dark
    { say: { text: "His stairs have thirteen steps.", voice: "georgeHushed", gap: 0.16 }, hold: 0.13, set: "hallway", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [-0.47, 2.3, -3.25], look: [-0.47, -2.2, -3.5], fov: 62 },
      actors: [{ who: "milo", at: up(-4.2), act: "scared", idle: 0.3, walk: { to: up(-2.55), t0: 0.0, t1: 2.3, mode: "run" } }],
      sfx: [{ t: 0.3, name: "step_floor", gain: -5 }, { t: 0.8, name: "step_floor", gain: -5 }, { t: 1.3, name: "step_floor", gain: -5 }, { t: 1.8, name: "step_floor", gain: -6 }] },
    // 6. THE PHOTOGRAPH, square to the lens on the steps, clearly Milo and Juno; his sneakers come down from the top of
    //    the frame and land on it: the glass cracks; he runs on, out of the bottom of the frame
    { dur: 1.6, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: PHOTO_CAM,
      actors: [{ who: "milo", at: down(-4.3, 0.1), act: "scared", idle: 0.3, walk: { to: down(-1.95, 0.1), t0: 0.0, t1: 1.7, mode: "run" } }],
      props: [{ id: "photoOnStairs", at: "photoStairs", steps: [{ t: CRACK_T }] }],
      sfx: [{ t: 0.3, name: "step_floor", gain: -4 }, { t: CRACK_T - 0.02, name: "step_floor", gain: -4 }, { t: CRACK_T, name: "glass_crack", gain: -1 }, { t: 1.2, name: "step_floor", gain: -4 }] },
    // 7. the run: his legs and the banister rushing past
    { dur: 1.0, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.95, 1.05, -2.5], look: [-0.45, 1.75, -3.45], fov: 46 },
      cams: [{ t: 0, move: "at", pos: [0.95, 1.05, -2.5], look: [-0.45, 1.75, -3.45], fov: 46, blockOk: true },
        { t: 0.5, move: "at", pos: [-0.05, 1.75, -1.85], look: [-0.5, 1.0, -2.75], fov: 52 }],
      actors: [{ who: "milo", at: down(-4.4), act: "scared", idle: 0.3, walk: { to: down(-2.2), t0: 0.0, t1: 1.1, mode: "run" } }],
      sfx: [{ t: 0.15, name: "step_floor", gain: -4 }, { t: 0.45, name: "step_floor", gain: -4 }, { t: 0.75, name: "step_floor", gain: -4 }] },
    // 8. THE SAME PHOTOGRAPH: the exact framing of shot 6, the same photo, the same crack; his feet skid to a stop on
    //    the step above it. Hold.
    { dur: 2.2, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: PHOTO_CAM,
      actors: [{ who: "milo", at: down(-4.4, 0.1), act: "scared", idle: 0.25, walk: { to: [SCX, 2.2, -3.97], t0: 0.0, t1: 0.5, mode: "run" },
        beats: [{ t: 0.6, act: "shock", face: "shock", look: "down" }] }],
      props: [{ id: "photoOnStairs", at: "photoStairs", variant: "cracked" }],
      sfx: [{ t: 0.12, name: "step_floor", gain: -4 }, { t: 0.4, name: "step_floor", gain: -3 }, { t: 0.56, name: "step_floor", gain: -1 }] },
    // 9. he bolts past it and hits the bottom hard
    { dur: 1.35, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.95, 1.1, 0.55], look: [-0.45, 0.85, -1.5], fov: 50 },
      actors: [{ who: "milo", at: down(-2.55), act: "scared", idle: 0.3, walk: { to: [SCX, 0, -0.75], t0: 0.0, t1: 1.05, mode: "run" }, beats: [{ t: 1.05, act: "shock" }] }],
      sfx: [{ t: 0.25, name: "step_floor", gain: -3 }, { t: 0.6, name: "step_floor", gain: -3 }, { t: 1.03, name: "thud", gain: -4 }] },
    // 10. close-up, panting: "...twenty-six." (no speaker tag, as Part 1's whispered lines: the scared face holds)
    { say: { text: "...twenty-six.", voice: "liamQuiet", gap: 0.21 }, hold: 0.30, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: [SCX, 0, -0.75], act: "scared", face: "scared", facing: 0, idle: 0.6 }] },
    // 11. HE LOOKS BACK UP: an ordinary staircase, thirteen steps, the dim lamp at the landing. No photograph anywhere.
    { dur: 2.8, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [-0.25, 1.55, 0.45], look: [-0.45, 3.2, -5.5], fov: 50 },
      actors: [{ who: "milo", at: [SCX, 0, -0.75], back: true, act: "scared", idle: 0.3 }] },
    // 12. the downstairs hall: he goes toward the front door, its frosted glass glowing amber; the voice from upstairs
    //     stops him, eyes to the ceiling
    { say: { text: "Milo? Where did you go?", voice: "juno", gap: 0.71 }, hold: 0.41, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.55, 1.55, 1.0], look: [0.4, 1.1, -6.0], fov: 46 },
      actors: [{ who: "milo", at: [SCX, 0, -0.75], act: "nervous", idle: 0.3, walk: { to: MID, t0: 0.0, t1: 1.6, mode: "walk" }, beats: [{ word: "Milo", look: "up" }] }],
      props: [{ id: "frontDoor", at: "frontDoor" }],
      sfx: [{ t: 0.35, name: "step_floor", gain: -6 }, { t: 0.9, name: "step_floor", gain: -6 }, { t: 1.45, name: "step_floor", gain: -7 }] },
    // 13. he freezes; the phone buzzes in his hand
    { dur: 1.0, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "medium", from: 12 },
      actors: [{ who: "milo", at: MID, act: "nervous", facing: 0, gesture: "read", hold: "phone", idle: 0.2, beats: [{ t: 0.65, act: "shock" }] }],
      sfx: [{ t: 0.6, name: "phone_buzz", gain: -2 }] },
    // 14. the phone, readable, held: the same chat as Part 1, and Juno's new message
    { dur: 2.8, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "insert", on: "phoneOutside", size: "macro" },
      actors: [{ who: "milo", at: MID, act: "nervous", facing: 0, idle: 0.2 }],
      props: [{ id: "phoneOutside", at: [MID[0], 1.08, MID[2] + 0.32], variant: "msg1" }] },
    // 15. his face in the phone's light: the phone, the front door, the stairs; the voice again, closer
    { say: { text: "Come back up, Milo.", voice: "juno", gap: 0.93 }, hold: 0.03, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: MID, act: "nervous", facing: 0, gesture: "read", hold: "phone", idle: 0.2,
        beats: [{ t: 0.0, look: "down" }, { word: "Come", look: "right" }, { word: "up", look: "up" }] }] },
    // 16. buzz: the window message. The music cuts out on it.
    { dur: 2.8, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "insert", on: "phoneOutside", size: "macro" },
      actors: [{ who: "milo", at: MID, act: "nervous", facing: 0, idle: 0.2 }],
      props: [{ id: "phoneOutside", at: [MID[0], 1.08, MID[2] + 0.32], variant: "msg1", steps: [{ t: 0.04 }] }],
      sfx: [{ t: 0.03, name: "phone_buzz", gain: -2 }] },
    // 17. THE WARNING: about a second of dead silence, then the cold voice from the top of the stairs; a swoop into his
    //     eyes on "Don't"; a second of silence after it
    { say: { text: "Don't open it. That's not me.", voice: "junoCold", gap: 0.97 }, hold: 1.0, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      cams: [{ word: "Don't", move: "insert", on: "milo.face", size: "extreme", swoop: true }],
      actors: [{ who: "milo", at: MID, act: "nervous", facing: 0, gesture: "read", hold: "phone", idle: 0.2, beats: [{ word: "Don't", act: "shock" }] }] },
    // 18. HE LOOKS BACK UP THE STAIRS: low behind him, the flight rising, and at the top, where the landing was, the old
    //     door, the cold light under it broken by two shadows
    { dur: 3.2, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.85, 0.75, -1.2], look: [-0.4, 3.4, -6.0], fov: 50 },
      cams: [{ t: 0, move: "at", pos: [0.85, 0.75, -1.2], look: [-0.4, 3.4, -6.0], fov: 50, blockOk: true }],
      actors: [{ who: "milo", at: MID, back: true, act: "scared", hold: "phone", idle: 0.2 }],
      props: [{ id: "oldDoor", at: "landingDoor", variant: "shadows" }, { id: "frontDoor", at: "frontDoor" }],
      sfx: [{ t: 0.35, name: "creak", gain: -6 }] },
    // 19. THREE KNOCKS ON THE FRONT DOOR (Part 1's knock recording, its rhythm), one hard cut each: the frosted glass
    //     shudders, nobody's shadow behind it / his head snaps round / the old door at the top of the stairs, still
    { dur: 3.4, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.72, 1.5, -4.55], look: [0.75, 1.45, -6.0], fov: 48 },
      cams: [{ t: 1.1, move: "closeUp", on: "milo" }, { t: 2.2, move: "at", pos: [-0.2, 1.75, -1.55], look: [-0.45, 3.6, -6.0], fov: 38 }],
      actors: [{ who: "milo", at: MID, act: "scared", facing: 0, hold: "phone", idle: 0.2, beats: [{ t: 1.1, act: "shock", look: "right" }] }],
      props: [{ id: "frontDoor", at: "frontDoor", steps: [{ t: 0.0 }, { t: 1.1 }, { t: 2.2 }] }, { id: "oldDoor", at: "landingDoor", variant: "shadows" }],
      sfx: [{ t: 0.0, name: "knock_heavy", gain: -3 }, { t: 1.1, name: "knock_heavy", gain: -3 }, { t: 2.2, name: "knock_heavy", gain: -3 }] },
    // 20. he turns to the lens: "...which one is her?" (no speaker tag, as Part 1's "...what do I do?")
    { say: { text: "...which one is her?", voice: "liamQuiet", gap: 0.55 }, hold: 0.45, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "milo" },
      actors: [{ who: "milo", at: MID, act: "scared", face: "scared", facing: 0, hold: "phone", idle: 0.2, beats: [{ t: 0.0, look: "camera" }] }] },
    // 21. THE CHOICE: from the back of the hall, Milo between the two doors: the front door at the end of the corridor,
    //     the stairs rising to the old door; Part 1's labels pop in on "A" and "B"; cut to black on the latch click
    { say: { text: "Comment A or B. Your vote decides Part 3.", voice: "georgeHushed", gap: 0.95 }, hold: 1.9, set: "downstairs", light: "interiorCool", transition: "cut",
      camera: { move: "at", pos: [0.7, 1.55, 0.9], look: [0.05, 1.95, -6.0], fov: 60 },
      actors: [{ who: "milo", at: [0.3, 0, -2.1], act: "scared", facing: 0, hold: "phone", idle: 0.3, beats: [{ word: "A", look: "right" }, { word: "B", look: "up" }] }],
      props: [{ id: "oldDoor", at: "landingDoor", variant: "shadows" }, { id: "frontDoor", at: "frontDoor" },
        { id: "choiceLabel", at: [0.62, 1.05, -1.6], variant: "A: OPEN THE FRONT DOOR", scale: 0.55, steps: [{ word: "A" }] },
        { id: "choiceLabel", at: [-0.12, 1.55, -1.35], variant: "B: GO BACK UPSTAIRS", scale: 0.55, steps: [{ word: "B" }] }],
      sfx: [{ t: 5.83, name: "latch_click", gain: -2 }] },
  ],
};
