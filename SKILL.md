---
name: cartoon-3d-short
description: Automated animated Shorts studio. Turns a topic into a finished ~55-65 s vertical (1080x1920, 30 fps) cartoon Short: 2D characters (Milo, Dr. Juno Park, Gus, themed casts, crowds) in colourful 3D sets with ink outlines, lens blur and gliding cameras, narrated by George (ElevenLabs) with word-timed captions, lip-sync, automatic music and sound effects, rendered in the cloud on GitHub Actions with QA. Use when the user gives a topic for a Short, asks for "another video like the yawn / bridge video", a psychology / science / history / fun-fact Short with cartoon characters, or says "use the cartoon short skill".
---

# Animated Shorts studio

The owner gives a topic. Claude researches it, writes the script, gets **one approval** (the script and its narration
cost), then builds the storyboard from the reusable asset library and runs one command that narrates, scores, renders,
checks and publishes the video. Read `PROJECT_STATUS.md` first in every session.

## Owner's rules (always)
- **Format:** vertical 1080×1920, 30 fps, about 55–65 s.
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
1. **Research** (`productions/<id>/research.md`): at least 2 credible sources, every fact sourced, debated claims marked as such.
2. **Script** (`productions/<id>/script.md`): hook in at most 16 words, setting, escalation, a mystery beat, "You see," + an analogy, an ironic payoff; 175–205 words. Then `npm run script -- <id>`, which checks it and writes `approval-request.md`.
3. **Approval:** show the owner the research summary, sources, script, estimated length and cost. Once they approve, `npm run script -- <id> --approve <chars>`.
4. **Assets, reuse first:**
   - Look with `npm run assets -- search <words>` and `npm run assets -- themes`.
   - Create only what's missing, in `src/studio/themes/<theme>/`, after an `npm run assets -- similar ...` duplicate check.
   - Test it with a still, then `npm run test:library -- --update` and `npm run assets -- doc`.
5. **Storyboard:** `npm run script -- <id> --storyboard` writes a skeleton with the approved lines. Refine every shot: sets, cameras, acting on the words, props, held items, crowds, transitions, light. Then `npm run test:story`.
6. **Produce:** `npm run short -- <id>` runs validate → assets → approval check → narration → sound → checks → review sheet. Look at `productions/<id>/review.jpg`, then `npm run short -- <id> --reviewed` runs the cloud render (20 chunks), QA, publishing and the final checks.
7. **Deliver:** the release link, the MP4 (SendUserFile), `final/qa.md` and `final_strip.jpg`.

## Where things are
| Thing | Where |
|---|---|
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
