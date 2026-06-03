export const COLORS = {
  // Pastel 연두 brand palette
  primary: '#A8D5BA',       // Pastel 연두 — hero surfaces, soft fills
  primaryLight: '#D4EDE0',  // Ultra-soft surfaces / hover tints
  primaryMid: '#BCE0CA',    // Lighter gradient stop
  primaryDark: '#6FB88F',   // Interactive: buttons, chips, active states (white text readable)
  primaryInk: '#3E7E62',    // Small labels, icons, text on white
  primaryDeep: '#1F3A2A',   // Deepest logotype ink
  primaryBtnText: '#1F4A35', // 텍스트 on 파스텔 그라디언트 버튼 (claude_design 기준)
  secondary: '#F0F8F3',     // Barely-there mint tint — soft fills
  accent: '#FFB3A1',        // Pastel coral — wishlist heart idle
  accentInk: '#FF8A70',     // Saturated coral — filled heart state
  background: '#F7FAF8',
  white: '#FFFFFF',
  black: '#1A2E24',
  gray100: '#F4F6F5',
  gray200: '#E8EDEA',
  gray300: '#D4DDD8',
  gray400: '#B0BDB8',
  gray500: '#8A9C95',
  gray600: '#6B7C75',
  gray700: '#556560',
  gray800: '#3E4E48',
  text: '#1A2E24',
  textSecondary: '#6B7C75',
  textLight: '#8A9C95',
  border: '#E0EBE5',
  error: '#E53935',
  success: '#43A047',
  warning: '#FB8C00',
  star: '#FFB800',
  kakao: '#FEE500',
  kakaoText: '#1A1A1A',     // 카카오 공식 라벨 텍스트
  naver: '#03C75A',
  googleBlue: '#4285F4',    // Google 공식 브랜드 색
  bannerInk: '#1E2A44',     // 다크 배너 잉크 (탭 내 유일한 다크 서피스)
  overlay: 'rgba(46, 64, 54, 0.38)',
  overlayDark: 'rgba(46, 64, 54, 0.58)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  black: 'System',
};

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

export const FONT_SIZES = {
  eyebrow: 10,   // 대문자 라벨 (BRAND, NICHE, 50ML 등)
  caption: 11,
  small: 12,
  bodySm: 13,
  body: 14,
  bodyLg: 15,
  h4: 16,
  h3: 18,
  h2: 20,
  h1: 26,
  display: 32,
};

// 표준 컴포넌트 높이 — primary 액션은 모두 이 값으로
export const BUTTON_HEIGHT = {
  sm: 36,
  md: 44,  // = TOUCH_TARGET_MIN, secondary 액션 기준
  lg: 48,  // primary 액션 기준 (Toss 표준)
} as const;

const LINE_HEIGHT_RATIO = 1.5;

export const LINE_HEIGHTS = {
  caption: Math.round(FONT_SIZES.caption * LINE_HEIGHT_RATIO),
  small: Math.round(FONT_SIZES.small * LINE_HEIGHT_RATIO),
  bodySm: Math.round(FONT_SIZES.bodySm * LINE_HEIGHT_RATIO),
  body: Math.round(FONT_SIZES.body * LINE_HEIGHT_RATIO),
  bodyLg: Math.round(FONT_SIZES.bodyLg * LINE_HEIGHT_RATIO),
  h4: Math.round(FONT_SIZES.h4 * LINE_HEIGHT_RATIO),
  h3: Math.round(FONT_SIZES.h3 * LINE_HEIGHT_RATIO),
  h2: Math.round(FONT_SIZES.h2 * LINE_HEIGHT_RATIO),
  h1: Math.round(FONT_SIZES.h1 * 1.3),
  display: Math.round(FONT_SIZES.display * 1.25),
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TOUCH_TARGET_MIN = 44;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#1A2E24',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#1A2E24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A2E24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export type ScentColorPair = { bg: string; fg: string };

// Evolved scent-tag palette — warmer, dustier, more emotional
export const SCENT_COLORS: Record<string, string> = {
  '플로럴': '#FBDCE8',
  '시트러스': '#FDF1C4',
  '우디': '#EADFCF',
  '머스크': '#EBDFF1',
  '프레시': '#D8EEFC',
  '오리엔탈': '#F8D6C8',
  '아쿠아틱': '#CFEDEF',
  '구르망': '#F6DEB6',
  '스파이시': '#F8C8A8',
  '허벌': '#D9ECCF',
  '파우더리': '#F7DDE6',
  '레더': '#DFCFC1',
  '스모키': '#D8DEDF',
  '그린': '#D4E6C8',
  '푸제르': '#D6E4F5',
  '시프레': '#EAEBC4',
  '발사믹': '#F5D8C2',
  '아이리스': '#DCD0EF',
};

export const SCENT_TEXT_COLORS: Record<string, string> = {
  '플로럴': '#C94277',
  '시트러스': '#CC8500',
  '우디': '#6E4B2E',
  '머스크': '#7A4A9C',
  '프레시': '#1F78B0',
  '오리엔탈': '#B24B22',
  '아쿠아틱': '#036B7C',
  '구르망': '#8C4A1B',
  '스파이시': '#9A2E14',
  '허벌': '#3F7A2C',
  '파우더리': '#A8396A',
  '레더': '#5B3A24',
  '스모키': '#3E5560',
  '그린': '#2F6B35',
  '푸제르': '#1A4A8A',
  '시프레': '#5C7520',
  '발사믹': '#8C3D15',
  '아이리스': '#4A2A8F',
};
