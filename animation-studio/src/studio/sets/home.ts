// HOME: a cosy living room with a kitchen nook. Wallpaper over a painted dado, honey floorboards, garden window with
// curtains, sofa + armchair + rug + coffee table, bookshelf, floor lamp, plants, pictures, clock; kitchen counter +
// fridge + stove along the right wall; door on the left. Open side = +z (camera side).
import * as THREE from "three";
import { Batch } from "../materials/geo";
import { wallpaperHD, plasterHD } from "../materials/paint2";
import { tex } from "../props/kit";
import { sofa, armchair, coffeeTable, rug, bookshelf, floorLamp, plant, picture, clock, curtains, counter, fridge, stove, floorMat, wallShelf, chair, pendant } from "../props/interior";
import { buildRoom } from "./room";
import { SetDef } from "./types";

export const HOME: SetDef = {
  id: "home", title: "Home: living room + kitchen", lights: ["interior"],
  build: () => {
    const root = new THREE.Group(), b = new Batch();
    buildRoom(root, {
      w: 6.6, d: 5.2, h: 2.8, floor: floorMat(), wall: tex("wpHome", () => wallpaperHD("#efcf98", "#c78a4c", "stripe"), 1, 1),
      lower: tex("dadoHome", () => plasterHD("#7fa39a"), 1, 1), lowerH: 0.95, trim: "#f6efe2",
      openings: [
        { wall: "back", at: 0.2, w: 1.7, h: 1.45, sill: 0.95, view: "garden" },
        { wall: "left", at: 0.2, w: 0.95, h: 2.1, sill: 0, kind: "door" },
        { wall: "right", at: -1.0, w: 1.2, h: 1.0, sill: 1.25, view: "garden" },
      ],
    });
    const bz = -2.6; // back wall plane
    curtains(b, { x: 0.2, z: bz + 0.02, y: 0.65 }, 2.2, 2.0, "#c25a7a");
    sofa(b, { x: 0.15, z: bz + 0.62 }, "#4f7cac", 2.2);
    floorLamp(b, { x: -1.55, z: bz + 0.45 });
    plant(b, { x: 1.65, z: bz + 0.4 }, 1.25, "#c8643f", 4);
    bookshelf(b, { x: -2.55, z: bz + 0.2 }, 1.1, 2.1, 1);
    picture(b, { x: -1.15, z: bz + 0.01, y: 1.85 }, 0.55, 0.42, 0);
    clock(b, { x: 1.55, z: bz + 0.02, y: 2.2 });
    rug(b, { x: 0.1, z: -0.8 }, 3.0, 2.0);
    coffeeTable(b, { x: 0.1, z: -1.1 });
    armchair(b, { x: -2.15, z: -0.3, yaw: 0.9 }, "#c06c4a");
    picture(b, { x: -3.29, z: -1.4, y: 1.7, yaw: Math.PI / 2 }, 0.7, 0.52, 2, "#3a3d47");
    // kitchen nook along the right wall (fronts face -x)
    fridge(b, { x: 2.88, z: -2.1, yaw: -Math.PI / 2 });
    counter(b, { x: 2.98, z: -0.35, yaw: -Math.PI / 2 }, 2.4, "#5f8f86");
    stove(b, { x: 2.98, z: 1.2, yaw: -Math.PI / 2 });
    wallShelf(b, { x: 3.27, z: 0.6, y: 1.75, yaw: -Math.PI / 2 }, 1.0, 2);
    chair(b, { x: 1.9, z: 0.4, yaw: -1.2 }, "#e9c46a");
    pendant(b, { x: 0.1, z: -0.9, y: 2.8 });
    picture(b, { x: -0.55, z: bz + 0.01, y: 2.15 }, 0.36, 0.3, 1, "#c9a24e");
    plant(b, { x: -2.45, z: bz + 0.2, y: 2.1 }, 0.55, "#5f8f86", 9);
    b.build(root, true);
    return {
      root, env: { sky: false, clouds: false },
      spots: { a: [-0.75, 0, 0.35], b: [0.45, 0, -0.2], c: [1.55, 0, 0.5], d: [2.3, 0, -0.9] },
      views: [
        { name: "wide", pos: [0.5, 1.35, 5.0], look: [0, 0.95, -1.2], fov: 50 },
        { name: "two-shot", pos: [0.0, 1.45, 2.7], look: [-0.15, 1.35, -0.2], fov: 38, cInf: 10, focus: [-0.75, 1.55, 0.35] },
        { name: "kitchen", pos: [-1.6, 1.55, 2.4], look: [2.4, 1.15, -1.0], fov: 44, cInf: 6, focus: [2.3, 1.5, -0.9] },
        { name: "low close", pos: [-0.25, 1.05, 1.75], look: [-0.7, 1.55, 0.35], fov: 34, cInf: 13, roll: 0.04 },
      ],
    };
  },
};
