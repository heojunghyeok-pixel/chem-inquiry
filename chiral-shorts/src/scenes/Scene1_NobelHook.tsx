import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Carvone, Hand, MirrorPair} from '../components/ChiralMirror';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {COLORS, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('nobel');
const HANDS_AT = 110;
const CARVONE_AT = 270;

/** 황금 엠블럼 (일반 메달 그래픽) */
const Emblem: React.FC<{shine: number}> = ({shine}) => (
  <g>
    <circle r={210} fill={COLORS.goldDark} />
    <circle r={194} fill={COLORS.gold} />
    <circle r={168} fill="none" stroke={COLORS.goldDark} strokeWidth={6} />
    {/* 거울 대칭 장식 */}
    <line x1={0} y1={-150} x2={0} y2={150} stroke={COLORS.goldDark} strokeWidth={4} strokeDasharray="10 8" />
    <text y={-40} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={COLORS.goldDark}>
      2026
    </text>
    <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={COLORS.goldDark}>
      노벨 화학상
    </text>
    <text y={90} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={COLORS.goldDark}>
      비대칭 합성
    </text>
    <ellipse cx={-80 + shine * 160} cy={-90} rx={22} ry={120} fill="#ffffff" opacity={0.3} transform={`rotate(25 ${-80 + shine * 160} -90)`} />
  </g>
);

/** Scene 1: 2026 노벨 화학상 → 거울상 손 → (R)/(S)-카르본 */
export const Scene1NobelHook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const emblemIn = spring({frame: frame - 6, fps, config: {damping: 7, stiffness: 120}});
  const emblemOut = interpolate(frame, [HANDS_AT - 18, HANDS_AT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const shine = (frame % 60) / 60;

  const handsIn = spring({frame: frame - HANDS_AT, fps, config: {damping: 11, stiffness: 100}});
  const handsOut = interpolate(frame, [CARVONE_AT - 15, CARVONE_AT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const mirrorLine = interpolate(frame, [HANDS_AT, HANDS_AT + 25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // 손: 겹쳐 보려고 돌려도 안 겹침 → rotateY 왕복
  const handAngle = Math.sin((frame - HANDS_AT) * 0.05) * 35;

  const carIn = spring({frame: frame - CARVONE_AT, fps, config: {damping: 11, stiffness: 100}});
  const carAngle = Math.sin((frame - CARVONE_AT) * 0.045) * 40;
  const glow = 0.6 + 0.4 * Math.sin(frame * 0.2);

  return (
    <SceneFrame duration={DURATION}>
      {/* 엠블럼 */}
      {frame < HANDS_AT ? (
        <AbsoluteFill>
          <svg width={1080} height={1920}>
            <g transform={`translate(540, 1000) scale(${emblemIn * (1 - emblemOut)}) rotate(${(1 - emblemIn) * -30})`}>
              <Emblem shine={shine} />
            </g>
            <text x={540} y={1300} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={30} fill={COLORS.gold} opacity={emblemIn * (1 - emblemOut)}>
              앙리 카강 · 소아이 겐소
            </text>
            <text x={540} y={1350} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill={COLORS.slate} opacity={emblemIn * (1 - emblemOut)}>
              비대칭 유기 합성의 비선형 효과와 자가촉매 발견
            </text>
          </svg>
        </AbsoluteFill>
      ) : null}

      {/* 거울상 손 */}
      {frame >= HANDS_AT && frame < CARVONE_AT ? (
        <AbsoluteFill style={{opacity: 1 - handsOut}}>
          <MirrorPair
            y={1000}
            size={460}
            gap={250}
            angle={handAngle}
            enter={handsIn}
            mirror={mirrorLine}
            labels={[
              <div key="l" style={{fontSize: 40, fontWeight: 900, color: COLORS.violet}}>왼손</div>,
              <div key="r" style={{fontSize: 40, fontWeight: 900, color: COLORS.violet}}>오른손</div>,
            ]}
          >
            <Hand />
          </MirrorPair>
          <div style={{position: 'absolute', top: 1420, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 40, color: COLORS.white, opacity: handsIn}}>
            거울에 비친 모습이지만, 아무리 돌려도 겹쳐지지 않는다
          </div>
        </AbsoluteFill>
      ) : null}

      {/* (R)/(S)-카르본 */}
      {frame >= CARVONE_AT ? (
        <AbsoluteFill>
          <MirrorPair
            y={980}
            size={440}
            gap={285}
            angle={carAngle}
            enter={carIn}
            mirror={1}
            labels={[
              <div key="r">
                <div style={{fontSize: 40, fontWeight: 900, color: COLORS.green}}>(R)-카르본</div>
                <div style={{fontSize: 32, fontWeight: 700, color: COLORS.white, marginTop: 6}}>🌿 스피어민트 향</div>
              </div>,
              <div key="s">
                <div style={{fontSize: 40, fontWeight: 900, color: COLORS.amber}}>(S)-카르본</div>
                <div style={{fontSize: 32, fontWeight: 700, color: COLORS.white, marginTop: 6}}>🍞 캐러웨이(호밀빵) 향</div>
              </div>,
            ]}
          >
            {(mirrored: boolean) => <Carvone glow={glow} mirrored={mirrored} />}
          </MirrorPair>
        </AbsoluteFill>
      ) : null}

      <Headline lines={['2026 노벨 화학상:', '두 얼굴의 거울상 분자를 정복하라!']} delay={6} top={180} size={68} accent={COLORS.violet} />
      <Subtitle text="분홍 탄소 = 비대칭 탄소(카이랄 중심): 네 손이 모두 다르다" delay={CARVONE_AT + 30} bottom={170} />
    </SceneFrame>
  );
};
