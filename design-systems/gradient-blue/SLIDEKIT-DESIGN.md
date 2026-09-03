# SLIDEKIT-DESIGN — gradient-blue

## Meta
- **name:** gradient-blue
- **label:** グラデーションブルー
- **summary:** ブルーグラデを基調にピンクを強調へ回す、モダンで前向きなデザイン。角丸を大きく余白を広く取る
- **best-for:** 説明会・セミナー・受講生向け資料・サービス紹介・採用説明
- **mood:** モダン / エネルギッシュ / 前向き / 親しみやすい / 躍動感
- **reference:** `guidelines/brand/webcareer-deck-design.md`（このテーマの正本。数値はそこから取る）

## Colors
| 役割 | トークン名 | HEX | 使いどころ |
|---|---|---|---|
| Primary | --color-primary | #2B4894 | 基調。見出し文字・ショートバー・番号バッジ・アイコン・濃色丸 |
| Primary Light | --color-primary-light | #2F62A6 | Blueグラデの開始色 |
| Accent | --color-accent | #D72550 | **強調 / CTA / ハイライト専用**。強調文字・数値・バッジ・CTAピル |
| Accent Light | --color-accent-light | #A7629D | Pinkグラデの開始色 |
| Background | --color-bg | #FFFFFF | 本文スライドの背景（標準） |
| Paper | --color-paper | #F4F6FA | 白の代替面・本文ボックス地 |
| Surface | --color-surface | #E8EEF7 | 淡ブルー面。ラベル箱・カードヘッダ・淡円 |
| Surface Accent | --color-surface-accent | #FBE8EE | 淡ピンク面。強調カード地・推し行地 |
| Text | --color-text | #1A2238 | 本文。純黒は使わない濃紺寄りダーク |
| Text Muted | --color-text-muted | #5B6577 | 補助・キャプション・注釈・出典 |
| Line | --color-line | #D5DCE8 | 区切り罫線・カード枠線 |

グラデーション（**角度は25°固定**・2ストップ・中間分岐なし）
- Blue: `linear-gradient(25deg, #2F62A6 0%, #2B4894 100%)` — 濃背景・章扉・表紙・結び
- Pink: `linear-gradient(25deg, #A7629D 0%, #D72550 100%)` — CTA・ハイライト

## Typography
| 役割 | フォント | サイズ | ウェイト | 行間 |
|---|---|---|---|---|
| H1（表紙見出し） | Noto Sans JP | 44px | Bold | 1.2 |
| H2（共通見出し） | Noto Sans JP | 24px | Bold | 1.25 |
| メッセージライン | Noto Sans JP | 16px | Regular | 1.5 |
| 本文 | Noto Sans JP | 17px | Regular | 1.6 |
| キャプション | Noto Sans JP | 13px | Regular | 1.5 |

## Layout
- **canvas:** 1280 × 720（16:9）
- **safe-margin:** 上下 64px / 左右 64px（余白は広めに取る）
- **gutter:** 32px
- **grid:** 12 カラム
- **radius:** カード・ボックス **24px** / 小要素（タグ・バッジ）12px / ピル・ボタン 999px
- **card-padding:** 28px
- **align:** 既定は左寄せ

## Frame（共通の枠）
- **title-area:** 共通見出しデザインB（縦バー）またはA（下線）。バー・下線は `#2B4894` 単色
- **page-number:** 右下に "n / N" を muted で
- **footer:** なし

## Treatments（装飾の流儀）
- **情報の強弱はブルー基調 vs ピンク強調 vs グレー抑制の3層で表現する**
- **ピンクは強調・CTA・ハイライト専用。** 基調に使わない
- 影は軽い1段のみ（`0 4px 16px rgba(43,72,148,.12)`）。濃い影・多重影は禁止
- 角丸は大きめ、余白は広め。動きのある図形と適度な遊びを許可する
- 親しみやすさを理由に情報密度を犠牲にしない。1スライド1メッセージを守る

## Do / Don't
- ✅ 広い余白と大きな角丸で前向きな温度感を出す
- ✅ 強調はピンク1点に絞る
- ✅ グラデは25°を守る（角度を変えない）
- ❌ ピンクを基調・広い面に使う
- ❌ コーポレート資料の硬質さ（角丸4px・詰めた余白）を持ち込む
- ❌ 濃い影・多重影・3色目の導入

## v2 トークン（2026-09-02・デザインの規律 v2）

| トークン | HEX | 役割 |
|---|---|---|
| --sk-ink | #3f4a52 | 本文のインク色（純黒を使わない） |
| --sk-line | #e2e2e2 | 罫線・カード枠 |

- `--sk-accent2` は**差し色**（英字ラベル・装飾線・小さな点）にだけ使う。塗りには使わない
- 塗りつぶしは1枚に1つ。最終・結果の要素は 1.5px の `--sk-accent` 枠線
- 文字の組み・フレーム・カードの型は `SPEC.md`「デザインの規律 v2」が正本
