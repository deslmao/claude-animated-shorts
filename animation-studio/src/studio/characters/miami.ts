// The Miami cast (an original sunny 80s-Miami-style city of our own; never game characters or lookalikes).
// Named by the owner on 23 Nov 2026: Gordon and Lucy.
import type { Look } from "./figure";

/** Gordon: a backwards teal snapback, shades with a pink sheen, an open coral palm-print shirt
 *  over a white tee, cream trousers, white sneakers */
export const MIAMI_GORDON: Look = {
  name: "Gordon", build: "adult", skin: "#c98f63", seed: 61,
  hair: { style: "short", color: "#2a1c18" },
  hat: { style: "snapback", color: "#2fb5a7", trim: "#f2f0e6" },
  glasses: { style: "shades", color: "#ff9ccf" },
  top: { style: "tee", color: "#f6f1e6" },
  layer: { style: "openShirt", color: "#ff8a6a", accent: "#2f8f5f" },
  legs: "#efe2c8", shoes: "#f7f7f2",
};
/** Lucy: big dark curls under a white cap, a pink denim jacket over a sunny yellow tee, dark
 *  jeans, white sneakers */
export const MIAMI_LUCY: Look = {
  name: "Lucy", build: "petite", skin: "#8a5a3c", seed: 62,
  hair: { style: "afro", color: "#1f1412" },
  hat: { style: "cap", color: "#f7f3ea" },
  lashes: true,
  top: { style: "tee", color: "#ffe27a" },
  layer: { style: "denim", color: "#f29ac0", accent: "#c56f97" },
  legs: "#2f3a66", shoes: "#ffffff",
};
