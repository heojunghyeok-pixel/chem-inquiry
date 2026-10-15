import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {EnergyLevel} from '../components/EnergyLevel';
import {FluorescentVial} from '../components/FluorescentVial';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {COLORS, MONO, sceneDuration, VIAL_GLOWS} from '../constants';

const DURATION = sceneDuration('glow');
const BLACKOUT = 30;
const UV_ON = 50;
const GLOW_AT = 75;
const DIAGRAM_AT = 190;

/** Scene 4: 암전 → 365 nm UV → 바이알 형광 → 에너지 준위 */
export const Scene4DarkroomGlow: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const dark = interpolate(frame, [0, BLACKOUT], [0, 1], {extrapolateRight: 'clamp'});
  const uv = interpolate(frame, [UV_ON, UV_ON + 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flicker = frame > UV_ON && frame < UV_ON + 10 ? (frame % 3 === 0 ? 0.3 : 1) : 1;
  const diagramIn = spring({frame: frame - DIAGRAM_AT, fps, config: {damping: 12, stiffness: 120}});
  const emitColor = VIAL_GLOWS[Math.floor(frame / 90) % VIAL_GLOWS.length].color;

  return (
    <SceneFrame duration={DURATION} grid={false} background={COLORS.bgDeep}>
      {/* 암전 전 잔상 배경 */}
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 35%, #0f1d44 0%, ${COLORS.bg} 60%)`, opacity: 1 - dark}} />
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <defs>
            <linearGradient id="uvBeam" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={COLORS.uv} stopOpacity={0.55} />
              <stop offset="100%" stopColor={COLORS.uv} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          {/* UV 램프 */}
          <g transform="translate(540, 470)">
            <rect x={-200} y={-40} width={400} height={60} rx={16} fill="#1e1b4b" stroke={COLORS.uv} strokeWidth={4} />
            <rect x={-180} y={14} width={360} height={14} rx={7} fill={COLORS.uv} opacity={uv * flicker} style={{filter: `drop-shadow(0 0 20px ${COLORS.uv})`}} />
            <text x={230} y={10} fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.uv} opacity={uv}>
              365 nm
            </text>
          </g>
          <path d="M 340 498 L 880 498 L 1060 1160 L 20 1160 Z" fill="url(#uvBeam)" opacity={uv * flicker} />

          {/* 바이알 6개 (2줄) */}
          {VIAL_GLOWS.map((v, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const g = spring({frame: frame - GLOW_AT - i * 10, fps, config: {damping: 14, stiffness: 90}});
            const pulse = 0.88 + 0.12 * Math.sin(frame * 0.12 + i);
            return (
              <g key={v.label} transform={`translate(${240 + col * 300}, ${row === 0 ? 800 : 1140})`}>
                <FluorescentVial color={v.color} glow={uv * g * pulse} label={v.label} w={110} h={200} />
              </g>
            );
          })}

          {/* 에너지 준위 */}
          <g transform={`translate(90, ${1300 + (1 - diagramIn) * 700})`} opacity={diagramIn}>
            <EnergyLevel t={frame - DIAGRAM_AT} emit={emitColor} w={900} h={460} />
          </g>
        </svg>
      </AbsoluteFill>

      <Headline lines={['암실에서 터지는 네온 형광!', '이것이 바로 양자 가둠 효과']} delay={6} top={170} size={62} accent={COLORS.cyan} />
      <Subtitle text="※ CQD 발광은 양자 가둠 + 표면 상태가 함께 작용 (연구 중)" delay={DIAGRAM_AT + 60} bottom={60} />
    </SceneFrame>
  );
};
