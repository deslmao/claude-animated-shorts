// One Too Many: YouTube thumbnail set-ups (productions/one-too-many/final/thumbnails). Not a film: one still per shot,
// rendered at 2x and cropped to a 16:9 band (scripts in productions/one-too-many/final/thumbnails/). Same set, cast,
// props and lights as the film (stories/one-too-many.ts); the class of 30 in navy, Carol in faded maroon, a step apart.
import type { Storyboard, ShotSpec, ActorSpec } from "../story/types";

type V3 = [number, number, number];
const at = (pos: V3, look: V3, fov: number) => ({ move: "at" as const, pos, look, fov });
const FILES = [-1, 0, 1], FRONT = 19.4, GAP = 0.85, LEO_K = 3;
const pos7C = (k: number): V3 => [FILES[Math.floor(k / 10)], 0, FRONT - (k % 10) * GAP];
const pupil = (k: number) => (k === LEO_K ? "leo" : `p${k}`);
const MANNER: Partial<ActorSpec>[] = [{ act: "neutral" }, { act: "happy" }, { act: "sleepy" }, { act: "suspicious" }, { act: "embarrassed" }, { act: "neutral" }, { act: "thinking" }, { act: "nervous" }, { act: "neutral" }, { act: "happy" }];
const class7C = (extra: Partial<ActorSpec> = {}): ActorSpec[] => Array.from({ length: 30 }, (_, k) => ({ who: pupil(k), at: pos7C(k), facing: "camera" as const, ...MANNER[(k * 7) % MANNER.length], ...extra }));
/** Carol: a step behind and outside the end of the right-hand file, facing the school */
const CAROL_AT: V3 = [1.45, 0, 10.15];
const carol = (extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "carol", at: CAROL_AT, act: "neutral", back: true, ...extra });
const tag = (n: string, p: V3, y = 1.5, scale = 1) => ({ id: "countTag", variant: n, at: [p[0], y, p[2]] as V3, scale, steps: [{ t: -0.7 }] });

const cast: Record<string, string | { extra: number; era: "pupil" }> = { okoye: "okoye", carol: "carol", leo: "leo" };
for (let k = 0; k < 30; k++) if (k !== LEO_K) cast[`p${k}`] = { extra: k, era: "pupil" };

// every camera is composed for the 16:9 band (the middle third of the 9:16 frame): a wide vertical fov gives the band
// its horizontal field (tan(h/2) = tan(fov/2) * 9/16)
const setups = (light: "day" | "golden", k: string): ShotSpec[] => {
  const L = { set: "ashfordField", light };
  return [
    // A "the line": the whole class facing us in navy, Carol a step apart at the far end, back turned, a 31 over her
    { ...L, dur: 0.6, camera: at([4.6, 1.45, 21.6], [1.0, 1.0, 12.4], 50),
      actors: [...class7C(), carol()], props: [tag("31", CAROL_AT, 1.5, 1.6)], note: `A the line ${k}` },
    // B "the count": over Ms Okoye's shoulder, clipboard up, pointing down the line at Carol
    { ...L, dur: 0.6, camera: at([3.35, 1.6, 18.7], [1.3, 1.15, 11.0], 58),
      actors: [{ who: "okoye", at: [2.15, 0, 15.2], act: "confused", facing: "toward:carol", hold: "clipboard", gesture: "point" }, ...class7C().filter((a) => (a.at as V3)[0] > 0.5), carol()],
      props: [tag("31", CAROL_AT, 1.5, 1.6)], note: `B the count ${k}` },
    // C "the only one facing you": from the school side, the class's backs, and Carol turned toward the camera
    { ...L, dur: 0.6, camera: at([2.05, 1.05, 6.2], [1.1, 1.3, 14.0], 60),
      actors: [...class7C({ back: true, facing: undefined }), carol({ back: false, facing: "camera" })], props: [], note: `C facing you ${k}` },
    // D "the register": ON REGISTER 30, COUNTED 31 on the left, the line and Carol behind it
    { ...L, dur: 0.6, camera: at([3.0, 1.42, 16.4], [1.4, 1.15, 10.6], 62),
      actors: [...class7C().filter((a) => (a.at as V3)[0] > 0.5 && (a.at as V3)[2] < 15), carol()],
      props: [{ id: "clipboardCard", variant: "31", at: [2.39, 1.25, 14.89] as V3, yaw: 15 }], note: `D the register ${k}` },
    // E "the formation": a high three-quarter view of the three files and the 29-30-31 tags, Carol the odd one out
    { ...L, dur: 0.6, camera: at([5.5, 6.5, 17.0], [0.6, 0.4, 12.8], 64),
      actors: [...class7C(), carol()], props: [tag("29", pos7C(28)), tag("30", pos7C(29)), tag("31", CAROL_AT, 1.5, 1.6)], note: `E the formation ${k}` },
  ];
};
// the light that suits each idea: daylight (the film's drill) for A, B, D, E; the golden sunset behind Carol for C
const day = setups("day", "day"), gold = setups("golden", "golden");
const shots: ShotSpec[] = [day[0], day[1], gold[2], day[3], day[4]];

export const ONE_TOO_MANY_THUMBS: Storyboard = {
  id: "one-too-many-thumbs", title: "One Too Many (thumbnails)",
  cast, music: false, captions: false, engine: 3, autoSfx: false,
  shots,
};
