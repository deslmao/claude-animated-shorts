# Float Away: music plan (proposal, nothing generated)

## Direction
- **The reference is a broad feel, not a source.** Story-animation channels use playful, quirky instrumental beds
  for world-building and jokes, rhythmic movement for action, atmosphere for mystery, and piano with strings for
  heart. We take that general feel. No melody, track, sample or arrangement is borrowed from any creator.
- **Clearance.** Everything is **original music composed in code** by our existing generator (`sound/music.py`
  plus the synthesised instruments in `sound/instruments.py`). There are no samples, loops, stock tracks or
  licensed audio. We own it outright, so it is cleared for YouTube, TikTok and Instagram with no Content ID risk
  and nothing to credit.
- **Thinkora's own signature: the Pancake Theme.** A short, whistleable four-bar motif (marimba and whistle) that is
  introduced in the pancake war and changes with the story:
  - playful in the pancake war;
  - fragmented and minor during the decline;
  - a single music-box note at the reveal;
  - heroic in the livestream;
  - home again in the callback.

  A recurring theme can become a channel habit (each story gets its own).

## Instruments
- **Existing, reused:**
  - pluck (as pizzicato);
  - glockenspiel and music box;
  - vibes;
  - whistle;
  - pad;
  - brass;
  - snare, brush and cymbal;
  - timpani;
  - claps and hats;
  - sub drone.
- **Additions (new functions only; nothing existing changes):**
  - marimba;
  - a simple piano;
  - a warm string ensemble (slow bow, light vibrato);
  - low toms;
  - kick;
  - a noise riser.

  These are small synthesis functions of the same kind as the instruments added for Every Lie.

## The plan, section by section
Times follow the v3 storyboard. Each section is a storyboard music mood, crossfaded at the cuts; the system already
supports this. The new moods are additions; no existing mood changes.

| # | Moment | Time | Mood (new unless marked) | Instruments and feel | Transition and accents |
|---|---|---|---|---|---|
| 1 | Opening rule | 0.0–3.6 | **quirky**, 112 bpm, major | Pizzicato bass bouncing on 1 and 3, marimba melody, finger-snap claps on 2 and 4, a triangle sparkle. Light and curious. | It starts on the first word; a bonk-brass "wah" lands on the chair snap. |
| 2 | Movie star and politician | 3.6–10.4 | **quirky**, now full | Adds a snare backbeat and glockenspiel answers, so it's rhythmic and cheeky. | **Accents on each gag:** a descending trombone slide as the bench bends, a sinking tuba glide under the politician, a stop-time hit, then a rising "pop" glissando as he floats up on "Free pizza". |
| 3 | The bench man floats away | 10.4–13.6 | **quirky** thins to one held glockenspiel note | The band drops out under "you float away". | A held note and an airy rising whoosh: the first serious moment. |
| 4 | Gus and the pancake war | 13.6–21.4 | **pancake**, 104 bpm, major | **The Pancake Theme** on marimba and whistle, over pizzicato and brushes. Warm, bouncy, memorable. | The theme's first phrase lands on "Every Sunday"; a splat hit as the pancake sticks to the ceiling, a bonk as it falls on Milo. |
| 5 | Gus starts floating | 21.4–29.8 | **drift**, 76 bpm, minor and soft | Pad, sparse piano, the theme in minor on vibes, fragments only. Airy rising whooshes as he lifts. | The theme bends into minor on "Grandma died": no hard cut, it fades over one bar. |
| 6 | The video call | 29.8–35.2 | **drift**, with a playful hiccup | A quick pizzicato "oops" figure on "on the ceiling?", then back to drift. | When Milo hangs up, a single sad vibes note as Gus drifts back up (the clue). |
| 7 | The birthday and the stones | 35.2–40.4 | **hush** | A piano heartbeat (one low note, slow) with a sustained string note: subtle tension, very quiet under the dialogue. | Silence under "Don't tell your mother"; only the string holds. |
| 8 | The storm | 40.4–52.6 | **storm**, 132 bpm, minor, urgent | Low string ostinato in sixteenths, toms on the bangs, timpani rolls, a riser into each attempt (the ankle, the rope). | It escalates at each setback. On "kept rising" it strips back to the pulse alone. |
| 9 | The realisation | 52.6–56.6 | **storm** pulse fading | Just the pulse, decaying. | It fades out completely just before "I was the last one". |
| 10 | "I was the last one." | 56.6–61.6 | **rest** (existing): silence | Total silence under and after the line (rain only). | Then **one music-box note of the Pancake Theme**, held, as Milo sits on the kerb. |
| 11 | Milo stands up | 61.6–63.0 | **rise** begins | The theme's first phrase on a lone piano, slow. | His decision is shown by the music returning. |
| 12 | The livestream | 63.0–77.4 | **rise**, 120 bpm, major, building | **The layers enter on story beats:** piano ostinato first; claps when he shouts; *a stall at "3 viewers / fake"* (the music drops to the piano alone, a comedic deflation); on Juno's share a kick drum and strings enter; on 10,000 the brass plays the **Pancake Theme heroically**; on 80,000 the full build with a riser. | One ding per viewer jump. **Half a second of silence before Gus hits the road.** |
| 13 | Gus crashes down | 77.4–80.4 | **rest**, then the impact | A big boom, a cymbal swell and a final brass chord ringing out. | The strongest accent in the film: the musical payoff. |
| 14 | Cafe and kitchen callbacks | 80.4–84.4 | **pancake** (the theme returns, playful) | Marimba and whistle as in section 4: home again. | A bonk-brass "wah" on the chair snap (a callback to the opening). |
| 15 | The other grandpa | 84.4–89.2 | **warm** (existing mood, with the theme on piano and strings) | The gentlest version of the theme, piano and warm strings. | On "counter" a final soft button chord, then a **hard cut** to silence (the existing music drop-out feature). |

## Silence and restraint
- **Planned silences:**
  - before and after "I was the last one" (about 5 s);
  - half a second before the crash;
  - the comedic stall on "3 viewers / fake".
- **Under dialogue:** at most two or three layers, and the melody steps back under every spoken line. The soundtrack
  stage already mixes the music about 14 LU under the voice. I'd keep that, and keep the busiest sections (quirky,
  storm, rise) a further 2 dB down while someone speaks.

## Sound effects that work with the music
- **The world rule's two signature sounds:** `thunk` (attention lands: a heavy, low thud) and `float_whoosh`
  (attention leaves: a soft rising air sound). They always sound the same, every time the rule acts.
- **Existing sounds reused:**
  - crack and poof (chairs);
  - clink and clack (stones);
  - impact and thud;
  - pop and ding (comments, viewers);
  - gasp;
  - whooshes;
  - phone buzz;
  - the city, square and night ambiences.
- **New sounds** (as in the script's production notes): `storm_wind`, `ground_crack`, `metal_groan`, `splat`, and
  a short ringtone.

## Cost and how it's built (once approved)
- **New moods (additions only, built with the existing generator; no shared preset changes):**
  - `quirky`;
  - `pancake`;
  - `drift`;
  - `hush`;
  - `storm`;
  - `rise`.
- **Reused moods:** `rest` and `warm`; `warm` only gets the theme added through a new lead option, and its existing
  settings don't change.
- **New instruments:** six small functions.
- **The Pancake Theme:** written once as a fixed four-bar melody and reused by each mood.
- **Generation time and cost:** the music is synthesised locally in seconds, with no credits and nothing to
  license. The soundtrack builds automatically in the existing sound stage, after the storyboard.
