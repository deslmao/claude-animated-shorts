// Soundtrack fingerprint (stage 3A): ties audio/Short-<id>.mp3 to the exact storyboard + narration it was built from.
// The soundtrack builder writes it next to the audio (audio/Short-<id>.json); `npm run preflight` (also run by the
// cloud render before anything is rendered) refuses a Short whose soundtrack fingerprint doesn't match the current
// storyboard: edited lines, re-timed shots or new sound cues all mean "rebuild the soundtrack first".
import type { Storyboard } from "./types";
import { fnv, Narration } from "../voice/narration";
import { resolve } from "./timing";

/** bump when the soundtrack builder produces different audio from the same inputs (forces a rebuild everywhere) */
export const SOUNDTRACK_ENGINE = "voice-1";

export type SoundtrackInfo = { composition: string; fingerprint: string; engine: string; frames: number; seconds: number; lines: number; lufs?: number; built: string };

export const soundtrackFingerprint = (sb: Storyboard, narr?: Narration, engine = SOUNDTRACK_ENGINE) => {
  const tm = resolve(sb, narr);
  return fnv(JSON.stringify({ engine, sb, total: tm.total, lines: tm.lines.map((l) => [l.hash, l.estimated, Math.round(l.fileAt * 1000)]) }));
};
