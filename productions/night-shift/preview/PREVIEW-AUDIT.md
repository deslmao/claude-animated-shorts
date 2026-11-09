# Night Shift: 540p preview audit

`night-shift-540p.mp4`: 540x960, 2,536 frames, **84.53 s**, 11.7 MB, audio present. Render took 71 min (1.68 s/frame).
Built from commit `c135502`. Checks pass (preflight PASS; library intact). Narration unchanged; the frightened takes are
used for both pleading lines. No final render, nothing published.

## Blocking (the story or the door's rules don't read)
| # | Time | Shot | Problem | Proposed fix |
|---|---|---|---|---|
| B1 | 0:36–0:45 | 12, monitor | The screen overfills the 9:16 frame. "SPECIMEN 8" and "FEED LOST" are cut off, and the door sits at the left edge. In the third clip (TONIGHT 21:14, about 0:42–0:45) the door folds into the photo off-frame, so the shot is just a blank green screen. This is where the first rule is explained. | Pull the camera back so the clip's title and the door fit. On "Tonight", pan to the photo side of the screen. |
| B2 | 1:02–1:03 | 20, security camera | The macro insert shows an empty white ceiling corner. The security camera isn't visible, so "The camera's still watching it!" has nothing to point to. | Replace it with an explicit camera on the security camera mark, checked with one still. |
| B3 | 1:07 | 21, master switch | Juno stands facing the camera with her hands on her hips. The switch and the lever throw aren't visible, so the blackout has no visible cause. | Cut to a close insert of the switch as the lever is thrown, keeping the impact sound. |
| B4 | 0:59–1:06 | 19–20, "Stop looking! Look at me!" | Milo grins (the "determined" pose reads as a smile), and both characters face the camera, not each other. The climax ("eyes locked on each other") doesn't read. | Give Milo a tense face and turn them to face each other in profile, with the wood door behind them. |

## Minor
- **0:19 (shot 9):** at the start of the sprint, the follow camera cuts Milo's head off for about 0.3 s.
- **0:11 (shot 5):** on the fake text, the drawn smiley overlaps the "e" of "home".
- **1:13–1:15 (shot 23, relief wide):** Milo is half out of frame on the left.
- **0:20–0:21 and 0:46:** Milo looks mildly cheerful on "It only moves…" and "your desk"; a worried face would fit better.
- **0:09 (shot 4):** the climb onto the counter is a lift, and one foot hovers. It reads as "up to the window", but stiffly.
- **0:55–0:56 (shot 17):** Juno's head hides the frame she's pulling at, so the frame being stuck reads mostly from the line.

## Working well
- **0:00–0:02:** the callback (YOU CHOSE B), the run down the stairs, and the front door.
- **0:03–0:04:** the empty key rack is clear. **0:05–0:07:** the door at the top of the stairs, with the handle out, seen over Milo's shoulder.
- **0:08–0:09:** the kitchen window is clearly the way out.
- **0:12–0:18:** the incoming call with their photo, then "it's really me", then the photo turning to wood with a tiny brass handle. This is the strongest rule beat.
- **0:26–0:30:** the window test at the lab ("Prove it" / "birthday cake?").
- **0:31–0:35:** the reunion two-shot.
- **0:47–0:48:** the wall turning to wood beneath the photo. It's clear that the photo is the way in.
- **0:49–0:54:** the door speaking in Juno's voice and then Milo's, with both of them terrified.
- **0:57–0:58:** the handle macro (Part 1's image).
- **1:08–1:12:** the darkness by the exit-sign glow, the frightened pleading takes, then "Left. Down. There." and the drawer.
- **1:13–1:18:** relief, with the closed, locked drawer and the security camera visible.
- **1:19–1:24:** HOME CAM, then "Milo: I'm home. Come let me in." Readable, and the hard cut lands.

## The door's rules and the ending
- **"It moves only while watched":**
  - Clear at the phone and gutter beat (0:17–0:20).
  - The monitor (B1) and the climax (B2 to B4) don't support it yet. Once those are fixed, every beat of the rule will be on screen.
- **"The photo is the way in":** clear (0:12–0:18, 0:47–0:58).
- **Ending:** the threat is resolved visibly (darkness, the drawer locked, plain wall, relief), followed by the sting. It works.

## Proposed correction pass (one pass, for approval)
- **Fixes:** B1 to B4, plus the minor fixes if wanted.
- **Re-render:** only the affected shots at 540p: shot 12 (about 260 frames) and shots 19–21 (about 260 frames), plus about 100 frames for the minor fixes. That's about 620 frames, roughly 18 min.
- **Not touched:** narration and timing.
