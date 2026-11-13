# Experiment: first-person storytelling (Wet Paint)

**Status:** an experiment, not a supported format yet. Its productions are `productions/exp-wet-paint-third/` (A) and
`productions/exp-wet-paint-first/` (B), and the blind comparison is in `wet-paint-comparison.md`.

## What the system already supports (inspected before designing)
| Need | Today | Gap |
|---|---|---|
| a point of view from the protagonist's eyes | `camera: { move: "pov", from, at }`, with a light hand-held bob | the viewer's own body is never in frame: the lens sits just in front of it |
| hands doing things | `insert` on `<actor>.hands` or a held item | the hands are seen from outside, as a separate cut, not in the POV frame |
| phone and camera screens | stepped screen props (`phoneScreen`, Night Shift and Extra Door) | none |
| people speaking into the lens | `facing: "camera"`; a POV aimed at the speaker | none |
| head turns | camera beats with `glide` between POV targets | none |
| a wide lens | an authored `at` camera takes `fov` | the POV lens is fixed at 50°; there's no lens curvature |
| time and place stamps | none (captions show spoken words only) | a text overlay |
| reflections (a mirror, a dark screen) | none | a reflective prop |
| narration in the protagonist's voice | the header's `voice:` sets the narrator, so "I" narration is just the narrator in her voice | none |
| a first-person "format" | the format list allows `other:<name>` | it isn't a format at all: see the recommendation |

**The owner's reference (a screen recording of a classroom POV Short)** was studied as technique only, and is not in the repository. It uses:
- forearms and hands holding a pencil over an exam paper, inside the POV frame;
- a wide, slightly curved lens;
- a time-and-place stamp ("TUESDAY · 10:42 AM / Room 214, Biology final");
- a head turn to a classmate who reacts straight into the lens;
- an off-screen sound as the inciting clue;
- two quiet plants: a LOCKDOWN poster readable at the edge of the wide frame, and the narrator's name on the exam paper.

## Proposed first-person principles
1. **Perspective is a property, not a format.** Any format (mystery, immersive, emotional…) can be told in first person. Declare it with `perspective: first | third` in the header.
2. **The embodied POV is the anchor shot.** A wide lens at eye height, with my forearms and hands in the lower frame holding the thing that matters. The body is what makes the frame "me".
3. **My hands do the investigating.** Every discovery is something my hands do: touch the paint, zoom the camera, fan the sheets, scroll the phone. That keeps it active and readable with the sound off.
4. **Plant in the periphery.** A wide POV frame can hold a clue at its edge, readable but never pointed at (the reference's poster). That's fair without being a giveaway.
5. **Limited access, honestly.** Show nothing I haven't seen. But a cause I can't see still has to be visible: a glance back, a sound, a reflection, or a deliberate external shot.
6. **The world addresses the lens.** Characters speak and look into the camera. Their faces become the viewer's mirror, and an accusation lands on the viewer.
7. **The inner voice interprets; it doesn't describe.** Short, present-tense reactions ("With my paint." "So did I."). Never narrate what my hands are already showing.
8. **The self is the blind spot.** First person is strongest when the reveal is about the narrator. The only ways to see "me" are reflections, my own photos and other people's eyes, so use them as the reveal device.
9. **Anchor time and place on screen.** Time stamps replace the narrator's scene-setting.
10. **Earn one look at myself.** Give one sight of my face (a reflection, a photo) before the climax, and allow one external shot for a scene's turn or for the final image (B's beat 14).
11. **Don't stay locked.** Inserts of screens, an over-the-shoulder for two people, and a wide establishing pan are all fine. First person is a point of view, not a camera rule.

## The test design
- **One locked spine.** The Premise, Spine (including the clue ledger, with each clue's beat and the reveal beat), Ending and Issue log are byte-identical in A and B. Both produce spine-packet `eeb4c07f`.
- **Phase 1:** one evaluation of the shared spine (verdict: revise, 2 fail and 4 weak), then one revision (issues I1–I9), applied identically to both.
- **Same structure:** the same 14 beats, events per beat and clue beats. A has 214 words (~73 s estimated) and B has 212 (~72 s).
- **Four evaluation calls:** phase 1 once, phase 2 once per version (blind: each saw only its own packet), and one comparison call (both packets, no preference stated). That's within the budget two separate stories would normally use (four to six).

## Results
| | A (third person) | B (first person) |
|---|---|---|
| blind phase 2 | ready: 0 fail, 1 weak criterion (clarity) | ready: 0 fail, 0 weak criteria, 3 weak stress tests |
| gate | READY | READY |
| blind ten-dimension total | 39 / 50 | 39 / 50 |
| blind profile | reveal 4, pacing 4, immersion 3 | immersion 5, reveal 3, pacing 3 |
| comparison total | 35 / 50 | 37 / 50 |
| comparison verdict | better on clarity, cause and effect, visual communication | better on participation, emotion, reveal, immersion, originality; "if only one: B" |

**The judges disagree on the reveal.** B's blind evaluator scored it 3, because the viewer holds the camera and may connect it to the painted one early. The comparison scored it 4, because the lens we've looked through belongs to the person who took the photo. Both readings are plausible, so neither score settles it.

**The fairness check found small advantages for B that have nothing to do with perspective:** on-screen day stamps, one extra detail and one slightly better line. The comparison judged that none of them changes the outcome. **B also lost something A kept:** the shot of Asha picking up her brush, which causes the fourth picture.

## Recommendation
**Support first person as an optional perspective, not as a default and not as a format.** Use it when the story's power is in discovering something about oneself, or in being addressed directly; Wet Paint is that kind of story. It isn't a general improvement: in this test it bought immersion and emotional impact at the cost of clarity, cause and effect, and reading with the sound off. Those losses come from storyboarding habits, and principles 5, 10 and 11 address them.

**Needed before production (each needs the owner's approval):**
- **Engine:**
  - an embodied POV rig: drawn forearms and hands anchored to the POV camera, holding the actor's item;
  - a `fov` option on `pov`;
  - a time-stamp overlay;
  - a reflective surface (a dark screen or window).
- **System (small):**
  - a `perspective:` header recognised by the parser, and shown in the packet;
  - these principles added to `docs/STORYTELLING.md`;
  - for first-person stories, tells that include "my" and "I" variants.

## Limitations
- One story and four judgements, all from the same model family. A real comparison needs rendered previews and human viewers.
- Nothing was rendered, so the hands-in-frame shots are designs the engine can't yet make. The fallback is a POV plus an insert cut.
- Neither version got a phase-2 revision, to keep them comparable. Both have the weak points their evaluators named.
