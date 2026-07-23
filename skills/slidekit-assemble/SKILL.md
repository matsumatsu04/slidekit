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

成果物（出力先は案件フォルダ or `output/`）。
- `{デッキフォルダ}/slides/*.html`（フラグメント）＋ `deck-config.json`
- `{デッキフォルダ}/index.html`（ビルド結果・画面表示用）＋ `deck.pdf`（納品用）
- `SLIDEKIT-DECK.md`（構成サマリー）

形式の正は常に `SPEC.md` と **`docs/html-deck-generation.md`**。**着手前に必ず両方読む。**

> 3 スキルの締めくくり。`slidekit-design`（見た目）と `slidekit-layout`（構図）の成果物を、
> ここで「実コンテンツ」と結合して完成形にする。

## 手順

### 1. ブリーフをヒアリングする（5問）
順に質問する。すでに分かっている項目は飛ばす。
1. **title:** このプレゼンのタイトルは？
2. **audience:** 誰に向けたもの？（社内/顧客/受講生/一般 など）
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

> **再現性tier（manifest.json の `tier`）を必ず考慮する：**
> - `high`（92種）: シンプルで自動生成でも崩れない。**既定はここから選ぶ**
> - `mid`（39種）: 規則的だが要素多め。内容が合うときに使う
> - `low`（現在0種。今後追加された場合：円環図/ハブスポーク/ドーナツ図/組織図等）: 自動生成では崩れやすい。
>   **ユーザーが明示的に指定した場合のみ**使い、「複雑な構図のため生成結果が崩れる可能性がある」ことを一言添える。
>   同じ内容は high/mid の代替（例: 円環図→four-step-flow、ドーナツ図→three-kpi-big-number）で表現できないか先に検討する。

カテゴリと代表パターン（INDEX 参照。これ以外にも多数あるので INDEX を必ず見る）：

| カテゴリ | 代表パターン例 |
|---|---|
| 表紙 | cover-split-two-tone（画像不要の2トーン） / cover-big-typography（特大タイポ・画像不要） / cover-photo-overlay-center / cover-blob-side-left / cover-curve-shape-left ほか（画像背景表紙は assets/covers/ の素材を使用・色ティント対象外） |
| セクション | section-divider / section-minimal-center（ミニマル中央） / section-tag-progress（現在地タグナビ） / section-photo-overlay-left / section-geo-texture-left / section-soft-3d-number-row（画像背景中扉は assets/covers/ の素材を使用・色ティント対象外） |
| 目次 | agenda-toc / toc-two-column（5項目以上の2カラム） / toc-section-cards（カード型・4章） / toc-current-highlight（章再掲・現在地） |
| 本文 | key-message-single / key-message-inverted（反転配色の山場） / left-context-data（左文脈固定×右データ） / quote-single-large（1名大型引用） / value-three-pillars（MVV3段） / body-callout-box（本文＋POINT囲み） / concept-keyword-three（大キーワード3つ） / two-col-text-body |
| リスト | numbered-list-with-body / icon-left-text-list / three-tier-segment-list / checklist-two-column（チェックリスト） |
| ステップ | four-step-flow / three-stage-circle-flow / horizontal-timeline-cards / vertical-step-flow / history-year-list（沿革） |
| 図解・ダイアグラム | two-column-split-boxes / four-quadrant-center-circle / ok-ng-comparison（NG×OK対比） / flow-branch-two-outcomes（条件分岐） / business-model-three-party（3者商流） |
| カード | four-card-2x2 / three-column-icon-card / six-card-2x3-grid / card-photo-caption-three（写真3枚） / target-audience-three（こんな方におすすめ） |
| グラフ | waterfall-bridge-chart / bar-actual-forecast（実績×予想） / bar-diff-bracket（2本の差） / line-trend-target（目標線つき折れ線） / donut-share-single（シェア1つ） / stacked-bar-two-composition（構成変化） / area-growth-curve（成長カーブ） |
| テーブル | before-after-two-col / comparison-matrix-table / comparison-vs-two-column（自社vs他社） / estimate-amount-table / line-item-table |
| KPI | three-kpi-big-number / goal-kgi-kpi-dashboard / giant-number-badge（1数字特大） / kpi-two-contrast（前後対比） / stats-grid-six（数字で見る◯◯） / kpi-progress-bars（達成率バー） |
| まとめ | summary-three-points / summary-key-takeaways（持ち帰り3点） / action-items-list / next-step-cta-band（まとめ＋CTA帯） / closing-blob-thanks-left / closing-curve-shape-footer / closing-art-brush-contact（画像背景の締めは assets/covers/ の素材を使用・色ティント対象外） |
| FAQ | faq-grid / faq-single-column / faq-accordion-list（4問コンパクト） |
| プロフィール | profile-bio / profile-skill-tags（1名詳細＋スキル） / profile-two-speakers（2名） / team-members-grid（4〜8名） |

割り当て表の例（**使用した構図パターン名とID（manifest.jsonの`id`）を必ず列に含める**。見出しの有無も示す）：

| # | 種類 | ID | 構図パターン（SLIDE-PATTERN名） | 見出し | 内容（1行） |
|---|---|---|---|---|---|
| 1 | 表紙 | P133 | cover-split-two-tone | なし | タイトル・対象・日付 |
| 2 | 目次 | P006 | agenda-toc | なし | 本日の流れ |
| 4 | 本文 | P015 | key-message-single | あり | 現状の課題 |
| … | … | … | … | … | … |
気に入らない割り当ては変更を受ける（「4枚目を before-after-two-col に」等）。**ここでも承認を取る。**

> **成果物提示のルール：** ユーザーに構成・成果物を提示するときは、**必ず上記の形式の表（構図パターン名＋恒久ID の列を含む）**で示すこと。
> どのスライドにどの SLIDE-PATTERN（ID）を使ったかが一目で分かるようにする。見出しは「表紙・目次・セクション・締め以外＝あり」が既定。
> **ID（P001〜）は manifest.json の該当パターンの `id` フィールドから取得する（作らない・記憶に頼らない）。**
> IDは追加・削除があっても既存パターンの番号は変わらない恒久値。ギャラリー（gallery/index.html）のカードにも同じIDが表示されるため、
> ユーザーはID or パターン名でギャラリーと突き合わせて確認できる。

> **フォールバック：** 内容に合うパターンが INDEX に無い場合は、近い既存パターンで代替するか、
> `slidekit-layout` で新規に作る（その場合 INDEX/manifest も更新）かをユーザーに確認する（黙って妥協しない）。

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
   色は直書き禁止（var(--sk-accent) / var(--sk-accent2, var(--sk-accent))（差し色・1スライド1箇所まで） / var(--sk-soft) / #333333 / #8A8F98 のみ）。
   共通見出しはビルダー提供の `.sk-h` / `.sk-msg` を使う（本文はtop:128px以降）。
   背景画像スライドは `assets/covers/` 等の素材を相対参照（ビルダーが自己完結化する。
   リポジトリの隣に `../slidekit-private/` がある環境では、その中の非公開素材も同じ書き方で参照できる）。
   アイコンはFont Awesome（docs参照。絵文字・特殊文字記号での代用は禁止）。
2. `deck-config.json` にタイトル・テーマ色（選んだデザインテーマのpptx theme JSONの色を `#` 付きで）を書く。
3. ビルド＆PDF書き出し:
```bash
node tools/html-deck/build-html-deck.mjs <デッキフォルダ>
bash tools/html-deck/export-pdf.sh <デッキフォルダ>
```
4. **QA（1サイクル・必須）**: 生成された qa-*.jpg を視覚チェック（環境適応の表参照）。
   はみ出し・重なり・語中折返し・整列ズレ・余白の偏りを確認し、修正して再ビルド。

### 8. 納品して使い方を伝える
- 既定: **`index.html`（画面表示・そのままプレゼン可）＋ `deck.pdf`（共有・印刷用）** を渡す。
- 納品時に**ギャラリーの「スライド確認・修正依頼」ページ**（`https://slidekit-sigma.vercel.app/gallery/deck.html`）を必ず案内する:
  「index.html をビューアに読み込むと、スライド確認・スライド別フィードバック記入・修正プロンプトのコピー・PDF保存（ブラウザ印刷）ができます。
  出力された修正プロンプトをそのまま貼り付けてもらえれば、こちらで修正して再ビルドします」。
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
| スライド確認・修正依頼ページ（フィードバックループ） | 本番 `https://slidekit-sigma.vercel.app/gallery/deck.html`（またはローカル `/gallery/deck.html`）を納品時に案内 | index.html をブラウザで開いて確認し、修正指示はチャットで受ける |

- パスは正本リポジトリからの相対（`tools/html-deck/` `tools/pptx/` `docs/` `patterns/` `assets/`）で解決する。リポジトリの場所が違う環境では入口スキルの記載に従う。
- 承認ゲート・自己検証・成果物提示の表形式など**このSKILLの手順自体は環境によらず同一**。

## 完了基準（Definition of Done）
- `SLIDEKIT-DECK.md`（構成サマリー）が `SPEC.md` の形式を満たす。
- 全フラグメントが**割り当てた構図パターンHTMLの構造に忠実**で、テキストが**実際の文言**で埋まっている（プレースホルダが残っていない）。
- 色の直書きがない（var(--sk-accent)/var(--sk-soft)/#333333/#8A8F98 のみ）。
- 構成・パターン割り当てがユーザー承認済み。
- `build-html-deck.mjs` でビルドし、`index.html`＋`deck.pdf` を生成、視覚QA（1サイクル）を通過している。

## 自己検証
出力前に確認し、結果は**ユーザーへの最終報告に記載**する（成果物ファイル本体には書かない）。
1. デザインテーマ・各構図が埋め込まれているか（外部参照のままでないか）
2. 全スロットが実文言で埋まっているか
3. 構成とパターン割り当てがユーザー承認を経たか

## やってはいけないこと
- 構成・割り当てを承認なしで確定しない（承認ゲートを飛ばさない）。
- デザインテーマや構図を「参照リンク」で済ませない（AIに1ファイルで渡すため埋め込む）。
- スロットをプレースホルダのまま出力しない。
