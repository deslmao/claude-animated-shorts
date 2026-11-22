# I Rang Mum's Work. She Picked Up. (Don't Eat It, Part 2): final render QA

**Run 57** (cloud, 20 chunks), 22 Nov 2026: https://github.com/deslmao/claude-animated-shorts/actions/runs/45071601767
**Download:** the artifact **`Short-breakfast-2-run57`** on that run's page (Artifacts, at the bottom). No GitHub Release.
**QA:** https://github.com/deslmao/claude-animated-shorts/actions/runs/45073571699

## Verdict: publishable ✅

| Check | Result |
|---|---|
| H.264, 1080 × 1920, 30 fps | ✅ |
| 1,747 frames = 0:58.2 | ✅ |
| corrupt, soft frames | ✅ none |
| black spans, frozen spans ≥ 0.5 s | ✅ none |
| audio: AAC 48 kHz stereo, starts at 0, in sync (0.000 s) | ✅ |
| loudness | ✅ -14.1 LUFS, true peak -1.5 dBFS |
| duplicated frames | ⚠️ one, at frame 1606: **not a seam** |
| near-blank frames | ⚠️ frames 715–717: **the home-camera close-up** |

**Why the run shows "failure" (both flags are intended pictures, not faults):**
- **Frame 1606 (0:53.5):**
  - The chunk seams fall every 87.4 frames (1,747 / 20); the nearest are 1572 and 1659.
  - Frame 1606 is in the locked close-up of Bug ("Bug, run!") after the push-in has settled, so two consecutive frames match.
- **Frames 715–717 (0:23.8):**
  - This is the cut on "kitchen camera" to the little camera above the arch: a plain wall, the arch's trim and the
    white camera, low in detail by design.
  - The camera is 1.3 m from the wall, not against scenery. Re-rendered stills of frames 714 and 716 show the camera
    clearly.

Because the check is marked failed, the workflow didn't keep the MP4 in the repo: download it from the run 57 artifact.

Publishing copy and cover: `../publish/PUBLISHING.md`, `../publish/cover.jpg`.
