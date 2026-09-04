#!/usr/bin/env node
// tools/lint-pattern.mjs
// 構図パターン（patterns/SLIDE-PATTERN-{name}/）の規約チェック。
//
//   node tools/lint-pattern.mjs                 全パターンをチェック
//   node tools/lint-pattern.mjs <name> [...]    指定パターンだけチェック（SLIDE-PATTERN- 付きでも可）
//   node tools/lint-pattern.mjs --refs [...]    加えて、SKILL / SPEC / docs / examples が参照するパターン名の実在チェック
//   node tools/lint-pattern.mjs --help
//
// 違反は `✗ {name}: {項目} — {内容}` で出力し、1件でもあれば終了コード 1。
// 既存パターンのうち規約制定前の書き方は GRANDFATHER（許可リスト）で通す（id: pending の新規パターンには適用しない）。
// Node.js 18 以上・標準モジュールのみ（npm 依存なし）。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  CAT_ORDER, TIERS, NAME_RE, ID_RE, PENDING, FM_KEYS, PREFIX,
  listPatternNames, readPattern, loadManifest,
} from './lib/pattern-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---- 設定 ---------------------------------------------------------------

/** 外部URLの許可ホスト（Font Awesome / Google Fonts / SVG名前空間） */
const ALLOW_HOSTS = ['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'www.w3.org'];
/** パターンフォルダ内で無視するOS由来ファイル */
const IGNORE_FILES = ['.DS_Store', 'Thumbs.db'];
/** 1ファイルの上限サイズ（バイナリや巨大な埋め込みの混入防止） */
const MAX_FILE_BYTES = 512 * 1024;
/** 許可する色名（これ以外のCSS色名は有彩色扱いで禁止） */
const ALLOW_COLOR_WORDS = new Set(['white', 'black', 'transparent', 'currentcolor', 'inherit', 'gray', 'grey', 'initial', 'unset', 'none']);
/** CSS の色名（147色）。許可語以外が色の位置に現れたら違反 */
const CSS_COLOR_NAMES = new Set(('aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen').split(' '));
/** 色を持ちうるCSSプロパティ（この値の中の色名だけを見る） */
const COLOR_PROPS = /^(color|background|background-color|background-image|border|border-(top|right|bottom|left|color|top-color|right-color|bottom-color|left-color|block|inline|block-start|block-end|inline-start|inline-end)|outline|outline-color|fill|stroke|box-shadow|text-shadow|text-decoration|text-decoration-color|text-emphasis|text-emphasis-color|caret-color|column-rule|column-rule-color|accent-color|filter|-webkit-text-stroke|-webkit-text-stroke-color|-webkit-text-fill-color|-webkit-box-shadow|scrollbar-color|stop-color|flood-color|lighting-color|bgcolor|--[a-z0-9-]+)$/i;

/**
 * 既存パターンの許可リスト（grandfather）。規約制定（2026-08）前に作られたパターンの、
 * 直すほどではない差異をここで通す。新規（id: pending）には適用しない。
 * 形式: name → { ルール番号: 理由 }
 */
const GRANDFATHER = {
  // 4. .md の4節（旧書式）— 2026-09-04 に全パターンが新書式へ移行したため 0 件
  // 5. HTML骨格（.slide ルート要素を持たず body を 960×540 にしている旧実装）— 0 件
  // 6. 色（グレー階調・var(--sk-*) 以外）— 画像背景系だけに残る「画像に合わせた固有色」
  'cover-soft-3d-left': { 6: '画像背景に合わせた固有色 #2E4A6B / #8A8F98（色ティント対象外）' },
  'section-photo-overlay-left': { 6: '写真オーバーレイの固有色 rgba(15,18,24)（画像背景系・色ティント対象外）' },
  'section-geo-texture-left': { 6: '画像背景に合わせた固有色 #CCC6BA（色ティント対象外）' },
  'section-soft-3d-number-row': { 6: '画像背景に合わせた固有色 #8F9AAB（色ティント対象外）' },
};

/**
 * --refs の許可リスト（削除済みパターン名を参照している既存ファイル）。
 * 形式: 'ファイル相対パス' → [パターン名, ...]
 */
const REFS_GRANDFATHER = {
  // 例: 'examples/foo/deck.json': ['deleted-pattern-name'],
};

/** --refs で走査するファイル */
const REF_GLOBS = [
  { dir: '.claude/skills', re: /\/SKILL\.md$/ },
  { file: 'SPEC.md' },
  { dir: 'docs', re: /\.md$/ },
  { dir: 'examples', re: /\.(md|json|html)$/ },
  // パターン同士の相互参照（Usage Guide の「〜等を検討」）も対象。
  // 削除したパターンを他のパターンが案内し続ける事故を防ぐ。
  { dir: 'patterns', re: /\/SLIDE-PATTERN-[a-z0-9-]+\.md$/ },
];

// ---- 引数 ---------------------------------------------------------------

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`使い方: node tools/lint-pattern.mjs [--refs] [name ...]

  name を省略すると patterns/ の全パターンをチェックします。
  --refs   SKILL.md / SPEC.md / docs / examples が参照するパターン名がすべて実在するかも確認します。

チェック項目:
  1 フォルダ名   patterns/SLIDE-PATTERN-{name}（{name} は英小文字・数字・ハイフン）
  2 ファイル構成 SLIDE-PATTERN-{name}.html と .md の2ファイルのみ
  3 フロントマター name / category / summary / scenes / tier / id（新規は id: pending）
  4 .md 構成    ## Overview / ## Structure / ## Elements / ## Usage Guide の4節
  5 HTML 骨格   960×540 の .slide、DOCTYPE / charset / title / style
  6 色          グレー階調（r=g=b）と var(--sk-*) のみ（有彩色の hex / rgb / hsl / 色名は禁止）
  7 安全性      <script> / on*= / javascript: / iframe・object・embed / data: 禁止、外部URLは許可ホストのみ、素材は既存 assets のみ
  8 絵文字      .html に絵文字を使わない（アイコンは Font Awesome Solid）
  9 参照        --refs 指定時: 参照されるパターン名の実在`);
  process.exit(0);
}
const wantRefs = args.includes('--refs');
const explicit = args.filter((a) => !a.startsWith('--')).map(normalizeName);
const bad = args.filter((a) => a.startsWith('--') && a !== '--refs');
if (bad.length) { console.error(`✗ 不明なオプション: ${bad.join(' ')}（--help を参照）`); process.exit(2); }

function normalizeName(a) {
  let s = a.replace(/\\/g, '/').replace(/\/+$/, '');
  s = s.split('/').pop();
  s = s.replace(/\.(md|html)$/, '');
  if (s.startsWith(PREFIX)) s = s.slice(PREFIX.length);
  return s;
}

// ---- ヘルパ -------------------------------------------------------------

// デザインの規律 v2（2026-09-02）: 本文のインク色 #3f4a52 は「ほぼ無彩色の暖色グレー」として、
// var(--sk-ink, #3f4a52) のフォールバックに限り許可する（SPEC「デザインの規律 v2」）
const V2_ALLOWED_HEX = new Set(['3f4a52']);

function isGray(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split('').map((c) => c + c).join('');
  else if (h.length === 6 || h.length === 8) h = h.slice(0, 6);
  else return null; // 色ではない
  return h.slice(0, 2).toLowerCase() === h.slice(2, 4).toLowerCase() && h.slice(2, 4).toLowerCase() === h.slice(4, 6).toLowerCase();
}

/** CSS宣言テキスト（{ } の中身や style 属性値）から色の違反を集める */
function colorViolationsInDeclarations(css, out, where) {
  let text = css.replace(/\/\*[\s\S]*?\*\//g, ' ');
  text = text.replace(/url\([^)]*\)/gi, 'url()');
  // hex
  for (const m of text.matchAll(/(?<![&\w])#([0-9a-fA-F]{3,8})\b/g)) {
    if (V2_ALLOWED_HEX.has(m[1].toLowerCase())) continue; // v2 のインク色（var(--sk-ink) のフォールバック）は許可
    const g = isGray(m[1]);
    if (g === false) out.push(`${where}: 有彩色 #${m[1]} が使われています（グレー階調 r=g=b か var(--sk-*) にしてください）`);
  }
  // rgb / rgba
  for (const m of text.matchAll(/\brgba?\(\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)\s*[,\s]\s*([\d.]+%?)/gi)) {
    if (!(m[1] === m[2] && m[2] === m[3])) out.push(`${where}: 有彩色 ${m[0].trim()}…) が使われています（r=g=b のグレーにしてください）`);
  }
  // hsl / hsla（彩度0%のみ許可）
  for (const m of text.matchAll(/\bhsla?\(\s*[\d.]+(?:deg|rad|turn|grad)?\s*[,\s]\s*([\d.]+)%/gi)) {
    if (parseFloat(m[1]) !== 0) out.push(`${where}: 有彩色 ${m[0].trim()}…) が使われています（彩度0%のグレー以外は禁止）`);
  }
  // 色名（色を持ちうるプロパティの値の中だけを見る）
  for (const decl of text.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim().toLowerCase();
    if (!COLOR_PROPS.test(prop)) continue;
    const value = decl.slice(i + 1);
    for (const w of value.matchAll(/[a-zA-Z]+/g)) {
      const word = w[0].toLowerCase();
      if (CSS_COLOR_NAMES.has(word) && !ALLOW_COLOR_WORDS.has(word)) {
        out.push(`${where}: 色名「${w[0]}」が使われています（${prop}）。グレー階調の hex か var(--sk-*) にしてください`);
      }
    }
  }
}

/** 単一の色値（SVGの fill="..." 等）をチェック */
function colorViolationInValue(attr, value, out, where) {
  const v = value.trim();
  if (v === '' || /^(none|currentcolor|transparent|inherit|initial|unset)$/i.test(v) || /^url\(/i.test(v) || /^var\(/i.test(v)) return;
  colorViolationsInDeclarations(`${attr}: ${v}`, out, where);
}

/** ファイル内の全 http(s) URL とローカル参照をチェック */
function referenceViolations(html, dir, out) {
  // 外部URL（許可ホスト以外は禁止）
  for (const m of html.matchAll(/https?:\/\/([^\s"'()<>\/\\]+)/gi)) {
    if (!ALLOW_HOSTS.includes(m[1].toLowerCase())) out.push(`許可外の外部URL ${m[0]}（許可: ${ALLOW_HOSTS.join(' / ')}）`);
  }
  // data: URI
  if (/["'(\s]data:[a-z]+\//i.test(html)) out.push('data: URI（画像等の埋め込み）は使えません（素材はリポジトリ既存の /assets/ のみ）');
  // ローカル参照（src / href / url() / @import / srcset / poster）
  const refs = [];
  for (const m of html.matchAll(/\s(?:src|href|xlink:href|poster|srcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) refs.push(m[1] ?? m[2]);
  for (const m of html.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"']*))\s*\)/gi)) refs.push(m[1] ?? m[2] ?? m[3]);
  for (const m of html.matchAll(/@import\s+(?:url\()?\s*(?:"([^"]*)"|'([^']*)')/gi)) refs.push(m[1] ?? m[2]);
  for (let ref of refs) {
    ref = (ref ?? '').trim().split(/\s+/)[0]; // srcset の記述子を落とす
    if (ref === '' || ref.startsWith('#') || /^https?:\/\//i.test(ref)) continue; // 外部URLは上で判定済み
    if (/^data:/i.test(ref)) continue; // 上で判定済み
    if (/^[a-z][a-z0-9+.-]*:/i.test(ref)) { out.push(`許可外の参照 ${ref}`); continue; }
    if (ref.startsWith('//')) { out.push(`プロトコル相対URL ${ref} は使えません`); continue; }
    let abs;
    if (ref.startsWith('/')) abs = path.join(ROOT, ref.split(/[?#]/)[0]);
    else abs = path.resolve(dir, ref.split(/[?#]/)[0]);
    const rel = path.relative(ROOT, abs);
    if (!rel.startsWith('assets' + path.sep)) { out.push(`許可外の参照 ${ref}（参照できるのはリポジトリの /assets/ 配下の既存ファイルのみ）`); continue; }
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) out.push(`存在しない素材 ${ref}（PRでの素材追加はできません。既存の /assets/ を使ってください）`);
  }
}

// ---- 1パターンのチェック -----------------------------------------------------

const RULE_LABEL = {
  1: '1.フォルダ名', 2: '2.ファイル構成', 3: '3.フロントマター', 4: '4.md構成', 5: '5.HTML骨格', 6: '6.色', 7: '7.安全性', 8: '8.絵文字', 9: '9.参照',
};

function lintPattern(name, manifest) {
  const v = []; // {rule, msg}
  const add = (rule, msg) => v.push({ rule, msg });
  const dir = path.join(ROOT, 'patterns', PREFIX + name);
  const htmlName = `${PREFIX}${name}.html`;
  const mdName = `${PREFIX}${name}.md`;

  // 1
  if (!NAME_RE.test(name)) add(1, `{name} は英小文字・数字・ハイフンのみ（例: cover-split-two-tone）: ${name}`);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) { add(1, `patterns/${PREFIX}${name}/ がありません`); return { v, pending: true }; }

  // 2
  const entries = fs.readdirSync(dir).filter((f) => !IGNORE_FILES.includes(f)).sort();
  const expected = [htmlName, mdName].sort();
  const extra = entries.filter((f) => !expected.includes(f));
  const missing = expected.filter((f) => !entries.includes(f));
  if (extra.length) add(2, `余分なファイル/フォルダ: ${extra.join(', ')}（.html と .md の2ファイルのみ）`);
  if (missing.length) add(2, `不足: ${missing.join(', ')}`);
  for (const f of [htmlName, mdName]) {
    const fp = path.join(dir, f);
    if (!fs.existsSync(fp)) continue;
    const st = fs.statSync(fp);
    if (!st.isFile()) { add(2, `${f} が通常ファイルではありません`); continue; }
    if (st.size > MAX_FILE_BYTES) add(2, `${f} が大きすぎます（${st.size} bytes > ${MAX_FILE_BYTES}）`);
    const buf = fs.readFileSync(fp);
    if (buf.includes(0)) add(2, `${f} にバイナリデータ（NUL）が含まれています`);
  }

  // 3
  const p = readPattern(ROOT, name);
  let pending = true;
  if (p.error) {
    add(3, p.error);
  } else {
    const d = p.fm.data;
    const keys = Object.keys(d);
    const miss = FM_KEYS.filter((k) => !(k in d));
    const unknown = keys.filter((k) => !FM_KEYS.includes(k));
    if (miss.length) add(3, `キーがありません: ${miss.join(', ')}`);
    if (unknown.length) add(3, `不要なキー: ${unknown.join(', ')}（使えるのは ${FM_KEYS.join(' / ')} のみ）`);
    if ('name' in d && d.name !== name) add(3, `name「${d.name}」がフォルダ名「${name}」と一致しません`);
    if ('category' in d && !CAT_ORDER.includes(d.category)) add(3, `category「${d.category}」は14カテゴリにありません（${CAT_ORDER.join(' / ')}）`);
    if ('summary' in d && String(d.summary).trim() === '') add(3, 'summary が空です');
    if ('scenes' in d && String(d.scenes).trim() === '') add(3, 'scenes が空です');
    if ('tier' in d && !TIERS.includes(d.tier)) add(3, `tier「${d.tier}」は high / mid / low のいずれかにしてください`);
    if ('id' in d) {
      const id = String(d.id);
      pending = id === PENDING;
      if (id !== PENDING && !ID_RE.test(id)) add(3, `id「${id}」は pending か P+3桁以上の数字（例: P150）にしてください`);
      const inManifest = manifest?.patterns?.find((m) => m.name === name);
      if (inManifest) {
        if (id !== inManifest.id) add(3, `id「${id}」がコミット済み manifest.json の ID（${inManifest.id}）と一致しません`);
      } else if (id !== PENDING) {
        add(3, `新規提出は id: pending にしてください（採番はマージ時に自動。${id} は使えません）`);
      }
      if (id !== PENDING) {
        const other = manifest?.patterns?.find((m) => m.id === id && m.name !== name);
        if (other) add(3, `id ${id} は他のパターン（${other.name}）に使われています`);
      }
    }
  }

  // 4
  if (p.md != null && p.fm) {
    const body = p.fm.body;
    const need = [['Overview', /^##\s+Overview\b/m], ['Structure', /^##\s+Structure/m], ['Elements', /^##\s+Elements/m], ['Usage Guide', /^##\s+Usage Guide/m]];
    const lack = need.filter(([, re]) => !re.test(body)).map(([n]) => `## ${n}`);
    if (lack.length) add(4, `節がありません: ${lack.join(' / ')}（Overview / Structure / Elements / Usage Guide の4節が必要）`);
  }

  // 5〜8（HTML）
  const htmlPath = path.join(dir, htmlName);
  if (fs.existsSync(htmlPath) && fs.statSync(htmlPath).isFile()) {
    const html = fs.readFileSync(htmlPath, 'utf8');
    // 5
    const lack5 = [];
    if (!/^\uFEFF?\s*<!doctype html>/i.test(html)) lack5.push('<!DOCTYPE html>');
    if (!/<html\b/i.test(html)) lack5.push('<html>');
    if (!/<head\b/i.test(html)) lack5.push('<head>');
    if (!/<meta[^>]*charset\s*=\s*["']?utf-8/i.test(html)) lack5.push('<meta charset="UTF-8">');
    if (!/<title\b/i.test(html)) lack5.push('<title>');
    if (!/<style\b/i.test(html)) lack5.push('<style>');
    if (!/<body\b/i.test(html)) lack5.push('<body>');
    if (!/<\/html>/i.test(html)) lack5.push('</html>');
    if (lack5.length) add(5, `HTMLの骨格が不足: ${lack5.join(' ')}`);
    if (!/width\s*:\s*960px/i.test(html)) add(5, 'width:960px の指定がありません（スライドは 960×540 固定）');
    if (!/height\s*:\s*540px/i.test(html)) add(5, 'height:540px の指定がありません（スライドは 960×540 固定）');
    if (!/class\s*=\s*["'][^"']*\bslide\b[^"']*["']/i.test(html)) add(5, 'ルート要素 <div class="slide">（960×540）がありません（既存パターンと同じ骨格にしてください）');

    // 6
    const c = [];
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      // セレクタを除き { } の中身だけを見る
      const inner = m[1].replace(/\/\*[\s\S]*?\*\//g, ' ');
      for (const b of inner.matchAll(/\{([^{}]*)\}/g)) colorViolationsInDeclarations(b[1], c, '<style>');
    }
    for (const m of html.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) colorViolationsInDeclarations(m[1] ?? m[2], c, 'style属性');
    for (const m of html.matchAll(/\s(fill|stroke|stop-color|flood-color|lighting-color|color|bgcolor)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) colorViolationInValue(m[1], m[2] ?? m[3], c, `${m[1]}属性`);
    for (const msg of [...new Set(c)]) add(6, msg);

    // 7
    if (/<script\b/i.test(html)) add(7, '<script> は使えません（公開ギャラリーが iframe で描画するため）');
    if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(html)) add(7, 'on*=（onclick 等のイベント属性）は使えません');
    if (/javascript\s*:/i.test(html)) add(7, 'javascript: は使えません');
    for (const tag of ['iframe', 'object', 'embed', 'applet', 'frame', 'frameset']) {
      if (new RegExp(`<${tag}\\b`, 'i').test(html)) add(7, `<${tag}> は使えません`);
    }
    if (/\ssrcdoc\s*=/i.test(html)) add(7, 'srcdoc 属性は使えません');
    if (/<meta[^>]*http-equiv\s*=\s*["']?refresh/i.test(html)) add(7, '<meta http-equiv="refresh"> は使えません');
    const r = [];
    referenceViolations(html, dir, r);
    for (const msg of [...new Set(r)]) add(7, msg);

    // 8
    const emo = new Set();
    for (const m of html.matchAll(/\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F|[\u{1F000}-\u{1FAFF}]|\p{Regional_Indicator}/gu)) emo.add(m[0]);
    if (emo.size) add(8, `絵文字が使われています: ${[...emo].join(' ')}（アイコンは Font Awesome Solid <i class="fa-solid fa-..."> を使ってください）`);
  }

  return { v, pending };
}

// ---- --refs -------------------------------------------------------------------

function listRefFiles() {
  const files = [];
  for (const g of REF_GLOBS) {
    if (g.file) { const f = path.join(ROOT, g.file); if (fs.existsSync(f)) files.push(f); continue; }
    const base = path.join(ROOT, g.dir);
    if (!fs.existsSync(base)) continue;
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const fp = path.join(d, e.name);
        if (e.isDirectory()) walk(fp);
        else if (g.re.test(fp)) files.push(fp);
      }
    };
    walk(base);
  }
  return files;
}

/**
 * かつて存在して今は無いパターン名を集める（git が無ければ空）。
 * ① コミット済みの削除（git log --diff-filter=D）
 * ② **まだコミットしていない削除**（index にはあるが作業ツリーに無い＝今まさに消した分）
 *    ②が無いと「消した直後の残存参照」を見逃す（実際に取りこぼした事故あり・2026-08-16）。
 */
function deletedPatternNames(current) {
  const names = new Set();
  const collect = (out) => {
    for (const m of out.matchAll(/patterns\/SLIDE-PATTERN-([a-z0-9-]+)\//g)) if (!current.has(m[1])) names.add(m[1]);
  };
  const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  try { collect(git(['log', '--diff-filter=D', '--name-only', '--pretty=format:', '--', 'patterns/SLIDE-PATTERN-*/*.md'])); } catch { /* git 無し */ }
  try { collect(git(['ls-files', '--', 'patterns/SLIDE-PATTERN-*/*.md'])); } catch { /* git 無し */ }
  return names;
}

function lintRefs(currentNames) {
  const violations = []; // {file, name, msg}
  const current = new Set(currentNames);
  const deleted = deletedPatternNames(current);
  for (const file of listRefFiles()) {
    const rel = path.relative(ROOT, file);
    const text = fs.readFileSync(file, 'utf8');
    const waived = new Set(REFS_GRANDFATHER[rel] ?? []);
    const seen = new Set();
    // 完全形 SLIDE-PATTERN-{name}（.md ではコードブロック・インラインコード内の例示は除く。
    // 実在したことのある名前は下の「素の名前」チェックで拾うので、ここで除いても取りこぼさない）
    const prose = /\.md$/.test(rel)
      ? text.replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, ' ').replace(/`[^`\n]*`/g, ' ')
      : text;
    for (const m of prose.matchAll(/SLIDE-PATTERN-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) {
      const n = m[1];
      if (n === 'INDEX' || current.has(n) || seen.has(n)) continue;
      seen.add(n);
      violations.push({ file: rel, name: n, waived: waived.has(n), msg: `SLIDE-PATTERN-${n} は patterns/ に存在しません` });
    }
    // 素の名前（削除済みパターン名に一致するものだけ）
    if (deleted.size) {
      for (const m of text.matchAll(/(?<![a-z0-9-])([a-z0-9]+(?:-[a-z0-9]+)+)(?![a-z0-9-])/g)) {
        const n = m[1];
        if (!deleted.has(n) || seen.has(n)) continue;
        seen.add(n);
        violations.push({ file: rel, name: n, waived: waived.has(n), msg: `削除済みパターン ${n} を参照しています` });
      }
    }
  }
  return violations;
}

// ---- 実行 -----------------------------------------------------------------------

let manifest = null;
try { manifest = loadManifest(ROOT); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }

const all = listPatternNames(ROOT);
const names = explicit.length ? explicit : all;
let violationCount = 0, waivedCount = 0, failedPatterns = 0;

for (const name of names) {
  const { v, pending } = lintPattern(name, manifest);
  const gf = pending ? {} : (GRANDFATHER[name] ?? {});
  let failed = false;
  for (const { rule, msg } of v) {
    if (gf[rule]) {
      waivedCount++;
      console.log(`⚠ ${name}: ${RULE_LABEL[rule]} — ${msg}（許可リスト: ${gf[rule]}）`);
    } else {
      violationCount++;
      failed = true;
      console.log(`✗ ${name}: ${RULE_LABEL[rule]} — ${msg}`);
    }
  }
  if (failed) failedPatterns++;
  else if (explicit.length) console.log(`✓ ${name}`);
}

let refViolations = 0;
if (wantRefs) {
  for (const r of lintRefs(all)) {
    if (r.waived) { waivedCount++; console.log(`⚠ ${r.file}: ${RULE_LABEL[9]} — ${r.msg}（許可リスト: 既存の例示ファイル）`); }
    else { refViolations++; console.log(`✗ ${r.file}: ${RULE_LABEL[9]} — ${r.msg}`); }
  }
}

const total = violationCount + refViolations;
console.log(`── ${names.length} パターンをチェック${wantRefs ? '（＋参照チェック）' : ''}: 違反 ${total} 件（${failedPatterns} パターン${refViolations ? ` / 参照 ${refViolations} 件` : ''}）／許可リスト通過 ${waivedCount} 件`);
if (total) { console.log('✗ 違反があります。上の内容を直してから再実行してください'); process.exit(1); }
console.log('✓ すべて通過');
