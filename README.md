# Claude Animated Shorts

The free Claude skill from the video **"How to Make Viral Animated Shorts Using Claude (Full Workflow)"**.

It makes 55-70 s vertical animated story shorts: 2D characters in a colourful 3D world, with ink outlines, a painted town, lens blur, gliding cameras, a march score and sound effects. Everything is rendered with three.js inside Remotion on your own PC, with no AI video generator.

Proven on **The Bridge That Fell for a Song**, a 67 s short about the 1831 Broughton bridge.

## What's inside
| Path | What it is |
|---|---|
| `SKILL.md` | The studio skill: topic → research → script → approval → storyboard → one-command production (the creator's original skill is kept in `docs/CREATOR_SKILL.md`) |
| `templates/bridge/` | The full source of the bridge short: world, characters, ink, lens blur, grade, story/camera |
| `templates/audio/` | The synthesized sound: SFX, march music, the mix with ducking and loudness |
| `templates/scripts/` | Stills, side-by-side sheets, shot merge and frame-by-frame QA helpers |
| `references/STYLE_BIBLE.md` | The script and visual formula measured from 20 reference shorts |
| `references/reports/` | Seven measured reports: motion, depth, textures, characters, lighting, outlines, grade |
| `references/frames/` | 38 full-size reference frames (540x960) to compare your frames against |
| `references/sheets/` | 20 contact sheets, one per reference short, 60 frames each (1,200 frames) |

## Rendering
- **Cloud (default, no installs):** [`docs/CLOUD_RENDERING.md`](docs/CLOUD_RENDERING.md). GitHub Actions renders a video in
  parallel chunks, joins them with the soundtrack, and gives you a downloadable MP4.
- **Personal computer (optional):** [`docs/MAC_RENDERING.md`](docs/MAC_RENDERING.md). `bash setup-mac.sh`, `npm run benchmark`,
  `npm run render -- <Composition>`.

## Install
1. Copy this folder to `~/.claude/skills/cartoon-3d-short/` (clone it there, or download the ZIP).
2. You need [Remotion](https://www.remotion.dev/) with `@remotion/three`, plus Node, Python 3 and ffmpeg.
3. In Claude Code, say: *"Use the cartoon short skill and make a short about …"*.

Claude then follows `SKILL.md`. It researches the topic and writes the script, and you approve the script and its narration cost. It then builds the storyboard from the reusable asset library and runs `npm run short`, which handles narration (George), captions, lip-sync, music and effects, a cloud render with QA, and publishing. You get a 1080x1920 MP4 and its QA report. Details: `docs/TOPIC_TO_VIDEO.md`, `PROJECT_STATUS.md`.

## Notes
- Set `REMOTION_TMP` to a folder on a big drive. Every Remotion bundle copies `public/` (~1.3 GB) into the temp folder.
- Story, characters and voice should always be your own. Use the references for the look, not the content.

## License
The code and docs are MIT (see `LICENSE`). The reference frames are included for style study only.
