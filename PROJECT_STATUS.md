# Project status: automated animated Shorts studio

**Read this first in every new session.** It records what exists, how the pieces connect, what's left, and the rules
the owner has set.

Last updated: Stage 3A (reliability and foundation).

## Owner's decisions (do not change without asking)
- **Format:** vertical 1080 × 1920, 30 fps, about 55–65 s per Short. The style is the creator's look: 2D cartoon characters in a colourful 3D world.
- **Narrator:** George (`JBFqnCBsd6RMkjVDRZzb`, `eleven_multilingual_v2`, stability 0.5, similarity 0.75, speed 1.10).
- **Captions:** on by default.
- **Rendering:** cloud only, on GitHub Actions. The owner's Mac is school-managed: never ask them to install anything or run terminal commands.
- **Paid ElevenLabs generation** only after the owner has approved the script and the character cost.
- **Secrets:** the ElevenLabs key lives only in the cloud environment's network secret (`ELEVENLABS_API_KEY`). Never print, log or commit it.
- **Git:** develop on `claude/admiring-hopper-kbrb3d`. Never merge into `main` without approval.
- **Never weaken a QA check to make it pass.** Fix the cause.
- **Don't break existing work:** BridgeShort and every existing video must keep rendering identically; `npm run test:regression` proves it.

## Architecture
```
topic → research → script ──(owner approves script + cost)──→ storyboard (src/studio/stories/<id>.ts)
  → npm run test:story        validate names, framing, timing, captions (free)
  → npm run voice -- <id>     dry run: new lines + cost; --generate creates only missing lines (voice/cache, never repaid)
                              writes the word timings (src/studio/stories/voice/<id>.ts) and the soundtrack
                              audio/Short-<id>.mp3 + its fingerprint audio/Short-<id>.json
  → npm run preflight -- Short-<id>   refuses stale or missing narration/soundtrack (also runs in CI before rendering)
  → render-request.json       commit → GitHub Actions: plan → chunks → join + soundtrack → QA → Release
```

| Part | Where | State |
|---|---|---|
| Creator's original (BridgeShort) | `animation-studio/src/videos/bridge/`, `templates/` | ✅ unchanged; regression frames 608 and 1417 |
| Studio look (ink, lens, grade, lights) | `src/studio/look/` | ✅ |
| Characters and acting | `src/studio/characters/`, `cards/` | ✅ Milo, Juno, Gus + extras in 6 eras; 29 faces, 26 acts, 21 gestures; idle life, talk, speak (lip-sync) |
| Sets and props | `src/studio/sets/`, `props/`, `materials/` | ✅ 7 sets, 52 marks, 28 views, 63 props |
| Camera | `src/studio/camera/` | ✅ 13 moves in the engine; 11 in the storyboard format |
| Effects | `src/studio/fx/` | ✅ 16 kinds |
| Storyboard → film | `src/studio/story/` | ✅ compile, timing, validate, captions, caption placement, fingerprint |
| Narration | `src/studio/voice/`, `scripts/voice.ts` | ✅ George; cached lines; word timings snapped to the real audio |
| Cloud render farm | `.github/workflows/render.yml`, `publish.yml`, `.github/actions/qa-publish` | ✅ chunks, join, QA, Release; preflight guard |
| QA | `scripts/qa.mjs` | ✅ frame count, duplicates, sync, audio present and not silent, loudness, black/frozen spans |
| Music and SFX | `templates/audio/` (bridge only) | ❌ Stage 3B |
| Story props, follow camera, crowds, running, asset registry | — | ❌ Stage 3C |
| One command (`npm run short`) | — | ❌ Stage 4 |
| Topic → research → script → storyboard | — | ❌ Stage 5 |
| Full 55–65 s test; pirate reuse test | — | ❌ Stage 6 |

## Tests (run them; never claim something works without them)
| Command | What it proves | Time |
|---|---|---|
| `npm test` | lint and types, framing of every designed view, every storyboard valid with captions in order, protected library intact | ~1 min |
| `npm run test:regression` | existing videos (BridgeShort, the yawn demo, MovesTest) render pixel-identical to `tests/reference/` | ~3 min |
| `npm run preflight -- Short-<id>` | a Short is ready to render: valid, fully narrated, soundtrack fresh | seconds |
| `node scripts/qa.mjs <mp4> <dir> --frames N --audio required` | a finished video passes QA (the cloud runs this too) | ~30 s |

- **Changing a protected asset on purpose:** existing videos would change, so say so in the commit and update the references with `npm run test:regression -- --update`.
- **Adding assets:** after adding new ones, `npm run test:library -- --update` protects them. It refuses while anything existing is broken.

## Working notes for Claude sessions
- **Working directory:** `animation-studio/`. On the cloud machine, rendering needs `REMOTION_GL=swangle`; the browser is detected automatically.
- **Local stills:** `node scripts/stills.mjs <Comp> <outPrefix> <frames> 0.5`, about 20–40 s per frame.
- **Cloud render:** edit `render-request.json` (composition and chunks) and push. Watch the run on `api.github.com` with `curl`. Download from `https://github.com/deslmao/claude-animated-shorts/releases/download/<tag>/<file>`; artifact downloads are blocked here.
- **Measured cost:** about 7.5 runner-seconds per frame. A 60 s Short is about 225 runner-minutes, roughly 15–25 min of wall time with 20 chunks. It's free because the repository is public.
- **ElevenLabs:**
  - `npm run voice -- <id>` without `--generate` never spends anything.
  - Only `/v1/` paths are allowed by the network policy.
  - The proxy adds the key; code never reads or prints it.
- **Known non-issues:**
  - The bridge's Kenney GLB models give 404s in logs; they were never in the repository, and the bridge uses its fallbacks.
  - `src/Phone.tsx.` is an unused leftover from the original template.
- **Documentation:** `docs/LIBRARY.md` (asset catalogue), `docs/STORYBOARD.md` (format), `docs/VOICE.md` (narration), `docs/CLOUD_RENDERING.md` (render farm). `SKILL.md` is the creator's original process; the rewrite is due in Stage 5.

## History
| Stage | What | Proof |
|---|---|---|
| 0 | Cloud render farm, determinism fixes | BridgeShort run 3 |
| 1A–1D | Studio library: look, characters, sets, camera, acting | MovesTest run 4 |
| 1E | Storyboard → film | yawn demo run 5 |
| 2 | George narration, captions, lip-sync | yawn demo run 7 (QA passed, −14 LUFS) |
| 3A | Preflight guard (stale or missing narration and soundtrack), silent-audio QA check, CI validation, lint clean, library protection, picture regression, this file | `npm test`, `test:regression`, preflight negative tests |
