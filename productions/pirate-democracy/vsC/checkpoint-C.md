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
**Stability.** Lower is better, except sharpness. Each row has the same frames and the same camera.

The chest region in Pirate shot 8 (32 frames of slow camera creep; Mags's reaching hand inside the region is real
motion, which no fix can or should remove):

| Version | Flicker | Crawl (popping px, per mille) | Worst 1 % of pixels | Sharpness |
|---|---|---|---|---|
| Before: old chest, old ink | 2.62 | 24.9 | 53.8 | 3.85 |
| Old chest, stable ink (first version: feature width + wide filter) | 2.21 | 19.1 | 38.6 | 3.69 |
| Hero chest, old ink | 2.82 | 21.8 | 47.1 | 5.48 |
| **After: hero chest, stable ink** | **2.44** | **13.9** | **31.7** | **5.35** |

Notes on the table:
- The hero chest's wood grain and metal add real detail, so sharpness is +39 % over the old chest.
- On the same hero chest, the stable ink removes **36 % of the crawl** and **33 % of the worst flicker**, for 2 %
  less sharpness.
- The heat maps show the band and lid flicker is **gone**. What remains is mostly the moving hand.

The orbit QA scene, scored against a 2 × supersampled reference of the new ink (which separates crawl from the
camera's own motion):

| Version | Error vs reference | Crawl (error jitter) | Popping px (per mille) |
|---|---|---|---|
| Old ink | 1.19 | 2.72 | 23.8 |
| **Stable ink** | **1.17** | **2.50** | **20.0** (−16 %) |

In the orbit, the world ink is only part of the motion crawl. The rest is:
- on the character cards' drawn strokes;
- on texture detail (the deck planks).

Both are the same in the old and new versions, and they don't come from the outline pass.

**Render cost and memory.** Full resolution, 4 workers on this 4-core, 16 GB container, which is the same class as a
GitHub runner:

| Scene | Old | New | Change | Peak memory |
|---|---|---|---|---|
| Chest scene, shot 8 (91 frames; hero chest and stable ink) | 4.58 s / frame | 5.39 s / frame | **+18 %** | 3.78 → 4.08 GB |
| Orbit QA scene (120 frames; ink only) | 4.31 | 4.96 | **+15 %** | 3.64 → 3.92 GB |
| **Cloud chunk 8, frames 997-1121** (the heaviest: three sets, two new characters, the match cut; ink only) | 5.68 | 6.84 | **+20 %** | 7.19 → 7.70 GB |

What this means for the full film (15 chunks on GitHub Actions):
- The slowest chunk goes from 11.8 to 14.3 min, so about +2.5 min of wall time per render.
- About +35 runner-minutes in total (free).
- Peak memory stays under 8 GB of the runner's 16.
- The +0.3-0.5 GB is the 2 × 2 outline buffer per worker.

**Determinism.** Lossless PNGs rendered with 1 worker and with 2 are **bit-identical: 18 of 18 frames**. They cover the stable ink on
the orbit, the hero chest in shot 8, and the merchant deck with the cane. A 4-worker run was killed by two container
restarts (not a render error), so I ran this lighter version, which still compares different worker counts.

## Checkpoint B carry-overs
| Checkpoint B note | Change | Result |
|---|---|---|
| Mags's writing hand hidden | She stands a step further from the page, so her arm reaches past her ponytail; the close-up looks down from higher | Her white sleeve reaches across the page and her fist sits at the quill on the signature. It reads, though her hand is still small in the frame |
| The crew's raised hands are thin on a phone | The crew raises **hats** (big shapes); a new camera beat on "company" goes close and high on the crew; the crew is staged in front of the mainmast (it was among them) | The vote reads as a wave of raised hats |
| The merchant ship looks like the pirate ship | A new **`merchantDeck`** set from the same builder: the British **red ensign** at the masthead instead of the Jolly Roger, **cargo** (crates, barrels, sacks) where the pirates have cannons, weathered tan sails. Plus a **red ensign** prop behind the master in the opening | The first thing you see is the red ensign beside the master, then tan sails |
| The cane gesture is weak | On "beat" the cane goes **up high** (`raiseHand`) while the camera eases back to a full shot, so the whole raise is in frame. The whip to the sailors moves to "into", so the raised cane holds through "beat sailors" | A clear, menacing raise; still no blow shown |
| Foreground obstruction at the merchant opening | Closer medium framing of the master and a sailor, from the other side (the old angle was behind the quarterdeck rail posts) | A clean opening: the master, a sailor, the red ensign |

## Tests and safeguards
- **`npm test`:** passes. This covers lint, typecheck, framing, every storyboard plus every negative test, library
  protection and z-fighting.
- **`npm run test:sound`:** passes.
- **`npm run test:regression`:** **9 / 9 reference frames identical, BridgeShort included.** The engine 1 ink path is
  unchanged to the pixel; the new ink is engine 2 only.
- **Library protection:**
  - No protected asset changed: the old `treasureChest`, the `shipDeck` set and its marks / views are all untouched.
  - The snapshot only gained 18 entries: `heroChest`, `redEnsign`, and `merchantDeck` with its marks and views.
  - The asset docs and floor maps were regenerated.
- **Validator:** never weakened.
  - New: a hand jump across a *hard camera cut inside a shot* is no longer compared. Cards turn to face each new
    camera, so there is nothing a viewer could see. Glides and whips are still checked.
  - Pen aiming applies only while actually writing.
  - All negative tests are still caught.
- **Not touched:** Tickle, every release, the narration. No full Pirate render; nothing uploaded.

## Honest assessment
1. **The flicker is greatly reduced, not eliminated everywhere.**
   - The chest's dashed band and lid lines are **gone**, and crawl on the chest is down 36 %.
   - Under a continuous camera orbit, world-outline crawl is down 16 %. The remaining motion crawl sits mostly on the
     character cards' drawn strokes and on texture detail, which are the same in old and new.
   - A further step would be supersampling the card strokes, which is a separate, larger change.
2. **Cost: +15-20 % per frame** at full resolution (+0.3-0.5 GB). In the cloud, that's about +2.5 min of wall time per
   full render. My recommendation is to keep it, because this is the visible quality problem you raised. If you'd
   rather save the time, engine 2 could use stable ink only on close shots.
3. **The vote** now reads as raised hats, but a pirate near the camera partly covers the middle of the shot.
4. **Mags's writing hand** is visible (sleeve to fist at the nib) but small in the frame.
5. **The hero chest's look** is a deliberate change: pale plank grain and brass, where the old chest was flat
   purple-brown. It's the same house style, with more detail.
6. **Not yet done from the 2.0 slice:**
   - in-world labels;
   - engine support for match cuts;
   - the variety / rhythm checks;
   - the remaining Pirate shots in the 2.0 style, with an honest score (Checkpoint D).
7. **The full video is not rendered.** Everything here is footage of single scenes.
