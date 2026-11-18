# The Empty Seat: final render QA

**Verdict: publishable.**
- Every hard technical check passes.
- The QA flags were verified as intended content, not render defects.
- The MP4 is not in this folder. The QA workflow commits it only when every check passes, and this session's network
  policy blocks downloading the artifact.

**Render:** cloud run 32 ([44289957204](https://github.com/deslmao/claude-animated-shorts/actions/runs/44289957204)).
- 1080x1920, 30 fps, 20 chunks, from commit `5fe7e1d` (the owner-approved v3b preview plus the clean take of Mr Hale's
  count).
- Artifact **`Short-empty-seat-run32`** (MP4 37.3 MB). GitHub keeps it until 18 Dec 2026.
- No GitHub Release, and nothing uploaded anywhere.

**Getting the MP4:** open the run link above, scroll to **Artifacts**, and download `Short-empty-seat-run32`. It's a zip
holding `Short-empty-seat.mp4`.

## Technical checks
| Check | Result |
|---|---|
| Codec / resolution / frame rate | H.264, 1080x1920, 30 fps ✅ |
| Frame count | 4,636 frames = **154.533 s** ✅ |
| Audio/video sync | audio 154.533 s vs picture 154.533 s; audio starts at 0 ✅ |
| Loudness | **-14.1 LUFS**, true peak -1.6 dBFS ✅ |
| Black spans; corrupt frames; holds at a cut | none ✅ |
| Duplicated frames | ❌ flagged: 724, 965, 2293, 2888, 3092, 3676. **Intended (below).** None is within 25 frames of a chunk join. |
| Near-blank frames | ❌ flagged: 100–127, 966–1260, 3143–3354, 3945–3988. **Intended (below).** |
| Soft frame | ❌ flagged: 4183. **Intended (below).** |

## The flags, checked (local re-renders match the final file; see `qa-flagged-frames.jpg`)
**Repeated frames.** Each is a still moment inside a shot:
- **724:** the end of Noah's walk up the aisle;
- **965:** the end of Mr Hale's "That's Emily's";
- **2293:** Mr Hale holding still as a slow 11 s push-in starts (a 0.41 difference to the frame before);
- **2888:** the start of the locked close-up of the new driver;
- **3092:** the held "stop flashing past" card;
- **3676:** the locked shoulder-tap close-up.

**Near-blank frames.** Pale, flat-coloured cards and the white flash transitions:
- **100–127:** the cold-open handprint card, and the white flash into the time card;
- **966–1260:** the fogged June window card;
- **3143–3354:** the handprint card;
- **3945–3988:** the bright June window as seat 13's fog returns.

**The soft frame (4183):** the dip to black after the heart monitor flatlines, fading into the final morning (a 0.87
difference to the frame before, then 44.8 as the picture fades up).
