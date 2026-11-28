// EPISODE 2: "The Day I Stole Kevin Durant's Talent" (productions/kd-talent-1/script.md): Engine 4, two procedural sets (the street court by day and at 5 AM in the rain,
// the Thunder arena with its tunnel), Leo's first-person voice-over plus live dialogue (Leo, Dex, KD, the coach), four hero insert props, the viral SFX pack plus grounded basketball
// SFX, and Morning Mood (a sad piano from "My arms felt heavy", dead silence and a sub-bass hit on "buzzer", Morning Mood swelling back on "Swish.").
// THE SHOT LIST (owner's go, 28 Nov 2026): 87 camera beats over 148.7 s (one visual change every ~1.7 s) written to the locked audio masters (the lines, voices, music and SFX above are unchanged):
// low-angle heroes (KD in the tunnel, the first dunk, the shoulder lift), high-angle underdog shots (picked last, the bench), a bird's-eye on the three-defender swarm, macro inserts on the
// four hero props at their spoken words, snap-zooms on the swishes and punchlines, slow push-ins through the sad piano. Hand-held drift is the engine default.
import type { Storyboard, Line } from "../story/types";
import { fovMm, blurMm } from "../engine4/camera";

type V = [number, number, number];
type Who = "narrator" | "leo" | "leoJ" | "dex" | "kd" | "coach";
type Place = "arena" | "court" | "dawn" | "tunnel" | "street";
/** one shot per line: [speaker, text, scene, extra Line fields, the sounds on its words: [word, nth, sound, gain dB, delay s]] (the viral pack, incl. five from myinstants.com, and the grounded basketball sounds) */
type Snd = [string, number, string, number?, number?][];
const S: [Who, string, Place, Partial<Line>?, Snd?][] = [
  // BEAT 1: the hook (a flash-forward in the arena, then the street)
  ["narrator", "I was 11 when I hit the game-winner for the Oklahoma City Thunder, right next to Kevin Durant.", "arena", undefined, [["game-winner", 1, "el_bb_swish", -2], ["Kevin", 1, "viral_camera_flash"]]],
  ["narrator", "And on my own street, I was always picked last.", "court", undefined, [["last.", 1, "viral_bruh", -3, 0.15]]],
  // BEAT 2: the underdog and the rival
  ["narrator", "Every day after school, Dex—the tallest kid—picks everybody before me, because I brick every shot.", "court", undefined, [["tallest", 1, "whoosh_short", -3], ["everybody", 1, "el_squeak", -6], ["brick", 1, "el_bb_brick"]]],
  ["dex", "Nice shot, Brick!", "court", { punch: true }, [["Brick!", 1, "viral_vine_boom", -2]]],
  ["narrator", "I'm Leo, and Kevin Durant is my hero. The lethal crossover. That unstoppable pull-up middy. I couldn't shoot like him. Every shot clanked off the rim.", "court", undefined, [["hero.", 1, "viral_ding", -8], ["crossover.", 1, "el_squeak", -4], ["middy.", 1, "el_bb_swish", -4], ["clanked", 1, "el_bb_brick", -2]]],
  // BEAT 3: the Thunder game and the spark
  ["narrator", "Then one Friday, my dad took me to a Thunder game. After warmups, Kevin Durant walked right up to the tunnel and signed my beat-up basketball.", "tunnel", undefined, [["game.", 1, "el_arena_roar", -8], ["signed", 1, "el_squeak", -4]]],
  ["leo", "I wish I had your talent.", "tunnel"],
  ["kd", "You need to work hard, kid.", "tunnel", undefined, [["kid.", 1, "viral_ding", -9, 0.1]]],
  ["narrator", "The second our hands touched the ball, lightning shot straight between us. My fingers tingled. Kevin Durant shook his hand out.", "tunnel", { punch: true }, [["lightning", 1, "el_lightning_zap", 0], ["tingled.", 1, "viral_ack", -6]]],
  // BEAT 4: powers and viral fame
  ["narrator", "Next morning, I stepped on the court. I pulled up from mid-range. Swish. Again. Swish.", "court", undefined, [["Swish.", 1, "el_bb_swish"], ["Swish.", 2, "el_bb_swish"], ["Again.", 1, "viral_bing_bing_bing", -5]]],
  ["narrator", "I drove and dunked—I'd never even touched the net before. My middy was 100%.", "court", undefined, [["dunked", 1, "el_bb_dunk"], ["dunked", 1, "viral_sheesh", -6, 0.25], ["100%.", 1, "viral_ding", -3]]],
  ["narrator", "I destroyed tryouts, dropped 40 points on camera, and went viral overnight.", "court", undefined, [["tryouts,", 1, "viral_airhorn", -8], ["40", 1, "viral_anime_wow", -2]]],
  // BEAT 5: the secret habit and the guilt
  ["narrator", "Still, Kevin Durant's words stayed in my head. So I didn't get lazy. For months, I woke up at 5 AM—rain or snow—shooting 500 pull-up middies before school.", "dawn", undefined, [["lazy.", 1, "whoosh_short", -4], ["AM", 1, "el_clock_tick", -3], ["snow", 1, "el_water_rush", -10], ["500", 1, "el_bb_dribble", -5]]],
  ["narrator", "Meanwhile, on TV, Kevin Durant was missing everything. Airballs. Bricks. Turnovers. The media said his career was over.", "dawn", undefined, [["TV,", 1, "viral_info_5", -4], ["Airballs.", 1, "viral_error", -2], ["Bricks.", 1, "el_bb_brick", -2], ["over.", 1, "viral_undertaker_bell", -2]]],
  ["narrator", "I stared at my hands. I didn't just get his talent—I took it.", "dawn", { punch: true }, [["took", 1, "viral_dun_dun_dun", -2]]],
  // BEAT 6: the return
  ["narrator", "The Thunder invited the \"viral miracle kid\" to suit up with KD. Before the fourth quarter, KD sat in the tunnel with his head down. I held out my signed ball.", "tunnel", undefined, [["Thunder", 1, "el_arena_roar", -12], ["down.", 1, "el_breath_hold", -3]]],
  ["leoJ", "I'm sorry. This belongs to you.", "tunnel"],
  ["narrator", "He grabbed it, and the lightning snapped right back. My arms felt heavy. The magic was gone.", "tunnel", { punch: true }, [["snapped", 1, "el_lightning_zap", -2], ["gone.", 1, "viral_error", -4]]],
  // BEAT 7: the climax (the sad piano carries it; the score drops to silence and a sub-bass hit on "buzzer")
  ["narrator", "Five seconds left. Down by one.", "arena", { punch: true }],
  ["narrator", "KD was instantly back—draining threes—so the other team sent three defenders straight at him. Coach pointed at me.", "arena", undefined, [["threes", 1, "el_bb_swish", -5], ["three", 1, "viral_danger_alarm", -6]]],
  ["coach", "Leo! You're in!", "arena", { punch: true }, [["in!", 1, "el_whistle", -4]]],
  ["leoJ", "I can't! I lost the powers!", "arena", undefined, [["powers!", 1, "viral_ack", -3]]],
  ["kd", "The magic didn't wake up at 5 AM, kid. You did.", "arena", { punch: true }, [["did.", 1, "viral_ding", -8, 0.15]]],
  ["narrator", "KD drew all three defenders and whipped the pass to me at the elbow.", "arena", undefined, [["pass", 1, "whoosh_short", -2]]],
  ["narrator", "No lightning. Just months of muscle memory.", "arena"],
  ["narrator", "I rose up for the pull-up middy. The buzzer sounded with the ball in the air.", "arena", { punch: true }, [["buzzer", 1, "el_arena_buzzer", -2]]],
  // BEAT 8: the payoff (Morning Mood swells back on "Swish.")
  ["narrator", "Swish.", "arena", { punch: true }, [["Swish.", 1, "el_bb_swish", 0], ["Swish.", 1, "viral_airhorn", -9, 0.15]]],
  ["narrator", "We won by one. The arena exploded. KD lifted me onto his shoulders while twenty thousand fans chanted my name.", "arena", undefined, [["exploded.", 1, "el_arena_roar", -3], ["shoulders", 1, "viral_sheesh", -8], ["chanted", 1, "el_arena_roar", -8]]],
  ["narrator", "Next day on my street, Dex won the coin toss and pointed straight at me.", "street", undefined, [["toss", 1, "viral_ding", -9], ["pointed", 1, "whoosh_short", -3]]],
  ["dex", "Leo. You're with me.", "street", { punch: true }, [["me.", 1, "viral_bing_bing_bing", -4]]],
];
const LEO = "#" as const; void LEO;
// ---- where everyone stands, per scene: [x, floor y, z]
const POS: Record<string, Record<string, V>> = {
  court: { leo: [-0.4, 0, 1.6], dex: [1.0, 0, -0.4], kidA: [-1.4, 0, -0.9], kidB: [1.9, 0, -1.3], kidC: [-2.2, 0, -1.6], kidD: [0.1, 0, -2.4] },
  dawn: { leo: [-0.4, 0, -1.0] },
  tunnel: { kd: [-11.95, 0, -0.1], leo: [-10.85, 0, 0.9] },
  tunnel2: { kd: [-12.6, 0, -1.5], leoJ: [-11.0, 0, 0.5] },
  arena: { kd: [0, 0, -3.4], leoJ: [1.5, 0, -2.4], coach: [-5.4, 0, -1.0], defA: [-1.1, 0, -4.1], defB: [1.1, 0, -4.1], defC: [0, 0, -5.2] },
};
const CROWN: Record<string, number> = { leo: 1.31, leoJ: 1.31, dex: 1.28, kd: 1.8, coach: 1.6, kidA: 1.3, kidB: 1.3, kidC: 1.3, kidD: 1.3, defA: 1.7, defB: 1.7, defC: 1.7 };
type C = Storyboard["shots"][number]["camera"];
const rad = Math.PI / 180;
const A = (pos: V, look: V, mm: number, o: { creep?: number; roll?: number } = {}): C => ({ move: "at" as const, pos, look, fov: fovMm(mm), blur: blurMm(mm) + (mm >= 50 ? 2 : 0), ...o }) as never;
/** a framing of one actor from `deg` degrees off straight-on, `d` m away, on a `mm` lens: the eyes in the upper-middle of the frame, the whole face in; y = the camera height (default level) */
const view = (sc: string, who: string, deg: number, d: number, mm: number, y: number | undefined, o: { creep?: number; roll?: number } = {}): C => {
  const p = POS[sc][who], H = (d * 24) / mm, centre = CROWN[who] - 0.12 - 0.1 * H;
  return A([p[0] + Math.sin(deg * rad) * d, y ?? centre, p[2] + Math.cos(deg * rad) * d], [p[0], centre, p[2]], mm, o);
};
const cu = (sc: string, who: string, deg = 0, d = 2.6, mm = 50, o: { creep?: number; roll?: number } = {}) => view(sc, who, deg, d, mm, undefined, o);
const lo = (sc: string, who: string, deg = 0, d = 2.4, mm = 35, o: { creep?: number; roll?: number } = {}) => view(sc, who, deg, d, mm, 0.3, o);   // a low-angle hero shot, looking UP
const hi = (sc: string, who: string, deg = 0, d = 2.6, mm = 35, o: { creep?: number; roll?: number } = {}) => view(sc, who, deg, d, mm, CROWN[who] + 0.85, o);   // a high-angle underdog shot, looking DOWN
const WIDE_COURT = A([1.6, 1.8, 4.8], [-0.5, 1.1, -0.4], 24), WIDE_COURT_LOW = A([2.2, 0.5, 4.4], [0, 1.4, -1.5], 24, { creep: 0.1 });
const WIDE_ARENA = A([3.6, 1.9, 4.8], [0, 1.2, -3.8], 26, { creep: 0.1 }), BIRDS_EYE = A([0, 7.4, -2.2], [0, 0, -4.2], 30, { creep: 0.1 });
const WIDE_TUNNEL = A([-9.3, 1.5, 2.8], [-12.0, 1.1, -0.3], 22), TWO_SHOT_TUNNEL = A([-11.4, 0.45, 3.0], [-11.4, 1.2, 0.3], 20, { creep: 0.08 });
const NET = (x = 0.9) => A([x, 2.2, -2.4], [0, 2.45, -4.15], 50), RIM_CLOSE = A([1.2, 1.8, -1.4], [0, 2.6, -4.1], 40);
// inserts: a macro of each hero prop on the word that names it
const INS_BALL = A([-11.4, 1.1, 2.3], [-11.4, 1.05, 0.4], 35), INS_SPARK = A([-11.4, 1.1, 1.6], [-11.4, 1.05, 0.4], 30, { creep: 0.15 }), INS_SPARK2 = A([-12.2, 1.1, 0.9], [-12.2, 1.05, -0.6], 30, { creep: 0.15 });
const INS_PHONE = A([-4.4, 1.0, 1.0], [-4.4, 1.0, -1.2], 45), INS_TV = A([-4.0, 0.9, 3.8], [-4.0, 0.67, -0.4], 40), INS_TV2 = A([-4.0, 0.9, 3.6], [-4.0, 0.67, -0.4], 40, { creep: 0.15 });   // each framed so its text sits above the caption band (about 66-78 % of the frame height)
const INS_SCORE = A([0, 1.4, 4.2], [0, 5.0, -3.0], 30, { creep: 0.1 });
type Cut = [string | null, C, boolean?];   // [the word it lands on ("Swish.#2" = the second), the camera, a snap-zoom swoop?]
type Seq = { sc: string; place: Place; cuts: Cut[] };
const SEQ: Seq[] = [
  /* 0 */ { sc: "arena", place: "arena", cuts: [[null, lo("arena", "kd", -15, 3.2, 35, { creep: 0.12 })], ["game-winner", lo("arena", "leoJ", 10, 2.8, 35)], ["right", WIDE_ARENA]] },
  /* 1 */ { sc: "court", place: "court", cuts: [[null, hi("court", "leo", 12, 2.6, 35)], ["always", cu("court", "leo", -8, 2.5, 50, { creep: 0.15 })]] },
  /* 2 */ { sc: "court", place: "court", cuts: [[null, WIDE_COURT], ["tallest", lo("court", "dex", -10, 2.4, 35)], ["before", hi("court", "leo", -8, 2.6, 35)], ["brick", cu("court", "leo", 6, 2.4, 50)]] },
  /* 3 */ { sc: "court", place: "court", cuts: [[null, lo("court", "dex", 6, 2.0, 40, { creep: 0.15 })]] },
  /* 4 */ { sc: "court", place: "court", cuts: [[null, cu("court", "leo", 0, 2.8, 50)], ["lethal", WIDE_COURT_LOW], ["unstoppable", A([-1.6, 0.5, 0.4], [0, 2.4, -4.0], 28)], ["couldn't", hi("court", "leo", 10, 2.6, 35)], ["clanked", RIM_CLOSE], ["off", cu("court", "leo", -6, 2.4, 50, { creep: 0.2 })]] },
  /* 5 */ { sc: "tunnel", place: "tunnel", cuts: [[null, WIDE_TUNNEL], ["After", cu("tunnel", "leo", -20, 2.0, 35)], ["walked", lo("tunnel", "kd", 25, 2.2, 28)], ["signed", INS_BALL], ["beat-up", cu("tunnel", "leo", 10, 2.0, 40)]] },
  /* 6 */ { sc: "tunnel", place: "tunnel", cuts: [[null, cu("tunnel", "leo", -15, 2.0, 40)]] },
  /* 7 */ { sc: "tunnel", place: "tunnel", cuts: [[null, lo("tunnel", "kd", 15, 2.0, 35, { creep: 0.12 })]] },
  /* 8 */ { sc: "tunnel", place: "tunnel", cuts: [[null, TWO_SHOT_TUNNEL], ["lightning", INS_SPARK, true], ["tingled.", cu("tunnel", "leo", 0, 1.9, 40)], ["Kevin", cu("tunnel", "kd", 12, 2.0, 40)], ["hand", TWO_SHOT_TUNNEL]] },
  /* 9 */ { sc: "court", place: "court", cuts: [[null, WIDE_COURT], ["pulled", cu("court", "leo", -10, 2.6, 50)], ["Swish.", NET(), true], ["Again.", WIDE_COURT_LOW], ["Swish.#2", NET(-0.9), true]] },
  /* 10 */ { sc: "court", place: "court", cuts: [[null, A([3.2, 1.2, 2.5], [0, 1.4, -3.0], 24)], ["dunked", A([-0.8, 0.4, -1.4], [0, 2.3, -3.5], 26, { creep: 0.1 })], ["net", A([0.9, 2.3, -2.3], [0, 2.4, -4.1], 45)], ["100%.", A([0.7, 1.0, -1.0], [0.1, 1.2, -3.3], 40)]] },
  /* 11 */ { sc: "court", place: "court", cuts: [[null, A([0.4, 1.3, 3.0], [0, 1.2, -1.0], 24)], ["40", cu("court", "dex", -5, 2.4, 50)], ["viral", INS_PHONE]] },
  /* 12 */ { sc: "dawn", place: "dawn", cuts: [[null, cu("dawn", "leo", -10, 2.6, 50)], ["lazy.", A([2.0, 1.4, 3.6], [-0.4, 1.1, -2.0], 26)], ["months,", lo("dawn", "leo", 20, 2.2, 35)], ["AM", hi("dawn", "leo", -15, 2.6, 35)], ["snow", A([0.5, 0.5, 0.6], [-0.4, 0.3, -1.0], 35)], ["500", cu("dawn", "leo", 12, 2.2, 50, { creep: 0.2 })]] },
  /* 13 */ { sc: "dawn", place: "dawn", cuts: [[null, cu("dawn", "leo", 8, 2.6, 50)], ["TV,", INS_TV], ["Bricks.", INS_TV2], ["media", cu("dawn", "leo", -8, 2.4, 50, { creep: 0.2 })]] },
  /* 14 */ { sc: "dawn", place: "dawn", cuts: [[null, A([0.2, 0.9, 0.2], [-0.4, 0.8, -1.0], 28)], ["took", cu("dawn", "leo", 0, 2.0, 50, { creep: 0.25 })]] },
  /* 15 */ { sc: "tunnel2", place: "tunnel", cuts: [[null, A([-9.2, 1.5, 2.8], [-12.0, 1.0, -0.8], 22)], ["suit", cu("tunnel2", "leoJ", -15, 2.0, 35)], ["Before", A([-9.4, 1.2, 2.2], [-12.3, 0.9, -1.6], 24)], ["sat", hi("tunnel2", "kd", 10, 2.2, 28)], ["head", cu("tunnel2", "kd", -8, 1.7, 40, { creep: 0.15 })], ["held", cu("tunnel2", "leoJ", 12, 2.0, 35)]] },
  /* 16 */ { sc: "tunnel2", place: "tunnel", cuts: [[null, cu("tunnel2", "leoJ", -10, 1.9, 40, { creep: 0.15 })]] },
  /* 17 */ { sc: "tunnel2", place: "tunnel", cuts: [[null, A([-9.3, 1.3, 2.4], [-11.8, 1.0, -0.5], 22)], ["lightning", INS_SPARK2, true], ["arms", cu("tunnel2", "leoJ", 6, 2.0, 40, { creep: 0.25 })]] },
  /* 18 */ { sc: "arena", place: "arena", cuts: [[null, INS_SCORE], ["Down", A([3.6, 1.9, 4.8], [0, 1.2, -3.8], 26, { creep: 0.18 })]] },
  /* 19 */ { sc: "arena", place: "arena", cuts: [[null, lo("arena", "kd", -12, 3.0, 35)], ["threes", WIDE_ARENA], ["three", BIRDS_EYE], ["Coach", cu("arena", "coach", 15, 2.8, 50)]] },
  /* 20 */ { sc: "arena", place: "arena", cuts: [[null, lo("arena", "coach", 10, 2.4, 40)]] },
  /* 21 */ { sc: "arena", place: "arena", cuts: [[null, cu("arena", "leoJ", -10, 2.6, 50)]] },
  /* 22 */ { sc: "arena", place: "arena", cuts: [[null, lo("arena", "kd", 8, 2.6, 40, { creep: 0.25 })]] },
  /* 23 */ { sc: "arena", place: "arena", cuts: [[null, BIRDS_EYE], ["whipped", A([3.0, 0.5, 0.8], [0, 1.2, -3.2], 24)], ["elbow.", cu("arena", "leoJ", -12, 2.6, 50)]] },
  /* 24 */ { sc: "arena", place: "arena", cuts: [[null, cu("arena", "leoJ", 5, 2.4, 50, { creep: 0.2 })], ["months", cu("arena", "leoJ", -15, 2.0, 70, { creep: 0.15 })]] },
  /* 25 */ { sc: "arena", place: "arena", cuts: [[null, lo("arena", "leoJ", -10, 2.6, 35, { creep: 0.15 })], ["buzzer", A([1.0, 0.6, -1.5], [0, 2.7, -7.6], 35), true]] },
  /* 26 */ { sc: "arena", place: "arena", cuts: [[null, A([0.9, 2.2, -6.2], [0, 2.4, -8.15], 50)]] },
  /* 27 */ { sc: "arena", place: "arena", cuts: [[null, A([3.6, 1.9, 4.8], [0, 1.5, -3.0], 24)], ["arena", A([0, 1.0, 4.0], [0, 4.5, -9.0], 26)], ["KD", A([0.6, 0.4, 3.4], [0, 1.5, -1.2], 24)], ["shoulders", A([0.4, 1.2, 1.4], [0, 1.7, -1.0], 40)], ["chanted", A([2.0, 0.5, 5.0], [0, 1.8, -1.5], 20)]] },
  /* 28 */ { sc: "court", place: "court", cuts: [[null, WIDE_COURT], ["pointed", cu("court", "dex", 0, 2.4, 50)]] },
  /* 29 */ { sc: "court", place: "court", cuts: [[null, cu("court", "dex", 0, 2.4, 50, { creep: 0.2 })]] },
];
const SCENES: Record<Place, { set: string; light: "day" | "night" | "interior" | "interiorCool"; ambience: "elb_court_day" | "elb_court_rain" | "elb_arena" | "elb_tunnel" }> = {
  court: { set: "e4Court", light: "day", ambience: "elb_court_day" }, street: { set: "e4Court", light: "day", ambience: "elb_court_day" },
  dawn: { set: "e4Court", light: "night", ambience: "elb_court_rain" }, arena: { set: "e4Arena", light: "interior", ambience: "elb_arena" }, tunnel: { set: "e4Arena", light: "interiorCool", ambience: "elb_tunnel" },
};
type Face = [string, string?];   // the face at the start, and an optional second face about 1.2 s in (a bold expression swap)
const FACES: Record<number, Record<string, Face>> = {
  0: { leoJ: ["proud"], kd: ["smile"] }, 1: { leo: ["sad"], dex: ["grin"] }, 2: { leo: ["sad"], dex: ["grin"] }, 3: { leo: ["sad"], dex: ["laugh"] }, 4: { leo: ["smile", "sad"], dex: ["grin"] },
  5: { leo: ["shock"], kd: ["smile"] }, 6: { leo: ["shock"], kd: ["smile"] }, 7: { leo: ["shock"], kd: ["smile"] }, 8: { leo: ["shock", "excited"], kd: ["shock", "smile"] },
  9: { leo: ["determined", "excited"], kidA: ["smile"], dex: ["suspicious"] }, 10: { leo: ["excited", "laugh"], dex: ["shock"], kidA: ["shock"], kidB: ["excited"] }, 11: { leo: ["proud"], dex: ["shock"], kidA: ["excited"], kidB: ["excited"], kidC: ["laugh"], kidD: ["excited"] },
  12: { leo: ["determined"] }, 13: { leo: ["determined", "sad"] }, 14: { leo: ["sad", "scared"] }, 15: { leoJ: ["nervous"], kd: ["sad"] }, 16: { leoJ: ["sad"], kd: ["sad"] }, 17: { leoJ: ["scared", "sad"], kd: ["shock", "smile"] },
  18: { leoJ: ["nervous"], kd: ["determined"], coach: ["stern"] }, 19: { leoJ: ["nervous"], kd: ["determined"], coach: ["stern"], defA: ["angry"], defB: ["angry"], defC: ["angry"] }, 20: { coach: ["stern"], leoJ: ["nervous"], kd: ["determined"] },
  21: { leoJ: ["scared"], coach: ["stern"], kd: ["determined"] }, 22: { kd: ["smile"], leoJ: ["scared", "determined"] }, 23: { kd: ["determined"], leoJ: ["determined"], defA: ["angry"], defB: ["angry"], defC: ["angry"] },
  24: { leoJ: ["determined"], kd: ["determined"] }, 25: { leoJ: ["determined", "excited"], kd: ["determined"] }, 26: { leoJ: ["laugh"], kd: ["laugh"] }, 27: { leoJ: ["laugh"], kd: ["laugh"] },
  28: { dex: ["smile"], leo: ["nervous", "smile"], kidA: ["smile"], kidB: ["smile"] }, 29: { dex: ["smile"], leo: ["smile"] },
};
const HERO_SHOT = (i: number, sc: string) => SEQ[i].sc === sc;
const actorsOf = (i: number) => {
  const sq = SEQ[i], faces = FACES[i] ?? {};
  const out = Object.keys(POS[sq.sc]).filter((k) => !k.startsWith("def") || (i >= 19 && i <= 23)).map((who) => {
    let p = POS[sq.sc][who] as V, extra: Record<string, unknown> = {};
    if (i === 10 && who === "leo") { p = [0.1, 1.0, -3.3]; extra = {}; }                     // the first dunk: Leo leaps at the rim
    if (i === 27 && who === "kd") p = [0, 0, -1.0];
    if (i === 27 && who === "leoJ") { p = [0, 1.45, -0.9]; extra = { mode: "sit" }; }                        // on KD's shoulders
    const f = faces[who] ?? ["neutral"], keys = [{ t: 0, expr: f[0] as never, ...(who === "kd" && sq.sc === "tunnel2" ? { slump: 0.6, look: [0, -1] as [number, number] } : {}) }, ...(f[1] ? [{ t: 1.2, d: 0.34, expr: f[1] as never }] : [])];
    return { who, at: p, act: "neutral" as const, facing: "camera" as const, keys, ...extra };
  });
  void HERO_SHOT; return out;
};
const props = (i: number) => i === 5 ? [{ id: "signedBasketball", at: [-11.4, 1.05, 0.4] as V, scale: 1.3, steps: [{ word: "signed" }] }]
  : i === 8 ? [{ id: "signedBasketball", at: [-11.4, 1.05, 0.4] as V, scale: 1.3, steps: [{ t: 0 }, { word: "lightning" }] }]
  : i === 11 ? [{ id: "viralPhone", at: [-4.4, 1.25, -1.2] as V, scale: 1.45, steps: [{ word: "viral" }] }]
  : i === 13 ? [{ id: "tvNewsSlump", at: [-4.0, 0.6, -0.4] as V, scale: 1.0, steps: [{ word: "TV" }] }]
  : i === 17 ? [{ id: "signedBasketball", at: [-12.2, 1.05, -0.6] as V, scale: 1.3, steps: [{ t: -1 }, { word: "lightning" }] }]
  : i === 18 ? [{ id: "arenaScoreboard", at: [0, 4.6, -3.0] as V, scale: 1.0, steps: [{ word: "Five" }] }] : [];
/** a shot's camera beats: the opening camera, then a hard cut (or a snap-zoom swoop) on each named word */
const beats = (i: number) => {
  const cuts = SEQ[i].cuts;
  if (cuts.length < 2) return {};
  return { cams: cuts.map(([w, cam, sw], j) => (j === 0 ? { t: 0, ...cam, blockOk: true } : { word: w!.split("#")[0], n: Number(w!.split("#")[1] ?? 1), ...cam, ...(sw ? { swoop: 0.3 } : { cut: true }), blockOk: true })) } as { cams: NonNullable<Storyboard["shots"][number]["cams"]> };
};

export const KD_TALENT_1: Storyboard = {
  id: "kd-talent-1", title: "The Day I Stole Kevin Durant's Talent",
  cast: { leo: "leoHoodie", leoJ: "leoJersey", dex: "dex", kd: "kd", coach: "coach", kidA: "kidA", kidB: "kidB", kidC: "kidC", kidD: "kidD", defA: "defA", defB: "defB", defC: "defC" },
  voice: "leo", voices: { leo: "leo", leoJ: "leo", dex: "e4Rival", kd: "kdKD", coach: "kdCoach" }, narration: "continuous",
  captionStyle: "viral", captionKeys: ["Leo", "Dex", "KD", "Durant", "Thunder", "lightning", "talent", "Swish", "dunked", "buzzer", "pull-up", "viral"],
  // Morning Mood, the channel's signature score (assets/music/morning-mood.mp3, public domain), Beats 1-6; a slow sad piano (sound/samples/music/kdtalent1_piano) carries "My arms felt heavy"
  // through the climax; on "The buzzer sounded" everything drops to dead silence and a sub-bass hit; Morning Mood swells back from its sunrise climax (0:42 of the file) on "Swish."
  music: { file: "morning-mood", gain: 0, layers: [{ file: "kdtalent1_piano", from: { word: "arms", n: 1 }, to: { word: "buzzer", n: 1 }, fade: 1.6 }],
    cuts: [{ at: { word: "buzzer", n: 1 }, resume: { word: "Swish.", n: 3 }, sub: true, jump: 42, swell: 1.8 }] },
  crowdSfx: true,
  wordSfxMap: {},
  engine: 4, motionBlur: true, controlledBlur: true,
  clarity: {
    premise: "Eleven-year-old Leo, always picked last on his street, wishes he had Kevin Durant's talent, a spark of lightning swaps it into him, and after months of 5 AM practice he hands the ball back and hits the game-winner with his own earned skill.",
    facts: [
      { fact: "who Leo is", said: "I was always picked last" },
      { fact: "the rival", said: "Dex—the tallest kid—picks everybody before me" },
      { fact: "his hero", said: "Kevin Durant is my hero" },
      { fact: "the wish", said: "I wish I had your talent" },
      { fact: "the spark", said: "lightning shot straight between us" },
      { fact: "the cost", said: "I didn't just get his talent—I took it" },
      { fact: "the stakes", said: "Five seconds left. Down by one" },
      { fact: "the lesson", said: "The magic didn't wake up at 5 AM, kid. You did" },
    ],
  },
  shots: S.map(([w, text, place, extra, snd], i) => {
    const sc = SCENES[SEQ[i].place];
    return { set: sc.set, light: sc.light, ambience: sc.ambience, camera: SEQ[i].cuts[0][1], ...beats(i), say: { text, who: w, ...extra } as Line, hold: 0.05, props: props(i), actors: actorsOf(i),
      ...(snd ? { sfx: snd.map(([word, n, name, gain, delay]) => ({ word, n, name, ...(gain ? { gain } : {}), ...(delay ? { delay } : {}) })) } : {}), ...(extra?.punch ? { kicks: [0.04] } : {}),
      note: `${w}: ${text}` };
  }),
};
