import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, Bolt, KeywordText, SceneTransition, zigzagPath} from '../components/common';
import {COLORS, FONT, PAPER_SHADOW, SCENE_DURATIONS} from '../theme';

const DURATION = SCENE_DURATIONS.scene5;

const FULL_AT = 150; // 게이지 100% 도달 프레임
const TINES = [-120, -40, 40, 120]; // 포크 날 x 오프셋
const TIP_Y = 1000; // 날 끝 y
const BASE_X = 420;

/** Scene 5: 전하 집중 게이지 100% → 지그재그 번개 + 플래시 */
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const forkIn = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 110}});
  const gaugeIn = spring({frame: frame - 12, fps, config: {damping: 9, stiffness: 140}});

  const charge = interpolate(frame, [24, FULL_AT], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });
  const percent = Math.round(charge * 100);
  const gaugeColor = interpolateColors(charge, [0, 0.6, 1], [COLORS.teal, COLORS.yellow, COLORS.red]);

  const fired = frame >= FULL_AT;
  const since = frame - FULL_AT;

  // 첫 방전의 강한 플래시 + 이후 불규칙 플래시
  const bigFlash = fired
    ? interpolate(since, [0, 2, 14], [0, 1, 0], {extrapolateRight: 'clamp'})
    : 0;
  const smallFlash = fired && since > 14 && since % 11 < 2 ? 0.35 : 0;
  const flash = Math.max(bigFlash, smallFlash);

  // 카메라 쉐이크 (방전 직후 감쇠)
  const shakeAmp = fired ? interpolate(since, [0, 40], [26, 6], {extrapolateRight: 'clamp'}) : charge > 0.85 ? 4 : 0;
  const shakeX = Math.sin(frame * 3.1) * shakeAmp;
  const shakeY = Math.cos(frame * 2.7) * shakeAmp;

  // 번개 그려지는 길이 (stroke-dash)
  const boltDraw = fired ? interpolate(since, [0, 6], [0, 1], {extrapolateRight: 'clamp'}) : 0;
  const boltSeed = Math.floor(frame / 3);

  // 날 끝 전하 표시 (충전량에 따라 커짐)
  const tipGlowR = interpolate(charge, [0, 1], [10, 60]);

  return (
    <SceneTransition duration={DURATION}>
      <Background tint={fired ? '#3d2a55' : undefined} />

      <AbsoluteFill style={{transform: `translate(${shakeX}px, ${shakeY}px)`}}>
        <svg width={1080} height={1920} style={{overflow: 'visible'}}>
          {/* 포크 (뾰족한 날) */}
          <g
            style={{
              filter: PAPER_SHADOW,
              transformOrigin: `${BASE_X}px 1500px`,
              transform: `translateY(${interpolate(forkIn, [0, 1], [700, 0])}px)`,
            }}
          >
            <rect x={BASE_X - 30} y={1300} width={60} height={560} rx={30} fill={COLORS.metal} />
            <path
              d={`M ${BASE_X - 160} 1180 Q ${BASE_X - 160} 1330 ${BASE_X} 1330 Q ${BASE_X + 160} 1330 ${BASE_X + 160} 1180 Z`}
              fill={COLORS.metal}
            />
            {TINES.map((dx) => (
              <polygon
                key={dx}
                points={`${BASE_X + dx - 24},1190 ${BASE_X + dx + 24},1190 ${BASE_X + dx},${TIP_Y}`}
                fill={COLORS.metal}
              />
            ))}
          </g>

          {/* 날 끝 전하 집중 글로우 */}
          {TINES.map((dx, i) => (
            <circle
              key={dx}
              cx={BASE_X + dx}
              cy={TIP_Y}
              r={tipGlowR * (0.85 + 0.15 * Math.sin(frame * 0.8 + i))}
              fill={gaugeColor}
              opacity={0.35 + charge * 0.5}
            />
          ))}

          {/* 번개 */}
          {fired
            ? TINES.map((dx, i) => {
                const x1 = BASE_X + dx;
                const targets = [
                  [100, 600],
                  [300, 480],
                  [540, 470],
                  [720, 560],
                ];
                const [tx, ty] = targets[i];
                const d = zigzagPath(x1, TIP_Y, tx, ty, 8, 46, `b5-${i}-${boltSeed}`);
                const visible = (boltSeed + i) % 4 !== 0; // 깜빡임
                return (
                  <g
                    key={dx}
                    style={{
                      strokeDasharray: 1400,
                      strokeDashoffset: 1400 * (1 - boltDraw),
                    }}
                  >
                    <Bolt d={d} width={12} opacity={visible ? 1 : 0.15} />
                    {/* 가지 번개 */}
                    <Bolt
                      d={zigzagPath(
                        (x1 + tx) / 2,
                        (TIP_Y + ty) / 2,
                        (x1 + tx) / 2 + (i % 2 ? 120 : -120),
                        (TIP_Y + ty) / 2 - 80,
                        4,
                        24,
                        `b5br-${i}-${boltSeed}`,
                      )}
                      width={6}
                      opacity={visible ? 0.8 : 0}
                    />
                  </g>
                );
              })
            : null}

          {/* 전하 집중 게이지 */}
          <g
            transform={`translate(860, 1080) scale(${gaugeIn})`}
            style={{filter: PAPER_SHADOW}}
          >
            <rect x={-70} y={-360} width={140} height={720} rx={70} fill={COLORS.paper} />
            <rect x={-46} y={-336} width={92} height={672} rx={46} fill={COLORS.ink} />
            <rect
              x={-46}
              y={336 - 672 * charge}
              width={92}
              height={672 * charge}
              rx={46}
              fill={gaugeColor}
            />
            <text
              y={440}
              textAnchor="middle"
              fontFamily={FONT}
              fontWeight={900}
              fontSize={fired ? 78 : 64}
              fill={fired ? COLORS.red : COLORS.paper}
            >
              {percent}%
            </text>
            <text y={-400} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} fill={COLORS.paper}>
              전하 집중
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      <KeywordText
        text={fired ? '임계치 도달: 아크 방전' : '전하가 쌓이는 중...'}
        sub={fired ? '공기의 절연이 깨지며 스파크 발생' : '뾰족할수록 전기장이 강해져요'}
        delay={fired ? FULL_AT : 6}
        top={190}
        size={fired ? 76 : 70}
        highlight={fired ? COLORS.red : COLORS.yellow}
        color={COLORS.paper}
      />

      {/* 플래시 */}
      <AbsoluteFill style={{backgroundColor: '#fffbe6', opacity: flash, pointerEvents: 'none'}} />
    </SceneTransition>
  );
};
