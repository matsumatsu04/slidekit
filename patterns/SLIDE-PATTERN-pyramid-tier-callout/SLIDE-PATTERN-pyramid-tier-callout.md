# SLIDE-PATTERN-pyramid-tier-callout

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** pyramid-tier-callout
**概要：** 左側に3段の台形を積み重ねたピラミッド図を配置し、各段から右へ細い接続線を伸ばして、右側の説明ボックス（各段1個・計3個）とペアにするレイアウト。
**適したシーン：** 階層構造・ランクの説明（上位層ほど希少・重要な構造）、顧客層のセグメント説明、成熟度・レベル分けの提示

## Structure（構造）

コンテンツエリアを左（ピラミッド）・中央（接続線）・右（説明ボックス）の3列グリッドとして扱う。ピラミッドは3段の台形を隙間なく積み重ね、上段ほど幅が狭くなる。各段の中央の高さから右へ接続線を伸ばし、同じ高さに説明ボックスを1個配置する。

    structure:
      layout: pyramid-tier-callout (3-column grid: pyramid / connector / callout)
      pyramid:
        tiers: 3 (stacked trapezoids, narrow at top, wide at bottom)
        shape: clip-path polygon trapezoid, right edge flush (for connector alignment)
      connector:
        type: thin horizontal line, 1 per tier
      callout:
        count: 3 (1 per tier, vertically aligned with each tier's center)
        content: [heading, short-body]

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| ピラミッド（3段の台形） | コンテンツエリア左 | 階層構造・ランクを上から下へ視覚的に表現する |
| 段名ラベル | 各段の内部 | その段が何を表すかを短く示す |
| 接続線 | ピラミッドと説明ボックスの間 | どの段とどの説明が対応するかを結びつける |
| 説明ボックス | コンテンツエリア右・3個 | 各段の詳細説明を担当する |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-pyramid-tier-calloutのレイアウトで、上から[第1層/第2層/第3層]の名称と、それぞれの説明ボックスに[見出しと説明文]を入れてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 段数は3段を基本とする。4段以上にすると各説明ボックスの高さが窮屈になる。
- 上段ほど「希少・重要・少数」、下段ほど「基礎・多数」を表すのが一般的な読み方。逆の意味で使う場合は誤解を招くため避ける。
- **上下を反転させれば、そのままファネル（コンバージョン漏斗：上が広く下が狭い形）としても使える。** 見込み客数の絞り込みなど、逆の意味構造を表現したい場合は反転して使う。
- 各説明ボックスの文章量は段ごとにできるだけ揃える。
