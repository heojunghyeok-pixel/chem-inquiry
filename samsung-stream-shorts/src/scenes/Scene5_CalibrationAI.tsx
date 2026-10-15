import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CalibrationGraph} from '../components/CalibrationGraph';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FIT, FONT, MONO, SAMPLE_A, SAMPLE_C, sceneDuration} from '../constants';

const DURATION = sceneDuration('calibration');
const GRAPH = {x: 190, y: 560, w: 800, h: 620};

/** 경고 아이콘 (SVG 삼각형) */
const Warn: React.FC = () => (
  <svg width={52} height={46} viewBox="0 0 52 46" style={{flex: '0 0 auto'}}>
    <polygon points="26,2 50,44 2,44" fill={COLORS.amber} />
    <rect x={23} y={14} width={6} height={16} rx={3} fill={COLORS.bg} />
    <circle cx={26} cy={37} r={3.5} fill={COLORS.bg} />
  </svg>
);

/** Scene 5: 표준곡선 피팅 → 시료 투영 → AI 판정 */
export const Scene5CalibrationAI: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const panelIn = spring({frame: frame - 4, fps, config: {damping: 13, stiffness: 120}});
  const line = interpolate(frame, [70, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const project = interpolate(frame, [140, 200], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });
  const eqIn = spring({frame: frame - 115, fps, config: {damping: 10, stiffness: 160}});
  const hud = spring({frame: frame - 215, fps, config: {damping: 9, stiffness: 170}});
  const blink = Math.floor(frame / 8) % 2 === 0;

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <g opacity={panelIn} transform={`translate(0, ${(1 - panelIn) * 120})`}>
            <rect x={40} y={470} width={1000} height={900} rx={30} fill={COLORS.panel} stroke={COLORS.panelLine} strokeWidth={4} />
            <text x={80} y={530} fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.slate}>
              CALIBRATION CURVE · 표준용액 6점
            </text>
            <CalibrationGraph
              x={GRAPH.x}
              y={GRAPH.y}
              w={GRAPH.w}
              h={GRAPH.h}
              pointsDelay={20}
              lineProgress={line}
              sample={{a: SAMPLE_A, c: SAMPLE_C, progress: project}}
            />
          </g>
          {/* 회귀식 */}
          <g transform={`translate(760, 700) scale(${eqIn})`}>
            <rect x={-230} y={-50} width={460} height={110} rx={16} fill="#050a18" stroke={COLORS.cyan} strokeWidth={3} />
            <text y={0} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={COLORS.cyan}>
              y = {FIT.a.toFixed(3)}x + {FIT.b.toFixed(3)}
            </text>
            <text y={42} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.white}>
              R² = {FIT.r2.toFixed(5)}
            </text>
          </g>
          <text x={1010} y={1350} textAnchor="end" fontFamily={FONT} fontWeight={700} fontSize={24} fill={COLORS.slate}>
            ※ 영상용 예시 데이터
          </text>
        </svg>
      </AbsoluteFill>

      {/* AI 판정 HUD */}
      <div style={{position: 'absolute', left: 40, right: 40, top: 1420, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            width: '100%',
            fontFamily: FONT,
            background: 'rgba(5,10,24,0.92)',
            border: `4px solid ${blink ? COLORS.amber : '#b45309'}`,
            borderRadius: 24,
            padding: '26px 30px',
            boxShadow: `0 0 40px ${COLORS.amber}55`,
            transform: `scale(${hud})`,
            opacity: Math.min(1, hud * 1.5),
          }}
        >
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: COLORS.amber, marginBottom: 14}}>AI 수질 판정 · RESULT</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 32, fontWeight: 900, color: COLORS.white, lineHeight: 1.35}}>
            <Warn />
            <span>
              [ 삼성천 인산염: <span style={{color: COLORS.amber}}>{SAMPLE_C.toFixed(2)} mg P/L</span> | 부영양화 주의 단계 ]
            </span>
          </div>
        </div>
      </div>

      <Headline lines={['표준곡선에 대입하면', '정밀 농도가 한눈에!']} delay={6} top={170} size={72} />
    </SceneFrame>
  );
};
