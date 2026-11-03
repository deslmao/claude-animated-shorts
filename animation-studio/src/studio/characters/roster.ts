// Character roster (stage 3C): every named character a storyboard can cast ("cast: { captain: "pirateCaptain" }"),
// the recurring leads plus every themed collection's characters (src/studio/themes/*), with who they are. The same id
// is always the same person: themed characters created for one video are reused by the next one on that theme.
import type { Look } from "./figure";
import { CAST } from "./cast";
import { THEMES } from "../themes";

export type CharacterMeta = { name: string; desc: string; personality: string; themes: string[]; tags: string[]; outfitOf?: string };

export const LEAD_META: Record<keyof typeof CAST, CharacterMeta> = {
  milo: { name: "Milo", desc: "spiky brown tuft, mustard hoodie, jeans, white trainers, extra-wide shock eyes", personality: "curious everyman: asks, reacts, gets into trouble", themes: ["modern", "everyday", "any"], tags: ["lead", "young", "male", "viewer stand-in"] },
  juno: { name: "Dr. Juno Park", desc: "dark bob, round glasses, quirky raised brow, teal turtleneck, lab coat", personality: "know-it-all friend: the 'You see...' explanation", themes: ["science", "modern", "any"], tags: ["lead", "scientist", "female", "explainer"] },
  junoOut: { name: "Dr. Juno Park (out and about)", desc: "Juno in a blazer instead of the lab coat", personality: "as Juno", themes: ["modern", "any"], tags: ["lead", "female", "explainer"], outfitOf: "juno" },
  gus: { name: "Gus", desc: "bald, grey side hair, bushy brows, walrus moustache, waistcoat, red bow tie", personality: "big-hearted old-timer: history, 'back in my day', comic relief", themes: ["history", "modern", "any"], tags: ["lead", "old", "male", "comic"] },
};

/** every castable character: leads + themed characters */
export const ROSTER: Record<string, Look> = { ...CAST, ...Object.assign({}, ...THEMES.map((t) => t.characters ?? {})) };
export const CHARACTER_META: Record<string, CharacterMeta> = { ...LEAD_META, ...Object.assign({}, ...THEMES.map((t) => t.characterMeta ?? {})) };
