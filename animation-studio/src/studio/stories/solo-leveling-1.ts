// EPISODE 3: "The Solo Leveling World" (productions/solo-leveling-1/script.md): Engine 4. Everyone has a floating power level; Leo is Level 1, Dex (Level 50) bullies him. A secret
// quest system (a blue System Window) lets Leo grind in secret (push-ups, sprints, pull-ups) from Level 1 to Level 99; he hides his number under his hood until the school gym, where one
// finger-flick sends Dex sliding down the hardwood. 5 rooms: school hallway, Leo's bedroom, the dawn court in the rain, the park (the court by day, with a pull-up bar), the school gym.
// Morning Mood is the score (-14 LUFS, scored + no-music dual export); 8 dB ducks under every RPG chime, System Window pop-up and the bass drop. Opens with a 0.45 s un-blur.
import type { Storyboard, Line } from "../story/types";
import { fovMm, blurMm } from "../engine4/camera";
import { type PlayMove, type BallSeg, type When2 } from "../engine4/motion";

type V = [number, number, number];
type Who = "narrator" | "dex" | "leo";
/** [speaker, text, the sounds on its words: [word, nth, sound, gain dB, delay s]] */
type Snd = [string, number, string, number?, number?][];
const S: [Who, string, Snd?][] = [
  /* 1 */ ["narrator", "In my world, everyone has a floating power level—and mine has been stuck at Level 1 my whole life.", [["In", 1, "el_rpg_levelup", 0, 0.02], ["In", 1, "whoosh_short", -3, 0], ["Level", 2, "el_ui_pop", -8]]],
  /* 2 */ ["narrator", "Everyone's level glows above their head, and the higher your number, the more the whole school listens to you.", [["higher", 1, "el_ui_pop", -10]]],
  /* 3 */ ["narrator", "Teachers bowed to the big numbers. Kids stepped out of their way. And the small ones? They shrank into the walls.", [["small", 1, "viral_ack", -8]]],
  /* 4 */ ["narrator", "Dex is Level 50. He makes sure I never forget it.", [["Dex", 1, "el_locker_slam", -4, 0], ["Dex", 1, "el_glitch_cut", -2, -0.05]]],
  /* 5 */ ["dex", "Carry my books, Level 1. And my homework's due at nine.", [["books,", 1, "whoosh_short", -6]]],
  /* 6 */ ["narrator", "So every day, I carried his books and did his homework while the whole hallway watched. Nobody helps a Level 1.", [["Nobody", 1, "viral_bruh", -8]]],
  /* 7 */ ["narrator", "Then one night, as I finished Dex's homework at midnight, the air in my room started to hum.", [["midnight,", 1, "el_clock_tick", -6], ["hum.", 1, "el_ui_pop", -12]]],
  /* 8 */ ["narrator", "A blue window floated right in front of my face. It said: Secret Quest. One hundred push-ups before five A.M. Penalty: stay Level 1 forever.", [["window", 1, "el_ui_pop", 0], ["Secret", 1, "el_ui_type", -6], ["One", 1, "el_ui_type", -6], ["Penalty:", 1, "el_ui_type", -6], ["Penalty:", 1, "viral_danger_alarm", -12, 0.3]]],
  /* 9 */ ["narrator", "I'm not strong. I did eleven push-ups before my arms gave out. Then one more. Then one more.", [["eleven", 1, "el_breath_heavy", -8]]],
  /* 10 */ ["narrator", "At exactly five A.M., the clock flashed, and my number changed. Level 2.", [["flashed,", 1, "el_rpg_levelup", 0, 0], ["number", 1, "el_ui_pop", -6]]],
  /* 11 */ ["narrator", "Nobody has ever been happier about a two.", [["happier", 1, "whoosh_short", -6]]],
  /* 12 */ ["narrator", "So I kept going. Push-ups at dawn. Sprints in the rain. Pull-ups on the park bar until my palms burned. Every morning, a new quest.", [["So", 1, "el_glitch_cut", -2, -0.05], ["Push-ups", 1, "el_breath_heavy", -8], ["quest.", 1, "el_ui_pop", -8]]],
  /* 13 */ ["narrator", "Level fifteen. Level forty. By spring, Level eighty-five.", [["fifteen.", 1, "el_rpg_levelup", -2, 0], ["forty.", 1, "el_rpg_levelup", -2, 0], ["eighty-five.", 1, "el_rpg_levelup", -2, 0]]],
  /* 14 */ ["narrator", "My arms grew. My legs stopped shaking. I started catching Dex's thrown books one-handed.", [["catching", 1, "whoosh_short", -4]]],
  /* 15 */ ["narrator", "But at school, I kept my hoodie up and my number hidden. Dex still thought I was Level 1, and I let him.", [["hidden.", 1, "viral_ding", -10]]],
  /* 16 */ ["dex", "Hey, Level 1! Where's my homework?", []],
  /* 17 */ ["narrator", "I handed it over. He never noticed I'd stopped shaking.", [["over.", 1, "whoosh_short", -8]]],
  /* 18 */ ["dex", "Gym. Friday. Everyone's coming to watch Level 1 get deleted.", []],
  /* 19 */ ["narrator", "On Friday, the whole school packed the bleachers, and Dex strutted in with his glowing fifty over his head, grinning like he'd already won.", [["packed", 1, "el_gym_cheer", -6]]],
  /* 20 */ ["dex", "Last chance, Leo. Say sorry, carry my books forever, and I might go easy.", []],
  /* 21 */ ["narrator", "I took one slow breath. Then I dropped my hoodie.", [["dropped", 1, "whoosh_short", -3], ["dropped", 1, "el_glitch_cut", -2, -0.05]]],
  /* 22 */ ["narrator", "My number wasn't Level 1 anymore. It was Level 99, and it was gold.", [["Level", 2, "el_bass_drop", 0, 0], ["Level", 2, "el_shockwave", -1, 0.05], ["99,", 1, "el_rpg_levelup", -4, 0], ["gold.", 1, "el_crowd_gasp", -4]]],
  /* 23 */ ["narrator", "Dex charged anyway. For half a second, he was still smiling.", [["charged", 1, "whoosh_short", -3]]],
  /* 24 */ ["narrator", "I lifted one finger. And flicked.", [["flicked.", 1, "el_finger_flick", 0, -0.06]]],
  /* 25 */ ["narrator", "Dex slid the whole length of the gym on his back.", [["slid", 1, "el_body_slide", 0, 0]]],
  /* 26 */ ["dex", "H-how?", []],
  /* 27 */ ["leo", "You said it yourself, Dex. The higher the number, the more people listen.", []],
  /* 28 */ ["narrator", "The gym went wild. For the first time ever, they were cheering for me.", [["wild.", 1, "el_gym_cheer", 0, 0]]],
  /* 29 */ ["narrator", "Then a new blue window opened in front of my face. New quest unlocked.", [["window", 1, "el_ui_pop", 0], ["unlocked.", 1, "el_rpg_levelup", -4, 0]]],
  /* 30 */ ["narrator", "And at the back of the gym, one badge I couldn't read. Three glowing question marks.", [["badge", 1, "el_glitch_cut", -2, -0.05], ["badge", 1, "el_ui_pop", -6, 0.1], ["marks.", 1, "viral_dun_dun_dun", -4]]],
];

// ---- where everyone stands, per scene: [x, floor y, z]
const POS: Record<string, Record<string, V>> = {
  hall: { leo: [0.5, 0, 0.5], leoH: [0.5, 0, 0.5], dex: [-0.45, 0, -1.3], kidA: [-1.5, 0, -3.0], kidB: [1.5, 0, -3.4], kidC: [-1.4, 0, -4.8], kidE: [1.45, 0, -1.9], kidF: [-1.5, 0, -0.1], coach: [1.35, 0, -5.6], kidD: [0.7, 0, -6.4] },
  bed: { leo: [-0.9, 0.5, -1.5] },
  floorB: { leo: [0.5, 0, 0.0] },
  dawn: { leo: [-1.2, 0, 0.6] },
  park: { leo: [1.3, 0, -1.0], dex: [-3.0, 0, -0.6] },
  gym: { leo: [0.3, 0, 0.3], leoH: [0.3, 0, 0.3], dex: [-0.6, 0, -6.2], kidA: [-3.2, 0, -2.0], kidB: [3.3, 0, -1.2], stranger: [2.9, 0, -6.0] },
};
const CROWN: Record<string, number> = { leo: 1.31, leoH: 1.31, dex: 1.28, kidA: 1.3, kidB: 1.3, kidC: 1.3, kidD: 1.3, kidE: 1.3, kidF: 1.3, coach: 1.6, stranger: 1.75 };
type C = Storyboard["shots"][number]["camera"];
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
const rad = Math.PI / 180;
const A = (pos: V, look: V, mm: number, o: { creep?: number; roll?: number } = {}): C => ({ move: "at" as const, pos, look, fov: fovMm(mm), blur: blurMm(mm) + (mm >= 50 ? 2 : 0), ...o }) as never;
/** a framing of one actor from `deg` degrees off straight-on, `d` m away, on a `mm` lens: the eyes in the upper-middle of the frame, the whole face in */
const view = (sc: string, who: string, deg: number, d: number, mm: number, y: number | undefined, o: { creep?: number; roll?: number } = {}, at?: V): C => {
  const p = at ?? POS[sc][who], H = (d * 24) / mm, centre = p[1] + CROWN[who] - 0.12 - 0.1 * H;
  return A([p[0] + Math.sin(deg * rad) * d, y ?? centre, p[2] + Math.cos(deg * rad) * d], [p[0], centre, p[2]], mm, o);
};
type Opt = { creep?: number; roll?: number; at?: V };
/** a face close-up (default 3 m, so the badge floating over the head stays inside the frame) */
const cu = (sc: string, who: string, deg = 0, d = 3.0, mm = 50, o: Opt = {}) => view(sc, who, deg, d, mm, undefined, o, o.at);
const lo = (sc: string, who: string, deg = 0, d = 2.6, mm = 35, o: Opt = {}) => view(sc, who, deg, d, mm, (o.at?.[1] ?? POS[sc][who]?.[1] ?? 0) + 0.3, o, o.at);   // a low-angle hero shot, looking UP
export const hi = (sc: string, who: string, deg = 0, d = 2.8, mm = 35, o: Opt = {}) => view(sc, who, deg, d, mm, (o.at?.[1] ?? POS[sc][who]?.[1] ?? 0) + CROWN[who] + 0.8, o, o.at);   // a high-angle underdog shot, looking DOWN
type Cut = [string | null, C, boolean?];   // [the word it lands on ("Level#2" = the second), the camera, a snap-zoom swoop?]
type Face = [string, string?, number?];     // the face at the start, and an optional second face (a bold swap) at t seconds (default 1.2)
type Ex = { at?: V; play?: PlayMove[]; walk?: { to: V; t0?: number; t1?: number; mode?: "walk" | "run"; view?: "back" | "front"; from?: { word: string; n?: number }; until?: { word: string; n?: number } }; mode?: string; slump?: number; look?: [number, number]; keys?: K; gesture?: string };
const ac = (sc: string, who: string, face: Face, ex: Ex = {}) => {
  const p = ex.at ?? POS[sc][who];
  const keys: K = ex.keys ?? [{ t: 0, expr: face[0] as never, ...(ex.gesture ? { gesture: ex.gesture as never } : {}), ...(ex.slump ? { slump: ex.slump } : {}), ...(ex.look ? { look: ex.look } : {}) }, ...(face[1] ? [{ t: face[2] ?? 1.2, d: 0.34, expr: face[1] as never }] : [])];
  return { who, at: p, act: "neutral" as const, facing: "camera" as const, keys, ...(ex.play ? { play: ex.play } : {}), ...(ex.walk ? { walk: ex.walk as never } : {}), ...(ex.mode ? { mode: ex.mode as never } : {}) };
};
type PropS = NonNullable<Storyboard["shots"][number]["props"]>[number];
type Seg = { sc: string; amb: Amb; light?: Light; until?: { word: string; n?: number }; cuts: Cut[]; actors: ReturnType<typeof ac>[]; props?: PropS[]; shake?: (number | { word: string; n?: number })[]; shot?: Partial<Storyboard["shots"][number]> };
type Amb = "elb_school_hall" | "elb_rain_window" | "elb_court_rain" | "elb_court_day" | "elb_gym_crowd";
type Light = "day" | "night" | "interior";
const w = (word: string, dt = 0, n = 1): When2 => ({ word, n, dt });
/** a power-level badge over an actor's head: variant "LVL" value(s), steps = when each value appears */
const badge = (who: string, variant: string, steps: ({ t: number } | { word: string; n?: number })[], lift = 0.32) => ({ id: "lvlBadge", variant, at: [0, 0, 0] as V, scale: 1, hover: { who, side: 1 as const, lift }, steps }) as PropS;
const sysWin = (at: V, variant: string, steps: ({ t: number } | { word: string; n?: number })[], scale = 1) => ({ id: "systemWindow", variant, at, scale, steps }) as PropS;
const SHOW = [{ t: -1 }];
const hallKids = (faces: Record<string, Face> = {}, only?: string[]) => ["kidA", "kidB", "kidC", "kidE", "kidF", "coach", "kidD"].filter((k) => !only || only.includes(k)).map((k) => ac("hall", k, faces[k] ?? ["neutral"]));
const hallBadges = (stepAt: (i: number) => { t: number } | { word: string }, only?: string[]) => [["kidA", "12"], ["kidB", "31"], ["kidC", "7"], ["kidE", "44"], ["kidF", "23"], ["coach", "60"], ["kidD", "3"]].filter(([k]) => !only || only.includes(k)).map(([k, v], i) => badge(k, v, [stepAt(i)]));

// ================================ the shot list: one entry per spoken line; a line that changes place is split on a word ================================
const SEGS: Seg[][] = [
  /* 1 the hook: blur-in, a crowded hallway of floating badges, Leo's tiny grey LVL 1 */ [{ sc: "hall", amb: "elb_school_hall", light: "interior",
    cuts: [[null, A([0.9, 1.5, 3.9], [0.2, 1.3, -2.2], 24, { creep: 0.12 })], ["floating", cu("hall", "leo", 8, 3.1, 50, { creep: 0.1 })], ["mine", A([-1.6, 1.3, 2.0], [0.9, 1.4, -3.0], 30)], ["Level#2", A([0.6, 1.62, 1.9], [0.5, 1.62, 0.5], 85, { creep: 0.1 })]],
    actors: [ac("hall", "leo", ["sad"], { at: [0.5, 0, -1.6], walk: { to: [0.5, 0, 0.5], t0: 0.0, t1: 2.6, view: "front" } }), ac("hall", "dex", ["grin"]), ...hallKids({}, ["kidA", "kidB", "kidC", "kidE", "kidF"])],
    props: [badge("leo", "1", [{ t: 0.1 }]), badge("dex", "50", [{ t: 0.25 }]), ...hallBadges((i) => ({ t: 0.35 + i * 0.12 }), ["kidA", "kidB", "kidC", "kidE", "kidF"])] }],
  /* 2 the number decides who the school listens to: a high-angle establishing shot of the hallway first */ [{ sc: "hall", amb: "elb_school_hall", light: "interior",
    cuts: [[null, A([0.4, 2.6, 3.9], [0.0, 0.3, -3.4], 20, { creep: 0.1 })], ["head,", cu("hall", "kidE", -14, 3.0, 50, { at: [1.4, 0, -1.4], creep: 0.12 })], ["higher", A([-0.2, 1.4, 2.4], [0.1, 1.4, -1.0], 35, { creep: 0.15 })], ["school", cu("hall", "leo", -10, 3.0, 50, { creep: 0.15, at: [-0.5, 0, 0.8] })]],
    actors: [ac("hall", "leo", ["sad"], { at: [-0.5, 0, 0.8] }), ac("hall", "dex", ["grin"], { at: [-0.7, 0, -1.8] }), ac("hall", "kidE", ["grin"], { at: [1.4, 0, -1.4] }), ac("hall", "kidA", ["neutral"], { at: [-1.6, 0, -3.4] }), ac("hall", "kidB", ["neutral"], { at: [1.6, 0, -3.8] }), ac("hall", "kidC", ["neutral"], { at: [-1.5, 0, -5.2] }), ac("hall", "kidF", ["sad"], { at: [-1.5, 0, 0.0] })],
    props: [badge("leo", "1", SHOW), badge("dex", "50", SHOW), badge("kidE", "38", SHOW), badge("kidA", "12", SHOW), badge("kidB", "31", SHOW), badge("kidC", "7", SHOW), badge("kidF", "23", SHOW)] }],
  /* 3 shown literally: a teacher bows to the LVL 45 student; the kids step aside for the LVL 50; the LVL 2 kid is pressed into the lockers */ [
    { sc: "hall", amb: "elb_school_hall", light: "interior", until: { word: "Kids" }, cuts: [[null, A([-1.2, 1.3, 2.9], [0.2, 1.2, -1.5], 30, { creep: 0.1 })], ["big", cu("hall", "kidE", -12, 3.0, 50, { at: [0.9, 0, -1.5], creep: 0.12 })]],
      actors: [ac("hall", "coach", ["neutral"], { at: [-0.5, 0, -1.5], play: [{ ...w("bowed", -0.1), kind: "bow", dir: 1 }] }), ac("hall", "kidE", ["grin"], { at: [0.9, 0, -1.5] }), ac("hall", "kidB", ["neutral"], { at: [1.6, 0, -4.2] })], props: [badge("coach", "60", SHOW, 0.4), badge("kidE", "45", SHOW), badge("kidB", "31", SHOW)] },
    { sc: "hall", amb: "elb_school_hall", light: "interior", until: { word: "And" }, cuts: [[null, A([0.6, 2.6, 3.6], [0.0, 0.4, -2.8], 20, { creep: 0.1 })], ["way.", A([-1.7, 0.9, 2.9], [0.3, 1.3, -1.5], 28)]],
      actors: [ac("hall", "dex", ["grin"], { at: [0.0, 0, -7.0], walk: { to: [0.0, 0, -0.4], from: { word: "Kids" }, until: { word: "way." }, view: "front" } }), ac("hall", "kidA", ["scared"], { at: [-0.3, 0, -3.0], play: [{ ...w("stepped", -0.2), kind: "step", dir: -1, go: [-1.1, 0] }] }), ac("hall", "kidB", ["scared"], { at: [0.4, 0, -3.8], play: [{ ...w("stepped", 0.0), kind: "step", dir: 1, go: [1.0, 0] }] }), ac("hall", "kidC", ["scared"], { at: [-0.3, 0, -5.0], play: [{ ...w("out", 0.0), kind: "step", dir: -1, go: [-1.1, 0] }] }), ac("hall", "kidF", ["scared"], { at: [0.4, 0, -1.8], play: [{ ...w("out", 0.15), kind: "step", dir: 1, go: [1.0, 0] }] })],
      props: [badge("dex", "50", SHOW), badge("kidA", "12", SHOW), badge("kidB", "31", SHOW), badge("kidC", "7", SHOW), badge("kidF", "23", SHOW)] },
    { sc: "hall", amb: "elb_school_hall", light: "interior", cuts: [[null, A([0.3, 1.2, 1.9], [1.5, 1.2, -0.8], 33, { creep: 0.1 })], ["shrank", cu("hall", "kidF", -8, 2.8, 70, { at: [1.65, 0, -0.8], creep: 0.15 })]],
      actors: [ac("hall", "kidF", ["scared"], { at: [1.65, 0, -0.8], slump: 0.9, keys: [{ t: 0, expr: "scared", slump: 0.9, tilt: 7 }] }), ac("hall", "dex", ["grin"], { at: [-0.3, 0, -5.4], walk: { to: [-0.3, 0, 0.8], from: { word: "And" }, until: { word: "walls." }, view: "front" } }), ac("hall", "coach", ["neutral"], { at: [0.3, 0, -7.0], walk: { to: [0.3, 0, 0.6], from: { word: "small" }, until: { word: "walls." }, view: "front" } })],
      props: [badge("kidF", "2", SHOW, 0.34), badge("dex", "50", SHOW), badge("coach", "60", SHOW, 0.4)] }],
  /* 4 Dex is Level 50 (the glitch cut: the world, then Leo's story) */ [{ sc: "hall", amb: "elb_school_hall", light: "interior",
    cuts: [[null, lo("hall", "dex", -8, 3.0, 35, { creep: 0.12, at: [-0.1, 0, -0.9] })], ["He", cu("hall", "leo", 14, 3.0, 50, { creep: 0.1, at: [0.9, 0, 0.5] })]],
    actors: [ac("hall", "dex", ["grin"], { at: [-0.1, 0, -0.9] }), ac("hall", "leo", ["scared"], { at: [0.9, 0, 0.5] })], props: [badge("dex", "50", SHOW), badge("leo", "1", SHOW)] }],
  /* 5 Dex: carry my books */ [{ sc: "hall", amb: "elb_school_hall", light: "interior",
    cuts: [[null, cu("hall", "dex", -12, 3.0, 50, { creep: 0.12, at: [-0.1, 0, -0.9] })], ["And", A([2.0, 1.4, 2.6], [0.2, 1.3, -0.3], 35)]],
    actors: [ac("hall", "dex", ["grin"], { at: [-0.1, 0, -0.9] }), ac("hall", "leo", ["sad"], { at: [0.9, 0, 0.5] })], props: [badge("dex", "50", SHOW), badge("leo", "1", SHOW)] }],
  /* 6 books and homework while the hallway watches */ [{ sc: "hall", amb: "elb_school_hall", light: "interior",
    cuts: [[null, A([0.3, 1.5, 3.8], [0.3, 1.2, -2.0], 24, { creep: 0.1 })], ["did", A([-1.7, 1.3, 2.5], [0.5, 1.2, 0.2], 30, { creep: 0.1 })], ["whole", A([0.9, 1.1, 1.5], [0.6, 1.0, 0.5], 85, { creep: 0.15 })], ["Nobody", cu("hall", "leo", -8, 3.0, 50, { creep: 0.2 })]],
    actors: [ac("hall", "leo", ["sad"], { at: [0.5, 0, -0.2], walk: { to: [0.5, 0, 0.9], t0: 0.0, t1: 3.0, view: "front" } }), ac("hall", "dex", ["grin"], { at: [-1.0, 0, -2.6] }), ac("hall", "kidA", ["neutral"], { at: [-1.6, 0, -4.2] }), ac("hall", "kidB", ["neutral"], { at: [1.6, 0, -3.4] })],
    props: [badge("leo", "1", SHOW), badge("dex", "50", SHOW)] }],
  /* 7 midnight in the bedroom: homework, the clock, the hum */ [{ sc: "bed", amb: "elb_rain_window", light: "night",
    cuts: [[null, A([1.7, 1.5, 2.0], [-0.8, 0.9, -1.4], 24, { creep: 0.1 })], ["finished", cu("bed", "leo", 12, 2.3, 50, { creep: 0.1, at: [-0.9, 0.2, -1.5] })], ["midnight,", A([0.5, 0.88, -1.0], [0.3, 0.64, -2.05], 45, { creep: 0.1 })], ["started", cu("bed", "leo", -8, 2.2, 40, { creep: 0.2, at: [-0.9, 0.2, -1.5] })]],
    actors: [ac("bed", "leo", ["sleepy", "shock", 5.6], { mode: "sit", slump: 0.4, gesture: "write" })] }],
  /* 8 the System Window: Secret Quest (a punch-in on Leo's eyes widening) */ [{ sc: "bed", amb: "elb_rain_window", light: "night",
    cuts: [[null, cu("bed", "leo", 6, 2.3, 50, { creep: 0.1, at: [-0.9, 0.2, -1.5] })], ["window", A([1.2, 1.8, 2.45], [-0.35, 1.75, -0.9], 24)], ["face.", cu("bed", "leo", 0, 1.4, 85, { creep: 0.2, at: [-0.9, 0.2, -1.5] }), true], ["Secret", A([1.1, 1.95, 2.45], [-0.35, 1.95, -0.9], 24, { creep: 0.05 })], ["Penalty:", A([1.1, 1.9, 2.45], [-0.35, 1.9, -0.9], 24, { creep: 0.05 })], ["forever.", cu("bed", "leo", -6, 2.3, 50, { creep: 0.2, at: [-0.9, 0.2, -1.5] })]],
    actors: [ac("bed", "leo", ["shock", "scared", 7.0], { mode: "sit", slump: 0.2 })],
    props: [sysWin([-0.35, 2.0, -0.9], "SYSTEM|[SECRET QUEST]|100 PUSH-UPS BEFORE 5:00 AM|!PENALTY: STAY LVL 1 FOREVER", [{ word: "window" }, { word: "Secret" }, { word: "One" }, { word: "Penalty:" }], 0.95)], shot: { shake: [{ word: "window" }] as never } }],
  /* 9 eleven push-ups, then one more, then one more: a floor-level side view, a tight insert on the trembling hands */ [{ sc: "floorB", amb: "elb_rain_window", light: "night", cuts: [[null, A([0.5, 0.38, 2.4], [0.5, 0.42, 0.0], 20, { creep: 0.08 })], ["eleven", A([1.7, 0.55, 2.1], [0.6, 0.35, 0.0], 28, { creep: 0.1 })], ["arms", A([0.5, 0.45, 1.9], [0.9, 0.42, 0.0], 50, { creep: 0.12 })], ["Then", A([-0.4, 0.5, 2.2], [0.5, 0.45, 0.0], 22, { creep: 0.08 })]],
    actors: [ac("floorB", "leo", ["determined", "scared", 4.0], { keys: [{ t: 0, flip: 0.5, expr: "determined", headTilt: 90 }, { t: 4.2, d: 0.4, flip: 0.5, expr: "scared", headTilt: 90 }, { t: 6.2, d: 0.4, flip: 0.5, expr: "determined", headTilt: 90 }], play: [{ ...w("I'm", 0.1), kind: "pushup", reps: 11, per: 0.62, tire: 0.9 }] })],
    props: [{ id: "lvlBadge", variant: "PUSH-UPS:0/100>11/100>40/100>100/100", at: [0.5, 1.1, -0.5], scale: 0.85, steps: [{ word: "I'm" }, { word: "eleven" }, { word: "Then" }, { word: "Then", n: 2 }] } as PropS] }],
  /* 10 five A.M.: the clock flashes, the number changes, Level 2 (the QUEST COMPLETE window stacks above the badge, never on it) */ [{ sc: "bed", amb: "elb_rain_window", light: "night",
    cuts: [[null, A([0.55, 0.88, -1.05], [0.3, 0.64, -2.05], 45)], ["flashed,", cu("bed", "leo", 8, 3.0, 50, { creep: 0.15, at: [-0.9, 0.2, -1.5] })], ["number", A([1.3, 1.7, 2.45], [-0.9, 1.75, -1.4], 22)]],
    actors: [ac("bed", "leo", ["shock", "excited", 3.4], { mode: "sit", slump: 0.1 })],
    props: [sysWin([-0.9, 2.3, -1.4], "SYSTEM|QUEST COMPLETE|$100 / 100", [{ word: "flashed," }, { word: "number" }, { word: "number" }], 0.75), badge("leo", "1>2", [{ t: -1 }, { word: "number" }], 0.36)] }],
  /* 11 nobody was ever happier about a two */ [{ sc: "bed", amb: "elb_rain_window", light: "night",
    cuts: [[null, cu("bed", "leo", -6, 3.0, 50, { creep: 0.1, at: [-0.9, 0.2, -1.5] })], ["happier", A([1.5, 1.4, 2.2], [-0.8, 1.2, -1.4], 24)]],
    actors: [ac("bed", "leo", ["laugh"], { mode: "sit" })], props: [badge("leo", "2", SHOW, 0.42)] }],
  /* 12 the grind: push-ups at dawn, sprints in the rain, pull-ups on the park bar (the act-shift glitch cut is on "So") */ [
    { sc: "dawn", amb: "elb_court_rain", light: "night", until: { word: "Sprints" }, cuts: [[null, A([0.2, 0.42, 3.7], [-1.2, 0.42, 0.6], 28, { creep: 0.08 })], ["Push-ups", A([-0.1, 0.3, 1.9], [-1.0, 0.22, 0.6], 60, { creep: 0.1 })]],
      actors: [ac("dawn", "leo", ["determined"], { keys: [{ t: 0, flip: 0.5, expr: "determined", headTilt: 90 }], play: [{ ...w("kept", 0.3), kind: "pushup", reps: 5, per: 0.8, tire: 0.4 }] })], props: [badge("leo", "2", SHOW, 0.3)] },
    { sc: "dawn", amb: "elb_court_rain", light: "night", until: { word: "Pull-ups" }, cuts: [[null, A([0.4, 1.1, 3.4], [-0.5, 1.1, 0.6], 30)], ["rain.", A([-4.0, 1.3, 1.8], [1.0, 1.1, 0.6], 26, { creep: 0.12 })]],
      actors: [ac("dawn", "leo", ["determined"], { at: [-3.4, 0, 0.6], walk: { to: [3.4, 0, 0.6], mode: "run", from: { word: "Sprints" }, until: { word: "rain." } } })], props: [badge("leo", "2", SHOW, 0.42)] },
    { sc: "park", amb: "elb_court_day", light: "day", cuts: [[null, A([0.0, 1.4, 4.8], [1.3, 1.7, -1.3], 26, { creep: 0.1 })], ["palms", A([1.0, 2.2, 1.5], [1.3, 2.2, -1.3], 60, { creep: 0.1 })], ["Every", cu("park", "leo", 8, 3.2, 50, { creep: 0.15, at: [1.3, 0.5, -1.0] })]],
      actors: [ac("park", "leo", ["determined", "excited", 5.0], { play: [{ ...w("Pull-ups", 0.2), kind: "barpull", reps: 5, per: 1.3 }] })],
      props: [{ id: "pullupBar", at: [1.3, 0, -1.5], scale: 0.9, steps: [{ t: -1 }] } as PropS, sysWin([-0.4, 2.35, -1.0], "SYSTEM|DAILY QUEST COMPLETE", [{ word: "Every" }], 0.6), badge("leo", "2", SHOW, 0.5)] }],
  /* 13 the climb: Level 15, 40, 85 (each jump lands on its word) */ [{ sc: "park", amb: "elb_court_day", light: "day",
    cuts: [[null, A([-1.2, 1.6, 2.6], [1.3, 1.5, -1.3], 28, { creep: 0.1 })], ["forty.", A([-1.5, 1.2, 2.6], [1.3, 1.5, -1.0], 26, { creep: 0.15 })], ["spring,", A([3.6, 2.4, 3.0], [1.3, 1.2, -1.0], 28, { creep: 0.12 })]],
    actors: [ac("park", "leo", ["determined", "proud", 3.0], { play: [{ ...w("Level", 0.0), kind: "barpull", reps: 4, per: 1.3 }] })],
    props: [{ id: "pullupBar", at: [1.3, 0, -1.5], scale: 0.9, steps: [{ t: -1 }] } as PropS, badge("leo", "2>15>40>85", [{ t: -1 }, { word: "fifteen." }, { word: "forty." }, { word: "eighty-five." }], 0.6)] }],
  /* 14 stronger: arms, legs, catching Dex's thrown books */ [{ sc: "park", amb: "elb_court_day", light: "day",
    cuts: [[null, cu("park", "leo", 10, 3.0, 50, { creep: 0.1, at: [0.5, 0, 0.6] })], ["legs", A([-1.6, 1.2, 2.4], [0.5, 1.0, 0.6], 30, { creep: 0.1 })], ["catching", A([-0.6, 1.5, 1.9], [0.4, 1.3, 0.6], 40, { creep: 0.1 })]],
    actors: [ac("park", "leo", ["proud", "excited", 3.6], { at: [0.5, 0, 0.6], gesture: "pump" }), ac("park", "dex", ["grin"], { at: [-3.6, 0, 0.0] })],
    props: [badge("leo", "85", SHOW, 0.36), { id: "bookToss", at: [-2.0, 1.0, 0.2], scale: 1, ball: [{ kind: "hold", who: "dex", t: 0, which: "hi" }, { ...w("catching", -0.3), kind: "flight", from: [-3.2, 1.3, 0.1], to: { who: "leo", up: 1.1 }, dur: 0.9, apex: 0.5, spin: 14 } as BallSeg, { ...w("catching", 0.6), kind: "hold", who: "leo", which: "hi" }], steps: [{ t: -1 }] } as PropS] }],
  /* 15 at school: hood up, no number (nobody stands behind Leo's head) */ [{ sc: "hall", amb: "elb_school_hall", light: "interior",
    cuts: [[null, A([0.2, 1.5, 3.9], [0.2, 1.3, -2.4], 24, { creep: 0.1 })], ["hoodie", cu("hall", "leoH", -8, 2.8, 50, { creep: 0.15 })], ["Dex", A([1.6, 1.4, 2.0], [-0.5, 1.4, -1.0], 35)], ["thought", A([0.6, 0.6, 3.0], [-0.1, 1.5, -1.0], 26, { creep: 0.1 })], ["let", cu("hall", "leoH", 10, 2.6, 50, { creep: 0.2 })]],
    actors: [ac("hall", "leoH", ["neutral", "smile", 3.4], { at: [0.5, 0, -1.5], walk: { to: [0.5, 0, 0.5], t0: 0.0, t1: 2.6, view: "front" } }), ac("hall", "dex", ["grin"], { at: [-0.9, 0, -1.8] }), ac("hall", "kidA", ["neutral"], { at: [-1.6, 0, -3.4] }), ac("hall", "kidB", ["neutral"], { at: [-1.7, 0, -5.0] })],
    props: [badge("dex", "50", SHOW)] }],
  /* 16 Dex: where's my homework */ [{ sc: "hall", amb: "elb_school_hall", light: "interior", cuts: [[null, lo("hall", "dex", 6, 3.0, 35, { creep: 0.15, at: [-0.2, 0, -0.6] })]],
    actors: [ac("hall", "dex", ["grin"], { at: [-0.2, 0, -0.6], gesture: "offer" }), ac("hall", "leoH", ["neutral"], { at: [0.9, 0, 0.7] })], props: [badge("dex", "50", SHOW)] }],
  /* 17 handing it over: the hand doesn't shake (Leo's whole face and hood in frame) */ [{ sc: "hall", amb: "elb_school_hall", light: "interior", cuts: [[null, A([1.9, 1.3, 3.6], [0.3, 1.1, -0.1], 28, { creep: 0.1 })], ["stopped", cu("hall", "leoH", 8, 3.0, 50, { at: [0.7, 0, 0.5], creep: 0.12 })]],
    actors: [ac("hall", "leoH", ["neutral", "smile", 2.2], { at: [0.7, 0, 0.5] }), ac("hall", "dex", ["grin"], { at: [-1.1, 0, -1.3] })], props: [badge("dex", "50", SHOW)] }],
  /* 18 Dex: Gym. Friday. */ [{ sc: "hall", amb: "elb_school_hall", light: "interior", cuts: [[null, cu("hall", "dex", -10, 3.0, 50, { creep: 0.1, at: [-0.2, 0, -0.6] })], ["Everyone's", A([1.0, 1.4, 2.0], [-0.4, 1.4, -0.4], 32, { creep: 0.1 })]],
    actors: [ac("hall", "dex", ["grin"], { at: [-0.2, 0, -0.6] }), ac("hall", "leoH", ["neutral"], { at: [0.9, 0, 0.7] })], props: [badge("dex", "50", SHOW)] }],
  /* 19 Friday: a bird's-eye on the packed gym, the crowd in the bleachers, Dex's entrance */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior",
    cuts: [[null, A([-4.6, 6.0, 4.0], [4.6, 0.8, -2.4], 18, { creep: 0.1 })], ["packed", A([-3.2, 1.5, 1.6], [7.5, 2.8, -1.8], 26, { creep: 0.1 })], ["Dex", lo("gym", "dex", 0, 3.4, 30, { at: [-1.2, 0, -4.8], creep: 0.12 })], ["grinning", cu("gym", "leoH", -10, 3.0, 50, { creep: 0.15 })], ["won.", cu("gym", "dex", 0, 2.8, 50, { at: [-1.2, 0, -3.4], creep: 0.1 })]],
    actors: [ac("gym", "dex", ["grin"], { at: [-1.2, 0, -7.6], walk: { to: [-1.2, 0, -3.4], t0: 0.0, t1: 7.4, view: "front" } }), ac("gym", "leoH", ["determined"]), ac("gym", "kidA", ["excited"], { at: [-3.6, 0, -2.0] }), ac("gym", "kidB", ["excited"], { at: [3.8, 0, -1.2] })],
    props: [badge("dex", "50", SHOW)] }],
  /* 20 Dex: last chance */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior",
    cuts: [[null, A([2.4, 1.4, 4.2], [-0.4, 1.3, -1.2], 30)], ["Say", cu("gym", "dex", -12, 3.0, 50, { at: [-1.0, 0, -2.0], creep: 0.12 })], ["forever,", cu("gym", "leoH", 8, 3.0, 50, { creep: 0.15 })]],
    actors: [ac("gym", "dex", ["grin"], { at: [-1.0, 0, -2.0] }), ac("gym", "leoH", ["determined"]), ac("gym", "kidA", ["laugh"], { at: [-3.6, 0, -2.0] }), ac("gym", "kidB", ["laugh"], { at: [3.8, 0, -1.2] })], props: [badge("dex", "50", SHOW)] }],
  /* 21 one slow breath, then the hood drops (the glitch cut is on "dropped") */ [
    { sc: "gym", amb: "elb_gym_crowd", light: "interior", until: { word: "Then" }, cuts: [[null, cu("gym", "leoH", 0, 2.6, 70, { creep: 0.3 })]], actors: [ac("gym", "leoH", ["determined"]), ac("gym", "dex", ["grin"], { at: [-1.0, 0, -2.0] })], props: [badge("dex", "50", SHOW)] },
    { sc: "gym", amb: "elb_gym_crowd", light: "interior", cuts: [[null, A([-2.6, 1.2, 1.6], [0.3, 1.35, 0.3], 50, { creep: 0.1 })], ["dropped", cu("gym", "leo", 0, 2.4, 50, { creep: 0.1 }), true]],
      actors: [ac("gym", "leo", ["determined"]), ac("gym", "dex", ["grin"], { at: [-1.0, 0, -2.0] })], props: [badge("dex", "50", SHOW)] }],
  /* 22 the reveal: Level 99, gold; the badge, the bass drop and the shockwave land together on "Level 99" */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior",
    cuts: [[null, cu("gym", "leo", 0, 3.5, 40, { creep: 0.12 })], ["Level#2", lo("gym", "leo", 0, 3.6, 28, { creep: 0.1 }), true], ["gold.", A([3.6, 1.6, 4.4], [0.0, 0.8, -1.2], 24, { creep: 0.1 })]],
    actors: [ac("gym", "leo", ["determined", "proud", 2.8]), ac("gym", "dex", ["grin", "shock", 3.2], { at: [-1.8, 0, -2.4] }), ac("gym", "kidA", ["shock"], { at: [-3.6, 0, -2.0] }), ac("gym", "kidB", ["shock"], { at: [3.8, 0, -1.2] })],
    props: [badge("dex", "50", SHOW), badge("leo", "99", [{ word: "Level", n: 2 }], 0.36), { id: "shockRing", at: [0.3, 0, 0.95], scale: 1, steps: [{ word: "Level", n: 2 }] } as PropS], shake: [{ word: "Level", n: 2 }, { word: "Level", n: 2, dt: 0.12 }] as never }],
  /* 23 Dex charges, smiling for half a second */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior",
    cuts: [[null, A([3.0, 0.7, 2.4], [-0.3, 1.0, -3.6], 28)], ["half", cu("gym", "dex", 0, 2.6, 70, { at: [-0.8, 0, -1.2], creep: 0.25 })]],
    actors: [ac("gym", "dex", ["grin", "scared", 2.3], { at: [-1.0, 0, -6.2], play: [{ ...w("charged", -0.1), kind: "charge", dir: 1, go: [0.2, 5.0] }] }), ac("gym", "leo", ["determined"])],
    props: [badge("dex", "50", SHOW), badge("leo", "99", SHOW, 0.36)] }],
  /* 24 one finger, flick (punch-in on Dex's smirk turning to shock, a tight insert on the lifting finger) */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior",
    cuts: [[null, cu("gym", "leo", 6, 3.4, 35, { creep: 0.15 })], ["lifted", cu("gym", "dex", 0, 2.4, 70, { at: [-0.8, 0, -1.2], creep: 0.2 })], ["finger.", A([1.3, 1.45, 2.3], [0.45, 1.35, 0.3], 42, { creep: 0.08 })], ["flicked.", A([1.3, 1.5, 3.4], [0.3, 1.45, 0.3], 32, { creep: 0.1 })]],
    actors: [ac("gym", "leo", ["determined", "excited", 1.8], { play: [{ ...w("flicked.", -0.3), kind: "flick", dir: 1 }] }), ac("gym", "dex", ["grin", "shock", 0.9], { at: [-0.8, 0, -1.2] })], props: [badge("leo", "99", SHOW, 0.36), badge("dex", "50", SHOW)], shake: [{ word: "flicked." }] as never }],
  /* 25 Dex slides the whole length of the gym */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior",
    cuts: [[null, A([5.0, 0.7, -2.4], [-0.5, 0.5, -3.6], 26, { creep: 0.1 })], ["whole", A([2.0, 3.6, 3.0], [-0.5, 0.4, -5.6], 28, { creep: 0.12 })]],
    actors: [ac("gym", "dex", ["shock"], { at: [-0.8, 0, -1.2], play: [{ ...w("slid", -0.2), kind: "slide", dir: 1, go: [-0.2, -6.6] }] }), ac("gym", "leo", ["determined"])], props: [badge("leo", "99", SHOW, 0.36)], shake: [{ word: "slid" }] as never }],
  /* 26 Dex: H-how? */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior", cuts: [[null, A([-0.4, 0.9, -4.6], [-0.6, 0.55, -8.0], 40, { creep: 0.1 })]],
    actors: [ac("gym", "dex", ["shock"], { at: [-0.8, 0, -7.8], play: [{ t: 0, kind: "slide", dir: 1, go: [0, 0] }] }), ac("gym", "leo", ["determined"])], props: [badge("leo", "99", SHOW, 0.36)] }],
  /* 27 Leo: you said it yourself */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior", cuts: [[null, A([2.2, 1.3, 2.4], [0.0, 1.3, -2.0], 28)], ["The", cu("gym", "leo", -8, 3.2, 50, { creep: 0.15, at: [0.3, 0, -0.6] })]],
    actors: [ac("gym", "leo", ["proud", "smile", 2.6], { at: [0.3, 0, -0.6] }), ac("gym", "dex", ["shock"], { at: [-0.8, 0, -7.8], play: [{ t: 0, kind: "slide", dir: 1, go: [0, 0] }] })], props: [badge("leo", "99", SHOW, 0.36)] }],
  /* 28 the gym goes wild: the bleachers on both sides, a bird's-eye of the packed gym */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior", cuts: [[null, A([2.8, 1.5, 1.8], [-7.0, 2.6, -1.6], 24, { creep: 0.1 })], ["went", A([4.6, 6.0, 3.0], [-4.6, 0.8, -2.2], 18, { creep: 0.1 })], ["first", lo("gym", "leo", 0, 3.6, 28, { at: [0.3, 0, -0.6], creep: 0.1 })], ["cheering", cu("gym", "leo", 8, 3.2, 50, { at: [0.3, 0, -0.6], creep: 0.15 })]],
    actors: [ac("gym", "leo", ["laugh"], { at: [0.3, 0, -0.6] }), ac("gym", "kidA", ["excited"], { at: [-3.4, 0, 1.4] }), ac("gym", "kidB", ["excited"], { at: [3.6, 0, 1.2] })], props: [badge("leo", "99", SHOW, 0.36)] }],
  /* 29 a new window: NEW QUEST UNLOCKED (centred above Leo's head and his badge, clear of the caption line) */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior", cuts: [[null, cu("gym", "leo", 0, 3.6, 40, { at: [0.3, 0, -0.6], creep: 0.12 })], ["window", A([0.3, 1.7, 5.4], [0.3, 1.75, -0.6], 24, { creep: 0.1 }), true], ["quest", A([-1.6, 1.5, 2.6], [0.3, 1.7, -0.6], 40, { creep: 0.1 })]],
    actors: [ac("gym", "leo", ["shock", "thinking", 2.6], { at: [0.3, 0, -0.6] })], props: [badge("leo", "99", SHOW, 0.36), sysWin([0.3, 2.35, -0.6], "SYSTEM|[NEW QUEST UNLOCKED]|$???", [{ word: "window" }, { word: "quest" }, { word: "unlocked." }], 0.75)] }],
  /* 30 cliffhanger: three glowing question marks (the glitch cut is on "badge") */ [{ sc: "gym", amb: "elb_gym_crowd", light: "interior", cuts: [[null, A([0.0, 1.5, 4.6], [0.2, 1.3, -3.6], 24, { creep: 0.18 })], ["badge", A([2.9, 1.9, -1.6], [2.9, 1.95, -6.0], 55, { creep: 0.1 })], ["Three", cu("gym", "leo", -12, 3.2, 50, { at: [0.3, 0, -0.6], creep: 0.2 })]],
    actors: [ac("gym", "leo", ["determined"], { at: [0.3, 0, -0.6] }), ac("gym", "stranger", ["neutral"], { at: [2.9, 0, -6.0] })], props: [badge("leo", "99", SHOW, 0.36), badge("stranger", "???", [{ word: "badge" }], 0.42)] }],
];
const SETLIGHT: Record<string, string> = { hall: "e4Hallway", bed: "e4Bedroom", floorB: "e4Bedroom", dawn: "e4Court", park: "e4Court", gym: "e4Gym" };
/** a segment's camera beats: the opening camera, then a hard cut (or a snap-zoom swoop) on each named word */
const beatsOf = (cuts: Cut[]) => cuts.length < 2 ? {} : { cams: cuts.map(([wd, cam, sw], j) => (j === 0 ? { t: 0, ...cam, blockOk: true } : { word: wd!.split("#")[0], n: Number(wd!.split("#")[1] ?? 1), ...cam, ...(sw ? { swoop: 0.3 } : { cut: true }), blockOk: true })) } as { cams: NonNullable<Storyboard["shots"][number]["cams"]> };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'—-]/g, "");
/** the token index of the n-th word in a line (exact match first, then a prefix) */
const tokIdx = (text: string, word: string, n = 1) => { const toks = text.split(/\s+/).map(norm), key = norm(word); const ex = toks.map((t, i) => (t === key ? i : -1)).filter((i) => i >= 0); const pre = toks.map((t, i) => (t.startsWith(key) ? i : -1)).filter((i) => i >= 0); return (ex.length >= n ? ex : pre)[n - 1] ?? 0; };
const shotsOf = () => S.flatMap(([w0, text, snd], i) => {
  const segs = SEGS[i], toks = text.split(/\s+/).filter(Boolean), starts = segs.map((_, j) => (j === 0 ? 0 : tokIdx(text, segs[j - 1].until!.word, segs[j - 1].until!.n ?? 1)));
  return segs.map((sg, j) => {
    const from = starts[j], to = j + 1 < segs.length ? starts[j + 1] : toks.length, slice = toks.slice(from, to).join(" ");
    const mine = (snd ?? []).flatMap(([word, n, name, gain, delay]) => {
      const key = norm(word), nt = toks.map(norm), ex = nt.map((t, q) => (t === key ? q : -1)).filter((q) => q >= 0), pre = nt.map((t, q) => (t.startsWith(key) ? q : -1)).filter((q) => q >= 0), L = ex.length >= n ? ex : pre, k = L[n - 1] ?? 0;
      if (k < from || k >= to) return [];
      return [{ word, n: L.filter((q) => q >= from && q <= k).length, name, ...(gain ? { gain } : {}), ...(delay ? { delay } : {}) }];
    });
    const last = j === segs.length - 1, say = { text: slice, who: w0 } as Line;
    return { set: SETLIGHT[sg.sc], light: sg.light ?? "interior", ambience: sg.amb, camera: sg.cuts[0][1], ...beatsOf(sg.cuts), say, hold: last ? 0.05 : 0,
      props: sg.props ?? [], actors: sg.actors, ...(mine.length ? { sfx: mine } : {}), ...(sg.shake ? { shake: sg.shake } : {}), ...(sg.shot ?? {}), note: `${w0}: ${slice}` } as Storyboard["shots"][number];
  });
});

export const SOLO_LEVELING_1: Storyboard = {
  id: "solo-leveling-1", title: "The Solo Leveling World",
  cast: { leo: "leoHoodie", leoH: "leoHood", dex: "dex", kidA: "kidA", kidB: "kidB", kidC: "kidC", kidD: "kidD", kidE: "kidE", kidF: "kidF", coach: "coach", stranger: "stranger" },
  voice: "leo", voices: { leo: "leo", leoH: "leo", dex: "e4Rival" }, narration: "continuous",
  captionStyle: "viral", captionKeys: ["Level", "Dex", "Leo", "LVL", "Secret", "Quest", "Penalty", "99", "gold", "flicked", "window", "hidden"],
  // Morning Mood, the channel's signature score (assets/music/morning-mood.mp3, public domain), straight through; it ducks 8 dB under every RPG chime, System Window pop-up and the bass drop
  music: { file: "morning-mood", gain: 0 },
  crowdSfx: true,
  wordSfxMap: {},
  engine: 4, motionBlur: true, controlledBlur: true,
  blurIn: { dur: 0.45, px: 14 },
  glitch: [{ word: "Dex", n: 1 }, { word: "So", n: 2 }, { word: "dropped", n: 1 }, { word: "badge", n: 1 }],
  clarity: {
    premise: "In a world where everyone wears a floating power level, Level 1 Leo is bullied by Level 50 Dex until a secret quest system lets him grind to Level 99 in secret and flick Dex across the gym.",
    facts: [
      { fact: "power levels exist and float over everyone's head", said: "everyone has a floating power level" },
      { fact: "a high number earns respect", said: "the higher your number, the more the whole school listens to you" },
      { fact: "Leo is Level 1 and Dex is the Level 50 bully", said: "Dex is Level 50. He makes sure I never forget it" },
      { fact: "what Dex makes Leo do", said: "I carried his books and did his homework" },
      { fact: "the blue window is a secret quest with a penalty", said: "Secret Quest. One hundred push-ups before five A.M. Penalty: stay Level 1 forever" },
      { fact: "Leo hides his number so Dex keeps underestimating him", said: "I kept my hoodie up and my number hidden. Dex still thought I was Level 1, and I let him" },
      { fact: "the reveal", said: "My number wasn't Level 1 anymore. It was Level 99, and it was gold" },
      { fact: "the callback", said: "The higher the number, the more people listen" },
    ],
  },
  shots: shotsOf(),
};
