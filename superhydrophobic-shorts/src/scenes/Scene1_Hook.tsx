import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {KeywordCaption, SceneFrame} from '../components/Typography';
import {WaterDroplet} from '../components/WaterDroplet';
import {COLORS, sceneDuration} from '../constants';

const DURATION = sceneDuration('hook');

// 연잎(타원) 형상
const LEAF = {cx: 540, cy: 1480, rx: 470, ry: 150};
const DROP_R = 72;
const IMPACT = 64; // 물방울 착지 프레임

const leafTopY = (x: number) => {
  const k = Math.min(1, Math.abs(x - LEAF.cx) / LEAF.rx);
  return LEAF.cy - LEAF.ry * Math.sqrt(1 - k * k);
};

/** 사선 빗줄기 */
const Rain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      {Array.from({length: 46}).map((_, i) => {
        const speed = 38 + random(`rs${i}`) * 22;
        const len = 60 + random(`rl${i}`) * 80;
        const span = 1920 + 400;
        const y = ((random(`ry${i}`) * span + frame * speed) % span) - 200;
        const x = random(`rx${i}`) * 1400 - y * 0.25;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={x - len * 0.25}
            y2={y + len}
            stroke={COLORS.water}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.25 + random(`ro${i}`) * 0.35}
          />
        );
      })}
    </svg>
  );
};

/** Scene 1: 비 오는 날 연잎 위 물방울 */
export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // 연잎이 아래에서 스프링으로 솟아오름
  const leafIn = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 90}});
  const leafWave = Math.sin(frame * 0.05) * 2; // 바람에 살짝 흔들림(도)

  // 물방울 낙하 → 착지 바운스 → 좌우 롤링
  const rollStart = 100;
  const rollAmp = interpolate(frame, [rollStart, rollStart + 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const rollPhase = Math.max(0, frame - rollStart) * 0.045;
  const x = LEAF.cx + Math.sin(rollPhase) * 300 * rollAmp;
  const restY = leafTopY(x) - DROP_R;

  let y: number;
  if (frame < IMPACT) {
    const t = interpolate(frame, [36, IMPACT], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.quad),
    });
    y = interpolate(t, [0, 1], [-200, restY]);
  } else {
    // 착지 후 '톡' 튀어오르는 감쇠 바운스
    const s = frame - IMPACT;
    y = restY - Math.abs(Math.sin(s * 0.32)) * 110 * Math.exp(-s / 9);
  }
  const sinceImpact = frame - IMPACT;
  const squash =
    frame < IMPACT
      ? interpolate(frame, [36, IMPACT], [1, 0.82], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
      : 1 + 0.32 * Math.exp(-sinceImpact / 5) * Math.cos(sinceImpact * 0.6);

  // 굴러간 거리 / 반지름 → 회전각
  const roll = (((x - LEAF.cx) / DROP_R) * 180) / Math.PI;

  // 착지 순간 튀는 물보라 링
  const ring = interpolate(sinceImpact, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <SceneFrame
      duration={DURATION}
      background={`radial-gradient(circle at 50% 30%, #0b6b50 0%, ${COLORS.emerald} 45%, ${COLORS.emeraldDeep} 100%)`}
    >
      <Rain />

      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {/* 연잎 줄기 */}
          <g transform={`translate(0, ${(1 - leafIn) * 700})`}>
            <rect x={LEAF.cx - 22} y={LEAF.cy} width={44} height={600} rx={20} fill={COLORS.leafDark} />
            <g transform={`rotate(${leafWave} ${LEAF.cx} ${LEAF.cy})`}>
              <ellipse cx={LEAF.cx} cy={LEAF.cy + 20} rx={LEAF.rx} ry={LEAF.ry} fill={COLORS.leafDark} />
              <ellipse cx={LEAF.cx} cy={LEAF.cy} rx={LEAF.rx} ry={LEAF.ry} fill={COLORS.leaf} />
              {/* 잎맥 */}
              {Array.from({length: 14}).map((_, i) => {
                const a = (i / 14) * Math.PI * 2;
                return (
                  <line
                    key={i}
                    x1={LEAF.cx}
                    y1={LEAF.cy}
                    x2={LEAF.cx + Math.cos(a) * LEAF.rx * 0.92}
                    y2={LEAF.cy + Math.sin(a) * LEAF.ry * 0.92}
                    stroke={COLORS.leafLight}
                    strokeWidth={4}
                    opacity={0.45}
                  />
                );
              })}
              <circle cx={LEAF.cx} cy={LEAF.cy} r={16} fill={COLORS.leafLight} opacity={0.7} />
              {/* 물보라 링 */}
              {frame >= IMPACT ? (
                <ellipse
                  cx={LEAF.cx}
                  cy={leafTopY(LEAF.cx)}
                  rx={60 + ring * 160}
                  ry={14 + ring * 30}
                  fill="none"
                  stroke={COLORS.water}
                  strokeWidth={6}
                  opacity={1 - ring}
                />
              ) : null}
            </g>
          </g>

          {frame >= 36 ? <WaterDroplet cx={x} cy={y} r={DROP_R} squash={squash} roll={roll} /> : null}
        </svg>
      </AbsoluteFill>

      <KeywordCaption lines={['비 오는 날,', '연잎은 왜 젖지 않을까?']} delay={6} exitAt={118} top={260} size={78} />
      <KeywordCaption
        lines={['연잎 효과', '(Lotus Effect)']}
        sub="물방울이 스며들지 않고 구슬처럼 굴러간다"
        delay={132}
        top={260}
        size={92}
        accent={COLORS.lime}
      />
    </SceneFrame>
  );
};
