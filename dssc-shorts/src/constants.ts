import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import '@fontsource/jetbrains-mono/700.css';

export const FONT = "'Noto Sans KR', sans-serif";
export const MONO = "'JetBrains Mono', 'Noto Sans KR', monospace";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const COLORS = {
  bg: '#070b19',
  bgDeep: '#03050d',
  panel: '#0f1630',
  panelLine: '#25305e',
  white: '#f8fafc',
  slate: '#94a3b8',
  slateDark: '#334155',
  neonBlue: '#38bdf8',
  neonPurple: '#a855f7',
  violet: '#7c3aed',
  pink: '#f472b6',
  yellow: '#facc15',
  lime: '#a3e635',
  red: '#f43f5e',
  green: '#22c55e',
  blue: '#3b82f6',
  // 재료 색
  blueberry: '#4c1d95',
  blueberryLight: '#7c3aed',
  dye: '#5b1a6e', // 안토시아닌 흡착 TiO2
  tio2: '#f5f5f4',
  fto: '#bae6fd',
  graphite: '#1f2937',
  iodine: '#b45309',
  metal: '#94a3b8',
  leaf: '#16a34a',
};

// 씬별 시작/종료 프레임 (to 미포함)
export const SCENES = {
  hook: {from: 0, to: 450},
  concept: {from: 450, to: 840},
  fabrication: {from: 840, to: 1740},
  electron: {from: 1740, to: 2250},
  spectro: {from: 2250, to: 2850},
  future: {from: 2850, to: 3180},
  outro: {from: 3180, to: 3450},
} as const;

export type SceneKey = keyof typeof SCENES;
export const sceneDuration = (key: SceneKey) => SCENES[key].to - SCENES[key].from;
export const TOTAL_FRAMES = SCENES.outro.to; // 3450 = 115초

// 제작 공정 4단계 (Scene3 로컬 프레임, 각 225프레임)
export const FAB_STEP = 225;

// ── 영상용 예시 데이터 ──
// 안토시아닌 흡광 스펙트럼: λmax ≈ 530 nm 부근 가우시안 근사
export const LAMBDA_MAX = 530;
export const absorbance = (nm: number) =>
  0.05 + 0.85 * Math.exp(-((nm - LAMBDA_MAX) ** 2) / (2 * 45 ** 2)) + 0.12 * Math.exp(-((nm - 420) ** 2) / (2 * 30 ** 2));

// LED별 단락전류 Isc (µA, 예시값)
export const LEDS = [
  {name: '빨강', nm: 630, color: '#ef4444', isc: 12},
  {name: '파랑', nm: 465, color: '#3b82f6', isc: 27},
  {name: '초록', nm: 525, color: '#22c55e', isc: 68},
] as const;
export const ISC_MAX = 80;
