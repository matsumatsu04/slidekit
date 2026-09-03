---
name: case-study-process-kpi
category: カード
summary: 左に事例概要（KICKER・事例名・細罫線）と工程3ステップ（等高・上ぞろえの縦積みリスト）、右に幅300pxのアクセント塗りRESULTパネル（数字28px＋単位・説明・指標2行・注記）を置く事例深掘りレイアウト。塗りは結果パネルだけ。
scenes: 提案書・会社紹介の導入事例1件の深掘り。何をやり、どう進め、どんな成果が出たかを1枚で見せる場面
tier: mid
id: P156
---
# SLIDE-PATTERN-case-study-process-kpi

このファイルはコンテンツエリアのレイアウト定義です。タイトル枠・ページ番号・装飾はデザインテーマ側の Frame で定義します。

## Overview
**パターン名：** case-study-process-kpi
**概要：** コンテンツエリアの上下中央に、高さ352pxの行を1つ置く。行は「左：事例概要（KICKER→事例名→細罫線）＋工程3ステップ（番号KICKER＋見出し＋説明を細罫線区切りで縦積み・等高）」と「右：幅300pxのRESULTパネル（アクセント塗り・白文字）」の2カラム。塗りは右パネルだけ。
**適したシーン：** 事例・実績の1件深掘り。進め方（工程）と成果数値を1枚に収め、結果を主役として塗りで強調したい場面。

## Structure（構造）

    structure:
      layout: case-overview-to-result
      content_area:
        padding: "24px 48px"
        vertical_align: center        # 見出しON時は上76px以降の上下中央
      row:
        display: flex
        height: 352px                 # 左右は等高（align-items: stretch）
        gap: 24px
      left:
        flex: 1
        kicker: "CASE ／ 業種"          # 10px / 700 / .18em / アクセント色
        name: "事例名（1行）"           # 18px / 700
        rule: 1px                      # var(--sk-line)
        steps:
          count: 3
          layout: grid-auto-rows-1fr   # 等高・段は上border 1pxで区切る（先頭は無し）
          each:
            - no: "STEP 01"             # 10px / 700・幅72pxの左列
            - title                     # 16px / 700
            - desc                      # 16px / 400・1行
      right:
        width: 300px
        surface: accent_fill           # アクセント塗り・白文字（1枚で塗るのはここだけ）
        border_radius: 11px
        padding: "24px 28px"
        elements:
          - kicker: "RESULT ／ 期間"     # 白
          - number_row:
              number: "28px / 700"       # 白・tabular-nums
              unit: "16px / 400"
          - description: 1 line          # 16px
          - rule                         # 1px・白35%
          - metrics: 2 lines             # ラベル＋Before→After（16px・白80%）
          - note: "例：〜"               # 11.5px・白85%。パネル下端に寄せる（margin-top:auto）

## Elements（各要素の役割）
| 要素 | 配置 | 役割 |
|---|---|---|
| KICKER（CASE） | 左カラム上端 | 業種・案件種別などの小さな属性表示 |
| 事例名 | KICKER の下 | この事例の主役となる見出し（18px・700・1行） |
| 細罫線 | 事例名の下 | 概要と工程リストの区切り |
| 工程3ステップ | 左カラム下部 | 番号KICKER＋見出し＋説明1行を等高・上ぞろえで縦積み |
| RESULTパネル | 右300px | 成果を主役にするアクセント塗りの面。1枚のスライドで塗りはここだけ |
| 数字＋単位 | パネル上部 | 最も見せたい値（28px）と単位（16px） |
| 指標2行 | 白35%罫線の下 | Before→After 形式で内訳を2行まで並べる |
| 注記 | パネル最下 | 「例：〜」で比較の基準・取り方を1行添える |

## Usage Guide（AIへの使い方）
- 塗りは右のRESULTパネルの1つだけ。工程ステップや事例名に別の塗りを足さない
- 工程は3ステップが基準。増減する場合も等高（grid-auto-rows:1fr）のまま段数だけ変える
- 数字は1個だけに絞る（指標2行は補足の内訳。数字を主役にしたい指標は数字行に置き、それ以外は指標行へ）
- 事例名・説明は実在社名を避け、業種・規模が伝わる架空の具体例にする

## v2 での描き直し（2026-09-03）
- 左1/3の画像プレースホルダ＋菱形ミニバッジの点線連結という複雑な構図を廃し、左＝事例概要＋工程3ステップ（細罫線区切りの等高リスト）／右＝幅300pxのRESULTパネル（アクセント塗り）の2カラムに単純化した
- 成果数値をKICKER「RESULT」＋数字28px＋単位＋説明＋白35%罫線＋指標2行＋「例：」注記の型にまとめ、塗りをこのパネル1枚だけにした
- 文字をv2の表に揃えた（KICKER 10px・見出し18px／16px・本文16px・注記11.5px、太さ400/700のみ、インク色・palt・禁則）。工程説明・指標の文字サイズを14pxから16pxへ統一した
