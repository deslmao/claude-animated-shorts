// Narration voices (stage 2). A voice is a named preset: ElevenLabs voice + model + settings. Storyboards name presets,
// never raw IDs, so switching the channel's voice (or giving one character their own) is a one-word change; the
// narration cache is keyed by everything that shapes the audio, so a change regenerates only what it affects.
// No credentials here: the API key lives only in the environment's network secret (see docs/VOICE.md).

export type VoiceSettings = { stability: number; similarity_boost: number; style: number; use_speaker_boost: boolean; speed: number };
export type VoicePreset = { name: string; voiceId: string; model: string; settings: VoiceSettings; note: string };

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
};

/** the default voice for every line of every Short (storyboards may override with `voice` / `voices`) */
export const NARRATOR = "george";
