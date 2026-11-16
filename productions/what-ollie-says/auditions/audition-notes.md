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
