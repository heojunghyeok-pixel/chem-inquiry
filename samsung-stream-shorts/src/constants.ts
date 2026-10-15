import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';
import '@fontsource/jetbrains-mono/700.css';

export const FONT = "'Noto Sans KR', sans-serif";
export const MONO = "'JetBrains Mono', 'Noto Sans KR', monospace";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const COLORS = {
  bg: '#0b1329',
  bgDeep: '#050a18',
  panel: '#121d3d',
  panelLine: '#24345f',
  white: '#f8fafc',
  slate: '#94a3b8',
  slateDark: '#334155',
  cyan: '#22d3ee',
  lime: '#a3e635',
  amber: '#fbbf24',
  red: '#f43f5e',
  // 물/시약 색
  water: '#7dd3fc',
  clear: '#dbeafe',
  stream: '#2563eb',
  algae: '#4d7c0f',
  algaeLight: '#84cc16',
  reagent: '#fde68a',
  skyBlue: '#7dd3fc',
  cobalt: '#1d3fbf',
  // 빔 (880 nm 근적외선 → 화면에서는 붉은색으로 표현)
  beam: '#ff3b3b',
  phosphorus: '#f97316',
  oxygen: '#fb7185',
  molybdenum: '#a78bfa',
};

// 씬별 시작/종료 프레임 (to 미포함)
export const SCENES = {
  hook: {from: 0, to: 300},
  comparison: {from: 300, to: 750},
  reagent: {from: 750, to: 1290},
  spectro: {from: 1290, to: 1950},
  calibration: {from: 1950, to: 2280},
  outro: {from: 2280, to: 2550},
} as const;

export type SceneKey = keyof typeof SCENES;
export const sceneDuration = (key: SceneKey) => SCENES[key].to - SCENES[key].from;
export const TOTAL_FRAMES = SCENES.outro.to; // 2550 = 85초

// ── 표준곡선 데이터 (영상용 예시 데이터) ──
export const STANDARDS = [
  {c: 0, a: 0.003},
  {c: 0.15, a: 0.098},
  {c: 0.3, a: 0.192},
  {c: 0.6, a: 0.377},
  {c: 1.0, a: 0.628},
  {c: 1.3, a: 0.811},
];

// 최소제곱 1차 회귀
const n = STANDARDS.length;
const mx = STANDARDS.reduce((s, p) => s + p.c, 0) / n;
const my = STANDARDS.reduce((s, p) => s + p.a, 0) / n;
const sxy = STANDARDS.reduce((s, p) => s + (p.c - mx) * (p.a - my), 0);
const sxx = STANDARDS.reduce((s, p) => s + (p.c - mx) ** 2, 0);
const syy = STANDARDS.reduce((s, p) => s + (p.a - my) ** 2, 0);
export const FIT = {
  a: sxy / sxx,
  b: my - (sxy / sxx) * mx,
  r2: (sxy * sxy) / (sxx * syy),
};

/** 농도(mg P/L) → 흡광도 */
export const absorbanceOf = (c: number) => FIT.a * c + FIT.b;

// 삼성천 시료 (예시): 흡광도 0.178 → 농도 ≈ 0.28 mg P/L
export const SAMPLE_A = 0.178;
export const SAMPLE_C = (SAMPLE_A - FIT.b) / FIT.a;
