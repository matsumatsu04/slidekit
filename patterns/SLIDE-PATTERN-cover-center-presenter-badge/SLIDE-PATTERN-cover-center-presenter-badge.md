# SLIDE-PATTERN-cover-center-presenter-badge

このファイルはスライドのレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。これはスライド全体を使うカバーレイアウトで、ページ番号や装飾の色はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** cover-center-presenter-badge
**概要：** メインタイトルを中央に大きく置き、左上に宛名（お客様名）ラベル、タイトル下に英文サブタイトル、右下に発表者名の塗りバッジを配置した提案書向けカバーレイアウト。背景は左上のハーフトーン（ドット）と下部のウェーブで上品に装飾する。
**適したシーン：** 提案書・営業資料の表紙、見積/企画の提出資料、クライアント宛のプレゼン表紙。

## Structure（構造）

スライド全体を使うカバーレイアウト。明るい地色に控えめな装飾グラフィックを敷き、中央にタイトルと英文サブタイトルを縦に積む。左上に宛名ラベル、右下に発表者バッジを置いて「誰から誰への提案か」を一目で示す。通常、SLIDE.mdのSlide Frameのタイトルエリアは無効化し、カバー専用に扱う。

    structure:
      layout: full-slide-cover
      background:
        type: decorative-graphic
        upper-left: halftone-dots (薄いドットテクスチャ)
        lower: wave-ribbon (なめらかな曲線の帯)
      top-left:
        - client-label (small)        # 宛名（お客様名）
      center:
        elements:
          - main-title (large, bold, 1-2 lines, centered)
          - english-subtitle (small, letter-spaced, em-dash flanked, centered)
      bottom-right:
        - presenter-badge (filled box + light text)

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 宛名ラベル | 左上 | 提案先の社名・宛名（例：「（お客様名）御中」）を小さく表示 |
| メインタイトル | 中央（大・太・1〜2行） | 提案の主題を大きく表示 |
| 英文サブタイトル | タイトル直下（中央・字間広め・両端にem-dash） | 英語の補助タイトルで体裁を引き締める |
| 発表者バッジ | 右下（塗りボックス＋反転文字） | 発表者名または提案元の会社名 |
| 背景装飾 | 左上にハーフトーン、下部にウェーブ | 余白を整え、提案書らしい上品な印象を与える |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-cover-center-presenter-badge のレイアウトで、宛名「（お客様名）」、メインタイトル「[タイトル]」、英文サブタイトル「[ENGLISH SUBTITLE]」、発表者「[氏名]」のカバースライドを作成してください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- メインタイトルは2行以内に収めると洗練される。3行になる場合は語句を短くする。
- 英文サブタイトルは大文字・字間広めにし、両端をem-dash（—）で挟むと締まる。
- 発表者バッジは1要素（1名または1社名）に絞る。塗り色はSLIDE.mdのブランドカラー（濃色）を使う。
- 背景装飾は主役の文字より目立たせない。色味はSLIDE.mdのブランドカラーの淡色／モノトーンを参照。
- ページ番号・ロゴはSLIDE.mdのSlide Frame側で扱う（このパターンには書かない）。
