import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {CellAssembly, DoctorBlade, DyeSoak, PencilCoat} from '../components/DSSCAssembly';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, FAB_STEP, FONT, sceneDuration} from '../constants';

const DURATION = sceneDuration('fabrication');

const STEPS = [
  {title: '닥터 블레이드', desc: '유리 막대로 TiO₂ 페이스트를 얇고 평평하게', Comp: DoctorBlade},
  {title: '블루베리 염착', desc: '가열 후 추출액에 담가 색소 흡착', Comp: DyeSoak},
  {title: '연필 흑연 전극', desc: '4B 연필로 칠해 촉매층 만들기', Comp: PencilCoat},
  {title: '샌드위치 조립', desc: '어긋나게 포개고 클립 → 전해질 주입', Comp: CellAssembly},
];

/** Scene 3: DSSC 제작 4단계 */
export const Scene3Fabrication: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const idx = Math.min(3, Math.floor(frame / FAB_STEP));
  const t = frame - idx * FAB_STEP;
  const step = STEPS[idx];
  const Comp = step.Comp;

  // 단계 전환: 짧은 페이드 + 슬라이드
  const stepIn = interpolate(t, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const stepOut = idx < 3 ? interpolate(t, [FAB_STEP - 10, FAB_STEP], [0, 1], {extrapolateLeft: 'clamp'}) : 0;
  const badge = spring({frame: t, fps, config: {damping: 8, stiffness: 170}});

  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill style={{opacity: stepIn * (1 - stepOut), transform: `translateX(${(1 - stepIn) * 80 - stepOut * 80}px)`}}>
        <svg width={1080} height={1920}>
          <Comp t={t} />
        </svg>
      </AbsoluteFill>

      {/* 단계 배지 & 진행 바 */}
      <div style={{position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, fontFamily: FONT}}>
        <div
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            background: COLORS.neonPurple,
            color: COLORS.white,
            fontWeight: 900,
            fontSize: 42,
            padding: '10px 30px',
            borderRadius: 999,
            transform: `scale(${badge})`,
            boxShadow: `0 0 30px ${COLORS.neonPurple}88`,
          }}
        >
          STEP {idx + 1} · {step.title}
        </div>
        <div style={{fontSize: 32, fontWeight: 700, color: COLORS.slate, opacity: badge}}>{step.desc}</div>
      </div>
      <div style={{position: 'absolute', bottom: 120, left: 120, right: 120, display: 'flex', gap: 16}}>
        {STEPS.map((s, i) => {
          const fill = i < idx ? 1 : i === idx ? t / FAB_STEP : 0;
          return (
            <div key={s.title} style={{flex: 1, height: 14, borderRadius: 7, background: COLORS.panelLine, overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', background: COLORS.neonBlue}} />
            </div>
          );
        })}
      </div>

      <Headline lines={['교실에서 완성하는', 'DIY 태양전지 4단계']} delay={6} top={150} size={70} />
    </SceneFrame>
  );
};
