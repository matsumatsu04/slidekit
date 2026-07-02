# SLIDE-PATTERN-sitemap-indent-list

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** sitemap-indent-list
**概要：** サイト構成（サイトマップ）を「インデントされた帯行リスト」で表現するレイアウト。最上部に「TOP」ノード（帯行）を置き、その下に第2階層のページをインデント＋左の縦ガイド線つきで縦積みし、各行の右端に補足（ページ数・内容）を添える。ツリー図を描かず帯行の積み上げで階層を示すため崩れない。
**適したシーン：** Web制作の提案・納品資料でのサイト構成説明、ページ構成の合意形成、見積の前提となるページ一覧の提示

## Structure（構造）

コンテンツエリア最上部に全幅の「TOP」帯行を置き、その下をインデント（左に一定の字下げ）して第2階層の帯行を縦に積む（最大6行）。インデント部の左端に縦ガイド線を1本通し、各行と縦ガイド線を短い水平コネクタで接続して親子関係を示す。各帯行は「ページ名（太字）＋内容の短い説明」を左に、補足（ページ数など）を右端に配置する。

    structure:
      layout: indented-band-list
      top-node:
        type: band-row (full width)
        elements: [label "TOP", page-name, supplement-right]
      children:
        indent: fixed left offset from top-node
        guide: vertical-line at indent left edge
        rows: 3-6
        row:
          connector: short horizontal line from guide
          left: [page-name (bold), short-description]
          right: [supplement (page-count or note)]
      divider: none (band background separates rows)

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| TOPノード | 最上部・全幅の帯行 | サイトのトップページを示す起点。第2階層より一段強い見た目にする |
| 縦ガイド線 | インデント部の左端 | TOPと第2階層の親子関係を1本の線で示す |
| 水平コネクタ | 各行の左・ガイド線から | 各ページが縦ガイド線（＝TOP配下）に属することを示す |
| ページ名 | 各帯行の左・太字 | 第2階層の各ページ名（サービス紹介・会社概要など） |
| 説明 | ページ名の右または下 | そのページに載る内容の短い補足（1行以内） |
| 補足（右端） | 各帯行の右端 | ページ数・備考など（例：「1ページ」「フォーム含む」） |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-sitemap-indent-list のレイアウトで、TOPページの下に [ページ1]・[ページ2]・[ページ3]… を並べ、各行に内容の説明とページ数を入れてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 第2階層は最大6行まで。7ページ以上ある場合は行を統合するか、スライドを分ける。
- 第3階層まで見せたい場合はこのパターンではなく sitemap-tree-3level を使う。
- 帯行の背景は薄い面（soft）、TOPノードだけ一段強く（塗りまたは太枠）して起点を明確にする。
- 補足（右端）は全行で書式を揃える（「nページ」など）。不要な行は空欄でよい。
- ツリーの線は「縦ガイド線1本＋短い水平コネクタ」だけに抑える。斜め線・曲線は使わない。
