# What If… You Could Command Anyone? (Nova): final render QA (run 36)

**Verdict: publishable.**

**Artifact:** `Short-nova-commands-run36` from [render run 36](https://github.com/deslmao/claude-animated-shorts/actions/runs/44642921500)
([direct link](https://github.com/deslmao/claude-animated-shorts/actions/runs/44642921500/artifacts/14588467092)), kept
until 20 Dec 2026. It downloads as a .zip containing `Short-nova-commands.mp4` (38.3 MB).

**How it was checked:**
- the cloud 540p preview (run 35), which the owner downloaded and uploaded here;
- a frame-by-frame inspection of that preview;
- one correction pass (six shots), each checked with stills;
- this final render.

The run shows "failed" only because its built-in check flags intended content (below).

## Passed
- H.264, 1080 × 1920, 30 fps.
- 3,844 frames, exactly the film (128.1 s).
- No corrupt frames, no black spans.
- Audio: AAC 48 kHz stereo, -14 LUFS, true peak -1.6 dBFS, starts at 0, in sync.

## Flagged, checked: all intended
| Flag | Frames | What it is |
|---|---|---|
| duplicated frames | 1249, 2453, 2470 | Not at any chunk seam (every 192 frames). They're still moments: Nova waking, the end of Mum's line before the cut, Nova's close-up. |
| near-blank frames | 940–1007 | The Dad photo card on the plain grey wall (flat by design). |
| near-blank frames | 3427–3466 | The open gate: a large flat field of daylight behind Dad and Pip. Checked with stills at 3400, 3440 and 3460: the content is correct, and Pip no longer fills the frame. |
| soft frame | 3772 | The dip to black into the end card. |
| frozen span | 66.8–67.4 s | The hold after "A hundred families ate that night." |
