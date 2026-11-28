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
    : p === "tunnel" ? [who(i >= 15 ? "leoJ" : "leo", [-10.5, 0, 0.8]), who("kd", [-12.0, 0, -0.4])]
    : [who("kd", [0, 0, -3.4]), who("leoJ", [1.5, 0, -2.4]), who("coach", [-5.4, 0, -1.0]), ...(i >= 19 && i <= 25 ? [who("defA", [-1.1, 0, -4.1]), who("defB", [1.1, 0, -4.1]), who("defC", [0, 0, -5.2])] : [])];
  void speaker; return out;
};
const props = (i: number) => i === 8 ? [{ id: "signedBasketball", at: [-11.3, 1.1, 0.3] as V, scale: 1.4, steps: [{ t: 0 }, { word: "lightning" }] }] : [];

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
    const sc = SCENES[place];
    return { set: sc.set, light: sc.light, ambience: sc.ambience, camera: sc.camera, say: { text, who: w, ...extra } as Line, hold: 0.05, props: props(i), actors: crew(place, i, w),
      ...(snd ? { sfx: snd.map(([word, n, name, gain, delay]) => ({ word, n, name, ...(gain ? { gain } : {}), ...(delay ? { delay } : {}) })) } : {}), ...(extra?.punch ? { kicks: [0.04] } : {}),
      note: `${w}: ${text}` };
  }),
};
