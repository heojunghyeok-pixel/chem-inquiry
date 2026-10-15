# 블루베리 DSSC — 염료감응형 태양전지 제작 & 광전류 분석 (Remotion 쇼츠)

1080×1920 · 30fps · 115초(3,450프레임)

```bash
cd dssc-shorts
npm install
npm run start   # Remotion Studio (Composition: DSSCShorts)
npm run build   # out/video.mp4
```

| 씬 | 프레임 | 파일 |
|---|---|---|
| 1. 과일 배터리? | 0–450 | `Scene1_Hook.tsx` |
| 2. 광합성을 훔친 DSSC | 450–840 | `Scene2_Concept.tsx` |
| 3. 제작 공정 4단계 | 840–1740 | `Scene3_Fabrication.tsx` (+ `components/DSSCAssembly.tsx`) |
| 4. 전자 릴레이 & 흑연 촉매 | 1740–2250 | `Scene4_ElectronFlow.tsx` |
| 5. 흡광 스펙트럼 & MBL 광전류 | 2250–2850 | `Scene5_Spectroscopy.tsx` |
| 6. 창문형 전지 & 천연 염료 | 2850–3180 | `Scene6_FutureVision.tsx` |
| 7. 캠프 안내 | 3180–3450 | `Scene7_Outro.tsx` |

## 수정 포인트

- 흡광 스펙트럼(`absorbance`, λmax 530 nm)과 LED별 Isc(12 / 27 / 68 µA)는 **영상용 예시 데이터** — `src/constants.ts`
- 캠프 일정·장소 — `src/scenes/Scene7_Outro.tsx`의 `CAMP_INFO` (현재 "추후 안내")
