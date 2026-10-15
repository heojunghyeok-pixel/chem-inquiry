import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('eco');
const SWAP = 130;
const MERGE = 220;

const CENTER = {x: 540, y: 1150};

/** 원소 타일 */
const ElementTile: React.FC<{sym: string; num: number; name: string}> = ({sym, num, name}) => (
  <g>
    <rect x={-130} y={-150} width={260} height={300} rx={20} fill={COLORS.panel} stroke={COLORS.slate} strokeWidth={5} />
    <text x={-105} y={-105} fontFamily={MONO} fontWeight={700} fontSize={34} fill={COLORS.slate}>
      {num}
    </text>
    <text y={40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={130} fill={COLORS.white}>
      {sym}
    </text>
    <text y={115} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={34} fill={COLORS.slate}>
      {name}
    </text>
  </g>
);

const Lemon: React.FC = () => (
  <g>
    <ellipse rx={110} ry={80} fill={COLORS.lemon} />
    <ellipse cx={-118} rx={16} ry={12} fill={COLORS.lemon} />
    <ellipse cx={118} rx={16} ry={12} fill={COLORS.lemon} />
    <ellipse cx={-30} cy={-30} rx={40} ry={16} fill="#ffffff" opacity={0.4} />
    <path d="M 0 -80 q 20 -40 60 -40 q -20 30 -60 40" fill="#65a30d" />
  </g>
);

const VitaminC: React.FC = () => (
  <g>
    <rect x={-110} y={-50} width={220} height={100} rx={50} fill="#fb923c" />
    <rect x={0} y={-50} width={110} height={100} rx={0} fill="#fdba74" />
    <rect x={-110} y={-50} width={220} height={100} rx={50} fill="none" stroke="#ea580c" strokeWidth={5} />
    <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#7c2d12">
      Vit C
    </text>
  </g>
);

const Urea: React.FC = () => (
  <g>
    <ellipse cy={50} rx={130} ry={30} fill="#64748b" />
    <path d="M -100 45 Q -60 -60 0 -70 Q 60 -60 100 45 Z" fill="#f8fafc" />
    {Array.from({length: 10}).map((_, i) => (
      <circle key={i} cx={-60 + (i * 37) % 120} cy={-10 + ((i * 23) % 50)} r={5} fill="#cbd5e1" />
    ))}
  </g>
);

const INGREDIENTS = [
  {name: '구연산 (레몬)', from: [-400, 760], at: [240, 780], C: Lemon},
  {name: '비타민 C', from: [1480, 760], at: [840, 780], C: VitaminC},
  {name: '요소', from: [540, 2300], at: [540, 1050], C: Urea},
];

/** Scene 2: 카드뮴·납 ✕ → 구연산·비타민C·요소 → 친환경 실드 */
export const Scene2EcoCQD: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const tilesIn = spring({frame: frame - 6, fps, config: {damping: 11, stiffness: 120}});
  const x1 = spring({frame: frame - 40, fps, config: {damping: 6, stiffness: 220}});
  const x2 = spring({frame: frame - 55, fps, config: {damping: 6, stiffness: 220}});
  const tilesOut = interpolate(frame, [SWAP - 15, SWAP], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const merge = interpolate(frame, [MERGE, MERGE + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const shield = spring({frame: frame - MERGE - 28, fps, config: {damping: 7, stiffness: 150}});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 중금속 타일 */}
          {frame < SWAP ? (
            <g opacity={1 - tilesOut}>
              {[
                {sym: 'Cd', num: 48, name: '카드뮴', x: 300, s: x1},
                {sym: 'Pb', num: 82, name: '납', x: 780, s: x2},
              ].map((el) => (
                <g key={el.sym} transform={`translate(${el.x}, ${1000 + (1 - tilesIn) * 700})`}>
                  <ElementTile sym={el.sym} num={el.num} name={el.name} />
                  <g transform={`scale(${el.s}) rotate(${(1 - el.s) * -40})`}>
                    <path d="M -150 -150 L 150 150 M 150 -150 L -150 150" stroke={COLORS.red} strokeWidth={36} strokeLinecap="round" />
                  </g>
                </g>
              ))}
              <text x={540} y={1260} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.red} opacity={x2}>
                기존 양자점 일부: 독성 중금속 사용
              </text>
            </g>
          ) : null}

          {/* 친환경 재료 */}
          {frame >= SWAP
            ? INGREDIENTS.map((ing, i) => {
                const s = spring({frame: frame - SWAP - i * 12, fps, config: {damping: 11, stiffness: 120}});
                const x = interpolate(s, [0, 1], [ing.from[0], ing.at[0]]);
                const y = interpolate(s, [0, 1], [ing.from[1], ing.at[1]]);
                const mx = interpolate(merge, [0, 1], [x, CENTER.x]);
                const my = interpolate(merge, [0, 1], [y, CENTER.y]);
                return (
                  <g key={ing.name} transform={`translate(${mx}, ${my}) scale(${1 - merge * 0.8})`} opacity={1 - merge}>
                    <ing.C />
                    <text y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={COLORS.white}>
                      {ing.name}
                    </text>
                  </g>
                );
              })
            : null}

          {/* 친환경 실드 */}
          {frame >= MERGE + 28 ? (
            <g transform={`translate(${CENTER.x}, ${CENTER.y}) scale(${shield})`}>
              <circle r={300} fill={COLORS.green} opacity={0.12 + 0.06 * Math.sin(frame * 0.2)} />
              <path
                d="M 0 -230 L 190 -160 Q 190 120 0 240 Q -190 120 -190 -160 Z"
                fill="#052e16"
                stroke={COLORS.green}
                strokeWidth={12}
                style={{filter: `drop-shadow(0 0 30px ${COLORS.green})`}}
              />
              <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={COLORS.green}>
                CQD
              </text>
              <text y={90} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={COLORS.white}>
                탄소 양자점
              </text>
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>

      <Headline lines={['중금속 ❌', '레몬과 비타민으로 굽는', '친환경 탄소 양자점(CQD) ⭕']} delay={6} top={170} size={60} accent={COLORS.green} />
    </SceneFrame>
  );
};
