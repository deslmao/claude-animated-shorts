// One Too Many (productions/one-too-many): a narrated school ghost story. Third person; the narrator tells it, the
// school acts it out. Staging rules: every line gets one big literal picture; the headcounts are always shown as a
// count you can see (number tags popping over heads, the register's numbers); Carol is never a jump scare: she is the
// one still figure in a moving crowd, in a faded maroon blazer among navy ones, always facing the school.
// Quality baseline: Float Away, Extra Door, Pirate Democracy: library framings (their lens blur isolates the subject),
// named faces large in frame, a performed beat in every shot, motion blur on. Number tags are used only for the last
// heads of the count. This file holds the opening (prototype); later beats are appended after its approval.
import type { Storyboard, ShotSpec, ActorSpec, When } from "../story/types";

type V3 = [number, number, number];
const T = (text: string, voice?: string) => (voice ? { text, voice } : { text });
const atCam = (pos: V3, look: V3, fov: number) => ({ move: "at" as const, pos, look, fov });
const move = (p0: V3, l0: V3, f0: number, p1: V3, l1: V3, f1: number, t0 = 0.1, dur = 1.6) =>
  ({ camera: atCam(p0, l0, f0), cams: [{ t: 0, ...atCam(p0, l0, f0), blockOk: true }, { t: t0, ...atCam(p1, l1, f1), glide: dur, blockOk: true }] });
const FIELD = { set: "ashfordField", light: "day" as const };
const ROOM = { set: "classroom", light: "interior" as const };
const HEAD = "brian", OKOYE = "alice";

// ---------------------------------------------------------------- 7C on the field: three files of ten, facing the teacher
// files at x -1, 0, 1; the front pupil at z 19.4, then every 0.85 m back toward the school. Carol stands behind the
// last pupil of the right-hand file (x 1, z 10.9), facing the school.
const FILES = [-1, 0, 1], FRONT = 19.4, GAP = 0.85;
const pos7C = (k: number): V3 => [FILES[Math.floor(k / 10)], 0, FRONT - (k % 10) * GAP];
const CAROL_AT: V3 = [1, 0, FRONT - 10 * GAP - 0.05];
const LEO_K = 3;                                                                     // Leo: 4th in the left-hand file
const pupil = (k: number) => (k === LEO_K ? "leo" : `p${k}`);
/** the whole class in line (the 30 on the register), facing the camera side; each pupil has their own manner
 *  (bored, chatty, fidgety, curious) and a glance or two, so the line is alive and Carol's stillness stands out */
const MANNER: Partial<ActorSpec>[] = [
  { act: "neutral" }, { act: "happy", beats: [{ t: 0.4, look: "left" }] }, { act: "sleepy" }, { act: "suspicious", beats: [{ t: 0.8, look: "right" }] },
  { act: "embarrassed" }, { act: "neutral", beats: [{ t: 0.3, look: "up" }] }, { act: "thinking" }, { act: "nervous" }, { act: "neutral", beats: [{ t: 1.0, look: "left" }] }, { act: "happy" },
];
const class7C = (extra: Partial<ActorSpec> = {}): ActorSpec[] => Array.from({ length: 30 }, (_, k) => ({ who: pupil(k), at: pos7C(k), facing: "camera" as const, ...MANNER[(k * 7) % MANNER.length], ...extra }));
/** the other forms either side (7B left, 7D right): two files of six each, for scale */
const others = (): ActorSpec[] => [-4.4, -3.4, 3.4, 4.4].flatMap((x, f) => Array.from({ length: 6 }, (_, k) => ({ who: `q${f * 6 + k}`, at: [x, 0, FRONT - k * GAP] as V3, act: "neutral" as const, facing: "camera" as const })));
const CAROL = (extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "carol", at: CAROL_AT, act: "neutral", back: true, ...extra });
/** number tags pop over the last heads of the count, on the words that count them */
const TAG_Y = 1.5;
const ASSEMBLY = { id: "assemblySign", at: [-3.6, 0, 9.4] as V3 };

const cast: Record<string, string | { extra: number; era: "pupil" }> = { okoye: "okoye", rowe: "rowe", carol: "carol", leo: "leo", teacherA: "teacherA", teacherB: "teacherB" };
for (let k = 0; k < 30; k++) if (k !== LEO_K) cast[`p${k}`] = { extra: k, era: "pupil" };
for (let k = 0; k < 24; k++) cast[`q${k}`] = { extra: 40 + k, era: "pupil" };
for (let k = 0; k < 6; k++) cast[`c${k}`] = { extra: 70 + k, era: "pupil" };

// the bell: rings from the start of the film (hammer steps every 0.05 s)
const BELL_STEPS: When[] = Array.from({ length: 34 }, (_, i) => ({ t: -0.6 + i * 0.05 })); // steps ease over 0.7 s: start early so it rings from the first frame

const shots: ShotSpec[] = [
  // ======== line 1: the bell; the classroom empties at the lens; the school pours out past the railings onto the field
  { say: { ...T("Every fire drill at Ashford High, Year Seven comes out with one pupil too many."), pauses: [{ after: "High", s: 0.5 }] }, until: { word: "High" }, ...ROOM,
    ...move([2.75, 1.85, 1.9], [3.97, 2.15, 0.8], 50, [3.25, 2.1, 1.1], [3.97, 2.2, 0.65], 38, 0.15, 0.7), actors: [],
    props: [{ id: "fireBell", at: [3.96, 2.3, 0.6], yaw: -90, steps: BELL_STEPS }], sfx: [{ t: 0.02, name: "fire_bell" }], note: "1 the bell" },
  { cont: true, until: { word: "comes" }, ...ROOM, dur: 1.9,
    ...move([3.6, 1.35, 2.7], [-2.0, 1.0, 1.0], 62, [3.7, 1.3, 2.9], [-1.0, 1.0, 1.2], 58, 0.2, 1.2),
    actors: Array.from({ length: 6 }, (_, k): ActorSpec => ({ who: `c${k}`, at: [-3.0 + k * 0.55, 0, 1.65] as V3, act: k % 2 ? "shock" : "excited",
      walk: { to: [4.6, 0, 1.6] as V3, t0: 0.05 + k * 0.08, t1: 1.3 + k * 0.05, mode: "run" } })),
    props: [], sfx: [{ t: 0.1, name: "chair_scrape" }, { t: 0.35, name: "chair_scrape" }], note: "1 the classroom empties" },
  { cont: true, ...FIELD, dur: 2.6,
    ...move([2.6, 0.9, 13.5], [0, 1.9, 2], 58, [5.5, 6.5, 30], [0, 1.5, 12], 52, 0.25, 2.3),
    actors: [...class7C(), ...others(), CAROL(),
      { who: "teacherA", at: [1.9, 0, 8.4], act: "explain", facing: "toward:c2", gesture: "point" },
      ...Array.from({ length: 6 }, (_, k): ActorSpec => ({ who: `c${k % 6}`, at: [-1.6 + k * 0.6, 0, 1.4] as V3, act: "neutral",
        walk: { to: [-6 + k * 2.4, 0, 9.5 + (k % 2)] as V3, t0: k * 0.1, t1: 2.2, view: "front" } }))],
    props: [ASSEMBLY], sfx: [{ t: 0.1, name: "kids_chatter" }], note: "1 the school pours out" },
  // ======== line 2: the new teacher; she counts under her breath; the register
  { say: T("Ms Okoye was new. On her first drill, she counted her class."), until: { word: "drill" }, ...FIELD,
    camera: { move: "closeUp", on: "okoye" },
    actors: [{ who: "okoye", at: [0, 0, 21.6], act: "nervous", facing: "camera", hold: "clipboard", beats: [{ t: 0.35, look: "left" }, { t: 0.9, look: "camera" }] },
      { who: "teacherB", at: [-3.9, 0, 21.2], act: "neutral", facing: "toward:q0" }],
    props: [], note: "2 Ms Okoye was new" },
  { cont: true, ...FIELD, dur: 2.0,
    camera: { move: "frame", on: ["okoye", "p20", "p21", "p22"], size: "medium", from: -50 },
    actors: [{ who: "okoye", at: [2.1, 0, 19.6], act: "determined", facing: "toward:p21", hold: "clipboard", gesture: "point", walk: { to: [2.1, 0, 18.7], t0: 0.2, t1: 1.9 } },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5)],
    props: [], note: "2 she counts the line" },
  { say: { text: "Twenty-nine... thirty... thirty-one?", who: "okoye", voice: OKOYE }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "carol"], size: "medium", from: -70 },
    actors: [{ who: "okoye", at: [1.95, 0, 12.0], act: "confused", facing: "toward:carol", hold: "clipboard", gesture: "point" },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), CAROL()],
    props: [
      { id: "countTag", variant: "29", at: [pos7C(28)[0], TAG_Y, pos7C(28)[2]] as V3, steps: [{ word: "Twenty-nine" }] },
      { id: "countTag", variant: "30", at: [pos7C(29)[0], TAG_Y, pos7C(29)[2]] as V3, steps: [{ word: "thirty" }] },
      { id: "countTag", variant: "31", at: [CAROL_AT[0], TAG_Y - 0.05, CAROL_AT[2]] as V3, steps: [{ word: "thirty-one" }] }],
    note: "2 thirty-one?" },
  { say: T("The register said thirty."), ...FIELD, dur: 2.0,
    ...move([0.02, 1.2, 22.66], [0, 1.18, 22.0], 46, [0.02, 1.2, 22.58], [0, 1.18, 22.0], 42, 0.2, 1.6),
    actors: [], props: [{ id: "clipboardCard", variant: "31", at: [0, 1.11, 22.0] }], note: "2 the register said thirty" },
  // ======== line 3: the head, unbothered
  { say: { text: "Happens every drill. Count again.", who: "rowe", voice: HEAD }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "rowe"], size: "medium", from: -20 },
    actors: [{ who: "okoye", at: [1.6, 0, 21.4], act: "confused", facing: "toward:rowe", hold: "clipboard", beats: [{ word: "Count", look: "left" }] },
      { who: "rowe", at: [2.6, 0, 21.6], act: "happy", facing: "toward:okoye", hold: "mug", beats: [{ t: 0.3, gesture: "shrug" }, { word: "Count", gesture: "talk" }] }],
    props: [], note: "3 count again" },
  // ======== line 4: the recount, quicker; thirty; and the end of the line is empty
  { say: { text: "Twenty-eight, twenty-nine... thirty.", who: "okoye", voice: OKOYE }, ...FIELD,
    camera: { move: "overShoulder", over: "okoye", at: "p29" },
    actors: [{ who: "okoye", at: [2.0, 0, 13.6], act: "determined", facing: "toward:p29", hold: "clipboard", gesture: "point" },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15)],
    props: [{ id: "countTag", variant: "30", at: [pos7C(29)[0], TAG_Y, pos7C(29)[2]] as V3, steps: [{ word: "thirty" }] }], note: "4 thirty" },
  { ...FIELD, dur: 2.4,
    camera: { move: "pushIn", on: ["okoye"], size: "medium", to: "close" },
    actors: [{ who: "okoye", at: [2.0, 0, 13.6], act: "confused", facing: "camera", hold: "clipboard", beats: [{ t: 0.5, look: "right" }, { t: 1.5, face: "scared" }] },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15)],
    props: [], note: "4 she looks at the empty place" },
];

export const ONE_TOO_MANY: Storyboard = {
  id: "one-too-many", title: "One Too Many",
  cast, voice: "georgeHushed", music: { mood: "mystery", gain: -3 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
