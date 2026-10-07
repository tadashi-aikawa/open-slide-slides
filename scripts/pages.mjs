import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.env.OPEN_SLIDE_BASE;
if (!base) throw new Error('OPEN_SLIDE_BASE が指定されていません。');
const site = new URL(base, 'https://tadashi-aikawa.github.io');
// scripts/covers.mjsで生成するカバーの寸法。
const coverWidth = 672;
const coverHeight = 378;
const entries = await readdir('slides', { withFileTypes: true });
const decks = [];
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

// AGENTS.mdに定めた単一行の文字列リテラルを読む。式やエスケープは評価しない。
for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isDirectory()) continue;
  const directory = join('slides', entry.name);
  const source = await readFile(join(directory, 'index.tsx'), 'utf8');
  const meta = source.match(/^export const meta[^=]*=\s*\{([^}]+)\}/m)?.[1] ?? '';
  const title = meta.match(/\btitle:\s*(['"])((?:(?!\1)[^\\\r\n])+)\1/)?.[2] ?? entry.name;
  const date = meta.match(/\bdate:\s*(['"])(\d{4}-\d{2}-\d{2})\1\s*(?=,|$)/)?.[2];
  const summary = source.match(/^export const summary\s*=\s*(['"])((?:(?!\1)[^\\\r\n])+)\1\s*;\s*$/m)?.[2];
  if (!summary?.trim()) {
    throw new Error(`${directory}/index.tsx: export const summary = '概要の1文'; が必要です。`);
  }
  if (!date || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error(`${directory}/index.tsx: meta.date に実在する発表日を 'YYYY-MM-DD' で指定してください。`);
  }
  const cover = join(directory, 'cover.webp');
  try {
    const info = await stat(cover);
    if (!info.isFile() || info.size === 0) throw new Error('画像が空です');
  } catch {
    throw new Error(`${cover} がありません。pnpm covers ${entry.name} を実行してください。`);
  }
  decks.push({ id: entry.name, title, summary, date, cover });
}
decks.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

// 一覧HTMLでplayerの入口を上書きする前に、各直リンクと404へ複製する。
await copyFile('dist/index.html', 'dist/404.html');
const player = await readFile('dist/index.html', 'utf8');
const cards = [];
const catalog = [];
for (const { id, title, summary, date, cover } of decks) {
  const target = join('dist', 's', id);
  await mkdir(target, { recursive: true });
  const path = `${base}s/${encodeURIComponent(id)}/`;
  const url = new URL(path, site).href;
  const image = new URL('cover.webp', url).href;
  const metadata = `<meta name="description" content="${escapeHtml(summary)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(summary)}">
<meta property="og:image" content="${escapeHtml(image)}">
<meta property="og:image:width" content="${coverWidth}">
<meta property="og:image:height" content="${coverHeight}">
<meta property="og:image:alt" content="${escapeHtml(title)}">
<meta property="og:url" content="${escapeHtml(url)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">`;
  await writeFile(join(target, 'index.html'), player
    .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
    .replace('</head>', () => `${metadata}\n</head>`));
  await copyFile(cover, join(target, 'cover.webp'));
  catalog.push({ id, title, summary, date, cover: image });
  cards.push(`<li><a class="card" href="${escapeHtml(path)}">
<img src="${escapeHtml(path)}cover.webp" alt="" width="${coverWidth}" height="${coverHeight}">
<h2>${escapeHtml(title)}</h2><time datetime="${date}">${date}</time><p>${escapeHtml(summary)}</p>
</a></li>`);
}
await writeFile('dist/decks.json', `${JSON.stringify(catalog, null, 2)}\n`);

await writeFile('dist/index.html', `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>スライド一覧 | open-slide-slides</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box}
body{margin:0;background:#fff;color:#595959;font-family:"Noto Sans JP",sans-serif;letter-spacing:.035em;line-height:1.5}
main,footer{max-width:1120px;margin:0 auto}
body{padding:64px 24px 32px}
h1{margin:0 0 40px;color:#2a8058;font-size:32px;line-height:1.25}
ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px 32px;list-style:none;margin:0;padding:0}
.card{display:block;height:100%;color:inherit;text-decoration:none;border-radius:12px}
.card img{display:block;width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border:1px solid #dce4df;border-radius:12px}
.card h2{margin:20px 0 12px;color:#2a8058;font-size:22px;line-height:1.5;overflow-wrap:anywhere}
.card p{margin:0;font-size:16px;line-height:1.8;overflow-wrap:anywhere}
.card time{display:block;margin-bottom:12px;color:#6b717c;font-size:14px}
.card:hover h2{text-decoration:underline;text-underline-offset:4px}
.card:hover img{border-color:#2a8058}
.card:focus-visible{outline:3px solid #2a8058;outline-offset:8px}
footer{padding-top:56px;color:#6b717c;font-size:14px}
@media(max-width:719px){body{padding-top:32px}h1{font-size:28px;margin-bottom:28px}ul{grid-template-columns:minmax(0,1fr);gap:36px}.card h2{font-size:20px;margin-top:16px}footer{padding-top:40px}}
</style>
</head><body><main><h1>スライド一覧</h1><ul>${cards.join('\n')}</ul></main>
<footer>open-slide-slides · PDF非対応</footer></body></html>\n`);
