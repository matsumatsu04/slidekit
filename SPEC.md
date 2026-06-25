# SlideKit ファイル仕様（SPEC）

SlideKit は、AI でスライドを生成するときに「毎回デザインも構図もバラつく」問題を解決するための、
スライド専用の設計フォーマット群です。3 つのマークダウンファイルで「見た目」と「構図」を分離して定義し、
最終的に 1 枚の設計書にまとめてスライド生成 AI（Claude のデザイン機能・NotebookLM など）に渡します。

このドキュメントは、3 つのファイル形式の正式な仕様を定義します。スキルもギャラリーもこの仕様に従います。

---

## 全体像

```
SLIDEKIT-DESIGN.md          ← 見た目（色・フォント・余白・枠）を定義
SLIDE-PATTERN-{name}.md     ← 構図（要素の配置・カラム構造）を定義（色は持たない）
        │
        └── 上記2種を埋め込み ─→ SLIDEKIT-DECK.md（最終設計書／これ1枚をAIに渡す）
```

| ファイル | 役割 | 持つもの | 持たないもの |
|---|---|---|---|
| `SLIDEKIT-DESIGN.md` | デザインシステム | 色・フォント・余白・枠・装飾ルール | 個別スライドの構図・中身 |
| `SLIDE-PATTERN-{name}.md` | 構図パターン | 要素の配置・構造・各要素の役割 | 色・フォント・実コンテンツ |
| `SLIDEKIT-DECK.md` | 設計書（ブリーフ） | 上記2種＋全スライドの構成＋実コンテンツ | （これ自体が完成形） |

> 構図パターンライブラリ（`patterns/SLIDE-PATTERN-*`）は [slide-pattern-library/slide.md](https://github.com/slide-pattern-library/slide.md)（MIT License）を
> 取り込んで利用している。詳細は [`patterns/CREDITS.md`](./patterns/CREDITS.md)。SlideKit の構図パターンはこの形式に統一する。

**設計思想：色と構図を分離する。** デザインシステム（色・フォント）を 1 つ決めれば、
どの構図パターンとも自由に組み合わせられます。逆に、お気に入りの構図を 1 度言語化すれば、
どんなデザインシステムでも再利用できます。

---

## 1. SLIDEKIT-DESIGN.md — デザインシステム

スライド全体の「見た目」を定義します。色・フォント・余白・タイトル枠・ページ番号など。
1 つの `SLIDEKIT-DESIGN.md` ＝ 1 つの統一されたビジュアル世界。

### 必須セクション

```markdown
# SLIDEKIT-DESIGN — {システム名}

## Meta
- **name:** {kebab-case の識別子}
- **summary:** {1行説明}
- **best-for:** {合う用途・場面}
- **mood:** {キーワード3〜5個。例: 落ち着いた / 知的 / 信頼感}
- **reference:** {着想元があれば。なければ "original"}

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #XXXXXX | 主要な強調・見出し |
| Secondary | --color-secondary | #XXXXXX | 補助の強調 |
| Accent | --color-accent | #XXXXXX | 注目させたい一点 |
| Background | --color-bg | #XXXXXX | スライド地色 |
| Surface | --color-surface | #XXXXXX | カード・囲みの面 |
| Text | --color-text | #XXXXXX | 本文 |
| Text Muted | --color-text-muted | #XXXXXX | 補足・キャプション |

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | {font} | 56px | Bold | 1.2 |
| H2（各ページ見出し） | {font} | 36px | Bold | 1.25 |
| 本文 | {font} | 20px | Regular | 1.6 |
| キャプション | {font} | 15px | Regular | 1.5 |

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 80px
- **gutter:** 32px
- **grid:** 12 カラム
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** {タイトルの位置・装飾。例: 上部に accent の細い縦線＋H2}
- **page-number:** {位置・書式。例: 右下に "n / N" を muted で}
- **footer:** {フッター装飾の有無}

> ロゴ枠は既定では設けない（配布先の多くがロゴを持たないため）。
> ロゴを使いたいユーザー向けには任意で `logo-slot` を追加できるが、標準テンプレートには含めない。

## Treatments（装飾の流儀）
- {強調の付け方、区切り線、囲みカード、図のスタイルなど 3〜6 個}

## Do / Don't
- ✅ {このデザインでやること}
- ❌ {やってはいけないこと}
```

### ルール
- 色は **HEX 必須**。トークン名（`--color-*`）も付けて参照しやすくする。
- フォントは **Noto Sans JP を標準**とする（Google Fonts で誰でも無料・日本語対応・配布先で再現しやすい）。
  別の書体を使う場合も、入手しやすいもの（Google Fonts 等）を優先する。
- `canvas` は 16:9 を既定（1280×720 推奨。1920×1080 でも可）。
- このファイルは **構図や実コンテンツを持たない**。それは SLIDE-PATTERN と DECK の役割。

---

## 2. SLIDE-PATTERN-{name}.md — 構図パターン

1 枚のスライドの「コンテンツエリアの構図（要素の置き方）」だけを定義します。
**色もフォントも実コンテンツも持ちません**（それらは DESIGN と DECK の役割）。1 パターン ＝ 1 ディレクトリ。

### 格納場所とライブラリ

```
patterns/
├─ SLIDE-PATTERN-INDEX.md          ← 全パターンの索引（カテゴリ別。assemble が参照）
├─ manifest.json                   ← 機械可読の一覧（name / category / summary）
├─ CREDITS.md / UPSTREAM-LICENSE.txt
└─ SLIDE-PATTERN-{name}/
   ├─ SLIDE-PATTERN-{name}.md      ← 構図定義
   └─ SLIDE-PATTERN-{name}.html    ← グレースケールの確認用プレビュー（960×540）
```

カテゴリは 14 種：`表紙 / セクション / 目次 / 本文 / リスト / ステップ /
図解・ダイアグラム / カード / グラフ / テーブル / KPI / まとめ / FAQ / プロフィール`。

### 必須セクション

```markdown
# SLIDE-PATTERN-{name}

（前書き：このファイルはコンテンツエリアのレイアウト定義であり、タイトル枠・ページ番号・装飾は
DESIGN 側の Frame で定義する旨を記す）

## Overview
**パターン名：** {kebab-case}
**概要：** {1〜2行の説明}
**適したシーン：** {使いどころ}

## Structure（構造）
（コンテンツエリアの構造を YAML 風に記述。カラム数・行・要素の配置など。色・実値は書かない）

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| {要素} | {位置} | {役割} |

## Usage Guide（AIへの使い方）
（このパターンをAIに指示するときのプロンプト例と注意点）
```

### ルール
- **色・フォント・実コンテンツは書かない**（それは DESIGN／DECK の役割。混ぜると再利用できなくなる）。
- **タイトル枠・ページ番号・装飾は持たない**（DESIGN の `Frame` が担当）。このファイルは「タイトル行より下のコンテンツエリア」を定義する。
- `category` は上記 14 種から選ぶ（INDEX とギャラリーの分類に使う）。
- 確認用 HTML は **グレースケール**で作る（色は DESIGN 側が決めるため）。ファイルは `SLIDE-PATTERN-{name}.html`。
- **新しいパターンを追加したら、`SLIDE-PATTERN-INDEX.md` の該当カテゴリと `manifest.json` を更新する**（`slidekit-layout` が実施）。
- 既存ライブラリ（slide-pattern-library/slide.md, MIT）は内容・ライセンス表示を保持したまま利用する（[CREDITS](./patterns/CREDITS.md)）。

---

## 3. SLIDEKIT-DECK.md — 設計書（最終成果物）

1 つのプレゼン全体の設計書。**選んだ DESIGN と、各ページに割り当てた SLIDE-PATTERN と、実コンテンツ**を
すべて 1 ファイルに埋め込みます。これ 1 枚をスライド生成 AI に渡せば完成します。

### 必須セクション

```markdown
# SLIDEKIT-DECK — {プレゼン名}

## Brief
- **title:** {プレゼンタイトル}
- **audience:** {対象者}
- **purpose:** {目的}
- **slide-count:** {枚数}
- **tone:** {トーン}

## Design System
（選んだ SLIDEKIT-DESIGN.md の中身を丸ごと埋め込む）

## Slide Plan
| # | 種類 | 構図パターン | 内容（1行） |
|---|---|---|---|
| 1 | 表紙 | cover-gradient-text-bottom | タイトル・対象・日付 |
| 2 | 目次 | agenda-toc | 本日の流れ |
| … | … | … | … |

## Slides
各スライドは**次の固定テンプレート**で書く（ばらつきを防ぐため）。`{pattern}` は
`patterns/SLIDE-PATTERN-{name}` のパターン名。

```markdown
### Slide {n} — {種類}（{pattern}）
**Structure:**（割り当てた SLIDE-PATTERN の Structure/Elements を要約して埋め込み）
**Content:**（各要素を実際の文言で埋める。要素名は当該パターンの Elements と対応させる）
- {要素}: {実際の文言}
- {要素}: {実際の文言}
```

例：
```markdown
### Slide 1 — 表紙（cover-gradient-text-bottom）
**Structure:** グラデーション背景 ／ 左下に大型タイトル ／ 下部にサブ情報・日付
**Content:**
- main-title: 資料作成を、もっと速く・きれいに
- sub-title: 営業企画部　｜　2026年6月
```

## Generation Instructions
- このファイルを {Claude のデザイン機能 / NotebookLM 等} にアップロードして「このブリーフ通りにスライドを生成して」と指示する。
- 出力は PDF を推奨（デザイン再現性が高い）。
```

### ルール
- DESIGN と各 SLIDE-PATTERN は **参照ではなく埋め込み**（AI に 1 ファイルで完結して渡すため）。
- 各スライドの要素は **実際の文言で埋める**（プレースホルダのまま渡さない）。
- 枚数・構図はユーザー承認後に確定する（→ スキル `slidekit-assemble` が担当）。

---

## 共通ルール（余白・見出し）

### 余白
- **padding / margin の数値は奇数を使わず、4の倍数（4/8/12/16/24/32/40/48…）で揃える。**

### 共通見出し（Frame title-area）
- **対象：** 表紙・セクション・目次**以外**のスライド（本文系）にのみ付ける。ON/OFF は閲覧者が切替可。
- **番号は入れない。タイトルのみ。**
- **統一metrics（全スライド共通・各スライドの余白に依存させない）：**
  - フォント：**24px / bold / #333333**
  - 上端からの位置：見出し上の余白 **24px**（上端から一定）
  - 本文は上端から **76px** 以降に配置（見出しと重ねない）
- **デザインA（既定）：** タイトル＋**全幅下線**（アクセント色 2px、左右に **40px** の余白）
- **デザインB：** タイトル左に**アクセント縦バー**（幅4px・左から **40px** の位置）。下線なし

### 成果物提示
- `slidekit-assemble` がユーザーに構成・成果物を提示する際は、**使用した構図パターン名（SLIDE-PATTERN）と見出し有無を列に含む表**で示す（例：`# / 種類 / 構図パターン / 見出し / 内容`）。

## バージョン
- SPEC version: 1.2（共通見出しの統一metrics・余白4の倍数ルール・成果物提示でのパターン名表示を追加）
- 後方互換のない変更時はメジャーバージョンを上げる。
