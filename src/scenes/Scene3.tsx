import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, Fork, KeywordText, SceneTransition} from '../components/common';
import {COLORS, FONT, PAPER_SHADOW, SCENE_DURATIONS} from '../theme';

const DURATION = SCENE_DURATIONS.scene3;

/** Scene 3: 화면 2분할 — 음식(따뜻함) vs 금속 포크(경고) */
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 가운데 분할선이 위→아래로 그려짐
  const divider = interpolate(frame, [0, 24], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  // 왼쪽 음식 그릇 등장
  const bowlIn = spring({frame: frame - 12, fps, config: {damping: 10, stiffness: 130}});

  // 오른쪽 포크 낙하 (바운스 착지)
  const forkDrop = spring({frame: frame - 70, fps, config: {damping: 7, stiffness: 110, mass: 1.1}});
  const forkY = interpolate(forkDrop, [0, 1], [-700, 1180]);
  const forkRot = interpolate(forkDrop, [0, 1], [-40, 12]);

  // 경고창 팝업 (포크 착지 직후)
  const alertIn = spring({frame: frame - 92, fps, config: {damping: 9, stiffness: 180}});
  const beepOn = frame > 92 && Math.floor((frame - 92) / 8) % 2 === 0;

  // 왼쪽 패널 살짝 어두워지며 오른쪽 강조
  const dimLeft = interpolate(frame, [92, 120], [0, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneTransition duration={DURATION}>
      <Background />

      {/* 오른쪽 붉은 배경 (경고) */}
      <AbsoluteFill
        style={{
          left: 540,
          backgroundColor: COLORS.red,
          opacity: frame > 92 ? (beepOn ? 0.22 : 0.1) : 0,
        }}
      />

      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 분할선 */}
          <line
            x1={540}
            y1={430}
            x2={540}
            y2={430 + 1400 * divider}
            stroke={COLORS.paper}
            strokeWidth={8}
            strokeDasharray="24 18"
          />

          {/* ───── 왼쪽: 음식 ───── */}
          <g transform={`translate(270, 1180) scale(${bowlIn})`} style={{filter: PAPER_SHADOW}}>
            {/* 김(열기) */}
            {[0, 1, 2].map((i) => {
              const t = ((frame + i * 25) % 75) / 75;
              return (
                <path
                  key={i}
                  d={`M ${-80 + i * 80} ${-120 - t * 160} q 26 -36 0 -72 q -26 -36 0 -72`}
                  stroke={COLORS.paper}
                  strokeWidth={14}
                  fill="none"
                  strokeLinecap="round"
                  opacity={(1 - t) * 0.9}
                />
              );
            })}
            {/* 음식 */}
            <ellipse cx={0} cy={-60} rx={170} ry={70} fill={COLORS.orange} />
            <circle cx={-60} cy={-90} r={30} fill={COLORS.yellow} />
            <circle cx={40} cy={-100} r={26} fill="#7ccf6a" />
            {/* 그릇 */}
            <path d="M -210 -60 Q -200 140 0 150 Q 200 140 210 -60 Z" fill={COLORS.paper} />
            <rect x={-80} y={140} width={160} height={24} rx={10} fill={COLORS.paperDark} />
          </g>
          <text
            x={270}
            y={1470}
            textAnchor="middle"
            fontFamily={FONT}
            fontWeight={900}
            fontSize={58}
            fill={COLORS.paper}
            opacity={bowlIn}
          >
            음식 = 따뜻 ✓
          </text>
          <rect x={0} y={420} width={540} height={1500} fill="#000" opacity={dimLeft} />

          {/* ───── 오른쪽: 포크 ───── */}
          {/* 비프 파동 링 */}
          {frame > 92
            ? [0, 1, 2].map((i) => {
                const t = ((frame - 92 + i * 10) % 30) / 30;
                return (
                  <circle
                    key={i}
                    cx={810}
                    cy={1100}
                    r={80 + t * 220}
                    fill="none"
                    stroke={COLORS.red}
                    strokeWidth={10}
                    opacity={1 - t}
                  />
                );
              })
            : null}
          <g transform={`translate(810, ${forkY}) rotate(${forkRot})`} style={{filter: PAPER_SHADOW}}>
            <Fork scale={1.1} />
          </g>

          {/* 경고창 */}
          <g
            transform={`translate(810, 700) scale(${alertIn}) rotate(${interpolate(alertIn, [0, 1], [15, -3])})`}
            style={{filter: PAPER_SHADOW}}
          >
            <rect x={-230} y={-130} width={460} height={260} rx={28} fill={COLORS.red} />
            <rect x={-230} y={-130} width={460} height={60} rx={28} fill="#c92f3a" />
            <circle cx={-190} cy={-100} r={10} fill={COLORS.paper} />
            <circle cx={-160} cy={-100} r={10} fill={COLORS.paper} />
            <polygon
              points="-140,90 -80,-30 -20,90"
              fill={beepOn ? COLORS.yellow : COLORS.paper}
            />
            <text x={-80} y={78} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={COLORS.ink}>
              !
            </text>
            <text x={90} y={20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={COLORS.white}>
              경고
            </text>
            <text x={90} y={86} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={44} fill={COLORS.white}>
              BEEP!
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      <KeywordText text="하지만 금속이라면?" delay={30} top={200} size={88} highlight={COLORS.paper} />
    </SceneTransition>
  );
};
