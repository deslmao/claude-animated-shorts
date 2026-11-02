// Stage 1B check: the recurring cast + extras as lit cards in the 3D world (day medium shot, day close-up, golden
// wide with extras walking past in profile). Verifies the characters under scene light, ink, lens blur and grade.
import React from "react";
import * as THREE from "three";
import { StudioFilm, StudioWorld, Timeline } from "../look/StudioFilm";
import { Environment, sunFor, LightName } from "../scene/environment";
import { CardLayer, Stage, CamInfo } from "../cards/cards";
import { lookCard, contactShadow, lidAt } from "../cards/person";
import { Key, runKeys, dolly, pushK, meanView } from "../camera/keys";
import { Batch, V, lam, quadUp, boxGeo } from "../materials/geo";
import { grassHD, cobbleHD, stoneHD } from "../materials/paint";
import { MILO, JUNO, GUS, extra } from "../characters/cast";
import { act, Act } from "../characters/figure";

const FPS = 30, TOTAL = 225;
type ShotDef = { id: number; a: number; b: number; light: LightName; keys: Key[]; cInf: number; focus: [number, number, number] };
const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 75, light: "day", cInf: 10, focus: [0, 1.5, 0], keys: [{ f: 0, s: (f) => dolly([0.3, 1.5, 6.8], [0, 1.25, 0], pushK(f, 0, 0.0025), { fov: 40 }) }] },
  { id: 2, a: 75, b: 150, light: "day", cInf: 13, focus: [-1.25, 1.75, 0.2], keys: [{ f: 75, s: (f) => dolly([-1.0, 1.7, 2.6], [-1.25, 1.62, 0.2], pushK(f, 75, 0.003), { fov: 36, roll: 0.03 }) }] },
  { id: 3, a: 150, b: TOTAL, light: "golden", cInf: 5, focus: [0, 1.3, 0], keys: [{ f: 150, s: (f) => dolly([4.6, 1.0, 6.5], [0, 1.25, 0], pushK(f, 150, 0.002), { fov: 42, roll: -0.03 }) }] },
];
const timeline: Timeline = {
  total: TOTAL,
  layersAt: (f) => {
    if (f >= 146 && f < 154) return [{ id: 2, alpha: 1 }, { id: 3, alpha: (f - 146 + 1) / 9 }];
    return [{ id: SHOTS.find((s) => f >= s.a && f < s.b)!.id, alpha: 1 }];
  },
};

class CastWorld implements StudioWorld {
  root = new THREE.Group();
  private env = new Environment();
  private cards = new CardLayer(this.root);
  private suns = new Map<number, THREE.Vector3>();
  constructor() {
    this.root.add(this.env.root);
    const b = new Batch();
    b.add(quadUp(-400, 400, -400, 400, 200, 200), lam("grassHD", () => ({ map: grassHD() })));
    b.add(quadUp(-30, 30, -2.2, 2.2, 15, 1.1, 0.012), lam("cobbleHD", () => ({ map: cobbleHD() })));
    const wall = lam("wallHD", () => ({ map: stoneHD("wallHD", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
    b.add(boxGeo(V(-30, 0, -4.6), V(30, 1.1, -4.0), 2), wall);
    b.build(this.root);
  }
  private sunOf(s: ShotDef) {
    let v = this.suns.get(s.id);
    if (!v) { const [fx, fz] = meanView(s.keys, s.a, s.b); v = sunFor(fx, fz, s.light); this.suns.set(s.id, v); }
    return v;
  }
  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const s = SHOTS[id - 1], t = f / FPS, c = runKeys(s.keys, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), sun = this.sunOf(s);
    const L = this.env.apply(s.light, cam, focus, sun, scene);
    const info: CamInfo = { pos: cam.position, right: V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0), sun };
    const st: Stage = { places: [], fx: [] };
    const who = (L0: typeof MILO, i: number, x: number, z: number, a: Act, facing: -1 | 0 | 1 = 0) => {
      st.places.push(lookCard(info, L0, x, 0, z, { pose: act(a, { blink: lidAt(t, i), t, facing }) }));
      contactShadow(st, sun, s.light, x, 0, z);
    };
    if (id === 1) { who(MILO, 1, -0.82, 0.25, t < 1.2 ? "explain" : "point", 1); who(JUNO, 2, 0.02, -0.15, "thinking"); who(GUS, 3, 0.86, 0.15, "laugh", -1); }
    if (id === 2) { who(MILO, 1, -1.25, 0.2, "shock", 1); who(JUNO, 2, 0, 0, "suspicious", -1); }
    if (id === 3) {
      who(JUNO, 2, -0.6, 0, "proud"); who(GUS, 3, 0.8, 0.2, "hello", -1);
      // extras strolling past in profile behind them (walk cycle 2 steps/s, 1.3 m/s)
      for (let k = 0; k < 4; k++) {
        const x = -6 + ((t - 5 + k * 2.6) * 1.3) % 12, z = -2.6 - (k % 2) * 0.7, ph = (t * 1.0 + k * 0.3) % 1;
        st.places.push(lookCard(info, extra(7 + k * 13), x, 0, z, { side: { mode: "walk", phase: ph, blink: lidAt(t, 20 + k) }, mirror: false }));
        contactShadow(st, sun, s.light, x, 0, z);
      }
    }
    this.cards.render(st, cam, L.actorShadow);
    return { target: focus, cInf: s.cInf, focus: V(...s.focus), grade: s.light };
  }
}
const load = () => Promise.resolve(true);
const makeWorld = () => new CastWorld();
export const CASTTEST_FRAMES = TOTAL;
export const CastTest: React.FC = () => <StudioFilm timeline={timeline} makeWorld={makeWorld} load={load} />;
