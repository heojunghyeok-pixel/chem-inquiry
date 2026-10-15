import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {COLORS} from '../constants';

/** 결정적 지그재그 번개 경로 */
export const boltPath = (x1: number, y1: number, x2: number, y2: number, seg: number, jitter: number, seed: string) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i < seg; i++) {
    const t = i / seg;
    const off = (random(`${seed}-${i}`) - 0.5) * 2 * jitter;
    d += ` L ${x1 + dx * t + nx * off} ${y1 + dy * t + ny * off}`;
  }
  return `${d} L ${x2} ${y2}`;
};

/** 번개 아이콘 (배지용) */
export const BoltIcon: React.FC<{size?: number; color?: string}> = ({size = 1, color = COLORS.yellow}) => (
  <g transform={`scale(${size})`}>
    <polygon points="12,-60 -34,8 -4,8 -16,60 34,-12 4,-12" fill={color} stroke={COLORS.bg} strokeWidth={4} strokeLinejoin="round" />
  </g>
);

/**
 * 네온 블루베리 (SVG <g>, 원점 중심).
 * - r: 반지름 / aura: 0~1 보라 오라 세기 / sparks: 0~1 번개 세기
 * - face: 캐릭터 얼굴 표시, wink: 0~1 윙크
 */
export const BlueberryBattery: React.FC<{
  r?: number;
  aura?: number;
  sparks?: number;
  face?: boolean;
  wink?: number;
}> = ({r = 160, aura = 1, sparks = 1, face = false, wink = 0}) => {
  const frame = useCurrentFrame();
  const id = `bb${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const pulse = 1 + Math.sin(frame * 0.15) * 0.06;
  const seed = Math.floor(frame / 3);

  return (
    <g>
      <defs>
        <radialGradient id={`${id}-aura`}>
          <stop offset="40%" stopColor={COLORS.neonPurple} stopOpacity={0.55} />
          <stop offset="100%" stopColor={COLORS.neonPurple} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-body`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#8b7cf6" />
          <stop offset="45%" stopColor={COLORS.blueberryLight} />
          <stop offset="100%" stopColor="#1e0b4b" />
        </radialGradient>
      </defs>
      {/* 오라 */}
      <circle r={r * 2.1 * pulse} fill={`url(#${id}-aura)`} opacity={aura} />

      {/* 번개 스파크 */}
      {sparks > 0
        ? Array.from({length: 6}).map((_, i) => {
            const on = random(`on${i}-${seed}`) < 0.75;
            if (!on) return null;
            const a = random(`a${i}-${seed}`) * Math.PI * 2;
            const r1 = r * 1.05;
            const r2 = r * (1.6 + random(`l${i}-${seed}`) * 0.7);
            const d = boltPath(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * r2, Math.sin(a) * r2, 5, r * 0.12, `s${i}-${seed}`);
            return (
              <g key={i} opacity={sparks}>
                <path d={d} stroke={COLORS.yellow} strokeWidth={r * 0.09} fill="none" opacity={0.3} strokeLinejoin="round" />
                <path d={d} stroke={COLORS.yellow} strokeWidth={r * 0.04} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <path d={d} stroke="#ffffff" strokeWidth={r * 0.015} fill="none" strokeLinejoin="round" />
              </g>
            );
          })
        : null}

      {/* 열매 */}
      <circle r={r} fill={`url(#${id}-body)`} />
      <circle r={r} fill="none" stroke={COLORS.neonPurple} strokeWidth={r * 0.03} opacity={0.8} />
      {/* 블룸(하얀 분) 느낌 */}
      <ellipse cx={-r * 0.35} cy={-r * 0.4} rx={r * 0.32} ry={r * 0.18} fill="#ffffff" opacity={0.35} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.4})`} />
      {/* 꽃받침 왕관 */}
      <g transform={`translate(0, ${-r * 0.78})`}>
        <circle r={r * 0.2} fill="#1e0b4b" />
        {Array.from({length: 5}).map((_, i) => {
          const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
          return (
            <polygon
              key={i}
              points={`0,0 ${Math.cos(a - 0.3) * r * 0.16},${Math.sin(a - 0.3) * r * 0.16} ${Math.cos(a) * r * 0.3},${Math.sin(a) * r * 0.3} ${Math.cos(a + 0.3) * r * 0.16},${Math.sin(a + 0.3) * r * 0.16}`}
              fill="#3b1a78"
            />
          );
        })}
      </g>
      {face ? (
        <g>
          {/* 왼눈 */}
          <ellipse cx={-r * 0.32} cy={r * 0.02} rx={r * 0.09} ry={r * 0.13} fill="#ffffff" />
          <circle cx={-r * 0.3} cy={r * 0.04} r={r * 0.05} fill="#0b0620" />
          {/* 오른눈: 윙크 */}
          {wink > 0.5 ? (
            <path d={`M ${r * 0.2} ${r * 0.04} Q ${r * 0.32} ${-r * 0.06} ${r * 0.44} ${r * 0.04}`} stroke="#ffffff" strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />
          ) : (
            <g>
              <ellipse cx={r * 0.32} cy={r * 0.02} rx={r * 0.09} ry={r * 0.13} fill="#ffffff" />
              <circle cx={r * 0.34} cy={r * 0.04} r={r * 0.05} fill="#0b0620" />
            </g>
          )}
          <path d={`M ${-r * 0.2} ${r * 0.3} Q 0 ${r * 0.48} ${r * 0.2} ${r * 0.3}`} stroke="#ffffff" strokeWidth={r * 0.05} fill="none" strokeLinecap="round" />
          <ellipse cx={-r * 0.52} cy={r * 0.25} rx={r * 0.1} ry={r * 0.06} fill={COLORS.pink} opacity={0.6} />
          <ellipse cx={r * 0.52} cy={r * 0.25} rx={r * 0.1} ry={r * 0.06} fill={COLORS.pink} opacity={0.6} />
        </g>
      ) : null}
    </g>
  );
};
