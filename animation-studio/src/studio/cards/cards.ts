// 2D cards in the 3D world (from the bridge's cast.ts + the end of world.ts update()): every character and effect is
// drawn on a canvas (characters/toon.ts) and stood in the scene as a card. Characters are yaw-only billboards lit by
// cardShade() (scene tint, bright floor, side gradient toward the sun); effects are unlit cards (cut-out, soft, or a
// multiply ground blob). All cards live on the NOINK layer: the world ink pass never outlines their rectangles.
//
// Determinism (needed for chunked cloud renders): a card is cached under a key, and the drawing must depend ONLY on
// what the key encodes. Build keys with cardKey() from the exact options object you draw with.
import * as THREE from "three";
import { Pen } from "../characters/toon";
import { NOINK } from "../look/ink";
import { cardShade, blobMaterial, CARD_K } from "../look/cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

/** stable cache key from an options object: numbers rounded to 1/n. Draw from cardOpts(sameObject) so the drawing
 *  uses exactly the rounded values the key encodes. */
export const cardKey = (o: object, n = 120) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? Math.round(v * n) / n : v));
export const cardOpts = <T extends object>(o: T, n = 120): T => JSON.parse(cardKey(o, n));

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m (character design canvas 600 x 1000, soles at y 975)
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);

/** lit flat character card */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false;
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false;
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    } else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
/** a character card in the world. size = [canvas w, h, scale from the 600 x 1000 design]; geo lets a card use a
 *  custom plane (e.g. a swing); yaw defaults to facing the camera */
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; roll?: number; size?: [number, number, number]; geo?: THREE.BufferGeometry; castShadow?: boolean;
};
/** an effect card: w x h metres; flat = lying on the ground; soft = see-through; keys containing "|blob|" multiply */
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** where an actor's head and hands are this frame, in the world (the director fills it; effects, props that touch an
 *  actor and the storyboard checks read it). headR = head half-width / half-height in metres; rot = head tilt (radians,
 *  screen-clockwise as drawn, already mirrored) */
export type ActorAnchor = { head: [number, number, number]; crown: [number, number, number]; headR: [number, number]; rot: number;
  hands: { p: [number, number, number]; raised: boolean; side: number; kind: string }[]; chest: [number, number, number]; floor: [number, number, number]; mirror: boolean; gesture: string; walking?: boolean };
export type Stage = { places: Place[]; fx: FxPlace[]; anchors?: Map<string, ActorAnchor> };
/** what a stage builder needs to know about the camera and light this frame (sun = world direction TOWARD the sun) */
/** project = world point -> normalised screen x / y (-1..1 inside the 9:16 frame), when the camera is known */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3; project?: (p: [number, number, number]) => [number, number] };

/** draws a Stage: reuses card meshes, culls off-screen cards, then draws only the canvases that changed */
export class CardLayer {
  private pool = new Pool();
  private actors: Actor[] = [];
  private custom = new Map<THREE.BufferGeometry, Actor>();
  private fxs: Fx[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();
  constructor(private root: THREE.Object3D) {}
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }
  private customActor(geo: THREE.BufferGeometry) { let a = this.custom.get(geo); if (!a) { a = new Actor(this.root, geo); this.custom.set(geo, a); } return a; }

  /** castShadows: cards throw real shadows (golden light); by day they get contact blobs instead */
  render(st: Stage, cam: THREE.PerspectiveCamera, castShadows: boolean) {
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used = new Set<Actor>();
    for (const p of st.places) {
      const sc = p.scale ?? 1;
      if (!p.geo && !this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc, p.z), 3.5 * sc))) continue;
      const a = p.geo ? this.customActor(p.geo) : this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc : sc, sc, sc);
      a.mesh.castShadow = p.castShadow ?? castShadows;
      used.add(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    for (const a of this.custom.values()) if (!used.has(a)) a.mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
  }
}
