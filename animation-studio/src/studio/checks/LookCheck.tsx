// Stage 1A check: the bridge's own world rendered through the studio's StudioFilm (studio/look copies of ink, lens
// blur, bloom, tone map, grade). Its frames must be pixel-identical to BridgeShort's: proof that the reusable post
// chain is exactly the creator's. Not part of any video.
import React from "react";
import * as THREE from "three";
import { StudioFilm, StudioWorld, Timeline } from "../look/StudioFilm";
import { World, loadKit } from "../../videos/bridge/world";
import { Kit } from "../../videos/bridge/build";
import { TOTAL, FLASH_AT, SHOTS, layersAt, dofAt } from "../../videos/bridge/story";

const timeline: Timeline = { total: TOTAL, layersAt, flashes: [FLASH_AT] };
const makeWorld = (kit: Kit): StudioWorld => {
  const w = new World(kit);
  return {
    root: w.root,
    update: (id, f, cam, scene) => {
      const target = w.update(id, f, cam, scene).clone();
      const d = dofAt(f);
      return { target, cInf: d.cInf, focus: d.focus ? new THREE.Vector3(...d.focus(f)) : undefined, grade: SHOTS[id - 1].light };
    },
  };
};
export const LOOKCHECK_FRAMES = TOTAL;
export const LookCheck: React.FC = () => <StudioFilm timeline={timeline} makeWorld={makeWorld} load={loadKit} />;
