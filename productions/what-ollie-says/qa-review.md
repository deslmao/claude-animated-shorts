# What Ollie Says at 3 A.M.: pre-production QA review

These are concrete findings only. Where I found something, I fixed it in the package and the fix is noted. What remains needs a decision or a test, and is listed in §3.

## 1. Fixed during this review
| # | Finding | Fix |
|---|---|---|
| 1 | Clip **214** was meant to show Ollie aged 4, but clip 214 falls in Feb 2024, when he was 3. | Changed to **clip 388** (Aug 2024, aged 4). Clip 412 (28 Aug 2024, aged 4) and clip 903 (Jan 2026, aged 5, old house) were checked. |
| 2 | Ava needed **two** Polish sentences for Finale A but only prepared one. | Episode 4 beat 13: she types Ewa's details as Kuba's words, with both sentences on screen, and practises the first. |
| 3 | Mark said "after work" in episode 4, but he's then "called in", which contradicted it. | It's now his night off ("I'm off tonight, I'll go through it with you"). The flood cancels it, so the adults' plan breaks for a real reason. |
| 4 | "Through the wall, a window latch": Ava's wall is shared with Ollie's room, not Kate's. | Changed to "from across the landing". |
| 5 | The "Ollie at a sleepover" label had no in-world source. | Removed. The clip shows an empty bed with a teddy, which reads without a label. |
| 6 | Ollie knew of a "boy before me" with no source (a hole in story development). | Locked: he found the tin playing hide-and-seek and stuck a dinosaur sticker on it; Kate told him "a little boy from before you were born". His cliffhanger now names the tin, which sends Ava to it. |
| 7 | The deleted clip in episode 2 had an "Ava restores it" beat with no payoff. | Cut. The episode 2 beat is now Kate locking herself in (sympathy, plus the key and the roof set up). |
| 8 | The footprints and locked-door alibi from development were fake suspense, since the audience saw Mum in episode 2. | Cut (in the story lock). The lock now means Kate fears herself, and fails twice: she unlocks it asleep, then goes out of the window. |
| 9 | Night 1 in episode 1: Ava would have heard the L4 shout too. | Night 1 hears only a *muffled* shout through a closed window. She opens it for L5. Night 2 records L4 clearly. |
| 10 | 1,214 clips. | Recalculated after the calendar fix (#11): 14 July 2023 to 14 November 2026 is 1,220 nights, minus 6 missed during the move. See "The archive, checked" in `story-lock.md`. |
| 11 | **Calendar error found by the independent review:** Ollie names the tin at Thursday bedtime, but Ava searched for it on Thursday afternoon. An earlier version of this file wrongly listed the calendar as checked. | Episode 3 now happens on Friday 13 (the river at 03:00 Sat 14), episode 4 on Saturday 14 (the roof at 03:00 Sun 15). Every clip date, Ollie's age in each clip and the Finale A weekdays were recalculated. |

## 2. Checks passed
| Check | Result |
|---|---|
| **Timeline** (2008 and 2008–2026) | Ages: Kate 20 / 38, Kuba 3 / 21, Ava 15, Ollie 3 at the first clip and 6 now. The day-by-day series calendar (`story-lock.md` §2) matches every "morning / evening / 03:00" in the scripts. |
| **The ritual** | The same six lines in the same order in 2008 (episode 4), the clips (episode 4) and the present (episodes 1–4). Kate speaks L2, L3, L4 and L6; the child speaks L1 and L5. It starts on L1, ends on the child's L5-moment line, and without a child it's search or wait. Every scene obeys this. |
| **Polish consistency** | Every line ID appears with identical text across the lock and the scripts (checked by grep). All marked provisional. |
| **Knowledge per episode** | Kate never knows more than the lock allows: one clip in episode 2, "she took Ollie to the river" in episode 4, everything only in B. Mark learns about the sleepwalking in episode 4 and about Kuba only in B. Ollie never knows Kuba's story. |
| **Every reveal has a picture** | Each reveal is carried by an image, not narration: the infrared face (ep2); matching waveforms (ep2); the photo next to the school photo (ep3); the memorial pan (ep3); the hand opening at the water (ep3); the grid, clip 1, clip 388 and clip 412 (ep4); the 2008 sequence (ep4). Voice-over is used **twice in the whole series**: one calendar line in episode 3, and Ewa's message in episode 4, read over pictures that show it. |
| **Visual action** | Every episode has at least one physical set-piece: the window/gate (ep1), the footage and the confrontation (ep2), the walk-past and the river (ep3), the archive and the roof (ep4), the roof (A, B). No static stretch longer than about 6 s without a picture change. |
| **Ava is active** | She records (1), hides a camera and confronts Mum (2), searches the tin, messages the page, keeps watch and follows (3), tells Dad, opens the archive, prepares Polish and takes charge (4), then acts on the vote (5). |
| **Earned emotion** | The knocks (ep1) come before any horror. "If I say my words, she stops crying" (ep2) comes before the danger. Kate's lock (ep2) and "Lock me in" (ep4) keep her sympathetic before the archive. Clip 388 pays off ep1's "Daddy says it hears me". |
| **The vote is difficult** | A has a precedent (clip 412), is safe from the "do not wake" note, and leaves the truth hidden. B has the truth and the reunion, but the note's danger in floodwater and the family cost. Neither card is written as the right answer. |
| **Both finales stand alone** | Each resolves the ritual (A: the clips stop; B: clip 1,215), Kuba's fate (A: cut off; B: the call), Mark (A: doesn't know; B: knows and is hurt) and Ava (A: carries the secret; B: free). Neither needs the other. |
| **Engine rules** | Cameras within about 50° on actors (Finale A overhead is at 45°); no camera below floor level; a 0.3 s hold before readable inserts. To recheck in storyboards. |

## 3. Open items (decisions or tests, not rewrites)
| # | Item | Why it matters | Recommendation |
|---|---|---|---|
| O1 | **All Polish unverified** | Wrong forms would break immersion for Polish viewers and the A mechanism (address forms, a toddler saying *Obiecałaś*) | Gate G1 before any narration |
| O2 | **Episode 4 is ~112 s** | Over the 105 s target | Keep it: it holds the two biggest reveals. Fallback trims if needed: drop clip 903 (−5 s) and shorten the time-lapse (−2 s), giving about 105 s. That loses the "without the child it never ends" evidence, which ep3's line partly covers. |
| O3 | **Child-peril intensity on the roof** | Platform and audience sensitivity | Staging rules are locked. Owner sign-off at G3 frame 8. |
| O4 | **Finale A's reply to Ewa** | Viewers may judge Ava harshly | **Decided by the owner:** "I can't tell you. I'm sorry." It keeps the cost, and Kuba is still not reunited with his mother. |
| O5 | **No-blink and toddler-scale engine work** | Kate's sleepwalking tell, and Kuba's age | Part of G2; still checks per shot |
| O6 | **Child voice quality** | Ollie carries the hook | G4 audition with several candidates |
| O7 | **New-viewer entry at parts 2–5** | Shorts are often found mid-series | Each part opens on its own hook. Add "Part X of 5" to the title overlay and the description; no extra recap time needed. |
