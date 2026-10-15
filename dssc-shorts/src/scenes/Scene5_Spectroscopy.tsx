import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MBLMeter} from '../components/MBLMeter';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {absorbance, COLORS, FONT, LAMBDA_MAX, LEDS, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('spectro');

// 스펙트럼 그래프
const G = {x: 170, y: 520, w: 820, h: 360};
const NM0 = 400;
const NM1 = 700;
const A_MAX = 1.2;
const px = (nm: number) => G.x + ((nm - NM0) / (NM1 - NM0)) * G.w;
const py = (a: number) => G.y + G.h - (a / A_MAX) * G.h;

// LED 조사 구간 (로컬 프레임)
const LED_TIMES = [
  {start: 190, end: 290},
  {start: 300, end: 400},
  {start: 410, end: 600},
];

/** 파장 → 대략적인 가시광 색 (그래프 무지개 띠용) */
const nmColor = (nm: number) => {
  const stops: [number, string][] = [
    [400, '#7c3aed'],
    [450, '#2563eb'],
    [490, '#06b6d4'],
    [530, '#22c55e'],
    [570, '#eab308'],
    [600, '#f97316'],
    [650, '#ef4444'],
    [700, '#991b1b'],
  ];
  for (let i = stops.length - 1; i >= 0; i--) if (nm >= stops[i][0]) return stops[i][1];
  return stops[0][1];
};

/** Scene 5: 흡광 스펙트럼 → LED별 MBL 광전류 */
export const Scene5Spectroscopy: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const panelIn = spring({frame: frame - 4, fps, config: {damping: 13, stiffness: 120}});
  const draw = interpolate(frame, [30, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const peak = spring({frame: frame - 135, fps, config: {damping: 9, stiffness: 160}});

  let curve = '';
  const nmEnd = NM0 + (NM1 - NM0) * draw;
  for (let nm = NM0; nm <= nmEnd; nm += 4) curve += `${nm === NM0 ? 'M' : 'L'} ${px(nm)} ${py(absorbance(nm))} `;

  // 현재 켜진 LED와 전류
  const ledIdx = LED_TIMES.findIndex((l) => frame >= l.start && frame < l.end);
  const led = ledIdx >= 0 ? LEDS[ledIdx] : null;
  let current = 0;
  let shown = 0;
  if (led) {
    const lt = LED_TIMES[ledIdx];
    // 초록: 강한 오버슈트로 급상승, 빨강·파랑: 완만
    const isGreen = ledIdx === 2;
    const s = spring({
      frame: frame - lt.start - 6,
      fps,
      config: isGreen ? {damping: 6, stiffness: 220} : {damping: 14, stiffness: 80},
    });
    const off = interpolate(frame, [lt.end - 8, lt.end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    current = led.isc * s * (ledIdx === 2 ? 1 : off) + Math.sin(frame * 0.9) * 0.4 * s;
    // 디지털 표시는 측정값을 넘지 않게 (바늘만 오버슈트)
    shown = Math.min(current, led.isc * (ledIdx === 2 ? 1 : off));
  }
  const isPeak = ledIdx === 2 && frame > LED_TIMES[2].start + 25;
  const recorded = (i: number) => frame >= LED_TIMES[i].start + 40;

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 분광광도계 화면 */}
          <g opacity={panelIn} transform={`translate(0, ${(1 - panelIn) * 120})`}>
            <rect x={60} y={440} width={960} height={580} rx={28} fill={COLORS.panel} stroke={COLORS.panelLine} strokeWidth={4} />
            <text x={96} y={490} fontFamily={MONO} fontWeight={700} fontSize={26} fill={COLORS.slate}>
              SPECTROPHOTOMETER · 블루베리 염료 흡광 스펙트럼
            </text>
            {/* λmax 강조 */}
            <rect x={px(LAMBDA_MAX - 25)} y={G.y} width={px(LAMBDA_MAX + 25) - px(LAMBDA_MAX - 25)} height={G.h} fill={COLORS.green} opacity={0.18 * peak} />
            {[0, 0.3, 0.6, 0.9, 1.2].map((a) => (
              <g key={a}>
                <line x1={G.x} y1={py(a)} x2={G.x + G.w} y2={py(a)} stroke={COLORS.panelLine} strokeWidth={2} />
                <text x={G.x - 14} y={py(a) + 8} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={22} fill={COLORS.slate}>
                  {a.toFixed(1)}
                </text>
              </g>
            ))}
            {/* 가시광 무지개 띠 */}
            {Array.from({length: 60}).map((_, i) => {
              const nm = NM0 + (i * (NM1 - NM0)) / 60;
              return <rect key={i} x={px(nm)} y={G.y + G.h + 8} width={G.w / 60 + 1} height={18} fill={nmColor(nm)} />;
            })}
            {[400, 450, 500, 550, 600, 650, 700].map((nm) => (
              <text key={nm} x={px(nm)} y={G.y + G.h + 58} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={COLORS.slate}>
                {nm}
              </text>
            ))}
            <text x={G.x + G.w / 2} y={G.y + G.h + 96} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={COLORS.white}>
              파장 (nm)
            </text>
            <text x={G.x - 80} y={G.y + G.h / 2} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill={COLORS.white} transform={`rotate(-90 ${G.x - 80} ${G.y + G.h / 2})`}>
              흡광도
            </text>
            <path d={curve} stroke={COLORS.neonPurple} strokeWidth={7} fill="none" strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${COLORS.neonPurple})`}} />
            {/* 피크 마커 */}
            <g transform={`translate(${px(LAMBDA_MAX)}, ${py(absorbance(LAMBDA_MAX))}) scale(${peak})`}>
              <circle r={14} fill={COLORS.green} />
              <rect x={-120} y={-80} width={240} height={52} rx={12} fill={COLORS.green} />
              <text y={-43} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={28} fill={COLORS.bg}>
                λmax ≈ {LAMBDA_MAX} nm
              </text>
            </g>
          </g>

          {/* DSSC 셀 + LED */}
          <g transform="translate(220, 1260)">
            {led ? <path d="M -60 -150 L 60 -150 L 130 40 L -130 40 Z" fill={led.color} opacity={0.25 + (isPeak ? 0.15 : 0)} /> : null}
            <rect x={-40} y={-230} width={80} height={80} rx={40} fill={led ? led.color : '#334155'} stroke={COLORS.white} strokeWidth={4} style={led ? {filter: `drop-shadow(0 0 24px ${led.color})`} : undefined} />
            <rect x={-12} y={-150} width={24} height={20} fill={COLORS.slate} />
            <rect x={-130} y={40} width={260} height={170} rx={10} fill={COLORS.fto} opacity={0.3} stroke={COLORS.fto} strokeWidth={4} />
            <rect x={-100} y={60} width={200} height={130} fill={COLORS.dye} />
            <text y={260} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.white}>
              {led ? `${led.name} LED (${led.nm} nm)` : '완성된 DSSC'}
            </text>
          </g>
          {/* 측정 기록 */}
          <g transform="translate(220, 1600)">
            {LEDS.map((l, i) =>
              recorded(i) ? (
                <g key={l.name} transform={`translate(0, ${i * 66})`}>
                  <circle cx={-110} cy={-10} r={16} fill={l.color} />
                  <text x={-80} y={0} fontFamily={MONO} fontWeight={700} fontSize={30} fill={i === 2 ? COLORS.green : COLORS.white}>
                    {l.name} {l.isc} µA
                  </text>
                </g>
              ) : null,
            )}
          </g>

          {/* MBL 전류계 */}
          <g transform="translate(700, 1420) scale(0.82)">
            <MBLMeter value={current} display={shown} color={led ? led.color : COLORS.slate} ledName={led?.name} peak={isPeak} />
          </g>
        </svg>
      </AbsoluteFill>

      <Headline lines={['염료가 좋아하는 빛을 쬐어라!', 'MBL 광전류 피크 달성']} delay={6} top={170} size={64} accent={COLORS.green} />
      <Subtitle text="※ 스펙트럼·전류값은 영상용 예시 (같은 밝기 LED 가정)" delay={200} bottom={60} />
    </SceneFrame>
  );
};
