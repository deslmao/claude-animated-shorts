# Rendering finished videos in the cloud (no installs, works on a school laptop)

Finished videos are rendered by **GitHub Actions**: free computers that GitHub lends to public repositories. The video
is split into chunks (e.g. 20 pieces of ~100 frames), every chunk renders on its own computer **at the same time**, then
one last computer joins the pieces, adds the soundtrack, checks that no frame is missing, and gives you the MP4.

You only need a web browser and your GitHub login. Nothing is installed on your laptop.

## Who does what
| Step | Who |
|---|---|
| Write, build and preview the video | Claude, in the Claude Code session |
| Start the full-quality render | Claude, by committing `render-request.json` (or you, see below) |
| Wait (about 30-60 min for a 60 s short) | GitHub |
| Download the MP4 | You, in the browser, or Claude sends it to you |

## Downloading a finished video (browser only)
1. Open **https://github.com/deslmao/claude-animated-shorts/actions** (sign in to GitHub if asked).
2. Click the newest **"Render video"** run with a green ✔.
3. Scroll to the bottom, to **Artifacts**. Click the video's name (e.g. `BridgeShort-run2`). A `.zip` downloads.
4. Open the zip: the `.mp4` is inside, ready for YouTube.

Artifacts are kept for 30 days, so download the ones you want to keep.

## Starting a render yourself (optional, browser only)
1. On GitHub, open the file **`render-request.json`** on the working branch.
2. Click the ✏️ pencil (Edit), change `"composition"` to the video's name, and change the `"note"` text.
3. Click **Commit changes**. A new render starts automatically under **Actions**.

| Field | Meaning |
|---|---|
| `composition` | which video (Claude tells you the name, e.g. `BridgeShort`) |
| `chunks` | how many computers share the work (max 20; more = faster) |
| `preview` | `true` = quick half-size 540x960 check, `false` = full 1080x1920 |
| `audio` | soundtrack file; leave `""` to use `animation-studio/audio/<composition>.wav/.mp3` automatically |

## Good to know
- It's free for public repositories. GitHub may queue some chunks when it's busy: that only makes the render slower.
- If any chunk fails, the run is red and no video is made. Claude reads the logs and fixes it.
- Your laptop can be closed while it renders. It all happens on GitHub.

## Other options (kept as backups)
- **Inside the Claude session**: `npm run render -- <Composition> --frames a-b` renders parts on the session's own
  computer, and `scripts/concat.mjs` joins them. It's slow (no graphics chip), so it's only for short clips and previews.
- **A personal computer with Node.js** (if you ever have one): see [MAC_RENDERING.md](MAC_RENDERING.md). One command,
  and fastest when there's a real graphics chip.
