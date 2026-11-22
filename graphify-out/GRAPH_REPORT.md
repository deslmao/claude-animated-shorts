# Graph Report - src  (2026-11-22)

## Corpus Check
- 171 files · ~418,903 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: (none) 1)

## Summary
- 2983 nodes · 8859 edges · 83 communities (81 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 677 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- bridge / toon
- story / timing
- extradoor / index
- bridge / story
- onetoomany / index
- materials / paint
- story / compile
- sound / cues
- bridge / cast
- props / interior
- lockedout / index
- props / outdoor
- fx / diagrams
- ollie / index
- bridge / world
- race1904 / index
- bridge / paint
- cards / cards
- stories / stop-time-1
- nova / index
- otherjamie / index
- timestop / index
- bridge / build
- camera / keys
- story / caption-timing
- onetoomany / index (2)
- checks / SetTour
- nightshift / index
- look / ink
- characters / figure
- stories / empty-seat
- stories / nova-commands
- characters / toon
- stories / other-jamie
- whalecity / index
- stories / locked-out-keys
- pirates / index
- stories / ollie-2
- nighttrain / index
- cards / cards (2)
- stories / one-too-many
- stories / whale-city
- breakfast / index
- characters / cast
- characters / toon (2)
- stories / ollie-1
- memory / index
- helpers / layout
- stories / breakfast-text
- stories / locked-out
- stories / night-train
- story / types
- stories / float-away
- stories / memory-money
- emptyseat / index
- steps / index
- characters / acting
- stories / locked-out-climax
- futuretext / index
- floataway / index
- look / cardshade
- props / documents
- stories / steps-4012
- characters / toon (3)
- bridge / Bridge
- stories / night-shift
- look / lensblur
- look / grade
- stories / one-too-many-thumbs
- bridge / build (2)
- bridge / grade
- everylie / index
- bridge / lensblur
- stories / extra-door-2
- bridge / ink
- emptyseat / index (2)
- bridge / story (2)
- stories / every-lie
- stories / ollie-roof-test
- emptyseat / index (3)
- sets / floor
- bridge / build (3)
- bridge / lensblur (2)

## God Nodes (most connected - your core abstractions)
1. `col()` - 220 edges
2. `box()` - 165 edges
3. `frame()` - 164 edges
4. `cyl()` - 112 edges
5. `Batch` - 92 edges
6. `sph()` - 83 edges
7. `rbox()` - 74 edges
8. `glow()` - 73 edges
9. `tex()` - 71 edges
10. `ctex()` - 59 edges

## Surprising Connections (you probably didn't know these)
- `SHORTS` --calls--> `makeShort()`  [EXTRACTED]
  Root.tsx → studio/story/Short.tsx
- `makeWorld()` --calls--> `dofAt()`  [EXTRACTED]
  studio/checks/LookCheck.tsx → videos/bridge/story.ts
- `Phone()` --calls--> `roundedRect()`  [EXTRACTED]
  Phone.tsx → helpers/rounded-rectangle.ts
- `RemotionRoot()` --calls--> `getMediaMetadata()`  [EXTRACTED]
  Root.tsx → helpers/get-media-metadata.ts
- `RoundedBox()` --calls--> `roundedRect()`  [EXTRACTED]
  RoundedBox.tsx → helpers/rounded-rectangle.ts

## Import Cycles
- None detected.

## Communities (83 total, 2 thin omitted)

### Community 0 - "bridge / toon"
Cohesion: 0.06
Nodes (73): creakFx(), puddle(), snapFx(), splashFx(), Arms, Blob, blobPts(), bodyFront() (+65 more)

### Community 1 - "story / timing"
Cohesion: 0.05
Nodes (50): N_breakfast_text, N_buried_treasure, N_doorway_effect, N_empty_seat, N_every_lie, N_extra_door_2, N_extra_door, N_float_away (+42 more)

### Community 2 - "extradoor / index"
Cohesion: 0.06
Nodes (74): ceilingHD(), BASE, basic(), cardShadowTex(), choiceLabelRig(), choiceLabelStatic(), choiceStateRig(), clamp01() (+66 more)

### Community 3 - "bridge / story"
Cohesion: 0.06
Nodes (74): ANCHOR, boots(), Cam, camAt(), CAMS, COUNT, CRANE, Crowd (+66 more)

### Community 4 - "onetoomany / index"
Cohesion: 0.12
Nodes (69): Batch, quadUp(), floorMat(), box(), glow(), sph(), tex(), streetLamp() (+61 more)

### Community 5 - "materials / paint"
Cohesion: 0.09
Nodes (69): asphaltHD(), booksHD(), ceilingTilesHD(), chalkboardHD(), checkerHD(), concreteHD(), dirtHD(), floorboardsHD() (+61 more)

### Community 6 - "story / compile"
Cohesion: 0.07
Nodes (68): flyPath(), runKeys(), cardPoint(), Anchors, anchorsFront(), fxHalo(), HALO_KINDS, PROPS (+60 more)

### Community 7 - "sound / cues"
Cohesion: 0.04
Nodes (61): CAST, ACT_NAMES, FACES, GESTURES, Look, ITEM_NAMES, ItemEntry, ITEMS (+53 more)

### Community 8 - "bridge / cast"
Cohesion: 0.06
Nodes (70): BARE, blank, blob(), BODY, CamInfo, CARD, CHEER, column() (+62 more)

### Community 9 - "props / interior"
Cohesion: 0.12
Nodes (65): parchmentStatic(), armchair(), board(), bookshelf(), chair(), clock(), coffeeTable(), counter() (+57 more)

### Community 10 - "lockedout / index"
Cohesion: 0.08
Nodes (61): ALDER_SPOTS, ALDER_VIEWS, blueTex(), brickTex(), cardMat(), cashItem(), curtainTex(), door9Build() (+53 more)

### Community 11 - "props / outdoor"
Cohesion: 0.08
Nodes (55): twoTone(), boxGeo(), f32(), lam(), mats, quad(), tri(), V() (+47 more)

### Community 12 - "fx / diagrams"
Cohesion: 0.10
Nodes (50): fxCreak(), arrow(), ask(), bang(), bigMeter(), body(), brain(), chains() (+42 more)

### Community 13 - "ollie / index"
Cohesion: 0.06
Nodes (50): AVA, AVA_SPOTS, AVA_VIEWS, brickTex(), bubble(), calendarTex(), carpetTex(), copingTex() (+42 more)

### Community 14 - "bridge / world"
Cohesion: 0.06
Nodes (36): makeWorld(), Ray, blobMaterial(), CARD_K, cardShade(), GRAD_K, GRAD_KB, TINT_K (+28 more)

### Community 15 - "race1904 / index"
Cohesion: 0.07
Nodes (49): rng(), displayTextOk(), face(), faceMat(), scoreBoard(), signBoard(), textTexture(), textures (+41 more)

### Community 16 - "bridge / paint"
Cohesion: 0.10
Nodes (50): flagTex(), roofMat(), beam(), beamHD(), bed(), blotch(), brick(), brickCol() (+42 more)

### Community 17 - "cards / cards"
Cohesion: 0.07
Nodes (22): kickAt(), meanView(), withKick(), Actor, CardLayer, makeEntry(), Pool, contactShadow() (+14 more)

### Community 18 - "stories / stop-time-1"
Cohesion: 0.04
Nodes (31): BULLET, BULLET_P, CARD, CARD_CAM, CARD_IN, CLASS, CLINIC, COOL (+23 more)

### Community 19 - "nova / index"
Cohesion: 0.06
Nodes (42): asphaltTex(), BLUE_KID, BLUE_MAN, BLUE_WOMAN, DAD, dadFace(), F(), facadeTex() (+34 more)

### Community 20 - "otherjamie / index"
Cohesion: 0.10
Nodes (45): AW_SPOTS, AW_VIEWS, beamRig(), BROTHER, card(), carRig(), cctvRig(), cctvTex() (+37 more)

### Community 21 - "timestop / index"
Cohesion: 0.06
Nodes (42): blob(), bulletRig(), choiceRig(), choiceTex(), CLINIC_SPOTS, CLINIC_VIEWS, DEX, DOC (+34 more)

### Community 22 - "bridge / build"
Cohesion: 0.08
Nodes (41): addVeg(), BANNER_COL, bannerGeo(), bannerProp(), bannerTex(), barkMat(), Batch, boxes (+33 more)

### Community 23 - "camera / keys"
Cohesion: 0.08
Nodes (39): FitOpts, fitShot(), ShotSize, SIZE, Cam, camOf(), clamp01(), dolly() (+31 more)

### Community 24 - "story / caption-timing"
Cohesion: 0.09
Nodes (31): getMediaMetadata(), DOOR_QA, RemotionRoot(), SHORTS, CastTest(), CASTTEST_FRAMES, SHEET_H, SHEET_W (+23 more)

### Community 25 - "onetoomany / index (2)"
Cohesion: 0.10
Nodes (40): ASH_SPOTS, ASH_VIEWS, assemblyTex(), bellLabelTex(), brickTex(), cardMat(), CAROL, ceilingSmokeRig() (+32 more)

### Community 26 - "checks / SetTour"
Cohesion: 0.09
Nodes (32): Key, ActorAnchor, Stage, defOf(), modeOf(), setId(), SetTour(), tourShots() (+24 more)

### Community 27 - "nightshift / index"
Cohesion: 0.14
Nodes (39): col(), bookStack(), homeworkPaper(), shades(), snapChairStatic(), washingLineStatic(), groundBrickParts(), B() (+31 more)

### Community 28 - "look / ink"
Cohesion: 0.07
Nodes (26): gradeFor(), CULL_NEAR, DEF, InkOptions, InkPass, NOINK, noInkFallback(), ga (+18 more)

### Community 29 - "characters / figure"
Cohesion: 0.10
Nodes (36): ACTS, ArmDef, BUILDS, CARRY, dropPts(), Eye3, eye3(), FaceDef (+28 more)

### Community 30 - "stories / empty-seat"
Cohesion: 0.06
Nodes (31): AT_DOORS, AT_HALE, BACK, BUS, Cam, CARD, CARD_CAM, cast (+23 more)

### Community 31 - "stories / nova-commands"
Cohesion: 0.05
Nodes (28): BLANK, CARD, CARD_CAM, CARD_IN, COOL, DAY, FREE, glide() (+20 more)

### Community 32 - "characters / toon"
Cohesion: 0.19
Nodes (30): armColOf(), cutCap(), figureFront(), figureSide(), hairBack(), hairBackView(), hairFront(), hat3() (+22 more)

### Community 33 - "stories / other-jamie"
Cohesion: 0.05
Nodes (29): at(), BENCH, CAST, CCTV, CCTV_CAM, CCTV_LOOK, DAWN, DUSK (+21 more)

### Community 34 - "whalecity / index"
Cohesion: 0.10
Nodes (36): babyItem(), backY(), blowholeRig(), BODY, EYE, eyeRig(), FISHER, flankX() (+28 more)

### Community 35 - "stories / locked-out-keys"
Cohesion: 0.09
Nodes (20): BURIEDTREASURE, CAMERA_KIT, CAPABILITIES, DOORWAYEFFECT, INK_ORBIT, DOOR, LOCKED_OUT_KEYS, VAN (+12 more)

### Community 36 - "pirates / index"
Cohesion: 0.09
Nodes (35): metal(), GOLDS, anchor(), cannon(), CAPTAIN, chest(), countingDesk(), DECK_LAYOUT (+27 more)

### Community 37 - "stories / ollie-2"
Cohesion: 0.06
Nodes (21): AVA_BED, BENCH_AVA, BENCH_KATE, CARD, CARD_CAM, DAY, DAYINS, DEEP_AVA (+13 more)

### Community 38 - "nighttrain / index"
Cohesion: 0.10
Nodes (29): BAYS, choiceRig(), choiceTex(), dripsRig(), F(), flickerRig(), fogTex(), I0 (+21 more)

### Community 39 - "cards / cards (2)"
Cohesion: 0.09
Nodes (28): blank, BODY, CamInfo, CARD, cardKey(), cardOpts(), Entry, Fx (+20 more)

### Community 40 - "stories / one-too-many"
Cohesion: 0.07
Nodes (28): ASSEMBLY, atCam(), BELL_STEPS, BLUE, CAROL_AT, cast, class7C(), class7FIRE() (+20 more)

### Community 41 - "stories / whale-city"
Cohesion: 0.06
Nodes (26): atCam(), BELL, cast, CROWD, DAWN, DAY, EYE, FOUNTAIN (+18 more)

### Community 42 - "breakfast / index"
Cohesion: 0.10
Nodes (27): BREAKFAST_THEME, BUG, choiceRig(), choiceTex(), DOOR, dreadRig(), dreadTex(), F() (+19 more)

### Community 43 - "characters / cast"
Cohesion: 0.10
Nodes (27): crowd(), extra(), GUS, HAIRC, JUNO, JUNO_OUT, MILO, MOD_TOPS (+19 more)

### Community 44 - "characters / toon (2)"
Cohesion: 0.09
Nodes (28): ik(), visor3(), Arms, Build, BUILD, C3, clamp(), Expr (+20 more)

### Community 45 - "stories / ollie-1"
Cohesion: 0.06
Nodes (19): AVA_KATEROOM, BENCH_AVA, BENCH_OLLIE, CARD, CARD_CAM, COOL, DAY, DEEP_OLLIE (+11 more)

### Community 46 - "memory / index"
Cohesion: 0.09
Nodes (28): adRig(), adTex(), blob(), boardTex(), BROKER, F(), Ins, insertRig() (+20 more)

### Community 47 - "helpers / layout"
Cohesion: 0.11
Nodes (18): MediabunnyMetadata, CAMERA_DISTANCE, getPhoneHeight(), getPhoneLayout(), getPhoneWidth(), Layout, PHONE_CURVE_SEGMENTS, PHONE_SHININESS (+10 more)

### Community 48 - "stories / breakfast-text"
Cohesion: 0.07
Nodes (20): BREAKFAST_TEXT, BUG_SEAT, BUG_STAND, CARD, CARD_CAM, CARD_IN, door(), glide() (+12 more)

### Community 49 - "stories / locked-out"
Cohesion: 0.07
Nodes (26): at(), B2, BAY, BRICK, cam(), DOOR, E, hands() (+18 more)

### Community 50 - "stories / night-train"
Cohesion: 0.07
Nodes (17): Cam, CARD, CARD_CAM, CARD_IN, DARK, glide(), insert(), LIT (+9 more)

### Community 51 - "story / types"
Cohesion: 0.09
Nodes (25): Era, Act, Mode, BACK, DOOR, EXTRADOOR, FINAL, START (+17 more)

### Community 52 - "stories / float-away"
Cohesion: 0.08
Nodes (25): ASSIST, BENCHM, CAFE, FAN1, FAN2, FAN3, FLOATAWAY, GK (+17 more)

### Community 53 - "stories / memory-money"
Cohesion: 0.07
Nodes (16): CARD, CARD_CAM, CARD_IN, FLAT, glide(), insert(), KAI_STEP, LUMI_STEP (+8 more)

### Community 54 - "emptyseat / index"
Cohesion: 0.10
Nodes (23): arm(), BUS_SPOTS, BUS_VIEWS, busSide(), doorsRig(), EMPTYSEAT_THEME, F(), HALE (+15 more)

### Community 55 - "steps / index"
Cohesion: 0.11
Nodes (23): biscuit(), boards(), F(), insertRig(), INSERTS, PATH, paw(), pawTex() (+15 more)

### Community 56 - "characters / acting"
Cohesion: 0.14
Nodes (23): hash(), lidAt(), blend(), faceToward(), idle(), layer(), nod(), noise() (+15 more)

### Community 57 - "stories / locked-out-climax"
Cohesion: 0.08
Nodes (21): at(), B2, BAY, BRICK, cam(), DOOR, E, KNEEL (+13 more)

### Community 58 - "futuretext / index"
Cohesion: 0.17
Nodes (24): avatar(), B(), bubbleMat(), bubbleRig(), bubbleStatic(), bubbleTex(), busBody(), busPhoto() (+16 more)

### Community 59 - "floataway / index"
Cohesion: 0.19
Nodes (23): B(), badge(), clamp01(), comment(), crackMat, ease(), FONT(), hearts() (+15 more)

### Community 60 - "look / cardshade"
Cohesion: 0.13
Nodes (17): CARD_K, cardShade(), GRAD_K, GRAD_KB, TINT_K, C3, LightPreset, LIGHTS (+9 more)

### Community 61 - "props / documents"
Cohesion: 0.17
Nodes (18): paint(), parchmentGuide(), parchmentRig(), PD, PW, rnd(), sigAt(), signaturesOf() (+10 more)

### Community 62 - "stories / steps-4012"
Cohesion: 0.09
Nodes (14): BED_CLOSE, BED_MED, CARD, CARD_CAM, DAY, HIGH, IN_BED, LAMP (+6 more)

### Community 63 - "characters / toon (3)"
Cohesion: 0.22
Nodes (18): FxPlace, fxBurst(), fxNote(), fxPuff(), fxRing(), fxSplash(), fxStars(), INK (+10 more)

### Community 64 - "bridge / Bridge"
Cohesion: 0.16
Nodes (17): BRIDGE_FRAMES, BridgeShort(), dprOverride(), fpt, fwd, Inner(), makeBloom(), PostToggles (+9 more)

### Community 65 - "stories / night-shift"
Cohesion: 0.11
Nodes (17): CAM, DRAWER, FINAL, FOOT, FRONT, GUT, JW, MON (+9 more)

### Community 66 - "look / lensblur"
Cohesion: 0.12
Nodes (6): GrainEffect, LensBlur, LensBlurEffect, MAIN, PRE, Stage

### Community 67 - "look / grade"
Cohesion: 0.14
Nodes (14): E_CB, E_CR, GRADE_DAY, GRADE_DAY2, GRADE_GOLDEN, GRADE_GOLDEN2, GRADE_NIGHT, GRADE_STRENGTH (+6 more)

### Community 68 - "stories / one-too-many-thumbs"
Cohesion: 0.16
Nodes (17): at(), carol(), CAROL_AT, cast, class7C(), day, FILES, gold (+9 more)

### Community 69 - "bridge / build (2)"
Cohesion: 0.19
Nodes (17): boxGeo(), buildTown(), chapelTex(), clockTex(), house(), inChurch(), inMill(), inPark() (+9 more)

### Community 70 - "bridge / grade"
Cohesion: 0.15
Nodes (13): E_CB, E_CR, GRADE_DAY, GRADE_DAY2, GRADE_GOLDEN, GRADE_GOLDEN2, GRADE_STRENGTH, GradeEffect (+5 more)

### Community 71 - "everylie / index"
Cohesion: 0.21
Nodes (13): clamp01(), EVERYLIE_THEME, FONT(), lieSignRig(), lieSignStatic(), rrect(), signMat(), signTex() (+5 more)

### Community 72 - "bridge / lensblur"
Cohesion: 0.17
Nodes (5): LensBlur, LensBlurEffect, MAIN, PRE, Stage

### Community 73 - "stories / extra-door-2"
Cohesion: 0.17
Nodes (7): CRACK_T, EXTRADOOR2, FINAL, MID, PHOTO_CAM, PHOTO_EXIT, STAIRS_TOP

### Community 74 - "bridge / ink"
Cohesion: 0.17
Nodes (5): DEF, InkOptions, InkPass, NOINK, noInkFallback()

### Community 75 - "emptyseat / index (2)"
Cohesion: 0.31
Nodes (11): blizzardRig(), blizzardTex(), elmTex(), frostTex(), plateTex(), rnd(), schoolBus(), snowDots() (+3 more)

### Community 76 - "bridge / story (2)"
Cohesion: 0.27
Nodes (10): hammerK(), BridgeState, deckY(), dropW(), easeOut(), shapeZ(), smooth(), snapEnd() (+2 more)

### Community 77 - "stories / every-lie"
Cohesion: 0.20
Nodes (7): DAD, DESK, EVERYLIE, JUNO, KID, LIV, TEACH

### Community 78 - "stories / ollie-roof-test"
Cohesion: 0.24
Nodes (7): beyond(), OLLIE_ROOF_TEST, shot(), STEADY, V, WX(), ROOF_Y

### Community 79 - "emptyseat / index (3)"
Cohesion: 0.25
Nodes (9): around13(), behind(), fogMat(), fogRig(), fogStatic(), fogTex(), plane(), ROW_Z() (+1 more)

### Community 80 - "sets / floor"
Cohesion: 0.43
Nodes (5): cache, decode(), FLOOR_MAPS, FloorMap, grid()

## Knowledge Gaps
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Storyboard` connect `stories / locked-out-keys` to `story / timing`, `story / compile`, `sound / cues`, `stories / stop-time-1`, `story / caption-timing`, `checks / SetTour`, `stories / empty-seat`, `stories / nova-commands`, `stories / other-jamie`, `stories / ollie-2`, `stories / one-too-many`, `stories / whale-city`, `stories / ollie-1`, `stories / breakfast-text`, `stories / locked-out`, `stories / night-train`, `story / types`, `stories / float-away`, `stories / memory-money`, `stories / locked-out-climax`, `stories / steps-4012`, `stories / night-shift`, `stories / one-too-many-thumbs`, `stories / extra-door-2`, `stories / every-lie`, `stories / ollie-roof-test`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `bridge / toon` be split into smaller, more focused modules?**
  _Cohesion score 0.062434691745036575 - nodes in this community are weakly interconnected._
- **Why does `col()` connect `nightshift / index` to `extradoor / index`, `onetoomany / index`, `props / interior`, `lockedout / index`, `props / outdoor`, `ollie / index`, `race1904 / index`, `nova / index`, `otherjamie / index`, `timestop / index`, `onetoomany / index (2)`, `whalecity / index`, `pirates / index`, `nighttrain / index`, `breakfast / index`, `memory / index`, `emptyseat / index`, `steps / index`, `futuretext / index`, `floataway / index`, `props / documents`, `everylie / index`, `emptyseat / index (2)`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `story / timing` be split into smaller, more focused modules?**
  _Cohesion score 0.05411392405063291 - nodes in this community are weakly interconnected._
- **Why does `ShotSpec` connect `story / types` to `stories / other-jamie`, `story / timing`, `stories / one-too-many-thumbs`, `stories / ollie-2`, `story / compile`, `stories / one-too-many`, `stories / whale-city`, `stories / ollie-1`, `stories / breakfast-text`, `stories / locked-out`, `stories / night-train`, `stories / stop-time-1`, `stories / memory-money`, `stories / steps-4012`, `stories / locked-out-climax`, `stories / empty-seat`, `stories / nova-commands`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `extradoor / index` be split into smaller, more focused modules?**
  _Cohesion score 0.060833902939166094 - nodes in this community are weakly interconnected._
- **Should `bridge / story` be split into smaller, more focused modules?**
  _Cohesion score 0.05878332194121668 - nodes in this community are weakly interconnected._