# I've Sold 200 Memories of the Girl I Love: final render QA (runs 42 and 43)

**How it was checked:**
- two cloud 540p previews (runs 40 and 41), which the owner downloaded and inspected;
- three approved scenes added after the first preview;
- one correction pass after the second (the city shot cleaned up, the noodles and the paper stars as close-ups),
  checked with stills;
- these two final renders, with the same picture:
  - **run 42:** the scored version;
  - **run 43:** the no-music master.

Each run shows "failed" only because its built-in check flags intended content (below).

## Run 42: the scored version
**Verdict: publishable.**

**Artifact:** `Short-memory-money-run42` from [render run 42](https://github.com/deslmao/claude-animated-shorts/actions/runs/44729815838)
([direct link](https://github.com/deslmao/claude-animated-shorts/actions/runs/44729815838/artifacts/14627246860)), kept
until 20 Dec 2026. It downloads as a .zip containing `Short-memory-money.mp4` (31.4 MB).

### Passed
- H.264, 1080 × 1920, 30 fps.
- 3,931 frames, exactly the film (131.0 s).
- No corrupt frames, no black spans.
- Audio: AAC 48 kHz stereo, -14.1 LUFS, true peak -1.6 dBFS, starts at 0, in sync (difference 0.000 s).
- The 38 voice lines transcribe word for word (speech-to-text check of the voice master).

### Flagged, checked: all intended
| Flag | Frames | What it is |
|---|---|---|
| near-blank frames | 203–205 | The flash cut into the city. |
| near-blank frames | 590–699, 911–955, 1403–1461 | The golden memory scenes (how they met, Kai at twelve, the run in the rain): low contrast under the gold light, by design. |
| near-blank frames | 3463–3563 (short bursts) | The gold flooding back over the steps. Rendered here again: frames 3460, 3465, 3480 and 3496 are identical, so nothing flickers. |
| duplicated frames | 910, 955, 1924, 1971, 2933, 3220, 3222, 3784, 3787 | None at a chunk seam (every ~197 frames). Held close-ups and still inserts (Kai at twelve, Lumi's promise, the Broker, the case of vials, the last "Always."). |
| frozen spans | 6.0–6.5 s, 74.3–74.9 s | The hold on the empty vial after the hook, and the hold before the memory counter. |
| soft frame | 3841 | The dip into the end card. |
