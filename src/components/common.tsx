import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, FONT, PAPER_SHADOW} from '../theme';

/** 다크 네이비 배경 + 은은한 종이 도트 텍스처 */
export const Background: React.FC<{tint?: string}> = ({tint}) => {
  const frame = useCurrentFrame();
  const drift = interpolate(frame, [0, 300], [0, 40], {
    extrapolateRight: 'extend',
  });
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 35%, ${tint ?? '#1a2a4d'} 0%, ${COLORS.bg} 55%, ${COLORS.bgDeep} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: 0.08,
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.9) 1.5px, transparent 1.6px)',
          backgroundSize: '36px 36px',
          backgroundPosition: `${drift}px ${drift * 0.5}px`,
        }}
      />
    </AbsoluteFill>
  );
};

/** 씬 전체의 등장/퇴장(스케일 + 페이드) 래퍼 */
export const SceneTransition: React.FC<{
  duration: number;
  children: React.ReactNode;
}> = ({duration, children}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, duration - 10, duration],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const scale = interpolate(
    frame,
    [0, 12, duration - 10, duration],
    [1.06, 1, 1, 0.94],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.33, 1, 0.68, 1),
    },
  );
  return (
    <AbsoluteFill style={{opacity, transform: `scale(${scale})`}}>
      {children}
    </AbsoluteFill>
  );
};

/** 굵은 산세리프 키워드 텍스트: 스프링 바운스로 등장, 감속 페이드로 퇴장 */
export const KeywordText: React.FC<{
  text: string;
  sub?: string;
  delay?: number;
  exitAt?: number;
  top?: number;
  color?: string;
  highlight?: string;
  size?: number;
}> = ({
  text,
  sub,
  delay = 0,
  exitAt,
  top = 180,
  color = COLORS.paper,
  highlight = COLORS.yellow,
  size = 86,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({
    frame: frame - delay,
    fps,
    config: {damping: 9, stiffness: 140, mass: 0.8},
  });
  const subEnter = spring({
    frame: frame - delay - 8,
    fps,
    config: {damping: 14, stiffness: 120},
  });
  const exit =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.in(Easing.cubic),
        });

  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: '0 60px',
        fontFamily: FONT,
        opacity: 1 - exit,
        transform: `translateY(${-exit * 60}px)`,
      }}
    >
      <div
        style={{
          background: highlight,
          color: COLORS.ink,
          fontSize: size,
          fontWeight: 900,
          lineHeight: 1.15,
          letterSpacing: -2,
          padding: '18px 40px',
          borderRadius: 18,
          textAlign: 'center',
          filter: PAPER_SHADOW,
          transform: `scale(${enter}) rotate(${interpolate(enter, [0, 1], [-8, -1.5])}deg)`,
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            color,
            fontSize: 46,
            fontWeight: 700,
            textAlign: 'center',
            opacity: subEnter,
            transform: `translateY(${(1 - subEnter) * 40}px)`,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/** 결정적(seed 기반) 지그재그 번개 경로 */
export const zigzagPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  segments: number,
  jitter: number,
  seed: string,
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const off = (random(`${seed}-${i}`) - 0.5) * 2 * jitter;
    d += ` L ${x1 + dx * t + nx * off} ${y1 + dy * t + ny * off}`;
  }
  d += ` L ${x2} ${y2}`;
  return d;
};

/** 노란 글로우가 들어간 번개 */
export const Bolt: React.FC<{
  d: string;
  width?: number;
  color?: string;
  opacity?: number;
}> = ({d, width = 10, color = COLORS.yellow, opacity = 1}) => (
  <g opacity={opacity}>
    <path
      d={d}
      stroke={color}
      strokeWidth={width * 3}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
      opacity={0.25}
    />
    <path
      d={d}
      stroke={color}
      strokeWidth={width}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d={d}
      stroke={COLORS.white}
      strokeWidth={width * 0.35}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </g>
);

/** 사인파 path 생성 */
export const sinePath = (
  x0: number,
  x1: number,
  yCenter: number,
  amplitude: number,
  wavelength: number,
  phase: number,
) => {
  let d = '';
  for (let x = x0; x <= x1; x += 6) {
    const y =
      yCenter + Math.sin(((x - x0) / wavelength) * Math.PI * 2 - phase) * amplitude;
    d += `${x === x0 ? 'M' : 'L'} ${x} ${y.toFixed(1)} `;
  }
  return d;
};

/** 포크 SVG (원점 기준, 위쪽이 날 끝) */
export const Fork: React.FC<{scale?: number}> = ({scale = 1}) => (
  <g transform={`scale(${scale})`}>
    <rect x={-14} y={40} width={28} height={300} rx={14} fill={COLORS.metal} />
    <path
      d="M -70 -120 L -70 20 Q -70 60 0 60 Q 70 60 70 20 L 70 -120 L 50 -120 L 50 10 L 30 10 L 30 -120 L 10 -120 L 10 10 L -10 10 L -10 -120 L -30 -120 L -30 10 L -50 10 L -50 -120 Z"
      fill={COLORS.metal}
    />
    <rect x={-6} y={60} width={6} height={260} rx={3} fill="#ffffff" opacity={0.35} />
  </g>
);
