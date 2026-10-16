import React from 'react';
import {Easing, interpolate} from 'remotion';
import {COLORS, FONT, MONO} from '../constants';

/**
 * 편광계 광학 시뮬레이션 (SVG <g>, 원점 = 화면 좌상단 기준 절대좌표).
 * 589 nm 광원 → 편광판(세로 진동만 통과) → 카이랄 용액 셀(진동면이 시계 방향으로 회전) → 검광판·검출기
 * 위쪽 원(정면에서 본 진동 방향)으로 진동면 회전을 보여준다.
 * - t: 로컬 프레임 / visAngle: 화면에 그릴 회전각(과장값, deg)
 */
export const POLAR_TIMELINE = {lampOn: 0, toPolarizer: 20, toCell: 60, cellEnd: 160, analyzer: 175};
const T = POLAR_TIMELINE;

const Y = 1020; // 빔 높이
const X = {lamp: 110, polarizer: 300, cellIn: 420, cellOut: 720, analyzer: 830, detector: 960};
const VIEW_Y = Y - 230; // 진동 방향 원 표시 높이

export const PolarimeterLight: React.FC<{t: number; visAngle: number}> = ({t, visAngle}) => {
  const lamp = interpolate(t, [T.lampOn, T.lampOn + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // 빔 앞쪽 끝 위치
  const head = interpolate(t, [T.toPolarizer, T.toCell, T.cellEnd, T.analyzer + 15], [X.lamp, X.cellIn, X.cellOut, X.detector], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const analyzer = interpolate(t, [T.analyzer + 15, T.analyzer + 55], [0, visAngle], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.4)),
  });

  // x 위치에서의 진동면 각도 (셀 안에서 선형 증가)
  const angleAt = (x: number) => (x <= X.cellIn ? 0 : x >= X.cellOut ? visAngle : ((x - X.cellIn) / (X.cellOut - X.cellIn)) * visAngle);

  // 진동 방향 관측 지점
  const stations = [
    {x: 205, kind: 'unpolarized' as const, label: '편광 전'},
    {x: 360, kind: 'line' as const, label: '편광판 통과'},
    {x: 520, kind: 'line' as const, label: ''},
    {x: 620, kind: 'line' as const, label: ''},
    {x: 775, kind: 'line' as const, label: '회전 후'},
  ];

  // 빔 위 진동 파형 (세로 진폭 = cos(각도), 각도 증가 시 납작해지며 회전하는 느낌)
  let wave = '';
  const x0 = X.polarizer;
  for (let x = x0; x <= Math.min(head, X.detector); x += 4) {
    const a = (angleAt(x) * Math.PI) / 180;
    const ph = (x - x0) / 22 - t * 0.35;
    const amp = 36 * Math.cos(a);
    const yy = Y + Math.sin(ph) * amp;
    const xx = x + Math.sin(ph) * 36 * Math.sin(a) * 0.35; // 기울어진 진동면의 원근 표현
    wave += `${wave ? 'L' : 'M'} ${xx} ${yy} `;
  }

  return (
    <g>
      <defs>
        <filter id="beamGlow" x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      {/* 광학대 */}
      <rect x={60} y={Y + 120} width={960} height={20} rx={10} fill={COLORS.slateDark} />

      {/* 빔 */}
      {head > X.lamp ? (
        <g>
          <rect x={X.lamp} y={Y - 14} width={head - X.lamp} height={28} fill={COLORS.sodium} opacity={0.5} filter="url(#beamGlow)" />
          <rect x={X.lamp} y={Y - 4} width={head - X.lamp} height={8} fill={COLORS.sodium} opacity={0.9} />
          {head > X.polarizer ? <path d={wave} stroke={COLORS.sodium} strokeWidth={5} fill="none" opacity={0.9} /> : null}
        </g>
      ) : null}

      {/* 광원 */}
      <g transform={`translate(${X.lamp}, ${Y})`}>
        <rect x={-60} y={-70} width={90} height={140} rx={16} fill={COLORS.panel} stroke={COLORS.slate} strokeWidth={4} />
        <circle r={28} fill={COLORS.sodium} opacity={0.25 + 0.75 * lamp} style={{filter: lamp > 0.5 ? `drop-shadow(0 0 20px ${COLORS.sodium})` : undefined}} />
        <text x={-15} y={110} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={24} fill={COLORS.sodium}>
          589 nm
        </text>
      </g>
      {/* 편광판 */}
      <g transform={`translate(${X.polarizer}, ${Y})`}>
        <ellipse rx={18} ry={90} fill={COLORS.cyan} opacity={0.25} stroke={COLORS.cyan} strokeWidth={4} />
        {[-60, -30, 0, 30, 60].map((dy) => (
          <line key={dy} x1={-8} y1={dy - 14} x2={-8} y2={dy + 14} stroke={COLORS.cyan} strokeWidth={3} />
        ))}
        <text y={130} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill={COLORS.cyan}>
          편광판
        </text>
      </g>
      {/* 시료 셀 */}
      <g>
        <rect x={X.cellIn} y={Y - 70} width={X.cellOut - X.cellIn} height={140} rx={24} fill={COLORS.violetDeep} opacity={0.3} stroke={COLORS.violet} strokeWidth={4} />
        {Array.from({length: 10}).map((_, i) => (
          <text
            key={i}
            x={X.cellIn + 20 + ((i * 61) % (X.cellOut - X.cellIn - 40))}
            y={Y - 30 + ((i * 37) % 80) + Math.sin(t * 0.08 + i) * 5}
            fontFamily={FONT}
            fontWeight={900}
            fontSize={22}
            fill={COLORS.pink}
            opacity={0.8}
          >
            (S)
          </text>
        ))}
        <text x={(X.cellIn + X.cellOut) / 2} y={Y + 105} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill={COLORS.violet}>
          효모가 만든 카이랄 용액 (l = 1 dm)
        </text>
      </g>
      {/* 검광판 + 검출기 */}
      <g transform={`translate(${X.analyzer}, ${Y})`}>
        <ellipse rx={18} ry={90} fill={COLORS.green} opacity={0.2} stroke={COLORS.green} strokeWidth={4} />
        <line x1={0} y1={-70} x2={0} y2={70} stroke={COLORS.green} strokeWidth={4} transform={`rotate(${analyzer})`} />
        <text y={130} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill={COLORS.green}>
          검광판
        </text>
      </g>
      <g transform={`translate(${X.detector}, ${Y})`}>
        <rect x={-30} y={-60} width={60} height={120} rx={10} fill={COLORS.panel} stroke={COLORS.slate} strokeWidth={4} />
        <rect x={-30} y={-40} width={10} height={80} fill={COLORS.sodium} opacity={head >= X.detector ? 1 : 0.2} />
      </g>

      {/* 정면에서 본 진동 방향 */}
      {stations.map((s, i) => {
        const reached = head >= s.x;
        const a = angleAt(s.x);
        return (
          <g key={i} transform={`translate(${s.x}, ${VIEW_Y})`} opacity={reached ? 1 : 0.25}>
            <circle r={44} fill={COLORS.panel} stroke={COLORS.panelLine} strokeWidth={3} />
            <line x1={0} y1={-56} x2={0} y2={56} stroke={COLORS.slate} strokeWidth={2} strokeDasharray="4 6" />
            {s.kind === 'unpolarized'
              ? [0, 45, 90, 135].map((r) => (
                  <line key={r} x1={0} y1={-34} x2={0} y2={34} stroke={COLORS.sodium} strokeWidth={5} transform={`rotate(${r + t * 2})`} strokeLinecap="round" />
                ))
              : (
                  <g transform={`rotate(${a})`}>
                    <line x1={0} y1={-34} x2={0} y2={34} stroke={COLORS.sodium} strokeWidth={7} strokeLinecap="round" />
                    <polygon points="0,-42 -9,-28 9,-28" fill={COLORS.sodium} />
                    <polygon points="0,42 -9,28 9,28" fill={COLORS.sodium} />
                  </g>
                )}
            {s.label ? (
              <text y={-62} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill={COLORS.slate}>
                {s.label}
              </text>
            ) : null}
          </g>
        );
      })}
      {/* 회전각 호 */}
      {head >= 775 ? (
        <g transform={`translate(775, ${VIEW_Y})`}>
          <path
            d={`M 0 -58 A 58 58 0 0 1 ${58 * Math.sin((visAngle * Math.PI) / 180)} ${-58 * Math.cos((visAngle * Math.PI) / 180)}`}
            stroke={COLORS.pink}
            strokeWidth={5}
            fill="none"
          />
          <text x={70} y={-50} fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.pink}>
            α ↻
          </text>
        </g>
      ) : null}
    </g>
  );
};
