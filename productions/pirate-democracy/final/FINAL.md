# Pirate Democracy: final video

**File:** `productions/pirate-democracy/final/Short-pirate-democracy.mp4` (45.6 MB). The same MP4 is also the
artifact `Short-pirate-democracy-run15` of Actions run 15, kept for 30 days.

- **Format:** H.264 1080 × 1920, 30 fps, 1871 frames (62.37 s), AAC 48 kHz stereo.
- **Sound:** -14.1 LUFS, true peak -1.8 dBFS. The audio is in sync with the picture (difference 0.001 s).
- **Content:** the approved Checkpoint D storyboard, the original 15 narration lines and the approved soundtrack.
  The signing, the shares and the merchant-ship sequence are unchanged.

## How it was made
- **Frames 0-1559** come from 10 full-resolution chunks rendered in the cloud container. In the final file they are
  bit-identical to those chunks, which are kept in `parts/`.
- **Frames 1560-1870** were rendered by GitHub Actions run 15 in 6 parallel chunks.
- The chunks were joined with the soundtrack on Actions. No frame was rendered twice.
- No GitHub Release was created.

## QA
`Short-pirate-democracy.qa.md` passes every hard check:
- codec, resolution, frame rate and exact frame count;
- no duplicated frames at chunk seams;
- audio present, not silent, starting at 0 and in sync.

**Frame 278.** The first QA run flagged it. It is the cutlass push-in settling one frame before the hard cut to
the parchment (a mean change of 0.07 against 70.7 at the cut). The frame is in the source chunk, mid-chunk, so it is
not a seam or join error. No exact duplicates exist anywhere. QA now takes the real chunk seams (`--seams`):
- a stall beside a hard cut, away from any seam, is reported as a hold;
- a stall at a seam still fails, which a negative test confirms.

The picture is unchanged.
