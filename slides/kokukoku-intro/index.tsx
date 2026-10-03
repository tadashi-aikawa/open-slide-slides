import type { DesignSystem, Page, SlideMeta, SlideTransition } from '@open-slide/core';
import { Step, Steps, useIsActivePage, useSlidePageNumber } from '@open-slide/core';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import demoA from './assets/demo-a-invoke-and-track-tight.mp4';
import demoB from './assets/demo-b-calendar-notification-tight.mp4';
import demoC from './assets/demo-c-candle-burnout.mp4';
import demoFlow from './assets/demo-time-flow-panel.mp4';
import iconCandle from './assets/icon-candle.svg';
import iconClock from './assets/icon-clock.svg';
import iconKanzashi from './assets/icon-kanzashi-pinned.svg';
import iconSoroban from './assets/icon-soroban.svg';
import articleFull from './assets/kanzashi-article-full.webp';
import articleHeader from './assets/kanzashi-article-header.webp';
import logo from './assets/kokukoku.webp';
import stillPanel from './assets/still-panel.webp';
import zenMedium from './assets/ZenOldMincho-Medium.woff2';
import zenRegular from './assets/ZenOldMincho-Regular.woff2';

// Slidev版(slidev-kokukoku-intro)の移植。元は1280×720なので、寸法はすべて1.5倍にしてある。

export const design: DesignSystem = {
  palette: { bg: '#0a0806', text: '#2c2419', accent: '#b23f26' },
  fonts: {
    display: '"Zen Old Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif',
    body: '"Zen Old Mincho", "Hiragino Mincho ProN", "Yu Mincho", serif',
  },
  typeScale: { hero: 177, body: 51 },
  radius: 18,
};

const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const UNROLL_EASE = 'cubic-bezier(0.2, 0.78, 0.24, 1)';

// 同梱フォント(SIL OFL 1.1)と@keyframes。インラインstyleでは書けないので<head>へ1回だけ入れる。
const STYLE_ID = 'osd-styles-kokukoku-intro';
const css = `
@font-face {
  font-family: "Zen Old Mincho";
  font-style: normal;
  font-weight: 400;
  font-display: block;
  src: url("${zenRegular}") format("woff2");
}
@font-face {
  font-family: "Zen Old Mincho";
  font-style: normal;
  font-weight: 500;
  font-display: block;
  src: url("${zenMedium}") format("woff2");
}
@keyframes kk-breathe { 0%, 100% { opacity: 0.78; } 50% { opacity: 1; } }
@keyframes kk-roll { to { left: 0; } }
@keyframes kk-unroll { to { clip-path: inset(0 0 0 0); } }
@keyframes kk-content-in {
  from { opacity: 0; transform: translateY(10.5px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes kk-opening-in {
  from { opacity: 0; transform: scale(0.985); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes kk-command-in {
  from { opacity: 0; transform: translate(-50%, calc(-50% + 10.5px)); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}
`;
if (typeof document !== 'undefined') {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    document.head.appendChild(style);
  }
  if (style.textContent !== css) style.textContent = css;
}

// Slidev版の `transition: fade` に合わせた、不透明度だけの切り替え。
export const transition: SlideTransition = {
  duration: 240,
  exit: {
    duration: 240,
    easing: 'cubic-bezier(0.4, 0, 1, 1)',
    keyframes: [{ opacity: 1 }, { opacity: 1 }],
  },
  enter: {
    duration: 240,
    easing: 'cubic-bezier(0, 0, 0.2, 1)',
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
  },
};

// ───────────────────────── クリックで動かす仕掛け ─────────────────────────

// <Step>が出たかどうかをJSから読む公式の手段がないので、<Step>が付ける
// data-osd-step属性を監視する。動画の再生や減光のきっかけに使う。
const useStepRevealed = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const host = ref.current?.closest('[data-osd-step]');
    if (!host) return;
    const read = () => setRevealed(host.getAttribute('data-osd-step') === 'revealed');
    read();
    const observer = new MutationObserver(read);
    observer.observe(host, { attributes: true, attributeFilter: ['data-osd-step'] });
    return () => observer.disconnect();
  }, []);
  return { ref, revealed };
};

// 見た目を持たない1クリック分。Slidev版の `<span v-click>` に当たる。
const ClickTrigger = ({ triggerRef }: { triggerRef: RefObject<HTMLSpanElement | null> }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0 }}>
    <Steps>
      <Step>
        <span ref={triggerRef} />
      </Step>
    </Steps>
  </div>
);

// クリック後に先頭から繰り返し再生する動画。クリック前はpreviewTimeの静止画を見せる。
const LoopVideo = ({
  src,
  playing,
  previewTime = 0,
  hidden = false,
  fit = 'cover',
  onFrame,
}: {
  src: string;
  playing: boolean;
  previewTime?: number;
  hidden?: boolean;
  fit?: 'cover' | 'contain';
  onFrame?: (time: number) => void;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      if (video.readyState >= 1) video.currentTime = previewTime;
      onFrameRef.current?.(previewTime);
      return;
    }
    video.currentTime = 0;
    void video.play().catch(() => {});
    let frameId = 0;
    const tick = () => {
      onFrameRef.current?.(video.currentTime);
      frameId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frameId);
  }, [playing, previewTime]);

  return (
    <video
      ref={ref}
      src={src}
      loop
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={(event) => {
        if (!playing) event.currentTarget.currentTime = previewTime;
      }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'block',
        width: '100%',
        height: '100%',
        objectFit: fit,
        visibility: hidden ? 'hidden' : 'visible',
      }}
    />
  );
};

// ───────────────────────── 巻物の型 ─────────────────────────

const Rod = ({ side, unrolling }: { side: 'left' | 'right'; unrolling: boolean }) => {
  const cap: CSSProperties = {
    position: 'absolute',
    left: -7.5,
    width: 45,
    height: 22.5,
    borderRadius: 4.5,
    background: 'linear-gradient(160deg, #ebd79a, #a98a52 55%, #6b551f)',
    boxShadow: '0 3px 12px rgba(0, 0, 0, 0.55)',
  };
  const position: CSSProperties =
    side === 'right'
      ? { right: 0, boxShadow: '-15px 0 39px rgba(0, 0, 0, 0.6)' }
      : {
          left: unrolling ? 1668 : 0,
          zIndex: 3,
          boxShadow: '15px 0 39px rgba(0, 0, 0, 0.6)',
          animation: unrolling ? `kk-roll 0.75s 0.1s ${UNROLL_EASE} forwards` : 'none',
        };
  return (
    <div
      style={{
        position: 'absolute',
        top: -27,
        bottom: -27,
        width: 30,
        borderRadius: 4.5,
        background:
          'linear-gradient(90deg, #12100a 0%, #3e3220 26%, #6e5832 50%, #352b1b 78%, #100e09 100%)',
        ...position,
      }}
    >
      <div style={{ ...cap, top: -10.5 }} />
      <div style={{ ...cap, bottom: -10.5 }} />
    </div>
  );
};

const PageNumber = ({ style }: { style: CSSProperties }) => {
  const { current, total } = useSlidePageNumber();
  return (
    <div style={{ position: 'absolute', top: 27, pointerEvents: 'none', ...style }}>
      {current} / {total}
    </div>
  );
};

// 黒地に巻物を1本広げる。childrenは紙の上の版面。
const Scroll = ({
  children,
  unroll = false,
  padding = '42px 63px 45px',
  justifyContent = 'flex-start',
  pageNumber = true,
}: {
  children: ReactNode;
  unroll?: boolean;
  padding?: string;
  justifyContent?: CSSProperties['justifyContent'];
  pageNumber?: boolean;
}) => {
  const active = useIsActivePage();
  const unrolling = unroll && active;
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        color: '#f8ecd8',
        background: 'radial-gradient(120% 100% at 22% 18%, #171209 0%, var(--osd-bg) 66%)',
        fontFamily: 'var(--osd-font-body)',
        fontSize: 52.5,
        lineHeight: 1.5,
        letterSpacing: 1.875,
      }}
    >
      {/* 黒地の金泥 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.45,
          backgroundImage: [
            'radial-gradient(circle at 9% 82%, rgba(217, 180, 92, 0.5) 0 2.1px, transparent 2.85px)',
            'radial-gradient(circle at 21% 12%, rgba(217, 180, 92, 0.42) 0 2.7px, transparent 3.45px)',
            'radial-gradient(circle at 74% 92%, rgba(217, 180, 92, 0.45) 0 1.65px, transparent 2.4px)',
            'radial-gradient(circle at 90% 22%, rgba(217, 180, 92, 0.4) 0 3px, transparent 3.9px)',
            'radial-gradient(circle at 52% 6%, rgba(217, 180, 92, 0.36) 0 1.95px, transparent 2.7px)',
            'radial-gradient(circle at 96% 70%, rgba(217, 180, 92, 0.42) 0 2.25px, transparent 3px)',
          ].join(', '),
        }}
      />
      {/* 行灯 */}
      <div
        style={{
          position: 'absolute',
          right: '2%',
          top: '50%',
          width: '52%',
          height: '150%',
          transform: 'translateY(-50%)',
          background:
            'radial-gradient(32% 30% at 50% 50%, rgba(255, 199, 92, 0.13) 0%, rgba(218, 138, 50, 0.04) 48%, rgba(0, 0, 0, 0) 78%)',
          animation: active ? 'kk-breathe 7s ease-in-out infinite' : 'none',
        }}
      />
      {/* 巻物本体 */}
      <div style={{ position: 'absolute', left: 96, right: 96, top: 90, height: 900 }}>
        <div
          style={{
            position: 'absolute',
            left: 30,
            right: 30,
            top: 21,
            bottom: 21,
            isolation: 'isolate',
            overflow: 'hidden',
            background: [
              'repeating-linear-gradient(90deg, rgba(112, 84, 40, 0) 0 117px, rgba(112, 84, 40, 0.05) 156px, rgba(112, 84, 40, 0) 198px)',
              'radial-gradient(150% 130% at 84% 16%, #f1e6c9 0%, #e6d8b6 44%, #d8c69d 78%, #cbb78d 100%)',
            ].join(', '),
            boxShadow: [
              'inset 0 21px 36px -24px rgba(84, 60, 24, 0.55)',
              'inset 0 -21px 36px -24px rgba(84, 60, 24, 0.55)',
              '0 39px 90px rgba(0, 0, 0, 0.6)',
            ].join(', '),
            clipPath: unrolling ? 'inset(0 0 0 100%)' : 'inset(0)',
            animation: unrolling ? `kk-unroll 0.75s 0.1s ${UNROLL_EASE} forwards` : 'none',
          }}
        >
          {/* 紙の繊維 */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              opacity: 0.55,
              backgroundImage: [
                'repeating-linear-gradient(94deg, rgba(120, 96, 52, 0.055) 0 1.5px, transparent 1.5px 9px)',
                'repeating-linear-gradient(3deg, rgba(120, 96, 52, 0.04) 0 1.5px, transparent 1.5px 7.5px)',
              ].join(', '),
            }}
          />
          {/* 紙の染み */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              mixBlendMode: 'multiply',
              opacity: 0.34,
              backgroundImage: [
                'radial-gradient(ellipse 180px 90px at 11% 84%, rgba(150, 112, 52, 0.3), transparent 70%)',
                'radial-gradient(ellipse 135px 105px at 44% 8%, rgba(150, 112, 52, 0.22), transparent 72%)',
                'radial-gradient(ellipse 225px 120px at 92% 90%, rgba(150, 112, 52, 0.26), transparent 74%)',
              ].join(', '),
            }}
          />
          {/* 版面 */}
          <div
            style={{
              position: 'relative',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent,
              height: '100%',
              padding,
              animation: active
                ? `kk-content-in 0.48s ${unroll ? '0.94s' : '0.08s'} ease-out both`
                : 'none',
            }}
          >
            {children}
          </div>
        </div>
        <Rod side="left" unrolling={unrolling} />
        <Rod side="right" unrolling={false} />
      </div>
      {pageNumber && (
        <PageNumber
          style={{
            right: 4.5,
            width: 85.5,
            zIndex: 20,
            color: '#ab8a55',
            fontSize: 22.5,
            letterSpacing: '0.04em',
            textAlign: 'right',
            whiteSpace: 'nowrap',
            opacity: 0.82,
          }}
        />
      )}
    </div>
  );
};

// 黒漆の地。表紙とインストールの枚で使う。
const Lacquer = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      color: '#e3c06e',
      background: [
        'radial-gradient(ellipse 90% 70% at 50% 44%, rgba(91, 58, 16, 0.28), transparent 68%)',
        'linear-gradient(140deg, #16110a 0%, #060504 55%, #120d07 100%)',
      ].join(', '),
      fontFamily: 'var(--osd-font-body)',
      fontSize: 52.5,
      lineHeight: 1.5,
      letterSpacing: 1.875,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.55,
        background: [
          'radial-gradient(circle at 12% 17%, rgba(221, 181, 84, 0.35) 0 1.5px, transparent 3px)',
          'radial-gradient(circle at 72% 13%, rgba(221, 181, 84, 0.26) 0 2.25px, transparent 3.3px)',
          'radial-gradient(circle at 88% 77%, rgba(221, 181, 84, 0.3) 0 1.5px, transparent 3px)',
          'radial-gradient(circle at 31% 88%, rgba(221, 181, 84, 0.22) 0 1.95px, transparent 3px)',
        ].join(', '),
      }}
    />
    {children}
  </div>
);

// Slidev版のCSSには枚ごとの見出しサイズ(50px・49px)があるが、詳細度で負けて効いていない。
// 見比べるのが目的なので、実際に描かれている52px(1.5倍で78px)へ全枚そろえる。
const titleStyle: CSSProperties = {
  flex: '0 0 auto',
  margin: 0,
  color: '#251d12',
  fontFamily: 'var(--osd-font-display)',
  fontSize: 78,
  fontWeight: 500,
  lineHeight: 1.18,
  letterSpacing: '0.08em',
  textAlign: 'center',
};

const videoFrame: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  overflow: 'hidden',
  border: '3px solid #4d402b',
  outline: '1.5px solid rgba(69, 51, 26, 0.25)',
  outlineOffset: 7.5,
  background: 'radial-gradient(circle at 50% 42%, #40392d, #181713 74%)',
  boxShadow: '0 22.5px 45px rgba(64, 45, 20, 0.3)',
};

// ───────────────────────── 1. 表紙 ─────────────────────────

const Opening: Page = () => {
  const active = useIsActivePage();
  return (
    <Lacquer>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          color: '#e0ba62',
          textAlign: 'center',
          textShadow: '0 0 36px rgba(220, 171, 63, 0.2)',
          animation: active ? 'kk-opening-in 0.7s 0.08s ease-out both' : 'none',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--osd-font-display)',
            fontSize: 'var(--osd-size-hero)',
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: '0.24em',
            textIndent: '0.24em',
          }}
        >
          刻刻
        </div>
        <div
          style={{
            fontSize: 'var(--osd-size-body)',
            letterSpacing: '0.42em',
            textIndent: '0.42em',
          }}
        >
          KOKUKOKU
        </div>
      </div>
    </Lacquer>
  );
};

// ───────────────────────── 2. 気にする3つの時間 ─────────────────────────

const TimeCard = ({ name, role }: { name: string; role: string }) => (
  <div
    style={{
      position: 'relative',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 405,
      background: 'rgba(248, 240, 217, 0.68)',
      border: '3px solid rgba(70, 52, 25, 0.32)',
      boxShadow: '0 18px 37.5px rgba(92, 67, 29, 0.17)',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 51,
        right: 51,
        height: 7.5,
        background: 'var(--osd-accent)',
      }}
    />
    <strong style={{ color: '#2a2115', fontSize: 102, fontWeight: 500, lineHeight: 1 }}>
      {name}
    </strong>
    <span style={{ marginTop: 45, color: '#6b5d48', fontSize: 45, letterSpacing: '0.16em' }}>
      {role}
    </span>
  </div>
);

const ThreeTimes: Page = () => (
  <Scroll unroll>
    <h1 style={titleStyle}>気にする3つの時間</h1>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 45,
        width: 1380,
        marginTop: 54,
      }}
    >
      <TimeCard name="過去" role="記録" />
      <TimeCard name="今" role="現在時刻" />
      <TimeCard name="未来" role="予定" />
    </div>
    <div style={{ marginTop: 45, color: '#34291c', fontSize: 48, letterSpacing: '0.11em' }}>
      3つを1つで扱うものは、案外ない
    </div>
  </Scroll>
);

// ───────────────────────── 3. 3つの時間が1つのUIで動く ─────────────────────────

const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;

// 動画の再生位置(9秒周期)から、時計の針の角度と3つの状態の濃さを決める。
const triadVisual = (currentTime: number) => {
  const time = currentTime % 9;
  if (time < 3) return { weights: [1, 0, 0], hour: 285, minute: 180 };
  if (time < 3.35) {
    const progress = (time - 3) / 0.35;
    return {
      weights: [1 - progress, progress, 0],
      hour: lerp(285, 297.5, progress),
      minute: lerp(180, 330, progress),
    };
  }
  if (time < 6) return { weights: [0, 1, 0], hour: 297.5, minute: 330 };
  if (time < 6.35) {
    const progress = (time - 6) / 0.35;
    return {
      weights: [0, 1 - progress, progress],
      hour: lerp(297.5, 300, progress),
      minute: lerp(330, 360, progress),
    };
  }
  if (time < 8.3) return { weights: [0, 0, 1], hour: 300, minute: 360 };
  if (time < 8.65) {
    const progress = (time - 8.3) / 0.35;
    return {
      weights: [progress, 0, 1 - progress],
      hour: lerp(300, 285, progress),
      minute: lerp(360, 180, progress),
    };
  }
  return { weights: [1, 0, 0], hour: 285, minute: 180 };
};

const stacked: CSSProperties = { position: 'absolute', inset: 0 };

const clockHand: CSSProperties = {
  position: 'absolute',
  bottom: '50%',
  zIndex: 2,
  display: 'block',
  borderRadius: 9,
  background: '#2d2a23',
  transformOrigin: '50% 100%',
};

const TimeTriad = ({ playing }: { playing: boolean }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const visual = triadVisual(currentTime);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '480px 840px',
        alignItems: 'center',
        gap: 66,
        marginTop: 37.5,
      }}
    >
      <div
        role="img"
        aria-label="09時30分から10時へ進む時計"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <div
          style={{
            position: 'relative',
            boxSizing: 'border-box',
            width: 375,
            height: 375,
            border: '12px solid #393326',
            borderRadius: '50%',
            background: [
              'radial-gradient(circle at 50% 50%, transparent 0 126px, rgba(60, 51, 35, 0.16) 127.5px 130.5px, transparent 132px)',
              'repeating-conic-gradient(from -1deg, #514838 0 2deg, transparent 2deg 30deg)',
              '#f5ecd3',
            ].join(', '),
            boxShadow: '0 19.5px 36px rgba(61, 43, 18, 0.2)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 21,
              borderRadius: '50%',
              background: '#f5ecd3',
              zIndex: 0,
            }}
          />
          <i
            style={{
              ...clockHand,
              left: 'calc(50% - 4.5px)',
              width: 9,
              height: 96,
              transform: `rotate(${visual.hour}deg)`,
            }}
          />
          <i
            style={{
              ...clockHand,
              left: 'calc(50% - 3px)',
              width: 6,
              height: 132,
              transform: `rotate(${visual.minute}deg)`,
            }}
          />
          <i
            style={{
              position: 'absolute',
              left: 'calc(50% - 10.5px)',
              top: 'calc(50% - 10.5px)',
              zIndex: 3,
              width: 21,
              height: 21,
              borderRadius: '50%',
              background: '#b33f28',
            }}
          />
        </div>
        <div
          style={{
            position: 'relative',
            width: 360,
            height: 82.5,
            marginTop: 19.5,
            color: '#2b2419',
            fontFamily: MONO,
            fontSize: 66,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          <span style={{ ...stacked, opacity: visual.weights[0] }}>09:30</span>
          <span style={{ ...stacked, opacity: visual.weights[1] }}>09:55</span>
          <span style={{ ...stacked, opacity: visual.weights[2] }}>10:00</span>
        </div>
        <div
          style={{
            position: 'relative',
            width: 420,
            height: 57,
            color: '#84301f',
            fontSize: 42,
            letterSpacing: '0.08em',
            textAlign: 'center',
          }}
        >
          <span style={{ ...stacked, opacity: visual.weights[0] }}>作業を記録</span>
          <span style={{ ...stacked, opacity: visual.weights[1] }}>予定が光る</span>
          <span style={{ ...stacked, opacity: visual.weights[2] }}>社内業務を計測</span>
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          width: 840,
          height: 594,
          overflow: 'hidden',
          border: '3px solid #5a4c32',
          borderRadius: 'var(--osd-radius)',
          background: 'radial-gradient(circle at 50% 42%, #40392d, #181713 74%)',
          boxShadow: '0 27px 51px rgba(52, 36, 15, 0.34)',
        }}
      >
        <LoopVideo src={demoFlow} playing={playing} fit="contain" onFrame={setCurrentTime} />
      </div>
    </div>
  );
};

const Sync: Page = () => {
  const active = useIsActivePage();
  const trigger = useStepRevealed();
  return (
    <Scroll>
      <h1 style={titleStyle}>3つの時間が、1つのUIで動く</h1>
      <TimeTriad playing={active && trigger.revealed} />
      <ClickTrigger triggerRef={trigger.ref} />
    </Scroll>
  );
};

// ───────────────────────── 4. 呼び出して計測 ─────────────────────────

const sideDemo: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '810px 1fr',
  alignItems: 'center',
  width: '100%',
  height: '100%',
};

const verticalCopy: CSSProperties = {
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: 52.5,
  height: 712.5,
  paddingTop: 12,
  color: '#302519',
};

// 縦組みの1行。右に細い界線を引く。
const VerticalLine = ({ children, lead = false }: { children: ReactNode; lead?: boolean }) => (
  <div
    style={{
      position: 'relative',
      writingMode: 'vertical-rl',
      textOrientation: 'mixed',
      color: lead ? '#9f3825' : '#33281b',
      fontSize: lead ? 57 : 'var(--osd-size-body)',
      fontWeight: lead ? 500 : 400,
      lineHeight: 1.25,
      letterSpacing: '0.12em',
      whiteSpace: 'nowrap',
    }}
  >
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: -27,
        width: 1.5,
        height: '100%',
        background: 'rgba(79, 58, 28, 0.18)',
      }}
    />
    {children}
  </div>
);

const Invoke: Page = () => {
  const active = useIsActivePage();
  const trigger = useStepRevealed();
  return (
    <Scroll>
      <div style={sideDemo}>
        <div style={{ ...videoFrame, justifySelf: 'center', width: 738, height: 765 }}>
          <LoopVideo
            src={demoA}
            playing={active && trigger.revealed}
            previewTime={0.2}
            hidden={!trigger.revealed}
            fit="contain"
          />
        </div>
        <div role="group" aria-label="呼び出して計測する操作" style={verticalCopy}>
          <VerticalLine lead>ホットキーで呼び出す</VerticalLine>
          <VerticalLine>数字キーで計測</VerticalLine>
          <VerticalLine>
            <span
              style={{
                display: 'inline-block',
                textOrientation: 'upright',
                fontFamily: MONO,
                letterSpacing: 0,
              }}
            >
              q
            </span>
            で閉じる
          </VerticalLine>
        </div>
      </div>
      <ClickTrigger triggerRef={trigger.ref} />
    </Scroll>
  );
};

// ───────────────────────── 5. パネル解剖 ─────────────────────────

// 引き出し線つきの札。sideは札を置く側。
const Callout = ({ label, side, top }: { label: string; side: 'left' | 'right'; top: number }) => (
  <div
    style={{
      position: 'absolute',
      top,
      ...(side === 'left' ? { left: 0 } : { right: 0, justifyContent: 'flex-end' }),
      display: 'flex',
      alignItems: 'center',
      width: 300,
      color: '#30261a',
      fontSize: 46.5,
      letterSpacing: '0.1em',
    }}
  >
    <span
      style={{
        padding: '12px 22.5px',
        borderBottom: '4.5px solid #ae3d28',
        background: 'rgba(247, 239, 216, 0.88)',
      }}
    >
      {label}
    </span>
    <div
      style={{
        position: 'absolute',
        top: '50%',
        ...(side === 'left' ? { left: 285 } : { right: 285 }),
        width: 232.5,
        height: 3,
        background: '#ae3d28',
      }}
    />
  </div>
);

const Anatomy: Page = () => (
  <Scroll>
    <div style={{ position: 'relative', width: 1500, height: 786 }}>
      <img
        src={stillPanel}
        alt="KOKUKOKUのパネル全体"
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          boxSizing: 'border-box',
          width: 750,
          height: 786,
          transform: 'translateX(-50%)',
          objectFit: 'contain',
          border: '3px solid #463a29',
          boxShadow: '0 21px 39px rgba(60, 41, 18, 0.28)',
        }}
      />
      <Callout label="現在時刻" side="left" top={52.5} />
      <Callout label="予定" side="right" top={232.5} />
      <Callout label="計測" side="left" top={460.5} />
      <Callout label="連続作業" side="right" top={634.5} />
    </div>
  </Scroll>
);

// ───────────────────────── 6. 予定通知 ─────────────────────────

const Notification: Page = () => {
  const active = useIsActivePage();
  const trigger = useStepRevealed();
  return (
    <Scroll>
      <h1 style={titleStyle}>予定が近づくと</h1>
      <div style={{ ...videoFrame, width: 1395, aspectRatio: '2220 / 930', marginTop: 36 }}>
        <LoopVideo src={demoB} playing={active && trigger.revealed} />
      </div>
      <div
        style={{
          display: 'flex',
          gap: 66,
          alignItems: 'baseline',
          marginTop: 39,
          color: '#34291c',
        }}
      >
        <strong style={{ fontSize: 46.5, fontWeight: 500 }}>前面でリマインドしてくれる</strong>
        <span style={{ color: '#7b2f21', fontSize: 43.5 }}>フォーカスは奪わない</span>
      </div>
      <ClickTrigger triggerRef={trigger.ref} />
    </Scroll>
  );
};

// ───────────────────────── 7. 集中のライフ ─────────────────────────

const CandleLife: Page = () => {
  const active = useIsActivePage();
  const trigger = useStepRevealed();
  return (
    <Scroll>
      <div style={sideDemo}>
        <div style={{ ...videoFrame, justifySelf: 'center', width: 700.5, height: 765 }}>
          <LoopVideo src={demoC} playing={active && trigger.revealed} fit="contain" />
        </div>
        <div
          role="group"
          aria-label="ろうそくは集中のライフ。尽きたら休憩のサイン"
          style={{ ...verticalCopy, gap: 67.5 }}
        >
          <VerticalLine lead>ろうそくは集中のライフ</VerticalLine>
          <VerticalLine>尽きたら休憩のサイン</VerticalLine>
        </div>
      </div>
      <ClickTrigger triggerRef={trigger.ref} />
    </Scroll>
  );
};

// ───────────────────────── 8. 世界観と遊び心 ─────────────────────────

const Motif = ({
  src,
  alt,
  label,
  tilt,
  dimmed = false,
  silhouette = false,
}: {
  src: string;
  alt: string;
  label: string;
  tilt: 'odd' | 'even';
  dimmed?: boolean;
  silhouette?: boolean;
}) => (
  <div
    style={{
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 487.5,
      background: 'rgba(248, 240, 216, 0.72)',
      border: '3px solid rgba(65, 49, 26, 0.3)',
      boxShadow: '0 18px 36px rgba(77, 55, 24, 0.18)',
      transform: tilt === 'even' ? 'translateY(27px) rotate(1deg)' : 'rotate(-1deg)',
      opacity: dimmed ? 0.16 : 1,
      transition: 'opacity 0.3s ease',
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{
        display: 'block',
        width: 202.5,
        height: 225,
        objectFit: 'contain',
        ...(silhouette ? { filter: 'brightness(0) saturate(100%)', opacity: 0.8 } : {}),
      }}
    />
    <span style={{ marginTop: 42, color: '#30261a', fontSize: 45, letterSpacing: '0.09em' }}>
      {label}
    </span>
  </div>
);

const Playful: Page = () => {
  const trigger = useStepRevealed();
  const dimmed = trigger.revealed;
  return (
    <Scroll>
      <h1 style={titleStyle}>世界観を大切に、遊び心のあるUIを</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 34.5,
          width: 1455,
          marginTop: 79.5,
        }}
      >
        <Motif src={iconClock} alt="和紙の丸窓" label="丸窓" tilt="odd" dimmed={dimmed} />
        <Motif src={iconKanzashi} alt="玉簪" label="玉簪" tilt="even" />
        <Motif src={iconCandle} alt="和ろうそく" label="和ろうそく" tilt="odd" dimmed={dimmed} />
        <Motif
          src={iconSoroban}
          alt="そろばん"
          label="そろばん"
          tilt="even"
          dimmed={dimmed}
          silhouette
        />
      </div>
      <ClickTrigger triggerRef={trigger.ref} />
    </Scroll>
  );
};

// ───────────────────────── 9. 押しピンを簪にするまでの18弾 ─────────────────────────

// 記事の全文キャプチャを、クリック後にゆっくり下へ送る。
const ArticleScroll = ({ src, alt, playing }: { src: string; alt: string; playing: boolean }) => {
  const viewport = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const target = image.current;
    const frame = viewport.current;
    if (!target || !frame || !loaded) return;
    // キャンバスは拡大縮小されるので、getBoundingClientRectではなくレイアウト上の高さで測る。
    const distance = Math.max(0, target.offsetHeight - frame.clientHeight);
    const start = `translateY(-${Math.round(distance * 0.3)}px)`;
    const end = `translateY(-${Math.round(distance * 0.5)}px)`;
    target.style.transform = start;
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = target.animate([{ transform: start }, { transform: end }], {
      duration: 26000,
      easing: 'linear',
      fill: 'forwards',
    });
    return () => animation.cancel();
  }, [playing, loaded]);

  return (
    <div
      ref={viewport}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        height: '100%',
        overflow: 'hidden',
        paddingInline: 33,
        background: '#fff8e7',
      }}
    >
      <img
        ref={image}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ display: 'block', width: '100%', height: 'auto', maxWidth: 'none' }}
      />
    </div>
  );
};

const KanzashiStory: Page = () => {
  const active = useIsActivePage();
  const trigger = useStepRevealed();
  return (
    <Scroll padding="36px 48px">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '36% 64%',
          gap: 36,
          width: '100%',
          height: '100%',
        }}
      >
        <a
          href="https://minerva.mamansoft.net/Notes/%F0%9F%93%B0%E6%8A%BC%E3%81%97%E3%83%94%E3%83%B3%E3%82%92%E7%B0%AA%E3%81%AB%E3%81%99%E3%82%8B%E3%81%BE%E3%81%A7%E3%81%AE18%E5%BC%BE"
          style={{
            alignSelf: 'center',
            overflow: 'hidden',
            color: 'inherit',
            textDecoration: 'none',
            background: 'rgba(248, 240, 217, 0.72)',
          }}
        >
          <img
            src={articleHeader}
            alt="記事『押しピンを簪にするまでの18弾』のヘッダー画像"
            style={{ display: 'block', width: '100%', height: 267, objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', padding: '30px 33px 27px' }}>
            <span style={{ color: '#a13a27', fontSize: 27, letterSpacing: '0.18em' }}>
              開発記録
            </span>
            <strong
              style={{
                marginTop: 19.5,
                color: '#2d2418',
                fontSize: 42,
                fontWeight: 500,
                lineHeight: 1.45,
                letterSpacing: '0.06em',
              }}
            >
              押しピンを簪にするまでの18弾
            </strong>
            <small
              style={{
                marginTop: 33,
                color: '#6c5d48',
                fontFamily: MONO,
                fontSize: 24,
                letterSpacing: '0.01em',
              }}
            >
              minerva.mamansoft.net
            </small>
          </div>
        </a>
        <ArticleScroll
          src={articleFull}
          alt="記事本文の全文キャプチャ"
          playing={active && trigger.revealed}
        />
      </div>
      <ClickTrigger triggerRef={trigger.ref} />
    </Scroll>
  );
};

// ───────────────────────── 10. インストール ─────────────────────────

const Install: Page = () => {
  const active = useIsActivePage();
  return (
    <Lacquer>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'max-content',
          color: '#efe4c9',
          fontFamily: MONO,
          fontSize: 42,
          letterSpacing: '0.01em',
          animation: active ? 'kk-command-in 0.45s 0.08s ease-out both' : 'none',
        }}
      >
        <span style={{ color: '#d5a94f' }}>$</span> brew install --cask tadashi-aikawa/tap/kokukoku
      </div>
      <PageNumber style={{ right: 45, color: '#b89043', fontSize: 27, letterSpacing: '0.12em' }} />
    </Lacquer>
  );
};

// ───────────────────────── 11. 締め ─────────────────────────

const Closing: Page = () => (
  <Scroll justifyContent="center" pageNumber={false}>
    <div
      style={{
        color: '#281f14',
        fontFamily: 'var(--osd-font-display)',
        fontSize: 93,
        fontWeight: 500,
        letterSpacing: '0.13em',
      }}
    >
      刻一刻と時を見守る
    </div>
    <div style={{ marginTop: 33, color: '#6f5e43', fontSize: 42, letterSpacing: '0.24em' }}>
      KOKUKOKU・刻刻
    </div>
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: 49.5,
        transform: 'translateX(-50%)',
        color: '#5c503f',
        fontFamily: MONO,
        fontSize: 36,
        letterSpacing: '0.03em',
      }}
    >
      github.com/tadashi-aikawa/kokukoku
    </div>
    <img
      src={logo}
      alt="KOKUKOKU"
      style={{
        position: 'absolute',
        left: 42,
        bottom: 36,
        width: 135,
        height: 135,
        objectFit: 'contain',
        mixBlendMode: 'multiply',
      }}
    />
  </Scroll>
);

export const meta: SlideMeta = {
  title: 'KOKUKOKU — 刻一刻と時を見守る',
  createdAt: '2026-10-01T22:50:13.566Z',
};

export default [
  Opening,
  ThreeTimes,
  Sync,
  Invoke,
  Anatomy,
  Notification,
  CandleLife,
  Playful,
  KanzashiStory,
  Install,
  Closing,
] satisfies Page[];
