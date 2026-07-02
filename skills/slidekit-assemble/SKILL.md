---
name: slidekit-assemble
description: >-
  プレゼンの目的・対象・枚数と内容をヒアリングし、用意済みのデザインシステム（SLIDEKIT-DESIGN.md）と
  構図パターンライブラリ（patterns/SLIDE-PATTERN-*）を組み合わせて、スライド構成案を提示・承認の上、最終設計書
  SLIDEKIT-DECK.md を1ファイルで生成するスキル。SLIDEKIT形式でスライドを作る・DECKまで組み上げる場面で発動する
  （単なるアウトライン案だけが欲しい場合は対象外）。このファイル1枚をスライド生成AI（Claudeのデザイン機能・
  NotebookLM等）に渡せばスライドが完成する。「設計書を作って」「プレゼンを組み立てて」「SLIDEKIT-DECK を作って」
  「スライドの構成案を出して」と言われたら発動する。デザインシステム単体の生成は slidekit-design、構図パターン単体の
  定義は slidekit-layout の担当。
---

# slidekit-assemble — 設計書（SLIDEKIT-DECK.md）生成

## このスキルは何をするか

プレゼンのブリーフ（目的・対象・枚数）と内容を受け取り、デザインシステムと構図パターンを組み合わせて
**最終設計書 `SLIDEKIT-DECK.md`** を 1 ファイルで生成する。このファイルには
「選んだデザインシステムの中身・各ページの構図・実際のコンテンツ」がすべて埋め込まれているため、
これ 1 枚をスライド生成 AI に渡せばスライドが完成する。

成果物。
- `examples/{name}/SLIDEKIT-DECK.md`（または任意の出力先）

形式の正は常に `SPEC.md` の「3. SLIDEKIT-DECK.md」セクション。**着手前に必ず `SPEC.md` を読む。**

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

### 3. デザインシステムを選ぶ
`design-systems/` にある `SLIDEKIT-DESIGN.md` を一覧で提示し、1 つ選んでもらう。
（どれが合うかは各 `sample.html` で確認できることを伝える。）

> **フォールバック：** `design-systems/` が空、または合うものがない場合は、
> 先に `slidekit-design` でデザインシステムを 1 つ作るよう案内する（ここで止めて誘導する）。

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
> - `high`（44種）: シンプルで自動生成でも崩れない。**既定はここから選ぶ**
> - `mid`（31種）: 規則的だが要素多め。内容が合うときに使う
> - `low`（21種・円環図/ハブスポーク/ドーナツ図/組織図等）: 自動生成では崩れやすい。
>   **ユーザーが明示的に指定した場合のみ**使い、「複雑な構図のため生成結果が崩れる可能性がある」ことを一言添える。
>   同じ内容は high/mid の代替（例: 円環図→four-step-flow、ドーナツ図→three-kpi-big-number）で表現できないか先に検討する。

カテゴリと代表パターン（INDEX 参照。これ以外にも多数あるので INDEX を必ず見る）：

| カテゴリ | 代表パターン例 |
|---|---|
| 表紙 | cover-with-image-left / cover-gradient-text-bottom / cover-fullbg-text-left |
| セクション | section-divider |
| 目次 | agenda-toc / numbered-toc / two-column-toc |
| 本文 | key-message-single / two-col-text-body / image-left-text-right / quote-large-center |
| リスト | numbered-list-with-body / icon-left-text-list / three-tier-segment-list |
| ステップ | four-step-flow / three-stage-circle-flow / horizontal-timeline-cards / staircase-roadmap |
| 図解・ダイアグラム | cycle-diagram-with-labels / hub-spoke-diagram / org-chart-tree / four-quadrant-center-circle |
| カード | four-card-2x2 / three-column-icon-card / six-card-2x3-grid |
| グラフ | bar-chart-full / chart-left-text-right / pie-chart-left-list-right |
| テーブル | before-after-two-col / comparison-matrix-table / estimate-amount-table / line-item-table |
| KPI | three-kpi-big-number / goal-kgi-kpi-dashboard |
| まとめ | summary-three-points / action-items-list |
| FAQ | faq-grid / faq-single-column |
| プロフィール | profile-bio / profile-bio-photo-right |

割り当て表の例（**使用した構図パターン名を必ず列に含める**。見出しの有無も示す）：

| # | 種類 | 構図パターン（SLIDE-PATTERN名） | 見出し | 内容（1行） |
|---|---|---|---|---|
| 1 | 表紙 | cover-with-image-left | なし | タイトル・対象・日付 |
| 2 | 目次 | agenda-toc | なし | 本日の流れ |
| 4 | 本文 | key-message-single | あり | 現状の課題 |
| … | … | … | … | … |
気に入らない割り当ては変更を受ける（「4枚目を before-after-two-col に」等）。**ここでも承認を取る。**

> **成果物提示のルール：** ユーザーに構成・成果物を提示するときは、**必ず上記の形式の表（使用した構図パターン名の列を含む）**で示すこと。
> どのスライドにどの SLIDE-PATTERN を使ったかが一目で分かるようにする。見出しは「表紙・目次・セクション・締め以外＝あり」が既定。

> **フォールバック：** 内容に合うパターンが INDEX に無い場合は、近い既存パターンで代替するか、
> `slidekit-layout` で新規に作る（その場合 INDEX/manifest も更新）かをユーザーに確認する（黙って妥協しない）。

> **情報量→レイアウト変換規則（`docs/polish-rules.md` 参照）：** パターン選定は情報量から決める。
> テキスト量が**少ない**→横並び（カード・ステップ）／**多い**→縦積みの帯行リスト／
> **比較項目が多い**→表。図解は「この情報量ならどの型か」を先に判定してから選ぶ。

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

### 7. pptx を直接生成する（既定の納品ルート）
DECK と同時に **`deck.json`**（DECKの機械可読版）を同じフォルダに出力し、ビルダーで pptx を生成する:
```bash
cd tools/pptx && node build-pptx.mjs <deck.jsonのパス> <出力.pptx>
```
- deck.json スキーマ・実装済みレンダラ一覧・変換の約束事は **`docs/pptx-generation.md`** を必ず読む。
- パターン割り当て時は、**レンダラ実装済みパターンを優先**する（未実装はbulletsフォールバックになり構図が失われる）。
- 生成後は **レンダリングQA（soffice→pdftoppm→生成に関与していない別エージェントの視覚QA・1サイクル）** を必ず行う。
  QA画像は `/gallery/deck-review.html?base=...&count=N` で通し確認できる。
- 納品は **Google Slides 変換が第一候補**（google-drive MCP `uploadFile` + `convertToGoogleFormat`。
  詳細は docs/pptx-generation.md「納品」節）。PowerPointで直接編集できる形式を維持する。

### 8. 使い方を伝える
- 既定: 生成した pptx / Google Slides リンクを渡す（編集可能形式）。
- 代替: `SLIDEKIT-DECK.md` をスライド生成AI（Claudeのデザイン機能等）に渡す従来ルートも案内できる
  （画像ベースになり後から文字修正できないため既定にしない。pptx生成ツールがない環境のみ）。

## 完了基準（Definition of Done）
- `SLIDEKIT-DECK.md` が `SPEC.md` の全セクションを満たす。
- デザインシステムと各構図が**参照ではなく埋め込み**になっている（1ファイルで完結）。
- 各スライドのスロットが**実際の文言**で埋まっている（プレースホルダが残っていない）。
- 構成・パターン割り当てがユーザー承認済み。
- `deck.json` を出力し、`build-pptx.mjs` で pptx を生成、レンダリングQA（1サイクル）を通過している。

## 自己検証
出力前に確認し、結果は**ユーザーへの最終報告に記載**する（成果物ファイル本体には書かない）。
1. デザインシステム・各構図が埋め込まれているか（外部参照のままでないか）
2. 全スロットが実文言で埋まっているか
3. 構成とパターン割り当てがユーザー承認を経たか

## やってはいけないこと
- 構成・割り当てを承認なしで確定しない（承認ゲートを飛ばさない）。
- デザインシステムや構図を「参照リンク」で済ませない（AIに1ファイルで渡すため埋め込む）。
- スロットをプレースホルダのまま出力しない。
