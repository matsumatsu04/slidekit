# SlideKit 制作プログレス

新規public GitHubリポジトリとして配布する、スライド設計フォーマット＋3スキル＋ギャラリーの制作記録。
（X記事「SLIDE.md」シリーズの構造・考え方を参考に、名前・中身はすべて新規オリジナルで作成。既存資産は不参照。）

## フェーズ

- [x] **Phase 0** — プロジェクト雛形 ＋ 3ファイル形式の仕様（`SPEC.md`）
- [x] **Phase 1** — スキル① `slidekit-design`（デザインシステム生成）＋ デモ（clean-mono-sans + sample.html）
- [x] **Phase 2** — スキル② `slidekit-layout`（構図パターン抽出）＋ 構図ライブラリ初期14パターン＋グレースケール一覧（patterns/preview.html）
- [x] **Phase 3** — スキル③ `slidekit-assemble`（ヒアリング→設計書生成）＋ デモ（examples/sample-proposal/SLIDEKIT-DECK.md）
- [x] **Phase 5** — ギャラリーサイト（gallery/index.html・14構図＋デザイン一覧/プレビュー/コピー/DL）＋ README/LICENSE/.gitignore ＋ ルートindex.html
- [x] **Phase 6a** — GitHub public リポジトリ作成＋push 完了 → https://github.com/matsumatsu04/slidekit
- [x] **Phase 6b** — Vercel公開完了 → https://slidekit-sigma.vercel.app/gallery/ （READMEのギャラリーURL差し替え済み）
- [x] **Phase 4** — 構図パターンを99種に拡充（作者の旧ライブラリ slide-pattern-library から統合）。ギャラリーを実物HTMLプレビュー表示に刷新

> ★ 3スキル（slidekit-design / slidekit-layout / slidekit-assemble）= 当初の主目的、完成。
> ★ 構図パターン= 上流(MIT)を取り込み済み。
- [x] **形式の整合** — SPEC を 1.1 に更新し、構図を `SLIDE-PATTERN` 形式・`patterns/` ライブラリに統一。
  `slidekit-layout`（新規パターンも SLIDE-PATTERN 形式で作成＋INDEX/manifest更新）・`slidekit-assemble`（INDEX/manifestから実在99種・12カテゴリを選択して埋め込み）・デモDECK（実在パターン名）を全て整合。旧 SLIDEKIT-LAYOUT 参照は一掃。
- [x] **ギャラリー色付け** — 閲覧者がカラーコード選択でプレビューをティント（mix-blend-mode・default ブルー）。

## 決定事項
- 命名: SlideKit。ファイル= `SLIDEKIT-DESIGN.md` / `SLIDEKIT-LAYOUT-{name}.md` / `SLIDEKIT-DECK.md`。スキル= `slidekit-design` / `slidekit-layout` / `slidekit-assemble`
- ポジショニング: 汎用・ブランド中立
- canvas: 1280×720（16:9）
- ローカル確認: `python3 -m http.server 8930 --directory .`（launch.json: slidekit）

## 成果物の場所
- 仕様: `SPEC.md`
- スキル: `skills/{slidekit-design,slidekit-layout,slidekit-assemble}/SKILL.md`
- デザインシステム: `design-systems/{name}/SLIDEKIT-DESIGN.md` + `sample.html`
- 構図パターン: `patterns/{category}/SLIDEKIT-LAYOUT-{name}.md`
- ギャラリー: `gallery/`
