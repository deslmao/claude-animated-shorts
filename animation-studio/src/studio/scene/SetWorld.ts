// A world that can host several sets (stage 1D / 1E): each set is built the first time a shot needs it, only the
// current shot's set is visible, and the shared sky / light rig switches per shot (indoor sets hide sky and clouds).
// Shots choose set + light + camera; a director callback stages the cast and effects for each frame.
import * as THREE from "three";
import { Environment, sunFor, LightName } from "./environment";
import { CardLayer, Stage, CamInfo } from "../cards/cards";
import { SETS, TEST_SETS } from "../sets";
import type { BuiltSet, View } from "../sets/types";
import { runKeys, Key, meanView, kickAt, withKick, V3 } from "../camera/keys";
import type { FrameInfo, StudioWorld } from "../look/StudioFilm";

export type WorldShot = { id: number; a: number; b: number; set: string; light: LightName; keys: Key[]; dof: (f: number) => { cInf: number; focus?: V3 }; kicks?: [number, number][] };
export type Director = (shot: WorldShot, f: number, cam: CamInfo, built: BuiltSet, out: Stage) => void;

export class SetWorld implements StudioWorld {
  root = new THREE.Group();
  private env = new Environment();
  private cards = new CardLayer(this.root);
  private sets = new Map<string, BuiltSet>();
  private suns = new Map<number, THREE.Vector3>();
  /** clearShots: keep every shot's camera path clear of props (storyboard films, whose cameras are solved, not designed) */
  constructor(private shots: WorldShot[], private director: Director, private opts: { clearShots?: boolean } = {}) { this.root.add(this.env.root); }

  /** this film's camera positions on a set, sampled along each shot's move, as views the set keeps clear of props
   *  up to just short of what the camera looks at (a lamp post between lens and cast is left out of the build) */
  private camsOn(id: string): View[] | undefined {
    if (!this.opts.clearShots) return undefined;
    const out: View[] = [];
    for (const s of this.shots) if (s.set === id) for (let i = 0; i <= 4; i++) {
      const c = runKeys(s.keys, Math.round(s.a + ((s.b - 1 - s.a) * i) / 4)), d = Math.hypot(c.look[0] - c.pos[0], c.look[2] - c.pos[2]);
      out.push({ name: `shot${s.id}.${i}`, pos: c.pos, look: c.look, fov: c.fov, clearD: Math.max(1, d - 0.9) });
    }
    return out;
  }
  private use(id: string) {
    let s = this.sets.get(id);
    if (!s) { s = (SETS[id] ?? TEST_SETS[id]).build(this.camsOn(id)); this.sets.set(id, s); this.root.add(s.root); }
    for (const [k, v] of this.sets) v.root.visible = k === id;
    this.env.setSky(s.env.sky !== false, s.env.clouds !== false);
    return s;
  }
  private sunOf(s: WorldShot, built: BuiltSet) {
    let v = this.suns.get(s.id);
    if (!v) { const [fx, fz] = meanView(s.keys, s.a, s.b); v = sunFor(fx, fz, s.light, built.sun); this.suns.set(s.id, v); }
    return v;
  }
  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): FrameInfo {
    const s = this.shots.find((x) => x.id === id) ?? this.shots[0], built = this.use(s.set);
    const c = withKick(runKeys(s.keys, f), kickAt(s.kicks ?? [], f / 30));
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = new THREE.Vector3(...c.look), sun = this.sunOf(s, built);
    const L = this.env.apply(s.light, cam, focus, sun, scene);
    const info: CamInfo = { pos: cam.position, right: new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), sun };
    const st: Stage = { places: [], fx: [] };
    this.director(s, f, info, built, st);
    this.cards.render(st, cam, L.actorShadow);
    const d = s.dof(f);
    return { target: focus, cInf: d.cInf, focus: d.focus ? new THREE.Vector3(...d.focus) : undefined, grade: s.light };
  }
}
