import React from 'react';
import {AudioTrack} from './AudioTrack';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {COLORS, FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH} from './constants';
import {Scene1Hook} from './scenes/Scene1_Hook';
import {Scene2Concept} from './scenes/Scene2_Concept';
import {Scene3Fabrication} from './scenes/Scene3_Fabrication';
import {Scene4ElectronFlow} from './scenes/Scene4_ElectronFlow';
import {Scene5Spectroscopy} from './scenes/Scene5_Spectroscopy';
import {Scene6FutureVision} from './scenes/Scene6_FutureVision';
import {Scene7Outro} from './scenes/Scene7_Outro';

const TIMELINE = [
  {key: 'hook', name: '1. 과일 배터리?', Component: Scene1Hook},
  {key: 'concept', name: '2. 광합성을 훔친 DSSC', Component: Scene2Concept},
  {key: 'fabrication', name: '3. 제작 공정 4단계', Component: Scene3Fabrication},
  {key: 'electron', name: '4. 전자 릴레이', Component: Scene4ElectronFlow},
  {key: 'spectro', name: '5. 분광 & MBL 광전류', Component: Scene5Spectroscopy},
  {key: 'future', name: '6. 미래 에너지', Component: Scene6FutureVision},
  {key: 'outro', name: '7. 캠프 안내', Component: Scene7Outro},
] as const;

/** 전체 타임라인 (30fps, 3450 프레임 = 115초) — 구간은 constants.ts의 SCENES */
export const DSSCShorts: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
    {TIMELINE.map(({key, name, Component}) => (
      <Sequence key={key} from={SCENES[key].from} durationInFrames={SCENES[key].to - SCENES[key].from} name={name}>
        <Component />
      </Sequence>
    ))}
    <AudioTrack />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DSSCShorts"
    component={DSSCShorts}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
