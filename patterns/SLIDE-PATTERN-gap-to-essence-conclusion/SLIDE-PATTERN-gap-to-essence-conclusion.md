---
name: gap-to-essence-conclusion
category: 図解・ダイアグラム
summary: 表面の課題→隠れたギャップ→本質の3箱を横一列にSVG矢印でつなぎ、その下に全幅の結論バンド（アクセント塗り・白文字）を置く課題整理レイアウト。塗りは結論バンドだけ。
scenes: 現状分析から本質・結論への橋渡し、課題の構造化、コンサル型の論点整理
tier: mid
id: P151
---
# SLIDE-PATTERN-gap-to-essence-conclusion

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** gap-to-essence-conclusion
**概要：** 「表面の課題（SURFACE）」→「隠れたギャップ（GAP）」→「本質（ESSENCE）」の3箱を横一列に並べ、間をSVGの三角矢印でつなぐ。3箱は淡い地で塗らず、最下部に全幅の結論バンド（アクセント塗り・白文字）を置いて言い切る。1枚のスライドで塗りは結論バンドだけ。
**適したシーン：** 現状分析から本質・結論への橋渡し、課題の構造化、コンサル型の論点整理

## Structure（構造）

コンテンツエリア（左右余白48px）の上下中央に、等幅・等高184pxの箱3枚を矢印列（幅48px×2）を挟んで横一列に置き、その下24pxに全幅の結論バンドを置く。各箱は「KICKER→見出し18px→本文16px×2行」の同じ型。中身は上ぞろえ。

    structure:
      layout: three-box-flow-to-conclusion
      content_area:
        padding: "24px 48px"
        vertical_align: center      # 見出しON時は上76px以降の上下中央
      row:
        display: flex
        align_items: stretch
        height: 184px                # 3箱は等高
      box_common:
        border_radius: 11px
        padding: 24px
        surface: soft                # 淡い地（--sk-soft）。濃い塗りは使わない
        elements:
          - kicker: "英字 ／ 日本語"   # 10px / 700 / .18em
          - heading                    # 18px / 700
          - body: 2 lines              # 16px / 400 / 行間1.8
      connector:
        width: 48px
        shape: svg-triangle-arrow      # 幅12pxの三角矢印。アクセント色。2箇所（箱1→2、箱2→3）
      conclusion_band:
        margin_top: 24px
        border_radius: 11px
        surface: accent_fill           # アクセント塗り・白文字（1枚で塗るのはここだけ）
        elements:
          - kicker: "CONCLUSION ／ 結論"   # 白文字
          - statement                       # 18px / 700 / 白文字・1行

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 表面の課題（SURFACE） | 左の箱 | 目に見える現象・症状 |
| 隠れたギャップ（GAP） | 中央の箱 | SURFACEの裏にある、気づかれていない要因 |
| 本質（ESSENCE） | 右の箱 | GAPの奥にある根本原因 |
| 矢印 | 箱の間・2箇所 | SURFACE→GAP→ESSENCEの読み進み |
| 結論バンド | 最下部・全幅 | スライドの言い切り1行。1枚のスライドで塗りはここだけ |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-gap-to-essence-conclusionのレイアウトで、表面の課題「[症状]」→隠れたギャップ「[気づかれていない要因]」→本質「[根本原因]」の3箱をつなぎ、最下部の結論バンドに[言い切りの1文]を置いてください。塗りは結論バンドだけにしてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- **箱は3つ固定**（SURFACE・GAP・ESSENCE）。増減する場合は行の高さ・矢印の数を再設計する
- 塗りは結論バンドだけ。3箱は淡い地のまま強調しない（強調したい箱があっても塗らず、見出しの文言で示す）
- 各箱の本文は2行以内に収める（1行20文字前後）。入らないときは文字を小さくせず、文言を短くする
- 結論バンドは1行に収める。長くなるなら本文を削る
- 単純な「課題→解決」の2ゾーンだけなら problem-solution を検討する。本パターンは「表面→ギャップ→本質」の3段構造と結論バンドを持つ点が違い

## v2 での描き直し（2026-09-03）
- 左ゾーン（対立2カード＋ギャップ矢印）＋右ゾーン（本質の番号リスト3件）＋下部結論バンドという非対称な2ゾーン構成を、SURFACE→GAP→ESSENCEの等幅・等高3箱＋結論バンドという単純な横流れに描き直した
- 白カード・番号バッジ・複数の強調スパンを廃止し、各箱を「KICKER→見出し18px→本文16px×2行」の同じ型に揃えた（塗りは結論バンドだけ・1枚に1つ）
- 箱の間の接続を、グレー矢印＋対立の小矢印から、幅48pxの列に置いたSVG三角矢印（12px・アクセント色）2箇所に統一した
