# What Ollie Says at 3 A.M.: visual direction and asset plan

## 1. Five looks (the audience must always know which one they're in)
| Look | Used for | Lighting / grade | Frame furniture | Motion |
|---|---|---|---|---|
| **Present day, D** | Kitchen and day scenes | Warm amber practicals, grey rain light through the windows. Existing `interior` light. | None | Steady and calm, slow push-ins |
| **Present night, N** | Bedrooms, landing, garden, roof | Cold moonlit blue, deep shadow, **one warm source per room** (Ava's fairy lights, the red LED clock, the garden lamp). Existing `night` / `interiorCool`, tuned per set. | Rain on every window | Slow. Handheld *feel* only in the garden runs (no shake). |
| **Camera footage, NC / GC / HP** | Nursery cam, garden cam, Ava's hidden phone | Monochrome infrared grey-green (NC/HP) and blue-grey (GC). Eyes shine in the infrared. **Static fine grain, no flicker.** | NC: "NURSERY CAM · 03:00:0x" plus clip number, slight fisheye. GC: "GARDEN · 03:0x", rain streaks. HP: phone recording frame and timestamp. | Locked-off camera; only digital push-ins. Low frame-rate *feel* by holding poses, **never by dropping frames.** |
| **2008, F08** | The flood fragments and the episode 4 sequence | Cold teal dawn, desaturated, heavy rain, soft vignette | None | Slightly slowed (about 0.8×) with muffled sound. In episodes 1–3 the fragments are 0.6–1.2 s hard cuts, never strobe. |
| **Phone screens, PH** | Translator, search, memorial page, messages, alerts, delete dialog, video call | Ava's phone UI, full-frame vertical insert | Translator overlays sit on the real object (the note) | Held at least 1.2 s per readable line. Scroll speed is readable. |

**Subtitles for Polish:**
- White, sentence case, a thin dark outline, sitting where the captions sit (64% height).
- They **replace** word captions on Polish lines.
- Episode 1 shows Polish lines unsubtitled until Ava translates them (beats 2 and 4), on purpose.

## 2. Shot language
- **Vertical first.** Keep stacked compositions: a face over a hand, a window over the garden, Kate over a kneeling Ava. Avoid wide two-shots side by side.
- **Inserts carry the clues**, each held for at least 1.2 s:
  - the clock, the knuckles, the bolt, the scar, the feet and grass, the grip marks;
  - the photo (front and back), the passport, the note, the sock;
  - the key, the hand opening, the toes on the brick, the hand on the screen.
  After a line that leads into an insert, hold 0.3 s before cutting (captions linger about 0.25 s).
- **POV shots:** Ava at her window (the garden), the doorway (Ollie's bed), Kate's flicker in Finale B.
- **Low angles** for Kate the sleepwalker (episode 3 walk-past, episode 4 roof seen from the window). **Never more than about 50° above horizontal** on actors (engine rule): the "overhead" in Finale A is a gentle 45°.
- **High wides** for geography: the garden sloping to the river (episodes 1, 3 and 4), the house exterior (Finale A).
- **Restraint:** no dutch angles, no whip pans, no strobe. Fear comes from stillness, sound and what isn't seen. Motion blur is low on close-ups (engine default).

## 3. Key sequences: direction notes
1. **Three knocks (episode 1 opening; both finales):** knuckle insert, then wait for the answer. Always three. Finale A: answered, Ava awake. Finale B: Ollie answers, everyone asleep.
2. **Ollie's night-time Polish:** calm, sleepy, clear: *recited*, not possessed. The horror is his calm.
3. **Kate sleepwalking:** eyes open, **zero blinks**, slow, no hurry. She walks through space as if the room were the roof. Shoulders soft. **The blink in Finale B is the payoff**, so animators must not let a blink slip in earlier.
4. **The scar:** pale diagonal line on the right palm. Insert in episode 1; gripping Ollie's wrist (episode 4, Finale B); held to the camera (Finale B).
5. **The old photo:** the toddler on a swing. Front and back inserts, then side by side with Ollie's school photo (the same face).
6. **The 1,214 thumbnails:** a slow crane down an endless grid. Thumbnails are real frames from the NC clips (variants: old house / new house, aged 3, 4, 5, 6).
7. **Ollie talking to the camera (clip 214):** his face fills the fisheye. Hold the silence after his line.
8. **The empty bed (clip 903):** Kate kneeling, holding nothing, with the timestamp racing.
9. **Kate walking toward the water:** from behind, low, at Ollie's height; then the high wide.
10. **2008 in fragments:** ep1 a hand slipping; ep2 a rope through a palm; ep3 the roof and the promise; ep4 the full sequence; finales one image each.
11. **The roof:** see `story-lock.md` §1.4. Rain in the foreground of every window shot. Inserts of the hand, toes and gutter. **The drop itself is never framed.**
12. **The final images:** A, the lit window, pulling out from Ava's open eyes to the dark house. B, clip 1,215 mirroring clip 1's composition, with Kate blinking.

## 4. Characters
| ID (planned) | Look | Base / reuse | New work |
|---|---|---|---|
| `ava` | §3 of `story-lock.md` | Cast generator (`petite` build) | Hoodie with a star patch, pyjama variant |
| `ollie` | Dark curls, gap tooth, dinosaur pyjamas / red jumper | Cast generator (`kid`) | Pyjama print; `ollie3` and `ollie4` variants (smaller, rocket pyjamas) for the clips |
| `kate` | Curls tied low, cardigan, scar | Cast generator (`adult`) | Nightdress outfit; **blink lock** (no blinks while sleepwalking); scarred-palm insert |
| `mark` | Stocky, sandy, hi-vis | Cast generator (`stout`) | Hi-vis outfit |
| `kasia08` | Young Kate, loose curls, green cardigan, soaked | Kate's look | Wet-hair variant |
| `kuba08` | Dark curls, red star pyjamas, one blue sock | `kid` build at a smaller scale | **Toddler scale** (see §6 risk) |
| `jakub` | Grown Kuba, 21, on a screen only | Cast generator | Seen only inside a laptop screen |
| `tomasz` | Volunteer firefighter, helmet, belt, moustache | Generator (`adult`); helmet like the OTM `firefighter` | Belt and headlamp |
| Nowickis ×2 | Elderly figures in blankets | Generator (`extras`) | Blanket wraps |

## 5. Sets and environments
| Set | Reuse | New work | Used in |
|---|---|---|---|
| **`ferryLane`**: the Harper house, 4 Ferry Lane | None suitable (`home` is a single living room; `hallway` has seven doors) | **NEW, the main investment.** Upstairs: landing (school-photo wall, airing cupboard); Ollie's room (bed, shelf, nursery cam, window to the garden); Ava's room (bed, fairy lights, desk, window to the garden) **sharing a wall with Ollie's**; Kate and Mark's room (double bed, wardrobe, window **opening onto the flat roof**). Downstairs: kitchen (stove, table and bench, calendar, back door with **top bolt**, window to the garden), hallway and front door. Exterior back: kitchen extension with a **flat felt roof and a 30 cm brick upstand**, lawn sloping 25 m to a low fence and gate, the river, garden camera under the eave, garden lamp. **Adjustable water level** (none / lawn bottom / gate / over the lawn). Exterior front: for the A ending (FOR SALE board) and the B removal van. | Episodes 1–5 |
| **`ferryLane` old-house room** | Variant of Ollie's room | Blue walls, cot-bed, rocket print, different shelf | Episode 4 clips; also the B "new house" bedroom with boxes |
| **`wierzbno08`**: the flood at dawn | `floodWater` (Whale City) for the water surface; `whaleSea` motion | **NEW:** half-drowned village roofs, a chimney, a pitched tiled roof (Kasia's) with a flat ridge section to kneel on, a willow row on the mill-race, a distant church roof, rain, a cold dawn sky | Episode 4 (sequence), fragments in eps 1–3, A and B |
| Front hallway / front door | `frontDoor` (extradoor) | Recolour | Episodes 3 and 4 (Mark leaving) |

## 6. Props and inserts
| Prop | Reuse | New work |
|---|---|---|
| Beds: child, teen, double, cot-bed | none | **NEW** (4 variants of one parametric bed) |
| Nursery camera on the shelf | `securityCam` (nightshift), scaled down | Small white dome variant |
| Garden camera | `securityCam` | none |
| Hub box | none | NEW (simple) |
| **Night-vision overlay** (NC / GC / HP variants) | `cctvOverlay` (otherjamie), already pinned to the lens | NEW variants: grey-green infrared / blue-grey, text and clip number |
| **Thumbnail grid** (laptop, 1,214) | none | NEW rig: a scrolling grid texture plus counter |
| Ava's phone screens | `jamiePhone` / `nsPhone` / `ftPhone` patterns | NEW variants: translator with waveform, search result, memorial page, message and send, flood alert, delete dialog, video call, nursery-cam app "no new clips" |
| Bedside LED clock | `clock` (registry) is a wall clock | NEW: 2:58 / 2:59 / 3:00 states |
| Back door with top bolt (open/closed) | `frontDoor` style | NEW |
| Key in the lock (insert), key in hand | `keyAtLock` (lockedout) | Re-texture |
| Tin with dinosaur sticker | none | NEW |
| Kuba photo (front and back), passport, wristband, nurse's note, blue sock | `yearPhoto` / `plaque` patterns (onetoomany) | NEW inserts |
| School photo on the landing | `photoFrame` (extradoor) | Re-texture |
| Kitchen calendar (July, 14 circled) | none | NEW insert |
| Kate's scarred palm | `fpHands` / `leftHandCard` patterns | NEW insert |
| Ollie's drawing "ME + AVA" | `familyDrawing` (lockedout) | Re-texture |
| Boat (2008) | `rowboat` (pirates) | Recolour, add bow line |
| Willow | none | NEW tree variant |
| Tomasz's belt (buckled to the trunk) | none | Part of the willow rig (insert) |
| Rain | none outdoors (`nightWindow` is behind glass) | **NEW effect** (needs the owner's approval, §7) |
| A/B vote cards | `choiceLabel` (extradoor) / `choiceFloat` (otherjamie) | Re-texture |
| FOR SALE board, removal van, moving boxes | `signBoard`, `car`, `crate` | Re-texture |

## 7. Engine additions needed (narrow; listed for approval)
1. **Translated subtitles for Polish lines** (required): a per-line subtitle text that replaces the word captions. This is small, inside the caption system, and changes nothing for existing stories.
2. **Outdoor rain** (required): a particle or streak effect, at fixed seeds for deterministic renders.
3. **Two light presets** (strongly wanted): `nightVision` (monochrome infrared) and `flood08` (cold teal dawn). These are additions to `LIGHTS`. Fallback: tinted overlay cards only, which give a weaker look.
4. **Toddler scale for `kid`** (wanted for Kuba 2008): an actor scale or a `toddler` build. Fallback: the `kid` build kept mostly in tight framing.
5. **Blink lock** (required): a per-actor "no blinks" flag for sleepwalking shots, if blinking is automatic today. *This has to be checked in the engine before production.*

Everything else is theme assets: additions only, so `npm run test:library` should stay green.

## 8. Sound
| Need | Existing | New |
|---|---|---|
| Knocks on the wall | `knock` | `wall_knock_soft` (knuckles on plaster) |
| Bolt, key, lock | `latch_click` | `key_turn` |
| Clock | `clock_tick` | none |
| Phone and translator | `msg_chime`, `phone_buzz`, `phone_tap`, `blip_up` | `alert_flood` (UK flood-alert tone, generic, not a real service jingle) |
| Footsteps | `step_floor`, `step_grass` | `water_wade` (ankle and knee deep) |
| Rain | `amb_storm` | `amb_rain_roof` (rain on felt and glass) |
| River | none | `amb_river` (fast brown river) |
| Camera hiss | none | `amb_nv_hiss` (low, steady) |
| 2008 | `wave_crash`, `engine` | `rope_snap`, `outboard_small`, `heli_distant`, `water_rush_muffled` |
| Stings and swells | `sting_low`, `whoosh_low`, `musicbox_note` | none |

**Music:** existing moods `hush`, `mystery`, `tense`, `storm` and `silence`, plus **one series motif**: a two-note warm phrase for the siblings, played full once in episode 4 beat 12. It's built with the existing sound system as a new mood `waterGame` (an addition).
