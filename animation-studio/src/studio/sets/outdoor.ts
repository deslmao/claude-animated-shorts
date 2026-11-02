// Exterior sets: CITY (modern street), OLDTOWN (market square), NATURE (park path, pond, hills). Sky, sun, clouds and
// horizon fog come from the shared Environment, so the creator's day / golden looks apply unchanged.
import * as THREE from "three";
import { Batch, V, lam, quad, tri, quadUp, boxGeo } from "../materials/geo";
import { grassHD, cobbleHD, stoneHD, roofHD } from "../materials/paint";
import { asphaltHD, pavementHD, dirtHD, concreteHD } from "../materials/paint2";
import { tex, col, box, decal, cyl, frame } from "../props/kit";
import { streetLamp, bench, bin, hydrant, trafficLight, car, busStop, planterTree, signPost, mailbox, modernBuilding, shopfront, house, marketStall, barrel, crate, cart, well, lanternPost, fountain } from "../props/outdoor";
import { tree, rock, log, stump, flowers, tufts, mushroom, fence } from "../props/nature";
import { rng } from "../materials/paint";
import { SetDef } from "./types";
import { LAYOUTS } from "./layouts";
import { clearOf } from "./clear";

const PAL = [
  { wall: "#d98f6a", trim: "#f2ead8", sign: "#2f5f6a", awning: "#c0353a" }, { wall: "#e7d3a8", trim: "#5d6470", sign: "#c0353a", awning: "#2f6a43" },
  { wall: "#9fb7c9", trim: "#f2ead8", sign: "#e9a93b" }, { wall: "#c47a5c", trim: "#efe6d4", sign: "#3f6fb5", brick: true, awning: "#e9c46a" },
  { wall: "#efe0c2", trim: "#8c3b4a", sign: "#5d8a3a" }, { wall: "#8fae8a", trim: "#f2ead8", sign: "#8c3b4a", awning: "#3f6fb5" },
  { wall: "#d8b07a", trim: "#4b4f5c", sign: "#2a9d8f", brick: true },
];

export const CITY: SetDef = {
  id: "city", title: "Modern city street", lights: ["day", "golden"],
  build: () => {
    const root = new THREE.Group(), b = new Batch(), r = rng(21);
    const views = LAYOUTS.city.views;
    const ok = (x: number, z: number, rad = 0.5) => clearOf(views, x, z, rad);
    // road along x (z -4..4), raised pavements to z +-7.6, buildings beyond
    b.add(quadUp(-260, 260, -4, 4, 130, 2), tex("asphalt", asphaltHD, 1, 1));
    for (const s of [-1, 1]) {
      const z0 = s < 0 ? -7.6 : 4, z1 = s < 0 ? -4 : 7.6;
      b.add(quadUp(-260, 260, z0, z1, 260, 1.8, 0.15), tex("pave", () => pavementHD(), 1, 1));
      box(b, tex("kerb", () => concreteHD("#b9b4ab"), 1, 1), frame({ x: 0, z: 0 }), -260, 260, 0, 0.16, s * 4 - 0.15, s * 4 + 0.15);
      b.add(quadUp(-260, 260, s < 0 ? -40 : 7.6, s < 0 ? -7.6 : 40, 130, 16, 0.15), tex("pave2", () => concreteHD("#a9a39a"), 1, 1));
    }
    // lane markings + crosswalk
    for (let x = -250; x < 250; x += 6) decal(b, col("#f2eee4"), frame({ x: 0, z: 0 }), x, 0.012, 0, 3, 0.15);
    for (let k = -3; k <= 3; k++) decal(b, col("#f2eee4"), frame({ x: 0, z: 0 }), 12, 0.013, k * 1.1, 3.2, 0.55, Math.PI / 2);
    // buildings: north row faces +z, south row faces -z
    for (const s of [-1, 1]) {
      let x = -90;
      while (x < 90) {
        const w = 8 + Math.floor(r() * 4) * 2, h = 10 + Math.floor(r() * 5) * 3.2, st = PAL[Math.floor(r() * PAL.length)];
        modernBuilding(b, { x: x + w / 2, z: s * (7.6 + 6), yaw: s < 0 ? 0 : Math.PI, y: 0.15 }, w, 12, h, st);
        x += w;
      }
    }
    // street furniture on both pavements
    for (const s of [-1, 1]) for (let x = -60; x <= 60; x += 12) {
      if (ok(x, s * 4.55)) streetLamp(b, { x, z: s * 4.55, y: 0.15, yaw: s < 0 ? 0 : Math.PI });
      if (Math.abs(x) % 24 === 0 && ok(x + 6, s * 5.0, 1.4)) planterTree(b, { x: x + 6, z: s * 5.0, y: 0.15 }, 4.8, x + s * 7, (bb, X, Y, Z, H, sd) => tree(bb, "round", X, Y, Z, H, sd, 0));
    }
    shopfront(b, { x: 0.2, z: -7.6, y: 0.15 }, 7.2, "cafe", "#2f5f6a", "#c0353a", (bb, X, Y, Z, H, sd) => tree(bb, "bush", X, Y, Z, H, sd, 1));
    if (ok(-6.5, -7.0)) bench(b, { x: -6.5, z: -6.9, y: 0.15 }); if (ok(4.6, -7.1)) bin(b, { x: 4.6, z: -7.1, y: 0.15 }); if (ok(5.4, -4.6)) hydrant(b, { x: 5.4, z: -4.6, y: 0.15 });
    busStop(b, { x: -14, z: -6.6, y: 0.15 });
    for (const [x, z, yaw] of [[9.6, -4.6, 0], [14.4, 4.6, Math.PI]]) if (ok(x, z)) trafficLight(b, { x, z, y: 0.15, yaw });
    if (ok(7.5, -7.0)) mailbox(b, { x: 7.5, z: -7.0, y: 0.15 }); if (ok(-9, -4.6)) signPost(b, { x: -9, z: -4.6, y: 0.15 }, "#3f6fb5");
    for (const [x, z, yaw, c] of [[-9, -2.5, Math.PI / 2, "#d2603a"], [22, -2.4, Math.PI / 2, "#3f6fb5"], [-4, 2.5, -Math.PI / 2, "#e9c46a"], [-24, 2.4, -Math.PI / 2, "#5d8a3a"]] as const)
      if (ok(x, z, 2.3)) car(b, { x, z, yaw }, c);
    b.build(root, true);
    return {
      root, env: {},
      spots: LAYOUTS.city.spots,
      views,
    };
  },
};

export const OLDTOWN: SetDef = {
  id: "oldtown", title: "Old town market square", lights: ["day", "golden"],
  build: () => {
    const root = new THREE.Group(), b = new Batch(), r = rng(33);
    const views = LAYOUTS.oldtown.views;
    const ok = (x: number, z: number, rad = 0.6) => clearOf(views, x, z, rad);
    b.add(quadUp(-60, 60, -60, 60, 30, 30), tex("cobbleHD", cobbleHD, 1, 1));
    b.add(quadUp(-400, 400, -400, 400, 100, 100, -0.01), lam("grassHD", () => ({ map: grassHD() })));
    // houses around the square (fronts face the centre)
    const row = (n: number, place: (i: number, w: number) => { x: number; z: number; yaw: number }) => { for (let i = 0; i < n; i++) { const w = 7 + Math.floor(r() * 3), h = [7, 8.4, 9.8][Math.floor(r() * 3)]; const p = place(i, w); house(b, { ...p, y: 0 }, w, 8, h, Math.floor(r() * 8)); } };
    row(5, (i) => ({ x: -18 + i * 9, z: -18, yaw: 0 }));
    row(4, (i) => ({ x: -19, z: -9 + i * 8.6, yaw: Math.PI / 2 }));
    row(4, (i) => ({ x: 19, z: -9 + i * 8.6, yaw: -Math.PI / 2 }));
    row(5, (i) => ({ x: -18 + i * 9, z: 30, yaw: Math.PI }));
    // church tower behind the north row
    const tw = lam("towerHD", () => ({ map: stoneHD("towerHD") }));
    b.add(boxGeo(V(-3, 0, -32), V(3, 22, -26), 2), tw);
    const roof = lam("roofspire", () => ({ map: roofHD("#8f97a8", true), side: THREE.DoubleSide }));
    for (const [a, c, d] of [[V(-3.4, 22, -25.6), V(3.4, 22, -25.6), V(0, 30, -29)], [V(3.4, 22, -32.4), V(-3.4, 22, -32.4), V(0, 30, -29)], [V(-3.4, 22, -32.4), V(-3.4, 22, -25.6), V(0, 30, -29)], [V(3.4, 22, -25.6), V(3.4, 22, -32.4), V(0, 30, -29)]] as const)
      b.add(tri(a, c, d), roof);
    fountain(b, { x: 0, z: -4 });
    marketStall(b, { x: -7.5, z: -9, yaw: 0.25 }, "#c0353a", "fruit"); marketStall(b, { x: 7, z: -9.5, yaw: -0.3 }, "#2f6a43", "bread"); marketStall(b, { x: -12, z: 1, yaw: Math.PI / 2 }, "#3f6fb5", "cloth");
    for (const [x, z] of [[-5, -10.5], [-4.3, -10.2], [9.2, -10.6]]) if (ok(x, z)) barrel(b, { x, z });
    for (const [x, z, s] of [[-10, -8.6, 0.6], [-10.2, -8.0, 0.5], [5.2, -11, 0.6]] as const) if (ok(x, z)) crate(b, { x, z, yaw: x }, s);
    if (ok(11, -2, 1.5)) cart(b, { x: 11, z: -2, yaw: -0.6 });
    if (ok(-11, 9, 1.2)) well(b, { x: -11, z: 9 });
    for (const [x, z] of [[-14, -13], [14, -13], [-14, 14], [14, 14], [-6, 7], [6.5, 6.5]]) if (ok(x, z)) lanternPost(b, { x, z });
    for (const [x, z, k] of [[-15.5, 4, "round"], [15.6, 6, "fat"], [-16, -14.5, "round"]] as const) if (ok(x, z, 2.5)) tree(b, k, x, 0, z, 6, x * 3 + z, 0);
    b.build(root, true);
    return {
      root, env: {},
      spots: LAYOUTS.oldtown.spots,
      views,
    };
  },
};

export const NATURE: SetDef = {
  id: "nature", title: "Nature: park path, pond and hills", lights: ["day", "golden"],
  build: () => {
    const root = new THREE.Group(), b = new Batch(), r = rng(47);
    const views = LAYOUTS.nature.views;
    const ok = (x: number, z: number, rad = 0.6) => clearOf(views, x, z, rad, 6);
    b.add(quadUp(-600, 600, -600, 600, 300, 300), lam("grassHD", () => ({ map: grassHD() })));
    // rolling hills + far mountains (fog = horizon colour pushes them back)
    const hill = tex("hillgrass", grassHD, 12, 6);
    for (const [x, z, rx, ry, rz] of [[-70, -120, 70, 16, 40], [40, -150, 90, 22, 50], [120, -90, 60, 12, 40], [-140, -60, 50, 10, 40], [0, -230, 140, 30, 60]] as const) {
      const m = new THREE.Matrix4().compose(V(x, -ry * 0.25, z), new THREE.Quaternion(), V(rx, ry, rz));
      b.add(new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), hill, m);
    }
    for (const [x, z, h, rr] of [[-200, -480, 120, 160], [60, -520, 150, 190], [260, -460, 110, 150]] as const) b.add(new THREE.ConeGeometry(rr, h, 7).translate(x, h / 2 - 2, z), col("#8fa6b8"));
    // winding dirt path from the lens into the distance
    const dirt = tex("dirt", dirtHD, 1, 1);
    let px = 0.6, pz = 14;
    for (let i = 0; i < 26; i++) {
      const nx = 0.6 + 3.2 * Math.sin(i * 0.33) - i * 0.15, nz = 14 - (i + 1) * 2.6, w = 2.4, ax = nz - pz, az = -(nx - px), L = Math.hypot(ax, az) || 1;
      const ox = (ax / L) * w / 2, oz = (az / L) * w / 2;
      b.add(quad(V(px - ox, 0.012, pz - oz), V(nx - ox, 0.012, nz - oz), V(nx + ox, 0.012, nz + oz), V(px + ox, 0.012, pz + oz), 0.65, 0.6), dirt); // wound so it faces up
      px = nx; pz = nz;
    }
    // pond: water disc, muddy rim, reeds, lily pads
    b.add(new THREE.CircleGeometry(5.6, 40).rotateX(-Math.PI / 2).translate(8, 0.008, -7), tex("pondrim", dirtHD, 2, 2));
    b.add(new THREE.CircleGeometry(5.0, 40).rotateX(-Math.PI / 2).translate(8, 0.02, -7), col("#3a9fbf"));
    b.add(new THREE.CircleGeometry(3.4, 40).rotateX(-Math.PI / 2).translate(8.6, 0.022, -7.6), col("#4ab3cf"));
    // reed clumps with cattail heads around the far half of the pond (kept out of the near bank the views look over)
    for (let i = 0; i < 9; i++) {
      const a = -2.6 + (i / 8) * 2.2 + (r() - 0.5) * 0.2, d = 4.9 + r() * 0.4, cx = 8 + Math.cos(a) * d, cz = -7 + Math.sin(a) * d;
      for (let k = 0; k < 6; k++) {
        const m = frame({ x: cx + (r() - 0.5) * 0.5, z: cz + (r() - 0.5) * 0.5 }), h = 0.7 + r() * 0.6, tx = (r() - 0.5) * 0.25, tz = (r() - 0.5) * 0.25;
        cyl(b, col(k % 3 ? "#5a9c43" : "#7aa83f"), m, 0, 0, 0, 0.03, 0.01, h, 5, tx, tz);
        if (k % 2 === 0) cyl(b, col("#7a4f33"), m, Math.sin(tz) * -h, h * 0.92, Math.sin(tx) * h, 0.035, 0.035, 0.16, 8, tx, tz);
      }
    }
    for (const [x, z] of [[6.5, -5.5], [9.5, -8.5], [7.6, -9.2]]) b.add(new THREE.CircleGeometry(0.35, 16).rotateX(-Math.PI / 2).translate(x, 0.03, z), col("#5aa83c"));
    // trees: groves on both sides, kept out of the path and the views
    const T: [number, number, string, number][] = [[-6, 2, "round", 7], [-8, -4, "fat", 8], [-5, -12, "tall", 9], [-10, -16, "round", 7], [-14, -6, "cone", 9], [-16, 4, "round", 8],
      [14, -2, "round", 8], [16, -12, "fat", 9], [13, -18, "cone", 10], [4, -22, "round", 8], [-2, -30, "tall", 10], [9, -30, "round", 9], [-12, -26, "fat", 8], [20, 3, "tall", 9]];
    for (const [x, z, k, h] of T) if (ok(x, z, h * 0.3)) tree(b, k as "round", x, 0, z, h, x * 7 + z * 3, 0);
    for (const [x, z, h] of [[-4, 4, 1.4], [3.6, 6, 1.1], [-3.2, -6, 1.3], [12, -1, 1.5], [-7.5, -1, 1.2], [-6.5, 9.5, 1.3], [5.5, 10, 1.2]]) if (ok(x, z, h * 0.8)) tree(b, "bush", x, 0, z, h, x * 5 + z, 0);
    for (const [x, z, sz, sd] of [[-3, 8.5, 0.9, 1], [5.6, -1.5, 1.0, 2], [11, -12, 1.6, 3], [2.6, -9, 0.8, 4]]) if (ok(x, z, sz)) rock(b, { x, z }, sz, sd);
    if (ok(-4.2, 1.2, 1.2)) log(b, { x: -4.2, z: 1.2, yaw: 0.5 }); if (ok(3.4, 3.2)) stump(b, { x: 3.4, z: 3.2 });
    for (const [x, z, n, sp, sd] of [[-2.6, 6.5, 16, 1.6, 1], [3.2, 9, 12, 1.4, 2], [-6, -8, 14, 2, 3], [4.8, 1.8, 12, 1.5, 4]]) if (ok(x, z, sp)) flowers(b, { x, z }, n, sp, sd);
    for (const [x, z, n, sp, sd] of [[1.8, 10.5, 10, 2.5, 1], [-1.6, 11, 8, 2, 2], [-5.4, 3, 8, 2, 3]]) if (ok(x, z, sp)) tufts(b, { x, z }, n, sp, sd);
    if (ok(-3.7, 1.7)) { mushroom(b, { x: -3.6, z: 1.6 }, 1.2); mushroom(b, { x: -3.9, z: 1.9 }, 0.8); }
    if (ok(-2.6, -1.5, 3.5)) fence(b, { x: -2.6, z: -1.5, yaw: 1.2 }, 6);
    b.build(root, true);
    return {
      root, env: {},
      spots: LAYOUTS.nature.spots,
      views,
    };
  },
};
