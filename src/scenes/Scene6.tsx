import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background, Fork, SceneTransition} from '../components/common';
import {COLORS, FONT, PAPER_SHADOW, SCENE_DURATIONS} from '../theme';

const DURATION = SCENE_DURATIONS.scene6;
const SUMMARY_AT = 95; // 요약 카드 등장 프레임

const SUMMARY = [
  '마이크로파가 물 분자를 흔들어 가열',
  '금속 끝에 전하 집중 → 스파크',
  '둥근 금속도 전파 반사 → 안 데워짐',
];

/** Scene 6: 포크 퇴장 + ❌, 둥근 볼의 전파 반사 → 요약 카드 + 구독/좋아요 */
export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // ── Part A: 포크 날아감 + X 표 ──
  const forkFly = interpolate(frame, [6, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.back(1.6)),
  });
  const xStamp = spring({frame: frame - 18, fps, config: {damping: 7, stiffness: 220}});

  // 둥근 볼 + 반사 파동
  const bowlIn = spring({frame: frame - 10, fps, config: {damping: 10, stiffness: 120}});
  const waveT = (frame % 36) / 36;

  // Part A 퇴장
  const partAOut = interpolate(frame, [SUMMARY_AT - 12, SUMMARY_AT], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });

  // ── Part B: 요약 카드 + 버튼 ──
  const cardIn = spring({frame: frame - SUMMARY_AT, fps, config: {damping: 11, stiffness: 120}});
  const btnIn = (i: number) =>
    spring({frame: frame - SUMMARY_AT - 50 - i * 8, fps, config: {damping: 6, stiffness: 180}});
  // 반복 바운스(등장 후 통통 튀기)
  const idleBounce = (i: number) => {
    const t = frame - SUMMARY_AT - 80 - i * 10;
    if (t < 0) return 0;
    return -Math.abs(Math.sin(t * 0.18)) * 26 * Math.exp(-((t % 35) / 60));
  };

  return (
    <SceneTransition duration={DURATION}>
      <Background />

      {/* ───────── Part A ───────── */}
      <AbsoluteFill style={{opacity: 1 - partAOut, transform: `scale(${1 - partAOut * 0.15})`}}>
        <svg width={1080} height={1920} style={{overflow: 'visible'}}>
          {/* 포크: 오른쪽 위로 회전하며 날아감 */}
          <g
            transform={`translate(${300 + forkFly * 900}, ${700 - forkFly * 900}) rotate(${-20 + forkFly * 540})`}
            style={{filter: PAPER_SHADOW}}
          >
            <Fork scale={0.9} />
          </g>
          {/* X 표 */}
          <g transform={`translate(300, 760) scale(${xStamp}) rotate(${interpolate(xStamp, [0, 1], [-45, 0])})`}>
            <circle r={170} fill={COLORS.red} opacity={0.18} />
            <path
              d="M -110 -110 L 110 110 M 110 -110 L -110 110"
              stroke={COLORS.red}
              strokeWidth={46}
              strokeLinecap="round"
              style={{filter: PAPER_SHADOW}}
            />
          </g>
          <text
            x={300}
            y={1010}
            textAnchor="middle"
            fontFamily={FONT}
            fontWeight={900}
            fontSize={56}
            fill={COLORS.paper}
            opacity={xStamp}
          >
            포크 꺼내기!
          </text>

          {/* 둥근 금속 볼 + 튕겨나가는 전파 */}
          <g transform={`translate(780, 1380) scale(${bowlIn})`}>
            {/* 들어오는 파 */}
            {[0, 1].map((i) => {
              const t = (waveT + i * 0.5) % 1;
              const inPhase = t < 0.5;
              const k = inPhase ? t / 0.5 : (t - 0.5) / 0.5;
              // 들어올 때: 위에서 볼 표면으로, 나갈 때: 표면에서 바깥으로 튕김
              const y = inPhase ? -420 + k * 300 : -120 - k * 300;
              const x = inPhase ? -160 + k * 60 : -100 - k * 220;
              return (
                <g key={i} transform={`translate(${x}, ${y})`} opacity={inPhase ? 1 : 1 - k}>
                  <path
                    d="M -50 0 q 12 -24 25 0 t 25 0 t 25 0 t 25 0"
                    stroke={inPhase ? COLORS.teal : COLORS.yellow}
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
            {[0, 1].map((i) => {
              const t = (waveT + i * 0.5) % 1;
              const inPhase = t < 0.5;
              const k = inPhase ? t / 0.5 : (t - 0.5) / 0.5;
              const y = inPhase ? -420 + k * 300 : -120 - k * 300;
              const x = inPhase ? 160 - k * 60 : 100 + k * 220;
              return (
                <g key={`r${i}`} transform={`translate(${x}, ${y})`} opacity={inPhase ? 1 : 1 - k}>
                  <path
                    d="M -50 0 q 12 -24 25 0 t 25 0 t 25 0 t 25 0"
                    stroke={inPhase ? COLORS.teal : COLORS.yellow}
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
            <g style={{filter: PAPER_SHADOW}}>
              <path d="M -230 -100 Q -220 160 0 170 Q 220 160 230 -100 Z" fill={COLORS.metal} />
              <ellipse cx={0} cy={-100} rx={230} ry={40} fill={COLORS.metalDark} />
              <path d="M -170 -40 Q -150 90 -60 120" stroke="#fff" strokeWidth={14} fill="none" opacity={0.5} strokeLinecap="round" />
            </g>
            <text y={270} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={COLORS.paper}>
              둥근 금속 그릇도 ✕
            </text>
          </g>
        </svg>

        <div
          style={{
            position: 'absolute',
            top: 200,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 80,
            color: COLORS.yellow,
            transform: `scale(${spring({frame, fps, config: {damping: 9, stiffness: 140}})})`,
          }}
        >
          금속은 꺼내세요!
        </div>
      </AbsoluteFill>

      {/* ───────── Part B ───────── */}
      {frame >= SUMMARY_AT ? (
        <AbsoluteFill style={{alignItems: 'center', fontFamily: FONT}}>
          <div
            style={{
              marginTop: 300,
              width: 900,
              background: COLORS.paper,
              borderRadius: 40,
              padding: '56px 56px 64px',
              filter: PAPER_SHADOW,
              transform: `translateY(${interpolate(cardIn, [0, 1], [900, 0])}px) rotate(${interpolate(cardIn, [0, 1], [6, -1])}deg)`,
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: COLORS.ink,
                color: COLORS.yellow,
                fontSize: 52,
                fontWeight: 900,
                padding: '10px 28px',
                borderRadius: 14,
                marginBottom: 40,
              }}
            >
              3줄 요약
            </div>
            {SUMMARY.map((line, i) => {
              const li = spring({
                frame: frame - SUMMARY_AT - 14 - i * 8,
                fps,
                config: {damping: 12, stiffness: 150},
              });
              return (
                <div
                  key={line}
                  style={{
                    display: 'flex',
                    gap: 22,
                    alignItems: 'flex-start',
                    fontSize: 46,
                    fontWeight: 700,
                    color: COLORS.ink,
                    lineHeight: 1.35,
                    marginBottom: 30,
                    opacity: li,
                    transform: `translateX(${(1 - li) * -80}px)`,
                  }}
                >
                  <span
                    style={{
                      flex: '0 0 auto',
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      background: [COLORS.teal, COLORS.yellow, COLORS.red][i],
                      color: COLORS.ink,
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span>{line}</span>
                </div>
              );
            })}
          </div>

          {/* 구독 / 좋아요 */}
          <div style={{position: 'absolute', bottom: 260, display: 'flex', gap: 40}}>
            {[
              {label: '👍 좋아요', bg: COLORS.paper, fg: COLORS.ink},
              {label: '🔔 구독', bg: COLORS.red, fg: COLORS.white},
            ].map((b, i) => {
              const s = btnIn(i);
              return (
                <div
                  key={b.label}
                  style={{
                    background: b.bg,
                    color: b.fg,
                    fontSize: 58,
                    fontWeight: 900,
                    padding: '28px 56px',
                    borderRadius: 999,
                    filter: PAPER_SHADOW,
                    transform: `translateY(${idleBounce(i)}px) scale(${s})`,
                  }}
                >
                  {b.label}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}
    </SceneTransition>
  );
};
