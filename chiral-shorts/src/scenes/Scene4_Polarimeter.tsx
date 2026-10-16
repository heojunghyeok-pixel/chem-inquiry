import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PolarimeterLight} from '../components/PolarimeterLight';
import {Headline, SceneFrame, Subtitle} from '../components/Typography';
import {ALPHA_OBS, COLORS, CONC_G_ML, EE, FONT, MONO, PATH_DM, sceneDuration, SPEC_ROT_OBS, SPEC_ROT_PURE} from '../constants';

const DURATION = sceneDuration('polarimeter');
const OPTICS_AT = 70;
const HUD_AT = 330;
const VIS_ANGLE = 37; // 화면용 과장 회전각 (실제 관측 α 는 ALPHA_OBS)

/** 무선 편광계 실루엣 (일반 기기 그래픽) */
const Device: React.FC = () => (
  <g>
    <rect x={-330} y={-110} width={660} height={220} rx={40} fill={COLORS.panel} stroke={COLORS.violet} strokeWidth={5} />
    <circle cx={-250} cy={0} r={50} fill={COLORS.bgDeep} stroke={COLORS.slate} strokeWidth={4} />
    <rect x={-150} y={-40} width={300} height={80} rx={40} fill={COLORS.bgDeep} stroke={COLORS.slate} strokeWidth={4} />
    <circle cx={250} cy={0} r={50} fill={COLORS.bgDeep} stroke={COLORS.slate} strokeWidth={4} />
    {/* 블루투스 아이콘 */}
    <path d="M 280 -90 L 300 -72 L 280 -54 M 280 -90 V -18 M 280 -54 L 300 -36 L 280 -18 M 262 -76 L 280 -54 M 262 -32 L 280 -54" stroke={COLORS.cyan} strokeWidth={4} fill="none" />
  </g>
);

/** Scene 4: 무선 편광계 → 589 nm 빔 회전 → 태블릿 HUD */
export const Scene4Polarimeter: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const devIn = spring({frame: frame - 6, fps, config: {damping: 11, stiffness: 110}});
  const devOut = interpolate(frame, [OPTICS_AT - 15, OPTICS_AT], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const optIn = interpolate(frame, [OPTICS_AT - 5, OPTICS_AT + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const hud = spring({frame: frame - HUD_AT, fps, config: {damping: 10, stiffness: 140}});
  const bt = Math.floor(frame / 15) % 2 === 0;

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {frame < OPTICS_AT ? (
            <g transform={`translate(540, 1000) scale(${devIn})`} opacity={1 - devOut}>
              <Device />
              <text y={180} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={COLORS.white}>
                무선 편광계
              </text>
            </g>
          ) : null}
          <g opacity={optIn}>{frame >= OPTICS_AT - 5 ? <PolarimeterLight t={frame - OPTICS_AT} visAngle={VIS_ANGLE} /> : null}</g>
        </svg>
      </AbsoluteFill>

      {/* 태블릿 HUD */}
      {frame >= HUD_AT ? (
        <div
          style={{
            position: 'absolute',
            left: 70,
            right: 70,
            top: 1240,
            padding: '26px 30px',
            borderRadius: 30,
            background: 'rgba(5,7,26,0.94)',
            border: `5px solid ${COLORS.slateDark}`,
            boxShadow: `0 0 40px ${COLORS.violet}44`,
            fontFamily: FONT,
            transform: `translateY(${(1 - hud) * 300}px) scale(${0.85 + hud * 0.15})`,
            opacity: Math.min(1, hud * 1.5),
          }}
        >
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontWeight: 700, fontSize: 24, color: COLORS.cyan}}>
            <span>POLARIMETER · 태블릿</span>
            <span style={{opacity: bt ? 1 : 0.4}}>ᛒ 블루투스 연결됨</span>
          </div>
          <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, color: COLORS.slate, marginTop: 16, lineHeight: 1.5}}>
            관측 α = +{ALPHA_OBS.toFixed(1)}° (l = {PATH_DM} dm, c = {CONC_G_ML.toFixed(2)} g/mL)
            <br />
            [α] = α / (l·c) = +{SPEC_ROT_OBS.toFixed(1)}° · ee = {SPEC_ROT_OBS.toFixed(1)} / {SPEC_ROT_PURE.toFixed(0)} = {Math.round(EE * 100)}%
          </div>
          <div
            style={{
              marginTop: 18,
              padding: '16px 18px',
              borderRadius: 16,
              background: COLORS.green,
              color: COLORS.bg,
              fontWeight: 900,
              fontSize: 36,
              textAlign: 'center',
            }}
          >
            [ 비선광도: +{Math.round(SPEC_ROT_OBS)}° | 광학 순도 ee: {Math.round(EE * 100)}% 달성! ✅ ]
          </div>
        </div>
      ) : null}

      <Headline lines={['빛을 비틀어라!', '첨단 무선 편광계로 광학 활성 입증']} delay={6} top={170} size={64} accent={COLORS.sodium} />
      <Subtitle text={`※ 회전은 과장 표시 · 순수 (S)형 [α] = +${SPEC_ROT_PURE}° (클로로폼)`} delay={HUD_AT + 40} bottom={90} />
    </SceneFrame>
  );
};
