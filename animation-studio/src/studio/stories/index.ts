// Registry of storyboards. Each becomes a composition "Short-<id>" (Root.tsx) that the cloud render farm can render.
import type { Storyboard } from "../story/types";
import { LOCKED_OUT_KEYS } from "./locked-out-keys";
import { LOCKED_OUT_CLIMAX } from "./locked-out-climax";
import { LOCKED_OUT } from "./locked-out";
import { MARATHON1904 } from "./marathon-1904";
import { BURIEDTREASURE } from "./buried-treasure";
import { PIRATEDEMOCRACY } from "./pirate-democracy";
import { TICKLE } from "./tickle";
import { YAWN_DEMO } from "./yawn-demo";
import { CAPABILITIES } from "./capabilities";
import { INK_ORBIT } from "./ink-orbit";
import { DOORWAYEFFECT } from "./doorway-effect";
import { CAMERA_KIT } from "./camera-kit";
import { EXTRADOOR } from "./extra-door";
import { EXTRADOOR2 } from "./extra-door-2";
import { EVERYLIE } from "./every-lie";
import { FLOATAWAY } from "./float-away";
import { NIGHTSHIFT } from "./night-shift";

export const STORIES: Storyboard[] = [YAWN_DEMO, CAPABILITIES, TICKLE, PIRATEDEMOCRACY, BURIEDTREASURE, INK_ORBIT, DOORWAYEFFECT, CAMERA_KIT, MARATHON1904, EXTRADOOR, EXTRADOOR2, EVERYLIE, FLOATAWAY, NIGHTSHIFT, LOCKED_OUT_KEYS, LOCKED_OUT_CLIMAX, LOCKED_OUT];
