#!/usr/bin/env bash
# openbuddy Gemini CLI unpatch
#
# Linux:   sudo bash openbuddy-unpatch.sh
# Windows: bash openbuddy-unpatch.sh

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
    exit 1
fi

if [[ -f "$GEMINI_UI/layouts/DefaultAppLayout.js.orig" ]]; then
    cp "$GEMINI_UI/layouts/DefaultAppLayout.js.orig" \
       "$GEMINI_UI/layouts/DefaultAppLayout.js"
    echo "  ✓ Restored DefaultAppLayout.js"
fi

if [[ -f "$GEMINI_UI/components/BuddyPanel.js" ]]; then
    rm "$GEMINI_UI/components/BuddyPanel.js"
    echo "  ✓ Removed BuddyPanel.js"
fi

echo "  Reverted to original Gemini CLI."
