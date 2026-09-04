---
name: bar-diff-bracket
category: グラフ
summary: 左に棒2本のSVG（前＝淡い地・後＝アクセント塗り）、頂点差を1px破線ガイド＋1pxブラケット＋差分の数値（24px/700・アクセント色の文字）で示す。右に説明（KICKER→見出し18px→罫線→本文16px→例：注記）。差分はバッジ塗りにしない
scenes: 導入前後・施策前後・自社と平均の「1点の差」を最も分かりやすく見せたい場面
tier: mid
id: P120
---
# SLIDE-PATTERN-bar-diff-bracket

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** bar-diff-bracket
**概要：** 本文エリアを「左＝棒2本（SVG 512×352の1枚）／右＝説明（320px）」の2カラムに分け、上ぞろえで並べる。棒は前（`--sk-soft` 地）と後（アクセント塗り）の2本だけ。前の棒の頂点から右へ1pxの破線ガイド（`--sk-line`）を引き、2つの頂点をつなぐブラケット（1px・インク色）と、その中心に差分（`DIFF ／ 差分` の KICKER＋24px / 700 の数値・文字色はアクセント）を置く。差分のバッジ塗りは使わない。各棒の上に値（16px / tabular-nums）、下に KICKER（accent2）＋ラベル（16px）を添える。
**適したシーン：** 導入前後・施策前後・自社と平均の「1点の差」を最も分かりやすく見せたい場面

## Structure（構造）

コンテンツエリア（左右48px＝幅864px）の上下中央に「グラフ（512×352）＋説明（320px）」をgap 32で横並びにし、2カラムは上ぞろえにする。グラフは1単位=1.2pxで、棒幅96px・横軸 y=300 の座標で静的に描く。

    structure:
      layout: graph-left-text-right
      content_area:
        side_margin: 48px
        vertical_align: center             # 見出しON時は上76px以降の上下中央
        columns: [chart 512px, gap 32px, text 320px]
        align_items: flex-start            # カラム同士は上ぞろえ
      chart (svg 1枚):
        size: 512 × 352
        scale: 1.2px / 単位
        bars:
          before: { x: 80, width: 96, surface: soft }
          after:  { x: 240, width: 96, surface: accent fill }   # 塗りは1枚に1つ
        baseline: y = 300                  # 横軸 1px / var(--sk-line)
        guide:
          from: 前の棒の上端（棒の右端 x=176）
          to: ブラケットの縦線（x=372）
          style: 1px 破線 4 3 / var(--sk-line)                  # 後の棒の後ろに引く
        bracket:
          path: 前後の上端を結ぶコの字（縦線 x=372.5・端の刻み8px）
          style: 1px / var(--sk-ink)
        diff:
          kicker: "DIFF ／ 差分"            # 10px / 700 / .18em / accent
          number: 24px / 700 / tabular-nums / accent            # バッジ塗りなし
          position: ブラケットの中心に垂直センター
        labels:
          value: 16px / tabular-nums        # 各棒の中心・上端の10px上
          kicker: "BEFORE" / "AFTER"        # 10px / 700 / .18em / accent2
          label: 16px                       # 導入前 / 導入後
      text:
        kicker: 10px / 700 / .18em / accent
        title: 18px / 700
        rule: 1px / var(--sk-line)
        body: 16px / 400 / 行間1.8
        note: "例：〜"                      # 11.5px / muted

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 前の棒 | 左（淡い地） | 比較元。塗らずに `--sk-soft` で置く |
| 後の棒 | 右（アクセント塗り） | 比較先。1枚に1つだけの塗り |
| 値 | 各棒の上（16px） | 実数値。tabular-nums で桁をそろえる |
| 破線ガイド | 前の棒の頂点から右へ（1px） | 差の起点の高さを示す。後の棒の後ろを通す |
| ブラケット | 2つの頂点の間（1px・ink） | 差の区間。端の刻み8pxで頂点に接続する |
| 差分 | ブラケットの右・中心（24px / 700） | `+83%` などの結論。文字色はアクセント（塗らない） |
| KICKER＋ラベル | 各棒の下 | `BEFORE`／`AFTER`（accent2）＋日本語ラベル16px |
| 説明カラム | 右320px | KICKER → 見出し18px → 罫線 → 本文16px → 「例：」注記 |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-bar-diff-bracket のレイアウトで、[導入前 120件／導入後 220件] の[月間問い合わせ数]を棒2本で比較し、差分 [+83%] をブラケットで示してください。右のカラムに [導入効果] の説明を置いてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 棒は必ず2本。3本以上の比較は bar-actual-forecast を使う
- 塗るのは後の棒だけ。前の棒は `--sk-soft` 地のまま（「前＝淡い地・後＝塗り」がこのパターンの本質）
- 棒の高さは「値 × 1.2px」で静的に計算し、上端 y は `300 −高さ` で書く。破線ガイド・ブラケットの y も同じ値にそろえる（0.5pxずらして1pxを鮮明にする）
- 差分は文字だけ（バッジ塗り・枠付きピルにしない）。ここが結論なので、右の本文で同じ数字を繰り返さない
- 前より後が小さい（減った）場合も同じ形。ブラケットは低いほうの頂点から高いほうの頂点までを結ぶ
- 説明カラムの見出しは1行に収まる長さにする（2行目に2〜3文字だけ残さない）

## v2 での描き直し（2026-09-04）
- 高さ%指定のdiv棒＋差分バッジという組み方をやめ、幅512×高さ352のSVG 1枚に「1.2px/単位・棒幅96px・横軸 y=300」で座標を静的計算して描く形にした（破線ガイド・ブラケット・値・ラベルもすべて同じSVGに置く）
- 差分の塗りバッジを廃止し、1pxのブラケット（インク色）＋`DIFF ／ 差分` の KICKER＋24px/700 のアクセント色テキストにして、塗りを後の棒1つだけに絞った
- 各棒の上に値16px/tabular-nums、下に KICKER（accent2）＋ラベル16pxを置き、右に説明カラム（KICKER→見出し18px→罫線→本文16px→「例：」注記）を足して文字を v2 の表に揃えた
