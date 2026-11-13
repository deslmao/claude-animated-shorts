# Locked Out: visual-development plan (revision 2)
**Status:** awaiting the owner's approval before any asset is created. Nothing has been rendered, recorded or generated.
- **Story:** `story.md` (spec 3, `perspective: first`, 19 beats, 263 words, packet `5ef2dffb`).
- **Independent evaluation of this exact packet** (`eval/evaluation.md`): ready, 0 fail, 1 weak criterion (visual communication), 2 weak stress tests (plot hole and consistency); gate **READY**.
- **History:** earlier evaluations are kept as `evaluation.v1.md` and `evaluation.v2.md`.
- **Scope of this revision:** this plan changes staging only. The script, events and lines are exactly the evaluated packet's.
- **Runtime:** **about 100 s** (§1). This corrects the earlier "about 98 s", which was planned from shot lengths, not speech.

## 0. What this revision addresses
**The fresh evaluation's three fixes, all handled in staging:**

| Finding | Where it's handled |
|---|---|
| Beat 15: from my eyes, the brick and bay window are *behind* the camera, so the shout looks like the horn I rejected | 15b: I glance back over my shoulder at the brick and the bay window, then turn to Marsh at his own door. The geography is on screen, and the camera stays first person. Shot 1a is composed as the house's geography master, so the bay's position left of the door is known from the first frame |
| Beat 16: he shouldn't be caught a minute after letting go; the shove should be sideways | 16d: the watch reads 00:17 as he lets go; 17a: 00:00 as he reaches the gate. He shoves me *sideways* into the porch wall, which keeps me between him and the bay |
| Beat 2: "It's one of ours" can read as coincidence; beat 12: show the job stake at the decision | 1b: the app header, readable, says KESTREL LOCKS · THE ONLY 24-HOUR LOCKSMITH IN TOWN (the existing rule, now on screen), and the van's door logo matches. 12b: as my hands pocket the phone, the warning letter is in the top of frame |

**Your five checks:** runtime (§1), POV execution (§2), asset efficiency (§7), camera execution (§3) and the climax (§4).

## 1. Runtime review
Speech is from the script tool's voice-calibrated estimate; action time is the silent minimum each beat needs.

| Beat | Speech | Shot time | Silent action it carries | Verdict |
|---|---|---|---|---|
| 1 | 5.3 | 5.5 | the geography wide, the job card and the letter | keep |
| 2 | 4.7 | 5.0 | torch finds him; cash; the hush | keep |
| 3 | 5.5 | 5.5 | licence; glance back at the van **cut from 2.2 s to 0.9 s** (the stake is already readable in 1b) | trimmed |
| 4 | 4.1 | 4.1 | the bell, the unanswered door; **no close-up of Marsh** (he's an off-screen voice) | trimmed |
| 5 | 1.1 | 2.8 | the tail thumping, the drawing, the wellies: needs at least 2.8 s to be read | keep (was 3.6) |
| 6 | 3.4 | 4.4 | the key bumps; a 2 s hold on the lock | keep: it's the key clue |
| 7 | 2.0 | 3.0 | tilt up, light out, curtain twitch, back to him | keep: the chill people will mention |
| 8 | 6.7 | 6.7 | stamp, then the History screen, held 2.5 s | keep |
| 9 | 4.1 | 4.3 | his gaze to the bay; I walk to the van | keep |
| 10 | 5.9 | 5.9 | the locking clunks; the countdown starts | keep |
| 11 | 7.6 | 7.6 | latch, brick, glass, my hand over the horn: action under the lines | keep |
| 12 | 10.8 | 10.8 | **the longest beat in the film** | see below |
| 13 | 0.8 | 2.4 | step out; he drops the brick and walks back | keep (was 3.0) |
| 14 | 4.4 | 5.0 | fake picking; the watch; his hand on my shoulder | keep: the suspense ramp |
| 15 | 4.1 | 5.1 | watch, glance back, rise, shout, first window | keep: the decision |
| 16 | 2.6 | 6.2 | shove; windows W2–W4; the neighbour; he looks, lets go and backs off | keep: the payoff of the whole climax |
| 17 | 1.1 | 3.8 | 00:00; blue light; the arrest | keep |
| 18 | 8.5 | 9.0 | her lines; my hand at the flap; the light comes on | keep: the emotional payoff |
| 19 | 4.4 | 5.4 | REFUSED; the family at the window; 1 s of tail after the line | trimmed (was 6.2) |

**Total: about 100 s** (speech about 87 s, plus about 13 s of silent action).

**What is genuinely prolonged:** only **beat 12** (about 11 s, in a parked van). Its thought ("He still thinks I'm his way in. While he does, he'll wait at the door.") and its spoken line ("I'll keep him at the front door.") carry the same information.
- **Staging (applied here):** beat 12 plays over continuous hand action (mirror, phone into pocket, cuff over the watch, eyes to the letter, hand to the door handle), so it's never a static pose.
- **Line trim (recommended, not applied):** cutting "I'll keep him at the front door." and keeping "Stay on the line." would save about 2 s. It changes the evaluated packet, so it would need another evaluation. That's the owner's call; the film works without it.

**Not shortened:** the suspense holds (6, 7, 11), the climax (13–17) and the ending (18). Each carries information or the emotional turn.

## 2. POV execution: one coherent first-person experience
**Hands in frame, without engine changes.** The new asset is one prop family, `fpHands`: the locksmith's gloved hands and cuffs, with `variant`s per pose, each holding an existing item:

| Variant | Holding |
|---|---|
| `phone` | the existing `phone` item, with the stepped `phoneScreen` content |
| `licence` | |
| `torch` | the existing `torch` |
| `tools` | pick and wrench |
| `horn` | (hand over the horn) |
| `pocket` | |
| `watch` | the stepped watch face |
| `flap` | (hand at the letterbox flap) |
| `brush` | not needed |

Each is placed at an authored position in the lower frame of a static first-person camera (`at`, about 0.35–0.45 m in front of the eye, below the eyeline), and steps between poses on spoken words.

**The rules that make the shots one continuous experience:**
1. **Every shot is from my eye position:** `at` cameras at eye height (1.65 m standing, 1.15 m kneeling, 1.25 m seated in the van). No outside angle on my own hands, ever. The old "INS me.hands" external inserts are gone; they are only the fallback (rule 8).
2. **One lens language:** wide first person (`fov: 70`) for looking; tight first person (`fov: 42`, the same axis) for *looking closer*. A tight shot is a `swoop` or `pushIn` along my line of sight, so it reads as my attention narrowing, not as a cut to a new camera.
3. **Head moves are `glide`s** (0.35–0.6 s): looking up at the window, back at the van, back at the brick. Cuts happen only when time passes or attention jumps (a sound, a new place).
4. **Hands follow the action.** They rise into frame to do something and drop out of frame while the head moves (they're world-placed props, so they must not be seen during a glide). Every glide starts after the hands have dropped and ends before they rise again.
5. **Screens and small text** (job card, History, the 999 call, REFUSED, the watch, the licence) are held in my hands in the tight lens, not cut to as flat graphics.
6. **No hand-held bob,** for consistency: authored `at` cameras have none, so no first-person shot uses `pov`'s bob. One rule for the whole film.
7. **The only shots outside my eyes:** the wide down the street as it wakes (15d) and the wide of the arrest (17b). Both are moments where the world, not me, is the subject.
8. **Fallback** if `fpHands` reads poorly in stills: the same shots with an external insert cut on `me.hands`. That needs a locksmith figure on screen (cuffs, gloves, jacket).

**The windscreen reflection, reviewed: replaced.** A faint face composited on the windscreen risks reading as a second person in the van, or a ghost, and it can't be lit convincingly without real reflections.
- **Replacement:** the **rear-view mirror**. One upward glance (a `glide`) shows my eyes in the mirror, lit by the phone, moving from the house to the phone and back. The mirror's frame tells the viewer it's a reflection, so there's no ambiguity, and it costs only an eyes-only face card inside the cab set's mirror.
- **Hold:** 1.2 s.
- **Fallback:** hands only, as the owner approved.

## 3. Camera execution: how the framing progresses
- **Act 1, observation (beats 1–8): the world narrows to the lock.** The street (1a) → the doorstep (2) → the letterbox, a frame within a frame (5) → the lock, macro (6) → the stamp, macro (8) → a phone screen in my hands (8). Each step is closer because suspicion is growing.
- **Act 2, distance (beats 9–12): glass between me and the house.** Through the windscreen I can see, but not act. **Shot 11a repeats 1a's framing on purpose:** the same house, now with Marsh at the bay with a brick.
- **Act 3, confrontation (beats 13–17): the camera's height tells the story.** Kneeling and looking up at him (14) → **standing up into his eyeline on "No!"** (15) → knocked sideways (the `whip` in 16) → the widest shot in the film as the street wakes (15d, 16) → the arrest wide (17).
- **Ending (beats 18–19): the windscreen framing a third time.** The house again, but now the family stands at the lit window (19b). This 1a / 11a / 19b repetition is the film's motif.

**What was removed or changed:**
- **Close-ups of Marsh talking:** cut from six to three, each a different state (hush in 2, threat in 14, defeat in 16). Beat 4 holds on the unanswered door with his voice off-screen. Beat 9 follows his gaze to the bay window instead of showing his face.
- **No static wides:** 1a holds 1.8 s while the light strip reads, then my hand enters with the phone. 15d and 17b carry action: windows lighting, officers moving.
- **No slow decorative moves:** the only slow move is 19b's final push-in (3 s), which lands on the last line.
- **Purposeful repetition only:** the windscreen motif (1a, 11a, 19b) and the watch (10b, 14b, 15a, 16d, 17a). The watch always appears at the same size and angle, so it reads as one ticking object.

## 5. Final script (the evaluated packet, unchanged)
Lines in *italics* are my thoughts: narration in the inner voice (`liamQuiet`, close and quiet). **ME:** lines are spoken aloud (`liam`).

**1.** *At two-fourteen in the morning, a man is paying me double to break into his own house.*

**2.** **MARSH:** Double. Cash. No invoice, no call to the office.  
*And he wants it quiet.*

**3.** *Proof of address. His is perfect.*  
*And I can't afford to turn away the wrong man twice.*

**4.** *I always ring first.*  
**MARSH:** She won't come down. Not at this hour.

**5.** **MARSH:** Biscuit. It's me.

**6.** **MARSH:** Just stopped working tonight.  
*New locks don't just stop working.*

**7.** *Someone's awake up there.*  
**MARSH:** Problem?

**8.** **ME:** Just checking the lock model.  
*It's one of ours.*  
*She changed the lock yesterday. And kept the keys from him.*

**9.** *Everything he's told me is true.*  
**ME:** Wrong picks. They're in the van.

**10.** **OPERATOR:** She called us too. She's upstairs with her little boy. Officers are four minutes out. Stay in your vehicle.

**11.** **OPERATOR:** She's still on the line upstairs. She says he's trying the windows.  
*A horn, and he's through that glass before anyone's out of bed.*

**12.** *He still thinks I'm his way in. While he does, he'll wait at the door.*  
**ME:** I'll keep him at the front door. Stay on the line.  
**OPERATOR:** Do not open her door.  
**ME:** I won't.

**13.** **ME:** Found them!

**14.** **MARSH:** You're not even trying.  
**MARSH:** Open it now. Or I go through that window.

**15.** **ME:** No! She changed this lock to keep you out. I'm not opening it!

**16.** **MARSH:** Shut up!  
**NEIGHBOUR:** Oi! I'm calling the police!

**17.** **MARSH:** It's my house!

**18.** **WOMAN:** I watched you from upstairs. When you got your tools out.  
**WOMAN:** I thought you were going to let him in.  
**ME:** It's your lock. It stays shut.

**19.** *I checked who he was.*  
*I never asked who the lock was for.*


## 6. Story-level storyboard (from story.md; production staging is in §4)
| # | events | what the viewer sees | key subject | action | camera | sound |
|---|---|---|---|---|---|---|
| 1 | E1 | through my van's windscreen: a dark street, every window black except a thin strip of light under one upstairs curtain at number 9, small at the edge of frame; my hand lifts my phone: LOCKOUT · 9 ALDER ROW · 02:14; above it on the sun visor, a letter, readable: FINAL WARNING. WRONGFUL REFUSAL OF SERVICE. ONE MORE AND YOU'RE DISMISSED | the job card, then the warning letter | my hand lifts the phone; my eyes go up to the visor | pov (windscreen, hands in frame) -> insert (phone) -> insert (visor letter) | the engine ticking as it cools |
| 2 | E1 | my torch finds a man in a green coat on the doorstep; he talks low, straight into the lens; the notes fanned in his fist; he puts a finger to his lips, his eyes going to the neighbours' dark windows | the finger to his lips, aimed at the neighbours | he fans the cash; hushes me | pov (torch) -> insert (cash) -> closeUp (into the lens) | a dog's distant bark, his whisper |
| 3 | E2 | his licence in my gloved hand: D. MARSH, 9 ALDER ROW, his photo; I hold it up beside the brass 9 and the MARSH label on the bell; my eyes flick back to the van, to the letter on the visor; I hand the licence back | the licence beside the brass 9 | I compare; glance back; hand it back | pov (hands in frame) -> insert -> pov (glance back at the van) | a car far off |
| 4 | E3 | my finger presses the bell; inside, a dog barks, then whines; nobody comes; he says it into the lens, tired, not angry | the unanswered door | I ring; wait; he shrugs | insert (bell) -> closeUp | the bell, the dog |
| 5 | E3 | my fingers lift the letterbox flap; my torch through the slot: a spaniel in the hall, tail thumping at his voice; on the wall, a child's drawing: MUMMY, ME, BISCUIT, and DADDY in a green coat; small wellies by the mat | the dog's tail and the drawing | the tail thumps; the torch drifts over the drawing | pov (through the letterbox) | a tail thumping on the floor |
| 6 | E4 | I kneel and lay out my wrench and pick; he shows me his worn brass key: it bumps at the keyway and won't go in; my torch goes close: a bright new cylinder with a small KL stamp on its face, set in flaking old paint, a paler outline where a bigger lock used to be, metal filings glittering on the mat; my hands go still | the new cylinder in the old paint | his key bumps; my hands stop | pov (hands in frame) -> insert (macro, the lock) | the key scraping, then silence |
| 7 | E5 | my torch tilts up as I think: the strip of light under the upstairs curtain goes out, and the curtain twitches; I tilt the torch back down: he's looking from the window to me | the light going out | the curtain moves; his eyes find mine | pov (tilt up) -> pov (back to his face) | silence, a curtain ring |
| 8 | E6 | I lean close: KL, Kestrel Locks, my firm; I turn my phone away from him and open the address's History: "Yesterday, 16:40. Emergency lock change. Customer: R. Marsh. Keys issued to R. Marsh only."; his shadow falls on the step beside me | the History entry | I angle the phone away; my thumb scrolls | insert (the stamp) -> insert (phone screen) -> pov (his shadow) | my own breathing |
| 9 | E7 | his eyes slide to the bay window and stay there; my hands snap the pick case shut; I walk to the van; he stays on the doorstep, and his long shadow, cast by the porch light, stretches after me along the pavement | his eyes on the bay window | my hands close the case; I walk | pov -> insert -> pov (walking, his shadow stretching after me) | my boots, his boots |
| 10 | E8 | inside the van, the central locking clunks; I dial 999 under the warning letter; at "four minutes" my thumb sets my watch counting down: 04:00, 03:59 | the countdown starting | I dial; I start the countdown | pov (hands in frame) -> insert (the watch) | the clunk, the ringing, her voice |
| 11 | E8 | through the windscreen: he leaves the door, tries the bay window's latch, then pulls a brick out of the garden border and weighs it at the glass; my hand goes to the horn and stops just above it | the brick at the glass | he tries the latch, lifts the brick; my hand hovers, then comes away | pov (windscreen) -> insert (my hand over the horn) | soil tearing, my heartbeat |
| 12 | E9 | my reflection in the dark windscreen, the phone's glow on it, deciding; I slide the phone, still on the call, into my breast pocket, screen against my chest; I pull my cuff over the watch: 03:10; my hand on the door handle | the phone going into my pocket | I decide; hide the phone; open the door | pov (hands in frame) -> insert (pocket) | the operator's voice, then muffled |
| 13 | E9 | I step out with the case held up; at my voice he lowers the brick, drops it by the path and walks back to the door | the brick dropping by the path | he drops the brick and comes back | pov (he turns from the window) | the van door, the brick thudding into the soil |
| 14 | E10 | on my knees: the pick rests beside the keyway, not in it, and the wrench turns nothing; my cuff slips: 02:20, then 01:40; he watches my hands; his face comes down over me, into the lens; his hand closes on my shoulder; his eyes go to the brick by the path | his hand on my shoulder, the brick behind him | my hands fake; his hand grips; he looks at the brick | insert (the pick beside the keyway) -> insert (the watch) -> pov (up at him, low) | the pick ticking on metal, his breath |
| 15 | E11 | my eyes drop to my watch (01:30); I stand up and step out onto the path, so I'm between him and the brick and the bay window; he's against his own front door now; I shout it down the sleeping street, and across the road the first window lights up during the shout | the first window lighting up | I check the watch; step between; shout | insert (the watch) -> pov (rising, the brick and the bay window behind me, him at the door) -> wide (from the path down the dark street, the first window lighting) | my voice echoing between the houses |
| 16 | E12 | he lunges, slams me back against the porch wall and twists my jacket in his fists; past his shoulder a second window lights up, then a third, a curtain pulled back, and a neighbour comes out on his step with his phone raised; Marsh looks along the lit street; his grip opens; he lets go and backs down the path, past the brick, toward the road | the lights coming on, window after window | he grips, looks, lets go, backs away | pov (pinned, over his shoulder) -> pov (his face turning to the lit windows) | a thud, doors opening, the neighbour's shout |
| 17 | E12 | my watch: 00:00; blue light floods the street; at the end of the path two officers take his arms; he twists back toward the house, and they walk him to the car | the blue light, the officers | he's held; he shouts back at the house | insert (the watch) -> wide (from the doorstep, blue light sweeping the houses) | sirens, car doors, his shout |
| 18 | E13 | the door stays shut; her voice comes through it; my hand moves to the letterbox flap and stops, then lowers; above me, the upstairs light comes back on | my hand not lifting the letterbox | my hand stops; the light comes on | insert (my hand at the flap) -> pov (tilting up to the lit window) | her voice muffled by the door, the dog whining softly |
| 19 | E14 | in the van my phone shows the job: REFUSED BY TECHNICIAN. REVIEW REQUIRED, under the warning letter on the visor; I look up through the windscreen: the curtain is open, and she stands at the lit window with her small son and the dog, not hiding any more | the family at the lit window | I look from the phone to the window | insert (phone and visor) -> pov (windscreen, the lit window) | a quiet chord, a distant bird |



## 4. Shot-by-shot camera plan (revised)
**Notation:**
- **FP-W** is first person, wide: `{ move: "at", pos: <eye>, look: <target>, fov: 70 }`.
- **FP-T** is first person, tight, on the same axis: `fov: 42`, reached by `swoop` or `pushIn`.
- **H:variant** is the `fpHands` prop in frame, in that pose.
- Eye heights: standing 1.65 m, kneeling 1.15 m, seated in the van 1.25 m.
- Transitions are hard cuts unless a `glide`, `whip`, `rack` or `swoop` is named.

| Shot | Beat | Set / light | Camera | What it shows, blocking and the cue | s |
|---|---|---|---|---|---|
| 1a | 1 | vanCab / night | FP-W through the windscreen at number 9: the **geography master** (door, the bay window to its left, garden border, path, gate, upstairs window) | dark terrace; one thin lit strip under the upstairs curtain, frame right, unremarked; held | 1.8 |
| 1b | 1 | vanCab | H:phone rises into frame → FP-T on the screen (job card: KESTREL LOCKS · THE ONLY 24-HOUR LOCKSMITH IN TOWN / LOCKOUT · 9 ALDER ROW · 02:14) → `glide` up to the visor letter | the letter, readable, held 1.6 s: FINAL WARNING. WRONGFUL REFUSAL OF SERVICE. ONE MORE AND YOU'RE DISMISSED | 3.7 |
| 2a | 2 | alderRow / night | FP-W with H:torch, the cone sweeping up the path to Marsh on the step | he talks low, straight into the lens | 2.4 |
| 2b | 2 | alderRow | FP-T on his fist (cash), `glide` up to his face | finger to his lips; his eyes slide to the neighbours' dark windows | 2.6 |
| 3a | 3 | alderRow | FP-T with H:licence, held up beside the brass 9 and the MARSH bell label | D. MARSH, 9 ALDER ROW readable | 2.6 |
| 3b | 3 | alderRow | `glide` over my shoulder to the van (the visor letter a pale rectangle behind the glass), and back; H:licence goes out of frame to his hand | on "twice" | 0.9 + 2.0 |
| 4 | 4 | alderRow | FP-W on the door; my gloved finger presses the bell (H:torch variant, the finger free) | the dog barks and whines behind the door; nobody comes; Marsh off-screen: "She won't come down" | 4.1 |
| 5 | 5 | downstairs (hall) / interiorCool | FP-W at letterbox height (1.0 m) through the `letterboxMask`; my gloved fingers hold the flap at frame top | tail thumping at "Biscuit"; the torch drifts over the drawing and the wellies | 2.8 |
| 6a | 6 | alderRow | FP-W kneeling, H:tools laid out | his worn key bumps at the keyway | 1.6 |
| 6b | 6 | alderRow | `swoop` → FP-T macro on the cylinder | the new cylinder in flaking paint, the KL stamp, the outline, the filings; **held 2 s**; my gloved hand still at the edge of frame | 2.8 |
| 7 | 7 | alderRow | `glide` tilt up to the upstairs window → (the strip goes out on "awake", the curtain twitches) → `glide` back down to Marsh's face | his eyes from the window to the lens: "Problem?" | 3.0 |
| 8a | 8 | alderRow | FP-T macro on the stamp | KL · KESTREL LOCKS (the stamp readable now) | 1.2 |
| 8b | 8 | alderRow | H:phone, angled away from him; FP-T on the History screen | the entry, readable, held 2.5 s; his shadow decal falls across the step | 5.5 |
| 9a | 9 | alderRow | FP-W, `glide` following his gaze to the bay window | the bay window | 1.5 |
| 9b | 9 | alderRow | FP-W walking to the van (`at` waypoints); H:tools (the closed case) at the bottom of frame | his long shadow decal from the doorstep stretches past me on the pavement; a 0.6 s `glide` back: he's still on the step | 2.8 |
| 10a | 10 | vanCab | FP-W seated; the four locking pins drop; H:phone dials under the visor letter | the 999 call starts | 2.8 |
| 10b | 10 | vanCab | FP-T on H:watch | on "four minutes": 04:00 → 03:59 | 3.1 |
| 11a | 11 | vanCab | **the same framing as 1a**, with a `rack` from the glass to the house | Marsh leaves the step, tries the bay latch, kneels at the border, pulls the brick, weighs it at the glass | 5.4 |
| 11b | 11 | vanCab | FP-W, H:horn rises toward the wheel and stops, then drops out on "glass" | | 2.2 |
| 12a | 12 | vanCab | `glide` up to the **rear-view mirror**: my eyes, phone-lit, go to the house and back | deciding ("He still thinks I'm his way in…") | 2.4 |
| 12b | 12 | vanCab | FP-W, H:pocket: the phone goes into my breast pocket, screen in; the visor letter in the top of frame | "Stay on the line." / "Do not open her door." | 4.2 |
| 12c | 12 | vanCab | FP-T on H:watch as my cuff slides over it (03:10), then FP-W with my hand on the door handle | "I won't." The door opens | 4.2 |
| 13 | 13 | alderRow | FP-W stepping out, H:tools (the case held up) | "Found them!"; Marsh lowers the brick, drops it beside the path (it thuds) and walks back to the step | 2.4 |
| 14a | 14 | alderRow | FP-T kneeling, H:tools: the pick rests *beside* the keyway; the wrench turns nothing | | 1.8 |
| 14b | 14 | alderRow | FP-T H:watch (02:20; a jump cut to 01:40) | | 1.2 |
| 14c | 14 | alderRow | FP-W kneeling, looking up at Marsh over me | "You're not even trying." A soft jolt as his hand lands on my shoulder; his eyes go to the brick: "Or I go through that window." | 2.0 |
| 15a | 15 | alderRow | FP-T H:watch (01:30) | | 0.8 |
| 15b | 15 | alderRow | `glide` over my shoulder: the brick by the path and the bay window behind me → `glide` back to Marsh at his door | the geography, from my eyes | 0.9 |
| 15c | 15 | alderRow | FP-W rising from 1.15 to 1.65 m (`glide`), stepping back onto the path: Marsh against his own door, my body between him and the glass | the music cuts out on "No!" | 1.0 |
| 15d | 15 | alderRow | `at` wide from the path down the street (fov 60): the first motivated outside-the-eyes shot | the shout echoes; across the road **W1 lights on "keep"** | 2.4 |
| 16a | 16 | alderRow | `whip` to FP-W pinned *sideways* against the porch wall (the camera rolls about 8° on impact), looking over his shoulder | W2 and W3 light on "Shut"; a curtain pulls back | 2.0 |
| 16b | 16 | alderRow | FP-W, the same axis, `rack` to across the road | the neighbour's door opens, his phone raised: "Oi! I'm calling the police!" | 1.6 |
| 16c | 16 | alderRow | FP-T on Marsh's face, turning along the lit street | his grip opens | 1.0 |
| 16d | 16 | alderRow | FP-T H:watch at 00:17, then FP-W (floor level, low) as his feet back past the brick toward the gate | | 1.6 |
| 17a | 17 | alderRow | FP-T H:watch: 00:00 (a hard cut, half a beat with no music) | | 0.8 |
| 17b | 17 | alderRow | `at` wide from the step to the gate (fov 58), blue light sweeping the house fronts: the second outside-the-eyes shot | two officers take his arms as he reaches the gate; he twists back: "It's my house!" | 3.0 |
| 18a | 18 | alderRow | FP-W at the closed door; H:flap rises toward the letterbox | her voice through the door | 3.6 |
| 18b | 18 | alderRow | FP-T on H:flap: it stops, and lowers | "It's your lock. It stays shut." | 4.0 |
| 18c | 18 | alderRow | `glide` tilt up to the upstairs window | the light comes back on (her son, upstairs) | 1.4 |
| 19a | 19 | vanCab | FP-T H:phone (REFUSED BY TECHNICIAN. REVIEW REQUIRED) with the visor letter above it | | 2.2 |
| 19b | 19 | vanCab | **the 1a and 11a framing**, slow `pushIn` (fov 70 → 55) | the curtain open: the woman at the lit window, her son, Biscuit's nose at the glass; the final line; 1 s of tail | 3.2 |

41 shots, about 100 s. There are more shots than in revision 1 because the climax is now cut on the action. The number of *setups* is lower, because the first-person framings repeat purposefully.

## 7. The climax, beats 13 to 17, in detail (about 22 s)
**The rule for the sequence:** one new piece of information per shot, and every piece readable with the sound off.

| What the viewer must understand | How it's shown (muted) | How it's heard |
|---|---|---|
| **13: I'm back, and he chose the door over the window again** | I step out with the case held up; he drops the brick beside the path and walks back (the brick's thud is visible as a small bounce) | "Found them!"; the thud |
| **14: the stall is fake and failing** | the pick resting *beside* the keyway; the watch falls; looking up at him; his hand on my shoulder; his eyes to the brick | "You're not even trying." / "…or I go through that window."; pick ticks; the `tense` cue rising |
| **15: my decision, and why it's safe now** | watch at 01:30 → over my shoulder: the brick and the bay window are *behind me* → I stand up into his eyeline, between him and the glass → the wide down the dark street, where the first window lights *during* the shout | music cut on "No!"; the shout echoing between the houses |
| **16: his reaction, and the street waking** | knocked sideways into the porch wall → windows lighting over his shoulder → the neighbour in his doorway with his phone → his face turning to the lit street → his grip opening → watch at 00:17 → his feet backing past the brick | a thud; doors opening; "Oi! I'm calling the police!"; no music |
| **17: the arrest, caused by the time I bought** | watch at 00:00 → blue light floods the house fronts → two officers take him at the gate | sirens, then "It's my house!" |

**Checks on this sequence:**
- **The viewer never has to infer geography.** The bay's position is established in 1a and 11a, and the brick's drop spot in 13; the glance back in 15b shows both are behind me.
- **The decision has a visible cause chain:** the watch (time nearly bought), then the glance back (my body is between him and the glass), then standing up (a choice, made on camera).
- **The street waking escalates in steps,** each on a word: W1 on "keep", W2 and W3 on "Shut", the neighbour's door on "Oi". It reads as the shout's consequence, not a cut-away rescue.
- **His letting go is shown as his choice** (his face to the street, then his grip opening) *before* the police exist on screen (00:17).

## 8. Blocking map and movement
**Alder Row anchors** (distances from number 9's door):
- **Number 9:**
  - DOOR: the letterbox at 1.0 m, the lock at 1.05 m, the bell on the right at 1.4 m;
  - STEP;
  - PORCH WALL: between the door and the bay, where I'm pinned;
  - BAY: 1.8 m left;
  - BORDER: under the bay;
  - B2: the brick's spot, 1.2 m down the path;
  - PATH: 2.5 m;
  - GATE: 5 m;
  - UPSTAIRS: the window over the door.
- **The street:**
  - VAN: at the kerb, 8 m, the windscreen facing the house;
  - LAMP: a streetlamp behind the step, which back-lights Marsh and gives the shadow decal its direction;
  - OPP W1–W4: windows across the road;
  - NDOOR: under W3;
  - ROAD: off-screen left, where the police light comes from.

| Who | 1 | 2–8 | 9 | 10–12 | 13–14 | 15 | 16 | 17 | 18 | 19 |
|---|---|---|---|---|---|---|---|---|---|---|
| **Me** | VAN | STEP; kneeling from 6 | STEP → VAN | VAN | VAN → STEP; kneeling | standing; one step back to PATH, between him and BAY/B2 | shoved sideways to PORCH WALL (still between him and the bay) | STEP | at DOOR | VAN |
| **Marsh** | STEP | STEP | STEP, looking at BAY | STEP → BAY latch → BORDER (brick) → BAY glass | drops the brick at B2 → STEP, standing over me | at DOOR, backed against his own door | lunges; pins me; looks along the street; lets go; backs PATH → past B2 → GATE | at GATE, held | gone | gone |
| **Woman** | UPSTAIRS (light on) | light out (7) | UPSTAIRS | on her own 999 call (unseen) | | | | | behind DOOR, voice only | UPSTAIRS window, with her son and the dog |
| **Boy** | | | | | | | | | switches on the UPSTAIRS light | at the window |
| **Neighbour** | | | | | | | opens NDOOR, phone up | watching | | |
| **Officers** | | | | | | | | arrive from ROAD; take him at GATE | | |

## 9. Sound and music
**Voices:**
- thoughts: `liamQuiet` (the header's narrator voice), close and dry;
- my spoken lines: `liam`;
- Marsh: `brian`;
- the operator: `alice` (phone-filtered if available, otherwise dry);
- the woman: `jessica`, muffled through the door;
- the neighbour: `chris`, at a distance.

**Music** (moods from `sound/catalog.ts`):

| Beats | Cue |
|---|---|
| 1–3 | `hush` at -8 dB |
| 4–9 | `mystery`, a small lift at 7 |
| 10–14 | `tense`, rising through 14 |
| 15 | **cut on "No!"** |
| 16–17 | no score; `amb_city_night` plus effects |
| 18 | `silence` |
| 19 | `warm` at -10 dB, entering on "I never asked" |

**Effects:** existing catalog sounds wherever possible.
- **Existing:**
  - `amb_city_night` as the bed for every exterior;
  - `bell_ring` (doorbell);
  - `latch_click` (letterbox flap, central-locking pins ×4, doors opening);
  - `phone_buzz` (the 999 ring);
  - `blip_up` (the watch start and 00:00);
  - `step_grass`, pitched down (the brick pulled from soil);
  - `impact`, low (the brick's thud);
  - `knock_heavy` (my back against the porch wall);
  - `clock_tick`, pitched up and sparse (the pick ticking on metal);
  - `step_floor`, soft (the tail thumping);
  - `whoosh_short` (the whip in 16a);
  - `phone_tap` (the torch click).
- **New, only four:** `dog_bark`, `dog_whine`, `siren` and `metal_scrape` (the key scraping at the keyway). The earlier plan's `van_door`, `car_door`, `engine_tick`, `curtain_ring` and `bird_dawn` are dropped or approximated with existing sounds.

## 10. Assets, by efficiency
**Reused unchanged:**
- **Items:** `phone`, `torch`, `key`, `letter`.
- **Props:** `phoneScreen` (four screens: the job card, the 999 call, History, REFUSED); the `downstairs` set for the hallway seen through the letterbox.
- **Recurring cast:** **Gus as the neighbour.** Recurring cast is never counted against originality, and a dressing gown is the only addition.
- **Sound, lighting and cameras:** the catalog sounds above; `night` and `interiorCool` lighting; `at` cameras with `fov`.

**Adapted as added variants** (the protected library takes additions only):
- `farmDog` → **Biscuit** (a spaniel colourway with longer ears);
- `frontDoor` → **door 9** (a weathered finish, letterbox, bell, MARSH label, the new cylinder);
- `letter` → the **visor letter** (new text);
- `photoFrame` / drawing pattern → the **family drawing**;
- `phoneScreen`'s stepped display → the **watch face**;
- the card system's ground-blob material → the **shadow decal**.

**New, because nothing existing fits:**

| Kind | Asset | Why it's new |
|---|---|---|
| set | **alderRow** facade group | First check at the asset stage (stills) whether the existing `city` set at night can host it: its ground, lamps and road would be reused, adding only the number 9 frontage, a bay window, the border, the path, the gate and the opposite-house fronts. Build a separate set only if `city` doesn't fit |
| set | **vanCab** | windscreen frame, dashboard, wheel and horn, visor, rear-view mirror, door handle, locking pins. Small, and nothing similar exists |
| prop | **fpHands** | one asset with nine pose variants, holding existing items. It's also reusable in every future first-person video |
| prop | `newCylinder` | the macro-grade hero clue |
| prop | `windowLight` | **one** stepped window prop, reused five times (the upstairs window and W1–W4) |
| prop | `licence`, `brick` | small |
| prop | the mirror-eyes card | lives inside vanCab |
| effect | blue strobe light; torch cone | **No police car model:** the car stays off-screen, and its light sweeps the house fronts |
| character | **Marsh** | the main on-screen antagonist |
| character | **the woman** | seen only small, at the window; a simple design |
| character | **the boy** | seen only small, at the window; a simple design |
| character | **one police officer design, used twice** | |
| character | **the locksmith** | only the hands family and the mirror eyes. No full figure unless the fallback is needed |

**Deliberately not reused:** recurring cast for the woman and the boy (Juno, Milo), and Future Text's vehicles. Casting recurring characters as a family in a domestic-abuse story would clash with their established stories, and Future Text is off-limits.

## 11. Engine limitations and fallbacks
1. **First-person hands:** the engine's `pov` can't draw the viewer's own body. Solved without an engine change by the `fpHands` prop in static first-person shots (§2); during head moves the hands are kept out of frame. **Fallback:** external hand inserts.
2. **The wide lens:** `pov` is fixed at 50°, so every first-person shot uses authored `at` cameras (fov 70 wide, 42 tight), as in Night Shift. There's no lens curvature.
3. **Reflections:** there's no reflection rendering. The rear-view mirror uses an eyes-only card inside the mirror frame. **Fallback:** hands only.
4. **Shadows:** characters don't cast them. The shadow decal (blob material) covers 8b and 9b. **Fallback:** the glance back at Marsh on the step (already in 9b).
5. **Text:** there's no overlay. All readable text is on props, held in the tight lens for 1.5–2.5 s. It must pass full-resolution still checks.
6. **Clearance:** the camera check may flag `fpHands` as "inside scenery", because it's 0.4 m from the lens. Use `blockOk` on those camera beats.
7. **Downward first-person views** (the lock at 1.05 m from a 1.15 m kneeling eye) stay within about 50° of horizontal, per CLAUDE.md.
8. **The operator's phone voice:** dry if no telephone filter exists. A filter would be a small audio addition, not needed for the story.

## 12. Cost and next steps (rates from CLAUDE.md)
**After the owner approves this plan:**
1. Build the theme additions in §10.
2. Write the storyboard code from §4.
3. Run `--until checks` (free).
4. Make half-scale stills of 1a, 6b, 8b, 11a, 12a, 15c, 16a and 19b (about 30 s each, plus the bundle). The **fpHands** and mirror shots are the first to verify.
5. Make **one combined 540p preview of beats 10–17** (about 45 s, about 34 min).
6. Make one focused correction pass.
7. Run the cloud final render with QA (about 20 min).
