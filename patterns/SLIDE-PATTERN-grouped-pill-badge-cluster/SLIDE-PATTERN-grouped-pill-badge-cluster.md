# SLIDE-PATTERN-grouped-pill-badge-cluster

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** grouped-pill-badge-cluster
**概要：** 2つのカテゴリ見出しを左右に並べ、それぞれの見出し配下に角丸ピル型バッジ（テキストタグ）を折り返しグリッド状に敷き詰めるレイアウト。左右のグループで項目数が異なってもよい。
**適したシーン：** スキル・キーワード・対応領域の列挙、タグの棚卸し、2カテゴリでの用語整理、募集要項の「必須／歓迎」条件の提示

## Structure（構造）

コンテンツエリアを縦の区切り線で左右2グループに分割する。各グループは上に見出し（下線つき）、その下にピルバッジをflex-wrapで折り返し敷き詰める。ピルの個数はグループごとに可変（多い方は6個程度、少ない方は4個程度を目安）。

    structure:
      layout: two-group-pill-cluster
      groups: 2 (left / right, divider between)
      group:
        heading: text + bottom-border
        pill-wrap:
          type: flex-wrap grid
          pill:
            shape: rounded-pill (border-radius: 999px)
            content: short-text
            count: variable (example: 6 / 4)

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| グループ見出し | 各グループ上部 | カテゴリ名を示す。下線で本文と区切る |
| 区切り線 | 2グループの間 | 左右のカテゴリを視覚的に分離する縦線 |
| ピルバッジ | 見出し下・折り返しグリッド | 個別のキーワード・タグ・項目を短いテキストで表示 |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-grouped-pill-badge-clusterのレイアウトで、左グループ見出し「[カテゴリA]」に[項目1〜6]、右グループ見出し「[カテゴリB]」に[項目1〜4]をピルバッジで並べてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- ピルのテキストは短く（8字以内目安）。長い文章を入れると折り返しが崩れる原因になる。
- 1グループあたりの推奨個数は4〜8個。10個を超える場合はcolumn-stacked-tag-list（列型）への切り替えを検討する。
- 左右の項目数が大きく異なっても崩れないのがこのパターンの強み。無理に個数を揃える必要はない。
- グループは左右2つまで。3グループ以上必要な場合はcolumn-stacked-tag-listを使う。
