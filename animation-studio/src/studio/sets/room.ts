// Room shell builder for interior sets: floor, three walls (back z-, left x-, right x+; the camera side z+ stays
// open), ceiling, skirting + cornice trim, real window openings (frame, mullions, sill) with a painted outside view
// behind them, and an optional door. Walls / ceiling are built with castShadow OFF so the high "window" key lights the
// floor and props through them (look/lights.ts interior), props keep their own grounded shadows.
import * as THREE from "three";
import { Batch, V, quad } from "../materials/geo";
import { windowViewHD, ceilingHD, ceilingTilesHD } from "../materials/paint2";
import { col, glow, box } from "../props/kit";

/** at = world x (back wall) or world z (side walls) of the opening centre */
export type Opening = { wall: "back" | "left" | "right"; at: number; w: number; h: number; sill: number; kind?: "window" | "door"; view?: "garden" | "city" | "campus" };
export type RoomSpec = { w: number; d: number; h: number; floor: THREE.Material; wall: THREE.Material; lower?: THREE.Material; lowerH?: number;
  trim?: string; ceiling?: string; tiles?: boolean; openings?: Opening[] };

const T = 0.15; // wall thickness
const ZF = 0.002; // gap that keeps hidden surfaces out of a visible surface's plane (depth precision at 6 m: ~0.02 mm)
/** a wall slab along its own x (length L, height H) with rectangular holes; returns boxes in wall-local coords */
const slabs = (L: number, H: number, holes: { x0: number; x1: number; y0: number; y1: number }[]) => {
  const out: [number, number, number, number][] = []; // x0 x1 y0 y1
  const xs = [0, L, ...holes.flatMap((h) => [h.x0, h.x1])].sort((a, b) => a - b);
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1]; if (b - a < 1e-3) continue;
    const mid = (a + b) / 2, hs = holes.filter((h) => mid > h.x0 && mid < h.x1).sort((p, q) => p.y0 - q.y0);
    let y = 0;
    for (const h of hs) { if (h.y0 > y) out.push([a, b, y, h.y0]); y = h.y1; }
    if (y < H) out.push([a, b, y, H]);
  }
  return out;
};

export const buildRoom = (root: THREE.Object3D, s: RoomSpec) => {
  const walls = new Batch(), detail = new Batch();
  const hw = s.w / 2, hd = s.d / 2, trim = col(s.trim ?? "#f3ede2");
  // floor (texture 2 m tiles)
  walls.add(quad(V(-hw - 2, 0, hd + 4), V(hw + 2, 0, hd + 4), V(hw + 2, 0, -hd), V(-hw - 2, 0, -hd), (s.w + 4) / 2, (s.d + 4) / 2), s.floor);
  // ceiling
  // ceiling: always faces away from the key, so it is a warm unlit bounce colour instead of a shaded (lilac) surface
  walls.add(quad(V(-hw, s.h, -hd), V(hw, s.h, -hd), V(hw, s.h, hd + 4), V(-hw, s.h, hd + 4)), glow("ceil" + (s.ceiling ?? "#e3d2b4") + !!s.tiles, () => { const t = s.tiles ? ceilingTilesHD(s.ceiling ?? "#e3dccd").clone() : ceilingHD(s.ceiling ?? "#e3d2b4"); if (s.tiles) { t.repeat.set(s.w / 4.8, (s.d + 4) / 4.8); t.needsUpdate = true; } return { map: t }; }));
  const sides = [
    { id: "back", L: s.w, m: new THREE.Matrix4().makeTranslation(-hw, 0, -hd) },                                   // along +x, faces +z
    { id: "left", L: s.d + 4, m: new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(-hw, 0, hd + 4) },   // along -z, faces +x
    { id: "right", L: s.d + 4, m: new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(hw, 0, -hd) },     // along +z, faces -x
  ] as const;
  for (const sd of sides) {
    const ops = (s.openings ?? []).filter((o) => o.wall === sd.id);
    // opening.at is a WORLD coordinate along the wall: x for the back wall, z for the side walls
    const lx = (o: Opening) => (sd.id === "back" ? o.at + hw : sd.id === "left" ? hd + 4 - o.at : o.at + hd);
    const holes = ops.map((o) => ({ x0: lx(o) - o.w / 2, x1: lx(o) + o.w / 2, y0: o.sill, y1: o.sill + o.h }));
    for (const [x0, x1, y0, y1] of slabs(sd.L, s.h, holes)) {
      const lowerH = s.lowerH ?? 0;
      if (s.lower && y0 < lowerH) {
        walls.add(quad(V(x0, y0, 0), V(x1, y0, 0), V(x1, Math.min(y1, lowerH), 0), V(x0, Math.min(y1, lowerH), 0), (x1 - x0) / 1, (Math.min(y1, lowerH) - y0) / 1), s.lower, sd.m);
        if (y1 > lowerH) walls.add(quad(V(x0, lowerH, 0), V(x1, lowerH, 0), V(x1, y1, 0), V(x0, y1, 0), (x1 - x0) / 2, (y1 - lowerH) / 2), s.wall, sd.m);
      } else walls.add(quad(V(x0, y0, 0), V(x1, y0, 0), V(x1, y1, 0), V(x0, y1, 0), (x1 - x0) / 2, (y1 - y0) / 2), s.wall, sd.m);
      // wall thickness: a box BEHIND the face so openings show depth. Its front stops ZF short of the face: when the two
      // shared a plane they z-fought, and the wall flickered between wallpaper and plain beige on camera moves
      // (Short-tickle run 11). npm run test:zfight checks every set for coplanar surfaces.
      walls.add(new THREE.BoxGeometry(x1 - x0 - 2 * ZF, y1 - y0 - 2 * ZF, T - ZF).translate((x0 + x1) / 2, (y0 + y1) / 2, -(T + ZF) / 2), col("#d9d2c4"), sd.m);
    }
    // skirting + cornice + chair rail
    box(detail, trim, sd.m, 0, sd.L, 0, 0.12, 0, 0.025);
    box(detail, trim, sd.m, 0, sd.L, s.h - 0.1, s.h, 0, 0.04);
    if (s.lower && s.lowerH) box(detail, trim, sd.m, 0, sd.L, s.lowerH - 0.03, s.lowerH + 0.03, 0, 0.035);
    holes.forEach((h, i) => {
      const o = ops[i], cx = (h.x0 + h.x1) / 2;
      if ((o.kind ?? "window") === "window") {
        // frame, mullions, deep sill; outside view 3 m behind the wall (unlit, bright)
        for (const [a0, a1, b0, b1] of [[h.x0 - 0.08, h.x0, h.y0, h.y1], [h.x1, h.x1 + 0.08, h.y0, h.y1], [h.x0 - 0.08, h.x1 + 0.08, h.y1, h.y1 + 0.08]])
          box(detail, trim, sd.m, a0, a1, b0, b1, -0.02, 0.04);
        box(detail, trim, sd.m, h.x0 - 0.12, h.x1 + 0.12, h.y0 - 0.06, h.y0, -0.12, 0.12);
        box(detail, trim, sd.m, cx - 0.03, cx + 0.03, h.y0, h.y1, -0.1, -0.05);
        box(detail, trim, sd.m, h.x0, h.x1, (h.y0 + h.y1) / 2 - 0.03, (h.y0 + h.y1) / 2 + 0.03, -0.1, -0.05);
        const vw = (h.x1 - h.x0) + 14, vh = (h.y1 - h.y0) + 6; // big enough for steep angles through the opening
        detail.add(new THREE.PlaneGeometry(vw, vh).translate(cx, (h.y0 + h.y1) / 2 + 0.6, -3), glow("view" + (o.view ?? "garden"), () => ({ map: windowViewHD(o.view ?? "garden") })), sd.m);
      } else {
        // door: frame + painted panel door slightly open
        for (const [a0, a1, b0, b1] of [[h.x0 - 0.1, h.x0, 0, h.y1], [h.x1, h.x1 + 0.1, 0, h.y1], [h.x0 - 0.1, h.x1 + 0.1, h.y1, h.y1 + 0.1]]) box(detail, trim, sd.m, a0, a1, b0, b1, -0.02, 0.05);
        box(detail, col("#8a5a3c"), sd.m, h.x0 + 0.02, h.x1 - 0.02, 0.01, h.y1 - 0.02, -0.12, -0.08);
        for (const yy of [0.35, 1.25]) box(detail, col("#7a4f33"), sd.m, h.x0 + 0.15, h.x1 - 0.15, yy, yy + 0.6, -0.08, -0.06);
        box(detail, col("#c9a24e"), sd.m, h.x1 - 0.18, h.x1 - 0.12, 1.0, 1.06, -0.06, -0.02);
      }
    });
  }
  walls.build(root, false);
  detail.build(root, false);
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) m.receiveShadow = true; });
};
