import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  Background,
  Bolt,
  KeywordText,
  SceneTransition,
  zigzagPath,
} from '../components/common';
import {COLORS, PAPER_SHADOW, SCENE_DURATIONS} from '../theme';

const DURATION = SCENE_DURATIONS.scene1;

// 전자레인지 내부(창) 좌표 — 전자레인지 그룹 로컬 좌표계
const CAVITY = {x: 60, y: 60, w: 560, h: 380};

/** Scene 1: 후킹 — 전자레인지 팝업 → 문 열림 → 은박지 공 투입 → 스파크 */
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 전자레인지 팝업 (쫀득한 바운스)
  const pop = spring({frame: frame - 4, fps, config: {damping: 8, stiffness: 120}});

  // 문 열림/닫힘: 열림 22~40, 닫힘 72~84
  const doorOpen = spring({frame: frame - 22, fps, config: {damping: 14, stiffness: 110}});
  const doorClose = spring({frame: frame - 72, fps, config: {damping: 12, stiffness: 160}});
  const door = doorOpen - doorClose; // 1 = 완전히 열림

  // 은박지 공: 화면 위에서 포물선으로 날아와 내부로
  const ballT = interpolate(frame, [38, 66], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });
  const ballLand = spring({frame: frame - 66, fps, config: {damping: 6, stiffness: 200}});
  const ballX = interpolate(ballT, [0, 1], [900, 330]);
  const ballY =
    interpolate(ballT, [0, 1], [-420, 330]) - Math.sin(ballT * Math.PI) * 220 -
    (frame > 66 ? (1 - ballLand) * 30 : 0);
  const ballRot = ballT * 540;

  // 스파크: 문 닫힌 뒤 깜빡임
  const sparkOn = frame > 86;
  const flicker = sparkOn && (Math.floor(frame / 2) % 3 !== 0);
  const shake = sparkOn ? Math.sin(frame * 2.3) * 6 : 0;
  const glow = sparkOn ? interpolate(Math.sin(frame * 1.7), [-1, 1], [0.2, 0.8]) : 0;

  return (
    <SceneTransition duration={DURATION}>
      <Background tint={sparkOn ? '#2b2a4d' : undefined} />
      <KeywordText text="전자레인지 X 금속" sub="= 불꽃 쇼?!" delay={8} top={220} size={92} />

      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', top: 200}}>
        <svg
          width={900}
          height={720}
          viewBox="-60 -60 900 720"
          style={{
            overflow: 'visible',
            filter: PAPER_SHADOW,
            transform: `scale(${pop}) translateX(${shake}px) rotate(${interpolate(pop, [0, 1], [-10, 0])}deg)`,
          }}
        >
          {/* 본체 */}
          <rect x={0} y={0} width={780} height={500} rx={36} fill={COLORS.paper} />
          {/* 내부 공간 */}
          <rect
            x={CAVITY.x}
            y={CAVITY.y}
            width={CAVITY.w}
            height={CAVITY.h}
            rx={18}
            fill="#1d2b4a"
          />
          {/* 내부 조명/스파크 글로우 */}
          <rect
            x={CAVITY.x}
            y={CAVITY.y}
            width={CAVITY.w}
            height={CAVITY.h}
            rx={18}
            fill={COLORS.yellow}
            opacity={glow * 0.35}
          />
          {/* 회전 접시 */}
          <ellipse cx={330} cy={400} rx={200} ry={26} fill="#2f4170" />

          {/* 은박지 공 */}
          {frame > 36 ? (
            <g transform={`translate(${ballX - 0}, ${ballY}) rotate(${ballRot})`}>
              <polygon
                points="0,-46 30,-36 46,-8 40,26 14,46 -20,42 -44,20 -42,-14 -24,-38"
                fill={COLORS.metal}
              />
              <polygon points="-10,-30 18,-24 10,0 -16,-6" fill="#e9eef3" />
              <polygon points="6,8 28,14 14,32 -4,26" fill={COLORS.metalDark} />
            </g>
          ) : null}

          {/* 스파크 (지그재그) */}
          {flicker ? (
            <g>
              {[0, 1, 2, 3, 4].map((i) => {
                const angle = (i / 5) * Math.PI * 2 + frame * 0.2;
                const r = 90 + (i % 2) * 40;
                return (
                  <Bolt
                    key={i}
                    d={zigzagPath(
                      330,
                      330,
                      330 + Math.cos(angle) * r,
                      330 + Math.sin(angle) * r * 0.7,
                      5,
                      16,
                      `s1-${i}-${Math.floor(frame / 2)}`,
                    )}
                    width={7}
                  />
                );
              })}
            </g>
          ) : null}

          {/* 컨트롤 패널 */}
          <rect x={650} y={60} width={90} height={60} rx={10} fill={COLORS.ink} />
          <text
            x={695}
            y={102}
            textAnchor="middle"
            fill={sparkOn && flicker ? COLORS.red : COLORS.teal}
            fontSize={30}
            fontWeight={900}
            fontFamily="monospace"
          >
            {sparkOn ? '!!' : '0:30'}
          </text>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={695} cy={180 + i * 80} r={26} fill={COLORS.paperDark} />
          ))}
          {/* 받침 */}
          <rect x={60} y={500} width={80} height={24} rx={8} fill={COLORS.paperDark} />
          <rect x={640} y={500} width={80} height={24} rx={8} fill={COLORS.paperDark} />

          {/* 문: 왼쪽 경첩 기준으로 scaleX 하여 열림 표현 */}
          <g
            style={{
              transformOrigin: '30px 250px',
              transform: `scaleX(${interpolate(door, [0, 1], [1, -0.18])})`,
            }}
          >
            {/* 문 프레임(가운데 창은 뚫려 있음) */}
            <path
              fillRule="evenodd"
              fill={COLORS.paperDark}
              d={`M 56 30 H 624 Q 650 30 650 56 V 444 Q 650 470 624 470 H 56 Q 30 470 30 444 V 56 Q 30 30 56 30 Z
                  M ${CAVITY.x + 24} ${CAVITY.y + 24} H ${CAVITY.x + CAVITY.w - 24} V ${CAVITY.y + CAVITY.h - 24} H ${CAVITY.x + 24} Z`}
            />
            {/* 유리 */}
            <rect
              x={CAVITY.x + 24}
              y={CAVITY.y + 24}
              width={CAVITY.w - 48}
              height={CAVITY.h - 48}
              fill="#9fd3ff"
              opacity={0.12}
            />
            <path
              d={`M ${CAVITY.x + 60} ${CAVITY.y + 40} L ${CAVITY.x + 20 + 60} ${CAVITY.y + 40} L ${CAVITY.x + 40} ${CAVITY.y + 140} L ${CAVITY.x + 30} ${CAVITY.y + 140} Z`}
              fill="#ffffff"
              opacity={0.25}
            />
            <rect x={600} y={170} width={22} height={160} rx={11} fill={COLORS.ink} />
          </g>
        </svg>
      </AbsoluteFill>

      {/* 번쩍 플래시 */}
      <AbsoluteFill
        style={{
          backgroundColor: COLORS.yellow,
          opacity: sparkOn && frame % 9 === 0 ? 0.18 : 0,
        }}
      />
    </SceneTransition>
  );
};
