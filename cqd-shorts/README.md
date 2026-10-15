# 탄소 양자점(CQD) 합성 & Fe³⁺ 형광 소광 센서 (Remotion 쇼츠)

1080×1920 · 30fps · 85초(2,550프레임)

```bash
cd cqd-shorts
npm install
npm run start   # Remotion Studio (Composition: CQDShorts)
npm run build   # out/video.mp4
```

| 씬 | 프레임 | 파일 |
|---|---|---|
| 1. 노벨상 & 양자점 | 0–450 | `Scene1_NobelHook.tsx` |
| 2. 중금속 대신 탄소 | 450–840 | `Scene2_EcoCQD.tsx` |
| 3. 전자레인지 합성·정제 | 840–1500 | `Scene3_MicrowaveCook.tsx` |
| 4. 암실 UV 형광 | 1500–1950 | `Scene4_DarkroomGlow.tsx` |
| 5. Fe³⁺ 소광 센서 & AI | 1950–2340 | `Scene5_FeSensorAI.tsx` |
| 6. 캠프 안내 | 2340–2550 | `Scene6_Outro.tsx` |

## 수정 포인트 (`src/constants.ts`)

- `VIAL_GLOWS`: 바이알 6개 형광색·라벨 (현재 "조건 A~F")
- `SENSOR`: 이온별 상대 형광 세기 — **영상용 예시 데이터** (Na⁺ 97%, Ca²⁺ 95%, Fe³⁺ 14%)
- `FE_CONC`: 판정 배너 농도 (0.005 M)
