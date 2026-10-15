# 전자레인지 × 금속 = 불꽃 쇼? (Remotion 쇼츠)

1080×1920 · 30fps · 60초(1800프레임) 9:16 모션그래픽.

## 실행

```bash
npm install
npm run start   # Remotion Studio (실시간 미리보기)
npm run build   # out/video.mp4 렌더링
```

## 구조

```
src/
├─ index.ts              # registerRoot
├─ Root.tsx              # <Composition> + <Series> 타임라인
├─ theme.ts              # 색상·폰트·씬 길이
├─ components/common.tsx # 배경, 키워드 텍스트, 번개, 사인파, 포크
└─ scenes/Scene1~6.tsx
```

| 씬 | 프레임 | 내용 |
|---|---|---|
| 1 | 0–150 | 후킹: 전자레인지 + 은박지 공 + 스파크 |
| 2 | 150–450 | 마이크로파 → 물 분자 진동 |
| 3 | 450–750 | 2분할: 음식 vs 포크 경고 |
| 4 | 750–1200 | 자유전자 쏠림 + 과열 |
| 5 | 1200–1560 | 게이지 100% → 아크 방전 |
| 6 | 1560–1800 | 결론, 요약 카드, 구독/좋아요 |
