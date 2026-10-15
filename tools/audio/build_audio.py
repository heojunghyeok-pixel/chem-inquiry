"""
내레이션(TTS) + 효과음 큐 빌드 스크립트.

사용법:
  python build_audio.py <프로젝트 폴더> <TTS 모델 폴더>      # 오프라인 TTS로 생성
  python build_audio.py <프로젝트 폴더> --from-files <폴더>   # 외부 음성 파일(nar_00.wav/mp3 ...) 사용

입력: <프로젝트>/audio/script.json
  {
    "fps": 30, "total": 60,            # 영상 길이(초)
    "speed": 1.15,                     # 기본 말하기 속도
    "lines": [{"t": 0.3, "text": "..."}],   # t = 시작 시각(초)
    "sfx": [[프레임, "이름", 볼륨], ...]
  }
출력:
  <프로젝트>/public/audio/nar_XX.wav, <프로젝트>/public/audio/sfx/*.wav
  <프로젝트>/src/audioCues.ts   (Remotion에서 읽는 큐 목록)

각 줄은 다음 줄 시작(또는 영상 끝) 0.15초 전에 끝나도록 속도를 자동으로 올린다(최대 1.5).
"""
import json, os, shutil, sys

import numpy as np
import sherpa_onnx
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
proj, model_dir = sys.argv[1], sys.argv[2]
spec = json.load(open(os.path.join(proj, 'audio', 'script.json'), encoding='utf-8'))
fps = spec['fps']
total = spec['total']
base_speed = spec.get('speed', 1.15)
MAX_SPEED = 1.5
GAP = 0.15

FROM_FILES = model_dir == '--from-files'
ext_dir = sys.argv[3] if FROM_FILES else None
tts = None
if not FROM_FILES:
    onnx = [f for f in os.listdir(model_dir) if f.endswith('.onnx')][0]
    tts = sherpa_onnx.OfflineTts(
        sherpa_onnx.OfflineTtsConfig(
            model=sherpa_onnx.OfflineTtsModelConfig(
                vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                    model=os.path.join(model_dir, onnx),
                    tokens=os.path.join(model_dir, 'tokens.txt'),
                    data_dir=os.path.join(model_dir, 'espeak-ng-data'),
                ),
                num_threads=4,
            )
        )
    )

out_dir = os.path.join(proj, 'public', 'audio')
if FROM_FILES:
    # 외부 파일을 먼저 임시로 읽어 둔다 (out_dir 과 같은 폴더일 수 있음)
    import subprocess, tempfile
    ext = {}
    for f in os.listdir(ext_dir):
        stem, e = os.path.splitext(f)
        if stem.startswith('nar_') and e.lower() in ('.wav', '.mp3', '.m4a', '.ogg'):
            tmp = tempfile.mktemp(suffix='.wav')
            subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(ext_dir, f), '-ac', '1', '-ar', '44100', tmp], check=True)
            x, sr = sf.read(tmp, dtype='float32')
            ext[stem] = (x, sr)
shutil.rmtree(out_dir, ignore_errors=True)
os.makedirs(os.path.join(out_dir, 'sfx'))


def trim(x, sr, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.02 * sr))
    b = min(len(x), idx[-1] + int(0.05 * sr))
    return x[a:b]


lines = sorted(spec['lines'], key=lambda l: l['t'])
cues = []
report = []
for i, ln in enumerate(lines):
    limit = (lines[i + 1]['t'] if i + 1 < len(lines) else total) - ln['t'] - GAP
    speed = base_speed
    while not FROM_FILES:
        a = tts.generate(ln['text'], sid=0, speed=speed)
        x = trim(np.asarray(a.samples, dtype=np.float32), a.sample_rate)
        dur = len(x) / a.sample_rate
        if dur <= limit or speed >= MAX_SPEED:
            break
        speed = min(MAX_SPEED, speed * max(1.03, dur / limit))
    if FROM_FILES:
        if f'nar_{i:02d}' not in ext:
            raise SystemExit(f'nar_{i:02d} 파일이 없습니다: {ext_dir}')
        x, sr = ext[f'nar_{i:02d}']
        x = trim(x, sr)
        dur = len(x) / sr
        speed = 1.0

        class _A:
            sample_rate = sr
        a = _A()
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9
    fname = f'nar_{i:02d}.wav'
    sf.write(os.path.join(out_dir, fname), x, a.sample_rate, subtype='PCM_16')
    cues.append({'src': f'audio/{fname}', 'from': round(ln['t'] * fps), 'dur': int(np.ceil(dur * fps)) + 1, 'text': ln['text']})
    report.append((i, ln['t'], round(dur, 2), round(limit, 2), round(speed, 2), 'OK' if dur <= limit else 'OVER'))

# 효과음
sfx_src = os.path.join(HERE, 'sfx')
sfx_cues = []
for frame, nm, vol in spec['sfx']:
    src = os.path.join(sfx_src, nm + '.wav')
    dst = os.path.join(out_dir, 'sfx', nm + '.wav')
    if not os.path.exists(dst):
        shutil.copy(src, dst)
    info = sf.info(src)
    sfx_cues.append({'src': f'audio/sfx/{nm}.wav', 'from': int(frame), 'dur': int(np.ceil(info.duration * fps)) + 1, 'volume': vol})

ts = ['// 자동 생성 파일: tools/audio/build_audio.py 로 다시 만든다 (직접 수정 금지)',
      'export type AudioCue = {src: string; from: number; dur: number; volume?: number; text?: string};',
      f'export const NARRATION: AudioCue[] = {json.dumps(cues, ensure_ascii=False, indent=2)};',
      f'export const SFX: AudioCue[] = {json.dumps(sfx_cues, ensure_ascii=False, indent=2)};', '']
open(os.path.join(proj, 'src', 'audioCues.ts'), 'w', encoding='utf-8').write('\n'.join(ts))

for r in report:
    print('line %02d @%5.1fs  dur %5.2fs / limit %5.2fs  speed %.2f  %s' % r)
over = [r for r in report if r[-1] == 'OVER']
print('OVER:', len(over))
