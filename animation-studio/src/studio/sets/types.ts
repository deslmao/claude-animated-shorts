// A set = a reusable 3D place: geometry + named spots for actors + designed camera views + the lights it suits.
import * as THREE from "three";
import type { LightName, EnvOptions } from "../scene/environment";
import type { V3 } from "../camera/keys";

/** a designed camera framing (camera position, look point, lens), with suggested lens blur */
/** establishing = a place / insert shot that frames no actor on purpose */
export type View = { name: string; pos: V3; look: V3; fov?: number; roll?: number; cInf?: number; focus?: V3; establishing?: boolean };
export type BuiltSet = {
  root: THREE.Object3D;
  /** named actor marks: [x, y (floor height), z] */
  spots: Record<string, V3>;
  views: View[];
  env: EnvOptions;
  /** per-set sun tweak (degrees, camera-relative az / el) */
  sun?: { az?: number; el?: number };
};
export type SetDef = { id: string; title: string; lights: LightName[]; build: () => BuiltSet };
