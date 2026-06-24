# SLIDEKIT-LAYOUT — content-lead-bullets

## Meta
- **pattern:** content-lead-bullets
- **category:** content
- **summary:** 見出し＋リード文＋箇条書きの最も標準的な本文ページ
- **best-for:** 説明・主張＋根拠の提示

## Structure
```yaml
regions:
  - id: title
    area: { x: 7, y: 9, w: 86, h: 13 }
    role: ページ見出し
  - id: lead
    area: { x: 7, y: 24, w: 78, h: 12 }
    role: リード文（1〜2文の要点・任意）
  - id: bullets
    area: { x: 7, y: 38, w: 78, h: 54 }
    role: 箇条書き
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 見出し | 全角20字以内 |
| lead | リード文 | 全角60字以内・任意 |
| bullets | 箇条書き | 3〜5行／各全角40字以内 |

## Authoring Notes
- 1ページ1メッセージ。箇条は5行を超えないこと。
- 箇条のマーカーは小さく、文頭の強調語だけ色を使う。
