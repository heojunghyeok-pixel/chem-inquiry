import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, random, useCurrentFrame} from 'remotion';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('concept');
const MORPH_START = 110;
const MORPH_END = 170;
const PHOTONS = 190;

const CX = 540;
const CY = 1020;

const hexPoints = (cx: number, cy: number, r: number, rot = 0) =>
  Array.from({length: 6})
    .map((_, i) => {
      const a = (i / 6) * Math.PI * 2 + rot;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    })
    .join(' ');

const pentPoints = (cx: number, cy: number, r: number, rot: number) =>
  Array.from({length: 5})
    .map((_, i) => {
      const a = (i / 5) * Math.PI * 2 + rot;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    })
    .join(' ');

/** 엽록소 (포르피린 고리 + Mg 중심, 단순화) */
const Chlorophyll: React.FC = () => (
  <g>
    <circle r={150} fill="none" stroke={COLORS.leaf} strokeWidth={10} opacity={0.5} />
    {[0, 1, 2, 3].map((k) => {
      const a = (k / 4) * Math.PI * 2 - Math.PI / 4;
      const px = Math.cos(a) * 120;
      const py = Math.sin(a) * 120;
      return (
        <g key={k}>
          <line x1={0} y1={0} x2={px * 0.62} y2={py * 0.62} stroke={COLORS.white} strokeWidth={6} />
          <polygon points={pentPoints(px, py, 52, a + Math.PI)} fill="#14532d" stroke={COLORS.lime} strokeWidth={6} />
          <text x={px * 0.62} y={py * 0.62 + 9} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={COLORS.lime}>
            N
          </text>
        </g>
      );
    })}
    <circle r={34} fill={COLORS.lime} />
    <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.bg}>
      Mg
    </text>
    {/* 피틸 꼬리 */}
    <path d="M 120 120 q 40 40 0 80 q -40 40 0 80 q 40 40 0 80" stroke={COLORS.lime} strokeWidth={8} fill="none" opacity={0.7} />
  </g>
);

/** 안토시아닌 (시아니딘 골격 단순화: A-C 고리 + B 고리) */
const Anthocyanin: React.FC<{glow: number}> = ({glow}) => (
  <g>
    <circle r={230} fill={COLORS.neonPurple} opacity={0.12 + glow * 0.18} />
    <polygon points={hexPoints(-150, 20, 70, Math.PI / 6)} fill="#3b0764" stroke={COLORS.neonPurple} strokeWidth={8} />
    <polygon points={hexPoints(-29, 20, 70, Math.PI / 6)} fill="#3b0764" stroke={COLORS.neonPurple} strokeWidth={8} />
    <line x1={32} y1={-15} x2={95} y2={-50} stroke={COLORS.neonPurple} strokeWidth={8} />
    <polygon points={hexPoints(155, -85, 70, Math.PI / 6)} fill="#3b0764" stroke={COLORS.neonPurple} strokeWidth={8} />
    {/* O⁺ */}
    <circle cx={-29} cy={90} r={22} fill={COLORS.pink} />
    <text x={-29} y={99} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={COLORS.bg}>
      O⁺
    </text>
    {/* OH 기 */}
    {[
      [-240, 75],
      [-150, -70],
      [215, -150],
      [245, -55],
    ].map(([x, y], i) => (
      <text key={i} x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.pink}>
        OH
      </text>
    ))}
  </g>
);

/** Scene 2: 엽록소 → 안토시아닌 모핑, 광자 → 전자 방출 */
export const Scene2Concept: React.FC = () => {
  const frame = useCurrentFrame();
  const morph = interpolate(frame, [MORPH_START, MORPH_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const intro = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.6))});
  const bgTint = interpolateColors(morph, [0, 1], ['#0b2a1a', '#1d0b3a']);
  const glow = frame > PHOTONS ? 0.5 + 0.5 * Math.sin(frame * 0.25) : 0;

  // 나뭇잎 실루엣 → 블루베리 실루엣
  const leafScale = 1 - morph;
  const berryScale = morph;

  return (
    <SceneFrame duration={DURATION} background={`radial-gradient(circle at 50% 50%, ${bgTint} 0%, ${COLORS.bg} 65%, ${COLORS.bgDeep} 100%)`}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 배경 실루엣 */}
          <g transform={`translate(${CX}, ${CY}) scale(${leafScale * intro})`} opacity={0.25}>
            <path d="M 0 -420 Q 330 -200 0 420 Q -330 -200 0 -420 Z" fill={COLORS.leaf} />
            <line x1={0} y1={-400} x2={0} y2={400} stroke="#bbf7d0" strokeWidth={8} />
          </g>
          <g transform={`translate(${CX}, ${CY}) scale(${berryScale})`} opacity={0.25}>
            <circle r={400} fill={COLORS.blueberry} />
          </g>

          {/* 분자 모핑: 축소+회전 크로스페이드 */}
          <g transform={`translate(${CX}, ${CY}) scale(${(1 - morph * 0.6) * intro}) rotate(${morph * 120})`} opacity={1 - morph}>
            <Chlorophyll />
          </g>
          <g transform={`translate(${CX}, ${CY}) scale(${0.4 + morph * 0.6}) rotate(${(1 - morph) * -120})`} opacity={morph}>
            <Anthocyanin glow={glow} />
          </g>

          <text x={CX} y={CY + 330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={COLORS.lime} opacity={(1 - morph) * intro}>
            엽록소 (식물 광합성)
          </text>
          <text x={CX} y={CY + 330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={COLORS.neonPurple} opacity={morph}>
            안토시아닌 (블루베리 색소)
          </text>

          {/* 광자 쏟아짐 */}
          {frame > PHOTONS
            ? Array.from({length: 16}).map((_, i) => {
                const k = (((frame - PHOTONS) * 0.025 + random(`p${i}`)) % 1);
                const sx = 140 + random(`px${i}`) * 800;
                const x = sx + (CX - sx) * k * 0.7;
                const y = 520 + (CY - 520) * k;
                return (
                  <g key={i} transform={`translate(${x}, ${y})`} opacity={1 - k * 0.6}>
                    <path d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" fill={COLORS.yellow} />
                  </g>
                );
              })
            : null}
          {/* 전자 방출 */}
          {frame > PHOTONS + 25
            ? Array.from({length: 10}).map((_, i) => {
                const k = (((frame - PHOTONS - 25) * 0.03 + i / 10) % 1);
                const a = (i / 10) * Math.PI * 2 + 0.3;
                const r = 150 + k * 380;
                return (
                  <g key={i} transform={`translate(${CX + Math.cos(a) * r}, ${CY + Math.sin(a) * r * 0.8})`} opacity={1 - k}>
                    <circle r={22} fill={COLORS.yellow} />
                    <text y={8} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={COLORS.bg}>
                      e⁻
                    </text>
                  </g>
                );
              })
            : null}
        </svg>
      </AbsoluteFill>

      <Headline lines={['식물의 광합성을 훔치다:', '염료감응형 태양전지(DSSC)']} delay={6} top={180} size={68} accent={COLORS.neonPurple} />
      <Subtitle text="색소가 빛(광자)을 흡수 → 들뜬 전자를 내놓는다" delay={PHOTONS + 10} bottom={240} />
    </SceneFrame>
  );
};
