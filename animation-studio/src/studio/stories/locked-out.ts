// Locked Out (productions/sample-locked-out): the complete 19-beat film. The lines are the evaluated story.md's, word for
// word. Staging rule, taken from the viral narrated reels the channel learns from: every line gets ONE big, literal
// picture of exactly what it says; the narrator (me, the locksmith) is on screen in third person whenever positions,
// emotion or a physical action matter (the door, the decision, the shove, the arrest); first-person POV is kept for
// discoveries (the job card, the licence, the letterbox, the lock, the light, the History screen, the mirror, the watch).
// Spoken lines are voiced without lip-sync: the engine's lip-sync relaxes a speaker's face into a smile between words.
import type { Storyboard, ShotSpec, When } from "../story/types";
import { oppWindow } from "../themes/lockedout";

type V3 = [number, number, number];
const ME = "liam", OP = "alice", MARSH = "brian", RACHEL = "jessica", NEIGHBOUR = "chris";
const T = (text: string, voice?: string) => (voice ? { text, voice } : { text });
const at = (pos: V3, look: V3, fov: number) => ({ move: "at" as const, pos, look, fov });
const cam = (pos: V3, look: V3, fov: number) => ({ camera: at(pos, look, fov), cams: [{ t: 0, ...at(pos, look, fov), blockOk: true }] });
/** a camera that glides from one framing to another, starting at t0 for dur seconds */
const move = (p0: V3, l0: V3, f0: number, p1: V3, l1: V3, f1: number, t0 = 0.1, dur = 1.6) =>
  ({ camera: at(p0, l0, f0), cams: [{ t: 0, ...at(p0, l0, f0), blockOk: true }, { t: t0, ...at(p1, l1, f1), glide: dur, blockOk: true }] });
const N = { set: "alderRow", light: "night" as const };

const E: V3 = [-9.0, 1.6, 8.52];                                   // my eye in the van's driver's seat (facing +x)
const VAN = { id: "vanCab", at: [E[0] + 0.75, E[1] - 0.35, E[2]] as V3, yaw: 90 };
const MIRROR_AT: V3 = [-8.44, 1.9, 8.1];
const DOOR = { id: "door9", at: [0.9, 0, -0.03] as V3 };
const UP = (steps?: When[]) => ({ id: "upstairsWindow", at: [0.9, 3.2, 0] as V3, ...(steps ? { steps } : {}) });
const UP_OFF = UP([{ t: 0 }]);
const KNEEL: V3 = [1.13, 1.12, 0.4], PINNED: V3 = [0.2, 1.6, 0.3];
const BAY: V3 = [-0.95, 0, 0.85], MARSH_DOOR: V3 = [1.45, 0, 0.85], B2: V3 = [-0.75, 0, 1.45], ME_PATH: V3 = [0.35, 0, 0.95];
const BRICK = { id: "groundBrick", at: B2 };
const W1 = oppWindow(2, 0, 0), W2 = oppWindow(2, 1, 1), W3 = oppWindow(3, 1, 1), W4 = oppWindow(3, 0, 0), W5 = oppWindow(1, 1, 0);
const lit = (w: V3, step: When = { t: 0 }) => ({ id: "windowLight", at: w, yaw: 180, steps: [step] });
const hands = (variant: string, p: V3, yaw = 0, steps?: When[]) => ({ id: "fpHands", variant, at: p, yaw, ...(steps ? { steps } : {}) });
const IN_VAN = (v: string, x: number, y: number) => hands(v, [x, y, E[2]], -90);

const shots: ShotSpec[] = [
  // ======== 1. the hook: the job card, then the man on the step through my windscreen
  { say: T("At two-fourteen in the morning, a man is paying me double to break into his own house."), until: { word: "morning" }, ...N,
    ...cam(E, [-8.62, 1.33, 8.52], 50), actors: [], props: [VAN, IN_VAN("job", -8.62, 1.16)], note: "1 job card" },
  { cont: true, ...N, ...move(E, [-0.3, 2.25, 0.4], 50, E, [0.6, 1.7, 0.6], 30, 0.2, 2.6),
    actors: [{ who: "marsh", at: "step", act: "neutral", facing: "camera" }], props: [VAN, DOOR, UP()], note: "1 the man on the step" },
  // ======== 2. the offer: over my shoulder, cash in his fist; then the hush
  { say: T("Double. Cash. No invoice, no call to the office.", MARSH), ...N, camera: { move: "overShoulder", over: "me", at: "marsh" },
    actors: [{ who: "me", at: [0.75, 0, 1.4], back: true, hold: "toolCase" }, { who: "marsh", at: "step", act: "suspicious", facing: "camera", hold: "cash" }],
    props: [DOOR], note: "2 the offer" },
  { say: T("And he wants it quiet."), ...N, camera: { move: "closeUp", on: "marsh" },
    actors: [{ who: "marsh", at: "step", act: "suspicious", facing: "camera", gesture: "coverMouth", beats: [{ t: 0.3, look: "left" }] }], props: [DOOR], note: "2 the hush" },
  // ======== 3. the licence (perfect), and the warning that makes me take it
  { say: T("Proof of address. His is perfect."), ...N, ...cam([0.9, 1.62, 1.15], [0.9, 1.5, 0.6], 46), actors: [],
    props: [DOOR, hands("licence", [0.9, 1.2, 0.75])], note: "3 the licence" },
  { say: T("And I can't afford to turn away the wrong man twice."), ...N, ...cam(E, [-8.4, 1.72, 8.6], 60), actors: [], props: [VAN], note: "3 the warning letter" },
  // ======== 4. the bell; nobody comes
  { say: T("I always ring first."), ...N, camera: { move: "frame", on: ["me", "marsh"], size: "medium", from: 25 },
    actors: [{ who: "me", at: [1.6, 0, 0.75], act: "neutral", facing: "toward:marsh", gesture: "point", hold: "toolCase" }, { who: "marsh", at: [0.45, 0, 0.9], act: "neutral", facing: "toward:me" }],
    props: [DOOR, UP()], sfx: [{ t: 0.5, name: "bell_ring" }], note: "4 the bell" },
  { say: T("She won't come down. Not at this hour.", MARSH), ...N, camera: { move: "closeUp", on: "marsh" },
    actors: [{ who: "marsh", at: [0.45, 0, 0.9], act: "sad", facing: "camera" }, { who: "me", at: [1.6, 0, 0.75], facing: "toward:marsh" }], props: [DOOR], note: "4 she won't come down" },
  // ======== 5. through the letterbox: the dog knows him; the drawing
  { say: T("Biscuit. It's me.", MARSH), set: "downstairs", light: "interiorCool", dur: 3.0,
    ...move([0.75, 1.0, -5.9], [0.72, 0.45, -4.0], 50, [0.75, 1.0, -5.9], [1.05, 1.0, -3.8], 50, 1.4, 0.8), actors: [],
    props: [hands("flap", [0.75, 0.79, -5.65], 180), { id: "farmDog", at: [0.7, 0, -4.4], yaw: 180 }, { id: "familyDrawing", at: [1.22, 1.12, -4.1], yaw: -150 }],
    note: "5 the letterbox" },
  // ======== 6. his key won't go in; the lock is new
  { say: T("Just stopped working tonight.", MARSH), ...N, ...cam([1.8, 1.5, 1.7], [1.0, 1.3, 0.35], 48),
    actors: [{ who: "marsh", at: [0.85, 0, 0.5], act: "confused", facing: "camera", hold: "key", gesture: "present" }],
    props: [DOOR], note: "6 his key" },
  { say: T("New locks don't just stop working."), ...N, camera: at([1.15, 1.13, 0.5], [1.23, 1.04, 0], 44), cams: [{ t: 0, ...at([1.15, 1.13, 0.5], [1.23, 1.04, 0], 44), blockOk: true }, { t: 0.2, ...at([1.15, 1.13, 0.3], [1.23, 1.03, 0], 40), glide: 0.5, swoop: true, blockOk: true }],
    actors: [], props: [DOOR, hands("tools", [1.244, 0.836, 0.035])], note: "6 the new cylinder" },
  // ======== 7. the light upstairs goes out
  { say: T("Someone's awake up there."), ...N, ...move([0.9, 1.6, 1.6], [0.9, 1.5, 0], 50, [0.9, 1.6, 1.6], [0.9, 3.85, 0], 40, 0.1, 0.7), actors: [],
    props: [DOOR, UP([{ word: "awake" }])], note: "7 the light goes out" },
  { say: T("Problem?", MARSH), ...N, camera: { move: "closeUp", on: "marsh" }, actors: [{ who: "marsh", at: [0.45, 0, 0.9], act: "suspicious", facing: "camera" }], props: [DOOR], note: "7 problem?" },
  // ======== 8. one of ours; the History
  { say: T("Just checking the lock model.", ME), ...N, camera: { move: "frame", on: ["me", "marsh"], size: "medium", from: -30 },
    actors: [{ who: "me", at: [1.3, 0, 0.6], act: "thinking", facing: "toward:marsh" }, { who: "marsh", at: [0.45, 0, 0.9], act: "suspicious", facing: "toward:me" }], props: [DOOR], note: "8 checking" },
  { say: T("It's one of ours."), ...N, ...cam([1.15, 1.13, 0.3], [1.23, 1.03, 0], 44), actors: [], props: [DOOR], note: "8 the KL stamp" },
  { say: T("She changed the lock yesterday. And kept the keys from him."), ...N, ...cam([0.95, 1.66, 0.96], [0.95, 1.405, 0.46], 50), actors: [],
    props: [DOOR, hands("phone", [0.95, 1.33, 0.46])], note: "8 the History" },
  // ======== 9. everything true; he's looking at the window; I walk away
  { say: T("Everything he's told me is true."), ...N, camera: { move: "closeUp", on: "marsh" },
    actors: [{ who: "marsh", at: [0.45, 0, 0.9], act: "determined", facing: "camera", beats: [{ t: 0.6, look: "left" }] }], props: [DOOR], note: "9 all true" },
  { say: T("Wrong picks. They're in the van.", ME), ...N, dur: 2.6, ...cam([0.9, 1.6, 5.6], [0.8, 1.2, 1.5], 46),
    actors: [{ who: "me", at: [0.9, 0, 1.4], act: "nervous", hold: "toolCase", walk: { to: [0.9, 0, 4.2], t0: 0.3, t1: 2.3, view: "front" } }, { who: "marsh", at: "step", act: "determined", facing: "camera", beats: [{ t: 1.0, look: "right" }] }],
    props: [DOOR, UP_OFF], note: "9 back to the van" },
  // ======== 10. the 999 call; four minutes
  { say: T("She called us too. She's upstairs with her little boy. Officers are four minutes out. Stay in your vehicle.", OP), until: { word: "four" }, ...N,
    ...move(E, [-8.62, 1.33, 8.52], 52, E, [-8.62, 1.36, 8.52], 44, 0.3, 3.0), actors: [], props: [VAN, IN_VAN("call", -8.62, 1.16)], note: "10 the 999 call" },
  { cont: true, ...N, ...cam(E, [-8.7, 1.41, 8.52], 36), actors: [],
    props: [VAN, hands("watch:04:00|03:59|03:58|03:57", [-8.7, 1.25, 8.52], -90, [{ t: 0.5 }, { t: 1.5 }, { t: 2.5 }])], note: "10 the countdown" },
  // ======== 11. he goes to the window: the latch, the brick at the glass; my hand stops at the horn
  { say: T("She's still on the line upstairs. She says he's trying the windows.", OP), until: { word: "says" }, ...N, ...cam(E, [-0.3, 2.0, 0.5], 50),
    actors: [{ who: "marsh", at: "step", act: "determined", facing: "camera", walk: { to: BAY, t0: 0.1, t1: 1.2 }, beats: [{ t: 1.25, gesture: "present", look: "left" }, { t: 1.7, look: "down" }] }],
    props: [VAN, DOOR, UP_OFF], note: "11 to the window" },
  { cont: true, ...N, ...move(E, [-0.6, 1.7, 0.7], 42, E, [-0.95, 1.85, 0.8], 22, 0.15, 1.3),
    actors: [{ who: "marsh", at: BAY, back: true, act: "determined", hold: "brick", gesture: "raiseHand" }], props: [VAN, DOOR, UP_OFF], note: "11 the brick at the glass" },
  { say: T("A horn, and he's through that glass before anyone's out of bed."), ...N, ...cam(E, [-8.1, 1.3, 8.0], 62),
    actors: [{ who: "marsh", at: BAY, back: true, act: "determined", hold: "brick", gesture: "raiseHand" }], props: [VAN, DOOR, UP_OFF, hands("horn", [-8.58, 1.1, 8.4], -90)], note: "11 the horn" },
  // ======== 12. the decision: my eyes in the mirror; the open line; the door lever
  { say: T("He still thinks I'm his way in. While he does, he'll wait at the door."), ...N, ...move(E, MIRROR_AT, 34, E, MIRROR_AT, 26, 0.2, 3.0), actors: [],
    props: [{ id: "rearMirror", variant: "eyes", at: MIRROR_AT, yaw: 90 }], note: "12 the mirror" },
  { say: [T("Stay on the line.", ME), T("Do not open her door.", OP)], ...N, ...cam(E, [-8.62, 1.33, 8.52], 50), actors: [], props: [VAN, IN_VAN("call", -8.62, 1.16)], note: "12 the open line" },
  { say: T("I won't.", ME), ...N, dur: 1.4, ...cam(E, [-8.78, 1.42, 8.97], 50), actors: [], props: [hands("handle", [-8.78, 1.26, 8.97], -151)], note: "12 the lever" },
  // ======== 13. back up the path with the case; he puts the brick down and comes back to the door
  { say: T("Found them!", ME), ...N, dur: 2.8, ...cam([-3.5, 1.8, 7.5], [-0.14, 1.1, 2.53], 58),
    actors: [{ who: "me", at: [0.9, 0, 3.5], act: "determined", hold: "toolCase", walk: { to: [0.9, 0, 2.0], t0: 0.2, t1: 2.4, view: "front" } },
      { who: "marsh", at: BAY, act: "suspicious", facing: "camera", hold: "brick", walk: { to: MARSH_DOOR, t0: 1.0, t1: 2.6 }, beats: [{ t: 0.8, hold: null }] }],
    props: [DOOR, UP_OFF, { id: "groundBrick", at: B2, steps: [{ t: 0.85 }] }], note: "13 found them" },
  { ...N, dur: 0.9, ...cam([-0.55, 0.45, 2.0], [-0.75, 0.06, 1.45], 38), actors: [], props: [{ id: "groundBrick", at: B2 }], note: "13 the brick on the lawn" },
  // ======== 14. I fake it; the countdown; he leans over me
  { ...N, dur: 1.6, ...cam([1.15, 1.13, 0.3], [1.23, 1.03, 0], 44), actors: [], props: [DOOR, hands("tools", [1.244, 0.836, 0.035])], note: "14 faking it" },
  { ...N, dur: 1.3, ...cam(KNEEL, [1.08, 0.95, 0.16], 40), actors: [], props: [DOOR, hands("watch:02:20|01:40", [1.08, 0.79, 0.16], 0, [{ t: 0.65 }])], note: "14 the countdown" },
  { say: [T("You're not even trying.", MARSH), T("Open it now. Or I go through that window.", MARSH)], ...N, ...move(KNEEL, [1.75, 1.72, 1.05], 60, KNEEL, [1.75, 1.75, 1.05], 50, 0.3, 3.0), kicks: [{ word: "now" }],
    actors: [{ who: "marsh", at: [1.75, 0, 1.05], act: "angry", face: "angry", facing: "camera", beats: [{ word: "now", gesture: "fists" }, { word: "window", look: "left" }] }], props: [], note: "14 open it now" },
  // ======== 15. the decision, shown: I stand between him and the window; I make it loud
  { say: T("Now I'm between him and that window."), ...N, ...move([-2.9, 1.95, 5.4], [0.15, 1.1, 0.9], 64, [-2.6, 1.9, 4.9], [0.2, 1.15, 0.9], 60, 0.2, 2.2),
    actors: [{ who: "me", at: ME_PATH, act: "determined", facing: "toward:marsh" }, { who: "marsh", at: MARSH_DOOR, act: "angry", facing: "toward:me" }],
    props: [DOOR, UP_OFF, BRICK], note: "15 between him and the window" },
  { say: T("He wants this quiet. So I make it loud."), ...N, camera: { move: "closeUp", on: "me" },
    actors: [{ who: "me", at: ME_PATH, act: "determined", facing: "camera" }, { who: "marsh", at: MARSH_DOOR, facing: "toward:me" }], props: [DOOR], note: "15 so I make it loud" },
  { say: T("No! She changed this lock to keep you out. I'm not opening it!", ME), until: { word: "lock" }, ...N, camera: { move: "closeUp", on: "me", punch: true },
    actors: [{ who: "me", at: ME_PATH, act: "angry", face: "angry", facing: "camera" }, { who: "marsh", at: MARSH_DOOR, facing: "toward:me" }], props: [DOOR], kicks: [0.05], note: "15 No!" },
  { cont: true, ...N, ...move([0.9, 1.7, 2.6], [1.0, 2.4, 14.6], 60, [0.9, 1.7, 2.6], [1.0, 2.6, 14.6], 52, 0.1, 2.0), actors: [],
    props: [lit(W1, { word: "keep" })], note: "15 down the sleeping street" },
  // ======== 16. he slams me into the wall; the street wakes; the neighbour; he lets go and backs off
  { say: T("Shut up!", MARSH), transition: "whip", ...N, dur: 1.6, ...cam([0.35, 1.6, 3.0], [0.35, 1.3, 0.7], 50), kicks: [0.15],
    actors: [{ who: "marsh", at: [0.75, 0, 0.95], act: "angry", face: "angry", facing: "toward:me", gesture: "grab", reach: "me" }, { who: "me", at: [0.15, 0, 0.55], act: "scared", facing: "toward:marsh", moves: [{ t: 0.1, kind: "stagger", dur: 0.5, away: "marsh" }] }],
    props: [DOOR], note: "16 the shove" },
  { say: T("One light. Then another. Then the whole street."), ...N, ...cam(PINNED, [0.5, 2.2, 14.6], 62),
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "angry", face: "angry", facing: "camera", gesture: "fists" }],
    props: [lit(W1), lit(W2, { word: "another" }), lit(W5, { word: "whole" })], note: "16 the street wakes" },
  { say: T("Oi! I'm calling the police!", NEIGHBOUR), ...N, ...move(PINNED, [2.5, 2.2, 14.6], 62, PINNED, [-1.4, 1.6, 13.85], 28, 0.05, 0.5),
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "angry", facing: "camera", gesture: "fists" }, { who: "gus", at: [-1.4, 0, 13.85], act: "angry", facing: "camera", hold: "phone", gesture: "point" }],
    props: [lit(W1), lit(W2)], note: "16 the neighbour" },
  { ...N, dur: 1.2, ...cam(PINNED, [0.6, 1.72, 1.4], 48),
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "angry", facing: "camera", gesture: "fists", beats: [{ t: 0.25, look: "right" }, { t: 0.7, act: "nervous", gesture: "hang" }] }],
    props: [lit(W3), lit(W4)], note: "16 he sees them watching" },
  { ...N, dur: 2.2, ...cam([0.3, 1.6, 0.5], [0.85, 1.1, 3.8], 50),
    actors: [{ who: "marsh", at: [0.6, 0, 1.4], act: "nervous", facing: "camera", walk: { to: [0.9, 0, 4.6], t0: 0.2, t1: 2.0, view: "front" } }],
    props: [], note: "16 he backs off" },
  // ======== 17. 00:00; the blue light; they take his arms
  { ...N, dur: 0.8, ...cam(PINNED, [0.2, 1.16, 0.68], 40), actors: [], props: [hands("watch:00:00", [0.2, 1.0, 0.68], 180)], note: "17 00:00" },
  { say: T("It's my house!", MARSH), ...N, dur: 3.0, ...move([0.9, 1.7, 0.9], [0.9, 1.4, 5.2], 52, [0.9, 1.7, 1.3], [0.9, 1.45, 5.2], 46, 0.3, 2.5),
    actors: [{ who: "marsh", at: [0.9, 0, 4.85], act: "angry", facing: "camera" }, { who: "officerA", at: [0.3, 0, 5.15], act: "determined", face: "stern", facing: "toward:marsh", gesture: "grab", reach: "marsh" }, { who: "officerB", at: [1.5, 0, 5.15], act: "determined", face: "stern", facing: "toward:marsh", gesture: "grab", reach: "marsh" }],
    props: [lit(W1), lit(W2), lit(W3), { id: "policeLight", at: [1, 0, 14.45], yaw: 180, steps: [0.05, 0.3, 0.55, 0.8, 1.05, 1.3, 1.55, 1.8, 2.05, 2.3, 2.55].map((t) => ({ t })) }], note: "17 the arrest" },
  // ======== 18. her side of the night, through the closed door; her light comes back on
  { say: [T("I watched you from upstairs. When you got your tools out.", RACHEL), T("I thought you were going to let him in.", RACHEL)], ...N, ...move([1.7, 1.8, 2.9], [0.9, 1.25, 0.0], 46, [1.55, 1.8, 2.6], [0.9, 1.3, 0.0], 42, 0.3, 4.0),
    actors: [{ who: "me", at: [0.95, 0, 0.75], act: "sad", back: true, beats: [{ t: 1.5, gesture: "present" }, { t: 3.6, gesture: "hang" }] }], props: [DOOR], note: "18 through the door" },
  { say: T("It's your lock. It stays shut.", ME), ...N, camera: { move: "closeUp", on: "me" }, actors: [{ who: "me", at: [0.95, 0, 0.75], act: "sad", facing: "camera" }], props: [DOOR], note: "18 it stays shut" },
  { ...N, dur: 2.0, ...move([0.9, 1.6, 1.8], [0.9, 2.0, 0.2], 50, [0.9, 1.6, 1.8], [0.9, 3.85, 0], 40, 0.1, 0.7), actors: [], props: [DOOR, UP([{ t: 0 }, { t: 0.3 }])], note: "18 her light comes back on" },
  // ======== 19. the cost; who the lock was for
  { say: T("I checked who he was."), ...N, ...cam(E, [-8.62, 1.33, 8.52], 50), actors: [], props: [VAN, IN_VAN("refused", -8.62, 1.16)], note: "19 refused" },
  { say: T("I never asked who the lock was for."), ...N, dur: 3.6, ...move(E, [-0.2, 2.6, 0.6], 60, E, [1.15, 3.9, -0.2], 21, 0.4, 2.6),
    actors: [{ who: "rachel", at: [1.18, 2.65, -0.6], act: "sad", facing: "camera" }, { who: "sam", at: [1.52, 2.65, -0.55], act: "neutral", facing: "camera" }],
    props: [VAN, DOOR, UP([{ t: 0 }, { t: 0.01 }])], note: "19 who the lock was for" },
];

export const LOCKED_OUT: Storyboard = {
  id: "locked-out", title: "Locked Out",
  cast: { me: "locksmith", marsh: "marsh", rachel: "rachel", sam: "sam", gus: "gus", officerA: "officer", officerB: "officer" },
  voice: "liamQuiet", music: { mood: "tense", gain: -8 }, engine: 3, autoSfx: false,
  shots,
};
