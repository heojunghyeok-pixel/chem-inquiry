import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {NARRATION, SFX} from './audioCues';

/** 내레이션 + 효과음 트랙 (큐는 tools/audio/build_audio.py 가 생성한 audioCues.ts) */
export const AudioTrack: React.FC = () => (
  <>
    {NARRATION.map((c, i) => (
      <Sequence key={`n${i}`} from={c.from} durationInFrames={c.dur} layout="none" name={`내레이션 ${i + 1}`}>
        <Audio src={staticFile(c.src)} volume={1} />
      </Sequence>
    ))}
    {SFX.map((c, i) => (
      <Sequence key={`s${i}`} from={c.from} durationInFrames={c.dur} layout="none" name={`효과음 ${c.src.split('/').pop()}`}>
        <Audio src={staticFile(c.src)} volume={c.volume ?? 0.4} />
      </Sequence>
    ))}
  </>
);
