# Proposal: true stories as Thinkora's primary direction

Status: **proposal, awaiting the owner's approval.** Nothing in here has been implemented. No assets, narration or
renders were made.

---

## 1. Audit: what we have, and what it was built for

### Why Locked Out failed, in one sentence
The system asks "is this story well constructed?" before anyone asks "would a stranger want to hear it?" Locked Out
passed every structural gate (spine, ledgers, plot-hole tests, a ready verdict) and was still a small, invented
dilemma that nobody had a reason to care about.

### Keep: engineering that serves any format (no change)
| System | Why it still matters |
|---|---|
| Engine, sets, characters, crowds (`extra(i, era)`, `crowd(n, era)`: medieval, victorian, fifties, office...) | Historical reenactment needs people doing things in places, with crowds. |
| Camera kit (authored `at` cameras, `cams` glides and swoops, `closeUp`, `frame`, `overShoulder`, `whip`, `kicks`) | This is what makes it cinematic. The problem was never the camera kit, it was using it for talking heads. |
| Explanation kits (stepped props, labels, diagrams) | Maps with arrows, counters, documents that change: ideal for "and then the Germans moved a whole division". |
| Validators (framing, hands, props in frame, clearance, z-fighting) and the stills, 540p preview and cloud QA workflow | These are format-neutral quality floors. |
| Voice pipeline (cache, word timings, captions, `gap` and `pauses`), sound (moods, ambience, the SFX catalogue, mix) | A narrated documentary is mostly this. |
| `research.md`, `factual: yes`, the accuracy criterion, the two-source rule | This is already the seed of a fact ledger. It just isn't strict enough yet. |
| The independent evaluator (a fresh agent that only reads the packet) and the gate | This is the right mechanism. It was judging the wrong things. |
| The props ledger | Continuity still matters (the briefcase, the letters). |
| The Locked Out lesson: one big literal picture per narrated line | This becomes the core visual rule. |

### Built for the fictional, character-driven approach (demote, don't delete)
| Component | What it does | In the new direction |
|---|---|---|
| Spine Premise: want, fear, protect, decision | It forces a protagonist with a dilemma. | Optional. A true story's subject is the **event**. |
| Constraints, Alternatives, Easy outs | They plug the holes in an invented plot. | Replaced by the fact ledger. Reality doesn't need plot-hole defence, only accuracy. |
| Clue ledger, giveaway guard, Secret with tells | Fair-play mystery machinery. | Kept only for true mysteries. |
| The evaluator's emotional investment, viewer participation, dilemma balance and emotional cost tests | They reward constructed tension. | Not used in the true-story rubric. |
| `FORMATS` (immersive, action-first, world-rule, emotional, mystery, serial) | No true-story format. | Add one; keep the rest for occasional fiction. |
| `TOPIC_TO_VIDEO.md`'s explainer formula | A 55–65 s "the science of X" template. | Legacy. Selection moves to a scorecard (section 2). |

### What's missing entirely
1. **A subject-selection gate before any writing.** Today a weak idea goes straight into the spine and gets polished.
2. **A line-by-line fact ledger.** Every narrated claim maps to a fact ID with a source and a confidence level, and the
   checker enforces it.
3. **A rubric that judges what a Shorts viewer feels:** hook specificity in the first 3 seconds, escalation (each
   beat more interesting than the last), whether the payoff delivers, and whether the visuals escalate with the
   story.

---

## 2. The new direction, as working rules

### Selection: the scorecard (before a single line is written)
Score each candidate 1–5 on: **hook, curiosity, escalation, payoff, visual potential, evidence, originality**.
- **Reject** if hook, payoff or evidence is below 4, or if the story is one fact rather than a sequence of developments.
- Write the hook line and the final line first. If neither is a genuine "wait, what?", reject.
- The owner picks from a shortlist of 3–5.

### Narration style
- **Action-first.** The first line is something extraordinary already happening, never a date or background.
- **A specific curiosity gap** that the ending closes. "This man has been dead for three months" works.
  "History is full of strange stories" doesn't.
- **A flexible progression:** curiosity → context (fast) → escalation → unexpected development → payoff → final
  impression. This is a guide, not a template. A survival story, a mystery and a "terrible decision" story need
  different shapes.
- **Precise details over adjectives:** "£79 19s 2d" beats "a big overdraft".
- **"You see..."** only when it genuinely explains.
- **The ending comes from the subject:** the real outcome, the consequence, the explanation, or a final fact that
  recontextualises the opening. No moral.

### Accuracy
- Every factual line carries fact IDs. Facts are marked `solid`, `qualified` (worded with "reportedly", "may have",
  "historians think") or `not used`.
- No invented dialogue presented as real. A quotation is used only when its wording is attested, and then attributed.
- Dramatised visuals are fine (we can show the submarine surfacing). Dramatised claims are not.
- The ledger lists what we deliberately left out, and why.

### Visual rules
- **One literal, big picture per line.** If the narration says it happens, we see it happen.
- **Visuals escalate with the story:** a bigger reveal gets a bigger shot or a bigger change.
- **Evidence is readable:** documents, maps and objects get held inserts.
- **The camera responds to events** (a whip on a reveal, a crane on a scale reveal, a macro on an object), not a
  repeating push-in and wide.
- **Style:** cinematic within Thinkora's existing ink-cartoon character style. That's what the engine and library
  support. Photorealism isn't achievable with this engine, and I don't recommend chasing it.

---

## 3. The smallest practical implementation (after approval)

| # | Change | Size |
|---|---|---|
| A | `docs/storytelling/true-stories.md`: the scorecard, narration style, structure guide, visual and accuracy rules. `STORYTELLING.md` §1 names it as the primary direction. | doc |
| B | `story.ts`: a `true-story` format. For it, the protagonist, secret and clue-ledger requirements become optional; `research.md` facts need IDs; the beats table gets a `facts` column, and every narrated line must cite fact IDs or be marked `—` (a connective or interpretive line, flagged for the evaluator); a `qualified` fact used without a hedge word gets a flag. | small checker change |
| C | The evaluator: a true-story rubric. **Criteria:** hook, escalation, payoff, clarity, accuracy, visual communication, originality (angle versus famous retellings). **Stress tests:** top-comment fact-check, cold viewer, redundancy, giveaway (does the hook spoil the payoff?). Same output format; the gate's criteria list is chosen by format. | small parser change |
| D | `productions/<id>/candidates.md`: the scorecard, filled in for the shortlist. | template |
| E | Assets per subject, as a theme (as `race1904` was), reusing crowds, eras and explanation kits. | per production |

No engine or camera changes. `npm run short`, voice, sound, render and QA are unchanged. Fiction formats stay
available.

---

## 4. Pilot candidates

All candidates were researched before scoring. Sources are listed at the end.

| Subject | Hook | Curiosity | Escalation | Payoff | Visual | Evidence | Originality | Verdict |
|---|---|---|---|---|---|---|---|---|
| **Operation Mincemeat (1943):** British intelligence gave a dead man a fake identity and fake invasion plans, and floated him to Spain | 5 | 5 | 5 | 5 | 4 | 4 | 3 | **Recommended** |
| **Defenestration of Prague (1618):** three men thrown from a castle window survive the fall, and a 30-year war follows | 5 | 4 | 4 | 5 | 4 | 4 | 3 | Strong reserve; the politics need careful compression |
| **Frederic Tudor, the Ice King:** ships ice to the Caribbean, it melts, he's mocked, then he ships it to India | 4 | 4 | 4 | 4 | 4 | 4 | 4 | Good second pilot |
| **Strasbourg dancing plague (1518):** the council's cure for compulsive dancing was more dancing | 5 | 5 | 4 | 3 | 5 | 3 | 2 | Overdone on Shorts; the cause is unknown and the death toll disputed |
| **Great Molasses Flood (Boston, 1919):** a wave of molasses through a city | 5 | 4 | 3 | 3 | 5 | 4 | 2 | One event, little development; 21 deaths need care |
| **Knocker-uppers:** paid to wake workers by tapping on windows | 4 | 3 | 2 | 2 | 3 | 4 | 3 | Rejected: one fact, not a story |

**Why Mincemeat.** The hook is a genuine "wait, what?" (a dead man fooling an army). Each beat escalates: the
fake life, the precise pocket litter, the fisherman, the spies opening the letters, the microscope proving it. The
payoff is historic (the Germans looked the wrong way), and the final fact recontextualises the hook: the soldier
was a homeless man nobody knew. It's well documented through the National Archives files, the CWGC records,
Montagu's and Macintyre's books, and museum pages.

**Risks.**
- It's known: there's a 1956 film, a 2021 film and a stage musical. Most Shorts viewers still don't know it, and our
  angle is the life invented for a man who never existed.
- A real man's body: no gore; he reads as a sleeping officer. His cause of death is in the ledger but left out of
  the narration.
- No Hitler character on screen: German officers at a map table.

---

## 5. Pilot script: "The Man Who Never Was" (Operation Mincemeat)

- **Narrator:** George (the channel's storyteller voice; British, which suits the story).
- **Length:** 300 words, about 85–90 s at the channel pace. If it needs to be tighter, lines 6, 11 and 16 can go (about 8 s) without losing a development.
- `[F#]` = fact IDs from the ledger below.

| # | Role | Narration | Picture (one literal picture per line) |
|---|---|---|---|
| 1 | **Hook** | This man has been dead for three months. [F1] | Night sea. A macro on a pale face under a life-jacket collar, eyes closed; a slow pull back reveals a uniform, then water all around him. |
| 2 | Hook | Tonight, he's going to fool Hitler. [F14] | A hard cut: a submarine's hull bursting through the black surface. |
| 3 | Context | April 1943. A British submarine surfaces off the coast of Spain, and the crew lowers him into the sea. [F2] | A wide from the water: the conning tower, men on deck lifting a long shape over the side, distant lights of a coastline. |
| 4 | Context | Chained to him: a briefcase of top-secret letters. [F3] | Insert: the chain from his coat to the briefcase handle, the case stamped and locked, bobbing at the surface. |
| 5 | Context | You see, the Allies were about to invade Sicily. [F4] | A map of the Mediterranean; a big arrow grows from North Africa to Sicily. |
| 6 | Context | The problem? Sicily was the obvious target. [—, interpretive, F4] | The arrow stops; German markers pile up around Sicily. |
| 7 | Escalation | So British intelligence decided to lose some secret plans. Plans saying the real targets were Greece... and Sardinia. [F5] | A London office: officers sliding letters into the briefcase. The map's arrow swings away from Sicily to Greece, then Sardinia. |
| 8 | Escalation | But a briefcase on its own looks like a trap. So they gave the dead man a whole life. [—, F6] | The same desk from above: an empty uniform laid out, objects arriving one by one beside it. |
| 9 | Escalation | He became Major William Martin, Royal Marines. [F7] | Insert: an identity card being stamped, the name in big type. |
| 10 | Escalation | A fiancée called Pam: her photo, two love letters, and the receipt for her engagement ring. [F8] | Three quick inserts placed on the desk: the photo, the letters ("my darling"), the jeweller's receipt. |
| 11 | Escalation | Two used theatre tickets. [F9] | Insert: torn ticket stubs. |
| 12 | Escalation | And a letter from his bank, demanding he pay back his overdraft. Seventy-nine pounds, nineteen shillings and twopence. [F10] | Insert: the bank letter, the sum circled. Hold to read. |
| 13 | **Unexpected** | Within hours, a Spanish fisherman found him. [F11] | Dawn, a beach: a small fishing boat, a fisherman wading toward the shape in the surf. |
| 14 | Unexpected | Spain was officially neutral. But a German agent was working in this very town, and the British knew it. [F12] | A wide of the harbour town; a man in a hat watching from a café table as the body is carried past. |
| 15 | Unexpected | Spanish officers quietly opened the letters, and the Germans photographed every page. [F13] | A lamp-lit room: hands easing a letter out; a camera's flash, then another, page after page. |
| 16 | Unexpected | Then they sealed them up again and handed them back, as if nobody had touched them. [F13] | The briefcase handed across a desk to a British official; a polite nod. |
| 17 | Unexpected | In London, a microscope proved the letters had been opened. [F13] | A macro through a microscope lens: the creased fold of the letter. |
| 18 | **Payoff** | The Germans had read every word, and believed it. Hitler sent reinforcements to Greece and Sardinia, including a whole Panzer division from France. [F14] | The map again: German markers sliding away from Sicily, a big tank symbol crossing from France to Greece. Officers at a map table, pointing at Greece. |
| 19 | Payoff | A message reached Churchill: "Mincemeat swallowed rod, line and sinker." [F15] | A telegram tape running out of a machine, the words printing in big type. |
| 20 | Payoff | On the tenth of July, the Allies landed in Sicily. [F16] | The biggest shot of the film: landing craft hitting a beach at dawn, troops running ashore; the camera rises over the fleet. |
| 21 | **Final impression** | Major William Martin had already been buried in Spain, with military honours. [F17] | A quiet Spanish cemetery: a few uniformed men at a grave, a headstone reading WILLIAM MARTIN. |
| 22 | Final | But there was no Major Martin. [F7] | The camera holds on the name. |
| 23 | Final | He was Glyndwr Michael, a homeless Welshman who had died alone in London that winter. [F18] | A flashback: a thin man in a worn coat in a London street at night, nobody looking at him. |
| 24 | Final | For more than fifty years, nobody knew his name. [F19] | Back at the headstone, the name still WILLIAM MARTIN. |
| 25 | Final | Today, it's on his grave. Glyndwr Michael. Served as Major William Martin. [F20] | New lettering appears below: GLYNDWR MICHAEL SERVED AS MAJOR WILLIAM MARTIN. Hold, then cut to black. |

**The visual progression:**
- intimate (a face) and mysterious (night sea);
- explanatory (the map, the desk of invented objects, inserts rising in detail and in fun);
- tense (the beach, the watcher, the camera flashes, the microscope);
- the largest scale (the map shifting armies, the Sicily landing);
- back to the smallest and quietest image (one headstone).

The ending answers the opening: the dead man from line 1 finally gets his own name.

---

## 6. Fact ledger (checked against sources; to be confirmed against Macintyre and the National Archives files before recording)

| ID | Fact as used | Confidence | Sources | Notes |
|---|---|---|---|---|
| F1 | Dead about three months when released | solid | Wikipedia (William Martin); CWGC | Died late January 1943 (sources give 24 or 28 January); released 30 April 1943 |
| F2 | HMS Seraph surfaced off Huelva, Spain, and the crew released the body, 30 April 1943, about 04:30 | solid | National WW2 Museum; IWM; Spotter Up | Times vary 04:15–04:30 (not used in narration) |
| F3 | A briefcase attached to him by a chain | solid | Wikipedia (Operation Mincemeat); National WW2 Museum | |
| F4 | The Allies planned to invade Sicily | solid | IWM; National WW2 Museum | Line 6 ("obvious target") is the planners' reasoning, as widely reported; worded as narration, not a quotation |
| F5 | The letters suggested Greece and Sardinia as targets, with Sicily as a cover | solid | history.co.uk; military.com; Wikipedia | The main letter was from Gen. Sir Archibald Nye to Gen. Alexander |
| F6 | A full false identity and "pocket litter" were created | solid | IWM; National Archives WO 106/5921 | Planners: Ewen Montagu and Charles Cholmondeley |
| F7 | The name was Major William Martin, Royal Marines; he never existed | solid | CWGC record 4041671 | |
| F8 | "Pam": a photo (MI5 staffer Jean Leslie), two love letters, an engagement-ring receipt | solid | National Archives image 45502; history.co.uk; slate.fr | |
| F9 | Theatre ticket stubs | qualified (solid in Macintyre per secondary sources) | military.com; spotterup | Confirm in Macintyre |
| F10 | A Lloyds Bank letter demanding repayment of an overdraft of £79 19s 2d | solid | history.co.uk; military.com | |
| F11 | A Spanish fisherman found the body that morning | solid | National WW2 Museum; Wikipedia | The fisherman's name is unconfirmed (not used) |
| F12 | Huelva was chosen partly because a German agent (Adolf Clauss) was active there; Spain was neutral but Axis-leaning | solid | ww2db; Wikipedia | |
| F13 | Spanish officers let the Germans photograph the letters, then resealed and returned them; British microscopic examination showed they had been opened | solid | National WW2 Museum; damninteresting; Wikipedia | The "missing eyelash" detail is single-sourced (not used) |
| F14 | The Germans believed it; Hitler ordered reinforcements to Greece and Sardinia; the 1st Panzer Division moved from France to Greece | solid / qualified | historycollection; historyofwar; Wikipedia | "fool Hitler" in the hook rests on this; Rommel's Greece inspection is single-sourced (not used) |
| F15 | The message to Churchill: "Mincemeat swallowed rod, line and sinker" | **qualified** | Washington Times review of Macintyre; defensemedianetwork | Wording varies ("swallowed whole"). Confirm in Macintyre, or drop the quotation and say "the Germans had swallowed it whole" |
| F16 | The Sicily landings began 10 July 1943 | solid | IWM; Business Insider | |
| F17 | Buried in Huelva as Major William Martin, with military honours | solid / qualified | CWGC cemetery page; andalucia.com | "With military honours": confirm |
| F18 | The body was Glyndwr Michael, a homeless Welshman from Aberbargoed, who died in London | solid (the identity the CWGC records) | CWGC 4041661; Wikipedia | Cause (rat poison, ruled suicide) deliberately left out. Age (34 or 36) not used. Minority alternative identities exist (Tom Martin, John Melville); the CWGC identification is used |
| F19 | Unidentified publicly until 1996 (Roger Morgan, Public Record Office) | solid | Wikipedia; Yahoo / Telegraph-sourced piece | 1943 to 1996 is 53 years: "more than fifty years" |
| F20 | The headstone now names him: "Glyndwr Michael served as Major William Martin, RM" | solid | CWGC; andalucia.com | The inscription was added in 1997 or 1998 (sources differ; not used) |

**Not used (unverified, disputed or unnecessary):** the eyelash test, Rommel's Greece trip, Ian Fleming's link to the
planning memo, the dry ice (the canister appears only as an object), the fisherman's name, the exact release time,
his age, and the cause of death.

**Research caveat:** this environment blocks direct page fetches from iwm.org.uk, nationalww2museum.org and
mentalfloss.com. Facts were cross-checked through search-result summaries of those and other pages. Before
narration is recorded, F9, F15 and F17 need checking against a primary or book source.

### Sources
- [IWM: The War on Paper, Operation Mincemeat](https://www.iwm.org.uk/history/the-war-on-paper-operation-mincemeat)
- [National WW2 Museum: Secret Agents, Secret Armies: Operation Mincemeat](https://www.nationalww2museum.org/war/articles/secret-agents-secret-armies-operation-mincemeat)
- [The National Archives: girlfriend's letter (WO 106/5921)](https://images.nationalarchives.gov.uk/asset/45502)
- [The National Archives catalogue: papers relating to Operation Mincemeat](https://discovery.nationalarchives.gov.uk/details/r/N18836883)
- [CWGC: Major William Martin](https://admin.cwgc.org/find-records/find-war-dead/casualty-details/4041671/william-martin)
- [CWGC: Glyndwr Michael](https://admin.cwgc.org/find-records/find-war-dead/casualty-details/4041661/glyndwr-michael)
- [CWGC: Huelva Roman Catholic Cemetery](https://www.cwgc.org/find-a-cemetery/cemetery/2086519/Huelva%20Roman%20Catholic%20Cemetery)
- [Wikipedia: Operation Mincemeat](https://en.wikipedia.org/wiki/Operation_Mincemeat)
- [Wikipedia: William Martin (Royal Marines officer)](https://en.wikipedia.org/wiki/William_Martin_(Royal_Marines_officer))
- [History.co.uk: Operation Mincemeat](https://www.history.co.uk/article/operation-mincemeat)
- [Military.com: How a Dead Man Helped Fool Hitler](https://www.military.com/british-intelligence-gave-a-dead-man-fake-invasion-plans-hitler-fell-for-it)
- [Washington Times: review of Macintyre's *Operation Mincemeat*](https://www.washingtontimes.com/news/2010/may/7/book-review-operation-mincemeat/)
- [WW2DB: Operation Mincemeat](https://ww2db.com/battle_spec.php?battle_id=279)
- [Damn Interesting: Mincemeat and the Imaginary Man](https://www.damninteresting.com/mincemeat-and-the-imaginary-man/)
- Books to confirm against: Ben Macintyre, *Operation Mincemeat* (2010); Ewen Montagu, *The Man Who Never Was* (1953).
- Other candidates:
  - [Defenestrations of Prague (Radio Prague)](https://english.radio.cz/node/8889193)
  - [Smithsonian: Frederic Tudor](https://www.smithsonianmag.com/arts-culture/the-ice-king-cometh-frederic-tudor-father-of-the-ice-industry-29955743/)
  - [Smithsonian: the dancing mania](https://www.smithsonianmag.com/smart-news/strange-case-dancing-mania-struck-germany-six-centuries-ago-today-180959549/)
  - [History.com: the Great Molasses Flood](https://www.history.com/news/the-great-molasses-flood-of-1919)

---

## 7. What production would need (estimate only; not started)
- **A `mincemeat` theme:**
  - sets: the night sea with a submarine, a Huelva beach and harbour town, a London office, a lamp-lit Spanish room,
    a German map room, a Spanish cemetery;
  - props: the briefcase and chain, readable document inserts, the map with moving markers (the explanation kit),
    landing craft, the headstone with stepped lettering;
  - 1940s uniforms as Looks.
- **Reuse:** crowds, the office set, the island beach (re-dressed), the pirates' sea and boats, the explanation kits.
- **Cost:** about 88 s, about 2,650 frames. A 540p preview is about 40–65 min; a cloud final is about 16 min plus QA.
