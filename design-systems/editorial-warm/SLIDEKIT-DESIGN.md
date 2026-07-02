# SLIDEKIT-DESIGN — editorial-warm

## Meta
- **name:** editorial-warm
- **summary:** ベージュ地×明朝見出しの雑誌エディトリアル風デザイン。上質で温かい講義・ブランドストーリー資料向け
- **best-for:** 講義資料・受講生向け資料・ブランドストーリー・セミナー
- **mood:** 上質 / 温かい / 落ち着いた / 雑誌風 / 誠実
- **reference:** 日本のSpeaker Deckで人気の雑誌エディトリアル風スライド（クリーム地・セリフの大見出し・細い罫線の静かな装飾）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #A6572E | 主要な強調・見出し下線・飾り線 |
| Secondary | --color-secondary | #9B938A | 補助の表現・キャプション・英字ラベル |
| Accent | --color-accent | #A6572E | アクセント罫線、KPI数字、カード枠線、章番号 |
| Background | --color-bg | #F7F3EC | スライド地色（クリーム） |
| Surface | --color-surface | #FFFFFF | カード・囲みの面（枠線は #A6572E） |
| Soft | --color-soft | #EFE6D8 | 背景の大きな装飾面・中扉の地（淡ベージュ） |
| Text | --color-text | #3A3733 | 本文すべて |
| Text Muted | --color-text-muted | #9B938A | 補足・キャプション・ページ番号 |

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | Noto Serif JP | 44px | Bold | 1.3 |
| H2（共通見出し） | Noto Serif JP | 24px | Bold | 1.25 |
| メッセージライン | Noto Sans JP | 16px | Regular | 1.5 |
| 本文 | Noto Sans JP | 17px | Regular | 1.6 |
| キャプション | Noto Sans JP | 13px | Regular | 1.5 |

> 見出し系（H1/H2/章タイトル/KPI数字）は Noto Serif JP（明朝）、本文・補足は Noto Sans JP。Google Fontsで両方読み込む。

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 64px（全幅の5%）
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** 共通見出しデザインA（タイトル24px太字・明朝＋全幅下線。下線はテラコッタ2px・左右40px余白）。
  **見出しの下にメッセージライン（このスライドの結論1行・16px）を置く**（アクションタイトル）。
- **page-number:** 右下に "n / N" を muted で
- **footer:** なし（ミニマル）

> ロゴ枠は既定では設けない。

## Treatments（装飾の流儀）
- **細い罫線と小さな飾り線が主役:** 区切り・見出し飾りは 1〜3px の細線（テラコッタ or 淡ベージュ）。派手な図形は使わない
- **セリフの大きな見出し:** 表紙・中扉・締めは明朝の大見出しで「誌面の扉」のように見せる。英字の小さなラベル（letter-spacing広め）を添えてよい
- カード・囲みは**白面（#FFFFFF）＋テラコッタ細枠（1px）**。塗りカードは使わない
- 大きな数字（KPI）のみテラコッタで大きく（明朝）。それ以外の文字は #3A3733
- 背景装飾は**淡ベージュ（#EFE6D8）の静かな面1つまで**（帯・角の面など。図形で騒がない）
- **強調は1スライド1〜2箇所まで**（テラコッタの色文字・太字は本当に見せたい一点に絞る）
- 影・グラデーションは使わない。角丸は 0〜8px の控えめな範囲

## Do / Don't
- ✅ 明朝の見出しと余白で「上質さ」を出す（詰めるより削る）
- ✅ 1スライド1メッセージ。飾りより言葉の質で語る
- ✅ 細い罫線・小さな飾り線で静かにリズムを作る
- ❌ 原色・派手な図形・大きな塗り面で飾る
- ❌ 強調を3箇所以上置く／色を増やす
- ❌ 見出しをゴシックにする（見出しは必ず明朝）

## pptx theme（tools/pptx/build-pptx.mjs 用）
```json
{ "accent":"A6572E", "soft":"EFE6D8", "text":"3A3733", "muted":"9B938A", "bg":"F7F3EC", "surface":"FFFFFF", "font":"Noto Serif JP" }
```
（fontは見出し用。本文はNoto Sans JP）
