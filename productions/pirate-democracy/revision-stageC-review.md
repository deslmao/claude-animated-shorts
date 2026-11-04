# Pirate Democracy revision: Stage C review

**Verdict: 86 / 100, with no critical failures.** It is ready for your review, not for an automatic Stage D. As with
Tickle, the score was earned on the visuals. The new voices and the synthesised crowd sounds are measured but have not
been heard by a person. Nothing has been rendered in the cloud, released or uploaded. Tickle run #13, run #11 and run
#12 are untouched.

## How it was reviewed
- **The review sheet:** `productions/pirate-democracy/review.jpg`, 46 frames, regenerated after the last change. The
  determinism check is identical.
- **Six preview clips:** in `productions/pirate-democracy/preview/`, half size, with the final soundtrack. Together they
  cover shots 1-8, 10-11 and 14-15. Each was checked on contact sheets, with frame-to-frame change measurements: the only
  large changes are cuts, the opening flash and the close-up's punch-in, so there are no arm pops. Key moments were
  cropped and checked at full size.
- **Not watched in motion:** shots 9, 12 and 13 (Milo's "Wait, pirates were fair?", Juno with the book, Gus's "rules
  varied" shrug). They were checked on the sheet; they are simple single-character shots.
- **The automated checks:**
  - `npm test` and `npm run test:sound`: pass.
  - The validator: all storyboards valid; Pirate Democracy has **0 warnings** (run #12's storyboard had 2 cropped poses).
  - `npm run test:regression`: 8 / 9 reference frames identical, BridgeShort included. Capabilities frame 20 was
    re-recorded on purpose: Gus's raised map is now visible above his head, where before it was hidden behind it.
  - Preflight: PASS.
  - The soundtrack: -14.1 LUFS, true peak -1.8 dBFS.

## 1. What was changed
### Shown on screen (every action the narrator describes)
| Time | Line | Now |
|---|---|---|
| 0:00-0:04.6 | "most feared pirates... tiny democracies" | Close on scowling pirates with cutlasses out. On "feared" the blades go up, the captain hops and the crew shakes fists. On "democracies" the blades are gone and every hand goes up for a vote, smiling, with a crowd "aye!". The camera pushes in |
| 0:04.6-0:10.4 | "they sign a contract" | Mags holds out the articles; Milo puts down his cutlass and signs them with a quill. The hands meet half-way, the scroll and quill are drawn larger, and a quill sound plays |
| 0:10.4-0:15.2 | "at most two shares to a sailor's one" | `shares` panel above Mags: the loot heap streams out, two purses for the captain on "two", one for the sailor on "one" |
| 0:15.2-0:18.6 | "Lose an arm... the crew pays you" | Gus, arm in a sling, wincing; Mags hands him a purse (coins), and he's relieved (hearts) |
| 0:20.5-0:23.6 | captain's line | His own deep, raspy West Country voice; he raises a finger on "remind" and puts his hands on his hips on "brave" |
| 0:23.6-0:27.8 | "vote him out" | Milo and the crew raise their hands at the captain (crowd "aye!"); he covers his mouth in shock and recoils on "out" |
| 0:27.8-0:33.5 | "the quartermaster hands out the food and loot, so the captain can't grab it all" | Mags hands the captain his purse over the open chest (coins); when he reaches in for more, her blocking palm meets his grabbing hand over the gold |
| 0:35.0-0:45.7 | "merchant ships had owners... The crew was the company" | `merchant` then `crew` panels above Juno. The owner on land, the arrow to the captain and his stick over cowering sailors; then the owner crossed out, the crew on top, their raised hands electing captain and quartermaster, a crown crossed out ("tyrant") |
| 0:53.4-0:57.4 | "long before most countries" | `timeline` panel above Gus (sling, purse): the 1720s pirate payout pops in, a bar sweeps along to Germany's 1884 accident insurance law |
| 0:57.4-1:01.7 | "a pirate committee meeting" | Daylight. The crew round a deck table (articles, inkpot, coins); a murmur, hands up on "might" (crowd "aye!"), Mags raises the articles, and the captain facepalms on "committee" |

### Reusable engine work (any future video)
- **Interactions:**
  - `reach` now targets props as well as actors;
  - new gestures `offer`, `write`, `grab` and `block`: with an actor the hands meet half-way, with a prop they go just
    over its top;
  - items held out or written with are drawn larger;
  - speakers keep these gestures while talking.
- **Crowds:**
  - `beats` make the whole crowd act on a word, in a small ripple from extra to extra;
  - `toward` sets who the crowd faces.
- **Raised hands:** `raiseHand` is angled clear of the head with the hand well above it, and raised arms get an ink
  outline. A vote now reads against sails or sky.
- **Assets:**
  - a sling look accessory (`gusSling`);
  - a `quill` item and a `deckTable` prop;
  - rectangular prop footprints for the overlap check.
- **Explainer panels:**
  - four new kinds: `shares`, `merchant`, `crew` and `timeline`, with stroke-drawn digits that render identically in
    every chunk;
  - "above" panels now sit 0.14 m over the presenter's own head (Juno is unchanged), so short presenters aren't left
    far below the panel.
- **A fix:** the drawn pose is now built from the same exact frame time as the gesture easing. A beat that fell exactly on
  a frame boundary could draw one frame without its blend, an arm snap. This was found on Pirate shot 10.
- **Captions** keep clear of any reach target: a chest being grabbed, an actor being handed something.
- **Validator:**
  - `reach` may name a prop;
  - a held reach that stops short of its target is now an error (2 new negative tests prove the checks catch mistakes).
- **Sound (free synthesis):** `crowd_aye`, `crowd_murmur`, `quill_scratch` and `coins_pour`, cued automatically from
  crowd votes, `write` beats and coins handed over.

## 2. Narration: what was regenerated and why
**Review of George's 15 existing lines:**
- Each line was transcribed with ElevenLabs speech-to-text; all 15 match the script word for word, so there are no
  pronunciation problems.
- Pace and pauses were measured: 12 of 15 lines are within the channel's 3.5-4.1 words / s.

| Line | Decision | Evidence |
|---|---|---|
| Captain: "I'd like to remind everyone that I'm very brave." | **regenerated: new designed voice "Thinkora - Captain Redd"** | Six Voice Design candidates were compared. The chosen one is a deep baritone (123 Hz, against George's 123-139 Hz), the most expressive of the low voices (13.7 semitones of pitch range), darker in tone, with a raspy West Country character. It transcribes perfectly, and speaker diarisation identifies it as a **different speaker** from George. Before, George voiced the captain, so the joke sounded like the narrator |
| "Wait, pirates were fair?" | **regenerated (George, more expressive settings)** | Pitch range 10.4 vs 6.1 semitones in the original at the same pace: the surprise now sounds like a question |
| Hook "Some of history's most feared pirates..." | kept the original | Two alternatives were tried. The expressive take was flatter (7.2 vs 9.5 semitones); the brisk take hit the target pace (3.57 words / s) but was flatter (6.7). Neither was better on both, and the new visual hook carries the energy |
| "And the captain? He's elected." | kept the original | The alternative was flatter (8.9 vs 13.0 semitones) |
| Payoff "...a pirate committee meeting." | kept the original | The alternative was flatter (9.9 vs 11.5 semitones) |
| The other 10 lines | kept | All transcribe correctly; pace in range |

Credits: about 544 for all takes, including the rejected alternatives; about 224,000 remain. Word timings, captions,
gesture beats and sound cues were all re-derived from the new clips by the pipeline, and audio sync is exact in every
clip.

## 3. Scores (100-point rubric)
| Category | Run #12 | Now | Why |
|---|---|---|---|
| Hook and retention (15) | 9 | **13** | Motion in the first second (cutlasses up on "feared", a hop, fists), then a clear visual twist on "democracies" (every hand up for a vote, with a cheer), and a push-in. The hook line is strong. Not higher because the twist lands at 3.6 s, not in the first 2 |
| Storytelling (15) | 10 | **13** | Every line now has its action, and the comic thread runs through: the captain campaigns, is voted down, is blocked at the chest and facepalms at the meeting. A quick watch could miss the shot 12-13 beats (Leeson, "it wasn't perfect"), which are talking figures |
| Accuracy (15) | 13 | **14** | Sourced and hedged; the new panels are accurate (2 : 1 shares, absentee owners vs elected officers, Germany's 1884 law). One point off: line 12's "the only way" is a little stronger than Leeson's argument (kept, as you decided) |
| Character animation (15) | 8 | **13** | Signing, handing over, grabbing / blocking, voting, recoiling, facepalming, the sling; easing, no arm pops, no cropped poses. Deductions: the hands are simple dots and arms are thin, so the handovers read best on a larger phone; the meeting's table hides everyone from the chest down |
| Visual storytelling (15) | 7 | **13** | Four panels turn the history into pictures, and the actions match the words. Deductions: the panel icons are small at phone size (two-column layouts); the timeline is empty above its line for about 0.6 s before "paid" |
| Cinematography (10) | 6 | **8** | Purposeful two-shots, a push-in hook, a close-up, a raised helm shot; no tiny deck-wide shots any more. Deductions: everything is on one deck (by decision); shots 3 and 14 are full shots, so short presenters fit under their panels and read small |
| Audio and narration (10) | 6 | **8** | The captain has his own voice; the actions have sound (quill, coins, three crowd votes, the meeting murmur), mixed under the voice. Not higher until a person has listened: the synthesised crowd "aye!" and murmur could sound artificial |
| Brand (5) | 5 | **5** | Cast, palette, ink, captions consistent; same house style as Tickle |
| **Total** | **64** | **86 / 100** | (critical failures: none) |

## 4. Remaining issues
| # | Time | Shot | Issue | Severity |
|---|---|---|---|---|
| 1 | 3.8 s, 26.0 s, 59.6 s, 57.5 s | 1, 7, 15 | The synthesised crowd "aye!" and meeting murmur have only been measured, not heard. If they sound artificial they can be turned down or off for free | moderate (risk) |
| 2 | 20.5-23.6 s | 6 | The captain's new voice: chosen on measurements (distinct speaker, deep, expressive), not by ear | moderate (risk) |
| 3 | 35-46 s, 53-57 s | 10, 11, 14 | Panel icons are small on a phone (two columns; a timeline) | minor |
| 4 | 53.4-54.0 s | 14 | The timeline panel shows only its line for about 0.6 s before "paid" | minor |
| 5 | 57.4-61.7 s | 15 | The table hides the crew from the chest down; the faces and raised hands read, the bodies don't | minor |
| 6 | 30-33 s | 8 | The handover and the block happen over the chest at waist height: clear, but small hands | minor |
| 7 | 10.4-15.2 s, 53.4-57.4 s | 3, 14 | Full shots for the short presenters (Mags, Gus) under their panels: they read small | minor |
| 8 | 30.2-30.4 s | 8 | Two coin cues 0.15 s apart (Mags picks up the purse and holds it out on the same word): heard as one longer pour | minor |

## 5. Tests
- **`npm test` passes:** lint, typecheck, framing, all storyboards and negative cases, library protection, z-fight.
- **`npm run test:sound` passes.**
- **Regression:** BridgeShort pixel-identical. Capabilities frame 20 was re-recorded on purpose, documented in the
  commit: the raised-hand fix.
- **Unchanged:** Tickle's storyboard and the approved Tickle run #13 video, runs #11 and #12, all releases.

## Ready for Stage D?
**On the scores, yes: 86 / 100 with no critical failures.** Please watch the clips with sound first, especially
`clip1-hook`, `clip3-fund-election-vote` (the captain's voice) and `clip6-timeline-meeting` (crowd sounds), and judge
issues 1 and 2 by ear. If the captain's voice or the crowd sounds don't work, they can be changed cheaply: one line, or
free sound settings. Stage D, the cloud render, a release and any upload wait for your approval.
