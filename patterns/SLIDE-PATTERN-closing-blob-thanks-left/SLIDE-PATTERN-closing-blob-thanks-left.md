---
name: closing-blob-thanks-left
category: まとめ
summary: 右に寄った有機的ブロブの画像背景。左80pxの白い余白に KICKER・お礼32px・64pxの細い罫線・連絡先（ラベル｜値の2列）を縦中央で積む締め。背景は画像アセット（色ティント対象外）
scenes: プレゼンの最終スライド（お礼・お問い合わせ誘導）。表紙 cover-blob-side-left と揃えて使うと統一感が出る
tier: high
id: P109
---
# SLIDE-PATTERN: closing-blob-thanks-left

このファイルはスライドのレイアウトパターン定義書です。締めは共通見出し（`sk-head`）を付けない種類のスライドで、
ワードマーク・©・頁番号などのフッターはHTMLデッキビルダー（フレーム v2）が描くため、このファイルには含みません。
背景は `assets/covers/` の画像アセットを使うため、ギャラリーの色ティントは適用されません。

## Overview
**パターン名：** closing-blob-thanks-left
**概要：** 右側に有機的なブロブが寄った画像を全面に敷き、左側に残る白い余白だけで文字を組む締め。左80pxから「英字KICKER → お礼のことば32px（1〜2行）→ 幅64pxの細い罫線 → 連絡先」を縦中央にそろえて積む。連絡先は「ラベル（KICKER 10px）｜値（16px）」の2列で、ラベルの左端どうし・値の左端どうしがそろう。
**適したシーン：** プレゼンの最終スライド（お礼＋お問い合わせ誘導）。表紙 `cover-blob-side-left` と同じ背景で揃えると、表紙〜締めでトーンが通る。

## Structure（構造）
```yaml
layout: closing-blob-thanks-left
background:
  image: assets/covers/cover-bg-organic-blobs.jpg   # center/cover・全面。差し替え可（色ティント対象外）
  note: 右側にブロブ、左側は白。文字は左の白い余白にだけ置く
wrap:                              # left 80px・width 340px・全高の上下中央・縦積み gap 20px
  kicker: "THANK YOU"              # 10px / 700 / 字間 .2em / 大文字 / var(--sk-ink)
  message: お礼のことば 1〜2行      # 32px / 700 / 字間 .06em / 行間 1.35 / var(--sk-ink)
  rule: 64×1px                     # var(--sk-muted)
  list:                            # grid 2列（auto 1fr）・列間 16px・行間 12px・ベースラインそろえ
    rows: 2〜3
    label: "COMPANY / MAIL / WEB"  # 10px / 700 / 字間 .2em / 大文字 / var(--sk-muted)
    value: 連絡先の値               # 16px / 400 / 字間 .06em / var(--sk-ink)
```

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| 背景画像 | 全面 | 右にブロブが寄った明るい素材。左の白い余白が文字の置き場になる。別アセットに差し替え可 |
| KICKER | 文字ブロック最上 | `THANK YOU` など、締めであることを示す英字ラベル。明るい地なのでインク色 |
| お礼のことば | KICKERの下 | 「ご清聴ありがとうございました」等を32px・700で1〜2行。`<br>` は意味の切れ目で切る |
| 細い罫線 | ことばの下 | 幅64px・1pxの区切り。ことばと連絡先を分ける |
| 連絡先ラベル | 各行の左列 | `COMPANY` `MAIL` `WEB` の英字ラベル（muted） |
| 連絡先の値 | 各行の右列 | 会社名・メール・URLを16pxで1行ずつ |

## Usage Guide（AIへの使い方）
### プロンプト例
```
SLIDE-PATTERN-closing-blob-thanks-left を使って締めを1枚生成してください。
【KICKER】THANK YOU
【ことば】ご清聴ありがとう／ございました
【連絡先】COMPANY: 会社名・ブランド名 ／ MAIL: info@example.com ／ WEB: www.example.com
```
### 注意点
- 文字は左の白い余白（左80px・幅340px）に収める。右のブロブには重ねない
- お礼のことばは32pxで1〜2行、1行あたり全角8文字まで。入らなければ文言を短くする（文字を小さくしない）
- 連絡先は2〜3行。4行以上になるなら値を1つにまとめる（行を増やして詰めない）
- 連絡先の値はダミー。実在ドメインは書かない（`example.com` は文書用の予約ドメイン）
- 影・グラデーションのテキスト装飾は使わない。装飾は幅64pxの罫線1本まで
- 背景に画像を敷くため、ギャラリーの色ティント（アクセント色の差し替え）は効かない
- 表紙 `cover-blob-side-left`、中扉 `section-photo-overlay-left` などと素材のトーンを揃える

## v2 での描き直し（2026-09-04）
- 40pxの太字メッセージ＋会社名＋左下に離れた12pxの連絡先という3ブロック散らばりをやめ、左80pxの1本の縦ぞろえ（KICKER→ことば32px→64px罫線→連絡先）に組み直した
- 純黒寄りの #1A1A1A / #333333 / #555555 をやめ、本文はインク色 `var(--sk-ink)`、ラベルは `var(--sk-muted)` に統一。太さは400と700の2つだけにした
- 連絡先を「ラベル（KICKER 10px）｜値（16px）」の2列グリッドにして、ラベルの左端と値の左端をそろえた（背景画像・画像に合わせた見え方はそのまま維持）
