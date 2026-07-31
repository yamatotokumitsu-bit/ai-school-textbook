#!/bin/bash
# 教科書の最新HTMLを暗号化して公開する（自動実行用・合言葉はKeychainから取得）
#   手動版: bash deploy.sh <合言葉>
#   自動版: bash deploy-auto.sh      ← 合言葉を打たなくていい（Keychainに入っている前提）
#
# 事前に1回だけ、本人がこれを実行して合言葉を登録しておくこと:
#   security add-generic-password -a "$USER" -s "textbook-passphrase" -w
#   （実行するとパスワード入力を求められるので、そこに合言葉を入れる）
#
# 費用: なし（GitHub Pages・ローカル処理のみ）
set -euo pipefail
cd "$(dirname "$0")"

PASS="$(security find-generic-password -a "$USER" -s "textbook-passphrase" -w 2>/dev/null || true)"
if [ -z "$PASS" ]; then
  echo "エラー: Keychainに合言葉（textbook-passphrase）が登録されていません。" >&2
  echo "次を1回だけ実行して登録してください:" >&2
  echo '  security add-generic-password -a "$USER" -s "textbook-passphrase" -w' >&2
  exit 1
fi

SRC="$HOME/AI-Brain/DMC-Brain/materials/docs/2026-07-08_claude-code-textbook/Claudeコード超完全版.html"
[ -f "$SRC" ] || { echo "エラー: 元HTMLが見つかりません: $SRC" >&2; exit 1; }

node build_secure_page.js "$PASS" "$SRC" index.html
unset PASS

if git diff --quiet && git diff --cached --quiet; then
  echo "変更なし。公開はスキップします。"
  exit 0
fi

git add -A
git commit -m "update textbook $(date +%F)"
git push
echo "公開完了（数分で反映）: https://yamatotokumitsu-bit.github.io/ai-school-textbook/"
