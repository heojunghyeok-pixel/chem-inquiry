import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {COLORS, EE, FONT, FPS, MONO, PCT_R, PCT_S} from '../constants';

/**
 * 효모 환원효소 활성 자리에서 케톤이 한쪽 면으로만 수소를 받는 생체 환원 (SVG <g>, 원점 = 효소 중심).
 * 평면형 케톤(에틸 아세토아세테이트)은 기울인 평면(skew)으로 그려 "판"처럼 보이게 하고,
 * 조효소 NAD(P)H 는 위쪽에서만 H⁻ 를 건넨다.
 * - t: 로컬 프레임
 */
export const YEAST_TIMELINE = {enzyme: 0, dock: 40, hydride: 130, convert: 195, release: 250, result: 300};

const T = YEAST_TIMELINE;
const ease = (t: number, a: number, b: number, fn = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: fn});

// 분자 평면 변환: 가로 유지, 세로 압축 + 기울임 → 바닥에 놓인 판
const PLANE = 'matrix(1 0 -0.5 0.42 0 0)';
const toScreen = (x: number, y: number): [number, number] => [x - 0.5 * y, 0.42 * y];

// 에틸 아세토아세테이트 지그재그 (평면 좌표)
const CHAIN: [number, number][] = [
  [-170, 40],
  [-100, -10], // C3 (케톤 탄소, 반응 자리)
  [-30, 40],
  [40, -10], // 에스터 C
  [110, 40], // O
  [180, -10],
  [250, 40],
];
const KETONE = CHAIN[1];

export const YeastEnzymeReaction: React.FC<{t: number}> = ({t}) => {
  const enzymeIn = spring({frame: t - T.enzyme, fps: FPS, config: {damping: 12, stiffness: 110}});
  const dock = ease(t, T.dock, T.dock + 60, Easing.out(Easing.back(1.2)));
  const hydride = ease(t, T.hydride, T.hydride + 45, Easing.in(Easing.quad));
  const convert = ease(t, T.convert, T.convert + 30);
  const release = ease(t, T.release, T.release + 40, Easing.inOut(Easing.cubic));
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.25);

  const molX = interpolate(dock, [0, 1], [-700, 0]) + release * 760;
  const [kx, ky] = toScreen(KETONE[0], KETONE[1]);

  return (
    <g>
      {/* 효소 (위/아래 두 덩어리 사이 틈 = 활성 자리) */}
      <g opacity={enzymeIn} transform={`scale(${0.85 + enzymeIn * 0.15})`}>
        <path d="M -340 -110 Q -360 -380 0 -400 Q 360 -380 360 -110 L 360 -110 Q 0 -150 -340 -110 Z" fill="#3b2a6e" stroke={COLORS.violet} strokeWidth={5} />
        <path d="M -340 110 Q 0 150 360 110 Q 360 380 0 400 Q -360 380 -340 110 Z" fill="#3b2a6e" stroke={COLORS.violet} strokeWidth={5} />
        <path d="M 330 -120 Q 380 0 330 120" stroke={COLORS.violet} strokeWidth={5} fill="#2a1d55" />
        <text x={0} y={330} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={COLORS.violet}>
          효모 환원효소 · 카이랄 활성 자리
        </text>
        {/* 조효소 NAD(P)H: 위쪽 면에만 존재 */}
        <g transform={`translate(${kx}, -230)`}>
          <rect x={-130} y={-42} width={260} height={84} rx={20} fill={COLORS.panel} stroke={COLORS.hydrogen} strokeWidth={4} />
          <text y={12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={32} fill={COLORS.hydrogen}>
            NAD(P)H
          </text>
        </g>
        {/* 아래쪽 면 차단 */}
        <g transform={`translate(${kx}, 200)`} opacity={ease(t, T.hydride, T.hydride + 20)}>
          <circle r={34} fill="none" stroke={COLORS.red} strokeWidth={6} />
          <path d="M -22 -22 L 22 22 M 22 -22 L -22 22" stroke={COLORS.red} strokeWidth={7} strokeLinecap="round" />
          <text x={50} y={12} fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.red}>
            아래쪽 면: 막힘
          </text>
        </g>
      </g>

      {/* 케톤 / 알코올 분자 판 */}
      <g transform={`translate(${molX}, 0)`}>
        <g transform={PLANE}>
          <rect x={-220} y={-60} width={510} height={150} rx={30} fill={COLORS.cyan} opacity={0.12} stroke={COLORS.cyan} strokeOpacity={0.5} strokeWidth={4} />
          <polyline points={CHAIN.map((p) => p.join(',')).join(' ')} fill="none" stroke={COLORS.white} strokeWidth={9} strokeLinejoin="round" />
          {/* 케톤 C=O (평면 안) → 환원 후 C–OH */}
          <line x1={KETONE[0]} y1={KETONE[1]} x2={KETONE[0]} y2={KETONE[1] - 80} stroke={COLORS.white} strokeWidth={9} />
          {convert < 0.5 ? <line x1={KETONE[0] + 16} y1={KETONE[1] - 4} x2={KETONE[0] + 16} y2={KETONE[1] - 76} stroke={COLORS.white} strokeWidth={7} /> : null}
          {/* 에스터 C=O */}
          <line x1={CHAIN[3][0]} y1={CHAIN[3][1]} x2={CHAIN[3][0]} y2={CHAIN[3][1] - 80} stroke={COLORS.white} strokeWidth={9} />
          <line x1={CHAIN[3][0] + 16} y1={CHAIN[3][1] - 4} x2={CHAIN[3][0] + 16} y2={CHAIN[3][1] - 76} stroke={COLORS.white} strokeWidth={7} />
          <circle cx={CHAIN[3][0] + 8} cy={CHAIN[3][1] - 96} r={22} fill={COLORS.oxygen} />
          <circle cx={CHAIN[4][0]} cy={CHAIN[4][1]} r={22} fill={COLORS.oxygen} />
          <circle cx={KETONE[0] + 8} cy={KETONE[1] - 96} r={24} fill={COLORS.oxygen} />
        </g>
        {/* 반응 탄소 강조 */}
        <circle cx={kx} cy={ky} r={20 + pulse * 6} fill={convert > 0.5 ? COLORS.pink : COLORS.amber} opacity={0.9} />
        <text x={kx - 60} y={ky + 70} fontFamily={MONO} fontWeight={700} fontSize={28} fill={convert > 0.5 ? COLORS.pink : COLORS.amber} opacity={dock * (1 - release)}>
          C 산화수 {convert > 0.5 ? '0' : '+2'}
        </text>
        {convert > 0.5 ? (
          <g opacity={convert}>
            <text x={kx - 20} y={ky - 60} fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.oxygen}>
              OH
            </text>
            <text x={kx + 30} y={ky - 10} fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.pink}>
              (S)
            </text>
          </g>
        ) : null}
      </g>

      {/* H⁻ 전달 (위쪽 면에서만) */}
      {t >= T.hydride && t < T.convert + 20 ? (
        <g>
          <line x1={kx} y1={-190} x2={kx} y2={ky - 30} stroke={COLORS.hydrogen} strokeWidth={4} strokeDasharray="10 10" opacity={0.6} />
          <g transform={`translate(${kx}, ${interpolate(hydride, [0, 1], [-190, ky - 26])})`} opacity={1 - convert}>
            <circle r={26} fill={COLORS.hydrogen} style={{filter: `drop-shadow(0 0 14px ${COLORS.hydrogen})`}} />
            <text y={10} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={26} fill={COLORS.bg}>
              H⁻
            </text>
          </g>
          <text x={kx + 50} y={-120} fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.hydrogen}>
            위쪽 면으로만 수소 전달
          </text>
        </g>
      ) : null}

      {/* 결과: (S) vs (R) 비율 */}
      {t >= T.result ? (
        <g transform="translate(-400, 480)">
          {[
            {label: '(S)형 알코올', pct: PCT_S, color: COLORS.pink},
            {label: '(R)형 알코올', pct: PCT_R, color: COLORS.slate},
          ].map((b, i) => {
            const g = spring({frame: t - T.result - i * 8, fps: FPS, config: {damping: 14, stiffness: 120}});
            return (
              <g key={b.label} transform={`translate(0, ${i * 80})`}>
                <text x={0} y={36} fontFamily={FONT} fontWeight={900} fontSize={32} fill={b.color}>
                  {b.label}
                </text>
                <rect x={230} y={8} width={480} height={40} rx={20} fill={COLORS.panelLine} />
                <rect x={230} y={8} width={480 * (b.pct / 100) * g} height={40} rx={20} fill={b.color} />
                <text x={730} y={38} fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.white}>
                  {(b.pct * g).toFixed(1)}%
                </text>
              </g>
            );
          })}
          <text x={400} y={210} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.cyan} opacity={ease(t, T.result + 30, T.result + 50)}>
            ee = {PCT_S.toFixed(1)} − {PCT_R.toFixed(1)} = {Math.round(EE * 100)}%
          </text>
        </g>
      ) : null}
    </g>
  );
};
