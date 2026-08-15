#!/usr/bin/env bash
# tools/propose-pattern.sh — 構図パターンを公開ギャラリーに提案する（fork → ブランチ → push → Pull Request）
#
#   bash tools/propose-pattern.sh <name>            例: bash tools/propose-pattern.sh my-new-layout
#   bash tools/propose-pattern.sh <name> --dry-run  実際には push / PR 作成をせず、やることと PR 本文だけ表示
#
# 流れ:
#   1. node tools/lint-pattern.mjs <name> を通す（違反があれば止まる）
#   2. フロントマターの id が pending であることを確認（新規提出は id: pending）
#   3. gh（GitHub CLI）でログイン済みか確認 → 自分の fork を用意（所有者本人なら fork せず本体へ）
#   4. 一時フォルダに fork を浅く clone → 上流 main を取り込んだ pattern/<name> ブランチを作る
#   5. patterns/SLIDE-PATTERN-<name>/ だけをコピーして commit → push
#   6. gh pr create（本文は .github/PULL_REQUEST_TEMPLATE.md 準拠）→ PR の URL を表示
#
# 必要なもの: git / node（18以上）/ gh（https://cli.github.com/）。macOS 標準の bash 3.2 で動く。Windows は非対応。
# 環境変数（テスト用）: SLIDEKIT_UPSTREAM=owner/repo で上流を差し替え、SLIDEKIT_GH_USER=login で自分のアカウント名を上書き、
#   SLIDEKIT_GIT_BASE=<URLやパス> で clone/push 先のベース（既定 https://github.com）を差し替え。

set -eu
set -o pipefail

UPSTREAM="${SLIDEKIT_UPSTREAM:-matsumatsu04/slidekit}"
UPSTREAM_OWNER="${UPSTREAM%%/*}"
UPSTREAM_REPO="${UPSTREAM##*/}"
GIT_BASE="${SLIDEKIT_GIT_BASE:-https://github.com}"
UPSTREAM_URL="${GIT_BASE}/${UPSTREAM}.git"
PREFIX="SLIDE-PATTERN-"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

usage() {
  cat <<'USAGE'
使い方: bash tools/propose-pattern.sh <name> [--dry-run]

  <name>      提案するパターン名（patterns/SLIDE-PATTERN-<name>/ のフォルダ名。SLIDE-PATTERN- 付きでも可）
  --dry-run   push / PR 作成をせず、やること一覧と PR 本文だけを表示する

事前に必要なもの:
  - git / node（18以上）
  - gh（GitHub CLI）: https://cli.github.com/ からインストールし、`gh auth login` でログインしておく
USAGE
}

DRY_RUN=0
NAME=""
for a in "$@"; do
  case "$a" in
    -h|--help) usage; exit 0 ;;
    --dry-run) DRY_RUN=1 ;;
    -*) echo "✗ 不明なオプション: $a" >&2; usage >&2; exit 2 ;;
    *) NAME="$a" ;;
  esac
done
if [ -z "$NAME" ]; then usage >&2; exit 2; fi

# 名前の正規化: patterns/SLIDE-PATTERN-foo/ → foo
NAME="${NAME%/}"
NAME="${NAME##*/}"
NAME="${NAME#"$PREFIX"}"
DIR="patterns/${PREFIX}${NAME}"
BRANCH="pattern/${NAME}"

say()  { printf '%s\n' "$*"; }
fail() { printf '✗ %s\n' "$*" >&2; exit 1; }
step() { printf '\n▶ %s\n' "$*"; }

[ -d "$DIR" ] || fail "$DIR がありません（先に slidekit-layout でパターンを作ってください）"

# ---- 前提チェック ------------------------------------------------------------

command -v git >/dev/null 2>&1 || fail "git が見つかりません。https://git-scm.com/ からインストールしてください"
command -v node >/dev/null 2>&1 || fail "node が見つかりません。Node.js 18 以上をインストールしてください（https://nodejs.org/）"
NODE_MAJOR="$(node -p 'parseInt(process.versions.node.split(".")[0], 10)' 2>/dev/null || echo 0)"
[ "$NODE_MAJOR" -ge 18 ] 2>/dev/null || fail "Node.js 18 以上が必要です（現在: $(node -v 2>/dev/null || echo 不明)）"

step "1/6 lint: node tools/lint-pattern.mjs $NAME"
node tools/lint-pattern.mjs "$NAME" || fail "lint に違反があります。直してから再実行してください"

step "2/6 フロントマターの確認"
FM_FILE="$(mktemp)"
trap 'rm -f "$FM_FILE"' EXIT
SK_ROOT="$ROOT" SK_NAME="$NAME" node --input-type=module -e '
  import { pathToFileURL } from "node:url";
  const lib = await import(pathToFileURL(process.env.SK_ROOT + "/tools/lib/pattern-lib.mjs").href);
  const p = lib.readPattern(process.env.SK_ROOT, process.env.SK_NAME);
  if (p.error) { console.error(p.error); process.exit(1); }
  const d = p.fm.data;
  for (const k of ["name", "category", "summary", "scenes", "tier", "id"]) console.log(String(d[k] ?? "").replace(/\s+/g, " "));
' > "$FM_FILE" || fail "フロントマターが読めません"
FM_NAME="$(sed -n '1p' "$FM_FILE")"
FM_CATEGORY="$(sed -n '2p' "$FM_FILE")"
FM_SUMMARY="$(sed -n '3p' "$FM_FILE")"
FM_TIER="$(sed -n '5p' "$FM_FILE")"
FM_ID="$(sed -n '6p' "$FM_FILE")"
[ "$FM_ID" = "pending" ] || fail "新規提出は id: pending にしてください（現在: id: ${FM_ID}）。番号はマージ時に自動で採番されます"
say "  name=${FM_NAME} / category=${FM_CATEGORY} / tier=${FM_TIER} / id=${FM_ID}"
say "  summary=${FM_SUMMARY}"

step "3/6 GitHub CLI（gh）の確認"
if ! command -v gh >/dev/null 2>&1; then
  say "✗ gh（GitHub CLI）が見つかりません。" >&2
  say "  インストール: https://cli.github.com/  （macOS: brew install gh）" >&2
  say "  インストール後に \`gh auth login\` でログインしてから、もう一度このスクリプトを実行してください" >&2
  exit 1
fi
if ! gh auth status -h github.com >/dev/null 2>&1; then
  say "✗ GitHub にログインしていません。次を実行してログインしてください:" >&2
  say "    gh auth login" >&2
  say "  （ブラウザが開くので GitHub アカウントで認証。完了後にもう一度このスクリプトを実行）" >&2
  exit 1
fi
ME="${SLIDEKIT_GH_USER:-$(gh api user --jq .login 2>/dev/null || true)}"
[ -n "$ME" ] || fail "GitHub のアカウント名を取得できませんでした（gh api user）。ネットワークと \`gh auth status\` を確認してください"
say "  ログイン中: $ME"

if [ "$ME" = "$UPSTREAM_OWNER" ]; then
  MODE="owner"
  HEAD_REPO="$UPSTREAM"
  HEAD_REF="$BRANCH"
  say "  所有者本人のため fork せず、$UPSTREAM に $BRANCH を push して同リポジトリ内で PR を作ります"
else
  MODE="fork"
  HEAD_REPO="${SLIDEKIT_FORK:-${ME}/${UPSTREAM_REPO}}"
  HEAD_REF="${ME}:${BRANCH}"
  say "  fork: $HEAD_REPO（無ければ作成）→ $BRANCH を push → $UPSTREAM へ PR"
fi
HEAD_URL="${GIT_BASE}/${HEAD_REPO}.git"

step "4/6 PR 本文の生成"
BODY_FILE="$(mktemp)"
trap 'rm -f "$FM_FILE" "$BODY_FILE"' EXIT
node tools/lib/pr-body.mjs "$NAME" > "$BODY_FILE" || fail "PR 本文を生成できませんでした"
TITLE="パターン提案: ${NAME}"

if [ "$DRY_RUN" = "1" ]; then
  step "--dry-run: 以下は実行せずに終了します"
  cat <<PLAN
  1) gh auth setup-git（git の認証を gh に委ねる・冪等）
  2) $( [ "$MODE" = "fork" ] && echo "gh repo fork $UPSTREAM --clone=false（既にあればそのまま）" || echo "（所有者本人のため fork なし）" )
  3) TMP=\$(mktemp -d) && git clone --depth 1 $HEAD_URL \$TMP/repo
  4) git fetch $UPSTREAM_URL main && git checkout -B $BRANCH FETCH_HEAD
  5) $DIR/ を \$TMP/repo/patterns/ にコピー → git add $DIR → git commit -m "feat(pattern): ${PREFIX}${NAME} を提案"
  6) git push --force -u origin $BRANCH
  7) gh pr create --repo $UPSTREAM --base main --head $HEAD_REF --title "$TITLE" --body-file <下記>
  8) 一時フォルダを削除

── PR タイトル: $TITLE
── PR 本文:
PLAN
  cat "$BODY_FILE"
  say "── ここまで（--dry-run）"
  exit 0
fi

# ---- 実行 ----------------------------------------------------------------------

gh auth setup-git >/dev/null 2>&1 || say "  （gh auth setup-git をスキップ: 既に設定済みか、権限がありません）"

if [ "$MODE" = "fork" ]; then
  step "5/6 fork の用意"
  if gh repo view "$HEAD_REPO" >/dev/null 2>&1; then
    say "  fork あり: $HEAD_REPO"
  else
    gh repo fork "$UPSTREAM" --clone=false >/dev/null 2>&1 || true
    # fork の反映待ち（直後は 404 になることがある）
    i=0
    until gh repo view "$HEAD_REPO" >/dev/null 2>&1; do
      i=$((i + 1))
      [ "$i" -le 10 ] || fail "fork（$HEAD_REPO）を確認できませんでした。https://github.com/$UPSTREAM を開いて Fork ボタンを押してから再実行してください"
      sleep 3
    done
    say "  fork 作成: $HEAD_REPO"
  fi
fi

step "$( [ "$MODE" = "fork" ] && echo 6 || echo 5 )/6 ブランチ作成 → push → PR"
TMP="$(mktemp -d)"
trap 'rm -f "$FM_FILE" "$BODY_FILE"; rm -rf "$TMP"' EXIT

i=0
until git clone --quiet --depth 1 "$HEAD_URL" "$TMP/repo" 2>/dev/null; do
  i=$((i + 1))
  [ "$i" -le 5 ] || fail "$HEAD_URL を clone できませんでした（fork の反映待ちの可能性があります。少し待って再実行してください）"
  sleep 3
done
cd "$TMP/repo"
git fetch --quiet "$UPSTREAM_URL" main || fail "$UPSTREAM の main を取得できませんでした（ネットワークを確認してください）"
git checkout --quiet -B "$BRANCH" FETCH_HEAD

rm -rf "patterns/${PREFIX}${NAME}"
mkdir -p patterns
cp -R "$ROOT/$DIR" "patterns/"
find "patterns/${PREFIX}${NAME}" -name '.DS_Store' -delete 2>/dev/null || true
git add "$DIR"
if git diff --cached --quiet; then
  fail "変更がありません（同じ内容の ${PREFIX}${NAME} が既に $UPSTREAM の main にあります）"
fi

GIT_NAME="$(git config user.name || true)"
GIT_EMAIL="$(git config user.email || true)"
[ -n "$GIT_NAME" ] || GIT_NAME="$ME"
[ -n "$GIT_EMAIL" ] || GIT_EMAIL="${ME}@users.noreply.github.com"
git -c "user.name=$GIT_NAME" -c "user.email=$GIT_EMAIL" commit --quiet -m "feat(pattern): ${PREFIX}${NAME} を提案" -m "category: ${FM_CATEGORY} / tier: ${FM_TIER}"
git push --quiet --force -u origin "$BRANCH" || fail "push に失敗しました（$HEAD_URL / $BRANCH）。\`gh auth status\` と権限を確認してください"
say "  push 完了: $HEAD_REPO $BRANCH"

cd "$ROOT"
PR_URL="$(gh pr create --repo "$UPSTREAM" --base main --head "$HEAD_REF" --title "$TITLE" --body-file "$BODY_FILE" 2>/dev/null || true)"
if [ -z "$PR_URL" ]; then
  # 既に同じブランチの PR がある場合は、そちらが更新されている（push 済み）
  PR_URL="$(gh pr view "$HEAD_REF" --repo "$UPSTREAM" --json url --jq .url 2>/dev/null || true)"
  [ -n "$PR_URL" ] || fail "PR を作成できませんでした。https://github.com/$UPSTREAM/compare/main...$HEAD_REF を開いて手動で作成してください"
  say "  既存の PR を更新しました"
fi

say ""
say "✓ 提案しました: $PR_URL"
say "  レビュー後にマージされると自動で採番され、ギャラリーに載ります。差し戻しがあれば PR のコメントを確認してください。"
