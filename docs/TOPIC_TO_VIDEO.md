# Topic to finished video

The owner gives a topic. Claude does the rest, and stops only for **one approval** (the actual story and its narration
cost) before delivering the finished MP4 and its QA report. Everything is kept in `productions/<id>/`.

```
topic ─▶ 1 format + research ─▶ 2 story + visual plan + evaluation ─▶ 3 APPROVAL (owner) ─▶ 4 assets ─▶ 5 storyboard ─▶ 6 npm run short ─▶ MP4 + QA
```

**Stories** (immersive, world-rule, emotional, mystery, serial, and most action-first stories) follow
[STORYTELLING.md](STORYTELLING.md): one `story.md` holds the script and the visual plan, linted by `npm run script` and
evaluated once. The formula in section 2 below is the **explainer** shape, one option among the formats, not the
default for every idea.

## 1. Research (`productions/<id>/research.md`, from `productions/_template/`)
- **Sources:** search the web for at least 2 credible sources (encyclopaedias, universities, museums, peer-reviewed studies, major science or news outlets). Prefer the primary source when a claim is surprising.
- **Facts:** write every fact used, with its source. Mark debated claims as debated, and word them that way in the script ("scientists think", "seems").
- **Claims not used:** list the claims dropped because they're unverified, exaggerated or disputed. Never invent statistics, quotes, dates or names.
- **Angles:** note the hook (the most surprising true sentence), the everyday analogy for the mechanism, and the visual opportunities.

## 2. Script: the explainer formula (`productions/<id>/script.md`, legacy; prefer `story.md`)
One bullet is one spoken line: `- text` for voice-over by George, or `- gus: text` when a character says it (lip-synced). The formula is measured from the reference channel (`references/STYLE_BIBLE.md`):

1. **Hook:** the surprising fact as sentence 1, no setup, at most 16 words.
2. **Setting:** one or two short concrete lines (who, where, when; present tense, a named everyman).
3. **Escalation:** 3–6 beats, each a little bigger; one or two exaggeration jokes, which must be true.
4. **Mystery beat:** one question ("Wait, ...?").
5. **Pivot:** "You see," then the real mechanism through an everyday analogy.
6. **Ironic payoff:** one or two short lines. The video ends on the last word.

Further rules:
- **Length:** 175–205 words gives 55–65 s at George's pace (about 3.2 words/s).
- **Sentences:** about 13 words on average; contractions; plain spoken English; jargon only if the next clause explains it.
- **Never describe what the viewer already sees.** Never name the reference channel.

Then run `npm run script -- <id>`. It:
- checks the words, the estimated length, the hook, the explanation turn and the sentence lengths;
- requires at least 2 sources;
- estimates the cost;
- writes `approval-request.md`.

Fix every FAIL before asking for approval.

## 3. Approval (the owner)
Show the owner:
- the research summary and sources;
- the script;
- the estimated length;
- the characters and credits.

These are all in `approval-request.md`. When the owner approves, record it with `npm run script -- <id> --approve <characters>`. The approval is tied to those exact lines: change a word and it has to be approved again. Nothing paid happens before this.

## 4. Assets: reuse first
- **Search:** `npm run assets -- search <topic words>`, and `npm run assets -- themes`. Pick existing characters, sets, props, items, effects and moods.
- **Missing pieces only:** for anything missing, `npm run assets -- similar ...` first. Then create it in the house style, in its theme folder (`src/studio/themes/<theme>/`), with metadata, and test it with a still. Protect it with `npm run test:library -- --update` and `npm run assets -- doc` ([LIBRARY.md](LIBRARY.md), "Adding an asset").
- **Later videos on the same theme** find and reuse these assets.

## 5. Storyboard (`src/studio/stories/<id>.ts`)
`npm run script -- <id> --storyboard` writes a skeleton with exactly the approved lines (one shot per line) and registers it. Then refine each shot ([STORYBOARD.md](STORYBOARD.md)):
- **Show the events, don't decorate the words** (STORYTELLING.md §3). Each shot has a purpose from its beat (what happens, the subject, the action, what changes); the physical action is shown, not posed. Pictures and narration complement each other rather than repeating each other, and lines can share a shot when the picture shouldn't change.
- **Pacing:** shots of 2–5 s; change the framing when the information changes (wide for geography, insert for evidence, closeUp for a reaction that changes understanding). Give major actions and discoveries time.
- **Camera:** use the library moves: `frame` for holds, `pushIn` on reveals, `closeUp` with `punch` on the punchline, `follow` for runners, `crane` or `orbit` to open or close a place, `overShoulder` for conversations, `dutch` for unease.
- **Transitions:** `flash` after the hook, `fade` on a change of place, `dip` for a jump in time, `cut` otherwise (the reference rarely hard-cuts).
- **Light follows the story:** day for the setup, golden for warmth, night or `interiorCool` for the explanation or a mystery.
- **Acting on the words:** beats, effects (`exclaim` on the surprise, `idea` on the explanation, `question` on the mystery beat), kicks and nods with `{ word: "..." }`, so reactions land 2 frames before their word.
- **Crowds** for public places (`crowd: { count, era }`); a period era for history topics.
- **Music mood:** set `music` if the automatic choice wouldn't fit; use `mood` on a shot where the tone turns.
- **Final check:** run `npm run test:story`: no errors, every subject framed, captions clear of faces.

## 6. Production
Run `npm run short -- <id>` ([PRODUCTION.md](PRODUCTION.md)). It:
1. validates the storyboard and checks the assets;
2. sees the recorded approval;
3. generates only the narration lines;
4. builds the soundtrack;
5. renders the review sheet.

Look at `productions/<id>/review.jpg`. Every shot should be legible, faces framed, captions clear, props right and mouths moving. Fix what's wrong, then continue with `npm run short -- <id> --reviewed`. It renders in the cloud, runs QA, publishes, and verifies the published video.

**Deliver** the release link, the MP4 (send it), `final/qa.md` and `final_strip.jpg`.
