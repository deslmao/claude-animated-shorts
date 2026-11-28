# Decisions log

Newest at the bottom. Each entry gives the date, the decision, who made it, and why. The owner's exact words are in
`PROMPTS.md`. Entries before 22 Nov 2026 are reconstructed from the session history.

## Standing rules (owner)
- **Publishing:** `"publish": false` always; no GitHub Release, no social uploads by Claude. No pull request, no merge
  to main. Work on `claude/admiring-hopper-kbrb3d`.
- **Safety:** never expose API keys (ElevenLabs goes through the proxy with a dummy key). Don't weaken validators.
  Protected assets are additions only. Engine changes must be opt-in, so published videos never change.
- **Permissions:** don't bypass permission restrictions or try download workarounds.
- **Approval:** the owner approves the viewer script before any voices are made.
- **Originality:** don't copy copyrighted works or other creators' characters, scenes or frames (e.g. the owner's
  TikTok cat recording became our own cartoon cat and a parody re-voice).
- **Copy:** every completed video's reply includes the link to its `publish/PUBLISHING.md`.
- **Cadence:** at most one post a day, generally. Posting windows without a VPN on weekdays (GMT+11): 3:30–5:30 and
  8:00–9:30; schedule publication for about 9–10 am.

## Format system
- **21 Nov (owner):** every video has motion and a two-line banner on frame 0.00, a visual change every 1.7–2.1 s,
  5–6 rooms or lighting setups, and runs 40–70 s. Lots of visuals and sound effects. Recorded in CLAUDE.md.
- **22 Nov (owner):** hooks follow the breakfast pattern: an everyday situation, then the twist, in two short lines.
  Recorded in CLAUDE.md.

## Channel strategy
- **22 Nov (Claude's recommendation, owner agreed):** one lane, "everyday situation, twist, what would you do?" POV
  horror/mystery, with the "Don't Eat It" (Bug's house) series as the main series. The reason: breakfast held 71%
  stayed-to-watch against 51% for the train, and got 13.5K views on Instagram.
- **22 Nov:** keep the channel name Thinkora for now; renaming mid-wave would lose people searching for Part 2. Give
  the series a strong name instead.
- **22 Nov:** don't delete flops. Unlisting off-topic, low-view videos is optional, once about 5 on-niche videos exist.
- **22 Nov:** stop long-form for now (5 views, 1.6% CTR).
- **22 Nov:** a 30-day, one-a-day test of the formula before judging; keep costs low; don't buy anything else.
- **23 Nov (Claude's recommendation):** don't switch to a Roblox-style look. It would break series continuity,
  imitate another brand's look, and mean a full rebuild.

## 6 7 (`six-seven`)
- **22 Nov (owner):** no red or blue screens; a slower, smoother Ouija board; "SIX SEVEN" in words, never
  "sixty-seven"; Isaac laughing, then Glendon shouting at him; hands on his neck, not his mouth; no flying animation;
  Glendon screams and runs away.
- **22 Nov (owner):** the score was too "DJ"; the new score is all horror with no beat.
- **22 Nov:** final run 54 is publishable. The QA flag was the dark, blurred start of a close-up.

## Don't Eat It, Part 2 (`breakfast-2`)
- **22 Nov (owner: "do whatever you think is best"):** hook B. You ring Mum's work and she picks up. This answers the
  top comment and the "how did she text?" clue.
- **22 Nov (owner):** answer the comments' questions. Mum texted from her work computer; she saw the double on the
  kitchen camera; she never sent "Open the door. Now."
- **23 Nov (owner):** add a recap for new viewers.
- **23 Nov (owner):** the structure is "In Part 1…" recap, then the top comment on screen, then "You were right", then
  you ring Mum.
- **23 Nov (Claude):** the comment card shows the words and likes but not the commenter's username or photo, because
  they're a real person (possibly a child) who didn't agree to appear. The owner can use Instagram's "Reply with a
  reel" for the real comment.
- **23 Nov (Claude):** "At the exact same time" became "Word for word", because the two voices play one after the
  other.

## The Last Train (`night-train`)
- **23 Nov (owner):** replace the screaming hook; only 40–51% stayed to watch on YouTube. The new frame 0 is the
  REAL / IN THE WINDOW split, under "HE HAS NO REFLECTION". The narrator: "Imagine you're on the last train home. Then
  you look at the window… and the man across from you isn't in it." The middle reflection scene is shorter (63 s).
  Post it as a new upload and unlist the old one.

## Process and tools
- **22 Nov:** the knowledge graph (`graphify-out/`) is queried before reading files; refresh it after engine changes.
- **22 Nov:** any storyboard edit makes the soundtrack stale, so rerun `--until checks` before a render request
  (CLAUDE.md).
- **22 Nov:** the CI type-check (`tsc` with no unused locals) stopped a final render. Run `npx tsc --noEmit` in
  `animation-studio/` before every render request.
- **23 Nov (owner):** log every prompt word for word (`_log/PROMPTS.md`) and every decision here, and keep
  `HANDOFF.md` current.
- **23 Nov (owner):** introduce Blender as a new 3D tool without replacing Remotion / three.js / React Three Fiber.
  Phase 1 (investigation) is done: `docs/blender/PHASE1-INVESTIGATION.md`. Headless Blender works on Ubuntu cloud
  machines (Workbench 0.6 s, Eevee 5 s, Cycles 11 s per half-resolution test frame on 4 CPU cores).
  - **Claude's recommendation:** do the Rick's clips study first, then a Blender benchmark workflow before choosing an
    integration path.
- **23 Nov (Claude):** the Rick's clips study can't be done by downloading from YouTube: this container can't fetch
  the videos, and the owner's rule forbids download workarounds. The owner needs to upload the 10 Shorts. It's a
  private reference: learn the grammar, never copy.
- **23 Nov:** Part 2 v4 final (run 59) passed the full QA with no flags; the MP4 is kept in the repo.
- **23 Nov (Claude):** STUDY.md was written from the 5 uploaded Rick's clips Shorts. Every frame was analysed by script
  at 30 fps, and actions were counted from frame crops.
  - **The biggest measured gap is stillness:** 20% of our frames repeat exactly and 40% barely move, against their
    0.3–1.7% and 1.5–5%.
  - **Recommended before Blender:** never-still cameras and idle motion, 5-frame dissolves, and 1–2-word captions at
    ~70% of the height (all cheap, opt-in engine changes).
  - **Blender** would mainly help set detail and light.
- **23 Nov:** The Last Train v3 final (run 60) is publishable. The QA flags were his unblinking stare (frame 172) and the plain display wall (213–269). The pinned comment's rewatch line was dropped (its timestamp no longer matched).
- **23 Nov (owner):** design an original "GTA-style" look: a sunny 80s Miami-style city of our own, plus two original
  characters. Design only, no animation; then stop and show the owner.
- **23 Nov (Claude):** the owner suggested replicating Rick's clips' models in Blender. We match their grammar and
  quality level instead (STUDY.md: full detailed sets, low warm light, 2D characters in a 3D world), never their
  models. This follows the owner's own rule ("never copy their characters, scenes or frames"). No GTA logos, fonts,
  place names or characters either; signs use made-up words (SOLVANA, MIRALUX, CORALEE, PALMETTA, BAYLUNE, VELOMAR,
  SURFIO, MOTEL PALOMI).
- **23 Nov (Claude):** the world is built procedurally in Blender (`blender/miami/miami.py`, headless Eevee, Freestyle
  ink). The cast is drawn with our own engine and stands in it as cards. Opt-in engine additions: hat `snapback`
  (worn backwards), glasses `shades`, layers `openShirt` (leaf print) and `denim` (pockets and stitching). The cast's
  names are placeholders (Rico, Lola) until the owner names them.
- **23 Nov (owner):** match Rick's clips' quality (realistic, detailed sets and their animation grammar) with our own
  models. **Claude:** no GTA characters or lookalikes (copyright claims and takedowns, lost revenue, and the owner's
  own rule). Use original characters that fit the world's archetypes instead.
- **23 Nov:** Miami look v2 stills done (no ink on the world, textures, haze, clouds, skyline, grass). Engine opt-ins
  `alive`, `captionStyle: "short"` and `transition: "dissolve"` were added with defaults unchanged. `npm test`: 2 set-view
  framing fails (alderRow, already known; ntCarriage "bay"), neither touched by these changes.
- **23 Nov (owner):** the cast are **Gordon** (the backwards snapback, shades, palm-print shirt) and **Lucy** (big curls,
  a cap, the pink denim jacket). Claude noted that Lucy must stay visually distinct from GTA VI's "Lucia".
- **23 Nov (owner):** third pass approved: dress the sets to Rick's clips' density and realism.
- **23 Nov:** Miami look v3 stills (dressed sets, street camera down the road) are in `productions/miami-look/still_v3_*`.
  **Honest gap:** Rick's clips' photo-real foliage, rock and ground textures come from asset libraries. Procedural
  shapes alone can't match them. **The next step to close it:** CC0 libraries such as Poly Haven (textures, plants,
  HDRI skies), but `polyhaven.com` and `dl.polyhaven.org` are blocked by this environment's network policy. They're
  reachable from GitHub runners, or the owner could allow the host.
- **23 Nov (owner):** allow Poly Haven. `polyhaven.com`, `dl.polyhaven.org` and `api.polyhaven.com` (the asset API
  that lists the download links) were added to the **Default** environment, the one this session runs in. Verified:
  the site and API return 200, and a 1k HDRI downloads. The repo's saved environment `claude-animated-shorts` can't be
  edited from this session (only the current environment can), so the owner adds the same hosts there in Settings if
  wanted. Poly Haven assets are CC0 (no attribution required).
- **23 Nov (owner):** the owner set the **Default** environment's network to unrestricted (any domain). Verified: Poly
  Haven and other sites answer. The earlier allowlist no longer applies. The saved ElevenLabs and Notion keys are still
  sent only to their own hosts.
- **23 Nov (Claude):** Miami look v4 uses Poly Haven CC0 assets (`blender/miami/ASSETS.md`):
  - photo textures on the asphalt, pavements, sand, stucco, palm bark and planks;
  - a real photographed sky (blue, partly cloudy) instead of the painted gradient;
  - real shrubs, planters, grass clumps and shells.

  The assets are fetched into a git-ignored cache (`assets_fetch.py`, about 110 MB) rather than committed, and
  `MIAMI_PH=0` keeps the old procedural look. Our buildings, palms, cars and cast stay our own. The stills are in
  `productions/miami-look/still_v4_*` and `compare_v3_v4_*`. One correction pass so far (brighter sand, more shadow fill).
- **23 Nov (owner):** the new series is **"GTA 6, Explained to Your Girlfriend"**, with Gordon and Lucy. Voices come
  from ElevenLabs as usual.
  - **Claude, Ep 1 "The Lucky Shirt":** the outfit-in-your-car trick for losing the cops. It's verified in 3 guides,
    and it has the strongest real-life twist ("you've worn that shirt for three days").
  - **The two worlds:** "real life" is the flat at night; "the game" is our own Miami city.
  - **No game footage, logos, or game characters or places.**
  - The viewer script is waiting for the owner's approval before any voices are made.
  - The owner's tips transcript became `productions/research/gta6-episode-ideas.md` (facts only, in our own words).
- **23 Nov (owner):** the series is about *why* GTA 6 is so hyped and why boyfriends play six hours a day instead of
  texting back, not about game tips. Ep 1 was rewritten as v2, "Why He Hasn't Replied":
  - the hook: "you text him 'hey'… six hours later: 'sorry. GTA.'";
  - the reasons: a 13-year wait, the 90M-views trailer record, two delays, ~$1.84B by launch day (an estimate), a whole
    sunny state to play in;
  - the twist: Lucy tries it, and six hours later she replies "sorry. gta".

  The tips list stays as material for later episodes. The script awaits approval.
- **23 Nov (owner):** GTA GF Ep 1 v2 approved for production. The owner also asked for an analysis of Rick's clips'
  scripts. It's in STUDY.md §7 (the 5 transcripts via ElevenLabs speech-to-text, kept out of the repo):
  - a 15-word paradox opener;
  - "You see," at 4 s;
  - a So/But/Then chain of cause and effect;
  - the question held to ~60–70%, then named;
  - no outro, and an ending that loops.

  Ep 1 is produced as approved. The findings apply from Ep 2, and the "no outro, loop ending" idea is worth testing.
- **23 Nov (critic loop, round 1):** the independent critic scored characters 4, motion 3, light 4, world 4, camera 4,
  captions 5, with 14 of 20 frames failing.
  - **Round 2 fixes motion first:** a camera push on every character shot, and gesture changes and nods on the spoken
    words.
  - **The cheap hard fails in the same pass:**
    - headroom on the close-ups;
    - captions off faces;
    - the phone UI inset and lower (clear of the banner);
    - the counter overlap;
    - the title's empty floor (now a synthwave grid);
    - the game cast sharp (no lens blur in front of a plate), clear of the post and the map;
    - the flat lit "interior" with a stronger TV glow.
  - **The frame-0 banner** is now "6 HOURS TO REPLY / HERE'S WHY". The approved wording overflowed the banner box; the
    meaning is the same.
- **23 Nov (critic loop done):** rounds 2-5 scored about 5 (motion 4) with hard fails 9, 5, 2, 4. The loop stopped at
  the agreed 5-round cap. `_review/scores.md` records what holds each category below 8: the 2D cast rig (two-handed
  holds, body acting, lighting on the cards), sparse interiors, and still plates. Two framing fixes were made after
  round 5, then the cloud 540p preview was requested for the owner.
- **23 Nov (owner, preview run 61: "quite good"):**
  - the walk in the city looked unnatural;
  - the basketball shot looked bad (the hoop wasn't even in the motel plate);
  - in "drive at sunset" Gordon wasn't in a car.

  **Fixed:**
  - our own pink 80s convertible (`ggCar`, ridden like the 1904 car);
  - new side-on Blender plates across the beach road by day and at sunset (`plate_drive`, `plate_drive_sunset`), so
    Gordon drives past in profile;
  - the motel plate re-rendered with the hoop in view, and a `ggBall` arc from his raised hand into the net, then a
    thumbs-up;
  - a new score cut to the new length (53.9 s, `gtagf1_score2`).

  The owner asked to "publish full render". The standing rule holds: the final is rendered with `publish: false`, and
  the owner uploads.
- **23 Nov:** final run 62's built-in QA flagged near-blank frames, which were the plain white phone chat screens, and
  one repeated frame at the end of a wall-picture push. Both were fixed properly rather than explained away: a pastel
  chat wallpaper with doodles (it passes the QA's own near-blank check locally), and longer camera glides on the wall
  pictures. Then the final was re-rendered.
- **23 Nov:** GTA GF Ep 1 is done. Final run 64 passed the full QA (QA run 20) with no flags, and the MP4 is kept in
  the repo. Nothing was uploaded: the owner posts from `publish/PUBLISHING.md`.
- **24 Nov (owner):** new motion targets for every video: almost-still frames about 2.5 %, repeated frames 0.5–1 %, a
  moving camera in 10–30 % of frames. The realistic Blender style should be everywhere and seen from the first frame.
  - **Claude, Ep 2 "The Lucky Shirt":** the outfit trick from the owner's tips transcript (verified, and set mostly in
    the game, so it's Blender from frame 0).
  - **Real life becomes a Blender-rendered flat.**
  - **Camera motion:** wide plates with pans, tilts and zooms from the plate's own lens position, which is exact
    perspective over a flat plate.
  - **No still cards.**
  - **Measured on the preview** with the STUDY.md script before the final.
  - The viewer script awaits approval.
- **24 Nov (owner):** Ep 2 is the owner's concept, "When your boyfriend introduces you to his GTA friends". The
  "Lucky Shirt" draft is kept for later.
  - **Claude's adaptation:**
    - narrator set-ups (the storytelling gate) and the breakfast-pattern hook;
    - two original friends, Tank and Zip, with designed voices;
    - "inside GTA", never "GTA 6 Online" (it isn't out);
    - "rivals" for "enemies" in the last line (proposed; the owner decides).
  - **ElevenLabs to the full:** Voice Design, v3 audio tags, Text to Dialogue, context, a headset effect, sound effects,
    music, and speech-to-text checks. It awaits approval.
- **24 Nov (owner):** GTA is dropped as a niche. Ep 2 (the GTA friends script) is on hold.
  - **Claude's recommendation (`productions/research/next-direction-2026-11-24.md`):** "Everyday Impossible": fictional
    everyday mysteries with one impossible, concrete detail and a fair, logical, usually human answer, plus a loop
    twist.
  - **Why:** it's the One Too Many pattern (85.5 % stayed), uncrowded, endless, loyalty through a solve-it game and a
    shared town (Ashford), and the pipeline needs no rebuild.
  - **The runners-up:** true "why it happened" story-explainers (a big market, but head-on against Rick's clips and
    Zack D), and "Imagine…" POV dilemmas.
  - **The plan:** a 10-video test with one variable per pair. The owner decides.
- **24 Nov (owner):** the channel's direction is "Everyday Impossible". Story #1 is The Friday Pizza, story only, with
  no production until it's approved. The screenplay is in `productions/friday-pizza/screenplay.md`:
  - first person (Maya, 13), in Ashford;
  - the answer is human: the late Mrs Hale prepaid a year of Friday pizzas to her own empty house for the two kids next
    door;
  - six planted clues, the question asked out loud at ~65 %;
  - an ending that mirrors the first line, about 70–75 s.
- **24 Nov (owner):** all rendering is stopped until the core pipeline is refactored to five new standards.
  - **Claude's audit and proposal (`docs/architecture/engine4-proposal.md`):** "Engine 4", opt-in.
    - Blender is the offline set builder and Cycles lightmap baker, exporting glTF.
    - three.js PBR with real lights, character cast shadows, SSAO, fog and dust, and no world ink.
    - A physical camera rig with mm lenses, handheld noise and impact shakes, plus a measured motion gate.
    - Continuous gestures, key poses with overshoot, squash and stretch, attached props.
    - No banners or CTAs, bigger captions, `BigNumber`, auto sound cues, music ducking of 8 dB.
  - **Rejected:** rendering everything in Blender per frame (1.5–4.5 min per frame).
  - Waiting for approval before any code.
- **26 Nov (owner):** documentation only, no code and no renders.
  - **CLAUDE.md:**
    - a permanent "never poll GitHub Actions" rule: give the run URL and stop;
    - the frame-0 banner, intro title cards and end-screen CTAs are removed from the format system (old productions
      are left as they are);
    - Engine 4 pipeline rules: opt-in (`engine: 4`), existing productions never migrated, phased with owner review;
    - the five standards, the Phase 1 guardrails (outlines kept on the characters, ACES and sRGB / linear colour
      management, baked lightmaps plus live lights), the audit gates before Phases 2 and 4, captions at 5-6 % of the
      height, the 3-act story arc with no listicles, and the narration rules;
    - an advertiser-friendly disclaimer in every publishing description.
  - **winning-patterns.md:** the 7-Beat "One-Rule World" framework as the default (not a mandatory template), a
    change every 10-15 s, zero flashbacks, and the narration rules.
  - **Open point for the owner:** the Friday Pizza screenplay has two short memory flashbacks, which conflicts with the
    zero-flashback rule. The screenplay is not yet approved, so it needs one decision.

- **26 Nov 2026: Engine 4 Phase 1 built (Maya's kitchen); stopped for the owner's review.**
  - **Pipeline:** `blender/sets/kitchen.py` builds the room (Poly Haven CC0 textures fetched by `assets_fetch.py` into the
    git-ignored `blender/sets/assets/`; bevelled cabinets and worktops; kettle, toaster, cutting board with oranges and
    knife, mugs, cereal bowl and box, fridge magnets and drawing), bakes the INDIRECT light only (Cycles, window area light
    + pendant spot light, no OIDN: a mask-aware blur) into a 16-bit EXR lightmap on a second UV set, and exports a GLB.
    Both files live in `animation-studio/public/e4/kitchen/`.
  - **Engine (all opt-in):** `engine: 4` in a storyboard -> `Timeline.engine4` -> StudioFilm uses N8AO, no InkPass, ACES
    filmic and no stylised grade. A set may carry `BuiltSet.e4` (window light in the sun slot, fog, hemisphere, dust, a card
    tint); `CardLayer.render` has an optional tint callback. Sets and stories without them are untouched (checked by
    `npm run test:library` and a re-render of the breakfast-2 baseline frames).
  - **Why a spot light for the lamp:** the card depth material casts real shadows for directional and spot lights, not
    point lights. **Why `lightMapIntensity = pi`:** Blender bakes E/pi; three multiplies the lightmap by albedo/pi.
  - **Honest limits:** a card seen nearly edge-on to a light throws a thin shadow; characters are the existing Mum and Bug
    (the Friday Pizza cast isn't drawn yet); the three stills are the test frames only, no renders beyond them.

- **27 Nov 2026: Engine 4 polish + Phase 2 (camera system) built; stopped for the owner's review of the 5 s clip.**
  - **Polish (commit acab8c0):** the house silhouette and lit windows outside the window are gone (clean dusk gradient); dust
    motes halved (size 0.012 -> 0.006, opacity 0.4 -> 0.2); an invisible capsule (0.17 m radius, 1.7 m) in every character
    card casts a body-shaped shadow from any light angle (colour and depth writes off, shadow pass only).
  - **Audit gate (cited before any edit):** `camera/keys.ts` (key lists, `runKeys`, glides, `pushK`, `dolly`, `kickAt`/`withKick`
    7-frame impact kicks, `flyPath`), `camera/moves.ts` (`plan()`: view, frame, pushIn, closeUp, overShoulder, orbit, crane, follow,
    dutch, aim; `DOF_BY_SIZE`), `camera/framing.ts` (`fitShot`); consumers `story/compile.ts` (`moveOf`, beats -> keys, `kicks`),
    `scene/SetWorld.ts` (poses the camera each frame, shutter), `look/StudioFilm.tsx` (lens blur / motion blur from `cInf` + focus).
  - **Phase 2 additions (all opt-in):** `engine4/camera.ts` (lens in mm -> fov and blur; deterministic hand-held drift, applied by
    SetWorld only for sets with `e4`), a new `truck` move, optional `fov` / `cInf` on `frame` and `closeUp`, `engine4/pacing.ts`
    (visual-change rhythm target 1.5-2.0 s, flat card / graphic hold max 2.5 s; runs in `validate` only when `engine: 4`),
    `npm run e4-pace -- <id>` (analytic camera metrics) and `scripts/e4_motion_check.py` (rendered-pixel metrics). Orbit, crane
    and over-the-shoulder already existed. Impact shakes reuse `kicks` (7 frames, inside 5-10).
  - **Two bugs found by the test clip:** (1) the room was only 4.2 m deep, so a 24 mm wide or 85 mm shot put the camera behind the
    front wall (black frames): the room's front wall moved from z 1.8 to 3.6 (rebaked; `e4-pace` now fails any camera outside the
    room); (2) N8AO placed before the lens passes replaced the depth buffer the lens blur reads, defocusing the subject: AO now runs
    after the lens passes.

- **27 Nov 2026: Engine 4 Phase 3 (character acting and background life) built; stopped for the owner's review of the 5 s clip.**
  - **Where:** `characters/acting.ts` (`easeSnap`, `E4Key`, `e4Track`), `characters/figure.ts` (Pose fields `e4`, `turn`, `brow`, `propTilt`;
    brow acting in `faceFront3`; a blend that may overshoot; the held item turns about the hand), `story/compile.ts` (ActorSpec.keys ->
    the pose, eased gesture blends, squash on the card), `cards/cards.ts` (`Place.squash`, volume-kept scale about the soles),
    `engine4/kitchen.ts` (pendant flicker, kettle steam, window cloud-light, drifting dust).
  - **Opt-in:** every new field is read only when `engine: 4` and the actor has `keys`; engines 1-3 take the old paths (breakfast-2
    baseline frames pixel-identical, `test:library` intact, the 3 caption PROBLEM lines in `test:story` predate this).
  - **Design choices:** squash and stretch is a card-level scale (the figure is a 2D drawing, not a skeleton); "bone" attachment means the
    held item is drawn in the hand's own frame, turned with the forearm and the hand's momentum; faces still swap discretely a third of the
    way into a move (the body eases continuously); a full-body lean toward the camera is not drawable on a 2D card, so lean = sideways tilt
    and slump = lowered shoulders + head + a lower card.

- **27 Nov 2026: Engine 4 Phase 4 (audio, literal SFX, mobile format) built; stopped for the owner's review of the 15 s template.**
  - **Audit gate (cited before any edit):** audio `sound/cues.ts` (`soundPlan`: cues from the picture), `sound/catalog.ts` (SFX names),
    `scripts/sound.ts` (plan -> job JSON), `sound/build.py` (mix: `duck_curve` under every word, SFX placement, mastering), recorded
    samples `sound/samples.py` + `sound/samples_fetch.py` (ElevenLabs); captions `story/Captions.tsx` (render), `story/caption-timing.ts`
    (groups), `story/caption-place.ts` (face-avoiding height), `story/Short.tsx` (wiring); narration `scripts/voice.ts` + `story/timing.ts`.
  - **Word-level SFX:** `sound/lexicon.ts` maps concrete nouns and actions to sounds on the word's own timestamp (only for `engine: 4`);
    custom files `assets/sfx/<name>.mp3|wav` (made with `python3 sound/sfx_fetch.py`, ElevenLabs) load in `sound/build.py` and win over a
    catalogue sound of the same name. **Ducking:** a `duck` plan (-8 dB total under dialogue punchlines (`Line.punch`) and major SFX
    hits) is applied by `apply_duck`; storyboards without it get the old math (breakfast-2 rebuilt byte-identical).
  - **Viral captions:** `captionStyle: "viral"`: 106 px (5.5 % of 1920), stroke 0.2 x size plus a hard shadow, centred at 66 % height,
    1-3 words (13 chars), key nouns in yellow / cyan / pink (lexicon keys + `captionKeys`). **3D numbers:** prop `e4Number` (extruded
    Helvetiker bold, PBR, casts a shadow, pops in with the snap easing). **Clean frame:** `validate` errors on any title card / banner and
    on a long end CTA for engine 4.
  - **Two fixes the template exposed:** an import cycle (a theme module imported the character library: easing moved to `engine4/ease.ts`);
    the 3D number first stood on the counter outside the lamp's cone (unlit): it stands on the table under the lamp.

- **27 Nov 2026: Engine 4 Phase 5 gate: audio and narration upgrades built, script and prop list written; stopped for the owner's approval.**
  - **Continuous narration** (`narration: "continuous"`, engine 4 only): `story/timing.ts` joins every narrator line into ONE track (`masterText`,
    one ElevenLabs request), each shot's lines are slices of it, the cuts fall just before their first words, `pauses` become 0.25 s cuts in
    the one track (the beat before a reveal). Mixer: the file is placed once (`Placed.shared`). Mum / other voices cannot be in a continuous film.
  - **Music:** `assets/music/morning-mood.mp3` = Wikimedia Commons `Musopen - Morning.ogg` (Grieg, Musopen Symphony Orchestra), Public domain
    (the original upload.wikimedia.org file URL was rate-limited (429); the Commons mp3 transcode downloaded). `music.cuts`: hard cut to silence
    (15 ms fades) at a word, an optional `sub_hit`, optional resume. **Grounded SFX:** lexicon rewritten (kitchen / comedy / tension only);
    `isGrounded` strips crowd, stadium, gasp, scream, siren, weapon sounds from every engine 4 cue list unless `crowdSfx: true`.
  - **Dual export:** `sound/build.py` masters a second file without the music (`audio/Short-<id>.nomusic.mp3`); `scripts/dual-export.mjs` muxes both
    videos. Legacy check: breakfast-2's soundtrack rebuilt byte-identical.
  - **Story:** `productions/in-my-world-1/script.md` (85 s, 229 words, 44 word-level SFX, 56 visual changes). Props proposed, not built.

- **27 Nov 2026: Leo's voice locked; the Phase 5 story replaced (Option 2, 3D Number Luck World); stopped for the owner's script approval.**
  - **Voices** (`voice/voices.ts`): `leo` = ElevenLabs "Leo (Voice for my animated videos)" id `7g0kmMsyK30rO4fU1Sli` (found with GET /v1/voices; stability 0.38,
    style 0.20, speed 1.06, similarity 0.75, speaker boost), `e4Mum` = Kathie - Sassy & Playful (`o9B86nZP8mMLaT5FBEzP`), `e4Rival` = VALF - Child, Young, Playful & Sarcastic
    (`loY1uopAz31XyhAEhNSa`; Cat - Droll and Dry was auditioned and dropped: Dex is a boy).
  - **Continuous narration generalised to dialogue:** consecutive same-voice lines form a run, one generation per run (`story/timing.ts runsOf`); a back-and-forth is
    one run per turn, butted with the natural breath. Engine 4 talking hands stay at the chest (point / present / shrug become "talk": they swung out of close-ups).
  - **Story `in-my-world-2`** (66 s, 197 words, Leo / Mum / Dex): per-story `wordSfxMap` (numbers are not clock times; "nine" is the chime), music cut on the SECOND "Pool." (Beat 5),
    back on "nine". The first story (`in-my-world-1`, the toast) is superseded and kept only as history.

- **27 Nov 2026: Episode 1 built (props, headstand, Dex, viral SFX pack); stopped for the owner's final go.**
  - **Headstand:** `E4Key.flip` (0..1) turns the whole card about a point 0.9 m up its body (`cards/cards.ts`: position = base + c (sin th X + (1 - cos th) Y)); anchors follow
    (`flipAnchor` in `story/compile.ts`); the shadow capsule turns with the card; the arms go to "cheer" (hands planted).
  - **Luck numbers:** PropSpec `hover: { who, lift, side }` + `PropRig.update({ target, up, hover })`; `e4Number` floats over the crown along the body's up; upside down it slides beside the head
    (never into the floor) and turns with the actor, so Leo's 6 reads as a 9. Colours: 6 and 9 gold, 7 cyan, 8 pink. **Plate:** `bfPlate` variant `one` (one pancake that lifts off on its step).
  - **Dex** = own look in `themes/e4` (fair, spiky ginger hair, teal tee, raised brow), not Noah. **Viral pack:** `assets/sfx/viral/` (22 files) wins over generic sounds; levels and trims in
    `sound/build.py`; every `viral_*` cue is a "major" hit (music -8 dB); `SfxSpec.delay` plays a voiced clip after the word, not over it. Balance measured: every SFX peak is at least 9 dB below the loudest voice.
  - **Validation:** hover props skip the footprint and in-frame checks (they follow an actor); `bfPlate` is no longer mistaken for a flat card in the pacing check.

- **27 Nov 2026 — Episode 1 headstand/number/hoodie fixes (owner review of the 5 s test).** Reason: the test clip showed levitating headstands, Dex hidden by the chair, a cropped 8, a 9 over Mum, and Leo in a suit.
  - **Grounded:** the card turns about half its own crown height (Leo 1.31, Dex 1.28, Mum 1.74), so heads and hands rest on the floor.
  - **Blocking:** Mum -1.95, Leo -1.1, Dex -0.3 (clear of the far chair); numbers sit beside the head, slightly toward the camera; closeUps take a `top` margin so numbers are never cropped; low cameras 26 mm.
  - **Leo** is now `leoHoodie` (red hoodie, pouch, drawstrings) as a new roster key, so One Too Many is untouched. 29 shots have authored key poses.
  - **Audio locked:** both masters are the owner-approved files (scored 5758dc37…, no-music 0be490f0…). The mp3 encoder is not byte-reproducible, so the rebuilt mp3s were discarded; only the soundtrack fingerprint JSON was refreshed. Do not rebuild them.
  - **Checked:** tsc, e4-pace (0 errors), library test intact, breakfast-2 frames 60/700 identical, preflight PASS.

- **27 Nov 2026 — Episode 1 cinematography upgrade (owner review of the 540p preview).** Audio masters stay locked (same hashes; only the soundtrack fingerprint JSON is refreshed).
  - **Staging:** a triangle round the table: Leo (-1.05, 0.2), Dex (1.4, -0.45) by the fridge, Mum (-1.75, -1.25) by the counter. Three-actor wides need 10-12 mm lenses from the front corners (the 3.2 m spread in a 4.3 m room).
  - **Cameras:** `view()` frames one actor with the eyes at about 44 % from the top, the full face and a small number in frame; `LOW` (knee height, looking up) for Dex's 8 and Mum's 7, `HIGH` (looking down) for Leo's 6, an over-the-shoulder behind Leo (a vertical frame can only fit a sliver of the foreground actor at 1 m, so the camera sits about 1.2 m behind and 0.4 m to the side), `at` cameras with `roll` for the Dutch tilt, `swoop` for snap-zooms. Plan table `PLAN` in `in-my-world-2.ts`.
  - **Numbers:** tight shots use scale 0.45 and lift 0.28 (about 40 % smaller); wides keep 0.8. Leo's number is hidden in Beat 4 (shots 10-13) and pops back on "Leo?", so the 6 first flips to a 9 in Beat 6.
  - **Night:** `light: "night"` on e4Kitchen (Beat 2): the window sky goes navy, the baked bounce is dimmed to 30 %, the pendant lamp stronger. `e4.apply` now receives the shot's light.
  - **Hand-held:** drift amplitude 2.2 x the old default for every Engine 4 shot (engines 1-3 untouched).
  - **Pacing:** 44 visual changes, 1.51 s average. **Inserts:** pancake macro (shots 6, 16, 24), floor-level hands (shot 19).
  - **Sound:** the owner allows myinstants.com sound effects for future productions; nothing changes in this film's audio.
- **27 Nov 2026 — three polish fixes.** (1) OTS camera behind Leo moved to z 0.75 so Leo is a left-edge sliver (about 15-20 %). (2) The e4 kitchen window is a bright warm morning window by default (flat pale sky, no dusk gradient); only `light: "night"` shots (2-4) keep the navy night sky. (3) Viral captions sit at 72 % height (chest, not chin); in a headstand shot (any actor flipped) they move to 27 %. Audio masters unchanged (same hashes). The owner then gave the "go" for the 540p preview.
- **27 Nov 2026 — caption fix, publishing copy, final render.** The "any actor flipped" test leaked the 27 % caption height onto upright shots (an upside-down actor off camera). `Storyboard.captionHigh` now lists the headstand-camera shots explicitly (9, 10, 11, 18, 19, 21, 24-27); every other shot stays at 72 %. `publish/PUBLISHING.md` written (disclaimer word for word, IG 5 hashtags). Final render requested: `preview: false`, 20 chunks, `publish: false`. The render workflow outputs the scored film only; the no-music cut is the same picture muxed with the `.nomusic.mp3` master by `scripts/dual-export.mjs` after the render.

- **28 Nov 2026 — Episode 2 (kd-talent-1), Phase A.** (1) **Sets are procedural three.js (no Blender bake):** both are open or large rooms where a baked lightmap adds little; live sun / spot lights, fog, rain and light shafts give the Engine 4 look, and two lighting states per set come from the shot's `light` (court: day / night = 5 AM rain; arena: interior = game, interiorCool = tunnel). The set builders are Node-safe (`engine4/tex.ts`). (2) **Voices:** KD = Brian (calm, deep, speed 0.94), Coach = Adam (gruff, urgent, speed 1.12), both existing library voices. (3) **Music:** a royalty-free Eleven Music score written to the generated timings (public-domain tracks could not be fetched: Commons rate-limited the proxy). (4) **SFX:** five myinstants.com clips added to the viral pack (sheesh, vine boom, airhorn, bruh, kobe) and nine grounded ElevenLabs basketball sounds plus four ambience beds. (5) **Length flag:** the owner's script is about 580 words = 3:21 at his voice settings (target was 2:15-2:30); reported, not trimmed. (6) Additive engine changes only: `Look.jersey` (figure.ts), `FLAT_PROP` excludes signedBasketball, `e4-pace` room check covers the new sets, `e4.apply` already receives the light.
- **28 Nov 2026 — Episode 2 music and length (owner's two mandatory fixes).** (1) **Morning Mood is the permanent Engine 4 signature score**; the Eleven Music score for kd-talent-1 was deleted. Only the sad piano cue (`kdtalent1_piano`) is generated, as the owner allowed. Morning Mood is 3:49 and the film 2:28, so it plays straight through (no loop needed). (2) **Where the owner's two music instructions disagreed** (hard-cut at "Five seconds left." vs. the later "Music adjustment"), the later, more specific one was built: Morning Mood Beats 1-6, piano from "My arms felt heavy" to the buzzer, dead silence + sub-bass hit on "The buzzer sounded", Morning Mood back on "Swish." from its sunrise climax (file 0:42, 1.8 s swell). Say if "Five seconds left." should also cut. (3) **Script:** the owner's tightened text, word for word: 148 s (2:28). (4) New engine knobs (additive, Engine 4 recorded scores only): `MusicCut.jump` / `swell` and `music.layers` (a second track over a span, the score muted under it). (5) The shoulder lift uses `mode: "sit"` for Leo behind KD's head; the contact sheet has 7 tiles (the scoreboard is tile 7).
- **28 Nov 2026 — Episode 2 naming.** "Kevin Durant" in Beats 1-5 (five spoken mentions: hero, signed the ball, shook his hand, words stayed, missing everything), "KD" from Beat 6 on; the TV chyron reads "KEVIN DURANT: 0-12 - CAREER OVER?" (type set at 44 px to fit). Only the two voice runs that contained the changed words were regenerated; the masters were rebuilt: 148.7 s (2:29).
- **28 Nov 2026 — Episode 2 shot list and the realism pass.** (1) **Shot list written** (`stories/kd-talent-1.ts`: 87 camera beats over 148.7 s, a cut every ~1.7 s; word-anchored cuts; inserts for the four hero props on their spoken words; bird's-eye, low and high angles). It changes nothing in the audio: the rebuilt cue sheet is identical to the locked one, so the locked masters were restored byte-for-byte and only the fingerprint JSON changed (do not rebuild the mp3s). One auto cue (`boing` from a jump pose) was removed by dropping the jump pose. (2) **The owner then asked for a realism pass before any render; the 540p preview was therefore NOT triggered.** (3) **Realism:** `engine4/hoop.ts` (plexiglass board with a clear coat, dark steel frame, white border and shooter's square, bottom padding, metallic orange rim with flange and bracket, diamond-mesh tapered net) on both sets; varnished hardwood (clear-coat physical material, plank joints); weathered asphalt (2048 px, grit, oil stains, cracks, bump map, crisp key / free-throw / three-point lines); the arena stands were never built behind the hoop (the call sat inside a comment): now 13 tiers on three sides with about 900 instanced fans, camera flashes, house lights on the stands, hanging banners, an LED ribbon, a higher roof. (4) **Jerseys:** chest graphics are canvas text (bold Impact / Arial Black stack, white with a dark outline, fitted to the torso with a margin): "OKC" over the number on the Thunder kit (orange V collar and arm bands), the number alone on the defenders; the 7-segment digits and the wordmark that clipped are gone. This is a stylised Thunder-style kit (no official logo artwork). (5) KD's goatee is bigger and he has a thin moustache; skin a shade lighter so the beard reads. (6) Shoulder lift: Leo seated in FRONT of KD's head (hips at KD's crown), legs at his shoulders, KD's face clear.

- **28 Nov 2026 — Episode 2 preview requested.** The owner approved the realism pass; `render-request.json` = Short-kd-talent-1, preview true, 20 chunks, publish false. The locked masters (eec89324 / 969852de) were untouched.

- **28 Nov 2026 — Episode 2 Motion Pass (owner request).** Built a procedural basketball motion system (`engine4/motion.ts`: crossover, bite, pull-up swish, brick, dunk, whip, catch, shake; easeOutQuad/easeInOutCubic/easeOutBack only) plus a game-ball prop (`engine4/ball.ts`) that is parented to the hand and flies in real parabolas with a net ripple; complete court markings on both courts; new micro-sets (stands, Leo's bedroom with the 5:00 AM clock and TV, Thunder front office), a Q1-Q3 montage with a stat graphic, and the dad character. Because continuous narration can't use `until`/`cont`, split shots are slices of the same run text, so the voice cache is unchanged (0 new lines). The walk-on is a dribble drive (a `walk` adds step cues and would change the locked cue sheet). Fixed Leo's "I can't!" face (nervous) and the tunnel overlap (KD seated on the bench, Leo shifted right). Validator extension: the prop-in-frame check follows a ball plan's real position (it was reading the base position). Locked masters untouched (eec89324… / 969852de…); cue sheet identical.

- **28 Nov 2026 — Episode 2 preview fixes (owner's 540p notes).** Court kids moved out of Leo's lines of sight (0:11, 0:24, 0:50, dunk); crossover defender #61 moved 1.2 m off KD's path; tunnel KD moved off Leo's line; stands: an open aisle in the right crowd (no spectator blocks in front of Leo); bedroom cameras lowered so the face sits upper-middle, and the wide shot pans right to the 5:00 AM clock; tunnel bench filmed from its front (east) side with Leo beside KD and the signed ball handed between them; swish and dunk cuts show the ball through the net and Leo's slam; the Q1-Q3 shot is now a dunk plus the LEO: 30 PTS | Q3 graphic; lightning switches off at "tingled" (signed-ball step 3); "I can't!" is scared + sweat with the keepFace/sadTalk mouth (engine fix: keepFace now keeps the keyed face while speaking, Engine 4 only); "Next day" Leo is proud; the shoulder lift moved to mid-court away from the backboard with a lower, wider frame. Locked masters untouched; cue sheet identical.

- **28 Nov 2026 — Episode 2 final render approved by the owner.** Last two touches: the defender (#61) now stands in front of KD (between him and the hoop) before the crossover; the ending shows a gold coin flipping high in the air on "Dex won the coin toss" (new `coinToss` prop on a ball plan, caught by Dex before he points). Locked masters untouched; cue sheet identical. `render-request.json` = Short-kd-talent-1, full resolution (preview false), 20 chunks, publish false; the QA run follows only when the owner asks.
