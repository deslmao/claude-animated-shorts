# Thinkora storytelling system

**Order of priority:** story first, visual storytelling second, production third. A beautiful video with an unclear
story is a bad video.

```
topic ─▶ 1 FORMAT ─▶ 2 STORY + VISUAL PLAN (one file) ─▶ 3 EVALUATE ─▶ 4 one revision ─▶ 5 OWNER APPROVAL ─▶ production
                     productions/<id>/story.md            npm run script -- <id>      (only if needed)   --approve
```

There's one writer (Claude) and one evaluator pass, with at most one focused revision. Every principle below is a writing
requirement and an evaluation criterion. None of them is a separate stage or a separate model call. `npm run script` lints
the mechanical parts (structure, cause and effect, setups and payoffs, static shots, repeated framing, the decision, length, sources),
so the evaluator can spend its attention on judgement.

The template is `productions/_template/story.md`. Worked references: [storytelling/benchmarks.md](storytelling/benchmarks.md),
and the samples in `productions/sample-*`.

---

## 1. Choose the format (write the reason in one sentence)

Choose what the idea needs, not the last format used. Formats can combine (`format: immersive+mystery`). If none fits,
use `other: <name>` and say why.

| Format | Use it when | The engine that makes it work | Typical shape | Visual priority |
|---|---|---|---|---|
| **immersive** | Horror, survival, impossible dilemmas: anything where the viewer should ask "what would *I* do?" | A specific situation in the second person, with two competing explanations, each backed by evidence. Each new clue makes the choice *harder*, not easier. | A situation in one sentence ("Imagine your bus driver skips your stop…"). Then source A says X, and source B contradicts it. Then evidence for A, then evidence for B, then the decision. | POV and over-the-shoulder shots; the evidence on screen (texts, marks, shadows, a headcount); sound off-screen. |
| **action-first** | History, inventions, science, engineering, behaviour, odd real events | Someone does something that looks irrational. Curiosity comes first and the explanation second, and the explanation *dissolves* the strangeness. | An odd action. Then the reactions or doubters. Then the circumstances and stakes. Then the turn ("You see…", or any explanation turn). Then the mechanism, shown step by step. Then the consequence that proves it. | Animate the mechanism; show the object working, not someone describing it. |
| **world-rule** | Fiction, sci-fi, fantasy, thought experiments | **One** rule changes ordinary life. The protagonist has a personal problem with it, and the solution uses something set up earlier. | The rule in one line. Then how ordinary life works around it (2–3 quick images). Then the protagonist's relationship to it. Then an emergency. Then a clever, earned payoff. | Show the rule's everyday consequences as images (wagons for children, never a list of facts). |
| **emotional** | Family, friendship, regret, change | A relationship and a want. The realisation reframes what we saw ("I was the last one"). | Who loves whom and what's slipping. Then small signs. Then the protagonist's part in it. Then the realisation. Then an act of repair. | Faces, hands, distance between people, the object that means something. |
| **mystery** | Suspense, the supernatural, psychological stories | Clues the viewer can observe and remember. A reveal **recontextualises** them ("wait, that explains…"). | Something wrong. Then a clue, then a clue, then a contradiction, then the reveal that reuses the clues. | Clues shown big and held long enough to be remembered; the reveal reshows them. |
| **serial** | Multi-part series | A protagonist with a larger goal. Each part is complete, but leaves a concrete open question or decision. | One complete arc per part, ending on an A/B decision with consequences, or a new question. | Continuity across parts: the same places, objects and rules. |

**Don't** force a story into a format, or fall back on the explainer formula by habit. Float Away is not a Rick's Clips story,
and a horror mystery is not a world-rule adventure.

## 2. Write the story (the beat sheet is the script)

Answer these before writing a single line. The template has a field for each.

- **Premise and question:** what the viewer wants answered, in one sentence. If you can't write the question, there's no hook.
- **Protagonist:** what they **want**, what they **fear**, what they **protect**, the **decision** they make, and what happens because of it.
  A protagonist who only witnesses events is a camera, not a character.
- **Rule or conflict:**
  - the world rule (world-rule);
  - the two competing explanations (immersive, mystery);
  - the odd action (action-first);
  - the relationship at risk (emotional).

Then write the **beats**: one row per moment. Each beat must **change** what the protagonist knows, believes, has or must
do. If a beat changes nothing, cut it.

**Principles:**

**A. Premise.**
- Open on the situation, the action or the consequence, never on "Today we'll learn".
- The viewer needs enough to be curious, not enough to be finished.

**B. Motivation.**
- The protagonist's want must be clear by about 15 s.
- Stakes must be personal: a person, a promise, a place.

**C. Cause and effect.**
- Write every beat as "because of the last one".
- Weak: a noise, then a shadow, then a message, then running.
- Strong: a voice that knows a secret, then a message from that same person saying they're outside. Now there are two sources that can't both be true.

**D. Information release.**
- **Productive curiosity** is when the viewer understands the situation but not the answer.
- **Unproductive confusion** is when they don't understand the situation.
- One new concept at a time, and never two unexplained things in the same beat.

**E. Escalation.**
- Each beat raises at least one of these: the stakes, the danger, the emotional investment, the curiosity, or the difficulty of the decision.
- Being louder is not escalation. A changed situation is.

**F. Setup and payoff.**
- Every ability, object, rule or clue that solves or reveals must appear earlier, in the setups/payoffs ledger.
- Nothing new is introduced at the last second.
- A reveal must make an earlier image mean something new.

**G. Explanations.**
- Explain through events: a comparison, a visible demonstration, a concrete example, and a consequence that proves it.
- Give a hard idea more time. A clear 90 s beats a confusing 55 s, but don't pad a simple story.

**H. Ending.**
- Pay off the central question, or open a *meaningful* new one: a clever solution, a realisation, a reversal, a recontextualising reveal, a consequence, or a decision.
- **A/B only when both options are understandable and both have consequences.** Write each option's consequence.
- A cliffhanger must be a clear situation, not a confusing mystery.

**Length:** the story decides it.
- **Explainers:** about 55–65 s (175–205 words at George's pace).
- **Stories:** usually 70–100 s.
- **Silent action beats:** count them. They're often the best moments.

## 3. Plan the visuals in the same rows

The storyboard communicates events; it doesn't decorate the narration. For every beat, fill in these columns:

| Column | Question |
|---|---|
| **happens** | What physically happens? |
| **viewer learns** | What should the viewer understand by the end of the beat? |
| **subject** | What's the one thing on screen that matters (a face, a phone, the ball in the dragon's mouth)? |
| **action** | Which physical action or reaction communicates it (grabs, drops, turns toward the sound, hesitates)? |
| **camera** | Which move directs attention to the subject? (Moves are in docs/STORYBOARD.md.) |
| **changes** | What's different at the end of the beat? |
| **sound** | Which sound carries it? Silence counts. |

**Visual rules:**
- **Show, don't describe.** Signing means a pen moving on paper. A vote means hands going up and the count. Breaking means the object breaking. A pose is not an action.
- **Evidence on screen:** clues, messages, marks and mechanisms must be big, readable and held, so the viewer can interpret them.
  If the ending depends on a clue, the clue gets its own insert earlier.
- **Purposeful camera.** Each change of shot has a reason:
  - **wide:** geography and scale;
  - **insert:** evidence;
  - **pushIn:** noticing;
  - **pov or overShoulder:** what the character sees;
  - **closeUp:** a reaction that changes understanding;
  - **follow:** a chase;
  - a **new angle:** when the information changes.

  Never move the camera just because the system can. Avoid the same framing three beats in a row.
- **Readable on a phone:**
  - The key subject must be big.
  - Hands and props stay in frame.
  - No foreground body covers the action.
  - Major actions get time, about 1.5 s or more.
- **Acting:** characters look at what matters, turn toward sounds, hesitate, flinch, and handle props.
  An explainer doesn't stand facing the lens for a whole line.
- **Continuity:** keep the same spatial layout, clear entrances and exits, and objects where we last saw them.
- **No-narration test:** mute the narration. The main action, discoveries, decisions and consequences must still be readable.
  Narration and pictures should complement each other, not repeat each other word for word.
- **Sound tells the story:**
  - footsteps, knocks, a distant voice, breathing;
  - silence before a reveal;
  - impact on physical events;
  - music turning with the emotion.

  Don't put a sound effect on every camera move.
- **Inserts are expensive attention.** Use repeated phone or screen close-ups only for new evidence. Otherwise show it in the scene
  (for example, floating message bubbles beside the character).

## 4. The evaluator (one pass, honest)

Write it into `## Evaluation` in `story.md`, after `npm run script -- <id>` has run the lint. Judge the script and the visual plan
together.

- **Story:**
  - Is the premise compelling, the opening effective and the format right?
  - Is the motivation clear, and does the logic hold?
  - Does every beat change the situation?
  - Is the information released at the right time?
  - Is the escalation meaningful?
  - Are setups paid off, and does the ending pay off the question?
- **Engagement:**
  - Is there a question the viewer wants answered?
  - Is the viewer involved, through decisions or competing explanations?
  - Does new information change their understanding?
  - Where does nothing happen?
- **Visuals:**
  - Does every important action have a picture?
  - Are characters doing, not standing?
  - Is the evidence readable and the camera directing attention?
  - Are reactions meaningful, the space clear, and big moments given time?
  - Does the no-narration test pass?
- **Clarity:**
  - Would a first-time viewer follow it?
  - Is any concept overloaded?
  - Is the mechanism explained?
  - Are identities and motives clear?
  - Is the final decision understandable?
- **Accuracy** (factual stories):
  - Is every claim sourced in `research.md`?
  - Are uncertain claims worded as uncertain?
  - Does the dramatisation change what happened?
  - Viral videos and their comments are **not** sources. Use research to learn techniques, not to establish facts.

**Output:**
- the three most important weaknesses, each with *why* it hurts and a targeted fix;
- **one** focused revision;
- a re-check;
- a verdict: `ready`, `revise`, or `not strong enough`. Say so honestly.

No numeric scores. Don't rewrite the whole story in a loop.
`npm run script -- <id> --approve` refuses unless the lint passes and the verdict is `ready`. The owner approves the actual story
before any production.

## 5. After approval

Production is unchanged (docs/TOPIC_TO_VIDEO.md, from step 4):
- `npm run script -- <id> --storyboard` writes a storyboard skeleton with one shot per beat, its lines, and the beat's purpose and planned camera as notes.
- Build from there with the library. The narration cost is still approved separately by `npm run short`.
