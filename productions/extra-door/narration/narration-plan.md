# Video 05: The Extra Door, narration plan (waiting for the owner's voice approval)

The script is approved (v1 plus the owner's decisions). The final narration has **not** been generated. The four
files in `auditions/` are short test takes so the voices, delivery and pronunciation can be reviewed first.

## Lines (final generation: about 290 characters, very cheap)
| # | Who | Line | Delivery |
|---|---|---|---|
| 1 | Milo | "...six... seven... ...eight?" | whispered, already mid-count; "eight?" ends at about 2.0 s |
| 2 | Narrator | "Milo's hallway has seven doors... It always has." | calm, low, unhurried; a 0.6 s pause before "It always has." |
| 3 | Milo | "Okay. I'm just tired." | muttered, trying to laugh it off |
| 4 | Milo | "One, two, three, four, five, six, seven... ...eight." | fast whisper, then a dead stop |
| 5 | Milo | "...that's where our picture hangs." | barely audible |
| 6 | Milo | "...Juno?" | frozen, hopeful |
| 7 | Juno | "Milo... it's me. Let me in." | warm and soft, through the door |
| 8 | Juno | (line 7 again: **the identical recording**, after a 1.0 s pause) | the same clip, byte for byte |
| 9 | Juno | "Don't text her." | quieter and closer, flat |
| 10 | Milo | "...what do I do?" | to the viewer, whispered |
| 11 | Narrator | "Comment A or B. Your vote decides Part 2." | calm, low |

**The exact repeat costs nothing.** Line 8 has the same voice and text as line 7, so the voice cache reuses the very
same clip: one recording, played twice.

## Proposed voices
- **Narrator: George, hushed** (the channel voice). A new preset: stability 0.6, speed 0.95 (the channel default is
  1.1). Calmer and slower, for horror. Compare the two takes in `1-narrator.mp3`.
- **Milo: Liam** (his established voice since Video 03). Two options, side by side in `2-milo.mp3`:
  - **A (recommended):** the standard model, quieter and slower (stability 0.55, speed 0.95). It is the same model as
    all of Milo's earlier lines and keeps the hook tight ("eight?" at about 2.0 s). It reads as quiet speech rather
    than a true whisper; the mix can sit it closer and quieter.
  - **B:** the expressive v3 model with a whisper tag. A real whisper (about 12 dB softer), but slower (the hook's
    "eight?" only lands at about 4.1 s), and its word timings include the tag text, so captions would need a small,
    opt-in tag filter. That is the only code change this option needs.
- **Juno: Juno has never spoken in any production, so she has no existing voice.** Three candidates from the
  channel's shortlist, each heard in `3-juno.mp3` as line 7, a 1.0 s pause, the identical clip again, then line 9:
  - **Jessica** ("playful, bright, warm"). Recommended: the warmth is what makes the lure believable.
  - **Alice** ("clear, engaging").
  - **Matilda** ("knowledgeable, professional").

  Settings for each: stability 0.45, style 0.15, speed 0.9 (line 9: stability 0.55, speed 0.85). Whichever you choose
  becomes Juno's voice from now on.
- `4-juno-through-the-door.mp3` is a **preview only** of how the door could colour her voice in the final mix
  (muffled, with a small room). That treatment is applied in the soundtrack, not baked into the narration.

## Pronunciation to check
- "Milo" as MY-lo;
- "Juno" as JOO-no;
- "Part 2" read as "part two".

## Duration
The spoken lines total about 22 s. With the script's silences, knocks and holds, the film stays at about 53 s.
