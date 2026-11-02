// Stage 1C check: tour of one set (inputProps { set: "home" | ... }). Frame k = view k under each of the set's lights,
// with the cast standing on the set's marks for scale. Used to make the environment preview sheets.
import React from "react";
import * as THREE from "three";
import { getInputProps } from "remotion";
import { StudioFilm, StudioWorld, Timeline } from "../look/StudioFilm";
import { Environment, sunFor, LightName } from "../scene/environment";
import { CardLayer, Stage, CamInfo } from "../cards/cards";
import { lookCard, contactShadow } from "../cards/person";
import { V } from "../materials/geo";
import { MILO, JUNO, GUS, extra } from "../characters/cast";
import { act, Act, Look } from "../characters/figure";
import { SETS } from "../sets";
import { View } from "../sets/types";

const setId = () => ((getInputProps() as { set?: string }).set ?? "home");
export const tourShots = (id: string) => { const d = SETS[id]; const views = d.build().views; return d.lights.flatMap((light) => views.map((v) => ({ light, v }))); };

class TourWorld implements StudioWorld {
  root = new THREE.Group();
  private env: Environment;
  private cards = new CardLayer(this.root);
  private shots: { light: LightName; v: View }[];
  private spots: Record<string, [number, number, number]>;
  private sunTweak?: { az?: number; el?: number };
  constructor(id: string) {
    const built = SETS[id].build();
    this.env = new Environment(built.env);
    this.root.add(this.env.root, built.root);
    this.spots = built.spots;
    this.sunTweak = built.sun;
    this.shots = SETS[id].lights.flatMap((light) => built.views.map((v) => ({ light, v })));
  }
  update(shot: number, _f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const { light, v } = this.shots[(shot - 1) % this.shots.length];
    cam.position.set(...v.pos); cam.up.set(0, 1, 0); cam.lookAt(...v.look); cam.rotateZ(v.roll ?? 0);
    cam.fov = v.fov ?? 40; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...v.look), sun = sunFor(v.look[0] - v.pos[0], v.look[2] - v.pos[2], light, this.sunTweak);
    const L = this.env.apply(light, cam, focus, sun, scene);
    const info: CamInfo = { pos: cam.position, right: V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), sun };
    const st: Stage = { places: [], fx: [] };
    const cast: [string, Look, Act][] = [["a", MILO, "explain"], ["b", JUNO, "thinking"], ["c", GUS, "happy"], ["d", extra(31), "neutral"], ["e", extra(57), "suspicious"]];
    for (const [k, look, a] of cast) {
      const p = this.spots[k]; if (!p) continue;
      const facing = (Math.sign(cam.position.x - p[0]) || 0) as -1 | 0 | 1;
      st.places.push(lookCard(info, look, p[0], p[1], p[2], { pose: act(a, { t: 0.5, facing }) }));
      contactShadow(st, sun, light, p[0], p[1], p[2]);
    }
    this.cards.render(st, cam, L.actorShadow);
    return { target: focus, cInf: v.cInf ?? 0, focus: v.focus ? V(...v.focus) : undefined, grade: light === "golden" ? "golden" : "day" } as const;
  }
}

const load = () => Promise.resolve(true);
export const SetTour: React.FC = () => {
  const id = setId();
  const timeline: Timeline = { total: 64, layersAt: (f) => [{ id: f + 1, alpha: 1 }] };
  const makeWorld = React.useCallback(() => new TourWorld(id), [id]);
  return <StudioFilm timeline={timeline} makeWorld={makeWorld} load={load} background="#20202a" />;
};
