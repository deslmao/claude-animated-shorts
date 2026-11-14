// Narration data (stage 2): what `npm run voice` stores for each spoken line, and how the engine looks it up.
// A line's audio is identified by a fingerprint of everything that shapes the sound (voice, model, settings, text),
// so an unchanged line is never regenerated (no repeat credits) and any change is picked up automatically.
// Pure data + pure functions: runs in the browser (Remotion) and in Node (scripts).
import { VOICES, VoicePreset } from "./voices";

/** one spoken word; times in seconds from the start of the clip's audio file */
export type Word = { w: string; t0: number; t1: number };
/** one generated line: lead = first word start, end = last word end, dur = audio file length (all seconds) */
export type Clip = { hash: string; text: string; voice: string; lead: number; end: number; dur: number; words: Word[] };
/** a story's narration manifest: src/studio/stories/voice/<id>.json, written by `npm run voice` */
export type Narration = { id: string; clips: Record<string, Clip> };

/** cyrb53 (a well-mixed 53-bit string hash), as 14 hex digits. Not cryptographic: a stable cache key that works in
 *  the browser and in Node */
export const fnv = (s: string) => {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
};

/** the request body for a line (exactly what is sent to ElevenLabs, minus credentials) */
export const requestOf = (p: VoicePreset, text: string, ctx?: { before?: string; after?: string }) => ({ text, model_id: p.model, voice_settings: p.settings,
  ...(ctx?.before ? { previous_text: ctx.before } : {}), ...(ctx?.after ? { next_text: ctx.after } : {}) });
/** the cache key of a line: voice id + model + settings + text + output format */
export const clipHash = (voice: string, text: string, ctx?: { before?: string; after?: string }) => {
  const p = VOICES[voice];
  if (!p) throw new Error(`unknown voice preset "${voice}" (presets: ${Object.keys(VOICES).join(", ")})`);
  return fnv(JSON.stringify({ v: p.voiceId, ...requestOf(p, text, ctx), fmt: "mp3_44100_128" }));
};

/** a stand-in clip before the line is generated (validation and previews work before any credits are spent):
 *  ~3.4 words/s (the channel voice at speed 1.1), word length by letters, short pauses at punctuation */
export const estimateClip = (voice: string, text: string): Clip => {
  const words: Word[] = []; let t = 0.05;
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const d = 0.04 + 0.045 * w.replace(/[^\p{L}\p{N}]/gu, "").length;
    words.push({ w, t0: t, t1: t + d }); t += d + 0.025 + (/[.!?]$/.test(w) ? 0.24 : /[,;:]$/.test(w) ? 0.1 : 0);
  }
  const end = words.length ? words[words.length - 1].t1 : 0;
  return { hash: "estimate", text, voice, lead: words[0]?.t0 ?? 0, end, dur: end + 0.1, words };
};

/** ElevenLabs character alignment -> words (start of first letter, end of last letter) */
export const wordsFromAlignment = (a: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] }): Word[] => {
  const out: Word[] = []; let cur = "", t0 = 0, t1 = 0;
  a.characters.forEach((c, i) => {
    if (/\s/.test(c)) { if (cur) out.push({ w: cur, t0, t1 }); cur = ""; return; }
    if (!cur) t0 = a.character_start_times_seconds[i];
    cur += c; t1 = a.character_end_times_seconds[i];
  });
  if (cur) out.push({ w: cur, t0, t1 });
  return out;
};

/** normalised word for anchors ("Yawns," -> "yawns") */
export const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "").replace(/^'+|'+$/g, "");
