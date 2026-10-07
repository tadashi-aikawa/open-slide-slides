# open-slide-slides

[open-slide](https://github.com/open-slide/open-slide)で作るスライドを、1つのリポジトリにまとめています。

## 開く

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## 新しいデッキを作る

Agentに「`standard`テーマを指定して、新しいデッキを作って」と依頼します。テーマの定義は[themes/standard.md](themes/standard.md)です。

`index.tsx` に概要の `summary` と発表日の `meta.date` を必ず書きます。

- 書式: `date` は実在する日付を `YYYY-MM-DD` で指定します。

```tsx
export const summary = '概要の1文';
export const meta: SlideMeta & { date: string } = {
  title: 'デッキの題',
  date: '2026-09-14',
};
```

Chromeと`cwebp`がある手元で `pnpm covers <id>` を実行します。1枚目を変えたら撮り直します。

素材の決まりは[AGENTS.md](AGENTS.md)にあります。画像は非可逆WebP、動画は圧縮したH.264のMP4だけを置きます。CIの`pnpm check:assets`がそれ以外を止めます。

公開時と同じURLで確かめるには、次を実行します。

```sh
pnpm build:pages
pnpm preview:pages
```

## 公開

mainへpushすると、GitHub ActionsがGitHub Pagesへ公開します。

- 一覧: https://tadashi-aikawa.github.io/open-slide-slides/
- 埋め込みURL: `https://tadashi-aikawa.github.io/open-slide-slides/s/<デッキid>/`
- PDFには対応していません

一覧は発表日の新しい順に並びます。プレイヤーの直リンクにはデッキごとのOGPが付きます。

`pnpm build:pages` はローカルの連携先向けに `dist/decks.json` も出力します。

- 形式: 発表日の新しい順に並ぶ配列です。
- フィールド:
  - `id`
  - `title`
  - `summary`
  - `date`
  - `cover`: カバーの絶対URL

## デッキ

- [KOKUKOKU紹介](https://tadashi-aikawa.github.io/open-slide-slides/s/kokukoku-intro/)
- [AI時代を生き抜くためにぼくらが変えたこと](https://tadashi-aikawa.github.io/open-slide-slides/s/surviving-ai-era/)
