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

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --no-pdf-header-footer \
  --virtual-time-budget=5000 \
  --print-to-pdf="$PDF_PATH" \
  "file://$INDEX_HTML"

(cd "$DECK_DIR" && pdftoppm -jpeg -r 90 deck.pdf qa)

echo "[export-pdf] 生成完了:"
echo "  PDF   : $PDF_PATH"
echo "  QA画像: $DECK_DIR/qa-*.jpg"
