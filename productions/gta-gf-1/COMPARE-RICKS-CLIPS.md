# GTA GF Ep 1 vs Rick's clips (measured)

Our final (`final/Short-gta-gf-1.mp4`) was run through the same frame-by-frame script as STUDY.md (every frame at 30
fps), against the same 5 Rick's clips Shorts. Those videos are a private reference: no frames are committed. For our
"6 7" preview (STUDY.md §2) only some of these numbers were measured, so its column has gaps.

| Measure | Rick's (5 Shorts) | GTA GF Ep 1 | 6 7 (before) |
|---|---|---|---|
| Visual changes per video | 18–54 | 31 | — |
| Mean gap between changes | 1.1–3.1 s (1.97 overall) | **1.69 s** | — |
| Mix of changes | ~half cuts, plus dissolves and camera moves | 27 cuts, 3 dissolves, 1 move | — |
| Frames identical to the previous one | 0.3–1.7 % | **8.2 %** | 19.9 % |
| Frames where almost nothing moves | 1.5–5.2 % | **24 %** | 40 % |
| Frames with a clearly moving camera | 8–30 % | **1 %** | — |
| Background detail (edge density) | 0.072–0.138 | **0.102** | 0.057 |
| Average brightness (0–255) | 67–120 | 111 | 60 |
| Top brighter than bottom | +11 to +15 (4 of 5) | **−11** (bottom brighter) | — |
| Caption centre (share of height) | 0.70 | 0.64 | 0.64 |
| Caption text height | 0.025–0.030 | **0.019** | 0.027 |
| Frames with a caption | 100 % | 84 % | — |
| Narration pace | 3.3–3.9 words/s | **3.2 words/s** | — |
| Opening line | one 15-word paradox | two lines (an everyday situation, then the twist) | — |
| Structure | a "So/But/Then" chain; the question held to 60–70 %; no outro | a list of five reasons; a twist ending; a comment question at the end | — |

## Where we now match them
- **Pace:** a visual change every 1.7 s is inside their range.
- **Set detail:** the Blender Miami plates and the filled flat brought detail into their range, up from half of it on
  6 7.
- **Brightness:** inside their range.

## Where we're still behind (biggest first)
1. **The picture moves far less.** 24 % of our frames are nearly still, against their 1.5–5 %. Our camera visibly moves
   in 1 % of frames, against their 8–30 %. Their changes are often big eased camera flights between set-ups; ours are
   almost all hard cuts with small creeps. **Fix for Ep 2:** replace half the cuts with 12–20-frame camera flights (a
   push through the TV, an arc round the sofa, a fly along the street) and keep the camera moving through every insert.
2. **Character acting** (the critic's 4–5 out of 10): their characters animate on every frame, with real held props and
   body moves. Ours hold poses and change gesture on words. This is the engine rig's limit, and the next real engine
   job.
3. **Captions:** ours are smaller (1.9 % of the height against 2.5–3 %), sit higher (64 % against 70 %), and are missing
   during pauses (84 % against 100 %). Theirs are always on screen. **Fix:** bigger, lower captions (an opt-in caption
   setting).
4. **Light direction:** their frames are brighter at the top (sky, windows, ceiling lights); ours are brighter at the
   bottom (white phone screens, floors).
5. **Script:** slightly slower (3.2 against 3.3–3.9 words/s), and a list of reasons rather than a cause-and-effect
   chain with a question held back. **Fix for Ep 2:** the STUDY.md §7 recipe. Open with a 15-word paradox, join every
   fact with So / But / Then, ask the big question out loud at about 60 %, and narrate at about 3.6 words/s.
