# SLIDEKIT-LAYOUT — process-steps

## Meta
- **pattern:** process-steps
- **category:** process
- **summary:** 左から右へ流れる横並びのステップフロー
- **best-for:** 手順・プロセス・時系列（3〜4ステップ）

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 13 }
    role: ページ見出し
  - id: step-1
    area: { x: 7, y: 38, w: 26, h: 40 }
    role: ステップ1（番号＋見出し＋短文）
  - id: step-2
    area: { x: 37, y: 38, w: 26, h: 40 }
    role: ステップ2
  - id: step-3
    area: { x: 67, y: 38, w: 26, h: 40 }
    role: ステップ3
  - id: connectors
    area: { x: 33, y: 56, w: 34, h: 4 }
    role: ステップ間をつなぐ矢印（視覚要素）
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角20字以内 |
| step-n | 番号＋見出し＋説明 | 見出し全角12字／説明全角36字 |

## Authoring Notes
- 左→右の流れ。ステップ間に矢印を入れて方向を示す。
- 3ステップを基本、最大4。5以上は縦リストへ。
- 番号は強調色の丸数字などで統一。
