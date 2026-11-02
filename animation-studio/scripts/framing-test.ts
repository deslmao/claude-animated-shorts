// Framing test (no rendering): projects a character-sized box at every named mark into every designed view of every
// set with three.js' own camera maths (9:16, the view's fov / roll) and reports how each character is framed.
//   npm run test:framing
// FAIL: the view's subject (the mark nearest its focus / look point) has its HEAD cut by any frame edge, or (in shots
// wide enough to show the whole body) its body cut at the left / right edge; or a non-establishing view frames nobody. WARN: another mark sits half-cut at the left / right edge (the mark is
// usable, just not in that view). Feet below the frame are fine (medium shots and close-ups crop at the waist).
import * as THREE from "three";
import { LAYOUTS } from "../src/studio/sets/layouts";

const W = 0.36, H = 1.86; // half width / height of the tallest lead (Juno, 1.83 m + hair) in metres
let fails = 0, warns = 0;
const rows: string[] = [];
for (const [set, L] of Object.entries(LAYOUTS)) {
  for (const v of L.views) {
    const cam = new THREE.PerspectiveCamera(v.fov ?? 40, 9 / 16, 0.1, 2000);
    cam.position.set(...v.pos); cam.up.set(0, 1, 0); cam.lookAt(...v.look); cam.rotateZ(v.roll ?? 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const target = new THREE.Vector3(...(v.focus ?? v.look));
    const report: { name: string; vis: number; cutX: boolean; headCut: boolean; inside: boolean; d: number }[] = [];
    for (const [name, p] of Object.entries(L.spots)) {
      if (Object.values(L.spots).some((q, i) => q === p && Object.keys(L.spots)[i] < name && Object.keys(L.spots)[i].length === 1)) continue; // alias of a / b / c
      const base = new THREE.Vector3(...p);
      const pts: THREE.Vector3[] = [];
      for (const sx of [-1, 1]) for (const y of [0, H]) pts.push(base.clone().addScaledVector(right, sx * W).setY(p[1] + y));
      const ndc = pts.map((q) => q.clone().project(cam));
      const behind = pts.some((q) => q.clone().applyMatrix4(cam.matrixWorldInverse).z > -0.15);
      if (behind) continue;
      const x0 = Math.min(...ndc.map((n) => n.x)), x1 = Math.max(...ndc.map((n) => n.x)), y1 = Math.max(...ndc.map((n) => n.y)), y0 = Math.min(...ndc.map((n) => n.y));
      if (x1 < -1 || x0 > 1 || y0 > 1 || y1 < -1) continue; // not in this view at all
      const vis = Math.max(0, Math.min(1, x1) - Math.max(-1, x0)) / (x1 - x0);
      // head box: top 0.5 m, half width 0.26 m
      const hp: THREE.Vector3[] = []; for (const sx of [-1, 1]) for (const y of [H - 0.5, H]) hp.push(base.clone().addScaledVector(right, sx * 0.26).setY(p[1] + y));
      const hn = hp.map((q) => q.clone().project(cam));
      const headIn = hn.every((n) => n.x >= -1 && n.x <= 1 && n.y >= -1 && n.y <= 1);
      const fullBodyShot = y1 - y0 < 1.9; // the whole body fits the frame height
      report.push({ name, vis, cutX: fullBodyShot && vis < 0.999, headCut: !headIn, inside: vis >= 0.999 && y1 <= 1, d: base.distanceTo(target.clone().setY(p[1])) });
    }
    const subject = report.slice().sort((a, b) => a.d - b.d)[0];
    let status = "ok";
    if (!subject || (v.establishing && subject.headCut)) { if (!v.establishing) { status = "FAIL (nobody framed)"; fails++; } else status = "ok (establishing)"; }
    else if (!v.establishing && (subject.cutX || subject.headCut)) { status = `FAIL (subject ${subject.name} ${subject.headCut ? "head cut by the frame" : `body cut at side, ${Math.round(subject.vis * 100)}% visible`})`; fails++; }
    const halfCut = report.filter((r) => r !== subject && r.cutX && r.vis > 0.15 && r.vis < 0.85);
    if (status === "ok" && halfCut.length) { status = `warn (half-cut at edge: ${halfCut.map((r) => r.name).join(", ")})`; warns++; }
    rows.push(`${set.padEnd(10)} ${v.name.padEnd(20)} subject ${(subject?.name ?? "-").padEnd(11)} in frame: ${report.filter((r) => r.inside).map((r) => r.name).join(" ") || "-"}  -> ${status}`);
  }
}
console.log(rows.join("\n"));
console.log(`\n${fails} fail, ${warns} warn, ${rows.length} views`);
(globalThis as unknown as { process: { exit(c: number): void } }).process.exit(fails ? 1 : 0);
