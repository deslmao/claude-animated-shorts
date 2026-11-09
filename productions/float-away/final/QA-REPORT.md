# Float Away: final render QA (render run 26, QA run 11)

**Source:** commit `5b384f5`, rendered at `26c1cdf` (the render request only). 20 chunks on GitHub Actions, joined with
the fingerprinted soundtrack. No GitHub Release and no uploads.

**MP4:** the artifact `Short-float-away-run26` of
<https://github.com/deslmao/claude-animated-shorts/actions/runs/42596438383>, available until 9 Dec 2026. It isn't committed
here: the QA workflow keeps the MP4 only when every check passes, and this container can't reach the artifact
storage host.

| Check | Result |
|---|---|
| Codec, resolution, frame rate | H.264, 1080×1920, 30 fps ✅ |
| Frame count and runtime | 2,747 frames = 91.567 s (as planned) ✅ |
| File size | 39.0 MB |
| Audio | AAC 48 kHz stereo, starts at 0, 91.566 s against 91.567 s of picture (sync off by 0.001 s) ✅ |
| Loudness | −14.2 LUFS integrated, true peak −1.6 dBFS ✅ |
| Black spans, frozen spans, near-blank, corrupt or soft frames | none ✅ |
| The 19 chunk joins (137 … 2609) | no repeated or stalled frame at or beside any join ✅ |
| Holds at hard cuts (noted, not failures) | frames 1030, 1947, 2006 |
| Duplicated frames | ❌ frame 405 |

**Frame 405 is a false positive.** It is the first frame of the bench man's float in shot 6 (frame 375 of the 540p
preview). The idle motion pauses for a single frame (a 0.08 change against about 1.5 either side) as the float's
ease-in begins, and then the movement accelerates. It isn't a repeated render or a join problem, and it can't be
seen at 30 fps. No other check failed.
