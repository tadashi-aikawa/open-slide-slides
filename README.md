# open-slide-slides

[open-slide](https://github.com/open-slide/open-slide)で作るスライドを、1つのリポジトリにまとめています。

## 開く

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## 新しいデッキを作る

Agentに「`standard`テーマを指定して、新しいデッキを作って」と依頼します。テーマの定義は[themes/standard.md](themes/standard.md)です。

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

## デッキ

| デッキ | 移行元 |
| --- | --- |
| [KOKUKOKU紹介](https://tadashi-aikawa.github.io/open-slide-slides/s/kokukoku-intro/) | [slidev-kokukoku-intro](https://github.com/tadashi-aikawa/slidev-kokukoku-intro) |
| [AI時代を生き抜くためにぼくらが変えたこと](https://tadashi-aikawa.github.io/open-slide-slides/s/surviving-ai-era/) | [slidev-surviving-ai-era](https://github.com/tadashi-aikawa/slidev-surviving-ai-era) |
