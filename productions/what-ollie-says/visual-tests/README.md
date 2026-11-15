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

## Known weaknesses of the roof stills (v1), from the independent review
These are recorded, not fixed. The roof sequence gets its final visual development only if continuation past Part 1 is approved. The v1 stills are kept as they are.

| Weakness | Where | To do later |
|---|---|---|
| Not enough sense of height: it reads as a garden wall | Frames 2, 5, 6 | Add an angle that shows the roof edge with water below (as frame 10 does), without framing a fall |
| The far bank and trees look like daytime | Frames 2, 5, 6 | Darken and desaturate the far bank at night |
| Back views show no emotion | Frames 2, 5, 6 | Carry the moment with side angles and inserts, not back views |
| Kate's wide-eyed face is wrong for Finale A's payoff | Frame 9 | A softer asleep face for "You're alive…" |
| Finale B has no proof | none | Stage the wake-up and the grip when Part 5 is approved |
| The inserts (hand on wrist, toes on brick) aren't built | none | Build with Part 4 |
| Ollie reads older than six; no three-year-old exists | Frames 3, 4, 7 | A `toddler` build for Part 4; check Ollie's proportions in Part 1 stills |

# Bedside ritual visual test (v1)
- **Source:** `animation-studio/src/studio/stories/ollie-bedside-test.ts` (composition `Short-ollie-bedside-test`).
- **Sheet:** `bedside-stills-v1.jpg`.
- **Result:** kneeling, sitting up in bed, sleeping and joined hands all work with existing poses and staging. See `../part1-plan.md` §1–2.
