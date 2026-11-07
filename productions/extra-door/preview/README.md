# Video 05: The Extra Door, soundtrack and preview clips (waiting for the owner's approval)

The preview clips are 1080×1920 at 30 fps, with the final soundtrack (`animation-studio/audio/Short-extra-door.mp3`).
They come from the locked storyboard plus the targeted corrections listed below. The full video has not been rendered.

| Clip | Film frames | Content | Frame QA |
|---|---|---|---|
| 1-hook-hallway-count | 0-385 | the hook (eyes), the hallway wide, "It always has", the reverse angle, the count, POV on "eight." | PASS |
| 2-clue-and-approach | 385-620 | the clue (nail, patch, door), the glide to the photo, his close-up, the approach, the clock stopping | PASS |
| 3-knocks-and-shadows | 630-817 | three knocks on three cuts, the shadows under the door, "...Juno?" | PASS |
| 4-juno-repeat-and-phone | 840-1216 | "Let me in", the identical repeat, backing away, the phone typed and sent, the reply | PASS |
| 5-handle-through-the-door | 1305-1428 | the wide from behind him, the handle pushing through the wood and turning, the click | PASS |
| 6-final-AB-choice | 1473-1680 | "...what do I do?", the A / B choice composition, the second click | PASS |

The frame QA checks the frame count, duplicate frames, near-blank frames, corrupt frames, soft frames and audio
length. In every clip the audio matches the picture to within 1 ms.

## Soundtrack
Built with `npm run sound` from the approved narration (cached; nothing regenerated).
- **Master:** −14.2 LUFS integrated, true peak −1.7 dBFS.
- **Narration:** −19.5 LUFS. The music bed sits 13 LU below the voice and the room tone 20 LU below.
- **Music:** the `mystery` bed. It drops out at 32.12 s, the end of the repeated "Let me in". After that the scene
  plays on room tone, effects and voices only; a low button chord lands on "Part 2".
- **Effects:**
  - **Clock:** a clock ticking downstairs (20 ticks), stopping during the approach.
  - **Whip:** the whoosh into the count.
  - **Footsteps:** two, with floorboard creaks.
  - **Knocks:** three identical heavy knocks, each peaking within 10 ms of its cut (frames 644, 677 and 710), 3 dB
    down so they land heavy but not as a jump scare.
  - **Phone:** taps and a send swish, then the buzz.
  - **The handle:** a wood strain, the crack as the handle pushes through, a creak, the latch click, and a second
    click at the very end.
- **The repeat:** the silence between the two identical Juno recordings measures 1.00 s in the mix (29.30 → 30.30 s).
- **The automatic effects are off** for this film. They put a cartoon "pop" on each "shock", over the second knock
  and over the stinger. The two automatic cues the film needs (the whip whoosh, the footsteps) are cued explicitly at
  the same frames.

## Corrections made in this stage (targeted; picture changes are listed)
1. **Shot 1, the hook.** The eye camera framed his hair: it was aimed at a guessed height. It is now aimed at the face
   position the engine reports (1.37 m). The hook line plays without a speaker tag, because a speaking card takes the
   engine's talking faces, which read as cheerful in a close-up. His scared, darting eyes and shock now carry it.
   The recording, timing and caption are unchanged.
2. **Shot 7, the approach.** Walking straight down the camera's line of sight, he hid the old door. The camera is now
   offset to the left of the hall and aimed right, so he walks down the right of the frame with the door visible.
3. **Shot 12.** The walk now starts at 0.0 s. One held frame after the cut (frame 1001) failed the duplicate-frame
   check.
4. **Shot 20, "...what do I do?"** No speaker tag, as in shot 1: his scared face holds instead of a grin. The
   recording, timing and caption are unchanged.
5. **Soundtrack:** the automatic effects are off, and the knocks are 3 dB down (see above).

## Unchanged
- The script, the recordings, the word timings and the 56.03 s timeline. The voice files are byte-identical to
  13ca003.
- Shot 4 as approved, the other shots' staging, the hallway (floor, runner, lighting, staircase) and the protected
  assets.
- The camera system, the engine and other productions.

## Checks
- `npm test` passes.
- The validator reports no errors.
- Camera clearance is clean on every frame.
- Preflight passes, and the library is intact.
