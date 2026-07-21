# SLIDE-PATTERN-concept-formula-three-box

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** concept-formula-three-box
**概要：** アイコン枠付きの角丸矩形ボックス3つを、間に小さな円形の演算子（×・＝）を挟んで横一列に並べ、「A × B ＝ C」という数式のようにコンセプトの構成関係を表現するレイアウト。結果を表す最後のボックスだけ枠を強調する。
**適したシーン：** 2つの要素の掛け合わせで生まれる価値の説明、成功の方程式、コンセプト・ロジックの構造化提示

## Structure（構造）

コンテンツエリア中央に、ボックス・演算子・ボックス・演算子・ボックスの順で5要素を横一列に並べる。各ボックスはアイコン枠と見出しテキストを縦に配置する。最後のボックス（結果）だけ枠線を太く・濃くして強調する。

    structure:
      layout: concept-formula-three-box
      sequence: [box-a, operator(x), box-b, operator(=), box-c]
      box:
        shape: rounded-rectangle
        elements: [icon-frame (circle placeholder), label]
      box-c (result):
        emphasis: thicker/darker border than box-a and box-b
      operator:
        shape: small circle
        content: "×" or "＝"

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| ボックスA・ボックスB | 左・中央 | 掛け合わせる2つの要素・条件を表す |
| 演算子（×） | ボックスAとBの間 | 2要素が掛け合わさる関係を示す |
| ボックスC（結果） | 右端・強調 | AとBの掛け合わせで生まれる結果・価値を表す主役 |
| 演算子（＝） | ボックスBとCの間 | 掛け合わせの結果であることを示す |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-concept-formula-three-boxのレイアウトで、要素A「[要素A]」× 要素B「[要素B]」＝ 結果C「[結果C]」の構図で作成してください。結果Cの枠を強調してください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 強調するのは結果ボックス（C）1箇所のみにする。3箇所すべてを強調すると主役が埋もれる（強調は1〜2箇所までのルールに従う）。
- 各ボックスの見出しは短く（10字以内目安）。数式の見た目を保つため長文は入れない。
- 演算子は「×」「＝」以外にも「＋」「→」などに置き換え可能。ただし式全体で意味が通る組み合わせにする。
- ボックスは3つ固定。4つ以上の掛け合わせを表現したい場合は別パターン（numbered-list-with-body等）を検討する。
