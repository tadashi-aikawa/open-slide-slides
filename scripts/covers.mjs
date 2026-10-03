import { execFile } from 'node:child_process';
import { constants, createReadStream } from 'node:fs';
import { access, mkdtemp, readdir, rename, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { chromium } from 'playwright-core';

const run = promisify(execFile);
const root = fileURLToPath(new URL('../', import.meta.url));
const cli = join(root, 'node_modules/@open-slide/core/bin.js');
// 719px以下の1列表示でも画像幅は最大671px。縦横比を保ち672×378へ縮める。
const coverWidth = 672;
const coverHeight = 378;
// 一覧の表示サイズでq=60/70/80を比較し、細部を保つ最小の候補を選んだ。
const coverQuality = 70;

async function serve(directory) {
  const mime = {
    '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.ico': 'image/x-icon',
  };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = /^\/s\/[^/]+\/?$/.test(pathname)
        ? join(directory, 'index.html') : resolve(directory, `.${pathname}`);
      if (!file.startsWith(directory + sep)) {
        response.writeHead(403).end();
        return;
      }
      const info = await stat(file);
      if (!info.isFile()) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream', 'Content-Length': info.size });
      createReadStream(file).on('error', () => response.destroy()).pipe(response);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return server;
}

async function findChrome() {
  const paths = process.env.CHROME_PATH ? [process.env.CHROME_PATH] : [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    join(process.env.HOME ?? '', 'Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome',
    ...['PROGRAMFILES', 'PROGRAMFILES(X86)', 'LOCALAPPDATA'].filter(key => process.env[key])
      .map(key => join(process.env[key], 'Google/Chrome/Application/chrome.exe')),
  ];
  for (const path of paths) {
    try {
      await access(path, constants.X_OK);
      return path;
    } catch { /* 次の候補を調べる。 */ }
  }
  throw new Error('Chromeが見つかりません。Google Chromeをインストールするか、CHROME_PATHに実行ファイルの絶対パスを指定してください。');
}

async function settlePage(page) {
  const canvas = page.locator('[data-osd-canvas]').first();
  await canvas.waitFor({ state: 'visible' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode()));
    // CSSの背景画像も待つ。
    const urls = new Set();
    for (const element of document.querySelectorAll('[data-osd-canvas], [data-osd-canvas] *')) {
      for (const match of getComputedStyle(element).backgroundImage.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        urls.add(match[1]);
      }
    }
    await Promise.all([...urls].map(url => {
      const image = new Image();
      image.src = url;
      return image.decode();
    }));
    // 有限の演出は完了まで待つ。ループは撮影時に静止させる。
    await Promise.all(document.getAnimations().filter(animation =>
      animation.effect?.getComputedTiming().iterations !== Infinity
    ).map(animation => animation.finished.catch(() => {})));
    await Promise.all([...document.querySelectorAll('video')].map(async video => {
      if (video.readyState < 2) {
        await new Promise((resolve, reject) => {
          video.addEventListener('loadeddata', resolve, { once: true });
          video.addEventListener('error', () => reject(new Error('動画の読み込みに失敗しました。')), { once: true });
          video.load();
        });
      }
    }));
  });
  // 遅れて始まる演出や動画の冒頭を待つ。
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    for (const video of document.querySelectorAll('video')) video.pause();
  });
  return canvas;
}

async function main() {
  const entries = await readdir(join(root, 'slides'), { withFileTypes: true });
  const available = entries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  const ids = process.argv.length > 2 ? [...new Set(process.argv.slice(2))] : available;
  for (const id of ids) {
    if (!available.includes(id)) throw new Error(`デッキ「${id}」がありません。候補: ${available.join(', ')}`);
    await access(join(root, 'slides', id, 'index.tsx'));
  }
  if (!ids.length) throw new Error('slides/ にデッキがありません。');
  const executablePath = await findChrome();
  try {
    await run('cwebp', ['-version']);
  } catch {
    throw new Error('cwebpが見つかりません。WebPのコマンドラインツールをインストールしてください。macOSでは brew install webp を使えます。');
  }

  const temp = await mkdtemp(join(tmpdir(), 'open-slide-covers-'));
  let server;
  let browser;
  let interrupted = false;
  const stop = async () => {
    await browser?.close().catch(() => {});
    if (server?.listening) {
      await new Promise(resolve => server.close(resolve));
    }
  };
  const onSignal = () => {
    interrupted = true;
    void stop();
  };
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  try {
    // 開発モードはUIを強制表示するため、本番用playerを一時ディレクトリにビルドする。
    const site = join(temp, 'site');
    console.log('撮影用playerをビルドしています。');
    await run(process.execPath, [cli, 'build', '--out-dir', site], {
      cwd: root,
      env: { ...process.env, OPEN_SLIDE_BASE: '/', OPEN_SLIDE_PLAYER_ONLY: '1' },
      maxBuffer: 4 * 1024 * 1024,
      timeout: 120000,
    });
    if (interrupted) throw new Error('撮影を中断しました。');
    // 空きポートをOSに選ばせる。dist/や既存のサーバーには触れない。
    server = await serve(site);
    const port = server.address().port;
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(30000);
    for (const id of ids) {
      if (interrupted) throw new Error('撮影を中断しました。');
      console.log(`撮影: ${id}`);
      await page.goto(`http://127.0.0.1:${port}/s/${encodeURIComponent(id)}?p=1`, { waitUntil: 'networkidle' });
      let timeout;
      let canvas;
      try {
        canvas = await Promise.race([
          settlePage(page),
          new Promise((_, reject) => {
            timeout = setTimeout(() => reject(new Error(`${id}: フォント・画像・動画・演出の待機がタイムアウトしました。`)), 30000);
          }),
        ]);
      } finally {
        clearTimeout(timeout);
      }
      const box = await canvas.boundingBox();
      if (!box || Math.abs(box.width - 1920) > 0.5 || Math.abs(box.height - 1080) > 0.5) {
        throw new Error(`${id}: 1920×1080のキャンバスを取得できませんでした。`);
      }
      const png = join(temp, `${id}.png`);
      await canvas.screenshot({ path: png, animations: 'disabled' });
      const destination = join(root, 'slides', id, 'cover.webp');
      const pending = join(root, 'slides', id, `.cover-${process.pid}.pending.webp`);
      try {
        await run('cwebp', ['-quiet', '-resize', String(coverWidth), String(coverHeight), '-q', String(coverQuality), '-m', '6', '-sharp_yuv', png, '-o', pending], { timeout: 30000 });
        await rename(pending, destination);
      } finally {
        await rm(pending, { force: true });
      }
      console.log(`保存: slides/${id}/cover.webp (${coverWidth}×${coverHeight}, ${(await stat(destination)).size} bytes)`);
    }
  } finally {
    await stop();
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
    await rm(temp, { recursive: true, force: true });
  }
}

main().catch(error => {
  console.error(`カバー撮影に失敗しました: ${error.message}`);
  process.exitCode = 1;
});
