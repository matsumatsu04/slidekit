#!/bin/bash
# doctor.sh — SlideKit が動く環境かを点検する（読み取りのみ・何も書き換えない）
#
#   bash tools/doctor.sh
#
# 判定:
#   必須 … これが無いとスライドを作れない（git / Node.js 18以上）
#   任意 … 無くても作れる（Chrome=PDF自動書き出し／poppler=確認用画像）
# 終了コード: 必須が1つでも欠けていれば 1、それ以外は 0

cd "$(dirname "$0")/.." || exit 1

NG=0
ok()   { printf '  ✓ %s\n' "$1"; }
warn() { printf '  △ %s\n' "$1"; }
bad()  { printf '  ✗ %s\n' "$1"; NG=1; }

# OS判定（windows = Git Bash / MSYS / Cygwin）
case "$(uname -s 2>/dev/null)" in
  MINGW*|MSYS*|CYGWIN*) OS=windows ;;
  Darwin)               OS=mac ;;
  *)                    OS=linux ;;
esac

echo "SlideKit 環境チェック"
echo "  場所: $(pwd)（OS: $OS）"
echo

echo "[必須]"

# --- git ---
if command -v git >/dev/null 2>&1; then
  if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    ok "git $(git --version | awk '{print $3}')（このフォルダはリポジトリです＝更新を受け取れます）"
  else
    warn "git はありますが、このフォルダはリポジトリではありません（ZIPで展開した場合など）"
    echo "     → 更新を受け取るには git clone https://github.com/matsumatsu04/slidekit.git で取得し直してください"
  fi
else
  if [ "$OS" = "windows" ]; then
    bad "git が見つかりません → Git for Windows を導入（https://gitforwindows.org/）"
  else
    bad "git が見つかりません → https://git-scm.com/ から導入（macOSなら xcode-select --install でも入ります）"
  fi
fi

# --- Node.js ---
NODE_BIN=""
NODE_MAJOR=0
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
  NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
fi
if [ "${NODE_MAJOR:-0}" -ge 18 ] 2>/dev/null; then
  ok "Node.js $(node -v)（$NODE_BIN）"
else
  # 別の場所に新しい Node があるかもしれないので探す
  ALT=""
  for c in /opt/homebrew/bin/node /usr/local/bin/node "$HOME"/.nodebrew/node/*/bin/node "$HOME"/.nvm/versions/node/*/bin/node; do
    [ -x "$c" ] || continue
    m="$("$c" -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
    if [ "${m:-0}" -ge 18 ] 2>/dev/null; then ALT="$c"; break; fi
  done
  if [ -n "$NODE_BIN" ]; then
    bad "Node.js が古すぎます（$(node -v) → 18以上が必要）"
  else
    bad "Node.js が見つかりません（18以上が必要）"
  fi
  if [ -n "$ALT" ]; then
    echo "     → 新しい Node がここにあります: $ALT（$("$ALT" -v)）"
    echo "        この1行を実行すると、このターミナルではそちらが使われます:"
    echo "        export PATH=\"$(dirname "$ALT"):\$PATH\""
  elif [ "$OS" = "windows" ]; then
    echo "     → 導入: https://nodejs.org/ja のLTS版インストーラー（または winget install OpenJS.NodeJS.LTS）"
  else
    echo "     → 導入: https://nodejs.org/ja（LTS版）／ macOSで Homebrew があれば: brew install node"
  fi
fi

echo
echo "[任意]"

# --- Chrome（WindowsではEdgeでも可＝標準搭載） ---
CHROME=""
WIN_LOCAL=""
if command -v cygpath >/dev/null 2>&1 && [ -n "${LOCALAPPDATA:-}" ]; then
  WIN_LOCAL="$(cygpath "$LOCALAPPDATA" 2>/dev/null || true)"
fi
for c in \
  "${CHROME_BIN:-}" \
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  "/Applications/Chromium.app/Contents/MacOS/Chromium" \
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge" \
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" \
  "/c/Program Files/Google/Chrome/Application/chrome.exe" \
  "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
  "${WIN_LOCAL:+$WIN_LOCAL/Google/Chrome/Application/chrome.exe}" \
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
  "/c/Program Files/Microsoft/Edge/Application/msedge.exe"; do
  if [ -n "$c" ] && [ -x "$c" ]; then CHROME="$c"; break; fi
done
if [ -z "$CHROME" ]; then
  for c in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge brave-browser; do
    if command -v "$c" >/dev/null 2>&1; then CHROME="$(command -v "$c")"; break; fi
  done
fi
if [ -n "$CHROME" ]; then
  ok "Chrome/Edge（PDFを自動で書き出せます）: $CHROME"
else
  warn "Chrome/Edge が見つかりません → PDFは index.html をブラウザで開いて ⌘P（Windowsは Ctrl+P）→「PDFに保存」で作れます"
fi

# --- poppler（QA画像） ---
if command -v pdftoppm >/dev/null 2>&1; then
  ok "poppler（確認用の画像を自動生成できます）"
else
  if [ "$OS" = "mac" ]; then
    warn "poppler なし → 確認用画像は作られません（PDFとHTMLは作れます。欲しければ brew install poppler）"
  else
    warn "poppler なし → 確認用画像は作られません（PDFとHTMLは作れるので、無くて問題ありません）"
  fi
fi

# --- ライブラリ本体 ---
echo
echo "[ライブラリ]"
if [ -f patterns/manifest.json ] && [ -d .claude/skills/slidekit-assemble ]; then
  COUNT="$(grep -m1 '"count"' patterns/manifest.json | tr -dc '0-9')"
  ok "構図パターン ${COUNT:-?} 種・スキル3種（.claude/skills/）を確認"
else
  bad "ファイルが足りません（このフォルダは slidekit のルートですか？）"
fi

echo
if [ "$NG" = "0" ]; then
  echo "✓ 準備OK。このフォルダで claude を起動して「スライドを作って」と話しかけてください。"
else
  echo "✗ 上の ✗ を解消してから、もう一度 bash tools/doctor.sh を実行してください。"
fi
exit "$NG"
