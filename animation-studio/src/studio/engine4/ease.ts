// Engine 4 easing, in its own file so theme modules can use it without importing the character library (an import cycle).
/** fast-out slow-in with a small overshoot that settles: 0 at u 0, ~1.05 near u 0.62, 1 at u 1 (a back-ease-out) */
export const easeSnap = (u: number, over = 1.0): number => {
  if (u <= 0) return 0; if (u >= 1) return 1;
  const x = u - 1, c = 1.15 * over;
  return 1 + (c + 1) * x * x * x + c * x * x;
};
