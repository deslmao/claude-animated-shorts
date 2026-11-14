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
  phonk: "drift-phonk comedy energy (pitched cowbell lead, 808 slides, hats with rolls, claps), 130 bpm minor",
  rest: "near-silence for a held comedy beat (a barely audible sub drone)",
  // Video 08 "Float Away": the Pancake Theme story set (sound/music.py THEME)
  quirky: "playful, quirky world-building (pizzicato bounce, marimba stabs, finger-snap claps, glockenspiel), 112 bpm major",
  quirkyFull: "quirky, fuller for the gags (adds a soft snare backbeat and hats), 112 bpm major",
  pancake: "the Pancake Theme: a fixed whistleable motif on marimba + whistle over pizzicato and brushes, 104 bpm major",
  drift: "fading away: the Pancake Theme in minor, fragments on vibes over a soft pad, 76 bpm",
  hush: "subtle tension under dialogue: a slow piano heartbeat and one held low string chord, 60 bpm minor",
  storm: "urgent: sixteenth-note low strings, toms, timpani, 132 bpm minor",
  stormPulse: "the storm stripped back to its sixteenth-note pulse alone, 132 bpm minor",
  silence: "true silence: no music and no drone (the previous section's tail is cut)",
  rise1: "the uplifting build, layer 1: a lone piano ostinato, 120 bpm major",
  rise2: "the build, layer 2: piano ostinato + pizzicato bass + claps, 120 bpm major",
  rise3: "the build, layer 3: + strings, soft kick, hats, 120 bpm major",
  rise4: "the build's peak: + the Pancake Theme on brass, 120 bpm major (uplifting, not epic)",
  warmTheme: "tender ending: the Pancake Theme on piano with warm strings, 88 bpm major",
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
  amb_storm: "a storm at night: steady rain, gusting wind, distant thunder rolls",
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
  giggle: "a short burst of giggles (someone tickled)", feather_swish: "a feather brushing skin (soft, airy)", servo: "small robot servo whirr", stumble: "shoe scuffs + light thump (a stumble)",
  crowd_aye: "a crew's ragged chorus of \"aye!\" + a short cheer (a vote)", crowd_murmur: "a crew murmuring at a meeting (3 s)", quill_scratch: "a quill scratching on parchment (signing)", coins_pour: "coins poured into a hand (a share, a payout)",
  engine: "an early motor car putter-putter (1.8 s)", honk: "a rubber bulb horn: two honks", backfire: "a car backfire bang + clank + steam hiss (a breakdown)", bark: "a farm dog: two woofs", crack_egg: "an egg cracked on a rim",
  knock_heavy: "ONE slow, heavy knock on an old wooden door (cue once per knock)", phone_buzz: "a phone vibrating: two short buzzes", phone_tap: "soft phone-screen typing taps (1.4 s)", latch_click: "a door latch releasing: metallic click + bolt thunk", glass_crack: "picture-frame glass cracking under a foot: sharp crack + faint tinkle (no shatter)", lie_slam: "a LIE sign slamming in: neon buzz + heavy stamp + deep boom", crickets: "awkward-silence crickets (1.6 s)", thunk: "attention lands (Float Away): a heavy, soft low thud", float_whoosh: "attention leaves (Float Away): a soft rising air sound", trombone_slide: "comedy: a descending wah-wah trombone", tuba_sink: "comedy: a low tuba glide down", pop_gliss: "comedy: a quick rising slide-whistle pop", metal_groan: "a steel bench bending: a scraping metallic groan", splat: "a pancake hitting the ceiling: a wet slap", ringtone: "a cheerful phone ringtone (1.6 s)", musicbox_note: "one music-box note (the Pancake Theme's first note), ringing 3 s", riser: "a build-up riser (1.6 s)", storm_wind: "a storm gust through a door: wind + rain spray (2.5 s)", ground_crack: "hitting the road: deep boom + asphalt crack + gravel", fire_bell: "a school fire-alarm bell ringing (3 s): hammer on a steel gong, bright and relentless", kids_chatter: "a crowd of 11-year-olds talking at once outside (3 s)", chair_scrape: "a classroom chair shoved back across tiles (0.45 s)", camera_shutter: "a phone camera shutter: soft double click (0.3 s)", fire_roar: "a building fire close by (3 s): low roar, crackles and pops", cough: "a child coughing in smoke: three dry coughs (1 s)",
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
  set === "city" ? "step_hard" : set === "oldtown" ? "step_stone" : set === "nature" ? "step_grass" : THEMES.find((t) => t.steps?.[set])?.steps?.[set] ?? "step_floor";

/** the sound an effect mark makes (null = silent: music notes are already music) */
export const FX_SOUND: Record<FxKind, SfxName | null> = {
  question: "blip_up", exclaim: "pop", sweat: "drip", anger: "steam", idea: "ding", hearts: "twinkle", zzz: "snore_soft",
  speed: "whoosh_short", puff: "poof", stars: "twinkle", burst: "impact", confetti: "party_pop", sparkle: "twinkle", notes: null,
  splash: "splash", ring: "ring_ding", thought: "blip_up", thoughtPop: "pop",
};
