// Floor queries (stage 3C) on the generated floor maps (floor.gen.ts, `npm run floor-map`): is there room for a person
// or a prop here? Used by crowd placement, story props and the validator.
import { FLOOR_MAPS, FloorMap } from "./floor.gen";

const cache = new Map<string, Uint8Array>();
const decode = (m: FloorMap) => {
  const out = new Uint8Array(m.w * m.h);
  let i = 0;
  for (const [, k, n] of m.rle.matchAll(/([of])(\d+)/g)) { const v = k === "o" ? 1 : 0, c = +n; out.fill(v, i, i + c); i += c; }
  return out;
};
const grid = (set: string) => {
  const m = FLOOR_MAPS[set];
  if (!m) return null;
  let g = cache.get(set);
  if (!g) { g = decode(m); cache.set(set, g); }
  return { m, g };
};

/** true when a circle of `radius` metres around (x, z) is clear floor (inside the mapped area, nothing standing there) */
export const clearAt = (set: string, x: number, z: number, radius = 0.35) => {
  const q = grid(set);
  if (!q) return true; // a set without a map (e.g. a test set): no information, don't block
  const { m, g } = q, r = Math.ceil(radius / m.cell);
  const cx = Math.floor((x - m.x0) / m.cell), cz = Math.floor((z - m.z0) / m.cell);
  for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
    if (dx * dx + dz * dz > r * r + 1) continue;
    const gx = cx + dx, gz = cz + dz;
    if (gx < 0 || gz < 0 || gx >= m.w || gz >= m.h || g[gz * m.w + gx]) return false;
  }
  return true;
};

export const hasFloorMap = (set: string) => !!FLOOR_MAPS[set];
