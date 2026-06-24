# SLIDEKIT-DECK — 資料作成を効率化する提案

> これは `slidekit-assemble` が生成する設計書（SLIDEKIT-DECK.md）のサンプルです。
> このファイル1枚をスライド生成AI（Claudeのデザイン機能・NotebookLM等）にアップロードして
> 「このブリーフ通りにスライドを生成して」と指示すると、スライドが完成します。

## Brief
- **title:** 資料作成を効率化する提案
- **audience:** 社内の意思決定者（部長・役員）
- **purpose:** 提案（新しい資料作成フローの導入承認を得る）
- **slide-count:** 8
- **tone:** 落ち着いた・論理的・余白多め

## Design System

### Meta
- **name:** clean-mono-sans
- **summary:** ほぼモノクロ＋単一アクセントの、静かで知的なサンセリフ系デザインシステム
- **best-for:** 事業計画・社内提案・技術解説・落ち着いた説明会など、内容で勝負したい資料
- **mood:** 静か / 知的 / 余白多め / 信頼感 / ミニマル
- **reference:** original

### Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #1A1A1A | 見出し・主要テキスト |
| Secondary | --color-secondary | #4A4A4A | 小見出し・補助テキスト |
| Accent | --color-accent | #2F6BFF | 注目させたい一点（強調・キーナンバー・リンク） |
| Background | --color-bg | #FFFFFF | スライド地色 |
| Surface | --color-surface | #F4F5F7 | カード・囲みの面 |
| Text | --color-text | #1A1A1A | 本文 |
| Text Muted | --color-text-muted | #8A8F98 | キャプション・ページ番号 |

### Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | "Noto Sans JP", sans-serif | 60px | 700 | 1.15 |
| H2（各ページ見出し） | "Noto Sans JP", sans-serif | 36px | 700 | 1.25 |
| 本文 | "Noto Sans JP", sans-serif | 20px | 400 | 1.65 |
| キャプション | "Noto Sans JP", sans-serif | 14px | 400 | 1.5 |

### Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 88px
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ（表紙のみ中央寄せ可）

### Frame（共通の枠）
- **title-area:** 各ページ上部に H2。見出しの左に accent の縦線（幅 4px・高さ H2 と同じ）を添える。
- **page-number:** 右下に "n / N" を Text Muted（14px）で。
- **footer:** フッター装飾はなし。余白で締める。ロゴ枠は設けない。

### Treatments（装飾の流儀）
- 強調は **太字＋accent 色**で 1 ページに 1〜2 箇所まで。乱用しない。
- 区切りは線ではなく**余白**で作る。どうしても要るときは Surface 色の 1px ライン。
- 囲みは Surface 面＋角丸 12px。影は使わない（フラットに保つ）。
- キーナンバーは特大（72px・accent）で見せる。
- 図・アイコンは線画ベース、線は Primary か Muted。塗りは Surface か accent の薄色。

### Do / Don't
- ✅ 余白を恐れない。1 スライド 1 メッセージ。
- ✅ accent は「ここを見て」の一点だけに使う。
- ✅ 文字は左寄せで読みやすさ優先。
- ❌ 多色使い（accent 以外の有彩色を増やさない）。
- ❌ 影・グラデーション・装飾枠の多用。
- ❌ 1 スライドに情報を詰め込む（分割する）。

## Slide Plan
| # | 種類 | 構図パターン（SLIDE-PATTERN） | 内容（1行） |
|---|---|---|---|
| 1 | 表紙 | cover-title-center | タイトル・対象・日付 |
| 2 | 目次 | agenda-toc | 本日の流れ |
| 3 | 主張 | key-message-single | 課題提起のキーメッセージ |
| 4 | 本文 | numbered-list-with-body | 現状と3つの課題 |
| 5 | プロセス | three-stage-circle-flow | 解決アプローチ3ステップ |
| 6 | データ | three-kpi-big-number | 期待される効果（数値） |
| 7 | 比較 | before-after-two-col | 導入前 / 導入後 |
| 8 | 締め | closing-slide | まとめと連絡先 |

## Slides

### Slide 1 — 表紙（cover-title-center）
**Structure:** full-slide-centered ／ 背景=装飾グラフィック ／ 中央に main-title(大) + sub-title(中)
**Content:**
- main-title: 資料作成を、もっと速く・きれいに
- sub-title: 営業企画部　｜　2026年6月

### Slide 2 — 目次（agenda-toc）
**Structure:** セクションラベル + タイトル(H1) ／ 各行=番号(01〜) + 項目名 + 点線リーダー + ページ番号
**Content:**
- セクションラベル: AGENDA
- タイトル: 本日の流れ
- 項目: 01 いま起きている問題 / 02 現状と3つの課題 / 03 解決のアプローチ / 04 期待できる効果 / 05 ご承認のお願い

### Slide 3 — 主張（key-message-single）
**Structure:** 上部区切り線 ／ キーメッセージ(大・太) ／ 下部区切り線 ／ 補足テキスト(小)
**Content:**
- キーメッセージ: 資料作成に、毎週1人あたり 6時間 が消えている。
- 補足テキスト: その大半は「デザインの調整」に費やされています。

### Slide 4 — 本文（numbered-list-with-body）
**Structure:** 各項目 = 番号バッジ + 見出し(H2) + 本文(1〜3行) ／ 区切り線
**Content:**
- 項目1: 【01 体裁づくりに時間】整える作業に追われ、中身の検討が後回しになる
- 項目2: 【02 バラバラな見た目】人によって体裁が違い、組織としての統一感がない
- 項目3: 【03 古い情報の流用】使い回しで情報が更新されないまま提出される

### Slide 5 — プロセス（three-stage-circle-flow）
**Structure:** 円形ノード3つを横並び ／ 各ノード = ステージ名 + 見出し
**Content:**
- ステージ1: 整える｜デザインの基準を1つに決める（色・フォント・余白）
- ステージ2: 選ぶ｜よく使う構図をパターンとして用意する
- ステージ3: 任せる｜中身を渡せばAIが体裁を整えて出力する

### Slide 6 — データ（three-kpi-big-number）
**Structure:** KPIを3つ横並び ／ 各KPI = ラベル + 大きな数字 + 単位 + 説明
**Content:**
- KPI1: 資料作成時間 ／ -70% ／ 体裁づくりの工数を削減
- KPI2: デザイン統一率 ／ 100% ／ 全社で同じ基準
- KPI3: 追加ツール費用 ／ 0円 ／ 既存環境で完結

### Slide 7 — 比較（before-after-two-col）
**Structure:** 左=BEFORE（×リスト）／ 中央=矢印(→) ／ 右=AFTER（○リスト）
**Content:**
- BEFORE: 毎回ゼロから体裁を調整 ／ 見た目が人によって違う ／ 中身より見栄えに時間
- AFTER: 基準に沿って自動で整う ／ 全社で統一された見た目 ／ 中身の検討に集中できる

### Slide 8 — 締め（closing-slide）
**Structure:** アクセント線 ／ メインメッセージ ／ サブメッセージ ／ 区切り線 ／ 発表者情報 ／ 連絡先
**Content:**
- メインメッセージ: 中身に集中できる環境を、つくりませんか。
- サブメッセージ: Let's focus on what matters.
- 発表者情報: 営業企画部
- 連絡先情報: planning@example.com

## Generation Instructions
- このファイルを Claude のデザイン機能（claude.ai/design の Slides）または NotebookLM 等にアップロードし、
  「この SLIDEKIT-DECK の通りに、Design System と各 Slide の構図・コンテンツでスライドを生成して」と指示する。
- 出力は **PDF を推奨**（デザイン再現性が最も高い）。プレゼン投影は HTML 全画面でも可。
- 生成後の微修正は、各ツールの編集機能で軽微な調整にとどめるのが現実的。
