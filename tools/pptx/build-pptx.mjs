// SlideKit deck.json → 編集可能な .pptx を生成するビルダー
// 使い方: node build-pptx.mjs <deck.json> <out.pptx>
//
// deck.json スキーマ:
// {
//   "meta":  { "title": "..." },
//   "theme": { "accent":"5AA9E6","soft":"E1EFFA","text":"333333","muted":"8A8F98","bg":"FFFFFF","surface":"FFFFFF","font":"Noto Sans JP" },
//   "slides":[ { "pattern":"<pattern-name>", "heading":"見出し or null", "content":{...} }, ... ]
// }
// 変換規約（docs/pptx-generation.md 準拠）:
//   128px = 1in ／ pt = px × 0.75 ／ 色は #なし6桁HEX
import pptxgen from "pptxgenjs";
import { readFileSync } from "node:fs";

const [,, deckPath, outPath] = process.argv;
if (!deckPath || !outPath) { console.error("usage: node build-pptx.mjs <deck.json> <out.pptx>"); process.exit(1); }
const deck = JSON.parse(readFileSync(deckPath, "utf8"));

const T = Object.assign(
  { accent:"5AA9E6", soft:"E1EFFA", text:"333333", muted:"8A8F98", bg:"FFFFFF", surface:"FFFFFF", font:"Noto Sans JP" },
  deck.theme || {});
const FONT = T.font;
const W = 10, H = 5.625, PX = 128;           // 1280x720px 基準
const MX = 64/PX;                             // コンテンツ左右マージン(64px＝全幅の5%)
const BODY_Y0 = 76/PX;                        // 共通見出し下の本文開始(76px)
let BODY_Y = BODY_Y0;                         // メッセージライン有無でスライドごとに可変
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = deck.meta?.title || "SlideKit Deck";

// ---------- 共通部品 ----------
// 共通見出し デザインA: 24px太字 + 全幅下線(アクセント2px・左右40px)
function headerA(s, title, message) {
  const m = 40/PX, top = 24/PX;
  s.addText(title, { x:m, y:top, w:W-m*2, h:0.36, fontSize:18, bold:true, color:T.text, fontFace:FONT, margin:0 });
  s.addShape(pres.shapes.LINE, { x:m, y:top+0.42, w:W-m*2, h:0, line:{ color:T.accent, width:2 } });
  if (message)  // メッセージライン: このスライドの結論1行（アクションタイトル）
    s.addText(message, { x:m, y:top+0.52, w:W-m*2, h:0.34, fontSize:12, color:T.text, fontFace:FONT, margin:0 });
}
function pageNo(s, n, total) {
  s.addText(`${n} / ${total}`, { x:W-1.2, y:H-0.38, w:0.9, h:0.3, fontSize:9, color:T.muted, fontFace:FONT, align:"right", margin:0 });
}
// カード（白面＋アクセント枠・角丸）
function card(s, x, y, w, h) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius:0.06,
    fill:{ color:T.surface }, line:{ color:T.accent, width:1 } });
}
// リッチテキスト: 文字列 or [{text, accent?, bold?}] を pptxgenjs runs に
function runs(v, base = {}) {
  if (typeof v === "string") return [{ text: v, options: { color: T.text, ...base } }];
  return v.map(p => ({ text: p.text, options: { color: p.accent ? T.accent : T.text, bold: p.bold ?? base.bold, ...base, breakLine: p.br } }));
}

// ---------- パターン別レンダラ ----------
const R = {
  // 表紙: 左下テキスト + 右上装飾円
  "cover-gradient-text-bottom"(s, c) {
    s.background = { color: T.bg };
    s.addShape(pres.shapes.OVAL, { x:6.9, y:-1.7, w:4.8, h:4.8, fill:{ color:T.soft }, line:{ type:"none" } });
    s.addShape(pres.shapes.OVAL, { x:8.8, y:1.9, w:2.0, h:2.0, fill:{ color:T.accent, transparency:78 }, line:{ type:"none" } });
    s.addShape(pres.shapes.RECTANGLE, { x:0, y:H-0.09, w:W, h:0.09, fill:{ color:T.accent }, line:{ type:"none" } });
    if (c.eyebrow) s.addText(c.eyebrow, { x:0.55, y:2.95, w:7, h:0.35, fontSize:12, bold:true, color:T.accent, fontFace:FONT, charSpacing:4, margin:0 });
    s.addText(c.title, { x:0.55, y:3.3, w:8.9, h:1.0, fontSize:33, bold:true, color:T.text, fontFace:FONT, margin:0 });
    if (c.subtitle) s.addText(c.subtitle, { x:0.55, y:4.4, w:8.9, h:0.4, fontSize:13, color:T.muted, fontFace:FONT, margin:0 });
  },
  // 目次
  "agenda-toc"(s, c) {
    s.addText(c.title || "アジェンダ", { x:1.0, y:0.55, w:8, h:0.5, fontSize:22, bold:true, color:T.text, fontFace:FONT, margin:0 });
    const items = c.items || [];
    const rowH = Math.min(0.85, 3.6/items.length);
    let y = 1.45;
    for (const it of items) {
      const [no, ...rest] = it.split(/\s+/); const label = rest.join(" ");
      s.addText(no, { x:1.0, y, w:0.75, h:rowH-0.2, fontSize:17, bold:true, color:T.accent, fontFace:FONT, valign:"middle", margin:0 });
      s.addText(label, { x:1.85, y, w:7.1, h:rowH-0.2, fontSize:15, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addShape(pres.shapes.LINE, { x:1.0, y:y+rowH-0.15, w:8.0, h:0, line:{ color:T.soft, width:1 } });
      y += rowH;
    }
  },
  // 中扉
  "section-divider"(s, c) {
    s.background = { color: T.accent };
    s.addText(c.no || "", { x:0.7, y:0.9, w:5, h:2.3, fontSize:110, bold:true, color:"FFFFFF", fontFace:FONT, transparency:60, margin:0 });
    s.addText(c.title, { x:0.75, y:3.3, w:8.5, h:0.7, fontSize:28, bold:true, color:"FFFFFF", fontFace:FONT, margin:0 });
    if (c.subtitle) s.addText(c.subtitle, { x:0.78, y:4.05, w:8.4, h:0.4, fontSize:13, color:"FFFFFF", fontFace:FONT, transparency:25, margin:0 });
  },
  // キーメッセージ
  "key-message-single"(s, c) {
    const msgY = c.supplements?.length ? 1.7 : 2.3;
    s.addText(runs(c.message, { bold:true }), { x:0.5, y:msgY, w:W-1.0, h:1.3, fontSize:24, fontFace:FONT, align:"center", margin:0 });
    let y = msgY + 1.6;
    for (const sup of c.supplements || []) {
      s.addShape(pres.shapes.LINE, { x:W/2-0.25, y:y-0.08, w:0.5, h:0, line:{ color:T.accent, width:2 } });
      s.addText(sup, { x:1.2, y, w:W-2.4, h:0.42, fontSize:13, color:T.text, fontFace:FONT, align:"center", margin:0 });
      y += 0.55;
    }
  },
  // 番号付き縦リスト（バッジ+見出し+本文）
  "numbered-list-with-body"(s, c) {
    let y = BODY_Y + 0.25;
    if (c.lead) { s.addText(runs(c.lead), { x:MX+0.25, y, w:W-MX*2-0.5, h:0.55, fontSize:13, fontFace:FONT, margin:0 }); y += 0.75; }
    const items = c.items || [];
    const rowH = Math.min(1.3, (H-0.5-y)/items.length);
    y += Math.max(0, (H-0.45-y - rowH*items.length)/2);  // 本文領域の垂直センター
    items.forEach((it, i) => {
      s.addShape(pres.shapes.OVAL, { x:MX+0.25, y:y+0.1, w:0.5, h:0.5, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(String(i+1), { x:MX+0.25, y:y+0.1, w:0.5, h:0.5, fontSize:15, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(it.title, { x:MX+1.0, y, w:W-MX*2-1.2, h:0.38, fontSize:15, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addText(it.body, { x:MX+1.0, y:y+0.38, w:W-MX*2-1.2, h:rowH-0.42, fontSize:12.5, color:T.text, fontFace:FONT, margin:0, valign:"top" });
      y += rowH;
    });
  },
  // 3カラムカード（アクセント短線+見出し+本文）
  "three-column-icon-card"(s, c) {
    const cards = c.cards || [];
    const gap = 0.3, cw = (W-MX*2-gap*(cards.length-1))/cards.length;
    const ch = c.note ? 2.9 : 3.3;
    const cy = BODY_Y + (H - BODY_Y - 0.45 - ch - (c.note ? 0.7 : 0)) / 2;  // 垂直センター
    cards.forEach((cd, i) => {
      const x = MX + i*(cw+gap);
      card(s, x, cy, cw, ch);
      s.addShape(pres.shapes.LINE, { x:x+0.3, y:cy+0.4, w:0.5, h:0, line:{ color:T.accent, width:2.5 } });
      s.addText(cd.title, { x:x+0.3, y:cy+0.55, w:cw-0.5, h:0.42, fontSize:15, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addText(cd.body, { x:x+0.3, y:cy+1.0, w:cw-0.5, h:ch-1.25, fontSize:12, color:T.text, fontFace:FONT, margin:0, valign:"top" });
    });
    if (c.note) s.addText(c.note, { x:MX, y:cy+ch+0.25, w:W-MX*2, h:0.4, fontSize:12, color:T.muted, fontFace:FONT, align:"center", margin:0 });
  },
  // 4ステップフロー（カード+矢印）
  "four-step-flow"(s, c) {
    let y = BODY_Y + 0.2;
    if (c.lead) { s.addText(c.lead, { x:MX+0.25, y, w:W-MX*2-0.5, h:0.4, fontSize:12.5, color:T.text, fontFace:FONT, margin:0 }); y += 0.6; }
    const steps = c.steps || [];
    const arrowW = 0.35, gap = 0.12;
    const cw = (W - MX*2 - (steps.length-1)*(arrowW+gap*2)) / steps.length;
    const ch = 2.6;                                    // 内容に合わせた高さ（下の余白を作らない）
    y += Math.max(0, (H - y - 0.5 - ch) / 2);          // 残り領域の垂直センター
    steps.forEach((st, i) => {
      const x = MX + i*(cw+arrowW+gap*2);
      card(s, x, y, cw, ch);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:x+0.22, y:y+0.22, w:1.0, h:0.34, rectRadius:0.17, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(`STEP ${i+1}`, { x:x+0.22, y:y+0.22, w:1.0, h:0.34, fontSize:10, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(st.title, { x:x+0.22, y:y+0.68, w:cw-0.4, h:0.4, fontSize:14, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addText(st.body, { x:x+0.22, y:y+1.1, w:cw-0.38, h:ch-1.3, fontSize:11.5, color:T.text, fontFace:FONT, margin:0, valign:"top" });
      if (i < steps.length-1)
        s.addText("→", { x:x+cw+gap, y:y+ch/2-0.25, w:arrowW, h:0.5, fontSize:18, bold:true, color:T.accent, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    });
  },
  // 左右2ボックス＋注記
  "two-column-split-boxes"(s, c) {
    const cy = BODY_Y + 0.3, ch = c.note ? 2.9 : 3.5;
    const gap = 0.4, cw = (W-MX*2-gap)/2;
    [c.left, c.right].forEach((bx, i) => {
      const x = MX + i*(cw+gap);
      card(s, x, cy, cw, ch);
      s.addShape(pres.shapes.RECTANGLE, { x, y:cy, w:cw, h:0.52, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(bx.title, { x:x+0.2, y:cy, w:cw-0.4, h:0.52, fontSize:13, bold:true, color:"FFFFFF", fontFace:FONT, valign:"middle", margin:0 });
      s.addText((bx.items||[]).map(t=>({ text:t, options:{ bullet:{ characterCode:"2022", indent:10 }, color:T.text, breakLine:true } })),
        { x:x+0.3, y:cy+0.7, w:cw-0.6, h:ch-0.95, fontSize:12, fontFace:FONT, margin:0, paraSpaceAfter:6, valign:"top" });
    });
    if (c.note) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX, y:cy+ch+0.2, w:W-MX*2, h:0.55, rectRadius:0.05, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(c.note, { x:MX+0.25, y:cy+ch+0.2, w:W-MX*2-0.5, h:0.55, fontSize:11.5, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
    }
  },
  // 3ポイントまとめ（大きな番号）
  "summary-three-points"(s, c) {
    const pts = c.points || [];
    const gap = 0.3, cw = (W-MX*2-gap*(pts.length-1))/pts.length;
    const cy = BODY_Y + 0.35, ch = 3.5;
    pts.forEach((p, i) => {
      const x = MX + i*(cw+gap);
      card(s, x, cy, cw, ch);
      s.addText(String(i+1).padStart(2,"0"), { x:x+0.28, y:cy+0.18, w:1.2, h:0.7, fontSize:30, bold:true, color:T.accent, fontFace:FONT, margin:0 });
      s.addShape(pres.shapes.LINE, { x:x+0.3, y:cy+1.0, w:0.5, h:0, line:{ color:T.accent, width:2 } });
      s.addText(p.title, { x:x+0.28, y:cy+1.15, w:cw-0.44, h:0.42, fontSize:14.5, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addText(p.body, { x:x+0.28, y:cy+1.6, w:cw-0.44, h:ch-1.85, fontSize:11.5, color:T.text, fontFace:FONT, margin:0, valign:"top" });
    });
  },
  // 3つの円フロー
  "three-stage-circle-flow"(s, c) {
    const steps = c.steps || [];
    const d = 1.15, span = (W-MX*2)/steps.length;
    const cy0 = 1.55;                                  // 全体を垂直センター寄りに
    steps.forEach((st, i) => {
      const cxm = MX + span*i + span/2;
      s.addShape(pres.shapes.OVAL, { x:cxm-d/2, y:cy0, w:d, h:d, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(String(i+1), { x:cxm-d/2, y:cy0, w:d, h:d, fontSize:26, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(st.title, { x:cxm-span/2+0.1, y:cy0+1.35, w:span-0.2, h:0.42, fontSize:15, bold:true, color:T.text, fontFace:FONT, align:"center", margin:0 });
      s.addText(st.body, { x:cxm-span/2+0.08, y:cy0+1.8, w:span-0.16, h:1.3, fontSize:11.5, color:T.text, fontFace:FONT, align:"center", margin:0 });
      if (i < steps.length-1)
        s.addText("→", { x:MX+span*(i+1)-0.25, y:cy0+0.35, w:0.5, h:0.5, fontSize:20, bold:true, color:T.accent, fontFace:FONT, align:"center", margin:0 });
    });
  },
  // アイコン左テキストリスト
  "icon-left-text-list"(s, c) {
    const items = c.items || [];
    const rowH = Math.min(0.72, (H-BODY_Y-0.8)/items.length);
    let y = BODY_Y + 0.35;
    for (const it of items) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX+0.3, y:y+0.05, w:0.3, h:0.3, rectRadius:0.06, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(it, { x:MX+0.85, y, w:W-MX*2-1.1, h:rowH-0.12, fontSize:13.5, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addShape(pres.shapes.LINE, { x:MX+0.3, y:y+rowH-0.06, w:W-MX*2-0.6, h:0, line:{ color:T.soft, width:1 } });
      y += rowH;
    }
  },
  // Before/After 2カラム
  "before-after-two-col"(s, c) {
    const nRows = Math.max((c.before||[]).length, (c.after||[]).length);
    const ch = Math.min(3.4, 1.05 + nRows*0.38);       // 行数に合わせた高さ
    const cy = BODY_Y + (H - BODY_Y - 0.45 - ch) / 2;  // 垂直センター
    const arrow = 0.6, gap = 0.15, cw = (W-MX*2-arrow-gap*2)/2;
    [["Before", c.before], ["After", c.after]].forEach(([label, items], i) => {
      const x = MX + i*(cw+arrow+gap*2);
      card(s, x, cy, cw, ch);
      s.addText(label, { x:x+0.3, y:cy+0.22, w:2, h:0.4, fontSize:14, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addShape(pres.shapes.LINE, { x:x+0.3, y:cy+0.64, w:1.0, h:0, line:{ color:T.accent, width:2.5 } });
      s.addText((items||[]).map(t=>({ text:t, options:{ bullet:{ characterCode:"2022", indent:10 }, color:T.text, breakLine:true } })),
        { x:x+0.35, y:cy+0.82, w:cw-0.6, h:ch-1.0, fontSize:12.5, fontFace:FONT, margin:0, paraSpaceAfter:8, valign:"top" });
    });
    s.addText("→", { x:MX+cw+gap, y:cy+ch/2-0.3, w:arrow, h:0.6, fontSize:26, bold:true, color:T.accent, fontFace:FONT, align:"center", valign:"middle", margin:0 });
  },
  // KPI 3枚
  "three-kpi-big-number"(s, c) {
    const kpis = c.kpis || [];
    const gap = 0.35, cw = (W-MX*2-gap*(kpis.length-1))/kpis.length;
    const cy = BODY_Y + 0.4, ch = 3.3;
    kpis.forEach((k, i) => {
      const x = MX + i*(cw+gap);
      card(s, x, cy, cw, ch);
      s.addText(k.label, { x:x+0.2, y:cy+0.35, w:cw-0.4, h:0.35, fontSize:12, color:T.muted, fontFace:FONT, align:"center", margin:0 });
      s.addText([{ text:k.value, options:{ fontSize:38, bold:true, color:T.accent } },
                 { text:k.unit ? ` ${k.unit}` : "", options:{ fontSize:18, bold:true, color:T.accent } }],
        { x:x+0.2, y:cy+0.85, w:cw-0.4, h:1.0, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(k.body, { x:x+0.18, y:cy+2.1, w:cw-0.36, h:0.9, fontSize:11.5, color:T.text, fontFace:FONT, align:"center", margin:0 });
    });
  },
  // FAQ 1カラム
  "faq-single-column"(s, c) {
    const items = c.items || [];
    let y = BODY_Y + 0.3;
    const rowH = Math.min(1.35, (H-y-0.4)/items.length);
    for (const qa of items) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX+0.2, y, w:0.42, h:0.42, rectRadius:0.08, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText("Q", { x:MX+0.2, y, w:0.42, h:0.42, fontSize:14, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(qa.q, { x:MX+0.85, y, w:W-MX*2-1.1, h:0.42, fontSize:13.5, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addText(qa.a, { x:MX+0.85, y:y+0.5, w:W-MX*2-1.1, h:rowH-0.6, fontSize:12, color:T.text, fontFace:FONT, margin:0, valign:"top" });
      y += rowH;
    }
  },
  // 汎用フォールバック: タイトル+箇条書き
  "bullets"(s, c) {
    if (c.title) s.addText(c.title, { x:MX+0.25, y:BODY_Y+0.25, w:W-MX*2-0.5, h:0.5, fontSize:17, bold:true, color:T.text, fontFace:FONT, margin:0 });
    s.addText((c.items||[]).map(t=>({ text:t, options:{ bullet:{ characterCode:"2022", indent:12 }, color:T.text, breakLine:true } })),
      { x:MX+0.35, y:BODY_Y+(c.title?0.95:0.35), w:W-MX*2-0.7, h:3.4, fontSize:14, fontFace:FONT, margin:0, paraSpaceAfter:10 });
  },
};

// ---------- ビルド ----------
const total = deck.slides.length;
const NO_PAGENO = new Set(["cover-gradient-text-bottom", "section-divider"]);
deck.slides.forEach((sl, i) => {
  const s = pres.addSlide();
  s.background = { color: T.bg };
  const render = R[sl.pattern] || R.bullets;
  if (!R[sl.pattern]) console.warn(`[warn] no renderer for pattern "${sl.pattern}" — fallback to bullets`);
  BODY_Y = BODY_Y0 + (sl.heading && sl.message ? 0.4 : 0);
  if (sl.heading) headerA(s, sl.heading, sl.message);
  render(s, sl.content || {}, sl);
  if (!NO_PAGENO.has(sl.pattern)) pageNo(s, i+1, total);
});

await pres.writeFile({ fileName: outPath });
console.log(`OK: ${outPath} (${total} slides)`);
