# SLIDE-PATTERN-venn-diagram-three-circle

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** venn-diagram-three-circle
**概要：** 半透明の円を3つ三角状に重ねて配置し、各円にラベルを添え、中央の重なり部分に統合ラベル（3要素が交わることで生まれる概念）を配置するベン図レイアウト。
**適したシーン：** 3要素の重なり・共通部分の説明、3つの強み・条件が揃うことの意義の提示、コンセプトの構成要素の整理

## Structure（構造）

コンテンツエリア中央に、半透明の円3つを三角形の頂点位置（上左・上右・下中央）に重ねて配置する。各円は自身の領域にラベルを持ち、3円が重なる中央部分には統合ラベルを最前面に配置する。

    structure:
      layout: venn-diagram-three-circle
      circles: 3
      circle:
        shape: circle, semi-transparent fill
        arrangement: triangular (top-left, top-right, bottom-center), overlapping
        label: 1 per circle, placed in the circle's own (non-overlap) area
      center-label:
        position: centroid of the 3 circles (overlap area)
        style: on top of all circles (highest z-index), background box for legibility

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 円A・円B・円C | 三角状に重ねて配置 | それぞれが1つの要素・条件・カテゴリを表す |
| 各円のラベル | 各円の非重複エリア | その円が何を表すかを短く示す |
| 統合ラベル | 3円の重なり中央 | 3要素が交わることで生まれる概念・結論を強調表示する |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-venn-diagram-three-circleのレイアウトで、円A「[要素A]」、円B「[要素B]」、円C「[要素C]」、中央の統合ラベルに「[3要素が重なって生まれるもの]」を入れてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 円は3つまで。4つ以上にすると重なりが複雑になり読み取れなくなる（このパターンは3円専用）。
- 各円のラベルは短く（10字以内目安）。長文は重なり部分に干渉して読みにくくなる。
- 中央の統合ラベルは、背景に白系のボックスを敷いて重なりの塗りより前面に出し、可読性を確保する。
- 3円の重なり具合（面積比）はデザイン上の演出であり、正確な統計的比率を表すものではない旨を必要に応じて注記する。
