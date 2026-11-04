# Pirate Democracy: assessment and staged plan (for approval)

**Nothing has been changed, rendered, released or uploaded.** This is an inspection and a plan only.

## How it was assessed
- **The published video:** run #12 (`productions/pirate-democracy/Short-pirate-democracy.mp4`), watched in full on
  contact sheets at 2 fps, with key frames at larger size.
- **The production files:** script, research and claim check, approval request, review sheet, QA report, cue sheet,
  narration manifest and pipeline status.
- **The current storyboard,** including the two fixes made during the Tickle engine rebuild, run through the current
  validator.
- **Scoring:** the 100-point Thinkora system used for Tickle.

## 1. Current production status
| Item | Status |
|---|---|
| Script | approved, 15 lines, 205 words, sourced claim check (research.md) |
| Narration | all 15 lines generated (George, speed 1.10), cached, **no cost to reuse**. The captain's line is also voiced by George |
| Published render | **run #12** (pre-release `video-Short-pirate-democracy-run12`): 1834 frames = 61.13 s, 1080 x 1920, -14.1 LUFS, QA passed. It was rendered **before** the Tickle engine rebuild |
| Storyboard now | 2 fixes since run #12 (shot 2: Milo's acting; shot 8: cropped hands). It passes every new staging check with **0 warnings**. Not re-rendered |
| Soundtrack | **stale** (engine "sound-1"; the storyboard and the sound rules have changed). It rebuilds for free |
| Sets / cast | one set (`shipDeck`) for all 15 shots; captain, quartermaster, Milo / Juno / Gus in pirate outfits, pirate crowd extras |

**Estimated score of run #12 today: about 64 / 100** (Hook 9, Story 10, Accuracy 13, Animation 8, Visual storytelling 7,
Cinematography 6, Audio 6, Brand 5). There is no critical failure, but it is well below the 85 standard.

## 2. Existing strengths (keep)
- **The script is strong.** It has a surprising hook, a clear arc (contract, shares, injury fund, elections, the
  quartermaster's check on the captain, "wait, pirates were fair?", the economic reason, caveat, payoff) and a funny
  button line.
- **History is well sourced and carefully hedged:** "some crews", "at most two shares", "rules varied".
- **The narration is good,** and so is its sync.
- **The cast is distinctive and the brand is consistent.** The captain's red coat and tricorn and Mags's eyepatch read
  instantly.
- **The ship deck is detailed:** masts, sails, rail, cannons, barrels and a helm view.
- **Technical quality passed every check:** loudness, sync, no black or frozen frames, deterministic chunked render.

## 3. Defects and opportunities (ranked by effect on the finished video)
### A. Visual storytelling: the biggest gap
The narration describes concrete actions, but the picture mostly shows characters standing still while the narrator
says them.

| Time | Shot | Line | What we see now | What the line needs |
|---|---|---|---|---|
| 0:04.7-0:10 | 2 | "...they sign a contract" | Milo and Mags stand far apart; Mags holds a scroll | someone actually **signing** the articles |
| 0:10.5-0:15 | 3 | "at most two shares to a sailor's one" | the captain cheers beside a chest | the **2-to-1 split** made visible |
| 0:15-0:18.5 | 4 | "Lose an arm in battle? The crew pays you" | Gus covers his mouth, then holds a purse | a (friendly) **injured** pirate being paid |
| 0:23-0:27 | 7 | "the crew can **vote him out**" | a very wide shot, tiny figures; **the captain isn't in it** | hands going up **against the captain** |
| 0:27-0:33 | 8 | "so the captain can't grab it all" | the chest fills the foreground; no grab | the captain **reaching** for the loot and Mags **blocking** him |
| 0:34.6-0:39 | 10 | "merchant ships had owners on land... beat sailors into line" | Juno's face only | the **contrast**: owner, harsh captain, sailors |
| 0:39.5-0:45 | 11 | "the crew was the company" | two small figures | the crew **on top**, choosing their officers |
| 0:53-0:56.7 | 14 | "paid for injuries long before most countries" | two figures standing | **"long before"**: a timeline |
| 0:57-1:01 | 15 | "a pirate committee meeting" | tiny figures in a wide shot | an actual **meeting**: table, raised hands, the captain's facepalm |

### B. Hook: 0:00-0:03
- **Static opening:** one captain standing with an open-mouthed grin. "Feared" isn't shown, and nothing changes before
  the question mark at 3.6 s.
- **The open mouth reads as the captain speaking** the narrator's line.
- **Opportunity:** a menacing crew (cutlasses up, scowls), then on "democracies" they all raise their hands to vote.
  That's a visual twist inside the first 4 s, using the existing narration.

### C. Cinematography and mobile readability
- **Figures too small to read on a phone:** two deck-wide shots (7, 15) and several "full" two-shots (2, 8, 11, 14).
- **The same deck, light and framing pattern for 61 s** (visual monotony).
- **Shot 15's golden light** turns the shaded deck purple with orange streaks (`golden` with a 7-degree sun under the
  sails). It looks off for the payoff.
- **Run #12 has crops** that the current storyboard and validator now fix: Gus's shrug at 0:51, raised hands.

### D. Character acting and interactions
- **Nobody touches anything:** no signing, handing over, grabbing, blocking or voting gesture aimed at someone.
- **Run #12 predates gesture easing:** arms snap between poses. A re-render gives the easing, the walk-end turn, marks
  that follow the head and dizzy stars that stay on the head.

### E. Sound
- **Only effect-mark accents** (17 cues). The story's actions have no sound: no quill scratch, coin clink, crowd "aye!"
  and cheer at the vote, murmuring meeting, or ship bell.
- **The captain's line is in the narrator's voice** (George). His mouth moves with it, so it sounds like the narrator.
  This was also the case in Tickle (Gus); it's more noticeable here because the joke is the captain's personality.

### F. Accuracy (minor)
- **Line 12, "the only way a ship of outlaws could work",** is a little stronger than Leeson's argument. He argues the
  rules were the rational way outlaws made cooperation work, without a state.
  - It is acceptable as an attributed paraphrase ("argues").
  - Softening it would mean regenerating one line.
- **Everything else is supported** by the sourced claim check.

### Not problems (no change needed)
- Script structure and pacing (15 shots of 1.4-5.8 s).
- Captions: 100 groups, in order, clear of faces.
- Loudness, sync and the render pipeline.
- The pirate cast and outfits.

## 4. Recommended staged implementation plan
Every stage keeps the safeguards:
- Tickle run #13, run #11 and run #12 untouched;
- BridgeShort pixel-identical (regression after each engine change);
- all tests and negative tests kept, and validators never weakened;
- no paid narration unless you approve it (decisions 1 and 2);
- reusable engine features, not one-off hacks.

### Stage A: reusable engine additions (each with tests)
1. **Explainer diagrams (3 new kinds, same system as Tickle):**
   - `shares`: a coin pile splitting 2 vs 1, captain vs sailor;
   - `chain`: owner on land, captain, sailors (merchant) vs crew electing captain and quartermaster (pirate). It
     animates on words;
   - `timeline`: 1720s pirate articles vs the 1880s first national injury compensation, "long before".
   Accuracy: the 1880s date is Germany's 1884 accident insurance law, to be added to the claim check with its source.
2. **Interactions:**
   - a `write` gesture plus `quill` item (signing on a scroll held by another actor, using the `reach` targeting built
     for Tickle);
   - `grab` / `block` (one actor reaches for a prop, another's stop hand meets it);
   - `vote` beats for **crowd extras** (the crowd raises hands on a word). This is reusable for any vote, cheer or
     classroom.
3. **Items and props:**
   - an arm `sling` look accessory (friendly "injured" pirate, no gore);
   - a deck `table` (barrel and plank) for the meeting;
   - `stool` seats (uses the existing sit mode).
4. **Sound (free synthesis):**
   - `quill_scratch`, `crowd_aye` (crowd shout plus cheer, built from the existing crowd synth), `coins_pour`,
     `crowd_murmur` bed;
   - automatic cues from the new actions (write, vote, coins handed over).
5. **Light:** check a warm "golden" look for under-sail decks *without changing* the shared `golden` preset, which
   would change Tickle's approved shots in future renders. The likely answer is to use `day` for the payoff (decision 5).

### Stage B: storyboard revision (same narration, same timing)
| Shot | Change |
|---|---|
| 1 | Menacing crew with cutlasses around the captain; on "democracies" every hand goes up. Medium framing |
| 2 | Milo signs the articles on Mags's scroll (quill scratch); tighter two-shot |
| 3 | `shares` diagram above Mags; the captain grins, then deflates on "one" |
| 4 | Gus in a sling; Mags hands him the purse (coins) on "pays" |
| 5-6 | Keep (the close-up and the helm speech work); tidy the framing |
| 7 | The captain in frame, the crew facing him; hands up on "vote" (crowd "aye"), the captain shrinks on "out"; medium-wide |
| 8 | The captain reaches into the chest; Mags blocks his hand on "grab" and hands out coins |
| 9 | Keep |
| 10-11 | `chain` diagram with Juno: merchant chain on "owners... beat sailors into line", pirate chain on "the crew was the company" |
| 12 | Keep, but Juno presents the book (no book-on-a-point) |
| 13 | Keep (the shrug now fits) |
| 14 | `timeline` diagram above Gus and Milo |
| 15 | The committee meeting at the deck table: crew on stools, Mags with the scroll, hands up, the captain facepalming; a medium shot; murmur, then "aye" |

### Stage C: review (stops for your approval)
- 49-frame review sheet and 5-6 preview clips (hook, signing / shares, vote, chain diagram, meeting).
- An honest 100-point score with timestamps and screenshots.
- No full render until you approve.

### Stage D: final render (only after approval)
Pre-render checks, then a cloud render to a **new** pre-release (run #14 or later), post-render QA, and a YouTube
package. No upload without your separate confirmation.

## 5. Estimated effort
| Stage | Effort | Cost |
|---|---|---|
| A: engine additions + tests + docs | the largest part: about 1 working session (diagrams 3 kinds, 2 interactions, crowd votes, 3 props / items, 4 sounds) | free |
| B: storyboard revision | about 2-3 hours including stills checks | free (narration reused) |
| C: review sheet + clips + scoring | about 1.5-2 hours, mostly CPU rendering | free |
| D: cloud render + QA + package | about 1 hour | free (GitHub Actions) |
| Optional paid narration | captain voice: 1 line, about 50 ElevenLabs characters; Leeson softening: 1 line, about 80 | about 50-130 credits, only if approved |

**Expected result: about 84-89 / 100** if stages A and B land as planned. As with Tickle, the real score is only known
after the Stage C review.

## 6. Decisions needed from you
1. **The captain's voice:** keep George (free), or regenerate just the captain's line with a distinct character voice
   (about 50 credits)? I recommend a distinct voice: the line is the captain's comic moment.
2. **Line 12 (Leeson):** keep "the only way..." (acceptable, attributed), or soften it, for example "...the best way a
   ship of outlaws could work" (about 80 credits plus re-timing)? I recommend keeping it unless you want maximum caution.
3. **New explainer diagrams** (shares, chain, timeline): approve all three, or choose? I recommend all three; they
   answer the "what we see" gaps for shots 3, 10-11 and 14.
4. **A friendly injury visual** (an arm sling, no gore) for "Lose an arm in battle?": OK?
5. **The payoff light:** use `day` for shot 15 (I recommend this: no engine change, and the shared golden preset stays
   as it is), or design a separate warm deck look?
6. **One set or a second location:** keep everything on the ship deck (recommended; the story happens aboard), or show
   "owners on land" in the old town for shot 10 (more variety, but a location jump in the middle of the explanation)?
7. **Scope:** go ahead with stages A-B as planned, or a lighter pass (storyboard only, with no new engine features).
   The lighter pass would likely land at about 72-76.
