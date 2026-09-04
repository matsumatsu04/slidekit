---
name: profile-skill-tags
category: プロフィール
summary: 左に円形写真プレースホルダ120pxと英字ラベル・氏名24px・肩書、右に経歴（横罫線区切り3行）・スキルタグのピル群・実績ミニ数値3つを積む1名詳細プロフィール。塗りは主要スキルのタグ1つだけ
scenes: 講師・コンサルタント・登壇者の自己紹介。スキルと実績数値で信頼を作る場面
tier: high
id: P136
---
# SLIDE-PATTERN-profile-skill-tags

このファイルはスライドのコンテンツエリア（タイトル行より下の領域）のレイアウトパターン定義書です。SLIDE.mdと組み合わせてAIツールに渡すことで、このパターンのスライドを生成できます。タイトルエリア・ページ番号・装飾はSLIDE.mdの `Slide Frame` セクションで定義されるため、このファイルには含みません。

## Overview

**パターン名：** profile-skill-tags
**概要：** 左に円形写真プレースホルダ120pxと英字ラベル・氏名24px・肩書、右に経歴（横罫線区切り3行）・スキルタグのピル群・実績ミニ数値3つを積む1名詳細プロフィール。塗りは主要スキルのタグ1つだけ
**適したシーン：** 講師・コンサルタント・登壇者の自己紹介。スキルと実績数値で信頼を作る場面

## Structure（構造）

コンテンツエリア（左右余白48px）を、左の人物列（幅240px）と右の内容列（残り全幅）に分ける（間隔40px）。2列は等高（stretch）・上ぞろえで、ブロック全体は本文エリアの上下中央に置く。

左列は中央ぞろえで、上から「円形写真枠（120px・`--sk-soft` の地、中央に英字ラベル `PHOTO`）」「英字ラベル（KICKER・`YAMADA TARO ／ 講師`）」「氏名（24px・700）」「肩書（16px・muted）」。

右列は3ブロックを縦に積む（ブロック間24px）。(1) 経歴＝KICKER `CAREER ／ 経歴` → 16px×3行を横罫線で区切る（上端＋各行の下に1px・`--sk-line`）。(2) スキルタグ＝KICKER `SKILLS ／ 専門領域` → 14px のピル（1.5px `--sk-line` 枠・塗りなし・角丸999px）を折り返しで並べ、**主要スキル1つだけアクセント塗り＋白文字**にする（これがこのスライドの塗り1つ）。(3) 実績＝KICKER `RESULTS ／ 実績` → 数値24px/700（等幅数字）＋単位14px・muted を3つ横並び。

    structure:
      layout: two-column (person 240 + content)
      gap: 40
      align: stretch (equal height) / top
      left:
        width: 240
        align: center
        elements:
          - photo (120px circle placeholder, soft ground, label "PHOTO")
          - kicker (english name + role)
          - name (24px, 700)
          - role (16px, muted)
      right:
        blocks:
          - career:
              kicker: "CAREER ／ 経歴"
              rows: 3 (16px, separated by horizontal 1px rules)
          - skills:
              kicker: "SKILLS ／ 専門領域"
              tags: 14px pills, 1.5px line border, no fill, radius 999
              accent: exactly 1 tag filled with accent + white text
          - results:
              kicker: "RESULTS ／ 実績"
              stats: 3 x (number 24px/700 tabular-nums + unit 14px muted)
      emphasis: 1 filled tag only

## Elements（各要素の役割）

| 要素 | 配置 | 役割 |
|---|---|---|
| 円形写真枠 | 左列上部（120px） | 人物写真の置き場。実装時は `<img>` を円形クリップ（`object-fit:cover`）で差し替える。空のときは淡い地に英字ラベルだけ |
| 英字ラベル（氏名） | 写真の下（KICKER） | `YAMADA TARO ／ 講師` のようにローマ字＋日本語の役割。氏名の上に小さく置く |
| 氏名 | 左列（24px・700） | 名前を見出しとして立てる |
| 肩書 | 氏名の下（16px・muted） | 会社名・役職。1行に収める（長い場合は `／` の前で改める） |
| 経歴 | 右列上段 | 「年 出来事」の3行。横罫線だけで区切り、地色・縦罫線は付けない |
| スキルタグ | 右列中段 | 4〜8個のピル。枠線だけで、主要スキル1つだけアクセント塗り＋白文字にして視線の起点を作る |
| 実績ミニ数値 | 右列下段 | 数値3つ。数字は等幅（`tabular-nums`）、単位と補足は14px・muted で `年 ／ 制作歴` の形 |

## Usage Guide（AIへの使い方）

このパターンをAIに指示する際のプロンプト例：

> 「SLIDE-PATTERN-profile-skill-tagsのレイアウトで、[氏名]のプロフィールを表示してください。左に円形写真・氏名・肩書、右に経歴3行、スキルタグ6個（主役1個だけ塗り）、実績数値3つを書いてください。デザインはSLIDE.mdに従ってください。」

**注意点：**
- 塗るタグは**必ず1つだけ**。全部枠線にすると主役が消え、2つ以上塗ると強調が散る
- タグは4〜8個（多すぎると専門性がぼやける）。1個の文字数は8字以内にして折り返しの行が崩れないようにする
- 経歴は3行。1行26字以内で「年 出来事」の形に揃える。4行以上要るなら profile-bio を使う
- 実績数値は3つまで。それ以上は stats-grid-six へ。単位は `件 ／ 制作実績` のように単位＋補足を14pxでまとめる
- 実画像が無い場合はプレースホルダのまま納品せず、写真を用意してから使う
- 2名なら profile-two-speakers、4名以上は team-members-grid を使う

## v2 での描き直し（2026-09-04）

- Font Awesome の `<link>` とアイコン人物マークを外し、円形写真枠を `--sk-soft` 地＋英字ラベル `PHOTO` のプレースホルダにした。氏名20px→24px/700・肩書12px太字→16px muted にし、氏名の上に英字ラベル（KICKER）を足した
- 経歴を13pxの1段落から「KICKER → 16px×3行・横罫線区切り」に変え、スキルタグを11.5px枠線ピル→14px・1.5px `--sk-line` 枠に、実績を「数値24px/700・等幅数字＋単位14px」に組み直した。プレースホルダも型が伝わる具体例（年号入りの経歴・実スキル名・単位付き数値）にした
- 塗りを1つに絞った（主要スキルのタグだけアクセント塗り＋白文字）。左右余白を88px→48px、2列を等高・上ぞろえにして本文エリアの上下中央に置き、`.slide` の枠線を外した
