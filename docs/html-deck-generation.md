# HTMLデッキビルダー生成ガイド

`slides/` フラグメント＋`deck-config.json` から、1ファイルの `index.html` を組み立て、
そのまま PDF・QA画像まで書き出す標準フロー。

## 全体像

SlideKit には最終出力ルートが2つある。

```
【従来ルート】 SLIDEKIT-DECK.md / deck.json → tools/pptx/build-pptx.mjs → .pptx（→Google Slides）
【新ルート】   slides/*.html + deck-config.json → tools/html-deck/build-html-deck.mjs
              → index.html → tools/html-deck/export-pdf.sh → deck.pdf / qa-*.jpg
```

新ルートは「編集可能なオブジェクトとしてpptxに落とす」ことより、
「HTMLでレイアウトを組んでそのままPDF化する」ことを優先したいときに使う。
どちらのルートも `patterns/` の構図パターンと `SPEC.md` の共通ルールを土台にする点は同じ。

Google Slidesへの編集可能ファイルとしての納品が必要な場合は、従来通り
`tools/pptx` ルート（[`docs/pptx-generation.md`](./pptx-generation.md)）を使う。

## 入力ファイル

```
<デッキフォルダ>/
├─ deck-config.json
└─ slides/
   ├─ 01-cover.html
   ├─ 02-body.html
   └─ 03-kpi.html
```

`deck-config.json`:

```json
{
  "title": "デッキ名",
  "theme": { "accent":"#1E2E53", "soft":"#E8EBF2", "text":"#333333", "muted":"#8A8F98", "bg":"#FFFFFF" },
  "font": "Noto Sans JP",
  "pageNumbers": true,
  "noPageNoOn": [1]
}
```

- `font` 省略時は `"Noto Sans JP"`、`pageNumbers` 省略時は `true`、`noPageNoOn` 省略時は `[]`。
- `slides/` 内のファイルはファイル名の文字列ソートで順序が決まる。連番プレフィックス
  （`01-`, `02-`…）を必ず付ける。

## スライドフラグメントの書き方ルール

1. **パターンをコピーして流用する。**
   `patterns/SLIDE-PATTERN-{name}/SLIDE-PATTERN-{name}.html` の `.slide` 構造・CSSをコピーし、
   クラス名に `s{連番}-` プレフィックスを付け（例: `s2-item`, `s2-badge`）、テキストを実文言に
   差し替える。**レイアウト構造・数値（px値等）は変えない**（パターンギャラリーが正）。
   `s{連番}-` プレフィックスはスライド間のクラス名衝突を防ぐための取り決めで、
   ビルダー側は一切スコープ処理をしないため、この命名規則を守ることが唯一の防御策になる。

2. **色は変数注入のみ。直書き禁止。**
   使えるのは次の値だけ:
   - `var(--sk-accent)`
   - `var(--sk-soft)`
   - `var(--sk-muted)`
   - `#333333`（本文文字色）
   - `#8A8F98`（既定muted。CSS変数のフォールバック値としてのみ使う）

3. **共通見出しは `.sk-h` / `.sk-msg` を使う（パターン内蔵の `sk-head`/`data-heading` は使わない）。**
   `patterns/*.html` にある `sk-head` / `data-heading="on"` の仕組みはグレースケール確認用のもので、
   HTMLデッキビルダーでは使わない。ビルダーが `index.html` に埋め込む共通CSSに、次のクラスが
   常に用意されている。

   ```css
   .sk-h { position:absolute; top:0; left:40px; right:40px; padding:24px 0 12px;
           border-bottom:2px solid var(--sk-accent); font-size:24px; font-weight:700; color:#333; }
   .sk-msg { position:absolute; top:82px; left:40px; right:40px; font-size:16px; color:#333; }
   ```

   フラグメント側は `<div class="sk-h">タイトル文言</div>` と、必要なら
   `<div class="sk-msg">結論1行</div>` を書くだけでよい。

   - **見出しのみ**の場合、本文コンテンツは `top:76px` 以降に配置する。
   - **見出し＋メッセージライン**の場合、本文コンテンツは `top:128px` 以降に配置する。

   `.sk-h` / `.sk-msg` は `position:absolute` で置かれるため、パターン本来の flex flow
   （上から順に自然に積み上がる配置）には乗らない。したがって、コンテンツ側で
   `position:absolute; top:76px（または128px）; left:...; right:...; bottom:...;` のように
   明示的に開始位置を指定し、見出し・メッセージラインとの重なりを防ぐ必要がある。

4. **背景画像スライド（表紙等）の書き方。**

   ```html
   <img class="s1-bg" src="../../assets/brand/brand-b/cover-bg-logo.png" alt="">
   ```

   ```css
   .s1-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
   ```

   `src` の `../../` の深さは正確でなくてよい。ビルダーは `src` の値の中に出てくる
   `"assets/"` という文字列以降の部分だけを取り出し、それを**リポジトリルートからの相対パス**
   として解決する。存在すればデッキフォルダの `assets/` にファイル名だけでコピーし、
   `src` を `assets/<ファイル名>` に書き換える（存在しない場合は警告を出してスキップし、
   ビルドは失敗させない）。そのため、フラグメントを書くディレクトリ階層がどこであっても
   気にせず `assets/...` を含むパスを書けばよい。

5. **余白・強調は `SPEC.md` の共通ルールに従う。**
   - padding/marginの数値は4の倍数（4/8/12/16/24/32/40/48…）で揃える。
   - アクセント色による強調は1スライド1〜2箇所まで。面でなく線で使う。
   - 複雑な構図（円環図・ハブスポーク等）は避け、矩形・線・円・テキストだけで組む
     （詳細は [`docs/polish-rules.md`](./polish-rules.md)）。

## ビルド

```bash
node tools/html-deck/build-html-deck.mjs <デッキフォルダ>
```

- `<デッキフォルダ>/index.html` に1ファイルで出力される。
- 各フラグメントの `<style>` は、ビルダーが埋め込む共通CSSの後にそのまま連結される
  （クラス名衝突の回避は上記の `s{連番}-` プレフィックス命名に委ねる）。
- 使用しているアセットは `<デッキフォルダ>/assets/` にコピーされ、`index.html` は
  外部の絶対パスに依存しない自己完結ファイルになる。
- 実行後、処理したスライド枚数・コピーしたアセット枚数・出力パスがコンソールに表示される。

## PDF書き出し・QA手順

```bash
bash tools/html-deck/export-pdf.sh <デッキフォルダ>
```

- Google Chromeのヘッドレスモードで `index.html` を `deck.pdf` に変換し（`@page` で
  960×540pxの1枚1ページに固定）、続けて `pdftoppm` で `qa-1.jpg`, `qa-2.jpg`… という
  目視確認用のJPEG画像を生成する。
- `index.html` が無い場合は「先に build-html-deck.mjs を実行してください」と表示して終了する。
- 生成された `qa-*.jpg` を実際に開いて目視確認する。確認観点:
  - はみ出し・要素の重なりがないか
  - 見出し（`.sk-h`）・メッセージライン（`.sk-msg`）と本文コンテンツが重なっていないか
  - アクセント色がテーマ通りに反映されているか
  - ページ番号が `noPageNoOn` の指定通りに出ている／出ていないか
- 崩れがあれば該当フラグメントHTMLを直して再ビルド・再PDF化・再確認する
  （1〜2サイクルで収束させる。無限に微調整を繰り返さない）。

## Google Slidesへの納品が必要な場合

このHTMLルートはPDF/画像としての最終出力に向いている。**編集可能なオブジェクトとして
PowerPoint/Google Slidesに納品する必要がある場合は、このルートではなく従来通り
`tools/pptx` ルート**（[`docs/pptx-generation.md`](./pptx-generation.md)）を使うこと。
