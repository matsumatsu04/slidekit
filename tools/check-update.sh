#!/usr/bin/env bash
# tools/check-update.sh — 上流（GitHub の main）に新しいパターンや更新があるかを確認し、必要なら取り込む
#
#   bash tools/check-update.sh           更新の有無と件数を表示するだけ（ファイルは変更しない）
#   bash tools/check-update.sh --apply   取り込む: 生成物のローカル変更を復元 → git pull --ff-only → manifest/INDEX を再生成
#
# 使い方の想定: 「スライドを作って」の最初（Step 0）に呼ばれ、出力の1〜3行をそのまま案内に使う。
# git リポジトリでない／ネットワーク不通／リモート未設定のときは、1行だけ表示して非0で静かに終わる（作業は止めない）。
# macOS 標準の bash 3.2 で動く。

set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
export GIT_TERMINAL_PROMPT=0

APPLY=0
for a in "$@"; do
  case "$a" in
    --apply) APPLY=1 ;;
    -h|--help)
      sed -n '2,9p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "✗ 不明なオプション: $a（--apply または --help）"; exit 2 ;;
  esac
done

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "git リポジトリではないため、更新確認をスキップしました"; exit 1; }

if git remote get-url upstream >/dev/null 2>&1; then REMOTE=upstream
elif git remote get-url origin >/dev/null 2>&1; then REMOTE=origin
else echo "リモート（origin / upstream）が未設定のため、更新確認をスキップしました"; exit 1
fi

if ! git fetch --quiet "$REMOTE" main >/dev/null 2>&1; then
  echo "上流（$REMOTE）に接続できないため、更新確認をスキップしました（オフラインの可能性）"
  exit 1
fi

BEHIND="$(git rev-list --count HEAD..FETCH_HEAD 2>/dev/null || echo 0)"
AHEAD="$(git rev-list --count FETCH_HEAD..HEAD 2>/dev/null || echo 0)"
NEW_PATTERNS="$(git diff --name-only --diff-filter=A HEAD FETCH_HEAD -- 'patterns/SLIDE-PATTERN-*/*.md' 2>/dev/null | grep -c . || true)"
CHANGED_PATTERNS="$(git diff --name-only HEAD FETCH_HEAD -- 'patterns/SLIDE-PATTERN-*/' 2>/dev/null | sed -E 's#^patterns/(SLIDE-PATTERN-[^/]+)/.*#\1#' | sort -u | grep -c . || true)"

if [ "$BEHIND" = "0" ]; then
  echo "✓ 最新です（上流に新しい更新はありません）"
  exit 0
fi

if [ "$APPLY" = "0" ]; then
  echo "上流に ${BEHIND} 件の更新があります（新規パターン ${NEW_PATTERNS} 件・内容が変わったパターン ${CHANGED_PATTERNS} 件）"
  echo "取り込むには: bash tools/check-update.sh --apply"
  exit 0
fi

# ---- --apply ---------------------------------------------------------------------

if [ "$AHEAD" != "0" ]; then
  echo "ローカルに独自コミットが ${AHEAD} 件あるため自動では取り込めません。手動で \`git pull --rebase $REMOTE main\` を実行してください"
  exit 1
fi

# 1) 生成物のローカル変更を復元（manifest / INDEX は完全な生成物。README / gallery は件数の行だけが生成物）
for f in patterns/manifest.json patterns/SLIDE-PATTERN-INDEX.md; do
  git checkout --quiet -- "$f" 2>/dev/null || true
done
for f in README.md gallery/index.html; do
  git diff --quiet -- "$f" 2>/dev/null && continue
  if git diff -U0 -- "$f" 2>/dev/null | grep -E '^[-+][^-+]' | grep -vqE '(14カテゴリ・[0-9]+種|構図パターン[0-9]+種)'; then
    echo "⚠ $f に件数以外のローカル変更があるため復元しませんでした（取り込みに失敗したら手動で対処してください）"
  else
    git checkout --quiet -- "$f" 2>/dev/null || true
  fi
done

# 2) 未tracked のローカルパターン（提案中の pending）と同名のフォルダが上流に入っていたら、先に退避する（add/add 衝突の防止）
STAMP="$(date +%Y%m%d-%H%M%S)"
for d in $(git ls-files --others --exclude-standard --directory -- 'patterns/' 2>/dev/null | grep -E '^patterns/SLIDE-PATTERN-[^/]+/$'); do
  dir="${d%/}"
  if git cat-file -e "FETCH_HEAD:${dir}" 2>/dev/null; then
    mkdir -p "tmp/pending-backup/${STAMP}"
    mv "$dir" "tmp/pending-backup/${STAMP}/"
    echo "退避: ${dir}/ → tmp/pending-backup/${STAMP}/${dir#patterns/}/（同名のパターンが上流に入ったため。上流版が取り込まれます）"
  fi
done

# 3) 取り込み（fast-forward のみ）
if ! git pull --quiet --ff-only "$REMOTE" main >/dev/null 2>&1; then
  echo "✗ 取り込みに失敗しました（ローカルの変更が上流と衝突している可能性）。\`git status\` で変更を確認してから、もう一度実行してください"
  exit 1
fi

# 4) 再生成（ローカルに pending のパターンが残っていれば、再び manifest / INDEX に含める）
NODE_MAJOR="$(node -p 'parseInt(process.versions.node.split(".")[0], 10)' 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR" -ge 18 ] 2>/dev/null; then
  node tools/build-manifest.mjs >/dev/null 2>&1 || echo "⚠ manifest / INDEX の再生成に失敗しました。\`node tools/build-manifest.mjs\` を実行して内容を確認してください"
else
  echo "⚠ Node.js 18 以上が見つからないため再生成をスキップしました（\`node tools/build-manifest.mjs\` を実行してください）"
fi

echo "✓ 取り込み完了: ${BEHIND} 件の更新（新規パターン ${NEW_PATTERNS} 件・内容が変わったパターン ${CHANGED_PATTERNS} 件）"
