// The Empty Seat, v2: the voiced-scene format (productions/empty-seat/script-v2-voiced.md; the format study is
// productions/research/viral-breakdown-mr-gray.md). No narrator: a cast of seven voices, every shot first-person
// ("you" are the kid whose eyes we see through: your hands in front of the lens), a cold open, a typed time card,
// captions coloured per speaker, the bus radio through a radio filter, a lighting arc (June sun, the snowstorm, the sun
// back), and a silent end card. Silences are acted: each carries a sound and something happening on screen.
// The approved v1 (narrated) is in git history; its narration stays cached.
import type { Storyboard, Line, ShotSpec, ActorSpec, When } from "../story/types";
import { SEAT, ROW_Z } from "../themes/emptyseat";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
type Cam = ReturnType<typeof at>;
const lock = (c: Cam) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (c0: Cam, c1: Cam, t = 0.1, dur = 3.0) => ({ camera: c0, cams: [{ t: 0, ...c0, blockOk: true }, { t, ...c1, glide: dur, blockOk: true }] });
const L = (who: string, text: string, extra: Partial<Line> = {}): Line => ({ text, who, ...extra });
/** voice-over: a character heard but not seen (you, your thoughts, Priya beside you, Sam, the radio), in their preset */
const VO: Record<string, string> = { you: "esYou", thought: "esThought", priya: "esPriya", sam: "esSam", radio: "esRadio", noah: "esNoah", hale: "esHale", sub: "esSub" };
const O = (who: string, text: string, extra: Partial<Line> = {}): Line => ({ text, who: "narrator", voice: VO[who], ...extra });
const STEADY = (n: number, dt: number, t0 = 0): When[] => Array.from({ length: n }, (_, i) => ({ t: t0 + i * dt }));
const BUS = { set: "schoolBus", light: "interior" as const };
const ELM = { set: "schoolBusElm", light: "interior" as const };
const SNOW = { set: "schoolBusSnow", light: "night" as const };
// a close insert: the 9:16 card behind the bus, the camera 1 m in front of it
const CARD: V = [0, 1.4, 9.0], CARD_CAM = at([0, 1.4, 10.0], CARD, 51);
const insert = (variant: string, note: string, extra: Partial<ShotSpec> = {}, steps: When[] = []): ShotSpec =>
  ({ ...BUS, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "esInsert", at: CARD, variant, steps }], note, ...extra });
// your hands in front of the lens (pinned to the camera: `at` = the look point; scale ~ the frame height for its fov)
const fovK = (fov: number) => Math.tan((fov * Math.PI) / 360) / Math.tan((50 * Math.PI) / 360);
const HANDS = (c: Cam, v: "straps" | "reach" = "straps") => ({ id: "povHands", at: c.look, variant: v, scale: fovK(c.fov), steps: STEADY(160, 0.1) });

// ---------------------------------------------------------------- the riders (they face the front, i.e. toward a camera looking back down the bus)
const MANNER: Partial<ActorSpec>[] = [{ act: "neutral" }, { act: "happy" }, { act: "sleepy" }, { act: "thinking" }, { act: "neutral", beats: [{ t: 0.6, look: "left" }] }, { act: "happy", beats: [{ t: 0.9, look: "right" }] }, { act: "embarrassed" }];
const riders = (skip: number[], extra: Partial<ActorSpec> = {}, rows = 9): ActorSpec[] => {
  const out: ActorSpec[] = []; let k = 0;
  for (let r = 1; r <= rows; r++) for (const n of [2 * r - 1, 2 * r]) {
    if (skip.includes(n)) continue;
    for (const inner of [false, true]) { if (inner && (r % 3 === 0 || n === 11)) continue; out.push({ who: `p${k}`, at: SEAT(n, inner), mode: "sit", facing: "camera", idle: 0.3, ...MANNER[(k * 5) % MANNER.length], ...extra }); k++; }
  }
  return out;
};
const NOAH = (act: ActorSpec["act"], extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "noah", at: SEAT(13, true), mode: "sit", act, facing: "camera", idle: 0.3, ...extra });
const DRIVER: V = [-0.75, 0.45, -4.25];
const FOG13 = { id: "fogPane", at: SEAT(13), variant: "13" };

// ---------------------------------------------------------------- cameras (your eyes: you sit on seat 12's bench, row 6 right)
const EYES: V = [0.12, 1.2, ROW_Z(6) + 0.12];
const LOOK13 = at(EYES, [-0.8, 0.9, ROW_Z(7) + 0.25], 50);                                // over your shoulder at seat 13's bench
const DOWN_BUS = at([0.1, 1.2, ROW_Z(6) + 0.05], [-0.2, 0.95, 4.6], 52);                  // down the bus to the back window: faces of the riders behind you
const UP_BUS = at([0.1, 1.2, ROW_Z(6) - 0.1], [-0.4, 1.0, -5.0], 48);                    // up the aisle to the driver and the windscreen
const AT_HALE = at([-0.05, 1.4, -2.95], [-0.75, 1.2, -4.25], 44);
const FRONT_HALE = at([0.4, 1.38, -4.95], [-0.75, 1.15, -4.2], 50);
const AT_DOORS = at([-0.55, 1.3, -2.5], [1.1, 1.0, -4.4], 50);
const SEAT13 = at([0.3, 1.25, ROW_Z(7) - 1.15], [-0.85, 1.05, ROW_Z(7) + 0.1], 44);
const AT14 = at([-0.35, 1.25, ROW_Z(7) - 1.5], [0.7, 0.95, ROW_Z(7) + 0.1], 50);

const shots: ShotSpec[] = [
  // ======== COLD OPEN: the snowstorm inside the bus; the slap on the back window; Priya: "Don't look at the window. Just count."
  { ...SNOW, dur: 1.6, mood: "drone", ...glide(DOWN_BUS, at([0.08, 1.18, ROW_Z(6) + 0.2], [-0.15, 1.0, 4.6], 46), 0.0, 1.6),
    actors: riders([13, 12], { act: "scared", blink: false }, 11).filter((a) => (a.at as V)[2] > ROW_Z(7) + 0.5), props: [{ id: "blizzard", at: [0, 1.2, 4.6], steps: STEADY(40, 0.1) }, HANDS(DOWN_BUS)],
    sfx: [{ t: 0.0, name: "breath_fast", gain: -2 }, { t: 1.15, name: "glass_slap" }], note: "cold open: white-out windows, frost, frightened faces; the slap" },
  insert("backWindow", "cold open: the handprint on the back window, snow on the road", { say: O("priya", "Don't look at the window. Just count."), ambience: "amb_snow", sfx: [{ t: 0.0, name: "sting_low", gain: -2 }, { t: 0.5, name: "glass_slap", gain: -3 }] }, [{ t: 0.0 }]),
  // ======== THREE WEEKS EARLIER · MONDAY 7:52 AM · BUS 9
  { ...BUS, dur: 2.6, mood: "emily", transition: "flash", ...lock(DOWN_BUS),
    actors: riders([13, 12], {}, 11).filter((a) => (a.at as V)[2] > ROW_Z(7) + 0.5), props: [HANDS(DOWN_BUS), { id: "titleCard", at: DOWN_BUS.look, variant: "weeks", scale: fovK(52), steps: STEADY(42, 0.045, 0.1) }],
    sfx: [{ t: 0.0, name: "kids_chatter", gain: 2 }, { t: 0.1, name: "bus_pullaway", gain: -6 }, { t: 0.1, name: "phone_tap", gain: -10 }], note: "the time card types out over a bright June bus" },
  // ======== SCENE 1: Noah sits in seat 13
  { say: L("noah", "Is anyone sitting here?"), ...BUS, ...glide(LOOK13, at([0.1, 1.18, ROW_Z(6) + 0.25], [-0.8, 0.95, ROW_Z(7) + 0.25], 44), 0.1, 2.2),
    actors: [NOAH("happy", { gesture: "spread" }), ...riders([13, 12], {}, 9).filter((a) => (a.at as V)[2] > ROW_Z(7) + 0.5)], props: [FOG13, HANDS(LOOK13)], sfx: [{ t: 0.0, name: "thunk", gain: -8 }], note: "1 Noah drops into seat 13" },
  { say: O("priya", "He sat in it.", { gap: 0.6 }), ...BUS, mood: "rest", ambience: "amb_bus", ...lock(DOWN_BUS),
    actors: [...riders([13, 12], { act: "shock", facing: "toward:noah" }, 11).filter((a) => (a.at as V)[2] > ROW_Z(7) + 0.5), NOAH("happy")], props: [HANDS(DOWN_BUS)], note: "1 the chatter stops; every head turns" },
  { say: O("thought", "(Nobody sits in thirteen. Not even when it's packed.)"), ...BUS, ambience: "amb_bus", ...glide(SEAT13, at([0.2, 1.22, ROW_Z(7) - 0.85], [-0.9, 1.08, ROW_Z(7) + 0.1], 40), 0.05, 2.8),
    actors: [NOAH("nervous")], props: [FOG13], note: "1 seat 13: Noah under the 13 plate, the fogged window" },
  { say: L("hale", "Not that one, son. That's Emily's.", { gap: 0.5 }), ...BUS, ambience: "amb_bus", ...lock(AT_HALE),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera", idle: 0.2 }], sfx: [{ t: 0.0, name: "air_brake" }, { t: 0.1, name: "indicator", gain: 2 }], note: "1 the bus pulls over; Mr Hale turns round" },
  { say: L("noah", "Who's Emily?"), ...BUS, ambience: "amb_bus", ...lock(at([0.15, 1.25, ROW_Z(7) - 1.0], [-0.55, 0.95, ROW_Z(7) + 0.2], 40)), actors: [NOAH("confused")], props: [FOG13], note: "1 Noah" },
  insert("window", "1 her window: fogged from the inside, June sun outside", { say: O("thought", "(It's June. So why is her window always fogged up?)", { gap: 0.8 }), ambience: "amb_bus" }),
  // ======== SCENE 2: Elm Road; "One. Two. Three."
  { say: L("hale", "One. Two. Three.", { gap: 0.5 }), ...ELM, mood: "drone", ambience: "amb_bus", ...lock(AT_DOORS),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", facing: 1, idle: 0.2 }], props: [{ id: "busDoors", at: [1.2, 0, -4.4], steps: [{ t: 0.0 }, { word: "Three." }] }],
    sfx: [{ t: 0.0, name: "air_brake", gain: -4 }, { t: 0.05, name: "bus_doors" }, { word: "Three.", name: "bus_doors", gain: -2 }], note: "2 the doors fold open on the empty Elm Rd stop; he counts; they shut" },
  { say: O("thought", "(Every single morning. And nobody's ever there.)"), ...ELM, ambience: "amb_bus", ...glide(UP_BUS, at([0.1, 1.2, ROW_Z(6) - 0.4], [-0.4, 1.0, -5.0], 44), 0.1, 3.0),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", facing: "camera", idle: 0.2 }], props: [HANDS(UP_BUS)], sfx: [{ t: 0.2, name: "bus_pullaway", gain: -4 }], note: "2 up the aisle: the bus pulls away" },
  // ======== SCENE 3: your phone; the yearbook; 1996
  insert("search", "3 your phone: elm road bus stop -> STOP CLOSED 1996", { say: O("sam", "Closed because of her.", { gap: 0.9 }), mood: "mystery", ambience: "amb_room", sfx: [{ t: 0.0, name: "phone_tap", gain: -4 }, { t: 0.7, name: "blip_up", gain: -10 }] }, [{ t: 0.0 }]),
  insert("yearbook", "3 the yearbook: Emily Shaw, aged 11", { say: O("sam", "Snowstorm. The bus was late."), ambience: "amb_room", sfx: [{ t: 0.0, name: "swish_soft", gain: -4 }, { t: 0.3, name: "musicbox_note", gain: -8 }] }),
  insert("snow1996", "3 1996: the bus goes past; the girl behind the snowbank", { say: O("sam", "The driver didn't see her at the stop, and drove right past."), mood: "emilyDread", ambience: "amb_snow", sfx: [{ word: "past.", name: "bus_pullaway", gain: -2 }] }, [{ word: "past." }]),
  insert("footprints", "3 her footprints, fading", { say: [O("sam", "She tried to walk to school."), O("you", "And?", { gap: 0.4 }), O("sam", "She never got there.", { gap: 0.5 })], ambience: "amb_snow" }),
  { say: O("thought", "(The driver... was Mr Hale.)"), ...BUS, mood: "hush", ambience: "amb_bus", ...glide(FRONT_HALE, at([0.3, 1.35, -4.9], [-0.75, 1.18, -4.2], 44), 0.1, 2.6),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", facing: "camera", idle: 0.2 }], note: "3 Mr Hale at the wheel" },
  // ======== SCENE 4: "Morning, Emily."
  { say: L("hale", "Morning, Emily.", { gap: 0.6 }), ...BUS, mood: "emily", ambience: "amb_bus", ...lock(at([0.3, 1.33, -4.85], [-0.75, 1.2, -4.2], 40)),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "happy", face: "smile_closed", keepFace: true, facing: "camera", idle: 0.2, beats: [{ t: 0.1, look: "up" }] }], note: "4 a glance up at seat 13 in his mirror: Morning, Emily" },
  // ======== SCENE 5: the stand-in driver; the radio
  { say: [O("radio", "Bus nine, Ron Hale's in hospital. You're covering his route.", { gap: 0.8 }), L("sub", "Copy that.")], ...BUS, mood: "drone", ambience: "amb_bus", transition: "dip", ...lock(FRONT_HALE),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "neutral", facing: "camera", idle: 0.3 }], sfx: [{ t: 0.75, name: "radio_squelch" }, { word: "route.", name: "radio_squelch", gain: -3 }], note: "5 a different driver; the dispatch radio" },
  { say: O("thought", "(She doesn't know.)", { gap: 0.4 }), ...BUS, ambience: "amb_bus", ...glide(UP_BUS, at([0.1, 1.2, ROW_Z(6) - 0.5], [-0.3, 1.05, -5.0], 42), 0.1, 2.0),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "neutral", facing: -1, idle: 0.3 }], props: [HANDS(UP_BUS)], sfx: [{ t: 0.1, name: "heartbeat", gain: -4 }], note: "5 up the aisle: the Elm Road sign is coming" },
  { say: [O("you", "Miss? You have to stop at Elm Road."), L("sub", "There's no stop at Elm Road, hon.", { gap: 0.3 })], ...BUS, ambience: "amb_bus", ...lock(FRONT_HALE),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "neutral", facing: "camera", idle: 0.3 }], note: "5 she doesn't stop" },
  insert("passStop", "5 the Elm Rd stop flashing past", { dur: 1.2, mood: "build", ambience: "amb_bus", sfx: [{ t: 0.1, name: "whoosh_short" }, { t: 0.2, name: "bus_pullaway", gain: -6 }] }),
  insert("backWindow", "5 the slap: a small handprint, from outside", { dur: 1.5, ambience: "amb_bus", sfx: [{ t: 0.55, name: "glass_slap" }, { t: 0.55, name: "sting_low", gain: -4 }] }, [{ t: 0.55 }]),
  { say: O("priya", "It's snowing. It's June.", { gap: 0.3 }), ...SNOW, ambience: "amb_snow", ...glide(DOWN_BUS, at([0.08, 1.18, ROW_Z(6) + 0.2], [-0.15, 1.0, 4.6], 46), 0.0, 2.4),
    actors: riders([13, 12], { act: "scared", blink: false }, 11).filter((a) => (a.at as V)[2] > ROW_Z(7) + 0.5), props: [{ id: "blizzard", at: [0, 1.2, 4.6], steps: STEADY(40, 0.1) }, HANDS(DOWN_BUS)],
    sfx: [{ t: 0.0, name: "gasp", gain: -4 }, { t: 0.1, name: "storm_wind", gain: -4 }, { word: "June.", name: "glass_slap", gain: -1 }, { word: "June.", n: 1, name: "glass_slap", gain: -2 }], note: "5 the windows white, cold blue light, frost: the slaps" },
  { say: O("you", "STOP! Go back! Please!"), ...SNOW, ambience: "amb_snow", ...glide(at([0.0, 1.15, ROW_Z(5)], [0.0, 1.05, -5.0], 50), at([0.0, 1.2, -2.6], [-0.2, 1.05, -5.0], 50), 0.0, 1.9),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "scared", facing: "camera", idle: 0.2 }], props: [{ id: "blizzard", at: [0, 1.2, -4.6], steps: STEADY(30, 0.1) }, HANDS(at([0.0, 1.15, ROW_Z(5)], [0.0, 1.05, -5.0], 50), "reach")],
    sfx: [{ t: 0.0, name: "breath_fast" }, ...STEADY(6, 0.28, 0.1).map((w) => ({ ...w, name: "step_floor" as const, gain: 4 }))], note: "5 you run up the aisle (your hand reaching)" },
  { say: O("thought", "One. Two. Three.", { gap: 0.4 }), ...SNOW, mood: "silence", ambience: "amb_snow", ...lock(AT_DOORS),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "scared", facing: 1, idle: 0.2 }], props: [{ id: "busDoors", at: [1.2, 0, -4.4], steps: [{ t: 0.0 }, { word: "Three." }] }, { id: "blizzard", at: [1.1, 1.0, -4.4], steps: STEADY(40, 0.1) }],
    sfx: [{ t: 0.0, name: "air_brake" }, { t: 0.05, name: "bus_doors" }, { t: 0.2, name: "storm_wind" }, { word: "Three.", name: "bus_doors", gain: -2 }], note: "5 the doors open on the storm: one, two, three" },
  { ...BUS, dur: 3.0, mood: "emily", ambience: "amb_bus", transition: "flash", ...glide(SEAT13, at([0.2, 1.24, ROW_Z(7) - 0.8], [-0.95, 1.12, ROW_Z(7) + 0.05], 38), 0.05, 3.0),
    actors: [], props: [{ id: "fogPane", at: SEAT(13), variant: "13up", steps: [{ t: 0.6 }] }], sfx: [{ t: 0.6, name: "dog_breath", gain: -10 }], note: "5 the sun floods back; seat 13's window fogs up again: she's aboard" },
  // ======== SCENE 6: that night: Sam's text
  insert("text", "6 a text from Sam: mr hale died last night", { dur: 4.2, mood: "rest", ambience: false, transition: "dip", sfx: [{ t: 0.0, name: "phone_buzz", gain: -4 }, { t: 1.4, name: "msg_chime", gain: -4 }] }, [{ t: 1.4 }]),
  // ======== SCENE 7: the next morning: two fogged windows; "Don't. That's Mr Hale's."
  { say: O("thought", "(He's riding with her now. So she never gets left behind again.)"), ...BUS, mood: "emilyTender", ambience: "amb_bus_kids", transition: "dip",
    ...glide(at([0.05, 1.3, ROW_Z(7) - 0.75], [-1.2, 1.25, ROW_Z(7)], 46), at([-0.05, 1.3, ROW_Z(7) - 0.75], [1.2, 1.25, ROW_Z(7)], 46), 0.8, 1.6),
    actors: [], props: [FOG13, { id: "fogPane", at: SEAT(14), variant: "14" }], note: "7 both windows fogged" },
  { say: O("priya", "Don't. That's Mr Hale's.", { gap: 0.5 }), ...BUS, ambience: "amb_bus_kids", ...glide(AT14, at([-0.3, 1.22, ROW_Z(7) - 1.2], [0.7, 0.95, ROW_Z(7) + 0.1], 46), 0.1, 2.5),
    actors: [{ who: "kid", at: [0.22, 0, ROW_Z(7) - 0.25], act: "neutral", face: "confused", facing: "camera", idle: 0.2 }, ...riders([13, 14, 12], {}, 9).filter((a) => (a.at as V)[0] > 0 && (a.at as V)[2] > ROW_Z(7) + 0.5)],
    props: [{ id: "fogPane", at: SEAT(14), variant: "14" }], note: "7 a kid about to sit in 14; Priya stops him" },
  insert("vote", "end card: WOULD YOU SIT IN SEAT 13?", { dur: 2.4, hold: 0.4, sfx: [{ t: 0.0, name: "musicbox_note", gain: -6 }] }),
];

const cast: Record<string, string | { extra: number; era: "pupil" }> = { hale: "hale", sub: "subDriver", noah: "noah", you: "seatKid", thought: "seatKid", radio: "subDriver",
  priya: { extra: 270, era: "pupil" }, sam: { extra: 271, era: "pupil" }, kid: { extra: 272, era: "pupil" } };
for (let k = 0; k < 44; k++) cast[`p${k}`] = { extra: 200 + k, era: "pupil" };

export const EMPTY_SEAT: Storyboard = {
  id: "empty-seat", title: "The Empty Seat",
  cast, voice: "esThought",   // the "narrator" is only ever you, thinking; other voice-over lines name their preset
  voices: { you: "esYou", thought: "esThought", noah: "esNoah", priya: "esPriya", sam: "esSam", hale: "esHale", sub: "esSub", radio: "esRadio" },
  captionColors: { noah: "#9fd3ff", hale: "#f2c94c", sub: "#ffb070", esPriya: "#ff9ec7", esSam: "#8fe3a1", esRadio: "#c9cfd8" },
  music: { mood: "emily", gain: -2 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
