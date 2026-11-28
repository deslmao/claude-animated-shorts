// Engine 4, Episode 2: the four hero insert props. Each one is a lit 3D object with its proof drawn on it (canvas textures), built to be the subject of a 1-1.5 s macro
// insert shot, so a key detail is SEEN, never only said:
//   signedBall      Leo's beat-up basketball with "KD" in black marker; step 2 fires the lightning (blue and gold bolts and sparks) between two hands
//   viralPhone      a phone whose screen shows the viral clip: "11-YEAR-OLD DROPS 40 AT TRYOUTS" and "1.4M VIEWS"
//   tvNewsSlump     a TV with the sports broadcast chyron "KEVIN DURANT: 0-12 - CAREER OVER?"
//   arenaScoreboard the hanging scoreboard: "THUNDER 88 | 00:05 | OPP 89"
// All turn about the vertical axis to face the camera (an insert is always square-on) and pop in on step 1 with the engine's snappy overshoot.
import * as THREE from "three";
import { mkTex as ctex } from "./tex";
import { easeSnap } from "./ease";
import type { PropRig } from "../props/registry";
import type { At } from "../props/kit";

const root0 = (a: At) => { const root = new THREE.Group(), pivot = new THREE.Group(); root.position.set(a.x, a.y ?? 0, a.z); root.scale.setScalar(a.s ?? 1); root.add(pivot); root.visible = false; return { root, pivot }; };
const face = (root: THREE.Group, camPos: THREE.Vector3) => { root.rotation.y = Math.atan2(camPos.x - root.position.x, camPos.z - root.position.z); };
const lit = (map: THREE.Texture, glow = 0.55, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ map, emissiveMap: map, emissive: "#ffffff", emissiveIntensity: glow, roughness: 0.4, ...o });
/** wrap text into lines of at most `w` px */
const wrap = (g: CanvasRenderingContext2D, text: string, w: number) => { const out: string[] = []; let line = ""; for (const word of text.split(" ")) { const t = line ? line + " " + word : word; if (g.measureText(t).width > w && line) { out.push(line); line = word; } else line = t; } if (line) out.push(line); return out; };
const cartoonKid = (g: CanvasRenderingContext2D, x: number, y: number, s: number, jersey: string) => {   // a tiny cartoon player, arms up, for thumbnails
  g.save(); g.translate(x, y); g.scale(s, s); g.lineWidth = 7; g.strokeStyle = "#1b1222"; g.fillStyle = "#c99067";
  g.beginPath(); g.ellipse(0, -118, 34, 38, 0, 0, 6.3); g.fill(); g.stroke(); g.fillStyle = "#2a201a"; g.beginPath(); g.ellipse(0, -140, 30, 18, 0, Math.PI, 0); g.fill();
  g.fillStyle = jersey; g.beginPath(); g.roundRect(-30, -80, 60, 80, 14); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-28, -70); g.lineTo(-58, -150); g.moveTo(28, -70); g.lineTo(58, -150); g.moveTo(-14, 0); g.lineTo(-30, 70); g.moveTo(14, 0); g.lineTo(34, 62); g.stroke(); g.restore();
};

// ---- the signed basketball ----
const ballTexture = () => ctex("kdball", 1024, 512, (g) => {
  let s = 17; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  g.fillStyle = "#c4601a"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 9000; i++) { const v = rnd(); g.fillStyle = v > 0.5 ? `rgba(255,170,90,${rnd() * 0.12})` : `rgba(60,20,0,${rnd() * 0.16})`; g.fillRect(rnd() * 1024, rnd() * 512, 2 + rnd() * 3, 2 + rnd() * 3); }
  g.strokeStyle = "#1a0e08"; g.lineWidth = 9; g.lineCap = "round";
  for (const x of [0, 256, 512, 768, 1024]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); }
  g.beginPath(); g.moveTo(0, 256); g.lineTo(1024, 256); g.stroke();
  for (const x of [128, 384, 640, 896]) { g.beginPath(); g.moveTo(x - 90, 0); g.quadraticCurveTo(x, 256, x - 90, 512); g.stroke(); g.beginPath(); g.moveTo(x + 90, 0); g.quadraticCurveTo(x, 256, x + 90, 512); g.stroke(); }
  for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(230,200,150,${0.1 + rnd() * 0.15})`; g.lineWidth = 2; const x = rnd() * 1024, y = rnd() * 512; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rnd() - 0.5) * 60, y + (rnd() - 0.5) * 30); g.stroke(); }
  // the signature: a quick black-marker "KD" with a loop and an underline, across the front panel
  g.strokeStyle = "#050505"; g.lineWidth = 14; g.lineJoin = "round";
  g.beginPath(); g.moveTo(150, 170); g.lineTo(158, 340); g.moveTo(240, 175); g.lineTo(168, 258); g.lineTo(250, 345); g.stroke();
  g.beginPath(); g.moveTo(290, 175); g.lineTo(285, 345); g.quadraticCurveTo(410, 350, 395, 255); g.quadraticCurveTo(385, 170, 290, 178); g.stroke();
  g.lineWidth = 9; g.beginPath(); g.moveTo(130, 372); g.quadraticCurveTo(280, 392, 430, 360); g.stroke();
});
export const signedBallRig = (a: At): PropRig => {
  const { root, pivot } = root0(a);
  const tex = ballTexture(); tex.anisotropy = 8;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 40, 28), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.62, bumpMap: tex, bumpScale: 0.6, emissiveMap: tex, emissive: "#ffffff", emissiveIntensity: 0.3 }));   // a faint glow of its own, so the signature reads in a dark tunnel
  ball.castShadow = true; ball.receiveShadow = true; pivot.add(ball);
  // the lightning: three bolts of 10 jagged segments (instanced thin boxes, unlit so they glow past the bloom threshold) running out of the ball to the left and the right hand, and sparks
  const SEG = 10, BOLTS = 4, n = SEG * BOLTS, bolt = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.018, 0.018), new THREE.MeshBasicMaterial({ toneMapped: false }), n);
  bolt.frustumCulled = false; bolt.visible = false; pivot.add(bolt);
  const col = new THREE.Color(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const spark = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 6, 4), new THREE.MeshBasicMaterial({ toneMapped: false }), 30); spark.frustumCulled = false; spark.visible = false; pivot.add(spark);
  const rnd = (i: number, f: number) => { const x = Math.sin(i * 127.1 + f * 311.7) * 43758.5453; return x - Math.floor(x); };
  return { root, update: (st) => {
    const s = st.step ?? 0, k = easeSnap(Math.min(1, s)), t = st.track?.t ?? 0;
    root.visible = s > 0; face(root, st.camPos);
    const sc = Math.max(0.001, k); pivot.scale.setScalar(sc); pivot.position.y = 0.012 * Math.sin(t * 2.2); ball.rotation.y = 0.35 + 0.18 * Math.sin(t * 0.9); ball.rotation.x = 0.12 * Math.sin(t * 0.7);
    // spark amplitude: 0 before step 2, a quick rise and a long fade over step 2, a faint flicker afterwards
    const f = Math.max(0, Math.min(1, s - 1)), amp = s < 1 ? 0 : s >= 3 ? 0 : s >= 2 ? 0.12 : Math.sin(Math.PI * Math.min(1, f * 1.15)) ** 0.6;
    bolt.visible = spark.visible = amp > 0.02;
    if (bolt.visible) {
      const frame = Math.floor(t * 24);
      for (let b = 0; b < BOLTS; b++) {
        const dir = b % 2 ? 1 : -1, ang = (b < 2 ? 0.15 : -0.3) * dir, len = (0.5 + 0.35 * amp) * dir;
        let px = 0.12 * dir, py = (b < 2 ? 0.02 : -0.04), pz = 0.05;
        for (let j = 0; j < SEG; j++) {
          const u = (j + 1) / SEG, nx = 0.12 * dir + len * u, ny = py + Math.sin(ang) * 0.05 + (rnd(b * 31 + j, frame) - 0.5) * 0.12 * amp, nz = 0.05 + (rnd(b * 17 + j, frame + 9) - 0.5) * 0.06;
          const dx = nx - px, dy = ny - py, dz = nz - pz, L = Math.hypot(dx, dy, dz) || 1e-4;
          q.setFromUnitVectors(V(1, 0, 0), V(dx / L, dy / L, dz / L)); m4.compose(V((px + nx) / 2, (py + ny) / 2, (pz + nz) / 2), q, V(L, 1 + amp * 1.2, 1 + amp * 1.2));
          bolt.setMatrixAt(b * SEG + j, m4); bolt.setColorAt(b * SEG + j, col.set(j % 3 === 0 ? "#ffd35a" : "#5ab4ff").multiplyScalar(3.2));
          px = nx; py = ny; pz = nz;
        }
      }
      bolt.instanceMatrix.needsUpdate = true; if (bolt.instanceColor) bolt.instanceColor.needsUpdate = true;
      for (let i = 0; i < 30; i++) { const r = rnd(i, frame) * Math.PI * 2, d = 0.15 + 0.5 * amp * rnd(i + 5, frame + 3); m4.compose(V(Math.cos(r) * d, Math.sin(r) * d * 0.7, 0.05), new THREE.Quaternion(), V(1 + 2 * amp, 1 + 2 * amp, 1 + 2 * amp)); spark.setMatrixAt(i, m4); spark.setColorAt(i, col.set(i % 2 ? "#ffd35a" : "#8fd0ff").multiplyScalar(3)); }
      spark.instanceMatrix.needsUpdate = true; if (spark.instanceColor) spark.instanceColor.needsUpdate = true;
    }
  } };
};

// ---- the viral phone ----
const phoneTexture = () => ctex("kdphone", 540, 1160, (g) => {
  g.fillStyle = "#0b0d14"; g.fillRect(0, 0, 540, 1160);
  g.fillStyle = "#ffffff"; g.font = "700 26px Arial, sans-serif"; g.fillText("9:41", 28, 44); g.fillText("●●● ▮", 440, 44);
  // the clip: a street court at sunset, a boy hanging off the rim
  const gr = g.createLinearGradient(0, 70, 0, 700); gr.addColorStop(0, "#ff9a4a"); gr.addColorStop(0.55, "#ffd89a"); gr.addColorStop(1, "#8fb0d8"); g.fillStyle = gr; g.fillRect(0, 70, 540, 640);
  g.fillStyle = "#4b4f55"; g.fillRect(0, 590, 540, 120); g.fillStyle = "#c8252d"; g.fillRect(380, 150, 120, 90); g.strokeStyle = "#ffffff"; g.lineWidth = 5; g.strokeRect(380, 150, 120, 90);
  g.strokeStyle = "#e86a1c"; g.lineWidth = 9; g.beginPath(); g.ellipse(440, 252, 40, 10, 0, 0, 6.3); g.stroke();
  cartoonKid(g, 340, 500, 1.05, "#d8302a");
  g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.arc(270, 390, 58, 0, 6.3); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(252, 360); g.lineTo(252, 420); g.lineTo(304, 390); g.closePath(); g.fill();
  g.fillStyle = "#ff2d55"; g.beginPath(); g.roundRect(24, 92, 118, 42, 10); g.fill(); g.fillStyle = "#fff"; g.font = "900 26px Arial Black, Arial, sans-serif"; g.fillText("VIRAL", 40, 122);
  // the headline and the proof
  g.fillStyle = "#ffffff"; g.font = "900 54px Arial Black, Arial, sans-serif"; g.textAlign = "left"; wrap(g, "11-YEAR-OLD DROPS 40 AT TRYOUTS", 490).forEach((l, i) => g.fillText(l, 28, 790 + i * 62));
  g.fillStyle = "#ffd35a"; g.font = "900 58px Arial Black, Arial, sans-serif"; g.fillText("— 1.4M VIEWS", 28, 1000);
  g.fillStyle = "#9aa3b2"; g.font = "700 28px Arial, sans-serif"; g.fillText("♥ 312K     💬 18.2K     ↗ 96K", 28, 1070);
  g.fillStyle = "#1b1f2c"; g.fillRect(0, 1100, 540, 60);
});
const phoneRigOf = (tex: () => THREE.Texture) => (a: At): PropRig => {
  const { root, pivot } = root0(a);
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.43, 0.026), new THREE.MeshStandardMaterial({ color: "#1a1c24", roughness: 0.3, metalness: 0.7 })); body.castShadow = true; pivot.add(body);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.185, 0.398), lit(tex(), 0.85, { roughness: 0.2 })); screen.position.z = 0.0135; pivot.add(screen);
  return { root, update: (st) => {
    const s = st.step ?? 0, k = easeSnap(Math.min(1, s)), t = st.track?.t ?? 0; root.visible = s > 0; face(root, st.camPos);
    pivot.scale.setScalar(Math.max(0.001, k)); pivot.rotation.z = 0.04 * Math.sin(t * 1.4) + (1 - k) * 0.4; pivot.position.y = 0.008 * Math.sin(t * 2);
  } };
};

export const viralPhoneRig = phoneRigOf(phoneTexture);
// the Thunder's text: a messages screen from "OKC THUNDER": "We want you."
const textTexture = () => ctex("kdtext", 540, 1160, (g) => {
  g.fillStyle = "#0b0d14"; g.fillRect(0, 0, 540, 1160); g.fillStyle = "#ffffff"; g.font = "700 26px Arial, sans-serif"; g.textAlign = "left"; g.fillText("9:41", 28, 44); g.fillText("●●● ▮", 440, 44);
  g.fillStyle = "#16203a"; g.fillRect(0, 70, 540, 130); g.fillStyle = "#1d428a"; g.beginPath(); g.arc(80, 135, 42, 0, 6.3); g.fill(); g.fillStyle = "#ef3b24"; g.beginPath(); g.moveTo(92, 108); g.lineTo(62, 142); g.lineTo(80, 142); g.lineTo(66, 168); g.lineTo(100, 130); g.lineTo(82, 130); g.closePath(); g.fill();
  g.fillStyle = "#ffffff"; g.font = "900 38px Arial Black, Arial, sans-serif"; g.fillText("OKC THUNDER", 140, 128); g.fillStyle = "#6fa0ff"; g.font = "700 22px Arial, sans-serif"; g.fillText("✓ Verified team account", 142, 162);
  g.fillStyle = "#8a93a8"; g.font = "700 22px Arial, sans-serif"; g.textAlign = "center"; g.fillText("Today 9:41 AM", 270, 262);
  g.fillStyle = "#2b3350"; g.beginPath(); g.roundRect(28, 300, 360, 150, 34); g.fill(); g.fillStyle = "#ffffff"; g.textAlign = "left"; g.font = "900 62px Arial Black, Arial, sans-serif"; g.fillText("We want", 60, 358); g.fillText("you.", 60, 424);
  g.fillStyle = "#2b3350"; g.beginPath(); g.roundRect(28, 480, 440, 90, 30); g.fill(); g.fillStyle = "#dfe6f5"; g.font = "700 30px Arial, sans-serif"; g.fillText("Suit up with KD. 🏀", 56, 536);
  g.fillStyle = "#1d6bff"; g.beginPath(); g.roundRect(330, 620, 190, 80, 30); g.fill(); g.fillStyle = "#fff"; g.font = "800 34px Arial, sans-serif"; g.fillText("YES!!", 372, 672);
});
export const thunderTextRig = phoneRigOf(textTexture);
// a quick stat graphic ("LEO: 30 PTS | Q3"), a flat panel that faces the camera
const statTexture = (text: string) => ctex("kdstat" + text, 768, 192, (g) => {
  g.fillStyle = "#0b1736"; g.beginPath(); g.roundRect(0, 0, 768, 192, 26); g.fill(); g.fillStyle = "#ef3b24"; g.fillRect(0, 150, 768, 42); g.fillStyle = "#ffb43a"; g.fillRect(0, 0, 24, 192);
  g.fillStyle = "#ffffff"; g.font = "900 78px Impact, Arial Black, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 396, 78);
  g.font = "800 28px Arial, sans-serif"; g.fillStyle = "#ffffff"; g.fillText("OKC THUNDER", 396, 171);
});
export const statGraphicRig = (a: At, text?: string): PropRig => {
  const { root, pivot } = root0(a);
  const m = lit(statTexture(text ?? "LEO: 30 PTS | Q3"), 1.0, { roughness: 0.5, transparent: true }); const quad = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), m); pivot.add(quad);
  return { root, update: (st) => { const s = st.step ?? 0, k = easeSnap(Math.min(1, s)), t = st.track?.t ?? 0; root.visible = s > 0; face(root, st.camPos); pivot.scale.set(Math.max(0.001, k), Math.max(0.001, k) * (1 + 0.15 * (1 - Math.min(1, s))), 1); pivot.position.y = 0.01 * Math.sin(t * 5); } };
};

// ---- the TV news slump ----
const tvTexture = () => ctex("kdtv", 1024, 576, (g) => {
  const gr = g.createLinearGradient(0, 0, 1024, 576); gr.addColorStop(0, "#14306a"); gr.addColorStop(1, "#0a1330"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 576);
  g.fillStyle = "#d9d2c0"; g.fillRect(0, 330, 1024, 120);   // the floor of the clip
  g.strokeStyle = "rgba(255,255,255,0.5)"; g.lineWidth = 5; g.strokeRect(520, 120, 150, 110); g.strokeStyle = "#e86a1c"; g.lineWidth = 8; g.beginPath(); g.ellipse(590, 240, 46, 11, 0, 0, 6.3); g.stroke();
  cartoonKid(g, 300, 430, 1.55, "#1d428a");   // KD, hands on his head (the arms up read as despair), the ball sailing off the backboard
  g.fillStyle = "#c4601a"; g.beginPath(); g.arc(760, 150, 26, 0, 6.3); g.fill(); g.strokeStyle = "#1a0e08"; g.lineWidth = 4; g.stroke();
  g.fillStyle = "#e8f0ff"; g.font = "900 34px Arial Black, Arial, sans-serif"; g.fillText("SPORTS DESK LIVE", 40, 56); g.fillStyle = "#ef3b24"; g.fillRect(780, 24, 210, 44); g.fillStyle = "#fff"; g.font = "900 28px Arial Black, Arial, sans-serif"; g.fillText("● LIVE", 806, 56);
  g.fillStyle = "#ef3b24"; g.fillRect(0, 410, 1024, 84); g.fillStyle = "#ffffff"; g.fillRect(0, 404, 1024, 8);
  g.fillStyle = "#ffffff"; g.font = "900 44px Arial Black, Arial, sans-serif"; g.fillText("KEVIN DURANT: 0-12 — CAREER OVER?", 28, 466);
  g.fillStyle = "#0c1020"; g.fillRect(0, 494, 1024, 82); g.fillStyle = "#ffd35a"; g.font = "800 30px Arial, sans-serif"; g.fillText("THUNDER STAR IN HISTORIC SLUMP • AIRBALLS • TURNOVERS • COACH: \"WE BELIEVE\"", 28, 546);
  g.fillStyle = "rgba(0,0,0,0.12)"; for (let y = 0; y < 576; y += 4) g.fillRect(0, y, 1024, 1);
});
export const tvNewsRig = (a: At): PropRig => {
  const { root, pivot } = root0(a);
  const frameM = new THREE.MeshStandardMaterial({ color: "#14161c", roughness: 0.5, metalness: 0.3 });
  const set = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.78, 0.12), frameM); set.position.y = 0.55; set.castShadow = true; pivot.add(set);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.3), frameM); stand.position.y = 0.1; pivot.add(stand); const neck = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 0.08), frameM); neck.position.y = 0.17; pivot.add(neck);
  const mat = lit(tvTexture(), 1.0, { roughness: 0.15 }); const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.7), mat); screen.position.set(0, 0.55, 0.062); pivot.add(screen);
  return { root, update: (st) => {
    const s = st.step ?? 0, k = easeSnap(Math.min(1, s)), t = st.track?.t ?? 0; root.visible = s > 0; face(root, st.camPos);
    pivot.scale.set(Math.max(0.001, k), Math.max(0.001, k) * (1 + 0.2 * (1 - Math.min(1, s))), Math.max(0.001, k));
    mat.emissiveIntensity = s < 1 ? 0.2 + 0.8 * (Math.sin(t * 90) > 0 ? 1 : 0.3) : 1.0 + 0.06 * Math.sin(t * 48);   // the screen flickers on, then holds with a faint hum
  } };
};

// ---- the arena scoreboard ----
const scoreTexture = () => ctex("kdscore", 1024, 560, (g) => {
  g.fillStyle = "#07090e"; g.fillRect(0, 0, 1024, 560); g.strokeStyle = "#2a3350"; g.lineWidth = 8; g.strokeRect(10, 10, 1004, 540);
  g.textAlign = "center"; g.font = "900 46px Arial Black, Arial, sans-serif"; g.fillStyle = "#8fb4ff"; g.fillText("THUNDER", 190, 92); g.fillStyle = "#ff8a6a"; g.fillText("OPP", 834, 92);
  g.font = "900 250px Arial Black, Arial, sans-serif"; g.fillStyle = "#ffb43a"; g.fillText("88", 190, 340); g.fillText("89", 834, 340);
  g.fillStyle = "#1a0d0d"; g.fillRect(352, 130, 320, 190); g.fillStyle = "#ff3030"; g.font = "900 128px Arial Black, Arial, sans-serif"; g.fillText("00:05", 512, 276);
  g.fillStyle = "#8fb4ff"; g.font = "900 44px Arial Black, Arial, sans-serif"; g.fillText("4TH QTR", 512, 400); g.fillStyle = "#ffd35a"; g.font = "800 34px Arial, sans-serif"; g.fillText("HOME", 190, 420); g.fillText("GUEST", 834, 420);
  g.fillStyle = "rgba(255,255,255,0.05)"; for (let x = 0; x < 1024; x += 8) g.fillRect(x, 0, 2, 560);
});
export const scoreboardRig = (a: At): PropRig => {
  const { root, pivot } = root0(a);
  const mat = lit(scoreTexture(), 1.3, { roughness: 0.3 }); const dark = new THREE.MeshStandardMaterial({ color: "#0c0f16", roughness: 0.5, metalness: 0.4 });
  const cube = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.45, 2.7), [mat, mat, dark, dark, mat, mat]); cube.castShadow = true; pivot.add(cube);
  for (const x of [-1.1, 1.1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 6), dark); c.position.set(x, 1.9, 0); pivot.add(c); }
  return { root, update: (st) => {
    const s = st.step ?? 0, k = easeSnap(Math.min(1, s)), t = st.track?.t ?? 0; root.visible = s > 0; face(root, st.camPos);
    pivot.scale.setScalar(Math.max(0.001, k)); mat.emissiveIntensity = 1.3 + 0.1 * Math.sin(t * 30);
  } };
};
