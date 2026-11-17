# 4,012 Steps: final render QA

**Verdict: publishable.**
- Every hard technical check passes.
- The two QA flags were verified as intended content, not render defects.
- The MP4 is not in this folder. The QA workflow commits it only when every check passes, and this session's network
  policy blocks downloading the artifact.

**Render:** cloud run 31 ([44008878460](https://github.com/deslmao/claude-animated-shorts/actions/runs/44008878460)).
- 1080x1920, 30 fps, 20 parallel chunks, from commit `19ad0f4` (the owner-approved 540p preview v2).
- Artifact **`Short-steps-4012-run31`** (MP4 22.3 MB). GitHub keeps it until 17 Dec 2026.
- No GitHub Release, and nothing uploaded anywhere.

**Getting the MP4:** open the run link above, scroll to **Artifacts**, and download `Short-steps-4012-run31`. It's a zip
holding `Short-steps-4012.mp4`.

## Technical checks (the render's own QA step)
| Check | Result |
|---|---|
| Codec / resolution / frame rate | H.264, 1080x1920, 30 fps ✅ |
| Frame count | 2,757 frames = **91.900 s** ✅ |
| Audio/video sync | audio 91.900 s vs picture 91.900 s; audio starts at 0 ✅ |
| Audio | AAC, 48 kHz stereo ✅ |
| Loudness / clipping | **-14.1 LUFS** integrated, **-1.7 dBFS** true peak ✅ |
| Black spans ≥ 0.1 s; corrupt or soft frames; holds at a cut | none ✅ |
| Duplicated frames | ❌ flagged: 904. **Intended (below).** It's 61 frames from the nearest chunk join. |
| Near-blank frames | ❌ flagged: 0–102, 207, 220, 528–810, 2639–2756. **Intended (below).** |
| Frozen spans ≥ 0.5 s (a measurement only) | 22.1–22.6, 33.3–33.9, 52.5–53.0, 53.1–53.6 s: the still phone-screen cards between their state changes |

## The QA flags, checked frame by frame
The engine draws the same frame every time, so local re-renders match the final file. See `qa-flagged-frames.jpg`
(frames 50, 210, 700, 2700, 902–905).

**Near-blank: the light phone-screen cards, intended.** Every flagged frame falls on one of them. They're complete,
readable designs made of large flat areas of near-white UI, which falls under the check's detail threshold:
- 0–102: shot 1, the opening 4,012 screen;
- 207 and 220: shot 3, the route map;
- 528–810: shots 7–8, the morning screen and the history back to June;
- 2639–2756: shot 26, the closing 4,012 screen (the loop).

**Duplicate at 904: intended.** It's the last frame of shot 9, the slow push-in on "you" ("…and you watch the counter").
- The move eases to a stop, so 903 → 904 barely changes (mean difference 0.16).
- The hard cut to the counter card follows at 905 (difference 66.8).
