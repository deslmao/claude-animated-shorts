// PREVIEW ONLY (owner-authorised): beats 10-17 of productions/sample-locked-out (the evaluated packet 53e034eb's lines,
// unchanged; timed by estimate, no narration generated), staged from visual-plan.md §6-§8. First person: every camera
// is an authored `at` at my eye (wide fov 50-66, tight 28-40, the same axis for "looking closer"); my hands are the
// fpHands card in the lower frame of static shots, out of frame while the head moves; two motivated outside shots
// (15e, 17b). Geography (alderRow): Marsh drops the brick on the lawn between the bay and the door (B2), so when I
// stand on the path I am between him (at his door) and both the brick and the bay window.
// Marsh's and the neighbour's lines are voiced without lip-sync: the engine's lip-sync turns a speaker's face to a
// relaxed smile between words, which would read as cheerful; this way his face holds its anger.
import type { Storyboard, ShotSpec } from "../story/types";
import { oppWindow } from "../themes/lockedout";

type V3 = [number, number, number];
const T = (text: string, voice?: string) => (voice ? { text, voice } : { text });
const ME = "liam", OP = "alice";
const at = (pos: V3, look: V3, fov: number) => ({ move: "at" as const, pos, look, fov });
const cam = (pos: V3, look: V3, fov: number) => ({ camera: at(pos, look, fov), cams: [{ t: 0, ...at(pos, look, fov), blockOk: true }] });
const N = { set: "alderRow", light: "night" as const };

const E: V3 = [-9.0, 1.6, 8.52];                       // my eye in the van's driver's seat (facing +x)
const VAN = { id: "vanCab", at: [E[0] + 0.75, E[1] - 0.35, E[2]] as V3, yaw: 90 }; // the dashboard point ahead of my eye
const DOOR = { id: "door9", at: [0.9, 0, -0.03] as V3 };
const UP_OFF = { id: "upstairsWindow", at: [0.9, 3.2, 0] as V3, steps: [{ t: 0 }] };   // her light is off since beat 7
const IN_VAN = (x: number, y: number, z = E[2]) => ({ at: [x, y, z] as V3, yaw: -90 });  // a hands card facing my eye
const KNEEL: V3 = [1.13, 1.12, 0.4], STAND: V3 = [0.35, 1.65, 0.95], PINNED: V3 = [0.2, 1.6, 0.3];
const BAY: V3 = [-0.95, 0, 0.85], MARSH_DOOR: V3 = [1.45, 0, 0.85], B2: V3 = [-0.75, 0, 1.45];
const BRICK = { id: "groundBrick", at: B2 };
const W1 = oppWindow(2, 0, 0), W2 = oppWindow(2, 1, 1), W3 = oppWindow(3, 1, 1), W4 = oppWindow(3, 0, 0);
const lit = (w: V3, t = 0) => ({ id: "windowLight", at: w, yaw: 180, steps: [{ t }] });
const watch = (atP: V3, yaw: number, times: string, steps: { t: number }[] = []) => ({ id: "fpHands", variant: `watch:${times}`, at: atP, yaw, ...(steps.length ? { steps } : {}) });

const shots: ShotSpec[] = [
  // ---- beat 10: in the van, the 999 call; the countdown starts on "four minutes"
  { say: T("She called us too. She's upstairs with her little boy. Officers are four minutes out. Stay in your vehicle.", OP), until: { word: "four" }, ...N,
    ...cam(E, [-8.62, 1.33, 8.52], 50), actors: [], props: [VAN, { id: "fpHands", variant: "call", ...IN_VAN(-8.62, 1.16) }], note: "10a" },
  { cont: true, ...N, ...cam(E, [-8.7, 1.41, 8.52], 36), actors: [],
    props: [VAN, watch([-8.7, 1.25, 8.52], -90, "04:00|03:59|03:58|03:57", [{ t: 0.5 }, { t: 1.5 }, { t: 2.5 }])], note: "10b" },
  // ---- beat 11: the 1a framing; he leaves the door, tries the bay latch, looks down at the border...
  { say: T("She's still on the line upstairs. She says he's trying the windows.", OP), until: { word: "says" }, ...N,
    ...cam(E, [-0.3, 2.0, 0.5], 50), actors: [{ who: "marsh", at: "step", act: "determined", facing: "camera", walk: { to: BAY, t0: 0.1, t1: 1.2 }, beats: [{ t: 1.25, gesture: "present", look: "left" }, { t: 1.7, look: "down" }] }],
    props: [VAN, DOOR, UP_OFF], note: "11a-1" },
  // ...then, closer (attention narrowing on the same axis): his back to us, the brick raised at the glass
  { cont: true, ...N, camera: at(E, [-0.6, 1.7, 0.7], 42), cams: [{ t: 0, ...at(E, [-0.6, 1.7, 0.7], 42), blockOk: true }, { t: 0.15, ...at(E, [-0.95, 1.85, 0.8], 22), glide: 1.3, blockOk: true }],
    actors: [{ who: "marsh", at: BAY, back: true, act: "determined", hold: "brick", gesture: "raiseHand" }], props: [VAN, DOOR, UP_OFF], note: "11a-2" },
  { say: T("A horn, and he's through that glass before anyone's out of bed."), ...N, ...cam(E, [-8.1, 1.3, 8.0], 62),
    actors: [{ who: "marsh", at: BAY, back: true, act: "determined", hold: "brick", gesture: "raiseHand" }],
    props: [VAN, DOOR, UP_OFF, { id: "fpHands", variant: "horn", at: [-8.58, 1.1, 8.4], yaw: -90 }], note: "11b" },
  // ---- beat 12: the mirror (my eyes, deciding), the phone into my pocket, my hand on the door lever
  { say: T("He still thinks I'm his way in. While he does, he'll wait at the door."), ...N, ...cam(E, [-8.44, 1.9, 8.1], 30), actors: [],
    props: [{ id: "rearMirror", variant: "eyes", at: [-8.44, 1.9, 8.1], yaw: 90 }], note: "12a" },
  { say: [T("Stay on the line.", ME), T("Do not open her door.", OP)], ...N, ...cam(E, [-8.62, 1.2, 8.52], 55), actors: [],
    props: [VAN, { id: "fpHands", variant: "pocket", ...IN_VAN(-8.62, 0.98) }], note: "12b" },
  { say: T("I won't.", ME), ...N, ...cam(E, [-8.78, 1.42, 8.97], 50), actors: [], dur: 1.6,
    props: [{ id: "fpHands", variant: "handle", at: [-8.78, 1.26, 8.97], yaw: -151 }], note: "12c" },
  // ---- beat 13: out past the van's nose, the case held up; he drops the brick on the lawn and comes back to the door
  { say: T("Found them!", ME), ...N, dur: 2.6, ...cam([-7.4, 1.65, 9.2], [-0.2, 0.6, 0.9], 56),
    actors: [{ who: "marsh", at: BAY, act: "suspicious", facing: "camera", hold: "brick", walk: { to: MARSH_DOOR, t0: 0.9, t1: 2.4 }, beats: [{ t: 0.75, hold: null }] }],
    props: [DOOR, UP_OFF, { id: "groundBrick", at: B2, steps: [{ t: 0.8 }] }, { id: "fpHands", variant: "case", at: [-7.0, 1.33, 8.75], yaw: -41 }], note: "13" },
  // ---- beat 14: kneeling, faking it; the countdown; he leans over me
  { ...N, dur: 1.8, ...cam([1.15, 1.13, 0.3], [1.23, 1.03, 0], 44), actors: [], props: [DOOR, { id: "fpHands", variant: "tools", at: [1.244, 0.836, 0.035] }], note: "14a" },
  { ...N, dur: 1.3, ...cam(KNEEL, [1.08, 0.95, 0.16], 40), actors: [], props: [DOOR, watch([1.08, 0.79, 0.16], 0, "02:20|01:40", [{ t: 0.65 }])], note: "14b" },
  { say: [{ text: "You're not even trying.", voice: "brian" }, { text: "Open it now. Or I go through that window.", voice: "brian" }], ...N,
    ...cam(KNEEL, [1.75, 1.72, 1.05], 60), kicks: [{ word: "now" }],
    actors: [{ who: "marsh", at: [1.75, 0, 1.05], act: "angry", face: "angry", facing: "camera", beats: [{ word: "now", gesture: "stop" }, { word: "window", look: "left" }] }],
    props: [], note: "14c" },
  // ---- beat 15: the watch; I stand and step back onto the path; a glance over my shoulder (the brick, the bay glass
  // behind me); back to him: "No!"; the shout carries down the street and the first window lights
  { ...N, dur: 0.8, ...cam(KNEEL, [1.08, 0.95, 0.16], 40), actors: [], props: [DOOR, watch([1.08, 0.79, 0.16], 0, "01:30")], note: "15a" },
  { ...N, dur: 1.0, camera: at(KNEEL, [1.45, 1.7, 0.85], 56), cams: [{ t: 0, ...at(KNEEL, [1.45, 1.7, 0.85], 56), blockOk: true }, { t: 0.05, ...at(STAND, [1.45, 1.7, 0.85], 56), glide: 0.8, blockOk: true }],
    actors: [{ who: "marsh", at: MARSH_DOOR, act: "suspicious", facing: "camera" }], props: [], note: "15b" },
  { ...N, dur: 1.1, camera: at(STAND, [1.45, 1.7, 0.85], 56), cams: [{ t: 0, ...at(STAND, [1.45, 1.7, 0.85], 56), blockOk: true }, { t: 0.05, ...at(STAND, [-1.0, 1.05, 0.75], 62), glide: 0.4, blockOk: true }],
    actors: [{ who: "marsh", at: MARSH_DOOR, act: "suspicious", facing: "camera" }], props: [DOOR, BRICK], note: "15c" },
  { say: T("No! She changed this lock to keep you out. I'm not opening it!", ME), until: { word: "lock" }, ...N,
    camera: at(STAND, [-1.0, 1.05, 0.75], 62), cams: [{ t: 0, ...at(STAND, [-1.0, 1.05, 0.75], 62), blockOk: true }, { t: 0.02, ...at(STAND, [1.4, 1.68, 0.85], 58), glide: 0.3, blockOk: true }],
    actors: [{ who: "marsh", at: MARSH_DOOR, act: "angry", facing: "camera", beats: [{ t: 0.4, act: "shock" }] }], props: [DOOR], note: "15d" },
  { cont: true, ...N, ...cam([0.9, 1.7, 2.6], [1.0, 2.6, 14.6], 60), actors: [], props: [{ id: "windowLight", at: W1, yaw: 180, steps: [{ word: "keep" }] }], note: "15e" },
  // ---- beat 16: shoved sideways into the porch wall; over his shoulder the street wakes; the neighbour; he looks,
  // lets go, backs off past the brick toward the gate
  { say: [{ text: "Shut up!", voice: "brian" }], transition: "whip", ...N, dur: 2.0, ...cam(PINNED, [2.5, 2.2, 14.6], 62), kicks: [0.05],
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "angry", facing: "camera", gesture: "fists" }],
    props: [lit(W1, 0), lit(W2, 0.3), lit(W3, 1.0)], note: "16a" },
  { say: [{ text: "Oi! I'm calling the police!", voice: "chris" }], ...N, camera: at(PINNED, [2.5, 2.2, 14.6], 62), cams: [{ t: 0, ...at(PINNED, [2.5, 2.2, 14.6], 62), blockOk: true }, { t: 0.05, ...at(PINNED, [-1.4, 1.6, 13.85], 28), glide: 0.5, blockOk: true }],
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "angry", facing: "camera", gesture: "fists" }, { who: "gus", at: [-1.4, 0, 13.85], act: "angry", facing: "camera", hold: "phone" }],
    props: [lit(W1, 0), lit(W2, 0)], note: "16b" },
  { ...N, dur: 1.2, ...cam(PINNED, [0.6, 1.72, 1.4], 48),
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "angry", facing: "camera", gesture: "fists", beats: [{ t: 0.25, look: "right" }, { t: 0.7, act: "nervous", gesture: "hang" }] }],
    props: [lit(W3, 0), lit(W4, 0)], note: "16c" },
  { ...N, dur: 0.8, ...cam(PINNED, [0.2, 1.16, 0.68], 40), actors: [], props: [watch([0.2, 1.0, 0.68], 180, "00:17")], note: "16d-1" },
  { ...N, dur: 1.9, ...cam(PINNED, [0.4, 1.0, 3.6], 58),
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "nervous", facing: "camera", walk: { to: [0.9, 0, 4.6], t0: 0.1, t1: 1.8, view: "front" } }],
    props: [lit(W1, 0), lit(W2, 0), lit(W3, 0)], note: "16d-2" },
  // ---- beat 17: 00:00; blue light floods the house fronts; two officers take him at the gate
  { ...N, dur: 0.8, ...cam(PINNED, [0.2, 1.16, 0.68], 40), actors: [], props: [watch([0.2, 1.0, 0.68], 180, "00:00")], note: "17a" },
  { say: [{ text: "It's my house!", voice: "brian" }], ...N, dur: 3.0, ...cam([0.9, 1.7, 0.9], [0.9, 1.4, 5.2], 52),
    actors: [{ who: "marsh", at: [0.9, 0, 4.85], act: "angry", facing: "camera" }, { who: "officerA", at: [0.3, 0, 5.15], act: "determined", face: "stern", facing: "toward:marsh", gesture: "present" }, { who: "officerB", at: [1.5, 0, 5.15], act: "determined", face: "stern", facing: "toward:marsh", gesture: "present" }],
    props: [lit(W1, 0), lit(W2, 0), lit(W3, 0), { id: "policeLight", at: [1, 0, 14.45], yaw: 180, steps: [0.05, 0.3, 0.55, 0.8, 1.05, 1.3, 1.55, 1.8, 2.05, 2.3, 2.55].map((t) => ({ t })) }], note: "17b" },
];

export const LOCKED_OUT_CLIMAX: Storyboard = {
  id: "locked-out-climax", title: "Locked Out: climax preview (beats 10-17)",
  cast: { marsh: "marsh", gus: "gus", officerA: "officer", officerB: "officer" },
  voice: "liamQuiet", voices: { marsh: "brian", gus: "chris" },
  music: { mood: "tense", gain: -8 }, engine: 3, autoSfx: false,
  shots,
};
