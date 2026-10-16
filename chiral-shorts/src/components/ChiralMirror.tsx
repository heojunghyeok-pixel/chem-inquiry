import React from 'react';
import {COLORS, FONT} from '../constants';

/**
 * 거울상 대칭 연출용 그래픽.
 * - MirrorPair: 가운데 점선 거울을 기준으로 왼쪽 원본 / 오른쪽 좌우반전 사본을 배치하고,
 *   CSS 3D rotateY 로 서로 반대 방향(거울 대칭)으로 회전시킨다.
 * - Hand / Carvone / Thalidomide: 각 SVG 그래픽 (원점 중심)
 */

export const MirrorPair: React.FC<{
  y: number;
  gap?: number;
  size: number;
  angle: number; // 왼쪽 회전각 (deg); 오른쪽은 -angle 로 거울 대칭
  enter?: number; // 0~1 등장
  mirror?: number; // 0~1 거울선 표시
  children: React.ReactNode | ((mirrored: boolean) => React.ReactNode);
  labels?: [React.ReactNode, React.ReactNode];
}> = ({y, gap = 270, size, angle, enter = 1, mirror = 1, children, labels}) => {
  const box = (side: -1 | 1) => (
    <div
      style={{
        position: 'absolute',
        left: 540 + side * gap - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        perspective: 1400,
        opacity: Math.min(1, enter * 1.4),
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `translateX(${(1 - enter) * side * -gap}px) rotateY(${side === -1 ? angle : -angle}deg) scale(${0.6 + enter * 0.4})`,
          transformStyle: 'preserve-3d',
        }}
      >
        <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible'}}>
          {/* 오른쪽은 좌우반전 = 거울상 */}
          <g transform={side === 1 ? 'scale(-1, 1)' : undefined}>{typeof children === 'function' ? children(side === 1) : children}</g>
        </svg>
      </div>
    </div>
  );
  return (
    <>
      {/* 거울 (세로 점선) */}
      <div
        style={{
          position: 'absolute',
          left: 538,
          top: y - size / 2 - 40,
          width: 4,
          height: (size + 80) * mirror,
          backgroundImage: `linear-gradient(${COLORS.cyan} 55%, transparent 55%)`,
          backgroundSize: '4px 26px',
          boxShadow: `0 0 18px ${COLORS.cyan}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 540 - 60,
          top: y - size / 2 - 86,
          width: 120,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 28,
          color: COLORS.cyan,
          opacity: mirror,
        }}
      >
        거울
      </div>
      {box(-1)}
      {box(1)}
      {labels
        ? labels.map((l, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 540 + (i === 0 ? -1 : 1) * gap - 230,
                width: 460,
                top: y + size / 2 + 10,
                textAlign: 'center',
                fontFamily: FONT,
                opacity: enter,
              }}
            >
              {l}
            </div>
          ))
        : null}
    </>
  );
};

/** 왼손 (손바닥 면, 엄지가 오른쪽) */
export const Hand: React.FC<{color?: string}> = ({color = COLORS.violet}) => (
  <g>
    <path
      d="M -110 40 Q -120 -30 -100 -60 L -100 -190 Q -100 -215 -78 -215 Q -56 -215 -56 -190 L -56 -90
         L -48 -90 L -48 -235 Q -48 -260 -24 -260 Q 0 -260 0 -235 L 0 -95
         L 8 -95 L 8 -225 Q 8 -250 32 -250 Q 56 -250 56 -225 L 56 -85
         L 64 -85 L 64 -175 Q 64 -198 86 -198 Q 108 -198 108 -175 L 108 -10
         L 150 -70 Q 170 -95 190 -78 Q 208 -62 192 -38 L 120 80 Q 90 150 10 160 Q -90 160 -110 40 Z"
      fill={color}
      opacity={0.92}
      stroke="#ffffff"
      strokeWidth={6}
      strokeLinejoin="round"
    />
    <path d="M -60 40 Q 0 70 70 30" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M -50 90 Q 10 110 60 80" stroke="#ffffff" strokeOpacity={0.4} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// 고리 꼭짓점 (y는 화면 좌표: 아래가 +)
const ringPt = (i: number, r: number): [number, number] => {
  const a = (Math.PI / 2) - (i * Math.PI) / 3; // C1 위쪽부터 시계 방향
  return [Math.cos(a) * r, -Math.sin(a) * r];
};

const Atom: React.FC<{x: number; y: number; label: string; color: string; r?: number}> = ({x, y, label, color, r = 26}) => (
  <g transform={`translate(${x}, ${y})`}>
    <circle r={r} fill={color} />
    <text y={r * 0.38} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 1.05} fill={COLORS.bg}>
      {label}
    </text>
  </g>
);

/**
 * (R)-카르본 골격식 (좌우반전하면 (S)-카르본).
 * C1 = C=O, C2 = 메틸 & C2=C3 이중결합, C5 = 비대칭 탄소(분홍) + 아이소프로펜일(쐐기).
 * CIP: 아이소프로펜일 > C6(C=O 쪽) > C4 > H(뒤) → 이 배치에서 시계 방향 = R
 */
export const Carvone: React.FC<{glow?: number; mirrored?: boolean}> = ({glow = 1, mirrored = false}) => {
  // 거울상(좌우반전)일 때 글자는 다시 뒤집어 읽을 수 있게
  const txt = (x: number) => (mirrored ? `translate(${2 * x}, 0) scale(-1, 1)` : undefined);
  const R = 110;
  const P = Array.from({length: 6}).map((_, i) => ringPt(i, R));
  const [c1, c2, c3, , c5] = P;
  const bond = (a: [number, number], b: [number, number], k: string, w = 9) => (
    <line key={k} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={COLORS.white} strokeWidth={w} strokeLinecap="round" />
  );
  // C2=C3 이중결합 안쪽 선
  const inner = (a: [number, number], b: [number, number]) => {
    const s = 0.78;
    return <line x1={a[0] * s} y1={a[1] * s} x2={b[0] * s} y2={b[1] * s} stroke={COLORS.white} strokeWidth={7} strokeLinecap="round" />;
  };
  const o: [number, number] = [c1[0], c1[1] - 95];
  const me: [number, number] = [c2[0] + 85, c2[1] - 50];
  const ipr: [number, number] = [c5[0] - 95, c5[1] + 55]; // 아이소프로펜일 탄소
  return (
    <g transform="scale(0.82)">
      {P.map((p, i) => bond(p, P[(i + 1) % 6], `b${i}`))}
      {inner(c2, c3)}
      {/* C=O */}
      <line x1={c1[0] - 9} y1={c1[1]} x2={o[0] - 9} y2={o[1] + 20} stroke={COLORS.white} strokeWidth={7} />
      <line x1={c1[0] + 9} y1={c1[1]} x2={o[0] + 9} y2={o[1] + 20} stroke={COLORS.white} strokeWidth={7} />
      <Atom x={o[0]} y={o[1]} label="O" color={COLORS.oxygen} />
      {/* 메틸 */}
      {bond(c2, me, 'me')}
      <text x={me[0] + 10} y={me[1] - 8} transform={txt(me[0] + 10)} textAnchor={mirrored ? 'end' : 'start'} fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.slate}>
        CH₃
      </text>
      {/* 쐐기(앞쪽) 결합 → 아이소프로펜일 */}
      <polygon points={`${c5[0]},${c5[1]} ${ipr[0] - 8},${ipr[1] + 14} ${ipr[0] + 8},${ipr[1] - 14}`} fill={COLORS.white} />
      <line x1={ipr[0]} y1={ipr[1]} x2={ipr[0] - 50} y2={ipr[1] - 80} stroke={COLORS.white} strokeWidth={7} />
      <line x1={ipr[0] - 12} y1={ipr[1] + 4} x2={ipr[0] - 62} y2={ipr[1] - 76} stroke={COLORS.white} strokeWidth={5} />
      <line x1={ipr[0]} y1={ipr[1]} x2={ipr[0] - 20} y2={ipr[1] + 95} stroke={COLORS.white} strokeWidth={7} />
      <text x={ipr[0] - 90} y={ipr[1] - 86} transform={txt(ipr[0] - 90)} textAnchor={mirrored ? 'end' : 'start'} fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.slate}>
        CH₂
      </text>
      <text x={ipr[0] - 66} y={ipr[1] + 130} transform={txt(ipr[0] - 66)} textAnchor={mirrored ? 'end' : 'start'} fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.slate}>
        CH₃
      </text>
      {/* 비대칭 탄소 */}
      <circle cx={c5[0]} cy={c5[1]} r={30 + 8 * glow} fill={COLORS.pink} opacity={0.25 * glow} />
      <circle cx={c5[0]} cy={c5[1]} r={18} fill={COLORS.pink} />
      <text x={c5[0] + 22} y={c5[1] + 48} transform={txt(c5[0] + 22)} textAnchor={mirrored ? 'end' : 'start'} fontFamily={FONT} fontWeight={900} fontSize={28} fill={COLORS.pink}>
        C*
      </text>
    </g>
  );
};

/**
 * 탈리도마이드 단순 골격 (프탈이미드 + 글루타르이미드). 분홍 = 비대칭 탄소 C3.
 * C3 주변: N(프탈이미드, 왼쪽 위) > C2(=O, 오른쪽 위) > C4(오른쪽 아래) > H(점선 쐐기, 뒤쪽)
 * → 이 배치에서 1→2→3 시계 방향 = (R). 좌우반전하면 (S).
 */
export const Thalidomide: React.FC<{tint?: string}> = ({tint = COLORS.white}) => {
  const hex = (cx: number, cy: number, r: number) =>
    Array.from({length: 6})
      .map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      })
      .join(' ');
  const pent = (cx: number, cy: number, r: number) =>
    Array.from({length: 5})
      .map((_, i) => {
        const a = (i / 5) * Math.PI * 2 + Math.PI;
        return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
      })
      .join(' ');
  // 글루타르이미드 고리 (중심 105,30 / 반지름 62): C3(43,30) C2(74,-24) N(136,-24) C6(167,30) C5(136,84) C4(74,84)
  return (
    <g stroke={tint} strokeWidth={7} fill="none" strokeLinejoin="round">
      {/* 프탈이미드 */}
      <polygon points={hex(-150, 0, 62)} />
      <polygon points={pent(-48, 0, 52)} />
      <line x1={-62} y1={-48} x2={-80} y2={-92} />
      <line x1={-62} y1={48} x2={-80} y2={92} />
      <circle cx={-82} cy={-104} r={16} fill={COLORS.oxygen} stroke="none" />
      <circle cx={-82} cy={104} r={16} fill={COLORS.oxygen} stroke="none" />
      <circle cx={-6} cy={0} r={15} fill={COLORS.nitrogen} stroke="none" />
      {/* N–C3 결합 */}
      <line x1={-6} y1={0} x2={43} y2={30} />
      {/* 글루타르이미드 */}
      <polygon points={hex(105, 30, 62)} />
      <line x1={74} y1={-24} x2={60} y2={-74} />
      <circle cx={56} cy={-88} r={16} fill={COLORS.oxygen} stroke="none" />
      <line x1={167} y1={30} x2={214} y2={30} />
      <circle cx={228} cy={30} r={16} fill={COLORS.oxygen} stroke="none" />
      <circle cx={136} cy={-24} r={14} fill={COLORS.nitrogen} stroke="none" />
      {/* 비대칭 탄소 + 점선 쐐기 H (뒤쪽) */}
      {[0.25, 0.45, 0.65, 0.85].map((k) => (
        <line key={k} x1={43 - 40 * k - 9 * k} y1={30 + 50 * k - 7 * k} x2={43 - 40 * k + 9 * k} y2={30 + 50 * k + 7 * k} strokeWidth={5} />
      ))}
      <text x={-14} y={112} fontFamily={FONT} fontWeight={900} fontSize={28} fill={tint} stroke="none">
        H
      </text>
      <circle cx={43} cy={30} r={17} fill={COLORS.pink} stroke="none" />
    </g>
  );
};
