import type { CSSProperties, ReactNode } from 'react';
import {
  type DesignSystem,
  type Page,
  type SlideTransition,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';

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

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;800&display=swap';
const FONT_LINK_ID = 'osd-webfont-washi-demo';
const STYLE_ID = 'osd-styles-washi-demo';
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

const Cover: Page = () => (
  <Shell band folio={false}>
    <div style={coverStyle}>
      <div style={coverCopyStyle}>
        <Wordmark />
        <h1 style={catchStyle}>声をすべてドキュメントに</h1>
        <div style={bylineStyle}>tadashi-aikawa</div>
      </div>
      <VoiceToDoc />
    </div>
  </Shell>
);
Cover.transition = settleTransition;

const Chapter: Page = () => (
  <ChapterDivider chapters={['なぜ作ったか', 'KIKIGAKIとは', '仕事でどう使っているか', 'まとめ']} active={2} />
);
Chapter.transition = settleTransition;

const Speakers: Page = () => (
  <Shell>
    <Title eyebrow="KIKIGAKIとは">話す人ごとに、<Em>行を分けて</Em>書く</Title>
    <Stage>
      <Sheet angle={tilt.left} padded width={1240}>
        <Transcript>
          <TranscriptLine time="01:04:12" name="話者A" initial="A" speaker="teal" order={1}>
            来週の勉強会の準備を決めましょう
          </TranscriptLine>
          <TranscriptLine time="01:04:22" name="話者B" initial="B" speaker="gold" order={3}>
            資料は5枚にします
          </TranscriptLine>
          <TranscriptLine time="01:04:33" name="話者C" initial="C" speaker="sumi" order={5} state="live">
            最後に質問の時間が欲しいです
          </TranscriptLine>
          <TranscriptLine time="01:04:41" name="話者A" initial="A" speaker="teal" order={7} state="pending">
            それで行きましょう
          </TranscriptLine>
        </Transcript>
      </Sheet>
    </Stage>
  </Shell>
);

const Tradeoffs: Page = () => (
  <Shell>
    <Title eyebrow="KIKIGAKIとは">良いところと、気になるところ</Title>
    <Stage>
      <Compare>
        <CompareColumn mark="○" title="良いところ" order={0}>
          <Point order={2}>話す人ごとに分かれる</Point>
          <Point order={3}>AIが議事録とボードを書く</Point>
          <Point order={4}>Markdownで手元に残る</Point>
        </CompareColumn>
        <CompareColumn mark="△" title="気になるところ" order={5}>
          <Point order={7}>macOS 26以降が必要</Point>
          <Point order={8}>AIエージェントが別に要る</Point>
        </CompareColumn>
      </Compare>
    </Stage>
  </Shell>
);

export default [Cover, Chapter, Speakers, Tradeoffs] satisfies Page[];
