# In my world, the toaster burns the last thing you say (working title: "The Toast")

**Format:** Engine 4, one set (Maya's kitchen), 85 s, 7-Beat "One-Rule World", zero flashbacks, no title card, no banner, no end CTA.
**Cast (existing):** Maya = the child character (cast key `bug`), Mum = `mum`. One narrator voice, ONE continuous narration track.
**Status:** script and prop list for the owner's approval. Audio is built (both masters); **no picture is rendered, no prop is built.**

## The rule, the irony, the payoff in one line
Rule: the toaster burns the last thing you say onto your toast. Irony: Maya is a terrible liar and she just broke Mum's favourite mug.
Planted skill: every morning she whispers a sorry to the toaster "for practice". Loophole: the toaster burns the LAST thing you say,
so when her lie is out and the toast is already toasting, she keeps talking and says the practised sorry, and the toast tells the truth.

## The script (narrator only; times are from the generated narration)

| Beat | Time | Narration | What we see (every key noun on screen) |
|---|---|---|---|
| **1 Hook** | 0:00 | In my world, the toaster burns the last thing you say onto your toast. | Open mid-action: the toaster pops, a slice with burnt letters rises (the wordToast) |
| | 0:04 | I'm Maya. I'm a terrible liar. | Maya, nervous, hands behind her back |
| | 0:07 | And this morning... *(0.25 s beat)* I broke Mum's favourite mug. | The brokenMug on the table (the reveal lands on "broke") |
| **2 Funny example** | 0:10 | Last night, Mum said my drawing was amazing. Then she muttered something at the fridge. | Close on the drawing on the fridge (already in the set); Mum at the fridge |
| | 0:16 | This morning, her toast said... *(0.25 s beat)* weird dog. | wordToast "WEIRD DOG" pops up; Mum's face |
| | 0:19 | She ate it before anyone could read it. | Mum bites the toast (eat gesture with the toast in hand) |
| **3 Stakes / rival** | 0:22 | Mum reads everyone's toast out loud, at seven. | Mum holds the toast like a judge |
| | 0:26 | Hers always says, good morning. Ten years, perfect toast. | wordToast "GOOD MORNING", smug Mum |
| | 0:30 | She is very proud. | Mum, chin up |
| | 0:31 | It was six fifty-eight. | The big 3D lit "6:58" (existing e4Number prop) on the table under the lamp |
| **4 Secret practice** | 0:33 | My secret? I whisper sorry to the toaster. Every morning. Out loud. For practice. | Maya leans to the toaster and whispers; Mum watches |
| | 0:40 | Mum thinks it's silly. | Mum's eyebrow |
| | 0:41 | But it's the only way I can say sorry without my voice shaking. | Close-up of Maya |
| **5 Event and public fail** | 0:45 | Then Mum found the mug. | Mum sees the brokenMug (cold light, lamp dips) |
| | 0:47 | She held up the pieces. Maya, did you break this? | Mum holds the pieces up (held item: the mug pieces) |
| | 0:50 | **Music cuts dead, sub-bass hit.** I panicked. I said: I did not break your mug. | Maya, 85 mm close-up, mouth open |
| | 0:54 | Mum dropped bread in the toaster. Let's see what it says. | Mum pushes the lever; the bread (wordToast blank) goes down |
| | 0:58 | And my lie was the last thing I'd said. | Silence, the toaster's glow, Maya small |
| **6 Loophole payoff** | 1:01 | But the toaster burns the last thing you say. | Maya looks up: realisation |
| | 1:03 | The last. So I kept talking. | Maya steps to the toaster |
| | 1:06 | I whispered my practised sorry. Every word. To Mum. | Maya says it to Mum, the toaster glowing between them |
| | 1:10 | **Music comes back.** The toast popped. | The slice pops, letters smoking |
| | 1:11 | It said: sorry Mum, it was me. | wordToast "SORRY MUM IT WAS ME" in big letters |
| **7 Role reversal** | 1:14 | Mum read it twice. | Mum reads; her face softens |
| | 1:15 | Then she walked to the toaster. Dropped in her own bread. | Mum, bread, lever |
| | 1:18 | And whispered, very quietly, the one thing she had never said out loud. | Mum leans to the toaster, whispers |
| | 1:22 | Her toast said: I love the weird dog. | wordToast "I LOVE THE WEIRD DOG"; Maya sees it; the drawing on the fridge behind. **Cut clean, 1:25.** |

Words: 229. Spoken length 84.5 s, film 85.2 s. A visual change every **1.52 s** (hard cuts on words inside long lines; hand-held, 24-85 mm).

## Audio plan (built)
- **One continuous narration** (`narration: "continuous"`): one ElevenLabs generation of the whole text; each shot is a slice of it, the cuts fall on its words. The two beats are 0.25 s inserted at the natural gap after "morning..." and "said...".
- **Music:** Grieg's "Morning Mood" (public domain, `assets/music/morning-mood.mp3`) from 0:00; **hard cut to dead silence at "panicked" (0:50.5) with a low sub-bass hit; it comes back on "popped" (1:10.5).**
- **Word-level SFX:** 44 sounds on spoken words, one every 1.9 s on average (longest gap 4.2 s), all grounded: kitchen, comedy, tension. No crowd, stadium, gasp or scream sound can play in this film (a filter enforces it).
- **Ducking:** music -8 dB under the punchlines (marked `punch`) and the major hits (burn, break, pop, six).
- **Dual export:** `audio/Short-in-my-world-1.mp3` (scored) and `.nomusic.mp3` (narration + SFX + ambience, for TikTok / Reels native audio); `node scripts/dual-export.mjs <render.mp4> in-my-world-1` makes both videos.

## Hero props (nothing is built until you approve)
1. **`wordToast`**: a slice of toast with burnt, readable lettering. Variants: blank bread, WEIRD DOG, GOOD MORNING, SORRY MUM IT WAS ME, I LOVE THE WEIRD DOG. It rises out of the toaster slot (a step on the word), can be held and bitten, and the letters smoke for a beat. Used in 8 shots; it is the story.
2. **`brokenMug`**: Mum's favourite mug in three pieces plus the handle on the table (the reveal), and the same pieces as a held item for "She held up the pieces".
3. *(No third build.)* The "6:58" is the existing 3D lit number; the drawing, the fridge, the toaster, the lamp and the clock are already in the baked set.

**Show, don't tell:** toaster (set), toast (wordToast), mug / pieces (brokenMug), drawing + fridge (set), bread (wordToast blank), "six fifty-eight" (3D number), Mum, Maya (characters). Every spoken noun has a picture.

## Honest notes
- One set means one room. To keep 5-6 distinct looks I propose lighting states (warm lamp and gold window for beats 1-4, cold light with the lamp dimmed for beat 5, warm bloom for 6-7) plus 24-85 mm camera set-ups. It is not 5-6 different rooms.
- "Last night" and "this morning" are said, never shown: there are no flashback shots.
- The placeholder storyboard (`stories/in-my-world-1.ts`) cycles the approved camera and acting set-ups so timing, captions and sound can be checked; the real shot list comes after you approve the script and props.
