// The storyboard format (stage 1E): a whole short as plain, JSON-compatible data. Claude (or a future script) writes a
// storyboard; story/compile.ts turns it into a film with the studio library. Times are in seconds.
import type { Act, Expr, Gesture, Mode } from "../characters/figure";
import type { LightName } from "../scene/environment";
import type { ShotSize } from "../camera/framing";
import type { FxKind } from "../fx/effects";
import type { DiagramKind } from "../fx/diagrams";
import type { Era } from "../characters/cast";
import type { Mood, Ambience, SfxName } from "../sound/catalog";
import type { CrowdSpec } from "./crowd";

export type V3 = [number, number, number];
/** a cast member: a lead from the library ("milo", "juno", "junoOut", "gus") or a crowd extra */
export type CastRef = string | { extra: number; era?: Era };
/** where: a set's named mark ("a", "sofa", "kerb"...), or explicit [x, floorY, z] */
export type Where = string | V3;

/** a camera beat inside a shot, on a word: a new framing. Default: a hard cut. glide = seconds to move there from the
 *  previous framing; whip = a 6-frame whip pan; rack = only the focus moves; fly = part of one continuous flight: the
 *  camera travels without stopping from the previous framing through every consecutive fly beat, ARRIVING at each on
 *  its word (a reveal, a fly-over, a pull-back) */
/** blockOk: scenery deliberately fills part of the frame on this beat (a wall edge splitting the picture in two): the
 *  camera clearance check (story/clearance.ts) doesn't report the line of sight as blocked */
/** swoop: a fast eased move to this framing (seconds, default 0.33): most of the travel early, a slight overshoot and
 *  a sideways arc, landing sharp: for rushing into a macro insert on the word that names the object, and out again */
export type CameraBeat = CameraSpec & When & { cut?: boolean; glide?: number; whip?: boolean; rack?: boolean; fly?: boolean; blockOk?: boolean; swoop?: number | true };
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
  | { move: "dutch"; on: string[]; size?: ShotSize; from?: number; roll?: number }
  | { move: "follow"; on: string; size?: ShotSize; from?: number; height?: number }           // tracks a walking / running actor
  /** a detail: a prop ("treasureChest"), an actor's face / hands / held item ("qm.hands", "milo.face", "gus.held"),
   *  filling most of the frame; size close (default) or extreme */
  | { move: "insert"; on: string; size?: ShotSize | "macro"; from?: number; height?: number; push?: number }
  /** a point of view: from an actor's eyes toward another actor, a prop or a part ("milo.hands") */
  | { move: "pov"; from: string; at: string }
  /** an authored camera position in set coordinates: the start or a waypoint of a flight (an aerial over the set) */
  | { move: "at"; pos: V3; look: V3; fov?: number };

/** when something happens: t seconds after the shot starts, or on a spoken word of this shot's lines
 *  (word: "catches" lands 2 frames before that word; "yawn" also matches "yawning"; n = which occurrence, from 1) */
export type When = { t: number; word?: undefined } | { word: string; n?: number; t?: undefined };
export type WordRef = { word: string; n?: number };
/** a change during the shot (expression swaps hide behind an automatic blink) */
/** look: an eye glance without a gesture (Video 04: a sideways glance before a lie is a joke with no words); it holds
 *  until the next glance, "camera" looks back */
export type Glance = "left" | "right" | "up" | "down" | "camera";
export type Beat = When & { act?: Act; face?: Expr; gesture?: Gesture; /** pick up / swap an item; null = put it away */ hold?: string | null; look?: Glance };
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
  hold?: string;              // a hand-held item (characters/items.ts), e.g. "map", "book", "telescope"
  beats?: Beat[];
  talk?: [number, number][];  // speaking spans without audio (mouth + talking hands); voiced lines set this themselves
  nod?: (number | WordRef)[];  // nod start times (or words)
  shake?: (number | WordRef)[]; // head-shake start times (or words)
  idle?: number;              // idle life amount (default 1, 0 = still)
  /** walk (or run) in profile from `at` to `to`, between t0 and t1 seconds (or from / until spoken words) */
  walk?: { to: Where; t0: number; t1: number; mode?: "walk" | "run"; from?: WordRef; until?: WordRef };
  /** the "tickle" gesture reaches for this actor: the hands land on their flank, wherever they stand */
  reach?: string;
  /** timed body motion on top of the acting: squirm (wriggling with laughter), stagger (nearly falls over, away from
   *  `away` or to `dir`), hop (a little jump), recoil (pulls back). dur in seconds */
  moves?: Move[];
  /** the "operate" gesture's control hand strokes at hz from the given moment (a robot can follow it: PropSpec.drive) */
  drive?: When & { hz?: number };
  /** set by the engine, not written by hand: a crowd extra (shot `crowd`) */
  crowd?: boolean;
  /** set by the narration timing (story/timing.ts), not written by hand: this actor's spoken words, seconds into the shot */
  speech?: { w: string; t0: number; t1: number }[];
};
/** place: "side" (beside the presenter, default) or "above" (over their head: the 9:16 frame stacks the diagram on top
 *  and the presenter below, so both read on a phone) */
export type DiagramSpec = { kind: DiagramKind; with: string; side?: -1 | 1; size?: number; place?: "side" | "above"; steps?: When[];
  /** set by the engine (story/timing.ts), not written by hand: for place "above", the panel's lower edge height in
   *  metres: 0.14 m over the presenter's crown (1.94 m for Juno), so a short presenter isn't left far below it */
  base?: number };
export type MoveKind = "squirm" | "stagger" | "hop" | "recoil";
export type Move = When & { kind: MoveKind; dur?: number; away?: string; dir?: -1 | 1; amount?: number };
export type FxSpec = When & { kind: FxKind; on: string; life?: number; side?: -1 | 1 };
/** a story prop. Animated props (a registry entry with a rig, e.g. robotArm) can reach for an actor's open hand
 *  (follow) and replay an actor's control strokes (drive), late by `delay` seconds, changed at moments */
export type PropSpec = { id: string; at: Where; yaw?: number; scale?: number; variant?: string; offset?: [number, number];
  follow?: { who: string };
  /** a stepped prop (a registry entry with `steps`, e.g. lootPiles): each step plays on its word, in order */
  steps?: When[];
  drive?: { who: string; delay?: number; changes?: (When & { delay: number })[] } };
/** an explicit sound cue (automatic cues already cover effects, transitions, kicks, jumps, falls and footsteps).
 *  on = an actor (the sound is panned to where they are on screen); gain in dB on top of the kind's default level */
export type SfxSpec = When & { name: SfxName; on?: string; gain?: number };
export type ShotSpec = {
  /** seconds. With narration the shot lasts as long as its lines (+ hold); dur is then a minimum and may be left out */
  dur?: number;
  /** split shot: this shot ends ON this word of its line (a cut or transition mid-sentence); the next shot carries on
   *  with the same line and must have `cont: true` */
  until?: WordRef;
  /** this shot continues the previous shot's line (which ended with `until`): no new narration, its word anchors are
   *  the rest of that line, and it may be another set (an environment transition mid-sentence) */
  cont?: boolean;
  /** camera beats after the opening `camera`: on words (or seconds), each a new set-up. cut (default) = a hard cut;
   *  glide = a move from the previous framing over `dur` seconds; whip = a fast 0.2 s pan; rack = only the focus
   *  moves (to the new subject) */
  cams?: CameraBeat[];
  /** what is said over this shot (lines follow on from the previous shot's without dead air) */
  say?: string | Line | (string | Line)[];
  /** seconds held after this shot's last word (default 0.2; 0.45 on the last shot) */
  hold?: number;
  set: string;
  light?: LightName;          // default: the set's first light
  camera: CameraSpec;
  transition?: "cut" | "fade" | "flash" | "dip" | "zoom" | "whip"; // into this shot (zoom: through the outgoing subject into this shot; whip: a fast pan)
  actors: ActorSpec[];
  fx?: FxSpec[];
  kicks?: (number | WordRef)[]; // impact shakes (seconds into the shot, or on a word)
  /** music mood from this shot on (starts a new music section, crossfaded) */
  mood?: Mood;
  /** ambience bed for this shot (default: from the set and light); false = none */
  ambience?: Ambience | false;
  /** extra sound cues */
  sfx?: SfxSpec[];
  /** story props in this shot (see props/registry.ts): at a mark or [x, y, z]; yaw in degrees; scale; variant name;
   *  offset [dx, dz] metres from the mark */
  props?: PropSpec[];
  /** an explainer diagram (fx/diagrams.ts) beside the presenter `with`, on their screen side `side` (default: right):
   *  steps land on words. Name "diagram" in the camera's `on` list to frame it with the presenter */
  diagram?: DiagramSpec;
  /** background extras on clear floor behind the cast: { count, era?, around?, radius?, acts?, seed? } */
  crowd?: CrowdSpec;
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
  /** testing only: false switches gesture easing off (the validator then reports the arm snaps) */
  ease?: boolean;
  /** background music: a mood, { mood, gain } (dB), or false for none. Default: chosen from the story's acting */
  music?: Mood | { mood: Mood; gain?: number } | false;
  /** automatic sound effects for effects marks, transitions, kicks, jumps, falls and footsteps (default true) */
  autoSfx?: boolean;
  /** camera motion blur on fast moves (flights, whips, zoom-throughs): true = a 180-degree shutter, or the exposure in
   *  frames. Slow creeps stay sharp. Default off */
  motionBlur?: boolean | number;
  /** controlled motion blur (2.0 blur correction, needs motionBlur): heavy smear only on the frames a whip or
   *  zoom-through actually rushes (5 out, 4 in) and then a ramp down, so a move lands sharp; lighter blur on framed
   *  glides, inserts and faces; whatever sits at the focus distance (the subject) smears far less than the background;
   *  a centre-weighted, shorter smear. Default off: films approved before it render exactly as they were */
  controlledBlur?: boolean;
  /** render engine generation. 2 = Visual Storytelling 2.0 render behaviours: card canvases that draw identically
   *  whatever the render worker drew before (exact chunk seams on fast camera flights). Default 1: storyboards made
   *  before 2.0 render exactly as they were approved. 3 = engine 2 plus the Video 03 render corrections: the outline
   *  buffer draws only the faces the picture draws (no phantom lines when a camera grazes or enters geometry) */
  engine?: 1 | 2 | 3;
};
