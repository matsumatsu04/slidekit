// SlideKit ギャラリー共通カラーパレット定義
// 各パレットは「メイン / アクセント / ベース / フォント」の4色構成。
// - main   : 装飾の主色（--sk-accent として注入。下線・バー・帯・番号など）
// - accent : 差し色（--sk-accent2 として注入。デッキ側で「ここぞの1箇所」に使う）
// - base   : 淡い面の色（--sk-soft として注入。カード地・背景図形など）
// - font   : 全パレット共通 #333333（パターンHTML側で固定済み）
// 名前は色由来の中立名のみを使う（由来・用途がわかる固有名詞は入れない）。
const SK_PALETTES = [
  { key: 'minimal-blue', label: 'ミニマルブルー',     main: '#2F6BFF', accent: '#1A1A1A', base: '#F4F5F7' },
  { key: 'navy',         label: 'ネイビー',           main: '#1F3A5F', accent: '#4A6A8F', base: '#EEF2F7' },
  { key: 'terracotta',   label: 'テラコッタ',         main: '#A6572E', accent: '#9B938A', base: '#EFE6D8' },
  { key: 'violet-pink',  label: 'バイオレット',       main: '#635BFF', accent: '#FF5CA8', base: '#EEEDFF' },
  { key: 'blue-pink',    label: 'ブルー×ピンク',      main: '#2B4894', accent: '#D72550', base: '#E8EEF7' },
  { key: 'navy-gold',    label: 'ネイビー×ゴールド',  main: '#1E2E53', accent: '#FED307', base: '#E8EBF2' },
];
const SK_FONT_COLOR = '#333333';

function skFindPalette(key) {
  return SK_PALETTES.find(p => p.key === key) || null;
}

// iframe等のドキュメントルートにパレットを注入する（pal=nullでグレーに戻す）
function skApplyPaletteVars(root, pal) {
  if (!root) return;
  if (pal) {
    root.style.setProperty('--sk-accent', pal.main);
    root.style.setProperty('--sk-soft', pal.base);
    root.style.setProperty('--sk-accent2', pal.accent);
  } else {
    root.style.removeProperty('--sk-accent');
    root.style.removeProperty('--sk-soft');
    root.style.removeProperty('--sk-accent2');
  }
}

// パレット選択チップ（4色ドット付き）を container に描画する
// onSelect(palOrNull) が選択時に呼ばれる。activeKey===null はグレー状態。
function skRenderPaletteChips(container, activeKey, onSelect) {
  container.innerHTML = '';
  SK_PALETTES.forEach(pal => {
    const b = document.createElement('button');
    b.className = 'pal-chip' + (pal.key === activeKey ? ' active' : '');
    b.dataset.key = pal.key;
    b.title = `メイン ${pal.main} ／ アクセント ${pal.accent} ／ ベース ${pal.base} ／ フォント ${SK_FONT_COLOR}`;
    b.innerHTML = `<span class="dots">` +
      [pal.main, pal.accent, pal.base, SK_FONT_COLOR].map(c => `<span class="d" style="background:${c}"></span>`).join('') +
      `</span><span>${pal.label}</span>`;
    b.addEventListener('click', () => onSelect(pal));
    container.appendChild(b);
  });
}
