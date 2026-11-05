// "Pirates ran surprisingly democratic ships" (stage 6, pirate test video 1). Script: productions/pirate-democracy/
// script.md (approved, word for word). Research + claim check: productions/pirate-democracy/research.md.
// Assets: the pirates theme (created for this Short): shipDeck set, captain + quartermaster, pirate outfits for the
// leads, the pirate crowd era, treasure chest, scroll and coin purse; plus library items (cutlass, book).
// Revision 2 (productions/pirate-democracy/revision-plan.md, approved): every action the narrator describes is shown.
// A menacing crew raises its hands on "democracies"; Milo signs the articles on Mags's scroll with a quill; the share
// split, the merchant vs pirate chain of command and the 1720s / 1884 timeline are explainer panels; Gus, his arm in a
// sling, is paid from the fund; the crew votes facing the captain; Mags hands the captain his share over the chest and
// blocks his grab for more; the payoff is a committee meeting round a deck table (daylight). The captain speaks in his
// own designed voice (captainRedd); "Wait, pirates were fair?" uses a more expressive take of George (georgeLively).
import type { Storyboard } from "../story/types";

export const PIRATEDEMOCRACY: Storyboard = {
  id: "pirate-democracy", title: "Pirates ran surprisingly democratic ships",
  cast: { milo: "miloPirate", juno: "junoPirate", gus: "gusPirate", gusHurt: "gusSling", captain: "captain", qm: "quartermaster",
    owner: "shipOwner", master: "merchantCaptain", sailorA: { extra: 2, era: "pirate" }, sailorB: { extra: 5, era: "pirate" }, sailorC: { extra: 9, era: "pirate" } },
  music: "adventure", motionBlur: true, engine: 2,
  shots: [
    // HOOK: low and menacing on the cutlass-waving crew (an impact on "feared")... then the camera pulls back and rises
    // over the whole crew as every blade becomes a raised hand on "democracies": the twist, told by the camera
    { say: "Some of history's most feared pirates ran their ships like tiny democracies.", set: "shipDeck", light: "day",
      camera: { move: "frame", on: ["milo", "captain"], size: "medium", from: 6, height: 0.95 },
      cams: [
        { word: "ships", move: "frame", on: ["milo", "captain"], size: "medium", from: 6, height: 0.95 },
        { word: "democracies", move: "at", pos: [2.0, 3.3, 3.4], look: [0.0, 1.35, -1.8], fov: 50, fly: true },
      ],
      kicks: [{ word: "feared" }],
      actors: [
        { who: "milo", at: [-0.35, 0, -1.0], act: "angry", hold: "sword", gesture: "hold", facing: "camera",
          beats: [{ word: "history's", gesture: "raiseHand", face: "angry" }, { word: "democracies", hold: null, gesture: "raiseHand", face: "grin" }] },
        { who: "captain", at: [0.4, 0, -1.3], act: "angry", hold: "sword", gesture: "hold", facing: "camera",
          beats: [{ word: "feared", gesture: "raiseHand", face: "determined" }, { word: "democracies", hold: null, gesture: "raiseHand", face: "smile" }],
          moves: [{ word: "feared", kind: "hop", dur: 0.5 }] },
      ],
      crowd: { count: 6, era: "pirate", acts: ["angry", "determined"], beats: [{ word: "history's", gesture: "fists", face: "angry" }, { word: "democracies", gesture: "raiseHand", face: "smile" }] } },
    // the articles, signed in the world: the crew round a deck table, the parchment lying on it; the captain lays down
    // his cutlass and signs, his quill travelling along the signature as it is written (the parchment guides his hand)
    { say: "Picture a pirate crew in the early 1700s. Before anyone touches a sword, they sign a contract.", set: "shipDeck", light: "day", transition: "flash",
      // "Picture a pirate crew": from high over the stern, the camera flies down to the crew, arriving on "1700s"
      camera: { move: "at", pos: [8.5, 7.5, 13], look: [0, 2.2, -3.5], fov: 50 },
      cams: [
        { word: "crew", move: "at", pos: [3.2, 3.6, 5.2], look: [0.1, 1.5, -1.6], fov: 46, fly: true },
        { word: "1700s", move: "frame", on: ["captain", "qm", "milo"], size: "wide", from: 10, height: 2.1, fly: true },
        { word: "Before", move: "insert", on: "captain.held", size: "close", from: 8 },
        // an angled close-up down onto the page: the hand, the quill and the signature all over the parchment
        { word: "sign", move: "insert", on: "captain.hands", size: "extreme", from: -30, height: 1.45 },
      ],
      props: [
        { id: "deckBoard", at: [0.1, 0, -1.4] },
        { id: "parchment", variant: "1", at: [-0.56, 0.966, -1.4], steps: [{ word: "sign" }] },
      ],
      actors: [
        { who: "captain", at: [-1.07, 0, -1.4], act: "proud", hold: "sword", reach: "parchment",
          beats: [{ word: "sword", face: "suspicious" }, { word: "sign", hold: "quill", gesture: "write", face: "determined" }] },
        { who: "qm", at: [0.25, 0, -2.15], act: "neutral", face: "stern", facing: "toward:captain", beats: [{ word: "contract", face: "smile" }] },
        { who: "milo", at: [1.3, 0, -1.35], act: "happy", facing: "toward:captain" },
      ],
      crowd: { count: 3, era: "pirate" } },
    // the shares, in the world: on a table on deck the loot heap streams into three equal stacks ("shared"); two slide
    // to the captain ("two"), one to Milo the sailor ("sailor's"). Top-down on the heap, then each end of the table
    { say: "It says how the loot is shared, and the captain gets at most two shares to a sailor's one.", set: "shipDeck", light: "day", transition: "cut", hold: 0.9,
      camera: { move: "insert", on: "lootPiles", size: "close", from: 4, height: 1.95 },
      cams: [
        // across the table from Milo's end: the stacks in the foreground, the captain behind them as two slide to him
        { word: "captain", move: "at", pos: [1.05, 1.42, -1.3], look: [-1.0, 1.1, -1.6], fov: 44, glide: 0.8 },
        // pull back and up to an overhead of the whole table as the sailor's one stack slides to Milo's end: two
        // stacks at the captain's end, one at Milo's, every stack separate (held 0.9 s to read)
        { word: "sailor's", move: "at", pos: [1.05, 3.3, -1.6], look: [0.12, 0.97, -1.6], fov: 40, glide: 0.7 },
      ],
      props: [
        { id: "deckBoard", at: [0.2, 0, -1.6] },
        { id: "lootPiles", variant: "2-1", at: [0.2, 0.966, -1.6], steps: [{ word: "shared" }, { word: "two" }, { word: "sailor's" }] },
      ],
      actors: [
        { who: "captain", at: [-1.08, 0, -1.55], act: "happy", facing: "toward:milo", beats: [{ word: "two", face: "grin", gesture: "cheer" }, { word: "sailor's", gesture: "hips", face: "proud" }] },
        { who: "milo", at: [1.62, 0, -1.55], act: "neutral", facing: "toward:captain", beats: [{ word: "one", face: "smile", gesture: "thumbsUp" }] },
      ] },
    // the injury fund: Gus winces in his sling ("battle?"); a glide to Mags as she hands him the crew's purse on "pays";
    // his relief, close, on "fund"
    { say: "Lose an arm in battle? The crew pays you from a shared fund.", set: "shipDeck", light: "day", transition: "whip",
      camera: { move: "frame", on: ["gusHurt"], size: "medium", from: 14, height: 1.35 },
      cams: [
        { word: "crew", move: "frame", on: ["gusHurt", "qm"], size: "medium", from: 8, height: 1.4, glide: 0.4 },
        { word: "fund", move: "closeUp", on: "gusHurt", from: 10 },
      ],
      actors: [
        { who: "gusHurt", at: [-0.35, 0, -1.1], act: "sad", face: "pained", facing: "toward:qm", beats: [{ word: "fund", hold: "coinBag", act: "relief" }] },
        { who: "qm", at: [0.45, 0, -1.35], act: "neutral", face: "smile", hold: "coinBag", reach: "gusHurt",
          beats: [{ word: "pays", gesture: "offer" }, { word: "fund", hold: null, gesture: "present" }] },
      ],
      fx: [{ kind: "sweat", on: "gusHurt", word: "battle" }, { kind: "hearts", on: "gusHurt", word: "fund" }] },
    { say: "And the captain? He's elected.", set: "shipDeck", light: "day", transition: "whip",
      camera: { move: "closeUp", on: "captain", from: -8, punch: true },
      actors: [{ who: "captain", at: "b", act: "suspicious", beats: [{ word: "elected", act: "proud" }] }],
      fx: [{ kind: "confetti", on: "captain", word: "elected" }] },
    // the captain campaigns at the helm, heroic from below (his own voice)... cut on "brave" to Mags and Milo below,
    // arms folded and unimpressed (a reaction shot)
    { say: { who: "captain", text: "I'd like to remind everyone that I'm very brave.", voice: "captainRedd" }, set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "lowHero", on: "captain", from: 192 },
      cams: [{ word: "brave", move: "frame", on: ["qm", "milo"], size: "medium", from: 180, height: 1.5 }],
      actors: [
        { who: "captain", at: "wheel", act: "nervous", gesture: "hips", facing: "camera", beats: [{ word: "remind", gesture: "pointUp" }, { word: "brave", act: "proud", gesture: "hips" }] },
        { who: "qm", at: [-0.5, 0, 4.3], act: "neutral", gesture: "crossArms", face: "suspicious", facing: "toward:captain" },
        { who: "milo", at: [0.45, 0, 4.15], act: "neutral", face: "suspicious", facing: "toward:captain", beats: [{ word: "brave", gesture: "facepalm" }] },
      ] },
    // (the captain's dark goatee hides thin-line mouths: his key beats use faces with teeth or wide eyes, which read)
    // the vote: "coward" (he cowers), "bully" (he bullies)... on "vote" we see what he sees: the crew's raised hands,
    // aimed at him (his point of view); on "out", his shock, close
    { say: "If he's a coward or a bully, the crew can vote him out and pick someone new.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["captain"], size: "medium", from: -10, height: 1.45 },
      cams: [
        { word: "vote", move: "at", pos: [0.23, 1.4, -1.28], look: [-1.35, 1.45, -0.55], fov: 62 }, // his eyeline, wide enough for the raised hands
        { word: "out", move: "closeUp", on: "captain", from: -6, punch: true },
      ],
      actors: [
        { who: "milo", at: [-1.35, 0, -0.55], act: "suspicious", facing: "toward:captain", beats: [{ word: "can", gesture: "raiseHand", face: "determined" }, { word: "new", act: "happy" }] },
        { who: "captain", at: [0.5, 0, -1.4], act: "nervous", facing: "camera",
          beats: [{ word: "coward", act: "scared" }, { word: "bully", act: "angry", gesture: "fists" }, { word: "out", face: "shock", gesture: "coverMouth" }, { word: "pick", act: "sad", face: "pained" }],
          moves: [{ word: "out", kind: "recoil", away: "milo", dur: 0.9 }] },
      ],
      crowd: { count: 5, era: "pirate", acts: ["suspicious", "neutral"], toward: "captain", forBeat: 1, beats: [{ word: "can", gesture: "raiseHand", face: "determined" }] } },
    // the quartermaster: Mags, heroic from below ("a second elected officer"); the handover over the chest, close; on
    // "grab" the camera pushes down onto the chest as his hand dives for the gold and hers blocks it; he sulks
    { say: "A second elected officer, the quartermaster, hands out the food and loot, so the captain can't grab it all.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "lowHero", on: "qm", from: -8 },
      cams: [
        { word: "hands", move: "frame", on: ["qm", "captain"], size: "medium", from: 30, height: 1.4, glide: 0.4 },
        { word: "grab", move: "frame", on: ["qm", "captain"], size: "medium", from: 34, height: 1.2, glide: 0.3 },
      ],
      actors: [
        { who: "qm", at: [-0.6, 0, -1.05], act: "proud", face: "smile", reach: "heroChest",
          beats: [{ word: "hands", hold: "coinBag", gesture: "offer", face: "smile" }, { word: "loot", hold: null, gesture: "present" }, { word: "grab", gesture: "block", face: "stern" }] },
        { who: "captain", at: [0.9, 0, -1.05], act: "happy", reach: "heroChest",
          beats: [{ word: "loot", hold: "coinBag", face: "grin" }, { word: "captain", hold: null, face: "suspicious" }, { word: "grab", gesture: "grab", face: "grin" }, { word: "all", face: "pained" }] },
      ],
      fx: [{ kind: "sparkle", on: "qm", word: "elected" }],
      props: [{ id: "heroChest", variant: "open", at: [0.15, 0, -1.05], yaw: 0 }] },
    { say: { text: "Wait, pirates were fair?", voice: "georgeLively" }, set: "shipDeck", light: "day", transition: "whip",
      camera: { move: "dutch", on: ["milo"], size: "medium", from: -12, roll: 0.09 },
      actors: [{ who: "milo", at: "a", act: "confused", beats: [{ word: "fair", gesture: "scratchHead", face: "shock" }] }],
      fx: [{ kind: "question", on: "milo", word: "fair" }] },
    // OWNERS ON LAND (Visual Storytelling 2.0): the explanation happens in the world, one line across three places.
    // "merchant ships": a merchant deck, cargo crates, a stern master; the camera rises off the ship...
    { say: "You see, merchant ships had owners on land, and their captains could beat sailors into line.", until: { word: "owners" },
      set: "merchantDeck", light: "day", transition: "whip", mood: "curious",
      camera: { move: "frame", on: ["master", "sailorA"], size: "medium", from: 22, height: 1.7 },
      // rising off the deck and turning to the horizon: the zoom-through then flies on over the sea toward land
      cams: [
        { word: "merchant", move: "frame", on: ["master", "sailorA"], size: "medium", from: 22, height: 1.7 }, // held until "merchant", then...
        { word: "had", move: "at", pos: [3.4, 6.8, 7.5], look: [-8, 6.0, -40], fov: 50, fly: true },
      ],
      // the red ensign behind the master: a merchant ship's colours, where the pirates fly the Jolly Roger
      props: [{ id: "crate", at: [-0.1, 0, -2.6] }, { id: "crate", at: [0.55, 0, -2.75], yaw: 20 }, { id: "barrel", at: [1.25, 0, -2.5] }, { id: "redEnsign", at: [-1.7, 0, -2.6] }],
      actors: [
        { who: "master", at: [-0.9, 0, -1.15], act: "angry", hold: "cane", facing: "toward:sailorA" },
        { who: "sailorA", at: [0.45, 0, -1.6], act: "nervous", facing: "toward:master" },
        { who: "sailorB", at: [1.15, 0, -1.75], act: "sad", facing: "toward:master" },
      ] },
    // ...and zooms through into the old town: "owners on land", the shipowner at his counting desk with the profits
    { cont: true, until: { word: "their" }, set: "oldtown", light: "day", transition: "zoom",
      camera: { move: "at", pos: [2.8, 8.5, 9.5], look: [0.2, 1.0, 1.2], fov: 46 },
      cams: [{ word: "land", move: "frame", on: ["owner"], size: "medium", from: 0, height: 1.55, fly: true }],
      props: [{ id: "countingDesk", at: [0.2, 0, 2.2] }, { id: "lootPiles", at: [-0.15, 0.92, 2.2] }],
      actors: [{ who: "owner", at: [0.2, 0, 1.5], act: "proud", hold: "coinBag", facing: "camera", beats: [{ word: "land", face: "smile_closed" }, { word: "and", face: "grin" }] }] },
    // match cut: the owner's framing becomes the master's (same size, same angle): the chain of command. On "beat" the
    // cane comes up with a crack (no blow shown); whip to the sailors, who flinch and then stand rigid in a line
    { cont: true, set: "merchantDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["master"], size: "medium", from: 0, height: 1.55 },
      cams: [
        // on "beat" the camera eases back as the cane goes up high (the whole raise in frame; no blow is shown)
        { word: "beat", move: "frame", on: ["master"], size: "full", from: 0, height: 1.7, glide: 0.25 },
        { word: "into", move: "frame", on: ["sailorA", "sailorB", "sailorC"], size: "full", from: -6, height: 1.45, whip: true },
      ],
      kicks: [{ word: "beat" }],
      props: [{ id: "crate", at: [-0.1, 0, -2.6] }, { id: "crate", at: [0.55, 0, -2.75], yaw: 20 }, { id: "barrel", at: [1.25, 0, -2.5] }],
      actors: [
        { who: "master", at: [-0.9, 0, -1.15], act: "angry", hold: "cane", facing: "camera", beats: [{ word: "beat", gesture: "raiseHand", face: "angry" }] },
        { who: "sailorA", at: [0.35, 0, -1.6], act: "nervous", facing: "camera", beats: [{ word: "beat", act: "scared" }, { word: "line", act: "neutral", face: "scared" }] },
        { who: "sailorB", at: [1.05, 0, -1.65], act: "nervous", facing: "camera", beats: [{ word: "beat", act: "scared" }, { word: "line", act: "neutral", face: "scared" }] },
        { who: "sailorC", at: [1.75, 0, -1.7], act: "nervous", facing: "camera", beats: [{ word: "beat", act: "scared" }, { word: "line", act: "neutral", face: "scared" }] },
      ] },
    // PIRATES: no owner's flag but their own; the camera tilts down the Jolly Roger to the crew, who raise every hand
    // (the crew is the company); Mags writes the rules down; the captain lifts a crown... and the crew's glare makes
    // him lower it (rules against a tyrant)
    { say: "Pirates had no owners. The crew was the company, so they wrote rules to stop anyone becoming a tyrant.", set: "shipDeck", light: "day", transition: "whip", mood: "adventure",
      camera: { move: "at", pos: [-0.9, 3.0, 1.0], look: [-2.3, 3.0, -3.0], fov: 42 },
      cams: [
        { word: "crew", move: "frame", on: ["qm", "captain"], size: "full", from: 0, height: 4.8, fly: true },
        // the vote, close: a camera among the crew as every hat goes up (big shapes that read on a phone)
        { word: "company", move: "at", pos: [0.1, 2.9, 1.9], look: [0.0, 1.45, -2.6], fov: 50 },
        { word: "wrote", move: "insert", on: "qm.hands", size: "extreme", from: -30, height: 1.85 },
        { word: "anyone", move: "frame", on: ["captain"], size: "medium", from: -6, height: 1.5 },
        { word: "tyrant", move: "closeUp", on: "captain", from: -4 },
      ],
      props: [
        { id: "jollyRoger", at: [-2.3, 0, -3.0] },
        { id: "deckBoard", at: [0.1, 0, 0.2] },
        { id: "parchment", variant: "1", at: [-0.56, 0.966, 0.2], steps: [{ word: "wrote" }] },
      ],
      actors: [
        { who: "qm", at: [-1.17, 0, 0.2], act: "determined", reach: "parchment", hold: "quill", facing: "camera", beats: [{ word: "wrote", gesture: "write" }, { word: "anyone", gesture: "crossArms", hold: null }, { word: "tyrant", face: "stern" }] },
        { who: "captain", at: [1.3, 0, 0.25], act: "happy", facing: "camera",
          beats: [{ word: "company", gesture: "raiseHand" }, { word: "anyone", hold: "crown", gesture: "raiseHand", face: "grin" }, { word: "tyrant", hold: null, act: "embarrassed", face: "scared" }] },
      ],
      fx: [{ kind: "sweat", on: "captain", word: "tyrant" }],
      // the vote: every pirate raises a hat (a big shape that reads on a phone, where a thin raised arm doesn't)
      crowd: { count: 6, era: "pirate", around: [0.0, 0, -2.4], radius: 2.8, beats: [{ word: "company", gesture: "raiseHand", hold: "tricorn", face: "smile" }, { word: "tyrant", gesture: "crossArms", hold: null, face: "angry" }] } },
    // Leeson's argument: Juno with his book... on "only way" the camera rises off her to the whole crew running the
    // ship together ("a ship of outlaws could work")
    { say: "Economist Peter Leeson argues it was the only way a ship of outlaws could work.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "pushIn", on: ["juno"], size: "medium", to: "close", from: -10, height: 1.5 },
      cams: [
        { word: "only", move: "frame", on: ["juno"], size: "medium", from: -10, height: 1.5, glide: 0.3 },
        { word: "work", move: "at", pos: [-3.4, 7.2, 6.5], look: [0.2, 1.6, -4.0], fov: 52, fly: true },
      ],
      actors: [{ who: "juno", at: "b", act: "explain", hold: "openBook", gesture: "read", face: "smile", beats: [{ word: "argues", gesture: "present", hold: "book" }, { word: "only", face: "talk" }] }],
      crowd: { count: 6, era: "pirate", acts: ["determined", "happy"], forBeat: 2 }, // staged for the rise on "work"
      fx: [{ kind: "sparkle", on: "juno", word: "Leeson" }] },
    // "rules varied from ship to ship": three pirates in a row along the deck, each with a different rule book; the
    // camera whips sideways from one to the next
    { say: "It wasn't perfect, and the rules varied from ship to ship.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["gus"], size: "full", from: 0, height: 1.45 },
      cams: [
        { word: "rules", move: "frame", on: ["juno"], size: "medium", from: 0, height: 1.5, whip: true },
        { word: "ship", move: "frame", on: ["milo"], size: "medium", from: 0, height: 1.45, whip: true },
      ],
      actors: [
        { who: "gus", at: [-2.3, 0, -1.2], act: "thinking", hold: "scroll", facing: "camera", beats: [{ word: "perfect", act: "shrug", hold: null }] },
        { who: "juno", at: [0, 0, -1.2], act: "explain", hold: "openBook", gesture: "read", facing: "camera" },
        { who: "milo", at: [2.3, 0, -1.2], act: "confused", hold: "scroll", gesture: "hold", facing: "camera", beats: [{ word: "ship", face: "suspicious" }] },
      ] },
    // "long before": the timeline panel above Gus with his injury purse (a short comparison, where a panel is the
    // clearest picture: 1720s pirate payouts vs Germany's 1884 accident insurance law)
    { say: "But some crews paid for injuries long before most countries had anything like it.", set: "shipDeck", light: "day", transition: "cut", mood: "adventure",
      camera: { move: "frame", on: ["gusHurt", "diagram"], size: "full", from: 8, height: 1.45 },
      actors: [{ who: "gusHurt", at: "c", act: "proud", hold: "coinBag", facing: "camera", beats: [{ word: "long", face: "grin" }] }],
      diagram: { kind: "timeline", with: "gusHurt", place: "above", size: 1.0, steps: [{ word: "paid" }, { word: "long" }, { word: "countries" }] } },
    // payoff: "the scariest thing on the high seas" (the ship at sea, from high)... the camera flies down into a
    // committee meeting as every hand goes up on "might"; the captain facepalms on "committee"
    { say: "So the scariest thing on the high seas might have been a pirate committee meeting.", set: "shipDeck", light: "day", transition: "fade",
      camera: { move: "at", pos: [9.5, 8.5, 12], look: [0, 3.0, -3.5], fov: 52 },
      cams: [
        { word: "seas", move: "at", pos: [9.5, 8.5, 12], look: [0, 3.0, -3.5], fov: 52 },
        { word: "pirate", move: "frame", on: ["milo", "qm", "captain"], size: "medium", from: 4, height: 1.55, fly: true },
        { word: "committee", move: "closeUp", on: "captain", from: 6 },
      ],
      actors: [
        { who: "milo", at: [-0.6, 0, -2.32], act: "happy", facing: "camera", beats: [{ word: "might", gesture: "raiseHand", face: "grin" }] },
        { who: "qm", at: [0.25, 0, -2.45], act: "explain", hold: "scroll", facing: "camera", beats: [{ word: "pirate", gesture: "raiseHand", face: "smile" }] },
        { who: "captain", at: [1.1, 0, -2.32], act: "nervous", facing: "camera", beats: [{ word: "committee", act: "facepalm" }] },
      ],
      props: [{ id: "deckTable", at: [0.25, 0, -1.55], yaw: 0 }],
      crowd: { count: 5, era: "pirate", acts: ["happy", "neutral"], beats: [{ word: "might", gesture: "raiseHand", face: "grin" }] },
      sfx: [{ name: "crowd_murmur", t: 0.1 }],
      fx: [{ kind: "sweat", on: "captain", word: "committee" }] },
  ],
};
