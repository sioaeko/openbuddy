# anygochi

Tamagotchi-style ASCII buddies for your CLI coding tools.

anygochi injects a cute ASCII companion into your CLI workflow. It supports session tracking, creature evolution, and integration with the Gemini CLI.

## Screenshots

| Gemini CLI (Ink panel embedded) | Codex CLI (separate buddy window) |
|:---:|:---:|
| ![Gemini CLI](docs/images/win-gemini.png) | ![Codex CLI](docs/images/win-codex.png) |

## Features

- **6 Unique Creatures:** debugrix, velocode, refactoron, nullbyte, wizardex, and compilox.
- **Evolution System:** Egg -> Baby -> Adult -> Elder based on session counts.
- **CLI Integration:** Built-in support for wrapping tools like `codex`, `gemini`, and `opencode`.
- **Gemini CLI Buddy Panel:** A custom Ink component for Gemini CLI users.
- **Cross-platform:** Works on Linux, macOS, and Windows (Git Bash).

## Components

- `bin/anygochi`: Main Python application for managing your buddy.
- `bin/anygochi-wrap`: Tool to wrap other CLI commands with anygochi.
- `share/BuddyPanel.js`: Custom Ink component for Gemini CLI.
- `share/gemini-patch.sh`: Script to patch Gemini CLI with the anygochi buddy panel.

## Installation

### Linux / macOS

```bash
git clone https://github.com/sioaeko/anygochi.git
cd anygochi
ln -s $(pwd)/bin/anygochi ~/.local/bin/anygochi
ln -s $(pwd)/bin/anygochi-wrap ~/.local/bin/anygochi-wrap
cp share/* ~/.local/share/anygochi/
```

### Windows (Git Bash)

```bash
git clone https://github.com/sioaeko/anygochi.git
cd anygochi
mkdir -p ~/.local/bin ~/.local/share/anygochi
cp bin/anygochi ~/.local/bin/
cp bin/anygochi-wrap ~/.local/bin/
cp share/* ~/.local/share/anygochi/
```

Make sure `~/.local/bin` is in your PATH (it should be before npm's path for wrappers to work).

### Initialize

```bash
anygochi show
```

### Wrap a tool

```bash
anygochi-wrap codex
anygochi-wrap gemini
```

On Windows, this also generates `.cmd` wrappers so that PowerShell and cmd.exe pick them up.

## Usage

```bash
anygochi show            # Show your buddy
anygochi session [tool]  # Increment session count
anygochi watch           # Live refresh mode (e.g., for tmux panes)
anygochi info            # Show brief buddy info
anygochi list            # List all creature types
anygochi reset           # Start over with a new egg
```

## Platform Differences

| Platform | Buddy display | Gemini integration |
|----------|--------------|-------------------|
| Linux/macOS (tmux) | Split pane inside the same terminal | Ink component embedded in Gemini UI |
| Windows | Separate popup window alongside the tool | Ink component embedded in Gemini UI |

On Linux/macOS with tmux, the buddy appears as a split pane within your terminal. On Windows, tmux is not available, so the wrapper launches a **separate window** with the buddy watch panel next to your tool.

## Gemini CLI Integration

To add anygochi to your Gemini CLI:
```bash
# Linux (global npm install)
sudo bash share/gemini-patch.sh

# Windows / user npm install
bash share/gemini-patch.sh
```

The script auto-detects the Gemini CLI installation path. To revert:
```bash
bash share/gemini-unpatch.sh
```

## Requirements

- Python 3.8+
- `rich` (optional, for colored output): `pip install rich`
- `tmux` (optional, Linux/macOS, for split-pane buddy display within the same terminal)

> **Windows note:** Since tmux is not available on Windows, the buddy opens in a separate popup window instead of a split pane. No additional dependencies are required — the wrapper uses PowerShell's `Start-Process` to launch the buddy window.

## License

MIT
