// "Why you can't tickle yourself" (stage 6 main test; revision 2 after the owner's full visual review of run 11).
// Script: productions/tickle/script.md (approved, word for word; the narration is unchanged). Research + claim check:
// productions/tickle/research.md. Diagnosis of the revision: productions/tickle/revision-diagnosis.md.
// What the revision changed: Milo really tries to tickle himself (tickleSelf); Gus sneaks up from behind and really
// tickles him (tickle gesture reaching Milo's flank), Milo squirms and nearly falls over (stagger, no camera shake);
// dizzy stars orbit his head; the cerebellum's forecast and the predicted-vs-surprise touch are animated diagrams; the
// over-the-shoulder obstruction is gone; the robot arm really tickles Gus's palm, in sync and then with a delay.
import type { Storyboard } from "../story/types";

export const TICKLE: Storyboard = {
  id: "tickle", title: "Why you can't tickle yourself",
  cast: { milo: "milo", juno: "juno", gus: "gus" },
  music: "playful",
  shots: [
    // hook: Milo, puzzled, tries it and gets nothing
    { say: "Your brain refuses to let you tickle yourself, and it's annoyingly good at it.", set: "home", light: "interior",
      camera: { move: "pushIn", on: ["milo"], size: "full", to: "medium", from: 8, height: 1.4 },
      actors: [{ who: "milo", at: "a", act: "suspicious", facing: "camera", beats: [{ word: "tickle", gesture: "tickleSelf", face: "determined" }, { word: "annoyingly", act: "confused" }] }],
      fx: [{ kind: "question", on: "milo", word: "annoyingly" }] },
    // the attempt: fingers ready (wiggling), armpit open (elbow up), total focus
    { say: "Milo tries every morning. Fingers ready, armpit open, total focus.", set: "home", light: "interior", transition: "flash",
      camera: { move: "frame", on: ["milo"], size: "full", from: -10, height: 1.35 },
      actors: [{ who: "milo", at: "b", act: "determined", facing: "camera", beats: [{ word: "Fingers", gesture: "tickle", face: "determined" }, { word: "armpit", gesture: "tickleSelf" }, { word: "focus", face: "stern" }] }] },
    // ...and nothing: he is still tickling, face completely deadpan
    { say: "Nothing. Not even a giggle.", set: "home", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "medium", from: -6, height: 1.45 },
      actors: [{ who: "milo", at: "b", act: "neutral", gesture: "tickleSelf", face: "stern", facing: "camera", idle: 0.4 }],
      fx: [{ kind: "sweat", on: "milo", word: "giggle" }] },
    // Gus sneaks up from behind and really tickles him: Milo bursts out laughing, squirms, nearly falls over
    { say: "But the second Gus sneaks up behind him, Milo laughs so hard he nearly falls over.", set: "home", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["milo", "gus"], size: "full", from: 4, height: 1.4 },
      actors: [
        { who: "milo", at: "a", gesture: "tickleSelf", face: "stern", facing: "camera",
          beats: [{ word: "laughs", act: "laugh" }],
          moves: [{ word: "laughs", kind: "squirm", dur: 1.25 }, { word: "falls", kind: "stagger", away: "gus", dur: 1.3 }] },
        { who: "gus", at: [-1.6, 0, -0.9], act: "suspicious", walk: { to: [-0.2, 0, 0.45], t0: 0, t1: 0, from: { word: "sneaks" }, until: { word: "Milo" } },
          reach: "milo", beats: [{ word: "Milo", gesture: "tickle", face: "grin" }, { word: "over", act: "laugh" }] },
      ],
      fx: [{ kind: "burst", on: "milo", word: "laughs" }, { kind: "stars", on: "milo", word: "falls" }] },
    { say: { who: "gus", text: "Works every time!" }, set: "home", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["gus"], size: "full", from: 10, height: 1.45 },
      actors: [{ who: "gus", at: "b", act: "thumbsUp" }],
      fx: [{ kind: "sparkle", on: "gus", word: "time" }] },
    // the puzzle: same hands, same armpit
    { say: "Same fingers, same armpit. So what changed?", set: "home", light: "interior", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "medium", from: 12, height: 1.45 },
      actors: [{ who: "milo", at: "a", act: "confused", facing: "camera", beats: [{ word: "fingers", gesture: "tickleSelf" }, { word: "armpit", face: "thinking" }, { word: "changed", act: "shrug" }] }],
      fx: [{ kind: "question", on: "milo", word: "changed" }] },
    { say: "Wait, is Milo secretly not ticklish?", set: "home", light: "interior", transition: "cut",
      camera: { move: "dutch", on: ["milo"], size: "medium", from: -14, roll: 0.09 },
      actors: [{ who: "milo", at: "a", act: "nervous", beats: [{ word: "ticklish", act: "scared" }] }] },
    // the explanation, in the lab: Milo moves his hand as Juno says "every time you move"
    { say: "You see, every time you move, your brain quietly predicts what that movement will feel like.", set: "lab", light: "interiorCool", transition: "fade", mood: "curious",
      camera: { move: "frame", on: ["juno", "milo"], size: "full", from: 8, height: 1.45 },
      actors: [
        { who: "juno", at: "a", act: "explain", face: "smile", facing: "camera" },
        { who: "milo", at: "b", act: "thinking", facing: "camera", beats: [{ word: "move", gesture: "tickleSelf", face: "thinking" }] },
      ],
      fx: [{ kind: "idea", on: "milo", word: "predicts", life: 1.8 }] },
    // the cerebellum's forecast, animated beside Juno
    { say: "A part at the back of your brain, the cerebellum, sends out a forecast: fingers arriving at the armpit, any moment now.", set: "lab", light: "interiorCool", transition: "cut",
      camera: { move: "frame", on: ["juno", "diagram"], size: "medium", from: -8, height: 1.5 },
      actors: [{ who: "juno", at: "a", act: "explain", face: "smile", facing: "camera", beats: [{ word: "cerebellum", gesture: "present" }, { word: "fingers", gesture: "present", face: "talk" }] }],
      diagram: { kind: "forecast", with: "juno", place: "above", size: 1.0, steps: [{ word: "brain" }, { word: "cerebellum" }, { word: "forecast" }, { word: "fingers" }, { word: "moment" }] } },
    // predicted touch vs a surprise touch: your own hand is matched and turned down; someone else's is not
    { say: "When the touch lands exactly as predicted, your brain turns the feeling down. No surprise, no tickle.", set: "lab", light: "interiorCool", transition: "cut",
      camera: { move: "frame", on: ["juno", "diagram"], size: "medium", from: 8, height: 1.5 },
      actors: [{ who: "juno", at: "a", act: "explain", face: "smile", facing: "camera", beats: [{ word: "down", gesture: "present" }, { word: "surprise", gesture: "stop", face: "talk" }] }],
      diagram: { kind: "prediction", with: "juno", place: "above", size: 1.0, steps: [{ word: "lands" }, { word: "predicted" }, { word: "down" }, { word: "surprise" }, { word: "tickle" }] } },
    // the joke you wrote yourself: Gus reads his own joke book, unmoved
    { say: "It's like hearing a joke you wrote yourself. You already know the punchline.", set: "home", light: "interior", transition: "fade",
      camera: { move: "frame", on: ["gus"], size: "full", from: 6, height: 1.45 },
      actors: [{ who: "gus", at: "a", act: "happy", hold: "book", beats: [{ word: "punchline", act: "sleepy" }] }],
      fx: [{ kind: "zzz", on: "gus", word: "punchline", life: 1.8 }] },
    // the robot experiment: Gus works the control with one hand, the robot's feather tickles his other palm
    { say: "Scientists tested this with a tickling robot. People moved a robot arm with one hand, and it tickled their other palm.", set: "lab", light: "interiorCool", transition: "fade",
      camera: { move: "frame", on: ["gus", "robotArm"], size: "full", from: 18, height: 1.35 },
      actors: [{ who: "gus", at: "b", act: "neutral", gesture: "operate", face: "smile", facing: "camera", hold: "joystick",
        beats: [{ word: "palm", face: "smile_closed" }], drive: { word: "moved", hz: 1.5 } }],
      props: [{ id: "robotArm", at: "b", offset: [-1.0, 0.3], yaw: 0, follow: { who: "gus" }, drive: { who: "gus", delay: 0 } }],
      fx: [{ kind: "sparkle", on: "gus", word: "tickled" }] },
    // in sync = barely tickles; add a delay = ticklish again (the delay is shown on the stopwatch diagram)
    { say: "When the robot copied them instantly, it barely tickled. Add a tiny delay, and it got ticklish again.", set: "lab", light: "interiorCool", transition: "cut",
      camera: { move: "frame", on: ["gus", "robotArm", "diagram"], size: "full", from: 10, height: 1.4 },
      actors: [{ who: "gus", at: "b", act: "neutral", gesture: "operate", face: "neutral", facing: "camera", hold: "joystick", drive: { t: 0, hz: 1.5 },
        beats: [{ word: "barely", face: "stern" }, { word: "delay", face: "thinking" }, { word: "ticklish", act: "laugh", gesture: "operate" }],
        moves: [{ word: "ticklish", kind: "squirm", dur: 1.5 }] }],
      props: [{ id: "robotArm", at: "b", offset: [-1.0, 0.3], yaw: 0, follow: { who: "gus" }, drive: { who: "gus", delay: 0, changes: [{ word: "delay", delay: 0.3 }] } }],
      diagram: { kind: "delay", with: "gus", place: "above", size: 0.95, steps: [{ word: "instantly" }, { word: "delay" }, { word: "ticklish" }] },
      fx: [{ kind: "burst", on: "gus", word: "ticklish" }] },
    { say: "The surprise is the whole trick.", set: "lab", light: "interiorCool", transition: "cut",
      camera: { move: "closeUp", on: "juno", from: -8, punch: true },
      actors: [{ who: "juno", at: "a", act: "idea" }],
      fx: [{ kind: "idea", on: "juno", word: "surprise" }] },
    // the payoff: a friend tickles Milo, and he laughs
    { say: "So if you ever need a guaranteed laugh, you'll need a friend.", set: "nature", light: "golden", transition: "fade", mood: "warm",
      camera: { move: "frame", on: ["milo", "gus"], size: "full", from: 6, height: 1.45 },
      actors: [
        { who: "milo", at: "a", act: "happy", facing: "camera", beats: [{ word: "laugh", act: "laugh" }], moves: [{ word: "laugh", kind: "squirm", dur: 1.4 }] },
        { who: "gus", at: [-0.4, 0, 4.65], act: "happy", reach: "milo", beats: [{ word: "guaranteed", gesture: "tickle", face: "grin" }, { word: "friend", act: "thumbsUp" }] },
      ],
      fx: [{ kind: "hearts", on: "gus", word: "friend" }] },
    // ...and the one person who can never do it: Milo tries once more, deadpan, and shrugs
    { say: "Because the one person on Earth who can never tickle you... is you.", set: "nature", light: "golden", transition: "cut",
      camera: { move: "frame", on: ["milo"], size: "full", from: -6, height: 1.4 },
      actors: [{ who: "milo", at: "a", act: "happy", facing: "camera", beats: [{ word: "never", gesture: "tickleSelf", face: "stern" }, { word: "you", n: 2, act: "shrug", face: "smile" }] }] },
  ],
};
