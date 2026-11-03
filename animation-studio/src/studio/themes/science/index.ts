// Science theme (created for the "Why you can't tickle yourself" Short): lab and experiment assets that the base lab
// set doesn't have. Reuse them for any experiment / research / technology topic.
import type { Theme } from "..";
import type { Batch } from "../../materials/geo";
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

export const SCIENCE: Theme = {
  id: "science", name: "Science and experiments", desc: "lab equipment and experiment machines beyond the base lab set", tags: ["science", "lab", "experiment", "technology"],
  mood: "curious",
  props: {
    robotArm: { name: "Robot arm", desc: "lab robot arm on a pedestal with a feather in its gripper (stands on the floor, ~1.4 m tall, reaches 0.7 m to +x)", category: "lab", themes: ["science", "lab", "technology"], tags: ["robot", "machine", "experiment", "tickle", "automation"], radius: 0.45, height: 1.45, build: robotArm },
  },
};
