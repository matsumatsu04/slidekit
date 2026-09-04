---
name: bar-actual-forecast
category: グラフ
summary: 左に棒6本のSVG（実績5本は淡い地・最終期の予想1本だけアクセント塗り＋特大数値28px＋FORECASTのKICKER）、右に説明（KICKER→見出し18px→罫線→本文16px→例：注記）。前年比は塗りバッジをやめ accent2 の英字KICKER＋数値テキストで右上に置く
scenes: 売上・会員数などの成長トレンド提示。事業計画・決算説明・ピッチの「伸びている」1枚
tier: mid
id: P113
---
# SLIDE-PATTERN-bar-actual-forecast

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** bar-actual-forecast
**概要：** 本文エリアを「左＝棒グラフ（SVG 560×352の1枚）／右＝説明（272px）」の2カラムに分け、上ぞろえで並べる。棒は5〜6本。実績の棒は `--sk-soft` 地で、最終期（予想・計画）の1本だけアクセント塗り（塗りは1枚に1つ）。予想の棒の上には `FORECAST ／ 予想` の KICKER と特大数値（28px / 700 / tabular-nums）を置き、結論を数字で示す。前年比は塗りバッジをやめ、右上に `--sk-accent2` の英字 KICKER（`YOY ／ 前年比`）＋数値テキスト（16px / 700）として置く。軸線は1pxの `--sk-line`、目盛り値は KICKER 10px の muted、期ラベルは16px。
**適したシーン：** 売上・会員数などの成長トレンド提示、事業計画・決算説明・ピッチの「伸びている」1枚

## Structure（構造）

コンテンツエリア（左右48px＝幅864px）の上下中央に「グラフ（560×352）＋説明（272px）」をgap 32で横並びにし、2カラムは上ぞろえにする。グラフは1単位=0.6pxで、スロット80px×6・棒幅48px・横軸 y=300 の座標で静的に描く。

    structure:
      layout: graph-left-text-right
      content_area:
        side_margin: 48px
        vertical_align: center             # 見出しON時は上76px以降の上下中央
        columns: [chart 560px, gap 32px, text 272px]
        align_items: flex-start            # カラム同士は上ぞろえ
      chart (svg 1枚):
        size: 560 × 352
        scale: 0.6px / 単位                 # 100 = 60px
        slots: 6 × 80px                    # 棒の中心 x = 96 + 80i
        bar: { width: 48px, x: 72 + 80i }
        baseline: y = 300                  # 横軸 1px / var(--sk-line)
        y_axis: x = 48（y 60〜300）＋刻み3本  # 1px / var(--sk-line)
        ticks: 10px / 700 / .18em / muted  # 0・100・200・300（右ぞろえ）
        bars:
          actual: soft                     # 実績5本は淡い地
          forecast: accent fill            # 最終期の1本だけ塗り
        labels:
          actual_value: 16px / tabular-nums   # 棒の中心・上端の10px上
          forecast_kicker: "FORECAST ／ 予想"  # 10px / 700 / .18em / accent
          forecast_number: 28px / 700 / tabular-nums / accent
          yoy: "YOY ／ 前年比 +18%"            # 右上・accent2・塗りなし
          period: 16px                        # 横軸の下32px
      text:
        kicker: 10px / 700 / .18em / accent
        title: 18px / 700
        rule: 1px / var(--sk-line)
        body: 16px / 400 / 行間1.8
        note: "例：〜"                      # 11.5px / muted

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 実績の棒 | 左から5本（淡い地） | 過去の推移。塗らずに `--sk-soft` で並べる |
| 予想の棒 | 右端1本（アクセント塗り） | 最終期の計画値。1枚に1つだけの塗り |
| 特大数値 | 予想の棒の上（28px / 700） | 結論の数字。ジャンプ率で視線を集める |
| FORECAST の KICKER | 特大数値の上 | `FORECAST ／ 予想` で最終期が実績でないことを示す |
| 実績の値 | 各棒の上（16px） | 各期の値。tabular-nums で桁をそろえる |
| 前年比 | グラフ右上（accent2） | `YOY ／ 前年比` の KICKER＋数値。塗りバッジは使わない |
| 軸・目盛り | 左と下（1px） | 縦軸＋刻み3本と横軸。目盛り値は KICKER 10px の muted |
| 期ラベル | 横軸の下（16px） | FY21〜FY26 など。全列で書式をそろえる |
| 説明カラム | 右272px | KICKER → 見出し18px → 罫線 → 本文16px → 「例：」注記 |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-bar-actual-forecast のレイアウトで、[FY21〜FY26] の[売上（百万円）]の推移を棒グラフにしてください。実績は [120／150／190／230／280]、最終期 [FY26] は予想 [330] です。右上に前年比 [+18%]、右のカラムに [成長の見通し] の説明を置いてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 棒は5〜6本まで。多い場合は期を間引くか、期を束ねる（棒を細くして詰めない）
- 塗るのは予想の1本だけ。実績は `--sk-soft` 地のまま（「実績＝淡い地・予想＝塗り」がこのパターンの本質）
- 棒の高さは「値 × 0.6px」で静的に計算し、上端 y は `300 −高さ` で書く。目盛りの刻みも同じ倍率で置き直す
- 前年比は accent2 の文字だけ（塗りバッジ・枠付きピルにしない）。数字は右のカラムの本文で繰り返さない
- 説明カラムの見出しは1行に収まる長さにする（2行目に2〜3文字だけ残さない）
- 予想が無いデータ（実績だけ）を出すときは、最後の棒を塗って「今期」を示すか、bar-diff-bracket を使う

## v2 での描き直し（2026-09-04）
- 高さ%指定のdiv棒＋タグ＋塗りバッジという組み方をやめ、幅560×高さ352のSVG 1枚に「0.6px/単位・スロット80px×6・棒幅48px・横軸 y=300」で座標を静的計算して描く形にした（軸線と目盛りも1pxの `--sk-line` で追加）
- 実績の棒を `--sk-soft` 地にそろえ、塗りは最終期（予想）1本だけにして「塗りは1枚に1つ」を守り、予想の上に `FORECAST ／ 予想` の KICKER＋特大数値28px/700/tabular-nums を置いた
- 右上の前年比バッジ（塗り）を廃止し accent2 の英字 KICKER＋数値テキストにしたうえで、右に説明カラム（KICKER→見出し18px→罫線→本文16px→「例：」注記）を足して文字を v2 の表に揃えた
