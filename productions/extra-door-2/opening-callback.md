# Video 06: the opening vote callback (proposal for approval; nothing built)

**What it adds:** a 1.2 s callback to Part 1's vote. Part 1's final A / B choice, with **B visibly selected**, then a
hard cut straight into Milo running down the stairs.

**What doesn't change:**
- the approved script wording and all ten recordings (no regeneration);
- the order of every later beat.

## How it fits the opening
The callback **overlaps the start of the hook** instead of sitting in front of it. Milo's breathless counting and his
footsteps begin under the vote card, so the film opens on two hooks at once: the result of the vote, and someone
already running and counting.

| Time | Picture | Sound |
|---|---|---|
| 0.00 | **Part 1's final composition, exactly as Part 1 left it:** the hallway, Milo, the door, the stairwell, with the two Part 1 labels "A: OPEN THE DOOR" and "B: RUN DOWNSTAIRS". | Part 1's last sound, the latch click, opens Part 2. |
| 0.10 | **B is selected:** a bright green outline and glow fade in around the B card; its badge and text lift slightly; the card does one quick pop (Part 1's label pop curve). **At the same moment A dims:** it fades to about 40 % opacity, desaturated, with a soft shadow behind it. | A soft tap (Part 1's existing phone_tap sound) on the selection. |
| 0.25 | A small **"YOU CHOSE B"** tag pops in above the B card: a green pill in the label font. | |
| 0.33 | (Optional) Milo turns and bolts toward the stairwell, out of frame. | Footsteps start; MILO, breathless, off-screen: "…twelve…" |
| **1.20** | **Hard cut on "thirteen"** into the hook: the low angle on the stairs, Milo hammering down toward the lens. | MILO: "…thirteen…" |
| **2.22** | The camera drops past him; the steps keep going into black. | MILO: "…fourteen?" |
| 3.01 | The hook line ends. | |
| 3.13 | Shot 2: over his shoulder, the old door behind him. | NARRATOR: "Last night, Milo's hallway grew an extra door." |

**The rest of the film moves 0.33 s later**, with nothing else changed:
- the total goes from about 51.5 s to about **51.9 s**;
- every line keeps the gaps the narration review shows;
- the music cut, the 1 s of silence before the warning and the knocks all keep their spacing.

## What it costs the hook
- **"fourteen?" moves from 1.89 s to 2.22 s.** It is the only delay, and it buys a 1.2 s card. During that card the
  viewer already hears the run and the counting, and sees a clear, intriguing image: a vote result.
- **If you want the question to land sooner,** a 1.0 s card puts "fourteen?" at 2.02 s. That is a little short to
  read the tag comfortably, so 1.2 s is my recommendation.
- **Why not before the hook.** A silent 1.2 s card before the counting would push "fourteen?" to about 3.1 s, which
  is why I don't recommend it.

## How it is built: a small extension of Part 1's existing label, no new UI system
The **same `choiceLabel` prop**: the same card texture (dark rounded card, amber A badge, cyan B badge, white text in
the label font), the same drawn-over-everything, no-outline material, the same facing-the-lens behaviour and the same
pop. It only gains two new states and a tag:
- **Selected:**
  - the same card with a green rounded outline drawn on its canvas;
  - a soft green glow behind it (one blurred rounded rectangle);
  - a slight lift in the badge and text brightness;
  - one pop.
- **Dimmed:**
  - the same card drawn desaturated at about 40 % opacity;
  - a soft dark shadow behind it.
- **The tag:** "YOU CHOSE B", a small green pill above the selected card, in the same label font.

Part 1's labels stay **pixel-identical**, because the new states only appear when a storyboard asks for them.

**The background** is Part 1's shot 21 framing in Part 1's hallway set (Milo, the door, the stairwell), rendered live
at full resolution. The labels sit at the same positions as Part 1's labels, so the callback reads as the actual
ending of Part 1. **The cut to the hook happens inside the same set**: the stairwell is in that hallway, so the
callback and the hook are one shot with a hard-cut camera beat on "thirteen". The labels pop out at the cut.

**The caption** "…twelve…" appears during the card. The existing caption placer already keeps captions clear of
labels, so it sits below them. Captions can't be turned off for one shot (the switch is per video), and I wouldn't
add that for one word.

**Cost:** about 40–60 lines in the Extra Door theme's label code, plus one shot in the storyboard. It adds no
narration, no new sound (the latch click and tap are Part 1's) and no render time beyond the 1.2 s itself.
