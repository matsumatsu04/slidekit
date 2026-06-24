# SLIDEKIT-LAYOUT — kpi-row

## Meta
- **pattern:** kpi-row
- **category:** data
- **summary:** 横並びで主要数値（KPI）を大きく見せる
- **best-for:** 実績・指標を3つ前後でインパクトを出して提示

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 13 }
    role: ページ見出し
  - id: kpi-1
    area: { x: 7, y: 34, w: 26, h: 40 }
    role: 数値1（特大）＋ラベル
  - id: kpi-2
    area: { x: 37, y: 34, w: 26, h: 40 }
    role: 数値2＋ラベル
  - id: kpi-3
    area: { x: 67, y: 34, w: 26, h: 40 }
    role: 数値3＋ラベル
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角20字以内 |
| kpi-n | 数値＋単位＋短いラベル | 数値は短く／ラベル全角14字 |

## Authoring Notes
- 数値は特大・強調色。単位は数値より小さく。
- KPIは2〜4個まで。それ以上は表やグラフに切り替える。
- 数値の桁を揃えて視線が流れるようにする。
