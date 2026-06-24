# SLIDEKIT-LAYOUT — cards-3up

## Meta
- **pattern:** cards-3up
- **category:** list
- **summary:** 横並び3枚のカードで要素を均等に見せる
- **best-for:** 3つの特徴・3ステップ・3プランの並列提示

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 13 }
    role: ページ見出し
  - id: card-1
    area: { x: 7, y: 28, w: 27, h: 60 }
    role: カード1（見出し＋短文）
  - id: card-2
    area: { x: 36.5, y: 28, w: 27, h: 60 }
    role: カード2
  - id: card-3
    area: { x: 66, y: 28, w: 27, h: 60 }
    role: カード3
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角20字以内 |
| card-n | カード内の見出し＋説明 | 見出し全角12字／説明全角50字 |

## Authoring Notes
- カードは3枚固定。4枚以上は `cards-2x2` などへ。
- 各カードの情報量を揃える（高さが揃って見える）。
- アイコンを足すならカード上部に小さく。
