import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneFrame} from '../components/Typography';
import {CAMP_INFO, COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('outro');
const HIGH_FIVE = 30;

/** 실험복 학생 (팔 하나 들어 하이파이브) */
const Student: React.FC<{hair: string; armAngle: number; tablet?: boolean}> = ({hair, armAngle, tablet}) => (
  <g>
    <path d="M -110 260 Q -110 120 -45 105 L 45 105 Q 110 120 110 260 Z" fill={COLORS.white} />
    <path d="M -45 105 L -8 170 L -22 105 Z" fill="#cbd5e1" />
    <path d="M 45 105 L 8 170 L 22 105 Z" fill="#cbd5e1" />
    <g transform={`rotate(${armAngle} 70 130)`}>
      <rect x={56} y={130} width={32} height={120} rx={16} fill={COLORS.white} />
      <circle cx={72} cy={258} r={22} fill="#f2c9a0" />
    </g>
    {tablet ? (
      <g transform="translate(-95, 175) rotate(-10)">
        <rect x={-70} y={-50} width={140} height={100} rx={12} fill={COLORS.bgDeep} stroke={COLORS.slate} strokeWidth={4} />
        <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={COLORS.green}>
          +37°
        </text>
      </g>
    ) : null}
    <circle cx={0} cy={30} r={70} fill="#f2c9a0" />
    <path d="M -72 22 Q -66 -50 0 -46 Q 66 -50 72 22 Q 50 -8 0 -10 Q -50 -8 -72 22 Z" fill={hair} />
    <rect x={-60} y={14} width={120} height={40} rx={18} fill={COLORS.cyan} opacity={0.85} />
    <path d="M -22 74 Q 0 96 22 74" stroke="#7c2d12" strokeWidth={6} fill="#7c2d12" />
  </g>
);

/** 거울 대칭 분자 아이콘 (작게) */
const MirrorIcon: React.FC = () => (
  <g>
    <line x1={0} y1={-50} x2={0} y2={50} stroke={COLORS.cyan} strokeWidth={4} strokeDasharray="8 6" />
    {[-1, 1].map((s) => (
      <g key={s} transform={`scale(${s}, 1)`}>
        <line x1={-30} y1={0} x2={-60} y2={-30} stroke={COLORS.white} strokeWidth={5} />
        <line x1={-30} y1={0} x2={-60} y2={30} stroke={COLORS.white} strokeWidth={5} />
        <line x1={-30} y1={0} x2={-72} y2={0} stroke={COLORS.white} strokeWidth={5} />
        <circle cx={-30} cy={0} r={12} fill={COLORS.pink} />
      </g>
    ))}
  </g>
);

/** Scene 6: 하이파이브 + 캠프 안내 */
export const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sIn = (i: number) => spring({frame: frame - 4 - i * 6, fps, config: {damping: 9, stiffness: 140}});
  const reach = spring({frame: frame - HIGH_FIVE, fps, config: {damping: 7, stiffness: 200}});
  const slap = interpolate(frame, [HIGH_FIVE + 6, HIGH_FIVE + 10, HIGH_FIVE + 24], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cardIn = spring({frame: frame - 50, fps, config: {damping: 11, stiffness: 130}});
  const icons = spring({frame: frame - 80, fps, config: {damping: 6, stiffness: 170}});
  const hop = (i: number) => -Math.abs(Math.sin(frame * 0.2 + i)) * 24;

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <g transform={`translate(380, ${620 + (1 - sIn(0)) * 900})`}>
            <Student hair="#1f2937" armAngle={interpolate(reach, [0, 1], [-20, -150])} tablet />
          </g>
          <g transform={`translate(700, ${620 + (1 - sIn(1)) * 900}) scale(-1, 1)`}>
            <Student hair="#78350f" armAngle={interpolate(reach, [0, 1], [-20, -150])} />
          </g>
          {/* 하이파이브 이펙트 */}
          <g transform="translate(540, 520)" opacity={slap}>
            {Array.from({length: 8}).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 40} y1={Math.sin(a) * 40} x2={Math.cos(a) * (70 + slap * 40)} y2={Math.sin(a) * (70 + slap * 40)} stroke={COLORS.amber} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
          {/* 바운스 거울 분자 아이콘 */}
          {[200, 540, 880].map((x, i) => (
            <g key={x} transform={`translate(${x}, ${1650 + hop(i)}) scale(${icons})`}>
              <MirrorIcon />
            </g>
          ))}
        </svg>
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 1010,
          padding: '34px 36px',
          borderRadius: 30,
          background: 'rgba(18,24,66,0.95)',
          border: `4px solid ${COLORS.violet}`,
          boxShadow: `0 0 40px ${COLORS.violet}55`,
          fontFamily: FONT,
          textAlign: 'center',
          transform: `translateY(${(1 - cardIn) * 400}px)`,
          opacity: Math.min(1, cardIn * 1.5),
        }}
      >
        <div style={{fontSize: 48, fontWeight: 900, color: COLORS.violet}}>화학 AI 융합 캠프</div>
        <div style={{fontSize: 30, fontWeight: 700, color: COLORS.white, marginTop: 10}}>효모 비대칭 합성 · 편광계 계측 · AI 분자 도킹</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 18, fontSize: 30, fontWeight: 900}}>
          <span style={{color: COLORS.bg, background: COLORS.green, padding: '6px 16px', borderRadius: 12}}>{CAMP_INFO.schedule}</span>
          <span style={{color: COLORS.bg, background: COLORS.cyan, padding: '6px 16px', borderRadius: 12}}>{CAMP_INFO.place}</span>
        </div>
        <div style={{fontSize: 46, fontWeight: 900, color: COLORS.amber, marginTop: 20}}>캠프에서 만나요!</div>
      </div>

      <Headline lines={['화학 AI 융합 캠프:', '지금 도전하세요!']} delay={4} top={170} size={74} accent={COLORS.violet} />
    </SceneFrame>
  );
};
