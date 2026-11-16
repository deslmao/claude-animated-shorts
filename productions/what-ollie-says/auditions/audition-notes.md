# Part 1 voice audition (17 Nov 2026): blocked by the ElevenLabs plan

**Result:** the planned audition couldn't run. The account is on ElevenLabs' **free tier** (0 of 10,000 characters used), and the free tier refuses:
- **shared-library voices through the API:** HTTP 402 "Free users cannot use library voices via the API", or 400 "creator tier or above";
- **Voice Design** (creating a voice from a description): HTTP 403 "only available on a paid plan".

No refused request was charged.

**Side effect:** asking for library voices bookmarked five of them in the account's voice library: Teddy Twinkle, Mini, Valf, Kasia and Agnieszka. They're free to keep or remove.

## Candidates found (usable on a paid plan)
| Role | Voice (library) | Why |
|---|---|---|
| Toddler (L1, L5) | Teddy Twinkle (little cartoon boy), Mini (small child), Leo (Spanish child; creator tier) | The only child timbres in the library. There are no Polish child voices. |
| Ollie, 6 (English) | Teddy Twinkle, Valf (very young, playful) | There are no British child voices in the library. |
| Kate | **Kasia** (warm, natural, native Polish), Agnieszka (early thirties), Paula (creator tier) | A native Polish voice gives natural Polish in the ritual and a real Polish accent in her English. |
| Any role | Voice Design (paid) | Describe the exact voice ("a three-year-old speaking Polish in his sleep"). Probably the best route for the toddler. |

## Free-tier fallback test (`free-tier-test.html`)
Built-in voices only: Jessica for the toddler, raw and pitched up by resampling (+4.5 and +7 semitones), and Lily for Kate's L2.

| Take | Median pitch | Speech-to-text round trip |
|---|---|---|
| Jessica L1, raw | 180 Hz (an adult woman) | `pol`, "Mamo, woda jest przy drzwiach" (exact) |
| Jessica L1, +4.5 st | about 232 Hz | exact |
| Jessica L1, +7 st | about 270 Hz | (not run) |
| Jessica L5, raw / +4.5 st | | `pol`, "Obiecałaś, że nie puścisz" (exact) |
| Lily L2 | 186 Hz | `pol`, "Kubuś, trzymaj mnie za rękę" (exact) |

- **The round trip works:** every Polish take came back as Polish, word for word.
- **What a measurement can't show:** whether the pitched voice sounds like a real child or like processed audio. That needs the owner's ears.
- **Licensing:** the free plan is generally not licensed for commercial use and requires attribution. Check the current ElevenLabs terms before publishing anything voiced on it.

## Casting under the free tier (owner: "accept the free fallback", 17 Nov 2026)
| Role | Preset | Voice | Treatment |
|---|---|---|---|
| Toddler (L1, L5) | `olToddler` | Jessica | +7 semitones after generation (about 290–380 Hz) |
| Ollie, 6 | `olOllie` | Lily | +8 semitones after generation. First tried at +5, which measured 208 Hz, lower than Ava. |
| Kate, awake | `olKate` | Lily | as recorded (about 184 Hz) |
| Kate, asleep (L2, L3, L6) | `olKateNight` | Lily | flat, slow (stability 0.75, speed 0.85) |
| Kate, L4 shout | `olKateShout` | Lily | (stability 0.35, style 0.4) |
| Ava | `olAva` | Alice | as recorded |
| Mark | `olMark` | Daniel | as recorded |

**How the pitch is applied:** `pitch.sh` runs after narration. It uses rubberband with tempo 1, so durations are unchanged and the word timings stay valid. It keeps the originals as `<hash>.orig.mp3`.

**Round trip on every Polish line, as heard in the film:** all six match word for word.
- L4 *Weź go!* first came back as the English "There you go". It is now generated with Polish context the model hears but doesn't speak ("Tomasz! Tomasz, tutaj! Szybko!") and comes back as Polish.
- *Przepraszam* is labelled Hungarian by language detection, as single words often are, but the words are exact.

**Narration:** 40 lines (39 distinct), 859 characters of the free 10,000.
- **Review track:** `part1-dialogue-v1.mp3`, with its page `part1-dialogue-v1.html`.
- **Length:** 120 s with the real voices.
