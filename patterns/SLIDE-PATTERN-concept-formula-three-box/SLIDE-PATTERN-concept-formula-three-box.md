---
name: concept-formula-three-box
category: 図解・ダイアグラム
summary: 淡い地の箱2つ（KICKER／見出し18px／1行説明）を「＋」でつなぎ、「＝」の右にアクセント塗り・白文字の結果の箱を置く「A ＋ B ＝ C」の数式図。箱は等高・角丸11px、演算子は24px・muted。塗りはCだけ。
scenes: ビジネスモデル・価値の定義・料金構造の説明に
tier: high
id: P084
---
# SLIDE-PATTERN-concept-formula-three-box

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** concept-formula-three-box
**概要：** 淡い地の箱2つ（KICKER／見出し18px／1行説明）を「＋」でつなぎ、「＝」の右にアクセント塗り・白文字の結果の箱を置く「A ＋ B ＝ C」の数式図。箱は等高・角丸11px、演算子は24px・muted。塗りはCだけ。
**適したシーン：** 2つの要素の組み合わせで生まれる価値の説明、成功の方程式、コンセプト・ロジックの構造化提示

## Structure（構造）

コンテンツエリア（左右余白48px）の上下中央に、高さ160pxの行を1つ置き、「箱A → 演算子（＋）→ 箱B → 演算子（＝）→ 箱C」の5要素を横一列に並べる。箱は等幅・等高で、中身は v2 の型（KICKER／見出し／1行説明）。A・Bは淡い地、Cだけアクセント塗り（白文字）。演算子は幅48pxの列の中央に文字で置く（円や枠で囲まない）。

    structure:
      layout: concept-formula-three-box
      content_area:
        padding: "24px 48px"
        vertical_align: center      # 見出しON時は上76px以降の上下中央
      row:
        display: flex
        height: 160px               # 3箱は等高
      sequence: [box-a, operator(+), box-b, operator(=), box-c]
      box:
        border_radius: 11px
        padding: "20px 24px"
        elements:
          - kicker: "ELEMENT A ／ 補足"    # 10px / 700 / .18em（塗りの箱内は白）
          - heading                        # 18px / 700（8文字以内）
          - description: 1 line            # 16px / 400 / 行間1.8（12文字以内）
        surfaces:
          a_b: soft                        # 淡い地 + 1px 罫線
          c: accent_fill                   # 結果だけ塗り・白文字（塗りは1枚に1つ）
      operator:
        width: 48px
        glyph: "＋" / "＝"                 # 24px / 400 / muted。列の中央
        shape: none                        # 円・枠で囲まない

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 箱A・箱B | 左・中央 | 組み合わせる2つの要素。KICKER（`ELEMENT A ／ 補足`）・見出し・1行説明の型 |
| 演算子（＋） | 箱AとBの間 | 2要素を組み合わせる関係を示す（24px・muted） |
| 演算子（＝） | 箱BとCの間 | 組み合わせの結果であることを示す（24px・muted） |
| 箱C（結果） | 右端 | AとBの組み合わせで生まれる結果・価値。KICKER は `RESULT`。1枚のスライドで塗りはここだけ |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-concept-formula-three-boxのレイアウトで、要素A「[要素A]」＋ 要素B「[要素B]」＝ 結果C「[結果C]」の式で作成してください。各箱は KICKER・見出し（8文字以内）・1行説明（12文字以内）の順で書き、結果Cだけ塗ってください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 塗りは結果の箱（C）1つだけ。A・Bや演算子に塗り・枠の強調を足さない
- 見出しは8文字以内、説明は12文字以内で1行。入らなければ文言を短くする（文字を小さくしない。2行になっても箱には収まるが、3箱で行数を揃える）
- 演算子は「＋」「＝」が基本。「×」「→」に置き換えてもよいが、式全体で意味が通る組み合わせにする
- 箱は3つ固定。4つ以上の組み合わせは枚数を分けるか、numbered-list-with-body 等を検討する
- 旧版の「アイコン枠（点線の円）・円形の演算子・結果の太枠」は廃止。文字と淡い地・塗りだけで組む

## v2 での描き直し（2026-09-02）
- 正方形の枠線ボックス（点線の円アイコン枠＋ラベル）を、淡い地の等高の箱（KICKER／見出し18px／1行説明・角丸11px）に変え、結果Cだけアクセント塗り・白文字にした（塗りは1枚に1つ）
- 円で囲んだ演算子（×・＝）を、囲みの無い文字（＋・＝、24px・400・muted）にした
- 文字を v2 の表に揃えた（KICKER 10px・見出し18px・本文16px、太さ400/700のみ、インク色・palt・禁則）
