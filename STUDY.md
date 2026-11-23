# STUDY: Rick's clips' animation grammar (private reference)

**Purpose:** learn the grammar only (timing, framing, light, density). Never copy their characters, scenes, frames,
stories or jokes. No frames from these videos are committed to the repo; the frame grabs used for counting live only
in the session scratchpad.

**Material:** 5 Shorts uploaded by the owner on 23 Nov 2026 (the brief asked for 10, so 5 are still to come). Each is
720 × 1280 at a constant 30 fps, 55–61 s.
| # | Title | Frames | Length |
|---|---|---|---|
| 1 | The Prisoner Who Tunneled Into a Bank | 1,659 | 55.3 s |
| 2 | Why Astronauts Can't Flush in Space | 1,836 | 61.2 s |
| 3 | Why Samurai Feared The Flying Thunder | 1,772 | 59.1 s |
| 4 | The Instinct That Makes You Crash | 1,783 | 59.4 s |
| 5 | How Mine Salting Worked | 1,832 | 61.1 s |

**Method:**
- **Every frame of every video was decoded at 30 fps** (8,882 frames). For each consecutive pair of frames the script
  (`analyse.py`, kept in the session scratchpad) measured:
  - the pixel change, and the share of pixels that changed;
  - the histogram change;
  - camera shift (phase correlation);
  - edge density (how full the background is);
  - brightness by halves and the position of the brightest 2%;
  - the caption band (bright text with a dark stroke).
- **Specific actions were counted frame by frame from crops:** a walk, an action (a dive), a reaction close-up, and
  transitions.
- **The same script was run on our own 6 7 preview** for comparison.

---

## 1. Shots and visual changes
A "visual change" is a hard cut, a dissolve, or a big camera move between set-ups:
- a **hard cut** is ≤ 3 frames of frame-wide change;
- a **dissolve** is 4–10 frames with no camera shift;
- a **camera move** is a longer run.

| # | Changes | Hard cuts | Dissolves | Camera moves | Mean gap | Median gap |
|---|---|---|---|---|---|---|
| 1 | 23 | 7 | 9 | 7 | 2.30 s | 1.70 s |
| 2 | 28 | 14 | 6 | 8 | 2.11 s | 1.60 s |
| 3 | 18 | 13 | 2 | 3 | 3.11 s | 2.03 s |
| 4 | 48 | 21 | 7 | 20 | 1.21 s | 0.83 s |
| 5 | 54 | 26 | 4 | 24 | 1.11 s | 0.90 s |
| **All** | **171** | **81** | **28** | **62** | **1.97 s** | **~1.4 s** |

- **Dissolves are short: 4–6 frames (median 5).** Counted frame by frame in video 1, frames 227–233: a straight
  crossfade, with the caption kept on top through it.
- **Camera moves between set-ups take 12–20 frames (median ~16):**
  - eased fly-throughs and pull-backs, such as one continuous 35-frame move from a close-up out through a cutaway of a
    building to the street (video 1, frames 166–205);
  - fast push-ins of ~20 frames onto a face (video 4, frames 757–777).
- **Hard cuts often land on the narrator's stressed word,** and the caption word changes on the same frame.
- **Our format system's 1.7–2.1 s average matches the slower three videos.** The two newest are at 1.1–1.2 s.

## 2. Motion: is something always moving?
| Measure | Rick's (range over 5) | Ours (6 7 preview) |
|---|---|---|
| Frames identical to the previous one | **0.3–1.7 %** | **19.9 %** |
| Frames where almost nothing moves (< 1 % of pixels change) | **1.5–5.2 %** | **40.4 %** |

**This is the single biggest measurable difference.** Their picture is never still:
- the camera is always drifting, pushing or panning, even under talk;
- characters animate on every frame (on ones), with no holds on twos;
- reaction close-ups keep small head and eye movements going.

In ours, locked cameras and still cards leave 40% of the frames frozen.

## 3. Character animation (frame counts)
- **Walk** (video 4, frames 733–768, a side-on power walk):
  - the legs are widest at frames 0–1, 9–11 and 20–22 of the crop;
  - so **~10 frames per step, a ~20-frame cycle (0.67 s)**, with a new drawing on every frame;
  - the body bobs slightly, and the arms swing opposite the legs.
- **Action** (video 1, frames 600–635, a dive into a hole):
  1. **anticipation: 2–3 frames** (a lean back);
  2. **action: ~12 frames** (the card tips and rolls over in 3D and squashes into the hole);
  3. **settle: ~10 frames** (the legs sink out of view);
  4. **hold: ~6 frames** before the dissolve.

  The character cards rotate and tumble in 3D during actions: they aren't only flat sideways cards.
- **Reaction close-up** (video 4, frames 772–814, about 1.4 s):
  - no lip-sync: the narrator carries the words;
  - **eye darts take 2–3 frames, then hold 6–10 frames**;
  - the mustache and mouth shape change about every 8–12 frames;
  - the camera keeps a slow push the whole time.
- **Talking:** characters rarely speak on screen. The story is narrated, and faces react (eyes, brows, mouth shape)
  rather than lip-syncing. That fits CLAUDE.md's "a narrator carries the story".

## 4. Captions
| Measure | Rick's | Ours (6 7) |
|---|---|---|
| Vertical centre (share of frame height from the top) | **0.70** (median, all 5) | 0.64 |
| Text height | **0.025–0.030 of the frame height** (~48–58 px at 1920) | 0.027 |
| Width | **0.22–0.43 of the frame width**: 1–2 words at a time | 0.66: multi-word lines |
| Style | bold white, thin black outline, sentence case, no box | white plus speaker colours |
| On screen | 100% of frames (narration never stops) | |

Their captions are **one or two words at a time, low in the frame (70%), small, centred.** The word changes on the
spoken word, so captions add motion of their own.

## 5. Light
- **Top brighter than bottom** in 4 of 5 videos: +11 to +15 levels (0–255), from sky, windows and ceiling lights. The
  exception is the space video, which is darker on top.
- **Left/right balance is near zero** (−7 to +6), so the key is roughly frontal or overhead, not from the side.
- **The brightest 2% of pixels sit at the centre of the frame** (x 0.46–0.50, y 0.44–0.54), so the subject is the
  brightest thing.
- **Average brightness is 67–120** (ours 60; 6 7 is dark by design).
- **What you can see:**
  - soft daylight with long soft shadows;
  - warm practical lamps and light shafts indoors;
  - a soft blue fill;
  - mild bloom on highlights;
  - depth haze on far planes.

## 6. How full the backgrounds are
| Measure | Rick's | Ours (6 7) |
|---|---|---|
| Edge density (share of edge pixels, mean) | **0.072–0.138** | **0.057** |
| Edge density, busiest 10% of frames | 0.12–0.26 | — |

Their sets carry roughly **1.3–2.4× our detail.** It shows in:
- fully dressed rooms with props on every surface;
- foliage, and cross-section cutaways showing several layers at once;
- textured materials (wood, metal, grass, asphalt) instead of flat colours;
- a background that keeps detail even behind the depth-of-field blur.

---

## What this suggests for us (grammar, not copying)
1. **Never freeze the picture.** Every shot gets a slow camera drift or push, and characters keep idle motion. Target
   < 5% still frames. This is cheap: our engine already has `creep` and idle.
2. **Use 5-frame dissolves and ~16-frame eased camera moves** as transitions, alongside hard cuts on stressed words.
3. **Captions: 1–2 words at a time, centred at ~70% of the height, ~2.7% of the height tall.** We're at 64% with long
   lines.
4. **Fuller sets and better light** (texture, props, soft shadows, haze). This is where a renderer like Blender would
   help most (see `docs/blender/PHASE1-INVESTIGATION.md`). Items 1–3 need no new tools.
5. **Action timing:** 2–3 frames of anticipation, ~12 of action, ~10 to settle. A ~10-frame walk step. Eye darts of
   2–3 frames with 6–10-frame holds.

## Still to do
- **The other 5 Shorts** (the brief asked for the 10 newest). The numbers above are from 5.
- **A turn:** none was isolated cleanly in these 5. It's worth counting from the next batch.

---

## 7. Scripts: why they hold you (added 23 Nov, from transcripts of the same 5 Shorts)
The 5 voice-overs were transcribed with ElevenLabs speech-to-text, which gives word timings. The full transcripts stay
in the session scratchpad and are not committed. Only short phrases are quoted here, for analysis.

| Measure | Rick's (5 Shorts) |
|---|---|
| Words | 204–231 per ~60 s |
| Speaking pace | **3.3–3.9 words/s** (median 3.7) |
| First sentence | **exactly 15 words in all 5**, spoken in ~4 s |
| "You see," (the setup) | starts at **~4 s** in 4 of 5 |
| The big question ("So how…?", "So what's in there?", "But how…?") | at **42 s, 41 s, 33 s, 7 s and 33 s**: mostly at ~55–70% |
| "Well, it's called…" (the named answer) | right after the question, in 3 of 5 |
| On-screen character lines | 0–3 per Short, each 3–10 words, mostly sarcastic |
| Connecting words per Short | "So" 1–5, "But" 0–3, "Then/yet/while" 1–3 |
| Outro, call to action, "subscribe" | **none**: the last line is the payoff |

**The recipe they repeat:**
1. **The opener is a paradox in one 15-word sentence.** An action that seems to contradict itself: a bomb rolled in
   that won't go off; a tunnel out of prison that leads into a bank; gold shot into a gold mine. You can't scroll
   away without wanting to know why.
2. **"You see," gives the stakes in the next 4 seconds:** who, where, and what happens if it goes wrong (10,000 samurai
   attack at sunrise).
3. **Then a chain of cause and effect, never a list.** Each sentence starts with "So…", "But…" or "Then…", so every
   event causes the next and nothing is a loose fact. The trouble escalates: the town adds an arrow, the crashes double,
   the sheriff crashes, he chops the tree down, he hits the stump.
4. **A comic side character every ~10 s:** the tow-truck man with his lawn chair, the rich man banging his head, the
   cellmate's "Congrats." They're small jokes, but they keep the energy up.
5. **The question is held back until ~60–70%.** Then the narrator asks it out loud and names the answer ("Well, it's
   called target fixation"), so the viewer gets a word to remember and repeat.
6. **The explanation takes about 15 s, then the last line lands on an image that loops.** Video 1 ends on "even when
   it's just a stump", which leads straight back into "If you plant a tree…". There's no outro.
7. **Present tense, plain words, and "you"** in the openers and explanations.

**What this means for us** (we keep our own stories, characters and jokes):
- **Open with a one-sentence paradox of about 15 words, under 4 s.** Our "breakfast" hook already does this in two
  lines. Use the same discipline.
- **Turn lists into chains.** Join facts with "So / But / Then" so each causes the next.
- **Hold the main question to ~60% and say it out loud,** then answer it with a name.
- **End on the payoff image, ideally one that loops into the opening.** Put the comment question in the pinned comment
  and caption, not the last 3 seconds. That's a test worth running against our current "comment below" endings.
- **Aim for 3.5–3.8 words a second,** about 200–220 words per minute.
