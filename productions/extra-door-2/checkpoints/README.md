# Video 06: The Extra Door, Part 2. Stills and preview clips (waiting for the owner's visual approval)

This is the code storyboard, built on the approved script v2, narration and opening callback. The full render has not
started.

**Film:** 21 shots, **50.27 s** (1508 frames) at 1080×1920, 30 fps.

**Soundtrack:** `animation-studio/audio/Short-extra-door-2.mp3`, at −14.2 LUFS with a true peak of −1.6 dBFS.

## What was reused and what is new
**Reused unchanged:**
- **Engine and toolchain:** the engine, cameras, voices, captions, rendering and QA.
- **Part 1's assets:** the hallway and its stairwell, the old door (handle and shadows states), the photo's parts and
  print, the phone handset and screen design, the choice label card, and Milo.
- **Sounds:** knock_heavy (the same recording, the same −3 dB), phone_buzz, latch_click, step_floor, creak and thud.
- **Music:** the mystery mood and drop-out.

**Narration:** the approved 10 recordings, with no regeneration.

**New (production-specific, in the Extra Door theme):**
1. **The downstairs hall set.** Thirteen 0.2 m steps up to a landing, an open stairwell with a dim landing lamp, a
   banister, the corridor and the front door's place. It uses the hallway's own wall, floor, trim, door and runner
   helpers.
2. **`photoOnStairs`.** Part 1's photo lying along the steps, with a crack state.
3. **`phoneOutside`.** The same chat, with Juno's two new messages.
4. **`choiceLabelChosen` and `choiceLabelDimmed`.** Part 1's label card with the selected and dimmed states, plus the
   "YOU CHOSE B" tag.
5. **`frontDoor`.** The porch-lit frosted glass, with knocks.
6. **One sound:** `glass_crack`.

**Part 1 is completely unchanged.** Four Part 1 frames re-rendered after the changes (the photo, the phone, the old
door and the labels) are byte-identical to before. The library protection test shows no existing asset changed; the
17 additions are recorded. Every existing floor map is unchanged.

**One rule was widened for a two-line card.** Choice labels may hold a choice of up to 20 characters (the general
display rule is 18 for one-line signs). The approved "A: OPEN THE FRONT DOOR" needs it. The card wraps it onto two
lines.

## Stills (full resolution, 1080×1920, from the engine)
| File | Moment | What to check |
|---|---|---|
| `01-callback-B-selected-A-dimmed` | 0:00.8 | Part 1's final framing. B has the green outline and glow and the "YOU CHOSE B" tag; A is dimmed, desaturated and shadowed; Milo is bolting for the stairs. Crop: `crop-1to1-callback-tag-and-B.png`. |
| `02-photograph-before-his-foot` | 0:10.0 | The photo square to the lens, clearly Milo and Juno, before his foot lands. Crop: `crop-1to1-photograph-before.png`. |
| `03-photograph-cracked` | 0:11.4 | One crack in the glass, from the impact star where his foot landed, up across the glass. It is white and glassy, never a mark on the people. Crop: `crop-1to1-crack-first.png`. |
| `04-same-photograph-same-crack` | 0:14.3 | The match cut: the same framing, the same photo, the same crack (`crop-1to1-crack-match-cut.png`), his feet stopped on the step above. The two crops differ only by his shadow: 1.5 / 255 on average over the photo. |
| `05-looks-back-bare-stairs` | 0:18.7 | Thirteen ordinary steps, the landing lamp, no photograph anywhere. |
| `06-phone-first-message` | 0:25.3 | Part 1's "No, I'm still at work. Why?", then "Left work early. I'm outside, open the door?" in 4 lines at Part 1's type size. Crop: `crop-1to1-phone-first-message.png`. |
| `07-phone-window-message` | 0:30.0 | "Who's that in your upstairs window?" |
| `08-the-old-door-at-the-top` | 0:36.7 | From the foot of the flight: the old door standing at the top, where the landing was. |
| `09-light-under-the-door-two-shadows` | 0:37.7 | The cut level with the landing: Part 1's cold light under the door, broken by the two shadows. |
| `10-front-door-glass-no-shadow` | 0:38.8 | The knock: the frosted glass glowing amber, and nobody's shadow behind it. |
| `11-final-AB-choice` | 0:49.3 | Milo between the two doors (the front door behind him, the old door at the top of the stairs). A sits upper right; B sits left, below the old door, never covering it. Both are inside the Shorts safe area; the caption is clear of them. |

Stills 07–11 were taken before the final 0.27 s timing fix (see below), so their times are now 0.27 s later. The
pictures are the same.

## Preview clips (full resolution, final soundtrack): `../preview/`
| Clip | Film frames | What it shows | Frame QA |
|---|---|---|---|
| `1-callback-and-hook` | 0–233 | The vote callback; Milo bolts; the cut on "thirteen" into the run; he stops dead and the eyes cut on "fourteen?"; the recap over the old door; "You told him to run." from the top of the stairs | PASS |
| `2-the-photograph-twice` | 297–520 | "His stairs have thirteen steps." over the whole flight; the photo, the crack under his foot; the rush down; the same photo, the same crack, he skids to a stop; the landing; "…twenty-six." | PASS |
| `3-window-message-and-warning` | 830–1065 | "Come back up, Milo."; the music cuts; a beat of silence; the buzz and the window message; about 1 s of dead air, then "Don't open it. That's not me."; about 1 s of silence | PASS |
| `4-the-door-the-knocks-the-choice` | 1058–1499 (now 1066–1507) | The old door at the top, then the light and shadows under it; three knocks on the front door (glass / his head / the still old door); "…which one is her?"; the A / B choice; the latch click | PASS |

The frame QA covers each clip's frame count, duplicated frames, near-blank, corrupt and soft frames, frozen spans, and
audio presence and sync.

## Changes from the approved plans (all found at this stage)
1. **The hook's last beat.** On "fourteen?" he stops dead and the shot cuts into his eyes, as Part 1's "…eight?" did.
   A view running away from the camera reads badly in this engine (the figure is drawn in profile), so the "steps keep
   going" image is in shots 4–5 and 8–11 instead.
2. **The cameras inside Part 1's stairwell are above floor level.** The camera check counts anything below floor
   height as inside scenery, and I didn't loosen that check. Shot 2 looks down the flight from its near end; shot 3
   looks across from the hallway to the old door.
3. **The music cut.** The drop-out is anchored to the end of "Come back up, Milo." (28.53 s). The window-message buzz
   follows 0.33 s later (28.86 s), after the line's caption has cleared, so the music cuts just before the buzz.
4. **Length.** The film is 50.27 s against about 51.9 s planned. The buzz now follows the last line directly instead
   of 1.2 s later, and the knock section is 0.4 s tighter. Every approved silence is kept: 1 s before the warning,
   1 s after it, and the knocks 1.1 s apart.
5. **Juno's voice is played as recorded, as in Part 1's final mix.** My narration note had proposed a distance
   treatment; Part 1 used none, and the mixer has none. Its distance comes from the timing and the picture instead.

## Checks
- **Pipeline:** validate, assets, narration (all cached, no cost), soundtrack (−14.2 LUFS, true peak −1.6 dBFS) and
  checks (preflight including the camera clearance check, and library integrity) all pass.
- **`npm test`:** passes (0 failures). The z-fighting test found three coplanar contacts in the new banister (newel
  bases and the top spindle against the steps and the hall ceiling). They were moved 3 mm to 2 cm and now measure
  0.000 m². The stills and clips were rendered just before that fix; the change is invisible at this scale.

## Known limits (not blocking)
- **Milo on the stairs.** He moves down the flight as a smooth slope, so his feet don't plant exactly on each tread.
  The running is framed so this doesn't show; the one tread-level shot is the photo, which he crosses quickly.
- **Shot 3** shows the old door at the end of the hallway (the recap image), with Milo below the banister out of
  sight. The footsteps carry the run.
