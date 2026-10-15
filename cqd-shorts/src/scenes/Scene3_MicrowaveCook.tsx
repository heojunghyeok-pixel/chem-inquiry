import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MicrowaveFoam} from '../components/MicrowaveFoam';
import {Chip, Headline, SceneFrame, Subtitle} from '../components/Typography';
import {COLORS, FONT, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('cook');

// 가열 펄스 (화면에서는 20초를 빠르게 재생)
const PULSES = [
  {start: 50, end: 140},
  {start: 160, end: 250},
  {start: 270, end: 360},
];
const CENTRIFUGE = 380;
const FILTER = 520;

/** 원심분리기 (위에서 본 로터) */
const Centrifuge: React.FC<{t: number}> = ({t}) => {
  const spin = interpolate(t, [0, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
  const slow = interpolate(t, [110, 140], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.quad)});
  const speed = spin * slow;
  // 각도 = 속도 적분 근사
  const angle = t * 40 * speed;
  const rpm = Math.round(speed * 10000);
  return (
    <g>
      <circle r={300} fill="#1e293b" stroke={COLORS.slate} strokeWidth={8} />
      <circle r={260} fill="#0f172a" />
      {/* 모션 블러 링 */}
      <circle r={180} fill="none" stroke={COLORS.foamBrown} strokeWidth={70} opacity={speed * 0.5} />
      <g transform={`rotate(${angle})`} opacity={1 - speed * 0.6}>
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a}) translate(0, -180)`}>
            <rect x={-30} y={-60} width={60} height={120} rx={28} fill="#e2e8f0" opacity={0.85} />
            <rect x={-24} y={10} width={48} height={44} rx={20} fill={COLORS.foamDark} />
            <rect x={-24} y={-40} width={48} height={50} fill="#fbbf24" opacity={0.6} />
          </g>
        ))}
      </g>
      <circle r={50} fill={COLORS.slate} />
      <text y={390} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={64} fill={COLORS.cyan}>
        {rpm.toLocaleString('en-US')} RPM
      </text>
      <text y={450} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={COLORS.slate}>
        큰 탄화 찌꺼기는 아래로 가라앉힘
      </text>
    </g>
  );
};

/** 주사기 필터 정제 */
const SyringeFilter: React.FC<{t: number}> = ({t}) => {
  const push = interpolate(t, [20, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const fill = interpolate(t, [30, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <g>
      {/* 주사기 */}
      <rect x={-60} y={-420} width={120} height={360} rx={14} fill="#e2e8f0" opacity={0.25} stroke="#e2e8f0" strokeWidth={5} />
      <rect x={-54} y={-420 + push * 280} width={108} height={360 - push * 280 - 10} fill="#d97706" opacity={0.75} />
      <rect x={-50} y={-470 + push * 280} width={100} height={40} rx={6} fill={COLORS.slate} />
      <rect x={-10} y={-640 + push * 280} width={20} height={180} fill={COLORS.slate} />
      <rect x={-80} y={-660 + push * 280} width={160} height={24} rx={8} fill={COLORS.slate} />
      {/* 필터 디스크 */}
      <rect x={-80} y={-60} width={160} height={50} rx={20} fill="#38bdf8" opacity={0.85} />
      <text x={110} y={-25} fontFamily={MONO} fontWeight={700} fontSize={26} fill="#38bdf8">
        0.22 µm
      </text>
      <rect x={-8} y={-10} width={16} height={40} fill="#e2e8f0" />
      {/* 방울 */}
      {push > 0 && push < 1
        ? [0, 1].map((i) => {
            const k = ((t * 0.08 + i * 0.5) % 1);
            return <ellipse key={i} cx={0} cy={40 + k * 140} rx={10} ry={14} fill="#fde68a" />;
          })
        : null}
      {/* 받는 바이알 */}
      <rect x={-80} y={200} width={160} height={260} rx={22} fill="#ffffff" fillOpacity={0.06} stroke="#e2e8f0" strokeWidth={5} />
      <rect x={-72} y={452 - 200 * fill} width={144} height={200 * fill} rx={14} fill="#fde68a" opacity={0.6} />
      <text y={520} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#fde68a">
        맑은 상등액 = CQD 용액
      </text>
    </g>
  );
};

/** Scene 3: 전자레인지 가열 → 원심분리 → 필터 정제 */
export const Scene3MicrowaveCook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 누적 가열량
  const heat = PULSES.reduce(
    (sum, p) => sum + interpolate(frame, [p.start, p.end], [0, 1 / PULSES.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    0,
  );
  const active = PULSES.findIndex((p) => frame >= p.start && frame < p.end);
  const on = active >= 0;
  const timer = on ? interpolate(frame, [PULSES[active].start, PULSES[active].end], [20, 0]) : 20;

  const mwIn = spring({frame: frame - 4, fps, config: {damping: 12, stiffness: 110}});
  const mwOut = interpolate(frame, [CENTRIFUGE - 16, CENTRIFUGE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const cIn = spring({frame: frame - CENTRIFUGE, fps, config: {damping: 12, stiffness: 120}});
  const cOut = interpolate(frame, [FILTER - 14, FILTER], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fIn = spring({frame: frame - FILTER, fps, config: {damping: 12, stiffness: 120}});

  const stage = heat < 0.3 ? '투명 용액' : heat < 0.6 ? '노란색: 탈수·축합' : '갈색 거품: 탄화!';

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {frame < CENTRIFUGE ? (
            <g opacity={1 - mwOut}>
              <g transform={`translate(90, ${720 + (1 - mwIn) * 900}) scale(1)`}>
                <MicrowaveFoam heat={heat} on={on} timer={timer} t={frame} />
              </g>
              {/* 펄스 표시 */}
              <g transform="translate(540, 1420)">
                {PULSES.map((p, i) => {
                  const done = frame >= p.end;
                  const cur = i === active;
                  return (
                    <g key={i} transform={`translate(${(i - 1) * 220}, 0)`}>
                      <rect x={-90} y={-36} width={180} height={72} rx={36} fill={done ? COLORS.foamBrown : cur ? COLORS.red : COLORS.panel} stroke={COLORS.slate} strokeWidth={3} />
                      <text y={12} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.white}>
                        20s #{i + 1}
                      </text>
                    </g>
                  );
                })}
              </g>
              <text x={540} y={1560} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={heat < 0.3 ? COLORS.white : heat < 0.6 ? COLORS.foamYellow : '#d97706'}>
                {stage}
              </text>
            </g>
          ) : null}

          {frame >= CENTRIFUGE && frame < FILTER ? (
            <g transform={`translate(540, 1000) scale(${cIn})`} opacity={1 - cOut}>
              <Centrifuge t={frame - CENTRIFUGE} />
            </g>
          ) : null}

          {frame >= FILTER ? (
            <g transform={`translate(540, 1130) scale(${fIn})`}>
              <SyringeFilter t={frame - FILTER} />
            </g>
          ) : null}
        </svg>
      </AbsoluteFill>

      {frame < CENTRIFUGE ? <Chip text="STEP 1 · 전자레인지 가열" x={540} y={600} delay={10} color={COLORS.foamYellow} /> : null}
      {frame >= CENTRIFUGE && frame < FILTER ? <Chip text="STEP 2 · 원심분리" x={540} y={600} delay={CENTRIFUGE} color={COLORS.cyan} /> : null}
      {frame >= FILTER ? <Chip text="STEP 3 · 주사기 필터 정제" x={540} y={420} delay={FILTER} color={COLORS.green} /> : null}

      <Headline lines={['전자레인지 조리법?!', '20초 만에 일어나는 나노 탄화 반응']} delay={6} top={170} size={62} accent={COLORS.foamYellow} />
      <Subtitle text="20초 가열 × 여러 번 반복 (화면은 빠르게 재생)" delay={60} exitAt={CENTRIFUGE - 10} bottom={190} />
    </SceneFrame>
  );
};
