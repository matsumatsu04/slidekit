# SLIDEKIT-LAYOUT — cover-split-left

## Meta
- **pattern:** cover-split-left
- **category:** cover
- **summary:** 左にタイトル、右に視覚帯（図・写真・アクセント面）を置く分割表紙
- **best-for:** ビジュアルを添えたい表紙・シリーズものの統一表紙

## Structure
```yaml
regions:
  - id: title-block
    area: { x: 7, y: 30, w: 50, h: 40 }
    role: タイトル＋サブタイトルの縦積み
  - id: visual-band
    area: { x: 62, y: 0, w: 38, h: 100 }
    role: 右側の視覚帯（図・写真・アクセント面のいずれか）
align: left
```

## Slots
| スロット | 役割 | 推奨文字数／個数 |
|---|---|---|
| title-block | 主タイトル＋補足 | タイトル全角20字／補足全角24字 |
| visual-band | 視覚要素 | 図/写真1点 or アクセント面 |

## Authoring Notes
- 左テキストは左寄せ。右の帯は全高で抜く。
- 視覚帯に文字を載せない（タイトルは左に集約）。
- 図がない場合はアクセント面（ベタ）でも成立する。
