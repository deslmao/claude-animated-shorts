// The creator's sight-line rule (bridge build.ts inTheWay), simplified for designed views: a prop is left out when it
// would stand inside the near part of any view's frustum (it would block or crop the shot at the lens: "green balls",
// cut-off poles). Wedge test in plan view: along the view axis 0.2..maxD m, within half-width w0 + along * k.
import { View } from "./types";

export const clearOf = (views: View[], x: number, z: number, r = 0.5, maxD = 5) => {
  for (const v of views) {
    const dx = v.look[0] - v.pos[0], dz = v.look[2] - v.pos[2], L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L;
    const px = x - v.pos[0], pz = z - v.pos[2], along = px * ux + pz * uz, lat = Math.abs(px * uz - pz * ux);
    const k = Math.tan(((v.fov ?? 40) * Math.PI) / 360) * 0.62; // half the horizontal fov of a 9:16 frame
    if (along > -r && along < maxD && lat < r + 0.25 + Math.max(0, along) * k) return false;
  }
  return true;
};
