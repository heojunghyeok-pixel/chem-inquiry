import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONT} from '../constants';

/** 볼드 헤드라인: 줄 단위 스프링 등장 + 감속 퇴장 */
export const Headline: React.FC<{
  lines: string[];
  sub?: string;
  delay?: number;
  exitAt?: number;
  top?: number;
  size?: number;
  accent?: string;
  accentAll?: boolean;
}> = ({lines, sub, delay = 0, exitAt, top = 150, size = 72, accent = COLORS.cyan, accentAll = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < delay) return null;
  const exit =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.in(Easing.cubic),
        });
  if (exit >= 1) return null;
  const subIn = spring({frame: frame - delay - 8 - lines.length * 4, fps, config: {damping: 14, stiffness: 120}});

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        padding: '0 50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        fontFamily: FONT,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 50}px)`,
      }}
    >
      {lines.map((line, i) => {
        const s = spring({frame: frame - delay - i * 5, fps, config: {damping: 11, stiffness: 150, mass: 0.7}});
        const last = accentAll || (i === lines.length - 1 && lines.length > 1);
        return (
          <div
            key={line}
            style={{
              fontSize: size,
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: -1.5,
              color: last ? accent : COLORS.white,
              textAlign: 'center',
              textShadow: '0 6px 0 rgba(0,0,0,0.45)',
              opacity: Math.min(1, s * 1.5),
              transform: `translateY(${(1 - s) * 60}px) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
            }}
          >
            {line}
          </div>
        );
      })}
      {sub ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 38,
            fontWeight: 700,
            color: COLORS.slate,
            textAlign: 'center',
            opacity: subIn,
            transform: `translateY(${(1 - subIn) * 24}px)`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/** 하단 자막 바 */
export const Subtitle: React.FC<{text: string; delay: number; exitAt?: number; bottom?: number; color?: string}> = ({
  text,
  delay,
  exitAt,
  bottom = 120,
  color = COLORS.white,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < delay) return null;
  const s = spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 140}});
  const exit = exitAt === undefined ? 0 : interpolate(frame, [exitAt, exitAt + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', opacity: s * (1 - exit)}}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 36,
          color,
          background: 'rgba(3,5,13,0.85)',
          border: `2px solid ${COLORS.panelLine}`,
          padding: '12px 28px',
          borderRadius: 14,
          transform: `translateY(${(1 - s) * 30}px)`,
          textAlign: 'center',
          maxWidth: 960,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** 라벨 칩 */
export const Chip: React.FC<{text: string; x: number; y: number; delay: number; color?: string; size?: number}> = ({
  text,
  x,
  y,
  delay,
  color = COLORS.cyan,
  size = 32,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 180}});
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) scale(${s})`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        color: COLORS.bg,
        background: color,
        padding: '6px 20px',
        borderRadius: 999,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/** 씬 래퍼: 진입 줌 + 페이드 인/아웃, 테크 그리드 배경 */
export const SceneFrame: React.FC<{duration: number; background?: string; grid?: boolean; children: React.ReactNode}> = ({
  duration,
  background,
  grid = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 14], [1.04, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <AbsoluteFill
      style={{
        background:
          background ?? `radial-gradient(circle at 50% 30%, #1a1450 0%, ${COLORS.bg} 55%, ${COLORS.bgDeep} 100%)`,
      }}
    >
      {grid ? (
        <AbsoluteFill
          style={{
            opacity: 0.08,
            backgroundImage:
              'linear-gradient(rgba(167,139,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.6) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      ) : null}
      <AbsoluteFill style={{opacity, transform: `scale(${scale})`}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
