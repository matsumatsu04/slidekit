#!/usr/bin/env node
// build-html-deck.mjs
//
// SlideKit HTMLデッキビルダー。
// <デッキフォルダ>/deck-config.json と <デッキフォルダ>/slides/*.html を読み込み、
// 1ファイルの <デッキフォルダ>/index.html を組み立てる。
//
// 使い方: node build-html-deck.mjs <デッキフォルダの絶対 or 相対パス>
//
// アセット自己完結化の設計意図:
//   フラグメント内の src="...assets/foo.png" のような値は、書き手が
//   `../../assets/...` と書くか `../../../assets/...` と書くかで相対パスの深さが
//   変わりうる（フラグメントがどのディレクトリ階層に置かれるか次第）。
//   そこで「相対パスの深さ」には依存せず、値の中に出てくる "assets/" という
//   文字列以降の部分だけを取り出し、それをリポジトリルートからの相対パスとして
//   解決する、という方式にしている。こうすることで、フラグメント作者がどんな
//   深さの `../` を書いても壊れずに実ファイルへたどり着ける。
//
// Node標準モジュールのみを使用（npm追加なし）。

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.join(__dirname, '..', '..');

const DEFAULT_THEME = {
  accent: '#1E2E53',
  soft: '#E8EBF2',
  text: '#333333',
  muted: '#8A8F98',
  bg: '#FFFFFF',
};

function fail(message) {
  console.error(`[build-html-deck] エラー: ${message}`);
  process.exit(1);
}

function main() {
  const deckArg = process.argv[2];
  if (!deckArg) {
    fail('デッキフォルダのパスを指定してください。使い方: node build-html-deck.mjs <デッキフォルダ>');
  }
  const deckDir = path.resolve(process.cwd(), deckArg);
  if (!fs.existsSync(deckDir) || !fs.statSync(deckDir).isDirectory()) {
    fail(`デッキフォルダが見つかりません: ${deckDir}`);
  }

  const configPath = path.join(deckDir, 'deck-config.json');
  if (!fs.existsSync(configPath)) {
    fail(`deck-config.json が見つかりません: ${configPath}`);
  }
  const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const config = {
    title: rawConfig.title || 'SlideKit Deck',
    theme: { ...DEFAULT_THEME, ...(rawConfig.theme || {}) },
    font: rawConfig.font || 'Noto Sans JP',
    pageNumbers: rawConfig.pageNumbers !== false,
    noPageNoOn: Array.isArray(rawConfig.noPageNoOn) ? rawConfig.noPageNoOn : [],
  };

  const slidesDir = path.join(deckDir, 'slides');
  if (!fs.existsSync(slidesDir) || !fs.statSync(slidesDir).isDirectory()) {
    fail(`slides フォルダが見つかりません: ${slidesDir}`);
  }

  const slideFiles = fs
    .readdirSync(slidesDir)
    .filter((f) => f.endsWith('.html'))
    .sort();

  if (slideFiles.length === 0) {
    fail(`slides フォルダ内にHTMLフラグメントが見つかりません: ${slidesDir}`);
  }

  const assetsOutDir = path.join(deckDir, 'assets');
  const copiedBasenames = new Set();
  let assetsCopiedCount = 0;

  const allStyles = [];
  const processedSections = [];

  const N = slideFiles.length;

  slideFiles.forEach((filename, i) => {
    const n = i + 1;
    const filePath = path.join(slidesDir, filename);
    const raw = fs.readFileSync(filePath, 'utf8');

    // 1. <style> ブロックをすべて抽出（順序維持）
    const styleBlocks = extractStyleBlocks(raw);
    allStyles.push(...styleBlocks);

    // 2. <section class="...slide...">...</section> を抽出（入れ子対応の単純パーサ）
    let section;
    try {
      section = extractSlideSection(raw);
    } catch (err) {
      fail(`${filename} の <section class="slide"> 抽出に失敗しました: ${err.message}`);
    }

    // 3. アセットの自己完結化（src="...assets/..." を検出してコピー＋パス書き換え）
    const { html: sectionWithAssets, copied } = resolveAssets(section, deckDir, assetsOutDir);
    copied.forEach((basename) => {
      if (!copiedBasenames.has(basename)) {
        copiedBasenames.add(basename);
        assetsCopiedCount += 1;
      }
    });

    // 4. ページ番号注入
    const finalSection = maybeInjectPageNumber(sectionWithAssets, n, N, config);

    processedSections.push(finalSection);
  });

  const html = buildDocument(config, allStyles, processedSections);

  const outPath = path.join(deckDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');

  console.log(`[build-html-deck] 処理したスライド枚数: ${N}`);
  console.log(`[build-html-deck] コピーしたアセット枚数: ${assetsCopiedCount}`);
  console.log(`[build-html-deck] 出力パス: ${outPath}`);
}

function extractStyleBlocks(html) {
  const re = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const blocks = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    blocks.push(m[1]);
  }
  return blocks;
}

// 入れ子 <section> があっても壊れないよう、<section ...> / </section> の出現を
// トークンとして順に走査し、深さカウントで対応する閉じタグを見つける単純パーサ。
function extractSlideSection(html) {
  const tagRe = /<section\b[^>]*>|<\/section\s*>/gi;
  const tokens = [];
  let m;
  while ((m = tagRe.exec(html)) !== null) {
    const raw = m[0];
    const isClose = /^<\/section/i.test(raw);
    tokens.push({
      isClose,
      raw,
      start: m.index,
      end: m.index + raw.length,
    });
  }

  // class 属性に "slide" を含む最初の開始タグを探す
  let startTokenIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.isClose) continue;
    const classMatch = t.raw.match(/class\s*=\s*["']([^"']*)["']/i);
    if (classMatch) {
      const classes = classMatch[1].trim().split(/\s+/);
      if (classes.includes('slide')) {
        startTokenIdx = i;
        break;
      }
    }
  }
  if (startTokenIdx === -1) {
    throw new Error('class="slide" を含む <section> が見つかりません');
  }

  // 深さカウントで対応する閉じタグを探す
  let depth = 0;
  let endTokenIdx = -1;
  for (let i = startTokenIdx; i < tokens.length; i++) {
    if (tokens[i].isClose) {
      depth -= 1;
    } else {
      depth += 1;
    }
    if (depth === 0) {
      endTokenIdx = i;
      break;
    }
  }
  if (endTokenIdx === -1) {
    throw new Error('対応する </section> が見つかりません（開閉タグ数が不一致）');
  }

  return html.slice(tokens[startTokenIdx].start, tokens[endTokenIdx].end);
}

function resolveAssets(sectionHtml, deckDir, assetsOutDir) {
  const copied = [];
  const srcRe = /src\s*=\s*(["'])([^"']*assets\/[^"']*)\1/gi;

  const html = sectionHtml.replace(srcRe, (fullMatch, quote, value) => {
    const idx = value.indexOf('assets/');
    const relFromRoot = value.slice(idx); // 例: "assets/brand/brand-b/cover-bg-logo.png"
    const srcAbsPath = path.join(REPO_ROOT, relFromRoot);

    if (!fs.existsSync(srcAbsPath)) {
      console.error(`[build-html-deck] 警告: アセットが見つかりません（スキップ）: ${srcAbsPath}`);
      return fullMatch;
    }

    const basename = path.basename(relFromRoot);
    if (!fs.existsSync(assetsOutDir)) {
      fs.mkdirSync(assetsOutDir, { recursive: true });
    }
    const destPath = path.join(assetsOutDir, basename);
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcAbsPath, destPath);
    }
    copied.push(basename);

    return `src=${quote}assets/${basename}${quote}`;
  });

  return { html, copied };
}

function maybeInjectPageNumber(sectionHtml, n, total, config) {
  if (!config.pageNumbers) return sectionHtml;
  if (config.noPageNoOn.includes(n)) return sectionHtml;

  const span = `<span class="sk-pageno">${n} / ${total}</span>`;

  // 抽出済みの section 文字列は、必ず対応する </section> で終わっている。
  const closeRe = /<\/section\s*>/gi;
  let lastMatch = null;
  let m;
  while ((m = closeRe.exec(sectionHtml)) !== null) {
    lastMatch = m;
  }
  if (!lastMatch) {
    // 通常あり得ない（extractSlideSectionが保証する）が念のためフォールバック
    return sectionHtml + span;
  }
  const insertAt = lastMatch.index;
  return sectionHtml.slice(0, insertAt) + span + sectionHtml.slice(insertAt);
}

function buildCommonCss(config) {
  const t = config.theme;
  return `:root {
  --sk-accent: ${t.accent};
  --sk-soft: ${t.soft};
  --sk-text: ${t.text};
  --sk-muted: ${t.muted};
  --sk-bg: ${t.bg};
}
html, body { margin:0; padding:0; }
body { font-family: '${config.font}', "Noto Sans JP", sans-serif; background:#E9EAEC; display:flex; flex-direction:column; align-items:center; gap:24px; padding:24px 0; }
html { scroll-snap-type: y mandatory; }
.slide {
  width:960px; height:540px; position:relative; overflow:hidden;
  background:#fff; margin:0 auto; box-shadow:0 2px 16px rgba(0,0,0,.12);
  scroll-snap-align:start;
}
.sk-h { position:absolute; top:0; left:40px; right:40px; padding:24px 0 12px; border-bottom:2px solid var(--sk-accent); font-size:24px; font-weight:700; color:#333; }
.sk-msg { position:absolute; top:82px; left:40px; right:40px; font-size:16px; color:#333; }
.sk-pageno { position:absolute; right:40px; bottom:16px; font-size:12px; color:var(--sk-muted,#8A8F98); }

@page { size:960px 540px; margin:0; }
@media print {
  html, body { background:#fff; }
  body { display:block; gap:0; padding:0; }
  .slide { margin:0; box-shadow:none; scroll-snap-align:none; page-break-after:always; break-after:page; }
  .slide:last-child { page-break-after:auto; break-after:auto; }
}`;
}

function buildDocument(config, allStyles, sections) {
  const fontParam = config.font.replace(/\s+/g, '+');
  const commonCss = buildCommonCss(config);
  const fragmentStyles = allStyles.map((s) => `<style>${s}</style>`).join('\n');

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(config.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fontParam}:wght@400;500;700&display=swap" rel="stylesheet">
<style>
${commonCss}
</style>
${fragmentStyles}
</head>
<body>
${sections.join('\n')}
</body>
</html>
`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

main();
