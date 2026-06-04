#!/bin/sh
# Chạy một lần mỗi máy: sh scripts/setup-git-hooks.sh
cd "$(dirname "$0")/.." || exit 1
git config core.hooksPath .githooks
chmod +x .githooks/commit-msg .githooks/prepare-commit-msg 2>/dev/null || true
echo "OK: core.hooksPath = .githooks (blocks Cursor Co-authored-by)"
