import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const base = process.env.OPEN_SLIDE_BASE;
if (!base) throw new Error('OPEN_SLIDE_BASE が指定されていません。');
const entries = await readdir('slides', { withFileTypes: true });
const decks = [];
const escapeHtml = (value) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[char]));

// 一覧HTMLでplayerの入口を上書きする前に、各直リンクと404へ複製する。
await copyFile('dist/index.html', 'dist/404.html');
for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
  if (!entry.isDirectory()) continue;
  const source = await readFile(join('slides', entry.name, 'index.tsx'), 'utf8');
  const title = source.match(/export const meta[^=]*=\s*\{[\s\S]*?title:\s*['"]([^'"]+)['"]/)?.[1] ?? entry.name;
  const target = join('dist', 's', entry.name);
  await mkdir(target, { recursive: true });
  await copyFile('dist/index.html', join(target, 'index.html'));
  decks.push(`<li><a href="${base}s/${encodeURIComponent(entry.name)}">${escapeHtml(title)}</a></li>`);
}

await writeFile('dist/index.html', `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>スライド一覧 | open-slide-slides</title>
<style>body{font-family:system-ui,sans-serif;max-width:56rem;margin:4rem auto;padding:0 1.5rem;color:#595959;background:#fff}h1,a{color:#2a8058}li{margin:1.5rem 0;line-height:1.6}footer{margin-top:3rem;color:#6b717c}</style>
</head><body><h1>スライド一覧</h1><ul>${decks.join('\n')}</ul>
<footer>open-slide-slides · PDF非対応</footer></body></html>\n`);
