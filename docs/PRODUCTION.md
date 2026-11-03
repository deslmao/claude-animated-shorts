# One-command production

```
npm run short -- <story-id>
```
This runs a storyboard all the way to a published, checked MP4. Progress is recorded in `productions/<id>/status.json`.
Run the same command again at any time and it **resumes**: every stage that is done and whose inputs haven't changed
is skipped in under a second. When something changes, that stage and everything after it run again. Cached narration
is never paid for twice.

| # | Stage | What it does | Stops when |
|---|---|---|---|
| 1 | validate | storyboard errors: names, 9:16 framing, timing, word anchors, props, crowds | an error: fix the storyboard |
| 2 | assets | every character, set, prop, item, effect, mood… used exists in the library (`productions/<id>/assets.json` lists what was reused) | something is missing: create it first ([LIBRARY.md](LIBRARY.md), "Adding an asset") |
| 3 | approval | counts the new narration lines and their characters, estimates the length, writes `productions/<id>/approval-request.md` | **always, until the owner approves the script and cost** |
| 4 | narration | generates only the missing lines (ElevenLabs, George) | a generation error |
| 5 | sound | music, ambience, effects, mix to −14 LUFS ([SOUND.md](SOUND.md)) | a build error |
| 6 | checks | preflight (narration complete, soundtrack fresh) + library protection | a failed check |
| 7 | review | renders the hook, the middle of every shot, both sides of every transition, every speaking character and the ending → `productions/<id>/review.jpg`, plus a determinism spot check | **always, until the sheet has been looked at** (`--reviewed`) |
| 8 | render | commits the production and a render request, pushes, follows the GitHub Actions run (20 chunks, join, cloud QA, release) | the run fails: the failing jobs are named |
| 9 | final | downloads the published MP4, runs QA again, checks the published audio lines up with the soundtrack, makes `final_strip.jpg` | QA or alignment fails |

## Options
| Option | Use |
|---|---|
| `--approve-narration <characters>` | record the owner's approval. The number must match the current cost, and the approval is tied to the exact script text: change a word and it has to be approved again |
| `--reviewed` | the review sheet was looked at and passes |
| `--redo <stage>` | force a stage and everything after it to run again |
| `--until <stage>` | stop after a stage |
| `--chunks <n>` | number of render chunks (default 20) |
| `--status` | print the recorded status |

## The production folder (`productions/<id>/`)
| File | Content |
|---|---|
| `research.md`, `script.md` | research with sources, and the script (Stage 5, see [TOPIC_TO_VIDEO.md](TOPIC_TO_VIDEO.md)) |
| `approval-request.md` | what the owner approves: the script, the characters, the credits, the estimated length |
| `assets.json` | every library asset the video uses |
| `review.jpg`, `review.md` | the review sheet and its frame list |
| `final/qa.md`, `final/contact_sheet.jpg`, `final_strip.jpg` | final QA report and frames |
| `status.json` | stage by stage: state, time, inputs fingerprint, details, the render run and the release |
| `Short-<id>.mp4` | the finished video (not committed: it is published as a GitHub Release) |

The first full run, on the yawn demo, rendered as run 9 with 20 chunks in about 9 minutes, passed QA, and its published audio lined up exactly with the soundtrack.
