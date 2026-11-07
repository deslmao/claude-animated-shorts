# Video 05: asset checkpoints (waiting for the owner's approval)

Full-resolution 1080×1920 stills from the real engine, using only the two checkpoint shots and two asset-check shots
in the placeholder storyboard. The final code storyboard is not built, and the video is not rendered.

## Checkpoint 1: the phone close-up (design shot 15). PASS
`1-phone-closeup-1080x1920.jpg`, with a 1:1 crop in `1-phone-closeup-crop-1to1.png`.
- **Sharp at macro.** The phone is a display prop with its own 1024×2048 screen texture: about 1.5 texture pixels per
  screen pixel at 1080 px wide. The phone fills about 68 % of the frame width.
- **Measured on the 1080×1920 frame:**
  - "No, I'm still / at work. Why?": capitals about 50 px tall (68 px type), dark on a light bubble;
  - "are you home?": about 48 px ascenders, white on blue;
  - "Juno": about 44 px type.

  That is about 3.5 mm on a typical phone screen, readable without zooming. Nothing overlaps the text.
- **First attempt, corrected:** the phone filled only about 52 % of the width. The insert framing was tightened.

## Checkpoint 2: the final A / B composition (design shot 21). PASS
`2-final-AB-composition-1080x1920.jpg`, with 1:1 label crops in `2-label-A-crop-1to1.png` and
`2-label-B-crop-1to1.png`.
- **Readable labels.** Each label is 45 % of the frame width (about 486 px), with the choice text at about 65 px type
  (capitals about 50 px) and a 120 px letter badge. They pop in on the narrator's "A" and "B" and stay up for about
  4 s.
- **Flat screen graphics.** The labels are opaque, unlit cards that face the lens, drawn over everything. They write
  depth and are on the ink pass's no-outline layer, so no scene outline crosses them.
- **Nothing obscured:**
  - **A** sits above and beside the door;
  - **B** sits above the stairwell;
  - Milo, the door (handle out and turned), the staircase (banister and treads going down) and the caption are all
    clear;
  - both labels are inside the Shorts safe area (not the bottom fifth, not the right-hand button strip).
- **Corrected before passing:**
  1. **The stairs didn't fit in one frame with the door.** Near the camera, the stairwell fell outside the narrow 9:16
     frame. The stairwell was moved mid-hall (see the design change below).
  2. **The pendant lamps** blocked the door and the clean patch. They were raised and moved.
  3. **The caption jumped to the top of the frame.** The caption placer keeps captions clear of stepped props measured
     from their base upward, but the cards were centred on their position. The cards now stand above their position,
     and the caption is back at its usual lower-middle height (60–68 %).
  4. **Label A** ran off the right edge and **label B** sat in the Shorts bottom overlay. Both were placed inside the
     safe area.
  5. **Scene outlines were drawn across the labels.** WebGL writes no depth when the depth test is off, so the cards
     now use an always-pass depth test and the no-outline layer.

## Other new assets (for review)
- `3-clue-nail-patch-photo-1080x1920.jpg` shows the clue, the old door and the light under it:
  - the bare nail;
  - the clean, unfaded wallpaper rectangle (with a dust line), with the old door cutting through its middle;
  - the photo of Milo and Juno lying face-up on the floor below it, the same size as the patch;
  - the cold light under the door, broken by two soft shadows (the state after the third knock).
- `4-handle-through-the-wood-1080x1920.jpg`: the brass handle after it has pushed through the solid wood and turned,
  with crack lines and splinters.

## Design change made to pass checkpoint 2 (please confirm)
The stairwell is now **mid-hall, along the left wall** (z −4.7 to −2.1), instead of at the near end:
- the top of the stairs is at its far end, toward the old door;
- the steps go down back toward the camera, so a view down the hallway sees the risers;
- Milo, backing away from the door, stands between the door and the top of the stairs. That is exactly shot 21's
  "the door ahead, the stairwell to his side".

Shots 2 and 3 still establish the stairs: the stairwell and banister sit between Milo and the door in the wide shot,
and behind him in the reverse angle.

## Checks
- **Library:** all protected assets intact. 20 additions recorded: the hallway set, its marks and views, and the
  props hallDoor, oldDoor, photoFrame, phoneScreen and choiceLabel.
- **Reuse:** the library's existing "phone" item is reused for medium shots; a duplicate was removed.
- **Sounds:** the four new sounds (knock_heavy, phone_buzz, phone_tap, latch_click) render and pass `sound/check.py`.
- **Z-fighting:** no coplanar surfaces in the hallway.
- **Floor maps:** only the hallway's was added; the others are unchanged.
- **Tests:** `npm test` passes, and the type check is clean.

## Remaining notes (not blocking)
- **Outline notches.** A near-vertical edge (the old door's right jamb) shows the outline pass's usual small stepping
  notches at 1:1. This is engine behaviour on every slightly slanted edge, barely visible at viewing size.
- **Label B tilt.** Label B, near the left edge, has a slight perspective tilt of about 1°, from the camera's downward
  pitch.
- **Milo near the right-hand buttons.** In shot 21, Milo's right side comes close to the Shorts like and comment
  buttons. This can be refined when the final storyboard is built.
- **The caption** sits partly over Milo's lower legs in shot 21: the engine's normal rule keeps captions off faces
  only.
