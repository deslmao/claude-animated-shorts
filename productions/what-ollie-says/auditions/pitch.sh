#!/usr/bin/env bash
# What Ollie Says Part 1: pitch the two child voices up after `npm run short -- ollie-1 --until narration`
# (the ElevenLabs free tier has no child voices). Duration is kept exactly (rubberband, tempo 1), so the word timings
# in src/studio/stories/voice/ollie-1.ts stay valid. Idempotent: the original is kept as <hash>.orig.mp3 and every run
# re-derives from it. Run from animation-studio/, then continue with: npm run short -- ollie-1 --until checks
set -euo pipefail
cd "$(dirname "$0")/../../../animation-studio"
for j in voice/cache/*.json; do
  v=$(python3 -c "import json,sys; print(json.load(open(sys.argv[1])).get('voice',''))" "$j")
  case "$v" in olToddler) r=1.4983 ;; olOllie) r=1.5874 ;; *) continue ;; esac   # +7 and +8 semitones
  m="${j%.json}.mp3"; o="${j%.json}.orig.mp3"
  [ -f "$o" ] || cp "$m" "$o"
  ffmpeg -v error -y -i "$o" -af "rubberband=pitch=$r:tempo=1:formant=shifted" -c:a libmp3lame -b:a 128k "$m"
  echo "pitched $v x$r  $(basename "$m")  $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$o") s -> $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$m") s"
done
