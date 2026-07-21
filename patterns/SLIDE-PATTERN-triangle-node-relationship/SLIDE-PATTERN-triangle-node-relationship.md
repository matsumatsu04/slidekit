# SLIDE-PATTERN-triangle-node-relationship

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** triangle-node-relationship
**概要：** 円形ノード3つを三角形の頂点（上に1つ・下に2つ）に配置し、直線3本で結んで三角関係を表現するレイアウト。中央に3要素を統合するラベルを置く。
**適したシーン：** 3者・3要素間の相互関係の説明、三位一体の構造、3つの立場・視点のバランスの提示

## Structure（構造）

コンテンツエリア中央に、円形ノードを三角形の頂点位置（上1個・下2個）に配置し、頂点同士を直線3本（三角形の辺）で結ぶ。各円の内部に要素名を表示し、三角形の中央（重心付近）に3要素を統合するラベルを配置する。

    structure:
      layout: triangle-node-relationship
      nodes: 3 (circles, placed at triangle vertices: top-1, bottom-2)
      connectors:
        type: 3 straight lines (triangle edges, connecting each pair of nodes)
      center-label:
        position: centroid of the 3 nodes
        style: on top of the connectors, background box for legibility

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 上ノード | 三角形の頂点（上） | 1つ目の要素・立場を表す |
| 左下ノード・右下ノード | 三角形の頂点（下2つ） | 2つ目・3つ目の要素・立場を表す |
| 接続線（3本） | 各ノード間 | 3要素が互いに関係し合っていることを示す |
| 統合ラベル | 三角形の中央 | 3要素の相互関係から生まれる概念・結論を強調表示する |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-triangle-node-relationshipのレイアウトで、上ノード「[要素A]」、左下ノード「[要素B]」、右下ノード「[要素C]」、中央の統合ラベルに「[3者の関係から生まれるもの]」を入れてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- ノードは3つ固定。4つ以上の関係性を表現したい場合はこのパターンでは表現しない（four-quadrant-center-circle等を検討）。
- 各ノード内のテキストは短く（10字以内目安）。円のサイズに収まる分量にする。
- 中央の統合ラベルは、背景に白系のボックスを敷いて接続線より前面に出し、可読性を確保する。
- 3つのノードは対等な関係として扱う。上下の配置は視覚上のバランスのためであり、上のノードが優位という意味は持たせない。
