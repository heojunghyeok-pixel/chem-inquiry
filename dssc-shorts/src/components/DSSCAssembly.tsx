import React from 'react';
import {Easing, interpolate, interpolateColors, spring} from 'remotion';
import {COLORS, FONT, FPS} from '../constants';

/**
 * DSSC 제작 공정 SVG 애니메이션 모음.
 * 각 컴포넌트는 해당 단계의 로컬 프레임 t(0~225)를 받아 그린다.
 */

const clampEase = (t: number, a: number, b: number, easing: (x: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

const sp = (t: number, delay: number, damping = 11, stiffness = 120) =>
  spring({frame: t - delay, fps: FPS, config: {damping, stiffness}});

const Label: React.FC<{x: number; y: number; text: string; color?: string; o?: number; size?: number}> = ({
  x,
  y,
  text,
  color = COLORS.white,
  o = 1,
  size = 34,
}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} opacity={o}>
    {text}
  </text>
);

/** FTO 유리판 */
const Glass: React.FC<{x: number; y: number; w: number; h: number; label?: string}> = ({x, y, w, h, label}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={10} fill={COLORS.fto} opacity={0.28} stroke={COLORS.fto} strokeWidth={4} />
    <path d={`M ${x + 30} ${y + 20} L ${x + 80} ${y + 20} L ${x + 40} ${y + h - 20} L ${x + 20} ${y + h - 20} Z`} fill="#ffffff" opacity={0.12} />
    {label ? <Label x={x + w / 2} y={y + h + 54} text={label} color={COLORS.fto} size={30} /> : null}
  </g>
);

// ───────────────────────── Step 1: 닥터 블레이드 ─────────────────────────
const G1 = {x: 190, y: 700, w: 700, h: 440};
const TAPE_W = 60;

export const DoctorBlade: React.FC<{t: number}> = ({t}) => {
  const glassIn = sp(t, 0);
  const tape = clampEase(t, 25, 60);
  const blob = sp(t, 62, 7, 180);
  const sweep = clampEase(t, 95, 165, Easing.inOut(Easing.cubic));
  const x0 = G1.x + TAPE_W;
  const x1 = G1.x + G1.w - TAPE_W;
  const rodX = interpolate(sweep, [0, 1], [x0 + 10, x1 + 30]);
  const layerRight = interpolate(sweep, [0, 1], [x0, x1]);
  const done = clampEase(t, 168, 185);
  // 밀려가는 페이스트 덩어리 (앞쪽으로 쌓였다가 줄어듦)
  const bulge = blob * (1 - sweep * 0.85);

  return (
    <g transform={`translate(0, ${(1 - glassIn) * 600})`}>
      <Glass x={G1.x} y={G1.y} w={G1.w} h={G1.h} label="FTO 전도성 유리" />
      {/* 마스킹 테이프 */}
      {[G1.x, G1.x + G1.w - TAPE_W].map((tx) => (
        <rect key={tx} x={tx} y={G1.y - 20} width={TAPE_W} height={(G1.h + 40) * tape} fill="#e7d9a8" opacity={0.95} />
      ))}
      {/* 펴진 TiO₂ 층 */}
      {sweep > 0 ? (
        <rect x={x0} y={G1.y + 10} width={layerRight - x0} height={G1.h - 20} fill={COLORS.tio2} opacity={0.95} />
      ) : null}
      {/* 표면 결 (다공성 느낌) */}
      {sweep > 0
        ? Array.from({length: 40}).map((_, i) => {
            const cx = x0 + 20 + ((i * 97) % (x1 - x0 - 40));
            const cy = G1.y + 30 + ((i * 53) % (G1.h - 60));
            return cx < layerRight ? <circle key={i} cx={cx} cy={cy} r={5} fill="#d6d3d1" /> : null;
          })
        : null}
      {/* 페이스트 덩어리 */}
      {blob > 0.01 && sweep < 1 ? (
        <ellipse cx={rodX + 34} cy={G1.y + G1.h / 2} rx={30 * bulge + 4} ry={(G1.h / 2 - 20) * Math.min(1, blob)} fill={COLORS.tio2} />
      ) : null}
      {/* 유리 막대 (닥터 블레이드) */}
      {t > 85 ? (
        <g opacity={1 - done} transform={`translate(${rodX}, 0)`}>
          <rect x={-16} y={G1.y - 70} width={32} height={G1.h + 140} rx={16} fill="#e0f2fe" opacity={0.75} stroke="#ffffff" strokeWidth={3} />
          <rect x={-8} y={G1.y - 60} width={6} height={G1.h + 120} rx={3} fill="#ffffff" opacity={0.8} />
        </g>
      ) : null}
      <Label x={540} y={G1.y - 70} text="마스킹 테이프" color="#e7d9a8" o={tape * (1 - sweep)} size={30} />
      <Label x={540} y={G1.y + G1.h / 2 + 12} text="TiO₂ 나노 다공성 층" color={COLORS.slateDark} o={done} size={40} />
    </g>
  );
};

// ───────────────────────── Step 2: 가열 → 블루베리 염착 ─────────────────────────
const G2 = {w: 300, h: 440, cx: 540};
const BEAKER = {x: 300, y: 1060, w: 480, h: 460, liquidTop: 1150};

export const DyeSoak: React.FC<{t: number}> = ({t}) => {
  const heat = clampEase(t, 0, 20);
  const plateOut = clampEase(t, 60, 80, Easing.in(Easing.cubic));
  const beakerIn = sp(t, 66, 12, 120);
  const dip = clampEase(t, 85, 115, Easing.inOut(Easing.cubic));
  const lift = clampEase(t, 175, 205, Easing.inOut(Easing.cubic));
  const stain = clampEase(t, 112, 172, Easing.inOut(Easing.quad));

  const top = 600 + dip * 360 - lift * 360;
  const left = G2.cx - G2.w / 2;
  const layerTop = top + 50;
  const layerBottom = top + G2.h - 30;
  // 염착 경계: 아래에서 위로 진행 (stain 0 → 1)
  const front = interpolate(stain, [0, 1], [1.2, -0.2]);
  const dyeColor = COLORS.dye;
  const splash = interpolate(t, [110, 130], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <g>
      <defs>
        <linearGradient id="stainGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={COLORS.tio2} />
          <stop offset={`${Math.min(1, Math.max(0, front - 0.12)) * 100}%`} stopColor={COLORS.tio2} />
          <stop offset={`${Math.min(1, Math.max(0, front + 0.12)) * 100}%`} stopColor={dyeColor} />
          <stop offset="100%" stopColor={dyeColor} />
        </linearGradient>
      </defs>

      {/* 핫플레이트 */}
      <g opacity={1 - plateOut} transform={`translate(0, ${plateOut * 400})`}>
        <rect x={290} y={1050} width={500} height={110} rx={18} fill="#334155" />
        <rect x={310} y={1040} width={460} height={22} rx={8} fill="#475569" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={340 + i * 110} y={1046} width={70} height={10} rx={5} fill={COLORS.red} opacity={heat * (0.6 + 0.4 * Math.sin(t * 0.4 + i))} />
        ))}
        {[0, 1, 2].map((i) => {
          const k = ((t + i * 15) % 45) / 45;
          return (
            <path
              key={i}
              d={`M ${440 + i * 100} ${1020 - k * 90} q 16 -24 0 -48 q -16 -24 0 -48`}
              stroke={COLORS.red}
              strokeWidth={8}
              fill="none"
              opacity={(1 - k) * heat * 0.8}
              strokeLinecap="round"
            />
          );
        })}
        <Label x={540} y={1220} text="핫플레이트 가열 (TiO₂ 소결)" color={COLORS.red} size={34} />
      </g>

      {/* 비커 뒤판 */}
      <g opacity={beakerIn} transform={`translate(0, ${(1 - beakerIn) * 500})`}>
        <rect x={BEAKER.x} y={BEAKER.liquidTop} width={BEAKER.w} height={BEAKER.y + BEAKER.h - BEAKER.liquidTop} fill="#3b0764" opacity={0.85} />
      </g>

      {/* 유리 + TiO₂ / 염착층 */}
      <g>
        <rect x={left} y={top} width={G2.w} height={G2.h} rx={10} fill={COLORS.fto} opacity={0.28} stroke={COLORS.fto} strokeWidth={4} />
        <rect x={left + 30} y={layerTop} width={G2.w - 60} height={layerBottom - layerTop} fill="url(#stainGrad)" />
      </g>

      {/* 비커 앞 (반투명 추출액) */}
      <g opacity={beakerIn} transform={`translate(0, ${(1 - beakerIn) * 500})`}>
        <rect x={BEAKER.x} y={BEAKER.liquidTop} width={BEAKER.w} height={BEAKER.y + BEAKER.h - BEAKER.liquidTop} fill="#6b21a8" opacity={0.45} />
        <ellipse cx={540} cy={BEAKER.liquidTop} rx={BEAKER.w / 2} ry={14} fill="#a855f7" opacity={0.6} />
        {/* 물결 링 (퐁당) */}
        <ellipse cx={540} cy={BEAKER.liquidTop} rx={160 + splash * 120} ry={14 + splash * 10} fill="none" stroke="#e9d5ff" strokeWidth={5} opacity={splash > 0 && splash < 1 ? 1 - splash : 0} />
        <path
          d={`M ${BEAKER.x} ${BEAKER.y} V ${BEAKER.y + BEAKER.h} H ${BEAKER.x + BEAKER.w} V ${BEAKER.y}`}
          stroke={COLORS.white}
          strokeWidth={8}
          fill="none"
          opacity={0.85}
        />
        <Label x={540} y={BEAKER.y + BEAKER.h + 60} text="블루베리 추출액 (안토시아닌)" color={COLORS.neonPurple} size={34} />
      </g>
      <Label x={540} y={560} text="하얀 TiO₂ → 진보라 (색소 흡착)" color={COLORS.pink} o={clampEase(t, 180, 200)} size={38} />
    </g>
  );
};

// ───────────────────────── Step 3: 4B 연필 흑연 칠하기 ─────────────────────────
const G3 = {x: 190, y: 720, w: 700, h: 440};
const ROWS = 11;

const hatchPoints = () => {
  const pts: [number, number][] = [];
  const xL = G3.x + 50;
  const xR = G3.x + G3.w - 50;
  const step = (G3.h - 60) / ROWS;
  for (let i = 0; i <= ROWS; i++) {
    pts.push([i % 2 === 0 ? xL : xR, G3.y + 30 + i * step]);
  }
  return pts;
};
const HATCH = hatchPoints();
const SEG_LEN = HATCH.slice(1).map((p, i) => Math.hypot(p[0] - HATCH[i][0], p[1] - HATCH[i][1]));
const TOTAL_LEN = SEG_LEN.reduce((a, b) => a + b, 0);

export const PencilCoat: React.FC<{t: number}> = ({t}) => {
  const glassIn = sp(t, 0);
  const draw = clampEase(t, 30, 170, Easing.inOut(Easing.quad));
  const fill = clampEase(t, 165, 195);
  const pencilOut = clampEase(t, 175, 200, Easing.in(Easing.cubic));

  // 현재 펜촉 위치와 지나온 경로
  let remain = draw * TOTAL_LEN;
  let path = `M ${HATCH[0][0]} ${HATCH[0][1]}`;
  let tip = HATCH[0];
  for (let i = 0; i < SEG_LEN.length; i++) {
    const [ax, ay] = HATCH[i];
    const [bx, by] = HATCH[i + 1];
    if (remain >= SEG_LEN[i]) {
      path += ` L ${bx} ${by}`;
      tip = HATCH[i + 1];
      remain -= SEG_LEN[i];
    } else {
      const k = remain / SEG_LEN[i];
      tip = [ax + (bx - ax) * k, ay + (by - ay) * k];
      path += ` L ${tip[0]} ${tip[1]}`;
      break;
    }
  }
  const wiggle = Math.sin(t * 1.3) * 4;

  return (
    <g transform={`translate(0, ${(1 - glassIn) * 600})`}>
      <Glass x={G3.x} y={G3.y} w={G3.w} h={G3.h} label="또 다른 FTO 유리 (상대전극)" />
      <defs>
        <clipPath id="g3clip">
          <rect x={G3.x + 10} y={G3.y + 10} width={G3.w - 20} height={G3.h - 20} />
        </clipPath>
      </defs>
      <g clipPath="url(#g3clip)">
        <path d={path} stroke={COLORS.graphite} strokeWidth={62} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
        <rect x={G3.x + 10} y={G3.y + 10} width={G3.w - 20} height={G3.h - 20} fill="#111827" opacity={fill * 0.95} />
        {/* 흑연 광택 */}
        <rect x={G3.x + 10} y={G3.y + 10} width={G3.w - 20} height={G3.h - 20} fill="url(#g3sheen)" opacity={fill * 0.4} />
      </g>
      <defs>
        <linearGradient id="g3sheen" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#9ca3af" stopOpacity={0} />
          <stop offset="50%" stopColor="#9ca3af" stopOpacity={0.6} />
          <stop offset="100%" stopColor="#9ca3af" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* 4B 연필 */}
      <g transform={`translate(${tip[0] + pencilOut * 500}, ${tip[1] + wiggle - pencilOut * 700}) rotate(-35)`} opacity={t > 20 ? 1 : 0}>
        <polygon points="0,0 -18,-60 18,-60" fill="#f3d9b1" />
        <polygon points="0,0 -7,-22 7,-22" fill={COLORS.graphite} />
        <rect x={-22} y={-320} width={44} height={260} fill={COLORS.yellow} />
        <rect x={-22} y={-320} width={14} height={260} fill="#eab308" />
        <rect x={-24} y={-360} width={48} height={44} rx={4} fill="#cbd5e1" />
        <rect x={-22} y={-400} width={44} height={44} rx={10} fill={COLORS.pink} />
        <text x={0} y={-190} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.bg} transform="rotate(90 0 -190)">
          4B
        </text>
      </g>
      <Label x={540} y={G3.y + G3.h / 2 + 12} text="흑연 촉매 전극 완성" color={COLORS.white} o={fill} size={44} />
    </g>
  );
};

// ───────────────────────── Step 4: 샌드위치 조립 + 전해질 ─────────────────────────
const A = {x: 180, y: 760, w: 640, h: 380};
const OFFSET = 60; // 5 mm 어긋남 (화면 표현)

const BinderClip: React.FC<{x: number; y: number; flip?: boolean; s: number}> = ({x, y, flip = false, s}) => (
  <g transform={`translate(${x}, ${y}) scale(${s}, ${flip ? -s : s})`}>
    <path d="M -50 -40 L 50 -40 L 40 30 L -40 30 Z" fill="#0b0b0f" stroke="#374151" strokeWidth={3} />
    <path d="M -30 -40 Q -40 -110 -10 -120" stroke={COLORS.metal} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M 30 -40 Q 40 -110 10 -120" stroke={COLORS.metal} strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

export const CellAssembly: React.FC<{t: number}> = ({t}) => {
  const aIn = sp(t, 0);
  const bDrop = sp(t, 20, 12, 110);
  const clip1 = sp(t, 62, 6, 260);
  const clip2 = sp(t, 72, 6, 260);
  const snap = interpolate(t, [62, 72, 90], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const dropT = clampEase(t, 112, 132, Easing.in(Easing.quad));
  // 모세관 현상: 초반 빠르고 점점 느려지는 침투 (√t 형태)
  const seep = interpolate(t, [132, 215], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const seepFront = Math.sqrt(seep);

  const bx = A.x + OFFSET;
  const by = interpolate(bDrop, [0, 1], [A.y - 700, A.y]);
  const overlapX0 = bx;
  const overlapX1 = A.x + A.w;
  const frontX = overlapX0 + (overlapX1 - overlapX0) * seepFront;

  // 침투 경계 물결
  let wave = `M ${overlapX0} ${A.y + 12}`;
  for (let i = 0; i <= 20; i++) {
    const yy = A.y + 12 + ((A.h - 24) * i) / 20;
    wave += ` L ${frontX + Math.sin(i * 1.3 + t * 0.2) * 14 * (1 - seep * 0.5)} ${yy}`;
  }
  wave += ` L ${overlapX0} ${A.y + A.h - 12} Z`;

  return (
    <g>
      {/* 광전극 (보라 염착 TiO₂) */}
      <g transform={`translate(0, ${(1 - aIn) * 600})`}>
        <rect x={A.x} y={A.y} width={A.w} height={A.h} rx={8} fill={COLORS.fto} opacity={0.3} stroke={COLORS.fto} strokeWidth={4} />
        <rect x={A.x + 70} y={A.y + 30} width={A.w - 140} height={A.h - 60} fill={COLORS.dye} />
      </g>
      {/* 전해질 침투 */}
      {seep > 0 ? <path d={wave} fill={COLORS.iodine} opacity={0.6} /> : null}
      {/* 상대전극 (흑연, 흑연면이 아래로) */}
      <g transform={`translate(0, ${by - A.y})`} opacity={Math.min(1, bDrop * 2)}>
        <rect x={bx} y={A.y} width={A.w} height={A.h} rx={8} fill="#111827" opacity={0.55} stroke={COLORS.fto} strokeWidth={4} />
      </g>
      {/* 5 mm 어긋남 표시 */}
      <g opacity={clampEase(t, 45, 60) * (1 - clampEase(t, 105, 115))}>
        <line x1={A.x} y1={A.y - 40} x2={bx} y2={A.y - 40} stroke={COLORS.yellow} strokeWidth={5} />
        <line x1={A.x + A.w} y1={A.y - 40} x2={bx + A.w} y2={A.y - 40} stroke={COLORS.yellow} strokeWidth={5} />
        <Label x={A.x + 30} y={A.y - 60} text="5 mm" color={COLORS.yellow} size={28} />
        <Label x={bx + A.w - 30} y={A.y - 60} text="5 mm" color={COLORS.yellow} size={28} />
        <Label x={540} y={A.y + A.h + 140} text="전극 연결부를 남기고 어긋나게 포개기" color={COLORS.yellow} size={32} />
      </g>
      {/* 바인더 클립 */}
      {clip1 > 0.01 ? <BinderClip x={400} y={A.y + 10} s={clip1} /> : null}
      {clip2 > 0.01 ? <BinderClip x={680} y={A.y + A.h - 10} s={clip2} flip /> : null}
      {snap > 0 ? (
        <text x={880} y={A.y - 60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={COLORS.yellow} opacity={snap} transform={`rotate(-10 880 ${A.y - 60}) scale(1)`}>
          착!
        </text>
      ) : null}
      {/* 스포이트 + 전해질 방울 */}
      <g opacity={clampEase(t, 95, 110) * (1 - clampEase(t, 150, 165))}>
        <rect x={overlapX0 - 22} y={A.y - 250} width={44} height={110} rx={20} fill="#e2e8f0" opacity={0.85} />
        <path d={`M ${overlapX0 - 14} ${A.y - 140} L ${overlapX0 + 14} ${A.y - 140} L ${overlapX0 + 4} ${A.y - 90} L ${overlapX0 - 4} ${A.y - 90} Z`} fill="#e2e8f0" />
        <rect x={overlapX0 - 30} y={A.y - 290} width={60} height={50} rx={22} fill={COLORS.red} />
      </g>
      {t > 112 && dropT < 1 ? (
        <ellipse cx={overlapX0} cy={A.y - 90 + dropT * 110} rx={14} ry={18} fill={COLORS.iodine} />
      ) : null}
      <Label x={540} y={A.y + A.h + 190} text="요오드 전해질 (I⁻ / I₃⁻) · 모세관 현상으로 스며듦" color="#fbbf24" o={clampEase(t, 140, 160)} size={32} />
    </g>
  );
};
