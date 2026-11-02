# WHY YOU CAN'T TICKLE YOURSELF: script + storyboard v1 (for approval)

Format: 1080x1920, 30 fps, about 60 s, vertical. Presenter: the pink brain (first person, dry and cheeky).
Target narration pace: about 3.7 words per second. Voice: ElevenLabs (the user supplies the audio).

## Verified facts (and how far they can be pushed)
1. Self-produced touch is rated less "tickly", less intense and less pleasant than the same touch applied by someone else or a robot.
   Source: Blakemore, Wolpert and Frith, Nature Neuroscience 1998 (paper text read; Princeton-hosted PDF).
2. fMRI: the right anterior cerebellum was deactivated when your own movement produced the touch, but not by movement alone.
   Source: same 1998 paper. Caveat: only 6 volunteers, so say "brain scans suggest", never "proved".
3. The secondary somatosensory cortex (touch processing) was less active for self-touch than for external touch.
   Source: same 1998 paper. The anterior cingulate was also more active for external touch.
4. The authors' conclusion: the cerebellum predicts the sensory consequences of movement, and this prediction cancels the touch response.
   Source: same 1998 paper. Also summarised in Scientific American, "Why can't a person tickle himself?"
5. Robot experiments: as a delay between your hand movement and the touch grows from 0 to 200 ms, the touch feels more tickly.
   Source: described in the 1998 paper as earlier work. Check the original (Blakemore, Frith and Wolpert, 1999) before relying on exact numbers.
6. Not verified, so NOT used: any claim that the effect is total, that nobody can ever tickle themselves, or specific percentages.
   The honest wording is "much weaker", not "impossible".

Term used in the video: "a copy of the movement command" (the textbook name is efference copy; keep the jargon out of narration).

## Scenes

| # | Time | Narration | Visuals |
|---|------|-----------|---------|
| 1 Hook | 0-6 s | "A friend can make you shriek with laughter in seconds. But you? You can't tickle yourself. Not even a little." | Cold open on a person wiggling fingers at their own ribs. Zero reaction, flat stare. Camera slow push-in. Quick cut to the brain popping into frame. |
| 2 Meet the brain | 6-13 s | "I'm your brain, and I never stop predicting what happens next. Every step, every blink, every sip of water. Especially when it's you doing the moving." | Brain presenter bounces in on a glowing stage inside a cutaway of a head. Eyes track the camera, one confident gesture. |
| 3 The command | 13-23 s | "The moment you decide to wiggle your fingers, I send a copy of that order to a little helper at the back of my head: the cerebellum." | Signal pulse travels from the brain's motor area down to the arm and also back to a highlighted cerebellum. Camera follows the pulse. |
| 4 The prediction | 23-33 s | "The cerebellum works out exactly what that touch will feel like, and tells the rest of me to turn the volume down. By the time your fingers land, the surprise is already gone. Nothing to react to, nothing to laugh at." | Cerebellum thumbs a mixing desk; the "touch" slider drops. Floating ghost-hand shows the predicted touch landing and fizzling out. |
| 5 Someone else | 33-44 s | "But when someone else tickles you, I never get that copy. They decide when, where and how. The touch comes out of nowhere, I can't predict it, and my alarm goes off." | Second character sneaks in with a feather. Hit lands, the first person explodes laughing. Brain panics, alarm light flashes. |
| 6 The evidence | 44-53 s | "Scientists scanned volunteers' brains, and it backs this up. Your own touch fires up the touch areas far less than someone else's. And if a robot copies your hand a split second late, my prediction misses, and it feels ticklish again." | Split-screen glow comparison of two brain maps. Robot arm with a small delay bar slides from 0 up to 200 ms; the person starts to smile. |
| 7 Payoff | 53-61 s | "So the one person you can't really tickle is yourself. Sorry. I spoil every surprise, even the ones you plan. It's not personal. It's just my job." | Person tries once more, nothing. Brain shrugs. Friend pokes the brain with the feather; the brain squeals. "Rude." Hard cut to end card. |

Word count check: the narration lines total about 215 words, roughly 58 s at 3.7 words per second. If the ElevenLabs read comes out longer than 62 s, trim scene 6 first; if shorter than 55 s, let the end-card gag breathe.

## On-screen text (captions burned in, safe area 150 px sides, 250 px bottom for Shorts UI)
- Word-by-word captions in the lower third, timed from the audio.
- Scene 1: "Self-tickle: 0/10". Scene 4: a "TOUCH" volume slider. Scene 6: "Delay: 0 ms -> 200 ms". Scene 7: "Rude."

## Sound
- Music: light, bouncy, playful loop, ducked under the voice.
- SFX: finger-wiggle whoosh, signal blips, mixing-desk click, alarm buzz, feather swish, giggle burst, brain squeak, record-scratch before the final line.

## Transitions
Hard cut on the hook, whip-pan into the brain, camera follows the signal into scene 3, glow-wipe into 4, snap-zoom into 5, split-wipe into 6, hard cut to end card.

## Characters (true 3D, consistent in every scene)
- Brain presenter: your existing pink brain (waiting on `src/Brain.tsx` and `src/BrainScene.tsx`). Needs: blinking, eye tracking, 5 expressions (smug, shocked, proud, squealing, deadpan), two arm gestures, bounce idle.
- Person A (the self-tickler) and Person B (the feather friend): one shared stylised body rig, different colours and faces, so the cast stays consistent and cheap to animate.
