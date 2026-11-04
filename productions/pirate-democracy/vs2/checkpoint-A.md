# Visual Storytelling 2.0: Checkpoint A (camera foundation) and an early look at B

**Status:** preview clips only, at half size with the existing soundtrack.
- Nothing has been rendered in the cloud, released or uploaded.
- The Pirate Democracy video is **not** fully rendered.
- Tickle is untouched.

**Watch:**
- `before-after-shots02-03.mp4`: Stage C on the left, 2.0 on the right, 10.6 s, with sound.
- `shots02-03-after.mp4`: the 2.0 version alone.

## What you're looking at
### Shot 2: "Picture a pirate crew in the early 1700s. Before anyone touches a sword, they sign a contract."
| Before (Stage C) | After (2.0) |
|---|---|
| One medium two-shot of Milo and Mags for the whole 5.8 s line | Five camera set-ups on the words |

The five set-ups after:

| Words | What the camera does |
|---|---|
| "Picture a pirate crew" | Opens high over the stern: the ship under sail, the sea, the crew on deck. One continuous flight down to the crew (motion-blurred while fast) |
| "1700s" | Arrives on Milo and Mags |
| "Before anyone touches a sword" | Cuts to Milo's hand on his cutlass |
| "they sign" | An extreme close-up of the quill on the articles |
| "contract" | Mags's satisfied face |

### Shot 3: "It says how the loot is shared, and the captain gets at most two shares to a sailor's one." (early Checkpoint B)
| Before (Stage C) | After (2.0) |
|---|---|
| Mags under a `shares` panel | The explanation happens **in the world**, on a table on deck |

The sequence after:

| Words | What happens |
|---|---|
| "It says how the loot" | Top-down on a heap of gold |
| "shared" | The heap streams into three equal stacks |
| "captain" | The camera glides across the table: the captain behind the stacks, as two stacks slide to him on "two"; he cheers |
| "sailor's" | A whip pan to the reverse: one stack slides to Milo, who gives a thumbs-up |

## What the reference changed
The screen recording ("Why Perfect Railroads Don't Work", analysed in `docs/proposals/vs2-reference-notes.md`) showed
that the camera there is almost always travelling.
- In 12.5 s it has only one hard cut.
- New information comes from flights, reveals and dives through the world, not from cutting.

So, alongside the cut-in beats, I added:
- **continuous flights;**
- **camera motion blur;**
- **in-world explanation.**

## Reusable capabilities added (any storyboard)
- **Camera beats** (`cams`): new framings on words inside one shot.
  - Arrival styles: a cut, `glide`, `whip`, `rack` (focus only) or `fly`.
  - `fly` is a continuous flight through several framings, arriving at each on its word. It's a time-aware Hermite path,
    so it never stops at a waypoint.
- **New framings:**
  - `insert` on a prop, a face, a held item, or the hands at a reach target, read from the rig's real hand pose at
    that word;
  - `pov` from an actor's eyes;
  - `at`, an authored aerial or waypoint.
- **Transitions:**
  - `zoom` (rush into the subject, settle out of the next) and `whip`, both with automatic whoosh sounds;
  - split shots (`until` / `cont`), so one sentence can run across shots and sets.
- **Camera motion blur** (`motionBlur: true`, opt-in):
  - deterministic and computed from the camera only;
  - fast moves smear along their motion;
  - frames that move less than 2 px skip the pass completely.
- **Stepped props** (`steps: [{ word }]`): a rigged prop plays its steps on words. The first kit is **`lootPiles`**
  (variant `"2-1"`, or any split), on the new **`deckBoard`**.
- **Captions and validation:**
  - captions are placed per camera beat (off the face a close-up brings in, and clear of an insert's detail);
  - the validator checks framing per beat, from when a glide arrives;
  - stepped props, parameter variants and insert parts are validated;
  - 4 new negative tests prove the checks catch mistakes.

## Checks
- **`npm test`:** passes. This covers lint, typecheck, framing, every storyboard plus the negative tests, library
  protection and z-fighting.
  - The existing `deckTable` was **not** modified; the cleared table is a new asset.
  - The library snapshot only gains `lootPiles` and `deckBoard`.
- **`npm run test:regression`:** 9 / 9 reference frames identical, BridgeShort included.
- **Rendering cost of motion blur**, measured. Full-resolution sequence renders, 30 frames each, on this cloud CPU
  (software GL, 4 workers), with blur on vs off:

  | Frames | Blur off | Blur on | Change | Memory |
  |---|---|---|---|---|
  | Moving: the flight, frames 138-167 | 4.49 s / frame | 5.09 s / frame | **+13 %** on these frames | 3.59 → 3.61 GB |
  | Held: the cutlass insert, frames 240-269 | 8.13 s / frame | 7.98 s / frame | **0 %** (noise); pixels **identical** to blur off | 4.14 → 4.13 GB |

  - Why held frames are free: my first version charged about +9 % on every frame. So the pass now switches itself off
    whenever the camera moves less than 2 px during the shutter. That covers holds and slow creeps, which stay
    bit-identical to blur off.
  - Effect on a whole film: the cost is only on fast-move frames. If 10-15 % of a 2.0 storyboard is fast flights and
    whips, the total is about +1.5-2 %.
- **Determinism.** I checked 1 render worker against 4, frame by frame, on lossless PNGs.
  - **The blur is deterministic.**
  - The check found an **older** seam risk in the character cards. Chrome can switch a reused canvas between GPU and
    CPU drawing depending on its history, so on a fast flight (where cards change size tier) a few hundred pixels on a
    character could differ by worker.
  - Fixed with CPU-drawn card canvases. All 12 test frames are then identical.
  - The fix changes storyboard pixels very slightly (PSNR 45-47 dB, invisible). So it is **opt-in through
    `engine: 2`**, which Pirate 2.0 uses. Every existing storyboard, Tickle included, renders exactly as approved, and
    the regression stays 9 / 9 identical.
  - **Recommendation:** use `engine: 2` for all new productions.

## Honest assessment (what isn't right yet)
1. **Two against one is harder to count than on the panel.**
   - The across-the-table angle makes the stacks overlap.
   - Fix: on "one", an overhead pull-out that shows two stacks by the captain and one by Milo.
2. **The heap reads as bright flat yellow discs.** It's fine at phone size, but the coins want more shading and a rim
   line (part of P4's outline work).
3. **After the flight lands, the wide holds still for about 1 s** ("1700s"). The reference would keep drifting.
4. **The signing close-up** reads as a quill on paper, not obviously a signature. Milo's hand covers the writing.
5. **Not done yet in the slice:**
   - match cuts;
   - in-world labels;
   - the immersive owners-on-land sequence (shots 10-11, the main Checkpoint B piece);
   - the chest outline fix with full-resolution before / after (Checkpoint C);
   - the variety / rhythm checks;
   - the full Pirate 2.0 storyboard with an honest score (Checkpoint D).
