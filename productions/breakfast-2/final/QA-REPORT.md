# I Rang Mum's Work. She Picked Up. (Don't Eat It, Part 2): final render QA

**Run 58** (cloud, 20 chunks, with the recap opening), 23 Nov 2026:
https://github.com/deslmao/claude-animated-shorts/actions/runs/45100148414
**Download:** the artifact **`Short-breakfast-2-run58`** on that run's page (Artifacts, at the bottom). No GitHub Release.
**QA:** https://github.com/deslmao/claude-animated-shorts/actions/runs/45101941875
(Run 57, without the recap, is superseded: don't post it.)

## Verdict: publishable ✅

| Check | Result |
|---|---|
| H.264, 1080 × 1920, 30 fps | ✅ |
| 1,986 frames = 1:06.2 | ✅ (the request said 1,987: my count from before the text got its own shot; audio and picture are both 66.200 s) |
| corrupt, soft frames | ✅ none |
| black spans, frozen spans ≥ 0.5 s | ✅ none |
| audio: AAC 48 kHz stereo, starts at 0, in sync (0.000 s) | ✅ |
| loudness | ✅ -14.1 LUFS, true peak -1.6 dBFS |
| duplicated frames | ⚠️ frames 414, 1033, 1094, 1382, 1569: **Bug blinking in locked close-ups**, none at a seam |
| near-blank frames | ⚠️ frames 954–956: **the home-camera close-up** (a plain wall, by design) |

**Why the run shows "failure" (all flags are intended pictures, not faults):**
- **The duplicates:**
  - The seams fall every 99.3 frames; the nearest to any flag is 1092 (two frames from 1094).
  - Every flagged frame is in a locked close-up of Bug, on a blink (eyes shut for consecutive frames, nothing else moving).
  - Re-rendered stills of each pair show this.
- **Frames 954–956 (0:31.8):** the cut on "kitchen camera" to the little camera above the arch. Re-rendered stills show the
  camera clearly.

Because the check is marked failed, the workflow didn't keep the MP4 in the repo: download it from the run 58 artifact.

Publishing copy and cover: `../publish/PUBLISHING.md`, `../publish/cover.jpg`.
