import React from 'react';
import {COLORS} from '../constants';

/**
 * 반투명 하늘색 물방울 (SVG <g>).
 * - (cx, cy): 중심, r: 반지름
 * - squash: >1 이면 가로로 납작 (착지 충격), <1 이면 세로로 늘어남
 * - roll: 굴러간 각도(도). 내부 반짝이 무늬가 회전해 '데굴데굴' 느낌을 준다.
 *   하이라이트는 광원 고정이라 회전하지 않음.
 */
export const WaterDroplet: React.FC<{
  cx: number;
  cy: number;
  r: number;
  squash?: number;
  roll?: number;
  opacity?: number;
  dirt?: number; // 흡착된 먼지 개수 (자가세정 표현)
}> = ({cx, cy, r, squash = 1, roll = 0, opacity = 1, dirt = 0}) => {
  const id = `drop${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const sx = squash;
  const sy = 1 / squash;
  return (
    <g
      transform={`translate(${cx}, ${cy + r * (1 - sy)}) scale(${sx}, ${sy})`}
      opacity={opacity}
    >
      <defs>
        <radialGradient id={`${id}-body`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#e0f7ff" stopOpacity={0.95} />
          <stop offset="55%" stopColor={COLORS.water} stopOpacity={0.7} />
          <stop offset="100%" stopColor={COLORS.waterDeep} stopOpacity={0.85} />
        </radialGradient>
      </defs>
      {/* 바닥 그림자 */}
      <ellipse cx={0} cy={r * 0.98} rx={r * 0.7} ry={r * 0.1} fill="#000" opacity={0.25} />
      <circle r={r} fill={`url(#${id}-body)`} />
      <circle r={r} fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={Math.max(2, r * 0.04)} />
      {/* 회전하는 내부 무늬 */}
      <g transform={`rotate(${roll})`} opacity={0.45}>
        <circle cx={r * 0.45} cy={r * 0.3} r={r * 0.08} fill="#ffffff" />
        <circle cx={-r * 0.2} cy={r * 0.5} r={r * 0.05} fill="#ffffff" />
        {Array.from({length: dirt}).map((_, i) => (
          <circle
            key={i}
            cx={Math.cos(i * 2.1) * r * 0.45}
            cy={Math.sin(i * 2.1) * r * 0.45}
            r={r * 0.09}
            fill="#78350f"
            opacity={1}
          />
        ))}
      </g>
      {/* 고정 하이라이트 */}
      <ellipse cx={-r * 0.35} cy={-r * 0.42} rx={r * 0.26} ry={r * 0.15} fill="#ffffff" opacity={0.9} transform={`rotate(-30 ${-r * 0.35} ${-r * 0.42})`} />
      <circle cx={-r * 0.62} cy={-r * 0.08} r={r * 0.06} fill="#ffffff" opacity={0.8} />
    </g>
  );
};
