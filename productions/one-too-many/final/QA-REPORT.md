# One Too Many: final render QA

**Status: the render and its QA are complete, but packaging is waiting on the file.**
- The MP4 is still a GitHub artifact: in this session the download was refused twice by the permission check.
- So it is not yet in this folder, and the checks that need the file itself (marked ⏳ below) haven't been run.

**Render:** cloud run 28 ([43576706506](https://github.com/deslmao/claude-animated-shorts/actions/runs/43576706506)).
- Storyboard, narration and soundtrack from commit `5a90a71`; the request was committed as `b35aea3`.
- 20 parallel chunks; joined about 36 minutes after the run started.
- Artifact `Short-one-too-many-run28` (the zip is 54.2 MB, the MP4 inside is 51.6 MB). GitHub keeps it until 2026-12-14.
- No GitHub Release, and nothing uploaded to YouTube, Instagram or TikTok.

**Full QA:** QA run 13 ([43579599939](https://github.com/deslmao/claude-animated-shorts/actions/runs/43579599939)), with all 19 chunk seams (191, 383, …, 3644). Its four flags were checked frame by frame (below).

## Technical checks (QA run 13, on the final MP4)
| Check | Result |
|---|---|
| Resolution / frame rate | 1080x1920, 30 fps ✅ |
| Frame count | 3,836 frames = **127.867 s** (the approved timeline) ✅ |
| Audio/video sync | audio 127.866 s vs picture 127.867 s (difference 0.001 s); audio starts at 0 ✅ |
| Audio | AAC, 48 kHz stereo ✅ |
| Loudness / clipping | **-14.2 LUFS** integrated, **-1.6 dBFS** true peak: no clipping ✅ |
| Black spans ≥ 0.1 s | none ✅ |
| Frozen spans ≥ 0.5 s | none ✅ |
| Unexplained soft frames | none ✅ |
| Duplicated frames at the 19 chunk joins | none ✅ |
| Near-duplicate frame | ❌ flagged: frame 1327. **False positive (see below)** |
| Near-blank frames | ❌ flagged: frames 10–23, 2312–2325, 3577–3622. **False positives (see below)** |
| Corrupt / half-refreshed frame | ❌ flagged: frame 2333. **False positive (see below)** |

## Caption timing
Checked against the compiled timeline that the render uses: 164 caption groups over 325 spoken words.
- Every word has its caption on screen when the word starts.
- No captions overlap; the shortest is on screen for 8 frames (0.27 s).
- None runs past the end of the film.
- Nine captions run on 2–34 frames past a cut while the narration continues across it. This is normal caption behaviour. In the frames checked, the caption sits clear of the 1979 photo's caption line; the register and plaque inserts will be confirmed on the contact sheet.

## The four QA flags, checked frame by frame
The engine renders the same frame every time. Each flagged frame and its neighbours were re-rendered at full resolution from the render's commit and measured. See `qa-flagged-frames.jpg` (rows: 1326–1328, 2332–2334, then 18 / 2318 / 3600).
- **Near-duplicate, frame 1327 (44.2 s, shot 19, "Maroon blazers"):**
  - The slow drift across the 1979 year photo eases almost to a stop for one frame. The mean frame-to-frame change is 1.62 into frame 1326, 0.10 into 1327 and 0.44 into 1328, and most of the change into 1326 is the caption swapping to "Maroon blazers".
  - It is 15 frames from the nearest chunk join (1342), so it is not a seam repeat, and the picture keeps moving on the next frame.
  - **Not visible. Not a defect.**
- **"Half-refreshed", frame 2333 (77.8 s, shot 30, the real fire bell):**
  - The bell's striker is up on frame 2333 and down on 2332 and 2334, with the ringing shake. That's the bell's ringing animation.
  - The detector looks for a frame that differs from both neighbours while the neighbours match each other, and a striker ringing at 15 Hz does exactly that.
  - The whole frame is intact: no tearing and no partial redraw. **Intended animation, not corruption.**
- **Near-blank, frames 10–23 (0.3–0.8 s) and 2312–2325 (77.1–77.5 s):**
  - These are the two fire-bell close-ups ("Every fire…" and "Then, one March morning…"): the red bell and the FIRE ALARM sign on a plain cream wall, as storyboarded.
  - The detector flags the large flat wall area. **Not a defect.**
- **Near-blank, frames 3577–3622 (119.2–120.8 s, shot 49, "Ms Okoye didn't."):**
  - This is the hold on the school's empty glass doors: nobody comes out after Leo.
  - The doors fill the frame on purpose, and the detector flags the flat blue glass. **The story beat, not a camera against scenery.**

**Verdict:** all four flags are intended content that the detectors misread. There are no black, frozen, corrupt or join-damaged frames. **Publishable**, once the two ⏳ checks below pass on the file.

## Waiting for the MP4 (⏳)
- **Soundtrack against the approved `animation-studio/audio/Short-one-too-many.mp3`:**
  - The join step re-encodes the approved MP3 to AAC at 320 kb/s (`scripts/concat.mjs`), so the MP4's audio can't be byte-identical to the MP3, by design.
  - The check that applies (as for Night Shift) is to decode both and compare the samples: correlation, offset and level.
  - The QA already confirms the length (127.866 s), loudness and true peak match the approved soundtrack (-14.1 / -1.6 at build).
- **A 1 fps contact sheet of the whole film,** with full-resolution frames at 1327, 2333 and the three flagged spans taken from the MP4 itself.

## Contents (when complete)
- `Short-one-too-many.mp4`: the final film.
- `QA-REPORT.md`: this report.
- `qa-flagged-frames.jpg`: the flagged frames, as re-rendered.
