// I've Sold 200 Memories of the Girl I Love. This Is the Last One. (productions/memory-money/script.md, approved by the
// owner). An original cyberpunk love story in a city where memories are money: Kai sells every memory of Lumi to pay
// for her medicine, and finds out she has been selling her own memories to buy his back.
// The hook is the first frame and the first two lines. Memories play in golden light (memTint); a memory being sold
// drains to grey ("drain"); memories coming back flood in ("flood").
// Reuses the Stop Time city: the Lowline street, the rooftop, the flat (Lumi's), the back-alley clinic (the extraction
// room).
import type { Storyboard, Line, ShotSpec } from "../story/types";

type V = [number, number, number];
const at = (pos: V, look: V, fov: number) => ({ move: "at" as const, pos, look, fov });
const STEADY = Array.from({ length: 80 }, (_, i) => ({ t: -0.7 + i * 0.15 }));
const NIGHT = "night" as const;
const N = (text: string): Line => ({ text, who: "narrator" });
const kai = (text: string): Line => ({ text, who: "kai" });
const lumi = (text: string): Line => ({ text, who: "lumi" });
const lumiSick = (text: string): Line => ({ text, who: "lumiSick" });
const kaiKid = (text: string): Line => ({ text, who: "kaiKid" });
const lumiKid = (text: string): Line => ({ text, who: "lumiKid" });
const broker = (text: string): Line => ({ text, who: "broker" });
const lock = (c: ReturnType<typeof at>) => ({ camera: c, cams: [{ t: 0, ...c, blockOk: true }] });
const glide = (a: ReturnType<typeof at>, b: ReturnType<typeof at>, secs: number) => ({ camera: a, cams: [{ t: 0, ...a, blockOk: true }, { t: 0.1, ...b, glide: secs, blockOk: true }] });
const CARD: V = [0, 1.4, 3.2], CARD_CAM = at([0, 1.4, 4.2], CARD, 51), CARD_IN = at([0, 1.4, 3.85], CARD, 51);
const insert = (variant: string, dur: number, note: string, extra: Partial<ShotSpec> = {}, steps?: ({ t: number } | { word: string })[], push = false): ShotSpec =>
  ({ set: "theoFlat", light: NIGHT, dur, ...(push ? glide(CARD_CAM, CARD_IN, dur) : { camera: CARD_CAM, cams: [{ t: 0, ...CARD_CAM, blockOk: true }] }), actors: [], props: [{ id: "mmInsert", at: CARD, variant, steps: steps ?? [{ t: 99 }] }], note, ...extra });
const RAIN = (look: V) => ({ id: "rain", at: look, steps: STEADY });
const GOLD_MEM = (look: V) => ({ id: "memTint", at: look, variant: "gold", steps: [{ t: -0.7 }] });
const STREET = { set: "lowline", light: NIGHT, ambience: "elb_neon_city" as const };
const ROOF = { set: "lowRoof", light: NIGHT, ambience: "elb_roof_night" as const };
const FLAT = { set: "theoFlat", light: NIGHT, ambience: "elb_flat_rain" as const };
const ROOM = { set: "backClinic", light: NIGHT, ambience: "elb_flat_rain" as const };
const MARKET = { set: "memMarket", light: NIGHT, ambience: "elb_market" as const };
// the rain-soaked steps outside the market: the pavement (y 0.12) on the left of the Lowline
const KAI_STEP: V = [-4.55, 0.12, -1.0], LUMI_STEP: V = [-5.05, 0.12, -0.95];

export const MEMORY_MONEY: Storyboard = {
  id: "memory-money", title: "I've Sold 200 Memories of the Girl I Love. This Is the Last One.",
  cast: { kai: "kai", lumi: "lumi", lumiSick: "lumiSick", lumiHood: "lumiHood", broker: "broker", kaiKid: "kaiKid", lumiKid: "lumiKid", seller: "lowB", lowA: "lowA", lowC: "lowC", lowD: "lowD" },
  voice: "mmKai", voices: { kai: "mmKai", lumi: "mmLumi", lumiSick: "mmLumi", broker: "mmBroker", kaiKid: "mmKai", lumiKid: "mmLumi" },
  captionColors: { kai: "#ffc864", mmLumi: "#d4b8ff", lumi: "#d4b8ff", lumiSick: "#d4b8ff", broker: "#ff8f6a", kaiKid: "#ffc864", lumiKid: "#d4b8ff" },
  // the no-music master (voices + effects only), for a trending sound added in the apps
  music: false,
  engine: 3, autoSfx: false,
  clarity: {
    premise: "In a city where memories are money, a boy sells every memory of the girl he loves to pay for her medicine, and finds out she has been selling her own memories to buy his back.",
    facts: [
      { fact: "the hook", said: "I've sold two hundred memories of the girl I love" },
      { fact: "the world", said: "In my city, you pay with your memories" },
      { fact: "the rich and the poor", said: "The rich buy memories" },
      { fact: "the machine", said: "A machine pulls the memory out of your head" },
      { fact: "the cost", said: "once it's sold, it's gone from you" },
      { fact: "how they met", said: "The first time I saw her, I was twelve" },
      { fact: "her gift (the plant)", said: "Now you owe me a memory" },
      { fact: "who Lumi is", said: "Her name was Lumi" },
      { fact: "their memories together", said: "So we made them. Hundreds of them." },
      { fact: "their dream (the stakes)", said: "we'll sit up here and remember every single one" },
      { fact: "her promise (why she buys them back in secret)", said: "Promise me you'll never sell us" },
      { fact: "he breaks it", said: "I lied" },
      { fact: "their ritual (the plant)", said: "every time we met, she'd say the same thing" },
      { fact: "why he sells", said: "The medicine cost more than I'd ever earn" },
      { fact: "what he sells", said: "Our first kiss paid for a month of medicine" },
      { fact: "the price he pays", said: "I just couldn't remember why" },
      { fact: "the stakes of the last sale", said: "After this, she's a stranger" },
      { fact: "the buyer", said: "It was Lumi" },
      { fact: "the twist", said: "She'd been selling her own memories, to buy mine back" },
      { fact: "what she kept", said: "But I remember you" },
    ],
  },
  shots: [
    // ---- THE HOOK: the last vial
    insert("vialFace", 5.6, "the hook: a hand on a steel counter, a glowing vial, a girl's face inside it, fading",
      { say: [N("In my city, you pay with your memories."), { ...N("I've sold two hundred memories of the girl I love. This is the last one."), gap: 0.3 }], ambience: "elb_market",
        sfx: [{ t: 0, name: "el_vial_chime" }, { word: "last", name: "el_memory_drain", gain: -6 }, { t: 0.3, name: "el_heart_slow", gain: -8 }] }, [{ word: "last" }], true),
    // ---- THE CITY
    { say: N("The rich buy memories, so they can feel things they never lived. The rest of us sell them, just to eat."), ...STREET, hold: 0.2, transition: "flash",
      title: { text: "I'VE SOLD 200 MEMORIES", sub: "OF THE GIRL I LOVE" },
      ...glide(at([0.2, 1.6, 5.0], [5.6, 4.4, -3.2], 50), at([0.6, 1.55, 4.4], [5.6, 4.6, -3.2], 50), 6.0),
      actors: [{ who: "lowA", at: [4.6, 0, -4.5], act: "neutral", walk: { to: [4.4, 0, 0.5], t0: 0, t1: 6 } }, { who: "lowC", at: [3.2, 0, 0.8], act: "sad", face: "sad", walk: { to: [3.6, 0, -4.0], t0: 0.3, t1: 6 } }],
      props: [{ id: "memAd", at: [5.6, 4.9, -3.2], yaw: -90, steps: [{ t: -0.7 }] }, RAIN([2.5, 1.6, 1.0])], sfx: [{ t: 0.4, name: "el_neon_buzz", gain: -6 }], note: "the neon city in the rain; over the street the MEMORIA holo-ad, a rich couple inside a golden memory" },
    { say: N("A machine pulls the memory out of your head and into a vial."), ...ROOM, hold: 0.1, ...lock(at([0.6, 1.5, 2.0], [0, 1.1, -0.5], 46)),
      actors: [{ who: "seller", at: "chair", mode: "sit", act: "sad", face: "sleepy", keepFace: true, facing: "camera" }, { who: "broker", at: "doc", act: "neutral", face: "smile", facing: "toward:seller", gesture: "operate" }],
      note: "the extraction room: a stranger in the chair, the Broker at the machine" },
    insert("extract", 3.0, "the cable at the temple, light pouring into a vial", { say: N("And once it's sold, it's gone from you. Forever."), ambience: false, sfx: [{ t: 0.1, name: "el_memory_drain" }] }, undefined, true),
    // ---- HOW THEY MET (five years earlier, a memory, in gold)
    { say: N("The first time I saw her, I was twelve. I was about to sell a memory of my mum. For a bowl of noodles."), ...ROOM, hold: 0.2, transition: "fade",
      title: { text: "FIVE YEARS EARLIER" }, ...lock(at([0.5, 1.3, 1.7], [-0.25, 0.95, -0.5], 46)),
      actors: [{ who: "kaiKid", at: "chair", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "camera" }, { who: "broker", at: "doc", act: "neutral", face: "smile", facing: "toward:kaiKid", gesture: "operate" }],
      props: [GOLD_MEM([-0.2, 1.0, -0.5])], note: "a memory: Kai at twelve, soaked, in the extraction chair" },
    { say: { text: "Don't sell that one. Here.", who: "narrator", voice: "mmLumi" }, set: "theoFlat", light: NIGHT, ambience: "elb_flat_rain", hold: 0.2, ...glide(CARD_CAM, CARD_IN, 2.0),
      actors: [], props: [{ id: "mmInsert", at: CARD, variant: "noodles", steps: [{ t: 99 }] }], sfx: [{ t: 0.05, name: "el_vial_chime", gain: -12 }],
      note: "close: small hands push a steaming bowl of noodles into his; the cable she pulled out hangs beside it" },
    { say: lumiKid("Now you owe me a memory. A good one."), ...ROOM, hold: 0.2, ...lock(at([0.8, 1.2, 1.4], [0.05, 1.0, -0.4], 46)),
      actors: [{ who: "kaiKid", at: "chair", mode: "sit", act: "shock", face: "shock", keepFace: true, facing: "toward:lumiKid" }, { who: "lumiKid", at: [0.25, 0, -0.25], act: "happy", face: "grin", facing: "toward:kaiKid", gesture: "hold", hold: "noodleBowl" }],
      props: [GOLD_MEM([0, 1.0, -0.4])], sfx: [{ t: 0.1, name: "el_van_door", gain: -14 }], note: "a silver-haired girl pulls the cable away and pushes a bowl of noodles into his hands" },
    { say: kaiKid("I don't have any good ones."), ...ROOM, hold: 0.2, ...lock(at([0.3, 1.05, 0.95], [-0.35, 0.92, -0.55], 40)),
      actors: [{ who: "kaiKid", at: "chair", mode: "sit", act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera", gesture: "hold", hold: "noodleBowl" }], props: [GOLD_MEM([-0.35, 1.0, -0.55])], note: "Kai at twelve, close" },
    { say: lumiKid("Then we'll make some."), ...ROOM, hold: 0.6, ...lock(at([-0.3, 1.05, 1.0], [0.25, 0.92, -0.25], 40)),
      actors: [{ who: "lumiKid", at: [0.25, 0, -0.25], act: "happy", face: "smile", facing: "camera", gesture: "hips" }], props: [GOLD_MEM([0.25, 1.0, -0.25])], note: "Lumi at twelve, close: the promise of a life" },
    // ---- LUMI (a memory, in gold)
    { say: N("Her name was Lumi. She folded paper stars and hummed songs she made up."), ...ROOF, hold: 0.3, transition: "fade",
      ...glide(at([0.6, 1.25, -2.4], [0, 0.95, -5.5], 46), at([0.5, 1.2, -2.9], [0, 0.95, -5.5], 46), 6.0),
      actors: [{ who: "kai", at: "ledgeL", mode: "sit", act: "happy", face: "smile", facing: "toward:lumi" }, { who: "lumi", at: "ledgeR", mode: "sit", act: "happy", face: "smile", facing: "toward:kai", gesture: "offer", hold: "paperStar" }],
      props: [GOLD_MEM([0, 1, -5.5])], sfx: [{ t: 0.2, name: "el_humming", gain: -4 }], note: "a memory, in golden light: the rooftop, Lumi gives him a paper star" },
    { say: [N("And every time we met, she'd say the same thing."), { ...lumi("Remember me?"), gap: 0.3 }], ...ROOF, hold: 0.3, ...lock(at([0.8, 1.02, -3.3], [0.45, 0.98, -5.5], 38)),
      actors: [{ who: "lumi", at: "ledgeR", mode: "sit", act: "happy", face: "grin", facing: -1, gesture: "hang" }], props: [GOLD_MEM([0.45, 1, -5.5])], note: "Lumi, close, teasing" },
    { say: [N("And I'd say…"), { ...kai("Always."), gap: 0.2 }], ...ROOF, hold: 0.5, ...lock(at([-0.75, 1.0, -3.6], [-0.45, 0.98, -5.5], 34)),
      actors: [{ who: "kai", at: "ledgeL", mode: "sit", act: "happy", face: "smile", facing: 1, gesture: "hang" }], props: [GOLD_MEM([-0.45, 1, -5.5])], note: "Kai, close, smiling" },
    // ---- MAKING MEMORIES (a golden montage)
    insert("stars", 2.4, "she teaches him to fold paper stars; then a jar full of hundreds of them", { say: N("So we made them. Hundreds of them."), ambience: "elb_roof_night", hold: 0.2,
      sfx: [{ word: "Hundreds", name: "el_vial_chime", gain: -10 }] }, [{ word: "Hundreds" }], true),
    { dur: 2.0, ...STREET, ...lock(at([1.8, 1.4, 4.2], [-0.4, 1.2, 0.2], 46)),
      actors: [{ who: "lumi", at: [-2.4, 0, 0.6], act: "laugh", face: "laugh", keepFace: true, walk: { to: [1.4, 0, 0.9], t0: 0, t1: 2.0, mode: "run" } }, { who: "kai", at: [-3.2, 0, 0.3], act: "laugh", face: "laugh", keepFace: true, walk: { to: [0.7, 0, 0.6], t0: 0.1, t1: 2.0, mode: "run" } }],
      props: [RAIN([-0.4, 1.3, 0.4]), GOLD_MEM([-0.4, 1.2, 0.4])], sfx: [{ t: 0.2, name: "giggle", gain: -8 }], note: "running through the rain, laughing" },
    { say: lumi("One day, when we're old, we'll sit up here and remember every single one."), ...ROOF, hold: 0.5, ...lock(at([0.6, 1.25, -2.6], [0, 0.95, -5.5], 46)),
      actors: [{ who: "kai", at: "ledgeL", mode: "sit", act: "happy", face: "smile", facing: "toward:lumi" }, { who: "lumi", at: "ledgeR", mode: "sit", act: "happy", face: "smile", facing: "toward:kai", gesture: "hang" }],
      props: [GOLD_MEM([0, 1, -5.5])], sfx: [{ t: 0.2, name: "el_humming", gain: -12 }], note: "the rooftop at dawn: their dream" },
    // ---- THE GREY
    { say: N("Then she got sick. The grey sickness. The medicine cost more than I'd ever earn."), ...FLAT, hold: 0.2, transition: "fade", ...lock(at([0.15, 1.4, 1.8], [-0.3, 1.0, -0.4], 50)),
      actors: [{ who: "lumiSick", at: "bed", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: 1, idle: 0.4 }, { who: "kai", at: [0.05, 0, -0.25], act: "sad", face: "sad", keepFace: true, facing: "toward:lumiSick" }],
      sfx: [{ t: 0.3, name: "el_cough" }], note: "Lumi's tiny flat: she's pale, coughing; Kai beside the bed" },
    { say: lumiSick("Kai. Promise me you'll never sell us. Not even to save me."), ...FLAT, hold: 0.2, ...lock(at([-0.3, 1.1, 0.55], [-0.75, 1.0, -0.5], 36)),
      actors: [{ who: "lumiSick", at: "bed", mode: "sit", act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: 1, gesture: "hang" }], note: "Lumi, pale, grabbing his sleeve" },
    { say: [kai("I promise."), { ...N("I lied."), gap: 0.7 }], ...FLAT, hold: 0.4, ...lock(at([-0.6, 1.6, 0.6], [0.05, 1.55, -0.25], 34)),
      actors: [{ who: "kai", at: [0.05, 0, -0.25], act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: -1, gesture: "crossArms" }], note: "Kai, close: he promises, and already knows he won't keep it" },
    insert("pills", 3.0, "the grey veins on her wrist; GREYSTOP, 4,000 a month", { say: N("So I sold the one thing I had. Her."), ambience: "elb_flat_rain" }, undefined, true),
    { say: N("Our first kiss paid for a month of medicine."), ...ROOF, hold: 0.6, ...glide(at([0.0, 1.45, 0.3], [0, 1.35, -2.0], 38), at([0.0, 1.43, -0.1], [0, 1.35, -2.0], 38), 3.0),
      actors: [{ who: "kai", at: [-0.24, 0, -2.0], act: "happy", face: "smile_closed", facing: 1 }, { who: "lumi", at: [0.24, 0, -2.0], act: "happy", face: "smile_closed", facing: -1 }],
      props: [{ id: "memTint", at: [0, 1.4, -2], variant: "drain", steps: [{ word: "paid" }] }], sfx: [{ word: "paid", name: "el_memory_drain" }], note: "the memory of their first kiss, golden, drains to grey as it is sold" },
    { say: N("The night we met paid for two."), ...ROOM, hold: 0.3, ...lock(at([0.6, 1.45, 1.6], [-0.2, 1.1, -0.5], 44)),
      actors: [{ who: "kai", at: "chair", mode: "sit", act: "sad", face: "sleepy", keepFace: true, facing: "camera" }, { who: "broker", at: "doc", act: "neutral", face: "smile", facing: "toward:kai", gesture: "operate" }],
      sfx: [{ t: 0.2, name: "el_vial_chime" }], note: "Kai in the chair, eyes closed; the Broker draws out another" },
    insert("counter", 3.4, "the seller's screen: MEMORIES OF LUMI 212, 140, 61, 9", { ambience: "elb_market", sfx: [{ t: 0.85, name: "el_vial_chime", gain: -4 }, { t: 1.7, name: "el_vial_chime", gain: -4 }, { t: 2.55, name: "el_vial_chime" }, { t: 2.55, name: "el_hit_sub", gain: -8 }] }, [{ t: 0.85 }, { t: 1.7 }, { t: 2.55 }]),
    // ---- THE COST
    { say: N("It worked. She got better. But every time I visited, she felt a little more like a stranger."), ...FLAT, hold: 0.2, ...lock(at([0.15, 1.4, 1.8], [-0.3, 1.0, -0.4], 50)),
      actors: [{ who: "lumi", at: "bed", mode: "sit", act: "happy", face: "smile", facing: 1 }, { who: "kai", at: [0.05, 0, -0.25], act: "neutral", face: "neutral", keepFace: true, facing: "toward:lumi" }],
      note: "the flat: Lumi well again, smiling; Kai, unsure" },
    { say: lumi("Remember me?"), ...FLAT, hold: 0.2, ...lock(at([-0.35, 1.1, 0.45], [-1.0, 1.0, -0.6], 34)),
      actors: [{ who: "lumi", at: "bed", mode: "sit", act: "happy", face: "grin", facing: 1, gesture: "hang" }], note: "Lumi, close: the old joke" },
    { say: { ...N("I knew I loved her. I just couldn't remember why."), gap: 1.0 }, ...FLAT, hold: 0.4, ...lock(at([-0.6, 1.6, 0.6], [0.05, 1.55, -0.25], 34)),
      actors: [{ who: "kai", at: [0.05, 0, -0.25], act: "confused", face: "blank", keepFace: true, facing: -1, blink: false, gesture: "hang" }], note: "Kai, close: he can't answer" },
    { dur: 1.7, ...FLAT, ...lock(at([-0.35, 1.1, 0.45], [-1.0, 1.0, -0.6], 34)),
      actors: [{ who: "lumi", at: "bed", mode: "sit", act: "sad", face: "sad", keepFace: true, facing: 1, beats: [{ t: 0.6, look: "down" }] }], sfx: [{ t: 0.1, name: "el_heart_slow", gain: -8 }], note: "Lumi's smile breaks; she looks away" },
    // ---- THE LAST ONE
    { say: N("So here I am. The last memory I have of her: her face."), ...MARKET, hold: 0.2, transition: "fade", ...lock(at([0.4, 1.55, 2.6], [-1.0, 1.3, -0.6], 46)),
      actors: [{ who: "kai", at: "kai", act: "sad", back: true }, { who: "broker", at: "brokerA", act: "neutral", face: "smile", facing: "camera", gesture: "hang" }],
      note: "back to the opening: the memory exchange, the last vial on the counter" },
    { say: broker("Last one, kid. After this, she's a stranger."), ...MARKET, hold: 0.2, ...lock(at([-0.55, 1.5, 0.45], [-1.0, 1.4, -1.05], 40)),
      actors: [{ who: "broker", at: "brokerA", act: "neutral", face: "smile", facing: "camera", gesture: "hold", hold: "memVial" }], note: "the Broker, close: smooth, cold" },
    { say: kai("Then she lives. Sell it."), ...MARKET, hold: 0.3, ...lock(at([-1.25, 1.5, -0.5], [-1.0, 1.45, 0.2], 36)),
      actors: [{ who: "kai", at: "kai", act: "sad", face: "sad", keepFace: true, sadTalk: true, facing: "camera", gesture: "crossArms" }], note: "Kai, close: he says it anyway" },
    insert("vialFace", 2.2, "the vial: her face fades out to nothing", { ambience: "elb_market", sfx: [{ t: 0.2, name: "el_memory_drain" }, { t: 1.6, name: "el_vial_chime" }] }, [{ t: 0.05 }, { t: 1.0 }]),
    // ---- THE BUYER
    { say: N("At the next counter, someone in a hood was buying."), ...MARKET, hold: 0.1, ...lock(at([-0.1, 1.55, 3.6], [0.85, 1.3, 0.0], 50)),
      actors: [{ who: "kai", at: [0.05, 0, 1.6], act: "dazed", face: "blank", keepFace: true, facing: "camera" }, { who: "lumiHood", at: "buyer", act: "neutral", back: true }, { who: "broker", at: "brokerB", act: "neutral", face: "smile", facing: "camera" }],
      note: "Kai, lost, in the market; at counter B a hooded buyer" },
    insert("vialCase", 2.4, "the buyer's case: dozens of gold vials", { say: N("Not one memory. All of them."), ambience: "elb_market" }, undefined, true),
    { say: N("It was Lumi. I didn't know her face anymore. I only know because she told me."), ...MARKET, hold: 0.3, ...lock(at([1.75, 1.5, 1.6], [1.4, 1.45, 0.2], 36)),
      actors: [{ who: "lumi", at: "buyer", act: "sad", face: "sad", keepFace: true, facing: "camera" }], sfx: [{ t: 0.1, name: "el_heart_slow", gain: -6 }], note: "the hood falls back: silver hair. Lumi" },
    // ---- THE TWIST
    { say: [N("She'd been selling her own memories, to buy mine back. Her childhood. Her family. Her whole life.")], ...STREET, hold: 0.2,
      ...glide(at([-2.2, 1.25, 1.6], [-4.5, 0.9, -1.05], 48), at([-2.3, 1.22, 1.45], [-4.5, 0.9, -1.05], 48), 6.5),
      actors: [{ who: "kai", at: KAI_STEP, mode: "sit", act: "dazed", face: "blank", keepFace: true, facing: "camera" }, { who: "lumi", at: [-4.25, 0, -1.3], act: "sad", face: "smile_closed", facing: "toward:kai", gesture: "offer", hold: "memVial" }],
      props: [RAIN([-4.6, 1.2, -1.0]), { id: "memTint", at: [-4.6, 1, -1], variant: "flood", steps: [{ word: "buy" }] }], sfx: [{ word: "buy", name: "el_memory_flood" }], note: "outside in the rain: Kai on the steps; Lumi presses the first vial to him; gold floods back" },
    { say: N("All except one."), ...ROOF, hold: 0.6, transition: "flash", ...glide(at([0.6, 1.25, -2.4], [0, 0.95, -5.5], 46), at([0.45, 1.2, -3.0], [0, 0.95, -5.5], 46), 2.2),
      actors: [{ who: "kai", at: "ledgeL", mode: "sit", act: "happy", face: "smile", facing: "toward:lumi" }, { who: "lumi", at: "ledgeR", mode: "sit", act: "happy", face: "smile", facing: "toward:kai", gesture: "offer", hold: "paperStar" }],
      props: [GOLD_MEM([0, 1, -5.5])], note: "the rooftop memory, back in gold" },
    { say: [lumi("I don't remember much anymore. But I remember you."), { ...lumi("Remember me?"), gap: 0.6 }], ...STREET, hold: 0.3, transition: "fade", ...lock(at([-3.6, 1.05, 0.9], [-4.8, 0.85, -1.0], 40)),
      actors: [{ who: "lumi", at: LUMI_STEP, mode: "sit", act: "sad", face: "smile_closed", keepFace: true, facing: "toward:kai" }, { who: "kai", at: KAI_STEP, mode: "sit", act: "sad", face: "sad", keepFace: true, facing: "toward:lumi" }],
      props: [RAIN([-4.8, 1.0, -1.0])], sfx: [{ t: 0.3, name: "el_humming", gain: -10 }], note: "side by side on the steps in the rain; she's lost, smiling" },
    { say: kai("Always."), ...STREET, hold: 1.4, ...lock(at([-3.9, 0.95, -0.1], [-4.55, 0.85, -1.0], 34)),
      actors: [{ who: "kai", at: KAI_STEP, mode: "sit", act: "happy", face: "relief", facing: -1, gesture: "hang" }], props: [RAIN([-4.55, 1.0, -1.0])], note: "Kai, close: he remembers" },
    insert("endCard", 3.0, "end card: what memory would you never sell?", { ambience: false, transition: "dip" }),
  ],
};
