# SlideKit

**AIでスライドを作るたびに、デザインも構図もバラつく問題を解決する設計フォーマット。**

SlideKit は、スライドの「見た目」と「構図」をマークダウンで分けて定義し、
最終的に1枚の設計書にまとめてスライド生成AI（Claude のデザイン機能・NotebookLM など）に渡すための仕組みです。
3つの Claude Code / Agent スキルと、すぐ使えるデザインテーマ・構図パターンが付属します。

🎨 **ギャラリー（構図パターン一覧）:** https://slidekit-sigma.vercel.app/gallery/

---

## なぜ SlideKit か

AIスライド生成は手軽ですが、こんな悩みがあります。

- 生成のたびにデザインの雰囲気が変わる（＝デザインがガチャ）
- 構図（要素の置き方）も毎回バラバラで、資料に統一感が出ない
- 画像出力だと後から編集しづらい

SlideKit は **「色・フォント」と「構図」を別々のファイルに分離**することで、
どちらも自分の好みに固定し、再現できるようにします。

## 3つのファイル

| ファイル | 役割 | 持つもの |
|---|---|---|
| `SLIDEKIT-DESIGN.md` | デザインテーマ | 色・フォント・余白・枠 |
| `SLIDE-PATTERN-{name}.md` | 構図パターン | 要素の配置（色は持たない） |
| `SLIDEKIT-DECK.md` | 設計書（最終成果物） | 上記2種＋全スライドの実コンテンツ |

詳しい仕様は [`SPEC.md`](./SPEC.md) を参照してください。

## 3つのスキル

| スキル | できること |
|---|---|
| [`slidekit-design`](./.claude/skills/slidekit-design) | 参考スライド・サイト・画像から**デザインテーマ**を生成（確認用 sample.html 付き） |
| [`slidekit-layout`](./.claude/skills/slidekit-layout) | キャプチャ等から**構図パターン**を抽出・定義（グレースケール確認HTML付き）。ギャラリーへの提案もここから |
| [`slidekit-assemble`](./.claude/skills/slidekit-assemble) | 内容をヒアリングし、デザイン×構図を組み合わせて**HTMLデッキ（index.html＋PDF）**と設計書 SLIDEKIT-DECK.md を生成 |

スキルは `.claude/skills/` にプロジェクトスキルとして入っているため、**このリポジトリのフォルダで Claude Code を起動するだけ**で使えます（コピー不要）。

## クイックスタート（2ステップ）

### 1. リポジトリを取得する

```bash
git clone https://github.com/matsumatsu04/slidekit.git
```

### 2. そのフォルダで Claude Code を起動して話しかける

```bash
cd slidekit && claude
```

```
スライドを作って
```

ヒアリング（タイトル・対象・目的・枚数・トーン）→ 内容を渡す → デザインテーマを選ぶ →
構成案とパターン割り当てを承認 → `index.html`（そのまま画面表示できるスライド）と `deck.pdf` が生成されます。
設計書 `SLIDEKIT-DECK.md` も併せて出力されるので、他のスライド生成AIに渡すこともできます。

> 以前の手順で `~/.claude/skills/` にスキルをコピーした方は、二重登録を避けるため削除してください:
> `rm -rf ~/.claude/skills/slidekit-*`

> オリジナルのデザインを作りたいときは `slidekit-design`、
> 好きな構図を追加したいときは `slidekit-layout` を使います。

### 更新する
構図パターンは随時増えます。`slidekit` フォルダで `git pull` するだけです
（「スライドを作って」の最初に Claude Code が更新の有無を確認し、あれば「更新しますか？」と聞きます）。

## 同梱物

- **デザインテーマ**: `design-systems/`（汎用・ブランド中立のサンプル）
- **構図パターン**: `patterns/`（14カテゴリ・131種。各パターンに恒久ID（P001〜）。[ギャラリー](https://slidekit-sigma.vercel.app/gallery/)で一覧・プレビュー・DL可。カラーパレット切替つき）
- **スライド確認・修正依頼ページ**: [`/gallery/deck.html`](https://slidekit-sigma.vercel.app/gallery/deck.html)（生成した `index.html` を貼り付け→スライド表示・スライド別フィードバック→修正プロンプト出力・ブラウザ印刷でPDF保存）
- **設計書の例**: `examples/sample-proposal/SLIDEKIT-DECK.md`

## リポジトリ構成

```
slidekit/
├─ SPEC.md                 # 3ファイル形式の仕様
├─ CONTRIBUTING.md         # 構図パターンの提案方法
├─ .claude/skills/         # 3つのスキル（SKILL.md）— プロジェクトスキルとして自動で有効
├─ design-systems/         # デザインテーマ + sample.html
├─ patterns/               # 構図パターン + グレースケール確認（manifest.json / INDEX.md は生成物）
├─ tools/                  # デッキビルド・lint・manifest生成・提案スクリプト
├─ docs/                   # 生成ガイド・装飾ルール
├─ examples/               # SLIDEKIT-DECK.md の例
├─ gallery/                # 公開ギャラリー（静的サイト）
└─ index.html              # ルート → /gallery/ へ
```

## コントリビュート（構図パターンの提案）

構図パターンは誰でも提案できます。詳しくは [`CONTRIBUTING.md`](./CONTRIBUTING.md) を参照してください。流れは次の3行です。

1. Claude Code の `slidekit-layout` でパターンを作る（`node tools/lint-pattern.mjs {name}` を通す）
2. 「このパターンをギャラリーに提案して」→ `bash tools/propose-pattern.sh {name}` で Pull Request が作られる
3. レビュー → マージ → ID が自動採番され、ギャラリーに反映（次回の `git pull` で手元にも届く）

パターンが欲しいだけの方は、Issue の「パターンリクエスト」テンプレートからどうぞ（対応期限はありません。誰が拾って PR にしても構いません）。

## ライセンス

- 本リポジトリの内容（スキル・仕様・デザインテーマ・構図パターンライブラリ・ギャラリー）は作者およびコントリビューターのオリジナル成果物であり、[MIT License](./LICENSE) で公開しています。提案（Pull Request）されたパターンも同ライセンスで公開されます。
