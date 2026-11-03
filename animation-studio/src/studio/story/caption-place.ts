// Caption placement (stage 2): captions never cover a face. For every shot the camera is solved at its start, middle
// and end, every actor's head (chin to crown) is projected into the 9:16 frame, and the captions take the first
// standard height that clears all of them: lower-middle (the reference position), a little lower, a little higher,
// then above the heads, then low over the body. If a face fills the frame (an extreme close-up), the captions at least
// keep clear of every mouth (chin to nose). Pure: computed once from the storyboard, identical in every render chunk.
import * as THREE from "three";
import { runKeys } from "../camera/keys";
import { actorPos, FPS } from "./compile";
import type { compile } from "./compile";
import type { CaptionGroup } from "./caption-timing";

type Film = ReturnType<typeof compile>;
/** caption centre heights, fraction of the 1920 px frame height, in order of preference */
export const CAPTION_YS = [0.643, 0.72, 0.57, 0.3, 0.22, 0.15, 0.8];
const BAND = 0.04; // half-height of a caption line incl. outline + margin, fraction of the frame height

/** per shot: the caption centre height (fraction of the frame height) */
export const captionHeights = (film: Film): number[] => film.timing.sb.shots.map((s, i) => {
  const shot = film.shots[i], faces: [number, number][] = [], mouths: [number, number][] = [];
  for (const f of [shot.a, Math.round((shot.a + shot.b) / 2), shot.b - 1]) {
    const c = runKeys(shot.keys, f), cam = new THREE.PerspectiveCamera(c.fov, 9 / 16, 0.05, 3000);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    for (const a of s.actors) {
      if (a.back || a.crowd) continue; // seen from behind (over-the-shoulder) / background extras: no face to keep clear
      const m = actorPos(s.set, a, (f - shot.a) / FPS), ys: number[] = [], xs: number[] = [];
      for (const dx of [-0.3, 0.3]) for (const y of [1.2, 1.55, 1.95]) {
        const v = new THREE.Vector3(m[0], m[1] + y, m[2]).addScaledVector(right, dx).project(cam);
        if (v.z > 1) continue;
        ys.push((1 - v.y) / 2); xs.push(v.x);
      }
      if (ys.length < 6 || Math.max(...xs) < -1 || Math.min(...xs) > 1) continue; // behind the camera / out of frame
      faces.push([Math.min(...ys), Math.max(...ys)]);
      const my = [ys[0], ys[1], ys[3], ys[4]]; mouths.push([Math.min(...my), Math.max(...my)]); // chin (1.2 m) to nose (1.55 m)
    }
  }
  const clear = (boxes: [number, number][]) => CAPTION_YS.find((y) => boxes.every(([t, b]) => y + BAND < t || y - BAND > b));
  return clear(faces) ?? clear(mouths) ?? CAPTION_YS[0];
});

/** give every caption group the height of the shot it starts in */
export const placeCaptions = (film: Film, groups: CaptionGroup[]): CaptionGroup[] => {
  const hs = captionHeights(film);
  return groups.map((g) => ({ ...g, y: hs[Math.max(0, film.shots.findIndex((s) => g.f0 >= s.a && g.f0 < s.b))] }));
};
