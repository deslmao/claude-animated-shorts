// The channel's recurring cast + a crowd generator. All original designs in the creator's measured style.
// Silhouette rule: each lead is identifiable from a black silhouette alone (Milo: hood + spiky tuft; Juno: bob +
// long white coat; Gus: round belly + bald dome with ear puffs + walrus moustache).
import { Look, HairStyle, TopStyle, LayerStyle, Build } from "./figure";
import { INK } from "./toon";

/** Milo — the curious everyman. Asks what the viewer is thinking, big reactions. */
export const MILO: Look = {
  name: "Milo", build: "adult", skin: "#f5c9a0", seed: 3,
  hair: { style: "tuft", color: "#4a2f22" },
  top: { style: "hoodie", color: "#e9a93b", accent: "#f6efe0" },
  legs: "#3f5f9e", shoes: "#f4f1ea",
  eyes: { shock: 1.2 },
};
/** Dr. Juno Park — the know-it-all friend. Deadpan, explains the "You see..." part. */
export const JUNO: Look = {
  name: "Juno", build: "tall", skin: "#c99067", seed: 6,
  hair: { style: "bob", color: "#211a26" },
  brow: { quirk: 3 },
  glasses: { style: "round", color: INK },
  top: { style: "turtleneck", color: "#23968a" },
  layer: { style: "labcoat", color: "#f6f5f0", accent: "#2a6fdb" },
  legs: "#2f3448", shoes: "#3a2b2b",
};
/** Juno outside the lab: blazer instead of the coat (same silhouette cues: bob + glasses + teal) */
export const JUNO_OUT: Look = { ...JUNO, layer: { style: "blazer", color: "#3c3a6e" } };
/** Gus — the big-hearted old-timer. History, "back in my day", comic relief. */
export const GUS: Look = {
  name: "Gus", build: "stout", skin: "#ffe2c2", seed: 2,
  hair: { style: "horseshoe", color: "#bdb8b1" },
  brow: { color: "#6f6962", k: 1.7 },
  moustache: { style: "walrus", color: "#d3cec7" },
  top: { style: "shirt", color: "#f2e6c8" },
  layer: { style: "waistcoat", color: "#8a5a3c", accent: "#e8c45a" },
  neck: { style: "bowtie", color: "#c0353a" },
  legs: "#5a4636", shoes: "#3a2b20",
};
export const CAST = { milo: MILO, juno: JUNO, junoOut: JUNO_OUT, gus: GUS };

// ---------------- crowd generator ----------------
// Extras never borrow a lead's signature: no spiky tuft, no mustard top (Milo), no teal turtleneck under a lab coat (Juno).
export type Era = "modern" | "fifties" | "victorian" | "medieval" | "office" | "lab" | "pirate" | "runner1904" | "pupil" | "pupil1979";
const SKINS = ["#ffe2c2", "#f5c9a0", "#ecd0b6", "#c99067", "#a8714c", "#e8b896"];
const HAIRC = ["#2a201a", "#4a2f22", "#6b4226", "#a5682f", "#d9b26a", "#1f1a24", "#8c8a88", "#c94f2c"];
const MOD_TOPS = ["#3f6fb5", "#c25a7a", "#5d8a3a", "#8c6bb1", "#2f5f6a", "#7b5ac9", "#e26d4f", "#4b4f5c", "#2a9d8f", "#b5653f"];
const PANTS = ["#2f3448", "#3f5f9e", "#4a4a52", "#5a4636", "#6a6f4a", "#2a2a33"];
const SHOES = ["#2a201a", "#f4f1ea", "#5a3b2a", "#3a3d47", "#9a3b30"];
const rndOf = (seed: number) => (k: number) => { const x = Math.sin(seed * 91.7 + k * 47.3) * 43758.5453; return x - Math.floor(x); };
const pick = <T,>(r: (k: number) => number, k: number, a: readonly T[]) => a[Math.floor(r(k) * a.length) % a.length];

/** a deterministic background person: same i + era = same person every frame and every render */
export const extra = (i: number, era: Era = "modern"): Look => {
  const r = rndOf(i + 1);
  const build: Build = pick(r, 1, ["adult", "adult", "tall", "stout", "lanky", "petite", "big", "adult", "petite"] as const);
  const fem = r(2) < 0.5;
  const hair: HairStyle = fem ? pick(r, 3, ["bob", "long", "bun", "ponytail", "curly", "side", "afro", "topknot"] as const) : pick(r, 3, ["short", "side", "buzz", "curly", "bald", "short", "afro", "receding"] as const);
  const base: Look = {
    name: `extra${i}`, build, skin: pick(r, 4, SKINS), seed: 10 + (i % 7),
    hair: { style: hair, color: hair === "bald" ? "#000000" : pick(r, 5, HAIRC) },
    top: { style: pick(r, 6, ["tee", "sweater", "hoodie", "shirt", "tee"] as const) as TopStyle, color: pick(r, 7, MOD_TOPS) },
    legs: pick(r, 8, PANTS), shoes: pick(r, 9, SHOES),
  };
  if (r(10) < 0.18) base.glasses = { style: r(11) < 0.5 ? "round" : "square", color: INK };
  if (!fem && r(12) < 0.2) base.beard = { style: r(13) < 0.5 ? "full" : "goatee", color: base.hair.color === "#000000" ? "#4a3426" : base.hair.color };
  if (!fem && !base.beard && r(14) < 0.15) base.moustache = { style: "thin", color: base.hair.color === "#000000" ? "#4a3426" : base.hair.color };
  if (fem && r(15) < 0.35) base.top = { style: "dress", color: pick(r, 16, MOD_TOPS) };
  switch (era) {
    case "office": base.top = { style: "shirt", color: pick(r, 17, ["#f4f4f0", "#cfe0f2", "#f2e6c8"] as const) };
      if (r(18) < 0.6) base.layer = { style: "blazer", color: pick(r, 19, ["#3c3a6e", "#4b4f5c", "#2f3448", "#5a4636"] as const) };
      else base.neck = { style: "tie", color: pick(r, 20, ["#c0353a", "#2a6fdb", "#3a3d47"] as const) }; break;
    case "lab": base.layer = { style: "labcoat", color: "#f6f5f0", accent: pick(r, 21, ["#2a6fdb", "#c0353a", "#3a3d47"] as const) }; break;
    case "fifties": if (!fem) { base.top = { style: "shirt", color: pick(r, 22, ["#f4f4f0", "#e9d9b4"] as const) }; base.neck = { style: "tie", color: pick(r, 23, ["#8c3b4a", "#2f5f6a"] as const) }; if (r(24) < 0.5) base.hat = { style: "bowler", color: "#4a3f3a" }; } break;
    case "victorian": base.top = fem ? { style: "dress", color: pick(r, 25, ["#8c3b4a", "#2f5f6a", "#5d7a3a", "#7b5ac9"] as const) } : { style: "shirt", color: "#efe6d4" };
      if (!fem) { base.layer = { style: pick(r, 26, ["waistcoat", "blazer"] as const) as LayerStyle, color: pick(r, 27, ["#3f3a4f", "#5a4636", "#2f4a3a"] as const) }; if (r(28) < 0.55) base.hat = { style: "tophat", color: "#2e2a36" }; } break;
    case "pirate": // a ship's crew around 1720: striped or loose shirts, bandanas, the odd tricorn or eyepatch, no glasses
      base.top = r(31) < 0.55 ? { style: "stripes", color: "#f2ece0", accent: pick(r, 32, ["#2f4a7a", "#a8323a", "#3a3d47"] as const) }
        : { style: "shirt", color: pick(r, 33, ["#efe6d4", "#d9c9a8", "#c9b79a"] as const) };
      delete base.glasses;
      if (r(34) < 0.3) base.layer = { style: "waistcoat", color: pick(r, 35, ["#5a3b2a", "#3f3a4f", "#6b2f2f"] as const), accent: "#c9a24a" };
      base.legs = pick(r, 36, ["#4a4036", "#3a3d47", "#5a4636", "#6b6255"] as const); base.shoes = pick(r, 37, ["#2a201a", "#3a2b20"] as const);
      { const h = r(38); if (h < 0.5) base.hat = { style: "bandana", color: pick(r, 39, ["#a8323a", "#2f4a7a", "#3a6b3a", "#5a3b6a"] as const), trim: "#f6efe0" };
        else if (h < 0.65) base.hat = { style: "tricorn", color: "#2e2a2a", trim: "#c9a24a" }; }
      if (base.hat && (base.hair.style === "afro" || base.hair.style === "bob")) base.hair = { ...base.hair, style: "curly" }; // big hair would balloon round a hat
      if (r(40) < 0.12) base.eyepatch = { side: r(41) < 0.5 ? -1 : 1 };
      break;
    case "runner1904": // a 1904 marathon field (Video 04): men in sleeveless running vests and knee shorts, no glasses or hats
      base.name = `runner${i}`;
      if (base.top.style === "dress") base.top = { style: "tee", color: "#f2ece0" };
      base.top = { style: "tee", color: pick(r, 42, ["#f2ece0", "#e6e1d6", "#d9d4c8", "#c9d3dc", "#e8d9b8"] as const) };
      base.bare = { arms: true }; base.shorts = pick(r, 43, ["#2f3448", "#3a3d47", "#4a4036", "#5a4636", "#f2ece0"] as const);
      base.shoes = pick(r, 44, ["#2a201a", "#3a2b20", "#5a3b2a"] as const);
      delete base.glasses; delete base.hat;
      if (["long", "bun", "ponytail", "bob", "topknot"].includes(base.hair.style)) base.hair = { ...base.hair, style: "short" };
      break;
    case "pupil": // a British secondary school today (One Too Many): Year 7 pupils in navy blazers, white shirts, striped ties
      base.name = `pupil${i}`; base.build = r(45) < 0.8 ? "kid" : "petite";
      base.top = { style: "shirt", color: pick(r, 46, ["#f4f4f0", "#eef0f2", "#f2efe6"] as const) };
      base.layer = { style: "blazer", color: pick(r, 47, ["#1f2d4f", "#22304f", "#1d2a48"] as const) };
      base.neck = { style: "tie", color: pick(r, 48, ["#a8323a", "#b03a3f"] as const) };
      base.legs = pick(r, 49, ["#4a4d55", "#3a3d47", "#55585f"] as const); base.shoes = pick(r, 50, ["#1e1e22", "#2a201a"] as const);
      delete base.beard; delete base.moustache; delete base.hat; if (r(51) < 0.7) delete base.glasses;
      if (base.hair.style === "bald" || base.hair.style === "receding") base.hair = { ...base.hair, style: "short", color: pick(r, 52, HAIRC) };
      break;
    case "pupil1979": // the same school in 1979 (One Too Many flashback): maroon blazers, old-gold ties, longer hair
      base.name = `pupil79_${i}`; base.build = r(53) < 0.8 ? "kid" : "petite";
      base.top = { style: "shirt", color: pick(r, 54, ["#ece4d0", "#f0e8d6"] as const) };
      base.layer = { style: "blazer", color: pick(r, 55, ["#7d2f3c", "#76303a", "#81343f"] as const) };
      base.neck = { style: "tie", color: "#b8a26a" };
      base.legs = pick(r, 56, ["#5c5b5e", "#4f4e52", "#625a52"] as const); base.shoes = pick(r, 57, ["#2a2628", "#3a2b20"] as const);
      delete base.beard; delete base.moustache; delete base.hat; delete base.glasses;
      if (base.hair.style === "bald" || base.hair.style === "receding" || base.hair.style === "buzz") base.hair = { ...base.hair, style: r(58) < 0.5 ? "side" : "curly", color: pick(r, 59, HAIRC) };
      break;
    case "medieval": base.top = { style: "sweater", color: pick(r, 29, ["#7a5a3a", "#5d6a3a", "#8c3b4a", "#6b6255"] as const) }; base.legs = pick(r, 30, ["#4a4036", "#5a4636"] as const); base.shoes = "#3a2b20"; break;
  }
  return base;
};
export const crowd = (n: number, era: Era = "modern", start = 0) => Array.from({ length: n }, (_, k) => extra(start + k, era));
