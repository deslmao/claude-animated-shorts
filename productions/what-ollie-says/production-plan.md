# What Ollie Says at 3 A.M.: production plan

**Status:** pre-production complete. Nothing has been rendered, narrated or built yet.

**Follows:** the existing Thinkora pipeline (`docs/PRODUCTION.md`) and the CLAUDE.md production rules. No system redesign.

## 1. Identifiers
| Episode | Story id / composition | Runtime | Frames (30 fps) | Spoken characters (approx.) |
|---|---|---|---|---|
| 1 · 3:00 | `ollie-1` / `Short-ollie-1` | ~104 s | ~3,120 | ~470 |
| 2 · The Water Game | `ollie-2` / `Short-ollie-2` | ~90 s | ~2,700 | ~560 |
| 3 · Wierzbno | `ollie-3` / `Short-ollie-3` | ~104 s | ~3,120 | ~390 |
| 4 · 1,214 Nights | `ollie-4` / `Short-ollie-4` | ~112 s | ~3,360 | ~1,080 |
| 5A · Answer as Kuba | `ollie-5a` / `Short-ollie-5a` | ~88 s | ~2,640 | ~230 |
| 5B · Wake Her | `ollie-5b` / `Short-ollie-5b` | ~95 s | ~2,850 | ~400 |

- **Series documents:** `productions/what-ollie-says/` (this folder).
- **Per-episode pipeline status:** `productions/ollie-<n>/status.json`, written by `npm run short`.
- **Theme:** `animation-studio/src/studio/themes/ollie/`. New assets only; nothing protected is modified.

## 2. Approval gates, in order
| Gate | What | Who | Cost |
|---|---|---|---|
| **G0** | **This package:** story lock, beat sheets, scripts, asset plan, engine additions list, QA review | Owner | none |
| G1 | **Native Polish check** of every line and on-screen text (`story-lock.md` §6) | Owner arranges a native speaker. *I can't verify Polish.* | none |
| G2 | Engine additions (`visual-and-assets.md` §7): translated subtitles, outdoor rain, `nightVision` and `flood08` lights, a no-blink flag, toddler scale. Built with tests; `npm test` once. | Owner approves the list (here); I build | CPU only |
| G3 | **Look checkpoint:** 10 half-scale key-frame stills from the new sets (list below) | Owner | ~1 min of stills |
| G4 | **Voice audition** (7 presets, short samples in English and Polish) → casting | Owner | ~1,200 credits |
| G5 | Storyboards for all six; `--until checks` for each; one narration approval for the series | Owner (narration characters) | ~3,100 characters (~2,800 unique; identical lines are cached), ~3,500 with retakes |
| G6 | Half-scale stills → **one 540p preview per episode**, both finales included → one correction pass | Owner approves the previews | CPU (§4) |
| G7 | Cloud final renders, episodes 1–4 (`publish: false`), with QA (seams and keep) | Owner approves each final | GitHub Actions |
| G8 | Vote window (48 h after episode 4) → cloud render of the **winning** finale only, then QA | Owner reports the result | GitHub Actions |

**The G3 key frames:**
1. Episode 1 beat 1: the wall knock, with fairy lights and the drawing.
2. Episode 1 beat 12: the window POV of the garden and the dark gate, with rain.
3. Episode 2 beat 2: Kate's face in the infrared footage, eyes shining.
4. Episode 3 beat 10: Kate walking past Ava on the landing (low angle).
5. Episode 3 beat 13: the high wide of the garden with water over the lawn, three figures.
6. Episode 4 beat 1: the thumbnail grid.
7. Episode 4 beat 12: the 2008 boat at the roof, rain, the willows behind.
8. Episode 4 beat 17: the roof seen from the window (Kate at the upstand, Ollie, rain).
9. Finale A beat 10: the house exterior with one lit window.
10. Finale B beat 11: the nursery-cam frame of clip 1,215.

## 3. Build order (after G0)
1. **Engine additions** (G2), each with its test. Then `npm test` once.
2. **Theme `ollie`:**
   - `ferryLane`: interior upstairs, kitchen and the back exterior with an adjustable water level; the old-house room variant.
   - `wierzbno08`.
   - Characters (`visual-and-assets.md` §4).
   - Props and inserts (§6), and new SFX and ambiences (§8).
   - Then `npm run test:library`.
3. **Look checkpoint** (G3).
4. **Voice presets and audition** (G4). Polish uses the multilingual model; check the voice tool's model setting first.
5. **Storyboards** for episodes 1–4, 5A and 5B, written beat by beat from the beat sheets, with the shot notes copied from them.
6. Per episode: `--until checks` → narration → sound → preflight.
7. Previews and the correction pass (G6), then the finals (G7 and G8).

**Voice presets needed:**
- `avaV`: teen girl, British, natural.
- `kateV`: woman, 38, English with a faint Polish accent.
- `kateSleep`: the same voice; whispered, flatter, slower.
- `kasia08`: Kate's voice, younger and urgent.
- `ollieV`: child, 6; also used for clips at ages 3–4, slightly brighter.
- `kuba08`: a small child, Polish, scream and cry.
- `markV`: man, warm, tired.
- `jakubV`: man, 21, Polish.

**Rule:** the ritual lines keep **identical voice settings** in every episode. The voice cache then reuses the same audio, which makes episode 2's "the waveforms match exactly" literally true.

## 4. Time and cost estimates
Rates are from CLAUDE.md, measured on this container.
- **540p previews** (1.5 s per frame plus about 40 s to bundle):

  | Episode | Preview time |
  |---|---|
  | 1 | ~79 min |
  | 2 | ~68 min |
  | 3 | ~79 min |
  | 4 | ~85 min |
  | 5A | ~67 min |
  | 5B | ~72 min |
  | **Total** | **about 7.5 h** |

  The correction pass re-renders only the affected shots, roughly 1–1.5 h more.
- **Cloud finals:** about 16 min plus 3 min of QA each. Four episodes plus one finale is about 1.6 h of wall time.
- **Narration:** about 3,500 credits including retakes, plus about 1,200 for the audition.
- **Asset build:** the largest part of the job.
  - `ferryLane` is a multi-room house with an exterior and a water rig, plus about 25 props and inserts, 9 characters, 2 overlays, about 8 phone-screen states, rain, subtitles and two light presets.
  - I expect several working sessions, each ending with stills for you.

## 5. The audience vote
- Episode 4 ends on the A/B cards (reusing the existing choice-label assets).
- **Pinned comment:** *"A: Answer as Kuba. B: Wake her. Part 5 is decided by your comments."* (Platform posting is yours; I don't upload.)
- **Both finales are fully storyboarded, narrated and previewed before episode 4 is published,** so the winner only needs its cloud render and QA (about 20 min).
- **Tie or close result:** the owner decides. A suggested rule: the side ahead at 48 h wins.

## 6. Production risks and mitigations
| Risk | Mitigation |
|---|---|
| Polish text-to-speech pronunciation | G1 native check of the text, then audition samples reviewed by the same speaker (G4) |
| Child voices (Ollie at 3, 4 and 6; Kuba at 3) sound adult or synthetic | Audition several voices; keep child lines short; on screen Ollie mostly whispers or is half-asleep, which is forgiving |
| Rain and water raise render cost | Rain only in exterior and window shots; measure seconds per frame at the G3 stills; fall back to window-streak rain if it's too slow |
| Kate blinking by accident (breaks the rule) | No-blink flag (G2) and a still check of every sleepwalking shot |
| Roof sequence too intense for the channel | Staging rules (`story-lock.md` §1.4); the owner signs off on the G3 frame 8 |
| Toddler Kuba looks like a 6-year-old | Toddler scale (G2) or tight framing |
| Episode 4 over 105 s | Accepted (see `qa-review.md`); fallback trims listed there |
