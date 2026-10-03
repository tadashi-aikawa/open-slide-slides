import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.env.OPEN_SLIDE_BASE;
if (!base) throw new Error('OPEN_SLIDE_BASE が指定されていません。');
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
  const title = source.match(/export const meta[^=]*=\s*\{[\s\S]*?title:\s*(['"])((?:(?!\1)[^\\\r\n])+)\1/)?.[2] ?? entry.name;
  const summary = source.match(/^export const summary\s*=\s*(['"])((?:(?!\1)[^\\\r\n])+)\1\s*;\s*$/m)?.[2];
  if (!summary?.trim()) {
    throw new Error(`${directory}/index.tsx: export const summary = '概要の1文'; が必要です。`);
  }
  const cover = join(directory, 'cover.webp');
  try {
    const info = await stat(cover);
    if (!info.isFile() || info.size === 0) throw new Error('画像が空です');
  } catch {
    throw new Error(`${cover} がありません。pnpm covers ${entry.name} を実行してください。`);
  }
  decks.push({ id: entry.name, title, summary, cover });
}

// 一覧HTMLでplayerの入口を上書きする前に、各直リンクと404へ複製する。
await copyFile('dist/index.html', 'dist/404.html');
const cards = [];
for (const { id, title, summary, cover } of decks) {
  const target = join('dist', 's', id);
  await mkdir(target, { recursive: true });
  await copyFile('dist/index.html', join(target, 'index.html'));
  await copyFile(cover, join(target, 'cover.webp'));
  const url = escapeHtml(`${base}s/${encodeURIComponent(id)}/`);
  cards.push(`<li><a class="card" href="${url}">
<img src="${url}cover.webp" alt="" width="672" height="378">
<h2>${escapeHtml(title)}</h2><p>${escapeHtml(summary)}</p>
</a></li>`);
}

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
.card:hover h2{text-decoration:underline;text-underline-offset:4px}
.card:hover img{border-color:#2a8058}
.card:focus-visible{outline:3px solid #2a8058;outline-offset:8px}
footer{padding-top:56px;color:#6b717c;font-size:14px}
@media(max-width:719px){body{padding-top:32px}h1{font-size:28px;margin-bottom:28px}ul{grid-template-columns:minmax(0,1fr);gap:36px}.card h2{font-size:20px;margin-top:16px}footer{padding-top:40px}}
</style>
</head><body><main><h1>スライド一覧</h1><ul>${cards.join('\n')}</ul></main>
<footer>open-slide-slides · PDF非対応</footer></body></html>\n`);
