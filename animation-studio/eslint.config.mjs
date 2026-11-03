import { config } from "@remotion/eslint-config-flat";

export default [
  ...config,
  // Storyboards are plain data, not React animation code: their `transition: "fade"` fields are not CSS transitions.
  { files: ["src/studio/stories/**"], rules: { "@remotion/non-pure-animation": "off" } },
  // The creator's original BridgeShort engine is kept byte-for-byte (its output is a regression reference); its
  // style differences are not fixed in place.
  { files: ["src/videos/bridge/**"], rules: { "prefer-const": "off" } },
];
