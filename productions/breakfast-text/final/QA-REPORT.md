# Don't Eat It. I'm Still at Work.: final render QA

**Run 46** (cloud, 20 chunks), 21 Nov 2026: https://github.com/deslmao/claude-animated-shorts/actions/runs/44887985753
**Download:** the artifact **`Short-breakfast-text-run46`** on that run's page (Artifacts, at the bottom). No GitHub Release.

## Verdict: publishable ✅

| Check | Result |
|---|---|
| H.264, 1080 × 1920, 30 fps | ✅ |
| 2,051 frames = 1:08.4 | ✅ |
| near-blank, corrupt, unexplained soft frames | ✅ none |
| black spans, frozen spans ≥ 0.5 s | ✅ none |
| audio: AAC 48 kHz stereo, starts at 0, in sync (-0.001 s) | ✅ |
| loudness | ✅ -14.1 LUFS, true peak -1.4 dBFS |
| duplicated frames | ⚠️ one, at frame 1877: **not a seam** (see below) |

**The flagged duplicate (why the run shows "failure"):** the chunk seams fall every 102.55 frames (2,051 / 20); the
nearest are frames 1846 and 1948. Frame 1877 is inside the locked-off front-door shot (frames 1803–1881): no actors,
the door coming to rest after the last knock of the pounding, so two consecutive frames are identical. That is the
picture holding still, not a join fault. Nothing to fix.

Publishing copy and cover: `../publish/PUBLISHING.md`, `../publish/cover.jpg`.
