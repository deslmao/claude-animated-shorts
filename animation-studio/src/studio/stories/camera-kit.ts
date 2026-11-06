// QA scene for the Video 04 camera upgrade (reference clip 3): one shot that uses every new tool, so tests and
// regression frames can check them. A medium shot of Milo holding his keys, a SWOOP into a MACRO insert of the keys,
// a swoop back out, an EYE GLANCE (left, then back to the lens) and IN-WORLD TEXT on a sign and a score board, with a
// macro insert on the board. Not a production: no narration, no music, no captions.
import type { Storyboard } from "../story/types";

export const CAMERA_KIT: Storyboard = {
  id: "camera-kit", title: "Camera kit QA: swoop, macro insert, glance, in-world text", engine: 3, motionBlur: true, controlledBlur: true,
  captions: false, music: false, autoSfx: false,
  cast: { milo: "milo" },
  shots: [
    { dur: 6, set: "apartment", light: "interior",
      camera: { move: "frame", on: ["milo"], size: "medium", from: 15, height: 1.45 },
      cams: [
        { t: 1.0, move: "insert", on: "milo.held", size: "macro", from: 15, swoop: true },        // swoop into the keys
        { t: 2.2, move: "frame", on: ["milo"], size: "medium", from: 15, height: 1.45, swoop: 0.4 }, // and back out
        { t: 4.2, move: "insert", on: "scoreBoard", size: "macro", from: 0, swoop: true },          // the board's text
      ],
      props: [
        { id: "signBoard", variant: "FINISH", at: [3.0, 0, -1.95] },
        { id: "scoreBoard", variant: "3:28:53", at: [1.55, 0, -1.95] },
      ],
      actors: [{ who: "milo", at: "livingA", act: "happy", hold: "keys", facing: "camera",
        beats: [{ t: 2.8, look: "left", face: "smile" }, { t: 3.6, look: "camera", face: "smile_closed" }] }] },
  ],
};
