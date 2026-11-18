// Narration voices (stage 2). A voice is a named preset: ElevenLabs voice + model + settings. Storyboards name presets,
// never raw IDs, so switching the channel's voice (or giving one character their own) is a one-word change; the
// narration cache is keyed by everything that shapes the audio, so a change regenerates only what it affects.
// No credentials here: the API key lives only in the environment's network secret (see docs/VOICE.md).

export type VoiceSettings = { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean; speed: number };
/** fx (optional, applied in the soundtrack mix, never to the generated clip): "uncanny" = the same voice pitched
 *  down about 3 semitones at the same length (timings and lip-sync unchanged), a hollow echo, the natural voice faint
 *  underneath (a thing speaking in someone else's voice); "radio" = a two-way radio: a narrow band, squashed (The Empty Seat v2) */
export type VoicePreset = { name: string; voiceId: string; model: string; settings: VoiceSettings; note: string; fx?: "uncanny" | "radio" };

/** the channel's settings: the audition settings (stability 0.5, similarity 0.75), no style exaggeration, and a slight
 *  speed-up toward the reference pace (3.5-4.1 words/s; George reads ~3.1 words/s at speed 1.0) */
const CHANNEL: VoiceSettings = { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: 1.1 };
const MODEL = "eleven_multilingual_v2";

export const VOICES: Record<string, VoicePreset> = {
  george: { name: "George - Warm, Captivating Storyteller", voiceId: "JBFqnCBsd6RMkjVDRZzb", model: MODEL, settings: CHANNEL, note: "the channel narrator (chosen in stage 2)" },
  brian: { name: "Brian - Deep, Resonant and Comforting", voiceId: "nPczCjzI2devNBz1zQrb", model: MODEL, settings: CHANNEL, note: "American alternative" },
  liam: { name: "Liam - Energetic, Social Media Creator", voiceId: "TX3LPaxmHKxFdv7VOQHJ", model: MODEL, settings: CHANNEL, note: "high-energy alternative (first API test voice)" },
  chris: { name: "Chris - Charming, Down-to-Earth", voiceId: "iP95p4xoKVk53GoZ742B", model: MODEL, settings: CHANNEL, note: "shortlisted" },
  jessica: { name: "Jessica - Playful, Bright, Warm", voiceId: "cgSgspJ2msm6clMCkdW9", model: MODEL, settings: CHANNEL, note: "shortlisted" },
  alice: { name: "Alice - Clear, Engaging Educator", voiceId: "Xb7hH8MSUJpSbSDYk0k2", model: MODEL, settings: CHANNEL, note: "shortlisted" },
  matilda: { name: "Matilda - Knowledgable, Professional", voiceId: "XrExE9yKIg1WjnnlVkGX", model: MODEL, settings: CHANNEL, note: "shortlisted" },
  // the narrator with a little more expression (lower stability, some style): for hook, surprise and punchline lines
  georgeLively: { name: "George - Warm, Captivating Storyteller", voiceId: "JBFqnCBsd6RMkjVDRZzb", model: MODEL, settings: { ...CHANNEL, stability: 0.35, style: 0.3 }, note: "George, more expressive (pirate democracy revision)" },
  // character voices (ElevenLabs Voice Design, created for Thinkora; in the account's voice library)
  captainRedd: { name: "Thinkora - Captain Redd", voiceId: "JhRIeE4Nad3PERzselQS", model: MODEL, settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35, use_speaker_boost: true, speed: 1.0 }, note: "pirate captain: deep, raspy, West Country, boastful (voice design)" },
  // Video 05 (The Extra Door, horror): owner-approved from the auditions in productions/extra-door/narration/auditions
  georgeHushed: { name: "George - Warm, Captivating Storyteller", voiceId: "JBFqnCBsd6RMkjVDRZzb", model: MODEL, settings: { ...CHANNEL, stability: 0.6, speed: 0.95 }, note: "George, calm and slower: horror narrator (Video 05)" },
  liamQuiet: { name: "Liam - Energetic, Social Media Creator", voiceId: "TX3LPaxmHKxFdv7VOQHJ", model: MODEL, settings: { ...CHANNEL, stability: 0.55, speed: 0.95 }, note: "Milo, quiet and nervous: natural quiet speech (Video 05)" },
  juno: { name: "Jessica - Playful, Bright, Warm", voiceId: "cgSgspJ2msm6clMCkdW9", model: MODEL, settings: { ...CHANNEL, stability: 0.45, style: 0.15, speed: 0.9 }, note: "Juno's voice (provisional, Video 05): warm and familiar" },
  junoCold: { name: "Jessica - Playful, Bright, Warm", voiceId: "cgSgspJ2msm6clMCkdW9", model: MODEL, settings: { ...CHANNEL, stability: 0.55, style: 0.15, speed: 0.85 }, note: "Juno's voice, slower and flatter: the unsettling line (Video 05)" },
  // Part 2 rewrite (night-shift): frightened, desperate takes for the door's pleading copies (additive; optional review takes)
  junoScared: { name: "Jessica - Playful, Bright, Warm", voiceId: "cgSgspJ2msm6clMCkdW9", model: MODEL, settings: { ...CHANNEL, stability: 0.3, style: 0.4, speed: 0.88 }, note: "Juno, frightened and desperate (Part 2 rewrite review take)" },
  // Video 09 (One Too Many): Ms Okoye counting under her breath, slower and looser than the channel settings (owner-approved)
  aliceCount: { name: "Alice - Clear, Engaging Educator", voiceId: "Xb7hH8MSUJpSbSDYk0k2", model: MODEL, settings: { ...CHANNEL, stability: 0.4, style: 0.2, speed: 0.88 }, note: "Ms Okoye counting (One Too Many): slower, with hesitations" },
  aliceSurprise: { name: "Alice - Clear, Engaging Educator", voiceId: "Xb7hH8MSUJpSbSDYk0k2", model: MODEL, settings: { ...CHANNEL, stability: 0.4, style: 0.2, speed: 0.9 }, note: "Ms Okoye's quiet, puzzled \"...thirty-one?\" (One Too Many; delivered with the count as context)" },
  aliceRealise: { name: "Alice - Clear, Engaging Educator", voiceId: "Xb7hH8MSUJpSbSDYk0k2", model: MODEL, settings: { ...CHANNEL, stability: 0.35, style: 0.2, speed: 0.88 }, note: "Ms Okoye's \"Thirty... one?\" (One Too Many, owner-chosen audition take 4; delivered with context)" },
  // The Whale City: the city whispers (the dialogue is steered quiet with line context); Wren is Jessica, Gran is Lily
  // (an older British actress), the Mayor is Daniel (a smooth British broadcaster)
  wrenWhisper: { name: "Jessica - Playful, Bright, Warm", voiceId: "cgSgspJ2msm6clMCkdW9", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.1, speed: 0.9 }, note: "Wren (The Whale City), whispering" },
  wrenUrgent: { name: "Jessica - Playful, Bright, Warm", voiceId: "cgSgspJ2msm6clMCkdW9", model: MODEL, settings: { ...CHANNEL, stability: 0.35, style: 0.3, speed: 1.0 }, note: "Wren (The Whale City), urgent: \"It can't breathe!\"" },
  granWhisper: { name: "Lily - Velvety Actress", voiceId: "pFZP5JQG7iQjIQuC4Bku", model: MODEL, settings: { ...CHANNEL, stability: 0.55, style: 0.1, speed: 0.88 }, note: "Gran (The Whale City), whispering, gentle" },
  mayor: { name: "Daniel - Steady Broadcaster", voiceId: "onwK4e9ZLuTAKqWW03F9", model: MODEL, settings: { ...CHANNEL, stability: 0.55, style: 0.15, speed: 0.95 }, note: "the Mayor (The Whale City): pleasant, quiet" },
  mayorSharp: { name: "Daniel - Steady Broadcaster", voiceId: "onwK4e9ZLuTAKqWW03F9", model: MODEL, settings: { ...CHANNEL, stability: 0.35, style: 0.35, speed: 1.0 }, note: "the Mayor (The Whale City), alarmed: \"Don't you dare!\"" },
  // The Other Jamie (voice-library voices, auditioned: productions/other-jamie/narration/audition-notes.md): Sam is
  // Astro (a young British storyteller); the thing in the woods is Sam's own voice, slow and flat; Jamie is Toby
  samNarr: { name: "Astro - Smooth, Strong and Confident", voiceId: "B5vjwBxGgp4GLTiUjDxM", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.25, speed: 0.95 }, note: "Sam narrating (The Other Jamie)" },
  samLine: { name: "Astro - Smooth, Strong and Confident", voiceId: "B5vjwBxGgp4GLTiUjDxM", model: MODEL, settings: { ...CHANNEL, stability: 0.4, style: 0.3, speed: 1.0 }, note: "Sam speaking in the scene (The Other Jamie)" },
  itVoice: { name: "Astro - Smooth, Strong and Confident", voiceId: "B5vjwBxGgp4GLTiUjDxM", model: MODEL, settings: { ...CHANNEL, stability: 0.8, style: 0.0, speed: 0.8 }, note: "the thing in the woods: Sam's own voice, slow, gentle and flat, made uncanny in the mix (The Other Jamie)", fx: "uncanny" },
  jamieCopy: { name: "Toby - Raspy, Youthful and Articulate", voiceId: "pYDLV125o4CgqP8i49Lg", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.2, speed: 0.95 }, note: "Jamie, the copy (The Other Jamie)" },
  jamieQuiet: { name: "Toby - Raspy, Youthful and Articulate", voiceId: "pYDLV125o4CgqP8i49Lg", model: MODEL, settings: { ...CHANNEL, stability: 0.45, style: 0.25, speed: 0.86 }, note: "Jamie, the copy, quiet: \"That's me, isn't it?\" (The Other Jamie)" },
  // What Ollie Says at 3 A.M. Part 1 (productions/what-ollie-says/auditions/audition-notes.md, Creator plan): library
  // voices, no processing. The toddler role (Kuba's words out of Ollie) is Mini; Ollie's own voice is Leo (lower than the
  // toddler, so the role reads as a younger child); Kate is Kasia, a native Polish voice. The ritual lines keep one preset each
  olToddler: { name: "Mini - Lively Cute Little Girl", voiceId: "nUX4UWK0Tf1qh5zvFZWR", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0, speed: 0.85 }, note: "the toddler voice (What Ollie Says at 3 A.M.): L1 and L5" },
  olOllie: { name: "Leo - Cute Energetic Young Kid", voiceId: "1tDEBGOo8EqEPApM49eJ", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0, speed: 0.9 }, note: "Ollie, 6 (What Ollie Says at 3 A.M.)" },
  olKate: { name: "Kasia - Warm, Natural & Engaging", voiceId: "2IG19NvuEAFSWMSkq7wB", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.1, speed: 0.9 }, note: "Kate, awake (What Ollie Says at 3 A.M.): quiet, tired, a Polish accent in English" },
  olKateNight: { name: "Kasia - Warm, Natural & Engaging", voiceId: "2IG19NvuEAFSWMSkq7wB", model: MODEL, settings: { ...CHANNEL, stability: 0.7, style: 0, speed: 0.85 }, note: "Kate asleep, the ritual (L2, L3, L6): flat, tender, far away" },
  olKateShout: { name: "Kasia - Warm, Natural & Engaging", voiceId: "2IG19NvuEAFSWMSkq7wB", model: MODEL, settings: { ...CHANNEL, stability: 0.3, style: 0.4, speed: 1.0 }, note: "Kate asleep, L4: the shout (Weź go!)" },
  olAva: { name: "Alice - Clear, Engaging Educator", voiceId: "Xb7hH8MSUJpSbSDYk0k2", model: MODEL, settings: { ...CHANNEL, stability: 0.45, style: 0.15, speed: 1.0 }, note: "Ava, 15 (What Ollie Says at 3 A.M.)" },
  olMark: { name: "Daniel - Steady Broadcaster", voiceId: "onwK4e9ZLuTAKqWW03F9", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.1, speed: 0.95 }, note: "Mark, 42 (What Ollie Says at 3 A.M.): warm, tired" },
  // The Empty Seat v2 (the voiced format): the bus 9 cast
  esYou: { name: "Alice - Clear, Engaging Educator", voiceId: "Xb7hH8MSUJpSbSDYk0k2", model: MODEL, settings: { ...CHANNEL, stability: 0.45, style: 0.2, speed: 1.0 }, note: "you, 11, on bus 9 (The Empty Seat): your lines" },
  esThought: { name: "Alice - Clear, Engaging Educator", voiceId: "Xb7hH8MSUJpSbSDYk0k2", model: MODEL, settings: { ...CHANNEL, stability: 0.6, style: 0.1, speed: 0.95 }, note: "you, 11 (The Empty Seat): your thoughts, close and quiet" },
  esNoah: { name: "Leo - Cute Energetic Young Kid", voiceId: "1tDEBGOo8EqEPApM49eJ", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.1, speed: 0.95 }, note: "Noah, the new kid (The Empty Seat)" },
  esPriya: { name: "Jessica - Playful, Bright, Warm", voiceId: "cgSgspJ2msm6clMCkdW9", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.1, speed: 0.9 }, note: "Priya, 11, whispering (The Empty Seat)" },
  esSam: { name: "Toby - Raspy, Youthful and Articulate", voiceId: "pYDLV125o4CgqP8i49Lg", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.2, speed: 0.95 }, note: "Sam, 12, who knows the story (The Empty Seat)" },
  esHale: { name: "Brian - Deep, Resonant and Comforting", voiceId: "nPczCjzI2devNBz1zQrb", model: MODEL, settings: { ...CHANNEL, stability: 0.55, style: 0.1, speed: 0.9 }, note: "Mr Hale, the bus driver: quiet and kind (The Empty Seat)" },
  esSub: { name: "Matilda - Knowledgable, Professional", voiceId: "XrExE9yKIg1WjnnlVkGX", model: MODEL, settings: { ...CHANNEL, stability: 0.5, style: 0.15, speed: 1.0 }, note: "the stand-in driver: breezy (The Empty Seat)" },
  esRadio: { name: "Daniel - Steady Broadcaster", voiceId: "onwK4e9ZLuTAKqWW03F9", model: MODEL, settings: { ...CHANNEL, stability: 0.6, style: 0, speed: 1.0 }, note: "the bus dispatch radio (The Empty Seat), through the radio filter", fx: "radio" },
  liamScared: { name: "Liam - Energetic, Social Media Creator", voiceId: "TX3LPaxmHKxFdv7VOQHJ", model: MODEL, settings: { ...CHANNEL, stability: 0.3, style: 0.35, speed: 0.9 }, note: "Milo, frightened and desperate (Part 2 rewrite review take)" },
};

/** the default voice for every line of every Short (storyboards may override with `voice` / `voices`) */
export const NARRATOR = "george";
