import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {COLORS, FONT, MONO} from '../constants';

/**
 * DSSC 단면 + 외부 회로 전자 순환 루프 (SVG <g>).
 * 경로: 염료 → TiO₂ 징검다리 → FTO(음극) → 도선 → 모터 → 도선 → 흑연(양극)
 *       → [I₃⁻ + 2e⁻ → 3I⁻ 환원] → I⁻가 전해질을 건너 염료 재생 → 반복
 * - active: 0~1 전류 세기 (전자 개수·모터 회전에 반영)
 */

// 층 구조 (y)
export const LAYER = {
  x0: 150,
  x1: 930,
  glassTop: 560,
  fto1: 600,
  tio2Top: 620,
  tio2Bottom: 780,
  electrolyteBottom: 940,
  graphite: 960,
  fto2: 1000,
};
const MOTOR = {x: 540, y: 1330};

type Pt = [number, number];

// 전자가 도선으로 이동하는 경로
const WIRE: Pt[] = [
  [540, 700], // 염료(들뜬 상태)
  [470, 670],
  [400, 640],
  [330, 612], // TiO₂ 징검다리 → FTO
  [150, 612],
  [70, 612],
  [70, MOTOR.y],
  [MOTOR.x - 70, MOTOR.y],
  [MOTOR.x + 70, MOTOR.y],
  [1010, MOTOR.y],
  [1010, 980],
  [930, 980],
  [620, 955], // 흑연 촉매 표면
];
// 이온(I⁻)이 전해질을 건너 염료로 돌아가는 경로
const ION: Pt[] = [
  [620, 930],
  [600, 860],
  [560, 790],
];

const segLengths = (pts: Pt[]) => pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
const WIRE_LEN = segLengths(WIRE);
const WIRE_TOTAL = WIRE_LEN.reduce((a, b) => a + b, 0);
const ION_LEN = segLengths(ION);
const ION_TOTAL = ION_LEN.reduce((a, b) => a + b, 0);

const along = (pts: Pt[], lens: number[], d: number): Pt => {
  let r = d;
  for (let i = 0; i < lens.length; i++) {
    if (r <= lens[i]) {
      const k = r / lens[i];
      return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
    }
    r -= lens[i];
  }
  return pts[pts.length - 1];
};

const polyline = (pts: Pt[]) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

/** 프로펠러 모터 */
export const MotorFan: React.FC<{angle: number; scale?: number}> = ({angle, scale = 1}) => (
  <g transform={`scale(${scale})`}>
    <rect x={-60} y={-40} width={120} height={80} rx={18} fill="#475569" stroke={COLORS.slate} strokeWidth={4} />
    <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.white}>
      M
    </text>
    <rect x={-6} y={-90} width={12} height={50} fill={COLORS.slate} />
    <g transform={`translate(0, -96) rotate(${angle})`}>
      {[0, 120, 240].map((a) => (
        <ellipse key={a} cx={0} cy={-60} rx={20} ry={58} fill={COLORS.neonBlue} opacity={0.85} transform={`rotate(${a})`} />
      ))}
      <circle r={14} fill={COLORS.white} />
    </g>
  </g>
);

export const ElectronLoop: React.FC<{active: number; showLabels?: boolean}> = ({active, showLabels = true}) => {
  const frame = useCurrentFrame();
  const W = LAYER.x1 - LAYER.x0;
  const N = 14;
  const speed = 9;
  const cycle = WIRE_TOTAL + ION_TOTAL;

  return (
    <g>
      {/* 햇빛 */}
      {Array.from({length: 7}).map((_, i) => {
        const x = LAYER.x0 + 60 + i * 110;
        const k = ((frame * 0.04 + i * 0.17) % 1);
        return (
          <g key={i} opacity={active}>
            <line x1={x - 40} y1={380} x2={x} y2={LAYER.glassTop} stroke={COLORS.yellow} strokeWidth={6} opacity={0.35} />
            <circle cx={x - 40 + 40 * k} cy={380 + (LAYER.glassTop - 380) * k} r={9} fill={COLORS.yellow} />
          </g>
        );
      })}

      {/* 층 */}
      <rect x={LAYER.x0} y={LAYER.glassTop} width={W} height={LAYER.fto1 - LAYER.glassTop + 20} fill={COLORS.fto} opacity={0.3} stroke={COLORS.fto} strokeWidth={3} />
      <rect x={LAYER.x0} y={LAYER.tio2Bottom} width={W} height={LAYER.electrolyteBottom - LAYER.tio2Bottom + 20} fill={COLORS.iodine} opacity={0.32} />
      <rect x={LAYER.x0} y={LAYER.graphite - 10} width={W} height={30} fill="#111827" stroke="#4b5563" strokeWidth={2} />
      <rect x={LAYER.x0} y={LAYER.fto2 - 20} width={W} height={60} fill={COLORS.fto} opacity={0.3} stroke={COLORS.fto} strokeWidth={3} />

      {/* TiO₂ 나노 입자 + 염료 */}
      {Array.from({length: 4}).map((_, r) =>
        Array.from({length: 13}).map((__, c) => {
          const cx = LAYER.x0 + 30 + c * 60 + (r % 2) * 30;
          const cy = LAYER.tio2Top + 25 + r * 42;
          return (
            <g key={`${r}-${c}`}>
              <circle cx={cx} cy={cy} r={22} fill={COLORS.tio2} />
              <circle cx={cx + 16} cy={cy + 14} r={9} fill={COLORS.dye} stroke={COLORS.neonPurple} strokeWidth={2} />
            </g>
          );
        }),
      )}

      {/* 도선 */}
      <path d={polyline(WIRE.slice(3, 12))} stroke={COLORS.slate} strokeWidth={10} fill="none" strokeLinejoin="round" />
      <g transform={`translate(${MOTOR.x}, ${MOTOR.y})`}>
        <MotorFan angle={frame * 28 * active} />
      </g>

      {/* 전해질 이온 (배경 떠다니기) */}
      {Array.from({length: 10}).map((_, i) => {
        const x = LAYER.x0 + 40 + random(`ix${i}`) * (W - 80);
        const y = LAYER.tio2Bottom + 40 + random(`iy${i}`) * 110 + Math.sin(frame * 0.06 + i) * 10;
        const tri = i % 3 === 0;
        return (
          <text key={i} x={x} y={y} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={tri ? '#fbbf24' : '#fde68a'} opacity={0.7}>
            {tri ? 'I₃⁻' : 'I⁻'}
          </text>
        );
      })}

      {/* 전자 & 이온 순환 */}
      {Array.from({length: N}).map((_, i) => {
        if (i / N > active) return null;
        const d = (frame * speed + (i * cycle) / N) % cycle;
        if (d < WIRE_TOTAL) {
          const [x, y] = along(WIRE, WIRE_LEN, d);
          return (
            <g key={i} transform={`translate(${x}, ${y})`}>
              <circle r={16} fill={COLORS.yellow} />
              <text y={7} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={18} fill={COLORS.bg}>
                e⁻
              </text>
            </g>
          );
        }
        const [x, y] = along(ION, ION_LEN, d - WIRE_TOTAL);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill="#fde68a">
            I⁻
          </text>
        );
      })}

      {/* 흑연 촉매 반응 하이라이트 */}
      <circle cx={620} cy={955} r={40 + Math.sin(frame * 0.3) * 6} fill="none" stroke={COLORS.lime} strokeWidth={5} opacity={active * 0.8} />

      {showLabels ? (
        <g fontFamily={FONT} fontWeight={700} fontSize={26}>
          <text x={LAYER.x1 - 10} y={LAYER.glassTop + 32} textAnchor="end" fill={COLORS.fto}>
            FTO 유리 (−극)
          </text>
          <text x={LAYER.x1 - 10} y={LAYER.tio2Bottom - 4} textAnchor="end" fill={COLORS.white}>
            TiO₂ + 염료
          </text>
          <text x={LAYER.x1 - 10} y={LAYER.electrolyteBottom - 6} textAnchor="end" fill="#fbbf24">
            요오드 전해질
          </text>
          <text x={LAYER.x1 - 10} y={LAYER.fto2 + 30} textAnchor="end" fill={COLORS.slate}>
            흑연 + FTO 유리 (+극)
          </text>
        </g>
      ) : null}
      <text x={MOTOR.x} y={MOTOR.y + 90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={COLORS.neonBlue} opacity={interpolate(active, [0.3, 1], [0, 1], {extrapolateLeft: 'clamp'})}>
        모터 회전!
      </text>
    </g>
  );
};
