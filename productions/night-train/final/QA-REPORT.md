# The Man on the Last Train Has No Reflection. (v3, the reflection hook): final render QA

**Run 60** (cloud, 20 chunks), 23 Nov 2026: https://github.com/deslmao/claude-animated-shorts/actions/runs/45114920085
**Download:** the artifact **`Short-night-train-run60`** on that run's page (Artifacts, at the bottom). No GitHub Release.
**QA:** https://github.com/deslmao/claude-animated-shorts/actions/runs/45118063016
(Run 50, the scream-hook version, is the one already published: post v3 as a new upload.)

## Verdict: publishable ✅
| Check | Result |
|---|---|
| H.264, 1080 × 1920, 30 fps | ✅ |
| 1,890 frames = 1:03.0 | ✅ |
| corrupt, soft frames; black, frozen spans | ✅ none |
| audio: AAC 48 kHz stereo, starts at 0, in sync (0.000 s) | ✅ |
| loudness | ✅ −14.2 LUFS, true peak −1.8 dBFS |
| duplicated frames | ⚠️ frame 172: **not a seam** (the seams are every 94.5 frames: 94, 189) |
| near-blank frames | ⚠️ frames 213–269: **the 21:47 display shot** (the same flag as run 50) |

**Why the run shows "failure" (both are intended pictures):**
- **Frame 172 (0:05.7):** the hard cut to him staring. He doesn't blink, there's no idle motion, and the push-in has
  barely started, so two frames match. Re-rendered frames 171 and 172 differ by 0.08 levels.
- **Frames 213–269 (0:07.1–0:09.0):** the LED display over the end door, a plain grey wall by design. The camera isn't
  against scenery; a re-rendered still of frame 240 shows the display clearly.

Because the check is marked failed, the workflow didn't keep the MP4 in the repo: download it from the run 60 artifact.

Publishing copy and cover: `../publish/PUBLISHING.md`, `../publish/cover.jpg`.
