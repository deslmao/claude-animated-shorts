// Science theme (created for the "Why you can't tickle yourself" Short): lab and experiment assets that the base lab
// set doesn't have. Reuse them for any experiment / research / technology topic.
import * as THREE from "three";
import type { Theme } from "..";
import { Batch } from "../../materials/geo";
import type { PropRig } from "../../props/registry";
import { At, frame, col, glow, cyl, sph, box } from "../../props/kit";

/** a lab robot arm on a pedestal, holding a feather (tickle experiments, automation, "a machine copies you") */
const robotArm = (b: Batch, a: At) => {
  const m = frame(a), steel = col("#8a929c"), dark = col("#3a3d47"), arm = col("#e9a93b");
  const deg = Math.PI / 180;
  cyl(b, dark, m, 0, 0, 0, 0.3, 0.26, 0.08, 20);                   // floor plate
  cyl(b, steel, m, 0, 0.08, 0, 0.18, 0.15, 0.82, 18);              // pedestal
  sph(b, dark, m, 0, 0.95, 0, 0.13, 0.13, 0.13);                   // shoulder joint
  const t1 = 25 * deg, L1 = 0.55, ex = Math.sin(t1) * L1, ey = 0.95 + Math.cos(t1) * L1;
  cyl(b, arm, m, 0, 0.95, 0, 0.075, 0.06, L1, 14, 0, -t1);         // upper arm
  sph(b, dark, m, ex, ey, 0, 0.09, 0.09, 0.09);                    // elbow
  const t2 = 105 * deg, L2 = 0.46, wx = ex + Math.sin(t2) * L2, wy = ey + Math.cos(t2) * L2;
  cyl(b, arm, m, ex, ey, 0, 0.06, 0.05, L2, 14, 0, -t2);           // forearm
  sph(b, dark, m, wx, wy, 0, 0.065, 0.065, 0.065);                 // wrist
  box(b, steel, m, wx - 0.03, wx + 0.03, wy - 0.12, wy - 0.02, -0.04, 0.04);  // gripper
  sph(b, col("#f6f1e6"), m, wx + 0.02, wy - 0.24, 0, 0.025, 0.13, 0.05, 12);  // feather
  sph(b, glow("robotLed", () => ({ color: "#ff4f3c" })), m, 0.0, 0.7, 0.16, 0.025, 0.025, 0.025, 10); // status light
};

/** the robot arm as moving parts (storyboard props with follow / drive): a two-joint arm that brings its feather to an
 *  actor's open palm and brushes it with the replayed control stroke. Pure: the pose depends only on the inputs. */
const L1 = 0.55, L2 = 0.46, FEATHER = 0.24, SHOULDER = 0.95;
const robotRig = (a: At): PropRig => {
  const root = new THREE.Group(), steel = col("#8a929c"), dark = col("#3a3d47"), arm = col("#e9a93b"), white = col("#f6f1e6");
  root.position.set(a.x, a.y ?? 0, a.z); root.rotation.y = a.yaw ?? 0;
  const b = new Batch(), I = frame({ x: 0, z: 0 });
  cyl(b, dark, I, 0, 0, 0, 0.3, 0.26, 0.08, 20); cyl(b, steel, I, 0, 0.08, 0, 0.18, 0.15, 0.82, 18); sph(b, dark, I, 0, SHOULDER, 0, 0.13, 0.13, 0.13);
  sph(b, glow("robotLed", () => ({ color: "#ff4f3c" })), I, 0.0, 0.7, 0.16, 0.025, 0.025, 0.025, 10);
  b.build(root, true);
  const unit = new THREE.CylinderGeometry(1, 1, 1, 14).translate(0, 0.5, 0), ball = new THREE.SphereGeometry(1, 14, 10);
  const mk = (geo: THREE.BufferGeometry, mat: THREE.Material) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; root.add(m); return m; };
  const upper = mk(unit, arm), fore = mk(unit, arm), elbow = mk(ball, dark), wrist = mk(ball, dark), grip = mk(new THREE.BoxGeometry(0.06, 0.1, 0.08), steel), feather = mk(ball, white);
  const Y = new THREE.Vector3(0, 1, 0), q = new THREE.Quaternion(), tmp = new THREE.Vector3();
  const span = (m: THREE.Mesh, p0: THREE.Vector3, p1: THREE.Vector3, r: number) => { tmp.subVectors(p1, p0); const len = tmp.length(); m.position.copy(p0); m.quaternion.copy(q.setFromUnitVectors(Y, tmp.normalize())); m.scale.set(r, len, r); };
  return {
    root,
    update: ({ target, stroke, camPos }) => {
      root.updateWorldMatrix(true, false);
      // aim point: the palm, nudged 6 cm toward the lens so the feather draws in front of the hand card; at rest
      // (no actor to reach for) the arm holds the pose of the static model
      const T = target ? root.worldToLocal(new THREE.Vector3(...target).addScaledVector(new THREE.Vector3().subVectors(camPos, new THREE.Vector3(...target)).setY(0).normalize(), 0.06))
        : new THREE.Vector3(0.62, 0.55, 0);
      const phi = Math.atan2(T.x, T.z), side = new THREE.Vector3(Math.cos(phi), 0, -Math.sin(phi));
      const r = Math.hypot(T.x, T.z), hw = T.y + FEATHER, dx = r, dy = hw - SHOULDER;
      const d = Math.min(Math.max(0.15, Math.hypot(dx, dy)), L1 + L2 - 0.005);
      const a1 = Math.atan2(dy, dx) + Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
      const lat = 0.035 * stroke, at = (rr: number, hh: number, l: number) => new THREE.Vector3(Math.sin(phi) * rr, hh, Math.cos(phi) * rr).addScaledVector(side, l);
      const S = new THREE.Vector3(0, SHOULDER, 0), E = at(L1 * Math.cos(a1), SHOULDER + L1 * Math.sin(a1), lat * 0.3);
      const k = d / Math.max(1e-6, Math.hypot(dx, dy)), W = at(dx * k, SHOULDER + dy * k, lat);
      span(upper, S, E, 0.07); span(fore, E, W, 0.055);
      elbow.position.copy(E); elbow.scale.setScalar(0.09); wrist.position.copy(W); wrist.scale.setScalar(0.065);
      grip.position.copy(W).add(new THREE.Vector3(0, -0.06, 0)); grip.rotation.set(0, phi, 0);
      // the feather hangs from the gripper to the palm and swings with the stroke (brushing across the hand)
      const tip = at(r, T.y, lat * 2.2), mid = new THREE.Vector3().addVectors(W, tip).multiplyScalar(0.5);
      feather.position.copy(mid); feather.quaternion.copy(q.setFromUnitVectors(Y, tmp.subVectors(tip, W).normalize())); feather.scale.set(0.028, FEATHER * 0.55, 0.06);
    },
  };
};

/** a hand-held control box with a lever (operating a machine or robot) */
const joystick = (p: import("../../characters/toon").Pen, x: number, y: number, u: number, s: number) => {
  p.poly([[x - 16 * u, y - 4 * u], [x + 16 * u, y - 4 * u], [x + 14 * u, y + 12 * u], [x - 14 * u, y + 12 * u]], "#3a3d47", 3 * u);
  p.stroke([[x + 2 * u * s, y - 4 * u], [x + 7 * u * s, y - 24 * u]], 4 * u, "#9aa3ab");
  p.ell(x + 7 * u * s, y - 26 * u, 6 * u, 6 * u, "#e2453c", 2.4 * u);
  p.dot(x - 8 * u, y + 4 * u, 2.6 * u, "#4fd18b");
};

export const SCIENCE: Theme = {
  id: "science", name: "Science and experiments", desc: "lab equipment and experiment machines beyond the base lab set", tags: ["science", "lab", "experiment", "technology"],
  mood: "curious",
  items: {
    joystick: { name: "Control box", desc: "hand-held control box with a lever (operating a robot or machine)", themes: ["science", "technology"], tags: ["control", "robot", "machine", "operate", "experiment"], draw: joystick },
  },
  props: {
    robotArm: { name: "Robot arm", desc: "lab robot arm on a pedestal with a feather in its gripper (stands on the floor, ~1.4 m tall, reaches 0.7 m to +x)", category: "lab", themes: ["science", "lab", "technology"], tags: ["robot", "machine", "experiment", "tickle", "automation"], radius: 0.45, height: 1.45, build: robotArm, rig: robotRig, reach: { shoulder: SHOULDER, length: L1 + L2 - 0.01, lift: FEATHER } },
  },
};
