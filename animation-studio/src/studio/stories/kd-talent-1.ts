// EPISODE 2: "The Day I Stole Kevin Durant's Talent" (productions/kd-talent-1/script.md): Engine 4, two procedural sets (the street court by day and at 5 AM in the rain,
// the Thunder arena with its tunnel), Leo's first-person voice-over plus live dialogue (Leo, Dex, KD, the coach), four hero insert props, the viral SFX pack plus grounded basketball
// SFX, and a score that hard-cuts to dead silence and a sub-bass hit at "Five seconds left. Down by one." and swells back on the buzzer-beater's "Swish.".
// AUDIO-FIRST BUILD (the Phase A stop gate): narration, voices, music, SFX and both masters are real; the picture is a placeholder storyboard (one simple camera per line,
// the cast standing in the right set). The real shot list (inserts, bird's-eye, low angles, 1.5-2 s cuts) is written after the owner approves the audio.
import type { Storyboard, Line } from "../story/types";
import { fovMm } from "../engine4/camera";

type V = [number, number, number];
type Who = "narrator" | "leo" | "leoJ" | "dex" | "kd" | "coach";
type Place = "arena" | "court" | "dawn" | "tunnel" | "street";
/** one shot per line: [speaker, text, scene, extra Line fields] */
const S: [Who, string, Place, Partial<Line>?][] = [
  // BEAT 1: the hook (a flash-forward in the arena, then the street)
  ["narrator", "I was 11 when I hit the game-winner for the Oklahoma City Thunder, right next to Kevin Durant.", "arena"],
  ["narrator", "And on my own street, I was always the last one picked.", "court"],
  // BEAT 2: the underdog and the rival
  ["narrator", "Every day after school, the kids on my block play at the park.", "court"],
  ["narrator", "Dex, the tallest kid, is always captain.", "court"],
  ["narrator", "And every day, he picks everybody before me.", "court"],
  ["narrator", "Because I bricked every single shot.", "court"],
  ["dex", "Nice shot, Brick!", "court", { punch: true }],
  ["narrator", "My name is Leo, and Kevin Durant is my hero.", "court"],
  ["narrator", "I know his game by heart. The lethal crossover. The high release. That unstoppable pull-up middy.", "court"],
  ["narrator", "I couldn't shoot like KD. I couldn't dribble like him. Every time I shot, it clanked off the backboard.", "court"],
  // BEAT 3: the Thunder game and the spark
  ["narrator", "Then, one Friday, my dad took me to a real Thunder game.", "arena"],
  ["narrator", "After warmups, I leaned over the tunnel holding my beat-up basketball. KD walked right up and signed it.", "tunnel"],
  ["leo", "I wish I had your talent.", "tunnel"],
  ["kd", "You need to work hard, kid.", "tunnel"],
  ["narrator", "The second our hands touched the ball, a jolt of lightning shot straight between us. My fingers tingled. KD blinked and shook his hand out.", "tunnel", { punch: true }],
  // BEAT 4: powers and viral fame
  ["narrator", "The next morning, I stepped onto the court. I dribbled once—and the ball moved like it was on a string.", "court"],
  ["narrator", "I pulled up from mid-range. Swish. Again. Swish.", "court"],
  ["narrator", "I drove to the rim, jumped, and dunked. I'd never even touched the net before.", "court"],
  ["narrator", "My pull-up middy was 100%. I couldn't miss. I destroyed school tryouts.", "court"],
  ["narrator", "Someone filmed me dropping 40 points, and by the end of the month, I was all over the news.", "court"],
  // BEAT 5: the secret habit and the guilt
  ["narrator", "Even with the magic, KD's words stayed in my head. \"You need to work hard, kid.\" So I didn't get lazy.", "dawn"],
  ["narrator", "For months, I woke up at 5 AM. Rain, snow, didn't matter. Five hundred pull-up middies before school, every single day.", "dawn"],
  ["narrator", "Meanwhile, on TV, something was wrong. Kevin Durant was missing everything. Airballs. Bricks. Turnovers.", "dawn"],
  ["narrator", "The media said his career was over.", "dawn"],
  ["narrator", "I stared at my hands and realized the truth. I didn't just get his talent. I took it.", "dawn", { punch: true }],
  // BEAT 6: the return
  ["narrator", "Because I was the \"viral miracle kid,\" the Thunder invited me to suit up and play alongside KD.", "tunnel"],
  ["narrator", "In the tunnel before the fourth quarter, KD sat on the bench with his head down. I walked over and held out my signed basketball.", "tunnel"],
  ["leoJ", "I'm sorry. This belongs to you.", "tunnel"],
  ["narrator", "When he grabbed it, the lightning snapped right back. My arms felt heavy. The magic was gone. I was just me again.", "tunnel", { punch: true }],
  // BEAT 7: the climax (the score hard-cuts to dead silence and a sub-bass hit on "Five")
  ["narrator", "Five seconds left. Down by one.", "arena", { punch: true }],
  ["narrator", "KD was instantly back—draining threes, carrying the team.", "arena"],
  ["narrator", "So on the final play, the other team panicked and sent three defenders straight at him. Coach looked down the bench and pointed at me.", "arena"],
  ["coach", "Leo! You're in!", "arena", { punch: true }],
  ["leoJ", "I can't! I lost the powers!", "arena"],
  ["kd", "The magic didn't wake up at 5 AM, kid. You did.", "arena", { punch: true }],
  ["narrator", "The whistle blew. KD drove, drew all three defenders, and whipped the pass to me at the elbow.", "arena"],
  ["narrator", "No lightning. No superpowers. Just months of muscle memory.", "arena"],
  ["narrator", "I rose up for the pull-up middy. The buzzer went off with the ball in the air.", "arena", { punch: true }],
  // BEAT 8: the payoff (the score swells back on "Swish.")
  ["narrator", "Swish.", "arena", { punch: true }],
  ["narrator", "We won by one. The entire arena exploded. KD lifted me onto his shoulders, and twenty thousand people chanted my name.", "arena"],
  ["narrator", "The lightning gave me a head start—but the countless days and months in the gym made it real.", "arena"],
  ["narrator", "The next day, back on my street, Dex won the coin toss to pick first. He looked at every kid on the court. Then he pointed straight at me.", "street"],
  ["dex", "Leo. You're with me.", "street", { punch: true }],
];
/** the viral pack (assets/sfx/viral, incl. five from myinstants.com) and the grounded basketball sounds, on the words. [word, nth, sound, gain dB, delay s] */
const SFX: Record<number, [string, number, string, number?, number?][]> = {
  0: [["game-winner", 1, "el_bb_swish", -2], ["Kevin", 1, "viral_camera_flash"]],
  1: [["last", 1, "viral_bruh", -3, 0.15]],
  5: [["bricked", 1, "el_bb_brick"]],
  6: [["Brick!", 1, "viral_vine_boom", -2]],
  9: [["clanked", 1, "el_bb_brick", -2], ["dribble", 1, "el_bb_dribble", -4]],
  10: [["game.", 1, "el_arena_roar", -8]],
  11: [["signed", 1, "el_squeak", -4]],
  13: [["kid.", 1, "viral_ding", -9, 0.1]],
  14: [["lightning", 1, "el_lightning_zap", 0], ["tingled.", 1, "viral_ack", -6]],
  15: [["dribbled", 1, "el_bb_dribble"], ["string.", 1, "viral_ding", -4, 0.1]],
  16: [["Swish.", 1, "el_bb_swish"], ["Swish.", 2, "el_bb_swish"], ["Again.", 1, "viral_bing_bing_bing", -5]],
  17: [["dunked.", 1, "el_bb_dunk"], ["dunked.", 1, "viral_sheesh", -6, 0.25]],
  18: [["100%.", 1, "viral_ding", -3], ["tryouts.", 1, "viral_airhorn", -8]],
  19: [["40", 1, "viral_anime_wow", -2]],
  22: [["Airballs.", 1, "viral_error", -2], ["Bricks.", 1, "el_bb_brick", -2], ["TV,", 1, "viral_info_5", -4]],
  23: [["over.", 1, "viral_undertaker_bell", -2]],
  24: [["took", 1, "viral_dun_dun_dun", -2]],
  26: [["bench", 1, "el_squeak", -8], ["down.", 1, "el_breath_hold", -3]],
  28: [["snapped", 1, "el_lightning_zap", -2], ["gone.", 1, "viral_error", -4]],
  30: [["threes,", 1, "el_bb_swish", -5]],
  31: [["three", 1, "viral_danger_alarm", -6]],
  32: [["in!", 1, "el_whistle", -4]],
  33: [["powers!", 1, "viral_ack", -3]],
  34: [["did.", 1, "viral_ding", -8, 0.15]],
  35: [["whistle", 1, "el_whistle"], ["pass", 1, "whoosh_short", -2]],
  37: [["buzzer", 1, "el_arena_buzzer", -2]],
  38: [["Swish.", 1, "el_bb_swish", 0], ["Swish.", 1, "viral_airhorn", -9, 0.15]],
  39: [["exploded.", 1, "el_arena_roar", -3], ["shoulders,", 1, "viral_sheesh", -8], ["chanted", 1, "el_arena_roar", -8]],
  42: [["me.", 1, "viral_bing_bing_bing", -4]],
  2: [["play", 1, "el_bb_dribble", -6]],
  3: [["tallest", 1, "whoosh_short", -3]],
  4: [["picks", 1, "el_squeak", -6]],
  7: [["hero.", 1, "viral_ding", -8]],
  8: [["crossover.", 1, "el_squeak", -4], ["middy.", 1, "el_bb_swish", -4]],
  20: [["magic,", 1, "twinkle", -8], ["lazy.", 1, "whoosh_short", -4]],
  21: [["AM.", 1, "el_clock_tick", -3], ["Rain,", 1, "el_water_rush", -10], ["hundred", 1, "el_bb_dribble", -5]],
  25: [["Thunder", 1, "el_arena_roar", -12]],
  40: [["lightning", 1, "el_lightning_zap", -10], ["start", 1, "whoosh_short", -3], ["gym", 1, "el_bb_dribble", -4]],
  41: [["toss", 1, "viral_ding", -9], ["pointed", 1, "whoosh_short", -3]],
};
const LEO = "#" as const; void LEO;
// ---- the cast stands in the right set (the picture is a placeholder until the real shot list): [set, light, ambience bed, camera, the cast and where they stand]
const at = (pos: V, look: V, mm: number, blur = 0) => ({ move: "at" as const, pos, look, fov: fovMm(mm), blur }) as never;
const who = (w: string, p: V, expr: "neutral" | "smile" | "sad" | "shock" | "determined" | "grin" = "neutral") => ({ who: w, at: p, act: "neutral" as const, facing: "camera" as const, keys: [{ t: 0, expr }] });
const SCENES: Record<Place, { set: string; light: "day" | "night" | "interior" | "interiorCool"; ambience: "elb_court_day" | "elb_court_rain" | "elb_arena" | "elb_tunnel"; camera: ReturnType<typeof at> }> = {
  court: { set: "e4Court", light: "day", ambience: "elb_court_day", camera: at([1.4, 1.8, 4.7], [-0.4, 1.1, -0.4], 24) },
  street: { set: "e4Court", light: "day", ambience: "elb_court_day", camera: at([1.4, 1.8, 4.7], [-0.4, 1.1, -0.4], 24) },
  dawn: { set: "e4Court", light: "night", ambience: "elb_court_rain", camera: at([1.6, 1.4, 3.6], [-0.3, 1.1, -1.4], 28, 2) },
  arena: { set: "e4Arena", light: "interior", ambience: "elb_arena", camera: at([3.6, 1.9, 4.8], [0, 1.2, -3.8], 26) },
  tunnel: { set: "e4Arena", light: "interiorCool", ambience: "elb_tunnel", camera: at([-9.6, 1.2, 2.6], [-12, 1.1, -0.6], 28, 2) },
};
const crew = (p: Place, i: number, speaker: Who) => {
  const out = p === "court" || p === "street" ? [who("leo", [-0.3, 0, 2.2]), who("dex", [1.0, 0, -0.3], "grin"), who("kidA", [-1.4, 0, -0.9]), who("kidB", [1.9, 0, -1.3]), who("kidC", [-2.2, 0, -1.6]), who("kidD", [0.1, 0, -2.4])]
    : p === "dawn" ? [who("leo", [-0.4, 0, -1.6], "determined")]
    : p === "tunnel" ? [who(i >= 26 ? "leoJ" : "leo", [-10.5, 0, 0.8]), who("kd", [-12.0, 0, -0.4])]
    : [who("kd", [0, 0, -3.4]), who("leoJ", [1.5, 0, -2.4]), who("coach", [-5.4, 0, -1.0]), ...(i >= 31 && i <= 37 ? [who("defA", [-1.1, 0, -4.1]), who("defB", [1.1, 0, -4.1]), who("defC", [0, 0, -5.2])] : [])];
  void speaker; return out;
};
const props = (i: number) => i === 14 ? [{ id: "signedBasketball", at: [-11.3, 1.1, 0.3] as V, scale: 1.4, steps: [{ t: 0 }, { word: "lightning" }] }] : [];

export const KD_TALENT_1: Storyboard = {
  id: "kd-talent-1", title: "The Day I Stole Kevin Durant's Talent",
  cast: { leo: "leoHoodie", leoJ: "leoJersey", dex: "dex", kd: "kd", coach: "coach", kidA: "kidA", kidB: "kidB", kidC: "kidC", kidD: "kidD", defA: "defA", defB: "defB", defC: "defC" },
  voice: "leo", voices: { leo: "leo", leoJ: "leo", dex: "e4Rival", kd: "kdKD", coach: "kdCoach" }, narration: "continuous",
  captionStyle: "viral", captionKeys: ["Leo", "Dex", "KD", "Durant", "Thunder", "lightning", "talent", "Swish", "dunked", "buzzer", "pull-up", "viral"],
  // the Eleven Music score (sound/samples/music/kdtalent1_score.json: nine sections written to these timings): dead silence + a sub-bass hit on "Five seconds left." and it swells back on "Swish."
  music: { file: "kdtalent1_score", gain: 0, cuts: [{ at: { word: "Five", n: 2 }, resume: { word: "Swish.", n: 3 }, sub: true }] },
  crowdSfx: true,
  wordSfxMap: {},
  engine: 4, motionBlur: true, controlledBlur: true,
  clarity: {
    premise: "Eleven-year-old Leo, always picked last on his street, wishes he had Kevin Durant's talent, a spark of lightning swaps it into him, and after months of 5 AM practice he hands the ball back and hits the game-winner with his own earned skill.",
    facts: [
      { fact: "who Leo is", said: "I was always the last one picked" },
      { fact: "the rival", said: "Dex, the tallest kid, is always captain" },
      { fact: "his hero", said: "Kevin Durant is my hero" },
      { fact: "the wish", said: "I wish I had your talent" },
      { fact: "the spark", said: "a jolt of lightning shot straight between us" },
      { fact: "the cost", said: "I didn't just get his talent. I took it" },
      { fact: "the stakes", said: "Five seconds left. Down by one" },
      { fact: "the lesson", said: "The magic didn't wake up at 5 AM, kid. You did" },
    ],
  },
  shots: S.map(([w, text, place, extra], i) => {
    const sc = SCENES[place];
    return { set: sc.set, light: sc.light, ambience: sc.ambience, camera: sc.camera, say: { text, who: w, ...extra } as Line, hold: 0.05, props: props(i), actors: crew(place, i, w),
      ...(SFX[i] ? { sfx: SFX[i].map(([word, n, name, gain, delay]) => ({ word, n, name, ...(gain ? { gain } : {}), ...(delay ? { delay } : {}) })) } : {}), ...(extra?.punch ? { kicks: [0.04] } : {}),
      note: `${w}: ${text}` };
  }),
};
