# Critic score table: GTA 6, Explained to Your Girlfriend · Ep 1

An independent critic agent scores 20 full-resolution frames per round against Rick's clips study frames (a private
reference). The goal is 8 or more in every category, capped at 5 rounds.

| Round | Characters | Motion | Light | World | Camera | Captions | Hard fails | Fixed in the next round |
|---|---|---|---|---|---|---|---|---|
| 1 | 4 | 3 | 4 | 4 | 4 | 5 | 14 / 20 | motion first (camera pushes, gestures), then the hard fails |
| 2 | 5 | 4 | 4 | 5 | 5 | 6 | 9 / 20 | light and motion: a real TV light with a rim and a warm lamp, ground shadows in the game, the controller held, varied sofa angles, inserts clear of the captions |
| 3 | 5 | 4 | 5 | 5 | 6 | 7 | 5 / 20 | motion: acting beats in every hold, the camera tracks the walk; a stronger TV light; the 5 failing frames |
| 4 | 5 | 4 | 5 | 5 | 5 | 6 | 2 / 20 | the inserts become framed pictures on the lit wall; Lucy holds her phone; the Gordon close-up becomes a two-shot; acting beats in the game shots |
| 5 | 5 | 4 | 5 | 5 | 5 | 6 | 4 / 20 | (cap reached: the loop stops) |

## Where it stands after 5 rounds
The hard fails went from 14 to 4. The categories rose from 3-5 to 4-6, then plateaued at about 5 from round 3. What keeps
them under 8 isn't something one more round of storyboard fixes can change:
- **Motion and characters (4-5):** our 2D cast rig has a fixed set of gestures. It can't grip a controller with both
  hands, lean in, or act with the whole body the way the reference's animation does, and held items sit beside the
  hands. Closing this needs engine work on the character rig: real two-handed holds, lean and turn poses, and in-between
  acting.
- **World (5):** the game plates are strong (the critics put them near 7). But the flat and the bedroom are sparse
  stock sets, the plate cars are untextured blocks, and the sea is a flat plane. Closing this means richer interiors,
  better Blender car and sea materials, and moving plates (render sequences, not stills).
- **Light (5):** a frame-wide grade now tints the cast and set together. But the cast are unlit cards, so there's no
  real key, rim or shadow on them. Closing this needs lit character cards in the engine.
- **Camera and captions (5-6):** these can be improved within the current tools. They're the cheapest next step.

