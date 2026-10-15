import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('hook');
const WATER_TOP = 1080;
const ALGAE_START = 90;
const PO4_ZOOM = 190;

/** 인산염 PO₄³⁻ 분자 아이콘 */
export const Phosphate: React.FC<{size?: number; label?: boolean}> = ({size = 1, label = true}) => (
  <g transform={`scale(${size})`}>
    {[0, 1, 2, 3].map((k) => {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      return <line key={k} x1={0} y1={0} x2={Math.cos(a) * 62} y2={Math.sin(a) * 62} stroke={COLORS.white} strokeWidth={10} />;
    })}
    {[0, 1, 2, 3].map((k) => {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      return (
        <g key={k} transform={`translate(${Math.cos(a) * 62}, ${Math.sin(a) * 62})`}>
          <circle r={28} fill={COLORS.oxygen} />
          <text y={11} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.white}>
            O
          </text>
        </g>
      );
    })}
    <circle r={38} fill={COLORS.phosphorus} />
    <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.white}>
      P
    </text>
    {label ? (
      <text x={70} y={-70} fontFamily={FONT} fontWeight={900} fontSize={34} fill={COLORS.amber}>
        3−
      </text>
    ) : null}
  </g>
);

/** Scene 1: 삼성천 물결 → 녹조 확산 → 인산염 클로즈업 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const algae = interpolate(frame, [ALGAE_START, ALGAE_START + 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const waterColor = interpolateColors(algae, [0, 1], [COLORS.stream, COLORS.algae]);
  const waterDeep = interpolateColors(algae, [0, 1], ['#1e3a8a', '#2f4a0a']);

  // 잔잔한 물결 레이어
  const wave = (yBase: number, amp: number, len: number, speed: number, phase: number) => {
    let d = `M 0 ${yBase}`;
    for (let x = 0; x <= 1080; x += 20) {
      d += ` L ${x} ${yBase + Math.sin((x / len) * Math.PI * 2 + frame * speed + phase) * amp}`;
    }
    return `${d} L 1080 1920 L 0 1920 Z`;
  };

  // 하수 배수관에서 흘러나오는 인산염 (작은 아이콘)
  const pipeIn = spring({frame: frame - 120, fps, config: {damping: 12, stiffness: 120}});
  const zoom = spring({frame: frame - PO4_ZOOM, fps, config: {damping: 9, stiffness: 90}});

  return (
    <SceneFrame duration={DURATION} grid={false} background={`linear-gradient(180deg, #0b1329 0%, #16244a 45%, #1f3b5a 56%)`}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 강둑 & 학교 실루엣 */}
          <path d={`M 0 ${WATER_TOP - 60} Q 300 ${WATER_TOP - 140} 640 ${WATER_TOP - 80} T 1080 ${WATER_TOP - 70} V ${WATER_TOP + 20} H 0 Z`} fill="#1b3326" />
          <g transform={`translate(700, ${WATER_TOP - 300})`} opacity={0.9}>
            <rect x={0} y={60} width={300} height={170} fill="#22335e" />
            <rect x={110} y={0} width={80} height={60} fill="#22335e" />
            {Array.from({length: 8}).map((_, i) => (
              <rect key={i} x={20 + (i % 4) * 70} y={90 + Math.floor(i / 4) * 70} width={40} height={36} fill={COLORS.amber} opacity={0.45} />
            ))}
            <text x={150} y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={COLORS.slate}>
              반곡고
            </text>
          </g>
          {/* 표지판 */}
          <g transform={`translate(160, ${WATER_TOP - 180})`}>
            <rect x={-6} y={40} width={12} height={110} fill={COLORS.slate} />
            <rect x={-100} y={-10} width={200} height={64} rx={10} fill="#0f5132" stroke={COLORS.white} strokeWidth={4} />
            <text y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={COLORS.white}>
              삼성천
            </text>
          </g>

          {/* 배수관 */}
          <g transform={`translate(${-220 + pipeIn * 220}, ${WATER_TOP - 40})`}>
            <rect x={0} y={0} width={150} height={70} rx={8} fill="#475569" />
            <rect x={130} y={-8} width={34} height={86} rx={6} fill="#64748b" />
            <text x={10} y={-18} fontFamily={FONT} fontWeight={700} fontSize={26} fill={COLORS.slate}>
              생활하수·비료
            </text>
          </g>

          {/* 물 */}
          <path d={wave(WATER_TOP, 14, 360, 0.06, 0)} fill={waterColor} opacity={0.9} />
          <path d={wave(WATER_TOP + 60, 12, 280, -0.05, 1)} fill={waterDeep} opacity={0.7} />
          <path d={wave(WATER_TOP + 140, 10, 420, 0.04, 2)} fill={waterDeep} opacity={0.6} />
          {/* 물빛 반사 */}
          {Array.from({length: 10}).map((_, i) => (
            <line
              key={i}
              x1={random(`hx${i}`) * 1000}
              y1={WATER_TOP + 40 + random(`hy${i}`) * 500}
              x2={random(`hx${i}`) * 1000 + 60 + Math.sin(frame * 0.1 + i) * 20}
              y2={WATER_TOP + 40 + random(`hy${i}`) * 500}
              stroke="#ffffff"
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.25 * (1 - algae)}
            />
          ))}

          {/* 녹조 입자 확산 */}
          {Array.from({length: 120}).map((_, i) => {
            const seedX = random(`ax${i}`);
            const origin = random(`ao${i}`) < 0.5 ? 200 : 760;
            const start = ALGAE_START + random(`as${i}`) * 60;
            const g = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 50}});
            const tx = interpolate(g, [0, 1], [origin, seedX * 1080]);
            const ty = WATER_TOP + 30 + random(`ay${i}`) * 820 + Math.sin(frame * 0.05 + i) * 8;
            const r = 6 + random(`ar${i}`) * 14;
            return frame >= start ? (
              <circle key={i} cx={tx} cy={ty} r={r * g} fill={i % 3 ? COLORS.algaeLight : '#65a30d'} opacity={0.75} />
            ) : null;
          })}

          {/* 흘러나오는 인산염 (작게) */}
          {frame > 130
            ? [0, 1, 2, 3].map((k) => {
                const t = ((frame - 130 + k * 20) % 80) / 80;
                return (
                  <g key={k} transform={`translate(${170 + t * 520}, ${WATER_TOP + 40 + t * 260 + Math.sin(t * 8 + k) * 20})`} opacity={(1 - zoom) * (1 - t * 0.6)}>
                    <Phosphate size={0.35} label={false} />
                  </g>
                );
              })
            : null}

          {/* 화면 초록 탁도 */}
          <rect x={0} y={0} width={1080} height={1920} fill={COLORS.algae} opacity={algae * 0.28} />

          {/* 인산염 클로즈업 */}
          {frame >= PO4_ZOOM ? (
            <g transform={`translate(540, ${interpolate(zoom, [0, 1], [1300, 1180])}) scale(${zoom * 2.4}) rotate(${(1 - zoom) * -90 + Math.sin(frame * 0.05) * 4})`}>
              <circle r={120} fill={COLORS.bg} opacity={0.75} />
              <circle r={120} fill="none" stroke={COLORS.amber} strokeWidth={4} strokeDasharray="10 8" />
              <Phosphate />
            </g>
          ) : null}
          {frame >= PO4_ZOOM + 15 ? (
            <text x={540} y={1560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={COLORS.amber} opacity={interpolate(frame, [PO4_ZOOM + 15, PO4_ZOOM + 30], [0, 1], {extrapolateRight: 'clamp'})}>
              인산염 (PO₄³⁻)
            </text>
          ) : null}
        </svg>
      </AbsoluteFill>

      <Headline lines={['여름만 되면 찾아오는', '녹조 폭발, 범인은?']} delay={8} exitAt={178} top={190} size={74} accent={COLORS.algaeLight} />
      <Headline lines={['보이지 않는', '인산염!']} delay={192} top={190} size={92} accent={COLORS.amber} sub="질소·인 같은 영양염이 녹조를 키운다" />
    </SceneFrame>
  );
};
