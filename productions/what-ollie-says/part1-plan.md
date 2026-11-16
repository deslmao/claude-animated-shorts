# Part 1 ("3:00"): production handoff

**Status:**
- The screenplay is final: [`episodes/ep1-3am.md`](episodes/ep1-3am.md), about 102 s.
- This handoff awaits the owner's approval. Nothing has been narrated, auditioned or rendered.

**Release:** Part 1 is published first; the rest waits for the audience response.

**Workflow:** the existing pipeline and the CLAUDE.md production rules. No engine redesign, and no new pipeline features.

## 1. What already exists (reused as is)
| Need | Existing asset |
|---|---|
| Sets | `ollieRoom` (bed, `kneel`, `asleep`, `tuck`, `floor`, door), `ferryKitchen` (counter, table, back door with top bolt, `stairs`), `ferryBack` (garden, fences, river, neighbours, and Kate and Mark's lit bedroom) |
| Characters | Kate (long hair, cardigan), Ava (ponytail, grey hoodie), Ollie (curls, green pyjamas), Mark (hi-vis) |
| Sleepwalking | `blink: false` and the `blank` face (Kate in Scenes 7–9). Awake Kate blinks normally (Scene 10). |
| Staging | Kneeling behind the bed (proven in `visual-tests/bedside-stills-v1.jpg`), asleep under the duvet, hands meeting with `offer`, walks seen from behind (`walk.view: "back"`), the `fall` pose |
| Weather and water | `rain`, `ferryWater` (river / lawn / high) |
| Inserts (`olInsert`) | `trans` (step 0: line 1 only), `palm` (the scar), `flash08` (the hand opening and the fingers slipping, used for Scene 9's release) |
| Subtitles | The `sub` line field for every Polish line |
| Sounds (library) | `amb_storm`, `creak`, `step_floor`, `latch_click`, `blip_up`, `splash`, `drip`, `thud`, `sting_low`. No new sounds are needed. |

The old `ollie-1` storyboard (32 shots) follows the superseded script. Its sets, views and shot patterns are reused; its shot list is rewritten to the final screenplay.

## 2. Essential new work (additions only, all in `themes/ollie/`)
| # | Item | For | Why it's essential |
|---|---|---|---|
| 1 | **`ferryWater` variant `garden`:** water only between our two side fences (x −3.2..3.2, from about z 11 to the back fence), a visible vertical edge where it meets each fence, the river beyond, and a security light on the right-hand neighbour's wall lighting their dry lawn | Scenes 8–9 | The key supernatural image. The current water planes are 140 m wide and flood the neighbours too. |
| 2 | **Phone-camera overlay** `olPhoneCam`, pinned 0.5 m in front of the lens (the proven CCTV-overlay method from The Other Jamie): REC dot, 03:00, and the post text from step N | Scene 1 | The hook's "seen through Ava's phone" frame and the on-screen text |
| 3 | **New `olInsert` variants:**<br>• `phoneClock`: 02:58 / 02:59 → 03:00 by step<br>• `towelPhoto`: the tea towel pressed to the photo<br>• `tinLid`: the dinosaur sticker<br>• `tinOpen`: dry tissue, the wet photo, a running drop<br>• `photoBack`: "Kubuś · 2008"<br>• `match`: the photo beside Ollie's school photo, then overlaid, then the tear drop<br>• `pull`: V-ripples dragging the pyjama legs<br>• `kateFeet`: wet feet, grass, footprints on tiles<br>• `endCard`: PART 2: THE WATER GAME | Scenes 1–10 | These carry the clues and the supernatural action at phone size, where the figures can't |
| 4 | **Ollie in a towel:** a second look for Ollie (a pale towel as the cardigan layer) | Scene 10 | The final image |
| 5 | **Conditional:** an eyes-closed speaking face (one entry in `FACES`, like the approved `blank`) | Scenes 1 and 7 | Only if the stills show the existing `sleepy` face as a yawn while he speaks |

**Not needed:**
- A landing or hallway set: Scenes 3–5 are staged in Kate's room and the kitchen.
- Stairs: the walk enters the kitchen from the `stairs` spot.
- A trampoline or other garden props.
- New sounds.
- Any 2008 set.

**Unused existing inserts** (kept, not deleted): `knock`, `clock`, `clock258`, `rec`, `transLive`, `callDad`, `feet`, `wrist`.

## 3. Voices
- **Gate G1 (owner):** a native Polish speaker checks `polish-verification.md` section A. That's all six ritual lines and the photo text, since Part 1 now uses the full ritual.
- **Audition (`voice-audition-plan.md`), about 700 credits.** The decisive voice is the **toddler** voice for L1 and L5; Part 1 succeeds or fails on it. Ollie's own six-year-old voice and Kate (asleep Polish, awake English) are auditioned too.
- **Part 1 narration:** about 500 characters, about 650 with retakes. All ritual lines keep identical voice settings, so they can be reused in later parts.
- **Voice presets needed:**
  - `toddlerV`: L1 and L5;
  - `ollieV`: Ollie, 6, English;
  - `kateV`: awake;
  - `kateSleep`: flat, whispered, and the L4 shout;
  - `avaV`;
  - `markV`.

## 4. Build order and cost (CLAUDE.md rates)
| Step | Cost |
|---|---|
| 1. Assets in §2, then `npm run test:library` (plus `npm test` only if item 5 is needed) | About one working session; CPU only |
| 2. Rewrite the `ollie-1` storyboard to the screenplay, with placeholder voices; `--until checks` | Free |
| 3. Half-scale stills of the key frames, in one batch (`stills.mjs … 0.5`) | About 4 s each plus the bundle; about 3 min for 25 frames |
| 4. **G1** Polish check → audition → cast → Part 1 narration | About 700 + 650 credits |
| 5. Timing, music and sound with the real voices; `--until checks` again | Free |
| 6. One combined 540p preview of the whole film | About 3,060 frames × 1.5 s ≈ 77 min |
| 7. One correction pass, re-rendering only the affected shots at 540p | 10–30 min |
| 8. Cloud final (20 chunks, `publish: false`), then QA (seams and keep) | About 16 + 3 min |

**Approval stops:**
- after the step 3 stills (the look);
- after step 4 (casting);
- after step 6 (the preview);
- after step 8 (the final).

## 5. Progress: stills APPROVED (17 Nov 2026), and `keepFace` approved
The owner's only change: Ava's frightened face became the wide-eyed `shock` face, held while she speaks. It was checked in five stills.

**Next:** the native Polish check (gate G1, arranged by the owner), then the voice audition, then narration.
**Built (additions only, `themes/ollie/`):**
- `ferryWater` variant `garden`, with the security light;
- the `olPhoneCam` overlay;
- ten insert cards: the nine planned plus `photoTable`, the wet photo on the kitchen table;
- the `ollieTowel` look;
- `ferryKitchenNight`, the same kitchen with a dark window and dark door glass, for the night scenes.

**Engine (narrow, opt-in; replaces handoff item 5):**
- **Why it was needed:** a speaking actor's whole face was swapped for a talking face. That opened Ollie's eyes during the hook line and broke Kate's sleepwalker stare on every ritual line, and a `FACES` entry alone couldn't fix it.
- **What was added:**
  - an actor flag, `keepFace: true`: the authored eyes and brows stay, and only the mouth talks;
  - a `trance` face: eyes shut, a flat mouth.
- **What it changes:** nothing in any other film, because the flag defaults to off.

**Storyboard:** `ollie-1` is rewritten to the final screenplay: 55 shots, about 111 s with placeholder voices.
- All six ritual lines are verbatim and subtitled.
- `--until checks` passes, stopping at the narration-approval gate as intended.

**Stills:** about 60 half-scale key frames (two rounds), with one correction pass on the frames that needed it.
- The approval sheets are `visual-tests/part1-keyframes-v2-a.jpg` and `-b.jpg`.

## 6. Remaining real risks
1. **The toddler voice speaking Polish.** If no voice passes, the audition plan's fallbacks apply.
2. **The `garden` water reading clearly at phone size** (the edge at the fence, the dry lawn next door). This is checked first, in the step 3 stills.
3. **Runtime:** about 102 s. With real voices it can drift by a few seconds; the holds are set after narration, and no scene is padded.
