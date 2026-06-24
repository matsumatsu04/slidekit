# SLIDEKIT-LAYOUT — content-statement

## Meta
- **pattern:** content-statement
- **category:** content
- **summary:** 短い一文を画面いっぱいに大きく見せる主張ページ
- **best-for:** キーメッセージ・転換点・印象づけたい一言

## Structure
```yaml
regions:
  - id: statement
    area: { x: 10, y: 32, w: 80, h: 36 }
    role: 主張（特大の1〜2文）
  - id: support
    area: { x: 10, y: 70, w: 70, h: 10 }
    role: 補足の一言（任意）
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| statement | 主張 | 全角40字以内 |
| support | 補足 | 全角30字以内・任意 |

## Authoring Notes
- 文字以外の要素を置かない。余白で力を出す。
- キーワードだけ強調色にすると視線が集まる。
