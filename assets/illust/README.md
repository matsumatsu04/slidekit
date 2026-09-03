# SlideKit 共通イラスト（淡い水彩フラット・8枚）

スライドの温かみを出すための、統一トーンの挿絵セット。
参考にしたのは `output/slidekit-quality-research-20260902/reference/`（p1・p3・p10）の
「淡いフラットイラストが帯・カードに入っているデッキ」。

生成日: 2026-09-03 ／ 生成: `scripts/openai-image.sh`（gpt-image-2・quality high）／ 幅1200pxに縮小済み

## トーン定義（8枚共通・追加生成時も必ず守る）

- 淡い水彩調のフラットイラスト。輪郭線なし。質感は紙に薄く塗った水彩
- 色は **グレーブルー（#6b8fb0 系）とネイビー（#1E2E53 系）の濃淡＋オフホワイト** の2〜3色だけ。肌は薄いベージュ。他の色を入れない
- 人物は顔の造作（目鼻口）を描かない。シンプルな体型・オフィスカジュアル
- **背景は白（#FFFFFF）**。影や地面の線は薄いグレーブルーで最小限
- 文字・ロゴ・記号を一切入れない
- 参考: 日本のビジネス資料向けの「やさしいフラットイラスト」

## 共通プロンプトの正本（実際に使った文言）

追加生成するときは、この文言を**一字も変えずに**先頭に置き、そのあとに `Scene: ...` でシーンだけ書く。

```
Soft watercolor-style flat illustration with no outlines; the texture is thin watercolor washes on paper. Strictly limited palette: only light-to-dark shades of grey-blue (around #6b8fb0) and navy (around #1E2E53) plus off-white; skin is a pale beige; absolutely no other colors. People have no facial features (no eyes, nose, or mouth), simple body shapes, office-casual clothing. Pure white background (#FFFFFF); shadows and ground lines are minimal and in pale grey-blue only. No text, letters, numbers, logos, symbols, or icons anywhere in the image. Style reference: gentle flat illustrations used in Japanese business presentation slides.
```

生成コマンド（リポジトリルートから）:

```bash
bash scripts/openai-image.sh "<共通プロンプト> Scene: <シーン>" slidekit/assets/illust/<name>.jpg <1536x1024|1024x1024> high gpt-image-2
sips -Z 1200 slidekit/assets/illust/<name>.jpg   # 横長（1536px）だけ。スライド焼き込み用に幅1200pxへ
```

注意: `sips -Z` は「最大辺をその値に合わせる」ので、1024pxの正方形に `-Z 1200` を掛けると**拡大される**。正方形は1024pxのまま触らない。

シーンの書き方のコツ（8枚で効いたもの）:
- 書類・ホワイトボード・ブラウザ画面は「blank / nothing written inside」と明記する（文字の混入防止）
- 人物を並べるときは「evenly spaced, same scale, facing forward」を入れる
- 余白が欲しい絵は「Lots of white space around」で締める

### 8枚それぞれのシーン文

| ファイル | Scene |
|---|---|
| office-street | A row of low-rise office buildings (two to four stories, simple rectangular forms with large windows) standing side by side along a street, seen straight from the front, with a few small pedestrians walking on the sidewalk and one or two slim trees. Wide horizontal banner composition; the sky above is left as plain white. |
| people-band | Five people standing in a single horizontal row, evenly spaced and drawn at exactly the same scale, all shown from the waist up and facing forward. From left to right: one holding a few sheets of blank paper, one holding an open laptop, one holding a smartphone, one holding a magnifying glass, one holding a tablet. Wide horizontal banner composition with generous white space between and around them. |
| desk-work | One person sitting at a simple desk working on an open laptop, seen from the side in profile view. A plain chair, the desk, the laptop, and at most one small object such as a cup. Lots of white space around. |
| meeting-two | Two people sitting across a small table from each other having a business meeting, seen from the side. A few blank sheets of paper or a closed laptop on the table. Lots of white space around. |
| presenting | One person standing beside a large blank whiteboard or projection screen on a simple stand, gesturing toward it with one hand as if explaining to an audience. The board is completely empty with no writing or marks. Lots of white space around. |
| paper-pile | One person sitting at a desk writing or working, with several tall stacks of blank paper documents piled up on and beside the desk. All papers are blank with no writing. Lots of white space around. |
| web-screen | One person standing and pointing at a large browser window drawn as a simple wireframe: only the window frame, a thin header bar with three small dots, and a few empty rectangular placeholder blocks inside. Nothing written inside the window. Lots of white space around. |
| team-three | Three people standing side by side facing forward, full body, with varied body types and heights and different office-casual outfits (for example a cardigan, a shirt, a blouse). Evenly spaced, same scale. Lots of white space around. |

## 一覧と使いどころ

| ファイル | 内容 | 比率 | 推奨する使いどころ |
|---|---|---|---|
| `office-street.jpg` | 街路沿いの低層オフィスビル群と通行人 | 3:2（横長） | **表紙の帯**（下端に敷く。上の白い空にタイトルが載る） |
| `people-band.jpg` | 横一列の5人（書類・ノートPC・スマホ・虫眼鏡・タブレット） | 3:2（横長） | **人物の帯**（5カラム構成の下段。1人＝1カラムに対応させる） |
| `desk-work.jpg` | デスクでノートPCに向かう1人（横から） | 1:1 | カード内の挿絵（作業・実装・個人ワーク） |
| `meeting-two.jpg` | テーブルを挟んで打ち合わせる2人 | 1:1 | カード内の挿絵（ヒアリング・相談・面談） |
| `presenting.jpg` | 空のホワイトボードの前で説明する1人 | 1:1 | カード内の挿絵（説明・提案・講義） |
| `paper-pile.jpg` | 書類の山の横で作業する1人 | 1:1 | **締めのカード**（まとめ・結論スライドの白カード内） |
| `web-screen.jpg` | ワイヤーフレーム風ブラウザ画面を指差す1人 | 1:1 | カード内の挿絵（Web制作・サイト構成・画面設計） |
| `team-three.jpg` | 3人が並んで立つ | 1:1 | カード内の挿絵（体制・チーム・担当紹介） |

- 帯用の2枚は白い部分をそのまま活かし、スライド背景（白）と地続きに置く。トリミングは上下方向のみ
- 1:1 の6枚はカードの中に 200〜320px 程度で置くのが目安。拡大して主役にしない
- 暗色背景（ネイビー地）に置くときは白カードを敷いてから載せる（画像自体の背景は白で不透過）

## ライセンス

生成画像。SlideKit本体と同じ扱い（MIT）。

## 形式（2026-09-02）

- 保存形式は **JPEG（品質84）**。水彩の白地はJPEGで劣化が見えず、PNG比で約1/13（8枚で 7.3MB → 0.55MB）。デッキに焼き込む前提なので軽さを優先する
- 追加生成したら `python3 -c "from PIL import Image; Image.open('x.png').convert('RGB').save('x.jpg',quality=84,optimize=True)"` の要領でJPEG化し、PNGは残さない
