import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {PLATE_W, QuenchingSensorHUD} from '../components/QuenchingSensorHUD';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, sceneDuration} from '../constants';

const DURATION = sceneDuration('sensor');

/** Scene 5: 96홀 플레이트 Fe³⁺ 형광 소광 센서 & AI 판정 */
export const Scene5FeSensorAI: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const plateIn = spring({frame: frame - 4, fps, config: {damping: 13, stiffness: 110}});

  return (
    <SceneFrame duration={DURATION} background={`radial-gradient(circle at 50% 40%, #0b1735 0%, ${COLORS.bgDeep} 70%)`}>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <g transform={`translate(${(1080 - PLATE_W) / 2}, ${700 + (1 - plateIn) * 800})`} opacity={plateIn}>
            <QuenchingSensorHUD t={frame} />
          </g>
        </svg>
      </AbsoluteFill>
      <Headline lines={['오염물질을 만나면 불이 꺼진다?!', '형광 소광 바이오 센서']} delay={6} top={170} size={60} accent={COLORS.cyan} />
    </SceneFrame>
  );
};
