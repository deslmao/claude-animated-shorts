# Studio library: what exists and how to use it

To make a video from these parts, write a storyboard: see [STORYBOARD.md](STORYBOARD.md).
The full generated catalogue of every asset is [ASSETS.md](ASSETS.md); search it with `npm run assets -- search <words>`.

## The asset library: reuse first, create only what's missing
Every reusable asset has an id, kind, name, description, themes and tags. The kinds are characters, extras, sets, placeable props, hand-held items, effects, acting, music moods, ambience, sound effects, voices, camera moves and lights. They all live in one registry (`src/studio/library/registry.ts`), which is built from the live code, so the registry and the actual assets can't drift apart.

| Command | Use |
|---|---|
| `npm run assets -- search pirate ship` | find reusable assets for a topic (do this before planning a storyboard) |
| `npm run assets -- similar "spyglass"` | duplicate check before creating something new |
| `npm run assets -- show <id>` | one asset in full: marks and views of a set, variants of a prop... |
| `npm run assets -- check <story-id>` | every asset a storyboard uses: reused or missing |
| `npm run assets -- themes` | themed collections and their contents |
| `npm run assets -- doc` | regenerate `docs/ASSETS.md` |

### Themed collections
A theme is one folder, `src/studio/themes/<id>/` (for example `pirates`). It exports a `Theme` containing:
- characters, with metadata;
- placeable props;
- hand-held items;
- sets, with their layouts and metadata;
- a default music mood.

Registering it in `themes/index.ts` makes everything usable at once: in storyboards, in the validator, in search, in library protection and in the floor maps. The next video on the same theme finds and reuses it.

### Adding an asset (only when the search finds nothing suitable)
1. `npm run assets -- search ...` and `similar ...`: if a strong match exists, reuse it, or add a variant to it.
2. Build it with the existing engine, in the house style:
   - characters as `Look` recipes;
   - props from `props/kit` primitives;
   - items with the `Pen` and plum ink;
   - sets with `buildRoom` and existing props.

   Put it in its theme's folder, or in the base library if it isn't themed.
3. Give it its metadata: name, description, themes and tags (props also need a footprint and height).
4. Run `npm run floor-map` (for new sets), then `npm test`, and render a test still: a character sheet, a set tour, or a showcase storyboard shot. Check the look and the framing.
5. Run `npm run test:library -- --update` so the asset is protected from now on, then `npm run assets -- doc`.

Everything here lives in `animation-studio/src/studio/` and renders on GitHub Actions (no GPU, no downloads).
The look is the creator's (ink, two-tone light, lens blur, grade): it is never re-designed per video.
Picture sheets: [`docs/library/characters/`](library/characters) and [`docs/library/sets/`](library/sets).

## Characters (`characters/`)
| Name | Recipe | Personality / use |
|---|---|---|
| **Milo** | `MILO`: spiky brown tuft, mustard hoodie, jeans, white trainers, extra-wide shock eyes | curious everyman: asks, reacts, gets into trouble |
| **Dr. Juno Park** | `JUNO` (lab coat) / `JUNO_OUT` (blazer): dark bob, round glasses, quirky raised brow, teal turtleneck | know-it-all friend: the "You see..." explanation |
| **Gus** | `GUS`: bald, grey skull-hugging side hair, bushy brows, walrus moustache, waistcoat, red bow tie | big-hearted old-timer: history, "back in my day", comic relief |
| **Extras** | `extra(i, era)` / `crowd(n, era)`: 7 builds, 15 hair styles, 6 eras (modern, office, lab, fifties, victorian, medieval) | the same `i` is always the same person |

- **Drawing:** `figureFront(pen, look, pose)` and `figureSide(pen, look, sidePose)`. Put them in the world with `lookCard(cam, look, x, y, z, { pose | side, mirror })` plus `contactShadow(...)`.
- **29 expressions** (`EXPRESSIONS`): neutral, stern, grin, laugh, whistle, nervous, shock, relief, relief_open, dazed, pained, smile, smile_closed, lick, thinking, confused, angry, sad, suspicious, excited, scared, sleepy, proud, disgusted, determined, wink, talk, talk_wide, embarrassed.
- **22 gestures** (`GESTURES`): hang, wave, point, pointUp, shrug, facepalm, chin, thumbsUp, crossArms, hips, raiseHand, cheer, talk, scratchHead, coverMouth, present, fists, clap, belly, stop, spread (+ pump for running).
- **26 acting presets** (`act(name)`): each is a face plus body language. They are neutral, happy, laugh, shock, scared, angry, sad, thinking, confused, proud, excited, suspicious, explain, shrug, facepalm, disgusted, sleepy, embarrassed, determined, hello, thumbsUp, point, idea, nervous, dazed and relief.
- **Moves:**
  - front view: stand, walk, march, run, jump, sit, fall;
  - side view: stand, walk, run, sit, point;
  - `back: true` draws the character from behind (over-the-shoulder shots, walking away).
- **Subtle acting** (`acting.ts`, all pure functions of time):

  | Function | What it does |
  |---|---|
  | `idle(t, seed)` | breathing, weight shift, glances, head drift, blinks |
  | `nod(t, t0, n)` | nods starting at t0 |
  | `shake(t, t0)` | head shake |
  | `talk(t, t0, t1, seed)` | mouth flaps and changing hand gestures while speaking |
  | `faceToward(...)` | turns a character toward another, as seen from the camera |
  | `blend(...)` | eases between two poses |
  | `layer(...)` | stacks pose layers |

## Sets (`sets/`, marks and views in `sets/layouts.ts`)
| Set | Light | Named marks | Designed views |
|---|---|---|---|
| `home` | interior | a b c d, armchair, door, window, kitchen | wide, two-shot, kitchen, low close |
| `classroom` | interior | a b c, board, teacherDesk, aisle, door | wide, at the board, desks, close |
| `office` | interior | a b c, whiteboard, cooler, door, window | wide, desk, whiteboard, close |
| `lab` | interior (or interiorCool) | a b c, bench, island, hood | wide, bench insert, fume hood, close |
| `city` | day / golden / night | a b c d, cafe, kerb, busStop, crossing | down the street, storefront, crossing high, low hero |
| `oldtown` | day / golden / night | a b c d e, fountain, market, well, cart | square wide, market, fountain two-shot, low hero |
| `nature` | day / golden / night | a b c, path, pond, log, forest | path wide, pond, forest edge low, close |

- Marks are `[x, floorY, z]`.
- Rooms are three-walled: the camera side (+z) is open.
- `clearOf(views, x, z)` automatically leaves out any prop that would block a designed view.
- `SetWorld` hosts several sets in one film. Each set is built the first time a shot needs it, and the sky switches per shot.

## Props (`props/`, all take an `At` = { x, z, y?, yaw?, s? } and optional colours)
| Group | Props |
|---|---|
| Interior | sofa, armchair, coffeeTable, rug, tvUnit, bookshelf, floorLamp, pendant, plant, picture, clock, curtains, counter, fridge, stove, desk, officeChair, monitor, chair, schoolDesk, board (chalk / white, 6 topics), filingCabinet, waterCooler, wallShelf, labBench, flask (4 kinds), microscope, testTubeRack, jarShelf, fumeHood, sink |
| Outdoor | streetLamp, bench, bin, hydrant, trafficLight, car, busStop, planterTree, signPost, mailbox, modernBuilding, shopfront (cafe / books / grocer), house (8 styles), marketStall (fruit / bread / cloth), barrel, crate, cart, well, lanternPost, fountain |
| Nature | tree (round, fat, tall, cone, bush, hedge, autumn), rock, log, stump, flowers, tufts, mushroom, fence, picket |

Rooms: `buildRoom(root, { w, d, h, floor, wall, lower, openings: [window / door], tiles })`.

## Camera (`camera/`)
- **`fitShot(marks, { size, from, height, fov, roll })`** solves a camera that frames the marks in 9:16. Sizes are wide, full, medium, close and extreme.
- **`plan(move, f0, f1)`** gives a camera key plus lens blur. The named moves are:
  - **Framing:** `view`, `establish`, `frame`.
  - **Change of size:** `pushIn` and `pullOut` glide between two shot sizes.
  - **Close and angled:** `closeUp` (with an optional punch-in), `lowHero`, `highAngle`, `overShoulder`.
  - **Travelling:** `orbit`, `crane`, `follow`, `dutch`.
- **Also:**
  - `rackFocus(a, b, f0)` slides focus between two marks.
  - Impact kicks: `kicks: [[time, strength]]`.
  - Lens blur comes from the creator's table: wide 0, medium about 10, close 13.

## Effects (`fx/effects.ts`)
- `fxNear(cam, kind, mark, t, t0)` places a reaction mark beside a head, scaled to the shot. `fxCard(...)` places one anywhere.
- 16 kinds: question, exclaim, sweat, anger, idea, hearts, zzz, speed, puff, stars, burst, confetti, sparkle, notes, splash, ring.
- Every effect pops in with an overshoot, animates, then fades.

## Light presets (`look/lights.ts`, grades in `look/grade.ts`)
| Preset | Use |
|---|---|
| `day` | the creator's day look (measured) |
| `golden` | the creator's golden hour: backlit, violet shade, sun disc |
| `interior` | warm rooms: key behind the camera, warm shade, warm bounce ceiling |
| `interiorCool` | clinical labs / tense explanations |
| `night` | moonlit: navy shade, moon disc, night grade, dimmed cool characters |

## Tests that guard the library
| Test | Command / composition | What it proves |
|---|---|---|
| Framing | `npm run test:framing` | every designed view frames its subject in 9:16, with no head cut by the frame |
| Marks | `SetTour` with props `{ set, mode: "marks" }` | a person on every named mark stands on clear floor |
| Lighting | `SetTour` `{ set, mode: "lighting" }` + `python3 scripts/skin_consistency.py out/verify` | the cast's skin colour stays within ±8 % across sets |
| Determinism | warm tab vs fresh tab PNG compare | chunked cloud renders join without seams |
| BridgeShort | frames 608 / 1417 vs reference | the creator's original is untouched |
| Storyboards | `npm run test:story` | every storyboard is valid and its subjects framed in 9:16; deliberate mistakes are caught (see [STORYBOARD.md](STORYBOARD.md)) |
