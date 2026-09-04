---
name: closing-curve-shape-footer
category: まとめ
summary: 右下に大きな曲面が入る画像背景。左80pxに KICKER・見出し32px・64pxの細い罫線を組み、連絡先だけはフッターに「ラベル＋値」の組で横並びに置く締め。背景は画像アセット（色ティント対象外）
scenes: プレゼンの最終スライド（連絡先提示）。表紙 cover-curve-shape-left と揃えて使うと統一感が出る
tier: high
id: P110
---
# SLIDE-PATTERN: closing-curve-shape-footer

このファイルはスライドのレイアウトパターン定義書です。締めは共通見出し（`sk-head`）を付けない種類のスライドで、
ワードマーク・©・頁番号などのフッターはHTMLデッキビルダー（フレーム v2）が描くため、このファイルには含みません。
背景は `assets/covers/` の画像アセットを使うため、ギャラリーの色ティントは適用されません。

## Overview
**パターン名：** closing-curve-shape-footer
**概要：** 右下に大きな曲面が入る画像を全面に敷き、左80pxに「英字KICKER → 見出し32px（1〜2行）→ 幅64pxの細い罫線」を積む。連絡先はこのパターンだけ本文ブロックに続けず、スライド下端のフッター行に「ラベル（KICKER 10px）＋値（16px）」の組を横並びで置く。ラベルと値は各組の中で左端がそろう。
**適したシーン：** プレゼンの最終スライド（連絡先・次のアクションの提示）。表紙 `cover-curve-shape-left` と同じ背景で揃えると、表紙〜締めでトーンが通る。

## Structure（構造）
```yaml
layout: closing-curve-shape-footer
background:
  image: assets/covers/cover-bg-curved-shape.jpg   # center/cover・全面。差し替え可（色ティント対象外）
  note: 右下に曲面、左上は淡いクリーム。文字は左〜中央の余白に置く
wrap:                              # left 80px・width 420px・top 0 / bottom 140px の間で上下中央・縦積み gap 20px
  kicker: "CLOSING"                # 10px / 700 / 字間 .2em / 大文字 / var(--sk-ink)
  message: 締めの見出し 1〜2行      # 32px / 700 / 字間 .06em / 行間 1.35 / var(--sk-ink)
  rule: 64×1px                     # var(--sk-muted)
foot:                              # left 80px・bottom 56px・横並び gap 36px（このパターン固有の構図）
  items: 2〜3
  item:                            # 縦積み gap 8px。ラベルと値の左端がそろう
    label: "COMPANY / MAIL / WEB"  # 10px / 700 / 字間 .2em / 大文字 / var(--sk-muted)
    value: 連絡先の値               # 16px / 400 / 字間 .06em / var(--sk-ink)
```

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| 背景画像 | 全面 | 右下に暖色の曲面が入る素材。左上のクリーム面が文字の置き場になる。別アセットに差し替え可 |
| KICKER | 文字ブロック最上 | `CLOSING` など、締めであることを示す英字ラベル。明るい地なのでインク色 |
| 見出し | KICKERの下 | 「お問い合わせはこちらから」等を32px・700で1〜2行。`<br>` は意味の切れ目で切る |
| 細い罫線 | 見出しの下 | 幅64px・1pxの区切り。見出しの下端を締める |
| フッター行 | 左下 | 「ラベル＋値」の組を横並びで2〜3個。曲面に被らないよう左半分に収める |

## Usage Guide（AIへの使い方）
### プロンプト例
```
SLIDE-PATTERN-closing-curve-shape-footer を使って締めを1枚生成してください。
【KICKER】CLOSING
【見出し】お問い合わせは／こちらから
【フッター】COMPANY: サンプル株式会社 ／ MAIL: info@example.com ／ WEB: example.com
```
### 注意点
- 本文ブロックは左80px・幅420pxに収める。フッター行は左端から520pxまでに収め、右下の曲面に重ねない
- 見出しは32pxで1〜2行、1行あたり全角10文字まで。入らなければ文言を短くする（文字を小さくしない）
- フッターの組は2〜3個。値が長いときは組を2個に減らす（文字を小さくしない）
- 連絡先の値はダミー。実在ドメインは書かない（`example.com` は文書用の予約ドメイン）
- 影・グラデーションのテキスト装飾は使わない。装飾は幅64pxの罫線1本まで
- 連絡先を本文ブロックの中に縦積みしたい場合は `closing-blob-thanks-left` / `closing-art-brush-contact` を使う
- 背景に画像を敷くため、ギャラリーの色ティント（アクセント色の差し替え）は効かない

## v2 での描き直し（2026-09-04）
- 46pxの特大メッセージ＋15pxの結びラベルをやめ、KICKER 10px → 見出し32px → 幅64pxの細い罫線という共通の組みに変え、左端を72pxから80pxにそろえた
- 純黒寄りの #1F1F1F / #1A1A1A / #333333 / #666666 をやめ、本文はインク色 `var(--sk-ink)`、ラベルは `var(--sk-muted)` に統一。太さは400と700の2つだけにした
- フッターは現行の横並び構図を残したまま、「会社名（18px太字）｜連絡先13px｜URL13px」のベースライン並置から「ラベル（KICKER 10px）の下に値16px」の組に変え、ラベルと値の左端をそろえた（背景画像はそのまま維持）
