---
name: awards-total-highlight
category: KPI
summary: 左に合計の特大数字（48px・400・アクセント色・tabular-nums）とKICKER・説明・注記、縦1px罫線を挟んで右に内訳3項目（24px・700の数字＋単位・KICKER・ラベル、細罫線で列を区切る）を並べる。面の塗りは使わない。
scenes: 受賞・認定・掲載などの安心材料の提示。合計をまず数字で見せ、内訳3つで裏付ける場面
tier: mid
id: P155
---
# SLIDE-PATTERN-awards-total-highlight

このファイルはコンテンツエリアのレイアウト定義です。タイトル枠・ページ番号・装飾はデザインテーマ側の Frame で定義します。

## Overview
**パターン名：** awards-total-highlight
**概要：** コンテンツエリアの上下中央に、左＝合計ブロック（幅304px）／中央＝縦1px罫線／右＝内訳3項目（等幅・細罫線区切り）の1行を置く。左右は align-items:stretch で高さを揃える。面の塗りは使わず、罫線と文字の大小だけで合計と内訳の主従を作る。
**適したシーン：** 受賞・認定・掲載・登録などの安心材料。「合計を数字で見せてから、内訳3つで裏付ける」場面。

## Structure（構造）

    structure:
      layout: total-with-breakdown
      content_area:
        padding: "24px 48px"
        vertical_align: center       # 見出しON時は上76px以降の上下中央
      wrap:
        display: flex
        align_items: stretch         # 左・中央罫線・右の高さを揃える
      left:
        width: 304px
        padding_right: 40px
        vertical_align: center
        elements:
          - kicker: "TOTAL ／ 累計"        # 10px / 700 / .18em / アクセント色
          - number_row:
              number: "48px / 400"          # アクセント色・tabular-nums
              unit: "16px / 400"
          - description                     # 16px・muted
          - note: "例：〜"                  # 11.5px・muted
      divider:
        width: 1px                          # var(--sk-line)。左ブロックの高さに揃える
      right:
        flex: 1
        padding_left: 40px
        layout: grid-3-cols
        align_items: center
        item:
          divider: "left 1px（先頭列のみ無し）"
          elements:
            - kicker: "AWARDS ／ 受賞"        # 10px / 700
            - number_row:
                number: "24px / 700"          # tabular-nums
                unit: "16px / 400"
            - label                            # 16px

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| KICKER（TOTAL） | 左ブロック上端 | 合計であることを示す英字ラベル |
| 合計の数字 | KICKERの下 | 48px・400・アクセント色の特大数値（tabular-nums） |
| 説明 | 数字の下 | 何の合計かを1行で説明 |
| 注記 | 左ブロック最下 | 「例：〜」で集計基準・時点を添える |
| 縦1px罫線 | 中央 | 合計と内訳を隔てる背骨（左ブロックの高さに揃える） |
| 内訳3項目 | 右（等幅・細罫線区切り） | 合計の内訳。KICKER＋数字24px＋単位＋ラベルの型 |
| 数字（内訳） | 各項目内 | 24px・700・tabular-nums。合計の48pxより小さくして主従をつける |

## Usage Guide（AIへの使い方）
- 合計の数字は1個だけ。48pxは左ブロックだけで使い、内訳側で48pxを使わない
- 内訳は3項目が基準。増減する場合もgrid-3-colsの列数は変えず、項目の中身だけ調整する
- 面の塗りは使わない（アクセント色は数字の文字色・KICKER・縦罫線のみに使う）
- 実在の賞・認定名を入れる場合は事実確認を済ませてから使う（ダミーのまま公開しない）

## v2 での描き直し（2026-09-03）
- 「アイコン枠つき実績リスト4行＋文字バッジ3×3クラスタ＋薄グレー縦長カード」の非対称3ゾーンを廃し、左＝合計（48px特大数字）／縦1px罫線／右＝内訳3項目の単純な1行構成にした
- 薄グレー地の塗りカードをやめ、面塗りなし・罫線だけで合計と内訳を区切る構成にした（規律v2「塗りは1枚に1つ」に対し、この型はあえて塗り0枚を選択）
- 文字をv2の表に揃え、内訳側の単位・ラベルを14pxから16pxへ統一した（数字24px/700・単位16px・ラベル16pxの型に統一）
