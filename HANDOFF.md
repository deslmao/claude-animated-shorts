# HANDOFF: where everything stands (keep this current)

**Last updated:** 26 Nov 2026.

**Repo and branch:** `deslmao/claude-animated-shorts`, branch `claude/admiring-hopper-kbrb3d`. Never push elsewhere,
no pull requests.

**Start here:**
1. Read `CLAUDE.md` (the production rules).
2. Read `_log/DECISIONS.md` (why things are the way they are).
3. Read `_log/PROMPTS.md` (the owner's exact words, newest at the bottom).

## Status, 26 Nov 2026 (read this first)
- **The direction is "Everyday Impossible"** (`productions/research/next-direction-2026-11-24.md`). GTA is dropped; the
  GTA Ep 1 video is finished (`productions/gta-gf-1/`), and Ep 2 is on hold.
- **First story:** The Friday Pizza, a screenplay awaiting the owner's approval (`productions/friday-pizza/screenplay.md`).
  Open point: it has two short flashbacks, and the new framework says zero.
- **Engine 4, Episode 1: "In my world, the highest number wins every argument"** (`productions/in-my-world-2/`: script.md, shot-list.md, audio/, headstand-test.mp4). Script, voices (Leo
  `7g0kmMsyK30rO4fU1Sli`), props and the headstand are built and committed; the owner's viral SFX pack is in `animation-studio/assets/sfx/viral/`. **27 Nov: the owner reviewed the first 540p preview and asked for a cinematography upgrade (triangle staging, OTS / low / high angles, eyes in the upper-middle third, night Beat 2, hidden number in Beat 4, pancake + hands inserts). It is committed; a 6-frame contact sheet is with the owner; the owner gave the go after three polish fixes; the owner approved preview 2; the FINAL 1080p render is requested (render-request.json); next: QA (qa-request.json) and the dual export. Earlier: waiting for the final "go" before the cloud
  preview render** (commit `render-request.json` with `preview: true`, `chunks: 20`, `publish: false`; then give the run URL and STOP, never poll). Dual export: `node scripts/dual-export.mjs <render.mp4> in-my-world-2`.
- **Never poll GitHub Actions** (CLAUDE.md): give the run URL and stop.

## The channel in one paragraph
Thinkora makes animated POV horror/mystery Shorts: an everyday situation, then a twist, ending on "what would you do?"
where the comments decide the next part. The owner is under 18, in GMT+11, and posts without a VPN in weekday windows
3:30–5:30 and 8:00–9:30. The main series is **"Don't Eat It"** (Bug, the kitchen, the double "Mum"). Part 1 got 13.5K
views on Instagram, and on YouTube 71% stayed to watch.

## How to make a video (short version)
- **Pipeline:** `animation-studio/`, run `npm run short -- <id> --until approval|narration|checks`.
- **Approval:** the owner approves the viewer script, then `--approve-narration <chars>`.
- **Before any render request:**
  - `--until checks`;
  - `npx tsc --noEmit` (CI fails on unused locals);
  - half-scale stills (`REMOTION_GL=swangle node scripts/stills.mjs Short-<id> <prefix> <frames> 0.5`, then
    `rm -rf /tmp/remotion-webpack-bundle-*`).
- **Render:** commit `render-request.json` (`chunks 20`, `preview true|false`, `publish false`). The workflow only
  starts when that file changes.
- **QA:** after a final, commit `qa-request.json`:
  - `frames` = the composition's real frame count;
  - `seams` = floor(i × frames / 20);
  - `keep` = `productions/<id>/final/Short-<id>.mp4`.
- **QA flags:** the QA run usually shows "failure" for benign flags (blinks or still shots read as duplicates, plain
  walls read as near-blank). Re-render the flagged frames as stills and explain them in `productions/<id>/final/QA-REPORT.md`.
- **Timing table:** copy the scratchpad's `dur.ts` to `scripts/_dur.ts`, bundle it with esbuild, then
  `node out/_dur.mjs <id>`. If the scratchpad is gone, rewrite it: compile the storyboard and print each shot's length.
- **Score:** Eleven Music plans live in `sound/samples/music/<name>.json` (sections ≥ 3,000 ms that sum to the
  timeline). Generate with `python3 sound/samples_fetch.py`. Always use a **new file name** (protected assets are
  additions only).

## Productions: status
| ID | What | State | Next |
|---|---|---|---|
| `breakfast-text` | Don't Eat It, Part 1 | published | — |
| `night-train` | The Last Train | v1 published (scream hook, run 50). **v3 DONE:** reflection hook, 63 s, final run 60 QA'd as publishable (`productions/night-train/final/QA-REPORT.md`) | the owner posts v3 as a NEW upload and unlists the old one; compare its stayed-to-watch with v1's 40–51% |
| `six-seven` | 6 7 | final run 54 QA'd, publishable | the owner posts; check its stayed-to-watch against breakfast's 71% |
| `gta-gf-1` | GTA 6, Explained to Your Girlfriend, Ep 1 (Gordon and Lucy; Blender Miami plates + engine cast), 53.9 s | **DONE.** Final run 64, full QA passed with no flags, MP4 in the repo (`productions/gta-gf-1/final/Short-gta-gf-1.mp4`); publishing package in `publish/` | the owner posts; Ep 2 from `productions/research/gta6-episode-ideas.md`, using the STUDY.md §7 script recipe |
| `breakfast-2` | Don't Eat It, Part 2 | **DONE.** v4 final run 59, full QA passed, MP4 in the repo (`productions/breakfast-2/final/Short-breakfast-2.mp4`), 1:09 | the owner posts (Instagram first); after 24–48 h, read the comments for Part 3 (A · HANG UP / B · STAY ON THE LINE) |

No follow-ups are scheduled.

## Miami / GTA-style look (design phase, 23 Nov)
- **The world:** `blender/miami/miami.py` (headless Blender 4.0 Eevee; `blender -b --factory-startup -P
  blender/miami/miami.py -- <street|beach|motel> out.png [scale]`). Needs `apt-get install blender libegl1
  libegl-mesa0 libgl1-mesa-dri`.
- **The cast:** `animation-studio/src/studio/characters/miami.ts` (Gordon and Lucy). Sheet: the
  `CharacterSheet` page `miami` (`miami-cut` = transparent). Cut-outs in `blender/miami/cast/`.
- **Stills:** `productions/miami-look/` (v1 and v2). The next look gaps: denser props, finer asphalt, characters lit
  more like the scene.
- **Engine opt-ins for the STUDY.md grammar:** `alive: true`, `captionStyle: "short"`, `transition: "dissolve"`.
- **The cast names:** Gordon and Lucy (owner, 23 Nov). The third dressing pass is approved (v3 stills).
- **Poly Haven is now allowed** on the Default environment (`polyhaven.com`, `dl.polyhaven.org`, `api.polyhaven.com`).
  **v4 done:** Poly Haven textures, a real sky and real plants are in (`blender/miami/ASSETS.md`; fetch with
  `python3 blender/miami/assets_fetch.py`, needs `python3-numpy`). Stills: `productions/miami-look/still_v4_*`.
  Half-scale Eevee takes about 4.5 min per still here. **Waiting on the owner:** approval of the v4 look.

## Open owner requests
1. **STUDY.md:** done from 5 of the 10 Shorts the owner uploaded on 23 Nov (`STUDY.md`). Waiting for the other 5, plus
   a turn to count. The main findings:
   - their picture is never still (1.5–5% still frames, against our 40%);
   - 5-frame dissolves and ~16-frame camera moves;
   - captions of 1–2 words at 70% of the height;
   - sets 1.3–2.4× as detailed;
   - a walk step of ~10 frames.

   **Proposed next step (not approved yet):** apply items 1–3 of its "What this suggests" list in the engine as opt-ins.
2. **Blender Phase 2.** Phase 1 is done (`docs/blender/PHASE1-INVESTIGATION.md`). The proposed next step is a
   `workflow_dispatch` Blender benchmark workflow (official LTS, one representative 3 s shot, three engines, full
   resolution). Wait for the owner's go-ahead.
3. **Part 3 of Don't Eat It** comes after Part 2 has been out about 24–48 hours. It opens on the most-liked answer:
   A · HANG UP or B · STAY ON THE LINE.

## Logs
- **`_log/PROMPTS.md`:** every owner prompt, word for word. Rebuilt from the transcript on 23 Nov; append each new
  prompt.
- **`_log/DECISIONS.md`:** append each decision with its date and reason.
