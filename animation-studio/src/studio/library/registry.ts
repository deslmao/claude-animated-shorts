// The asset library (stage 3C): ONE searchable list of every reusable asset the studio has, with an id, kind, name,
// description, themes, tags and the details a storyboard needs (marks and views of a set, variants of a prop, the
// lights a set suits...). Built from the live registries (characters / roster, extras, sets + layouts, props, held
// items, effects, acting, music, ambience, sound effects, voices, camera moves, lights), so it can never drift from
// what actually exists. `npm run assets -- search pirate ship` searches it; docs/ASSETS.md is generated from it.
import { ROSTER, CHARACTER_META } from "../characters/roster";
import { ACT_NAMES, FACES, GESTURES } from "../characters/figure";
import { ITEMS } from "../characters/items";
import { SETS } from "../sets";
import { LAYOUTS } from "../sets/layouts";
import { PROPS } from "../props/registry";
import { FX_KINDS } from "../fx/effects";
import { MOODS, AMBIENCES, SFX } from "../sound/catalog";
import { VOICES, NARRATOR } from "../voice/voices";
import { LIGHTS } from "../look/lights";
import { THEMES, SetMeta } from "../themes";

export type AssetKind = "character" | "extras" | "set" | "prop" | "item" | "effect" | "act" | "face" | "gesture" | "mood" | "ambience" | "sfx" | "voice" | "camera" | "light";
export type Asset = { id: string; kind: AssetKind; name: string; desc: string; themes: string[]; tags: string[]; details?: string };

const BASE_SETS: Record<string, SetMeta> = {
  home: { name: "Home", desc: "living room + kitchen: sofa, armchair, TV, bookshelf, window, plants", themes: ["modern", "everyday"], tags: ["indoor", "house", "family", "psychology"] },
  classroom: { name: "Classroom", desc: "school room: chalkboard, teacher's desk, rows of desks", themes: ["modern", "school"], tags: ["indoor", "learning", "teacher", "students"] },
  office: { name: "Office", desc: "open office: desks, monitors, whiteboard, water cooler", themes: ["modern", "work"], tags: ["indoor", "job", "business", "psychology"] },
  lab: { name: "Laboratory", desc: "science lab: benches, flasks, microscope, fume hood, jar shelves", themes: ["science", "modern"], tags: ["indoor", "experiment", "chemistry", "biology"] },
  city: { name: "City street", desc: "modern street: shopfronts (cafe), pavements, road, crossing, bus stop, street lamps", themes: ["modern", "everyday"], tags: ["outdoor", "town", "shops", "traffic", "crowd"] },
  oldtown: { name: "Old town square", desc: "cobbled square: fountain, market stalls, well, cart, old houses", themes: ["history", "medieval", "victorian"], tags: ["outdoor", "market", "village", "crowd"] },
  nature: { name: "Countryside", desc: "meadow and woods: winding path, pond, log, forest edge, fence", themes: ["nature"], tags: ["outdoor", "animals", "park", "walk"] },
};
const ERA_DESC: Record<string, string> = { modern: "everyday people today", office: "office workers (shirts, ties, blazers)", lab: "scientists in lab coats", fifties: "1950s clothes", victorian: "19th-century dress (top hats, waistcoats, long dresses)", medieval: "medieval townsfolk (tunics, hoods)", pirate: "a ship's crew around 1720 (striped shirts, bandanas, tricorns, eyepatches)" , runner1904: "a 1904 marathon field (sleeveless running vests, knee shorts)", pupil: "Year 7 pupils today (navy blazers, white shirts, striped ties)" };
const CAMERA: Record<string, string> = {
  view: "a set's designed view", establish: "a designed view with a slow drift (opening a place)", frame: "frame named actors at a shot size",
  pushIn: "glide closer (full -> medium)", pullOut: "glide away", closeUp: "close-up, optional punch-in", lowHero: "low heroic angle",
  highAngle: "looking down on actors", overShoulder: "over one actor's shoulder at another", orbit: "circle around actors",
  crane: "crane down from height", dutch: "tilted frame (drama, unease)", follow: "track a walking / running actor",
  at: "an authored camera position in set coordinates (hand-placed set-ups, flights)", insert: "a detail: a prop, a face, hands or a held item (close / extreme / macro)",
  pov: "a point of view: from an actor's eyes toward an actor, a prop or a part",
};
const FX_DESC: Record<string, string> = { question: "yellow question mark", exclaim: "red exclamation mark", sweat: "sweat drops", anger: "anger vein mark", idea: "light bulb", hearts: "floating hearts", zzz: "sleep zzz", speed: "speed lines", puff: "dust puff", stars: "dizzy stars", burst: "impact burst", confetti: "confetti", sparkle: "sparkles", notes: "music notes", splash: "water splash", ring: "ringing marks", thought: "thought bubble holding a set of keys (a plan in mind)", thoughtPop: "the thought bubble bursting into puffs (a plan forgotten)" };

const setMeta = (id: string): SetMeta => BASE_SETS[id] ?? Object.assign({}, ...THEMES.map((t) => t.setMeta ?? {}))[id] ?? { name: id, desc: SETS[id]?.title ?? id, themes: [], tags: [] };

export const ASSETS: Asset[] = [
  ...Object.keys(ROSTER).map((id): Asset => { const m = CHARACTER_META[id]; return { id, kind: "character", name: m?.name ?? id, desc: m?.desc ?? "", themes: m?.themes ?? [], tags: [...(m?.tags ?? []), ...(m?.personality ? [m.personality] : [])], details: m?.outfitOf ? `outfit of ${m.outfitOf}` : undefined }; }),
  ...Object.entries(ERA_DESC).map(([e, d]): Asset => ({ id: `extras:${e}`, kind: "extras", name: `${e} extras`, desc: `crowd generator: ${d}; extra(i, "${e}") is always the same person`, themes: e === "pirate" ? ["history", "pirates"] : e === "medieval" || e === "victorian" ? ["history", e] : ["modern", e], tags: ["crowd", "people", "background"] })),
  ...Object.keys(SETS).map((id): Asset => { const m = setMeta(id), L = LAYOUTS[id]; return { id, kind: "set", name: m.name, desc: m.desc, themes: m.themes, tags: [...m.tags, ...SETS[id].lights], details: L ? `marks: ${Object.keys(L.spots).join(", ")} | views: ${L.views.map((v) => v.name).join(", ")} | lights: ${SETS[id].lights.join(", ")}` : undefined }; }),
  ...Object.entries(PROPS).map(([id, p]): Asset => ({ id, kind: "prop", name: p.name, desc: p.desc, themes: p.themes, tags: [p.category, ...p.tags], details: `footprint ${p.radius} m, ${p.height} m tall${p.variants ? ` | variants: ${Object.keys(p.variants).join(", ")}` : ""}` })),
  ...Object.entries(ITEMS).map(([id, it]): Asset => ({ id, kind: "item", name: it.name, desc: it.desc, themes: it.themes, tags: ["held", ...it.tags] })),
  ...FX_KINDS.map((k): Asset => ({ id: k, kind: "effect", name: k, desc: FX_DESC[k] ?? k, themes: ["any"], tags: ["reaction", "2D mark"] })),
  ...ACT_NAMES.map((a): Asset => ({ id: a, kind: "act", name: a, desc: `acting preset "${a}" (face + body language)`, themes: ["any"], tags: ["acting"] })),
  ...Object.keys(FACES).map((f): Asset => ({ id: f, kind: "face", name: f, desc: `expression "${f}"`, themes: ["any"], tags: ["expression"] })),
  ...GESTURES.map((g): Asset => ({ id: g, kind: "gesture", name: g, desc: `arm gesture "${g}"`, themes: ["any"], tags: ["acting", "arms"] })),
  ...Object.entries(MOODS).map(([id, d]): Asset => ({ id, kind: "mood", name: id, desc: d, themes: ["any"], tags: ["music"] })),
  ...Object.entries(AMBIENCES).map(([id, d]): Asset => ({ id, kind: "ambience", name: id, desc: d, themes: ["any"], tags: ["sound", "background"] })),
  ...Object.entries(SFX).map(([id, d]): Asset => ({ id, kind: "sfx", name: id, desc: d, themes: ["any"], tags: ["sound effect"] })),
  ...Object.entries(VOICES).map(([id, v]): Asset => ({ id, kind: "voice", name: v.name, desc: v.note, themes: ["any"], tags: ["narration", ...(id === NARRATOR ? ["default"] : [])], details: `${v.voiceId} | ${v.model}` })),
  ...Object.entries(CAMERA).map(([id, d]): Asset => ({ id, kind: "camera", name: id, desc: d, themes: ["any"], tags: ["camera move"] })),
  ...Object.keys(LIGHTS).map((id): Asset => ({ id, kind: "light", name: id, desc: `light preset "${id}"`, themes: ["any"], tags: ["lighting"] })),
];

/** words -> ranked assets (name / id / tags / themes / description; theme and exact-word hits count most) */
export const searchAssets = (query: string, kind?: AssetKind, limit = 20) => {
  const words = query.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);
  const stem = (w: string) => w.replace(/(ies|es|s)$/, "");
  const scored = ASSETS.filter((a) => !kind || a.kind === kind).map((a) => {
    const fields: [string, number][] = [[a.id.toLowerCase(), 4], [a.name.toLowerCase(), 4], [a.themes.join(" ").toLowerCase(), 3], [a.tags.join(" ").toLowerCase(), 2], [a.desc.toLowerCase(), 1], [(a.details ?? "").toLowerCase(), 0.5]];
    let score = 0;
    for (const w of words) for (const [f, k] of fields) { const s = stem(w); if (f.split(/[^a-z0-9]+/).some((x) => x === w || stem(x) === s)) score += k; else if (s.length > 3 && f.includes(s)) score += k / 3; }
    return { a, score };
  }).filter((x) => x.score > 0).sort((x, y) => y.score - x.score || x.a.id.localeCompare(y.a.id));
  return scored.slice(0, limit);
};

export const THEME_LIST = THEMES.map((t) => ({ id: t.id, name: t.name, desc: t.desc, characters: Object.keys(t.characters ?? {}), props: Object.keys(t.props ?? {}), items: Object.keys(t.items ?? {}), sets: Object.keys(t.sets ?? {}) }));
