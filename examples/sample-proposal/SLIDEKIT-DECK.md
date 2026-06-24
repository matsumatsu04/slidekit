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
`design-systems/clean-mono-sans/SLIDEKIT-DESIGN.md` を**丸ごと（逐語で）埋め込み**。

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
| # | 種類 | 構図パターン | 内容（1行） |
|---|---|---|---|
| 1 | 表紙 | cover-centered | タイトル・対象・日付 |
| 2 | 目次 | agenda-numbered | 本日の流れ |
| 3 | 主張 | content-statement | 課題提起のキーメッセージ |
| 4 | 本文 | content-lead-bullets | 現状と3つの課題 |
| 5 | プロセス | process-steps | 解決アプローチ3ステップ |
| 6 | データ | kpi-row | 期待される効果（数値） |
| 7 | 比較 | compare-two-col | 導入前 / 導入後 |
| 8 | 締め | closing-cta | まとめと承認のお願い |

## Slides

### Slide 1 — 表紙（cover-centered）
**Structure:** eyebrow{x12,y34,w76,h8} / title{x12,y42,w76,h22} / subtitle{x12,y66,w76,h10}
**Content:**
- eyebrow: 社内提案 2026
- title: 資料作成を、もっと速く・きれいに
- subtitle: 営業企画部　｜　2026年6月

### Slide 2 — 目次（agenda-numbered）
**Structure:** title{x7,y9,w86,h14} / list{x7,y26,w70,h66}
**Content:**
- title: 本日の流れ
- list: ①いま起きている問題 ②現状と3つの課題 ③解決のアプローチ ④期待できる効果 ⑤ご承認のお願い

### Slide 3 — 主張（content-statement）
**Structure:** statement{x10,y32,w80,h36} / support{x10,y70,w70,h10}
**Content:**
- statement: 資料作成に、毎週1人あたり **6時間** が消えている。
- support: その大半は「デザインの調整」に費やされています。

### Slide 4 — 本文（content-lead-bullets）
**Structure:** title{x7,y9,w86,h13} / lead{x7,y24,w78,h12} / bullets{x7,y38,w78,h54}
**Content:**
- title: 現状と課題
- lead: 各自がゼロから作るため、品質も時間もバラついています。
- bullets: ①体裁を整える作業に時間が取られ中身の検討が後回し ②人によって **見た目がバラバラ** で統一感がない ③使い回しで情報が古いまま提出される

### Slide 5 — プロセス（process-steps）
**Structure:** title{x7,y9,w86,h13} / step-1{x7,y38,w26,h40} / step-2{x37,y38,w26,h40} / step-3{x67,y38,w26,h40} / connectors{x33,y56,w34,h4}
**Content:**
- title: 解決のアプローチ
- step-1: 整える｜デザインの基準を1つに決める（色・フォント・余白）
- step-2: 選ぶ｜よく使う構図をパターンとして用意する
- step-3: 任せる｜中身を渡せばAIが体裁を整えて出力する
- connectors: →（左から右へ）

### Slide 6 — データ（kpi-row）
**Structure:** title{x7,y9,w86,h13} / kpi-1{x7,y34,w26,h40} / kpi-2{x37,y34,w26,h40} / kpi-3{x67,y34,w26,h40}
**Content:**
- title: 期待できる効果
- kpi-1: **-70%**｜資料作成にかかる時間
- kpi-2: **100%**｜全社で統一されたデザイン
- kpi-3: **0円**｜追加ツール費用（既存環境で完結）

### Slide 7 — 比較（compare-two-col）
**Structure:** title{x7,y9,w86,h13} / col-left{x7,y26,w41,h66} / col-right{x52,y26,w41,h66}
**Content:**
- title: 導入前 / 導入後
- col-left: 【導入前】毎回ゼロから体裁を調整 ／ 見た目が人によって違う ／ 中身より見栄えに時間
- col-right: 【導入後】基準に沿って自動で整う ／ 全社で統一された見た目 ／ 中身の検討に集中できる

### Slide 8 — 締め（closing-cta）
**Structure:** title{x9,y28,w78,h16} / cta{x9,y50,w60,h12} / contact{x9,y78,w70,h10}
**Content:**
- title: 中身に集中できる環境を、つくりませんか。
- cta: まずは1部署で1ヶ月、試験導入させてください。
- contact: 詳細資料・デモは営業企画部までお問い合わせください

## Generation Instructions
- このファイルを Claude のデザイン機能（claude.ai/design の Slides）または NotebookLM 等にアップロードし、
  「この SLIDEKIT-DECK の通りに、Design System と各 Slide の構図・コンテンツでスライドを生成して」と指示する。
- 出力は **PDF を推奨**（デザイン再現性が最も高い）。プレゼン投影は HTML 全画面でも可。
- 生成後の微修正は、各ツールの編集機能で軽微な調整にとどめるのが現実的。
