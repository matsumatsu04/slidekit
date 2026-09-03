---
name: vertical-side-label-dotted-grid
category: リスト
summary: 本文エリア左端に幅48pxの縦書き英字ラベル（accent2）と縦1px罫線を置き、右に項目6つの2行×3列グリッド。列・行は1px細罫線で区切り、各項目は番号ドット（12px・1.5px枠・1つだけ塗り）＋見出し＋説明の型。
scenes: 提供内容・サポート範囲・対応領域など、量のある一覧を整理して見せる場面
tier: high
id: P160
---
# SLIDE-PATTERN-vertical-side-label-dotted-grid

このファイルはコンテンツエリアのレイアウト定義です。タイトル枠・ページ番号・装飾はデザインテーマ側の Frame で定義します。

## Overview
**パターン名：** vertical-side-label-dotted-grid
**概要：** 本文エリアを左右に分け、左は幅48px・縦1px罫線つきの縦書き英字ラベル（accent2色）、右は項目6つの2行×3列グリッド。グリッドは列・行とも1px細罫線で区切り（1列目は左のサイド罫線が兼ねる）、各セルは「番号ドット（12px・1.5px枠）＋番号KICKER→見出し16px/700→説明16px・muted」の型。ドットは1個だけアクセント塗りで主役を示す。
**適したシーン：** 提供内容・サポート範囲・対応領域など、項目数の多い一覧。箇条書きの羅列を細罫線グリッドに整理したい場面。

## Structure（構造）

    structure:
      layout: side-label + two-row-three-col-grid
      content_area:
        side_margin: 48px
        vertical_align: center         # 見出しON時は上76px以降の上下中央
      wrap:
        display: flex
        align_items: stretch           # サイド帯とグリッドの高さを揃える
      side:
        width: 48px
        border_right: 1px              # var(--sk-line)
        label:
          text: "英字 ／ 和文補足"
          writing_mode: vertical-rl
          style: kicker (10px, 700, .18em, accent2)
      grid:
        columns: 3
        rows: 2
        equal_height: true             # grid-template-rows:1fr 1fr
        divider: "1px solid（列は左border・行は上border。1列目・1行目は無し）"
        cell:
          align_items: flex-start      # 上ぞろえ
          padding: "20px 24px"
          order:
            - mark: "ドット12px（1.5px枠）＋番号KICKER 10px"   # ドットは1個だけ塗り
            - heading                                          # 16px / 700
            - description                                      # 16px / 400 / muted

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| 縦書き英字ラベル | 左サイド（幅48px） | このスライドのテーマを一語で示す（accent2・塗りには使わない） |
| 縦1px罫線 | サイドの右端 | サイドラベルとグリッドの区切り |
| 番号ドット | 各セル左上 | 12px・1.5px枠の丸。主役の1個だけアクセント塗り |
| 番号KICKER | ドットの右 | 01〜06の通し番号（10px） |
| 見出し | ドット行の下 | 項目名（16px・700） |
| 説明 | 見出しの下 | 具体的な内容を1〜2行（16px・muted） |
| 細罫線グリッド | 全体 | 列・行を1pxの罫線で区切る（角丸ボックス・点線は使わない） |

## Usage Guide（AIへの使い方）
- 塗りはドット1個だけ。セルの背景やボックス全体を塗らない
- 縦書きの英字ラベルは英字＋和文補足（例：`Scope ／ 対応範囲`）。accent2を使ってよい
- ボックスは6個が基準（4〜6個。減る場合も列数は3のまま行を減らし、grid-template-rowsで上下センタリングを保つ）
- 説明は16pxで1〜2行に収める。あふれる場合は文言を短くする（文字を小さくしない）

## v2 での描き直し（2026-09-03）
- 「濃色帯＋角丸ボックス3×3の点線ボーダー」の意匠を廃し、左＝幅48pxの縦書き英字ラベル（縦1px罫線区切り）／右＝2行×3列グリッド（1px細罫線区切り）に描き直した。点線は1pxの細罫線に置き換えた
- 各セルの型を「太字項目名＋スラッシュ区切り列挙」から「番号ドット（12px・1.5px枠）＋番号KICKER→見出し16px/700→説明16px」に変更し、塗りはドット1個だけにした（規律v2「塗りは1枚に1つ」に対応）
- 文字をv2の表に揃え（見出し16px/700・説明16px・KICKER 10px、太さ400/700のみ、インク色・palt・禁則）、説明の文字サイズを14pxから16pxへ統一した
