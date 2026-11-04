// QA scene for world-ink stability (Visual Storytelling 2.0, P4 / Checkpoint C): a slow continuous orbit around the
// hero treasure chest on the ship's deck, with a cannon, barrels, the rigging and the captain behind. Thin detail
// under steady camera motion is where outlines crawl, so this is the before / after test (npm run stability).
// Not a production: no narration, no music, no captions.
import type { Storyboard } from "../story/types";

export const INK_ORBIT: Storyboard = {
  id: "ink-orbit", title: "Ink stability QA: orbit around the hero chest", engine: 2, captions: false, music: false, autoSfx: false,
  cast: { captain: "captain" },
  shots: [
    { dur: 4, set: "shipDeck", light: "day",
      camera: { move: "orbit", on: ["captain", "heroChest"], fromDeg: [-28, 28], size: "full", height: 1.7 },
      props: [
        { id: "heroChest", variant: "open", at: [0.1, 0, -1.2] },
        { id: "cannon", at: [-1.6, 0, -2.3], yaw: 70 },
        { id: "barrel", at: [1.5, 0, -2.4] }, { id: "barrel", at: [1.95, 0, -2.0] },
      ],
      actors: [{ who: "captain", at: [0.95, 0, -1.4], act: "proud", facing: "camera" }] },
  ],
};
