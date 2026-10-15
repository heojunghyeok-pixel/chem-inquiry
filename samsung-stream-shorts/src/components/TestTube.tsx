import React from 'react';
import {COLORS, FONT} from '../constants';

/**
 * 시험관 SVG (<g>). (x, y)는 입구 중앙 상단.
 * - level: 0~1 액체 높이 비율
 * - color: 액체 색 (Hex) / liquidOpacity: 진하기
 * - wobble: 액면 출렁임(px)
 */
export const TestTube: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  level?: number;
  color?: string;
  liquidOpacity?: number;
  wobble?: number;
  label?: string;
  index?: number;
  glow?: number;
}> = ({
  x,
  y,
  w = 150,
  h = 520,
  level = 0.7,
  color = COLORS.clear,
  liquidOpacity = 0.25,
  wobble = 0,
  label,
  index,
  glow = 0,
}) => {
  const id = `tube${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const r = w / 2;
  const left = x - r;
  const right = x + r;
  const bottom = y + h; // 반구 바닥 끝
  const straightEnd = bottom - r;
  const outline = `M ${left} ${y} V ${straightEnd} A ${r} ${r} 0 0 0 ${right} ${straightEnd} V ${y}`;
  const surfaceY = bottom - (h - 30) * level;

  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={`${outline} Z`} />
        </clipPath>
        <linearGradient id={`${id}-glass`} x1="0" x2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.18} />
          <stop offset="30%" stopColor="#ffffff" stopOpacity={0.04} />
          <stop offset="80%" stopColor="#ffffff" stopOpacity={0.02} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.14} />
        </linearGradient>
      </defs>
      {glow > 0 ? <ellipse cx={x} cy={surfaceY + (bottom - surfaceY) / 2} rx={r * 2.2} ry={(bottom - surfaceY) * 0.8} fill={color} opacity={glow * 0.3} /> : null}
      {/* 액체 */}
      <g clipPath={`url(#${id}-clip)`}>
        <path
          d={`M ${left - 10} ${surfaceY} Q ${x - r / 2} ${surfaceY - wobble} ${x} ${surfaceY} T ${right + 10} ${surfaceY} V ${bottom + 10} H ${left - 10} Z`}
          fill={color}
          opacity={liquidOpacity}
        />
        <ellipse cx={x} cy={surfaceY} rx={r} ry={8} fill="#ffffff" opacity={0.25} />
      </g>
      {/* 유리 */}
      <path d={`${outline} Z`} fill={`url(#${id}-glass)`} />
      <path d={outline} fill="none" stroke={COLORS.white} strokeOpacity={0.85} strokeWidth={6} strokeLinecap="round" />
      <rect x={left - 14} y={y - 10} width={w + 28} height={18} rx={9} fill={COLORS.white} opacity={0.85} />
      <rect x={left + 16} y={y + 40} width={10} height={h - r - 70} rx={5} fill="#ffffff" opacity={0.35} />
      {label ? (
        <g>
          {index !== undefined ? (
            <g transform={`translate(${x}, ${bottom + 60})`}>
              <circle r={26} fill={COLORS.cyan} />
              <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.bg}>
                {index}
              </text>
            </g>
          ) : null}
          <text x={x} y={bottom + 136} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.white}>
            {label}
          </text>
        </g>
      ) : null}
    </g>
  );
};
