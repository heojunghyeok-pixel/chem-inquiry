import React from 'react';
import {AbsoluteFill, Composition, Series} from 'remotion';
import {Scene1} from './scenes/Scene1';
import {Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Scene6} from './scenes/Scene6';
import {COLORS, FPS, HEIGHT, SCENE_DURATIONS, TOTAL_FRAMES, WIDTH} from './theme';

/**
 * 전체 타임라인 (30fps, 1800 프레임)
 * Scene1    0 ~  150  후킹
 * Scene2  150 ~  450  기본 원리
 * Scene3  450 ~  750  금속 투입
 * Scene4  750 ~ 1200  전하 집중
 * Scene5 1200 ~ 1560  아크 방전
 * Scene6 1560 ~ 1800  결론/아웃트로
 */
export const MicrowaveMetal: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.bg}}>
    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.scene1} name="1. 후킹">
        <Scene1 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.scene2} name="2. 기본 원리">
        <Scene2 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.scene3} name="3. 금속 투입">
        <Scene3 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.scene4} name="4. 전하 집중">
        <Scene4 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.scene5} name="5. 아크 방전">
        <Scene5 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.scene6} name="6. 결론">
        <Scene6 />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MicrowaveMetal"
    component={MicrowaveMetal}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
