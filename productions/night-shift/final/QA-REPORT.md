# The Extra Door, Part 2: "Juno's Night Shift": final render QA

**File:** `productions/night-shift/final/Short-night-shift.mp4`

| | |
|---|---|
| Size | 29.1 MB |
| MD5 | `d3c4802a534a39a75ba94fd613a56966` |

**Render:** cloud run 27 ([42700074767](https://github.com/deslmao/claude-animated-shorts/actions/runs/42700074767)).
- Storyboard and assets from commit `9874599`; the request was committed as `13af0d8`.
- 20 parallel chunks; joined about 23 minutes after the run started.
- Artifact `Short-night-shift-run27`, kept until 2026-12-09.
- No GitHub Release, and nothing uploaded to YouTube, Instagram or TikTok.

**Full QA:** QA run 12 ([42705039979](https://github.com/deslmao/claude-animated-shorts/actions/runs/42705039979)), with all 19 chunk seams. It was reproduced locally on the downloaded file with identical results.

## Technical checks
| Check | Result |
|---|---|
| Codec | H.264 High, about 2.6 Mb/s; AAC-LC, 48 kHz stereo |
| Resolution / frame rate | 1080x1920, 30 fps ✅ |
| Frame count | 2,536 frames = **84.533 s** (the approved timeline) ✅ |
| Audio/video sync | audio 84.533 s vs picture 84.533 s (difference 0.000 s); audio starts at 0 ✅ |
| Soundtrack unchanged | the MP4's audio against the committed `Short-night-shift.mp3`: correlation **1.0000**, offset **0 ms**. No narration was regenerated, and the frightened takes are used for both pleading lines ✅ |
| Loudness / true peak | **-14.2 LUFS** integrated, **-1.7 dBFS** true peak ✅ |
| Black spans ≥ 0.1 s | none ✅ |
| Frozen spans ≥ 0.5 s | none ✅ |
| Corrupt / half-refreshed frames | none ✅ |
| Unexplained soft frames | none ✅ |
| Duplicated frames at the 19 chunk joins | none ✅ |
| Near-blank frames | ❌ flagged: frames 131–150 and 1859–1911. **False positive (see below)** |

## The QA flags, checked frame by frame
- **Near-blank, frames 131–150 (4.4–5.0 s):**
  - This is the "keys?!" insert: the empty three-hook key rack on plain wallpaper, as storyboarded.
  - The detector flags it because most of the frame is flat wall.
  - The rack and its empty hooks read clearly. **Not a defect.**
- **Near-blank, frames 1859–1911 (62.0–63.7 s):**
  - This is the security-camera close-up ("The camera's still watching it!").
  - The camera body, its lens and the red light sit against a white ceiling corner. The detector flags the large white area.
  - The camera is clearly the subject. **Not a defect** (this is blocking fix 2 from the preview audit, working as intended).
- **Holds at a hard cut, frames 329, 768 and 1860 (informational, not a failure):**
  - Each is a single near-identical frame pair in an almost static shot: the fake text on the phone, the lab-window test and the security-camera close-up.
  - Motion resumes on the next frame (the measured frame difference returns to normal), and none of them falls on a chunk join.
  - **Not visible as a stutter.**

**Verdict:** the one failing check is a detector false positive on two intended low-detail inserts. No black, frozen, corrupt or join-damaged frames. **Publishable.**

## Visual continuity, framing and the ending
Checked on a 1 fps contact sheet of the final MP4, plus full-resolution frames.
- **Callback, stairs, key rack, door above:** all read.
- **Kitchen and lab windows:** they show a dark, rainy night outside.
- **Gutter:**
  - The phone lies face down in the lit puddle.
  - "It only moves when I'm looking" plays over the phone.
- **Monitor:**
  - Every label is readable: SPECIMEN 8 · DAY 1, FEED LOST, FEED RESTORED, TONIGHT 21:14.
  - The door slides into the photo and folds into it.
- **Desk-photo shot:** both characters are seen from behind, staring up at the photo above the desk.
- **Wall to door:** the frame stays visible while Juno pulls at it, and the handle close-up follows.
- **Climax:**
  - Both stand with their backs to the wooden door, turned to each other.
  - Milo looks frightened and urgent.
  - Juno's eyes move from the door to Milo on "me".
- **Security camera:** its close-up is followed by Juno's close-up.
- **Switch:** Juno reaches up beside the switch, and the lever is thrown.
- **Darkness:** the exit-sign light; the drawer is shut and locked.
- **Relief:** a wide shot with both characters, the drawer and the security camera.
- **Ending:**
  - The HOME CAM "Hallway: motion" alert, then the text "Milo / I'm home. / Come let me in.", readable at full resolution.
  - A hard cut on the buzz.

**Known limitation (accepted in the 540p review):** "Stop looking! Look at me!" plays without lip sync, so that Milo's frightened face holds.
