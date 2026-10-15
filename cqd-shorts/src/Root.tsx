import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {COLORS, FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH} from './constants';
import {Scene1NobelHook} from './scenes/Scene1_NobelHook';
import {Scene2EcoCQD} from './scenes/Scene2_EcoCQD';
import {Scene3MicrowaveCook} from './scenes/Scene3_MicrowaveCook';
import {Scene4DarkroomGlow} from './scenes/Scene4_DarkroomGlow';
import {Scene5FeSensorAI} from './scenes/Scene5_FeSensorAI';
import {Scene6Outro} from './scenes/Scene6_Outro';

const TIMELINE = [
  {key: 'nobel', name: '1. 노벨상 & 양자점', Component: Scene1NobelHook},
  {key: 'eco', name: '2. 친환경 CQD', Component: Scene2EcoCQD},
  {key: 'cook', name: '3. 전자레인지 합성', Component: Scene3MicrowaveCook},
  {key: 'glow', name: '4. 암실 형광', Component: Scene4DarkroomGlow},
  {key: 'sensor', name: '5. Fe³⁺ 소광 센서', Component: Scene5FeSensorAI},
  {key: 'outro', name: '6. 캠프 안내', Component: Scene6Outro},
] as const;

/** 전체 타임라인 (30fps, 2550 프레임 = 85초) — 구간은 constants.ts의 SCENES */
export const CQDShorts: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
    {TIMELINE.map(({key, name, Component}) => (
      <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].to - SCENES[key].from} name={name}>
        <Component />
      </Sequence>
    ))}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CQDShorts"
    component={CQDShorts}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
