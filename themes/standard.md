---
name: Standard
description: 白地と緑、Noto Sans JPで伝える既定テーマ
mode: light
---

# Standard

PDF非対応。

## 素材

- ラスタ画像は非可逆WebPのみ。PNG・JPEG・GIFなどは置かない。
  - 寸法: 最大表示寸法を超える画像は、縦横比を保って縮小する。
  - 品質: 実際の表示サイズで文字の可読性と画質を確認し、劣化が分からない最小容量を選ぶ。
- ベクター画像はSVGでよい。
- 動画は圧縮したH.264のMP4のみ。
  - 設定: `yuv420p`と`+faststart`を指定する。
  - 音声: 不要なら外す。必要ならAACで圧縮して残す。
  - 採用: 再生中のコマを比較し、小さくなり劣化が分からない候補だけ差し替える。

```sh
cwebp -q 85 -m 6 -sharp_yuv input.png -o output.webp
ffmpeg -i input.mp4 -an -c:v libx264 -preset veryslow -crf 22 \
  -pix_fmt yuv420p -movflags +faststart output.mp4
```

- 調整: 品質値は比較の開始点。文字を含む画像では`cwebp`の先頭に`-preset text`を追加する。
- 縮小: `cwebp`へ`-resize <最大表示幅> 0`を追加する。元画像の幅が表示幅以下なら縮小しない。
- 禁止: `-lossless`と`-near_lossless`。
- 検査: 素材を追加・変更したら`pnpm check:assets`を実行する。

## Palette

| Role | Value | 用途 |
| --- | --- | --- |
| bg | `#ffffff` | 背景と反転文字 |
| text | `#595959` | 本文 |
| accent | `#3db680` | 塗りと線 |
| greenText | `#2a8058` | 緑の文字 |
| dimmed / muted | `#6b717c` | 補足文字 |
| secondary | `#ce579b` | em強調のみ |
| dimmedBg | `#f8f6f1` | 淡地 |
| dark | `#12141a` | 転換点の暗地 |
| darkDimmed | `#c5c9d1` | 暗地の補足文字 |

派生色も以下のトークンで固定する。図で危険や戻り方向を強調するときは実要素の `<em>` にピンクを適用する。ピンクの線と面はこの強調の補助に限る。

## Typography

- 見出しと本文: Noto Sans JP。
- ウェイト: 400と700。
- 文字間隔: 0.035em。
- 行間: 見出し1.25、本文1.5。
- 同梱skillの既定値を次の値で上書きする。
  - 表紙98px、h1 58px、fact 68px。
  - ヘッドライン110px、md 89px、sm 61px。
  - 見出しの太さ700。既定の800〜900は使わない。
  - 本文44px、下限36px。
  - 補足の下限28px。
  - 例外: ページ番号と出典だけ24px。

フォントはデッキidをキーに一度だけheadへ追加する。新しいデッキでは `FONT_LINK_ID` の末尾を変える。

```tsx
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap';
const FONT_LINK_ID = 'osd-webfont-surviving-ai-era';
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
}
```

## Layout

- キャンバス: 1920×1080。
- 余白: 上下56px、左右112px。
  - 上書き: 同梱skillの100〜160pxを使わない。
- 左揃え。中央揃えはfact型だけ。
- 内容の寸法は次のトークンから選ぶ。
- トークンの定義箇所を除き、色とpx寸法の数値を直書きしない。
- 比率によるgrid、全幅、SVGの座標、角度は構造の値として扱う。

```tsx
export const design: DesignSystem = {
  palette: { bg: '#ffffff', text: '#595959', accent: '#3db680' },
  fonts: {
    display: '"Noto Sans JP", sans-serif',
    body: '"Noto Sans JP", sans-serif',
  },
  typeScale: { hero: 98, body: 44 },
  radius: 18,
};

const color = {
  greenText: '#2a8058',
  dimmed: '#6b717c',
  secondary: '#ce579b',
  dimmedBg: '#f8f6f1',
  dark: '#12141a',
  darkDimmed: '#c5c9d1',
  softGreen: 'color-mix(in srgb, var(--osd-accent) 14%, var(--osd-bg))',
  softPink: 'color-mix(in srgb, #ce579b 10%, var(--osd-bg))',
  visualWash:
    'linear-gradient(95deg, rgba(248,246,241,.94) 0%, rgba(248,246,241,.72) 38%, rgba(248,246,241,0) 62%)',
  darkWash: 'linear-gradient(95deg, rgba(18,20,26,.96) 0%, rgba(18,20,26,.78) 38%, rgba(18,20,26,.12) 62%)',
};
const type = {
  heading: 58, fact: 68, headline: 110, headlineMd: 89, headlineSm: 61,
  bodyMin: 36, caption: 28, footer: 24,
};
const space = {
  none: 0, xs: 8, sm: 16, md: 24, lg: 32, xl: 48, xxl: 64, huge: 96, y: 56, x: 112,
};
const shape = {
  line: 2, rule: 4, badge: 96, lane: 80, task: 120, portrait: 160,
  ruleWidth: 280, imageColumn: 645, thumbnail: 180, favicon: 32, codeLines: 18,
};
const weight = { normal: 400, bold: 700 };
const leading = { heading: 1.25, body: 1.5, relaxed: 1.7 };
const tracking = { body: '0.035em', label: '0.1em' };
const mono = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
```

## Fixed components

以下の型とフックをimportする。

- react: `CSSProperties` と `ReactNode`。
- @open-slide/core: `DesignSystem`、`Page`、`useSlidePageNumber`。

以下の部品をデッキ内にコピーする。

### Title / Footer / Eyebrow / Shell

```tsx
const titleStyle: CSSProperties = {
  fontSize: type.heading,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  margin: space.none,
  color: color.greenText,
};
const footerStyle: CSSProperties = {
  position: 'absolute',
  right: space.x,
  top: space.md,
  fontSize: type.footer,
  color: color.dimmed,
};
const eyebrowStyle: CSSProperties = {
  position: 'absolute',
  left: space.x,
  top: space.md,
  fontSize: type.caption,
  fontWeight: weight.bold,
  letterSpacing: tracking.label,
  color: color.dimmed,
};
const shellStyle: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  padding: `${space.y}px ${space.x}px`,
  background: 'var(--osd-bg)',
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  fontSize: 'var(--osd-size-body)',
  letterSpacing: tracking.body,
  lineHeight: leading.body,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};
const Title = ({ children }: { children: ReactNode }) => (
  <h1 style={titleStyle}>
    {children}
  </h1>
);
const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <footer style={footerStyle}>
      {current} / {total}
    </footer>
  );
};
const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={eyebrowStyle}>
    {children}
  </div>
);
const Shell = ({ children, center = false }: { children: ReactNode; center?: boolean }) => (
  <div style={{ ...shellStyle, textAlign: center ? 'center' : 'left' }}>
    {children}
    <Footer />
  </div>
);
```

### ChapterDivider / Conclusion / Refer / Bubble / Callout / BulletList / NumberedList / CodeBlock

```tsx
const conclusionStyle: CSSProperties = {
  borderTop: `${shape.rule}px solid var(--osd-accent)`,
  paddingTop: space.lg,
  marginTop: space.xl,
  fontSize: type.headlineSm,
  fontWeight: weight.bold,
  color: color.greenText,
};
const referStyle: CSSProperties = { marginTop: space.lg, fontSize: type.footer, color: color.dimmed };
const bubbleStyle: CSSProperties = { display: 'flex', alignItems: 'flex-start', gap: space.lg };
const portraitStyle: CSSProperties = { width: shape.portrait, height: shape.portrait, objectFit: 'contain' };
const bubbleBodyStyle: CSSProperties = {
  position: 'relative',
  padding: space.lg,
  background: color.dimmedBg,
  borderRadius: 'var(--osd-radius)',
};
const bubbleTailStyle: CSSProperties = {
  position: 'absolute',
  left: -space.sm,
  top: space.lg,
  width: space.lg,
  height: space.lg,
  background: color.dimmedBg,
  transform: 'rotate(45deg)',
};
const captionStyle: CSSProperties = { fontSize: type.caption, color: color.dimmed };
const calloutStyle: CSSProperties = {
  borderLeft: `${shape.rule}px solid var(--osd-accent)`,
  padding: space.lg,
  background: color.dimmedBg,
  borderRadius: 'var(--osd-radius)',
};
const calloutTitleStyle: CSSProperties = { color: color.greenText, fontWeight: weight.bold };
const calloutBodyStyle: CSSProperties = { marginTop: space.sm };
const listStyle: CSSProperties = { listStyle: 'none', margin: space.lg, padding: space.none };
const bulletItemStyle: CSSProperties = { display: 'flex', gap: space.md, marginBottom: space.md };
const numberedItemStyle: CSSProperties = { ...bulletItemStyle, alignItems: 'center' };
const greenTextStyle: CSSProperties = { color: color.greenText };
const numberBadgeStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minWidth: shape.badge,
  height: shape.badge,
  border: `${shape.line}px solid var(--osd-accent)`,
  borderRadius: '50%',
  color: color.greenText,
};
const codeBlockStyle: CSSProperties = {
  margin: space.none,
  padding: space.lg,
  background: color.dimmedBg,
  border: `${shape.line}px solid var(--osd-accent)`,
  borderRadius: 'var(--osd-radius)',
  fontFamily: mono,
  fontSize: type.caption,
  lineHeight: leading.body,
  whiteSpace: 'pre-wrap',
};

const ChapterDivider = ({ chapters, active }: { chapters: string[]; active: number }) => (
  <Shell>
    <Title>Chapter {active}</Title>
    <NumberedList
      items={chapters.map((chapter, index) => (
        <span style={{ color: index + 1 === active ? color.greenText : color.dimmed }}>
          {chapter}
        </span>
      ))}
    />
  </Shell>
);
const Conclusion = ({ children }: { children: ReactNode }) => (
  <div style={conclusionStyle}>
    {children}
  </div>
);
const Refer = ({ children }: { children: ReactNode }) => (
  <div style={referStyle}>
    <span>出典: </span>
    {children}
  </div>
);
const Bubble = ({ image, name, children }: { image: string; name: string; children: ReactNode }) => (
  <div style={bubbleStyle}>
    <img src={image} alt={name} style={portraitStyle} />
    <div style={bubbleBodyStyle}>
      <span aria-hidden style={bubbleTailStyle} />
      <div style={captionStyle}>{name}</div>
      <div>{children}</div>
    </div>
  </div>
);
const Callout = ({ title, children }: { title: string; children: ReactNode }) => (
  <div style={calloutStyle}>
    <div style={calloutTitleStyle}>{title}</div>
    <div style={calloutBodyStyle}>{children}</div>
  </div>
);
const BulletList = ({ items }: { items: ReactNode[] }) => (
  <ul style={listStyle}>
    {items.map((item, index) => (
      <li key={index} style={bulletItemStyle}>
        <span style={greenTextStyle}>●</span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);
const NumberedList = ({ items }: { items: ReactNode[] }) => (
  <ol style={listStyle}>
    {items.map((item, index) => (
      <li key={index} style={numberedItemStyle}>
        <span style={numberBadgeStyle}>{index + 1}</span>
        <span>{item}</span>
      </li>
    ))}
  </ol>
);
const CodeBlock = ({ children }: { children: string }) => (
  <pre style={codeBlockStyle}>
    <code>{children}</code>
  </pre>
);
```

Bubbleの共有キャラ画像は `assets/etokichi-face.webp` を使える。

```tsx
import character from '@assets/etokichi-face.webp';
<Bubble image={character} name="エトキチ">ひとこと添える</Bubble>
```

CodeBlockは枠のみ。シンタックスハイライトは入れない。1枚18行まで。

### Em

```tsx
const emStyle: CSSProperties = {
  fontStyle: 'normal',
  fontWeight: weight.bold,
  color: color.secondary,
};
const Em = ({ children }: { children: ReactNode }) => (
  <em style={emStyle}>
    {children}
  </em>
);
```

## Motion

subtle。段階表示はStepsとStepのfade-inだけ。ページ遷移は設定しない。

## Aesthetic

白地、緑の線、落ち着いた本文色を使うminimal。文章と関係図を中心に、画像のページを挟んでリズムを作る。

## Example usage

```tsx
const heroStyle: CSSProperties = {
  fontSize: 'var(--osd-size-hero)',
  fontWeight: weight.bold,
};
const mutedStyle: CSSProperties = { color: color.dimmed };
const Cover: Page = () => (
  <Shell>
    <Eyebrow>STANDARD</Eyebrow>
    <div style={heroStyle}>伝えたいことを、まっすぐに</div>
    <p style={mutedStyle}>白地と緑の、いつものスライド</p>
  </Shell>
);
```

## 型

### cover

```tsx
const coverTitleStyle: CSSProperties = {
  fontSize: 'var(--osd-size-hero)',
  fontWeight: weight.bold,
};
<Shell>
  <div style={coverTitleStyle}>表紙タイトル</div>
  <div>副題と著者</div>
</Shell>
```

### chapter-divider

```tsx
<ChapterDivider chapters={['背景', '実践', '次の一歩']} active={2} />
```

### fact

```tsx
const factStyle: CSSProperties = { fontSize: type.fact, fontWeight: weight.bold };
<Shell center>
  <div style={factStyle}>伝えたい事実をひとつ</div>
</Shell>
```

### headline

```tsx
const headlineStyle: CSSProperties = { fontSize: type.headline, fontWeight: weight.bold };
<Shell>
  <Eyebrow>章の現在地</Eyebrow>
  <div style={headlineStyle}>一番伝えたいこと</div>
</Shell>
```

### diagram

```tsx
const diagramStyle: CSSProperties = { display: 'flex', gap: space.xl };
<Shell>
  <Title>関係を図にする</Title>
  <div style={diagramStyle}>
    <Callout title="以前">毎回説明</Callout>
    <span>→</span>
    <Callout title="今">記録を育てる</Callout>
  </div>
</Shell>
```

### visual

```tsx
const imageStyle: CSSProperties = {
  position: 'absolute',
  inset: space.none,
  backgroundImage: `url("${scene}")`,
  backgroundSize: 'cover',
};
const washStyle: CSSProperties = {
  position: 'absolute',
  inset: space.none,
  background: color.visualWash,
};
const visualTitleStyle: CSSProperties = {
  position: 'relative',
  fontSize: type.headlineMd,
  fontWeight: weight.bold,
};
<Shell>
  <div style={imageStyle} />
  <div style={washStyle} />
  <div style={visualTitleStyle}>画像とひとこと</div>
</Shell>
```

### image-left / image-right

```tsx
const imageGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: space.xl,
};
const imageStyle: CSSProperties = { width: '100%' };
<Shell>
  <div style={imageGridStyle}>
    <img src={scene} alt="説明する画像" style={imageStyle} />
    <div>
      <Title>画像を説明する</Title>
      <p>左右を交換すればimage-right。</p>
    </div>
  </div>
</Shell>
```

### two-cols

```tsx
const columnsStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: space.xl,
};
<Shell>
  <Title>二つの視点</Title>
  <div style={columnsStyle}>
    <div>左側の内容</div>
    <div>右側の内容</div>
  </div>
</Shell>
```

### iframe-refer

```tsx
const iframeStyle: CSSProperties = { width: '100%', flex: 1, border: 'none' };
<Shell>
  <Title>外部の実例</Title>
  <iframe title="参照先" src={referenceUrl} style={iframeStyle} />
  <Refer>{referenceUrl}</Refer>
</Shell>
```

visualやimage型の `scene` はデッキ専用素材をES moduleでimportする。iframe-referの `referenceUrl` は埋め込みが許可されたURLにする。

## 禁止事項

- 意味を運ぶ表現にグラデーションと影を使わない。
- `overflow: hidden` を使わない。
- 文字サイズの下限を割らない。
- ピンクをem以外の文字に使わない。
- nerdfontsのCDNを読み込まない。
- PDFを配布しない。

画像の暗幕に限りvisualWashとdarkWashを使える。情報は画像自体と文字で伝える。
