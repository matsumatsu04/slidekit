# SLIDEKIT-LAYOUT — section-divider

## Meta
- **pattern:** section-divider
- **category:** section
- **summary:** 章の切り替えを示す中扉。番号＋章タイトルを大きく置く
- **best-for:** 長い資料のセクション区切り

## Structure
```yaml
regions:
  - id: section-no
    area: { x: 9, y: 36, w: 30, h: 14 }
    role: 章番号（"01" など・特大）
  - id: section-title
    area: { x: 9, y: 50, w: 70, h: 18 }
    role: 章タイトル
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| section-no | 章番号 | 2〜3字 |
| section-title | 章タイトル | 全角20字以内 |

## Authoring Notes
- 章番号を主役級に大きく、章タイトルはその下。
- 本文ページとは明確に質感を変える（地色を反転させる等はデザイン側で対応）。
