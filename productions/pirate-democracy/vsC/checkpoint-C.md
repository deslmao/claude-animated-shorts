# Visual Storytelling 2.0: Checkpoint C (outline stability, the treasure chest)

**Status:** footage only.
- Nothing has been rendered in the cloud, released or uploaded.
- The full Pirate Democracy video is not rendered.
- Tickle and all releases are untouched.
- No narration was regenerated.

**Watch at full resolution (1080 × 1920; each pair has the same scene and the same camera move):**

| File | What |
|---|---|
| `chest-before-after.mp4` | Pirate shot 8 (Mags, the captain, the open chest, the slow camera creep). Left: Checkpoint B, the old chest and the old ink. Right: now, the hero chest and the stable ink |
| `orbit-before-after.mp4` | A QA scene: a slow continuous orbit round the hero chest, the captain, a cannon, barrels and the rigging. This is the hardest case for crawling lines. Left: old ink. Right: stable ink |
| `chest-before.mp4`, `chest-after.mp4`, `orbit-before.mp4`, `orbit-after.mp4` | The same clips singly |
| `C-shots09-13.mp4` | The Checkpoint B carry-overs, shots 9-13 (half size, with sound) |

## What caused the flicker
- The world outlines (`look/ink.ts`) are found from a normal / depth buffer sampled **once per pixel**, so a line can
  only move in whole-pixel steps.
- On the chest, the metal bands' 1 cm side faces are seen nearly edge-on, about one pixel wide. Their crease lines
  switched on and off as the camera crept: the dashed, crawling lines.
- The heap's 26 small intersecting gold blobs crawled the same way.

## What changed (engine 2 only; every existing film renders exactly as before)
1. **Sub-pixel outlines.**
   - The outline pass renders its normal / depth buffer at 2 × 2 the output size.
   - The edge test runs at the four sub-pixel positions of each pixel and is averaged, so lines glide with the camera
     instead of stepping.
   - Line widths are unchanged in output pixels, so the look is the same.
   - Pixels far from any edge skip the other three evaluations. This is near-exact: 0.06 % of pixels change by more
     than 1 %, and they are isolated pixels at feature corners. It saved most of the cost: +52 % became +12-20 %.
2. **Minimum feature width.** A crease from a face narrower than about 2 px fades out instead of dashing on and off.
   Real folds keep their lines. This is what removed the band flicker.
3. **A hero treasure chest** (`heroChest`, a new asset; the protected `treasureChest` is untouched):
   - plank-grain wood with rounded edges;
   - brass bands and lock plate as real metal with a highlight;
   - open, one smooth gold mound with nine big turned coins and two gems, instead of 26 small blobs.
4. **A reusable stability check:** `npm run stability -- <Comp> <a-b> [--roi] [--reference] [--max-flicker]`.
   - It renders lossless frames and measures:
     - flicker (temporal second difference);
     - crawl (pixels that visibly pop);
     - sharpness.
   - With `--reference`, it also scores against a 2× supersampled render, which separates crawl from the camera's
     own motion.
   - `--max-flicker` makes it a QA gate.

### Tried and rejected (measured, not kept)
- **4× multisampled normals** (averaged inverse depth): flicker **rose** (2.69 → 3.17), and new lines appeared along
  the bands.
- **Alpha-to-coverage on character cards:** crawl rose slightly (2.48 → 2.62) and accuracy fell. It also caused DOF
  seams in an earlier experiment (noted in the bridge code).
- **A wider 5 × 5 smoothing filter:** slightly less crawl (12.5 against 13.9 per mille) but softer lines (sharpness
  −2 % more). I kept the original 3 × 3 to preserve the crisp Thinkora line.

## Measurements (lossless full-resolution PNGs, this cloud CPU)
MEASUREMENTS

## Checkpoint B carry-overs
CARRY

## Tests and safeguards
TESTS

## Honest assessment
ISSUES
