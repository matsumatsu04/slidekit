# SLIDE-PATTERN-kpi-donut-chart-grid

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** kpi-donut-chart-grid
**概要：** 小型のドーナツリングを4個横一列に並べ、それぞれのリング中央に％数値を表示するKPIグリッド。複数指標の達成度を視覚的に一覧できる。
**適したシーン：** 複数KPIの達成率報告・月次/四半期レポートのダッシュボード的まとめ・複数施策の進捗比較

## Structure（構造）

```yaml
layout: kpi-donut-chart-grid
content_area:
  display: flex
  align-items: center
  justify-content: space-evenly
  padding: "40px 48px"

donut_columns:
  count: 4
  each:
    width: 180px
    display: flex
    flex-direction: column
    align-items: center
    gap: 16px

each_donut_structure:
  - ring:
      shape: "円環（ドーナツ）"
      size: "120px × 120px"
      fill_ratio: "指標の達成率に応じた円弧の割合"
  - inner_circle:
      shape: "白抜きの中央円（リングを一回り小さい円でくり抜いて見せる）"
      size: "80px × 80px"
      position: "リングの中央に重ねて配置"
  - value:
      position: "中央円の中央"
      font_size: 22px
      font_weight: bold
      content: "％数値"
  - label:
      position: "リングの下"
      font_weight: bold
      content: "指標名"
  - supplement:
      position: "ラベルの下"
      font_size: small
      color: muted
      content: "前回比などの補足情報"
```

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| ドーナツリング | 各カラムの上部中央 | 達成率を円弧の塗り割合で視覚的に表現する |
| 中央数値 | リング中央の白抜き円内 | 達成率・比率の実数値を明示する |
| ラベル | リングの直下 | どの指標を示しているかの名称 |
| 補足テキスト | ラベルの直下 | 前回比・目標差分などの追加情報 |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-kpi-donut-chart-gridのレイアウトで、以下4つのKPIをドーナツリング形式で並べてください。デザインはSLIDE.mdに従ってください。
>
> 【KPI1】ラベル: 受注率 / 数値: 78% / 補足: 前回比 +6pt
> 【KPI2】ラベル: 継続率 / 数値: 92% / 補足: 前回比 +2pt
> 【KPI3】ラベル: 稼働率 / 数値: 65% / 補足: 前回比 -3pt
> 【KPI4】ラベル: 満足度 / 数値: 88% / 補足: 前回比 +4pt」

**注意点：**
- 4つのリングは横一列に等間隔で並べ、視覚的な重みを揃える（数値の桁数が大きく異なる場合はフォントサイズを統一したまま桁数だけ調整する）
- リングの塗り割合は表示する数値（達成率）と一致させ、視覚と数値に矛盾が出ないようにする
- 5個以上の指標を並べたい場合は本パターンではなく別パターン（表形式やリスト形式）を検討する
- ラベルは6〜10文字程度の短い指標名に揃え、4つのカラム間で文字数の差が出過ぎないようにする
