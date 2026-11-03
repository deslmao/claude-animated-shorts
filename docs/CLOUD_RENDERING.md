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
| Wait (measured 41-73 min for the 67.5 s bridge short) | GitHub |
| Quality check (frames, resolution, sound sync, loudness) | GitHub, automatically |
| Download the MP4 | You, from the Releases page (or Claude sends it to you) |

## Downloading a finished video (browser only)
Every finished render is **checked automatically** and then published on the project's **Releases** page:
1. Open **https://github.com/deslmao/claude-animated-shorts/releases**.
2. Find the newest video (e.g. `BridgeShort-run3`). The notes show the quality-check table (resolution, frame count,
   sound sync, loudness).
3. Under **Assets**, click the **`.mp4`** file. It downloads directly (no zip), ready for YouTube.
   `contact_sheet.jpg` is a one-image overview of 20 frames.

Releases don't expire. (The repository is public, so released videos can be seen by anyone with the link. Delete a
release on GitHub once you've uploaded the video, if you prefer.)

Backup route: **Actions** → the run → **Artifacts** → the video zip (kept for 30 days, needs a GitHub login).

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

## Rendering a storyboard Short
Claude normally starts a render through `npm run short -- <id>` ([PRODUCTION.md](PRODUCTION.md)). That commits the production with a render request (20 chunks), follows the run, downloads the published video and checks it again. Measured: the 22 s yawn demo took about 9 minutes with 20 chunks (run 9). A 60 s Short is about 1,800 frames at roughly 7.5 runner-seconds each, so about 15–25 minutes when GitHub runs most chunks at once.

## Safety checks before and after a render
Before anything is rendered, a storyboard Short (`Short-<id>`) must pass `npm run preflight -- Short-<id>`. The cloud runs it in the plan job, right after the type check. It refuses to render when:
- the storyboard has errors (unknown names, a head out of frame, a word anchor that isn't spoken, and so on);
- the Short has no narration, or a line has no generated audio yet;
- the soundtrack `animation-studio/audio/Short-<id>.mp3`, or its fingerprint file `.json`, is missing;
- the soundtrack was built from a different storyboard or narration (stale), or for a different length.

A Short is also never paired with any soundtrack other than its own fingerprinted one. `publish.yml` refuses to publish a Short without `audio: required`. QA fails a soundtrack that is present but silent (quieter than −40 LUFS).

Other compositions, such as BridgeShort and the test compositions, skip the storyboard checks and work exactly as before.

## Good to know
- It's free for public repositories. GitHub may queue some chunks when it's busy: that only makes the render slower.
- If any chunk fails, the run is red and no video is made. Claude reads the logs and fixes it.
- Your laptop can be closed while it renders. It all happens on GitHub.

## Other options (kept as backups)
- **Inside the Claude session**: `npm run render -- <Composition> --frames a-b` renders parts on the session's own
  computer, and `scripts/concat.mjs` joins them. It's slow (no graphics chip), so it's only for short clips and previews.
- **A personal computer with Node.js** (if you ever have one): see [MAC_RENDERING.md](MAC_RENDERING.md). One command,
  and fastest when there's a real graphics chip.

## Limits and costs (checked 2026-11-02)
| Topic | What applies to this project |
|---|---|
| Cost | **Free.** Standard GitHub-hosted runners are free for public repositories. Making the repo private would use the 2,000 free minutes/month of GitHub Free (one 60 s video ≈ 5-6 runner-hours ≈ 300+ minutes, so only ~6 videos a month), so keep it public or expect to pay. |
| Parallel jobs | GitHub Free allows up to 20 concurrent jobs. **Measured on this account: 5-6 at a time**, the rest queue. |
| Time per job | Each chunk of ~100 frames takes 12-25 min (measured about 7 s per frame at 1080x1920). GitHub stops a job after 6 hours, so chunks stay far below that. |
| Matrix size | Up to 256 jobs per run (we use ≤ 20). |
| Whole render (measured) | 67.5 s bridge short, 20 chunks: **41 minutes** (run #3) to **73 minutes** (run #2) from start to published, checked video, depending on how many jobs GitHub runs at once. |
| Downloads | Release files up to 2 GB each (our videos are ~100 MB). Artifacts are kept 30 days. |

These limits can change, so the Actions page always shows the real state of a run.
