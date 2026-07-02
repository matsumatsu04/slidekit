# SLIDEKIT-DESIGN — dark-tech

## Meta
- **name:** dark-tech
- **summary:** 黒地×白文字×鮮やかな青紫1色の、Linear / Vercel 系プロダクト発表風ダークテーマ。スクリーン映え重視
- **best-for:** 発表会・テック系セミナー・YouTube収録・プロダクトデモ
- **mood:** モダン / シャープ / ミニマル / スクリーン映え
- **reference:** Linear / Vercel のプロダクト発表・キーノート（暗い地に要点だけを大きく、装飾はフラットに絞る）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #6E8BFF | 主要な強調・見出し下線・カード見出しの短線 |
| Secondary | --color-secondary | #7A8494 | 補助情報・キャプション（Muted と共用） |
| Accent | --color-accent | #6E8BFF | アクセントバー/罫線、ラベル文字、KPI数字（鮮やかな1色はこれのみ） |
| Background | --color-bg | #0E1116 | スライド地色 |
| Surface | --color-surface | #1A2029 | カード・囲みの面、セクション中扉の地（枠線は #2A3140） |
| Soft | --color-soft | #232B3A | 背景の大きな装飾図形（面には使わない） |
| Text | --color-text | #E6E9EE | 本文すべて |
| Text Muted | --color-text-muted | #7A8494 | 補足・キャプション・ページ番号 |

> 罫線・カード枠線は **#2A3140** で統一する。

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | Noto Sans JP | 44px | Black (900) | 1.2 |
| H2（共通見出し） | Noto Sans JP | 24px | Bold | 1.25 |
| メッセージライン | Noto Sans JP | 16px | Regular | 1.5 |
| 本文 | Noto Sans JP | 17px | Regular | 1.6 |
| キャプション | Noto Sans JP | 13px | Regular | 1.5 |

> 見出しは太め（700〜900）でシャープに。フォントはすべて Noto Sans JP（Google Fonts）。

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 64px（全幅の5%）
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** 共通見出しデザインA（タイトル24px太字・Text色＋全幅下線。下線はアクセント色 2px・左右40px余白）。
  **見出しの下にメッセージライン（このスライドの結論1行・16px・Text色）を置く**（アクションタイトル）。
- **page-number:** 右下に "n / N" を muted で
- **footer:** なし（ミニマル）

> ロゴ枠は既定では設けない。

## Treatments（装飾の流儀）
- **フラットに徹する:** 影・グラデーションは使わない（表紙の装飾図形に、ごく薄いアクセント光彩を1つまで置いてよい）
- **強調は1スライド1〜2箇所まで:** アクセント色の文字 or 線に絞る。それ以外の文字は Text色（#E6E9EE）
- カード・囲みは **Surface面（#1A2029）＋細枠（#2A3140・1px）**。塗りつぶし強調カードは使わない
- 大きな数字（KPI）のみアクセント色で大きく。単位・ラベルは Text / Muted
- 背景装飾は **使わない or Soft（#232B3A）の図形1つまで**（暗い地の静けさを保つ）
- 区切りは #2A3140 の細罫線

## Do / Don't
- ✅ 黒地に要点だけを大きく置く（スクリーン・録画で映える密度に絞る）
- ✅ 鮮やかな色はアクセント1色（#6E8BFF）だけ。強調は1スライド1〜2箇所
- ✅ 余白を恐れない（詰めるより削る）
- ❌ 2色目の鮮やかな色を足す／強調を3箇所以上置く
- ❌ 影・グラデーション・光彩で飾る（表紙の光彩1つを除く）
- ❌ 白背景の要素を混ぜる（コントラストが暴れて暗黒地の統一感が崩れる）

## pptx theme（tools/pptx/build-pptx.mjs 用）
```json
{ "accent":"6E8BFF", "soft":"232B3A", "text":"E6E9EE", "muted":"7A8494", "bg":"0E1116", "surface":"1A2029", "font":"Noto Sans JP" }
```
