// Placeable props (stage 3C): every prop a storyboard can put into a shot with `props: [{ id, at, yaw?, scale?,
// variant? }]`, with what it is for. The builders live in interior.ts / outdoor.ts / nature.ts (and theme files);
// this registry gives each a stable id, a footprint (metres, used to keep it on clear floor and off the cast), its
// height, themes and tags (asset search: `npm run assets -- search ...`), and named variants.
import type { Batch } from "../materials/geo";
import type * as THREE from "three";
import type { At } from "./kit";
import * as I from "./interior";
import * as O from "./outdoor";
import * as N from "./nature";
import { lootPilesRig, lootHeap, sharesOf } from "./economy";
import { parchmentRig, parchmentStatic, parchmentGuide, signaturesOf } from "./documents";
import { THEMES } from "../themes";

export type PropEntry = {
  name: string; desc: string; category: "furniture" | "lab" | "street" | "market" | "nature" | "theme";
  themes: string[]; tags: string[]; radius: number; height: number;
  /** a rectangular footprint, half-sizes [x, z] in metres before yaw (long tables, chests): actors may stand close to
   *  its edges; without it the prop's footprint is the circle of `radius` */
  box?: [number, number];
  build: (b: Batch, a: At) => void;
  variants?: Record<string, (b: Batch, a: At) => void>;
  /** an animated version (moving parts, posed every frame as a pure function of the inputs): used when a storyboard
   *  prop has follow / drive. target = the open hand it reaches for (world), stroke = the replayed control stroke */
  rig?: (a: At, variant?: string) => PropRig;
  /** a stepped rig: what its steps do, in order (story PropSpec.steps play them on words) */
  steps?: string[];
  /** a stepped prop that guides a reaching hand (a pen along a signature): where the hand is at step progress
   *  `step`, in the prop's local [x, z] metres on its top surface */
  guide?: (step: number, variant?: string) => [number, number];
  /** the sound effect each step makes (sound/catalog.ts), cued automatically */
  stepSfx?: string;
  /** how many steps a variant has (when it depends on the parameter) */
  stepCount?: (variant?: string) => number;
  /** a rig whose variant is a parameter (lootPiles "2-1"), not a named look: what it means and which values are valid */
  param?: { desc: string; ok: (v: string) => boolean };
  /** how far a rig reaches (checked by the validator): from its shoulder height, the length of the arm; lift = how
   *  far above the hand its effector stays (a feather hanging down) */
  reach?: { shoulder: number; length: number; lift: number };
};
/** step = a stepped prop's progress: n + the eased fraction of step n+1 (0 = before the first step) */
export type PropRig = { root: THREE.Object3D; update: (st: { target?: [number, number, number]; stroke: number; step?: number; camPos: THREE.Vector3 }) => void };

export const PROPS: Record<string, PropEntry> = {
  // furniture / home / school / office
  sofa: { name: "Sofa", desc: "three-seat sofa", category: "furniture", themes: ["modern", "home"], tags: ["seat", "living room"], radius: 1.1, height: 0.9, build: (b, a) => I.sofa(b, a) },
  armchair: { name: "Armchair", desc: "padded armchair", category: "furniture", themes: ["modern", "home"], tags: ["seat"], radius: 0.6, height: 0.95, build: (b, a) => I.armchair(b, a) },
  coffeeTable: { name: "Coffee table", desc: "low wooden table", category: "furniture", themes: ["modern", "home"], tags: ["table"], radius: 0.6, height: 0.45, build: (b, a) => I.coffeeTable(b, a) },
  bookshelf: { name: "Bookshelf", desc: "tall shelf of books", category: "furniture", themes: ["modern", "home", "school", "history"], tags: ["books", "library", "study"], radius: 0.7, height: 2.0, build: (b, a) => I.bookshelf(b, a) },
  floorLamp: { name: "Floor lamp", desc: "standing lamp", category: "furniture", themes: ["modern", "home"], tags: ["light"], radius: 0.3, height: 1.7, build: (b, a) => I.floorLamp(b, a) },
  plant: { name: "Pot plant", desc: "leafy plant in a pot", category: "furniture", themes: ["modern", "home", "office"], tags: ["green"], radius: 0.4, height: 1.0, build: (b, a) => I.plant(b, a) },
  clock: { name: "Wall clock", desc: "round wall clock (mount it on a wall: y ~2)", category: "furniture", themes: ["modern", "home", "school"], tags: ["time"], radius: 0.2, height: 0.4, build: (b, a) => I.clock(b, a) },
  desk: { name: "Desk", desc: "wooden office desk", category: "furniture", themes: ["modern", "office"], tags: ["work", "table"], radius: 0.8, height: 0.75, build: (b, a) => I.desk(b, a) },
  officeChair: { name: "Office chair", desc: "swivel chair", category: "furniture", themes: ["modern", "office"], tags: ["seat"], radius: 0.35, height: 1.0, build: (b, a) => I.officeChair(b, a) },
  monitor: { name: "Computer monitor", desc: "screen showing a chart / code / news", category: "furniture", themes: ["modern", "office"], tags: ["computer", "screen"], radius: 0.3, height: 0.5, build: (b, a) => I.monitor(b, a),
    variants: { chart: (b, a) => I.monitor(b, a, "chart"), code: (b, a) => I.monitor(b, a, "code"), news: (b, a) => I.monitor(b, a, "news") } },
  chair: { name: "Chair", desc: "simple wooden chair", category: "furniture", themes: ["modern", "home", "school"], tags: ["seat"], radius: 0.35, height: 0.9, build: (b, a) => I.chair(b, a) },
  schoolDesk: { name: "School desk", desc: "pupil's desk with seat", category: "furniture", themes: ["modern", "school"], tags: ["classroom"], radius: 0.6, height: 0.75, build: (b, a) => I.schoolDesk(b, a) },
  board: { name: "Chalkboard", desc: "board with a topic drawn on it (math / science / history / chart / formula / plan)", category: "furniture", themes: ["school", "science", "history"], tags: ["teaching", "explain"], radius: 1.6, height: 2.2, build: (b, a) => I.board(b, a),
    variants: Object.fromEntries((["math", "science", "history", "chart", "formula", "plan"] as const).map((t) => [t, (b: Batch, a: At) => I.board(b, a, 3.2, 1.2, "chalk", t)])) },
  filingCabinet: { name: "Filing cabinet", desc: "metal drawers", category: "furniture", themes: ["modern", "office"], tags: ["files"], radius: 0.35, height: 1.3, build: (b, a) => I.filingCabinet(b, a) },
  waterCooler: { name: "Water cooler", desc: "office water cooler", category: "furniture", themes: ["modern", "office"], tags: ["water"], radius: 0.3, height: 1.3, build: (b, a) => I.waterCooler(b, a) },
  // lab
  labBench: { name: "Lab bench", desc: "laboratory workbench", category: "lab", themes: ["science", "lab"], tags: ["experiment"], radius: 1.3, height: 0.95, build: (b, a) => I.labBench(b, a) },
  flask: { name: "Flask", desc: "glass flask with liquid (erlen / round / beaker / tube)", category: "lab", themes: ["science", "lab"], tags: ["chemistry", "experiment"], radius: 0.15, height: 0.3, build: (b, a) => I.flask(b, a),
    variants: { erlen: (b, a) => I.flask(b, a, "erlen"), round: (b, a) => I.flask(b, a, "round"), beaker: (b, a) => I.flask(b, a, "beaker"), tube: (b, a) => I.flask(b, a, "tube") } },
  microscope: { name: "Microscope", desc: "lab microscope", category: "lab", themes: ["science", "lab"], tags: ["biology", "small"], radius: 0.2, height: 0.4, build: (b, a) => I.microscope(b, a) },
  testTubeRack: { name: "Test-tube rack", desc: "rack of coloured test tubes", category: "lab", themes: ["science", "lab"], tags: ["chemistry"], radius: 0.2, height: 0.25, build: (b, a) => I.testTubeRack(b, a) },
  fumeHood: { name: "Fume hood", desc: "lab fume cupboard", category: "lab", themes: ["science", "lab"], tags: ["chemistry"], radius: 0.9, height: 2.2, build: (b, a) => I.fumeHood(b, a) },
  // street
  streetLamp: { name: "Street lamp", desc: "iron street lamp", category: "street", themes: ["modern", "city"], tags: ["light", "night"], radius: 0.25, height: 4.2, build: (b, a) => O.streetLamp(b, a) },
  bench: { name: "Park bench", desc: "wood and iron bench", category: "street", themes: ["modern", "city", "park"], tags: ["seat"], radius: 1.0, height: 0.9, build: (b, a) => O.bench(b, a) },
  bin: { name: "Litter bin", desc: "street bin", category: "street", themes: ["modern", "city"], tags: ["rubbish"], radius: 0.3, height: 0.9, build: (b, a) => O.bin(b, a) },
  hydrant: { name: "Fire hydrant", desc: "red hydrant", category: "street", themes: ["modern", "city"], tags: ["water"], radius: 0.2, height: 0.7, build: (b, a) => O.hydrant(b, a) },
  trafficLight: { name: "Traffic light", desc: "traffic signal on a pole", category: "street", themes: ["modern", "city"], tags: ["road"], radius: 0.25, height: 3.6, build: (b, a) => O.trafficLight(b, a) },
  car: { name: "Car", desc: "small hatchback car", category: "street", themes: ["modern", "city"], tags: ["vehicle", "road"], radius: 2.2, height: 1.5, build: (b, a) => O.car(b, a) },
  busStop: { name: "Bus stop", desc: "bus shelter", category: "street", themes: ["modern", "city"], tags: ["transport"], radius: 1.6, height: 2.6, build: (b, a) => O.busStop(b, a) },
  signPost: { name: "Sign post", desc: "street sign", category: "street", themes: ["modern", "city"], tags: ["sign"], radius: 0.2, height: 2.6, build: (b, a) => O.signPost(b, a) },
  mailbox: { name: "Post box", desc: "street post box", category: "street", themes: ["modern", "city"], tags: ["letter"], radius: 0.3, height: 1.2, build: (b, a) => O.mailbox(b, a) },
  // market / old town / history
  marketStall: { name: "Market stall", desc: "canopied stall (fruit / bread / cloth)", category: "market", themes: ["history", "medieval", "oldtown"], tags: ["shop", "trade"], radius: 1.4, height: 2.4, build: (b, a) => O.marketStall(b, a),
    variants: { fruit: (b, a) => O.marketStall(b, a, "#c0353a", "fruit"), bread: (b, a) => O.marketStall(b, a, "#e9a93b", "bread"), cloth: (b, a) => O.marketStall(b, a, "#3f6fb5", "cloth") } },
  barrel: { name: "Barrel", desc: "wooden barrel", category: "market", themes: ["history", "medieval", "pirates", "oldtown"], tags: ["storage", "cargo"], radius: 0.4, height: 0.9, build: (b, a) => O.barrel(b, a) },
  crate: { name: "Crate", desc: "wooden crate", category: "market", themes: ["history", "pirates", "oldtown"], tags: ["storage", "cargo"], radius: 0.45, height: 0.6, build: (b, a) => O.crate(b, a) },
  cart: { name: "Hand cart", desc: "wooden two-wheel cart", category: "market", themes: ["history", "medieval", "oldtown"], tags: ["transport"], radius: 1.3, height: 1.2, build: (b, a) => O.cart(b, a) },
  well: { name: "Well", desc: "stone well with roof", category: "market", themes: ["history", "medieval", "oldtown"], tags: ["water"], radius: 1.2, height: 2.4, build: (b, a) => O.well(b, a) },
  lanternPost: { name: "Lantern post", desc: "old-fashioned lantern on a post", category: "market", themes: ["history", "victorian", "oldtown"], tags: ["light", "night"], radius: 0.25, height: 3.2, build: (b, a) => O.lanternPost(b, a) },
  fountain: { name: "Fountain", desc: "stone fountain", category: "market", themes: ["history", "oldtown"], tags: ["water", "square"], radius: 2.2, height: 2.4, build: (b, a) => O.fountain(b, a) },
  // nature
  rock: { name: "Rock", desc: "mossy boulder", category: "nature", themes: ["nature"], tags: ["stone"], radius: 0.6, height: 0.8, build: (b, a) => N.rock(b, a) },
  log: { name: "Log", desc: "fallen log (a seat in the woods)", category: "nature", themes: ["nature"], tags: ["wood", "seat"], radius: 1.2, height: 0.45, build: (b, a) => N.log(b, a) },
  stump: { name: "Tree stump", desc: "cut stump", category: "nature", themes: ["nature"], tags: ["wood", "seat"], radius: 0.4, height: 0.45, build: (b, a) => N.stump(b, a) },
  flowers: { name: "Flowers", desc: "patch of flowers", category: "nature", themes: ["nature", "park"], tags: ["colour"], radius: 0.7, height: 0.3, build: (b, a) => N.flowers(b, a) },
  mushroom: { name: "Mushroom", desc: "spotted toadstool", category: "nature", themes: ["nature"], tags: ["fungus", "forest"], radius: 0.2, height: 0.3, build: (b, a) => N.mushroom(b, a) },
  fence: { name: "Wooden fence", desc: "rail fence, 6 m", category: "nature", themes: ["nature", "farm"], tags: ["boundary"], radius: 3.0, height: 1.0, build: (b, a) => N.fence(b, a) },
  picket: { name: "Picket fence", desc: "white picket fence, 6 m", category: "nature", themes: ["home", "farm"], tags: ["boundary"], radius: 3.0, height: 0.9, build: (b, a) => N.picket(b, a) },
  // economy kit (props/economy.ts): money explained in the world, stepped on words
  lootPiles: { name: "Loot piles", desc: "a heap of gold coins that streams into share stacks, then slides to who gets them (variant \"2-1\" = two shares to the first, one to the second; stands on a table top: at [x, 0.966, z])", category: "market",
    themes: ["money", "economy", "pirates", "history"], tags: ["money", "gold", "coins", "shares", "split", "pay", "wages", "loot", "economy"], radius: 0.3, height: 0.15, box: [0.62, 0.3],
    build: lootHeap, rig: lootPilesRig, stepSfx: "coins_pour", stepCount: (v) => 1 + sharesOf(v).length, param: { desc: "shares per recipient, e.g. 2-1", ok: (v) => /^[1-4](-[1-4]){1,2}$/.test(v) }, steps: ["the heap streams into equal share stacks", "the first recipient's stacks slide to its -x end", "the second recipient's slide to +x"] },
  // documents kit (props/documents.ts): a contract signed in the world, the writer's pen guided along each signature
  parchment: { name: "Parchment", desc: "a parchment lying flat on a table (articles, a contract, a charter): rolled ends, a heading, lines of writing, a red seal and signature lines; steps write the signatures one by one and guide the writer's hand (reach it with gesture \"write\"; variant \"1\"-\"3\" = signatures; at [x, table height, z])", category: "market",
    themes: ["history", "law", "pirates", "politics"], tags: ["contract", "articles", "sign", "signature", "document", "law", "rules", "charter", "treaty"], radius: 0.25, height: 0.02,
    build: parchmentStatic, rig: parchmentRig, guide: parchmentGuide, stepCount: (v) => signaturesOf(v), param: { desc: "number of signatures, 1-3", ok: (v) => /^[1-3]$/.test(v) }, steps: ["writes the first signature", "the second", "the third"] },
};

// every themed collection's props join the registry
for (const t of THEMES) Object.assign(PROPS, t.props ?? {});
