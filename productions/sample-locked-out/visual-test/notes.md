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
