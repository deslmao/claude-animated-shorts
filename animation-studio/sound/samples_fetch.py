# Recorded-style samples (What Ollie Says Part 2):  python3 sound/samples_fetch.py [--force name ...]
# Generates every sound in sound/samples/specs.json that has no file yet, with the ElevenLabs Sound Effects API
# (the key is injected by the network proxy; it is never read or printed here), and writes sound/samples/<name>.mp3.
# Beds are generated as seamless loops. The files are committed, so a soundtrack rebuild never calls the API.
# Scores (Eleven Music) are fetched the same way from sound/samples/music/<name>.json (a composition plan).
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DIR = os.path.join(HERE, "samples")
API = "https://api.elevenlabs.io/v1"


def post(url, body, out):
    tmp = out + ".part"
    r = subprocess.run(["curl", "-sS", "-o", tmp, "-w", "%{http_code}", "-X", "POST", url, "-H", "Content-Type: application/json",
                        "-d", json.dumps(body)], capture_output=True, text=True)
    code = r.stdout.strip()
    if code != "200":
        err = open(tmp, errors="replace").read()[:400] if os.path.exists(tmp) else r.stderr
        if os.path.exists(tmp):
            os.remove(tmp)
        raise SystemExit(f"{os.path.basename(out)}: HTTP {code}: {err}")
    os.replace(tmp, out)


def main(args):
    force = set(args[1:]) if args and args[0] == "--force" else set()
    spec = json.load(open(os.path.join(DIR, "specs.json")))
    jobs = []
    for kind in ("sfx", "bed"):
        for name, s in spec[kind].items():
            out = os.path.join(DIR, f"{name}.mp3")
            if os.path.exists(out) and name not in force:
                continue
            body = {"text": s["p"], "duration_seconds": s["s"], "prompt_influence": s.get("influence", 0.6), "model_id": "eleven_text_to_sound_v2"}
            if kind == "bed":
                body["loop"] = True
            jobs.append((name, f"{API}/sound-generation", body, out))
    mdir = os.path.join(DIR, "music")
    if os.path.isdir(mdir):
        for f in sorted(os.listdir(mdir)):
            if f.endswith(".json"):
                name, out = f[:-5], os.path.join(mdir, f[:-5] + ".mp3")
                if os.path.exists(out) and name not in force:
                    continue
                jobs.append((name, f"{API}/music", json.load(open(os.path.join(mdir, f))), out))
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(4) as ex:
        for name, url, body, out in jobs:
            ex.submit(lambda a: (post(*a[1:]), print("  generated", a[0], flush=True)), (name, url, body, out)).add_done_callback(
                lambda f: f.exception() and print("  FAILED", f.exception(), flush=True))
    print(f"{len(jobs)} sample(s) requested")


if __name__ == "__main__":
    main(sys.argv[1:])
