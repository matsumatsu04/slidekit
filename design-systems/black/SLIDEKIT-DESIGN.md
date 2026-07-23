# SLIDEKIT-DESIGN — black

## Meta
- **name:** black
- **summary:** 黒×白のモノトーンをストイックに使うタイポグラフィ主役のデザイン。デザイン会社・ポートフォリオ・ブランド資料向け
- **best-for:** デザイン会社の会社紹介／ポートフォリオ／ブランドブック／クリエイティブ系の提案
- **mood:** ストイック / スタイリッシュ / 余白極大 / タイポ主役
- **reference:** original（スライドギャラリーの近年の定番配色を参考に新規作成）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #111111 | 主要な強調・見出し下線・章扉の地 |
| Secondary | --color-secondary | #555555 | 補助の強調・グラフの第2系列 |
| Accent | --color-accent | #111111 | アクセントバー/罫線、バッジの塗り、KPI数字、カード枠線 |
| Background | --color-bg | #FFFFFF | スライド地色 |
| Surface | --color-surface | #F2F2F2 | カード・囲みの淡い面、背景の装飾図形 |
| Text | --color-text | #333333 | 本文すべて |
| Text Muted | --color-text-muted | #8A8F98 | 補足・キャプション・ページ番号 |

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | Noto Sans JP | 44px | Bold | 1.2 |
| H2（共通見出し） | Noto Sans JP | 24px | Bold | 1.25 |
| メッセージライン | Noto Sans JP | 16px | Regular | 1.5 |
| 本文 | Noto Sans JP | 17px | Regular | 1.6 |
| キャプション | Noto Sans JP | 13px | Regular | 1.5 |

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 64px（全幅の5%）
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** 共通見出しデザインA（タイトル24px太字＋全幅下線。下線はPrimary 2px・左右40px余白）
- **page-number:** 右下に "n / N" を muted で
- **footer:** なし

> ロゴ枠は既定では設けない。

## Treatments（装飾の流儀）
- 色は黒・グレー・白のみ。カラーアクセントを使わない（タイポと余白で語る）
- タイトルは特大・極太（900ウェイト）。ジャンプ率を極端にする
- 黒ベタの帯・面は1スライド1箇所まで（反転で使う）
- 写真を使う場合はモノクロ推奨
- 罫線は1px。装飾図形は置かない

## Do / Don't
- ✅ 言葉を磨いて短くする（タイポが主役のため文言の質がそのまま出る）
- ✅ 余白を最大限に取る
- ✅ 黒ベタ面では文字を白抜きにする
- ❌ カラーを1色でも足す（世界観が壊れる）
- ❌ 要素を増やして余白を埋める
- ❌ 細いウェイトの見出しにする
