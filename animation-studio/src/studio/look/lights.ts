// Light presets per time of day. The sun is CAMERA-RELATIVE and frozen per shot (world.ts update()):
// az = degrees from the shot camera's forward axis (0 = sun straight ahead = backlight, +90 = screen right,
// 180 = behind camera), el = elevation. lit/shade/lift are LINEAR RGB multipliers for shade.ts (may exceed 1).
// Field names follow lighting.md 9.1 exactly (the CHAR and POST agents read them); values are tuned on renders.
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cast.ts)
  blob: C3; actorShadow: boolean;                                                    // contact blobs / card shadows
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string; // depth.md 6.5
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights (unpatched mats only)
  bias: number; normalBias: number;
  /** character card brightness (default 1.03, the calibrated day value; night dims the cards) */
  charGain?: number;
};
export const LIGHTS: Record<"day" | "golden" | "interior" | "interiorCool" | "night", LightPreset> = {
  day: {
    az: 75, el: 48,
    lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 25, fogFar: 300, sunDisc: "#000000",
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  golden: {
    az: 6, el: 7,
    lit: [1.5, 0.68, 0.24], shade: [0.15, 0.15, 0.3], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
    blob: [0.75, 0.74, 0.9], actorShadow: true,
    top: "#6a4f8c", hor: "#ffd08a", skyCurve: [0.05, 0.6, 1.0], fog: "#efb489", fogNear: 50, fogFar: 380, sunDisc: "#ffcf9e",
    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
  // Stage 1C: rooms. A warm key from behind the camera's shoulder (camera-relative az 140 / el 42: walls facing the
  // lens are lit; a backlight left them lilac-grey, the creator's warning), softer and warmer shade than outdoors
  // (no blue sky fill indoors), characters slightly warm. Walls do not cast shadows (sets build them with cast off),
  // so the key lights the floor and props and gives every prop a grounded contact shadow.
  interior: {
    az: 140, el: 42,
    lit: [1.42, 1.3, 1.12], shade: [0.62, 0.53, 0.52], lift: [0.08, 0.06, 0.06], lambert: 0.3, sideK: 0.88, term: 0.25,
    charTint: [1.0, 0.95, 0.9], charShade: 0.9, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.93, 0.9, 0.95],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#efe2cc", fogNear: 60, fogFar: 900, sunDisc: "#000000",
    sunCol: "#fff0d8", sunI: 2.6, sky: "#f3e6d0", ground: "#b49a78", hemiI: 0.55,
    bias: -0.0003, normalBias: 0.012,
  },
  // Stage 1D: cool clinical light (labs, hospitals, tense explanations): same rig as interior, blue-white key,
  // blue-grey shade (never lilac: the albedos under it are warm whites and mint)
  interiorCool: {
    az: 140, el: 46,
    lit: [1.32, 1.37, 1.42], shade: [0.52, 0.55, 0.62], lift: [0.06, 0.07, 0.09], lambert: 0.3, sideK: 0.88, term: 0.25,
    charTint: [0.97, 0.98, 1.0], charShade: 0.9, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.9, 0.92, 0.98],
    blob: [0.6, 0.6, 0.64], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#dfe6ea", fogNear: 60, fogFar: 900, sunDisc: "#000000",
    sunCol: "#eef4ff", sunI: 2.6, sky: "#e6eef4", ground: "#9aa4ac", hemiI: 0.55,
    bias: -0.0003, normalBias: 0.012,
  },
  // Stage 1D: moonlit night. Cool key from behind the camera's shoulder, deep navy shade, dark blue haze, pale moon
  // disc; glowing windows / lamps / screens become the warm accents. Characters are dimmed and cooled but stay readable.
  night: {
    az: 125, el: 34,
    lit: [0.42, 0.5, 0.8], shade: [0.08, 0.1, 0.22], lift: [0.02, 0.03, 0.08], lambert: 0.35, sideK: 0.82, term: 0.2,
    charTint: [0.82, 0.88, 1.0], charShade: 0.85, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.8, 0.83, 1.0],
    blob: [0.5, 0.5, 0.62], actorShadow: false,
    top: "#0b1636", hor: "#2c3f6e", skyCurve: [0.0, 0.5, 0.6], fog: "#1f2c52", fogNear: 28, fogFar: 260, sunDisc: "#e8eefc",
    sunCol: "#b8c8ff", sunI: 1.2, sky: "#33456e", ground: "#1a1a2a", hemiI: 0.4,
    bias: -0.00025, normalBias: 0.015, charGain: 0.74,
  },
};

/** world-only look per light (sky stops by elevation in degrees, river colours, cloud palette). All colours are
 *  ON-SCREEN targets under the current PBR-Neutral tone map; world.ts pre-inverts the tone map (shade.ts untone). */
export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg), smoothstep between
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;                                                 // shade.ts uBounce: albedo x bounce on shaded faces turned to the lens
  sat: number;                                                // shade.ts uSat: world albedo saturation (1 = as painted)
  cloud: { lit: string; mid: string; shade: string };
};
export const LOOK: Record<"day" | "golden" | "interior" | "interiorCool" | "night", WorldLook> = {
  day: {
    // depth.md 2.2: horizon #9fb6e6 just above the skyline, upper sky #5e93d9 at ~20 deg (grade: frame top #5997e2)
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.08,
  },
  golden: {
    // sunset, not dusk: #ffd08a horizon, peach/orange through ~10 deg, warm rose at 20, muted warm mauve only near the top
    // (the golden grade adds ~+11/255 blue to shadows/mids, so these lean warm)
    sky: { c: ["#ffc47c", "#f7ae78", "#e8967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
  interior: {
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0.03, 0.02, 0.0],
    sat: 1.05,
  },
  interiorCool: {
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0.0, 0.01, 0.02],
    sat: 1.0,
  },
  night: {
    sky: { c: ["#2c3f6e", "#22335d", "#18264a", "#101b38", "#0a1330"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1a3d66", mid: "#132f55", far: "#0e2244", crest: "#4f78b0", trough: "#0a1a36", glint: "#d8e4ff", shade: [0.4, 0.45, 0.65] },
    cloud: { lit: "#6a7aa6", mid: "#465480", shade: "#2a3456" },
    bounce: [0, 0, 0],
    sat: 0.95,
  },
};
