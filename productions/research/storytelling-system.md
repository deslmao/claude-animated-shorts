# The Thinkora storytelling system (mandatory for every new production)

**Why it exists:** three productions in a row failed the same way:
- *What Ollie Says*: "What is it about though?"
- *4,012 Steps*: the hook and first frame
- *The Empty Seat* v2: the June fog, the "1, 2, 3", the handprint and "It's snowing. It's June." were all shown but
  never explained.

The writer knows the whole story, so every gap looks obvious to them. **The viewer knows nothing.** This system makes
the gap visible before any voice is recorded, and the pipeline enforces it.

## The test: the Stranger Test
Read the viewer script (below) as someone who has never heard the story. At every shot, they must be able to say:
1. **Who** is on screen, and what their role is.
2. **What** is happening.
3. **Why** it matters, or why it's strange.

If any answer is "they'd have to guess", the script fails.

## The rules
1. **A narrator carries the story.** A calm, second-person storyteller ("you") sets up every scene in plain words.
   Characters speak only *after* the narrator has said who they are and what's going on.
2. **Explain every strange thing the moment it appears**, in words: what it is, and why it's strange. This covers
   actions (he stops at a closed stop), rituals (he counts to three), objects (a fogged window), events (a handprint)
   and weather (snow). Showing it is never enough.
   > "It's June. It's hot. But the window by seat thirteen is always fogged up, from the inside. As if someone is
   > breathing on it."
3. **Introduce every character by role before they speak:** "Mr Hale, the driver"; "a new driver".
4. **Narrate the situation, then play the moment.** Before a dialogue or audio moment, one plain sentence sets it up:
   > "Then one morning, Mr Hale got sick. A new driver covered his route."

   *Then* the radio plays.
5. **No line may depend on knowledge the viewer doesn't have.** "It's snowing. It's June." fails. This passes:
   > "Outside, it's snowing. In June. Just like the morning Emily was left behind."
6. **Name the action.** Who does what to whom, in words and in the picture: "So you run to the front and tap the
   driver's shoulder."
7. **Every voice must be instantly distinguishable:**
   - the narrator: a calm adult;
   - the POV character ("you"): a voice no other character shares (a different age, gender or timbre);
   - each speaking character: their own caption colour.

   Fewer speaking characters is clearer.
8. **Rituals are explained, then done quickly.** Say what it means ("He waits three seconds: just long enough for a
   little girl to climb on"), then let it happen fast.
9. **One sentence premise.** If the whole story can't be said in one plain sentence, it isn't ready.
10. **The cold open is explained at once.** The first line says what the first image is, and why it's impossible.
11. **Every reveal pays off something the viewer was told earlier**, never something they had to notice alone.

## How the pipeline enforces it
- **The clarity block (required).** Every new storyboard has `clarity: { premise, facts }`. Each fact is something the
  viewer must understand, plus the exact words that tell it:
  ```ts
  clarity: { premise: "...", facts: [
    { fact: "why nobody sits in seat 13", said: "it belongs to a girl called Emily" },
    { fact: "why the fog is strange", said: "it's june" }, ... ] }
  ```
  - `npm run short` **fails at validate** if a new storyboard has no clarity block.
  - It also fails if any fact is never said in a spoken line ("the viewer is never told …").
  - Productions made before the gate are listed as legacy and left untouched.
- **The viewer script (approved instead of a screenplay).** Every validate run writes
  `productions/<id>/viewer-script.md`:
  - the picture of each shot, and every spoken line with its speaker;
  - a checklist showing which shot tells each fact.

  Stage directions never reach the viewer, so **the owner approves the viewer script.**
- **The order of work:**
  1. premise;
  2. clarity facts;
  3. viewer script;
  4. the owner's approval;
  5. then voices, sound and rendering.

## Writing checklist (use it before showing any script)
- [ ] The premise is one sentence.
- [ ] Every strange thing has a "why" line at the moment it appears.
- [ ] Every character is introduced by role before their first line.
- [ ] Every dialogue or audio moment has a narrator set-up line before it.
- [ ] No line needs knowledge the viewer wasn't given.
- [ ] The POV voice is unlike every other voice.
- [ ] Rituals are explained and quick.
- [ ] Every action is named (who does what to whom).
- [ ] The viewer script passes the Stranger Test, shot by shot.
