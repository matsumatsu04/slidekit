# SLIDE-PATTERN-sitemap-tree-3level

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** sitemap-tree-3level
**概要：** サイト構成（サイトマップ）を横方向のツリーで表現するレイアウト。左に「TOP」ノードを1個、中央に第2階層ノードを3〜4個縦積み、右に第3階層ノード（代表のみ）を配置し、矩形と直角の接続線だけでつなぐ。
**適したシーン：** Web制作の提案・納品資料でのサイト全体構造の説明、下層ページを含むサイト規模感の共有

## Structure（構造）

コンテンツエリアを左→右の3段（TOP／第2階層／第3階層）に分ける。左端にTOPノード（矩形）を垂直中央に置き、短い水平線で縦バス線（垂直の直線1本）に接続する。縦バス線から各第2階層ノードへ短い水平線を伸ばす。第3階層を持つ第2階層ノードだけ、右へ短い水平線でつなぎ代表の第3階層ノードを置く。接続線はすべて水平・垂直の直線のみ（斜め線・曲線は使わない）。

    structure:
      layout: horizontal-tree (left to right)
      levels: 3
      level-1:
        nodes: 1 ("TOP", rectangle, vertically centered)
      connector:
        type: right-angle lines only (horizontal stub + vertical bus)
      level-2:
        nodes: 3-4 (rectangles, stacked vertically, equal size)
        each: [page-name (bold), short-note (optional)]
      level-3:
        nodes: representative only (0-1 per level-2 node)
        each: [page-name, count-note (optional, e.g. "ほか3ページ")]
      constraint: total nodes <= 10

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| TOPノード | 左端・垂直中央の矩形 | サイトの起点（トップページ）。第2階層より一段強い見た目にする |
| 縦バス線 | TOPノードの右 | TOPと全第2階層ノードをつなぐ垂直線1本 |
| 水平コネクタ | 各ノードの左右 | ノードとバス線・親子ノード間をつなぐ短い水平線 |
| 第2階層ノード | 中央・縦積みの矩形 | 主要ページ（サービス・会社概要・お問い合わせなど） |
| 第3階層ノード | 右・該当行のみ | 下層ページの代表例。「ほか◯ページ」の省略表記を併用できる |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-sitemap-tree-3level のレイアウトで、TOP → [第2階層ページ3〜4個] → [下層ページの代表] のサイトマップを作成してください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- **ノード数は合計10個まで**（TOP1＋第2階層3〜4＋第3階層は代表のみ）。超える場合は第3階層を「ほか◯ページ」に省略するか、sitemap-indent-list（全ページを行で列挙）に切り替える。
- 第3階層は「持つ行だけ」に付ける。全行に無理に付けない。
- 接続線は水平・垂直の直角線のみ。斜め線・曲線・矢印は使わない。
- ノードは矩形のみ（角丸可）。アイコン・イラストは入れない。
- 第2階層ノードは同一サイズで縦に等間隔に揃える。
