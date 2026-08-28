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
// 旧d（2トーン下線）・旧e（ショートバー）は 2026-08-19 に廃止（代表指示）。
// 残った4種を連番に揃えるため、旧f（ドット＋英字ラベル）を d に改称した（2026-08-20）。
// 既にビルド済みのデッキはCSSを焼き込んであるので表示は変わらない。再ビルド時のみここで弾かれる。
const HEADING_STYLES = ['a', 'b', 'c', 'd'];

// Font Awesome 6 のアイコンスタイル一覧。solid/regular はFree CDNで有効。
// light/thin/duotone/sharp はPro Kit導入時のみ有効（詳細は docs/html-deck-generation.md）。
const ICON_STYLES = ['solid', 'regular', 'light', 'thin', 'duotone', 'sharp'];
const ICON_STYLES_PRO = ['light', 'thin', 'duotone', 'sharp'];

// 背景画像レイヤー（deck-config.json の "background"）。
// 素材名 X は assets/backgrounds/X.{jpg,jpeg,png,webp,svg} の順で最初に存在するものに解決する
// （同名の jpg を置けば svg より優先される）。詳細は docs/html-deck-generation.md「背景画像レイヤー」。
const BG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'svg'];
const BG_DEFAULTS = ['auto', true, false];

// 画像の埋め込み（deck-config.json の "inlineAssets"。既定 true）。
// index.html に data: URI で焼き込むと、assets/ フォルダが隣に無くても画像が出る。
//   - スライド確認ページ（deck.html）にパス貼り付け／ドラッグ＆ドロップしたとき
//   - index.html だけをクライアント・受講生に渡したとき
// いずれも表紙写真・背景が欠けなくなる。assets/ へのコピー自体は従来どおり続ける。
const ASSET_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
};

// 埋め込んだ素材の重複を数えないための集合（同じ画像を複数スライドで使っても1回だけ数える）
const inlinedAssets = new Map(); // 絶対パス -> data URI

function toDataUri(absPath) {
  const ext = path.extname(absPath).toLowerCase();
  const mime = ASSET_MIME[ext];
  if (!mime) return null; // 未知の拡張子は埋め込まず従来どおり相対参照のままにする
  if (inlinedAssets.has(absPath)) return inlinedAssets.get(absPath);
  const uri = `data:${mime};base64,${fs.readFileSync(absPath).toString('base64')}`;
  inlinedAssets.set(absPath, uri);
  return uri;
}

function fail(message) {
  console.error(`[build-html-deck] エラー: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.error(`[build-html-deck] 警告: ${message}`);
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
    // 画像を index.html に埋め込むか（既定 true）。false にすると従来どおり assets/ への相対参照になる
    inlineAssets: rawConfig.inlineAssets !== false,
    // 背景画像レイヤー（未指定なら null ＝ 従来と完全に同じ出力）
    background: normalizeBackgroundConfig(rawConfig.background),
    // スライド単位の設定（bg の上書き・kind/pattern のヒント）。省略可
    slideEntries: normalizeSlideEntries(rawConfig.slides),
  };

  if (ICON_STYLES_PRO.includes(config.iconStyle)) {
    console.error(
      `[build-html-deck] 警告: iconStyle "${config.iconStyle}" はFont Awesome Proのスタイルです。Free CDNのままではアイコンが表示されません（Pro Kit導入時のみ有効。docs/html-deck-generation.md参照）。`
    );
  }

  // 背景素材の解決（見つからなければ警告して背景なしでビルドを続ける）
  let bgAsset = null;
  if (config.background) {
    bgAsset = resolveBackgroundAsset(config.background.image);
    if (!bgAsset) {
      warn(
        `背景画像 "${config.background.image}" が見つかりません（assets/backgrounds/${config.background.image}.{${BG_EXTS.join(',')}} を探しました）。背景なしでビルドします。`
      );
      config.background = null;
    }
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

  // slides の file 指定が実在するか（タイプミス検出）
  config.slideEntries.forEach((e) => {
    if (e.file && !slideFiles.some((f) => sameSlideFile(f, e.file))) {
      warn(`deck-config.json の slides に指定された "${e.file}" に一致するフラグメントが slides/ にありません。`);
    }
  });

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
    const { html: sectionWithAssets, copied } = resolveAssets(
      section,
      deckDir,
      assetsOutDir,
      config.inlineAssets
    );
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
    let finalSection = injectSrcAttr(numberedSection, filename);

    // 7. 背景画像レイヤーの ON/OFF 判定（background 設定時のみ。data-sk-bg / data-sk-bg-asset を付与）
    if (config.background) {
      const entry = slideEntryFor(config.slideEntries, filename, i);
      const decision = decideBackground(config.background, entry, {
        filename,
        raw,
        section,
        css: styleBlocks.join('\n'),
      });
      console.log(`[build-html-deck] 背景: ${n} ${filename} → ${decision.on ? 'ON' : 'OFF'}（${decision.reason}）`);
      finalSection = injectBgAttrs(finalSection, decision.on, bgAsset, config.inlineAssets);
    }

    processedSections.push(finalSection);
  });

  // 背景素材のコピー（img アセットと同じく <デッキ>/assets/<basename> に置き、CSSから相対参照する）
  let bgCssUrl = null;
  if (config.background && bgAsset) {
    const basename = path.basename(bgAsset.rel);
    if (!fs.existsSync(assetsOutDir)) fs.mkdirSync(assetsOutDir, { recursive: true });
    const destPath = path.join(assetsOutDir, basename);
    // 素材の差し替え（jpg を後から置いた等）が確実に反映されるよう、背景素材は毎回上書きコピーする
    fs.copyFileSync(bgAsset.abs, destPath);
    if (!copiedBasenames.has(basename)) {
      copiedBasenames.add(basename);
      assetsCopiedCount += 1;
    }
    bgCssUrl = config.inlineAssets ? toDataUri(bgAsset.abs) || `assets/${basename}` : `assets/${basename}`;
  }

  const html = buildDocument(config, allStyles, processedSections, bgCssUrl);

  const outPath = path.join(deckDir, 'index.html');
  fs.writeFileSync(outPath, html, 'utf8');

  console.log(`[build-html-deck] 処理したスライド枚数: ${N}`);
  console.log(`[build-html-deck] コピーしたアセット枚数: ${assetsCopiedCount}`);
  if (config.inlineAssets && inlinedAssets.size) {
    const bytes = [...inlinedAssets.values()].reduce((a, u) => a + u.length, 0);
    console.log(
      `[build-html-deck] index.html に埋め込んだ画像: ${inlinedAssets.size}枚（約${Math.round(bytes / 1024)}KB）` +
        ' — assets/ が無くても表示されます（無効化: deck-config.json に "inlineAssets": false）'
    );
  }
  if (config.background && bgAsset) {
    console.log(`[build-html-deck] 背景画像: ${bgAsset.rel}（default=${String(config.background.default)}）`);
  }
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

function resolveAssets(sectionHtml, deckDir, assetsOutDir, inlineAssets) {
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

    // 既定（inlineAssets）では data: URI で index.html に焼き込む。
    // assets/ フォルダが隣に無くても出るので、data-sk-asset での復元は不要になる
    // （付けるとビューア側が相対パスへ書き戻してしまうため、埋め込み時は付けない）。
    if (inlineAssets) {
      const uri = toDataUri(srcAbsPath);
      if (uri) return `src=${quote}${uri}${quote}`;
      // 未知の拡張子はここに来る。従来の相対参照にフォールバックする
    }

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

// ================= 背景画像レイヤー（deck-config.json の "background"） =================
//
// 設計意図:
//   ・パターン側の `.slide{background:#FFFFFF}` 等（ショートハンド）を壊さず、`background-image` だけを
//     `!important` で上書きして「白の上に画像＝最下層」を実現する（色・レイアウトには一切触れない）。
//   ・ON/OFF は <section class="slide"> の data-sk-bg="on|off" 属性で表現する。CSSは属性を見るだけなので、
//     ギャラリーのスライド確認・修正依頼ページ（gallery/deck.html）は属性を切り替えるだけで即時プレビューできる。
//   ・"background" 未指定なら、この節の処理は一切走らず出力は従来とバイト単位で同一になる。

function normalizeBackgroundConfig(raw) {
  if (raw == null || raw === false) return null;
  let obj = raw;
  if (typeof raw === 'string') obj = { image: raw }; // "background": "soft-diagonal" の省略形
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    warn('background はオブジェクト（{ "image": "...", "default": "auto" }）で指定してください。無視します。');
    return null;
  }
  const image = typeof obj.image === 'string' ? obj.image.trim() : '';
  if (!image) {
    warn('background.image が未指定です（例: "soft-diagonal"）。背景なしでビルドします。');
    return null;
  }
  let def = obj.default === undefined ? 'auto' : obj.default;
  if (typeof def === 'string') {
    const s = def.trim().toLowerCase();
    if (s === 'true' || s === 'on') def = true;
    else if (s === 'false' || s === 'off') def = false;
    else def = s;
  }
  if (!BG_DEFAULTS.includes(def)) {
    warn(`background.default "${String(obj.default)}" は未対応です（"auto" / true / false）。"auto" にフォールバックします。`);
    def = 'auto';
  }
  return { image, default: def };
}

// slides: [ "01-cover.html", { "file": "02-body.html", "bg": false, "kind": "本文", "pattern": "key-message-single" }, ... ]
// 文字列（ファイル名だけ）とオブジェクトの混在を許す。file が無いエントリは配列の位置（0始まり）で対応付ける。
function normalizeSlideEntries(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((e, i) => {
    if (typeof e === 'string') return { file: e.trim(), index: i };
    if (e && typeof e === 'object') {
      return {
        file: typeof e.file === 'string' ? e.file.trim() : '',
        bg: normalizeBool(e.bg),
        kind: typeof e.kind === 'string' ? e.kind.trim() : '',
        pattern: typeof e.pattern === 'string' ? e.pattern.trim() : '',
        index: i,
      };
    }
    return { file: '', index: i };
  });
}

function normalizeBool(v) {
  if (v === true || v === false) return v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (s === 'true' || s === 'on') return true;
    if (s === 'false' || s === 'off') return false;
  }
  return undefined;
}

// "01-cover.html" / "01-cover" / "slides/01-cover.html" を同一視する
function sameSlideFile(a, b) {
  const norm = (s) => path.basename(String(s)).replace(/\.html?$/i, '').toLowerCase();
  return norm(a) === norm(b);
}

function slideEntryFor(entries, filename, index) {
  const byFile = entries.find((e) => e.file && sameSlideFile(e.file, filename));
  if (byFile) return byFile;
  const byIndex = entries[index];
  if (byIndex && !byIndex.file) return byIndex;
  return null;
}

// 素材の解決順: assets/backgrounds/{name}.{jpg,jpeg,png,webp,svg}（リポジトリ → ../slidekit-private の順）。
// 拡張子付きで書いた場合はそのファイル名（"assets/" を含むパスならリポジトリルート基準）。
function resolveBackgroundAsset(image) {
  const candidates = [];
  if (/\.(jpe?g|png|webp|svg)$/i.test(image)) {
    const idx = image.indexOf('assets/');
    candidates.push(idx >= 0 ? image.slice(idx) : `assets/backgrounds/${path.basename(image)}`);
  } else {
    BG_EXTS.forEach((ext) => candidates.push(`assets/backgrounds/${image}.${ext}`));
  }
  for (const rel of candidates) {
    const abs = path.join(REPO_ROOT, rel);
    if (fs.existsSync(abs)) return { abs, rel, isPrivate: false };
  }
  for (const rel of candidates) {
    const abs = path.join(PRIVATE_ROOT, rel);
    if (fs.existsSync(abs)) return { abs, rel, isPrivate: true };
  }
  return null;
}

// ---- auto 判定 ----
// 判定順（最初に該当したものが理由になる）:
//   1. slides[].bg の個別指定
//   2. default=false → 全OFF
//   3. 画像背景（全面 <img> / background:url(...) の全面要素）→ OFF
//   4. 全面塗り（ルートの background が var(--sk-accent…) / color-mix / 白以外の色）→ OFF
//   5. 表紙（kind=表紙|cover ／ pattern・冒頭コメント・ファイル名が cover- で始まる）→ auto では OFF、default=true では ON
//   6. それ以外（白系: #fff / white / var(--sk-bg) / transparent / 未指定）→ ON
function decideBackground(bgConfig, entry, frag) {
  if (entry && entry.bg !== undefined) {
    return { on: entry.bg, reason: `個別指定 slides[].bg=${entry.bg}` };
  }
  if (bgConfig.default === false) {
    return { on: false, reason: 'default=false' };
  }
  const root = rootBackgroundKind(frag.section, frag.css); // {kind, detail}
  if (root.kind === 'image' || hasFullBleedImage(frag.section, frag.css)) {
    return { on: false, reason: `画像背景${root.kind === 'image' ? `: ${root.detail}` : '（全面の <img> / url() 要素）'}` };
  }
  if (root.kind === 'fill') {
    return { on: false, reason: `全面塗り: ${root.detail}` };
  }
  const cover = coverHint(frag.filename, frag.raw, entry);
  if (cover && bgConfig.default === 'auto') {
    return { on: false, reason: `表紙: ${cover}` };
  }
  return { on: true, reason: `白背景${root.detail ? `: ${root.detail}` : '（ルートに background 指定なし）'}${cover ? '・表紙だが default=true' : ''}` };
}

// 値の分類: 'white' | 'fill' | 'image'
function classifyBackgroundValue(value) {
  const s = String(value).replace(/!important/gi, '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (!s) return 'white';
  if (/url\(|gradient\(/.test(s)) return 'image';
  if (/var\(--sk-accent|color-mix\(/.test(s)) return 'fill';
  if (/var\(--sk-bg\b/.test(s)) return 'white';
  if (/^(#fff|#ffffff|#ffffffff|white|transparent|none|inherit|initial|unset)$/.test(s)) return 'white';
  if (/^rgba?\(\s*255\s*[, ]\s*255\s*[, ]\s*255\b/.test(s)) return 'white';
  return 'fill'; // その他の色（var(--sk-soft) 等の淡色も含む）
}

// フラグメントの <section class="slide ..."> 自身に効く background 宣言を集め、最終的な種別を返す
function rootBackgroundKind(sectionHtml, cssText) {
  const openTag = (sectionHtml.match(/<section\b[^>]*>/i) || [''])[0];
  const classMatch = openTag.match(/class\s*=\s*["']([^"']*)["']/i);
  const classes = classMatch ? classMatch[1].trim().split(/\s+/).filter(Boolean) : [];
  const decls = [];

  // 1) CSSルール（出現順＝後勝ち）。ルート自身を指す単純セレクタだけを対象にする
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(cssText)) !== null) {
    const selectors = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    if (!selectors.some((sel) => selectorTargetsRoot(sel, classes))) continue;
    collectBackgroundDecls(m[2], decls);
  }
  // 2) インライン style（CSSより優先）
  const inline = openTag.match(/style\s*=\s*["']([^"']*)["']/i);
  if (inline) collectBackgroundDecls(inline[1], decls);

  let color = null; // 'white' | 'fill'
  let image = false;
  let detail = '';
  decls.forEach((d) => {
    const kind = classifyBackgroundValue(d.value);
    if (d.prop === 'background') {
      image = kind === 'image';
      color = kind === 'image' ? color : kind;
      detail = `${d.prop}:${d.value}`;
    } else if (d.prop === 'background-image') {
      image = kind === 'image';
      if (image) detail = `${d.prop}:${d.value}`;
    } else if (d.prop === 'background-color') {
      color = kind;
      detail = `${d.prop}:${d.value}`;
    }
  });
  if (image) return { kind: 'image', detail };
  if (color === 'fill') return { kind: 'fill', detail };
  return { kind: 'white', detail: color === 'white' ? detail : '' };
}

// 「セクション自身だけ」を指す単純セレクタか（.slide / .s3-x / .slide.s3-x / section.s3-x / section）。
// 子孫・結合子・擬似クラスを含むものはルート宣言とみなさない。
function selectorTargetsRoot(sel, classes) {
  if (/[\s>+~:[\]#*]/.test(sel)) return false;
  if (sel.toLowerCase() === 'section') return true;
  const m = sel.match(/^(section)?((?:\.[A-Za-z0-9_-]+)+)$/i);
  if (!m) return false;
  return m[2].split('.').filter(Boolean).every((c) => c === 'slide' || classes.includes(c));
}

function collectBackgroundDecls(declText, out) {
  declText.split(';').forEach((part) => {
    const idx = part.indexOf(':');
    if (idx < 0) return;
    const prop = part.slice(0, idx).trim().toLowerCase();
    const value = part.slice(idx + 1).trim();
    if (prop === 'background' || prop === 'background-color' || prop === 'background-image') {
      out.push({ prop, value });
    }
  });
}

// 全面に敷かれた画像要素があるか（表紙の <img class="s1-bg"> や .bg{inset:0;background:url()} 型）。
// カード内の写真（<img style="width:100%;height:100%;object-fit:cover"> ＝ 箱の中で全面）は対象外にするため、
// 「inset:0」か「position:absolute/fixed ＋ top:0/left:0 ＋ 幅・高さ100%（または right:0/bottom:0）」だけを全面とみなす。
function hasFullBleedImage(sectionHtml, cssText) {
  const isFullBleed = (css) => {
    const s = String(css).replace(/\s+/g, '').toLowerCase();
    if (/inset:0(px)?(;|$|!)/.test(s)) return true;
    const has = (re) => re.test(s);
    if (!has(/position:(absolute|fixed)/)) return false;
    const w = has(/width:100%/) || has(/right:0(px)?(;|$|!)/);
    const h = has(/height:100%/) || has(/bottom:0(px)?(;|$|!)/);
    return has(/top:0(px)?(;|$|!)/) && has(/left:0(px)?(;|$|!)/) && w && h;
  };
  const rulesForClass = (cls) => {
    const out = [];
    const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
    let m;
    while ((m = ruleRe.exec(cssText)) !== null) {
      const hit = m[1].split(',').some((sel) => new RegExp(`(^|[\\s>+~])\\.${escapeRegExp(cls)}$`).test(sel.trim()));
      if (hit) out.push(m[2]);
    }
    return out.join(';');
  };
  // 1) <img> で全面のもの
  const imgTags = [...sectionHtml.matchAll(/<img\b[^>]*>/gi)].map((x) => x[0]);
  for (const tag of imgTags) {
    const inline = (tag.match(/style\s*=\s*["']([^"']*)["']/i) || ['', ''])[1];
    if (isFullBleed(inline)) return true;
    const cls = ((tag.match(/class\s*=\s*["']([^"']*)["']/i) || ['', ''])[1]).trim().split(/\s+/).filter(Boolean);
    if (cls.some((c) => isFullBleed(rulesForClass(c)))) return true;
  }
  // 2) background:url(...) を持つ全面要素（クラス単位で判定）
  const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = ruleRe.exec(cssText)) !== null) {
    if (/background(-image)?\s*:[^;]*url\(/i.test(m[2]) && isFullBleed(m[2])) {
      // そのクラスが実際にセクション内で使われているか
      const cls = (m[1].match(/\.([A-Za-z0-9_-]+)\s*$/) || ['', ''])[1];
      if (cls && new RegExp(`class\\s*=\\s*["'][^"']*\\b${escapeRegExp(cls)}\\b`, 'i').test(sectionHtml)) return true;
    }
  }
  return false;
}

// 表紙のヒント（kind / pattern / 冒頭コメント / ファイル名）。該当すればその根拠を返す
function coverHint(filename, rawFragment, entry) {
  if (entry && entry.kind && /^(表紙|cover)$/i.test(entry.kind)) return `kind=${entry.kind}`;
  if (entry && entry.pattern && /^(SLIDE-PATTERN-)?cover-/i.test(entry.pattern)) return `pattern=${entry.pattern}`;
  const cm = rawFragment.match(/<!--([\s\S]*?)-->/); // 冒頭コメント（例: <!-- P100 cover-photo-overlay-center 準拠 -->）
  if (cm) {
    const pm = cm[1].match(/\b(cover-[a-z0-9-]+)/i);
    if (pm) return `コメント ${pm[1]}`;
  }
  const base = String(filename).replace(/^\d+[-_]?/, '').toLowerCase();
  if (/^cover([-_.]|$)/.test(base)) return `ファイル名 ${filename}`;
  return null;
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function injectBgAttrs(sectionHtml, on, bgAsset, inlineAssets) {
  // 非公開（slidekit-private）由来の素材は公開ギャラリーに存在しないため data-sk-bg-asset を付与しない。
  // 埋め込み（inlineAssets）時も、ビューア側が相対パスへ書き戻さないよう付けない。
  const useAttr = bgAsset && !bgAsset.isPrivate && !inlineAssets;
  const assetAttr = useAttr ? ` data-sk-bg-asset="${bgAsset.rel.replace(/["<>]/g, '')}"` : '';
  return sectionHtml.replace(/<section\b/i, `<section data-sk-bg="${on ? 'on' : 'off'}"${assetAttr}`);
}

function buildBackgroundCss(bgCssUrl) {
  if (!bgCssUrl) return '';
  return `
/* 背景画像レイヤー（deck-config.json の background）。パターン側の background 指定より下に敷く最下層。
   background-image だけを !important で上書きし、色・レイアウトには一切触れない（data-sk-bg="off" のスライドは従来どおり）。 */
section.slide[data-sk-bg="on"] { background-image:url("${bgCssUrl}") !important; background-size:cover !important; background-position:center !important; background-repeat:no-repeat !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }`;
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
    case 'd': // ドット＋英字ラベル型（`.sk-h` に data-label 属性でラベル文言を渡す）
      return `.sk-h { position:absolute; top:0; left:40px; right:40px; padding:16px 0 0; display:flex; flex-direction:column; align-items:flex-start; gap:4px; font-size:24px; font-weight:700; color:#333; }
.sk-h::before { content:"● " attr(data-label); font-size:12px; font-weight:700; color:var(--sk-accent); letter-spacing:.06em; }`;
    case 'a': // 全幅下線（既定）
    default:
      return `.sk-h { position:absolute; top:0; left:40px; right:40px; padding:24px 0 12px; border-bottom:2px solid var(--sk-accent); font-size:24px; font-weight:700; color:#333; }`;
  }
}

function buildCommonCss(config, bgCssUrl) {
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
/* ページ番号。内側に寄りすぎてコンテンツと重なるため外へ寄せた。
   2026-08-21: right:40/bottom:16 → 32/12 → さらに右20px・下4px 動かして 12/8（代表指示） */
.sk-pageno { position:absolute; right:12px; bottom:8px; font-size:12px; color:var(--sk-muted,#8A8F98); }

@page { size:960px 540px; margin:0; }
@media print {
  html, body { background:#fff; }
  body { display:block; gap:0; padding:0; }
  .slide { margin:0; box-shadow:none; scroll-snap-align:none; page-break-after:always; break-after:page; }
  .slide:last-child { page-break-after:auto; break-after:auto; }
}${buildBackgroundCss(bgCssUrl)}`;
}

function buildDocument(config, allStyles, sections, bgCssUrl) {
  const fontParam = config.font.replace(/\s+/g, '+');
  const commonCss = buildCommonCss(config, bgCssUrl);
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
