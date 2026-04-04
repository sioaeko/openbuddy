#!/usr/bin/env bash
# openbuddy Gemini CLI patch
# Adds BuddyPanel to Gemini CLI's Ink UI
#
# Linux:   sudo bash openbuddy-patch.sh
# Windows: bash openbuddy-patch.sh  (no sudo needed)

set -euo pipefail

# Detect Gemini CLI UI directory
if [[ -d "/usr/lib/node_modules/@google/gemini-cli/dist/src/ui" ]]; then
    GEMINI_UI="/usr/lib/node_modules/@google/gemini-cli/dist/src/ui"
elif command -v npm &>/dev/null; then
    NPM_ROOT="$(npm root -g 2>/dev/null)" || true
    if [[ -d "$NPM_ROOT/@google/gemini-cli/dist/src/ui" ]]; then
        GEMINI_UI="$NPM_ROOT/@google/gemini-cli/dist/src/ui"
    fi
fi

if [[ -z "${GEMINI_UI:-}" ]]; then
    echo "  ✗ Could not find Gemini CLI installation."
    echo "    Install it first: npm install -g @google/gemini-cli"
    exit 1
fi

# Detect patch source directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/BuddyPanel.js" ]]; then
    PATCH_SRC="$SCRIPT_DIR"
elif [[ -f "$HOME/.local/share/openbuddy/BuddyPanel.js" ]]; then
    PATCH_SRC="$HOME/.local/share/openbuddy"
else
    echo "  ✗ Could not find BuddyPanel.js"
    exit 1
fi

echo "  Patching Gemini CLI with openbuddy buddy panel..."
echo "  Gemini UI: $GEMINI_UI"

# Backup originals (skip if already backed up)
if [[ ! -f "$GEMINI_UI/layouts/DefaultAppLayout.js.orig" ]]; then
    cp "$GEMINI_UI/layouts/DefaultAppLayout.js" \
       "$GEMINI_UI/layouts/DefaultAppLayout.js.orig"
    echo "  ✓ Backed up DefaultAppLayout.js"
fi

# Install BuddyPanel component
cp "$PATCH_SRC/BuddyPanel.js" "$GEMINI_UI/components/BuddyPanel.js"
echo "  ✓ Installed BuddyPanel.js"

# Apply patched layout
cp "$PATCH_SRC/DefaultAppLayout.patched.js" \
   "$GEMINI_UI/layouts/DefaultAppLayout.js"
echo "  ✓ Patched DefaultAppLayout.js"

echo ""
echo "  Done! Run 'gemini' to see your buddy."
echo "  To revert: bash $SCRIPT_DIR/openbuddy-unpatch.sh"
