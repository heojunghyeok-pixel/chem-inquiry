import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Thalidomide} from '../components/ChiralMirror';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('thalidomide');
const CLASH = 200;

/** 흑백 신문 실루엣 */
const Newspaper: React.FC = () => (
  <g>
    <rect x={-300} y={-220} width={600} height={440} fill="#d4d4d4" />
    <rect x={-270} y={-190} width={540} height={70} fill="#404040" />
    <text x={0} y={-140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#e5e5e5">
      1957 · THE DAILY NEWS
    </text>
    {Array.from({length: 9}).map((_, i) => (
      <rect key={i} x={-270} y={-90 + i * 32} width={i % 3 === 2 ? 320 : 540} height={14} fill="#8a8a8a" />
    ))}
    <rect x={90} y={-90} width={180} height={140} fill="#6b6b6b" />
  </g>
);

/** 약병 */
const Bottle: React.FC = () => (
  <g>
    <rect x={-70} y={-170} width={140} height={50} rx={10} fill="#525252" />
    <rect x={-100} y={-120} width={200} height={260} rx={30} fill="#a3a3a3" />
    <rect x={-80} y={-60} width={160} height={110} fill="#e5e5e5" />
    <text y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#262626">
      Thalidomide
    </text>
    <text y={30} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill="#525252">
      50 mg
    </text>
  </g>
);

/** Scene 2: 흑백 다큐 톤 → (R)/(S) 겹쳐지지 않고 튕겨남 */
export const Scene2Thalidomide: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const gray = interpolate(frame, [0, 20], [0, 1], {extrapolateRight: 'clamp'});
  const docIn = spring({frame: frame - 10, fps, config: {damping: 14, stiffness: 90}});
  const docOut = interpolate(frame, [CLASH - 30, CLASH - 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const grain = Math.sin(frame * 1.7) * 0.03;

  // 두 분자가 가운데로 모였다가 겹치지 못하고 튕겨남
  const approach = interpolate(frame, [CLASH, CLASH + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const bounce = spring({frame: frame - CLASH - 40, fps, config: {damping: 8, stiffness: 120}});
  const off = interpolate(approach, [0, 1], [300, 120]) + (frame > CLASH + 40 ? bounce * 150 : 0);
  const clashFlash = interpolate(frame, [CLASH + 40, CLASH + 44, CLASH + 60], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const molIn = spring({frame: frame - CLASH + 10, fps, config: {damping: 12, stiffness: 120}});
  const badges = spring({frame: frame - CLASH - 60, fps, config: {damping: 9, stiffness: 160}});

  return (
    <SceneFrame duration={DURATION} background="#0d0d0d" grid={false}>
      {/* 흑백 다큐 레이어 */}
      <AbsoluteFill style={{filter: `grayscale(${gray}) contrast(1.1)`, opacity: 1 - docOut}}>
        <svg width={1080} height={1920}>
          <g transform={`translate(560, ${980 + (1 - docIn) * 300}) rotate(-4)`} opacity={docIn * 0.9}>
            <Newspaper />
          </g>
          <g transform={`translate(260, ${1250 + (1 - docIn) * 400}) rotate(8)`} opacity={docIn}>
            <Bottle />
          </g>
        </svg>
      </AbsoluteFill>
      {/* 필름 그레인·비네트 */}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)', opacity: 0.9 + grain}} />

      {/* 거울상 충돌 */}
      {frame >= CLASH - 10 ? (
        <AbsoluteFill style={{opacity: molIn}}>
          <svg width={1080} height={1920}>
            <line x1={540} y1={720} x2={540} y2={1300} stroke={COLORS.cyan} strokeWidth={4} strokeDasharray="14 12" opacity={0.7} />
            <g transform={`translate(${540 - off - 100}, 1000) scale(0.75)`}>
              <Thalidomide tint={COLORS.green} />
            </g>
            <g transform={`translate(${540 + off + 100}, 1000) scale(0.75)`}>
              <g transform="scale(-1, 1)">
                <Thalidomide tint={COLORS.red} />
              </g>
            </g>
            <circle cx={540} cy={1000} r={40 + clashFlash * 160} fill="none" stroke="#ffffff" strokeWidth={8} opacity={clashFlash} />
            {/* 방패 / 경고 배지 */}
            <g transform={`translate(${540 - off - 100}, 1270) scale(${badges})`}>
              <path d="M 0 -60 L 50 -40 Q 50 30 0 60 Q -50 30 -50 -40 Z" fill={COLORS.green} />
              <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={COLORS.green}>
                (R)형: 진정 작용
              </text>
            </g>
            <g transform={`translate(${540 + off + 100}, 1270) scale(${badges})`}>
              <polygon points="0,-60 56,44 -56,44" fill={COLORS.red} />
              <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#ffffff">
                !
              </text>
              <text y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={COLORS.red}>
                (S)형: 기형 유발
              </text>
            </g>
          </svg>
        </AbsoluteFill>
      ) : null}

      <Headline lines={['비극을 막는 단 하나의 열쇠:', "원하는 거울상만 만드는 '비대칭 합성'"]} delay={6} top={180} size={60} accent={COLORS.violet} />
      <Subtitle text="1957년 판매된 입덧약 탈리도마이드 → 수많은 신생아 기형" delay={30} exitAt={CLASH - 20} bottom={260} />
      <Subtitle text="※ 탈리도마이드는 몸속에서 R↔S가 서로 바뀌어, 한쪽만 먹어도 안전하지 않았어요" delay={CLASH + 110} bottom={170} />
    </SceneFrame>
  );
};
