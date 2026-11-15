// The Whale City: the YouTube thumbnail still (productions/whale-city/final). Not a film: one frame, rendered at 2x
// and cropped to a 16:9 band. The film's own set and props: the city on the sleeping whale's back from its flank, the
// head with its closed eye, the tail's tips behind, the deep sea, at golden hour.
import type { Storyboard } from "../story/types";

const P = 6.2, STILL = [{ t: -0.7 }];
export const WHALE_CITY_THUMB: Storyboard = {
  id: "whale-city-thumb", title: "The Whale City (thumbnail)", cast: {}, music: false, captions: false, engine: 3, autoSfx: false,
  shots: [{ set: "whaleCity", light: "golden", dur: 1.0,
    camera: { move: "at", pos: [0, 5, -150], look: [0, 7, -40], fov: 70 },
    actors: [],
    props: [{ id: "whaleEye", at: [16, 1.7, -70.5], yaw: 168, variant: "shut", scale: 2.0, steps: STILL }, { id: "whaleEye", at: [-16, 1.7, -70.5], yaw: -168, variant: "shut", scale: 2.0, steps: STILL }, { id: "whaleTail", at: [0, 0, 138], variant: "rest", scale: 1.6, steps: STILL },
      { id: "blowhole", at: [0, P, -3], variant: "12", steps: STILL }, { id: "spout", at: [0, P + 12, -3], variant: "tall", scale: 3, steps: Array.from({ length: 30 }, (_, i) => ({ t: -4 + i * 0.15 })) }],
    note: "thumbnail: the city on the sleeping whale" },
  // the vertical cover (Shorts / Reels): the same scene framed for 9:16, the sky above for the title
  { set: "whaleCity", light: "golden", dur: 1.0,
    camera: { move: "at", pos: [0, 5, -121], look: [0, 12.5, -40], fov: 70 },
    actors: [],
    props: [{ id: "whaleEye", at: [13, 1.7, -73], yaw: 170, variant: "shut", scale: 2.0, steps: STILL }, { id: "whaleEye", at: [-13, 1.7, -73], yaw: -170, variant: "shut", scale: 2.0, steps: STILL },
      { id: "whaleTail", at: [0, 0, 138], variant: "rest", scale: 1.6, steps: STILL },
      { id: "blowhole", at: [0, P, -3], variant: "12", steps: STILL }, { id: "spout", at: [0, P + 12, -3], variant: "tall", scale: 3, steps: Array.from({ length: 30 }, (_, i) => ({ t: -4 + i * 0.15 })) }],
    note: "vertical cover: the city on the sleeping whale" }],
};
