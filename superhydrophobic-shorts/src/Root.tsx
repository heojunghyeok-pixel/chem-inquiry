import React from 'react';
import {AbsoluteFill, Composition, Series} from 'remotion';
import {COLORS, FPS, HEIGHT, sceneDuration, TOTAL_FRAMES, WIDTH} from './constants';
import {Scene1Hook} from './scenes/Scene1_Hook';
import {Scene2Theory} from './scenes/Scene2_Theory';
import {Scene3Synthesis} from './scenes/Scene3_Synthesis';
import {Scene4AIVision} from './scenes/Scene4_AIVision';
import {Scene5Outro} from './scenes/Scene5_Outro';

/**
 * 전체 타임라인 (30fps, 1740 프레임 = 58초)
 * Hook        0 ~  240
 * Theory    240 ~  600
 * Synthesis 600 ~ 1020
 * AIVision 1020 ~ 1440
 * Outro    1440 ~ 1740
 */
export const SuperhydrophobicShorts: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: COLORS.navy}}>
    <Series>
      <Series.Sequence durationInFrames={sceneDuration('hook')} name="1. Hook">
        <Scene1Hook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sceneDuration('theory')} name="2. Theory">
        <Scene2Theory />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sceneDuration('synthesis')} name="3. Synthesis">
        <Scene3Synthesis />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sceneDuration('aiVision')} name="4. AI Vision">
        <Scene4AIVision />
      </Series.Sequence>
      <Series.Sequence durationInFrames={sceneDuration('outro')} name="5. Outro">
        <Scene5Outro />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SuperhydrophobicShorts"
    component={SuperhydrophobicShorts}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
