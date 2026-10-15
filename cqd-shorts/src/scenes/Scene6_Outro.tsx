import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('outro');
const PAPER = {x: 110, y: 470, w: 860, h: 330};
const SECRET = 'CQD ✦ 캠프에서 만나요';

/** 실험복 + 보호경 학생 */
const Student: React.FC<{wave: number}> = ({wave}) => (
  <g>
    <path d="M -130 280 Q -130 130 -50 115 L 50 115 Q 130 130 130 280 Z" fill={COLORS.white} />
    <path d="M -50 115 L -10 185 L -26 115 Z" fill="#cbd5e1" />
    <path d="M 50 115 L 10 185 L 26 115 Z" fill="#cbd5e1" />
    <g transform={`rotate(${-140 + wave * 25} 100 150)`}>
      <rect x={84} y={150} width={36} height={120} rx={18} fill={COLORS.white} />
      <circle cx={102} cy={276} r={22} fill="#f2c9a0" />
    </g>
    <circle cx={0} cy={35} r={78} fill="#f2c9a0" />
    <path d="M -80 25 Q -72 -55 0 -50 Q 72 -55 80 25 Q 55 -10 0 -12 Q -55 -10 -80 25 Z" fill="#1f2937" />
    <rect x={-66} y={16} width={132} height={44} rx={20} fill={COLORS.uv} opacity={0.85} />
    <rect x={-56} y={24} width={50} height={28} rx={12} fill={COLORS.bg} opacity={0.55} />
    <rect x={6} y={24} width={50} height={28} rx={12} fill={COLORS.bg} opacity={0.55} />
    <path d="M -24 82 Q 0 104 24 82" stroke="#7c2d12" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

/** Scene 6: 비밀 형광 잉크 → 학생 → 캠프 배너 */
export const Scene6Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const paperIn = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 120}});
  // UV 손전등이 좌→우로 훑으며 글씨가 드러남
  const sweep = interpolate(frame, [20, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const lightX = PAPER.x + sweep * PAPER.w;
  const studentIn = spring({frame: frame - 60, fps, config: {damping: 8, stiffness: 130}});
  const bannerIn = spring({frame: frame - 100, fps, config: {damping: 10, stiffness: 140}});
  const cta = spring({frame: frame - 130, fps, config: {damping: 6, stiffness: 170}});
  const bounce = frame > 150 ? -Math.abs(Math.sin((frame - 150) * 0.2)) * 18 : 0;

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <defs>
            <clipPath id="revealed">
              <rect x={PAPER.x} y={PAPER.y} width={Math.max(0, lightX - PAPER.x)} height={PAPER.h} />
            </clipPath>
            <filter id="inkGlow" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation={10} />
            </filter>
          </defs>
          {/* 여과지 */}
          <g transform={`translate(0, ${(1 - paperIn) * 600})`}>
            <rect x={PAPER.x} y={PAPER.y} width={PAPER.w} height={PAPER.h} rx={16} fill="#e5e7eb" />
            <rect x={PAPER.x} y={PAPER.y} width={Math.max(0, lightX - PAPER.x)} height={PAPER.h} rx={16} fill="#2e1065" opacity={0.85} />
            <g clipPath="url(#revealed)">
              <text x={540} y={PAPER.y + 195} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={COLORS.cyan} filter="url(#inkGlow)">
                {SECRET}
              </text>
              <text x={540} y={PAPER.y + 195} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill="#cffafe">
                {SECRET}
              </text>
            </g>
            {/* UV 손전등 빛 */}
            {sweep > 0 && sweep < 1 ? <ellipse cx={lightX} cy={PAPER.y + PAPER.h / 2} rx={90} ry={PAPER.h / 2 + 30} fill={COLORS.uv} opacity={0.35} /> : null}
            <text x={540} y={PAPER.y + PAPER.h + 50} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={COLORS.slate}>
              CQD 잉크로 쓴 비밀 글씨 · 자외선 아래에서만 보임
            </text>
          </g>

          {/* 학생 */}
          <g transform={`translate(540, ${interpolate(studentIn, [0, 1], [1700, 960])})`}>
            <Student wave={(Math.sin(frame * 0.25) + 1) / 2} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* 캠프 배너 */}
      <div style={{position: 'absolute', top: 1290, left: 60, right: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, fontFamily: FONT}}>
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '30px 30px',
            borderRadius: 28,
            background: 'rgba(13,22,49,0.95)',
            border: `4px solid ${COLORS.cyan}`,
            boxShadow: `0 0 40px ${COLORS.cyan}55`,
            transform: `translateY(${interpolate(bannerIn, [0, 1], [400, 0])}px)`,
            opacity: Math.min(1, bannerIn * 1.5),
          }}
        >
          <div style={{fontSize: 50, fontWeight: 900, color: COLORS.cyan}}>화학 AI 융합 캠프 참가 신청</div>
          <div style={{fontSize: 32, fontWeight: 700, color: COLORS.white, marginTop: 10}}>CQD 합성 · UV 형광 · Fe³⁺ 센서 · AI 분석</div>
        </div>
        <div
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: COLORS.bg,
            background: COLORS.lime,
            padding: '18px 44px',
            borderRadius: 999,
            boxShadow: `0 0 36px ${COLORS.lime}88`,
            transform: `translateY(${bounce}px) scale(${cta})`,
          }}
        >
          구독 & 캠프에서 만나요!
        </div>
      </div>

      <Headline lines={['화학 AI 융합 캠프:', '노벨상의 꿈에 도전하세요!']} delay={4} top={150} size={66} accent={COLORS.gold} />
    </SceneFrame>
  );
};
