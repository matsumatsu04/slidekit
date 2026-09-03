---
name: closing-solid-claim
category: まとめ
summary: 全面アクセント塗り＋白文字の締め。左にKICKER「CONCLUSION」＋大見出し2行＋本文2行、右に白い角丸カードの挿絵、下に細い白罫線と結論1文（太字）。表紙 cover-illust-band と色を反転させる（v2）。
scenes: プレゼンの最終スライド（結論の言い切り）。表紙 cover-illust-band と対で使う。連絡先・出典を添える締めにも
tier: high
id: P164
---
# SLIDE-PATTERN: closing-solid-claim

このファイルはスライドのレイアウトパターン定義書です。締めは共通見出し（`sk-head`）を付けない種類のスライドで、
ワードマーク・©・頁番号などのフッターはHTMLデッキビルダー（フレーム v2）が描くため、このファイルには含みません。
挿絵は `assets/illust/` のスロット（`<img class="cc-illust">`）で受けます。

## Overview
**パターン名：** closing-solid-claim
**概要：** 全面をアクセント色で塗り、白文字で結論を言い切る締め。左に「英字KICKER（半透明白）→ 大見出し2行 → 本文2行」、右に白い角丸カード（角丸16px）の中に挿絵（`object-fit:contain`）。その下に細い白罫線を1本引き、結論1文を太字で置く。全体を上下中央に置く。
**適したシーン：** プレゼンの最終スライド。表紙 `cover-illust-band`（淡い地）と対で使うと、表紙と締めで色が反転する（デザインの規律 v2・6）。

## Structure（構造）
```yaml
layout: closing-solid-claim
background: var(--sk-accent)      # 全面塗り。文字はすべて白
wrap:                             # left/right 48px・全高の上下中央・縦積み gap 24px
  top:                            # 横2カラム・gap 40px
    left:                         # flex 1・垂直中央・gap 16px
      kicker: "CONCLUSION"        # 10px / 700 / 字間 .2em / 大文字 / rgba(255,255,255,.7)
      title:  大見出し2行          # 28px / 700 / 行間 1.5 / 白
      body:   本文2行             # 16px / 400 / 行間 1.8 / rgba(255,255,255,.85)
    card:                         # 352×256px・白地・角丸 16px・padding 24px
      img.cc-illust: assets/illust/paper-pile.jpg   # object-fit contain
  rule: 1px                       # rgba(255,255,255,.35)・全幅
  claim: 結論1文                  # 16px / 700 / 白
```

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| KICKER | 左上 | 「CONCLUSION」など、締めであることを示す英字ラベル（半透明白） |
| 大見出し | KICKERの下 | 資料全体の結論を2行で言い切る。標語調にしない |
| 本文 | 見出しの下 | 結論の意味・条件を2行で補う |
| 挿絵カード | 右 | 白い角丸カードの中に `assets/illust/` の挿絵を `contain` で収める。塗り面の中の唯一の白い面 |
| 白罫線 | 上段の下・全幅 | 上段と結論を区切る細い線（`rgba(255,255,255,.35)`） |
| 結論1文 | 罫線の下 | 次にやることを1文・太字で |

## Usage Guide（AIへの使い方）
### プロンプト例
```
SLIDE-PATTERN-closing-solid-claim を使って締めを1枚生成してください。
【KICKER】CONCLUSION
【見出し】境界を先に決めると、／制作は速くなる。
【本文】価値はAIに判断を丸投げすることではない。／作る・確かめる・直すを、現場の近くへ持ってこられること。
【結論】まずは小さな案件で試し、人が結果を読んでから、次の工程へ広げる。
【挿絵】assets/illust/paper-pile.jpg
```
### 注意点
- 見出しは28pxで2行まで（1行あたり全角15文字程度）。`<br>` で切る位置を意味の切れ目に合わせる
- 本文は2行まで。結論は1文。出典や参考を添える場合は結論の下に注記（11.5px・半透明白）を足してよいが、3行を超えない
- 文字はすべて白（濃色地に #333 系を載せない）。カードの中は白地なので、挿絵は輪郭線なし・淡いトーンのものを選ぶ
- 挿絵はカードに `contain` で収めるので、正方形〜横長のどちらでもよい。人物は顔の造作なしのトーンに揃える
- アクセント色の塗りはこの1枚で全面に使うため、他の塗り・差し色・影は足さない
- 背景画像レイヤー（`slides[].bg`）は OFF にする（全面塗り）
