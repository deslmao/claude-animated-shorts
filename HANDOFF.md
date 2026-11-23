# HANDOFF: where everything stands (keep this current)

**Last updated:** 23 Nov 2026, ~05:30 UTC.

**Repo and branch:** `deslmao/claude-animated-shorts`, branch `claude/admiring-hopper-kbrb3d`. Never push elsewhere,
no pull requests.

**Start here:**
1. Read `CLAUDE.md` (the production rules).
2. Read `_log/DECISIONS.md` (why things are the way they are).
3. Read `_log/PROMPTS.md` (the owner's exact words, newest at the bottom).

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
| `night-train` | The Last Train | v1 published (scream hook). **v3** (reflection hook, 63 s) final render requested 23 Nov ~04:58 UTC | QA (1,890 frames), then QA-REPORT and PUBLISHING update; tell the owner to post as a new upload and unlist the old one |
| `six-seven` | 6 7 | final run 54 QA'd, publishable | the owner posts; check its stayed-to-watch against breakfast's 71% |
| `breakfast-2` | Don't Eat It, Part 2 | **v4** (In Part 1… recap, top-comment card, "You were right", 69.0 s, 2,069 frames) final render requested 23 Nov ~04:52 UTC. Runs 57 and 58 are superseded | QA, then QA-REPORT and PUBLISHING (`run<N>`, 1:09); post on Instagram first |

**Two follow-ups are scheduled** (send_later). Both use `qa-request.json`, so do Part 2's QA first, then the train's.

## Open owner requests
1. **STUDY.md (the Rick's clips study).** Blocked: the owner needs to upload the 10 newest Shorts and confirm the
   channel. Then analyse every frame at 30 fps with ffmpeg:
   - frames per walk step;
   - gesture durations;
   - shot lengths;
   - caption position and size;
   - light direction;
   - background fill.

   Grammar only, never copy.
2. **Blender Phase 2.** Phase 1 is done (`docs/blender/PHASE1-INVESTIGATION.md`). The proposed next step is a
   `workflow_dispatch` Blender benchmark workflow (official LTS, one representative 3 s shot, three engines, full
   resolution). Wait for the owner's go-ahead.
3. **Part 3 of Don't Eat It** comes after Part 2 has been out about 24–48 hours. It opens on the most-liked answer:
   A · HANG UP or B · STAY ON THE LINE.

## Logs
- **`_log/PROMPTS.md`:** every owner prompt, word for word. Rebuilt from the transcript on 23 Nov; append each new
  prompt.
- **`_log/DECISIONS.md`:** append each decision with its date and reason.
