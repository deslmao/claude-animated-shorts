// Interior sets: CLASSROOM, OFFICE, LAB. Same shell as HOME (room.ts): open side +z faces the camera.
import * as THREE from "three";
import { Batch } from "../materials/geo";
import { plasterHD, tilesHD, checkerHD } from "../materials/paint2";
import { tex, col, cyl, sph, frame } from "../props/kit";
import {
  bookshelf, plant, picture, clock, schoolDesk, desk, board, filingCabinet, waterCooler, officeChair, monitor, wallShelf,
  labBench, flask, microscope, testTubeRack, jarShelf, fumeHood, sink, pendant, chair,
} from "../props/interior";
import { buildRoom } from "./room";
import { SetDef } from "./types";

const globe = (b: Batch, x: number, y: number, z: number) => { const m = frame({ x, z, y }); cyl(b, col("#8a5a3c"), m, 0, 0, 0, 0.09, 0.06, 0.06, 12); cyl(b, col("#7d8088"), m, 0, 0.06, 0, 0.01, 0.01, 0.12, 6); sph(b, col("#3f8fd8"), m, 0, 0.3, 0, 0.16, 0.16, 0.16, 18); sph(b, col("#7ab65e"), m, 0.05, 0.36, 0.08, 0.08, 0.06, 0.07, 10); };

export const CLASSROOM: SetDef = {
  id: "classroom", title: "Classroom", lights: ["interior"],
  build: () => {
    const root = new THREE.Group(), b = new Batch(), bz = -3.2;
    buildRoom(root, {
      w: 8, d: 6.4, h: 3.0, floor: tex("clsfloor", () => tilesHD("#d9cfb9", 6, "#bdb3a0"), 1, 1),
      wall: tex("clswall", () => plasterHD("#ead9b4"), 1, 1), tiles: true, lower: tex("clslow", () => plasterHD("#6f9fb3"), 1, 1), lowerH: 1.0,
      openings: [
        { wall: "left", at: -1.9, w: 1.5, h: 1.6, sill: 0.95, view: "campus" },
        { wall: "left", at: 0.6, w: 1.5, h: 1.6, sill: 0.95, view: "campus" },
        { wall: "right", at: 1.6, w: 0.95, h: 2.1, sill: 0, kind: "door" },
      ],
    });
    board(b, { x: 0.2, z: bz + 0.02, y: 1.6 }, 3.6, 1.25, "chalk", "science");
    clock(b, { x: 0.2, z: bz + 0.02, y: 2.62 });
    desk(b, { x: -2.6, z: bz + 1.3 }, 1.4, "#b5875a");
    globe(b, -3.0, 0.76, bz + 1.25);
    for (let k = 0; k < 3; k++) for (let c = 0; c < 4; c++) schoolDesk(b, { x: -1.6 + c * 1.4, z: bz + 2.9 + k * 1.3, yaw: Math.PI }, ["#c8643f", "#3f6fb5", "#e9c46a", "#5d8a3a"][(c + k) % 4]);
    bookshelf(b, { x: 3.75, z: bz + 0.9, yaw: -Math.PI / 2 }, 1.2, 1.9, 4);
    picture(b, { x: 3.99, z: -0.6, y: 1.8, yaw: -Math.PI / 2 }, 0.8, 0.6, 0, "#3a3d47");
    picture(b, { x: -2.2, z: bz + 0.02, y: 2.0 }, 0.6, 0.8, 2, "#c9a24e");
    picture(b, { x: 2.6, z: bz + 0.02, y: 2.0 }, 0.6, 0.8, 1, "#3f6fb5");
    plant(b, { x: 3.4, z: bz + 0.35 }, 1.2, "#c8643f", 6);
    for (const x of [-1.5, 1.9]) pendant(b, { x, z: -0.6, y: 3.0 }, 0.6);
    b.build(root, true);
    return {
      root, env: { sky: false, clouds: false },
      spots: { a: [-0.45, 0, bz + 0.95], b: [0.65, 0, bz + 1.1], c: [2.9, 0, -0.4] },
      views: [
        { name: "wide", pos: [3.0, 1.75, 5.0], look: [-0.4, 1.25, -2.4], fov: 50 },
        { name: "at the board", pos: [0.3, 1.45, 1.4], look: [0.1, 1.45, bz], fov: 40, cInf: 8, focus: [-0.45, 1.55, bz + 0.95] },
        { name: "desks", pos: [-3.1, 1.0, 3.4], look: [0.6, 1.1, -1.6], fov: 46, cInf: 5 },
        { name: "close", pos: [0.0, 1.3, -0.4], look: [-0.5, 1.55, bz + 0.95], fov: 34, cInf: 13 },
      ],
    };
  },
};

export const OFFICE: SetDef = {
  id: "office", title: "Office", lights: ["interior"],
  build: () => {
    const root = new THREE.Group(), b = new Batch(), bz = -3.2;
    buildRoom(root, {
      w: 8, d: 6.4, h: 2.9, floor: tex("offloor", () => tilesHD("#8c96a3", 4, "#76808d"), 1, 1),
      wall: tex("offwall", () => plasterHD("#e9e1d2"), 1, 1), lower: tex("offlow", () => plasterHD("#c9775a"), 1, 1), lowerH: 0.9, ceiling: "#e6dccb", tiles: true,
      openings: [
        { wall: "back", at: -1.7, w: 2.4, h: 1.7, sill: 0.85, view: "city" },
        { wall: "back", at: 1.7, w: 2.4, h: 1.7, sill: 0.85, view: "city" },
        { wall: "left", at: 0.4, w: 0.95, h: 2.1, sill: 0, kind: "door" },
      ],
    });
    for (const x of [-2.2, 0, 2.2]) {
      desk(b, { x, z: -1.4 }, 1.6, "#e2d2b4");
      monitor(b, { x: x - 0.2, z: -1.55, y: 0.74 }, x === 0 ? "code" : "chart");
      officeChair(b, { x: x - 0.15, z: -0.6, yaw: Math.PI }, ["#3a3d47", "#2f5f6a", "#8c3b4a"][Math.round(x / 2.2) + 1]);
    }
    board(b, { x: 3.99, z: -0.2, y: 1.55, yaw: -Math.PI / 2 }, 2.4, 1.2, "white", "chart");
    filingCabinet(b, { x: -3.6, z: bz + 0.5 }); filingCabinet(b, { x: -3.05, z: bz + 0.5 }, "#7d8c9a");
    waterCooler(b, { x: 3.6, z: bz + 0.45 });
    plant(b, { x: 0, z: bz + 0.4 }, 1.4, "#3a3d47", 7);
    plant(b, { x: -3.55, z: 1.6 }, 1.1, "#c8643f", 8);
    wallShelf(b, { x: 0, z: bz + 0.02, y: 2.25 }, 1.2, 5);
    clock(b, { x: 3.99, z: 1.6, y: 2.3, yaw: -Math.PI / 2 });
    for (const x of [-2, 2]) pendant(b, { x, z: -0.9, y: 2.9 }, 0.55);
    b.build(root, true);
    return {
      root, env: { sky: false, clouds: false },
      spots: { a: [-0.9, 0, 0.5], b: [0.6, 0, 0.2], c: [2.6, 0, 0.9] },
      views: [
        { name: "wide", pos: [-0.6, 1.6, 5.0], look: [0.2, 1.2, -1.8], fov: 50 },
        { name: "desk", pos: [1.6, 1.4, 3.0], look: [-0.4, 1.25, -1.0], fov: 40, cInf: 7, focus: [-0.9, 1.55, 0.5] },
        { name: "whiteboard", pos: [-1.6, 1.5, 2.6], look: [3.2, 1.4, -0.4], fov: 42, cInf: 5, focus: [2.6, 1.5, 0.9] },
        { name: "close", pos: [-0.35, 1.35, 2.3], look: [-0.9, 1.55, 0.5], fov: 34, cInf: 13 },
      ],
    };
  },
};

export const LAB: SetDef = {
  id: "lab", title: "Science lab", lights: ["interior"],
  build: () => {
    const root = new THREE.Group(), b = new Batch(), bz = -3.2;
    buildRoom(root, {
      w: 8, d: 6.4, h: 3.0, floor: tex("labfloor", () => checkerHD("#eef0ef", "#a9bcc4", 8), 1, 1),
      wall: tex("labwall", () => plasterHD("#d6ece4"), 1, 1), lower: tex("labtile", () => tilesHD("#f4f6f4", 8, "#c9d1d1"), 1, 1), lowerH: 1.35, ceiling: "#e2e4dc", tiles: true,
      openings: [{ wall: "left", at: -1.0, w: 1.6, h: 1.4, sill: 1.1, view: "campus" }],
    });
    labBench(b, { x: -0.6, z: bz + 0.42 }, 3.6);
    jarShelf(b, { x: -0.6, z: bz + 0.18, y: 1.05 }, 2.8);
    sink(b, { x: -1.9, z: bz + 0.42 });
    for (const [x, k, c] of [[-0.6, "erlen", "#4fd18b"], [-0.3, "round", "#e2453c"], [0.0, "beaker", "#3f8fd8"], [0.5, "erlen", "#b06ad8"]] as const) flask(b, { x, z: bz + 0.5, y: 0.93 }, k, c, 1.4);
    fumeHood(b, { x: 3.05, z: bz + 0.48 });
    labBench(b, { x: 0.2, z: -0.6 }, 2.6);
    microscope(b, { x: -0.6, z: -0.6, y: 0.93 });
    testTubeRack(b, { x: 0.35, z: -0.55, y: 0.93 });
    for (const [x, k, c] of [[0.9, "erlen", "#f4d24a"], [1.2, "beaker", "#4fd18b"], [-0.15, "round", "#3f8fd8"]] as const) flask(b, { x, z: -0.65, y: 0.93 }, k, c, 1.3);
    board(b, { x: 3.99, z: 0.6, y: 1.65, yaw: -Math.PI / 2 }, 2.6, 1.2, "white", "formula");
    picture(b, { x: 1.6, z: bz + 0.02, y: 2.1 }, 0.8, 0.6, 1, "#eef0f2");
    clock(b, { x: -3.99, z: 1.4, y: 2.4, yaw: Math.PI / 2 });
    chair(b, { x: 0.4, z: 0.4, yaw: Math.PI }, "#3f6fb5");
    plant(b, { x: -3.5, z: bz + 0.4 }, 1.0, "#eef0f2", 11);
    for (const x of [-1.5, 1.8]) pendant(b, { x, z: -0.6, y: 3.0 }, 0.5);
    b.build(root, true);
    return {
      root, env: { sky: false, clouds: false },
      spots: { a: [-1.2, 0, 0.45], b: [0.95, 0, 0.6], c: [2.5, 0, -1.4] },
      views: [
        { name: "wide", pos: [1.2, 1.65, 5.0], look: [-0.2, 1.2, -1.8], fov: 50 },
        { name: "bench", pos: [-0.2, 1.3, 1.9], look: [-0.4, 1.15, -1.0], fov: 40, cInf: 8, focus: [-1.2, 1.55, 0.45] },
        { name: "fume hood", pos: [-1.8, 1.5, 2.5], look: [2.8, 1.3, -1.8], fov: 42, cInf: 5, focus: [2.5, 1.5, -1.4] },
        { name: "close", pos: [-0.65, 1.3, 2.3], look: [-1.2, 1.55, 0.45], fov: 34, cInf: 13 },
      ],
    };
  },
};
