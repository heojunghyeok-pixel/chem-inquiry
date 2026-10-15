import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, KeywordText, SceneTransition, sinePath} from '../components/common';
import {COLORS, FONT, PAPER_SHADOW, SCENE_DURATIONS} from '../theme';

const DURATION = SCENE_DURATIONS.scene4;

// 금속 막대(오른쪽 끝이 뾰족) — 화면 좌표
const BAR = {left: 110, right: 830, top: 820, bottom: 1240, tipX: 1000};
const TIP = {x: BAR.tipX - 40, y: (BAR.top + BAR.bottom) / 2};
const BAR_PATH = `M ${BAR.left} ${BAR.top} H ${BAR.right} L ${BAR.tipX} ${TIP.y} L ${BAR.right} ${BAR.bottom} H ${BAR.left} Z`;

const ION_COLS = 7;
const ION_ROWS = 4;
const ELECTRONS = 34;

/** Scene 4: 금속 격자 속 자유전자가 오른쪽 끝으로 쏠리며 과열 */
export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const barIn = spring({frame: frame - 6, fps, config: {damping: 11, stiffness: 100}});

  // 쏠림 진행도 (감속 이징)
  const shift = interpolate(frame, [90, 330], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const heat = interpolate(frame, [220, 380], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 왼쪽에서 들어오는 파동
  const waveReach = interpolate(frame, [40, 100], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  const phase = frame * 0.45;

  const tipColor = interpolateColors(heat, [0, 0.6, 1], [COLORS.metal, COLORS.orange, COLORS.red]);
  const heatPulse = heat * (0.75 + 0.25 * Math.sin(frame * 0.5));

  return (
    <SceneTransition duration={DURATION}>
      <Background tint={interpolateColors(heat, [0, 1], ['#1a2a4d', '#3a1f33'])} />
      <KeywordText
        text="자유전자의 쏠림 현상"
        sub="전기장에 밀린 전자가 뾰족한 끝으로!"
        delay={10}
        top={200}
        size={80}
      />

      <AbsoluteFill>
        <svg width={1080} height={1920} style={{overflow: 'visible'}}>
          <defs>
            <linearGradient id="barHeat" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={COLORS.metal} />
              <stop offset={`${interpolate(heat, [0, 1], [100, 45])}%`} stopColor={COLORS.metal} />
              <stop offset="100%" stopColor={tipColor} />
            </linearGradient>
            <radialGradient id="tipGlow">
              <stop offset="0%" stopColor={COLORS.red} stopOpacity={0.9} />
              <stop offset="100%" stopColor={COLORS.red} stopOpacity={0} />
            </radialGradient>
            <clipPath id="barClip">
              <path d={BAR_PATH} />
            </clipPath>
          </defs>

          {/* 입사 파동 */}
          <g opacity={waveReach}>
            {[0, 1].map((i) => (
              <path
                key={i}
                d={sinePath(0, 60 + 1000 * waveReach, 1420 + i * 90, 34, 140, phase + i)}
                stroke={COLORS.teal}
                strokeWidth={10}
                fill="none"
                strokeLinecap="round"
              />
            ))}
            {/* 진행 방향 화살표 */}
            <g transform={`translate(${interpolate(frame % 40, [0, 40], [200, 760])}, 1620)`}>
              <polygon points="0,-24 40,0 0,24" fill={COLORS.teal} />
              <rect x={-80} y={-8} width={80} height={16} fill={COLORS.teal} />
            </g>
            <text x={540} y={1720} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={44} fill={COLORS.teal}>
              마이크로파 전기장 →
            </text>
          </g>

          {/* 과열 글로우 */}
          <circle cx={TIP.x} cy={TIP.y} r={260} fill="url(#tipGlow)" opacity={heatPulse} />

          {/* 금속 막대 */}
          <g
            style={{
              filter: PAPER_SHADOW,
              transformOrigin: '540px 1030px',
              transform: `scale(${barIn})`,
            }}
          >
            <path d={BAR_PATH} fill="url(#barHeat)" />
            <g clipPath="url(#barClip)">
              {/* 금속 양이온 격자 */}
              {Array.from({length: ION_COLS * ION_ROWS}).map((_, idx) => {
                const c = idx % ION_COLS;
                const r = Math.floor(idx / ION_COLS);
                const cx = BAR.left + 70 + c * 100;
                const cy = BAR.top + 70 + r * 93;
                const vib = Math.sin(frame * 0.6 + idx) * 3 * (1 + heat * 2);
                return (
                  <g key={idx} transform={`translate(${cx + vib}, ${cy})`}>
                    <circle r={30} fill={COLORS.metalDark} />
                    <text y={13} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={COLORS.paper}>
                      +
                    </text>
                  </g>
                );
              })}

              {/* 자유전자 */}
              {Array.from({length: ELECTRONS}).map((_, i) => {
                const sx = BAR.left + 30 + random(`ex${i}`) * 700;
                const sy = BAR.top + 30 + random(`ey${i}`) * 360;
                // 목표: 뾰족한 끝 근처 좁은 부채꼴
                const ang = (random(`ea${i}`) - 0.5) * 1.6;
                const rad = 30 + random(`er${i}`) * 150;
                const tx = TIP.x - 40 - Math.cos(ang) * rad;
                const ty = TIP.y + Math.sin(ang) * rad * 0.9;
                // 개별 지연으로 몰려가는 느낌
                const delay = random(`ed${i}`) * 0.3;
                const p = interpolate(shift, [delay, delay + 0.7], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: Easing.out(Easing.back(1.4)),
                });
                const jitter = 1 - p * 0.7;
                const jx = Math.sin(frame * 0.35 + i * 2.1) * 14 * jitter + Math.sin(phase) * 10 * waveReach;
                const jy = Math.cos(frame * 0.3 + i * 1.7) * 14 * jitter;
                const x = interpolate(p, [0, 1], [sx, tx]) + jx;
                const y = interpolate(p, [0, 1], [sy, ty]) + jy;
                return (
                  <g key={i} transform={`translate(${x}, ${y})`}>
                    <circle r={17} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={4} />
                    <rect x={-8} y={-2.5} width={16} height={5} rx={2} fill={COLORS.ink} />
                  </g>
                );
              })}
            </g>
          </g>

          {/* 범례 */}
          <g opacity={barIn} transform="translate(160, 1330)">
            <circle r={17} fill={COLORS.yellow} stroke={COLORS.ink} strokeWidth={4} />
            <text x={34} y={14} fontFamily={FONT} fontWeight={700} fontSize={38} fill={COLORS.paper}>
              자유전자
            </text>
            <circle cx={260} r={22} fill={COLORS.metalDark} />
            <text x={292} y={14} fontFamily={FONT} fontWeight={700} fontSize={38} fill={COLORS.paper}>
              금속 양이온
            </text>
          </g>

          {/* 과열 라벨 */}
          <g
            opacity={heat}
            transform={`translate(${TIP.x - 60}, ${BAR.top - 70}) scale(${0.8 + heatPulse * 0.25})`}
          >
            <text textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={COLORS.red}>
              HOT!
            </text>
          </g>
        </svg>
      </AbsoluteFill>
    </SceneTransition>
  );
};
