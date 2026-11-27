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
const MAT = (hex: string, glow: number) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.3, metalness: 0.2, emissive: hex, emissiveIntensity: glow });
/** luck-number colours: Leo's 6 (and the 9 it turns into) gold, Mum's 7 cyan, Dex's 8 pink; anything else gold */
const COLOUR: Record<string, string> = { "6": "#ffd35a", "9": "#ffd35a", "7": "#6fe3ff", "8": "#ff7fb5" };

/** the number's rig: `a` = where it stands (its base centre), height 0.5 m x a.s. With `hover` (story PropSpec.hover) it floats at `st.target`
 *  (above an actor's crown), faces the camera and turns its own "up" to the actor's: an actor upside down carries it upside down, so a 6 reads as a 9 */
export const numberRig = (a: At, text: string): PropRig => {
  const root = new THREE.Group(), pivot = new THREE.Group(), hex = COLOUR[text] ?? "#ffd35a";
  root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0; root.scale.setScalar(a.s ?? 1); root.add(pivot);
  const mat = MAT(hex, 0.3);
  let mesh: THREE.Mesh | undefined;
  if (font) {
    const geo = new TextGeometry(text, { font, size: 0.5, depth: 0.16, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.022, bevelSize: 0.016, bevelSegments: 3 });
    geo.computeBoundingBox(); const bb = geo.boundingBox!;
    geo.translate(-(bb.max.x + bb.min.x) / 2, 0, -(bb.max.z + bb.min.z) / 2);
    mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; pivot.add(mesh);
  }
  root.visible = false;
  return { root, update: (st) => {
    const s = st.step ?? 0, k = easeSnap(Math.min(1, s)), t = st.track?.t ?? 0, hover = !!st.target;
    root.visible = s > 0;
    const sc = Math.max(0.001, k);
    if (hover && st.target) {
      const yaw = Math.atan2(st.camPos.x - st.target[0], st.camPos.z - st.target[2]);
      const up = st.up ?? [0, 1, 0], ux = up[0] * Math.cos(yaw) - up[2] * Math.sin(yaw), uy = up[1];
      // above the crown along the body's up; as the actor turns upside down (their up leaves the world's) it slides out to the side and stays above the floor,
      // beside the head, turned the same way up: a headstand's number is never inside the floor
      const lift = st.hover?.lift ?? 0.42, sd = st.hover?.side ?? 1, c = Math.max(0, uy), vert = 0.55 + 0.45 * c, side = (1 - c) * 1.3 * sd;
      root.position.set(st.target[0] + lift * (side * Math.cos(yaw) + up[0] * c), st.target[1] + lift * vert, st.target[2] + lift * (-side * Math.sin(yaw) + up[2] * c));
      root.rotation.set(0, yaw, 0);
      pivot.rotation.set(0, 0, Math.atan2(-ux, uy) + 0.05 * Math.sin(t * 2.1));      // the number's own up follows the actor's up (a 6 upside down is a 9)
      pivot.position.y = 0.04 * Math.sin(t * 2.4);
      if (mesh) mesh.position.y = -0.25;                                               // centred on the hover point
      mat.emissiveIntensity = 1.5;                                                     // glowing: over the bloom threshold
      pivot.scale.set(sc, sc, sc);
      return;
    }
    pivot.scale.set(sc, sc * (1 + 0.1 * (1 - Math.min(1, s))), sc);
    pivot.position.y = 0.03 * Math.sin(t * 2.2) * Math.min(1, s);
    pivot.rotation.y = (1 - k) * 0.9 + 0.06 * Math.sin(t * 1.3);
  } };
};
