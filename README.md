# open-slide-slides

今後のスライドをopen-slideで作り、デッキを1つのリポジトリにまとめます。

- 基盤: `@open-slide/core` 2.0.1系、React、TypeScript、pnpm。
- 既定テーマ: `standard`。
- PDF非対応。

## 開く

Node.js 24とpnpmを用意します。

```sh
pnpm install --frozen-lockfile
pnpm dev
```

表示されたURLでデッキを選びます。矢印キーでページと段階表示を進められます。

## 新しいデッキを作る

Agentに「`standard`テーマを指定して、新しいデッキを作って」と依頼します。

- `create-slide` skillを使います。
- [themes/standard.md](themes/standard.md)を読みます。
- `slides/<kebab-caseのデッキid>/index.tsx`を作ります。
- テーマのトークンと部品をデッキ内へコピーします。
  - 理由: open-slideではデッキ間のコンポーネントを共有しません。
- 専用素材は`slides/<id>/assets/`へ置きます。
- 共有素材はリポジトリ直下の`assets/`へ置きます。

テーマのデモは開発UIのThemesで確認できます。

```sh
pnpm check:assets
pnpm typecheck
pnpm build:pages
pnpm preview:pages
```

公開時と同じbaseで確認します。表示されたホストの`/open-slide-slides/`を開くと一覧が表示されます。

## 公開

mainへpushすると、GitHub Actionsで素材形式の検査、型検査、`build:pages`を実行し、GitHub Pagesへdeployします。

- 公開先: https://tadashi-aikawa.github.io/open-slide-slides/
- `build:pages`はplayer-onlyでビルドします。
- 各デッキの`dist/s/<id>/index.html`を作ります。
  - 目的: デッキの直接リンクをHTTP 200で返すこと。
- ルートにはリンク一覧を生成します。
- `dist/404.html`も作ります。
  - 用途: 静的ホストで未解決のパスを開いた場合の予備。

埋め込みURLは次の形です。

```text
https://tadashi-aikawa.github.io/open-slide-slides/s/<デッキid>
```

公開版には一覧・編集UIを表示しません。スライドのページ指定は`?p=2`の形です。

## デッキ一覧

| デッキ | 公開URL | 移行元 |
| --- | --- | --- |
| KOKUKOKU紹介 | [kokukoku-intro](https://tadashi-aikawa.github.io/open-slide-slides/s/kokukoku-intro) | [slidev-kokukoku-intro](https://github.com/tadashi-aikawa/slidev-kokukoku-intro) |
| AI時代を生き抜くためにぼくらが変えたこと | [surviving-ai-era](https://tadashi-aikawa.github.io/open-slide-slides/s/surviving-ai-era) | [slidev-surviving-ai-era](https://github.com/tadashi-aikawa/slidev-surviving-ai-era) |

KOKUKOKUは[open-slide-sandbox](https://github.com/tadashi-aikawa/open-slide-sandbox)の移植版をそのまま使っています。専用の巻物デザインです。

surviving-ai-eraは`standard`で作り直しています。文言・順序・画像・図・段階表示を維持しています。

旧Slidev版の公開は残します。

## Agent向けの入口

- [AGENTS.md](AGENTS.md)
- [CLAUDE.md](CLAUDE.md)
- 同梱skill: `.agents/skills/`。
- Claude用の入口: `.claude/skills/`。

基盤設定の変更は明示的な依頼がある場合に行います。

## 素材の決まり

- ラスタ画像は**非可逆WebP**にします。
  - 禁止: PNG・JPEG・GIFなどを素材として置くこと。
  - 寸法: スライド上の最大表示寸法を超える画像は、縦横比を保って縮小します。
  - 品質: 実際の表示サイズで比較し、文字が読めて劣化が分からない範囲の最小容量を選びます。
- ベクター画像はSVGで構いません。
- 動画は**H.264のMP4**にし、圧縮してから置きます。
  - 再生互換性: `yuv420p`を指定します。
  - 配信: `+faststart`を指定します。
  - 音声: 不要なら`-an`で外します。必要なら音声を残してAACで圧縮します。
  - 採用条件: 再生中の画質を比較し、小さくなり劣化が分からない候補だけ差し替えます。

Homebrewの`webp`と`ffmpeg`で書き出します。以下の品質値は比較を始める目安です。

```sh
# 非可逆WebP。文字を含む画面写しでは先頭に -preset text を追加する。
cwebp -q 85 -m 6 -sharp_yuv input.png -o output.webp
# 最大表示幅が750pxの場合。元画像が750pxを超える場合だけ指定する。
cwebp -q 85 -m 6 -sharp_yuv -resize 750 0 input.png -o output.webp
# 音声不要の動画。CRFを上げると容量が減り、画質が下がる。
ffmpeg -i input.mp4 -map 0:v:0 -an -c:v libx264 -preset veryslow -crf 22 \
  -pix_fmt yuv420p -movflags +faststart -map_metadata -1 output.mp4
```

`-lossless`と`-near_lossless`は使いません。

`pnpm check:assets`は`slides/`と`assets/`を再帰的に調べ、禁止された画像・動画の拡張子を検出します。

- 検査範囲: 拡張子。WebPの圧縮方式、MP4のコーデック、容量と見た目は書き出し時に確認します。
- CI: `build:pages`の前に実行します。
- 管理場所: この節、`themes/standard.md`、ルートの`AGENTS.md`と`CLAUDE.md`。
  - 同期: これらは`pnpm sync:skills`の上書き対象ではありません。

## 参照

- [open-slide](https://github.com/open-slide/open-slide)
- [GitHub Pagesのカスタムworkflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [cwebpの公式オプション](https://developers.google.com/speed/webp/docs/cwebp)
- [FFmpegのlibx264オプション](https://ffmpeg.org/ffmpeg-codecs.html#libx264_002c-libx264rgb)
- [FFmpegのMP4書き出しオプション](https://ffmpeg.org/ffmpeg-formats.html#mov_002c-mp4_002c-ismv)
