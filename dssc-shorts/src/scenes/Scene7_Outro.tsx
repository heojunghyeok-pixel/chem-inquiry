import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BlueberryBattery, BoltIcon} from '../components/BlueberryBattery';
import {MotorFan} from '../components/ElectronLoop';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('outro');

// 캠프 일정·장소: 확정되면 여기만 수정
export const CAMP_INFO = {
  schedule: '일정: 추후 안내',
  place: '장소: 추후 안내',
};

/** 실험복 + 보호경 학생 (만세 포즈) */
const Student: React.FC<{hair: string; cheer: number; holdCell?: boolean; fan: number}> = ({hair, cheer, holdCell, fan}) => (
  <g>
    <path d="M -110 260 Q -110 120 -45 105 L 45 105 Q 110 120 110 260 Z" fill={COLORS.white} />
    <path d="M -45 105 L -8 170 L -22 105 Z" fill="#cbd5e1" />
    <path d="M 45 105 L 8 170 L 22 105 Z" fill="#cbd5e1" />
    {/* 팔: 환호 */}
    <g transform={`rotate(${-150 + cheer * 25} -80 130)`}>
      <rect x={-96} y={130} width={34} height={120} rx={17} fill={COLORS.white} />
      <circle cx={-79} cy={256} r={20} fill="#f2c9a0" />
    </g>
    <g transform={`rotate(${150 - cheer * 25} 80 130)`}>
      <rect x={62} y={130} width={34} height={120} rx={17} fill={COLORS.white} />
      <circle cx={79} cy={256} r={20} fill="#f2c9a0" />
      {holdCell ? (
        <g transform="translate(79, 300) rotate(180)">
          <rect x={-50} y={-30} width={100} height={60} rx={6} fill={COLORS.dye} stroke={COLORS.fto} strokeWidth={4} />
          <g transform="translate(0, -40)">
            <MotorFan angle={fan} scale={0.45} />
          </g>
        </g>
      ) : null}
    </g>
    <circle cx={0} cy={30} r={70} fill="#f2c9a0" />
    <path d="M -72 22 Q -66 -50 0 -46 Q 66 -50 72 22 Q 50 -8 0 -10 Q -50 -8 -72 22 Z" fill={hair} />
    <rect x={-60} y={14} width={120} height={40} rx={18} fill={COLORS.neonBlue} opacity={0.85} />
    <rect x={-50} y={21} width={46} height={26} rx={11} fill={COLORS.bg} opacity={0.6} />
    <rect x={4} y={21} width={46} height={26} rx={11} fill={COLORS.bg} opacity={0.6} />
    <path d="M -22 72 Q 0 96 22 72" stroke="#7c2d12" strokeWidth={6} fill="#7c2d12" />
  </g>
);

/** Scene 7: 캠프 안내 & 엔딩 */
export const Scene7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const sIn = (i: number) => spring({frame: frame - 6 - i * 8, fps, config: {damping: 8, stiffness: 140}});
  const cheer = (Math.sin(frame * 0.3) + 1) / 2;
  const fan = frame * 30;
  const cardIn = spring({frame: frame - 60, fps, config: {damping: 11, stiffness: 120}});
  const berryIn = spring({frame: frame - 110, fps, config: {damping: 7, stiffness: 150}});
  const wink = frame > 150 && frame % 60 < 18 ? 1 : 0;
  const boltBounce = -Math.abs(Math.sin(frame * 0.2)) * 30;

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {[
            {x: 300, hair: '#1f2937', hold: true},
            {x: 780, hair: '#78350f', hold: false},
          ].map((s, i) => (
            <g key={s.x} transform={`translate(${s.x}, ${640 + (1 - sIn(i)) * 900 - cheer * 14})`}>
              <Student hair={s.hair} cheer={i ? 1 - cheer : cheer} holdCell={s.hold} fan={fan} />
            </g>
          ))}
          {/* 블루베리 캐릭터 */}
          <g transform={`translate(830, 1640) scale(${berryIn})`}>
            <BlueberryBattery r={110} sparks={0.6} face wink={wink} aura={0.7} />
          </g>
          <g transform={`translate(970, ${1500 + boltBounce}) scale(${berryIn})`}>
            <BoltIcon size={0.9} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* 캠프 안내 카드 */}
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          top: 1030,
          padding: '36px 40px',
          borderRadius: 32,
          background: 'rgba(15,22,48,0.95)',
          border: `4px solid ${COLORS.neonPurple}`,
          boxShadow: `0 0 50px ${COLORS.neonPurple}55`,
          fontFamily: FONT,
          transform: `translateY(${interpolate(cardIn, [0, 1], [500, 0])}px)`,
          opacity: Math.min(1, cardIn * 1.5),
        }}
      >
        <div style={{fontSize: 50, fontWeight: 900, color: COLORS.neonBlue}}>화학 X 에너지 AI 융합 캠프</div>
        <div style={{fontSize: 34, fontWeight: 700, color: COLORS.white, marginTop: 14, lineHeight: 1.5}}>
          블루베리 DSSC 제작 · 분광 분석 · MBL 광전류 측정
        </div>
        <div style={{display: 'flex', gap: 16, marginTop: 20, fontSize: 32, fontWeight: 900}}>
          <span style={{color: COLORS.bg, background: COLORS.lime, padding: '6px 18px', borderRadius: 12}}>{CAMP_INFO.schedule}</span>
          <span style={{color: COLORS.bg, background: COLORS.neonBlue, padding: '6px 18px', borderRadius: 12}}>{CAMP_INFO.place}</span>
        </div>
      </div>

      <Headline lines={['화학 X 에너지 AI', '융합 캠프에서 만나요!']} delay={4} top={150} size={78} accent={COLORS.neonPurple} />
    </SceneFrame>
  );
};
