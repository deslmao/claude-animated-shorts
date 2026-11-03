# Narration, captions and lip-sync

## The channel voice
| | |
|---|---|
| Voice | **George - Warm, Captivating Storyteller** (ElevenLabs stock voice) |
| Voice ID | `JBFqnCBsd6RMkjVDRZzb` |
| Model | `eleven_multilingual_v2` |
| Settings | stability 0.50, similarity 0.75, style 0, speaker boost on, speed 1.10 |
| Output | MP3 44.1 kHz 128 kbps per line; `npm run sound` mixes the soundtrack (with music and effects) to 48 kHz stereo at −14 LUFS |

**Why George was chosen** from the seven auditions:
- ElevenLabs built it for storytelling.
- It sounds warm and trustworthy without being sleepy.
- In the auditions it paused briefly at every punctuation break (average 0.40 s, the tightest of the seven), so it phrases naturally without dead air.
- Its pitch movement (3.5 semitones) is lively but steady. That keeps it consistent from video to video instead of exaggerated.
- An off-screen storyteller suits the creator's format of a voice-over narrator with cartoon characters acting it out.

The presets live in `animation-studio/src/studio/voice/voices.ts`. Seven are defined: george (the default), brian, liam, chris, jessica, alice and matilda.

## How it works
```
storyboard "say" lines  ->  npm run voice -- <id>             (dry run: lists new lines and their cost)
                        ->  npm run voice -- <id> --generate  (creates ONLY new lines)
   voice/cache/<fingerprint>.mp3 + .json        one file pair per line, kept forever, never paid for twice
   src/studio/stories/voice/<id>.ts             word timings the engine uses
   then npm run sound -- <id>  ->  audio/Short-<id>.mp3: voice + music + ambience + effects, -14 LUFS (docs/SOUND.md)
                                                the render farm adds it automatically; npm run short does all of this
storyboard + word timings -> shot lengths, word-timed reactions, captions, lip-sync -> Short-<id> -> cloud render
```

- **Shot lengths:**
  - Lines are laid end to end, with the voice starting on frame 2.
  - Each shot lasts as long as its lines, plus a short hold: 0.2 s, or 0.45 s on the last shot.
  - A cut lands 2 frames before its first word.
- **Word anchors:** you can write `{ word: "catches" }` instead of `t` for beats, effects, kicks, nods and head shakes. The event then lands 2 frames before that word. `"yawn"` also matches "yawning", and `n: 2` picks the second time the word is said.
- **Lip-sync:**
  - Lines are voice-over by default (`who: "narrator"`), with no mouth moving.
  - If you give a line to a character, for example `{ who: "gus", text: "Hey!" }`, that character's mouth opens on each syllable of each word and closes between words, with talking hands.
- **Captions:**
  - Captions are on by default; turn them off with `captions: false`.
  - Each caption shows 1–3 words and swaps on the words.
  - The font is white Nunito Black with the plum outline, placed in the lower middle of the frame, clear of YouTube's buttons.
  - The font file is bundled in `public/fonts` under the OFL licence, so the cloud renders identical text.
- **Accurate timing:** ElevenLabs reports a timestamp for every letter. `npm run voice` then snaps each word's start and end to where the sound actually starts and stops, so captions and mouths follow the voice. On the demo, every word edge is within 2 frames of the sound.
- **Before generating:** lines that aren't generated yet get an estimated timing, so `npm run test:story` and previews work before any credits are spent.

## Changing the voice later
| To | Write |
|---|---|
| Change the channel voice everywhere | change `NARRATOR` in `voice/voices.ts` |
| Use another voice for one Short | `voice: "brian"` in that storyboard |
| Give a character their own voice | `voices: { gus: "bill" }` in the storyboard (add a "bill" preset first) |
| Use another voice for one line | `{ text: "...", voice: "alice" }` |
| Add a voice | a new entry in `VOICES` (name, voice ID, model, settings) |

- **What a change costs:** a line's audio is fingerprinted by its voice, model, settings and text. Changing any of these regenerates only the lines it affects. Run `npm run voice -- <id>` first to see the cost.
- **Cost:** about 1 credit per character on `eleven_multilingual_v2`. A 60-second Short is roughly 850 characters.

## Security
- The ElevenLabs key is stored only as the cloud environment's network secret.
- The network proxy adds it to requests going to `api.elevenlabs.io`, so it never enters code, files, logs or git.
- On a local machine, `scripts/voice.ts` uses an `ELEVENLABS_API_KEY` environment variable (`.env` is gitignored) instead.
- The cache files hold the text, the voice ID and the settings, and nothing secret.
