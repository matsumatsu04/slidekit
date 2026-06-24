# SLIDEKIT-LAYOUT — cover-centered

## Meta
- **pattern:** cover-centered
- **category:** cover
- **summary:** タイトルを画面中央に大きく置く、最もシンプルな表紙
- **best-for:** 単独テーマの発表・1メッセージで掴みたい表紙

## Structure
```yaml
regions:
  - id: eyebrow
    area: { x: 12, y: 34, w: 76, h: 8 }
    role: 上部の小ラベル（カテゴリ/日付など・任意）
  - id: title
    area: { x: 12, y: 42, w: 76, h: 22 }
    role: メインタイトル（特大）
  - id: subtitle
    area: { x: 12, y: 66, w: 76, h: 10 }
    role: サブタイトル・発表者・日付
align: center
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| eyebrow | 小ラベル | 全角12字以内・任意 |
| title | 主タイトル | 全角24字以内（2行まで） |
| subtitle | 補足情報 | 全角30字以内 |

## Authoring Notes
- 中央寄せ。要素は縦に積む。装飾は最小限に。
- タイトルが3行に渡る場合は `cover-split-left` を検討する。
- 背景に図を置くなら、文字の可読性を最優先（コントラスト確保）。
