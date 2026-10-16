# 빵 효모 비대칭 합성 & 무선 편광계 계측 (Remotion 쇼츠)

1080×1920 · 30fps · 88초(2,640프레임)

```bash
cd chiral-shorts
npm install
npm run start   # Remotion Studio (Composition: AsymmetricSynthesisShorts)
npm run build   # out/video.mp4
```

| 씬 | 프레임 | 파일 |
|---|---|---|
| 1. 2026 노벨상 & 거울상 분자 | 0–450 | `Scene1_NobelHook.tsx` |
| 2. 탈리도마이드 | 450–900 | `Scene2_Thalidomide.tsx` |
| 3. 빵 효모 생체 환원 | 900–1560 | `Scene3_YeastCatalyst.tsx` |
| 4. 무선 편광계 | 1560–2100 | `Scene4_Polarimeter.tsx` |
| 5. AI 분자 도킹 | 2100–2460 | `Scene5_AIDocking.tsx` |
| 6. 캠프 안내 | 2460–2640 | `Scene6_Outro.tsx` |

## 근거·수치 (`src/constants.ts`)

- 2026 노벨 화학상: Henri B. Kagan, Kenso Soai — 비대칭 유기 합성의 비선형 효과와 자가촉매 발견
- (R)-카르본 = 스피어민트, (S)-카르본 = 캐러웨이(호밀빵) 향. 그림의 R/S 배치는 CIP 규칙으로 확인
- 효모 환원: 에틸 아세토아세테이트 → (S)-에틸 3-하이드록시부타노에이트 (문헌상 ee 75~99%, 영상은 85% 예시)
- 순수 (S)형 비선광도 +43° (20 °C, c = 1, 클로로폼, 시약 카탈로그 값) → 85% ee ≈ +37°
- 편광계 관측 α = [α]·l·c (예시: l = 1 dm, c = 0.10 g/mL → +3.7°). 화면의 회전 각도는 과장 표시
- (S)-탈리도마이드의 세레블론 결합이 (R)형보다 약 10배 강함: Mori et al., Sci. Rep. 8, 1294 (2018)
- 캠프 일정·장소: `CAMP_INFO` (현재 "추후 안내")
