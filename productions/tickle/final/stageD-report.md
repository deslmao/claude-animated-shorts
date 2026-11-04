# Tickle revision: Stage D final QA report

**Result: every check passed.** The final MP4 is saved as a new GitHub pre-release,
[`video-Short-tickle-run13`](https://github.com/deslmao/claude-animated-shorts/releases/tag/video-Short-tickle-run13).
It is **not** on YouTube and is not marked as a full ("latest") release. Run #11 and run #12 are untouched; their publish
times are unchanged. The repository is public, so, like runs #11 and #12, anyone with the link can download this
pre-release.

- **Video:** `productions/tickle/Short-tickle.mp4`, 32.5 MB.
- **Render:** cloud render [run #13](https://github.com/deslmao/claude-animated-shorts/actions/runs/41744276526), 20 chunks.
- **Source:** the approved Stage C version (commit `072b0d4`). The render-request commit adds no code changes.

## 1. Pre-render checks
| Check | Result |
|---|---|
| `npm test` (lint, typecheck, framing of 37 designed views, 5 storyboards + negative cases, library protection, z-fight on all 9 sets) | pass |
| `npm run test:sound` (every effect / bed / mood renders; catalogue matches) | pass |
| `npm run test:regression` (latest run, after the last engine change) | 9 / 9 reference frames identical, BridgeShort included |
| `npm run preflight -- Short-tickle` | **PASS**: 1912 frames = 63.73 s, 16 shots, 16 narration lines, soundtrack fresh. One warning: in shot 8, Juno's presenting hand touches the right edge of the frame. It isn't the action, so the validator classes it as a warning |

## 2. Soundtrack, captions, frames, synchronisation (before the render)
| Item | Value |
|---|---|
| Soundtrack | `audio/Short-tickle.mp3`, 48 kHz stereo, fingerprint matches the storyboard. -14.1 LUFS integrated, true peak -1.6 dBFS. Voice -20.0 LUFS, music 10 LU under the voice, ambience 20 LU under, 50 effect cues |
| Captions | 98 groups for 199 words, in order, no overlaps; clear of every face and diagram |
| Frames | 1912 at 30 fps = 63.733 s, 1080 x 1920 |
| Narration | George, speed 1.10, all 16 lines from the existing (paid-once) clips; no regeneration |

## 3. Post-render QA (the final MP4)
| Check | Result | How |
|---|---|---|
| codec / size / rate | H.264 yuv420p, 1080 x 1920, 30 fps | ffprobe |
| frame count | **1912** decoded = expected 1912 | ffprobe `-count_frames` |
| frame integrity | **no decode errors** in a full decode; no duplicated frames at chunk seams | `ffmpeg -v error -f null`; workflow QA |
| chunk seams | frame-to-frame change at the 19 seams is 0.3-5.6 times the median: normal motion, no pops. The large changes are all cuts or the white flash. In shot 1, frames 83-85 are an eased gesture change plus the question mark appearing | own motion scan, frames viewed |
| black frames | **none** (threshold 0.05 s) | blackdetect |
| frozen frames | **none** of 0.5 s or more | freezedetect |
| audio | AAC 48 kHz stereo, starts at 0.000 s, length 63.733 s = picture 63.733 s | ffprobe |
| loudness | **-14.1 LUFS** integrated, true peak **-1.7 dBFS**, LRA 1.4 LU (YouTube normalises to about -14) | ebur128 |
| synchronisation | the video's audio against the approved soundtrack: **0.0 ms offset, correlation 1.000** in 5 windows (0.5, 15, 30, 45, 60 s), so no drift | own cross-correlation; workflow: lag 0 ms |
| visual consistency | all 49 approved review frames against the same frames of the cloud render: PSNR 29.3-33 dB (median 32.6). That is the expected level for a half-size JPEG against a downscaled full frame; side by side the content is identical | `final/visual-compare-frame373.jpg` (the lowest score) |
| workflow QA | PASSED (codec, size, rate, frames, seams, audio present / not silent / at 0 / length) | `final/qa.md`, `final/contact_sheet.jpg` |

## Not done (needs your separate approval)
- **YouTube upload:** not done.
- **Promoting the pre-release to a full release, or replacing run #11 as the published tickle video:** not done.
