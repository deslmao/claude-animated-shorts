// Engine 4 word-level SFX (Phase 4/5): "literal audio punctuation". A spoken concrete noun or action gets its sound on the word's own
// timestamp (not just on scene changes), so the ear is hit every 1.5-2.5 s. Built-in names are in sound/catalog.ts; any other name is a
// custom file assets/sfx/<name>.mp3 or .wav (generated once with python3 sound/sfx_fetch.py, ElevenLabs Sound Effects). `major` sounds
// duck the music 8 dB under them (sound/build.py). `key` words are the ones the viral captions highlight in a pop colour.
//
// GROUNDED (Phase 5): this lexicon is for INTIMATE scenes (a kitchen, a bedroom, a hallway). Every sound here is a room, comedy or tension
// sound: a mug, a plate, a toaster, a clock, a heartbeat, a sub-bass hit. Stadium / crowd / applause / gasp / scream / siren sounds are
// never mapped here, and `groundedOnly` strips them from any cue list of an intimate film (see `isGrounded`).
type Word = { w: string; t0: number; t1: number };

export type LexEntry = { sfx?: string; major?: boolean; gain_db?: number; lead?: number; key?: boolean };
/** lowercase word -> what it triggers. lead = seconds BEFORE the word's start the sound is placed (a whoosh arrives with the word) */
export const LEXICON: Record<string, LexEntry> = {
  // room: things in the kitchen
  six: { sfx: "clock_tick_six", major: true, key: true }, seven: { sfx: "el_clock_tick", key: true }, plates: { sfx: "plate_clink", key: true }, plate: { sfx: "plate_clink", key: true },
  box: { sfx: "box_thud", major: true, key: true }, mug: { sfx: "el_mug_down", key: true }, kettle: { sfx: "kettle_click", key: true },
  toaster: { sfx: "lever_clunk", gain_db: -3, key: true }, pops: { sfx: "toaster_pop" }, popped: { sfx: "toaster_pop", major: true, key: true }, toast: { sfx: "toast_tick", gain_db: -3, key: true }, burns: { sfx: "toast_sizzle", major: true, key: true }, burnt: { sfx: "toast_sizzle", key: true },
  broke: { sfx: "mug_shatter", major: true, key: true }, bite: { sfx: "slice_bite" }, ate: { sfx: "slice_bite" },
  // comedy
  pizza: { sfx: "shimmer_chime", major: true, key: true }, already: { sfx: "whoosh_soft", lead: 0.12 }, tonight: { sfx: "whoosh_soft", lead: 0.12, key: true },
  slid: { sfx: "whoosh_soft", lead: 0.1 }, dropped: { sfx: "el_plate_down" }, pieces: { sfx: "mug_shatter", gain_db: -8, key: true }, found: { sfx: "el_mug_down", gain_db: -4 }, kept: { sfx: "whoosh_soft", lead: 0.1 }, talking: { sfx: "el_whisper_air", gain_db: -6 },
  // tension
  panicked: { sfx: "heartbeat", gain_db: -4, key: true }, fridge: { sfx: "fridge_door", key: true }, bread: { sfx: "toast_tick", key: true }, ordered: { sfx: "heartbeat", gain_db: -6, key: true }, order: { sfx: "heartbeat", gain_db: -6 }, whisper: { sfx: "el_whisper_air", gain_db: -4, key: true }, whispered: { sfx: "el_whisper_air", gain_db: -4, key: true },
  silence: { sfx: "sub_hit", key: true }, secret: { sfx: "el_whisper_air", gain_db: -7, key: true }, silly: { sfx: "boing", gain_db: -6 }, shaking: { sfx: "el_breath_hold", gain_db: -6 },
  perfect: { sfx: "shimmer_chime", gain_db: -8, key: true }, proud: { sfx: "pop", gain_db: -6, key: true }, walked: { sfx: "step_hard", gain_db: -5 },
  read: { sfx: "paper_rustle", gain_db: -5 }, reads: { sfx: "paper_rustle", gain_db: -5 }, held: { sfx: "el_mug_down", gain_db: -6 }, practice: { sfx: "toast_tick", gain_db: -4, key: true }, twice: { sfx: "toast_tick", gain_db: -4 },
  // key nouns the captions highlight (no sound)
  warm: { key: true }, door: { key: true }, phone: { key: true }, mum: { key: true }, maya: { key: true }, friday: { key: true }, three: { key: true },
  drawing: { sfx: "paper_rustle", key: true }, dog: { key: true }, lie: { sfx: "sting_low", gain_db: -6, key: true }, sorry: { sfx: "shimmer_chime", gain_db: -6, key: true }, love: { sfx: "shimmer_chime", gain_db: -4, key: true },
};
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']+/g, "");
/** sounds that never belong in a small room: stadium / crowd / applause / cheers / gasps / screams / sirens / weather / weapons */
export const NOT_GROUNDED = /crowd|stadium|cheer|applause|aww|aye|gasp|scream|roar|siren|thunder|gun|bullet|jumpscare|group_|train|van_|car_|engine|bus_/i;
export const isGrounded = (name: string) => !NOT_GROUNDED.test(name);
/** the cues for a narration's words: each lexicon word with a sound, at least `gap` seconds apart (a denser run keeps the first, major ones win) */
export const wordCues = (words: Word[], gap = 1.2): { t: number; name: string; major: boolean; gain_db?: number; why: string }[] => {
  const hits = words.flatMap((w) => { const e = LEXICON[norm(w.w)]; return e?.sfx && isGrounded(e.sfx) ? [{ t: Math.max(0, w.t0 - (e.lead ?? 0)), name: e.sfx, major: !!e.major, gain_db: e.gain_db, why: `word "${norm(w.w)}"` }] : []; });
  const out: typeof hits = [];
  for (const h of hits) { const prev = out[out.length - 1]; if (prev && h.t - prev.t < gap) { if (h.major && !prev.major) out[out.length - 1] = h; } else out.push(h); }
  return out;
};
