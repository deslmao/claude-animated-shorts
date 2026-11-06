// A world that can host several sets (stage 1D / 1E): each set is built the first time a shot needs it, only the
// current shot's set is visible, and the shared sky / light rig switches per shot (indoor sets hide sky and clouds).
// Shots choose set + light + camera; a director callback stages the cast and effects for each frame.
import * as THREE from "three";
import { Environment, sunFor, LightName } from "./environment";
import { CardLayer, Stage, CamInfo, ActorAnchor } from "../cards/cards";
import { SETS, TEST_SETS } from "../sets";
import type { BuiltSet, View } from "../sets/types";
import { runKeys, Key, meanView, kickAt, withKick, V3 } from "../camera/keys";
import type { FrameInfo, StudioWorld } from "../look/StudioFilm";
import { PROPS, PropRig } from "../props/registry";
import { Batch } from "../materials/geo";
import type { At } from "../props/kit";

/** props: story props shown in this shot only (built the first time the shot is drawn) */
/** shutter: camera motion blur exposure in frames (0.5 = a 180-degree shutter), or a function of the frame (less on
 *  close-ups, full on flights); absent = none */
export type WorldShot = { id: number; a: number; b: number; set: string; light: LightName; keys: Key[]; dof: (f: number) => { cInf: number; focus?: V3 }; kicks?: [number, number][]; shutter?: number | ((f: number) => number); shutterCap?: (f: number) => number;
  props?: { id: string; variant?: string; at: At; animate?: (tt: number, anchors: Map<string, ActorAnchor>) => { target?: V3; stroke: number; step?: number } }[] };
export type Director = (shot: WorldShot, f: number, cam: CamInfo, built: BuiltSet, out: Stage) => void;

export class SetWorld implements StudioWorld {
  root = new THREE.Group();
  private env = new Environment();
  private cards: CardLayer;
  private sets = new Map<string, BuiltSet>();
  private suns = new Map<number, THREE.Vector3>();
  private props = new Map<number, THREE.Group>();
  /** clearShots: keep every shot's camera path clear of props (storyboard films, whose cameras are solved, not designed) */
  /** stable: engine 2 card canvases (cards.ts Pool) */
  constructor(private shots: WorldShot[], private director: Director, private opts: { clearShots?: boolean; stable?: boolean } = {}) { this.cards = new CardLayer(this.root, { stable: opts.stable }); this.root.add(this.env.root); }

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
  /** this shot's story props: built once, visible only while the shot is drawn. A prop with a rig (registry) that the
   *  storyboard animates (follow / drive) is built as moving parts instead and posed every frame */
  private rigs = new Map<number, { inst: PropRig; animate: NonNullable<NonNullable<WorldShot["props"]>[number]["animate"]> }[]>();
  private shotProps(s: WorldShot) {
    if (s.props?.length && !this.props.has(s.id)) {
      const g = new THREE.Group(), b = new Batch(), rigs: { inst: PropRig; animate: NonNullable<NonNullable<WorldShot["props"]>[number]["animate"]> }[] = [];
      for (const p of s.props) {
        const e = PROPS[p.id];
        if (p.animate && e.rig) { const inst = e.rig(p.at, p.variant); g.add(inst.root); rigs.push({ inst, animate: p.animate }); }
        else if (p.variant && e.variants?.[p.variant]) e.variants[p.variant](b, p.at);
        else e.build(b, p.at, e.param ? p.variant : undefined);   // a parameter prop (a display's text) gets its value
      }
      b.build(g, true); this.props.set(s.id, g); this.rigs.set(s.id, rigs); this.root.add(g);
    }
    for (const [k, g] of this.props) g.visible = k === s.id;
  }
  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene): FrameInfo {
    const s = this.shots.find((x) => x.id === id) ?? this.shots[0], built = this.use(s.set);
    this.shotProps(s);
    const c = withKick(runKeys(s.keys, f), kickAt(s.kicks ?? [], f / 30));
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = new THREE.Vector3(...c.look), sun = this.sunOf(s, built);
    const L = this.env.apply(s.light, cam, focus, sun, scene);
    const pv = new THREE.Vector3();
    const info: CamInfo = { pos: cam.position, right: new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), sun, project: (p) => { pv.set(...p).project(cam); return [pv.x, pv.y]; } };
    const st: Stage = { places: [], fx: [] };
    this.director(s, f, info, built, st);
    // animated props pose AFTER the actors: they reach for where the hands really are this frame
    for (const r of this.rigs.get(s.id) ?? []) r.inst.update({ ...r.animate((f - s.a) / 30, st.anchors ?? new Map()), camPos: cam.position });
    this.cards.render(st, cam, L.actorShadow);
    const d = s.dof(f);
    const exp = typeof s.shutter === "function" ? s.shutter(f) : s.shutter ?? 0;
    return { target: focus, cInf: d.cInf, focus: d.focus ? new THREE.Vector3(...d.focus) : undefined, grade: s.light, ...(exp > 0 ? { shutter: { ...this.shutterOf(s, f, exp), ...(s.shutterCap ? { cap: s.shutterCap(f) } : {}) } } : {}) };
  }
  /** the camera's view matrix and fov at the shutter's open and close around frame f (the projection is built at
   *  draw time with the canvas's real aspect). A hard cut inside the shutter closes it at the cut (never a smear
   *  between two framings); the shot's edges likewise */
  private shutterOf(s: WorldShot, f: number, exp: number) {
    const h = exp / 2;
    let lo = Math.max(s.a, f - h), hi = Math.min(s.b - 1, f + h);
    for (const k of s.keys.slice(1)) if (k.cut) { if (k.f > lo && k.f <= f) lo = k.f; if (k.f > f && k.f <= hi) hi = k.f - 1e-3; }
    const vp = (fr: number) => {
      const c = withKick(runKeys(s.keys, fr), kickAt(s.kicks ?? [], f / 30)), m = this.shutCam;
      m.position.set(...c.pos); m.up.set(0, 1, 0); m.lookAt(...c.look); m.rotateZ(c.roll);
      m.updateMatrixWorld();
      return { view: m.matrixWorldInverse.clone(), fov: c.fov };
    };
    return { open: vp(lo), close: vp(hi) };
  }
  private shutCam = new THREE.PerspectiveCamera(40, 9 / 16, 0.1, 1500);
}
