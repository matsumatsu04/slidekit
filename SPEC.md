# SlideKit ファイル仕様（SPEC）

SlideKit は、AI でスライドを生成するときに「毎回デザインも構図もバラつく」問題を解決するための、
スライド専用の設計フォーマット群です。3 つのマークダウンファイルで「見た目」と「構図」を分離して定義し、
最終的に 1 枚の設計書にまとめてスライド生成 AI（Claude のデザイン機能・NotebookLM など）に渡します。

このドキュメントは、3 つのファイル形式の正式な仕様を定義します。スキルもギャラリーもこの仕様に従います。

---

## 全体像

```
SLIDEKIT-DESIGN.md          ← 見た目（色・フォント・余白・枠）を定義
SLIDEKIT-LAYOUT-{name}.md   ← 構図（要素の配置・カラム構造）を定義（色は持たない）
        │
        └── 上記2種を埋め込み ─→ SLIDEKIT-DECK.md（最終設計書／これ1枚をAIに渡す）
```

| ファイル | 役割 | 持つもの | 持たないもの |
|---|---|---|---|
| `SLIDEKIT-DESIGN.md` | デザインシステム | 色・フォント・余白・枠・装飾ルール | 個別スライドの構図・中身 |
| `SLIDEKIT-LAYOUT-{name}.md` | 構図パターン | 要素の配置・比率・スロット | 色・フォント・実コンテンツ |
| `SLIDEKIT-DECK.md` | 設計書（ブリーフ） | 上記2種＋全スライドの構成＋実コンテンツ | （これ自体が完成形） |

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
- このファイルは **構図や実コンテンツを持たない**。それは LAYOUT と DECK の役割。

---

## 2. SLIDEKIT-LAYOUT-{name}.md — 構図パターン

1 枚のスライドの「要素の置き方（構図）」だけを定義します。**色もフォントも実コンテンツも持ちません。**
構造だけを YAML で精密に書くことで、AI が正確に再現できます。1 パターン ＝ 1 ファイル。

### 必須セクション

```markdown
# SLIDEKIT-LAYOUT — {name}

## Meta
- **pattern:** {kebab-case}
- **category:** {cover / agenda / section / content / list / comparison / data / process / quote / closing のいずれか}
- **summary:** {1行説明}
- **best-for:** {使いどころ}

## Structure
（コンテンツエリアの構造を YAML で。canvas 内の相対比率で記述）
```yaml
regions:
  - id: title
    area: { x: 0, y: 0, w: 100, h: 22 }   # % 指定
    role: 見出し
  - id: body-left
    area: { x: 0, y: 22, w: 48, h: 78 }
    role: 本文ブロック
  - id: body-right
    area: { x: 52, y: 22, w: 48, h: 78 }
    role: 図・補足
```

## Slots（埋めるべき中身）
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | ページ見出し | 全角20字以内 |
| body-left | 主張・本文 | 80〜120字 |
| body-right | 図またはキーワード | 図1点 or 箇条3点 |

## Authoring Notes（AIへの指示）
- {このパターンを再現させるときの注意。要素数の上限、余白の取り方、避けるべき崩れ方など}
```

### ルール
- 配置は **canvas 全体（0〜100%）に対する % 指定**（デザインシステムの解像度に依存しないため）。
  各 region の座標は `x + w <= 100` / `y + h <= 100` を満たし、**意図しない領域の重なりを作らない**こと。
- region は **DESIGN の Frame が予約する領域を避ける**こと。標準では下端（page-number/footer 用に下 8% 程度）を空ける。
- **タイトルの二重化を避ける（役割分担を厳守）：** 同じ1つのタイトルについて、
  - **配置（どこに置くか・大きさの領域）＝ LAYOUT の `title` region が決める。**
  - **装飾（色・フォント・縦線などの見た目）＝ DESIGN の Frame `title-area` が決める。**
  両者は排他なので衝突しない。万一指定が重なった場合は、**配置は LAYOUT、装飾は DESIGN を採用**する。
  LAYOUT 側で色やフォントを書かないこと（書いた時点でルール違反）。
- **色・フォントは絶対に書かない**（それは DESIGN の役割。混ぜると再利用できなくなる）。
- `Slots` のスロット名は `Structure.regions[].id` と**一致**させる（食い違いは不可）。
- `category` は上記 10 種から選ぶ（ギャラリーの分類に使う）。
- サンプル HTML を作る場合は **グレースケール**で（色は DESIGN 側が決めるため）。
- 個別の確認用 HTML を出す場合のファイル名は `{name}.preview.html`（同じフォルダ）に固定する。

---

## 3. SLIDEKIT-DECK.md — 設計書（最終成果物）

1 つのプレゼン全体の設計書。**選んだ DESIGN と、各ページに割り当てた LAYOUT と、実コンテンツ**を
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
| 1 | 表紙 | cover-centered | タイトル・対象・日付 |
| 2 | 目次 | agenda-numbered | 本日の流れ |
| … | … | … | … |

## Slides
各スライドは**次の固定テンプレート**で書く（ばらつきを防ぐため）。

```markdown
### Slide {n} — {種類}（{pattern}）
**Structure:**（割り当てた LAYOUT の regions を埋め込み）
**Content:**（各スロットを実際の文言で埋める。スロット名は Structure の id と一致）
- {slot-id}: {実際の文言}
- {slot-id}: {実際の文言}
```

例：
```markdown
### Slide 1 — 表紙（cover-centered）
**Structure:** title{x12,y42,w76,h22} / eyebrow{x12,y34,w76,h8} / subtitle{x12,y66,w76,h10}
**Content:**
- eyebrow: 社内提案 2026
- title: 資料作成を、もっと速く・きれいに
- subtitle: 営業企画部　｜　2026年6月
```

## Generation Instructions
- このファイルを {Claude のデザイン機能 / NotebookLM 等} にアップロードして「このブリーフ通りにスライドを生成して」と指示する。
- 出力は PDF を推奨（デザイン再現性が高い）。
```

### ルール
- DESIGN と各 LAYOUT は **参照ではなく埋め込み**（AI に 1 ファイルで完結して渡すため）。
- 各スライドのスロットは **実際の文言で埋める**（プレースホルダのまま渡さない）。
- 枚数・構図はユーザー承認後に確定する（→ スキル `slidekit-assemble` が担当）。

---

## バージョン
- SPEC version: 1.0
- 後方互換のない変更時はメジャーバージョンを上げる。
