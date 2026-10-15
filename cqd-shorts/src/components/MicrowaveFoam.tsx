import React from 'react';
import {interpolate, interpolateColors, random} from 'remotion';
import {COLORS, FONT, MONO} from '../constants';

/**
 * 전자레인지 속 비커: 회전 턴테이블 + 가열 펄스 + 탄화 거품.
 * - heat: 0~1 누적 가열량 (투명 → 노랑 → 갈색 머핀 거품)
 * - on: 마이크로파 작동 중 여부
 * - timer: 남은 초 표시
 * - t: 로컬 프레임 (회전·거품 흔들림)
 */
export const MicrowaveFoam: React.FC<{heat: number; on: boolean; timer: number; t: number}> = ({heat, on, timer, t}) => {
  const W = 900;
  const H = 600;
  const cav = {x: 50, y: 50, w: 600, h: 500};
  const cx = cav.x + cav.w / 2;
  const plateY = cav.y + cav.h - 60;

  // 비커 (턴테이블 위, 회전은 좌우 이동 + 원근 스케일로 표현)
  const rot = t * 0.06;
  const bx = cx + Math.sin(rot) * 50;
  const depth = 0.92 + Math.cos(rot) * 0.08;
  const bw = 200;
  const bh = 220;
  const bottom = plateY - 6;

  // 단계별 색
  const liquidColor = interpolateColors(heat, [0, 0.3, 0.6, 1], ['#e0f2fe', COLORS.foamYellow, '#b45309', COLORS.foamDark]);
  const liquidOp = interpolate(heat, [0, 0.3], [0.35, 0.9], {extrapolateRight: 'clamp'});
  const liquidH = interpolate(heat, [0, 0.4], [90, 70], {extrapolateRight: 'clamp'});
  // 거품(머핀) 높이: 0.35 이후 급격히 부풂
  const foam = interpolate(heat, [0.35, 0.9], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const foamColor = interpolateColors(heat, [0.35, 0.7, 1], [COLORS.foamYellow, COLORS.foamBrown, COLORS.foamDark]);
  const domeH = 40 + foam * 200;
  const surfaceY = bottom - liquidH;

  return (
    <g>
      {/* 본체 */}
      <rect x={0} y={0} width={W} height={H} rx={40} fill="#cbd5e1" />
      <rect x={cav.x} y={cav.y} width={cav.w} height={cav.h} rx={20} fill="#111827" />
      {/* 내부 조명 */}
      <rect x={cav.x} y={cav.y} width={cav.w} height={cav.h} rx={20} fill={COLORS.foamYellow} opacity={on ? 0.18 + 0.06 * Math.sin(t * 0.8) : 0.04} />
      {/* 마이크로파 물결 */}
      {on
        ? [0, 1, 2].map((i) => {
            const k = ((t * 0.05 + i / 3) % 1);
            return <circle key={i} cx={cx} cy={surfaceY - 60} r={60 + k * 220} fill="none" stroke="#fde68a" strokeWidth={4} opacity={(1 - k) * 0.5} />;
          })
        : null}
      {/* 턴테이블 */}
      <ellipse cx={cx} cy={plateY} rx={240} ry={30} fill="#374151" stroke="#6b7280" strokeWidth={3} />

      {/* 비커 */}
      <g transform={`translate(${bx}, ${bottom}) scale(${depth}, 1) translate(${-bx}, ${-bottom})`}>
        <defs>
          <clipPath id="beakerIn">
            <rect x={bx - bw / 2 + 6} y={bottom - bh} width={bw - 12} height={bh - 6} />
          </clipPath>
        </defs>
        <g clipPath="url(#beakerIn)">
          <rect x={bx - bw / 2} y={surfaceY} width={bw} height={liquidH} fill={liquidColor} opacity={liquidOp} />
        </g>
        {/* 탄화 거품 머핀 (비커 위로 부풀어 넘침) */}
        {foam > 0 ? (
          <g>
            <path
              d={`M ${bx - bw / 2 - foam * 20} ${surfaceY} Q ${bx - bw / 2 - foam * 30} ${surfaceY - domeH} ${bx} ${surfaceY - domeH} Q ${bx + bw / 2 + foam * 30} ${surfaceY - domeH} ${bx + bw / 2 + foam * 20} ${surfaceY} Z`}
              fill={foamColor}
            />
            {/* 기포 */}
            {Array.from({length: 22}).map((_, i) => {
              const px = bx + (random(`fx${i}`) - 0.5) * (bw + foam * 30);
              const py = surfaceY - random(`fy${i}`) * domeH * 0.9;
              const r = (6 + random(`fr${i}`) * 16) * (0.6 + 0.4 * Math.sin(t * 0.2 + i));
              return <circle key={i} cx={px} cy={py} r={Math.max(2, r * foam)} fill="#fde68a" opacity={0.25} stroke="#fef3c7" strokeOpacity={0.4} strokeWidth={2} />;
            })}
          </g>
        ) : null}
        {/* 김 */}
        {on && heat > 0.2
          ? [0, 1].map((i) => {
              const k = ((t * 0.04 + i * 0.5) % 1);
              return (
                <path
                  key={i}
                  d={`M ${bx - 30 + i * 60} ${surfaceY - domeH - 10 - k * 80} q 14 -20 0 -40 q -14 -20 0 -40`}
                  stroke="#e2e8f0"
                  strokeWidth={6}
                  fill="none"
                  opacity={(1 - k) * 0.6}
                  strokeLinecap="round"
                />
              );
            })
          : null}
        <path d={`M ${bx - bw / 2} ${bottom - bh} V ${bottom} H ${bx + bw / 2} V ${bottom - bh}`} stroke="#e2e8f0" strokeWidth={6} fill="none" opacity={0.85} />
      </g>

      {/* 유리문 반사 */}
      <path d={`M ${cav.x + 40} ${cav.y + 30} L ${cav.x + 90} ${cav.y + 30} L ${cav.x + 40} ${cav.y + 200} L ${cav.x + 20} ${cav.y + 200} Z`} fill="#ffffff" opacity={0.12} />

      {/* 패널 */}
      <rect x={690} y={70} width={170} height={90} rx={12} fill="#0b1120" />
      <text x={775} y={130} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={44} fill={on ? COLORS.lime : COLORS.slate}>
        00:{String(Math.max(0, Math.ceil(timer))).padStart(2, '0')}
      </text>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={775} cy={230 + i * 90} r={30} fill="#94a3b8" />
      ))}
      <text x={775} y={520} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={28} fill={on ? COLORS.red : '#475569'}>
        {on ? '● 가열 중' : '대기'}
      </text>
    </g>
  );
};
