// "The truth about buried pirate treasure" (stage 6, pirate test video 2: the asset-reuse test). Script:
// productions/buried-treasure/script.md (approved, word for word). Research + claim check: productions/buried-treasure/
// research.md. Assets: REUSED from the pirates theme made for video 1 (ship deck, captain, quartermaster, Captain
// Kidd, pirate outfits, pirate crowd, treasure chest, coin purse) and the base library (nature, old town, home,
// classroom, map, book, bottle, coin, magnifier); CREATED only what the search showed missing (island set, dig spot,
// shovel): productions/buried-treasure/asset-search.md. Gardiners Island (New York) is shown with the temperate
// nature set, not the palm beach; the palm beach is the legend's "desert island".
import type { Storyboard } from "../story/types";

export const BURIEDTREASURE: Storyboard = {
  id: "buried-treasure", title: "The truth about buried pirate treasure",
  cast: { milo: "miloPirate", juno: "junoPirate", kidd: "kidd", captain: "captain", qm: "quartermaster", gus: "gusPirate",
    official: "gus", junoNow: "junoOut", miloNow: "milo" },
  music: "adventure",
  shots: [
    // hook: the legend's desert island
    { say: "Pirates almost never buried treasure, and one of the few who did lost all of it.", set: "island", light: "day",
      camera: { move: "pushIn", on: ["milo"], size: "full", to: "medium", from: 8, height: 1.35 },
      actors: [{ who: "milo", at: "a", act: "excited", hold: "shovel", beats: [{ word: "never", act: "confused" }, { word: "lost", act: "shock" }] }],
      props: [{ id: "digSpot", variant: "x", at: "a", offset: [0.45, -0.85] }],
      fx: [{ kind: "question", on: "milo", word: "never" }] },
    { say: "Picture a pirate crew after a big raid. Chests of coins, silk, and jewels.", set: "shipDeck", light: "day", transition: "flash",
      camera: { move: "frame", on: ["captain", "qm"], size: "full", from: 6, height: 1.4 },
      actors: [
        { who: "captain", at: "a", act: "excited", beats: [{ word: "jewels", act: "proud" }] },
        { who: "qm", at: "b", act: "suspicious", hold: "coinBag" },
      ],
      props: [{ id: "treasureChest", variant: "open", at: "a", offset: [0.6, 0.55], yaw: -10 }],
      crowd: { count: 5, era: "pirate" },
      fx: [{ kind: "sparkle", on: "captain", word: "coins" }] },
    { say: "Bury it on a desert island? Hardly anyone did.", set: "island", light: "day", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "full", from: -8, height: 1.4 },
      actors: [{ who: "milo", at: "a", act: "thinking", hold: "shovel", beats: [{ word: "Hardly", act: "shrug" }] }],
      props: [{ id: "digSpot", variant: "x", at: "a", offset: [0.45, -0.85] }],
      fx: [{ kind: "question", on: "milo", word: "island" }] },
    // what pirates really did with loot: spent it in port
    { say: "Loot was shared out straight away, and most pirates spent their share fast, on food, drink, and gambling in port.", set: "oldtown", light: "day", transition: "fade",
      camera: { move: "frame", on: ["gus", "milo"], size: "full", from: 5, height: 1.45 },
      actors: [
        { who: "gus", at: "a", act: "happy", hold: "coinBag", beats: [{ word: "drink", hold: "bottle", act: "laugh" }] },
        { who: "milo", at: "b", act: "happy", hold: "coin", beats: [{ word: "gambling", act: "excited" }] },
      ],
      crowd: { count: 6, era: "pirate" },
      fx: [{ kind: "stars", on: "milo", word: "gambling" }] },
    { say: "Burying a fortune and sailing off was a great way to never see it again.", set: "island", light: "day", transition: "fade",
      camera: { move: "frame", on: ["milo"], size: "full", from: 15, height: 1.55 },
      actors: [{ who: "milo", at: "dig", act: "proud", hold: "shovel", beats: [{ word: "never", act: "sad" }] }],
      props: [{ id: "digSpot", variant: "dug", at: "dig", offset: [0.45, -0.85] }],
      fx: [{ kind: "sweat", on: "milo", word: "again" }] },
    // Captain Kidd, 1699
    { say: "But in 1699, Captain William Kidd did it anyway.", set: "shipDeck", light: "golden", transition: "fade", mood: "mystery",
      camera: { move: "lowHero", on: "kidd", from: 10 },
      actors: [{ who: "kidd", at: "b", act: "proud" }],
      fx: [{ kind: "exclaim", on: "kidd", word: "Kidd" }] },
    { say: "Hunted as a pirate, he hid gold and jewels on Gardiners Island, near New York.", set: "nature", light: "golden", transition: "cut",
      camera: { move: "frame", on: ["kidd"], size: "full", from: 8, height: 1.4 },
      actors: [{ who: "kidd", at: "a", act: "nervous", hold: "shovel", beats: [{ word: "hid", act: "suspicious" }] }],
      props: [{ id: "treasureChest", variant: "closed", at: "a", offset: [0.5, -0.8], yaw: 15 }, { id: "digSpot", variant: "dug", at: "a", offset: [-0.5, -0.85] }],
      fx: [{ kind: "sweat", on: "kidd", word: "Hunted" }] },
    { say: { who: "kidd", text: "Nobody will ever find it!" }, set: "nature", light: "golden", transition: "cut",
      camera: { move: "closeUp", on: "kidd", from: -8, punch: true },
      actors: [{ who: "kidd", at: "a", act: "proud" }] },
    { say: "Soon after his arrest, the authorities dug it up and shipped it to London, as evidence against him.", set: "nature", light: "day", transition: "cut",
      camera: { move: "frame", on: ["official", "kidd"], size: "full", from: 6, height: 1.45 },
      actors: [
        { who: "official", at: "a", act: "determined", hold: "shovel", beats: [{ word: "shipped", act: "explain", hold: "scroll" }] },
        { who: "kidd", at: "b", act: "shock", beats: [{ word: "evidence", act: "sad" }] },
      ],
      props: [{ id: "treasureChest", variant: "open", at: "a", offset: [0.6, 0.6], yaw: 10 }],
      fx: [{ kind: "exclaim", on: "kidd", word: "dug" }] },
    { say: "Kidd was hanged in 1701.", set: "oldtown", light: "night", transition: "fade",
      camera: { move: "frame", on: ["kidd"], size: "medium", from: 6, height: 1.45 },
      actors: [{ who: "kidd", at: "a", act: "sad", idle: 0.4 }] },
    // where the legend came from
    { say: "So where did the legend of buried treasure come from?", set: "home", light: "interior", transition: "fade", mood: "curious",
      camera: { move: "frame", on: ["miloNow"], size: "full", from: 6, height: 1.4 },
      actors: [{ who: "miloNow", at: "a", act: "confused", hold: "map" }],
      fx: [{ kind: "question", on: "miloNow", word: "legend" }] },
    { say: "You see, in 1883, Robert Louis Stevenson wrote Treasure Island, with a hidden hoard and a map where X marks the spot.", set: "home", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["junoNow", "miloNow"], size: "full", from: -5, height: 1.45 },
      actors: [
        { who: "junoNow", at: "a", act: "explain", face: "smile", hold: "book", beats: [{ word: "map", hold: "map", gesture: "present" }] },
        { who: "miloNow", at: "b", act: "thinking", beats: [{ word: "spot", act: "excited" }] },
      ],
      fx: [{ kind: "idea", on: "miloNow", word: "spot" }] },
    { say: "Historians have never found a single real pirate treasure map.", set: "classroom", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["official"], size: "medium", from: 10, height: 1.4 },
      actors: [{ who: "official", at: "a", act: "thinking", hold: "magnifier", beats: [{ word: "never", act: "shrug" }] }] },
    // payoff: the novelist's treasure
    { say: "But the story was so good that it buried the real history.", set: "island", light: "golden", transition: "fade", mood: "adventure",
      camera: { move: "frame", on: ["juno"], size: "full", from: 8, height: 1.4 },
      actors: [{ who: "juno", at: "a", act: "explain", face: "smile", hold: "book", beats: [{ word: "buried", act: "shrug" }] }],
      props: [{ id: "digSpot", variant: "dug", at: "a", offset: [0.45, -0.85] }],
      fx: [{ kind: "sparkle", on: "juno", word: "good" }] },
    { say: "So the most famous pirate treasure of all time was hidden by a novelist.", set: "island", light: "golden", transition: "cut",
      camera: { move: "frame", on: ["milo", "juno"], size: "full", from: 4, height: 1.45 },
      actors: [
        { who: "milo", at: "a", act: "happy", hold: "shovel", beats: [{ word: "novelist", act: "laugh" }] },
        { who: "juno", at: "b", act: "neutral", face: "smile", hold: "book", beats: [{ word: "novelist", act: "proud" }] },
      ],
      props: [{ id: "treasureChest", variant: "open", at: "a", offset: [0.6, 0.55], yaw: -10 }],
      fx: [{ kind: "confetti", on: "juno", word: "novelist" }] },
  ],
};
