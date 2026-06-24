# SLIDEKIT-LAYOUT — agenda-numbered

## Meta
- **pattern:** agenda-numbered
- **category:** agenda
- **summary:** 連番付きで縦に項目を並べる目次
- **best-for:** 3〜6項目の目次・本日の流れ

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 14 }
    role: 見出し（「目次」など）
  - id: list
    area: { x: 7, y: 26, w: 70, h: 66 }
    role: 連番付きの項目リスト（縦積み）
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角10字以内 |
| list | 目次項目 | 3〜6項目／各全角20字以内 |

## Authoring Notes
- 各項目に連番（01, 02…）を付け、番号は強調色で。
- 7項目以上になるなら2カラム化（`agenda-two-col`）を検討。
- 項目間は罫線より余白で区切ると軽い。
