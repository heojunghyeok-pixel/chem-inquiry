import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {BlueberryBattery} from '../components/BlueberryBattery';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('hook');
const SPLIT = 120;
const BERRY = 150;
const COMPARE = 270;

const PACK = {w: 760, h: 440};

/** 메탈릭 EV 배터리 팩 (반쪽) */
const PackHalf: React.FC<{side: 'left' | 'right'}> = ({side}) => {
  const w = PACK.w / 2;
  const x = side === 'left' ? -w : 0;
  return (
    <g>
      <rect x={x} y={-PACK.h / 2} width={w} height={PACK.h} fill="url(#metal)" stroke="#cbd5e1" strokeWidth={4} />
      {/* 원통형 셀 격자 */}
      {Array.from({length: 4}).map((_, r) =>
        Array.from({length: 5}).map((__, c) => (
          <g key={`${r}-${c}`} transform={`translate(${x + 40 + c * 72}, ${-PACK.h / 2 + 60 + r * 100})`}>
            <circle r={28} fill="#1f2937" stroke="#64748b" strokeWidth={4} />
            <circle r={10} fill="#94a3b8" />
          </g>
        )),
      )}
      {/* 쪼개진 단면 (톱니) */}
      <path
        d={`M 0 ${-PACK.h / 2} ${Array.from({length: 9})
          .map((_, i) => `L ${i % 2 ? 14 : -14} ${-PACK.h / 2 + ((i + 1) * PACK.h) / 10}`)
          .join(' ')} L 0 ${PACK.h / 2}`}
        stroke={COLORS.neonPurple}
        strokeWidth={6}
        fill="none"
        opacity={0.9}
      />
    </g>
  );
};

/** Scene 1: EV 배터리 팩이 갈라지며 블루베리 등장 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const packIn = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 100}});
  const shake = frame > SPLIT - 25 && frame < SPLIT ? Math.sin(frame * 3) * 8 : 0;
  const split = spring({frame: frame - SPLIT, fps, config: {damping: 14, stiffness: 70}});
  const berry = spring({frame: frame - BERRY, fps, config: {damping: 6, stiffness: 140, mass: 0.9}});
  const sparks = interpolate(frame, [BERRY + 20, BERRY + 35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flash = interpolate(frame, [SPLIT, SPLIT + 4, SPLIT + 16], [0, 0.8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const packOut = interpolate(frame, [COMPARE - 20, COMPARE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const berryY = interpolate(frame, [COMPARE - 20, COMPARE + 10], [1000, 860], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const cmp = (i: number) => spring({frame: frame - COMPARE - i * 10, fps, config: {damping: 10, stiffness: 150}});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <defs>
            <linearGradient id="metal" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="45%" stopColor="#64748b" />
              <stop offset="55%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>

          {/* 배터리 팩 */}
          <g transform={`translate(${540 + shake}, 1000) scale(${packIn})`} opacity={1 - packOut}>
            <g transform={`translate(${-split * 330}, ${split * 40}) rotate(${-split * 14})`}>
              <PackHalf side="left" />
            </g>
            <g transform={`translate(${split * 330}, ${split * 40}) rotate(${split * 14})`}>
              <PackHalf side="right" />
            </g>
            <text y={PACK.h / 2 + 70} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.slate} opacity={1 - split}>
              EV BATTERY PACK · Li-ion
            </text>
          </g>

          {/* 블루베리 */}
          {frame >= BERRY ? (
            <g transform={`translate(540, ${berryY}) scale(${berry})`}>
              <BlueberryBattery r={170} sparks={sparks} />
            </g>
          ) : null}

          {/* 비교 카드: 저장 vs 발전 */}
          {frame >= COMPARE
            ? [
                {x: 290, title: '리튬이온 2차전지', body: '전기를 저장', color: COLORS.slate},
                {x: 790, title: '블루베리 DSSC', body: '빛 → 전기 발전', color: COLORS.neonPurple},
              ].map((c, i) => (
                <g key={c.title} transform={`translate(${c.x}, 1340) scale(${cmp(i)})`}>
                  <rect x={-205} y={-90} width={410} height={180} rx={24} fill={COLORS.panel} stroke={c.color} strokeWidth={4} />
                  <text y={-20} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={c.color}>
                    {c.title}
                  </text>
                  <text y={46} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={36} fill={COLORS.white}>
                    {c.body}
                  </text>
                </g>
              ))
            : null}
          {frame >= COMPARE ? (
            <text x={540} y={1352} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={COLORS.white} opacity={cmp(1)}>
              vs
            </text>
          ) : null}
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{backgroundColor: '#ffffff', opacity: flash, pointerEvents: 'none'}} />

      <Headline lines={['테슬라 배터리 말고...']} delay={10} top={200} size={76} />
      <Headline lines={['블루베리로 전기를?!']} delay={BERRY + 6} top={310} size={96} accent={COLORS.neonPurple} accentAll />
      <Subtitle text="※ DSSC는 저장용 배터리가 아니라 빛으로 발전하는 '태양전지'" delay={COMPARE + 30} bottom={260} />
    </SceneFrame>
  );
};
