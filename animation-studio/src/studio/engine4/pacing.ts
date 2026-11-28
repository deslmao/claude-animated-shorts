// Engine 4, Phase 2: automated pacing checks (CLAUDE.md standards 2 and 4). Works on a resolved storyboard (beats with seconds).
//   - a visual change = a shot start or a camera beat (cut, glide or whip) inside a shot
//   - target: an average change every 1.5-2.0 s; no flat card / UI graphic held longer than 2.5 s without a change
import type { Storyboard } from "../story/types";

export const PACE_MIN = 1.5, PACE_MAX = 2.0, FLAT_MAX = 2.5;
const FLAT_PROP = /insert|poster|ggPlate|panel|sign(?!edBasketball)|card|label|screen|display|diagram/i;
/** a shot that is mostly a flat graphic: an insert / diagram camera, a title, or a story prop that is a card */
export const isFlat = (s: Storyboard["shots"][number]) =>
  s.camera.move === "insert" || !!s.diagram || !!s.title || (s.props ?? []).some((p) => FLAT_PROP.test(p.id));

export type Pace = { total: number; events: number[]; average: number; longestGap: { shot: number; seconds: number }; flatHolds: { shot: number; seconds: number }[]; errors: string[]; warnings: string[] };
export const paceOf = (sb: Storyboard): Pace => {
  const events: number[] = [], flatHolds: Pace["flatHolds"] = [], errors: string[] = [], warnings: string[] = [];
  let t = 0, longest = { shot: 0, seconds: 0 };
  sb.shots.forEach((s, i) => {
    const dur = s.dur ?? 0, mine = [0];
    for (const b of (s.cams ?? []).slice(1)) { const at = (b as { t?: number }).t; if (typeof at === "number" && at > 0.2 && at < dur - 0.2 && (b.cut || (b.glide ?? 0) > 0 || b.whip || b.swoop)) mine.push(at); }
    mine.sort((a, b) => a - b);
    for (const m of mine) events.push(t + m);
    const marks = [...mine, dur];
    for (let k = 0; k < marks.length - 1; k++) {
      const gap = marks[k + 1] - marks[k];
      if (gap > longest.seconds) longest = { shot: i + 1, seconds: gap };
      if (isFlat(s) && gap > FLAT_MAX) { flatHolds.push({ shot: i + 1, seconds: gap }); errors.push(`pacing: shot ${i + 1} holds a flat card / graphic for ${gap.toFixed(1)} s with no camera change (max ${FLAT_MAX} s): cut, move the camera or add a beat`); }
    }
    t += dur;
  });
  const average = events.length ? t / events.length : t;
  if (average > PACE_MAX + 0.05) warnings.push(`pacing: a visual change every ${average.toFixed(2)} s on average (Engine 4 target ${PACE_MIN}-${PACE_MAX} s)`);
  if (average < PACE_MIN - 0.05 && events.length > 2) warnings.push(`pacing: a visual change every ${average.toFixed(2)} s on average is faster than the ${PACE_MIN}-${PACE_MAX} s target`);
  return { total: t, events, average, longestGap: longest, flatHolds, errors, warnings };
};
