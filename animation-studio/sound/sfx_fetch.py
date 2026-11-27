# Custom SFX (Engine 4, Phase 4):  python3 sound/sfx_fetch.py [--force name ...]
# Generates every sound in assets/sfx/specs.json that has no file yet with the ElevenLabs Sound Effects API (the key is injected by the
# network proxy; it is never read or printed here) and writes assets/sfx/<name>.mp3. The files are committed, so a soundtrack rebuild never
# calls the API. sound/build.py loads assets/sfx/<name>.(mp3|wav) for any cue name that is not in the built-in catalogue.
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from samples_fetch import post, API  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(os.path.dirname(HERE), "assets", "sfx")


def main(args):
    force = set(args[1:]) if args and args[0] == "--force" else set()
    spec = json.load(open(os.path.join(DIR, "specs.json")))["sfx"]
    for name, s in spec.items():
        out = os.path.join(DIR, f"{name}.mp3")
        if os.path.exists(out) and name not in force:
            continue
        post(f"{API}/sound-generation", {"text": s["p"], "duration_seconds": s["s"], "prompt_influence": s.get("influence", 0.6), "model_id": "eleven_text_to_sound_v2"}, out)
        print("generated", name)


if __name__ == "__main__":
    main(sys.argv[1:])
