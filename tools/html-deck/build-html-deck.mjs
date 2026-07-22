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
// 非公開アセット置き場（任意）。リポジトリの隣に slidekit-private/ がある場合、
// リポジトリ内で見つからないアセット（assets/...）をここからも解決する。
// 例: slidekit-private/assets/brand/... （ブランドロゴ等、公開リポジトリに含めない素材）
const PRIVATE_ROOT = path.join(REPO_ROOT, '..', 'slidekit-private');

const DEFAULT_THEME = {
  accent: '#1E2E53',
  accent2: '', // 差し色（任意）。空なら --sk-accent2 は出力せず、フラグメント側のフォールバックで accent に落ちる
  soft: '#E8EBF2',
  text: '#333333',
  muted: '#8A8F98',
  bg: '#FFFFFF',
};

// 共通見出し（sk-h）のスタイル一覧。patterns/ 側の sk-head v5（data-hstyle="a"〜"f"）と
// 同じ見た目になるよう対応させている。詳細は SPEC.md の「共通見出し」節を参照。
const HEADING_STYLES = ['a', 'b', 'c', 'd', 'e', 'f'];

// Font Awesome 6 のアイコンスタイル一覧。solid/regular はFree CDNで有効。
// light/thin/duotone/sharp はPro Kit導入時のみ有効（詳細は docs/html-deck-generation.md）。
const ICON_STYLES = ['solid', 'regular', 'light', 'thin', 'duotone', 'sharp'];
const ICON_STYLES_PRO = ['light', 'thin', 'duotone', 'sharp'];

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

  if (rawConfig.headingStyle && !HEADING_STYLES.includes(rawConfig.headingStyle)) {
    console.error(
      `[build-html-deck] 警告: headingStyle "${rawConfig.headingStyle}" は未対応です（a〜fのいずれかを指定）。"a" にフォールバックします。`
    );
  }
  if (rawConfig.iconStyle && !ICON_STYLES.includes(rawConfig.iconStyle)) {
    console.error(
      `[build-html-deck] 警告: iconStyle "${rawConfig.iconStyle}" は未対応です（${ICON_STYLES.join('/')}のいずれかを指定）。"solid" にフォールバックします。`
    );
  }

  const config = {
    title: rawConfig.title || 'SlideKit Deck',
    theme: { ...DEFAULT_THEME, ...(rawConfig.theme || {}) },
    font: rawConfig.font || 'Noto Sans JP',
    pageNumbers: rawConfig.pageNumbers !== false,
    noPageNoOn: Array.isArray(rawConfig.noPageNoOn) ? rawConfig.noPageNoOn : [],
    headingStyle: HEADING_STYLES.includes(rawConfig.headingStyle) ? rawConfig.headingStyle : 'a',
    iconStyle: ICON_STYLES.includes(rawConfig.iconStyle) ? rawConfig.iconStyle : 'solid',
  };

  if (ICON_STYLES_PRO.includes(config.iconStyle)) {
    console.error(
      `[build-html-deck] 警告: iconStyle "${config.iconStyle}" はFont Awesome Proのスタイルです。Free CDNのままではアイコンが表示されません（Pro Kit導入時のみ有効。docs/html-deck-generation.md参照）。`
    );
  }

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

    // 4. アイコンスタイル変換（deck-config.jsonのiconStyleに応じてfa-solidを一括変換）
    const sectionWithIconStyle = applyIconStyle(sectionWithAssets, config.iconStyle);

    // 5. ページ番号注入
    const numberedSection = maybeInjectPageNumber(sectionWithIconStyle, n, N, config);

    // 6. 元フラグメント名を data-sk-src として埋め込む
    //    （ギャラリーのデッキビューアが「スライドN＝どのファイルか」をフィードバックプロンプトに書けるようにする）
    const finalSection = injectSrcAttr(numberedSection, filename);

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
    const relFromRoot = value.slice(idx); // 例: "assets/covers/cover-bg-organic-blobs.jpg"
    let srcAbsPath = path.join(REPO_ROOT, relFromRoot);
    let isPrivate = false;

    if (!fs.existsSync(srcAbsPath)) {
      const privatePath = path.join(PRIVATE_ROOT, relFromRoot);
      if (fs.existsSync(privatePath)) {
        srcAbsPath = privatePath;
        isPrivate = true;
      }
    }
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

    // data-sk-asset にはリポジトリルートからの元パスを残す。
    // デッキ単体ではローカルコピー（assets/{basename}）を参照し、
    // ギャラリーのデッキビューアに貼り付けた時はこの元パスから画像を復元する。
    // 非公開（slidekit-private）由来のアセットは公開ギャラリーに存在しないため付与しない。
    if (isPrivate) {
      return `src=${quote}assets/${basename}${quote}`;
    }
    return `src=${quote}assets/${basename}${quote} data-sk-asset=${quote}${relFromRoot}${quote}`;
  });

  return { html, copied };
}

// フラグメントは常に `<i class="fa-solid fa-xxx">` の形（fa-solid固定）で書かれる前提
// （docs/html-deck-generation.md の「アイコンの使用ルール」）。iconStyleがsolid以外の
// 場合のみ、"fa-solid" トークンを対象スタイルのクラスに一括置換する。
// duotone/sharpはFA6の命名規則によりweight（既定=solid）との複合クラスになる。
function iconStyleClasses(style) {
  if (style === 'duotone') return 'fa-duotone fa-solid';
  if (style === 'sharp') return 'fa-sharp fa-solid';
  return `fa-${style}`;
}

function applyIconStyle(sectionHtml, iconStyle) {
  if (!iconStyle || iconStyle === 'solid') return sectionHtml;
  const replacement = iconStyleClasses(iconStyle);
  return sectionHtml.replace(/\bfa-solid\b/g, replacement);
}

function injectSrcAttr(sectionHtml, filename) {
  // 先頭の <section ...> 開始タグに data-sk-src="{フラグメント名}" を追加する
  const safe = String(filename).replace(/["<>]/g, '');
  return sectionHtml.replace(/<section\b/i, `<section data-sk-src="${safe}"`);
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

// 見出し（.sk-h）をスタイル別に出し分ける。全スタイル共通の不変metrics
// （上端から24px・font24px bold・本文開始76px/メッセージライン時128px）は変えない。
// patterns/ 側の sk-head v5（data-hstyle="a"〜"f"）と同じ見た目になるよう対応させている。
function buildHeadingCss(style) {
  switch (style) {
    case 'b': // 縦バー（タイトル文字高に合わせた短い縦バー・左40px＋タイトルはその右16px）
      return `.sk-h { position:absolute; top:0; left:40px; right:auto; padding:24px 0 0 20px; font-size:24px; font-weight:700; color:#333; }
.sk-h::before { content:""; position:absolute; left:0; top:26px; width:4px; height:28px; border-radius:2px; background:var(--sk-accent); }`;
    case 'c': // 塗り帯（全幅アクセント帯・白文字）
      return `.sk-h { position:absolute; top:0; left:0; right:0; height:76px; box-sizing:border-box; display:flex; align-items:center; padding:0 40px; background:var(--sk-accent); font-size:24px; font-weight:700; color:#FFFFFF; }`;
    case 'd': // 2トーン下線（左だけ濃い線＋全幅の薄線）
      return `.sk-h { position:absolute; top:0; left:40px; right:40px; padding:24px 0 12px; border-bottom:2px solid var(--sk-soft); font-size:24px; font-weight:700; color:#333; }
.sk-h::after { content:""; position:absolute; left:0; bottom:-2px; width:120px; height:2px; background:var(--sk-accent); }`;
    case 'e': // ショートバー（タイトル下に短いバーのみ・全幅線なし）
      return `.sk-h { position:absolute; top:0; left:40px; right:40px; padding:24px 0 12px; font-size:24px; font-weight:700; color:#333; }
.sk-h::after { content:""; position:absolute; left:0; bottom:0; width:56px; height:3px; border-radius:2px; background:var(--sk-accent); }`;
    case 'f': // ドット＋英字ラベル型（`.sk-h` に data-label 属性でラベル文言を渡す）
      return `.sk-h { position:absolute; top:0; left:40px; right:40px; padding:16px 0 0; display:flex; flex-direction:column; align-items:flex-start; gap:4px; font-size:24px; font-weight:700; color:#333; }
.sk-h::before { content:"● " attr(data-label); font-size:12px; font-weight:700; color:var(--sk-accent); letter-spacing:.06em; }`;
    case 'a': // 全幅下線（既定）
    default:
      return `.sk-h { position:absolute; top:0; left:40px; right:40px; padding:24px 0 12px; border-bottom:2px solid var(--sk-accent); font-size:24px; font-weight:700; color:#333; }`;
  }
}

function buildCommonCss(config) {
  const t = config.theme;
  return `:root {
  --sk-accent: ${t.accent};${t.accent2 ? `\n  --sk-accent2: ${t.accent2};` : ''}
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
${buildHeadingCss(config.headingStyle)}
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
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer">
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
