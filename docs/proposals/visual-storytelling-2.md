# Thinkora Visual Storytelling 2.0: reference analysis and production audit

**Status: audit and design only.** No code, storyboard, narration, render, release or production was changed. The only
renders were six diagnostic stills (in the session scratchpad) for the image-quality investigation.

---

## 1. Reference analysis
**The two reference Shorts could not be accessed.** This cloud session's network policy blocks `www.youtube.com`, so
I have not watched them and won't describe their content. To include them, allow `www.youtube.com` (and
`*.googlevideo.com` for the video stream) under Network access in the environment settings
(https://code.claude.com/docs/en/cloud-environments#network-access). I can then analyse them frame by frame, as I did
our own clips, and update this section.

Until then, the principles below are **general directing principles of fast explainer Shorts**, from established
editing practice, not from those two videos. Each one maps to a measurable rule we can test against.

| Principle | What it means on screen | Measurable rule |
|---|---|---|
| **Every new idea gets a new picture** | A new noun, action or claim in the narration changes the frame: cut, reframe, insert or transition | a camera change within about 0.3 s of each "event word"; no single set-up held over about 2.5 s during explanation |
| **Literal first, then abstract** | The narrator says "sign a contract": we see the quill touch the paper before any diagram | each action verb in the narration maps to a visible action (or a deliberate cutaway) |
| **Scale jumps** | Wide (where we are), then close-up (who feels it), then extreme close-up or insert (the detail that matters) | shot sizes vary; no more than 2 consecutive set-ups at the same size |
| **The zoom that becomes a place** | A push into a head, a scroll or a map continues *through* it into a new environment (a brain, a historical scene, an economic machine) | transitions that change set mid-sentence, motivated by an object on screen |
| **Cutaways to objects** | Short (0.6-1.2 s) inserts on hands, props, signatures, coins, so that every claim has a concrete object | inserts on the words that name objects |
| **Reaction punctuation** | The surprise, the laugh, the "wait, what?" gets a close-up or punch-in | reaction beats such as shock and laugh get a close-up (or are framed tight already) |
| **Momentum by continuity** | Fast cuts stay readable because screen direction, eye-lines and colour stay consistent, and match cuts carry shape or motion across | 180-degree rule per scene; a minimum shot length of about 0.5 s; match cuts on shape and motion |
| **Explanations are events, not slides** | Signals travel, things fill, break, move or compare *in a space* the camera moves through | explanation time on static panels below about 30 % of the explanation time |

---

## 2. Current system weaknesses (measured)
| | Tickle (run #13) | Pirate Democracy (Stage C) |
|---|---|---|
| Camera set-ups | 16 in 63.7 s: **one per narration line**, 4.0 s on average | 15 in 61.7 s, 4.1 s on average |
| Set-ups that hold one framing with a slow creep (`frame`) | 14 of 16 | 11 of 15 |
| Close-ups / extreme close-ups | **0** | 1 |
| Inserts on objects / POV | **0** | **0** |
| Explanation time on floating panels | 19.8 s (31 %) | 19.5 s (32 %) |
| Sets | 3 | 1 (by decision) |

**Root causes in the engine:**
1. **One camera per line.**
   - The storyboard's `camera` is a single move per shot, and a shot is a narration line.
   - The key system underneath (`camera/keys.ts`) already supports several keys and cuts per shot; the storyboard layer
     just never asks for them.
   - So the camera cannot change *within* a sentence, which is exactly where the new ideas arrive.
2. **No shot types for details.**
   - `closeUp` exists only for an actor's face.
   - There is no insert (hands, a prop, an item), no extreme close-up (eyes, a signature), no POV, no whip or punch
     between subjects within a shot, and no rack focus driven by the story (the move exists, unused).
3. **Transitions are only between lines:** cut, fade, flash, dip. There are no match cuts, no zoom-through into a new
   environment, and no way to change set mid-sentence.
4. **No director:**
   - Every camera choice is hand-written per shot.
   - Nothing proposes a camera change when the narration introduces an action, object, concept or reaction.
   - Nothing warns about long static holds; the validator checks framing *correctness* (crops, hidden faces), not
     *dynamism*.
5. **Explanations default to panels.**
   - `fx/diagrams.ts` panels are flat cards above a presenter. They are good for a quick comparison, but they read as
     slides: the camera holds, the presenter waits, the icons are small on a phone.
   - There is no system for explaining *inside a space*: no brain world, no process machine, no diorama.

**What is good and must be preserved:** character quality, the house style and ink, deterministic split rendering,
narration-driven timing (every event is anchored to a word), and the staging validator.

---

## 3. Proposed camera-directing architecture
### 3.1 Camera beats (manual control, the foundation)
A shot keeps one narration line, but its camera can change on words:
```ts
camera: [
  { move: "frame", on: ["milo", "qm"], size: "medium" },                    // the set-up
  { word: "sign", move: "insert", on: "qm.hand", size: "extreme", cut: true },  // ECU: the quill on the scroll
  { word: "contract", move: "closeUp", on: "qm", cut: true },                // her nod
]
```
- **Each beat becomes a key in the existing key list:** a cut, or a timed move with easing. This is deterministic, a
  pure function of the frame, as today.
- **The validator runs every staging check per beat:** crops, hidden faces, props in frame, panels and captions.
- **Captions** re-place per beat, not per shot.

### 3.2 New shot types (reusable moves in `camera/moves.ts`)
| Move | What | Built from |
|---|---|---|
| `insert` | A prop, an item in a hand, or an anchor (`"milo.hand"`, `"qm.head"`, `"treasureChest"`), filling about 60 % of the frame | the anchors (`Stage.anchors`) and prop footprints that already exist; focus on the target |
| `extreme` (size) | Eyes and mouth, or a detail | `fitShot` with a new size; DOF by size |
| `pov` | From an actor's eyes toward a target, with a slight handheld bob (deterministic noise) | head anchor + `faceToward`; hides the POV actor's card |
| `ots` (improved) | The near figure's shoulder, not their head, at a fixed screen share (≤ 30 %) | the existing `overShoulder`, plus the foreground-size check |
| `whip` | A fast pan between two subjects with motion blur | two framings + an eased pan over 6-8 frames; blur from the existing lens pass (direction-aware) |
| `push` / `pull` on a word | Starts on the word and ends after `dur`: punch-ins on reactions, reveals | the existing pushIn / pullOut, timed |
| `rack` | Focus shifts between two subjects | the existing `rack` helper, finally used |
| `establish` (improved) | A wide that drifts across the set for 1-1.5 s, then cuts in | the existing `establish` / `view` |

### 3.3 Transitions (motivated, between and within lines)
- **Zoom-through:**
  - The camera pushes into an object (a head, a scroll, a map, a coin) until it fills the frame. On the matching frame
    the set switches and the camera continues out of the same shape in the new world.
  - This needs **split shots**: one narration line spread over two shots on different sets, cut at a word.
  - Timing stays word-anchored, so narration and captions are unaffected.
- **Match cut:** a shape or motion in shot A lines up with shot B (a round coin cuts to a round porthole; a hand rising
  cuts to a hand rising). The engine aligns the screen position and scale of two named anchors across the cut.
- **Whip transition:** a whip pan that lands in another set (motion blur hides the join).
- The existing cut / fade / flash / dip stay.

### 3.4 The auto-director (proposes; the storyboard decides)
A rule-based planner reads the storyboard's events and proposes camera beats. Writers accept, edit or switch it off per
shot (`camera: "auto"`).

| Event in the storyboard / narration | Proposed camera beat |
|---|---|
| An action beat: write, offer, grab, block, tickle, operate | an insert on the hands for 0.6-1.2 s, or a tighter two-shot |
| A reaction: shock, laugh, scared, facepalm | a punch-in or close-up on the reacting face |
| A spoken word that names a prop / item in the shot (via asset tags: "contract" names scroll / quill) | an insert on that object |
| A new concept with a visual explanation | a zoom-through into an explainer world (section 4), or a cutaway |
| A speaker change | a cut to the speaker (single or over-the-shoulder) |
| Over 2.5 s without any change | a reframe: push, angle change or insert |
| A new scene (set change) | a 1-1.5 s establishing wide before going close |

Every proposed beat goes through the same staging checks. Rules respect a **minimum shot length** (about 0.5 s), the
**180-degree rule** per scene (the line between the two main characters), and **screen direction** for walks and
reaches.

### 3.5 New automated checks
- **Static hold warning:** a single set-up held over 2.5 s while the narration introduces new nouns or verbs.
- **Event coverage:** what fraction of action / reaction / object events got a camera response.
- **Rhythm:** a set-up length histogram; flag runs of four or more same-size set-ups, and set-ups under 0.4 s (strobing).
- **Axis check:** a cut that crosses the 180-degree line between two characters in the same scene.
- **Insert legibility:** an insert's subject covers at least 25 % of the frame and is in focus (CoC under 2 px).

These complement **human visual review**, which is still needed for taste: whether a cut feels motivated, comic timing,
whether a metaphor reads.

---

## 4. Proposed visual-explanation architecture
### 4.1 Explainer worlds: explanations as places
Small, purpose-built 3D environments that the camera enters, each with **named, animatable parts** driven by word
beats (the same `When` timing as everything else):
```ts
{ say: "A part at the back of your brain, the cerebellum, sends out a forecast...",
  set: "brainWorld", light: "explainer", transition: { zoomThrough: "milo.head" },
  camera: [ { move: "establish", view: "whole brain" },
            { word: "cerebellum", move: "push", to: "cerebellum", size: "close" } ],
  show: [ { word: "back", do: "highlight", part: "cerebellum" },
          { word: "cerebellum", do: "label", part: "cerebellum", text: "cerebellum" },
          { word: "forecast", do: "signal", from: "cerebellum", to: "armpitMap", speed: 1.2 } ] }
```
**World kits** (each reusable, with its parts documented and protected in the library):

| Kit | Parts and actions | First uses |
|---|---|---|
| **Brain / mind** | a stylised brain with lobes, cerebellum, brainstem, amygdala and motor / sensory strips as separate meshes; neurons and paths; actions: highlight, label, signal (travelling pulses along a path), compare (two signals side by side), dampen / amplify (a dial or wave amplitude) | tickle, yawning, sleep, memory, fear, habits |
| **Process machine** | a conveyor, pipes, gears, gauges, a meter, a valve; actions: flow, fill, block, speed up / down | metabolism, vaccines, digestion, inflation |
| **Historical diorama** | a tabletop miniature (ship, port, town) at a "map table" scale, with figurines driven by the same character rig at a small scale; actions: move along a route, appear, highlight, flag | pirates, Kidd's voyage, trade routes, battles |
| **Economy board** | coins as physical objects that pile, split, flow and drain; scales; bar stacks of coins; actions: split (n : m), transfer, grow, compare | shares, wages, taxes, insurance funds |
| **Behaviour stage** | a character in a minimal "thought space" (soft gradient, floating props), for inner states | habits, decisions, biases |
| **Metaphor props** | a dial / gauge, scales, a lock and key, strings / puppet, a timeline rope with year flags, a crown; actions: turn, tip, unlock, snap, cross out | abstract ideas that need a metaphor |

**Labels:**
- In-world label cards in the caption font, loaded with `delayRender`, exactly like captions, so they are deterministic
  across chunks.
- Numerals and short technical terms only; the narration still carries the sentences.
- Labels stay readable on a phone (cap height ≥ 3.5 % of the frame) and keep clear of the captions.

**Panels stay** for quick side-by-side comparisons (the prediction vs contrast idea, sync vs delay), as a deliberate
choice rather than the default.

### 4.2 Accuracy
Every world part and action that makes a claim (for example "the cerebellum predicts the sensory result") is linked to
a line in the production's research claim check. The validator warns about a `show` beat with no `claim` reference in
an explainer world.

### 4.3 Rendering cost
- Explainer worlds are smaller than our sets (fewer meshes, no large textures), so render time per frame is similar or
  lower.
- Signals and pulses are a few emissive meshes, and bloom already exists.
- Labels are card textures (cached).
- Cuts and inserts cost nothing.

---

## 5. Background blur and flicker diagnosis (Pirate Democracy, treasure chest)
**Investigated:**
- the preview clip `clip4-quartermaster-block` (half size);
- six consecutive **full-resolution** stills (frames 900-905);
- a per-pixel *temporal second difference* map, which shows flicker while ignoring smooth camera motion;
- the depth-of-field geometry for the shot;
- the preview encode settings.

| Suspect | Finding | Verdict |
|---|---|---|
| **Depth of field** | Shot 8 is focused at 5.76 m (Mags's eyes); the chest spans 5.41-5.99 m, so its blur disc is **0.1-0.8 px** at 1080 × 1920. The deck table in shot 15: 1.1-2.6 px | **not the cause** (table: a slight, intended softness) |
| **Render resolution / encoding** | Previews render at **half size (540 × 960)**, pass each frame through **JPEG quality 80**, and encode at about **1 Mbps**. Finals are 1080 × 1920, JPEG 92, CRF 18, about 4 Mbps. At full resolution the chest is crisp (`vs2/chest-fullres-and-flicker-map.jpg`, left) | **the cause of the "blurry" look in the previews** |
| **Ink outlines on sub-pixel detail** | The chest's metal bands and lock plate stand only 1 cm proud of its faces. At 5.7 m their side faces are about one pixel wide. The world ink is computed from a **non-multisampled** normal / depth target (`look/ink.ts`, `samples: 0`) with a 3 × 3 tent filter, so with the camera's sub-pixel creep these edges switch on and off: dashed, crawling lines along the bands and the lid (bright lines in the flicker maps, at both resolutions) | **the root cause of the flicker** |
| **Z-fighting** | Z-fighting flickers in *patches* on surfaces; the maps show only *edge lines*. The z-fight test covers sets, not story props | **not the cause** (worth adding props to the test anyway) |
| **Lighting / shadows** | The lid's inner face is a large, untextured shaded gradient (orange to purple), which reads as soft, but it is stable frame to frame | **not flicker; it adds to the "soft" impression** (untextured material) |
| **Camera movement** | The slow creep is what *exposes* the ink aliasing; it doesn't cause it | contributing |

**Proposed fixes (not implemented):**
1. **Stable ink:**
   - Compute the ink edge mask from a 4× multisampled (or 2× supersampled) normal / depth target, so edges move with
     sub-pixel coverage instead of snapping.
   - Add a minimum feature width: creases from faces narrower than about 1.5 px fade out instead of flickering.
   - Measure the cost first; expect about +10-20 % per frame on the ink pass only.
2. **Prop detail rules:** decorative parts stand at least 2-3 cm proud, or are marked "no crease". A new automated
   **sliver check** finds faces that project under 1.5 px at the prop's typical shot distance, in the same spirit as
   the z-fight test.
3. **Material detail on hero props:** textures (wood grain, metal) on the chest and table, so close inserts look rich
   rather than plastic. This matters more once inserts exist.
4. **Visual-QA previews at full resolution:**
   - Clips used for visual approval render at 1080 × 1920, JPEG 92 / CRF 18, the same as finals (about 3 × the local
     preview render time).
   - Half-size previews remain for timing checks only.
5. **Automated temporal-stability check:**
   - Render 12 consecutive frames of each prop-heavy set-up and compute the temporal second-difference map.
   - Fail if a static object's edges exceed a threshold.
   - This is the same measurement used in this diagnosis.

Depth of field stays as it is: it already keeps important objects sharp. One addition: a rule that **inserts focus on
their object** (CoC under 2 px), with a soft background only where it helps the composition.

---

## 6. Specific Pirate Democracy improvements (before and after)
| Shot (time) | Now | Visual Storytelling 2.0 |
|---|---|---|
| 1 Hook (0-4.6 s) | One push-in on two pirates; the twist at 3.6 s | **0.0** an ECU of a cutlass being drawn (a metal glint), **0.6** a whip to the scowling crew (low angle, wide), **1.2** "feared": the blades go up (medium), **3.6** "democracies": a hard cut to a row of hands shooting up (insert, low angle), and a crowd "aye!" |
| 2 Articles (4.6-10.4 s) | A medium two-shot of the signing | **4.6** the deck wide (establish); **7.0** "Before anyone touches a sword": an insert on Milo's hand letting go of the cutlass hilt; **9.2** "sign": an ECU of the quill on the parchment, the signature drawing on (a new `write` reveal); **10.0** "contract": Mags's close-up nod |
| 3 Shares (10.4-15.2 s) | A panel above Mags | **Economy board on the deck table:** "loot": coins pour out of the chest (insert); "shared": the coins slide into piles in front of a tricorn and a bandana; "two" / "one": a push across 2 piles vs 1 pile; the panel retired |
| 4 Fund (15.2-18.6 s) | A two-shot of the handover | "Lose an arm in battle?": a 0.6 s cutaway, a cannon flash on the deck (smoke, a rumble), then Gus in his sling; "pays": an insert of the purse dropping into Gus's good hand (coins sound); a close-up of his relief |
| 6 Speech (20.5-23.6 s) | A static full shot at the helm | A low-angle hero shot that pushes in to a close-up on "very brave"; a cutaway to two unimpressed crew members (reaction, a dry beat) |
| 7 Vote (23.6-27.8 s) | A two-shot | OTS from behind the crew (the improved OTS: shoulders only), then on "vote" an insert on the row of hands rising, then on "out" a punch-in to the captain's close-up as he gulps |
| 8 Quartermaster (27.8-33.5 s) | A two-shot over the chest | A medium at the chest, then on "hands out" an insert of the purse in Mags's hand, then on "grab" an ECU of hands over the gold: his hand reaches, her palm blocks; then his deflated close-up |
| 10-11 Why (35-45.7 s) | Two chain-of-command panels above Juno | **Zoom-through Juno's map into a historical diorama:** a port with a merchant ship; on "owners on land" a top-hatted owner on the dock with strings down to the ship's captain (a puppet metaphor); on "beat sailors into line" a stick and sailors snapping into a line. Then "Pirates had no owners": **the strings snap**; "the crew was the company": the camera swings to the pirate ship, where the crew gathers and raises hands to elect captain and quartermaster (figurines lift); "tyrant": a crown topples off a tiny captain |
| 14 Long before (53.4-57.4 s) | A timeline panel above Gus | **A timeline rope along the ship's rail:** the camera dollies along year flags from the 1720s (a pirate purse) to 1884 (a state building in miniature), "long before" visualised as distance travelled |
| 15 Payoff (57.4-61.7 s) | A medium of the meeting | Open on an insert of the articles and an hourglass on the table, pull out to the meeting, a hard cut to the captain's facepalm close-up on "committee" |

Estimated effect: about **+4 to +6 points**, mostly visual storytelling, cinematography and retention. It needs the
camera beats, inserts, split shots, the economy board and the historical diorama kit.

---

## 7. Future Tickle-style improvements (concepts for Tickle v2 or similar videos)
| Moment | Now (run #13) | Visual Storytelling 2.0 |
|---|---|---|
| Hook "Your brain refuses..." | A push-in on Milo | An ECU of wiggling fingers approaching an armpit (POV from Milo); a cut to his deadpan close-up; "annoyingly good at it": a zoom-through his head into the brain world, where a tiny cerebellum holds up a "denied" stamp (a metaphor, 0.8 s) |
| "Gus sneaks up behind him" | One full shot | Low angle from behind the sofa: Gus's feet sneaking (insert), a whip to Milo's back, then the tickle insert on his flank, then a punch-in on the laugh |
| Shots 9-10: cerebellum forecast | Panels above Juno (12 s) | **Brain world** (section 4.1): the whole brain, then the cerebellum lights up with a label, then a forecast pulse travels along a path to an armpit map; "lands exactly as predicted": two waves (forecast vs actual) meet and **cancel** (a flat line), and a sensation dial turns down to zero; "No surprise, no tickle": the camera pulls back out of Milo's head to his deadpan face |
| Shot 14 "The surprise is the whole trick" | A contrast panel | Inside the brain world: an unexpected pulse arrives with no forecast to cancel it, the wave spikes and the dial jumps (a 1.8 s comparison) |
| Robot experiment | A full shot plus a delay panel | ECU of the joystick and the feather on the palm (insert), split-screen sync vs delayed (the two waves in the brain world beside them) |
| Payoff "you'll need a friend" | A two-shot | A close-up of Milo laughing, then a pull-out to the golden-hour wide |

---

## 8. Estimated implementation time and rendering impact
| Stage | Work | Estimate | Render impact |
|---|---|---|---|
| A | Camera beats (several keys per shot, word-timed), the `insert` / `extreme` / `pov` / `whip` / timed push moves, per-beat captions and staging checks, static-hold and rhythm checks, negative tests | about 1-1.5 sessions | none (cuts and moves are free) |
| B | Split shots and transitions (zoom-through, match cut, whip transition) | about 1 session | none |
| C | The auto-director (rules, proposals, per-shot opt-out), the axis check, event coverage | about 1 session | none |
| D | Image quality: stable ink (multisampled mask, minimum feature width), the sliver check, props in the z-fight test, a temporal-stability check, full-resolution QA previews | about 0.5-1 session | ink pass about +10-20 % per frame (to be measured); QA previews about 3 × local preview time (cloud finals unchanged) |
| E | Explainer-world framework (`show` beats, parts, labels, signals) + the **brain world** kit | about 2 sessions | similar or lower than our sets |
| F | **Economy board** + **historical diorama** + timeline rope + metaphor props | about 2 sessions | similar |
| G | Pilot: re-direct Pirate Democracy with the new system (no new narration), Stage C review | about 1 session + review | as today |

Total: about **8-10 sessions** for the full system. A smaller first slice (A, B, D, then a Pirate re-direct using
inserts and transitions, no new worlds) would take about 3 sessions and should already change how the videos feel.

---

## 9. Staged implementation plan
1. **Stage A: camera beats and new shot types**, with validator coverage and negative tests. BridgeShort and every
   existing reference stay identical, because existing storyboards don't use beats.
2. **Stage B: split shots and motivated transitions** (zoom-through, match cut, whip).
3. **Stage D: image quality.** Stable ink, sliver and stability checks, full-resolution QA previews. This changes
   existing renders slightly (outline anti-aliasing). Every regression diff is inspected and re-recorded only on
   purpose; BridgeShort is unaffected, as it uses its own creator look.
4. **Stage C: the auto-director**, proposing beats for review. It is off by default for existing storyboards, so
   finished videos never change silently.
5. **Stage E: the explainer-world framework + brain world.**
6. **Stage F: economy board, historical diorama, metaphor props.**
7. **Stage G: Pirate Democracy re-direct** (pilot) and a Stage C review against the new rules and the 100-point rubric.
   Tickle v2 concepts stay as a plan unless you want a re-release.

**Safeguards throughout:**
- deterministic, word-anchored timing;
- no narration regeneration unless approved;
- existing tests and validators kept;
- regression after every engine stage;
- Tickle run #13, runs #11 and #12 and all releases untouched;
- human visual review at every Stage C.

## Decisions for you
1. **References:** allow `www.youtube.com` / `*.googlevideo.com` in the environment's network settings so I can analyse
   the two references properly, or proceed on the general principles above.
2. **Scope of the first slice:** the full system (about 8-10 sessions), or the smaller slice first (camera beats,
   transitions, image quality, a Pirate re-direct; about 3 sessions)?
3. **Pirate Democracy:** finish it as it is (86 / 100, Stage D) and apply 2.0 to the next production, or hold it for a
   2.0 re-direct as the pilot?
4. **Labels in explainer worlds:** allow short in-world text labels (technical terms, numbers)? Until now the house rule
   kept diagrams text-free.
5. **QA previews at full resolution:** accept about 3 × local preview render time for visual-approval clips?
