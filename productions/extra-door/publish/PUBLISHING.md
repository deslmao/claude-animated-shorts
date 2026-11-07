# Video 05: publishing package (Thinkora)

**The Extra Door, Part 1**

**Video:** `productions/extra-door/final/Short-extra-door.mp4`
- 1080 × 1920, 30 fps, 56.0 s, 23.3 MB.
- MD5 `cc8f73e512fadfd469a9ef372140606d`.
- Upload this file only, never anything from `preview/`.

**Nothing has been uploaded or published.** This folder is the copy and the covers, ready to paste.

---

## Cover
**Files** (`productions/extra-door/publish/`). The three covers are the same design on purpose. It clears all three
apps' overlays and Instagram's 3:4 grid crop, so one image works everywhere.
- **`cover-youtube-shorts.jpg`:** 1080 × 1920.
- **`cover-tiktok.jpg`:** 1080 × 1920.
- **`cover-instagram-reels.jpg`:** 1080 × 1920.
- **`cover-safe-area-check.jpg`** shows:
  - the cover with each app's approximate overlay zones;
  - the 3:4 profile-grid crop;
  - 180 px and 120 px previews.
- **`source/frame-1462-0m48.73s.jpg`:** the untouched film frame the cover is built from.
- **`make_covers.py` and `check_covers.py`** rebuild the cover and the check sheet.

**What it is:** frame 1462 (0:48.73) of the finished video, from shot 19:
- **Milo:** facing the lens, wide-eyed, teeth clenched, with a sweat drop.
- **The old door:** the dark one behind him on the left, with the clean patch of wallpaper and the nail above it.
- **An ordinary door:** the cream-white one right beside him, for contrast.

**What was added:**
1. **Light.** A soft vignette centred between Milo's face and the old door. The edges fall off into slightly cold
   shadow; the lit centre keeps the video's own colours.
2. **Text.** "THE 8TH / DOOR?" in the Thinkora caption font (Nunito Black, white with the plum outline the
   characters use).

Nothing was painted in or invented. Nothing behind the door is shown.

**Checks:**
- **Matches the video.** The source still is the engine's render of that exact film frame, and it matches the MP4
  frame (41 dB PSNR).
- **Inside the safe areas:**
  - the text sits at y 250–544;
  - the face sits at about y 760–1480, between the top bars and the caption area on all three apps;
  - both are inside the 3:4 grid crop.
- **Overlap with the right-hand buttons.** Only the edge of the white door and the tip of the sweat drop fall under the
  buttons, and only when the cover is shown inside the player.
- **Readable at phone size.** The title is 127 px and 161 px tall: about 12–15 px on a 180 px search or grid tile,
  and it still reads at 120 px.

**How to set it on each platform:**
- **YouTube Shorts.** Custom Shorts thumbnails are rolling out to Partner Program channels in YouTube Studio on desktop.
  - If the Short's Details page shows an upload button, use `cover-youtube-shorts.jpg`.
  - If it only offers frames, choose **0:48.7**. Anywhere in 0:48.2–0:49.0 gives the same face; it won't have the
    title text.
- **TikTok.** In "Edit cover", add `cover-tiktok.jpg` from your photos if the option is there. Otherwise pick the
  frame at **0:48.7**.
- **Instagram Reels.** Under "Edit cover", choose "Add from camera roll" and pick `cover-instagram-reels.jpg`. Check
  the 3:4 grid preview: the title and face should both be inside it.

---

## YouTube Shorts
**Title:**
```
His Hallway Has 7 Doors. Tonight There Are 8. | The Extra Door, Part 1
```

**Description:**
```
Milo's hallway has always had seven doors. Tonight, there are eight.

And whatever is behind the extra door sounds exactly like someone he knows.

Milo doesn't know what to do, so he's leaving it to you:
🅰️ OPEN THE DOOR
🅱️ RUN DOWNSTAIRS

Comment A or B. Part 2 follows whichever choice gets the most votes, so your comment really does count.

The Extra Door is an interactive story from Thinkora. Every part ends on a choice, and you decide what happens next.

#Shorts #HorrorStory #Thinkora #InteractiveStory #AnimatedStory #TheExtraDoor
```
YouTube shows the first three hashtags above the title: #Shorts #HorrorStory #Thinkora.

---

## TikTok
**Title** (if your post screen has a title field; otherwise it is already the caption's first line):
```
The 8th door wasn't there yesterday 🚪
```

**Caption:**
```
The 8th door wasn't there yesterday 🚪 Milo's hallway has always had seven doors, and whatever is behind the new one sounds exactly like someone he knows. Part 1 of The Extra Door. Now it's your call: A to open the door, B to run downstairs. Whatever gets the most votes is what Milo does in Part 2 👇

#horrorstory #scarystories #mystery #animation #interactivestory #youdecide #thinkora #theextradoor
```

---

## Instagram Reels
**Title** (the first line of the caption; Reels have no separate title field):
```
Seven doors. Always seven. Tonight there are eight. 🚪
```

**Caption:**
```
Seven doors. Always seven. Tonight there are eight. 🚪

Milo's hallway has never changed. Until now. Whatever is behind the extra door sounds exactly like someone he knows.

He can't decide, so you will:
A: OPEN THE DOOR
B: RUN DOWNSTAIRS

Comment A or B 👇 The choice with the most votes decides Part 2. Follow so you see what your vote did.

The Extra Door, Part 1. A Thinkora interactive story.

#horrorstory #mystery #animatedstory #interactivestory #thinkora
```
Recent reporting says Instagram now allows at most 5 hashtags per post or Reel, so this set is exactly 5.

---

## Hashtags
| Platform | Hashtags |
|---|---|
| YouTube | `#Shorts #HorrorStory #Thinkora #InteractiveStory #AnimatedStory #TheExtraDoor` |
| TikTok | `#horrorstory #scarystories #mystery #animation #interactivestory #youdecide #thinkora #theextradoor` |
| Instagram | `#horrorstory #mystery #animatedstory #interactivestory #thinkora` |

`#TheExtraDoor` is the series tag. Use it again on Part 2 so the two parts find each other. There are no broad trend
tags (#fyp, #viral): they bring viewers who aren't looking for a story.

---

## Pinned comment (same on all three platforms)
```
Your call 🚪 Reply with just one letter:
A = open the door
B = run downstairs
Most votes decides Part 2.
```

---

## Before you post
1. **Captions are burned in.** Don't turn on the apps' auto-captions, or the text will double.
2. **Use the same letters everywhere.** Count A and B in the comments on all three platforms for Part 2. If you post a
   running tally, give both sides so neither looks like it is winning early.
3. **AI disclosure.** The voices are synthetic (ElevenLabs).
   - On YouTube, the altered-content label is for realistic footage, so "No" is reasonable for this cartoon.
   - On TikTok and Instagram, the AI-generated label is the transparent choice.
4. **Music** is original (synthesised in-house), so no copyright claim is expected.
5. **Pin the comment after the video is live.** YouTube doesn't allow pinning on a scheduled video.
