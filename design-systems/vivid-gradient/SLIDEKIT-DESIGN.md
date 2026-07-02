# SLIDEKIT-DESIGN — vivid-gradient

## Meta
- **name:** vivid-gradient
- **summary:** 白地×大胆タイポ×カラフルグラデ装飾のスタートアップピッチ風デザイン。Stripe / Figma 系の明るく先進的なトーン
- **best-for:** サービス紹介・ピッチ・キャンペーン資料・LP的資料
- **mood:** 明るい / 大胆 / 先進的 / エネルギッシュ
- **reference:** Stripe / Figma 等のプロダクトサイト・ピッチ資料（白地に特大タイポ、グラデーションは装飾に限定して要所だけ）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #635BFF | 主要な強調・見出し下線・番号バッジ |
| Secondary | --color-secondary | #FF5CA8 | グラデーションの終端色（単体では原則使わない） |
| Accent | --color-accent | #635BFF | アクセントバー/罫線、KPI数字、カード枠線、バッジ |
| Background | --color-bg | #FFFFFF | スライド地色 |
| Surface | --color-surface | #FFFFFF | カード・囲みの面（白面＋アクセント細枠 1px） |
| Soft | --color-soft | #EEEDFF | ごく薄い塗り（バッジ地・補助的な面）に限定 |
| Text | --color-text | #1F2430 | 本文すべて |
| Text Muted | --color-text-muted | #8A8F98 | 補足・キャプション・ページ番号 |
| Gradient | --grad | linear-gradient(135deg, #635BFF, #FF5CA8) | 表紙の装飾図形・セクション中扉の地・締めのCTAボタンのみ |

> **グラデーションの使いどころは3箇所限定：** 表紙の装飾図形／セクション中扉の地／締めのCTAボタン。
> **本文テキストにグラデーションは絶対使わない。** カード面も白のまま（グラデ塗りカード禁止）。

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | Noto Sans JP | 56px | 900 | 1.15 |
| H2（共通見出し） | Noto Sans JP | 24px | Bold | 1.25 |
| メッセージライン | Noto Sans JP | 16px | Regular | 1.5 |
| 本文 | Noto Sans JP | 17px | Regular | 1.6 |
| キャプション | Noto Sans JP | 13px | Regular | 1.5 |

- フォントはすべて **Noto Sans JP**（Google Fonts）。表紙タイトルはウェイト **900** で特大に。

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 64px（全幅の5%）
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** 共通見出しデザインA（タイトル24px太字＋全幅下線。下線はアクセント色 #635BFF 2px・左右40px余白）。
  **見出しの下にメッセージライン（このスライドの結論1行・16px）を置く**（アクションタイトル）。
- **page-number:** 右下に "n / N" を muted で
- **footer:** なし（ミニマル）

> ロゴ枠は既定では設けない。

## Treatments（装飾の流儀）
- **白地が主役:** 本文スライドは白地×黒に近いテキスト（#1F2430）でフラットに。色は要所だけ
- **グラデは装飾専用:** 表紙の装飾図形・セクション中扉の地・締めのCTAボタンの3箇所のみ。本文テキスト・カード面・見出しには使わない
- **強調は1スライド1〜2箇所まで:** アクセント色（#635BFF）の色文字・塗りは本当に見せたい一点に絞る
- カード・囲みは**白面＋アクセント細枠（1px #635BFF）＋角丸**。塗りカードは使わない
- 大きな数字（KPI）のみアクセント色で大きく。それ以外の文字は黒
- バッジ・番号は Soft（#EEEDFF）地＋アクセント文字、またはアクセント塗り＋白文字
- 影は使わない。角丸と余白で軽さを出す

## Do / Don't
- ✅ 表紙・中扉・CTAでグラデを効かせ、本文は白地で静かに保つ（メリハリ）
- ✅ タイトルは特大・900ウェイトで言い切る（大胆タイポ）
- ✅ 余白を恐れない（詰めるより削る）
- ❌ 本文テキスト・見出しテキストにグラデーションをかける
- ❌ カード面をグラデや濃色で塗りつぶす
- ❌ 強調を3箇所以上置く／ピンク（#FF5CA8）を単色アクセントとして多用する

## pptx theme（tools/pptx/build-pptx.mjs 用）
```json
{ "accent":"635BFF", "soft":"EEEDFF", "text":"1F2430", "muted":"8A8F98", "bg":"FFFFFF", "surface":"FFFFFF", "font":"Noto Sans JP" }
```
（グラデ装飾はpptxでは単色 #635BFF で代替する）
