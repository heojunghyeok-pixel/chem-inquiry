// 폰트를 로컬 번들로 포함 (오프라인 렌더링 가능)
import '@fontsource/noto-sans-kr/700.css';
import '@fontsource/noto-sans-kr/900.css';

export const FONT = "'Noto Sans KR', sans-serif";

export const COLORS = {
  bg: '#0f1b33',
  bgDeep: '#0a1326',
  paper: '#f4ead5',
  paperDark: '#d9cbb0',
  yellow: '#ffd23f',
  orange: '#ff8c42',
  red: '#ff4d4d',
  teal: '#3ec1d3',
  blue: '#4d8dff',
  metal: '#b8c2cc',
  metalDark: '#7d8894',
  white: '#ffffff',
  ink: '#16213d',
};

// 종이 컷아웃 느낌의 단단한 그림자
export const PAPER_SHADOW = 'drop-shadow(0px 14px 0px rgba(0,0,0,0.35))';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// 씬별 길이(프레임)
export const SCENE_DURATIONS = {
  scene1: 150, // 0 ~ 5s
  scene2: 300, // 5 ~ 15s
  scene3: 300, // 15 ~ 25s
  scene4: 450, // 25 ~ 40s
  scene5: 360, // 40 ~ 52s
  scene6: 240, // 52 ~ 60s
} as const;

export const TOTAL_FRAMES = Object.values(SCENE_DURATIONS).reduce(
  (a, b) => a + b,
  0,
);
