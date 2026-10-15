import React from 'react';
import {AbsoluteFill, Easing, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {TestTube} from '../components/TestTube';
import {Headline, Subtitle, SceneFrame} from '../components/Typography';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';
import {TUBES} from './Scene2_Comparison';

const DURATION = sceneDuration('reagent');

// 시험관(축소 배치)
const TUBE_Y = 1170;
const TUBE_W = 120;
const TUBE_H = 400;

// 피펫이 각 시험관 위에 머무는 구간
const DROP_TIMES = [30, 75, 120];
// 분자 뷰 타임라인
const MOL_START = 170;
const ATTACH = MOL_START + 20; // MoO₄²⁻ 결합
const REDUCE = MOL_START + 130; // 아스코르빈산 환원
const MOL_END = 420;
// 시험관 변색
const COLOR_START = 400;

const PANEL = {x: 80, y: 470, w: 920, h: 600};

/** 마이크로피펫 */
const Pipette: React.FC = () => (
  <g>
    <rect x={-34} y={-330} width={68} height={60} rx={12} fill={COLORS.slate} />
    <rect x={-46} y={-280} width={92} height={150} rx={20} fill="#e2e8f0" />
    <rect x={-20} y={-300} width={40} height={30} rx={6} fill={COLORS.cyan} />
    <path d="M -24 -130 L 24 -130 L 8 0 L -8 0 Z" fill="#f1f5f9" stroke={COLORS.slate} strokeWidth={3} />
    <path d="M -14 -90 L 14 -90 L 6 -6 L -6 -6 Z" fill={COLORS.reagent} opacity={0.9} />
  </g>
);

/** 몰리브덴산 이온 MoO₄²⁻ (단순화된 구) */
const Molybdate: React.FC<{color: string}> = ({color}) => (
  <g>
    <circle r={36} fill={color} />
    <text y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.bg}>
      Mo
    </text>
  </g>
);

const MolecularView: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < MOL_START || frame > MOL_END + 15) return null;

  const panelIn = spring({frame: frame - MOL_START, fps, config: {damping: 12, stiffness: 120}});
  const panelOut = interpolate(frame, [MOL_END, MOL_END + 15], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cx = PANEL.x + PANEL.w / 2;
  const cy = PANEL.y + PANEL.h / 2 + 10;

  // 환원 진행도 → 착물 색 노랑 → 코발트 블루
  const reduce = interpolate(frame, [REDUCE + 30, REDUCE + 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const complexColor = interpolateColors(reduce, [0, 1], [COLORS.reagent, '#3b6cff']);
  const spin = (frame - MOL_START) * 0.4;

  // 아스코르빈산 등장
  const ascIn = spring({frame: frame - REDUCE, fps, config: {damping: 10, stiffness: 120}});

  return (
    <g opacity={panelOut} transform={`translate(${cx}, ${cy}) scale(${panelIn}) translate(${-cx}, ${-cy})`}>
      <rect x={PANEL.x} y={PANEL.y} width={PANEL.w} height={PANEL.h} rx={30} fill={COLORS.panel} stroke={COLORS.panelLine} strokeWidth={4} />
      <text x={PANEL.x + 34} y={PANEL.y + 56} fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.slate}>
        MOLECULAR VIEW
      </text>
      {/* 블루 글로우 */}
      <circle cx={cx} cy={cy} r={200} fill="#3b6cff" opacity={reduce * 0.25} />

      {/* MoO₄²⁻ 12개가 날아와 결합 */}
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + (spin * Math.PI) / 180;
        const s = spring({frame: frame - ATTACH - i * 4, fps, config: {damping: 11, stiffness: 120}});
        const far = 520;
        const near = 150;
        const r = interpolate(s, [0, 1], [far, near]);
        return (
          <g key={i} transform={`translate(${cx + Math.cos(a) * r}, ${cy + Math.sin(a) * r * 0.8})`} opacity={Math.min(1, s * 2)}>
            <line x1={0} y1={0} x2={-Math.cos(a) * 40 * s} y2={-Math.sin(a) * 32 * s} stroke={COLORS.white} strokeWidth={6} />
            <Molybdate color={complexColor} />
          </g>
        );
      })}

      {/* 중심 인산 이온 */}
      <g transform={`translate(${cx}, ${cy})`}>
        <circle r={70} fill={COLORS.phosphorus} />
        <text y={16} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={COLORS.white}>
          PO₄
        </text>
      </g>

      {/* 아스코르빈산 + 전자 */}
      {frame >= REDUCE ? (
        <g>
          <g transform={`translate(${interpolate(ascIn, [0, 1], [PANEL.x + PANEL.w + 150, PANEL.x + PANEL.w - 120])}, ${PANEL.y + 120})`}>
            <polygon points="0,-50 46,-20 36,34 -36,34 -46,-20" fill={COLORS.lime} />
            <text y={14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={COLORS.bg}>
              비타민C
            </text>
          </g>
          {[0, 1, 2, 3, 4].map((k) => {
            const t = ((frame - REDUCE - 15 + k * 8) % 40) / 40;
            if (frame < REDUCE + 15 || frame > REDUCE + 100) return null;
            const sx = PANEL.x + PANEL.w - 120;
            const sy = PANEL.y + 120;
            return (
              <g key={k} transform={`translate(${sx + (cx - sx) * t}, ${sy + (cy - sy) * t})`} opacity={1 - t * 0.5}>
                <circle r={16} fill={COLORS.amber} />
                <text y={7} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={20} fill={COLORS.bg}>
                  e⁻
                </text>
              </g>
            );
          })}
        </g>
      ) : null}

      {/* 반응 단계 라벨 */}
      <text x={cx} y={PANEL.y + PANEL.h - 70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={reduce > 0.5 ? COLORS.water : COLORS.reagent}>
        {frame < REDUCE ? '① PO₄³⁻ + MoO₄²⁻ → 인몰리브덴산 착물 (노랑)' : '② 아스코르빈산이 환원 → 몰리브덴 블루'}
      </text>
      <text x={cx} y={PANEL.y + PANEL.h - 28} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={COLORS.slate}>
        산성 조건 · 몰리브덴산암모늄 + 아스코르빈산
      </text>
    </g>
  );
};

/** Scene 3: 발색 시약 투하 → 분자 반응 → 몰리브덴 블루 변색 */
export const Scene3ReagentReaction: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 피펫 이동: 시험관 1 → 2 → 3
  const pipX = interpolate(frame, [0, DROP_TIMES[0], DROP_TIMES[1], DROP_TIMES[2]], [-200, TUBES[0].x, TUBES[1].x, TUBES[2].x], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const pipOut = interpolate(frame, [DROP_TIMES[2] + 30, DROP_TIMES[2] + 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const pipY = TUBE_Y - 80 - pipOut * 1500;

  // 삼성천 물 변색: 투명 → 하늘색 → 코발트 블루
  const blue = interpolate(frame, [COLOR_START, COLOR_START + 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  const streamColor = interpolateColors(blue, [0, 0.4, 1], [COLORS.clear, COLORS.skyBlue, COLORS.cobalt]);
  const streamOpacity = interpolate(blue, [0, 0.4, 1], [0.25, 0.55, 0.95]);

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {TUBES.map((t, i) => {
            // 시약이 떨어진 뒤 아주 옅은 노란빛 (인이 적은 물)
            const dropped = frame > DROP_TIMES[i] + 14;
            const isStream = i === 2;
            const color = isStream && blue > 0 ? streamColor : dropped ? '#fef9c3' : COLORS.clear;
            const op = isStream && blue > 0 ? streamOpacity : dropped ? 0.3 : 0.22;
            return (
              <TestTube
                key={t.label}
                x={t.x}
                y={TUBE_Y}
                w={TUBE_W}
                h={TUBE_H}
                level={0.7}
                color={color}
                liquidOpacity={op}
                wobble={Math.sin(frame * 0.2 + i) * (dropped ? 6 : 2)}
                label={t.label}
                index={i + 1}
                glow={isStream ? blue : 0}
              />
            );
          })}

          {/* 떨어지는 시약 방울 */}
          {DROP_TIMES.map((dt, i) => {
            const t = interpolate(frame, [dt, dt + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
            if (frame < dt || t >= 1) return null;
            return <ellipse key={i} cx={TUBES[i].x} cy={TUBE_Y - 70 + t * 230} rx={12} ry={16} fill={COLORS.reagent} />;
          })}

          {/* 결과 표시 */}
          {blue > 0.8
            ? TUBES.map((t, i) => {
                const s = spring({frame: frame - COLOR_START - 100 - i * 6, fps, config: {damping: 8, stiffness: 180}});
                const ok = i < 2;
                return (
                  <g key={t.label} transform={`translate(${t.x}, ${TUBE_Y - 60}) scale(${s})`}>
                    <rect x={ok ? -125 : -90} y={-34} width={ok ? 250 : 180} height={60} rx={30} fill={ok ? COLORS.slateDark : COLORS.cobalt} stroke={ok ? COLORS.slate : COLORS.water} strokeWidth={3} />
                    <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.white}>
                      {ok ? '변화 거의 없음' : '인 다량!'}
                    </text>
                  </g>
                );
              })
            : null}

          <g transform={`translate(${pipX}, ${pipY})`}>
            <Pipette />
          </g>

          <MolecularView />
        </svg>
      </AbsoluteFill>

      <Headline lines={['화학 반응의 마법:', '인이 많을수록 짙은 파란색으로!']} delay={6} top={170} size={64} accent={COLORS.water} />
      <Subtitle text="발색 시약: 몰리브덴산암모늄 + 아스코르빈산" delay={20} exitAt={MOL_START - 10} bottom={70} color={COLORS.reagent} />
    </SceneFrame>
  );
};
