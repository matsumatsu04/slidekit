---
name: slidekit-assemble
description: >-
  プレゼンの目的・対象・枚数と内容をヒアリングし、用意済みのデザインテーマ（SLIDEKIT-DESIGN.md）と
  構図パターンライブラリ（patterns/SLIDE-PATTERN-*）を組み合わせて、スライド構成案を提示・承認の上、
  HTMLデッキ（index.html＋PDF書き出し）を生成するスキル。デザインは構図パターンHTML＋テーマ変数注入で
  確定するためピクセルズレ・生成コストがない。「スライドを作って」「スライドジェネレーター」「設計書を作って」
  「プレゼンを組み立てて」「SLIDEKIT-DECK を作って」「スライドの構成案を出して」と言われたら発動する。
  デザインテーマ単体の生成は slidekit-design、構図パターン単体の定義は slidekit-layout の担当。
---

# slidekit-assemble — HTMLデッキ生成

## このスキルは何をするか

プレゼンのブリーフ（目的・対象・枚数）と内容を受け取り、デザインテーマと構図パターンを組み合わせて
**HTMLデッキ（`index.html`＋`deck.pdf`）** を生成する。スライド1枚＝構図パターンHTML準拠のフラグメントで、
テーマ色はCSS変数注入で確定する（画像生成なし・ピクセルズレなし・デザインのブレなし）。
設計書 `SLIDEKIT-DECK.md`（人間レビュー用サマリー）も併せて出力する。

成果物の**出力先は「いま開いている作業フォルダ」**。案件フォルダで作業しているならその中、
指定が無ければ作業フォルダ直下の `slides/<デッキ名>/`。**SlideKitリポジトリの中には作らない**
（リポジトリを汚すと `git pull` で更新を受け取れなくなる。入口スキルに置き場所の指定があればそれに従う）。
- `{デッキフォルダ}/slides/*.html`（フラグメント）＋ `deck-config.json`
- `{デッキフォルダ}/index.html`（ビルド結果・画面表示用）＋ `deck.pdf`（納品用）
- `SLIDEKIT-DECK.md`（構成サマリー）

形式の正は常に `SPEC.md` と **`docs/html-deck-generation.md`**。**着手前に必ず両方読む。**

> 3 スキルの締めくくり。`slidekit-design`（見た目）と `slidekit-layout`（構図）の成果物を、
> ここで「実コンテンツ」と結合して完成形にする。

## 手順

### 0. 更新確認（数秒・止まらない）
ヒアリングの前に、パターンライブラリが最新かを確認する。**この手順で作業を止めない**（失敗しても Step 1 へ進む）。

```bash
bash tools/check-update.sh
```

| 出力の内容（**文言で判断する。終了コードでは判断しない**） | やること |
|---|---|
| 「最新です」相当 | 出力を1行で伝えて Step 1 へ |
| 遅れがある（更新の案内・新しいパターン件数などが表示される） | 出力を**そのまま**伝え、「更新しますか？」と1問。**はい** → `bash tools/check-update.sh --apply` を実行し結果を伝えて Step 1 へ／**いいえ** → そのまま Step 1 へ |
| エラーメッセージのみ／何も出ない（git管理外・オフライン・スクリプト無し等） | 何も聞かず、無視して Step 1 へ（「更新確認はスキップしました」と一言だけ添えてよい） |

- `--apply` は `git pull --ff-only` 相当＋一覧の再生成をまとめて行う。ローカルで作った pending パターンがあっても退避して衝突を避ける（スクリプト側で処理する。**手で `git pull` や `git stash` を組み立てない**）。
- 更新確認は1セッションに1回でよい。同じセッションで2回目の「スライドを作って」が来たら省略してよい。

### 1. ブリーフをヒアリングする（5問）
順に質問する。すでに分かっている項目は飛ばす。
1. **title:** このプレゼンのタイトルは？
2. **audience:** 誰に向けたもの？（社内/顧客/セミナー参加者/一般 など）
3. **purpose:** 目的は？（提案・報告・教育・集客 など）
4. **slide-count:** おおよそ何枚？（指定なければ内容から提案）
5. **tone:** どんな雰囲気で？（落ち着いた/熱量高め/カジュアル など。指定なければ purpose から提案）

> `tone` は SPEC の Brief 必須項目。聞き漏らさない（不明なら推定せず確認 or 既定を提案する）。

### 2. 内容を受け取る
プレゼンの中身を受け取る。アウトライン・箇条書き・文章・Markdown・PDF など形式は問わない。
内容が薄い場合は、要点を 2〜3 問だけ補う。

### 3. デザインテーマを選ぶ
`design-systems/` にある `SLIDEKIT-DESIGN.md` を一覧で提示し、1 つ選んでもらう。
（どれが合うかは各 `sample.html` で確認できることを伝える。）

> **フォールバック：** `design-systems/` が空、または合うものがない場合は、
> 先に `slidekit-design` でデザインテーマを 1 つ作るよう案内する（ここで止めて誘導する）。

### 4. スライド構成案を提示する（承認ゲート）
内容と枚数から、スライドごとの「種類」を並べた構成案を提示する。
```
1. [表紙]      タイトル・対象・日付
2. [目次]      本日の流れ
3. [セクション] 背景
4. [本文]      現状と課題
...
N. [締め]      まとめと次の一歩
```
**ここで必ずユーザーの承認を取る**（「○枚目を入れ替え」「△は不要」等の修正を受ける）。

### 5. 構図パターンを割り当てる（承認ゲート）
各スライドに `patterns/` の構図パターンを割り当て、表で提示する。
**パターンは必ず `patterns/SLIDE-PATTERN-INDEX.md`（または `patterns/manifest.json`）から実在するものを選ぶ**
（名前を創作しない。INDEX/manifest の全パターン・14カテゴリ）。各スライドの内容に最も合うカテゴリ→パターンを選ぶ。

> **再現性tier（manifest.json の `tier`）を必ず考慮する**（各tierの件数は manifest.json を参照。ここには書かない）：
> - `high`: シンプルで自動生成でも崩れない。**既定はここから選ぶ**
> - `mid`: 規則的だが要素多め。内容が合うときに使う
> - `low`（円環図/ハブスポーク/ドーナツ図/組織図等の多要素図解）: 自動生成では崩れやすい。
>   **ユーザーが明示的に指定した場合のみ**使い、「複雑な構図のため生成結果が崩れる可能性がある」ことを一言添える。
>   同じ内容は high/mid の代替（例: 円環図→four-step-card-flow、ドーナツ図→three-kpi-big-number）で表現できないか先に検討する。

カテゴリと代表パターン（**代表例のみ**。全リストは `patterns/SLIDE-PATTERN-INDEX.md` / `manifest.json` が正で、
パターンが増えてもこの表は毎回更新されない。選ぶときは必ず INDEX/manifest を見る）：

| カテゴリ | 代表パターン例 |
|---|---|
| 表紙 | cover-curve-shape-left（曲面シェイプ） / cover-blob-side-left（ブロブ） / cover-geo-texture-left（幾何学×紙質感） / cover-soft-3d-left / cover-art-brush-left（いずれも画像背景表紙。assets/covers/ の素材を使用・色ティント対象外） |
| セクション | section-divider / section-minimal-center（ミニマル中央） / section-tag-progress（現在地タグナビ） / section-geo-texture-left / section-soft-3d-number-row（画像背景中扉は assets/covers/ の素材を使用・色ティント対象外） |
| 目次 | agenda-toc / toc-two-column（5項目以上の2カラム） / toc-section-cards（カード型・4章） / toc-current-highlight（章再掲・現在地） |
| 本文 | key-message-single / key-message-inverted（反転配色の山場） / two-col-text-body（左右2カラム） / value-three-pillars（MVV3段） / body-callout-box（本文＋POINT囲み） / concept-keyword-three（大キーワード3つ） / two-section-stacked-text |
| リスト | numbered-list-with-body / icon-left-text-list-detailed（アイコン＋説明つき） / numbered-row-full-width（全幅の番号行） / column-stacked-tag-list / checklist-two-column（チェックリスト） |
| ステップ | four-step-card-flow / three-stage-circle-flow / horizontal-timeline-cards / vertical-step-flow / milestone-timeline / history-year-list（沿革） |
| 図解・ダイアグラム | two-column-split-boxes / venn-diagram-three-circle（3円の重なり） / ok-ng-comparison（NG×OK対比） / flow-branch-two-outcomes（条件分岐） / business-model-three-party（3者商流） |
| カード | four-card-2x2 / three-column-icon-card / six-card-2x3-grid / card-photo-caption-three（写真3枚） / target-audience-three（こんな方におすすめ） |
| グラフ | waterfall-bridge-chart / bar-actual-forecast（実績×予想） / bar-diff-bracket（2本の差） / line-trend-target（目標線つき折れ線） / donut-share-single（シェア1つ） / stacked-bar-two-composition（構成変化） / area-growth-curve（成長カーブ） |
| テーブル | before-after-two-col / comparison-matrix-table / comparison-vs-two-column（自社vs他社） / estimate-amount-table / line-item-table |
| KPI | three-kpi-big-number / goal-kgi-kpi-dashboard / kpi-donut-chart-grid（ドーナツ並べ） / stats-grid-six（数字で見る◯◯） / kpi-progress-bars（達成率バー） |
| まとめ | summary-three-points / summary-key-takeaways（持ち帰り3点） / action-items-list / next-step-cta-band（まとめ＋CTA帯） / closing-blob-thanks-left / closing-curve-shape-footer / closing-art-brush-contact（画像背景の締めは assets/covers/ の素材を使用・色ティント対象外） |
| FAQ | faq-grid / faq-single-column / faq-accordion-list（4問コンパクト） |
| プロフィール | profile-bio / profile-skill-tags（1名詳細＋スキル） / profile-two-speakers（2名） / team-members-grid（4〜8名） |

割り当て表の例（**使用した構図パターン名とID（manifest.jsonの`id`）を必ず列に含める**。見出しの有無も示す。
背景画像を敷くデッキでは **「背景」列（ON/OFF）** も加える）：

| # | 種類 | ID | 構図パターン（SLIDE-PATTERN名） | 見出し | 背景 | 内容（1行） |
|---|---|---|---|---|---|---|
| 1 | 表紙 | P105 | cover-curve-shape-left | なし | OFF | タイトル・対象・日付 |
| 2 | 目次 | P006 | agenda-toc | なし | ON | 本日の流れ |
| 4 | 本文 | P015 | key-message-single | あり | ON | 現状の課題 |
| … | … | … | … | … | … | … |
気に入らない割り当ては変更を受ける（「4枚目を before-after-two-col に」等）。**ここでも承認を取る。**

#### 5-2. 背景画像を1問だけ聞く
割り当て表を出すときに、あわせて次を**1問だけ**聞く（答えが無ければ**既定＝敷く**で進める。敷くと資料が垢抜けるため）。

> 「各スライドの一番下に、淡い背景画像（白〜薄いグレーの斜めの面がうっすら重なる素材）を敷きますか？
> **既定: 敷く**（表紙・全面塗り・写真背景のスライドは自動でOFF。ページごとにON/OFFできます）」

| ユーザーの答え | やること |
|---|---|
| 「はい」「お任せ」「無回答」 | `deck-config.json` に `"background": { "image": "soft-diagonal", "default": "auto" }` を書く。表の「背景」列は下の判断表どおりに埋める |
| 「表紙はいらない」「3枚目だけ外して」「中扉にも敷いて」 | 上に加えて `slides` に `{ "file": "<そのフラグメント名>", "bg": false }`（または `true`）を書き、表の「背景」列を合わせる |
| 「いらない」 | `background` を書かない（表に「背景」列も出さない） |

#### 5-0. デザインの規律 v2 を既定にする（2026-09-02・代表決定）

新規デッキは **SPEC.md「デザインの規律 v2」** に従う（根拠: `output/slidekit-quality-research-20260902/README.md`）。
1. **設計書の冒頭にデザインコンセプトを1文**で書く（例「静かな技術ガイド — 主色1色と淡いティント、人物の帯で温度を足す」）
2. `deck-config.json` に `"frame": "v2"` と `"brand": { "name": "…", "copyright": "…" }` を書く（`headingStyle` は `"b"` 既定）
3. 本文スライドは **リード1文（`.sk-msg`）を必須**にし、要所1箇所だけ `<b>` で強調する
4. **1枚に塗りは1つ**（主役だけ `--sk-accent` 塗り・最終の要素は1.5px枠線）。`--sk-accent2` は英字ラベル・装飾線だけ
5. カードの中身は「KICKER→見出し→項目／本文→例：」の型。本文は16px（小さくして詰めない。入らなければ枚数を増やす）
6. **同じレイアウトのパターンを2枚続けない**（構成表で確認する）
7. 挿絵は `assets/illust/`（統一トーン）から1デッキ2〜3枚まで（表紙の帯・締めのカード）

v2 で描き直し済みのパターン（2026-09-02 第1弾）: P042 P038 P018 P067 P058 P026 P053 P063 P112 P065 ＋新設 P165 cover-illust-band／P164 closing-solid-claim。
**第1弾のパターンを優先して選ぶ。** 未対応パターンを使うときは、パターン側の文字組み・色使いを v2 の数値に寄せて書く。

#### 5-3. 自分の画像（ロゴ・写真）を使うとき

ユーザーが「うちのロゴを入れて」「この写真を使って」と言った場合、素材は**自分用の素材フォルダ**から解決する。
`build-html-deck.mjs` は `assets/...` を次の順で探す:

1. SlideKitリポジトリ内の `assets/`（同梱素材）
2. 環境変数 `SLIDEKIT_ASSETS_DIR` のフォルダ
3. `~/.slidekit/config.json` の `"assetsDir"` に書かれたフォルダ
4. `~/slidekit-assets`（既定の個人フォルダ）
5. リポジトリの隣の `../slidekit-private`

- フラグメントには常に `<img src="assets/<ファイル名>">` の形で書く（絶対パスを書かない）
- 個人フォルダは中に `assets/` を作っても、直接ファイルを置いてもよい（どちらでも解決する）
- 素材が見つからないときはビルドが「アセットが見つかりません」と探した場所を出す。
  **フォルダを勝手に作って場所を決めず、どこに置いたかユーザーに確認する**
- 画像は data URI で `index.html` に焼き込まれるため、書き出したHTMLを人に渡しても表示される

**「背景」列の判断表（`default: "auto"` の自動判定と同じ。表に書く値＝ビルド結果になるようにする）**

| スライド | 背景 | 理由 |
|---|---|---|
| 表紙（cover-*） | OFF | 表紙は素の構図を活かす（`auto` が自動でOFF） |
| 全面塗りの中扉・キーメッセージ（ルートが `var(--sk-accent)` 等） | OFF | 塗りの上には敷かない（自動でOFF） |
| 写真背景の表紙・中扉・締め（全面 `<img>`） | OFF | 写真の下に敷いても見えない（自動でOFF） |
| 白背景の本文・目次・リスト・カード・表・KPI・まとめ・FAQ・白い中扉 | ON | ここに敷くと垢抜ける（自動でON） |
| ユーザーが個別に指定したスライド | 指定どおり | `slides[].bg` に書く（個別指定が最優先） |

> **成果物提示のルール：** ユーザーに構成・成果物を提示するときは、**必ず上記の形式の表（構図パターン名＋恒久ID の列を含む）**で示すこと。
> どのスライドにどの SLIDE-PATTERN（ID）を使ったかが一目で分かるようにする。見出しは「表紙・目次・セクション・締め以外＝あり」が既定。
> 背景画像を敷くデッキでは「背景」列（ON/OFF）を必ず含める（敷かないデッキでは列ごと省いてよい）。
> **ID（P001〜）は manifest.json の該当パターンの `id` フィールドから取得する（作らない・記憶に頼らない）。**
> IDは追加・削除があっても既存パターンの番号は変わらない恒久値。ギャラリー（gallery/index.html）のカードにも同じIDが表示されるため、
> ユーザーはID or パターン名でギャラリーと突き合わせて確認できる。
> **manifest.json の `id` が `pending` のパターン**（手元で新規に作り、まだギャラリー未承認のもの）を使った場合は、
> ID列に `pending`（承認後に確定）と書く。番号を仮に振らない。

> **フォールバック：** 内容に合うパターンが INDEX に無い場合は、近い既存パターンで代替するか、
> `slidekit-layout` で新規に作る（`node tools/build-manifest.mjs` で生成物に反映される。ID未確定＝pending のまま使ってよい）かを
> ユーザーに確認する（黙って妥協しない）。

> **情報量→レイアウト変換規則（`docs/polish-rules.md` 参照）：** パターン選定は情報量から決める。
> テキスト量が**少ない**→横並び（カード・ステップ）／**多い**→縦積みの帯行リスト／
> **比較項目が多い**→表。図解は「この情報量ならどの型か」を先に判定してから選ぶ。

> **ストーリー設計（`docs/slideland-notes.md` 参照）：** 課題スライドと解決スライドは**同一パターンの配色違い**
> （課題=グレートーン、解決=アクセント）で作ると「対応できる」が伝わる（N16）。
> 比較表は**推し列を1列だけ**目立たせる（N8）。Web制作の提案では sitemap-indent-list（サイト構成）・
> gantt-schedule-bands（工程）・price-total-highlight（見積）を活用する。

### 6. SLIDEKIT-DECK.md を生成する
承認された構成で、`SPEC.md` の形式に従って 1 ファイルを生成する。
- `Brief`（title/audience/purpose/slide-count/tone）
- `Design System`：選んだ `SLIDEKIT-DESIGN.md` の中身を**丸ごと埋め込む**
- `Slide Plan`：番号・種類・パターン（実在の SLIDE-PATTERN 名）・1行内容の表
- `Slides`：各スライドを **SPEC の「固定テンプレート」**（`### Slide {n} — {種類}（{pattern}）` ＋ `Structure:` ＋ `Content:`）で書く。
  割り当てた `patterns/SLIDE-PATTERN-{name}/SLIDE-PATTERN-{name}.md` を読み、その **Structure/Elements を要約して `Structure:` に埋め込み**、各要素を実際の文言で `Content:` に埋める。
- `Generation Instructions`：どのAIに渡すか、出力形式（PDF推奨）の指示

> **長文スロットの扱い：** パターンの推奨文字数を超える内容は、**要約して収める**か、**スライドを分割**する。
> 1スロットに詰め込んで構図を破綻させない（必要なら構成案に戻ってスライドを足す）。

### 7. HTMLデッキを生成する（既定の納品ルート）
手順の正は **`docs/html-deck-generation.md`**（必読）。要点:
1. `{デッキフォルダ}/slides/` に連番フラグメント（01-cover.html…）を書く。
   **各フラグメントは割り当てた構図パターンHTML（patterns/SLIDE-PATTERN-{name}/）の .slide 構造・CSSをコピーし、
   クラスに `s{連番}-` プレフィックスを付け、テキストだけ実文言に差し替える**（レイアウト構造・数値は変えない。ギャラリー＝正）。
   **唯一の許容アレンジ＝項目数の増減**: 実際の項目数がテンプレートと異なる場合は、本文ブロックを
   `top:76px（メッセージライン併用時128px）; bottom:0;`＋flex縦センタリングで**本文エリアの上下中央**に置き直す
   （SPEC「本文エリアの縦配置」）。上に張り付けて下だけ余らせない。`top`＋`height`固定は使わない。
   色は直書き禁止（var(--sk-accent) / var(--sk-accent2, var(--sk-accent))（差し色・1スライド1箇所まで） / var(--sk-soft) / #333333 / #8A8F98 のみ）。
   共通見出しはビルダー提供の `.sk-h` / `.sk-msg` を使う（本文はtop:128px以降）。
   背景画像スライドは `assets/covers/` 等の素材を相対参照（ビルダーが自己完結化する。
   リポジトリの隣に `../slidekit-private/` がある環境では、その中の非公開素材も同じ書き方で参照できる）。
   アイコンはFont Awesome（docs参照。絵文字・特殊文字記号での代用は禁止）。
2. `deck-config.json` にタイトル・テーマ色（選んだデザインテーマのpptx theme JSONの色を `#` 付きで）を書く。
   背景画像を敷く場合（Step 5-2 の既定）は `background` と、必要なら `slides` の上書きも書く：
   ```json
   {
     "title": "デッキ名",
     "theme": { "accent": "#1E2E53", "soft": "#E8EBF2", "text": "#333333", "muted": "#8A8F98", "bg": "#FFFFFF" },
     "font": "Noto Sans JP",
     "pageNumbers": true,
     "noPageNoOn": [1],
     "headingStyle": "a",
     "background": { "image": "soft-diagonal", "default": "auto" },
     "slides": [
       { "file": "01-cover.html", "bg": false }
     ]
   }
   ```
   - `background.image` は `assets/backgrounds/` の素材名（拡張子なし。既定は `soft-diagonal`）。
   - `default: "auto"` で「白背景=ON／表紙・全面塗り・写真背景=OFF」が自動判定される。**表の「背景」列と食い違うスライドだけ**
     `slides` に `{ "file": "<フラグメント名>", "bg": true|false }` を書く（全スライド分を書く必要はない）。
   - ビルドログに `背景: N ファイル名 → ON/OFF（理由）` が1行ずつ出るので、表の「背景」列と一致しているか見る。
     違っていたら `slides[].bg` で合わせる（フラグメントは触らない）。
   - 背景の書式・判定規則の正は `docs/html-deck-generation.md`「背景画像レイヤー」節。
3. ビルド＆PDF書き出し:
```bash
node tools/html-deck/build-html-deck.mjs <デッキフォルダ>
bash tools/html-deck/export-pdf.sh <デッキフォルダ>
```
4. **QA（1サイクル・必須）**: 生成された qa-*.jpg を視覚チェック（環境適応の表参照）。
   **qa-*.jpg が作られなかった場合**（`pdftoppm` 未導入の環境。export-pdf.sh がその旨を出力する）は、
   `index.html` をブラウザで開いてスクリーンショットで確認する（PDFは完成しているのでQAだけの問題。ここで止まらない）。
   はみ出し・重なり・語中折返し・整列ズレ・余白の偏り
   （項目数を減らしたスライドで本文が上に張り付き、下だけ空いていないか）を確認し、修正して再ビルド。
   背景画像を敷いた場合は、**白背景のスライドに淡い背景が写り、表紙・全面塗り・写真背景では出ていないこと**、
   文字が読みにくくなっていないこと、白ベタの帯・面が浮いて見えていないこと（見えたらその要素を `transparent` にするか
   そのスライドを `bg:false`）も確認する。

### 8. 納品して使い方を伝える
- 既定: **`index.html`（画面表示・そのままプレゼン可）＋ `deck.pdf`（共有・印刷用）** を渡す。
- 納品時に**ギャラリーの「スライド確認・修正依頼」ページ**（`https://slide.macminol.com/deck.html`）を必ず案内する。
  **案内には index.html の絶対パスを添え、「このパスを確認ページに貼り付けるだけで開けます（初回だけフォルダの許可・Chrome/Edge）」と一言添える**（D&Dでも可）:
  「index.html をビューアに読み込むと、スライド確認・スライド別フィードバック記入・修正プロンプトのコピー・PDF保存（ブラウザ印刷・画面編集反映）ができます。
  『✎ 編集モード』では、Googleスライドのように左サムネイルでスライドを移動しながら、文字のダブルクリック編集・
  要素のドラッグ移動・フォント／サイズ／太字／文字色／塗り／枠線の変更・画像のアップロード配置（角ハンドルでリサイズ可）ができ、
  ⌘Z（取消）⌘C→⌘V（要素複製。未選択ならスライド複製）Delete（要素削除。未選択ならスライド削除）・
  余白ドラッグの範囲選択とグループ化・サムネイルD&Dの並べ替え（ページ番号自動更新）・＋新規スライド・
  ⌘＋ホイールのズームも使えます。背景画像を敷いたデッキでは、各スライドの「背景画像: ON/OFF」ボタンで
  ページごとに背景を切り替えられます。差分は修正プロンプトに
  【文言修正】【配置調整】【書式変更】【画像追加】【要素複製】【要素削除】【背景画像】＋「スライド構成の変更」として自動で含まれます。
  出力された修正プロンプトをそのまま貼り付けてもらえれば、こちらで修正して再ビルドします
  （追加画像はプロンプト出力時に ~/Downloads/sk-img-*.png へ自動保存されるので、そこから直接反映します。添付は不要です）」。
  **修正プロンプトに【画像追加】がある場合、修正するAIは ~/Downloads/ の該当ファイルを最初に探すこと。**
  **「スライド構成の変更」がある場合は、最終構成リストどおりに slides/ を複製・削除・連番リネームで再構成すること。**
  **修正プロンプトに「【背景画像】背景画像を OFF（/ON）にする（スライドN…）」がある場合は、フラグメントは触らず
  `deck-config.json` の `slides` に `{ "file": "<そのスライドのフラグメント名>", "bg": false }`（/`true`）を追加
  （既にあれば `bg` を書き換え）→ 再ビルドで反映すること。**
  「背景画像を敷いて」と後から言われた場合も同様に `deck-config.json` に `background` を足して再ビルドする（フラグメント修正なし）。
- **文字修正はユーザーからの指示を受けてAIが即修正**する（フラグメント編集→再ビルド。ユーザーはHTMLを触らない前提）。
  「スライド確認・修正依頼」ページの「修正プロンプト」が貼られた場合はその指示（スライド番号・元ファイル名・構図パターン変更・パレット変更）に従って修正→再ビルド→再納品する。
- **編集可能形式（Google Slides）が必要な案件のみ**、代替として `tools/pptx` ルート
  （deck.json→build-pptx.mjs→Google Slides変換。docs/pptx-generation.md）を使う。PowerPointは所有していないため納品先はGoogle Slides。

## 環境適応（どのAI・どの環境でも動かすための分岐）

このスキルは Claude Code 以外（Codex CLI・他のエージェント環境）でも使う。
**特定ツールが無くても止まらず、下の表の代替に切り替えて完走すること。**

| 依存 | ある場合 | ない場合の代替 |
|---|---|---|
| Node.js（`tools/html-deck`） | フラグメント→build-html-deck.mjs（既定） | フラグメントを手動結合した単一HTMLを書く（共通CSSは docs/html-deck-generation.md からコピー） |
| Chrome（PDF書き出し） | export-pdf.sh で deck.pdf＋qa画像 | index.html をブラウザで開き印刷→PDF を案内。QAはブラウザ目視 |
| サブエージェント機構（Agent tool / spawn_agent 等） | 生成に関与していない別エージェントに視覚QAさせる | **自分でQA画像を1枚ずつ開いて客観チェック**（観点: はみ出し/重なり/語中折返し/整列ズレ/余白の偏り）。1サイクルで止める |
| Google Drive 連携（MCP等・Google Slides納品時のみ） | pptx→Google Slides変換で納品（docs/pptx-generation.md） | **.pptx をそのまま納品**し「Google Driveにアップ→開くとGoogle Slidesとして編集可」と一言案内 |
| スライド確認・修正依頼ページ（フィードバックループ） | 本番 `https://slide.macminol.com/deck.html`（またはローカル `/deck.html`）を納品時に案内 | index.html をブラウザで開いて確認し、修正指示はチャットで受ける |

- パスは正本リポジトリからの相対（`tools/html-deck/` `tools/pptx/` `docs/` `patterns/` `assets/`）で解決する。**リポジトリの場所と、コマンドを絶対パスで叩くかどうかは入口スキルの記載に従う**（`tools/install-skills.sh` を使っている環境では、どの作業フォルダからでも絶対パスで実行する）。
- 承認ゲート・自己検証・成果物提示の表形式など**このSKILLの手順自体は環境によらず同一**。

## 完了基準（Definition of Done）
- `SLIDEKIT-DECK.md`（構成サマリー）が `SPEC.md` の形式を満たす。
- 全フラグメントが**割り当てた構図パターンHTMLの構造に忠実**で、テキストが**実際の文言**で埋まっている（プレースホルダが残っていない）。
- 色の直書きがない（var(--sk-accent)/var(--sk-soft)/#333333/#8A8F98 のみ）。
- 構成・パターン割り当てがユーザー承認済み。
- `build-html-deck.mjs` でビルドし、`index.html`＋`deck.pdf` を生成、視覚QA（1サイクル）を通過している。
- 背景画像を敷くデッキでは、`deck-config.json` に `background` があり、表の「背景」列とビルドログの ON/OFF が一致している。

## 自己検証
出力前に確認し、結果は**ユーザーへの最終報告に記載**する（成果物ファイル本体には書かない）。
1. デザインテーマ・各構図が埋め込まれているか（外部参照のままでないか）
2. 全スロットが実文言で埋まっているか
3. 構成とパターン割り当てがユーザー承認を経たか
4. 項目数がテンプレートと異なるスライドで、本文ブロックが本文エリアの上下中央にあるか
   （SPEC「本文エリアの縦配置」。上に張り付き下だけ空いていたら不合格）
5. Step 0 の更新確認を実行したか（失敗していた場合も、そこで止まらず進めたか）。成果物表のIDは manifest.json から取り、pending は `pending` と書いたか
6. 背景画像を敷いた場合（Step 5-2）:
   - 表紙・全面塗り・写真背景のスライドが OFF になっているか（ユーザーが個別にONを指定した場合を除く）
   - 背景ONのスライドで文字が読みにくくなっていないか、白ベタの帯・面が浮いていないか
   - 背景の ON/OFF でレイアウトが動いていないか（qa-*.jpg で本文位置・見出し位置が変わっていないこと）
   - 表の「背景」列・ビルドログ・`deck-config.json`（`background` / `slides[].bg`）が一致しているか

## やってはいけないこと
- 構成・割り当てを承認なしで確定しない（承認ゲートを飛ばさない）。
- デザインテーマや構図を「参照リンク」で済ませない（AIに1ファイルで渡すため埋め込む）。
- スロットをプレースホルダのまま出力しない。
- 更新確認（Step 0）の失敗やエラーで作業を止めない。`patterns/manifest.json` / `SLIDE-PATTERN-INDEX.md` を手で編集しない（生成物）。
