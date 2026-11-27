// Engine 4 word-level SFX (Phase 4): "literal audio punctuation". A spoken concrete noun or action gets its sound on the word's own
// timestamp (not just on scene changes), so the ear is hit every 1.5-2.5 s. Built-in names are in sound/catalog.ts; any other name is a
// custom file assets/sfx/<name>.mp3 or .wav (generated once with python3 sound/sfx_fetch.py, ElevenLabs Sound Effects). `major` sounds
// duck the music 8 dB under them (sound/build.py). `key` words are the ones the viral captions highlight in a pop colour.
type Word = { w: string; t0: number; t1: number };

export type LexEntry = { sfx?: string; major?: boolean; gain_db?: number; lead?: number; key?: boolean };
/** lowercase word -> what it triggers. lead = seconds BEFORE the word's start the sound is placed (a whoosh arrives with the word) */
export const LEXICON: Record<string, LexEntry> = {
  six: { sfx: "clock_tick_six", major: true, key: true }, pizza: { sfx: "shimmer_chime", major: true, key: true },
  plates: { sfx: "plate_clink", key: true }, plate: { sfx: "plate_clink", key: true },
  box: { sfx: "box_thud", major: true, key: true }, already: { sfx: "whoosh_soft", lead: 0.12 },
  ordered: { sfx: "heartbeat", gain_db: -6, key: true }, order: { sfx: "heartbeat", gain_db: -6 },
  warm: { sfx: "crowd_swell", major: true, key: true }, tonight: { sfx: "whoosh_soft", lead: 0.12, key: true },
  door: { key: true }, phone: { key: true }, mug: { key: true }, kettle: { key: true }, mum: { key: true }, maya: { key: true },
  friday: { key: true }, three: { key: true }, midnight: { key: true }, money: { key: true }, key: { key: true },
};
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']+/g, "");
/** the cues for a narration's words: each lexicon word with a sound, at least `gap` seconds apart (a denser run keeps the first, major ones win) */
export const wordCues = (words: Word[], gap = 1.2): { t: number; name: string; major: boolean; gain_db?: number; why: string }[] => {
  const hits = words.flatMap((w) => { const e = LEXICON[norm(w.w)]; return e?.sfx ? [{ t: Math.max(0, w.t0 - (e.lead ?? 0)), name: e.sfx, major: !!e.major, gain_db: e.gain_db, why: `word "${norm(w.w)}"` }] : []; });
  const out: typeof hits = [];
  for (const h of hits) { const prev = out[out.length - 1]; if (prev && h.t - prev.t < gap) { if (h.major && !prev.major) out[out.length - 1] = h; } else out.push(h); }
  return out;
};
