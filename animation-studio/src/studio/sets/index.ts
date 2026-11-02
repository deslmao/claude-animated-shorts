// Registry of reusable sets (Stage 1C).
import { SetDef } from "./types";
import { HOME } from "./home";
import { CLASSROOM, OFFICE, LAB } from "./indoor";
import { CITY, OLDTOWN, NATURE } from "./outdoor";

export const SETS: Record<string, SetDef> = { home: HOME, classroom: CLASSROOM, office: OFFICE, lab: LAB, city: CITY, oldtown: OLDTOWN, nature: NATURE };
