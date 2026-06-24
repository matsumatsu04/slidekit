# SLIDEKIT-LAYOUT — closing-cta

## Meta
- **pattern:** closing-cta
- **category:** closing
- **summary:** まとめ＋次の行動（CTA）を示す締めページ
- **best-for:** 発表の最後・行動喚起・連絡先提示

## Structure
```yaml
regions:
  - id: title
    area: { x: 9, y: 28, w: 78, h: 16 }
    role: 締めのメッセージ
  - id: cta
    area: { x: 9, y: 50, w: 60, h: 12 }
    role: 次の行動（CTA）
  - id: contact
    area: { x: 9, y: 78, w: 70, h: 10 }
    role: 連絡先・URL・補足（任意）
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title | 締めメッセージ | 全角24字以内 |
| cta | 次の行動 | 全角30字以内 |
| contact | 連絡先・URL | 1〜2行・任意 |

## Authoring Notes
- CTAは1つに絞る。複数あると行動が分散する。
- CTAは強調色のボタン風や帯にすると目立つ（デザイン側で）。
