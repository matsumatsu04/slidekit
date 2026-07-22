# SLIDEKIT-DECK.md → pptx 直接生成ガイド（代替ルート）

> **2026/7改定: 既定の納品ルートは HTMLデッキ（`docs/html-deck-generation.md`）になった。**
> この pptx ルートは「編集可能形式（Google Slides）が必要な案件のみ」の代替として使う。

DECKファイルから、**後から文字修正できる編集可能な `.pptx`** を直接生成する手順。
スライド生成AI（画像ベース）を経由しないため、テキスト・図形が全てPowerPoint/Googleスライドのオブジェクトとして残る。

検証済み: 2026/7/2 `examples/ai-seminar-deck` 16枚を `tools/pptx/build-pptx.mjs` で生成し、
別エージェントの視覚QA（1サイクル）をパス。

## 必要ツール

| ツール | 用途 | 導入 |
|---|---|---|
| Node.js + pptxgenjs | pptx生成 | `cd tools/pptx && npm install`（初回のみ） |
| LibreOffice (`soffice`) | レンダリングQA用のPDF変換 | `brew install --cask libreoffice` |
| Poppler (`pdftoppm`) | PDF→画像変換（QA用） | `brew install poppler` |

## 手順（標準: ビルダー使用）

### 1. deck.json を書き、ビルダーで生成する

**毎回スクリプトを書かない。** `tools/pptx/build-pptx.mjs` に deck.json を渡す。

```bash
cd tools/pptx
node build-pptx.mjs <deck.json> <out.pptx>
```

deck.json は SLIDEKIT-DECK.md と同じ内容の機械可読版（スキーマは build-pptx.mjs 冒頭コメント参照）:
- `theme`: DECKのDesign Systemの色・フォント（`#`なし6桁HEX）
- `slides[]`: `pattern`（SLIDE-PATTERN名）・`heading`（共通見出し文言 or null）・`content`（パターン別スロット）

**レンダラ実装済みパターン**（それ以外は `bullets` フォールバック。増やす場合は build-pptx.mjs に追記）:
cover-gradient-text-bottom / agenda-toc / section-divider / key-message-single /
numbered-list-with-body / three-column-icon-card / four-step-flow / two-column-split-boxes /
summary-three-points / three-stage-circle-flow / icon-left-text-list / before-after-two-col /
three-kpi-big-number / faq-single-column / bullets

**変換の約束事（ビルダー内で実装済み。新レンダラ追加時も従う）:**
- キャンバス: `LAYOUT_16x9`（10in × 5.625in）。px指定は **128px = 1inch** で換算（1280×720基準）
- フォントサイズは **pt = px × 0.75** で換算（24px → 18pt）
- 色は **`#`なしの6桁HEX**（`#`を付けるとファイルが壊れる）
- カード内の本文テキストは **`valign:"top"` を明示**（pptxgenjsの既定はmiddleで、本文がカード中段に浮く）
- 日本語の語中折返しを防ぐ: テキストボックス幅を最大化し、長い強調文は deck.json 側で `"br": true` によるフレーズ改行を入れる
- カード高さは内容量に合わせ、残り領域に対して垂直センター配置（下だけ空く画面を作らない）

装飾の設計は **`docs/polish-rules.md`**（参考デッキから抽出した磨き上げルール）に従う。
新レンダラを書くときも「1装飾=図形3個まで・矩形/線/円/テキストのみ」を守る。

**デザインテーマとAI一般則が矛盾する場合はデザインテーマを優先する**
（例: minimalの「見出し下の全幅アクセント下線」は仕様なので入れる）。

### 2. レンダリングQA（必須・1サイクル）

```bash
soffice --headless --convert-to pdf deck.pptx --outdir .
pdftoppm -jpeg -r 100 deck.pdf slide
```

生成した `slide-N.jpg` を**生成に関与していないサブエージェント**に渡し、
はみ出し・重なり・不自然な改行（語中折返し）・整列ズレ・余白の偏りを指摘させる。
指摘を修正して該当スライドのみ再レンダリング確認。1サイクルで止める（微調整の無限ループをしない）。

### 3. 納品 — Google Slides変換が第一候補

代表の方針（2026/7/2）: **最終納品はGoogle Slides**。Keynoteは使わない。

google-drive MCPの `uploadFile` で変換アップロードする:

```
uploadFile:
  localPath: <生成した.pptxの絶対パス>
  name: <スライド名>
  convertToGoogleFormat: true
  mimeType: application/vnd.openxmlformats-officedocument.presentationml.presentation  ← 必須（自動判定はoctet-streamになり失敗する）
```

返ってきたGoogle Slidesの編集リンクを代表に渡す（全テキスト・図形が編集可能なオブジェクトとして保持されることを2026/7/2に検証済み）。
Drive MCPが使えない環境では `.pptx` ファイルをそのまま納品する。

## 制約・既知の注意

- フォントはDECK指定（例: Noto Sans JP）をそのまま `fontFace` に設定する。
  Google Slidesは Noto Sans JP を標準サポートしているため相性が良い
- グラフはpptxgenjsのネイティブチャート（`addChart`）を使い、画像化しない（編集可能性を保つ）
- QAレンダリングはLibreOffice経由が安定（KeynoteのAppleScript自動操作はmacOSの権限でブロックされる）
