import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {COLORS, FONT, FPS, MONO} from '../constants';
import {Thalidomide} from './ChiralMirror';

/**
 * 세레블론(CRBN) 결합 포켓 홀로그램 + (S)-탈리도마이드 도킹 HUD.
 * 단백질은 CSS rotateY 로 회전하는 홀로그램 리본, 리간드는 포켓으로 내려와 결합.
 * 결합 세기 비교: (S)형이 (R)형보다 약 10배 (Mori et al., Sci. Rep. 2018)
 * - t: 로컬 프레임
 */
export const DOCK_TIMELINE = {protein: 0, ligand: 60, docked: 150, bars: 175};
const T = DOCK_TIMELINE;

const Protein: React.FC<{t: number}> = ({t}) => (
  <svg width={900} height={700} viewBox="-450 -350 900 700" style={{overflow: 'visible'}}>
    <defs>
      <filter id="holo" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation={6} />
      </filter>
    </defs>
    {/* 리본(나선) */}
    {Array.from({length: 7}).map((_, i) => {
      const a = (i / 7) * Math.PI * 2;
      const cx = Math.cos(a) * 270;
      const cy = Math.sin(a) * 200;
      let d = '';
      for (let k = 0; k <= 40; k++) {
        const s = k / 40;
        const x = cx + Math.cos(a + Math.PI / 2) * (s - 0.5) * 220 + Math.sin(s * Math.PI * 6 + t * 0.05) * 22;
        const y = cy + Math.sin(a + Math.PI / 2) * (s - 0.5) * 220 + Math.cos(s * Math.PI * 6 + t * 0.05) * 22;
        d += `${k ? 'L' : 'M'} ${x} ${y} `;
      }
      return (
        <g key={i}>
          <path d={d} stroke={COLORS.cyan} strokeWidth={14} fill="none" opacity={0.35} filter="url(#holo)" />
          <path d={d} stroke={COLORS.cyan} strokeWidth={5} fill="none" opacity={0.85} />
        </g>
      );
    })}
    {/* 결합 포켓 */}
    <ellipse rx={150} ry={120} fill={COLORS.violetDeep} opacity={0.2} stroke={COLORS.violet} strokeWidth={4} strokeDasharray="12 10" />
    {/* tri-Trp */}
    {[
      [-120, -70],
      [120, -70],
      [0, 120],
    ].map(([x, y], i) => (
      <g key={i} transform={`translate(${x}, ${y})`}>
        <circle r={30} fill={COLORS.violet} opacity={0.85} />
        <text y={9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={COLORS.bg}>
          Trp
        </text>
      </g>
    ))}
  </svg>
);

export const MolecularDockingHUD: React.FC<{t: number}> = ({t}) => {
  const pIn = spring({frame: t - T.protein, fps: FPS, config: {damping: 13, stiffness: 100}});
  const rotY = Math.sin(t * 0.03) * 28;
  const land = interpolate(t, [T.ligand, T.docked], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.1))});
  const lockFlash = interpolate(t, [T.docked, T.docked + 6, T.docked + 24], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const progress = Math.round(interpolate(t, [T.ligand, T.docked], [0, 100], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const bar = (i: number) => spring({frame: t - T.bars - i * 8, fps: FPS, config: {damping: 14, stiffness: 110}});

  return (
    <>
      {/* 회전 홀로그램 단백질 */}
      <div style={{position: 'absolute', left: 90, top: 560, width: 900, height: 700, perspective: 1600, opacity: pIn}}>
        <div style={{width: '100%', height: '100%', transform: `rotateY(${rotY}deg) scale(${0.8 + pIn * 0.2})`, transformStyle: 'preserve-3d'}}>
          <Protein t={t} />
        </div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        {/* HUD 프레임 */}
        <g opacity={pIn}>
          {[
            'M 70 600 V 540 H 130',
            'M 950 540 H 1010 V 600',
            'M 1010 1220 V 1280 H 950',
            'M 130 1280 H 70 V 1220',
          ].map((d) => (
            <path key={d} d={d} stroke={COLORS.cyan} strokeWidth={6} fill="none" />
          ))}
          <text x={90} y={590} fontFamily={MONO} fontWeight={700} fontSize={26} fill={COLORS.cyan}>
            CRBN · tri-Trp pocket
          </text>
          <text x={990} y={590} textAnchor="end" fontFamily={MONO} fontWeight={700} fontSize={26} fill={t >= T.docked ? COLORS.green : COLORS.amber}>
            {t >= T.docked ? 'DOCKED ✓' : `DOCKING ${progress}%`}
          </text>
        </g>
        {/* (S)-탈리도마이드 리간드: 거울상이므로 좌우반전 */}
        <g transform={`translate(${interpolate(land, [0, 1], [760, 540])}, ${interpolate(land, [0, 1], [380, 910])}) scale(0.55) rotate(${(1 - land) * 60})`} opacity={t >= T.ligand ? 1 : 0}>
          <g transform="scale(-1, 1)">
            <Thalidomide tint={COLORS.pink} />
          </g>
        </g>
        {t >= T.ligand ? (
          <text x={interpolate(land, [0, 1], [760, 540])} y={interpolate(land, [0, 1], [300, 830])} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={COLORS.pink}>
            (S)-탈리도마이드
          </text>
        ) : null}
        <circle cx={540} cy={910} r={60 + lockFlash * 140} fill="none" stroke={COLORS.green} strokeWidth={8} opacity={lockFlash} />

        {/* 결합 세기 비교 */}
        {t >= T.bars ? (
          <g transform="translate(90, 1340)">
            <text x={0} y={0} fontFamily={FONT} fontWeight={900} fontSize={32} fill={COLORS.white}>
              세레블론 결합 세기 (상대값)
            </text>
            {[
              {label: '(R)형', val: 1, color: COLORS.slate},
              {label: '(S)형', val: 10, color: COLORS.pink},
            ].map((b, i) => (
              <g key={b.label} transform={`translate(0, ${40 + i * 70})`}>
                <text x={0} y={34} fontFamily={FONT} fontWeight={900} fontSize={32} fill={b.color}>
                  {b.label}
                </text>
                <rect x={120} y={6} width={680} height={40} rx={20} fill={COLORS.panelLine} />
                <rect x={120} y={6} width={68 * b.val * bar(i)} height={40} rx={20} fill={b.color} />
                <text x={820} y={36} fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.white}>
                  ×{b.val === 1 ? '1' : '약 10'}
                </text>
              </g>
            ))}
            <text x={0} y={230} fontFamily={FONT} fontWeight={700} fontSize={24} fill={COLORS.slate}>
              근거: Mori et al., Sci. Rep. 8, 1294 (2018) · 그래프는 개념도
            </text>
          </g>
        ) : null}
      </svg>
    </>
  );
};
