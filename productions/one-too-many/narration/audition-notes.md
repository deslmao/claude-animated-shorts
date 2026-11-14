# One Too Many: narration audition

**Takes:** 8, 672 characters. Existing presets only, through the same request as `npm run voice`. No full narration
has been generated.

**Review file:** `audition-AB-lively-then-hushed.mp3` (51.6 s). Each line plays as georgeLively, then georgeHushed,
with a gap between, then Ms Okoye's two counts. The single takes are in `auditions/`.

## Measurements
Pitch variation and range are in semitones, measured on voiced frames. Pauses count silences of 0.25 s or more.

| Take | Pace | Pitch variation | Pitch range | Pauses |
|---|---|---|---|---|
| Hook, Lively | 3.1 w/s | 3.4 | 8.6 | 0 |
| Hook, Hushed | 3.1 w/s | 3.2 | 10.0 | 0 |
| Reveal, Lively | 3.4 w/s | 4.7 | 11.2 | 2 |
| Reveal, Hushed | 3.0 w/s | **5.5** | **16.1** | 2 |
| Ending, Lively | 2.9 w/s | 3.0 | 7.4 | 2 |
| Ending, Hushed | 2.8 w/s | **4.1** | **10.1** | 2 |
| Ms Okoye's count (Alice) | 2.4 s for three numbers | 4.8 | 15.9 | **0** |
| Ms Okoye's recount (Alice) | 2.2 s | 4.3 | 13.2 | 0 |
| *Float Away narration (Milo), 30 s* | about 3.3 w/s | 5.0 | 16.2 | 13 |
| *Extra Door narration* | | 5.8 | 18.6 | 17 |

## Comparison
- **georgeLively** is the faster, brighter read. The longer lines lose range: the ending flattens to 3.0 semitones of variation, against about 5 in our benchmarks. It suited Pirate Democracy's comic history; for a ghost story it risks sounding like an upbeat explainer.
- **georgeHushed** is slower and lower, with clearly wider pitch movement on the reveal and the ending (5.5 and 4.1). That's close to Float Away's and Extra Door's expressiveness, and it makes the 1979 story and "Ms Okoye didn't" land as weight, not information.
- **Both** read the hook in one breath with no pause. In the film that's handled by the storyboard's in-line pause after "High" (the same audio, cut at its natural gap), as in Extra Door.
- **Alice (Ms Okoye)** rushes the count: no pause between "thirty" and "thirty-one?", because the preset runs at speed 1.1. The hesitation that sells the moment isn't in the take.

## Recommendation
1. **Narrator: georgeHushed** (stability 0.6, speed 0.95), the channel's horror narrator from Extra Door. Keep the hook pause and the silent beats in the storyboard.
2. **Ms Okoye:** Alice's timbre fits (British, clear, a young teacher), but she needs a slower, less stable take for the counts. Add one preset, `aliceCount` (stability 0.4, style 0.2, speed 0.88), and re-audition just her two lines (about 70 characters) before the full generation.
3. **The head:** brian, as planned, unless you prefer a British head teacher. That can be auditioned in the same small batch.
