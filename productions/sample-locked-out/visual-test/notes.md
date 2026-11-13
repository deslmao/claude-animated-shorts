# Locked Out: key-frame visual test (half-scale stills)
Owner-authorised limited asset creation. These are the eight key frames from `visual-plan.md` §6, staged as the plan specifies, rendered at half scale (540 x 960).
- **Storyboard:** `animation-studio/src/studio/stories/locked-out-keys.ts`.
- **Script:** unchanged (the evaluated packet `53e034eb`). Lines are timed by estimate; no narration was generated.
- **Not done:** no full video and no preview yet.

**Files:**
- `1a.jpg`, `6b.jpg`, `8b.jpg`, `11a.jpg`, `12a.jpg`, `15c.jpg`, `16a.jpg`, `19b.jpg`;
- `sheet.jpg`, all eight labelled.

## Assets
**New** (theme `lockedout`, additions only):
- **Props:**
  - `fpHands`, the first-person hands, with variants phone, job and tools;
  - `vanCab`, the cab around the driver's eye, with variant mirror;
  - `door9`;
  - `upstairsWindow`;
  - `windowLight`;
  - `shadowDecal` (built, not used in these frames).
- **Item:** `brick`.
- **Characters:** `marsh`, `rachel`, `sam`.
- **Set:** `alderRow`.

**Reused:** the `house` builder (the terrace either side and across the road), `streetLamp`, `tree` (hedge), `flowers`, `tufts`, the asphalt, pavement, concrete, grass and dirt paints, the night light preset, and the ink colour. Library protection reports *all protected assets intact*. The 26 new assets are deliberately **not yet protected**; that happens after the owner's approval.

## Timings
| Step | Time |
|---|---|
| Asset build and storyboard to the first valid check | about 11 min |
| Each full pass of 8 half-scale stills | 139–153 s (about 17 s per still, plus about 10 s of bundling) |
| Stills rendering in total, over four correction passes and the final set | about 10.5 min |
| Total, from the start of asset creation to the final stills | about 32 min |

## What the correction passes fixed
- A streetlamp and a hedge in the van's line of sight.
- Brick texture stretched per wall piece (a "plaid" pattern).
- The phone screen hidden under the hands card.
- A glove too small for the macro frame.
- The caption covering the phone's key line (reframed so the caption falls on the gloves).
- The upstairs light strip hidden by the sill bar.
- The family hidden behind the window jamb.
- Three coplanar-face z-fights. `test:zfight` is now ok.

## Limitations seen
- **Hands are flat cards** placed in front of static cameras. They change pose by stepping, not by moving, and must stay out of frame during camera glides.
- **No real reflections:** the mirror shows a drawn eyes card. There is no windscreen glass.
- **Characters are camera-facing cards:** very close shots (16a) show a large flat face.
- **Captions avoid faces only,** not props. Readable screens have to be framed above the caption band.

## 540p climax preview, beats 10–17 (owner-approved)
`climax-540p.mp4` is 540 x 960 and 47.7 s long (1,432 frames). It's **picture only**: no narration was recorded and no soundtrack was mixed, and the captions use estimated timing. `climax-540p-frames.jpg` shows it sampled at 2 frames per second.
- **Storyboard:** `animation-studio/src/studio/stories/locked-out-climax.ts`, 24 shots. The script and events are unchanged; only the staging is new.
- **Render:** 26 min 30 s (1.11 s per frame), bundle 6 s, peak memory 5.4 GB.
- **Check stills before the render:** three passes (18, 11 and 3 frames), about 8 min in total.

### Problems found (none fixed: the preview is a single authorised render)
1. **15b:** the rise starts with Marsh's face filling the frame from about 0.55 m, the flat-card look. His position between 14c and 15b also jumps. Fix: keep him at his 14c position (about 1 m away) through beat 15.
2. **15c:** the glance reads as "looking at the garden". The bay's dark panes don't read as glass seen edge-on, and the brick is barely visible. Fix: give the bay glass a lighter tone with a glint, and frame the brick larger.
3. **13:** the brick drop is too small to notice at that distance. Fix: a 0.6 s insert of it landing on the lawn.
4. **12b:** the phone going into my pocket is too dark to read. Fix: lighter jacket tones, or show the live call screen as it goes in.
5. **Static holds:** 10a (3.6 s), 12a (3.9 s) and 14c (3.6 s) have no camera motion. Fix: slow push-ins.
6. **16a:** Marsh's head drifts toward the left edge late in the shot. Fix: nudge the framing.
7. **Lip-sync:** the engine turns a speaking face into a relaxed smile between words, so Marsh's and the neighbour's lines are voiced without lip-sync. Their faces hold their emotion, but their mouths won't move once a voice is added. A real fix needs an engine change: keep the emotion while speaking.
8. **17b:** the officers stand beside him rather than visibly taking his arms. It reads, but stays static.
