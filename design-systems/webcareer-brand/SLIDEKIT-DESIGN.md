# SLIDEKIT-DESIGN — webcareer-brand

## Meta
- **name:** webcareer-brand
- **summary:** ウェブキャリ（WebCareer）公式ブランドのスライド版。Blueグラデ基調×Pink1点強調のモダンで前向きなデザイン
- **best-for:** ウェブキャリの講義・説明会・受講生向け資料・集客資料
- **mood:** モダン / エネルギッシュ / 前向き / 親しみやすい / 学び×前進
- **reference:** `guidelines/brand/webcareer-deck-design.md`（ウェブキャリ公式資料デザインルール・ブランドの正）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #2F62A6 | 主アクセント。Blueグラデ起点・主要な強調 |
| Secondary | --color-secondary | #2B4894 | 見出し下線・番号バッジ・カード枠線・KPI数字・Blueグラデ終点（blue-solid） |
| Accent | --color-accent | #D72550 | Pinkの差し色。「ここぞ」の1箇所のみ（CTA・おすすめバッジ・最重要数値） |
| Background | --color-bg | #FFFFFF | スライド地色（本文スライドは常に白） |
| Surface | --color-surface | #E8EEF7 | 淡ブルー面（ラベル箱・カードヘッダ・KPI地） |
| Text | --color-text | #333333 | 本文すべて（SlideKit共通ルールの黒） |
| Text Muted | --color-text-muted | #5B6577 | 補足・キャプション・ページ番号 |

### Gradients（グラデーション定義・角度は常に25°）
| グラデ名 | CSS | 使いどころ |
|---|---|---|
| Blue Gradient（主） | `linear-gradient(25deg, #2F62A6 0%, #2B4894 100%)` | 表紙・セクション中扉・締めの濃背景。上の文字は常に白 |
| Pink Gradient（差し色） | `linear-gradient(25deg, #A7629D 0%, #D72550 100%)` | CTAボタン・1箇所強調のみ。全面背景に敷くことは禁止 |

- グラデ角度は **常に25°** に固定。スライドごとに角度を変えない。
- 英語表記は **常に「WebCareer」**（1語・キャメルケース）。「Web Career」「Webcareer」「WEBCAREER」は禁止。

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙・締めの大見出し） | M PLUS Rounded 1c | 44px | Regular〜Medium（400–500。大サイズのBold禁止） | 1.25 |
| H2（共通見出し） | M PLUS Rounded 1c | 24px | Bold | 1.25 |
| メッセージライン | Noto Sans JP | 16px | Regular | 1.5 |
| 本文 | Noto Sans JP | 16px | Regular | 1.6 |
| キャプション | Noto Sans JP | 13px | Regular | 1.5 |
| 英数字・KPI数値 | Poppins | KPI 48px前後 | SemiBold（600） | 1.0 |

- 和欧混植: 日本語は上記フォント、**英数字・数値は常にPoppins**（半角・カンマ区切り。全角数字禁止）。
- いずれもGoogle Fontsで入手可（M PLUS Rounded 1c / Noto Sans JP / Poppins）。
- 斜体禁止。装飾目的の英語ラベル（CONTENTS / SECTION 01 等）禁止＝ラベルは日本語のみ（正式名称「WebCareer」は例外）。

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 64px（余白広め・詰めるより削る）
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** 共通見出しデザインA（タイトル24px太字＋全幅下線。下線はSecondary #2B4894の2px・左右40px余白）。
  **見出しの下にメッセージライン（このスライドの結論1行・16px）を置く**（アクションタイトル）。
- **page-number:** 右下に "n / N" を muted で（控えめ）
- **footer:** なし

> ロゴ枠は既定では設けない。ロゴを使う場合は **表紙のみ・右下・白抜き版**（`brand-assets/webcareer/png/white/WebCareer_Horizontal_W.png`）をBlueグラデ背景に直置き（白座布団禁止・表紙以外に置かない）。

## Treatments（装飾の流儀）
- **Blue基調・Pinkは1点豪華主義:** ブルーが基調・主役。Pink強調（色文字・バッジ・CTA）は **1スライド1箇所まで**。ブルーと同等以上の面積でPinkを使わない
- **濃背景は常にBlueグラデ25°:** 表紙・セクション中扉・締めの地はBlue Gradient固定。上の文字は白。Pinkグラデを全面に敷かない
- **カードは白面＋Secondary細枠（1px）＋大きめ角丸（16px）:** 影は軽い1段のみ（`0 4px 16px rgba(43,72,148,0.12)` 相当）。濃い影・多重影は禁止
- **数字はPoppinsでBlue:** KPI等の大数字はSecondary #2B4894。最重要の1つだけAccent #D72550可（強調1箇所に含める）
- **淡色面はSurface #E8EEF7:** 領域区別・ラベル箱・カードヘッダのみ。文字色には使わない
- **角丸・余白は緩め:** カード角丸16px・小要素8px・ピル999px。直角の多用禁止。余白は広く取る

## Do / Don't
- ✅ ブルー基調・ピンクは「そのスライドで最も伝えたい1点」だけ
- ✅ 濃背景（表紙・中扉・締め）はBlueグラデ25°＋白文字で統一
- ✅ 表紙・締めの大見出しはM PLUS Rounded 1cのRegular〜Medium（太字にしない）
- ✅ 数値・英数字はPoppins半角＋カンマ区切り。英語表記は常に「WebCareer」
- ✅ 1スライド1メッセージ。余白を恐れない（詰めるより削る）
- ❌ ピンク強調を1スライドに2箇所以上置く／Pinkグラデを全面背景に敷く
- ❌ グラデ角度を25°以外にする／ブランド外の色（純黒#000000・ティール・ゴールド等）を使う
- ❌ 装飾的な英語ラベル（CONTENTS / RESULTS / SECTION 01 等）を置く
- ❌ 濃い影・3D・立体表現・多色アイコンで飾る

## pptx theme（tools/pptx/build-pptx.mjs 用）
```json
{ "accent":"2F62A6", "soft":"E8EEF7", "text":"333333", "muted":"8A8F98", "bg":"FFFFFF", "surface":"FFFFFF", "font":"Noto Sans JP" }
```
（グラデはpptxでは単色 #2F62A6 で代替。Pinkの差し色 #D72550 は手動指定）
