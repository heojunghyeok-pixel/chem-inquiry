import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, KeywordText, SceneTransition, sinePath} from '../components/common';
import {COLORS, FONT, PAPER_SHADOW, SCENE_DURATIONS} from '../theme';

const DURATION = SCENE_DURATIONS.scene2;

// 파동 진행 속도(라디안/프레임) — 분자 진동도 같은 주기 사용
const OMEGA = 0.55;

const MOLECULES = [
  {x: 850, y: 760},
  {x: 930, y: 960},
  {x: 840, y: 1160},
  {x: 930, y: 1360},
  {x: 850, y: 1560},
];

const Water: React.FC<{wiggle: number; enter: number; heat: number}> = ({
  wiggle,
  enter,
  heat,
}) => {
  // 산소: 빨강, 수소: 흰색. heat에 따라 산소가 주황빛으로
  const oColor = heat > 0.5 ? COLORS.orange : COLORS.red;
  return (
    <g transform={`scale(${enter}) rotate(${wiggle})`} style={{filter: PAPER_SHADOW}}>
      <line x1={0} y1={0} x2={-62} y2={50} stroke={COLORS.paper} strokeWidth={14} />
      <line x1={0} y1={0} x2={62} y2={50} stroke={COLORS.paper} strokeWidth={14} />
      <circle cx={-62} cy={50} r={34} fill={COLORS.white} />
      <circle cx={62} cy={50} r={34} fill={COLORS.white} />
      <circle cx={0} cy={0} r={58} fill={oColor} />
      <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={COLORS.white}>
        O
      </text>
      <text x={-62} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={COLORS.ink}>
        H
      </text>
      <text x={62} y={64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={COLORS.ink}>
        H
      </text>
    </g>
  );
};

/** Scene 2: 마이크로파 → 물 분자 진동 */
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 왼쪽 발생기(마그네트론) 슬라이드 인
  const emitterIn = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 120}});

  // 파동이 오른쪽으로 뻗어나가는 길이
  const reach = interpolate(frame, [20, 80], [220, 480], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const phase = frame * OMEGA;

  // 분자가 흔들리기 시작하는 세기 (파동 도착 후 증가)
  const intensity = interpolate(frame, [70, 120], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const heat = interpolate(frame, [120, 240], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <SceneTransition duration={DURATION}>
      <Background />
      <KeywordText
        text="마이크로파가 물 분자를 흔든다"
        sub="2.45 GHz 전자기파 → 분자 회전·진동 → 열"
        delay={10}
        top={200}
        size={68}
      />

      <AbsoluteFill>
        <svg width={1080} height={1920} style={{overflow: 'visible'}}>
          {/* 마그네트론(발생기) */}
          <g
            transform={`translate(${interpolate(emitterIn, [0, 1], [-260, 0])}, 0)`}
            style={{filter: PAPER_SHADOW}}
          >
            <rect x={40} y={820} width={180} height={640} rx={30} fill={COLORS.paper} />
            <rect x={80} y={870} width={100} height={540} rx={18} fill={COLORS.ink} />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect
                key={i}
                x={95}
                y={900 + i * 85}
                width={70}
                height={40}
                rx={8}
                fill={COLORS.teal}
                opacity={0.4 + 0.6 * ((Math.sin(frame * 0.4 - i) + 1) / 2)}
              />
            ))}
          </g>

          {/* 사인파 3줄 */}
          {[0, 1, 2].map((i) => {
            const yc = 960 + i * 200;
            return (
              <path
                key={i}
                d={sinePath(230, 230 + reach, yc, 60, 160, phase + i * 0.8)}
                stroke={i === 1 ? COLORS.yellow : COLORS.teal}
                strokeWidth={14}
                fill="none"
                strokeLinecap="round"
                opacity={emitterIn}
              />
            );
          })}

          {/* 물 분자 */}
          {MOLECULES.map((m, i) => {
            const enter = spring({
              frame: frame - 14 - i * 5,
              fps,
              config: {damping: 8, stiffness: 150},
            });
            const wiggle = Math.sin(phase * 1.6 + i * 1.3) * 28 * intensity;
            const shakeX = Math.sin(phase * 2.2 + i) * 14 * intensity;
            return (
              <g key={i} transform={`translate(${m.x + shakeX}, ${m.y})`}>
                <Water wiggle={wiggle} enter={enter} heat={heat} />
                {/* 진동 표시 선 */}
                {intensity > 0.2 ? (
                  <g opacity={intensity} stroke={COLORS.paper} strokeWidth={8} strokeLinecap="round">
                    <line x1={-120} y1={-20} x2={-100} y2={-20} />
                    <line x1={-125} y1={20} x2={-105} y2={20} />
                    <line x1={100} y1={-20} x2={120} y2={-20} />
                    <line x1={105} y1={20} x2={125} y2={20} />
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* 열기(온도) 표시 */}
          <g opacity={heat}>
            {[0, 1, 2].map((i) => {
              const t = ((frame * 2 + i * 40) % 120) / 120;
              return (
                <path
                  key={i}
                  d={`M ${300 + i * 90} ${1640 - t * 140} q 20 -30 0 -60 q -20 -30 0 -60`}
                  stroke={COLORS.orange}
                  strokeWidth={12}
                  fill="none"
                  strokeLinecap="round"
                  opacity={1 - t}
                />
              );
            })}
          </g>
        </svg>
      </AbsoluteFill>
    </SceneTransition>
  );
};
