// Engine 4 sets (opt-in: only a storyboard with `engine: 4` uses them). Phase 1: Maya's kitchen, a unified PBR room.
// Source: blender/sets/kitchen.py (Poly Haven CC0 textures, baked indirect light) -> public/e4/kitchen/. See engine4/kitchen.ts.
import type { Theme } from "..";
import type { SetDef } from "../../sets/types";
import type { Look } from "../../characters/figure";
import { buildE4Kitchen, SPOTS, VIEWS } from "../../engine4/kitchen";
import { numberRig } from "../../engine4/number";
import { buildE4Court, SPOTS as COURT_SPOTS, VIEWS as COURT_VIEWS } from "../../engine4/court";
import { buildE4Arena, SPOTS as ARENA_SPOTS, VIEWS as ARENA_VIEWS } from "../../engine4/arena";
import { signedBallRig, viralPhoneRig, tvNewsRig, scoreboardRig } from "../../engine4/heroProps";
import type { ItemEntry } from "../../characters/items";

const rect = (cx: number, cy: number, w: number, h: number): [number, number][] => [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]];
/** hand-held items for Episode 2: Leo's beat-up basketball and the coach's clipboard */
const HOOPS_ITEMS: Record<string, ItemEntry> = {
  basketball: { name: "Basketball", desc: "a beat-up orange basketball with black seams", themes: ["sport"], tags: ["basketball", "ball", "sport"],
    draw: (p, x, y, u) => { const r = 13 * u, cy = y - 11 * u; p.ell(x, cy, r, r, "#d8782a", 3 * u); p.stroke([[x, cy - r], [x, cy + r]], 1.8 * u); p.stroke([[x - r, cy], [x + r, cy]], 1.8 * u);
      p.stroke([[x - r * 0.7, cy - r * 0.7], [x - r * 0.25, cy], [x - r * 0.7, cy + r * 0.7]], 1.8 * u); p.stroke([[x + r * 0.7, cy - r * 0.7], [x + r * 0.25, cy], [x + r * 0.7, cy + r * 0.7]], 1.8 * u); } },
  clipboard: { name: "Clipboard", desc: "a coach's clipboard with a play sheet", themes: ["sport"], tags: ["coach", "basketball", "plan"],
    draw: (p, x, y, u, s) => { p.poly(rect(x + 3 * u * s, y - 14 * u, 24 * u, 32 * u), "#8a5a3c", 3 * u); p.poly(rect(x + 3 * u * s, y - 13 * u, 19 * u, 25 * u), "#f4efe2", 0);
      p.stroke([[x + (3 - 6) * u * s, y - 20 * u], [x + (3 + 6) * u * s, y - 12 * u]], 1.6 * u, "#c8252d"); p.ell(x + (3 + 6) * u * s, y - 12 * u, 2 * u, 2 * u, "#c8252d", 0); p.poly(rect(x + 3 * u * s, y - 28 * u, 9 * u, 5 * u), "#9aa3ab", 2 * u); } },
};

/** Dex, Leo's smug cousin (In my world, the highest number wins every argument): Noah's size and build, but fair skin, spiky ginger hair, a teal tee and a permanently raised brow */
const DEX: Look = { name: "Dex", build: "kid", skin: "#f5c9a0", seed: 811, hair: { style: "spiky", color: "#c9672a" }, brow: { quirk: 3 },
  top: { style: "tee", color: "#2a9d8f", accent: "#f2efe6" }, legs: "#2f3448", shoes: "#f4f1ea" };

/** Leo as the channel mascot: the same boy (curls, skin, size) in his signature red hoodie (front pouch, drawstrings) and jeans, instead of the school blazer and red tie */
const LEO_HOODIE: Look = { name: "Leo", build: "kid", skin: "#c99067", seed: 104, hair: { style: "curly", color: "#2a201a" },
  top: { style: "hoodie", color: "#d8302a", accent: "#f2efe6" }, legs: "#3f5f9e", shoes: "#f4f1ea" };

/** Leo in the Thunder jersey (arena scenes): the same boy, sleeveless blue jersey with a number, blue shorts */
const LEO_JERSEY: Look = { name: "Leo (Thunder jersey)", build: "kid", skin: "#c99067", seed: 104, hair: { style: "curly", color: "#2a201a" },
  top: { style: "tee", color: "#0b5ec7", accent: "#ef3b24" }, jersey: { number: "11", color: "#ffffff", team: "thunder" }, bare: { arms: true }, legs: "#1d428a", shorts: "#1d428a", shoes: "#f4f1ea" };
/** Kevin Durant: tall and lanky, short hair and a goatee, the blue and white #35 Thunder jersey */
const KD: Look = { name: "Kevin Durant", build: "lanky", skin: "#8d5a38", seed: 35, hair: { style: "buzz", color: "#120c0a" }, beard: { style: "goatee", color: "#0c0807" }, moustache: { style: "thin", color: "#0c0807" },
  top: { style: "tee", color: "#0b5ec7", accent: "#ef3b24" }, jersey: { number: "35", color: "#ffffff", team: "thunder" }, bare: { arms: true }, legs: "#1d428a", shorts: "#1d428a", shoes: "#f4f1ea" };
/** the Thunder coach: stout, bald with a walrus moustache, a white polo, a whistle (the whistle face) and a clipboard */
const COACH: Look = { name: "Coach", build: "stout", skin: "#d9a066", seed: 77, hair: { style: "bald", color: "#2a2a2a" }, moustache: { style: "walrus", color: "#3a3028" },
  top: { style: "shirt", color: "#f2efe6", accent: "#1d428a" }, legs: "#1d2433", shoes: "#2a2a2a" };
/** street kids (the pick-up game) and the opposing team's defenders: simple recoloured kids */
const kid = (name: string, seed: number, skin: string, hair: Look["hair"], top: string, legs: string): Look => ({ name, build: "kid", skin, seed, hair, top: { style: "tee", color: top, accent: "#f2efe6" }, legs, shoes: "#f4f1ea" });
const defender = (name: string, seed: number, skin: string, hair: Look["hair"]): Look => ({ name, build: "tall", skin, seed, hair, top: { style: "tee", color: "#c8252d", accent: "#ffffff" }, jersey: { number: String(seed % 90 + 10), color: "#ffffff" }, bare: { arms: true }, legs: "#c8252d", shorts: "#c8252d", shoes: "#1d2433" });

const e4Kitchen: SetDef = { id: "e4Kitchen", title: "Maya's kitchen (Engine 4): a PBR room, baked bounce light, a warm pendant lamp over the table and a cool dusk window", lights: ["interior", "night"], build: () => buildE4Kitchen() };

const e4Court: SetDef = { id: "e4Court", title: "Street court (Engine 4): a fenced asphalt half-court with one hoop, houses and trees behind; light day = bright afternoon, night = 5 AM dawn in the rain", lights: ["day", "night"], build: () => buildE4Court() };
const e4Arena: SetDef = { id: "e4Arena", title: "Thunder arena (Engine 4): a hardwood court with a centre logo, a hoop, LED boards and a crowd; and the tunnel and bench off it; light interior = game night, interiorCool = the tunnel", lights: ["interior", "interiorCool"], build: () => buildE4Arena() };
const heroProp = (name: string, desc: string, tags: string[], rig: (a: import("../../props/kit").At) => import("../../props/registry").PropRig, steps: string[], radius: number, height: number) =>
  ({ name, desc, category: "theme" as const, themes: ["engine4", "sport"], tags, radius, height, build: () => undefined, rig: (a: import("../../props/kit").At) => rig(a), steps, stepCount: () => steps.length });

export const E4_THEME: Theme = {
  id: "e4", name: "Engine 4 sets", desc: "Unified PBR sets built in Blender with baked lightmaps and live lights (opt-in, engine: 4)", tags: ["engine4", "pbr", "blender"],
  items: HOOPS_ITEMS,
  characters: { dex: DEX, leoHoodie: LEO_HOODIE, leoJersey: LEO_JERSEY, kd: KD, coach: COACH,
    kidA: kid("Kid A", 301, "#e8b98a", { style: "buzz", color: "#2a201a" }, "#e0a526", "#3a4a6a"), kidB: kid("Kid B", 302, "#8a5a3c", { style: "afro", color: "#120c0a" }, "#2a9d8f", "#2f3448"),
    kidC: kid("Kid C", 303, "#d9a066", { style: "tuft", color: "#6a3a1e" }, "#8e44ad", "#3f5f9e"), kidD: kid("Kid D", 304, "#f5c9a0", { style: "short", color: "#e0b040" }, "#c8252d", "#2f3448"),
    defA: defender("Defender A", 411, "#8a5a3c", { style: "buzz", color: "#120c0a" }), defB: defender("Defender B", 422, "#e8b98a", { style: "short", color: "#3a2a1e" }), defC: defender("Defender C", 433, "#c99067", { style: "afro", color: "#120c0a" }) },
  characterMeta: {
    leoJersey: { name: "Leo (Thunder jersey)", desc: "Leo in the blue sleeveless Oklahoma City Thunder jersey (number 11) and shorts, for the arena scenes", personality: "Leo, the underdog who earns it", themes: ["sport", "arena"], tags: ["child", "boy", "basketball", "jersey"] },
    kd: { name: "Kevin Durant", desc: "very tall and lanky, short black hair and a goatee, the blue and white number 35 Thunder jersey and shorts", personality: "KD: calm, deep, a cool mentor", themes: ["sport", "arena"], tags: ["basketball", "tall", "mentor", "jersey"] },
    coach: { name: "Coach", desc: "a stout bald coach with a walrus moustache and a white polo; a whistle (the whistle face) and a clipboard", personality: "a gruff, urgent Thunder coach", themes: ["sport", "arena"], tags: ["basketball", "coach", "whistle", "clipboard"] },
    kidA: { name: "Street kid A", desc: "a kid with a buzz cut and a mustard tee, for the pick-up game", personality: "background player", themes: ["sport", "street"], tags: ["child", "basketball", "extra"] },
    kidB: { name: "Street kid B", desc: "a kid with an afro and a teal tee, for the pick-up game", personality: "background player", themes: ["sport", "street"], tags: ["child", "basketball", "extra"] },
    kidC: { name: "Street kid C", desc: "a kid with a tuft of brown hair and a purple tee, for the pick-up game", personality: "background player", themes: ["sport", "street"], tags: ["child", "basketball", "extra"] },
    kidD: { name: "Street kid D", desc: "a kid with short blond hair and a red tee, for the pick-up game", personality: "background player", themes: ["sport", "street"], tags: ["child", "basketball", "extra"] },
    defA: { name: "Defender A", desc: "a tall opposing player in a red sleeveless jersey with a number, buzz cut", personality: "swarming defender", themes: ["sport", "arena"], tags: ["basketball", "defender", "jersey"] },
    defB: { name: "Defender B", desc: "a tall opposing player in a red sleeveless jersey with a number, short brown hair", personality: "swarming defender", themes: ["sport", "arena"], tags: ["basketball", "defender", "jersey"] },
    defC: { name: "Defender C", desc: "a tall opposing player in a red sleeveless jersey with a number, afro", personality: "swarming defender", themes: ["sport", "arena"], tags: ["basketball", "defender", "jersey"] },
 leoHoodie: { name: "Leo (red hoodie)", desc: "a small boy with dark curls in his signature red hoodie, jeans and white trainers", personality: "Leo, the channel mascot: brilliant at arguing", themes: ["home", "everyday"], tags: ["child", "boy", "mascot"] }, dex: { name: "Dex", desc: "11; spiky ginger hair, a teal tee, a permanently raised brow", personality: "Leo's smug cousin: always an eight, delighted by other people's trouble", themes: ["home", "everyday"], tags: ["child", "boy", "rival", "smug"] } },
  props: {
    signedBasketball: heroProp("Signed basketball", "Leo's beat-up basketball with KD's black-marker signature; step 1 pops it in, step 2 fires blue and gold lightning (the spark between Leo and KD); 0.3 m across x scale", ["basketball", "signed", "lightning"], signedBallRig, ["pops in", "sparks"], 0.2, 0.3),
    viralPhone: heroProp("Viral phone", "a smartphone, screen to camera: the viral clip '11-YEAR-OLD DROPS 40 AT TRYOUTS' and '1.4M VIEWS'; step 1 pops it in; 0.43 m tall x scale", ["phone", "viral", "news"], viralPhoneRig, ["pops in"], 0.15, 0.43),
    tvNewsSlump: heroProp("TV news slump", "a TV with the sports chyron 'KEVIN DURANT: 0-12 - CAREER OVER?'; step 1 flickers it on; 1.3 m wide x scale", ["tv", "news", "chyron"], tvNewsRig, ["flickers on"], 0.7, 0.95),
    arenaScoreboard: heroProp("Arena scoreboard", "the hanging scoreboard 'THUNDER 88 | 00:05 | OPP 89' (2.7 m cube, hung from cables) x scale; step 1 lights it up", ["scoreboard", "arena", "clock"], scoreboardRig, ["lights up"], 1.4, 2.0),
    e4Number: { name: "3D number (Engine 4)", desc: "oversized extruded 3D text lit by the room (variant = the text, 1-8 characters, e.g. 6:00); pops in on its first step, then floats; 0.5 m tall x scale, centred on `at` (its base). Use instead of a flat framed infographic", category: "theme", themes: ["engine4"], tags: ["number", "text", "3d", "infographic"], radius: 0.6, height: 0.5,
      build: () => undefined, rig: (a, v) => numberRig(a, v ?? "6:00"), steps: ["pops in"], stepCount: () => 1,
      param: { desc: "the text to show (1-8 letters, digits, : . ! ? % $ + -)", ok: (v: string) => /^[A-Za-z0-9:.!?%$+\- ]{1,8}$/.test(v) } },
  },
  sets: { e4Kitchen, e4Court, e4Arena },
  layouts: { e4Kitchen: { spots: SPOTS, views: VIEWS, ceiling: 2.7 }, e4Court: { spots: COURT_SPOTS, views: COURT_VIEWS, ceiling: 8 }, e4Arena: { spots: ARENA_SPOTS, views: ARENA_VIEWS, ceiling: 9 } },
  setMeta: { e4Court: { name: "Street court (Engine 4)", desc: "a fenced asphalt half-court (x -5.6..5.6, z -6.2..4.8) with one hoop at (0, 2.45, -4.15), a bench, a streetlamp, houses and trees behind the fence; light day = bright afternoon, night = 5 AM dawn in the rain", themes: ["sport", "street"], tags: ["basketball", "court", "engine4"] },
    e4Arena: { name: "Thunder arena (Engine 4)", desc: "a hardwood arena court (x -7..7, z -10..6) with a centre logo, a hoop at (0, 2.45, -8.15), LED boards and a crowd on three sides, and a tunnel (x -17..-9, z -3..3) with a bench at (-13, 0, -2.45); light interior = game night, interiorCool = the tunnel", themes: ["sport", "arena"], tags: ["basketball", "arena", "tunnel", "engine4"] },
    e4Kitchen: { name: "Maya's kitchen (Engine 4)", desc: "4.4 x 6.0 m (z -2.4..3.6), back wall z -2.4 with a window (x -0.7..0.7, y 1.05..2.15) over the sink, counter run along the back wall (x -2.2..1.2, kettle x -1.55, toaster x -0.95, cutting board x 0.82), fridge x 1.3..2.1, table centre (0.35, -0.3) with three chairs and a pendant lamp over it at y 1.72. Spots a (counter), b (table front), c (fridge), d", themes: ["home", "everyday"], tags: ["kitchen", "engine4", "pbr", "pendant lamp"] } },
};
