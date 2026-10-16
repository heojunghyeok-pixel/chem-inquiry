import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {YeastEnzymeReaction} from '../components/YeastEnzymeReaction';
import {Chip, Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('yeast');
const ENZYME_AT = 200;

/** 발효 비커 */
const FermentBeaker: React.FC<{t: number}> = ({t}) => {
  const pour = interpolate(t, [20, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const foam = interpolate(t, [70, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <g>
      {/* 효모·설탕 투입 */}
      {[
        {x: -110, color: COLORS.yeast, label: '빵 효모'},
        {x: 110, color: '#f8fafc', label: '설탕'},
      ].map((s) => (
        <g key={s.label} opacity={1 - interpolate(t, [80, 100], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
          <text x={s.x} y={-380} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={s.color}>
            {s.label}
          </text>
          {Array.from({length: 14}).map((_, i) => {
            const k = ((t * 0.04 + random(`g${s.label}${i}`)) % 1) * pour;
            return <circle key={i} cx={s.x + (random(`gx${s.label}${i}`) - 0.5) * 40} cy={-340 + k * 300} r={7} fill={s.color} opacity={pour > 0 && pour < 1 ? 1 : 0} />;
          })}
        </g>
      ))}
      {/* 비커 */}
      <rect x={-230} y={-40 - foam * 60} width={460} height={340 + foam * 60} fill="#f5deb3" opacity={0.35} />
      <ellipse cx={0} cy={-40 - foam * 60} rx={230} ry={20} fill="#fff7e6" opacity={0.6} />
      {/* 거품 */}
      {Array.from({length: 26}).map((_, i) => {
        const k = ((t * 0.02 + random(`b${i}`)) % 1);
        const x = (random(`bx${i}`) - 0.5) * 420;
        const y = 280 - k * (300 + foam * 60);
        return <circle key={i} cx={x} cy={y} r={(6 + random(`br${i}`) * 10) * foam} fill="none" stroke="#fff7e6" strokeWidth={3} opacity={(1 - k) * foam} />;
      })}
      <path d="M -240 -200 V 310 H 240 V -200" stroke={COLORS.white} strokeWidth={8} fill="none" opacity={0.85} />
      <text y={380} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={COLORS.white} opacity={foam}>
        보글보글 발효 중 (CO₂ 거품)
      </text>
    </g>
  );
};

/** Scene 3: 발효 → 효소 활성 자리 → 한쪽 면 환원 → (S)형 85% ee */
export const Scene3YeastCatalyst: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const bIn = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 110}});
  const bOut = interpolate(frame, [ENZYME_AT - 20, ENZYME_AT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {frame < ENZYME_AT ? (
            <g transform={`translate(540, ${1000 + (1 - bIn) * 700}) scale(${1 - bOut * 0.3})`} opacity={1 - bOut}>
              <FermentBeaker t={frame} />
            </g>
          ) : (
            <g transform="translate(540, 900)">
              <YeastEnzymeReaction t={frame - ENZYME_AT} />
            </g>
          )}
        </svg>
      </AbsoluteFill>
      {frame >= ENZYME_AT ? <Chip text="에틸 아세토아세테이트 (평면형 케톤)" x={540} y={470} delay={ENZYME_AT + 40} color={COLORS.cyan} size={30} /> : null}
      <Headline lines={['식탁 위 빵 효모가 해내는', '첨단 생체 촉매 반응!']} delay={6} top={170} size={66} accent={COLORS.amber} />
    </SceneFrame>
  );
};
