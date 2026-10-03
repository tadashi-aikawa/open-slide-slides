import type { CSSProperties, ReactNode } from 'react';
import { type DesignSystem, type Page, useSlidePageNumber } from '@open-slide/core';

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

const heroStyle: CSSProperties = {
  fontSize: 'var(--osd-size-hero)',
  fontWeight: weight.bold,
};
const mutedStyle: CSSProperties = { color: color.dimmed };
const calloutStyle: CSSProperties = {
  padding: space.lg,
  borderLeft: `${shape.rule}px solid var(--osd-accent)`,
  background: color.dimmedBg,
};
const emphasisStyle: CSSProperties = {
  fontStyle: 'normal',
  fontWeight: weight.bold,
  color: color.secondary,
};
const closerStyle: CSSProperties = {
  fontSize: type.fact,
  fontWeight: weight.bold,
  color: color.greenText,
};
const closerCaptionStyle: CSSProperties = { fontSize: type.caption, color: color.dimmed };

const Cover: Page = () => (
  <Shell>
    <style>
      {'@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap");'}
    </style>
    <Eyebrow>STANDARD</Eyebrow>
    <div style={heroStyle}>伝えたいことを、まっすぐに</div>
    <p style={mutedStyle}>白地と緑の、いつものスライド</p>
  </Shell>
);
const Content: Page = () => (
  <Shell>
    <Eyebrow>見出しと本文</Eyebrow>
    <Title>決まったことを、その都度残す</Title>
    <p>本文は44px。見出しの緑は、文字専用の濃い色。</p>
    <div style={calloutStyle}>
      <em style={emphasisStyle}>強調だけ</em>
      にピンクを使います。
    </div>
  </Shell>
);
const Closer: Page = () => (
  <Shell center>
    <div style={closerStyle}>まずは、ひとつ頼んでみる</div>
    <p style={closerCaptionStyle}>補足28px · ページ番号24px · PDF非対応</p>
  </Shell>
);

export default [Cover, Content, Closer] satisfies Page[];
