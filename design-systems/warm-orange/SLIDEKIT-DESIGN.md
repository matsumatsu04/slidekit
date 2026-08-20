# SLIDEKIT-DESIGN — warm-orange

## Meta
- **name:** warm-orange
- **label:** ウォームオレンジ
- **summary:** 温かいオレンジを主役に、ゴールドを差し色として置く親密なデザイン。少人数・個別提案向け
- **best-for:** 個別コンサルの案内・少人数向け説明・伴走サービスの提案・受講生向けの導入資料
- **mood:** 温かい / 前のめり / 距離が近い / 実務的 / 手を動かす
- **reference:** `output/aiboot-consul-deck/deck-config.json`（実運用中のデッキ配色から起こした。
  ブランドガイドの文書はまだ無く、色以外の作法はこのファイルが最初の取り決めになる）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #FC5807 | 主役。見出し下線・番号バッジ・アイコン・大数字・強調 |
| Accent | --color-accent | #C79A3A | 差し色。1スライド1箇所。ラベル・仕切り・特別な強調 |
| Background | --color-bg | #FFFFFF | スライド地色 |
| Surface | --color-surface | #FDEAD8 | 淡オレンジ面。カード地・ハイライト行・淡円 |
| Text | --color-text | #333333 | 本文すべて |
| Text Muted | --color-text-muted | #9B938A | 補足・キャプション・ページ番号 |
| Line | --color-line | #E8DFD6 | 区切り罫線・カード枠線 |

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
- **safe-margin:** 上下 64px / 左右 64px
- **gutter:** 32px
- **grid:** 12 カラム
- **radius:** カード 14px / 小要素 6px（硬すぎず丸すぎない中間）
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** 共通見出しデザインF（ドット＋英字ラベル）またはA（下線）。色は `#FC5807`
- **page-number:** 右下に "n / N" を muted で
- **footer:** なし

## Treatments（装飾の流儀）
- **オレンジは彩度が高い。広い面に敷かない。** 全面に使うのは章扉と表紙まで
- 本文の強調はオレンジの文字・下線・番号バッジで行う。塗り面は `--color-surface` の淡色に留める
- **ゴールドは1スライド1箇所まで。** オレンジと並べると濁るので、同じ図形の中で隣接させない
- カードは白面＋細枠、または淡オレンジ面。枠と面を同時に濃くしない
- 影は使わないか、ごく軽い1段まで

## Do / Don't
- ✅ 温度感は色で出し、文章はむしろ淡々と書く
- ✅ 1スライド1メッセージ
- ✅ 淡オレンジ面（#FDEAD8）を積極的に使って画面を持たせる
- ❌ オレンジのベタ塗りを本文スライドの背景に敷く
- ❌ オレンジとゴールドを隣接させる
- ❌ 3色目（青・緑など）を持ち込む
