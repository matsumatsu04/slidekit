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
    // ギャラリー実物: 全面斜めグラデーション背景＋左下にテキストを集約（メインタイトル→会社名/日付相当）
    s.background = { color: T.bg };
    s.addShape(pres.shapes.OVAL, { x:W-3.2, y:-2.3, w:7.0, h:7.0, fill:{ color:T.soft }, line:{ type:"none" } }); // グラデーションの簡易近似
    const boxY = H - 2.1;
    if (c.eyebrow) s.addText(c.eyebrow, { x:0.55, y:boxY-0.42, w:8, h:0.32, fontSize:12, bold:true, color:T.accent, fontFace:FONT, charSpacing:3, margin:0 });
    s.addText(c.title, { x:0.55, y:boxY, w:8.9, h:1.0, fontSize:30, bold:true, color:T.text, fontFace:FONT, margin:0 });
    if (c.subtitle) s.addText(c.subtitle, { x:0.55, y:boxY+1.08, w:8.9, h:0.4, fontSize:13, color:T.muted, fontFace:FONT, margin:0 });
  },
  // 目次（ギャラリー実物: ヘッダー＋「番号｜項目名 + 点線リーダー + ページ番号」の横一列）
  "agenda-toc"(s, c) {
    s.addText(c.label || "AGENDA", { x:0.7, y:0.5, w:6, h:0.28, fontSize:11, bold:true, color:T.muted, fontFace:FONT, charSpacing:2, margin:0 });
    s.addText(c.title || "目次", { x:0.7, y:0.82, w:7, h:0.5, fontSize:24, bold:true, color:T.text, fontFace:FONT, margin:0 });
    const items = c.items || [];
    const top = 1.65, bottom = H-0.5, rowH = (bottom-top)/items.length;
    items.forEach((it, i) => {
      const [no, ...rest] = it.split(/\s+/); const page = it.match(/[（(]?p\.?\s*\d+[)）]?$/i);
      const label = (page ? rest.slice(0,-1) : rest).join(" ");
      const y = top + rowH*i + rowH/2 - 0.18;
      s.addText(no, { x:0.7, y, w:0.55, h:0.36, fontSize:18, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addText(label, { x:1.35, y, w:3.0, h:0.36, fontSize:13.5, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addShape(pres.shapes.LINE, { x:4.55, y:y+0.2, w:W-4.55-1.1, h:0, line:{ color:T.muted, width:0.75, dashType:"sysDot" } });
      if (page) s.addText(page[0], { x:W-1.0, y, w:0.9, h:0.36, fontSize:12, color:T.text, fontFace:FONT, align:"right", valign:"middle", margin:0 });
    });
  },
  // 中扉（ギャラリー実物: 白背景・左に太い縦アクセント線・左揃えの番号/タイトル/サブタイトル）
  "section-divider"(s, c) {
    s.background = { color: T.bg };
    const cx = 0.85, cy = H/2-0.65;
    s.addShape(pres.shapes.RECTANGLE, { x:cx, y:cy, w:0.035, h:1.3, fill:{ color:T.muted }, line:{ type:"none" } });
    s.addText(c.no || "", { x:cx+0.45, y:cy-0.15, w:5, h:0.7, fontSize:38, bold:true, color:T.muted, fontFace:FONT, margin:0 });
    s.addText(c.title, { x:cx+0.45, y:cy+0.5, w:7.5, h:0.55, fontSize:26, bold:true, color:T.text, fontFace:FONT, margin:0 });
    if (c.subtitle) s.addText(c.subtitle, { x:cx+0.45, y:cy+1.05, w:7.3, h:0.4, fontSize:13, color:T.text, fontFace:FONT, margin:0 });
  },
  // キーメッセージ（ギャラリー実物: 区切り線→メッセージ→区切り線→補足の中央積み）
  "key-message-single"(s, c) {
    const suppN = (c.supplements||[]).length;
    const msgH = 1.0, dividerGap = 0.32;
    const blockH = dividerGap*2 + msgH + (suppN ? suppN*0.42+0.1 : 0);
    let y = BODY_Y + Math.max(0.15, (H-BODY_Y-0.3-blockH)/2);
    s.addShape(pres.shapes.LINE, { x:W/2-0.24, y, w:0.47, h:0, line:{ color:T.muted, width:1 } });
    y += dividerGap;
    s.addText(runs(c.message, { bold:true }), { x:0.7, y, w:W-1.4, h:msgH, fontSize:20, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    y += msgH + 0.1;
    s.addShape(pres.shapes.LINE, { x:W/2-0.24, y, w:0.47, h:0, line:{ color:T.muted, width:1 } });
    y += 0.22;
    for (const sup of c.supplements || []) {
      s.addText(sup, { x:1.2, y, w:W-2.4, h:0.4, fontSize:12, color:T.muted, fontFace:FONT, align:"center", margin:0 });
      y += 0.42;
    }
  },
  // 番号付き縦リスト（ギャラリー実物: 淡色バッジ+見出し+本文、行区切り線）
  "numbered-list-with-body"(s, c) {
    let y = BODY_Y + 0.25;
    if (c.lead) { s.addText(runs(c.lead), { x:MX+0.25, y, w:W-MX*2-0.5, h:0.55, fontSize:13, fontFace:FONT, margin:0 }); y += 0.75; }
    const items = c.items || [];
    const rowH = Math.min(1.3, (H-0.5-y)/items.length);
    y += Math.max(0, (H-0.45-y - rowH*items.length)/2);  // 本文領域の垂直センター
    items.forEach((it, i) => {
      s.addShape(pres.shapes.OVAL, { x:MX+0.25, y:y+0.1, w:0.5, h:0.5, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(String(i+1).padStart(2,"0"), { x:MX+0.25, y:y+0.1, w:0.5, h:0.5, fontSize:14, bold:true, color:T.text, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(it.title, { x:MX+1.0, y, w:W-MX*2-1.2, h:0.38, fontSize:15, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addText(it.body, { x:MX+1.0, y:y+0.38, w:W-MX*2-1.2, h:rowH-0.5, fontSize:12.5, color:T.text, fontFace:FONT, margin:0, valign:"top" });
      if (i < items.length-1)
        s.addShape(pres.shapes.LINE, { x:MX, y:y+rowH-0.08, w:W-MX*2, h:0, line:{ color:T.soft, width:1 } });
      y += rowH;
    });
  },
  // 3カラムカード（ギャラリー実物: 円形アイコン枠+見出し+短区切り線+左揃え箇条書き）
  "three-column-icon-card"(s, c) {
    const cards = c.cards || [];
    const gap = 0.3, cw = (W-MX*2-gap*(cards.length-1))/cards.length;
    const ch = c.note ? 2.9 : 3.3;
    const cy = BODY_Y + (H - BODY_Y - 0.45 - ch - (c.note ? 0.7 : 0)) / 2;  // 垂直センター
    const iconD = 0.55;
    cards.forEach((cd, i) => {
      const x = MX + i*(cw+gap);
      card(s, x, cy, cw, ch);
      s.addShape(pres.shapes.OVAL, { x:x+cw/2-iconD/2, y:cy+0.22, w:iconD, h:iconD, fill:{ color:T.soft }, line:{ color:T.accent, width:1, dashType:"dash" } });
      if (cd.icon) s.addText(cd.icon, { x:x+cw/2-iconD/2, y:cy+0.22, w:iconD, h:iconD, fontSize:18, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(cd.title, { x:x+0.2, y:cy+0.9, w:cw-0.4, h:0.4, fontSize:14, bold:true, color:T.text, fontFace:FONT, align:"center", margin:0 });
      s.addShape(pres.shapes.LINE, { x:x+cw/2-0.2, y:cy+1.35, w:0.4, h:0, line:{ color:T.soft, width:2 } });
      const bullets = Array.isArray(cd.body) ? cd.body : [cd.body];
      s.addText(bullets.map(t=>({ text:t, options:{ bullet:{ characterCode:"25B6", indent:12 }, color:T.text, breakLine:true } })),
        { x:x+0.3, y:cy+1.5, w:cw-0.6, h:ch-1.75, fontSize:11, fontFace:FONT, margin:0, paraSpaceAfter:5, valign:"top" });
    });
    if (c.note) s.addText(c.note, { x:MX, y:cy+ch+0.25, w:W-MX*2, h:0.4, fontSize:12, color:T.muted, fontFace:FONT, align:"center", margin:0 });
  },
  // 4ステップフロー（ギャラリー実物: カード上端に浮く円バッジ＋カード内は見出し＋補足）
  "four-step-flow"(s, c) {
    let y = BODY_Y + 0.15;
    if (c.lead) { s.addText(c.lead, { x:MX+0.25, y, w:W-MX*2-0.5, h:0.4, fontSize:12.5, color:T.text, fontFace:FONT, margin:0 }); y += 0.55; }
    const steps = c.steps || [];
    const arrowW = 0.32, gap = 0.1;
    const cw = (W - MX*2 - (steps.length-1)*(arrowW+gap*2)) / steps.length;
    const badgeD = 0.42;
    const cardTop = y + badgeD/2 + 0.05, cardH = H - cardTop - 0.45;
    steps.forEach((st, i) => {
      const x = MX + i*(cw+arrowW+gap*2);
      card(s, x, cardTop, cw, cardH);
      s.addShape(pres.shapes.OVAL, { x:x+cw/2-badgeD/2, y:cardTop-badgeD/2, w:badgeD, h:badgeD, fill:{ color:T.soft }, line:{ color:T.accent, width:2 } });
      s.addText(String(i+1), { x:x+cw/2-badgeD/2, y:cardTop-badgeD/2, w:badgeD, h:badgeD, fontSize:14, bold:true, color:T.text, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(st.title, { x:x+0.15, y:cardTop+0.32, w:cw-0.3, h:0.55, fontSize:13, bold:true, color:T.text, fontFace:FONT, align:"center", valign:"top", margin:0 });
      s.addText(st.body, { x:x+0.15, y:cardTop+0.92, w:cw-0.3, h:cardH-1.1, fontSize:10.5, color:T.muted, fontFace:FONT, align:"center", margin:0, valign:"top" });
      if (i < steps.length-1)
        s.addText("▶", { x:x+cw+gap, y:cardTop+cardH/2-0.15, w:arrowW, h:0.3, fontSize:14, bold:true, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    });
  },
  // 左右2ボックス（ギャラリー実物: 点線枠・プレーン見出し・段落本文・中央に点線円コネクタ）
  "two-column-split-boxes"(s, c) {
    const cy = BODY_Y + 0.3, ch = c.note ? 2.9 : 3.5;
    const connW = 0.55, gap = 0.15, cw = (W-MX*2-connW-gap*2)/2;
    [c.left, c.right].forEach((bx, i) => {
      const x = MX + i*(cw+connW+gap*2);
      s.addShape(pres.shapes.RECTANGLE, { x, y:cy, w:cw, h:ch, fill:{ color:T.surface }, line:{ color:T.accent, width:1, dashType:"dash" } });
      s.addText(bx.title, { x:x+0.32, y:cy+0.28, w:cw-0.64, h:0.4, fontSize:16, bold:true, color:T.text, fontFace:FONT, margin:0 });
      const body = Array.isArray(bx.items) ? bx.items.join("\n") : (bx.body || (bx.items||[]).join("\n"));
      s.addText(body, { x:x+0.32, y:cy+0.85, w:cw-0.64, h:ch-1.1, fontSize:12, color:T.text, fontFace:FONT, margin:0, valign:"top", lineSpacingMultiple:1.5 });
    });
    const ccx = MX+cw+gap+connW/2, ccy = cy+ch/2, cd = 0.5;
    s.addShape(pres.shapes.OVAL, { x:ccx-cd/2, y:ccy-cd/2, w:cd, h:cd, fill:{ color:T.soft }, line:{ color:T.accent, width:1, dashType:"dash" } });
    s.addText("→", { x:ccx-cd/2, y:ccy-cd/2, w:cd, h:cd, fontSize:16, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    if (c.note) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX, y:cy+ch+0.2, w:W-MX*2, h:0.55, rectRadius:0.05, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(c.note, { x:MX+0.25, y:cy+ch+0.2, w:W-MX*2-0.5, h:0.55, fontSize:11.5, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
    }
  },
  // 3ポイントまとめ（ギャラリー実物: 縦積みチェックリスト。枠アイコン+見出し+本文、行区切り線）
  "summary-three-points"(s, c) {
    const pts = c.points || [];
    let y = BODY_Y + 0.3;
    const rowH = Math.min(1.1, (H-0.4-y)/pts.length);
    y += Math.max(0, (H-0.4-y-rowH*pts.length)/2);
    const iconD = 0.32;
    pts.forEach((p, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x:MX+0.2, y:y+0.08, w:iconD, h:iconD, fill:{ color:"FFFFFF" }, line:{ color:T.accent, width:2 } });
      s.addText("✓", { x:MX+0.2, y:y+0.08, w:iconD, h:iconD, fontSize:13, bold:true, color:T.accent, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(p.title, { x:MX+0.9, y, w:W-MX*2-1.1, h:0.4, fontSize:15, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addText(p.body, { x:MX+0.9, y:y+0.4, w:W-MX*2-1.1, h:rowH-0.5, fontSize:12.5, color:T.text, fontFace:FONT, margin:0, valign:"top" });
      if (i < pts.length-1)
        s.addShape(pres.shapes.LINE, { x:MX, y:y+rowH-0.08, w:W-MX*2, h:0, line:{ color:T.soft, width:1 } });
      y += rowH;
    });
  },
  // 3つの円フロー（ギャラリー実物: 白抜き枠円+ステップ名、下に見出し+短区切り線+箇条書き）
  "three-stage-circle-flow"(s, c) {
    const steps = c.steps || [];
    const d = 1.15, span = (W-MX*2)/steps.length;
    const maxBullets = Math.max(1, ...steps.map(st => (Array.isArray(st.body) ? st.body : [st.body]).length));
    const blockH = d + 0.14 + 0.36 + 0.13 + 0.14 + (maxBullets*0.24 + 0.1);
    const topY = BODY_Y + Math.max(0.2, (H - BODY_Y - 0.35 - blockH) / 2);
    steps.forEach((st, i) => {
      const cxm = MX + span*i + span/2;
      s.addShape(pres.shapes.OVAL, { x:cxm-d/2, y:topY, w:d, h:d, fill:{ color:T.surface }, line:{ color:T.accent, width:2 } });
      if (st.icon) s.addText(st.icon, { x:cxm-d/2, y:topY+0.14, w:d, h:0.4, fontSize:20, color:T.muted, fontFace:FONT, align:"center", margin:0 });
      s.addText(`STEP ${i+1}`, { x:cxm-d/2, y:topY+d-0.4, w:d, h:0.36, fontSize:10, bold:true, color:T.text, fontFace:FONT, align:"center", margin:0 });
      s.addText(st.title, { x:cxm-span/2+0.15, y:topY+d+0.14, w:span-0.3, h:0.36, fontSize:14, bold:true, color:T.text, fontFace:FONT, align:"center", margin:0 });
      s.addShape(pres.shapes.LINE, { x:cxm-0.25, y:topY+d+0.55, w:0.5, h:0, line:{ color:T.muted, width:1 } });
      const bullets = Array.isArray(st.body) ? st.body : [st.body];
      s.addText(bullets.map(t=>({ text:"・"+t, options:{ color:T.text, breakLine:true } })),
        { x:cxm-span/2+0.1, y:topY+d+0.68, w:span-0.2, h:H-(topY+d+0.68)-0.3, fontSize:10.5, fontFace:FONT, align:"center", margin:0, valign:"top" });
      if (i < steps.length-1)
        s.addText("→", { x:MX+span*(i+1)-0.2, y:topY+d/2-0.16, w:0.4, h:0.32, fontSize:18, color:T.muted, fontFace:FONT, align:"center", margin:0 });
    });
  },
  // アイコン左テキストリスト（ギャラリー実物: 正方形アイコン枠+見出し/本文2段、行区切り線）
  "icon-left-text-list"(s, c) {
    const items = c.items || [];
    const rowH = Math.min(1.05, (H-BODY_Y-0.6)/items.length);
    let y = BODY_Y + 0.3;
    const iconD = 0.55;
    for (const it of items) {
      const heading = typeof it === "object" ? it.title : it;
      const body = typeof it === "object" ? it.body : "";
      s.addShape(pres.shapes.RECTANGLE, { x:MX+0.15, y:y+(rowH-iconD)/2-0.1, w:iconD, h:iconD, fill:{ color:T.soft }, line:{ color:T.accent, width:1, dashType:"dash" } });
      s.addText(heading, { x:MX+0.9, y:y-0.08, w:W-MX*2-1.1, h:0.4, fontSize:15, bold:true, color:T.text, fontFace:FONT, margin:0 });
      if (body) s.addText(body, { x:MX+0.9, y:y+0.32, w:W-MX*2-1.1, h:rowH-0.5, fontSize:12, color:T.text, fontFace:FONT, margin:0, valign:"top" });
      if (items.indexOf(it) < items.length-1)
        s.addShape(pres.shapes.LINE, { x:MX, y:y+rowH-0.12, w:W-MX*2, h:0, line:{ color:T.soft, width:1 } });
      y += rowH;
    }
  },
  // Before/After 2カラム（ギャラリー実物: ヘッダーバンド付き箱、×/○マーカー）
  "before-after-two-col"(s, c) {
    const nRows = Math.max((c.before||[]).length, (c.after||[]).length);
    const ch = Math.min(3.5, 0.6 + nRows*0.42);
    const cy = BODY_Y + (H - BODY_Y - 0.45 - ch) / 2;
    const arrow = 0.55, gap = 0.15, cw = (W-MX*2-arrow-gap*2)/2;
    [["BEFORE", c.before, "×", T.muted], ["AFTER", c.after, "○", T.text]].forEach(([label, items, marker, mcolor], i) => {
      const x = MX + i*(cw+arrow+gap*2);
      s.addShape(pres.shapes.RECTANGLE, { x, y:cy, w:cw, h:ch, fill:{ color:T.surface }, line:{ color:T.accent, width:1 } });
      s.addShape(pres.shapes.RECTANGLE, { x, y:cy, w:cw, h:0.42, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(label, { x:x+0.2, y:cy, w:cw-0.4, h:0.42, fontSize:13, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addText((items||[]).map(t=>({ text:`${marker}  ${t}`, options:{ color:T.text, breakLine:true } })),
        { x:x+0.25, y:cy+0.55, w:cw-0.5, h:ch-0.75, fontSize:12, fontFace:FONT, margin:0, paraSpaceAfter:7, valign:"top" });
    });
    s.addText("→", { x:MX+cw+gap, y:cy+ch/2-0.25, w:arrow, h:0.5, fontSize:22, bold:true, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
  },
  // KPI 3枚（ギャラリー実物: 実線枠+ラベル/大きな数字/説明/補足、カラム間縦区切り線）
  "three-kpi-big-number"(s, c) {
    const kpis = c.kpis || [];
    const gap = 0.3, cw = (W-MX*2-gap*(kpis.length-1))/kpis.length;
    const cy = BODY_Y + 0.4, ch = 3.3;
    kpis.forEach((k, i) => {
      const x = MX + i*(cw+gap);
      s.addShape(pres.shapes.RECTANGLE, { x, y:cy, w:cw, h:ch, fill:{ color:T.surface }, line:{ color:T.accent, width:1 } });
      s.addText(k.label, { x:x+0.2, y:cy+0.32, w:cw-0.4, h:0.32, fontSize:11, color:T.muted, fontFace:FONT, align:"center", margin:0 });
      s.addText([{ text:k.value, options:{ fontSize:36, bold:true, color:T.accent } },
                 { text:k.unit ? ` ${k.unit}` : "", options:{ fontSize:16, color:T.muted } }],
        { x:x+0.15, y:cy+0.72, w:cw-0.3, h:0.9, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(k.body, { x:x+0.2, y:cy+1.65, w:cw-0.4, h:0.55, fontSize:11.5, color:T.text, fontFace:FONT, align:"center", margin:0 });
      if (k.supplement) s.addText(k.supplement, { x:x+0.2, y:cy+2.25, w:cw-0.4, h:0.35, fontSize:10, color:T.muted, fontFace:FONT, align:"center", margin:0 });
      if (i < kpis.length-1)
        s.addShape(pres.shapes.LINE, { x:x+cw+gap/2, y:cy+ch*0.2, w:0, h:ch*0.6, line:{ color:T.soft, width:1 } });
    });
  },
  // FAQ 1カラム（ギャラリー実物: Q/A一体の薄枠ボックス。Qラベルは灰色）
  "faq-single-column"(s, c) {
    const items = c.items || [];
    let y = BODY_Y + 0.3;
    const rowH = Math.min(1.35, (H-y-0.4)/items.length);
    for (const qa of items) {
      s.addShape(pres.shapes.RECTANGLE, { x:MX, y, w:W-MX*2, h:rowH-0.15, fill:{ color:T.surface }, line:{ color:T.accent, width:1 } });
      s.addText("Q.", { x:MX+0.25, y:y+0.12, w:0.4, h:0.36, fontSize:13, bold:true, color:T.muted, fontFace:FONT, margin:0 });
      s.addText(qa.q, { x:MX+0.7, y:y+0.12, w:W-MX*2-1.0, h:0.4, fontSize:13, bold:true, color:T.text, fontFace:FONT, valign:"top", margin:0 });
      s.addText(qa.a, { x:MX+0.7, y:y+0.56, w:W-MX*2-1.0, h:rowH-0.75, fontSize:11.5, color:T.text, fontFace:FONT, margin:0, valign:"top" });
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
