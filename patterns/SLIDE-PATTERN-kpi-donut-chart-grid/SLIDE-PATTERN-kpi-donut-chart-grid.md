---
name: kpi-donut-chart-grid
category: KPI
summary: ドーナツリング4つ（SVGのcircle・太さ10px・達成分はアクセント色、残りは罫線色。面塗りなし）を横一列・等幅・上ぞろえに並べ、中央に%数値24px/700、下にKICKER英字＋日本語ラベル16px＋注記11.5pxを置く複数指標ダッシュボード。達成率・構成比のまとめて提示に。
scenes: 達成率・構成比のまとめて提示に
tier: mid
id: P093
---
# SLIDE-PATTERN-kpi-donut-chart-grid

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** kpi-donut-chart-grid
**概要：** ドーナツリング4つを横一列・等幅（gap 16px）に並べ、列同士は上ぞろえにする。リングは 120×120px のSVGで、`circle`（半径55・太さ10px）を2本重ねる：下は残り分（罫線色 `--sk-line`）、上は達成分（アクセント色。`stroke-dasharray` を「達成長 345.575」で静的に書き、-90°回して12時から始める）。面塗りはしない（リングだけ）。リングの中央に%数値（24px/700・tabular-nums。%は14pxで小さく添える）、下に KICKER（英字ラベル）→ 日本語ラベル（16px/700）→ 「例：」注記（11.5px・muted）。
**適したシーン：** 複数KPIの達成率報告・月次/四半期レポートのダッシュボード的まとめ・複数施策の進捗比較

## Structure（構造）

コンテンツエリア（左右余白48px）の上下中央に4列の行を置く。各列は等幅（flex:1）で、中身はリング → KICKER → ラベル → 注記を中央ぞろえで縦積みする。

    structure:
      layout: 4 equal columns（横一列・上ぞろえ）
      content_area:
        padding: "24px 48px"
        vertical_align: center      # 見出しON時は上76px以降の上下中央
      row:
        display: flex
        gap: 16px
        align_items: flex-start     # 列同士は上ぞろえ
      column:
        count: 4
        align: center
        elements:
          - ring:
              svg: 120x120, circle r=55, stroke-width 10（面塗りなし）
              track: var(--sk-line)（残り分）
              value: var(--sk-accent), stroke-dasharray "達成長 345.575", rotate(-90deg)
              # 達成長 = 達成率 × 345.575（例: 78% → 269.55）。<script> は使わず静的に書く
          - number: "%数値（24px / 700 / tabular-nums。% は 14px / 400）をリング中央に絶対配置"
          - kicker: "英字ラベル（10px / 700 / .18em）"           # リングの 16px 下
          - label: "日本語の指標名（16px / 700）"
          - note: "例：前回比 +6pt（11.5px muted）"

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| ドーナツリング | 各列の上部中央 | 達成率を円弧の長さで見せる。達成分はアクセント色、残りは罫線色（塗り面は持たない） |
| 中央の数値 | リングの中央 | 達成率・比率の実数値（24px・太字）。%は小さく |
| KICKER | リングの下 | 英字の指標名（`WIN RATE` など） |
| ラベル | KICKER の下 | 日本語の指標名（16px・太字） |
| 注記 | ラベルの下 | 「例：」で前回比・目標差分などの補足を1行 |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-kpi-donut-chart-gridのレイアウトで、以下4つのKPIをドーナツリング形式で並べてください。デザインはSLIDE.mdに従ってください。
>
> 【KPI1】KICKER: WIN RATE / ラベル: 受注率 / 数値: 78% / 注記: 例：前回比 +6pt
> 【KPI2】KICKER: RETENTION / ラベル: 継続率 / 数値: 92% / 注記: 例：前回比 +2pt
> 【KPI3】KICKER: UTILIZATION / ラベル: 稼働率 / 数値: 65% / 注記: 例：前回比 -3pt
> 【KPI4】KICKER: SATISFACTION / ラベル: 満足度 / 数値: 88% / 注記: 例：前回比 +4pt」

**注意点：**
- 達成分の弧の長さは表示する数値と一致させる（`stroke-dasharray` の第1値 = 達成率 × 345.575）。数値だけ変えて弧を変え忘れない
- 4つのリングは等幅の列に置き、太さ・大きさをそろえる。面塗り（conic-gradient の円盤や白抜き円）は使わない
- ラベルは2〜5文字、KICKER は1〜2語の英字。4列で長さの差が出すぎないようにする
- 5個以上の指標を並べたい場合は本パターンではなく表形式やリスト形式を検討する
- アクセント色はリングの達成分にだけ使う。数値・ラベルはインク色のまま（塗りカードを足さない）

## v2 での描き直し（2026-09-04）
- `conic-gradient` の円盤＋白抜き円のドーナツを、SVGの `circle` 2本（太さ10px・達成分はアクセント色・残りは罫線色・`stroke-dasharray` を静的計算）に描き直し、面塗りをなくした
- 列を「等幅（flex:1）・上ぞろえ」にし、リングの下を KICKER（英字）→ 日本語ラベル16px/700 → 「例：」注記11.5px の型にそろえた
- 中央の数値を24px/700 tabular-nums（%は14px）にし、文字を v2 の表（字間.06em・インク色・太さ400/700・palt・禁則）にそろえた
