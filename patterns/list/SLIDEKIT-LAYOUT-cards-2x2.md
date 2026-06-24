# SLIDEKIT-LAYOUT — cards-2x2

## Meta
- **pattern:** cards-2x2
- **category:** list
- **summary:** 2行2列の4枚カードで要素を整理する
- **best-for:** 4つの観点・4象限・4つの施策

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 12 }
    role: ページ見出し
  - id: card-tl
    area: { x: 7, y: 25, w: 42, h: 32 }
    role: 左上カード
  - id: card-tr
    area: { x: 51, y: 25, w: 42, h: 32 }
    role: 右上カード
  - id: card-bl
    area: { x: 7, y: 60, w: 42, h: 32 }
    role: 左下カード
  - id: card-br
    area: { x: 51, y: 60, w: 42, h: 32 }
    role: 右下カード
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角20字以内 |
| card-* | 各カードの見出し＋説明 | 見出し全角12字／説明全角40字 |

## Authoring Notes
- 4枚固定。各カードは見出し＋1〜2行に抑える。
- 4象限マトリクスとして使う場合は軸ラベルをデザイン側で添える。
