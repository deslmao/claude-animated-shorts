# Roof-sequence visual test (v1)

- **Source:** `animation-studio/src/studio/stories/ollie-roof-test.ts` (composition `Short-ollie-roof-test`, silent, 10 shots).
- **Rendered:** half-scale stills (540×960); contact sheet `roof-stills-v1.jpg`; single frames `roof-<frame>.jpg`.

| # | Beat | Frame |
|---|---|---|
| 1 | Episode 4, beat 15: the empty room, window open onto the roof | 20 |
| 2 | Episode 4, beat 16: from the window, Kate at the edge | 62 |
| 3 | Episode 4, beat 16: Ollie out of the window, Ava behind | 104 |
| 4 | Episode 4, beat 16: Kate takes Ollie's wrist | 146 |
| 5 | Episode 4, beat 17: Kate low at the edge with Ollie | 188 |
| 6 | Episode 4, beat 17: "Take him!", hands joined at the edge | 230 |
| 7 | Episode 4, beat 17: Ollie looks back, keeping his promise | 272 |
| 8 | Episode 4, beat 18: Ava at the window, the vote | 314 |
| 9 | Finale A, beat 5: Kate holds on, Ava wraps them | 356 |
| 10 | Geography: the house from the flooded garden | 398 |

**Fixed during the test:**
- The flood didn't read at night, so the water is now lit and rippled, with fence posts standing in it.
- The empty room was murky, the wallpaper missing and the curtains edge-on. It has been reframed with the empty bed.
- The window's light now spills onto the roof.
- Kate's sleepwalking face: the stock "dazed" face has spiral eyes, so I added a `blank` expression (wide, fixed eyes) used with `blink: false`.
- Three framings were corrected (4, 7, 8), and one camera clipped the windowsill.
- "Take him" is staged as hands joined at the edge. The lift itself is the planned hand insert.
- The z-fighting check showed overlapping surfaces; these were offset.
