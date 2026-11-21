# The Man on the Last Train Has No Reflection.: final render QA

**Run 50** (cloud, 20 chunks), 21 Nov 2026: https://github.com/deslmao/claude-animated-shorts/actions/runs/44958301438
**Download:** the artifact **`Short-night-train-run50`** on that run's page (Artifacts, at the bottom). No GitHub Release.

## Verdict: publishable ✅

| Check | Result |
|---|---|
| H.264, 1080 × 1920, 30 fps | ✅ |
| 2,066 frames = 1:08.9 | ✅ |
| corrupt, unexplained soft frames | ✅ none |
| black spans, frozen spans ≥ 0.5 s | ✅ none |
| audio: AAC 48 kHz stereo, starts at 0, in sync (-0.001 s) | ✅ |
| loudness | ✅ -14.2 LUFS, true peak -1.6 dBFS |
| duplicated frames | ⚠️ one, at frame 1099: **not a seam** |
| near-blank frames | ⚠️ frames 246–302: **the LED display shot** |

**Why the run shows "failure" (both flags are intended pictures, not faults):**
- **Frame 1099 (0:36.6):**
  - The chunk seams fall every 103.3 frames (2,066 / 20); the nearest are 1033 and 1136.
  - Frame 1099 is inside the locked-off shot of the gangway door: he stands still in the doorway (no idle motion) and
    the door has finished opening, so two consecutive frames are identical.
- **Frames 246–302 (0:08.2–0:10.1):**
  - This is the shot of the 21:47 display over the end door: a plain grey end wall, the ceiling and the small amber
    display, low in detail by design.
  - The camera is 2.7 m from the wall, not against scenery. The half-scale still of this shot was checked before the
    render.

Publishing copy and cover: `../publish/PUBLISHING.md`, `../publish/cover.jpg`.
