// Engine 4 sets (opt-in: only a storyboard with `engine: 4` uses them). Phase 1: Maya's kitchen, a unified PBR room.
// Source: blender/sets/kitchen.py (Poly Haven CC0 textures, baked indirect light) -> public/e4/kitchen/. See engine4/kitchen.ts.
import type { Theme } from "..";
import type { SetDef } from "../../sets/types";
import type { Look } from "../../characters/figure";
import { buildE4Kitchen, SPOTS, VIEWS } from "../../engine4/kitchen";
import { numberRig } from "../../engine4/number";

/** Dex, Leo's smug cousin (In my world, the highest number wins every argument): Noah's size and build, but fair skin, spiky ginger hair, a teal tee and a permanently raised brow */
const DEX: Look = { name: "Dex", build: "kid", skin: "#f5c9a0", seed: 811, hair: { style: "spiky", color: "#c9672a" }, brow: { quirk: 3 },
  top: { style: "tee", color: "#2a9d8f", accent: "#f2efe6" }, legs: "#2f3448", shoes: "#f4f1ea" };

const e4Kitchen: SetDef = { id: "e4Kitchen", title: "Maya's kitchen (Engine 4): a PBR room, baked bounce light, a warm pendant lamp over the table and a cool dusk window", lights: ["interior"], build: () => buildE4Kitchen() };

export const E4_THEME: Theme = {
  id: "e4", name: "Engine 4 sets", desc: "Unified PBR sets built in Blender with baked lightmaps and live lights (opt-in, engine: 4)", tags: ["engine4", "pbr", "blender"],
  characters: { dex: DEX },
  characterMeta: { dex: { name: "Dex", desc: "11; spiky ginger hair, a teal tee, a permanently raised brow", personality: "Leo's smug cousin: always an eight, delighted by other people's trouble", themes: ["home", "everyday"], tags: ["child", "boy", "rival", "smug"] } },
  props: {
    e4Number: { name: "3D number (Engine 4)", desc: "oversized extruded 3D text lit by the room (variant = the text, 1-8 characters, e.g. 6:00); pops in on its first step, then floats; 0.5 m tall x scale, centred on `at` (its base). Use instead of a flat framed infographic", category: "theme", themes: ["engine4"], tags: ["number", "text", "3d", "infographic"], radius: 0.6, height: 0.5,
      build: () => undefined, rig: (a, v) => numberRig(a, v ?? "6:00"), steps: ["pops in"], stepCount: () => 1,
      param: { desc: "the text to show (1-8 letters, digits, : . ! ? % $ + -)", ok: (v: string) => /^[A-Za-z0-9:.!?%$+\- ]{1,8}$/.test(v) } },
  },
  sets: { e4Kitchen },
  layouts: { e4Kitchen: { spots: SPOTS, views: VIEWS, ceiling: 2.7 } },
  setMeta: { e4Kitchen: { name: "Maya's kitchen (Engine 4)", desc: "4.4 x 6.0 m (z -2.4..3.6), back wall z -2.4 with a window (x -0.7..0.7, y 1.05..2.15) over the sink, counter run along the back wall (x -2.2..1.2, kettle x -1.55, toaster x -0.95, cutting board x 0.82), fridge x 1.3..2.1, table centre (0.35, -0.3) with three chairs and a pendant lamp over it at y 1.72. Spots a (counter), b (table front), c (fridge), d", themes: ["home", "everyday"], tags: ["kitchen", "engine4", "pbr", "pendant lamp"] } },
};
