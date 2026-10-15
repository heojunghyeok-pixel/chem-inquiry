import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CameraHUD} from '../components/CameraHUD';
import {KeywordCaption, SceneFrame} from '../components/Typography';
import {WaterDroplet} from '../components/WaterDroplet';
import {COLORS, FONT, MEASURED, MEASURED_ANGLE, MONO, sceneDuration} from '../constants';

const DURATION = sceneDuration('aiVision');

// 뷰파인더 영역
const VF = {x: 70, y: 470, w: 940, h: 860};
// 물방울 기하: 접촉각 θ, 반지름 R인 구형 캡
const THETA = (MEASURED_ANGLE * Math.PI) / 180;
const R = 150;
const SURFACE_Y = 1170;
const CX = 540;
const H = R * (1 - Math.cos(THETA)); // 높이 h
const D = 2 * R * Math.sin(THETA); // 밑변(접촉선) d
const CY = SURFACE_Y - (H - R); // 원 중심
const TOP_Y = SURFACE_Y - H;

const FORMULA = 'θ = 2 · arctan(2h / d)';

const ease = (frame: number, a: number, b: number, fn = Easing.out(Easing.cubic)) =>
  interpolate(frame, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: fn});

/** Scene 4: AI 비전 접촉각 측정 */
export const Scene4AIVision: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const dropIn = spring({frame: frame - 6, fps, config: {damping: 8, stiffness: 120}});
  const contour = ease(frame, 60, 110);
  const box = ease(frame, 110, 140);
  const tangent = ease(frame, 140, 165);
  const typed = Math.floor(interpolate(frame, [165, 205], [0, FORMULA.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const gauge = ease(frame, 210, 290, Easing.bezier(0.16, 1, 0.3, 1));
  const angleNow = gauge * MEASURED_ANGLE;
  const done = frame >= 292;
  const badge = spring({frame: frame - 296, fps, config: {damping: 7, stiffness: 180}});

  // 물방울 윤곽(원 중 표면 위쪽 부분): 왼쪽 접촉점 → 위 → 오른쪽 접촉점
  const lx = CX - D / 2;
  const rx = CX + D / 2;
  const contourPath = `M ${lx} ${SURFACE_Y} A ${R} ${R} 0 1 1 ${rx} ${SURFACE_Y}`;

  // 오른쪽 접촉점 접선 (액체 내부 쪽으로 θ)
  const tanLen = 150;
  const tdx = Math.cos(Math.PI - THETA);
  const tdy = -Math.sin(Math.PI - THETA);

  // 게이지 (반원, 0~180°)
  const G = {x: 540, y: 1790, r: 200};
  const gaugeArc = (deg: number) => {
    const a = Math.PI - (deg * Math.PI) / 180;
    return `M ${G.x - G.r} ${G.y} A ${G.r} ${G.r} 0 0 1 ${G.x + Math.cos(a) * G.r} ${G.y - Math.sin(a) * G.r}`;
  };
  const needleA = Math.PI - (angleNow * Math.PI) / 180;
  const at150 = Math.PI - (150 * Math.PI) / 180;

  return (
    <SceneFrame
      duration={DURATION}
      background={`radial-gradient(circle at 50% 45%, #13233f 0%, ${COLORS.navy} 55%, ${COLORS.navyDeep} 100%)`}
    >
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <defs>
            <clipPath id="vf">
              <rect x={VF.x} y={VF.y} width={VF.w} height={VF.h} rx={30} />
            </clipPath>
          </defs>

          {/* 카메라 화면 */}
          <rect x={VF.x} y={VF.y} width={VF.w} height={VF.h} rx={30} fill="#0b1220" opacity={0.85} />
          <g clipPath="url(#vf)">
            {/* 초발수 종이 */}
            <rect x={VF.x} y={SURFACE_Y} width={VF.w} height={200} fill="#cbd5e1" />
            <rect x={VF.x} y={SURFACE_Y} width={VF.w} height={8} fill={COLORS.lime} opacity={0.8} />
            {/* 물방울 (구형 캡) */}
            <clipPath id="aboveSurface">
              <rect x={VF.x} y={VF.y} width={VF.w} height={SURFACE_Y - VF.y} />
            </clipPath>
            <g clipPath="url(#aboveSurface)" transform={`translate(0, ${(1 - dropIn) * -500})`}>
              <WaterDroplet cx={CX} cy={CY} r={R} squash={1 + (1 - dropIn) * -0.1} />
            </g>

            {/* AI 윤곽선 */}
            <path
              d={contourPath}
              fill="none"
              stroke={COLORS.lime}
              strokeWidth={6}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - contour}
              style={{filter: `drop-shadow(0 0 10px ${COLORS.lime})`}}
            />
            {/* 윤곽 샘플 포인트 */}
            {Array.from({length: 14}).map((_, i) => {
              const a0 = 1.5 * Math.PI - THETA; // 왼쪽 접촉점 각도(원 기준, y-down)
              const a = a0 + (2 * THETA * i) / 13;
              return (
                <circle
                  key={i}
                  cx={CX + Math.cos(a) * R}
                  cy={CY + Math.sin(a) * R}
                  r={6}
                  fill={COLORS.white}
                  opacity={contour > i / 13 ? 1 : 0}
                />
              );
            })}

            {/* 바운딩 박스: h, d */}
            <g opacity={box}>
              <rect
                x={CX - R}
                y={TOP_Y}
                width={2 * R}
                height={H}
                fill="none"
                stroke={COLORS.cyan}
                strokeWidth={3}
                strokeDasharray="12 10"
              />
              {/* h */}
              <line x1={CX + R + 30} y1={TOP_Y} x2={CX + R + 30} y2={TOP_Y + H * box} stroke={COLORS.cyan} strokeWidth={5} />
              <line x1={CX + R + 15} y1={TOP_Y} x2={CX + R + 45} y2={TOP_Y} stroke={COLORS.cyan} strokeWidth={5} />
              <line x1={CX + R + 15} y1={SURFACE_Y} x2={CX + R + 45} y2={SURFACE_Y} stroke={COLORS.cyan} strokeWidth={5} />
              <text x={CX + R + 60} y={TOP_Y + H / 2 + 12} fontFamily={MONO} fontWeight={700} fontSize={34} fill={COLORS.cyan}>
                h = {MEASURED.h.toFixed(1)} px
              </text>
              {/* d (접촉선 폭) */}
              <line x1={lx} y1={SURFACE_Y + 50} x2={lx + D * box} y2={SURFACE_Y + 50} stroke={COLORS.amber} strokeWidth={5} />
              <line x1={lx} y1={SURFACE_Y + 35} x2={lx} y2={SURFACE_Y + 65} stroke={COLORS.amber} strokeWidth={5} />
              <line x1={rx} y1={SURFACE_Y + 35} x2={rx} y2={SURFACE_Y + 65} stroke={COLORS.amber} strokeWidth={5} />
              <text x={CX} y={SURFACE_Y + 110} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={34} fill={COLORS.navy}>
                d = {MEASURED.d.toFixed(1)} px
              </text>
            </g>

            {/* 접선 + 각도 호 */}
            <g opacity={tangent}>
              <line
                x1={rx}
                y1={SURFACE_Y}
                x2={rx + tdx * tanLen * tangent}
                y2={SURFACE_Y + tdy * tanLen * tangent}
                stroke={COLORS.red}
                strokeWidth={5}
              />
              <path
                d={`M ${rx - 60} ${SURFACE_Y} A 60 60 0 0 1 ${rx + Math.cos(Math.PI - THETA) * 60} ${SURFACE_Y - Math.sin(Math.PI - THETA) * 60}`}
                fill="none"
                stroke={COLORS.red}
                strokeWidth={5}
              />
              <text x={rx - 110} y={SURFACE_Y - 30} fontFamily={MONO} fontWeight={700} fontSize={36} fill={COLORS.red}>
                θ
              </text>
            </g>

            {/* 공식 스캔 */}
            {typed > 0 ? (
              <g>
                <rect x={VF.x + 30} y={VF.y + 90} width={560} height={74} rx={12} fill="#020617" opacity={0.75} stroke={COLORS.cyan} strokeWidth={3} />
                <text x={VF.x + 54} y={VF.y + 140} fontFamily={MONO} fontWeight={700} fontSize={36} fill={COLORS.white}>
                  {FORMULA.slice(0, typed)}
                  {typed < FORMULA.length && frame % 10 < 5 ? '▌' : ''}
                </text>
              </g>
            ) : null}
          </g>

          <CameraHUD x={VF.x} y={VF.y} w={VF.w} h={VF.h} delay={0} scanning={!done} status={done ? 'MEASURED ✓' : 'AI VISION · SCANNING'} />

          {/* 각도 게이지 */}
          <g opacity={ease(frame, 195, 215)}>
            <path d={gaugeArc(180)} fill="none" stroke={COLORS.slateDark} strokeWidth={28} strokeLinecap="round" />
            {angleNow > 0.5 ? (
              <path d={gaugeArc(angleNow)} fill="none" stroke={angleNow >= 150 ? COLORS.lime : COLORS.cyan} strokeWidth={28} strokeLinecap="round" />
            ) : null}
            {/* 150° 기준선 */}
            <line
              x1={G.x + Math.cos(at150) * (G.r - 30)}
              y1={G.y - Math.sin(at150) * (G.r - 30)}
              x2={G.x + Math.cos(at150) * (G.r + 30)}
              y2={G.y - Math.sin(at150) * (G.r + 30)}
              stroke={COLORS.amber}
              strokeWidth={6}
            />
            <text x={G.x + Math.cos(at150) * (G.r + 50)} y={G.y - Math.sin(at150) * (G.r + 50)} fontFamily={MONO} fontWeight={700} fontSize={26} fill={COLORS.amber}>
              150°
            </text>
            <line
              x1={G.x}
              y1={G.y}
              x2={G.x + Math.cos(needleA) * (G.r - 40)}
              y2={G.y - Math.sin(needleA) * (G.r - 40)}
              stroke={COLORS.white}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <circle cx={G.x} cy={G.y} r={14} fill={COLORS.white} />
            <text x={G.x} y={G.y - G.r - 40} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={72} fill={done ? COLORS.lime : COLORS.white}>
              {angleNow.toFixed(1)}°
            </text>
          </g>
        </svg>
      </AbsoluteFill>

      {/* 인증 뱃지 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1380,
          display: 'flex',
          justifyContent: 'center',
          fontFamily: FONT,
        }}
      >
        <div
          style={{
            background: COLORS.lime,
            color: COLORS.navy,
            fontWeight: 900,
            fontSize: 44,
            padding: '16px 36px',
            borderRadius: 18,
            boxShadow: `0 0 40px ${COLORS.lime}`,
            transform: `scale(${badge}) rotate(${interpolate(badge, [0, 1], [-12, -2])}deg)`,
            whiteSpace: 'nowrap',
          }}
        >
          [ 초발수 인증 완료! (Superhydrophobic) ]
        </div>
      </div>

      <KeywordCaption lines={['눈대중은 NO!', 'AI 컴퓨터 비전으로 접촉각 측정']} delay={6} top={170} size={66} />
    </SceneFrame>
  );
};
