import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {COLORS, FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH} from './constants';
import {Scene1NobelHook} from './scenes/Scene1_NobelHook';
import {Scene2Thalidomide} from './scenes/Scene2_Thalidomide';
import {Scene3YeastCatalyst} from './scenes/Scene3_YeastCatalyst';
import {Scene4Polarimeter} from './scenes/Scene4_Polarimeter';
import {Scene5AIDocking} from './scenes/Scene5_AIDocking';
import {Scene6Outro} from './scenes/Scene6_Outro';

const TIMELINE = [
  {key: 'nobel', name: '1. 노벨상 & 거울상 분자', Component: Scene1NobelHook},
  {key: 'thalidomide', name: '2. 탈리도마이드', Component: Scene2Thalidomide},
  {key: 'yeast', name: '3. 빵 효모 생체 촉매', Component: Scene3YeastCatalyst},
  {key: 'polarimeter', name: '4. 무선 편광계', Component: Scene4Polarimeter},
  {key: 'docking', name: '5. AI 분자 도킹', Component: Scene5AIDocking},
  {key: 'outro', name: '6. 캠프 안내', Component: Scene6Outro},
] as const;

/** 전체 타임라인 (30fps, 2640 프레임 = 88초) — 구간은 constants.ts의 SCENES */
export const AsymmetricSynthesisShorts: React.FC = () => (
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
    id="AsymmetricSynthesisShorts"
    component={AsymmetricSynthesisShorts}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
