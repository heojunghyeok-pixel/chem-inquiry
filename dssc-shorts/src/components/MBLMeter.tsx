import React from 'react';
import {COLORS, FONT, ISC_MAX, MONO} from '../constants';

/**
 * MBL 전류계: 아날로그 바늘 + 디지털 표시 (SVG <g>, 원점 = 바늘 축).
 * - value: 바늘 위치 전류(µA, 오버슈트 포함) / display: 디지털 표시값
 * - color: 켜진 LED 색 (없으면 회색)
 */
export const MBLMeter: React.FC<{value: number; display?: number; color?: string; ledName?: string; peak?: boolean}> = ({
  value,
  display,
  color = COLORS.slate,
  ledName,
  peak = false,
}) => {
  const R = 260;
  const v = Math.max(0, Math.min(ISC_MAX * 1.05, value));
  const toAngle = (x: number) => Math.PI - (x / ISC_MAX) * Math.PI; // 0 → 왼쪽, max → 오른쪽
  const a = toAngle(v);
  const ticks = Array.from({length: 9}).map((_, i) => (i * ISC_MAX) / 8);

  return (
    <g>
      <rect x={-R - 70} y={-R - 90} width={(R + 70) * 2} height={R + 300} rx={36} fill={COLORS.panel} stroke={peak ? COLORS.green : COLORS.panelLine} strokeWidth={peak ? 6 : 4} />
      <text x={-R - 40} y={-R - 40} fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.slate}>
        MBL · 전류 센서
      </text>
      {/* 눈금 호 */}
      <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0`} stroke={COLORS.slateDark} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path
        d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${Math.cos(a) * R} ${-Math.sin(a) * R}`}
        stroke={color}
        strokeWidth={26}
        fill="none"
        strokeLinecap="round"
        opacity={v > 0.5 ? 1 : 0}
      />
      {ticks.map((t) => {
        const ta = toAngle(t);
        return (
          <g key={t}>
            <line x1={Math.cos(ta) * (R - 40)} y1={-Math.sin(ta) * (R - 40)} x2={Math.cos(ta) * (R - 20)} y2={-Math.sin(ta) * (R - 20)} stroke={COLORS.white} strokeWidth={4} />
            <text x={Math.cos(ta) * (R - 70)} y={-Math.sin(ta) * (R - 70) + 9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={COLORS.slate}>
              {t.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* 바늘 */}
      <line x1={0} y1={0} x2={Math.cos(a) * (R - 30)} y2={-Math.sin(a) * (R - 30)} stroke={COLORS.white} strokeWidth={10} strokeLinecap="round" />
      <circle r={22} fill={COLORS.white} />
      <circle r={10} fill={color} />
      {/* 디지털 표시 */}
      <rect x={-230} y={50} width={460} height={110} rx={16} fill="#03050d" stroke={color} strokeWidth={3} />
      <text x={0} y={128} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={60} fill={peak ? COLORS.green : COLORS.white}>
        Isc {Math.max(0, display ?? v).toFixed(1)} µA
      </text>
      {ledName ? (
        <text x={0} y={190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={color}>
          {ledName} LED 조사 중
        </text>
      ) : null}
    </g>
  );
};
