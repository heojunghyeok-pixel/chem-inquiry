import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {LightBeam} from '../components/LightBeam';
import {Headline, Subtitle, SceneFrame} from '../components/Typography';
import {absorbanceOf, COLORS, FONT, MONO, SAMPLE_A, SAMPLE_C, sceneDuration} from '../constants';

const DURATION = sceneDuration('spectro');

// 분광광도계 본체
const BOX = {x: 50, y: 560, w: 980, h: 560};
const BEAM_Y = BOX.y + 300;
const SRC_X = 170;
const CUV = {x: 470, w: 140, h: 260};
const DET_X = 900;

const INSERT = 30;
const FIRE = 110;
const FORMULA = 260;
const SWEEP = 420; // 농도 변화 시뮬레이션 시작

/** Scene 4: 큐벳 삽입 → 880 nm 빔 → 흡광도 */
export const Scene4Spectrophotometer: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const boxIn = spring({frame: frame - 4, fps, config: {damping: 13, stiffness: 110}});
  const insert = spring({frame: frame - INSERT, fps, config: {damping: 11, stiffness: 90}});
  const cuvY = interpolate(insert, [0, 1], [BOX.y - 520, BEAM_Y - CUV.h / 2]);
  const fire = interpolate(frame, [FIRE, FIRE + 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // 농도 시뮬레이션: 시료(0.28) → 1.2 → 다시 시료
  const c = interpolate(frame, [SWEEP, SWEEP + 90, SWEEP + 150, SWEEP + 210], [SAMPLE_C, 1.2, 1.2, SAMPLE_C], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const A = frame < SWEEP ? SAMPLE_A : absorbanceOf(c);
  const T = Math.pow(10, -A);
  const liquid = interpolateColors(Math.min(1, c / 1.2), [0, 1], ['#5b8cff', '#0f2a99']);

  const readout = interpolate(frame, [FIRE + 40, FIRE + 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const formulaIn = spring({frame: frame - FORMULA, fps, config: {damping: 10, stiffness: 140}});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 본체 */}
          <g opacity={boxIn} transform={`translate(0, ${(1 - boxIn) * 200})`}>
            <rect x={BOX.x} y={BOX.y} width={BOX.w} height={BOX.h} rx={36} fill={COLORS.panel} stroke={COLORS.panelLine} strokeWidth={5} />
            <text x={BOX.x + 36} y={BOX.y + 58} fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.slate}>
              SPECTROPHOTOMETER
            </text>
            <text x={BOX.x + BOX.w - 36} y={BOX.y + 58} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.beam}>
              λ = 880 nm
            </text>
            {/* 광원 */}
            <g transform={`translate(${SRC_X - 40}, ${BEAM_Y})`}>
              <rect x={-70} y={-70} width={110} height={140} rx={18} fill="#1e293b" stroke={COLORS.slate} strokeWidth={3} />
              <circle r={34} fill={COLORS.beam} opacity={0.3 + fire * 0.7} />
              <circle r={16} fill="#ffffff" opacity={fire} />
              <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={COLORS.slate}>
                광원
              </text>
            </g>
            {/* 큐벳 챔버 */}
            <rect x={CUV.x - 40} y={BEAM_Y - CUV.h / 2 - 50} width={CUV.w + 80} height={CUV.h + 100} rx={16} fill="#0a1226" stroke={COLORS.panelLine} strokeWidth={3} strokeDasharray="12 8" />
            {/* 검출기 */}
            <g transform={`translate(${DET_X + 40}, ${BEAM_Y})`}>
              <rect x={-30} y={-80} width={70} height={160} rx={12} fill="#1e293b" stroke={COLORS.slate} strokeWidth={3} />
              <rect x={-30} y={-60} width={14} height={120} fill={COLORS.cyan} opacity={0.4 + 0.6 * T * fire} />
              <text x={5} y={120} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={COLORS.slate}>
                검출기
              </text>
            </g>
          </g>

          {/* 빔 */}
          {fire > 0 ? (
            <LightBeam x0={SRC_X} xIn={CUV.x} xOut={CUV.x + CUV.w} x2={DET_X} y={BEAM_Y} width={72} transmittance={T} progress={fire} />
          ) : null}

          {/* 큐벳 */}
          <g transform={`translate(${CUV.x}, ${cuvY})`}>
            <rect x={0} y={-40} width={CUV.w} height={CUV.h + 40} rx={8} fill="#ffffff" fillOpacity={0.06} stroke={COLORS.white} strokeWidth={5} />
            <rect x={6} y={20} width={CUV.w - 12} height={CUV.h - 26} rx={4} fill={liquid} opacity={0.7} />
            {/* 몰리브덴 블루 분자 */}
            {Array.from({length: 14}).map((_, i) => (
              <circle
                key={i}
                cx={20 + ((i * 37) % (CUV.w - 40))}
                cy={40 + ((i * 53) % (CUV.h - 70)) + Math.sin(frame * 0.08 + i) * 6}
                r={9}
                fill="#93b4ff"
                opacity={0.8}
              />
            ))}
            <text x={CUV.w / 2} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.white} opacity={1 - insert}>
              큐벳
            </text>
          </g>

          {/* 측정값 */}
          <g opacity={readout} fontFamily={MONO} fontWeight={700}>
            <rect x={80} y={1170} width={920} height={130} rx={22} fill="#050a18" stroke={COLORS.cyan} strokeWidth={3} />
            <text x={130} y={1225} fontSize={30} fill={COLORS.slate}>
              I/I₀ = T
            </text>
            <text x={130} y={1275} fontSize={44} fill={COLORS.white}>
              {(T * 100).toFixed(1)}%
            </text>
            <text x={950} y={1225} textAnchor="end" fontSize={30} fill={COLORS.slate}>
              흡광도 A
            </text>
            <text x={950} y={1275} textAnchor="end" fontSize={56} fill={COLORS.cyan}>
              {A.toFixed(3)}
            </text>
            {frame >= SWEEP ? (
              <text x={540} y={1265} textAnchor="middle" fontSize={30} fill={COLORS.amber}>
                c = {c.toFixed(2)} mg P/L
              </text>
            ) : null}
          </g>

          {/* 비어-람베르트 공식 */}
          <g transform={`translate(540, 1440) scale(${formulaIn})`} opacity={Math.min(1, formulaIn * 1.4)}>
            <rect x={-460} y={-90} width={920} height={250} rx={28} fill={COLORS.panel} stroke={COLORS.panelLine} strokeWidth={3} />
            <text y={-38} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={COLORS.slate}>
              비어-람베르트 법칙
            </text>
            <text y={34} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={52} fill={COLORS.white}>
              A = log(I₀/I) = ε·b·c
            </text>
            <text y={112} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={COLORS.cyan}>
              빛의 흡수량(흡광도) ∝ 용액의 농도
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      <Headline lines={['눈대중은 그만!', '880nm 빛으로 흡광도를 측정한다']} delay={6} top={170} size={64} accent={COLORS.beam} />
      <Subtitle text="※ 880 nm는 보이지 않는 근적외선 (붉은색으로 표현)" delay={FIRE + 20} exitAt={SWEEP - 10} bottom={150} />
      <Subtitle text="농도가 진할수록 빛이 더 많이 흡수된다 (시뮬레이션)" delay={SWEEP} bottom={150} color={COLORS.amber} />
    </SceneFrame>
  );
};
