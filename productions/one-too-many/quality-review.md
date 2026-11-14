# One Too Many: quality review of the opening prototype

Compared against the finished Float Away (540p preview), Pirate Democracy (final), Extra Door (final) and Marathon 1904,
using frame sheets of each film's first 20 s, the storyboards' settings and the narration records. No paid narration
and no new renders (two free before/after stills only).

## What changed, measured
| | Float Away | Pirate Democracy | Extra Door | One Too Many |
|---|---|---|---|---|
| Motion blur + controlled blur | on | on | on | **off** |
| Music level | −3 dB | (engine 2) | −3 dB | **−10 dB** |
| Library framing moves (frame / closeUp / overShoulder / insert) | 31 of 60 cameras | 36 of 49 | 13 of 37 | **1 of 10 shots** |
| Depth of field | yes: library moves set the lens blur (cInf 9–15) | yes | yes (close-ups) | **none**: every hand-placed `at` camera has cInf 0, so the whole frame is sharp |
| Light | interior, night, day: shaped, warm/cool | day on a deck, soft DOF | interiorCool (horror) | flat noon "day" on an open field |
| People in frame | 1–5 leads, faces large | 2–6, faces large | 1 (Milo), face fills the frame | up to 60 small identical pupils |
| Narration | Milo (liam), first-person; 7 words a line; 9 of 29 lines spoken in the scene | georgeLively (expressive) | Milo whispering + 2 hushed-George lines; 5 words a line | espeak placeholder; the plan is 21 of 23 lines in georgeHushed, 14 words a line |

## Why the visuals look worse
1. **The camera grammar regressed.** Nine of ten shots are hand-placed (`at`) cameras. In this engine those carry no depth of field (`compile.ts`: `case "at": … cInf: 0`). Every finished video relied on library framings, which soften the background and isolate the subject. Without them, every block and window is in equal focus, so the school reads as assets placed into a scene.
2. **The shot scale is wrong for our style.** About 11 of the 20 seconds are wides or overheads of ~60 small, identical, neutral pupils. Our good videos spend most of their time on two to five large, expressive faces.
3. **The lighting is flat and the tone is wrong.** Noon light on a huge lime-green field gives no shadow shape, no depth haze and no unease. Extra Door, our horror, used a cool interior with shaped light. The new set is boxes with a repeated window grid and empty grass: nothing in the foreground and no layering.
4. **There's no performance.** The pupils stand neutral. Each lead holds one expression and does one generic gesture (walk, point, shrug, scratch). Earlier films timed looks, reactions and gestures to words, and the faces were big enough to read them.
5. **The graphics took over.** The number tags are the most eye-catching thing on screen for about 6 s. They should support the count, not be the picture.
6. **The render settings slipped.** Motion blur and controlled blur were on in every finished film and are off here. Music sits 7 dB lower than in every finished film, which thins the sound.
7. **My own check was the wrong check.** I verified "does it read" (does the count reach 31), not "is it as good as our last films". There was no side-by-side against a reference video before rendering.

## Why the narration feels worse
1. **The espeak placeholder isn't representative.** It made the cut sound far worse than any real take would. No ElevenLabs narration exists for this script yet.
2. **The workflow itself is intact.** The voice presets, cache, word timings and mix are unchanged (`voice/voices.ts`).
3. **The planned casting doesn't match what worked.**
   - The plan puts all main narration on `georgeHushed` (stability 0.6, speed 0.95). Before this, that preset only ever read 2 short lines, in Extra Door.
   - Long narrations that worked used `georgeLively` (Pirate Democracy, Marathon 1904) or Milo's own voice (Float Away, Extra Door).
   - A whole film in hushed George risks a monotone.
4. **The delivery structure is weaker.**
   - Twenty-one of 23 lines are a detached third-person narrator reading exposition at about 14 words a line.
   - Our best films are told largely by characters in the scene: Milo counting the doors, Gus and Juno speaking. Their lines were short (5–7 words) with deliberate pauses.
5. **The audition step was skipped.** Extra Door recorded cheap audition takes (two presets per voice) and you chose before the full generation. This production went straight to a placeholder.

## What produced better results before
- **Library framing moves** (frame, closeUp, overShoulder, insert, pushIn), with their automatic lens blur. Hand-placed cameras were kept for set pieces and flights.
- **Motion blur and controlled blur on;** music at −3 dB.
- **A small cast of designed characters,** acting on every shot.
- **One designed set per mood,** lit for that mood (Extra Door's hallway).
- **Voice auditions first,** then the full generation with the chosen presets, delivery notes per line, and in-scene lines.
- **A side-by-side check against a reference video** before showing a prototype.

## Correction plan (small; no new story, no engine change)
1. **Settings:** `motionBlur: true`, `controlledBlur: true`, music gain −3. A one-line change.
2. **Camera:** rebuild the 10 opening shots mainly from library framings, with hand-placed cameras only for the crane and the overhead. Aim for at least two-thirds of the time at medium shot or closer, on Ms Okoye, the head, two or three named pupils, and Carol.
3. **Acting:** every shot gets a timed beat. Ms Okoye's lips and pen move as she counts; two pupils in the foreground nudge each other; the head sips and waves it off; Ms Okoye freezes, looks again, then a slow push on her face. All of this uses the existing beats, gestures and moves.
4. **Environment and light:** tune the field set rather than replace it.
   - Lower-saturation grass, and a few foreground layers: hi-vis teachers, a pile of bags, the fence.
   - Break up the repeated windows.
   - Late-afternoon light with the sun placed to shape the building, not darken it.
5. **Graphics:** keep the tags for the first count only, and only on the last file of pupils. The recount and the reveal are carried by faces and framing.
6. **Narration, needing your approval because it costs credits:**
   - An audition of 3 lines in 2 presets (`georgeLively`, `georgeHushed`; about 300 characters, about 120 credits) before any full generation.
   - Optionally, Ms Okoye's count spoken under her breath in the scene ("…twenty-nine, thirty… thirty-one?"), using the script's own numbers.
7. **Process:** before the next prototype render, compare the stills side by side with Float Away and Extra Door frames for subject size, softness, palette and acting.

Evidence: the before/after stills (`/tmp/claude-0/-home-user-claude-animated-shorts/31edbf3d-159a-51cd-8f3a-7e5275c06b7f/scratchpad/cmp/ab.jpg`): the same frames with current settings and with golden light, motion blur and a library close-up. The close-up's soft background brings it back to our earlier look. The golden preset darkens the building too much, so the light needs tuning, not just a preset swap.
