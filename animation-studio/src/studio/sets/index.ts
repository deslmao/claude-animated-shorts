// Registry of reusable sets (Stage 1C).
import { SetDef } from "./types";
import { HOME } from "./home";
import { CLASSROOM, OFFICE, LAB } from "./indoor";
import { CITY, OLDTOWN, NATURE } from "./outdoor";
import { PROPSTUDIO } from "./propstudio";
import { THEMES } from "../themes";

/** the base sets + every themed collection's sets (src/studio/themes) */
export const SETS: Record<string, SetDef> = { home: HOME, classroom: CLASSROOM, office: OFFICE, lab: LAB, city: CITY, oldtown: OLDTOWN, nature: NATURE, ...Object.assign({}, ...THEMES.map((t) => t.sets ?? {})) };
/** test-only sets (not for stories) */
export const TEST_SETS: Record<string, SetDef> = { props: PROPSTUDIO };
