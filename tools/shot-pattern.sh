#!/usr/bin/env bash
# tools/shot-pattern.sh — 構図パターンの実寸（960×540）スクリーンショットを headless Chrome で撮る
#
#   bash tools/shot-pattern.sh <name> [out.png]     既定の出力先: previews/<name>.png
#
# - Chrome / Chromium を探して --headless=new で撮影する（環境変数 CHROME=<パス> で指定も可）
# - パターンHTMLは /assets/... を参照するため、リポジトリ直下を python3 の簡易HTTPサーバで一時配信して撮る
#   （python3 が無ければ file:// で撮る。その場合 /assets/ の画像は表示されない）
# - CI（pr-check.yml）ではこの結果を artifact「pattern-previews」に載せる。日本語フォントは CI 側で fonts-noto-cjk を入れる

set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PREFIX="SLIDE-PATTERN-"

fail() { printf '✗ %s\n' "$*" >&2; exit 1; }
[ $# -ge 1 ] || { echo "使い方: bash tools/shot-pattern.sh <name> [out.png]" >&2; exit 2; }

NAME="${1%/}"; NAME="${NAME##*/}"; NAME="${NAME#"$PREFIX"}"
OUT="${2:-previews/${NAME}.png}"
HTML="$ROOT/patterns/${PREFIX}${NAME}/${PREFIX}${NAME}.html"
[ -f "$HTML" ] || fail "$HTML がありません"

# Chrome / Chromium を探す
CHROME_BIN=""
for c in "${CHROME:-}" google-chrome google-chrome-stable chromium-browser chromium chrome \
         "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
         "/Applications/Chromium.app/Contents/MacOS/Chromium"; do
  [ -n "$c" ] || continue
  if [ -x "$c" ]; then CHROME_BIN="$c"; break; fi
  if command -v "$c" >/dev/null 2>&1; then CHROME_BIN="$(command -v "$c")"; break; fi
done
[ -n "$CHROME_BIN" ] || fail "Chrome / Chromium が見つかりません（環境変数 CHROME=<実行ファイルのパス> で指定できます）"

case "$OUT" in /*) OUT_ABS="$OUT" ;; *) OUT_ABS="$PWD/$OUT" ;; esac
mkdir -p "$(dirname "$OUT_ABS")"

# 配信サーバ（/assets/ 解決用）
SRV_PID=""
cleanup() { [ -n "$SRV_PID" ] && kill "$SRV_PID" >/dev/null 2>&1 || true; }
trap cleanup EXIT
if command -v python3 >/dev/null 2>&1; then
  PORT="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')"
  ( cd "$ROOT" && exec python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 ) &
  SRV_PID=$!
  i=0
  until python3 -c "import urllib.request,sys; urllib.request.urlopen('http://127.0.0.1:$PORT/', timeout=1)" >/dev/null 2>&1; do
    i=$((i + 1)); [ "$i" -le 50 ] || fail "配信サーバが起動しませんでした"; sleep 0.1
  done
  URL="http://127.0.0.1:${PORT}/patterns/${PREFIX}${NAME}/${PREFIX}${NAME}.html"
else
  echo "⚠ python3 が無いため file:// で撮影します（/assets/ の画像は表示されません）" >&2
  URL="file://${HTML}"
fi

# 撮影（実寸 960×540・倍率1）。仮想時間で Web フォント（Font Awesome 等）の読み込みを待つ。
# 環境によっては --screenshot 後に Chrome が終了しないことがあるため、出力ファイルが書かれて安定したら止める。
TMP_PROFILE="$(mktemp -d)"
rm -f "$OUT_ABS"
"$CHROME_BIN" --headless=new --no-sandbox --disable-gpu --hide-scrollbars --no-first-run --no-default-browser-check \
  --user-data-dir="$TMP_PROFILE" --force-device-scale-factor=1 --window-size=960,540 \
  --virtual-time-budget=3000 --screenshot="$OUT_ABS" "$URL" >/dev/null 2>&1 &
CH_PID=$!
i=0; last=-1; stable=0
while [ "$i" -lt 200 ]; do   # 最大 60 秒
  kill -0 "$CH_PID" 2>/dev/null || break
  if [ -s "$OUT_ABS" ]; then
    size="$(wc -c < "$OUT_ABS" | tr -d ' ')"
    if [ "$size" = "$last" ]; then stable=$((stable + 1)); else stable=0; last="$size"; fi
    [ "$stable" -ge 3 ] && break
  fi
  sleep 0.3; i=$((i + 1))
done
if kill -0 "$CH_PID" 2>/dev/null; then
  kill "$CH_PID" 2>/dev/null || true; sleep 0.5; kill -9 "$CH_PID" 2>/dev/null || true
fi
wait "$CH_PID" 2>/dev/null || true
rm -rf "$TMP_PROFILE"
[ -s "$OUT_ABS" ] || fail "スクリーンショットを作成できませんでした（$CHROME_BIN）"
echo "✓ $OUT"
