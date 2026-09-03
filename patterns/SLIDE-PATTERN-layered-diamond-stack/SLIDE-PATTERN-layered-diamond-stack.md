---
name: layered-diamond-stack
category: 図解・ダイアグラム
summary: 左半分に説明3ブロック（KICKER→見出し18px→本文16px・横罫線で区切る）、右半分に1枚のSVGで描く5段のダイヤ積層（頂点の1段だけアクセント塗り・残りは淡い地に罫線色の枠）と、1pxの縦軸＋英字KICKER（ABSTRACT / CONCRETE）で具体・抽象を示す概念モデル図解。
scenes: 概念モデル・レイヤー構造の解説、フレームワーク紹介、抽象度の階層を見せる説明
tier: mid
id: P152
---
# SLIDE-PATTERN-layered-diamond-stack

このファイルはコンテンツエリアのレイアウト定義です。タイトル枠・ページ番号・装飾はデザインテーマ側の Frame で定義します。

## Overview
**パターン名：** layered-diamond-stack
**概要：** 左半分に説明ブロック3つ（KICKER `MODEL ／ 前提` → 見出し18px/700 → 本文16px・1〜2行）を横罫線で区切って縦積みし、末尾に「例：」の注記を置く（地色は敷かない）。右半分は 400×352px のステージに1枚のSVGで、横長のダイヤ（幅192・高さ72）5枚を16pxずつ重ねて積層する。頂点の1段だけアクセント塗り、残り4段は淡い地（`--sk-soft`）に罫線色（`--sk-line`）の1px枠（塗りは1枚に1つ）。積層の左に1pxの縦軸（上端に幅12pxのSVG三角の矢じり）を引き、軸の上下に英字KICKER `ABSTRACT` / `CONCRETE` を置いて具体・抽象の向きを示す。各ダイヤの右横に段のラベル（KICKER `LAYER 1` → 名前16px/700）。
**適したシーン：** 概念モデル・レイヤー構造の解説、フレームワーク紹介、抽象度の階層を見せる説明。

## Structure（構造）

コンテンツエリア（左右余白48px）の上下中央に左右2カラム（gap 48px・上ぞろえ）を置く。左は残り幅（約416px）に説明ブロックを縦積み、右は 400×352px のステージにSVGとラベルを絶対配置する。

    structure:
      layout: two-column (left: text blocks / right: diamond stack)
      content_area:
        padding: "24px 48px"
        vertical_align: center      # 見出しON時は上76px以降の上下中央。左右のカラムは上ぞろえ
      text_blocks:                   # 左（幅 約416px）
        rows: 3, divided by 1px var(--sk-line)（地色なし）
        elements: [kicker "MODEL ／ 前提", title 18px/700, body 16px 1〜2行]
        note: "例：〜（11.5px muted）"
      stage: 400x352                 # 右
      axis:
        x: 32
        line: 1px var(--sk-line), y 30-332（矢じりの底辺から下端KICKERの8px上まで）
        arrowhead: SVG triangle 12px（上向き・y 18-30）
        kicker: ABSTRACT（上・y 0）/ CONCRETE（下・y 342）を軸に中央ぞろえ
      diamonds:
        svg: 1 sheet（下の段から描く）
        size: 192x72, center x=176
        tops: [28, 84, 140, 196, 252]   # ピッチ56（16px ずつ重なる）
        surfaces:
          top: accent_fill           # 塗りはここだけ
          others: soft + 1px var(--sk-line)
      layer_labels:
        left: 288px, width: 112px, height: 36px（各ダイヤの中心 y=64/120/176/232/288 に垂直センター）
        elements: [kicker "LAYER n", name 16px/700]

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| 説明ブロック × 3 | 左カラム | 図解の前提・関係・使い方を KICKER→見出し→本文の型で書く |
| 注記 | 左カラム末尾 | 「例：」で使いどころを1行 |
| ダイヤ積層 × 5 | 右ステージ中央 | 概念のレイヤー構造。上ほど抽象。頂点だけ塗り、残りは淡い地に枠 |
| 段のラベル × 5 | 各ダイヤの右横 | KICKER `LAYER n` ＋ 層の名前（ダイヤの上に文字を載せない） |
| 縦軸＋矢じり | 積層の左 | 上下方向の意味（具体→抽象）。1px細線・矢じりはSVG三角12px |
| 軸のKICKER | 軸の上端・下端 | `ABSTRACT` / `CONCRETE`。旧版の丸バッジの代わり |

## Usage Guide（AIへの使い方）

プロンプト例：

> 「SLIDE-PATTERN-layered-diamond-stackのレイアウトで、右の5段に上から[層1〜層5]の名前、左の3ブロックに[前提・関係・使い方]の見出しと本文を入れてください。塗りは頂点の1段だけにしてください。デザインはSLIDE.mdに従ってください。」

注意点：
- ダイヤの重なりの上に文字を置かない（ラベルは必ず右横の外側）
- 層の数は5枚基準（4〜5枚）。減らす場合もピッチ56pxと重なり16pxは保つ
- 塗りは頂点の1段だけ。旧版の「上=濃→下=淡の5段階濃淡」は廃止した（残り4段は淡い地に罫線色の枠）
- 縦軸の線は矢じりの底辺から下端KICKERの手前まで。積層の全高に伸ばさない・矢じりとの間に隙間を作らない
- 左の本文は1〜2行（1ブロック40文字以内）。見出しは12文字以内で1行
- 台形の積層（三角形）でよければ pyramid-tier-callout を検討する。本パターンは「ダイヤの重なり＋説明3ブロック＋具体・抽象の軸」が特徴

## v2 での描き直し（2026-09-04）
- 左半分の薄グレー地・ピルの式・番号リストをやめ、説明3ブロック（KICKER→見出し18px/700→本文16px）を横罫線で区切る型にし、末尾に「例：」注記を置いた
- `transform` で回転した span 5枚（5段階の濃淡）を、1枚のSVGのダイヤ5枚（頂点だけアクセント塗り・残りは淡い地に罫線色の1px枠）に描き直した（塗りは1枚に1つ）
- 丸バッジ2つの軸を、1pxの細線＋SVG三角12pxの矢じり＋英字KICKER（ABSTRACT / CONCRETE）に変え、段のラベルを KICKER `LAYER n`＋名前16px/700 の型にして、左右余白48px・字間.06em・インク色にそろえた
