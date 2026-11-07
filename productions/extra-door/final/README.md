# Video 05: The Extra Door (Part 1). Final render: QA PASSED

**Files**
- `Short-extra-door.mp4`: the final video (23.3 MB, MD5 `cc8f73e512fadfd469a9ef372140606d`).
- `Short-extra-door.qa.md`: the full QA report (cloud QA workflow, with all chunk seams).
- `Short-extra-door.contact.jpg`: the QA contact sheet.
- `../final_strip.jpg`: one mid-shot frame for each of the 21 shots.

**Not done, by instruction:** no GitHub Release was created and nothing was uploaded to social platforms.

## Source
The approved storyboard and visual corrections from commit `6df95fd`. Nothing in `animation-studio/` has changed since
that commit, so the render used the same storyboard, theme, narration, voice recordings and word timings, and the same
final soundtrack (`animation-studio/audio/Short-extra-door.mp3`).

## Render
- **Render run:** [render run 23](https://github.com/deslmao/claude-animated-shorts/actions/runs/42357045340).
  - 20 parallel chunks on GitHub Actions, all successful.
  - It took about 16 minutes from the plan to the join.
  - The join uploaded the artifact `Short-extra-door-run23`.
- **QA run:** [QA run 9](https://github.com/deslmao/claude-animated-shorts/actions/runs/42358979996) ran the
  full QA with all 19 chunk seams and committed the MP4 to the repo.

## Technical results
| | |
|---|---|
| Video | H.264 High, yuv420p, 1080×1920, 30 fps, 1681 frames = 56.033 s, about 3.2 Mb/s |
| Audio | AAC-LC, 48 kHz stereo, starts at 0.000 s, 56.033 s long (difference from the picture: 0.000 s) |
| Loudness | −14.2 LUFS integrated, true peak −1.7 dBFS |
| Soundtrack alignment | Envelope cross-correlation against the approved soundtrack: lag 0 ms, r = 1.000 |
| Duplicate frames / stalls | none |
| Frozen spans ≥ 0.5 s | none |
| Black spans ≥ 0.1 s | none |
| Near-blank frames | none |
| Corrupt or half-refreshed frames | none |
| Unexplained soft (blurred) frames | none |
| Holds settling at a hard cut | none |

## Chunk joins (local check of all 19 seams)
For each seam, the change across the join was compared with the median change between neighbouring frames.
- **16 seams** sit at a ratio of 0.6–1.7, the same as ordinary motion, so they are invisible.
- **504:** ratio 11. This is the move starting in shot 7. The approved local preview, which has no join there, shows
  the same change (10.99 against 11.22).
- **1428:** this is the hard cut into shot 19. It appears the same way in the preview (102.7 against 102.8).
- **1344:** on a static hold in shot 18, the chunk starts on a fresh keyframe. The largest pixel change is 6 of 255
  levels, and no pixel changes by more than 8, so it is invisible.

## Match to the approved previews
21 frames from the final cloud render were compared at full resolution with the same frames in the six approved local
preview clips. Luma PSNR ranges from 39.6 to 52.6 dB. That is the encoder-level difference between two separate
encodes: the cloud render reproduces the approved footage.
