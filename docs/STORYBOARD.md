# Writing a Short as a storyboard

From Stage 1E on, a new video is **data, not code**. You describe the shots: who is in each one, where they stand, what
they do and how the camera moves. The engine then builds the whole film, with the same look, characters and sets as
every other video.

```
storyboard (data)  ->  validate (npm run test:story)  ->  compile  ->  Short-<id> composition  ->  cloud render farm
```

| File | Job |
|---|---|
| `animation-studio/src/studio/story/types.ts` | the storyboard format (what you can write) |
| `animation-studio/src/studio/story/validate.ts` | finds mistakes and checks 9:16 framing before any render time is spent |
| `animation-studio/src/studio/story/compile.ts` | turns the data into camera moves, transitions and per-frame acting |
| `animation-studio/src/studio/story/Short.tsx` | the one generic composition used by every storyboard |
| `animation-studio/src/studio/stories/*.ts` | the storyboards themselves; register each one in `stories/index.ts` |

The first video built this way is the 18-second "yawn" demo: `stories/yawn-demo.ts`, cloud render run 5, release `video-Short-yawn-demo-run5`.

![yawn demo frames](library/storyboard_demo_strip.jpg)

## Making a new video
1. Copy `stories/yawn-demo.ts` to a new file and give it a new `id`.
2. Add it to the `STORIES` list in `stories/index.ts`. It automatically becomes the composition `Short-<id>`.
3. Run `npm run test:story`.
   - It must print `all storyboards valid`.
   - Each error names the shot and the problem, for example `shot 3 (lab): milo stands on unknown mark "sofa" (marks: a, b, c, bench, island, hood)`.
4. Render it in the cloud. Commit `render-request.json` with `"composition": "Short-<id>"`. See [CLOUD_RENDERING.md](CLOUD_RENDERING.md).

## The format

```ts
{
  id: "yawn-demo",
  cast: { milo: "milo", juno: "juno", gus: "gus", waiter: { extra: 7, era: "modern" } },
  shots: [
    { dur: 3.0, set: "city", light: "day",
      camera: { move: "frame", on: ["milo", "juno", "gus"], size: "full", from: 4, height: 1.5 },
      transition: "cut",
      actors: [
        { who: "milo", at: "kerb", walk: { to: "a", t0: 0, t1: 1.3 }, beats: [{ t: 1.5, act: "sleepy" }] },
        { who: "juno", at: "b", act: "explain", talk: [[0.3, 2.8]] },
      ],
      fx: [{ kind: "idea", on: "juno", t: 1.0 }],
      kicks: [0.35],
      note: "script line for this shot" },
  ],
}
```

All times are in **seconds from the start of the shot**.

### Shot fields
| Field | Meaning |
|---|---|
| `dur` | length in seconds. 1.5–4 s suits Shorts |
| `set` | `home`, `classroom`, `office`, `lab`, `city`, `oldtown` or `nature` |
| `light` | `day`, `golden` or `night` outdoors; `interior` or `interiorCool` indoors. If left out, the set's own default is used |
| `transition` | how this shot begins: `cut` (default), `fade` (8-frame crossfade), `flash` (white flash) or `dip` (a quick dip to black) |
| `fx` | reaction marks placed beside a character's head. The 16 kinds are listed in [LIBRARY.md](LIBRARY.md) |
| `kicks` | impact camera shakes |

### Camera moves
In camera moves you name **characters**, not coordinates. The engine works out the camera position for the 9:16 frame.

| Move | Example |
|---|---|
| a set's designed view | `{ move: "view", view: "wide" }` or `establish` (slow drift) |
| frame some characters | `{ move: "frame", on: ["milo","juno"], size: "medium", from: 10 }` |
| push in / pull out | `{ move: "pushIn", on: ["juno"], size: "full", to: "medium" }` |
| close-up | `{ move: "closeUp", on: "gus", punch: true }` |
| low hero / high angle | `{ move: "lowHero", on: "milo" }` / `{ move: "highAngle", on: ["milo","gus"] }` |
| over the shoulder | `{ move: "overShoulder", over: "milo", at: "juno" }`. Give Milo `back: true` |
| orbit | `{ move: "orbit", on: ["milo","gus"], fromDeg: [-14, 14] }` |
| crane down | `{ move: "crane", on: [...], heights: [5, 1.5] }` |
| dutch tilt | `{ move: "dutch", on: ["gus"], roll: 0.14 }` (roll in radians) |

The camera options work like this:
- **`size`** is one of `wide`, `full`, `medium`, `close` or `extreme`.
- **`from`** is the camera angle around the characters, in degrees.
- **`height`** is the camera height in metres.

### Actor fields
| Field | Meaning |
|---|---|
| `at` | a set mark (`a`, `b`, `c`, `kerb`, `sofa`...; see [LIBRARY.md](LIBRARY.md)) or `[x, floorY, z]` |
| `act` | one of 26 acting presets (face plus body), for example `explain`, `shock`, `laugh`, `sleepy` or `idea` |
| `face` / `gesture` | override the preset's expression or hands |
| `beats` | changes during the shot: `{ t, act?, face?, gesture? }`. Expression changes hide behind an automatic blink |
| `talk` | speaking spans `[[start, end]]`, which animate the mouth and talking hands |
| `nod` / `shake` | start times of head nods and head shakes |
| `walk` | walks in profile from `at` to `to` between `t0` and `t1` |
| `facing` | by default each character turns toward the nearest other character. Can also be `"camera"`, `"toward:gus"`, `-1`, `0` or `1` |
| `back` | seen from behind (the near character in an over-the-shoulder shot) |
| `idle` | how much idle life (breathing, glances): default 1; `0` keeps them still |

## What the engine does for you
- **Framing:**
  - Cameras frame characters where they settle (at the end of a walk), so walk-ins enter the frame naturally.
  - The slow "breathing" push-in of a held shot totals at most 8%, so a fitted group stays in frame to the last frame.
- **Clear sight lines:** a lamp post, tree or bench that would stand between the lens and the cast is left out of that film's build of the set (outdoor sets).
- **Acting:**
  - Characters face the nearest other character.
  - Expression changes hide behind an automatic blink.
  - Effects pop up on the side of the head facing the frame centre.
- **Over-the-shoulder:** the shot is solved for the narrow vertical frame. The near character's back fills the outer third and the far character's face sits just off centre.
- **Transitions and determinism:** the incoming shot's camera starts early under a crossfade, so both halves of the fade move. Everything is a pure function of the frame number, so chunked cloud renders join without seams.

## What the validator checks
- **Unknown names:** cast, sets, lights, marks, acts, faces, gestures, effects and views.
- **Staging conflicts:** two actors on one mark; a camera aimed at someone who isn't in the shot.
- **Timing:** beats, talk spans, walks and effects that fall outside their shot.
- **Lighting:** an indoor light used on an outdoor set, or the reverse.
- **Vertical framing:** it solves the real camera at the start, middle and end of every shot and checks that each subject's head is fully inside the 1080x1920 frame. Walkers are checked once they arrive. In over-the-shoulder shots, the near character's shoulder must fill at least 15% of the frame width.

The test also feeds the validator deliberately broken storyboards to make sure it catches each kind of mistake.
