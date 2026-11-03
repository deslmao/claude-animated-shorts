// "Pirates ran surprisingly democratic ships" (stage 6, pirate test video 1). Script: productions/pirate-democracy/
// script.md (approved, word for word). Research + claim check: productions/pirate-democracy/research.md.
// Assets: the pirates theme (created for this Short): shipDeck set, captain + quartermaster, pirate outfits for the
// leads, the pirate crowd era, treasure chest, scroll and coin purse; plus library items (cutlass, book).
import type { Storyboard } from "../story/types";

export const PIRATEDEMOCRACY: Storyboard = {
  id: "pirate-democracy", title: "Pirates ran surprisingly democratic ships",
  cast: { milo: "miloPirate", juno: "junoPirate", gus: "gusPirate", captain: "captain", qm: "quartermaster" },
  music: "adventure",
  shots: [
    // hook: the feared captain and his crew
    { say: "Some of history's most feared pirates ran their ships like tiny democracies.", set: "shipDeck", light: "day",
      camera: { move: "pushIn", on: ["captain"], size: "full", to: "medium", from: 8, height: 1.3 },
      actors: [{ who: "captain", at: "b", act: "determined", beats: [{ word: "democracies", act: "embarrassed" }] }],
      crowd: { count: 6, era: "pirate" },
      fx: [{ kind: "question", on: "captain", word: "democracies" }] },
    { say: "Picture a pirate crew in the early 1700s. Before anyone touches a sword, they sign a contract.", set: "shipDeck", light: "day", transition: "flash",
      camera: { move: "frame", on: ["milo", "qm"], size: "full", from: 6, height: 1.4 },
      actors: [
        { who: "milo", at: "a", act: "happy", hold: "sword", beats: [{ word: "contract", act: "confused" }] },
        { who: "qm", at: "b", act: "suspicious", beats: [{ word: "sign", act: "explain", hold: "scroll" }] },
      ],
      crowd: { count: 4, era: "pirate" },
      fx: [{ kind: "exclaim", on: "qm", word: "contract" }] },
    { say: "It says how the loot is shared, and the captain gets at most two shares to a sailor's one.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["captain", "qm"], size: "full", from: -6, height: 1.4 },
      actors: [
        { who: "captain", at: "a", act: "excited", beats: [{ word: "two", act: "proud" }, { word: "one", act: "sad" }] },
        { who: "qm", at: "b", act: "explain", hold: "scroll", beats: [{ word: "shares", hold: "coinBag" }] },
      ],
      props: [{ id: "treasureChest", variant: "open", at: "a", offset: [0.6, 0.55], yaw: -10 }],
      fx: [{ kind: "sparkle", on: "captain", word: "loot" }] },
    { say: "Lose an arm in battle? The crew pays you from a shared fund.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["gus", "qm"], size: "medium", from: 8, height: 1.4 },
      actors: [
        { who: "gus", at: "a", act: "scared", beats: [{ word: "pays", act: "relief", hold: "coinBag" }] },
        { who: "qm", at: "b", act: "neutral", face: "smile", beats: [{ word: "crew", gesture: "present" }] },
      ],
      fx: [{ kind: "sweat", on: "gus", word: "battle" }, { kind: "hearts", on: "gus", word: "fund" }] },
    { say: "And the captain? He's elected.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "closeUp", on: "captain", from: -8, punch: true },
      actors: [{ who: "captain", at: "b", act: "suspicious", beats: [{ word: "elected", act: "proud" }] }],
      fx: [{ kind: "confetti", on: "captain", word: "elected" }] },
    // the captain at the helm, campaigning
    { say: { who: "captain", text: "I'd like to remind everyone that I'm very brave." }, set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "view", view: "helm" },
      actors: [{ who: "captain", at: "wheel", act: "nervous", beats: [{ word: "brave", act: "proud" }] }] },
    { say: "If he's a coward or a bully, the crew can vote him out and pick someone new.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "view", view: "deck wide" },
      actors: [
        { who: "milo", at: "a", act: "suspicious", beats: [{ word: "vote", gesture: "raiseHand", face: "determined" }] },
        { who: "qm", at: "b", act: "suspicious", beats: [{ word: "vote", gesture: "raiseHand" }] },
        { who: "gus", at: "c", act: "neutral", face: "stern", beats: [{ word: "vote", gesture: "raiseHand" }, { word: "new", act: "happy" }] },
      ],
      crowd: { count: 4, era: "pirate" },
      kicks: [{ word: "out" }] },
    { say: "A second elected officer, the quartermaster, hands out the food and loot, so the captain can't grab it all.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["qm", "captain"], size: "full", from: 6, height: 1.4 },
      actors: [
        { who: "qm", at: "a", act: "explain", hold: "coinBag", beats: [{ word: "grab", gesture: "stop", face: "stern" }] },
        { who: "captain", at: "b", act: "happy", beats: [{ word: "grab", gesture: "present", face: "grin" }, { word: "all", act: "sad" }] },
      ],
      props: [{ id: "treasureChest", variant: "open", at: "a", offset: [0.6, 0.55], yaw: 10 }],
      fx: [{ kind: "anger", on: "qm", word: "grab" }] },
    { say: "Wait, pirates were fair?", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "dutch", on: ["milo"], size: "medium", from: -12, roll: 0.09 },
      actors: [{ who: "milo", at: "a", act: "confused", beats: [{ word: "fair", act: "shock" }] }],
      fx: [{ kind: "question", on: "milo", word: "fair" }] },
    // the explanation: Juno the navigator
    { say: "You see, merchant ships had owners on land, and their captains could beat sailors into line.", set: "shipDeck", light: "day", transition: "fade", mood: "curious",
      camera: { move: "frame", on: ["juno"], size: "medium", from: -35, height: 1.5 },
      actors: [{ who: "juno", at: "rail", act: "explain", face: "smile", beats: [{ word: "owners", gesture: "pointUp" }, { word: "beat", act: "angry" }, { word: "line", act: "disgusted" }] }] },
    { say: "Pirates had no owners. The crew was the company, so they wrote rules to stop anyone becoming a tyrant.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["juno", "milo"], size: "medium", from: 6, height: 1.45 },
      actors: [
        { who: "juno", at: "a", act: "explain", face: "smile", beats: [{ word: "rules", hold: "scroll" }] },
        { who: "milo", at: "b", act: "thinking", beats: [{ word: "company", act: "idea" }, { word: "tyrant", act: "scared" }] },
      ],
      fx: [{ kind: "idea", on: "milo", word: "company" }] },
    { say: "Economist Peter Leeson argues it was the only way a ship of outlaws could work.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "pushIn", on: ["juno"], size: "full", to: "medium", from: -10, height: 1.45 },
      actors: [{ who: "juno", at: "b", act: "explain", hold: "book", beats: [{ word: "only", gesture: "pointUp", face: "smile" }] }],
      fx: [{ kind: "sparkle", on: "juno", word: "Leeson" }] },
    { say: "It wasn't perfect, and the rules varied from ship to ship.", set: "shipDeck", light: "day", transition: "cut",
      camera: { move: "frame", on: ["gus"], size: "medium", from: 10, height: 1.4 },
      actors: [{ who: "gus", at: "c", act: "thinking", beats: [{ word: "varied", act: "shrug" }] }] },
    { say: "But some crews paid for injuries long before most countries had anything like it.", set: "shipDeck", light: "day", transition: "cut", mood: "adventure",
      camera: { move: "frame", on: ["gus", "milo"], size: "full", from: -6, height: 1.4 },
      actors: [
        { who: "gus", at: "a", act: "proud", hold: "coinBag" },
        { who: "milo", at: "b", act: "neutral", beats: [{ word: "long", act: "excited" }] },
      ],
      fx: [{ kind: "stars", on: "milo", word: "countries" }] },
    // payoff: the committee meeting
    { say: "So the scariest thing on the high seas might have been a pirate committee meeting.", set: "shipDeck", light: "golden", transition: "fade",
      camera: { move: "view", view: "deck wide" },
      actors: [
        { who: "qm", at: "a", act: "explain", hold: "scroll", beats: [{ word: "meeting", gesture: "raiseHand" }] },
        { who: "captain", at: "b", act: "nervous", beats: [{ word: "committee", act: "facepalm" }] },
        { who: "milo", at: "c", act: "happy", beats: [{ word: "meeting", gesture: "raiseHand", face: "grin" }] },
      ],
      crowd: { count: 5, era: "pirate" },
      fx: [{ kind: "sweat", on: "captain", word: "committee" }] },
  ],
};
