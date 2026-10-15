import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../constants';

/** 볼드 키워드 자막: 스프링 팝업 등장 + 감속 퇴장 */
export const KeywordCaption: React.FC<{
  lines: string[];
  sub?: string;
  delay?: number;
  exitAt?: number;
  top?: number;
  size?: number;
  accent?: string;
}> = ({lines, sub, delay = 0, exitAt, top = 150, size = 76, accent = COLORS.cyan}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const exit =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.in(Easing.cubic),
        });
  if (frame < delay) return null;

  const subIn = spring({frame: frame - delay - 10 - lines.length * 4, fps, config: {damping: 14, stiffness: 120}});

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        padding: '0 56px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        fontFamily: FONT,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 50}px) scale(${1 - exit * 0.08})`,
      }}
    >
      {lines.map((line, i) => {
        const s = spring({frame: frame - delay - i * 5, fps, config: {damping: 10, stiffness: 160, mass: 0.7}});
        return (
          <div
            key={line}
            style={{
              fontSize: size,
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: -2,
              color: i === lines.length - 1 && lines.length > 1 ? accent : COLORS.white,
              textAlign: 'center',
              textShadow: `0 0 28px ${accent}55, 0 6px 0 rgba(0,0,0,0.45)`,
              opacity: Math.min(1, s * 1.5),
              transform: `translateY(${(1 - s) * 70}px) scale(${interpolate(s, [0, 1], [0.6, 1])})`,
            }}
          >
            {line}
          </div>
        );
      })}
      {sub ? (
        <div
          style={{
            marginTop: 6,
            fontSize: 40,
            fontWeight: 700,
            color: COLORS.slate,
            textAlign: 'center',
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 30}px)`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/** 작은 라벨 칩 (SVG 밖 HTML 오버레이용) */
export const Chip: React.FC<{
  text: string;
  x: number;
  y: number;
  delay: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  size?: number;
}> = ({text, x, y, delay, color = COLORS.lime, align = 'center', size = 36}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 180}});
  const shift = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0%';
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${shift}, -50%) scale(${s})`,
        transformOrigin: align === 'left' ? 'left center' : align === 'right' ? 'right center' : 'center',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color: COLORS.navy,
        background: color,
        padding: '8px 22px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
        boxShadow: `0 0 24px ${color}88`,
      }}
    >
      {text}
    </div>
  );
};

/** 씬 래퍼: 진입 시 살짝 줌아웃, 퇴장 시 페이드 */
export const SceneFrame: React.FC<{duration: number; background: string; children: React.ReactNode}> = ({
  duration,
  background,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 14], [1.05, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{background}}>
      <AbsoluteFill style={{opacity, transform: `scale(${scale})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
