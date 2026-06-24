# SLIDEKIT-LAYOUT — agenda-two-col

## Meta
- **pattern:** agenda-two-col
- **category:** agenda
- **summary:** 連番付き項目を左右2カラムに分けて並べる目次
- **best-for:** 6〜10項目のやや多めの目次

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 14 }
    role: 見出し
  - id: list-left
    area: { x: 7, y: 26, w: 41, h: 66 }
    role: 左カラム（項目前半）
  - id: list-right
    area: { x: 52, y: 26, w: 41, h: 66 }
    role: 右カラム（項目後半）
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角10字以内 |
| list-left / list-right | 目次項目 | 合計6〜10項目／各全角18字以内 |

## Authoring Notes
- 番号は左→右で連続させる（左に01-05、右に06-10）。
- 左右の項目数はできるだけ揃える。
