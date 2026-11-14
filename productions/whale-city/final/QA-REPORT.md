# The Whale City: final render QA

**Verdict: publishable.**
- Every hard technical check passes.
- The four QA flags were verified as intended content, not render defects (details below).
- The MP4 is not in this folder yet. The QA workflow only commits it when every check passes, and downloading the artifact into this session is blocked by its permission settings. How to get it is below.

**Render:** cloud run 29 ([43650769766](https://github.com/deslmao/claude-animated-shorts/actions/runs/43650769766)).
- 1080x1920, 30 fps, 20 parallel chunks, joined about 32 minutes after the run started.
- Storyboard, narration and soundtrack from commit `8aafe60` (the approved 540p preview); the request was committed as `a29695e`.
- Artifact `Short-whale-city-run29` (MP4 54.8 MB); GitHub keeps it for 30 days.
- No GitHub Release, and nothing uploaded anywhere.

**Full QA:** QA run 14 ([43654006009](https://github.com/deslmao/claude-animated-shorts/actions/runs/43654006009)), with all 19 chunk seams (158, 316, …, 3005).

## Technical checks
| Check | Result |
|---|---|
| Codec / resolution / frame rate | H.264, 1080x1920, 30 fps ✅ |
| Frame count | 3,164 frames = **105.467 s** (the approved timeline) ✅ |
| Audio/video sync | audio 105.466 s vs picture 105.467 s (difference 0.001 s); audio starts at 0 ✅ |
| Audio | AAC, 48 kHz stereo ✅ |
| Loudness / clipping | **-14.1 LUFS** integrated, **-1.6 dBFS** true peak: no clipping ✅ |
| Black spans ≥ 0.1 s / frozen spans ≥ 0.5 s | none ✅ |
| Corrupt or half-refreshed frames / unexplained soft frames | none ✅ |
| Duplicated frames at the 19 chunk joins | none at any join ✅ |
| Holds at a hard cut (informational) | frames 2031 and 2873: a single settling frame at a cut, away from the joins |
| Near-duplicate frames | ❌ flagged: 959, 1901, 1965. **False positives (below)** |
| Near-blank frames | ❌ flagged: 992–1025. **False positive (below)** |

## Caption timing
Checked against the compiled timeline the render uses: 106 caption groups over 229 spoken words.
- Every word has its caption on screen when the word starts.
- No captions overlap; the shortest is on screen for 7 frames.
- None runs past the end.

## The QA flags, checked frame by frame
The engine draws the same frame every time, so these local re-renders of the flagged frames and their neighbours match the final file. See `qa-flagged-frames.jpg`: frames 958–960, 1900–1902, 1964–1965 and 1005.
- **Frame 959 (shot 11, the tapestry's wide hole):**
  - The slow push onto the founders' tapestry eases in from a stop, so the card barely moves for a frame: mean change 0.18, against 1.49 and 0.41 either side.
  - The nearest join (949) is 10 frames away.
  - **Not visible.**
- **Frames 1901 and 1965 (shot 23, Wren: "It can't breathe! … It needs air."):**
  - This is a still close-up where only her mouth moves, and the mouth animation holds each shape for two frames.
  - So the change between frames alternates: about 1.3, then 0.2.
  - Neither frame is at a join (the nearest, 1898, is 3 frames from 1901).
  - **This is the engine's normal lip-sync cadence, not a dropped or repeated frame.**
- **Frames 992–1025 (shot 11):**
  - This is the close-up on the cream tapestry around the founders' wide, open hole, as storyboarded.
  - The detector flags the flat cream cloth.
  - **Intended insert, not a camera against scenery.**

## Visual continuity, props, framing and animation
Reviewed on the approved 540p preview of the same commit (a 1 fps contact sheet) and on stills.
- **Props present wherever the story needs them:**
  - the Fountain's 12 rings, then 13, the blast, and the open hole after;
  - the spout in each stage: low, failing, erupting with a rainbow, and an easy tall breath;
  - the pole and both pole-mark inserts (Wren's low mark, then her mark above all the others);
  - the founders' tapestry, and the bell (tied, cut free, ringing);
  - the whale's eye opening, the resting tail in the aerials and the rising tail;
  - the flood on the quay, the knife and the baby.
- **Framing:** all 36 shots pass the storyboard framing check and the camera-clearance check, with no camera inside or against scenery.
- **Continuity:**
  - day for the market and the ceremony, golden dawn for the measuring and the wake-up, night for the last breath and the bell;
  - the 12th and 13th rings stay consistent from shot to shot;
  - Wren's knife is handed over by Gran before the rope is cut.

**Known engine behaviours (accepted at the preview):**
- Wren smiles slightly between words on frightened lines (lip-sync).
- The aerial reveal shows the whale as the grey, barnacled back under the city, with its closed eye, mouth line and resting tail. The houses still cover much of it.

## How to get the MP4
1. Open https://github.com/deslmao/claude-animated-shorts/actions/runs/43650769766 while signed in.
2. Under **Artifacts**, download **Short-whale-city-run29**.
3. Unzip it to get `Short-whale-city.mp4` (54.8 MB).

GitHub's web uploader takes files up to 25 MB, so committing it here needs the download to be allowed in this session.

## Contents
- `QA-REPORT.md` (this report)
- `qa-flagged-frames.jpg`
