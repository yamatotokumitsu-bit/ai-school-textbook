#!/bin/bash
# 教科書の最新HTMLを暗号化して公開する。使い方: bash deploy.sh <合言葉>
set -euo pipefail
cd "$(dirname "$0")"
SRC="$HOME/AI-Brain/DMC-Brain/materials/docs/2026-07-08_claude-code-textbook/Claudeコード超完全版.html"
node build_secure_page.js "$1" "$SRC" index.html
git add -A && git commit -m "update textbook $(date +%F)" && git push
echo "公開完了（数分で反映）"
