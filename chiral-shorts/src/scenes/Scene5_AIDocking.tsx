import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {MolecularDockingHUD} from '../components/MolecularDockingHUD';
import {Headline, SceneFrame} from '../components/Typography';
import {COLORS, sceneDuration} from '../constants';

const DURATION = sceneDuration('docking');

/** Scene 5: 세레블론 포켓 + (S)형 도킹 */
export const Scene5AIDocking: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneFrame duration={DURATION}>
      <AbsoluteFill>
        <MolecularDockingHUD t={frame} />
      </AbsoluteFill>
      <Headline lines={['AI 분자 모델링:', '컴퓨터로 예측하는 신약의 미래']} delay={6} top={170} size={66} accent={COLORS.cyan} />
    </SceneFrame>
  );
};
