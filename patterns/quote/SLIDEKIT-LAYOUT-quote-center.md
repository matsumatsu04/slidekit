# SLIDEKIT-LAYOUT — quote-center

## Meta
- **pattern:** quote-center
- **category:** quote
- **summary:** 引用・お客様の声を中央に大きく置く
- **best-for:** 推薦コメント・象徴的な発言・お客様の声

## Structure
```yaml
regions:
  - id: quote
    area: { x: 14, y: 32, w: 72, h: 32 }
    role: 引用文（大きめ）
  - id: attribution
    area: { x: 14, y: 66, w: 60, h: 10 }
    role: 発言者・出典
align: center
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| quote | 引用文 | 全角60字以内 |
| attribution | 発言者・肩書 | 全角24字以内 |

## Authoring Notes
- 引用符（“ ”）を大きく装飾的に置くと締まる。
- 引用文は読める範囲で大きく。長文なら要約する。
