// Sound catalogue (stage 3B): every music mood, ambience bed and sound effect the studio can use, by name, with what
// it is for. The storyboard validator checks names against this; sound/library.py + sound/music.py implement them
// (`npm run test:sound` proves the two lists match and every sound renders). Also the automatic choices: which bed
// a set + light gets, which sound an effect mark / transition / footstep makes.
import type { FxKind } from "../fx/effects";
import { THEMES } from "../themes";

export const MOODS = {
  curious: "light, inquisitive explainer bed (vibes arpeggios, plucked bass, brushes), 100 bpm major: the default",
  playful: "bouncy comedy (staccato bass, off-beat plucks, glockenspiel tune, soft backbeat), 116 bpm major",
  mystery: "slow, dark and sparse (minor pad, lonely vibes), 84 bpm minor: secrets, night, the unknown",
  warm: "tender and kind (pad + music box), 88 bpm major: heart-warming facts, endings",
  tense: "building tension (pulsing minor eighths, soft timpani), 104 bpm minor: danger, countdowns",
  adventure: "history, journeys, pirates (brass chords, march snare, fife tune), 120 bpm major",
} as const;
export type Mood = keyof typeof MOODS;

export const AMBIENCES = {
  amb_city_day: "street: traffic rumble, passing cars, sparrows, breeze",
  amb_city_night: "street at night: lighter traffic, crickets",
  amb_square: "old town square: distant crowd murmur, birds, breeze",
  amb_square_night: "old town at night: crickets, breeze",
  amb_nature_day: "countryside: birds (sparrows + blackbird), breeze",
  amb_nature_night: "countryside at night: crickets, soft breeze",
  amb_room: "quiet room tone (home, classroom)",
  amb_office: "office: room tone + ventilation",
  amb_lab: "laboratory: room tone, mains hum, bubbling",
  amb_sea: "open sea: slow waves, wind, distant gulls (ships, beaches, pirates)",
} as const;
export type Ambience = keyof typeof AMBIENCES;

export const SFX = {
  pop: "short bubbly pop (exclaim, reveal)", ding: "small bright bell (idea)", blip_up: "rising blip (question)",
  boing: "spring boing (jump, bounce)", poof: "dust poof (puff)", twinkle: "three quick bell notes (sparkle, hearts, stars)",
  impact: "punchy low thump (camera kick, landing)", thud: "body falling on the floor", party_pop: "party popper + sparkle (confetti)",
  drip: "water drop (sweat)", steam: "angry steam hiss (anger)", snore_soft: "gentle snore (zzz)", ring_ding: "double ring (ring)",
  sting_low: "low timpani sting (dramatic reveal)", swish_soft: "soft swish (crossfade)", whoosh_short: "quick whoosh (punch-in, speed)",
  whoosh_long: "long swoop (crane)", whoosh_low: "low whoosh (dip to black)", flash_swish: "bright swish + shimmer (white flash)",
  step_hard: "footstep on pavement", step_stone: "footstep on cobbles", step_floor: "footstep on an indoor floor", step_grass: "footstep on grass / dirt",
  knock: "three knocks on a door", clock_tick: "one clock tick", cash: "cash register ding", gasp: "crowd gasp", oof: "pained oof",
  applause: "applause", creak: "wood creak", crack: "wood cracking", splash: "big splash", bubbles: "bubbling", clink: "metal / glass clink",
  hammer: "hammer blow", cannon: "distant cannon boom", bell_ring: "ship / church bell", wave_crash: "a wave breaking",
} as const;
export type SfxName = keyof typeof SFX;

/** the ambience bed a set gets in a light (a shot can override with `ambience`) */
export const ambienceFor = (set: string, light: string): Ambience | null => {
  const night = light === "night";
  switch (set) {
    case "city": return night ? "amb_city_night" : "amb_city_day";
    case "oldtown": return night ? "amb_square_night" : "amb_square";
    case "nature": return night ? "amb_nature_night" : "amb_nature_day";
    case "lab": return "amb_lab";
    case "office": return "amb_office";
    case "home": case "classroom": return "amb_room";
    default: { // a themed set: the theme's own bed (night variant first)
      for (const t of THEMES) { const m = t.ambience; if (m && (m[`${set}:${light}`] || m[set])) return m[`${set}:${light}`] ?? m[set]; }
      return null;
    }
  }
};

/** footstep surface per set */
export const stepFor = (set: string): SfxName =>
  set === "city" ? "step_hard" : set === "oldtown" ? "step_stone" : set === "nature" ? "step_grass" : "step_floor";

/** the sound an effect mark makes (null = silent: music notes are already music) */
export const FX_SOUND: Record<FxKind, SfxName | null> = {
  question: "blip_up", exclaim: "pop", sweat: "drip", anger: "steam", idea: "ding", hearts: "twinkle", zzz: "snore_soft",
  speed: "whoosh_short", puff: "poof", stars: "twinkle", burst: "impact", confetti: "party_pop", sparkle: "twinkle", notes: null,
  splash: "splash", ring: "ring_ding",
};
