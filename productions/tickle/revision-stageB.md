# Tickle revision: Stage B (implementation and testing)

Nothing was rendered in the cloud and nothing was published. Run #11 (tickle) and run #12 (pirate democracy) are
untouched. The narration is unchanged (no ElevenLabs cost); the soundtrack was rebuilt for free.

## The eight issues: what changed

| # | Issue | Fix (engine level unless noted) |
|---|---|---|
| 1 | Milo's arm out of frame at 0:08; no real self-tickling | New gesture `tickleSelf` (elbow up, hand behind the head, the other hand wiggling at the open armpit). New validator check: a hand out of the top of the frame, or out of the side when the hand is the action, is an error. Storyboard: shots 1, 2, 3, 6, 8 and 16 use it, all framed so both hands stay in shot |
| 2 | Gus never tickled Milo | New gesture `tickle` + actor field `reach: "milo"` (the hands land on the target's flank wherever they stand, computed every frame). Walks can start and stop on words. Body motion layer `moves` (squirm, stagger, hop, recoil, timed to words). Storyboard: Gus starts hidden behind Milo, sneaks round on "sneaks"... "Milo", reaches into Milo's side on "Milo"; Milo bursts out laughing on "laughs", squirms, and staggers away on "falls" |
| 3 | Background flicker at 0:14 | Root cause: z-fighting in the shared room builder (a hidden wall box in exactly the wallpaper's plane). Fixed in sets/room.ts and in every builder the new detector flagged (bookshelf, desk, chair, monitor, boards, city / oldtown buildings, ship, rowboat). New test `npm run test:zfight` (in `npm test`): all 9 sets pass (home, classroom, office and lab were 64-84 m^2 each before). The camera kick in shot 4 is removed; the stagger carries the moment |
| 4 | Stars floating away from the head | Effects now follow the head's real position (lean, tilt, bob); `stars` is a ring orbiting the crown, tilted with the head (dizzy). Marks switch sides instead of leaving the frame. New check: an effect off screen is an error |
| 5 | Cerebellum needs a visual | New animated explainer diagrams (fx/diagrams.ts), steps on words. Shot 9 `forecast`: brain, the cerebellum lights up, a signal runs to a forecast card where the predicted hand travels to the armpit and a countdown completes. Shot 10 `prediction`: your own hand lands in its predicted outline (tick, tickle meter turns down) vs someone else's unpredicted hand ("?", meter jumps): the predicted / unexpected contrast |
| 6 | Milo's head blocking 35 % of the frame | Shot 10's over-the-shoulder is replaced by Juno presenting the prediction diagram. New check: a non-subject foreground figure over 25 % of the frame is a warning; a subject's face hidden behind a nearer character is an error |
| 7 | Robot experiment with no interaction | Animated props (rig + per-frame pose after the actors). The robot arm reaches with a two-joint arm for Gus's held-out palm; its feather replays Gus's control strokes (new `operate` gesture: one hand on a control box, the other palm out, new `joystick` item), in sync for "instantly" (Gus unmoved), then 0.3 s late from "delay" with a `delay` diagram (in-sync vs delayed strokes, a stopwatch), and Gus laughs. Checks: a prop never in frame, a rig that can't reach the hand |
| 8 | Full review | Also fixed: cropped hands in shots 1 and 6, shot 3 now shows the failed attempt, shot 8 shows Milo moving as Juno speaks, shot 15's friend really tickles Milo, shot 16 Milo tries once more. Speakers keep an authored action gesture (Gus's thumbs-up) |

## Engine changes and which future videos benefit
| Change | Benefits |
|---|---|
| z-fight fix + `test:zfight` | every video using any interior set, the city or oldtown (buried treasure: home, classroom, oldtown); any new set is checked automatically |
| character rig + anchors (`rigFront`, `anchorsFront`, `Stage.anchors`) | anything that must touch or follow a character: effects, props held out, contact between characters, checks |
| gestures `tickleSelf`, `tickle` (+ `reach`), `operate` (+ palm hand) | any physical interaction: handing over, tickling, operating a machine |
| `moves` (squirm / stagger / hop / recoil); framing includes a planned stagger | any reaction that should come from the body, not a camera shake |
| head-following effects, dizzy-star halo, marks that stay on screen | every video with reaction marks (pirate democracy shot 14 and buried treasure shot 4 use stars) |
| diagrams (side / above, overlay drawing, captions avoid them, ceiling check) | every explainer video: a concept shown, not only narrated |
| animated props (rig, follow, drive with delay) | machines, tools and experiments that act on a character |
| staging checks (limbs, effects, faces, foreground, props, diagrams, reach, ceiling) + 7 new negative tests | every storyboard: caught before any render time is spent (they found real problems in the published pirate democracy and in buried treasure, fixed in their storyboards) |

## Tests (final runs, after the last engine change)
| Test | Result |
|---|---|
| `npm test` (lint + types, framing of every designed view, all 5 storyboards with the new staging checks, 17 negative cases incl. 7 new ones, library protection incl. the new gestures / item, z-fight on all 9 sets) | pass |
| `npm run test:regression` | all 9 reference frames identical; **BridgeShort 608 and 1417 identical** throughout (references for yawn-demo 150 / 350 / 560, MovesTest 200 and capabilities 20 / 85 / 185 were re-recorded deliberately in two inspected steps: the z-fight fix, then the head-following marks and the storyboard crop fixes) |
| `npm run test:sound` | pass |
| `npm run preflight -- Short-tickle` | pass: 1912 frames = 63.73 s, soundtrack fresh (-14.1 LUFS, true peak -1.5 dBFS); 1 warning (shot 6 shrug crop) |
| review sheet | 49 frames, determinism check identical |
| preview clips (half size, with sound) | 5 clips, audio length = picture length in each |

## Known limitations
- Sound: there is no giggle or robot-servo sound effect in the library yet; the tickle and robot moments use the existing automatic cues (effects, footsteps) and the music.
- Shot 6: Milo's shrug on "changed?" is slightly cropped at the side of the medium shot (a warning; it is a reaction, not the action).
- Walking characters' anchors use the front rig in the same stride (profile walk drawings are approximated).
- The staging checks sample every 0.2 s; a problem lasting less than that could slip between samples.
- A tickler must stand within about 0.6 m of the target (the hands are capped inside the character's drawing).
- The experiment is shown with a feather (the published studies used a soft brush / foam on the robot).
- Pirate democracy (run 12, published) still has the old star placement and a cropped cheer / point; its storyboard is fixed for a future replacement render, not rendered. Buried treasure's storyboard is updated; its review sheet must be regenerated before its render.
