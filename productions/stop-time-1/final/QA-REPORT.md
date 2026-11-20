# What If… You Could Stop Time? Part 1: The Knock: final render QA (run 39)

**Verdict: publishable.**

**Artifact:** `Short-stop-time-1-run39` from [render run 39](https://github.com/deslmao/claude-animated-shorts/actions/runs/44676036942)
([direct link](https://github.com/deslmao/claude-animated-shorts/actions/runs/44676036942/artifacts/14603581063)), kept
until 20 Dec 2026. It downloads as a .zip containing `Short-stop-time-1.mp4` (29.7 MB).

**How it was checked:**
- the cloud 540p preview (run 38), which the owner downloaded and uploaded here;
- a frame-by-frame inspection of that preview, plus the owner's notes (an empty classroom; lines across the vote panels);
- one correction pass (four shots), each checked with stills:
  - pupils at their desks, seen from the back as Theo walks out;
  - a solid backing behind each vote panel, so the street's cables no longer draw across the options;
  - the chase framed closer;
- this final render.

The run shows "failed" only because its built-in check flags intended content (below).

## Passed
- H.264, 1080 × 1920, 30 fps.
- 3,334 frames, exactly the film (111.1 s).
- No corrupt or half-refreshed frames, no black spans, no unexplained soft frames, no frozen spans.
- Audio: AAC 48 kHz stereo, -14.1 LUFS, true peak -1.5 dBFS, starts at 0, in sync (difference 0.000 s).
- The 32 voice lines transcribe word for word (speech-to-text check of the committed soundtrack).

## Flagged, checked: all intended
| Flag | Frames | What it is |
|---|---|---|
| duplicated frames | 556, 563, 590 | Not at a chunk seam (every ~167 frames). Still moments: Mum's close-up, Theo's close-up at the table ("You always say that"), no rain indoors. |
| duplicated frame | 1025 | Not at a seam. The officer's held close-up, the last frame before the cut. |
| duplicated frame | 1834 | At the seam 1833/1834. Checked locally: frames 1833 and 1834 are identical in a fresh render too (mean difference 0.20, the same as the neighbouring pair 1832/1833), so this is the empty desk held still before the cut, not a seam fault. |
| near-blank frames | 1483–1544 | Mum's red coat on its hook, filling the frame (a flat colour by design). |
