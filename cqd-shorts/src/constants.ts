import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import '@fontsource/jetbrains-mono/700.css';

export const FONT = "'Noto Sans KR', sans-serif";
export const MONO = "'JetBrains Mono', 'Noto Sans KR', monospace";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const COLORS = {
  bg: '#070d1e',
  bgDeep: '#030712',
  panel: '#0d1631',
  panelLine: '#1f2d57',
  white: '#f8fafc',
  slate: '#94a3b8',
  slateDark: '#334155',
  // 네온 형광
  cyan: '#22d3ee',
  blue: '#60a5fa',
  emerald: '#34d399',
  green: '#4ade80',
  yellow: '#facc15',
  lime: '#bef264',
  uv: '#8b5cf6',
  uvDeep: '#5b21b6',
  red: '#f43f5e',
  qdRed: '#ff3b3b',
  qdGreen: '#22e06b',
  qdBlue: '#3b82ff',
  gold: '#f5c542',
  goldDark: '#b8860b',
  // 재료
  lemon: '#fde047',
  foamYellow: '#fbbf24',
  foamBrown: '#7c2d12',
  foamDark: '#3f1d0b',
  metal: '#94a3b8',
};

// 씬별 시작/종료 프레임 (to 미포함)
export const SCENES = {
  nobel: {from: 0, to: 450},
  eco: {from: 450, to: 840},
  cook: {from: 840, to: 1500},
  glow: {from: 1500, to: 1950},
  sensor: {from: 1950, to: 2340},
  outro: {from: 2340, to: 2550},
} as const;

export type SceneKey = keyof typeof SCENES;
export const sceneDuration = (key: SceneKey) => SCENES[key].to - SCENES[key].from;
export const TOTAL_FRAMES = SCENES.outro.to; // 2550 = 85초

// 바이알 형광색 (합성 조건별, 365 nm 여기)
export const VIAL_GLOWS = [
  {color: '#38bdf8', label: '조건 A'},
  {color: '#22d3ee', label: '조건 B'},
  {color: '#34d399', label: '조건 C'},
  {color: '#4ade80', label: '조건 D'},
  {color: '#bef264', label: '조건 E'},
  {color: '#facc15', label: '조건 F'},
];

// 센서 예시 데이터: 금속 이온 첨가 후 상대 형광 세기
export const SENSOR = [
  {ion: 'Na⁺', intensity: 0.97},
  {ion: 'Ca²⁺', intensity: 0.95},
  {ion: 'Fe³⁺', intensity: 0.14},
];
export const FE_CONC = '0.005 M';
