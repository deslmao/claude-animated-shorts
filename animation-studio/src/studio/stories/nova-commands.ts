// What If… you could command anyone? "Nova commands you" (productions/what-if-command/script-v3-nova.md, approved by
// the owner). An emotional dystopia: Nova narrates her own story in the first person. In a walled town the rich Blues
// have everything and the Greys have nothing; Nova wakes up able to command anyone by saying her own name, and
// everyone she commands forgets she exists. Every command carries her name. ~2:30.
import type { Storyboard, Line, ShotSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 80 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const NIGHT = "night" as const, DAY = "day" as const, COOL = "interiorCool" as const, IN = "interior" as const, GOLDEN = "golden" as const;
type Light = typeof NIGHT | typeof DAY | typeof COOL | typeof IN | typeof GOLDEN;
/** Nova narrating (the storyboard's narrator voice) */
const N = (text: string): Line => ({ text, who: "narrator" });
/** Nova speaking on screen: her commands (the harder voice) */
const CMD = (text: string): Line => ({ text, who: "nova" });
/** a command heard over a card (Nova off screen) */
const CMD_O = (text: string): Line => ({ text, who: "narrator", voice: "nvNovaCmd" });
const nova = (text: string): Line => ({ text, who: "nova", voice: "nvNova" });
const pip = (text: string): Line => ({ text, who: "pip" });
const pipY = (text: string): Line => ({ text, who: "pipY" });
const mum = (text: string): Line => ({ text, who: "mum" });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (a: ReturnType<typeof at>, b: ReturnType<typeof at>, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51), CARD_IN = at([0, 1.4, 3.85], CARD, 51);
const insert = (variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: ({ t: number } | { word: string })[], push = false): ShotSpec =>
  ({ set: "novaHome", light: NIGHT, dur, ...(push ? glide(CARD_CAM, CARD_IN, dur) : { camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }] }), actors: [], props: [{ id: "novaInsert", at: CARD, variant, steps: steps ?? [{ t: 99 }] }], note, ...extra });
const RAIN = (look: V) => ({ id: "rain", at: look, steps: STEADY });
const STREET_N = { set: "novaStreet", light: NIGHT as Light, ambience: "elb_river_rain" as const };
const STREET_D = { set: "novaStreetDay", light: DAY as Light, ambience: "amb_city_night" as const };
const FREE = { set: "novaStreetFree", light: GOLDEN as Light, ambience: "amb_city_day" as const };
const HOME_N = { set: "novaHome", light: NIGHT as Light, ambience: "elb_rain_window" as const };
const HOME_D = { set: "novaHomeDay", light: COOL as Light, ambience: "elb_kitchen_day" as const };
const HALL = { set: "blueHall", light: IN as Light, ambience: "amb_room" as const };
const TOWER = { set: "novaTower", light: NIGHT as Light, ambience: "elb_house_night" as const };
const BLANK = { act: "neutral" as const, face: "blank" as const, keepFace: true, blink: false };
// the bread queue (left pavement, in front of the shop at x -5.95, z -4)
const OFFICER: V = [-5.0, 0, -4.4], Q1: V = [-4.2, 0, -3.1], Q2: V = [-4.0, 0, -1.8], Q3: V = [-3.9, 0, -0.5], Q4: V = [-3.8, 0, 0.8];
const QUEUE = [{ who: "grey1", at: Q2, act: "sad" as const, facing: "toward:officer" as const }, { who: "grey2", at: Q3, act: "sad" as const, facing: "toward:officer" as const }, { who: "grey3", at: Q4, act: "sad" as const, facing: "toward:officer" as const }];

export const NOVA_COMMANDS: Storyboard = {
  id: "nova-commands", title: "What If… You Could Command Anyone?",
  cast: { nova: "nova", pip: "pip", pipY: "pipYellow", mum: "novaMum", dad: "novaDad", kai: "kai", guard: "blueGuard", officer: "blueOfficer",
    blueMan: "blueMan", blueWoman: "blueWoman", blueKid: "blueKid", grey1: "grey1", grey2: "grey2", grey3: "grey3" },
  voice: "nvNova", voices: { nova: "nvNovaCmd", pip: "nvPip", pipY: "nvPip", mum: "nvMum" },
  captionColors: { nova: "#f2c14e", nvNovaCmd: "#f2c14e", pip: "#ff9ec7", pipY: "#ff9ec7", mum: "#9fd3ff" },
  // the score (sound/samples/music/nova_score.json: eight sections written to these timings) and its volume curve:
  // held low under the first command, quiet in the town, dropped under the last command, the swell at the freedom
  music: { file: "nova_score", gain: 0, duck: -5, curve: [
    [0, -12], [3.4, -12], [3.8, 0], [7.6, -4], [40.9, -3], [62.5, -1], [79.0, -4], [94.1, -3], [101.3, -3], [101.8, -16],
    [108.6, -10], [109.0, 1], [115.6, -2], [125.6, -3], [126.3, -40], [128.2, -40]] },
  engine: 3, autoSfx: false,
  clarity: {
    premise: "In a town split between the rich Blues and the starving Greys, a Grey girl wakes up able to command anyone by saying her own name, but everyone she commands forgets she exists.",
    facts: [
      { fact: "the first frame: the power", said: "Nova commands you… to let her go" },
      { fact: "that it costs something (the hook)", said: "I didn't know yet what it would cost me" },
      { fact: "the two classes", said: "The Blues… and us. The Greys." },
      { fact: "how unfair it is", said: "Food they throw away" },
      { fact: "Greys have no names", said: "a number instead of a name" },
      { fact: "the poverty", said: "She's not allowed to eat the crumbs" },
      { fact: "what happens to Greys", said: "Greys who complain… disappear. Like my dad." },
      { fact: "where the power came from", said: "my voice felt different" },
      { fact: "the rule", said: "When I say my name, and a command, anyone who hears it has to obey" },
      { fact: "the cost", said: "And then they forget me" },
      { fact: "the plant", said: "Promise you'll never forget me" },
      { fact: "the cost growing (a friend)", said: "he walked past me" },
      { fact: "the cost growing (Mum)", said: "are you one of Pip's friends" },
      { fact: "where Dad is", said: "In the Governor's camp, behind the wall" },
      { fact: "the stakes of the last command", said: "Everyone. Even Pip." },
      { fact: "the last command", said: "Open the gates. Share everything." },
      { fact: "the payoff (Dad)", said: "Dad came home" },
      { fact: "the payoff (the promise inverted)", said: "do I know you" },
      { fact: "the ending", said: "not one of them knows my name" },
    ],
  },
  shots: [
    // ---- COLD OPEN: the first command
    { say: CMD("Nova commands you… to let her go. At this instant!"), ...STREET_N, hold: 0.3, ...glide(at([3.4, 1.35, 7.4], [0.9, 1.15, 1.6], 52), at([3.25, 1.32, 6.8], [0.9, 1.15, 1.5], 52), 3.5),
      actors: [{ who: "nova", at: [0.0, 0, 3.4], act: "angry", face: "angry", keepFace: true, facing: "toward:guard", gesture: "stop" },
        { who: "guard", at: [1.4, 0, 0.4], act: "angry", facing: "toward:nova", gesture: "grab", reach: "pip" },
        { who: "pip", at: [2.1, 0, 0.8], act: "scared", face: "scared", facing: "toward:nova" }],
      props: [RAIN([0.9, 1, 1.8])], kicks: [{ word: "Nova" }], sfx: [{ t: 0, name: "el_thunder", gain: -6 }, { t: 0.05, name: "el_hit_sub", gain: -4 }], note: "night, rain: the guard has Pip by the arm; Nova steps in" },
    { say: N("That was the first time I used it. I didn't know yet what it would cost me."), ...STREET_N, hold: 0.4, ...lock(at([2.4, 1.75, 2.6], [1.5, 1.65, 0.3], 38)),
      actors: [{ who: "guard", at: [1.4, 0, 0.4], ...BLANK, walk: { to: [3.6, 0, -4], t0: 1.2, t1: 4.6 } }],
      props: [RAIN([1.5, 1.6, 0.4])], sfx: [{ t: 0.1, name: "el_sting_strings", gain: -8 }], note: "the guard's eyes go empty; he lets go and walks away" },
    // ---- MY TOWN
    { say: N("In my town, there are two kinds of people. The Blues… and us. The Greys."), ...STREET_N, hold: 0.2, title: { text: "WHAT IF…", sub: "YOU COULD COMMAND ANYONE?" },
      ...glide(at([0.8, 1.6, 10], [0, 4, -30], 50), at([0.8, 1.75, 8.8], [0, 4.5, -30], 50), 5.5),
      actors: [{ who: "nova", at: [0.3, 0, 4.6], act: "sad", back: true }], props: [RAIN([0, 2, 0])], note: "the wall across the street, the Blues' gold towers beyond; Nova small in the rain" },
    { say: N("The Blues have everything. Big warm houses. Food they throw away."), ...HALL, hold: 0.1, ...glide(at([0.2, 1.5, 3.8], [0, 1.0, -1.2], 48), at([0.2, 1.42, 3.2], [0, 1.0, -1.2], 48), 4.5),
      actors: [{ who: "blueKid", at: "seat1", mode: "sit", act: "happy", face: "grin" }, { who: "blueMan", at: "seat2", mode: "sit", act: "laugh", face: "laugh" }, { who: "blueWoman", at: "seat3", mode: "sit", act: "happy", face: "smile" }],
      sfx: [{ t: 0.1, name: "clink", gain: -10 }], note: "the Blues feasting in the gold hall" },
    insert("wristband", 3.6, "the grey band: G-4471", { say: N("We have a grey band on our wrist, and a number instead of a name."), ambience: "elb_rain_window" }, undefined, true),
    { say: N("My mum cleans their tables twelve hours a day. She's not allowed to eat the crumbs."), ...HALL, hold: 0.2, ...lock(at([1.2, 1.5, 2.7], [1.7, 1.1, -0.8], 44)),
      actors: [{ who: "mum", at: "clean", act: "sad", face: "sad", keepFace: true, facing: -1, gesture: "offer" }, { who: "blueWoman", at: "seat3", mode: "sit", act: "happy", face: "smile" }, { who: "blueMan", at: "seat4", mode: "sit", act: "laugh", face: "laugh" }],
      note: "Mum scrubbing the end of the table; the Blues don't look at her" },
    { say: N("Every morning, the bread runs out before it gets to us."), ...STREET_D, hold: 0.3, ...lock(at([1.6, 1.5, 4.4], [-4.0, 1.2, -2.3], 48)),
      actors: [{ who: "officer", at: OFFICER, act: "neutral", face: "stern", facing: "toward:pip" }, { who: "pip", at: Q1, act: "sad", face: "sad", facing: "toward:officer" as const }, ...QUEUE],
      props: [{ id: "breadShutter", at: [-5.9, 0, -4], variant: "down", steps: [{ word: "runs" }] }], sfx: [{ t: 1.4, name: "metal_groan", gain: -8 }, { t: 1.7, name: "el_hit_boom", gain: -10 }], note: "the bread queue; the shutter slams down in front of Pip" },
    insert("dadPhoto", 7.6, "Dad's photo on the wall", { say: N("Greys don't vote. Greys don't complain. Greys who complain… disappear. Like my dad. They took him two winters ago."), ambience: "elb_rain_window", sfx: [{ t: 4.6, name: "el_hit_sub", gain: -8 }] }, undefined, true),
    { say: [pip("Do you think Dad's coming back?"), { ...N("I didn't answer. I didn't know how."), gap: 0.6 }], ...HOME_N, hold: 0.6, ...lock(at([0.0, 1.05, 1.9], [-0.2, 0.25, -0.95], 46)),
      actors: [{ who: "pip", at: "pipAsleep", act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera" }, { who: "nova", at: "novaAsleep", act: "sad", face: "sad", keepFace: true, facing: "camera" }],
      note: "in bed, in the dark: Pip whispers" },
    // ---- THE MORNING
    { say: N("Then one morning, I woke up… and my voice felt different. Heavy. Like thunder hiding in my throat."), ...HOME_D, hold: 0.2, ...glide(at([-0.5, 1.0, 1.5], [-0.9, 0.78, -0.9], 44), at([-0.6, 0.98, 1.1], [-0.9, 0.8, -0.9], 44), 6.5),
      actors: [{ who: "nova", at: "novaBed", mode: "sit", act: "shock", face: "shock", keepFace: true, facing: "camera", gesture: "coverMouth" }],
      sfx: [{ t: 0, name: "el_sit_up" }, { t: 3.8, name: "el_hit_sub", gain: -6 }, { t: 3.8, name: "el_thunder", gain: -12 }], note: "Nova sits up with a gasp, a hand at her throat" },
    { say: CMD("Nova commands you to give them the bread."), ...STREET_D, hold: 0.2, ...lock(at([-1.6, 1.45, 0.8], [-4.8, 1.35, -4.1], 42)),
      actors: [{ who: "nova", at: [-3.0, 0, -2.6], act: "determined", face: "angry", keepFace: true, facing: "toward:officer" as const }, { who: "officer", at: OFFICER, act: "neutral", face: "stern", facing: "toward:nova" }],
      props: [{ id: "breadShutter", at: [-5.9, 0, -4], variant: "up", steps: [{ t: 99 }] }], kicks: [{ word: "Nova" }], sfx: [{ t: 0, name: "el_hit_sub", gain: -6 }], note: "Nova faces the officer at the shut shop" },
    { say: [N("When I say my name, and a command, anyone who hears it has to obey."), N("And then they forget me. Like I was never there.")], ...STREET_D, hold: 0.3, ...lock(at([1.6, 1.5, 4.4], [-4.0, 1.2, -2.3], 48)),
      actors: [{ who: "officer", at: OFFICER, ...BLANK, facing: "toward:pip", gesture: "offer" }, { who: "pip", at: Q1, act: "happy", face: "smile", facing: "toward:officer", gesture: "offer" }, ...QUEUE.map((q) => ({ ...q, act: "happy" as const }))],
      props: [{ id: "breadShutter", at: [-5.9, 0, -4], variant: "up", steps: [{ t: 0.4 }] }], sfx: [{ t: 0.4, name: "metal_groan", gain: -8 }], note: "the shutter rolls up; the officer hands out the bread, eyes empty" },
    { say: [pip("Promise you'll never forget me."), { ...N("I promised. I never thought it would be the other way round."), gap: 0.5 }], ...HOME_N, hold: 0.6, ...lock(at([-0.15, 1.0, 1.7], [-0.15, 0.72, -0.95], 46)),
      actors: [{ who: "pip", at: "pipBed", mode: "sit", act: "happy", face: "smile", facing: "toward:nova" }, { who: "nova", at: "novaBed", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "toward:pip" }],
      note: "night: Pip, fed for once, holding Nova's hand" },
    // ---- FIGHTING BACK
    { say: [CMD("Nova commands you to open the warehouse."), { ...N("A hundred families ate that night."), gap: 0.4 }], ...STREET_N, hold: 0.2, ...lock(at([0.0, 1.4, -7.4], [4.2, 1.3, -14], 46)),
      actors: [{ who: "nova", at: [2.0, 0, -11.3], act: "determined", face: "angry", keepFace: true, facing: "toward:guard" }, { who: "guard", at: [4.4, 0, -14], ...BLANK, facing: "toward:nova" }],
      props: [RAIN([3, 1.5, -12])], kicks: [{ word: "Nova" }], sfx: [{ t: 0, name: "el_hit_sub", gain: -6 }, { t: 2.2, name: "el_backdoor", gain: -6 }], note: "the warehouse guard, STORE 4" },
    insert("list", 6.0, "the list of Greys to be taken; it burns", { say: [CMD_O("Nova commands you to burn the list."), { ...N("The list of Greys they were taking next. Forty names. Forty families who got to stay."), gap: 0.3 }], ambience: "elb_rain_window", sfx: [{ t: 1.6, name: "fire_roar", gain: -10 }] }, [{ word: "burn" }]),
    { say: N("My best friend Kai saw me do it. The next morning, he walked past me at school."), ...STREET_D, hold: 0.3, ...lock(at([3.4, 1.5, 3.0], [0, 1.2, -0.6], 48)),
      actors: [{ who: "nova", at: [0.5, 0, 0], act: "sad", face: "sad", keepFace: true, facing: "toward:kai", gesture: "wave" }, { who: "kai", at: [-1.2, 0, -7], act: "neutral", face: "neutral", walk: { to: [-0.7, 0, 7], t0: 0.8, t1: 5.6 } }],
      note: "Kai walks straight past Nova; she waves; nothing" },
    { say: mum("Sorry, love… are you one of Pip's friends?"), ...HOME_D, hold: 0.4, ...lock(at([0.2, 1.45, 2.4], [0.8, 1.25, -0.6], 44)),
      actors: [{ who: "mum", at: "sink", act: "happy", face: "smile", facing: "toward:nova" }, { who: "nova", at: [0.1, 0, 0.3], act: "sad", face: "sad", keepFace: true, facing: "toward:mum" }],
      note: "the kitchen corner: Mum smiles politely at a stranger" },
    { say: N("My own mum. In our own kitchen. I made her tea, and she thanked me like a guest."), ...HOME_D, hold: 0.6, ...lock(at([0.45, 1.38, 1.4], [0.1, 1.3, 0.3], 34)),
      actors: [{ who: "nova", at: [0.1, 0, 0.3], act: "sad", face: "sad", keepFace: true, facing: "camera", gesture: "crossArms" }], sfx: [{ t: 0.1, name: "musicbox_note", gain: -8 }], note: "Nova, close, breaking" },
    // ---- THE TOWER
    insert("roster", 6.0, "the camp roster: Dad, WORKING", { say: N("Then I found out where Dad went. Not gone. Working. In the Governor's camp, behind the wall."), ambience: "elb_house_night", sfx: [{ t: 1.4, name: "el_hit_boom", gain: -8 }] }, undefined, true),
    { say: N("If every speaker in town heard me, I could end it. All of it."), ...TOWER, hold: 0.2, ...lock(at([0.9, 1.4, 3.1], [0.1, 1.3, 0], 46)),
      actors: [{ who: "nova", at: [1.5, 0, 0.9], act: "determined", face: "determined", keepFace: true, walk: { to: [0.3, 0, 0.1], t0: 0.2, t1: 2.4, view: "front" } }],
      sfx: [{ t: 0.2, name: "el_feet_landing", gain: -6 }, { t: 2.6, name: "el_riser_long", gain: -6 }], note: "the broadcast tower: Nova walks to the microphone" },
    { say: N("But everyone who hears me forgets me. Everyone. Even Pip."), ...HOME_N, hold: 0.5, ...lock(at([1.0, 1.05, 2.9], [1.2, 0.6, 0.6], 46)),
      actors: [{ who: "pip", at: [1.15, 0, 1.3], act: "sad", back: true }], note: "Pip at home watching the screen, waiting for her sister" },
    { say: [CMD("Nova commands you… every one of you."), { ...CMD("Open the gates. Share everything. And never call anyone a Grey again."), gap: 0.5 }], ...TOWER, hold: 0.5, ...glide(at([0.7, 1.45, 1.6], [0.3, 1.4, 0.1], 34), at([0.6, 1.43, 1.3], [0.3, 1.42, 0.1], 34), 8.0),
      actors: [{ who: "nova", at: [0.3, 0, 0.1], act: "determined", face: "determined", keepFace: true, sadTalk: true, facing: "camera" }],
      kicks: [{ word: "Nova" }], sfx: [{ t: 0, name: "el_hit_sub", gain: -2 }], note: "the last command, to every speaker in town" },
    { ...FREE, dur: 4.2, ...glide(at([0.9, 1.5, 9], [0, 4, -30], 50), at([0.9, 2.2, 10.5], [0, 4.5, -30], 50), 4.2), transition: "flash",
      actors: [{ who: "grey1", at: [-1.5, 0, 2], act: "happy", face: "grin", back: true, walk: { to: [-1.0, 0, -12], t0: 0.2, t1: 4.2, view: "back" } }, { who: "grey2", at: [1.2, 0, 3], act: "happy", face: "grin", back: true, walk: { to: [0.8, 0, -11], t0: 0.4, t1: 4.2, view: "back" } }, { who: "grey3", at: [0.2, 0, 1], act: "happy", face: "grin", back: true, walk: { to: [0.0, 0, -10], t0: 0.1, t1: 4.2, mode: "run", view: "back" } }],
      sfx: [{ t: 0, name: "el_hit_boom", gain: -2 }, { t: 0.6, name: "crowd_cheer", gain: -8 }], note: "colour floods the town; the gate stands open; the Greys walk out into the light" },
    // ---- THE ENDING
    { say: N("Dad came home."), ...FREE, hold: 1.6, ...lock(at([0.7, 1.45, -17.5], [0, 1.4, -27], 44)),
      actors: [{ who: "dad", at: [0, 0, -30.2], act: "relief", face: "relief", walk: { to: [0, 0, -25.6], t0: 0, t1: 2.6, view: "front" } }, { who: "pipY", at: [0.9, 0, -19.5], act: "happy", face: "grin", back: true, walk: { to: [0.4, 0, -24.8], t0: 0.6, t1: 2.2, mode: "run", view: "back" } },
        { who: "mum", at: [-1.6, 0, -21.5], act: "relief", face: "relief", facing: "toward:dad", gesture: "coverMouth" }],
      sfx: [{ t: 0.3, name: "el_riser_short", gain: -10 }], note: "Dad walks out of the gate; Pip runs to him; Mum crying" },
    { say: [pipY("Sorry… do I know you?"), { ...nova("No. But I know you."), gap: 0.6 }], ...FREE, hold: 0.6, ...lock(at([1.7, 1.35, 5.6], [0, 1.1, 1.8], 44)),
      actors: [{ who: "nova", at: [0.4, 0, 2], act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "toward:pipY" }, { who: "pipY", at: [-2.6, 0, -2.5], act: "neutral", face: "neutral", facing: "toward:nova", walk: { to: [-0.5, 0, 1.5], t0: 0, t1: 1.6, mode: "run" } }],
      note: "Pip, in her yellow coat, stops in front of a stranger" },
    { say: [N("I saved my whole town. And not one of them knows my name."), { ...N("That's okay. I remember them."), gap: 0.7 }], ...FREE, hold: 1.2, ...glide(at([0.8, 1.5, 7], [0, 2.4, -20], 48), at([0.8, 1.9, 9.5], [0, 2.8, -22], 48), 8.0),
      actors: [{ who: "nova", at: [0.4, 0, 2], act: "sad", back: true, walk: { to: [0.2, 0, -9], t0: 0.3, t1: 7.5, view: "back" } }],
      sfx: [{ t: 0.2, name: "musicbox_note", gain: -10 }], note: "Nova walks away alone through the bright street" },
    insert("endCard", 2.4, "end card: the vote", { transition: "dip", ambience: false }),
  ],
};
