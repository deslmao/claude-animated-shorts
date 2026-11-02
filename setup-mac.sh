#!/bin/bash
# One-time (and safe to re-run) setup of the animation studio on a Mac.
# Run from the project folder:   bash setup-mac.sh
set -e
cd "$(dirname "$0")"
green() { printf "\033[32m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }

echo "Checking your Mac…"
if [ "$(uname)" != "Darwin" ]; then red "This script is for macOS."; exit 1; fi
echo "  macOS $(sw_vers -productVersion), $(sysctl -n machdep.cpu.brand_string), $(( $(sysctl -n hw.memsize) / 1073741824 )) GB memory"

if ! command -v git >/dev/null 2>&1; then
  red "Git is missing. Run:  xcode-select --install   then run this script again."; exit 1
fi
green "  ✔ git $(git --version | awk '{print $3}')"

if ! command -v node >/dev/null 2>&1; then
  red "Node.js is missing. Install the LTS version from https://nodejs.org (the macOS installer), then run this script again."; exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 22 ]; then
  red "Node.js $(node -v) is too old. Install the LTS version from https://nodejs.org, then run this script again."; exit 1
fi
green "  ✔ node $(node -v)"

echo "Installing the project's libraries (first time: a few minutes)…"
cd animation-studio
npm ci --loglevel=error --no-fund --no-audit
green "  ✔ libraries installed"

echo "Checking the videos compile…"
npx tsc --noEmit
npx remotion compositions src/index.ts --log=warn
green ""
green "Setup complete. Next:"
echo "  cd animation-studio"
echo "  npm run benchmark      # measures render speed on this Mac (plug in the charger first)"
