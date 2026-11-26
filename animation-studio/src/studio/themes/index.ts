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
import type { Mood, Ambience, SfxName } from "../sound/catalog";

export type SetMeta = { name: string; desc: string; themes: string[]; tags: string[] };
export type Theme = {
  id: string; name: string; desc: string; tags: string[];
  /** the music mood stories on this theme default to (a storyboard's own `music` wins) */
  mood?: Mood;
  /** the ambience bed each of the theme's sets gets (day; `night` keys as "<set>:night") */
  ambience?: Record<string, Ambience>;
  /** footstep sound per set (default: wooden floor) */
  steps?: Record<string, SfxName>;
  characters?: Record<string, Look>; characterMeta?: Record<string, CharacterMeta>;
  props?: Record<string, PropEntry>;
  items?: Record<string, ItemEntry>;
  sets?: Record<string, SetDef>; layouts?: Record<string, Layout>; setMeta?: Record<string, SetMeta>;
};

import { SCIENCE } from "./science";
import { PIRATES } from "./pirates";
import { EVERYDAY } from "./everyday";
import { RACE1904 } from "./race1904";
import { EXTRADOOR_THEME } from "./extradoor";
import { EVERYLIE_THEME } from "./everylie";
import { FLOATAWAY_THEME } from "./floataway";
import { NIGHTSHIFT_THEME } from "./nightshift";
import { LOCKEDOUT_THEME } from "./lockedout";
import { ONETOOMANY_THEME } from "./onetoomany";
import { WHALECITY_THEME } from "./whalecity";
import { OTHERJAMIE_THEME } from "./otherjamie";
import { OLLIE_THEME } from "./ollie";
import { STEPS_THEME } from "./steps";
import { EMPTYSEAT_THEME } from "./emptyseat";
import { NOVA_THEME } from "./nova";
import { TIMESTOP_THEME } from "./timestop";
import { MEMORY_THEME } from "./memory";
import { BREAKFAST_THEME } from "./breakfast";
import { NIGHTTRAIN_THEME } from "./nighttrain";
import { SIXSEVEN_THEME } from "./sixseven";
import { GTAGF_THEME } from "./gtagf";
import { E4_THEME } from "./e4";

export const THEMES: Theme[] = [SCIENCE, PIRATES, EVERYDAY, RACE1904, EXTRADOOR_THEME, EVERYLIE_THEME, FLOATAWAY_THEME, NIGHTSHIFT_THEME, LOCKEDOUT_THEME, ONETOOMANY_THEME, WHALECITY_THEME, OTHERJAMIE_THEME, OLLIE_THEME, STEPS_THEME, EMPTYSEAT_THEME, NOVA_THEME, TIMESTOP_THEME, MEMORY_THEME, BREAKFAST_THEME, NIGHTTRAIN_THEME, SIXSEVEN_THEME, GTAGF_THEME, E4_THEME];
