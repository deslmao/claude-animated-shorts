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
  cast: { milo: "miloPirate", juno: "junoPirate", gus: "gusPirate", gusHurt: "gusSling", captain: "captain", qm: "quartermaster" },
  music: "adventure",
  shots: [
    // hook: feared pirates, cutlasses up and scowling... and on "democracies" every hand goes up for a vote
    { say: "Some of history's most feared pirates ran their ships like tiny democracies.", set: "shipDeck", light: "day",
      camera: { move: "pushIn", on: ["milo", "captain"], size: "medium", to: "medium", from: 6, height: 1.5 },
      actors: [
        { who: "milo", at: "a", act: "angry", hold: "sword", gesture: "hold", facing: "camera",
          beats: [{ word: "democracies", hold: null, gesture: "raiseHand", face: "grin" }] },
        { who: "captain", at: "b", act: "angry", hold: "sword", gesture: "hold", facing: "camera",
          beats: [{ word: "pirates", face: "determined" }, { word: "democracies", hold: null, gesture: "raiseHand", face: "smile" }] },
      ],
      crowd: { count: 6, era: "pirate", acts: ["angry", "determined"], beats: [{ word: "democracies", gesture: "raiseHand", face: "smile" }] } },
    // the articles: Mags holds out the scroll, Milo puts down the cutlass and signs it with a quill
    { say: "Picture a pirate crew in the early 1700s. Before anyone touches a sword, they sign a contract.", set: "shipDeck", light: "day", transition: "flash",
      camera: { move: "frame", on: ["milo", "qm"], size: "medium", from: 6, height: 1.45 },
      actors: [
        { who: "milo", at: [-0.18, 0, -1.15], act: "happy", hold: "sword", reach: "qm",
          beats: [{ word: "sword", face: "suspicious" }, { word: "sign", hold: "quill", gesture: "write", face: "determined" }] },
        { who: "qm", at: [0.42, 0, -1.3], act: "explain", hold: "scroll", reach: "milo",
          beats: [{ word: "Before", gesture: "offer", face: "stern" }, { word: "contract", face: "smile" }] },
      ],
      crowd: { count: 3, era: "pirate" } },
    // the shares: two purses for the captain, one for a sailor (panel above Mags)
    { say: "It says how the loot is shared, and the captain gets at most two shares to a sailor's one.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["qm", "diagram"], size: "full", from: -6, height: 1.45 },
      actors: [{ who: "qm", at: "b", act: "explain", face: "smile", facing: "camera", hold: "scroll",
        beats: [{ word: "two", gesture: "pointUp", hold: null }, { word: "one", face: "stern" }] }],
      diagram: { kind: "shares", with: "qm", place: "above", size: 1.0, steps: [{ word: "shared" }, { word: "two" }, { word: "one" }] } },
    // the injury fund: Gus, arm in a sling, is paid from the crew's purse
    { say: "Lose an arm in battle? The crew pays you from a shared fund.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["gusHurt", "qm"], size: "medium", from: 8, height: 1.4 },
      actors: [
        { who: "gusHurt", at: [-0.35, 0, -1.1], act: "sad", face: "pained", beats: [{ word: "fund", hold: "coinBag", act: "relief" }] },
        { who: "qm", at: [0.45, 0, -1.35], act: "neutral", face: "smile", hold: "coinBag", reach: "gusHurt",
          beats: [{ word: "pays", gesture: "offer" }, { word: "fund", hold: null, gesture: "present" }] },
      ],
      fx: [{ kind: "sweat", on: "gusHurt", word: "battle" }, { kind: "hearts", on: "gusHurt", word: "fund" }] },
    { say: "And the captain? He's elected.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "closeUp", on: "captain", from: -8, punch: true },
      actors: [{ who: "captain", at: "b", act: "suspicious", beats: [{ word: "elected", act: "proud" }] }],
      fx: [{ kind: "confetti", on: "captain", word: "elected" }] },
    // the captain at the helm, campaigning (his own voice)
    { say: { who: "captain", text: "I'd like to remind everyone that I'm very brave.", voice: "captainRedd" }, set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["captain"], size: "full", from: 12, height: 2.75 },
      actors: [{ who: "captain", at: "wheel", act: "nervous", gesture: "hips", facing: "camera", beats: [{ word: "remind", gesture: "pointUp" }, { word: "brave", act: "proud", gesture: "hips" }] }] },
    // the vote: the crew faces the captain and raises their hands; he recoils on "out"
    { say: "If he's a coward or a bully, the crew can vote him out and pick someone new.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["milo", "captain"], size: "medium", from: 8, height: 1.45 },
      actors: [
        { who: "milo", at: [-0.25, 0, -1.05], act: "suspicious", facing: "toward:captain", beats: [{ word: "vote", gesture: "raiseHand", face: "determined" }, { word: "new", act: "happy" }] },
        { who: "captain", at: [0.5, 0, -1.4], act: "nervous", facing: "camera", beats: [{ word: "coward", face: "scared" }, { word: "out", face: "shock", gesture: "coverMouth" }, { word: "new", act: "sad" }],
          moves: [{ word: "out", kind: "recoil", away: "milo", dur: 0.9 }] },
      ],
      crowd: { count: 5, era: "pirate", acts: ["suspicious", "neutral"], toward: "captain", beats: [{ word: "vote", gesture: "raiseHand", face: "determined" }] } },
    // the quartermaster: hands the captain his share over the chest... and blocks his grab for the rest
    { say: "A second elected officer, the quartermaster, hands out the food and loot, so the captain can't grab it all.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["qm", "captain", "treasureChest"], size: "medium", from: 4, height: 1.45 },
      actors: [
        { who: "qm", at: [-0.6, 0, -1.05], act: "explain", face: "smile", reach: "treasureChest",
          beats: [{ word: "hands", hold: "coinBag", gesture: "offer" }, { word: "loot", hold: null, gesture: "present" }, { word: "grab", gesture: "block", face: "stern" }] },
        { who: "captain", at: [0.9, 0, -1.05], act: "happy", reach: "treasureChest",
          beats: [{ word: "loot", hold: "coinBag", face: "grin" }, { word: "captain", hold: null, face: "suspicious" }, { word: "grab", gesture: "grab", face: "grin" }, { word: "all", act: "sad" }] },
      ],
      props: [{ id: "treasureChest", variant: "open", at: [0.15, 0, -1.05], yaw: 0 }] },
    { say: { text: "Wait, pirates were fair?", voice: "georgeLively" }, set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "dutch", on: ["milo"], size: "medium", from: -12, roll: 0.09 },
      actors: [{ who: "milo", at: "a", act: "confused", beats: [{ word: "fair", gesture: "scratchHead", face: "shock" }] }],
      fx: [{ kind: "question", on: "milo", word: "fair" }] },
    // the explanation: Juno the navigator with the chain-of-command panel (merchant side, then pirate side)
    { say: "You see, merchant ships had owners on land, and their captains could beat sailors into line.", set: "shipDeck", light: "day", transition: "fade", mood: "curious",
      camera: { move: "frame", on: ["juno", "diagram"], size: "medium", from: -8, height: 1.5 },
      actors: [{ who: "juno", at: "a", act: "explain", face: "smile", facing: "camera",
        beats: [{ word: "owners", gesture: "pointUp" }, { word: "beat", gesture: "present", face: "stern" }, { word: "line", face: "disgusted" }] }],
      diagram: { kind: "merchant", with: "juno", place: "above", size: 1.0, steps: [{ word: "owners" }, { word: "captains" }, { word: "beat" }] } },
    { say: "Pirates had no owners. The crew was the company, so they wrote rules to stop anyone becoming a tyrant.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["juno", "diagram"], size: "medium", from: -8, height: 1.5 },
      actors: [{ who: "juno", at: "a", act: "explain", face: "smile", facing: "camera",
        beats: [{ word: "company", gesture: "pointUp" }, { word: "rules", hold: "scroll", face: "talk" }, { word: "tyrant", face: "stern" }] }],
      diagram: { kind: "crew", with: "juno", place: "above", size: 1.0, steps: [{ word: "owners" }, { word: "company" }, { word: "rules" }, { word: "tyrant" }] } },
    { say: "Economist Peter Leeson argues it was the only way a ship of outlaws could work.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "pushIn", on: ["juno"], size: "full", to: "medium", from: -10, height: 1.45 },
      actors: [{ who: "juno", at: "b", act: "explain", hold: "book", face: "smile", beats: [{ word: "only", face: "talk" }] }],
      fx: [{ kind: "sparkle", on: "juno", word: "Leeson" }] },
    { say: "It wasn't perfect, and the rules varied from ship to ship.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["gus"], size: "full", from: 10, height: 1.4 },
      actors: [{ who: "gus", at: "c", act: "thinking", hold: "scroll", beats: [{ word: "varied", act: "shrug", hold: null }] }] },
    // "long before": the timeline panel above Gus, his arm in a sling, proudly holding his purse
    { say: "But some crews paid for injuries long before most countries had anything like it.", set: "shipDeck", light: "day", transition: "cut", mood: "adventure",
      camera: { move: "frame", on: ["gusHurt", "diagram"], size: "full", from: 8, height: 1.45 },
      actors: [{ who: "gusHurt", at: "c", act: "proud", hold: "coinBag", facing: "camera", beats: [{ word: "long", face: "grin" }] }],
      diagram: { kind: "timeline", with: "gusHurt", place: "above", size: 1.0, steps: [{ word: "paid" }, { word: "long" }, { word: "countries" }] } },
    // payoff: a committee meeting round the deck table; everyone votes, the captain facepalms
    { say: "So the scariest thing on the high seas might have been a pirate committee meeting.", set: "shipDeck", light: "day", transition: "fade",
      camera: { move: "frame", on: ["milo", "qm", "captain"], size: "full", from: 4, height: 1.75 },
      actors: [
        { who: "milo", at: [-0.6, 0, -2.32], act: "happy", facing: "camera", beats: [{ word: "meeting", gesture: "raiseHand", face: "grin" }] },
        { who: "qm", at: [0.25, 0, -2.45], act: "explain", hold: "scroll", facing: "camera", beats: [{ word: "committee", gesture: "raiseHand", face: "smile" }] },
        { who: "captain", at: [1.1, 0, -2.32], act: "nervous", facing: "camera", beats: [{ word: "committee", act: "facepalm" }] },
      ],
      props: [{ id: "deckTable", at: [0.25, 0, -1.55], yaw: 0 }],
      crowd: { count: 5, era: "pirate", acts: ["happy", "neutral"], beats: [{ word: "meeting", gesture: "raiseHand", face: "grin" }] },
      sfx: [{ name: "crowd_murmur", t: 0.1 }],
      fx: [{ kind: "sweat", on: "captain", word: "committee" }] },
  ],
};
