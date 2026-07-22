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
// 共通見出し デザインA: 24px太字 + タイトル下ショートバー（56×3px・アクセント・左端揃え）
// ※Frame規定（ブランド系デザインシステム共通）: 全幅罫線ではなくショートバー
// dark=true（navy地スライド）のときは見出し・バー・メッセージを白抜きにする。
function headerA(s, title, message, dark = false) {
  const m = 40/PX, top = 24/PX;
  const titleColor = dark ? "FFFFFF" : T.text;
  const lineColor  = dark ? "FFFFFF" : T.accent;
  const msgColor   = dark ? "E8EBF2" : T.text;
  s.addText(title, { x:m, y:top, w:W-m*2, h:0.36, fontSize:18, bold:true, color:titleColor, fontFace:FONT, margin:0 });
  s.addShape(pres.shapes.RECTANGLE, { x:m, y:top+0.44, w:56/PX, h:3/PX, fill:{ color:lineColor }, line:{ type:"none" } });
  if (message)  // メッセージライン: このスライドの結論1行（アクションタイトル）。【要確認】は赤字化
    s.addText(phRuns(message, {}, msgColor), { x:m, y:top+0.52, w:W-m*2, h:0.34, fontSize:12, fontFace:FONT, margin:0 });
}
function pageNo(s, n, total, dark = false) {
  s.addText(`${n} / ${total}`, { x:W-1.2, y:H-0.38, w:0.9, h:0.3, fontSize:9, color:dark ? "C2CCDE" : T.muted, fontFace:FONT, align:"right", margin:0 });
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
// 【要確認: …】プレースホルダを赤字(#CC0000)にする runs 変換。
// text: 文字列（\n可）または行の配列。プレースホルダが無ければ通常色の runs を返す。
const PH_COLOR = "CC0000";
function phRuns(text, base = {}, color = T.text) {
  const lines = Array.isArray(text) ? text : String(text).split("\n");
  const out = [];
  lines.forEach((ln, li) => {
    const parts = String(ln).split(/(【要確認[^】]*】)/).filter(p => p !== "");
    if (!parts.length) parts.push(" ");
    parts.forEach((p, pi) => {
      out.push({ text: p, options: { ...base, color: p.startsWith("【要確認") ? PH_COLOR : color,
        breakLine: pi === parts.length - 1 && li < lines.length - 1 } });
    });
  });
  return out;
}
// 画像素材未確定用のグレープレースホルダ枠（灰面＋破線枠＋中央キャプション）
function grayPlaceholder(s, x, y, w, h, label = "サイトキャプチャ（差し込み予定）", fontSize = 9.5) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill:{ color:"EFEFEF" }, line:{ color:"D8D8D8", width:1, dashType:"dash" } });
  s.addText(label, { x, y, w, h, fontSize, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
}

// ---------- パターン別レンダラ ----------
const R = {
  // 表紙: navy全面地＋左下テキスト集約＋ロゴ（ブランド表紙B準拠）
  "cover-gradient-text-bottom"(s, c) {
    // navy全面地（グラデはpptxでは単色navyで代替）＋右上に一段濃いnavyの装飾円
    s.background = { color: T.accent };
    s.addShape(pres.shapes.OVAL, { x:W-3.0, y:-2.5, w:7.0, h:7.0, fill:{ color:"0F1A33" }, line:{ type:"none" } });
    // ロゴ（白抜き横ロゴ・表紙のみ・座布団なし直置き）
    if (c.logo) s.addImage({ path:c.logo, x:0.55, y:0.55, w:2.6, h:2.6*(c.logoH||0.24) });
    const boxY = H - 2.35;
    if (c.eyebrow) s.addText(c.eyebrow, { x:0.55, y:boxY-0.44, w:8.5, h:0.34, fontSize:13, bold:true, color:"C2CCDE", fontFace:FONT, charSpacing:2, margin:0 });
    s.addText(c.title, { x:0.55, y:boxY, w:9.0, h:1.1, fontSize:30, bold:true, color:"FFFFFF", fontFace:FONT, margin:0 });
    if (c.subtitle) s.addText(c.subtitle, { x:0.55, y:boxY+1.14, w:9.0, h:0.42, fontSize:14, color:"E8EBF2", fontFace:FONT, margin:0 });
    if (c.company) s.addText(c.company, { x:0.55, y:boxY+1.62, w:9.0, h:0.36, fontSize:12, color:"C2CCDE", fontFace:FONT, margin:0 });
  },
  // 目次（ギャラリー実物: ヘッダー＋「番号｜項目名 + 点線リーダー + ページ番号」の横一列）
  // ブランド系デザインシステム: 見出し上の英語キッカー（AGENDA/CONTENTS等）は禁止。
  // c.label に値がある時だけ描画し、既定では出さない（タイトル＋タイトル下ショートバーのみ）。
  "agenda-toc"(s, c) {
    if (c.label) s.addText(c.label, { x:0.7, y:0.5, w:6, h:0.28, fontSize:11, bold:true, color:T.muted, fontFace:FONT, charSpacing:2, margin:0 });
    s.addText(c.title || "目次", { x:0.7, y:0.82, w:7, h:0.5, fontSize:24, bold:true, color:T.text, fontFace:FONT, margin:0 });
    // タイトル下のnavyショートバー（56×3px＝0.44in×0.023in）
    s.addShape(pres.shapes.RECTANGLE, { x:0.7, y:1.38, w:0.44, h:0.03, fill:{ color:T.accent }, line:{ type:"none" } });
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
  // 追加オプション（後方互換）: st.highlight=主役ステップ強調(Primary)／st.dim=グレー階調で沈める／c.note=下部の締め文
  "four-step-flow"(s, c) {
    let y = BODY_Y + 0.15;
    if (c.lead) { s.addText(c.lead, { x:MX+0.25, y, w:W-MX*2-0.5, h:0.4, fontSize:12.5, color:T.text, fontFace:FONT, margin:0 }); y += 0.55; }
    const steps = c.steps || [];
    const arrowW = 0.32, gap = 0.1;
    const cw = (W - MX*2 - (steps.length-1)*(arrowW+gap*2)) / steps.length;
    const badgeD = 0.42;
    const cardTop = y + badgeD/2 + 0.05, cardH = H - cardTop - 0.45 - (c.note ? 0.55 : 0);
    steps.forEach((st, i) => {
      const x = MX + i*(cw+arrowW+gap*2);
      if (st.highlight)
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cardTop, w:cw, h:cardH, rectRadius:0.06, fill:{ color:T.soft }, line:{ color:T.accent, width:1.5 } });
      else if (st.dim)
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cardTop, w:cw, h:cardH, rectRadius:0.06, fill:{ color:"FFFFFF" }, line:{ color:"D8D8D8", width:1 } });
      else
        card(s, x, cardTop, cw, cardH);
      const bFill = st.highlight ? T.accent : (st.dim ? "EFEFEF" : T.soft);
      const bLine = st.dim ? "D8D8D8" : T.accent;
      const bText = st.highlight ? "FFFFFF" : (st.dim ? T.muted : T.text);
      s.addShape(pres.shapes.OVAL, { x:x+cw/2-badgeD/2, y:cardTop-badgeD/2, w:badgeD, h:badgeD, fill:{ color:bFill }, line:{ color:bLine, width:2 } });
      s.addText(String(i+1), { x:x+cw/2-badgeD/2, y:cardTop-badgeD/2, w:badgeD, h:badgeD, fontSize:14, bold:true, color:bText, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(st.title, { x:x+0.15, y:cardTop+0.32, w:cw-0.3, h:0.55, fontSize:13, bold:true, color: st.highlight ? T.accent : (st.dim ? T.muted : T.text), fontFace:FONT, align:"center", valign:"top", margin:0 });
      // dimステップの本文は枠・バッジより一段濃いgray-600（#4D4D4D）で可読性を確保
      s.addText(st.body, { x:x+0.15, y:cardTop+0.92, w:cw-0.3, h:cardH-1.1, fontSize:10.5, color: st.highlight ? T.text : (st.dim ? "4D4D4D" : T.muted), fontFace:FONT, align:"center", margin:0, valign:"top" });
      if (i < steps.length-1)
        s.addText("▶", { x:x+cw+gap, y:cardTop+cardH/2-0.15, w:arrowW, h:0.3, fontSize:14, bold:true, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    });
    if (c.note) s.addText(c.note, { x:MX, y:cardTop+cardH+0.14, w:W-MX*2, h:0.4, fontSize:11.5, color:T.text, fontFace:FONT, align:"center", valign:"middle", margin:0 });
  },
  // 左右2ボックス（ギャラリー実物: 点線枠・プレーン見出し・段落本文・中央に点線円コネクタ）
  // 追加オプション（後方互換）: note に \n を含む場合は帯を2行分に拡張
  "two-column-split-boxes"(s, c) {
    const noteML = !!(c.note && String(c.note).includes("\n"));
    // variant "pale-header": 破線枠でなく実線枠（gray-300）＋Paleヘッダ帯カード。
    // ※破線を「差し込み予定プレースホルダ」の視覚言語に使うデッキ向け（後方互換: 既定は従来の破線枠）
    const pale = c.variant === "pale-header";
    const cy = BODY_Y + 0.3, ch = c.note ? (noteML ? 2.7 : 2.9) : 3.5;
    const connW = 0.55, gap = 0.15, cw = (W-MX*2-connW-gap*2)/2;
    [c.left, c.right].forEach((bx, i) => {
      const x = MX + i*(cw+connW+gap*2);
      if (pale) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cy, w:cw, h:ch, rectRadius:0.05, fill:{ color:"FFFFFF" }, line:{ color:"D8D8D8", width:1 } });
        s.addShape(pres.shapes.RECTANGLE, { x:x+0.14, y:cy+0.14, w:cw-0.28, h:0.48, fill:{ color:T.soft }, line:{ type:"none" } });
        s.addText(bx.title, { x:x+0.34, y:cy+0.14, w:cw-0.68, h:0.48, fontSize:15, bold:true, color:T.accent, fontFace:FONT, valign:"middle", margin:0 });
      } else {
        s.addShape(pres.shapes.RECTANGLE, { x, y:cy, w:cw, h:ch, fill:{ color:T.surface }, line:{ color:T.accent, width:1, dashType:"dash" } });
        s.addText(bx.title, { x:x+0.32, y:cy+0.28, w:cw-0.64, h:0.4, fontSize:16, bold:true, color:T.text, fontFace:FONT, margin:0 });
      }
      const body = Array.isArray(bx.items) ? bx.items.join("\n") : (bx.body || (bx.items||[]).join("\n"));
      s.addText(body, { x:x+0.32, y:cy+(pale?0.78:0.85), w:cw-0.64, h:ch-(pale?1.0:1.1), fontSize:12, color:T.text, fontFace:FONT, margin:0, valign:"top", lineSpacingMultiple:1.5 });
    });
    const ccx = MX+cw+gap+connW/2, ccy = cy+ch/2, cd = 0.5;
    s.addShape(pres.shapes.OVAL, { x:ccx-cd/2, y:ccy-cd/2, w:cd, h:cd, fill:{ color:T.soft },
      line: pale ? { color:T.accent, width:1 } : { color:T.accent, width:1, dashType:"dash" } });
    s.addText("→", { x:ccx-cd/2, y:ccy-cd/2, w:cd, h:cd, fontSize:16, color: pale ? T.accent : T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    if (c.note) {
      const nh = noteML ? 0.8 : 0.55;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX, y:cy+ch+0.2, w:W-MX*2, h:nh, rectRadius:0.05, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(c.note, { x:MX+0.25, y:cy+ch+0.2, w:W-MX*2-0.5, h:nh, fontSize:11, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
    }
  },
  // 3ポイントまとめ（ギャラリー実物: 縦積みチェックリスト。枠アイコン+見出し+本文、行区切り線）
  // 結び用の全面navyバリアント: content.navy:true で背景navy＋白抜き文字（ブランド§5-17）。
  // navy時は白のチェック枠＋白✓・白見出し・白本文・区切り線は白（薄透過相当のnavy-soft）。
  "summary-three-points"(s, c) {
    const navy = !!c.navy;
    if (navy) s.background = { color: T.accent };
    const headColor = navy ? "FFFFFF" : T.text;
    const bodyColor  = navy ? "E8EBF2" : T.text;
    const iconLine   = navy ? "FFFFFF" : T.accent;
    const iconCheck  = navy ? "FFFFFF" : T.accent;
    const divColor   = navy ? "C2CCDE" : T.soft;
    const pts = c.points || [];
    let y = BODY_Y + 0.3;
    const rowH = Math.min(1.1, (H-0.4-y)/pts.length);
    y += Math.max(0, (H-0.4-y-rowH*pts.length)/2);
    const iconD = 0.32;
    pts.forEach((p, i) => {
      s.addShape(pres.shapes.RECTANGLE, { x:MX+0.2, y:y+0.08, w:iconD, h:iconD, fill:{ type:"none" }, line:{ color:iconLine, width:2 } });
      s.addText("✓", { x:MX+0.2, y:y+0.08, w:iconD, h:iconD, fontSize:13, bold:true, color:iconCheck, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(p.title, { x:MX+0.9, y, w:W-MX*2-1.1, h:0.4, fontSize:15, bold:true, color:headColor, fontFace:FONT, margin:0 });
      s.addText(p.body, { x:MX+0.9, y:y+0.4, w:W-MX*2-1.1, h:rowH-0.5, fontSize:12.5, color:bodyColor, fontFace:FONT, margin:0, valign:"top" });
      if (i < pts.length-1)
        s.addShape(pres.shapes.LINE, { x:MX, y:y+rowH-0.08, w:W-MX*2, h:0, line:{ color:divColor, width:1 } });
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
  // 料金3プランカード（中央を推し・推しに🏆gold・行ラベル無し方式）
  "pricing-plan-cards"(s, c) {
    const plans = c.plans || [];
    const gap = 0.28, cw = (W-MX*2-gap*(plans.length-1))/plans.length;
    const cy = BODY_Y + 0.34, ch = 3.55;
    const goldHex = c.goldHex || "FED307";
    plans.forEach((p, i) => {
      const x = MX + i*(cw+gap);
      const rec = !!p.recommended;
      // 推しカードは navy地＋白文字、他は白地＋枠線
      const cardTop = rec ? cy-0.16 : cy;
      const cardH = rec ? ch+0.32 : ch;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cardTop, w:cw, h:cardH, rectRadius:0.06,
        fill:{ color: rec ? T.accent : "FFFFFF" }, line:{ color: rec ? T.accent : "D8D8D8", width: rec?0:1 } });
      const fg = rec ? "FFFFFF" : T.text, sub = rec ? "E8EBF2" : T.muted;
      let yy = cardTop + 0.24;
      // 推しバッジ（🏆 gold・デッキ唯一のgold使用箇所）
      if (rec) {
        s.addText("🏆 おすすめ", { x:x+0.15, y:yy, w:cw-0.3, h:0.32, fontSize:12, bold:true, color:goldHex, fontFace:FONT, align:"center", margin:0 });
        yy += 0.36;
      }
      s.addText(p.name, { x:x+0.15, y:yy, w:cw-0.3, h:0.38, fontSize:16, bold:true, color:fg, fontFace:FONT, align:"center", margin:0 });
      yy += 0.44;
      s.addText([{ text:p.price, options:{ fontSize:30, bold:true, color:fg } },
                 { text:p.unit ? ` ${p.unit}` : "", options:{ fontSize:12, color:sub } }],
        { x:x+0.1, y:yy, w:cw-0.2, h:0.6, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      yy += 0.68;
      if (p.tagline) { s.addText(p.tagline, { x:x+0.2, y:yy, w:cw-0.4, h:0.6, fontSize:10.5, color:sub, fontFace:FONT, align:"center", valign:"top", margin:0 }); yy += 0.66; }
      s.addShape(pres.shapes.LINE, { x:x+cw/2-0.25, y:yy, w:0.5, h:0, line:{ color: rec?"FFFFFF":T.soft, width:1 } });
      yy += 0.14;
      const feats = p.features || [];
      s.addText(feats.map(t=>({ text:t, options:{ color:fg, breakLine:true } })),
        { x:x+0.22, y:yy, w:cw-0.44, h:cardTop+cardH-yy-0.15, fontSize:10.5, fontFace:FONT, align:"center", margin:0, paraSpaceAfter:4, valign:"top" });
    });
    if (c.note) s.addText(c.note, { x:MX, y:cy+ch+0.24, w:W-MX*2, h:0.35, fontSize:10.5, color:T.muted, fontFace:FONT, align:"center", margin:0 });
  },
  // 見積サマリー（上部に内訳3〜4行・縦罫1本区切り／下部に合計特大数字）
  "price-total-highlight"(s, c) {
    const rows = c.breakdown || [];
    let y = BODY_Y + 0.28;
    const rowH = 0.56;
    rows.forEach((r, i) => {
      s.addText(r.item, { x:MX+0.2, y, w:2.5, h:rowH, fontSize:14, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addShape(pres.shapes.LINE, { x:MX+2.85, y:y+0.1, w:0, h:rowH-0.2, line:{ color:"D8D8D8", width:1 } });
      s.addText(r.desc, { x:MX+3.05, y, w:W-MX*2-3.05-2.0, h:rowH, fontSize:12, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addText(r.price, { x:W-MX-2.0, y, w:2.0, h:rowH, fontSize:15, bold:true, color:T.text, fontFace:FONT, align:"right", valign:"middle", margin:0 });
      if (i < rows.length-1)
        s.addShape(pres.shapes.LINE, { x:MX, y:y+rowH, w:W-MX*2, h:0, line:{ color:"EFEFEF", width:1 } });
      y += rowH;
    });
    // 合計バンド
    const bandY = y + 0.18;
    s.addShape(pres.shapes.LINE, { x:MX, y:bandY-0.06, w:W-MX*2, h:0, line:{ color:"D8D8D8", width:1.5 } });
    s.addText(c.totalLabel || "初期費用", { x:MX+0.2, y:bandY+0.2, w:2.6, h:0.55, fontSize:16, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
    s.addText([{ text:c.totalAmount, options:{ fontSize:46, bold:true, color:T.accent } },
               { text:c.totalUnit ? ` ${c.totalUnit}` : "", options:{ fontSize:16, color:T.muted } }],
      { x:MX+2.5, y:bandY+0.08, w:W-MX*2-2.5, h:0.8, fontFace:FONT, align:"right", valign:"middle", margin:0 });
    if (c.taxNote) s.addText(c.taxNote, { x:MX, y:bandY+0.86, w:W-MX*2, h:0.3, fontSize:10.5, color:T.muted, fontFace:FONT, align:"right", margin:0 });
    if (c.subNotes) s.addText((c.subNotes||[]).map(t=>({ text:t, options:{ color:T.muted, breakLine:true } })),
      { x:MX+0.2, y:bandY+1.16, w:W-MX*2-0.4-1.0, h:0.7, fontSize:9.5, fontFace:FONT, margin:0, paraSpaceAfter:2, valign:"top" });
  },
  // 4カード 2x2グリッド（番号バッジ＋見出し＋本文。カードは白面＋navy枠・角丸）
  "four-card-2x2"(s, c) {
    const cards = (c.cards || []).slice(0, 4);
    const gap = 0.3;
    const cw = (W - MX*2 - gap) / 2;
    const availH = H - BODY_Y - 0.45 - (c.note ? 0.55 : 0);
    const ch = (availH - gap) / 2;
    const cy0 = BODY_Y + 0.2;
    // 後方互換拡張: カード数が奇数（例: 3枚）のとき、最終カードを2列目中央に配置して空き枠の不均衡を防ぐ
    const oddLast = cards.length % 2 === 1 ? cards.length - 1 : -1;
    cards.forEach((cd, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = i === oddLast ? MX + (W - MX*2 - cw)/2 : MX + col*(cw+gap);
      const y = cy0 + row*(ch+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:cw, h:ch, rectRadius:0.06,
        fill:{ color:T.surface }, line:{ color:T.accent, width:1 } });
      const badgeD = 0.4;
      s.addShape(pres.shapes.OVAL, { x:x+0.28, y:y+0.26, w:badgeD, h:badgeD, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(String(i+1).padStart(2,"0"), { x:x+0.28, y:y+0.26, w:badgeD, h:badgeD, fontSize:12, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(cd.title, { x:x+0.82, y:y+0.24, w:cw-1.0, h:0.44, fontSize:15, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addText(cd.body, { x:x+0.3, y:y+0.8, w:cw-0.6, h:ch-0.95, fontSize:12, color:T.text, fontFace:FONT, margin:0, valign:"top", lineSpacingMultiple:1.4 });
    });
    if (c.note) s.addText(c.note, { x:MX, y:cy0+2*ch+gap+0.14, w:W-MX*2, h:0.42, fontSize:11.5, color:T.muted, fontFace:FONT, align:"center", margin:0 });
  },
  // 6カード 2列×3行（番号＋見出し＋本文。白面＋navy枠・角丸）
  "six-card-two-column"(s, c) {
    const cards = (c.cards || []).slice(0, 6);
    const gapX = 0.3, gapY = 0.24;
    const cw = (W - MX*2 - gapX) / 2;
    const availH = H - BODY_Y - 0.45 - (c.note ? 0.5 : 0);
    const ch = (availH - gapY*2) / 3;
    const cy0 = BODY_Y + 0.18;
    cards.forEach((cd, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = MX + col*(cw+gapX);
      const y = cy0 + row*(ch+gapY);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:cw, h:ch, rectRadius:0.05,
        fill:{ color:T.surface }, line:{ color:T.accent, width:1 } });
      const badgeD = 0.34;
      s.addShape(pres.shapes.OVAL, { x:x+0.24, y:y+ch/2-badgeD/2, w:badgeD, h:badgeD, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(String(i+1), { x:x+0.24, y:y+ch/2-badgeD/2, w:badgeD, h:badgeD, fontSize:12, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(cd.title, { x:x+0.72, y:y+0.16, w:cw-0.92, h:0.36, fontSize:14, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      s.addText(cd.body, { x:x+0.72, y:y+0.5, w:cw-0.92, h:ch-0.62, fontSize:11, color:T.text, fontFace:FONT, margin:0, valign:"top", lineSpacingMultiple:1.35 });
    });
    if (c.note) s.addText(c.note, { x:MX, y:cy0+3*ch+gapY*2+0.1, w:W-MX*2, h:0.4, fontSize:11, color:T.muted, fontFace:FONT, align:"center", margin:0 });
  },
  // 横タイムライン＋カード（上部に点線＋ドット、下に等幅カード：STEPラベル・見出し・箇条書き）
  "horizontal-timeline-cards"(s, c) {
    const cards = (c.cards || c.steps || []);
    const n = cards.length;
    let y = BODY_Y + 0.2;
    if (c.lead) { s.addText(c.lead, { x:MX+0.2, y, w:W-MX*2-0.4, h:0.4, fontSize:12.5, color:T.text, fontFace:FONT, margin:0 }); y += 0.5; }
    const gap = 0.3, cw = (W - MX*2 - gap*(n-1)) / n;
    // タイムライン点線＋ドット
    const lineY = y + 0.12;
    s.addShape(pres.shapes.LINE, { x:MX+cw/2, y:lineY, w:(W-MX*2)-cw, h:0, line:{ color:T.muted, width:1, dashType:"sysDot" } });
    const cardTop = lineY + 0.28, cardH = H - cardTop - 0.45 - (c.note ? 0.42 : 0);
    cards.forEach((cd, i) => {
      const x = MX + i*(cw+gap);
      const dotD = 0.16;
      s.addShape(pres.shapes.OVAL, { x:x+cw/2-dotD/2, y:lineY-dotD/2, w:dotD, h:dotD, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cardTop, w:cw, h:cardH, rectRadius:0.05,
        fill:{ color:T.surface }, line:{ color:T.accent, width:1 } });
      s.addText(cd.step || `STEP ${String(i+1).padStart(2,"0")}`, { x:x+0.2, y:cardTop+0.2, w:cw-0.4, h:0.3, fontSize:11, bold:true, color:T.accent, fontFace:FONT, margin:0 });
      s.addText(cd.title, { x:x+0.2, y:cardTop+0.5, w:cw-0.4, h:0.55, fontSize:c.titleSize||14.5, bold:true, color:T.text, fontFace:FONT, valign:"top", margin:0 });
      s.addShape(pres.shapes.LINE, { x:x+0.2, y:cardTop+1.08, w:cw-0.4, h:0, line:{ color:T.soft, width:1 } });
      // body: 配列＝箇条書き／文字列＝段落（後方互換: 既存デッキは配列利用のみ）
      if (Array.isArray(cd.body)) {
        s.addText(cd.body.map(t=>({ text:t, options:{ bullet:{ characterCode:"25AA", indent:10 }, color:T.text, breakLine:true } })),
          { x:x+0.24, y:cardTop+1.2, w:cw-0.48, h:cardH-1.35, fontSize:c.bodySize||11, fontFace:FONT, margin:0, paraSpaceAfter:5, valign:"top" });
      } else {
        s.addText(cd.body, { x:x+0.24, y:cardTop+1.2, w:cw-0.48, h:cardH-1.35, fontSize:c.bodySize||11, color:T.text, fontFace:FONT, margin:0, valign:"top", lineSpacingMultiple:1.25 });
      }
    });
    // 注記（モデルケース等の免責。目立たせるため太字センター）
    if (c.note) s.addText(c.note, { x:MX, y:cardTop+cardH+0.1, w:W-MX*2, h:0.34, fontSize:10.5, bold:true, color:T.text, fontFace:FONT, align:"center", valign:"middle", margin:0 });
  },
  // ========== NOLシリーズ紹介資料用レンダラ（nol-series トンマナ・2026-07追加） ==========
  // 表紙（NOLライン版）: Primary全面地＋deep装飾円＋左下にコピー/テキストロゴ/会社名。
  // NOLラインロゴ未制作のため serviceName をテキストロゴ（Noto Sans JP Black 指定可）で代用。
  "cover-nol-text-logo"(s, c) {
    s.background = { color: T.accent };
    s.addShape(pres.shapes.OVAL, { x:W-3.0, y:-2.5, w:7.0, h:7.0, fill:{ color: c.deep || "0F1A33" }, line:{ type:"none" } });
    if (c.logo) s.addImage({ path:c.logo, x:0.55, y:0.5, w:1.7, h:1.7*(c.logoRatio||0.32) });
    const pale = c.paleText || "D6E2F8";
    const boxY = H - 2.8;
    if (c.eyebrow) s.addText(c.eyebrow, { x:0.55, y:boxY-0.42, w:8.8, h:0.32, fontSize:12.5, bold:true, color:pale, fontFace:FONT, charSpacing:2, margin:0 });
    s.addText(c.title, { x:0.55, y:boxY, w:9.0, h:1.05, fontSize:29, bold:true, color:"FFFFFF", fontFace:FONT, margin:0 });
    s.addText([
      { text: c.serviceName || "", options:{ fontSize:38, bold:true, color:"FFFFFF", fontFace: c.logoFont || FONT } },
      { text: c.serviceReading ? `（${c.serviceReading}）` : "", options:{ fontSize:15, color:pale, fontFace:FONT } }
    ], { x:0.55, y:boxY+1.14, w:9.0, h:0.68, valign:"middle", margin:0 });
    const meta = [c.company, c.date].filter(Boolean).join("　｜　");
    if (meta) s.addText(meta, { x:0.55, y:boxY+1.98, w:9.0, h:0.34, fontSize:12, color:pale, fontFace:FONT, margin:0 });
  },
  // 章扉（NOLライン版）: Primary全面地＋白文字＋右下deep装飾円（コーン式章扉）
  "section-divider-accent"(s, c) {
    s.background = { color: T.accent };
    s.addShape(pres.shapes.OVAL, { x:W-2.4, y:H-2.4, w:4.8, h:4.8, fill:{ color: c.deep || T.accent }, line:{ type:"none" } });
    const cx = 0.85, cy = H/2 - 0.75;
    s.addShape(pres.shapes.RECTANGLE, { x:cx, y:cy+0.05, w:0.035, h:1.45, fill:{ color:"FFFFFF" }, line:{ type:"none" } });
    s.addText(c.no || "", { x:cx+0.45, y:cy-0.18, w:5, h:0.75, fontSize:40, bold:true, color:T.soft, fontFace:FONT, margin:0 });
    s.addText(c.title, { x:cx+0.45, y:cy+0.58, w:8.2, h:0.55, fontSize:26, bold:true, color:"FFFFFF", fontFace:FONT, margin:0 });
    if (c.subtitle) s.addText(c.subtitle, { x:cx+0.45, y:cy+1.18, w:8.0, h:0.4, fontSize:13, color:T.soft, fontFace:FONT, margin:0 });
  },
  // 会社概要キーバリュー表: 左にラベル箱（Pale）＋値、下部に補足帯。値の【要確認】は赤字
  "key-value-rows"(s, c) {
    const rows = c.rows || [];
    let y = BODY_Y + 0.15;
    for (const r of rows) {
      const vLines = Array.isArray(r.v) ? r.v : String(r.v).split("\n");
      const rowH = 0.24 + vLines.length * 0.26;
      s.addShape(pres.shapes.RECTANGLE, { x:MX+0.1, y:y+0.03, w:1.35, h:0.32, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(r.k, { x:MX+0.1, y:y+0.03, w:1.35, h:0.32, fontSize:11, bold:true, color:T.text, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(phRuns(vLines, { fontSize:11.5 }), { x:MX+1.75, y:y+0.01, w:W-MX*2-1.95, h:rowH-0.06, fontSize:11.5, fontFace:FONT, valign:"top", margin:0, lineSpacingMultiple:1.25 });
      y += rowH;
      if (rows.indexOf(r) < rows.length-1)
        s.addShape(pres.shapes.LINE, { x:MX, y:y-0.02, w:W-MX*2, h:0, line:{ color:"EFEFEF", width:1 } });
    }
    if (c.note) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX, y:y+0.16, w:W-MX*2, h:0.62, rectRadius:0.05, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(c.note, { x:MX+0.25, y:y+0.16, w:W-MX*2-0.5, h:0.62, fontSize:11.5, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
    }
  },
  // サービスラインのカード横一列（NOLシリーズ俯瞰）: 主役カードのみPrimary強調＋バッジピル
  "service-card-row"(s, c) {
    let y = BODY_Y + 0.12;
    if (c.lead) { s.addText(c.lead, { x:MX+0.1, y, w:W-MX*2-0.2, h:0.55, fontSize:12.5, color:T.text, fontFace:FONT, margin:0 }); y += 0.66; }
    const cards = c.cards || [];
    const gap = 0.25, cw = (W-MX*2-gap*(cards.length-1))/cards.length, ch = 1.95;
    cards.forEach((cd, i) => {
      const x = MX + i*(cw+gap);
      const hl = !!cd.highlight;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:cw, h:ch, rectRadius:0.06,
        fill:{ color: hl ? T.soft : "FFFFFF" }, line:{ color: hl ? T.accent : "D8D8D8", width: hl ? 1.5 : 1 } });
      if (cd.badge) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:x+cw/2-0.5, y:y-0.14, w:1.0, h:0.3, rectRadius:0.15, fill:{ color:T.accent }, line:{ type:"none" } });
        s.addText(cd.badge, { x:x+cw/2-0.5, y:y-0.14, w:1.0, h:0.3, fontSize:10, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      }
      s.addText(cd.title, { x:x+0.08, y:y+0.32, w:cw-0.16, h:0.4, fontSize:15.5, bold:true, color: hl ? T.accent : T.text, fontFace:FONT, align:"center", margin:0 });
      s.addShape(pres.shapes.LINE, { x:x+cw/2-0.2, y:y+0.82, w:0.4, h:0, line:{ color: hl ? T.accent : "D8D8D8", width:1.5 } });
      s.addText(cd.body, { x:x+0.15, y:y+0.96, w:cw-0.3, h:ch-1.1, fontSize:10.5, color:T.text, fontFace:FONT, align:"center", valign:"top", margin:0 });
    });
    if (c.note) s.addText(c.note, { x:MX+0.1, y:y+ch+0.28, w:W-MX*2-0.2, h:0.7, fontSize:12, color:T.text, fontFace:FONT, valign:"top", margin:0, lineSpacingMultiple:1.35 });
  },
  // 参考サイト3カード（キャプチャ差し込み前提のグレープレースホルダ＋URL大きめ＋業種ラベル）
  "site-preview-cards"(s, c) {
    let y = BODY_Y + 0.08;
    if (c.lead) { s.addText(c.lead, { x:MX+0.1, y, w:W-MX*2-0.2, h:0.72, fontSize:11.5, color:T.text, fontFace:FONT, margin:0, lineSpacingMultiple:1.3 }); y += 0.86; }
    const sites = c.sites || [];
    const gap = 0.3, cw = (W-MX*2-gap*(sites.length-1))/sites.length, ch = 2.6;
    sites.forEach((st, i) => {
      const x = MX + i*(cw+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:cw, h:ch, rectRadius:0.05, fill:{ color:"FFFFFF" }, line:{ color:"D8D8D8", width:1 } });
      grayPlaceholder(s, x+0.15, y+0.15, cw-0.3, 1.4);
      s.addText(st.url, { x:x+0.1, y:y+1.62, w:cw-0.2, h:0.42, fontSize:17, bold:true, color:T.accent, fontFace:FONT, align:"center", margin:0 });
      s.addText(phRuns(st.label, { fontSize:9 }, T.muted), { x:x+0.12, y:y+2.04, w:cw-0.24, h:0.48, fontSize:9, fontFace:FONT, align:"center", valign:"top", margin:0 });
    });
    if (c.note) s.addText(c.note, { x:MX, y:y+ch+0.14, w:W-MX*2, h:0.34, fontSize:10.5, color:T.muted, fontFace:FONT, align:"center", margin:0 });
  },
  // 番号バッジ＋段落本文の3カード（実績・信頼要素）。本文の【要確認】は赤字
  // 見出しはバッジの下にカード全幅で配置（長い見出しの1文字孤立を防ぐ）
  "numbered-text-cards"(s, c) {
    const cards = c.cards || [];
    const gap = 0.3, cw = (W-MX*2-gap*(cards.length-1))/cards.length, ch = 3.5;
    const cy = BODY_Y + (H - BODY_Y - 0.45 - ch) / 2;
    cards.forEach((cd, i) => {
      const x = MX + i*(cw+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cy, w:cw, h:ch, rectRadius:0.06, fill:{ color:"FFFFFF" }, line:{ color:"D8D8D8", width:1 } });
      const bd = 0.42;
      s.addShape(pres.shapes.OVAL, { x:x+0.24, y:cy+0.22, w:bd, h:bd, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(String(i+1).padStart(2,"0"), { x:x+0.24, y:cy+0.22, w:bd, h:bd, fontSize:12, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(cd.title, { x:x+0.24, y:cy+0.76, w:cw-0.48, h:0.62, fontSize:12.5, bold:true, color:T.text, fontFace:FONT, valign:"top", margin:0 });
      s.addShape(pres.shapes.LINE, { x:x+0.24, y:cy+1.44, w:cw-0.48, h:0, line:{ color:T.soft, width:1.5 } });
      s.addText(phRuns(cd.body, { fontSize:10.5 }), { x:x+0.26, y:cy+1.56, w:cw-0.52, h:ch-1.76, fontSize:10.5, fontFace:FONT, valign:"top", margin:0, lineSpacingMultiple:1.35 });
    });
  },
  // ラベル帯付き3カード（課題→解決の対応ページ）: variant "gray"=課題側グレー基調／"accent"=解決側Paleヘッダ
  "labeled-card-trio"(s, c) {
    const cards = c.cards || [];
    const acc = c.variant === "accent";
    const gap = 0.3, cw = (W-MX*2-gap*(cards.length-1))/cards.length, ch = 3.4;
    const cy = BODY_Y + (H - BODY_Y - 0.45 - ch) / 2;
    cards.forEach((cd, i) => {
      const x = MX + i*(cw+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y:cy, w:cw, h:ch, rectRadius:0.05,
        fill:{ color: acc ? "FFFFFF" : "EFEFEF" }, line:{ color:"D8D8D8", width:1 } });
      s.addShape(pres.shapes.RECTANGLE, { x:x+0.14, y:cy+0.14, w:cw-0.28, h:0.36, fill:{ color: acc ? T.soft : "DEDEDE" }, line:{ type:"none" } });
      s.addText(cd.label, { x:x+0.14, y:cy+0.14, w:cw-0.28, h:0.36, fontSize:10.5, bold:true, color: acc ? T.accent : "5A5A5A", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(cd.title, { x:x+0.12, y:cy+0.6, w:cw-0.24, h:0.4, fontSize:14, bold:true, color: acc ? T.accent : T.text, fontFace:FONT, align:"center", margin:0 });
      s.addShape(pres.shapes.LINE, { x:x+cw/2-0.2, y:cy+1.06, w:0.4, h:0, line:{ color: acc ? T.accent : "B8B8B8", width:1.5 } });
      if (Array.isArray(cd.body)) {
        s.addText(cd.body.map(t=>({ text:t, options:{ bullet:{ characterCode:"25AA", indent:10 }, color:T.text, breakLine:true } })),
          { x:x+0.28, y:cy+1.22, w:cw-0.56, h:ch-1.45, fontSize:11, fontFace:FONT, margin:0, paraSpaceAfter:7, valign:"top" });
      } else {
        s.addText(cd.body, { x:x+0.28, y:cy+1.22, w:cw-0.56, h:ch-1.45, fontSize:10.5, color:T.text, fontFace:FONT, margin:0, valign:"top", lineSpacingMultiple:1.35 });
      }
    });
  },
  // 料金ページ（初期費用バンド＋3列プラン比較表＋注記）: Primaryヘッダ白字・ゼブラ・推し列Pale＋おすすめピル
  "pricing-table-initial"(s, c) {
    const init = c.initial || {};
    const bandY = BODY_Y + 0.02, bandH = 0.72;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX, y:bandY, w:W-MX*2, h:bandH, rectRadius:0.05, fill:{ color:T.soft }, line:{ type:"none" } });
    // ラベルは「初期費用」＋「（全プラン共通）」の意図した2段組（自動折返しの不格好さ回避）
    const initLabel = String(init.label || "").match(/^(.*?)(（.*）)?$/);
    s.addText([{ text:initLabel[1], options:{ fontSize:13.5, bold:true, color:T.text, breakLine:true } },
               { text:initLabel[2] || "", options:{ fontSize:9.5, bold:true, color:T.text } }],
      { x:MX+0.22, y:bandY, w:2.0, h:bandH, fontFace:FONT, valign:"middle", margin:0 });
    s.addText([{ text:init.amount, options:{ fontSize:26, bold:true, color:T.accent } },
               { text:init.unit ? ` ${init.unit}` : "", options:{ fontSize:11, color:T.muted } }],
      { x:MX+2.25, y:bandY, w:2.2, h:bandH, fontFace:FONT, valign:"middle", margin:0 });
    s.addText([{ text:init.desc, options:{ fontSize:11, bold:true, color:T.text, breakLine:true } },
               { text:init.sub || "", options:{ fontSize:8.5, color:T.muted } }],
      { x:MX+4.55, y:bandY+0.05, w:W-MX*2-4.75, h:bandH-0.1, fontFace:FONT, valign:"middle", margin:0, paraSpaceAfter:2 });
    // ---- プラン比較表 ----
    const plans = c.plans || [];                       // [{name, recommended?}]
    const rows = c.rows || [];                         // [{label, cells:[...], big?, tall?}]
    const tY = bandY + bandH + 0.18;
    const labW = 1.8, colW = (W-MX*2-labW)/plans.length;
    const headH = 0.4;
    const rowHs = rows.map(r => r.tall ? 0.52 : (r.big ? 0.42 : 0.3));
    const bodyH = rowHs.reduce((a,b)=>a+b, 0);
    const recI = plans.findIndex(p => p.recommended);
    // ゼブラ（白/gray-150・全幅）→ 推し列Pale上塗り → 罫線 → ヘッダ → テキスト
    let ry = tY + headH;
    rows.forEach((r, i) => {
      if (i % 2 === 1) s.addShape(pres.shapes.RECTANGLE, { x:MX, y:ry, w:W-MX*2, h:rowHs[i], fill:{ color:"EFEFEF" }, line:{ type:"none" } });
      ry += rowHs[i];
    });
    if (recI >= 0) s.addShape(pres.shapes.RECTANGLE, { x:MX+labW+colW*recI, y:tY+headH, w:colW, h:bodyH, fill:{ color:T.soft }, line:{ type:"none" } });
    ry = tY + headH;
    rows.forEach((r, i) => { ry += rowHs[i];
      s.addShape(pres.shapes.LINE, { x:MX, y:ry, w:W-MX*2, h:0, line:{ color:"D8D8D8", width: i === rows.length-1 ? 1.25 : 0.75 } }); });
    // ヘッダ（Primary地・白字。左端ラベルセルは表キャプション）
    s.addShape(pres.shapes.RECTANGLE, { x:MX+labW, y:tY, w:colW*plans.length, h:headH, fill:{ color:T.accent }, line:{ type:"none" } });
    if (c.tableCaption) s.addText(c.tableCaption, { x:MX+0.05, y:tY, w:labW-0.1, h:headH, fontSize:9, color:T.muted, fontFace:FONT, valign:"middle", margin:0 });
    plans.forEach((p, i) => {
      const x = MX + labW + colW*i;
      const rec = !!p.recommended;
      s.addText(p.name, { x:x+0.05, y:tY, w:rec ? colW-1.0 : colW-0.1, h:headH, fontSize:12.5, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      if (rec) { // おすすめピル（白地＋Primary文字。gold不使用）
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:x+colW-0.92, y:tY+0.07, w:0.82, h:0.26, rectRadius:0.13, fill:{ color:"FFFFFF" }, line:{ type:"none" } });
        s.addText("おすすめ", { x:x+colW-0.92, y:tY+0.07, w:0.82, h:0.26, fontSize:9.5, bold:true, color:T.accent, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      }
    });
    // 行ラベル＋セル
    ry = tY + headH;
    rows.forEach((r, i) => {
      const rh = rowHs[i];
      s.addText(r.label, { x:MX+0.12, y:ry, w:labW-0.2, h:rh, fontSize:10, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      (r.cells || []).forEach((cell, j) => {
        const x = MX + labW + colW*j;
        const rec = j === recI;
        const fs = r.big ? 15 : (r.tall ? 9 : 10);
        s.addText(cell, { x:x+0.08, y:ry, w:colW-0.16, h:rh, fontSize:fs, bold: !!r.big,
          color: r.big && rec ? T.accent : (cell === "—" ? T.muted : T.text), fontFace:FONT, align:"center", valign:"middle", margin:0 });
      });
      ry += rh;
    });
    // 注記（共通条件）
    if (c.notes) s.addText((c.notes||[]).map(t=>({ text:"・"+t, options:{ color:T.text, breakLine:true } })),
      { x:MX+0.05, y:ry+0.1, w:W-MX*2-1.0, h:H-(ry+0.1)-0.28, fontSize:8.7, fontFace:FONT, margin:0, paraSpaceAfter:1.5, valign:"top" });
  },
  // 修正依頼フロー＋月次サイクル（公開後の運用ページ）
  "request-cycle-flow"(s, c) {
    let y = BODY_Y + 0.08;
    s.addText(c.flowLabel, { x:MX+0.05, y, w:W-MX*2, h:0.3, fontSize:12.5, bold:true, color:T.accent, fontFace:FONT, margin:0 });
    y += 0.38;
    const flow = c.flow || [];
    const arrowW = 0.3, gap = 0.08;
    const fw = (W-MX*2-(flow.length-1)*(arrowW+gap*2))/flow.length, fh = 1.0;
    flow.forEach((t, i) => {
      const x = MX + i*(fw+arrowW+gap*2);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:fw, h:fh, rectRadius:0.05, fill:{ color:"FFFFFF" }, line:{ color:"D8D8D8", width:1 } });
      const bd = 0.34;
      s.addShape(pres.shapes.OVAL, { x:x+0.14, y:y+fh/2-bd/2, w:bd, h:bd, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText(String(i+1), { x:x+0.14, y:y+fh/2-bd/2, w:bd, h:bd, fontSize:12, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(t, { x:x+0.58, y:y+0.08, w:fw-0.72, h:fh-0.16, fontSize:10.5, color:T.text, fontFace:FONT, valign:"middle", margin:0, lineSpacingMultiple:1.2 });
      if (i < flow.length-1)
        s.addText("▶", { x:x+fw+gap, y:y+fh/2-0.15, w:arrowW, h:0.3, fontSize:13, bold:true, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    });
    y += fh + 0.24;
    s.addText(c.cycleLabel, { x:MX+0.05, y, w:W-MX*2, h:0.3, fontSize:12.5, bold:true, color:T.accent, fontFace:FONT, margin:0 });
    y += 0.38;
    const cyc = c.cycle || [];
    const cw2 = (W-MX*2-0.3)/cyc.length, ch2 = 0.95;
    cyc.forEach((it, i) => {
      const x = MX + i*(cw2+0.3);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:cw2, h:ch2, rectRadius:0.05, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(it.title, { x:x+0.24, y:y+0.12, w:cw2-0.48, h:0.32, fontSize:12.5, bold:true, color:T.text, fontFace:FONT, margin:0 });
      s.addText(it.body, { x:x+0.24, y:y+0.46, w:cw2-0.48, h:ch2-0.56, fontSize:10.5, color:T.text, fontFace:FONT, valign:"top", margin:0 });
    });
    y += ch2 + 0.18;
    if (c.note) s.addText(c.note, { x:MX+0.05, y, w:W-MX*2, h:0.36, fontSize:10.5, color:T.muted, fontFace:FONT, margin:0 });
  },
  // 参考サイト詳細（PC/スマホモックアップ枠＋URL・種別・見どころ＋QR枠）。値の【要確認】は赤字
  "site-detail-mockup"(s, c) {
    const my = BODY_Y + 0.12;
    // PCブラウザモックアップ（gray-300枠＋上部バー）
    const pw = 4.5, ph = 2.85;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX, y:my, w:pw, h:ph, rectRadius:0.04, fill:{ color:"FFFFFF" }, line:{ color:"D8D8D8", width:1.25 } });
    s.addShape(pres.shapes.RECTANGLE, { x:MX+0.02, y:my+0.02, w:pw-0.04, h:0.26, fill:{ color:"EFEFEF" }, line:{ type:"none" } });
    [0,1,2].forEach(i => s.addShape(pres.shapes.OVAL, { x:MX+0.12+i*0.16, y:my+0.1, w:0.1, h:0.1, fill:{ color:"D8D8D8" }, line:{ type:"none" } }));
    grayPlaceholder(s, MX+0.12, my+0.38, pw-0.24, ph-0.5);
    // スマホモックアップ（PC枠の右下に重ねる）
    const sw = 1.0, sh = 1.95, sx = MX+pw-0.55, sy = my+ph-sh+0.35;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:sx, y:sy, w:sw, h:sh, rectRadius:0.08, fill:{ color:"FFFFFF" }, line:{ color:"B8B8B8", width:1.25 } });
    grayPlaceholder(s, sx+0.08, sy+0.14, sw-0.16, sh-0.28, "スマホ表示（差し込み予定）", 7);
    // 右カラム: URL＋キーバリュー＋QR枠
    const rx = MX+pw+0.55, rw = W-MX-rx;
    s.addText(c.url, { x:rx, y:my+0.02, w:rw, h:0.42, fontSize:20, bold:true, color:T.accent, fontFace:FONT, margin:0 });
    if (c.urlNote) s.addText(c.urlNote, { x:rx, y:my+0.46, w:rw, h:0.28, fontSize:9.5, color:T.muted, fontFace:FONT, margin:0 });
    let y = my + 0.86;
    for (const r of c.rows || []) {
      const rh = r.tall ? 0.95 : 0.44;
      s.addShape(pres.shapes.RECTANGLE, { x:rx, y:y+0.02, w:1.2, h:0.3, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(r.k, { x:rx, y:y+0.02, w:1.2, h:0.3, fontSize:9.5, bold:true, color:T.text, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(phRuns(r.v, { fontSize:10 }), { x:rx+1.35, y:y+0.01, w:rw-1.35, h:rh-0.04, fontSize:10, fontFace:FONT, valign:"top", margin:0, lineSpacingMultiple:1.25 });
      y += rh;
    }
    if (c.qr !== false) {
      const qd = 0.85;
      s.addShape(pres.shapes.RECTANGLE, { x:W-MX-qd, y:y+0.12, w:qd, h:qd, fill:{ color:"EFEFEF" }, line:{ color:"D8D8D8", width:1, dashType:"dash" } });
      s.addText("QRコード\n（差し込み予定）", { x:W-MX-qd, y:y+0.12, w:qd, h:qd, fontSize:7, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText("スマホで\nそのままアクセス", { x:W-MX-qd-1.65, y:y+0.12, w:1.5, h:qd, fontSize:9.5, color:T.muted, fontFace:FONT, align:"right", valign:"middle", margin:0 });
    }
    if (c.note) s.addText(c.note, { x:MX, y:my+ph+0.42, w:pw+0.4, h:0.32, fontSize:10, color:T.muted, fontFace:FONT, margin:0 });
  },
  // 制作体制（上段: リーダー紹介／下段: チェックリスト3点）。本文の【要確認】は赤字
  "leader-team-intro"(s, c) {
    let y = BODY_Y + 0.12;
    const av = 0.9;
    s.addShape(pres.shapes.OVAL, { x:MX+0.08, y:y+0.06, w:av, h:av, fill:{ color:T.accent }, line:{ type:"none" } });
    s.addText(c.avatarLabel || "", { x:MX+0.08, y:y+0.06, w:av, h:av, fontSize:13, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
    s.addText(c.leadTitle, { x:MX+1.25, y, w:W-MX*2-1.45, h:0.4, fontSize:15, bold:true, color:T.text, fontFace:FONT, margin:0 });
    s.addText(phRuns(c.leadBody, { fontSize:11.5 }), { x:MX+1.25, y:y+0.44, w:W-MX*2-1.45, h:1.15, fontSize:11.5, fontFace:FONT, valign:"top", margin:0, lineSpacingMultiple:1.35 });
    y += 1.78;
    s.addShape(pres.shapes.LINE, { x:MX, y, w:W-MX*2, h:0, line:{ color:"D8D8D8", width:1 } });
    y += 0.16;
    s.addText(c.teamTitle, { x:MX+0.05, y, w:W-MX*2, h:0.38, fontSize:14.5, bold:true, color:T.text, fontFace:FONT, margin:0 });
    y += 0.5;
    const iconD = 0.3;
    for (const p of c.points || []) {
      s.addShape(pres.shapes.RECTANGLE, { x:MX+0.15, y:y+0.03, w:iconD, h:iconD, fill:{ type:"none" }, line:{ color:T.accent, width:2 } });
      s.addText("✓", { x:MX+0.15, y:y+0.03, w:iconD, h:iconD, fontSize:12, bold:true, color:T.accent, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(p, { x:MX+0.75, y, w:W-MX*2-0.95, h:0.4, fontSize:11.5, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      y += 0.5;
    }
  },
  // FAQコンパクト（5問対応・回答文字数に応じて行高可変）
  "faq-compact"(s, c) {
    const items = c.items || [];
    let y = BODY_Y + 0.08;
    const availW = W - MX*2;
    const chpl = Math.floor((availW - 0.55) * PX / 12.8);   // 9.5pt≒12.8px/字での1行文字数
    items.forEach((qa, i) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x:MX, y:y+0.015, w:0.44, h:0.27, rectRadius:0.13, fill:{ color:T.accent }, line:{ type:"none" } });
      s.addText("Q"+(i+1), { x:MX, y:y+0.015, w:0.44, h:0.27, fontSize:9.5, bold:true, color:"FFFFFF", fontFace:FONT, align:"center", valign:"middle", margin:0 });
      s.addText(qa.q, { x:MX+0.55, y, w:availW-0.55, h:0.3, fontSize:11.5, bold:true, color:T.text, fontFace:FONT, valign:"middle", margin:0 });
      const lines = Math.max(1, Math.ceil(String(qa.a).length / chpl));
      const aH = lines * 0.19 + 0.05;
      s.addText(qa.a, { x:MX+0.55, y:y+0.31, w:availW-0.55, h:aH, fontSize:9.5, color:T.text, fontFace:FONT, valign:"top", margin:0, lineSpacingMultiple:1.15 });
      y += 0.31 + aH + 0.12;
      if (i < items.length-1)
        s.addShape(pres.shapes.LINE, { x:MX, y:y-0.07, w:availW, h:0, line:{ color:"EFEFEF", width:1 } });
    });
  },
  // CTA 2ボックス（無料相談／無料サイト診断・Pale地＋QR枠）＋下部にキャッチコピーで締め
  "cta-two-box"(s, c) {
    const y = BODY_Y + 0.08;
    const boxes = c.boxes || [];
    const gap = 0.3, bw = (W-MX*2-gap*(boxes.length-1))/boxes.length, bh = 3.1;
    boxes.forEach((b, i) => {
      const x = MX + i*(bw+gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w:bw, h:bh, rectRadius:0.06, fill:{ color:T.soft }, line:{ type:"none" } });
      s.addText(b.title, { x:x+0.26, y:y+0.2, w:bw-0.52, h:0.36, fontSize:14.5, bold:true, color:T.accent, fontFace:FONT, margin:0 });
      s.addText(b.body, { x:x+0.26, y:y+0.6, w:bw-0.52, h:0.8, fontSize:10.5, color:T.text, fontFace:FONT, valign:"top", margin:0, lineSpacingMultiple:1.3 });
      // 導線リストは縦積み（段落間を広めに分離）。QR枠との間隔も広めに確保
      const qd = 0.8;
      s.addText(phRuns(b.lines || [], { fontSize:9 }), { x:x+0.26, y:y+1.58, w:bw-0.52-qd-0.35, h:bh-1.73, fontSize:9, fontFace:FONT, valign:"top", margin:0, paraSpaceAfter:7, lineSpacingMultiple:1.2 });
      if (b.qr) {
        s.addShape(pres.shapes.RECTANGLE, { x:x+bw-qd-0.22, y:y+bh-qd-0.24, w:qd, h:qd, fill:{ color:"FFFFFF" }, line:{ color:"D8D8D8", width:1, dashType:"dash" } });
        s.addText("QRコード\n（差し込み予定）", { x:x+bw-qd-0.22, y:y+bh-qd-0.24, w:qd, h:qd, fontSize:6.5, color:T.muted, fontFace:FONT, align:"center", valign:"middle", margin:0 });
      }
    });
    const cy2 = y + bh + 0.18;
    if (c.closing) s.addText(c.closing, { x:MX, y:cy2, w:W-MX*2, h:0.4, fontSize:15, bold:true, color:T.accent, fontFace:FONT, align:"center", valign:"middle", margin:0 });
    if (c.company) s.addText(phRuns(c.company, { fontSize:10 }, T.muted), { x:MX, y:cy2+0.46, w:W-MX*2, h:0.32, fontSize:10, fontFace:FONT, align:"center", valign:"top", margin:0 });
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
const NO_PAGENO = new Set(["cover-gradient-text-bottom", "section-divider", "cover-nol-text-logo", "section-divider-accent"]);
deck.slides.forEach((sl, i) => {
  const s = pres.addSlide();
  const dark = !!(sl.content && sl.content.navy);  // 全面navi地スライド（結び等）
  s.background = { color: dark ? T.accent : T.bg };
  const render = R[sl.pattern] || R.bullets;
  if (!R[sl.pattern]) console.warn(`[warn] no renderer for pattern "${sl.pattern}" — fallback to bullets`);
  BODY_Y = BODY_Y0 + (sl.heading && sl.message ? 0.4 : 0);
  if (sl.heading) headerA(s, sl.heading, sl.message, dark);
  render(s, sl.content || {}, sl);
  if (!NO_PAGENO.has(sl.pattern)) pageNo(s, i+1, total, dark);
});

await pres.writeFile({ fileName: outPath });
console.log(`OK: ${outPath} (${total} slides)`);
