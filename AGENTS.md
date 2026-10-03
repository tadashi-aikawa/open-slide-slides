# open-slide — Agent Guide

You are authoring **slides** in this repo. Every slide is arbitrary React code that you write.

## Hard rules

- Put your slide under `slides/<kebab-case-id>/`.
- The entry is `slides/<id>/index.tsx`.
- 一覧に出す概要を `index.tsx` の `export const summary = '概要の1文';` に書く。
  - 書式: `summary` は上の形で独立した行に書く。`summary` と `meta.title` は単一行の引用符付き文字列リテラルにする。エスケープ・テンプレートリテラル・式は使わない。
- 新しいデッキを作ったら `pnpm covers <id>` で `slides/<id>/cover.webp` を生成し、デッキと一緒にコミットする。
  - 条件: 1枚目を変えたら撮り直す。
  - 必要: 手元のChromeと`cwebp`。Chromeの場所は `CHROME_PATH` でも指定できる。
- Put slide-specific images/videos/fonts under `slides/<id>/assets/`. For assets reused across decks or themes (logos, avatars), use the global `assets/` folder and import via `@assets/...`.
- Do **not** touch `package.json`, `open-slide.config.ts`, or other slides.
- Do not add dependencies. Use only `react` and standard web APIs.
- ラスタ画像は非可逆WebPのみ。
  - 禁止: PNG・JPEG・GIFなどを置くこと。
  - 寸法: 最大表示寸法を超える画像は縦横比を保って縮める。
- ベクター画像はSVGでよい。
- 動画は圧縮したH.264のMP4のみ。
  - 設定: `yuv420p`と`+faststart`を指定する。
  - 音声: 不要なら外す。
- 実際の表示サイズと動画再生中のコマを比較し、劣化が分からない最小容量を選ぶ。
- 推奨の書き出しコマンド:
  - 画像: `cwebp -q 85 -m 6 -sharp_yuv input.png -o output.webp`
  - 動画: `ffmpeg -i input.mp4 -an -c:v libx264 -preset veryslow -crf 22 -pix_fmt yuv420p -movflags +faststart output.mp4`
- 素材を追加・変更したら`pnpm check:assets`を実行する。

## Which skill to use

- **Drafting a new deck** — use the `create-slide` skill. It walks through scoping questions, structure, and hand-off.
- **Applying inspector comments** (`@slide-comment` markers in a page) — use the `apply-comments` skill.
- **Creating or extracting a theme** — use the `create-theme` skill. Themes live as markdown under `themes/<id>.md` and are read by `create-slide` before authoring.
- **Resolving "this page" / "this element"** — when the user references the current slide or selection without naming it, consult the `current-slide` skill. It reads the dev server's `node_modules/.open-slide/current.json` to find which slide, page, and inspector-picked element they mean.
- **Writing a speech script / speaker notes** — use the framework's built-in feature: the `notes` export in the slide's `index.tsx`, index-aligned with the page array and shown in the presenter view. See the **Speaker notes** section of the `slide-authoring` skill. Never deliver a script as a markdown or text file.
- **Any other slide edit** — read the `slide-authoring` skill before writing. It is the technical reference for everything inside `slides/<id>/`: file contract, the 1920×1080 canvas, type scale, palette, layout, assets, self-review checklist, and anti-patterns. `create-slide` and `apply-comments` both defer to it for the *how*.

Keep this file short: hard rules only. All deeper guidance lives in the skills above.

## Updating skills

The skills above are managed by `@open-slide/core`. Do not edit them in place. To pull the latest versions:

```
pnpm up @open-slide/core
pnpm sync:skills
```

`pnpm dev` will also detect drift on startup and offer to sync. `pnpm sync:skills --dry-run` (via `pnpm exec open-slide sync:skills --dry-run`) previews changes without writing.
