// VISUAL TEST ONLY (Episode 2, Phase A gate): the six contact-sheet frames for "The Day I Stole Kevin Durant's Talent":
// street court by day, the 5 AM rain grind, the tunnel spark between Leo and KD, the viral phone and TV slump inserts, the bird's-eye three-defender swarm, and KD lifting Leo.
import type { Storyboard } from "../story/types";
import { fovMm } from "../engine4/camera";

type V = [number, number, number];
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
const at = (pos: V, look: V, mm: number, blur = 0, o: { roll?: number } = {}) => ({ move: "at" as const, pos, look, fov: fovMm(mm), blur, ...o }) as never;
const who = (w: string, p: V, keys: K, hold?: string) => ({ who: w, at: p, act: "neutral" as const, facing: "camera" as const, keys, ...(hold ? { hold } : {}) });
const court = { set: "e4Court", light: "day" as const, ambience: false as const };
const dawn = { set: "e4Court", light: "night" as const, ambience: false as const };
const arena = { set: "e4Arena", light: "interior" as const, ambience: false as const };
const tunnel = { set: "e4Arena", light: "interiorCool" as const, ambience: false as const };

export const KD_TEST: Storyboard = {
  id: "kd-test", title: "Episode 2: contact-sheet test frames",
  cast: { leo: "leoHoodie", leoJ: "leoJersey", dex: "dex", kd: "kd", coach: "coach", kidA: "kidA", kidB: "kidB", kidC: "kidC", kidD: "kidD", defA: "defA", defB: "defB", defC: "defC" },
  captions: false, music: false, engine: 4, autoSfx: false, motionBlur: true, controlledBlur: true,
  shots: [
    // 1 the street court by day: Leo, picked last, sulks in the foreground; Dex, captain, and the kids by the key; the hoop, fence and houses behind
    { ...court, dur: 1.5, camera: at([0.6, 1.8, 4.8], [-0.5, 1.1, -0.3], 24, 0), note: "1 street court, day",
      actors: [who("leo", [-0.3, 0, 2.2], [{ t: 0, expr: "sad", slump: 0.6, look: [0, -1] }]), who("dex", [0.9, 0, -0.4], [{ t: 0, expr: "grin", gesture: "crossArms", tilt: 4 }]),
        who("kidA", [-0.6, 0, -0.9], [{ t: 0, expr: "smile" }]), who("kidB", [1.9, 0, -1.2], [{ t: 0, expr: "excited" }]), who("kidC", [-2.2, 0, -1.5], [{ t: 0, expr: "neutral" }]), who("kidD", [0.2, 0, -2.4], [{ t: 0, expr: "laugh" }])] },
    // 2 5 AM in the rain: Leo alone, locked in, mid-shot under the streetlamp
    { ...dawn, dur: 1.5, camera: at([1.7, 1.15, 1.5], [-0.3, 1.0, -2.3], 35, 3), note: "2 5 AM rain grind",
      actors: [who("leo", [-0.4, 0, -1.6], [{ t: 0, expr: "determined", brow: [3, 2, 0], tilt: -3 }], "basketball")] },
    // 3 the tunnel spark: KD and Leo, the signed ball between them throwing lightning; low angle up at KD
    { ...tunnel, dur: 1.5, camera: at([-11.4, 0.45, 3.0], [-11.4, 1.2, 0.3], 20, 2), note: "3 tunnel spark",
      props: [{ id: "signedBasketball", at: [-11.4, 1.05, 0.4] as V, scale: 1.3, steps: [{ t: -1 }, { t: -0.2 }] }],
      actors: [who("kd", [-11.95, 0, -0.1], [{ t: 0, expr: "shock", tilt: -3, brow: [-2, -1, 3] }]), who("leo", [-10.85, 0, 0.9], [{ t: 0, expr: "shock", tilt: 3, brow: [-3, -2, 3] }])] },
    // 4a the viral phone insert; 4b the TV slump insert
    { ...court, dur: 1.5, camera: at([0.0, 1.1, 2.3], [0.0, 1.1, 0.3], 50, 5), note: "4a viral phone", props: [{ id: "viralPhone", at: [0, 1.1, 0.3] as V, scale: 1.45, steps: [{ t: -1 }] }], actors: [] },
    { ...dawn, dur: 1.5, camera: at([0.0, 1.2, 4.0], [0.0, 1.15, 0.0], 40, 5), note: "4b TV slump", props: [{ id: "tvNewsSlump", at: [0, 0.6, 0] as V, scale: 1.0, steps: [{ t: -1 }] }], actors: [] },
    // 5 the bird's-eye trap: KD at the top of the key, three defenders closing, Leo waiting at the elbow
    { ...arena, dur: 1.5, camera: at([0.0, 7.4, -1.7], [0.0, 0.0, -4.4], 30, 0), note: "5 bird's-eye swarm",
      actors: [who("kd", [0.0, 0, -4.3], [{ t: 0, expr: "determined", gesture: "hips" }], "basketball"), who("defA", [-1.1, 0, -4.9], [{ t: 0, expr: "angry", gesture: "spread" }]), who("defB", [1.1, 0, -4.9], [{ t: 0, expr: "angry", gesture: "spread" }]), who("defC", [0.0, 0, -3.1], [{ t: 0, expr: "angry", gesture: "spread" }]),
        who("leoJ", [2.3, 0, -3.4], [{ t: 0, expr: "nervous" }])] },
    // 6 KD lifts Leo onto his shoulders: low angle, the crowd behind
    { ...arena, dur: 1.5, camera: at([0.6, 0.4, 3.4], [0.0, 1.5, -1.2], 24, 2), note: "6 shoulder lift",
      actors: [who("kd", [0.0, 0, -1.0], [{ t: 0, expr: "laugh", gesture: "cheer" }]), { ...who("leoJ", [0.02, 1.0, -1.1], [{ t: 0, expr: "laugh", gesture: "cheer", tilt: 3 }]), mode: "sit" as never }] },
    // 7 the arena scoreboard insert (THUNDER 88 | 00:05 | OPP 89), hung over the court, seen from the floor
    { ...arena, dur: 1.5, camera: at([0.0, 1.4, 4.2], [0.0, 5.0, -3.0], 30, 0), note: "7 scoreboard", props: [{ id: "arenaScoreboard", at: [0, 4.6, -3.0] as V, scale: 1.0, steps: [{ t: -1 }] }], actors: [] },
  ],
};
