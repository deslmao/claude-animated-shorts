# Video 04 production summary: The Worst Olympic Marathon Ever

**Status:** production and pre-render QA complete. The final cloud render is NOT started; it waits for the owner's
approval. Pronunciation remains NOT verified (the owner's review).

## Locked inputs (unchanged)
- Narration: the approved 14 lines, the approved voices (hook georgeLively, Milo liam, the rest george), the approved
  in-line pauses. Timeline 65.33 s, 1960 frames. No line regenerated; the narration approval still matches.
- Script: `script.md` (approved v2 with the owner's line-8 wording); research and sources: `research.md`.

## What was built (all code, free; library additions only)
**race1904 theme** (`src/studio/themes/race1904/`):
- **Set "raceRoad":** a hot, dusty dirt road through farmland, running across the frame, with:
  - a start area, the well (the one water stop), an orchard bend, a farm gate and a corn field, and the finish with a spectator rail;
  - rail fences and telegraph poles, a red barn and a farmhouse on the hills;
  - a hot-afternoon sun from behind the camera (the golden preset's colours, so faces are lit, not backlit).
- **Props:**
  - motor car (1900s): drivable, with a seated rider;
  - farm dog: stylised, galloping and barking;
  - apple tree;
  - finish banner (its text is a parameter: ST. LOUIS 1904 / FINISH / BOSTON 1905);
  - finish tape (breaks on a word);
  - arrow sign (COURSE);
  - modern water table.
- **Items:** egg, labelled strychnine vial, hip flask, rotten apple.
- **Characters**, one fixed look each, drawn plainly and respectfully:
  - Thomas Hicks: lanky, pale blue vest;
  - Félix Carvajal: small, long-sleeved white shirt, trousers cut off at the knee, street shoes;
  - Len Taunyane: green vest;
  - Jan Mashiani: maroon vest;
  - two handlers (bowler hats);
  - Milo as Lorz (mustard running vest);
  - Gus as the official (top hat, his red bow tie);
  - Juno in 1904 dress (straw boater, teal band);
  - a new crowd era of 1904 runners.

**Engine additions** (all opt-in; every approved storyboard compiles identically):
- **Character drawing:** knee shorts with bare shins, bare arms (running vests), and a boater hat.
- **Ride mode:** an actor walking with `mode: "ride"` is carried along seated (the car's riders), with no footsteps.
- **Prop `track`:** a prop travels with an actor every frame: the car around its rider, the dog 1.3 m behind the
  runner it chases. Its rig gets the distance and speed, so the wheels turn and the legs gallop. The validator
  checks such props where they really are.
- **Sun override per set** (already supported) and **music drop-out** (`musicDrop`): the bed fades out after
  "Marathon." and the button chord lands on "foot.". Measured: bed −29.6 dBFS, pause −54.5 dBFS, button −30.0 dBFS.
- **Five sound effects:** car engine putter, bulb horn, backfire with steam hiss, dog bark, egg crack.
- **New tests:** `test:race` (19 checks), added to `npm test`.

## The film: 27 shots (14 lines, mid-line cuts as split shots), about 60 camera set-ups
| Time | Sequence | What the viewer sees |
|---|---|---|
| 0:00–0:05.8 | Hook | Three hard cuts on their words: the car's headlamp rolling at the lens, the STRYCHNINE vial, Carvajal asleep under the apple tree. Then the ST. LOUIS 1904 banner, the runners surge off, and a crane rises on "marathon" |
| 0:05.8–0:10.4 | Conditions | The pack streams past STARTERS: 32. In the heat they run at the camera. An official's car passes on "dusty roads", then the lone well with the WATER MILE 12 sign |
| 0:10.5–0:13.5 | Organizer | Gus by the dry well, hand on chin; his eyes go to the runners, then a slow push in and a question mark ("reportedly": nothing on screen states the motive) |
| 0:13.6–0:20.1 | Lorz | Cramp (a stagger, hand on belly), the MILE 9 sign, the car pulls up; cut on action. Riding: Lorz grins at us while the car passes runners. The breakdown by the MILE 20 sign (bang, steam, shocked faces). He jogs past a walking runner and breaks the tape under FINISH |
| 0:20.2–0:24.0 | The joke | "It was a joke!" (close-up, shrug, a glance at the officials). Then the officials, unsmiling, over his shoulder, and a swoop into BANNED FOR LIFE on the race board |
| 0:24.1–0:35.6 | Hicks | Hicks held up between his handlers; close inserts on the egg, the flask and the vial (callback). A jolt on "stimulant", dizzy stars on "rat poison". He staggers home under FINISH, then 3:28:53 on the board, then SLOWEST EVER beside him |
| 0:35.7–0:44.0 | Carvajal | A low hero shot, then the coin purse, then an embarrassed shrug. Street clothes beside a vested runner. Under the apple tree, the rotten apple (macro), the nap from above (zzz) held over the narration's pause, then 4th at the finish (CARVAJAL 4TH) |
| 0:44.2–0:49.3 | Dog | Taunyane runs strongly. The dog chases him off the road into the field, seen low from behind, then a high view: the COURSE arrow points along the road while he runs away from it. Then 9th at the finish (TAUNYANE 9TH), Mashiani behind |
| 0:49.5–0:56.1 | "You see" | Juno at the board, FINISHED: 14 / 32, then 1896 1900 1904. Callbacks: the vial, the dry well, then the car's dust swallowing a runner (Garcia, not named), with an official running to help |
| 0:56.3–0:59.2 | Today | A white flash to a modern street race: Milo at the water table (WATER), then NO STRYCHNINE |
| 0:59.4–1:05.3 | Punchline | "And Lorz?" with a grin to camera, then BANNED 6 MONTHS. Spring daylight at the BOSTON 1905 banner: he breaks the tape, the music drops out, and the camera swoops to his running feet on "On foot." |

## Accuracy guard (as approved)
- No bib numbers and no starting pistol.
- Hicks is supported, never carried.
- "Rat poison" is shown by his reaction; no rat-poison label.
- The organizer's motive is never written on screen.
- MILE 20 = nine plus the next eleven.
- No car at Boston.
- Garcia collapses and is helped.
- BANNED 6 MONTHS (the AAU commutation).

## Pre-render QA results
- Validator: all storyboards valid, all subjects framed. Video 04 has no errors, only advisory warnings (see the report).
- Camera clearance: every frame of Video 04 is clear of scenery (no camera inside or grazing scenery, no blocked view;
  no `blockOk` exemptions were needed); every other storyboard unchanged.
- `npm test`: passes (lint, framing, story, library, z-fighting, blur, camera, QA-frame tests, camera kit, line pauses,
  race 1904).
- Library: 607 protected assets intact; 56 additions recorded (the race1904 theme) plus catalogue entries.
- Approved productions: the 7 approved storyboards compile to identical cameras, poses, voice timing, soundtrack
  fingerprints and sound plans. All 14 regression reference frames are identical (BridgeShort, every approved-film
  frame, both engine-3 frames, the camera-kit frames). Three new Video 04 reference frames were recorded.
- Soundtrack: −14.0 LUFS, true peak −1.6 dBFS, 117 cues; the drop-out measured as above.
- Production pipeline: validate, assets, approval, narration, sound, checks (preflight + library) and review all pass;
  it stops at the review gate (the render stage is not run).
- Determinism: the review stage's spot check renders the same frames twice and compares them: **identical**.
- Preflight (run before every cloud render): **PASS** (1960 frames = 65.33 s, 27 shots, 14 narration lines,
  soundtrack fresh).

## Remaining technical and visual warnings (none blocking)
1. **Validator advisories (not errors):**
   - several runners' pumping arms or spectators' clapping hands briefly leave the side of the narrow frame;
   - a foreground figure fills about 31–35 % of the frame in five set-ups (intended close framings: Carvajal's nap,
     Milo over-the-shoulder, Hicks's handler, Taunyane in the chase, Milo's feet);
   - four sign / board props overlap minor set dressing in the floor map (a well post, the city shopfront): visually
     fine in the frames.
2. **The SLOWEST EVER board** only enters frame briefly in the pull-out. The time board (3:28:53) and the narration carry
   the point. It can be dropped or moved if you prefer.
3. **The dust in the Garcia shot** is cartoon dust puffs around him (there is no volumetric dust in the engine). The
   passing car and his choking read, but the dust cloud is modest.
4. **Frame QA on video** (near-blank / glitch / soft-still frames) runs on the finished video, so it runs in the cloud
   render's QA. It is not possible before rendering. The camera clearance check (which prevents the Video 03 class of
   defect at the source) passes on every frame.
5. **Review sheet timing:** `review.jpg` was rendered just before a final framing tweak to the 4th and 9th finish
   shots (their result boards were half cut). The corrected frames are in `representative-frames-2.jpg`. The pipeline
   re-renders the review sheet automatically before any render, because its inputs changed.
6. **Pronunciation:** NOT verified (your review of `narration/pronunciation-check.mp3`).

## Approval gate
Nothing is rendered. On your approval: `npm run short -- marathon-1904 --reviewed` re-checks the review sheet, then
commits the render request and runs the cloud render (chunks, join, QA), then downloads, QA, final.
