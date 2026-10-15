# 내레이션 + 효과음 빌드 도구

5편의 쇼츠(루트 `src/`, `superhydrophobic-shorts/`, `samsung-stream-shorts/`, `dssc-shorts/`, `cqd-shorts/`)에 공통으로 쓰는 오디오 생성 도구입니다.

## 구성

| 파일 | 역할 |
|---|---|
| `make_sfx.py` | 효과음 13종을 numpy로 합성 → `sfx/*.wav` (외부 음원 없음, 저작권 문제 없음) |
| `build_audio.py` | 각 프로젝트의 `audio/script.json`을 읽어 내레이션 TTS 생성 + 효과음 복사 + `src/audioCues.ts` 작성 |
| `sfx/` | 합성된 효과음: beep, bubble, click, ding, hum, pop, rise, scratch, sparkle, swoosh, thud, whoosh, zap |

각 프로젝트의 `src/AudioTrack.tsx`가 `audioCues.ts`를 읽어 `<Audio>`로 배치합니다.

## 대본·효과음 수정 후 다시 만들기

1. `<프로젝트>/audio/script.json` 수정
   - `lines`: `{"t": 시작 초, "text": "대본"}` — 숫자·영문·화학식은 한글로 풀어 쓰기 (예: `이점사오 기가헤르츠`, `비타민 씨`)
   - `sfx`: `[프레임, "효과음 이름", 볼륨]`
2. TTS 모델 준비 (한 번만, 약 67MB — 저장소에는 넣지 않음)
   ```bash
   python3 -m venv .venv && .venv/bin/pip install sherpa-onnx soundfile numpy
   curl -L -o kss.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-mimic3-ko_KO-kss_low.tar.bz2
   tar xjf kss.tar.bz2
   ```
3. 빌드
   ```bash
   .venv/bin/python tools/audio/build_audio.py <프로젝트 폴더> vits-mimic3-ko_KO-kss_low
   ```
   줄마다 길이·제한·속도가 출력되고, 다음 줄과 겹치면 속도를 자동으로 올립니다(최대 1.5배). `OVER`가 나오면 대본을 줄이세요.

## 다른 음성으로 바꾸려면

`public/audio/nar_XX.wav` 파일을 같은 이름의 녹음/외부 TTS 파일로 덮어쓰면 됩니다. 길이가 달라지면 `src/audioCues.ts`의 `dur`(프레임)도 맞춰 주세요.
