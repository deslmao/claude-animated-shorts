// Hand-held items (stage 3C): small objects drawn INTO a character's card at their hand, in the cast's own style (flat
// colour, plum ink, the same light), so a held item stays consistent with the character in every shot. A storyboard
// gives an actor `hold: "<item>"` (or a beat changes it); figureFront draws the item at the holding hand. Coordinates:
// (x, y) = the hand, u = 1 % of the head width, s = +1 when the hand is on screen-right (items lean outward).
import { Pen, INK, P2 } from "./toon";
import { THEMES } from "../themes";

export type ItemEntry = { name: string; desc: string; themes: string[]; tags: string[]; draw: (p: Pen, x: number, y: number, u: number, s: number) => void };

const R = (cx: number, cy: number, w: number, h: number, a = 0): P2[] => {
  const c = Math.cos(a), si = Math.sin(a);
  return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as P2[]).map(([x, y]) => [cx + x * c - y * si, cy + x * si + y * c]);
};
const ol = (u: number) => 3.0 * u;

export const ITEMS: Record<string, ItemEntry> = {
  book: { name: "Book", desc: "closed hardback book", themes: ["modern", "school", "history"], tags: ["read", "study", "knowledge"],
    draw: (p, x, y, u, s) => { p.poly(R(x + 4 * u * s, y - 12 * u, 26 * u, 34 * u, 0.12 * s), "#b5553a", ol(u)); p.poly(R(x + 7 * u * s, y - 12 * u, 18 * u, 30 * u, 0.12 * s), "#f2ead8", 0); p.stroke([[x + (4 - 13) * u * s, y - 28 * u], [x + (4 - 13) * u * s, y + 4 * u]], 2 * u); } },
  phone: { name: "Phone", desc: "smartphone", themes: ["modern"], tags: ["call", "screen", "social media"],
    draw: (p, x, y, u) => { p.poly(R(x, y - 10 * u, 14 * u, 26 * u), "#2b2f3a", ol(u)); p.poly(R(x, y - 11 * u, 10 * u, 18 * u), "#8fd0f0", 0); } },
  mug: { name: "Mug", desc: "coffee mug", themes: ["modern", "home", "office"], tags: ["coffee", "tea", "drink"],
    draw: (p, x, y, u, s) => { p.ell(x + 11 * u * s, y - 8 * u, 6 * u, 7 * u, null, 3 * u); p.poly(R(x, y - 8 * u, 18 * u, 20 * u), "#e9c46a", ol(u)); p.ell(x, y - 18 * u, 9 * u, 2.5 * u, "#6b3e26", 1.5 * u); } },
  apple: { name: "Apple", desc: "red apple", themes: ["modern", "school", "science"], tags: ["food", "fruit", "gravity"],
    draw: (p, x, y, u) => { p.ell(x, y - 10 * u, 11 * u, 10 * u, "#d8443a", ol(u)); p.stroke([[x, y - 19 * u], [x + 2 * u, y - 25 * u]], 2.2 * u); p.ell(x + 6 * u, y - 23 * u, 4 * u, 2 * u, "#5d8a3a", 1.5 * u, 0, 360, -0.5); } },
  coin: { name: "Gold coin", desc: "big gold coin", themes: ["history", "pirates", "money"], tags: ["money", "treasure", "gold"],
    draw: (p, x, y, u) => { p.ell(x, y - 9 * u, 9 * u, 9 * u, "#f0c040", ol(u)); p.ell(x, y - 9 * u, 5 * u, 5 * u, null, 1.6 * u); } },
  letter: { name: "Letter", desc: "envelope", themes: ["modern", "history"], tags: ["mail", "message", "news"],
    draw: (p, x, y, u, s) => { const r = R(x + 3 * u * s, y - 10 * u, 30 * u, 20 * u, -0.1 * s); p.poly(r, "#f4efe2", ol(u)); p.stroke([r[0], [x + 3 * u * s, y - 8 * u], r[1]], 1.8 * u); } },
  map: { name: "Treasure map", desc: "old paper map with an X", themes: ["pirates", "history", "adventure"], tags: ["map", "treasure", "explore"],
    draw: (p, x, y, u, s) => {
      p.poly(R(x + 6 * u * s, y - 14 * u, 36 * u, 28 * u, 0.08 * s), "#e8d29a", ol(u));
      p.ell(x - 11 * u * s + 6 * u * s, y - 14 * u, 3 * u, 14 * u, "#d8bf80", 2 * u); p.ell(x + 23 * u * s + 6 * u * s, y - 14 * u, 3 * u, 14 * u, "#d8bf80", 2 * u);
      p.line([[x - 4 * u * s, y - 6 * u], [x + 4 * u * s, y - 12 * u], [x + 10 * u * s, y - 8 * u]], "#9a5a3a", 1.4 * u, false);
      p.stroke([[x + 12 * u * s, y - 22 * u], [x + 18 * u * s, y - 16 * u]], 2.2 * u, "#c0353a"); p.stroke([[x + 18 * u * s, y - 22 * u], [x + 12 * u * s, y - 16 * u]], 2.2 * u, "#c0353a");
    } },
  magnifier: { name: "Magnifying glass", desc: "magnifying glass", themes: ["science", "detective", "history"], tags: ["look", "clue", "investigate", "small"],
    draw: (p, x, y, u, s) => { p.stroke([[x - 4 * u * s, y + 8 * u], [x + 6 * u * s, y - 12 * u]], 4.5 * u, "#5a3b2a"); p.ell(x + 12 * u * s, y - 24 * u, 13 * u, 13 * u, "#cfe8f5", ol(u)); p.ell(x + 8 * u * s, y - 28 * u, 3 * u, 4 * u, "#ffffff", 0); } },
  torch: { name: "Torch", desc: "burning wooden torch", themes: ["history", "medieval", "adventure"], tags: ["fire", "light", "dark", "cave"],
    draw: (p, x, y, u, s) => {
      p.stroke([[x - 2 * u * s, y + 10 * u], [x + 3 * u * s, y - 42 * u]], 5.5 * u, "#7a4a2a");
      p.poly([[x + 3 * u * s, y - 66 * u], [x + 12 * u * s, y - 44 * u], [x + 4 * u * s, y - 38 * u], [x - 6 * u * s, y - 44 * u]], "#f08a2c", ol(u));
      p.poly([[x + 3 * u * s, y - 58 * u], [x + 7 * u * s, y - 45 * u], [x, y - 42 * u]], "#f4d24a", 0);
    } },
  telescope: { name: "Telescope", desc: "brass spyglass", themes: ["pirates", "history", "space", "adventure"], tags: ["look", "far", "ship", "stars"],
    draw: (p, x, y, u, s) => { p.poly(R(x + 10 * u * s, y - 8 * u, 26 * u, 9 * u, -0.25 * s), "#c9a24a", ol(u)); p.poly(R(x + 30 * u * s, y - 13 * u, 18 * u, 12 * u, -0.25 * s), "#a8823a", ol(u)); } },
  sword: { name: "Cutlass", desc: "curved sword", themes: ["pirates", "history", "medieval", "adventure"], tags: ["fight", "weapon", "battle"],
    draw: (p, x, y, u, s) => {
      p.poly([[x - 2 * u * s, y - 6 * u], [x + 6 * u * s, y - 50 * u], [x + 14 * u * s, y - 56 * u], [x + 9 * u * s, y - 44 * u], [x + 4 * u * s, y - 6 * u]], "#d8dde3", ol(u));
      p.stroke([[x - 9 * u * s, y - 5 * u], [x + 11 * u * s, y - 7 * u]], 4 * u, "#c9a24a"); p.stroke([[x, y - 4 * u], [x - 1 * u * s, y + 9 * u]], 4.5 * u, "#5a3b2a");
    } },
  flag: { name: "Flag", desc: "flag on a pole (pirate black by default)", themes: ["pirates", "history", "sport"], tags: ["claim", "win", "country"],
    draw: (p, x, y, u, s) => { p.stroke([[x, y + 14 * u], [x, y - 70 * u]], 3.2 * u, "#6b4a2a"); p.poly([[x, y - 70 * u], [x + 34 * u * s, y - 64 * u], [x, y - 50 * u]], "#2b2f3a", ol(u)); p.ell(x + 11 * u * s, y - 62 * u, 3.5 * u, 3.5 * u, "#f2ead8", 0); } },
  key: { name: "Key", desc: "old golden key", themes: ["history", "adventure", "mystery"], tags: ["unlock", "secret", "door"],
    draw: (p, x, y, u, s) => { p.ell(x, y - 18 * u, 7 * u, 7 * u, null, 3 * u); p.stroke([[x, y - 11 * u], [x + 2 * u * s, y + 6 * u]], 3 * u, "#e0b040"); p.stroke([[x + 2 * u * s, y + 2 * u], [x + 7 * u * s, y + 2 * u]], 2.4 * u, "#e0b040"); } },
  lightbulb: { name: "Light bulb", desc: "light bulb (an idea, electricity)", themes: ["science", "modern"], tags: ["idea", "electricity", "invention"],
    draw: (p, x, y, u) => { p.poly(R(x, y - 4 * u, 9 * u, 8 * u), "#9aa3ab", ol(u)); p.ell(x, y - 18 * u, 12 * u, 13 * u, "#fff1a8", ol(u)); } },
  compass: { name: "Compass", desc: "navigation compass", themes: ["pirates", "adventure", "history"], tags: ["direction", "north", "navigate"],
    draw: (p, x, y, u) => { p.ell(x, y - 10 * u, 11 * u, 11 * u, "#c9a24a", ol(u)); p.ell(x, y - 10 * u, 7.5 * u, 7.5 * u, "#f4efe2", 0); p.poly([[x, y - 17 * u], [x + 2.4 * u, y - 10 * u], [x - 2.4 * u, y - 10 * u]], "#c0353a", 0); } },
  bottle: { name: "Bottle", desc: "glass bottle", themes: ["pirates", "history"], tags: ["drink", "message in a bottle", "glass"],
    draw: (p, x, y, u, s) => { p.poly([[x - 6 * u, y + 6 * u], [x + 6 * u, y + 6 * u], [x + 6 * u, y - 14 * u], [x + 2.5 * u, y - 20 * u], [x + 2.5 * u, y - 30 * u], [x - 2.5 * u, y - 30 * u], [x - 2.5 * u, y - 20 * u], [x - 6 * u, y - 14 * u]], "#5aa05a", ol(u)); p.poly(R(x, y - 31 * u, 6 * u, 4 * u), "#a8724a", 1.5 * u); void s; } },
  flask: { name: "Lab flask", desc: "conical flask with green liquid", themes: ["science", "lab"], tags: ["chemistry", "experiment", "potion"],
    draw: (p, x, y, u) => { p.poly([[x - 11 * u, y + 2 * u], [x + 11 * u, y + 2 * u], [x + 3 * u, y - 16 * u], [x + 3 * u, y - 26 * u], [x - 3 * u, y - 26 * u], [x - 3 * u, y - 16 * u]], "#e6f3f6", ol(u)); p.poly([[x - 9 * u, y], [x + 9 * u, y], [x + 4 * u, y - 9 * u], [x - 4 * u, y - 9 * u]], "#4fd18b", 0); } },
};
// every themed collection's items join the library
for (const t of THEMES) Object.assign(ITEMS, t.items ?? {});
export const ITEM_NAMES = Object.keys(ITEMS);
void INK;
