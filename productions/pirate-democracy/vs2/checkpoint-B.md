# Visual Storytelling 2.0: Checkpoint B (owners on land) and the Checkpoint A fixes

**Status:** preview clips only.
- Nothing has been rendered in the cloud, released or uploaded.
- The full Pirate Democracy video is **not** rendered.
- Tickle and every release are untouched.
- No narration was regenerated: the existing lines are split across shots, and the soundtrack was rebuilt by free
  synthesis.

**Watch (with sound):**

| File | What |
|---|---|
| `before-after-owners.mp4` | Shots 10-11: Stage C (Juno and two panels) on the left, 2.0 on the right |
| `before-after-shots02-03-B.mp4` | The signing and the shares: Checkpoint A on the left, now on the right |
| `B-shots09-13.mp4`, `B-shots02-03.mp4` | The 2.0 clips alone (half size) |
| `B-signing-fullres.mp4` | The signing close-up at **full resolution** (1080 × 1920) |

## Checkpoint B: the owners-on-land sequence (shots 10-11)
The two lines that were explained by Juno under two floating panels now happen in the world. They run across three
places, with a new picture on almost every phrase.

| Words | What you see | Camera |
|---|---|---|
| (from "Wait, pirates were fair?") | | whip pan |
| "You see, merchant ships" | A merchant deck with cargo crates; a stern master in navy with a cane; nervous sailors | the camera rises off the deck in one continuous flight |
| "had **owners on land**" | The old town square from high above; then the **shipowner** at his tall counting desk: spectacles, powdered wig, a purse, a heap of gold and his ledger | a **zoom-through** carries the camera off the ship and into the town, then a flight down to him, arriving on "land" |
| "and their **captains**" | The master, in exactly the owner's framing: the owner's power passes to the man on the ship | a **match cut** |
| "could **beat** sailors" | The cane comes up with a crack (impact sound, camera kick); no blow is shown | |
| "**sailors into line**" | The sailors flinch, then stand rigid in a row, scared | whip pan |
| "Pirates had no owners." | The pirate flag, close against the sails | whip pan from the merchant ship |
| "The crew was **the company**" | The whole crew raises its hands (with a crowd "aye!") | a flight down the mast to the crew round the deck table |
| "so they **wrote rules**" | Mags writes on the articles; the writing appears under her quill | an angled close-up of the page |
| "to stop **anyone** becoming a" | The captain lifts a jewelled crown above his head, grinning | |
| "**tyrant**." | The crew's arms fold; the captain lowers the crown, embarrassed, sweating | a close-up |

**Accuracy (from the research notes):**
- Merchant ships were owned by absentee investors on land.
- Their captains had legal authority to use corporal punishment.
- Pirate crews had no owners: the crew elected officers and wrote articles to limit the captain's power.

The crown is a visual metaphor for "tyrant", and no violence is shown.

## The Checkpoint A fixes
1. **The contract signing** (shot 2). In the old version, **Milo** signed on the scroll Mags was holding, so the
   quill seemed to write on her hand. Now **the captain** signs, as you asked:
   - The parchment (a new reusable `parchment` prop) **lies flat on a deck table**.
   - The captain lays down his cutlass and takes the quill.
   - The parchment **guides his hand**: the quill travels along the signature line as the signature is written stroke
     by stroke under the nib. Hand, quill and signature stay over the document throughout.
   - The angled close-up is tighter and centred between the hand and the writing.
   - Checked in motion and at full resolution (`B-signing-fullres.mp4`).
2. **The gold coins** have real depth:
   - a lathe-turned coin with a raised rim, a sunk face and a bevelled edge;
   - metallic Phong shading with a warm highlight, in the house two-tone style;
   - three slightly different golds;
   - a hand-stacked look: every coin sits a few millimetres off true, the same in every frame.
3. **Close-ups stay readable.** Motion blur now depends on the camera beat:
   - full on flights, whips and zoom-throughs;
   - 15 % on faces (close-ups, face inserts, POV);
   - 30 % on object inserts;
   - 60 % on framed glides.
4. **Two shares to one** (shot 3):
   - On "sailor's" the camera pulls up and back to an **overhead of the whole table**.
   - Two stacks stand side by side at the captain's end (his red coat at the top of the frame); one stack is at
     Milo's end.
   - Every stack is separate, and the shot holds 0.9 s so it reads on a phone without the narration.
   - The coins now clink on each step.
5. **The direction you approved** carries on: continuous flights, purposeful cuts and close-ups, object-focused
   explanation, whips, pull-backs and travel between places. The two floating panels in shots 10-11 are gone.

## Reusable capabilities added
- **Characters:** the **shipowner** and the **merchant captain**.
- **Items:** a **cane** (with a crook handle, so it never reads as a blade) and a **crown**.
- **Props:**
  - a period **counting desk**;
  - the **parchment** (signatures stepped on words, the writer's pen guided along them);
  - the bare deck table from Checkpoint A.
  - None of the existing protected assets changed; the library snapshot only gained these.
- **Props on tables:** a prop's height on a table is now part of reaches, captions and validation.
- **Stepped props can play their own sound:** the loot clinks, for example.
- **Writers:** a short writer at a high table can lift the hand to the page (Mags is petite).
- **Crowds** are placed for the first framing that shows people, not for an opening aerial.

## Validation: stricter, never weaker
**New checks** (each proven by a new negative test):
- a pen **in the air** (more than 8 cm above its page);
- a pen **hidden under the page** (more than 4 cm below);
- writing **more than 6 cm off** the line being written (handovers keep their 22 cm).

**Corrections that made two checks more accurate:**
- A reach is now measured along the character's card, which turns to face the camera position, as the director draws
  it. Before, it used the camera's right axis, which is wrong for characters far off-centre.
- Only the frames a whip or zoom-through spends rushing in or out are exempt from the framing checks. The frames you
  actually watch are still checked.

All storyboards validate, and all negative tests are caught, the 2 new ones included.

## Tests, determinism, regression, cost
- **`npm test`:** passes. This covers lint, typecheck, framing, every storyboard plus all negative tests, library
  protection and z-fighting.
- **`npm run test:sound`:** passes.
- **`npm run test:regression`:** **9 / 9 reference frames identical, BridgeShort included.**
- **Determinism:** I rendered lossless PNGs with 1 worker and with 4. **All 24 test frames are bit-identical**,
  covering the signing (parchment canvas and guided pen), the loot steps (metal coins) and the whip plus impact kick.
- **The soundtrack** was rebuilt by free synthesis: -14.1 LUFS, true peak -1.8 dBFS, 37 cues.
  - New cues: the whips, the zoom-through, the impact on "beat", coins on each loot step, the crowd "aye!" on
    "company", and both quills.
- **Render cost** on this cloud CPU, measured per clip, each rendered on its own:

  | Clip | Size | s / frame | Peak memory |
  |---|---|---|---|
  | Shots 2-3 | half | about 1.8-2.5 | about 3.5 GB |
  | Shots 9-13 (owners on land) | half | 2.07 | 6.0 GB |
  | Signing close-up | full 1080 × 1920 | 6.97 | 4.3 GB |

  - The owners sequence costs more memory than earlier scenes: three sets in one stretch, two new characters and a
    six-strong crowd.
  - Before the full render I'll check memory per cloud chunk.
  - One run showed 11.8 GB. That was my mistake: two copies of the render job ran at once. I found it, stopped the
    stray copy and re-rendered alone. The numbers above are the solo runs.
- **Preserved:**
  - Tickle's storyboard and approved video, runs #11-#13 and every release;
  - all protected assets: the snapshot only gained the six new ones;
  - BridgeShort;
  - the existing narration (no paid regeneration).

## Honest assessment: what isn't right yet
1. **Mags's writing fist** is partly hidden behind her ponytail in the rules close-up. You see her quill writing
   and the rule appearing, but not her hand.
2. **The crew's raised hands are thin at phone size** in "the crew was the company". The vote reads, but not
   strongly. (This is the same limitation of the dot hands noted in Stage C.)
3. **The merchant ship is the same deck model as the pirate ship.** The cargo crates, the navy-coated master and the
   different crew distinguish it, but a viewer might not register "another ship".
4. **The cane on "beat"** only lifts a little. The crack sound and camera kick carry the moment more than the gesture
   does. It is deliberately not a blow, but a clearer raise would help.
5. **The merchant-deck opening** has deck posts in the foreground for about 0.4 s before the camera rises.
6. **In the signing close-up** the caption sits over the lower half of the page. It never covers the signature, but
   the page fills most of the frame.
7. **Not yet built from the 2.0 slice:**
   - Checkpoint C: the treasure chest outline fix, with full-resolution before / after;
   - in-world labels;
   - engine support for match cuts (this one is authored by hand);
   - the variety / rhythm checks;
   - the full Pirate 2.0 storyboard with an honest 100-point score (Checkpoint D).
8. **The full video is not rendered.** These are preview clips of shots 2-3 and 9-13 only.

**Next, if you approve:** Checkpoint C (the chest outline and thin-detail flicker, measured before and after at full
resolution). Then the rest of the storyboard in the 2.0 style for Checkpoint D.
