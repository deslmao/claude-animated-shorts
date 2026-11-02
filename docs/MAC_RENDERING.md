# Rendering on your Mac — step-by-step guide

> **Optional.** The main way to make finished videos is the cloud render farm, which needs no installs: see
> [CLOUD_RENDERING.md](CLOUD_RENDERING.md). This guide is only for a **personal** Mac where you're allowed to install
> software (a school-managed laptop without admin rights can't do Part 1). Renders there are fastest because a real
> graphics chip is used.

You never need to write code. You only copy commands into the **Terminal** app and press Enter.

> **What is Terminal?** A window where you type commands instead of clicking. Open it with **⌘ Cmd + Space**, type
> `Terminal`, press **Enter**. To run a command: copy it from this page, paste it with **⌘ Cmd + V**, press **Enter**,
> and wait until the cursor comes back.

---

## Part 1 — One-time setup (about 15 minutes)

### Step 1: Install Apple's developer tools (gives you `git`, the download tool)
```bash
xcode-select --install
```
A window pops up: click **Install** and accept. If it says *"already installed"*, that's fine: go to Step 2.

### Step 2: Install Node.js (runs the video engine)
1. Go to **https://nodejs.org**.
2. Download the **LTS** version for macOS (the big green button, a `.pkg` file).
3. Double-click the downloaded file and click through the installer.
4. Check it worked. **Close Terminal and open it again**, then run:
```bash
node -v
```
You should see `v22…` or higher.

### Step 3: Download the project
This puts the project in your home folder, in a folder called `claude-animated-shorts`.
```bash
cd ~ && git clone https://github.com/deslmao/claude-animated-shorts.git
```
```bash
cd ~/claude-animated-shorts && git checkout claude/admiring-hopper-kbrb3d
```
(The second command selects the branch Claude is working on. Once the work is merged you won't need it.)

### Step 4: Run the setup script
```bash
cd ~/claude-animated-shorts && bash setup-mac.sh
```
It checks your Mac, installs the project's libraries, and test-compiles the videos. It ends with **"Setup complete"**.
The first time, it also downloads a small private copy of Chrome that the renderer uses. That's normal.

---

## Part 2 — Benchmark (run once, about 5-30 minutes)

This renders 10 real seconds of the bridge video at full 1080x1920 with every effect on, then measures speed and
memory. Claude uses the numbers to plan your renders.

Before you start:
- **Plug in the charger.** On battery, macOS slows the chip down.
- Quit other heavy apps (games, video editors, lots of browser tabs).
- Keep the lid open. The script keeps the Mac awake by itself.

```bash
cd ~/claude-animated-shorts/animation-studio && npm run benchmark
```
You'll see a progress counter (`Rendered 120/300…`). At the end it prints a **report table**.
**Copy the whole report and paste it into your chat with Claude.** It's also saved in
`animation-studio/out/benchmark/REPORT.md`.

To watch the benchmark clip:
```bash
open ~/claude-animated-shorts/animation-studio/out/benchmark/bridge_600-899.mp4
```

---

## Part 3 — Rendering a finished video (every video)

When Claude says a video is ready:

**1. Get Claude's latest work**
```bash
cd ~/claude-animated-shorts && git pull
```

**2. Render it.** Claude will give you the exact command. For the bridge short it is:
```bash
cd ~/claude-animated-shorts/animation-studio && npm run render -- BridgeShort
```

**3. Watch it**
```bash
open ~/claude-animated-shorts/animation-studio/out/BridgeShort.mp4
```

Later phases replace step 2 with a single `npm run short -- <video-name>` command, which renders the picture and adds
the narration, music and captions in one go.

### Useful extras
| You want to… | Command (run inside `animation-studio`) |
|---|---|
| make a quick half-size preview | `npm run preview -- BridgeShort` |
| add a soundtrack file to the render | `npm run render -- BridgeShort --audio path/to/mix.wav` |
| use less memory (if the Mac gets slow) | add `--concurrency 2` to any render command |
| open the visual editor in your browser | `npm run dev` (then press Ctrl + C in Terminal to stop it) |

### If something goes wrong
- **"command not found: node"**: close Terminal, open it again, and redo Step 2 if needed.
- **Render stops with "Error creating WebGL context"**: run it again with `REMOTION_GL=angle-egl` in front, e.g.
  `REMOTION_GL=angle-egl npm run render -- BridgeShort`, and tell Claude.
- **The Mac becomes very slow or hot**: add `--concurrency 2`. A MacBook Air has no fan, so very long renders may slow
  down a bit as it warms up. That's normal and safe.
- Anything else: copy the last ~30 lines Terminal printed and paste them to Claude.

---

## Cloud fallback
If your Mac isn't available, Claude can still render in the cloud with the same command (`npm run render`). It just
takes much longer (no graphics chip: about 14+ seconds per frame), so long videos are rendered in parts with
`--frames a-b` and joined.
