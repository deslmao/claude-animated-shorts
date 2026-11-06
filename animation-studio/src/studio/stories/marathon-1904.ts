// "The Worst Olympic Marathon Ever" (Thinkora Video 04, the 1904 St. Louis Olympic marathon). Research, script and the
// approved storyboard design: productions/marathon-1904/ (storyboard-design.md). The narration is LOCKED: the say lines,
// voices and in-line pauses below are the approved text and timing (65.33 s); never edit them.
// Look: "Race Day, 1904": one hot, dusty dirt road through farmland (the race1904 theme's raceRoad set, golden light),
// in-world mile signs and a chalk race board as the scoreboard, dust as the motif. Camera: purposeful moves only
// (a cut for a new idea, a swoop into the object a word names, a follow while someone travels, a high angle to show
// where someone went); controlled motion blur.
// Cast: Milo plays Fred Lorz; Thomas Hicks, Felix Carvajal, Len Taunyane and Jan Mashiani are the theme's characters
// (one fixed look each); Gus is the organizer / official; Juno (1904 dress) explains; extras: runners, handlers'
// helpers, drivers, officials, spectators. Mid-line cuts are split shots (until / cont): they move no audio.
import type { Storyboard, V3 } from "../story/types";

const zc = (x: number) => 0.5 * Math.sin(0.12 * x);
/** a point on the race road: x along it, off = metres across (+ = camera side), y = height */
const R = (x: number, off = 0, y = 0): V3 => [x, y, Math.round((zc(x) + off) * 1000) / 1000];
const SEAT = 0.62;
/** spectators lining the road just before the finish (the same people in every finish shot) */
const SPECT = (acts: ("excited" | "happy" | "neutral")[] = ["excited", "happy"]) => [
  { who: "sp1", at: R(26.4, -2.0), act: acts[0], facing: 1 as const }, { who: "sp2", at: R(27.4, -2.05), act: acts[1 % acts.length], facing: 1 as const, gesture: "clap" as const },
  { who: "sp3", at: R(28.3, -2.0), act: acts[0], facing: 1 as const, gesture: "clap" as const }, { who: "sp4", at: R(26.8, 2.0), act: acts[1 % acts.length], facing: 1 as const },
  { who: "sp5", at: R(27.9, 2.05), act: acts[0], facing: 1 as const, gesture: "clap" as const },
];                  // a rider's floor height in the motor car (the card sits on the bench)
const LORZ_CAR: [number, number] = [0.35, 0.0], DRIVER_CAR: [number, number] = [-0.35, 0.25]; // track offsets: rider seat -> car (Lorz on the front of the bench: the seat back stays behind him)
const LORZ_SEAT = 0.72; // Lorz rides a little higher than the drivers, so his body reads over the car side

export const MARATHON1904: Storyboard = {
  id: "marathon-1904", title: "The Worst Olympic Marathon Ever",
  cast: {
    milo: "miloRunner", hicks: "hicks", carv: "carvajal", taun: "taunyane", mash: "mashiani",
    hA: "handlerA", hB: "handlerB", gus: "gusOfficial", juno: "juno1904", miloNow: "milo",
    mgr: { extra: 4, era: "victorian" }, drv: { extra: 11, era: "victorian" },
    off1: { extra: 2, era: "victorian" }, off2: { extra: 15, era: "victorian" },
    r1: { extra: 3, era: "runner1904" }, r2: { extra: 8, era: "runner1904" }, r3: { extra: 13, era: "runner1904" }, r4: { extra: 21, era: "runner1904" },
    garcia: { extra: 30, era: "runner1904" },
    sp1: { extra: 6, era: "victorian" }, sp2: { extra: 9, era: "victorian" }, sp3: { extra: 17, era: "victorian" }, sp4: { extra: 25, era: "victorian" }, sp5: { extra: 33, era: "victorian" },
  },
  music: "playful", musicDrop: { word: "Marathon", n: 3 }, motionBlur: true, controlledBlur: true, engine: 3,  // the music drops out in the pause before "On foot."
  shots: [
    // ---- 1. HOOK: three bizarre beats (each its own hard cut, on its word), then the race begins (a crane reveal) ----
    { say: { text: "A car ride. Rat poison. A nap. This was the 1904 Olympic marathon.", voice: "georgeLively", pauses: [{ after: "ride", s: 0.12 }, { after: "poison", s: 0.2 }] }, set: "raceRoad", light: "golden",
      note: "car headlamp rolls at the lens / the vial / Carvajal asleep / the start banner, runners surge off",
      camera: { move: "at", pos: R(-31.0, 1.25, 0.72), look: R(-34.6, 0.55, 0.8), fov: 36 },
      cams: [
        { word: "Rat", move: "insert", on: "hA.held", size: "close" },
        { word: "nap", move: "at", pos: [3.5, 1.15, -1.45], look: [2.8, 0.85, -3.4], fov: 40 },
        { word: "This", move: "at", pos: R(-20.2, 0.9, 1.15), look: R(-28.4, 0, 1.75), fov: 46 },
        { word: "marathon", move: "at", pos: R(-21.5, 6.4, 5.2), look: R(-26.5, 0, 0.6), fov: 46, swoop: 0.7 },
      ],
      actors: [
        { who: "mgr", at: R(-38.6, 0.05, SEAT), mode: "sit", act: "happy", walk: { to: R(-34.9, 0.05, SEAT), t0: 0, t1: 1.0, mode: "ride" } },  // stops ~2 m short of the lens
        { who: "hA", at: R(-24.6, -1.6), act: "neutral", facing: 0, gesture: "hold", hold: "vial" },
        { who: "carv", at: "napSpot", mode: "sit", face: "sleepy", act: "sleepy" },
        { who: "milo", at: R(-28.9, -0.3), act: "determined", facing: 1, walk: { to: R(-23.5, -0.3), t0: 0, t1: 5.7, from: { word: "marathon" }, mode: "run" } },
        { who: "hicks", at: R(-29.2, 0.6), act: "determined", facing: 1, walk: { to: R(-24.0, 0.6), t0: 0, t1: 5.7, from: { word: "marathon" }, mode: "run" } },
        { who: "taun", at: R(-29.9, -0.8), act: "determined", facing: 1, walk: { to: R(-24.8, -0.8), t0: 0, t1: 5.7, from: { word: "marathon" }, mode: "run" } },
        { who: "mash", at: R(-30.3, 0.2), act: "determined", facing: 1, walk: { to: R(-25.4, 0.2), t0: 0, t1: 5.7, from: { word: "marathon" }, mode: "run" } },
        { who: "r1", at: R(-30.8, 0.9), act: "determined", facing: 1, walk: { to: R(-26.0, 0.9), t0: 0, t1: 5.7, from: { word: "marathon" }, mode: "run" } },
        { who: "r2", at: R(-31.2, -0.5), act: "neutral", facing: 1, walk: { to: R(-26.4, -0.5), t0: 0, t1: 5.7, from: { word: "marathon" }, mode: "run" } },
      ],
      props: [
        { id: "motorCar1904", at: R(-37.6, 0.3), variant: "running", track: { who: "mgr", offset: DRIVER_CAR } },
        { id: "finishArch", at: R(-27.6), yaw: 90, variant: "ST. LOUIS 1904" },
      ],
      fx: [{ kind: "zzz", on: "carv", word: "nap", life: 0.95 }],
      sfx: [{ word: "ride", name: "honk" }, { t: 0, name: "engine" }, { word: "poison", name: "clink" }] },

    // ---- 2. The conditions: the pack (follow), the heat (close), the dust (a car passes), the one water stop ----
    { say: "Thirty-two runners, ninety-degree heat, dusty roads, and one official water stop.", set: "raceRoad", light: "golden", transition: "cut",
      camera: { move: "at", pos: R(-22.0, 6.2, 1.0), look: R(-25.6, 0, 1.1), fov: 44 },
      cams: [
        { word: "ninety", move: "at", pos: R(-18.4, 1.3, 1.5), look: R(-22.6, -0.2, 1.4), fov: 42 },
        { word: "dusty", move: "at", pos: R(-13.6, 4.2, 1.5), look: R(-18.0, -0.4, 0.9), fov: 46 },
        { word: "water", move: "at", pos: [-6.0, 1.5, 3.6], look: [-7.5, 1.2, -2.8], fov: 44 },
        { word: "stop", move: "at", pos: [-6.2, 1.4, 2.5], look: [-7.3, 1.15, -2.9], fov: 42, glide: 0.9 },
      ],
      actors: [
        { who: "milo", at: R(-25.8, -0.3), act: "determined", walk: { to: R(-15.5, -0.3), t0: 0, t1: 4.2, mode: "run" }, beats: [{ word: "heat", face: "pained" }, { word: "dusty", face: "disgusted" }] },
        { who: "hicks", at: R(-26.4, 0.6), act: "neutral", walk: { to: R(-16.4, 0.6), t0: 0, t1: 4.2, mode: "run" } },
        { who: "taun", at: R(-27.0, -0.8), act: "determined", walk: { to: R(-16.9, -0.8), t0: 0, t1: 4.2, mode: "run" } },
        { who: "r1", at: R(-27.6, 0.9), act: "neutral", walk: { to: R(-17.8, 0.9), t0: 0, t1: 4.2, mode: "run" } },
        { who: "r2", at: R(-28.3, -0.4), act: "neutral", walk: { to: R(-18.6, -0.4), t0: 0, t1: 4.2, mode: "run" } },
        { who: "drv", at: R(-30.0, -1.45, SEAT), mode: "sit", act: "neutral", walk: { to: R(-11.0, -1.45, SEAT), t0: 1.6, t1: 3.6, mode: "ride" } },
      ],
      props: [
        { id: "scoreBoard", at: R(-25.7, -1.95), variant: "STARTERS: 32" },
        { id: "motorCar1904", at: R(-29.6, -1.15), variant: "running", track: { who: "drv", offset: DRIVER_CAR } },
        { id: "signBoard", at: [-6.7, 0, -2.3], variant: "WATER MILE 12" },
      ],
      fx: [{ kind: "sweat", on: "milo", word: "heat", life: 1.0 }, { kind: "puff", on: "taun", word: "dusty", life: 0.9 }, { kind: "puff", on: "r2", word: "roads", life: 0.8 }],
      sfx: [{ word: "dusty", name: "engine" }] },

    // ---- 3. The organizer at the dry well: a thoughtful glance from the empty bucket to the panting runners ----
    { say: "The organizer reportedly wanted to study dehydration.", set: "raceRoad", light: "golden", transition: "cut",
      camera: { move: "at", pos: [-8.2, 1.45, 1.9], look: [-9.2, 1.25, -1.4], fov: 38 },
      cams: [{ word: "study", move: "closeUp", on: "gus", from: -25, glide: 0.6 }],
      actors: [
        { who: "gus", at: "wellSide", act: "thinking", facing: 1, gesture: "chin", beats: [{ word: "reportedly", look: "right" }, { word: "study", look: "camera", face: "suspicious" }] },
        { who: "r3", at: R(-14.0, 0.5), act: "neutral", walk: { to: R(-4.0, 0.5), t0: 0, t1: 2.9, mode: "run" } },
      ],
      fx: [{ kind: "question", on: "gus", word: "dehydration", life: 1.2 }] },

    // ---- 4. Lorz: cramp at the MILE 9 sign, the car pulls up ... cut on action ... he rides, grinning ----
    { say: "Fred Lorz got cramps at mile nine and rode the next eleven in a car.", set: "raceRoad", light: "golden", transition: "cut", until: { word: "rode" },
      camera: { move: "frame", on: ["milo", "mgr"], size: "full", from: 25, height: 1.25 },
      cams: [
        { word: "cramps", move: "frame", on: ["milo"], size: "medium", from: 0, height: 1.35 },
        { word: "mile", move: "insert", on: "signBoard", size: "macro", swoop: true },
        { word: "nine", move: "frame", on: ["milo", "mgr"], size: "full", from: 25, height: 1.25 },
      ],
      actors: [
        { who: "milo", at: R(-17.4, 0), act: "neutral", facing: 0, beats: [{ word: "cramps", act: "scared", face: "pained", gesture: "belly" }, { word: "nine", face: "relief" }], moves: [{ word: "cramps", kind: "stagger" }] },
        { who: "mgr", at: R(-26.0, 0.55, SEAT), mode: "sit", act: "happy", walk: { to: R(-18.4, 0.55, SEAT), t0: 0.6, t1: 2.0, mode: "ride" } },
      ],
      props: [
        { id: "signBoard", at: R(-16.6, -1.9), variant: "MILE 9" },
        { id: "motorCar1904", at: R(-25.6, 0.85), variant: "running", track: { who: "mgr", offset: DRIVER_CAR } },
      ],
      sfx: [{ word: "nine", name: "honk" }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut",
      note: "riding: the camera tracks alongside the car; Lorz leans back and grins at us as he passes the runners",
      camera: { move: "follow", on: "milo", size: "full", from: -18, height: 1.25 },
      actors: [
        { who: "milo", at: R(-15.0, 0.75, LORZ_SEAT), mode: "sit", act: "proud", walk: { to: R(-6.0, 0.75, LORZ_SEAT), t0: 0, t1: 1.75, mode: "ride" }, beats: [{ word: "eleven", look: "camera", face: "grin" }] },
        { who: "mgr", at: R(-15.0, 0.05, SEAT), mode: "sit", act: "happy", walk: { to: R(-6.0, 0.05, SEAT), t0: 0, t1: 1.75, mode: "ride" } },
        { who: "r1", at: R(-12.5, -0.9), act: "sad", walk: { to: R(-9.6, -0.9), t0: 0, t1: 1.75, mode: "run" } },
        { who: "r2", at: R(-10.5, -0.6), act: "neutral", walk: { to: R(-7.8, -0.6), t0: 0, t1: 1.75, mode: "run" } },
      ],
      props: [{ id: "motorCar1904", at: R(-14.6, 1.0), variant: "running", track: { who: "milo", offset: LORZ_CAR } }],
      sfx: [{ t: 0, name: "engine" }] },

    // ---- 5. The breakdown at MILE 20 (bang, steam), he jogs in, and breaks the tape first ----
    { say: "When it broke down, he jogged in and finished first.", set: "raceRoad", light: "golden", transition: "cut", until: { word: "he" },
      camera: { move: "at", pos: R(21.4, 4.6, 1.45), look: R(19.0, -0.5, 1.0), fov: 46 },
      actors: [
        { who: "milo", at: R(15.5, 0.75, LORZ_SEAT), mode: "sit", act: "happy", walk: { to: R(18.8, 0.75, LORZ_SEAT), t0: 0, t1: 0, until: { word: "broke" }, mode: "ride" }, beats: [{ word: "broke", face: "shock" }] },
        { who: "mgr", at: R(15.5, 0.05, SEAT), mode: "sit", act: "happy", walk: { to: R(18.8, 0.05, SEAT), t0: 0, t1: 0, until: { word: "broke" }, mode: "ride" }, beats: [{ word: "broke", face: "shock" }] },
      ],
      props: [
        { id: "motorCar1904", at: R(15.9, 1.0), variant: "running", track: { who: "milo", offset: LORZ_CAR } },
        { id: "signBoard", at: R(19.9, -1.9), variant: "MILE 20" },
      ],
      kicks: [{ word: "broke" }],
      fx: [{ kind: "puff", on: "mgr", word: "broke", life: 0.9 }, { kind: "burst", on: "milo", word: "broke", life: 0.5 }, { kind: "exclaim", on: "milo", word: "down", life: 0.5 }],
      sfx: [{ word: "broke", name: "backfire" }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut", until: { word: "and" },
      camera: { move: "at", pos: R(23.4, 5.2, 1.3), look: R(21.2, 0.3, 1.0), fov: 48 },
      actors: [
        { who: "milo", at: R(19.6, 0.9), act: "happy", walk: { to: R(23.6, 0.3), t0: 0, t1: 0.65, mode: "run" } },
        { who: "r3", at: R(21.4, -0.7), act: "sad", walk: { to: R(22.4, -0.7), t0: 0, t1: 0.65, mode: "walk" } },
      ] },
    { cont: true, set: "raceRoad", light: "golden", transition: "whip",
      camera: { move: "at", pos: R(36.6, 0.7, 1.0), look: R(29.6, 0, 1.55), fov: 40 },
      actors: [
        ...SPECT(),
        { who: "milo", at: R(27.2, 0), act: "excited", walk: { to: R(31.6, 0), t0: 0, t1: 0.8, mode: "run" }, beats: [{ word: "first", gesture: "cheer", face: "laugh" }] },
      ],
      props: [
        { id: "finishArch", at: R(30), yaw: 90, variant: "FINISH" },
        { id: "finishTape", at: R(30), yaw: 90, steps: [{ word: "finished" }] },
      ],
      sfx: [{ word: "first", name: "applause" }] },

    // ---- 6. "It was a joke!" (Milo, close: sheepish grin, shrug, a glance at the officials) ----
    { say: { who: "milo", text: "It was a joke!", voice: "liam" }, set: "raceRoad", light: "golden", transition: "cut",
      camera: { move: "closeUp", on: "milo", from: 15 },
      actors: [{ who: "milo", at: R(31.6, 0), act: "embarrassed", facing: 0, gesture: "shrug", beats: [{ word: "joke", look: "left" }] }] },

    // ---- 7. The officials don't laugh (a held high angle over Milo); the ban, chalked on the race board ----
    { say: "Officials didn't laugh. He was banned for life.", set: "raceRoad", light: "golden", transition: "cut",
      camera: { move: "at", pos: R(33.4, 1.55, 1.6), look: R(30.4, -1.85, 1.35), fov: 42 },
      cams: [{ word: "banned", move: "insert", on: "scoreBoard", size: "macro", swoop: true }],
      actors: [
        { who: "milo", at: R(31.9, 0.3), act: "nervous", facing: -1 },
        { who: "gus", at: R(30.4, -1.7), act: "angry", face: "stern", gesture: "crossArms", facing: 1 },
        { who: "off1", at: R(29.4, -1.9), act: "neutral", face: "stern", gesture: "crossArms", facing: 1 },
        { who: "off2", at: R(31.4, -1.9), act: "neutral", face: "stern", gesture: "hips", facing: -1 },
      ],
      props: [{ id: "scoreBoard", at: "board", variant: "BANNED FOR LIFE" }],
      sfx: [{ word: "banned", name: "sting_low" }] },

    // ---- 8. Hicks's treatment: held up by his handlers; the egg, the brandy, the vial (each a macro on its word);
    //      the effect shown, not labelled: a jolt on "stimulant", dizzy stars on "rat poison" ----
    { say: "The real winner, Thomas Hicks, was given egg whites, brandy and strychnine — a stimulant that's also used as rat poison.", set: "raceRoad", light: "golden", transition: "whip",
      camera: { move: "frame", on: ["hA", "hicks", "hB"], size: "full", from: 15, height: 1.3 },
      cams: [
        { word: "egg", move: "insert", on: "hA.held", size: "close", swoop: true },
        { word: "brandy", move: "insert", on: "hB.held", size: "close" },
        { word: "strychnine", move: "insert", on: "hA.held", size: "close" },
        { word: "stimulant", move: "frame", on: ["hicks"], size: "medium", from: 10, height: 1.45 },
      ],
      actors: [
        { who: "hA", at: R(22.2, -0.15), act: "neutral", facing: 1, gesture: "hold", hold: "egg", beats: [{ word: "strychnine", hold: "vial" }] },
        { who: "hicks", at: R(23.0, 0.05), act: "dazed", face: "dazed", moves: [{ t: 0.3, kind: "stagger" }, { word: "stimulant", kind: "hop" }, { word: "rat", kind: "stagger" }],
          beats: [{ word: "stimulant", face: "shock" }, { word: "rat", face: "dazed" }] },
        { who: "hB", at: R(23.8, 0.0), act: "neutral", facing: -1, gesture: "hold", hold: "hipFlask", beats: [{ word: "strychnine", hold: null, gesture: "hang" }] },
      ],
      fx: [{ kind: "exclaim", on: "hicks", word: "stimulant", life: 0.8 }, { kind: "stars", on: "hicks", word: "rat", life: 0.75 }],
      sfx: [{ word: "egg", name: "crack_egg" }, { word: "strychnine", name: "clink" }] },

    // ---- 9. He staggers over the line; 3:28:53 chalked; pull out: the slowest winning time ever ----
    { say: "He staggered home in three hours twenty-eight minutes, the slowest Olympic winning time ever.", set: "raceRoad", light: "golden", transition: "cut",
      camera: { move: "at", pos: R(36.6, 0.7, 1.0), look: R(29.6, 0, 1.55), fov: 40 },
      cams: [
        { word: "three", move: "insert", on: "scoreBoard", size: "macro", swoop: true },
        { word: "slowest", move: "at", pos: R(31.1, 3.6, 1.35), look: R(31.1, -0.7, 1.25), fov: 44, glide: 0.8 },
      ],
      actors: [
        ...SPECT(),
        { who: "hA", at: R(27.6, -0.75), act: "neutral", walk: { to: R(32.3, -0.7), t0: 0, t1: 1.6, mode: "walk" }, beats: [{ word: "slowest", gesture: "hips" }] },
        { who: "hicks", at: R(27.6, 0.05), act: "dazed", walk: { to: R(31.5, 0.1), t0: 0, t1: 1.6, mode: "walk" }, beats: [{ word: "slowest", face: "dazed" }] },
        { who: "hB", at: R(27.6, 0.8), act: "neutral", walk: { to: R(30.8, 0.95), t0: 0, t1: 1.6, mode: "walk" }, beats: [{ word: "slowest", gesture: "wave" }] },
      ],
      props: [
        { id: "finishArch", at: R(30), yaw: 90, variant: "FINISH" },
        { id: "scoreBoard", at: "board", variant: "3:28:53" },
        { id: "scoreBoard", at: R(30.0, -1.75), variant: "SLOWEST EVER" },
      ],
      sfx: [{ t: 1.0, name: "applause", gain: -8 }] },

    // ---- 10. Carvajal: the empty purse / street clothes beside a vested runner / the rotten apple and the nap
    //      (held over the narration's pause) / fourth ----
    { say: { text: "Cuba's Félix Carvajal gambled away his travel money, ran in street clothes, ate rotten apples, napped... and still finished fourth.", pauses: [{ after: "napped", s: 0.35, cut: 0.06 }] }, set: "raceRoad", light: "golden", transition: "whip", until: { word: "ran" },
      camera: { move: "lowHero", on: "carv", from: 15 },
      cams: [
        { word: "gambled", move: "insert", on: "carv.held", size: "close", swoop: true },
        { word: "money", move: "frame", on: ["carv"], size: "medium", from: 10, height: 1.2 },
      ],
      actors: [{ who: "carv", at: "orchardRoad", act: "happy", facing: 0, gesture: "hold", hold: "coinBag", beats: [{ word: "money", hold: null, act: "shrug", face: "embarrassed" }] }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut", until: { word: "ate" },
      camera: { move: "follow", on: "carv", size: "full", from: 35, height: 1.1 },
      actors: [
        { who: "carv", at: R(-3.2, 0.5), act: "happy", walk: { to: R(0.2, 0.5), t0: 0, t1: 1.2, mode: "run" } },
        { who: "r4", at: R(-3.4, -0.8), act: "neutral", walk: { to: R(-0.1, -0.8), t0: 0, t1: 1.2, mode: "run" } },
      ] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut", until: { word: "napped" },
      note: "under the apple tree: a red apple to his mouth, a bite, it's rotten (a quick close look at the bitten brown apple), his face",
      camera: { move: "frame", on: ["carv"], size: "medium", from: 15, height: 1.35 },
      cams: [
        { word: "apples", move: "insert", on: "carv.held", size: "close" },
        { t: 0.98, move: "closeUp", on: "carv", from: 15 },
      ],
      actors: [{ who: "carv", at: [2.5, 0, -3.0], act: "happy", facing: 0, gesture: "hold", hold: "apple",
        beats: [{ t: 0.04, gesture: "eat" }, { word: "rotten", hold: "appleRotten", face: "disgusted" }, { t: 0.45, gesture: "hold" }] }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut", until: { word: "finished" },
      note: "the nap, from above, held over the narration's pause",
      camera: { move: "at", pos: [3.6, 2.7, -0.7], look: [2.7, 0.9, -3.3], fov: 44 },
      cams: [{ word: "still", move: "at", pos: [3.4, 2.4, -1.2], look: [2.7, 0.9, -3.3], fov: 42, glide: 0.6 }],
      actors: [{ who: "carv", at: "napSpot", mode: "sit", act: "sleepy", face: "sleepy" }],
      fx: [{ kind: "zzz", on: "carv", t: 0.1, life: 1.0 }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "whip",
      camera: { move: "at", pos: R(36.6, 0.9, 1.0), look: R(29.2, 0.55, 1.55), fov: 42 },
      actors: [
        ...SPECT(),{ who: "carv", at: R(27.6, 0), act: "excited", walk: { to: R(31.4, 0), t0: 0, t1: 0.9, mode: "run" }, beats: [{ word: "fourth", gesture: "cheer" }] }],
      props: [
        { id: "finishArch", at: R(30), yaw: 90, variant: "FINISH" },
        { id: "scoreBoard", at: R(27.4, 1.3), yaw: 90, variant: "CARVAJAL 4TH" },
      ],
      sfx: [{ word: "fourth", name: "applause" }] },

    // ---- 11. Taunyane and the dog: a strong runner on the road ... the dog bursts out and chases him OFF the road
    //      into the field (a low chase from behind, then a high wide: the COURSE arrow points the other way) ... 9th ----
    { say: "South Africa's Len Taunyane was chased a mile off course by a dog, and still finished ninth.", set: "raceRoad", light: "golden", transition: "cut", until: { word: "chased" },
      camera: { move: "follow", on: "taun", size: "full", from: 25, height: 1.0 },
      actors: [{ who: "taun", at: R(4.0, 0.2), act: "determined", walk: { to: R(9.2, 0.2), t0: 0, t1: 1.6, mode: "run" } }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut", until: { word: "and" },
      camera: { move: "follow", on: "taun", size: "wide", from: -90, height: 1.0 },   // side-on: runner and dog both in profile
      cams: [{ word: "off", move: "at", pos: [10.8, 4.6, 4.3], look: [13.2, 0.6, -4.7], fov: 44, glide: 0.5 }],      // high: the COURSE arrow points the other way
      actors: [{ who: "taun", at: R(10.4, 0.0), act: "scared", walk: { to: [14.2, 0, -8.4], t0: 0, t1: 2.0, mode: "run" }, face: "scared" }],
      props: [
        { id: "farmDogCollie", at: R(10.0, 1.6), scale: 1.35, track: { who: "taun", behind: 0.85 } },
        { id: "arrowSign", at: R(13.4, -1.85), variant: "COURSE" },
      ],
      fx: [{ kind: "speed", on: "taun", t: 0.6, life: 1.2 }],
      sfx: [{ t: 0.05, name: "bark" }, { t: 0.7, name: "bark" }, { t: 1.4, name: "bark" }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "whip",
      camera: { move: "at", pos: R(36.6, 0.9, 1.0), look: R(29.2, 0.55, 1.55), fov: 42 },
      actors: [
        ...SPECT(),
        { who: "taun", at: R(27.6, 0.1), act: "proud", walk: { to: R(31.4, 0.1), t0: 0, t1: 0.9, mode: "run" } },
        { who: "mash", at: R(24.4, -0.6), act: "determined", walk: { to: R(27.0, -0.6), t0: 0, t1: 1.1, mode: "run" } },
      ],
      props: [
        { id: "finishArch", at: R(30), yaw: 90, variant: "FINISH" },
        { id: "scoreBoard", at: R(27.4, 1.3), yaw: 90, variant: "TAUNYANE 9TH" },
      ],
      sfx: [{ word: "ninth", name: "applause" }] },

    // ---- 12. "You see": Juno at the race board (14 / 32), the three Olympic marathons, then the callbacks ----
    { say: "You see, it was only the third Olympic marathon: no drug rules, little water, and car dust that nearly killed one runner.", set: "raceRoad", light: "golden", transition: "cut", until: { word: "no" },
      camera: { move: "insert", on: "scoreBoard", size: "macro" },
      cams: [
        { word: "see", move: "frame", on: ["juno"], size: "full", from: -25, height: 1.45, glide: 0.6 },
        { word: "third", move: "at", pos: R(34.3, 1.6, 1.75), look: R(34.3, -2.15, 1.75), fov: 40, glide: 0.5 },
      ],
      actors: [{ who: "juno", at: R(33.15, -1.55), act: "explain", facing: 1, beats: [{ word: "see", gesture: "present" }, { word: "third", gesture: "point" }] }],
      props: [
        { id: "scoreBoard", at: "board", variant: "FINISHED: 14 / 32" },
        { id: "scoreBoard", at: R(34.3, -2.15), variant: "1896 1900 1904" },
      ] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut", until: { word: "little" },
      camera: { move: "insert", on: "hA.held", size: "close" },
      actors: [{ who: "hA", at: R(22.2, -0.15), act: "neutral", facing: 1, gesture: "hold", hold: "vial" }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut", until: { word: "and" },
      camera: { move: "at", pos: [-6.2, 3.4, 0.4], look: [-8.0, 0.6, -3.4], fov: 38 },
      actors: [],
      props: [{ id: "signBoard", at: [-6.7, 0, -2.3], variant: "WATER MILE 12" }] },
    { cont: true, set: "raceRoad", light: "golden", transition: "cut",
      note: "a car passes and a runner (William Garcia, not named) is swallowed by its dust; a spectator rushes to help",
      camera: { move: "at", pos: R(-12.2, 3.2, 1.4), look: R(-15.4, -0.2, 0.9), fov: 46 },
      actors: [
        { who: "drv", at: R(-21.0, 0.9, SEAT), mode: "sit", act: "neutral", walk: { to: R(-9.0, 0.9, SEAT), t0: 0, t1: 1.4, mode: "ride" } },
        { who: "garcia", at: R(-15.4, -0.4), act: "dazed", face: "pained", gesture: "coverMouth", moves: [{ t: 0.9, kind: "stagger" }, { t: 1.5, kind: "stagger" }] },
        { who: "off1", at: R(-15.6, -3.2), act: "scared", walk: { to: R(-15.6, -1.2), t0: 1.2, t1: 2.2, mode: "run" } },
      ],
      props: [{ id: "motorCar1904", at: R(-20.6, 1.15), variant: "running", track: { who: "drv", offset: DRIVER_CAR } }],
      fx: [{ kind: "puff", on: "garcia", t: 0.55, life: 0.9 }, { kind: "puff", on: "garcia", t: 1.15, life: 0.9 }, { kind: "sweat", on: "garcia", t: 1.3, life: 1.0 }],
      sfx: [{ t: 0.3, name: "engine" }, { t: 1.0, name: "gasp", gain: -6 }] },

    // ---- 13. Today: a white flash to a modern street race; Milo grabs a cup at the water table; the banned board ----
    { say: "Today, races hand out water, and strychnine is banned.", set: "city", light: "day", transition: "flash",
      camera: { move: "at", pos: [0.75, 1.35, -2.0], look: [0.7, 1.0, -6.3], fov: 42 },
      cams: [{ word: "strychnine", move: "insert", on: "scoreBoard", size: "macro", swoop: true }],
      actors: [{ who: "miloNow", at: "b", act: "happy", facing: 0, gesture: "grab", reach: "waterTable", beats: [{ word: "water", gesture: "thumbsUp" }] }],
      props: [
        { id: "waterTable", at: "b", offset: [0.78, -0.12], yaw: 90 },
        { id: "signBoard", at: "b", offset: [0.95, -1.35], variant: "WATER" },
        { id: "scoreBoard", at: "b", offset: [-0.9, -0.9], variant: "NO STRYCHNINE" },
      ],
      sfx: [{ word: "water", name: "splash", gain: -8 }] },

    // ---- 14. The punchline: "And Lorz?" (a glance to us), the ban cut short (the board again), then spring 1905:
    //      Boston, the tape, the pause (the music drops out), and his feet on "On foot." ----
    { say: { text: "And Lorz? His ban was cut short, and next spring he won the Boston Marathon. On foot.", pauses: [{ after: "Lorz", s: 0.3 }, { after: "Marathon", s: 0.6 }] }, set: "raceRoad", light: "golden", transition: "whip", until: { word: "next" },
      camera: { move: "closeUp", on: "milo", from: 10 },
      cams: [{ word: "ban", move: "insert", on: "scoreBoard", size: "macro", swoop: true }],
      actors: [{ who: "milo", at: R(31.4, 0.2), act: "suspicious", facing: 0, beats: [{ word: "Lorz", look: "camera", face: "grin" }] }],
      props: [{ id: "scoreBoard", at: "board", variant: "BANNED 6 MONTHS" }],
      fx: [{ kind: "question", on: "milo", word: "Lorz", life: 0.9 }] },
    { cont: true, set: "raceRoad", light: "day", transition: "whip",
      camera: { move: "at", pos: R(36.6, 0.7, 1.0), look: R(29.6, 0, 1.55), fov: 40 },
      cams: [
        { word: "On", move: "at", pos: R(36.5, 0.25, 0.35), look: R(32.9, 0.05, 0.62), fov: 38, swoop: 0.45 },
      ],
      actors: [
        ...SPECT(["happy", "happy"]),{ who: "milo", at: R(25.0, 0), act: "excited", walk: { to: R(32.9, 0), t0: 0, t1: 3.42, mode: "run" }, beats: [{ word: "Boston", face: "laugh" }] }],
      props: [
        { id: "finishArch", at: R(30), yaw: 90, variant: "BOSTON 1905" },
        { id: "finishTape", at: R(30), yaw: 90, steps: [{ word: "Boston" }] },
      ],
      kicks: [{ word: "foot" }],
      sfx: [{ word: "Boston", name: "applause" }] },
  ],
};
