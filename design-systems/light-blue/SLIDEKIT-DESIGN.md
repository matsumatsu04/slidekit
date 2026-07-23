# SLIDEKIT-DESIGN — light-blue

## Meta
- **name:** light-blue
- **summary:** ライトブルー基調の軽やかで清潔感のあるデザイン。IR・決算説明・サービス紹介・公共系資料向け
- **best-for:** IR・決算説明資料／サービス紹介資料／自治体・公共向け資料／社外報告書
- **mood:** 軽やか / 清潔感 / オープン / 信頼
- **reference:** original（スライドギャラリーの近年の定番配色を参考に新規作成）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #2E9BD6 | 主要な強調・見出し下線・章扉の地 |
| Secondary | --color-secondary | #6FBFE8 | 補助の強調・グラフの第2系列 |
| Accent | --color-accent | #2E9BD6 | アクセントバー/罫線、バッジの塗り、KPI数字、カード枠線 |
| Background | --color-bg | #FFFFFF | スライド地色 |
| Surface | --color-surface | #E8F4FB | カード・囲みの淡い面、背景の装飾図形 |
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
- 白地を広く残し、ライトブルーは要所の線と小さな面だけに使う
- 数字・グラフの主系列はライトブルー、比較系列はグレー
- カード・囲みは淡ブルー面（surface）または白面＋細枠
- 見出し下線・バッジなど「線」中心の装飾でまとめる
- 影・グラデーションは使わない

## Do / Don't
- ✅ オープンで誠実なトーンの文章と合わせる
- ✅ データページの多いデッキで採用する（線の装飾が効く）
- ✅ 余白を広く保つ
- ❌ ネイビーと混ぜて使う（濃淡の秩序が崩れる）
- ❌ 彩度の高い水色にする
- ❌ 装飾図形を増やす
