import React from 'react';
import {interpolate} from 'remotion';
import {COLORS, FONT, MONO} from '../constants';

/**
 * 에너지 준위 다이어그램 (SVG <g>, 원점 = 좌상단).
 * 한 사이클(CYCLE 프레임): UV 흡수 → 들뜬 상태 → 비복사 이완 → 형광 방출 → 바닥 상태
 * - t: 로컬 프레임 / emit: 형광 색
 */
const CYCLE = 90;

const wavePath = (x1: number, y1: number, x2: number, y2: number, waves: number, amp: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i <= 60; i++) {
    const k = i / 60;
    const s = Math.sin(k * waves * Math.PI * 2) * amp;
    d += ` L ${x1 + dx * k + nx * s} ${y1 + dy * k + ny * s}`;
  }
  return d;
};

export const EnergyLevel: React.FC<{t: number; emit: string; w?: number; h?: number}> = ({t, emit, w = 900, h = 560}) => {
  const groundY = h - 80;
  const excitedY = 110;
  const relaxedY = 170;
  const ex = w * 0.45;
  const c = ((t % CYCLE) + CYCLE) % CYCLE;

  // 전자 위치
  const up = interpolate(c, [10, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const relax = interpolate(c, [36, 48], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const down = interpolate(c, [55, 75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ey = c < 36 ? interpolate(up, [0, 1], [groundY, excitedY]) : c < 55 ? interpolate(relax, [0, 1], [excitedY, relaxedY]) : interpolate(down, [0, 1], [relaxedY, groundY]);
  const exX = c < 55 ? ex : ex + 0;

  const uvOn = c >= 0 && c < 32;
  const emitOn = c >= 55 && c < 85;

  return (
    <g>
      <rect x={0} y={0} width={w} height={h} rx={28} fill={COLORS.panel} opacity={0.92} stroke={COLORS.panelLine} strokeWidth={3} />
      <text x={30} y={50} fontFamily={MONO} fontWeight={700} fontSize={26} fill={COLORS.slate}>
        ENERGY LEVEL · 형광의 원리
      </text>
      {/* 준위 */}
      <line x1={ex - 180} y1={excitedY} x2={ex + 180} y2={excitedY} stroke={COLORS.white} strokeWidth={6} />
      <line x1={ex - 180} y1={relaxedY} x2={ex + 180} y2={relaxedY} stroke={COLORS.white} strokeWidth={3} strokeDasharray="10 8" opacity={0.6} />
      <line x1={ex - 180} y1={groundY} x2={ex + 180} y2={groundY} stroke={COLORS.white} strokeWidth={6} />
      <text x={ex - 200} y={excitedY + 10} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={28} fill={COLORS.white}>
        들뜬 상태
      </text>
      <text x={ex - 200} y={groundY + 10} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={28} fill={COLORS.white}>
        바닥 상태
      </text>

      {/* UV 흡수 (위로) */}
      <g opacity={uvOn ? 1 : 0.15}>
        <path d={wavePath(ex - 120, groundY - 10, ex - 120, excitedY + 10, 6, 14)} stroke={COLORS.uv} strokeWidth={6} fill="none" />
        <polygon points={`${ex - 120},${excitedY + 2} ${ex - 136},${excitedY + 30} ${ex - 104},${excitedY + 30}`} fill={COLORS.uv} />
        <text x={ex - 150} y={(groundY + excitedY) / 2} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.uv}>
          UV 흡수
        </text>
        <text x={ex - 150} y={(groundY + excitedY) / 2 + 36} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={24} fill={COLORS.uv}>
          365 nm
        </text>
      </g>
      {/* 비복사 이완 */}
      <g opacity={c >= 36 && c < 55 ? 1 : 0.2}>
        <path d={`M ${ex + 20} ${excitedY + 6} q 10 10 0 20 q -10 10 0 20 q 10 10 0 14`} stroke={COLORS.slate} strokeWidth={4} fill="none" />
        <text x={ex + 200} y={excitedY + 50} fontFamily={FONT} fontWeight={700} fontSize={24} fill={COLORS.slate}>
          열로 일부 손실
        </text>
      </g>
      {/* 형광 방출 (아래로) */}
      <g opacity={emitOn ? 1 : 0.15}>
        <path d={wavePath(ex + 120, relaxedY + 10, ex + 120, groundY - 12, 4, 16)} stroke={emit} strokeWidth={7} fill="none" style={{filter: `drop-shadow(0 0 10px ${emit})`}} />
        <polygon points={`${ex + 120},${groundY - 4} ${ex + 104},${groundY - 32} ${ex + 136},${groundY - 32}`} fill={emit} />
        <text x={ex + 160} y={(groundY + relaxedY) / 2} fontFamily={FONT} fontWeight={900} fontSize={30} fill={emit}>
          형광 방출
        </text>
        <text x={ex + 160} y={(groundY + relaxedY) / 2 + 36} fontFamily={FONT} fontWeight={700} fontSize={24} fill={emit}>
          (더 긴 파장 · 가시광)
        </text>
      </g>
      {/* 방출된 광자 */}
      {emitOn ? (
        <circle cx={ex + 120 + (c - 55) * 14} cy={groundY - 40} r={12} fill={emit} style={{filter: `drop-shadow(0 0 12px ${emit})`}} opacity={1 - (c - 55) / 30} />
      ) : null}
      {/* 전자 */}
      <g transform={`translate(${exX}, ${ey})`}>
        <circle r={20} fill={COLORS.yellow} style={{filter: `drop-shadow(0 0 10px ${COLORS.yellow})`}} />
        <text y={7} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill={COLORS.bg}>
          e⁻
        </text>
      </g>
    </g>
  );
};
