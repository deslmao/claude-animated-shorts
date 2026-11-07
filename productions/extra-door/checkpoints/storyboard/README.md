# Video 05: code storyboard checkpoints (waiting for the owner's visual approval)

`animation-studio/src/studio/stories/extra-door.ts` holds the approved 21-shot design. It runs 56.03 s (1681 frames).
The full video has not been rendered.

## Narration and timing (unchanged)
The recordings, the word-timing manifest and the voice presets are byte-identical to the approved narration commit,
13ca003. The voice tool reports all 11 lines generated, 0 new. Each line starts within 0.04 s of its approved time:

| Line | Starts | Approved |
|---|---|---|
| 2 | 2.59 | 2.60 |
| 3 | 6.60 | 6.60 |
| 4 | 9.00 | 9.00 |
| 5 | 13.99 | 14.00 |
| 6 | 25.58 | 25.60 |
| 7 | 27.40 | 27.40 |
| 8 | 30.22 | 30.22 |
| 9 | 41.02 | 41.00 |
| 10 | 49.44 | 49.40 |
| 11 | 51.13 | 51.10 |

Line 1 opens the film. The identical Juno recording is followed by exactly 1.00 s of silence: speech ends at 29.30 s
and the repeat begins at 30.30 s.

## The five checkpoints (1080×1920)
1. `1-opening-wide`: the symmetrical hallway.
   - Milo is fully visible on the right third, seen from behind, beside the stairwell.
   - The old door is clear at the vanishing point.
   - Milo is left of the Shorts button strip (right edge about 0.78 of the width).
2. The clue:
   - `2a-clue-nail-patch-door`: the bare nail (now larger), the clean unfaded patch with the door through it, and the
     photo below;
   - `2b-clue-fallen-photo`: the end of the glide down to the photo of Milo and Juno.
3. `3-phone-message`: the dedicated high-resolution phone screen. "No, I'm still at work. Why?" has capitals about
   50 px tall.
4. The door:
   - `4a-under-door-shadows`: after the third knock, the light strip broken by two dark shapes, with two shadows
     stretching across the light pool toward the fallen photo;
   - `4b-handle-through-wood`: the brass handle pushed through the solid wood and turned.
5. `5-final-AB`: the final composition.
   - The flat A / B labels sit beside the door and above the stairwell.
   - The caption is in its usual band.
   - Milo stands between the door and the stairs, clear of the door and inside the button-free area (his right edge
     is left of 0.86).

## Corrected while building (before these stills)
- **The light strip under the door was hidden.** The end wall's skirting ran behind the old door, so the door now
  stops the skirting and the dado rail at its frame.
- **The two shadows on the floor didn't show.** The additive light pool can only brighten, so a darkening shadow layer
  was added.
- **The opening wide:** Milo's start mark moved so he is fully visible and doesn't cover the door, and the camera moved
  off the banister and newel-post sight lines.
- **The final shot:** turned 0.7°, so Milo stays left of the Shorts buttons. The labels were recomputed to keep their
  screen positions.
- **The count shot** was re-staged: Milo's back on the right third, the camera gliding door to door, and his point of
  view on "eight." (the pointing arm left the frame).
- **Camera clearance** is clean on every frame. The final shot's camera is marked `blockOk`, because the line to its
  look-at point grazes the top newel post, the intended foreground (it hides no subject).
- **Smaller fixes:** Milo's pose seen from behind; the phone drawn on his back; his scared face in shot 20; the clock
  insert's framing; the medium in shot 12.

## Tests
- `npm test` passes.
- The validator reports no errors (advisory warnings only).
- Camera clearance: clear on every frame.
- Library: all protected assets intact.
- `scripts/race-test.ts`: the drop-out check now asserts "a drop-out only where `musicDrop` asks for it". It used to
  say "no storyboard but Video 04". Video 05 opts in after the repeated "Let me in".
