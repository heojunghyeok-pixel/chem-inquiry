import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import '@fontsource/jetbrains-mono/700.css';

export const FONT = "'Noto Sans KR', sans-serif";
export const MONO = "'JetBrains Mono', 'Noto Sans KR', monospace";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const COLORS = {
  bg: '#0a0e27',
  bgDeep: '#05071a',
  panel: '#121842',
  panelLine: '#262f6b',
  white: '#f8fafc',
  slate: '#94a3b8',
  slateDark: '#334155',
  violet: '#a78bfa',
  violetDeep: '#7c3aed',
  cyan: '#22d3ee',
  pink: '#f472b6', // 비대칭 탄소(카이랄 중심)
  gold: '#f5c542',
  goldDark: '#a16207',
  green: '#4ade80',
  red: '#f43f5e',
  amber: '#fbbf24',
  sodium: '#fde047', // 589 nm 나트륨 D선
  carbon: '#cbd5e1',
  oxygen: '#fb7185',
  nitrogen: '#60a5fa',
  hydrogen: '#facc15',
  yeast: '#d6b98c',
};

// 씬별 시작/종료 프레임 (to 미포함)
export const SCENES = {
  nobel: {from: 0, to: 450},
  thalidomide: {from: 450, to: 900},
  yeast: {from: 900, to: 1560},
  polarimeter: {from: 1560, to: 2100},
  docking: {from: 2100, to: 2460},
  outro: {from: 2460, to: 2640},
} as const;

export type SceneKey = keyof typeof SCENES;
export const sceneDuration = (key: SceneKey) => SCENES[key].to - SCENES[key].from;
export const TOTAL_FRAMES = SCENES.outro.to; // 2640 = 88초

// ── 계측 값 (영상용 예시, 문헌 기준값과 일관되게 설정) ──
// 순수 (S)-에틸 3-하이드록시부티레이트 비선광도: +43° (20 °C, c = 1, 클로로폼; 시약 카탈로그 값)
export const SPEC_ROT_PURE = 43.0;
export const EE = 0.85; // 효모 환원 예시 광학 순도
export const SPEC_ROT_OBS = SPEC_ROT_PURE * EE; // ≈ +36.6° → 표시 +37°
// 편광계 측정 조건 (예시): 관측 회전각 α = [α] · l · c
export const PATH_DM = 1.0; // 셀 길이 (dm)
export const CONC_G_ML = 0.1; // 농도 (g/mL)
export const ALPHA_OBS = SPEC_ROT_OBS * PATH_DM * CONC_G_ML; // ≈ +3.7°

// 생성물 비율: ee = %S − %R
export const PCT_S = 50 + (EE * 100) / 2; // 92.5
export const PCT_R = 100 - PCT_S; // 7.5

// 캠프 일정·장소: 확정되면 여기만 수정
export const CAMP_INFO = {
  schedule: '일정: 추후 안내',
  place: '장소: 추후 안내',
};
