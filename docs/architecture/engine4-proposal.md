# Engine 4: a unified PBR pipeline: audit and proposal (awaiting the owner's approval; no code, no renders)

## 1. Audit: what in the current pipeline causes each problem
| Problem | Where it comes from (file) | Why |
|---|---|---|
| **Flat lighting** | `look/shade.ts` (`twoTone`), `look/lights.ts` presets | Every world material is patched into a **two-tone toon shade** (lit / shade / lift multipliers): one hemisphere light plus one sun, no point or spot practicals, no bounce light. |
| **Thick black outlines on the world** | `look/ink.ts` | A screen-space **ink pass draws outlines on every world object** (depth and crease edges, 3–5 px). It's the right cartoon look for flat sets; on realistic sets it reads as "cut-out". |
| **Characters don't sit in the light** | `look/cardshade.ts`, `characters/cast.ts`, `lights.ts` `actorShadow: false` | The cast are **2D cards with one tint per light preset**. They get contact blobs, not real cast shadows, and no rim or key from the room's actual lights. |
| **Blender realism only in places** | `themes/gtagf` (`ggPlate`) | Blender is used only as **still backdrops 30 m behind the cast**. The camera can't really move through them (no parallax), and the rooms are still toon three.js sets. |
| **Static camera holds** | `camera/keys.ts`, `camera/moves.ts`, story `at()` cameras | Cameras are "hold plus a small creep, plus cuts". There are glides, whips, swoops and flights, but **no handheld noise, no focal lengths in mm, no orbit or truck primitives**, and moves ease to a full stop. Insert cards (`ggInsert`, `ggWall`) are flat planes the camera stares at. |
| **Stiff characters** | `characters/acting.ts` (`blend`), `characters/figure.ts` (the gesture presets) | **Gestures are discrete presets**: `blend()` eases only numeric fields, and the gesture swaps at the half-way point (a snap). Easing is symmetric smoothstep: no fast-out-slow-in, no overshoot, no squash and stretch, no lean or turn of the whole body. **Held items are drawn near the hand**, not attached to it. |
| **The format** | `story/TitleCards.tsx`, `title` banners, CLAUDE.md's format system | Frame-0 banners, title cards and comment CTAs are **written into our own rules** (CLAUDE.md), so they have to change too. |

## 2. The options considered
**A. Everything in Blender** (sets, camera and lighting rendered per frame in Blender; the cast composited in Remotion).
- *Rejected.* On this machine Eevee takes **1.5–4.5 min per frame**, against 4.4 s for three.js.
- A 50 s Short is ~1,500 frames, so **days per video**, or several hours even across 20 cloud chunks.
- Matching the 2D cast to Blender's camera and shadows each frame adds a fragile two-renderer sync.

**B. Blender as the offline set and lighting *baker*, three.js PBR as the real-time renderer** ← **recommended**
- Each set is built **once** in Blender Python (our own geometry plus Poly Haven CC0 PBR textures), **light-baked once
  in Cycles** (global illumination plus ambient occlusion into lightmaps), and exported as **glTF**.
- Remotion / three.js renders it with **real PBR materials, real-time lights and shadows**, at about today's speed.
- The camera can move **anywhere in true 3D**, with correct parallax, which the still plates can't do.

## 3. The proposed architecture: "Engine 4" (opt-in; every published video stays exactly as it is)
**3.1 Sets (standard 1)**
- `blender/sets/<name>.py` builds a set and runs a **Cycles bake** (diffuse GI plus AO into lightmaps), then exports
  `public/sets/<name>.glb`. It's cached, and rebuilt only when the script changes.
  - About 15–40 min per set, once, locally or on a GitHub runner.
- A three.js **`PbrSet` loader**:
  - `MeshStandardMaterial` with albedo, normal, roughness and baked lightmaps;
  - **real-time lights on top**: a directional key, practicals (point and spot lamps with shadows), and a cool
    rim / window light;
  - `shadow-mapped`.
- **No world ink.** Ink stays on the characters only (they're already drawn with outlines).

**3.2 Characters in the light (standard 1)**
- The cast cards **cast real shadows** onto floors and walls: the alpha cut-out depth material they already have,
  with `castShadow` on.
- Their tint, key and **rim** come from the set's own light rig at their position: a simple per-actor light probe
  instead of one preset tint.

**3.3 Atmosphere and post (standard 1)**
- SSAO (N8AO), bloom on practicals, height fog, and **instanced dust motes / particles**.
- The existing depth of field and colour grade stay.

**3.4 The camera rig (standard 2)**
- **New move primitives:** `dolly`, `truck`, `orbit`, `crane`, an over-the-shoulder framing helper, and **focal length
  in mm** (24–35 mm for establishing shots, 85 mm for close-ups with real depth of field).
- **Handheld noise on every shot:** deterministic seeded noise (so chunked renders match), with the amplitude per shot
  type. **No move eases to zero velocity**, so no frame is ever frozen.
- **Impact shake presets** (5–10 frames), fired from the same cue as the sound effect.
- **Validator rules:**
  - any shot that frames a flat card or poster for more than 2.5 s fails;
  - the average angle or beat change must land in 1.5–2.0 s;
  - **the measured motion gate:**
    - almost-still frames ≤ 3 %;
    - identical frames ≤ 1 %;
    - a moving camera in 10–30 % of frames.

    It's measured by the STUDY.md frame script on every preview.

**3.5 Character animation (standard 3)**
- **Gestures become continuous arm and torso angle sets.** Gesture-to-gesture changes are then a real interpolation,
  not a swap.
- **Key poses per shot (2–3)**, with **fast-out-slow-in and overshoot easing** (`easeOutBack`), anticipation, and
  **squash and stretch** on the card for accents.
- **Whole-body lean, slump and turn.**
- **Props are attached to the hand's transform** (held for real).
- **Secondary motion kit:**
  - flickering practicals;
  - swaying plants and fabric (a vertex wind);
  - dust;
  - background loops (traffic, a ceiling fan, a TV glow).

**3.6 Format and graphics (standard 4)**
- **The defaults change:** no title cards, no frame-0 banner, no end-card CTA. The first beat must be physical action
  by 2 s (the validator checks it).
- **Captions:** larger (≈ 3 % of the height), 1–2 words, centred in the mobile safe zone.
- **`BigNumber`:** oversized extruded 3D numbers and stats, lit in the scene, replacing small text in frames.

**3.7 Sound (standard 5)**
- Every camera whip, shake, action and reveal **automatically gets a layered sound cue** (extending `autoSfx`).
- **The music ducks 6–10 dB** under dialogue and punchlines (the default `duck: -8`).

## 4. Phases (each ends with test frames for the owner; rendering only after approval of this plan)
| Phase | Scope | Proof |
|---|---|---|
| 1 | The `PbrSet` loader, one baked Blender set (Maya's kitchen), real lights, character cast shadows, SSAO, fog, dust, no world ink | 3 stills against the current look |
| 2 | The camera rig (mm lenses, dolly, truck, orbit, handheld noise, impact shake) plus the motion gate in the validator | a 5 s test clip measured by the frame script |
| 3 | Continuous gestures, key poses with overshoot, squash and stretch, held props, secondary motion | a 5 s acting test |
| 4 | Format defaults, captions, `BigNumber`, auto sound cues and ducking, a reusable **template storyboard** | a 15 s template sequence |
| 5 | The Friday Pizza sets (street, Number 9, the kitchen, the bedroom, the care home) | production |

**Cost and speed:**
- Render time should rise from ~4.4 s to ~6–8 s per frame (shadows, SSAO, PBR). The 20-chunk cloud render stays
  about 20–25 min.
- Bakes are one-off per set.

**Rule changes this needs** (the owner's call, made here explicitly):
- CLAUDE.md's "don't rebuild working systems";
- the frame-0 banner rule.

Engine 4 is **opt-in** (`engine: 4`), so every published video and the protected assets stay untouched.
