// Caption placement (stage 2): captions never cover a face. For every shot the camera is solved at its start, middle
// and end, every actor's head (chin to crown) is projected into the 9:16 frame, and the captions take the first
// standard height that clears all of them: lower-middle (the reference position), a little lower, a little higher,
// then above the heads, then low over the body. If no height clears every head (an extreme close-up, a presenter under
// a diagram), the captions keep clear of every face as drawn (brows to chin: eyes and mouth) and take the height that
// covers the least of the heads (so not the forehead when the body below is free). A tickled actor's point of contact
// and an explainer diagram are kept clear too. Pure: computed once from the storyboard, identical in every chunk.
import * as THREE from "three";
import { runKeys } from "../camera/keys";
import { actorPos, FPS, diagramMark, diagramY, lookOf, whereOf } from "./compile";
import { PROPS } from "../props/registry";
import { SU } from "../cards/cards";
import { anchorsFront } from "../characters/figure";
import type { compile } from "./compile";
import type { CaptionGroup } from "./caption-timing";

type Film = ReturnType<typeof compile>;
/** caption centre heights, fraction of the 1920 px frame height, in order of preference */
export const CAPTION_YS = [0.643, 0.72, 0.57, 0.3, 0.22, 0.15, 0.8];
const BAND = 0.04; // half-height of a caption line incl. outline + margin, fraction of the frame height

/** per shot: the caption centre height (fraction of the frame height) */
export const captionHeights = (film: Film): number[] => {
  // each character's head as drawn (brows, chin, crown heights in metres, from the neutral pose)
  const heads = new Map<string, { brow: number; chin: number; crown: number }>();
  const headOf = (who: string) => {
    let v = heads.get(who);
    if (!v) {
      const an = anchorsFront(lookOf(film.timing.sb.cast[who]), {}), y = (d: number) => (975 - d) * SU;
      v = { brow: y(an.head[1] - 0.45 * an.headR[1]), chin: y(an.head[1] + an.headR[1]), crown: y(an.crown[1]) };
      heads.set(who, v);
    }
    return v;
  };
  return film.timing.sb.shots.map((s, i) => {
  const shot = film.shots[i], faces: [number, number][] = [], mouths: [number, number][] = [], drawn: [number, number][] = [];
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
      const hd = headOf(a.who), at = (y: number) => (1 - new THREE.Vector3(m[0], m[1] + y, m[2]).project(cam).y) / 2;
      mouths.push([at(hd.brow), at(hd.chin)]);   // the face as drawn, brows to chin: eyes and mouth
      drawn.push([at(hd.crown), at(hd.chin)]);   // the head as drawn, crown to chin
      // the point of contact when someone reaches for an actor (tickles them, hands them something) or a machine follows
      // their hand is the action of the shot: captions keep clear of it too (when they can)
      if (s.actors.some((x) => x.reach === a.who) || (s.props ?? []).some((q) => q.follow?.who === a.who)) {
        const cs = [0.8, 1.3].map((y) => (1 - new THREE.Vector3(m[0], m[1] + y, m[2]).project(cam).y) / 2);
        faces.push([Math.min(...cs), Math.max(...cs)]);
      }
    }
    // a prop someone reaches for (a chest grabbed, a table written on): its top, where the hands meet, is kept clear too
    for (const q of s.props ?? []) {
      if (!s.actors.some((x) => x.reach === q.id)) continue;
      const w = whereOf(s.set, q.at), x = w[0] + (q.offset?.[0] ?? 0), z = w[2] + (q.offset?.[1] ?? 0), h = (PROPS[q.id]?.height ?? 0.6) * (q.scale ?? 1);
      const ys = [h - 0.15, h + 0.45].map((y) => (1 - new THREE.Vector3(x, w[1] + y, z).project(cam).y) / 2);
      faces.push([Math.min(...ys), Math.max(...ys)]);
    }
    // an explainer diagram is never covered either (it counts as a face and as a mouth)
    const dm = diagramMark(s);
    if (dm && s.diagram) {
      const h = (s.diagram.size ?? 0.95) / 2, cy = dm[1] + diagramY(s), ys = [cy - h, cy + h].map((y) => (1 - new THREE.Vector3(dm[0], y, dm[2]).project(cam).y) / 2);
      const box: [number, number] = [Math.min(...ys), Math.max(...ys)]; faces.push(box); mouths.push(box);
    }
  }
  const clear = (boxes: [number, number][]) => CAPTION_YS.find((y) => boxes.every(([t, b]) => y + BAND < t || y - BAND > b));
  // nothing clears every eye and mouth (a presenter under a diagram, a face filling the frame): the height that covers
  // the least of them (ties: the earlier, preferred height)
  const cover = (boxes: [number, number][], y: number) => boxes.reduce((n, [t, b]) => n + Math.max(0, Math.min(b, y + BAND) - Math.max(t, y - BAND)), 0);
  const least = (ys: number[], boxes: [number, number][]) => ys.reduce((best, y) => (cover(boxes, y) < cover(boxes, best) - 1e-6 ? y : best), ys[0]);
  // of the heights clear of every eye and mouth, the one that covers the least of the drawn heads (a forehead is
  // better left clear too); if none clears them, the one that covers the least of them
  const okMouth = CAPTION_YS.filter((y) => mouths.every(([t, b]) => y + BAND < t || y - BAND > b));
  return clear(faces) ?? (okMouth.length ? least(okMouth, drawn) : least(CAPTION_YS, mouths));
  });
};

/** give every caption group the height of the shot it starts in */
export const placeCaptions = (film: Film, groups: CaptionGroup[]): CaptionGroup[] => {
  const hs = captionHeights(film);
  return groups.map((g) => ({ ...g, y: hs[Math.max(0, film.shots.findIndex((s) => g.f0 >= s.a && g.f0 < s.b))] }));
};
