// IN MY WORLD: THE NUMBER (productions/in-my-world-2/script.md): Engine 4, Option 2 "3D Number Luck World". Everyone has a glowing 3D number over
// their head, the highest number wins every argument; Leo is a six, Dex (the smug cousin) is an eight, Mum is a seven; Leo's useless morning
// headstand turns his 6 into a 9. Real back-and-forth dialogue (Leo, Mum, Dex) with Leo's first-person voice-over only on the three beat hinges.
// AUDIO-FIRST BUILD (the script gate): narration, voices, music, SFX and dual masters are real; the picture is a placeholder storyboard; the
// props (extending e4Number with a hover + flip, and a one-pancake variant of bfPlate) are NOT built until the owner approves the script.
import type { Storyboard, Line } from "../story/types";
import { fovMm, blurMm } from "../engine4/camera";

type V = [number, number, number];
// the cast is staged in a triangle round the table (different depths, so every shot has foreground / background parallax): Leo front-left, Dex mid-right
// beside the fridge, Mum back-left by the counter. Each has a clear metre round them for a headstand; the far-side chair is at x 0.14-0.56.
const LEO = [-1.05, 0, 0.2] as V, MUM = [-1.75, 0, -1.25] as V, DEX = [1.4, 0, -0.45] as V;
const CROWN: Record<string, number> = { leo: 1.31, mum: 1.74, dex: 1.28 };   // crown heights (m): a close-up frames the number floating over the head too
type K = NonNullable<Storyboard["shots"][number]["actors"][number]["keys"]>;
type C = Storyboard["shots"][number]["camera"];
type Mood = "cheer" | "worry" | "smug" | "shock" | "sad" | "think" | "angry";
type Who = "narrator" | "leo" | "mum" | "dex";
/** one shot per line: [speaker, text, [leo, mum, dex] moods, extra Line fields] */
const S: [Who, string, [Mood, Mood, Mood], Partial<Line>?][] = [
  // BEAT 1: the hook (Leo's voice-over)
  ["narrator", "In my world, everyone has a glowing number over their head. The highest number wins every argument.", ["cheer", "cheer", "smug"]],
  ["narrator", "I'm Leo. I'm brilliant at arguing. And I'm a six.", ["worry", "cheer", "smug"]],
  // BEAT 2: one relatable everyday example
  ["leo", "Mum, can I stay up late tonight?", ["cheer", "think", "smug"]],
  ["mum", "Seven beats six. Bedtime.", ["shock", "smug", "smug"]],
  ["leo", "That's not an argument, that's arithmetic!", ["angry", "smug", "smug"]],
  // BEAT 3: high stakes and the smug rival / the unfair system
  ["mum", "Okay, family vote. The highest number picks Saturday, and gets the last pancake.", ["worry", "cheer", "smug"]],
  ["dex", "Eight. Pool. Obviously.", ["worry", "think", "smug"]],
  ["leo", "You've been an eight since Tuesday!", ["angry", "think", "smug"]],
  ["dex", "Numbers don't lie, Leo. They just rank.", ["sad", "think", "smug"], { punch: true }],
  // BEAT 4: the useless secret habit
  ["narrator", "My secret? Every morning I stand on my head. Ten minutes.", ["cheer", "think", "smug"]],
  ["mum", "Leo, why are you upside down by the toaster again?", ["cheer", "think", "think"]],
  ["leo", "Circulation, Mum.", ["cheer", "think", "think"]],
  ["mum", "You're making me dizzy.", ["cheer", "shock", "smug"]],
  // BEAT 5: the public fail (music hard-cuts to silence)
  ["mum", "Final numbers. Dex, eight. Me, seven. Leo?", ["worry", "think", "smug"]],
  ["leo", "...Six.", ["sad", "think", "smug"], { pauses: [] }],
  ["dex", "Pool. And I'll take that pancake.", ["sad", "think", "smug"], { punch: true }],
  ["mum", "Rules are rules, Leo. Eight beats six.", ["sad", "sad", "smug"]],
  // BEAT 6: the loophole (music returns)
  ["narrator", "Highest number wins. That's the rule. It never said which way up.", ["think", "sad", "smug"], { punch: true }],
  ["leo", "Mum. Read my number again.", ["think", "think", "smug"]],
  ["mum", "It's... a nine.", ["cheer", "shock", "shock"], { punch: true }],
  ["dex", "That's cheating!", ["cheer", "shock", "angry"]],
  ["leo", "Show me the rule that says I have to stand up.", ["cheer", "think", "angry"]],
  ["mum", "There isn't one. Nine beats eight.", ["cheer", "cheer", "sad"]],
  ["leo", "Museum. And the pancake.", ["cheer", "cheer", "sad"], { punch: true }],
  // BEAT 7: the rival is humbled (clean cut, no call to action)
  ["dex", "Fine. I'll do it too.", ["cheer", "think", "angry"]],
  ["dex", "Why is my number still an eight?", ["cheer", "think", "shock"], { punch: true }],
  ["mum", "An eight looks the same both ways, sweetheart.", ["think", "cheer", "sad"]],
  ["dex", "Leo... teach me?", ["cheer", "cheer", "worry"]],
  ["leo", "Sorry. It only works on sixes.", ["smug", "cheer", "sad"], { punch: true }],
];
/** the owner's viral SFX pack (assets/sfx/viral): punchlines, reveals, the number flip, the headstand, the comedic hits. [word, nth, sound, gain dB] */
const VIRAL: Record<number, [string, number, string, number?, number?][]> = {
  0: [["glowing", 1, "viral_camera_flash"]],                    // the numbers appear
  1: [["six", 1, "viral_error"]],                               // "...and I'm a six": the sting that is Leo's number all film
  3: [["Seven", 1, "viral_ding"]],                              // Mum's 7 wins
  4: [["arithmetic", 1, "viral_fahhh", 0, 0.6]],                        // the punchline
  5: [["vote", 1, "viral_info_5", -2]],                         // the family vote is announced
  6: [["Obviously", 1, "viral_rizz"]],                          // Dex, smug
  7: [["Tuesday", 1, "viral_punch"]],                           // Leo's outrage
  8: [["rank", 1, "viral_punch_game"]],                         // Dex's line lands
  9: [["stand", 1, "viral_goofy_run"]],                         // the morning headstand
  10: [["again", 1, "viral_metal_pipe_clang", -2]],             // Mum, deadpan
  11: [["Circulation", 1, "viral_ack", -3, 0.55]],              // Leo, upside down and smug
  12: [["dizzy", 1, "viral_huh", -2, 0.3]],                     // Mum, bewildered
  13: [["Leo", 1, "viral_among_us_reveal", -1, 0.25]],          // the roll-call: whose number is it?
  14: [["Six", 1, "viral_error"]],                              // Leo, small (the fail)
  15: [["take", 1, "viral_punch"]],                             // Dex takes the pancake (the music has just cut)
  16: [["six", 1, "viral_undertaker_bell"]],                    // the lowest point, in silence
  17: [["rule", 1, "viral_keyboard_typing"], ["up", 1, "viral_dun_dun_dun", -2, 0.1]],   // Leo working it out, and the realisation
  18: [["again", 1, "viral_camera_flash"]],                     // Leo goes upside down: the flip
  19: [["nine", 1, "viral_anime_wow"]],                         // the reveal: the 6 is a 9
  20: [["cheating", 1, "viral_tuco_get_out", 0, 0.45]],                  // Dex, outraged
  22: [["Nine", 1, "viral_ding"]],                              // the win
  23: [["Museum", 1, "viral_bing_bing_bing", -2]],
  24: [["too", 1, "viral_goofy_run"]],                          // Dex dives into a headstand
  25: [["eight", 1, "viral_fahhh", 0, 0.3]],                            // and nothing happens
  28: [["sixes", 1, "viral_ding"]],                             // the button
};
// ---- camera set-ups (the real shot list). Every Engine 4 shot is hand-held (SetWorld), so no frame is ever a dead tripod shot.
const P: Record<string, V> = { leo: LEO, mum: MUM, dex: DEX };
const rad = Math.PI / 180;
type Cam = (o?: { creep?: number; roll?: number }) => C;
const mk = (pos: V, look: V, mm: number, o: { creep?: number; roll?: number } = {}): C => ({ move: "at", pos, look, fov: fovMm(mm), blur: blurMm(mm) + (mm >= 50 ? 2 : 0), ...o }) as unknown as C;
/** a framing of one actor from `deg` degrees off straight-on, `d` metres away, camera at height `y` (default level), on a `mm` lens: the eyes sit at 42 % of the
 *  frame height from the top (upper-middle third), the whole face and a small floating number above it are in frame */
const view = (who: string, deg: number, d: number, mm: number, y?: number, o: { creep?: number; roll?: number } = {}): C => {
  const p = P[who], H = (d * 24) / mm, centre = CROWN[who] - 0.08 - 0.08 * H;   // eyes at about 44 % from the top
  return mk([p[0] + Math.sin(deg * rad) * d, y ?? centre, p[2] + Math.cos(deg * rad) * d], [p[0], centre, p[2]], mm, o);
};
// medium close-ups: 50 mm (head and chest) and 85 mm (face), levels the eyes
const CU = (who: string, deg = 0, o: { creep?: number; roll?: number } = {}) => (): C => view(who, deg, { leo: 2.9, mum: 2.9, dex: 2.9 }[who]!, 50, undefined, o);
const CU85 = (who: string, deg = 0, o: { creep?: number; roll?: number } = {}) => (): C => view(who, deg, { leo: 3.15, mum: 4.5, dex: 3.7 }[who]!, { leo: 60, mum: 85, dex: 70 }[who]!, undefined, o);
// a low-angle power shot looks UP at the actor from knee height; a high-angle weak shot looks DOWN from above the head (both within 35 degrees)
const LOW = (who: string, deg = 0, o: { creep?: number; roll?: number } = {}) => (): C => view(who, deg, 2.3, 35, 0.25, o);
const HIGH = (who: string, deg = 0, o: { creep?: number; roll?: number } = {}) => (): C => view(who, deg, 2.3, 35, CROWN[who] + 0.85, o);
/** over the shoulder: the camera stands behind `over` (off to one side) and looks at `at`; `over` fills the edge of the frame, out of focus */
const OTS = (over: string, at: string, cam: V, mm = 35): Cam => (o = {}) => { const t = P[at]; return mk(cam, [t[0], CROWN[at] - 0.28, t[2]], mm, { creep: 0.05, ...o }); };
// the three-shot wides: a diagonal 3-quarter view across the table (the spread is 3.2 m in a 4.3 m room, so an ultra-wide 11-12 mm lens from the front corners)
const W = (): C => ({ move: "truck", on: ["leo", "mum", "dex"], dist: 0.4, size: "full", from: -20, height: 1.45, fov: fovMm(12), cInf: 0 });
const W2 = (): C => ({ move: "truck", on: ["leo", "mum", "dex"], dist: 0.3, size: "full", from: 30, height: 1.5, fov: fovMm(10), cInf: 1 });
// an upside-down actor: a low camera beside the table (the head is on the floor), 26 mm; the camera is below the knees so the body towers above the lens
const LEO_LOW = (): C => mk([-0.7, 0.4, 2.3], [-0.7, 0.55, 0.2], 24, { creep: 0.1 });
const DEX_LOW = (): C => mk([1.7, 0.4, 1.9], [1.7, 0.55, -0.45], 24, { creep: 0.1 });
// inserts: a macro of the last pancake (the plate on the table), a floor-level shot of Leo's hands planting
const PLATE_AT = [0.2, 0.78, -0.4] as V;
const PANCAKE = (): C => mk([0.18, 1.12, 0.3], [0.2, 0.8, -0.4], 35, { creep: 0.12 });
const HANDS = (): C => mk([-0.7, 0.22, 2.3], [-0.7, 0.38, 0.2], 26, { creep: 0.12 });
// Leo and Mum across the kitchen; Leo and Dex across the table
const OTS_LM = OTS("leo", "mum", [-0.15, 1.2, 1.25], 30), OTS_LD = OTS("leo", "dex", [-1.8, 1.2, 0.75], 45);
type Cut = { word?: string; n?: number; t?: number; cam: () => C; swoop?: boolean };
/** per shot: the opening camera, the cuts on words (hard cuts, or a quick snap-zoom `swoop` on the punchline), and the numbers' size class (tight = close-ups) */
type Plan = { cam: () => C; cuts?: Cut[]; tight: boolean };
const T = (cam: () => C, cuts: Cut[] = []): Plan => ({ cam, cuts, tight: true }), Wd = (cam: () => C, cuts: Cut[] = []): Plan => ({ cam, cuts, tight: false });
const PLAN: Plan[] = [
  /* 0 hook */ Wd(W, [{ word: "highest", cam: W2 }]),
  /* 1 I'm a six */ T(HIGH("leo", 12), [{ word: "six", cam: HIGH("leo", -8, { creep: 0.2 }), swoop: true }]),
  // BEAT 2 (night): a tight over-the-shoulder, then the verdict from a low angle
  /* 2 stay up late */ T(CU("leo", -10, { creep: 0.12 })),
  /* 3 seven beats six */ T(OTS_LM, [{ word: "Bedtime", cam: LOW("mum", 8, { creep: 0.15 }), swoop: true }]),
  /* 4 arithmetic */ T(HIGH("leo", -10), [{ word: "arithmetic", cam: CU85("leo", 6, { creep: 0.1 }), swoop: true }]),
  // BEAT 3: the family vote (morning) and the last pancake
  /* 5 family vote */ Wd(W2, [{ word: "last", cam: PANCAKE }]),
  /* 6 eight, pool */ T(OTS_LD, [{ word: "Pool", cam: LOW("dex", -12, { creep: 0.12 }), swoop: true }]),
  /* 7 since Tuesday */ T(HIGH("leo", 8, { creep: 0.12 })),
  /* 8 they just rank */ T(LOW("dex", 14, { creep: 0.14 })),
  // BEAT 4: the secret habit (Leo's number is hidden: the flip to a nine is the Beat 6 reveal)
  /* 9 stand on my head */ Wd(W2, [{ word: "stand", cam: LEO_LOW }]),
  /* 10 why upside down */ Wd(W),
  /* 11 circulation */ Wd(LEO_LOW),
  /* 12 dizzy */ T(CU("mum", 8, { creep: 0.1 })),
  // BEAT 5: tension push-ins
  /* 13 final numbers */ T(OTS_LM, [{ word: "Dex", cam: LOW("dex", 12, { creep: 0.18 }) }, { word: "Leo", cam: HIGH("leo", 0, { creep: 0.2 }), swoop: true }]),
  /* 14 ...Six */ T(HIGH("leo", 6, { creep: 0.22 })),
  /* 15 take that pancake */ T(LOW("dex", 8, { creep: 0.15 }), [{ word: "take", cam: PANCAKE }]),
  /* 16 rules are rules */ T(CU("mum", 10, { creep: 0.15 })),
  // BEAT 6: the loophole
  /* 17 never said which way up */ T(CU85("leo", 0, { creep: 0.2 })),
  /* 18 read my number again */ Wd(HANDS, [{ t: 0.95, cam: LEO_LOW }]),
  /* 19 it's a nine */ Wd(W2, [{ word: "nine", cam: LEO_LOW, swoop: true }]),
  /* 20 cheating */ T(LOW("dex", 0, { roll: 6, creep: 0.12 }), [{ word: "cheating", cam: CU85("dex", 0, { roll: 7, creep: 0.1 }), swoop: true }]),
  /* 21 show me the rule */ Wd(LEO_LOW),
  /* 22 there isn't one */ T(CU("mum", 10)),
  /* 23 museum */ T(LOW("leo", -8), [{ word: "pancake", cam: PANCAKE }]),
  // BEAT 7: the rival is humbled
  /* 24 I'll do it too */ Wd(W2),
  /* 25 why still an eight */ Wd(DEX_LOW),
  /* 26 eight looks the same */ Wd(W),
  /* 27 teach me */ Wd(DEX_LOW),
  /* 28 only works on sixes */ T(CU("leo", -8), [{ word: "sixes", cam: LOW("leo", 0, { creep: 0.1 }), swoop: true }]),
];
const CAMSEL: (() => C)[] = PLAN.map((q) => q.cam);
/** a shot's camera beats: hard cuts on words (or on a second), a swoop on the punchline snap-zooms */
const beats = (i: number) => {
  const cuts = PLAN[i].cuts ?? [];
  if (!cuts.length) return {};
  return { cams: [{ t: 0, ...CAMSEL[i](), blockOk: true }, ...cuts.map((c) => ({ ...(c.word ? { word: c.word, n: c.n ?? 1 } : { t: c.t! }), ...c.cam(), ...(c.swoop ? { swoop: 0.3 } : { cut: true }), blockOk: true }))] } as { cams: NonNullable<Storyboard["shots"][number]["cams"]> };
};
// ---- the headstands: [flip at the start of the shot, flip at the end] (Leo's morning habit, then the reveal; Dex copies at the end)
const LEO_FLIP: Record<number, [number, number]> = { 9: [0, 1], 10: [1, 1], 11: [1, 1], 12: [1, 1], 13: [1, 0], 18: [0, 1], 19: [1, 1], 20: [1, 1], 21: [1, 1], 22: [1, 1], 23: [1, 0] };
const DEX_FLIP: Record<number, [number, number]> = { 24: [0, 1], 25: [1, 1], 26: [1, 1], 27: [1, 1], 28: [1, 1] };
// ---- the acting: authored key poses for every line (not mood presets). k(t, face, extras): a key pose at t seconds into the shot (0.32 s move)
type E = NonNullable<K[number]["expr"]>;
const k = (t: number, expr: E, o: Partial<K[number]> = {}): K[number] => ({ t, d: 0.32, expr, ...o });
type Acts = { l: K; m: K; d: K };
const ACT: Acts[] = [
  /* 0 hook */ { l: [k(0, "neutral"), k(0.6, "proud", { tilt: 3, gesture: "hips", brow: [-1, 0, 3] })], m: [k(0, "neutral"), k(1, "proud", { tilt: 3 })], d: [k(0, "proud", { gesture: "crossArms", tilt: 3, brow: [-1, 0, 4] })] },
  /* 1 I'm a six */ { l: [k(0, "proud", { gesture: "hips", tilt: 3 }), k(1.7, "sad", { slump: 0.7, look: [0, -1.1], tilt: -3, gesture: "hang" })], m: [k(0, "neutral")], d: [k(0, "proud", { gesture: "crossArms", tilt: 3 }), k(1.9, "laugh", { tilt: 4 })] },
  /* 2 stay up late */ { l: [k(0, "smile", { gesture: "clap", brow: [-2, -2, 0] }), k(0.6, "nervous", { tilt: -4, gesture: "clap" })], m: [k(0, "neutral"), k(0.5, "thinking", { gesture: "crossArms", tilt: 4 })], d: [k(0, "proud", { gesture: "crossArms" }), k(0.6, "suspicious", { look: [-1.2, 0] })] },
  /* 3 seven beats six */ { l: [k(0, "nervous"), k(0.6, "sad", { slump: 0.6, tilt: -5 })], m: [k(0, "proud", { tilt: 4, brow: [1, 2, 3], gesture: "hips" })], d: [k(0, "proud", { gesture: "crossArms" }), k(0.5, "laugh")] },
  /* 4 arithmetic */ { l: [k(0, "angry", { tilt: -5, gesture: "fists", brow: [3, 3, 0], squash: 1.3 }), k(0.7, "angry", { tilt: -2 })], m: [k(0, "neutral"), k(0.4, "embarrassed", { gesture: "shrug", tilt: 3 })], d: [k(0, "laugh", { tilt: 4 })] },
  /* 5 family vote */ { l: [k(0, "suspicious", { look: [1.2, 0] })], m: [k(0, "smile", { gesture: "present", tilt: 4, brow: [-1, 0, 2] })], d: [k(0, "proud", { tilt: 4, brow: [-1, 0, 4], gesture: "hips" }), k(1.5, "grin")] },
  /* 6 eight, pool */ { l: [k(0, "angry", { look: [1.2, 0], tilt: -4, gesture: "fists" }), k(1.5, "angry")], m: [k(0, "neutral"), k(1, "thinking", { gesture: "crossArms" })], d: [k(0, "proud", { tilt: 5, brow: [-1, 0, 4], gesture: "hips" }), k(0.8, "grin")] },
  /* 7 since Tuesday */ { l: [k(0, "angry", { tilt: -6, gesture: "fists", brow: [3, 3, 0], squash: 1.2 }), k(0.8, "sad", { slump: 0.4 })], m: [k(0, "nervous", { tilt: -3 })], d: [k(0, "grin", { tilt: 4, gesture: "crossArms" })] },
  /* 8 they just rank */ { l: [k(0, "sad", { slump: 0.7, look: [0, 1] })], m: [k(0, "thinking", { gesture: "crossArms", tilt: 3 })], d: [k(0, "proud", { tilt: 5, headTilt: 6, brow: [-1, 0, 4], gesture: "hips" }), k(1, "laugh")] },
  /* 9 stand on my head */ { l: [k(0, "smile", { gesture: "hips" }), k(0.5, "smile")], m: [k(0, "neutral"), k(1, "confused", { tilt: 3 })], d: [k(0, "laugh", { tilt: 4 })] },
  /* 10 why upside down */ { l: [k(0, "smile")], m: [k(0, "confused", { tilt: 4, headTilt: -8, brow: [0, 2, 4], gesture: "chin" })], d: [k(0, "laugh")] },
  /* 11 circulation */ { l: [k(0, "proud")], m: [k(0, "confused", { gesture: "chin", tilt: 3 })], d: [k(0, "suspicious", { tilt: 3, gesture: "crossArms" })] },
  /* 12 dizzy */ { l: [k(0, "smile")], m: [k(0, "dazed", { headTilt: 8, tilt: 4 })], d: [k(0, "grin")] },
  /* 13 final numbers */ { l: [k(0, "smile"), k(1, "nervous")], m: [k(0, "stern", { tilt: -2, gesture: "hips" })], d: [k(0, "proud", { gesture: "crossArms", tilt: 3 })] },
  /* 14 ...Six */ { l: [k(0, "sad", { slump: 0.9, look: [0, 1], gesture: "hang" })], m: [k(0, "sad", { tilt: -3 })], d: [k(0, "grin", { tilt: 4, gesture: "hips" })] },
  /* 15 take that pancake */ { l: [k(0, "shock", { tilt: -6 }), k(0.6, "sad", { slump: 0.8 })], m: [k(0, "nervous", { tilt: -4 })], d: [k(0, "grin", { tilt: 6, brow: [-1, 0, 4], gesture: "hips", squash: 1.2 })] },
  /* 16 rules are rules */ { l: [k(0, "sad", { slump: 0.9 })], m: [k(0, "sad", { tilt: -3, gesture: "hips" })], d: [k(0, "grin", { tilt: 4, gesture: "crossArms" })] },
  /* 17 never said which way up */ { l: [k(0, "sad", { slump: 0.7, look: [0, -1] }), k(1.4, "thinking", { brow: [0, 3, 3], look: [0, -1.1], slump: 0.2 }), k(2.6, "smile", { brow: [-1, -1, 3], slump: 0 })], m: [k(0, "sad")], d: [k(0, "proud", { gesture: "crossArms" })] },
  /* 18 read my number again */ { l: [k(0, "smile", { gesture: "hips" })], m: [k(0, "confused", { tilt: 3, brow: [0, 2, 3] })], d: [k(0, "suspicious"), k(0.6, "shock")] },
  /* 19 it's a nine */ { l: [k(0, "proud")], m: [k(0, "shock", { tilt: -6, brow: [-3, -1, 3], squash: 1.3 })], d: [k(0, "shock")] },
  /* 20 cheating */ { l: [k(0, "proud")], m: [k(0, "laugh", { tilt: 4 })], d: [k(0, "angry", { tilt: -6, gesture: "fists", brow: [3, 3, 0], squash: 1.3 })] },
  /* 21 show me the rule */ { l: [k(0, "proud", { brow: [-1, 0, 4] })], m: [k(0, "thinking", { gesture: "chin", tilt: 3 })], d: [k(0, "angry", { gesture: "crossArms", tilt: -3 }), k(1, "sad", { slump: 0.4 })] },
  /* 22 there isn't one */ { l: [k(0, "smile")], m: [k(0, "embarrassed", { gesture: "hips", tilt: 4, headTilt: 6 }), k(1.2, "smile")], d: [k(0, "sad", { slump: 0.6 })] },
  /* 23 museum */ { l: [k(0, "smile"), k(0.4, "excited", { gesture: "cheer", tilt: 4, squash: 1.3 })], m: [k(0, "smile"), k(0.6, "excited", { gesture: "clap" })], d: [k(0, "sad", { slump: 0.8, look: [0, 1] })] },
  /* 24 I'll do it too */ { l: [k(0, "proud", { gesture: "crossArms" })], m: [k(0, "thinking", { tilt: 3 })], d: [k(0, "determined", { brow: [3, 1, 0] }), k(0.4, "determined")] },
  /* 25 why still an eight */ { l: [k(0, "laugh", { tilt: 5 })], m: [k(0, "laugh", { tilt: 4 })], d: [k(0, "shock", { brow: [-3, -1, 3], squash: 1.2 })] },
  /* 26 eight looks the same */ { l: [k(0, "proud", { tilt: 3, gesture: "hips" })], m: [k(0, "smile", { tilt: 4 })], d: [k(0, "sad")] },
  /* 27 teach me */ { l: [k(0, "proud", { gesture: "crossArms", tilt: 3 })], m: [k(0, "smile")], d: [k(0, "nervous", { brow: [-2, -3, 0] })] },
  /* 28 only works on sixes */ { l: [k(0, "proud", { tilt: 3, gesture: "hips" }), k(0.9, "wink", { tilt: 4 })], m: [k(0, "laugh")], d: [k(0, "sad")] },
];
/** a headstand: flip a at the start of the shot and b after the first move (planted hands: "spread"); a === b === 1 stays upside down */
const withFlip = (ks: K, fl?: [number, number]): K => {
  if (!fl) return ks;
  const [a, b] = fl, out = ks.map((q, j) => ({ ...q, flip: j === 0 ? a : b, ...((j === 0 ? a : b) ? { gesture: "spread" as const } : {}), ...(j > 0 && a !== b ? { d: 0.5 } : {}) }));
  if (a !== b && out.length === 1) out.push({ ...out[0], t: 0.35, d: 0.5, flip: b, ...(b ? { gesture: "spread" as const } : {}) });
  return out;
};
// ---- the props: three glowing 3D numbers over the heads (6 Leo, 7 Mum, 8 Dex), and the last pancake
const num = (who: string, at: V, text: string, side: -1 | 1, steps: ({ t: number } | { word: string })[], tight: boolean) => ({ id: "e4Number", variant: text, at, scale: tight ? 0.45 : 0.8, hover: { who, side, lift: tight ? 0.28 : 0.42 }, steps });
// Leo's number is hidden through Beat 4 (the headstand habit, shots 9-12) so the 6 never flips to a 9 before the Beat 6 reveal; it pops back on "Leo?" in shot 13
const numbers = (i: number) => {
  const tight = PLAN[i].tight, st = i === 0 ? [{ word: "glowing" }] : [{ t: -1 }];
  const leo = i >= 9 && i <= 12 ? [{ t: 99 }] : i === 13 ? [{ word: "Leo" }] : st;
  return [num("leo", LEO, "6", 1, leo, tight), num("mum", MUM, "7", -1, st, tight), num("dex", DEX, "8", 1, st, tight)];
};
const hasInsert = (i: number) => (PLAN[i].cuts ?? []).some((c) => c.cam === PANCAKE);
const plate = (i: number) => (i >= 5 && i <= 14 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ t: 99 }] }]
  : i === 15 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ word: "take" }] }]
  : i >= 16 && i <= 22 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ t: -1 }] }]
  : i >= 23 ? [{ id: "bfPlate", variant: "one", at: PLATE_AT, steps: [{ t: 99 }] }] : []);
const base = { set: "e4Kitchen", light: "interior" as const, ambience: "elb_kitchen_day" as const };

export const IN_MY_WORLD_2: Storyboard = {
  id: "in-my-world-2", title: "In my world, the highest number wins every argument",
  cast: { leo: "leoHoodie", mum: "mum", dex: "dex" },
  voice: "leo", voices: { leo: "leo", mum: "e4Mum", dex: "e4Rival" }, narration: "continuous",
  captionStyle: "viral", captionKeys: ["Leo", "Mum", "Dex", "six", "eight", "nine", "pancake", "pool", "museum", "number"],
  // Morning Mood (public domain) for the cheerful beats; dead silence + a sub-bass hit on Dex's second "Pool" (the climax of the fail); it returns on "nine"
  music: { file: "morning-mood", gain: 0, cuts: [{ at: { word: "Pool.", n: 2 }, resume: { word: "nine.", n: 1 }, sub: true }] },
  // this story's own word sounds: numbers are not clock times here; the owner's viral pack (VIRAL above) carries the punchlines and reveals
  wordSfxMap: {
    six: null, sixes: null, seven: null, eight: null, nine: null,
    bedtime: { sfx: "el_lights_off", gain_db: -3 }, pancake: { sfx: "el_plate_down" }, pool: { sfx: "el_water_rush", gain_db: -9 }, museum: null,
    arithmetic: null, rules: { sfx: "el_stamp_thud", gain_db: -4 }, cheating: null, obviously: null,
    glowing: null, highest: { sfx: "whoosh_soft", lead: 0.1 }, saturday: { sfx: "whoosh_soft", lead: 0.1, gain_db: -3 }, upside: { sfx: "whoosh_soft", lead: 0.1 },
    toaster: { sfx: "lever_clunk", gain_db: -3 }, dizzy: null, stand: null, circulation: null, teach: { sfx: "shimmer_chime", gain_db: -7 },
  },
  engine: 4, motionBlur: true, controlledBlur: true,
  clarity: {
    premise: "In Leo's world everyone has a glowing number over their head and the highest number wins every argument, so when his cousin Dex, an eight, takes the last pancake and picks Saturday, Leo stands on his head, turns his six into a nine, and wins.",
    facts: [
      { fact: "the rule", said: "The highest number wins every argument" },
      { fact: "his weakness", said: "And I'm a six" },
      { fact: "the example", said: "Seven beats six. Bedtime" },
      { fact: "the stakes", said: "The highest number picks Saturday, and gets the last pancake" },
      { fact: "the secret habit", said: "Every morning I stand on my head" },
      { fact: "the loophole", said: "It never said which way up" },
      { fact: "the humbling", said: "An eight looks the same both ways" },
    ],
  },
  shots: S.map(([who, text, , extra], i) => {
    const lf = LEO_FLIP[i], df = DEX_FLIP[i];
    return {
      ...base, ...(i >= 2 && i <= 4 ? { light: "night" as const } : {}), camera: CAMSEL[i](), say: { text, who, ...extra } as Line, hold: 0.05, ...beats(i), ...(extra?.punch ? { kicks: [0.04] } : {}),
      ...(VIRAL[i] ? { sfx: VIRAL[i].map(([word, n, name, gain, delay]) => ({ word, n, name, ...(gain ? { gain } : {}), ...(delay ? { delay } : {}) })) } : {}),
      props: [...numbers(i), ...(["truck", "orbit"].includes(CAMSEL[i]().move) || hasInsert(i) ? plate(i) : [])],   // the plate only where a camera can see the table
      actors: [{ who: "leo", at: LEO, act: "neutral" as const, facing: "camera" as const, keys: withFlip(ACT[i].l, lf) }, { who: "mum", at: MUM, act: "neutral" as const, facing: "camera" as const, keys: ACT[i].m }, { who: "dex", at: DEX, act: "neutral" as const, facing: "camera" as const, keys: withFlip(ACT[i].d, df) }],
      note: `${who}: ${text}`,
    };
  }),
};
