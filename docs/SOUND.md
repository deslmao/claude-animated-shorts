# Music and sound design

Every Short gets a full soundtrack automatically: the narration, background music, ambience for each location, and
sound effects on what the picture does. It's all synthesized by the studio, so it costs nothing, needs no API, and
gives the same result every time.

```
npm run voice -- <id>     narration (ElevenLabs; dry run first, --generate after approval)
npm run sound -- <id>     music + ambience + effects + final mix  ->  audio/Short-<id>.mp3 (+ .json fingerprint, .cues.md)
npm run test:sound        every sound renders; catalogue names = implemented names
```

## What gets added, and why
| Layer | Source | Level (relative to the voice) |
|---|---|---|
| Voice | the generated narration, at its places | reference |
| Music | a mood preset, composed for this story (seeded, so stable), with a "button" chord on the last word | −10 LU, dipped another 3 dB under every word |
| Ambience | a bed per set and light, crossfaded at cuts | −20 LU |
| Effects | one cue per visual event, panned to where it happens on screen | per kind: impacts about −7, accents about −9, footsteps about −17 |
| Master | the whole mix | −14 LUFS integrated, true peak ≤ −1.5 dBFS, exactly the film's length |

These are the creator's mix standards: the music bed about 10 LU under the voice and ducked 3 dB on words. The style bible measures the reference beds at 5–10 dB under speech.

## Automatic cues (from the storyboard, no extra writing)
| The picture does | The sound |
|---|---|
| Crossfade / white flash / dip to black | soft swish / bright swish + shimmer / low whoosh, peaking on the cut |
| Punch-in close-up / crane move | quick whoosh / long swoop |
| Effect mark | question → blip, exclaim → pop, idea → ding, sweat → drip, anger → steam, zzz → snore, hearts / stars / sparkle → twinkle, puff → poof, burst → impact, confetti → party popper, splash → splash, ring → double ring, speed → whoosh (music notes are silent) |
| Camera kick | impact thump |
| A shocked beat without an exclaim mark | pop |
| Jump / fall | boing / thud |
| Walk or run | one footstep per stride, with the surface from the set (pavement, cobbles, floor, grass) |

Each cue is listed with its time and reason in `audio/Short-<id>.cues.md`.

## Music moods
- **curious**: the default explainer bed.
- **playful**: comedy.
- **mystery**: secrets, night.
- **warm**: tender facts, endings.
- **tense**: danger.
- **adventure**: history, journeys, pirates.

When a storyboard doesn't name one, the mood is chosen from what the characters do: comedy acts lead to playful, tension acts to mystery or tense (by light), tender acts to warm, and anything else to curious.

## Ambience beds
- **Automatic, by set:** city (day/night), old town square (day/night), nature (day/night), lab, office, room (home, classroom).
- **Requested by name:** sea (waves, wind, gulls).

## Storyboard controls
```ts
{ id, cast, shots,
  music: "adventure",              // or { mood: "warm", gain: -2 }, or false for no music; default: automatic
  autoSfx: true,                   // automatic effect / transition / footstep sounds (default on)
  shots: [{ ..., mood: "tense",    // music changes mood from this shot (crossfaded)
             ambience: "amb_sea",  // override the bed (false = none)
             sfx: [{ name: "cannon", word: "fired", on: "gus", gain: 2 }] }] }   // extra cues: time, word or on an actor
```
The available names are in `animation-studio/src/studio/sound/catalog.ts`, and the validator rejects unknown ones.

## How it's built
- **Library:** `animation-studio/sound/`. `dsp.py`, `instruments.py` and `sfx_gen.py` are verbatim copies of the creator's `templates/audio` kit; the templates themselves are untouched.
- **New modules:** `library.py` (effects and beds), `music.py` (moods and the composer), `build.py` (the mixer), `check.py` (the self-test).
- **The cue plan** comes from the compiled film (`src/studio/sound/cues.ts`), so cues follow word anchors, shot timing and camera positions.
- **The fingerprint file** ties the soundtrack to the storyboard and narration. If anything changes, `npm run preflight` (and the cloud render) refuses the stale soundtrack until `npm run sound` is re-run, which takes about 10 s.
- **Stems** for review are written to `out/sound/<id>/` (voice, music, ambience and sfx WAVs).
