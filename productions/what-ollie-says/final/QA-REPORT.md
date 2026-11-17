# What Ollie Says at 3 A.M., Part 1: final render QA

**Verdict: publishable.**
- Every hard technical check passes.
- The two QA flags were verified frame by frame as intended content, not render defects.
- The MP4 is not in this folder. The QA workflow commits it only when every check passes, and this session's network
  policy blocks downloading the artifact. How to get it is below.

**Render:** cloud run 30 ([43986128144](https://github.com/deslmao/claude-animated-shorts/actions/runs/43986128144)).
- 1080x1920, 30 fps, 20 parallel chunks; storyboard, narration and soundtrack from commit `4fdc6fd` (the five-fix
  correction pass).
- Artifact **`Short-ollie-1-run30`** (MP4 30.9 MB). GitHub keeps it until 17 Dec 2026.
- No GitHub Release, and nothing uploaded anywhere.

**Getting the MP4:** open the run link above, scroll to **Artifacts**, download `Short-ollie-1-run30` (a zip holding
`Short-ollie-1.mp4`).

## Technical checks (the render's own QA step)
| Check | Result |
|---|---|
| Codec / resolution / frame rate | H.264, 1080x1920, 30 fps ✅ |
| Frame count | 3,392 frames = **113.067 s** ✅ |
| Audio/video sync | audio 113.066 s vs picture 113.067 s; audio starts at 0 ✅ |
| Audio | AAC, 48 kHz stereo ✅ |
| Loudness / clipping | **-14.2 LUFS** integrated, **-1.7 dBFS** true peak ✅ |
| Black spans ≥ 0.1 s | none ✅ |
| Corrupt or half-refreshed frames / unexplained soft frames | none ✅ |
| Holds settling at a hard cut | none ✅ |
| Duplicated frames | ❌ flagged: 1627. **Intended (below).** No duplicate at or beside any of the 19 chunk joins. |
| Near-blank frames | ❌ flagged: 580–710. **Intended (below).** |

This step ran without the seam list, so it fails *every* stall, wherever it is. That's stricter than the separate QA
workflow, which only fails stalls at the joins. The separate workflow wasn't run: its result would be the same, apart
from treating 1627 as a note, and it would still stop on 580–710 without keeping the file.

## The QA flags, checked frame by frame
The engine draws the same frame every time, so local full-scale re-renders of the flagged frames match the final file.
See `qa-flagged-frames.jpg` (frames 579, 580, 645, 710, 711, 1626–1628).
- **Frames 580–710 (shot 6, the scar insert): intended.**
  - The run is exactly the shot: it starts on the cut from the kitchen (579) and ends on the cut to Kate's bedroom (711).
  - The card is Kate's open palm with the stitched scar, drawn in large flat areas of skin and background colour.
  - Its luma spread (about 48) is under the check's threshold for "camera against scenery", but the picture is complete
    and reads at phone size.
- **Frame 1627 (shot 17, "He has never called anyone Mama."): intended.**
  - Ava is mid-blink. The closed-eye frame is held for two frames (1626 and 1627, mean difference 0.16), and her eyes
    reopen at 1628.
  - The shot is a locked camera, so nothing else changes across those two frames.
  - It's 39 frames from the nearest chunk join (1696 is the next; 1526 the one before).

## Not re-checked here
- Caption timing and overlaps were checked on the compiled timeline before the render (preflight and the caption
  overlap check), and the storyboard hasn't changed since.
