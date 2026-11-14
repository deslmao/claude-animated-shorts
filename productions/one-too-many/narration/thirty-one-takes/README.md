# "...thirty-one?": audition takes

**Listening file:** `../thirty-one-LISTEN-labelled.mp3` (86 s). Each entry is a short robotic label, then the film's
count ("Twenty-eight, twenty-nine, thirty."), the same 0.8 s pause as in the film, then the take. The single takes
and the in-context versions (`in-context-N.mp3`) are in this folder.

All takes use the Alice voice. Takes 1–5 use the same model as the rest of the film's narration; 6 and 7 use the expressive v3 model.

| # | Direction | How it was steered |
|---|---|---|
| 0 | The current film take | Quiet preset; context "…thirty." before, "But there are only thirty on the register." after |
| 1 | Realisation | The context before has her stop and look back down the line; after: "That can't be right…" |
| 2 | Whispered, unsure | A narrative dialogue tag around the line: "…she whispered, not sure she had counted right." |
| 3 | Disbelief | "Wait." before, "No. No, that's one too many. I must have counted someone twice." after |
| 4 | Thirty… one? | The broken number itself, so the realisation lands mid-word; "Hang on." before |
| 5 | Almost silent | Low stability, slow; dialogue tag: "…she said quietly, almost to herself." |
| 6 | v3, `[confused]` | The v3 model's emotion tag |
| 7 | v3, `[whispers] [confused]` | Two v3 tags, much quieter |

The context text and the tags are not spoken; each take contains only the line.

**Note on 6 and 7:** the v3 model's word timings include the tag text. Using either in the film needs a small caption filter (a code change), and its timbre may differ slightly from the count before it, which uses the other model.
