// EPISODE 2: "The Day I Stole Kevin Durant's Talent" (productions/kd-talent-1/script.md): Engine 4, two procedural sets (the street court by day and at 5 AM in the rain,
// the Thunder arena with its tunnel), Leo's first-person voice-over plus live dialogue (Leo, Dex, KD, the coach), four hero insert props, the viral SFX pack plus grounded basketball
// SFX, and Morning Mood (a sad piano from "My arms felt heavy", dead silence and a sub-bass hit on "buzzer", Morning Mood swelling back on "Swish.").
// THE SHOT LIST (owner's go, 28 Nov 2026): 87 camera beats over 148.7 s (one visual change every ~1.7 s) written to the locked audio masters (the lines, voices, music and SFX above are unchanged):
// low-angle heroes (KD in the tunnel, the first dunk, the shoulder lift), high-angle underdog shots (picked last, the bench), a bird's-eye on the three-defender swarm, macro inserts on the
// four hero props at their spoken words, snap-zooms on the swishes and punchlines, slow push-ins through the sad piano. Hand-held drift is the engine default.
import type { Storyboard, Line } from "../story/types";
import { fovMm, blurMm } from "../engine4/camera";
import { pullUpSwish, brickShot, crossover, type PlayMove, type BallSeg, type When2 } from "../engine4/motion";

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
  dawn: { leo: [-2.4, 0, 0.2] },
  tunnel: { kd: [-13.3, 0, 0.3], leo: [-11.3, 0, 0.9] },
  tunnel2: { kd: [-13.0, 0.2, -2.0], leoJ: [-11.7, 0, -3.0] },
  arena: { kd: [0, 0, -3.4], leoJ: [1.5, 0, -2.4], coach: [-5.4, 0, -1.0], defA: [-1.1, 0, -4.1], defB: [1.1, 0, -4.1], defC: [0, 0, -5.2] },
  stands: { leo: [12.2, 2.5, -1.3], dad: [12.2, 2.5, -0.5] },
  bed: { leo: [-0.9, 0.5, -1.5] },
  office: { leo: [0.0, 0, -0.1] },
};
const CROWN: Record<string, number> = { leo: 1.31, leoJ: 1.31, dex: 1.28, kd: 1.8, coach: 1.6, kidA: 1.3, kidB: 1.3, kidC: 1.3, kidD: 1.3, defA: 1.7, defB: 1.7, defC: 1.7, dad: 1.65 };
type C = Storyboard["shots"][number]["camera"];
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
const rad = Math.PI / 180;
const A = (pos: V, look: V, mm: number, o: { creep?: number; roll?: number } = {}): C => ({ move: "at" as const, pos, look, fov: fovMm(mm), blur: blurMm(mm) + (mm >= 50 ? 2 : 0), ...o }) as never;
/** a framing of one actor from `deg` degrees off straight-on, `d` m away, on a `mm` lens: the eyes in the upper-middle of the frame, the whole face in; y = the camera height (default level) */
const view = (sc: string, who: string, deg: number, d: number, mm: number, y: number | undefined, o: { creep?: number; roll?: number } = {}, at?: V): C => {
  const p = at ?? POS[sc][who], H = (d * 24) / mm, centre = p[1] + CROWN[who] - 0.12 - 0.1 * H;
  return A([p[0] + Math.sin(deg * rad) * d, y ?? centre, p[2] + Math.cos(deg * rad) * d], [p[0], centre, p[2]], mm, o);
};
type Opt = { creep?: number; roll?: number; at?: V };
const cu = (sc: string, who: string, deg = 0, d = 2.6, mm = 50, o: Opt = {}) => view(sc, who, deg, d, mm, undefined, o, o.at);
const lo = (sc: string, who: string, deg = 0, d = 2.4, mm = 35, o: Opt = {}) => view(sc, who, deg, d, mm, (o.at?.[1] ?? 0) + 0.3, o, o.at);   // a low-angle hero shot, looking UP
const hi = (sc: string, who: string, deg = 0, d = 2.6, mm = 35, o: Opt = {}) => view(sc, who, deg, d, mm, (o.at?.[1] ?? POS[sc][who]?.[1] ?? 0) + CROWN[who] + 0.85, o, o.at);   // a high-angle underdog shot, looking DOWN
const WIDE_COURT = A([1.6, 1.8, 4.8], [-0.5, 1.1, -0.4], 24), WIDE_COURT_LOW = A([2.2, 0.5, 4.4], [0, 1.4, -1.5], 24, { creep: 0.1 });
const WIDE_ARENA = A([3.6, 1.9, 4.8], [0, 1.2, -3.8], 26, { creep: 0.1 }), BIRDS_EYE = A([0, 7.4, -2.2], [0, 0, -4.2], 30, { creep: 0.1 });
const WIDE_TUNNEL = A([-9.3, 1.5, 2.8], [-12.0, 1.1, -0.3], 22), TWO_SHOT_TUNNEL = A([-12.3, 0.45, 3.0], [-12.3, 1.2, 0.5], 20, { creep: 0.08 });
const RIM_CLOSE = A([1.2, 1.8, -1.4], [0, 2.6, -4.1], 40);
const ANET = (x = 0.9) => A([x, 2.3, -6.0], [0, 2.45, -8.15], 50);
// the rims (the ball's net ripples there)
const RIM_C: V = [0, 2.45, -4.15], RIM_A: V = [0, 2.45, -8.15];
// inserts: a macro of each hero prop on the word that names it, framed so its text sits above the caption band (about 66-78 % of the frame height)
const INS_BALL = A([-12.3, 1.1, 2.3], [-12.3, 1.05, 0.6], 35), INS_SPARK = A([-12.3, 1.1, 1.8], [-12.3, 1.05, 0.6], 30, { creep: 0.15 });
const INS_PHONE = A([-4.4, 1.0, 1.0], [-4.4, 1.0, -1.2], 45), INS_SCORE = A([0, 1.4, 4.2], [0, 5.0, -3.0], 30, { creep: 0.1 });
const INS_TV = A([1.2, 0.9, 1.6], [1.45, 0.5, -2.1], 40), INS_TV2 = A([1.4, 0.9, 1.4], [1.45, 0.5, -2.1], 40, { creep: 0.15 });
const INS_CLOCK = A([0.45, 0.85, -1.1], [0.3, 0.64, -2.05], 45, { creep: 0.1 });
const INS_TEXT = A([0.2, 0.75, 2.0], [0.2, 0.75, 0.4], 45), INS_CONTRACT = A([0.05, 1.3, -0.1], [0.1, 0.82, -0.95], 38, { creep: 0.1 }), INS_STAT = A([0.0, 1.4, 3.6], [0.0, 1.4, 0.0], 35);
type Cut = [string | null, C, boolean?];   // [the word it lands on ("Swish.#2" = the second), the camera, a snap-zoom swoop?]
type Face = [string, string?, number?];     // the face at the start, and an optional second face (a bold expression swap) at t seconds (default 1.2)
type Ex = { at?: V; play?: PlayMove[]; walk?: { to: V; t0: number; t1: number }; mode?: string; slump?: number; look?: [number, number]; keys?: K; sad?: boolean };
const ac = (sc: string, who: string, face: Face, ex: Ex = {}) => {
  const p = ex.at ?? POS[sc][who];
  const keys: K = ex.keys ?? [{ t: 0, expr: face[0] as never, ...(ex.slump ? { slump: ex.slump } : {}), ...(ex.look ? { look: ex.look } : {}) }, ...(face[1] ? [{ t: face[2] ?? 1.2, d: 0.34, expr: face[1] as never }] : [])];
  return { who, at: p, act: "neutral" as const, facing: "camera" as const, keys, ...(ex.play ? { play: ex.play } : {}), ...(ex.walk ? { walk: ex.walk } : {}), ...(ex.mode ? { mode: ex.mode as never } : {}), ...(ex.sad ? { keepFace: true, sadTalk: true } : {}) };
};
const ball = (rim: V, segs: BallSeg[], at: V = [0, 0.2, 0]) => ({ id: "gameBall", at: [at[0] + 0.55, at[1], at[2] + 0.3] as V, variant: rim.join(","), scale: 1, ball: segs, steps: [{ t: -1 }] });
type PropS = NonNullable<Storyboard["shots"][number]["props"]>[number];
type Seg = { sc: string; place: Place; until?: { word: string; n?: number }; cuts: Cut[]; actors: ReturnType<typeof ac>[]; props?: PropS[]; amb?: Place; shake?: (number | { word: string; n?: number })[] };
const w = (word: string, dt = 0, n = 1): When2 => ({ word, n, dt });
const ARENA_CREW = (faces: Record<string, Face>, ex: Record<string, Ex> = {}, defenders = false) => [
  ac("arena", "kd", faces.kd ?? ["neutral"], ex.kd), ac("arena", "leoJ", faces.leoJ ?? ["neutral"], ex.leoJ), ac("arena", "coach", faces.coach ?? ["neutral"], ex.coach),
  ...(defenders ? [ac("arena", "defA", faces.defA ?? ["angry"], ex.defA), ac("arena", "defB", faces.defB ?? ["angry"], ex.defB), ac("arena", "defC", faces.defC ?? ["angry"], ex.defC)] : []),
];
const CLEAR_L = { kidA: { at: [-3.3, 0, -0.8] as V }, kidB: { at: [3.0, 0, -1.2] as V }, kidC: { at: [-3.6, 0, -2.6] as V }, kidD: { at: [2.1, 0, -2.3] as V } };   // the kids stand clear of Leo's line (none behind his head)
const CLEAR_R = { dex: { at: [1.6, 0, -3.4] as V }, kidA: { at: [1.7, 0, -1.3] as V }, kidB: { at: [3.4, 0, -2.2] as V }, kidC: { at: [1.0, 0, -2.5] as V }, kidD: { at: [2.4, 0, -2.6] as V } };
const COURT_CREW = (faces: Record<string, Face>, ex: Record<string, Ex> = {}) => ["leo", "dex", "kidA", "kidB", "kidC", "kidD"].map((k) => ac("court", k, faces[k] ?? ["neutral"], ex[k]));

// ================================ the shot list: one entry per spoken line; a line that changes place is split on a word ================================
const shootAt: V = [-1.2, 0, -1.0];    // Leo's mid-range spot on the street court (3.2 m from the rim)
const SEGS: Seg[][] = [
  /* 0 the flash-forward: Leo hits the game-winner next to KD */ [{ sc: "arena", place: "arena", cuts: [[null, lo("arena", "kd", -15, 3.2, 35, { creep: 0.12 })], ["game-winner", A([2.6, 0.5, -0.4], [1.4, 0.95, -5.4], 28), true], ["right", WIDE_ARENA]],
    actors: ARENA_CREW({ leoJ: ["proud"], kd: ["smile"] }, { leoJ: { at: [1.4, 0, -5.0], play: [pullUpSwish("leoJ", w("game-winner", -1.12), RIM_A).play] } }),
    props: [ball(RIM_A, pullUpSwish("leoJ", w("game-winner", -1.12), RIM_A).ball)] }],
  /* 1 picked last */ [{ sc: "court", place: "court", cuts: [[null, hi("court", "leo", 12, 2.6, 35)], ["always", cu("court", "leo", -8, 2.5, 50, { creep: 0.15 })]], actors: COURT_CREW({ leo: ["sad"], dex: ["grin"] }) }],
  /* 2 "I brick every shot": Leo shoots off-balance and the ball clanks off the rim exactly on "brick" */ [{ sc: "court", place: "court",
    cuts: [[null, WIDE_COURT], ["tallest", lo("court", "dex", -10, 2.4, 35)], ["before", hi("court", "leo", -8, 2.6, 35, { at: shootAt })], ["because", A([2.6, 1.3, 2.4], [-0.5, 1.5, -2.4], 28, { creep: 0.1 })], ["brick", RIM_CLOSE]],
    actors: COURT_CREW({ leo: ["sad"], dex: ["grin"] }, { ...CLEAR_L, leo: { at: shootAt, play: [brickShot("leo", w("brick", -1.2), RIM_C, { dir: 1 }).play] } }),
    props: [ball(RIM_C, brickShot("leo", w("brick", -1.2), RIM_C, { dir: 1 }).ball)], shake: [w("brick") as never] }],
  /* 3 Nice shot, Brick! */ [{ sc: "court", place: "court", cuts: [[null, lo("court", "dex", 6, 2.0, 40, { creep: 0.15 })]], actors: COURT_CREW({ leo: ["sad"], dex: ["laugh"] }) }],
  /* 4 the lethal crossover and the pull-up middy: KD in the arena, then Leo's clank */ (() => {
    const kd0: V = [-2.2, 0, -3.4], x = crossover("kd", w("lethal", -0.2), 1, [1.8, -0.9], { who: "defA", go: [-0.5, 0.2] }), pu = pullUpSwish("kd", w("pull-up", -0.95), RIM_A, { go: [0.4, -0.3] });
    const lb = brickShot("leo", w("clanked", -1.2), RIM_C, { dir: -1 });
    return [
      { sc: "court", place: "court", until: { word: "The" }, cuts: [[null, cu("court", "leo", 0, 2.8, 50)], ["Durant", WIDE_COURT_LOW]], actors: COURT_CREW({ leo: ["smile"], dex: ["grin"] }) },
      { sc: "arena", place: "arena", until: { word: "I" }, cuts: [[null, A([3.4, 1.3, -0.8], [-0.8, 1.2, -3.6], 28, { creep: 0.08 })], ["crossover.", A([1.4, 0.4, -2.0], [-0.4, 1.2, -4.0], 26), true], ["unstoppable", lo("arena", "kd", -20, 3.0, 35, { at: [0.0, 0, -4.6] })], ["middy.", A([-2.0, 2.0, -5.2], [0, 2.45, -8.15], 40)]],
        actors: [ac("arena", "kd", ["determined"], { at: kd0, play: [...x.play.filter((m) => m.kind === "crossover"), pu.play] }), ac("arena", "defA", ["angry"], { at: [-1.6, 0, -4.8], play: x.play.filter((m) => m.kind === "bite") }), ac("arena", "leoJ", ["neutral"], { at: [3.5, 0, -2.0] })],
        props: [ball(RIM_A, [...x.ball, ...pu.ball], [kd0[0], 0.2, kd0[2]])] },
      { sc: "court", place: "court", cuts: [[null, hi("court", "leo", 8, 2.6, 35, { at: shootAt })], ["clanked", RIM_CLOSE], ["off", cu("court", "leo", -6, 2.4, 50, { creep: 0.2, at: shootAt })]],
        actors: COURT_CREW({ leo: ["sad"], dex: ["grin"] }, { ...CLEAR_L, leo: { at: shootAt, play: [lb.play] } }), props: [ball(RIM_C, lb.ball)] },
    ];
  })(),
  /* 5 the stands, then the tunnel */ [
    { sc: "stands", place: "tunnel", until: { word: "After" }, cuts: [[null, A([9.4, 3.9, -0.9], [12.2, 3.4, -0.9], 30, { creep: 0.1 })], ["Thunder", cu("stands", "leo", -60, 2.2, 40, { at: POS.stands.leo })]],
      actors: [ac("stands", "leo", ["shock"], { mode: "sit", look: [-1.1, 0] }), ac("stands", "dad", ["smile"], { mode: "sit", look: [-1.1, 0] })] },
    { sc: "tunnel", place: "tunnel", cuts: [[null, WIDE_TUNNEL], ["walked", lo("tunnel", "kd", 25, 2.2, 28)], ["signed", INS_BALL], ["beat-up", cu("tunnel", "leo", -22, 2.0, 40)]],
      actors: [ac("tunnel", "kd", ["smile"]), ac("tunnel", "leo", ["shock"])], props: [{ id: "signedBasketball", at: [-12.3, 1.05, 0.6], scale: 1.3, steps: [{ word: "signed" }] }] }],
  /* 6 */ [{ sc: "tunnel", place: "tunnel", cuts: [[null, cu("tunnel", "leo", -15, 2.0, 40)]], actors: [ac("tunnel", "kd", ["smile"]), ac("tunnel", "leo", ["shock"])] }],
  /* 7 */ [{ sc: "tunnel", place: "tunnel", cuts: [[null, lo("tunnel", "kd", 15, 2.0, 35, { creep: 0.12 })]], actors: [ac("tunnel", "kd", ["smile"]), ac("tunnel", "leo", ["shock"])] }],
  /* 8 the spark, and KD shakes his hand out on "shook his hand out" */ [{ sc: "tunnel", place: "tunnel", cuts: [[null, TWO_SHOT_TUNNEL], ["lightning", INS_SPARK, true], ["tingled.", cu("tunnel", "leo", 0, 1.9, 40)], ["Kevin", A([-12.5, 1.2, 2.2], [-12.0, 1.15, -0.1], 26, { creep: 0.1 })]],
    actors: [ac("tunnel", "kd", ["shock", "smile", 2.6], { play: [{ ...w("shook", -0.05), kind: "shake" }] }), ac("tunnel", "leo", ["shock", "excited", 1.2])], props: [{ id: "signedBasketball", at: [-12.3, 1.05, 0.6], scale: 1.3, steps: [{ t: 0 }, { word: "lightning" }, { word: "tingled." }] }] }],
  /* 9 Next morning: Leo steps onto the court, pulls up twice (swish, swish) */ (() => {
    const a = pullUpSwish("leo", w("Swish.", -1.12, 1), RIM_C, { go: [0.3, -0.2] }), b = pullUpSwish("leo", w("Swish.", -0.97, 2), RIM_C, { flight: 0.45, apex: 0.8 });
    const wk = crossover("leo", w("stepped", -0.1), 1, [1.1, -0.6]);
    const ballPlan: BallSeg[] = [{ kind: "hold", who: "leo", t: 0, which: "lo" }, ...wk.ball, a.ball[0], a.ball[1], { ...w("Swish.", 0.12, 1), kind: "flight", from: [0, 1.9, -4.15], to: { who: "leo", up: 1.0 }, dur: 0.5, apex: 0.25 } as BallSeg, ...b.ball.slice(1)];
    return [{ sc: "court", place: "court", cuts: [[null, A([2.4, 1.2, 3.4], [-1.8, 1.2, 0.2], 26)], ["stepped", cu("court", "leo", 0, 3.4, 32, { at: [-2.1, 0, 0.5] })], ["pulled", A([-0.7, 1.3, 2.8], [-1.4, 1.6, -2.4], 26)], ["mid-range", A([1.9, 2.2, -0.9], [0, 2.4, -4.15], 34), true], ["Swish.", A([-1.7, 1.9, 0.2], [-0.3, 1.8, -3.6], 30)], ["Again.", A([-1.9, 2.2, -0.6], [0, 2.4, -4.15], 34)]],
      actors: COURT_CREW({ leo: ["determined", "excited", 2.4] }, { ...CLEAR_R, leo: { at: [-2.6, 0, 0.8], play: [...wk.play, a.play, b.play] } }), props: [ball(RIM_C, ballPlan, [-2.6, 0.2, 0.8])] }];
  })(),
  /* 10 I drove and dunked */ (() => {
    const d = { ...w("dunked—I'd", -0.6), kind: "dunk" as const, go: [1.2, -1.8] as [number, number] };
    const bp: BallSeg[] = [{ kind: "dribble", who: "leo", t: 0, hz: 2.6 }, { ...w("dunked—I'd", -0.7), kind: "hold", who: "leo", which: "hi" }, { ...w("dunked—I'd", -0.04), kind: "flight", from: { who: "leo", up: 1.6 }, to: [RIM_C[0], RIM_C[1] + 0.1, RIM_C[2]], dur: 0.1, apex: 0.0, swish: true }, { ...w("dunked—I'd", 0.06), kind: "drop", from: [RIM_C[0], RIM_C[1] - 0.1, RIM_C[2]] }];
    return [{ sc: "court", place: "court", cuts: [[null, A([3.2, 1.2, 2.5], [-0.6, 1.3, -1.6], 24)], ["dunked", A([2.8, 1.3, -2.2], [-0.3, 2.1, -4.0], 24, { creep: 0.1 }), true], ["net", A([0.9, 2.3, -2.3], [0, 2.4, -4.1], 45)], ["100%.", A([1.0, 1.0, -1.2], [-0.1, 1.2, -3.1], 40)]],
      actors: COURT_CREW({ leo: ["excited", "laugh", 3.2], dex: ["shock"], kidA: ["shock"], kidB: ["excited"] }, { kidA: { at: [-3.3, 0, -1.0] as V }, kidB: { at: [-3.9, 0, -2.4] as V }, kidC: { at: [-2.4, 0, -3.4] as V }, kidD: { at: [-1.2, 0, -5.4] as V }, leo: { at: [-1.4, 0, -1.8], play: [d] } }), props: [ball(RIM_C, bp, [-1.4, 0.2, -1.8])], shake: [w("dunked—I'd", 0.07) as never] }];
  })(),
  /* 11 viral */ [{ sc: "court", place: "court", cuts: [[null, A([0.4, 1.3, 3.0], [0, 1.2, -1.0], 24)], ["40", cu("court", "dex", -5, 2.4, 50)], ["viral", INS_PHONE]], actors: COURT_CREW({ leo: ["proud"], dex: ["shock"], kidA: ["excited"], kidB: ["excited"], kidC: ["laugh"], kidD: ["excited"] }), props: [{ id: "viralPhone", at: [-4.4, 1.25, -1.2], scale: 1.45, steps: [{ word: "viral" }] }] }],
  /* 12 Kevin Durant's words / 5 AM: the bedroom, then the rain court (a crossover and pull-ups) */ (() => {
    const x = crossover("leo", w("AM—rain", 0.2), 1, [1.6, -0.9]);
    const s1 = pullUpSwish("leo", w("AM—rain", 1.0), RIM_C, { go: [0.2, -0.1], flight: 0.55 }), s2 = pullUpSwish("leo", w("AM—rain", 2.45), RIM_C, { flight: 0.55 }), s3 = pullUpSwish("leo", w("AM—rain", 3.9), RIM_C, { flight: 0.55 });
    const back = (dt: number): BallSeg => ({ ...w("AM—rain", dt), kind: "flight", from: [0, 1.5, -4.15], to: { who: "leo", up: 1.0 }, dur: 0.4, apex: 0.35 } as BallSeg);
    return [
      { sc: "bed", place: "dawn", until: { word: "AM—rain" }, cuts: [[null, A([1.9, 1.5, 2.2], [-0.1, 0.85, -1.7], 24, { creep: 0.1 })], ["didn't", cu("bed", "leo", 12, 2.2, 40, { creep: 0.1, at: [-0.9, 0.15, -1.5] })], ["woke", cu("bed", "leo", -10, 2.0, 40, { creep: 0.15, at: [-0.9, 0.15, -1.5] })], ["5", INS_CLOCK]],
        actors: [ac("bed", "leo", ["sleepy", "determined", 5.6], { mode: "sit", slump: 0.7, keys: [{ t: 0, expr: "thinking", slump: 0.7, look: [0, -1] }, { t: 3.7, d: 0.4, expr: "sleepy", slump: 0.9 }, { t: 5.4, d: 0.34, expr: "shock", slump: 0 }, { t: 6.0, d: 0.34, expr: "determined", slump: 0 }] })] },
      { sc: "dawn", place: "dawn", cuts: [[null, A([2.2, 1.4, 3.4], [-1.2, 1.1, -0.6], 26)], ["500", A([2.0, 1.3, 2.4], [-0.8, 1.2, -1.0], 24)], ["pull-up", A([2.0, 1.3, 1.2], [-0.5, 1.5, -2.6], 30)], ["middies", cu("dawn", "leo", 14, 2.6, 50, { creep: 0.2, at: [-0.8, 0, -0.7] })]],
        actors: [ac("dawn", "leo", ["determined"], { play: [...x.play, s1.play, s2.play, s3.play] })], props: [ball(RIM_C, [...x.ball, ...s1.ball.slice(0, 2), back(1.9), ...s2.ball, back(3.35), ...s3.ball], [-2.4, 0.2, 0.2])] },
    ];
  })(),
  /* 13 the TV in Leo's bedroom */ [{ sc: "bed", place: "dawn", cuts: [[null, cu("bed", "leo", 8, 2.4, 50, { at: [-0.9, 0.15, -1.5] })], ["TV,", INS_TV], ["Bricks.", INS_TV2], ["media", cu("bed", "leo", -8, 2.2, 50, { creep: 0.2, at: [-0.9, 0.15, -1.5] })]],
    actors: [ac("bed", "leo", ["thinking", "sad", 3.2], { mode: "sit", slump: 0.2, look: [1, 0] })], props: [{ id: "tvNewsSlump", at: [1.45, 0.55, -2.1], scale: 0.7, steps: [{ word: "TV" }] }] }],
  /* 14 I stared at my hands */ [{ sc: "bed", place: "dawn", cuts: [[null, A([0.3, 0.95, 0.9], [-0.9, 0.8, -1.5], 32)], ["took", cu("bed", "leo", 0, 2.0, 50, { creep: 0.25, at: [-0.9, 0.15, -1.5] })]], actors: [ac("bed", "leo", ["sad", "scared", 2.4], { mode: "sit", slump: 0.5, look: [0, -1] })] }],
  /* 15 the invite, the office, the Q1-Q3 montage, then the tunnel */ (() => {
    const d1 = { ...w("viral", 0.6), kind: "dunk" as const, go: [0.9, -1.1] as [number, number] }, p1 = pullUpSwish("leoJ", w("kid\"", -0.55), RIM_A, { go: [0.2, -0.2] }), x1 = crossover("leoJ", w("with", -0.7), -1, [1.0, -0.6]);
    void d1; void p1; void x1;
    return [
      { sc: "bed", place: "tunnel", until: { word: "the", n: 2 }, cuts: [[null, INS_TEXT]], actors: [ac("bed", "leo", ["shock"], { mode: "sit" })], props: [{ id: "thunderText", at: [0.2, 0.95, 0.4], scale: 1.4, steps: [{ t: 0 }] }] },
      { sc: "office", place: "tunnel", until: { word: "to" }, cuts: [[null, A([2.2, 1.5, 2.6], [0, 1.2, -1.2], 24)], ["miracle", INS_CONTRACT], ["kid", cu("office", "leo", 15, 2.2, 40)]], actors: [ac("office", "leo", ["excited"])] },
      { sc: "arena", place: "tunnel", until: { word: "Before" }, cuts: [[null, A([2.6, 1.2, -3.4], [-0.3, 1.3, -6.4], 26)], ["suit", A([2.8, 1.3, -5.0], [-0.1, 2.2, -7.8], 24), true], ["with", INS_STAT]],
        actors: [ac("arena", "leoJ", ["excited"], { at: [-0.7, 0, -5.4], play: [{ ...w("to", 0.0), kind: "dunk" as const, go: [0.6, -2.0] as [number, number] }] })],
        props: [ball(RIM_A, [{ kind: "dribble", who: "leoJ", t: 0, hz: 2.6 }, { ...w("to", -0.1), kind: "hold", who: "leoJ", which: "hi" }, { ...w("to", 0.56), kind: "flight", from: { who: "leoJ", up: 1.6 }, to: [RIM_A[0], RIM_A[1] + 0.1, RIM_A[2]], dur: 0.1, apex: 0.0, swish: true }, { ...w("to", 0.66), kind: "drop", from: [RIM_A[0], RIM_A[1] - 0.1, RIM_A[2]] }], [-0.7, 0.2, -5.4]), { id: "statGraphic", at: [0.0, 2.1, 0.0], scale: 1.0, variant: "LEO: 30 PTS | Q3", steps: [{ word: "with" }] }], shake: [w("to", 0.66) as never] },
      { sc: "tunnel2", place: "tunnel", cuts: [[null, A([-9.6, 1.5, -0.2], [-12.7, 0.95, -2.4], 26)], ["sat", cu("tunnel2", "kd", 72, 2.4, 32, { at: [-13.0, -0.5, -2.0] })], ["head", cu("tunnel2", "kd", 62, 2.0, 40, { creep: 0.15, at: [-13.0, -0.5, -2.0] })], ["held", A([-10.0, 1.3, -0.6], [-12.4, 0.95, -2.4], 28)]],
        actors: [ac("tunnel2", "kd", ["sad"], { mode: "sit", slump: 0.7, look: [0, -1] }), ac("tunnel2", "leoJ", ["nervous"])] },
    ];
  })(),
  /* 16 */ [{ sc: "tunnel2", place: "tunnel", cuts: [[null, cu("tunnel2", "leoJ", 35, 1.9, 40, { creep: 0.15 })]], actors: [ac("tunnel2", "kd", ["sad"], { mode: "sit", slump: 0.7, look: [0, -1] }), ac("tunnel2", "leoJ", ["sad"])] }],
  /* 17 */ [{ sc: "tunnel2", place: "tunnel", cuts: [[null, A([-9.6, 1.4, -0.2], [-12.4, 0.95, -2.4], 24)], ["lightning", A([-10.7, 1.2, -1.2], [-12.35, 0.95, -2.5], 30, { creep: 0.15 }), true], ["arms", cu("tunnel2", "leoJ", 40, 2.0, 40, { creep: 0.25 })]],
    actors: [ac("tunnel2", "kd", ["shock", "smile", 2.0], { mode: "sit", slump: 0.3 }), ac("tunnel2", "leoJ", ["scared", "sad", 2.4])], props: [{ id: "signedBasketball", at: [-12.35, 0.95, -2.5], scale: 1.3, steps: [{ t: -1 }, { word: "lightning" }] }] }],
  /* 18 Five seconds left: the scoreboard */ [{ sc: "arena", place: "arena", cuts: [[null, INS_SCORE], ["Down", A([3.6, 1.9, 4.8], [0, 1.2, -3.8], 26, { creep: 0.18 })]], actors: ARENA_CREW({ leoJ: ["nervous"], kd: ["determined"], coach: ["stern"] }), props: [{ id: "arenaScoreboard", at: [0, 4.6, -3.0], scale: 1.0, steps: [{ word: "Five" }] }] }],
  /* 19 KD is back: a three; then the swarm */ (() => {
    const t3 = pullUpSwish("kd", w("threes—so", -1.12), RIM_A, { flight: 0.62, apex: 1.4 });
    return [{ sc: "arena", place: "arena", cuts: [[null, lo("arena", "kd", -12, 3.0, 35, { at: [0, 0, -2.3] })], ["threes", WIDE_ARENA], ["three", BIRDS_EYE], ["Coach", cu("arena", "coach", 15, 2.8, 50)]],
      actors: ARENA_CREW({ leoJ: ["nervous"], kd: ["determined"], coach: ["stern"], defA: ["angry"], defB: ["angry"], defC: ["angry"] }, { kd: { at: [0, 0, -2.3], play: [t3.play] } }, true), props: [ball(RIM_A, t3.ball, [0, 0.2, -2.3])] }];
  })(),
  /* 20 */ [{ sc: "arena", place: "arena", cuts: [[null, lo("arena", "coach", 10, 2.4, 40)]], actors: ARENA_CREW({ coach: ["stern"], leoJ: ["scared"], kd: ["determined"] }) }],
  /* 21 "I can't! I lost the powers!": Leo panics (nervous, sweating) */ [{ sc: "arena", place: "arena", cuts: [[null, cu("arena", "leoJ", -10, 2.8, 40)]], actors: ARENA_CREW({ leoJ: ["scared"], coach: ["stern"], kd: ["determined"] }, { leoJ: { sad: true } }) }],
  /* 22 */ [{ sc: "arena", place: "arena", cuts: [[null, lo("arena", "kd", 8, 2.6, 40, { creep: 0.25 })]], actors: ARENA_CREW({ kd: ["smile"], leoJ: ["scared", "determined", 1.6] }) }],
  /* 23 the whip pass: KD snaps it across, Leo catches */ (() => {
    const kd0: V = [-0.8, 0, -5.4], lo0: V = [1.5, 0, -4.9];
    const bp: BallSeg[] = [{ kind: "hold", who: "kd", t: 0, which: "mid" }, { ...w("whipped", 0.0), kind: "flight", from: { who: "kd", up: 1.15 }, to: { who: "leoJ", up: 1.15 }, dur: 0.36, apex: 0.1, spin: 20 }, { ...w("whipped", 0.36), kind: "hold", who: "leoJ", which: "mid" }];
    return [{ sc: "arena", place: "arena", cuts: [[null, BIRDS_EYE], ["whipped", A([3.8, 0.9, -0.4], [0.35, 1.3, -5.15], 22)], ["elbow.", cu("arena", "leoJ", -12, 2.6, 50, { at: lo0 })]],
      actors: [ac("arena", "kd", ["determined"], { at: kd0, play: [{ ...w("whipped", -0.15), kind: "whip" }] }), ac("arena", "leoJ", ["determined"], { at: lo0, play: [{ ...w("whipped", 0.15), kind: "catch", dir: 1 }] }), ac("arena", "defA", ["angry"], { at: [-1.6, 0, -5.9] }), ac("arena", "defB", ["angry"], { at: [-0.1, 0, -6.1] }), ac("arena", "defC", ["angry"], { at: [-0.9, 0, -4.5] }), ac("arena", "coach", ["stern"])], props: [ball(RIM_A, bp, [kd0[0], 0.2, kd0[2]])] }];
  })(),
  /* 24 */ [{ sc: "arena", place: "arena", cuts: [[null, cu("arena", "leoJ", 5, 2.4, 50, { creep: 0.2, at: [1.5, 0, -4.9] })], ["months", cu("arena", "leoJ", -15, 2.0, 70, { creep: 0.15, at: [1.5, 0, -4.9] })]], actors: [ac("arena", "leoJ", ["determined"], { at: [1.5, 0, -4.9] }), ac("arena", "kd", ["determined"], { at: [-0.8, 0, -5.4] }), ac("arena", "coach", ["stern"])] }],
  /* 25 the pull-up: the ball arcs high on "with the ball in the air" and lands on "Swish." */ (() => {
    const lj: V = [1.5, 0, -4.9], rel = w("rose", 0.5);
    const bp: BallSeg[] = [{ kind: "hold", who: "leoJ", t: 0, which: "mid" }, { ...w("rose", 0.08), kind: "hold", who: "leoJ", which: "mid" }, { ...rel, kind: "flight", from: { who: "leoJ", up: 1.95 }, to: [RIM_A[0], RIM_A[1] + 0.08, RIM_A[2]], dur: 3.15, apex: 5.0, swish: true, spin: 6 }];
    return [{ sc: "arena", place: "arena", cuts: [[null, A([3.6, 1.2, -1.6], [1.3, 1.9, -4.9], 24, { creep: 0.1 })], ["buzzer", A([3.0, 0.8, -1.8], [0.2, 3.6, -6.4], 26, { creep: 0.1 }), true], ["ball", A([-3.2, 1.0, -2.0], [0, 4.0, -7.0], 28)]],
      actors: [ac("arena", "leoJ", ["determined", "excited", 1.6], { at: lj, play: [{ ...w("rose", 0.0), kind: "pullup", go: [-0.2, -0.1], rise: 0.5 }] }), ac("arena", "kd", ["determined"], { at: [-0.8, 0, -5.4] }), ac("arena", "coach", ["stern"])], props: [ball(RIM_A, bp, [lj[0], 0.2, lj[2]])] }];
  })(),
  /* 26 Swish. */ [{ sc: "arena", place: "arena", cuts: [[null, ANET()]], actors: [ac("arena", "leoJ", ["laugh"], { at: [1.5, 0, -4.9] }), ac("arena", "kd", ["laugh"], { at: [-0.8, 0, -5.4] })], props: [ball(RIM_A, [{ t: -0.3, kind: "flight", from: [RIM_A[0], RIM_A[1] + 1.2, RIM_A[2]], to: [RIM_A[0], RIM_A[1] + 0.08, RIM_A[2]], dur: 0.3, apex: 0.0, swish: true }, { t: 0, kind: "drop", from: [RIM_A[0], RIM_A[1] - 0.1, RIM_A[2]] }])] }],
  /* 27 the arena explodes; KD lifts Leo onto his shoulders (at mid-court, so no backboard sits behind them) */ [{ sc: "arena", place: "arena", cuts: [[null, A([7.6, 1.8, 4.8], [4.0, 1.55, -1.0], 24)], ["arena", A([4.0, 1.0, 4.0], [3.5, 2.9, -9.0], 26)], ["KD", A([4.6, 1.3, 3.6], [4.0, 1.65, -0.6], 28)], ["shoulders", A([4.5, 1.3, 3.8], [4.0, 1.75, -0.6], 24)], ["chanted", A([6.2, 0.9, 5.2], [4.0, 1.8, -1.0], 22)]],
    actors: [ac("arena", "kd", ["laugh"], { at: [4.0, 0, -1.0] }), ac("arena", "leoJ", ["laugh"], { at: [4.0, 1.45, -0.9], mode: "sit" })] }],
  /* 28 the coin toss: Dex flips a gold coin high in the air on "won the coin toss", catches it, then points at Leo */ [{ sc: "court", place: "court", cuts: [[null, WIDE_COURT], ["won", A([1.3, 1.1, 3.0], [1.0, 2.2, -0.4], 24)], ["pointed", cu("court", "dex", 0, 2.4, 50)]], actors: COURT_CREW({ dex: ["smile"], leo: ["proud"], kidA: ["smile"], kidB: ["smile"] }),
    props: [{ id: "coinToss", at: [1.3, 0.2, 0.2], scale: 1, ball: [{ kind: "hold", who: "dex", t: 0, which: "hi" }, { ...w("won", 0.1), kind: "flight", from: { who: "dex", up: 1.1 }, to: { who: "dex", up: 1.1 }, dur: 1.15, apex: 2.0, spin: 60 } as BallSeg, { ...w("won", 1.25), kind: "hold", who: "dex", which: "hi" }], steps: [{ t: -1 }] }] }],
  /* 29 */ [{ sc: "court", place: "court", cuts: [[null, cu("court", "dex", 0, 2.4, 50, { creep: 0.2 })]], actors: COURT_CREW({ dex: ["smile"], leo: ["smile"] }) }],
];
const SCENES: Record<Place, { set: string; light: "day" | "night" | "interior" | "interiorCool"; ambience: "elb_court_day" | "elb_court_rain" | "elb_arena" | "elb_tunnel" }> = {
  court: { set: "e4Court", light: "day", ambience: "elb_court_day" }, street: { set: "e4Court", light: "day", ambience: "elb_court_day" },
  dawn: { set: "e4Court", light: "night", ambience: "elb_court_rain" }, arena: { set: "e4Arena", light: "interior", ambience: "elb_arena" }, tunnel: { set: "e4Arena", light: "interiorCool", ambience: "elb_tunnel" },
};
/** each segment's set and light (the ambience bed stays the line's original one: the locked mix) */
const SETLIGHT: Record<string, { set: string; light: "day" | "night" | "interior" | "interiorCool" }> = {
  court: { set: "e4Court", light: "day" }, dawn: { set: "e4Court", light: "night" }, arena: { set: "e4Arena", light: "interior" }, tunnel: { set: "e4Arena", light: "interiorCool" }, tunnel2: { set: "e4Arena", light: "interiorCool" },
  stands: { set: "e4Arena", light: "interior" }, bed: { set: "e4Bedroom", light: "night" }, office: { set: "e4Office", light: "interior" },
};
/** a segment's camera beats: the opening camera, then a hard cut (or a snap-zoom swoop) on each named word */
const beatsOf = (cuts: Cut[]) => cuts.length < 2 ? {} : { cams: cuts.map(([wd, cam, sw], j) => (j === 0 ? { t: 0, ...cam, blockOk: true } : { word: wd!.split("#")[0], n: Number(wd!.split("#")[1] ?? 1), ...cam, ...(sw ? { swoop: 0.3 } : { cut: true }), blockOk: true })) } as { cams: NonNullable<Storyboard["shots"][number]["cams"]> };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'—-]/g, "");
/** the token index of the n-th word in a line (exact match first, then a prefix), to give each sound to the segment that says the word */
const tokIdx = (text: string, word: string, n = 1) => { const toks = text.split(/\s+/).map(norm), key = norm(word); const ex = toks.map((t, i) => (t === key ? i : -1)).filter((i) => i >= 0); const pre = toks.map((t, i) => (t.startsWith(key) ? i : -1)).filter((i) => i >= 0); return (ex.length >= n ? ex : pre)[n - 1] ?? 0; };
const shotsOf = () => S.flatMap(([w0, text, place, extra, snd], i) => {
  const segs = SEGS[i], toks = text.split(/\s+/).filter(Boolean), starts = segs.map((_, j) => (j === 0 ? 0 : tokIdx(text, segs[j - 1].until!.word, segs[j - 1].until!.n ?? 1)));
  return segs.map((sg, j) => {
    const sl = SETLIGHT[sg.sc] ?? SETLIGHT[sg.place], from = starts[j], to = j + 1 < segs.length ? starts[j + 1] : toks.length, slice = toks.slice(from, to).join(" ");
    const mine = (snd ?? []).flatMap(([word, n, name, gain, delay]) => {
      const key = norm(word), nt = toks.map(norm), ex = nt.map((t, q) => (t === key ? q : -1)).filter((q) => q >= 0), pre = nt.map((t, q) => (t.startsWith(key) ? q : -1)).filter((q) => q >= 0), L = ex.length >= n ? ex : pre, k = L[n - 1] ?? 0;
      if (k < from || k >= to) return [];
      return [{ word, n: L.filter((q) => q >= from && q <= k).length, name, ...(gain ? { gain } : {}), ...(delay ? { delay } : {}) }];
    });
    const last = j === segs.length - 1, say = { text: slice, who: w0, ...(j === 0 && extra?.gap !== undefined ? { gap: extra.gap } : {}), ...(last && extra?.punch ? { punch: true } : {}), ...(extra?.sub !== undefined ? { sub: extra.sub } : {}) } as Line;
    return { set: sl.set, light: sl.light, ambience: SCENES[place].ambience, camera: sg.cuts[0][1], ...beatsOf(sg.cuts), say, hold: last ? 0.05 : 0,
      props: sg.props ?? [], actors: sg.actors, ...(mine.length ? { sfx: mine } : {}), ...(sg.shake ? { shake: sg.shake } : {}), ...(extra?.punch && last ? { kicks: [0.04] } : {}), note: `${w0}: ${slice}` } as Storyboard["shots"][number];
  });
});

export const KD_TALENT_1: Storyboard = {
  id: "kd-talent-1", title: "The Day I Stole Kevin Durant's Talent",
  cast: { leo: "leoHoodie", leoJ: "leoJersey", dex: "dex", dad: "dad", kd: "kd", coach: "coach", kidA: "kidA", kidB: "kidB", kidC: "kidC", kidD: "kidD", defA: "defA", defB: "defB", defC: "defC" },
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
  shots: shotsOf(),
};
