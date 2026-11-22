# He Did the 6 7 Meme on a Ouija Board: final render QA

**Run 54** (cloud, 20 chunks), 22 Nov 2026: https://github.com/deslmao/claude-animated-shorts/actions/runs/45001790046
**Download:** the artifact **`Short-six-seven-run54`** on that run's page (Artifacts, at the bottom). No GitHub Release.
**QA:** https://github.com/deslmao/claude-animated-shorts/actions/runs/45003484756

## Verdict: publishable ✅

| Check | Result |
|---|---|
| H.264, 1080 × 1920, 30 fps | ✅ |
| 1,917 frames = 1:03.9 | ✅ |
| duplicated frames (all 19 chunk seams) | ✅ none |
| near-blank, corrupt frames | ✅ none |
| black spans, frozen spans ≥ 0.5 s | ✅ none |
| audio: AAC 48 kHz stereo, starts at 0, in sync (0.000 s) | ✅ |
| loudness | ✅ -14.1 LUFS, true peak -1.7 dBFS |
| "unexplained soft frames" | ⚠️ frames 775–776: **an intended picture** |

**Why the run shows "failure":**
- Frames 775–776 (0:25.8) are the first two frames of Isaac's "SIX SEVEN!" close-up, right after the hard cut from the
  board. The shot is dark and uses the background lens blur by design, so the detector reads it as soft for the moment
  before his laugh starts moving.
- Re-rendered stills of frames 773, 775, 776 and 779 show a clean cut and a sharp Isaac in every frame.

Because the check is marked failed, the workflow didn't keep the MP4 in the repo: download it from the run 54 artifact.

Publishing copy and cover: `../publish/PUBLISHING.md`, `../publish/cover.jpg`.
