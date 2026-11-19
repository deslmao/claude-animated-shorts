# Thinkora production rules (all videos)

The goal is to publish very good videos consistently, not to keep improving the system. Use the existing pipeline
(`animation-studio/`, `npm run short -- <id>`); don't rebuild or refactor working systems. Keep changes narrow and
specific to the production. Additions only to protected assets (`npm run test:library`).

## Before production: estimate the cost
These rates were measured on this container (CPU WebGL):
- **Full-resolution local render:** about 4.4 s per frame. A 50 s film is 1500 frames, about 1 h 50 min.
- **540p preview** (`--preview`): about 1.5 s per frame, plus about 40 s to bundle. A 50 s film takes about 40 min;
  a 3 s section about 2 min.
- **Engine still** (`scripts/stills.mjs`): about 4 s at half scale, 12 s at full scale, plus the bundle.
- **Cloud 540p preview** (20 chunks, `render-request.json` with `"preview": true`, `publish: false`): about 15 min wall
  time for a 3-minute film (verified 19 Nov 2026, run 34). This is how previews are made.
- **Cloud final render** (20 chunks, `render-request.json`, `publish: false`): about 16 min wall time, then the QA
  workflow (`qa-request.json`, with seams and keep) about 3 min.

## Storytelling gate (mandatory, every new production)
Follow `productions/research/storytelling-system.md`.
- **A narrator carries the story;** characters speak only after the narrator has set up who they are and what's
  happening.
- **Explain every strange thing in words** the moment it appears.
- **No line may rely on knowledge the viewer wasn't given.**

Every new storyboard needs a `clarity` block: the premise, plus each fact the viewer must be told, with the words that
tell it. `npm run short` fails without it. The owner approves `productions/<id>/viewer-script.md`, not a screenplay.

## Preview workflow
1. **Validate and check first** (`--until checks`): it's free, and it catches framing, clearance and timing problems
   before any render.
2. **Look at half-scale stills** of the key frames (one batch, `stills.mjs ... 0.5`) to find composition problems.
3. **Render the 540p preview through GitHub Actions**, not in this container: commit `render-request.json` with
   `"preview": true`, `"chunks": 20`, `"publish": false` (the existing parallel renderer; nothing else changes). The
   preview is uploaded as the run's artifact `Short-<id>_preview-run<N>`.
   - This session can't download artifacts. The owner downloads the preview and uploads it here, and you inspect it
     for genuine visual and technical problems. Don't skip the inspection.
   - Render a preview in this container only if GitHub Actions genuinely can't (for example, the workflow itself is
     broken).
4. **For a problem, fix and re-render only that shot or a short section around it**, at 540p. A short section
   (about 3 s, about 2 min) can be rendered locally:
   `node scripts/render.mjs Short-<id> --preview --frames a-b --audio audio/Short-<id>.mp3 --out <file>`.
   Never re-render unaffected shots.
5. **Use full-resolution stills only for detail checks** (readable text, a crack, a thin line), and only for those
   frames.
6. **Make one focused correction pass,** unless a defect is serious.
7. **The final quality check is the cloud render plus its full QA.** Don't skip it, and don't duplicate it locally.

## Claude usage
- Keep reports concise: what changed, what was tested, what remains.
- Read only the files the task needs. Reuse existing assets, rigs, camera moves and rendering.
- Run tests once after changes that affect them (an engine change means `npm test`; a storyboard-only change means
  `--until checks`). Don't re-inspect unchanged files or re-run unaffected tests.

## Known engine behaviour (avoid re-discovering it)
- **Walking and running actors are drawn side-on.** To show a run away from or toward the camera, use
  `walk.view: "back" | "front"`. For stairs, add `walk.footfalls`: the tread contacts, a foot landing on each.
- **A figure seen from steeply above flattens.** Keep cameras within about 50° of horizontal on actors.
- **The camera check counts any camera below floor level (y < 0.05) as inside scenery.**
- **A caption lingers about 0.25 s after its word,** so hold 0.3 s before cutting to a readable insert.
