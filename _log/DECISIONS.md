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
