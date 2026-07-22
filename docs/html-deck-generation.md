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
  "noPageNoOn": [1],
  "headingStyle": "a",
  "iconStyle": "solid"
}
```

- `font` 省略時は `"Noto Sans JP"`、`pageNumbers` 省略時は `true`、`noPageNoOn` 省略時は `[]`。
- `headingStyle` 省略時は `"a"`。共通見出し（`.sk-h`）のデザインを `"a"`〜`"f"` の6種から選ぶ
  （`patterns/` 側の sk-head v5・`data-hstyle` と同じ6種。詳細は SPEC.md の「共通見出し」節）。
  未対応の値を指定した場合はビルド時に警告を出し `"a"` にフォールバックする。
- `iconStyle` 省略時は `"solid"`。`"solid"` / `"regular"` / `"light"` / `"thin"` / `"duotone"` /
  `"sharp"` の6種から選べる（詳細は下記「アイコンの使用ルール」）。フラグメント側は常に
  `fa-solid` で書けばよく、ビルダーが `build-html-deck.mjs` 内で指定スタイルへ一括変換する。
  未対応の値を指定した場合はビルド時に警告を出し `"solid"` にフォールバックする。
  `"light"` / `"thin"` / `"duotone"` / `"sharp"` はFont Awesome Proのスタイルのため、
  Free CDNのままではアイコンが表示されない（ビルド時に警告が出る。Pro Kit導入時のみ有効）。
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
   - `var(--sk-accent)`（メイン装飾色）
   - `var(--sk-accent2, var(--sk-accent))`（差し色。「ここぞの1箇所」だけに使う。合計金額・おすすめバッジ・最重要数値など。未定義環境ではメイン色にフォールバックさせるため必ずこのチェーン形で書く）
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

   - `headingStyle: "f"`（ドット＋英字ラベル型）を使う場合のみ、`.sk-h` に
     `data-label` 属性で英字ラベル文言を渡す（例: `<div class="sk-h" data-label="Flow">ご利用フロー</div>`）。
     他のスタイル（a〜e）では不要。
   - **見出しのみ**の場合、本文コンテンツは `top:76px` 以降に配置する。
   - **見出し＋メッセージライン**の場合、本文コンテンツは `top:128px` 以降に配置する。

   `.sk-h` / `.sk-msg` は `position:absolute` で置かれるため、パターン本来の flex flow
   （上から順に自然に積み上がる配置）には乗らない。したがって、コンテンツ側で
   `position:absolute; top:76px（または128px）; left:...; right:...; bottom:...;` のように
   明示的に開始位置を指定し、見出し・メッセージラインとの重なりを防ぐ必要がある。

4. **背景画像スライド（表紙等）の書き方。**

   ```html
   <img class="s1-bg" src="../../assets/covers/cover-bg-photo-architecture.jpg" alt="">
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

   リポジトリ内に無いアセットは、リポジトリの隣の **`../slidekit-private/`**（存在する場合のみ・
   非公開の追加素材置き場）からも同じ相対パスで解決される。非公開由来のアセットには
   `data-sk-asset` を付与しない（公開ギャラリーのスライド確認ページでは画像が表示されないが、
   デッキ単体の `index.html` では正常に表示される）。

5. **余白・強調は `SPEC.md` の共通ルールに従う。**
   - padding/marginの数値は4の倍数（4/8/12/16/24/32/40/48…）で揃える。
   - アクセント色による強調は1スライド1〜2箇所まで。面でなく線で使う。
   - 複雑な構図（円環図・ハブスポーク等）は避け、矩形・線・円・テキストだけで組む
     （詳細は [`docs/polish-rules.md`](./polish-rules.md)）。

6. **アイコンの使用ルール。**
   実デッキでアイコンが必要なときは **Font Awesome 6 Free（CDN）** を使う。
   絵文字・特殊文字記号（例: 🔍・●・▶ 等）でのアイコン代用は禁止。

   ```html
   <i class="fa-solid fa-chart-line" style="color:var(--sk-accent);"></i>
   ```

   - `build-html-deck.mjs` が出力する `index.html` の `<head>` には Font Awesome 6 Free の
     CDN（cdnjs）リンクが常時含まれるため、フラグメント側で追加の読み込みは不要。
   - アイコンの色は `var(--sk-accent)` を使う（直書き禁止のルールはアイコンにも適用される）。
   - サイズは `font-size` で調整する（アイコン専用の外部SVG・画像は使わない）。
   - フラグメントは常に `fa-solid`（例: `<i class="fa-solid fa-chart-line">`）で書く。
     他スタイルへの切替は下記の `iconStyle` 設定で一括変換する（手書きで `fa-regular` 等に
     しない）。

   **アイコンスタイルの種類と切替。**
   Font Awesome 6 は同じアイコン名のまま、スタイルプレフィックスを
   `fa-solid` / `fa-regular` / `fa-light` / `fa-thin` / `fa-duotone` / `fa-sharp` の
   6種に切り替えられる。ただし **無料版（Free CDN）で実際に使えるのは `solid` と `regular` の
   2種のみ**。`light` / `thin` / `duotone` / `sharp` は Font Awesome Pro 限定のスタイルで、
   Free CDNのままでは対応フォントが読み込まれずアイコンが表示されない。

   - **ギャラリー（`gallery/index.html`）** のツールバーに「アイコン」スタイル切替チップが
     あり、各パターンのプレビュー（サムネ・モーダル）でSolid⇔Regularなどをその場で
     見比べられる。選択は `localStorage('sk-fastyle')` に記憶される。
     Pro限定スタイル（Light/Thin/Duotone/Sharp）を選んだ場合、そのスタイルのFAフォントが
     実際に当たっているかを `computed font-family` で判定し、当たっていなければ自動的に
     `Solid` 表示にフォールバックする（チップ横に「Pro未導入のためSolid表示」と表示）。
   - **デッキ生成時**は `deck-config.json` に `"iconStyle": "solid"` のように指定すると、
     `build-html-deck.mjs` がビルド時にフラグメント内の `fa-solid` を指定スタイルへ
     一括変換して出力する（`duotone`/`sharp` はFA6の命名規則により内部的に
     `fa-duotone fa-solid` / `fa-sharp fa-solid` の複合クラスになる）。
   - **将来Font Awesome Pro Kitを導入する場合**は、パターン（`patterns/*.html`）およびデッキ
     ビルダー（`build-html-deck.mjs`）が読み込んでいる Free CDN の `<link rel="stylesheet"
     href="https://cdnjs.cloudflare.com/.../all.min.css">` を、Pro Kitのスクリプトタグ
     （`https://kit.fontawesome.com/<kit-id>.js` 等）に差し替えることで `light`/`thin`/
     `duotone`/`sharp` も含め全スタイルが有効になる。差し替え箇所は
     `patterns/*/*.html` の `<head>` と `tools/html-deck/build-html-deck.mjs` の
     `buildDocument()` 内のCDNリンクの2箇所。

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
- ビルダーは各 `<section class="slide">` に **`data-sk-src="{元フラグメント名}"`** を、
  リポジトリ由来アセットの `<img>` には **`data-sk-asset="{リポジトリルートからの元パス}"`** を自動付与する。
  これらはギャラリーの**スライド確認・修正依頼ページ**（下記）がスライドの特定・画像の復元に使う（手で書く必要はない）。

## スライド確認・修正依頼ページ（確認・フィードバック・PDF保存）

生成した `index.html` は、ギャラリーの **スライド確認・修正依頼ページ**
（本番: `https://slidekit-sigma.vercel.app/gallery/deck.html` ／ ローカル: `/gallery/deck.html`）に
貼り付け（またはドラッグ＆ドロップ）するとスライドとして表示できる。

- **スライド別フィードバック**: 各スライドの下の欄に修正指示を記入。構図パターンを変えたい場合は
  ギャラリーで探したID（P045等）を「構図パターン変更」欄に記入。
- **カラーパレット**: ヘッダーのパレットチップで配色の試着ができる（メイン/アクセント/ベース/フォント#333の4色セット）。
- **修正プロンプトを出力**: 記入内容＋パレット変更を1つのプロンプトにまとめてコピー→Claude Codeに
  貼り付けると、スライド番号と元ファイル名（data-sk-src）付きで修正依頼が渡る。
- **PDFとして保存**: ブラウザの印刷ダイアログ経由でそのままPDF化できる（`@page` 960×540が効く）。
- 入力したフィードバックはブラウザのlocalStorageに自動保存される（同じデッキを読み直すと復元）。

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
