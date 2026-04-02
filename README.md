# openbuddy

Tamagotchi-style ASCII buddies for your CLI coding tools.

openbuddy injects a cute ASCII companion into your CLI workflow. It supports session tracking, creature evolution, and integration with the Gemini CLI.

## Screenshots

### Linux / macOS (tmux split pane)

| OpenCode (tmux split) | Codex CLI (tmux split) |
|:---:|:---:|
| ![OpenCode Linux](docs/images/linux-opencode.png) | ![Codex CLI Linux](docs/images/linux-codex.png) |

### Windows (separate window)

| Gemini CLI (Ink panel) | Codex CLI (separate window) |
|:---:|:---:|
| ![Gemini CLI](docs/images/win-gemini.png) | ![Codex CLI](docs/images/win-codex.png) |

## Features

- **6 Unique Creatures:** debugrix, velocode, refactoron, nullbyte, wizardex, and compilox.
- **Tokscale Integration:** Evolution is now driven by your **actual AI token usage** (Input + Output) tracked via [tokscale](https://github.com/sioaeko/tokscale).
- **Evolution System (Mania Thresholds):** 
  - **Egg:** 0
  - **Baby:** 10M tokens
  - **Adult:** 50M tokens
  - **Elder:** 100M tokens
- **CLI Integration:** Built-in support for wrapping tools like `codex`, `gemini`, and `opencode`.
- **Gemini CLI Buddy Panel:** A custom Ink component for Gemini CLI users, now showing real-time token progress.
- **Robust Launcher:** Automated `stdin` flush and TTY stabilization to prevent input ghosting.
- **Dynamic Layout:** Responsive buddy panel that scales or hides based on terminal width.
- **Cross-platform:** Works on Linux, macOS, and Windows (Git Bash).

## Components

- `bin/openbuddy`: Main Python application for managing your buddy (now integrates with `tokscale`).
- `bin/openbuddy-wrap`: Tool to wrap other CLI commands with openbuddy.
- `bin/openbuddy-launcher`: Robust execution wrapper with error capture and TTY stabilization.
- `share/BuddyPanel.js`: Custom Ink component for Gemini CLI.
- `share/openbuddy-patch.sh`: Script to patch Gemini CLI with the openbuddy buddy panel.

## Installation

### Linux / macOS

```bash
git clone https://github.com/sioaeko/openbuddy.git
cd openbuddy
ln -s $(pwd)/bin/openbuddy ~/.local/bin/openbuddy
ln -s $(pwd)/bin/openbuddy-wrap ~/.local/bin/openbuddy-wrap
cp share/* ~/.local/share/openbuddy/
```

### Windows (Git Bash)

```bash
git clone https://github.com/sioaeko/openbuddy.git
cd openbuddy
mkdir -p ~/.local/bin ~/.local/share/openbuddy
cp bin/openbuddy ~/.local/bin/
cp bin/openbuddy-wrap ~/.local/bin/
cp share/* ~/.local/share/openbuddy/
```

Make sure `~/.local/bin` is in your PATH (it should be before npm's path for wrappers to work).

### Initialize

```bash
openbuddy show
```

### Wrap a tool

```bash
openbuddy-wrap codex
openbuddy-wrap gemini
openbuddy-wrap opencode
```

On Windows, this also generates `.cmd` wrappers so that PowerShell and cmd.exe pick them up.

## Usage

```bash
openbuddy show            # Show your buddy and current token usage
openbuddy session [tool]  # Increment session count and sync tokens from tokscale
openbuddy watch           # Live refresh mode (syncs tokens every 2 mins)
openbuddy info            # Show brief buddy info (including total tokens)
openbuddy list            # List all creature types
openbuddy reset           # Start over with a new egg
```

## How Evolution Works

Previously, openbuddy evolved based on the number of CLI sessions. Now, it connects to your local `tokscale` installation to feed on your real AI workload.

1.  **Syncing:** Every time you run `openbuddy session` or a wrapped tool, it runs `tokscale --json` to fetch your cumulative usage.
2.  **Feeding:** Your buddy grows as you spend tokens on LLMs. The more you code, the faster they evolve.
3.  **Thresholds:** To reach **Elder** status, you must reach the **Mania** level of 100 million tokens.

## Platform Differences

| Platform | Buddy display | Gemini integration |
|----------|--------------|-------------------|
| Linux/macOS (tmux) | Split pane inside the same terminal | Ink component embedded in Gemini UI |
| Windows | Separate popup window alongside the tool | Ink component embedded in Gemini UI |

On Linux/macOS with tmux, the buddy appears as a split pane within your terminal. On Windows, tmux is not available, so the wrapper launches a **separate window** with the buddy watch panel next to your tool.

## Gemini CLI Integration

To add openbuddy to your Gemini CLI:
```bash
# Linux (global npm install)
sudo bash share/openbuddy-patch.sh

# Windows / user npm install
bash share/openbuddy-patch.sh
```

The script auto-detects the Gemini CLI installation path. To revert:
```bash
bash share/openbuddy-unpatch.sh
```

## Requirements

- Python 3.8+
- [tokscale](https://github.com/sioaeko/tokscale) (required for token-based evolution)
- `rich` (optional, for colored output): `pip install rich`
- `tmux` (optional, Linux/macOS, for split-pane buddy display within the same terminal)

> **Windows note:** Since tmux is not available on Windows, the buddy opens in a separate popup window instead of a split pane. No additional dependencies are required — the wrapper uses PowerShell's `Start-Process` to launch the buddy window.

## Notice

This project is built from scratch, inspired only by the **concept** of ASCII companions in CLI tools (such as Claude Code). It **does not** use, reference, or contain any leaked code or internal assets. All logic, ASCII art, and integration scripts are original implementations.

## License

MIT
