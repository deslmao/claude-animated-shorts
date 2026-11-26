// Engine 4 sets (opt-in: only a storyboard with `engine: 4` uses them). Phase 1: Maya's kitchen, a unified PBR room.
// Source: blender/sets/kitchen.py (Poly Haven CC0 textures, baked indirect light) -> public/e4/kitchen/. See engine4/kitchen.ts.
import type { Theme } from "..";
import type { SetDef } from "../../sets/types";
import { buildE4Kitchen, SPOTS, VIEWS } from "../../engine4/kitchen";

const e4Kitchen: SetDef = { id: "e4Kitchen", title: "Maya's kitchen (Engine 4): a PBR room, baked bounce light, a warm pendant lamp over the table and a cool dusk window", lights: ["interior"], build: () => buildE4Kitchen() };

export const E4_THEME: Theme = {
  id: "e4", name: "Engine 4 sets", desc: "Unified PBR sets built in Blender with baked lightmaps and live lights (opt-in, engine: 4)", tags: ["engine4", "pbr", "blender"],
  sets: { e4Kitchen },
  layouts: { e4Kitchen: { spots: SPOTS, views: VIEWS, ceiling: 2.7 } },
  setMeta: { e4Kitchen: { name: "Maya's kitchen (Engine 4)", desc: "4.4 x 4.2 m, back wall z -2.4 with a window (x -0.7..0.7, y 1.05..2.15) over the sink, counter run along the back wall (x -2.2..1.2, kettle x -1.55, toaster x -0.95, cutting board x 0.82), fridge x 1.3..2.1, table centre (0.35, -0.3) with three chairs and a pendant lamp over it at y 1.72. Spots a (counter), b (table front), c (fridge), d", themes: ["home", "everyday"], tags: ["kitchen", "engine4", "pbr", "pendant lamp"] } },
};
