# Blender in the Thinkora pipeline: Phase 1 investigation

**Date:** 23 Nov 2026.

**Scope:** inspect the current system and find out whether Blender can run headlessly in our cloud setup. Nothing in
the production pipeline was changed: no repository code, no workflow. Blender was installed only inside this
throwaway development container, to test it.

---

## 1. How the current system works

### Characters
- **They are 2D drawings, not 3D models.**
  - `src/studio/characters/toon.ts` and `figure.ts` draw each character on a 600 × 1000 canvas.
  - A character is a data recipe (`Look`: build, hair, top, glasses…) plus a per-frame pose: mode (stand, sit, walk,
    run), gesture, face, look direction and blink.
  - The drawing becomes a texture on a flat plane (a "card") standing in the 3D set, facing the camera.
- **Walking and running are drawn side-on.** Turning toward or away from the camera is a separate view. This is why a
  figure seen from steeply above flattens (CLAUDE.md, "Known engine behaviour").
- **Gestures are hand-written 2D arm curves,** such as `sixSeven` and `choke`, driven by sine functions of time.

### Environments and props
- **Sets** (`src/studio/sets/`, e.g. `room.ts`'s `buildRoom`) are procedural three.js geometry: boxes, planes and
  cylinders merged into batches (`materials/geo.ts` `Batch`).
- **Surfaces** are canvas-painted textures (tiles, wallpaper, wood).
- **Theme props** (`src/studio/themes/<x>/index.ts`) are small rigs: a three.js group plus `update({step, camPos})`.
- **Insert cards** (phones, close-ups) are 2D canvas drawings on a 0.54 × 0.96 m plane.

### Animation and cameras
- **Everything is a pure function of the frame number,** which makes renders deterministic. That is what allows 20
  chunks to render in parallel.
- **`story/compile.ts` turns a storyboard into a timeline:**
  - shots and their frame ranges;
  - actor positions (`actorPos`, walks between marks);
  - prop step values (`stepAt`: each step eases over `STEP_DUR` = 0.7 s);
  - camera beats.
- **Cameras** (`camera/moves.ts`): `at` (placed), `glide` (eased move), hard cuts on words, `roll`, `creep` and lens
  `blur` (thin-lens depth of field).

### Rendering
- **Remotion** registers one composition per storyboard, `Short-<id>` (`src/Root.tsx`). `story/Short.tsx` →
  `look/StudioFilm.tsx`.
- **StudioFilm** uses `ThreeCanvas` from `@remotion/three`, a React Three Fiber canvas whose clock is Remotion's frame.
  The post chain is: ink outlines (`InkPass`) → lens blur → bloom → neutral tone map → colour grade, with MSAA 4.
- **Captions and title banners** are React DOM layers drawn over the canvas (`Captions.tsx`, `TitleCards.tsx`).
- **Sound is built separately in Python** (`sound/build.py`): voices, effects, the Eleven Music score and ducking. The
  MP3 is muxed in at the join step, so chunks never split the audio.
- **Rendering happens in headless Chrome:**
  - On a normal PC, WebGL uses the GPU (`angle`).
  - In the cloud, WebGL runs on the CPU through SwiftShader (`REMOTION_GL=swangle`).

### Cloud rendering (`.github/workflows/render.yml`)
- **Trigger:** a push that changes `render-request.json` (composition, chunks, preview, `publish: false`).
- **The plan job:**
  1. `npm ci`;
  2. `tsc` (a type error stops the run: this happened once, on 22 Nov);
  3. preflight (a storyboard / narration / soundtrack fingerprint check);
  4. `remotion bundle`;
  5. split the film into 20 frame ranges.
- **20 render jobs** run in parallel on `ubuntu-latest`: 4 vCPU, 16 GB RAM, no GPU, 180-minute limit each.
- **The join job:** ffmpeg concat plus the soundtrack, then the QA script (`scripts/qa.mjs`), then upload as an artifact.
  `qa.yml` reruns the full QA (with seams) on request.
- **Speed:** a ~1-minute Short takes about 14–16 minutes of wall time at full resolution, which is about 20 × 14
  runner-minutes.

---

## 2. Can Blender run headlessly in our cloud?

**Yes.** Tested in this container, which is an Ubuntu 24.04 cloud machine like GitHub's runners: 4 cores, no GPU.

| What was tested | Result |
|---|---|
| Install (`apt-get install --no-install-recommends blender`) | ✅ Blender **4.0.2**, 24 s |
| Run headless (`blender -b --factory-startup -P script.py`) | ✅ |
| **Workbench** (flat preview engine) | ✅ needs `libegl1 libegl-mesa0 libgl1-mesa-dri` (software OpenGL, "surfaceless EGL"); **0.58 s** per frame |
| **Eevee** (fast real-time-style engine) | ✅ same libraries, CPU software OpenGL; **5.1 s** per frame |
| **Cycles** (path tracer, the most realistic) | ✅ CPU, 32 samples; **10.7 s** per frame (noisy) |
| Cycles denoising | ❌ the Ubuntu build has **no OpenImageDenoise**; the official Blender build includes it |
| Freestyle (outline) render | ⚠️ crashed in the test script because no line set was defined; a script fix, not an infrastructure problem |

The test scene: a floor, a wall, a bean-shaped stand-in (sphere plus cylinder), a box, an area light and a sun, at
**540 × 960** (half resolution). Images are in the session scratchpad; they aren't committed.

**Where Blender can come from:**
- **Ubuntu apt (4.0.2):** works here and on GitHub runners. It's older, has no denoiser and has the old Eevee.
- **The official release (e.g. 4.2 LTS / 4.5 LTS tarball from download.blender.org):**
  - **blocked from this container** by the network policy (`403 … no rule allows this host`);
  - **GitHub's runners have open internet,** so a workflow can download it and cache it with `actions/cache`;
  - it includes OpenImageDenoise and Eevee Next (better lighting and shadows), and needs the same EGL / Mesa libraries.

**Rough cost at full resolution** (1080 × 1920 is 4× the test's pixels; real scenes are heavier than the test):

| Engine | Per frame, simple scene (est.) | 60 s Short (1,800 frames) on 20 runners |
|---|---|---|
| Workbench | ~2 s | ~3 min per chunk |
| Eevee (CPU) | ~15–25 s | ~25–40 min per chunk |
| Cycles (CPU, denoised) | ~30–60 s+ | 45–90 min+ per chunk |

These are estimates from one simple frame. Phase 2 has to measure a real shot on GitHub's runners before any decision.

**GitHub minutes:**
- Each runner-minute counts against the account's Actions allowance if the repository is private. Today's renders use
  about 280 runner-minutes; Eevee renders could use 2–3× that.
- **Check the repository's plan and Actions usage before scaling up.**

---

## 3. What this means for "cleaner, more realistic"

- **The renderer is only part of what looks clean.** Smoothness also comes from:
  - animation timing (how many frames per step, eased arcs, overlapping motion);
  - pose design;
  - lighting direction;
  - how full the backgrounds are.

  STUDY.md (the Rick's clips analysis) will measure those. Some of the gap may be fixable in the current engine at no
  extra render cost.
- **Blender's real wins:**
  - real 3D rigged characters that turn, sit and walk in any direction (no side-on-only walks);
  - soft global illumination and contact shadows;
  - proper materials;
  - a huge free ecosystem of rigs and props.
- **The trade-offs:**
  - render time on CPU runners;
  - a second toolchain (Python `bpy` scripts instead of TypeScript);
  - our 2D character style would need 3D versions (a design job, not a port).

---

## 4. Integration options (for Phase 2; nothing built yet)

1. **Blender for backgrounds only.**
   - How it works: Blender renders each set's background plate (or a short camera move) as an image or image sequence.
     Remotion and three.js keep the 2D characters, captions and post on top.
   - Pros: lowest risk, and the pipeline stays the same.
   - Cons: the characters stay 2D.
2. **Blender for whole shots.**
   - How it works: a `bpy` script builds a shot from the storyboard (set, rigged characters, camera keys) and renders
     it to frames. Remotion places them as `<OffthreadVideo>`/image sequences, then adds captions and audio as today.
   - Pros: the biggest quality jump.
   - Cons: the most work and the slowest renders.
3. **Blender as an asset tool only.**
   - How it works: model and rig in Blender, export glTF, and load it in three.js / React Three Fiber.
   - Pros: same render path and speed, and better models.
   - Cons: lighting stays three.js-level.

**Recommended Phase 2 path:**
1. Finish STUDY.md first, to see whether timing, posing or rendering is the real gap.
2. Then add a `workflow_dispatch` "Blender benchmark" workflow: install the official Blender LTS, render one
   representative shot (a kitchen set, one rigged stand-in character, 3 s) with Workbench, Eevee and Cycles at full
   resolution, and report the times. One small new workflow; `render.yml` stays untouched.
3. Pick option 1, 2 or 3 from the measured numbers and the owner's look tests.

**Setup lines a workflow would need** (all tested here, apt version):
```bash
sudo apt-get update && sudo apt-get install -y --no-install-recommends blender libegl1 libegl-mesa0 libgl1-mesa-dri
blender -b --factory-startup -P render_shot.py -- <args>
```
