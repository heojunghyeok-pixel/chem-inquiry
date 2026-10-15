import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import '@fontsource/jetbrains-mono/700.css';

export const FONT = "'Noto Sans KR', sans-serif";
export const MONO = "'JetBrains Mono', 'Noto Sans KR', monospace";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const COLORS = {
  navy: '#0f172a',
  navyDeep: '#020617',
  emerald: '#064e3b',
  emeraldDeep: '#022c22',
  cyan: '#22d3ee',
  lime: '#a3e635',
  white: '#f8fafc',
  slate: '#94a3b8',
  slateDark: '#334155',
  water: '#7dd3fc',
  waterDeep: '#0ea5e9',
  leaf: '#15803d',
  leafDark: '#14532d',
  leafLight: '#4ade80',
  zno: '#e2e8f0',
  oxygen: '#fb7185',
  amber: '#fbbf24',
  red: '#f43f5e',
  paper: '#f1f5f9',
};

// 씬별 시작/종료 프레임 (end는 미포함)
export const SCENES = {
  hook: {from: 0, to: 240},
  theory: {from: 240, to: 600},
  synthesis: {from: 600, to: 1020},
  aiVision: {from: 1020, to: 1440},
  outro: {from: 1440, to: 1740},
} as const;

export type SceneKey = keyof typeof SCENES;

export const sceneDuration = (key: SceneKey) => SCENES[key].to - SCENES[key].from;

export const TOTAL_FRAMES = SCENES.outro.to; // 1740 = 58초

// 접촉각 측정값: 구형 캡 근사 θ = 2·arctan(2h/d)
export const MEASURED = {h: 285.0, d: 130.6};
export const MEASURED_ANGLE = (2 * Math.atan((2 * MEASURED.h) / MEASURED.d) * 180) / Math.PI; // ≈ 154.2°
