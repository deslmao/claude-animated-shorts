// PROP STUDIO (test + catalogue, not a story set): every reusable prop rebuilt at new positions and turned to new
// angles (some twice, in different colours) on a neutral floor, one row per family, one view per row.
import * as THREE from "three";
import { Batch, quadUp } from "../materials/geo";
import { concreteHD } from "../materials/paint2";
import { tex } from "../props/kit";
import * as I from "../props/interior";
import * as O from "../props/outdoor";
import * as N from "../props/nature";
import { SetDef, View } from "./types";

type Item = [string, number, (b: Batch, x: number, z: number, yaw: number) => void];
const ROWS: Item[][] = [
  [["sofa", 2.6, (b, x, z, y) => I.sofa(b, { x, z, yaw: y }, "#4f7cac")], ["sofa (recoloured)", 2.6, (b, x, z, y) => I.sofa(b, { x, z, yaw: y }, "#8c3b4a", 1.8)], ["armchair", 1.4, (b, x, z, y) => I.armchair(b, { x, z, yaw: y })],
    ["coffee table", 1.5, (b, x, z, y) => I.coffeeTable(b, { x, z, yaw: y })], ["tv unit", 2.0, (b, x, z, y) => I.tvUnit(b, { x, z, yaw: y })], ["bookshelf", 1.6, (b, x, z, y) => I.bookshelf(b, { x, z, yaw: y }, 1.1, 2.0, 7)],
    ["floor lamp", 0.9, (b, x, z, y) => I.floorLamp(b, { x, z, yaw: y })], ["plant", 0.9, (b, x, z, y) => I.plant(b, { x, z, yaw: y }, 1.2, "#2f5f6a", 3)]],
  [["counter", 2.8, (b, x, z, y) => I.counter(b, { x, z, yaw: y }, 2.2, "#c8643f")], ["fridge", 1.2, (b, x, z, y) => I.fridge(b, { x, z, yaw: y }, "#9fc5c0")], ["stove", 1.1, (b, x, z, y) => I.stove(b, { x, z, yaw: y })],
    ["desk + monitor", 1.9, (b, x, z, y) => { I.desk(b, { x, z, yaw: y }); I.monitor(b, { x: x - 0.2 * Math.cos(y), z: z + 0.2 * Math.sin(y), y: 0.74, yaw: y }, "code"); }],
    ["office chair", 1.0, (b, x, z, y) => I.officeChair(b, { x, z, yaw: y }, "#8c3b4a")], ["filing cabinet", 0.9, (b, x, z, y) => I.filingCabinet(b, { x, z, yaw: y })], ["water cooler", 0.8, (b, x, z, y) => I.waterCooler(b, { x, z, yaw: y })]],
  [["school desk", 1.2, (b, x, z, y) => I.schoolDesk(b, { x, z, yaw: y }, "#5d8a3a")], ["whiteboard", 2.6, (b, x, z, y) => I.board(b, { x, z, y: 1.4, yaw: y }, 2.2, 1.1, "white", "plan")],
    ["lab bench + glass", 2.8, (b, x, z, y) => { I.labBench(b, { x, z, yaw: y }, 2.2); I.flask(b, { x, z, y: 0.93 }, "erlen", "#e2453c", 1.4); I.microscope(b, { x: x + 0.6, z, y: 0.93, yaw: y }); }],
    ["test tubes", 0.8, (b, x, z, y) => I.testTubeRack(b, { x, z, y: 0, yaw: y })], ["jar shelf", 2.0, (b, x, z, y) => I.jarShelf(b, { x, z, yaw: y }, 1.6)], ["fume hood", 1.8, (b, x, z, y) => I.fumeHood(b, { x, z, yaw: y })]],
  [["street lamp", 1.4, (b, x, z, y) => O.streetLamp(b, { x, z, yaw: y })], ["bench", 2.2, (b, x, z, y) => O.bench(b, { x, z, yaw: y })], ["bin", 0.8, (b, x, z, y) => O.bin(b, { x, z, yaw: y })],
    ["hydrant", 0.7, (b, x, z, y) => O.hydrant(b, { x, z, yaw: y })], ["traffic light", 0.9, (b, x, z, y) => O.trafficLight(b, { x, z, yaw: y })], ["car", 4.6, (b, x, z, y) => O.car(b, { x, z, yaw: y }, "#7b5ac9")],
    ["bus stop", 3.4, (b, x, z, y) => O.busStop(b, { x, z, yaw: y })], ["mailbox", 0.8, (b, x, z, y) => O.mailbox(b, { x, z, yaw: y })]],
  [["market stall", 2.8, (b, x, z, y) => O.marketStall(b, { x, z, yaw: y }, "#7b5ac9", "cloth")], ["barrel", 0.9, (b, x, z, y) => O.barrel(b, { x, z, yaw: y })], ["crate", 0.9, (b, x, z, y) => O.crate(b, { x, z, yaw: y })],
    ["cart", 3.2, (b, x, z, y) => O.cart(b, { x, z, yaw: y })], ["well", 2.2, (b, x, z, y) => O.well(b, { x, z, yaw: y })], ["lantern post", 0.8, (b, x, z, y) => O.lanternPost(b, { x, z, yaw: y })]],
  [["round tree", 3.0, (b, x, z) => N.tree(b, "round", x, 0, z, 5, 11)], ["cone tree", 2.4, (b, x, z) => N.tree(b, "cone", x, 0, z, 5, 12)], ["autumn tree", 3.0, (b, x, z) => N.tree(b, "autumn", x, 0, z, 5, 13)],
    ["bush", 1.6, (b, x, z) => N.tree(b, "bush", x, 0, z, 1.2, 14)], ["rock", 1.6, (b, x, z, y) => N.rock(b, { x, z, yaw: y }, 1, 5)], ["log", 2.6, (b, x, z, y) => N.log(b, { x, z, yaw: y })],
    ["stump + mushrooms", 1.2, (b, x, z, y) => { N.stump(b, { x, z, yaw: y }); N.mushroom(b, { x: x + 0.5, z, yaw: y }); }], ["flowers", 1.4, (b, x, z, y) => N.flowers(b, { x, z, yaw: y }, 14, 1, 9)], ["fence", 3.4, (b, x, z, y) => N.fence(b, { x, z, yaw: y }, 3)]],
];
export const PROP_NAMES = ROWS.map((r) => r.map(([n]) => n));

export const PROPSTUDIO: SetDef = {
  id: "props", title: "Prop catalogue", lights: ["day"],
  build: () => {
    const root = new THREE.Group(), b = new Batch(), views: View[] = [];
    b.add(quadUp(-300, 300, -300, 300, 150, 150), tex("studiofloor", () => concreteHD("#cfc8bb"), 1, 1));
    ROWS.forEach((row, k) => {
      const z = -k * 9, total = row.reduce((s, [, w]) => s + w + 0.6, 0);
      let x = -total / 2;
      row.forEach(([, w, fn], i) => { fn(b, x + w / 2, z, 0.45 * ((i % 3) - 1) + (k % 2 ? 0.3 : -0.3)); x += w + 0.6; });
      views.push({ name: `row ${k + 1}`, pos: [0, 4.2, z + total * 0.95 + 2], look: [0, 0.8, z], fov: 40 });
    });
    b.build(root, true);
    return { root, env: {}, spots: {}, views };
  },
};
