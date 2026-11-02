// Stage 1A check: a small scene built ONLY from studio modules (environment, painted materials, cards, camera keys,
// StudioFilm). Shot 1 day, crossfade to shot 2 golden. Proves the foundation works without any bridge code.
import React from "react";
import * as THREE from "three";
import { StudioFilm, StudioWorld, Timeline } from "../look/StudioFilm";
import { Environment, sunFor, LightName } from "../scene/environment";
import { CardLayer, Stage, CamInfo } from "../cards/cards";
import { personCard, contactShadow, lidAt } from "../cards/person";
import { Key, runKeys, dolly, pushK, meanView } from "../camera/keys";
import { Batch, V, lam, quadUp, boxGeo } from "../materials/geo";
import { grassHD, cobbleHD, stoneHD, planksHD, beamHD } from "../materials/paint";
import { townsfolk, KID } from "../characters/toon";

const FPS = 30, TOTAL = 180;
type ShotDef = { id: number; a: number; b: number; light: LightName; keys: Key[]; cInf: number };
const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 92, light: "day", cInf: 11, keys: [{ f: 0, s: (f) => dolly([1.6, 1.55, 6.2], [0, 1.25, 0], pushK(f, 0, 0.0025), { fov: 38 }) }] },
  { id: 2, a: 92, b: TOTAL, light: "golden", cInf: 6, keys: [{ f: 84, s: (f) => dolly([5.2, 0.9, 3.8], [0, 1.25, -0.2], pushK(f, 84, 0.002), { fov: 40, roll: 0.03 }) }] },
];
const XF = 8;
const timeline: Timeline = {
  total: TOTAL,
  layersAt: (f) => {
    const s2 = SHOTS[1];
    if (f >= s2.a - XF / 2 && f < s2.a + XF / 2) return [{ id: 1, alpha: 1 }, { id: 2, alpha: (f - (s2.a - XF / 2) + 1) / (XF + 1) }];
    return [{ id: f < s2.a ? 1 : 2, alpha: 1 }];
  },
};

class TestWorld implements StudioWorld {
  root = new THREE.Group();
  private env = new Environment();
  private cards = new CardLayer(this.root);
  private suns = new Map<number, THREE.Vector3>();
  constructor() {
    this.root.add(this.env.root);
    const b = new Batch();
    b.add(quadUp(-400, 400, -400, 400, 200, 200), lam("grassHD", () => ({ map: grassHD() })));
    b.add(quadUp(-1.6, 1.6, -60, 60, 0.8, 30, 0.012), lam("cobbleHD", () => ({ map: cobbleHD() })));
    const wall = lam("wallHD", () => ({ map: stoneHD("wallHD", ["#c9bcaa", "#bfb19f", "#d1c5b4", "#b8aa97"], "#958776") }));
    b.add(boxGeo(V(-3.2, 0, -30), V(-2.6, 0.9, 30), 2), wall);
    b.add(boxGeo(V(-3.3, 0.9, -30), V(-2.5, 1.0, 30), 2), lam("copeHD", () => ({ map: stoneHD("copeHD", ["#e6dccd", "#ddd3c3", "#ece4d6", "#d6cbba"], "#aea293") })));
    // a bench: plank seat + back on two beam legs
    const plank = lam("planksHD", () => ({ map: planksHD() })), beam = lam("beamHD", () => ({ map: beamHD() }));
    b.add(boxGeo(V(-2.45, 0.45, -1.6), V(-2.0, 0.5, 0.6), 0), plank);
    b.add(boxGeo(V(-2.5, 0.5, -1.6), V(-2.42, 0.95, 0.6), 0), plank);
    for (const z of [-1.4, 0.4]) b.add(boxGeo(V(-2.45, 0, z - 0.05), V(-2.0, 0.45, z + 0.05), 0), beam);
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
    // an adult strolling on the spot toward the lens, and a kid grinning next to them
    const ph = (t * 0.9) % 1;
    st.places.push(personCard(info, "adult", townsfolk(2), 0.35, 0, 0, { side: false, mirror: false },
      { mode: "stroll", phase: ph, expr: "smile", blink: lidAt(t, 1), look: -0.3 }, {}, 1, 3));
    contactShadow(st, sun, s.light, 0.35, 0, 0);
    st.places.push(personCard(info, "kid", KID, -0.6, 0, 0.3, { side: false, mirror: false },
      { mode: "stand", expr: t > 1.5 ? "grin" : "neutral", blink: lidAt(t, 2, [1.5]), look: 0.4 }, {}, 1, 5));
    contactShadow(st, sun, s.light, -0.6, 0, 0.3, 0.8);
    this.cards.render(st, cam, L.actorShadow);
    return { target: focus, cInf: s.cInf, focus: V(0, 1.45, 0), grade: s.light };
  }
}

const load = () => Promise.resolve(true);
const makeWorld = () => new TestWorld();
export const FOUNDATION_FRAMES = TOTAL;
export const FoundationTest: React.FC = () => <StudioFilm timeline={timeline} makeWorld={makeWorld} load={load} />;
