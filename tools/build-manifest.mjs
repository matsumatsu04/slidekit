#!/usr/bin/env node
// tools/build-manifest.mjs
// 各パターンの .md フロントマター（name/category/summary/scenes/tier/id）から、
//   patterns/manifest.json ／ patterns/SLIDE-PATTERN-INDEX.md ／ README.md と gallery/index.html の件数
// を再生成する。これらは「生成物」なので手で編集しない。
//
//   node tools/build-manifest.mjs            既定: 再生成（id: pending のパターンは末尾に含める）
//   node tools/build-manifest.mjs --check    pending を除外して生成し、コミット済みと差分があれば非0で終了（CI用）
//   node tools/build-manifest.mjs --assign   pending にフォルダ名順で next_id から採番→.md に書き戻し→全生成物を再生成（main用）
//   node tools/build-manifest.mjs --help
//
// Node.js 18 以上・標準モジュールのみ（npm 依存なし）。

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  CAT_ORDER, CAT_EMOJI, TIERS, NAME_RE, ID_RE, PENDING, FM_KEYS, INITIAL_NEXT_ID, PREFIX, GENERATED,
  README_COUNT_RE, GALLERY_COUNT_RE, idNum, fmtId, listPatternNames, readPattern, loadManifest,
  replaceFrontmatterId, mdCell,
} from './lib/pattern-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`使い方: node tools/build-manifest.mjs [--check | --assign]

  （引数なし）  各パターンの .md フロントマターから manifest.json / SLIDE-PATTERN-INDEX.md /
               README・ギャラリーの件数を再生成する。id: pending のパターンは末尾に含める。
  --check      pending を除外して生成し、コミット済みの生成物と差分があれば非0で終了する（CI用）。
  --assign     pending にフォルダ名順で next_id から採番し、各 .md の id を書き戻してから全生成物を再生成する。
               ※ main ブランチ（マージ後）でのみ実行する。提案側（PR）では実行しない。
  --help       この説明を表示する。`);
  process.exit(0);
}

const MODE = args.includes('--assign') ? 'assign' : args.includes('--check') ? 'check' : 'build';
const unknown = args.filter((a) => !['--assign', '--check'].includes(a));
if (unknown.length) {
  console.error(`✗ 不明な引数: ${unknown.join(' ')}（--help を参照）`);
  process.exit(2);
}

// ---- 1. パターンを読む ---------------------------------------------------

const errors = [];
const patterns = [];
for (const name of listPatternNames(ROOT)) {
  const p = readPattern(ROOT, name);
  if (p.error) { errors.push(`${name}: ${p.error}`); continue; }
  const d = p.fm.data;
  const miss = FM_KEYS.filter((k) => !(k in d) || String(d[k]).trim() === '');
  if (miss.length) { errors.push(`${name}: フロントマターに ${miss.join(', ')} がありません`); continue; }
  if (d.name !== name) { errors.push(`${name}: フロントマターの name（${d.name}）がフォルダ名と一致しません`); continue; }
  if (!NAME_RE.test(name)) { errors.push(`${name}: フォルダ名は英小文字・数字・ハイフンのみ（例: cover-split-two-tone）`); continue; }
  if (!CAT_ORDER.includes(d.category)) { errors.push(`${name}: category「${d.category}」は14カテゴリにありません`); continue; }
  if (!TIERS.includes(d.tier)) { errors.push(`${name}: tier「${d.tier}」は high / mid / low のいずれかにしてください`); continue; }
  if (d.id !== PENDING && !ID_RE.test(d.id)) { errors.push(`${name}: id「${d.id}」は pending か P+3桁以上の数字にしてください`); continue; }
  patterns.push({ name, category: d.category, summary: d.summary, scenes: d.scenes, tier: d.tier, id: d.id, mdPath: p.mdPath, md: p.md });
}
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`✗ ${errors.length} 件のエラーのため生成を中止しました（node tools/lint-pattern.mjs で詳細を確認できます）`);
  process.exit(1);
}

// ID の重複チェック
{
  const seen = new Map();
  for (const p of patterns) {
    if (p.id === PENDING) continue;
    if (seen.has(p.id)) errors.push(`id ${p.id} が重複しています: ${seen.get(p.id)} と ${p.name}`);
    seen.set(p.id, p.name);
  }
  if (errors.length) { for (const e of errors) console.error(`✗ ${e}`); process.exit(1); }
}

// ---- 2. next_id を決める（単調増加・欠番保証） -----------------------------

let manifest = null;
try { manifest = loadManifest(ROOT); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
const maxAssigned = patterns.reduce((m, p) => (p.id === PENDING ? m : Math.max(m, idNum(p.id))), 0);
let nextId = Math.max(
  Number.isInteger(manifest?.next_id) ? manifest.next_id : 0,
  maxAssigned + 1,
  INITIAL_NEXT_ID,
);

// ---- 3. --assign: pending に採番して .md に書き戻す ---------------------------

const assigned = [];
if (MODE === 'assign') {
  const pending = patterns.filter((p) => p.id === PENDING).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const p of pending) {
    const id = fmtId(nextId++);
    const text = replaceFrontmatterId(p.md, id);
    fs.writeFileSync(p.mdPath, text);
    p.id = id;
    assigned.push({ name: p.name, id });
    console.log(`採番: ${PREFIX}${p.name} → ${id}`);
  }
  if (!pending.length) console.log('採番対象（id: pending）はありません');
}

// ---- 4. 生成 -----------------------------------------------------------------

const includePending = MODE !== 'check';
const byId = (a, b) => idNum(a.id) - idNum(b.id);
const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
const fixed = patterns.filter((p) => p.id !== PENDING).sort(byId);
const pend = includePending ? patterns.filter((p) => p.id === PENDING).sort(byName) : [];
const list = [...fixed, ...pend];

const manifestText = JSON.stringify({
  count: list.length,
  next_id: nextId,
  patterns: list.map((p) => ({ name: p.name, category: p.category, summary: p.summary, tier: p.tier, id: p.id })),
}, null, 2) + '\n';

function buildIndex() {
  const out = [];
  out.push('# SLIDE-PATTERN-INDEX');
  out.push('');
  out.push('スライドパターンの一覧です。`slidekit-assemble` はこのファイルを参照してパターンを選択します。');
  out.push('このファイルと `manifest.json` は `tools/build-manifest.mjs` の生成物です。**手で編集しない**でください（各パターンの `.md` フロントマターを直して `node tools/build-manifest.mjs` で再生成する）。');
  out.push('');
  out.push(`パターン数：${list.length}`);
  out.push('');
  out.push('> **恒久ID運用（`patterns/manifest.json` の `id`）：**');
  out.push('> - 新規パターンは `.md` のフロントマターに `id: pending` を書いて提出する。main へのマージ時に `next_id` から自動採番される（`node tools/build-manifest.mjs --assign`）。');
  out.push('> - 削除時：**空いた番号は詰めない・再利用しない**（欠番のまま残す。`next_id` は減らさない）。');
  out.push('> - この運用により、パターンの追加・削除があってもギャラリー上の既存パターンのIDは常に不変になる。');
  for (const cat of CAT_ORDER) {
    const rows = list.filter((p) => p.category === cat);
    if (!rows.length) continue;
    out.push('');
    out.push(`## ${CAT_EMOJI[cat]} ${cat}`);
    out.push('');
    out.push('| パターン名 | 概要 | 適したシーン |');
    out.push('|---|---|---|');
    for (const p of rows) out.push(`| ${p.name} | ${mdCell(p.summary)} | ${mdCell(p.scenes)} |`);
  }
  return out.join('\n') + '\n';
}
const indexText = buildIndex();

// README / gallery は当該箇所（件数）だけ正規表現で置換する
const setCount = (text, re) => text.replace(re, (_, a, _n, b) => `${a}${list.length}${b}`);
const COUNT_FILES = [
  { rel: GENERATED.readme, re: README_COUNT_RE },
  { rel: GENERATED.gallery, re: GALLERY_COUNT_RE },
];

// ---- 5. 出力 or 検証 -----------------------------------------------------------

const targets = [
  { rel: GENERATED.manifest, text: manifestText },
  { rel: GENERATED.index, text: indexText },
];

if (MODE === 'check') {
  // 「コミット済み」= HEAD の内容（git が使えない場合は作業ツリーの内容）と比較する
  const committedText = (rel) => {
    try {
      return execFileSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch {
      const f = path.join(ROOT, rel);
      return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
    }
  };
  const diffs = [];
  for (const t of targets) {
    if (committedText(t.rel) !== t.text) diffs.push(t.rel);
  }
  for (const c of COUNT_FILES) {
    const cur = committedText(c.rel);
    if (cur === null) continue;
    if (!c.re.test(cur)) { console.warn(`⚠ ${c.rel}: 件数の記述が見つかりません（置換対象なし）`); continue; }
    if (setCount(cur, c.re) !== cur) diffs.push(`${c.rel}（件数）`);
  }
  if (diffs.length) {
    console.error(`✗ 生成物がコミット済みの内容と一致しません: ${diffs.join(', ')}`);
    console.error('  manifest.json / INDEX.md は生成物です。手で編集せず `node tools/build-manifest.mjs` を実行してください');
    console.error('  （提案PRでは manifest.json / INDEX.md を変更しないでください。採番と再生成は main へのマージ時に自動で行われます）');
    process.exit(1);
  }
  const pendingCount = patterns.filter((p) => p.id === PENDING).length;
  console.log(`✓ manifest.json / INDEX.md / 件数はフロントマターと一致しています（確定 ${fixed.length} 件${pendingCount ? `・pending ${pendingCount} 件は除外` : ''}）`);
  process.exit(0);
}

let changed = 0;
for (const t of targets) {
  const file = path.join(ROOT, t.rel);
  const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (cur !== t.text) { fs.writeFileSync(file, t.text); changed++; console.log(`更新: ${t.rel}`); }
}
for (const c of COUNT_FILES) {
  const file = path.join(ROOT, c.rel);
  if (!fs.existsSync(file)) continue;
  const before = fs.readFileSync(file, 'utf8');
  if (!c.re.test(before)) { console.warn(`⚠ ${c.rel}: 件数の記述が見つかりません（置換対象なし）`); continue; }
  const after = setCount(before, c.re);
  if (after !== before) { fs.writeFileSync(file, after); changed++; console.log(`更新: ${c.rel}（件数 → ${list.length}）`); }
}
const pendCount = pend.length;
console.log(`✓ 生成完了: ${list.length} 件（確定 ${fixed.length}${pendCount ? `・pending ${pendCount}` : ''}）・next_id ${nextId}${assigned.length ? `・採番 ${assigned.map((a) => a.id).join(', ')}` : ''}${changed ? '' : '・変更なし'}`);
