import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {KeywordCaption, SceneFrame} from '../components/Typography';
import {WaterDroplet} from '../components/WaterDroplet';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('outro');

// 기울어진 초발수 종이(경사면)
const SLOPE = {x1: 90, y1: 820, x2: 990, y2: 1130};
const SLOPE_ANGLE = Math.atan2(SLOPE.y2 - SLOPE.y1, SLOPE.x2 - SLOPE.x1);
const slopeY = (x: number) => SLOPE.y1 + (x - SLOPE.x1) * Math.tan(SLOPE_ANGLE);
const DIRT = [260, 400, 540, 680, 820];
const DROP_R = 40;

/** 보호경 아이콘 */
const Goggles: React.FC = () => (
  <g>
    <path d="M -120 -10 Q -120 -50 -70 -50 H 70 Q 120 -50 120 -10 V 20 Q 120 50 80 50 Q 40 50 20 20 H -20 Q -40 50 -80 50 Q -120 50 -120 20 Z" fill={COLORS.cyan} />
    <ellipse cx={-62} cy={2} rx={42} ry={30} fill={COLORS.navy} opacity={0.7} />
    <ellipse cx={62} cy={2} rx={42} ry={30} fill={COLORS.navy} opacity={0.7} />
    <ellipse cx={-76} cy={-10} rx={12} ry={7} fill={COLORS.white} opacity={0.8} />
    <ellipse cx={48} cy={-10} rx={12} ry={7} fill={COLORS.white} opacity={0.8} />
    <rect x={-150} y={-12} width={32} height={18} rx={9} fill={COLORS.slate} />
    <rect x={118} y={-12} width={32} height={18} rx={9} fill={COLORS.slate} />
  </g>
);

/** 마스크 아이콘 */
const Mask: React.FC = () => (
  <g>
    <path d="M -150 -30 Q -170 0 -150 30" stroke={COLORS.slate} strokeWidth={10} fill="none" />
    <path d="M 150 -30 Q 170 0 150 30" stroke={COLORS.slate} strokeWidth={10} fill="none" />
    <path d="M -110 -50 Q 0 -75 110 -50 L 110 30 Q 0 80 -110 30 Z" fill={COLORS.white} />
    {[-20, 0, 20].map((y) => (
      <path key={y} d={`M -90 ${y} Q 0 ${y - 12} 90 ${y}`} stroke="#cbd5e1" strokeWidth={6} fill="none" />
    ))}
  </g>
);

/** Scene 5: 안전 수칙 + 자가세정 + 캠프 안내 */
export const Scene5Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 안전 아이콘: 통통 튀며 등장 → 반복 바운스
  const iconIn = (i: number) => spring({frame: frame - 20 - i * 8, fps, config: {damping: 6, stiffness: 170}});
  const hop = (i: number) => {
    const t = frame - 50 - i * 10;
    return t > 0 ? -Math.abs(Math.sin(t * 0.16)) * 22 : 0;
  };

  const slopeIn = spring({frame: frame - 30, fps, config: {damping: 12, stiffness: 100}});

  // 물방울 롤러코스터: 가속(ease-in)으로 미끄러져 내려감
  const drops = [0, 1, 2].map((k) => {
    const start = 60 + k * 26;
    const p = interpolate(frame, [start, start + 70], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    });
    const x = interpolate(p, [0, 1], [SLOPE.x1 + 40, SLOPE.x2 + 140]);
    return {k, start, x, p};
  });

  const cardIn = spring({frame: frame - 140, fps, config: {damping: 11, stiffness: 120}});

  return (
    <SceneFrame
      duration={DURATION}
      background={`radial-gradient(circle at 50% 35%, #0b5a45 0%, ${COLORS.emerald} 45%, ${COLORS.navy} 100%)`}
    >
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 안전 수칙 아이콘 */}
          <g transform={`translate(300, ${560 + hop(0)}) scale(${iconIn(0)})`}>
            <Goggles />
          </g>
          <g transform={`translate(780, ${560 + hop(1)}) scale(${iconIn(1)})`}>
            <Mask />
          </g>
          <text x={300} y={680} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.white} opacity={iconIn(0)}>
            보호경 착용
          </text>
          <text x={780} y={680} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.white} opacity={iconIn(1)}>
            마스크 착용
          </text>

          {/* 초발수 종이 경사면 */}
          <g opacity={slopeIn} transform={`translate(0, ${(1 - slopeIn) * 200})`}>
            <path
              d={`M ${SLOPE.x1} ${SLOPE.y1} L ${SLOPE.x2} ${SLOPE.y2} L ${SLOPE.x2} ${SLOPE.y2 + 40} L ${SLOPE.x1} ${SLOPE.y1 + 40} Z`}
              fill={COLORS.paper}
            />
            <line x1={SLOPE.x1} y1={SLOPE.y1} x2={SLOPE.x2} y2={SLOPE.y2} stroke={COLORS.lime} strokeWidth={8} />
            {/* 먼지: 물방울이 지나가면 흡착되어 사라짐 */}
            {DIRT.map((dx, i) => {
              const cleaned = drops.some((d) => d.x > dx && d.p > 0);
              return (
                <g key={dx} opacity={cleaned ? 0 : 1}>
                  {[0, 1, 2].map((j) => (
                    <circle
                      key={j}
                      cx={dx + (random(`dx${i}${j}`) - 0.5) * 30}
                      cy={slopeY(dx) - 8 - random(`dy${i}${j}`) * 10}
                      r={6 + random(`dr${i}${j}`) * 4}
                      fill="#92400e"
                    />
                  ))}
                </g>
              );
            })}
            {drops.map(({k, x, p}) =>
              p > 0 && p < 1 ? (
                <WaterDroplet
                  key={k}
                  cx={x}
                  cy={slopeY(x) - DROP_R - 4}
                  r={DROP_R}
                  roll={(((x - SLOPE.x1) / DROP_R) * 180) / Math.PI}
                  dirt={DIRT.filter((dx) => x > dx).length > 0 && k === 0 ? DIRT.filter((dx) => x > dx).length : 0}
                />
              ) : null,
            )}
            <text x={SLOPE.x2} y={SLOPE.y2 + 100} textAnchor="end" fontFamily={FONT} fontWeight={900} fontSize={38} fill={COLORS.lime}>
              자가세정 (Self-cleaning)
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      {/* 캠프 안내 카드 */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          right: 70,
          top: 1260,
          padding: '48px 44px',
          borderRadius: 36,
          background: 'rgba(15, 23, 42, 0.88)',
          border: `4px solid ${COLORS.cyan}`,
          boxShadow: `0 0 50px ${COLORS.cyan}55`,
          fontFamily: FONT,
          textAlign: 'center',
          transform: `translateY(${interpolate(cardIn, [0, 1], [600, 0])}px) scale(${interpolate(cardIn, [0, 1], [0.8, 1])})`,
          opacity: Math.min(1, cardIn * 1.5),
        }}
      >
        <div style={{fontSize: 50, fontWeight: 900, color: COLORS.white, lineHeight: 1.3}}>
          나노 화학부터 <span style={{color: COLORS.lime}}>AI 비전 분석</span>까지!
        </div>
        <div style={{fontSize: 58, fontWeight: 900, color: COLORS.cyan, marginTop: 18}}>캠프실에서 만나요!</div>
        <div style={{display: 'flex', justifyContent: 'center', gap: 14, marginTop: 30, flexWrap: 'wrap'}}>
          {['#연잎효과', '#ZnO', '#스테아르산', '#접촉각', '#컴퓨터비전'].map((tag, i) => {
            const s = spring({frame: frame - 165 - i * 5, fps, config: {damping: 8, stiffness: 200}});
            return (
              <span
                key={tag}
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: COLORS.navy,
                  background: i % 2 ? COLORS.cyan : COLORS.lime,
                  padding: '6px 18px',
                  borderRadius: 999,
                  transform: `scale(${s})`,
                  display: 'inline-block',
                }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>

      <KeywordCaption lines={['화학 X AI', '융합 캠프']} delay={4} top={150} size={88} accent={COLORS.lime} />
    </SceneFrame>
  );
};
