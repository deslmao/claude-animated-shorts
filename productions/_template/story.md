# <Title>
spec: 3
format: immersive
why: <one sentence: why this format serves this idea (docs/STORYTELLING.md §1)>
length: 85
voice: georgeHushed
voices: milo=liam
mood: tense
factual: no

<!-- format: immersive | action-first | world-rule | emotional | mystery | serial | other:<name>; combine with +.
     factual: yes = real-world claims, so research.md with 2+ sources is required.
     length: target seconds (explainers 55-65, stories usually 70-100). -->

## Premise
- question: <the question the viewer wants answered>
- protagonist: <who>
- want: <what they want>
- fear: <what they are afraid of>
- protects: <who or what they protect>
- decision: <the decision they make, and what happens because of it>
- loses: <what they lose if they fail: shown on screen before the climax>
- obstacle: <what stops them getting what they want>
- rule: <world-rule: the one rule, else none>
- conflict: <immersive/mystery: explanation A vs explanation B, else none>
- action: <action-first: the strange action we open on, else none>

## Spine
<!-- Built BEFORE any dialogue (docs/STORYTELLING.md §2). The plot must work as events and pictures first.
     depth: the planning depth (light / standard / deep). `npm run script` computes what the story needs from its events,
     characters, rules, payoffs, facts and competing explanations, and fails if you declare less. Light needs 2
     alternatives and 1 easy out; standard 3 and 2; deep 3 and 3, plus rejected options for decisions. -->
depth: standard

### Constraints
- <a rule of the situation: physical, in-world or factual (what is possible, what isn't)>

### Alternatives
| # | central conflict | key decision | solution | ending |
|---|---|---|---|---|
| 1 | <...> | <...> | <...> | <...> |
| 2 | <must differ from 1 in at least two columns> | | | |
- chosen: <number>, <why this direction is the strongest>

### Event chain
<!-- link: start (first), because, therefore, but, so. Never "and then". why: why it happens given what came before
     (the writer's reasoning: the phase-1 evaluator does NOT see it; the cause must be visible in the events).
     decision: the character's choice and the option they rejected. visual proof: what the viewer SEES. -->
| # | link | event | why | decision | visual proof |
|---|---|---|---|---|---|
| E1 | start | <...> | | | <...> |

### Easy outs
<!-- The obvious fixes a viewer will think of ("why don't they just...?"), and why each one fails, ON SCREEN. -->
| obstacle | obvious fix | why it fails |
|---|---|---|
| <...> | <...> | <shown where (event / beat)> |

### References
<!-- Inspiration is welcome: tropes, films, anime, novels, myths, formats. For each: what is borrowed (concept, trope,
     format, structure), why recognition adds enjoyment, whether it works without the source, and per stage whether
     ours is same / similar / different. Never reproduce dialogue or a distinctive scene. "- none" if fully original. -->
| source | borrowed | recognition adds | works without it | setup | escalation | solution | ending | transformation |
|---|---|---|---|---|---|---|---|---|

### Claims
<!-- Factual stories only: every factual line in the beats cites one of these (beats' "claims" column). -->
| id | claim | source | quote |
|---|---|---|---|

### Props
<!-- The prop-state ledger: ONLY objects the plot, a clue, a deduction or continuity depends on (keys, phones, shoes,
     clothes, documents...). One row per object per event where its holder, place, condition or visibility matters,
     starting with where it is first. Any change of holder or condition needs "why it changes". Checked: two places at
     once, unexplained changes, use in a beat before it's established, established only at the end. -->
| object | event | holder / place | condition | visible | why it changes |
|---|---|---|---|---|---|
| <object> | E1 | <who has it / where> | <state> | yes | |

### Clues
<!-- Mysteries: every clue the viewer must read. beat = when it's first seen; hold = seconds on screen (≥1.2 to be
     readable); answer at = the beat that explains it. -->
| clue | beat | the viewer sees | they can infer | hold | answer at |
|---|---|---|---|---|---|

### Secret
<!-- Mysteries: the answer, the beat that reveals it, and its TELLS: words or images that would give it away early,
     including synonyms and visual signs. Checked in both lines and pictures of every earlier beat. -->
- answer: <the truth, one sentence>
- revealed at: beat <n>
- tells: <word or phrase>, <another>, <a visual sign>

### Demonstration
<!-- Explanatory stories: the ONE visual model used for the mechanism, and its states in order. -->

## Setups and payoffs
| setup | beat | payoff beat | how it pays off |
|---|---|---|---|
| <an object, ability, rule or clue> | 2 | 9 | <how it solves or recontextualises> |

## Beats
<!-- One row per moment. lines: spoken lines, separated by " / "; "who: text" for a character, plain text for the
     narrator, "~" for a silent action beat. No "|" inside cells. camera: library moves (wide, full, medium, close,
     closeUp, insert, pov, overShoulder, pushIn, pullOut, follow, lowHero, highAngle, dutch, orbit, crane, establish),
     "a -> b" for a change within the beat. changes: what is different at the end of the beat (never "nothing").
     evidence (immersive/mystery): which explanation this beat's OBSERVABLE evidence supports: A, B, A+B or -.
     The evaluator never sees "viewer learns", "changes" or "evidence": the lines and pictures must carry them.
     events: which spine events the beat shows. A continuous sequence may carry several lines or events; don't add a
     shot per sentence, add one when the action or the information changes. claims: factual stories only. -->
| # | events | lines | happens | viewer learns | subject | action | camera | changes | sound | evidence | claims |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | E1 | <hook line> | <physical event> | <what they understand> | <the one thing that matters> | <action / reaction> | wide -> insert | <what is different now> | <sound / silence> | <A, B, A+B or -> | <C1 or -> |

## Ending
- type: <solution | realisation | reversal | reveal | consequence | decision>
- A: <option> -> <its consequence>      (decision endings only)
- B: <option> -> <its consequence>

## Issue log
<!-- After phase 1: npm run script -- <id> writes eval/issues.md (every phase-1 weak or fail as I1, I2...). Log each one:
     the resolution, where (the events/beats changed) and a status (resolved / no longer applies: <reason>). Required. -->
| id | finding | resolution | where | status |
|---|---|---|---|---|

## Writer notes
<!-- Why you believe it works, intended readings, open doubts. For the owner only: the independent evaluator never
     sees this section (docs/storytelling/evaluator.md). -->

## Revision
<!-- After the independent evaluation: the ONE focused revision you made in response (or "none"). -->
