# SlideKit

**AIでスライドを作るたびに、デザインも構図もバラつく問題を解決する設計フォーマット。**

SlideKit は、スライドの「見た目」と「構図」をマークダウンで分けて定義し、
最終的に1枚の設計書にまとめてスライド生成AI（Claude のデザイン機能・NotebookLM など）に渡すための仕組みです。
3つの Claude Code / Agent スキルと、すぐ使えるデザインシステム・構図パターンが付属します。

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
| `SLIDEKIT-DESIGN.md` | デザインシステム | 色・フォント・余白・枠 |
| `SLIDEKIT-LAYOUT-{name}.md` | 構図パターン | 要素の配置（色は持たない） |
| `SLIDEKIT-DECK.md` | 設計書（最終成果物） | 上記2種＋全スライドの実コンテンツ |

詳しい仕様は [`SPEC.md`](./SPEC.md) を参照してください。

## 3つのスキル

| スキル | できること |
|---|---|
| [`slidekit-design`](./skills/slidekit-design) | 参考スライド・サイト・画像から**デザインシステム**を生成（確認用 sample.html 付き） |
| [`slidekit-layout`](./skills/slidekit-layout) | キャプチャ等から**構図パターン**を抽出・定義（グレースケール確認HTML付き） |
| [`slidekit-assemble`](./skills/slidekit-assemble) | 内容をヒアリングし、デザイン×構図を組み合わせて**設計書 SLIDEKIT-DECK.md** を生成 |

## クイックスタート

### 1. スキルを導入する
このリポジトリを取得し、`skills/` の3フォルダを Claude Code のスキル置き場にコピーします。

```bash
git clone https://github.com/matsumatsu04/slidekit.git
# 例: 各スキルを ~/.claude/skills/ にコピー
cp -r slidekit/skills/slidekit-* ~/.claude/skills/
```

`design-systems/` と `patterns/` は、作業したいプロジェクトフォルダにコピーして使います。

### 2. 設計書をつくる
Claude Code で話しかけます。

```
プレゼンの設計書を作って
```

ヒアリング（タイトル・対象・目的・枚数・トーン）→ 内容を渡す → デザインを選ぶ →
構成案とパターン割り当てを承認 → `SLIDEKIT-DECK.md` が生成されます。

### 3. スライドに変換する
生成された `SLIDEKIT-DECK.md` を、スライド生成AI（Claude のデザイン機能の Slides など）に
アップロードして「このブリーフ通りに生成して」と指示します。出力は **PDF 推奨**。

> オリジナルのデザインを作りたいときは `slidekit-design`、
> 好きな構図を追加したいときは `slidekit-layout` を使います。

## 同梱物

- **デザインシステム**: `design-systems/`（汎用・ブランド中立のサンプル）
- **構図パターン**: `patterns/`（10カテゴリ・現在14種。[ギャラリー](https://slidekit-sigma.vercel.app/gallery/)で一覧・コピー・DL可）
- **設計書の例**: `examples/sample-proposal/SLIDEKIT-DECK.md`

## リポジトリ構成

```
slidekit/
├─ SPEC.md                 # 3ファイル形式の仕様
├─ skills/                 # 3つのスキル（SKILL.md）
├─ design-systems/         # デザインシステム + sample.html
├─ patterns/               # 構図パターン + グレースケール確認
├─ examples/               # SLIDEKIT-DECK.md の例
├─ gallery/                # 公開ギャラリー（静的サイト）
└─ index.html              # ルート → /gallery/ へ
```

## ライセンス

[MIT License](./LICENSE)
