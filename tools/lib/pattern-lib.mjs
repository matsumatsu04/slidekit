// tools/lib/pattern-lib.mjs
// 構図パターン（patterns/SLIDE-PATTERN-*）の共通ユーティリティ。
// build-manifest.mjs / lint-pattern.mjs から使う。Node.js 18 以上・標準モジュールのみ（npm 依存なし）。

import fs from 'node:fs';
import path from 'node:path';

// ---- 定数 -------------------------------------------------------------

/** カテゴリの表示順（gallery/index.html の CAT_ORDER と同一） */
export const CAT_ORDER = [
  '表紙', 'セクション', '目次', '本文', 'リスト', 'ステップ', '図解・ダイアグラム',
  'カード', 'グラフ', 'テーブル', 'KPI', 'まとめ', 'FAQ', 'プロフィール',
];

/** INDEX.md のカテゴリ見出しに付ける絵文字（現行 INDEX と同一） */
export const CAT_EMOJI = {
  '表紙': '🎯', 'セクション': '🔖', '目次': '📋', '本文': '✏️', 'リスト': '📝', 'ステップ': '➡️',
  '図解・ダイアグラム': '🔄', 'カード': '🃏', 'グラフ': '📊', 'テーブル': '📑', 'KPI': '📈',
  'まとめ': '🏆', 'FAQ': '❓', 'プロフィール': '👤',
};

export const TIERS = ['high', 'mid', 'low'];
export const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const ID_RE = /^P\d{3,}$/;
export const PENDING = 'pending';
/** フロントマターのキー（この順で書く。これ以外のキーは持たない） */
export const FM_KEYS = ['name', 'category', 'summary', 'scenes', 'tier', 'id'];
/** next_id の初期値（既存の最大IDが P149 のため） */
export const INITIAL_NEXT_ID = 150;
export const PREFIX = 'SLIDE-PATTERN-';

/** 生成物（build-manifest.mjs が書き換えるファイル） */
export const GENERATED = {
  manifest: 'patterns/manifest.json',
  index: 'patterns/SLIDE-PATTERN-INDEX.md',
  readme: 'README.md',
  gallery: 'gallery/index.html',
};
/** README / gallery の件数を書き換える正規表現（当該箇所だけを置換する） */
export const README_COUNT_RE = /(14カテゴリ・)(\d+)(種)/;
export const GALLERY_COUNT_RE = /(構図パターン)(\d+)(種)/;

// ---- ID ---------------------------------------------------------------

export const idNum = (id) => parseInt(String(id).slice(1), 10);
export const fmtId = (n) => 'P' + String(n).padStart(3, '0');

// ---- フロントマター（小さな YAML サブセット） -----------------------------
// 対応: `key: value`（1行）／ダブルクォート（\" \\ \n \t \uXXXX 等のエスケープ）／
//       シングルクォート（'' で ' を表す）／`#` コメント／空行。
// 非対応（エラーにする）: 複数行・ブロックスカラー（| >）・配列/マップ・アンカー等。

const DQ_ESCAPES = {
  n: '\n', t: '\t', '"': '"', '\\': '\\', '/': '/', ' ': ' ', 0: '\0', r: '\r', b: '\b', f: '\f',
  v: '\v', e: '\x1b', a: '\x07', N: '\u0085', _: '\u00a0', L: '\u2028', P: '\u2029',
};

function parseScalar(raw) {
  let s = raw.replace(/\r$/, '');
  if (s === '') return { value: '' };

  if (s[0] === '"') {
    let out = '';
    let i = 1;
    let closed = false;
    for (; i < s.length; i++) {
      const c = s[i];
      if (c === '\\') {
        const n = s[++i];
        if (n === undefined) return { error: '引用符内のエスケープが不正です' };
        if (n === 'u' || n === 'x' || n === 'U') {
          const len = n === 'u' ? 4 : n === 'x' ? 2 : 8;
          const hex = s.slice(i + 1, i + 1 + len);
          if (!new RegExp(`^[0-9a-fA-F]{${len}}$`).test(hex)) return { error: `\\${n} エスケープが不正です` };
          out += String.fromCodePoint(parseInt(hex, 16));
          i += len;
        } else if (n in DQ_ESCAPES) {
          out += DQ_ESCAPES[n];
        } else {
          return { error: `不明なエスケープ \\${n} です` };
        }
      } else if (c === '"') {
        closed = true;
        i++;
        break;
      } else {
        out += c;
      }
    }
    if (!closed) return { error: '閉じ引用符（"）がありません' };
    const rest = s.slice(i).trim();
    if (rest !== '' && !rest.startsWith('#')) return { error: '閉じ引用符の後に余分な文字があります' };
    return { value: out };
  }

  if (s[0] === "'") {
    let out = '';
    let i = 1;
    let closed = false;
    for (; i < s.length; i++) {
      const c = s[i];
      if (c === "'") {
        if (s[i + 1] === "'") { out += "'"; i++; } else { closed = true; i++; break; }
      } else {
        out += c;
      }
    }
    if (!closed) return { error: "閉じ引用符（'）がありません" };
    const rest = s.slice(i).trim();
    if (rest !== '' && !rest.startsWith('#')) return { error: '閉じ引用符の後に余分な文字があります' };
    return { value: out };
  }

  // プレーンスカラー
  if (/^[\[\]{}|>@`&*!%]/.test(s)) return { error: `先頭に「${s[0]}」は使えません（値をダブルクォートで囲んでください）` };
  if (/^[-?:](\s|$)/.test(s)) return { error: `先頭に「${s[0]} 」は使えません（値をダブルクォートで囲んでください）` };
  const ci = s.search(/\s#/);
  if (ci >= 0) s = s.slice(0, ci);
  s = s.trim();
  if (/: /.test(s) || /:$/.test(s)) return { error: '「: 」（コロン＋空白）や末尾のコロンを含む値はダブルクォートで囲んでください' };
  return { value: s };
}

/**
 * フロントマターを読む。
 * @returns {{ok:true, data:Object, lineOf:Object, endLine:number, body:string}|{ok:false, error:string}}
 */
export function parseFrontmatter(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const lines = text.split('\n');
  if (!/^---\s*$/.test(lines[0] ?? '')) {
    return { ok: false, error: 'ファイル先頭が `---`（フロントマター）ではありません' };
  }
  const data = {};
  const lineOf = {};
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/\r$/, '');
    if (/^(---|\.\.\.)\s*$/.test(line)) { end = i; break; }
    if (/^\s*(#|$)/.test(line)) continue;
    const m = line.match(/^([A-Za-z0-9_-]+)\s*:(?:\s+(.*))?$/);
    if (!m) return { ok: false, error: `フロントマター ${i + 1} 行目が読めません: ${line}` };
    const key = m[1];
    if (key in data) return { ok: false, error: `キー「${key}」が重複しています` };
    const parsed = parseScalar(m[2] ?? '');
    if (parsed.error) return { ok: false, error: `${key}: ${parsed.error}` };
    data[key] = parsed.value;
    lineOf[key] = i;
  }
  if (end < 0) return { ok: false, error: 'フロントマターの終端 `---` がありません' };
  return { ok: true, data, lineOf, endLine: end, body: lines.slice(end + 1).join('\n') };
}

/** 値を YAML の1行スカラーとして書く（必要なときだけダブルクォートで囲む） */
export function formatScalar(v) {
  v = String(v ?? '');
  const needsQuote =
    v === '' ||
    /^\s|\s$/.test(v) ||
    /^[-?:,\[\]{}#&*!|>'"%@`]/.test(v) ||
    /: |:$/.test(v) ||
    /#/.test(v) ||
    /[\x00-\x1f\x7f\u0085\u2028\u2029]/.test(v) ||
    /^(true|false|null|yes|no|on|off|y|n|~)$/i.test(v) ||
    /^[-+]?(\d[\d_]*(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(v) ||
    /^0x[0-9a-fA-F]+$/.test(v) ||
    /^[-+]?\.(inf|nan)$/i.test(v);
  if (!needsQuote) return v;
  return '"' + v
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t') + '"';
}

/** data（FM_KEYS の順）からフロントマター文字列を組み立てる（末尾は `---\n`） */
export function buildFrontmatter(data) {
  return '---\n' + FM_KEYS.map((k) => `${k}: ${formatScalar(data[k])}`).join('\n') + '\n---\n';
}

/**
 * .md テキストのフロントマターの `id:` 行だけを書き換える（他は一切触らない）。
 * @returns {string} 新しいテキスト
 */
export function replaceFrontmatterId(text, newId) {
  const fm = parseFrontmatter(text);
  if (!fm.ok) throw new Error(fm.error);
  if (!('id' in fm.lineOf)) throw new Error('フロントマターに id がありません');
  const lines = text.split('\n');
  const i = fm.lineOf.id;
  const crlf = lines[i].endsWith('\r') ? '\r' : '';
  lines[i] = `id: ${formatScalar(newId)}${crlf}`;
  return lines.join('\n');
}

// ---- パターンの読み込み ------------------------------------------------

/** patterns/ 配下の SLIDE-PATTERN-* ディレクトリ名（プレフィックスなし）を名前順で返す */
export function listPatternNames(root) {
  const dir = path.join(root, 'patterns');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith(PREFIX))
    .map((e) => e.name.slice(PREFIX.length))
    .sort();
}

/**
 * 1パターンを読む（.md のフロントマターまで）。存在しない/読めない場合も戻り値の中に理由を入れる。
 */
export function readPattern(root, name) {
  const dir = path.join(root, 'patterns', PREFIX + name);
  const mdPath = path.join(dir, `${PREFIX}${name}.md`);
  const htmlPath = path.join(dir, `${PREFIX}${name}.html`);
  const p = { name, dir, mdPath, htmlPath, exists: fs.existsSync(dir), md: null, fm: null, error: null };
  if (!p.exists) { p.error = 'ディレクトリがありません'; return p; }
  if (!fs.existsSync(mdPath)) { p.error = `${PREFIX}${name}.md がありません`; return p; }
  p.md = fs.readFileSync(mdPath, 'utf8');
  const fm = parseFrontmatter(p.md);
  if (!fm.ok) { p.error = fm.error; return p; }
  p.fm = fm;
  return p;
}

/** manifest.json を読む（無ければ null） */
export function loadManifest(root) {
  const file = path.join(root, GENERATED.manifest);
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    throw new Error(`manifest.json を JSON として読めません: ${e.message}`);
  }
}

/** Markdown の表セルに入れるためのエスケープ（`|` と改行） */
export const mdCell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
