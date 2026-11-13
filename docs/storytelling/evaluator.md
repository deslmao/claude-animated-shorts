# The independent story evaluator

**One evaluation call per story,** made after the writer finishes `story.md`.

- **The evaluator reads:**
  - `productions/<id>/eval/packet.md` (written by `npm run script -- <id>`);
  - this rubric.
- **The evaluator writes:** `productions/<id>/eval/evaluation.md`.
- **The approval gate:** `npm run script -- <id> --approve` refuses unless that evaluation supports `ready`.
- **After a verdict of `revise`:** the writer may make **one** focused revision and request **one** re-evaluation. There are no further loops. A story that still isn't ready goes to the owner with the findings, honestly labelled.

## What the evaluator gets, and what it doesn't
The packet is what a viewer experiences:
- every spoken line;
- the planned picture for every beat (what happens, the key subject, the action, the camera, the sound);
- the on-screen choice, if any;
- the research, for factual stories;
- the automated flags.

It deliberately leaves out:
- the writer's premise and intentions (want, fear, "question");
- the format rationale;
- the "viewer learns" and "changes" columns;
- the writer's evidence tags;
- the setups and payoffs ledger;
- the consequences the writer attached to each option;
- any writer notes or self-evaluation.

If a scene only works because of an explanation that isn't in the lines or the picture, it doesn't work.

## How to run it (Claude, main session)
1. `npm run script -- <id>`: structural checks pass, and `eval/packet.md` is current.
2. Spawn **one fresh agent** (`subagent_type: general-purpose`; never a fork, which would carry the writer's reasoning) with this prompt:

> You are an independent story evaluator for animated YouTube Shorts. Read exactly three files:
> `docs/storytelling/evaluator.md` (the rubric and output format), `docs/storytelling/benchmarks.md` (the reference
> examples, for the originality check) and `productions/<id>/eval/packet.md` (the story as a viewer gets it). Do NOT open any other file in `productions/<id>/` or any other story file. Judge what an
> ordinary first-time viewer would experience, not what the writer may have intended. You may and should reject a
> story that doesn't work. Write your evaluation, in the exact format of the rubric, to
> `productions/<id>/eval/evaluation.md`. Then reply with the verdict and the top three fixes.

3. `npm run script -- <id>` again: the gate checks the evaluation's completeness, that it matches the current packet,
   and that the verdict is consistent with the findings.

## The nine criteria
Give each one `pass`, `weak`, `fail` or `n/a`, with the beats, quoted or described evidence from those beats, the problem
and the fix. `n/a` needs a reason and is allowed only where marked.

| Criterion | Pass looks like | Weak or fail looks like | n/a? |
|---|---|---|---|
| **Clarity** | A first-time viewer can always say who, where, what's happening and what's at stake. | Two unexplained things in one beat; unclear identities; a rule or mechanism used before it's understood. | never |
| **Viewer participation** | The viewer forms a theory, takes a side or asks "what would I do?" Evidence they can check themselves (a count, a fact they saw) beats evidence they're told. | The viewer is told everything; nothing to weigh; choices without stakes. | rarely (e.g. a pure explainer; give the reason) |
| **Cause and effect** | Every beat happens *because of* the previous ones; obstacles follow from the world or the characters. | Coincidence, an event that changes nothing, the protagonist rescued by luck. | never |
| **Emotional investment** | We know what the protagonist stands to lose, and we care before the climax. | Generic stakes; a relationship that's only a voice; feelings stated, not shown. | when the story is intentionally non-character (give the reason) |
| **Recontextualisation** | A reveal makes an earlier image or line mean something new. | A reveal that comes from nowhere, or one that contradicts what we saw. | when the story has no reveal (say so) |
| **Setup and payoff** | What solves or reveals was shown earlier, without being spelled out. | A last-second ability or object; a payoff stated so plainly beforehand that it's given away. | rarely |
| **Visual communication** | Muted, the key actions, discoveries and decisions still read; the camera points at what matters. | Narration carrying events the picture doesn't show; static poses; unreadable evidence. | never |
| **Originality and adaptation** | Inspiration is welcome (tropes, anime, films, novels, myths, formats, homage, parody, genre mash-ups). Pass when the story brings its own characters, conflict, decisions and payoff; works for someone who doesn't know the source; and the reference adds enjoyment for those who do. | **Weak:** the reference adds nothing, or the story only works if you know the source. **Fail:** close reproduction, i.e. a source's distinctive sequence of events, recognisable scenes, characters or dialogue reproduced with surface changes. Name the source and the reproduced elements. | never |
| **Accuracy** | Every factual claim matches the research; uncertainty is worded as uncertainty; the dramatisation doesn't change what happened. | An unsupported or overstated claim; invented dialogue presented as fact. | fiction (say "fiction") |

## The eight stress tests (apply intelligently)
For each, write `applies: yes` or `no`, with a reason. When it applies, give the result and the finding.

1. **Plot hole:** for every obstacle, why can't someone present, or a simpler means, solve it? Is anyone conveniently absent or ignorant? Then the **top-comment probe**: what would the most-liked comment pick at? In the research, that was logic gaps ("he forgot to explain what it was for"), overclaims and myths.
2. **Consistency:** check every reference to an earlier event, time, place or rule against the beats.
3. **Giveaway:** does any line or picture state the solution's key before the climax, so the viewer solves it too early? Planting it is good; announcing it isn't.
4. **Dilemma balance** (only when the viewer chooses between competing explanations or options): list the observable evidence for each side at the final beat. Does one side clearly win?
5. **Redundancy:** flag lines that only describe what the shot already shows. Lines that add meaning, interpretation or voice are fine.
6. **Reproduction:** for the closest source (declared, from `benchmarks.md`, or any well-known work), compare five things:
   - the actual sequence of events;
   - the characters' motivations;
   - the central conflict;
   - the solution;
   - the meaning of the payoff.

   Similar tropes or a familiar premise are fine. Fail only when the distinctive sequence and solution are reproduced without real transformation. Declared homage that transforms the source passes.
7. **Emotional cost:** what does the protagonist lose if they fail, and is it shown before the climax?
8. **Cold viewer:** summarise, in two sentences, what a first-time viewer would think happened. Then note anything they'd misunderstand.

**Not originality problems:** Thinkora's recurring cast (Milo, Gus, Juno and the other library characters) appears across many stories. Never count their reuse against a story. A reference flag ("3 of 4 stages similar") means *examine closely*. It is not a verdict.

**Automated flags** are heuristics, not judgements. Confirm or dismiss each one in context:
- word overlap isn't proof of redundancy;
- shared words aren't proof of a giveaway;
- evidence balance depends on what each clue means;
- how early motivation must appear depends on the format.

## Output format (exact; the gate parses it)
```
# Independent evaluation: <title>
packet: <the hash from the packet's last line>

## Criteria
### clarity
- result: pass | weak | fail | n/a <reason>
- beats: 1, 4
- evidence: <what those beats actually say or show>
- problem: <for weak or fail: why it hurts the viewer>
- fix: <for weak or fail: a concrete, targeted change>
### viewer participation
...
(all nine, in this order: clarity, viewer participation, cause and effect, emotional investment, recontextualisation,
setup and payoff, visual communication, originality and adaptation, accuracy)

## Stress tests
### plot hole
- applies: yes | no <reason>
- result: pass | weak | fail
- beats: ...
- finding: ...
(all eight: plot hole, consistency, giveaway, dilemma balance, redundancy, reproduction, emotional cost, cold viewer)

## Automated flags
- <flag, shortened>: confirmed | dismissed, <reason>
(one line per flag in the packet)

## Overall
- keep-watching: yes | no, <would an ordinary viewer genuinely want to keep watching, and where would they leave?>
- verdict: ready | revise | reject
- top-fixes: 1. ... 2. ... 3. ...
```

## Phase 1: the spine, judged before dialogue (one call; at standard and deep planning depth)
The writer builds the Story Spine first. `npm run script -- <id> --phase spine` writes `eval/spine-packet.md`: the premise,
the rules of the situation, the event chain with what the viewer sees at each step, the planned ending, the declared
inspirations, and the claims for factual stories. It leaves out the writer's "why" reasoning, the easy-outs defence,
the alternatives and the notes. If a cause isn't visible in the events, it doesn't count.

Prompt: as above, but read `productions/<id>/eval/spine-packet.md`, and write `productions/<id>/eval/spine-evaluation.md`.
Use the same format with:
- **these criteria only:** clarity, cause and effect, emotional investment, setup and payoff, originality and adaptation, accuracy;
- **these stress tests only:** plot hole, consistency, dilemma balance, emotional cost, reproduction, cold viewer;
- **an overall verdict of** `proceed`, `revise` or `reject`.

The spine packet also lists the **plot-critical objects** (who holds each, where and in what state, at each event). Check continuity against it: an object used by someone who doesn't have it, an object in two places, a state change with no cause, an object the plot needs that was never shown.

Judge the *plot*: are there holes, is the logic consistent, are the motivations understandable, is the escalation real, does the payoff follow from the setup, and does the visual proof actually show each event? Lines and dialogue don't exist yet, so don't judge them.

**Budget:** phase 1 plus phase 2 is two calls. The one revision goes where it's needed:
- after phase 1 (a plot fix, the cheapest);
- or, if phase 1 says `proceed`, after phase 2 (with one re-evaluation).

That's at most three calls, and more revisions need the owner's approval.

**Phase 2 after a revision:** the packet lists phase 1's findings. For each one, say in the matching criterion or stress test whether the viewer still meets that problem, in the lines *or* the pictures, however it's now worded. A revision that re-introduces a fixed problem in new words fails the criterion.

## The gate (what `ready` requires)
- All nine criteria and all eight tests are answered. Criteria that always apply aren't `n/a`.
- Every result has beat references and evidence, and every weak or fail has a fix.
- Every flag is confirmed or dismissed.
- The packet hash matches the current story (a story edited after evaluation is re-evaluated).
- **The verdict is `ready`, and the findings support it:**
  - no `fail`;
  - at most two `weak` criteria;
  - no confirmed flag;
  - keep-watching is `yes`.

Passing the structural checks alone never makes a story ready.
