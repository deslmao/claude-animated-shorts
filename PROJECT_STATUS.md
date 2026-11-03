# Project status: automated animated Shorts studio

**Read this first in every new session.** It records what exists, how the pieces connect, what's left, and the rules
the owner has set.

Last updated: Stage 5 (topic-to-video system). Next: Stage 6 (full 55–65 s test, then the pirate asset-reuse test).

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
topic ─ research.md ─ script.md ─ npm run script (checks, approval request) ─ OWNER APPROVES (--approve <chars>)
  ─ npm run assets (search, reuse; create only what's missing in src/studio/themes/) ─ storyboard (stories/<id>.ts)
  ─ npm run short -- <id>:  validate → assets → approval check → narration (only new lines) → sound → checks
                            → review sheet (look, then --reviewed) → render (commit, push, GitHub Actions) → final QA
  ─ GitHub Release (MP4) + productions/<id>/final/qa.md
```

| Part | Where | State |
|---|---|---|
| Creator's original (BridgeShort) | `animation-studio/src/videos/bridge/`, `templates/`, `docs/CREATOR_SKILL.md` | ✅ unchanged; regression frames 608 and 1417 identical |
| Studio look (ink, lens, grade, lights) | `src/studio/look/` | ✅ |
| Characters and acting | `src/studio/characters/` (figure, cast, roster, items, acting) | ✅ 3 leads + extras in 6 eras; 29 faces, 26 acts, 22 gestures; idle life, lip-sync; 17 hand-held items |
| Sets and props | `src/studio/sets/`, `props/` (+ `props/registry.ts`, floor maps) | ✅ 7 sets with marks, views and floor maps; 43 placeable props with variants |
| Camera | `src/studio/camera/` | ✅ 13 moves, all in the storyboard format (incl. follow) |
| Storyboard → film | `src/studio/story/` | ✅ timing, crowds, props, items, running, captions placed off faces, fingerprint |
| Narration (George) | `src/studio/voice/`, `scripts/voice.ts` | ✅ cached lines, word timings snapped to the audio |
| Music and sound effects | `animation-studio/sound/`, `src/studio/sound/` | ✅ 6 moods, 10 ambience beds, 38 effects, automatic cues, −14 LUFS mix |
| Asset library and themes | `src/studio/library/registry.ts`, `src/studio/themes/`, `npm run assets` | ✅ 249 assets searchable; themes mechanism ready (no themes yet: the first one is created by the pirate test) |
| One-command production | `scripts/short.ts`, `docs/PRODUCTION.md` | ✅ resumable, tested end to end (yawn demo run 9) |
| Topic → script → storyboard | `scripts/script.ts`, `docs/TOPIC_TO_VIDEO.md`, `productions/_template/` | ✅ tools and procedure; first real use in Stage 6 |
| Cloud render farm + QA | `.github/`, `scripts/qa.mjs` | ✅ preflight guard, silent-audio check, isolated-stall duplicate check |
| Full 55–65 s test; pirate reuse test | — | ⏳ Stage 6 |

## Tests (run them; never claim something works without them)
| Command | What it proves | Time |
|---|---|---|
| `npm test` | lint and types, framing of every designed view, every storyboard valid with captions in order, protected library intact (incl. every prop builds, every item draws, floor maps and the catalogue are fresh) | ~1 min |
| `npm run test:sound` | every sound effect, ambience bed and music mood renders; the catalogue matches the implementation | ~10 s |
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
| 3B | Automatic music, ambience and effects; −14 LUFS mix | yawn demo run 8 (QA passed) |
| 3C | Story props, held items, crowds (floor maps), running, follow camera, asset registry and themes | capabilities showcase + 3 regression frames |
| 4 | `npm run short`: resumable one-command production | yawn demo run 9, end to end |
| 5 | Research and script templates, script checker and approval, storyboard skeletons, SKILL.md rewrite | self-test |
