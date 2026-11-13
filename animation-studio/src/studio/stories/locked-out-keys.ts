// VISUAL TEST ONLY (owner-authorised): the eight key frames of productions/sample-locked-out/visual-plan.md (shots 1a,
// 6b, 8b, 11a, 12a, 15c, 16a, 19b), each staged exactly as in the plan's shot list, carrying its beat's evaluated lines
// (the script is unchanged; lines are timed by estimate, no narration generated). First person: every camera is an
// authored `at` at my eye (wide fov 60-70, tight 30-44); my hands are the fpHands prop; my eyes, the van's mirror.
import type { Storyboard } from "../story/types";
import { oppWindow } from "../themes/lockedout";

const T = (text: string, voice?: string) => (voice ? { text, voice } : { text });
const ME = "liam", OP = "alice";
// the van at the near kerb, facing +x (prop yaw pi/2), right-hand drive: my eye in the driver's seat
const VAN_EYE: [number, number, number] = [-9.0, 1.6, 8.52];
const VAN = { id: "vanCab", at: VAN_EYE, yaw: 90 };
const DOOR = { id: "door9", at: [0.9, 0, -0.03] as [number, number, number] };
const UP = (steps?: { t: number }[]) => ({ id: "upstairsWindow", at: [0.9, 3.2, 0] as [number, number, number], ...(steps ? { steps } : {}) });
const at = (pos: [number, number, number], look: [number, number, number], fov: number) => ({ move: "at" as const, pos, look, fov });

export const LOCKED_OUT_KEYS: Storyboard = {
  id: "locked-out-keys", title: "Locked Out: key-frame visual test",
  cast: { marsh: "marsh", rachel: "rachel", sam: "sam" },
  voice: "liamQuiet", voices: { marsh: "brian" },
  music: { mood: "mystery", gain: -8 }, engine: 3, autoSfx: false,
  shots: [
    // 1a: the geography master through the windscreen: number 9, its bay, path and gate, the one lit strip upstairs;
    // Marsh small on the step under the porch lamp
    { say: T("At two-fourteen in the morning, a man is paying me double to break into his own house."), set: "alderRow", light: "night",
      camera: at(VAN_EYE, [-0.3, 2.25, 0.4], 50), cams: [{ t: 0, ...at(VAN_EYE, [-0.3, 2.25, 0.4], 50), blockOk: true }],
      actors: [{ who: "marsh", at: "step", act: "neutral", facing: "camera" }],
      props: [VAN, DOOR, UP()], note: "1a" },
    // 6b: macro on the new cylinder, kneeling: the KL stamp, the old lock's paler outline, flaking paint; my gloved hand
    // holding the wrench at the edge of frame
    { say: T("New locks don't just stop working."), set: "alderRow", light: "night",
      camera: at([1.15, 1.13, 0.3], [1.23, 1.03, 0], 44), cams: [{ t: 0, ...at([1.15, 1.13, 0.3], [1.23, 1.03, 0], 44), blockOk: true }],
      actors: [], props: [DOOR, { id: "fpHands", variant: "tools", at: [1.244, 0.836, 0.035] }], note: "6b" },
    // 8b: the History screen in my hands, the door behind
    { say: [T("It's one of ours."), T("She changed the lock yesterday. And kept the keys from him.")], set: "alderRow", light: "night",
      camera: at([0.95, 1.66, 0.96], [0.95, 1.405, 0.46], 50), cams: [{ t: 0, ...at([0.95, 1.66, 0.96], [0.95, 1.405, 0.46], 50), blockOk: true }],
      actors: [], props: [DOOR, { id: "fpHands", variant: "phone", at: [0.95, 1.33, 0.46] }], note: "8b" },
    // 11a: the 1a framing, tighter (attention narrowing): Marsh at the bay glass, weighing the brick
    { say: [T("She's still on the line upstairs. She says he's trying the windows.", OP)], set: "alderRow", light: "night",
      camera: at(VAN_EYE, [-0.4, 1.7, 0.6], 60), cams: [{ t: 0, ...at(VAN_EYE, [-0.4, 1.7, 0.6], 60), blockOk: true }, { t: 0.5, ...at(VAN_EYE, [-1.0, 1.35, 0.8], 30), glide: 1.4, blockOk: true }],
      actors: [{ who: "marsh", at: [-1.0, 0, 0.8], act: "determined", facing: "camera", hold: "brick" }],
      props: [VAN, DOOR, UP([{ t: 0.05 }])], note: "11a" },
    // 12a: the glance up to the rear-view mirror: my eyes, phone-lit
    { say: T("He still thinks I'm his way in. While he does, he'll wait at the door."), set: "alderRow", light: "night",
      camera: at(VAN_EYE, [-8.44, 1.9, 8.1], 30), cams: [{ t: 0, ...at(VAN_EYE, [-8.44, 1.9, 8.1], 30), blockOk: true }],
      actors: [], props: [{ ...VAN, variant: "mirror" }], note: "12a" },
    // 15c: standing up on the path, between him and the glass: Marsh backed against his own door
    { say: T("No! She changed this lock to keep you out. I'm not opening it!", ME), set: "alderRow", light: "night",
      camera: at([0.9, 1.65, 1.75], [0.95, 1.55, 0.5], 58), cams: [{ t: 0, ...at([0.9, 1.65, 1.75], [0.95, 1.55, 0.5], 58), blockOk: true }],
      actors: [{ who: "marsh", at: [0.95, 0, 0.5], act: "angry", facing: "camera" }],
      props: [DOOR], note: "15c" },
    // 16a: pinned sideways against the porch wall, over his shoulder: windows across the road lighting up
    { say: [{ text: "Shut up!", who: "marsh" }], set: "alderRow", light: "night", dur: 2.4,
      camera: at([-0.2, 1.6, 0.32], [2.0, 2.3, 14.6], 62), cams: [{ t: 0, ...at([-0.2, 1.6, 0.32], [2.0, 2.3, 14.6], 62), blockOk: true }],
      actors: [{ who: "marsh", at: [0.12, 0, 1.25], act: "angry", facing: "camera", gesture: "fists" }],
      props: [
        { id: "windowLight", at: oppWindow(2, 1, 1), yaw: 180, steps: [{ t: 0.15 }] },
        { id: "windowLight", at: oppWindow(3, 1, 1), yaw: 180, steps: [{ t: 0.55 }] },
        { id: "windowLight", at: oppWindow(2, 0, 0), yaw: 180, steps: [{ t: 0.9 }] },
      ], note: "16a" },
    // 19b: the windscreen framing a third time, pushed in: the curtain open, Rachel and Sam at the lit window
    { say: [T("I checked who he was."), T("I never asked who the lock was for.")], set: "alderRow", light: "night",
      camera: at(VAN_EYE, [-0.2, 2.6, 0.6], 60), cams: [{ t: 0, ...at(VAN_EYE, [-0.2, 2.6, 0.6], 60), blockOk: true }, { t: 0.4, ...at(VAN_EYE, [1.15, 3.9, -0.2], 21), glide: 2.4, blockOk: true }],
      actors: [{ who: "rachel", at: [1.18, 2.65, -0.6], act: "sad", facing: "camera" }, { who: "sam", at: [1.52, 2.65, -0.55], act: "neutral", facing: "camera" }],
      props: [VAN, DOOR, UP([{ t: 0.02 }, { t: 0.06 }])], note: "19b" },
  ],
};
