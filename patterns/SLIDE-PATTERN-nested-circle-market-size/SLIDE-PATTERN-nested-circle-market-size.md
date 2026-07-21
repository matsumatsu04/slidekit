# SLIDE-PATTERN-nested-circle-market-size

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** nested-circle-market-size
**概要：** 大・中・小の円を下端（底辺）を揃えて重ねて配置し、各円から右へ引き出し線を伸ばして、円名とその規模（金額等）のラベルを添えるレイアウト。市場規模の階層（全体市場／獲得可能市場／自社シェアなど）を視覚化する。
**適したシーン：** 市場規模（TAM/SAM/SOM相当）の説明、対象範囲の絞り込みの提示、全体と部分集合の規模比較

## Structure（構造）

コンテンツエリア左側に、大・中・小3つの円を中心のx座標を揃えたまま下端（底辺）だけを一致させて重ねて配置する。各円の右上寄りの位置から水平の引き出し線を伸ばし、右側の列に円名（見出し）と規模（金額プレースホルダー）のラベルを配置する。

    structure:
      layout: nested-circle-market-size
      circles: 3 (large, medium, small)
      circle:
        alignment: same horizontal center, bottom edges flush (nested arch look)
        size: large > medium > small
      lead-line:
        count: 3 (1 per circle)
        position: from a point on the upper-right of each circle, extending right
      label:
        count: 3 (1 per circle)
        content: [title (market tier name), amount (placeholder)]

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 大円 | 最背面・最大 | 最も広い範囲（全体市場など）を表す |
| 中円 | 大円の内側・中間サイズ | 大円より絞り込んだ範囲（獲得可能市場など）を表す |
| 小円 | 最前面・最小 | さらに絞り込んだ範囲（自社シェアなど）を表す |
| 引き出し線 | 各円から右へ | 円とラベルの対応関係を示す |
| ラベル（見出し＋金額） | 右側の列 | 各円が表す範囲の名称と規模を文字で補足する |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-nested-circle-market-sizeのレイアウトで、大円「[全体市場]」・中円「[獲得可能市場]」・小円「[自社シェア]」に、それぞれの想定金額を添えてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 円は3つ固定（大・中・小）。4段階以上に分けたい場合はこのパターンでは表現しない。
- 円の面積比は視覚的な演出であり、正確な統計比率ではない旨を必要に応じて注記する。
- ラベルの金額・数値は概算であることが伝わる表現（「約」「想定」等）を添えるとよい。
- 円の色は大→小で徐々に濃くする（小さいほど焦点が絞られていることを示す）。
