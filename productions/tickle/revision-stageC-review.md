# Tickle revision: Stage C review

## Cycle 2 re-review (after the nine approved corrections)

**Verdict: 85 / 100, exactly on the target, with no critical failures.** It is ready for your review, not for an
automatic Stage D. There is no margin: the hook is unchanged and is still the weakest category, and the new sound
effects (synthesised giggles) have not been heard by a person. I could only measure them. Nothing has been rendered in
the cloud or published. Run #11 and run #12 are untouched.

### How it was reviewed
- **The review sheet:** `productions/tickle/review.jpg`, 49 frames, regenerated after the last engine change. The
  determinism check is identical.
- **Six preview clips:** in `productions/tickle/preview/`, half size, with the rebuilt soundtrack (shot 14 is a new clip).
  Each was checked on contact sheets (4-10 fps) and with frame-to-frame change measurements. The robot was also measured
  by tracking the feather and the control lever in every frame.
- **The automated checks:**
  - `npm test` and `npm run test:sound`: pass;
  - `npm run test:regression`: 9 / 9 reference frames identical, BridgeShort included. No reference needed updating;
  - preflight: PASS. The soundtrack is -14.1 LUFS, true peak -1.6 dBFS.
- **Not watched in motion:** shots 1-3, 5-8, 11 and 16 have no preview clip. They were checked only as stills on the
  review sheet.

### The nine corrections: what changed and how it was checked
| # | Correction | Result | Evidence |
|---|---|---|---|
| 1 | Shot 10: own touch only, meter at zero; the surprise comparison moves to shot 14 | **done.** Shot 10 shows one large body with the predicted (dotted) hand at the armpit. The hand lands on "lands", the tick comes on "predicted", the meter drops on "down", and it sits at zero with a green zero mark on "no tickle". There is no surprise example in this shot. Shot 14 shows the new `contrast` panel: your touch (tick, meter low) above someone else's (?, !, meter high), and the surprise row lights up on "surprise" | clip `shot10-prediction`, `stageC2/e2-...`, clip `shot14-contrast`, `stageC2/e3-...` |
| 2 | Robot: visible stroke, visible lag, framing | **done.** The feather is bigger and pink, and the tip sweeps 13 cm. The robot sits closer and shots 12-13 are framed medium. Measured: the feather sways about 23 px (half-size standard deviation), 4-9 times more than before. It follows the lever with **0 s lag** in sync and **0.30 s lag** after "delay". The fix that made it visible was a reusable rig change: the old stroke ran toward the lens, so it never showed on screen | clip `shot12-13-robot`, `stageC2/e5-...sync-strip`, `e5-...lag-strip`, `e6-...` |
| 3 | Gesture easing 0.15-0.4 s, deterministic | **done (previous commit).** Clips 1-6 show no single-frame arm pops; every large frame-to-frame change is a cut, a crossfade or the planned stagger. The `arm snaps` negative test passes | motion measurements, `npm test` |
| 4 | Diagrams visible from frame one, no blank areas | **done.** The forecast panel starts with the brain and a faded forecast card, which comes up to full strength on "forecast". The prediction and contrast panels are complete from frame one. The delay panel starts with both strokes, each labelled with a hand or a feather icon. The countdown now ticks within the shot | `stageC2/e1-...`, clips |
| 5 | Shot 4 floating burst | **done.** It is removed, along with the same mark in shot 13. The dizzy stars stay on Milo's head | `stageC2/e4-...` |
| 6 | Shot 8 framing | **done.** Milo stands next to Juno, on her left so his raised elbow stays in frame, in a medium two-shot | `stageC2/e7-...` |
| 7 | Shot 11 open book | **done.** New `read` gesture (both hands, eyes down) and an `openBook` item with lines of text. Gus reads it, smiles at "joke" and is deadpan on "punchline" | `stageC2/e8-...` |
| 8 | Four sound effects | **done, measured but not heard.** `giggle`, `feather_swish`, `servo` and `stumble` were added to the free library and are cued automatically: a tickled actor laughs, an actor staggers, or a machine is driven. They are mixed 13-19 LU under the voice. The cue sheet places them at 12.7 s and 14.0 s (shot 4), on every robot stroke in shots 12-13 (the gap after "delay" follows the lag), and at 54.1 s and 58.4 s (giggles). `test:sound` passes. No paid narration | `audio/Short-tickle.cues.md` |
| 9 | Polish | **done.** Shots 3 and 6 are widened, so the elbow and the shrug fit. Juno points up at the panels in shots 9, 10 and 14: the point-up gesture is now angled clear of the head, because her hair hid it before. Captions in the diagram shots now sit under the presenter's chin instead of on her forehead (engine: captions keep clear of the face as drawn). Captions also keep clear of a tickle contact point | `stageC2/e9-...`, `d1-...` |

Also fixed: the pipeline used to keep an old review sheet after an engine change, because it only checked the
storyboard. It now marks the sheet stale whenever any engine source file changes, so a stale sheet can never be passed
with `--reviewed`.

### Scores (cycle 2)
| Category | Before | Now | Why |
|---|---|---|---|
| Hook and retention (15) | 11 | **11** | Unchanged. The relatable question and the attempt on screen within 2 s are good. But the first 1.5 s is still a static pose with crossed arms, and the hook frame has no visual surprise (`stageC2/d2-...`) |
| Storytelling (15) | 12 | **13** | The arc is complete and the joke-book beat now plays: Gus reads his own joke and stays deadpan. Shot 14 is only 1.8 s, so the comparison is a quick beat rather than a moment |
| Scientific accuracy (15) | 13 | **14** | The contradiction is gone: every panel matches its words. The robot's 0.30 s delay matches the published study, where a delay of a few hundred milliseconds made self-touch feel ticklish again. One deduction remains: a feather stands in for the study's soft material |
| Character animation (15) | 10 | **13** | Gestures ease, and the walk ends with a turn. The robot visibly brushes the palm and lags. Gus reads, and Milo squirms and staggers. Deductions: Juno's point is still subtle (a white sleeve against a light wall), and the feather covers Gus's palm, so the palm itself barely shows |
| Visual storytelling (15) | 10 | **13** | No blank panels, the prediction panel is redesigned and readable, the contrast panel is clear, and in-sync versus delayed now shows in the machine as well as on the panel. Deductions: the delay panel's lower right is empty for about 1.5 s before "instantly", and the shot 14 panel is on screen only 1.8 s |
| Cinematography (10) | 7 | **8** | Shots 8, 12 and 13 are tighter and shots 3 and 6 fit. Deductions: shot 3 cuts from one full shot of Milo to another, which feels close to a jump cut. Captions in shots 9, 10 and 14 sit low (80 %), close to YouTube's bottom overlay |
| Audio and narration (10) | 7 | **8** | The narration and its sync are unchanged and exact. The tickle, robot and stumble moments now have sound, mixed under the voice. Not 9 or 10, because no person has heard the synthesised giggle yet, and a voice-like synth can sound artificial |
| Brand consistency (5) | 5 | **5** | Cast, palette, ink, captions and sets are consistent |
| **Total** | **75** | **85** | |

### Critical failures
**None.**
- The shot 10 contradiction is fixed.
- No missing or disappearing objects.
- No arm pops.
- No flicker.
- No floating effects.
- Captions never cover an eye or a mouth, and never cover a diagram.
- Audio length equals picture length in every clip.

### Remaining defects
| # | Time | Shot | Defect | Severity | Screenshot |
|---|---|---|---|---|---|
| 1 | 0:00.0-0:01.5 | 1 | The hook opens on a static, crossed-arms pose; nothing surprising in the first frame | moderate (retention) | `stageC2/d2-shot01-hook-static.jpg` |
| 2 | 12.7 s, 54.1 s, 58.4 s | 4, 13, 15 | The synthesised giggle has not been heard by a person. Its level and timing are measured, its character is not | moderate (risk) | (cue sheet) |
| 3 | 0:55.0-0:56.8 | 14 | The new comparison panel is on screen for only 1.8 s, and the line can't be lengthened without new narration | moderate | `stageC2/e3-...` |
| 4 | 0:26.0, 0:32.8, 0:55.1 | 9, 10, 14 | Juno's point-up reads only weakly: a white sleeve against the light lab wall | minor | `stageC2/d1-shot09-point-subtle.jpg` |
| 5 | 0:49.2-0:50.7 | 13 | The delay panel's lower right is empty until the tick on "instantly" | minor | (clip 4) |
| 6 | 0:26-0:38, 0:55-0:57 | 9, 10, 14 | Captions sit at 80 % height, under the presenter's chin. They are clear of the face and the panel, but close to YouTube's bottom overlay | minor | `stageC2/e1-...` |
| 7 | 0:08.4 | 3 | The cut from shot 2 (full shot of Milo) to shot 3 (full shot of Milo from another angle) feels close to a jump cut | minor | (review sheet, 249 / 254) |
| 8 | 0:42-0:55 | 12-13 | The feather covers Gus's palm, so you see the feather on the end of his arm rather than on an open hand | minor | `stageC2/e6-...` |
| 9 | 0:45-0:55 | 12-13 | A servo and a feather sound play on every stroke (20 times in about 10 s). They are quiet (-18 / -19 LU), but could feel repetitive | minor (risk) | (cue sheet) |

### Ready for the final render?
**On the scores, yes: 85 / 100 with no critical failures. But it is your call, and I recommend you watch the six clips
first,** especially `shot04-tickle` and `shot12-13-robot` with sound, to judge the giggle and the robot sounds by ear.
If either sounds wrong, I can turn them down or off for free and rebuild in minutes. The hook (defect 1) is the one
place a further change would clearly raise the score. That would be a new opening action, which is a creative choice
for you. Stage D, the cloud render and publishing all wait for your explicit approval.

---

## Cycle 1 review (for the record; the score that started cycle 2)

**Verdict (cycle 1): not ready for the final render.** Score **75 / 100**, below the 85 target. **One critical failure:** at 0:37 the
narration and the diagram contradict each other. Nothing has been rendered in the cloud or published. Run #11 and run #12
are untouched.

### How it was reviewed
- **The review sheet:** `productions/tickle/review.jpg`, 49 frames, every shot at its first, middle and last frames.
- **Five preview clips:** in `productions/tickle/preview/`, half size, with the soundtrack. Each was checked frame by frame on contact sheets (10 and 6 frames per second), with frame-to-frame change measurements to catch pops, teleports and flicker, and with crops of contact points.
- **The automated checks:** `npm test`, the pixel regression and preflight, all passing (see `revision-stageB.md`).

Passing the automated checks was not taken as visual approval.

### Stage B close-out
| Item | Status |
|---|---|
| 49-frame review sheet | done (determinism check identical) |
| 5 preview clips | done; audio length = picture length in each |
| soundtrack + metadata | rebuilt from the final storyboard (-14.1 LUFS, true peak -1.5 dBFS), preflight PASS, committed |
| working tree | clean; everything pushed to `claude/admiring-hopper-kbrb3d` |
| regression | 9 / 9 reference frames identical, BridgeShort identical |

### Scores
| Category | Score | Why |
|---|---|---|
| Hook and retention (15) | **11** | Relatable question, and Milo tries it on screen within 2 s. But the first 1.5 s is a static pose with crossed arms, and the hook frame has no visual surprise |
| Storytelling (15) | **12** | Clear arc: attempt, Gus's tickle works, why, prediction, experiment, payoff with a friend, punchline. Shot 11 (a joke you wrote yourself) is weak: Gus only holds a closed book |
| Scientific accuracy (15) | **13** | The cerebellum forecast, sensory attenuation and the delayed-robot result match the research. Two deductions: the 0:37 diagram moment contradicts the words (below), and the experiment is shown with a feather (the study used soft material, close enough for the idea) |
| Character animation (15) | **10** | The interactions now really happen (self-tickle, Gus reaching into Milo's side, squirm, stagger, the robot at the palm, the friend). But gestures snap from one pose to the next with no easing (0:12.5). The robot's brushing stroke is too small to see (0:46-0:55). The profile-to-front turn at the end of a walk is instant |
| Visual storytelling (15) | **10** | The diagrams explain the forecast clearly. But two panels start empty for over a second (0:26, 0:49). The prediction panel's lower half is empty for 4 s. In-sync versus delayed shows only on the panel, not in the robot |
| Cinematography (10) | **7** | Compositions are much improved: no obstruction, diagrams stacked for 9:16, stable background. Shot 8 frames Juno and Milo small and far apart (0:21-0:25). Shot 13 frames the robot small. Small crops in shots 3 and 6 |
| Audio and narration (10) | **7** | George's narration, -14.1 LUFS, true peak -1.5, sync exact in all clips, music moods follow the story. But the new actions have no sound: no giggle, no feather swish, no robot whirr, no stumble |
| Brand consistency (5) | **5** | Cast, palette, ink, captions and sets consistent throughout |
| **Total** | **75 / 100** | |

### Critical failures
1. **0:37.0-0:37.9 (shot 10): the narration and the visual contradict each other.**
   - On the words "No surprise, no tickle", the panel adds the *surprise* row: Gus's hand, a "?", the tickle meter jumping to red, and a "!".
   - So the viewer hears "no tickle" while the strongest thing on screen says "big tickle".
   - The contrast itself is correct science, but it lands on the wrong words.
   - Screenshot: `stageC/d1-shot10-contradiction.jpg`.

There are no other critical failures:
- no missing or disappearing objects;
- no major animation errors;
- no flicker (the wall z-fight is gone; the background measurements are steady);
- captions are readable and never over a face or a diagram;
- audio sync is exact.

### The five preview clips
| Clip | Result | Notes |
|---|---|---|
| 1. Shot 4: Gus sneaks up, tickles, Milo reacts, dizzy stars | **pass, with 2 defects** | Gus waits behind Milo, sneaks round on "sneaks", is hidden behind him briefly, steps out on his right and reaches into Milo's side on "Milo". Milo stays deadpan, bursts out laughing 0.35 s later on "laughs", squirms, and staggers away from Gus on "falls". The stars orbit his head, tilted with it. The background is stable. Defects: the "burst" mark floats by the curtain between the heads (0:13, `d4`), and Milo's arms snap from the self-tickle to holding his belly in one frame (0:12.5, `d5a` / `d5b`) |
| 2. Shot 9: cerebellum forecast | **pass, with 2 defects** | Every step lands on its word: brain, cerebellum lights up, signal, forecast card, hand travels to the armpit, countdown fills on "any moment now". Defects: the panel is empty for 1.1 s at the start (`d2`), and the forecast card's hand is small at phone size. Juno's presenting hand is below the frame (she never visibly gestures at the panel) |
| 3. Shot 10: predicted versus unexpected touch | **fail** | The top row works: the hand lands in its predicted outline, a tick on "predicted", the meter drops on "down". The surprise row then lands on "No surprise, no tickle" (the critical failure above), and the lower half of the panel is empty for the first 4 s |
| 4. Shots 12-13: robot experiment | **pass, with 2 defects** | Gus works the control box with one hand while the robot's feather rests on his open palm. "Delay" makes the panel's two strokes slip apart (stopwatch), and Gus bursts out laughing on "ticklish again". Defects: the feather's brushing stroke (about 3.5 cm) can't be seen at phone size (`d6b`), so "copied them instantly" versus "a tiny delay" is visible only on the panel, not in the machine. Shot 13 frames the robot small (`d6`). The delay panel is empty for 1.2 s at the start (`d3`) |
| 5. Shot 15: a friend tickles Milo | **pass** | Gus starts tickling on "guaranteed", Milo laughs and squirms on "laugh", hearts on "friend". Contact is visible |

### Every remaining defect
| # | Time | Shot | Defect | Severity | Screenshot |
|---|---|---|---|---|---|
| 1 | 0:37.0-0:37.9 | 10 | the surprise row (high tickle) appears on "no surprise, no tickle" | **critical** | `stageC/d1-shot10-contradiction.jpg` |
| 2 | 0:46-0:55 | 12-13 | the robot's brushing stroke is too small to see; sync versus delay isn't visible in the machine | major | `stageC/d6b-robot-stroke-zoom.jpg`, `d6-shot13-small-robot.jpg` |
| 3 | 0:12.5 (and every gesture change) | 4, all | arms snap between gestures in one frame (no easing) | major (engine-wide) | `stageC/d5a-...`, `d5b-...` |
| 4 | 0:26.0-0:27.1 | 9 | the diagram panel is empty for 1.1 s | moderate | `stageC/d2-shot09-blank-panel.jpg` |
| 5 | 0:49.3-0:50.5 | 13 | the delay panel is empty for 1.2 s | moderate | `stageC/d3-shot13-blank-panel.jpg` |
| 6 | 0:32.8-0:36.9 | 10 | the lower half of the prediction panel is empty for 4 s | moderate | (review sheet, frames 984 / 1062) |
| 7 | 0:13.0-0:14.0 | 4 | the "burst" mark floats in the air by the curtain | moderate | `stageC/d4-shot04-floating-burst.jpg` |
| 8 | 0:21-0:26 | 8 | Juno and Milo framed small and far apart; Milo's "every time you move" action barely reads | moderate | `stageC/d7-shot08-small-framing.jpg` |
| 9 | 0:38-0:42 | 11 | "a joke you wrote yourself": Gus only holds a closed book | moderate | `stageC/d8-shot11-book.jpg` |
| 10 | all | 4, 12-13, 15 | no sound effects for tickling, the feather or the robot | moderate | (cue sheet `audio/Short-tickle.cues.md`) |
| 11 | 0:26-0:33 | 9 | Juno never visibly gestures at the panel (hand below the frame) | minor | (`d2`) |
| 12 | 0:09 | 3 | the raised elbow touches the frame edge | minor | `stageC/d9-shot03-elbow.jpg` |
| 13 | 0:18.3 | 6 | the shrug is cropped at the side (validator warning) | minor | `stageC/d10-shot06-shrug.jpg` |
| 14 | 0:11.5 | 4 | Gus turns from profile to front in one frame when his walk ends | minor (engine-wide) | (clip 1, frames 23-24 at 10 fps) |

### Recommended corrections (they need your approval; several are creative)
1. **Shot 10 (critical):** keep the panel on *your own* touch through "No surprise, no tickle", ending on the meter at zero with a highlight. Then either move the surprise contrast to shot 14 ("The surprise is the whole trick.", where it belongs in the script), or show it on "surprise" and fade it before "no tickle".
2. **Robot (major):**
   - widen the feather's stroke to about 10 cm with a clear swing;
   - give the control hand a bigger, matching stroke;
   - in shot 13, visibly lag the robot behind the hand after "delay";
   - frame shot 13 closer on the hand, the feather and Gus's face, with the panel above.
3. **Gesture easing (engine):** blend the arms over about 0.15 s when a gesture changes. This makes every reaction in every video smoother. It changes existing videos slightly, so the regression references would be re-recorded on purpose (BridgeShort is not affected).
4. **Diagrams start visible:** the first step on the shot's first frame (the brain outline, the delay panel's waves), so no panel is ever blank. Fill the prediction panel's lower half from the start with a faint "someone else" row, or redesign it as one row if correction 1 moves the contrast.
5. **Shot 4:** remove the floating "burst" (the dizzy stars already carry the moment), or anchor it at the contact point on Milo's side.
6. **Shot 8:** stand Milo next to Juno (a tighter two-shot) so his hand movement reads on "every time you move".
7. **Shot 11:** an open book that Gus reads with a deadpan face (a new "open book" item), with no laugh on "punchline".
8. **Sound:** add four synthesised effects to the free sound library (a giggle burst, a feather swish, a soft servo whirr, a stumble) and cue them automatically from the tickle, drive and stagger actions, so every future video gets them.
9. **Minor:** reframe shot 3 slightly wider, and shot 6 so the shrug fits. Juno's presenting gesture reaching up toward the panel in shot 9.

**After corrections 1-9** I would expect about 86-89 / 100: animation +3, visual storytelling +3, audio +2, cinematography +1, science +1. Corrections 1, 2 and 3 are the ones the video needs to be ready. None of them needs new narration (no ElevenLabs cost).

### Ready for the final render?
**No.** The shot 10 contradiction is a critical failure, and the score is 75 / 100 against a target of 85. I recommend
approving corrections 1-9 (or choosing among them). After them come a new review sheet and preview clips, and only then a
request for Stage D.
