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

> You are an independent story evaluator for animated YouTube Shorts. Read exactly two files:
> `docs/storytelling/evaluator.md` (the rubric and output format) and `productions/<id>/eval/packet.md` (the story as
> a viewer gets it). Do NOT open any other file in `productions/<id>/` or any other story file. Judge what an
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
| **Viewer participation** | The viewer forms a theory, takes a side or asks "what would I do?" | The viewer is told everything; nothing to weigh; choices without stakes. | rarely (e.g. a pure explainer; give the reason) |
| **Cause and effect** | Every beat happens *because of* the previous ones; obstacles follow from the world or the characters. | Coincidence, an event that changes nothing, the protagonist rescued by luck. | never |
| **Emotional investment** | We know what the protagonist stands to lose, and we care before the climax. | Generic stakes; a relationship that's only a voice; feelings stated, not shown. | when the story is intentionally non-character (give the reason) |
| **Recontextualisation** | A reveal makes an earlier image or line mean something new. | A reveal that comes from nowhere, or one that contradicts what we saw. | when the story has no reveal (say so) |
| **Setup and payoff** | What solves or reveals was shown earlier, without being spelled out. | A last-second ability or object; a payoff stated so plainly beforehand that it's given away. | rarely |
| **Visual communication** | Muted, the key actions, discoveries and decisions still read; the camera points at what matters. | Narration carrying events the picture doesn't show; static poses; unreadable evidence. | never |
| **Originality** | The engine isn't one well-known story with the nouns swapped. | Closely mirrors a known story's premise and solution. Name it. | never |
| **Accuracy** | Every factual claim matches the research; uncertainty is worded as uncertainty; the dramatisation doesn't change what happened. | An unsupported or overstated claim; invented dialogue presented as fact. | fiction (say "fiction") |

## The eight stress tests (apply intelligently)
For each, write `applies: yes` or `no`, with a reason. When it applies, give the result and the finding.

1. **Plot hole:** for every obstacle, why can't someone present, or a simpler means, solve it? Is anyone conveniently absent or ignorant?
2. **Consistency:** check every reference to an earlier event, time, place or rule against the beats.
3. **Giveaway:** does any line or picture state the solution's key before the climax, so the viewer solves it too early? Planting it is good; announcing it isn't.
4. **Dilemma balance** (only when the viewer chooses between competing explanations or options): list the observable evidence for each side at the final beat. Does one side clearly win?
5. **Redundancy:** flag lines that only describe what the shot already shows. Lines that add meaning, interpretation or voice are fine.
6. **Originality:** name the closest well-known story and three structural differences. Do only the nouns differ?
7. **Emotional cost:** what does the protagonist lose if they fail, and is it shown before the climax?
8. **Cold viewer:** summarise, in two sentences, what a first-time viewer would think happened. Then note anything they'd misunderstand.

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
setup and payoff, visual communication, originality, accuracy)

## Stress tests
### plot hole
- applies: yes | no <reason>
- result: pass | weak | fail
- beats: ...
- finding: ...
(all eight: plot hole, consistency, giveaway, dilemma balance, redundancy, originality, emotional cost, cold viewer)

## Automated flags
- <flag, shortened>: confirmed | dismissed, <reason>
(one line per flag in the packet)

## Overall
- keep-watching: yes | no, <would an ordinary viewer genuinely want to keep watching, and where would they leave?>
- verdict: ready | revise | reject
- top-fixes: 1. ... 2. ... 3. ...
```

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
