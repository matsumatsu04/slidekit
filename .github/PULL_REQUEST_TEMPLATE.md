<!--
構図パターン提案用の PR テンプレートです。
`bash tools/propose-pattern.sh <パターン名>` を使うと、二重波括弧のプレースホルダ（name / category / summary / scenes / tier）は自動で埋まります。
手で PR を作る場合は各プレースホルダを書き換えてください。提案の決まりは CONTRIBUTING.md を参照。
-->

## パターン名

`{{name}}`（`patterns/SLIDE-PATTERN-{{name}}/`）

## カテゴリ

{{category}}

## 概要

{{summary}}

## 適したシーン

{{scenes}}

## tier（再現性）

`{{tier}}`（high = 自動生成でも崩れない ／ mid = 規則的だが要素多め ／ low = 多要素図解）

## プレビュー

- CI の artifact **`pattern-previews`**（このPRの Checks → Summary 下部）に実寸 960×540 のスクリーンショットが入っています
- ローカルで見る場合: リポジトリ直下で `python3 -m http.server 8930` → `http://localhost:8930/gallery/view.html?p={{name}}&pal=navy`
- マージ後は `https://slidekit-sigma.vercel.app/gallery/view.html?p={{name}}&pal=navy`

## チェックリスト（提出者）

- [ ] `node tools/lint-pattern.mjs {{name}}` が違反ゼロで通った
- [ ] 実寸（960×540）のスクリーンショットで目視した（はみ出し・重なり・線の端点なし）
- [ ] 文言はダミーのみ（実案件の文言・社名・人名・数値・画像を含まない）
- [ ] 自作、または権利のクリアな構図である（MIT License での公開に同意する）
- [ ] フロントマターは `id: pending` のまま（番号を自分で付けていない）
- [ ] `patterns/manifest.json` / `patterns/SLIDE-PATTERN-INDEX.md` を編集していない
- [ ] `assets/` への素材追加なし・`<script>` なし・絵文字アイコンなし
- [ ] [CONTRIBUTING.md](https://github.com/matsumatsu04/slidekit/blob/main/CONTRIBUTING.md) を読んだ
