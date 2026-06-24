# SLIDEKIT-LAYOUT — compare-two-col

## Meta
- **pattern:** compare-two-col
- **category:** comparison
- **summary:** 左右2カラムで対比させる（Before/After・案A/案Bなど）
- **best-for:** 2つの選択肢・変化前後の比較

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 13 }
    role: ページ見出し
  - id: col-left
    area: { x: 7, y: 26, w: 41, h: 66 }
    role: 左側（見出し＋要点）
  - id: col-right
    area: { x: 52, y: 26, w: 41, h: 66 }
    role: 右側（見出し＋要点）
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角20字以内 |
| col-left / col-right | 各側の小見出し＋箇条 | 小見出し全角10字／箇条3行・各全角28字 |

## Authoring Notes
- 左右で項目の観点を揃える（同じ軸で比べる）。
- どちらを推すかは片側のヘッダーを強調色にして示す。
- 中央に細い区切りを入れてもよい（デザイン側で）。
