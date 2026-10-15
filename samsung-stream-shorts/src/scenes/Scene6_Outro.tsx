import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('outro');
const WATER_TOP = 1580;

/** 실험복 + 보안경 학생 일러스트 */
const Student: React.FC<{wave: number}> = ({wave}) => (
  <g>
    {/* 몸통 (실험복) */}
    <path d="M -150 300 Q -150 140 -60 120 L 60 120 Q 150 140 150 300 Z" fill={COLORS.white} />
    <path d="M -10 125 L 0 300 L 10 125" stroke="#cbd5e1" strokeWidth={6} fill="none" />
    <path d="M -60 120 L -10 200 L -30 120 Z" fill="#cbd5e1" />
    <path d="M 60 120 L 10 200 L 30 120 Z" fill="#cbd5e1" />
    <rect x={-50} y={110} width={100} height={30} fill={COLORS.stream} />
    {/* 손 흔드는 팔 + 큐벳 */}
    <g transform={`rotate(${-30 + wave * 20} 120 160)`}>
      <rect x={110} y={20} width={44} height={150} rx={22} fill={COLORS.white} />
      <circle cx={132} cy={14} r={26} fill="#f2c9a0" />
      <rect x={116} y={-60} width={30} height={60} rx={4} fill={COLORS.cobalt} stroke={COLORS.white} strokeWidth={4} />
    </g>
    {/* 머리 */}
    <circle cx={0} cy={40} r={86} fill="#f2c9a0" />
    <path d="M -88 30 Q -80 -60 0 -56 Q 80 -60 88 30 Q 60 -10 0 -12 Q -60 -10 -88 30 Z" fill="#1f2937" />
    {/* 보안경 */}
    <rect x={-74} y={20} width={148} height={50} rx={22} fill={COLORS.cyan} opacity={0.85} />
    <rect x={-64} y={28} width={58} height={34} rx={14} fill={COLORS.bg} opacity={0.6} />
    <rect x={6} y={28} width={58} height={34} rx={14} fill={COLORS.bg} opacity={0.6} />
    <ellipse cx={-48} cy={36} rx={10} ry={5} fill={COLORS.white} opacity={0.8} />
    <path d="M -24 100 Q 0 118 24 100" stroke="#7c2d12" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

/** Scene 6: 캠프 안내 & 엔딩 */
export const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const studentIn = spring({frame: frame - 8, fps, config: {damping: 8, stiffness: 120}});
  const wave = Math.sin(frame * 0.2);
  const clean = interpolate(frame, [10, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const water = interpolateColors(clean, [0, 1], [COLORS.algae, '#1d8fe0']);
  const cardIn = spring({frame: frame - 70, fps, config: {damping: 11, stiffness: 120}});
  const cta = spring({frame: frame - 150, fps, config: {damping: 6, stiffness: 160}});
  const ctaBounce = frame > 175 ? -Math.abs(Math.sin((frame - 175) * 0.18)) * 18 : 0;

  let wavePath = `M 0 ${WATER_TOP}`;
  for (let x = 0; x <= 1080; x += 20) wavePath += ` L ${x} ${WATER_TOP + Math.sin(x / 60 + frame * 0.08) * 12}`;
  wavePath += ' L 1080 1920 L 0 1920 Z';

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 깨끗해진 삼성천 */}
          <path d={wavePath} fill={water} opacity={0.9} />
          {Array.from({length: 12}).map((_, i) => {
            const t = (frame * 0.02 + random(`sp${i}`)) % 1;
            return (
              <g key={i} transform={`translate(${random(`sx${i}`) * 1080}, ${WATER_TOP + 60 + random(`sy${i}`) * 260}) scale(${Math.sin(t * Math.PI) * clean})`}>
                <path d="M 0 -16 L 4 -4 L 16 0 L 4 4 L 0 16 L -4 4 L -16 0 L -4 -4 Z" fill="#ffffff" />
              </g>
            );
          })}
          <text x={540} y={WATER_TOP + 230} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={COLORS.white} opacity={clean}>
            다시 맑아질 삼성천을 위해
          </text>

          {/* 학생 */}
          <g transform={`translate(540, ${interpolate(studentIn, [0, 1], [1300, 600])}) scale(${0.9 + studentIn * 0.1})`}>
            <Student wave={wave} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* 캠프 안내 카드 */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 940,
          padding: '40px 40px 44px',
          borderRadius: 32,
          background: 'rgba(18,29,61,0.95)',
          border: `4px solid ${COLORS.cyan}`,
          boxShadow: `0 0 50px ${COLORS.cyan}44`,
          fontFamily: FONT,
          textAlign: 'center',
          transform: `translateY(${interpolate(cardIn, [0, 1], [500, 0])}px)`,
          opacity: Math.min(1, cardIn * 1.5),
        }}
      >
        <div style={{fontSize: 56, fontWeight: 900, color: COLORS.cyan}}>화학 AI 융합 캠프</div>
        <div style={{fontSize: 40, fontWeight: 700, color: COLORS.white, marginTop: 16, lineHeight: 1.4}}>
          첨단 분광분석으로
          <br />
          우리 동네 환경을 지키자!
        </div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginTop: 26, flexWrap: 'wrap'}}>
          {['#몰리브덴블루', '#880nm', '#흡광도', '#표준곡선', '#AI판정'].map((tag, i) => {
            const s = spring({frame: frame - 95 - i * 5, fps, config: {damping: 8, stiffness: 200}});
            return (
              <span
                key={tag}
                style={{
                  display: 'inline-block',
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.bg,
                  background: i % 2 ? COLORS.cyan : COLORS.lime,
                  padding: '6px 16px',
                  borderRadius: 999,
                  transform: `scale(${s})`,
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', top: 1400, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 60,
            color: COLORS.bg,
            background: COLORS.lime,
            padding: '20px 50px',
            borderRadius: 999,
            boxShadow: `0 0 40px ${COLORS.lime}88`,
            transform: `translateY(${ctaBounce}px) scale(${cta})`,
          }}
        >
          지금 캠프에 도전하세요!
        </div>
      </div>

      <Headline lines={['우리 동네 물,', '직접 분석해 볼까?']} delay={4} top={150} size={72} accent={COLORS.lime} />
    </SceneFrame>
  );
};
