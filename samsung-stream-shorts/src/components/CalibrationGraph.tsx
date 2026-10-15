import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FIT, FONT, MONO, STANDARDS} from '../constants';

/**
 * 표준곡선 y = ax + b 라인 차트 (SVG <g>).
 * - pointsDelay: 표준용액 점이 찍히기 시작하는 프레임 (점마다 6프레임 간격)
 * - lineProgress: 0~1 회귀선 그리기 진행도
 * - sample: 시료 흡광도 투영 {a, c, progress(0~1)}
 */
export const CalibrationGraph: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  pointsDelay: number;
  lineProgress: number;
  sample?: {a: number; c: number; progress: number};
  xMax?: number;
  yMax?: number;
}> = ({x, y, w, h, pointsDelay, lineProgress, sample, xMax = 1.4, yMax = 0.9}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const px = (c: number) => x + (c / xMax) * w;
  const py = (a: number) => y + h - (a / yMax) * h;

  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4];
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8];

  // 회귀선 (0 ~ xMax 구간)
  const lx0 = px(0);
  const ly0 = py(FIT.b);
  const lx1 = px(xMax);
  const ly1 = py(FIT.a * xMax + FIT.b);

  // 시료 투영: y축 → 회귀선 → x축
  const sp = sample?.progress ?? 0;
  const hPart = interpolate(sp, [0, 0.5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const vPart = interpolate(sp, [0.5, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <g>
      {/* 격자 */}
      {yTicks.map((t) => (
        <g key={`y${t}`}>
          <line x1={x} y1={py(t)} x2={x + w} y2={py(t)} stroke={COLORS.panelLine} strokeWidth={2} />
          <text x={x - 16} y={py(t) + 9} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={24} fill={COLORS.slate}>
            {t.toFixed(1)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={`x${t}`} x={px(t)} y={y + h + 40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={24} fill={COLORS.slate}>
          {t.toFixed(1)}
        </text>
      ))}
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={COLORS.white} strokeWidth={4} />
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={COLORS.white} strokeWidth={4} />
      <text x={x + w / 2} y={y + h + 90} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={COLORS.white}>
        인산염 농도 (mg P/L)
      </text>
      <text
        x={x - 90}
        y={y + h / 2}
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight={700}
        fontSize={30}
        fill={COLORS.white}
        transform={`rotate(-90 ${x - 90} ${y + h / 2})`}
      >
        흡광도 A (880 nm)
      </text>

      {/* 회귀선 */}
      <line
        x1={lx0}
        y1={ly0}
        x2={lx0 + (lx1 - lx0) * lineProgress}
        y2={ly0 + (ly1 - ly0) * lineProgress}
        stroke={COLORS.cyan}
        strokeWidth={6}
        strokeLinecap="round"
        style={{filter: `drop-shadow(0 0 8px ${COLORS.cyan})`}}
      />

      {/* 표준용액 점 */}
      {STANDARDS.map((p, i) => {
        const s = spring({frame: frame - pointsDelay - i * 6, fps, config: {damping: 7, stiffness: 220}});
        return (
          <g key={p.c} transform={`translate(${px(p.c)}, ${py(p.a)}) scale(${s})`}>
            <circle r={16} fill={COLORS.bg} stroke={COLORS.white} strokeWidth={5} />
            <circle r={7} fill={COLORS.white} />
          </g>
        );
      })}

      {/* 시료 투영 */}
      {sample && sp > 0 ? (
        <g>
          <line
            x1={x}
            y1={py(sample.a)}
            x2={x + (px(sample.c) - x) * hPart}
            y2={py(sample.a)}
            stroke={COLORS.amber}
            strokeWidth={4}
            strokeDasharray="12 8"
          />
          <line
            x1={px(sample.c)}
            y1={py(sample.a)}
            x2={px(sample.c)}
            y2={py(sample.a) + (y + h - py(sample.a)) * vPart}
            stroke={COLORS.amber}
            strokeWidth={4}
            strokeDasharray="12 8"
            opacity={vPart > 0 ? 1 : 0}
          />
          <circle cx={x} cy={py(sample.a)} r={10} fill={COLORS.amber} />
          <text x={x + 20} y={py(sample.a) - 18} fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.amber}>
            A = {sample.a.toFixed(3)}
          </text>
          {hPart >= 1 ? <circle cx={px(sample.c)} cy={py(sample.a)} r={14} fill={COLORS.amber} /> : null}
          {vPart >= 1 ? (
            <g>
              <circle cx={px(sample.c)} cy={y + h} r={12} fill={COLORS.amber} />
              <rect x={px(sample.c) - 70} y={y + h - 76} width={140} height={50} rx={10} fill={COLORS.amber} />
              <text x={px(sample.c)} y={y + h - 40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.bg}>
                {sample.c.toFixed(2)}
              </text>
            </g>
          ) : null}
        </g>
      ) : null}
    </g>
  );
};
