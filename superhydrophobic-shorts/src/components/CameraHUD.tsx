import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, MONO} from '../constants';

/**
 * 스마트폰 뷰파인더 스타일 AI 비전 HUD (SVG <g>).
 * 코너 가이드, 3x3 그리드, 스캔 라인, REC 표시, 상태 텍스트.
 */
export const CameraHUD: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay?: number;
  scanning?: boolean;
  status?: string;
}> = ({x, y, w, h, delay = 0, scanning = true, status = 'AI VISION · CONTACT ANGLE'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - delay;
  const corners = spring({frame: t, fps, config: {damping: 11, stiffness: 140}});
  const grid = interpolate(t, [10, 30], [0, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // 코너가 바깥에서 안쪽으로 모여드는 효과
  const inset = interpolate(corners, [0, 1], [-60, 0]);
  const L = 90;
  const cornerPaths = [
    `M ${x - inset} ${y - inset + L} V ${y - inset} H ${x - inset + L}`,
    `M ${x + w + inset - L} ${y - inset} H ${x + w + inset} V ${y - inset + L}`,
    `M ${x + w + inset} ${y + h + inset - L} V ${y + h + inset} H ${x + w + inset - L}`,
    `M ${x - inset + L} ${y + h + inset} H ${x - inset} V ${y + h + inset - L}`,
  ];

  const scanY = y + ((t * 9) % h);
  const recOn = Math.floor(t / 15) % 2 === 0;

  return (
    <g opacity={Math.min(1, corners * 1.4)}>
      {/* 그리드 (삼등분선) */}
      <g stroke={COLORS.cyan} strokeWidth={2} opacity={grid}>
        {[1, 2].map((i) => (
          <React.Fragment key={i}>
            <line x1={x + (w * i) / 3} y1={y} x2={x + (w * i) / 3} y2={y + h} />
            <line x1={x} y1={y + (h * i) / 3} x2={x + w} y2={y + (h * i) / 3} />
          </React.Fragment>
        ))}
      </g>
      {/* 중앙 십자 */}
      <g stroke={COLORS.cyan} strokeWidth={3} opacity={grid * 2}>
        <line x1={x + w / 2 - 20} y1={y + h / 2} x2={x + w / 2 + 20} y2={y + h / 2} />
        <line x1={x + w / 2} y1={y + h / 2 - 20} x2={x + w / 2} y2={y + h / 2 + 20} />
      </g>
      {/* 코너 가이드 */}
      {cornerPaths.map((d) => (
        <path key={d} d={d} stroke={COLORS.white} strokeWidth={8} fill="none" strokeLinecap="round" />
      ))}
      {/* 스캔 라인 */}
      {scanning && t > 0 ? (
        <g>
          <rect x={x} y={scanY - 40} width={w} height={40} fill={COLORS.cyan} opacity={0.12} />
          <line x1={x} y1={scanY} x2={x + w} y2={scanY} stroke={COLORS.cyan} strokeWidth={3} opacity={0.8} />
        </g>
      ) : null}
      {/* 상태 표시 */}
      <circle cx={x + 40} cy={y + 44} r={12} fill={COLORS.red} opacity={recOn ? 1 : 0.25} />
      <text x={x + 64} y={y + 54} fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.white}>
        REC
      </text>
      <text x={x + w - 30} y={y + 54} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={26} fill={COLORS.cyan}>
        {status}
      </text>
      <text x={x + 30} y={y + h - 26} fontFamily={MONO} fontWeight={700} fontSize={24} fill={COLORS.slate}>
        ISO 200 · 1/120 · 4K 30fps
      </text>
    </g>
  );
};
