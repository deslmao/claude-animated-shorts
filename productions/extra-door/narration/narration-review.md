# Video 05: The Extra Door, final narration (waiting for the owner's approval)

Generated with the existing voice workflow (`npm run voice -- extra-door --generate`) using the approved presets:
- narrator: `georgeHushed`;
- Milo: `liamQuiet`, the existing model;
- Juno: `juno` (Jessica, provisional), and `junoCold` for "Don't text her".

11 lines from 10 recordings, 290 characters. The script wording is unchanged. Pronunciation: **NOT verified**
(the owner's review). Owner review 1: "Juno" was mispronounced; line 6 was corrected (see below).

- `extra-door-narration.mp3`: voice-only mix on the script's planned timeline, 55.0 s. The knocks, phone, handle and
  music come later, at the sound stage; the gaps for them are left as silence.
- `pronunciation-check.mp3`: the lines back to back, 0.8 s apart.

| # | Who | Line | Planned start | Speech length |
|---|---|---|---|---|
| 1 | Milo | "...six... seven... ...eight?" ("eight?" at 1.97 s) | 0.00 | 2.1 s |
| 2 | Narrator | "Milo's hallway has seven doors... It always has." | 2.60 | 3.2 s |
| 3 | Milo | "Okay. I'm just tired." | 6.60 | 1.6 s |
| 4 | Milo | "One, two, three, four, five, six, seven... ...eight." | 9.00 | 3.5 s |
| 5 | Milo | "...that's where our picture hangs." | 14.00 | 1.6 s |
| 6 | Milo | "...Juno?" | 25.60 | 0.5 s |
| 7 | Juno | "Milo... it's me. Let me in." | 27.40 | 1.8 s |
| 8 | Juno | the same recording again, after exactly 1.0 s of silence | 30.22 | 1.8 s |
| 9 | Juno | "Don't text her." | 41.00 | 0.9 s |
| 10 | Milo | "...what do I do?" | 49.40 | 1.1 s |
| 11 | Narrator | "Comment A or B. Your vote decides Part 2." | 51.10 | 3.0 s |

Speech totals about 21 s; the planned film is about 54.5 s. The final timeline is set at the storyboard stage.

**Note on line 1.** The first generated take landed "eight?" at 2.64 s, and a second take at 2.69 s. Both are kept
outside the repo. The take used is the audition take the owner approved (same voice, model, settings and text, so
no new generation), imported into the voice cache with word edges measured from its sound. It lands "eight?" at
1.97 s.

**Pronunciation correction (owner review 1).** The owner heard "Juno" mispronounced. The only line that says the name
is Milo's line 6, "...Juno?" (Liam, `liamQuiet`). None of Jessica's lines say it. Only that line was regenerated:
- **What changed:** the same preset settings and the same text, plus an ElevenLabs pronunciation-dictionary alias
  (Juno -> "Jew-noh", that is JOO-no), applied on the server. The timestamps still spell the caption "...Juno?".
- **How it was checked:** speech-to-text on each take, placed after the carrier phrase "Her name is":
  - the old take was heard as "Yeo Junho" (an extra syllable);
  - the new take was heard as "Juno?" on both runs.
- **Length:** the new take is 1.02 s and its speech starts at 0.14 s (the old one was 0.97 s), so the timeline is
  unchanged.
- **Untouched:** the other 9 recordings are byte-identical, checked with MD5.
