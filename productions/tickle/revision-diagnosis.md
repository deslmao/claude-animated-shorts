# Tickle revision: Stage A diagnosis

How this was checked: the published Run #11 MP4 was inspected frame by frame (a contact sheet every 0.5 s across the
whole video, crops, and per-frame difference measurements), together with the storyboard (`src/studio/stories/tickle.ts`),
the effects code (`src/studio/fx/effects.ts`), the character engine (`characters/figure.ts`), the room builder
(`sets/room.ts`), the world and camera code (`scene/SetWorld.ts`, `camera/keys.ts`) and the render passes
(`look/StudioFilm.tsx`). Run #11 itself is untouched.

## The eight reported problems

| # | Problem | Root cause (verified) |
|---|---|---|
| 1 | Milo's arm disappears at 0:08 | Shot 2 uses the generic `raiseHand` gesture on "armpit": one arm goes straight up, out of the top of a full shot framed for a standing body. The library has no self-tickling pose at all: Milo never tickles himself, he just raises a hand. Nothing checks that raised hands stay in frame (the validator only checks heads). |
| 2 | Gus never tickles Milo (0:11–0:14) | The storyboard only walks Gus from the door to mark `b`, to Milo's right. There is no tickle gesture, no reach toward another character and no contact. Milo's "laugh" beat fires on the word "laughs", whether or not anyone touched him. |
| 3 | Background flicker around 0:14 | **Z-fighting in the room builder**, which every interior set uses. Each wall is a wallpaper face at depth 0 plus a "thickness" box whose front face also sits at depth 0, in exactly the same plane, painted plain beige (#d9d2c4). As the camera moves, the depth test picks a different winner each frame, so the wall flips between striped wallpaper and plain beige (proved by measuring the wall colour: the pale frames are the box colour; reproduced locally with every post effect switched off). Ruled out by experiment: lens blur, ink outlines, the sun's shadow box and character-card shadows (frames were identical either way). **Second cause:** the camera kick on "falls" shakes the whole frame for 6 frames (416–421), which reads as a glitch. |
| 4 | Stars float in the air | Every reaction mark is placed by `fxNear` at a fixed point beside the character's *floor mark* (1.72 m up, offset sideways). It ignores the head's real position, lean and tilt, so while Milo leans back laughing the stars hang in empty air beside him. |
| 5 | Cerebellum line has no visual (0:26–0:33) | Shot 9 is 6.9 s of Juno alone in a medium shot with two gestures. The science board prop is out of frame. There is no diagram capability in the engine: effects are small reaction marks only. |
| 6 | Milo's head fills ~35 % of the frame (0:32–0:38) | Shot 10 is an `overShoulder` camera over Milo's back. The back of his head is the foreground at large size and hides most of the frame for 5.4 s. Accidental: it carries no information. |
| 7 | Robot experiment has no interaction (0:42–0:55) | The robot arm is a static prop (props are built once per shot and never move). Shot 12 is a wide shot with Gus standing beside it; shot 13 is a close-up of Gus's face with the robot out of frame. Nothing operates the robot, nothing touches a hand, and the feather never moves. |

## Everything else found in the full review
| Time | Shot | Problem |
|---|---|---|
| 0:03 | 1 | Milo's scratching hand is cut by the top edge (same cause as #1). |
| 0:08–0:10 | 3 | "Nothing. Not even a giggle." shows only his face; the failed self-tickle should still be visible. |
| 0:16–0:18 | 6 | The scratching hand is cut by the top edge again. |
| 0:21–0:25 | 8 | Milo is cast in the shot but the camera frames only Juno; "every time you move" shows nobody moving. |
| 0:38–0:42 | 11 | Readable: Gus reads his own joke book and isn't amused. Kept. |
| 0:57–0:60 | 15 | "You'll need a friend": the friend never tickles Milo. He laughs on his own. |
| 1:00–1:03 | 16 | The payoff "...is you" shows Milo shrugging but never trying again. |
| all | home shots | The same z-fight shimmer appears whenever the camera moves in the home set (it was most visible in shot 4, while Gus walks). |

No other problems: no frozen, black or duplicated frames; lighting is consistent within each set; transitions are clean.

## The same problems elsewhere
- **Z-fighting:** shared by every interior set. "Buried treasure" uses home and classroom (not rendered yet). "Pirate democracy" uses only the ship deck (not affected).
- **Stars beside the floor mark:** "Pirate democracy" shot 14 (already published as run 12) and "Buried treasure" shot 4.
- **Raised hands out of frame:** possible in any shot with `raiseHand`, `cheer`, `pointUp` or `scratchHead`; the new check will cover all videos.
- **Characters not doing what the narration says** (e.g. the quartermaster "hands out" loot but never hands anything over): also present in the pirate videos; worth the same pass later.

## Planned fixes (Stage B)
1. **Self-tickling gesture** `tickleSelf`: one elbow up (armpit open), the other hand at the armpit with wiggling fingers. It's used in shots 2, 3 and 16, framed with headroom.
2. **Tickling another character:** Gus sneaks up behind Milo, stops at his side, and the new `tickle` gesture reaches both hands to Milo's flank with wiggling fingers. Milo's reaction starts at the touch: a squirming laugh, then a real "nearly falls over" stagger (his body leans away and recovers) instead of a camera shake. Reused in shot 15 ("you'll need a friend").
3. **Flicker:** recess the wall-thickness box behind the wallpaper face (2 mm; depth precision there is ~0.015 mm), so the two surfaces never share a plane. Remove the kick from shot 4; the stagger carries the moment.
4. **Stars:** anchor head marks to the head's real position from the pose (lean, head tilt, bob), and draw dizzy stars as a ring orbiting the head, tilted with it.
5. **Cerebellum explainer:** a new animated diagram panel in the house style (flat colours, plum ink), timed to the narration's words. Shot 9: a side-view brain with the cerebellum lighting up; a signal pulse travels to a "forecast" card showing the hand arriving at the armpit, with a countdown. Shot 10 (replacing the over-the-shoulder shot): predicted versus actual touch. Your own hand matches the forecast and the tickle meter turns down; Gus's unpredicted hand sends it to the top, the contrast you asked for.
6. **Obstruction:** shot 10 becomes Juno presenting the panel, with no foreground figure. Shot 8 frames Juno and Milo, with Milo moving his hand as the brain predicts.
7. **Robot experiment:** an animated robot arm (a new capability: props that move as a pure function of time, so chunked renders stay deterministic). Gus works a control handle with one hand and holds the other palm out; the robot's feather brushes that palm. It's in sync for "copied them instantly" (Gus unmoved), then lagging behind his control, with a visible delay indicator, for "a tiny delay" (Gus bursts out laughing). The camera frames the hand, the feather and Gus's face together.
8. **Systematic checks:** the validator will also check that hands raised by a gesture stay inside the frame, so cropped arms are caught automatically in every video.

The narration doesn't change, so there's no paid ElevenLabs regeneration. The soundtrack is rebuilt for free (the effect cues change). Existing QA is not weakened. BridgeShort must stay pixel-identical. The yawn demo and capabilities reference frames contain interior walls, so they will change wherever the z-fight showed. They'll be compared, inspected and updated deliberately, with the reason recorded.
