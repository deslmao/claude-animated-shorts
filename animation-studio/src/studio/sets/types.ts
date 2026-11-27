// A set = a reusable 3D place: geometry + named spots for actors + designed camera views + the lights it suits.
import * as THREE from "three";
import type { LightName, EnvOptions } from "../scene/environment";
import type { V3 } from "../camera/keys";

/** a designed camera framing (camera position, look point, lens), with suggested lens blur */
/** establishing = a place / insert shot that frames no actor on purpose */
/** clearD = how far along the view props are cleared (default: clearOf's maxD); used for storyboard cameras */
export type View = { name: string; pos: V3; look: V3; fov?: number; roll?: number; cInf?: number; focus?: V3; establishing?: boolean; clearD?: number };
export type BuiltSet = {
  root: THREE.Object3D;
  /** named actor marks: [x, y (floor height), z] */
  spots: Record<string, V3>;
  views: View[];
  env: EnvOptions;
  /** per-set sun tweak (degrees, camera-relative az / el) */
  sun?: { az?: number; el?: number };
  /** Engine 4 (opt-in; engine/pbr rig): a set with real lights. SetWorld calls `apply` after the shared light rig each frame so the
   *  set can take over the sun (as its window light), hemisphere and fog, and animate its own atmosphere (dust); `tint` is the colour
   *  multiplier the set's lights give a character card standing at a point. Sets without it (every earlier set) are untouched. */
  e4?: { apply(ctx: { env: { sun: THREE.DirectionalLight; hemi: THREE.HemisphereLight; fog: THREE.Fog }; focus: THREE.Vector3; t: number; light?: string }): void; tint(x: number, y: number, z: number): [number, number, number] };
};
export type SetDef = { id: string; title: string; lights: LightName[]; /** cams = extra camera positions (a storyboard's shots) whose sight lines the set must keep clear of props */
  build: (cams?: View[]) => BuiltSet };
