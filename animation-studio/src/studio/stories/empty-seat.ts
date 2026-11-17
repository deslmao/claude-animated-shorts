// The Empty Seat (productions/empty-seat/script.md): Thinkora Ghost Stories, episode 1. Second person, George
// (georgeHushed); one line from the driver, Mr Hale (Brian). Frame 1 is the rule from the research notes: characters
// and motion, a darker interior, sound from the first frame (never a screen or a card first).
// Sound plan: Emily's theme (a music-box lullaby in minor) from frame 1; silence when the bus goes quiet; mystery for
// the investigation; Emily's theme in fragments over a heartbeat for 1996; tense then storm for the skipped stop and
// the handprint; true silence for the count of three; the music box again when her window fogs up; the lullaby on
// piano in major for the ending. Beds: the bus with kids / without, the snowstorm.
import type { Storyboard, Line, ShotSpec, ActorSpec, When } from "../story/types";
import { SEAT, ROW_Z } from "../themes/emptyseat";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (c0: ReturnType<typeof at>, c1: ReturnType<typeof at>, t = 0.1, dur = 3.0) => ({ camera: c0, cams: [{ t: 0, ...c0, blockOk: true }, { t, ...c1, glide: dur, blockOk: true }] });
const N = (text: string, pauses?: { after: string; s: number }[]): Line => ({ text, ...(pauses ? { pauses } : {}) });
const BUS = { set: "schoolBus", light: "interior" as const };
const ELM = { set: "schoolBusElm", light: "interior" as const };
// a close insert: the 9:16 card behind the bus (outside it), the camera 1 m in front of it
const CARD: V = [0, 1.4, 9.0], CARD_CAM = at([0, 1.4, 10.0], CARD, 51);
const insert = (variant: string, note: string, extra: Partial<ShotSpec> = {}, steps: When[] = []): ShotSpec =>
  ({ ...BUS, camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }], actors: [], props: [{ id: "esInsert", at: CARD, variant, steps }], note, ...extra });

// ---------------------------------------------------------------- the riders
// kids on the benches facing the front (toward a camera at the front of the aisle); seat 13's bench (row 7 left) is
// always empty; at the end seat 14's bench (row 7 right) is too. "you" sit in seat 12's bench (row 6 right).
const MANNER: Partial<ActorSpec>[] = [{ act: "neutral" }, { act: "happy" }, { act: "sleepy" }, { act: "thinking" }, { act: "neutral", beats: [{ t: 0.6, look: "left" }] }, { act: "happy", beats: [{ t: 0.9, look: "right" }] }, { act: "embarrassed" }];
const riders = (skip: number[], extra: Partial<ActorSpec> = {}, rows = 9): ActorSpec[] => {
  const out: ActorSpec[] = []; let k = 0;
  for (let r = 1; r <= rows; r++) for (const n of [2 * r - 1, 2 * r]) {
    if (skip.includes(n)) continue;
    for (const inner of [false, true]) { if (inner && (r % 3 === 0 || n === 11)) continue; out.push({ who: `p${k}`, at: SEAT(n, inner), mode: "sit", facing: "camera", idle: 0.3, ...MANNER[(k * 5) % MANNER.length], ...extra }); k++; }
  }
  return out;
};
const YOU_SEAT = SEAT(12, true);
const you = (act: ActorSpec["act"], extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "you", at: YOU_SEAT, mode: "sit", act, facing: "camera", idle: 0.25, ...extra });
const NOAH = (act: ActorSpec["act"], extra: Partial<ActorSpec> = {}): ActorSpec => ({ who: "noah", at: SEAT(13, true), mode: "sit", act, facing: "camera", idle: 0.3, ...extra });
const DRIVER: V = [-0.75, 0.45, -4.25];
// cameras
const AISLE_FAR = at([0.15, 1.6, ROW_Z(3)], [-0.7, 0.95, ROW_Z(7) + 0.2], 46);
const FRAME1 = at([0.3, 1.72, ROW_Z(5) + 0.1], [-0.8, 0.92, ROW_Z(7) + 0.2], 50);       // frame 1: down onto seat 13's empty bench and its fogged window
const FRAME1_NEAR = at([0.2, 1.64, ROW_Z(6) - 0.1], [-0.8, 0.95, ROW_Z(7) + 0.2], 46);
const MIRROR = at([-0.3, 1.72, ROW_Z(5) + 0.1], [0.8, 0.75, ROW_Z(7) + 0.2], 50);         // the same onto seat 14's bench
const MIRROR_NEAR = at([-0.2, 1.64, ROW_Z(6) - 0.1], [0.8, 0.8, ROW_Z(7) + 0.2], 46);
const SEAT13 = at([0.3, 1.25, ROW_Z(7) - 1.15], [-0.85, 1.05, ROW_Z(7) + 0.1], 44);   // seat 13's bench and its window, close
const AT_HALE = at([-0.05, 1.4, -2.95], [-0.75, 1.2, -4.25], 44);          // the driver, from the aisle behind him
const FRONT_HALE = at([0.4, 1.38, -4.95], [-0.75, 1.15, -4.2], 50);       // the driver, from the windscreen
const AT_DOORS = at([-0.55, 1.3, -2.5], [1.1, 1.0, -4.4], 50);             // the folding doors, from the aisle
const STEADY = (n: number, dt: number, t0 = 0) => Array.from({ length: n }, (_, i) => ({ t: t0 + i * dt }));

const shots: ShotSpec[] = [
  // ======== 1: the hook: down the aisle to the one empty bench (frame 1: kids, motion, sound)
  { say: N("Every morning, your school bus has one seat nobody is allowed to sit in. Today, someone is sitting in it."), until: { word: "in." }, ...BUS, mood: "emily",
    ...glide(FRAME1, FRAME1_NEAR, 0.0, 3.6), actors: [...riders([13]), you("neutral")], props: [{ id: "fogPane", at: SEAT(13), variant: "13" }],
    sfx: [{ t: 0.0, name: "kids_chatter", gain: 2 }, { t: 0.0, name: "bus_pullaway", gain: -4 }], note: "1 down the aisle to seat 13's empty bench, its fogged window" },
  { cont: true, ...BUS, ...glide(at([0.0, 1.3, ROW_Z(7) - 1.6], [-0.6, 0.9, ROW_Z(7) + 0.15], 46), SEAT13, 0.05, 2.0),
    actors: [NOAH("happy"), ...riders([13], {}, 9).filter((a) => ((a.at as V)[2] < ROW_Z(7) - 0.5 || (a.at as V)[2] > ROW_Z(7) + 0.5)), you("shock")],
    props: [{ id: "fogPane", at: SEAT(13), variant: "13" }], note: "1 someone is in it: Noah, the new kid, in the red hoodie" },
  // ======== 2: the rule: even when it's packed, kids would rather stand
  { say: N("Seat thirteen. By the window. Even when the bus is packed, kids would rather stand."), until: { word: "window." }, ...BUS,
    ...lock(at([0.35, 1.45, ROW_Z(7) - 0.75], [-1.0, 1.4, ROW_Z(7) + 0.15], 46)), actors: [], props: [{ id: "fogPane", at: SEAT(13), variant: "13" }], note: "2 the 13 plate over the empty bench" },
  { cont: true, ...BUS, ...lock(AISLE_FAR),
    actors: [...riders([13]), { who: "s0", at: [0.05, 0, ROW_Z(7) - 0.1], act: "neutral", facing: "camera", gesture: "hang", idle: 0.2 }, { who: "s1", at: [-0.08, 0, ROW_Z(7) + 0.7], act: "sleepy", facing: "camera", idle: 0.2 }, { who: "s2", at: [0.1, 0, ROW_Z(8) + 0.4], act: "neutral", facing: "camera", idle: 0.2 }],
    props: [{ id: "fogPane", at: SEAT(13), variant: "13" }], note: "2 kids standing by the empty bench" },
  // ======== 3: the window: fogged from the inside, even in June
  insert("window", "3 fogged from the inside, June sun outside", { say: N("And its window is always fogged up. From the inside. Even in June.") }),
  // ======== 4 + 5: Noah sits; the bus goes silent; Hale pulls over
  { say: N("But the new kid, Noah, doesn't know. He drops straight into it."), ...BUS, ...glide(at([0.15, 1.3, ROW_Z(7) - 1.3], [-0.6, 0.85, ROW_Z(7) + 0.15], 44), at([0.1, 1.25, ROW_Z(7) - 1.0], [-0.6, 0.85, ROW_Z(7) + 0.15], 40), 0.1, 2.5),
    actors: [NOAH("happy", { gesture: "spread" }), ...riders([13], {}, 9).filter((a) => (a.at as V)[2] > ROW_Z(7) + 0.5)], props: [{ id: "fogPane", at: SEAT(13), variant: "13" }],
    sfx: [{ word: "drops", name: "thunk", gain: -6 }], note: "4 Noah drops into seat 13" },
  { say: N("The whole bus goes silent. The driver, Mr Hale, pulls over.", [{ after: "silent.", s: 0.4 }]), ...BUS, mood: "rest", ambience: "amb_bus",
    ...lock(AISLE_FAR), actors: [...riders([13], { act: "shock", facing: "toward:noah" }), NOAH("nervous"), you("shock", { facing: "toward:noah" })], props: [{ id: "fogPane", at: SEAT(13), variant: "13" }],
    sfx: [{ word: "over.", name: "indicator", gain: 2 }, { word: "over.", name: "air_brake" }], note: "5 every head turns; the bus pulls over" },
  // ======== 6: Hale: "Not that one, son. That's Emily's."
  { say: { text: "Not that one, son. That's Emily's.", who: "hale", gap: 0.3 }, ...BUS, ambience: "amb_bus", ...lock(AT_HALE),
    actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera", idle: 0.2 }], note: "6 Hale turns round in his seat" },
  // ======== 8: the Elm Road stop where nobody waits
  { say: N("But you've noticed something else. Every morning, Mr Hale stops on Elm Road, where nobody ever waits. He opens the doors, counts to three, and drives on."), until: { word: "else." }, ...ELM, mood: "mystery",
    ...lock(at([-0.1, 1.25, ROW_Z(6) - 1.5], [0.6, 1.0, ROW_Z(6) + 0.16], 42)), actors: [you("suspicious"), ...riders([13, 12], {}, 9).filter((a) => (a.at as V)[2] > ROW_Z(6) + 0.5)], note: "8 you, watching" },
  { cont: true, ...ELM, ...lock(AT_DOORS), actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", facing: 1, idle: 0.2 }],
    props: [{ id: "busDoors", at: [1.2, 0, -4.4], steps: [{ word: "doors," }, { word: "on.", n: 2 }] }],
    sfx: [{ word: "Elm", name: "air_brake", gain: -4 }, { word: "doors,", name: "bus_doors" }, { word: "on.", n: 2, name: "bus_doors", gain: -2 }], note: "8 the doors fold open on the empty Elm Rd stop; three seconds; shut" },
  // ======== 9 + 10: closed in 1996; the yearbook
  insert("route", "9 the old route: Elm Rd, stop closed 1996", { say: N("So you look it up. The Elm Road stop was closed in 1996."), ambience: "amb_bus", sfx: [{ t: 0.05, name: "phone_tap", gain: -6 }, { word: "1996.", name: "sting_low", gain: -6 }] }),
  insert("yearbook", "10 the yearbook: Emily Shaw, aged eleven", { say: N("In the school library, the 1996 yearbook has one page with a black border. Emily Shaw. Aged eleven.", [{ after: "border.", s: 0.3 }]), ambience: "amb_room",
    sfx: [{ t: 0.1, name: "swish_soft", gain: -4 }, { word: "Emily", name: "musicbox_note", gain: -8 }] }),
  // ======== 11 + 12: 1996, the snow
  insert("snow1996", "11 1996: the bus goes past; the girl behind the snowbank", { say: N("That winter, the bus was running late. In the snow, the young driver didn't see her at the stop, and drove straight past."), mood: "emilyDread", ambience: "amb_snow",
    sfx: [{ word: "past.", name: "bus_pullaway", gain: -2 }] }, [{ word: "past." }]),
  insert("footprints", "12 her footprints, fading", { say: N("Emily tried to walk to school. She never got there.", [{ after: "school.", s: 0.4 }]), ambience: "amb_snow" }),
  // ======== 13: thirty years of stopping for her
  { say: N("The driver was Mr Hale. For thirty years, he's stopped for her every single morning. And kept her seat."), until: { word: "morning." }, ...BUS, mood: "hush", ambience: "amb_bus",
    ...glide(FRONT_HALE, at([0.3, 1.35, -4.9], [-0.75, 1.18, -4.2], 44), 0.1, 3.5), actors: [{ who: "hale", at: DRIVER, mode: "sit", act: "sad", facing: "camera", idle: 0.2, beats: [{ t: 1.6, look: "up" }] }], note: "13 Hale at the wheel, a glance at the mirror" },
  { cont: true, ...BUS, ambience: "amb_bus", ...glide(SEAT13, at([0.2, 1.22, ROW_Z(7) - 0.85], [-0.9, 1.08, ROW_Z(7) + 0.1], 40), 0.05, 2.5), actors: [], props: [{ id: "fogPane", at: SEAT(13), variant: "13" }], note: "13 her seat, kept" },
  // ======== 14 + 15: Hale in hospital; the new driver drives past
  insert("monitor", "14 Hale in hospital", { say: N("Then one morning, Mr Hale is in hospital. He's very ill. The new driver has never heard of Elm Road."), until: { word: "ill." }, mood: "tense", ambience: false,
    sfx: [{ t: 0.3, name: "monitor_beep" }, { t: 1.55, name: "monitor_beep" }, { t: 2.8, name: "monitor_beep" }] }),
  { cont: true, ...BUS, ...lock(FRONT_HALE), actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "neutral", facing: "camera", idle: 0.3 }], note: "14 the stand-in driver" },
  insert("passStop", "15 the Elm Rd stop flashing past", { say: N("She drives straight past it."), ambience: "amb_bus", sfx: [{ t: 0.2, name: "whoosh_short" }, { t: 0.3, name: "bus_pullaway", gain: -6 }] }),
  // ======== 16 + 17: the handprint; you run to the front
  insert("backWindow", "16 the handprint on the back window; snow on the road", { say: N("Then something slaps the back window. A small handprint. From outside. And on the road behind the bus, there's snow. In June.", [{ after: "window.", s: 0.3 }]), mood: "storm", ambience: "amb_bus",
    sfx: [{ word: "slaps", name: "glass_slap" }, { word: "handprint.", name: "glass_slap", gain: -3 }, { word: "outside.", name: "glass_slap", gain: -1 }, { word: "snow.", name: "sting_low", gain: -4 }] }, [{ word: "slaps" }]),
  { say: N("You run to the front and scream at her to stop."), ...BUS, ambience: "amb_bus", ...lock(at([0.0, 1.32, -4.3], [0.0, 1.0, 1.2], 50)),
    actors: [{ who: "you", at: [0.0, 0, 2.6], act: "scared", walk: { to: [0.0, 0, -2.6], t0: 0.05, t1: 1.9, mode: "run", view: "front" } }, ...riders([13], { act: "shock" }, 9).filter((a) => (a.at as V)[2] < ROW_Z(8))],
    sfx: STEADY(7, 0.26, 0.15).map((w) => ({ ...w, name: "step_floor" as const, gain: 4 })), note: "17 you run down the aisle" },
  // ======== 18 + 19: the stop; three seconds; her window fogs up again
  { say: N("She stops. The doors open on the empty stop. You count to three."), ...ELM, mood: "silence", ambience: "amb_bus", ...lock(AT_DOORS),
    actors: [{ who: "sub", at: DRIVER, mode: "sit", act: "scared", facing: 1, idle: 0.2 }], props: [{ id: "busDoors", at: [1.2, 0, -4.4], steps: [{ word: "open" }] }],
    sfx: [{ word: "stops.", name: "air_brake" }, { word: "open", name: "bus_doors" }, { word: "three.", name: "heartbeat", gain: -2 }], note: "18 the doors open on the empty stop" },
  { say: { text: "And the window by seat thirteen fogs up again.", gap: 1.3 }, ...BUS, mood: "emily", ambience: "amb_bus", ...glide(SEAT13, at([0.2, 1.24, ROW_Z(7) - 0.8], [-0.95, 1.12, ROW_Z(7) + 0.05], 38), 0.05, 3.0),
    actors: [], props: [{ id: "fogPane", at: SEAT(13), variant: "13up", steps: [{ word: "fogs" }] }], sfx: [{ word: "fogs", name: "dog_breath", gain: -10 }], note: "19 her window fogs up: she's aboard" },
  // ======== 20: Hale dies in hospital
  insert("monitor", "20 Hale dies in his sleep", { say: N("That night, in hospital, Mr Hale dies in his sleep."), mood: "rest", ambience: false,
    sfx: [{ t: 0.2, name: "monitor_beep" }, { t: 1.4, name: "monitor_beep" }, { word: "dies", name: "monitor_flat" }] }, [{ word: "dies" }]),
  // ======== 21 + 22: two fogged windows; two seats nobody may sit in (the loop)
  { say: N("The next morning, the window by seat fourteen is fogged up too. He's riding with her now, so she's never left behind again."), until: { word: "too." }, ...BUS, mood: "emilyTender", ambience: "amb_bus_kids", transition: "dip",
    ...glide(at([0.05, 1.3, ROW_Z(7) - 0.75], [-1.2, 1.25, ROW_Z(7)], 46), at([-0.05, 1.3, ROW_Z(7) - 0.75], [1.2, 1.25, ROW_Z(7)], 46), 0.6, 1.4),
    actors: [], props: [{ id: "fogPane", at: SEAT(13), variant: "13" }, { id: "fogPane", at: SEAT(14), variant: "14up", steps: [{ word: "fourteen" }] }], note: "21 both windows fogged" },
  { cont: true, ...BUS, ...glide(MIRROR, MIRROR_NEAR, 0.05, 3.5),
    actors: [...riders([13, 14]), you("relief", { face: "relief" }), { who: "s0", at: [0.05, 0, ROW_Z(7) - 0.1], act: "neutral", facing: "camera", gesture: "hang", idle: 0.2 }, { who: "s1", at: [-0.08, 0, ROW_Z(7) + 0.7], act: "sleepy", facing: "camera", idle: 0.2 }],
    props: [{ id: "fogPane", at: SEAT(14), variant: "14" }], note: "21 seat 14's bench, empty, its window fogged" },
  { say: N("Now your school bus has two seats nobody is allowed to sit in."), ...BUS, ambience: "amb_bus_kids", hold: 0.6,
    ...glide(FRAME1, MIRROR, 0.3, 2.6), actors: [...riders([13, 14]), you("neutral"), { who: "s0", at: [0.05, 0, ROW_Z(7) - 0.1], act: "neutral", facing: "camera", gesture: "hang", idle: 0.2 }],
    props: [{ id: "fogPane", at: SEAT(13), variant: "13" }, { id: "fogPane", at: SEAT(14), variant: "14" }], note: "22 the opening push, two empty seats (the loop)" },
];

const cast: Record<string, string | { extra: number; era: "pupil" }> = { hale: "hale", sub: "subDriver", noah: "noah", you: "seatKid" };
for (let k = 0; k < 40; k++) cast[`p${k}`] = { extra: 200 + k, era: "pupil" };
for (let k = 0; k < 3; k++) cast[`s${k}`] = { extra: 260 + k, era: "pupil" };

export const EMPTY_SEAT: Storyboard = {
  id: "empty-seat", title: "The Empty Seat",
  cast, voice: "georgeHushed", voices: { hale: "brian" }, music: { mood: "emily", gain: -2 }, motionBlur: true, controlledBlur: true, engine: 3, autoSfx: false,
  shots,
};
