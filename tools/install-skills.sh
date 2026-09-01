#!/usr/bin/env bash
# tools/install-skills.sh — SlideKitのスキルを「どの作業フォルダでも使える」状態にする
#
#   bash tools/install-skills.sh            入れる／更新する
#   bash tools/install-skills.sh --uninstall 取り外す
#
# 何をするか:
#   ~/.claude/skills/slidekit-{assemble,design,layout}/SKILL.md に
#   「本体はこのリポジトリにある」とだけ書いた薄い入口を置く。
#   ~/.claude/skills/ は全フォルダ共通なので、普段使っているどのフォルダで
#   Claude Codeを開いても「スライドを作って」が効くようになる。
#
# なぜ薄い入口か:
#   スキル本体をコピーすると、git pull しても古いコピーが使われ続ける
#   （~/.claude/skills は同名ならプロジェクト側より優先されるため）。
#   入口だけを置き、手順・パターン・仕様は毎回このリポジトリから読ませる。
#
# macOS 標準の bash 3.2 で動く。Windows は Git Bash で動く。
set -u

REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/.claude/skills"
SKILLS="slidekit-assemble slidekit-design slidekit-layout"

# ホーム配下なら ~ 表記にする（案内文が読みやすい）
short_repo() {
  case "$REPO" in
    "$HOME"/*) printf '~%s' "${REPO#$HOME}" ;;
    *) printf '%s' "$REPO" ;;
  esac
}
REPO_SHORT="$(short_repo)"

if [ "${1:-}" = "--uninstall" ]; then
  for s in $SKILLS; do
    if [ -e "$DEST/$s" ]; then rm -rf "$DEST/$s"; echo "  取り外した: $DEST/$s"; fi
  done
  echo "完了: どのフォルダでも使える状態を解除しました（リポジトリ内で開けば従来どおり使えます）"
  exit 0
fi

if [ ! -f "$REPO/.claude/skills/slidekit-assemble/SKILL.md" ]; then
  echo "Error: SlideKitのスキル本体が見つかりません: $REPO/.claude/skills/" >&2
  exit 1
fi

mkdir -p "$DEST" || { echo "Error: $DEST を作れません" >&2; exit 1; }

# 各スキルの description（本体のフロントマターから転記。トリガー文言を揃えるため）
desc_of() {
  awk '/^---$/{n++; next} n==1 && /^description:/{f=1; print; next} n==1 && f && /^  /{print; next} n==1 && f{exit}' \
    "$REPO/.claude/skills/$1/SKILL.md"
}

write_entry() {
  s="$1"
  mkdir -p "$DEST/$s"
  {
    echo "---"
    echo "name: $s"
    desc_of "$s"
    echo "---"
    echo
    echo "# $s — 入口（どの作業フォルダでも使える）"
    echo
    echo "このファイルは薄い入口です。**手順・仕様・構図パターンの正本は SlideKit リポジトリにあります。**"
    echo "\`tools/install-skills.sh\` が生成しています。**手で編集しないでください**（再実行で上書きされます）。"
    echo
    echo "## 着手時に必ず読む"
    echo
    echo "1. \`$REPO/.claude/skills/$s/SKILL.md\` … **正本ワークフロー（手順はすべてここ）**"
    if [ "$s" = "slidekit-assemble" ]; then
      echo "2. \`$REPO/docs/html-deck-generation.md\` … HTMLデッキ生成の標準手順"
      echo "3. \`$REPO/SPEC.md\` … 共通ルール"
      echo "4. \`$REPO/patterns/manifest.json\` … 構図パターン索引（**tier=high を優先**）"
      echo "5. \`$REPO/design-systems/\` … デザインテーマ"
    else
      echo "2. \`$REPO/SPEC.md\` … 共通ルール"
    fi
    echo
    echo "## このPCでの決まり（正本の記述より優先する）"
    echo
    echo "### 1. リポジトリの場所は \`$REPO_SHORT\`"
    echo
    echo "正本SKILLに出てくる相対パス（\`tools/\` \`patterns/\` \`docs/\` \`design-systems/\` \`assets/\` \`SPEC.md\`）は、"
    echo "すべて先頭に \`$REPO_SHORT/\` を付けて読む。"
    echo
    echo "### 2. コマンドは絶対パスで実行する"
    echo
    echo "作業フォルダがどこでも動くように、次の形で叩く（\`cd\` しない）。"
    echo
    echo '```bash'
    if [ "$s" = "slidekit-assemble" ]; then
      echo "bash $REPO_SHORT/tools/check-update.sh                              # 更新確認（Step 0）"
      echo "node $REPO_SHORT/tools/html-deck/build-html-deck.mjs <デッキフォルダ>   # ビルド"
      echo "bash $REPO_SHORT/tools/html-deck/export-pdf.sh <デッキフォルダ>        # PDF＋QA画像"
    else
      echo "node $REPO_SHORT/tools/build-manifest.mjs      # 一覧の再生成"
      echo "node $REPO_SHORT/tools/lint-pattern.mjs        # 構図パターンの検査"
    fi
    echo '```'
    echo
    echo "### 3. 成果物は「今の作業フォルダ」に作る"
    echo
    echo "**\`$REPO_SHORT\` の中には作らない。**（リポジトリを汚すと \`git pull\` で更新を受け取れなくなる）"
    echo
    if [ "$s" = "slidekit-assemble" ]; then
      echo "- 既定の置き場所: 作業フォルダ直下の \`slides/<デッキ名>/\`"
      echo "- ユーザーが置き場所を指定したときはそちらに従う"
      echo "- 案件フォルダで作業している場合は、その案件フォルダの中に作る"
      echo
      echo "### 4. 自分のロゴ・画像を使うとき"
      echo
      echo "素材は \`assets/<ファイル名>\` の形で参照する（絶対パスを書かない）。"
      echo "実体の置き場所は \`~/.slidekit/config.json\` の \`assetsDir\`／\`~/slidekit-assets\` などから自動で解決される。"
      echo "詳細は正本SKILLの「5-3. 自分の画像（ロゴ・写真）を使うとき」。"
    else
      echo "- 新しい構図パターン・デザインテーマだけは例外で、リポジトリ内の \`patterns/\` \`design-systems/\` に作る"
      echo "  （そのために作るものなので。作ったら \`build-manifest.mjs\` で一覧に反映する）"
    fi
    echo
    echo "### $([ "$s" = "slidekit-assemble" ] && echo 5 || echo 4). リポジトリ内のファイルは編集しない"
    echo
    echo "\`$REPO_SHORT\` は \`git pull\` で更新される。中のファイルを直すと更新が止まる。"
    echo "直したいところがあれば、リクエストフォーム（https://slide.macminol.com/request.html）から送る。"
  } > "$DEST/$s/SKILL.md"
  echo "  置いた: $DEST/$s/SKILL.md"
}

echo "▶ SlideKitのスキルを、どの作業フォルダでも使えるようにします"
echo "  本体: $REPO"
for s in $SKILLS; do write_entry "$s"; done

echo
echo "完了。普段使っているフォルダのままで「スライドを作って」と話しかけてください。"
echo "（作ったスライドは、そのときの作業フォルダの slides/ に入ります）"
echo "取り外すとき: bash $REPO_SHORT/tools/install-skills.sh --uninstall"
