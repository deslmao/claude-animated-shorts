# One Too Many: final script (owner-approved premise)

Narrated, third person. Narrator: `georgeHushed` (the channel's calm horror narrator). The head: one line, voiced
on screen. About 322 words, about 90 s with the silent beats. Storyboard: `animation-studio/src/studio/stories/one-too-many.ts`
(composition `Short-one-too-many`).

## Narration
| # | Voice | Line |
|---|---|---|
| 1 | N | Every fire drill at Ashford High, Year Seven comes out with one pupil too many. |
| 2 | N | Ms Okoye was new. On her first drill, she counted them on the field. Thirty-one. The register said thirty. |
| 3 | Head | Happens every drill. Count again. |
| 4 | N | She counted again. Thirty. |
| 5 | N | So at the next drill, she took a photo of the line. |
| 6 | N | Thirty-one children. And at the very end, a girl in a maroon blazer. Ashford's blazers have been navy for forty years. |
| 7 | N | She wasn't looking at the camera. She was staring back at the school. |
| 8 | N | In the library, Ms Okoye found the old year photos. 1979. Maroon blazers. And at the end of the back row, the same girl. |
| 9 | N | Underneath, a small brass plaque. Carol Webb, aged eleven. Lost in the fire of 1979. |
| 10 | N | You see, that fire was real. On the field, a teacher called the register, and when he said "Carol Webb", a boy shouted "Here!" as a joke. |
| 11 | N | Everyone was out, the count said. So nobody went back in. |
| 12 | N | Ever since, Carol has stood at the end of every line, making every count wrong. Because a wrong count makes teachers check every face. Nobody checked hers. |
| 13 | N | Then, one March morning, the alarm rang for real. |
| 14 | N | Smoke poured from the science block. Ms Okoye counted her class. Thirty. Exactly right. |
| 15 | Head | That's everyone. Well done. |
| 16 | N | But Ms Okoye was looking at the end of the line. Carol was there. Staring at one window. |
| 17 | N | If Carol was in the line, and the count was right, one of her children wasn't. |
| 18 | N | She checked every face. Leo was missing. He'd gone to the toilets just before the bell. |
| 19 | N | The head told her to wait for the fire brigade. She ran back in. |
| 20 | N | Smoke rolled along the ceiling. She stayed low, calling his name. |
| 21 | N | She found him under the sinks, and pushed him towards the stairs. |
| 22 | N | Leo came out. Ms Okoye didn't. |
| 23 | N | At the next fire drill, her class counted thirty-two. |

The counts are one form, 7C (register 30), so the numbers can be shown on screen, not just said:
- first drill: 30 pupils plus Carol = 31; the recount = 30, because she's gone;
- the real fire: 29 pupils plus Carol = 30 ("exactly right");
- the ending: 30 plus Carol plus Ms Okoye = 32.

## Story check (one pass, fixes applied)
- **The counts.** The numbers were changed from the whole of Year 7 (60) to one form (30), so every count can be shown as number tags over heads.
- **How she identifies Leo.** Added "She checked every face", the thing nobody did for Carol, so she finds the missing child herself.
- **Why one over, not one under.** An over-count makes teachers re-check every face, while an under-count only sends someone looking for a name. Line 12 says this outright.
- **Why the count is "right" in the real fire.** Carol is in the line in place of the missing child, and line 17 states the logic. Ms Okoye's decision (line 19) mirrors line 11: this time someone did go back in.
- **The ending.** The non-graphic death ("Ms Okoye didn't") resolves into the count of 32: she now stands at the end of the line too.

## Visual plan, by beat
- **Lines 1–4 (the prototype):**
  1. The bell rings, a hard push-in.
  2. The classroom empties at the lens.
  3. A crane from the doors to the field.
  4. A close-up of the nervous new teacher.
  5. An over-the-shoulder shot of her pointing along the file.
  6. Overhead, number tags pop 1 to 31, with the 31st over the girl in the faded maroon blazer, the only pupil facing the school.
  7. The register insert: ON REGISTER 30, COUNTED 31.
  8. The head with a mug, shrugging.
  9. Overhead recount: 1 to 30, and the end of the file is empty.
  10. Low across the empty place toward the school.
- **Lines 5–7:** her phone photo; zoom to the end of the line; the girl's back, facing the building.
- **Lines 8–12:** library shelves; the 1979 photo (maroon blazers, the same girl at the end of the back row); the brass plaque, held long enough to read; a sepia flashback: smoke, the field, a teacher calling names, a boy shouting "Here!", everyone laughing; the school behind, a window glowing orange.
- **Lines 13–18:** the real bell; smoke from the science block; the overhead count landing on exactly 30; the head relieved; Ms Okoye's eyes go to the end of the line, where Carol stands in a gap, staring at one window; she checks every face, and there's a gap where Leo should be.
- **Lines 19–22:** she runs back in past the head; a corridor with smoke along the ceiling, low and calling; the toilets, Leo under the sinks; she pushes him to the stairs; firefighters at the door take Leo; the doorway behind him stays empty.
- **Line 23:** the next drill's overhead count: tags 1 to 32, the last two over a girl in maroon and a woman with a clipboard, both facing the school. Cut to black.

## Assets
- **Built for the opening** (theme `onetoomany`, plus a `pupil` crowd era):
  - the `ashfordField` set;
  - the characters okoye, rowe, carol and leo;
  - the props fireBell, clipboardCard, assemblySign and countTag;
  - the clipboard item;
  - the SFX fire_bell, kids_chatter and chair_scrape.
- **Still to build:**
  - the library corner (shelves, the 1979 photo, the plaque);
  - the 1979 flashback grade (sepia field, smoke, period teachers);
  - a school corridor with ceiling smoke;
  - the boys' toilets;
  - the smoke effect from the science block;
  - firefighters;
  - the phone-photo insert.
- **Reused:** the classroom set, school desks, chairs, the crowd generator, the mug, the day and golden lights, the mystery music and the nature ambience.
