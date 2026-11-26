// Minimal typing for the N8AO ambient-occlusion pass (a dependency of @react-three/postprocessing; no bundled types)
declare module "n8ao" {
  import type { Pass } from "postprocessing";
  import type * as THREE from "three";
  export class N8AOPostPass extends Pass {
    constructor(scene: THREE.Scene, camera: THREE.Camera, width?: number, height?: number);
    configuration: Record<string, unknown>;
    setQualityMode(mode: string): void;
  }
}
