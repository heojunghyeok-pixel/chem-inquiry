import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BoltIcon} from '../components/BlueberryBattery';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('future');
const VIALS_AT = 150;

const WINDOW_COLORS = ['#7c3aed', '#db2777', '#e11d48', '#2563eb', '#a855f7', '#f472b6'];

const VIALS = [
  {name: '블루베리', color: '#4c1d95'},
  {name: '히비스커스', color: '#9f1239'},
  {name: '적양배추', color: '#6d28d9'},
];

/** 바이알 */
const Vial: React.FC<{color: string; name: string}> = ({color, name}) => (
  <g>
    <rect x={-50} y={-140} width={100} height={36} rx={8} fill={COLORS.slate} />
    <rect x={-60} y={-104} width={120} height={230} rx={22} fill="#ffffff" opacity={0.12} stroke={COLORS.white} strokeWidth={5} />
    <rect x={-52} y={-40} width={104} height={158} rx={18} fill={color} />
    <rect x={-40} y={-90} width={12} height={180} rx={6} fill="#ffffff" opacity={0.35} />
    <text y={180} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={COLORS.white}>
      {name}
    </text>
  </g>
);

/** Scene 6: 건물 일체형 창문 전지 & 천연 염료 확장 */
export const Scene6FutureVision: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bIn = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 100}});
  const shrink = interpolate(frame, [VIALS_AT - 20, VIALS_AT], [1, 0.62], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shiftY = interpolate(frame, [VIALS_AT - 20, VIALS_AT], [0, -230], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 태양 */}
          <circle cx={900} cy={520} r={70} fill={COLORS.yellow} opacity={0.9 * bIn} />
          <circle cx={900} cy={520} r={110 + Math.sin(frame * 0.1) * 10} fill={COLORS.yellow} opacity={0.15 * bIn} />

          {/* 웨어러블 (손목 밴드형 셀) */}
          <g transform={`translate(190, 540) scale(${bIn}) rotate(${Math.sin(frame * 0.08) * 6})`}>
            <rect x={-34} y={-110} width={68} height={220} rx={30} fill="#1e293b" stroke={COLORS.slate} strokeWidth={4} />
            <rect x={-60} y={-55} width={120} height={110} rx={22} fill={COLORS.dye} stroke={COLORS.neonPurple} strokeWidth={5} />
            <BoltIcon size={0.45} />
            <text y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.neonBlue}>
              웨어러블
            </text>
          </g>

          {/* 빌딩 */}
          <g transform={`translate(540, ${1550 + shiftY}) scale(${shrink}) translate(0, ${(1 - bIn) * 900})`}>
            <rect x={-280} y={-900} width={560} height={900} fill="#111a3a" stroke={COLORS.panelLine} strokeWidth={6} />
            <rect x={-60} y={-960} width={120} height={60} fill="#111a3a" stroke={COLORS.panelLine} strokeWidth={6} />
            {Array.from({length: 7}).map((_, r) =>
              Array.from({length: 4}).map((__, c) => {
                const i = r * 4 + c;
                const lit = 0.55 + 0.35 * Math.sin(frame * 0.12 + random(`w${i}`) * 6);
                return (
                  <rect
                    key={i}
                    x={-240 + c * 125}
                    y={-860 + r * 120}
                    width={100}
                    height={90}
                    rx={6}
                    fill={WINDOW_COLORS[i % WINDOW_COLORS.length]}
                    opacity={lit * bIn}
                  />
                );
              }),
            )}
            {/* 창문 → 전력선 */}
            <path d="M 280 -450 H 380 V 0" stroke={COLORS.yellow} strokeWidth={10} fill="none" />
            {Array.from({length: 4}).map((_, i) => {
              const k = ((frame * 0.03 + i / 4) % 1);
              const y = -450 + k * 450;
              return <circle key={i} cx={k < 0.2 ? 280 + k * 500 : 380} cy={k < 0.2 ? -450 : y} r={14} fill={COLORS.yellow} />;
            })}
            <g transform="translate(380, 60)">
              <circle r={60} fill={COLORS.panel} stroke={COLORS.yellow} strokeWidth={6} />
              <BoltIcon size={0.7} />
            </g>
            <text x={0} y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={COLORS.white}>
              반투명 창문형 태양전지 (BIPV)
            </text>
          </g>

          {/* 천연 염료 바이알 */}
          {VIALS.map((v, i) => {
            const s = spring({frame: frame - VIALS_AT - i * 14, fps, config: {damping: 7, stiffness: 170}});
            return frame >= VIALS_AT + i * 14 ? (
              <g key={v.name} transform={`translate(${220 + i * 320}, ${1530 + Math.sin(frame * 0.12 + i) * 6}) scale(${s})`}>
                <Vial color={v.color} name={v.name} />
              </g>
            ) : null;
          })}
          {frame >= VIALS_AT + 40 ? (
            <text x={540} y={1820} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={COLORS.slate} opacity={interpolate(frame, [VIALS_AT + 40, VIALS_AT + 60], [0, 1], {extrapolateRight: 'clamp'})}>
              모두 안토시아닌 계열 천연 색소 → 다양한 염료로 확장
            </text>
          ) : null}
        </svg>
      </AbsoluteFill>

      <Headline lines={['창문형 발전부터', '친환경 웨어러블까지']} delay={6} top={170} size={76} accent={COLORS.neonBlue} />
    </SceneFrame>
  );
};
