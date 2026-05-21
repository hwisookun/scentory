// 모션 디자인 토큰
// 토스 스타일: 짧고 스냅감 있는 스프링 + 절제된 오버슈트
// 모든 애니메이션은 여기서 import — 컴포넌트에 매직넘버 금지.

export const SPRING = {
  // 기본: 탭/카드 프레스 — 빠르고 안정적
  snappy: { damping: 18, stiffness: 220, mass: 1 },
  // 약간의 튕김: 위시리스트 토글, 성공 피드백
  bouncy: { damping: 14, stiffness: 180, mass: 1 },
  // 부드러운 진입: 시트, 모달
  gentle: { damping: 22, stiffness: 140, mass: 1 },
} as const;

export const TIMING = {
  fast: { duration: 180 },
  base: { duration: 240 },
  slow: { duration: 380 },
} as const;

// expo-haptics ImpactFeedbackStyle / NotificationFeedbackType 매핑
export const HAPTIC = {
  selection: 'selection',
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
} as const;

export type HapticKind = keyof typeof HAPTIC;
