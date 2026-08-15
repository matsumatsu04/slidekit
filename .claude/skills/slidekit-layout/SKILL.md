---
name: slidekit-layout
description: >-
  スライド1枚の「コンテンツエリアの構図（要素の配置・カラム構造）」だけを、色やフォントを含まない再利用可能な
  構図パターン SLIDE-PATTERN-{name} として定義・抽出するスキル。スライド画像のキャプチャから構図を読み取って
  パターン化したり、ゼロから新しい構図を設計したりできる。色や文言は一切扱わず「構図」だけを対象にする。
  あわせて構図確認用のグレースケールHTMLも出力し、lint と build-manifest でローカルの一覧（manifest/INDEX）に反映する。
  希望があれば公開ギャラリーへの提案（fork＋Pull Request）まで行う。
  「構図パターンを作って」「このスライドの構図を抽出して」「レイアウトパターンを追加して」「SLIDE-PATTERN を作って」
  「このパターンをギャラリーに提案して」と言われたら発動する。見た目（色・フォント）の定義は slidekit-design、
  設計書の組み立ては slidekit-assemble の担当。
---

# slidekit-layout — 構図パターン抽出・定義

## このスキルは何をするか

1 枚のスライドの **構図（コンテンツエリアの要素の置き方）だけ**を、再利用可能なパターンとして
`patterns/SLIDE-PATTERN-{name}/` に書き出す。色・フォント・実コンテンツ、タイトル枠・ページ番号・装飾は
**一切含めない**（それらは DESIGN／DECK の役割）。あわせて、構図が分かる **グレースケールの確認用HTML**を生成する。

成果物（1 パターン ＝ 1 ディレクトリ・中身はこの2ファイルだけ）。
- `patterns/SLIDE-PATTERN-{name}/SLIDE-PATTERN-{name}.md`（構図定義。冒頭にフロントマター）
- `patterns/SLIDE-PATTERN-{name}/SLIDE-PATTERN-{name}.html`（グレースケール確認用・960×540）

形式の正は常に `SPEC.md` の「2. SLIDE-PATTERN-{name}.md」セクション。**着手前に必ず `SPEC.md` と既存パターン数件を読む**
（既存ライブラリと体裁・粒度を揃えるため）。

> なぜ色を持たないのか：構図とデザインを分離することで、1 つの構図を「どんなデザインテーマとも」
> 組み合わせて再利用できる。これが SlideKit の核。

## 大前提（着手前に必ず読む）

| 決まり | 具体的には |
|---|---|
| **新規フォルダとして作る** | `patterns/SLIDE-PATTERN-{name}/` を新しく作る。既存パターンのフォルダを上書き・改変しない（直したい既存パターンがある場合は、それは別作業として利用者に確認する） |
| **manifest / INDEX は手で触らない** | `patterns/manifest.json` と `patterns/SLIDE-PATTERN-INDEX.md` は **`node tools/build-manifest.mjs` の生成物**。手で追記・編集しない（CIが機械的に検出して失敗させる） |
| **IDは自分で振らない** | 新規パターンのフロントマターは必ず `id: pending`。IDは公開ギャラリーへのマージ時に自動採番される（`P150` のような番号を自分で決めない） |
| **作ったその場で使える** | `build-manifest` を通せば、pending のままでも自分の `slidekit-assemble`・ローカルギャラリーで即使える。ギャラリーへの提案（Step 6）は「共有」のための任意手順で、「利用」の条件ではない |
| **公開ライブラリの前提** | 提案するパターンは MIT License で公開される。実案件の文言・社名・人名・画像は入れない（ダミー文言のみ） |

## 2つのモード

### A. 抽出モード（キャプチャから）
ユーザーが「この構図いいな」というスライド画像を渡してくる場合。
1. 画像から **要素の配置だけ**を読み取る（見出しの位置、本文ブロック、図の位置、カラム数、余白配分）。
2. 構造として言語化する（色・文字内容は無視する）。

### B. 設計モード（ゼロから）
「2カラム比較の構図がほしい」など、目的から新規に設計する。

## 手順

### 1. 入力と category を確認する
画像があれば抽出モード、なければ設計モード。`category` を 14 種から決める：
`表紙 / セクション / 目次 / 本文 / リスト / ステップ / 図解・ダイアグラム /
カード / グラフ / テーブル / KPI / まとめ / FAQ / プロフィール`。
- 既存に似たパターンがないか `patterns/SLIDE-PATTERN-INDEX.md` を確認し、重複を避ける（似たものがあれば「既存の◯◯で足りるか」を先に利用者に確認する）。
- `name` は内容が分かる kebab-case（英小文字・数字・ハイフンのみ。例: `left-note-right-figure`）。既存と命名トーンを揃える。
- 同名フォルダが無いことを確認する: `ls patterns/ | grep -x "SLIDE-PATTERN-{name}"`（何も出なければOK。出たら別名にする。**既存を上書きしない**）。

### 2. SLIDE-PATTERN-{name}.md を書く（フロントマター付き）
`SPEC.md` の形式（既存ライブラリと同じ）で書く。**ファイル冒頭に次のフロントマターを必ず付ける**（`---` の行で挟む）。

```yaml
---
name: left-note-right-figure     # フォルダ名 SLIDE-PATTERN-{name} の {name} と完全一致
category: 本文                   # 14カテゴリのいずれか（上記の表記どおり）
summary: 左に補足メモ、右に図版枠を置く2カラム構図。   # 1〜2文。INDEXの「概要」列＝manifestのsummary
scenes: 報告書の現状説明、調査結果の提示              # INDEXの「適したシーン」列
tier: high                       # high | mid | low（下の判断表で決める）
id: pending                      # 新規は必ず pending（自分で番号を振らない）
---
# SLIDE-PATTERN-left-note-right-figure
（以下、従来どおりの本文）
```

| キー | 何を書くか | 注意 |
|---|---|---|
| `name` | フォルダ名の `{name}` 部分 | 1文字でも違うと lint で落ちる |
| `category` | 14カテゴリのいずれか | 表記ゆれ禁止（「図解」ではなく「図解・ダイアグラム」） |
| `summary` | 構図の1〜2文説明 | Overview の「概要」と同じ内容。ギャラリーのカードにも出る |
| `scenes` | 使いどころ | Overview の「適したシーン」と同じ内容 |
| `tier` | 再現性 `high` / `mid` / `low` | 下の判断表 |
| `id` | `pending` 固定 | 既存パターンの確定ID（`P133` 等）は触らない。新規に番号を書かない |

- 各値は**1行**で書く。値の中に半角の「`: `」（コロン＋空白）や `#` を入れない（読点や全角「：」を使う。どうしても必要なら値全体を `"..."` で囲む）。
  上の例の `# …` は説明用のコメントなので、実ファイルには書かなくてよい（6行のキーと値だけでよい）。

**tier の判断表**（迷ったら厳しめ＝`mid`）:

| tier | 目安 | 例 |
|---|---|---|
| `high` | 矩形・線・円・テキストだけ／要素は規則的な並び（1〜3列・6項目以内）／項目数が変わっても崩れない | カード3枚、2カラム比較、箇条書き、KPI3つ、2トーン表紙 |
| `mid` | 規則的だが要素が多い（7要素以上・2段構成）／表＋注釈／簡単なSVGグラフ／位置合わせが必要な線 | 6カードグリッド、横タイムライン、比較表、棒グラフ、ガント帯 |
| `low` | 円環図・ハブスポーク・ドーナツ図・組織図など、要素同士の座標が互いに依存する多要素図解 | 円環フロー、放射状図、3階層以上の組織図 |

本文（フロントマターの直後）:
- 前書き：「コンテンツエリアのレイアウト定義であり、タイトル枠・ページ番号・装飾は DESIGN 側で定義する」旨。
- `## Overview`：パターン名 / 概要 / 適したシーン
- `## Structure（構造）`：カラム数・行・要素配置を YAML 風に（色・実値は書かない）
- `## Elements（各要素の役割）`：要素 / 配置 / 役割の表
- `## Usage Guide（AIへの使い方）`：プロンプト例と注意点
- 見出しは `## Overview` `## Structure` `## Elements` `## Usage Guide` の4つを必ず含める（lint が見る）。

### 3. グレースケール確認HTMLを作る
構図が一目で分かるよう、**グレー階調だけ**の 960×540 スライドHTMLを作る（既存パターンの `.html` を1つコピーして骨格・共通見出しCSSをそのまま使う）。
- 各エリアに役割ラベル（ダミー文言）を入れる。実案件の文言・社名・人名は入れない。
- 色は使わない。使ってよいのは **グレー階調**（#fff / #eee / #ccc / #999 / #333 など r=g=b の値）と
  **`var(--sk-accent, 灰)` / `var(--sk-soft, 灰)` / `var(--sk-accent2, var(--sk-accent, 灰))`**（パレット連動用の変数）だけ。
  濃淡は `color-mix(in srgb, var(--sk-accent), #FFF 70%)` の形で作る。**有彩色の hex / rgb / hsl / 色名は書かない**（lint で落ちる）。
- **`<script>`・`onclick=` 等の `on*` 属性・`javascript:`・`<iframe>`/`<object>`/`<embed>` は使わない**（公開ギャラリーが iframe で描画するため。動きは付けない）。
- アイコンは Font Awesome Solid（`<i class="fa-solid fa-...">`）。**絵文字・記号（●▶✔ 等）でアイコンを代用しない**。
- 画像・フォント等の**素材ファイルを追加しない**（`assets/` に既にあるものだけ参照可）。フォルダの中は `.html` と `.md` の2ファイルだけにする（スクショや下書きを置かない）。

### 4. lint を通し、生成物に反映する（必須・旧「INDEX と manifest を更新する」の置き換え）
manifest.json / INDEX.md は**手で書かず**、次の2コマンドで機械的に反映する（Node.js 18以上）。

```bash
node tools/lint-pattern.mjs {name}      # ①規約チェック。違反があれば理由が表示される
node tools/build-manifest.mjs           # ②manifest.json / INDEX.md を再生成（自分のパターンは pending として末尾に入る）
```

- ①で違反が出たら、**該当箇所を直して同じコマンドを再実行**する。違反ゼロ（終了コード0）になるまで②へ進まない。
- ②のあと `patterns/manifest.json` の末尾に `"id": "pending"` で自分のパターンが入り、INDEX の該当カテゴリにも行が追加される。
  これで自分の `slidekit-assemble` とローカルギャラリーから即使える（**IDは pending のままでよい。自分で番号を振らない**）。
- ②が生成した manifest.json / INDEX.md の差分は**そのまま残す**（手で整えない）。
- Node.js が無い／古い（`node -v` が v18 未満）場合: パターンのファイル自体は作れるが一覧には載らない。
  「Node.js 18以上を導入すると `node tools/build-manifest.mjs` で一覧に反映できます」と案内し、**代わりに manifest を手書きしない**。

### 5. 実寸で確認し、出力を伝える
- 実寸（960×540）で1回スクリーンショットを撮り、自分で目視する（はみ出し・重なり・線の端点・上下中央）。macOSの例:
  ```bash
  mkdir -p output/pattern-check
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars \
    --window-size=960,540 --screenshot="$PWD/output/pattern-check/{name}.png" \
    "file://$PWD/patterns/SLIDE-PATTERN-{name}/SLIDE-PATTERN-{name}.html"
  ```
  （Chrome が無い環境では `.html` をブラウザで開き、100%表示で目視する。スクショは**パターンフォルダの中に保存しない**）
- 利用者に .md / .html のパスを伝え、ローカルギャラリーでの見え方も案内する（利用者が別ターミナルで実行。AIが常駐させる必要はない）:
  `python3 -m http.server 8930`（リポジトリ直下で実行）→ `http://localhost:8930/gallery/view.html?p={name}&pal=navy`
- 続けて Step 6 の質問を1回だけする。

### 6. ギャラリーに提案する（任意）
利用者に**1問だけ**聞く（Step 5 の直後。作業の途中では聞かない）:

> 「このパターンをギャラリー（誰でも使える公開ライブラリ）に提案しますか？」

- **いいえ**／返事なし → ここで終了。「手元ではこのまま使えます。あとから提案したくなったら『このパターンをギャラリーに提案して』と言ってください」と添える。
- **はい** → 次の順に進める。

**6-1. 提出前チェック**（全部 ✅ になるまで提出しない。1つでも ✕ なら直してから）

| # | 確認 | ✕ のときの対処 |
|---|---|---|
| 1 | 自作の構図か（他者のスライドHTMLの丸写しではないか） | 提出しない。利用者に確認 |
| 2 | 実案件の文言・社名・人名・画像が入っていない（ダミー文言だけ） | ダミー文言に差し替えて lint からやり直す |
| 3 | 素材ファイル（画像・フォント等）を追加していない | 参照を既存 `assets/` のものにするか、素材なしの構図にする |
| 4 | `<script>`・`on*=`・`<iframe>` が無い | 取り除く（動きは付けない） |
| 5 | `id: pending` のまま／manifest.json・INDEX.md を手で触っていない | `id` を pending に戻す。手編集していたら `git checkout patterns/manifest.json patterns/SLIDE-PATTERN-INDEX.md` → `node tools/build-manifest.mjs` |
| 6 | 利用者が「MIT License で公開されること」に同意している | 一言確認する（同意が無ければ提出しない） |

**6-2. 前提の確認**（GitHub CLI が必要。初回だけ）

```bash
gh --version      # 表示されればOK。無ければ導入: macOS は brew install gh／それ以外は https://cli.github.com/
gh auth status    # 「Logged in to github.com」が出ればOK
```

- `gh` が無い／未ログインの場合は、利用者に **`gh auth login` をターミナルで実行してもらう**（ブラウザ認証が要るのでAIは代行できない）。
  案内文: 「提案には GitHub CLI（gh）と GitHub アカウントが必要です。`brew install gh` のあと `gh auth login` を一度だけ実行してください。終わったら教えてください」→ 終わったら 6-3 へ。
- どうしても用意できない場合は「今回は提案せず、手元で使う」に切り替える（パターン自体は完成している）。

**6-3. 提出**

```bash
bash tools/propose-pattern.sh {name}
```

- スクリプトが lint → fork の用意 → パターンフォルダだけをコピー → `pattern/{name}` ブランチ → push → Pull Request 作成まで行い、**PR の URL** を表示する。
- URL を利用者にそのまま伝え、次の案内を添える:
  > 「提案（PR）を出しました: {URL}
  > 承認されるとギャラリーに反映され、次回『スライドを作って』の更新確認で手元にも届きます（IDはその時に確定します）。
  > 差戻しコメントが付いた場合は、同じフォルダを直して `bash tools/propose-pattern.sh {name}` をもう一度実行してください（同じ PR に追加されます）」
- スクリプトがエラーで止まった場合: 表示されたメッセージを利用者に見せ、原因が lint 違反なら直して再実行、gh の認証なら 6-2 へ戻る。**手で git 操作を組み立てて代行しない**（同じコマンドの再実行で足りる）。

**6-4. 差戻し対応**（後日「PRにコメントが付いた」と言われたとき）
1. 指摘どおり `patterns/SLIDE-PATTERN-{name}/` の中だけを直す（他のファイルは触らない）
2. `node tools/lint-pattern.mjs {name}` → `node tools/build-manifest.mjs`
3. `bash tools/propose-pattern.sh {name}`（同名ブランチに追加 push され、同じ PR が更新される）

### 作業例（「このパターンをギャラリーに提案して」と言われたとき・最初から最後まで）
1. 対象パターン名を確認する（言われていなければ「どのパターンですか？」。直前に作ったものなら確認だけ）
2. `ls patterns/SLIDE-PATTERN-{name}/` で `.md` と `.html` の2ファイルだけがあること、`.md` 冒頭の `id: pending` を確認
3. Step 6-1 の表を上から順に確認し、結果を利用者に短く報告（例: 「6項目すべて問題なし。MITでの公開に同意いただけますか？」）
4. `gh auth status` を実行。未ログインなら 6-2 の案内文を出して待つ
5. `bash tools/propose-pattern.sh {name}` を実行し、出力の PR URL を控える
6. 利用者に URL ＋ 6-3 の案内文を伝えて終了（PR のマージ待ちを自分で監視しない）

## 完了基準（Definition of Done）
- `SLIDE-PATTERN-{name}.md` が冒頭にフロントマター（name/category/summary/scenes/tier/id）を持ち、`SPEC.md` の全セクション（Overview/Structure/Elements/Usage Guide）を満たす。
- 色・フォント・実コンテンツ、タイトル枠・ページ番号が混入していない。
- グレースケール `.html` で構図が再現できている（`<script>` なし・絵文字なし・有彩色なし）。
- `node tools/lint-pattern.mjs {name}` が違反ゼロで通り、`node tools/build-manifest.mjs` を実行済み（manifest/INDEX に pending として載っている）。
- 提案した場合は PR の URL を利用者に伝えている。

## 自己検証
出力前に確認し、結果は**ユーザーへの最終報告に記載**する（成果物ファイル本体には書かない）。
1. 色・フォント・実コンテンツ・タイトル枠が入っていないか（コンテンツエリアの構図だけか）
2. `Overview / Structure / Elements / Usage Guide` が揃っているか。フロントマターの `name` がフォルダ名と一致しているか
3. category が 14 種のいずれかか（表記どおりか）
4. **`node tools/lint-pattern.mjs {name}` を通したか**（違反ゼロ）
5. **`node tools/build-manifest.mjs` を実行したか**（manifest.json / INDEX.md に自分のパターンが pending で載っているか）
6. **`id: pending` のままか**（自分で番号を振っていないか）
7. **manifest.json / INDEX.md を手で編集していないか**（`git diff patterns/manifest.json` の差分が build-manifest の出力だけか）
8. 既存ライブラリと命名・粒度・体裁が揃っているか
9. **接続線・罫線の端点ルール（SPEC「接続線・罫線の端点」）を守っているか**：
   幹線は最初/最後の接続点の中心で止める（全高に伸ばさない）／線と要素の間に隙間を作らない／
   白カバーで線を消さない／濃色の塗り面に#333系の文字を載せない。
   **確認は必ず実寸レンダリング（スクリーンショット）で行い、線の端点・接合部を目視すること**
10. **本文エリアの縦配置ルール（SPEC「本文エリアの縦配置」）に耐える構造か**：
   本文ブロックは可能な限り `top:{開始位置}px; bottom:{下余白}px` の絶対配置＋flex縦センタリングで書き、
   利用時に項目数が増減しても上下余白が均等に保たれる形にする（`top`＋`height` 固定で上に張り付けない）
11. 提案した場合: 6-1 の提出前チェック6項目がすべて ✅ で、PR URL を伝えたか

## やりがちな誤り（実例つき・提出前に見直す）

| やりがちな誤り | なぜダメか | 正しくは |
|---|---|---|
| `id: P150` のように**IDを自分で振る** | 同時に複数の提案があると衝突する。IDはマージ時にしか確定しない | 新規は `id: pending`。採番は自動 |
| **manifest.json に手で1行足す**／INDEX.md に行を書き足す | 生成物なので次の再生成で消える上、CIの整合チェックで落ちる | `node tools/build-manifest.mjs` だけで反映する |
| 「株式会社◯◯ 御中」「◯◯様 ご提案書」など**実案件の文言・社名・人名がタイトルに残る** | 公開ライブラリに載る（MIT） | 「メインタイトルが入ります」「会社名が入ります」等のダミー文言 |
| **絵文字**（✅ 🔍 ▶ 等）をアイコン代わりに使う | 環境でグリフが変わり、フォントによっては崩れる | Font Awesome Solid（`<i class="fa-solid fa-check">`） |
| `#2f62a6` `rgb(47,98,166)` `blue` など**有彩色を直書き**する | パレット切替に追従せず、色が固定される | `var(--sk-accent, #4A4A4A)` 等の変数＋グレー階調のみ |
| **`<script>` で動き**をつける／`onclick=` を書く | 公開ギャラリーが iframe で描画するため禁止（lintで落ちる） | 静的なHTML/CSSだけで構図を表現する |
| 既存パターンのフォルダを**上書き**して「改良版」にする | 既存IDの意味が変わり、他の人のデッキが壊れる | 別名で新規フォルダを作る（既存の修正は別作業として相談） |
| フォルダにスクショ・下書き・画像を**一緒に置く** | 中身は `.html` と `.md` の2ファイルだけ（lint で落ちる） | スクショは `output/` 等の外に置く |
| 提案の途中で **git 操作を手組み**する（`git push` を直接叩く等） | ブランチ名・fork・PR本文の規約から外れる | 常に `bash tools/propose-pattern.sh {name}` を再実行する |

## やってはいけないこと
- 色・フォントを定義しない（→ `slidekit-design`）。
- 実際のプレゼン文言・タイトル枠・ページ番号を入れない（→ DESIGN／`slidekit-assemble`）。
- lint と build-manifest を飛ばさない（飛ばすとギャラリーや assemble から見えず、提案もできない）。
- manifest.json / INDEX.md を手で編集しない。IDを自分で振らない。
- 提案の質問（Step 6）を、利用者が答える前に勝手に「はい」扱いして提出しない。
