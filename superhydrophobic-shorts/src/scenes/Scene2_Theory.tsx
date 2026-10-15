import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Chip, KeywordCaption, SceneFrame} from '../components/Typography';
import {WaterDroplet} from '../components/WaterDroplet';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('theory');
const PART_B = 170; // 단면도 파트 시작

// ───────── Part A: 표면장력 ─────────
const CENTER = {x: 540, y: 1000};
const BLOB_R = 330;

// 분자 배치: 내부 1개 + 표면 10개
const SURFACE_N = 10;

const Molecule: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x}, ${y}) scale(${s})`}>
    <circle cx={-20} cy={16} r={13} fill={COLORS.white} />
    <circle cx={20} cy={16} r={13} fill={COLORS.white} />
    <circle r={24} fill={COLORS.oxygen} />
  </g>
);

const Arrow: React.FC<{x: number; y: number; angle: number; len: number; color: string}> = ({
  x,
  y,
  angle,
  len,
  color,
}) => {
  if (len < 2) return null;
  const ex = x + Math.cos(angle) * len;
  const ey = y + Math.sin(angle) * len;
  const hx = Math.cos(angle);
  const hy = Math.sin(angle);
  return (
    <g stroke={color} strokeWidth={8} strokeLinecap="round" fill={color}>
      <line x1={x} y1={y} x2={ex - hx * 10} y2={ey - hy * 10} />
      <polygon
        stroke="none"
        points={`${ex},${ey} ${ex - hx * 24 - hy * 13},${ey - hy * 24 + hx * 13} ${ex - hx * 24 + hy * 13},${ey - hy * 24 - hx * 13}`}
      />
    </g>
  );
};

const SurfaceTension: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 물방울 속으로 줌인
  const zoom = spring({frame, fps, config: {damping: 16, stiffness: 60}});
  const dropScale = interpolate(zoom, [0, 1], [1, 7]);
  const dropFade = interpolate(frame, [10, 30], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const molView = interpolate(frame, [18, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // 울퉁불퉁한 경계 → 매끈한 구형으로 (표면적 최소화)
  const wobble = interpolate(frame, [60, 140], [0.16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });
  let blob = '';
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r = BLOB_R * (1 + wobble * Math.sin(5 * a + frame * 0.12) + wobble * 0.5 * Math.cos(3 * a));
    blob += `${i === 0 ? 'M' : 'L'} ${CENTER.x + Math.cos(a) * r} ${CENTER.y + Math.sin(a) * r} `;
  }

  const arrowGrow = (i: number) =>
    spring({frame: frame - 40 - i * 3, fps, config: {damping: 9, stiffness: 160}});

  const exit = interpolate(frame, [PART_B - 14, PART_B], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity: 1 - exit, transform: `scale(${1 - exit * 0.2})`}}>
      <svg width={1080} height={1920}>
        {/* 줌인되는 물방울 */}
        <g opacity={dropFade} transform={`translate(${CENTER.x}, ${CENTER.y}) scale(${dropScale}) translate(${-CENTER.x}, ${-CENTER.y})`}>
          <WaterDroplet cx={CENTER.x} cy={CENTER.y} r={70} />
        </g>

        <g opacity={molView}>
          <path d={blob} fill={COLORS.waterDeep} fillOpacity={0.18} stroke={COLORS.water} strokeWidth={6} />

          {/* 내부 분자: 사방으로 균형 잡힌 인력 */}
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <Arrow
              key={k}
              x={CENTER.x}
              y={CENTER.y}
              angle={(k / 6) * Math.PI * 2}
              len={110 * arrowGrow(0)}
              color={COLORS.cyan}
            />
          ))}
          <Molecule x={CENTER.x} y={CENTER.y} s={1.2} />

          {/* 표면 분자: 안쪽으로만 당겨짐 */}
          {Array.from({length: SURFACE_N}).map((_, i) => {
            const a = (i / SURFACE_N) * Math.PI * 2 - Math.PI / 2;
            const r = BLOB_R - 40;
            const mx = CENTER.x + Math.cos(a) * r;
            const my = CENTER.y + Math.sin(a) * r;
            const g = arrowGrow(i + 1);
            return (
              <g key={i}>
                <Arrow x={mx} y={my} angle={a + Math.PI} len={100 * g} color={COLORS.lime} />
                <Molecule x={mx} y={my} s={0.9} />
              </g>
            );
          })}
        </g>

        <text x={540} y={1440} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill={COLORS.cyan} opacity={arrowGrow(0)}>
          내부 분자: 사방으로 당김 (균형)
        </text>
        <text x={540} y={1500} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={40} fill={COLORS.lime} opacity={arrowGrow(4)}>
          표면 분자: 안쪽으로만 당김
        </text>
        <text x={540} y={1580} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={COLORS.white} opacity={interpolate(frame, [120, 140], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
          → 표면적 최소 = 구형!
        </text>
      </svg>
    </AbsoluteFill>
  );
};

// ───────── Part B: 연잎 표면 단면 ─────────
const BASE_Y = 1420;
const BUMPS = [150, 300, 450, 600, 750, 900]; // 마이크로 돌기 x 중심
const BUMP_W = 110;
const BUMP_H = 170;

// 돌기 하나의 윤곽 (나노 톱니 포함)
const bumpPath = (cx: number, hScale: number) => {
  const h = BUMP_H * hScale;
  let d = `M ${cx - BUMP_W / 2} ${BASE_Y} `;
  d += `C ${cx - BUMP_W / 2} ${BASE_Y - h * 0.9}, ${cx - BUMP_W * 0.3} ${BASE_Y - h}, ${cx - BUMP_W * 0.25} ${BASE_Y - h} `;
  // 위쪽 나노 톱니
  const teeth = 5;
  for (let i = 0; i <= teeth; i++) {
    const tx = cx - BUMP_W * 0.25 + (BUMP_W * 0.5 * i) / teeth;
    const ty = BASE_Y - h - (i % 2 === 0 ? 0 : 22 * hScale);
    d += `L ${tx} ${ty} `;
  }
  d += `C ${cx + BUMP_W * 0.3} ${BASE_Y - h}, ${cx + BUMP_W / 2} ${BASE_Y - h * 0.9}, ${cx + BUMP_W / 2} ${BASE_Y} `;
  return d;
};

const CrossSection: React.FC = () => {
  const frame = useCurrentFrame() - PART_B;
  const {fps} = useVideoConfig();
  if (frame < 0) return null;

  const enter = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'});
  const bumpScale = (i: number) => spring({frame: frame - 6 - i * 4, fps, config: {damping: 8, stiffness: 140}});
  const wax = interpolate(frame, [50, 95], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const dropIn = spring({frame: frame - 100, fps, config: {damping: 7, stiffness: 120}});
  const air = interpolate(frame, [125, 145], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const airPulse = 1 + Math.sin(frame * 0.25) * 0.08;

  const dropR = 330;
  const dropCy = BASE_Y - BUMP_H - 22 - dropR + 40; // 돌기 끝에 살짝 걸침
  const dropY = interpolate(dropIn, [0, 1], [-500, dropCy]);

  return (
    <AbsoluteFill style={{opacity: enter}}>
      <svg width={1080} height={1920}>
        <defs>
          <clipPath id="aboveBase">
            <rect x={0} y={0} width={1080} height={BASE_Y - BUMP_H + 10} />
          </clipPath>
        </defs>
        {/* 물방울 (돌기 꼭대기에만 닿음) */}
        <g clipPath="url(#aboveBase)">
          {frame > 100 ? <WaterDroplet cx={540} cy={dropY} r={dropR} /> : null}
        </g>

        {/* 기반 조직 */}
        <rect x={60} y={BASE_Y} width={960} height={120} rx={20} fill={COLORS.leafDark} />

        {/* 마이크로/나노 돌기 */}
        {BUMPS.map((bx, i) => (
          <path key={bx} d={bumpPath(bx, bumpScale(i))} fill={COLORS.leaf} />
        ))}
        {/* 왁스 코팅 (윤곽선이 그려지듯) */}
        {BUMPS.map((bx) => (
          <path
            key={`w${bx}`}
            d={bumpPath(bx, 1)}
            fill="none"
            stroke={COLORS.lime}
            strokeWidth={10}
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - wax}
          />
        ))}
        {/* 공기층 */}
        {BUMPS.slice(0, -1).map((bx) => {
          const cx = bx + 75;
          return (
            <g key={bx} opacity={air} transform={`translate(${cx}, ${BASE_Y - BUMP_H * 0.62}) scale(${airPulse})`}>
              <ellipse rx={26} ry={50} fill={COLORS.white} fillOpacity={0.12} stroke={COLORS.white} strokeWidth={4} strokeDasharray="10 8" />
              <text y={8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={20} fill={COLORS.white}>
                AIR
              </text>
            </g>
          );
        })}
      </svg>

      <Chip text="① 마이크로·나노 돌기" x={70} y={1640} delay={PART_B + 30} color={COLORS.cyan} align="left" />
      <Chip text="② 왁스 코팅층 (소수성)" x={1010} y={1720} delay={PART_B + 80} color={COLORS.lime} align="right" />
      <Chip text="공기층 (Air Pocket)" x={540} y={1800} delay={PART_B + 130} color={COLORS.white} />
    </AbsoluteFill>
  );
};

/** Scene 2: 표면장력 & 나노 조건 2가지 */
export const Scene2Theory: React.FC = () => {
  return (
    <SceneFrame
      duration={DURATION}
      background={`radial-gradient(circle at 50% 40%, #12305a 0%, ${COLORS.navy} 60%, ${COLORS.navyDeep} 100%)`}
    >
      <SurfaceTension />
      <CrossSection />
      <KeywordCaption
        lines={['비밀은', '표면장력 & 나노 돌기!']}
        sub="물은 뭉치려 하고, 표면은 물을 밀어낸다"
        delay={6}
        top={190}
        size={80}
      />
    </SceneFrame>
  );
};
