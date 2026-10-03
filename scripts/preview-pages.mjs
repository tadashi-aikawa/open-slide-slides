import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { parseArgs } from 'node:util';

const { values } = parseArgs({ options: {
  port: { type: 'string', default: '4173' },
  host: { type: 'string', default: '127.0.0.1' },
} });
const base = process.env.OPEN_SLIDE_BASE ?? '/open-slide-slides/';
const root = resolve('dist');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
};

// ViteのSPAフォールバックを使わず、Pagesと同じディレクトリの入口を配る。
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === base.slice(0, -1)) {
      response.writeHead(302, { Location: base }).end();
      return;
    }
    if (!pathname.startsWith(base)) {
      response.writeHead(404).end('Not found');
      return;
    }
    let file = resolve(root, pathname.slice(base.length));
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    let info;
    let status = 200;
    try {
      info = await stat(file);
      if (info.isDirectory()) {
        file = resolve(file, 'index.html');
        info = await stat(file);
      }
    } catch {
      status = 404;
      file = resolve(root, '404.html');
      info = await stat(file);
    }
    const headers = { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'Accept-Ranges': 'bytes' };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range && status === 200) {
      const start = Number(range[1]);
      const end = Math.min(range[2] ? Number(range[2]) : info.size - 1, info.size - 1);
      if (start > end) {
        response.writeHead(416, { 'Content-Range': `bytes */${info.size}` }).end();
        return;
      }
      response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${info.size}`, 'Content-Length': end - start + 1 });
      if (request.method === 'HEAD') response.end();
      else createReadStream(file, { start, end }).pipe(response);
    } else {
      response.writeHead(status, { ...headers, 'Content-Length': info.size });
      if (request.method === 'HEAD') response.end();
      else createReadStream(file).pipe(response);
    }
  } catch {
    response.writeHead(500).end('Build with pnpm build:pages first.');
  }
});
server.listen(Number(values.port), values.host, () => {
  console.log(`Pages preview: http://${values.host}:${values.port}${base}`);
});
