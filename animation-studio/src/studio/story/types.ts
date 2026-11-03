// The storyboard format (stage 1E): a whole short as plain, JSON-compatible data. Claude (or a future script) writes a
// storyboard; story/compile.ts turns it into a film with the studio library. Times are in seconds.
import type { Act, Expr, Gesture, Mode } from "../characters/figure";
import type { LightName } from "../scene/environment";
import type { ShotSize } from "../camera/framing";
import type { FxKind } from "../fx/effects";
import type { Era } from "../characters/cast";
import type { Mood, Ambience, SfxName } from "../sound/catalog";

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

/** when something happens: t seconds after the shot starts, or on a spoken word of this shot's lines
 *  (word: "catches" lands 2 frames before that word; "yawn" also matches "yawning"; n = which occurrence, from 1) */
export type When = { t: number; word?: undefined } | { word: string; n?: number; t?: undefined };
export type WordRef = { word: string; n?: number };
/** a change during the shot (expression swaps hide behind an automatic blink) */
export type Beat = When & { act?: Act; face?: Expr; gesture?: Gesture };
/** a spoken line. who: "narrator" (voice-over, default) or a cast key (that actor's mouth moves with the words).
 *  voice: a preset from voice/voices.ts (default: storyboard.voices[who], then storyboard.voice, then the narrator).
 *  gap: extra pause before the line, seconds */
export type Line = { text: string; who?: string; voice?: string; gap?: number };
export type ActorSpec = {
  who: string;                // key into storyboard.cast
  at: Where;
  act?: Act; face?: Expr; gesture?: Gesture; mode?: Mode;
  /** "camera", "toward:<who>", or -1 | 0 | 1. Default: toward the nearest other actor in the shot */
  facing?: "camera" | `toward:${string}` | -1 | 0 | 1;
  back?: boolean;             // seen from behind (the near actor in an over-the-shoulder)
  beats?: Beat[];
  talk?: [number, number][];  // speaking spans without audio (mouth + talking hands); voiced lines set this themselves
  nod?: (number | WordRef)[];  // nod start times (or words)
  shake?: (number | WordRef)[]; // head-shake start times (or words)
  idle?: number;              // idle life amount (default 1, 0 = still)
  walk?: { to: Where; t0: number; t1: number; mode?: "walk" | "run" }; // walk (or run) in profile from `at` to `to`
  /** set by the narration timing (story/timing.ts), not written by hand: this actor's spoken words, seconds into the shot */
  speech?: { w: string; t0: number; t1: number }[];
};
export type FxSpec = When & { kind: FxKind; on: string; life?: number; side?: -1 | 1 };
/** an explicit sound cue (automatic cues already cover effects, transitions, kicks, jumps, falls and footsteps).
 *  on = an actor (the sound is panned to where they are on screen); gain in dB on top of the kind's default level */
export type SfxSpec = When & { name: SfxName; on?: string; gain?: number };
export type ShotSpec = {
  /** seconds. With narration the shot lasts as long as its lines (+ hold); dur is then a minimum and may be left out */
  dur?: number;
  /** what is said over this shot (lines follow on from the previous shot's without dead air) */
  say?: string | Line | (string | Line)[];
  /** seconds held after this shot's last word (default 0.2; 0.45 on the last shot) */
  hold?: number;
  set: string;
  light?: LightName;          // default: the set's first light
  camera: CameraSpec;
  transition?: "cut" | "fade" | "flash" | "dip"; // into this shot
  actors: ActorSpec[];
  fx?: FxSpec[];
  kicks?: (number | WordRef)[]; // impact shakes (seconds into the shot, or on a word)
  /** music mood from this shot on (starts a new music section, crossfaded) */
  mood?: Mood;
  /** ambience bed for this shot (default: from the set and light); false = none */
  ambience?: Ambience | false;
  /** extra sound cues */
  sfx?: SfxSpec[];
  note?: string;              // what the shot is for (script line), ignored by the engine
};
export type Storyboard = {
  id: string; title?: string; cast: Record<string, CastRef>; shots: ShotSpec[];
  /** voice preset for every line (default: the channel narrator, voice/voices.ts NARRATOR) */
  voice?: string;
  /** per-speaker voice presets, e.g. { gus: "bill" } (default: `voice`) */
  voices?: Record<string, string>;
  /** word-by-word captions (default true) */
  captions?: boolean;
  /** background music: a mood, { mood, gain } (dB), or false for none. Default: chosen from the story's acting */
  music?: Mood | { mood: Mood; gain?: number } | false;
  /** automatic sound effects for effects marks, transitions, kicks, jumps, falls and footsteps (default true) */
  autoSfx?: boolean;
};
