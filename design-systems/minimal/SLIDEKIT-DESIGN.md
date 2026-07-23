# SLIDEKIT-DESIGN — Clean Mono Sans

## Meta
- **name:** minimal
- **summary:** ほぼモノクロ＋単一アクセントの、静かで知的なサンセリフ系デザインテーマ
- **best-for:** 事業計画・社内提案・技術解説・落ち着いた説明会など、内容で勝負したい資料
- **mood:** 静か / 知的 / 余白多め / 信頼感 / ミニマル
- **reference:** original

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #1A1A1A | 見出し・主要テキスト |
| Secondary | --color-secondary | #4A4A4A | 小見出し・補助テキスト |
| Accent | --color-accent | #2F6BFF | 注目させたい一点（強調・キーナンバー・リンク） |
| Background | --color-bg | #FFFFFF | スライド地色 |
| Surface | --color-surface | #F4F5F7 | カード・囲みの面 |
| Text | --color-text | #1A1A1A | 本文 |
| Text Muted | --color-text-muted | #8A8F98 | キャプション・ページ番号 |

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | "Noto Sans JP", sans-serif | 60px | 700 | 1.15 |
| H2（各ページ見出し） | "Noto Sans JP", sans-serif | 36px | 700 | 1.25 |
| 本文 | "Noto Sans JP", sans-serif | 20px | 400 | 1.65 |
| キャプション | "Noto Sans JP", sans-serif | 14px | 400 | 1.5 |

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 88px
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ（表紙のみ中央寄せ可）

## Frame（共通の枠）
- **title-area:** 各ページ上部に H2。見出しの左に accent の縦線（幅 4px・高さ H2 と同じ）を添える。
- **page-number:** 右下に "n / N" を Text Muted（14px）で。
- **footer:** フッター装飾はなし。余白で締める。ロゴ枠は設けない。

## Treatments（装飾の流儀）
- 強調は **太字＋accent 色**で 1 ページに 1〜2 箇所まで。乱用しない。
- 区切りは線ではなく**余白**で作る。どうしても要るときは Surface 色の 1px ライン。
- 囲みは Surface 面＋角丸 12px。影は使わない（フラットに保つ）。
- キーナンバーは特大（72px・accent）で見せる。
- 図・アイコンは線画ベース、線は Primary か Muted。塗りは Surface か accent の薄色。

## Do / Don't
- ✅ 余白を恐れない。1 スライド 1 メッセージ。
- ✅ accent は「ここを見て」の一点だけに使う。
- ✅ 文字は左寄せで読みやすさ優先。
- ❌ 多色使い（accent 以外の有彩色を増やさない）。
- ❌ 影・グラデーション・装飾枠の多用。
- ❌ 1 スライドに情報を詰め込む（分割する）。
