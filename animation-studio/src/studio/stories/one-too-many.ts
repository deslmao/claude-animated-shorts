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
const HEAD = "brian", OKOYE = "aliceCount", OKOYE_CALL = "alice";
const FIELD79 = { set: "ashfordField", light: "golden" as const };
const CORR = { set: "ashfordCorridor", light: "interiorCool" as const };
const TOI = { set: "ashfordToilets", light: "interiorCool" as const };

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

const cast: Record<string, string | { extra: number; era: "pupil" | "pupil1979" }> = { okoye: "okoye", rowe: "rowe", carol: "carol", leo: "leo", teacherA: "teacherA", teacherB: "teacherB",
  fireA: "firefighter", fireB: "firefighter", teacher79: "teacher1979", ghost: "okoyeGhost" };
for (let k = 0; k < 24; k++) cast[`o${k}`] = { extra: 100 + k, era: "pupil1979" };
for (let k = 0; k < 30; k++) if (k !== LEO_K) cast[`p${k}`] = { extra: k, era: "pupil" };
for (let k = 0; k < 24; k++) cast[`q${k}`] = { extra: 40 + k, era: "pupil" };
for (let k = 0; k < 6; k++) cast[`c${k}`] = { extra: 70 + k, era: "pupil" };

/** steady steps for smoke and fire props (they rise / roll / flicker with each step) */
const STEADY: When[] = Array.from({ length: 60 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
/** the year photos on the corridor wall by the library (right wall x 1.6, facing -x); 1979 at z -0.4, the plaque under it */
const PHOTOS = [["1975", 1.4], ["1979", -0.4], ["1986", 0.5], ["1994", 2.3], ["2003", 3.2], ["2016", 4.1]].map(([y, z]) => ({ id: "yearPhoto", variant: y as string, at: [1.58, 1.6, z as number] as V3, yaw: -90 }))
  .concat([{ id: "plaque", variant: undefined as unknown as string, at: [1.585, 1.22, -0.4] as V3, yaw: -90 }]);
/** 1979: the burning school (a window on fire with a small figure in it, smoke from the roof) */
const FIRE79 = [{ id: "fireWindow", variant: "figure", at: [2.0, 4.9, 0.03] as V3, steps: STEADY }, { id: "smokePlume", variant: "dark", at: [2.0, 6.0, 0.6] as V3, steps: STEADY },
  { id: "smokePlume", at: [-7.0, 10.6, -2.0] as V3, steps: STEADY }];
/** today: smoke pours from the science block roof and the ground-floor window of the boys' toilets (main block, x 16.5) */
const SMOKE = [{ id: "smokePlume", variant: "dark", at: [26, 4.5, -3.0] as V3, steps: STEADY }, { id: "smokePlume", at: [16.5, 2.4, 0.4] as V3, steps: STEADY },
  { id: "smokePlume", variant: "dark", at: [15.5, 10.9, -3.0] as V3, steps: STEADY }];
const CORR_SMOKE = [{ id: "ceilingSmoke", variant: "13", at: [0, 2.8, -0.5] as V3, steps: STEADY }];
const BLUE = { id: "policeLight", at: [0, 0, 0.4] as V3, steps: Array.from({ length: 24 }, (_, i) => ({ t: 0.05 + i * 0.25 })) };
/** 1979's lines on the field: three files of eight in maroon */
const lines79 = (): ActorSpec[] => Array.from({ length: 24 }, (_, k) => ({ who: `o${k}`, at: [FILES[Math.floor(k / 8)], 0, FRONT - 0.85 - (k % 8) * GAP] as V3, facing: "camera" as const, ...MANNER[(k * 3) % MANNER.length] }));
/** the real fire: Leo (4th in the left-hand file) is missing; his place is a gap */
const class7FIRE = (): ActorSpec[] => class7C().filter((a) => a.who !== "leo");
const GHOST_AT: V3 = [1.55, 0, CAROL_AT[2] - 0.45];

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
  { say: [{ text: "Twenty-nine... thirty...", who: "okoye", voice: OKOYE }, { text: "Thirty-one?", who: "okoye", voice: OKOYE, gap: 0.75 }], ...FIELD,
    camera: { move: "frame", on: ["okoye", "carol"], size: "medium", from: -70 },
    actors: [{ who: "okoye", at: [1.95, 0, 12.0], act: "confused", facing: "toward:carol", hold: "clipboard", gesture: "point" },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), CAROL()],
    props: [
      { id: "countTag", variant: "29", at: [pos7C(28)[0], TAG_Y, pos7C(28)[2]] as V3, steps: [{ word: "Twenty-nine" }] },
      { id: "countTag", variant: "30", at: [pos7C(29)[0], TAG_Y, pos7C(29)[2]] as V3, steps: [{ word: "thirty" }] },
      { id: "countTag", variant: "31", at: [CAROL_AT[0], TAG_Y - 0.05, CAROL_AT[2]] as V3, steps: [{ word: "Thirty-one" }] }],
    note: "2 thirty-one?" },
  { say: T("The register said thirty."), ...FIELD, dur: 2.0,
    ...move([0.02, 1.22, 22.92], [0, 1.2, 22.0], 46, [0.02, 1.22, 22.84], [0, 1.2, 22.0], 44, 0.2, 1.6),
    actors: [], props: [{ id: "clipboardCard", variant: "31", at: [0, 1.11, 22.0] }], note: "2 the register said thirty" },
  // ======== line 3: the head, unbothered
  { say: { text: "Happens every drill. Count again.", who: "rowe", voice: HEAD }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "rowe"], size: "medium", from: -20 },
    actors: [{ who: "okoye", at: [1.6, 0, 21.4], act: "confused", facing: "toward:rowe", hold: "clipboard", beats: [{ word: "Count", look: "left" }] },
      { who: "rowe", at: [2.6, 0, 21.6], act: "happy", facing: "toward:okoye", hold: "mug", beats: [{ t: 0.3, gesture: "shrug" }, { word: "Count", gesture: "talk" }] }],
    props: [], note: "3 count again" },
  // ======== line 4: the recount, quicker; thirty; and the end of the line is empty
  { say: { text: "Twenty-eight, twenty-nine... thirty.", who: "okoye", voice: OKOYE }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "p29"], size: "medium", from: -120 },
    actors: [{ who: "okoye", at: [2.05, 0, 11.6], act: "determined", facing: "toward:p29", hold: "clipboard", gesture: "point" },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15)],
    props: [{ id: "countTag", variant: "30", at: [pos7C(29)[0], TAG_Y, pos7C(29)[2]] as V3, steps: [{ word: "thirty" }] }], note: "4 thirty" },
  { ...FIELD, dur: 1.9,
    camera: { move: "pushIn", on: ["okoye"], size: "medium", to: "close" },
    actors: [{ who: "okoye", at: [1.95, 0, 12.0], act: "confused", facing: "camera", hold: "clipboard", beats: [{ t: 0.5, look: "right" }, { t: 1.5, face: "scared" }] },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15)],
    props: [], note: "4 she looks at the empty place" },

  // ======== line 5: the next drill; she photographs the line
  { say: T("So at the next drill, she took a photo of the line."), ...FIELD,
    camera: { move: "frame", on: ["okoye"], size: "medium", from: -55 },
    actors: [{ who: "okoye", at: [2.3, 0, 12.8], act: "determined", facing: "toward:p28", hold: "phone", gesture: "present" },
      ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 16), CAROL()],
    props: [], sfx: [{ word: "photo", name: "camera_shutter" }], note: "5 the photo" },
  // ======== line 6: the photo; the end of the line; maroon among navy
  { say: T("Thirty-one children. And at the very end, a girl in a maroon blazer. Ashford's blazers have been navy for forty years."), until: { word: "end" }, ...FIELD,
    ...move([0.02, 1.22, 22.92], [0, 1.2, 22.0], 46, [0.02, 1.22, 22.84], [0, 1.2, 22.0], 44, 0.2, 1.6),
    actors: [], props: [{ id: "phonePhoto", variant: "wide", at: [0, 1.11, 22.0] }], note: "6 the photo" },
  { cont: true, until: { word: "blazer" }, ...FIELD,
    ...move([0.02, 1.22, 22.88], [0, 1.2, 22.0], 44, [0.02, 1.22, 22.7], [0, 1.2, 22.0], 40, 0.1, 1.4),
    actors: [], props: [{ id: "phonePhoto", variant: "zoom", at: [0, 1.11, 22.0] }], note: "6 the end of the line" },
  { cont: true, ...FIELD,
    camera: { move: "frame", on: ["p29", "carol"], size: "medium", from: 160 },
    actors: [...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), CAROL()],
    props: [], note: "6 navy and maroon" },
  // ======== line 7: her face; what she stares at
  { say: T("She wasn't looking at the camera. She was staring back at the school."), until: { word: "camera" }, ...FIELD,
    ...move([1.0, 1.08, 9.3], [1.0, 1.02, 10.85], 38, [1.0, 1.06, 9.6], [1.0, 1.02, 10.85], 32, 0.1, 2.0),
    actors: [{ who: "carol", at: CAROL_AT, act: "neutral", facing: "camera" }, ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 13)],
    props: [], note: "7 her face" },
  { cont: true, ...FIELD, dur: 2.6,
    ...move([1.7, 0.75, 12.6], [0.2, 3.6, 0.0], 46, [1.55, 0.75, 12.2], [0.2, 3.9, 0.0], 40, 0.1, 2.4),
    actors: [CAROL(), ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 13)],
    props: [], note: "7 she stares at the school" },
  // ======== line 8: the photo wall by the library; 1979; the same girl
  { say: T("In the library, Ms Okoye found the old year photos. 1979. Maroon blazers. And at the end of the back row, the same girl."), until: { word: "photos" }, ...CORR,
    camera: { move: "follow", on: "okoye", size: "medium" },
    actors: [{ who: "okoye", at: [0.6, 0, 2.6], act: "thinking", facing: "toward:carol", walk: { to: [0.75, 0, 0.1], t0: 0.1, t1: 2.2 }, beats: [{ t: 0.6, look: "right" }] }],
    props: PHOTOS, note: "8 the photo wall" },
  { cont: true, until: { word: "blazers" }, ...CORR,
    ...move([0.2, 1.6, -0.4], [1.58, 1.6, -0.4], 46, [0.45, 1.62, -0.36], [1.58, 1.62, -0.36], 44, 0.1, 1.8),
    actors: [], props: PHOTOS, note: "8 1979" },
  { cont: true, ...CORR, dur: 2.4,
    ...move([0.45, 1.62, -0.36], [1.58, 1.62, -0.36], 44, [0.98, 1.72, -0.17], [1.58, 1.72, -0.17], 40, 0.2, 1.9),
    actors: [], props: PHOTOS, note: "8 the same girl" },
  // ======== line 9: the plaque; her face
  { say: T("Underneath, a small brass plaque. Carol Webb, aged eleven. Lost in the fire of 1979."), until: { word: "eleven" }, ...CORR,
    ...move([0.45, 1.24, -0.4], [1.58, 1.22, -0.4], 40, [0.55, 1.23, -0.4], [1.58, 1.22, -0.4], 38, 0.2, 2.0),
    actors: [], props: PHOTOS, note: "9 the plaque" },
  { cont: true, ...CORR,
    camera: { move: "closeUp", on: "okoye" },
    actors: [{ who: "okoye", at: [0.6, 0, 0.0], act: "sad", facing: "camera", beats: [{ t: 0.2, gesture: "coverMouth" }] }],
    props: PHOTOS, note: "9 her face" },
  // ======== line 10 (1979, golden): the real fire; the register; "Here!"
  { say: T("You see, that fire was real."), ...FIELD79,
    ...move([3.0, 1.2, 30], [2.0, 4.0, 0], 50, [3.0, 1.6, 26], [2.0, 4.6, 0], 46, 0.1, 2.4),
    actors: lines79(), props: [...FIRE79, ASSEMBLY], sfx: [{ t: 0.1, name: "fire_roar" }], note: "10 1979: the fire" },
  { say: T("On the field, a teacher called the register, and when he said \"Carol Webb\","), ...FIELD79,
    camera: { move: "frame", on: ["teacher79"], size: "medium", from: -30 },
    actors: [{ who: "teacher79", at: [0, 0, 21.4], act: "explain", facing: "camera", hold: "clipboard", gesture: "talk" }, ...lines79().slice(0, 8)],
    props: [...FIRE79], note: "10 the register" },
  { say: T("a boy shouted \"Here!\" as a joke."), ...FIELD79,
    camera: { move: "closeUp", on: "o5" },
    actors: [{ who: "o5", at: [0.0, 0, 18.55], act: "laugh", facing: "camera", gesture: "raiseHand" }, { who: "o4", at: [-1.0, 0, 18.55], act: "laugh", facing: "camera" }, { who: "o6", at: [1.0, 0, 18.55], act: "happy", facing: "camera" }],
    props: [], note: "10 Here!" },
  // ======== line 11: everyone was out; nobody went back in; the window
  { say: T("Everyone was out, the count said. So nobody went back in."), until: { word: "said" }, ...FIELD79,
    camera: { move: "frame", on: ["teacher79"], size: "full", from: 30 },
    actors: [{ who: "teacher79", at: [0, 0, 21.4], act: "happy", facing: "toward:o5", hold: "clipboard", gesture: "write" }, ...lines79().slice(0, 8)],
    props: [...FIRE79], note: "11 the tick" },
  { cont: true, ...FIELD79, dur: 2.6,
    ...move([2.0, 1.4, 16], [2.0, 4.9, 0], 40, [2.0, 1.6, 13.5], [2.0, 4.9, 0], 30, 0.2, 2.8),
    actors: lines79().filter((a) => (a.at as V3)[2] > 15), props: [...FIRE79], note: "11 the window" },
  // ======== line 12 (today): every count wrong; every face; nobody checked hers
  { say: T("Ever since, Carol has stood at the end of every line, making every count wrong."), ...FIELD,
    camera: { move: "frame", on: ["p29", "carol"], size: "medium", from: 160 },
    actors: [...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), CAROL()],
    props: [], note: "12 the end of every line" },
  { say: T("Because a wrong count makes teachers check every face."), ...FIELD,
    camera: { move: "frame", on: ["teacherB", "p21", "p22"], size: "medium", from: -45 },
    actors: [{ who: "teacherB", at: [2.1, 0, 18.4], act: "determined", facing: "toward:p22", gesture: "point", walk: { to: [2.1, 0, 17.3], t0: 0.1, t1: 2.2 } }, ...class7C().filter((a) => (a.at as V3)[0] > 0.5)],
    props: [], note: "12 every face" },
  { say: T("Nobody checked hers."), ...FIELD, dur: 2.6,
    ...move([1.0, 1.07, 9.3], [1.0, 1.02, 10.85], 38, [1.0, 1.06, 9.5], [1.0, 1.02, 10.85], 35, 0.1, 2.4),
    actors: [{ who: "carol", at: CAROL_AT, act: "sad", facing: "camera" }, ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 13)],
    props: [], note: "12 nobody checked hers" },
  // ======== line 13: the alarm, for real
  { say: T("Then, one March morning, the alarm rang for real."), until: { word: "morning" }, ...ROOM,
    ...move([2.75, 1.85, 1.9], [3.97, 2.15, 0.8], 50, [3.25, 2.1, 1.1], [3.97, 2.2, 0.65], 38, 0.15, 0.7), actors: [],
    props: [{ id: "fireBell", at: [3.96, 2.3, 0.6], yaw: -90, steps: BELL_STEPS }], sfx: [{ t: 0.02, name: "fire_bell" }], note: "13 the bell" },
  { cont: true, ...ROOM,
    camera: { move: "frame", on: ["c0", "c1"], size: "medium", from: 20 },
    actors: [{ who: "c0", at: [-0.9, 0, 1.6], act: "scared", facing: "camera", beats: [{ t: 0.2, look: "up" }] }, { who: "c1", at: [0.5, 0, 1.6], act: "shock", facing: "camera", beats: [{ t: 0.3, look: "right" }] }],
    props: [], note: "13 for real" },
  // ======== line 14: smoke from the science block; she counts: thirty, exactly right
  { say: T("Smoke poured from the science block. Ms Okoye counted her class. Thirty. Exactly right."), until: { word: "block" }, ...FIELD,
    ...move([4.0, 1.4, 27], [10, 5.5, -2], 54, [4.4, 2.0, 28], [11, 6.5, -2], 52, 0.1, 2.2),
    actors: [...class7FIRE(), ...others()], props: [...SMOKE, ASSEMBLY], sfx: [{ t: 0.1, name: "fire_roar" }, { t: 0.3, name: "kids_chatter" }], note: "14 smoke" },
  { cont: true, until: { word: "class" }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "p20", "p21"], size: "medium", from: -50 },
    actors: [{ who: "okoye", at: [2.1, 0, 19.6], act: "nervous", facing: "toward:p21", hold: "clipboard", gesture: "point", walk: { to: [2.1, 0, 18.7], t0: 0.1, t1: 1.4 } }, ...class7FIRE().filter((a) => (a.at as V3)[0] > 0.5)],
    props: [...SMOKE], note: "14 she counts" },
  { cont: true, ...FIELD,
    camera: { move: "frame", on: ["okoye", "carol"], size: "medium", from: -70 },
    actors: [{ who: "okoye", at: [1.95, 0, 12.0], act: "relief", facing: "toward:carol", hold: "clipboard", gesture: "point" }, ...class7FIRE().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), CAROL()],
    props: [{ id: "countTag", variant: "29", at: [pos7C(29)[0], TAG_Y, pos7C(29)[2]] as V3, steps: [{ word: "Thirty" }] }, { id: "countTag", variant: "30", at: [CAROL_AT[0], TAG_Y - 0.05, CAROL_AT[2]] as V3, steps: [{ word: "Exactly" }] }],
    note: "14 thirty, exactly right" },
  // ======== line 15: the head, relieved
  { say: { text: "That's everyone. Well done.", who: "rowe", voice: HEAD }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "rowe"], size: "medium", from: -20 },
    actors: [{ who: "okoye", at: [1.6, 0, 21.4], act: "relief", facing: "toward:rowe", hold: "clipboard" }, { who: "rowe", at: [2.6, 0, 21.6], act: "relief", facing: "toward:okoye", hold: "mug", beats: [{ t: 0.3, look: "camera" }] }],
    props: [...SMOKE], note: "15 that's everyone" },
  // ======== line 16: she looks at the end of the line; Carol; one window
  { say: T("But Ms Okoye was looking at the end of the line. Carol was there. Staring at one window."), until: { word: "line" }, ...FIELD,
    camera: { move: "closeUp", on: "okoye" },
    actors: [{ who: "okoye", at: [1.6, 0, 21.4], act: "thinking", facing: "camera", hold: "clipboard", beats: [{ t: 0.3, look: "right" }] }],
    props: [...SMOKE], note: "16 she looks" },
  { cont: true, until: { word: "there" }, ...FIELD,
    camera: { move: "frame", on: ["p29", "carol"], size: "medium", from: 160 },
    actors: [...class7FIRE().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), CAROL()],
    props: [...SMOKE], note: "16 Carol was there" },
  { cont: true, ...FIELD, dur: 2.2,
    ...move([1.7, 0.75, 12.6], [15.5, 1.8, 0.0], 40, [1.6, 0.75, 12.3], [16.5, 1.8, 0.0], 24, 0.1, 2.0),
    actors: [CAROL(), ...class7FIRE().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 13)],
    props: [...SMOKE], note: "16 one window" },
  // ======== line 17: if she was in the line and the count was right...
  { say: T("If Carol was in the line, and the count was right, one of her children wasn't."), ...FIELD,
    camera: { move: "pushIn", on: ["okoye"], size: "medium", to: "close" },
    actors: [{ who: "okoye", at: [1.6, 0, 21.4], act: "shock", facing: "camera", hold: "clipboard", beats: [{ word: "wasn't", face: "scared" }] }],
    props: [...SMOKE], note: "17 the realisation" },
  // ======== line 18: every face; the gap; the toilets
  { say: T("She checked every face. Leo was missing. He'd gone to the toilets just before the bell."), until: { word: "missing" }, ...FIELD,
    camera: { move: "frame", on: ["p2", "p4"], size: "medium", from: 40 },
    actors: [...class7FIRE().filter((a) => (a.at as V3)[0] < -0.5), { who: "okoye", at: [-2.0, 0, 16.6], act: "scared", facing: "toward:p2", gesture: "point" }],
    props: [...SMOKE], note: "18 the gap where Leo stands" },
  { cont: true, ...FIELD,
    camera: { move: "frame", on: ["p2"], size: "full", from: 30 },
    actors: [{ who: "p2", at: pos7C(2), act: "nervous", facing: "camera", beats: [{ word: "toilets", gesture: "point" }] }, ...class7FIRE().filter((a) => (a.at as V3)[0] < -0.5 && a.who !== "p2")],
    props: [...SMOKE], note: "18 the toilets" },
  // ======== line 19: the head says wait; she runs back in
  { say: T("The head told her to wait for the fire brigade. She ran back in."), until: { word: "brigade" }, ...FIELD,
    camera: { move: "frame", on: ["okoye", "rowe"], size: "medium", from: -20 },
    actors: [{ who: "okoye", at: [1.6, 0, 21.4], act: "determined", facing: "toward:rowe" }, { who: "rowe", at: [2.6, 0, 21.6], act: "scared", facing: "toward:okoye", gesture: "stop" }],
    props: [...SMOKE], note: "19 wait" },
  { cont: true, ...FIELD, dur: 2.0,
    ...move([2.0, 1.3, 15.0], [0, 1.5, 2.0], 52, [2.0, 1.5, 12.5], [0, 1.6, 2.0], 50, 0.1, 2.2),
    actors: [{ who: "okoye", at: [1.2, 0, 13.2], act: "determined", walk: { to: [0, 0, 3.2], t0: 0.05, t1: 2.3, mode: "run", view: "back" } }],
    props: [...SMOKE, { id: "smokePlume", variant: "dark", at: [0, 2.6, 2.4], steps: STEADY }], sfx: [{ t: 0.1, name: "fire_roar" }], note: "19 she runs back in" },
  // ======== line 20: the corridor; smoke along the ceiling; low, calling
  { say: T("Smoke rolled along the ceiling."), ...CORR,
    ...move([0.3, 1.2, 6.2], [0, 1.6, -6.5], 56, [0.2, 1.1, 5.0], [0, 1.6, -6.5], 52, 0.1, 2.4),
    actors: [{ who: "okoye", at: [0.2, -0.45, 4.0], act: "scared", gesture: "coverMouth", walk: { to: [0.1, -0.45, -0.5], t0: 0.2, t1: 3.0, view: "back" } }],
    props: [...CORR_SMOKE, ...PHOTOS], sfx: [{ t: 0.1, name: "fire_roar" }], note: "20 the smoke" },
  { say: [T("She stayed low, calling his name."), { text: "Leo! Leo!", who: "okoye", voice: OKOYE_CALL, gap: 0.3 }], ...CORR,
    ...move([0.35, 0.85, 1.6], [0.1, 1.55, -1.2], 62, [0.3, 0.85, 1.2], [0.1, 1.6, -1.2], 58, 0.1, 2.6),
    actors: [{ who: "okoye", at: [0.1, -0.45, -1.0], act: "scared", facing: "camera", beats: [{ t: 0.1, gesture: "coverMouth" }, { word: "Leo!", gesture: "hang", look: "left" }] }],
    props: [...CORR_SMOKE], note: "20 low, calling" },
  // ======== line 21: under the sinks; towards the stairs
  { say: T("She found him under the sinks, and pushed him towards the stairs."), until: { word: "sinks" }, ...TOI,
    camera: { move: "closeUp", on: "leo" },
    actors: [{ who: "leo", at: [0.0, -0.55, -1.25], act: "scared", facing: "camera" }, { who: "okoye", at: [0.55, -0.3, -0.75], act: "scared", facing: "toward:leo", gesture: "grab", reach: "leo" }],
    props: [{ id: "ceilingSmoke", variant: "4", at: [0, 2.7, 0], steps: STEADY }], sfx: [{ t: 0.3, name: "cough" }], note: "21 under the sinks" },
  { cont: true, ...CORR, dur: 2.2,
    ...move([0.0, 1.0, 4.0], [0, 1.0, -4.0], 58, [0.0, 1.0, 5.0], [0, 1.0, -4.0], 56, 0.1, 2.0),
    actors: [{ who: "leo", at: [0.1, 0, -4.5], act: "scared", walk: { to: [0.1, 0, 3.6], t0: 0.05, t1: 1.9, mode: "run", view: "front" } }, { who: "okoye", at: [0.4, -0.45, -5.4], act: "scared", facing: "camera", gesture: "present" }],
    props: [...CORR_SMOKE], sfx: [{ t: 0.4, name: "cough" }], note: "21 towards the stairs" },
  // ======== line 22: Leo came out; she didn't
  { say: T("Leo came out."), ...FIELD, dur: 2.0,
    ...move([1.4, 1.25, 11.2], [0.4, 1.3, 3.5], 50, [1.4, 1.25, 10.9], [0.4, 1.3, 3.5], 49, 0.1, 1.8),
    actors: [{ who: "leo", at: [0.4, 0, 3.2], act: "scared", walk: { to: [0.6, 0, 6.6], t0: 0.05, t1: 1.6, view: "front" } }, { who: "fireA", at: [1.3, 0, 6.6], act: "determined", facing: "toward:leo", gesture: "offer" }, { who: "fireB", at: [-1.2, 0, 6.0], act: "determined", facing: "toward:leo" }],
    props: [{ id: "smokePlume", variant: "dark", at: [0, 2.6, 2.4], steps: STEADY }, BLUE], sfx: [{ t: 0.4, name: "cough" }], note: "22 Leo came out" },
  { say: { text: "Ms Okoye didn't.", gap: 0.4 }, ...FIELD, dur: 3.4,
    ...move([0.2, 1.5, 8.6], [0, 1.4, 2.6], 46, [0.15, 1.5, 7.2], [0, 1.4, 2.6], 36, 0.2, 3.0),
    actors: [], props: [{ id: "smokePlume", variant: "dark", at: [0, 2.6, 2.4], steps: STEADY }, BLUE], sfx: [{ t: 0.1, name: "fire_roar" }], note: "22 she didn't" },
  // ======== line 23: the next drill: thirty-two
  { say: T("At the next fire drill, her class counted thirty-two."), until: { word: "class" }, ...FIELD,
    camera: { move: "frame", on: ["teacherB"], size: "medium", from: -40 },
    actors: [{ who: "teacherB", at: [2.1, 0, 18.4], act: "neutral", facing: "toward:p22", hold: "clipboard", gesture: "point" }, ...class7C().filter((a) => (a.at as V3)[0] > 0.5)],
    props: [], note: "23 the next drill" },
  { cont: true, ...FIELD, dur: 3.0,
    camera: { move: "frame", on: ["carol", "ghost"], size: "medium", from: 165 },
    actors: [...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), CAROL(), { who: "ghost", at: GHOST_AT, act: "neutral", back: true }],
    props: [{ id: "countTag", variant: "31", at: [CAROL_AT[0], TAG_Y - 0.05, CAROL_AT[2]] as V3, steps: [{ t: 0.2 }] }, { id: "countTag", variant: "32", at: [GHOST_AT[0], 1.95, GHOST_AT[2]] as V3, steps: [{ word: "thirty-two" }] }],
    note: "23 thirty-two" },
  { ...FIELD, dur: 2.7,
    ...move([1.4, 1.2, 14.5], [1.1, 1.6, 5.0], 50, [1.35, 1.25, 13.4], [1.1, 1.8, 5.0], 42, 0.2, 3.0),
    actors: [CAROL(), { who: "ghost", at: GHOST_AT, act: "neutral", back: true }, ...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 13)],
    props: [], note: "23 the two of them, facing the school" },
];

/** scenery props a shot's camera never sees (found by probing the validator, shot by shot): dropped from those shots
 *  so every prop listed is on screen; the smoke, fire and photo wall stay wherever they are seen */
const OFF_FRAME: Record<string, number[]> = {"8 the photo wall": [0, 2, 3, 4, 5], "8 1979": [0, 2, 3, 4, 5], "8 the same girl": [0, 2, 3, 4, 5], "9 the plaque": [0, 2, 3, 4, 5], "9 her face": [0, 1, 2, 3, 4, 5, 6], "10 the register": [0, 1, 2], "11 the tick": [0, 1], "14 smoke": [0, 3], "15 that's everyone": [0], "16 she looks": [0, 1, 2], "16 Carol was there": [0, 1, 2], "17 the realisation": [0, 1, 2], "18 the gap where Leo stands": [0, 1, 2], "18 the toilets": [0, 1, 2], "19 wait": [0], "19 she runs back in": [0, 1, 2], "21 under the sinks": [0], "11 the window": [2], "14 she counts": [2], "16 one window": [2], "10 1979: the fire": [3], "20 the smoke": [4, 5, 6]};
for (const s of shots) { const k = OFF_FRAME[s.note ?? ""]; if (k && s.props) s.props = s.props.filter((_, i) => !k.includes(i)); }

export const ONE_TOO_MANY: Storyboard = {
  id: "one-too-many", title: "One Too Many",
  cast, voice: "georgeHushed", music: { mood: "mystery", gain: -3 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
