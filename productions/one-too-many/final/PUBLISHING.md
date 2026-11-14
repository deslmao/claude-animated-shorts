# One Too Many: publishing package

Nothing has been uploaded or published. The film is unchanged.

**Video:** `Short-one-too-many.mp4`
- 1080x1920, 30 fps, 3,836 frames = **2:07.87** (127.867 s). H.264 and AAC, 51.6 MB.
- From render run 28 (see `QA-REPORT.md`).
- The MP4 is still the GitHub artifact `Short-one-too-many-run28` (kept until 2026-12-14): the download into this folder was refused by this session's permission check.
- At 2:08 it is inside YouTube Shorts' and Instagram Reels' 3-minute limit, and TikTok's.

## Thumbnail
**Recommended: `thumbnail-youtube-1280x720.jpg`** ("WHO'S NUMBER 31?")
- 1280x720 (16:9), sRGB JPEG, quality 95 with 4:4:4 chroma, 292 KB (YouTube's limit is 2 MB).
- **The image:** the class in navy faces us, crowded on the left. A step apart, alone in the middle of the frame, a girl in a faded maroon blazer stands with her back to us, facing the school, under a "31" count tag. She is the only warm, saturated shape against the blue glass doors, so she reads first even at phone size.
- **The idea:** the image shows "one extra pupil", and the text only asks who she is.

All five compositions are in `thumbnails/candidates/`, and `thumbnails/comparison-sheet.jpg` shows each at full size and at phone size (320 px).

| | Idea | Strength | Weakness |
|---|---|---|---|
| **A: the line** ✅ | The class faces us; Carol stands apart, back turned, under the 31 | The clearest single idea; reads at 320 px; the maroon against blue is the strongest contrast of the set | Daylight, so it's eerie rather than dark |
| D: the register | ON REGISTER: 30 / COUNTED: 31, circled in red, with Carol behind | No overlay text needed; the circled 31 reads at any size | The page details are small at 320 px; a document is less emotional than a figure |
| E: the formation | High view of the three files, the 29-30-31 tags, Carol outside them | Clean and graphic; "ONE TOO MANY" in maroon | Looks like a diagram; Carol is at the edge |
| C: facing you | Sunset; the class's backs, Carol the only one facing us | The most cinematic light | The extra-pupil idea depends on the text; the maroon is lost in the backlight |
| B: the count | Ms Okoye mid-count, pointing at Carol | A worried face sells emotion | Ms Okoye's plum jacket reads as a second maroon figure, which muddles the idea |

**A/B test (YouTube "Test & Compare"):** A against D: a figure against a document.

**How they were made:**
- A separate set-up file, `animation-studio/src/studio/stories/one-too-many-thumbs.ts`, uses the film's own set, characters, props and lights, staged for 16:9.
- Each was rendered at 2x (2160x3840) with the film's engine. A 16:9 band was cropped and downscaled, then given a light one-light grade and the channel's caption font.
- Rebuild with `python3 -I thumbnails/make_thumbnails.py`. Sources are in `thumbnails/source/`.

**Shorts cover frame:**
- YouTube shows the 16:9 thumbnail in search, on the channel page and in suggestions. The Shorts feed shows a frame from the video.
- In the app's frame picker, pick **0:15.3–0:15.7**: Carol at the end of the line, her back turned, under the 31 tag, with the 30 tag and Ms Okoye beside her and the caption "one?".
- Use the same moment as the TikTok and Instagram cover.

## YouTube
**Title (recommended):**
```
She Counted 31 Pupils. The Register Said 30.
```
Alternatives:
- `Every Fire Drill, Her Class Has One Pupil Too Many`
- `The New Teacher Kept Counting One Extra Pupil`

**Description:**
```
Every fire drill at Ashford High, Year Seven comes out with one pupil too many.

On her first drill, Ms Okoye counted her class: 31. The register said 30. So she took a photo of the line, and at the very end stood a girl in a maroon blazer. Ashford's blazers have been navy for forty years.

An animated ghost story from Thinkora.

#Shorts #GhostStory #ScaryStories #AnimatedStory #Mystery #Thinkora
```

**Hashtags** (the first three show above the title): `#Shorts #GhostStory #ScaryStories`. The rest are in the description.

**Tags:**
```
one too many, ghost story, school ghost story, fire drill, animated ghost story, scary school story, mystery story, creepy story, headcount, extra pupil, british school, teacher story, animated short, horror short, thinkora
```

**Pinned comment:**
```
Be honest: on your first fire drill as a teacher, would you have just counted again, or checked every face? 👀

(And rewatch the very last count. Who do you think is standing at the end of the line now?)
```
It asks a real question, and the second line sends viewers back for a rewatch without spelling out the ending.

**Settings:**
- **Category:** Film & Animation.
- **Audience:** "No, it's not made for kids". It's a ghost story with a child's death in the backstory and a death at the end (neither is shown). No age restriction is needed: it's non-graphic.
- **Language:** English (United Kingdom).
- **Captions:** burned into the video. Don't switch on YouTube's automatic captions as well, or they'll double.
- **Altered or synthetic content:** not required. It's stylised animation that nobody would mistake for real footage.
- **Comments:** on. Pin the comment above.

## TikTok
```
Every fire drill, her class counts one extra pupil 👀 The register says 30. Ms Okoye kept counting 31. Then she checked who was standing at the end of the line.

#ghoststory #scarystories #animation #storytime #thinkora
```

## Instagram Reels
```
She counted 31. The register said 30. 👀

Every fire drill at Ashford High, there's one pupil too many. Ms Okoye was new, and she was the first to find out why.

#ghoststory #animatedstory #mystery #thinkora
```

## Files in this folder
| File | What |
|---|---|
| `PUBLISHING.md` | this package |
| `thumbnail-youtube-1280x720.jpg` | the recommended YouTube thumbnail |
| `thumbnails/candidates/A-the-line.jpg` … `E-the-formation.jpg` | the five compositions, 1280x720 each |
| `thumbnails/comparison-sheet.jpg` | all five at full size and at phone size |
| `thumbnails/source/*-2160x1215.jpg` | the 2x engine sources (16:9 bands) |
| `thumbnails/make_thumbnails.py` | rebuilds every thumbnail from the sources |
| `QA-REPORT.md`, `qa-flagged-frames.jpg` | the final render QA |
| `Short-one-too-many.mp4` | **not here yet:** it is on GitHub as artifact `Short-one-too-many-run28` (see `QA-REPORT.md`) |
