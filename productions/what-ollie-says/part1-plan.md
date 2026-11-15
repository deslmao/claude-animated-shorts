# Part 1 ("3:00"): production plan

**Release strategy (owner's decision):** publish Part 1 first, read the audience response, then decide on the rest. Only Part 1 is being made production-ready. Parts 2–5 stay as approved scripts.

**Status:** awaiting approval of this plan. No previews, paid narration or final render have been started.

## 1. Verified character-action capabilities
Checked directly in `characters/figure.ts` and `story/types.ts`.

| Action | In the engine? | What exists | How we show it |
|---|---|---|---|
| Kneeling | No | Front poses: stand, walk, march, run, jump, sit, fall. Side poses: stand, walk, run, sit. | **Staging:** the actor stands behind the bed, 0.36 m below floor level, so the bed hides the legs. Proven in `visual-tests/bedside-stills-v1.jpg`. |
| Lying in bed | No | `sit` works on a mattress | **Staging:** sitting up in bed uses `sit` with the duvet over the legs. Asleep is the actor lowered so only head and shoulders show above the duvet. Proven (frame 4). |
| Leading by the hand | Partly | The `offer` gesture reaches for another actor and the hands meet; both can walk | Walk side by side with `offer`, plus a close insert of the joined hands when it matters. |
| Lifting or holding a child | No | None | **Insert only:** a close card of the hand on the wrist. The wide shot shows them standing together. |
| Hugging | No | None | Two actors placed close with `offer`, framed tight; or cut away. Not needed in Part 1. |
| Climbing through a window | No | None | Cut from "at the window" to "already outside". Not needed in Part 1. |
| Never blinking | Yes (added, approved) | `blink: false` on an actor | Kate asleep |
| Sleepwalker's face | Yes (added) | The `blank` expression | Kate asleep |
| A three-year-old | No | `kid` is the smallest build; there is no per-actor scale | Not needed in Part 1. For Part 4: a `toddler` build is the smallest fix. |

**Conclusion:** Part 1 needs **no new pose**. Everything it shows can be done with staging and inserts.

## 2. The bedside ritual: solution
- **Bed layout:** Ollie's bed stands 0.85 m off the back wall, with its head against the wall he shares with Ava.
- **Kate** kneels on the far side of the bed, facing the camera, at the set mark `kneel`.
- **Ollie** sits up in bed at the mark `bed`. Their hands meet with the `offer` gesture.
- **Proof:** `visual-tests/bedside-stills-v1.jpg`, five frames: the ritual wide, close and at night; Ollie asleep; Ava at the shared wall.
- **One correction made:** Kate had Ollie's curly hair shape and read as a child next to him. She now has long dark hair. Ollie (and Kuba, later) keep the curls. `story-lock.md` is updated.

Part 1 never shows the ritual itself, only its sounds and its traces. This proof is for Part 2 onward, and for the look of the room.

## 3. What Part 1 needs
### Already built (this stage and the roof test)
- **Sets:** `avaRoom`, `ollieRoom` (with the nursery camera on the shelf), `ferryBack` (the garden, gate and river, used for Ava's window view).
- **Props:** `rain`, `ferryWater`.
- **Characters:** Kate, Ava, Ollie, Mark.
- **Engine:** the no-blink flag and the `blank` expression.

### Still to build for Part 1
| Item | Used in beat | Notes |
|---|---|---|
| **Kitchen** (`ferryKitchen`): table and bench, stove, back door with the top bolt, window onto the garden and river | 5–8 | A small new room made from existing kitchen props |
| **Door for Ava's room**, with a gap underneath | 3, 13 | For the shadow crossing and her hand on the handle |
| **Insert: knuckles knocking on the wall** | 1, 3, 11 | Ink card |
| **Insert: red LED clock** (2:58, 2:59, 3:00) | 2, 10 | Three states |
| **Phone screens:** recording waveform, translator (two lines, then the live "TAKE HIM!"), calling "DAD" | 2, 6, 12, 13 | Variants of the existing phone-screen pattern |
| **Insert: Kate's palm with the scar**, holding a mug | 7 | Ink card |
| **Insert: the 2008 flash**: a small hand slipping from a woman's hand above black water | 7 | One card with a cold grade. No 2008 set is built. |
| **Insert: Ollie's wet feet with grass**; **his wrist with red marks** | 14 | Two ink cards |
| **Two pale figures at the gate** | 12 | Kate and Ollie placed at the gate in `ferryBack`, deliberately out of focus |
| **Translated subtitles** for Polish lines | 11, 12 | The approved engine addition; small |
| **Sounds:** soft knock on a wall, rain on a roof, the river, a translator ping | throughout | Four new sounds; the rest exist |

### Not built now (deferred until continuation is approved)
- The landing and Kate and Mark's room interior.
- The old-house room and the 2008 village.
- The camera-footage looks and the thumbnail grid.
- The tin and its contents.
- Roof fixes.
- Toddler scale.
- Jakub, Tomasz and the Nowickis.

## 4. Estimate for Part 1
| Step | Effort / cost |
|---|---|
| Kitchen, door, 6 insert cards, phone screens, sounds | About one working session |
| Translated subtitles, with its test, then the full test suite once | Small |
| Storyboard (15 beats, about 104 s), `--until checks` | About one working session |
| Half-scale stills of key frames, corrections | About 15 minutes of rendering |
| Voice audition (after the Polish check) | About 700 credits |
| Part 1 narration | About 470 characters, about 600 with retakes |
| One 540p preview (about 3,120 frames) | About 79 minutes |
| One correction pass (affected shots only) | 10–30 minutes |
| Cloud final render and QA | About 19 minutes |

## 5. Remaining genuine blockers
1. **Polish check by a native speaker** (`polish-verification.md`, section A: three lines for Part 1). Only you can arrange this. Nothing audio can start without it.
2. **Child voice quality** is unknown until the audition (`voice-audition-plan.md`). This is the biggest risk to Part 1.
3. **Opening hook:** the 3:00 voice arrives at second 4, after the knocks. I'll render the opening both ways as stills and a short clip for you to choose, before the full preview.
4. **Night brightness:** the roof stills were dark. Part 1's night scenes will be graded brighter, and you'll see them in the key-frame stills.
