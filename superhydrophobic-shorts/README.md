# 연잎 효과 × AI 접촉각 측정 — 화학·AI 융합 캠프 안내 쇼츠

Remotion · 1080×1920 · 30fps · 58초(1,740프레임)

```bash
cd superhydrophobic-shorts
npm install
npm run start   # Remotion Studio 미리보기 (Composition: SuperhydrophobicShorts)
npm run build   # out/video.mp4 렌더링
```

| 씬 | 프레임 | 파일 |
|---|---|---|
| 1. 연잎 위 물방울 | 0–240 | `src/scenes/Scene1_Hook.tsx` |
| 2. 표면장력 & 나노 돌기 | 240–600 | `src/scenes/Scene2_Theory.tsx` |
| 3. ZnO + 스테아르산 코팅 | 600–1020 | `src/scenes/Scene3_Synthesis.tsx` |
| 4. AI 비전 접촉각 154.2° | 1020–1440 | `src/scenes/Scene4_AIVision.tsx` |
| 5. 캠프 안내 | 1440–1740 | `src/scenes/Scene5_Outro.tsx` |

접촉각은 구형 캡 근사 θ = 2·arctan(2h/d)로 계산하며, `src/constants.ts`의 `MEASURED`(h=285.0, d=130.6 px)에서 154.2°가 나옵니다.
