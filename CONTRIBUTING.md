# CONTRIBUTING — 構図パターンを提案する

SlideKit の構図パターンライブラリ（`patterns/SLIDE-PATTERN-*`）は、誰でも提案（Pull Request）できます。
承認されたパターンは公開ギャラリーに載り、SlideKit を使う全員の手元に `git pull` で届きます。
このページは「何を受け付けるか」「どう出すか」「どう見られるか」をまとめたものです。

> パターンを作った本人は、承認を待たずにそのまま自分の環境で使えます。承認は「共有（ギャラリー掲載）」のためのゲートであって、
> 「利用」のためのゲートではありません。

---

## 受け付けるもの

| 受け付ける | 受け付けない |
|---|---|
| **構図パターン**（`patterns/SLIDE-PATTERN-{name}/` の `.md` ＋ `.html` の2ファイル） | デザインテーマ・ギャラリー本体・スキル・ツールの変更（これらは Issue で相談してください） |
| 色・フォント・実コンテンツを含まない「要素の置き方」だけの定義 | 特定の色（`#2f62a6` 等）やフォント指定を含むもの |
| ダミー文言（「メインタイトルが入ります」「会社名が入ります」等） | 実案件の文言・社名・人名・数値・画像 |
| 既存 `assets/` の素材を参照するだけの HTML | `assets/` への素材追加（画像・フォント・SVG ファイル等） |
| 静的な HTML／CSS だけで組んだ確認用 HTML | `<script>`・`on*=` 属性・`<iframe>`・外部スクリプト（公開ギャラリーが iframe で描画するため） |
| 1 PR ＝ 1 パターン（推奨。`propose-pattern.sh` は 1 パターンずつ PR を作ります） | 1 PR に複数パターンを詰める（レビューと差戻しが絡まるため。複数あるならパターンごとに提案する） |

パターンの形式（フロントマター・必須セクション・HTML の骨格）は [`SPEC.md`](./SPEC.md) の「2. SLIDE-PATTERN-{name}.md」が正です。

## 流れ

```
slidekit-layout で作る → lint → propose-pattern.sh → Pull Request → CI → レビュー → Merge
   → ID 自動採番（Action）→ ギャラリー反映 → 全員の手元へ（git pull）
```

1. **作る**: Claude Code（このリポジトリのフォルダで `claude`）に「構図パターンを作って」と頼む。`slidekit-layout` スキルが
   `patterns/SLIDE-PATTERN-{name}/` に `.md`（フロントマター付き）と `.html`（グレースケール確認用・960×540）を作ります。
2. **lint**: `node tools/lint-pattern.mjs {name}`（Node.js 18 以上）。違反が出たら直して再実行し、違反ゼロにします。
   続けて `node tools/build-manifest.mjs` を実行すると、手元の一覧（`manifest.json` / `INDEX.md`）に `pending` として載り、その場で使えます。
3. **提案**: Claude Code に「このパターンをギャラリーに提案して」と頼む（または自分で `bash tools/propose-pattern.sh {name}`）。
   スクリプトが fork の用意 → パターンフォルダだけをコピー → `pattern/{name}` ブランチ → push → Pull Request 作成まで行い、PR の URL を表示します。
   - 前提: GitHub アカウントと GitHub CLI（`gh`）。初回だけ `gh auth login` が必要です。
4. **CI**: PR に対して lint・一覧の整合・変更範囲（`patterns/SLIDE-PATTERN-*/` 以外を触っていないか）が自動でチェックされ、
   実寸スクリーンショットが artifact `pattern-previews` として残ります。
5. **レビュー**: 所有者が確認します（下記「レビュー基準」）。修正が必要な場合は PR にコメントが付きます。
6. **Merge → 自動採番**: マージされると GitHub Action が `id: pending` に番号を振り（`manifest.json` の `next_id`）、
   `manifest.json` / `INDEX.md` / 件数表記を再生成してコミットします。ギャラリーにも反映されます。
7. **手元へ**: 次に「スライドを作って」と言うと更新確認で `git pull` が提案され、新パターンが届きます（自分で `git pull` してもOK）。

## ルール

- 提案したパターンは **MIT License で公開**されます（本リポジトリと同じ）。これに同意した上で提案してください。
- **自作、または権利のクリアな構図**だけを提案してください（他者のスライド HTML の丸写しは不可。「構図の考え方」を参考にするのは可）。
- **実案件の文言・画像・社名・個人名を入れない**（ダミー文言のみ）。公開ライブラリに載ることを前提に作ります。
- **ID は付けない**。フロントマターは `id: pending` のまま提出します（採番はマージ時に自動）。
- **`patterns/manifest.json` と `patterns/SLIDE-PATTERN-INDEX.md` を手で触らない**（生成物です。CI が差分を検出して失敗させます）。
  PR に含めるのは `patterns/SLIDE-PATTERN-{name}/` の 2 ファイルだけです（`propose-pattern.sh` を使えば自動でそうなります）。
- 既存パターンのフォルダを上書きして「改良版」にしない（別名で新規に作る。既存の修正は Issue で相談）。

## レビュー基準

| 観点 | 見るところ |
|---|---|
| **SPEC 準拠** | フロントマター 6 キー（name / category / summary / scenes / tier / id）・4 節（Overview / Structure / Elements / Usage Guide）・色を持たない・タイトル枠を持たない |
| **lint 通過** | CI の `lint-pattern` が緑（グレー階調と `var(--sk-*)` のみ・`<script>` なし・絵文字なし・2 ファイルのみ・素材追加なし） |
| **実寸で崩れない** | 960×540 のスクリーンショット（CI artifact）で、はみ出し・重なり・線の端点のガタツキがない。項目数が変わっても本文が上下中央に保たれる構造（SPEC「本文エリアの縦配置」「接続線・罫線の端点」） |
| **既存と重複しない** | 同じ用途・ほぼ同じ配置のパターンが既にないか（`SLIDE-PATTERN-INDEX.md` を確認）。差分が「色だけ」「文言だけ」なら不採用 |
| **汎用性** | 特定の業種・案件でしか使えない構図でない。ダミー文言で意味が伝わる |

差戻しの理由は PR のコメントに 1 行で書かれます。直して同じコマンドを実行すれば同じ PR が更新されます（下記）。

## やりがちな誤り（実例つき）

| やりがちな誤り | 何が起きるか | 正しくは |
|---|---|---|
| **`manifest.json` に自分で 1 行足してしまう** | 生成物なので次の再生成で消える。CI の整合チェック（`build-manifest --check`）が赤になる | 触らない。`node tools/build-manifest.mjs` に任せる |
| **`P150` を自分で振ってしまう** | 同時期の別提案と番号が衝突する。lint で「未知の ID」として落ちる | `id: pending` のまま出す。番号はマージ時に自動 |
| **クライアント名がタイトルに残る**（「株式会社◯◯ 御中」「◯◯様 ご提案書」） | 公開ライブラリに実名が載る（MIT で再配布される） | 「メインタイトルが入ります」「会社名が入ります」等のダミー文言 |
| **絵文字をアイコン代わりに使う**（✅ 🔍 ▶ ●） | 環境でグリフが変わり崩れる。lint で落ちる | Font Awesome Solid（`<i class="fa-solid fa-check"></i>`） |
| **`#2f62a6` のような固定色を書く** | パレット切替に追従せず、その色で固定される。lint で落ちる | `var(--sk-accent, #4A4A4A)` などの変数＋グレー階調。濃淡は `color-mix(in srgb, var(--sk-accent), #FFF 70%)` |
| **`<script>` で動きを付ける／`onclick=` を書く** | 公開ギャラリーが iframe で描画するため禁止。lint で落ちる | 静的な HTML／CSS だけで表現する |
| **フォルダにスクショや下書きを一緒に入れる** | 「2 ファイルのみ」の規約に反し lint で落ちる | スクショは `output/` などパターンフォルダの外へ |
| **既存パターンを上書きして出す** | 既存 ID の意味が変わり、他の人のデッキが壊れる | 別名で新規フォルダを作る |
| **PR に `.claude/` や `gallery/` の変更を混ぜる** | 変更範囲チェックで失敗する（所有者以外は `patterns/SLIDE-PATTERN-*/` のみ） | パターンフォルダだけにする。他の提案は Issue で |

## リクエストだけしたい方へ

「こういう構図が欲しい」だけでも歓迎です。Issue の **「パターンリクエスト」テンプレート**（New issue → パターンリクエスト）から、
用途・欲しい構図の説明・参考画像（あれば）を書いてください。

- 対応期限（SLA）はありません。
- 誰が拾って PR にしても構いません（リクエストした本人以外が作ってもOK）。
- 参考画像を貼るときは、権利上問題のないもの（自作・許諾済み）にしてください。

## 差戻し時の直し方

1. PR のコメントを読み、`patterns/SLIDE-PATTERN-{name}/` の**中だけ**を直す（他のファイルは触らない）
2. `node tools/lint-pattern.mjs {name}` → 違反ゼロを確認 → `node tools/build-manifest.mjs`
3. もう一度 `bash tools/propose-pattern.sh {name}`（Claude Code なら「もう一度提案して」）
   → 同名ブランチ `pattern/{name}` に追加 push され、**同じ PR** が更新されます（新しい PR は作られません）

## 困ったとき

- `gh` が無い／ログインしていない: `brew install gh`（macOS）または https://cli.github.com/ から導入し、`gh auth login` を一度実行
- lint の意味が分からない: 表示されたメッセージをそのまま Claude Code に貼って「直して」と頼めば直せます
- それ以外は Issue でどうぞ
