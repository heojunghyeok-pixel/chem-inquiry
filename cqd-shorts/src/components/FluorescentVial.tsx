import React from 'react';
import {COLORS, FONT} from '../constants';

/**
 * 365 nm UV 아래에서 자체 발광하는 바이알 (SVG <g>, 원점 = 바이알 바닥 중앙).
 * - glow: 0~1 형광 세기 (0이면 상온 조명 아래 옅은 노란 용액)
 * 발광은 SVG feGaussianBlur 헤일로 + CSS drop-shadow 를 겹쳐 표현.
 */
export const FluorescentVial: React.FC<{
  color: string;
  glow: number;
  label?: string;
  w?: number;
  h?: number;
}> = ({color, glow, label, w = 120, h = 260}) => {
  const id = `vial${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const liquidTop = -h * 0.72;
  const g = Math.max(0, Math.min(1, glow));
  // 꺼진 상태: 옅은 노란빛 투명 용액
  const liquid = g > 0.05 ? color : '#fef3c7';

  return (
    <g>
      <defs>
        <filter id={`${id}-blur`} x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation={28} />
        </filter>
        <linearGradient id={`${id}-liq`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.6 * g} />
          <stop offset="35%" stopColor={liquid} stopOpacity={0.35 + 0.65 * g} />
          <stop offset="100%" stopColor={liquid} stopOpacity={0.45 + 0.55 * g} />
        </linearGradient>
      </defs>
      {/* 헤일로 (블러) */}
      <ellipse cx={0} cy={liquidTop / 2} rx={w * 1.1} ry={-liquidTop * 0.9} fill={color} opacity={0.75 * g} filter={`url(#${id}-blur)`} />
      {/* 액체 */}
      <g style={g > 0.05 ? {filter: `drop-shadow(0 0 ${14 + 26 * g}px ${color})`} : undefined}>
        <rect x={-w / 2 + 8} y={liquidTop} width={w - 16} height={-liquidTop - 8} rx={18} fill={`url(#${id}-liq)`} />
      </g>
      {/* 유리 */}
      <rect x={-w / 2} y={-h} width={w} height={h} rx={24} fill="#ffffff" fillOpacity={0.06} stroke="#e2e8f0" strokeOpacity={0.7} strokeWidth={5} />
      <rect x={-w / 2 + 14} y={-h + 40} width={10} height={h - 70} rx={5} fill="#ffffff" opacity={0.3} />
      {/* 뚜껑 */}
      <rect x={-w / 2 - 6} y={-h - 46} width={w + 12} height={50} rx={10} fill={COLORS.slateDark} stroke={COLORS.slate} strokeWidth={3} />
      {label ? (
        <text y={50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={g > 0.3 ? color : COLORS.slate}>
          {label}
        </text>
      ) : null}
    </g>
  );
};
