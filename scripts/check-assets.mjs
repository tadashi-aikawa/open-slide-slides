import { readdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const raster = new Set([
  '.png', '.apng', '.jpg', '.jpeg', '.jpe', '.jfif', '.gif', '.bmp', '.dib',
  '.tif', '.tiff', '.avif', '.heic', '.heif', '.ico', '.cur', '.psd', '.jxl',
  '.jp2', '.j2k', '.jpf', '.jpx', '.pnm', '.pbm', '.pgm', '.ppm', '.tga',
  '.dds', '.exr', '.hdr', '.raw', '.cr2', '.nef', '.arw', '.dng', '.qoi',
]);
const video = new Set([
  '.mov', '.webm', '.mkv', '.avi', '.m4v', '.mpg', '.mpeg', '.mpe', '.m2v',
  '.wmv', '.flv', '.f4v', '.ogv', '.ogg', '.3gp', '.3g2', '.mts',
  '.m2ts', '.vob', '.asf', '.mxf', '.mjpeg', '.mjpg',
]);

async function scan(directory) {
  let entries;
  try {
    entries = await readdir(join(root, directory), { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT' && ['slides', 'assets'].includes(directory)) return [];
    throw error;
  }
  const violations = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      violations.push(...await scan(path));
      continue;
    }
    const extension = extname(entry.name).toLowerCase();
    if (raster.has(extension)) violations.push(`${path}: ラスタ画像は非可逆WebPへ変換してください`);
    if (video.has(extension)) violations.push(`${path}: 動画は圧縮したH.264のMP4へ変換してください`);
  }
  return violations;
}

const violations = [...await scan('slides'), ...await scan('assets')];
if (violations.length > 0) {
  console.error(`素材形式の違反が${violations.length}件あります:\n${violations.map(message => `- ${message}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('素材形式OK: slides/ と assets/ に禁止された画像・動画形式はありません。');
}
