#!/bin/bash
# tools/gen-image.sh
# Gemini API (画像生成) でPNG画像を生成するスクリプト。
#
# 使い方:
#   bash tools/gen-image.sh "<英語プロンプト>" <出力.png> [アスペクト比]
#
# 例:
#   bash tools/gen-image.sh "a minimal flat illustration of teamwork, no text" assets/stock/stock-teamwork.png 1:1
#
# APIキーはコマンドに直書きしない（.claude/rules/no-hardcoded-keys.md 準拠）。
# 1. 環境変数 GEMINI_API_KEY を優先
# 2. 無ければ `zsh -ic 'echo $GEMINI_API_KEY'` でユーザーのシェル設定から取得

set -euo pipefail

PROMPT="${1:-}"
OUTPUT="${2:-}"
ASPECT="${3:-1:1}"
MODEL="gemini-2.5-flash-image"

if [ -z "$PROMPT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: bash tools/gen-image.sh \"<prompt>\" <output.png> [aspect_ratio]" >&2
  exit 1
fi

# --- APIキー取得 ---
KEY="${GEMINI_API_KEY:-}"
if [ -z "$KEY" ]; then
  KEY="$(zsh -ic 'echo $GEMINI_API_KEY' 2>/dev/null | tail -1)"
fi
if [ -z "$KEY" ]; then
  echo "Error: GEMINI_API_KEY が取得できませんでした（env / zsh設定を確認してください）" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"

TMP_REQ="$(mktemp)"
TMP_RES="$(mktemp)"
trap 'rm -f "$TMP_REQ" "$TMP_RES"' EXIT

python3 - "$PROMPT" "$ASPECT" > "$TMP_REQ" <<'PYEOF'
import json, sys
prompt, aspect = sys.argv[1], sys.argv[2]
body = {
    "contents": [
        {"parts": [{"text": prompt}]}
    ],
    "generationConfig": {
        "responseModalities": ["IMAGE"],
        "imageConfig": {"aspectRatio": aspect}
    }
}
print(json.dumps(body))
PYEOF

HTTP_CODE=$(curl -s -o "$TMP_RES" -w "%{http_code}" \
  "https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent" \
  -H "x-goog-api-key: ${KEY}" \
  -H "Content-Type: application/json" \
  -d @"$TMP_REQ")

if [ "$HTTP_CODE" != "200" ]; then
  echo "Error: Gemini API returned HTTP $HTTP_CODE" >&2
  cat "$TMP_RES" >&2
  exit 1
fi

python3 - "$TMP_RES" "$OUTPUT" <<'PYEOF'
import json, sys, base64

res_path, out_path = sys.argv[1], sys.argv[2]
with open(res_path) as f:
    data = json.load(f)

if "error" in data:
    print(f"API error: {data['error']}", file=sys.stderr)
    sys.exit(1)

b64 = None
for cand in data.get("candidates", []):
    for part in cand.get("content", {}).get("parts", []):
        inline = part.get("inlineData") or part.get("inline_data")
        if inline and inline.get("data"):
            b64 = inline["data"]
            break
    if b64:
        break

if not b64:
    print("Error: no inlineData image found in response", file=sys.stderr)
    print(json.dumps(data)[:2000], file=sys.stderr)
    sys.exit(1)

with open(out_path, "wb") as f:
    f.write(base64.b64decode(b64))

print(f"Saved: {out_path}")
PYEOF
