---
name: mission-vision-editorial-rows
category: 本文
summary: MISSION／VISION／VALUEなど3行の横罫線区切りリスト。各行は左幅160pxの英字KICKER（14px・字間.2em・accent2可）＋和文サブラベル10px、右に見出し20px/700（1行）＋本文16px（1〜2行）。等高・上ぞろえ、塗りなし。
scenes: 理念・約束ごとを文章で語る場面。ミッション・ビジョン・バリューの3項を読み物として見せる会社紹介・採用資料
tier: high
id: P158
---
# SLIDE-PATTERN-mission-vision-editorial-rows

このファイルはコンテンツエリアのレイアウト定義です。タイトル枠・ページ番号・装飾はデザインテーマ側の Frame で定義します。

## Overview
**パターン名：** mission-vision-editorial-rows
**概要：** コンテンツエリアの上下中央に、3行の横罫線区切りリストを置く。各行は左幅160pxの「英字KICKER（14px・字間.2em）＋和文サブラベル（10px）」と、右の「見出し20px/700・1行＋本文16px・1〜2行」の2カラム。行は上border 1pxで区切り（先頭行は無し）、grid-auto-rows:1fr で等高、内容は上ぞろえ。塗りは使わない。
**適したシーン：** 理念・約束ごとを文章で語る編集誌トーンの1枚。MISSION／VISION／VALUEの3項を読み物として見せる場面。

## Structure（構造）

    structure:
      layout: editorial-rows
      content_area:
        side_margin: 48px
        vertical_align: center        # 見出しON時は上76px以降の上下中央
      list:
        display: grid
        grid_auto_rows: 1fr           # 等高
      row:
        display: grid
        grid_template_columns: "160px 1fr"
        column_gap: 24px
        align_items: start            # 上ぞろえ
        border_top: "1px（先頭行は無し）"
        padding: "20px 0"
        label:
          kicker: "英字（例：Mission）"   # 14px / 700 / .2em / accent2可
          sub: "和文（例：使命）"          # 10px / 400 / .18em / muted
        text:
          heading: "1行"                  # 20px / 700
          body: "1〜2行"                  # 16px / 400 / 行間1.8

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| 英字KICKER | 各行左上（幅160px） | Mission／Vision／Valueなどの項目名（14px・字間.2em） |
| 和文サブラベル | KICKERの下 | 英字ラベルの和文訳（10px・muted） |
| 横罫線 | 行の上端 | 行同士を隔てる区切り線（先頭行のみ無し） |
| 見出し | 右カラム上段 | その項の主張を和文太字で1行（20px/700） |
| 本文 | 見出しの下 | 主張を支える文章1〜2行（16px） |

## Usage Guide（AIへの使い方）
- 3行が基準（2行まで可。行数を減らしても grid-auto-rows:1fr のまま等高を保つ）
- ラベルはMISSION／VISION／VALUE以外（PROMISE・POLICYなど）でもよい。英字は1単語に絞る
- 英字KICKERは accent2（差し色）を使ってよい。塗りには使わない
- 本文は文章として書く（体言止めの箇条書きにしない）。読み物のトーンを保つ
- 内容は各行とも上ぞろえ（中央ぞろえにしない）

## v2 での描き直し（2026-09-03）
- 「左22%の英字ラベル＋縦罫線＋大見出し1〜2行＋英字小キャプション＋本文3〜5行」の2段構成を、左幅160pxの「英字KICKER＋和文サブラベル」＋右「見出し20px/700＋本文16px」の3行・横罫線区切りに描き直した（行間の区切りを縦罫線から横罫線へ変更）
- 英字ラベルの役割を「大見出しに添える飾りキャプション」から「行の先頭に立つKICKER（14px・字間.2em）」に変え、和文サブラベル（10px）を新設した
- 文字をv2の表に揃え（見出し20px/700・本文16px・KICKER 14px・サブラベル10px、太さ400/700のみ、インク色・palt・禁則）、grid-auto-rows:1fr による等高・上ぞろえを明記した
