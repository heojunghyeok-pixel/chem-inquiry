# 삼성천 수질탐구 — 몰리브덴 블루 & 분광광도계 (Remotion 쇼츠)

1080×1920 · 30fps · 85초(2,550프레임)

```bash
cd samsung-stream-shorts
npm install
npm run start   # Remotion Studio (Composition: SamsungStreamShorts)
npm run build   # out/video.mp4
```

| 씬 | 프레임 | 파일 |
|---|---|---|
| 1. 녹조의 습격 | 0–300 | `Scene1_Hook.tsx` |
| 2. 투명한 물의 속임수 | 300–750 | `Scene2_Comparison.tsx` |
| 3. 발색 시약 & 몰리브덴 블루 | 750–1290 | `Scene3_ReagentReaction.tsx` |
| 4. 분광광도계 880 nm | 1290–1950 | `Scene4_Spectrophotometer.tsx` |
| 5. 표준곡선 & AI 판정 | 1950–2280 | `Scene5_CalibrationAI.tsx` |
| 6. 캠프 안내 | 2280–2550 | `Scene6_Outro.tsx` |

## 데이터

`src/constants.ts`의 `STANDARDS`는 **영상용 예시 데이터**입니다. 회귀식(a, b, R²)은 코드에서 최소제곱법으로 계산하며,
시료 흡광도 `SAMPLE_A = 0.178`을 역산하면 0.28 mg P/L이 됩니다. 실측값이 생기면 이 두 값만 바꾸면 그래프·판정이 함께 갱신됩니다.
