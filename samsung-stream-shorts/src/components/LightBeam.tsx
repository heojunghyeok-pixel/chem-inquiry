import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {COLORS, FONT, MONO} from '../constants';

/**
 * 큐벳을 통과하며 감쇠하는 광선 (SVG <g>).
 * 광원(x0) → 큐벳 입구(xIn) → 큐벳 출구(xOut) → 검출기(x2)
 * - transmittance: 투과율 T = I/I₀ (0~1). 큐벳 내부에서 T^(깊이) 로 지수 감쇠.
 * - progress: 0~1 빔이 뻗어나간 정도
 * 광자 입자 중 (1 - T) 비율이 큐벳 안에서 흡수되어 사라진다.
 */
export const LightBeam: React.FC<{
  x0: number;
  xIn: number;
  xOut: number;
  x2: number;
  y: number;
  width?: number;
  transmittance: number;
  progress: number;
  color?: string;
  showLabels?: boolean;
}> = ({x0, xIn, xOut, x2, y, width = 70, transmittance, progress, color = COLORS.beam, showLabels = true}) => {
  const frame = useCurrentFrame();
  const id = `beam${React.useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const T = Math.max(0.001, Math.min(1, transmittance));
  const total = x2 - x0;
  const head = x0 + total * progress;

  // 출구 빔 두께: 밝기(T)와 함께 줄어드는 시각적 표현
  const wOut = width * (0.35 + 0.65 * T);
  const baseOpacity = 0.95;

  // 큐벳 내부 지수 감쇠 그라디언트 정지점
  const stops = Array.from({length: 6}).map((_, i) => {
    const t = i / 5;
    return {offset: `${t * 100}%`, opacity: baseOpacity * Math.pow(T, t)};
  });

  const N = 28;
  const speed = 16;
  const photons = Array.from({length: N}).map((_, i) => {
    const s = (frame * speed + (i * total) / N) % total;
    const px = x0 + s;
    const absorbed = random(`ab${i}`) > T;
    const depth = random(`dp${i}`);
    const absorbAt = xIn + depth * (xOut - xIn);
    const lane = (random(`ln${i}`) - 0.5) * 0.7;
    const laneW = px < xIn ? width : px > xOut ? wOut : width + (wOut - width) * ((px - xIn) / (xOut - xIn));
    return {i, px, py: y + lane * laneW, visible: px <= head && !(absorbed && px > absorbAt), absorbed, absorbAt};
  });

  return (
    <g>
      <defs>
        <clipPath id={`${id}-reach`}>
          <rect x={x0} y={y - width * 2} width={Math.max(0, head - x0)} height={width * 4} />
        </clipPath>
        <linearGradient id={`${id}-inside`} x1="0" x2="1">
          {stops.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={color} stopOpacity={s.opacity} />
          ))}
        </linearGradient>
        <filter id={`${id}-blur`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
      </defs>

      <g clipPath={`url(#${id}-reach)`}>
        {/* 글로우 */}
        <g filter={`url(#${id}-blur)`} opacity={0.7}>
          <rect x={x0} y={y - width * 0.8} width={xIn - x0} height={width * 1.6} fill={color} />
          <rect x={xOut} y={y - wOut * 0.8} width={x2 - xOut} height={wOut * 1.6} fill={color} opacity={T} />
        </g>
        {/* I₀ 구간 */}
        <rect x={x0} y={y - width / 2} width={xIn - x0} height={width} fill={color} opacity={baseOpacity} />
        <rect x={x0} y={y - width / 6} width={xIn - x0} height={width / 3} fill="#ffffff" opacity={0.7} />
        {/* 큐벳 내부: 지수 감쇠 */}
        <polygon
          points={`${xIn},${y - width / 2} ${xOut},${y - wOut / 2} ${xOut},${y + wOut / 2} ${xIn},${y + width / 2}`}
          fill={`url(#${id}-inside)`}
        />
        {/* I 구간 */}
        <rect x={xOut} y={y - wOut / 2} width={x2 - xOut} height={wOut} fill={color} opacity={baseOpacity * T} />
        <rect x={xOut} y={y - wOut / 6} width={x2 - xOut} height={wOut / 3} fill="#ffffff" opacity={0.7 * T} />
      </g>

      {/* 광자 입자 */}
      {photons.map((p) =>
        p.visible ? <circle key={p.i} cx={p.px} cy={p.py} r={5} fill="#ffffff" opacity={0.9} /> : null,
      )}
      {/* 흡수 순간 반짝임 */}
      {photons.map((p) =>
        p.absorbed && p.px > p.absorbAt && p.px - p.absorbAt < speed * 3 && p.absorbAt <= head ? (
          <circle key={`f${p.i}`} cx={p.absorbAt} cy={p.py} r={10 + (p.px - p.absorbAt) / 2} fill="none" stroke={COLORS.amber} strokeWidth={3} opacity={1 - (p.px - p.absorbAt) / (speed * 3)} />
        ) : null,
      )}

      {showLabels ? (
        <g fontFamily={MONO} fontWeight={700}>
          <text x={(x0 + xIn) / 2} y={y - width / 2 - 24} textAnchor="middle" fontSize={40} fill={COLORS.white} opacity={progress > 0.1 ? 1 : 0}>
            I₀
          </text>
          <text x={(xOut + x2) / 2} y={y - wOut / 2 - 24} textAnchor="middle" fontSize={40} fill={COLORS.white} opacity={progress > 0.95 ? 1 : 0}>
            I
          </text>
          <text x={(x0 + xIn) / 2} y={y + width / 2 + 46} textAnchor="middle" fontFamily={FONT} fontSize={26} fill={COLORS.slate} opacity={progress > 0.1 ? 1 : 0}>
            880 nm
          </text>
        </g>
      ) : null}
    </g>
  );
};
