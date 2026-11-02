/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setChromiumOpenGlRenderer("angle");
Config.setVideoImageFormat("jpeg");

// Cloud/Linux containers without internet access to remotion.media: use a pre-installed headless Chrome if present.
// Set REMOTION_BROWSER to override. On a normal PC nothing is found and Remotion uses its own browser as usual.
import fs from "node:fs";
const browserCandidates = [
  process.env.REMOTION_BROWSER,
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
].filter((p): p is string => !!p);
const browser = browserCandidates.find((p) => fs.existsSync(p));
if (browser) Config.setBrowserExecutable(browser);
// No GPU in the cloud: REMOTION_GL=swangle (ANGLE on SwiftShader, CPU) — slower but works anywhere.
if (process.env.REMOTION_GL) Config.setChromiumOpenGlRenderer(process.env.REMOTION_GL as "angle" | "swangle" | "swiftshader" | "egl" | "vulkan" | "angle-egl");
