import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {ElectronLoop} from '../components/ElectronLoop';
import {Chip, Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('electron');
const LIGHT_ON = 50;

const STEPS = [
  {at: 80, color: COLORS.yellow, text: '① 빛 흡수 → 염료가 전자(e⁻) 방출'},
  {at: 160, color: COLORS.neonBlue, text: '② TiO₂ 징검다리 → 외부 회로 → 모터'},
  {at: 250, color: COLORS.lime, text: '③ 흑연 촉매: I₃⁻ + 2e⁻ → 3I⁻ (환원)'},
  {at: 330, color: '#fde68a', text: '④ I⁻가 염료에 전자를 돌려줌 (재생)'},
];

/** Scene 4: 단면 투시도 & 전자 순환 */
export const Scene4ElectronFlow: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const viewIn = spring({frame: frame - 4, fps, config: {damping: 13, stiffness: 110}});
  const active = interpolate(frame, [LIGHT_ON, LIGHT_ON + 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill style={{opacity: viewIn, transform: `scale(${0.9 + viewIn * 0.1})`}}>
        <svg width={1080} height={1920}>
          <text x={540} y={500} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={COLORS.slate}>
            CROSS-SECTION VIEW · 단면 투시도
          </text>
          <ElectronLoop active={active} />
        </svg>
      </AbsoluteFill>

      {/* 단계 설명 */}
      <div style={{position: 'absolute', top: 1470, left: 60, right: 60, display: 'flex', flexDirection: 'column', gap: 14, fontFamily: FONT}}>
        {STEPS.map((s) => {
          const k = spring({frame: frame - s.at, fps, config: {damping: 12, stiffness: 150}});
          return (
            <div
              key={s.text}
              style={{
                fontSize: 34,
                fontWeight: 900,
                color: s.color,
                background: 'rgba(15,22,48,0.9)',
                borderLeft: `8px solid ${s.color}`,
                padding: '10px 20px',
                borderRadius: 10,
                opacity: k,
                transform: `translateX(${(1 - k) * -120}px)`,
              }}
            >
              {s.text}
            </div>
          );
        })}
      </div>
      <Chip text="산화·환원 반응" x={260} y={1180} delay={260} color={COLORS.lime} size={30} />

      <Headline lines={['빛 흡수 → 전자 방출', '→ 흑연 촉매 순환!']} delay={6} top={170} size={70} accent={COLORS.yellow} />
    </SceneFrame>
  );
};
