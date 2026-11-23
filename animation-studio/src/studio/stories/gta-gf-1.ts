// GTA 6, Explained to Your Girlfriend · Ep 1: "Why He Hasn't Replied" (productions/gta-gf-1/viewer-script.md, v2,
// approved by the owner 23 Nov 2026). Why GTA 6 is so hyped, and why he's been playing for six hours instead of texting
// back: a 13-year wait, a record trailer, two delays, an estimated $1.84B by launch day, a whole sunny state. Then Lucy
// tries it, and six hours later she's the one replying "sorry. gta".
// Built to the format system (CLAUDE.md) and STUDY.md: frame 0 with motion and the two-line banner, a visual change
// every ~1.8 s, six setups (Lucy's bedroom by day, Gordon's flat at night in the TV's glow, the inserts, the game street,
// the pier / motel / sunset road, the title), never-still cameras (alive), 1-2-word captions (short), 5-frame dissolves.
// The game world is our own Miami city rendered in Blender (blender/miami/miami.py plate_*), the cast composited in front.
import type { Storyboard, Line, ShotSpec, PropSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number, blur = 0, creep = 0.06, roll = 0) => ({ move: "at" as const, pos, look, fov, blur, creep, roll });
type Cam = ReturnType<typeof at>;
type When = { t: number } | { word: string };
const cuts = (first: Cam, ...more: (When & { c: Cam })[]) =>
  ({ camera: first, cams: [{ t: 0, ...first, blockOk: true }, ...more.map((m) => ("word" in m ? { word: m.word, ...m.c, blockOk: true } : { t: m.t, ...m.c, blockOk: true }))] });
const N = (text: string): Line => ({ text, who: "narrator" });
/** a camera that never sits still (STUDY.md): a slow eased glide to `b` over `secs` */
const glideTo = (b: Cam, secs: number, t = 0.05) => ({ t, c: { ...b, glide: secs } as Cam });
const lucy = (text: string): Line => ({ text, who: "ggLucy" });
const gordon = (text: string): Line => ({ text, who: "ggGordon" });
const every = (t0: number, dt: number, n: number): When[] => Array.from({ length: n }, (_, i) => ({ t: t0 + i * dt }));

// ---- the places
const ROOM = { set: "stepsRoom", light: "interior" as const, ambience: "elb_bedroom_day" as const };
const FLAT = { set: "apartment", light: "interior" as const, ambience: "elb_flat_tv" as const };
const GAME = { set: "ggPlate", light: "day" as const, ambience: "elb_beach_day" as const };
// Lucy's bedroom: sitting up on the bed, her phone in her hands
const LUCY_BED: V = [0.1, 0, 0.55];
// the flat: the sofa faces the camera (seat 0.55); Gordon in the middle, Lucy's seat on his right (screen left)
const G_SEAT: V = [-2.6, 0.55, -1.82], L_SEAT: V = [-3.2, 0.55, -1.82], G_FACE: V = [-2.6, 1.22, -1.82], L_FACE: V = [-3.2, 0.96, -1.82];
const L_STAND: V = [-1.75, 0, -1.1], L_STAND_FACE: V = [-1.75, 1.02, -1.1];
const NIGHT_WIN: PropSpec = { id: "ssNight", at: [-2.6, 1.625, -2.594], steps: [{ t: -0.7 }] };
const GLOW: PropSpec = { id: "ggTvGlow", at: [-2.6, 1.0, -0.45], scale: 2.2, steps: every(0, 0.3, 40) };
// the insert cards (an `at` camera 1 m in front at fov 51 sees only the card)
const cardIn = (base: { set: string; light: "interior" | "night" | "day" | "golden"; ambience: ShotSpec["ambience"] }, card: V) => {
  const c0 = at([card[0], card[1], card[2] + 1.08], card, 51, 0, 0), c1 = at([card[0], card[1], card[2] + 1.0], card, 51, 0, 0);
  return (variant: string, note: string, extra: Partial<ShotSpec>, steps: When[], id = "ggInsert"): ShotSpec =>
    ({ ...base, camera: c0, cams: [{ t: 0, ...c0, blockOk: true }, { t: 0.1, ...c1, glide: 5, blockOk: true }], actors: [], props: [{ id, at: card, variant, steps }], note, ...extra });
};
const ROOM_CARD: V = [0, 1.4, 4.2], FLAT_CARD: V = [-2.6, 1.4, 4.2], GAME_CARD: V = [60, 1.4, 0];
const roomInsert = cardIn(ROOM, ROOM_CARD), flatInsert = cardIn(FLAT, FLAT_CARD);
const cardCam = (card: V, d = 1.0, dx = 0, dy = 0, roll = 0) => at([card[0] + dx, card[1] + dy, card[2] + d], [card[0] + dx * 0.4, card[1] + dy * 0.4, card[2]], 51, 0, 0.04, roll);

// ---- the game: each Blender plate hangs 30 m down -z from a level camera at its own x (PLATE_CAM heights)
const PX = { street: 0, pier: 100, motel: 200, sunset: 300 } as const, PH = { street: 1.75, pier: 1.6, motel: 1.6, sunset: 1.6 } as const;
type P = keyof typeof PX;
const PLATE = (p: P): PropSpec => ({ id: "ggPlate", variant: p, at: [PX[p], 0, -10], steps: [] });
/** the plate's own camera (level, 53.13 deg), pushed in `push` metres; sideways `dx` (small, or the plate misaligns) */
const plateCam = (p: P, push = 0, dx = 0, creep = 0.05) => at([PX[p] + dx, PH[p], -push], [PX[p] + dx, PH[p], -push - 10], 53.13, 0, creep);
/** the light of the place over the whole frame (characters and set alike); `at` = what the shot looks at */
const GRADE = (v: "tv" | "sunset" | "day" | "room", look: V): PropSpec => ({ id: "ggGrade", variant: v, at: look, scale: 0.53, steps: v === "tv" ? every(0, 0.3, 40) : [] });
/** `at` 0.31 m up (the shadow rig draws itself on the ground below): a decal, not a footprint the cast must avoid */
const SHADOW = (x: number, z: number): PropSpec => ({ id: "ggShadow", at: [x, 0.31, z - 0.05], steps: [] });
const HUD = (p: P): PropSpec => ({ id: "ggHud", at: [PX[p], PH[p], -10], scale: 0.5313, steps: [] });

export const GTA_GF_1: Storyboard = {
  id: "gta-gf-1", title: "GTA 6, Explained to Your Girlfriend · Ep 1",
  cast: { ggGordon: "ggGordon", ggLucy: "ggLucy" },
  voice: "ggNarrator", voices: { ggGordon: "ggGordon", ggLucy: "ggLucy" },
  captionColors: { ggLucy: "#ffb3dc", ggGordon: "#8ff0e4" },
  captionStyle: "short", alive: true,
  // the score (sound/samples/music/gtagf1_score1.json: seven sections to these timings): a cheeky synth riff under the
  // text, a laid-back synthwave groove for the question, building through the hype, a cheesy game-show brass riff on the
  // money, the full sunny Miami drop in the game, pulled back on the sofa, the riff again and a one-stab button
  music: { file: "gtagf1_score1", gain: 0, duck: -5, curve: [[0, -9], [6.2, -10], [28.7, -8], [36.0, -5], [41.7, -10], [48.7, -8], [52.6, -6]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "Your boyfriend takes six hours to text back because of GTA 6; here's why it's that big a deal, and then his girlfriend tries it and does the same to him.",
    facts: [
      { fact: "the hook", said: "Imagine you text your boyfriend \"hey\"." },
      { fact: "the twist", said: "Then he replies six hours later: \"sorry. GTA.\"" },
      { fact: "who they are and the question", said: "This is Gordon. This is Lucy. And Lucy wants to know what's so special about a video game." },
      { fact: "the wait", said: "the last GTA came out in 2013. He's been waiting thirteen years." },
      { fact: "the hype", said: "ninety million people watched it in one day." },
      { fact: "the delays", said: "Then they delayed the game. Twice." },
      { fact: "the size", said: "it made an estimated one point eight billion dollars by launch day." },
      { fact: "why six hours", said: "it's a whole sunny state you can go anywhere in." },
      { fact: "the payoff", said: "So she tries it. Just once." },
    ],
  },
  shots: [
    // ---- FRAME 0: Lucy on her bed, texting (setup 1: the bedroom by day)
    { say: N("Imagine you text your boyfriend \"hey\"."), ...ROOM, hold: 0.05,
      title: { text: "6 HOURS TO REPLY", sub: "HERE'S WHY", instant: true },
      ...cuts(at([0.3, 1.25, 2.9], [0.1, 1.05, 0.55], 46, 8, 0.1), glideTo(at([0.25, 1.2, 2.3], [0.1, 1.05, 0.55], 46, 8, 0.1), 1.4), { word: "hey", c: cardCam(ROOM_CARD, 1.08) }),
      actors: [{ who: "ggLucy", at: LUCY_BED, act: "happy", face: "smile", keepFace: true, facing: "camera", gesture: "read", hold: "phone", nod: [0.2, 0.75], beats: [{ t: 0.35, face: "grin" }, { word: "boyfriend", face: "excited" }] }],
      props: [{ id: "ggInsert", at: ROOM_CARD, variant: "textLucy", steps: [{ word: "hey" }] }, GRADE("room", [0.1, 1.05, 0.55])],
      sfx: [{ t: 0, name: "el_type_tap", gain: -4 }, { word: "hey", name: "el_msg_send" }],
      note: "frame 0: Lucy, smiling, typing on her bed in the sun; the banner; on 'hey', her phone: 'hey :)' sent" },
    roomInsert("textLucy", "her phone: the clock races 3:02 PM → 9:14 PM, then his reply pops in: 'sorry. gta'", {
      say: N("Then he replies six hours later: \"sorry. GTA.\""), hold: 0.2,
      cams: [{ t: 0, ...cardCam(ROOM_CARD, 1.08), blockOk: true }, { t: 0.1, ...cardCam(ROOM_CARD, 1.0, 0, -0.02), glide: 2.4, blockOk: true }],
      sfx: [{ word: "replies", name: "el_clock_flip", gain: -4 }, { word: "six", name: "el_clock_flip", gain: -4 }, { word: "hours", name: "el_clock_flip", gain: -4 }, { word: "sorry", name: "el_msg_ping" }] },
      [{ t: -0.7 }, { word: "Then" }, { word: "replies" }, { word: "six" }, { word: "hours" }, { word: "sorry" }]),
    // ---- the title (setup 6)
    flatInsert("title", "the title card: GTA 6, EXPLAINED TO YOUR GIRLFRIEND · EP 1", { say: N("GTA 6, explained to your girlfriend."), hold: 0.15, transition: "flash",
      sfx: [{ t: 0, name: "el_whoosh_bright" }] }, []),
    // ---- the question (setup 2: the flat at night, in the TV's glow)
    { say: N("This is Gordon. This is Lucy. And Lucy wants to know what's so special about a video game."), ...FLAT, hold: 0.1, transition: "dissolve",
      ...cuts(at([-2.35, 1.32, 0.45], G_FACE, 40, 12, 0.08), glideTo(at([-2.45, 1.3, 0.05], G_FACE, 40, 12, 0.08), 1.2), { word: "Lucy", c: at([-1.6, 1.15, 0.75], L_STAND_FACE, 40, 12, 0.08) }, { word: "And", c: { ...at([-1.65, 1.12, 0.4], L_STAND_FACE, 40, 12, 0.08), glide: 0.9 } as Cam },
        { word: "wants", c: at([-2.3, 1.5, 3.0], [-2.15, 0.95, -1.4], 50, 4, 0.06) }),
      actors: [{ who: "ggGordon", at: G_SEAT, mode: "sit", act: "excited", face: "excited", keepFace: true, facing: "camera", gesture: "hold", hold: "gamepad" },
        { who: "ggLucy", at: L_STAND, act: "suspicious", face: "suspicious", keepFace: true, facing: "toward:ggGordon", gesture: "hips", beats: [{ word: "know", gesture: "talk" }, { word: "video", gesture: "shrug" }] }],
      props: [NIGHT_WIN, GLOW, GRADE("tv", [-2.2, 1.1, -1.5])], sfx: [{ t: 0, name: "el_pad_mash", gain: -6 }, { word: "special", name: "el_pad_mash", gain: -8 }],
      note: "Gordon on the sofa, controller up, lit blue by the TV; Lucy beside the sofa, arms folded" },
    // ---- reason 1: the wait
    flatInsert("calendar", "a desk calendar: 2013 (the last one comes out), then the years flip on to 2026", {
      say: N("First: the last GTA came out in 2013. He's been waiting thirteen years."), hold: 0.1,
      cams: [{ t: 0, ...cardCam(FLAT_CARD, 1.08), blockOk: true }, { t: 0.1, ...cardCam(FLAT_CARD, 1.0, 0, 0.02), glide: 5, blockOk: true }],
      sfx: [{ word: "2013", name: "el_hit_sub", gain: -10 }, ...[0, 1, 2, 3, 4, 5].map((k) => ({ t: 3.9 + k * 0.14, name: "el_clock_flip" as const, gain: -6 - k }))] },
      every(3.9, 0.07, 13)),
    { say: lucy("That's longer than he's known me."), ...FLAT, hold: 0.25,
      ...cuts(at([-1.6, 1.14, 1.05], L_STAND_FACE, 40, 13, 0.08), glideTo(at([-1.65, 1.12, 0.65], L_STAND_FACE, 40, 13, 0.08), 1.8)),
      actors: [{ who: "ggLucy", at: L_STAND, act: "suspicious", face: "stern", keepFace: true, facing: "camera", gesture: "talk", beats: [{ word: "known", gesture: "hips" }], shake: [0.3] },
        { who: "ggGordon", at: G_SEAT, mode: "sit", act: "excited", face: "excited", keepFace: true, facing: "camera", gesture: "hold", hold: "gamepad" }],
      props: [{ ...GLOW, at: [-1.75, 1.1, -0.5] }, GRADE("tv", L_STAND_FACE)], note: "Lucy, close, deadpan" },
    // ---- reason 2: the trailer
    flatInsert("views", "the first trailer's view counter racing to 90,000,000 in 24 hours; NEW RECORD", {
      say: N("When the first trailer came out, ninety million people watched it in one day. No video that wasn't a song had ever been watched that fast."), hold: 0.1,
      cams: [{ t: 0, ...cardCam(FLAT_CARD, 1.08), blockOk: true }, { word: "ninety", ...cardCam(FLAT_CARD, 1.0, 0, -0.02), blockOk: true },
        { word: "No", ...cardCam(FLAT_CARD, 1.04, 0, 0.02), blockOk: true }],
      sfx: [{ word: "trailer", name: "el_counter_tick", gain: -8 }, { word: "ninety", name: "el_counter_tick", gain: -6 }, { word: "fast", name: "el_hit_boom", gain: -10 }] },
      [{ word: "trailer" }, { word: "came" }, { word: "out" }, { word: "ninety" }, { word: "million" }, { word: "people" }, { word: "watched" }, { word: "it" }, { word: "in" }, { word: "one" }, { word: "day" }, { word: "No" }, { word: "song" }, { word: "been" }, { word: "fast" }]),
    // ---- reason 3: the delays
    flatInsert("delayed", "COMING SOON, stamped DELAYED, then DELAYED again", {
      say: N("Then they delayed the game. Twice."), hold: 0.1,
      cams: [{ t: 0, ...cardCam(FLAT_CARD, 1.08), blockOk: true }, { t: 0.1, ...cardCam(FLAT_CARD, 1.0, 0, -0.02), glide: 1.6, blockOk: true }],
      kicks: [{ word: "delayed" }, { word: "Twice" }], sfx: [{ word: "delayed", name: "el_stamp_thud" }, { word: "Twice", name: "el_stamp_thud" }] },
      [{ word: "delayed" }, { word: "Twice" }]),
    { say: gordon("We suffered."), ...FLAT, hold: 0.3,
      ...cuts(at([-1.75, 1.05, 0.25], G_FACE, 40, 13, 0.1), glideTo(at([-1.95, 1.08, -0.05], G_FACE, 40, 13, 0.1, 3), 1.3)),
      actors: [{ who: "ggGordon", at: G_SEAT, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera", gesture: "belly", beats: [{ t: 0.35, gesture: "facepalm" }], shake: [0.5] }],
      props: [NIGHT_WIN, GLOW, GRADE("tv", G_FACE)], sfx: [{ t: 0.1, name: "el_crowd_aww", gain: -10 }], note: "Gordon, close, a hand on his chest, wounded" },
    // ---- reason 4: the money
    flatInsert("receipt", "a till receipt printing on and on; the total: $1,840,000,000 (est.)", {
      say: N("So when it finally came out, it made an estimated one point eight billion dollars by launch day. That's more than double the last one's launch."), hold: 0.1,
      cams: [{ t: 0, ...cardCam(FLAT_CARD, 1.08), blockOk: true }, { word: "billion", ...cardCam(FLAT_CARD, 1.0), blockOk: true }],
      sfx: [{ word: "finally", name: "el_receipt_print", gain: -6 }, { word: "billion", name: "el_cash_register" }] },
      [{ word: "when" }, { word: "finally" }, { word: "came" }, { word: "made" }, { word: "an" }, { word: "estimated" }, { word: "one" }, { word: "point" }, { word: "billion" }]),
    // ---- reason 5: the world (setup 4: through the TV into the game street)
    { say: N("And inside, it's a whole sunny state you can go anywhere in."), ...GAME, hold: 0.1, transition: "dissolve",
      ...cuts(cardCam(GAME_CARD, 1.0), { t: 0.08, c: { ...cardCam(GAME_CARD, 0.35), glide: 0 } as Cam }, { word: "it's", c: plateCam("street", 0, -0.25, 0.12) }, glideTo(plateCam("street", 0.5, 0.25, 0.1), 2.0, 0.7)),
      actors: [{ who: "ggGordon", at: [-0.5, 0, -8.0], act: "happy", face: "grin", keepFace: true, facing: "camera", walk: { to: [0.15, 0, -5.6], t0: 0.6, t1: 2.65, view: "front" } }],
      props: [{ id: "ggInsert", at: GAME_CARD, variant: "tv", steps: [] }, PLATE("street"), HUD("street"), GRADE("day", [0, 1.6, -6]), SHADOW(0.15, -5.6)],
      sfx: [{ t: 0.05, name: "el_whoosh_bright" }],
      note: "the camera pushes into the TV (the game street on it), and through it: Gordon's game self strolls along the sunny pavement, our HUD on screen" },
    { say: N("He can go fishing."), ...GAME, hold: 0.05,
      ...cuts(plateCam("pier", 0, 0, 0.14), glideTo(plateCam("pier", 0.6, 0, 0.1), 0.9)),
      actors: [{ who: "ggGordon", at: [PX.pier - 0.35, 0, -5.2], act: "happy", face: "smile", keepFace: true, facing: "camera", gesture: "offer", hold: "fishingRod", nod: [0.2] }],
      props: [PLATE("pier"), HUD("pier"), GRADE("day", [PX.pier, 1.6, -6]), SHADOW(PX.pier - 0.35, -5.2)], sfx: [{ t: 0, name: "el_reel_cast", gain: -4 }],
      note: "the game: Gordon fishing off the pier" },
    { say: N("Play basketball."), ...GAME, hold: 0.05,
      ...cuts(plateCam("motel", 0, 0, 0.14), glideTo(plateCam("motel", 0.6, 0, 0.1), 0.8)),
      actors: [{ who: "ggGordon", at: [PX.motel + 0.15, 0, -4.6], act: "excited", face: "excited", keepFace: true, facing: "camera", gesture: "raiseHand", hold: "basketball", nod: [0.15, 0.5] }],
      props: [PLATE("motel"), HUD("motel"), GRADE("day", [PX.motel, 1.6, -6]), SHADOW(PX.motel + 0.15, -4.6)], sfx: [{ t: 0, name: "el_ball_bounce", gain: -4 }],
      note: "the game: shooting hoops by the motel" },
    { say: N("Or just drive at sunset."), ...GAME, light: "golden", hold: 0.3,
      ...cuts(plateCam("sunset", 0, 0, 0.12), glideTo(plateCam("sunset", 0.8, 0, 0.1), 1.3)),
      actors: [{ who: "ggGordon", at: [PX.sunset - 0.15, 0, -3.9], act: "proud", face: "proud", keepFace: true, facing: "camera", gesture: "hips", beats: [{ t: 0.5, gesture: "thumbsUp" }] }],
      props: [PLATE("sunset"), HUD("sunset"), GRADE("sunset", [PX.sunset, 1.6, -6]), SHADOW(PX.sunset - 0.15, -3.9)], sfx: [{ t: 0, name: "el_car_cruise", gain: -6 }],
      note: "the game: his pink car on the beach road at sunset" },
    // ---- back on the sofa
    { say: lucy("So you're not ignoring me…"), ...FLAT, hold: 0.1, transition: "dissolve",
      ...cuts(at([-2.9, 1.42, 2.2], [-2.9, 1.0, -1.82], 54, 6, 0.08), glideTo(at([-2.9, 1.4, 1.85], [-2.9, 1.0, -1.82], 54, 6, 0.08), 1.5)),
      actors: [{ who: "ggLucy", at: L_SEAT, mode: "sit", act: "thinking", face: "thinking", keepFace: true, facing: "toward:ggGordon", gesture: "talk", beats: [{ word: "ignoring", gesture: "shrug" }] },
        { who: "ggGordon", at: G_SEAT, mode: "sit", act: "excited", face: "grin", keepFace: true, facing: "camera", gesture: "hold", hold: "gamepad" }],
      props: [NIGHT_WIN, GLOW, GRADE("tv", [-2.9, 1.0, -1.82])], note: "Lucy has sat down beside him, slowly coming round" },
    { say: gordon("I'm on holiday. In Miami. From my sofa."), ...FLAT, hold: 0.25,
      ...cuts(at([-1.9, 1.4, 0.35], G_FACE, 40, 12, 0.08), glideTo(at([-2.05, 1.38, 0.05], G_FACE, 40, 12, 0.08), 1.6), { word: "sofa", c: at([-2.9, 1.5, 1.8], [-2.9, 0.95, -1.82], 48, 4, 0.08) }),
      actors: [{ who: "ggGordon", at: G_SEAT, mode: "sit", act: "proud", face: "proud", keepFace: true, facing: "camera", gesture: "hold", hold: "gamepad", beats: [{ word: "Miami", gesture: "spread", hold: null }, { word: "sofa", gesture: "hips" }] },
        { who: "ggLucy", at: L_SEAT, mode: "sit", act: "suspicious", face: "suspicious", keepFace: true, facing: "toward:ggGordon" }],
      props: [NIGHT_WIN, GLOW, GRADE("tv", [-2.75, 1.1, -1.82])], note: "Gordon, blissful" },
    // ---- the twist
    { say: N("So she tries it. Just once."), ...FLAT, hold: 0.1,
      ...cuts(at([-3.0, 1.1, 0.5], L_FACE, 40, 12, 0.1), glideTo(at([-3.05, 1.08, 0.15], L_FACE, 40, 12, 0.1), 0.8), { word: "once", c: at([-2.35, 1.32, 0.45], G_FACE, 40, 12, 0.1, -3) }),
      actors: [{ who: "ggLucy", at: L_SEAT, mode: "sit", act: "determined", face: "excited", keepFace: true, facing: "camera", gesture: "hold", hold: "gamepad", nod: [0.2, 0.6] },
        { who: "ggGordon", at: G_SEAT, mode: "sit", act: "neutral", face: "suspicious", keepFace: true, facing: "camera", gesture: "read", hold: "phone" }],
      props: [NIGHT_WIN, GLOW, GRADE("tv", [-2.9, 1.05, -1.82])], sfx: [{ t: 0.2, name: "el_pad_mash", gain: -4 }, { word: "once", name: "el_type_tap", gain: -6 }],
      note: "Lucy takes the controller, hooked; on 'once', Gordon, now holding his phone, texting her" },
    flatInsert("textGordon", "Gordon's phone: 'hey?' sent at 3:02 PM; the clock races to 9:14 PM", {
      say: N("Six hours later…"), hold: 0.35,
      sfx: [{ t: 0, name: "el_msg_send" }, { word: "hours", name: "el_clock_flip", gain: -4 }, { word: "later", name: "el_clock_flip", gain: -4 }] },
      [{ t: 0 }, { word: "Six" }, { word: "hours" }, { word: "later" }, { t: 1.4 }]),
    { say: N("Girlfriends: what should we explain to you next? Tell us in the comments."), ...FLAT, hold: 0.6,
      title: { text: "WHAT SHOULD WE", sub: "EXPLAIN NEXT?" },
      ...cuts(cardCam(FLAT_CARD, 1.06), { word: "what", c: at([-2.9, 1.45, 2.2], [-2.9, 0.92, -1.82], 50, 4, 0.08) }, { word: "explain", c: { ...at([-2.9, 1.38, 1.3], [-2.9, 0.92, -1.82], 50, 4, 0.08), glide: 2.6 } as Cam }),
      actors: [{ who: "ggLucy", at: L_SEAT, mode: "sit", act: "excited", face: "excited", keepFace: true, facing: "camera", gesture: "hold", hold: "gamepad" },
        { who: "ggGordon", at: G_SEAT, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "toward:ggLucy", gesture: "read", hold: "phone" }],
      props: [{ id: "ggInsert", at: FLAT_CARD, variant: "textGordon", steps: [{ t: -0.7 }, { t: -0.6 }, { t: -0.5 }, { t: -0.4 }, { t: -0.3 }, { t: 0 }] }, NIGHT_WIN, GLOW, GRADE("tv", [-2.9, 0.95, -1.82])],
      sfx: [{ t: 0, name: "el_msg_ping" }, { word: "Tell", name: "el_pad_mash", gain: -6 }],
      note: "her reply pops in on his phone: 'sorry. gta'; then the two of them: Lucy glued to the game, Gordon staring at his phone; the ending banner" },
  ],
};
