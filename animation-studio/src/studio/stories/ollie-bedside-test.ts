// VISUAL TEST ONLY (owner-authorised, productions/what-ollie-says): the bedside ritual with EXISTING poses only.
// Kneeling = Kate behind the bed at the set's `kneel` mark (0.36 m below the floor: the bed hides her legs).
// Sitting up in bed = Ollie in `sit` mode on the mattress, the duvet over his legs. Asleep = only his head above the
// duvet. Hands joined = the existing "offer" gesture reaching for the other actor. No new engine pose.
import type { Storyboard } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const shot = (note: string, set: string, light: "interiorCool" | "night", camera: ReturnType<typeof at>, actors: NonNullable<Storyboard["shots"][number]["actors"]>) =>
  ({ set, light, dur: 1.4, camera, cams: [{ t: 0, ...camera, blockOk: true }], actors, note });

export const OLLIE_BEDSIDE_TEST: Storyboard = {
  id: "ollie-bedside-test", title: "What Ollie Says at 3 A.M.: bedside ritual visual test",
  cast: { kate: "kate", ava: "ava", ollie: "ollie" },
  captions: false, music: false, engine: 3, autoSfx: false,
  shots: [
    // 1: the ritual, wide: Kate kneeling at the bedside, Ollie sitting up, their hands joined
    shot("1 the ritual: Kate kneels, Ollie answers", "ollieRoom", "interiorCool", at([-0.45, 1.3, 2.0], [0.85, 0.85, -0.6], 42),
      [{ who: "kate", at: "kneel", act: "neutral", face: "blank", facing: "toward:ollie", gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "neutral", facing: "toward:kate", gesture: "offer", reach: "kate" }]),
    // 2: closer, from the foot of the bed: her unblinking face, his sleepy one
    shot("2 the ritual, close", "ollieRoom", "interiorCool", at([-0.35, 1.15, 1.15], [0.88, 1.05, -0.75], 36),
      [{ who: "kate", at: "kneel", act: "neutral", face: "blank", facing: "toward:ollie", gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "neutral", facing: "toward:kate", gesture: "offer", reach: "kate" }]),
    // 3: the same at night (the hidden-phone look will sit on top of this later)
    shot("3 the ritual at night", "ollieRoom", "night", at([-1.3, 1.6, 0.85], [0.9, 0.8, -0.6], 50),
      [{ who: "kate", at: "kneel", act: "neutral", face: "blank", facing: "toward:ollie", gesture: "offer", reach: "ollie", blink: false },
       { who: "ollie", at: "bed", mode: "sit", act: "neutral", face: "neutral", facing: "toward:kate", gesture: "offer", reach: "kate" }]),
    // 4: Ollie asleep, the duvet to his chin (episode 1's last scene); Ava beside the bed
    shot("4 Ollie asleep, Ava at the bedside", "ollieRoom", "night", at([-0.5, 1.2, 1.7], [0.9, 0.75, -0.4], 42),
      [{ who: "ollie", at: "asleep", act: "neutral", face: "smile_closed", facing: "camera" },
       { who: "ava", at: "behind", act: "neutral", face: "scared", facing: "toward:ollie" }]),
    // 5: Ava in bed at the shared wall: the knock (the knuckles are an insert), the drawing, the fairy lights, the clock
    shot("5 Ava's bed at the shared wall", "avaRoom", "night", at([0.75, 1.15, 1.55], [-1.15, 0.95, -0.35], 44),
      [{ who: "ava", at: "bed", mode: "sit", act: "neutral", face: "smile", facing: -1, gesture: "point" }]),
  ],
};
