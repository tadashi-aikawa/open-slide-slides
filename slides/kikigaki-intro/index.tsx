import type { CSSProperties, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  Step,
  Steps,
  useIsActivePage,
  useSlidePageNumber,
} from '@open-slide/core';
import logo from './assets/kikigaki.webp';
import meeting from './assets/meeting-trimmed.webp';
import mimizou from './assets/mimizou-flustered.webp';
import appWindow from './assets/app-window.webp';
import appWindowFull from './assets/app-window-full.webp';
import boardWide from './assets/board-wide.webp';
import claudeLogo from './assets/logo-claude.svg';
import openaiLogo from './assets/logo-openai.svg';
import herdrLogo from './assets/logo-herdr.svg';
import teaserSite from './assets/teaser-site.webp';
import minutes from './assets/minutes.webp';
import solo from './assets/solo-trimmed.webp';
import articleCover from './assets/voice-input-article.webp';
import speakerNames from './assets/speaker-names.mp4';

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
  paper: '#f5ead9',
  sheet: '#fbf5ea',
  shade: '#ede0cd',
  rule: '#d5c6b1',
  faint: '#a99c8c',
  teal: '#3e706c',
  gold: '#c4801f',
  sumi: '#514a43',
  // KIKIGAKIのウィンドウの、何も表示していないペインの背景色。
  paneBlank: '#f3eadd',
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
  number: 220, chapter: 120, headline: 96, statementSm: 80, heading: 72, lead: 60, bodyMin: 44, caption: 36, folio: 28,
};
const space = {
  none: 0, xs: 8, sm: 16, md: 24, lg: 40, xl: 64, xxl: 96, y: 80, x: 128,
};
const shape = {
  hairline: 2, rule: 4, band: 24, dot: 16, mark: 64, logo: 168, figure: 600,
  arrow: 112, icon: 200, column: 720, coverPicture: 1360, coverTop: 250, card: 640, pipeBox: 200, pairSheet: 600,
};
const stroke = { thin: 4, base: 5, bold: 10 };
const weight = { normal: 400, bold: 700, heavy: 800 };
const leading = { tight: 1.1, heading: 1.3, body: 1.5 };
const tracking = { body: '0.04em', wordmark: '0.06em', label: '0.12em', wide: '0.4em' };
const tilt = { left: '-0.6deg', right: '0.5deg', flat: '0deg' };
const fade = { pending: 0.45 };
const motion = {
  stagger: 120,
  rise: 560, settle: 760, fade: 480, draw: 760, arrive: 1600, underline: 520, stamp: 420,
  ease: 'cubic-bezier(0, 0, 0.2, 1)',
};

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
@keyframes washi-stamp { 0% { opacity: 0; transform: scale(1.8); } 60% { opacity: 1; transform: scale(0.94); } 100% { opacity: 1; transform: scale(1); } }
@keyframes washi-loop-send { 0% { offset-distance: 0%; opacity: 1; } 70% { offset-distance: 100%; opacity: 1; } 70.1%, 100% { offset-distance: 100%; opacity: 0; } }
@keyframes washi-loop-back { 0%, 70% { offset-distance: 0%; opacity: 0; } 70.1% { offset-distance: 0%; opacity: 1; } 100% { offset-distance: 100%; opacity: 1; } }`;
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

// ───────────────────────── クリックで出す仕掛け ─────────────────────────

// ページ遷移は付けない(瞬間表示)。ページ内の要素は、話すタイミングのクリックで出す。
// Beatsが見えないStepをcount個並べ、いくつ出たかを数える。各要素はbeat番目のクリックで動き出す。
// 一覧や後ろから戻ったときは、Stepsが全部出た状態で始まるので、完成した形で見える。
const BeatContext = createContext(Number.POSITIVE_INFINITY);
const triggerBoxStyle: CSSProperties = { position: 'absolute', left: 0, top: 0, width: 0, height: 0 };
const BeatTrigger = ({ index, onChange }: { index: number; onChange: (index: number, revealed: boolean) => void }) => {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current?.closest('[data-osd-step]');
    if (!host) return;
    const read = () => onChange(index, host.getAttribute('data-osd-step') === 'revealed');
    read();
    const observer = new MutationObserver(read);
    observer.observe(host, { attributes: true, attributeFilter: ['data-osd-step'] });
    return () => observer.disconnect();
  }, [index, onChange]);
  return <span ref={ref} />;
};
const Beats = ({ count, children }: { count: number; children: ReactNode }) => {
  const [flags, setFlags] = useState<boolean[]>(() => Array.from({ length: count }, () => false));
  const onChange = useCallback((index: number, revealed: boolean) => {
    setFlags((prev) => {
      if (prev[index] === revealed) return prev;
      const next = [...prev];
      next[index] = revealed;
      return next;
    });
  }, []);
  const revealed = flags.filter(Boolean).length;
  return (
    <BeatContext.Provider value={revealed}>
      {children}
      <div style={triggerBoxStyle} aria-hidden>
        <Steps>
          {Array.from({ length: count }, (_, index) => (
            <Step key={index} duration={0}>
              <BeatTrigger index={index} onChange={onChange} />
            </Step>
          ))}
        </Steps>
      </div>
    </BeatContext.Provider>
  );
};

type MotionName = 'rise' | 'settle' | 'fade' | 'draw' | 'arrive' | 'underline' | 'stamp';
// beat 0は最初から出ている(動かない)。beat n はn回目のクリックで、delay分ずらして動く。
const useMotion = () => {
  const active = useIsActivePage();
  const revealed = useContext(BeatContext);
  return (name: MotionName, beat = 0, delay = 0): CSSProperties => {
    if (beat === 0) return {};
    if (beat > revealed) return { opacity: 0 };
    return active
      ? { animation: `washi-${name} ${motion[name]}ms ${motion.ease} ${delay * motion.stagger}ms both` }
      : {};
  };
};
const useBeatShown = (beat: number) => beat <= useContext(BeatContext);

// ───────────────────────── テーマの部品(themes/washi.md) ─────────────────────────

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
// 中身は上寄せにする。下のほうは遠くの席から見えにくいので、余る高さは下へ回す。
// タイトルから中身まではShellの間隔(space.xl)だけ空ける。
const stageStyle: CSSProperties = {
  flex: 1,
  minHeight: space.none,
  display: 'flex',
  alignItems: 'flex-start',
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
  beats = 0,
}: {
  children: ReactNode;
  band?: boolean;
  folio?: boolean;
  beats?: number;
}) => (
  <div style={shellStyle}>
    <Beats count={beats}>{children}</Beats>
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
const Wordmark = ({ logo: src }: { logo: string }) => (
  <div style={wordmarkStyle}>
    <img src={src} alt="" style={logoStyle} />
    <div style={wordmarkNameStyle}>
      <span style={wordmarkLatinStyle}>KIKIGAKI</span>
      <span style={wordmarkKanjiStyle}>聞書</span>
    </div>
  </div>
);

const CHAPTERS = ['なぜ作ったか', 'KIKIGAKIとは', 'Google Meetとの違い', '使い方レシピ', 'まとめ'];
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
const chapterMarkStyle: CSSProperties = { height: shape.rule, background: 'var(--osd-accent)' };
const chapterBlankStyle: CSSProperties = { height: shape.rule };
const ChapterDivider = ({ chapters, active }: { chapters: string[]; active: number }) => (
  <Shell>
    <div style={chapterBodyStyle}>
      <h1 style={chapterTitleStyle}>{chapters[active - 1]}</h1>
      <div style={chapterRowStyle}>
        {chapters.map((chapter, index) => (
          <div key={chapter} style={index + 1 === active ? chapterActiveStyle : chapterItemStyle}>
            <span>{chapter}</span>
            <span aria-hidden style={index + 1 === active ? chapterMarkStyle : chapterBlankStyle} />
          </div>
        ))}
      </div>
    </div>
  </Shell>
);

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
  beat = 0,
  delay = 0,
  padded = false,
  width,
}: {
  children: ReactNode;
  angle?: string;
  beat?: number;
  delay?: number;
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
    ...enter('settle', beat, delay),
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
// 動画はbeat番目のクリックで頭から再生する。それまでは最初のコマで止めておく。
const SheetVideo = ({ src, label, beat = 1, style = mediaStyle }: { src: string; label: string; beat?: number; style?: CSSProperties }) => {
  const active = useIsActivePage();
  const shown = useBeatShown(beat);
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active && shown) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
      if (video.readyState >= 1) video.currentTime = 0;
    }
  }, [active, shown]);
  return <video ref={ref} src={src} aria-label={label} muted loop playsInline preload="auto" style={style} />;
};

// 1層目: 書き起こしの元になる声。
// 声の絵・矢印・書き起こしの縦の中心をそろえる。「声」の見出しは絵の上に浮かせ、中心の計算から外す。
const speakersRowStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: space.xl };
const speakersVoiceStyle: CSSProperties = { position: 'relative', flex: 'none' };

// 2層目: AIエージェントがやる代表的な3つを横に並べる。画面は同じ高さにそろえ、上端から見せる。
const worksGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '1000px 1fr', columnGap: space.xl, width: '100%', alignItems: 'start' };
const workCardStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.md };
const workHeadStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: space.lg };
const workNameStyle: CSSProperties = { fontSize: type.bodyMin, fontWeight: weight.bold, lineHeight: leading.heading, color: color.ink };
const workFrameStyle: CSSProperties = { ...sheetStyle, position: 'relative', height: 540, overflow: 'hidden' };
const workMediaStyle: CSSProperties = { display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top left' };
const WorkCard = ({ name, head, beat, children }: { name: string; head?: ReactNode; beat: number; children: ReactNode }) => {
  const enter = useMotion();
  return (
    <div style={{ ...workCardStyle, ...enter('rise', beat) }}>
      <div style={workHeadStyle}>
        {head ?? <span style={workNameStyle}>{name}</span>}
      </div>
      <div style={workFrameStyle}>{children}</div>
    </div>
  );
};
// 議事録とボードを同じ枠で交互に見せる。いま見えている方の名前に下線を引く。
const SWAP_INTERVAL = 3500;
const swapTabStyle: CSSProperties = { transition: `color ${motion.fade}ms` };
const swapLayerStyle: CSSProperties = { position: 'absolute', inset: 0, transition: `opacity ${motion.fade}ms ${motion.ease}` };
const useSwap = (beat: number) => {
  const active = useIsActivePage();
  const shown = useBeatShown(beat);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || !shown) {
      setIndex(0);
      return;
    }
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % 2), SWAP_INTERVAL);
    return () => window.clearInterval(timer);
  }, [active, shown]);
  return index;
};
const SwapWord = ({ on, children }: { on: boolean; children: ReactNode }) => (
  <span style={{ ...swapTabStyle, color: on ? 'var(--osd-accent)' : color.ink }}>{children}</span>
);
const MinutesBoardCard = ({ beat }: { beat: number }) => {
  const index = useSwap(beat);
  return (
    <WorkCard
      name=""
      beat={beat}
      head={
        <span style={workNameStyle}>
          <SwapWord on={index === 0}>議事録</SwapWord>・<SwapWord on={index === 1}>ボード</SwapWord>の更新
        </span>
      }
    >
      <div style={{ ...swapLayerStyle, opacity: index === 0 ? 1 : 0 }}>
        <img src={minutes} alt="AIエージェントが書いた議事録の画面" style={workMediaStyle} />
      </div>
      <div style={{ ...swapLayerStyle, opacity: index === 1 ? 1 : 0 }}>
        <img src={boardWide} alt="AIエージェントが描いたボードの画面" style={{ ...workMediaStyle, objectFit: 'contain', objectPosition: 'center' }} />
      </div>
    </WorkCard>
  );
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
  beat = 0,
  children,
}: {
  time: string;
  name: string;
  initial: string;
  speaker: Speaker;
  state?: 'final' | 'live' | 'pending';
  beat?: number;
  children: ReactNode;
}) => {
  const enter = useMotion();
  const tone = speaker[who];
  return (
    <div style={enter(state === 'live' ? 'arrive' : 'rise', beat)}>
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
const Point = ({ children, beat = 0, delay = 0 }: { children: ReactNode; beat?: number; delay?: number }) => {
  const enter = useMotion();
  return (
    <div style={{ ...pointStyle, ...enter('rise', beat, delay) }}>
      <span aria-hidden style={dotStyle} />
      <span>{children}</span>
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

// 表紙の図。表紙は瞬間表示なので動かさない。
const figureStyle: CSSProperties = { display: 'block', width: shape.figure, height: 'auto', flex: 'none' };
const VoiceBubble = ({ y, tone }: { y: number; tone: string }) => (
  <g>
    <path
      d={`M54 ${y} H186 A34 34 0 0 1 220 ${y + 34} V${y + 76} A34 34 0 0 1 186 ${y + 110} H90 L40 ${y + 146} L50 ${y + 108} A34 34 0 0 1 20 ${y + 76} V${y + 34} A34 34 0 0 1 54 ${y} Z`}
      fill={color.sheet}
      stroke={tone}
      strokeWidth={stroke.base}
      strokeLinejoin="round"
    />
    <path d={`M68 ${y + 44} H172 M68 ${y + 70} H148`} stroke={tone} strokeWidth={stroke.thin} strokeLinecap="round" />
  </g>
);
const VoiceFlow = ({ d, tone }: { d: string; tone: string }) => (
  <path d={d} fill="none" stroke={tone} strokeWidth={stroke.base} strokeLinecap="round" strokeDasharray="0.1 14" />
);
const DocLine = ({ y, tone }: { y: number; tone: string }) => (
  <g>
    <circle cx={444} cy={y} r={8} fill={tone} />
    <path d={`M466 ${y} H628`} stroke={tone} strokeWidth={stroke.thin} strokeLinecap="round" />
  </g>
);
const VoiceToDoc = () => (
  <svg viewBox="0 0 700 600" style={figureStyle} aria-hidden>
    <VoiceFlow d="M232 95 C 310 95, 340 200, 420 198" tone={color.teal} />
    <VoiceFlow d="M232 280 C 310 280, 340 318, 420 318" tone={color.gold} />
    <VoiceFlow d="M232 465 C 310 465, 340 440, 420 438" tone={color.sumi} />
    <VoiceBubble y={40} tone={color.teal} />
    <VoiceBubble y={225} tone={color.gold} />
    <VoiceBubble y={410} tone={color.sumi} />
    <g transform="rotate(2 540 300)">
      <rect x={408} y={60} width={256} height={480} rx={6} fill={color.shade} transform="translate(8 10)" />
      <rect x={408} y={60} width={256} height={480} rx={6} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} />
      <path d="M440 120 H572" stroke={color.ink} strokeWidth={stroke.bold} strokeLinecap="round" />
      <DocLine y={198} tone={color.teal} />
      <DocLine y={240} tone={color.teal} />
      <DocLine y={318} tone={color.gold} />
      <DocLine y={360} tone={color.gold} />
      <DocLine y={438} tone={color.sumi} />
      <DocLine y={480} tone={color.sumi} />
    </g>
  </svg>
);

// ───────────────────────── このデッキの部品 ─────────────────────────

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
const statementStyle: CSSProperties = {
  margin: space.none,
  fontFamily: 'var(--osd-font-display)',
  fontSize: type.headline,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  color: color.ink,
};
const statementBlockStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: space.xl,
};
const subStyle: CSSProperties = { margin: space.none, color: color.muted };
const captionStyle: CSSProperties = { fontSize: type.caption, color: color.muted, lineHeight: leading.body };
const leadStyle: CSSProperties = {
  fontSize: type.lead,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  color: color.ink,
};
// 2章の頭でKIKIGAKIを紹介するページ。左に名前と一言、右に実際の画面を傾けて裁ち落とす。
const introStyle: CSSProperties = { position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: space.lg, width: 760 };
const introMarkStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: space.md };
const introLogoStyle: CSSProperties = { display: 'block', width: 104, height: 104 };
const introNameStyle: CSSProperties = { ...wordmarkLatinStyle, fontSize: type.headline, lineHeight: 1 };
const introCatchStyle: CSSProperties = { ...statementStyle, fontSize: type.statementSm, letterSpacing: tracking.body };
const introLineStyle: CSSProperties = { margin: space.none, fontSize: type.caption, color: color.muted, lineHeight: leading.body };
const introAgentStyle: CSSProperties = { fontSize: 40, fontWeight: weight.bold, lineHeight: leading.heading, color: color.ink, whiteSpace: 'nowrap' };
const IntroAgent = ({ beat }: { beat: number }) => {
  const enter = useMotion();
  return (
    <div style={{ ...introAgentStyle, ...enter('rise', beat) }}>
      AIエージェントも<Em>会話に加わる</Em>
    </div>
  );
};
const appShotStyle: CSSProperties = {
  position: 'absolute',
  left: 1000,
  top: 150,
  width: 1240,
  transform: 'rotate(-2deg)',
  '--washi-tilt': '-2deg',
} as CSSProperties;
const appShotImageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: `${shape.hairline}px solid ${color.rule}`,
  borderRadius: 'var(--osd-radius)',
  boxShadow: '0 4px 8px rgba(80, 60, 40, 0.12), 0 48px 96px -32px rgba(80, 60, 40, 0.45)',
};
const AppShot = () => (
  <div style={appShotStyle}>
    <img src={appWindow} alt="KIKIGAKIの画面。左に話す人ごとの書き起こしとAIの返事、右にボード" style={appShotImageStyle} />
  </div>
);

// 9枚目: 声から議事録だけでなく、いろいろな成果物へ広がる線画。
const notJustGridStyle: CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: space.xl };
const notJustCopyStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.lg, flex: 'none', whiteSpace: 'nowrap' };
const fanSvgStyle: CSSProperties = { display: 'block', width: 460, height: 'auto', flex: 'none' };
const FanCard = ({ y, label, tone, beat, delay = 0 }: { y: number; label: string; tone: string; beat: number; delay?: number }) => {
  const enter = useMotion();
  return (
    <g style={enter('rise', beat, delay)}>
      <path d={`M232 300 C 330 300, 330 ${y + 40}, 420 ${y + 40}`} fill="none" stroke={tone} strokeWidth={stroke.base} strokeLinecap="round" strokeDasharray="0.1 14" />
      <rect x={428} y={y} width={180} height={80} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <circle cx={458} cy={y + 40} r={8} fill={tone} />
      <text x={480} y={y + 52} fontSize={34} fontWeight={700} fill={color.ink}>
        {label}
      </text>
    </g>
  );
};
const VoiceFan = () => (
  <svg viewBox="0 0 620 600" style={fanSvgStyle} aria-hidden fontFamily="inherit">
    <FanCard y={40} label="ボード" tone={color.gold} beat={1} delay={6} />
    <FanCard y={150} label="資料" tone={color.sumi} beat={1} delay={7} />
    <FanCard y={260} label="議事録" tone={color.teal} beat={0} />
    <FanCard y={370} label="記事" tone={color.gold} beat={1} delay={8} />
    <FanCard y={480} label="コード" tone={color.sumi} beat={1} delay={9} />
    <VoiceBubble y={226} tone={color.teal} />
  </svg>
);
const columnStackStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.md, flex: 'none', whiteSpace: 'nowrap' };

const Sub = ({ children, beat = 0 }: { children: ReactNode; beat?: number }) => {
  const enter = useMotion();
  return <p style={{ ...subStyle, ...enter('rise', beat) }}>{children}</p>;
};
const Lead = ({ children, beat = 0, delay = 0 }: { children: ReactNode; beat?: number; delay?: number }) => {
  const enter = useMotion();
  return <div style={{ ...leadStyle, ...enter('rise', beat, delay) }}>{children}</div>;
};

// 線画のイラスト。透過WebPなのでSheetに載せず、背景にそのまま置く。
const Illustration = ({ src, width, beat = 0 }: { src: string; width: number; beat?: number }) => {
  const enter = useMotion();
  return <img src={src} alt="" style={{ display: 'block', width, height: 'auto', ...enter('fade', beat) }} />;
};

// 1章: 平日5日の会話の量。2人の声を話者色のバーで積む。
const talkSvgStyle: CSSProperties = { display: 'block', width: 900, height: 'auto', flex: 'none' };
const TalkDay = ({ x, label, blocks, beat, delay }: { x: number; label: string; blocks: [string, number][]; beat: number; delay: number }) => {
  const enter = useMotion();
  let y = 80;
  return (
    <g style={enter('rise', beat, delay)}>
      <rect x={x} y={60} width={140} height={440} rx={8} fill={color.sheet} stroke={color.rule} strokeWidth={2} />
      {blocks.map(([tone, h], index) => {
        const top = y;
        y += h + 8;
        return <rect key={index} x={x + 20} y={top} width={100} height={h} rx={6} fill={tone} />;
      })}
      <text x={x + 70} y={560} fontSize={36} textAnchor="middle" fill={color.muted}>
        {label}
      </text>
    </g>
  );
};
// viewBoxの上端は、日の枠の上端を右の文の字面の上端にそろえる位置で切る。
const TalkWeek = ({ beat }: { beat: number }) => (
  <svg viewBox="0 50 900 530" style={talkSvgStyle} aria-hidden fontFamily="inherit">
    <TalkDay x={20} label="月" beat={beat} delay={0} blocks={[[color.teal, 70], [color.gold, 50], [color.teal, 40], [color.gold, 90]]} />
    <TalkDay x={200} label="火" beat={beat} delay={1} blocks={[[color.gold, 60], [color.teal, 110], [color.gold, 40]]} />
    <TalkDay x={380} label="水" beat={beat} delay={2} blocks={[[color.teal, 50], [color.gold, 70], [color.teal, 60], [color.gold, 60], [color.teal, 50]]} />
    <TalkDay x={560} label="木" beat={beat} delay={3} blocks={[[color.gold, 90], [color.teal, 60], [color.gold, 70]]} />
    <TalkDay x={740} label="金" beat={beat} delay={4} blocks={[[color.teal, 80], [color.gold, 50], [color.teal, 90], [color.gold, 40]]} />
  </svg>
);

// 1章: 話し合うPMと開発の私。吹き出しの色を左の会話のバーの話者色にそろえ、バーが2人の声だと読ませる。
const pairSvgStyle: CSSProperties = { display: 'block', width: 560, height: 'auto' };
const PairPerson = ({ cx, label, tone, side }: { cx: number; label: string; tone: string; side: 1 | -1 }) => {
  const bx = cx + side * 30;
  return (
    <g>
      <circle cx={cx} cy={150} r={32} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <path
        d={`M ${cx - 60} 270 C ${cx - 60} 222 ${cx - 38} 206 ${cx} 206 C ${cx + 38} 206 ${cx + 60} 222 ${cx + 60} 270 Z`}
        fill={color.sheet}
        stroke={color.ink}
        strokeWidth={stroke.thin}
        strokeLinejoin="round"
      />
      <rect x={side > 0 ? bx : bx - 120} y={10} width={120} height={72} rx={18} fill="none" stroke={tone} strokeWidth={stroke.thin} />
      <path d={`M ${bx + side * 16} 82 L ${bx - side * 4} 106 L ${bx + side * 40} 82`} fill="none" stroke={tone} strokeWidth={stroke.thin} strokeLinejoin="round" />
      <text x={cx} y={326} fontSize={type.caption} textAnchor="middle" fill={color.muted}>
        {label}
      </text>
    </g>
  );
};
const PairPeople = ({ beat }: { beat: number }) => {
  const enter = useMotion();
  return (
    <svg viewBox="0 0 560 340" style={{ ...pairSvgStyle, ...enter('fade', beat) }} aria-hidden fontFamily="inherit">
      <PairPerson cx={110} label="PM" tone={color.teal} side={1} />
      <PairPerson cx={450} label="開発(私)" tone={color.gold} side={-1} />
    </svg>
  );
};

// 1章: 役割を出し切ったあとのクリックで、見出しの下を覆う絵。動かさずに瞬間表示する。
const coverPictureBoxStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: shape.coverTop,
  width: shape.coverPicture,
  marginLeft: -shape.coverPicture / 2,
};
const CoverPicture = ({ src, alt, beat }: { src: string; alt: string; beat: number }) => {
  const shown = useBeatShown(beat);
  const style = {
    ...sheetStyle,
    padding: space.sm,
    transform: `rotate(${tilt.right})`,
    visibility: shown ? 'visible' : 'hidden',
  } as CSSProperties;
  return (
    <div style={coverPictureBoxStyle}>
      <div style={style}>
        <img src={src} alt={alt} style={mediaStyle} />
      </div>
    </div>
  );
};

// 1章: 声 → 文字 → 議事録の流れと、それぞれの関門。
const pipelineBlockStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.xl, width: '100%' };
const pipelineRowStyle: CSSProperties = { display: 'flex', alignItems: 'flex-start', width: '100%' };
const pipeBoxStyle: CSSProperties = {
  boxSizing: 'border-box',
  flex: 'none',
  width: shape.pipeBox,
  padding: `${space.lg}px ${space.sm}px`,
  whiteSpace: 'nowrap',
  background: color.sheet,
  border: `${stroke.thin}px solid ${color.ink}`,
  borderRadius: 'var(--osd-radius)',
  fontSize: 'var(--osd-size-body)',
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  textAlign: 'center',
  color: color.ink,
};
const pipeArrowStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: space.sm,
  paddingTop: space.lg,
};
const pipeLabelStyle: CSSProperties = { fontSize: type.bodyMin, fontWeight: weight.bold, lineHeight: leading.heading, color: color.ink, whiteSpace: 'nowrap' };
const PipeBox = ({ children, beat, delay = 0 }: { children: ReactNode; beat: number; delay?: number }) => {
  const enter = useMotion();
  return <div style={{ ...pipeBoxStyle, ...enter('rise', beat, delay) }}>{children}</div>;
};
// 矢印は箱と一緒に出し、矢印ごとの要点はlabelBeatのクリックで出す。
const PipeArrow = ({ beat, delay = 0, labelBeat, label }: { beat: number; delay?: number; labelBeat: number; label: string }) => {
  const enter = useMotion();
  return (
    <div style={pipeArrowStyle}>
      <svg viewBox="0 0 400 40" style={{ display: 'block', width: '86%' }} aria-hidden>
        <path d="M8 20 H380" stroke={color.ink} strokeWidth={stroke.base} strokeLinecap="round" pathLength={1} strokeDasharray={1} style={enter('draw', beat, delay)} />
        <path d="M368 6 L388 20 L368 34" fill="none" stroke={color.ink} strokeWidth={stroke.base} strokeLinecap="round" strokeLinejoin="round" style={enter('fade', beat, delay + 2)} />
      </svg>
      <div style={{ ...pipeLabelStyle, ...enter('rise', labelBeat) }}>{label}</div>
    </div>
  );
};
const whyStatementStyle: CSSProperties = { ...statementStyle, fontSize: type.statementSm };
const WhyLine = ({ children, beat }: { children: ReactNode; beat: number }) => {
  const enter = useMotion();
  return <p style={{ ...whyStatementStyle, ...enter('rise', beat) }}>{children}</p>;
};
// 付録: 図の下に、結論と出典の記事を縦に添える。
const futureFootStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: space.lg };

// 出典の記事をソーシャルカードの形で見せる。
const cardStyle: CSSProperties = {
  ...sheetStyle,
  display: 'flex',
  flexDirection: 'column',
  width: shape.card,
  flex: 'none',
  color: 'inherit',
  textDecoration: 'none',
};
const cardImageStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  borderRadius: 'var(--osd-radius) var(--osd-radius) 0 0',
};
const cardBodyStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.xs, padding: space.md };
const cardTitleStyle: CSSProperties = { fontSize: type.caption, fontWeight: weight.bold, lineHeight: leading.heading, color: color.ink };
const cardSiteStyle: CSSProperties = { fontSize: type.folio, color: color.muted };
// rowは画像を左、題を右に置く横長の形。図の下に添えるときに使う。
const cardRowStyle: CSSProperties = { ...cardStyle, flexDirection: 'row', alignItems: 'center', width: 'auto' };
const cardRowImageStyle: CSSProperties = { display: 'block', width: 360, height: 'auto', borderRadius: 'var(--osd-radius) 0 0 var(--osd-radius)' };
const ArticleCard = ({
  href,
  image,
  title,
  site,
  beat,
  row = false,
}: {
  href: string;
  image: string;
  title: ReactNode;
  site: string;
  beat: number;
  row?: boolean;
}) => {
  const enter = useMotion();
  return (
    <a href={href} style={{ ...(row ? cardRowStyle : cardStyle), ...enter('settle', beat) }}>
      <img src={image} alt="" style={row ? cardRowImageStyle : cardImageStyle} />
      <div style={cardBodyStyle}>
        <div style={cardTitleStyle}>{title}</div>
        <div style={cardSiteStyle}>{site}</div>
      </div>
    </a>
  );
};
const Arrow = ({ beat, delay = 0 }: { beat: number; delay?: number }) => {
  const enter = useMotion();
  return (
    <svg viewBox="0 0 112 40" style={{ display: 'block', width: shape.arrow, flex: 'none' }} aria-hidden>
      <path d="M16 20 H86" stroke={color.ink} strokeWidth={stroke.base} strokeLinecap="round" pathLength={1} strokeDasharray={1} style={enter('draw', beat, delay)} />
      <path d="M78 8 L96 20 L78 32" fill="none" stroke={color.ink} strokeWidth={stroke.base} strokeLinecap="round" strokeLinejoin="round" style={enter('fade', beat, delay + 1)} />
    </svg>
  );
};

// 2章: KIKIGAKIの2層構造。声を記録する層と、AIエージェントとつなぐ層。
const nodeStyle: CSSProperties = {
  boxSizing: 'border-box',
  flex: 'none',
  padding: `${space.md}px ${space.md}px`,
  background: color.sheet,
  border: `${stroke.thin}px solid ${color.ink}`,
  borderRadius: 'var(--osd-radius)',
  fontSize: type.bodyMin,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  color: color.ink,
};
const nodeSmallStyle: CSSProperties = { ...nodeStyle, padding: `${space.xs}px ${space.md}px`, fontSize: type.caption };
// よくある議事録ツールには無い部分を朱で示す。
const nodeAccentStyle: CSSProperties = { ...nodeStyle, borderColor: 'var(--osd-accent)', color: 'var(--osd-accent)' };
// 成果物の枠の中に並べる小さな箱。
const nodeItemStyle: CSSProperties = { ...nodeSmallStyle, padding: `${space.xs}px ${space.sm}px`, fontSize: type.folio, borderWidth: shape.hairline };
const nodeNoteStyle: CSSProperties = { display: 'block', fontSize: type.folio, fontWeight: weight.normal, color: color.muted };
const Node = ({
  children,
  note,
  tone = 'base',
  beat = 0,
  delay = 0,
}: {
  children: ReactNode;
  note?: ReactNode;
  tone?: 'base' | 'small' | 'item' | 'accent';
  beat?: number;
  delay?: number;
}) => {
  const enter = useMotion();
  const base = { base: nodeStyle, small: nodeSmallStyle, item: nodeItemStyle, accent: nodeAccentStyle }[tone];
  return (
    <div style={{ ...base, ...enter('rise', beat, delay) }}>
      {children}
      {note ? <span style={nodeNoteStyle}>{note}</span> : null}
    </div>
  );
};
const layerRowStyle: CSSProperties = { display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: space.lg, width: '100%' };
const layerGroupStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.md };
const layerItemsStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: space.sm, minHeight: 460 };
const layerRuleStyle: CSSProperties = { height: shape.rule, background: 'var(--osd-accent)', transformOrigin: 'left' };
const layerLabelStyle: CSSProperties = { display: 'flex', alignItems: 'baseline', gap: space.md, fontWeight: weight.bold, color: color.ink };
const layerNumberStyle: CSSProperties = { fontSize: type.caption, color: 'var(--osd-accent)', letterSpacing: tracking.label };
const LayerGroup = ({
  number,
  name,
  note,
  beat,
  children,
}: {
  number: string;
  name: string;
  note: string;
  beat: number;
  children: ReactNode;
}) => {
  const enter = useMotion();
  return (
    <div style={layerGroupStyle}>
      <div style={layerItemsStyle}>{children}</div>
      <span aria-hidden style={{ ...layerRuleStyle, ...enter('underline', beat, 3) }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.xs, ...enter('rise', beat, 4) }}>
        <div style={layerLabelStyle}>
          <span style={layerNumberStyle}>{number}</span>
          <span>{name}</span>
        </div>
        <span style={captionStyle}>{note}</span>
      </div>
    </div>
  );
};

// 2章の機能ページで、いまどちらの層の話かを示す小さな地図。
const layerMapStyle: CSSProperties = { display: 'flex', gap: space.xl, fontSize: type.caption, lineHeight: leading.heading, whiteSpace: 'nowrap' };
const LayerMap = ({ active }: { active: 1 | 2 }) => (
  <div style={layerMapStyle}>
    <div style={active === 1 ? chapterActiveStyle : chapterItemStyle}>
      <span>1層目 声を記録する</span>
      <span aria-hidden style={active === 1 ? chapterMarkStyle : chapterBlankStyle} />
    </div>
    <div style={active === 2 ? chapterActiveStyle : chapterItemStyle}>
      <span>2層目 AIエージェントとつなぐ</span>
      <span aria-hidden style={active === 2 ? chapterMarkStyle : chapterBlankStyle} />
    </div>
  </div>
);
const layerHeadStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.md };
// 機能ページの見出し。eyebrowの代わりに層の地図を置く。
const LayerTitle = ({ active, children }: { active: 1 | 2; children: ReactNode }) => (
  <header style={layerHeadStyle}>
    <LayerMap active={active} />
    <h1 style={titleStyle}>{children}</h1>
  </header>
);

// 2章: KIKIGAKIとAIエージェントの関係を1枚の絵で見せる。座標は1664×700の舞台の上で決める。
const relationStageStyle: CSSProperties = { position: 'relative', width: 1664, height: 688, flex: 'none' };
const relationLabelStyle: CSSProperties = { display: 'block', fontSize: type.folio, fontWeight: weight.bold, lineHeight: leading.heading, letterSpacing: tracking.label, color: color.ink };
const relationCaptionStyle: CSSProperties = { display: 'block', fontSize: type.caption, fontWeight: weight.bold, lineHeight: leading.heading, color: color.ink, whiteSpace: 'nowrap' };
const speakersCaptionStyle: CSSProperties = { ...relationCaptionStyle, position: 'absolute', left: 0, right: 0, bottom: '100%', marginBottom: space.sm, textAlign: 'center' };
const relationPaneStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: `${shape.hairline}px solid ${color.rule}`,
  borderRadius: 'var(--osd-radius)',
  boxShadow: color.sheetShadow,
};
const relationBoxStyle: CSSProperties = {
  ...nodeStyle,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  fontSize: type.caption,
};
// AIエージェントが読み書きする手元のディレクトリ。点線で囲み、ファイルの置き場らしくする。
const relationDirStyle: CSSProperties = { ...relationBoxStyle, borderStyle: 'dashed', fontSize: 32, gap: space.sm };
// 送るの線の途中に置く、送り手のherdr。線の上に載るので、上下の余白を詰めて細い箱にする。
const relationViaStyle: CSSProperties = { ...relationBoxStyle, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.sm, padding: `0 ${space.md}px` };
const relationViaLogoStyle: CSSProperties = { display: 'block', width: 48, height: 48, borderRadius: 8 };
// AIエージェントが書き返すときに使うkikigakiスキル。AIエージェントの箱の中に、書き返すの線と同じ高さで置く。
const relationSkillStyle: CSSProperties = {
  display: 'block',
  padding: `${space.xs}px ${space.sm}px`,
  border: `${shape.hairline}px solid ${color.ink}`,
  borderRadius: 999,
  background: color.shade,
  fontSize: type.folio,
};
const RelationSkill = ({ beat }: { beat: number }) => {
  const enter = useMotion();
  return <span style={{ ...relationSkillStyle, ...enter('fade', beat) }}>kikigakiスキル</span>;
};
const relationLineStyle = { fill: 'none', stroke: color.ink, strokeWidth: stroke.base, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Place = ({
  x,
  y,
  w,
  h,
  beat,
  delay = 0,
  style,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  beat: number;
  delay?: number;
  style?: CSSProperties;
  children: ReactNode;
}) => {
  const enter = useMotion();
  return <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, ...style, ...enter('rise', beat, delay) }}>{children}</div>;
};
// AIエージェントの箱の外に添える、Claude CodeとCodexのロゴ。
const agentLogosStyle: CSSProperties = { display: 'flex', gap: space.md };
const agentLogoStyle: CSSProperties = { display: 'block', width: 64, height: 64 };
// 矢印の線を引いてから、先端を出す。
const RelationArrow = ({ d, head, beat, delay = 0 }: { d: string; head: string; beat: number; delay?: number }) => {
  const enter = useMotion();
  return (
    <g>
      <path d={d} {...relationLineStyle} pathLength={1} strokeDasharray={1} style={enter('draw', beat, delay)} />
      <path d={head} {...relationLineStyle} style={enter('fade', beat, delay + 3)} />
    </g>
  );
};
const RelationText = ({ x, y, beat, delay = 0, children }: { x: number; y: number; beat: number; delay?: number; children: ReactNode }) => {
  const enter = useMotion();
  return (
    <text x={x} y={y} fontSize={type.folio} fontWeight={weight.bold} fill={color.ink} style={enter('fade', beat, delay)}>
      {children}
    </text>
  );
};
// ウィンドウの右半分(議事録とボード)は、AIエージェントが書き返すまでペインの背景色で隠しておく。
// 位置は app-window-full.webp(1440×930)の右ペインの中身の範囲。
const paneRightInset = { top: '7.4%', right: '0%', bottom: '11.2%', left: '50.1%' };
const paneCoverStyle: CSSProperties = {
  position: 'absolute',
  top: paneRightInset.top,
  right: paneRightInset.right,
  bottom: paneRightInset.bottom,
  left: paneRightInset.left,
  background: color.paneBlank,
};
const AppWindowReveal = ({ beat, delay = 0 }: { beat: number; delay?: number }) => {
  const enter = useMotion();
  const { top, right, bottom, left } = paneRightInset;
  return (
    <div style={{ position: 'relative' }}>
      <img src={appWindowFull} alt="KIKIGAKIのウィンドウ。左に書き起こしとAIへ送るスロット、右に議事録とボード" style={relationPaneStyle} />
      <span aria-hidden style={paneCoverStyle} />
      <img
        src={appWindowFull}
        alt=""
        style={{ ...relationPaneStyle, position: 'absolute', inset: 0, boxShadow: 'none', clipPath: `inset(${top} ${right} ${bottom} ${left})`, ...enter('fade', beat, delay) }}
      />
    </div>
  );
};
// 送ると書き返すを何周か回してから成果物を出す。点が送るの線を進み、書き返すの線で戻る。
// 座標はRelationMapの舞台(1664×688)の上の線と同じ。
const relationLoop = { cycle: 1400, times: 3 };
const relationLoopDelay = (relationLoop.cycle * relationLoop.times) / motion.stagger;
const loopDotStyle: CSSProperties = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: 28,
  height: 28,
  borderRadius: '50%',
  background: 'var(--osd-accent)',
  offsetRotate: '0deg',
  offsetAnchor: 'center',
  opacity: 0,
};
const LoopDot = ({ path, name, beat }: { path: string; name: 'send' | 'back'; beat: number }) => {
  const active = useIsActivePage();
  const shown = useBeatShown(beat);
  const animation = active && shown ? `washi-loop-${name} ${relationLoop.cycle}ms linear ${relationLoop.times}` : undefined;
  return <span aria-hidden style={{ ...loopDotStyle, offsetPath: `path('${path}')`, animation }} />;
};
const RelationMap = () => (
  <div style={relationStageStyle}>
    <Place x={0} y={0} beat={1}>
      <span style={relationLabelStyle}>KIKIGAKI</span>
    </Place>
    <Place x={0} y={40} w={820} beat={1}>
      <AppWindowReveal beat={3} delay={3} />
    </Place>
    <Place x={560} y={600} w={240} h={80} beat={2} delay={1} style={relationViaStyle}>
      <img src={herdrLogo} alt="" style={relationViaLogoStyle} />
      herdr
    </Place>
    <Place x={1000} y={230} w={360} h={190} beat={2} delay={3} style={{ ...relationBoxStyle, alignItems: 'center', gap: space.sm }}>
      <span>AIエージェント</span>
      <RelationSkill beat={3} />
    </Place>
    <Place x={1000} y={152} beat={2} delay={3} style={agentLogosStyle}>
      <img src={claudeLogo} alt="Claude" style={agentLogoStyle} />
      <img src={openaiLogo} alt="OpenAI" style={agentLogoStyle} />
    </Place>
    <Place x={960} y={0} w={440} h={130} beat={2} delay={5} style={relationDirStyle}>
      <span>手元のディレクトリ</span>
      <span style={nodeNoteStyle}>コード・資料・過去の議事録</span>
    </Place>
    <Place x={1430} y={281} w={220} h={88} beat={4} delay={relationLoopDelay + 2} style={relationBoxStyle}>
      成果物
    </Place>
    <svg viewBox="0 0 1664 688" style={{ position: 'absolute', inset: 0, width: 1664, height: 688, overflow: 'visible' }} aria-hidden fontFamily="inherit">
      <RelationArrow d="M205 578 V640 H560" head="" beat={2} />
      <RelationArrow d="M800 640 H1180 V428" head="M1168 440 L1180 424 L1192 440" beat={2} delay={2} />
      <RelationText x={340} y={626} beat={2} delay={1}>送る</RelationText>
      <RelationArrow d="M992 356 H836" head="M848 344 L834 356 L848 368" beat={3} />
      <RelationText x={862} y={338} beat={3} delay={1}>書き返す</RelationText>
      <RelationArrow d="M1290 140 V222" head="M1278 154 L1290 138 L1302 154 M1278 208 L1290 224 L1302 208" beat={2} delay={5} />
      <RelationArrow d="M1370 325 H1420" head="M1408 313 L1422 325 L1408 337" beat={4} delay={relationLoopDelay} />
    </svg>
    <LoopDot name="send" path="M205 578 V640 H1180 V428" beat={4} />
    <LoopDot name="back" path="M992 356 H836" beat={4} />
  </div>
);

// 2章: AIエージェントの箱。ロゴは箱の外の上に添えて、どのエージェントかを示す。
const agentOutsideStyle: CSSProperties = { position: 'relative', display: 'flex', flexDirection: 'column' };
const agentOutsideLogosStyle: CSSProperties = {
  ...agentLogosStyle,
  position: 'absolute',
  left: '50%',
  bottom: `calc(100% + ${space.sm}px)`,
  transform: 'translateX(-50%)',
};
const AgentOutside = ({ beat, delay = 0, accent = false }: { beat: number; delay?: number; accent?: boolean }) => {
  const enter = useMotion();
  return (
    <div style={{ ...agentOutsideStyle, ...enter('rise', beat, delay) }}>
      <div style={agentOutsideLogosStyle}>
        <img src={claudeLogo} alt="Claude" style={agentLogoStyle} />
        <img src={openaiLogo} alt="OpenAI" style={agentLogoStyle} />
      </div>
      <Node tone={accent ? 'accent' : 'base'}>AIエージェント</Node>
    </div>
  );
};
const quoteStyle: CSSProperties = { ...statementStyle, fontSize: type.statementSm, color: color.ink };
const Quote = ({ children }: { children: ReactNode }) => <p style={quoteStyle}>{children}</p>;

// まとめ: 2枚目「本日お伝えしたいこと」の3つに、1行ずつ答える。大きなタイトルは置かず、上に小さな見出しだけ置いて、全面を3行に分ける。
// 左に番号と項目名、右に答え。行の間は罫線で区切る。
const summaryPageStyle: CSSProperties = { display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, width: '100%' };
const summaryRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '440px 1fr',
  columnGap: space.xl,
  alignItems: 'center',
  padding: `${space.lg}px 0`,
  borderTop: `${shape.hairline}px solid ${color.rule}`,
};
const summaryHeadStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.xs, whiteSpace: 'nowrap' };
const summaryNumberStyle: CSSProperties = { fontSize: type.lead, fontWeight: weight.bold, lineHeight: leading.tight, color: 'var(--osd-accent)', fontVariantNumeric: 'tabular-nums' };
const summaryNameStyle: CSSProperties = { fontSize: type.caption, fontWeight: weight.bold, color: color.muted };
const summaryCopyStyle: CSSProperties = { fontSize: type.lead, fontWeight: weight.bold, lineHeight: leading.heading, color: color.ink };
const summaryNoteStyle: CSSProperties = { fontSize: type.caption, color: color.muted, lineHeight: leading.heading };
const summaryPairStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: space.xl };
const summaryListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.xs, fontSize: type.caption, lineHeight: leading.heading, color: color.ink, whiteSpace: 'nowrap' };
const summaryTagStyle: CSSProperties = { fontSize: type.caption, fontWeight: weight.bold };
const summaryRecipesStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: space.md };
// 3つ並べると幅が足りないので、印を上、名前を下に置き、字間を詰める。
const summaryRecipeStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: space.xs,
  padding: `${space.sm}px ${space.sm}px`,
  letterSpacing: 0,
  background: color.sheet,
  border: `${stroke.thin}px solid ${color.ink}`,
  borderRadius: 'var(--osd-radius)',
  fontSize: type.caption,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  color: color.ink,
  whiteSpace: 'nowrap',
};
const SummaryRow = ({ n, name, beat, children }: { n: number; name: string; beat: number; children: ReactNode }) => {
  const enter = useMotion();
  return (
    <div style={{ ...summaryRowStyle, ...enter('rise', beat) }}>
      <div style={summaryHeadStyle}>
        <span style={summaryNumberStyle}>{n}</span>
        <span style={summaryNameStyle}>{name}</span>
      </div>
      <div>{children}</div>
    </div>
  );
};
// レシピの小さな印。議事録・ボード・成果物。
const RecipeMark = ({ kind }: { kind: 'minutes' | 'board' | 'artifact' }) => (
  <svg viewBox="0 0 48 48" style={{ display: 'block', width: 48, height: 48, flex: 'none' }} aria-hidden>
    {kind === 'minutes' ? (
      <>
        <rect x={8} y={4} width={32} height={40} rx={3} fill={color.sheet} stroke={color.ink} strokeWidth={3} />
        <path d="M15 16 H33 M15 24 H33 M15 32 H27" stroke={color.ink} strokeWidth={3} strokeLinecap="round" />
      </>
    ) : kind === 'board' ? (
      <>
        <path d="M24 12 L12 32 M24 12 L36 32" stroke={color.ink} strokeWidth={3} />
        <rect x={15} y={4} width={18} height={12} rx={2} fill={color.shade} stroke={color.ink} strokeWidth={3} />
        <rect x={3} y={30} width={18} height={12} rx={2} fill={color.shade} stroke={color.ink} strokeWidth={3} />
        <rect x={27} y={30} width={18} height={12} rx={2} fill={color.shade} stroke="var(--osd-accent)" strokeWidth={3} />
      </>
    ) : (
      <>
        <rect x={10} y={6} width={34} height={22} rx={2} fill={color.sheet} stroke={color.ink} strokeWidth={3} />
        <rect x={4} y={16} width={34} height={22} rx={2} fill={color.sheet} stroke={color.ink} strokeWidth={3} />
        <rect x={10} y={23} width={12} height={9} fill={color.gold} />
      </>
    )}
  </svg>
);

// 2章: 会議の時間の中で、議事録がいつできるか。
const timelineSvgStyle: CSSProperties = { display: 'block', width: 1660, height: 'auto', flex: 'none' };
const TimelineDoc = ({ x, y, beat, delay, lines }: { x: number; y: number; beat: number; delay: number; lines: string[] }) => {
  const enter = useMotion();
  return (
    <g style={enter('rise', beat, delay)}>
      <rect x={x} y={y} width={84} height={108} rx={6} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      {lines.map((tone, index) => (
        <path key={index} d={`M${x + 16} ${y + 32 + index * 22} H${x + 68}`} stroke={tone} strokeWidth={stroke.thin} strokeLinecap="round" />
      ))}
    </g>
  );
};
const LiveLine = ({ x, tone, delay }: { x: number; tone: string; delay: number }) => {
  const enter = useMotion();
  return (
    <path
      d={`M${x} 470 H${x + 120}`}
      stroke={tone}
      strokeWidth={stroke.bold}
      strokeLinecap="round"
      pathLength={1}
      strokeDasharray={1}
      style={enter('draw', 2, delay)}
    />
  );
};
const MeetingTimeline = () => {
  const enter = useMotion();
  return (
    <svg viewBox="0 0 1660 560" style={timelineSvgStyle} aria-hidden fontFamily="inherit">
      <g style={enter('fade', 1)}>
        <text x={0} y={90} fontSize={44} fontWeight={700} fill={color.muted}>Google Meet</text>
        <text x={0} y={140} fontSize={36} fill={color.muted}>MTGが終わるまで議事録を確認できない</text>
        <rect x={0} y={170} width={1200} height={72} rx={8} fill={color.shade} />
        <text x={600} y={218} fontSize={36} textAnchor="middle" fill={color.muted}>MTG</text>
      </g>
      <TimelineDoc x={1260} y={152} beat={1} delay={3} lines={[color.faint, color.faint, color.faint]} />
      <text x={1370} y={218} fontSize={36} fill={color.muted} style={enter('fade', 1, 4)}>終了後に完成</text>

      <g style={enter('fade', 2)}>
        <text x={0} y={350} fontSize={44} fontWeight={700} fill={color.ink}>KIKIGAKI</text>
        <text x={0} y={400} fontSize={36} fill={color.ink}>MTGの最中から議事録を確認できる</text>
        <rect x={0} y={434} width={1200} height={72} rx={8} fill={color.sheet} stroke={color.rule} strokeWidth={2} />
      </g>
      <LiveLine x={40} tone={color.teal} delay={1} />
      <LiveLine x={200} tone={color.gold} delay={2} />
      <LiveLine x={360} tone={color.teal} delay={3} />
      <LiveLine x={520} tone={color.sumi} delay={4} />
      <LiveLine x={680} tone={color.gold} delay={5} />
      <LiveLine x={840} tone={color.teal} delay={6} />
      <LiveLine x={1000} tone={color.sumi} delay={7} />
      <TimelineDoc x={1260} y={416} beat={2} delay={8} lines={[color.teal, color.gold, color.sumi]} />
      <text x={1370} y={482} fontSize={36} fill={color.ink} style={enter('fade', 2, 8)}>終了時に完成</text>
    </svg>
  );
};

// 3章: ローカルで完結するからできること。
const localGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  columnGap: space.xl,
  width: '100%',
};
const localItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: space.md,
};
const localTitleStyle: CSSProperties = { fontWeight: weight.bold, lineHeight: leading.heading, color: color.ink };
const iconStyle: CSSProperties = { display: 'block', width: shape.icon, height: shape.icon };
const LocalItem = ({ icon, title, note, beat, delay = 0 }: { icon: ReactNode; title: string; note: ReactNode; beat: number; delay?: number }) => {
  const enter = useMotion();
  return (
    <div style={{ ...localItemStyle, ...enter('rise', beat, delay) }}>
      {icon}
      <div style={localTitleStyle}>{title}</div>
      <div style={captionStyle}>{note}</div>
    </div>
  );
};
// 3章: 声が書き起こしになるまでを、Macの中の枠とKIKIGAKIの枠で囲んで見せる。
// 声はMacの外、MarkdownはMacの中でKIKIGAKIの外。座標は1664×540の舞台の上で決め、流れの中心はy=315。
const localStageStyle: CSSProperties = { position: 'relative', width: 1664, height: 540, flex: 'none' };
const localFrameStyle: CSSProperties = {
  boxSizing: 'border-box',
  border: `${stroke.thin}px dashed ${color.muted}`,
  borderRadius: 'var(--osd-radius)',
};
const localAppFrameStyle: CSSProperties = { ...localFrameStyle, border: `${stroke.thin}px solid var(--osd-accent)` };
const localFrameLabelStyle: CSSProperties = {
  position: 'absolute',
  left: space.md,
  top: space.sm,
  display: 'flex',
  alignItems: 'center',
  gap: space.xs,
  fontSize: type.folio,
  fontWeight: weight.bold,
  letterSpacing: tracking.label,
  color: color.muted,
};
const localAppLogoStyle: CSSProperties = { display: 'block', width: 36, height: 36 };
const localFileStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.xs, fontSize: type.caption, fontWeight: weight.bold, color: color.ink };
const localBoxStyle: CSSProperties = { ...relationBoxStyle, padding: `${space.sm}px ${space.md}px` };
// エンジン名は長いので字間を詰め、箱の内側に余白を残す。
const localNoteStyle: CSSProperties = { ...nodeNoteStyle, letterSpacing: 0 };
const localVoiceStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.xs, fontSize: type.caption, fontWeight: weight.bold, color: color.ink };
const LocalMap = () => (
  <div style={localStageStyle}>
    <Place x={160} y={0} w={1504} h={540} beat={1} style={localFrameStyle}>
      <span style={localFrameLabelStyle}>Macの中</span>
    </Place>
    <Place x={200} y={64} w={1130} h={456} beat={1} style={localAppFrameStyle}>
      <span style={{ ...localFrameLabelStyle, color: 'var(--osd-accent)' }}>
        <img src={logo} alt="" style={localAppLogoStyle} />
        KIKIGAKI
      </span>
    </Place>
    <Place x={0} y={270} w={120} beat={1} style={localVoiceStyle}>
      <svg viewBox="0 0 160 120" style={{ display: 'block', width: 120, height: 90 }} aria-hidden>
        <path d="M20 60 V60 M44 36 V84 M68 16 V104 M92 42 V78 M116 26 V94 M140 50 V70" stroke={color.gold} strokeWidth={stroke.bold} strokeLinecap="round" />
      </svg>
      <span>声</span>
    </Place>
    <Place x={290} y={140} w={380} h={160} beat={1} delay={2} style={localBoxStyle}>
      <span>文字起こし</span>
      <span style={localNoteStyle}>Apple SpeechAnalyzer</span>
    </Place>
    <Place x={290} y={330} w={380} h={160} beat={1} delay={2} style={localBoxStyle}>
      <span>話者判別</span>
      <span style={localNoteStyle}>
        NVIDIA
        <br />
        Nemotron 3 Diarization
      </span>
    </Place>
    <Place x={745} y={245} w={260} h={140} beat={2} delay={1} style={localBoxStyle}>
      <span>突き合わせ</span>
      <span style={localNoteStyle}>KIKIGAKIで調整</span>
    </Place>
    <Place x={1063} y={245} w={230} h={140} beat={2} delay={3} style={localBoxStyle}>
      <span>書き起こし</span>
      <span style={localNoteStyle}>話者付き</span>
    </Place>
    <Place x={1400} y={257} w={230} beat={2} delay={5} style={localFileStyle}>
      <svg viewBox="0 0 96 116" style={{ display: 'block', width: 96, height: 116 }} aria-hidden fontFamily="inherit">
        <path d="M6 4 H64 L90 30 V112 H6 Z" fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} strokeLinejoin="round" />
        <path d="M64 4 V30 H90" fill="none" stroke={color.ink} strokeWidth={stroke.base} strokeLinejoin="round" />
        <text x={48} y={86} fontSize={26} fontWeight={700} textAnchor="middle" fill={color.ink}>.md</text>
      </svg>
      <span>Markdown</span>
    </Place>
    <svg viewBox="0 0 1664 540" style={{ position: 'absolute', inset: 0, width: 1664, height: 540, overflow: 'visible' }} aria-hidden>
      <RelationArrow d="M130 315 H250 V220 H280" head="M266 208 L282 220 L266 232" beat={1} delay={1} />
      <RelationArrow d="M250 315 V410 H280" head="M266 398 L282 410 L266 422" beat={1} delay={1} />
      <RelationArrow d="M680 220 H708 V315 H735" head="M721 303 L737 315 L721 327" beat={2} />
      <RelationArrow d="M680 410 H708 V315" head="" beat={2} />
      <RelationArrow d="M1013 315 H1053" head="M1039 303 L1055 315 L1039 327" beat={2} delay={2} />
      <RelationArrow d="M1303 315 H1450" head="M1436 303 L1452 315 L1436 327" beat={2} delay={4} />
    </svg>
  </div>
);

// 3章: 議事録を作るAIのつまみのアイコン。
const ContextIcon = () => (
  <svg viewBox="0 0 200 200" style={iconStyle} aria-hidden>
    <path d="M20 60 H80 L96 76 H180 V170 H20 Z" fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} strokeLinejoin="round" />
    <path d="M52 50 H112 L128 66 V120 H52 Z" fill={color.sheet} stroke={color.teal} strokeWidth={stroke.thin} strokeLinejoin="round" />
    <path d="M100 40 H150 L164 54 V110 H100 Z" fill={color.sheet} stroke={color.gold} strokeWidth={stroke.thin} strokeLinejoin="round" />
    <path d="M20 96 H180 V170 H20 Z" fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} strokeLinejoin="round" />
  </svg>
);
const AgentIcon = () => (
  <svg viewBox="0 0 200 200" style={iconStyle} aria-hidden>
    <rect x={14} y={44} width={172} height={112} rx={14} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} />
    <image href={claudeLogo} x={36} y={68} width={60} height={60} />
    <image href={openaiLogo} x={106} y={68} width={60} height={60} />
  </svg>
);
const ModelIcon = () => (
  <svg viewBox="0 0 200 200" style={iconStyle} aria-hidden>
    <path
      d="M70 30 V50 M100 30 V50 M130 30 V50 M70 150 V170 M100 150 V170 M130 150 V170 M30 70 H50 M30 100 H50 M30 130 H50 M150 70 H170 M150 100 H170 M150 130 H170"
      stroke={color.ink}
      strokeWidth={stroke.base}
      strokeLinecap="round"
    />
    <rect x={50} y={50} width={100} height={100} rx={12} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} />
    <rect x={76} y={76} width={48} height={48} rx={6} fill={color.teal} />
  </svg>
);
const PromptIcon = () => (
  <svg viewBox="0 0 200 200" style={iconStyle} aria-hidden>
    <rect x={14} y={36} width={172} height={128} rx={12} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} />
    <path d="M38 80 L56 96 L38 112" fill="none" stroke={color.gold} strokeWidth={stroke.base} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M70 80 H160 M70 104 H140 M70 128 H120" stroke={color.faint} strokeWidth={stroke.thin} strokeLinecap="round" />
  </svg>
);

// 3章: 準備・最中・後始末のループ。
const phaseRowStyle: CSSProperties = { display: 'flex', alignItems: 'flex-start', width: '100%' };
const phaseStyle: CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: space.md };
const phaseNameStyle: CSSProperties = {
  boxSizing: 'border-box',
  padding: `${space.md}px ${space.lg}px`,
  background: color.sheet,
  border: `${stroke.thin}px solid ${color.ink}`,
  borderRadius: 'var(--osd-radius)',
  fontSize: type.lead,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  color: color.ink,
  textAlign: 'center',
};
const PhaseArrow = ({ beat }: { beat: number }) => (
  <div style={{ paddingTop: space.lg }}>
    <Arrow beat={beat} />
  </div>
);
const ReturnArrow = ({ beat }: { beat: number }) => {
  const enter = useMotion();
  return (
    <svg viewBox="0 0 1664 120" style={{ display: 'block', width: '100%', height: 'auto' }} aria-hidden fontFamily="inherit">
      <g style={enter('fade', beat)}>
        <path
          d="M1440 10 V70 Q1440 100 1410 100 H254 Q224 100 224 70 V24"
          fill="none"
          stroke={color.ink}
          strokeWidth={stroke.base}
          strokeLinecap="round"
          strokeDasharray="0.1 14"
        />
        <path d="M210 40 L224 18 L238 40" fill="none" stroke={color.ink} strokeWidth={stroke.base} strokeLinecap="round" strokeLinejoin="round" />
        <text x={832} y={112} fontSize={36} textAnchor="middle" fill={color.muted} stroke={color.paper} strokeWidth={14} paintOrder="stroke">
          次のMTGへ
        </text>
      </g>
    </svg>
  );
};

// ───────────────────────── ページ ─────────────────────────

const Cover: Page = () => (
  <Shell band folio={false}>
    <div style={coverStyle}>
      <div style={coverCopyStyle}>
        <Wordmark logo={logo} />
        <h1 style={catchStyle}>声をすべてドキュメントに</h1>
        <div style={bylineStyle}>2026/11/11　Tadashi Aikawa</div>
      </div>
      <VoiceToDoc />
    </div>
  </Shell>
);

const takeawayListStyle: CSSProperties = { display: 'flex', flexDirection: 'column', gap: space.lg };
const takeawayItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: space.lg,
  fontFamily: 'var(--osd-font-display)',
  fontSize: type.heading,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
  color: color.ink,
};
const takeawayNumberStyle: CSSProperties = { width: shape.mark, color: color.faint, fontVariantNumeric: 'tabular-nums' };
const TakeawayItem = ({ n, children, beat }: { n: number; children: ReactNode; beat: number }) => {
  const enter = useMotion();
  return (
    <div style={{ ...takeawayItemStyle, ...enter('rise', beat) }}>
      <span style={takeawayNumberStyle}>{n}</span>
      <span>{children}</span>
    </div>
  );
};

const Takeaway: Page = () => (
  <Shell beats={3}>
    <div style={statementBlockStyle}>
      <Sub>本日お伝えしたいこと</Sub>
      <div style={takeawayListStyle}>
        <TakeawayItem n={1} beat={1}>
          KIKIGAKIの<Em>思想</Em>
        </TakeawayItem>
        <TakeawayItem n={2} beat={2}>
          KIKIGAKIで<Em>できること・できないこと</Em>
        </TakeawayItem>
        <TakeawayItem n={3} beat={3}>
          KIKIGAKIを<Em>業務に取り入れる</Em>イメージ
        </TakeawayItem>
      </div>
    </div>
  </Shell>
);

const Chapter1: Page = () => <ChapterDivider chapters={CHAPTERS} active={1} />;

const TwoPeople: Page = () => (
  <Shell beats={2}>
    <Title eyebrow="なぜ作ったか">新規プロダクトの立ち上げに参加</Title>
    <Stage>
      <TalkWeek beat={1} />
      <div style={columnStackStyle}>
        <Lead beat={1} delay={5}>毎日のように</Lead>
        <Lead beat={1} delay={6}>話すことがたくさんある</Lead>
        <div style={{ paddingTop: space.lg }}>
          <Lead beat={2}>
            開発は<Em>私ひとり</Em>
          </Lead>
        </div>
        <PairPeople beat={2} />
      </div>
    </Stage>
  </Shell>
);

// 1章: MTGの3つのフェーズと、私がこなす仕事。本番の3つは同時にこなすので朱の枠で囲む。
// 3列とも同じ枠の内側に中央揃えで並べ、強調する列だけ枠の線と文字を朱の太字にする。
const dutyListStyle: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: space.xs,
  padding: `${space.md}px 0`,
  border: `${stroke.base}px dashed transparent`,
  borderRadius: 'var(--osd-radius)',
  fontSize: type.bodyMin,
  lineHeight: leading.body,
  whiteSpace: 'nowrap',
  color: color.ink,
};
const DutyPhase = ({ name, beat, children }: { name: string; beat: number; children: ReactNode }) => {
  const enter = useMotion();
  return (
    <div style={{ ...phaseStyle, ...enter('rise', beat) }}>
      <div style={phaseNameStyle}>{name}</div>
      {children}
    </div>
  );
};
const LiveDuties = ({ beat }: { beat: number }) => {
  const together = useBeatShown(beat);
  const enter = useMotion();
  const live: CSSProperties = together ? { borderColor: 'var(--osd-accent)', color: 'var(--osd-accent)', fontWeight: weight.bold } : {};
  return (
    <div style={{ ...dutyListStyle, ...live }}>
      <span>進行</span>
      <span>議論</span>
      <span>書記</span>
      <span style={{ fontSize: type.caption, ...enter('fade', beat) }}>3つを同時に</span>
    </div>
  );
};

const AllRoles: Page = () => (
  <Shell beats={6}>
    <Title eyebrow="なぜ作ったか">MTGをひとりで回す厳しさ</Title>
    <Stage>
      <div style={{ display: 'flex', flexDirection: 'column', gap: space.md, width: '100%' }}>
        <div style={phaseRowStyle}>
          <DutyPhase name="準備" beat={1}>
            <div style={dutyListStyle}>
              <span>予定の確保</span>
              <span>議題の整理</span>
              <span>議事録の下書き</span>
            </div>
          </DutyPhase>
          <PhaseArrow beat={2} />
          <DutyPhase name="本番" beat={2}>
            <LiveDuties beat={5} />
          </DutyPhase>
          <PhaseArrow beat={3} />
          <DutyPhase name="後処理" beat={3}>
            <div style={dutyListStyle}>
              <span>議事録の清書・共有</span>
              <span>ドキュメントへの反映</span>
              <span>タスク・開発</span>
            </div>
          </DutyPhase>
        </div>
        <ReturnArrow beat={4} />
      </div>
    </Stage>
    <CoverPicture src={mimizou} alt="みみぞうがマイク・ペン・ノート・資料を抱えて目を回している" beat={6} />
  </Shell>
);

const MeetingFuture: Page = () => (
  <Shell beats={5}>
    <Title eyebrow="付録">これからのMTGで大切になること</Title>
    <Stage>
      <div style={pipelineBlockStyle}>
        <Sub>MTGの議事録は、録音してAIで作るのが当たり前に</Sub>
        <div style={pipelineRowStyle}>
          <PipeBox beat={1}>声</PipeBox>
          <PipeArrow beat={1} delay={1} labelBeat={2} label="① 認識される喋り方" />
          <PipeBox beat={1} delay={2}>文字</PipeBox>
          <PipeArrow beat={1} delay={3} labelBeat={3} label="② 意図が伝わる内容" />
          <PipeBox beat={1} delay={4}>議事録</PipeBox>
        </div>
        <div style={futureFootStyle}>
          <Lead beat={4}>
            今のうちに慣れて<Em>訓練しておく</Em>
          </Lead>
          <ArticleCard
            href="https://nocturne.mamansoft.net/posts/2026-10-05-gave-in-to-voice-input/"
            image={articleCover}
            title={
              <>
                キーボードを愛する私でさえ
                <br />
                『音声入力』からは逃げられない
              </>
            }
            site="nocturne.mamansoft.net"
            beat={5}
            row
          />
        </div>
      </div>
    </Stage>
  </Shell>
);

const WhyBuilt: Page = () => (
  <Shell beats={2}>
    <div style={statementBlockStyle}>
      <p style={whyStatementStyle}>
        記録は録音とAIの議事録に
        <br />
        任せようとしたけど
      </p>
      <WhyLine beat={1}>
        Google Meetでは<Em>満足できなかった</Em>
      </WhyLine>
      <Lead beat={2}>だから自分でKIKIGAKIを作った</Lead>
    </div>
  </Shell>
);

const Appendix: Page = () => (
  <Shell>
    <div style={chapterBodyStyle}>
      <h1 style={chapterTitleStyle}>付録</h1>
    </div>
  </Shell>
);

const Chapter2: Page = () => <ChapterDivider chapters={CHAPTERS} active={2} />;

const Introduce: Page = () => (
  <Shell beats={1}>
    <AppShot />
    <div style={introStyle}>
      <div style={introMarkStyle}>
        <img src={logo} alt="" style={introLogoStyle} />
        <span style={introNameStyle}>KIKIGAKI</span>
      </div>
      <h1 style={introCatchStyle}>
        声をすべて
        <br />
        ドキュメントに
      </h1>
      <p style={introLineStyle}>
        声を書き起こして
        <br />
        Markdownに残すmacOSアプリ
      </p>
      <IntroAgent beat={1} />
    </div>
  </Shell>
);

// 「議事録」に朱の線を引いて消し、上に「成果物」と書き直す。
const correctedWordStyle: CSSProperties = { position: 'relative', display: 'inline-block' };
const strikeStyle: CSSProperties = {
  position: 'absolute',
  left: -space.xs,
  right: -space.xs,
  top: '52%',
  height: stroke.bold,
  borderRadius: stroke.bold,
  background: 'var(--osd-accent)',
  transformOrigin: 'left',
};
const rewriteStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: '88%',
  transform: 'translateX(-50%)',
  fontSize: type.statementSm,
  color: 'var(--osd-accent)',
  whiteSpace: 'nowrap',
};
const CorrectedWord = ({ from, to, beat }: { from: string; to: string; beat: number }) => {
  const enter = useMotion();
  return (
    <span style={correctedWordStyle}>
      {from}
      <span aria-hidden style={{ ...strikeStyle, ...enter('underline', beat) }} />
      <span style={rewriteStyle}>
        <span style={{ display: 'inline-block', ...enter('rise', beat, 4) }}>{to}</span>
      </span>
    </span>
  );
};

const NotJustMinutes: Page = () => (
  <Shell beats={1}>
    <div style={notJustGridStyle}>
      <div style={notJustCopyStyle}>
        <Sub>よくある見方</Sub>
        <div style={{ paddingTop: space.xxl }}>
          <Quote>
            「声から<CorrectedWord from="議事録" to="成果物" beat={1} />を作るアプリ」
          </Quote>
        </div>
      </div>
      <VoiceFan />
    </div>
  </Shell>
);

// 2章: KIKIGAKIが目指すところ。キーボードで作るのと同じように、声で作る。座標は1300×600の舞台の上で決める。
const aimSvgStyle: CSSProperties = { display: 'block', width: 1560, height: 'auto', flex: 'none' };
const aimLine = (tone: string) => ({ fill: 'none', stroke: tone, strokeWidth: stroke.base, strokeLinecap: 'round', strokeLinejoin: 'round' }) as const;
const AimArrow = ({ x1, x2, y, tone = color.ink }: { x1: number; x2: number; y: number; tone?: string }) => (
  <g>
    <path d={`M${x1} ${y} H${x2}`} {...aimLine(tone)} />
    <path d={`M${x2 - 18} ${y - 14} L${x2} ${y} L${x2 - 18} ${y + 14}`} {...aimLine(tone)} />
  </g>
);
const AimLabel = ({ x, y, tone = color.ink, size = 36, children }: { x: number; y: number; tone?: string; size?: number; children: ReactNode }) => (
  <text x={x} y={y} fontSize={size} fontWeight={weight.bold} textAnchor="middle" fill={tone}>
    {children}
  </text>
);
const KeyboardIcon = ({ x, cy }: { x: number; cy: number }) => (
  <g>
    <rect x={x} y={cy - 70} width={260} height={140} rx={16} {...aimLine(color.ink)} fill={color.sheet} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={`a${i}`} x={x + 28 + i * 36} y={cy - 46} width={26} height={22} rx={4} fill={color.faint} />
    ))}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={`b${i}`} x={x + 40 + i * 36} y={cy - 12} width={26} height={22} rx={4} fill={color.faint} />
    ))}
    <rect x={x + 70} y={cy + 22} width={120} height={22} rx={4} fill={color.faint} />
  </g>
);
const LaptopIcon = ({ x, cy }: { x: number; cy: number }) => (
  <g>
    <rect x={x + 20} y={cy - 86} width={220} height={146} rx={10} {...aimLine(color.ink)} fill={color.sheet} />
    <path d={`M${x + 52} ${cy - 48} H${x + 168} M${x + 52} ${cy - 18} H${x + 200} M${x + 52} ${cy + 12} H${x + 140}`} stroke={color.faint} strokeWidth={stroke.thin} strokeLinecap="round" />
    <path d={`M${x} ${cy + 66} H${x + 260} L${x + 240} ${cy + 86} H${x + 20} Z`} {...aimLine(color.ink)} fill={color.sheet} />
  </g>
);
// 出てくる成果物。キーボードの行とKIKIGAKIの行で同じ箱を置く。
const MadeThings = ({ x, cy }: { x: number; cy: number }) => (
  <g>
    <rect x={x} y={cy - 70} width={220} height={140} rx={10} {...aimLine(color.ink)} fill={color.sheet} />
    <AimLabel x={x + 110} y={cy + 15} size={44}>
      成果物
    </AimLabel>
  </g>
);
// 話す場面の線画。みんなで話し合う絵と、ひとりで喋る絵の左側(人と机)だけを切り出して並べる。
const TalkScenes = ({ x, cy }: { x: number; cy: number }) => (
  <g>
    <image href={meeting} x={x} y={cy - 90} width={295} height={180} />
    <svg x={x + 330} y={cy - 90} width={150} height={180} viewBox="0 0 420 504">
      <image href={solo} x={0} y={66} width={1498} height={372} />
    </svg>
  </g>
);

// 入口だけを入れ替える。キーボードが消えて、話す絵が浮かぶ。
// キーボードは話す絵の右端にそろえ、どちらの入口でも矢印までの間隔を40にする。矢印の前後も同じ40。
const SwapLayer = ({ visible, children }: { visible: boolean; children: ReactNode }) => (
  <g style={{ opacity: visible ? 1 : 0, transition: `opacity ${motion.fade}ms ${motion.ease}` }}>{children}</g>
);
const KeyboardSwap = ({ beat }: { beat: number }) => {
  const voice = useBeatShown(beat);
  return (
    <svg viewBox="0 0 1364 330" style={aimSvgStyle} aria-hidden fontFamily="inherit">
      <SwapLayer visible={!voice}>
        <KeyboardIcon x={220} cy={150} />
        <AimLabel x={350} y={292}>指で打つ</AimLabel>
      </SwapLayer>
      <SwapLayer visible={voice}>
        <TalkScenes x={0} cy={150} />
        <AimLabel x={258} y={292} tone="var(--osd-accent)">話し合う・ひとりで喋る</AimLabel>
      </SwapLayer>
      <AimArrow x1={520} x2={640} y={150} />
      <LaptopIcon x={680} cy={150} />
      <AimArrow x1={980} x2={1100} y={150} />
      <MadeThings x={1140} cy={150} />
    </svg>
  );
};

// 図が1行だけで低いので、上寄せをやめて中央寄りに置く。下の余白を足して、画面の下へ沈みすぎないようにする。
const centeredStageItemStyle: CSSProperties = { flex: 1, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: space.xxl + space.xl };
const KeyboardToVoice: Page = () => (
  <Shell beats={1}>
    <Title eyebrow="KIKIGAKIが目指すところ">キーボードに代わるインターフェース</Title>
    <Stage>
      <div style={centeredStageItemStyle}>
        <KeyboardSwap beat={1} />
      </div>
    </Stage>
  </Shell>
);

const TwoLayers: Page = () => (
  <Shell beats={3}>
    <Title eyebrow="KIKIGAKIとは">KIKIGAKIの2層構造</Title>
    <Stage>
      <div style={layerRowStyle}>
        <LayerGroup number="1層目" name="声を記録する" note="文字起こしと話者判別" beat={1}>
          <Node beat={1}>声</Node>
          <Arrow beat={1} delay={1} />
          <Node beat={1} delay={2} tone="accent">
            Markdown
          </Node>
        </LayerGroup>
        <LayerGroup number="2層目" name="AIエージェントとつなぐ" note="別の情報も合わせて動かす" beat={2}>
          <Arrow beat={2} />
          <AgentOutside beat={2} delay={1} accent />
          <Arrow beat={3} />
          <Node beat={3} delay={1}>成果物</Node>
        </LayerGroup>
      </div>
    </Stage>
  </Shell>
);

const Relation: Page = () => (
  <Shell beats={4}>
    <LayerTitle active={2}>KIKIGAKIとAIエージェント</LayerTitle>
    <Stage>
      <RelationMap />
    </Stage>
  </Shell>
);

const Speakers: Page = () => (
  <Shell beats={3}>
    <LayerTitle active={1}>話す人ごとの<Em>書き起こし</Em></LayerTitle>
    <Stage>
      <div style={speakersRowStyle}>
        <div style={speakersVoiceStyle}>
          <span style={speakersCaptionStyle}>声</span>
          <img src={meeting} alt="" style={{ display: 'block', width: 360, height: 'auto' }} />
        </div>
        <Arrow beat={0} />
        <Sheet angle={tilt.left} padded width={1080}>
          <Transcript>
            <TranscriptLine time="01:04:12" name="話者A" initial="A" speaker="teal" beat={1}>
              来週の勉強会の準備を決めましょう
            </TranscriptLine>
            <TranscriptLine time="01:04:22" name="話者B" initial="B" speaker="gold" beat={2}>
              資料は5枚にします
            </TranscriptLine>
            <TranscriptLine time="01:04:33" name="話者C" initial="C" speaker="sumi" beat={3} state="live">
              最後に質問の時間が欲しいです
            </TranscriptLine>
          </Transcript>
        </Sheet>
      </div>
    </Stage>
  </Shell>
);

const AgentWorks: Page = () => (
  <Shell beats={2}>
    <LayerTitle active={2}>AIエージェントを使う標準機能</LayerTitle>
    <Stage>
      <div style={worksGridStyle}>
        <MinutesBoardCard beat={1} />
        <WorkCard name="話者名の推定" beat={2}>
          <SheetVideo src={speakerNames} label="話者Aの名前が、AIの推定で本人の名前に変わる" beat={2} style={workMediaStyle} />
        </WorkCard>
      </div>
    </Stage>
  </Shell>
);

const DiffRealtime: Page = () => (
  <Shell beats={2}>
    <Title eyebrow="Google Meetとの違い 1">議事録ができるタイミング</Title>
    <Stage>
      <MeetingTimeline />
    </Stage>
  </Shell>
);

// 3章: 議事録を作るAIの4つのつまみ。Google Meetは決まった作り方だけ。
const customGridStyle: CSSProperties = { ...localGridStyle, gridTemplateColumns: 'repeat(4, auto)', justifyContent: 'space-between', whiteSpace: 'nowrap' };
const DiffCustom: Page = () => (
  <Shell beats={2}>
    <Title eyebrow="Google Meetとの違い 2">議事録を作るAIのカスタマイズ</Title>
    <Stage>
      <div style={{ ...centeredStageItemStyle, flexDirection: 'column', gap: space.xxl }}>
        <div style={customGridStyle}>
          <LocalItem icon={<ContextIcon />} title="コンテキスト" note="手元のコードや資料" beat={1} />
          <LocalItem icon={<AgentIcon />} title="AIエージェント" note="Claude Code・Codex" beat={1} delay={1} />
          <LocalItem icon={<ModelIcon />} title="モデル" note="速さと賢さで選ぶ" beat={1} delay={2} />
          <LocalItem icon={<PromptIcon />} title="プロンプト" note="書き方を指示する" beat={1} delay={3} />
        </div>
        <Lead beat={2}>
          使い方に合わせて<Em>柔軟に組み合わせられる</Em>
        </Lead>
      </div>
    </Stage>
  </Shell>
);

const DiffLocal: Page = () => (
  <Shell beats={3}>
    <Title eyebrow="Google Meetとの違い 3">ローカルで完結する文字起こしと話者判別</Title>
    <Stage>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.lg, width: '100%' }}>
        <LocalMap />
        <Lead beat={3}>
          どちらも<Em>Macの中のAIモデル</Em>で動く
        </Lead>
      </div>
    </Stage>
  </Shell>
);

// 3章: デメリットのアイコン。
// 動く環境: macOS 26のMacと、AI連携に要るherdr。
const EnvIcon = () => (
  <svg viewBox="0 0 200 200" style={iconStyle} aria-hidden fontFamily="inherit">
    <rect x={24} y={36} width={140} height={100} rx={10} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} />
    <path d="M8 150 H180 L168 166 H20 Z" fill={color.sheet} stroke={color.ink} strokeWidth={stroke.base} strokeLinejoin="round" />
    <text x={94} y={104} fontSize={48} fontWeight={700} textAnchor="middle" fill={color.ink}>26</text>
    <image href={herdrLogo} x={136} y={108} width={60} height={60} />
  </svg>
);
// 話者判別は8人まで。9人目は薄くして朱の×を重ねる。
const CrowdIcon = () => {
  const seats = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => ({ cx: 40 + (i % 3) * 60, cy: 36 + Math.floor(i / 3) * 62 }));
  return (
    <svg viewBox="0 0 200 200" style={iconStyle} aria-hidden>
      {seats.map(({ cx, cy }, i) => {
        const tone = i === 8 ? color.faint : color.ink;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={11} fill={color.sheet} stroke={tone} strokeWidth={stroke.thin} />
            <path d={`M${cx - 19} ${cy + 33} Q${cx} ${cy + 8} ${cx + 19} ${cy + 33}`} fill="none" stroke={tone} strokeWidth={stroke.thin} strokeLinecap="round" />
          </g>
        );
      })}
      <path d="M144 142 L176 178 M176 142 L144 178" stroke="var(--osd-accent)" strokeWidth={stroke.bold} strokeLinecap="round" />
    </svg>
  );
};
// 使いこなすまでの道のり。急な階段の上に旗。
const HurdleIcon = () => (
  <svg viewBox="0 0 200 200" style={iconStyle} aria-hidden>
    <path d="M16 180 H56 V144 H96 V108 H136 V72 H176" fill="none" stroke={color.ink} strokeWidth={stroke.base} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M168 72 V22" stroke={color.ink} strokeWidth={stroke.base} strokeLinecap="round" />
    <path d="M168 22 L196 33 L168 44 Z" fill="var(--osd-accent)" stroke="var(--osd-accent)" strokeWidth={stroke.thin} strokeLinejoin="round" />
  </svg>
);
const Demerits: Page = () => (
  <Shell beats={3}>
    <Title eyebrow="Google Meetとの違い">デメリット</Title>
    <Stage>
      <div style={centeredStageItemStyle}>
        <div style={localGridStyle}>
          <LocalItem
            icon={<EnvIcon />}
            title="環境が限られる"
            note={
              <>
                macOS 26以降
                <br />
                AI連携にはherdrが要る
              </>
            }
            beat={1}
          />
          <LocalItem icon={<CrowdIcon />} title="大人数は苦手" note="話者判別は最大8人まで" beat={2} />
          <LocalItem icon={<HurdleIcon />} title="使いこなしが大変" note="自由なぶん、とっつきにくい" beat={3} />
        </div>
      </div>
    </Stage>
  </Shell>
);

const Chapter3: Page = () => <ChapterDivider chapters={CHAPTERS} active={3} />;

const Chapter4: Page = () => <ChapterDivider chapters={CHAPTERS} active={4} />;

const Chapter5: Page = () => <ChapterDivider chapters={CHAPTERS} active={5} />;

// 4章: 使い方レシピ。場面ごとに、入力とKIKIGAKIの設定をレシピのカードに書く。
const recipeSceneStyle: CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.md };
const recipeCardStyle: CSSProperties = {
  boxSizing: 'border-box',
  display: 'grid',
  gridTemplateColumns: 'auto auto',
  columnGap: space.xl,
  rowGap: space.md,
  padding: `${space.lg}px ${space.xl}px`,
  background: color.sheet,
  border: `${stroke.thin}px solid ${color.ink}`,
  borderRadius: 'var(--osd-radius)',
  boxShadow: color.sheetShadow,
  fontSize: type.bodyMin,
  lineHeight: leading.heading,
  whiteSpace: 'nowrap',
};
const recipeKeyStyle: CSSProperties = { fontSize: type.caption, fontWeight: weight.bold, color: color.muted, alignSelf: 'center' };
const recipeValueStyle: CSSProperties = { fontWeight: weight.bold, color: color.ink };
const RecipeRow = ({ name, beat, delay = 0, children }: { name: string; beat: number; delay?: number; children: ReactNode }) => {
  const enter = useMotion();
  return (
    <>
      <span style={{ ...recipeKeyStyle, ...enter('fade', beat, delay) }}>{name}</span>
      <span style={{ ...recipeValueStyle, ...enter('fade', beat, delay) }}>{children}</span>
    </>
  );
};
const RecipeAgenda: Page = () => (
  <Shell beats={1}>
    <Title eyebrow="使い方レシピ 1">議題が決まっているMTG</Title>
    <Stage>
      <div style={{ ...centeredStageItemStyle, gap: space.xxl }}>
        <div style={recipeSceneStyle}>
          <Illustration src={meeting} width={560} />
          <Sub>例: 朝会・定例会議</Sub>
        </div>
        <div style={recipeCardStyle}>
          <RecipeRow name="入力" beat={1}>複数人の会話</RecipeRow>
          <RecipeRow name="話者判別" beat={1} delay={1}>オン</RecipeRow>
          <RecipeRow name="議事録" beat={1} delay={2}>議題と参加者を書いた下書き</RecipeRow>
          <RecipeRow name="ボード" beat={1} delay={3}>なし</RecipeRow>
          <RecipeRow name="自動送信" beat={1} delay={4}>
            短い間隔で<Em>議事録を更新</Em>
          </RecipeRow>
          <RecipeRow name="手動送信" beat={1} delay={5}>なし</RecipeRow>
        </div>
      </div>
    </Stage>
  </Shell>
);
// 4章: 朝会の流れを4コマで見せる。主役は議事録の下書きで、4コマとも同じ位置に置き、状態だけ変える。
// 座標は1664×900の舞台の上で決める。コマは幅380、間48。
const storyPanels = [0, 428, 856, 1284];
const storyDoc = { dx: 40, y: 330, w: 300, h: 340 };
const storyNames = ['星野', '青木', '森'];
const storyMono = 'ui-monospace, Menlo, monospace';
// 下書きの材料を集める先と、清書を共有する先。どちらも同じ3つ。
const storyTools = [
  { label: 'Slack', x: 0, w: 104 },
  { label: 'Jira', x: 116, w: 96 },
  { label: 'Confluence', x: 224, w: 156 },
];
// 議事録の下書き。集めた材料は金の線、MTGで話した中身は墨の線。
// spoken: 'blank' は話す前の空き、'draw' はクリックで書き込まれていく、'done' は書き終わり。
const StoryMinutes = ({ x, spoken, beat = 0 }: { x: number; spoken: 'blank' | 'draw' | 'done'; beat?: number }) => {
  const enter = useMotion();
  const left = x + storyDoc.dx;
  const { y, w, h } = storyDoc;
  return (
    <g>
      <rect x={left} y={y} width={w} height={h} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <text x={left + 20} y={y + 44} fontSize={28} fontWeight={700} fill={color.ink}>
        朝会 11/12
      </text>
      <text x={left + 20} y={y + 84} fontSize={22} fontWeight={700} fill="var(--osd-accent)">
        参加者: {storyNames.join('・')}
      </text>
      {storyNames.map((name, i) => {
        const top = y + 130 + i * 70;
        const line = `M${left + 28} ${top + 40} H${left + 28 + (i === 1 ? 200 : 236)}`;
        return (
          <g key={name}>
            <text x={left + 20} y={top} fontSize={22} fontWeight={700} fill={color.ink}>
              {name}
            </text>
            <path d={`M${left + 28} ${top + 18} H${left + 28 + 170}`} stroke={color.gold} strokeWidth={stroke.thin} strokeLinecap="round" />
            {spoken === 'blank' ? (
              <path d={line} stroke={color.faint} strokeWidth={shape.hairline} strokeDasharray="6 8" strokeLinecap="round" />
            ) : (
              <path
                d={line}
                stroke={color.ink}
                strokeWidth={stroke.thin}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                style={spoken === 'draw' ? enter('draw', beat, 4 + i * 4) : undefined}
              />
            )}
          </g>
        );
      })}
    </g>
  );
};
const StoryChip = ({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) => (
  <g>
    <rect x={x} y={y} width={w} height={56} rx={28} fill={color.shade} stroke={color.ink} strokeWidth={shape.hairline} />
    <text x={x + w / 2} y={y + 36} fontSize={22} fontWeight={700} textAnchor="middle" fill={color.ink}>
      {children}
    </text>
  </g>
);
const StoryGroup = ({ beat, delay = 0, children }: { beat: number; delay?: number; children: ReactNode }) => {
  const enter = useMotion();
  return <g style={enter('fade', beat, delay)}>{children}</g>;
};
const StoryPhase = ({ x, w, beat, children }: { x: number; w: number; beat: number; children: ReactNode }) => (
  <StoryGroup beat={beat}>
    <rect x={x} y={0} width={w} height={96} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
    <text x={x + w / 2} y={66} fontSize={type.bodyMin} fontWeight={700} textAnchor="middle" fill={color.ink}>
      {children}
    </text>
  </StoryGroup>
);
const StoryCaption = ({ x, beat, children }: { x: number; beat: number; children: ReactNode }) => (
  <StoryGroup beat={beat} delay={2}>
    <text x={x + 190} y={760} fontSize={type.caption} fontWeight={700} textAnchor="middle" fill={color.ink}>
      {children}
    </text>
  </StoryGroup>
);
// 書き上がった議事録の上に押す「清書」の判。上から押し付けるように縮んで止まる。
const StoryStamp = ({ cx, cy, beat, delay = 0, label = '清書' }: { cx: number; cy: number; beat: number; delay?: number; label?: string }) => {
  const enter = useMotion();
  return (
    <g transform={`rotate(-8 ${cx} ${cy})`}>
      <g style={{ transformBox: 'fill-box', transformOrigin: 'center', ...enter('stamp', beat, delay) }}>
        <rect x={cx - 110} y={cy - 52} width={220} height={104} rx={10} fill={color.sheet} fillOpacity={0.9} stroke="var(--osd-accent)" strokeWidth={stroke.base + 1} />
        <text x={cx} y={cy + 22} fontSize={64} fontWeight={800} textAnchor="middle" fill="var(--osd-accent)" letterSpacing="0.1em">
          {label}
        </text>
      </g>
    </g>
  );
};
// コマとコマの間の矢印。下書きの高さの真ん中に置く。
const StoryNext = ({ x, beat }: { x: number; beat: number }) => (
  <RelationArrow d={`M${x + 6} 500 H${x + 40}`} head={`M${x + 28} 488 L${x + 42} 500 L${x + 28} 512`} beat={beat} />
);
const [p1, p2, p3, p4] = storyPanels;
// 2コマ目は、どのレシピでも同じ。CLIで予約すると、開始シートの先頭にそのMTGが選ばれている。
// x: 置くコマ。
const StoryReserve = ({ name, at, x = p2, beat = 2 }: { name: string; at: string; x?: number; beat?: number }) => (
  <>
    {x === p1 ? null : <StoryNext x={x - 48} beat={beat} />}
    <StoryGroup beat={beat}>
      <rect x={x} y={150} width={380} height={150} rx={10} fill={color.ink} />
      <text x={x + 22} y={200} fontSize={22} fontFamily={storyMono} fill={color.sheet}>
        $ kikigaki-cli next add
      </text>
      <text x={x + 22} y={238} fontSize={22} fontFamily={storyMono} fill={color.sheet}>
        --minutes {name}.md
      </text>
      <text x={x + 22} y={274} fontSize={22} fontFamily={storyMono} fill={color.sheet}>
        --at {at}
      </text>
    </StoryGroup>
    <RelationArrow d={`M${x + 190} 308 V350`} head={`M${x + 178} 336 L${x + 190} 352 L${x + 202} 336`} beat={beat} delay={2} />
    <StoryGroup beat={beat} delay={3}>
      <rect x={x + 20} y={362} width={340} height={300} rx={12} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <image href={logo} x={x + 40} y={380} width={36} height={36} />
      <text x={x + 88} y={408} fontSize={24} fontWeight={700} fill={color.ink}>
        録音を開始
      </text>
      <rect x={x + 40} y={436} width={300} height={64} rx={8} fill={color.shade} stroke="var(--osd-accent)" strokeWidth={stroke.thin} />
      <text x={x + 60} y={478} fontSize={26} fontWeight={700} fill={color.ink}>
        {name} {at}
      </text>
      <path d={`M${x + 60} 532 H${x + 250} M${x + 60} 568 H${x + 210}`} stroke={color.rule} strokeWidth={stroke.thin} strokeLinecap="round" />
      <rect x={x + 220} y={598} width={120} height={48} rx={8} fill="var(--osd-accent)" />
      <text x={x + 280} y={631} fontSize={24} fontWeight={700} textAnchor="middle" fill={color.sheet}>
        開始 ⏎
      </text>
    </StoryGroup>
    <StoryCaption x={x} beat={beat}>CLIで予約</StoryCaption>
  </>
);
// 4コマ目の共有先。清書から上へ矢印を伸ばす。
const StoryShare = ({
  delay,
  tools = storyTools,
  caption = '必要な場所へ共有',
  beat = 4,
}: {
  delay: number;
  tools?: typeof storyTools;
  caption?: string;
  beat?: number;
}) => (
  <>
    {tools.map(({ label, x, w }, i) => (
      <g key={label}>
        <RelationArrow
          d={`M${p4 + x + w / 2} 322 V244`}
          head={`M${p4 + x + w / 2 - 12} 258 L${p4 + x + w / 2} 242 L${p4 + x + w / 2 + 12} 258`}
          beat={beat}
          delay={delay + i}
        />
        <StoryGroup beat={beat} delay={delay + 1 + i}>
          <StoryChip x={p4 + x} y={170} w={w}>
            {label}
          </StoryChip>
        </StoryGroup>
      </g>
    ))}
    <StoryCaption x={p4} beat={beat}>{caption}</StoryCaption>
  </>
);
// 4章: ボードの縮図。論点の箱が矢印でつながり、いま話している箱を朱にする。
// grow: 'draw' はクリックで箱が順に増えていく、'done' は出来上がり。
const storyBoardNodes = [
  { label: 'テーマ', cx: 150, cy: 30 },
  { label: '案A', cx: 66, cy: 94 },
  { label: '案B', cx: 234, cy: 94 },
  { label: '懸念', cx: 66, cy: 158 },
  { label: '決定', cx: 234, cy: 158, now: true },
];
const storyBoardEdges = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 4],
];
// bare: 清書の中に収めるときは、外枠を描かない。
const StoryBoard = ({ x, y, grow, beat = 0, bare = false }: { x: number; y: number; grow: 'draw' | 'done'; beat?: number; bare?: boolean }) => {
  const enter = useMotion();
  const at = (i: number) => (grow === 'draw' ? enter('fade', beat, 3 + i * 4) : undefined);
  return (
    <g>
      {bare ? null : <rect x={x} y={y} width={300} height={220} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />}
      <text x={x + 16} y={y + 30} fontSize={20} fontWeight={700} fill={color.muted}>
        ボード
      </text>
      <g transform={`translate(${x} ${y + 30})`}>
        {storyBoardEdges.map(([from, to]) => {
          const a = storyBoardNodes[from];
          const b = storyBoardNodes[to];
          return <path key={`${from}-${to}`} d={`M${a.cx} ${a.cy + 18} L${b.cx} ${b.cy - 18}`} stroke={color.ink} strokeWidth={shape.hairline} style={at(to)} />;
        })}
        {storyBoardNodes.map(({ label, cx, cy, now }, i) => (
          <g key={label} style={at(i)}>
            <rect
              x={cx - 52}
              y={cy - 18}
              width={104}
              height={36}
              rx={6}
              fill={color.shade}
              stroke={now ? 'var(--osd-accent)' : color.ink}
              strokeWidth={now ? stroke.thin : shape.hairline}
            />
            <text x={cx} y={cy + 7} fontSize={20} fontWeight={700} textAnchor="middle" fill={color.ink}>
              {label}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
};
// 4章: 参加者だけを書いた議事録。要所で手動で頼んだ分だけ、線が増える。
const StoryNotes = ({ x, y, title, state, beat = 0 }: { x: number; y: number; title: string; state: 'blank' | 'draw' | 'done'; beat?: number }) => {
  const enter = useMotion();
  const w = 300;
  return (
    <g>
      <rect x={x} y={y} width={w} height={140} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <text x={x + 20} y={y + 36} fontSize={24} fontWeight={700} fill={color.ink}>
        {title}
      </text>
      <text x={x + 20} y={y + 66} fontSize={20} fontWeight={700} fill="var(--osd-accent)">
        参加者: {storyNames.join('・')}
      </text>
      {[0, 1].map((i) => {
        const d = `M${x + 24} ${y + 94 + i * 26} H${x + 24 + (i === 0 ? 236 : 180)}`;
        return state === 'blank' ? (
          <path key={i} d={d} stroke={color.faint} strokeWidth={shape.hairline} strokeDasharray="6 8" strokeLinecap="round" />
        ) : (
          <path
            key={i}
            d={d}
            stroke={color.ink}
            strokeWidth={stroke.thin}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            style={state === 'draw' ? enter('draw', beat, 12 + i * 8) : undefined}
          />
        );
      })}
    </g>
  );
};
// 4章: 議事録とボードを1枚にまとめた清書。上半分が議事録、下半分がボード。
const StoryCleanCopy = ({ x, y, title }: { x: number; y: number; title: string }) => (
  <g>
    <rect x={x} y={y} width={300} height={380} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
    <text x={x + 20} y={y + 38} fontSize={24} fontWeight={700} fill={color.ink}>
      {title}
    </text>
    <text x={x + 20} y={y + 70} fontSize={20} fontWeight={700} fill="var(--osd-accent)">
      参加者: {storyNames.join('・')}
    </text>
    <path
      d={`M${x + 24} ${y + 104} H${x + 260} M${x + 24} ${y + 132} H${x + 230} M${x + 24} ${y + 160} H${x + 250}`}
      stroke={color.ink}
      strokeWidth={stroke.thin}
      strokeLinecap="round"
    />
    <path d={`M${x + 16} ${y + 184} H${x + 284}`} stroke={color.rule} strokeWidth={shape.hairline} />
    <g transform={`translate(${x + 15} ${y + 180}) scale(0.9)`}>
      <StoryBoard x={0} y={0} grow="done" bare />
    </g>
  </g>
);
// 4章: 話しながら育つ成果物。上にスライド4枚、下に原稿。grow: 'draw' はクリックで順に増える。
// 指示が3回出るのに合わせて、成果物が3回に分けて育つ。値はクリックからの遅れ(motion.staggerの倍数)。
// 1回目「2枚目に図を足して」でスライド2枚、2回目「原稿の導入を書いて」で原稿の2行、3回目でスライド2枚と原稿の残り。
const storyRequestStep = 14;
const artifactSlideDelays = [3, 5, 3 + storyRequestStep * 2, 5 + storyRequestStep * 2];
const artifactLineDelays = [3 + storyRequestStep, 6 + storyRequestStep, 7 + storyRequestStep * 2, 10 + storyRequestStep * 2];
const StoryArtifact = ({ x, y, grow, beat = 0 }: { x: number; y: number; grow: 'draw' | 'done'; beat?: number }) => {
  const enter = useMotion();
  const at = (delay: number) => (grow === 'draw' ? enter('fade', beat, delay) : undefined);
  const slides = [
    [0, 0],
    [160, 0],
    [0, 96],
    [160, 96],
  ];
  return (
    <g>
      {slides.map(([dx, dy], i) => (
        <g key={i} style={at(artifactSlideDelays[i])}>
          <rect
            x={x + dx}
            y={y + dy}
            width={140}
            height={80}
            rx={4}
            fill={color.sheet}
            stroke={i === 3 ? 'var(--osd-accent)' : color.ink}
            strokeWidth={stroke.thin}
          />
          <path d={`M${x + dx + 14} ${y + dy + 22} H${x + dx + 90}`} stroke={color.ink} strokeWidth={stroke.thin} strokeLinecap="round" />
          <rect x={x + dx + 14} y={y + dy + 36} width={52} height={30} rx={3} fill={i % 2 === 0 ? color.teal : color.gold} opacity={0.7} />
          <path d={`M${x + dx + 78} ${y + dy + 44} H${x + dx + 124} M${x + dx + 78} ${y + dy + 58} H${x + dx + 112}`} stroke={color.faint} strokeWidth={shape.hairline} strokeLinecap="round" />
        </g>
      ))}
      <rect x={x} y={y + 196} width={300} height={174} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <text x={x + 18} y={y + 228} fontSize={20} fontWeight={700} fill={color.muted}>
        原稿
      </text>
      {[236, 200, 250, 170].map((w, i) => (
        <path
          key={i}
          d={`M${x + 24} ${y + 260 + i * 28} H${x + 24 + w}`}
          stroke={color.ink}
          strokeWidth={stroke.thin}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          style={grow === 'draw' ? enter('draw', beat, artifactLineDelays[i]) : undefined}
        />
      ))}
    </g>
  );
};
// 吹き出しの指示。成果物が育つクリックのあいだ、storyRequestStepごとに次の指示へ切り替える。
const storyRequests = ['2枚目に図を足して', '原稿の導入を書いて', '最後にまとめを1枚'];
const StoryRequest = ({ x, beat }: { x: number; beat: number }) => {
  const active = useIsActivePage();
  const growing = useBeatShown(beat);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active || !growing) {
      setIndex(0);
      return;
    }
    const timers = storyRequests.slice(1).map((_, i) => setTimeout(() => setIndex(i + 1), storyRequestStep * motion.stagger * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [active, growing]);
  return (
    <text
      key={index}
      x={x}
      y={226}
      fontSize={28}
      fontWeight={700}
      textAnchor="middle"
      fill={color.ink}
      style={index > 0 ? { animation: `washi-fade ${motion.fade}ms ${motion.ease} both` } : undefined}
    >
      {storyRequests[index]}
    </text>
  );
};
const makeTools = [
  { label: '発表', x: 0, w: 104 },
  { label: 'ブログ', x: 116, w: 96 },
  { label: 'Confluence', x: 224, w: 156 },
];
const ArtifactStory = () => (
  <svg viewBox="0 0 1664 900" style={{ display: 'block', width: 1664, height: 900, margin: 'auto 0', overflow: 'visible', letterSpacing: 0 }} aria-hidden fontFamily="inherit">
    {/* 準備は無い。4コマの2〜4コマ目の位置に描き、3コマぶんを舞台の中央へ寄せる */}
    <g transform={`translate(${(1664 - (1664 - p2)) / 2 - p2} 0)`}>
    <StoryPhase x={p2} w={808} beat={1}>本番</StoryPhase>
    <StoryPhase x={p4} w={380} beat={3}>後処理</StoryPhase>

    {/* 1コマ目: 壁打ちしながら頼む */}
    <StoryGroup beat={1}>
      <rect x={p2 + 20} y={170} width={340} height={92} rx={46} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <path d={`M${p2 + 170} 260 L${p2 + 186} 292 L${p2 + 206} 260`} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} strokeLinejoin="round" />
      <path d={`M${p2 + 172} 258 H${p2 + 204}`} stroke={color.sheet} strokeWidth={stroke.thin + 2} />
      <StoryRequest x={p2 + 190} beat={2} />
      <svg x={p2 + 70} y={310} width={240} height={288} viewBox="0 0 420 504">
        <image href={solo} x={0} y={66} width={1498} height={372} />
      </svg>
    </StoryGroup>
    <StoryCaption x={p2} beat={1}>壁打ちしながら頼む</StoryCaption>

    {/* 2コマ目: AIエージェントが成果物を直接育てる */}
    <RelationArrow d={`M${p2 + 368} 216 H${p3 + 32}`} head={`M${p3 + 18} 204 L${p3 + 34} 216 L${p3 + 18} 228`} beat={2} />
    <StoryGroup beat={2} delay={1}>
      <rect x={p3 + 40} y={170} width={300} height={92} rx={8} fill={color.sheet} stroke={color.ink} strokeWidth={stroke.thin} />
      <image href={claudeLogo} x={p3 + 58} y={196} width={40} height={40} />
      <image href={openaiLogo} x={p3 + 104} y={196} width={40} height={40} />
      <text x={p3 + 156} y={225} fontSize={24} fontWeight={700} fill={color.ink}>
        AIエージェント
      </text>
    </StoryGroup>
    <RelationArrow d={`M${p3 + 190} 270 V318`} head={`M${p3 + 178} 304 L${p3 + 190} 320 L${p3 + 202} 304`} beat={2} delay={2} />
    <StoryGroup beat={2} delay={2}>
      <StoryArtifact x={p3 + 40} y={330} grow="draw" beat={2} />
    </StoryGroup>
    <StoryCaption x={p3} beat={2}>成果物が育つ</StoryCaption>

    {/* 3コマ目: 完成した成果物を届ける */}
    <StoryNext x={p3 + 380} beat={3} />
    <StoryGroup beat={3}>
      <StoryArtifact x={p4 + 40} y={330} grow="done" />
    </StoryGroup>
    <StoryStamp cx={p4 + 190} cy={515} beat={3} delay={3} label="完成" />
    <StoryShare delay={7} tools={makeTools} caption="完成したら届ける" beat={3} />
    </g>
  </svg>
);
const BrainstormStory = () => (
  <svg viewBox="0 0 1664 900" style={{ display: 'block', width: 1664, height: 900, margin: 'auto 0', overflow: 'visible', letterSpacing: 0 }} aria-hidden fontFamily="inherit">
    <StoryPhase x={p1} w={808} beat={1}>準備</StoryPhase>
    <StoryPhase x={p3} w={380} beat={3}>本番</StoryPhase>
    <StoryPhase x={p4} w={380} beat={4}>後処理</StoryPhase>

    {/* 1コマ目: 下書きは参加者だけ */}
    <StoryGroup beat={1} delay={1}>
      <StoryNotes x={p1 + 40} y={420} title="ブレスト 11/12" state="blank" />
    </StoryGroup>
    <StoryCaption x={p1} beat={1}>参加者だけ書く</StoryCaption>

    {/* 2コマ目: 予約は朝会と同じ */}
    <StoryReserve name="ブレスト" at="15:00" />

    {/* 3コマ目: ボードは自動で育ち、議事録は要所で手動 */}
    <StoryNext x={p2 + 380} beat={3} />
    <StoryGroup beat={3}>
      <image href={meeting} x={p3 + 40} y={130} width={300} height={190} preserveAspectRatio="xMidYMid meet" />
    </StoryGroup>
    <StoryGroup beat={3} delay={1}>
      <StoryBoard x={p3 + 40} y={330} grow="draw" beat={3} />
      <StoryNotes x={p3 + 40} y={566} title="議事録" state="draw" beat={3} />
    </StoryGroup>
    <StoryCaption x={p3} beat={3}>ボードが育つ</StoryCaption>

    {/* 4コマ目: ボードと議事録から清書して共有 */}
    <StoryNext x={p3 + 380} beat={4} />
    <StoryGroup beat={4}>
      <StoryCleanCopy x={p4 + 40} y={330} title="ブレスト 11/12" />
    </StoryGroup>
    <StoryStamp cx={p4 + 190} cy={520} beat={4} delay={3} />
    <StoryShare delay={7} />
  </svg>
);
const AgendaStory = () => (
  <svg viewBox="0 0 1664 900" style={{ display: 'block', width: 1664, height: 900, margin: 'auto 0', overflow: 'visible', letterSpacing: 0 }} aria-hidden fontFamily="inherit">
    <StoryPhase x={p1} w={808} beat={1}>準備</StoryPhase>
    <StoryPhase x={p3} w={380} beat={3}>本番</StoryPhase>
    <StoryPhase x={p4} w={380} beat={4}>後処理</StoryPhase>

    {/* 1コマ目: 情報源から下書きを作る */}
    <StoryGroup beat={1} delay={1}>
      {storyTools.map(({ label, x, w }) => (
        <StoryChip key={label} x={p1 + x} y={170} w={w}>
          {label}
        </StoryChip>
      ))}
    </StoryGroup>
    {storyTools.map(({ label, x, w }) => (
      <RelationArrow
        key={label}
        d={`M${p1 + x + w / 2} 234 V318`}
        head={`M${p1 + x + w / 2 - 12} 304 L${p1 + x + w / 2} 320 L${p1 + x + w / 2 + 12} 304`}
        beat={1}
        delay={2}
      />
    ))}
    <StoryGroup beat={1} delay={3}>
      <StoryMinutes x={p1} spoken="blank" />
    </StoryGroup>
    <StoryCaption x={p1} beat={1}>情報源から下書き</StoryCaption>

    {/* 2コマ目: CLIで予約すると、開始シートの先頭に朝会が出る */}
    <StoryReserve name="朝会" at="09:30" />

    {/* 3コマ目: 話していくと、下書きが埋まっていく */}
    <StoryNext x={p2 + 380} beat={3} />
    <StoryGroup beat={3}>
      <image href={meeting} x={p3 + 40} y={130} width={300} height={190} preserveAspectRatio="xMidYMid meet" />
    </StoryGroup>
    <StoryGroup beat={3} delay={1}>
      <StoryMinutes x={p3} spoken="draw" beat={3} />
    </StoryGroup>
    <StoryCaption x={p3} beat={3}>話すと埋まる</StoryCaption>

    {/* 4コマ目: 書き上がった議事録を、必要な場所へ上げる */}
    <StoryNext x={p3 + 380} beat={4} />
    <StoryGroup beat={4}>
      <StoryMinutes x={p4} spoken="done" />
    </StoryGroup>
    <StoryStamp cx={p4 + 190} cy={540} beat={4} delay={3} />
    <StoryShare delay={7} />
  </svg>
);
const RecipeAgendaFlow: Page = () => (
  <Shell beats={4}>
    <AgendaStory />
  </Shell>
);
const RecipeBrainstorm: Page = () => (
  <Shell beats={1}>
    <Title eyebrow="使い方レシピ 2">話題が発散するMTG</Title>
    <Stage>
      <div style={{ ...centeredStageItemStyle, gap: space.xxl }}>
        <div style={recipeSceneStyle}>
          <Illustration src={meeting} width={560} />
          <Sub>例: ブレスト・1on1</Sub>
        </div>
        <div style={recipeCardStyle}>
          <RecipeRow name="入力" beat={1}>複数人の会話</RecipeRow>
          <RecipeRow name="話者判別" beat={1} delay={1}>オン</RecipeRow>
          <RecipeRow name="議事録" beat={1} delay={2}>参加者だけの下書き</RecipeRow>
          <RecipeRow name="ボード" beat={1} delay={3}>
            <Em>使う</Em>
          </RecipeRow>
          <RecipeRow name="自動送信" beat={1} delay={4}>短い間隔でボードを更新</RecipeRow>
          <RecipeRow name="手動送信" beat={1} delay={5}>要所で議事録を更新</RecipeRow>
        </div>
      </div>
    </Stage>
  </Shell>
);
const RecipeBrainstormFlow: Page = () => (
  <Shell beats={4}>
    <BrainstormStory />
  </Shell>
);
const RecipeArtifact: Page = () => (
  <Shell beats={1}>
    <Title eyebrow="使い方レシピ 3">成果物を作り上げるMTG</Title>
    <Stage>
      <div style={{ ...centeredStageItemStyle, gap: space.xxl }}>
        <div style={recipeSceneStyle}>
          {/* ひとりでも、みんなでも。話し合う絵と、ひとりで喋る絵の左側を並べる */}
          <svg viewBox="0 0 560 300" style={{ display: 'block', width: 560, height: 300 }} aria-hidden>
            <image href={meeting} x={0} y={30} width={360} height={220} />
            <svg x={380} y={20} width={180} height={216} viewBox="0 0 420 504">
              <image href={solo} x={0} y={66} width={1498} height={372} />
            </svg>
          </svg>
          <Sub>例: 発表資料の作成・執筆</Sub>
        </div>
        <div style={recipeCardStyle}>
          <RecipeRow name="入力" beat={1}>1人または複数人の会話</RecipeRow>
          <RecipeRow name="話者判別" beat={1} delay={1}>どちらでも</RecipeRow>
          <RecipeRow name="議事録" beat={1} delay={2}>なし</RecipeRow>
          <RecipeRow name="ボード" beat={1} delay={3}>なし</RecipeRow>
          <RecipeRow name="自動送信" beat={1} delay={4}>なし</RecipeRow>
          <RecipeRow name="手動送信" beat={1} delay={5}>
            資料・原稿を<Em>直接更新</Em>
          </RecipeRow>
        </div>
      </div>
    </Stage>
  </Shell>
);
const RecipeArtifactFlow: Page = () => (
  <Shell beats={3}>
    <ArtifactStory />
  </Shell>
);

const Summary: Page = () => (
  <Shell beats={3}>
    <Eyebrow>本日お伝えしたこと</Eyebrow>
    <div style={summaryPageStyle}>
      <SummaryRow n={1} name="KIKIGAKIの思想" beat={1}>
        <div style={summaryCopyStyle}>
          声から<Em>成果物</Em>を作る
        </div>
        <div style={summaryNoteStyle}>キーボードに代わる入口。議事録はその使い方の1つ</div>
      </SummaryRow>
      <SummaryRow n={2} name="できること・できないこと" beat={2}>
        <div style={summaryPairStyle}>
          <div style={summaryListStyle}>
            <span style={{ ...summaryTagStyle, color: color.teal }}>できる</span>
            <span>話者付きの書き起こし</span>
            <span>Macの中で完結</span>
            <span>AIエージェントと連携</span>
          </div>
          <div style={summaryListStyle}>
            <span style={{ ...summaryTagStyle, color: 'var(--osd-accent)' }}>できない</span>
            <span>あらゆる環境での動作</span>
            <span>9人以上の話者判別</span>
            <span>誰でも簡単に使えること</span>
          </div>
        </div>
      </SummaryRow>
      <SummaryRow n={3} name="業務に取り入れるイメージ" beat={3}>
        <div style={summaryRecipesStyle}>
          <div style={summaryRecipeStyle}>
            <RecipeMark kind="minutes" />
            議題が決まっている
          </div>
          <div style={summaryRecipeStyle}>
            <RecipeMark kind="board" />
            話題が発散する
          </div>
          <div style={summaryRecipeStyle}>
            <RecipeMark kind="artifact" />
            成果物を作り上げる
          </div>
        </div>
        <div style={{ ...summaryNoteStyle, marginTop: space.sm }}>3つのMTGのレシピから試せる</div>
      </SummaryRow>
    </div>
  </Shell>
);

// 結び: MacBookの線画を大きく置き、画面にティザーサイトを埋め込む。
// サイトは1440×900の幅で描かせて、画面の1456×910へ合わせる。通信できないときのため、下に同じ画面の画像を敷く。
// ページの余白を使わず、下の朱のバーの上の高さいっぱいに置く。
const site = { url: 'https://tadashi-aikawa.github.io/kikigaki/', width: 1440, height: 900 };
const laptopScreen = { width: 1456, height: 910, bezel: 20 };
const laptopBaseWidth = laptopScreen.width + laptopScreen.bezel * 2 + 200;
const laptopScale = laptopScreen.width / site.width;
const laptopLidStyle: CSSProperties = {
  boxSizing: 'content-box',
  width: laptopScreen.width,
  height: laptopScreen.height,
  padding: laptopScreen.bezel,
  paddingBottom: laptopScreen.bezel + 8,
  background: color.ink,
  borderRadius: '28px 28px 8px 8px',
  boxShadow: color.sheetShadow,
};
const laptopScreenStyle: CSSProperties = {
  position: 'relative',
  width: laptopScreen.width,
  height: laptopScreen.height,
  overflow: 'hidden',
  borderRadius: 4,
  backgroundImage: `url(${teaserSite})`,
  backgroundSize: 'cover',
};
const laptopFrameStyle: CSSProperties = {
  display: 'block',
  width: site.width,
  height: site.height,
  border: 'none',
  transform: `scale(${laptopScale})`,
  transformOrigin: 'left top',
};
const Laptop = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <div style={laptopLidStyle}>
      <div style={laptopScreenStyle}>
        <iframe src={site.url} title="KIKIGAKIのティザーサイト" style={laptopFrameStyle} loading="eager" />
      </div>
    </div>
    <svg viewBox={`0 0 ${laptopBaseWidth} 36`} style={{ display: 'block', width: laptopBaseWidth, height: 36 }} aria-hidden>
      <path
        d={`M0 4 H${laptopBaseWidth} L${laptopBaseWidth - 24} 30 Q${laptopBaseWidth - 30} 36 ${laptopBaseWidth - 40} 36 H40 Q30 36 24 30 Z`}
        fill={color.sumi}
      />
      <path
        d={`M${laptopBaseWidth / 2 - 90} 4 H${laptopBaseWidth / 2 + 90} Q${laptopBaseWidth / 2 + 86} 14 ${laptopBaseWidth / 2 + 74} 14 H${laptopBaseWidth / 2 - 74} Q${laptopBaseWidth / 2 - 86} 14 ${laptopBaseWidth / 2 - 90} 4 Z`}
        fill={color.ink}
      />
    </svg>
  </div>
);
const Closing: Page = () => (
  <Shell band folio={false}>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: shape.band, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Laptop />
    </div>
  </Shell>
);

export const summary = 'KIKIGAKIを作った理由と、Google Meetとの違い、MTGごとの使い方レシピを20分で紹介するスライド。';

export const meta: SlideMeta & { date: string } = {
  title: 'KIKIGAKI — 声をすべてドキュメントに',
  date: '2026-11-11',
  createdAt: '2026-11-08T09:02:11.152Z',
  theme: 'washi',
};

export default [
  Cover,
  Takeaway,
  Chapter1,
  TwoPeople,
  AllRoles,
  WhyBuilt,
  Chapter2,
  Introduce,
  NotJustMinutes,
  TwoLayers,
  Speakers,
  Relation,
  AgentWorks,
  KeyboardToVoice,
  Chapter3,
  DiffRealtime,
  DiffCustom,
  DiffLocal,
  Demerits,
  Chapter4,
  RecipeAgenda,
  RecipeAgendaFlow,
  RecipeBrainstorm,
  RecipeBrainstormFlow,
  RecipeArtifact,
  RecipeArtifactFlow,
  Chapter5,
  Summary,
  Closing,
  Appendix,
  MeetingFuture,
] satisfies Page[];
