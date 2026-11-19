# What Ollie Says Part 2: final render QA (run 33)

**Verdict: publishable.**

**Artifact:** `Short-ollie-2-run33` from [render run 33](https://github.com/deslmao/claude-animated-shorts/actions/runs/44446502088)
([direct link](https://github.com/deslmao/claude-animated-shorts/actions/runs/44446502088/artifacts/14494508991)), kept
until 19 Dec 2026. It downloads as a .zip containing `Short-ollie-2.mp4` (58.3 MB).

The run shows "failed" because its built-in quality check flags intended content (below). The MP4 itself rendered and
uploaded.

## Passed
- H.264, 1080 × 1920, 30 fps.
- 5,382 frames, exactly the film (179.4 s, under the 3:00 Shorts and Reels limit).
- No corrupt frames, no black spans.
- Audio present (AAC 48 kHz stereo): -14.2 LUFS, true peak -1.6 dBFS, starts at 0, in sync (0.000 s difference).

## Flagged, checked: all intended
| Flag | Frames | What it is |
|---|---|---|
| duplicated frames | 1482, 2776, 5058 | Not at any of the 19 chunk seams. They're still moments, and the same frames are still in the local preview (difference 0.00–0.08). 1482 is the held last frame of Mum's confession before the cut. |
| near-blank frames | 2241–2300, 2359–2424, 2783–2890, 3099–3176 | The flat, dark close-up cards: the door lock, "your door doesn't lock", the lock turning open, the hand on the handle. Low detail by design. |
| soft frame | 5325 | The dip to black into the end card. |
| frozen spans ≥ 0.5 s | 10 spans | Held close-ups and still cards (the photo, the calendar, the lock, the door gap). |

The 540p preview (`../preview/ollie-2-preview-v2.mp4`) was watched in full, and the corrected shots were checked
frame by frame before this render.
