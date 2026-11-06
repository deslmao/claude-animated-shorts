# Video 03 "Why You Forget Why You Walked Into a Room": final video

**File:** `productions/doorway-effect/final/Short-doorway-effect.mp4` (39.1 MB)
- Rendered by GitHub Actions run 18 from the approved storyboard and soundtrack (commit 58f9280).
- 15 chunks rendered in parallel.
- No GitHub Release was created; nothing was uploaded.

## QA
**Built-in QA** (`Short-doorway-effect.qa.md`): PASSED
- H.264, 1080 × 1920, 30 fps, exactly 1946 frames (64.87 s).
- No duplicates at chunk seams.
- No black spans or frozen spans.
- AAC 48 kHz stereo, starting at 0, -14 LUFS, true peak -1.7 dBFS.
- Audio in sync with the picture: a -0.001 s difference.

**Extra checks:**
- **Exact duplicate consecutive frames:** 0 (frame hashes).
- **Blank frames:** none. The lowest picture contrast is std 21 (a flat frame would be under 6).
- **Chunk joins:** all 14 seamless. The change across each join matches the frames around it, and sharpness is
  continuous either side.
- **Transition sharpness:** 13 short dips, 1-10 frames each.
  - Every one is a whip or flight while the camera rushes.
  - The longest, 10 frames, is the whip from the hook into shot 2.
  - None falls after the camera settles. Characters stay recognisable.
  - This is the controlled-blur behaviour as designed.
- **Audio:** identical to the approved soundtrack (offset 0.0 ms, correlation 1.0000).
