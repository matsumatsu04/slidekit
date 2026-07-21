# SLIDE-PATTERN-executive-summary-banner-stack

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** executive-summary-banner-stack
**概要：** 横長のバナー行を3本縦に積み上げたエグゼクティブサマリー。各行の左端にカテゴリタグ、右側に太字見出しと1行補足を配置する。
**適したシーン：** 経営層向けのエグゼクティブサマリー・報告書冒頭の要点整理・実績/課題/展望など性質の異なる3項目の並列提示

## Structure（構造）

```yaml
layout: executive-summary-banner-stack
content_area:
  display: flex
  flex-direction: column
  justify-content: center
  padding: "40px 64px"
  gap: 16px

banner_rows:
  count: 3
  each:
    display: flex
    align-items: center
    gap: 20px
    padding: "20px 24px"
    background: soft面（カテゴリタグより淡い面）

each_banner_structure:
  - category_tag:
      position: "行の左端"
      shape: "角丸小矩形・固定幅"
      content: "カテゴリ名（短いラベル）"
  - text_block:
      position: "タグの右側・縦積み"
      heading:
        font_weight: bold
        content: "見出し（結論）"
      body:
        font_size: small
        color: muted
        content: "1行の補足テキスト"
```

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| バナー行 | コンテンツエリアに縦3本積み | 1項目分の情報のまとまりを面で区切って示す |
| カテゴリタグ | 各バナー行の左端 | その行が何に関する情報かを一目で分類する |
| 見出し | タグの右・上段 | その項目の結論・要点を1文で伝える |
| 補足テキスト | 見出しの直下・1行 | 見出しを補う根拠や詳細を簡潔に添える |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-executive-summary-banner-stackのレイアウトで、以下3項目をバナー行形式でまとめてください。デザインはSLIDE.mdに従ってください。
>
> 【行1】タグ: 実績 / 見出し: 売上は前年比で二桁成長を達成 / 補足: 主要施策の効果で全事業セグメントが増収した
> 【行2】タグ: 課題 / 見出し: 新規顧客獲得のコストが上昇傾向 / 補足: 獲得チャネルの見直しと単価改善が急務
> 【行3】タグ: 展望 / 見出し: 次期は新市場開拓に経営資源を集中 / 補足: 早期の投資回収を見込み優先度を引き上げる」

**注意点：**
- カテゴリタグは2〜4文字程度の短い分類名に揃え、3行間で文字数の差を出しすぎない
- 見出しは1文・体言止めか短文で統一し、補足テキストは1行に収まる長さに絞る
- 4項目以上に増やしたい場合は行の高さが窮屈になるため、本パターンではなく別パターン（リスト形式）を検討する
- 3行は重要度順または時系列順など、一貫した並び順で構成する
