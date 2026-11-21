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
  tender: "the reveal and the ending (4,012 Steps): a slow piano lullaby under warm strings, 70 bpm major",
  emily: "Emily's theme (The Empty Seat): a fixed music-box lullaby in minor over a soft dark pad, 66 bpm: eerie, a child's ghost",
  emilyDread: "Emily's theme in fragments on a music box over low strings and a slow piano heartbeat, 60 bpm minor: dread",
  emilyTender: "Emily's theme resolved: the lullaby on piano in major over warm strings, 66 bpm: the ending",
  drone: "dread: a sub drone under one held low string chord, no tune, no pulse, 60 bpm minor",
  build: "a build: pulsing low strings, strings and timpani swelling from quiet to full over the section, 120 bpm minor",
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
  amb_bus: "inside a school bus on the move, quiet: a diesel rumble, road noise, loose panels rattling",
  amb_bus_kids: "inside a school bus full of kids: the bus bed with overlapping children's chatter",
  amb_snow: "a snowstorm: a cold, howling wind and the hiss of blown snow",
  // recorded-style beds (ElevenLabs Sound Effects, seamless loops, sound/samples/)
  elb_river_rain: "recorded loop: Dark river at night with steady heavy rain falling on the water, strong current flowing, distant wind, immersive, no thunder",
  elb_in_river: "recorded loop: Standing waist deep in a fast river at night, water rushing and swirling close around you, heavy rain hitting the water surface all around",
  elb_rain_window: "recorded loop: Heavy rain on a bedroom window at night heard from inside, muffled, gentle wind, quiet house, cozy but tense",
  elb_house_night: "recorded loop: A silent house at three in the morning, faint low fridge hum downstairs, very quiet room tone, the house settling, subtle",
  elb_dawn_garden: "recorded loop: An English back garden at dawn just after rain, water dripping from leaves and gutters, a few distant birds, a river flowing gently in the distance, s",
  elb_kitchen_day: "recorded loop: A quiet family kitchen on a grey morning, faint fridge hum, a clock ticking softly, light rain outside the window, subdued",
  elb_neon_city: "recorded loop: A dense futuristic cyberpunk city at night in heavy rain: rain on metal and puddles, a low electric hum of neon signs, distant hover traffic, crowd mu",
  elb_roof_night: "recorded loop: A high rooftop at night above a huge futuristic city: wind, distant city hum far below, soft rain, a faint drone flying past",
  elb_flat_rain: "recorded loop: A tiny apartment in a futuristic city at night: rain on the window, a fridge hum, muffled neon buzz and traffic outside",
  elb_classroom: "recorded loop: A quiet high school classroom during a lesson: pens scratching, a chair creaking, a pupil coughing, a teacher talking far away, rain outside the window",
  elb_market: "recorded loop: A busy indoor futuristic market at night: a murmuring crowd, soft electronic beeps, glass clinking, a low neon hum, rain outside",
  elb_vault: "recorded loop: A high-tech corporate vault interior: a cold low electrical hum, servers whirring softly, very quiet and sterile",
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
  knock_heavy: "ONE slow, heavy knock on an old wooden door (cue once per knock)", phone_buzz: "a phone vibrating: two short buzzes", phone_tap: "soft phone-screen typing taps (1.4 s)", latch_click: "a door latch releasing: metallic click + bolt thunk", glass_crack: "picture-frame glass cracking under a foot: sharp crack + faint tinkle (no shatter)", lie_slam: "a LIE sign slamming in: neon buzz + heavy stamp + deep boom", crickets: "awkward-silence crickets (1.6 s)", thunk: "attention lands (Float Away): a heavy, soft low thud", float_whoosh: "attention leaves (Float Away): a soft rising air sound", trombone_slide: "comedy: a descending wah-wah trombone", tuba_sink: "comedy: a low tuba glide down", pop_gliss: "comedy: a quick rising slide-whistle pop", metal_groan: "a steel bench bending: a scraping metallic groan", splat: "a pancake hitting the ceiling: a wet slap", ringtone: "a cheerful phone ringtone (1.6 s)", musicbox_note: "one music-box note (the Pancake Theme's first note), ringing 3 s", riser: "a build-up riser (1.6 s)", storm_wind: "a storm gust through a door: wind + rain spray (2.5 s)", ground_crack: "hitting the road: deep boom + asphalt crack + gravel", fire_bell: "a school fire-alarm bell ringing (3 s): hammer on a steel gong, bright and relentless", kids_chatter: "a crowd of 11-year-olds talking at once outside (3 s)", chair_scrape: "a classroom chair shoved back across tiles (0.45 s)", camera_shutter: "a phone camera shutter: soft double click (0.3 s)", fire_roar: "a building fire close by (3 s): low roar, crackles and pops", cough: "a child coughing in smoke: three dry coughs (1 s)", whale_groan: "a sleeping whale stirring: a deep slow moan felt through stone (3.5 s)", whale_breath: "a whale's breath through its blowhole: a big hollow exhale (2.2 s)", whale_blow: "a waking whale's great breath: a deep boom and a roaring blast of air and spray (3.5 s)", baby_cry: "a baby starting to cry: two rising wails (1.5 s)", crowd_cheer: "a whole crowd cheering: hurrahs, laughter, clapping (3 s)", water_pour: "sea water pouring over a quay and running in the street (3 s)", founders_bell: "a great bronze ship's bell: one heavy, deep, ringing stroke (4 s)", msg_chime: "a text message arriving: a soft two-note chime over a short phone vibration (0.9 s)", car_skid: "a car braking hard into an impact: screeching tyres, then a heavy thump (1.4 s)", car_rev: "a car pulling away fast: an engine revving up and fading down the road (2.2 s)",
  claw_ticks: "small dog claws on wooden floorboards: an unhurried four-paw walk (1.6 s)", dog_breath: "a dog's warm breath on a hand: two sniffs and a soft huff (0.9 s)", dog_sigh: "a dog settling at the foot of a bed: the mattress gives, then a long contented sigh (1.6 s)", tag_jingle: "a dog collar's metal name tag jingling against its ring (0.7 s)", heartbeat: "one low heartbeat, lub-dub (0.9 s)",
  bus_doors: "school-bus folding doors: a pneumatic hiss, the leaves folding with a clunk, a rubber thump (0.9 s)", air_brake: "a bus's air brakes as it stops: a sharp pssht and a low thunk (0.9 s)", bus_pullaway: "a diesel bus pulling away through first gear (2.4 s)", glass_slap: "a small hand slapping a window from outside: a flat slap, a brief glass ring (0.5 s)", indicator: "a vehicle's indicator ticking, four ticks (1.6 s)", monitor_beep: "a hospital heart monitor's beep: one clean electronic tone (0.3 s)", monitor_flat: "a heart monitor flatlining: one long tone, slowly fading (3 s)", radio_squelch: "a two-way radio keying up: a burst of static and a short squelch tone (0.6 s)", breath_fast: "a scared child breathing fast, in and out (1.6 s)",
  // recorded-style samples (ElevenLabs Sound Effects, sound/samples/): What Ollie Says Part 2 onward
  el_lock_click: "recorded: A single old interior bedroom door lock bolt turning slowly and clicking open, quiet house at night, close and crisp, slight hallway reverb (2 s)",
  el_handle_strain: "recorded: Someone on the other side of a door gently pressing down a metal door handle, the handle creaks and strains against a hand holding it shut, close, qui (2.5 s)",
  el_feet_landing: "recorded: Slow soft bare footsteps on a carpeted upstairs landing at night, approaching and stopping right outside a door, floorboard creak under carpet (4 s)",
  el_stairs_down: "recorded: Slow bare footsteps going down creaky old wooden stairs at night, heard from upstairs through a door, quiet house (5 s)",
  el_backdoor: "recorded: A back door downstairs unlocking and swinging open, banging against the wall, wind and rain rushing in, heard from upstairs (2.5 s)",
  el_wade_slow: "recorded: A person wading slowly through waist deep river water at night, water swirling around legs, steady steps, rain on the water surface (6 s)",
  el_run_into_water: "recorded: Running barefoot across wet grass and splashing hard into a river, big splashes, urgent, night (4 s)",
  el_pulled_under: "recorded: A child being suddenly pulled into a fast river, a sharp heavy splash and rushing water, then a hand grabbing him and lifting out, water pouring off (3 s)",
  el_gasp_out: "recorded: A young child gasping and coughing after being pulled out of cold water, close (2 s)",
  el_sit_up: "recorded: Bed sheets and duvet rustling as a small child suddenly sits bolt upright in bed, quiet bedroom at night (1.5 s)",
  el_clock_tick: "recorded: A bedside alarm clock ticking loudly in a silent bedroom at night, three ticks, close (3 s)",
  el_clock_flip: "recorded: A digital bedside clock changing number with a single soft electronic click, silent room (1 s)",
  el_phone_video: "recorded: Video playing through a small phone speaker: rain and rushing flood water, tinny and compressed, quiet kitchen (5 s)",
  el_phone_grass: "recorded: Picking up a wet phone from wet grass, a damp rustle and a small tap on the screen (1.5 s)",
  el_mug_down: "recorded: A ceramic mug of tea placed down on a wooden fence post, a soft knock, morning outdoors (1 s)",
  el_heartbeat: "recorded: Slow heavy human heartbeat, muffled and deep, horror tension, felt in the chest, steady (6 s)",
  el_heartbeat_fast: "recorded: Fast pounding human heartbeat, muffled and deep, panic, horror film (5 s)",
  el_breath_hold: "recorded: A scared teenage girl trying to breathe silently in the dark, shaky held breath, trembling exhale, very close (4 s)",
  el_whisper_air: "recorded: Eerie faint breathy air through a gap under a door at night, a cold draught, ghostly but subtle (3 s)",
  el_riser_short: "recorded: Horror movie tension riser, dissonant strings and reversed cymbal rising for three seconds into a cut, cinematic (3 s)",
  el_riser_long: "recorded: Slow horror tension riser building for eight seconds, low strings, dark synth swell and heartbeat pulse rising, cinematic (8 s)",
  el_hit_boom: "recorded: Deep cinematic horror impact boom with long dark reverb tail, trailer hit (3 s)",
  el_hit_sub: "recorded: Cinematic sub bass drop, deep low frequency boom falling away, horror trailer (3 s)",
  el_sting_strings: "recorded: Sudden horror string stinger, screeching dissonant violins, jump scare, short (2.5 s)",
  el_whoosh_dark: "recorded: Dark cinematic whoosh transition, low and airy, horror (1.5 s)",
  el_typewriter: "recorded: Old typewriter typing a short phrase, crisp key strikes, quiet room, no bell (2 s)",
  el_thunder: "recorded: Distant thunder rolling slowly across the sky at night, deep rumble, rain (6 s)",
  el_child_steps_wet: "recorded: Small bare child footsteps walking slowly on wet grass and mud at night, squelching (3 s)",
  el_door_creak: "recorded: A wooden bedroom door creaking slowly open in a silent house at night (2.5 s)",
  el_water_rush: "recorded: A sudden strong river current surging and rushing, water pulling hard, menacing, night (4 s)",
  el_underwater: "recorded: Muffled underwater sound, bubbles and a dull current, as if heard with your head under the water (3 s)",
  el_drip_quiet: "recorded: Single water drips falling from a gutter onto a wet patio in a quiet dawn garden (3 s)",
  el_time_stop: "recorded: Sci-fi time freeze effect: a deep sub-bass whoomp that sucks all sound away, a reversed shimmer, then dead silence with a faint high ring (2.5 s)",
  el_time_resume: "recorded: Sci-fi time resuming: a sharp rush of air and sound slamming back in, a deep whoosh, rain and city noise returning all at once (2.0 s)",
  el_gunshot: "recorded: A single pistol gunshot in a rainy city street at night, sharp crack with an echo off tall buildings (2.0 s)",
  el_bullet_wall: "recorded: A bullet hitting a concrete wall, a sharp crack and chips of concrete falling (1.2 s)",
  el_implant: "recorded: A cybernetic implant being installed: an electric whine powering up, a sharp click and crackling sparks, then a soft digital beep (3.0 s)",
  el_counter_tick: "recorded: A single soft digital counter tick, a low electronic blip, futuristic interface (1.0 s)",
  el_alarm: "recorded: A high-tech security alarm blaring in a vault, pulsing electronic siren, urgent (4.0 s)",
  el_door_blast: "recorded: Heavy metal security doors blasting open, a pneumatic hiss and a slam, armoured boots rushing in (2.5 s)",
  el_gun_cock: "recorded: A futuristic pistol being cocked and aimed, a sharp mechanical click and a rising electronic charge whine (1.0 s)",
  el_van_door: "recorded: A van sliding door slammed shut in the rain, a heavy metallic thud (1.5 s)",
  el_hacking: "recorded: Fast futuristic hacking sounds: rapid soft keyboard taps and digital interface beeps and chirps (3.0 s)",
  el_heart_slow: "recorded: A single human heartbeat slowing down in silence, deep and muffled, each beat further apart (6.0 s)",
  el_neon_buzz: "recorded: A flickering neon sign buzzing and crackling in the rain, close (3.0 s)",
  el_door_shut: "recorded: A front door of a small apartment closing gently, a soft latch click (1.5 s)",
  el_slide_down: "recorded: A back sliding slowly down a wooden door to sit on the floor: fabric on wood, a soft thump (2.0 s)",
  el_memory_drain: "recorded: A memory pulled out of a mind: a glassy hum rising and sucked into a bottle, a soft chime (2.5 s)",
  el_vial_chime: "recorded: A small glass vial set down on a steel counter: a delicate chime (1.5 s)",
  el_humming: "recorded: A teenage girl softly humming a gentle made-up lullaby, no words (6 s)",
  el_cough: "recorded: A sick teenage girl coughing weakly twice (2 s)",
  el_memory_flood: "recorded: Memories flooding back: a warm swelling shimmer of chimes and light (3.5 s)",
  el_sizzle: "recorded: Pancake batter sizzling gently in a hot frying pan, close, a cosy morning (6 s)",
  el_pancake_flip: "recorded: A pancake flipped in a pan: a soft whoosh and a sizzling slap as it lands (1.2 s)",
  el_phone_buzz_table: "recorded: A phone vibrating twice on a wooden kitchen table, loud in a quiet room (1.5 s)",
  el_plate_down: "recorded: A plate of food set down on a wooden table and slid forward (1.2 s)",
  el_knock_front: "recorded: Three hard knocks on a front door, heard from inside down a hallway (3 s)",
  el_door_pound: "recorded: Fists pounding frantically on a front door, heard from inside, the door rattling (4 s)",
  el_mum_humming: "recorded: A woman softly humming a cheerful tune to herself while cooking, no words (6 s)",
  el_siren_far: "recorded: Distant police and ambulance sirens echoing through a rainy futuristic city at night (5.0 s)",
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
