import React from 'react';
import {Easing, interpolate, spring} from 'remotion';
import {COLORS, FE_CONC, FONT, FPS, MONO, SENSOR} from '../constants';

/**
 * 96홀 플레이트 형광 소광 센서 + AI 판정 HUD (SVG <g>, 원점 = 플레이트 좌상단).
 * - t: 로컬 프레임
 * 타임라인: Na⁺ 40 → Ca²⁺ 100 → Fe³⁺ 160 (176 소광) → AI 타겟팅 200 → 판정 250
 */
const ROWS = 8;
const COLS = 12;
const PITCH = 70;
const PAD = 60;
export const PLATE_W = PAD * 2 + PITCH * (COLS - 1);
export const PLATE_H = PAD * 2 + PITCH * (ROWS - 1);

const TARGET_ROW = 3;
const TARGETS = [
  {col: 2, at: 40, ...SENSOR[0]},
  {col: 6, at: 100, ...SENSOR[1]},
  {col: 9, at: 160, ...SENSOR[2]},
];
const QUENCH_AT = 176;
const AIM_AT = 200;
const RESULT_AT = 250;

const wellPos = (r: number, c: number) => ({x: PAD + c * PITCH, y: PAD + r * PITCH});
const sp = (t: number, delay: number, damping = 10, stiffness = 150) => spring({frame: t - delay, fps: FPS, config: {damping, stiffness}});

export const QuenchingSensorHUD: React.FC<{t: number}> = ({t}) => {
  const glowBase = 0.85 + 0.15 * Math.sin(t * 0.15);
  const fe = TARGETS[2];
  const fePos = wellPos(TARGET_ROW, fe.col);

  // Fe³⁺ 소광: '탁!' 하고 급격히 꺼짐 (짧은 깜빡임 후)
  const quench = t < QUENCH_AT ? 1 : t < QUENCH_AT + 4 ? (t % 2 === 0 ? 0.6 : 0.2) : fe.intensity;
  const tak = interpolate(t, [QUENCH_AT, QUENCH_AT + 6, QUENCH_AT + 30], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // AI 카메라 프레임: 플레이트 전체 → Fe 홀로 수렴
  const aim = sp(t, AIM_AT, 12, 110);
  const fx = interpolate(aim, [0, 1], [0, fePos.x - 60]);
  const fy = interpolate(aim, [0, 1], [0, fePos.y - 60]);
  const fw = interpolate(aim, [0, 1], [PLATE_W, 120]);
  const fh = interpolate(aim, [0, 1], [PLATE_H, 120]);
  const aimOpacity = interpolate(t, [AIM_AT - 10, AIM_AT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const result = sp(t, RESULT_AT, 8, 170);
  const blink = Math.floor(t / 8) % 2 === 0;

  const corner = (x: number, y: number, w: number, h: number, L: number) =>
    [
      `M ${x} ${y + L} V ${y} H ${x + L}`,
      `M ${x + w - L} ${y} H ${x + w} V ${y + L}`,
      `M ${x + w} ${y + h - L} V ${y + h} H ${x + w - L}`,
      `M ${x + L} ${y + h} H ${x} V ${y + h - L}`,
    ];

  return (
    <g>
      <defs>
        <filter id="wellBlur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation={10} />
        </filter>
      </defs>
      {/* 플레이트 */}
      <rect x={0} y={0} width={PLATE_W} height={PLATE_H} rx={30} fill="#0b1226" stroke={COLORS.panelLine} strokeWidth={5} />
      {Array.from({length: ROWS}).map((_, r) => (
        <text key={r} x={22} y={PAD + r * PITCH + 9} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={22} fill={COLORS.slate}>
          {'ABCDEFGH'[r]}
        </text>
      ))}
      {Array.from({length: ROWS * COLS}).map((_, i) => {
        const r = Math.floor(i / COLS);
        const c = i % COLS;
        const {x, y} = wellPos(r, c);
        const target = r === TARGET_ROW ? TARGETS.find((tg) => tg.col === c) : undefined;
        let k = glowBase;
        if (target === fe) k = quench * glowBase;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={30} fill={COLORS.cyan} opacity={0.55 * k} filter="url(#wellBlur)" />
            <circle cx={x} cy={y} r={24} fill={k > 0.3 ? COLORS.cyan : '#164e63'} opacity={0.25 + 0.75 * k} />
            <circle cx={x - 7} cy={y - 7} r={6} fill="#ffffff" opacity={0.5 * k} />
          </g>
        );
      })}

      {/* 이온 방울 투하 */}
      {TARGETS.map((tg) => {
        const {x, y} = wellPos(TARGET_ROW, tg.col);
        const fall = interpolate(t, [tg.at, tg.at + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.quad)});
        const tipIn = interpolate(t, [tg.at - 16, tg.at - 4, tg.at + 20, tg.at + 30], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const isFe = tg === fe;
        return (
          <g key={tg.ion}>
            {/* 피펫 팁 */}
            <g opacity={tipIn} transform={`translate(${x}, ${y - 230})`}>
              <rect x={-18} y={-90} width={36} height={70} rx={8} fill="#e2e8f0" />
              <path d="M -12 -20 L 12 -20 L 3 40 L -3 40 Z" fill="#e2e8f0" />
              <text y={-110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={isFe ? '#fb923c' : COLORS.white}>
                {tg.ion}
              </text>
            </g>
            {fall > 0 && fall < 1 ? <ellipse cx={x} cy={y - 180 + fall * 170} rx={10} ry={14} fill={isFe ? '#f97316' : '#e0f2fe'} /> : null}
            {/* 반응 결과 라벨 */}
            {t > tg.at + 18 ? (
              <text x={x} y={y + 64} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={isFe && t >= QUENCH_AT ? COLORS.red : COLORS.cyan}>
                {isFe && t >= QUENCH_AT ? '소광!' : '유지'}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* '탁!' */}
      {tak > 0 ? (
        <text x={fePos.x + 70} y={fePos.y - 70} fontFamily={FONT} fontWeight={900} fontSize={80} fill={COLORS.white} opacity={tak} transform={`rotate(-12 ${fePos.x + 70} ${fePos.y - 70})`}>
          탁!
        </text>
      ) : null}

      {/* AI 카메라 프레임 */}
      {t >= AIM_AT - 10 ? (
        <g opacity={aimOpacity}>
          {corner(fx, fy, fw, fh, 40).map((d) => (
            <path key={d} d={d} stroke={COLORS.lime} strokeWidth={8} fill="none" strokeLinecap="round" />
          ))}
          {aim > 0.95 ? (
            <g>
              <line x1={fePos.x - 80} y1={fePos.y} x2={fePos.x + 80} y2={fePos.y} stroke={COLORS.lime} strokeWidth={3} />
              <line x1={fePos.x} y1={fePos.y - 80} x2={fePos.x} y2={fePos.y + 80} stroke={COLORS.lime} strokeWidth={3} />
              <rect x={fePos.x + 70} y={fePos.y - 110} width={210} height={44} rx={8} fill={COLORS.lime} />
              <text x={fePos.x + 175} y={fePos.y - 79} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={24} fill={COLORS.bg}>
                TARGET LOCKED
              </text>
            </g>
          ) : null}
        </g>
      ) : null}

      {/* 형광 세기 막대 */}
      <g transform={`translate(0, ${PLATE_H + 60})`}>
        {TARGETS.map((tg, i) => {
          const shown = t > tg.at + 18;
          const val = tg === fe ? (t >= QUENCH_AT ? fe.intensity : 1) : tg.intensity;
          const grow = sp(t, tg.at + 18, 14, 120);
          const bw = (PLATE_W - 260) * val * (shown ? grow : 0);
          return (
            <g key={tg.ion} transform={`translate(0, ${i * 62})`}>
              <text x={0} y={34} fontFamily={MONO} fontWeight={700} fontSize={32} fill={COLORS.white}>
                {tg.ion}
              </text>
              <rect x={120} y={6} width={PLATE_W - 260} height={36} rx={18} fill={COLORS.panelLine} />
              <rect x={120} y={6} width={bw} height={36} rx={18} fill={tg === fe && t >= QUENCH_AT ? COLORS.red : COLORS.cyan} />
              {shown ? (
                <text x={PLATE_W - 120} y={34} fontFamily={MONO} fontWeight={700} fontSize={30} fill={COLORS.slate}>
                  {Math.round(val * 100)}%
                </text>
              ) : null}
            </g>
          );
        })}
        <text x={0} y={220} fontFamily={FONT} fontWeight={700} fontSize={24} fill={COLORS.slate}>
          상대 형광 세기 (※ 영상용 예시 데이터)
        </text>
      </g>

      {/* AI 판정 배너 */}
      {t >= RESULT_AT ? (
        <g transform={`translate(${PLATE_W / 2}, ${PLATE_H + 340}) scale(${result})`}>
          <rect x={-PLATE_W / 2} y={-60} width={PLATE_W} height={120} rx={20} fill="#1a0b10" stroke={blink ? COLORS.red : '#9f1239'} strokeWidth={5} />
          <polygon points="-400,-26 -372,24 -428,24" fill={COLORS.yellow} />
          <text x={-400} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={COLORS.bg}>
            !
          </text>
          <text x={20} y={12} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={COLORS.white}>
            [ Fe³⁺ 농도 {FE_CONC} 검출! 중금속 경고 ]
          </text>
        </g>
      ) : null}
    </g>
  );
};
