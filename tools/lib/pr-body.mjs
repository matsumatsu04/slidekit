#!/usr/bin/env node
// tools/lib/pr-body.mjs — 提案PRの本文を生成する（propose-pattern.sh から使う）
//   node tools/lib/pr-body.mjs <name>   → 標準出力に本文
// .github/PULL_REQUEST_TEMPLATE.md があればその {{name}} {{category}} {{summary}} {{scenes}} {{tier}} を埋め、
// 無ければ既定の本文を使う。プレビューの見方（gallery/view.html?p=<name>&pal=navy）が無ければ1行足す。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPattern, PREFIX } from './pattern-lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
let name = process.argv[2] ?? '';
name = name.replace(/\/+$/, '').split('/').pop().replace(new RegExp(`^${PREFIX}`), '');
if (!name) { console.error('使い方: node tools/lib/pr-body.mjs <name>'); process.exit(2); }

const p = readPattern(ROOT, name);
if (p.error) { console.error(`✗ ${name}: ${p.error}`); process.exit(1); }
const d = p.fm.data;
const fields = { name, category: d.category ?? '', summary: d.summary ?? '', scenes: d.scenes ?? '', tier: d.tier ?? '' };
const previewLine = `プレビュー: \`gallery/view.html?p=${name}&pal=navy\`（ローカル: リポジトリ直下で \`python3 -m http.server 8930\` → http://localhost:8930/gallery/view.html?p=${name}&pal=navy）`;

const tpl = path.join(ROOT, '.github', 'PULL_REQUEST_TEMPLATE.md');
let body;
if (fs.existsSync(tpl)) {
  body = fs.readFileSync(tpl, 'utf8').replace(/\{\{\s*(name|category|summary|scenes|tier)\s*\}\}/g, (_, k) => fields[k]);
  if (!/view\.html\?p=/.test(body)) body = body.replace(/\s*$/, '\n\n' + previewLine + '\n');
} else {
  body = [
    `## パターン提案: ${name}`,
    '',
    `- **パターン名**: \`${name}\`（\`patterns/${PREFIX}${name}/\`）`,
    `- **カテゴリ**: ${fields.category}`,
    `- **概要**: ${fields.summary}`,
    `- **適したシーン**: ${fields.scenes}`,
    `- **tier**: ${fields.tier}`,
    '',
    previewLine,
    '',
    '- フロントマターは `id: pending`（採番はマージ時に自動）',
    '- `node tools/lint-pattern.mjs ' + name + '` 通過済み',
    '',
  ].join('\n');
}
process.stdout.write(body.endsWith('\n') ? body : body + '\n');
