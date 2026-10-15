import React from 'react';
import {AudioTrack} from './AudioTrack';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {COLORS, FPS, HEIGHT, SCENES, TOTAL_FRAMES, WIDTH} from './constants';
import {Scene1Hook} from './scenes/Scene1_Hook';
import {Scene2Comparison} from './scenes/Scene2_Comparison';
import {Scene3ReagentReaction} from './scenes/Scene3_ReagentReaction';
import {Scene4Spectrophotometer} from './scenes/Scene4_Spectrophotometer';
import {Scene5CalibrationAI} from './scenes/Scene5_CalibrationAI';
import {Scene6Outro} from './scenes/Scene6_Outro';

const TIMELINE = [
  {key: 'hook', name: '1. 녹조의 습격', Component: Scene1Hook},
  {key: 'comparison', name: '2. 투명한 물의 속임수', Component: Scene2Comparison},
  {key: 'reagent', name: '3. 몰리브덴 블루', Component: Scene3ReagentReaction},
  {key: 'spectro', name: '4. 분광광도계 880nm', Component: Scene4Spectrophotometer},
  {key: 'calibration', name: '5. 표준곡선 & AI 판정', Component: Scene5CalibrationAI},
  {key: 'outro', name: '6. 캠프 안내', Component: Scene6Outro},
] as const;

/** 전체 타임라인 (30fps, 2550 프레임 = 85초) — 구간은 constants.ts의 SCENES */
export const SamsungStreamShorts: React.FC = () => (
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
    id="SamsungStreamShorts"
    component={SamsungStreamShorts}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
