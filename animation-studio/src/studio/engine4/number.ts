// Engine 4, Phase 4: oversized 3D numbers / text lit inside the scene (replaces flat wall-frame infographics). The text is real extruded,
// bevelled geometry (three's TextGeometry with the Helvetiker bold face, public/e4/fonts) with a PBR material, so the room's lamp and window
// light it, it casts a shadow and the camera can move around it. As a story prop (`e4Number`, variant = the text, e.g. "6:00") it pops in
// on its first step with a snappy overshoot, then floats and turns a few degrees.
import * as THREE from "three";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { staticFile } from "remotion";
import { registerPreload } from "../look/preload";
import { easeSnap } from "./ease";
import type { PropRig } from "../props/registry";
import type { At } from "../props/kit";

let font: Font | undefined;
if (typeof window !== "undefined" && typeof document !== "undefined") {
  registerPreload(new FontLoader().loadAsync(staticFile("e4/fonts/helvetiker_bold.typeface.json")).then((f) => { font = f; }).catch((e) => console.error("e4 number font", e)));
}
const MAT = (hex: string) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.3, metalness: 0.2, emissive: hex, emissiveIntensity: 0.3 });

/** the number's rig: `a` = where it stands (its base centre), height 0.5 m x a.s */
export const numberRig = (a: At, text: string): PropRig => {
  const root = new THREE.Group(), pivot = new THREE.Group();
  root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0; root.scale.setScalar(a.s ?? 1); root.add(pivot);
  if (font) {
    const geo = new TextGeometry(text, { font, size: 0.5, depth: 0.16, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.016, bevelSegments: 3 });
    geo.computeBoundingBox(); const bb = geo.boundingBox!;
    geo.translate(-(bb.max.x + bb.min.x) / 2, 0, -(bb.max.z + bb.min.z) / 2);
    const m = new THREE.Mesh(geo, MAT("#ffd35a")); m.castShadow = true; m.receiveShadow = true; pivot.add(m);
  }
  root.visible = false;
  return { root, update: (st) => {
    const s = st.step ?? 0, k = easeSnap(Math.min(1, s)), t = st.track?.t ?? 0;
    root.visible = s > 0;
    const sc = Math.max(0.001, k);
    pivot.scale.set(sc, sc * (1 + 0.1 * (1 - Math.min(1, s))), sc);
    pivot.position.y = 0.03 * Math.sin(t * 2.2) * Math.min(1, s);
    pivot.rotation.y = (1 - k) * 0.9 + 0.06 * Math.sin(t * 1.3);
  } };
};
