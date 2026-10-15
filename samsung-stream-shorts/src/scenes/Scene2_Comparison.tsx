import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TestTube} from '../components/TestTube';
import {Headline, Subtitle, SceneFrame} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('comparison');

export const TUBES = [
  {x: 250, label: '수돗물'},
  {x: 540, label: '생수'},
  {x: 830, label: '삼성천 물'},
];
const TUBE_Y = 760;
const SCAN_START = 120;
const SCAN_END = 300;

/** 물음표 배지 */
const Question: React.FC<{s: number}> = ({s}) => (
  <g transform={`scale(${s})`}>
    <circle r={46} fill={COLORS.amber} />
    <text y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={COLORS.bg}>
      ?
    </text>
  </g>
);

/** Scene 2: 투명한 3개 시험관 비교 */
export const Scene2Comparison: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 돋보기 스캔 (좌 → 우)
  const scan = interpolate(frame, [SCAN_START, SCAN_END], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const magX = interpolate(scan, [0, 1], [100, 980]);
  const magY = TUBE_Y + 300 + Math.sin(scan * Math.PI * 3) * 40;
  const magIn = spring({frame: frame - SCAN_START + 10, fps, config: {damping: 12, stiffness: 140}});
  const magOut = interpolate(frame, [SCAN_END, SCAN_END + 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {TUBES.map((t, i) => {
            const s = spring({frame: frame - 10 - i * 8, fps, config: {damping: 9, stiffness: 130}});
            const passed = magX > t.x;
            const passFrame = SCAN_START + (SCAN_END - SCAN_START) * ((t.x - 100) / 880);
            const q = spring({frame: frame - passFrame, fps, config: {damping: 7, stiffness: 200}});
            return (
              <g key={t.label}>
                <g transform={`translate(0, ${(1 - s) * 900})`}>
                  <TestTube x={t.x} y={TUBE_Y} level={0.72} color={COLORS.clear} liquidOpacity={0.22} wobble={Math.sin(frame * 0.1 + i) * 6} label={t.label} index={i + 1} />
                </g>
                {passed ? (
                  <g transform={`translate(${t.x}, ${TUBE_Y - 90 + Math.sin(frame * 0.12 + i) * 8})`}>
                    <Question s={q} />
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* 돋보기 */}
          <g transform={`translate(${magX}, ${magY}) scale(${magIn * magOut}) rotate(-20)`}>
            <circle r={110} fill={COLORS.white} fillOpacity={0.08} stroke={COLORS.white} strokeWidth={14} />
            <rect x={-16} y={110} width={32} height={150} rx={14} fill={COLORS.slate} />
            <path d="M -60 -40 A 70 70 0 0 1 -10 -80" stroke="#ffffff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.7} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* 판정 불가 배너 */}
      {frame > SCAN_END + 10 ? (
        <div style={{position: 'absolute', top: 1560, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: 48,
              color: COLORS.bg,
              background: COLORS.amber,
              padding: '18px 40px',
              borderRadius: 18,
              transform: `scale(${spring({frame: frame - SCAN_END - 10, fps, config: {damping: 8, stiffness: 180}})}) rotate(-2deg)`,
            }}
          >
            육안 구별 불가 (오염도 0%?)
          </div>
        </div>
      ) : null}

      <Headline lines={['겉보기엔 다 똑같이 맑은데...', '과연 안전할까?']} delay={6} top={190} size={68} />
      <Subtitle text="인산염은 물에 녹으면 색도 냄새도 없다" delay={SCAN_END + 40} bottom={180} />
    </SceneFrame>
  );
};
