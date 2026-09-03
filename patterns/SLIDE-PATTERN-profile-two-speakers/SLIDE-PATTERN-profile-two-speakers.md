---
name: profile-two-speakers
category: プロフィール
summary: 1.5px罫線枠の等高カード2枚に「英字ラベル（SPEAKER 01／02）→円形写真プレースホルダ96px→氏名20px→肩書→罫線→経歴3行（角ドット付き）」を同じ型で組む2名紹介。塗りは1枚目の英字ラベル横の小さなドット1つ
scenes: セミナーの登壇者紹介、対談相手の紹介、共同創業者・共同代表の紹介
tier: high
id: P125
---
# SLIDE-PATTERN-profile-two-speakers

このファイルはコンテンツエリアのレイアウト定義です。タイトル枠・ページ番号・装飾はデザインテーマ側の Frame で定義します。

## Overview
**パターン名：** profile-two-speakers
**概要：** 1.5px罫線枠の等高カード2枚に「英字ラベル（SPEAKER 01／02）→円形写真プレースホルダ96px→氏名20px→肩書→罫線→経歴3行（角ドット付き）」を同じ型で組む2名紹介。塗りは1枚目の英字ラベル横の小さなドット1つ
**適したシーン：** セミナーの登壇者紹介、対談相手の紹介、共同創業者・共同代表の紹介。

## Structure（構造）
コンテンツエリア（左右余白48px）に、等幅・等高のカード2枚（gap 16px・高さ376px・1.5pxの罫線枠 `--sk-line`・角丸12px・padding 24px・白地）を横に並べる。カードの中身は左ぞろえ・上ぞろえで「英字ラベル（KICKER・`SPEAKER 01 ／ 登壇者`）」「円形写真枠（96px・淡い地のプレースホルダ。中央に英字ラベル `PHOTO`）」「氏名（20px・太字）」「肩書（16px・muted）」「細い罫線（1px・カード内の全幅）」「経歴（16px×3行。各行の先頭に4pxの角ドット＝差し色 `--sk-accent2`）」の順。1枚目の英字ラベルの左に6pxの丸ドット（アクセント色）を置き、これが1枚で唯一の塗り。ブロック全体は本文エリアの上下中央に置く。

    structure:
      layout: two-equal-columns
      cards:
        equal_height: true
        gap: 16
        frame: 1.5px line color, radius 12, padding 24, white ground
      card:
        align: left, top
        order:
          - kicker (SPEAKER 01 ／ 登壇者; first card has a 6px accent dot = the only fill)
          - photo (96px circle placeholder, soft ground, label "PHOTO")
          - name (20px, bold)
          - role (16px, muted)
          - rule (1px, line color, full card width)
          - bio (16px x 3 lines, 4px square dot in accent2 at line start)

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| 英字ラベル（KICKER） | カード左上 | `SPEAKER 01 ／ 登壇者` のように番号＋立場。1枚目だけ左に小さな丸ドット（塗り1つ） |
| 円形写真枠 | ラベルの下（96px） | 実装時は `<img>` を円形クリップ（`object-fit:cover`）で差し込む。空のときは淡い地に英字ラベルだけ |
| 氏名 | 写真の下（20px・太字） | 姓と名の間に半角スペース |
| 肩書 | 氏名の下（16px・muted） | 会社名・役職・専門を1行で |
| 細い罫線 | 肩書と経歴の間 | 人物情報と経歴の区切り。カード内の左端から右端まで |
| 経歴 | 罫線の下（16px×3行） | 1行1項目（22字以内）。先頭の4px角ドットは差し色で、塗りに数えない |

## Usage Guide（AIへの使い方）
> 「SLIDE-PATTERN-profile-two-speakersのレイアウトで、[登壇者A]と[登壇者B]を紹介してください。各カードは英字ラベル（`SPEAKER 01 ／ 立場`）・氏名・肩書・経歴3行（各22字以内）の順で書いてください。デザインはSLIDE.mdに従ってください。」

- 経歴は3行固定（1行22字以内）。入らないときは文字を小さくせず、項目を削る
- 塗りは1枚目のラベル横のドット1つだけ。2名を対等に見せたいときはドットを外してよい（カードを塗らない）
- 写真が無い場合はプレースホルダのまま納品せず、写真を用意してから使う（アイコンや絵文字で代用しない）
- 1名だけなら profile-bio、4名以上なら team-members-grid を使う

## v2 での描き直し（2026-09-04）
- 薄枠のカード（中央ぞろえ・人物アイコン）を、1.5px罫線枠・角丸12pxの等高カード（左ぞろえ・上ぞろえ）にし、円形写真枠を淡い地のプレースホルダ96px（中央に英字ラベル）に変えた
- 中身を「KICKER（SPEAKER 01／02）→写真→氏名20px/700→肩書16px muted→全幅の罫線→経歴16px×3行（先頭に4pxの角ドット）」の型にし、プレースホルダも具体例（2名の例名・肩書・経歴）にした。塗りは1枚目のラベル横の6pxドット1つ
- 左右余白を80pxから48px・gapを40pxから16pxにして本文エリアの上下中央に置き、字間.06em・行間1.8・インク色に揃えた。Font Awesome の `<link>` を外した
