import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('nobel');
const TV_AT = 140;
const ZOOM_AT = 220;
const LEGEND_AT = 300;

const TV = {x: 90, y: 600, w: 900, h: 560};

// 양자점: 크기가 클수록 빨강, 작을수록 파랑
const QD_TYPES = [
  {color: COLORS.qdRed, r: 22, label: '큰 입자 → 빨강'},
  {color: COLORS.qdGreen, r: 15, label: '중간 → 초록'},
  {color: COLORS.qdBlue, r: 9, label: '작은 입자 → 파랑'},
];

/** 금메달 (일반 메달 그래픽) */
const Medal: React.FC<{shine: number}> = ({shine}) => (
  <g>
    <path d="M -90 -330 L -20 -150 L 20 -150 L 90 -330 L 40 -330 L 0 -220 L -40 -330 Z" fill="#1d4ed8" />
    <circle r={190} fill={COLORS.goldDark} />
    <circle r={176} fill={COLORS.gold} />
    <circle r={150} fill="none" stroke={COLORS.goldDark} strokeWidth={6} />
    {/* 월계수 */}
    {Array.from({length: 8}).map((_, i) => {
      const a = Math.PI * 0.62 + (i / 7) * Math.PI * 0.55;
      return (
        <g key={i}>
          <ellipse cx={Math.cos(a) * 120} cy={Math.sin(a) * 120} rx={10} ry={22} fill={COLORS.goldDark} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 120} ${Math.sin(a) * 120})`} />
          <ellipse cx={-Math.cos(a) * 120} cy={Math.sin(a) * 120} rx={10} ry={22} fill={COLORS.goldDark} transform={`rotate(${(-a * 180) / Math.PI} ${-Math.cos(a) * 120} ${Math.sin(a) * 120})`} />
        </g>
      );
    })}
    <text y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={COLORS.goldDark}>
      2023
    </text>
    <text y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={COLORS.goldDark}>
      노벨 화학상
    </text>
    {/* 반짝임 */}
    <ellipse cx={-70 + shine * 140} cy={-80} rx={20} ry={110} fill="#ffffff" opacity={0.35} transform={`rotate(25 ${-70 + shine * 140} -80)`} />
  </g>
);

/** Scene 1: 노벨상 메달 → QLED TV → 양자점 확산 */
export const Scene1NobelHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const medalIn = spring({frame: frame - 6, fps, config: {damping: 7, stiffness: 120}});
  const medalOut = interpolate(frame, [TV_AT - 20, TV_AT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const shine = ((frame % 60) / 60);
  const tvIn = spring({frame: frame - TV_AT, fps, config: {damping: 12, stiffness: 110}});
  const zoom = interpolate(frame, [ZOOM_AT, ZOOM_AT + 50], [1, 1.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const spread = interpolate(frame, [ZOOM_AT + 20, ZOOM_AT + 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});

  const tcx = TV.x + TV.w / 2;
  const tcy = TV.y + TV.h / 2;

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 메달 */}
          {frame < TV_AT ? (
            <g transform={`translate(540, ${1000 - medalOut * 300}) scale(${medalIn * (1 - medalOut)}) rotate(${(1 - medalIn) * -30})`}>
              <Medal shine={shine} />
            </g>
          ) : null}

          {/* QLED TV */}
          {frame >= TV_AT ? (
            <g transform={`translate(${tcx}, ${tcy}) scale(${tvIn * zoom}) translate(${-tcx}, ${-tcy})`}>
              <rect x={TV.x - 20} y={TV.y - 20} width={TV.w + 40} height={TV.h + 40} rx={26} fill="#0b0f1a" stroke="#334155" strokeWidth={4} />
              <rect x={TV.x} y={TV.y} width={TV.w} height={TV.h} rx={10} fill="#030712" />
              {/* 화면 그라데이션 */}
              <rect x={TV.x} y={TV.y} width={TV.w} height={TV.h} rx={10} fill="url(#tvGrad)" opacity={1 - spread * 0.7} />
              <defs>
                <linearGradient id="tvGrad" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.qdBlue} />
                  <stop offset="50%" stopColor={COLORS.qdGreen} />
                  <stop offset="100%" stopColor={COLORS.qdRed} />
                </linearGradient>
                <clipPath id="tvClip">
                  <rect x={TV.x} y={TV.y} width={TV.w} height={TV.h} rx={10} />
                </clipPath>
                <filter id="qdGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation={6} />
                </filter>
              </defs>
              {/* 양자점 입자 확산 */}
              <g clipPath="url(#tvClip)">
                {Array.from({length: 90}).map((_, i) => {
                  const type = QD_TYPES[i % 3];
                  const tx = TV.x + random(`qx${i}`) * TV.w;
                  const ty = TV.y + random(`qy${i}`) * TV.h;
                  const x = tcx + (tx - tcx) * spread + Math.sin(frame * 0.05 + i) * 4;
                  const y = tcy + (ty - tcy) * spread + Math.cos(frame * 0.05 + i) * 4;
                  const r = (type.r / zoom) * 1.0;
                  return (
                    <g key={i} opacity={spread}>
                      <circle cx={x} cy={y} r={r * 2.2} fill={type.color} filter="url(#qdGlow)" opacity={0.8} />
                      <circle cx={x} cy={y} r={r} fill={type.color} />
                    </g>
                  );
                })}
              </g>
              <text x={tcx} y={TV.y + TV.h + 50} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.slate} opacity={1 - spread}>
                QLED
              </text>
              <rect x={tcx - 80} y={TV.y + TV.h + 20} width={160} height={14} rx={7} fill="#334155" opacity={1 - spread} />
            </g>
          ) : null}

          {/* 크기 ↔ 색 범례 */}
          {QD_TYPES.map((q, i) => {
            const s = spring({frame: frame - LEGEND_AT - i * 8, fps, config: {damping: 9, stiffness: 160}});
            return (
              <g key={q.label} transform={`translate(${200 + i * 340}, 1520) scale(${s})`}>
                <circle r={q.r * 2.6} fill={q.color} style={{filter: `drop-shadow(0 0 16px ${q.color})`}} />
                <text y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={q.color}>
                  {q.label}
                </text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>

      <Headline lines={['2023 노벨 화학상의 주인공:', '양자점(Quantum Dot)']} delay={8} top={180} size={72} accent={COLORS.gold} />
      <Subtitle text="나노 입자의 크기만 바꿔도 내는 빛의 색이 달라진다" delay={LEGEND_AT + 20} bottom={170} />
    </SceneFrame>
  );
};
