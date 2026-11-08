---
name: Washi
description: KIKIGAKIの和紙の地・墨・朱と話者色で、画面と図を主役に見せるテーマ
mode: light
---

# Washi

[KIKIGAKI](https://tadashi-aikawa.github.io/kikigaki/)のアプリとサイトのWashiパレットから起こしたテーマ。和紙の地に墨の文字を置き、朱は強調だけに使う。話者色(teal・gold・sumi)は話者の印と線だけに使う。

## 会場と文字の大きさ

テーブルが9列ほど並ぶ部屋で、プロジェクターに映す想定で決めた。

- 前提(推定): 最後列からスクリーンまで約14m。スクリーンは100〜120インチ(高さ1.25〜1.49m)。
  - 1080pxの1pxは、スクリーン上で約1.2〜1.4mmになる。
- 本文52px: 最後列から見て約15〜18分角。漢字の画数が多くても楽に読める。
- 本文の下限44px: 書き起こしの引用など、本文の量を少し増やしたいときだけ使う。
- 補足の下限36px: 約12〜14分角。読めるが、意味の主役には使わない。話者名・時刻・キャプションに限る。
- 例外: ページ番号だけ28px。後ろから読めなくてよい情報だから。
- 1枚に置く文は40字程度まで。超えたらページを分けるか、図に置き換える。

## 素材

- ラスタ画像は非可逆WebPのみ。動画は圧縮したH.264のMP4のみ。書き出しと検査はリポジトリの `CLAUDE.md` に従う。
- スクリーンショットと動画は、加工せずSheetに載せる。紙の面・影・傾きはSheet側のCSSで付ける。
  - 理由: 素材に台紙や影を焼き込むと、差し替えのたびに作り直しになる。
- ロゴは `slides/<id>/assets/kikigaki.webp` をimportしてWordmarkに渡す。
- 表紙の図は、下の `VoiceToDoc`(SVG・動きあり)か、`hero.webp`(静止画)のどちらか。動きを見せたいならVoiceToDocを使う。

## Palette

| Role | Value | 用途 |
| --- | --- | --- |
| bg | `#f5ead9` | 和紙の地。全ページ共通 |
| text | `#3b3530` | 本文 |
| accent | `#aa1405` | 朱。Em・表紙の帯・章扉の現在地の線だけ |
| ink | `#221f1c` | 見出し・ワードマーク・図の輪郭 |
| muted | `#6b6157` | 補足文字・ページ番号 |
| sheet | `#fbf5ea` | 紙の面(Sheet)・図の塗り |
| shade | `#ede0cd` | 紙の面の重ね・図の影 |
| rule | `#d5c6b1` | 紙の面の縁 |
| faint | `#a99c8c` | 飾りの線だけ。文字に使わない |
| teal | `#3e706c` | 話者色1 |
| gold | `#c4801f` | 話者色2 |
| sumi | `#514a43` | 話者色3・箇条の点 |

- 話者色は「誰の声か」だけを表す。印・線・図の要素に使い、文字色にしない。
  - 理由: goldは背景とのコントラストが約2.9:1で、プロジェクターでは文字が飛ぶ。章や区分の色分けに使うと、話者の意味と混ざる。
- 朱は1ページに1か所まで。
- 暗い背景のページは作らない。

## Typography

- 書体: 見出しも本文もゴシック1種類。
  - Macではヒラギノ角ゴ、それ以外ではNoto Sans JP(Webフォント)、読み込めなければ游ゴシック・メイリオで表示する。
  - Noto Sans JPはMacでは使われないので、Mac上ではダウンロードも起きない。
  - 明朝・縦書きは使わない。
- ウェイト: 本文400、見出し700、ワードマークだけ800。
- 文字間隔0.04em。行間は見出し1.3、本文1.5。
- 同梱skillの既定値を次で上書きする。
  - ワードマーク128px(`--osd-size-hero`)。
  - 章扉の題120px、言い切りのページ96px、ページ見出し72px、表紙の句60〜72px。
  - 本文52px(`--osd-size-body`)、下限44px。
  - 補足の下限36px。例外はページ番号28px。
- 書体の差で折り返しが変わらないよう、1行は幅の9割までに収める。
  - 理由: ヒラギノとNoto Sans JPは英数字の幅が少し違う。Windowsで見る人にだけ折り返しが出る。

フォントとkeyframesはデッキidをキーに一度だけheadへ追加する。

```tsx
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;800&display=swap';
const FONT_LINK_ID = 'osd-webfont-kikigaki-intro';
const STYLE_ID = 'osd-styles-kikigaki-intro';
const MOTION_CSS = `
@keyframes washi-rise { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes washi-settle { from { opacity: 0; transform: translateY(32px) rotate(0deg); } to { opacity: 1; transform: translateY(0) rotate(var(--washi-tilt, 0deg)); } }
@keyframes washi-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes washi-draw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes washi-arrive { 0% { opacity: 0; transform: translateY(20px); } 30% { opacity: 0.45; transform: translateY(0); } 70% { opacity: 0.45; } 100% { opacity: 1; transform: translateY(0); } }
@keyframes washi-underline { from { transform: scaleX(0); } to { transform: scaleX(1); } }
`;
if (typeof document !== 'undefined') {
  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== FONT_HREF) link.href = FONT_HREF;
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== MOTION_CSS) style.textContent = MOTION_CSS;
}
```

## Layout

- キャンバス1920×1080。余白は上下80px、左右128px。
- 左揃え。中央に置くのはStageの中の図・画面だけ。
- 1ページの組み: 見出し(Title)を上に置き、残りの高さをStageが受け持つ。見出しの位置はページ間で動かさない。
- 高さの予算: 1080 − 160 = 920px。Title(Eyebrow付き)で約160px、間隔64px、Stageに約700px。
- トークンの定義箇所を除き、色とpx寸法の数値を直書きしない。比率によるgrid、SVGの座標、角度は構造の値として扱う。

```tsx
export const design: DesignSystem = {
  palette: { bg: '#f5ead9', text: '#3b3530', accent: '#aa1405' },
  fonts: {
    display: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif',
    body: '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif',
  },
  typeScale: { hero: 128, body: 52 },
  radius: 8,
};

const color = {
  ink: '#221f1c',
  muted: '#6b6157',
  sheet: '#fbf5ea',
  shade: '#ede0cd',
  rule: '#d5c6b1',
  faint: '#a99c8c',
  teal: '#3e706c',
  gold: '#c4801f',
  sumi: '#514a43',
  // 引用符と丸括弧も符号化する。scripts/covers.mjsが背景画像のURLを引用符と ) で切り出すため。
  noise: `url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27240%27 height=%27240%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%273%27/%3E%3CfeColorMatrix values=%270 0 0 0 .35 0 0 0 0 .28 0 0 0 0 .2 0 0 0 .06 0%27/%3E%3C/filter%3E%3Crect width=%27240%27 height=%27240%27 filter=%27url%28%23n%29%27/%3E%3C/svg%3E")`,
  sheetShadow: '0 2px 4px rgba(80, 60, 40, 0.10), 0 24px 48px -24px rgba(80, 60, 40, 0.32)',
};
const speaker = {
  teal: { mark: color.teal, letter: color.sheet },
  gold: { mark: color.gold, letter: color.ink },
  sumi: { mark: color.sumi, letter: color.sheet },
};
type Speaker = keyof typeof speaker;
const type = {
  chapter: 120, headline: 96, heading: 72, lead: 60, bodyMin: 44, caption: 36, folio: 28,
};
const space = {
  none: 0, xs: 8, sm: 16, md: 24, lg: 40, xl: 64, xxl: 96, y: 80, x: 128,
};
const shape = {
  hairline: 2, rule: 4, band: 24, dot: 16, mark: 64, logo: 168, figure: 600,
};
const stroke = { thin: 4, base: 5, bold: 10 };
const weight = { normal: 400, bold: 700, heavy: 800 };
const leading = { tight: 1.1, heading: 1.3, body: 1.5 };
const tracking = { body: '0.04em', wordmark: '0.06em', label: '0.12em', wide: '0.4em' };
const tilt = { left: '-0.6deg', right: '0.5deg', flat: '0deg' };
const fade = { pending: 0.45 };
const motion = {
  start: 160, stagger: 120,
  rise: 560, settle: 760, fade: 480, draw: 760, arrive: 1600, underline: 520,
  page: 260, pageSettle: 280,
  ease: 'cubic-bezier(0, 0, 0.2, 1)', easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
};
```

## Fixed components

以下の型とフックをimportする。

- react: `CSSProperties` と `ReactNode`。SheetVideoを使うなら `useEffect` と `useRef` も。
- @open-slide/core: `DesignSystem`、`Page`、`SlideTransition`、`useIsActivePage`、`useSlidePageNumber`。

以下の部品をデッキ内にコピーする。

### 動きの土台 / ページ遷移

`useMotion` は、表示中のページでだけ入場の動きを返す。サムネイル・一覧・印刷では動かさず、完成した状態を描く。

```tsx
type MotionName = 'rise' | 'settle' | 'fade' | 'draw' | 'arrive' | 'underline';
const useMotion = () => {
  const active = useIsActivePage();
  return (name: MotionName, order = 0): CSSProperties =>
    active
      ? { animation: `washi-${name} ${motion[name]}ms ${motion.ease} ${motion.start + order * motion.stagger}ms both` }
      : {};
};

const HOLD: Keyframe[] = [{ opacity: 1 }, { opacity: 1 }];
export const transition: SlideTransition = {
  duration: motion.page,
  exit: { duration: motion.page, easing: motion.easeIn, keyframes: HOLD },
  enter: {
    duration: motion.page,
    easing: motion.ease,
    keyframes: [
      { opacity: 0, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
};
const settleTransition: SlideTransition = {
  duration: motion.pageSettle,
  exit: { duration: motion.pageSettle, easing: motion.easeIn, keyframes: HOLD },
  enter: {
    duration: motion.pageSettle,
    easing: motion.ease,
    keyframes: [
      { opacity: 0, transform: 'translateY(12px)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
    ],
  },
};
```

### Shell / Footer / Eyebrow / Title / Stage

```tsx
const shellStyle: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  width: '100%',
  height: '100%',
  padding: `${space.y}px ${space.x}px`,
  background: 'var(--osd-bg)',
  backgroundImage: color.noise,
  color: 'var(--osd-text)',
  fontFamily: 'var(--osd-font-body)',
  fontSize: 'var(--osd-size-body)',
  lineHeight: leading.body,
  letterSpacing: tracking.body,
  display: 'flex',
  flexDirection: 'column',
  gap: space.xl,
};
const bandStyle: CSSProperties = {
  position: 'absolute',
  left: space.none,
  right: space.none,
  bottom: space.none,
  height: shape.band,
  background: 'var(--osd-accent)',
};
const footerStyle: CSSProperties = {
  position: 'absolute',
  right: space.x,
  bottom: space.lg,
  fontSize: type.folio,
  lineHeight: leading.tight,
  color: color.muted,
  fontVariantNumeric: 'tabular-nums',
};
const headStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.xs };
const eyebrowStyle: CSSProperties = {
  fontSize: type.caption,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  letterSpacing: tracking.label,
  color: color.muted,
};
const titleStyle: CSSProperties = {
  margin: space.none,
  fontFamily: 'var(--osd-font-display)',
  fontSize: type.heading,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  letterSpacing: tracking.body,
  color: color.ink,
};
const stageStyle: CSSProperties = {
  flex: 1,
  minHeight: space.none,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: space.xl,
};

const Footer = () => {
  const { current, total } = useSlidePageNumber();
  return (
    <footer style={footerStyle}>
      {current} / {total}
    </footer>
  );
};
const Shell = ({
  children,
  band = false,
  folio = true,
}: {
  children: ReactNode;
  band?: boolean;
  folio?: boolean;
}) => (
  <div style={shellStyle}>
    {children}
    {band ? <div aria-hidden style={bandStyle} /> : null}
    {folio ? <Footer /> : null}
  </div>
);
const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div style={eyebrowStyle}>
    {children}
  </div>
);
const Title = ({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) => (
  <header style={headStyle}>
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    <h1 style={titleStyle}>{children}</h1>
  </header>
);
const Stage = ({ children }: { children: ReactNode }) => (
  <div style={stageStyle}>
    {children}
  </div>
);
```

- Eyebrowには章名を入れる。ページの中身を言い換えた語は入れない。
- Titleは動かさない。ページ遷移だけで入れ替える。

### Wordmark

```tsx
const wordmarkStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: space.lg };
const logoStyle: CSSProperties = {
  display: 'block',
  width: shape.logo,
  height: shape.logo,
};
const logoStandInStyle: CSSProperties = {
  ...logoStyle,
  borderRadius: '22%',
  background: 'var(--osd-accent)',
};
const wordmarkNameStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.sm };
const wordmarkLatinStyle: CSSProperties = {
  fontFamily: 'var(--osd-font-display)',
  fontSize: 'var(--osd-size-hero)',
  fontWeight: weight.heavy,
  lineHeight: leading.tight,
  letterSpacing: tracking.wordmark,
  color: color.ink,
};
const wordmarkKanjiStyle: CSSProperties = {
  paddingLeft: space.xs,
  fontSize: type.caption,
  lineHeight: leading.tight,
  letterSpacing: tracking.wide,
  color: color.muted,
};
const Wordmark = ({ logo }: { logo?: string }) => (
  <div style={wordmarkStyle}>
    {logo ? <img src={logo} alt="" style={logoStyle} /> : <span aria-hidden style={logoStandInStyle} />}
    <div style={wordmarkNameStyle}>
      <span style={wordmarkLatinStyle}>KIKIGAKI</span>
      <span style={wordmarkKanjiStyle}>聞書</span>
    </div>
  </div>
);
```

デッキでは必ずロゴを渡す。`logo` なしの赤い角丸はデモ用の代わり。

```tsx
import logo from './assets/kikigaki.webp';
<Wordmark logo={logo} />
```

### ChapterDivider

```tsx
const chapterTitleStyle: CSSProperties = {
  margin: space.none,
  fontFamily: 'var(--osd-font-display)',
  fontSize: type.chapter,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  letterSpacing: tracking.body,
  color: color.ink,
};
const chapterBodyStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: space.xxl,
};
const chapterRowStyle: CSSProperties = {
  display: 'flex',
  gap: space.xl,
  fontSize: type.caption,
  lineHeight: leading.heading,
};
const chapterItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space.sm,
  color: color.muted,
};
const chapterActiveStyle: CSSProperties = { ...chapterItemStyle, color: color.ink, fontWeight: weight.bold };
const chapterMarkStyle: CSSProperties = {
  height: shape.rule,
  background: 'var(--osd-accent)',
  transformOrigin: 'left',
};
const chapterBlankStyle: CSSProperties = { height: shape.rule };
const ChapterDivider = ({ chapters, active }: { chapters: string[]; active: number }) => {
  const enter = useMotion();
  return (
    <Shell>
      <div style={chapterBodyStyle}>
        <h1 style={chapterTitleStyle}>{chapters[active - 1]}</h1>
        <div style={chapterRowStyle}>
          {chapters.map((chapter, index) => (
            <div key={chapter} style={index + 1 === active ? chapterActiveStyle : chapterItemStyle}>
              <span>{chapter}</span>
              <span
                aria-hidden
                style={index + 1 === active ? { ...chapterMarkStyle, ...enter('underline', 1) } : chapterBlankStyle}
              />
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};
```

章名は短く保つ。4章で1行に収まるのは、全章名の合計がおよそ30字まで。

### Sheet / SheetImage / SheetVideo

スクリーンショット・動画・書き起こしを載せる紙の面。入場時に、平らな状態から少し傾いて置かれる。

```tsx
const sheetStyle: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  background: color.sheet,
  border: `${shape.hairline}px solid ${color.rule}`,
  borderRadius: 'var(--osd-radius)',
  boxShadow: color.sheetShadow,
};
const Sheet = ({
  children,
  angle = tilt.flat,
  order = 0,
  padded = false,
  width,
}: {
  children: ReactNode;
  angle?: string;
  order?: number;
  padded?: boolean;
  width?: number;
}) => {
  const enter = useMotion();
  const style = {
    ...sheetStyle,
    width,
    padding: padded ? space.lg : space.none,
    transform: `rotate(${angle})`,
    '--washi-tilt': angle,
    ...enter('settle', order),
  } as CSSProperties;
  return <div style={style}>{children}</div>;
};
const mediaStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  borderRadius: 'var(--osd-radius)',
};
const SheetImage = ({ src, alt }: { src: string; alt: string }) => (
  <img src={src} alt={alt} style={mediaStyle} />
);
const SheetVideo = ({ src, label }: { src: string; label: string }) => {
  const active = useIsActivePage();
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);
  return <video ref={ref} src={src} aria-label={label} muted loop playsInline preload="metadata" style={mediaStyle} />;
};
```

- 傾きは `tilt.left` / `tilt.right` / `tilt.flat` から選ぶ。続くページで左右を交互にすると単調にならない。
  - 動画と細かい文字のある画面は `tilt.flat` にする。傾けると文字がにじむ。
- 幅は `width` で指定する。高さは素材の縦横比で決まるので、Stageの約700pxに収まる幅を選ぶ。
  - 例: 16:10の画面なら幅1100pxまで、縦長の画面なら幅600px前後。
- SheetVideoは表示中のページでだけ頭から再生する。ほかのページに載った同じ動画は止まったまま。

### Transcript / TranscriptLine

書き起こしの1行。発言の引用と、話者の聞き分けの説明に使う。

```tsx
const transcriptStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.lg };
const lineStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: `${shape.mark}px 1fr`,
  columnGap: space.md,
  alignItems: 'start',
};
const markStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: shape.mark,
  height: shape.mark,
  borderRadius: '50% 50% 50% 8%',
  fontSize: type.caption,
  fontWeight: weight.bold,
  lineHeight: leading.tight,
  letterSpacing: space.none,
};
const lineHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: space.md,
  fontSize: type.caption,
  lineHeight: leading.body,
};
const lineNameStyle: CSSProperties = { fontWeight: weight.bold, color: color.ink };
const lineTimeStyle: CSSProperties = { color: color.muted, fontVariantNumeric: 'tabular-nums' };
const lineBodyStyle: CSSProperties = { fontSize: type.bodyMin, lineHeight: leading.body, color: color.ink };
const Transcript = ({ children }: { children: ReactNode }) => (
  <div style={transcriptStyle}>
    {children}
  </div>
);
const TranscriptLine = ({
  time,
  name,
  initial,
  speaker: who,
  state = 'final',
  order = 0,
  children,
}: {
  time: string;
  name: string;
  initial: string;
  speaker: Speaker;
  state?: 'final' | 'live' | 'pending';
  order?: number;
  children: ReactNode;
}) => {
  const enter = useMotion();
  const tone = speaker[who];
  return (
    <div style={enter(state === 'live' ? 'arrive' : 'rise', order)}>
      <div style={{ ...lineStyle, opacity: state === 'pending' ? fade.pending : 1 }}>
        <span style={{ ...markStyle, background: tone.mark, color: tone.letter }}>{initial}</span>
        <div>
          <div style={lineHeadStyle}>
            <span style={lineNameStyle}>{name}</span>
            <span style={lineTimeStyle}>{time}</span>
          </div>
          <div style={lineBodyStyle}>{children}</div>
        </div>
      </div>
    </div>
  );
};
```

- `state` はアプリの見え方に合わせる。
  - `final`: 決まった行。
  - `live`: 薄く出てから濃くなる。「まだ変わる行が、決まると濃くなる」を見せる行に1つだけ使う。
  - `pending`: 薄いまま。聞き取り中の最後の行。
- 印の形は、アプリの話者アイコンと同じく左下だけ尖らせた円。
- 1行の本文は44pxで1行に収める。1枚のSheetに載せるのは4行まで。
- `order` は1つおきに振ると、話の間合いで1行ずつ出る。

### Points / Point

```tsx
const pointsStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.md };
const pointStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: space.md, color: color.ink };
const dotStyle: CSSProperties = {
  flex: 'none',
  width: shape.dot,
  height: shape.dot,
  borderRadius: '50%',
  background: color.sumi,
};
const Points = ({ children }: { children: ReactNode }) => (
  <div style={pointsStyle}>
    {children}
  </div>
);
const Point = ({ children, order = 0 }: { children: ReactNode; order?: number }) => {
  const enter = useMotion();
  return (
    <div style={{ ...pointStyle, ...enter('rise', order) }}>
      <span aria-hidden style={dotStyle} />
      <span>{children}</span>
    </div>
  );
};
```

1項目は1行に収める。1つのPointsに5項目まで。

### Compare / CompareColumn

メリットとデメリットの2列。○と△で区別し、色では分けない。

```tsx
const compareStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: space.xxl,
  width: '100%',
  alignItems: 'start',
};
const columnStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.lg };
const columnHeadStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space.sm,
  fontWeight: weight.bold,
  color: color.ink,
};
const columnTitleStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: space.md };
const columnRuleStyle: CSSProperties = { height: shape.rule, background: color.ink, transformOrigin: 'left' };
const Compare = ({ children }: { children: ReactNode }) => (
  <div style={compareStyle}>
    {children}
  </div>
);
const CompareColumn = ({
  mark,
  title,
  order = 0,
  children,
}: {
  mark: '○' | '△';
  title: string;
  order?: number;
  children: ReactNode;
}) => {
  const enter = useMotion();
  return (
    <div style={columnStyle}>
      <div style={{ ...columnHeadStyle, ...enter('rise', order) }}>
        <div style={columnTitleStyle}>
          <span aria-hidden>{mark}</span>
          <span>{title}</span>
        </div>
        <span aria-hidden style={{ ...columnRuleStyle, ...enter('underline', order + 1) }} />
      </div>
      <Points>{children}</Points>
    </div>
  );
};
```

1列の幅は約780px。52pxの項目は全角14字前後までにする。

### Em

```tsx
const emStyle: CSSProperties = {
  fontStyle: 'normal',
  fontWeight: weight.bold,
  color: 'var(--osd-accent)',
};
const Em = ({ children }: { children: ReactNode }) => (
  <em style={emStyle}>
    {children}
  </em>
);
```

### VoiceToDoc

サイトのヒーロー図をSVGで描いたもの。吹き出しが順に現れ、点線でつながり、文書の行が引かれる。表紙と、話者ごとに分けて書く仕組みの説明に使う。

```tsx
const figureStyle: CSSProperties = { display: 'block', width: shape.figure, height: 'auto', flex: 'none' };
const VoiceBubble = ({ y, tone, order }: { y: number; tone: string; order: number }) => {
  const enter = useMotion();
  return (
    <g style={enter('rise', order)}>
      <path
        d={`M54 ${y} H186 A34 34 0 0 1 220 ${y + 34} V${y + 76} A34 34 0 0 1 186 ${y + 110} H90 L40 ${y + 146} L50 ${y + 108} A34 34 0 0 1 20 ${y + 76} V${y + 34} A34 34 0 0 1 54 ${y} Z`}
        fill={color.sheet}
        stroke={tone}
        strokeWidth={stroke.base}
        strokeLinejoin="round"
      />
      <path
        d={`M68 ${y + 44} H172 M68 ${y + 70} H148`}
        stroke={tone}
        strokeWidth={stroke.thin}
        strokeLinecap="round"
      />
    </g>
  );
};
const VoiceFlow = ({ d, tone, order }: { d: string; tone: string; order: number }) => {
  const enter = useMotion();
  return (
    <path
      d={d}
      fill="none"
      stroke={tone}
      strokeWidth={stroke.base}
      strokeLinecap="round"
      strokeDasharray="0.1 14"
      style={enter('fade', order)}
    />
  );
};
const DocLine = ({ y, tone, order }: { y: number; tone: string; order: number }) => {
  const enter = useMotion();
  return (
    <g>
      <circle cx={444} cy={y} r={8} fill={tone} style={enter('fade', order)} />
      <path
        d={`M466 ${y} H628`}
        stroke={tone}
        strokeWidth={stroke.thin}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        style={enter('draw', order)}
      />
    </g>
  );
};
const VoiceToDoc = () => {
  const enter = useMotion();
  return (
    <svg viewBox="0 0 700 600" style={figureStyle} aria-hidden>
      <VoiceFlow d="M232 95 C 310 95, 340 200, 420 198" tone={color.teal} order={3} />
      <VoiceFlow d="M232 280 C 310 280, 340 318, 420 318" tone={color.gold} order={4} />
      <VoiceFlow d="M232 465 C 310 465, 340 440, 420 438" tone={color.sumi} order={5} />
      <VoiceBubble y={40} tone={color.teal} order={0} />
      <VoiceBubble y={225} tone={color.gold} order={1} />
      <VoiceBubble y={410} tone={color.sumi} order={2} />
      <g transform="rotate(2 540 300)">
        <g style={enter('fade', 0)}>
          <rect x={408} y={60} width={256} height={480} rx={6} fill={color.shade} transform="translate(8 10)" />
          <rect x={408} y={60} width={256} height={480} rx={6} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} />
          <path d="M440 120 H572" stroke={color.ink} strokeWidth={stroke.bold} strokeLinecap="round" />
        </g>
        <DocLine y={198} tone={color.teal} order={5} />
        <DocLine y={240} tone={color.teal} order={6} />
        <DocLine y={318} tone={color.gold} order={6} />
        <DocLine y={360} tone={color.gold} order={7} />
        <DocLine y={438} tone={color.sumi} order={7} />
        <DocLine y={480} tone={color.sumi} order={8} />
      </g>
    </svg>
  );
};
```

自作の図も、この3つの作り方に揃える。

- 現れるもの: `enter('rise', n)`。
- つながり: 点線(`strokeDasharray="0.1 14"`+丸い端)を `enter('fade', n)`。
- 引かれる線: `pathLength={1}`、`strokeDasharray={1}` の実線を `enter('draw', n)`。
- CSSの動きを付ける要素に、`transform` 属性を一緒に付けない。属性の回転が上書きされて消える。回転は外側の `<g>` に持たせる。

## Motion

rich。ただし1デッキ1つの型に揃える。

- ページ遷移は付けない。瞬間表示にする。
  - 理由: フェードすると前のページが残って見える。タダシに差し戻された。
  - 下の「動きの土台」の `transition` / `settleTransition` は使わない。
- ページ内の動きは、話すタイミングのクリックで出す。ページを開いた瞬間には動かさない。
  - 実装: `slides/kikigaki-intro/index.tsx` の `Beats` と `useMotion(name, beat, delay)` を写す。`Shell` に `beats` でクリック数を渡し、各要素に `beat`(何回目のクリックで出るか)を付ける。`beat` 0は最初から出ていて動かない。
  - 下の部品の `order` は、このデッキでは `beat` と `delay` に置き換えている。
- ページ内の動き: すべて `useMotion` の6種から選ぶ。
  - `rise`: 要素が20px浮き上がって現れる。
  - `settle`: 紙の面が平らな状態から傾いて置かれる。
  - `fade`: 点線や印が現れる。
  - `draw`: 線が左から引かれる。
  - `arrive`: 書き起こしの行が薄く現れてから濃くなる。
  - `underline`: 見出しの下線が左から伸びる。
- 順番は `order` で付ける。1つ進むごとに120ms遅れる。1ページの動きは2秒以内に終える(`order` 14まで)。
- 話者の説明のように、話しながら1つずつ出したいときは `<Steps>` / `<Step>` を使う。
  - そのときStepの中身には `order` の動きを付けない。Stepのフェードと二重になる。
- `prefers-reduced-motion` はページ遷移とStepにしか効かない。ページ内の動きも止めたいときは、`useMotion` の中で `matchMedia('(prefers-reduced-motion: reduce)')` を見て `{}` を返す。

## Aesthetic

paper/print。KIKIGAKIのロゴとアプリの画面がもともと持つ和紙の地・墨・朱を、そのまま会場のスクリーンへ広げる。主役は実際の画面と、声が話者ごとの行になる図。文字は見出しとひとことに絞る。

- 避けるもの: フクロウの強調、暗い背景、縦書き、明朝、和柄や筆文字の飾り。
  - 理由: KIKIGAKIは実用ツールで、世界観を盛ると何のアプリかが伝わるのが遅れる。
- 避けるもの: 灰色の角丸カードを縦に積む組み、左の太い色線、絵文字の見出し、グラデーションの文字。
- 1ページで一番強く語るものを1つ決める。画面のページなら画面、言い切りのページなら文。

## Example usage

```tsx
const Cover: Page = () => (
  <Shell band folio={false}>
    <div style={coverStyle}>
      <div style={coverCopyStyle}>
        <Wordmark logo={logo} />
        <h1 style={catchStyle}>声をすべてドキュメントに</h1>
        <div style={bylineStyle}>発表者名</div>
      </div>
      <VoiceToDoc />
    </div>
  </Shell>
);
Cover.transition = settleTransition;
```

## 型

### cover

```tsx
const coverStyle: CSSProperties = {
  flex: 1,
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'center',
  columnGap: space.xl,
};
const coverCopyStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.xl };
const catchStyle: CSSProperties = {
  margin: space.none,
  fontFamily: 'var(--osd-font-display)',
  fontSize: type.heading,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  letterSpacing: tracking.body,
  color: color.ink,
};
const bylineStyle: CSSProperties = { fontSize: type.caption, color: color.muted };
```

朱の帯(`band`)は表紙と最後のページだけ。

### chapter-divider

```tsx
const Chapter2: Page = () => (
  <ChapterDivider chapters={['なぜ作ったか', 'KIKIGAKIとは', '仕事での使い方', 'まとめ']} active={2} />
);
Chapter2.transition = settleTransition;
```

### statement

ひとことで言い切るページ。図も画面も置かない。

```tsx
const statementStyle: CSSProperties = {
  margin: space.none,
  fontFamily: 'var(--osd-font-display)',
  fontSize: type.headline,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  color: color.ink,
};
<Shell>
  <Stage>
    <p style={statementStyle}>議事録は、<Em>会議の中で</Em>できあがる</p>
  </Stage>
</Shell>
```

### screen

画面1枚か動画1本を大きく見せる。Titleは1行。

```tsx
<Shell>
  <Title eyebrow="KIKIGAKIとは">話者の名前は、AIが付ける</Title>
  <Stage>
    <Sheet width={1100}>
      <SheetVideo src={speakerNames} label="話者Aの名前が本人の名前に変わる" />
    </Sheet>
  </Stage>
</Shell>
```

### screen-pair

画面2枚を並べて見比べる。左右で傾きを逆にする。

```tsx
<Stage>
  <Sheet angle={tilt.left} width={720} order={0}><SheetImage src={minutes} alt="議事録" /></Sheet>
  <Sheet angle={tilt.right} width={720} order={2}><SheetImage src={board} alt="ボード" /></Sheet>
</Stage>
```

### transcript

```tsx
<Shell>
  <Title eyebrow="KIKIGAKIとは">話す人ごとに、<Em>行を分けて</Em>書く</Title>
  <Stage>
    <Sheet angle={tilt.left} padded width={1240}>
      <Transcript>
        <TranscriptLine time="01:04:12" name="話者A" initial="A" speaker="teal" order={1}>来週の勉強会の準備を決めましょう</TranscriptLine>
        <TranscriptLine time="01:04:22" name="話者B" initial="B" speaker="gold" order={3}>資料は5枚にします</TranscriptLine>
        <TranscriptLine time="01:04:33" name="話者C" initial="C" speaker="sumi" order={5} state="live">最後に質問の時間が欲しいです</TranscriptLine>
      </Transcript>
    </Sheet>
  </Stage>
</Shell>
```

### compare

```tsx
<Shell>
  <Title eyebrow="KIKIGAKIとは">良いところと、気になるところ</Title>
  <Stage>
    <Compare>
      <CompareColumn mark="○" title="良いところ" order={0}>
        <Point order={2}>話す人ごとに分かれる</Point>
      </CompareColumn>
      <CompareColumn mark="△" title="気になるところ" order={5}>
        <Point order={7}>macOS 26以降が必要</Point>
      </CompareColumn>
    </Compare>
  </Stage>
</Shell>
```

### diagram

準備・最中・後始末のループのような図は、VoiceToDocと同じ作り方でSVGを描く。箱は `color.sheet` の塗りと `color.ink` の線、つながりは点線、順番は `order` で付ける。図の中の文字も36px以上にする。

## 禁止事項

- 文字サイズの下限を割らない。本文44px、補足36px、ページ番号だけ28px。
- 話者色と `faint` を文字色に使わない。
- 朱をEm・表紙の帯・章扉の現在地の線以外に使わない。
- 暗い背景のページ、明朝、縦書き、フクロウを主役にした絵を入れない。
- `overflow: hidden` を使わない。
- 素材に影・台紙・角丸を焼き込まない。
- 意味を運ぶ表現にグラデーションを使わない。影はSheetの紙の面だけ。
- ページ遷移を付けない。ページを開いた瞬間に動かさない。
- タイトルに句読点を入れない。そのページが何についてのページかを示す名詞寄りの形にする。
