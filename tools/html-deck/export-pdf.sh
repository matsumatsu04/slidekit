#!/bin/bash
# export-pdf.sh
#
# build-html-deck.mjs が生成した index.html を PDF に書き出し、
# 目視QA用に1枚ずつのJPEG画像（qa-*.jpg）へ変換する。
#
# 使い方: bash export-pdf.sh <デッキフォルダ>

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "使い方: bash export-pdf.sh <デッキフォルダ>" >&2
  exit 1
fi

if [ ! -d "$1" ]; then
  echo "[export-pdf] エラー: デッキフォルダが見つかりません: $1" >&2
  exit 1
fi

DECK_DIR="$(cd "$1" && pwd)"
INDEX_HTML="$DECK_DIR/index.html"

if [ ! -f "$INDEX_HTML" ]; then
  echo "[export-pdf] エラー: index.html が見つかりません。先に build-html-deck.mjs を実行してください。" >&2
  echo "  例: node tools/html-deck/build-html-deck.mjs \"$1\"" >&2
  exit 1
fi

PDF_PATH="$DECK_DIR/deck.pdf"

# Chrome（またはChromium系ブラウザ）を探す。環境変数 CHROME_BIN があればそれを最優先。
find_chrome() {
  local c
  for c in \
    "${CHROME_BIN:-}" \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"; do
    if [ -n "$c" ] && [ -x "$c" ]; then printf '%s\n' "$c"; return 0; fi
  done
  for c in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge brave-browser; do
    if command -v "$c" >/dev/null 2>&1; then command -v "$c"; return 0; fi
  done
  return 1
}

if ! CHROME="$(find_chrome)"; then
  echo "[export-pdf] エラー: Chrome（Chromium系ブラウザ）が見つかりませんでした。" >&2
  echo "  対処①: Google Chrome を入れる（https://www.google.com/chrome/）" >&2
  echo "  対処②: 別の場所にある場合は CHROME_BIN で指定する" >&2
  echo "          例: CHROME_BIN=\"/path/to/chrome\" bash tools/html-deck/export-pdf.sh \"$1\"" >&2
  echo "  対処③: PDFだけならブラウザでも作れます → $INDEX_HTML を開いて ⌘P →「PDFに保存」" >&2
  exit 1
fi

"$CHROME" \
  --headless --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=5000 \
  --print-to-pdf="$PDF_PATH" \
  "file://$INDEX_HTML"

# QA画像（1スライド=1枚のJPEG）。poppler が無い環境でも PDF は完成しているので止めない。
QA_MADE=0
if command -v pdftoppm >/dev/null 2>&1; then
  (cd "$DECK_DIR" && pdftoppm -jpeg -r 90 deck.pdf qa)
  QA_MADE=1
fi

echo "[export-pdf] 生成完了:"
echo "  PDF   : $PDF_PATH"
if [ "$QA_MADE" = "1" ]; then
  echo "  QA画像: $DECK_DIR/qa-*.jpg"
else
  echo "  QA画像: 作成しませんでした（pdftoppm が未導入）。PDFは完成しています。"
  echo "         画像で確認したい場合は poppler を入れてください（macOS: brew install poppler）。"
  echo "         入れなくても index.html をブラウザで開けば確認できます。"
fi
