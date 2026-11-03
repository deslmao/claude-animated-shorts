// Themed asset collections (stage 3C): pirates, medieval, ancient Rome, space, ... Each theme is one folder
// (src/studio/themes/<id>/) exporting a Theme: its characters, props, hand-held items and sets, with metadata. Register
// it in THEMES below and everything joins the library at once: storyboards can cast / place / hold / use it, the
// validator knows it, `npm run assets -- search` finds it, `npm run test:library` protects it, and floor maps cover its
// sets. A topic on an existing theme REUSES these assets; a new theme (or a missing piece) is added here once.
// Rule for theme modules: import only TYPES from the base libraries (characters / props / sets) to avoid import cycles;
// builders come from props/kit, materials/*, sets/room and camera/framing.
import type { Look } from "../characters/figure";
import type { CharacterMeta } from "../characters/roster";
import type { PropEntry } from "../props/registry";
import type { ItemEntry } from "../characters/items";
import type { SetDef } from "../sets/types";
import type { Layout } from "../sets/layouts";
import type { Mood, Ambience } from "../sound/catalog";

export type SetMeta = { name: string; desc: string; themes: string[]; tags: string[] };
export type Theme = {
  id: string; name: string; desc: string; tags: string[];
  /** the music mood stories on this theme default to (a storyboard's own `music` wins) */
  mood?: Mood;
  /** the ambience bed each of the theme's sets gets (day; `night` keys as "<set>:night") */
  ambience?: Record<string, Ambience>;
  characters?: Record<string, Look>; characterMeta?: Record<string, CharacterMeta>;
  props?: Record<string, PropEntry>;
  items?: Record<string, ItemEntry>;
  sets?: Record<string, SetDef>; layouts?: Record<string, Layout>; setMeta?: Record<string, SetMeta>;
};

import { SCIENCE } from "./science";
import { PIRATES } from "./pirates";

export const THEMES: Theme[] = [SCIENCE, PIRATES];
