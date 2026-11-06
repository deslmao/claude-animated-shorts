# Video 03: visual defect investigation and fix

**Corrected video:** `productions/doorway-effect/final-v2/Short-doorway-effect.mp4`
- Actions run 20; 1080 × 1920, 30 fps, 1946 frames; md5 `696d3ba37849e833f93103447ee5d9fd`.
- The approved `final/` is untouched until you approve the replacement.

Both defects were in the same moment: the end of "It's just stuck back with the sofa", the zoom into the keys bubble.
They have one trigger but two separate mechanisms.

## Defect 2: the camera inside the scenery (blank cream frame, grey band)
- **Frames:** 1410-1425 (0:47.00-0:47.53).
  - 1410-1416: an almost blank cream frame.
  - 1417-1425: a tan or grey band at the top.
- **Root cause:** a camera position, not the lamp.
  - The "sofa" beat was an `insert` on the thought bubble. That move computes its camera from the bubble's size and
    a 72° angle.
  - Because the bubble is large (scale 1.4), this put the camera at x 0.20, y 2.13, z 0.06: in the dividing wall's
    doorway head trim.
  - As the insert's push settled, the camera moved to x 0.04, inside the trim and lintel.
  - The picture really was showing the wallpaper of the door head an inch from the lens. This was established from the
    camera path against the room geometry.
- **Fix:** `src/studio/stories/doorway-effect.ts`. The zoom on the keys is placed by hand inside the living room:
  - camera at (-1.55, 1.46, -0.5), below the lamp shade (bottom about 1.9 m) and 1.5 m clear of the wall;
  - a 0.6 s glide in, so it is still a zoom into the keys.

  Nothing else in the storyboard changed.
- **Validation:** I rendered frames 1380-1450 at full resolution, losslessly, and checked every frame: no blank frame
  and no band; the camera stays below the lamp. The corrected run 20 is also clean at 1395-1440.

## Defect 1: black horizontal lines (the keys bubble zoom)
- **Frames:** 1417-1425 (0:47.23-0:47.53), across the lamp, the wall, the bubble and the keys.
- **Root cause:** the outline (ink) pass.
  - It draws its own normal and depth buffer with a single override material set to **double-sided**.
  - The picture culls back faces; most materials are single-sided.
  - With the camera inside the door-head box, the outline buffer saw that box's inner faces, which the picture never
    draws, and inked their edges. Those are the thin lines across everything in frame.
- **Evidence:**
  - **Not encoding or chunk assembly:** a freshly rendered still reproduces the lines, with no encoding and no joining.
  - **Not motion blur, depth of field or bloom:** with the outline pass off, the lines vanish; switching those other
    passes off as well changes nothing more.
  - **Not the thought bubble or a buffer refresh:** the same frame with the old camera and the fix shows no lines,
    while the real door-head band (defect 2) is still there.
- **Fix** (`src/studio/look/ink.ts`; engine 3, opt-in, so earlier films render exactly as approved):
  - The outline buffer now skips the faces each material culls, but only within **0.6 m of the lens**. That is
    exactly where phantom faces come from.
  - My first version applied this everywhere. Comparing that render (run 19) frame by frame against the approved one
    showed that it also dropped the inner-rim outlines of open shells (the bowl of keys, the lamp shade) that every
    approved film has. So the culling is limited to the lens, and frames away from it render identically to the
    approved outlines (A/B stills).
- **Validation:**
  - With the original bad camera and engine 3, frame 1418 shows no phantom lines.
  - Frames come out identical with 1 and 2 render workers.

## Do the defects share a cause?
**They share a trigger, not a mechanism.**
- The trigger is a camera inside scenery.
- The blank frame and band were the picture correctly showing the wall at the lens.
- The lines were an outline-pass bug that only appears when the camera is inside or against geometry.

Fixing the camera alone would have hidden the outline bug, and it could have surfaced again in any later video, so
both are fixed.

## Other scenes
- The new camera check ran over every storyboard:
  - none of them has a camera inside scenery or within 25 cm of it;
  - Pirate Democracy has one note: a brief look past the rigging in shot 10, intended, approved, and not a fault.
- The corrected Video 03 differs from the approved render only at frames 1410-1429. Elsewhere the differences are
  uniform encoding and rendering noise between GitHub runners: mean luma difference 0.24 (at most 0.74) out of 255, and
  no outline added or lost.

## Permanent protection (Video 04 and every future production)
1. **Camera clearance** (`src/studio/story/clearance.ts`).
   - It builds each set's real geometry, rasterises it into a 5 cm occupancy grid, and checks every frame for:
     - a camera inside scenery;
     - scenery within 25 cm in front of the lens;
     - the line of sight to the frame's target blocked by scenery for more than 6 frames.
   - Whips and zoom-throughs are exempt while they rush. A beat can mark an intended foreground with `blockOk`.
   - It runs in `npm test` (`test:camera`) and in `preflight`, which runs before every Actions render:
     - it **fails** engine-3 productions;
     - it only reports on films approved earlier.
   - Negative tests confirm it catches Video 03's original insert and a camera behind a wall.
2. **Frame QA** (`scripts/lib/frame-checks.mjs`, in `qa.mjs`, which runs on every render) adds hard checks for:
   - near-blank frames (60 % flat for 3 or more frames);
   - corrupt or half-refreshed frames (a frame unlike both its neighbours while they match each other);
   - unexplained soft frames (soft while the picture is still).

   Calibration:
   - the defective render **fails** (frames 1410-1413);
   - the clean Pirate Democracy final passes;
   - a synthetic negative test (`test:qaframes`) proves each check fires.
3. **Render regression frames:**
   - `Short-inkparity-qa` frame 1418: the original bad camera on engine 3 must show no phantom lines;
   - Video 03 frame 1690: the bowl must keep its rim outlines.
4. **Soundtrack seed:** a render-engine change no longer re-randomises a soundtrack.
   - Moving from engine 2 to 3 had altered the approved score: correlation 0.88 with the approved mix.
   - Engine 3 and later now seed as engine 2.
   - The soundtrack is **bit-identical** to the approved one.

**Honest limit:** I did not ship a pixel detector for phantom scanlines. In this ink style, real thin outlines (deck
planks, rails, dado lines) look the same as a phantom line in a single frame. Every heuristic I tested either missed
the defect or flagged clean Pirate Democracy frames. That class is closed at its source instead: by the outline fix, the
camera check that prevents its trigger, and the regression frame.

## Checks on the corrected render (run 20)
- **Cloud QA PASSED:**
  - 1080 × 1920, 30 fps, exactly 1946 frames;
  - no seam duplicates, no near-blank, corrupt or unexplained soft frames;
  - no black or frozen spans;
  - -14 LUFS, true peak -1.7 dBFS; audio in sync to 0.001 s.
- **Duplicate frames:** 0 exact consecutive duplicates.
- **Chunk joins:** all 14 seamless.
- **Audio:** identical to the approved soundtrack (offset 0.0 ms, correlation 1.0000). Narration, captions and every
  other approved shot are unchanged.
- **Tests:** `npm test` (including `test:camera`, `test:blur`, `test:qaframes`) and `preflight` pass.
- **Regression:** BridgeShort and every approved reference frame identical.

## Publishing package
The recommended covers (0:01.8 and 0:36.0) are far from the fix and are unchanged, so the package stays valid. If you
approve the corrected video, it replaces `final/` and the package's md5 line will be updated.
