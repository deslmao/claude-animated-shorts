// The storyboard format (stage 1E): a whole short as plain, JSON-compatible data. Claude (or a future script) writes a
// storyboard; story/compile.ts turns it into a film with the studio library. Times are in seconds.
import type { Act, Expr, Gesture, Mode } from "../characters/figure";
import type { LightName } from "../scene/environment";
import type { ShotSize } from "../camera/framing";
import type { FxKind } from "../fx/effects";
import type { Era } from "../characters/cast";

export type V3 = [number, number, number];
/** a cast member: a lead from the library ("milo", "juno", "junoOut", "gus") or a crowd extra */
export type CastRef = string | { extra: number; era?: Era };
/** where: a set's named mark ("a", "sofa", "kerb"...), or explicit [x, floorY, z] */
export type Where = string | V3;

export type CameraSpec =
  | { move: "view"; view: string }                                                                // a set's designed view by name
  | { move: "establish"; view: string }
  | { move: "frame"; on: string[]; size?: ShotSize; from?: number; height?: number; roll?: number }
  | { move: "pushIn" | "pullOut"; on: string[]; size?: ShotSize; to?: ShotSize; from?: number; height?: number }
  | { move: "closeUp"; on: string; from?: number; punch?: boolean }
  | { move: "lowHero"; on: string; from?: number }
  | { move: "highAngle"; on: string[]; from?: number }
  | { move: "overShoulder"; over: string; at: string; side?: -1 | 1 }
  | { move: "orbit"; on: string[]; fromDeg: [number, number]; size?: ShotSize; height?: number }
  | { move: "crane"; on: string[]; heights: [number, number]; size?: ShotSize; from?: number }
  | { move: "dutch"; on: string[]; size?: ShotSize; from?: number; roll?: number };

/** a change during the shot, t seconds after the shot starts (expression swaps hide behind an automatic blink) */
export type Beat = { t: number; act?: Act; face?: Expr; gesture?: Gesture };
export type ActorSpec = {
  who: string;                // key into storyboard.cast
  at: Where;
  act?: Act; face?: Expr; gesture?: Gesture; mode?: Mode;
  /** "camera", "toward:<who>", or -1 | 0 | 1. Default: toward the nearest other actor in the shot */
  facing?: "camera" | `toward:${string}` | -1 | 0 | 1;
  back?: boolean;             // seen from behind (the near actor in an over-the-shoulder)
  beats?: Beat[];
  talk?: [number, number][];  // speaking spans (mouth + talking hands)
  nod?: number[];             // nod start times
  shake?: number[];           // head-shake start times
  idle?: number;              // idle life amount (default 1, 0 = still)
  walk?: { to: Where; t0: number; t1: number }; // walk in profile from `at` to `to`
};
export type FxSpec = { kind: FxKind; on: string; t: number; life?: number; side?: -1 | 1 };
export type ShotSpec = {
  dur: number;
  set: string;
  light?: LightName;          // default: the set's first light
  camera: CameraSpec;
  transition?: "cut" | "fade" | "flash" | "dip"; // into this shot
  actors: ActorSpec[];
  fx?: FxSpec[];
  kicks?: number[];           // impact shakes (seconds into the shot)
  note?: string;              // what the shot is for (script line), ignored by the engine
};
export type Storyboard = { id: string; title?: string; cast: Record<string, CastRef>; shots: ShotSpec[] };
