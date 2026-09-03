---
name: before-after-two-col
category: テーブル
summary: 左＝淡い地の BEFORE パネル、右＝アクセント塗りの AFTER パネルを等高で並べる対比レイアウト。各パネルに「KICKER／工程の白い箱＋三角矢印／丸角チップ2列／注記」を同じ型で置く（塗りは右パネルの1つだけ）。
scenes: ビジネス提案・改善提案・課題解決の提示・現状と目標の比較・工程の変化の説明
tier: high
id: P058
---
# SLIDE-PATTERN-before-after-two-col

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview
**パターン名：** before-after-two-col
**概要：** 左＝淡い地の BEFORE パネル、右＝アクセント塗りの AFTER パネルを等高で並べる対比レイアウト。各パネルに「KICKER／工程の白い箱＋三角矢印／丸角チップ2列／注記」を同じ型で置く（塗りは右パネルの1つだけ）。
**適したシーン：** ビジネス提案・改善提案・課題解決の提示・現状と目標の比較・工程の変化の説明

## Structure（構造）

```yaml
layout: before-after-two-col
content_area:
  padding: "24px 48px"
  vertical_align: center        # 本文エリアの上下中央（見出しON時は上76px以降）
  row:
    display: flex
    gap: 16px
    align_items: stretch        # 2パネルは等高

panel_common:                    # 左右とも同じ型で中身を組む
  border_radius: 12px
  padding: 24px
  elements:
    - kicker: "英字ラベル ／ 補足（例: BEFORE ／ 人が全部つくる）"   # 10px / 700 / .18em
    - flow:                      # 工程の白い箱 → 三角矢印（SVG・幅12px）
        box: [英字ラベル(10px・muted), 見出し(16px・700)]
        height: 88px
    - chips:                     # 丸角チップ（2列グリッド・高さ36px・本文16px）
        columns: 2
        count: 4
    - note: "例：〜（11.5px・muted）"

left_panel:
  role: BEFORE
  surface: soft                  # 淡い地 + 1px 罫線
  flow_boxes: 2                  # 例: HUMAN 設計と構成 → HUMAN 手で全部組む
  chip_marker: "×"

right_panel:
  role: AFTER
  surface: accent_fill           # アクセント塗り・白文字（1枚で塗るのはここだけ）
  flow_boxes: 4                  # 例: PLAN 設計 → BUILD 生成 → CHECK 確認 → PUBLISH 公開
  last_box: outline              # 最終工程（公開・運用）は塗らず 1.5px の白枠線
  chip_marker: "○"
  chip_surface: "白の 14% 透過"
```

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| KICKER | 各パネル左上 | `BEFORE ／ 補足`・`AFTER ／ 補足`。左はアクセント色、右（塗り）は白 |
| 工程の箱 | KICKER の下・横一列 | 工程名（英字ラベル＋日本語見出し）。左は2箱、右は4箱。右の最終箱だけ枠線 |
| 三角矢印 | 箱と箱の間 | SVG の三角（幅12px）。左は muted、右は白 |
| 丸角チップ | 箱の下・2列 | 課題（×）／改善後（○）を7文字以内で。本文16px |
| 注記 | パネル最下 | 「例：〜」で具体を1行添える（11.5px） |

## Usage Guide（AIへの使い方）

### プロンプト例

```
SLIDE.mdのデザインシステムと、以下のSLIDE-PATTERN-before-after-two-colパターンを使って
スライドを1枚生成してください。

【スライドタイトル】「人が全部つくる」と「AI×人」の工程の違い

【BEFORE（左・淡い地）】
- KICKER: BEFORE ／ 人が全部つくる
- 工程: HUMAN 設計と構成 → HUMAN 手で全部組む
- チップ: × 修正は組み直し／× 確認が納品前／× 担当者に依存／× 工数が読めない
- 注記: 例：修正1回ごとに半日、確認は最終日に集中する

【AFTER（右・アクセント塗り）】
- KICKER: AFTER ／ AI × 人
- 工程: PLAN 設計 → BUILD 生成 → CHECK 確認 → PUBLISH 公開（最終だけ枠線）
- チップ: ○ 修正は再生成／○ 確認が工程内／○ 根拠が残る／○ 工数が読める
- 注記: 例：修正は10分で再生成、確認は工程ごとに10分
```

### 注意点
- 塗りは右パネルの1つだけ。左パネル・箱・チップに別の塗りを足さない
- チップは2列×2段（4つ）が基本。1つ7文字以内に収める（文字を小さくして詰めない）
- 右の工程箱は幅76pxなので、英字ラベルは7文字以内（PLAN / BUILD / CHECK / PUBLISH 程度）
- 矢印は SVG の三角だけ。文字の「→」や太い矢印図形は使わない
- 左右のパネルは等高（flex stretch）。項目数が違っても高さを揃える

## v2 での描き直し（2026-09-02）
- 枠線だけの2カラム＋文字の「→」を、淡い地（BEFORE）とアクセント塗り（AFTER・白文字）の等高パネルに変えた（塗りは1枚に1つ）
- 箇条書きを「KICKER／工程の白い箱＋SVG三角矢印／丸角チップ2列／注記」の型に置き換え、最終工程は塗らず1.5pxの枠線にした
- 文字を v2 の表に揃えた（KICKER 10px・箱の見出し16px・チップ16px・注記11.5px、インク色・palt・禁則）
