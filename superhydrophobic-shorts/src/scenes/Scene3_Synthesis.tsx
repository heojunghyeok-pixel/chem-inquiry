import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Chip, KeywordCaption, SceneFrame} from '../components/Typography';
import {WaterDroplet} from '../components/WaterDroplet';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('synthesis');

const PAPER = {x: 90, y: 1400, w: 900, h: 70};
const ZNO_COUNT = 90;
const STEP2 = 170; // 스테아르산 단계 시작
const MOLECULES = [190, 330, 470, 610, 750, 890]; // 스테아르산 결합 x 위치
const TAIL_SEGMENTS = 8; // 지그재그 꺾임 수 (C17 사슬을 단순화)
const TAIL_LEN = 360;

// ZnO 입자 최종 위치 (결정적 랜덤)
const znoParticle = (i: number) => {
  const x = PAPER.x + 20 + random(`zx${i}`) * (PAPER.w - 40);
  const layer = random(`zl${i}`);
  const y = PAPER.y - 14 - layer * 70;
  const r = 12 + random(`zr${i}`) * 12;
  const start = 40 + random(`zs${i}`) * 90;
  return {x, y, r, start};
};

// 결합 지점(Zn²⁺) y: 돌기층 위쪽
const BIND_Y = PAPER.y - 100;

const StearicAcid: React.FC<{x: number; index: number}> = ({x, index}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - STEP2 - index * 8;

  // 위에서 내려와 결합
  const descend = spring({frame: t, fps, config: {damping: 13, stiffness: 90}});
  const y = interpolate(descend, [0, 1], [BIND_Y - 1500, BIND_Y]);
  // 집게발(카르복실기 산소 2개)이 Zn을 감싸며 닫힘
  const clamp = spring({frame: t - 30, fps, config: {damping: 8, stiffness: 200}});
  const clawAngle = interpolate(clamp, [0, 1], [55, 18]);
  // 꼬리가 깃털처럼 쫙 펴짐
  const unfold = spring({frame: t - 50, fps, config: {damping: 9, stiffness: 110}});
  const sway = Math.sin(frame * 0.08 + index) * 4 * unfold;
  const bindFlash = interpolate(t - 30, [0, 14], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  if (t < 0) return null;

  // 꼬리 지그재그 경로 (머리 위쪽으로)
  const segH = (TAIL_LEN * interpolate(unfold, [0, 1], [0.25, 1])) / TAIL_SEGMENTS;
  let tail = `M 0 -46`;
  for (let i = 1; i <= TAIL_SEGMENTS; i++) {
    tail += ` L ${i % 2 === 0 ? 0 : 20} ${-46 - segH * i}`;
  }

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Zn²⁺ 결합 플래시 */}
      <circle r={30 + (1 - bindFlash) * 60} fill="none" stroke={COLORS.lime} strokeWidth={6} opacity={clamp > 0.5 ? bindFlash : 0} />
      <g transform={`rotate(${sway})`}>
        {/* 소수성 꼬리 C17H35– */}
        <path d={tail} stroke={COLORS.slate} strokeWidth={12} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        {Array.from({length: TAIL_SEGMENTS}).map((_, i) => (
          <circle key={i} cx={(i + 1) % 2 === 0 ? 0 : 20} cy={-46 - segH * (i + 1)} r={8} fill={COLORS.white} />
        ))}
        {/* 카르복실기 머리: 탄소 + 산소 2개 집게 */}
        <line x1={0} y1={-46} x2={0} y2={-20} stroke={COLORS.slate} strokeWidth={12} />
        <circle cy={-24} r={16} fill={COLORS.slate} />
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(0, -24) rotate(${side * clawAngle})`}>
            <line x1={0} y1={0} x2={0} y2={44} stroke={COLORS.oxygen} strokeWidth={10} strokeLinecap="round" />
            <circle cy={44} r={15} fill={COLORS.oxygen} />
          </g>
        ))}
      </g>
    </g>
  );
};

/** Scene 3: 종이 + ZnO 돌기 + 스테아르산 코팅 */
export const Scene3Synthesis: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const paperIn = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 110}});

  // 마지막: 물방울이 꼬리 방어막에 튕겨나감
  const bounceT = frame - 330;
  const shield = interpolate(frame, [300, 330], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneFrame
      duration={DURATION}
      background={`linear-gradient(180deg, ${COLORS.navy} 0%, #0b2a3a 60%, ${COLORS.emeraldDeep} 100%)`}
    >
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 종이(여과지) 베이스 */}
          <g transform={`translate(0, ${(1 - paperIn) * 400})`} opacity={paperIn}>
            <rect x={PAPER.x} y={PAPER.y} width={PAPER.w} height={PAPER.h} rx={10} fill={COLORS.paper} />
            {Array.from({length: 18}).map((_, i) => (
              <path
                key={i}
                d={`M ${PAPER.x + 20 + i * 50} ${PAPER.y + 20} q 20 ${10 + (i % 3) * 6} 40 0`}
                stroke="#cbd5e1"
                strokeWidth={3}
                fill="none"
              />
            ))}
            <text x={PAPER.x + PAPER.w / 2} y={PAPER.y + 140} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={38} fill={COLORS.slate}>
              여과지 (셀룰로스 섬유)
            </text>
          </g>

          {/* ZnO 나노 분말: 비처럼 쏟아져 거친 층 형성 */}
          {Array.from({length: ZNO_COUNT}).map((_, i) => {
            const p = znoParticle(i);
            const fall = interpolate(frame, [p.start, p.start + 22], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.in(Easing.quad),
            });
            if (frame < p.start) return null;
            const settle = spring({frame: frame - p.start - 22, fps, config: {damping: 6, stiffness: 260}});
            const y = interpolate(fall, [0, 1], [-60, p.y]) - (fall >= 1 ? (1 - settle) * 18 : 0);
            return (
              <g key={i} transform={`translate(${p.x}, ${y})`}>
                <circle r={p.r} fill={COLORS.zno} stroke="#94a3b8" strokeWidth={3} />
                <circle cx={-p.r * 0.3} cy={-p.r * 0.3} r={p.r * 0.3} fill="#ffffff" />
              </g>
            );
          })}

          {/* 방어막 글로우 */}
          <rect
            x={PAPER.x}
            y={BIND_Y - TAIL_LEN - 90}
            width={PAPER.w}
            height={TAIL_LEN + 70}
            rx={40}
            fill={COLORS.cyan}
            opacity={shield * (0.1 + 0.05 * Math.sin(frame * 0.3))}
          />

          {/* 스테아르산 분자 */}
          {MOLECULES.map((mx, i) => (
            <g key={mx}>
              {/* 결합할 Zn²⁺ 자리 */}
              <circle cx={mx} cy={BIND_Y + 34} r={18} fill={COLORS.cyan} opacity={frame > STEP2 ? 1 : 0} />
              <StearicAcid x={mx} index={i} />
            </g>
          ))}

          {/* 물방울이 떨어졌다가 튕겨나감 */}
          {bounceT > 0
            ? [0, 1, 2].map((k) => {
                const t = bounceT - k * 10;
                if (t < 0) return null;
                const bx = 260 + k * 280;
                const top = BIND_Y - TAIL_LEN - 120;
                const yy = t < 14
                  ? interpolate(t, [0, 14], [-100, top], {easing: Easing.in(Easing.quad)})
                  : top - Math.abs(Math.sin((t - 14) * 0.12)) * 150 * Math.exp(-(t - 14) / 40);
                const sq = t >= 14 ? 1 + 0.3 * Math.exp(-(t - 14) / 4) : 1;
                return <WaterDroplet key={k} cx={bx} cy={yy} r={48} squash={sq} roll={t * 4} />;
              })
            : null}
        </svg>
      </AbsoluteFill>

      {/* 단계 배지 & 라벨 */}
      <Chip text="STEP 1 · ZnO 나노 분말 → 거친 돌기층" x={540} y={1640} delay={40} color={COLORS.white} size={34} />
      <Chip text="STEP 2 · 스테아르산 코팅" x={540} y={1720} delay={STEP2} color={COLORS.lime} size={34} />
      {frame > STEP2 + 40 ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 1780,
            textAlign: 'center',
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 30,
            color: COLORS.slate,
            opacity: interpolate(frame, [STEP2 + 40, STEP2 + 60], [0, 1], {extrapolateRight: 'clamp'}),
          }}
        >
          <span style={{color: COLORS.oxygen}}>–COO⁻</span> 머리 ↔ <span style={{color: COLORS.cyan}}>Zn²⁺</span> 킬레이트 결합 ·
          꼬리 <span style={{color: COLORS.white}}>C₁₇H₃₅–</span>
        </div>
      ) : null}

      <KeywordCaption
        lines={['종이의 대변신:', 'ZnO 돌기 + 스테아르산 코팅']}
        delay={6}
        top={190}
        size={70}
        accent={COLORS.lime}
      />
    </SceneFrame>
  );
};
