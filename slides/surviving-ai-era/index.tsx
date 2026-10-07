import type { CSSProperties, ReactNode } from 'react';
import {
  type DesignSystem,
  type Page,
  type SlideMeta,
  Step,
  Steps,
  useSlidePageNumber,
} from '@open-slide/core';
import cover from './assets/cover-field.webp';
import wall from './assets/scene-wall.webp';
import overwhelm from './assets/scene-overwhelm.webp';
import cant from './assets/scene-cant.webp';
import ego from './assets/scene-ego.webp';
import sameDark from './assets/scene-same-dark.webp';
import command from './assets/scene-command.webp';
import viewpoint from './assets/scene-viewpoint.webp';
import step from './assets/scene-step.webp';
import drafts from './assets/kanzashi-1-drafts.webp';
import size from './assets/kanzashi-2-size.webp';
import final from './assets/kanzashi-3-final.webp';
import article from './assets/article-thumb.webp';
import favicon from '@assets/minerva-favicon.webp';

// standardテーマをコピーして使う。デッキ間のコンポーネントimportはしない。

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

const emStyle: CSSProperties = {
  fontStyle: 'normal',
  fontWeight: weight.bold,
  color: color.secondary,
};
const headlineStyle: CSSProperties = {
  fontWeight: weight.bold,
  lineHeight: leading.heading,
};
const sublineStyle: CSSProperties = {
  marginTop: space.md,
  color: color.dimmed,
  fontWeight: weight.bold,
};
const footnoteStyle: CSSProperties = {
  fontSize: type.bodyMin,
  color: color.dimmed,
  lineHeight: leading.relaxed,
};
const diagramBodyStyle: CSSProperties = { marginTop: space.xxl };
const tagStyle: CSSProperties = {
  alignSelf: 'flex-start',
  padding: `${space.sm}px ${space.lg}px`,
  borderRadius: 'var(--osd-radius)',
  fontSize: type.caption,
  fontWeight: weight.bold,
  marginBottom: space.lg,
};
const dummyStyle: CSSProperties = {
  fontSize: type.caption,
  fontStyle: 'normal',
  fontWeight: weight.bold,
  color: color.secondary,
  border: `${shape.line}px solid ${color.secondary}`,
  padding: `${space.xs}px ${space.sm}px`,
  borderRadius: 'var(--osd-radius)',
  whiteSpace: 'nowrap',
};
const metricStyle: CSSProperties = {
  alignSelf: 'flex-start',
  display: 'flex',
  alignItems: 'center',
  gap: space.md,
  marginTop: space.xl,
  padding: space.md,
  border: `${shape.line}px dashed var(--osd-accent)`,
  borderRadius: 'var(--osd-radius)',
};
const greenTextStyle: CSSProperties = { color: color.greenText };
const caption: CSSProperties = { fontSize: type.caption, color: color.dimmed };
const backgroundImageStyle: CSSProperties = {
  position: 'absolute',
  inset: space.none,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};
const washStyle: CSSProperties = { position: 'absolute', inset: space.none };
const visualBodyStyle: CSSProperties = { position: 'relative', maxWidth: '62%' };
const visualLeadStyle: CSSProperties = { fontSize: type.bodyMin, marginBottom: space.md };
const visualFootStyle: CSSProperties = {
  fontSize: type.bodyMin,
  lineHeight: leading.relaxed,
  marginTop: space.xl,
};
const sectionNumberStyle: CSSProperties = {
  color: color.greenText,
  fontSize: type.headline,
  fontWeight: weight.bold,
};
const sectionTitleStyle: CSSProperties = {
  fontSize: type.fact,
  fontWeight: weight.bold,
  marginTop: space.lg,
};
const cardsTitleStyle: CSSProperties = {
  fontSize: type.fact,
  fontWeight: weight.bold,
  color: color.greenText,
};
const cardsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: space.xxl,
  marginTop: space.xxl,
  textAlign: 'left',
};
const cardStyle: CSSProperties = {
  borderTop: `${shape.rule}px solid var(--osd-accent)`,
  paddingTop: space.lg,
};
const cardNumberStyle: CSSProperties = { fontSize: type.bodyMin, fontWeight: weight.bold };
const cardTitleStyle: CSSProperties = {
  fontWeight: weight.bold,
  marginTop: space.sm,
  marginBottom: space.md,
};
const cardDescriptionStyle: CSSProperties = {
  fontSize: type.bodyMin,
  color: color.dimmed,
  lineHeight: leading.relaxed,
};
const cardsClosingStyle: CSSProperties = {
  color: color.greenText,
  fontWeight: weight.bold,
  marginTop: space.huge,
};

const Em = ({ children }: { children: ReactNode }) => (
  <em style={emStyle}>
    {children}
  </em>
);
const Headline = ({
  children,
  size = 'headline',
}: {
  children: ReactNode;
  size?: 'headline' | 'headlineMd' | 'headlineSm';
}) => (
  <div style={{ ...headlineStyle, fontSize: type[size] }}>
    {children}
  </div>
);
const Subline = ({ children }: { children: ReactNode }) => (
  <div style={sublineStyle}>
    {children}
  </div>
);
const Footnote = ({
  children,
  center = false,
  tight = false,
}: {
  children: ReactNode;
  center?: boolean;
  tight?: boolean;
}) => (
  <div
    style={{
      ...footnoteStyle,
      marginTop: tight ? space.md : space.xxl,
      paddingLeft: center ? space.none : space.lg,
      borderLeft: center ? undefined : `${shape.rule}px solid ${color.dimmedBg}`,
      textAlign: center ? 'center' : 'left',
    }}
  >
    {children}
  </div>
);
const Diagram = ({ chapter, title, children }: { chapter: string; title: string; children: ReactNode }) => (
  <Shell>
    <Eyebrow>{chapter}</Eyebrow>
    <Title>{title}</Title>
    <div style={diagramBodyStyle}>
      {children}
    </div>
  </Shell>
);
const Tag = ({ children, after = false }: { children: ReactNode; after?: boolean }) => (
  <div
    style={{
      ...tagStyle,
      color: after ? color.greenText : color.dimmed,
      background: after ? color.softGreen : color.dimmedBg,
    }}
  >
    {children}
  </div>
);
const Dummy = ({ children }: { children: ReactNode }) => (
  <em style={dummyStyle}>
    {children}
  </em>
);
const Metric = ({ value, unit }: { value: string; unit: string }) => (
  <div style={metricStyle}>
    <strong style={greenTextStyle}>{value}</strong>
    <span style={caption}>{unit}</span>
    <Dummy>ダミー値</Dummy>
  </div>
);
const Visual = ({
  image,
  lead,
  children,
  foot,
  dark = false,
}: {
  image: string;
  lead: string;
  children: ReactNode;
  foot?: ReactNode;
  dark?: boolean;
}) => (
  <Shell>
    <div style={{ ...backgroundImageStyle, backgroundImage: `url("${image}")` }} />
    <div style={{ ...washStyle, background: dark ? color.darkWash : color.visualWash }} />
    <div style={{ ...visualBodyStyle, color: dark ? color.dimmedBg : 'var(--osd-text)' }}>
      <div style={{ ...visualLeadStyle, color: dark ? color.darkDimmed : color.dimmed }}>
        {lead}
      </div>
      <Headline size="headlineMd">{children}</Headline>
      {foot && (
        <div style={{ ...visualFootStyle, color: dark ? color.darkDimmed : color.dimmed }}>
          {foot}
        </div>
      )}
    </div>
  </Shell>
);
const Section = ({ number, children }: { number: string; children: ReactNode }) => (
  <Shell center>
    <div style={sectionNumberStyle}>{number}</div>
    <div style={sectionTitleStyle}>{children}</div>
  </Shell>
);
const Cards = ({
  title,
  items,
  closing,
  done = false,
}: {
  title: string;
  items: { number: string; title: string; desc?: ReactNode }[];
  closing?: string;
  done?: boolean;
}) => (
  <Shell center>
    <div style={cardsTitleStyle}>{title}</div>
    <div style={cardsGridStyle}>
      {items.map(item => (
        <div key={item.number} style={cardStyle}>
          <div style={{ ...cardNumberStyle, color: done ? color.dimmed : color.greenText }}>
            {item.number}
          </div>
          <div style={{ ...cardTitleStyle, color: done ? color.dimmed : 'var(--osd-text)' }}>
            {item.title}
          </div>
          {item.desc && (
            <div style={cardDescriptionStyle}>
              {item.desc}
            </div>
          )}
        </div>
      ))}
    </div>
    {closing && (
      <div style={cardsClosingStyle}>
        {closing}
      </div>
    )}
  </Shell>
);
const box: CSSProperties = {
  border: `${shape.line}px solid var(--osd-accent)`,
  borderRadius: 'var(--osd-radius)',
  padding: space.xl,
  textAlign: 'center',
};
const arrow: CSSProperties = {
  color: color.greenText,
  fontSize: type.headlineSm,
  alignSelf: 'center',
};
const label: CSSProperties = {
  fontSize: type.bodyMin,
  fontWeight: weight.bold,
  color: color.dimmed,
  marginBottom: space.md,
};
const CH0 = 'トークン、余っていませんか';
const CH1 = '① 使う → 育てる';
const CH2 = '② 任せる量を増やす';
const CH3 = '③ 力の入れどころを決める';

const coverContentStyle: CSSProperties = { position: 'relative' };
const mutedTextStyle: CSSProperties = { color: color.dimmed };
const coverTitleStyle: CSSProperties = {
  fontSize: 'var(--osd-size-hero)',
  fontWeight: weight.bold,
  marginTop: space.md,
};
const coverEmStyle: CSSProperties = { color: color.greenText, fontStyle: 'normal' };
const coverRuleStyle: CSSProperties = {
  width: shape.ruleWidth,
  height: shape.rule,
  background: 'var(--osd-accent)',
  margin: `${space.xl}px 0`,
};
const bodyMutedStyle: CSSProperties = { fontSize: type.bodyMin, color: color.dimmed };
const tokenFlowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr auto 1fr',
  gap: space.md,
};
const boxCaptionStyle: CSSProperties = { ...caption, marginTop: space.md };
const returnFlowStyle: CSSProperties = { position: 'relative', marginTop: space.md };
const returnArrowStyle: CSSProperties = { width: '100%', height: space.huge };
const returnLabelStyle: CSSProperties = {
  position: 'absolute',
  inset: space.none,
  display: 'grid',
  placeItems: 'center',
  fontSize: type.bodyMin,
};
const returnLabelTextStyle: CSSProperties = {
  background: 'var(--osd-bg)',
  padding: `0 ${space.md}px`,
};
const repeatRowsStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space.md,
  marginTop: space.xxl,
};
const repeatRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'auto repeat(3, 1fr)',
  gap: space.md,
  alignItems: 'center',
  fontSize: type.bodyMin,
};
const repeatNumberStyle: CSSProperties = { color: color.dimmed, paddingRight: space.xl };
const explanationStyle: CSSProperties = {
  padding: space.md,
  background: color.softPink,
  borderRadius: 'var(--osd-radius)',
  textAlign: 'center',
};
const repeatTaskStyle: CSSProperties = {
  padding: space.md,
  background: color.dimmedBg,
  borderRadius: 'var(--osd-radius)',
  color: color.dimmed,
  textAlign: 'center',
};
const promptGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  gap: space.xl,
  alignItems: 'center',
};
const beforePromptStyle: CSSProperties = {
  ...box,
  textAlign: 'left',
  color: color.dimmed,
  borderColor: color.dimmed,
  fontSize: type.bodyMin,
};
const afterLabelStyle: CSSProperties = { ...label, color: color.greenText };
const afterPromptStyle: CSSProperties = { ...box, textAlign: 'left', fontSize: type.bodyMin };
const parallelGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: space.huge,
};
const taskLaneStyle: CSSProperties = {
  position: 'relative',
  height: shape.lane,
  background: color.dimmedBg,
  borderRadius: 'var(--osd-radius)',
  marginBottom: space.md,
};
const taskBarStyle: CSSProperties = {
  position: 'absolute',
  height: '100%',
  display: 'grid',
  placeItems: 'center',
  color: 'var(--osd-bg)',
  borderRadius: 'var(--osd-radius)',
  fontSize: type.bodyMin,
  fontWeight: weight.bold,
};
const fatigueGridStyle: CSSProperties = { ...parallelGridStyle, alignItems: 'center' };
const headBoxStyle: CSSProperties = {
  position: 'relative',
  border: `${shape.line}px dashed ${color.dimmed}`,
  borderRadius: 'var(--osd-radius)',
  padding: space.xxl,
};
const headLabelStyle: CSSProperties = {
  position: 'absolute',
  top: -space.md,
  left: space.xl,
  background: 'var(--osd-bg)',
  padding: `0 ${space.sm}px`,
  fontSize: type.caption,
  color: color.dimmed,
};
const headTasksStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: space.md,
};
const headTaskStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  height: shape.task,
  borderRadius: 'var(--osd-radius)',
  color: color.greenText,
  fontWeight: weight.bold,
};
const headCaptionStyle: CSSProperties = {
  fontSize: type.bodyMin,
  color: color.dimmed,
  textAlign: 'center',
  marginTop: space.xxl,
};
const fatigueFlowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: space.md,
  fontSize: type.bodyMin,
  fontWeight: weight.bold,
};
const fatigueRuleStyle: CSSProperties = { borderBottom: `${shape.rule}px solid var(--osd-accent)` };
const fatigueEmRuleStyle: CSSProperties = { borderBottom: `${shape.rule}px solid ${color.secondary}` };
const improveGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.3fr 1fr',
  gap: space.xl,
  alignItems: 'center',
};
const improveDescriptionStyle: CSSProperties = {
  fontSize: type.bodyMin,
  color: color.dimmed,
  marginTop: space.md,
};
const improveArrowsStyle: CSSProperties = {
  textAlign: 'center',
  fontSize: type.bodyMin,
  fontWeight: weight.bold,
};
const improveReturnStyle: CSSProperties = { marginTop: space.lg };
const improveCaptionStyle: CSSProperties = { ...caption, marginTop: space.xl };
const demoBadgeStyle: CSSProperties = {
  alignSelf: 'center',
  background: color.softGreen,
  color: color.greenText,
  fontSize: type.bodyMin,
  fontWeight: weight.bold,
  padding: `${space.sm}px ${space.xxl}px`,
  borderRadius: 'var(--osd-radius)',
  letterSpacing: tracking.label,
};
const demoTitleStyle: CSSProperties = {
  fontSize: type.headline,
  fontWeight: weight.bold,
  marginTop: space.lg,
};
const uiGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: space.xxl,
  alignItems: 'center',
};
const articleCardStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'stretch',
  gap: space.md,
  border: `${shape.line}px solid ${color.dimmed}`,
  borderRadius: 'var(--osd-radius)',
  marginTop: space.xl,
  color: 'inherit',
  textDecoration: 'none',
};
const articleThumbnailStyle: CSSProperties = {
  width: shape.thumbnail,
  objectFit: 'cover',
  borderRadius: 'var(--osd-radius)',
};
const articleBodyStyle: CSSProperties = { padding: space.md, paddingLeft: space.none };
const articleTitleStyle: CSSProperties = {
  fontSize: type.bodyMin,
  fontWeight: weight.bold,
  lineHeight: leading.heading,
};
const articleCaptionStyle: CSSProperties = { ...caption, marginTop: space.sm };
const articleSiteStyle: CSSProperties = {
  ...caption,
  marginTop: space.sm,
  display: 'flex',
  alignItems: 'center',
  gap: space.xs,
};
const faviconStyle: CSSProperties = { width: shape.favicon, height: shape.favicon };
const uiImagesStyle: CSSProperties = {
  width: shape.imageColumn,
  justifySelf: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: space.md,
};
const uiImageStyle: CSSProperties = {
  width: '100%',
  aspectRatio: '1000 / 390',
  objectFit: 'cover',
  borderRadius: 'var(--osd-radius)',
};
const uiImageCaptionStyle: CSSProperties = { ...caption, fontWeight: weight.bold };

const P01: Page = () => (
  <Shell>
    <div style={{ ...backgroundImageStyle, backgroundImage: `url("${cover}")` }} />
    <div style={{ ...washStyle, background: color.visualWash }} />
    <div style={coverContentStyle}>
      <div style={mutedTextStyle}>AI時代を生き抜くために</div>
      <div style={coverTitleStyle}>
        ぼくらが
        <em style={coverEmStyle}>変えた</em>
        こと
      </div>
      <div style={coverRuleStyle} />
      <div style={bodyMutedStyle}>2026/08/XX　Tadashi Aikawa</div>
    </div>
  </Shell>
);
const P02: Page = () => (
  <Shell>
    <Eyebrow>{CH0}</Eyebrow>
    <Headline>プレミアムシートは配られた</Headline>
    <Subline>でも、使い切れていない</Subline>
    <Steps>
      <Step>
        <Footnote>
          {'今日は、その使い道を '}
          <Em>一つでも</Em>
          {' 持ち帰ってほしい'}
        </Footnote>
      </Step>
    </Steps>
  </Shell>
);
const P03: Page = () => (
  <Visual image={wall} lead="試しもせずに">
    「無理だろう」と
    <br />
    決めていた
  </Visual>
);
const P04: Page = () => (
  <Diagram chapter={CH0} title="試さないから、できることを知らないままだった">
    <div style={tokenFlowStyle}>
      <div style={box}>
        <strong>トークンは有限</strong>
        <div style={boxCaptionStyle}>減るのが怖い</div>
      </div>
      <span style={arrow}>→</span>
      <div style={box}>
        <strong>頼む価値を考える</strong>
        <div style={boxCaptionStyle}>毎回、事前に判断</div>
      </div>
      <span style={arrow}>→</span>
      <div style={box}>
        <strong>自分でやる</strong>
        <div style={boxCaptionStyle}>そのほうが早い</div>
      </div>
    </div>
    <div style={returnFlowStyle}>
      <svg viewBox="0 0 900 60" preserveAspectRatio="none" style={returnArrowStyle}>
        <path
          d="M 860 4 L 860 40 L 40 40 L 40 12"
          fill="none"
          stroke={color.secondary}
          strokeWidth={shape.line}
          strokeDasharray="7 6"
        />
        <path d="M 33 22 L 40 8 L 47 22" fill="none" stroke={color.secondary} strokeWidth={shape.line} />
      </svg>
      <div style={returnLabelStyle}>
        <Em>
          <span style={returnLabelTextStyle}>「やっぱAIより人間」だよね</span>
        </Em>
      </div>
    </div>
  </Diagram>
);
const P05: Page = () => (
  <Shell>
    <Eyebrow>{CH0}</Eyebrow>
    <Headline size="headlineMd">
      個人でClaude Maxプランを
      <br />
      契約したこと
    </Headline>
    <Subline>それで、考え方がひっくり返った</Subline>
    <Footnote>
      余っているんだから、
      <Em>頼まないと損</Em>
      。
      <br />
      片っ端から頼んだら「これもできる」が次々に分かった。
    </Footnote>
  </Shell>
);
const P06: Page = () => (
  <Shell>
    <Eyebrow>{CH0}</Eyebrow>
    <Headline>舞台は、もう整っている</Headline>
    <Subline>余っている状態を、最初から会社に与えられている</Subline>
    <Footnote>
      ひっくり返ってから、今の環境ができるまで1ヶ月弱。
      <br />
      今日話すことの出発点は、全部この会社の業務の中で困ったこと。
    </Footnote>
  </Shell>
);
const P07: Page = () => (
  <Cards
    title="変えたことは3つ"
    items={[
      {
        number: '①',
        title: '使う → 育てる',
        desc: (
          <>
            やりとりで決まったことを
            <br />
            残していく
          </>
        ),
      },
      {
        number: '②',
        title: '任せる量を増やす',
        desc: (
          <>
            増やした分を
            <br />
            支える道具を作る
          </>
        ),
      },
      {
        number: '③',
        title: '力の入れどころ',
        desc: (
          <>
            手放すものと
            <br />
            手放さないものを決める
          </>
        ),
      },
    ]}
  />
);
const P08: Page = () => (
  <Section number="①">使う → 育てる</Section>
);
const P09: Page = () => (
  <Shell>
    <Eyebrow>{CH1}</Eyebrow>
    <Tag>これまでの「使う」</Tag>
    <Title>毎回、ゼロから説明していた</Title>
    <div style={repeatRowsStyle}>
      {['1回目', '2回目', '3回目'].map(n => (
        <div key={n} style={repeatRowStyle}>
          <strong style={repeatNumberStyle}>{n}</strong>
          <div style={explanationStyle}>
            <Em>前提を説明する</Em>
          </div>
          <div style={repeatTaskStyle}>やってもらう</div>
          <div style={repeatTaskStyle}>成果物を受け取る</div>
        </div>
      ))}
    </div>
    <Footnote center>
      やりとりは毎回そこで終わり。
      <Em>何も積み上がらない</Em>
      。
    </Footnote>
  </Shell>
);
const P10: Page = () => (
  <Shell>
    <Eyebrow>{CH1}</Eyebrow>
    <Tag after>ここからの「育てる」</Tag>
    <Headline size="headlineMd">決まったことを、その都度残す</Headline>
    <Subline>手順・守ってほしいこと・前回の失敗</Subline>
    <Footnote>
      {'そして '}
      <Em>ルールも記録も、私は1文字も書いていない</Em>
      。全部AIに書かせた。
      <br />
      AIのことはAIが一番よく知っている。だから中身の確認も、チェックも、修正もしていない。
    </Footnote>
    <Metric value="ルール 42件 / 記録 380件" unit="を 3週間で" />
  </Shell>
);
const P11: Page = () => (
  <Diagram chapter={CH1} title="ざっくり言っても、通じるようになる">
    <div style={promptGridStyle}>
      <div>
        <div style={label}>以前</div>
        <div style={beforePromptStyle}>
          【前提の説明を毎回添えた長い指示文が入る】
          <Dummy>ダミー</Dummy>
        </div>
      </div>
      <span style={arrow}>→</span>
      <div>
        <div style={afterLabelStyle}>今</div>
        <div style={afterPromptStyle}>
          【一言で済む短い指示文が入る】
          <Dummy>ダミー</Dummy>
        </div>
      </div>
    </div>
    <Footnote center>
      効果は毎日少しずつではなく、
      <Em>ある日を境に一気に立ち上がる</Em>
      。
      <br />
      1日2日で諦めず、最低1週間は作業のたびに続けてほしい。
    </Footnote>
  </Diagram>
);
const P12: Page = () => (
  <Section number="②">任せる量を増やす</Section>
);
const P13: Page = () => (
  <Diagram chapter={CH2} title="待たずに、二つ三つ走らせる">
    <div style={parallelGridStyle}>
      {[false, true].map(after => (
        <div key={String(after)}>
          <div style={{ ...label, color: after ? color.greenText : color.dimmed }}>
            {after ? '今' : '以前'}
          </div>
          {['A', 'B', 'C'].map((name, index) => (
            <div key={name} style={taskLaneStyle}>
              <div
                style={{
                  ...taskBarStyle,
                  left: after ? '0%' : `${index * 34}%`,
                  width: after ? '100%' : '32%',
                  background: after ? 'var(--osd-accent)' : color.dimmed,
                }}
              >
                {name}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
    <Footnote center>指示が短くなって頼みやすくなった。待ち時間がなくなり、量は確かに増えた。</Footnote>
  </Diagram>
);
const P14: Page = () => (
  <Visual image={overwhelm} lead="量は増えた">
    持てなくなったのは、
    <br />
    自分だった
  </Visual>
);
const P15: Page = () => (
  <Diagram chapter={CH2} title="疲れると、判断の質が落ちる">
    <div style={fatigueGridStyle}>
      <div>
        <div style={headBoxStyle}>
          <div style={headLabelStyle}>頭の中</div>
          <div style={headTasksStyle}>
            {['A', 'B', 'C', 'D', 'E', 'F'].map(name => (
              <div
                key={name}
                style={{
                  ...headTaskStyle,
                  background: name === 'F' ? color.softPink : color.softGreen,
                  transform: name === 'F' ? `translate(${space.xl}px, ${space.xl}px) rotate(9deg)` : undefined,
                }}
              >
                {name === 'F' ? <Em>{name}</Em> : name}
              </div>
            ))}
          </div>
        </div>
        <div style={headCaptionStyle}>全部を覚えておこうとする</div>
      </div>
      <div style={fatigueFlowStyle}>
        <div style={fatigueRuleStyle}>疲れる</div>
        <div style={arrow}>↓</div>
        <div style={fatigueRuleStyle}>確認すべき場所の判断が雑になる</div>
        <div style={arrow}>↓</div>
        <div style={fatigueEmRuleStyle}>
          <Em>作業は速いのに、自分が持てない</Em>
        </div>
      </div>
    </div>
  </Diagram>
);
const P16: Page = () => (
  <Shell>
    <Eyebrow>{CH2}</Eyebrow>
    <Headline>
      状況が見える画面を
      <br />
      作ることにした
    </Headline>
    <Footnote>
      AIチームはメンバーが複数いて、それぞれに人格がある。
      <br />
      誰が何を抱えて、今どこまで進んでいるかを一目で分かるようにしたかった。
    </Footnote>
    <Footnote tight>
      作り始めた理由は2つだけ。
      <Em>把握が追いつかなくなったこと</Em>
      {' と '}
      <Em>トークンが余っていたこと</Em>
      。
    </Footnote>
  </Shell>
);
const P17: Page = () => (
  <Diagram chapter={CH2} title="自己改善 と 業務 を、往復した">
    <div style={improveGridStyle}>
      <div style={box}>
        <strong style={greenTextStyle}>自己改善</strong>
        <div style={improveDescriptionStyle}>
          見える仕組みを
          <br />
          本気で作り込む
        </div>
      </div>
      <div style={improveArrowsStyle}>
        <div style={greenTextStyle}>作ったものを持ち込む →</div>
        <div style={improveReturnStyle}>
          <Em>← 足りないものを持ち帰る</Em>
        </div>
        <div style={improveCaptionStyle}>2〜3週間くり返した</div>
      </div>
      <div style={box}>
        <strong style={greenTextStyle}>業務</strong>
        <div style={improveDescriptionStyle}>
          実際に回してみて
          <br />
          足りないものに気づく
        </div>
      </div>
    </div>
  </Diagram>
);
const P18: Page = () => (
  <Shell center>
    <div style={demoBadgeStyle}>DEMO</div>
    <div style={demoTitleStyle}>parliament</div>
    <div style={improveDescriptionStyle}>AIチームの状況が見える画面</div>
  </Shell>
);
const P19: Page = () => (
  <Visual image={cant} lead="たぶん、こう思っている">
    「そんなもの、
    <br />
    自分には作れない」
  </Visual>
);
const P20: Page = () => (
  <Shell>
    <Eyebrow>{CH2}</Eyebrow>
    <Headline size="headlineMd">
      ソースコードは
      <br />
      <Em>1文字も書いていない</Em>
    </Headline>
    <Subline>というより、99%以上を把握していない</Subline>
    <Footnote>
      必要だったのはWebの知識ではなく、
      <Em>自分が何を作りたいかを言葉にする力</Em>
      {' と'}
      <br />
      <Em>出てきたものを受け入れていいか判断する力</Em>
      。
    </Footnote>
    <Metric value="同時 6体 / 1日 30タスク" unit="を覚えておかなくてよくなった" />
  </Shell>
);
const P21: Page = () => (
  <Section number="③">力の入れどころを決める</Section>
);
const P22: Page = () => (
  <Visual
    image={ego}
    lead="作業速度は勝てない。品質は仕組みで担保できる"
    foot="設計もコードも、要件を満たしていれば口は出さない"
  >
    コードの美しさは
    <br />
    求めすぎれば
    <Em>エゴ</Em>
  </Visual>
);
const P23: Page = () => (
  <Shell>
    <Eyebrow>{CH3}</Eyebrow>
    <div style={uiGridStyle}>
      <div>
        <Headline size="headlineSm">
          UIと操作感には
          <br />
          <Em>とことん</Em>
          こだわる
        </Headline>
        <Footnote>
          画面の隅のアイコン1つを、
          <Em>18回</Em>
          やり直した。
          <br />
          見た目は人の印象を大きく左右する。
          <br />
          ここは細かいところまで口を出す。
        </Footnote>
        <a
          href="https://minerva.mamansoft.net/Notes/%F0%9F%93%B0%E6%8A%BC%E3%81%97%E3%83%94%E3%83%B3%E3%82%92%E7%B0%AA%E3%81%AB%E3%81%99%E3%82%8B%E3%81%BE%E3%81%A7%E3%81%AE18%E5%BC%BE"
          style={articleCardStyle}
        >
          <img src={article} alt="" style={articleThumbnailStyle} />
          <div style={articleBodyStyle}>
            <div style={articleTitleStyle}>押しピンを簪にするまでの18弾</div>
            <div style={articleCaptionStyle}>捨てた案も含めて、やりとりを全部残してある</div>
            <div style={articleSiteStyle}>
              <img src={favicon} alt="" style={faviconStyle} />
              minerva.mamansoft.net
            </div>
          </div>
        </a>
      </div>
      <div style={uiImagesStyle}>
        {[
          [drafts, '案を並べる'],
          [size, '大きさを詰める'],
          [final, '決まった形'],
        ].map(([image, cap]) => (
          <div key={cap}>
            <img src={image} alt={cap} style={uiImageStyle} />
            <div style={uiImageCaptionStyle}>{cap}</div>
          </div>
        ))}
      </div>
    </div>
  </Shell>
);
const P24: Page = () => (
  <Cards
    done
    title="変えたことは、以上の3つ"
    closing="ここからは、やってみて分かったこと"
    items={[
      { number: '①', title: '使う → 育てる' },
      { number: '②', title: '任せる量を増やす' },
      { number: '③', title: '力の入れどころ' },
    ]}
  />
);
const P25: Page = () => (
  <Cards
    title="頼んでみたら、「無理」が3つ消えた"
    items={[
      {
        number: '01',
        title: '記事にしてもらった',
        desc: (
          <>
            デザインの試行錯誤の過程。
            <br />
            文章も画像も全部AI
          </>
        ),
      },
      {
        number: '02',
        title: 'ゲームを作らせた',
        desc: (
          <>
            コードも絵も効果音も。
            <br />
            100回以上FBを返して完成
          </>
        ),
      },
      {
        number: '03',
        title: '今日のこのスライド',
        desc: (
          <>
            初めて音声入力も使った。
            <br />
            入口と出口だけ自分が入る
          </>
        ),
      },
    ]}
  />
);
const P26: Page = () => (
  <Visual
    image={sameDark}
    dark
    lead="ここまで聞いて、こうも思うはず"
    foot="先に頑張った人ほど、損をするのでは?"
  >
    どうせ全員が
    <br />
    同じ道具を持つのでは
  </Visual>
);
const P27: Page = () => (
  <Visual
    image={command}
    lead="道具は、いずれ全員に行き渡る"
    foot={
      <>
        何を任せるか。どこを確認するか。いつ自分が入るか。
        <br />
        試した回数が、その判断を育てていく。
      </>
    }
  >
    それでも残るのは
    <br />
    <Em>任せ方</Em>
    と
    <Em>見極め方</Em>
  </Visual>
);
const P28: Page = () => (
  <Visual
    image={viewpoint}
    lead="任せる経験を重ねた結果"
    foot={
      <>
        一人のメンバーから、何人も束ねる
        <Em>マネージャー</Em>
        の側へ。
        <br />
        誰に何を任せ、どこが詰まり、自分の時間をどこに使うか。
      </>
    }
  >
    自分の役割が、
    <br />
    変わっていた
  </Visual>
);
const P29: Page = () => (
  <Visual image={step} lead="できたら儲けもの" foot="頼むだけでできるものと、工夫が要るものがある。">
    まずは
    <br />
    ひとつ頼んでみる
  </Visual>
);

export const summary = 'AIに任せる量を増やすために変えた3つのことをまとめたスライド。';

export const meta: SlideMeta & { date: string } = {
  title: 'AI時代を生き抜くためにぼくらが変えたこと',
  date: '2026-08-18',
  theme: 'standard',
};
export default [
  P01, P02, P03, P04, P05, P06, P07, P08, P09, P10,
  P11, P12, P13, P14, P15, P16, P17, P18, P19, P20,
  P21, P22, P23, P24, P25, P26, P27, P28, P29,
] satisfies Page[];
