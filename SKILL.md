---
name: cartoon-3d-short
description: Automated animated Shorts studio. Turns a topic into a finished vertical (1080x1920, 30 fps) cartoon Short (55-65 s explainers, usually 70-100 s stories): 2D characters (Milo, Dr. Juno Park, Gus, themed casts, crowds) in colourful 3D sets with ink outlines, lens blur and gliding cameras, narrated by George (ElevenLabs) with word-timed captions, lip-sync, automatic music and sound effects, rendered in the cloud on GitHub Actions with QA. Use when the user gives a topic for a Short, asks for "another video like the yawn / bridge video", a psychology / science / history / fun-fact Short with cartoon characters, or says "use the cartoon short skill".
---

# Animated Shorts studio

The owner gives a topic. Claude chooses the storytelling format, writes the story and its visual plan together, evaluates
both once (one revision at most), gets **the owner's approval of the actual story** (and its narration cost), then builds the storyboard from the reusable asset library and runs one command that narrates, scores, renders,
checks and publishes the video. Read `PROJECT_STATUS.md` first in every session.

## Owner's rules (always)
- **Format:** vertical 1080×1920, 30 fps. The story sets the length: explainers about 55–65 s, stories usually 70–100 s. Never pad, never rush.
- **Captions:** on by default.
- **Narrator:** George at speed 1.10 is the default.
- **Style:** the creator's look, never redesigned per video.
- **Rendering:** cloud only (GitHub Actions). The owner's Mac is school-managed: never ask them to install anything or run commands.
- **No paid ElevenLabs request** before the owner approves the script and the character cost.
- **Never expose, print or commit the API key.** It lives only in the environment's network secret.
- **Never weaken a QA check** to make something pass. Fix the cause.
- **Don't break existing work:** BridgeShort and every published video must stay identical (`npm run test:regression`).
- **Git:** develop on `claude/admiring-hopper-kbrb3d`. Never merge into `main` without approval.
- **Content:** jokes and claims are researched real facts. Story, characters and voice are always our own. Never name or copy the reference channel. English only.

## The workflow (details: `docs/TOPIC_TO_VIDEO.md`)
1. **Story first** (`docs/STORYTELLING.md`): choose the format (immersive, action-first, world-rule, emotional, mystery,
   serial, or other) and say why. For factual stories, research first (`research.md`: 2+ credible sources; viral videos and comments are not sources).
2. **Story + visual plan** (`productions/<id>/story.md`, from `productions/_template/story.md`): premise and question,
   protagonist (want / fear / decision), setups and payoffs, and one row per beat with its lines, what happens, the subject, the action,
   the camera and what changes. `npm run script -- <id>` lints it and writes `approval-request.md`. Then write the one honest
   evaluation (story, engagement, visuals, clarity, accuracy), make one focused revision, and set the verdict.
3. **Approval:** the owner approves the actual story. `npm run script -- <id> --approve <chars>` refuses on a lint FAIL or a
   verdict other than `ready`. (Legacy explainers can still use `script.md` with the formula in docs/TOPIC_TO_VIDEO.md.)
4. **Assets, reuse first:**
   - Look with `npm run assets -- search <words>` and `npm run assets -- themes`.
   - Create only what's missing, in `src/studio/themes/<theme>/`, after an `npm run assets -- similar ...` duplicate check.
   - Test it with a still, then `npm run test:library -- --update` and `npm run assets -- doc`.
5. **Storyboard:** `npm run script -- <id> --storyboard` writes one shot per beat, with the approved lines and the beat's plan as notes. Build the planned action, subject and camera for every shot: sets, cameras, acting on the words, props, held items, crowds, transitions, light. Then `npm run test:story`.
6. **Produce:** `npm run short -- <id>` runs validate → assets → approval check → narration → sound → checks → review sheet. Look at `productions/<id>/review.jpg`, then `npm run short -- <id> --reviewed` runs the cloud render (20 chunks), QA, publishing and the final checks.
7. **Deliver:** the release link, the MP4 (SendUserFile), `final/qa.md` and `final_strip.jpg`.

## Where things are
| Thing | Where |
|---|---|
| Storytelling system, formats, evaluator | `docs/STORYTELLING.md`, `docs/storytelling/benchmarks.md`, `productions/_template/story.md`, `scripts/lib/story.ts` |
| Storyboard format | `docs/STORYBOARD.md`, `animation-studio/src/studio/story/types.ts` |
| Asset library and themes | `docs/LIBRARY.md`, `docs/ASSETS.md` (generated), `src/studio/library/registry.ts`, `src/studio/themes/` |
| Narration, captions, lip-sync | `docs/VOICE.md` |
| Music and sound effects | `docs/SOUND.md`, `animation-studio/sound/` |
| One-command production | `docs/PRODUCTION.md`, `scripts/short.ts` |
| Cloud render farm and QA | `docs/CLOUD_RENDERING.md`, `.github/workflows/`, `scripts/qa.mjs` |
| The look (ink, lens, grade, lights) | `src/studio/look/`; the creator's measured values in `docs/CREATOR_SKILL.md` and `references/` |
| The creator's original bridge short | `src/videos/bridge/`, `templates/`, `docs/CREATOR_SKILL.md` (the original skill, verbatim) |

## Tests (run them; never claim something works untested)
| Command | What it checks |
|---|---|
| `npm test` | lint and types, framing, every storyboard, library protection |
| `npm run test:sound` | every sound renders |
| `npm run test:regression` | existing videos are pixel-identical |
| `npm run preflight -- Short-<id>` | ready to render |

## Gotchas (learned the hard way)
- **Determinism:** every frame must be a pure function of its number, because chunked renders are joined. Card cache keys must equal the drawing options. The review stage spot-checks this.
- **Vertical frames are narrow** (±10° across). Over-the-shoulder shots, held items and effects must be solved for 9:16; the library does this. Don't hand-place cameras when a named move exists.
- **Stale soundtracks:** any storyboard change makes the soundtrack stale. `npm run short` rebuilds it, and preflight refuses stale audio.
- **QA flags** (duplicates, silence, sync) have real causes: look at the frames before touching a threshold, and test any change against a real failure case too.
- **Rendering here:** on the cloud machine, stills need `REMOTION_GL=swangle` (about 20–40 s per frame at 0.5 scale). A full Short renders in the cloud in about 10–25 min.
- **Downloads:** releases are public downloads (the repository is public, which keeps rendering free). Artifact downloads are blocked here; use the release URLs.
