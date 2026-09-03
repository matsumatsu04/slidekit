---
name: cover-illust-band
category: 表紙
summary: 淡いティント地の上部に英字KICKER＋アクセント色の大見出し（＋サブ1行）を中央寄せし、下半分に挿絵の帯（assets/illust）を敷く表紙。塗りなし・挿絵で温度を足す（v2）。
scenes: ガイド・講座資料・提案書の表紙。締めの closing-solid-claim と対で使うと、表紙＝淡い地／締め＝アクセント全面で色が反転する
tier: high
id: P165
---
# SLIDE-PATTERN: cover-illust-band

このファイルはスライドのレイアウトパターン定義書です。表紙は共通見出し（`sk-head`）を付けない種類のスライドで、
ワードマーク・©・頁番号などのフッターはHTMLデッキビルダー（フレーム v2）が描くため、このファイルには含みません。
挿絵は `assets/illust/` のスロット（`<img class="ci-illust">`）で受けます。

## Overview
**パターン名：** cover-illust-band
**概要：** 全面を淡いティント（`--sk-soft`）にし、上部280pxに「英字KICKER → アクセント色の大見出し → サブ1行」を中央寄せで置く。下260pxは挿絵の帯（幅100%・`object-fit:cover`）。塗り面は持たず、挿絵で温度を足す。
**適したシーン：** ガイド・講座資料・提案書の表紙。締めの `closing-solid-claim` と対で使うと「表紙＝淡い地／締め＝アクセント全面」で色が反転する（デザインの規律 v2・6）。

## Structure（構造）
```yaml
layout: cover-illust-band
background: var(--sk-soft)
top_block:                  # left/right 48px・高さ 280px・上下中央・中央寄せ・gap 16px
  kicker: 英字ラベル          # 10px / 700 / 字間 .2em / 大文字 / var(--sk-accent2)
  title:  大見出し            # 30px / 700 / 字間 .1em / 行間 1.4 / var(--sk-accent)。1〜2行
  sub:    サブ1行             # 13px / 400 / 字間 .16em / var(--sk-muted)
band:                       # 下端に幅100%・高さ 260px
  img.ci-illust: assets/illust/office-street.jpg
  fit: object-fit cover / object-position center 74% / mix-blend-mode multiply
```

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| KICKER | 見出しの上 | 発行元と資料の種別を英字で小さく示す（差し色 `--sk-accent2`） |
| 大見出し | 上部ブロックの中央 | 資料タイトル。アクセント色・1〜2行。標語調にしない |
| サブ1行 | 見出しの下 | 副題や対象読者を1行で（`--sk-muted`）。置かない運用もある（下記） |
| 挿絵の帯 | 下半分（260px） | `assets/illust/` の横長イラスト。白地で生成されるので `mix-blend-mode:multiply` で地色に溶かす |

## Usage Guide（AIへの使い方）
### プロンプト例
```
SLIDE-PATTERN-cover-illust-band を使って表紙を1枚生成してください。
【KICKER】Macminol ／ AI-driven Web Production Guide
【タイトル】AIをWeb制作に入れる前に決めておくこと
【挿絵】assets/illust/office-street.jpg
```
### 注意点
- **代表資料では表紙はタイトルだけ**（2026-08-31）。サブ1行はパターンには置いてあるが、代表資料では `.ci-sub` を外して KICKER＋タイトルにする
- タイトルは30pxで最大2行（1行あたり全角24文字程度）。入らなければ言い切りに削る（文字を小さくしない）
- 挿絵は `assets/illust/` の統一トーン（淡い水彩調・輪郭線なし・顔の造作なし）から選ぶ。横長（3:2）が前提。見せたい高さは `object-position` の縦の値で調整する（この画像は 74% で建物〜歩道が入る）
- 挿絵の帯に文字やロゴを重ねない。ワードマーク・©はビルダーのフッターに任せる
- 塗り面・影・グラデーションは足さない。アクセント色は見出しだけ、差し色は KICKER だけ
- 背景画像レイヤー（`slides[].bg`）は OFF にする（表紙は自前の地色を持つ）
