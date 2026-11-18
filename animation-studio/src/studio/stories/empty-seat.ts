// The Empty Seat, v3: the storytelling system (productions/research/storytelling-system.md). A narrator (George,
// second person) carries the story and explains every strange thing the moment it appears; characters speak only after
// the narrator has set them up; "you" have a voice no one else shares. First-person camera from YOUR seat (row 6,
// right side), your hands only when they do something (holding the phone, tapping the driver's shoulder). The owner's
// v2 notes are each answered by a clarity fact below. v1 (narrated) and v2 (dialogue only) are in git history.
import type { Storyboard, Line, ShotSpec, ActorSpec, When } from "../story/types";
import { SEAT, ROW_Z } from "../themes/emptyseat";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
type Cam = ReturnType<typeof at>;
const lock = (c: Cam) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (c0: Cam, c1: Cam, t = 0.1, dur = 3.0) => ({ camera: c0, cams: [{ t: 0, ...c0, blockOk: true }, { t, ...c1, glide: dur, blockOk: true }] });
const STEADY = (n: number, dt: number, t0 = 0): When[] => Array.from({ length: n }, (_, i) => ({ t: t0 + i * dt }));
/** the narrator */
const N = (text: string, extra: Partial<Line> = {}): Line => ({ text, ...extra });
/** a character on screen */
const L = (who: string, text: string, extra: Partial<Line> = {}): Line => ({ text, who, ...extra });
/** a character heard, not seen (you, Priya beside you, the radio), in their own voice */
const VO: Record<string, string> = { you: "esYouBoy", priya: "esPriya", radio: "esRadio", sub: "esSub" };
const O = (who: string, text: string, extra: Partial<Line> = {}): Line => ({ text, who: "narrator", voice: VO[who], ...extra });
const BUS = { set: "schoolBus", light: "interior" as const };
const ELM = { set: "schoolBusElm", light: "interior" as const };
const SNOW = { set: "schoolBusSnow", light: "night" as const };
const CARD: V = [0, 1.4, 9.0], CARD_CAM = at([0, 1.4, 10.0], CARD, 51);
const insert = (variant: string, note: string, extra: Partial<ShotSpec> = {}, steps: When[] = []): ShotSpec =>
  ({ ...BUS, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "esInsert", at: CARD, variant, steps }], note, ...extra });
const fovK = (fov: number) => Math.tan((fov * Math.PI) / 360) / Math.tan((50 * Math.PI) / 360);
const REACH = (c: Cam) => ({ id: "povHands", at: c.look, variant: "reach", scale: fovK(c.fov), steps: STEADY(60, 0.1) });

// ---------------------------------------------------------------- the riders (they face the front of the bus)
const MANNER: Partial<ActorSpec>[] = [{ act: "neutral" }, { act: "happy" }, { act: "sleepy" }, { act: "thinking" }, { act: "neutral", beats: [{ t: 0.6, look: "left" }] }, { act: "happy", beats: [{ t: 0.9, look: "right" }] }, { act: "embarrassed" }];
const riders = (skip: number[], extra: Partial<ActorSpec> = {}, rows = 11): ActorSpec[] => {
  const out: ActorSpec[] = []; let k = 0;
  for (let r = 1; r <= rows; r++) for (const n of [2 * r - 1, 2 * r]) {
    if (skip.includes(n)) continue;
    for (const inner of [false, true]) { if (inner && r % 3 === 0) continue; out.push({ who: `p${k}`, at: SEAT(n, inner), mode: "sit", facing: "camera", idle: 0.3, ...MANNER[(k * 5) % MANNER.length], ...extra }); k++; }
  }
  return out;
};
const behind = (a: ActorSpec[]) => a.filter((x) => (x.at as V)[2] > ROW_Z(7) + 0.5);       // the rows behind you (they face a camera looking back)
const around13 = (a: ActorSpec[]) => a.filter((x) => (x.at as V)[2] > ROW_Z(7) - 0.3);       // row 7 and behind: the benches round seat 13
const NOAH = (act: ActorSpec["act"], extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "noah", at: SEAT(13, true), mode: "sit", act, facing: "camera", idle: 0.3, ...extra });
const DRIVER: V = [-0.75, 0.45, -4.25];
const FOG13 = { id: "fogPane", at: SEAT(13), variant: "13" };

// ---------------------------------------------------------------- cameras: your eyes, from your seat (seat 12's bench, row 6 right, by the aisle)
const SEAT_EYES: V = [0.5, 1.15, ROW_Z(6) + 0.1];
const BACK = at(SEAT_EYES, [-0.3, 0.95, 4.6], 52);                       // turned round, looking down the bus
const TO13 = at([0.45, 1.5, ROW_Z(6) - 0.15], [-0.95, 1.0, ROW_Z(7) + 0.15], 56);   // looking down over your shoulder: seat 13's empty bench among full ones
const NOAH_CAM = at(SEAT_EYES, [-0.05, 0.95, ROW_Z(3)], 52);                   // up the aisle: Noah walks toward you
const FRONT_ZOOM = at(SEAT_EYES, [-0.6, 1.1, -4.3], 30);                // up the bus to the driver, close
const AT_HALE = at([-0.05, 1.4, -2.95], [-0.75, 1.2, -4.25], 44);
const FRONT_HALE = at([0.4, 1.38, -4.95], [-0.75, 1.15, -4.2], 50);
const AT_DOORS = at([-0.55, 1.3, -2.5], [1.1, 1.0, -4.4], 50);
const SEAT13 = at([0.3, 1.25, ROW_Z(7) - 1.15], [-0.85, 1.05, ROW_Z(7) + 0.1], 44);
const TAP = at([-0.2, 1.3, -3.4], [-0.62, 1.02, -4.25], 46);             // behind the driver, at her shoulder

const shots: ShotSpec[] = [
  // ======== COLD OPEN: the handprint, explained in the first line
  { say: N("This handprint just hit the back of a moving school bus.", { gap: 0.2 }), ...SNOW, mood: "drone",
    ...glide(BACK, at([0.5, 1.15, ROW_Z(6) + 0.1], [-0.2, 1.0, 4.6], 46), 0.0, 2.0),
    actors: behind(riders([13, 12], { act: "scared", blink: false })), props: [{ id: "blizzard", at: [-0.3, 0.95, 4.6], steps: STEADY(40, 0.1) }],
    sfx: [{ t: 0.0, name: "breath_fast", gain: -2 }, { t: 0.15, name: "glass_slap" }], note: "cold open: a dark, snowy bus seen from your seat; frightened faces; a slap on the back door" },
  insert("backWindow", "cold open: the small handprint on the emergency door window, snow on the road behind", { say: N("In June."), ambience: "amb_snow", sfx: [{ t: 0.0, name: "sting_low", gain: -2 }] }, [{ t: 0.0 }]),
  // ======== THREE WEEKS EARLIER
  { ...BUS, dur: 2.4, mood: "emily", transition: "flash", ...lock(BACK), title: { text: "THREE WEEKS EARLIER", sub: "MONDAY 7:52 AM · BUS 9" },
    actors: behind(riders([13, 12])), props: [], sfx: [{ t: 0.0, name: "kids_chatter", gain: 2 }, { t: 0.1, name: "bus_pullaway", gain: -6 }], note: "the time card types out over the bright June bus, seen from your seat" },
  // ======== the rule: seat 13
  { say: N("Every morning, your school bus has one seat nobody sits in. Seat thirteen. Even when the bus is packed, kids would rather stand."), until: { word: "thirteen." }, ...BUS,
    ...glide(TO13, at([0.42, 1.48, ROW_Z(6) - 0.1], [-0.95, 1.0, ROW_Z(7) + 0.15], 50), 0.1, 3.0), actors: around13(riders([13, 12])), props: [FOG13], note: "seat 13's empty bench by its fogged window, every bench round it full" },
  { cont: true, ...BUS, ...lock(at([0.45, 1.5, ROW_Z(6) - 0.2], [-0.35, 0.95, ROW_Z(7) + 0.45], 56)),
    actors: [...around13(riders([13, 12])), { who: "s0", at: [0.05, 0, ROW_Z(8) + 0.1], act: "neutral", facing: "camera", idle: 0.2 }, { who: "s1", at: [0.0, 0, ROW_Z(9) + 0.1], act: "sleepy", facing: "camera", idle: 0.2 }],
    props: [], note: "kids standing in the aisle beside the empty bench" },
  { say: N("Mr Hale, the driver, says it belongs to a girl called Emily. Nobody has ever met her."), ...BUS, ...lock(FRONT_HALE),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "neutral", facing: "camera", idle: 0.2, beats: [{ t: 1.8, look: "up" }] }], note: "Mr Hale at the wheel, a glance up at his mirror" },
  // ======== Noah walks up and sits in it
  { say: [N("Then one day, a new kid gets on."), L("noah", "Is anyone sitting here?")], ...BUS, ...glide(at(SEAT_EYES, [0.0, 1.0, -3.3], 56), NOAH_CAM, 0.2, 2.8),
    actors: [{ who: "noah", at: [0.0, 0, -3.3], act: "happy", gesture: "offer", walk: { to: [0.0, 0, ROW_Z(3)], t0: 0.2, t1: 2.6, view: "front" } }, { who: "hale", at: DRIVER, mode: "sit", act: "neutral", facing: -1, idle: 0.2 }],
    sfx: [{ t: 0.0, name: "bus_doors", gain: -4 }], note: "Noah, the new kid in a red hoodie, walks up the aisle toward you, asking" },
  { say: N("He sits down in seat thirteen. The whole bus goes quiet. Mr Hale pulls over."), ...BUS, mood: "rest", ambience: "amb_bus",
    ...lock(TO13), actors: [NOAH("happy"), ...around13(riders([13, 12], { act: "shock", facing: "toward:noah" }))], props: [FOG13], sfx: [{ word: "quiet.", name: "air_brake" }], note: "Noah in seat 13; every head turns to him" },
  { say: L("hale", "Not that one, son. That's Emily's.", { gap: 0.4 }), ...BUS, ambience: "amb_bus", ...lock(AT_HALE), actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera", idle: 0.2 }], note: "Mr Hale turns round in his seat" },
  // ======== the June fog, explained
  insert("window", "seat 13's window: fogged on the inside, bright June sun outside", { say: N("And here's what nobody can explain. It's June. It's hot. But the window by seat thirteen is always fogged up, from the inside. As if someone is breathing on it."), mood: "mystery", ambience: "amb_bus" }),
  // ======== Elm Road, explained; the quick count
  { say: [N("Every day, Mr Hale stops at Elm Road, even though that stop was taken away a long time ago. Nobody is ever there. He opens the doors and counts to three."), L("hale", "One, two, three.", { gap: 0.2 })], ...ELM, mood: "drone", ambience: "amb_bus", ...lock(AT_DOORS),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", facing: 1, idle: 0.2 }], props: [{ id: "busDoors", at: [1.2, 0, -4.4], steps: [{ word: "Nobody" }, { word: "three.", n: 2 }] }],
    sfx: [{ t: 0.1, name: "air_brake", gain: -4 }, { word: "Nobody", name: "bus_doors" }, { word: "three.", n: 2, name: "bus_doors", gain: -2 }], note: "the doors fold open on the empty Elm Rd stop; he counts quickly; they shut" },
  // ======== at home: you look it up
  insert("searchHome", "at home on your bed: your phone: elm road bus stop -> STOP CLOSED 1996", { say: N("When you get home, you can't stop thinking about it. Why does your driver always stop at Elm Road? So you look it up."), ambience: "amb_room",
    sfx: [{ word: "look", name: "phone_tap", gain: -4 }] }, [{ word: "look" }]),
  insert("snow1996", "1996: the bus passes the Elm Rd stop in a snowstorm; a small girl waves behind the snowbank", { say: N("In 1996, in a snowstorm, the bus drove straight past the Elm Road stop. The driver didn't see the little girl waiting behind the snow."), mood: "emilyDread", ambience: "amb_snow",
    sfx: [{ word: "past", name: "bus_pullaway", gain: -2 }] }, [{ word: "past" }]),
  insert("yearbook", "the 1996 yearbook memorial page: EMILY SHAW, aged 11", { say: N("Her name was Emily Shaw. She was eleven. She tried to walk to school, and she never made it."), ambience: "amb_snow", sfx: [{ t: 0.1, name: "musicbox_note", gain: -8 }] }),
  { say: [N("The driver that morning was a young Mr Hale. Every day since, he stops for her and waits three seconds, just long enough for her to climb on. And he keeps her seat."), L("hale", "Morning, Emily.", { gap: 0.3 })], ...BUS, mood: "hush", ambience: "amb_bus",
    ...lock(FRONT_HALE), actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", facing: "camera", idle: 0.2, beats: [{ t: 2.0, look: "up" }] }], note: "Mr Hale at the wheel; he looks up at seat 13 in his mirror and says good morning to her" },
  // ======== he gets sick; the new driver (narrated, THEN the radio)
  { say: [N("Then one morning, Mr Hale got sick. A new driver covered his route."), O("radio", "Bus nine, Ron Hale's in hospital. You're covering his route.", { gap: 0.4 }), L("sub", "Copy that.")], ...BUS, mood: "drone", ambience: "amb_bus", transition: "dip",
    ...lock(FRONT_HALE), actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "neutral", facing: "camera", idle: 0.3 }], sfx: [{ word: "Bus", name: "radio_squelch" }, { word: "route.", n: 2, name: "radio_squelch", gain: -3 }], note: "a new driver, a young woman, at the wheel; the bus radio" },
  { say: [N("She doesn't know about Elm Road. So you tell her."), O("you", "Miss, you have to stop at Elm Road!"), L("sub", "There's no stop at Elm Road, hon.", { gap: 0.2 })], ...BUS, ambience: "amb_bus", ...lock(FRONT_ZOOM),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "neutral", facing: "camera", idle: 0.3 }], note: "from your seat, you call up the bus to the new driver; she answers over her shoulder" },
  insert("passStop", "the Elm Rd stop flashing past the window", { say: N("She drives right past it."), mood: "build", ambience: "amb_bus", sfx: [{ t: 0.1, name: "whoosh_short" }] }),
  // ======== the handprint, explained
  insert("backWindow", "the slap: a small handprint on the outside of the emergency door window", { say: N("Then something slaps the back of the bus. A small handprint, on the outside of the emergency door. While the bus is moving."), ambience: "amb_bus",
    sfx: [{ word: "slaps", name: "glass_slap" }, { word: "slaps", name: "sting_low", gain: -4 }] }, [{ word: "slaps" }]),
  // ======== the snow in June, explained
  { say: N("The windows turn white. Outside, it's snowing. In June. Just like the morning Emily was left behind. She's been left behind again."), ...SNOW, ambience: "amb_snow",
    ...glide(BACK, at([0.5, 1.15, ROW_Z(6) + 0.1], [-0.2, 1.0, 4.6], 46), 0.0, 3.0), actors: behind(riders([13, 12], { act: "scared", blink: false })), props: [{ id: "blizzard", at: [-0.3, 0.95, 4.6], steps: STEADY(60, 0.1) }],
    sfx: [{ t: 0.0, name: "storm_wind", gain: -4 }, { t: 0.2, name: "gasp", gain: -4 }, { word: "again.", name: "glass_slap", gain: -2 }], note: "the bus in a snowstorm: white windows, dark cold light, frost, frightened faces" },
  // ======== you run up and tap her shoulder
  { say: [N("So you run to the front and tap the driver's shoulder."), O("you", "Stop! Please! Go back!", { gap: 0.1 })], until: { word: "shoulder." }, ...SNOW, ambience: "amb_snow",
    ...glide(at([0.0, 1.2, ROW_Z(5)], [0.0, 1.05, -5.0], 50), at([-0.05, 1.25, -3.0], [-0.3, 1.05, -5.0], 50), 0.0, 2.0),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "neutral", facing: -1, idle: 0.2 }], props: [{ id: "blizzard", at: [0.0, 1.05, -5.0], steps: STEADY(30, 0.1) }],
    sfx: [{ t: 0.0, name: "breath_fast" }, ...STEADY(6, 0.3, 0.1).map((w) => ({ ...w, name: "step_floor" as const, gain: 4 }))], note: "you run up the aisle toward the driver" },
  { cont: true, ...SNOW, ambience: "amb_snow", ...lock(TAP), actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "shock", facing: "camera", idle: 0.2 }], props: [REACH(TAP)],
    sfx: [{ t: 0.05, name: "thunk", gain: -10 }], note: "your hand on her shoulder; she turns, startled" },
  // ======== the doors; Emily's three seconds
  { say: [N("She stops. The doors open. And you give Emily her three seconds."), O("you", "One, two, three.", { gap: 0.1 })], ...SNOW, mood: "silence", ambience: "amb_snow", ...lock(AT_DOORS),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "scared", facing: 1, idle: 0.2 }], props: [{ id: "busDoors", at: [1.2, 0, -4.4], steps: [{ word: "doors" }, { word: "three.", n: 2 }] }, { id: "blizzard", at: [1.1, 1.0, -4.4], steps: STEADY(50, 0.1) }],
    sfx: [{ word: "stops.", name: "air_brake" }, { word: "doors", name: "bus_doors" }, { word: "doors", name: "storm_wind" }, { word: "three.", n: 2, name: "bus_doors", gain: -2 }], note: "the doors open on the storm; you count quickly; they shut" },
  { say: N("The snow stops. And the window by seat thirteen fogs up again. Emily made it on."), ...BUS, mood: "emily", ambience: "amb_bus", transition: "flash",
    ...glide(SEAT13, at([0.2, 1.24, ROW_Z(7) - 0.8], [-0.95, 1.12, ROW_Z(7) + 0.05], 38), 0.05, 3.5), actors: [], props: [{ id: "fogPane", at: SEAT(13), variant: "13up", steps: [{ word: "fogs" }] }],
    sfx: [{ word: "fogs", name: "dog_breath", gain: -10 }], note: "sunlight floods back; seat 13's window fogs up again" },
  // ======== Mr Hale dies of his illness
  insert("monitor", "a hospital heart monitor: HALE, R.; the line goes flat", { say: N("That night, Mr Hale died in hospital. He'd been very sick for a long time."), mood: "rest", ambience: false, transition: "dip",
    sfx: [{ t: 0.2, name: "monitor_beep" }, { t: 1.3, name: "monitor_beep" }, { word: "died", name: "monitor_flat" }] }, [{ word: "died" }]),
  // ======== two seats
  { say: N("The next morning, the window by seat fourteen is fogged up too. Mr Hale is riding with her now, so she'll never be left behind again."), ...BUS, mood: "emilyTender", ambience: "amb_bus_kids", transition: "dip",
    ...glide(at([0.05, 1.3, ROW_Z(7) - 0.75], [-1.2, 1.25, ROW_Z(7)], 46), at([-0.05, 1.3, ROW_Z(7) - 0.75], [1.2, 1.25, ROW_Z(7)], 46), 1.2, 1.8),
    actors: [], props: [FOG13, { id: "fogPane", at: SEAT(14), variant: "14" }], note: "seat 13's window fogged; the camera turns across the aisle: seat 14's window fogged too" },
  { say: [N("A boy goes to sit there. The girl next to you stops him."), O("priya", "Don't. That's Mr Hale's.", { gap: 0.3 })], ...BUS, ambience: "amb_bus_kids",
    ...lock(at([0.3, 1.5, ROW_Z(5)], [0.35, 0.95, ROW_Z(7) + 0.3], 54)),
    actors: [{ who: "kid", at: [0.0, 0, ROW_Z(7) + 0.15], act: "neutral", face: "confused", facing: "camera", idle: 0.2 }, ...riders([13, 14, 12], {}, 9).filter((a) => (a.at as V)[0] > 0 && (a.at as V)[2] > ROW_Z(7) + 0.5)],
    props: [{ id: "fogPane", at: SEAT(14), variant: "14" }], note: "a boy about to sit in seat 14 stops" },
  insert("vote", "end card: WOULD YOU SIT IN SEAT 13? YES / NO", { dur: 2.4, hold: 0.4, sfx: [{ t: 0.0, name: "musicbox_note", gain: -6 }] }),
];

const cast: Record<string, string | { extra: number; era: "pupil" }> = { hale: "hale", sub: "subDriver", noah: "noah", you: "seatKid", radio: "subDriver",
  priya: { extra: 270, era: "pupil" }, kid: { extra: 272, era: "pupil" }, s0: { extra: 273, era: "pupil" }, s1: { extra: 274, era: "pupil" } };
for (let k = 0; k < 44; k++) cast[`p${k}`] = { extra: 200 + k, era: "pupil" };

export const EMPTY_SEAT: Storyboard = {
  id: "empty-seat", title: "The Empty Seat",
  cast, voice: "georgeHushed",
  voices: { noah: "esNoah", hale: "esHale", sub: "esSub" },
  captionColors: { noah: "#9fd3ff", hale: "#f2c94c", sub: "#ffb070", esPriya: "#ff9ec7", esRadio: "#c9cfd8", esYouBoy: "#8fe3a1" },
  // the storytelling gate: every fact a viewer who knows nothing must be TOLD, and the words that tell it
  clarity: {
    premise: "Nobody may sit in one seat on your school bus, because it is kept for a girl the bus left behind in the snow years ago, and the driver who left her still stops for her every day.",
    facts: [
      { fact: "the cold-open handprint is impossible", said: "the back of a moving school bus" },
      { fact: "nobody ever sits in seat 13, even when the bus is crowded", said: "kids would rather stand" },
      { fact: "seat 13 is kept for a girl, by the driver", said: "it belongs to a girl called Emily" },
      { fact: "Noah sits there and the driver stops him", said: "He sits down in seat thirteen" },
      { fact: "why a fogged window in June is strange", said: "It's June. It's hot." },
      { fact: "what the fog means", said: "As if someone is breathing on it" },
      { fact: "why stopping at Elm Road is strange", said: "even though that stop was taken away" },
      { fact: "what the driver does there", said: "He opens the doors and counts to three" },
      { fact: "why you search it", said: "Why does your driver always stop at Elm Road" },
      { fact: "what happened in 1996", said: "drove straight past the Elm Road stop" },
      { fact: "who the girl was", said: "Her name was Emily Shaw" },
      { fact: "that she died (non-graphic)", said: "she never made it" },
      { fact: "the driver that day was Mr Hale", said: "The driver that morning was a young Mr Hale" },
      { fact: "why he counts three seconds", said: "just long enough for her to climb on" },
      { fact: "why there's a new driver (before the radio plays)", said: "Mr Hale got sick. A new driver covered his route" },
      { fact: "the new driver doesn't know", said: "She doesn't know about Elm Road" },
      { fact: "what the handprint is", said: "a small handprint, on the outside of the emergency door" },
      { fact: "why snow in June matters", said: "Just like the morning Emily was left behind" },
      { fact: "what the handprint means", said: "She's been left behind again" },
      { fact: "what you do (the action)", said: "run to the front and tap the driver's shoulder" },
      { fact: "why you count at the doors", said: "you give Emily her three seconds" },
      { fact: "that Emily got on", said: "Emily made it on" },
      { fact: "Mr Hale died of illness (nobody killed him)", said: "He'd been very sick" },
      { fact: "what seat 14's fog means", said: "Mr Hale is riding with her now" },
    ],
  },
  music: { mood: "emily", gain: -2 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
