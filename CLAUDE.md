# Thinkora production rules (all videos)

The goal is to publish very good videos consistently, not to keep improving the system. Use the existing pipeline
(`animation-studio/`, `npm run short -- <id>`); don't rebuild or refactor working systems. Keep changes narrow and
specific to the production. Additions only to protected assets (`npm run test:library`). The one approved exception is
Engine 4 (below): an opt-in pipeline for new videos that sits beside the existing one.

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

## Format system (the owner's standing rule; revised 26 Nov 2026: every new video)
- **No frame-0 banner, no intro title card, no end-screen CTA.** The 21 Nov frame-0 banner rule is withdrawn. Open
  *in medias res*, with physical visual action in the first 0-2 s. The only call to action allowed is one 1-second line
  built into the story, and only when it naturally strengthens the ending; otherwise cut cleanly. The comment question
  goes in the pinned comment. Published productions keep what they have: never edit an old storyboard to remove its
  banner or cards.
- **The hook:** one concrete sentence, readable at a glance. Either an everyday situation then the twist ("Imagine
  your mum is making you breakfast. Then she texts you."), or the One-Rule + Irony hook (winning-patterns.md). No
  vague teasers.
- **Story shape:** a 3-act arc with active tension, not a list: a 0-2 s physical hook, then an escalating complication
  and rising stakes, then a twist payoff. No listicles. The default framework is the 7-Beat "One-Rule World" in
  `productions/research/winning-patterns.md` (a default to adapt, not a template to force).
- **Narration:** short, punchy, conversational sentences; no uniform explainer tone. Put a deliberate 0.2-0.3 s beat
  pause right before each punchline and reveal, and use dynamic vocal delivery (ElevenLabs v3 audio tags, a changing
  pace and weight).
- **Pace:** a visual change (a cut, an insert, a new angle or a big camera move) every 1.7-2.1 s on average on engines
  1-3; every 1.5-2.0 s on Engine 4.
- **Variety:** 5-6 distinct rooms or lighting setups per video.
- **Length:** 40-70 s by default (44 of the 50 top videos studied fall in that range); a story built on the 7-beat
  framework may run 60-120 s.
- Check these numbers on the timeline before rendering, and report them with each preview.

## GitHub Actions: never poll (the owner, 26 Nov 2026)
- After committing a `render-request.json` or `qa-request.json`, **give the owner the run URL and stop immediately.**
  One lookup right after the push to get the URL is fine; if the run isn't listed yet, give the Actions page
  (`https://github.com/deslmao/claude-animated-shorts/actions`).
- **Never poll or wait for a render or QA run:** no repeated `actions_list` / `actions_get` calls, no `sleep` or
  `until` loops, no `send_later`, no `ScheduleWakeup`, no scheduled check-in, no Monitor on a run.
- The owner says when the run has finished (and uploads the preview). Only then read the run result, the logs and the
  artifacts.

## Engine 4 pipeline rules (owner-approved 24-26 Nov 2026; plan: `docs/architecture/engine4-proposal.md`)
**Opt-in only. Never migrate silently.**
- Preserve the existing pipeline (engines 1-3). Engine 4 is selected explicitly in a new storyboard (`engine: 4`), for
  new videos only.
- Keep every existing production and its configuration unchanged. Never silently migrate an older video. Any Engine 4
  code path must leave `engine <= 3` output identical (check with `npm run test:library` and preflight).
- Build it in phases. Each phase ends with the test stills or clip agreed in the plan, shown to the owner for review
  before the next phase starts. No renders beyond those agreed test frames until the owner approves.

**The five standards (non-negotiable for Engine 4 videos):**
1. **Unified 3D PBR environments.** One cohesive lighting engine for every environment (no mixing flat toon rooms with
   Blender scenes). No outlines on backgrounds or furniture: outlines stay on the 2D characters only. Real lights
   (warm practical lamps plus a cool rim or window light), real cast shadows from the characters onto floors and walls,
   ambient occlusion, and light atmosphere (fog, dust motes, bloom).
2. **Dynamic 3D camera.** Never hold on a flat poster, wall frame or infographic for more than 2-3 s. Use physical
   moves (dolly, truck, orbit, over-the-shoulder) with a subtle handheld drift on every shot, so no frame is ever
   frozen. Vary the focal length (24-35 mm establishing, 85 mm close-ups with depth of field) and add a 5-10 frame
   impact shake on hits, reveals and punchlines. A visual beat or angle change every 1.5-2.0 s.
3. **Expressive character animation.** 2-3 distinct key poses per shot (leaning in, slumping, gesturing, prop
   interaction), with snappy fast-out slow-in easing and slight squash and stretch or overshoot. Ambient secondary
   motion in every scene (flickering lights, dust, swaying objects, background movement).
4. **Viral pacing and mobile composition.** In medias res, no title cards or banners. Captions of 1-2 words, centred in
   the mobile safe zone, at **5-6 % of the screen height (about 100-115 px at 1080x1920)** with a heavy stroke or drop
   shadow. Any number or stat is a bold, oversized 3D or full-screen element, never tiny text inside a wall frame.
5. **Audio-visual punch.** Every physical action, camera whip and reveal has a layered SFX cue, and the music ducks
   6-10 dB (8 dB by default) under dialogue punchlines.

**Phase 1 technical guardrails (lighting and sets):**
- **Character outlines:** when the screen-wide outline pass (`look/ink.ts`) is off for Engine 4 worlds, Gordon, Lucy and
  every other 2D character keep clean outlines from their own shaders or textures, so they pop against the realistic set.
- **Colour management:** match Blender to three.js: ACESFilmic tone mapping and correct sRGB / linear colour spaces, so
  baked lightmaps aren't washed out or crushed. Bake the indirect bounce light into lightmaps; use live three.js lights
  for the dynamic character shadows and rim lighting.

**Audit gates (inspect and cite before changing anything):**
- **Before Phase 2:** inspect and cite the exact camera controller files in the codebase before modifying the camera
  system.
- **Before Phase 4:** inspect and cite the exact audio and SFX pipeline files before building automatic SFX and 8 dB
  music ducking.

## Publishing description template
Every description (the YouTube description, and the caption on TikTok and Instagram) carries this advertiser-friendly
disclaimer before the hashtags, word for word: "This is an original, fictional animated story made for entertainment.
All the characters and events are made up, and nobody is actually hurt." Keep the existing rules: the AI disclosure
note and the hashtag limits in each video's `publish/PUBLISHING.md`.

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
   - After pushing the request, give the owner the run URL and stop (see "GitHub Actions: never poll").
4. **For a problem, fix and re-render only that shot or a short section around it**, at 540p. A short section
   (about 3 s, about 2 min) can be rendered locally:
   `node scripts/render.mjs Short-<id> --preview --frames a-b --audio audio/Short-<id>.mp3 --out <file>`.
   Never re-render unaffected shots.
5. **Use full-resolution stills only for detail checks** (readable text, a crack, a thin line), and only for those
   frames.
6. **Make one focused correction pass,** unless a defect is serious.
7. **The final quality check is the cloud render plus its full QA.** Don't skip it, and don't duplicate it locally.

## Logs and handoff (the owner, 23 Nov 2026)
- Append every owner prompt, word for word, to `_log/PROMPTS.md`; every decision (with its date and reason) to
  `_log/DECISIONS.md`; and keep `HANDOFF.md` current, so anyone can take over at any moment.

## Claude usage
- **The engine has a knowledge graph** (`graphify-out/graph.json`, `graphify-out/GRAPH_REPORT.md`: every function,
  theme, set, prop and story in `animation-studio/src`, and how they connect). To find where something lives or what
  uses it, query it first (`graphify query "<question>"`, `graphify explain "<name>"`) instead of reading files to
  search. Open only the file you then need to edit. After engine changes, refresh it with `graphify update` (code
  only, no model tokens).
- Keep reports concise: what changed, what was tested, what remains.
- **Every completed-video response includes the GitHub link to its titles and descriptions:**
  `https://github.com/deslmao/claude-animated-shorts/blob/claude/admiring-hopper-kbrb3d/productions/<id>/publish/PUBLISHING.md`
  (the owner's standing request).
- Read only the files the task needs. Reuse existing assets, rigs, camera moves and rendering.
- Run tests once after changes that affect them (an engine change means `npm test`; a storyboard-only change means
  `--until checks`). Don't re-inspect unchanged files or re-run unaffected tests.

## Known engine behaviour (avoid re-discovering it)
- **Walking and running actors are drawn side-on.** To show a run away from or toward the camera, use
  `walk.view: "back" | "front"`. For stairs, add `walk.footfalls`: the tread contacts, a foot landing on each.
- **A figure seen from steeply above flattens.** Keep cameras within about 50° of horizontal on actors.
- **The camera check counts any camera below floor level (y < 0.05) as inside scenery.**
- **A caption lingers about 0.25 s after its word,** so hold 0.3 s before cutting to a readable insert.
- **Any storyboard edit makes the soundtrack stale,** even a camera tweak. Run `--until checks` again right before
  committing a render request, or the workflow stops at preflight.
