---
name: section-geo-texture-left
category: セクション
summary: 紙質感の幾何テクスチャ背景の左に、左80pxから「英字KICKER（SECTION 02・accent2）→ 章タイトル（32px・700・インク色）→ 64pxの砂色罫線 → 補足1行」を縦積みして上下中央に置く上品な中扉。背景は画像アセット（色ティント対象外）
scenes: 上品・堅実なトーンのデッキの章区切り。表紙 cover-geo-texture-left と揃えて使うと統一感が出る
tier: high
id: P107
---
# SLIDE-PATTERN-section-geo-texture-left

このファイルはコンテンツエリアのレイアウト定義です。背景に画像アセット（`assets/covers/`）を使い、テキストはHTMLとして画像の上に載せます。
中扉は共通見出し（`sk-head`）を付けない種類のスライドです（表紙・目次と同じ扱い）。
ワードマーク・©・頁番号などのフッターはHTMLデッキビルダー（フレーム v2）が描くため、このファイルには含みません。

## Overview
**パターン名：** section-geo-texture-left
**概要：** 紙質感×幾何学の装飾背景（四隅に金・青の図形、中央左は白場）の左に、左80pxの文字ブロックを上下中央で置く中扉。ブロックは「英字KICKER『SECTION 02』（10px・accent2）→ 章タイトル（32px・700・インク色・1〜2行）→ 64px×1pxの砂色罫線（#CCC6BA）→ 補足1行（16px・muted）」の縦積み。塗りは足さず、背景の白場をそのまま余白として使う。
**適したシーン：** 上品・堅実なトーンのデッキの章区切り。同じ背景の表紙 cover-geo-texture-left と組で使う。

## Structure（構造）
```yaml
layout: section-geo-texture-left
background:                        # 画像背景系。色ティントの対象外（画像は差し替えのみ）
  image: url(/assets/covers/cover-bg-geometric-paper.jpg)   # center/cover・全面
text-block:                        # left 80px・top 50% の上下中央・max-width 560px・左ぞろえ
  kicker: "SECTION 02"             # 10px / 700 / 字間 .2em / 大文字 / 行間 1 / var(--sk-accent2)
  title:  章タイトル                # 32px / 700 / 字間 .06em / 行間 1.35 / var(--sk-ink)。1〜2行。上に 20px
  rule:   64px × 1px               # #CCC6BA（背景の砂色に合わせた固有色）。上 24px・下 20px。唯一の装飾
  sub:    補足1行                   # 16px / 400 / 行間 1.8 / var(--sk-muted)。省略可
```

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| 背景 | 全面 | 紙質感×幾何学の装飾素材（`/assets/covers/cover-bg-geometric-paper.jpg`）。他アセットに差し替え可 |
| KICKER | 文字ブロック最上段 | 章番号を英字ラベルで示す（`SECTION 02`）。差し色 accent2 でパレットを1点だけ効かせる |
| 章タイトル | KICKERの下 | 章の内容を1〜2行で言い切る。32px・700・インク色 |
| 砂色罫線 | タイトルと補足の間 | 64px×1px。背景の金・砂色と同系にして、画像と文字をつなぐ唯一の装飾 |
| 補足 | 罫線の下 | この章で扱うことを1行で補う（省略時は罫線も外してよい） |

## Usage Guide（AIへの使い方）
### プロンプト例
```
SLIDE-PATTERN-section-geo-texture-left を使って中扉を1枚生成してください。
【KICKER】SECTION 02
【章タイトル】制作から公開までの／工程と担当の分け方
【補足】工程ごとに担当と締切を置き、待ちの時間を短くする
```
### 注意点
- 文字は左の白場（max-width 560px）に収める。右上の金の円・右下の三角形など四隅の装飾に被せない
- 章番号は英字KICKERで持つ（`SECTION 02`）。2桁ゼロ埋め（01, 02…）を推奨。大きな数字を別に置かない
- 章タイトルは32pxで2行まで（1行あたり全角12文字程度）。2行にするときは `<br>` を意味の切れ目に入れる。標語調にしない
- 罫線の #CCC6BA は背景の砂色に合わせた固有色。背景を別の画像に差し替えたときは、その画像の中間色に合わせて置き換える
- 背景に画像を焼き込むため、ギャラリーの色ティント（パレット）が乗るのは KICKER の accent2 だけ
- 同じトーンの表紙は cover-geo-texture-left。パレット全体を見せたい章区切りは section-divider / section-band-middle へ

## v2 での描き直し（2026-09-04）
- 88px の特大章番号（#CCC6BA）を外し、章番号を 10px・字間 .2em の英字KICKER（accent2）に組み替えた（中扉4種で番号の扱いを統一）
- 章タイトルを 30px から 32px/700・行間1.35・インク色にし、3px の濃色区切り線を「タイトル下の 64px×1px 砂色罫線」に変えて補足1行（16px・muted）を足した
- 文字ブロックの起点を左72pxから左80pxに揃え、太さを 400/700 の2つに絞って中扉4種（P099・P106〜P108）で組みを共通化した
