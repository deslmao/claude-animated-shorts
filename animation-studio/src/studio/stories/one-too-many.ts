// One Too Many (productions/one-too-many): a narrated school ghost story. Third person; the narrator tells it, the
// school acts it out. Staging rules: every line gets one big literal picture; the headcounts are always shown as a
// count you can see (number tags popping over heads, the register's numbers); Carol is never a jump scare: she is the
// one still figure in a moving crowd, in a faded maroon blazer among navy ones, always facing the school.
// This file holds the opening (prototype: lines 1-4); later beats are appended after the prototype review.
import type { Storyboard, ShotSpec, ActorSpec, When } from "../story/types";

type V3 = [number, number, number];
const T = (text: string, voice?: string) => (voice ? { text, voice } : { text });
const atCam = (pos: V3, look: V3, fov: number) => ({ move: "at" as const, pos, look, fov });
const move = (p0: V3, l0: V3, f0: number, p1: V3, l1: V3, f1: number, t0 = 0.1, dur = 1.6) =>
  ({ camera: atCam(p0, l0, f0), cams: [{ t: 0, ...atCam(p0, l0, f0), blockOk: true }, { t: t0, ...atCam(p1, l1, f1), glide: dur, blockOk: true }] });
const FIELD = { set: "ashfordField", light: "day" as const };
const ROOM = { set: "classroom", light: "interior" as const };
const HEAD = "brian";

// ---------------------------------------------------------------- 7C on the field: three files of ten, facing the teacher
// files at x -1, 0, 1; the front pupil at z 19.4, then every 0.85 m back toward the school. Carol stands behind the
// last pupil of the right-hand file (x 1, z 10.9), facing the school.
const FILES = [-1, 0, 1], FRONT = 19.4, GAP = 0.85;
const pos7C = (k: number): V3 => [FILES[Math.floor(k / 10)], 0, FRONT - (k % 10) * GAP];
const CAROL_AT: V3 = [1, 0, FRONT - 10 * GAP - 0.05];
const LEO_K = 3;                                                                     // Leo: 4th in the left-hand file
const pupil = (k: number) => (k === LEO_K ? "leo" : `p${k}`);
/** the whole class in line (the 30 on the register), facing the camera side */
const class7C = (extra: Partial<ActorSpec> = {}): ActorSpec[] => Array.from({ length: 30 }, (_, k) => ({ who: pupil(k), at: pos7C(k), act: "neutral", facing: "camera", ...extra }));
/** the other forms either side (7B left, 7D right): two files of six each, for scale */
const others = (): ActorSpec[] => [-4.4, -3.4, 3.4, 4.4].flatMap((x, f) => Array.from({ length: 6 }, (_, k) => ({ who: `q${f * 6 + k}`, at: [x, 0, FRONT - k * GAP] as V3, act: "neutral" as const, facing: "camera" as const })));
const CAROL = (extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "carol", at: CAROL_AT, act: "neutral", back: true, ...extra });
/** number tags popping over heads, one after another: the order is the teacher's count, front to back, file by file */
const TAG_Y = 1.62;
const tags = (heads: V3[], t0: number, dt: number) => heads.map((p, i) => ({ id: "countTag", variant: String(i + 1), at: [p[0], TAG_Y, p[2]] as V3, steps: [{ t: t0 + i * dt }] as When[] }));
const ASSEMBLY = { id: "assemblySign", at: [-3.6, 0, 9.4] as V3 };

const cast: Record<string, string | { extra: number; era: "pupil" }> = { okoye: "okoye", rowe: "rowe", carol: "carol", leo: "leo" };
for (let k = 0; k < 30; k++) if (k !== LEO_K) cast[`p${k}`] = { extra: k, era: "pupil" };
for (let k = 0; k < 24; k++) cast[`q${k}`] = { extra: 40 + k, era: "pupil" };
for (let k = 0; k < 6; k++) cast[`c${k}`] = { extra: 70 + k, era: "pupil" };

// the bell: rings from the start of the film (hammer steps every 0.05 s)
const BELL_STEPS: When[] = Array.from({ length: 34 }, (_, i) => ({ t: -0.6 + i * 0.05 })); // steps ease over 0.7 s: start early so it rings from the first frame

const shots: ShotSpec[] = [
  // ======== line 1: the bell; the classroom empties; the school pours out onto the field
  { say: { ...T("Every fire drill at Ashford High, Year Seven comes out with one pupil too many."), pauses: [{ after: "High", s: 0.5 }] }, until: { word: "High" }, ...ROOM,
    ...move([2.75, 1.85, 1.9], [3.97, 2.15, 0.8], 50, [3.25, 2.1, 1.1], [3.97, 2.2, 0.65], 38, 0.15, 0.7), actors: [],
    props: [{ id: "fireBell", at: [3.96, 2.3, 0.6], yaw: -90, steps: BELL_STEPS }], sfx: [{ t: 0.02, name: "fire_bell" }], note: "1 the bell" },
  { cont: true, until: { word: "comes" }, ...ROOM, dur: 1.9,
    ...move([3.6, 1.35, 2.7], [-2.0, 1.0, 1.0], 62, [3.7, 1.3, 2.9], [-1.0, 1.0, 1.2], 58, 0.2, 1.2),
    actors: Array.from({ length: 6 }, (_, k): ActorSpec => ({ who: `c${k}`, at: [-3.0 + k * 0.55, 0, 1.65] as V3, act: "shock",
      walk: { to: [4.6, 0, 1.6] as V3, t0: 0.05 + k * 0.08, t1: 1.3 + k * 0.05, mode: "run" } })),
    props: [], sfx: [{ t: 0.1, name: "chair_scrape" }, { t: 0.35, name: "chair_scrape" }], note: "1 the classroom empties" },
  { cont: true, ...FIELD, dur: 2.6,
    ...move([2.6, 0.9, 13.5], [0, 1.9, 2], 58, [5.5, 6.5, 30], [0, 1.5, 12], 52, 0.25, 2.3),
    actors: [...class7C(), ...others(), CAROL(),
      ...Array.from({ length: 6 }, (_, k): ActorSpec => ({ who: `c${k % 6}`, at: [-1.6 + k * 0.6, 0, 1.4] as V3, act: "neutral",
        walk: { to: [-6 + k * 2.4, 0, 9.5 + (k % 2)] as V3, t0: k * 0.1, t1: 2.2, view: "front" } }))],
    props: [ASSEMBLY], sfx: [{ t: 0.1, name: "kids_chatter" }], note: "1 the school pours out" },
  // ======== line 2: the new teacher counts
  { say: { ...T("Ms Okoye was new. On her first drill, she counted them on the field. Thirty-one. The register said thirty."), pauses: [{ after: "new", s: 0.3 }, { after: "field", s: 1.6 }, { after: "Thirty-one", s: 0.5 }] }, until: { word: "drill" }, ...FIELD,
    ...move([1.3, 1.55, 25.2], [0.1, 1.45, 21.6], 34, [1.1, 1.55, 24.7], [0.1, 1.45, 21.6], 30, 0.1, 1.4),
    actors: [{ who: "okoye", at: [0, 0, 21.6], act: "nervous", facing: "camera", hold: "clipboard", beats: [{ t: 0.5, look: "left" }] }, ...class7C().slice(0, 3)],
    props: [], note: "2 Ms Okoye was new" },
  { cont: true, until: { word: "field" }, ...FIELD, dur: 2.4,
    ...move([5.6, 3.1, 23.2], [1.0, 0.8, 18.2], 40, [5.6, 3.1, 16.6], [1.0, 0.8, 11.6], 40, 0.1, 1.5),
    actors: [{ who: "okoye", at: [2.0, 0, 20.2], act: "determined", facing: "toward:p25", hold: "clipboard", gesture: "point", walk: { to: [2.0, 0, 13.4], t0: 0.1, t1: 1.55 } }, ...class7C(), CAROL()],
    props: [], note: "2 she counts the line" },
  { cont: true, until: { word: "Thirty-one" }, ...FIELD, dur: 2.5,
    camera: atCam([3.4, 8.8, 25.2], [0.0, 0.3, 15.2], 50), cams: [{ t: 0, ...atCam([3.4, 8.8, 25.2], [0.0, 0.3, 15.2], 50), blockOk: true }, { t: 1.25, ...atCam([2.9, 5.0, 15.6], [0.7, 0.4, 11.4], 46), cut: true, blockOk: true }],
    actors: [...class7C(), ...others(), CAROL(), { who: "okoye", at: [2.1, 0, 12.2], act: "neutral", facing: "toward:carol", hold: "clipboard" }],
    props: [...tags([...Array.from({ length: 30 }, (_, k) => pos7C(k)), CAROL_AT], 0.1, 0.055), ASSEMBLY], note: "2 thirty-one" },
  { cont: true, ...FIELD, dur: 2.0,
    ...move([0.02, 1.2, 22.66], [0, 1.18, 22.0], 46, [0.02, 1.2, 22.58], [0, 1.18, 22.0], 42, 0.2, 1.6),
    actors: [], props: [{ id: "clipboardCard", variant: "31", at: [0, 1.11, 22.0] }], note: "2 the register said thirty" },
  // ======== line 3: the head, unbothered
  { say: { text: "Happens every drill. Count again.", who: "rowe", voice: HEAD }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "rowe"], size: "medium", from: -20 },
    actors: [{ who: "okoye", at: [1.6, 0, 21.4], act: "confused", facing: "toward:rowe", hold: "clipboard" },
      { who: "rowe", at: [2.6, 0, 21.6], act: "happy", facing: "toward:okoye", hold: "mug", beats: [{ t: 0.5, gesture: "shrug" }] }],
    props: [], note: "3 count again" },
  // ======== line 4: the recount: thirty, and the end of the line is empty
  { say: T("She counted again. Thirty."), ...FIELD,
    camera: atCam([3.4, 8.8, 25.2], [0.0, 0.3, 15.2], 50), cams: [{ t: 0, ...atCam([3.4, 8.8, 25.2], [0.0, 0.3, 15.2], 50), blockOk: true }, { t: 1.25, ...atCam([2.9, 5.0, 15.6], [0.7, 0.4, 11.4], 46), cut: true, blockOk: true }],
    actors: [...class7C(), ...others(), { who: "okoye", at: [1.9, 0, 12.6], act: "neutral", facing: "toward:p29", hold: "clipboard" }],
    props: [...tags(Array.from({ length: 30 }, (_, k) => pos7C(k)), 0.05, 0.05), ASSEMBLY], note: "4 thirty" },
  { ...FIELD, dur: 2.2,
    camera: atCam([2.6, 3.6, 13.8], [1.0, 0.3, 10.8], 42), cams: [{ t: 0, ...atCam([2.6, 3.6, 13.8], [1.0, 0.3, 10.8], 42), blockOk: true }],
    actors: [...class7C(), { who: "okoye", at: [1.9, 0, 12.6], act: "confused", facing: "toward:p29" }],
    props: tags(Array.from({ length: 30 }, (_, k) => pos7C(k)), 0, 0).filter((p) => p.at[2] < 12.0 && p.at[0] > 0.5), note: "4 the empty place at the end of the line" },
];

export const ONE_TOO_MANY: Storyboard = {
  id: "one-too-many", title: "One Too Many",
  cast, voice: "georgeHushed", music: { mood: "mystery", gain: -10 }, engine: 3, autoSfx: false,
  shots,
};
